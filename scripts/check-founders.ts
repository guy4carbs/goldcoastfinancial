import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const r = await pool.query(`SELECT email, role, two_factor_enabled, password_reset_required FROM users WHERE role='founder' OR email LIKE '%cook%' OR email LIKE '%carbonara%'`);
  console.table(r.rows);
  await pool.end();
}
main();
