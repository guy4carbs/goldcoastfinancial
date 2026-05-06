import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const targets = await client.query(
      `SELECT id, email FROM users
       WHERE email IN ('frank.carbonara@heritagels.org','jack.cook@heritagels.org','demo@goldcoastfnl.com')
          OR email LIKE 'phase-d-test-%'`,
    );
    const ids = targets.rows.map((r: any) => r.id);

    console.log("Targets:");
    console.table(targets.rows);

    const polRes = await client.query(
      `SELECT id, user_id, policy_number, status, created_at FROM policies WHERE user_id = ANY($1::uuid[]) ORDER BY created_at DESC`,
      [ids],
    );
    console.log(`\nPolicies attached to targets: ${polRes.rowCount}`);
    console.table(polRes.rows);

    // Also enumerate ALL remaining FK columns pointing at users (so we don't hit another surprise)
    const allFks = await client.query(`
      SELECT
        tc.table_name AS t,
        kcu.column_name AS c,
        rc.delete_rule AS d
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'users'
        AND ccu.column_name = 'id'
      ORDER BY tc.table_name, kcu.column_name
    `);

    console.log(`\nAll FK columns referencing users.id (${allFks.rowCount} total):`);
    const summary: Array<{ t: string; c: string; d: string; rows_for_targets: number }> = [];
    for (const fk of allFks.rows) {
      try {
        const cnt = await client.query(
          `SELECT COUNT(*)::int AS n FROM "${fk.t}" WHERE "${fk.c}" = ANY($1::uuid[])`,
          [ids],
        );
        if (cnt.rows[0].n > 0) {
          summary.push({ t: fk.t, c: fk.c, d: fk.d, rows_for_targets: cnt.rows[0].n });
        }
      } catch (e: any) {
        summary.push({ t: fk.t, c: fk.c, d: fk.d, rows_for_targets: -1 });
      }
    }
    console.log("\nFK refs WITH ROWS for these targets (need to handle each):");
    console.table(summary);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
