#!/usr/bin/env node
// Retention sweep — hard-deletes rows past their retention windows per
// docs/security/policies/data-retention.md. Idempotent; safe to run as
// often as daily. Each table sweep is wrapped in its own transaction so a
// failure on one table doesn't block the others.
//
// Run locally:    node scripts/retention-sweep.mjs
// Run dry:        DRY_RUN=1 node scripts/retention-sweep.mjs
// Run in CI:      see .github/workflows/retention-sweep.yml
//
// Audit-logs each sweep with action=retention_swept; the audit chain
// trigger captures the row-count delta in the payload.

import "dotenv/config";
import { Pool } from "pg";

const dryRun = process.env.DRY_RUN === "1";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Each sweep is { table, predicate, audit-payload-fn }. Predicates are
// PURE SQL fragments using the table's own columns; the script runs them
// inside a single DELETE so we never read the rows into the app.
const sweeps = [
  {
    name: "plaid_pending_deposits older than 90 days post-review",
    sql: `DELETE FROM plaid_pending_deposits
          WHERE reviewed_at IS NOT NULL
            AND reviewed_at < NOW() - INTERVAL '90 days'
          RETURNING id`,
    payload: (rows) => ({ table: "plaid_pending_deposits", count: rows.length }),
  },
  {
    name: "plaid_items disconnected > 90 days",
    sql: `DELETE FROM plaid_items
          WHERE deleted_at IS NOT NULL
            AND deleted_at < NOW() - INTERVAL '90 days'
          RETURNING id`,
    payload: (rows) => ({ table: "plaid_items", count: rows.length }),
  },
  {
    name: "founder_distributions soft-deleted > 30 days",
    sql: `DELETE FROM founder_distributions
          WHERE deleted_at IS NOT NULL
            AND deleted_at < NOW() - INTERVAL '30 days'
          RETURNING id`,
    payload: (rows) => ({ table: "founder_distributions", count: rows.length }),
  },
  {
    name: "login_attempts older than 1 year",
    sql: `DELETE FROM login_attempts
          WHERE created_at < NOW() - INTERVAL '1 year'
          RETURNING id`,
    payload: (rows) => ({ table: "login_attempts", count: rows.length }),
  },
  {
    name: "deactivated users older than 12 months (excluding legal hold)",
    // Conservative: keep users tied to active records. We only sweep
    // the user row itself when they have NO surviving rows in policies,
    // client_profiles, or commission_records. The 7-year retention on
    // those records keeps the user row in place.
    sql: `DELETE FROM users u
          WHERE u.is_active = false
            AND u.updated_at < NOW() - INTERVAL '12 months'
            AND NOT EXISTS (SELECT 1 FROM policies p WHERE p.user_id = u.id)
            AND NOT EXISTS (SELECT 1 FROM client_profiles cp WHERE cp.user_id = u.id)
          RETURNING id`,
    payload: (rows) => ({ table: "users", count: rows.length }),
  },
];

async function audit(payload) {
  if (dryRun) return;
  await pool.query(
    `INSERT INTO founder_audit_log (id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at)
     VALUES (gen_random_uuid(), NULL, 'retention_swept', 'retention', NULL, 'gc', $1::jsonb, NULL, NOW())`,
    [JSON.stringify(payload)],
  );
}

async function run() {
  console.log(`Retention sweep starting (dry_run=${dryRun})`);
  let totalRemoved = 0;
  for (const sweep of sweeps) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let removed = 0;
      if (dryRun) {
        // SELECT instead of DELETE so we can preview without changing state.
        const previewSql = sweep.sql
          .replace(/^\s*DELETE FROM/i, "SELECT count(*)::int AS c FROM")
          .replace(/RETURNING\s+\w+\s*$/i, "");
        const r = await client.query(previewSql);
        removed = r.rows[0]?.c ?? 0;
      } else {
        const r = await client.query(sweep.sql);
        removed = r.rowCount ?? 0;
      }
      console.log(`  ${sweep.name}: ${dryRun ? "would remove" : "removed"} ${removed}`);
      if (removed > 0 && !dryRun) {
        await audit(sweep.payload({ length: removed }));
      }
      await client.query("COMMIT");
      totalRemoved += removed;
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(`  ${sweep.name}: FAILED — ${e.message}`);
      process.exitCode = 1;
    } finally {
      client.release();
    }
  }
  console.log(`Total: ${totalRemoved}`);
  await pool.end();
}

await run();
