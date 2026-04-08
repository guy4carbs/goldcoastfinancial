/**
 * Client Portal API Routes
 * Handles client-side requests for the Client Lounge
 *
 * Beneficiary requests are sent through 3 channels:
 * 1. In-house chat (client_messages table + WebSocket)
 * 2. In-app notification (notifications table)
 * 3. External email via Gmail API (sendPortalMessage)
 *
 * Agent resolution: If a client has no existing conversation,
 * the system falls back to the owner account (admin@heritagels.org)
 * and auto-creates a conversation.
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import { broadcastToClientChat } from "../websocket";
import { sendPortalMessage } from "../gmail";
import { eventBus, EventType } from "../agents/core/event-bus";
import { notifyUser } from "../websocket/eventBridge";
import type { GCFWebSocketServer } from "../websocket/GCFWebSocketServer";

const router = Router();

// ============================================
// AGENT RESOLUTION
// ============================================

const OWNER_EMAIL = "admin@heritagels.org";

/**
 * Resolves the agent and conversation for a client.
 * Priority: assignedAgentId → existing conversation → owner fallback.
 * Verifies agent is active at every step (prevents routing to deactivated agents).
 */
async function resolveAgentForClient(client: AuthenticatedUser) {
  // 1. Check assignedAgentId first (set during lead conversion)
  if (client.assignedAgentId) {
    const assignedAgent = await storage.getUserById(client.assignedAgentId);
    if (assignedAgent && assignedAgent.isActive) {
      const conversation = await storage.getOrCreateClientConversation(
        client.id,
        assignedAgent.id,
        `${client.firstName} ${client.lastName}`,
        `${assignedAgent.firstName} ${assignedAgent.lastName}`
      );
      return { conversation, agent: assignedAgent };
    }
    console.warn(`[ClientPortal] Assigned agent ${client.assignedAgentId} is inactive or not found for client ${client.id} — falling back`);
  }

  // 2. Check existing conversations (agent may differ from assignedAgentId)
  const conversations = await storage.getClientConversationsByClientId(client.id);
  if (conversations.length > 0) {
    const conversation = conversations[0];
    const agent = await storage.getUserById(conversation.agentId);
    if (agent && agent.isActive) {
      return { conversation, agent };
    }
    console.warn(`[ClientPortal] Conversation agent ${conversation.agentId} is inactive — falling back to owner`);
  }

  // 3. Fallback: route to owner account
  const owner = await storage.getUserByEmail(OWNER_EMAIL);
  if (!owner) {
    console.error("[ClientPortal] Owner account not found — cannot route client request");
    return null;
  }
  console.warn(`[ClientPortal] No active agent found for client ${client.id} — routing to owner`);

  const conversation = await storage.getOrCreateClientConversation(
    client.id,
    owner.id,
    `${client.firstName} ${client.lastName}`,
    `${owner.firstName} ${owner.lastName}`
  );

  return { conversation, agent: owner };
}

// ============================================
// WEBSOCKET NOTIFICATION HELPER
// ============================================

/**
 * Broadcast a notification via WebSocket after persisting to DB.
 * Non-blocking — failures are logged but don't affect the response.
 */
function broadcastNotification(
  req: Request,
  userId: string,
  notification: { type: string; title: string; message: string; data?: any }
) {
  try {
    const wsServer: GCFWebSocketServer | undefined = req.app.get('wsServer');
    if (wsServer) {
      notifyUser(wsServer, userId, notification);
    }
  } catch (err) {
    console.error('[ClientPortal] WebSocket notification broadcast failed:', err);
  }
}

// ============================================
// GET ASSIGNED AGENT
// ============================================

/**
 * GET /api/client-portal/my-agent
 * Fetch the client's assigned agent info (sanitized for display)
 */
