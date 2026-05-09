/**
 * Auto-migration runner — scans `migrations/*.sql`, applies any not yet
 * recorded in the `_migrations_applied` table. Runs on every Railway boot
 * via the `start` script so deploys never leave the DB out of sync with
 * the code.
 *
 * Idempotent: re-runs are safe because the tracking table records which
 * filenames have been applied, and we skip those. Each migration runs
 * inside a transaction; failure rolls back that single migration without
 * affecting others.
 *
 * Filename convention: NNNN_*.sql (sorted lexically). Adding a new SQL file
 * to migrations/ is the only step required to ship a schema change.
 */
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const TRACKING_TABLE = "_migrations_applied";

function envDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set to run migrations");
  }
  return url;
}

async function main() {
  const pool = new Pool({ connectionString: envDatabaseUrl() });

  // Tracking table — created idempotently. One row per applied migration.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" (
       filename text PRIMARY KEY,
       applied_at timestamp DEFAULT now() NOT NULL
     )`,
  );

  const migrationsDir = join(process.cwd(), "migrations");
  let files: string[];
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch (e: any) {
    console.error(`[migrate] migrations dir not found at ${migrationsDir}: ${e?.message}`);
    await pool.end();
    process.exit(1);
  }

  const appliedRows = await pool.query<{ filename: string }>(
    `SELECT filename FROM "${TRACKING_TABLE}"`,
  );
  const applied = new Set(appliedRows.rows.map((r) => r.filename));

  let appliedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const file of files) {
    if (applied.has(file)) {
      skippedCount++;
      continue;
    }
    const path = join(migrationsDir, file);
    const sql = readFileSync(path, "utf8").trim();
    if (!sql) {
      console.log(`[migrate] skip empty: ${file}`);
      continue;
    }
    console.log(`[migrate] applying ${file}...`);
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      await c.query(sql);
      await c.query(`INSERT INTO "${TRACKING_TABLE}" (filename) VALUES ($1)`, [file]);
      await c.query("COMMIT");
      console.log(`[migrate]   OK`);
      appliedCount++;
    } catch (e: any) {
      await c.query("ROLLBACK").catch(() => {});
      console.error(`[migrate]   FAILED ${file}: ${e?.message}`);
      // For migrations that already match prod state (e.g. tables created
      // out-of-band), record them as applied IF the error is "already exists"
      // so we don't get stuck retrying every boot.
      const msg = String(e?.message || "");
      const isAlreadyApplied =
        msg.includes("already exists") ||
        msg.includes("duplicate column") ||
        msg.includes("relation already exists");
      if (isAlreadyApplied) {
        console.log(`[migrate]   marking ${file} as already-applied (state already matches)`);
        try {
          await pool.query(
            `INSERT INTO "${TRACKING_TABLE}" (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
            [file],
          );
          skippedCount++;
        } catch {
          /* ignore */
        }
      } else {
        failedCount++;
        // Don't abort on a single failure — log and continue. The server
        // boot will still succeed and the failed migration shows in logs.
      }
    } finally {
      c.release();
    }
  }

  console.log(
    `\n[migrate] done — applied: ${appliedCount}, skipped: ${skippedCount}, failed: ${failedCount}`,
  );
  await pool.end();
  // Exit 0 even on per-file failures so server boot proceeds. The failure
  // is loud in logs and the server can still serve everything that doesn't
  // depend on the failed migration.
  process.exit(0);
}

main().catch(async (err) => {
  console.error("[migrate] fatal:", err?.message || err);
  process.exit(1);
});
