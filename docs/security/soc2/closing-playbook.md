# Closing Playbook — SOC 2 Type 1 Readiness

For each ◑ Partial / ○ Gap row in [`readiness-matrix.md`](./readiness-matrix.md),
this doc spells out the concrete steps that move it to ✓ Implemented and
the artifact (the auditor-facing evidence) that closes the row.

Convention per item:
- **Owner** — who runs the steps.
- **Steps** — exact commands / dashboard clicks / files to edit.
- **Acceptance** — the thing the auditor will see when it's done.
- **Where the evidence lives** — file path or vendor URL.

Ordered by the recommended sequence (cheapest-fastest first → unblocks
the next batch of items).

---

## Wave 1 — same week (S items)

### CC2.2 + CC2.3 — Stand up `#sec-ir` Slack channel and `security@goldcoastfnl.com` mailbox

**Owner:** any founder.

**Steps:**
1. In Slack: **Channels** → **+ Create** → name `sec-ir` → **Private**.
   Add all three founders. Pin the breach-response runbook URL.
2. In Google Workspace Admin → **Apps → Gmail → Routing** → create a
   group `security@goldcoastfnl.com` that forwards to all three founders.
3. Create the public security disclosure file at `client/public/.well-known/security.txt`:
   ```
   Contact: mailto:security@goldcoastfnl.com
   Expires: 2027-04-28T00:00:00Z
   Preferred-Languages: en
   Policy: https://heritagels.org/security
   ```
4. Confirm `https://app.heritagels.org/.well-known/security.txt` resolves
   (Vite serves anything in `client/public/`).

**Acceptance:**
- Screenshot of the Slack channel members list.
- Test email to `security@goldcoastfnl.com` arrives in all three inboxes.
- `curl https://app.heritagels.org/.well-known/security.txt` returns
  the file.

**Evidence:** `Security/Communication/sec-ir-channel.png`,
`Security/Communication/security-mailbox-test.eml`.

---

### CC8.1 — Enable branch protection on `main`

**Owner:** any founder with repo admin.

**Steps:** open `docs/security/branch-protection.md` and apply every
check in **GitHub → Settings → Branches → Branch protection rules**.

**Acceptance:** the pull-request creator cannot merge their own PR
without 1 review + signed commits + green CI.

**Evidence:** `Security/Change-Management/branch-protection-screenshot.png`.

---

### CC1.2 + CC4.2 — Lock in the quarterly governance cadence

**Owner:** Qualified Individual (Founder).

**Steps:**
1. In Google Calendar create three recurring events (every 3 months):
   - `Founders Security Review` — 60 min — first Monday of the quarter.
   - `Quarterly Fire-drill` — 90 min — second Monday.
   - `Tabletop Exercise` — 60 min — third Monday.
2. Make a Google Doc template at `Security/Reviews/<YYYY-Qx>-template.md`
   with sections: Risk register changes, control changes, vendor
   changes, incidents, near-misses, action items.
3. Hold the first meeting using the template; save the minutes as
   `Security/Reviews/2026-Q2-minutes.pdf`.

**Acceptance:** signed-off minutes from at least one quarterly meeting
exist before kickoff.

**Evidence:** `Security/Reviews/2026-Q2-minutes.pdf`.

---

### CC5.3 — Sign + adopt the policy pack

**Owner:** Qualified Individual.

**Steps:** print to PDF + counter-sign (DocuSign or wet-ink) every file
under `docs/security/policies/`. File signed PDFs under
`Security/Policies/<policy>-vYYYY-MM-DD.pdf`. Have every operator
counter-sign at the next all-hands.

**Acceptance:** one signed PDF per policy + signature roster.

**Evidence:** `Security/Policies/`.

---

## Wave 2 — within 30 days (M items)

### C1.2 — Provision the production KMS Customer-Managed Key

**Owner:** Qualified Individual + tech lead.

**Steps:**
1. AWS console → **KMS** → **Create key**.
   - Type: Symmetric.
   - Use: Encrypt and decrypt.
   - Key administrators: Founders' IAM users.
   - Key users: the IAM role the production server assumes.
   - Alias: `alias/heritagels-prod-fields`.
   - Enable yearly auto-rotation.
2. AWS console → **Secrets Manager** → edit the production secret
   bundle → add `KMS_KEY_ID = alias/heritagels-prod-fields` and
   `AWS_REGION = us-east-1`.
