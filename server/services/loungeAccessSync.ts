/**
 * Lounge Access Sync — single source of truth for what happens when a user's
 * role changes on goldcoast (feature/hcms-foundation).
 *
 * Mirrors heritage-app's `storage.reinitializeLoungeAccess()` (heritage-app
 * server/storage.ts:2449-2476) so the shared `users` row, `user_lounge_access`
 * rows, and `access_change_log` audit row stay consistent across both
 * deployments. Without this, a role mutation on goldcoast leaves heritage-app
 * looking at stale `user_lounge_access` grants AND the SOC 2 attestation
 * trail in `access_change_log` is missing the goldcoast-side mutations.
 *
 * Atomicity contract: every effect (role write, audit row, lounge wipe,
 * lounge re-grant, founder_audit_log entry) commits or rolls back together.
 * Caller can pass an existing `client: PoolClient` to join an outer
 * transaction; otherwise the service opens its own.
 */

import type { PoolClient } from "pg";
import { pool } from "../db";
import { logFounderAction } from "./founderAudit";
import { loungesForRole } from "../../shared/models/loungeAccess";
import { storage } from "../storage";
import { sendRoleChangeEmail } from "../gmail";

export interface ReinitializeLoungeAccessParams {
  /** Target user whose role is changing. */
  userId: string;
  /** New role string (e.g. "agency_manager"). */
  newRole: string;
  /** Actor performing the mutation (founder / system_admin). */
  performedByUserId: string;
  /** Optional human-readable reason — surfaces in access_change_log + founder_audit_log. */
  reason?: string | null;
  /** Optional existing transaction client. If omitted, the service opens its own. */
  client?: PoolClient;
  /** Brand stamp for the founder_audit_log row. Defaults to 'gc'. */
  brand?: "gc" | "heritage" | "both";
  /** Wave Z8: bypass the oldRole === newRole no-op check. Used by the
   *  /reset-lounge-access endpoint to wipe stale per-user overrides and
   *  re-grant the canonical role defaults even when the role itself isn't
   *  changing. */
  force?: boolean;
}

export interface ReinitializeLoungeAccessResult {
  changed: boolean;
  oldRole: string | null;
  newRole: string;
  loungesGranted: string[];
}

/**
 * Idempotent: if newRole === current users.role, the function short-circuits
 * with `{ changed: false }` and writes nothing.
 */
export async function reinitializeLoungeAccess(
  params: ReinitializeLoungeAccessParams,
): Promise<ReinitializeLoungeAccessResult> {
  const { userId, newRole, performedByUserId, reason, brand, force } = params;
  const lounges = loungesForRole(newRole);

  // Use caller's transaction if provided; otherwise open our own.
  const ownTx = !params.client;
  const c = params.client ?? (await pool.connect());

  try {
    if (ownTx) await c.query("BEGIN");

    // 1. Read current role for the audit before/after pair.
    const cur = await c.query(`SELECT role FROM users WHERE id = $1::uuid`, [userId]);
    if (cur.rowCount === 0) {
      throw new Error(`reinitializeLoungeAccess: user ${userId} not found`);
    }
    const oldRole: string = cur.rows[0].role;

    if (oldRole === newRole && !force) {
      if (ownTx) await c.query("ROLLBACK");
      return { changed: false, oldRole, newRole, loungesGranted: lounges };
    }

    // 2. Update users.role.
    await c.query(`UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2::uuid`, [newRole, userId]);

    // 3. Audit row in access_change_log (the canonical SOC 2 attestation table).
    // Action type differentiates a true role change from a Z8 reset (same role,
    // wipe + re-grant defaults).
    const actionType = oldRole === newRole ? "lounge_reset" : "role_changed";
    await c.query(
      `INSERT INTO access_change_log (target_user_id, performed_by, action_type, previous_value, new_value, reason)
       VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5::jsonb, $6)`,
      [
        userId,
        performedByUserId,
        actionType,
        JSON.stringify({ role: oldRole }),
        JSON.stringify({ role: newRole, lounges }),
        reason ?? null,
      ],
    );

    // 4. Wipe stale lounge grants. Sets granted=false + revoked_at on every
    // currently-granted row. Heritage-app's same-named function does this
    // exactly the same way so we match its semantics.
    await c.query(
      `UPDATE user_lounge_access
         SET granted = false, granted_by = $2, revoked_at = NOW()
       WHERE user_id = $1 AND granted = true`,
      [userId, performedByUserId],
    );

    // 5. Grant the new role's lounges. UPSERT so re-promotions reuse rows.
    for (const lounge of lounges) {
      await c.query(
        `INSERT INTO user_lounge_access (user_id, lounge_key, granted, granted_by, granted_at, revoked_at)
         VALUES ($1, $2, true, $3, NOW(), NULL)
         ON CONFLICT (user_id, lounge_key)
         DO UPDATE SET granted = true, granted_by = $3, granted_at = NOW(), revoked_at = NULL`,
        [userId, lounge, performedByUserId],
      );
    }

    // 6. Founder audit log — separate from access_change_log because it carries
    // viewing-as context and feeds the Founders Access UI's audit history.
    try {
      await logFounderAction({
        actorUserId: performedByUserId,
        action: oldRole === newRole ? "lounge.reset" : "role.changed",
        entityType: "user",
        entityId: userId,
        payload: { from: oldRole, to: newRole, reason: reason ?? null, lounges },
        brand: brand ?? "gc",
        client: c,
      });
    } catch (auditErr: any) {
      // Don't fail the entire role change if audit logging hits a transient
      // error — the access_change_log row above is the SOC 2 source of truth.
      console.error("[loungeAccessSync] founder_audit_log failed:", auditErr?.message);
    }

    if (ownTx) await c.query("COMMIT");

    // Wave AA3: notify the user (portal + email) ONLY when the role actually
    // changed. Z9 force=true bulk reset (oldRole === newRole) intentionally
    // skips notifications — bulk admin actions shouldn't blast emails.
    if (oldRole !== newRole) {
      try {
        await storage.createNotification({
          userId,
          title: "Your role has been updated",
          message: `Your role is now ${newRole}.${reason ? ` Reason: ${reason}` : ""}`,
          type: "role_changed",
          actionUrl: "/agent-portal",
        });
      } catch (notifErr: any) {
        console.error("[loungeAccessSync] notification failed:", notifErr?.message);
      }

      try {
        // Use a fresh pool query (the transaction client `c` may have been
        // released by the caller's finally block in the joined-tx case).
        const u = await pool.query<{ email: string; first_name: string; last_name: string }>(
          `SELECT email, first_name, last_name FROM users WHERE id = $1::uuid`,
          [userId],
        );
        if (u.rowCount === 1) {
          await sendRoleChangeEmail({
            firstName: u.rows[0].first_name,
            lastName: u.rows[0].last_name,
            email: u.rows[0].email,
            oldRole,
            newRole,
            reason: reason ?? null,
          });
        }
      } catch (emailErr: any) {
        console.error("[loungeAccessSync] role-change email failed:", emailErr?.message);
      }
    }

    return { changed: true, oldRole, newRole, loungesGranted: lounges };
  } catch (err) {
    if (ownTx) await c.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    if (ownTx) c.release();
  }
}
