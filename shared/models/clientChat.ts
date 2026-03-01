/**
 * Client Chat Schema
 * Handles messaging between agents and their assigned clients
 * Used by both the web app (agents) and iOS app (clients)
 */

import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

/**
 * Client Conversations - One per client-agent pair
 * Tracks the conversation metadata and unread counts
 */
export const clientConversations = pgTable("client_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(), // References users table (client)
  agentId: varchar("agent_id").notNull(), // References users table (agent)
  clientName: text("client_name").notNull(), // Denormalized for performance
  agentName: text("agent_name").notNull(), // Denormalized for performance
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"), // Truncated preview of last message
  unreadCountAgent: integer("unread_count_agent").notNull().default(0),
  unreadCountClient: integer("unread_count_client").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure only one conversation per client-agent pair
  uniqueClientAgent: uniqueIndex("client_agent_unique_idx").on(table.clientId, table.agentId),
}));

/**
 * Client Messages - Individual messages in conversations
 */
export const clientMessages = pgTable("client_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: text("sender_type").notNull().$type<"agent" | "client">(), // Who sent this message
  senderName: text("sender_name").notNull(), // Denormalized for performance
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text").$type<"text" | "image" | "file" | "system">(),
  attachments: jsonb("attachments").$type<ClientMessageAttachment[]>(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Attachment type for client messages
 */
export interface ClientMessageAttachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  size?: string;
  mimeType?: string;
}

// Insert schemas
export const insertClientConversationSchema = createInsertSchema(clientConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  lastMessagePreview: true,
});

export const insertClientMessageSchema = createInsertSchema(clientMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type ClientConversation = typeof clientConversations.$inferSelect;
export type InsertClientConversation = z.infer<typeof insertClientConversationSchema>;

export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = z.infer<typeof insertClientMessageSchema>;
