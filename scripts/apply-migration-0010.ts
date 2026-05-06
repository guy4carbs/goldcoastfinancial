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
     ORDER BY column_name`,
    [table],
  );
  return r.rows;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = readFileSync(
    path.resolve(__dirname, "../migrations/0010_book_of_business.sql"),
    "utf8",
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("[migrate] applying 0010_book_of_business.sql");

    console.log("[migrate] policies columns BEFORE:");
    console.table(await describeColumns(client, "policies"));
    console.log("[migrate] documents columns BEFORE:");
    console.table(await describeColumns(client, "documents"));

    const result = await client.query(sql);
    console.log(`[migrate] statement count applied: ${Array.isArray(result) ? result.length : 1}`);

    console.log("[migrate] policies columns AFTER:");
    console.table(await describeColumns(client, "policies"));
    console.log("[migrate] documents columns AFTER:");
    console.table(await describeColumns(client, "documents"));

    // Sanity assertions
    const required = [
      "beneficiaries",
      "client_status",
      "chargeback_at",
      "chargeback_reason",
      "last_contact_date",
      "next_follow_up_date",
      "commission_rate",
      "draft_date",
      "notes",
      "agent_id",
      "lead_id",
      "carrier",
      "state_code",
      "client_details",
    ];
    const policyCols = (await describeColumns(client, "policies")).map(
      (r: any) => r.column_name,
    );
    const missing = required.filter((c) => !policyCols.includes(c));
    if (missing.length > 0) {
      console.error(`[migrate] FAIL: missing policy columns: ${missing.join(", ")}`);
      process.exit(1);
    }

    const docCols = (await describeColumns(client, "documents")).map(
      (r: any) => r.column_name,
    );
    if (!docCols.includes("s3_key") || !docCols.includes("uploaded_by")) {
      console.error("[migrate] FAIL: documents missing s3_key or uploaded_by");
      process.exit(1);
    }

    console.log("[migrate] OK — all expected columns present");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
