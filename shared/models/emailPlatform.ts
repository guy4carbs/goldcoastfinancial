/**
 * EMAIL PLATFORM TABLES
 * Drip/email-sequence engine tables shared with the Heritage email platform
 * (both services run against ONE Neon database, where these tables already
 * exist). Table/column names match the live DB exactly — copied verbatim from
 * Heritage's shared/models/enterprise.ts so Drizzle reads/writes line up with
 * the existing rows.
 *
 * Gold Coast does NOT run the drip worker (Heritage processes sequences); these
 * models back the read/write routes (sequences, email-templates) and the
 * sequence processor helpers used by enrollment.
 */

import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { leads } from "./crm";

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  category: varchar("category", { length: 100 }), // follow_up, nurture, announcement, etc.
  variables: jsonb("variables").$type<string[]>().default([]), // {{firstName}}, {{agentName}}, etc.
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

// =============================================================================
// EMAIL SEQUENCES (Drip Campaigns)
// =============================================================================

export const emailSequences = pgTable("email_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerEvent: varchar("trigger_event", { length: 100 }), // lead_created, quote_sent, appointment_missed, etc.
  steps: jsonb("steps").$type<Array<{
    templateId: string;
    delayDays: number;
    delayHours: number;
    condition?: string;
  }>>().default([]),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailSequenceSchema = createInsertSchema(emailSequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = z.infer<typeof insertEmailSequenceSchema>;

// =============================================================================
// EMAIL SEQUENCE ENROLLMENTS
// =============================================================================

export const emailSequenceEnrollments = pgTable("email_sequence_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id").references(() => emailSequences.id).notNull(),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  currentStep: integer("current_step").default(0),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, paused, completed, unsubscribed
  nextSendAt: timestamp("next_send_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
}, (table) => [
  index("idx_enrollments_next_send").on(table.nextSendAt),
  index("idx_enrollments_status").on(table.status),
]);

export const insertEmailSequenceEnrollmentSchema = createInsertSchema(emailSequenceEnrollments).omit({
  id: true,
  enrolledAt: true,
});

export type EmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferSelect;
export type InsertEmailSequenceEnrollment = z.infer<typeof insertEmailSequenceEnrollmentSchema>;

// =============================================================================
// EMAILS SENT (Log with tracking)
// =============================================================================

export const emailsSent = pgTable("emails_sent", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  fromAgentId: uuid("from_agent_id").references(() => users.id),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  sequenceId: uuid("sequence_id").references(() => emailSequences.id),
  enrollmentId: uuid("enrollment_id").references(() => emailSequenceEnrollments.id),

  // Email content
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html"),

  // Tracking
  messageId: varchar("message_id", { length: 255 }), // From email provider
  status: varchar("status", { length: 50 }).notNull().default("sent"), // sent, delivered, opened, clicked, bounced, failed
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  bouncedAt: timestamp("bounced_at"),
  bounceReason: text("bounce_reason"),

  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
}, (table) => [
  index("idx_emails_sent_lead_id").on(table.leadId),
  index("idx_emails_sent_from_agent_id").on(table.fromAgentId),
]);

export const insertEmailSentSchema = createInsertSchema(emailsSent).omit({
  id: true,
  sentAt: true,
});

export type EmailSent = typeof emailsSent.$inferSelect;
export type InsertEmailSent = z.infer<typeof insertEmailSentSchema>;
