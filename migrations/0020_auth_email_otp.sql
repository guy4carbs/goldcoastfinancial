-- Wave AH2: email-OTP storage. One row per outstanding code per user; the
-- service hashes the code with bcrypt before insert (never stored plaintext).
-- 5-min TTL enforced server-side via expires_at; rate limit (1/60s, 5/hour)
-- enforced by counting recent rows per user_id.
--
-- Cleanup: expired/used rows are reaped lazily on next request via a small
-- delete-where-expired-or-used-and-old query in the service. No cron needed.

CREATE TABLE IF NOT EXISTS "auth_email_otp" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"     uuid NOT NULL,
  "code_hash"   text NOT NULL,
  "expires_at"  timestamp NOT NULL,
  "attempts"    integer NOT NULL DEFAULT 0,
  "used_at"     timestamp,
  "created_at"  timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auth_email_otp_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "auth_email_otp"
      ADD CONSTRAINT "auth_email_otp_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_auth_email_otp_user_active"
  ON "auth_email_otp" ("user_id", "expires_at")
  WHERE "used_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_auth_email_otp_user_recent"
  ON "auth_email_otp" ("user_id", "created_at" DESC);
