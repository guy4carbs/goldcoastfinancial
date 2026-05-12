-- Migration 0022: notifications.related_table + related_id
-- Lets the lifeOS fanout idempotently look up "has this user already been
-- notified about this release?" without leaning on actionUrl substring
-- matching. Matches the same shape compliance_flags and other audit
-- tables use elsewhere in the codebase.
--
-- Both columns are nullable + additive so this is safe to re-run.

BEGIN;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_table VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_notifications_related
  ON notifications (related_table, related_id)
  WHERE related_id IS NOT NULL;

COMMIT;
