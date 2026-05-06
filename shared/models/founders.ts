import { pgTable, varchar, uuid, timestamp, text, boolean, integer, bigint, jsonb, date, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// BOARD DECISIONS
// ============================================

export const boardDecisions = pgTable("board_decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  proposedBy: uuid("proposed_by").notNull(),
  approvedBy: uuid("approved_by"),
  status: varchar("status", { length: 30 }).notNull().default("proposed"),
  emergency: boolean("emergency").notNull().default(false),
  note: text("note"),
  // Sentinel C2 / Helix M2: justification captured at proposal time when
  // `emergency=true`. Emergency is a priority marker only — never a quorum
  // bypass — but the reason for flagging it must be persisted for audit.
  emergencyNote: text("emergency_note"),
  proposedAt: timestamp("proposed_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  executedAt: timestamp("executed_at"),
  reversedAt: timestamp("reversed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("idx_board_decisions_status").on(t.status), index("idx_board_decisions_proposed_by").on(t.proposedBy)]);

export const insertBoardDecisionSchema = createInsertSchema(boardDecisions).omit({ id: true, createdAt: true, updatedAt: true });
export type BoardDecision = typeof boardDecisions.$inferSelect;

export const BOARD_DECISION_STATUSES = ["proposed", "approved", "rejected", "reversed", "executed"] as const;

// ============================================
// BOARD VOTES
// ============================================

export const boardVotes = pgTable("board_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  decisionId: uuid("decision_id").notNull().references(() => boardDecisions.id, { onDelete: "cascade" }),
  voterUserId: uuid("voter_user_id").notNull(),
  vote: varchar("vote", { length: 20 }).notNull(),
  note: text("note"),
  votedAt: timestamp("voted_at").defaultNow(),
}, (t) => [
  index("idx_board_votes_decision").on(t.decisionId),
  index("idx_board_votes_voter").on(t.voterUserId),
  // Helix M3: one vote per voter per decision. The route rejects re-votes with
  // VOTE_ALREADY_CAST; this constraint is the DB-level backstop.
  uniqueIndex("board_votes_unique_voter_decision").on(t.decisionId, t.voterUserId),
]);

export const insertBoardVoteSchema = createInsertSchema(boardVotes).omit({ id: true, votedAt: true });
export type BoardVote = typeof boardVotes.$inferSelect;

export const BOARD_VOTE_CHOICES = ["approve", "reject", "abstain"] as const;

// ============================================
// CAPITAL ALLOCATIONS
// ============================================

export const capitalAllocations = pgTable("capital_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  period: varchar("period", { length: 20 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  approvedCents: bigint("approved_cents", { mode: "number" }).notNull().default(0),
  committedCents: bigint("committed_cents", { mode: "number" }).notNull().default(0),
  spentCents: bigint("spent_cents", { mode: "number" }).notNull().default(0),
  proposedBy: uuid("proposed_by").notNull(),
  approvedBy: uuid("approved_by"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  note: text("note"),
  // Helix M1 / M4: these timestamps make the atomic approve and the 24h
  // reversal window possible. Prior schema relied on updated_at, which doesn't
  // distinguish approval from subsequent commit/spend updates.
  approvedAt: timestamp("approved_at"),
  reversedAt: timestamp("reversed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_capital_allocations_period").on(t.period),
  index("idx_capital_allocations_category").on(t.category),
  index("idx_capital_allocations_status").on(t.status),
]);

export const insertCapitalAllocationSchema = createInsertSchema(capitalAllocations).omit({ id: true, createdAt: true, updatedAt: true });
export type CapitalAllocation = typeof capitalAllocations.$inferSelect;

export const CAPITAL_ALLOCATION_CATEGORIES = [
  "marketing_lead_gen",
  "recruiting",
  "technology",
  "training",
  "bonuses",
  "operations",
  "cash_reserves",
  "contingency",
] as const;

export const CAPITAL_ALLOCATION_STATUSES = ["pending", "approved", "rejected", "reversed"] as const;

// ============================================
// FOUNDER DISTRIBUTIONS (30/30/30/10 split)
// ============================================

export const founderDistributions = pgTable("founder_distributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  depositDate: date("deposit_date").notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  source: varchar("source", { length: 30 }).notNull(),
  estimatedAmountCents: bigint("estimated_amount_cents", { mode: "number" }),
  note: text("note"),
  createdByUserId: uuid("created_by_user_id").notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_founder_dist_date").on(t.depositDate),
]);

export const insertFounderDistributionSchema = createInsertSchema(founderDistributions).omit({ id: true, createdAt: true, deletedAt: true });
export type FounderDistribution = typeof founderDistributions.$inferSelect;

export const FOUNDER_DISTRIBUTION_SOURCES = ["commission", "override", "other"] as const;

// Split recipients — derived, not stored. Order is significant: founders first
// then retained, so UI grids and chart bands render in the same sequence.
// Changing percentages here is a one-line edit; no backfill needed because the
// `founder_distributions` table only stores the gross deposit.
export const SPLIT_RECIPIENTS = [
  { key: "gaetano",  fullName: "Gaetano Carbonara",   pct: 0.30 },
  { key: "jack",     fullName: "Jack Cook",           pct: 0.30 },
  { key: "nicholas", fullName: "Nicholas Gallagher",  pct: 0.30 },
  { key: "retained", fullName: "Business Reserves",   pct: 0.10 },
] as const;

export type SplitRecipientKey = (typeof SPLIT_RECIPIENTS)[number]["key"];

// ============================================
// PLAID CONNECTION (Chase business checking)
// ============================================

// One row per linked institution. The access_token is encrypted at the
// application layer (AES-256-GCM via encryptionService) before it touches the
// DB. NEVER expose access_token over the API; only safe metadata.
export const plaidItems = pgTable("plaid_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: varchar("item_id", { length: 100 }).notNull().unique(),
  institutionId: varchar("institution_id", { length: 60 }),
  institutionName: varchar("institution_name", { length: 100 }),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  cursor: text("cursor"),
  status: varchar("status", { length: 30 }).notNull().default("active"),
  error: text("error"),
  syncedAt: timestamp("synced_at"),
  createdByUserId: uuid("created_by_user_id").notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_plaid_items_status").on(t.status),
]);

export type PlaidItem = typeof plaidItems.$inferSelect;

// Plaid-detected credits awaiting founder review. Promoted into
// founder_distributions on Confirm; marked declined on Skip. Idempotent on
// plaidTxId — re-receiving the same Plaid transaction never duplicates a row.
export const plaidPendingDeposits = pgTable("plaid_pending_deposits", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id"),
  plaidTxId: varchar("plaid_tx_id", { length: 100 }).notNull().unique(),
  accountId: varchar("account_id", { length: 100 }).notNull(),
  postedDate: date("posted_date").notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  merchantName: varchar("merchant_name", { length: 200 }),
  description: text("description"),
  paymentChannel: varchar("payment_channel", { length: 30 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  promotedDistributionId: uuid("promoted_distribution_id"),
  reviewedByUserId: uuid("reviewed_by_user_id"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_plaid_pending_status").on(t.status),
  index("idx_plaid_pending_date").on(t.postedDate),
]);

export type PlaidPendingDeposit = typeof plaidPendingDeposits.$inferSelect;

export const PLAID_PENDING_STATUSES = ["pending", "confirmed", "declined"] as const;
export const PLAID_ITEM_STATUSES = ["active", "error", "revoked"] as const;

// ============================================
// M&A PIPELINE ITEMS
// ============================================

export const maPipelineItems = pgTable("ma_pipeline_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  targetName: varchar("target_name", { length: 255 }).notNull(),
  kind: varchar("kind", { length: 30 }).notNull(),
  stage: varchar("stage", { length: 30 }).notNull().default("prospect"),
  dealValueCents: bigint("deal_value_cents", { mode: "number" }),
  healthScore: integer("health_score").default(0),
  ownerUserId: uuid("owner_user_id").notNull(),
  nextAction: varchar("next_action", { length: 255 }),
  nextActionDate: date("next_action_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_ma_pipeline_stage").on(t.stage),
  index("idx_ma_pipeline_owner").on(t.ownerUserId),
  index("idx_ma_pipeline_kind").on(t.kind),
]);

export const insertMaPipelineItemSchema = createInsertSchema(maPipelineItems).omit({ id: true, createdAt: true, updatedAt: true });
export type MaPipelineItem = typeof maPipelineItems.$inferSelect;

export const MA_PIPELINE_KINDS = ["acquisition", "partnership", "carrier", "vendor", "imo"] as const;
export const MA_PIPELINE_STAGES = ["prospect", "intro", "loi", "diligence", "closed_won", "closed_lost", "on_ice"] as const;

// ============================================
// FOUNDER AUDIT LOG
// ============================================

export const founderAuditLog = pgTable("founder_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Helix M5: nullable. A NULL actor represents a system/background action
  // (e.g. the seed-founders script granting founder role). Human-initiated
  // writes should always populate this — the route handlers do — but the
  // column can't be NOT NULL if automated scripts also need to log here.
  actorUserId: uuid("actor_user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: uuid("entity_id"),
  brand: varchar("brand", { length: 20 }).notNull().default("both"),
  payload: jsonb("payload"),
  viewingAs: uuid("viewing_as"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_founder_audit_created").on(t.createdAt),
  index("idx_founder_audit_actor").on(t.actorUserId),
  index("idx_founder_audit_entity").on(t.entityType, t.entityId),
]);

export const insertFounderAuditLogSchema = createInsertSchema(founderAuditLog).omit({ id: true, createdAt: true });
export type FounderAuditLog = typeof founderAuditLog.$inferSelect;

export const AUDIT_BRANDS = ["gc", "heritage", "both"] as const;

// ============================================
// VIEW-AS SESSIONS
// ============================================

export const viewAsSessions = pgTable("view_as_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  founderUserId: uuid("founder_user_id").notNull(),
  targetUserId: uuid("target_user_id").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  reason: text("reason"),
}, (t) => [
  index("idx_view_as_founder").on(t.founderUserId),
  index("idx_view_as_target").on(t.targetUserId),
  index("idx_view_as_started").on(t.startedAt),
]);

export const insertViewAsSessionSchema = createInsertSchema(viewAsSessions).omit({ id: true, startedAt: true });
export type ViewAsSession = typeof viewAsSessions.$inferSelect;
