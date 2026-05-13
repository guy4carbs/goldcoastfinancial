/**
 * Founders Members router — backs the Founders Lounge Access page
 * (`/founders/access`) with real DB queries so the page can drop its
 * in-memory demo store. Mounted at `/api/members`.
 *
 * Endpoint surface (kept in sync with FoundersLoungeAccess.tsx — the page
 * deliberately uses `/api/members/*` rather than `/api/founders/*` so the
 * URL semantics line up with heritage-app's lounge-access router for
 * future cross-deployment audits).
 *
 *   GET    /pending                       — pending agent registrations
 *   GET    /?role=&status=&approval=      — full member roster
 *   GET    /audit?actionType=             — access_change_log entries
 *   GET    /:id/lounge-access             — per-user lounge grants
 *   POST   /:id/approve                   — approve a pending registration
 *   POST   /:id/reject                    — reject (body: { reason })
 *   POST   /:id/lounge/:loungeKey         — grant/revoke (body: { granted })
 *   POST   /invite                        — create skeleton user + invite token
 *
 * Auth: requireAuth + requireRole(...FOUNDERS_ONLY) at router level (Wave Y).
 * CSRF: inherited from the global `/api` middleware.
 * Audit: every mutation writes to access_change_log AND founder_audit_log.
 * View-as: every mutation guarded with blockWritesDuringViewAs.
 */

import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import {
  requireAuth,
  requireRole,
  FOUNDERS_ONLY,
  blockWritesDuringViewAs,
} from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { reinitializeLoungeAccess } from "../services/loungeAccessSync";
import { LOUNGE_KEYS } from "../../shared/models/loungeAccess";
import { genericError } from "./founders-book";
import { storage } from "../storage";
import {
  sendRegistrationApprovalEmail,
  sendRegistrationRejectionEmail,
} from "../gmail";

const router = Router();
router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

const VALID_LOUNGE_KEYS = new Set<string>(LOUNGE_KEYS);

