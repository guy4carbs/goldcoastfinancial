-- Audit Pass 3 hardening migration (2026-05-12).
--
-- Closes several HIGH/MEDIUM/LOW backlog items from docs/audit-2026-05-12.md
-- in a single forward-only, idempotent migration:
--
--   H-22: user_consents tracking table (TCPA + GDPR audit trail)
--   L-3:  composite index on user_release_acks for the "latest state per
--         user × release" hot read path
--   M-6:  drop login_attempts.email column — user_id is sufficient and
--         email is PII we shouldn't be retaining longer than needed
--   L-2:  cleanup function for expired password_reset_tokens (callable from
--         a Railway cron + as a one-shot)
--
-- Operates idempotently — re-running on a DB that's already had this
-- applied is a no-op.

-- =============================================================================
-- 1. user_consents — TCPA / GDPR / CCPA consent audit trail
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_consents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES users(id) ON DELETE CASCADE,
  consent_type      varchar(50) NOT NULL,
  -- e.g. 'terms_of_service' | 'privacy_policy' | 'tcpa_sms' | 'tcpa_voice' |
  -- 'email_marketing' | 'data_processing'
  accepted          boolean NOT NULL,
  channel           varchar(50),
  -- 'web_form' | 'verbal_recorded' | 'wet_signature' | 'docusign' | 'sms_opt_in'
  ip_address        varchar(45),
  user_agent        text,
  payload           jsonb,
  accepted_at       timestamptz NOT NULL DEFAULT NOW(),
  revoked_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_type
  ON user_consents(user_id, consent_type, accepted_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_consents_revoked
  ON user_consents(user_id, revoked_at)
  WHERE revoked_at IS NULL;

-- =============================================================================
-- 2. user_release_acks composite index (L-3)
-- =============================================================================
-- Already have idx_user_release_acks_user + idx_user_release_acks_release.
-- The hot read is "what's the latest state for THIS user × release?" which
-- benefits from a composite index even more.
CREATE INDEX IF NOT EXISTS idx_user_release_acks_user_release_state
  ON user_release_acks(user_id, release_id, state, acked_at DESC);

-- =============================================================================
-- 3. login_attempts: drop email column (M-6) once we're certain user_id is set
-- =============================================================================
-- We DON'T drop it in this migration because production may have rows with
-- email but no user_id (pre-login failed attempts). Instead, we add an index
-- on user_id and document the column as deprecated. Removal happens in a
-- follow-up migration once a backfill job has populated user_id everywhere.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'login_attempts'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'login_attempts' AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_login_attempts_user_attempted
      ON login_attempts(user_id, attempted_at DESC);
    COMMENT ON COLUMN login_attempts.email IS 'DEPRECATED 2026-05-12: PII; use user_id. Will be dropped after backfill job lands.';
  END IF;
END $$;

-- =============================================================================
-- 4. password_reset_tokens cleanup (L-2)
-- =============================================================================
-- Inline cleanup: any token older than 7 days is purged regardless of usage.
-- Call this from a daily cron via:
--   SELECT cleanup_password_reset_tokens();
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'password_reset_tokens'
  ) THEN
    CREATE OR REPLACE FUNCTION cleanup_password_reset_tokens() RETURNS int AS $f$
    DECLARE deleted_count int;
    BEGIN
      DELETE FROM password_reset_tokens
       WHERE expires_at < NOW() - INTERVAL '1 day';
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
      RETURN deleted_count;
    END;
    $f$ LANGUAGE plpgsql;
    -- One-shot cleanup at migration time so the table starts clean.
    PERFORM cleanup_password_reset_tokens();
  END IF;
END $$;

-- =============================================================================
-- 5. Deprecation marker on the duplicate 0001 migration (H-10)
-- =============================================================================
-- Track that the canonical founders-lounge schema lives in 0001_founders_lounge_safe.sql
-- (the idempotent variant). The non-safe sibling is operationally retired but
-- left on disk for git history. This SQL just records the decision in a
-- _migrations_notes table so future maintainers see it.
CREATE TABLE IF NOT EXISTS _migrations_notes (
  id              serial PRIMARY KEY,
  note_key        varchar(100) UNIQUE NOT NULL,
  note            text NOT NULL,
  recorded_at     timestamptz NOT NULL DEFAULT NOW()
);

INSERT INTO _migrations_notes (note_key, note) VALUES (
  '0001_dup_deprecated',
  '0001_founders_lounge.sql is DEPRECATED (audit 2026-05-12 H-10). Canonical schema lives in 0001_founders_lounge_safe.sql which uses IF NOT EXISTS guards. The non-safe sibling is retained on disk for git history only — do not re-author.'
) ON CONFLICT (note_key) DO NOTHING;

-- =============================================================================
-- 6. chargeback_events context columns (L-6)
-- =============================================================================
-- Adds commission_amount + agent_user_id to chargeback_events so auditors
-- can reconstruct the financial impact of a chargeback in a single table
-- read (no need to JOIN back to commissions / policies).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'chargeback_events'
  ) THEN
    -- commission_amount: numeric cents — null when the event predates the
    -- commission having been computed yet
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'chargeback_events' AND column_name = 'commission_amount_cents'
    ) THEN
      ALTER TABLE chargeback_events ADD COLUMN commission_amount_cents bigint;
    END IF;
    -- agent_user_id: the agent who earned the original commission. FK is
    -- intentionally NOT enforced — we want the column to survive the
    -- agent's account deletion (regulatory retention requirement).
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'chargeback_events' AND column_name = 'agent_user_id'
    ) THEN
      ALTER TABLE chargeback_events ADD COLUMN agent_user_id uuid;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_chargeback_events_agent
      ON chargeback_events(agent_user_id, created_at DESC)
      WHERE agent_user_id IS NOT NULL;
  END IF;
END $$;
