import { pgTable, varchar, uuid, timestamp, text, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateKey: varchar("template_key", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 30 }),
  lifecyclePhase: varchar("lifecycle_phase", { length: 30 }),
  isAutomated: boolean("is_automated").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  allowsPersonalNote: boolean("allows_personal_note").default(true),
  triggerEvent: varchar("trigger_event", { length: 50 }),
  documentTypeForPortal: varchar("document_type_for_portal", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentQueue = pgTable("document_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateKey: varchar("template_key", { length: 50 }).notNull(),
  clientUserId: uuid("client_user_id"),
  agentUserId: uuid("agent_user_id"),
  policyId: uuid("policy_id"),
  status: varchar("status", { length: 20 }).default("generating"),
  personalNote: text("personal_note"),
  generatedPdfKey: text("generated_pdf_key"),
  generatedPdfUrl: text("generated_pdf_url"),
  documentId: uuid("document_id"),
  deliveryResults: jsonb("delivery_results"),
  errorMessage: text("error_message"),
  scheduledFor: timestamp("scheduled_for"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocTemplateSchema = createInsertSchema(documentTemplates).omit({ id: true, createdAt: true });
export const insertDocQueueSchema = createInsertSchema(documentQueue).omit({ id: true, createdAt: true, updatedAt: true });
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type DocumentQueueItem = typeof documentQueue.$inferSelect;
