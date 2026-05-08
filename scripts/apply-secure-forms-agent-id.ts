/**
 * One-off runner for migration 0005_secure_forms_agent_id.sql.
 *
 * Run via: tsx scripts/apply-secure-forms-agent-id.ts
 *
 * Loads DATABASE_URL via dotenv (same as server boot), executes the
 * migration in a transaction, and prints before/after stats so we can
 * verify backfill coverage.
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { Pool } from "pg";
import path from "path";

const sqlPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "migrations",
  "0005_secure_forms_agent_id.sql"
);

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const before = await client.query(
      `SELECT
         COUNT(*)::int                                               AS total,
         COUNT(DISTINCT agent_email)::int                            AS distinct_emails
       FROM secure_forms`
    );
    console.log("[before]", before.rows[0]);

    // Detect column existence so we know if backfill is the only step left.
    const col = await client.query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_name = 'secure_forms' AND column_name = 'agent_id'`
    );
    console.log("[agent_id present?]", col.rowCount === 1);

    const sql = readFileSync(sqlPath, "utf8");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("[migration] applied");

    const after = await client.query(
      `SELECT
         COUNT(*)::int                                                  AS total,
         COUNT(agent_id)::int                                           AS with_agent_id,
         COUNT(*) FILTER (WHERE agent_id IS NULL)::int                  AS orphan_rows
       FROM secure_forms`
    );
    console.log("[after]", after.rows[0]);

    if (after.rows[0].orphan_rows > 0) {
      const sample = await client.query(
        `SELECT link_id, agent_email, created_at
           FROM secure_forms
          WHERE agent_id IS NULL
          ORDER BY created_at DESC
          LIMIT 5`
      );
      console.log("[orphan sample]", sample.rows);
    }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[migration] FAILED — rolled back");
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
