/**
 * One-shot: flip Troy Kashul's users.onboarding_status from 'invited' to
 * 'submitted' so he appears in the Founders Pending Registrations tab.
 *
 * Pre-fix submission for user 99f217f0-f298-43df-8593-f15caf12b584. Every
 * other field on the row is correct; only this status flag is stale.
 *
 * Idempotent: only updates when current value is exactly 'invited' so
 * re-runs are safe.
 */
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TROY_USER_ID = "99f217f0-f298-43df-8593-f15caf12b584";

async function main() {
  const before = await pool.query(
    "SELECT id::text, email, first_name, last_name, onboarding_status FROM users WHERE id = $1",
    [TROY_USER_ID],
  );
  console.log("BEFORE:", before.rows[0]);
  if (!before.rows[0]) {
    console.error("FAIL: user not found");
    process.exit(1);
  }
  if (before.rows[0].onboarding_status !== "invited") {
    console.log(`SKIP: onboarding_status is '${before.rows[0].onboarding_status}', not 'invited' — nothing to do`);
    await pool.end();
    return;
  }

  const r = await pool.query(
    "UPDATE users SET onboarding_status = 'submitted', updated_at = NOW() WHERE id = $1 AND onboarding_status = 'invited' RETURNING id::text, onboarding_status, updated_at",
    [TROY_USER_ID],
  );
  console.log("UPDATED:", r.rows[0]);

  await pool.end();
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
