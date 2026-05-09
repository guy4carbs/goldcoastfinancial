/**
 * Enrich Carrier Directory — fill in legal_name / AM Best / NAIC /
 * product_types / notes for each of the 20 canonical carriers seeded
 * by `reset-carrier-directory.ts`.
 *
 * Lookup key is `code` (UNIQUE on the seed). Atomic — wraps every UPDATE
 * in a single BEGIN/COMMIT. Idempotent: re-running just sets the same
 * values again. Default is dry-run; pass --apply to actually write.
 *
 * Data sourced from 4 parallel research agents (AM Best portal, carrier
 * websites, AnnuityAdvantage, NAIC SBS lookups). See plan file for the
 * full source-URL audit trail.
 *
 * Run: `npx tsx scripts/enrich-carrier-directory.ts [--apply]`
 */
import "dotenv/config";
import { pool } from "../server/db";

interface CarrierEnrichment {
  code: string;
  legalName: string;
  amBestRating: string;
  naic: string | null;
  productTypes: string[];
  notes?: string;
}

const ENRICHMENTS: ReadonlyArray<CarrierEnrichment> = [
  {
    code: "AETNA",
    legalName: "Aetna Life Insurance Company",
    amBestRating: "A",
    naic: "60054",
    productTypes: ["medicare_supplement", "final_expense", "whole_life", "dental", "hospital_indemnity", "cancer_indemnity", "accident", "disability"],
    notes: "Aetna's life products to IMOs are typically issued by sister companies American Continental (ACI) and Continental Life of Brentwood (CLI), both also rated A by AM Best. ALIC itself primarily writes group life/health.",
  },
  {
    code: "AMER_AMICABLE",
    legalName: "American-Amicable Life Insurance Company of Texas",
    amBestRating: "A",
    naic: "68594",
    productTypes: ["term_life", "whole_life", "universal_life", "final_expense", "simplified_issue", "annuity"],
    notes: "Subsidiary of iA Financial Group. Distributes primarily through independent agents.",
  },
  {
    code: "AMER_HOME_LIFE",
    legalName: "American Home Life Insurance Company",
    amBestRating: "B++",
    naic: null,
    productTypes: ["term_life", "whole_life", "final_expense", "annuity", "medicare_supplement"],
    notes: "Founded 1909, Topeka KS, mutual company. NAIC unconfirmed via primary source — verify before contracting.",
  },
  {
    code: "AMERICO",
    legalName: "Americo Financial Life and Annuity Insurance Company",
    amBestRating: "A",
    naic: "61999",
    productTypes: ["term_life", "whole_life", "universal_life", "final_expense", "simplified_issue", "annuity", "fixed_indexed_annuity", "medicare_supplement"],
    notes: "Stable Outlook. Domiciled Texas, HQ Kansas City MO. Strong in mortgage protection, final expense, MYGA, and FIA.",
  },
  {
    code: "BALTIMORE",
    legalName: "The Baltimore Life Insurance Company",
    amBestRating: "B++",
    naic: "61212",
    productTypes: ["term_life", "whole_life", "universal_life", "final_expense", "simplified_issue", "annuity"],
    notes: "Distributes through Career Agency Sales Group (Mid-Atlantic) and independent agents nationwide.",
  },
  {
    code: "BANNER_LIFE",
    legalName: "Banner Life Insurance Company",
    amBestRating: "A+",
    naic: "94250",
    productTypes: ["term_life", "universal_life"],
    notes: "Subsidiary of Legal & General America. Primarily a term + UL writer.",
  },
  {
    code: "COREBRIDGE",
    legalName: "American General Life Insurance Company (Corebridge Financial)",
    amBestRating: "A",
    naic: "60488",
    productTypes: ["term_life", "universal_life", "indexed_universal_life", "final_expense", "annuity", "fixed_indexed_annuity"],
    notes: "Corebridge Financial spun off from AIG in 2022. AM Best A (Excellent) affirmed Dec 2024.",
  },
  {
    code: "ETHOS",
    legalName: "Ethos Technologies Inc. (issuing carrier: Banner Life)",
    amBestRating: "A+",
    naic: null,
    productTypes: ["term_life", "whole_life", "guaranteed_issue", "simplified_issue", "indexed_universal_life"],
    notes: "Ethos is a digital producer/TPA, not a risk-bearing insurer. Primary underwriting partner: Banner Life (rated A+). Other partners include Ameritas, John Hancock, Mutual of Omaha, Protective.",
  },
  {
    code: "FORESTERS",
    legalName: "The Independent Order of Foresters (dba Foresters Financial)",
    amBestRating: "A",
    naic: "58068",
    productTypes: ["term_life", "whole_life", "universal_life", "final_expense", "accident"],
    notes: "Fraternal benefit society. AM Best A (Excellent) affirmed Dec 16, 2025.",
  },
  {
    code: "GLOBE_LIFE",
    legalName: "Globe Life And Accident Insurance Company",
    amBestRating: "A",
    naic: "91472",
    productTypes: ["term_life", "whole_life", "final_expense", "accident", "cancer_indemnity", "hospital_indemnity", "medicare_supplement"],
    notes: "Subsidiary of Globe Life Inc. Affiliates include American Income Life, Liberty National, United American, Family Heritage (separate NAIC codes).",
  },
  {
    code: "GTL",
    legalName: "Guarantee Trust Life Insurance Company",
    amBestRating: "A",
    naic: "64211",
    productTypes: ["final_expense", "whole_life", "medicare_supplement", "hospital_indemnity", "cancer_indemnity", "accident"],
    notes: "Glenview IL. Mutual legal-reserve life insurance company.",
  },
  {
    code: "INSTABRAIN",
    legalName: "Fidelity Life Association (issued via InstaBrain platform)",
    amBestRating: "A-",
    naic: "63290",
    productTypes: ["term_life", "whole_life", "final_expense"],
    notes: "InstaBrain is a digital instant-decision underwriting platform, not a risk-bearing insurer. Issuing carrier: Fidelity Life Association (NAIC 63290, A-).",
  },
  {
    code: "LAFAYETTE",
    legalName: "The Lafayette Life Insurance Company",
    amBestRating: "A+",
    naic: "65242",
    productTypes: ["term_life", "whole_life", "universal_life", "indexed_universal_life", "annuity", "fixed_indexed_annuity"],
    notes: "Wholly-owned subsidiary of Western & Southern Financial Group. Distributes in 48 states + DC (not NY or AK).",
  },
  {
    code: "LIBERTY_BANKERS",
    legalName: "Liberty Bankers Life Insurance Company",
    amBestRating: "A-",
    naic: null,
    productTypes: ["final_expense", "term_life", "whole_life", "annuity", "fixed_indexed_annuity"],
    notes: "Part of Liberty Bankers Insurance Group (also includes Capitol Life and Continental Mutual). NAIC unconfirmed via primary source.",
  },
  {
    code: "MUTUAL_OMAHA",
    legalName: "United of Omaha Life Insurance Company (Mutual of Omaha)",
    amBestRating: "A+",
    naic: "69868",
    productTypes: ["term_life", "whole_life", "universal_life", "indexed_universal_life", "final_expense", "medicare_supplement", "annuity", "fixed_indexed_annuity", "ltc", "dental", "disability", "cancer_indemnity"],
    notes: "United of Omaha Life Insurance Company (NAIC 69868) is the primary issuing entity for life/annuity/Med Supp products to independent agents. Parent Mutual of Omaha Insurance Company (NAIC 71412) issues some health products. Both share A+ FSR.",
  },
  {
    code: "POLISH_FALCONS",
    legalName: "Polish Falcons of America",
    amBestRating: "NR",
    naic: null,
    productTypes: ["whole_life", "final_expense", "annuity", "medicare_supplement"],
    notes: "Fraternal benefit society. Not rated by AM Best (typical for small fraternals). NAIC requires direct lookup.",
  },
  {
    code: "SBLI",
    legalName: "The Savings Bank Mutual Life Insurance Company of Massachusetts",
    amBestRating: "A",
    naic: "70435",
    productTypes: ["term_life", "whole_life", "annuity"],
    notes: "Mutual life insurer. Primarily term and whole life; legacy/limited annuity activity.",
  },
  {
    code: "TRANSAMERICA",
    legalName: "Transamerica Life Insurance Company",
    amBestRating: "A",
    naic: "86231",
    productTypes: ["term_life", "whole_life", "universal_life", "indexed_universal_life", "variable_universal_life", "final_expense", "annuity", "fixed_indexed_annuity", "disability", "hospital_indemnity"],
    notes: "Major IUL/term player. LTC closed for new sales historically; current portfolio is broad life + annuity + voluntary benefits.",
  },
  {
    code: "TRINITY_LIFE",
    legalName: "Trinity Life Insurance Company",
    amBestRating: "NR",
    naic: "60227",
    productTypes: ["final_expense", "whole_life", "term_life", "annuity"],
    notes: "Oklahoma-based final-expense carrier. Not rated by AM Best at time of research — confirm before onboarding new agents.",
  },
  {
    code: "UNITED_HOME_LIFE",
    legalName: "United Home Life Insurance Company",
    amBestRating: "A",
    naic: "69922",
    productTypes: ["whole_life", "term_life", "final_expense", "simplified_issue", "guaranteed_issue"],
    notes: "Indianapolis IN. AM Best upgraded to A (Excellent) in 2024. Specialty in simplified-issue and guaranteed-issue whole life.",
  },
];

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n${apply ? "🟢 APPLY MODE" : "🟡 DRY-RUN — pass --apply to actually write"}\n`);

  const client = await pool.connect();
  try {
    // Snapshot before to show before/after diff per row.
    const before = await client.query(
      `SELECT code, name, am_best_rating, naic, product_types
         FROM carrier_directory
        WHERE code = ANY($1::text[])
        ORDER BY code`,
      [ENRICHMENTS.map((e) => e.code)],
    );
    const beforeByCode = new Map<string, any>(before.rows.map((r) => [r.code, r]));

    if (before.rowCount !== ENRICHMENTS.length) {
      const found = new Set(beforeByCode.keys());
      const missing = ENRICHMENTS.map((e) => e.code).filter((c) => !found.has(c));
      console.warn(`⚠ ${missing.length} carrier code(s) not found in directory: ${missing.join(", ")}`);
      if (!apply) console.warn("  Continuing dry-run anyway. Apply will SKIP missing codes.");
    }

    console.log(`Will update ${beforeByCode.size} carrier rows:\n`);
    for (const enrich of ENRICHMENTS) {
      const cur = beforeByCode.get(enrich.code);
      if (!cur) {
        console.log(`  [skip] ${enrich.code} — not in directory`);
        continue;
      }
      const beforeProducts = Array.isArray(cur.product_types) ? cur.product_types : [];
      console.log(`  ${enrich.code}`);
      console.log(`    BEFORE: name="${cur.name}" amBest=${cur.am_best_rating ?? "—"} naic=${cur.naic ?? "—"} products=[${beforeProducts.join(",") || "none"}]`);
      console.log(`     AFTER: name="${enrich.legalName}" amBest=${enrich.amBestRating} naic=${enrich.naic ?? "—"} products=[${enrich.productTypes.join(",")}]`);
    }

    if (!apply) {
      console.log("\n(Dry run only — no changes written. Re-run with --apply to commit.)\n");
      return;
    }

    await client.query("BEGIN");
    let updated = 0;
    for (const enrich of ENRICHMENTS) {
      const result = await client.query(
        `UPDATE carrier_directory
            SET name = $2,
                am_best_rating = $3,
                naic = $4,
                product_types = $5::jsonb,
                notes = $6,
                updated_at = NOW()
          WHERE code = $1`,
        [
          enrich.code,
          enrich.legalName,
          enrich.amBestRating,
          enrich.naic,
          JSON.stringify(enrich.productTypes),
          enrich.notes ?? null,
        ],
      );
      updated += result.rowCount ?? 0;
    }
    await client.query("COMMIT");

    const after = await client.query(
      `SELECT code, name, am_best_rating FROM carrier_directory ORDER BY name`,
    );
    console.log(`\n✓ Enrichment complete. ${updated} row(s) updated:`);
    for (const r of after.rows) {
      console.log(`  - ${r.name} (${r.code}) — AM Best ${r.am_best_rating ?? "—"}`);
    }
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
