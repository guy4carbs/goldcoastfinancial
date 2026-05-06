-- Migration 0010: Book of Business backend port
-- Adds policy/document columns required by /api/book-of-business endpoints.
-- All ALTERs are idempotent so this is safe to re-run.
--
-- Domain: Vector (Data Architect) → Forge (Backend Systems Engineer)
-- Source contract: heritage-app branch shared/models/portal.ts
--
-- TODO(Vector): the heritage stack also has optional `agent_policies` and
-- `policy_activities` tables used for the agent map and the activity log
-- endpoints. Skipped intentionally for this port — the route handlers tolerate
-- their absence (errors are swallowed). Add them in a follow-up migration when
-- those features land.

BEGIN;

-- =========================================================================
-- policies — extended fields for agent-owned book of business
-- =========================================================================

ALTER TABLE policies ADD COLUMN IF NOT EXISTS beneficiaries jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS client_status varchar(20);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS chargeback_at timestamp;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS chargeback_reason text;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS last_contact_date timestamp;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS next_follow_up_date timestamp;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS draft_date varchar(10);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES users(id);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS lead_id varchar;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS carrier varchar;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS state_code varchar(2);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS client_details jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_policies_agent_id ON policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_policies_client_status ON policies(client_status);

-- =========================================================================
-- documents — file storage linkage + uploader audit trail
-- =========================================================================

ALTER TABLE documents ADD COLUMN IF NOT EXISTS s3_key varchar;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_policy_id ON documents(policy_id);

COMMIT;
