# Operator Handoff — Everything You (the founder) Need to Do

**Owner of this list:** Qualified Individual.
**Last updated:** 2026-04-28.

This is the definitive list of every action that requires a human at a
keyboard with credentials, a signature, or a phone call — across all
4 phases shipped (Phase 1 critical, Phase 2 defense-in-depth, Phase 3
GLBA + Type 1 prep, SOC 2 prep). Everything code-side has already been
implemented; this list captures only what code can't do for you.

Items are grouped by **how soon** + **who** can do them. Tick the box
when done so the next operator picks up where you left off.

---

## ⚡ Right now (this week)

These unblock everything else.

### Restart the dev server so the latest server code is live
- [ ] In the terminal running `npm run dev`, hit Ctrl+C → run
      `npm run dev` again. (Plaid + CSRF + 2FA + WebAuthn + RLS context
      + KMS encryption path + audit-chain verifier + SOC 2 evidence
      endpoints all need this.)
- [ ] Smoke check: `curl -s http://localhost:3000/api/csrf-token` returns
      `{"csrfToken":"…"}`.

### Stand up the security comms
- [ ] **Slack** → create private channel `#sec-ir`, add all 3 founders,
      pin `docs/security/breach-response.md`.
- [ ] **Google Workspace** → Admin → **Apps → Gmail → Routing** → create
      `security@goldcoastfnl.com` group routing to all 3 founders.
- [ ] Confirm `https://app.heritagels.org/.well-known/security.txt`
      resolves (file already shipped at
      `client/public/.well-known/security.txt`).
- [ ] Save screenshots under `Security/Communication/`.

### Enable GitHub branch protection on `main`
- [ ] Repo **Settings → Branches → Branch protection rules → Add rule**
      and apply every checkbox in `docs/security/branch-protection.md`.
- [ ] Save the screenshot at
      `Security/Change-Management/branch-protection.png`.

### Sign + adopt the policy pack
- [ ] Print to PDF + sign every file under `docs/security/policies/`
      (8 policies) plus `docs/security/glba/information-security-program.md`.
- [ ] Each operator counter-signs the acknowledgement template at
      `docs/security/templates/policy-acknowledgement.md`.
- [ ] File signed PDFs at `Security/Acknowledgements/<operator>-<date>.pdf`.

### Schedule recurring meetings
- [ ] Google Calendar → 3 recurring events:
  - **Founders Security Review** — 60 min — first Mon of every quarter.
  - **Backup Fire-drill** — 90 min — second Mon of every quarter.
  - **Tabletop Exercise** — 60 min — third Mon of every quarter.
- [ ] Use the templates I shipped:
  - `docs/security/templates/quarterly-review-minutes.md`
  - `docs/security/templates/fire-drill-report.md`
  - `docs/security/templates/incident-postmortem.md`

---

## 🚦 Within 30 days

### Plaid (production)
- [ ] Plaid dashboard → **Team Settings** → request **Production** access.
- [ ] Set `PLAID_CLIENT_ID` + `PLAID_SECRET` in production env (Secrets
      Manager once provisioned; Vercel/Railway env in the meantime).
- [ ] Set `PLAID_ENV=production`.
- [ ] Set `PLAID_WEBHOOK_URL=https://app.heritagels.org/api/founders/plaid/webhook`.
- [ ] Plaid dashboard → **Webhooks** → set the same URL.
- [ ] Smoke test: connect the actual Chase business checking account from
      the Profit Split page.

### Cloud KMS + Secret Manager (Phase 2.2 + Phase 2.5) — DEFERRED

**Status (2026-04-30):** Code is wired to use **Google Cloud KMS** + **Cloud
Secret Manager** (matching the rest of the Firebase/GCP stack). Provisioning
is **blocked on Google Workspace org policies**:
  - `iam.disableServiceAccountKeyCreation` — blocks downloading SA JSON keys.
  - `iam.allowedPolicyMemberDomains` — blocks granting IAM roles to principals
    outside the allowed domain.

**Until unblocked:** field-level encryption falls through to v1 (env-key
AES-256-GCM via `FIELD_ENCRYPTION_KEY`). This still meets the GLBA Safeguards
Rule encryption-at-rest requirement (16 CFR § 314.4(c)(3)). It is a "partial"
on SOC 2 control C1.2 — auditor will note as a gap with remediation plan.

