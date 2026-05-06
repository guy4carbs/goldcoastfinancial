/**
 * Book of Business API Routes
 * Aggregates client + policy data for the authenticated agent's book of business.
 *
 * Domain: Forge (Backend Systems Engineer)
 * Auth: requireAuth applied per-route (global attachUser populates req.user)
 *
 * Ported from heritage-app branch — adapted for the gcf stack:
 *   - File storage uses Firebase via server/services/s3Service.ts (same interface).
 *   - Commission recording is stubbed (TODO(Ledger)) — no commissionRecordService here yet.
 *   - storage.updatePolicy() does not exist on the gcf storage facade, so policy
 *     updates use raw pool.query against the policies table. This keeps the
 *     route file fully self-contained without forcing a storage interface change.
 */

import crypto from "crypto";
import { Router, type Request, type Response } from "express";
import type { PoolClient } from "pg";
import multer from "multer";
import { pool } from "../db";
import { storage } from "../storage";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import * as s3Service from "../services/s3Service";
import { encryptField } from "../services/encryptionService";
import { logFounderAction } from "../services/founderAudit";

const router = Router();

// Body keys that carry plaintext PII. They are routed into encrypted columns on
// `client_profiles` instead of `policies.client_details::jsonb`. The audit log
// records only a "changed: true" bit for these so plaintext never leaks into
// audit rows.
const SENSITIVE_BODY_KEYS = new Set([
  "ssn",
  "bankAccountNumber",
  "bankRoutingNumber",
  "driversLicenseNumber",
]);

// Encrypts SSN / bank routing / bank account / DL number from a request body and
// upserts them — plus the non-sensitive PII fields agents enter (DOB, address,
// banking metadata, ID metadata, medical notes) — into `client_profiles`. Mirrors
// the founders PATCH upsert at server/routes/founders-book.ts:455-559 so both
// surfaces converge on a single source of truth.
//
// Returns a `sensitiveChanged` map (bit-only) for the audit log.
async function upsertClientProfileFromBody(
  client: PoolClient,
  userId: string,
  body: any,
): Promise<{ sensitiveChanged: Record<string, boolean>; wrote: boolean }> {
  const profileCols: Record<string, any> = {
    date_of_birth: body.dateOfBirth ?? undefined,
    street_address: body.streetAddress ?? undefined,
    city: body.city ?? undefined,
    state: body.state ?? undefined,
    zip_code: body.zipCode ?? undefined,
    bank_name: body.bankName ?? undefined,
    medical_conditions: body.medicalInfo ?? undefined,
    drivers_license_state: body.idState ?? undefined,
    drivers_license_expiration: body.idExpiration ?? undefined,
  };

  const sensitiveChanged: Record<string, boolean> = {};

  if (typeof body.ssn === "string" && body.ssn.length > 0) {
    const digits = body.ssn.replace(/\D/g, "");
    if (digits.length > 0) {
      profileCols.ssn_encrypted = encryptField(digits);
      profileCols.ssn_last4 = digits.slice(-4);
      sensitiveChanged.ssn = true;
    }
  }
  if (typeof body.bankAccountNumber === "string" && body.bankAccountNumber.length > 0) {
    const acct = body.bankAccountNumber.replace(/\s/g, "");
    profileCols.account_number_encrypted = encryptField(acct);
    profileCols.account_last4 = acct.slice(-4);
    sensitiveChanged.accountNumber = true;
  }
  if (typeof body.bankRoutingNumber === "string" && body.bankRoutingNumber.length > 0) {
    profileCols.routing_number_encrypted = encryptField(body.bankRoutingNumber.replace(/\s/g, ""));
    sensitiveChanged.routingNumber = true;
  }
  // The "ID number" the agent UI captures is treated as DL when idType === "drivers_license".
  // Always encrypt — masking on read happens in founders-book.
  if (typeof body.idNumber === "string" && body.idNumber.length > 0 && (body.idType === "drivers_license" || body.idType === undefined)) {
    profileCols.drivers_license_number_encrypted = encryptField(body.idNumber);
    sensitiveChanged.driversLicenseNumber = true;
  }

  const setCols = Object.entries(profileCols).filter(([, v]) => v !== undefined);
  if (setCols.length === 0) {
    return { sensitiveChanged, wrote: false };
  }

  const insertCols = ["user_id", ...setCols.map(([k]) => k)];
  const insertVals = [userId, ...setCols.map(([, v]) => v)];
  const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(", ");
  const updateClause = setCols.map(([k], i) => `${k} = $${i + 2}`).join(", ");

  await client.query(
    `INSERT INTO client_profiles (${insertCols.join(", ")})
     VALUES (${placeholders})
     ON CONFLICT (user_id) DO UPDATE SET
     ${updateClause}, updated_at = NOW()`,
    insertVals,
  );

  return { sensitiveChanged, wrote: true };
}

