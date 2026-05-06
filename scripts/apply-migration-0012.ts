// Vector — apply migrations/0012_agency_writing_number.sql against DATABASE_URL.
// Mirrors the pattern of scripts/apply-migration-0011.ts. Idempotent
// (ADD COLUMN IF NOT EXISTS).

import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = readFileSync(
    path.resolve(__dirname, "../migrations/0012_agency_writing_number.sql"),
    "utf8",
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("[migrate-0012] applying 0012_agency_writing_number.sql");
    await client.query(sql);
    console.log("[migrate-0012] applied");

    // Probe: confirm the new column exists.
    const probe = await client.query(
      `SELECT column_name, data_type, character_maximum_length
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'agency_carrier_contracts'
          AND column_name = 'writing_number'`,
    );
    if (probe.rows.length === 0) {
      console.error("[migrate-0012] FAIL: writing_number column missing");
      process.exit(1);
    }
    console.log(
      `[migrate-0012] probe: writing_number ${probe.rows[0].data_type}(${probe.rows[0].character_maximum_length})`,
    );
    console.log("[migrate-0012] OK");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate-0012] FAILED:", err);
  process.exit(1);
});
