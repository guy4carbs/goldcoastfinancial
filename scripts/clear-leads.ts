/**
 * Clear Leads — wipes the `leads` table + dependent `lead_activities` rows
 * so the Lead Distribution dashboard starts at a clean zero.
 *
 * Atomic: single transaction. Idempotent. Default is dry-run; pass --apply
 * to actually write.
 *
 * Run: `npx tsx scripts/clear-leads.ts [--apply]`
 */
import "dotenv/config";
import { pool } from "../server/db";

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n${apply ? "🟢 APPLY MODE" : "🟡 DRY-RUN — pass --apply to actually write"}\n`);

  const client = await pool.connect();
  try {
    const leadCount = (await client.query(`SELECT COUNT(*)::int AS n FROM leads`)).rows[0].n;
    const activityCount = (await client.query(`SELECT COUNT(*)::int AS n FROM lead_activities`)).rows[0].n;

    // Per-status breakdown so the user sees what they're wiping.
    const byStatus = await client.query(
      `SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status ORDER BY status`,
    );

    console.log(`leads:           ${leadCount}`);
    console.log(`lead_activities: ${activityCount}`);
    if (byStatus.rowCount && byStatus.rowCount > 0) {
      console.log(`\nleads by status:`);
      for (const r of byStatus.rows) console.log(`  ${r.status}: ${r.n}`);
    }

    if (!apply) {
      console.log("\n(Dry run only — no changes written. Re-run with --apply to commit.)\n");
      return;
    }

    if (leadCount === 0 && activityCount === 0) {
      console.log("\n(already clean — nothing to delete)");
      return;
    }

    await client.query("BEGIN");
    const a = await client.query(`DELETE FROM lead_activities`);
    const l = await client.query(`DELETE FROM leads`);
    await client.query("COMMIT");

    console.log(`\n✓ Cleared ${l.rowCount} leads and ${a.rowCount} lead_activities rows.`);
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* ignore */ }
    console.error("\n✗ Transaction rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

main();
