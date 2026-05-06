import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  text,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ============================================================================
// LEAD MARKETPLACE — Vector / Wave 1
//
// Three tables that own lead-revenue tracking and Stripe webhook idempotency:
//
//   1. lead_products        — catalog of buyable lead types (Consolidation,
//                             Survey, Live IUL, etc). Holds both the agent-
//                             facing price and the in-house vendor cost so
//                             Ledger can compute profit. `vendorCostCents`
//                             must NEVER be returned from agent-facing
//                             endpoints — it is finance-only.
//   2. lead_purchases       — promoted from raw SQL placeholder in server/db.ts.
//                             Existing column shape is preserved so the rows
//                             that already live in the live db survive. Adds
//                             the FK to lead_products plus a snapshot of the
//                             vendor cost at purchase time so historical
//                             profit doesn't mutate when a product's cost
//                             later changes.
//   3. stripe_webhook_events — append-only idempotency log. The Stripe
//                             webhook handler (Conduit) inserts here before
//                             touching any business table; a UNIQUE index on
//                             stripe_event_id makes retries no-op.
//
// Conventions match the rest of shared/models/*: snake_case columns, camelCase
// TS identifiers, uuid primary keys with defaultRandom(), timestamps via
// defaultNow(). Indexes declared via the table-extras callback.
// ============================================================================

export const LEAD_PRODUCT_SLUGS = [
  "consolidation",
  "survey",
  "live_iul",
  "high_intent_iul",
  "ai_qualified_inbound",
] as const;

export type LeadProductSlug = (typeof LEAD_PRODUCT_SLUGS)[number];

export const leadProducts = pgTable(
  "lead_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 60 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // What the agent pays (cents). Always exposed.
    priceCents: integer("price_cents").notNull(),
    // What we pay the in-house vendor (cents). Finance-only — must NEVER be
    // returned from agent-facing endpoints. Forge / Ledger to enforce at the
    // route layer.
    vendorCostCents: integer("vendor_cost_cents").notNull(),
    stripeProductId: varchar("stripe_product_id", { length: 255 }),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    active: boolean("active").notNull().default(true),
    comingSoon: boolean("coming_soon").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("lead_products_slug_unique").on(t.slug),
    index("idx_lead_products_active").on(t.active),
  ],
);

export const insertLeadProductSchema = createInsertSchema(leadProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadProduct = typeof leadProducts.$inferSelect;
export type InsertLeadProduct = typeof leadProducts.$inferInsert;

// ----------------------------------------------------------------------------
// lead_purchases — promoted from raw SQL placeholder at server/db.ts:1187-1204.
// Column names + types are identical to the placeholder so existing rows are
// preserved; new columns are appended. `leadProductId` is nullable so a
// future backfill can populate it from `leadType` without breaking inserts.
// ----------------------------------------------------------------------------

export const leadPurchases = pgTable(
  "lead_purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentUserId: uuid("agent_user_id").notNull(),
    // Legacy free-form lead type string — kept for backwards compat with
    // existing rows. New writes should also set leadProductId.
    leadType: varchar("lead_type", { length: 100 }).notNull(),
    priceCents: integer("price_cents").notNull(),
    quantity: integer("quantity").default(1),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    stripeStatus: varchar("stripe_status", { length: 50 }).default("pending"),
    status: varchar("status", { length: 20 }).default("pending"),
    purchasedAt: timestamp("purchased_at").defaultNow(),
    deliveredAt: timestamp("delivered_at"),
    states: jsonb("states"),
    createdAt: timestamp("created_at").defaultNow(),
    // ── new columns (Vector / Wave 1) ────────────────────────────────────
    // FK is nullable initially so backfill can run without violating the
    // constraint. Forge will tighten to NOT NULL in a later migration once
    // all existing rows have been mapped to a product.
    leadProductId: uuid("lead_product_id").references(() => leadProducts.id),
    // Snapshot of the vendor cost at purchase time. Default 0 covers the
    // existing rows that pre-date this migration; new inserts must always
    // populate it from the matching lead_products.vendor_cost_cents so
    // historical profit doesn't shift when a product's cost is updated.
    vendorCostCentsSnapshot: integer("vendor_cost_cents_snapshot")
      .notNull()
      .default(0),
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
      length: 255,
    }),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  },
  (t) => [
    index("idx_lead_purchases_agent").on(t.agentUserId),
    index("idx_lead_purchases_status").on(t.status),
    index("idx_lead_purchases_product_id").on(t.leadProductId),
    index("idx_lead_purchases_created_at").on(t.createdAt),
    index("idx_lead_purchases_status_created_at").on(t.status, t.createdAt),
  ],
);

export const insertLeadPurchaseSchema = createInsertSchema(leadPurchases).omit({
  id: true,
  createdAt: true,
  purchasedAt: true,
});

export type LeadPurchase = typeof leadPurchases.$inferSelect;
export type InsertLeadPurchase = typeof leadPurchases.$inferInsert;

// ----------------------------------------------------------------------------
// stripe_webhook_events — append-only idempotency log for the Stripe webhook
// handler (Conduit). The handler inserts here BEFORE touching any business
// table; the UNIQUE index on stripe_event_id makes retries safe. Payload is
// retained for audit / replay.
// ----------------------------------------------------------------------------

export const stripeWebhookEvents = pgTable(
  "stripe_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload"),
    processedAt: timestamp("processed_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_stripe_webhook_events_event_id").on(t.stripeEventId),
    index("idx_stripe_webhook_events_type").on(t.eventType),
  ],
);

export const insertStripeWebhookEventSchema = createInsertSchema(
  stripeWebhookEvents,
).omit({
  id: true,
  processedAt: true,
});

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type InsertStripeWebhookEvent =
  typeof stripeWebhookEvents.$inferInsert;
