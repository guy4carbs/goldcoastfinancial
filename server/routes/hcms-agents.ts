import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS, FOUNDERS_ONLY } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { decryptField, isEncrypted } from "../services/encryptionService";
import { storage } from "../storage";
import { sendAgentMessageNotification } from "../gmail";

// Canonical list of agent HCMS routes an admin can link an inbox message to.
// Enforced server-side so admins can't link to pages outside the agent portal.
const VALID_AGENT_ROUTES = new Set<string>([
  "/hcms/my/dashboard",
  "/hcms/my/profile",
  "/hcms/my/documents",
  "/hcms/my/licenses",
  "/hcms/my/eo",
  "/hcms/my/bank",
  "/hcms/my/trainings",
  "/hcms/my/employment",
  "/hcms/my/dba",
  "/hcms/my/questions",
  "/hcms/my/carriers",
  "/hcms/my/hierarchy",
  "/hcms/my/requests",
]);

const router = Router();

const CARRIER_STATUS_COPY: Record<string, { title: (carrier: string) => string; message: (carrier: string, reason?: string) => string }> = {
  approved: {
    title: (c) => `${c} appointment approved`,
    message: (c) =>
      `${c} has approved your contracting request. You're cleared to write business with them in your requested states.`,
  },
  rejected: {
    title: (c) => `${c} appointment rejected`,
    message: (c, reason) =>
      reason
        ? `${c} declined your contracting request: ${reason}. Reach out to an admin to review next steps.`
        : `${c} declined your contracting request. Reach out to an admin to review next steps.`,
  },
  returned: {
    title: (c) => `${c} returned your request`,
    message: (c, reason) =>
      reason
        ? `${c} returned your request with a note: ${reason}. Open the request to see details and resubmit.`
        : `${c} returned your request — open it to see the carrier's notes and resubmit.`,
  },
  awaiting_carrier: {
    title: (c) => `${c} request submitted`,
    message: (c) => `Your ${c} contracting package has been sent to the carrier. Turnaround is typically 5–10 business days.`,
  },
};

function maskField(encrypted: string | null): string | null {
  if (!encrypted) return null;
  try {
    if (isEncrypted(encrypted)) {
      const val = decryptField(encrypted);
      return val.length >= 4 ? "***" + val.slice(-4) : "****";
    }
    return "****";
  } catch { return "****"; }
}

// GET /api/hcms/agents/_debug/agent-profile?email=... — founder-only diagnostic.
// Returns the raw users + agent_profiles row for a given email so we can see
// exactly what's stored (or missing). Use to debug "the application data
// isn't showing in HCMS" claims — tells us whether the row exists, which
// columns are populated, and which S3 keys are NULL (orphaned uploads).
//
// Remove in a follow-up after the application-persistence audit is complete.
router.get("/_debug/agent-profile", requireAuth, requireRole(...FOUNDERS_ONLY), async (req, res) => {
  const rawEmail = String(req.query.email || "").trim().toLowerCase();
  if (!rawEmail) return res.status(400).json({ error: "?email= is required" });
  try {
    const r = await pool.query(
      `SELECT
         u.id::text AS user_id,
         u.email,
         u.first_name,
         u.last_name,
         u.is_active,
         u.onboarding_status,
         ap.id::text AS agent_profile_id,
         ap.approval_status,
         ap.is_licensed,
         ap.license_number,
         ap.npn,
         ap.licensed_states,
         ap.years_experience,
         ap.street_address,
         ap.city,
         ap.state,
         ap.zip_code,
         ap.dba_type,
         ap.company_name,
         ap.dba_name,
         ap.ein,
         ap.bank_name,
         ap.eo_provider,
         ap.eo_policy_number,
         -- Document S3 keys (NULL = orphaned or never uploaded)
         ap.eo_certificate_s3_key,
         ap.drivers_license_s3_key,
         ap.aml_certificate_s3_key,
         ap.direct_deposit_form_s3_key,
         ap.articles_s3_key,
         ap.onboarding_step,
         ap.onboarding_completed_at,
         ap.created_at AS ap_created_at,
         ap.updated_at AS ap_updated_at
       FROM users u
       LEFT JOIN agent_profiles ap ON ap.user_id::text = u.id::text
       WHERE LOWER(u.email) = $1
       LIMIT 1`,
      [rawEmail],
    );
    if (r.rowCount === 0) return res.json({ found: false, email: rawEmail });
    const row = r.rows[0];
    res.json({
      found: true,
      email: rawEmail,
      user_exists: !!row.user_id,
      agent_profile_exists: !!row.agent_profile_id,
      documents: {
        eo_certificate: row.eo_certificate_s3_key,
        drivers_license: row.drivers_license_s3_key,
        aml_certificate: row.aml_certificate_s3_key,
        direct_deposit: row.direct_deposit_form_s3_key,
        articles: row.articles_s3_key,
      },
      uploaded_count: [
        row.eo_certificate_s3_key,
        row.drivers_license_s3_key,
        row.aml_certificate_s3_key,
        row.direct_deposit_form_s3_key,
        row.articles_s3_key,
      ].filter(Boolean).length,
      raw: row,
    });
  } catch (e: any) {
    res.status(500).json({
      error: e?.message,
      code: e?.code,
      detail: e?.detail,
    });
  }
});