// ──────────────────────────────────────────────────────────────────────────
// GET /pending — pending agent registrations awaiting founder decision
// ──────────────────────────────────────────────────────────────────────────
router.get("/pending", async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        ap.id,
        u.id::text         AS user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        ap.is_licensed,
        ap.license_number,
        ap.licensed_states,
        ap.years_experience,
        ap.referral_source,
        ap.created_at      AS applied_at
      FROM agent_profiles ap
      JOIN users u ON u.id::text = ap.user_id
      WHERE ap.approval_status IN ('pending_review','pending')
      ORDER BY ap.created_at DESC
    `);
    res.json(r.rows);
  } catch (e: any) {
    console.error("[founders-members] /pending error:", e?.message);
    res.status(500).json(genericError("Failed to load pending registrations"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET / — member roster with optional filters
// ──────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const role = (req.query.role as string | undefined) || undefined;
    const status = (req.query.status as string | undefined) || undefined; // 'active' | 'inactive'
    const approval = (req.query.approval_status as string | undefined) || undefined;

    const where: string[] = [];
    const params: any[] = [];
    if (role) { params.push(role); where.push(`u.role = $${params.length}`); }
    if (status === "active") where.push(`u.is_active = true`);
    if (status === "inactive") where.push(`u.is_active = false`);
    if (approval) {
      params.push(approval);
      where.push(`COALESCE(ap.approval_status, 'approved') = $${params.length}`);
    }

    const r = await pool.query(
      `SELECT u.id::text             AS id,
              u.email,
              u.first_name,
              u.last_name,
              u.phone,
              u.role,
              u.is_active,
              u.last_login_at,
              u.avatar_url,
              u.two_factor_enabled,
              ap.approval_status
         FROM users u
         LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY u.last_name ASC NULLS LAST, u.first_name ASC NULLS LAST
        LIMIT 1000`,
      params,
    );
    res.json(r.rows);
  } catch (e: any) {
    console.error("[founders-members] / error:", e?.message);
    res.status(500).json(genericError("Failed to load members"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /audit — access_change_log entries with optional action filter
// ──────────────────────────────────────────────────────────────────────────
router.get("/audit", async (req, res) => {
  try {
    const actionType = (req.query.actionType as string | undefined) || undefined;
    const params: any[] = [];
    let where = "";
    if (actionType && actionType !== "all") {
      params.push(actionType);
      where = `WHERE acl.action_type = $${params.length}`;
    }
    const r = await pool.query(
      `SELECT acl.id::text                     AS id,
              acl.created_at,
              acl.action_type,
              acl.previous_value,
              acl.new_value,
              acl.reason,
              (au.first_name || ' ' || au.last_name) AS actor_name,
              (tu.first_name || ' ' || tu.last_name) AS target_name
         FROM access_change_log acl
         LEFT JOIN users au ON au.id = acl.performed_by
         LEFT JOIN users tu ON tu.id = acl.target_user_id
         ${where}
         ORDER BY acl.created_at DESC
         LIMIT 500`,
      params,
    );
    res.json(r.rows);
  } catch (e: any) {
    console.error("[founders-members] /audit error:", e?.message);
    res.status(500).json(genericError("Failed to load audit log"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /:id/lounge-access — per-user lounge grants (returns row per lounge)
// ──────────────────────────────────────────────────────────────────────────
router.get("/:id/lounge-access", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT lounge_key, granted
         FROM user_lounge_access
        WHERE user_id = $1
        ORDER BY lounge_key`,
      [req.params.id],
    );
    res.json(r.rows);
  } catch (e: any) {
    console.error("[founders-members] /:id/lounge-access error:", e?.message);
    res.status(500).json(genericError("Failed to load lounge access"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /:id/approve — approve a pending agent registration
// ──────────────────────────────────────────────────────────────────────────
router.post("/:id/approve", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const performedBy = req.user!.id;
  // Wave AC1: founder picks where to place the new agent + sets contract level.
  // Body: { uplineId?: string|null, contractLevelPct?: number, reason?: string }
  // Defaults: top-of-tree placement (uplineId=null), 80% baseline (clamped 0-120).
  const uplineId =
    String((req.body || {}).uplineId || "").trim() || null;
  const contractLevelPct = Math.max(
    0,
    Math.min(120, Number((req.body || {}).contractLevelPct ?? 80)),
  );
  const approveReason =
    String((req.body || {}).reason || "").slice(0, 500) || null;
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    // Wave AA3: capture user details inside the transaction so we have them
    // for the post-commit notification + email.
    const userRow = await c.query<{ email: string; first_name: string; last_name: string }>(
      `SELECT email, first_name, last_name FROM users WHERE id = $1::uuid`,
      [targetId],
    );
    if (userRow.rowCount === 0) {
      await c.query("ROLLBACK");
      return res.status(404).json(genericError("User not found"));
    }
    const { email, first_name, last_name } = userRow.rows[0];

    // Capture the truthful prior approval_status so the audit log reflects
    // reality (re-approve from 'rejected' / 'pending' / etc., not just the
    // hardcoded 'pending_review').
    const priorRow = await c.query<{ approval_status: string | null }>(
      `SELECT approval_status FROM agent_profiles WHERE user_id = $1`,
      [targetId],
    );
    const priorApprovalStatus = priorRow.rows[0]?.approval_status ?? "pending_review";

    await c.query(
      `UPDATE agent_profiles SET approval_status = 'approved', approved_at = NOW(), approved_by = $2 WHERE user_id = $1`,
      [targetId, performedBy],
    );
    await c.query(`UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1::uuid`, [targetId]);

    // Wave AC1: place the agent in the hierarchy. Resolve upline's chain +
    // level so the new node has a coherent placement. Without this row the
    // /api/hcms/hierarchy/uplines query won't surface the agent for future
    // applicants and the Hierarchy page won't render them.
    let uplineChain: string[] = [];
    let hierarchyLevel = 6; // default 'Agent' tier
    if (uplineId) {
      const u = await c.query<{ upline_chain: string[] | null; hierarchy_level: number | null }>(
        `SELECT upline_chain, hierarchy_level FROM agent_hierarchy
           WHERE agent_user_id = $1::uuid
             AND (effective_to IS NULL OR effective_to > NOW())
           ORDER BY effective_from DESC NULLS LAST LIMIT 1`,
        [uplineId],
      );
      if (u.rowCount === 1) {
        uplineChain = [...(u.rows[0].upline_chain || []), uplineId];
        hierarchyLevel = (u.rows[0].hierarchy_level ?? 5) + 1;
      } else {
        // Upline picked but they have no hierarchy row yet (e.g. owner
        // before the seed populated agent_hierarchy). Still place the agent
        // under them; hierarchy_level falls back to 6.
        uplineChain = [uplineId];
      }
    }

    // Idempotent re-approve: close any active hierarchy row for this user
    // before inserting the new one. Without this, the partial-unique index
    // on (agent_user_id) WHERE effective_to IS NULL throws on re-approve
    // and rolls the entire transaction back.
    await c.query(
      `UPDATE agent_hierarchy
          SET effective_to = NOW()
        WHERE agent_user_id = $1::uuid AND effective_to IS NULL`,
      [targetId],
    );
    await c.query(
      `INSERT INTO agent_hierarchy (
         agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title,
         upline_chain, contract_level, override_eligible, override_percentage, effective_from
       ) VALUES ($1::uuid, $2::uuid, $3, 'Agent', $4::jsonb, $5, true, 0, NOW())`,
      [
        targetId,
        uplineId,
        hierarchyLevel,
        JSON.stringify(uplineChain),
        contractLevelPct,
      ],
    );

    await c.query(
      `INSERT INTO access_change_log (target_user_id, performed_by, action_type, previous_value, new_value, reason)
       VALUES ($1::uuid, $2::uuid, 'registration_approved', $3::jsonb, $4::jsonb, $5)`,
      [
        targetId,
        performedBy,
        JSON.stringify({ approval_status: priorApprovalStatus }),
        JSON.stringify({
          approval_status: "approved",
          upline_id: uplineId,
          contract_level: contractLevelPct,
          hierarchy_level: hierarchyLevel,
        }),
        approveReason,
      ],
    );
    await c.query("COMMIT");

    try {
      await logFounderAction({
        actorUserId: performedBy,
        action: "member.approved",
        entityType: "user",
        entityId: targetId,
      });
    } catch (auditErr: any) {
      console.error("[founders-members] /approve audit failed:", auditErr?.message);
    }

    // Wave AA3: portal notification (best-effort).
    try {
      await storage.createNotification({
        userId: targetId,
        title: "Welcome to Gold Coast Financial Partners",
        message: "Your application has been approved. You can now log in to access your portal.",
        type: "registration_approved",
        actionUrl: "/agent-portal",
      });
    } catch (e: any) {
      console.error("[founders-members] /approve notification failed:", e?.message);
    }

    // Wave AA3: branded approval email (best-effort).
    try {
      await sendRegistrationApprovalEmail({ firstName: first_name, lastName: last_name, email });
    } catch (e: any) {
      console.error("[founders-members] /approve email failed:", e?.message);
    }

    res.json({ ok: true });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    console.error("[founders-members] /approve error:", e?.code, e?.message);
    const code = e?.code ? ` (${e.code})` : "";
    const msg = typeof e?.message === "string" ? `: ${e.message.slice(0, 160)}` : "";
    res.status(500).json(genericError(`Failed to approve${code}${msg}`));
  } finally {
    c.release();
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /:id/reject — reject a pending registration with reason
// ──────────────────────────────────────────────────────────────────────────
router.post("/:id/reject", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const performedBy = req.user!.id;
  const reason = String((req.body || {}).reason || "").slice(0, 500) || null;
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    // Wave AA3: capture user details for the post-commit notification + email.
    const userRow = await c.query<{ email: string; first_name: string; last_name: string }>(
      `SELECT email, first_name, last_name FROM users WHERE id = $1::uuid`,
      [targetId],
    );
    if (userRow.rowCount === 0) {
      await c.query("ROLLBACK");
      return res.status(404).json(genericError("User not found"));
    }
    const { email, first_name, last_name } = userRow.rows[0];

    // Truthful prior approval_status for the audit log.
    const priorRow = await c.query<{ approval_status: string | null }>(
      `SELECT approval_status FROM agent_profiles WHERE user_id = $1`,
      [targetId],
    );
    const priorApprovalStatus = priorRow.rows[0]?.approval_status ?? "pending_review";

    await c.query(
      `UPDATE agent_profiles SET approval_status = 'rejected', approved_at = NOW(), approved_by = $2 WHERE user_id = $1`,
      [targetId, performedBy],
    );
    await c.query(
      `INSERT INTO access_change_log (target_user_id, performed_by, action_type, previous_value, new_value, reason)
       VALUES ($1::uuid, $2::uuid, 'registration_rejected', $3::jsonb, '{"approval_status":"rejected"}'::jsonb, $4)`,
      [
        targetId,
        performedBy,
        JSON.stringify({ approval_status: priorApprovalStatus }),
        reason,
      ],
    );
    await c.query("COMMIT");

    try {
      await logFounderAction({
        actorUserId: performedBy,
        action: "member.rejected",
        entityType: "user",
        entityId: targetId,
        payload: { reason },
      });
    } catch (auditErr: any) {
      console.error("[founders-members] /reject audit failed:", auditErr?.message);
    }

    // Wave AA3: portal notification (best-effort).
    try {
      await storage.createNotification({
        userId: targetId,
        title: "Application status",
        message: reason
          ? `Your application was not approved. Reason: ${reason}`
          : "Your application was not approved.",
        type: "registration_rejected",
        actionUrl: "/",
      });
    } catch (e: any) {
      console.error("[founders-members] /reject notification failed:", e?.message);
    }

    // Wave AA3: branded rejection email (best-effort).
    try {
      await sendRegistrationRejectionEmail({ firstName: first_name, lastName: last_name, email, reason });
    } catch (e: any) {
      console.error("[founders-members] /reject email failed:", e?.message);
    }

    res.json({ ok: true });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    console.error("[founders-members] /reject error:", e?.code, e?.message);
    const code = e?.code ? ` (${e.code})` : "";
    const msg = typeof e?.message === "string" ? `: ${e.message.slice(0, 160)}` : "";
    res.status(500).json(genericError(`Failed to reject${code}${msg}`));
  } finally {
    c.release();
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /:id/role — change a user's role + sync goldcoast surfaces and
// heritage lounge defaults atomically. Wave Y8: founders' single entry point
// to grant cross-platform access — pick a role, the user inherits the
// canonical surface set on both deployments.
//
// Body: { newRole: string, reason?: string }
//   - newRole must be one of the 10 canonical roles.
//   - reason surfaces in access_change_log + founder_audit_log.
//
// Implementation: delegates to reinitializeLoungeAccess() which writes
// users.role, access_change_log, wipes stale user_lounge_access grants, and
// re-grants the new role's heritage lounges per ROLE_TO_LOUNGES — all in one
// transaction. Goldcoast surface gating is automatic: requireRole(...) on
// every router reads users.role on the next request.
// ──────────────────────────────────────────────────────────────────────────
const ROLE_CHANGE_ALLOWED = new Set<string>([
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager",
  "sales_agent",
  "marketing_staff",
  "client",
  "investor",
]);

router.post("/:id/role", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const performedBy = req.user!.id;
  const newRole = String((req.body || {}).newRole || "").trim();
  const reason = String((req.body || {}).reason || "").slice(0, 500) || null;

  if (!ROLE_CHANGE_ALLOWED.has(newRole)) {
    return res.status(400).json(genericError(`Invalid role: ${newRole}`));
  }
  if (targetId === performedBy && newRole !== "founder") {
    // Founders cannot demote themselves — guard against accidental lockout.
    return res.status(400).json(genericError("You cannot demote your own founder role from this UI."));
  }

  try {
    const result = await reinitializeLoungeAccess({
      userId: targetId,
      newRole,
      performedByUserId: performedBy,
      reason,
    });
    res.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[founders-members] /:id/role error:", e?.message);
    res.status(500).json(genericError(e?.message || "Failed to change role"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /reset-all-lounge-access — Wave Z9 bulk reset. Wipes per-user lounge
// overrides for every recognized-role user and re-grants the canonical
// defaults from ROLE_TO_LOUNGES. Used to fix stale data from earlier wave
// spec changes in one founder click.
// ──────────────────────────────────────────────────────────────────────────
router.post("/reset-all-lounge-access", blockWritesDuringViewAs, async (req, res) => {
  const performedBy = req.user!.id;
  const reason = String((req.body || {}).reason || "Bulk reset to canonical role defaults").slice(0, 500);

  try {
    const users = await pool.query<{ id: string; email: string; role: string }>(
      `SELECT id, email, role FROM users WHERE role = ANY($1::text[]) ORDER BY role, email`,
      [
        [
          "founder",
          "owner",
          "system_admin",
          "director",
          "agency_manager",
          "manager",
          "sales_agent",
          "marketing_staff",
          "client",
          "investor",
        ],
      ],
    );

    const results: Array<{ email: string; role: string; ok: boolean; lounges?: number; error?: string }> = [];
    let pass = 0;
    let fail = 0;
    for (const user of users.rows) {
      try {
        const r = await reinitializeLoungeAccess({
          userId: user.id,
          newRole: user.role,
          performedByUserId: performedBy,
          reason,
          force: true,
        });
        results.push({ email: user.email, role: user.role, ok: true, lounges: r.loungesGranted.length });
        pass++;
      } catch (e: any) {
        results.push({ email: user.email, role: user.role, ok: false, error: e?.message });
        fail++;
      }
    }
    res.json({ ok: true, total: users.rowCount, pass, fail, results });
  } catch (e: any) {
    console.error("[founders-members] /reset-all-lounge-access error:", e?.message);
    res.status(500).json(genericError(e?.message || "Failed to bulk reset"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /:id/reset-lounge-access — wipe per-user overrides + re-grant the
// canonical defaults for the user's CURRENT role. Wave Z8 — clears stale
// rows from earlier waves so the toggle matrix matches ROLE_TO_LOUNGES.
// ──────────────────────────────────────────────────────────────────────────
router.post("/:id/reset-lounge-access", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const performedBy = req.user!.id;
  const reason = String((req.body || {}).reason || "Reset to role default").slice(0, 500);

  try {
    const cur = await pool.query<{ role: string }>(
      `SELECT role FROM users WHERE id = $1::uuid`,
      [targetId],
    );
    if (cur.rowCount === 0) {
      return res.status(404).json(genericError("User not found"));
    }
    const role = cur.rows[0].role;

    const result = await reinitializeLoungeAccess({
      userId: targetId,
      newRole: role,
      performedByUserId: performedBy,
      reason,
      force: true,
    });
    res.json({ ok: true, role, ...result });
  } catch (e: any) {
    console.error("[founders-members] /:id/reset-lounge-access error:", e?.message);
    res.status(500).json(genericError(e?.message || "Failed to reset lounge access"));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /:id/lounge/:loungeKey — grant or revoke a single lounge
// ──────────────────────────────────────────────────────────────────────────
router.post("/:id/lounge/:loungeKey", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const loungeKey = req.params.loungeKey;
  const performedBy = req.user!.id;
  const granted = !!(req.body || {}).granted;

  if (!VALID_LOUNGE_KEYS.has(loungeKey)) {
    return res.status(400).json(genericError(`Invalid lounge key: ${loungeKey}`));
  }

  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const before = await c.query(
      `SELECT granted FROM user_lounge_access WHERE user_id = $1 AND lounge_key = $2`,
      [targetId, loungeKey],
    );
    const previousGranted = before.rows[0]?.granted ?? false;

    await c.query(
      `INSERT INTO user_lounge_access (user_id, lounge_key, granted, granted_by, granted_at, revoked_at)
       VALUES ($1, $2, $3, $4, NOW(), CASE WHEN $3 THEN NULL ELSE NOW() END)
       ON CONFLICT (user_id, lounge_key)
       DO UPDATE SET granted = EXCLUDED.granted,
                     granted_by = EXCLUDED.granted_by,
                     granted_at = CASE WHEN EXCLUDED.granted THEN NOW() ELSE user_lounge_access.granted_at END,
                     revoked_at = CASE WHEN EXCLUDED.granted THEN NULL ELSE NOW() END`,
      [targetId, loungeKey, granted, performedBy],
    );
    await c.query(
      `INSERT INTO access_change_log (target_user_id, performed_by, action_type, previous_value, new_value, reason)
       VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5::jsonb, NULL)`,
      [
        targetId,
        performedBy,
        granted ? "lounge_granted" : "lounge_revoked",
        JSON.stringify({ lounge_key: loungeKey, granted: previousGranted }),
        JSON.stringify({ lounge_key: loungeKey, granted }),
      ],
    );
    await c.query("COMMIT");

    try {
      await logFounderAction({
        actorUserId: performedBy,
        action: granted ? "lounge.granted" : "lounge.revoked",
        entityType: "user",
        entityId: targetId,
        payload: { loungeKey, granted },
      });
    } catch (auditErr: any) {
      console.error("[founders-members] /lounge audit failed:", auditErr?.message);
    }

    res.json({ ok: true });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    console.error("[founders-members] /lounge error:", e?.message);
    res.status(500).json(genericError("Failed to update lounge access"));
  } finally {
    c.release();
  }
});

// ──────────────────────────────────────────────────────────────────────────
// DELETE /:id — hard-delete a user + cascade child rows. Wave AB.
// PROTECTED: cannot delete the canonical founder (guy4carbs@gmail.com),
// cannot delete self. Emits a final audit row before the user disappears.
// ──────────────────────────────────────────────────────────────────────────
const PROTECTED_EMAILS = new Set<string>(["guy4carbs@gmail.com"]);

router.delete("/:id", blockWritesDuringViewAs, async (req, res) => {
  const targetId = req.params.id;
  const performedBy = req.user!.id;

  if (targetId === performedBy) {
    return res.status(400).json(genericError("You cannot delete your own account from this UI."));
  }

  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const userRow = await c.query<{ email: string; first_name: string; last_name: string }>(
      `SELECT email, first_name, last_name FROM users WHERE id = $1::uuid`,
      [targetId],
    );
    if (userRow.rowCount === 0) {
      await c.query("ROLLBACK");
      return res.status(404).json(genericError("User not found"));
    }
    const { email, first_name, last_name } = userRow.rows[0];
    if (PROTECTED_EMAILS.has(email.toLowerCase())) {
      await c.query("ROLLBACK");
      return res.status(403).json(genericError(`${email} is a protected account and cannot be deleted.`));
    }

    // Discover every FK pointing at users.id at runtime so we don't have to
    // maintain a hand-rolled list (the schema has 20+ such FKs across audit
    // logs, hierarchy, agencies, board_votes, cap_table_entries, etc.). For
    // demo-data cleanup, every dependent row is acceptable to nuke.
    const fks = await c.query<{ table_name: string; column_name: string }>(
      `SELECT tc.table_name, kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
         JOIN information_schema.referential_constraints rc
           ON tc.constraint_name = rc.constraint_name
         JOIN information_schema.constraint_column_usage ccu
           ON rc.unique_constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND ccu.table_name = 'users'
          AND ccu.column_name = 'id'`,
    );

    // Delete from each FK source. Order doesn't matter inside the transaction
    // because we delete users LAST. Each cascade DELETE is wrapped so a
    // single-table failure (e.g. unknown column type cast) doesn't abort.
    for (const fk of fks.rows) {
      // Skip the users table itself — that's deleted last.
      if (fk.table_name === "users") continue;
      try {
        await c.query(
          `DELETE FROM "${fk.table_name}" WHERE "${fk.column_name}"::text = $1`,
          [targetId],
        );
      } catch (e: any) {
        console.error(
          `[founders-members] DELETE cascade ${fk.table_name}.${fk.column_name} failed:`,
          e?.message,
        );
        // Re-throw so the transaction aborts cleanly with a useful message.
        throw new Error(
          `Cascade delete failed on ${fk.table_name}.${fk.column_name}: ${e?.message}`,
        );
      }
    }

    // Tables with no FK but logically owned by this user (varchar user_id
    // columns missing the FK constraint — e.g. agent_profiles in some snapshots).
    try {
      await c.query(`DELETE FROM agent_profiles WHERE user_id::text = $1`, [targetId]);
    } catch (e: any) {
      console.error("[founders-members] DELETE agent_profiles fallback failed:", e?.message);
    }
    try {
      await c.query(`DELETE FROM user_lounge_access WHERE user_id::text = $1`, [targetId]);
    } catch (e: any) {
      console.error("[founders-members] DELETE user_lounge_access fallback failed:", e?.message);
    }
    // Wave AD2: view_as_sessions has no FK constraint to users.id (audit
    // 2026-05-07), so the dynamic-FK loop above won't catch it. Clean up
    // both founder_user_id and target_user_id rows so deleted users don't
    // leave orphaned audit rows.
    try {
      await c.query(
        `DELETE FROM view_as_sessions WHERE founder_user_id = $1::uuid OR target_user_id = $1::uuid`,
        [targetId],
      );
    } catch (e: any) {
      console.error("[founders-members] DELETE view_as_sessions fallback failed:", e?.message);
    }

    // Finally remove the user row itself.
    await c.query(`DELETE FROM users WHERE id = $1::uuid`, [targetId]);

    await c.query("COMMIT");

    try {
      await logFounderAction({
        actorUserId: performedBy,
        action: "member.deleted",
        entityType: "user",
        entityId: targetId,
        payload: { email, first_name, last_name },
      });
    } catch (auditErr: any) {
      console.error("[founders-members] DELETE audit failed:", auditErr?.message);
    }

    res.json({ ok: true, deleted: { id: targetId, email } });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    console.error("[founders-members] DELETE error:", e?.message);
    res.status(500).json(genericError(e?.message || "Failed to delete user"));
  } finally {
    c.release();
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /invite — create skeleton user + invite token
// ──────────────────────────────────────────────────────────────────────────
router.post("/invite", blockWritesDuringViewAs, async (req, res) => {
  const performedBy = req.user!.id;
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  const firstName = String((req.body || {}).first_name || "").trim();
  const lastName = String((req.body || {}).last_name || "").trim();
  const role = String((req.body || {}).role || "sales_agent");

  if (!email || !firstName || !lastName) {
    return res.status(400).json(genericError("email, first_name, last_name are required"));
  }

  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const existing = await c.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      await c.query("ROLLBACK");
      return res.status(409).json(genericError("A user with this email already exists"));
    }

    const inviteToken = crypto.randomUUID();
    const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const ins = await c.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active, onboarding_status, invite_token, invite_token_expires_at, password_reset_required)
       VALUES ($1, $2, $3, $4, $5, false, 'invited', $6, $7, true)
       RETURNING id::text AS id`,
      [email, tempPassword, firstName, lastName, role, inviteToken, expiresAt],
    );
    const newUserId = ins.rows[0].id;

    await c.query(
      `INSERT INTO access_change_log (target_user_id, performed_by, action_type, previous_value, new_value, reason)
       VALUES ($1::uuid, $2::uuid, 'invited', NULL, $3::jsonb, NULL)`,
      [newUserId, performedBy, JSON.stringify({ email, role })],
    );
    await c.query("COMMIT");

    try {
      await logFounderAction({
        actorUserId: performedBy,
        action: "member.invited",
        entityType: "user",
        entityId: newUserId,
        payload: { email, role, inviteTokenExpiresAt: expiresAt.toISOString() },
      });
    } catch (auditErr: any) {
      console.error("[founders-members] /invite audit failed:", auditErr?.message);
    }

    res.json({ ok: true, id: newUserId, inviteToken });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    console.error("[founders-members] /invite error:", e?.message);
    res.status(500).json(genericError("Failed to send invite"));
  } finally {
    c.release();
  }
});

export default router;
// Reference re-export so an unused import on the goldcoast side doesn't dangle.
export { reinitializeLoungeAccess };
