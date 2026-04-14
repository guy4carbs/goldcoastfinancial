import { pgTable, varchar, uuid, timestamp, text, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const productionRecords = pgTable("production_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  carrierId: uuid("carrier_id"),
  carrierCode: varchar("carrier_code", { length: 20 }),
  agentUserId: uuid("agent_user_id").notNull(),
  writingNumber: varchar("writing_number", { length: 50 }),
  policyNumber: varchar("policy_number", { length: 50 }),
  insuredName: varchar("insured_name", { length: 200 }),
  insuredState: varchar("insured_state", { length: 2 }),
  productType: varchar("product_type", { length: 50 }),
  productName: varchar("product_name", { length: 200 }),
  faceAmount: numeric("face_amount", { precision: 12, scale: 2 }),
  annualPremium: numeric("annual_premium", { precision: 12, scale: 2 }),
  modalPremium: numeric("modal_premium", { precision: 12, scale: 2 }),
  premiumMode: varchar("premium_mode", { length: 20 }),
  applicationDate: timestamp("application_date"),
  issueDate: timestamp("issue_date"),
  paidDate: timestamp("paid_date"),
  effectiveDate: timestamp("effective_date"),
  status: varchar("status", { length: 20 }).default("submitted"),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }),
  commissionType: varchar("commission_type", { length: 20 }),
  rawPayload: jsonb("raw_payload"),
  syncedAt: timestamp("synced_at"),
  sourceType: varchar("source_type", { length: 20 }).default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carrierSyncLog = pgTable("carrier_sync_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  carrierId: uuid("carrier_id"),
  syncType: varchar("sync_type", { length: 20 }),
  status: varchar("status", { length: 20 }),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductionRecordSchema = createInsertSchema(productionRecords).omit({ id: true, createdAt: true, updatedAt: true });
export type ProductionRecord = typeof productionRecords.$inferSelect;
