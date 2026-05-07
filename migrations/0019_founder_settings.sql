-- Wave AF1: per-founder UI preferences. One JSONB blob per founder so we
-- don't have to migrate the schema every time a new toggle is added. Keyed
-- by user_id (one row per founder), CASCADE on user delete so the row goes
-- away with the user.

CREATE TABLE IF NOT EXISTS "founder_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE,
  "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'founder_settings_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "founder_settings"
      ADD CONSTRAINT "founder_settings_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_founder_settings_user" ON "founder_settings" ("user_id");
