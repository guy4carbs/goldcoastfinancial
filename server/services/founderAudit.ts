import { pool } from "../db";
import type { PoolClient } from "pg";

export interface LogFounderActionParams {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  brand?: "gc" | "heritage" | "both";
  payload?: any;
  viewingAs?: string | null;
  /**
   * Optional postgres client — when provided, the audit INSERT runs inside the
   * caller's transaction. This lets write routes enforce Helix H5 "transactional
   * audit": the underlying mutation and its audit row either both succeed or
   * both roll back, so audit-write failure no longer silently decouples from
   * the action itself.
   *
   * When omitted, the audit row is written via the shared pool (best-effort,
   * backward-compatible for non-critical audits).
   */
  client?: PoolClient;
}

/**
 * Writes an entry to founder_audit_log. Every Founders-scope write route calls
 * this. Behavior depends on whether a transactional `client` is supplied:
 *
 *  - `client` provided: the insert runs on that client and errors PROPAGATE
 *    (so the caller's transaction rolls back if the audit fails — Helix H5).
 *  - `client` omitted: the insert runs on the shared pool. Failures are logged
 *    but do not propagate — preserves the pre-H5 "never block action on audit
 *    failure" behavior for non-transactional callers.
 */
export async function logFounderAction(params: LogFounderActionParams): Promise<void> {
  const {
    actorUserId,
    action,
    entityType,
    entityId = null,
    brand = "gc",
    payload = null,
    viewingAs = null,
    client,
  } = params;

  const sql = `INSERT INTO founder_audit_log
         (id, actor_user_id, action, entity_type, entity_id, brand, payload, viewing_as, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`;
  const values = [
    actorUserId,
    action,
    entityType,
    entityId,
    brand,
    payload ? JSON.stringify(payload) : null,
    viewingAs,
  ];

  if (client) {
    // Transactional path: propagate errors so the caller's transaction rolls back.
    await client.query(sql, values);
    return;
  }

  try {
    await pool.query(sql, values);
  } catch (e: any) {
    console.error("[FounderAudit] Failed to log action:", action, e?.message);
  }
}
