/**
 * Deletes 4 test-fixture users and all their dependent rows.
 *
 * KEEPS:
 *   - guy4carbs@gmail.com (production founder)
 *   - admin@heritagels.org (production owner — backup admin path)
 *
 * DELETES:
 *   - frank.carbonara@heritagels.org   (Phase D Playwright test fixture)
 *   - jack.cook@heritagels.org         (Phase D Playwright test fixture)
 *   - demo@goldcoastfnl.com            (legacy demo sales_agent)
 *   - phase-d-test-*@example.com       (Phase D verifier leftover)
 *
 * Wrapped in a single transaction — all-or-nothing.
 */
import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const DELETE_EMAILS = [
  "frank.carbonara@heritagels.org",
  "jack.cook@heritagels.org",
  "demo@goldcoastfnl.com",
];
// phase-d-test-* uses a timestamp suffix — match by prefix
const DELETE_EMAIL_PREFIXES = ["phase-d-test-"];

// Dependent tables with rows for these specific targets (per the live FK
// scan). All use NO ACTION so DELETE order matters — wipe these first, then
// the user rows themselves. Demo policies (POL-2024-001 + POL-2024-002) are
// attached to demo@goldcoastfnl.com — they're demo seed data, safe to drop.
// Order matters because of inter-table FKs:
//   billing_history.policy_id → policies.id
//   so billing must die before policies, and both before users.
// Order matters — chain of dependent FKs:
//   billing_history.policy_id → policies.id
//   documents.policy_id → policies.id
//   so anything referencing policies must die before policies, and policies
//   before users. We blanket-delete by user_id; the policy_id chain is handled
//   by the same delete because billing/documents for these users will have
//   policy_ids that themselves point at to-be-deleted policies.
const DEPENDENT_TABLES: Array<[string, string]> = [
  ["billing_history", "user_id"],
  ["documents", "user_id"],
  ["policies", "user_id"],
  ["messages", "user_id"],
  ["notifications", "user_id"],
  ["agent_hierarchy", "agent_user_id"],
  ["agent_hierarchy", "direct_upline_id"],
  // Catch-alls in case future seed data adds rows in these tables for
  // test fixtures — no-ops today.
  ["agent_telephony_credentials", "agent_user_id"],
  ["agent_xp_transactions", "user_id"],
  ["agent_milestones", "user_id"],
  ["audit_logs", "user_id"],
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    // 1. Resolve target user IDs
    const targetsRes = await client.query(
      `SELECT id, email FROM users
       WHERE email = ANY($1::text[])
          OR ${DELETE_EMAIL_PREFIXES.map((_, i) => `email LIKE $${i + 2}`).join(" OR ")}`,
      [DELETE_EMAILS, ...DELETE_EMAIL_PREFIXES.map((p) => `${p}%`)],
    );

    if (targetsRes.rowCount === 0) {
      console.log("[delete] No matching users found — nothing to do.");
      return;
    }

    const ids = targetsRes.rows.map((r: any) => r.id);
    console.log(`[delete] Targeting ${targetsRes.rowCount} user(s):`);
    console.table(targetsRes.rows);

    // Safety check — never delete guy4carbs or admin
    const blocked = targetsRes.rows.filter((r: any) =>
      r.email === "guy4carbs@gmail.com" || r.email === "admin@heritagels.org",
    );
    if (blocked.length > 0) {
      console.error("[delete] ABORT — refusing to delete protected accounts:", blocked);
      process.exit(1);
    }

    await client.query("BEGIN");

    // 2. Wipe dependent rows first (in topological order)
    let totalDeps = 0;
    for (const [table, col] of DEPENDENT_TABLES) {
      const res = await client.query(
        `DELETE FROM "${table}" WHERE "${col}" = ANY($1::uuid[])`,
        [ids],
      );
      if (res.rowCount && res.rowCount > 0) {
        console.log(`[delete] ${table}.${col}: deleted ${res.rowCount} row(s)`);
        totalDeps += res.rowCount;
      }
    }
    console.log(`[delete] total dependents deleted: ${totalDeps}`);

    // 3. Finally delete the users
    const userDel = await client.query(
      `DELETE FROM users WHERE id = ANY($1::uuid[])`,
      [ids],
    );
    console.log(`[delete] users: deleted ${userDel.rowCount} row(s)`);

    await client.query("COMMIT");
    console.log("[delete] COMMIT — cleanup complete.");

    // 4. Final state sanity
    const remaining = await client.query(
      `SELECT email, role FROM users ORDER BY role, email`,
    );
    console.log("[delete] Remaining users in DB:");
    console.table(remaining.rows);
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("[delete] ROLLBACK — error:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[delete] FAILED:", err);
  process.exit(1);
});
