-- Migration 0017: Founders Dashboard Production Hardening
-- Adds editable per-quarter founder goals, training completion tracking,
-- cash balance snapshots, and tenant-scopes the deals table by agency_id.
--
-- Domain: Vector (Data Architect)
--
-- Idempotency: every CREATE/ALTER uses IF NOT EXISTS, the unique constraints
-- are ON CONFLICT-friendly, and the deals.agency_id backfill is a single-pass
-- UPDATE that only touches rows where agency_id IS NULL — re-running this
-- file is a no-op.
--
-- Notes:
--   * agent_hierarchy.upline_chain is JSONB (see server/db.ts:741), so we use
--     jsonb_array_elements_text() to walk the chain in the deals backfill.
--   * deals.agent_user_id is the submitting agent (see server/db.ts:539); the
--     spec referenced submitted_by_user_id but the actual column in this
--     codebase is agent_user_id. The backfill uses agent_user_id.
--   * The fallback agency UUID matches the root agency seeded by 0011.

BEGIN;

-- =========================================================================
-- 1. founder_goals — editable per-quarter targets per agency
-- =========================================================================

CREATE TABLE IF NOT EXISTS founder_goals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id          uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  metric_key         varchar(40) NOT NULL,
  period_type        varchar(20) NOT NULL,          -- 'quarter' | 'year'
  period_start       date NOT NULL,
  target_value       numeric(14,2) NOT NULL,
  unit               varchar(20) NOT NULL DEFAULT 'usd',
  notes              text,
  created_at         timestamp NOT NULL DEFAULT NOW(),
  created_by_user_id uuid REFERENCES users(id),
  UNIQUE (agency_id, metric_key, period_start)
);

CREATE INDEX IF NOT EXISTS idx_founder_goals_agency
  ON founder_goals(agency_id, period_start);

-- =========================================================================
-- 2. training_completions — per-agent training records
-- =========================================================================

CREATE TABLE IF NOT EXISTS training_completions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_key    varchar(60) NOT NULL,
  completed_at    timestamp,
  expires_at      timestamp,
  status          varchar(20) NOT NULL DEFAULT 'pending',
  evidence_s3_key text,
  created_at      timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (agent_user_id, training_key)
);

CREATE INDEX IF NOT EXISTS idx_training_completions_agent
  ON training_completions(agent_user_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_status
  ON training_completions(status);

-- =========================================================================
-- 3. cash_balances — manual or Plaid-fed balance snapshots
-- =========================================================================

CREATE TABLE IF NOT EXISTS cash_balances (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id          uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  account_label      varchar(80) NOT NULL,
  account_last4      varchar(4),
  balance_cents      bigint NOT NULL,
  as_of_at           timestamp NOT NULL,
  source             varchar(20) NOT NULL DEFAULT 'manual',
  notes              text,
  created_at         timestamp NOT NULL DEFAULT NOW(),
  created_by_user_id uuid REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cash_balances_agency_asof
  ON cash_balances(agency_id, as_of_at DESC);

-- =========================================================================
-- 4. deals.agency_id — tenancy scoping
-- =========================================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES agencies(id);
CREATE INDEX IF NOT EXISTS idx_deals_agency ON deals(agency_id);

-- Backfill: derive agency_id from the deal's submitting agent via agency_teams.
-- For deals whose agent isn't a manager, walk agent_hierarchy.upline_chain
-- (JSONB array of UUID strings) to find the nearest manager and use their
-- agency. Falls back to the root agency seeded by 0011_agency_management.sql.
WITH deal_to_agency AS (
  SELECT d.id AS deal_id,
         COALESCE(
           (SELECT at.agency_id
              FROM agency_teams at
             WHERE at.manager_user_id = d.agent_user_id
             LIMIT 1),
           (SELECT at.agency_id
              FROM agent_hierarchy ah
              JOIN agency_teams at
                ON at.manager_user_id::text = ANY(
                     ARRAY(SELECT jsonb_array_elements_text(ah.upline_chain))
                   )
             WHERE ah.agent_user_id = d.agent_user_id
               AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
             ORDER BY ah.effective_from DESC
             LIMIT 1),
           '00000000-0000-4000-8000-000000000001'::uuid
         ) AS agency_id
    FROM deals d
   WHERE d.agency_id IS NULL
)
UPDATE deals
   SET agency_id = dta.agency_id
  FROM deal_to_agency dta
 WHERE deals.id = dta.deal_id;

COMMIT;
