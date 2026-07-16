-- Set the owner's (Gaetano Carbonara, guy4carbs@gmail.com — root of hierarchy)
-- contract level to 145%, alongside the code change lifting the validation
-- ceiling from 135 to 145.
--
-- Unlike 0028 (guarded on "current value = 125", which no-ops if the row is
-- at any other value), this sets the owner's row to 145 UNCONDITIONALLY and
-- raises a loud WARNING into the boot logs if no row matched, so a silent
-- no-op like 0028's cannot recur.
--
-- Waterfall integrity: overrides compute dynamically as
-- (upline.contract_level - agent.contract_level); this widens the owner's
-- spread over direct downlines and changes nothing else.

DO $$
DECLARE
  n integer;
BEGIN
  UPDATE agent_hierarchy
  SET contract_level = 145,
      updated_at = NOW()
  WHERE agent_user_id = (
          SELECT id FROM users WHERE LOWER(email) = 'guy4carbs@gmail.com'
        )
    AND contract_level IS DISTINCT FROM 145;

  GET DIAGNOSTICS n = ROW_COUNT;

  IF n = 0 THEN
    -- Either already at 145 (fine) or no hierarchy row exists for the owner
    -- (needs investigation). Distinguish the two in the log line.
    IF NOT EXISTS (
      SELECT 1 FROM agent_hierarchy
      WHERE agent_user_id = (SELECT id FROM users WHERE LOWER(email) = 'guy4carbs@gmail.com')
    ) THEN
      RAISE WARNING '[0029] NO agent_hierarchy row found for owner guy4carbs@gmail.com — contract level NOT set';
    ELSE
      RAISE NOTICE '[0029] owner contract level already 145 — no-op';
    END IF;
  ELSE
    RAISE NOTICE '[0029] owner contract level set to 145 (% row updated)', n;
  END IF;
END $$;
