-- Founder Distributions — tracks money deposited into the Chase business
-- checking account so the three founders (Gaetano / Jack / Nick) can see how
-- the 30/30/30/10 split breaks down for any period. The split itself is
-- derived in the route handler, not stored, so changing the percentages later
-- is a one-line edit in shared/models/founders.ts (no backfill needed).
--
-- Cross-deployment dedup note (2026-05-05): the table is shared between
-- feature/hcms-foundation (goldcoastfinancial.co) and heritage-app
-- (heritagels.org) because both deployments hit the same Postgres. Today
-- only goldcoast writes here — heritage-app has no Plaid connection, no
-- founders-profit router. If heritage-app later gains its own Plaid
-- connection, deposit dedup will rely entirely on
-- plaid_pending_deposits.plaid_tx_id UNIQUE, which only enforces uniqueness
-- within a single Plaid item_id. Two independent Plaid items pointing at
-- the same bank account could produce duplicate founder_distributions
-- rows. Mitigation when/if that happens: add a brand VARCHAR(20) column
-- and a (deposit_date, amount_cents, source) cross-brand uniqueness
-- check, OR centralize Plaid ingestion behind a single deployment.

CREATE TABLE IF NOT EXISTS "founder_distributions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deposit_date" date NOT NULL,
  "amount_cents" bigint NOT NULL,
  "source" varchar(30) NOT NULL,
  "estimated_amount_cents" bigint,
  "note" text,
  "created_by_user_id" uuid NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_founder_dist_date" ON "founder_distributions" ("deposit_date");
CREATE INDEX IF NOT EXISTS "idx_founder_dist_not_deleted" ON "founder_distributions" ("deposit_date") WHERE "deleted_at" IS NULL;
