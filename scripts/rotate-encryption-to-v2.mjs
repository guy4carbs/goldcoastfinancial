#!/usr/bin/env node
// Re-encrypt v1 ciphertext (env-key AES-256-GCM) into v2 (Cloud KMS envelope)
// for every column that holds Restricted data. Run once after the GCP
// Cloud KMS key is provisioned and the service-account credentials are in
// scope.
//
// Idempotent: rows already in v2 are skipped. Safe to re-run.
//
//   GCP_KMS_KEY_NAME=projects/heritagels-prod/locations/us-central1/keyRings/heritagels-prod/cryptoKeys/fields \
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json \
//   FIELD_ENCRYPTION_KEY=<existing v1 key> \
//   DATABASE_URL=... \
//   node scripts/rotate-encryption-to-v2.mjs
//
// To dry-run (count only, no writes): DRY_RUN=1 ...

import "dotenv/config";
import { Pool } from "pg";

if (!process.env.GCP_KMS_KEY_NAME && !process.env.KMS_KEY_NAME) {
  console.error("FATAL: GCP_KMS_KEY_NAME is not set. Provision the Cloud KMS key first.");
  process.exit(1);
}

// Import the encryption module from source. Run via tsx so the v2 path
// (which uses @google-cloud/kms) loads correctly.
const enc = await import("../server/services/encryptionService.ts");
const { decryptFieldUnified, encryptFieldAsync, isKmsEnabled } = enc;

if (!isKmsEnabled()) {
  console.error("FATAL: KMS not enabled despite GCP_KMS_KEY_NAME being set. Check imports.");
  process.exit(1);
}

const dryRun = process.env.DRY_RUN === "1";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// (table, primary key column, encrypted column).
// Add rows here as more columns get migrated to v2.
const TARGETS = [
  { table: "plaid_items", pk: "id", col: "access_token_encrypted", whereExtra: "deleted_at IS NULL" },
  // 2FA secrets — rotate on next login is also fine, but we may as well.
  { table: "users", pk: "id", col: "two_factor_secret", whereExtra: "two_factor_secret IS NOT NULL" },
  // SSN/banking on client_profiles — uncomment when ready to migrate.
  // { table: "client_profiles", pk: "id", col: "ssn_encrypted", whereExtra: "ssn_encrypted IS NOT NULL" },
  // { table: "client_profiles", pk: "id", col: "account_number_encrypted", whereExtra: "account_number_encrypted IS NOT NULL" },
  // { table: "client_profiles", pk: "id", col: "routing_number_encrypted", whereExtra: "routing_number_encrypted IS NOT NULL" },
];

async function migrateOne({ table, pk, col, whereExtra }) {
  const where = `${col} IS NOT NULL AND ${col} NOT LIKE 'v2:%'${whereExtra ? ` AND ${whereExtra}` : ""}`;
  const lookup = await pool.query(`SELECT ${pk} AS id, ${col} AS ct FROM ${table} WHERE ${where}`);
  console.log(`${table}.${col}: ${lookup.rows.length} rows in v1`);
  if (dryRun) return lookup.rows.length;
  let migrated = 0;
  for (const row of lookup.rows) {
    try {
      const plain = await decryptFieldUnified(row.ct);
      const v2 = await encryptFieldAsync(plain);
      await pool.query(`UPDATE ${table} SET ${col} = $1 WHERE ${pk} = $2`, [v2, row.id]);
      migrated++;
    } catch (e) {
      console.error(`  ${table}.${col} id=${row.id}: ${e.message}`);
    }
  }
  console.log(`${table}.${col}: migrated ${migrated}`);
  return migrated;
}

let total = 0;
for (const target of TARGETS) {
  total += await migrateOne(target);
}

// Audit-log a single summary row.
if (!dryRun) {
  await pool.query(
    `INSERT INTO founder_audit_log (id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at)
     VALUES (gen_random_uuid(), NULL, 'encryption_rotated_to_v2', 'encryption', NULL, 'gc', $1::jsonb, NULL, NOW())`,
    [JSON.stringify({ total, dryRun: false })],
  );
}

console.log(`Total ${dryRun ? "would migrate" : "migrated"}: ${total}`);
await pool.end();