// Drop all plaintext-PII keys from a clientDetails object — anything in
// SENSITIVE_BODY_KEYS plus the legacy `idNumber` field (now stored encrypted as
// drivers_license_number_encrypted on client_profiles).
function stripSensitiveFromClientDetails(details: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(details)) {
    if (SENSITIVE_BODY_KEYS.has(k)) continue;
    if (k === "idNumber") continue;
    out[k] = v;
  }
  return out;
}

// Build the sanitized payload object we record in the audit log: every body
// key that's not sensitive PII, prefixed with the entity it belongs to.
function buildAuditFieldsAfter(body: any, prefix: string): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (v === undefined || v === null) continue;
    if (SENSITIVE_BODY_KEYS.has(k)) continue;
    if (k === "idNumber") continue;
    out[`${prefix}.${k}`] = v;
  }
  return out;
}

// File upload configuration (memory storage; uploaded buffer streamed to Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB cap matches s3Service MAX_FILE_SIZE
  },
});

// =============================================================================
// COMMISSION STUB
// =============================================================================
// Heritage wires this to commissionRecordService.recordCommissions().
// gcf has commissionWaterfallService.ts but no `recordCommissions` export yet.
// Ledger owns this — leaving as a no-op until that service is ported.
async function recordCommissions(
  _policyId: string,
  _agentId: string,
  _annualPremium: number,
): Promise<void> {
  // TODO(Ledger): wire commission recording. Heritage uses
  // server/services/commissionRecordService.ts which walks the waterfall
  // and inserts commission_ledger rows. Until that lands, this is a no-op.
}

// =============================================================================
// Internal helper: snake_case row → camelCase response shape
// Used by both the agent GET / list and the POST / + PUT /:policyId responses
// so the frontend sees one canonical shape.
// =============================================================================
function rowToBookEntry(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    policyNumber: row.policy_number,
    type: row.type,
    policyType: row.type,
    status: row.status,
    coverageAmount: row.coverage_amount,
    monthlyPremium: parseFloat(row.monthly_premium) || 0,
    startDate: row.start_date,
    policyEffectiveDate: row.start_date,
    nextPaymentDate: row.next_payment_date,
    beneficiaryName: row.beneficiary_name,
    beneficiaryRelationship: row.beneficiary_relationship,
    beneficiaries: row.beneficiaries || [],
    clientStatus: row.client_status || "pending",
    chargebackAt: row.chargeback_at,
    chargebackDate: row.chargeback_at,
    chargebackReason: row.chargeback_reason,
    lastContactDate: row.last_contact_date,
    nextFollowUpDate: row.next_follow_up_date,
    commissionRate: row.commission_rate ? parseFloat(row.commission_rate) : null,
    draftDate: row.draft_date,
    notes: row.notes,
    agentId: row.agent_id,
    leadId: row.lead_id,
    carrier: row.carrier,
    stateCode: row.state_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    addedDate: row.created_at,
    name:
      row.client_first_name && row.client_last_name
        ? `${row.client_first_name} ${row.client_last_name}`
        : "Unknown Client",
    firstName: row.client_first_name,
    lastName: row.client_last_name,
    email: row.client_email,
    phone: row.client_phone,
    avatarUrl: row.client_avatar_url,
    // Spread extended client details (SSN, address, banking, medical, ID)
    ...(row.client_details || {}),
  };
}

