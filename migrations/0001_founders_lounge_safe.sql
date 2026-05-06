-- Founders Lounge — lean, idempotent subset of 0001_founders_lounge.sql.
-- Applies ONLY the 7 founders tables + their indexes + the board_votes FK.
-- Safe to run against a DB that already has an unrelated set of tables from
-- other branches (e.g. heritage-app) because every statement uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS "board_decisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "body" text,
  "proposed_by" uuid NOT NULL,
  "approved_by" uuid,
  "status" varchar(30) DEFAULT 'proposed' NOT NULL,
  "emergency" boolean DEFAULT false NOT NULL,
  "note" text,
  "emergency_note" text,
  "proposed_at" timestamp DEFAULT now(),
  "approved_at" timestamp,
  "executed_at" timestamp,
  "reversed_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "board_votes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "decision_id" uuid NOT NULL,
  "voter_user_id" uuid NOT NULL,
  "vote" varchar(20) NOT NULL,
  "note" text,
  "voted_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "cap_table_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "holder_name" varchar(255) NOT NULL,
  "holder_user_id" uuid,
  "share_class" varchar(30) NOT NULL,
  "shares" integer NOT NULL,
  "grant_date" date,
  "vesting_start" date,
  "vesting_months" integer,
  "cliff_months" integer,
  "accelerated_on_change" boolean DEFAULT false,
  "notes" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "capital_allocations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "period" varchar(20) NOT NULL,
  "category" varchar(40) NOT NULL,
  "approved_cents" bigint DEFAULT 0 NOT NULL,
  "committed_cents" bigint DEFAULT 0 NOT NULL,
  "spent_cents" bigint DEFAULT 0 NOT NULL,
  "proposed_by" uuid NOT NULL,
  "approved_by" uuid,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "note" text,
  "approved_at" timestamp,
  "reversed_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "founder_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_user_id" uuid,
  "action" varchar(100) NOT NULL,
  "entity_type" varchar(60) NOT NULL,
  "entity_id" uuid,
  "brand" varchar(20) DEFAULT 'both' NOT NULL,
  "payload" jsonb,
  "viewing_as" uuid,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ma_pipeline_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "target_name" varchar(255) NOT NULL,
  "kind" varchar(30) NOT NULL,
  "stage" varchar(30) DEFAULT 'prospect' NOT NULL,
  "deal_value_cents" bigint,
  "health_score" integer DEFAULT 0,
  "owner_user_id" uuid NOT NULL,
  "next_action" varchar(255),
  "next_action_date" date,
  "notes" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "view_as_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "founder_user_id" uuid NOT NULL,
  "target_user_id" uuid NOT NULL,
  "started_at" timestamp DEFAULT now(),
  "ended_at" timestamp,
  "reason" text
);

-- Board votes cascade FK (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'board_votes_decision_id_board_decisions_id_fk'
  ) THEN
    ALTER TABLE "board_votes"
      ADD CONSTRAINT "board_votes_decision_id_board_decisions_id_fk"
      FOREIGN KEY ("decision_id") REFERENCES "public"."board_decisions"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END$$;

-- Indexes (IF NOT EXISTS is supported by Postgres 9.5+)
CREATE INDEX IF NOT EXISTS "idx_board_decisions_status"       ON "board_decisions"     ("status");
CREATE INDEX IF NOT EXISTS "idx_board_decisions_proposed_by"  ON "board_decisions"     ("proposed_by");
CREATE INDEX IF NOT EXISTS "idx_board_votes_decision"         ON "board_votes"         ("decision_id");
CREATE INDEX IF NOT EXISTS "idx_board_votes_voter"            ON "board_votes"         ("voter_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "board_votes_unique_voter_decision" ON "board_votes" ("decision_id","voter_user_id");
CREATE INDEX IF NOT EXISTS "idx_cap_table_holder_user"        ON "cap_table_entries"   ("holder_user_id");
CREATE INDEX IF NOT EXISTS "idx_cap_table_class"              ON "cap_table_entries"   ("share_class");
CREATE INDEX IF NOT EXISTS "idx_capital_allocations_period"   ON "capital_allocations" ("period");
CREATE INDEX IF NOT EXISTS "idx_capital_allocations_category" ON "capital_allocations" ("category");
CREATE INDEX IF NOT EXISTS "idx_capital_allocations_status"   ON "capital_allocations" ("status");
CREATE INDEX IF NOT EXISTS "idx_founder_audit_created"        ON "founder_audit_log"   ("created_at");
CREATE INDEX IF NOT EXISTS "idx_founder_audit_actor"          ON "founder_audit_log"   ("actor_user_id");
CREATE INDEX IF NOT EXISTS "idx_founder_audit_entity"         ON "founder_audit_log"   ("entity_type","entity_id");
CREATE INDEX IF NOT EXISTS "idx_ma_pipeline_stage"            ON "ma_pipeline_items"   ("stage");
CREATE INDEX IF NOT EXISTS "idx_ma_pipeline_owner"            ON "ma_pipeline_items"   ("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_ma_pipeline_kind"             ON "ma_pipeline_items"   ("kind");
CREATE INDEX IF NOT EXISTS "idx_view_as_founder"              ON "view_as_sessions"    ("founder_user_id");
CREATE INDEX IF NOT EXISTS "idx_view_as_target"               ON "view_as_sessions"    ("target_user_id");
CREATE INDEX IF NOT EXISTS "idx_view_as_started"              ON "view_as_sessions"    ("started_at");