**To unblock (future task):**
- [ ] Talk to Google Workspace admin / MSP to either:
  - Relax `iam.disableServiceAccountKeyCreation` on the `goldcoastfnl`
    project, OR
  - Grant the `gold-coast-app-prod` SA "Cloud KMS CryptoKey Encrypter/
    Decrypter" + grant a workspace email `roles/iam.serviceAccountTokenCreator`
    on that SA (so dev can impersonate it via gcloud ADC).
- [ ] Once unblocked, set in production env:
      `GCP_KMS_KEY_NAME=projects/goldcoastfnl/locations/us-central1/keyRings/goldcoast-prod/cryptoKeys/fields`
      `GCP_PROJECT_ID=goldcoastfnl`
- [ ] Run the v1 → v2 migration:
      `npx tsx scripts/rotate-encryption-to-v2.mjs`
- [ ] Confirm with `curl /api/founders/soc2/evidence` →
      `encryption.kmsConfigured = true` and `plaidItemsV1 = 0`.

**Revisit cadence:** Required before SOC 2 Type 1 audit kickoff (target Q3),
or before pushing Plaid to production with real Chase tokens — whichever
comes first.

### Cloudflare (Phase 2.4)
- [ ] Apply every section of `docs/security/cloudflare.md` against the
      production zone:
  - SSL/TLS Full (strict), TLS 1.3 minimum, HSTS preload, Always
    HTTPS.
  - Bot Fight Mode (free) or Super Bot Fight Mode (Pro+).
  - WAF custom rules: auth rate limit, IP allowlist for `/api/founders/*`,
    Plaid webhook bypass.
  - Page Rules: bypass cache for `/api/*`.
- [ ] Save the rule list export under `Security/Cloudflare/`.

### AWS — backup bucket + GPG key (Phase 3.4)
- [ ] Create the bucket (commands in
      `docs/security/soc2/closing-playbook.md` Wave 2):
      `gc-backups-prod` with Object Lock COMPLIANCE retention 2555 days
      + versioning + Block Public Access.
- [ ] Generate a fresh GPG keypair for backup encryption:
      `gpg --quick-gen-key backup@goldcoastfnl.com rsa4096 sign,encrypt 0`
- [ ] Export the **public** key:
      `gpg --armor --export backup@goldcoastfnl.com`. Add to GitHub
      secret `BACKUP_GPG_PUBLIC_KEY`.
- [ ] **Split the private key** with Shamir's Secret Sharing (3-of-5):
      `ssss-split -t 3 -n 5 -s 256 < <(gpg --export-secret-keys --armor)`.
      Distribute shares: 2 to founders' password managers, 2 to a
      safety-deposit box, 1 to counsel. Document the split in
      `Security/Backups/key-shares.md`.
- [ ] Set GitHub Actions secrets: `AWS_BACKUP_ROLE_ARN`, `AWS_REGION`,
      `BACKUP_BUCKET=gc-backups-prod`, `DATABASE_URL_RO`.
- [ ] Provision the IAM role with OIDC trust + `s3:PutObject` +
      `s3:PutObjectRetention` on the bucket.
- [ ] Wait for Sunday 02:00 UTC; confirm a `.dump.gpg` lands in S3.

### Daily security health workflow (Phase 3 + SOC 2 prep)
- [ ] Generate a long-lived founder session cookie for the bot probe.
      One-shot: log in as a founder with curl, capture the
      `connect.sid` cookie, store it as the GitHub secret
      `HEALTHCHECK_SESSION_COOKIE`. Rotate every 90 days per
      `docs/security/secret-rotation.md`.
- [ ] (Optional) Set `SLACK_SECURITY_WEBHOOK` repo secret for the daily
      digest.

### First quarterly fire-drill (Phase 3 + SOC 2 prep)
- [ ] Schedule + run per `docs/security/backup-restore.md` checklist.
- [ ] File the report at
      `Security/Fire-drills/2026-Q2-restore.md` using the template.

### Vendor SOC 2 reports
- [ ] Pull current SOC 2 Type 2 from each Critical+High vendor in
      `docs/security/glba/vendor-register.md`:
  - Plaid (compliance dashboard)
  - Neon (account portal request)
  - AWS (Artifact)
  - Cloudflare (support portal)
  - Google Workspace (Admin → Compliance)
  - DocuSign (Trust Center)
  - SureLC (account manager)