router.get("/my-agent", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;

    if (!client.assignedAgentId) {
      return res.json(null);
    }

    const agent = await storage.getUserById(client.assignedAgentId);
    if (!agent || !agent.isActive) {
      return res.json(null);
    }

    res.json({
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      phone: agent.phone ?? null,
      avatarUrl: agent.avatarUrl ?? null,
    });
  } catch (error: any) {
    console.error("[ClientPortal] Failed to fetch agent info:", error);
    res.status(500).json({ error: "Failed to fetch agent info" });
  }
});

// ============================================
// GET CLIENT CLAIMS
// ============================================

/**
 * GET /api/client-portal/claims
 * Fetch all claims for the authenticated client
 */
router.get("/claims", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;
    const claims = await storage.getClaimsByClientId(client.id);
    res.json(claims);
  } catch (error: any) {
    console.error("[ClientPortal] Failed to fetch claims:", error);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
});

// ============================================
// BENEFICIARY REQUESTS
// ============================================

interface BeneficiaryRequestBody {
  requestType: "add" | "edit" | "delete";
  message: string;
  policyId?: string;
  policyNumber?: string;
  policyType?: string;
  beneficiaryType?: "primary" | "contingent";
  firstName?: string;
  lastName?: string;
  relationship?: string;
  dateOfBirth?: string;
  allocationPercent?: number;
  beneficiaryName?: string;
  reason?: string;
}

/**
 * POST /api/client-portal/beneficiary-request
 * Submit a beneficiary change request (add/edit/delete)
 * Sends through: in-house chat, in-app notification, and external email
 */
router.post("/beneficiary-request", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;
    const body = req.body as BeneficiaryRequestBody;

    if (!body.requestType || !body.message) {
      return res.status(400).json({ error: "Request type and message are required" });
    }

    // Resolve agent + conversation (single lookup with owner fallback)
    const resolved = await resolveAgentForClient(client);
    if (!resolved) {
      return res.status(500).json({ error: "Unable to route request to an agent. Please contact support." });
    }

    const { conversation, agent } = resolved;
    console.log(`[ClientPortal] Resolved agent ${agent.id} (${agent.email}) for client ${client.id}, conversation ${conversation.id}`);

    // Build formatted message for chat/email
    const formattedMessage = buildBeneficiaryMessage(body, client);
    const subjectLine = buildSubjectLine(body, client);

    // Track results for each channel
    const channels = { chat: false, notification: false, email: false };

    // ── Channel 1: In-House Chat ──
    try {
      const chatMessage = await storage.createClientMessage({
        conversationId: conversation.id,
        senderId: client.id,
        senderType: "client",
        senderName: `${client.firstName} ${client.lastName}`,
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
      console.log(`[ClientPortal] Chat message sent for ${body.requestType} request`);
    } catch (chatErr) {
      console.error("[ClientPortal] Chat delivery failed:", chatErr);
    }

    // ── Channel 2: In-App Notification ──
    try {
      await storage.createNotification({
        userId: agent.id,
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has submitted a beneficiary ${body.requestType} request. Check your messages for details.`,
        type: "beneficiary_request",
        isRead: false,
        actionUrl: "/client-chat",
      });

      channels.notification = true;
      console.log(`[ClientPortal] Notification sent to agent ${agent.id}`);

      // Push via WebSocket so agent sees it in real-time
      broadcastNotification(req, agent.id, {
        type: 'beneficiary_request',
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has submitted a beneficiary ${body.requestType} request.`,
      });
    } catch (notifErr) {
      console.error("[ClientPortal] Notification delivery failed:", notifErr);
    }

    // ── Channel 3: External Email via Gmail API ──
    try {
      await sendPortalMessage({
        senderName: `${client.firstName} ${client.lastName}`,
        senderEmail: client.email,
        recipientEmail: agent.email,
        recipientName: `${agent.firstName} ${agent.lastName}`,
        subject: subjectLine,
        message: formattedMessage,
        priority: body.requestType === "delete" ? "high" : "normal",
      });

      channels.email = true;
      console.log(`[ClientPortal] Email sent to ${agent.email}`);
    } catch (emailErr) {
      console.error("[ClientPortal] Email delivery failed:", emailErr);
    }

    // ── Emit EventBus event for real-time channel broadcast ──
    try {
      eventBus.emit({
        type: EventType.BENEFICIARY_REQUESTED,
        source: 'client-portal',
        payload: {
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          agentId: agent.id,
          requestType: body.requestType,
          policyNumber: body.policyNumber,
        },
        metadata: { tier: 7, priority: body.requestType === 'delete' ? 'high' : 'normal' },
      } as any);
    } catch (eventErr) {
      console.error('[ClientPortal] EventBus emit failed (non-blocking):', eventErr);
    }

    // Determine success: at least one primary channel must work
    const success = channels.chat || channels.notification;
    const warnings: string[] = [];
    if (!channels.chat) warnings.push('Chat delivery failed');
    if (!channels.notification) warnings.push('In-app notification failed');
    if (!channels.email) warnings.push('Email notification failed');

    res.status(success ? 201 : 502).json({
      success,
      requestType: body.requestType,
      channels,
      ...(warnings.length > 0 ? { warnings } : {}),
      message: success
        ? `Beneficiary ${body.requestType} request submitted successfully`
        : 'Request saved but delivery to agent failed. Please contact support.',
    });
  } catch (error: any) {
    console.error("[ClientPortal] Beneficiary request failed:", error);
    res.status(500).json({ error: "Failed to submit beneficiary request" });
  }
});