// =============================================================================
// GET / — Full book of business for the authenticated agent
// =============================================================================
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user! as AuthenticatedUser;

    const policiesResult = await pool.query(
      `SELECT p.id, p.policy_number, p.type, p.status, p.coverage_amount,
              p.monthly_premium, p.start_date, p.next_payment_date,
              p.beneficiary_name, p.beneficiary_relationship, p.beneficiaries,
              p.client_status, p.chargeback_at, p.chargeback_reason,
              p.last_contact_date, p.next_follow_up_date,
              p.commission_rate, p.draft_date, p.notes,
              p.agent_id, p.lead_id, p.carrier,
              p.client_details, p.state_code,
              p.created_at, p.updated_at, p.user_id,
              u.first_name AS client_first_name,
              u.last_name AS client_last_name,
              u.email AS client_email,
              u.phone AS client_phone,
              u.avatar_url AS client_avatar_url
       FROM policies p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.agent_id = $1
       ORDER BY p.created_at DESC`,
      [user.id],
    );

    const clients = policiesResult.rows.map(rowToBookEntry);

    const active = clients.filter(
      (c: any) => c.clientStatus === "active" || c.status === "active",
    );
    const chargebacks = clients.filter(
      (c: any) => c.clientStatus === "chargeback",
    );
    const totalMonthlyPremium = active.reduce(
      (sum: number, c: any) => sum + (c.monthlyPremium || 0),
      0,
    );

    const stats = {
      totalClients: clients.length,
      activePolicies: active.length,
      totalMonthlyPremium,
      totalAnnualPremium: totalMonthlyPremium * 12,
      chargebackCount: chargebacks.length,
    };

    res.json({ clients, stats });
  } catch (error: any) {
    console.error("[BookOfBusiness] Error fetching book:", error?.message);
    res.status(500).json({ error: "Failed to fetch book of business" });
  }
});

