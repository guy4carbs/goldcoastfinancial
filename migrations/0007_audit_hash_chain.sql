-- Tamper-evident audit chain (Section 3.3)
--
-- Every founder_audit_log row stores:
--   - row_hash:  sha256( prev_row_hash || id || actor_user_id || action ||
--                        entity_type || entity_id || brand || payload ||
--                        viewing_as || created_at )
--   - prev_row_hash: the row_hash of the previous row in time order, or
--                    NULL for the very first row.
--
-- Detection: if anyone modifies a row in-place, deletes a row, or inserts
-- a row out of order, the chain breaks. The verifier walks the chain and
-- returns the first divergence.
--
-- Note: append-only triggers from migration 0002 still apply — UPDATE and
-- DELETE are blocked at the DB level. The hash chain is defense-in-depth
-- in case those triggers are circumvented (DBA-level access, dropped
-- triggers, etc.).
--
-- Performance: single sha256 per insert. The trigger uses a row-level
-- LOCK on the most recent row to ensure linearity even under concurrent
-- writes — the cost is one extra index lookup per insert.

ALTER TABLE founder_audit_log
  ADD COLUMN IF NOT EXISTS row_hash TEXT,
  ADD COLUMN IF NOT EXISTS prev_row_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_founder_audit_chain_order
  ON founder_audit_log (created_at, id);

-- The chain function. Reads the most recent row's row_hash (snapshot
-- isolation will see a stable view; the row-level lock below makes this
-- linearizable under concurrent writes).
CREATE OR REPLACE FUNCTION founder_audit_chain_compute()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  prev_hash TEXT;
  payload_text TEXT;
BEGIN
  -- Lock + read the most recent row's hash. ORDER BY created_at, id pairs
  -- with the new index for cheap reads.
  SELECT row_hash
    INTO prev_hash
    FROM founder_audit_log
    WHERE id <> NEW.id
    ORDER BY created_at DESC, id DESC
    LIMIT 1
    FOR UPDATE;

  payload_text := COALESCE(NEW.payload::text, '');
  NEW.prev_row_hash := prev_hash;
  NEW.row_hash := encode(
    digest(
      COALESCE(prev_hash, '')
        || '|' || NEW.id::text
        || '|' || COALESCE(NEW.actor_user_id::text, '')
        || '|' || NEW.action
        || '|' || NEW.entity_type
        || '|' || COALESCE(NEW.entity_id::text, '')
        || '|' || COALESCE(NEW.brand, '')
        || '|' || payload_text
        || '|' || COALESCE(NEW.viewing_as::text, '')
        || '|' || COALESCE(NEW.created_at::text, ''),
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$;

-- Use the pgcrypto extension for digest(). It's installed by default on
-- Neon; ensure it.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TRIGGER IF EXISTS founder_audit_chain_before_insert ON founder_audit_log;
CREATE TRIGGER founder_audit_chain_before_insert
  BEFORE INSERT ON founder_audit_log
  FOR EACH ROW EXECUTE FUNCTION founder_audit_chain_compute();
