-- Helix S6: founder_audit_log must be append-only at the DB level.
-- Blocks any UPDATE or DELETE on the table regardless of application code.
-- Transaction-of-record integrity for all founder-initiated actions across GC + Heritage.

CREATE OR REPLACE FUNCTION block_founder_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'founder_audit_log is append-only — UPDATE and DELETE are forbidden';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS founder_audit_log_no_update ON founder_audit_log;
CREATE TRIGGER founder_audit_log_no_update
  BEFORE UPDATE ON founder_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION block_founder_audit_mutation();

DROP TRIGGER IF EXISTS founder_audit_log_no_delete ON founder_audit_log;
CREATE TRIGGER founder_audit_log_no_delete
  BEFORE DELETE ON founder_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION block_founder_audit_mutation();
