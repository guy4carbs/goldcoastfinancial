-- =============================================================================
-- 0025_lowercase_email_backfill.sql
--
-- Normalize every existing users.email to lowercase so case-insensitive
-- lookups (storage.getUserByEmail, /api/auth/login, /api/auth/password-reset)
-- match what's stored. Without this backfill, a user invited as
-- "Gaetanocarbs@iCloud.com" can't sign in or reset their password using
-- "gaetanocarbs@icloud.com" because the LOWER(email) = lower(input)
-- comparison still depends on the column actually being lowercased.
--
-- Idempotent — re-running on already-lowercased rows is a no-op (the WHERE
-- clause filters them out).
--
-- WARNING: If two users somehow share the same email at different cases
-- (`Alice@Example.com` and `alice@example.com`), the UPDATE would violate
-- the implicit unique-by-app contract. The CTE below detects + reports any
-- collisions and aborts before touching anything. None are expected since
-- the unique constraint on users.email is case-sensitive and would have
-- already let both through — but better to flag than to clobber.
-- =============================================================================

DO $$
DECLARE
  collision_count int;
BEGIN
  -- Detect any case-only collisions before mutating.
  WITH lower_groups AS (
    SELECT LOWER(email) AS lower_email, COUNT(*) AS n
    FROM users
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  )
  SELECT COUNT(*) INTO collision_count FROM lower_groups;

  IF collision_count > 0 THEN
    RAISE EXCEPTION 'Refusing to backfill: % distinct lowercased emails collide with existing rows. Reconcile manually first.', collision_count;
  END IF;

  UPDATE users
     SET email = LOWER(email),
         updated_at = NOW()
   WHERE email != LOWER(email);
END $$;
