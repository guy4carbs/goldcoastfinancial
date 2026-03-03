import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// SMS Conversations - one per phone number
export const smsConversations = pgTable("sms_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number").notNull().unique(),
  contactName: text("contact_name"),
  leadId: varchar("lead_id"),
  agentId: varchar("agent_id"),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  unreadCount: integer("unread_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SMS Messages - individual messages in a conversation
export const smsMessages = pgTable("sms_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  direction: text("direction").notNull().$type<"inbound" | "outbound">(),
  from: varchar("from_number").notNull(),
  to: varchar("to_number").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued").$type<"queued" | "sent" | "delivered" | "failed" | "undelivered" | "received">(),
  twilioSid: varchar("twilio_sid"),
  errorCode: varchar("error_code"),
  errorMessage: text("error_message"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertSmsConversationSchema = createInsertSchema(smsConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  lastMessagePreview: true,
});

export const insertSmsMessageSchema = createInsertSchema(smsMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type SmsConversation = typeof smsConversations.$inferSelect;
export type InsertSmsConversation = z.infer<typeof insertSmsConversationSchema>;
export type SmsMessage = typeof smsMessages.$inferSelect;
export type InsertSmsMessage = z.infer<typeof insertSmsMessageSchema>;
