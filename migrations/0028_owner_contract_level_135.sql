-- Raise the owner's (Gaetano Carbonara, root of hierarchy) contract level
-- from 125% to 135%, alongside the code change lifting the validation cap
-- from 125 to 135 (hcms-hierarchy / hcms-carriers / hierarchy UI).
--
-- Waterfall integrity: overrides are computed dynamically as
-- (upline.contract_level - agent.contract_level), so this widens the owner's
-- spread over his direct downlines by 10 points and changes nothing else.
--
-- Guarded + idempotent: only touches the owner's row while it is still 125,
-- so re-runs (and already-adjusted rows) are no-ops.

UPDATE agent_hierarchy
SET contract_level = 135,
    updated_at = NOW()
WHERE agent_user_id = (
        SELECT id FROM users WHERE LOWER(email) = 'guy4carbs@gmail.com'
      )
  AND contract_level = 125;
