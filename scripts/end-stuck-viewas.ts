/**
 * Force-end any active view_as_sessions rows for the admin user.
 * Use only when a session is "stuck" — UI shows blank ActiveSessionView with
 * no target. Cookie-side `viewingAs` will clear naturally on next login or
 * via /api/founders/viewas/session/end.
 */
import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const before = await pool.query(
    `SELECT vs.id, vs.founder_user_id, u.email, vs.target_user_id, vs.started_at, vs.reason
     FROM view_as_sessions vs
     LEFT JOIN users u ON u.id = vs.founder_user_id
     WHERE vs.ended_at IS NULL
     ORDER BY vs.started_at DESC`,
  );
  console.log(`Active view_as_sessions rows: ${before.rowCount}`);
  for (const r of before.rows) {
    console.log(`  ${r.email || "(unknown)"} → ${r.target_user_id} (started ${r.started_at}, reason: "${r.reason}")`);
  }
  if (before.rowCount === 0) {
    console.log("Nothing to clear.");
    await pool.end();
    return;
  }
  const upd = await pool.query(
    `UPDATE view_as_sessions
     SET ended_at = NOW()
     WHERE ended_at IS NULL
     RETURNING id`,
  );
  console.log(`Ended ${upd.rowCount} session(s).`);
  console.log(
    "Note: any in-browser cookie `viewingAs` keys persist until next /session/end POST or session expiry.",
  );
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
