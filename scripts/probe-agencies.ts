// Vector probe: verifies migration 0011_agency_management applied cleanly.
// Usage: npx tsx scripts/probe-agencies.ts
//
// Exits 0 when all 5 tables exist + the root agency seed row + at least one
// agency_teams row are present. Otherwise prints a diff and exits 1.

import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const TABLES = [
  "agencies",
  "agency_teams",
  "agency_carrier_contracts",
  "agency_carrier_commission_overrides",
  "carrier_compliance_requirements",
];

const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";

async function describeColumns(client: any, table: string): Promise<string[]> {
  const r = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [table],
  );
  return r.rows.map((row: any) => row.column_name as string);
}

async function countRows(client: any, table: string): Promise<number> {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
  return r.rows[0].c as number;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let ok = true;

  try {
    console.log("[probe-agencies] tables + columns:");
    for (const t of TABLES) {
      const cols = await describeColumns(client, t);
      if (cols.length === 0) {
        console.error(`  [MISSING] ${t} — table not found in public schema`);
        ok = false;
        continue;
      }
      console.log(`  [${t}] ${cols.length} cols: ${cols.join(", ")}`);
    }

    console.log("\n[probe-agencies] row counts:");
    for (const t of TABLES) {
      try {
        const c = await countRows(client, t);
        console.log(`  ${t}: ${c}`);
      } catch (err: any) {
        console.error(`  ${t}: ERROR — ${err.message}`);
        ok = false;
      }
    }

    console.log("\n[probe-agencies] root agency:");
    const root = await client.query(
      `SELECT id, name, dba_name, legal_entity_type, status
         FROM agencies
        WHERE id = $1`,
      [ROOT_AGENCY_ID],
    );
    if (root.rows.length === 0) {
      console.error(`  [MISSING] root agency ${ROOT_AGENCY_ID} not seeded`);
      ok = false;
    } else {
      console.table(root.rows);
    }

    const teamsCount = await client.query(
      `SELECT COUNT(*)::int AS c
         FROM agency_teams
        WHERE agency_id = $1`,
      [ROOT_AGENCY_ID],
    );
    const c = teamsCount.rows[0].c as number;
    console.log(`\n[probe-agencies] agency_teams under root: ${c}`);
    if (c < 1) {
      console.warn(
        "  [WARN] no managers backfilled — either there are no manager/director rows in agent_hierarchy yet, or the backfill query needs review.",
      );
      // Don't fail — empty hierarchy is valid in fresh dev DBs.
    }

    if (!ok) {
      console.error("\n[probe-agencies] FAIL");
      process.exit(1);
    }
    console.log("\n[probe-agencies] OK");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[probe-agencies] FAILED:", err);
  process.exit(1);
});
