/**
 * scripts/seed-agency-fixtures.ts
 *
 * One-shot seeder to make /hcms/agent/requests functional for the founder
 * (and any agent that resolves to the root agency).
 *
 * Why this exists
 * ---------------
 * Two empty-states were blocking the page:
 *   1. agency_carrier_contracts is empty for the root agency, so
 *      GET /api/agent-portal/carriers/available returns []  →  carrier
 *      picker shows "Your agency doesn't have any active carrier contracts".
 *   2. The founder (guy4carbs@gmail.com) has no agent_profiles row, so
 *      `licensed_states` is null  →  "No licensed states on file."
 *
 * What it seeds
 * -------------
 *   • Three ACTIVE agency_carrier_contracts on the root agency
 *     (ROOT_AGENCY_ID = 00000000-0000-4000-8000-000000000001):
 *       - Mutual of Omaha Insurance Company
 *       - Americo Financial Life and Annuity Insurance Company
 *       - Transamerica Life Insurance Company
 *           NOTE: The original task spec asked for Foresters as the third
 *           carrier, but carrier_directory has no Foresters entry today.
 *           Transamerica was substituted because it is (a) already in the
 *           directory, (b) is_active=true, and (c) is a real third carrier
 *           Gold Coast would plausibly contract with for FE/term life.
 *           Add Foresters to carrier_directory and re-run if you want it.
 *
 *   • One agent_profiles row for guy4carbs@gmail.com, populated with
 *     gate-passing values so View-As-Agent / direct-agent-route works.
 *
 * Schema reality vs. the original task SQL
 * ----------------------------------------
 * The task SQL spec was written assuming jsonb / int / date columns. The
 * live DB has different types; this script honors the DB:
 *   - agent_profiles.licensed_states     = text[]   (NOT jsonb)
 *   - agent_profiles.eo_coverage_amount  = varchar  (NOT integer)
 *   - agent_profiles.ce_expiration_date  = varchar  (NOT date)
 *   - agent_profiles.is_licensed         = varchar  (NOT boolean)
 *   - agent_profiles.user_id             = varchar  with UNIQUE constraint
 *                                          (used as ON CONFLICT key)
 *   - agency_carrier_contracts.states_authorized = jsonb (matches spec)
 *
 * Idempotent: re-running upserts the same rows.
 */

import "dotenv/config";
import { pool } from "../server/db";

const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";
const FOUNDER_EMAIL = "guy4carbs@gmail.com";

// Carrier names we want to seed contracts for. Order matters — first match
// per name wins (we ILIKE-search to be tolerant of exact directory naming).
// The spec asked for Foresters, but it's not in carrier_directory; Transamerica
// is substituted (see file header for rationale).
const CARRIER_TARGETS: Array<{ key: string; pattern: string; shortCode: string }> = [
  { key: "Mutual of Omaha", pattern: "%mutual of omaha%", shortCode: "MOO" },
  { key: "Americo",         pattern: "%americo%",         shortCode: "AMR" },
  { key: "Transamerica",    pattern: "%transamerica%",    shortCode: "TRA" },
];

