-- Founder Distributions — tracks money deposited into the Chase business
-- checking account so the three founders (Gaetano / Jack / Nick) can see how
-- the 30/30/30/10 split breaks down for any period. The split itself is
-- derived in the route handler, not stored, so changing the percentages later
-- is a one-line edit in shared/models/founders.ts (no backfill needed).

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
