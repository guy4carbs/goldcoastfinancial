import { pgTable, varchar, uuid, timestamp, text, numeric, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const HIERARCHY_LEVELS: Record<number, string> = { 0: "Founder", 1: "Diamond Director", 2: "Platinum Director", 3: "Regional Manager", 4: "Team Lead", 5: "Senior Agent", 6: "Agent", 7: "Associate Agent" };
export const HIERARCHY_TITLES = HIERARCHY_LEVELS;

export const commissions = pgTable("commissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  policyId: uuid("policy_id"),
  dealId: uuid("deal_id"),
  commissionType: varchar("commission_type", { length: 30 }).notNull().default("first_year"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  premiumAmount: numeric("premium_amount", { precision: 12, scale: 2 }),
  policyYear: integer("policy_year").default(1),
  status: varchar("status", { length: 20 }).default("pending"),
  chargebackOf: uuid("chargeback_of"),
  uplineAgentId: uuid("upline_agent_id"),
  overrideLevel: integer("override_level"),
  periodYear: integer("period_year"),
  periodMonth: integer("period_month"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agentHierarchy = pgTable("agent_hierarchy", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  directUplineId: uuid("direct_upline_id"),
  hierarchyLevel: integer("hierarchy_level").notNull().default(6),
  hierarchyTitle: varchar("hierarchy_title", { length: 100 }),
  uplineChain: jsonb("upline_chain").default([]),
  contractLevel: numeric("contract_level", { precision: 5, scale: 2 }).default("80"),
  overrideEligible: boolean("override_eligible").default(false),
  overridePercentage: numeric("override_percentage", { precision: 5, scale: 2 }).default("0"),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("idx_hierarchy_agent").on(t.agentUserId), index("idx_hierarchy_upline").on(t.directUplineId)]);

export const hierarchyRequests = pgTable("hierarchy_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  requestType: varchar("request_type", { length: 30 }).notNull(),
  currentValue: text("current_value"),
  requestedValue: text("requested_value"),
  justification: text("justification"),
  status: varchar("status", { length: 30 }).default("pending_manager"),
  reviewedBy: uuid("reviewed_by"),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  executiveReviewedBy: uuid("executive_reviewed_by"),
  executiveReviewNotes: text("executive_review_notes"),
  executiveReviewedAt: timestamp("executive_reviewed_at"),
  requestedBy: uuid("requested_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commissionTargets = pgTable("commission_targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  scope: varchar("scope", { length: 20 }).notNull().default("agency_default"),
  agentUserId: uuid("agent_user_id"),
  hierarchyLevel: integer("hierarchy_level"),
  minContractLevel: numeric("min_contract_level", { precision: 5, scale: 2 }),
  maxContractLevel: numeric("max_contract_level", { precision: 5, scale: 2 }),
  defaultContractLevel: numeric("default_contract_level", { precision: 5, scale: 2 }),
  levelProgression: jsonb("level_progression").default([]),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  setBy: uuid("set_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commissionAuditLog = pgTable("commission_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  action: varchar("action", { length: 50 }).notNull(),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  performedBy: uuid("performed_by"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentPerformanceSnapshots = pgTable("agent_performance_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  periodType: varchar("period_type", { length: 20 }).default("monthly"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  totalDeals: integer("total_deals").default(0),
  totalPremium: numeric("total_premium", { precision: 12, scale: 2 }).default("0"),
  totalCommissions: numeric("total_commissions", { precision: 12, scale: 2 }).default("0"),
  policiesIssued: integer("policies_issued").default(0),
  closingRate: numeric("closing_rate", { precision: 5, scale: 2 }),
  ranking: integer("ranking"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentGoals = pgTable("agent_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  goalType: varchar("goal_type", { length: 30 }).notNull(),
  targetValue: numeric("target_value", { precision: 12, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 12, scale: 2 }).default("0"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHierarchySchema = createInsertSchema(agentHierarchy).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHierarchyRequestSchema = createInsertSchema(hierarchyRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommissionTargetSchema = createInsertSchema(commissionTargets).omit({ id: true, createdAt: true, updatedAt: true });

export type Commission = typeof commissions.$inferSelect;
export type AgentHierarchy = typeof agentHierarchy.$inferSelect;
export type HierarchyRequest = typeof hierarchyRequests.$inferSelect;
export type CommissionTarget = typeof commissionTargets.$inferSelect;
