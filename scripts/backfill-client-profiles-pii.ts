// One-shot migrator. Walks every `policies.client_details::jsonb` row that has
// any of {ssn, bankRoutingNumber, bankAccountNumber, idNumber} and:
//   1. Encrypts those values via encryptField + upserts them into client_profiles
//      (ssn_encrypted, account_number_encrypted, routing_number_encrypted,
//       drivers_license_number_encrypted plus the *_last4 columns).
//   2. Strips the four plaintext keys from policies.client_details.
//
// Idempotent — once the keys are gone from JSON, re-running does nothing.
// Each row is wrapped in its own transaction so a partial failure does not
// corrupt either table.
//
// Run: `npx tsx scripts/backfill-client-profiles-pii.ts`
//      `npx tsx scripts/backfill-client-profiles-pii.ts --dry-run`

import "dotenv/config";
import pkg from "pg";
import { encryptField } from "../server/services/encryptionService";

const { Pool } = pkg;

type CandidateRow = {
  policy_id: string;
  user_id: string;
  client_details: Record<string, any>;
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const dryRun = process.argv.includes("--dry-run");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log(`[backfill-pii] starting${dryRun ? " (DRY RUN)" : ""}`);

  const candidates = await pool.query<CandidateRow>(`
    SELECT id AS policy_id, user_id, client_details
      FROM policies
     WHERE user_id IS NOT NULL
       AND client_details IS NOT NULL
       AND (
         client_details ? 'ssn'
         OR client_details ? 'bankRoutingNumber'
         OR client_details ? 'bankAccountNumber'
         OR client_details ? 'idNumber'
       )
  `);

  console.log(`[backfill-pii] candidate rows: ${candidates.rows.length}`);
  if (candidates.rows.length === 0) {
    await pool.end();
    console.log("[backfill-pii] nothing to do");
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of candidates.rows) {
    const details = row.client_details || {};
    const ssn = typeof details.ssn === "string" ? details.ssn : null;
    const routing = typeof details.bankRoutingNumber === "string" ? details.bankRoutingNumber : null;
    const account = typeof details.bankAccountNumber === "string" ? details.bankAccountNumber : null;
    // idNumber is treated as DL only when idType is drivers_license (or absent).
    const idNumberIsDl =
      typeof details.idNumber === "string" &&
      details.idNumber.length > 0 &&
      (details.idType === undefined || details.idType === null || details.idType === "drivers_license");
    const dl = idNumberIsDl ? details.idNumber : null;

    if (!ssn && !routing && !account && !dl) {
      skipped++;
      continue;
    }

    const profileCols: Record<string, any> = {};
    if (ssn) {
      const digits = ssn.replace(/\D/g, "");
      if (digits.length > 0) {
        profileCols.ssn_encrypted = encryptField(digits);
        profileCols.ssn_last4 = digits.slice(-4);
      }
    }
    if (account) {
      const acct = account.replace(/\s/g, "");
      profileCols.account_number_encrypted = encryptField(acct);
      profileCols.account_last4 = acct.slice(-4);
    }
    if (routing) {
      profileCols.routing_number_encrypted = encryptField(routing.replace(/\s/g, ""));
    }
    if (dl) {
      profileCols.drivers_license_number_encrypted = encryptField(dl);
    }

    const setCols = Object.entries(profileCols);
    if (setCols.length === 0) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(
        `[backfill-pii] DRY: policy=${row.policy_id} user=${row.user_id} keys=[${setCols.map(([k]) => k).join(", ")}]`,
      );
      migrated++;
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertCols = ["user_id", ...setCols.map(([k]) => k)];
      const insertVals = [row.user_id, ...setCols.map(([, v]) => v)];
      const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(", ");
      const updateClause = setCols.map(([k], i) => `${k} = $${i + 2}`).join(", ");

      await client.query(
        `INSERT INTO client_profiles (${insertCols.join(", ")})
         VALUES (${placeholders})
         ON CONFLICT (user_id) DO UPDATE SET
         ${updateClause}, updated_at = NOW()`,
        insertVals,
      );

      // Strip the plaintext keys from the JSON. idNumber only stripped when
      // we promoted it to drivers_license_number_encrypted above.
      const stripExpr = ["client_details - 'ssn' - 'bankRoutingNumber' - 'bankAccountNumber'"];
      if (dl) stripExpr[0] += " - 'idNumber'";
      await client.query(
        `UPDATE policies SET client_details = ${stripExpr[0]} WHERE id = $1`,
        [row.policy_id],
      );

      await client.query("COMMIT");
      migrated++;
      if (migrated % 50 === 0) {
        console.log(`[backfill-pii] migrated ${migrated}/${candidates.rows.length}`);
      }
    } catch (err: any) {
      await client.query("ROLLBACK").catch(() => {});
      failed++;
      console.error(`[backfill-pii] FAIL policy=${row.policy_id} user=${row.user_id}: ${err?.message}`);
    } finally {
      client.release();
    }
  }

  await pool.end();

  console.log(
    `[backfill-pii] done — migrated=${migrated} skipped=${skipped} failed=${failed}${dryRun ? " (DRY RUN)" : ""}`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[backfill-pii] FATAL:", err);
  process.exit(1);
});