// GET /api/hcms/agents/stats — Count agents by approval status
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(ap.approval_status, 'pending_review') as status, COUNT(*)::int as count
      FROM users u
      LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
      WHERE u.role IN ('sales_agent', 'founder', 'agency_manager', 'director')
      GROUP BY COALESCE(ap.approval_status, 'pending_review')
    `);
    const stats = result.rows.reduce((acc: any, r: any) => {
      acc[r.status] = r.count;
      acc.total = (acc.total || 0) + r.count;
      return acc;
    }, {} as any);
    if (!stats.total) stats.total = 0;
    res.json(stats);
  } catch (e: any) {
    console.error("[HCMS Agents Stats]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/hcms/agents/ — List all agents with full contracting data
router.get("/", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { search, status, page = "0", limit = "200" } = req.query;
    let sql = `
      SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.role, u.created_at as joined_at,
             ap.approval_status, ap.npn, ap.dba_type, ap.company_name, ap.state,
             ap.eo_provider, ap.eo_policy_number, ap.eo_effective_date, ap.eo_expiration_date, ap.eo_coverage_amount,
             ap.eo_certificate_s3_key, ap.drivers_license_s3_key, ap.aml_certificate_s3_key, ap.direct_deposit_form_s3_key,
             ap.articles_s3_key,
             ap.bank_name, ap.bank_account_type, ap.routing_number_encrypted, ap.account_number_encrypted,
             ap.years_experience, ap.previous_agency, ap.title,
             ap.ein, ap.company_type, ap.state_of_inc, ap.dba_name, ap.license_type, ap.formation_date,
             ap.business_email, ap.business_phone, ap.business_fax, ap.business_website,
             ap.business_street, ap.business_unit, ap.business_city, ap.business_state, ap.business_zip,
             ap.street_address, ap.city, ap.zip_code, ap.date_of_birth,
             ap.ce_expiration_date, ap.background_answers,
             ap.owners_json, ap.drlp_json, ap.beneficiary_json,
             cc.nda_status, cc.nda_signed_at, cc.debt_rollup_status, cc.debt_rollup_signed_at,
             cc.compliance_status, cc.compliance_signed_at, cc.all_completed
      FROM users u
      LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
      LEFT JOIN contracting_checklists cc ON u.id::text = cc.agent_user_id::text
      WHERE u.role IN ('sales_agent', 'founder', 'agency_manager', 'director')
    `;
    const params: any[] = [];
    if (status && status !== "all") { params.push(status); sql += ` AND ap.approval_status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND (u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`; }
    sql += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), parseInt(page as string) * parseInt(limit as string));

    const result = await pool.query(sql, params);

    const agents = result.rows.map((r: any) => {
      const docsSigned = [r.nda_status, r.debt_rollup_status, r.compliance_status].filter((s: string) => s === "signed").length;
      const docsUploaded = [r.eo_certificate_s3_key, r.drivers_license_s3_key, r.aml_certificate_s3_key, r.direct_deposit_form_s3_key].filter(Boolean).length;
      return {
        userId: r.user_id,
        firstName: r.first_name, lastName: r.last_name,
        email: r.email, phone: r.phone,
        status: r.approval_status || "pending_review",
        npn: r.npn, dbaType: r.dba_type || "individual",
        companyName: r.company_name, state: r.state,
        streetAddress: r.street_address, city: r.city, zipCode: r.zip_code,
        dateOfBirth: r.date_of_birth,
        joinedAt: r.joined_at,
        docsSigned, docsUploaded, docsTotal: docsSigned + docsUploaded,
        allCompleted: r.all_completed || false,
        // E&O
        eoProvider: r.eo_provider, eoPolicyNumber: r.eo_policy_number,
        eoEffectiveDate: r.eo_effective_date, eoExpiration: r.eo_expiration_date,
        eoCoverageAmount: r.eo_coverage_amount, eoCertificateKey: r.eo_certificate_s3_key,
        // Banking
        bankName: r.bank_name, bankAccountType: r.bank_account_type,
        routingLast4: maskField(r.routing_number_encrypted), accountLast4: maskField(r.account_number_encrypted),
        directDepositFormKey: r.direct_deposit_form_s3_key,
        // Employment
        yearsExperience: r.years_experience, previousAgency: r.previous_agency, title: r.title,
        // Documents
        driversLicenseKey: r.drivers_license_s3_key, amlCertificateKey: r.aml_certificate_s3_key,
        articlesKey: r.articles_s3_key,
        // DBA / Business Entity
        ein: r.ein, companyType: r.company_type, stateOfInc: r.state_of_inc,
        dbaName: r.dba_name, licenseType: r.license_type, formationDate: r.formation_date,
        businessEmail: r.business_email, businessPhone: r.business_phone,
        businessStreet: r.business_street, businessCity: r.business_city,
        businessState: r.business_state, businessZip: r.business_zip,
        // Training / Compliance
        ceExpirationDate: r.ce_expiration_date,
        // Checklist detail
        ndaStatus: r.nda_status || "pending", ndaSignedAt: r.nda_signed_at,
        debtRollupStatus: r.debt_rollup_status || "pending", debtRollupSignedAt: r.debt_rollup_signed_at,
        complianceStatus: r.compliance_status || "pending", complianceSignedAt: r.compliance_signed_at,
        // Background
        backgroundAnswers: r.background_answers ? (typeof r.background_answers === "string" ? JSON.parse(r.background_answers) : r.background_answers) : [],
        // Owners
        owners: r.owners_json ? JSON.parse(r.owners_json) : [],
      };
    });

    res.json(agents);
  } catch (e: any) {
    console.error("[HCMS Agents]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/hcms/agents/licenses/all — All agent licenses (bulk)
router.get("/licenses/all", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM agent_licenses al
      JOIN users u ON al.user_id::text = u.id::text
      ORDER BY al.user_id, al.is_resident DESC, al.state_code ASC
    `);
    const grouped: Record<string, any> = {};
    result.rows.forEach((r: any) => {
      const uid = r.user_id;
      if (!grouped[uid]) grouped[uid] = { userId: uid, firstName: r.first_name, lastName: r.last_name, email: r.email, licenses: [] };
      grouped[uid].licenses.push({
        id: r.id, stateCode: r.state_code, licenseNumber: r.license_number, licenseType: r.license_type,
        status: r.status, effectiveDate: r.effective_date, expirationDate: r.expiration_date,
        isResident: r.is_resident, syncSource: r.sync_source,
      });
    });
    res.json(Object.values(grouped));
  } catch (e: any) {
    console.error("[HCMS Agents]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/hcms/agents/requests/all — All contracting requests (bulk)
router.get("/requests/all", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT acr.*, u.first_name, u.last_name, u.email
      FROM agent_contracting_requests acr
      JOIN users u ON acr.agent_user_id::text = u.id::text
      ORDER BY u.last_name, u.first_name, acr.created_at DESC
    `);
    const grouped: Record<string, any> = {};
    result.rows.forEach((r: any) => {
      const uid = r.agent_user_id;
      if (!grouped[uid]) grouped[uid] = { userId: uid, firstName: r.first_name, lastName: r.last_name, email: r.email, requests: [] };
      grouped[uid].requests.push({
        id: r.id, carrier: r.carrier || "Unknown Carrier", states: (r.states || "").split(",").filter(Boolean),
        status: r.status, returnedReason: r.returned_reason, createdAt: r.created_at, updatedAt: r.updated_at,
      });
    });
    res.json(Object.values(grouped));
  } catch (e: any) {
    console.error("[HCMS Agents]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/hcms/agents/:userId — Full agent detail by user ID
router.get("/:userId", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { userId } = req.params;

    // Single JOIN query for all data
    const result = await pool.query(
      `SELECT u.id as uid, u.email, u.first_name, u.last_name, u.phone as user_phone, u.role, u.onboarding_status, u.created_at as user_created,
              ap.*,
              cc.nda_status, cc.nda_signed_at, cc.nda_document_key, cc.debt_rollup_status, cc.debt_rollup_signed_at, cc.debt_rollup_document_key,
              cc.compliance_status, cc.compliance_signed_at, cc.compliance_document_key, cc.all_completed
       FROM users u
       LEFT JOIN agent_profiles ap ON u.id::text = ap.user_id::text
       LEFT JOIN contracting_checklists cc ON u.id::text = cc.agent_user_id::text
       WHERE u.id = $1`,
      [userId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Agent not found" });
    const r = result.rows[0];

    // Get licenses
    const licenses = await pool.query("SELECT * FROM agent_licenses WHERE user_id::text = $1 ORDER BY is_resident DESC, state_code ASC", [userId]);

    // Get contracting requests
    const requests = await pool.query("SELECT * FROM agent_contracting_requests WHERE agent_user_id::text = $1 ORDER BY created_at DESC", [userId]);

    res.json({
      user: {
        id: r.uid, email: r.email, firstName: r.first_name, lastName: r.last_name,
        phone: r.user_phone, role: r.role, onboardingStatus: r.onboarding_status, joinedAt: r.user_created,
      },
      profile: {
        dateOfBirth: r.date_of_birth, streetAddress: r.street_address, city: r.city, state: r.state, zipCode: r.zip_code,
        npn: r.npn, isLicensed: r.is_licensed, licenseNumber: r.license_number, licensedStates: r.licensed_states,
        yearsExperience: r.years_experience, previousAgency: r.previous_agency, companyName: r.company_name, title: r.title,
        eoProvider: r.eo_provider, eoPolicyNumber: r.eo_policy_number, eoEffectiveDate: r.eo_effective_date, eoExpirationDate: r.eo_expiration_date, eoCoverageAmount: r.eo_coverage_amount,
        bankName: r.bank_name, bankAccountType: r.bank_account_type,
        routingLast4: maskField(r.routing_number_encrypted), accountLast4: maskField(r.account_number_encrypted),
        approvalStatus: r.approval_status, approvedBy: r.approved_by, approvedAt: r.approved_at, rejectionReason: r.rejection_reason,
        dbaType: r.dba_type || (r.company_name ? "business_entity" : "individual"),
        ein: r.ein, companyType: r.company_type, stateOfInc: r.state_of_inc, dbaName: r.dba_name,
        licenseType: r.license_type, formationDate: r.formation_date,
        businessEmail: r.business_email, businessPhone: r.business_phone, businessFax: r.business_fax, businessWebsite: r.business_website,
        businessStreet: r.business_street, businessUnit: r.business_unit, businessCity: r.business_city, businessState: r.business_state, businessZip: r.business_zip,
        mailingStreet: r.mailing_street, mailingUnit: r.mailing_unit, mailingCity: r.mailing_city, mailingState: r.mailing_state, mailingZip: r.mailing_zip,
        mailingSameAsBusiness: r.mailing_same_as_business,
        ceExpirationDate: r.ce_expiration_date,
        owners: (() => { const owners = r.owners_json ? JSON.parse(r.owners_json) : []; owners.forEach((o: any) => { if (o.ssn) o.ssn = o.ssn.length >= 4 ? "***-**-" + o.ssn.slice(-4) : "****"; }); return owners; })(),
        drlp: (() => { const drlp = r.drlp_json ? JSON.parse(r.drlp_json) : null; if (drlp?.ssn) drlp.ssn = drlp.ssn.length >= 4 ? "***-**-" + drlp.ssn.slice(-4) : "****"; return drlp; })(),
        beneficiary: (() => { const b = r.beneficiary_json ? JSON.parse(r.beneficiary_json) : null; if (b?.ssn) b.ssn = b.ssn.length >= 4 ? "***-**-" + b.ssn.slice(-4) : "****"; return b; })(),
        articlesKey: r.articles_s3_key,
        eoCertificateKey: r.eo_certificate_s3_key, driversLicenseKey: r.drivers_license_s3_key,
        amlCertificateKey: r.aml_certificate_s3_key, directDepositFormKey: r.direct_deposit_form_s3_key,
        ownerPhotos: r.owner_photos_json || [],
        backgroundAnswers: r.background_answers ? (typeof r.background_answers === "string" ? JSON.parse(r.background_answers) : r.background_answers) : [],
      },
      checklist: {
        ndaStatus: r.nda_status || "pending", ndaSignedAt: r.nda_signed_at, ndaDocumentKey: r.nda_document_key,
        debtRollupStatus: r.debt_rollup_status || "pending", debtRollupSignedAt: r.debt_rollup_signed_at, debtRollupDocumentKey: r.debt_rollup_document_key,
        complianceStatus: r.compliance_status || "pending", complianceSignedAt: r.compliance_signed_at, complianceDocumentKey: r.compliance_document_key,
        allCompleted: r.all_completed || false,
      },
      licenses: licenses.rows.map((l: any) => ({
        id: l.id, stateCode: l.state_code, licenseNumber: l.license_number, licenseType: l.license_type,
        status: l.status, effectiveDate: l.effective_date, expirationDate: l.expiration_date,
        isResident: l.is_resident, syncSource: l.sync_source,
      })),
      requests: requests.rows.map((r: any) => ({
        id: r.id, carrier: r.carrier, states: (r.states || "").split(",").filter(Boolean),
        status: r.status, returnedReason: r.returned_reason, createdAt: r.created_at,
      })),
    });
  } catch (e: any) {
    console.error("[HCMS Agents]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// PUT /api/hcms/agents/:userId/status — Update approval status.
// Wave H1: tightened to ADMIN_PLUS (was MANAGER_PLUS) + audit-logged with
// before/after status snapshot. Approval changes carry compliance weight —
// only founder/owner/system_admin should hold this gate.
router.put("/:userId/status", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ["pending_review", "in_review", "approved", "rejected"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    // Snapshot prior status for the audit log.
    const before = await pool.query(
      `SELECT approval_status, rejection_reason FROM agent_profiles WHERE user_id::text = $1`,
      [req.params.userId],
    );
    const beforeStatus = before.rows[0]?.approval_status || null;

    const updateFields = status === "approved"
      ? "approval_status = $1, approved_at = NOW(), approved_by = $4, rejection_reason = NULL, updated_at = NOW()"
      : "approval_status = $1, rejection_reason = $2, updated_at = NOW()";

    if (status === "approved") {
      await pool.query(`UPDATE agent_profiles SET ${updateFields} WHERE user_id::text = $3`, [status, reason || null, req.params.userId, req.user!.id]);
    } else {
      await pool.query(`UPDATE agent_profiles SET ${updateFields} WHERE user_id::text = $3`, [status, reason || null, req.params.userId]);
    }

    try {
      await logFounderAction({
        actorUserId: req.user?.id ?? null,
        action: "agent_approval_status_changed",
        entityType: "agent_profile",
        entityId: req.params.userId,
        payload: { agentUserId: req.params.userId, before: beforeStatus, after: status, reason: reason || null },
      });
    } catch (auditErr: any) {
      console.error("[HCMS Agents] audit emit failed (status change):", auditErr?.message);
    }

    res.json({ success: true });
  } catch (e: any) {
    console.error("[HCMS Agents] PUT /:userId/status error:", e?.message);
    res.status(500).json({ error: "Failed to update approval status" });
  }
});

// Document type → (table, column, id-column) mapping. Shared by
// /:userId/document/:type (returns proxy URL) and
// /:userId/documents/:type/stream (proxies bytes). Both lookups re-derive
// the key from this map so neither trusts query params.
const HCMS_DOC_COLUMN_MAP: Record<string, { table: string; column: string; idCol: string }> = {
  eo_certificate: { table: "agent_profiles", column: "eo_certificate_s3_key", idCol: "user_id" },
  eo_cert: { table: "agent_profiles", column: "eo_certificate_s3_key", idCol: "user_id" },
  drivers_license: { table: "agent_profiles", column: "drivers_license_s3_key", idCol: "user_id" },
  gov_id: { table: "agent_profiles", column: "drivers_license_s3_key", idCol: "user_id" },
  aml_certificate: { table: "agent_profiles", column: "aml_certificate_s3_key", idCol: "user_id" },
  aml_cert: { table: "agent_profiles", column: "aml_certificate_s3_key", idCol: "user_id" },
  direct_deposit_form: { table: "agent_profiles", column: "direct_deposit_form_s3_key", idCol: "user_id" },
  direct_deposit: { table: "agent_profiles", column: "direct_deposit_form_s3_key", idCol: "user_id" },
  articles: { table: "agent_profiles", column: "articles_s3_key", idCol: "user_id" },
  nda: { table: "contracting_checklists", column: "nda_document_key", idCol: "agent_user_id" },
  debt_rollup: { table: "contracting_checklists", column: "debt_rollup_document_key", idCol: "agent_user_id" },
  compliance: { table: "contracting_checklists", column: "compliance_document_key", idCol: "agent_user_id" },
};

// GET /api/hcms/agents/:userId/document/:type — Admin view of an agent's uploaded document.
// Returns a SAME-ORIGIN proxy URL — Sentinel veto, 2026-04-30: Firebase
// download tokens never expire, so we no longer hand out signed URLs.
router.get("/:userId/document/:type", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { userId, type } = req.params;

    const mapping = HCMS_DOC_COLUMN_MAP[type];
    if (!mapping) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${mapping.column} as doc_key FROM ${mapping.table} WHERE ${mapping.idCol}::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.doc_key;
    if (!key) return res.status(404).json({ error: "Document not found" });

    if (key.startsWith("http")) return res.json({ url: key, key });
    // Inline data: URIs (e.g. server-seeded cursive signature SVGs) are not
    // storage-backed — return them directly so the iframe / signature renderer
    // can use them. Without this, the proxy stream below 404s on getFile().
    if (key.startsWith("data:")) return res.json({ url: null, key, message: "Inline signature — render directly." });

    if (key.includes("/")) {
      try {
        const { isS3Available } = await import("../services/s3Service");
        if (isS3Available()) {
          // Hand back a same-origin proxy URL — actual bytes streamed by
          // /:userId/documents/:type/stream which re-checks admin auth.
          return res.json({
            url: `/api/hcms/agents/${userId}/documents/${type}/stream`,
            key,
          });
        }
      } catch {}
    }

    // For signed agreements with hash keys, regenerate and serve the PDF directly
    if (["nda", "debt_rollup", "compliance"].includes(type)) {
      try {
        const { generateSignedPdf } = await import("../services/documentSigningService");
        const signedAtCol = mapping.column.replace("_document_key", "_signed_at");
        const signerResult = await pool.query(
          `SELECT u.first_name, u.last_name, u.email, cc.${signedAtCol} as signed_at
           FROM users u
           JOIN contracting_checklists cc ON u.id::text = cc.agent_user_id::text
           WHERE u.id::text = $1`,
          [userId]
        );
        const signer = signerResult.rows[0];
        if (signer) {
          const signerInfo = {
            name: `${signer.first_name} ${signer.last_name}`,
            email: signer.email,
            ipAddress: "on-file",
            userAgent: "regenerated",
            signedAt: signer.signed_at ? new Date(signer.signed_at) : new Date(),
          };
          const pdf = await generateSignedPdf(type, signerInfo);
          const safeType = type.replace(/[^\w.\-]+/g, "_");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="${safeType}-signed.pdf"`);
          res.setHeader("Cache-Control", "private, no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          return res.send(pdf);
        }
      } catch (regenErr: any) {
        console.error("[HCMS Agents] PDF regeneration failed:", regenErr.message);
      }
    }

    res.json({ url: null, key, message: "Document on file — preview unavailable" });
  } catch (e: any) {
    console.error("[HCMS Agents]", e.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/hcms/agents/:userId/documents/:type/stream — Server-side proxy for
// admin document viewer. Re-runs admin gate (MANAGER_PLUS) + re-derives the
// S3 key from DB on every request. No external token leaves the server.
// Path is shaped to match the response logger's
// /documents/[^/]+/(url|stream)$ scrubber.
router.get("/:userId/documents/:type/stream", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { userId, type } = req.params;

    const mapping = HCMS_DOC_COLUMN_MAP[type];
    if (!mapping) return res.status(400).json({ error: "Invalid document type" });

    const result = await pool.query(
      `SELECT ${mapping.column} as doc_key FROM ${mapping.table} WHERE ${mapping.idCol}::text = $1`,
      [userId]
    );

    const key = result.rows[0]?.doc_key;
    if (!key) return res.status(404).json({ error: "Document not found" });

    // Legacy URL keys — redirect the iframe (no S3 fetch needed).
    if (key.startsWith("http")) return res.redirect(key);

    if (!key.includes("/")) {
      // Hash-only key — caller should use /:userId/document/:type which
      // handles the regen fallback for nda/debt_rollup/compliance.
      return res.status(404).json({ error: "Document not stored in S3" });
    }

    const { getFile, isS3Available } = await import("../services/s3Service");
    if (!isS3Available()) {
      return res.status(503).json({ error: "Storage not configured" });
    }

    const fetched = await getFile(key);
    if (!fetched.success || !fetched.data) {
      return res.status(404).json({ error: fetched.error || "File not found in storage" });
    }

    const safeType = type.replace(/[^\w.\-]+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeType}.pdf"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(fetched.data);
  } catch (e: any) {
    console.error("[HCMS Agents] document stream error:", e.message);
    res.status(500).json({ error: "Failed to stream document" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/hcms/agents/:userId/requests/:requestId/status
// Admin updates a carrier contracting request status and notifies the agent.
// Allowed status transitions: awaiting_carrier, approved, rejected, returned.
// ─────────────────────────────────────────────────────────────────────────────
// Wave H1: tightened to ADMIN_PLUS + audit-logged with before/after snapshot.
router.patch("/:userId/requests/:requestId/status", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const { status, returnedReason } = req.body || {};
    const allowed = ["awaiting_carrier", "approved", "rejected", "returned"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status — must be awaiting_carrier, approved, rejected, or returned" });
    }
    if (status === "returned" && !returnedReason) {
      return res.status(400).json({ error: "returnedReason is required when status is 'returned'" });
    }

    // Fetch the request + verify ownership (also captures prior status for audit).
    const existing = await pool.query(
      "SELECT id, carrier, status FROM agent_contracting_requests WHERE id::text = $1 AND agent_user_id::text = $2",
      [requestId, userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Request not found for this agent" });
    }
    const carrier = existing.rows[0].carrier;
    const beforeStatus = existing.rows[0].status;

    const reasonToStore = status === "returned" ? String(returnedReason || "").trim() : status === "rejected" ? String(returnedReason || "").trim() || null : null;

    await pool.query(
      "UPDATE agent_contracting_requests SET status = $1, returned_reason = $2, updated_at = NOW() WHERE id::text = $3",
      [status, reasonToStore, requestId]
    );

    try {
      await logFounderAction({
        actorUserId: req.user?.id ?? null,
        action: "carrier_request_status_changed",
        entityType: "agent_contracting_request",
        entityId: requestId,
        payload: { agentUserId: userId, requestId, carrier, before: beforeStatus, after: status, reason: reasonToStore },
      });
    } catch (auditErr: any) {
      console.error("[HCMS Agents] audit emit failed (request status change):", auditErr?.message);
    }

    // Emit notification (soft-fail so status update always succeeds)
    try {
      const copy = CARRIER_STATUS_COPY[status];
      if (copy) {
        await storage.createNotification({
          userId,
          title: copy.title(carrier),
          message: copy.message(carrier, reasonToStore || undefined),
          type: "carrier_update",
          actionUrl: "/hcms/my/carriers",
        });
      }
    } catch (notifErr) {
      console.warn("[HCMS Agents] carrier notif dispatch failed:", notifErr);
    }

    res.json({ ok: true, id: requestId, status, returnedReason: reasonToStore });
  } catch (e: any) {
    console.error("[HCMS Agents] request status update:", e?.message);
    res.status(500).json({ error: "Failed to update request status" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hcms/agents/:userId/notify — Admin-composed direct message.
// Creates an in-app notification scoped to :userId AND dispatches a branded
// email notification to the agent's email on file.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:userId/notify", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, actionUrl } = req.body || {};
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (title.trim().length > 140) {
      return res.status(400).json({ error: "title must be 140 characters or fewer" });
    }
    if (message.trim().length > 1000) {
      return res.status(400).json({ error: "message must be 1000 characters or fewer" });
    }

    // Validate action link against the canonical agent HCMS routes. Empty is OK
    // (treated as "no action link"). Anything outside the list is rejected so
    // admins can't link to /admin/*, external URLs, or mistyped paths.
    let validatedActionUrl: string | null = null;
    if (typeof actionUrl === "string" && actionUrl.trim().length > 0) {
      const candidate = actionUrl.trim();
      if (!VALID_AGENT_ROUTES.has(candidate)) {
        return res.status(400).json({ error: "actionUrl must be one of the approved Agent HCMS routes" });
      }
      validatedActionUrl = candidate;
    }

    // Verify the target user exists + grab their email for the Gmail dispatch
    const targetUser = await pool.query(
      "SELECT id, email, first_name FROM users WHERE id::text = $1",
      [userId]
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const targetEmail: string | null = targetUser.rows[0].email || null;
    const targetFirstName: string = targetUser.rows[0].first_name || "there";

    // 1) Create the in-app notification bound to the target agent's userId
    const notification = await storage.createNotification({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: "admin_message",
      actionUrl: validatedActionUrl,
    });

    // 2) Fire the Gmail email. Soft-fail so email provider issues never block
    //    the in-app notification (which already succeeded above).
    let emailDispatched = false;
    let emailError: string | null = null;
    if (targetEmail) {
      try {
        const portalUrl =
          process.env.AGENT_HCMS_BASE_URL ||
          process.env.APP_BASE_URL ||
          (req.protocol + "://" + req.get("host"));
        await sendAgentMessageNotification({
          firstName: targetFirstName,
          email: targetEmail,
          title: title.trim(),
          actionUrl: validatedActionUrl,
          portalUrl,
        });
        emailDispatched = true;
      } catch (mailErr: any) {
        emailError = mailErr?.message || "email send failed";
        console.warn("[HCMS Agents] admin-message email failed:", emailError);
      }
    } else {
      emailError = "no email on file";
      console.warn(`[HCMS Agents] admin-message email skipped for user ${userId}: no email on file`);
    }

    res.json({
      ok: true,
      notification,
      email: { dispatched: emailDispatched, error: emailError },
    });
  } catch (e: any) {
    console.error("[HCMS Agents] admin notify:", e.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
