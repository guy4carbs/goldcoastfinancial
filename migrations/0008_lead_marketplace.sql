-- Lead Marketplace (Vector / Wave 1)
--
-- Adds three tables for lead-revenue tracking and Stripe webhook idempotency:
--
--   1. lead_products         — catalog of buyable lead types. Holds both
--                              priceCents (agent-facing) and vendorCostCents
--                              (finance-only — never returned from agent
--                              endpoints).
--   2. lead_purchases        — promoted from raw SQL placeholder in
--                              server/db.ts. Existing column shape preserved
--                              so already-written rows survive. Adds
--                              lead_product_id (FK, nullable for backfill),
--                              vendor_cost_cents_snapshot (so historical
--                              profit doesn't mutate when a product's cost
--                              changes), stripe_checkout_session_id, currency.
--   3. stripe_webhook_events — append-only idempotency log. Conduit's
--                              webhook handler inserts here BEFORE touching
--                              any business table; UNIQUE index on
--                              stripe_event_id makes retries no-op.
--
-- Indexes added on lead_purchases:
--   - idx_lead_purchases_product_id
--   - idx_lead_purchases_created_at
--   - idx_lead_purchases_status_created_at  (composite)
-- Indexes added on stripe_webhook_events:
--   - idx_stripe_webhook_events_event_id (UNIQUE)
--
-- Seed data: only Consolidation + Survey are buyable now (active=true,
-- comingSoon=false). Live IUL + High Intent IUL are visible-but-disabled
-- (active=true, comingSoon=true). AI Qualified Inbound is hidden entirely
-- (active=false, comingSoon=true) because we don't yet know the vendor cost.
--
-- This migration is idempotent — every CREATE / ALTER uses IF NOT EXISTS,
-- and the seed uses ON CONFLICT (slug) DO NOTHING.

-- ─── lead_products ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "lead_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(60) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price_cents" integer NOT NULL,
  "vendor_cost_cents" integer NOT NULL,
  "stripe_product_id" varchar(255),
  "stripe_price_id" varchar(255),
  "active" boolean NOT NULL DEFAULT true,
  "coming_soon" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_products_slug_unique"
  ON "lead_products" ("slug");
CREATE INDEX IF NOT EXISTS "idx_lead_products_active"
  ON "lead_products" ("active");

-- ─── lead_purchases ────────────────────────────────────────────────────────
-- The placeholder in server/db.ts already creates this table at boot via
-- CREATE TABLE IF NOT EXISTS. We CREATE IF NOT EXISTS here too so a fresh
-- environment that skips db.ts bootstrapping still gets the table, then
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS for the new columns so the
-- migration is safe to re-run and safe against already-populated rows.
CREATE TABLE IF NOT EXISTS "lead_purchases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "agent_user_id" uuid NOT NULL,
  "lead_type" varchar(100) NOT NULL,
  "price_cents" integer NOT NULL,
  "quantity" integer DEFAULT 1,
  "stripe_payment_intent_id" varchar(255),
  "stripe_status" varchar(50) DEFAULT 'pending',
  "status" varchar(20) DEFAULT 'pending',
  "purchased_at" timestamp DEFAULT now(),
  "delivered_at" timestamp,
  "states" jsonb,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "lead_purchases"
  ADD COLUMN IF NOT EXISTS "lead_product_id" uuid REFERENCES "lead_products"("id");

ALTER TABLE "lead_purchases"
  ADD COLUMN IF NOT EXISTS "vendor_cost_cents_snapshot" integer NOT NULL DEFAULT 0;

ALTER TABLE "lead_purchases"
  ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" varchar(255);

ALTER TABLE "lead_purchases"
  ADD COLUMN IF NOT EXISTS "currency" varchar(3) NOT NULL DEFAULT 'usd';

-- Existing indexes from server/db.ts (idx_lead_purchases_agent,
-- idx_lead_purchases_status) are left in place. New indexes:
CREATE INDEX IF NOT EXISTS "idx_lead_purchases_product_id"
  ON "lead_purchases" ("lead_product_id");
CREATE INDEX IF NOT EXISTS "idx_lead_purchases_created_at"
  ON "lead_purchases" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_lead_purchases_status_created_at"
  ON "lead_purchases" ("status", "created_at");

-- ─── stripe_webhook_events ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "stripe_event_id" varchar(255) NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "payload" jsonb,
  "processed_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_stripe_webhook_events_event_id"
  ON "stripe_webhook_events" ("stripe_event_id");
CREATE INDEX IF NOT EXISTS "idx_stripe_webhook_events_type"
  ON "stripe_webhook_events" ("event_type");

-- ─── seed lead_products ────────────────────────────────────────────────────
-- Only Consolidation + Survey are live. Live IUL + High Intent IUL show as
-- "Coming Soon" per the agent UI screenshot. AI Qualified Inbound is
-- excluded entirely until we know the vendor cost.
INSERT INTO "lead_products"
  ("slug", "name", "description", "price_cents", "vendor_cost_cents", "active", "coming_soon")
VALUES
  ('consolidation',         'Consolidation',         'Debt-consolidation lead.',                                 99,    50,    true,  false),
  ('survey',                'Survey',                'Survey-completion lead.',                                  50,    25,    true,  false),
  ('live_iul',              'Live IUL',              'Live-transfer Indexed Universal Life lead.',               6000,  5000,  true,  true),
  ('high_intent_iul',       'High Intent IUL',       'High-intent Indexed Universal Life lead.',                 11000, 10000, true,  true),
  ('ai_qualified_inbound',  'AI Qualified Inbound',  'AI-qualified inbound lead. Hidden until vendor cost set.', 3000,  0,     false, true)
ON CONFLICT ("slug") DO NOTHING;
