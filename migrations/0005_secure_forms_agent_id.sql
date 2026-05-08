-- Migration 0005: Add agent_id FK to secure_forms.
--
-- Phase 2 of the per-user secure-link scoping work. The original schema
-- stored sender identity as plain-text agent_name/agent_email columns,
-- which let any client INSERT a forged email and bypass the read-side
-- ownership filter. This migration introduces a proper foreign-key column
-- and backfills it from the existing email values.
--
-- Safe to apply without downtime:
--   * ADD COLUMN is non-destructive (column allows NULL during transition)
--   * Backfill only writes where a matching users row is found
--   * Existing agent_name / agent_email columns are kept for denormalized
--     display (carrier emails / SMS rendering) but no longer authoritative

-- users.id is native uuid (Neon prod), so the FK column type must also be
-- uuid for the constraint to be valid.
ALTER TABLE secure_forms
  ADD COLUMN IF NOT EXISTS agent_id uuid
    REFERENCES users(id) ON DELETE SET NULL;

-- Backfill: link existing rows to their owners by case-insensitive email
-- match. Anything that doesn't match a current user (test data, departed
-- agents, typos) stays NULL and silently disappears from the per-user
-- view — that's the desired security stance for orphan rows.
UPDATE secure_forms sf
   SET agent_id = u.id::uuid
  FROM users u
 WHERE sf.agent_id IS NULL
   AND LOWER(sf.agent_email) = LOWER(u.email);

-- Index speeds up the per-user GET (agent_id = $1 ORDER BY created_at DESC).
CREATE INDEX IF NOT EXISTS idx_secure_forms_agent_id
  ON secure_forms(agent_id);