// =============================================================================
// POST / — Add a new client/policy to the book of business
// =============================================================================
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;

    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      streetAddress,
      city,
      state,
      zipCode,
      policyNumber,
      policyType,
      carrier,
      coverageAmount,
      monthlyPremium,
      commissionRate,
      draftDate,
      policyEffectiveDate,
      notes,
      beneficiaries,
      clientStatus,
      ssn,
      idType,
      idNumber,
      idState,
      idExpiration,
      bankName,
      bankRoutingNumber,
      bankAccountNumber,
      medicalInfo,
    } = req.body;

    // Resolve first/last name from either separate fields or combined name
    let resolvedFirstName: string | undefined = firstName;
    let resolvedLastName: string | undefined = lastName;
    if (!resolvedFirstName && name) {
      const parts = String(name).trim().split(/\s+/);
      resolvedFirstName = parts[0] || "Unknown";
      resolvedLastName = parts.slice(1).join(" ") || "Client";
    }

    if (!resolvedFirstName || !policyType || !coverageAmount || !monthlyPremium) {
      return res.status(400).json({
        error:
          "Missing required fields: name (or firstName), policyType, coverageAmount, monthlyPremium",
      });
    }

    // 1. Find or create the client user
    let clientUser: any = null;
    if (email) {
      clientUser = await storage.getUserByEmail(email);
    }

    if (!clientUser) {
      const bcrypt = await import("bcryptjs");
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      clientUser = await storage.createUser({
        email: email || `client-${Date.now()}@placeholder.heritagels.org`,
        password: hashedPassword,
        firstName: resolvedFirstName,
        lastName: resolvedLastName || "Client",
        phone: phone || null,
        role: "client",
        assignedAgentId: agent.id,
      } as any);
    } else {
      await storage.updateUser(clientUser.id, {
        assignedAgentId: agent.id,
        firstName: resolvedFirstName,
        lastName: resolvedLastName || "Client",
        phone: phone || clientUser.phone,
      } as any);
    }

    // 2. Generate policy number
    const generatedPolicyNumber =
      policyNumber ||
      `HLS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    // 3. Create the policy via storage (drizzle insert — requires baseline cols)
    const policy = await storage.createPolicy({
      userId: clientUser.id,
      policyNumber: generatedPolicyNumber,
      type: policyType,
      status: clientStatus === "active" ? "active" : "pending_setup",
      coverageAmount: Number(coverageAmount),
      monthlyPremium: String(monthlyPremium),
      startDate: policyEffectiveDate ? new Date(policyEffectiveDate) : new Date(),
      nextPaymentDate: null,
      beneficiaryName: beneficiaries?.[0]?.name || null,
      beneficiaryRelationship: beneficiaries?.[0]?.relationship || null,
    } as any);

    // 3b. Encrypt PII into client_profiles + write the non-PII extended columns
    // onto the policy. Plaintext SSN / bank routing / bank account / DL never
    // touch the policies row — they live encrypted in client_profiles.
    let sensitiveChanged: Record<string, boolean> = {};
    {
      const dbClient = await pool.connect();
      try {
        await dbClient.query("BEGIN");

        // Encrypted PII upsert into client_profiles.
        const upsertResult = await upsertClientProfileFromBody(dbClient, clientUser.id, req.body);
        sensitiveChanged = upsertResult.sensitiveChanged;

        // Non-sensitive client details (DOB stays as a duplicate for legacy
        // readers; address/banking metadata stays for legacy readers; the
        // sensitive keys are stripped before write).
        const rawDetails: Record<string, any> = {};
        if (dateOfBirth) rawDetails.dateOfBirth = dateOfBirth;
        if (streetAddress) rawDetails.streetAddress = streetAddress;
        if (city) rawDetails.city = city;
        if (state) rawDetails.state = state;
        if (zipCode) rawDetails.zipCode = zipCode;
        if (idType) rawDetails.idType = idType;
        if (idState) rawDetails.idState = idState;
        if (idExpiration) rawDetails.idExpiration = idExpiration;
        if (bankName) rawDetails.bankName = bankName;
        if (medicalInfo) rawDetails.medicalInfo = medicalInfo;
        const clientDetails = stripSensitiveFromClientDetails(rawDetails);

        await dbClient.query(
          `UPDATE policies
           SET agent_id = $1,
               carrier = $2,
               client_status = $3,
               commission_rate = $4,
               draft_date = $5,
               notes = $6,
               beneficiaries = $7::jsonb,
               client_details = $8::jsonb,
               state_code = $9
           WHERE id = $10`,
          [
            agent.id,
            carrier || null,
            clientStatus || "pending",
            commissionRate != null ? String(commissionRate) : null,
            draftDate || null,
            notes || null,
            JSON.stringify(beneficiaries || []),
            JSON.stringify(clientDetails),
            state || null,
            policy.id,
          ],
        );

        await dbClient.query("COMMIT");
      } catch (detailsErr: any) {
        await dbClient.query("ROLLBACK").catch(() => {});
        console.warn("[BoB] Failed to backfill PII + extended policy columns:", detailsErr?.message);
      } finally {
        dbClient.release();
      }
    }

    // Audit-log the agent-side write. Sensitive fields recorded only as a
    // "changed: true" bit so the audit row never holds plaintext PII.
    try {
      await logFounderAction({
        actorUserId: agent.id,
        action: "agent_client_created",
        entityType: "client",
        entityId: clientUser.id,
        payload: {
          policyId: policy.id,
          policyNumber: generatedPolicyNumber,
          sensitiveChanged,
          fieldsAfter: buildAuditFieldsAfter(req.body, "client"),
        },
      });
    } catch (auditErr: any) {
      console.error("[BookOfBusiness] Audit log failed:", auditErr?.message);
    }

    // 4. Record waterfall commissions (currently stubbed)
    const annualPremium = Number(monthlyPremium) * 12;
    if (annualPremium > 0) {
      recordCommissions(policy.id, agent.id, annualPremium).catch((err) =>
        console.error("[BookOfBusiness] Commission recording failed:", err),
      );
    }

    // 5. Notify client
    try {
      await storage.createNotification({
        userId: clientUser.id,
        title: "New Policy Added",
        message: `A new ${policyType} policy (${generatedPolicyNumber}) has been added to your account.`,
        type: "policy_update",
        isRead: false,
        actionUrl: "/client/policies",
      } as any);
    } catch (notifErr) {
      console.error("[BookOfBusiness] Notification delivery failed:", notifErr);
    }

    console.log(
      `[BookOfBusiness] Policy created: ${generatedPolicyNumber} for client ${clientUser.id} by agent ${agent.id}`,
    );

    // Re-read the policy with the join so the response matches GET shape exactly.
    const enrichedResult = await pool.query(
      `SELECT p.*, p.user_id,
              u.first_name AS client_first_name,
              u.last_name AS client_last_name,
              u.email AS client_email,
              u.phone AS client_phone,
              u.avatar_url AS client_avatar_url
       FROM policies p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [policy.id],
    );
    res.status(201).json(rowToBookEntry(enrichedResult.rows[0] || {}));
  } catch (error: any) {
    console.error("[BookOfBusiness] Error creating entry:", error?.message);
    if (error?.code === "23505") {
      return res
        .status(400)
        .json({ error: "A policy with this number already exists" });
    }
    res.status(500).json({ error: "Failed to add client to book of business" });
  }
});

