/**
 * Client Chat API Routes
 * Handles messaging between agents and their assigned clients
 *
 * Two sets of endpoints:
 * 1. Agent-side routes (/api/client-chat/*) - for web app
 * 2. Client-side routes (/api/app/chat/*) - for iOS app
 */

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { broadcastToClientChat } from "../websocket";

const router = Router();

// ============================================
// AGENT-SIDE ROUTES (Web App)
// ============================================

/**
 * GET /api/client-chat/conversations
 * Get all client conversations for the authenticated agent
 */
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const conversations = await storage.getClientConversationsByAgentId(agentId);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching client conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /api/client-chat/conversations/:id
 * Get a specific client conversation
 */
router.get("/conversations/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentId = req.user!.id;

    const conversation = await storage.getClientConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify the agent owns this conversation
    if (conversation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * GET /api/client-chat/conversations/:id/messages
 * Get messages for a specific conversation
 */
router.get("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 100;

    const conversation = await storage.getClientConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify the agent owns this conversation
    if (conversation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await storage.getClientMessages(id, limit);

    // Mark as read when agent fetches messages
    await storage.markClientConversationReadByAgent(id);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/client-chat/conversations/:id/messages
 * Send a message to a client
 */
router.post("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, messageType = "text", attachments } = req.body;
    const agent = req.user!;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    const conversation = await storage.getClientConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify the agent owns this conversation
    if (conversation.agentId !== agent.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const message = await storage.createClientMessage({
      conversationId: id,
      senderId: agent.id,
      senderType: "agent",
      senderName: `${agent.firstName} ${agent.lastName}`,
      content: content.trim(),
      messageType,
      attachments: attachments || null,
      isRead: false,
    });

    // Broadcast to WebSocket clients
    broadcastToClientChat(id, {
      type: "agent_message",
      conversationId: id,
      message,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * PATCH /api/client-chat/conversations/:id/read
 * Mark conversation as read by agent
 */
router.patch("/conversations/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentId = req.user!.id;

    const conversation = await storage.getClientConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.agentId !== agentId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await storage.markClientConversationReadByAgent(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/**
 * GET /api/client-chat/unread-count
 * Get total unread client messages for the agent
 */
router.get("/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.user!.id;
    const count = await storage.getUnreadClientChatCountForAgent(agentId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// ============================================
// CLIENT-SIDE ROUTES (iOS App)
// ============================================

/**
 * GET /api/app/chat/conversation
 * Get the client's conversation with their agent
 */
router.get("/app/conversation", requireAuth, async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.id;
    const conversations = await storage.getClientConversationsByClientId(clientId);

    // Return the first/primary conversation (clients typically have one agent)
    if (conversations.length === 0) {
      return res.json(null);
    }

    res.json(conversations[0]);
  } catch (error) {
    console.error("Error fetching client conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * GET /api/app/chat/messages
 * Get messages for the client's conversation
 */
router.get("/app/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 100;

    const conversations = await storage.getClientConversationsByClientId(clientId);
    if (conversations.length === 0) {
      return res.json([]);
    }

    const conversationId = conversations[0].id;
    const messages = await storage.getClientMessages(conversationId, limit);

    // Mark as read when client fetches messages
    await storage.markClientConversationReadByClient(conversationId);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching client messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/app/chat/messages
 * Client sends a message to their agent
 */
router.post("/app/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const { content, messageType = "text", attachments, agentId } = req.body;
    const client = req.user!;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Get or create conversation with the agent
    let conversations = await storage.getClientConversationsByClientId(client.id);
    let conversation;

    if (conversations.length === 0) {
      // Need an agentId to create new conversation
      if (!agentId) {
        return res.status(400).json({ error: "Agent ID required for new conversation" });
      }

      const agent = await storage.getUserById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      conversation = await storage.getOrCreateClientConversation(
        client.id,
        agentId,
        `${client.firstName} ${client.lastName}`,
        `${agent.firstName} ${agent.lastName}`
      );
    } else {
      conversation = conversations[0];
    }

    const message = await storage.createClientMessage({
      conversationId: conversation.id,
      senderId: client.id,
      senderType: "client",
      senderName: `${client.firstName} ${client.lastName}`,
      content: content.trim(),
      messageType,
      attachments: attachments || null,
      isRead: false,
    });

    // Broadcast to WebSocket clients
    broadcastToClientChat(conversation.id, {
      type: "client_message",
      conversationId: conversation.id,
      message,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending client message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * PATCH /api/app/chat/read
 * Mark conversation as read by client
 */
router.patch("/app/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.id;

    const conversations = await storage.getClientConversationsByClientId(clientId);
    if (conversations.length === 0) {
      return res.status(404).json({ error: "No conversation found" });
    }

    await storage.markClientConversationReadByClient(conversations[0].id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/**
 * POST /api/app/chat/select-agent
 * Client selects their agent (creates conversation)
 */
router.post("/app/select-agent", requireAuth, async (req: Request, res: Response) => {
  try {
    const { agentId } = req.body;
    const client = req.user!;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }

    const agent = await storage.getUserById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const conversation = await storage.getOrCreateClientConversation(
      client.id,
      agentId,
      `${client.firstName} ${client.lastName}`,
      `${agent.firstName} ${agent.lastName}`
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error selecting agent:", error);
    res.status(500).json({ error: "Failed to select agent" });
  }
});

export default router;
