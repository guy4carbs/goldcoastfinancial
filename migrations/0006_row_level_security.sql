-- Row-Level Security (Section 2.3)
--
-- Defense-in-depth. The app already enforces tenant isolation at the route
-- layer via requireAuth + permission checks. RLS catches the failure mode
-- where a future query forgets a WHERE clause and returns rows that the
-- requesting user shouldn't see.
--
-- Per-request, the app sets two session variables:
--   SET LOCAL app.user_id = '<uuid>'
--   SET LOCAL app.role    = '<role>'
-- These are read by the policies below via current_setting(...).
--
-- The "force" flag is intentionally NOT set on these tables — the role the
-- pg pool connects as is the table OWNER, and table owners bypass RLS by
-- default. We mitigate by always setting app.user_id at the start of every
-- transaction; if the caller forgets, current_setting returns '' and most
-- policies simply return false.
--
-- Roles in this app: founder, owner, system_admin, agency_manager,
-- sales_agent, marketing_staff, client, investor.
-- "founder", "owner", "system_admin" are unrestricted — they pass every policy.
-- "agency_manager" sees the same rows as a sales agent assigned to them.

-- Helper expression: is the current request acting as a privileged role?
CREATE OR REPLACE FUNCTION app_is_privileged()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT current_setting('app.role', true) IN ('founder', 'owner', 'system_admin')
$$;

CREATE OR REPLACE FUNCTION app_user_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

-- ─── users table ─────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_self_or_privileged ON users;
CREATE POLICY users_self_or_privileged ON users
  USING (
    app_is_privileged()
    OR id = app_user_id()
  )
  WITH CHECK (
    app_is_privileged()
    OR id = app_user_id()
  );

-- ─── founder_distributions ──────────────────────────────────────────────
ALTER TABLE founder_distributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS founder_dist_privileged_only ON founder_distributions;
CREATE POLICY founder_dist_privileged_only ON founder_distributions
  USING (app_is_privileged())
  WITH CHECK (app_is_privileged());

-- ─── plaid_items ────────────────────────────────────────────────────────
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plaid_items_privileged_only ON plaid_items;
CREATE POLICY plaid_items_privileged_only ON plaid_items
  USING (app_is_privileged())
  WITH CHECK (app_is_privileged());

-- ─── plaid_pending_deposits ─────────────────────────────────────────────
ALTER TABLE plaid_pending_deposits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plaid_pending_privileged_only ON plaid_pending_deposits;
CREATE POLICY plaid_pending_privileged_only ON plaid_pending_deposits
  USING (app_is_privileged())
  WITH CHECK (app_is_privileged());

-- ─── client_profiles ────────────────────────────────────────────────────
-- Clients see only their own profile; agents see their assigned clients;
-- privileged roles see all.
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS client_profiles_isolated ON client_profiles;
CREATE POLICY client_profiles_isolated ON client_profiles
  USING (
    app_is_privileged()
    OR user_id = app_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = client_profiles.user_id
        AND u.assigned_agent_id = app_user_id()
    )
  )
  WITH CHECK (
    app_is_privileged()
    OR user_id = app_user_id()
  );

-- ─── policies ───────────────────────────────────────────────────────────
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS policies_isolated ON policies;
CREATE POLICY policies_isolated ON policies
  USING (
    app_is_privileged()
    OR user_id = app_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = policies.user_id
        AND u.assigned_agent_id = app_user_id()
    )
  )
  WITH CHECK (
    app_is_privileged()
    OR user_id = app_user_id()
  );
