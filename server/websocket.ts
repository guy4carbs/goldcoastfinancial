import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { storage } from "./storage";

interface ChatClient {
  ws: WebSocket;
  userId: string;
  conversationIds: Set<string>;
}

// Team Chat clients
const clients = new Map<string, ChatClient>();

// Client Chat clients (agent-client messaging)
interface ClientChatConnection {
  ws: WebSocket;
  userId: string;
  userType: "agent" | "client";
  conversationIds: Set<string>;
}

const clientChatConnections = new Map<string, ClientChatConnection>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade manually
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

    if (pathname === "/ws/chat") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
    // Let other WebSocket servers handle their paths
  });

  wss.on("connection", (ws) => {
    let userId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "auth": {
            userId = message.userId;
            if (userId) {
              const conversations = await storage.getChatConversationsByUserId(userId);
              clients.set(userId, {
                ws,
                userId: userId,
                conversationIds: new Set(conversations.map(c => c.id)),
              });
              ws.send(JSON.stringify({ type: "auth_success" }));
            }
            break;
          }

          case "join_conversation": {
            if (userId && clients.has(userId)) {
              const client = clients.get(userId)!;
              client.conversationIds.add(message.conversationId);
            }
            break;
          }

          case "send_message": {
            if (!userId) {
              ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
              return;
            }

            const chatMessage = await storage.createChatMessage({
              conversationId: message.conversationId,
              senderId: userId,
              senderName: message.senderName,
              content: message.content,
              type: message.messageType || "text",
            });

            broadcastToConversation(message.conversationId, {
              type: "new_message",
              message: chatMessage,
            });
            break;
          }

          case "mark_read": {
            if (userId) {
              await storage.updateLastReadAt(userId, message.conversationId);
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return wss;
}

function broadcastToConversation(conversationId: string, message: any) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.conversationIds.has(conversationId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

export function notifyUser(userId: string, message: any) {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

// ============================================
// CLIENT CHAT WEBSOCKET (Agent-Client Messaging)
// ============================================

export function setupClientChatWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: any, socket: any, head: any) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

    if (pathname === "/ws/client-chat") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws) => {
    let connectionId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "auth": {
            const { userId, userType } = message;
            if (userId && userType) {
              connectionId = `${userType}-${userId}`;

              // Get conversations for this user
              let conversationIds: string[] = [];
              if (userType === "agent") {
                const convos = await storage.getClientConversationsByAgentId(userId);
                conversationIds = convos.map(c => c.id);
              } else {
                const convos = await storage.getClientConversationsByClientId(userId);
                conversationIds = convos.map(c => c.id);
              }

              clientChatConnections.set(connectionId, {
                ws,
                userId,
                userType,
                conversationIds: new Set(conversationIds),
              });

              ws.send(JSON.stringify({ type: "auth_success" }));
            }
            break;
          }

          case "join_client_chat": {
            if (connectionId && clientChatConnections.has(connectionId)) {
              const conn = clientChatConnections.get(connectionId)!;
              conn.conversationIds.add(message.conversationId);
            }
            break;
          }

          case "typing": {
            // Broadcast typing indicator to the other party
            if (connectionId) {
              const conn = clientChatConnections.get(connectionId);
              if (conn) {
                broadcastToClientChat(message.conversationId, {
                  type: "typing",
                  conversationId: message.conversationId,
                  userType: conn.userType,
                  isTyping: message.isTyping,
                }, connectionId); // Exclude sender
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("Client Chat WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      if (connectionId) {
        clientChatConnections.delete(connectionId);
      }
    });
  });

  return wss;
}

/**
 * Broadcast a message to all clients in a client chat conversation
 */
export function broadcastToClientChat(conversationId: string, message: any, excludeConnectionId?: string) {
  const messageStr = JSON.stringify(message);
  clientChatConnections.forEach((conn, connId) => {
    if (
      conn.conversationIds.has(conversationId) &&
      conn.ws.readyState === WebSocket.OPEN &&
      connId !== excludeConnectionId
    ) {
      conn.ws.send(messageStr);
    }
  });
}

/**
 * Notify a specific user in client chat (by userId and type)
 */
export function notifyClientChatUser(userId: string, userType: "agent" | "client", message: any) {
  const connectionId = `${userType}-${userId}`;
  const conn = clientChatConnections.get(connectionId);
  if (conn && conn.ws.readyState === WebSocket.OPEN) {
    conn.ws.send(JSON.stringify(message));
  }
}