3. Restart production. New writes go to v2 envelope automatically.
4. Migrate existing v1 ciphertext (Plaid `access_token`s + any other
   KMS-eligible columns):
   ```ts
   // scripts/rotate-encryption-to-v2.mjs (one-shot)
   import { decryptFieldUnified, encryptFieldAsync } from "../server/services/encryptionService.js";
   import { Pool } from "pg";
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const rows = await pool.query(`SELECT id, access_token_encrypted FROM plaid_items WHERE access_token_encrypted NOT LIKE 'v2:%' AND deleted_at IS NULL`);
   for (const r of rows.rows) {
     const plain = await decryptFieldUnified(r.access_token_encrypted);
     const v2 = await encryptFieldAsync(plain);
     await pool.query(`UPDATE plaid_items SET access_token_encrypted = $1 WHERE id = $2`, [v2, r.id]);
   }
   ```

**Acceptance:** `/api/founders/soc2/evidence` reports
`encryption.kmsConfigured = true` and `encryption.plaidItemsV1 = 0`.

**Evidence:** AWS console screenshot of the CMK + key policy export +
output of the migration script.

---

### CC9.2 — Pull annual SOC 2 reports from every vendor

**Owner:** Qualified Individual.

**Steps:** for each Critical + High vendor in `vendor-register.md`:
1. **Plaid** → dashboard → **Compliance** → download SOC 2 Type 2.
2. **Neon** → request SOC 2 via account-management portal.
3. **AWS** → AWS Artifact → download SOC 2.
4. **Cloudflare** → support portal → request SOC 2 (NDA on file).
5. **Google Workspace** → Admin console → Compliance → download SOC 2.
6. **DocuSign** → Trust Center.
7. **SureLC** — request via account manager; if the vendor cannot
   provide one, escalate per `vendor-management.md` § 4.
8. Save each PDF under `Security/Vendors/<vendor>/2026-soc2.pdf`.
9. Update the "Last review" column in `vendor-register.md` to today.

**Acceptance:** every Critical + High vendor row has a current report
linked from the register.

**Evidence:** `Security/Vendors/<vendor>/2026-soc2.pdf` for each.

---

### CC7.4 + A1.3 — Run the first quarterly backup fire-drill

**Owner:** rotating; first drill: tech lead.

**Steps:** follow the checklist in `backup-restore.md` § "Quarterly
fire-drill checklist". Time each phase. File the report at
`Security/Fire-drills/2026-Qx-restore.md` with: time-to-decrypt,
time-to-restore, surprises, fixes.

**Acceptance:** drill report exists and at least one fix went into
git. RTO measured ≤ 60 min.

**Evidence:** `Security/Fire-drills/2026-Q2-restore.md`.

---

### A1.2 — Wire the off-host weekly backup pipeline

**Owner:** tech lead.

**Steps:**
1. Provision the S3 bucket + IAM:
   ```sh
   aws s3api create-bucket --bucket gc-backups-prod --region us-east-1
   aws s3api put-bucket-versioning --bucket gc-backups-prod \
     --versioning-configuration Status=Enabled
   aws s3api put-object-lock-configuration --bucket gc-backups-prod \
     --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":2555}}}'
   aws s3api put-public-access-block --bucket gc-backups-prod \
     --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```
2. Generate a fresh GPG key for backup encryption; store the private
   half in a 3-of-5 Shamir split + safety-deposit box. Add public half
   to a `BACKUP_GPG_PUBLIC` secret.
3. Add `.github/workflows/weekly-backup.yml` that:
   - runs Sundays 02:00 UTC,
   - `pg_dump --format=custom --compress=9` against `DATABASE_URL`,
   - encrypts with `BACKUP_GPG_PUBLIC`,
   - uploads to `s3://gc-backups-prod/db/<YYYYMM>/...`,
   - posts a `founder_audit_log` row via a small CLI helper.

**Acceptance:** S3 bucket has at least 1 object after the first run;
audit-log entry `weekly_backup_uploaded` exists.

**Evidence:** `Security/Backups/first-upload-confirmation.png`.

---

### CC1.4 — Onboarding security briefing slide deck

**Owner:** Qualified Individual.

