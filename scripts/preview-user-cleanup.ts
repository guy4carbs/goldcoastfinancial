/**
 * READ-ONLY preview of what would be deleted by the user-cleanup script.
 * Shows: each non-keeper user + the count of dependent rows in every related
 * table. Run this FIRST, review the numbers, then run the actual delete.
 */
import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;
const KEEP = ["guy4carbs@gmail.com"];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const usersToDelete = await client.query(
      `SELECT id, email, role, first_name, last_name, is_active, created_at
       FROM users
       WHERE email <> ALL($1::text[])
       ORDER BY role, email`,
      [KEEP],
    );

    if (usersToDelete.rowCount === 0) {
      console.log("[preview] Nothing to delete — only the keeper(s) exist.");
      return;
    }

    console.log(`[preview] Would delete ${usersToDelete.rowCount} user(s):`);
    console.table(usersToDelete.rows);

    // Find every table that has a foreign key referencing users(id) so we can
    // count dependent rows and surprise nobody.
    const fkTables = await client.query(
      `SELECT
         tc.table_name,
         kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND ccu.table_name = 'users'
         AND ccu.column_name = 'id'
       ORDER BY tc.table_name, kcu.column_name`,
    );

    const ids = usersToDelete.rows.map((r: any) => r.id);
    console.log(`\n[preview] Foreign-key references that point at these users:`);
    console.log(`(${fkTables.rowCount} table/column pairs reference users.id)\n`);

    const summary: Array<{ table: string; column: string; rows_to_cascade: number; on_delete: string }> = [];
    for (const fk of fkTables.rows) {
      try {
        const cnt = await client.query(
          `SELECT COUNT(*)::int AS n FROM "${fk.table_name}" WHERE "${fk.column_name}" = ANY($1::uuid[])`,
          [ids],
        );
        // Find ON DELETE action for this constraint
        const action = await client.query(
          `SELECT delete_rule FROM information_schema.referential_constraints rc
           JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
           WHERE tc.table_name = $1
             AND tc.constraint_type = 'FOREIGN KEY'
             AND tc.constraint_name IN (
               SELECT constraint_name FROM information_schema.key_column_usage
               WHERE table_name = $1 AND column_name = $2
             )
           LIMIT 1`,
          [fk.table_name, fk.column_name],
        );
        summary.push({
          table: fk.table_name,
          column: fk.column_name,
          rows_to_cascade: cnt.rows[0].n,
          on_delete: action.rows[0]?.delete_rule || "?",
        });
      } catch (e: any) {
        summary.push({
          table: fk.table_name,
          column: fk.column_name,
          rows_to_cascade: -1,
          on_delete: `error: ${e.message}`,
        });
      }
    }
    console.table(summary.filter((s) => s.rows_to_cascade !== 0));

    const restricted = summary.filter(
      (s) => s.rows_to_cascade > 0 && (s.on_delete === "NO ACTION" || s.on_delete === "RESTRICT"),
    );
    if (restricted.length > 0) {
      console.log(
        `\n[preview] WARNING — ${restricted.length} reference(s) use NO ACTION/RESTRICT and will BLOCK the DELETE:`,
      );
      console.table(restricted);
    } else {
      console.log("\n[preview] All FK references use CASCADE or SET NULL — DELETE will proceed cleanly.");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[preview] FAILED:", err);
  process.exit(1);
});
