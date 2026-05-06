-- Vector — Wave 4
-- Idempotent: writing number per agency × carrier × state. Stored on the
-- contract row itself so each agency carries its own numbers per carrier.
ALTER TABLE agency_carrier_contracts
  ADD COLUMN IF NOT EXISTS writing_number varchar(50);
COMMENT ON COLUMN agency_carrier_contracts.writing_number IS
  'Agency-level writing/producer number assigned by the carrier (e.g. Gold Coast''s number with Mutual of Omaha).';
