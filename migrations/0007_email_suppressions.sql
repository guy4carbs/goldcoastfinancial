-- Email suppression list: shared store for unsubscribes, bounces, complaints.
-- Written by Resend webhook, unsubscribe links, preferences drawer, admins.
-- Read by the email transport layer before every outbound system send.
-- Rows are never hard-deleted (audit/consent record).

CREATE TABLE IF NOT EXISTS email_suppressions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  scope TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_email_suppressions_email_scope
  ON email_suppressions (lower(email), coalesce(scope, ''));

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email
  ON email_suppressions (lower(email));
