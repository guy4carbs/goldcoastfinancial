import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const r = await pool.query(`
    SELECT
      COUNT(*)::int                                              AS total,
      COUNT(agent_user_id)::int                                  AS with_agent_user_id,
      COUNT(*) FILTER (WHERE agent_user_id IS NULL)::int          AS missing_fk,
      COUNT(DISTINCT agent_email)::int                           AS distinct_emails
    FROM quotes
  `);
  console.log(r.rows[0]);

  const idx = await pool.query(`
    SELECT indexname FROM pg_indexes
     WHERE tablename = 'quotes' AND indexname LIKE '%agent_user%'
  `);
  console.log("indexes:", idx.rows);

  await pool.end();
}
main();
