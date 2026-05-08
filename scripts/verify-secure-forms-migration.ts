import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const r = await pool.query(`
    SELECT
      COUNT(*)::int                                    AS total,
      COUNT(agent_id)::int                             AS with_agent_id,
      COUNT(*) FILTER (WHERE agent_id IS NULL)::int    AS orphan,
      EXISTS (
        SELECT 1 FROM pg_indexes
         WHERE indexname = 'idx_secure_forms_agent_id'
      )                                                AS index_present,
      EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name = 'secure_forms' AND column_name = 'agent_id'
      )                                                AS column_present
    FROM secure_forms
  `);
  console.log(r.rows[0]);
  await pool.end();
}
main();
