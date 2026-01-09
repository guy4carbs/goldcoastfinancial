import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { storage } from "./storage";

interface ChatClient {
  ws: WebSocket;
  userId: string;
  conversationIds: Set<string>;
}

const clients = new Map<string, ChatClient>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

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
