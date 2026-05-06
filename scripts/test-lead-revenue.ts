import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const r1 = await pool.query("SELECT COUNT(*) AS n FROM lead_purchases");
const r2 = await pool.query("SELECT COUNT(*) AS n FROM lead_products");
const r3 = await pool.query(
  "SELECT slug, name, price_cents, vendor_cost_cents, active, coming_soon FROM lead_products ORDER BY price_cents",
);

console.log("lead_purchases rows:", r1.rows[0].n);
console.log("lead_products rows:", r2.rows[0].n);
console.table(r3.rows);

await pool.end();
