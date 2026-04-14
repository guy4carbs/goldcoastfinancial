import { pgTable, varchar, uuid, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const contractingChecklists = pgTable("contracting_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  ndaStatus: varchar("nda_status", { length: 20 }).default("pending"),
  ndaSignedAt: timestamp("nda_signed_at"),
  ndaDocumentKey: text("nda_document_key"),
  debtRollupStatus: varchar("debt_rollup_status", { length: 20 }).default("pending"),
  debtRollupSignedAt: timestamp("debt_rollup_signed_at"),
  debtRollupDocumentKey: text("debt_rollup_document_key"),
  complianceStatus: varchar("compliance_status", { length: 20 }).default("pending"),
  complianceSignedAt: timestamp("compliance_signed_at"),
  complianceDocumentKey: text("compliance_document_key"),
  allCompleted: boolean("all_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContractingChecklistSchema = createInsertSchema(contractingChecklists).omit({ id: true, createdAt: true, updatedAt: true });
export type ContractingChecklist = typeof contractingChecklists.$inferSelect;
