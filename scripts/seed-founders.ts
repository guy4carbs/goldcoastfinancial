import "dotenv/config";
import { pool } from "../server/db";

const FOUNDER_EMAILS = [
  "jack.cook@heritagels.org",
  "frank.carbonara@heritagels.org",
  "gaetano.carbonara@heritagels.org",
  "nick.gallagher@heritagels.org",
  "guy4carbs@gmail.com",
];

/**
 * Grant `founder` role to the hard-coded list of founder emails and write an
 * audit trail row for every promotion (Helix M5).
 *
 * The seed performs the role update and the audit write inside a single
 * transaction so the two never desync. The audit row has `actor_user_id=NULL`
 * to signal a system action — the companion migration makes that column
 * nullable specifically so this path (and any other legitimate automated
 * promoter) can be represented honestly.
 */
async function main() {
  console.log("Seeding founder roles for:", FOUNDER_EMAILS.join(", "));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Capture prior roles so each audit row records what was changed.
    const before = await client.query(
      `SELECT id, email, role FROM users WHERE email = ANY($1::text[])`,
      [FOUNDER_EMAILS],
    );
    const priorRoleByEmail = new Map<string, { id: string; role: string }>();
    for (const row of before.rows) {
      priorRoleByEmail.set(row.email, { id: row.id, role: row.role });
    }

    const result = await client.query(
      `UPDATE users
         SET role = 'founder', updated_at = NOW()
         WHERE email = ANY($1::text[])
         RETURNING id, email, role`,
      [FOUNDER_EMAILS],
    );

    console.log(`Updated ${result.rowCount ?? 0} user(s) to role=founder.`);

    for (const row of result.rows) {
      const prior = priorRoleByEmail.get(row.email);
      const previousRole = prior?.role ?? "unknown";

      const auditPayload = {
        previousRole,
        grantedBy: process.env.USER || "unknown",
        script: "seed-founders.ts",
        ranAt: new Date().toISOString(),
        email: row.email,
      };

      await client.query(
        `INSERT INTO founder_audit_log
           (id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at)
         VALUES (gen_random_uuid(), NULL, $1, 'users', $2, 'both', $3, NULL, NOW())`,
        [
          "founder_role_granted_via_seed",
          row.id,
          JSON.stringify(auditPayload),
        ],
      );

      console.log(`  - ${row.email} (id=${row.id}) -> role=${row.role} (was=${previousRole})`);
    }

    const missing = FOUNDER_EMAILS.filter(
      (email) => !result.rows.some((row: { email: string }) => row.email === email),
    );
    if (missing.length > 0) {
      console.warn(
        `Note: ${missing.length} founder email(s) not found in users table (safe to re-run after registration):`,
      );
      for (const email of missing) {
        console.warn(`  - ${email}`);
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("seed-founders failed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("seed-founders fatal error:", err);
  process.exit(1);
});
