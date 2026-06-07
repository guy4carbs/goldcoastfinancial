import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { pool } from "../db";
import { verifyUnsubscribeToken, suppress } from "../services/email";

const router = Router();

/**
 * Public unsubscribe flow (CAN-SPAM / RFC 8058).
 *
 * Mounted at /api/unsubscribe.
 * ALL endpoints are PUBLIC — no auth, no session, no CSRF.
 * The HMAC unsubscribe token is the only gate.
 *
 * GOLD COAST ADAPTATION: the Gold Coast app does NOT have the legacy
 * newsletter_subscribers / subscriber_activity tables (those live only on the
 * Heritage marketing site), so the newsletter-list flip + activity logging are
 * omitted here. Suppression (the canonical consent record) + drip-enrollment
 * teardown — the parts that depend on shared tables that DO exist — are kept.
 */

// Token shape: HMAC payload "." signature, both base64url-ish. Keep it loose
// but sane — real validation happens in verifyUnsubscribeToken().
const tokenSchema = z
  .string()
  .min(8)
  .max(2048)
  .refine((t) => t.includes("."), { message: "Malformed token" });

/** Mask an email for display: first 2 chars of local part + domain. */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return "***";
  return localPart.slice(0, 2) + "***@" + domain;
}

/** Human-readable label for an email category. */
function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    newsletter: "newsletter",
    drip_sequence: "email sequence",
    follow_up: "follow-up",
    birthday_greeting: "birthday greeting",
    recruit_invite: "recruiting",
    product_guide: "product guide",
    payment_reminder: "payment reminder",
    policy_update: "policy update",
    marketing_general: "marketing",
  };
  return labels[category] || "marketing";
}

/** True if `email` already has a suppression row that covers this category. */
async function isAlreadySuppressed(email: string, category: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT 1 FROM email_suppressions
       WHERE lower(email) = lower($1)
         AND (scope IS NULL OR scope = $2)
       LIMIT 1`,
      [email, category]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("[unsubscribe] isAlreadySuppressed query failed:", error);
    return false;
  }
}

/**
 * Shared suppression side-effects for a verified token.
 * Idempotent: safe to call repeatedly.
 *  - records a suppression row (scoped to the token's category)
 *  - marks matching email_sequence_enrollments 'unsubscribed'
 */
async function applyUnsubscribe(
  email: string,
  category: string,
  source: string
): Promise<void> {
  // 1) Suppression store (the canonical consent record).
  await suppress(email, "unsubscribed", { scope: category as any, source });

  // 2) Stop any active drip enrollments whose lead has this email.
  await pool.query(
    `UPDATE email_sequence_enrollments
        SET status = 'unsubscribed', unsubscribed_at = NOW()
      WHERE status IN ('active', 'paused')
        AND lead_id IN (SELECT id FROM leads WHERE lower(email) = lower($1))`,
    [email]
  );
}

/**
 * GET /api/unsubscribe?token=
 * Returns masked email + category + whether already suppressed.
 */
router.get("/", async (req: Request, res: Response) => {
  const parsed = tokenSchema.safeParse(req.query.token);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid unsubscribe link" });
  }

  const verified = verifyUnsubscribeToken(parsed.data);
  if (!verified) {
    return res.status(400).json({ error: "Invalid or expired unsubscribe link" });
  }

  const { email, category } = verified;
  const alreadySuppressed = await isAlreadySuppressed(email, category);

  return res.json({
    email: maskEmail(email),
    category,
    categoryLabel: categoryLabel(category),
    alreadySuppressed,
  });
});

/**
 * POST /api/unsubscribe  body: { token }
 * Suppresses the email + stops enrollments. Idempotent.
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = tokenSchema.safeParse(req.body?.token);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid unsubscribe link" });
  }

  const verified = verifyUnsubscribeToken(parsed.data);
  if (!verified) {
    return res.status(400).json({ error: "Invalid or expired unsubscribe link" });
  }

  const { email, category } = verified;
  try {
    await applyUnsubscribe(email, category, "unsubscribe_link");
    return res.json({ success: true, email: maskEmail(email) });
  } catch (error) {
    console.error("[unsubscribe] POST / failed:", error);
    return res.status(500).json({ error: "Failed to process unsubscribe" });
  }
});

/**
 * POST /api/unsubscribe/one-click  (RFC 8058 — List-Unsubscribe-Post)
 *
 * Gmail/Yahoo POST `List-Unsubscribe=One-Click` as
 * application/x-www-form-urlencoded with the token in the query string.
 * NO auth, NO CSRF, NO session. Token from req.query.token (primary)
 * or body. Always 200 on a valid token (idempotent), 400 on invalid.
 *
 * express.urlencoded() is registered globally at server/index.ts,
 * so no router-level body parser is needed here.
 */
router.post("/one-click", async (req: Request, res: Response) => {
  const rawToken = (req.query.token as string | undefined) ?? req.body?.token;
  const parsed = tokenSchema.safeParse(rawToken);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid unsubscribe link" });
  }

  const verified = verifyUnsubscribeToken(parsed.data);
  if (!verified) {
    return res.status(400).json({ error: "Invalid or expired unsubscribe link" });
  }

  const { email, category } = verified;
  try {
    await applyUnsubscribe(email, category, "unsubscribe_link");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[unsubscribe] POST /one-click failed:", error);
    // Mail providers retry on non-2xx; we've verified the token, so the
    // request is legitimate — surface 500 only on genuine server failure.
    return res.status(500).json({ error: "Failed to process unsubscribe" });
  }
});

export default router;
