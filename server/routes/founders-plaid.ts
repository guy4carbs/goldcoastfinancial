import express, { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import {
  requireAuth,
  requireRole,
  FOUNDERS_ONLY,
  blockWritesDuringViewAs,
} from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { encryptFieldAsync, decryptFieldUnified } from "../services/encryptionService";
import {
  createLinkToken,
  exchangePublicToken,
  getItemAndInstitution,
  syncTransactions,
  removeItem,
} from "../services/plaidClient";
import { verifyPlaidWebhook } from "../services/plaidWebhook";

/**
 * Founders Plaid routes — connect/manage a Chase business checking item,
 * stream new credits into a Pending Review tray, and let founders confirm
 * each into the founder_distributions ledger.
 *
 * Security contract:
 *   - All non-webhook routes require auth + FOUNDER role + non-view-as session.
 *   - The webhook route is verified by Plaid's JWT signature (no app session).
 *   - The Plaid access_token is encrypted at the application layer before
 *     it touches the DB and is NEVER returned over the API.
 */

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// Webhook FIRST — its raw body is needed for the JWT signature check. Mount
// this BEFORE the global auth middleware. The webhook route is guarded by
// the Plaid JWT itself, not by our session auth.
// ───────────────────────────────────────────────────────────────────────────

router.post(
  "/webhook",
  // Capture the raw body for SHA-256 verification. We re-parse JSON manually
  // afterwards so the rest of the handler still sees a usable object.
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    const rawBody: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    const headerVal = req.header("plaid-verification") || req.header("Plaid-Verification");
    const verification = await verifyPlaidWebhook(headerVal, rawBody);
    if (!verification.ok) {
      // Audit-log the rejection so we have a paper trail.
      logFounderAction({
        actorUserId: null,
        action: "plaid_webhook_rejected",
        entityType: "plaid_webhook",
        payload: { reason: verification.reason },
      }).catch(() => {});
      return res.status(401).json({ error: "Webhook verification failed" });
    }

    let body: any = {};
    try {
      body = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    // Plaid sends webhook_type/webhook_code pairs. We only care about
    // SYNC_UPDATES_AVAILABLE — the rest we ack but ignore.
    const webhookType = body.webhook_type;
    const webhookCode = body.webhook_code;
    const itemId: string | undefined = body.item_id;

    if (webhookType === "TRANSACTIONS" && webhookCode === "SYNC_UPDATES_AVAILABLE" && itemId) {
      try {
        await syncItemFromWebhook(itemId);
      } catch (e: any) {
        console.error("Plaid webhook sync error:", e?.kind || "sync_failed");
        await pool.query(`UPDATE plaid_items SET status='error', error=$1 WHERE item_id=$2`, [
          String(e?.message || "sync_failed").slice(0, 500),
          itemId,
        ]).catch(() => {});
      }
    }

    // Plaid expects a 200 quickly so it doesn't retry. Audit the receipt.
    await logFounderAction({
      actorUserId: null,
      action: "plaid_webhook_received",
      entityType: "plaid_webhook",
      payload: { webhookType, webhookCode, itemId },
    }).catch(() => {});
    res.json({ ok: true });
  },
);

// ───────────────────────────────────────────────────────────────────────────
// Founder-only routes — auth gate
// ───────────────────────────────────────────────────────────────────────────

router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

// ─── POST /link-token ─────────────────────────────────────────────────────
router.post("/link-token", async (req, res) => {
  try {
    const userId = (req as any).user?.id as string;
    const data = await createLinkToken({ userId });
    res.json({ link_token: data.link_token, expiration: data.expiration });
  } catch (e: any) {
    console.error("Plaid link-token error:", e?.message || "link_token_failed");
    res.status(500).json({ error: e?.message || "link_token_failed" });
  }
});

// ─── POST /exchange ───────────────────────────────────────────────────────
const exchangeSchema = z.object({
  public_token: z.string().min(1),
});

router.post("/exchange", blockWritesDuringViewAs, async (req, res) => {
  const parsed = exchangeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const userId = (req as any).user?.id as string;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { access_token, item_id } = await exchangePublicToken(parsed.data.public_token);
    const { institutionId, institutionName } = await getItemAndInstitution(access_token);
    // Envelope-encrypt the Plaid access_token via KMS when KMS_KEY_ID is set;
    // automatic fallback to v1 (env-key AES-256-GCM) in dev/staging.
    const accessTokenEncrypted = await encryptFieldAsync(access_token);
    const insert = await client.query(
      `INSERT INTO plaid_items (item_id, institution_id, institution_name, access_token_encrypted, created_by_user_id, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (item_id) DO UPDATE SET
         institution_id = EXCLUDED.institution_id,
         institution_name = EXCLUDED.institution_name,
         access_token_encrypted = EXCLUDED.access_token_encrypted,
         status = 'active', error = NULL, deleted_at = NULL
       RETURNING id, item_id, institution_id, institution_name, status, created_at`,
      [item_id, institutionId, institutionName, accessTokenEncrypted, userId],
    );
    const row = insert.rows[0];
    await logFounderAction({
      actorUserId: userId,
      action: "plaid_item_connected",
      entityType: "plaid_item",
      entityId: row.id,
      payload: { itemId: item_id, institutionId, institutionName },
      client,
    });
    await client.query("COMMIT");
    // Bootstrap sync after commit so the row is durably stored before we
    // start populating pending deposits.
    syncItemFromWebhook(item_id).catch((err) =>
      console.error("Plaid bootstrap sync error:", err?.kind || "sync_failed"),
    );
    res.json({
      id: row.id,
      itemId: row.item_id,
      institutionId: row.institution_id,
      institutionName: row.institution_name,
      status: row.status,
      createdAt: row.created_at,
    });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Plaid exchange error:", e?.message || "exchange_failed");
    res.status(500).json({ error: e?.message || "exchange_failed" });
  } finally {
    client.release();
  }
});

