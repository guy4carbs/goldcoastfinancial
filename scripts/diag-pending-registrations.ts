/**
 * Diagnostic: why are no pending registrations showing in the founder tab?
 *
 * Checks:
 *  1. Recent agent_profiles rows (any status) — what landed and when
 *  2. Pending-status rows specifically — what the tab queries for
 *  3. Outstanding invite tokens — invites that were sent but not consumed
 *  4. Recent users.onboarding_status changes — did anyone submit?
 */
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const out = (label: string, rows: unknown[]) => {
    console.log(`\n━━━ ${label} (${rows.length} rows) ━━━`);
    if (rows.length === 0) console.log("  (none)");
    else console.log(JSON.stringify(rows, null, 2));
  };

  const recentProfiles = await pool.query(`
    SELECT
      ap.id,
      ap.user_id,
      u.email,
      u.first_name,
      u.last_name,
      ap.approval_status,
      u.onboarding_status,
      ap.onboarding_completed_at,
      ap.created_at,
      ap.updated_at
    FROM agent_profiles ap
    LEFT JOIN users u ON u.id::text = ap.user_id
    ORDER BY COALESCE(ap.updated_at, ap.created_at) DESC
    LIMIT 10
  `);
  out("RECENT agent_profiles (any status)", recentProfiles.rows);

  const pendingRows = await pool.query(`
    SELECT ap.id, u.email, ap.approval_status, ap.created_at, ap.updated_at
    FROM agent_profiles ap
    JOIN users u ON u.id::text = ap.user_id
    WHERE ap.approval_status IN ('pending_review','pending')
    ORDER BY ap.created_at DESC
  `);
  out("WHAT THE TAB QUERIES (approval_status IN pending_review|pending)", pendingRows.rows);

  const outstandingInvites = await pool.query(`
    SELECT
      u.id::text          AS user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.onboarding_status,
      u.invite_token IS NOT NULL AS has_token,
      u.invite_token_expires_at,
      u.invited_at,
      ap.approval_status,
      ap.onboarding_completed_at
    FROM users u
    LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
    WHERE u.invite_token IS NOT NULL
       OR u.onboarding_status IN ('invited','submitted','in_progress')
       OR u.invited_at > NOW() - INTERVAL '7 days'
    ORDER BY COALESCE(u.invited_at, u.created_at) DESC NULLS LAST
    LIMIT 15
  `);
  out("OUTSTANDING / RECENT INVITES (last 7d)", outstandingInvites.rows);

  const submittedToday = await pool.query(`
    SELECT u.id::text AS user_id, u.email, u.onboarding_status, u.updated_at, ap.approval_status, ap.onboarding_completed_at
    FROM users u
    LEFT JOIN agent_profiles ap ON ap.user_id = u.id::text
    WHERE u.onboarding_status = 'submitted'
       OR ap.onboarding_completed_at > NOW() - INTERVAL '7 days'
    ORDER BY COALESCE(ap.onboarding_completed_at, u.updated_at) DESC NULLS LAST
    LIMIT 10
  `);
  out("USERS WITH onboarding_status='submitted' OR completed in last 7d", submittedToday.rows);

  await pool.end();
}

main().catch((e) => {
  console.error("DIAG FAILED:", e);
  process.exit(1);
});
