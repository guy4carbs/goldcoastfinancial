-- Set the owner's contract level to 145% — the one that finally sticks.
--
-- ROOT CAUSE of 0028/0029 "applying OK" with no visible effect:
-- storage.ts initializeOwnerAccount() ran `SET contract_level = 120` on the
-- owner's active hierarchy rows on EVERY boot, immediately after migrations.
-- That clobber is removed in the same deploy as this migration, so this
-- write persists.
--
-- Updates ALL of the owner's active rows (the tree dedupes by latest
-- effective_from, the drawer may read a different row — historical
-- duplicates exist per the Wave AB comment in hcms-hierarchy.ts), so every
-- surface renders 145 regardless of which row it picks.

UPDATE agent_hierarchy
SET contract_level = 145,
    updated_at = NOW()
WHERE agent_user_id = (
        SELECT id FROM users WHERE LOWER(email) = 'guy4carbs@gmail.com'
      )
  AND (effective_to IS NULL OR effective_to > NOW())
  AND contract_level IS DISTINCT FROM 145;
