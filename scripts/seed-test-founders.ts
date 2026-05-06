/**
 * Seed dedicated test-only founder fixtures used by Playwright specs.
 * These users have 2FA disabled so the test fixture's plain login flow works.
 * Safe to re-run — uses ON CONFLICT (email).
 *
 * Created users:
 *   jack.cook@heritagels.org      / FoundersTest!2026  → role=founder
 *   frank.carbonara@heritagels.org / FoundersTest!2026 → role=founder
 *
 * Cleanup later (when no longer needed):
 *   DELETE FROM users WHERE email LIKE '%@heritagels.org' AND email IN ('jack.cook@heritagels.org','frank.carbonara@heritagels.org');
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;

const TEST_FOUNDERS = [
  { email: "jack.cook@heritagels.org", firstName: "Jack", lastName: "Cook" },
  { email: "frank.carbonara@heritagels.org", firstName: "Frank", lastName: "Carbonara" },
];
const PASSWORD = process.env.FOUNDER_A_PASSWORD || "FoundersTest!2026";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const hash = await bcrypt.hash(PASSWORD, 10);

  try {
    for (const f of TEST_FOUNDERS) {
      const existing = await client.query("SELECT id FROM users WHERE email = $1", [f.email]);
      if (existing.rowCount && existing.rowCount > 0) {
        // Reset password + role + clear 2FA so the fixture login works
        await client.query(
          `UPDATE users
             SET password = $1,
                 role = 'founder',
                 two_factor_enabled = false,
                 two_factor_secret = NULL,
                 password_reset_required = false,
                 is_active = true,
                 updated_at = NOW()
           WHERE email = $2`,
          [hash, f.email],
        );
        console.log(`[seed-test-founders] reset existing: ${f.email}`);
      } else {
        await client.query(
          `INSERT INTO users (email, password, first_name, last_name, role, is_active, two_factor_enabled, password_reset_required, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'founder', true, false, false, NOW(), NOW())`,
          [f.email, hash, f.firstName, f.lastName],
        );
        console.log(`[seed-test-founders] created: ${f.email}`);
      }
    }

    const finalRows = await client.query(
      `SELECT email, role, two_factor_enabled FROM users WHERE email = ANY($1)`,
      [TEST_FOUNDERS.map((f) => f.email)],
    );
    console.log("[seed-test-founders] final state:");
    console.table(finalRows.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed-test-founders] FAILED:", err);
  process.exit(1);
});