- [ ] File at `Security/Vendors/<vendor>/2026-soc2.pdf`.
- [ ] Update "Last review" column in `vendor-register.md`.

### 2FA enrolment for every founder
- [ ] Each founder logs in. The middleware redirects to
      `/auth/2fa/enroll`. Click "Use a passkey (recommended)" → complete
      Touch ID / Windows Hello / hardware key prompt.
- [ ] Save recovery codes in 1Password (each founder, in their personal
      vault).
- [ ] Repeat as soon as Owner / System Admin roles are assigned.

---

## 📅 Within 60 days

### Workstation MDM (Phase 2 → SOC 2 CC6.7)
- [ ] Evaluate Kandji vs Jamf Now vs Mosyle. Sign 1-year contract.
- [ ] Enroll every workstation that holds production credentials.
      Baseline: FileVault on, screen-lock ≤ 10 min, auto-update on,
      app allowlist.
- [ ] Update onboarding to require MDM enrollment day 1.

### Cloudflare Logpush (SOC 2 CC4.1)
- [ ] Cloudflare → Analytics & Logs → **Logpush**. Push HTTP logs to
      `s3://gc-cflogs-prod/`. 90-day hot → Glacier Deep Archive 7y.

### First tabletop exercise
- [ ] Schedule + run; pick one of the 4 scenarios in
      `docs/security/breach-response.md` § 9.
- [ ] File minutes under `Security/Tabletops/`.

---

## 🎯 Within 90 days

### Engage Drata or Vanta
- [ ] Demo both. Sign a 1-year contract (~$10–15k).
- [ ] Connect integrations: GitHub, AWS, Cloudflare, Google Workspace.
- [ ] Hand them `docs/security/soc2/audit-firm-packet.md`.

### Engage a Type 1 audit firm
- [ ] Through the Drata/Vanta auditor network or independent CPA.
      Budget ~$15–25k.
- [ ] Set the as-of date for 4 weeks after sign-off on
      `docs/security/soc2/readiness-matrix.md` (target Monday).
- [ ] Schedule scoping call within 2 weeks of engagement letter.

### Annual penetration test
- [ ] Engage an external firm (rotate firms preferred). Budget
      ~$15–35k for a 1–2 week scoped engagement.
- [ ] Treat findings per `docs/security/policies/vulnerability-management.md`
      severity SLAs.

---

## 📅 Quarterly forever (cadence)

- First Monday: founders security review (use template).
- Second Monday: backup fire-drill (use template).
- Third Monday: tabletop exercise.
- During quarter: annual SOC 2 vendor pulls (1–2 per month rolling).
- 90 days: rotate session secret, CSRF secret, field encryption key
      per `docs/security/secret-rotation.md`.

---

## ✅ Already done (no action needed)

For your peace of mind, here's what code/docs are already in place — you
don't need to do anything for these:

- **Phase 1**: CSRF middleware mounted, login rate-limit + DB lockout
  active, TOTP enrolment + verification routes, HSTS + helmet headers
  tightened, log scrubber installed, Plaid integration code-complete
  (waiting on production credentials), Pending Review tray in the
  Profit Split UI.
- **Phase 2**: WebAuthn passkey routes + UI, KMS envelope encryption
  service (waits for `KMS_KEY_ID`), Postgres RLS policies live on 6
  high-risk tables, Cloudflare runbook drafted, Secrets Manager loader
  wired (waits for `SECRETS_MANAGER_SECRET_ID`), Dependabot + npm audit
  CI + gitleaks all in `.github/`.
- **Phase 3**: Tamper-evident audit chain trigger live, verifier
  endpoint + service, GLBA ISP + risk register + vendor register,
  backup runbook + breach-response runbook + secret-rotation runbook.
- **SOC 2 prep**: Readiness matrix + closing playbook + control map +
  evidence-collection guide + audit-firm kickoff packet, live evidence
  + access-review endpoints, daily security health workflow, weekly
  backup workflow (waits for AWS secrets), retention sweep workflow +
  script, KMS migration script (waits for `KMS_KEY_ID`), 8 policies +
  templates + onboarding deck.

If you only do the "Right now" list, you'll have closed CC2.2, CC2.3,
CC5.3, CC8.1, CC1.2, CC4.2 — that's 6 of the open SOC 2 readiness rows
in one week.
