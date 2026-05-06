// Vector — apply migrations/0011_agency_management.sql against DATABASE_URL.
// Mirrors the pattern of scripts/apply-migration-0010.ts.
// Idempotent (every CREATE / INSERT in the SQL is guarded).

import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function describeColumns(client: any, table: string) {
  const r = await client.query(
    `SELECT column_name, data_type
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [table],
  );
  return r.rows;
}

const NEW_TABLES = [
  "agencies",
  "agency_teams",
  "agency_carrier_contracts",
  "agency_carrier_commission_overrides",
  "carrier_compliance_requirements",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = readFileSync(
    path.resolve(__dirname, "../migrations/0011_agency_management.sql"),
    "utf8",
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("[migrate-0011] applying 0011_agency_management.sql");
    const result = await client.query(sql);
    console.log(
      `[migrate-0011] applied; statement count: ${Array.isArray(result) ? result.length : 1}`,
    );

    for (const t of NEW_TABLES) {
      const cols = await describeColumns(client, t);
      if (cols.length === 0) {
        console.error(`[migrate-0011] FAIL: table ${t} not present after migration`);
        process.exit(1);
      }
      console.log(`[migrate-0011] ${t}: ${cols.length} columns`);
    }

    const root = await client.query(
      `SELECT id, name FROM agencies WHERE id = '00000000-0000-4000-8000-000000000001'`,
    );
    if (root.rows.length === 0) {
      console.error("[migrate-0011] FAIL: root agency not seeded");
      process.exit(1);
    }
    console.log(`[migrate-0011] root agency: ${root.rows[0].name}`);

    const teams = await client.query(
      `SELECT COUNT(*)::int AS c FROM agency_teams WHERE agency_id = '00000000-0000-4000-8000-000000000001'`,
    );
    console.log(`[migrate-0011] managers backfilled to root: ${teams.rows[0].c}`);

    console.log("[migrate-0011] OK");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate-0011] FAILED:", err);
  process.exit(1);
});
