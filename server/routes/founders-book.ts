import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { listTeams, listTeamAgents } from "../services/teamDerivation";
import { encryptField, decryptField, maskField } from "../services/encryptionService";
import * as s3Service from "../services/s3Service";
import { logFounderAction } from "../services/founderAudit";

// Demo helpers intentionally not imported. Per founder mandate 2026-05-04,
// the Founders Book of Business surfaces only real DB data — empty DB renders
// canonical empty states with CTAs (matches Dashboard / Revenue / Growth).

const router = Router();

// Book is founders-only. ADMIN_PLUS = [FOUNDER, OWNER, SYSTEM_ADMIN].
router.use(requireAuth, requireRole(...ADMIN_PLUS));

// Status filter convention — every Book aggregation that touches deals or
// policies excludes terminal-failure statuses. Mirrors the honor-system
// convention shipped on Dashboard / Revenue / Growth so Book numbers
// reconcile against those pages exactly.
// Status filter blacklists. Re-exported below for cross-router reuse so every
// founders surface (Book / Dashboard / Team Performance / etc.) honors the
// same definition of "still in flight" vs "terminal failure".
export const EXCLUDED_DEAL_STATUSES = ['rejected', 'reversed', 'cancelled'];
export const EXCLUDED_POLICY_STATUSES = ['cancelled', 'rescinded', 'declined'];

export function genericError(msg: string) {
  return { error: msg };
}

function safeDecryptLast4(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  try {
    const plain = decryptField(ciphertext);
    return plain.slice(-4);
  } catch {
    return null;
  }
}

function safeDecryptMasked(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  try {
    const plain = decryptField(ciphertext);
    return maskField(plain, 4);
  } catch {
    return null;
  }
}

/**
 * Helper: returns book rollups for a set of agent user ids using the policies
 * table joined through users.assigned_agent_id. Each missing piece returns
 * zero rather than throwing, so the page renders an empty state cleanly.
 *
 * Pass `range` to scope by `policies.created_at` (used by period-aware
 * surfaces like Team Performance). Omit it for full-history rollups.
 *
 * Re-exported so other founders routers can share the canonical logic.
 */
export async function rollupForAgents(
  agentIds: string[],
  range?: { start: string; end: string },
) {
  if (agentIds.length === 0) {
    return {
      clientCount: 0,
      policyCount: 0,
      totalPremium: 0,
      activePolicyCount: 0,
      pendingRenewalCount: 0,
    };
  }

  try {
    const params: any[] = [agentIds, EXCLUDED_POLICY_STATUSES];
    let dateFilter = "";
    if (range) {
      params.push(range.start, range.end);
      dateFilter = ` AND p.created_at >= $3::date AND p.created_at < ($4::date + INTERVAL '1 day')`;
    }
    const result = await pool.query(
      `SELECT
         COUNT(DISTINCT p.user_id)::int AS client_count,
         COUNT(p.id)::int AS policy_count,
         COALESCE(SUM(p.monthly_premium::numeric * 12), 0)::numeric AS total_premium,
         COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS active_policy_count,
         COUNT(p.id) FILTER (WHERE p.status = 'pending_renewal')::int AS pending_renewal_count
       FROM policies p
       JOIN users u ON u.id = p.user_id
       WHERE u.assigned_agent_id = ANY($1::uuid[])
         AND (p.status IS NULL OR NOT (p.status = ANY($2::text[])))${dateFilter}`,
      params,
    );
    const r = result.rows[0] || {};
    return {
      clientCount: Number(r.client_count) || 0,
      policyCount: Number(r.policy_count) || 0,
      totalPremium: Number(r.total_premium) || 0,
      activePolicyCount: Number(r.active_policy_count) || 0,
      pendingRenewalCount: Number(r.pending_renewal_count) || 0,
    };
  } catch {
    return {
      clientCount: 0,
      policyCount: 0,
      totalPremium: 0,
      activePolicyCount: 0,
      pendingRenewalCount: 0,
    };
  }
}

