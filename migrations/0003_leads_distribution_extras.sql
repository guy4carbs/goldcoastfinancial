-- Heritage port: Lead Distribution extras
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lead_score_tier" varchar(20);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "distribution_batch_id" uuid;
CREATE INDEX IF NOT EXISTS "idx_leads_distribution_batch" ON "leads" ("distribution_batch_id");
CREATE INDEX IF NOT EXISTS "idx_leads_score_tier" ON "leads" ("lead_score_tier");

-- Backfill score tier from existing lead_score column (0-30 cold, 31-60 warm, 61-85 hot, 86+ on_fire)
UPDATE "leads"
SET "lead_score_tier" = CASE
  WHEN lead_score IS NULL THEN NULL
  WHEN lead_score <= 30 THEN 'cold'
  WHEN lead_score <= 60 THEN 'warm'
  WHEN lead_score <= 85 THEN 'hot'
  ELSE 'on_fire'
END
WHERE "lead_score_tier" IS NULL;