**Steps:** create a Google Slides deck covering:
1. Why we're regulated (GLBA + state insurance + SOC 2).
2. Data classes (link to `data-classification.md`).
3. AUP highlights (link to `acceptable-use.md`).
4. How to set up 2FA (passkey first; TOTP fallback).
5. Where the runbooks live.
6. How to report incidents.

Required reading at hire; Qualified Individual presents in 30 minutes
on day 1. Save the deck PDF at `Security/Onboarding/onboarding-deck.pdf`.

**Acceptance:** every operator's onboarding folder contains a signed
acknowledgement + the deck date they viewed it.

**Evidence:** `Security/Onboarding/`.

---

## Wave 3 — within 60 days (M items)

### CC6.5 — Automate hard-delete after retention windows

**Owner:** tech lead.

**Steps:**
1. Build `scripts/retention-sweep.mjs` that, for each table in
   `data-retention.md`, runs the appropriate deletion query in a
   transaction and audit-logs `retention_swept` with the row count.
2. Wire it as a daily GitHub Actions cron OR a small Render/Railway
   cron job. Same auth pattern as the daily-health workflow.
3. Test in staging: insert 5 fake `plaid_pending_deposits` with
   `reviewed_at = NOW() - INTERVAL '120 days'`, run the sweep, confirm
   they're gone and the audit log has a row.

**Acceptance:** sweep runs daily; audit log shows
`retention_swept` rows weekly.

**Evidence:** Workflow run history + audit-log query screenshot.

---

### CC4.1 — Ship Cloudflare logs to long-term retention

**Owner:** tech lead. (Requires Cloudflare Pro+ plan.)

**Steps:**
1. Cloudflare → **Analytics & Logs** → **Logs** → **Logpush**.
2. Configure HTTP request logs → push to `s3://gc-cflogs-prod/` daily
   in compressed JSON.
3. S3 lifecycle: 90 days hot → Glacier Deep Archive 7 years.
4. Document retrieval procedure in `breach-response.md` § 4 "Tools".

**Acceptance:** S3 bucket receives daily log archives.

**Evidence:** Logpush job config screenshot + S3 listing.

---

## Wave 4 — within 90 days (L items)

### CC6.7 — Workstation MDM

**Owner:** Qualified Individual + each operator.

**Steps:**
1. Evaluate Kandji vs Jamf Now vs Mosyle. Pick one (Kandji
   recommended for small Apple-only fleets; ~$5–9/device/month).
2. Enroll every workstation that holds production credentials. Apply
   baseline:
   - FileVault on, escrow recovery key.
   - Auto-screen-lock ≤ 10 min.
   - Auto-update on (OS + browser).
   - App allowlist; block `curl | sh` shell installers in policy.
3. Add an MDM compliance check to onboarding.

**Acceptance:** MDM dashboard shows 100% enrollment + 100% compliance.

**Evidence:** MDM dashboard export.

---

### CC1.2 (extension) — Annual report to the founders' group

**Owner:** Qualified Individual.

**Steps:** at the end of each fiscal year, produce a written report
covering:
- ISP changes during the year.
- Risk-register changes.
- Incident summary (count by severity).
- Vendor-register changes.
- Plan for the next year.

Present at the year-end founders' meeting; minute the discussion.

**Acceptance:** report PDF + meeting minutes filed in
`Security/Reviews/2026-annual-report.pdf`.

**Evidence:** that file.

---

## Cross-cutting — engaging the audit firm

Once Waves 1–3 are closed, hand off the
[audit-firm kickoff packet](./audit-firm-packet.md) and engage:

1. **Drata or Vanta** for evidence automation. ~$10–15k/year for the
   appropriate tier; they'll integrate with our GitHub, AWS,
   Cloudflare, Google Workspace, and pull evidence on schedule.
2. A **Type 1 audit firm** through the platform's auditor network.
   Recommended: target a Monday for the as-of date 4 weeks after
   readiness sign-off. Budget ~$15–25k for Type 1.
3. After Type 1 lands, observe the controls for **6 months** while the
   evidence-collection cadence in `evidence-collection.md` runs in the
   background. Then engage the same auditor for **Type 2**.

---

## Tracking

Re-grade the readiness matrix weekly. When all rows are ✓, set the
attestation as-of date and notify the audit firm. The Qualified
Individual owns the schedule.
