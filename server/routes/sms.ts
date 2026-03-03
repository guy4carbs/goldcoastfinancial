import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { sendSms, isSmsAvailable, validatePhoneNumber } from "../services/smsService";
import { db } from "../db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  smsConversations,
  smsMessages,
  type InsertSmsMessage,
} from "@shared/models/sms";
import twilio from "twilio";

const router = Router();

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

    // Send via Twilio
    const result = await sendSms(to, message);

    // Find or create conversation
    let [conversation] = await db.select()
      .from(smsConversations)
      .where(eq(smsConversations.phoneNumber, result.to));

    if (!conversation) {
      [conversation] = await db.insert(smsConversations).values({
        phoneNumber: result.to,
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
      from: result.from,
      to: result.to,
      body: message,
      status: result.status,
      twilioSid: result.sid,
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

// ── POST /webhook - Receive inbound SMS from Twilio ──
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    // Validate Twilio signature in production
    if (process.env.NODE_ENV === "production") {
      const signature = req.headers["x-twilio-signature"] as string;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const isValid = twilio.validateRequest(authToken, signature, url, req.body);
      if (!isValid) {
        console.warn("[SMS Webhook] Invalid Twilio signature");
        return res.status(403).send("Forbidden");
      }
    }

    const { From, To, Body, MessageSid } = req.body;

    if (!From || !Body) {
      return res.status(400).send("Missing required fields");
    }

    // Find or create conversation for this phone number
    let [conversation] = await db.select()
      .from(smsConversations)
      .where(eq(smsConversations.phoneNumber, From));

    if (!conversation) {
      [conversation] = await db.insert(smsConversations).values({
        phoneNumber: From,
        contactName: null,
        leadId: null,
        agentId: null,
        unreadCount: 0,
        isActive: true,
      }).returning();
    }

    // Store the inbound message
    const preview = Body.length > 100 ? Body.substring(0, 100) + "..." : Body;

    await db.insert(smsMessages).values({
      conversationId: conversation.id,
      direction: "inbound",
      from: From,
      to: To || process.env.TWILIO_PHONE_NUMBER || "",
      body: Body,
      status: "received",
      twilioSid: MessageSid || null,
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

    console.log(`[SMS Webhook] Inbound from ${From}: ${Body}`);

    // Respond with empty TwiML (acknowledges receipt)
    res.type("text/xml").send("<Response></Response>");
  } catch (error) {
    console.error("[SMS Webhook] Error:", error);
    res.type("text/xml").send("<Response></Response>");
  }
});

// ── POST /webhook/fallback - Fallback handler for Twilio errors ──
router.post("/webhook/fallback", async (req: Request, res: Response) => {
  console.error("[SMS Webhook Fallback] Twilio error:", {
    errorCode: req.body.ErrorCode,
    errorMessage: req.body.ErrorMessage,
    errorUrl: req.body.ErrorUrl,
  });
  res.type("text/xml").send("<Response></Response>");
});

// ── POST /status - Status callback for outbound message updates ──
router.post("/status", async (req: Request, res: Response) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;

    if (MessageSid && MessageStatus) {
      await db.update(smsMessages)
        .set({
          status: MessageStatus,
          errorCode: ErrorCode || null,
          errorMessage: ErrorMessage || null,
        })
        .where(eq(smsMessages.twilioSid, MessageSid));

      console.log(`[SMS Status] ${MessageSid}: ${MessageStatus}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[SMS Status] Error:", error);
    res.sendStatus(200);
  }
});

export default router;
