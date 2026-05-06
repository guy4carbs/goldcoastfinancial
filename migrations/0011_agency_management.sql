-- Migration 0011: Agency Management
-- Adds the first-class `agencies` model + 4 supporting tables to back the new
-- Founders Agency Management page (sub-agencies, MPA tracking, commission
-- overrides, per-carrier compliance requirements).
--
-- Domain: Vector (Data Architect) → Forge / Nova (Wave 1)
-- Source plan: ~/.claude/plans/ok-lets-now-design-async-cosmos.md
--
-- Idempotency: every CREATE uses IF NOT EXISTS and the backfill block uses
-- ON CONFLICT DO NOTHING. Re-running this file is a no-op.
--
-- NOTE: carrier_directory.id is VARCHAR (see server/db.ts:906), NOT uuid.
-- All carrier_id columns therefore use varchar to match the FK type.

BEGIN;

-- =========================================================================
-- 1. agencies — recursive (parent_agency_id), one row per legal/branding agency
-- =========================================================================

CREATE TABLE IF NOT EXISTS agencies (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_agency_id         uuid REFERENCES agencies(id) ON DELETE RESTRICT,
  name                     varchar(255) NOT NULL,
  dba_name                 varchar(255),
  legal_entity_type        varchar(50),
  ein                      varchar(20),
  state_of_formation       varchar(2),
  formation_date           date,
  primary_contact_user_id  uuid REFERENCES users(id),
  contact_email            varchar(255),
  contact_phone            varchar(50),
  street_address           varchar(255),
  city                     varchar(100),
  state                    varchar(2),
  zip_code                 varchar(10),
  status                   varchar(20) NOT NULL DEFAULT 'active',
  notes                    text,
  created_at               timestamp NOT NULL DEFAULT NOW(),
  updated_at               timestamp NOT NULL DEFAULT NOW(),
  created_by_user_id       uuid REFERENCES users(id),
  CONSTRAINT no_self_parent CHECK (id <> parent_agency_id)
);

CREATE INDEX IF NOT EXISTS idx_agencies_parent ON agencies(parent_agency_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);

-- =========================================================================
-- 2. agency_teams — join: agency owns teams (manager subtrees)
-- PRIMARY KEY (manager_user_id) so each manager belongs to exactly one agency
-- =========================================================================

CREATE TABLE IF NOT EXISTS agency_teams (
  agency_id            uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  manager_user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at          timestamp NOT NULL DEFAULT NOW(),
  assigned_by_user_id  uuid REFERENCES users(id),
  PRIMARY KEY (manager_user_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_teams_agency ON agency_teams(agency_id);

-- =========================================================================
-- 3. agency_carrier_contracts — Master Producer Agreement per agency × carrier
-- =========================================================================

CREATE TABLE IF NOT EXISTS agency_carrier_contracts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id               uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  carrier_id              varchar NOT NULL REFERENCES carrier_directory(id),
  status                  varchar(20) NOT NULL DEFAULT 'active',
  mpa_effective_date      date,
  mpa_expiration_date     date,
  mpa_document_s3_key     varchar(500),
  primary_contact_name    varchar(255),
  primary_contact_email   varchar(255),
  primary_contact_phone   varchar(50),
  states_authorized       jsonb,
  notes                   text,
  created_at              timestamp NOT NULL DEFAULT NOW(),
  updated_at              timestamp NOT NULL DEFAULT NOW(),
  created_by_user_id      uuid REFERENCES users(id),
  UNIQUE (agency_id, carrier_id)
);

CREATE INDEX IF NOT EXISTS idx_acc_agency  ON agency_carrier_contracts(agency_id);
CREATE INDEX IF NOT EXISTS idx_acc_carrier ON agency_carrier_contracts(carrier_id);
CREATE INDEX IF NOT EXISTS idx_acc_status  ON agency_carrier_contracts(status);

-- =========================================================================
-- 4. agency_carrier_commission_overrides — agency-level commission % deltas
-- =========================================================================

CREATE TABLE IF NOT EXISTS agency_carrier_commission_overrides (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  carrier_id            varchar NOT NULL REFERENCES carrier_directory(id),
  product_type          varchar(50),
  commission_pct_delta  numeric(5,2) NOT NULL,
  effective_from        date NOT NULL DEFAULT CURRENT_DATE,
  effective_to          date,
  notes                 text,
  created_at            timestamp NOT NULL DEFAULT NOW(),
  created_by_user_id    uuid REFERENCES users(id),
  UNIQUE (agency_id, carrier_id, product_type, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_acco_active
  ON agency_carrier_commission_overrides(agency_id, carrier_id, effective_to);

-- =========================================================================
-- 5. carrier_compliance_requirements — per-carrier required compliance items
-- (AML training, E&O minimum, state restrictions, training modules, etc.)
-- =========================================================================

CREATE TABLE IF NOT EXISTS carrier_compliance_requirements (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id         varchar NOT NULL REFERENCES carrier_directory(id) ON DELETE CASCADE,
  requirement_type   varchar(40) NOT NULL,
  required_value     varchar(255),
  notes              text,
  created_at         timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (carrier_id, requirement_type, required_value)
);

CREATE INDEX IF NOT EXISTS idx_ccr_carrier ON carrier_compliance_requirements(carrier_id);

-- =========================================================================
-- Backfill: insert root agency + assign all current managers to it
-- =========================================================================

INSERT INTO agencies (id, name, dba_name, legal_entity_type, status, notes)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Gold Coast Financial Partners LLC',
  'Gold Coast Financial',
  'LLC',
  'active',
  'Root agency seeded by 0011 migration. All existing managers backfilled here.'
)
ON CONFLICT (id) DO NOTHING;

-- Assign all current managers (hierarchy_title containing "Manager" or "Director")
-- to the root agency. Use ON CONFLICT DO NOTHING so re-runs are safe.
INSERT INTO agency_teams (agency_id, manager_user_id, assigned_at)
SELECT
  '00000000-0000-4000-8000-000000000001'::uuid,
  ah.agent_user_id,
  NOW()
FROM agent_hierarchy ah
JOIN users u ON u.id = ah.agent_user_id
WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())
  AND (ah.hierarchy_title ILIKE '%manager%' OR ah.hierarchy_title ILIKE '%director%' OR u.role = 'agency_manager' OR u.role = 'director')
ON CONFLICT (manager_user_id) DO NOTHING;

COMMIT;
