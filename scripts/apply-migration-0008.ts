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
    path.resolve(__dirname, "../migrations/0008_lead_marketplace.sql"),
    "utf8",
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("[migrate] applying 0008_lead_marketplace.sql");
    await client.query(sql);
    console.log("[migrate] success");

    const products = await client.query(
      "SELECT slug, name, price_cents, vendor_cost_cents, active, coming_soon FROM lead_products ORDER BY price_cents",
    );
    console.log("[migrate] seeded products:");
    console.table(products.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
