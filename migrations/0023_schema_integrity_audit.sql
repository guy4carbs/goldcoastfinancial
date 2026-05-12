-- Schema-integrity migration (audit 2026-05-12).
--
-- HIGH H-7 / H-8 / H-9 from the security + production audit. Three concerns:
--   1. users.assigned_agent_id was declared in the Drizzle schema but NEVER
--      had a foreign-key constraint to users(id). Orphan agent references
--      could accumulate on agent deletion.
--   2. Portal tables (messages, notifications, documents, billing_history)
--      filter by user_id on every request but had no index on the FK column.
--      Each list query degenerates to a sequential scan as data grows.
--   3. policies.user_id is the primary join key for "book of business" and
--      every agent-facing client list. No index → full table scan at scale.
--
-- All operations are idempotent (IF NOT EXISTS guards) so re-applying is safe.

-- =============================================================================
-- 1. users.assigned_agent_id FK constraint
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_assigned_agent_id_fk'
      AND table_name = 'users'
  ) THEN
    -- ON DELETE SET NULL — if the upline agent is deleted the downline keeps
    -- existing but loses its parent link (rather than cascade-deleting users).
    ALTER TABLE users
      ADD CONSTRAINT users_assigned_agent_id_fk
      FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================================
-- 2. Portal table FK indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_policy_id ON documents(policy_id);

CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_date ON billing_history(user_id, payment_date DESC);

-- =============================================================================
-- 3. policies.user_id index (the big one — every "my book" query hits this)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_status_user ON policies(status, user_id);

-- =============================================================================
-- 4. assigned_agent_id index (for "agents I manage" reverse-lookup)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_assigned_agent_id ON users(assigned_agent_id)
  WHERE assigned_agent_id IS NOT NULL;