// ============================================
// CLAIM REQUESTS
// ============================================

interface ClaimRequestBody {
  policyId: string;
  policyNumber: string;
  policyType: string;
  claimType: string;
  description: string;
  hasDocuments: boolean;
  documentCount?: number;
}

/**
 * POST /api/client-portal/claim-request
 * Submit an insurance claim request
 * Sends through: in-house chat, in-app notification, and external email
 */
router.post("/claim-request", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;
    const body = req.body as ClaimRequestBody;

    if (!body.policyId || !body.claimType || !body.description) {
      return res.status(400).json({ error: "Policy, claim type, and description are required" });
    }

    // Resolve agent + conversation
    const resolved = await resolveAgentForClient(client);
    if (!resolved) {
      return res.status(500).json({ error: "Unable to route request to an agent. Please contact support." });
    }

    const { conversation, agent } = resolved;
    console.log(`[ClientPortal] Resolved agent ${agent.id} (${agent.email}) for claim from client ${client.id}`);

    // Persist claim in database
    let claimNumber: string | undefined;
    try {
      const claim = await storage.createClaim({
        policyId: body.policyId,
        claimantUserId: client.id,
        claimType: body.claimType,
        claimAmount: null,
        status: "filed",
        submittedAt: new Date(),
        agentUserId: agent.id,
        carrier: body.policyType || null,
        priority: body.claimType.includes("Death") ? "critical" : "normal",
        documentsRequired: [],
        documentsReceived: [],
        internalNotes: body.description,
      });
      claimNumber = claim.claimNumber ?? undefined;
      console.log(`[ClientPortal] Claim persisted: ${claimNumber}`);
    } catch (dbErr) {
      console.error("[ClientPortal] Failed to persist claim (continuing with notifications):", dbErr);
    }

    // Build formatted message
    const formattedMessage = buildClaimMessage(body, client);
    const subjectLine = `New Claim Filed - ${body.claimType} (${body.policyNumber || "N/A"})`;

    const channels = { chat: false, notification: false, email: false };

    // ── Channel 1: In-House Chat ──
    try {
      const chatMessage = await storage.createClientMessage({
        conversationId: conversation.id,
        senderId: client.id,
        senderType: "client",
        senderName: `${client.firstName} ${client.lastName}`,
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
      console.log(`[ClientPortal] Chat message sent for claim request`);
    } catch (chatErr) {
      console.error("[ClientPortal] Chat delivery failed:", chatErr);
    }

    // ── Channel 2: In-App Notification ──
    try {
      await storage.createNotification({
        userId: agent.id,
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has filed a ${body.claimType} claim. Check your messages for details.`,
        type: "claim_request",
        isRead: false,
        actionUrl: "/client-chat",
      });

      channels.notification = true;
      console.log(`[ClientPortal] Notification sent to agent ${agent.id}`);

      // Push via WebSocket so agent sees it in real-time
      broadcastNotification(req, agent.id, {
        type: 'claim_request',
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has filed a ${body.claimType} claim.`,
        data: { claimNumber },
      });
    } catch (notifErr) {
      console.error("[ClientPortal] Notification delivery failed:", notifErr);
    }

    // ── Channel 3: External Email via Gmail API ──
    try {
      await sendPortalMessage({
        senderName: `${client.firstName} ${client.lastName}`,
        senderEmail: client.email,
        recipientEmail: agent.email,
        recipientName: `${agent.firstName} ${agent.lastName}`,
        subject: subjectLine,
        message: formattedMessage,
        priority: "high",
      });

      channels.email = true;
      console.log(`[ClientPortal] Email sent to ${agent.email}`);
    } catch (emailErr) {
      console.error("[ClientPortal] Email delivery failed:", emailErr);
    }

    // ── Emit EventBus event for real-time channel broadcast ──
    try {
      eventBus.emit({
        type: EventType.CLAIM_FILED,
        source: 'client-portal',
        payload: {
          claimNumber,
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          agentId: agent.id,
          claimType: body.claimType,
          policyId: body.policyId,
        },
        metadata: { tier: 7, priority: body.claimType.includes('Death') ? 'critical' : 'high' },
      } as any);
    } catch (eventErr) {
      console.error('[ClientPortal] EventBus emit failed (non-blocking):', eventErr);
    }

    // Determine success: at least one primary channel must work
    const success = channels.chat || channels.notification;
    const warnings: string[] = [];
    if (!channels.chat) warnings.push('Chat delivery failed');
    if (!channels.notification) warnings.push('In-app notification failed');
    if (!channels.email) warnings.push('Email notification failed');

    res.status(success ? 201 : 502).json({
      success,
      channels,
      claimNumber,
      ...(warnings.length > 0 ? { warnings } : {}),
      message: success
        ? 'Claim submitted successfully'
        : 'Claim saved but delivery to agent failed. Please contact support.',
    });
  } catch (error: any) {
    console.error("[ClientPortal] Claim request failed:", error);
    res.status(500).json({ error: "Failed to submit claim request" });
  }
});

