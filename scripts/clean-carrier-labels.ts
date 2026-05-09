/**
 * Clean Carrier Labels — applies the user's name-display fixes and
 * converts product_types from machine-readable snake_case to
 * human-readable title case (matching the labels the AddCarrierModal
 * uses elsewhere in the app).
 *
 * Name fixes (5 rows):
 *   ETHOS           drop "(issuing carrier: Banner Life)"
 *   INSTABRAIN      drop "(issued via InstaBrain platform)"
 *   MUTUAL_OMAHA    "Mutual of Omaha (United of Omaha Life Insurance Company)"
 *   FORESTERS       "Foresters Financial (The Independent Order of Foresters)"
 *   SBLI            simple "SBLI (Savings Bank Life Insurance)"
 *
 * Product label fixes (all 20 rows): snake_case → "Title Case"
 *   term_life            → "Term Life"
 *   indexed_universal_life → "Indexed Universal Life"
 *   medicare_supplement  → "Medicare Supplement"
 *   etc.
 *
 * Atomic — single BEGIN/COMMIT. Idempotent against re-run. Default
 * is dry-run; pass --apply to actually write.
 *
 * Run: `npx tsx scripts/clean-carrier-labels.ts [--apply]`
 */
import "dotenv/config";
import { pool } from "../server/db";

// ─── Name fixes ────────────────────────────────────────────────────────────
const NAME_FIXES: ReadonlyArray<{ code: string; legalName: string }> = [
  { code: "ETHOS",          legalName: "Ethos Technologies Inc." },
  { code: "INSTABRAIN",     legalName: "Fidelity Life Association" },
  { code: "MUTUAL_OMAHA",   legalName: "Mutual of Omaha (United of Omaha Life Insurance Company)" },
  { code: "FORESTERS",      legalName: "Foresters Financial (The Independent Order of Foresters)" },
  { code: "SBLI",           legalName: "SBLI (Savings Bank Life Insurance)" },
];

// ─── Product label normalization ───────────────────────────────────────────
// Map snake_case stored values → friendly display labels (no underscores,
// proper capitalization, common-acronym handling).
const PRODUCT_LABEL_MAP: Record<string, string> = {
  term_life:                 "Term Life",
  whole_life:                "Whole Life",
  universal_life:            "Universal Life",
  indexed_universal_life:    "Indexed Universal Life",
  variable_universal_life:   "Variable Universal Life",
  final_expense:             "Final Expense",
  guaranteed_issue:          "Guaranteed Issue",
  simplified_issue:          "Simplified Issue",
  annuity:                   "Annuity",
  fixed_indexed_annuity:     "Fixed Indexed Annuity",
  mga:                       "MYGA",
  ltc:                       "LTC",
  medicare_supplement:       "Medicare Supplement",
  dental:                    "Dental",
  disability:                "Disability",
  hospital_indemnity:        "Hospital Indemnity",
  cancer_indemnity:          "Cancer Indemnity",
  accident:                  "Accident",
};

function friendlyProducts(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === "string")
    .map((v) => PRODUCT_LABEL_MAP[v] ?? toTitleCase(v));
}

function toTitleCase(s: string): string {
  // Fallback for unknown values: snake_case → Title Case.
  return s
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n${apply ? "🟢 APPLY MODE" : "🟡 DRY-RUN — pass --apply to actually write"}\n`);

  const client = await pool.connect();
  try {
    const all = await client.query(
      `SELECT code, name, product_types FROM carrier_directory ORDER BY name`,
    );

    console.log("Name changes:\n");
    const fixesByCode = new Map(NAME_FIXES.map((f) => [f.code, f.legalName]));
    for (const row of all.rows) {
      const newName = fixesByCode.get(row.code);
      if (!newName) continue;
      console.log(`  ${row.code}`);
      console.log(`    BEFORE: ${row.name}`);
      console.log(`     AFTER: ${newName}`);
    }

    console.log("\nProduct label changes (all carriers):\n");
    for (const row of all.rows) {
      const beforeArr = Array.isArray(row.product_types) ? row.product_types : [];
      const after = friendlyProducts(row.product_types);
      if (beforeArr.length === 0 && after.length === 0) continue;
      const beforeStr = beforeArr.join(", ") || "(none)";
      const afterStr = after.join(", ") || "(none)";
      if (beforeStr === afterStr) continue;
      console.log(`  ${row.code}`);
      console.log(`    BEFORE: ${beforeStr}`);
      console.log(`     AFTER: ${afterStr}`);
    }

    if (!apply) {
      console.log("\n(Dry run only — no changes written. Re-run with --apply to commit.)\n");
      return;
    }

    await client.query("BEGIN");

    // 1. Apply name fixes.
    for (const f of NAME_FIXES) {
      await client.query(
        `UPDATE carrier_directory SET name = $2, updated_at = NOW() WHERE code = $1`,
        [f.code, f.legalName],
      );
    }

    // 2. Reformat product_types for every row.
    for (const row of all.rows) {
      const cleaned = friendlyProducts(row.product_types);
      await client.query(
        `UPDATE carrier_directory
            SET product_types = $2::jsonb,
                updated_at = NOW()
          WHERE code = $1`,
        [row.code, JSON.stringify(cleaned)],
      );
    }

    await client.query("COMMIT");

    const after = await client.query(
      `SELECT code, name, product_types FROM carrier_directory ORDER BY name`,
    );
    console.log(`\n✓ Cleanup complete. ${after.rowCount} rows reflect the new labels:\n`);
    for (const r of after.rows) {
      const products = Array.isArray(r.product_types) ? r.product_types : [];
      console.log(`  ${r.name}`);
      console.log(`    [${products.join(", ") || "(none)"}]`);
    }
    console.log();
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error("\n✗ Transaction rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

main();
