import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Reproduce the KPI query from server/routes/lead-revenue.ts
const r = await pool.query(
  `SELECT
     COALESCE(SUM(price_cents * COALESCE(quantity, 1)), 0)::bigint           AS gross_cents,
     COALESCE(SUM(vendor_cost_cents_snapshot * COALESCE(quantity, 1)), 0)::bigint AS vendor_cost_cents,
     COALESCE(SUM(COALESCE(quantity, 1)), 0)::int                            AS units_sold
   FROM lead_purchases
   WHERE status = 'completed'
     AND created_at >= $1::date
     AND created_at <  ($2::date + INTERVAL '1 day')`,
  ["2026-01-01", "2026-04-30"],
);
console.log("KPI raw row:", r.rows[0]);
console.log("Type of gross_cents:", typeof r.rows[0].gross_cents);
console.log("Number(gross_cents):", Number(r.rows[0].gross_cents));

await pool.end();
