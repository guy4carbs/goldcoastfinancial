import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { sendSms, isSmsAvailable, validatePhoneNumber } from "../services/smsService";
import { storage } from "../storage";
import { db } from "../db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  smsConversations,
  smsMessages,
  type InsertSmsMessage,
} from "@shared/models/sms";
import { TelnyxWebhook } from 'telnyx/webhooks';

const router = Router();

/**
 * Verify Telnyx webhook signature (Ed25519)
 * Reuses same pattern as server/routes/calls.ts
 */
async function verifyTelnyxSignature(req: Request): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;

  const publicKey = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("[SMS Webhook] TELNYX_PUBLIC_KEY not configured, skipping verification");
    return true;
  }

  try {
    const signature = req.headers["telnyx-signature-ed25519"] as string;
    const timestamp = req.headers["telnyx-timestamp"] as string;
    if (!signature || !timestamp) return false;

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const webhook = new TelnyxWebhook(publicKey);
    await webhook.verify(rawBody, {
      'telnyx-signature-ed25519': signature,
      'telnyx-timestamp': timestamp,
    });
    return true;
  } catch (error: any) {
    console.warn("[SMS Webhook] Signature verification failed:", error.message);
    return false;
  }
}

// ── GET /conversations - List all SMS conversations for the agent ──
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const conversations = await db.select()
      .from(smsConversations)
      .orderBy(desc(smsConversations.lastMessageAt));
    res.json(conversations);
  } catch (error) {
    console.error("[SMS] Failed to fetch conversations:", error);
    res.status(500).json({ error: "Failed to fetch SMS conversations" });
  }
});

// ── GET /conversations/:id/messages - Get messages for a conversation ──
router.get("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await db.select()
      .from(smsMessages)
      .where(eq(smsMessages.conversationId, id))
      .orderBy(asc(smsMessages.createdAt));

    // Mark inbound messages as read
    await db.update(smsMessages)
      .set({ isRead: true })
      .where(
        sql`${smsMessages.conversationId} = ${id} AND ${smsMessages.direction} = 'inbound' AND ${smsMessages.isRead} = false`
      );

    // Reset unread count
    await db.update(smsConversations)
      .set({ unreadCount: 0, updatedAt: new Date() })
      .where(eq(smsConversations.id, id));

    res.json(messages);
  } catch (error) {
    console.error("[SMS] Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ── POST /send - Send an SMS message ──
router.post("/send", requireAuth, async (req: Request, res: Response) => {
  try {
    const { to, message, contactName, leadId } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' and 'message' fields" });
    }

    if (!isSmsAvailable()) {
      return res.status(503).json({ error: "SMS service not configured" });
    }

    // HIGH (audit 2026-05-12): TCPA compliance — block any send to a number
    // on the DNC list. Sending to DNC numbers exposes the company to FCC
    // fines of $500–$43,000 per violation. The DNC table is populated via
    // the /api/dnc/* routes.
    try {
      const onDnc = await storage.isOnDnc(to);
      if (onDnc) {
        return res.status(403).json({
          error: "This number is on the Do Not Call list. The message was NOT sent.",
          code: "DNC_BLOCKED",
        });
      }
    } catch (dncErr: any) {
      // If the DNC lookup itself fails, fail-closed (refuse to send) — it's
      // safer to drop a legitimate message than to spam a DNC number.
      console.error("[SMS] DNC check failed, blocking send:", dncErr?.message);
      return res.status(503).json({
        error: "Could not verify DNC status. Please try again in a moment.",
        code: "DNC_CHECK_FAILED",
      });
    }

    // Send via Telnyx
    const result = await sendSms(to, message);

    if (!result.success) {
      return res.status(500).json({ error: result.error || "Failed to send SMS" });
    }

    // Find or create conversation
    let [conversation] = await db.select()
      .from(smsConversations)
      .where(eq(smsConversations.phoneNumber, result.to || to));

    if (!conversation) {
      [conversation] = await db.insert(smsConversations).values({
        phoneNumber: result.to || to,
        contactName: contactName || null,
        leadId: leadId || null,
        agentId: req.user!.id,
        unreadCount: 0,
        isActive: true,
      }).returning();
    }

    // Store the outbound message
    const preview = message.length > 100 ? message.substring(0, 100) + "..." : message;

    const [smsMessage] = await db.insert(smsMessages).values({
      conversationId: conversation.id,
      direction: "outbound",
      from: result.from || process.env.TELNYX_SMS_FROM || "",
      to: result.to || to,
      body: message,
      status: (result.status || "queued") as "queued" | "sending" | "sent" | "delivered" | "failed",
      externalId: result.messageId || null,
      isRead: true,
    }).returning();

    // Update conversation
    await db.update(smsConversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        updatedAt: new Date(),
      })
      .where(eq(smsConversations.id, conversation.id));

    res.json({ success: true, message: smsMessage, conversation });
  } catch (error: any) {
    console.error("[SMS] Failed to send:", error);
    res.status(500).json({ error: error.message || "Failed to send SMS" });
  }
});

