/**
 * Claims API Routes (Agent-Side)
 * Handles agent-side claim management, status updates, and notes
 *
 * Status update notifications are sent through 3 channels:
 * 1. In-house chat (client_messages table + WebSocket)
 * 2. In-app notification (notifications table)
 * 3. External email via Gmail API (sendPortalMessage)
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { pool } from "../db";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import { broadcastToClientChat } from "../websocket";
import { sendPortalMessage } from "../gmail";

const router = Router();

// ============================================
// STATUS LABELS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  filed: "Filed",
  under_review: "Under Review",
  approved: "Approved",
  denied: "Denied",
  paid: "Paid",
};

// ============================================
// VALID STATUS TRANSITIONS
// ============================================

const VALID_TRANSITIONS: Record<string, string[]> = {
  filed: ["under_review"],
  under_review: ["approved", "denied"],
  approved: ["paid"],
};

// ============================================
// GET /api/claims — All claims for authenticated agent
// ============================================

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const claims = await storage.getClaimsByAgentId(agent.id);

    // Enrich each claim with client info, policy details, and notes
    const enriched = await Promise.all(
      claims.map(async (claim) => {
        const client = claim.claimantUserId
          ? await storage.getUserById(claim.claimantUserId)
          : null;
        const policy = claim.policyId
          ? await storage.getPolicyById(claim.policyId)
          : null;
        const notes = await storage.getClaimNotes(claim.id);
        return {
          ...claim,
          clientName: client ? `${client.firstName} ${client.lastName}` : "Unknown",
          clientEmail: client?.email || "",
          clientPhone: client?.phone || "",
          policyNumber: policy?.policyNumber || claim.policyId || "N/A",
          policyType: policy?.type || "",
          carrier: policy?.carrier || claim.carrier || "",
          notes,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error("[Claims] Failed to fetch claims:", error);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
});

// ============================================
// GET /api/claims/:id — Single claim with notes
// ============================================

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const claim = await storage.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const notes = await storage.getClaimNotes(id);

    res.json({ claim, notes });
  } catch (error: any) {
    console.error("[Claims] Failed to fetch claim:", error);
    res.status(500).json({ error: "Failed to fetch claim" });
  }
});

// ============================================
// PUT /api/claims/:id/status — Update status + 3-channel notification
// ============================================

router.put("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const id = req.params.id;

    const { status, note, denialReason } = req.body as {
      status: string;
      note?: string;
      denialReason?: string;
    };

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const claim = await storage.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    // Validate status transition
    const currentStatus = claim.status || "filed";
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition: ${currentStatus} → ${status}. Allowed: ${allowed?.join(", ") || "none"}`,
      });
    }

    // Build update payload with appropriate timestamps
    const now = new Date();
    const updateData: Record<string, any> = { status };

    if (status === "under_review") {
      updateData.reviewedAt = now;
    } else if (status === "approved") {
      updateData.approvedAt = now;
    } else if (status === "denied") {
      updateData.deniedAt = now;
      if (denialReason) {
        updateData.denialReason = denialReason;
      }
    } else if (status === "paid") {
      updateData.paidAt = now;
    }

    await storage.updateClaim(id, updateData);

    // Create audit trail note
    const previousStatus = currentStatus;
    const newStatus = status;
    const authorName = `${agent.firstName} ${agent.lastName}`;
    const noteContent = note || `Status changed from ${STATUS_LABELS[previousStatus] || previousStatus} to ${STATUS_LABELS[newStatus] || newStatus}`;

    await storage.createClaimNote({
      claimId: id,
      authorId: agent.id,
      authorName,
      content: noteContent,
      noteType: "status_change",
      previousStatus,
      newStatus,
    });

    // ── 3-Channel Client Notification ──
    if (claim.claimantUserId) {
      const channels = { chat: false, notification: false, email: false };
      const statusLabel = STATUS_LABELS[newStatus] || newStatus;
      const formattedMessage = buildStatusUpdateMessage(claim, previousStatus, newStatus, noteContent, denialReason);
      const subjectLine = `Claim Update - Status: ${statusLabel}`;

      // ── Channel 1: In-House Chat ──
      try {
        const conversations = await storage.getClientConversationsByClientId(claim.claimantUserId);

        if (conversations.length > 0) {
          const conversation = conversations[0];

          const chatMessage = await storage.createClientMessage({
            conversationId: conversation.id,
            senderId: agent.id,
            senderType: "agent",
            senderName: authorName,
            content: formattedMessage,
            messageType: "text",
            attachments: null,
            isRead: false,
          });

          broadcastToClientChat(conversation.id, {
            type: "client_message",
            conversationId: conversation.id,
            message: chatMessage,
          });

          channels.chat = true;
          console.log(`[Claims] Chat message sent for status update on claim ${id}`);
        }
      } catch (chatErr) {
        console.error("[Claims] Chat delivery failed:", chatErr);
      }

      // ── Channel 2: In-App Notification ──
      try {
        await storage.createNotification({
          userId: claim.claimantUserId,
          title: subjectLine,
          message: `Your claim has been updated to: ${statusLabel}. Check your claims for details.`,
          type: "claim_update",
          isRead: false,
          actionUrl: "/client/claims",
        });

        channels.notification = true;
        console.log(`[Claims] Notification sent to client ${claim.claimantUserId}`);
      } catch (notifErr) {
        console.error("[Claims] Notification delivery failed:", notifErr);
      }

      // ── Channel 3: External Email via Gmail API ──
      try {
        const clientUser = await storage.getUserById(claim.claimantUserId);
        if (clientUser) {
          await sendPortalMessage({
            senderName: authorName,
            senderEmail: agent.email,
            recipientEmail: clientUser.email,
            recipientName: `${clientUser.firstName} ${clientUser.lastName}`,
            subject: subjectLine,
            message: formattedMessage,
            priority: status === "denied" ? "high" : "normal",
          });

          channels.email = true;
          console.log(`[Claims] Email sent to ${clientUser.email}`);
        }
      } catch (emailErr) {
        console.error("[Claims] Email delivery failed:", emailErr);
      }

      console.log(`[Claims] Status update channels for claim ${id}:`, channels);
    }

    // Log to team activity feed
    try {
      await pool.query(`
        INSERT INTO team_activity_feed (agent_user_id, agent_name, activity_type, title, message, metadata)
        VALUES ($1, $2, 'achievement', 'Claim Updated', $3, $4)
      `, [agent.id, authorName, `moved claim to ${STATUS_LABELS[newStatus] || newStatus}`, JSON.stringify({ claimId: id, status: newStatus })]);
    } catch {}

    res.json({
      success: true,
      previousStatus,
      newStatus,
      message: `Claim status updated to ${STATUS_LABELS[newStatus] || newStatus}`,
    });
  } catch (error: any) {
    console.error("[Claims] Status update failed:", error);
    res.status(500).json({ error: "Failed to update claim status" });
  }
});

// ============================================
// PUT /api/claims/:id — Update claim fields
// ============================================

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const claim = await storage.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const { carrierClaimNumber, estimatedResolutionDate, documentsRequired, documentsReceived, priority } = req.body;

    const updateData: Record<string, any> = {};
    if (carrierClaimNumber !== undefined) updateData.carrierClaimNumber = carrierClaimNumber;
    if (estimatedResolutionDate !== undefined) updateData.estimatedResolutionDate = estimatedResolutionDate;
    if (documentsRequired !== undefined) updateData.documentsRequired = documentsRequired;
    if (documentsReceived !== undefined) updateData.documentsReceived = documentsReceived;
    if (priority !== undefined) updateData.priority = priority;

    const updated = await storage.updateClaim(id, updateData);

    res.json(updated);
  } catch (error: any) {
    console.error("[Claims] Failed to update claim:", error);
    res.status(500).json({ error: "Failed to update claim" });
  }
});

// ============================================
// POST /api/claims/:id/notes — Add internal note
// ============================================

router.post("/:id/notes", requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = req.user! as AuthenticatedUser;
    const id = req.params.id;

    const { content, isInternal } = req.body as {
      content: string;
      isInternal?: boolean;
    };

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const claim = await storage.getClaimById(id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const authorName = `${agent.firstName} ${agent.lastName}`;

    const noteRecord = await storage.createClaimNote({
      claimId: id,
      authorId: agent.id,
      authorName,
      content,
      noteType: isInternal ? "internal" : "client_visible",
    });

    res.status(201).json(noteRecord);
  } catch (error: any) {
    console.error("[Claims] Failed to create note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// ============================================
// HELPERS
// ============================================

function buildStatusUpdateMessage(
  claim: any,
  previousStatus: string,
  newStatus: string,
  note: string,
  denialReason?: string
): string {
  const header = "CLAIM STATUS UPDATE";
  const divider = "─".repeat(40);
  const prevLabel = STATUS_LABELS[previousStatus] || previousStatus;
  const newLabel = STATUS_LABELS[newStatus] || newStatus;

  const lines = [
    header,
    divider,
    `Claim #${claim.id}`,
    `Status: ${prevLabel} → ${newLabel}`,
    "",
    "Details:",
    note,
  ];

  if (newStatus === "denied" && denialReason) {
    lines.push("");
    lines.push(`Denial Reason: ${denialReason}`);
  }

  lines.push(divider);

  if (newStatus === "approved") {
    lines.push("Your claim has been approved. Payment processing will begin shortly.");
  } else if (newStatus === "denied") {
    lines.push("If you have questions about this decision, please contact your agent.");
  } else if (newStatus === "under_review") {
    lines.push("Your claim is now being reviewed. You will be notified of any updates.");
  } else if (newStatus === "paid") {
    lines.push("Payment has been issued. Please allow 5-7 business days for processing.");
  }

  return lines.join("\n");
}

export default router;