// =============================================================================
// PUT /:policyId — Update policy + extended client details
// =============================================================================
router.put("/:policyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const { policyId } = req.params;

    // Verify policy belongs to this agent
    const existing = await storage.getPolicyById(policyId);
    if (!existing) {
      return res.status(404).json({ error: "Policy not found" });
    }
    if ((existing as any).agentId !== agent.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this policy" });
    }

    // Whitelist of updatable fields, mapped to snake_case columns
    const fieldMap: Record<string, string> = {
      type: "type",
      carrier: "carrier",
      status: "status",
      coverageAmount: "coverage_amount",
      monthlyPremium: "monthly_premium",
      startDate: "start_date",
      nextPaymentDate: "next_payment_date",
      beneficiaryName: "beneficiary_name",
      beneficiaryRelationship: "beneficiary_relationship",
      beneficiaries: "beneficiaries",
      policyNumber: "policy_number",
      clientStatus: "client_status",
      commissionRate: "commission_rate",
      draftDate: "draft_date",
      notes: "notes",
      lastContactDate: "last_contact_date",
      nextFollowUpDate: "next_follow_up_date",
      chargebackAt: "chargeback_at",
      chargebackReason: "chargeback_reason",
    };

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;

    for (const [bodyKey, col] of Object.entries(fieldMap)) {
      const v = req.body[bodyKey];
      if (v === undefined) continue;

      if (
        bodyKey === "startDate" ||
        bodyKey === "nextPaymentDate" ||
        bodyKey === "lastContactDate" ||
        bodyKey === "nextFollowUpDate" ||
        bodyKey === "chargebackAt"
      ) {
        sets.push(`${col} = $${idx++}`);
        vals.push(v ? new Date(v) : null);
      } else if (bodyKey === "coverageAmount") {
        sets.push(`${col} = $${idx++}`);
        vals.push(Number(v));
      } else if (bodyKey === "monthlyPremium" || bodyKey === "commissionRate") {
        sets.push(`${col} = $${idx++}`);
        vals.push(String(v));
      } else if (bodyKey === "beneficiaries") {
        sets.push(`${col} = $${idx++}::jsonb`);
        vals.push(JSON.stringify(Array.isArray(v) ? v : []));
      } else {
        sets.push(`${col} = $${idx++}`);
        vals.push(v);
      }
    }

    // Save extended client details — PII (SSN/routing/account/DL) goes
    // encrypted into client_profiles; the rest stays as legacy JSON for
    // backwards-compat with consumers that read policies.client_details.
    const {
      streetAddress,
      city,
      state,
      zipCode,
      idType,
      idState,
      idExpiration,
      bankName,
      medicalInfo,
      dateOfBirth,
      firstName,
      lastName,
      name,
      email: _email,
      phone,
    } = req.body;

    const rawDetails: Record<string, any> = {};
    if (dateOfBirth) rawDetails.dateOfBirth = dateOfBirth;
    if (streetAddress) rawDetails.streetAddress = streetAddress;
    if (city) rawDetails.city = city;
    if (state) rawDetails.state = state;
    if (zipCode) rawDetails.zipCode = zipCode;
    if (idType) rawDetails.idType = idType;
    if (idState) rawDetails.idState = idState;
    if (idExpiration) rawDetails.idExpiration = idExpiration;
    if (bankName) rawDetails.bankName = bankName;
    if (medicalInfo) rawDetails.medicalInfo = medicalInfo;
    const clientDetails = stripSensitiveFromClientDetails(rawDetails);

    if (Object.keys(clientDetails).length > 0) {
      sets.push(`client_details = COALESCE(client_details, '{}'::jsonb) || $${idx++}::jsonb`);
      vals.push(JSON.stringify(clientDetails));
    }
    if (state) {
      sets.push(`state_code = $${idx++}`);
      vals.push(state);
    }

    if (sets.length === 0 && !req.body.ssn && !req.body.bankAccountNumber && !req.body.bankRoutingNumber && !req.body.idNumber) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Run the PII upsert and the main policy UPDATE in a transaction so
    // partial failures don't leave the two tables out of sync.
    const dbClient = await pool.connect();
    let updatedRow: any;
    let sensitiveChanged: Record<string, boolean> = {};
    try {
      await dbClient.query("BEGIN");
      const upsertResult = await upsertClientProfileFromBody(
        dbClient,
        (existing as any).userId,
        req.body,
      );
      sensitiveChanged = upsertResult.sensitiveChanged;

      if (sets.length > 0) {
        sets.push(`updated_at = NOW()`);
        vals.push(policyId);
        const updateSql = `UPDATE policies SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`;
        const updateResult = await dbClient.query(updateSql, vals);
        updatedRow = updateResult.rows[0];
      } else {
        // PII-only update: re-fetch the row so the response shape matches.
        const fetched = await dbClient.query(`SELECT * FROM policies WHERE id = $1`, [policyId]);
        updatedRow = fetched.rows[0];
      }
      await dbClient.query("COMMIT");
    } catch (txErr: any) {
      await dbClient.query("ROLLBACK").catch(() => {});
      console.error("[BookOfBusiness] PUT transaction failed:", txErr?.message);
      dbClient.release();
      return res.status(500).json({ error: "Failed to update policy" });
    } finally {
      dbClient.release();
    }

    // Status side-effect: chargeback clears + active re-set
    if (req.body.clientStatus === "active") {
      await pool.query(
        `UPDATE policies SET chargeback_at = NULL, chargeback_reason = NULL, status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [policyId],
      );
    }

    // Recalculate commissions if premium changed
    if (req.body.monthlyPremium != null) {
      const annualPremium = Number(req.body.monthlyPremium) * 12;
      if (annualPremium > 0) {
        recordCommissions(policyId, agent.id, annualPremium).catch((err) =>
          console.error("[BookOfBusiness] Commission recalc failed:", err),
        );
      }
    }

    // Update client user name/phone if provided
    if ((firstName || name) && (existing as any).userId) {
      try {
        const resolvedFirst =
          firstName || (name ? String(name).split(" ")[0] : null);
        const resolvedLast =
          lastName ||
          (name ? String(name).split(" ").slice(1).join(" ") : null);
        if (resolvedFirst) {
          await storage.updateUser((existing as any).userId, {
            firstName: resolvedFirst,
            lastName: resolvedLast || "Client",
            phone: phone || undefined,
          } as any);
        }
      } catch {
        /* non-fatal */
      }
    }

    console.log(
      `[BookOfBusiness] Policy updated: ${policyId} by agent ${agent.id}`,
    );

    // Audit-log the agent-side write. Sensitive fields recorded only as a
    // "changed: true" bit so the audit row never holds plaintext PII.
    try {
      await logFounderAction({
        actorUserId: agent.id,
        action: "agent_client_policy_updated",
        entityType: "policy",
        entityId: policyId,
        payload: {
          policyId,
          clientId: (existing as any).userId,
          sensitiveChanged,
          fieldsAfter: buildAuditFieldsAfter(req.body, "policy"),
        },
      });
    } catch (auditErr: any) {
      console.error("[BookOfBusiness] Audit log failed:", auditErr?.message);
    }

    res.json(updatedRow);
  } catch (error: any) {
    console.error("[BookOfBusiness] Error updating policy:", error?.message);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// =============================================================================
// POST /:clientId/documents — Upload a document for a client (multer + Firebase)
// =============================================================================
router.post(
  "/:clientId/documents",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const agent = req.user! as AuthenticatedUser;
      const { clientId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { name, category, policyId } = req.body;
      if (!name || !category) {
        return res
          .status(400)
          .json({ error: "Missing required fields: name, category" });
      }

      // Authorization: the agent must own a policy for this client
      const ownership = await pool.query(
        `SELECT 1 FROM policies WHERE user_id = $1 AND agent_id = $2 LIMIT 1`,
        [clientId, agent.id],
      );
      if (ownership.rows.length === 0) {
        return res.status(403).json({
          error: "You do not have a policy on file for this client",
        });
      }

      const validation = s3Service.validateFile(
        file.originalname,
        file.mimetype,
        file.size,
      );
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const uploadResult = await s3Service.uploadFile(
        clientId,
        file.originalname,
        file.buffer,
        {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: agent.id,
            category,
            clientId,
          },
        },
        "client-documents",
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          error: uploadResult.error || "Failed to upload file to storage",
        });
      }

      // Insert document via raw SQL — s3_key + uploaded_by are not in Drizzle schema yet.
      const docResult = await pool.query(
        `INSERT INTO documents (user_id, policy_id, name, type, category, file_size, s3_key, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          clientId,
          policyId || null,
          name,
          file.mimetype,
          category,
          String(file.size),
          uploadResult.key || null,
          agent.id,
        ],
      );
      const document = docResult.rows[0];

      try {
        await storage.createNotification({
          userId: clientId,
          title: "New Document Available",
          message: `A new document "${name}" has been added to your account.`,
          type: "document_upload",
          isRead: false,
          actionUrl: "/client/documents",
        } as any);
      } catch (notifErr) {
        console.error("[BookOfBusiness] Notification delivery failed:", notifErr);
      }

      console.log(
        `[BookOfBusiness] Document uploaded: ${document.id} for client ${clientId} by agent ${agent.id}`,
      );

      try {
        await logFounderAction({
          actorUserId: agent.id,
          action: "agent_client_document_uploaded",
          entityType: "document",
          entityId: document.id,
          payload: {
            clientId,
            policyId: policyId || null,
            name,
            category,
            type: file.mimetype,
            fileSize: file.size,
            s3Key: uploadResult.key || null,
          },
        });
      } catch (auditErr: any) {
        console.error("[BookOfBusiness] Audit log failed:", auditErr?.message);
      }

      res
        .status(201)
        .json({ ...document, url: uploadResult.url || document.s3_key });
    } catch (error: any) {
      console.error("[BookOfBusiness] Failed to upload document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  },
);

// =============================================================================
// GET /:clientId/documents — List documents the agent has uploaded for this client
// =============================================================================
router.get(
  "/:clientId/documents",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const agent = req.user! as AuthenticatedUser;
      const { clientId } = req.params;

      // Authorization: agent must have at least one policy for this client
      const ownership = await pool.query(
        `SELECT 1 FROM policies WHERE user_id = $1 AND agent_id = $2 LIMIT 1`,
        [clientId, agent.id],
      );
      if (ownership.rows.length === 0) {
        return res.status(403).json({
          error: "You do not have a policy on file for this client",
        });
      }

      const result = await pool.query(
        `SELECT id, user_id, policy_id, name, type, category, file_size,
                s3_key, uploaded_by, uploaded_at
         FROM documents
         WHERE user_id = $1
         ORDER BY uploaded_at DESC`,
        [clientId],
      );

      res.json(result.rows);
    } catch (error: any) {
      console.error(
        "[BookOfBusiness] Error fetching documents:",
        error?.message,
      );
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  },
);

// =============================================================================
// Internal helper — resolves the document row IF the requester is authorized.
// Returns null + writes the response on failure so callers can early-return.
// =============================================================================
async function resolveAuthorizedDoc(
  agent: AuthenticatedUser,
  documentId: string,
  res: Response,
): Promise<{ id: string; s3_key: string; name: string; type: string } | null> {
  const docResult = await pool.query(
    `SELECT d.id, d.s3_key, d.user_id, d.uploaded_by, d.name, d.type
     FROM documents d
     WHERE d.id = $1`,
    [documentId],
  );
  if (docResult.rows.length === 0) {
    res.status(404).json({ error: "Document not found" });
    return null;
  }
  const doc = docResult.rows[0];

  if (doc.uploaded_by !== agent.id) {
    const ownership = await pool.query(
      `SELECT 1 FROM policies WHERE user_id = $1 AND agent_id = $2 LIMIT 1`,
      [doc.user_id, agent.id],
    );
    if (ownership.rows.length === 0) {
      res.status(403).json({ error: "Not authorized" });
      return null;
    }
  }

  if (!doc.s3_key) {
    res
      .status(404)
      .json({ error: "Document has no associated file in storage" });
    return null;
  }

  return doc;
}

// =============================================================================
// GET /documents/:documentId/url — returns a SAME-ORIGIN proxy URL.
// We no longer hand out Firebase signed URLs because Firebase download tokens
// don't expire (Sentinel veto, 2026-04-30). The iframe loads the /stream
// endpoint, which re-checks auth + ownership on every request.
// =============================================================================
router.get(
  "/documents/:documentId/url",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const agent = req.user! as AuthenticatedUser;
      const { documentId } = req.params;

      const doc = await resolveAuthorizedDoc(agent, documentId, res);
      if (!doc) return;

      res.json({ url: `/api/book-of-business/documents/${doc.id}/stream` });
    } catch (error: any) {
      console.error(
        "[BookOfBusiness] Failed to get document URL:",
        error?.message,
      );
      res.status(500).json({ error: "Failed to get document URL" });
    }
  },
);

// =============================================================================
// GET /documents/:documentId/stream — server-side proxy of the file bytes.
// Re-auths + re-checks ownership on every fetch. No external token leaves
// the server; the iframe relies on the session cookie for authorization.
// =============================================================================
router.get(
  "/documents/:documentId/stream",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const agent = req.user! as AuthenticatedUser;
      const { documentId } = req.params;

      const doc = await resolveAuthorizedDoc(agent, documentId, res);
      if (!doc) return;

      const fetched = await s3Service.getFile(doc.s3_key);
      if (!fetched.success || !fetched.data) {
        return res
          .status(500)
          .json({ error: fetched.error || "Failed to fetch file" });
      }

      const safeName = (doc.name || "document").replace(/[^\w.\-]+/g, "_");
      res.setHeader(
        "Content-Type",
        doc.type || "application/octet-stream",
      );
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${safeName}"`,
      );
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(fetched.data);
    } catch (error: any) {
      console.error(
        "[BookOfBusiness] Failed to stream document:",
        error?.message,
      );
      res.status(500).json({ error: "Failed to stream document" });
    }
  },
);

export default router;
