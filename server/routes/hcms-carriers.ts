import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, MANAGER_PLUS, ADMIN_PLUS } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { resolveAgentAgency, ROOT_AGENCY_ID } from "../services/agencyResolver";
import {
  DEMO_FALLBACK_ENABLED,
  demoAgencyCarrierContracts,
} from "../services/foundersDemoData";

const router = Router();
router.get("/directory", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT * FROM carrier_directory WHERE is_active = true`;
    const p: any[] = [];
    if (search) { p.push(`%${search}%`); sql += ` AND (name ILIKE $1 OR short_name ILIKE $1 OR code ILIKE $1)`; }
    sql += ` ORDER BY name ASC`;
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.get("/appointments", requireAuth, requireRole(...MANAGER_PLUS), async (req, res) => {
  try {
    const { agentId, status } = req.query;
    let sql = `SELECT ca.*, cd.name as carrier_name, u.first_name, u.last_name FROM carrier_appointments ca LEFT JOIN carrier_directory cd ON cd.id = ca.carrier_id LEFT JOIN users u ON u.id = ca.agent_user_id WHERE 1=1`;
    const p: any[] = [];
    if (agentId) { p.push(agentId); sql += ` AND ca.agent_user_id = $${p.length}`; }
    if (status) { p.push(status); sql += ` AND ca.status = $${p.length}`; }
    res.json((await pool.query(sql, p)).rows);
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});
router.get("/stats", requireAuth, requireRole(...MANAGER_PLUS), async (_req, res) => {
  try {
    const carriers = await pool.query(`SELECT COUNT(*)::int as c FROM carrier_directory WHERE is_active = true`);
    const appts = await pool.query(`SELECT status, COUNT(*)::int as c FROM carrier_appointments GROUP BY status`);
    res.json({ totalCarriers: carriers.rows[0]?.c || 0, byStatus: appts.rows.reduce((a: any, r: any) => ({...a, [r.status]: r.c}), {}) });
  } catch (e: any) { console.error("[HCMS]", e.message); res.status(500).json({ error: "Something went wrong" }); }
});

// ─── POST /appointments — bulk-create appointment rows for one (agent, carrier)
// Used by the hierarchy drawer's "Appoint agent" inline action when the agency
// holds an MPA but the agent has no carrier_appointments row yet. Creates one
// row per state in `stateCodes` and skips any (agent, carrier, state) that
// already exists.
const CreateAppointmentsSchema = z.object({
  agentUserId: z.string().uuid(),
  carrierId: z.string().min(1).max(64),
  stateCodes: z.array(z.string().length(2)).min(1).max(60),
  status: z
    .enum([
      "pending",
      "approved",
      "appointed",
      "terminated",
      "awaiting_carrier",
      "returned",
      "rejected",
      "pending_review",
      "in_review",
    ])
    .optional()
    .default("appointed"),
  writingNumber: z.string().max(100).optional(),
  commissionLevel: z.number().min(60).max(160).optional(),
});
router.post(
  "/appointments",
  requireAuth,
  requireRole(...ADMIN_PLUS),
  async (req, res) => {
    const parsed = CreateAppointmentsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid body" });
    }
    const { agentUserId, carrierId, stateCodes, status, writingNumber, commissionLevel } = parsed.data;
    try {
      // Idempotent: skip duplicates via WHERE NOT EXISTS subquery on
      // (agent_user_id, carrier_id, state_code).
      const inserted: any[] = [];
      for (const state of stateCodes) {
        const r = await pool.query(
          `INSERT INTO carrier_appointments
              (agent_user_id, carrier_id, state_code, status, writing_number, commission_level, created_by)
           SELECT $1::uuid, $2, $3, $4, $5, $6, $7::uuid
            WHERE NOT EXISTS (
              SELECT 1 FROM carrier_appointments
               WHERE agent_user_id::text = $1 AND carrier_id::text = $2 AND state_code = $3
            )
           RETURNING *`,
          [
            agentUserId,
            carrierId,
            state.toUpperCase(),
            status,
            writingNumber || null,
            commissionLevel ?? null,
            req.user?.id ?? null,
          ],
        );
        if (r.rows[0]) inserted.push(r.rows[0]);
      }

      try {
        await logFounderAction({
          actorUserId: req.user?.id ?? null,
          action: "carrier_appointments_created",
          entityType: "carrier_appointment",
          entityId: null,
          payload: { agentUserId, carrierId, stateCodes, count: inserted.length },
        });
      } catch (auditErr: any) {
        console.error(
          "[HCMS] audit emit failed (carrier_appointments_created):",
          auditErr?.message,
        );
      }

      res.json({ success: true, created: inserted.length, appointments: inserted });
    } catch (e: any) {
      console.error("[HCMS] /appointments POST error:", e?.message);
      res.status(500).json({ error: "Failed to create appointments" });
    }
  },
);

// ─── PATCH /appointments/:appointmentId ──────────────────────────────────
// Edit a single carrier_appointment row. ADMIN_PLUS only.
const UpdateAppointmentSchema = z
  .object({
    writingNumber: z.string().max(100).optional(),
    status: z
      .enum([
        "pending",
        "approved",
        "appointed",
        "terminated",
        "awaiting_carrier",
        "returned",
        "rejected",
        "pending_review",
        "in_review",
      ])
      .optional(),
    commissionLevel: z.number().min(60).max(160).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.patch(
  "/appointments/:appointmentId",
  requireAuth,
  requireRole(...ADMIN_PLUS),
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId || !UUID_RE.test(appointmentId)) {
        return res.status(400).json({ error: "INVALID_APPOINTMENT_ID" });
      }

      const parsed = UpdateAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });
      }
      const body = parsed.data;

      // Load current row for "before" snapshot + 404 check
      const cur = await pool.query(
        `SELECT id, agent_user_id, carrier_id, writing_number, status, commission_level, notes
           FROM carrier_appointments WHERE id = $1`,
        [appointmentId],
      );
      if (cur.rowCount === 0) {
        return res.status(404).json({ error: "APPOINTMENT_NOT_FOUND" });
      }
      const before = cur.rows[0];

      // Build dynamic UPDATE only for fields actually passed
      const sets: string[] = [];
      const params: any[] = [];
      if (body.writingNumber !== undefined) {
        params.push(body.writingNumber);
        sets.push(`writing_number = $${params.length}`);
      }
      if (body.status !== undefined) {
        params.push(body.status);
        sets.push(`status = $${params.length}`);
      }
      if (body.commissionLevel !== undefined) {
        params.push(body.commissionLevel);
        sets.push(`commission_level = $${params.length}`);
      }
      if (body.notes !== undefined) {
        params.push(body.notes);
        sets.push(`notes = $${params.length}`);
      }
      sets.push(`updated_at = NOW()`);

      params.push(appointmentId);
      const updateSql = `UPDATE carrier_appointments SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`;
      const updated = await pool.query(updateSql, params);
      const after = updated.rows[0];

      // Audit (non-blocking — mutation already committed)
      try {
        await logFounderAction({
          actorUserId: req.user?.id ?? null,
          action: "carrier_appointment_updated",
          entityType: "carrier_appointment",
          entityId: appointmentId,
          payload: {
            appointmentId,
            agentUserId: before.agent_user_id,
            carrierId: before.carrier_id,
            before: {
              writing_number: before.writing_number,
              status: before.status,
              commission_level: before.commission_level,
              notes: before.notes,
            },
            after: {
              writing_number: after.writing_number,
              status: after.status,
              commission_level: after.commission_level,
              notes: after.notes,
            },
          },
        });
      } catch (auditErr: any) {
        console.error("[HCMS] audit emit failed (carrier_appointment_updated):", auditErr?.message);
      }

      res.json({ success: true, appointment: after });
    } catch (e: any) {
      console.error("[HCMS]", e.message);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

// ─── PATCH /appointments/by-carrier/:agentUserId/:carrierId ──────────────
// Broadcast a writing # to ALL of an agent's appointments with one carrier.
const BroadcastWritingNumberSchema = z.object({
  writingNumber: z.string().min(1).max(100),
});

router.patch(
  "/appointments/by-carrier/:agentUserId/:carrierId",
  requireAuth,
  requireRole(...ADMIN_PLUS),
  async (req, res) => {
    try {
      const { agentUserId, carrierId } = req.params;
      if (!agentUserId || !UUID_RE.test(agentUserId)) {
        return res.status(400).json({ error: "INVALID_AGENT_USER_ID" });
      }
      // carrier_id is a varchar in DB (carrier_directory.id), not strictly UUID-typed.
      // Accept any non-empty string up to 64 chars; agent_user_id stays strict UUID.
      const carrierIdSchema = z.string().min(1).max(64);
      const carrierIdParse = carrierIdSchema.safeParse(carrierId);
      if (!carrierIdParse.success) {
        return res.status(400).json({ error: "INVALID_CARRIER_ID" });
      }

      const parsed = BroadcastWritingNumberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });
      }
      const { writingNumber } = parsed.data;

      const result = await pool.query(
        `UPDATE carrier_appointments
            SET writing_number = $1, updated_at = NOW()
          WHERE agent_user_id = $2 AND carrier_id = $3
          RETURNING id`,
        [writingNumber, agentUserId, carrierId],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "NO_APPOINTMENTS_FOUND" });
      }

      const appointmentIds = result.rows.map((r: any) => r.id);

      try {
        await logFounderAction({
          actorUserId: req.user?.id ?? null,
          action: "carrier_appointment_writing_number_broadcast",
          entityType: "carrier_appointment",
          entityId: null,
          payload: {
            agentUserId,
            carrierId,
            appointmentIds,
            writingNumber,
          },
        });
      } catch (auditErr: any) {
        console.error(
          "[HCMS] audit emit failed (carrier_appointment_writing_number_broadcast):",
          auditErr?.message,
        );
      }

      res.json({ success: true, updated: result.rowCount, appointmentIds });
    } catch (e: any) {
      console.error("[HCMS]", e.message);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

// ─── GET /agency-roster?agentId=:agentUserId ─────────────────────────────────
// Returns the universe of carriers for an agent's drawer:
//   1. Every ACTIVE agency_carrier_contracts row for the agent's agency joined
//      with carrier_directory metadata. (Mirrors GET /api/founders/agencies/:id/
//      carriers and /api/agent-portal/carriers/available — single source of
//      truth for "what carriers can this agent be appointed with".)
//   2. PLUS the agent's per-carrier appointments (carrier_appointments) attached
//      to each agency-contracted carrier as `appointments[]`.
//   3. PLUS pending agent_contracting_requests for carriers NOT yet under an
//      agency contract — surfaced as carriers with `source: "request"` so the
//      drawer reflects everything visible on the HCMS Carriers tab.
//   4. When the agent's agency resolves to ROOT and no real contracts exist,
//      injects the demo fallback (matches /api/founders/agencies/:id/carriers).
router.get(
  "/agency-roster",
  requireAuth,
  requireRole(...MANAGER_PLUS),
  async (req, res) => {
    const agentId = String(req.query.agentId || "").trim();
    if (!agentId) return res.status(400).json({ error: "agentId required" });
    try {
      // Helper: query active carrier contracts for one agency_id.
      const fetchActiveContracts = async (agencyId: string) =>
        pool.query(
          `SELECT cd.id::text       AS carrier_id,
                  cd.name           AS carrier_name,
                  cd.short_name     AS carrier_short_name,
                  cd.code           AS carrier_code,
                  acc.id::text      AS agency_contract_id,
                  acc.status        AS agency_contract_status,
                  acc.writing_number AS agency_writing_number,
                  acc.states_authorized AS agency_states_authorized,
                  acc.mpa_effective_date,
                  acc.mpa_expiration_date
             FROM agency_carrier_contracts acc
             JOIN carrier_directory cd ON cd.id::text = acc.carrier_id::text
            WHERE acc.agency_id = $1::uuid
              AND acc.status = 'active'
              AND cd.is_active = true
            ORDER BY cd.name ASC`,
          [agencyId],
        );

      // Resolution order — match what FoundersAgencyManagement Carriers tab
      // sees so the drawer is never out of sync with the tab:
      //   1. The agent's resolved agency (via resolveAgentAgency).
      //   2. If empty → ROOT_AGENCY_ID (the Carriers tab hard-codes this).
      //   3. If still empty → demo fallback (matches founders-agencies behavior).
      const resolved = await resolveAgentAgency(agentId);
      let agencyForResponse: { agencyId: string; agencyName: string } | null =
        resolved;
      let realCarriers = resolved
        ? await fetchActiveContracts(resolved.agencyId)
        : { rows: [] as any[] };

      // Step 2: try ROOT if the resolved agency had no active contracts.
      if (realCarriers.rows.length === 0 && resolved?.agencyId !== ROOT_AGENCY_ID) {
        const rootRows = await fetchActiveContracts(ROOT_AGENCY_ID);
        if (rootRows.rows.length > 0) {
          realCarriers = rootRows;
          const rootMeta = await pool.query(
            `SELECT id::text AS id, name FROM agencies WHERE id = $1::uuid LIMIT 1`,
            [ROOT_AGENCY_ID],
          );
          if (rootMeta.rows[0]) {
            agencyForResponse = {
              agencyId: rootMeta.rows[0].id,
              agencyName: rootMeta.rows[0].name,
            };
          }
        }
      }

      // Step 3: demo fallback — applies whenever the effective agency we landed
      // on still has 0 active contracts AND we're either on ROOT or have no
      // resolved agency at all (matches the tab's hard-coded ROOT behavior).
      let carrierRows: any[];
      let usingDemo = false;
      const onRoot =
        !agencyForResponse || agencyForResponse.agencyId === ROOT_AGENCY_ID;
      if (
        DEMO_FALLBACK_ENABLED &&
        realCarriers.rows.length === 0 &&
        onRoot
      ) {
        usingDemo = true;
        // Make sure agencyForResponse has SOME meta so the drawer header isn't blank.
        if (!agencyForResponse) {
          agencyForResponse = { agencyId: ROOT_AGENCY_ID, agencyName: "Heritage Life Solutions" };
        }
        carrierRows = demoAgencyCarrierContracts().map((c: any) => ({
          carrier_id: String(c.carrier_id),
          carrier_name: c.carrier_name,
          carrier_short_name: c.carrier_short_name,
          carrier_code: null,
          agency_contract_id: c.id,
          agency_contract_status: c.status,
          agency_writing_number: c.writing_number ?? null,
          agency_states_authorized: c.states_authorized ?? null,
          mpa_effective_date: c.mpa_effective_date,
          mpa_expiration_date: c.mpa_expiration_date,
        }));
      } else {
        carrierRows = realCarriers.rows;
      }

      if (!agencyForResponse) {
        return res.json({ agency: null, carriers: [] });
      }
      const agency = agencyForResponse;

      // Attach per-state appointment rows when not demo (demo carrier IDs are
      // synthetic and won't match real carrier_appointments anyway).
      const carrierIds = carrierRows.map((r) => r.carrier_id);
      let appointments: any[] = [];
      if (!usingDemo && carrierIds.length > 0) {
        const apptRes = await pool.query(
          `SELECT ca.*, cd.name AS carrier_name
             FROM carrier_appointments ca
             LEFT JOIN carrier_directory cd ON cd.id = ca.carrier_id
            WHERE ca.agent_user_id::text = $1
              AND ca.carrier_id::text = ANY($2::text[])`,
          [agentId, carrierIds],
        );
        appointments = apptRes.rows;
      }

      const byCarrier: Record<string, any[]> = {};
      for (const a of appointments) {
        const k = String(a.carrier_id);
        (byCarrier[k] ||= []).push(a);
      }

      const contractedCarriers = carrierRows.map((c) => ({
        ...c,
        source: usingDemo ? "demo" : "agency_contract",
        appointments: byCarrier[c.carrier_id] || [],
      }));

      // Union with the agent's own contracting requests so the drawer reflects
      // exactly what the HCMS Carriers tab shows. We dedupe by carrier name
      // (case-insensitive) so a request that already maps to an agency contract
      // doesn't double-render.
      const requestRes = await pool.query(
        `SELECT id, carrier, states, status, returned_reason, created_at
           FROM agent_contracting_requests
          WHERE agent_user_id::text = $1
          ORDER BY created_at DESC`,
        [agentId],
      );

      const seenNames = new Set(
        contractedCarriers.map((c) => String(c.carrier_name || "").toLowerCase()),
      );
      const requestOnly = requestRes.rows
        .filter((r: any) => !seenNames.has(String(r.carrier || "").toLowerCase()))
        .map((r: any) => ({
          carrier_id: `request:${r.id}`,
          carrier_name: r.carrier,
          carrier_short_name: r.carrier,
          carrier_code: null,
          agency_contract_id: null,
          agency_contract_status: r.status,
          agency_writing_number: null,
          agency_states_authorized: Array.isArray(r.states)
            ? r.states
            : typeof r.states === "string"
              ? r.states.split(",").map((s: string) => s.trim()).filter(Boolean)
              : null,
          mpa_effective_date: null,
          mpa_expiration_date: null,
          source: "request",
          request_status: r.status,
          appointments: [],
        }));

      res.json({
        agency: { id: agency.agencyId, name: agency.agencyName, demo: usingDemo },
        carriers: [...contractedCarriers, ...requestOnly],
      });
    } catch (e: any) {
      console.error("[HCMS] /agency-roster error:", e?.message);
      res.status(500).json({ error: "Failed to load agency carrier roster" });
    }
  },
);

export default router;
