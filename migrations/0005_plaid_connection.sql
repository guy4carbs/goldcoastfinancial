-- Plaid Connection — stores the encrypted access_token per linked Item
-- (Chase business checking is one Item) plus a "Pending Review" tray of
-- detected credits that founders confirm before they hit the founder
-- distributions ledger.

CREATE TABLE IF NOT EXISTS "plaid_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "item_id" varchar(100) NOT NULL UNIQUE,
  "institution_id" varchar(60),
  "institution_name" varchar(100),
  "access_token_encrypted" text NOT NULL,
  "cursor" text,
  "status" varchar(30) DEFAULT 'active' NOT NULL,
  "error" text,
  "synced_at" timestamp,
  "created_by_user_id" uuid NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_plaid_items_status" ON "plaid_items" ("status");

CREATE TABLE IF NOT EXISTS "plaid_pending_deposits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid REFERENCES "plaid_items"("id") ON DELETE CASCADE,
  "plaid_tx_id" varchar(100) NOT NULL UNIQUE,
  "account_id" varchar(100) NOT NULL,
  "posted_date" date NOT NULL,
  "amount_cents" bigint NOT NULL,
  "merchant_name" varchar(200),
  "description" text,
  "payment_channel" varchar(30),
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "promoted_distribution_id" uuid,
  "reviewed_by_user_id" uuid,
  "reviewed_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_plaid_pending_status" ON "plaid_pending_deposits" ("status");
CREATE INDEX IF NOT EXISTS "idx_plaid_pending_date" ON "plaid_pending_deposits" ("posted_date");
