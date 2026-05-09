import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar, integer, boolean, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  policyNumber: varchar("policy_number").notNull().unique(),
  type: varchar("type").notNull(),
  status: varchar("status").notNull().default("active"),
  coverageAmount: integer("coverage_amount").notNull(),
  monthlyPremium: decimal("monthly_premium", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  beneficiaryName: varchar("beneficiary_name"),
  beneficiaryRelationship: varchar("beneficiary_relationship"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  policyId: uuid("policy_id").references(() => policies.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  category: varchar("category").notNull(),
  fileSize: varchar("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  fromName: varchar("from_name").notNull(),
  fromEmail: varchar("from_email"),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  isFromClient: boolean("is_from_client").default(false),
  priority: varchar("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billingHistory = pgTable("billing_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  policyId: uuid("policy_id").references(() => policies.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({
  id: true,
  createdAt: true,
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type BillingHistory = typeof billingHistory.$inferSelect;
export type InsertBillingHistory = z.infer<typeof insertBillingHistorySchema>;

// =============================================================================
// FOUNDER SETTINGS (Wave AF1) — per-founder UI preferences persisted server
// side so they travel across devices. One row per founder, keyed by user_id.
// settings is a free-form JSONB blob (notifications, feature flags, theme).
// =============================================================================
export const founderSettings = pgTable("founder_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  settings: jsonb("settings").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFounderSettingsSchema = createInsertSchema(founderSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FounderSettings = typeof founderSettings.$inferSelect;
export type InsertFounderSettings = z.infer<typeof insertFounderSettingsSchema>;

// =============================================================================
// AUTH EMAIL OTP (Wave AH2) — 6-digit codes for the Touch ID fallback. Codes
// are bcrypt-hashed before insert (never stored plaintext). Rate-limit policy
// enforced server-side in services/emailOtp.ts.
// =============================================================================
export const authEmailOtp = pgTable("auth_email_otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuthEmailOtp = typeof authEmailOtp.$inferSelect;
