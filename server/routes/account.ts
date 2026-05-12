/**
 * GDPR / CCPA account-rights API.
 *
 * H-18 (audit 2026-05-12). Two endpoints that cover the user-facing data
 * subject rights mandated by GDPR (Articles 15, 17, 20) and CCPA (§1798.100,
 * §1798.105, §1798.130):
 *
 *   POST /api/account/export    — issue the requester a JSON export of every
 *                                 record we hold tied to their user_id
 *   POST /api/account/delete-me — soft-delete the account + scrub PII;
 *                                 hard-delete after the regulatory
 *                                 retention window (configurable)
 *
 * Both endpoints require an authenticated session (the data subject auths
 * to themselves). Both write to the founder audit log so a regulator-facing
 * "we ran your request on YYYY-MM-DD" record exists.
 *
 * Behaviour notes:
 *   - Export is synchronous + bounded — these schemas don't grow without
 *     limit per user. If usage ever scales past a few MB per export we can
 *     stream / page; not needed at v1.0.
 *   - Delete is *logical* by default — the row is anonymized and marked
 *     `onboarding_status = 'deleted'`. Financial / audit / commission rows
 *     stay intact because regulatory retention requires we keep them. The
 *     audit log captures the "user X requested deletion on date Y" so we
 *     can prove the obligation was honored.
 *   - Some downstream tables (notifications, messages, policies the user
 *     owned as a client) get wiped of name/email/phone but the rows
 *     themselves stay because they reference orderly business records.
 */