/**
 * Pipeline + revenue rollup for a set of agent user ids over the deals table.
 * `range` scopes by `deals.created_at` for period-aware callers; omit it for
 * full-history pipeline. Re-exported for cross-router reuse.
 */
export async function pipelineForAgents(
  agentIds: string[],
  range?: { start: string; end: string },
) {
  if (agentIds.length === 0) return { pipelineValue: 0, dealCount: 0, revenueInPeriod: 0 };
  try {
    // Pipeline = in-flight deals (any status that isn't a terminal failure).
    // revenueInPeriod = same window but unconditional sum so the page can
    // render gross written premium for the period alongside open pipeline.
    const params: any[] = [agentIds, EXCLUDED_DEAL_STATUSES];
    let dateFilter = "";
    if (range) {
      params.push(range.start, range.end);
      dateFilter = ` AND created_at >= $3::date AND created_at < ($4::date + INTERVAL '1 day')`;
    }
    const r = await pool.query(
      `SELECT
         COALESCE(SUM(annual_premium::numeric) FILTER (WHERE status IS NOT NULL AND NOT (status = ANY($2::text[]))), 0)::numeric AS pipeline_value,
         COUNT(*) FILTER (WHERE status IS NOT NULL AND NOT (status = ANY($2::text[])))::int AS deal_count,
         COALESCE(SUM(annual_premium::numeric), 0)::numeric AS revenue_in_period
       FROM deals
       WHERE agent_user_id = ANY($1::uuid[])${dateFilter}`,
      params,
    );
    return {
      pipelineValue: Number(r.rows[0]?.pipeline_value) || 0,
      dealCount: Number(r.rows[0]?.deal_count) || 0,
      revenueInPeriod: Number(r.rows[0]?.revenue_in_period) || 0,
    };
  } catch {
    return { pipelineValue: 0, dealCount: 0, revenueInPeriod: 0 };
  }
}

/**
 * Per-agent compliance score derived from compliance_flags. Returns a map
 * keyed by agent_user_id with a 0-100 score: 100 minus 25 per open critical
 * flag, minus 10 per open high-severity flag, floored at 0. Closed/resolved
 * flags don't count. Empty input → empty map.
 */
export async function complianceForAgents(
  agentIds: string[],
): Promise<Record<string, number>> {
  if (agentIds.length === 0) return {};
  try {
    const r = await pool.query(
      `SELECT agent_user_id::text AS id,
              COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'open')::int AS critical_open,
              COUNT(*) FILTER (WHERE severity = 'high'     AND status = 'open')::int AS high_open
         FROM compliance_flags
        WHERE agent_user_id = ANY($1::uuid[])
        GROUP BY agent_user_id`,
      [agentIds],
    );
    const out: Record<string, number> = {};
    for (const row of r.rows) {
      const score = 100 - 25 * Number(row.critical_open || 0) - 10 * Number(row.high_open || 0);
      out[row.id] = Math.max(0, score);
    }
    // Agents with no flags default to 100.
    for (const id of agentIds) {
      if (!(id in out)) out[id] = 100;
    }
    return out;
  } catch {
    return {};
  }
}

// GET /teams — list teams with book rollups (real DB only, no demo fallback)
router.get("/teams", async (_req, res) => {
  try {
    const teams = await listTeams();
    const enriched = await Promise.all(
      teams.map(async (team) => {
        const agents = await listTeamAgents(team.id);
        const agentIds = agents.map((a) => a.id);
        const rollup = await rollupForAgents(agentIds);
        const pipeline = await pipelineForAgents(agentIds);
        const avgPolicyValue =
          rollup.policyCount > 0 ? rollup.totalPremium / rollup.policyCount : 0;
        const renewalRate =
          rollup.policyCount > 0
            ? (rollup.activePolicyCount / rollup.policyCount) * 100
            : 0;
        const conversionRate =
          pipeline.dealCount > 0
            ? (rollup.policyCount / pipeline.dealCount) * 100
            : 0;
        let status: "on-track" | "at-risk" | "behind";
        if (rollup.policyCount === 0) {
          status = "on-track";
        } else if (renewalRate >= 90 && conversionRate >= 20) {
          status = "on-track";
        } else if (conversionRate >= 15) {
          status = "at-risk";
        } else {
          status = "behind";
        }
        return {
          ...team,
          clientCount: rollup.clientCount,
          policyCount: rollup.policyCount,
          totalPremium: rollup.totalPremium,
          avgPolicyValue,
          renewalRate,
          conversionRate,
          pipelineValue: pipeline.pipelineValue,
          status,
        };
      }),
    );
    res.json(enriched);
  } catch (e: any) {
    console.error("[founders-book] /teams error:", e?.message);
    res.status(500).json(genericError("Failed to load teams"));
  }
});

