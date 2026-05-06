import type { PoolClient } from "pg";
import { pool } from "../db";

// Sentinel H3: force-end view-as sessions that exceed the hard cap. Runs every
// 10 minutes; any session older than MAX_SESSION_MS with ended_at IS NULL gets
// closed and audited as `viewas_auto_expired`. The founder's in-memory session
// still holds `viewingAs` until their next request — at which point the
// application-level guard will continue to treat them as read-only. That is
// intentional fail-safe behavior: over-restriction is acceptable, under-
// restriction is not.

const MAX_SESSION_MS = 4 * 60 * 60 * 1000; // 4 hours
const SWEEP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let timer: NodeJS.Timeout | null = null;

async function sweepOnce(): Promise<void> {
  // Harden against transient DNS / DB outages — a failure here must never kill
  // the dev server (the Node unhandledRejection default crashes the process).
  let client: PoolClient;
  try {
    client = (await pool.connect()) as PoolClient;
  } catch (err) {
    console.error("[viewAsSweeper] connect failed:", err);
    return;
  }
  try {
    await client.query("BEGIN");
    const expired = await client.query(
      `UPDATE view_as_sessions
         SET ended_at = NOW()
         WHERE ended_at IS NULL
           AND started_at < NOW() - INTERVAL '4 hours'
         RETURNING id, founder_user_id, target_user_id, started_at`,
    );

    for (const row of expired.rows) {
      await client.query(
        `INSERT INTO founder_audit_log
           (id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at)
         VALUES (gen_random_uuid(), $1, 'viewas_auto_expired', 'view_as_sessions', $2, 'both', $3, $4, NOW())`,
        [
          row.founder_user_id,
          row.id,
          JSON.stringify({
            targetUserId: row.target_user_id,
            startedAt: row.started_at,
            reason: "exceeded_4h_cap",
          }),
          row.target_user_id,
        ],
      );
    }

    await client.query("COMMIT");
    if (expired.rowCount && expired.rowCount > 0) {
      console.log(`[viewAsSweeper] expired ${expired.rowCount} session(s)`);
    }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[viewAsSweeper] sweep failed:", err);
  } finally {
    client.release();
  }
}

export function startViewAsSweeper(): void {
  if (timer) return;
  const safeSweep = () => {
    sweepOnce().catch((err) => console.error("[viewAsSweeper] uncaught:", err));
  };
  timer = setInterval(safeSweep, SWEEP_INTERVAL_MS);
  if (typeof timer.unref === "function") timer.unref();
  // Run once at boot so a restart doesn't leave stale sessions open for 10min.
  safeSweep();
}

export function stopViewAsSweeper(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
