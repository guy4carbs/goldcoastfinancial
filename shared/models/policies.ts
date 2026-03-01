import { pgTable, text, varchar, integer, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Policy status enum
export const policyStatusEnum = ["active", "pending", "lapsed", "cancelled", "expired"] as const;
export type PolicyStatus = (typeof policyStatusEnum)[number];

// Coverage type enum
export const coverageTypeEnum = [
  "term_life", "whole_life", "universal_life", "iul",
  "final_expense", "health", "medicare", "annuity", "other"
] as const;
export type CoverageType = (typeof coverageTypeEnum)[number];

// Agent Policies table
export const agentPolicies = pgTable("agent_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  policyNumber: text("policy_number"),
  carrier: text("carrier"),
  coverageType: text("coverage_type").default("term_life"),
  status: text("status").notNull().default("active"),
  clientName: text("client_name"),
  premiumAmount: integer("premium_amount"), // monthly premium in cents
  coverageAmount: integer("coverage_amount"), // face value in dollars
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_policies_user_id").on(table.userId),
  index("idx_agent_policies_state").on(table.stateCode),
  index("idx_agent_policies_status").on(table.status),
]);

// Insert schema
export const insertAgentPolicySchema = createInsertSchema(agentPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type AgentPolicy = typeof agentPolicies.$inferSelect;
export type InsertAgentPolicy = z.infer<typeof insertAgentPolicySchema>;
