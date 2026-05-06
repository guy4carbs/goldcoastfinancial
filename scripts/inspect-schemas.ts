import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("=== deals columns ===");
  const a = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='deals' ORDER BY ordinal_position",
  );
  console.table(a.rows);

  console.log("=== users (founders/owners/admins) ===");
  const b = await pool.query(
    "SELECT id, email, first_name, last_name, role FROM users WHERE role IN ('founder','owner','system_admin') LIMIT 5",
  );
  console.table(b.rows);

  console.log("=== agent_hierarchy columns ===");
  const c = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='agent_hierarchy' ORDER BY ordinal_position",
  );
  console.table(c.rows);

  console.log("=== existing deals by status ===");
  const d = await pool.query("SELECT status, COUNT(*) AS n FROM deals GROUP BY status");
  console.table(d.rows);

  console.log("=== existing agent_hierarchy ===");
  const e = await pool.query(
    "SELECT agent_user_id, hierarchy_level, contract_level, direct_upline_id FROM agent_hierarchy LIMIT 10",
  );
  console.table(e.rows);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
