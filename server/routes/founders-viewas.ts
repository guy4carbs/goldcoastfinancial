import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, FOUNDERS_ONLY } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { getDateRange } from "../utils/dateRange";

const router = Router();

router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

const startSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.string().min(5).max(2000),
});

// Roles that may NOT be impersonated. Founder→founder/owner/system_admin
// pivots add no read access (they already have it) but obscure per-actor
// audit attribution and are a privilege-escalation footgun. Sentinel finding,
// 2026-05-01.
const IMPERSONATION_DENYLIST = new Set(["founder", "owner", "system_admin"]);

// POST /session/start
router.post("/session/start", async (req, res) => {
  try {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
    }
    const { targetUserId, reason } = parsed.data;
    const founderId = req.user!.id;

    // Self-target guard — impersonating yourself is nonsense and would
    // confuse the audit trail.
    if (targetUserId === founderId) {
      return res.status(400).json({ error: "Cannot impersonate your own account" });
    }

    // Verify target exists
    const targetRes = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1`,
      [targetUserId]
    );
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: "Target user not found" });
    }

    // Privilege-tier guard — founders may not impersonate other founders /
    // owners / system_admins (per IMPERSONATION_DENYLIST above).
    if (IMPERSONATION_DENYLIST.has(String(targetRes.rows[0].role || ""))) {
      return res.status(403).json({
        error: "Cannot impersonate users at or above founder privilege",
        code: "TARGET_PRIVILEGE_BLOCKED",
      });
    }

    // Reject if any active session exists for this founder
    const active = await pool.query(
      `SELECT id FROM view_as_sessions WHERE founder_user_id = $1 AND ended_at IS NULL`,
      [founderId]
    );
    if (active.rows.length > 0) {
      return res.status(409).json({
        error: "An active view-as session already exists",
        code: "SESSION_ALREADY_ACTIVE",
        sessionId: active.rows[0].id,
      });
    }

    const session = await pool.query(
      `INSERT INTO view_as_sessions (founder_user_id, target_user_id, started_at, reason)
       VALUES ($1, $2, NOW(), $3)
       RETURNING id, founder_user_id, target_user_id, started_at, ended_at, reason`,
      [founderId, targetUserId, reason]
    );

    (req.session as any).viewingAs = targetUserId;
    (req.session as any).viewAsStartedAt = new Date().toISOString();
    (req.session as any).viewAsSessionId = session.rows[0].id;

    await logFounderAction({
      actorUserId: founderId,
      action: "view_as_started",
      entityType: "view_as_session",
      entityId: session.rows[0].id,
      brand: "both",
      payload: { targetUserId, targetEmail: targetRes.rows[0].email, reason },
      viewingAs: targetUserId,
    });

    res.status(201).json({ session: session.rows[0], target: targetRes.rows[0] });
  } catch (e: any) {
    console.error("Founders view-as start error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /session/end
router.post("/session/end", async (req, res) => {
  try {
    const founderId = req.user!.id;
    const priorViewingAs = (req.session as any)?.viewingAs || null;

    const active = await pool.query(
      `UPDATE view_as_sessions
       SET ended_at = NOW()
       WHERE founder_user_id = $1 AND ended_at IS NULL
       RETURNING id, founder_user_id, target_user_id, started_at, ended_at, reason`,
      [founderId]
    );

    (req.session as any).viewingAs = undefined;
    (req.session as any).viewAsStartedAt = undefined;
    (req.session as any).viewAsSessionId = undefined;

    if (active.rows.length > 0) {
      await logFounderAction({
        actorUserId: founderId,
        action: "view_as_ended",
        entityType: "view_as_session",
        entityId: active.rows[0].id,
        brand: "both",
        payload: { targetUserId: active.rows[0].target_user_id },
        viewingAs: priorViewingAs,
      });
    }

    res.json({ ok: true, sessions: active.rows });
  } catch (e: any) {
    console.error("Founders view-as end error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /session — current state
router.get("/session", async (req, res) => {
  try {
    const founderId = req.user!.id;
    const viewingAs = (req.session as any)?.viewingAs || null;
    const startedAt = (req.session as any)?.viewAsStartedAt || null;

    if (!viewingAs) return res.json({ active: false });

    const target = await pool.query(
      `SELECT id, email, first_name, last_name, role FROM users WHERE id = $1`,
      [viewingAs]
    );
    const row = await pool.query(
      `SELECT id, founder_user_id, target_user_id, started_at, ended_at, reason
       FROM view_as_sessions
       WHERE founder_user_id = $1 AND ended_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [founderId]
    );

    res.json({
      active: true,
      startedAt,
      target: target.rows[0] ?? null,
      session: row.rows[0] ?? null,
    });
  } catch (e: any) {
    console.error("Founders view-as session error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /targets?q= — search users (limit 20) for the target picker
router.get("/targets", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();

    const like = q ? `%${q}%` : null;
    const params: any[] = [];
    let where = `is_active = true AND role != 'founder'`;
    if (like) {
      where += ` AND (LOWER(email) LIKE $1 OR LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1)`;
      params.push(like);
    }

    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name
       FROM users
       WHERE ${where}
       ORDER BY last_name ASC, first_name ASC
       LIMIT 20`,
      params
    );

    res.json(
      result.rows.map((r: any) => ({
        id: r.id,
        email: r.email,
        role: r.role,
        firstName: r.first_name,
        lastName: r.last_name,
      }))
    );
  } catch (e: any) {
    console.error("Founders view-as targets error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /history?period=&filter=&limit=
// Returns view-as sessions in the period window with founder/target detail and
// an `autoExpired` flag derived from a LEFT JOIN against `founder_audit_log`.
// Filter `auto-expired` restricts to sessions that have a matching audit row.
router.get("/history", async (req, res) => {
  try {
    const period = (req.query.period as string) || "ytd";
    const filter = (req.query.filter as string) || "";
    const rawLimit = Number(req.query.limit ?? 50);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 50, 1), 200);

    // `period` only feeds getDateRange — no SQL injection surface.
    const range = getDateRange(period);

    // The auto-expired flag is derived: a session is "auto-expired" iff there
    // exists a `viewas_auto_expired` audit row whose entity_id matches it.
    // LEFT JOIN keeps non-expired sessions visible; the filter narrows when
    // requested by switching the join to an INNER-style WHERE clause.
    const params: any[] = [range.start, range.end, limit];
    const onlyAutoExpired = filter === "auto-expired";

    const sql = `
      SELECT
        s.id,
        s.started_at,
        s.ended_at,
        s.reason,
        s.founder_user_id,
        s.target_user_id,
        EXTRACT(EPOCH FROM (s.ended_at - s.started_at))::bigint AS duration_seconds,
        f.first_name  AS founder_first_name,
        f.last_name   AS founder_last_name,
        f.email       AS founder_email,
        t.first_name  AS target_first_name,
        t.last_name   AS target_last_name,
        t.email       AS target_email,
        t.role        AS target_role,
        (ax.id IS NOT NULL) AS auto_expired
      FROM view_as_sessions s
      LEFT JOIN users f ON f.id = s.founder_user_id
      LEFT JOIN users t ON t.id = s.target_user_id
      LEFT JOIN LATERAL (
        SELECT a.id
        FROM founder_audit_log a
        WHERE a.entity_id = s.id
          AND a.action = 'viewas_auto_expired'
        LIMIT 1
      ) ax ON true
      WHERE s.started_at >= $1::date
        AND s.started_at <  ($2::date + INTERVAL '1 day')
        ${onlyAutoExpired ? "AND ax.id IS NOT NULL" : ""}
      ORDER BY s.started_at DESC
      LIMIT $3
    `;

    const result = await pool.query(sql, params);

    res.json(
      result.rows.map((r: any) => {
        const founderName = [r.founder_first_name, r.founder_last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const targetName = [r.target_first_name, r.target_last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        return {
          id: r.id,
          startedAt: r.started_at ? new Date(r.started_at).toISOString() : null,
          endedAt: r.ended_at ? new Date(r.ended_at).toISOString() : null,
          durationSeconds:
            r.duration_seconds === null || r.duration_seconds === undefined
              ? null
              : Number(r.duration_seconds),
          reason: r.reason ?? null,
          founderUserId: r.founder_user_id,
          founderName,
          founderEmail: r.founder_email ?? "",
          targetUserId: r.target_user_id,
          targetName,
          targetEmail: r.target_email ?? "",
          targetRole: r.target_role ?? "",
          autoExpired: Boolean(r.auto_expired),
        };
      }),
    );
  } catch (e: any) {
    console.error("Founders view-as history error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /kpis?period=
// Aggregate counters for the View-As dashboard. avgDurationSeconds is computed
// over CLOSED sessions only — leaving an active session out of the average
// keeps the metric stable while a long pivot is in progress.
router.get("/kpis", async (req, res) => {
  try {
    const period = (req.query.period as string) || "ytd";
    const range = getDateRange(period);

    const sql = `
      WITH scoped AS (
        SELECT s.id, s.target_user_id, s.started_at, s.ended_at
        FROM view_as_sessions s
        WHERE s.started_at >= $1::date
          AND s.started_at <  ($2::date + INTERVAL '1 day')
      )
      SELECT
        (SELECT COUNT(*) FROM scoped)::bigint                                AS sessions_count,
        (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (ended_at - started_at))), 0)
           FROM scoped WHERE ended_at IS NOT NULL)::float                    AS avg_duration_seconds,
        (SELECT COUNT(DISTINCT target_user_id) FROM scoped)::bigint          AS unique_targets_count,
        (SELECT COUNT(*) FROM scoped sc
          WHERE EXISTS (
            SELECT 1 FROM founder_audit_log a
            WHERE a.entity_id = sc.id AND a.action = 'viewas_auto_expired'
          ))::bigint                                                         AS auto_expired_count
    `;

    const result = await pool.query(sql, [range.start, range.end]);
    const row = result.rows[0] ?? {};

    res.json({
      sessionsCount: Number(row.sessions_count ?? 0),
      avgDurationSeconds: Math.round(Number(row.avg_duration_seconds ?? 0)),
      uniqueTargetsCount: Number(row.unique_targets_count ?? 0),
      autoExpiredCount: Number(row.auto_expired_count ?? 0),
      period,
    });
  } catch (e: any) {
    console.error("Founders view-as kpis error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
