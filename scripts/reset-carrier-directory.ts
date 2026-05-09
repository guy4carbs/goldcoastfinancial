/**
 * Reset Carrier Directory — clean-slate the carrier_directory table and seed
 * the 20 carriers Gold Coast/Heritage actually contracts with.
 *
 * Atomic: wraps the DELETE-then-INSERT in a single transaction. If anything
 * fails, nothing changes. Idempotent against re-run via `code` UNIQUE.
 *
 * FK cleanup order matters — these tables reference carrier_directory.id
 * with NO ON DELETE clause (= RESTRICT), so they must be cleared first:
 *   - agency_carrier_contracts
 *   - agency_carrier_commission_overrides
 *   - carrier_compliance_requirements (CASCADE, but cleared explicitly for clarity)
 *
 * Run: `npx tsx scripts/reset-carrier-directory.ts`
 *      Add `--apply` to actually write; without it, prints the plan only.
 */
import "dotenv/config";
import { pool } from "../server/db";

interface CarrierSeed {
  name: string;
  shortName: string;
  code: string;
}

// 20 carriers, from the user's reference screenshots. Names verbatim.
// `short_name` mirrors `name` (column max 100). `code` is upper-snake, must be
// UNIQUE — kept short and stable so future imports don't collide.
const CARRIERS: ReadonlyArray<CarrierSeed> = [
  { name: "Aetna",                 shortName: "Aetna",                 code: "AETNA" },
  { name: "American Amicable",     shortName: "American Amicable",     code: "AMER_AMICABLE" },
  { name: "American Home Life",    shortName: "American Home Life",    code: "AMER_HOME_LIFE" },
  { name: "Americo",               shortName: "Americo",               code: "AMERICO" },
  { name: "Baltimore",             shortName: "Baltimore",             code: "BALTIMORE" },
  { name: "Banner Life",           shortName: "Banner Life",           code: "BANNER_LIFE" },
  { name: "Corebridge",            shortName: "Corebridge",            code: "COREBRIDGE" },
  { name: "Ethos",                 shortName: "Ethos",                 code: "ETHOS" },
  { name: "Foresters",             shortName: "Foresters",             code: "FORESTERS" },
  { name: "Globe Life",            shortName: "Globe Life",            code: "GLOBE_LIFE" },
  { name: "Guarantee Trust Life",  shortName: "Guarantee Trust Life",  code: "GTL" },
  { name: "InstaBrain",            shortName: "InstaBrain",            code: "INSTABRAIN" },
  { name: "Lafayette",             shortName: "Lafayette",             code: "LAFAYETTE" },
  { name: "Liberty Bankers",       shortName: "Liberty Bankers",       code: "LIBERTY_BANKERS" },
  { name: "Mutual of Omaha",       shortName: "Mutual of Omaha",       code: "MUTUAL_OMAHA" },
  { name: "Polish Falcons",        shortName: "Polish Falcons",        code: "POLISH_FALCONS" },
  { name: "SBLI",                  shortName: "SBLI",                  code: "SBLI" },
  { name: "Transamerica",          shortName: "Transamerica",          code: "TRANSAMERICA" },
  { name: "Trinity Life",          shortName: "Trinity Life",          code: "TRINITY_LIFE" },
  { name: "United Home Life",      shortName: "United Home Life",      code: "UNITED_HOME_LIFE" },
];

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n${apply ? "🟢 APPLY MODE" : "🟡 DRY-RUN — pass --apply to actually write"}\n`);

  const client = await pool.connect();
  try {
    // Snapshot before any changes.
    const before = await client.query(`SELECT id, name, code, is_active FROM carrier_directory ORDER BY name`);
    console.log(`Current carrier_directory rows: ${before.rowCount}`);
    if (before.rows.length > 0) {
      for (const r of before.rows) {
        console.log(`  - ${r.name} (${r.code}) [active=${r.is_active}]`);
      }
    } else {
      console.log("  (empty)");
    }

    const contractCount = await client.query(`SELECT COUNT(*)::int AS n FROM agency_carrier_contracts`);
    const overrideCount = await client.query(`SELECT COUNT(*)::int AS n FROM agency_carrier_commission_overrides`);
    const complianceCount = await client.query(`SELECT COUNT(*)::int AS n FROM carrier_compliance_requirements`);
    console.log(`\nDownstream FK rows that will be deleted:`);
    console.log(`  agency_carrier_contracts:             ${contractCount.rows[0].n}`);
    console.log(`  agency_carrier_commission_overrides:  ${overrideCount.rows[0].n}`);
    console.log(`  carrier_compliance_requirements:      ${complianceCount.rows[0].n}`);

    console.log(`\nWill insert ${CARRIERS.length} carriers:`);
    for (const c of CARRIERS) console.log(`  + ${c.name.padEnd(24)} (${c.code})`);

    if (!apply) {
      console.log("\n(Dry run only — no changes written. Re-run with --apply to commit.)\n");
      return;
    }

    await client.query("BEGIN");

    // 1. Clear downstream FK rows (RESTRICT default would block carrier_directory deletes).
    await client.query(`DELETE FROM agency_carrier_contracts`);
    await client.query(`DELETE FROM agency_carrier_commission_overrides`);
    await client.query(`DELETE FROM carrier_compliance_requirements`);

    // 2. Wipe the carrier directory.
    await client.query(`DELETE FROM carrier_directory`);

    // 3. Seed the 20 canonical carriers.
    for (const c of CARRIERS) {
      await client.query(
        `INSERT INTO carrier_directory (name, short_name, code, is_active)
         VALUES ($1, $2, $3, true)`,
        [c.name, c.shortName, c.code],
      );
    }

    await client.query("COMMIT");

    const after = await client.query(`SELECT name, code FROM carrier_directory ORDER BY name`);
    console.log(`\n✓ Reset complete. carrier_directory now has ${after.rowCount} rows:`);
    for (const r of after.rows) console.log(`  - ${r.name} (${r.code})`);
    console.log();
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore secondary failure
    }
    console.error("\n✗ Transaction rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

main();
