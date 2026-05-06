import { pool } from "../db";
import crypto from "node:crypto";

/**
 * Audit-chain verifier.
 *
 * Reads `founder_audit_log` rows in created_at order and re-computes each
 * row_hash from the recorded fields + the prior row_hash. Returns the first
 * divergence (or `{ ok: true, count }` if the chain is intact).
 *
 * Use cases:
 *   - Weekly cron run; if a divergence is reported, raise an incident.
 *   - On-demand from an audit handler.
 *   - As part of the SOC 2 Type 2 evidence package.
 *
 * Performance: one full table scan per call. The audit log is append-only
 * and small relative to data volume, so this is fine through Q3. Switch to
 * a "since last verified anchor" pattern when the table crosses 1M rows.
 */

export interface ChainVerifyResult {
  ok: boolean;
  count: number;
  /** First row whose hash didn't recompute. Undefined when ok=true. */
  divergence?: {
    rowId: string;
    expected: string;
    actual: string;
    createdAt: string;
  };
  /**
   * The most recently verified row_hash. Use this as the off-host "anchor"
   * (S3 with Object Lock, etc.) so even a successful in-DB rewrite of
   * historical rows would be detectable against the off-host record.
   */
  latestHash?: string;
}

/**
 * Build the same `prev || id || actor || ... || created_at::text` string
 * the SQL trigger uses, so the recomputed hash matches byte-for-byte. Note
 * `created_at_text` MUST come from `created_at::text` in Postgres — JS's
 * Date.toISOString() formats differently (T instead of space, milliseconds
 * vs microseconds, Z vs -04) and would always produce a divergence.
 */
function computeRowHash(row: {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  brand: string | null;
  payload: string | null;
  viewing_as: string | null;
  created_at_text: string | null;
  prev_row_hash: string | null;
}): string {
  const parts = [
    row.prev_row_hash ?? "",
    row.id,
    row.actor_user_id ?? "",
    row.action,
    row.entity_type,
    row.entity_id ?? "",
    row.brand ?? "",
    row.payload ?? "",
    row.viewing_as ?? "",
    row.created_at_text ?? "",
  ];
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function verifyAuditChain(): Promise<ChainVerifyResult> {
  // Pull `created_at::text` straight from Postgres so the verifier hashes
  // the same string the trigger hashed at insert time.
  const result = await pool.query(
    `SELECT id::text AS id,
            actor_user_id::text AS actor_user_id,
            action,
            entity_type,
            entity_id::text AS entity_id,
            brand,
            payload::text AS payload,
            viewing_as::text AS viewing_as,
            created_at::text AS created_at_text,
            row_hash,
            prev_row_hash
     FROM founder_audit_log
     ORDER BY created_at ASC, id ASC`,
  );
  let prevHash: string | null = null;
  let latestHash: string | undefined;
  let verified = 0;
  for (const row of result.rows) {
    if (row.row_hash == null) {
      // Pre-trigger row (existed before migration 0007). Walk past without
      // failing; these will exist forever.
      prevHash = null;
      continue;
    }
    const recomputed = computeRowHash({
      id: row.id,
      actor_user_id: row.actor_user_id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      brand: row.brand,
      payload: row.payload,
      viewing_as: row.viewing_as,
      created_at_text: row.created_at_text,
      prev_row_hash: prevHash,
    });
    if (recomputed !== row.row_hash) {
      return {
        ok: false,
        count: verified,
        divergence: {
          rowId: row.id,
          expected: recomputed,
          actual: row.row_hash,
          createdAt: row.created_at_text,
        },
      };
    }
    if (prevHash !== null && row.prev_row_hash !== prevHash) {
      return {
        ok: false,
        count: verified,
        divergence: {
          rowId: row.id,
          expected: String(prevHash),
          actual: String(row.prev_row_hash ?? ""),
          createdAt: row.created_at_text,
        },
      };
    }
    prevHash = row.row_hash;
    latestHash = row.row_hash;
    verified++;
  }
  return {
    ok: true,
    count: verified,
    latestHash,
  };
}
