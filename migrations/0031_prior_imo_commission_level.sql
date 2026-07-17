-- Discord apply flow: applicants state the commission level they currently
-- hold at their existing IMO. Self-reported context shown to the approver in
-- the founders approve modal — NOT their Gold Coast contract level.
-- IF EXISTS guards keep this a no-op on databases where agent_profiles has
-- not been created yet (fresh boots create tables after migrate runs).

ALTER TABLE IF EXISTS agent_profiles
  ADD COLUMN IF NOT EXISTS current_commission_level_at_prior_imo INTEGER;