// GET /teams/:teamId/agents — agents in team with per-agent rollups (no demo)
router.get("/teams/:teamId/agents", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const agents = await listTeamAgents(teamId);
    const enriched = await Promise.all(
      agents.map(async (agent) => {
        const rollup = await rollupForAgents([agent.id]);
        // Per-agent rollups: real client/policy/premium counts. retention =
        // ratio of active policies to total policies (mirror the page's team
        // renewalRate definition). satisfaction kept null until we wire a
        // real source — frontend renders "—" instead of fabricated 100%.
        const retention =
          rollup.policyCount > 0
            ? Math.round((rollup.activePolicyCount / rollup.policyCount) * 1000) / 10
            : null;
        return {
          ...agent,
          clientCount: rollup.clientCount,
          policyCount: rollup.policyCount,
          totalPremium: rollup.totalPremium,
          retention,
          satisfaction: null,
          status: agent.isActive ? "active" : "on-leave",
        };
      }),
    );
    res.json(enriched);
  } catch (e: any) {
    console.error("[founders-book] /teams/:teamId/agents error:", e?.message);
    res.status(500).json(genericError("Failed to load team agents"));
  }
});

// GET /agents/:agentId/clients?status=&q= — clients for an agent (no demo)
// Counts only count policies that aren't terminally failed.
router.get("/agents/:agentId/clients", async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const status = (req.query.status as string | undefined) || undefined;
    const q = (req.query.q as string | undefined)?.trim() || undefined;

    const params: any[] = [agentId, EXCLUDED_POLICY_STATUSES];
    let where = `u.assigned_agent_id = $1 AND u.role = 'client'`;
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where += ` AND (LOWER(u.first_name) LIKE $${params.length}
                   OR LOWER(u.last_name) LIKE $${params.length}
                   OR LOWER(u.email) LIKE $${params.length})`;
    }

    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
              COUNT(p.id)::int AS policy_count,
              COALESCE(SUM(p.monthly_premium::numeric * 12), 0)::numeric AS total_premium,
              BOOL_OR(p.status = 'active') AS has_active,
              BOOL_OR(p.status = 'pending_renewal') AS has_pending,
              BOOL_OR(p.status = 'lapsed') AS has_lapsed
       FROM users u
       LEFT JOIN policies p ON p.user_id = u.id
                            AND (p.status IS NULL OR NOT (p.status = ANY($2::text[])))
       WHERE ${where}
       GROUP BY u.id
       ORDER BY u.last_name ASC NULLS LAST
       LIMIT 500`,
      params,
    );

    const clients = result.rows.map((r: any) => {
      let derivedStatus: string;
      if (r.has_active) derivedStatus = "active";
      else if (r.has_pending) derivedStatus = "pending_renewal";
      else if (r.has_lapsed) derivedStatus = "lapsed";
      else derivedStatus = r.policy_count > 0 ? "active" : "new";
      return {
        id: r.id,
        firstName: r.first_name || "",
        lastName: r.last_name || "",
        email: r.email || "",
        phone: r.phone || "",
        policyCount: Number(r.policy_count) || 0,
        totalPremium: Number(r.total_premium) || 0,
        status: derivedStatus,
      };
    });

    const filtered = status
      ? clients.filter((c) => c.status === status)
      : clients;
    res.json(filtered);
  } catch (e: any) {
    console.error("[founders-book] /agents/:agentId/clients error:", e?.message);
    res.status(500).json(genericError("Failed to load agent clients"));
  }
});

// GET /clients/:clientId — full client + active policy + beneficiary + sensitive PII (masked)
// No demo fallback — empty DB returns 404 for the clientId, frontend renders empty state.
router.get("/clients/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const userResult = await pool.query(
      `SELECT id, first_name, last_name, email, phone,
              assigned_agent_id, created_at
       FROM users
       WHERE id = $1`,
      [clientId],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    const u = userResult.rows[0];

    // Pull client_profiles (PII). Optional — may not yet exist for legacy clients.
    let profile: any = null;
    try {
      const profileResult = await pool.query(
        `SELECT * FROM client_profiles WHERE user_id = $1 LIMIT 1`,
        [clientId],
      );
      profile = profileResult.rows[0] || null;
    } catch {
      profile = null;
    }

    let policy: any = null;
    try {
      const policyResult = await pool.query(
        `SELECT id, policy_number, type, status, coverage_amount,
                monthly_premium, start_date, next_payment_date,
                effective_date, renewal_date, application_date, issue_date,
                carrier, risk_class, smoker_status, premium_mode,
                beneficiary_name, beneficiary_relationship,
                beneficiary_dob, beneficiary_phone, beneficiary_email,
                beneficiary_ssn_encrypted,
                contingent_beneficiary_name, contingent_beneficiary_relationship,
                contingent_beneficiary_phone, contingent_beneficiary_email,
                riders, agent_notes, last_contact_date
         FROM policies
         WHERE user_id = $1
         ORDER BY (status = 'active') DESC, created_at DESC
         LIMIT 1`,
        [clientId],
      );
      if (policyResult.rows.length > 0) {
        const p = policyResult.rows[0];
        const monthly = Number(p.monthly_premium) || 0;
        policy = {
          id: p.id,
          policyNumber: p.policy_number,
          type: p.type,
          policyType: p.type,
          status: p.status,
          coverageAmount: Number(p.coverage_amount) || 0,
          monthlyPremium: monthly,
          annualPremium: monthly * 12,
          premiumMode: p.premium_mode || "monthly",
          carrier: p.carrier || null,
          riskClass: p.risk_class || null,
          smokerStatus: p.smoker_status || null,
          startDate: p.start_date,
          effectiveDate: p.effective_date || p.start_date,
          renewalDate: p.renewal_date || p.next_payment_date,
          applicationDate: p.application_date || null,
          issueDate: p.issue_date || null,
          nextPaymentDate: p.next_payment_date,
          beneficiaryName: p.beneficiary_name || null,
          beneficiaryRelationship: p.beneficiary_relationship || null,
          beneficiaryDob: p.beneficiary_dob || null,
          beneficiaryPhone: p.beneficiary_phone || null,
          beneficiaryEmail: p.beneficiary_email || null,
          beneficiarySsnMasked: safeDecryptMasked(p.beneficiary_ssn_encrypted),
          contingentBeneficiaryName: p.contingent_beneficiary_name || null,
          contingentBeneficiaryRelationship: p.contingent_beneficiary_relationship || null,
          contingentBeneficiaryPhone: p.contingent_beneficiary_phone || null,
          contingentBeneficiaryEmail: p.contingent_beneficiary_email || null,
          riders: Array.isArray(p.riders) ? p.riders : [],
          agentNotes: p.agent_notes || null,
          lastContactDate: p.last_contact_date || null,
        };
      }
    } catch (err) {
      console.error("policy fetch failed:", err);
      policy = null;
    }

    const ssnLast4 = profile?.ssn_last4 || safeDecryptLast4(profile?.ssn_encrypted);
    const accountLast4 = profile?.account_last4 || safeDecryptLast4(profile?.account_number_encrypted);

    res.json({
      client: {
        id: u.id,
        firstName: u.first_name || "",
        lastName: u.last_name || "",
        email: u.email || "",
        phone: u.phone || "",
        assignedAgentId: u.assigned_agent_id || null,
        createdAt: u.created_at,
        // Profile fields (may be null if no client_profiles row exists)
        dateOfBirth: profile?.date_of_birth || null,
        gender: profile?.gender || null,
        maritalStatus: profile?.marital_status || null,
        occupation: profile?.occupation || null,
        employer: profile?.employer || null,
        annualIncome: profile?.annual_income ? Number(profile.annual_income) : null,
        heightInches: profile?.height_inches || null,
        weightLbs: profile?.weight_lbs || null,
        smokerStatus: profile?.smoker_status || null,
        healthClass: profile?.health_class || null,
        medicalConditions: profile?.medical_conditions || null,
        streetAddress: profile?.street_address || null,
        addressLine2: profile?.address_line2 || null,
        city: profile?.city || null,
        state: profile?.state || null,
        zipCode: profile?.zip_code || null,
        mailingSameAsResidence: profile?.mailing_same_as_residence ?? true,
        mailingStreetAddress: profile?.mailing_street_address || null,
        mailingCity: profile?.mailing_city || null,
        mailingState: profile?.mailing_state || null,
        mailingZipCode: profile?.mailing_zip_code || null,
        emergencyContactName: profile?.emergency_contact_name || null,
        emergencyContactPhone: profile?.emergency_contact_phone || null,
        emergencyContactRelationship: profile?.emergency_contact_relationship || null,
        driversLicenseNumberMasked: safeDecryptMasked(profile?.drivers_license_number_encrypted),
        driversLicenseState: profile?.drivers_license_state || null,
        driversLicenseExpiration: profile?.drivers_license_expiration || null,
        ssnLast4: ssnLast4 || null,
        ssnMasked: ssnLast4 ? `***-**-${ssnLast4}` : null,
        bankName: profile?.bank_name || null,
        bankAccountType: profile?.bank_account_type || null,
        accountLast4: accountLast4 || null,
        routingMasked: profile?.routing_number_encrypted ? "********" : null,
        preferredContactMethod: profile?.preferred_contact_method || null,
        doNotContact: profile?.do_not_contact ?? false,
        agentNotes: profile?.agent_notes || null,
        lastContactDate: profile?.last_contact_date || null,
        nextContactScheduled: profile?.next_contact_scheduled || null,
      },
      policy,
    });
  } catch (e: any) {
    console.error("[founders-book] /clients/:clientId error:", e?.message);
    res.status(500).json(genericError("Failed to load client detail"));
  }
});

// PATCH /clients/:clientId — upsert users + client_profiles + active policy.
// Wave B1: audit-logged via logFounderAction with before/after snapshot of
// non-sensitive field changes. Sensitive fields (SSN/account/routing/DL/
// beneficiarySsn) are recorded only as a "changed: true" bit — never the
// plaintext value — so the audit log stays GLBA-safe.
router.patch("/clients/:clientId", async (req, res) => {
  const clientId = req.params.clientId;
  const body = req.body || {};
  const c = body.client || {};
  const p = body.policy || {};

  const dbClient = await pool.connect();
  try {
    await dbClient.query("BEGIN");

    // 1) users — basic identity fields
    const userFields: string[] = [];
    const userValues: any[] = [];
    let i = 1;
    const setUser = (col: string, v: any) => {
      if (v !== undefined) {
        userFields.push(`${col} = $${i++}`);
        userValues.push(v);
      }
    };
    setUser("first_name", c.firstName);
    setUser("last_name", c.lastName);
    setUser("email", c.email);
    setUser("phone", c.phone);
    if (userFields.length > 0) {
      userValues.push(clientId);
      await dbClient.query(
        `UPDATE users SET ${userFields.join(", ")}, updated_at = NOW() WHERE id = $${i}`,
        userValues,
      );
    }

    // 2) client_profiles — upsert PII fields
    const profileCols: Record<string, any> = {
      date_of_birth: c.dateOfBirth ?? undefined,
      gender: c.gender ?? undefined,
      marital_status: c.maritalStatus ?? undefined,
      occupation: c.occupation ?? undefined,
      employer: c.employer ?? undefined,
      annual_income: c.annualIncome ?? undefined,
      height_inches: c.heightInches ?? undefined,
      weight_lbs: c.weightLbs ?? undefined,
      smoker_status: c.smokerStatus ?? undefined,
      health_class: c.healthClass ?? undefined,
      medical_conditions: c.medicalConditions ?? undefined,
      street_address: c.streetAddress ?? undefined,
      address_line2: c.addressLine2 ?? undefined,
      city: c.city ?? undefined,
      state: c.state ?? undefined,
      zip_code: c.zipCode ?? undefined,
      mailing_same_as_residence: c.mailingSameAsResidence ?? undefined,
      mailing_street_address: c.mailingStreetAddress ?? undefined,
      mailing_city: c.mailingCity ?? undefined,
      mailing_state: c.mailingState ?? undefined,
      mailing_zip_code: c.mailingZipCode ?? undefined,
      bank_name: c.bankName ?? undefined,
      bank_account_type: c.bankAccountType ?? undefined,
      emergency_contact_name: c.emergencyContactName ?? undefined,
      emergency_contact_phone: c.emergencyContactPhone ?? undefined,
      emergency_contact_relationship: c.emergencyContactRelationship ?? undefined,
      drivers_license_state: c.driversLicenseState ?? undefined,
      drivers_license_expiration: c.driversLicenseExpiration ?? undefined,
      preferred_contact_method: c.preferredContactMethod ?? undefined,
      do_not_contact: c.doNotContact ?? undefined,
      agent_notes: c.agentNotes ?? undefined,
      last_contact_date: c.lastContactDate ?? undefined,
      next_contact_scheduled: c.nextContactScheduled ?? undefined,
    };

    // Sensitive fields are encrypted on write. Only set when caller provides plaintext.
    if (typeof c.ssn === "string" && c.ssn.length > 0) {
      const digits = c.ssn.replace(/\D/g, "");
      profileCols.ssn_encrypted = encryptField(digits);
      profileCols.ssn_last4 = digits.slice(-4);
    }
    if (typeof c.accountNumber === "string" && c.accountNumber.length > 0) {
      const acct = c.accountNumber.replace(/\s/g, "");
      profileCols.account_number_encrypted = encryptField(acct);
      profileCols.account_last4 = acct.slice(-4);
    }
    if (typeof c.routingNumber === "string" && c.routingNumber.length > 0) {
      profileCols.routing_number_encrypted = encryptField(c.routingNumber.replace(/\s/g, ""));
    }
    if (typeof c.driversLicenseNumber === "string" && c.driversLicenseNumber.length > 0) {
      profileCols.drivers_license_number_encrypted = encryptField(c.driversLicenseNumber);
    }

    const setCols = Object.entries(profileCols).filter(([_, v]) => v !== undefined);
    if (setCols.length > 0) {
      const insertCols = ["user_id", ...setCols.map(([k]) => k)];
      const insertVals = [clientId, ...setCols.map(([_, v]) => v)];
      const placeholders = insertVals.map((_, idx) => `$${idx + 1}`).join(", ");
      const updateClause = setCols
        .map(([k], idx) => `${k} = $${idx + 2}`)
        .join(", ");
      await dbClient.query(
        `INSERT INTO client_profiles (${insertCols.join(", ")})
         VALUES (${placeholders})
         ON CONFLICT (user_id) DO UPDATE SET
         ${updateClause}, updated_at = NOW()`,
        insertVals,
      );
    }

    // 3) policy — update active policy on file, if any
    const policyCols: Record<string, any> = {
      type: p.type ?? p.policyType ?? undefined,
      status: p.status ?? undefined,
      coverage_amount: p.coverageAmount ?? undefined,
      monthly_premium: p.monthlyPremium ?? undefined,
      premium_mode: p.premiumMode ?? undefined,
      carrier: p.carrier ?? undefined,
      risk_class: p.riskClass ?? undefined,
      smoker_status: p.smokerStatus ?? undefined,
      effective_date: p.effectiveDate ?? undefined,
      renewal_date: p.renewalDate ?? undefined,
      application_date: p.applicationDate ?? undefined,
      issue_date: p.issueDate ?? undefined,
      next_payment_date: p.nextPaymentDate ?? undefined,
      beneficiary_name: p.beneficiaryName ?? undefined,
      beneficiary_relationship: p.beneficiaryRelationship ?? undefined,
      beneficiary_dob: p.beneficiaryDob ?? undefined,
      beneficiary_phone: p.beneficiaryPhone ?? undefined,
      beneficiary_email: p.beneficiaryEmail ?? undefined,
      contingent_beneficiary_name: p.contingentBeneficiaryName ?? undefined,
      contingent_beneficiary_relationship: p.contingentBeneficiaryRelationship ?? undefined,
      contingent_beneficiary_phone: p.contingentBeneficiaryPhone ?? undefined,
      contingent_beneficiary_email: p.contingentBeneficiaryEmail ?? undefined,
      riders: p.riders !== undefined ? JSON.stringify(p.riders) : undefined,
      agent_notes: p.agentNotes ?? undefined,
      last_contact_date: p.lastContactDate ?? undefined,
    };
    if (typeof p.beneficiarySsn === "string" && p.beneficiarySsn.length > 0) {
      policyCols.beneficiary_ssn_encrypted = encryptField(p.beneficiarySsn.replace(/\D/g, ""));
    }

    const policySet = Object.entries(policyCols).filter(([_, v]) => v !== undefined);
    if (policySet.length > 0) {
      // Only update the most recent active policy on file. Skip if none.
      const existing = await dbClient.query(
        `SELECT id FROM policies WHERE user_id = $1
         ORDER BY (status = 'active') DESC, created_at DESC LIMIT 1`,
        [clientId],
      );
      if (existing.rows.length > 0) {
        const policyId = existing.rows[0].id;
        const setSql = policySet.map(([k], idx) => `${k} = $${idx + 1}`).join(", ");
        const setVals = policySet.map(([_, v]) => v);
        setVals.push(policyId);
        await dbClient.query(
          `UPDATE policies SET ${setSql}, updated_at = NOW() WHERE id = $${setVals.length}`,
          setVals,
        );
      }
    }

    await dbClient.query("COMMIT");

    // Audit-log the change. Sensitive fields are recorded only as a
    // "changed: true" bit so the audit log itself never carries plaintext PII.
    try {
      const sensitiveChanged: Record<string, boolean> = {};
      if (typeof c.ssn === "string" && c.ssn.length > 0) sensitiveChanged.ssn = true;
      if (typeof c.accountNumber === "string" && c.accountNumber.length > 0) sensitiveChanged.accountNumber = true;
      if (typeof c.routingNumber === "string" && c.routingNumber.length > 0) sensitiveChanged.routingNumber = true;
      if (typeof c.driversLicenseNumber === "string" && c.driversLicenseNumber.length > 0) sensitiveChanged.driversLicenseNumber = true;
      if (typeof p.beneficiarySsn === "string" && p.beneficiarySsn.length > 0) sensitiveChanged.beneficiarySsn = true;

      // Non-sensitive fields recorded with their before/after values.
      const nonSensitiveBefore = body.before || null;
      const nonSensitiveAfter: Record<string, any> = {};
      const SENSITIVE_KEYS = new Set(["ssn", "accountNumber", "routingNumber", "driversLicenseNumber"]);
      for (const [k, v] of Object.entries(c)) {
        if (v === undefined || v === null) continue;
        if (SENSITIVE_KEYS.has(k)) continue;
        nonSensitiveAfter[`client.${k}`] = v;
      }
      const POLICY_SENSITIVE = new Set(["beneficiarySsn"]);
      for (const [k, v] of Object.entries(p)) {
        if (v === undefined || v === null) continue;
        if (POLICY_SENSITIVE.has(k)) continue;
        nonSensitiveAfter[`policy.${k}`] = v;
      }

      await logFounderAction({
        actorUserId: req.user?.id ?? null,
        action: "book_client_updated",
        entityType: "client",
        entityId: clientId,
        payload: {
          clientId,
          sensitiveChanged,
          fieldsAfter: nonSensitiveAfter,
          before: nonSensitiveBefore,
        },
      });
    } catch (auditErr: any) {
      console.error("[founders-book] audit emit failed (book_client_updated):", auditErr?.message);
    }

    res.json({ ok: true });
  } catch (e: any) {
    await dbClient.query("ROLLBACK").catch(() => {});
    console.error("[founders-book] /clients/:clientId PATCH error:", e?.message);
    res.status(500).json(genericError("Failed to update client"));
  } finally {
    dbClient.release();
  }
});

// =============================================================================
// GET /clients/:clientId/documents — All documents linked to this client's policies
// Founders-only via the router-level requireRole(...ADMIN_PLUS) gate above.
// Joined to policies + uploader so the panel can show "Uploaded by X · Policy Y".
// =============================================================================
router.get("/clients/:clientId/documents", async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `SELECT d.id, d.user_id, d.policy_id, d.name, d.type, d.category,
              d.file_size, d.s3_key, d.uploaded_by, d.uploaded_at,
              p.policy_number AS policy_number,
              p.type AS policy_type,
              uploader.first_name AS uploader_first_name,
              uploader.last_name AS uploader_last_name,
              uploader.email AS uploader_email
       FROM documents d
       LEFT JOIN policies p ON p.id = d.policy_id
       LEFT JOIN users uploader ON uploader.id = d.uploaded_by
       WHERE d.user_id = $1
          OR d.policy_id IN (SELECT id FROM policies WHERE user_id = $1)
       ORDER BY d.uploaded_at DESC`,
      [clientId],
    );

    const documents = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      policyId: row.policy_id,
      name: row.name,
      type: row.type,
      category: row.category,
      fileSize: row.file_size,
      s3Key: row.s3_key,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at,
      policyNumber: row.policy_number,
      policyType: row.policy_type,
      uploader:
        row.uploader_first_name || row.uploader_last_name
          ? {
              firstName: row.uploader_first_name,
              lastName: row.uploader_last_name,
              email: row.uploader_email,
            }
          : null,
    }));

    res.json(documents);
  } catch (e: any) {
    console.error("Founders book client documents error:", e.message);
    res.status(500).json(genericError("Operation failed"));
  }
});

// =============================================================================
// GET /documents/:documentId/url — returns a SAME-ORIGIN proxy URL.
// We no longer return Firebase signed URLs because Firebase download tokens
// don't expire (Sentinel veto, 2026-04-30). The iframe loads /stream, which
// re-validates the founder session on every request.
// =============================================================================
router.get("/documents/:documentId/url", async (req, res) => {
  try {
    const { documentId } = req.params;

    const docResult = await pool.query(
      `SELECT id, s3_key FROM documents WHERE id = $1`,
      [documentId],
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    const doc = docResult.rows[0];
    if (!doc.s3_key) {
      return res
        .status(404)
        .json({ error: "Document has no associated file in storage" });
    }

    res.json({ url: `/api/founders/book/documents/${doc.id}/stream` });
  } catch (e: any) {
    console.error("Founders book document url error:", e.message);
    res.status(500).json(genericError("Operation failed"));
  }
});

// =============================================================================
// GET /documents/:documentId/stream — server-side proxy for founder iframe.
// Founder gate is enforced by router.use(requireAuth, requireRole(ADMIN_PLUS))
// at the top of this file — no extra per-doc ownership check needed for
// admin scope, but session is re-validated on every fetch.
// =============================================================================
router.get("/documents/:documentId/stream", async (req, res) => {
  try {
    const { documentId } = req.params;

    const docResult = await pool.query(
      `SELECT id, s3_key, name, type FROM documents WHERE id = $1`,
      [documentId],
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    const doc = docResult.rows[0];
    if (!doc.s3_key) {
      return res
        .status(404)
        .json({ error: "Document has no associated file in storage" });
    }

    const fetched = await s3Service.getFile(doc.s3_key);
    if (!fetched.success || !fetched.data) {
      return res
        .status(500)
        .json({ error: fetched.error || "Failed to fetch file" });
    }

    const safeName = (doc.name || "document").replace(/[^\w.\-]+/g, "_");
    res.setHeader("Content-Type", doc.type || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(fetched.data);
  } catch (e: any) {
    console.error("Founders book document stream error:", e.message);
    res.status(500).json(genericError("Operation failed"));
  }
});

export default router;