// ─── GET /items ──────────────────────────────────────────────────────────
router.get("/items", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, item_id, institution_id, institution_name, status, error, synced_at, created_at
       FROM plaid_items
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`,
    );
    res.json(
      result.rows.map((r: any) => ({
        id: r.id,
        itemId: r.item_id,
        institutionId: r.institution_id,
        institutionName: r.institution_name,
        status: r.status,
        error: r.error,
        syncedAt: r.synced_at,
        createdAt: r.created_at,
      })),
    );
  } catch (e: any) {
    console.error("Plaid items list error:", e?.message);
    res.status(500).json({ error: "items_list_failed" });
  }
});

// ─── DELETE /items/:id ───────────────────────────────────────────────────
router.delete("/items/:id", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid id" });
  const userId = (req as any).user?.id as string;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lookup = await client.query(
      `SELECT id, item_id, access_token_encrypted FROM plaid_items WHERE id=$1 AND deleted_at IS NULL`,
      [id],
    );
    if (lookup.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }
    const item = lookup.rows[0];
    let accessToken: string | null = null;
    try {
      accessToken = await decryptFieldUnified(item.access_token_encrypted);
    } catch {
      accessToken = null;
    }
    if (accessToken) {
      try {
        await removeItem(accessToken);
      } catch (e: any) {
        // Plaid may already have removed it (or the token is invalid). Don't
        // block the local cleanup on a Plaid-side error — just record it.
        console.error("Plaid item-remove error:", e?.message || "remove_failed");
      }
    }
    await client.query(
      `UPDATE plaid_items SET status='revoked', deleted_at=NOW() WHERE id=$1`,
      [id],
    );
    await logFounderAction({
      actorUserId: userId,
      action: "plaid_item_disconnected",
      entityType: "plaid_item",
      entityId: id,
      payload: { itemId: item.item_id },
      client,
    });
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Plaid item delete error:", e?.message);
    res.status(500).json({ error: "item_delete_failed" });
  } finally {
    client.release();
  }
});

// ─── GET /pending ────────────────────────────────────────────────────────
router.get("/pending", async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const result = await pool.query(
      `SELECT p.id, p.plaid_tx_id, p.account_id, p.posted_date, p.amount_cents,
              p.merchant_name, p.description, p.payment_channel, p.status,
              p.created_at, i.institution_name
       FROM plaid_pending_deposits p
       LEFT JOIN plaid_items i ON i.id = p.item_id
       WHERE p.status = 'pending'
       ORDER BY p.posted_date DESC, p.created_at DESC
       LIMIT $1`,
      [limit],
    );
    res.json(
      result.rows.map((r: any) => ({
        id: r.id,
        plaidTxId: r.plaid_tx_id,
        accountId: r.account_id,
        postedDate:
          r.posted_date instanceof Date
            ? r.posted_date.toISOString().slice(0, 10)
            : r.posted_date,
        amountCents: Number(r.amount_cents),
        merchantName: r.merchant_name,
        description: r.description,
        paymentChannel: r.payment_channel,
        status: r.status,
        institutionName: r.institution_name,
        createdAt: r.created_at,
      })),
    );
  } catch (e: any) {
    console.error("Plaid pending list error:", e?.message);
    res.status(500).json({ error: "pending_list_failed" });
  }
});

// ─── POST /pending/:id/confirm ───────────────────────────────────────────
const confirmSchema = z.object({
  source: z.enum(["commission", "override", "other"]).default("commission"),
  note: z.string().max(2000).optional(),
});

router.post("/pending/:id/confirm", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = confirmSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const userId = (req as any).user?.id as string;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lookup = await client.query(
      `SELECT id, posted_date, amount_cents, merchant_name, status
       FROM plaid_pending_deposits WHERE id=$1 FOR UPDATE`,
      [id],
    );
    if (lookup.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }
    const row = lookup.rows[0];
    if (row.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Already reviewed" });
    }
    const depositDate =
      row.posted_date instanceof Date
        ? row.posted_date.toISOString().slice(0, 10)
        : row.posted_date;
    const amountCents = Number(row.amount_cents);
    if (amountCents <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Amount must be positive" });
    }
    const noteFromBody = parsed.data.note?.trim();
    const note =
      noteFromBody ||
      (row.merchant_name ? `Plaid: ${row.merchant_name}` : "Imported from Plaid");
    const insertDist = await client.query(
      `INSERT INTO founder_distributions
         (deposit_date, amount_cents, source, estimated_amount_cents, note, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, deposit_date, amount_cents`,
      [depositDate, amountCents, parsed.data.source, amountCents, note, userId],
    );
    const newDist = insertDist.rows[0];
    await client.query(
      `UPDATE plaid_pending_deposits
       SET status='confirmed', promoted_distribution_id=$1, reviewed_by_user_id=$2, reviewed_at=NOW()
       WHERE id=$3`,
      [newDist.id, userId, id],
    );
    await logFounderAction({
      actorUserId: userId,
      action: "plaid_pending_confirmed",
      entityType: "plaid_pending_deposit",
      entityId: id,
      payload: {
        promotedDistributionId: newDist.id,
        amountCents,
        source: parsed.data.source,
      },
      client,
    });
    await client.query("COMMIT");
    res.json({ ok: true, distributionId: newDist.id });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Plaid confirm error:", e?.message);
    res.status(500).json({ error: "confirm_failed" });
  } finally {
    client.release();
  }
});

// ─── POST /pending/:id/skip ──────────────────────────────────────────────
router.post("/pending/:id/skip", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid id" });
  const userId = (req as any).user?.id as string;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const update = await client.query(
      `UPDATE plaid_pending_deposits
       SET status='declined', reviewed_by_user_id=$1, reviewed_at=NOW()
       WHERE id=$2 AND status='pending'
       RETURNING id`,
      [userId, id],
    );
    if (update.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found or already reviewed" });
    }
    await logFounderAction({
      actorUserId: userId,
      action: "plaid_pending_declined",
      entityType: "plaid_pending_deposit",
      entityId: id,
      client,
    });
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Plaid skip error:", e?.message);
    res.status(500).json({ error: "skip_failed" });
  } finally {
    client.release();
  }
});

export default router;

// ───────────────────────────────────────────────────────────────────────────
// Internal — sync transactions for an Item, idempotently inserting credits
// into plaid_pending_deposits.
//
// Plaid's transaction model uses positive amounts for DEBITS and negative for
// credits. We invert the sign and only enqueue net credits (amount > 0 after
// inversion). Idempotency lives on plaid_pending_deposits.plaid_tx_id (UNIQUE),
// so re-running a sync with overlapping cursors is safe.
// ───────────────────────────────────────────────────────────────────────────
async function syncItemFromWebhook(plaidItemId: string): Promise<void> {
  const lookup = await pool.query(
    `SELECT id, access_token_encrypted, cursor FROM plaid_items WHERE item_id=$1 AND deleted_at IS NULL`,
    [plaidItemId],
  );
  if (lookup.rowCount === 0) return;
  const localId = lookup.rows[0].id as string;
  const accessToken = await decryptFieldUnified(lookup.rows[0].access_token_encrypted as string);
  let cursor: string | null = lookup.rows[0].cursor as string | null;

  let hasMore = true;
  let safetyCounter = 0;
  while (hasMore && safetyCounter < 50) {
    safetyCounter++;
    const data = await syncTransactions(accessToken, cursor);
    cursor = data.next_cursor;
    hasMore = data.has_more;

    for (const tx of data.added) {
      // Plaid: negative amount = credit (money in). We want positive cents.
      const amountCents = Math.round(-Number(tx.amount) * 100);
      if (!Number.isFinite(amountCents) || amountCents <= 0) continue;
      const merchant = tx.merchant_name || tx.name || null;
      const description = tx.name || null;
      const channel = tx.payment_channel || null;
      const postedDate = tx.date; // YYYY-MM-DD already
      await pool.query(
        `INSERT INTO plaid_pending_deposits
           (item_id, plaid_tx_id, account_id, posted_date, amount_cents,
            merchant_name, description, payment_channel, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         ON CONFLICT (plaid_tx_id) DO NOTHING`,
        [
          localId,
          tx.transaction_id,
          tx.account_id,
          postedDate,
          amountCents,
          merchant,
          description,
          channel,
        ],
      );
    }
    // `removed` and `modified` are not material for our use case (we only
    // surface pending rows; once confirmed they live in founder_distributions
    // with their own audit trail). Skip.
  }

  await pool.query(
    `UPDATE plaid_items SET cursor=$1, synced_at=NOW(), status='active', error=NULL WHERE id=$2`,
    [cursor, localId],
  );
}