// ============================================
// APPOINTMENTS
// ============================================

/**
 * GET /api/client-portal/appointments
 * Fetch all appointments for the authenticated client
 */
router.get("/appointments", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;
    const appts = await storage.getAppointmentsByClientId(client.id);
    res.json(appts);
  } catch (error: any) {
    console.error("[ClientPortal] Failed to fetch appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

interface AppointmentRequestBody {
  topic: string;
  meetingType: "phone" | "video" | "in_person";
  preferredDate: string; // ISO date string
  preferredTime: string; // e.g. "10:00 AM"
  notes?: string;
}

/**
 * POST /api/client-portal/appointment-request
 * Submit an appointment request
 * Persists to DB + sends 3-channel notification to agent
 */
router.post("/appointment-request", requireAuth, async (req: Request, res: Response) => {
  try {
    const client = req.user! as AuthenticatedUser;
    const body = req.body as AppointmentRequestBody;

    if (!body.topic || !body.meetingType || !body.preferredDate || !body.preferredTime) {
      return res.status(400).json({ error: "Topic, meeting type, date, and time are required" });
    }

    // Resolve agent + conversation
    const resolved = await resolveAgentForClient(client);
    if (!resolved) {
      return res.status(500).json({ error: "Unable to route request to an agent. Please contact support." });
    }

    const { conversation, agent } = resolved;

    // Parse scheduled date/time
    const [timePart, ampm] = body.preferredTime.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let hour24 = hours;
    if (ampm?.toUpperCase() === 'PM' && hours !== 12) hour24 += 12;
    if (ampm?.toUpperCase() === 'AM' && hours === 12) hour24 = 0;

    const scheduledAt = new Date(body.preferredDate);
    scheduledAt.setHours(hour24, minutes || 0, 0, 0);

    // Persist appointment
    let appointment;
    try {
      appointment = await storage.createAppointment({
        clientUserId: client.id,
        agentUserId: agent.id,
        scheduledAt,
        duration: 30,
        title: body.topic,
        description: body.notes || null,
        meetingType: body.meetingType === 'in_person' ? 'discovery' : body.meetingType === 'video' ? 'presentation' : 'follow_up',
        location: body.meetingType === 'in_person' ? 'TBD' : 'Virtual',
        meetingLink: body.meetingType === 'video' ? `https://meet.heritagels.org/session/${Date.now()}` : null,
        status: 'scheduled',
      });
      console.log(`[ClientPortal] Appointment persisted: ${appointment.id}`);
    } catch (dbErr) {
      console.error("[ClientPortal] Failed to persist appointment:", dbErr);
    }

    // Build message
    const meetingTypeLabel = body.meetingType === 'phone' ? 'Phone Call' : body.meetingType === 'video' ? 'Video Call' : 'In Person';
    const formattedMessage = buildAppointmentMessage(body, client, meetingTypeLabel);
    const subjectLine = `Appointment Request - ${body.topic} (${meetingTypeLabel})`;

    const channels = { chat: false, notification: false, email: false };

    // ── Channel 1: In-House Chat ──
    try {
      const chatMessage = await storage.createClientMessage({
        conversationId: conversation.id,
        senderId: client.id,
        senderType: "client",
        senderName: `${client.firstName} ${client.lastName}`,
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
    } catch (chatErr) {
      console.error("[ClientPortal] Chat delivery failed:", chatErr);
    }

    // ── Channel 2: In-App Notification ──
    try {
      await storage.createNotification({
        userId: agent.id,
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has requested a ${meetingTypeLabel.toLowerCase()} appointment. Check your messages for details.`,
        type: "appointment_request",
        isRead: false,
        actionUrl: "/client-chat",
      });
      channels.notification = true;

      // Push via WebSocket so agent sees it in real-time
      broadcastNotification(req, agent.id, {
        type: 'appointment_request',
        title: subjectLine,
        message: `${client.firstName} ${client.lastName} has requested a ${meetingTypeLabel.toLowerCase()} appointment.`,
        data: { appointmentId: appointment?.id },
      });
    } catch (notifErr) {
      console.error("[ClientPortal] Notification delivery failed:", notifErr);
    }

    // ── Channel 3: External Email via Gmail API ──
    try {
      await sendPortalMessage({
        senderName: `${client.firstName} ${client.lastName}`,
        senderEmail: client.email,
        recipientEmail: agent.email,
        recipientName: `${agent.firstName} ${agent.lastName}`,
        subject: subjectLine,
        message: formattedMessage,
        priority: "normal",
      });
      channels.email = true;
    } catch (emailErr) {
      console.error("[ClientPortal] Email delivery failed:", emailErr);
    }

    // ── Emit EventBus event for real-time channel broadcast ──
    try {
      eventBus.emit({
        type: EventType.APPOINTMENT_BOOKED,
        source: 'client-portal',
        payload: {
          appointmentId: appointment?.id,
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          agentId: agent.id,
          scheduledAt,
          topic: body.topic,
          meetingType: body.meetingType,
        },
        metadata: { tier: 3, priority: 'normal' },
      } as any);
    } catch (eventErr) {
      console.error('[ClientPortal] EventBus emit failed (non-blocking):', eventErr);
    }

    // Determine success: at least one primary channel must work
    const success = channels.chat || channels.notification;
    const warnings: string[] = [];
    if (!channels.chat) warnings.push('Chat delivery failed');
    if (!channels.notification) warnings.push('In-app notification failed');
    if (!channels.email) warnings.push('Email notification failed');

    res.status(success ? 201 : 502).json({
      success,
      channels,
      appointmentId: appointment?.id,
      ...(warnings.length > 0 ? { warnings } : {}),
      message: success
        ? 'Appointment request submitted successfully'
        : 'Appointment saved but delivery to agent failed. Please contact support.',
    });
  } catch (error: any) {
    console.error("[ClientPortal] Appointment request failed:", error);
    res.status(500).json({ error: "Failed to submit appointment request" });
  }
});

// ============================================
// HELPERS
// ============================================

function buildAppointmentMessage(body: AppointmentRequestBody, client: any, meetingTypeLabel: string): string {
  const header = "APPOINTMENT REQUEST";
  const divider = "\u2500".repeat(40);

  const dateObj = new Date(body.preferredDate);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${monthNames[dateObj.getUTCMonth()]} ${dateObj.getUTCDate()}, ${dateObj.getUTCFullYear()}`;

  const lines = [
    header,
    divider,
    `Client: ${client.firstName} ${client.lastName}`,
    `Topic: ${body.topic}`,
    `Meeting Type: ${meetingTypeLabel}`,
    `Preferred Date: ${formattedDate}`,
    `Preferred Time: ${body.preferredTime}`,
  ];

  if (body.notes) {
    lines.push("", "Notes:", body.notes);
  }

  lines.push(divider);
  lines.push("Please confirm or suggest an alternative time at your earliest convenience.");

  return lines.join("\n");
}

function buildClaimMessage(body: ClaimRequestBody, client: any): string {
  const header = "NEW INSURANCE CLAIM";
  const divider = "─".repeat(40);

  return [
    header,
    divider,
    `Client: ${client.firstName} ${client.lastName}`,
    `Policy: ${body.policyType || ""} - ${body.policyNumber || "N/A"}`,
    `Claim Type: ${body.claimType}`,
    "",
    "Description:",
    body.description,
    "",
    body.hasDocuments
      ? `Supporting Documents: ${body.documentCount || 0} file(s) attached to portal`
      : "Supporting Documents: None uploaded yet",
    divider,
    "PRIORITY: Claims require prompt review. Please contact client within 24 hours.",
  ].join("\n");
}

function buildSubjectLine(body: BeneficiaryRequestBody, client: any): string {
  switch (body.requestType) {
    case "add":
      return `Beneficiary Addition Request - ${body.firstName} ${body.lastName}`;
    case "edit":
      return `Beneficiary Change Request - ${body.firstName} ${body.lastName}`;
    case "delete":
      return `Beneficiary Removal Request - ${body.beneficiaryName}`;
    default:
      return `Beneficiary Request from ${client.firstName} ${client.lastName}`;
  }
}

function buildBeneficiaryMessage(body: BeneficiaryRequestBody, client: any): string {
  const header = `BENEFICIARY ${body.requestType.toUpperCase()} REQUEST`;
  const divider = "─".repeat(40);

  if (body.requestType === "delete") {
    return [
      header,
      divider,
      `Client: ${client.firstName} ${client.lastName}`,
      `Beneficiary: ${body.beneficiaryName}`,
      `Policy: ${body.policyNumber || "N/A"}`,
      "",
      `Reason for removal:`,
      body.reason || body.message,
      divider,
      "This request requires carrier processing (5-10 business days).",
    ].join("\n");
  }

  const actionLabel = body.requestType === "add" ? "New Beneficiary Details" : "Updated Beneficiary Details";

  return [
    header,
    divider,
    `Client: ${client.firstName} ${client.lastName}`,
    `Policy: ${body.policyType || ""} - ${body.policyNumber || "N/A"}`,
    "",
    `${actionLabel}:`,
    `  Name: ${body.firstName} ${body.lastName}`,
    `  Type: ${body.beneficiaryType === "primary" ? "Primary" : "Contingent"}`,
    `  Relationship: ${body.relationship}`,
    `  Date of Birth: ${body.dateOfBirth}`,
    `  Allocation: ${body.allocationPercent}%`,
    "",
    `Client message:`,
    body.message,
    divider,
    "This request requires carrier processing (5-10 business days).",
  ].join("\n");
}

export default router;
