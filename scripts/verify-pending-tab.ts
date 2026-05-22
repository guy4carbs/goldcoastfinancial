import "dotenv/config";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const r = await pool.query(`
    SELECT u.first_name, u.last_name, u.email, ap.approval_status, u.onboarding_status
    FROM agent_profiles ap
    JOIN users u ON u.id::text = ap.user_id
    WHERE ap.approval_status IN ('pending_review','pending')
      AND COALESCE(u.onboarding_status, '') NOT IN ('invited', '')
    ORDER BY ap.created_at DESC
  `);
  console.log("PENDING TAB SHOULD SHOW:", JSON.stringify(r.rows, null, 2));
  await pool.end();
})();
