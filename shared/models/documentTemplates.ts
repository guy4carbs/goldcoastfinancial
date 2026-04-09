import { pgTable, text, timestamp, varchar, boolean, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { users } from "./auth";
import { policies } from "./portal";

// =============================================================================
// DOCUMENT TEMPLATES — Template definitions for automated document generation
// =============================================================================

export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateKey: varchar("template_key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // onboarding, annual, claims, beneficiary, billing, correspondence
  lifecyclePhase: varchar("lifecycle_phase", { length: 50 }).notNull(), // onboarding, annual_ongoing, claims, beneficiary_service
  isAutomated: boolean("is_automated").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  allowsPersonalNote: boolean("allows_personal_note").default(false),
  triggerEvent: varchar("trigger_event", { length: 100 }),
  documentTypeForPortal: varchar("document_type_for_portal", { length: 50 }).notNull(), // maps to ClientDocuments category
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates);
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

// =============================================================================
// DOCUMENT QUEUE — Tracks generated documents through lifecycle
// =============================================================================

export const documentQueue = pgTable("document_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateKey: varchar("template_key", { length: 100 }).notNull(),
  clientUserId: uuid("client_user_id").notNull().references(() => users.id),
  agentUserId: uuid("agent_user_id").notNull().references(() => users.id),
  policyId: uuid("policy_id").references(() => policies.id),
  claimId: varchar("claim_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("generating"), // generating, pending_review, approved, sending, sent, failed, cancelled
  personalNote: text("personal_note"),
  generatedPdfKey: varchar("generated_pdf_key", { length: 500 }),
  generatedPdfUrl: varchar("generated_pdf_url", { length: 1000 }),
  documentId: uuid("document_id"), // references documents.id after delivery
  deliveryResults: jsonb("delivery_results").$type<{
    email?: { sent: boolean; messageId?: string; error?: string };
    sms?: { sent: boolean; error?: string };
    notification?: { sent: boolean };
    chat?: { sent: boolean };
    portal?: { sent: boolean; documentId?: string };
  }>(),
  errorMessage: text("error_message"),
  scheduledFor: timestamp("scheduled_for"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_doc_queue_client").on(table.clientUserId),
  index("idx_doc_queue_agent").on(table.agentUserId),
  index("idx_doc_queue_status").on(table.status),
  index("idx_doc_queue_template").on(table.templateKey),
  index("idx_doc_queue_scheduled").on(table.scheduledFor),
]);

export const insertDocumentQueueSchema = createInsertSchema(documentQueue);
export type DocumentQueueEntry = typeof documentQueue.$inferSelect;
export type InsertDocumentQueueEntry = typeof documentQueue.$inferInsert;