const STATES = ["CA", "FL", "TX", "GA", "NV", "AZ"];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ───────────────────────────────────────────────────────────────────────
    // Resolve founder user_id
    // ───────────────────────────────────────────────────────────────────────
    const u = await client.query(
      `SELECT id::text AS id, email FROM users WHERE email = $1 LIMIT 1`,
      [FOUNDER_EMAIL],
    );
    if (u.rows.length === 0) {
      throw new Error(`Founder user not found: ${FOUNDER_EMAIL}. Run scripts/seed-founders.ts first.`);
    }
    const founderId: string = u.rows[0].id;
    console.log(`Founder: ${FOUNDER_EMAIL}  id=${founderId}`);

    // ───────────────────────────────────────────────────────────────────────
    // Verify root agency exists
    // ───────────────────────────────────────────────────────────────────────
    const agencyRes = await client.query(
      `SELECT id::text AS id, name FROM agencies WHERE id = $1::uuid`,
      [ROOT_AGENCY_ID],
    );
    if (agencyRes.rows.length === 0) {
      throw new Error(
        `Root agency ${ROOT_AGENCY_ID} not found. Migration 0011_agency_management.sql must be applied first.`,
      );
    }
    console.log(`Root agency: ${agencyRes.rows[0].name} (${agencyRes.rows[0].id})`);

    // ───────────────────────────────────────────────────────────────────────
    // STEP 1 — Seed/upsert 3 active agency_carrier_contracts
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n=== STEP 1 — agency_carrier_contracts ===");

    for (const target of CARRIER_TARGETS) {
      const c = await client.query(
        `SELECT id, name FROM carrier_directory
          WHERE name ILIKE $1 AND is_active = true
          ORDER BY name LIMIT 1`,
        [target.pattern],
      );
      if (c.rows.length === 0) {
        console.warn(`  [skip] No active carrier matching ${target.key}.`);
        continue;
      }
      const carrierId: string = c.rows[0].id;
      const carrierName: string = c.rows[0].name;
      // Build a friendly liaison email host from the carrier's short code.
      const liaisonEmail = `liaison@${target.key.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example.com`;
      const writingNumber = `GC-${target.shortCode}-001`;

      await client.query(
        `INSERT INTO agency_carrier_contracts (
            agency_id, carrier_id, status,
            mpa_effective_date, mpa_expiration_date,
            primary_contact_name, primary_contact_email, primary_contact_phone,
            states_authorized, writing_number, notes,
            created_by_user_id
         ) VALUES (
            $1::uuid, $2, 'active',
            '2026-01-01', '2027-01-01',
            'Carrier Liaison', $3, '(800) 555-0100',
            $4::jsonb, $5,
            'Seeded by scripts/seed-agency-fixtures.ts',
            $6::uuid
         )
         ON CONFLICT (agency_id, carrier_id) DO UPDATE SET
            status = 'active',
            mpa_effective_date  = EXCLUDED.mpa_effective_date,
            mpa_expiration_date = EXCLUDED.mpa_expiration_date,
            primary_contact_name  = EXCLUDED.primary_contact_name,
            primary_contact_email = EXCLUDED.primary_contact_email,
            primary_contact_phone = EXCLUDED.primary_contact_phone,
            states_authorized = EXCLUDED.states_authorized,
            writing_number    = EXCLUDED.writing_number,
            notes             = EXCLUDED.notes,
            updated_at        = NOW()`,
        [
          ROOT_AGENCY_ID,
          carrierId,
          liaisonEmail,
          JSON.stringify(STATES),
          writingNumber,
          founderId,
        ],
      );
      console.log(`  [ok]   ${carrierName}  (carrier_id=${carrierId})  writing#=${writingNumber}`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // STEP 2 — Upsert agent_profiles row for the founder
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n=== STEP 2 — agent_profiles upsert for founder ===");

    // licensed_states is text[]; we pass an array literal via parameter.
    // is_licensed is varchar in this DB (legacy), so 'true' as text.
    // eo_coverage_amount and ce_expiration_date are also varchar.
    await client.query(
      `INSERT INTO agent_profiles (
          user_id, npn, is_licensed, license_number,
          license_expiration_date, licensed_states,
          eo_provider, eo_policy_number, eo_effective_date, eo_expiration_date,
          eo_coverage_amount,
          ce_expiration_date,
          aml_certificate_s3_key,
          street_address, city, state, zip_code,
          date_of_birth,
          approval_status, agreed_to_terms, agreed_to_privacy
       ) VALUES (
          $1, $2, $3, $4,
          $5::date, $6::text[],
          $7, $8, $9::date, $10::date,
          $11,
          $12,
          $13,
          $14, $15, $16, $17,
          $18::date,
          'approved', true, true
       )
       ON CONFLICT (user_id) DO UPDATE SET
          npn                     = EXCLUDED.npn,
          is_licensed             = EXCLUDED.is_licensed,
          license_number          = COALESCE(agent_profiles.license_number, EXCLUDED.license_number),
          license_expiration_date = EXCLUDED.license_expiration_date,
          licensed_states         = EXCLUDED.licensed_states,
          eo_provider             = COALESCE(agent_profiles.eo_provider, EXCLUDED.eo_provider),
          eo_policy_number        = COALESCE(agent_profiles.eo_policy_number, EXCLUDED.eo_policy_number),
          eo_effective_date       = COALESCE(agent_profiles.eo_effective_date, EXCLUDED.eo_effective_date),
          eo_expiration_date      = EXCLUDED.eo_expiration_date,
          eo_coverage_amount      = EXCLUDED.eo_coverage_amount,
          ce_expiration_date      = EXCLUDED.ce_expiration_date,
          aml_certificate_s3_key  = COALESCE(agent_profiles.aml_certificate_s3_key, EXCLUDED.aml_certificate_s3_key),
          street_address          = COALESCE(agent_profiles.street_address, EXCLUDED.street_address),
          city                    = COALESCE(agent_profiles.city, EXCLUDED.city),
          state                   = COALESCE(agent_profiles.state, EXCLUDED.state),
          zip_code                = COALESCE(agent_profiles.zip_code, EXCLUDED.zip_code),
          date_of_birth           = COALESCE(agent_profiles.date_of_birth, EXCLUDED.date_of_birth),
          approval_status         = 'approved',
          updated_at              = NOW()`,
      [
        founderId,                  // $1  user_id (varchar)
        "12345678",                 // $2  npn
        "true",                     // $3  is_licensed (legacy varchar)
        "GC-LIC-12345",             // $4  license_number
        "2027-12-31",               // $5  license_expiration_date (date)
        STATES,                     // $6  licensed_states (text[])
        "Tokio Marine HCC",         // $7  eo_provider
        "EO-2026-001",              // $8  eo_policy_number
        "2026-01-01",               // $9  eo_effective_date
        "2027-12-31",               // $10 eo_expiration_date
        "1000000",                  // $11 eo_coverage_amount (DOLLARS, varchar)
        "2027-06-30",               // $12 ce_expiration_date (varchar)
        "documents/seed/aml-cert-placeholder.pdf", // $13 aml_certificate_s3_key
        "123 Founder Way",          // $14 street_address
        "Austin",                   // $15 city
        "TX",                       // $16 state
        "78701",                    // $17 zip_code
        "1985-01-01",               // $18 date_of_birth (date)
      ],
    );
    console.log("  [ok]   founder agent_profiles upserted.");

    await client.query("COMMIT");

    // ───────────────────────────────────────────────────────────────────────
    // STEP 3 — Verify
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n=== STEP 3 — Verification ===");

    const accCount = await client.query(
      `SELECT COUNT(*)::int AS n
         FROM agency_carrier_contracts
        WHERE agency_id = $1::uuid AND status = 'active'`,
      [ROOT_AGENCY_ID],
    );
    console.log(`Active root-agency carrier contracts: ${accCount.rows[0].n} (expected 3)`);

    const accRows = await client.query(
      `SELECT acc.carrier_id, cd.name, acc.writing_number, acc.states_authorized,
              acc.mpa_effective_date, acc.mpa_expiration_date
         FROM agency_carrier_contracts acc
         LEFT JOIN carrier_directory cd ON cd.id::text = acc.carrier_id::text
        WHERE acc.agency_id = $1::uuid
        ORDER BY cd.name`,
      [ROOT_AGENCY_ID],
    );
    for (const r of accRows.rows) {
      console.log(`  - ${r.name}  writing=${r.writing_number}  states=${JSON.stringify(r.states_authorized)}`);
    }

    const apRow = await client.query(
      `SELECT user_id, npn, is_licensed, license_number, license_expiration_date,
              licensed_states, eo_provider, eo_policy_number, eo_effective_date,
              eo_expiration_date, eo_coverage_amount, ce_expiration_date,
              aml_certificate_s3_key, street_address, city, state, zip_code,
              date_of_birth, approval_status
         FROM agent_profiles
        WHERE user_id = $1`,
      [founderId],
    );
    console.log("\nFounder agent_profiles row:");
    console.log(apRow.rows[0]);

    const inTeams = await client.query(
      `SELECT agency_id FROM agency_teams WHERE manager_user_id::text = $1`,
      [founderId],
    );
    console.log(
      `\nFounder in agency_teams? ${inTeams.rowCount === 0 ? "no (will fall back to root via resolver)" : "YES — " + JSON.stringify(inTeams.rows)}`,
    );
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("\nseed-agency-fixtures complete.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("seed-agency-fixtures FAILED:", e);
    process.exit(1);
  });
