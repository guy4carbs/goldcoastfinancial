/**
 * Backfill quotes.agent_user_id from agent_email → users.email match.
 *
 * The quotes table already has the agent_user_id FK column + index (defined
 * in shared/models/enterprise.ts), but historical INSERT statements wrote
 * only agent_email, leaving agent_user_id NULL. This script fills in the
 * gap so the per-user GET filter works for legacy rows.
 *
 * Idempotent: only updates rows where agent_user_id IS NULL.
 */

import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const before = await client.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(agent_user_id)::int AS with_fk,
              COUNT(*) FILTER (WHERE agent_user_id IS NULL)::int AS missing
         FROM quotes`
    );
    console.log("[before]", before.rows[0]);

    await client.query("BEGIN");
    const upd = await client.query(
      `UPDATE quotes q
          SET agent_user_id = u.id
         FROM users u
        WHERE q.agent_user_id IS NULL
          AND LOWER(q.agent_email) = LOWER(u.email)`
    );
    await client.query("COMMIT");
    console.log("[backfill] rows updated:", upd.rowCount);

    const after = await client.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(agent_user_id)::int AS with_fk,
              COUNT(*) FILTER (WHERE agent_user_id IS NULL)::int AS orphan
         FROM quotes`
    );
    console.log("[after]", after.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[backfill] FAILED — rolled back");
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
