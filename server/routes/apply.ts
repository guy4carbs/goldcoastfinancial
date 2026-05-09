import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS } from "../middleware/auth";
import { Roles, isRoleAtLeast } from "../types/permissions";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db";
import { users } from "../../shared/models/auth";

// Role-driven hierarchy placement for invites. EVERY hierarchy role —
// including sales_agent — is override-eligible: any tier can recruit
// downline and earn the waterfall spread on that downline's production.
// Founder/owner are placed at the top; manager/sales_agent at lower tiers.
// Non-hierarchy roles (system_admin, marketing_staff, client, investor)
// are NOT in this map — they don't get an agent_hierarchy row, no upline,
// no contract level. They only need a `users` row stamped with the role.
const INVITE_ROLE_PLACEMENT: Record<
  string,
  { level: number; title: string; overrideEligible: boolean }
> = {
  founder:        { level: 0, title: "Founder",        overrideEligible: true },
  owner:          { level: 0, title: "Owner",          overrideEligible: true },
  director:       { level: 1, title: "Director",       overrideEligible: true },
  agency_manager: { level: 3, title: "Agency Manager", overrideEligible: true },
  manager:        { level: 4, title: "Manager",        overrideEligible: true },
  sales_agent:    { level: 6, title: "Agent",          overrideEligible: true },
};

// Roles that participate in the production hierarchy (need upline + contract).
const HIERARCHY_ROLES = new Set<string>(Object.keys(INVITE_ROLE_PLACEMENT));

// Founder-gated roles. Only an existing founder can invite into these — an
// owner cannot promote peers or superiors via the invite flow.
const FOUNDER_GATED_ROLES = new Set<string>(["founder", "owner"]);

// All roles that can be invited via this endpoint. Hierarchy roles plus
// the four operational/external roles that don't need an upline.
const VALID_INVITE_ROLES = new Set<string>([
  ...Object.keys(INVITE_ROLE_PLACEMENT),
  "system_admin",
  "marketing_staff",
  "client",
  "investor",
]);
import { agentProfiles } from "../../shared/models/agentProfiles";
import { contractingChecklists } from "../../shared/models/contracting";
import { eq } from "drizzle-orm";
import { encryptField } from "../services/encryptionService";
import { generateSignedPdf } from "../services/documentSigningService";
import { uploadFile, validateFile } from "../services/s3Service";
import { sendApplicationInvite } from "../gmail";
import { logFounderAction } from "../services/founderAudit";
import { reinitializeLoungeAccess } from "../services/loungeAccessSync";

const router = Router();

