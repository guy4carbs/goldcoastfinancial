/**
 * Quick utility — list every carrier_directory row with key fields, and
 * (with --delete-orphans) wipe the 3 short-code stub rows (AMR, FOR, MOO)
 * that an admin re-added after the canonical 20-row seed. They have no
 * contracts attached and shadow the canonical rows in the UI.
 *
 * Run: `npx tsx scripts/inspect-carriers.ts [--delete-orphans]`
 */
import "dotenv/config";
import { pool } from "../server/db";

const ORPHAN_CODES = ["AMR", "FOR", "MOO"];

async function main() {
  const del = process.argv.includes("--delete-orphans");
  const r = await pool.query(
    `SELECT id, code, name, am_best_rating, naic,
            jsonb_array_length(COALESCE(product_types, '[]'::jsonb)) AS product_count,
            created_at
       FROM carrier_directory
       ORDER BY name, code`,
  );
  console.log(`Total rows: ${r.rowCount}\n`);
  for (const row of r.rows) {
    console.log(`  ${row.code ?? "(no code)"} | ${row.name} | ${row.am_best_rating ?? "—"} | NAIC ${row.naic ?? "—"} | ${row.product_count} products | created ${row.created_at?.toISOString?.() ?? row.created_at}`);
  }

  if (del) {
    // Stub orphans (AMR, FOR, MOO) had 0 products and 0 NAIC; any
    // agency_carrier_contracts row pointing at them is itself stub-cruft
    // (created when an admin added the same carrier twice via the UI).
    // Clean both in a single transaction so the orphan rows + their
    // shadow contracts disappear together.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ids = await client.query(
        `SELECT id, code FROM carrier_directory WHERE code = ANY($1::text[])`,
        [ORPHAN_CODES],
      );
      if (ids.rowCount === 0) {
        console.log("\n(no orphans to delete)");
        await client.query("ROLLBACK");
        return;
      }

      const orphanIds = ids.rows.map((r: any) => r.id);
      const contractsDel = await client.query(
        `DELETE FROM agency_carrier_contracts WHERE carrier_id = ANY($1::text[]) RETURNING id`,
        [orphanIds],
      );
      const overridesDel = await client.query(
        `DELETE FROM agency_carrier_commission_overrides WHERE carrier_id = ANY($1::text[]) RETURNING id`,
        [orphanIds],
      );
      const carriersDel = await client.query(
        `DELETE FROM carrier_directory WHERE id = ANY($1::text[]) RETURNING code`,
        [orphanIds],
      );

      await client.query("COMMIT");

      console.log(
        `\n✓ Deleted ${carriersDel.rowCount} orphan carriers ` +
        `(${carriersDel.rows.map((r: any) => r.code).join(", ")}), ` +
        `${contractsDel.rowCount} shadow contracts, ` +
        `${overridesDel.rowCount} commission overrides.`,
      );
    } catch (err) {
      try { await client.query("ROLLBACK"); } catch { /* ignore */ }
      console.error("\n✗ Transaction rolled back:", err);
      process.exitCode = 1;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

main();
