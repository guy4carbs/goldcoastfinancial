import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { pool } from "../server/db";

/**
 * Apply the lean Founders Lounge migrations via node-pg (no psql required).
 * Runs 0001_founders_lounge_safe.sql then 0002_founder_audit_append_only.sql.
 * Both files are additive + idempotent (IF NOT EXISTS, CREATE OR REPLACE).
 */
async function applyFile(path: string): Promise<void> {
  const sql = readFileSync(path, "utf8");
  console.log(`Applying ${path} (${sql.length.toLocaleString()} chars)...`);
  // node-pg accepts multi-statement query strings on the simple protocol.
  await pool.query(sql);
  console.log(`  done: ${path}`);
}

async function main() {
  const root = resolve(process.cwd());
  try {
    await applyFile(resolve(root, "migrations/0001_founders_lounge_safe.sql"));
    await applyFile(resolve(root, "migrations/0002_founder_audit_append_only.sql"));
    await applyFile(resolve(root, "migrations/0003_leads_distribution_extras.sql"));

    const { rows } = await pool.query(
      `SELECT tablename FROM pg_tables
         WHERE schemaname = 'public'
           AND tablename IN ('board_decisions','board_votes','cap_table_entries',
                             'capital_allocations','founder_audit_log','ma_pipeline_items','view_as_sessions')
         ORDER BY tablename`,
    );
    console.log(`\nFounders tables present: ${rows.length}/7`);
    for (const r of rows) console.log(`  - ${r.tablename}`);

    if (rows.length !== 7) {
      console.error("Not all 7 tables present — investigate.");
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Migration apply failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