// ── POST /validate - Validate a phone number ──
router.post("/validate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Missing phoneNumber" });
    }
    const result = await validatePhoneNumber(phoneNumber);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid phone number" });
  }
});

// ── POST /webhook - Receive inbound SMS from Telnyx ──
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!await verifyTelnyxSignature(req)) {
      console.warn("[SMS Webhook] Invalid Telnyx signature");
      return res.status(403).json({ error: "Forbidden" });
    }

    const eventType = req.body?.data?.event_type;
    const payload = req.body?.data?.payload;

    if (eventType !== 'message.received' || !payload) {
      // Acknowledge non-inbound events gracefully
      return res.status(200).json({ status: 'ok' });
    }

    const fromNumber = payload.from?.phone_number;
    const toNumber = payload.to?.[0]?.phone_number || process.env.TELNYX_SMS_FROM || "";
    const body = payload.text || "";
    const messageId = payload.id || null;

    if (!fromNumber || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find or create conversation for this phone number
    let [conversation] = await db.select()
      .from(smsConversations)
      .where(eq(smsConversations.phoneNumber, fromNumber));

    if (!conversation) {
      [conversation] = await db.insert(smsConversations).values({
        phoneNumber: fromNumber,
        contactName: null,
        leadId: null,
        agentId: null,
        unreadCount: 0,
        isActive: true,
      }).returning();
    }

    // Store the inbound message
    const preview = body.length > 100 ? body.substring(0, 100) + "..." : body;

    await db.insert(smsMessages).values({
      conversationId: conversation.id,
      direction: "inbound",
      from: fromNumber,
      to: toNumber,
      body,
      status: "received",
      externalId: messageId,
      isRead: false,
    });

    // Update conversation with unread count
    await db.update(smsConversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        unreadCount: sql`${smsConversations.unreadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(smsConversations.id, conversation.id));

    console.log(`[SMS Webhook] Inbound from ${fromNumber}: ${body}`);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("[SMS Webhook] Error:", error);
    res.status(200).json({ status: 'ok' });
  }
});

// ── POST /webhook/fallback - Fallback handler for Telnyx errors ──
router.post("/webhook/fallback", async (req: Request, res: Response) => {
  console.error("[SMS Webhook Fallback] Telnyx error:", {
    eventType: req.body?.data?.event_type,
    payload: req.body?.data?.payload,
  });
  res.status(200).json({ status: 'ok' });
});

// ── POST /status - Status callback for outbound message updates ──
router.post("/status", async (req: Request, res: Response) => {
  try {
    if (!await verifyTelnyxSignature(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const eventType = req.body?.data?.event_type;
    const payload = req.body?.data?.payload;

    // Handle message.sent and message.finalized events
    if ((eventType === 'message.sent' || eventType === 'message.finalized') && payload) {
      const messageId = payload.id;
      const toStatus = payload.to?.[0]?.status;
      const errors = payload.errors;

      if (messageId && toStatus) {
        // Map Telnyx statuses to our DB statuses
        const statusMap: Record<string, string> = {
          'queued': 'queued',
          'sending': 'sending',
          'sent': 'sent',
          'delivered': 'delivered',
          'delivery_failed': 'failed',
          'sending_failed': 'failed',
          'delivery_unconfirmed': 'delivery_unconfirmed',
          'expired': 'expired',
        };
        const dbStatus = statusMap[toStatus] || toStatus;

        await db.update(smsMessages)
          .set({
            status: dbStatus,
            errorCode: errors?.[0]?.code?.toString() || null,
            errorMessage: errors?.[0]?.detail || null,
          })
          .where(eq(smsMessages.externalId, messageId));

        console.log(`[SMS Status] ${messageId}: ${toStatus}`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("[SMS Status] Error:", error);
    res.status(200).json({ status: 'ok' });
  }
});

export default router;
