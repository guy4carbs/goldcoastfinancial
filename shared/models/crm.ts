import { pgTable, varchar, uuid, timestamp, text, numeric, integer, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  streetAddress: varchar("street_address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  source: varchar("source", { length: 30 }).default("web_form"),
  status: varchar("status", { length: 20 }).default("new"),
  priority: varchar("priority", { length: 10 }).default("medium"),
  pipelineStage: varchar("pipeline_stage", { length: 30 }).default("new"),
  leadScore: integer("lead_score").default(0),
  scoreTier: varchar("score_tier", { length: 20 }).default("cold"),
  leadScoreTier: varchar("lead_score_tier", { length: 20 }),
  closeProbability: integer("close_probability").default(0),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  coverageType: varchar("coverage_type", { length: 50 }),
  coverageAmount: numeric("coverage_amount", { precision: 12, scale: 2 }),
  assignedTo: uuid("assigned_to"),
  enrichmentData: jsonb("enrichment_data"),
  tags: jsonb("tags").default([]),
  contactCount: integer("contact_count").default(0),
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUp: timestamp("next_follow_up"),
  distributedTo: uuid("distributed_to"),
  distributedAt: timestamp("distributed_at"),
  distributionBatchId: uuid("distribution_batch_id"),
  convertedUserId: uuid("converted_user_id"),
  convertedAt: timestamp("converted_at"),
  lostReason: text("lost_reason"),
  wonAmount: numeric("won_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("idx_leads_status").on(t.status), index("idx_leads_stage").on(t.pipelineStage), index("idx_leads_assigned").on(t.assignedTo), index("idx_leads_source").on(t.source)]);

export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  oldStatus: varchar("old_status", { length: 30 }),
  newStatus: varchar("new_status", { length: 30 }),
  performedBy: uuid("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importHistory = pgTable("import_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  totalRows: integer("total_rows").default(0),
  importedRows: integer("imported_rows").default(0),
  skippedRows: integer("skipped_rows").default(0),
  errorRows: integer("error_rows").default(0),
  source: varchar("source", { length: 30 }),
  errorDetails: jsonb("error_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export type Lead = typeof leads.$inferSelect;
export type LeadActivity = typeof leadActivities.$inferSelect;