// Helper: find profile by onboarding token
async function findByToken(token: string) {
  // Try onboarding_token first
  let result = await pool.query(
    `SELECT ap.*, u.email as user_email, u.first_name as user_first, u.last_name as user_last, u.phone as user_phone, u.id as uid FROM agent_profiles ap
     JOIN users u ON u.id::text = ap.user_id::text
     WHERE ap.onboarding_token = $1`,
    [token]
  );
  if (result.rows[0]) return result.rows[0];

  // Fallback: check users.invite_token (token may be on user but not yet on profile)
  result = await pool.query(
    `SELECT ap.*, u.email as user_email, u.first_name as user_first, u.last_name as user_last, u.phone as user_phone, u.id as uid FROM users u
     LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
     WHERE u.invite_token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/invite — Admin sends application invite
// ─────────────────────────────────────────────────────────────────────────────
router.post("/invite", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, uplineId, contractLevel, role: rawRole } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "firstName, lastName, and email are required" });
    }

    // Resolve invitee role. Default to sales_agent if missing/invalid.
    const inviteeRole: string = typeof rawRole === "string" && VALID_INVITE_ROLES.has(rawRole)
      ? rawRole
      : "sales_agent";
    const inviterRole = req.user?.role;
    if (!inviterRole) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Founder gate — only an existing founder can invite founder/owner.
    if (FOUNDER_GATED_ROLES.has(inviteeRole) && inviterRole !== Roles.FOUNDER) {
      return res.status(403).json({ error: "Only a founder can invite founder/owner roles" });
    }
    // General authority — inviter must be at least as senior as invitee.
    if (!isRoleAtLeast(inviterRole, inviteeRole as Roles)) {
      return res.status(403).json({ error: "You cannot invite someone at or above your own role" });
    }
    const isHierarchyRole = HIERARCHY_ROLES.has(inviteeRole);
    const placement = isHierarchyRole ? INVITE_ROLE_PLACEMENT[inviteeRole] : null;

    // Validate upline and contract level — only required for hierarchy roles.
    // Non-hierarchy roles (system_admin, marketing_staff, client, investor)
    // ignore any uplineId/contractLevel sent by the client.
    if (isHierarchyRole) {
      if (!uplineId || contractLevel === undefined || contractLevel === null) {
        return res.status(400).json({ error: "Upline and contract level are required for this role" });
      }
      if (contractLevel % 5 !== 0) {
        return res.status(400).json({ error: "Contract level must be in increments of 5%" });
      }
      const uplineResult = await pool.query(
        `SELECT u.id, u.role, COALESCE(ah.contract_level, CASE WHEN u.role = 'owner' THEN 120 ELSE 80 END) as contract_level
         FROM users u LEFT JOIN agent_hierarchy ah ON u.id = ah.agent_user_id AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
         WHERE u.id = $1`, [uplineId]
      );
      if (!uplineResult.rows[0]) return res.status(400).json({ error: "Selected upline not found" });
      const uplineContractLevel = parseFloat(uplineResult.rows[0].contract_level);
      if (contractLevel > uplineContractLevel - 5) {
        return res.status(400).json({ error: `Contract level must be at most ${uplineContractLevel - 5}% (5% below upline's ${uplineContractLevel}%)` });
      }
    }

    // Generate invite token
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create or update skeleton user — demo mode allows reuse
    const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    let userId: string;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await pool.query("UPDATE users SET first_name = $1, last_name = $2, phone = COALESCE($3, phone), role = $4, invite_token = $5, invite_token_expires_at = $6, onboarding_status = 'invited', password_reset_required = true, updated_at = NOW() WHERE id = $7",
        [firstName, lastName, phone || null, inviteeRole, inviteToken, expiresAt, userId]);
      // agent_profiles + contracting_checklists are for production staff only.
      // Skip both for non-hierarchy roles (system_admin, marketing, client, investor).
      if (isHierarchyRole) {
        const ep = await pool.query("SELECT id FROM agent_profiles WHERE user_id::text = $1", [userId]);
        if (ep.rows.length > 0) {
          await pool.query("UPDATE agent_profiles SET onboarding_token = $1, onboarding_token_expires_at = $2, onboarding_step = 0, updated_at = NOW() WHERE user_id::text = $3", [inviteToken, expiresAt, userId]);
        } else {
          await pool.query("INSERT INTO agent_profiles (user_id, approval_status, onboarding_step, onboarding_token, onboarding_token_expires_at) VALUES ($1, $2, $3, $4, $5)", [userId, "pending_review", 0, inviteToken, expiresAt]);
        }
        const ec = await pool.query("SELECT id FROM contracting_checklists WHERE agent_user_id::text = $1", [userId]);
        if (ec.rows.length === 0) await pool.query("INSERT INTO contracting_checklists (agent_user_id) VALUES ($1)", [userId]);
      }
    } else {
      const [user] = await db.insert(users).values({
        email, password: tempPassword, firstName, lastName, phone: phone || null,
        role: inviteeRole, onboardingStatus: "invited", inviteToken, inviteTokenExpiresAt: expiresAt, passwordResetRequired: true,
      }).returning();
      userId = user.id;
      if (isHierarchyRole) {
        await pool.query("INSERT INTO agent_profiles (user_id, approval_status, onboarding_step, onboarding_token, onboarding_token_expires_at) VALUES ($1, $2, $3, $4, $5)", [userId, "pending_review", 0, inviteToken, expiresAt]);
        await pool.query("INSERT INTO contracting_checklists (agent_user_id) VALUES ($1)", [userId]);
      }
    }
    const profile = { id: userId };

    // Sync lounge access for the invitee's role. Without this the user gets
    // a `users` row stamped with the role but ZERO `user_lounge_access` rows,
    // which means they can't access anything in Heritage on first login.
    // `force: true` so a re-invite of an existing user with the same role
    // still re-grants the canonical defaults (wipes any stale grants).
    try {
      await reinitializeLoungeAccess({
        userId,
        newRole: inviteeRole,
        performedByUserId: req.user?.id ?? userId,
        reason: `Invite by ${req.user?.email || "system"} via /api/apply/invite`,
        brand: "both",
        force: true,
      });
    } catch (loungeErr: any) {
      // Non-fatal: the user record + hierarchy still exist. Surface in logs
      // so an admin can re-run /reset-lounge-access if needed.
      console.error("[Apply] Lounge access sync failed:", loungeErr?.message);
    }

    // Create hierarchy placement only for hierarchy roles. Non-hierarchy
    // roles (system_admin, marketing_staff, client, investor) skip this
    // entirely — they don't get an agent_hierarchy row at all.
    if (isHierarchyRole && placement && uplineId && contractLevel !== undefined) {
      const chainResult = await pool.query(
        `SELECT upline_chain, agent_user_id FROM agent_hierarchy WHERE agent_user_id::text = $1 AND (effective_to IS NULL OR effective_to > NOW())`,
        [uplineId]
      );
      const uplineChain = chainResult.rows[0]?.upline_chain || [];
      const newChain = [uplineId, ...uplineChain];

      await pool.query(
        `INSERT INTO agent_hierarchy (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title, upline_chain, contract_level, override_eligible, override_percentage, effective_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW())
         ON CONFLICT DO NOTHING`,
        [userId, uplineId, placement.level, placement.title, JSON.stringify(newChain), contractLevel, placement.overrideEligible]
      );

      try {
        await logFounderAction({
          actorUserId: req.user?.id ?? null,
          action: "hierarchy.create",
          entityType: "agent_hierarchy",
          entityId: userId,
          payload: {
            invitedAgentUserId: userId,
            directUplineId: uplineId,
            hierarchyLevel: placement.level,
            hierarchyTitle: placement.title,
            contractLevel,
            inviteeRole,
            overrideEligible: placement.overrideEligible,
            uplineChain: newChain,
            seededVia: "POST /api/apply/invite",
          },
        });
      } catch (auditErr: any) {
        console.error("[Apply] Audit log failed:", auditErr?.message);
      }
    } else {
      // Audit non-hierarchy invites too — different action so it's filterable.
      try {
        await logFounderAction({
          actorUserId: req.user?.id ?? null,
          action: "user.invite_non_hierarchy",
          entityType: "users",
          entityId: userId,
          payload: {
            invitedUserId: userId,
            inviteeRole,
            isHierarchyRole: false,
            seededVia: "POST /api/apply/invite",
          },
        });
      } catch (auditErr: any) {
        console.error("[Apply] Audit log failed:", auditErr?.message);
      }
    }

    // Build application URL
    const baseUrl = process.env.APP_URL || "https://goldcoastfinancial.co";
    const applicationUrl = `${baseUrl}/apply?token=${inviteToken}`;

    // Send invite email
    let emailSent = false;
    try {
      await sendApplicationInvite({ firstName, lastName, email, applicationUrl });
      emailSent = true;
    } catch (emailErr: any) {
      console.error("[Apply] Email send failed:", emailErr.message);
      // Don't fail the request — return the link so admin can share manually
    }

    console.log(`[Apply] Invite created: userId=${userId}, emailSent=${emailSent}, url=${applicationUrl.replace(inviteToken, '***')}`);
    res.json({ success: true, applicationUrl, userId, profileId: profile.id, emailSent });
  } catch (e: any) {
    console.error("[Apply] Invite error:", e.message);
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/register — Organic user creates skeleton account at Step 1
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const hash = await bcrypt.hash(password, 10);

    // If email exists, reuse existing user — demo mode
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    let userId: string;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await pool.query("UPDATE users SET password = $1, first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name), phone = COALESCE($4, phone), invite_token = $5, invite_token_expires_at = $6, onboarding_status = 'in_progress', updated_at = NOW() WHERE id = $7",
        [hash, firstName || null, lastName || null, phone || null, inviteToken, expiresAt, userId]);
      // Update or create profile
      const existingProfile = await pool.query("SELECT id FROM agent_profiles WHERE user_id::text = $1", [userId]);
      if (existingProfile.rows.length > 0) {
        await pool.query("UPDATE agent_profiles SET onboarding_token = $1, onboarding_token_expires_at = $2, onboarding_step = 1, updated_at = NOW() WHERE user_id::text = $3", [inviteToken, expiresAt, userId]);
      } else {
        await pool.query("INSERT INTO agent_profiles (user_id, approval_status, onboarding_step, onboarding_token, onboarding_token_expires_at) VALUES ($1, $2, $3, $4, $5)", [userId, "pending_review", 1, inviteToken, expiresAt]);
      }
      // Ensure checklist exists
      const existingChecklist = await pool.query("SELECT id FROM contracting_checklists WHERE agent_user_id::text = $1", [userId]);
      if (existingChecklist.rows.length === 0) {
        await pool.query("INSERT INTO contracting_checklists (agent_user_id) VALUES ($1)", [userId]);
      }
      return res.json({ success: true, token: inviteToken, userId });
    }

    const [user] = await db.insert(users).values({
      email,
      password: hash,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      role: "sales_agent",
      onboardingStatus: "in_progress",
      inviteToken,
      inviteTokenExpiresAt: expiresAt,
    }).returning();

    const profileResult = await pool.query(
      `INSERT INTO agent_profiles (user_id, approval_status, onboarding_step, onboarding_token, onboarding_token_expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.id, "pending_review", 1, inviteToken, expiresAt]
    );

    await pool.query("INSERT INTO contracting_checklists (agent_user_id) VALUES ($1)", [user.id]);

    res.json({ success: true, token: inviteToken, userId: user.id, profileId: profileResult.rows[0].id });
  } catch (e: any) {
    console.error("[Apply] Register error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/apply/prefill?token= — Return pre-filled data for resume
// ─────────────────────────────────────────────────────────────────────────────
router.get("/prefill", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });

    const profile = await findByToken(token as string);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    // Get signing status
    const checklist = await pool.query(
      "SELECT nda_status, debt_rollup_status, compliance_status, all_completed FROM contracting_checklists WHERE agent_user_id = $1",
      [profile.uid]
    );

    res.json({
      firstName: profile.user_first || "",
      lastName: profile.user_last || "",
      email: profile.user_email || "",
      phone: profile.user_phone || "",
      npn: profile.npn || "",
      dateOfBirth: profile.date_of_birth || "",
      streetAddress: profile.street_address || "",
      city: profile.city || "",
      state: profile.state || "",
      zipCode: profile.zip_code || "",
      yearsExperience: profile.years_experience || "",
      previousAgency: profile.previous_agency || "",
      isLicensed: profile.is_licensed ? "yes" : "no",
      licenseNumber: profile.license_number || "",
      licensedStates: profile.licensed_states || "",
      companyName: profile.company_name || "",
      title: profile.title || "",
      bankName: profile.bank_name || "",
      bankAccountType: profile.bank_account_type || "",
      eoProvider: profile.eo_provider || "",
      eoPolicyNumber: profile.eo_policy_number || "",
      eoEffectiveDate: profile.eo_effective_date || "",
      eoExpirationDate: profile.eo_expiration_date || "",
      eoCoverageAmount: profile.eo_coverage_amount || "",
      ceExpirationDate: profile.ce_expiration_date || "",
      // Business entity
      dbaType: profile.dba_type || "",
      ein: profile.ein || "",
      companyType: profile.company_type || "",
      stateOfInc: profile.state_of_inc || "",
      dbaName: profile.dba_name || "",
      licenseType: profile.license_type || "",
      formationDate: profile.formation_date || "",
      businessEmail: profile.business_email || "",
      businessPhone: profile.business_phone || "",
      businessFax: profile.business_fax || "",
      businessWebsite: profile.business_website || "",
      businessStreet: profile.business_street || "",
      businessCity: profile.business_city || "",
      businessState: profile.business_state || "",
      businessZip: profile.business_zip || "",
      mailingSameAsBusiness: profile.mailing_same_as_business || false,
      mailingStreet: profile.mailing_street || "",
      mailingCity: profile.mailing_city || "",
      mailingState: profile.mailing_state || "",
      mailingZip: profile.mailing_zip || "",
      owners: profile.owners_json ? JSON.parse(profile.owners_json) : [],
      drlp: profile.drlp_json ? JSON.parse(profile.drlp_json) : null,
      beneficiary: profile.beneficiary_json ? JSON.parse(profile.beneficiary_json) : null,
      articlesKey: profile.articles_s3_key || null,
      // Documents
      eoCertificateKey: profile.eo_certificate_s3_key || null,
      driversLicenseKey: profile.drivers_license_s3_key || null,
      amlCertificateKey: profile.aml_certificate_s3_key || null,
      directDepositFormKey: profile.direct_deposit_form_s3_key || null,
      backgroundAnswers: profile.background_answers ? JSON.parse(profile.background_answers) : [],
      onboardingStep: profile.onboarding_step || 0,
      signing: checklist.rows[0] || { nda_status: "pending", debt_rollup_status: "pending", compliance_status: "pending" },
      uploads: {
        eoCert: !!profile.eo_certificate_s3_key,
        govId: !!profile.drivers_license_s3_key,
        amlCert: !!profile.aml_certificate_s3_key,
        directDeposit: !!profile.direct_deposit_form_s3_key,
      },
      userId: profile.uid,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/save-progress — Save partial form data
// ─────────────────────────────────────────────────────────────────────────────
router.post("/save-progress", async (req, res) => {
  try {
    const { token, step, data } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    const profile = await findByToken(token);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    // Update user table fields (name, phone)
    const userUpdates: Record<string, any> = {};
    if (data.firstName) userUpdates.first_name = data.firstName;
    if (data.lastName) userUpdates.last_name = data.lastName;
    if (data.phone) userUpdates.phone = data.phone;
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date();
      const uKeys = Object.keys(userUpdates);
      const uSets = uKeys.map((k, i) => `${k} = $${i + 1}`).join(", ");
      await pool.query(`UPDATE users SET ${uSets} WHERE id = $${uKeys.length + 1}`, [...uKeys.map(k => userUpdates[k]), profile.uid]);
    }

    // Build agent_profiles update
    const updates: Record<string, any> = { onboarding_step: step, updated_at: new Date() };

    if (data.dateOfBirth) updates.date_of_birth = data.dateOfBirth;
    if (data.ssn) updates.ssn_encrypted = encryptField(data.ssn);
    if (data.streetAddress) updates.street_address = data.streetAddress;
    if (data.city) updates.city = data.city;
    if (data.state) updates.state = data.state;
    if (data.zipCode) updates.zip_code = data.zipCode;
    if (data.npn) updates.npn = data.npn;
    if (data.isLicensed !== undefined) updates.is_licensed = data.isLicensed === "yes";
    if (data.licenseNumber) updates.license_number = data.licenseNumber;
    if (data.licensedStates) updates.licensed_states = Array.isArray(data.licensedStates) ? data.licensedStates.join(",") : data.licensedStates;
    if (data.yearsExperience) updates.years_experience = data.yearsExperience;
    if (data.previousAgency) updates.previous_agency = data.previousAgency;
    if (data.companyName) updates.company_name = data.companyName;
    if (data.title) updates.title = data.title;
    if (data.bankName) updates.bank_name = data.bankName;
    if (data.bankAccountType) updates.bank_account_type = data.bankAccountType;
    if (data.routingNumber) updates.routing_number_encrypted = encryptField(data.routingNumber);
    if (data.accountNumber) updates.account_number_encrypted = encryptField(data.accountNumber);
    if (data.eoProvider) updates.eo_provider = data.eoProvider;
    if (data.eoPolicyNumber) updates.eo_policy_number = data.eoPolicyNumber;
    if (data.eoEffectiveDate) updates.eo_effective_date = data.eoEffectiveDate;
    if (data.eoExpirationDate) updates.eo_expiration_date = data.eoExpirationDate;
    if (data.backgroundAnswers) updates.background_answers = JSON.stringify(data.backgroundAnswers);
    // Business entity fields
    if (data.dbaType) updates.dba_type = data.dbaType;
    if (data.ein) updates.ein = data.ein;
    if (data.companyType) updates.company_type = data.companyType;
    if (data.stateOfInc) updates.state_of_inc = data.stateOfInc;
    if (data.dbaName) updates.dba_name = data.dbaName;
    if (data.licenseType) updates.license_type = data.licenseType;
    if (data.formationDate) updates.formation_date = data.formationDate;
    if (data.businessEmail) updates.business_email = data.businessEmail;
    if (data.businessPhone) updates.business_phone = data.businessPhone;
    if (data.businessFax) updates.business_fax = data.businessFax;
    if (data.businessWebsite) updates.business_website = data.businessWebsite;
    if (data.businessStreet) updates.business_street = data.businessStreet;
    if (data.businessUnit) updates.business_unit = data.businessUnit;
    if (data.businessCity) updates.business_city = data.businessCity;
    if (data.businessState) updates.business_state = data.businessState;
    if (data.businessZip) updates.business_zip = data.businessZip;
    if (data.mailingStreet) updates.mailing_street = data.mailingStreet;
    if (data.mailingUnit) updates.mailing_unit = data.mailingUnit;
    if (data.mailingCity) updates.mailing_city = data.mailingCity;
    if (data.mailingState) updates.mailing_state = data.mailingState;
    if (data.mailingZip) updates.mailing_zip = data.mailingZip;
    if (data.mailingSameAsBusiness !== undefined) updates.mailing_same_as_business = data.mailingSameAsBusiness;
    if (data.eoCoverageAmount) updates.eo_coverage_amount = data.eoCoverageAmount;
    if (data.ceExpirationDate) updates.ce_expiration_date = data.ceExpirationDate;
    // JSON blobs for complex objects
    if (data.owners && Array.isArray(data.owners) && data.owners.length > 0) updates.owners_json = JSON.stringify(data.owners);
    if (data.drlpFirstName) updates.drlp_json = JSON.stringify({
      firstName: data.drlpFirstName, middleName: data.drlpMiddleName || "", lastName: data.drlpLastName,
      dob: data.drlpDob, npn: data.drlpNpn, ssn: data.drlpSsn, email: data.drlpEmail,
      phone: data.drlpPhone, birthCity: data.drlpBirthCity, birthState: data.drlpBirthState,
    });
    if (data.beneficiaryFirstName) updates.beneficiary_json = JSON.stringify({
      firstName: data.beneficiaryFirstName, lastName: data.beneficiaryLastName,
      relationship: data.beneficiaryRelationship, dob: data.beneficiaryDob, ssn: data.beneficiarySsn,
      email: data.beneficiaryEmail, phone: data.beneficiaryPhone,
      street: data.beneficiaryStreet, unit: data.beneficiaryUnit,
      city: data.beneficiaryCity, state: data.beneficiaryState, zip: data.beneficiaryZip,
    });

    // Build SET clause
    const keys = Object.keys(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const vals = keys.map(k => updates[k]);

    console.log(`[Apply] save-progress step=${step}, fields=${keys.filter(k => k !== 'onboarding_step' && k !== 'updated_at').join(',')}`);

    const result = await pool.query(
      `UPDATE agent_profiles SET ${sets} WHERE onboarding_token = $${keys.length + 1}`,
      [...vals, token]
    );

    res.json({ success: true, step });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/sign/:documentType — Sign document via signature pad
// ─────────────────────────────────────────────────────────────────────────────
router.post("/sign/:documentType", async (req, res) => {
  try {
    const { documentType } = req.params;
    const { token, signatureDataUrl } = req.body;

    if (!token || !signatureDataUrl) {
      return res.status(400).json({ error: "Token and signatureDataUrl required" });
    }

    const profile = await findByToken(token);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    const signerInfo = {
      name: `${profile.user_first} ${profile.user_last}`,
      email: profile.user_email,
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      signedAt: new Date(),
    };

    const pdf = await generateSignedPdf(documentType, signerInfo, signatureDataUrl);

    // Upload signed PDF to Firebase Storage
    let documentKey = "";
    const uploadResult = await uploadFile(
      profile.uid, `${documentType}-signed.pdf`, pdf,
      { contentType: "application/pdf", metadata: { documentType, signerEmail: profile.user_email } },
      "signed-documents"
    );
    if (uploadResult.success && uploadResult.key) {
      documentKey = uploadResult.key;
      console.log(`[Apply] Signed PDF stored in Firebase: ${uploadResult.key}`);
    } else {
      // Upload failed — store hash as fallback but log clearly
      documentKey = crypto.createHash("sha256").update(pdf).digest("hex");
      console.warn(`[Apply] Firebase upload failed for ${documentType} (user: ${profile.uid}): ${(uploadResult as any).error || "unknown error"}. Stored hash fallback: ${documentKey}`);
    }

    const col = documentType === "nda" ? "nda" : documentType === "debt_rollup" ? "debt_rollup" : "compliance";
    await pool.query(
      `UPDATE contracting_checklists SET ${col}_status = 'signed', ${col}_signed_at = NOW(), ${col}_document_key = $1, updated_at = NOW() WHERE agent_user_id = $2`,
      [documentKey, profile.uid]
    );
    await pool.query(
      `UPDATE contracting_checklists SET all_completed = (nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed'), completed_at = CASE WHEN nda_status = 'signed' AND debt_rollup_status = 'signed' AND compliance_status = 'signed' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE agent_user_id = $1`,
      [profile.uid]
    );

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/upload — Upload a document to Firebase Storage
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upload", async (req, res) => {
  try {
    const { token, documentType, fileName, fileData, mimeType, fileSize } = req.body;

    if (!token || !documentType || !fileData) {
      return res.status(400).json({ error: "Token, documentType, and fileData required" });
    }

    const profile = await findByToken(token);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    // Validate file
    const validation = validateFile(fileName || "file.pdf", mimeType || "application/pdf", fileSize || 0);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Upload to Firebase Storage
    const buffer = Buffer.from(fileData, "base64");
    const result = await uploadFile(profile.uid, fileName || `${documentType}.pdf`, buffer, {
      contentType: mimeType || "application/pdf",
      metadata: { documentType },
    }, "applications");

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Update profile with S3 key
    const columnMap: Record<string, string> = {
      eo_cert: "eo_certificate_s3_key",
      gov_id: "drivers_license_s3_key",
      aml_cert: "aml_certificate_s3_key",
      direct_deposit: "direct_deposit_form_s3_key",
      articles: "articles_s3_key",
    };

    const column = columnMap[documentType];
    if (column) {
      await pool.query(
        `UPDATE agent_profiles SET ${column} = $1, updated_at = NOW() WHERE onboarding_token = $2`,
        [result.key, token]
      );
    }

    res.json({ success: true, key: result.key, url: result.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/apply/status?token= — Return signing + upload status
// ─────────────────────────────────────────────────────────────────────────────
router.get("/status", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });

    const profile = await findByToken(token as string);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    const checklist = await pool.query(
      "SELECT nda_status, debt_rollup_status, compliance_status, all_completed FROM contracting_checklists WHERE agent_user_id = $1",
      [profile.uid]
    );

    res.json({
      signing: checklist.rows[0] || { nda_status: "pending", debt_rollup_status: "pending", compliance_status: "pending" },
      uploads: {
        eoCert: !!profile.eo_certificate_s3_key,
        govId: !!profile.drivers_license_s3_key,
        amlCert: !!profile.aml_certificate_s3_key,
        directDeposit: !!profile.direct_deposit_form_s3_key,
      },
      onboardingStep: profile.onboarding_step || 0,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/apply/submit — Final submission
// ─────────────────────────────────────────────────────────────────────────────
router.post("/submit", async (req, res) => {
  try {
    const { token, password, agreedToTerms, agreedToPrivacy } = req.body;

    // Organic apply (no token) — create user from scratch
    if (!token) {
      const { email, firstName, lastName, phone } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "email, password, firstName, lastName required" });
      }
      const hash = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({
        email, password: hash, firstName, lastName, phone: phone || null,
        role: "sales_agent", onboardingStatus: "submitted",
      }).returning();
      const profileResult = await pool.query(
        `INSERT INTO agent_profiles (user_id, approval_status, agreed_to_terms, agreed_to_privacy, consented_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
        [user.id, "pending_review", agreedToTerms || false, agreedToPrivacy || false]
      );
      const profile = profileResult.rows[0];
      await pool.query("INSERT INTO contracting_checklists (agent_user_id) VALUES ($1)", [user.id]);
      return res.json({ success: true, profileId: profile.id, userId: user.id });
    }

    // Token-based submit — finalize existing skeleton
    const profile = await findByToken(token);
    if (!profile) return res.status(404).json({ error: "Invalid or expired token" });

    // Set real password
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET password = $1, onboarding_status = 'submitted', password_reset_required = false, updated_at = NOW() WHERE id = $2",
        [hash, profile.uid]
      );
    }

    // Finalize profile
    await pool.query(
      `UPDATE agent_profiles SET
        approval_status = 'pending_review',
        agreed_to_terms = $1,
        agreed_to_privacy = $2,
        consented_at = NOW(),
        onboarding_completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = $3`,
      [agreedToTerms || false, agreedToPrivacy || false, profile.uid]
    );

    // Clear invite token on user
    await pool.query(
      "UPDATE users SET invite_token = NULL, invite_token_expires_at = NULL, updated_at = NOW() WHERE id = $1",
      [profile.uid]
    );

    // Create license records from licensed_states entered during application
    try {
      const profileData = await pool.query("SELECT licensed_states, state, is_licensed FROM agent_profiles WHERE user_id::text = $1", [profile.uid]);
      const ap = profileData.rows[0];
      if (ap?.licensed_states && ap.is_licensed) {
        const states = ap.licensed_states.split(",").filter(Boolean);
        for (const stateCode of states) {
          await pool.query(
            `INSERT INTO agent_licenses (user_id, state_code, license_type, status, is_resident, last_synced_at, sync_source)
             VALUES ($1, $2, 'life_health', 'active', $3, NOW(), 'application')
             ON CONFLICT DO NOTHING`,
            [profile.uid, stateCode.trim(), stateCode.trim() === (ap.state || "")]
          );
        }
        console.log(`[Apply] Created ${states.length} license records for ${profile.uid}`);
      }
    } catch (licErr: any) {
      console.error("[Apply] License creation error:", licErr.message);
    }

    res.json({ success: true, userId: profile.uid });
  } catch (e: any) {
    console.error("[Apply] Submit error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