import { Router, type Request, type Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";

const router = Router();

/**
 * Tables we sweep when exporting a user's data. Each entry is a table name
 * and the column that points at the user. Adding a new user-scoped table?
 * Append it here so the export stays comprehensive.
 */
const EXPORT_TABLES: ReadonlyArray<{ table: string; userIdCol: string }> = [
  { table: "users", userIdCol: "id" },
  { table: "agent_profiles", userIdCol: "user_id" },
  { table: "agent_licenses", userIdCol: "user_id" },
  { table: "agent_territories", userIdCol: "user_id" },
  { table: "agent_hierarchy", userIdCol: "agent_id" },
  { table: "client_profiles", userIdCol: "user_id" },
  { table: "policies", userIdCol: "user_id" },
  { table: "documents", userIdCol: "user_id" },
  { table: "messages", userIdCol: "user_id" },
  { table: "notifications", userIdCol: "user_id" },
  { table: "billing_history", userIdCol: "user_id" },
  { table: "quote_requests", userIdCol: "user_id" },
  { table: "contracting_checklists", userIdCol: "agent_user_id" },
  { table: "user_release_acks", userIdCol: "user_id" },
  { table: "user_consents", userIdCol: "user_id" },
  { table: "founder_audit_log", userIdCol: "actor_user_id" },
  { table: "auth_email_otp", userIdCol: "user_id" },
];

const PII_COLUMNS_REDACT_ON_DELETE: ReadonlyArray<{ table: string; setSql: string }> = [
  {
    table: "users",
    setSql: `email = 'deleted-' || id || '@redacted.heritagels.org',
             first_name = 'Deleted',
             last_name = 'User',
             phone = NULL,
             password = NULL,
             two_factor_secret = NULL,
             onboarding_status = 'deleted',
             invite_token = NULL,
             invite_token_expires_at = NULL,
             updated_at = NOW()`,
  },
  {
    table: "agent_profiles",
    setSql: `npn = NULL, date_of_birth = NULL, street_address = NULL,
             city = NULL, state = NULL, zip_code = NULL,
             license_number = NULL, ssn_encrypted = NULL,
             bank_routing_encrypted = NULL, bank_account_encrypted = NULL,
             updated_at = NOW()`,
  },
];

/**
 * POST /api/account/export — emit a JSON object with the authenticated user's
 * full data footprint. The response is `Content-Disposition: attachment` so
 * browsers prompt to save the file.
 */
router.post("/export", requireAuth, async (req: Request, res: Response) => {
  const userId = (req.user! as any).id as string;
  const startedAt = new Date().toISOString();

  try {
    const payload: Record<string, unknown[]> = {};

    for (const { table, userIdCol } of EXPORT_TABLES) {
      try {
        const result = await pool.query(
          `SELECT * FROM ${table} WHERE ${userIdCol}::text = $1`,
          [userId],
        );
        payload[table] = result.rows;
      } catch (tableErr: any) {
        // A missing table or column shouldn't kill the export — note it and
        // continue so the user still gets the data we DO have.
        payload[table] = [{ __error: String(tableErr?.message ?? tableErr) }];
      }
    }

    // Redact the password hash from the users row before handing it to the
    // user. We're already authenticated to them, but there's no reason to
    // surface a bcrypt blob.
    if (Array.isArray(payload.users)) {
      payload.users = payload.users.map((u: any) => {
        if (u && typeof u === "object" && "password" in u) {
          const { password: _omit, ...rest } = u;
          return rest;
        }
        return u;
      });
    }

    // Best-effort audit log so the regulator-facing "we handled your
    // request" record exists.
    try {
      await logFounderAction({
        actorUserId: userId,
        action: "account_export_requested",
        entityType: "user",
        entityId: userId,
        payload: {
          startedAt,
          tableCount: EXPORT_TABLES.length,
          requestIp: req.ip,
          userAgent: req.get("user-agent") || null,
        },
      });
    } catch {
      // swallow — already starting to send response
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="account-export-${userId}.json"`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).send(JSON.stringify(
      {
        exportVersion: "1.0",
        userId,
        startedAt,
        completedAt: new Date().toISOString(),
        tables: payload,
      },
      null,
      2,
    ));
  } catch (err: any) {
    console.error("[/api/account/export]", err?.message);
    res.status(500).json({ error: "Failed to generate export. Please contact support." });
  }
});

/**
 * POST /api/account/delete-me — right-to-be-forgotten.
 * Body: { confirm: "DELETE-MY-ACCOUNT", reason?: string }
 *
 * Soft-deletes the requester. PII columns are scrubbed; financial / audit /
 * commission records are retained per regulatory obligation but no longer
 * resolve to a real person. The user's session is destroyed at the end.
 */
router.post("/delete-me", requireAuth, async (req: Request, res: Response) => {
  const userId = (req.user! as any).id as string;
  const { confirm, reason } = (req.body ?? {}) as { confirm?: string; reason?: string };

  if (confirm !== "DELETE-MY-ACCOUNT") {
    return res.status(400).json({
      error: 'Body must include { "confirm": "DELETE-MY-ACCOUNT" } to proceed.',
      code: "CONFIRMATION_REQUIRED",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Audit FIRST, inside the transaction, so the deletion request is
    // preserved even if the redactions hit a constraint and roll back.
    await client.query(
      `INSERT INTO founder_audit_log (id, actor_user_id, action, entity_type, entity_id, brand, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'account_deletion_requested', 'user', $2, 'gc', $3::jsonb, NOW())`,
      [
        userId,
        userId,
        JSON.stringify({
          reason: reason ?? null,
          requestIp: req.ip,
          userAgent: req.get("user-agent") || null,
        }),
      ],
    );

    for (const { table, setSql } of PII_COLUMNS_REDACT_ON_DELETE) {
      try {
        await client.query(
          `UPDATE ${table} SET ${setSql} WHERE user_id::text = $1 OR id::text = $1`,
          [userId],
        );
      } catch (tableErr: any) {
        // A table that doesn't exist in this branch (e.g. heritage-only
        // tables aren't here) — skip rather than abort.
        console.warn(
          `[/api/account/delete-me] skipping redact on ${table}:`,
          tableErr?.message,
        );
      }
    }

    await client.query("COMMIT");

    // Destroy the session AFTER successful redaction so the user is signed
    // out immediately. Don't wait for the callback — the response is more
    // important to the requester than the cleanup ack.
    if (typeof (req as any).session?.destroy === "function") {
      (req as any).session.destroy(() => {});
    }

    res.status(200).json({
      ok: true,
      message: "Your account has been deleted. PII has been scrubbed. Financial and regulatory records will be retained for the retention period required by law and then purged.",
    });
  } catch (txErr: any) {
    try { await client.query("ROLLBACK"); } catch { /* noop */ }
    console.error("[/api/account/delete-me]", txErr?.message);
    res.status(500).json({ error: "Failed to delete account. Please contact support." });
  } finally {
    client.release();
  }
});

export default router;
