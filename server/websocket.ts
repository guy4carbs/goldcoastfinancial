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

  // Upgrade handler: session-cookie auth. We parse the same `connect.sid`
  // cookie the REST routes use (via the shared getSessionMiddleware
  // singleton) and reject the upgrade if no session userId is present.
  // The in-band `{type:"auth", userId}` message below is preserved as a
  // no-op so stale client bundles don't error out, but the authoritative
  // userId now comes from the session — not the client's URL or message.
  server.on("upgrade", async (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname !== "/ws/chat") return;

    try {
      const { getSessionMiddleware } = await import("./routes");
      const sessionParser = getSessionMiddleware();

      sessionParser(request as any, {} as any, async () => {
        const session = (request as any).session;
        if (!session?.userId) {
          console.warn("[WebSocket /ws/chat] no session userId — rejecting upgrade");
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          return socket.destroy();
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          // Stamp the authenticated userId onto the socket so the connection
          // handler picks it up without trusting in-band messages.
          (ws as any).__authUserId = session.userId;
          wss.emit("connection", ws, request);
        });
      });
    } catch (err) {
      console.error("[WebSocket /ws/chat] upgrade error:", err);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", async (ws) => {
    // userId comes from the session, not from the client. The in-band
    // `auth` message stays around for backwards compat with bundles already
    // in users' browsers but the userId on it is now ignored.
    let userId: string | null = (ws as any).__authUserId ?? null;
    if (userId) {
      const conversations = await storage.getChatConversationsByUserId(userId);
      clients.set(userId, {
        ws,
        userId,
        conversationIds: new Set(conversations.map(c => c.id)),
      });
      ws.send(JSON.stringify({ type: "auth_success" }));
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "auth": {
            // No-op: userId is already established from the session on
            // upgrade. Stale client bundles still send this — just ack.
            if (userId) ws.send(JSON.stringify({ type: "auth_success" }));
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
