# Security Briefing — Day 1

**Audience:** every new operator (founder, admin, agent, contractor) who
will hold credentials to a Gold Coast Financial system.
**Format:** 30-minute walk-through, presented by the Qualified Individual.
**Frequency:** at hire + on any material policy revision.

This doc is the source for the slide deck. To turn it into Google Slides,
copy each `## Slide N — …` heading + body into one slide.

---

## Slide 1 — Why this matters

- We sell life insurance. Customers trust us with their **SSN, DOB,
  banking, beneficiaries, medical history**.
- That data is regulated by:
  - **GLBA Safeguards Rule** — federal, mandatory.
  - **State insurance recordkeeping** — varies by state.
  - **CCPA / NYDFS / state breach notification** — kicks in on a leak.
- One leaked SSN = a 30-year fraud window for that customer + a 30-day
  window for us to start notifying regulators.
- We've engineered the system to fail safe. Your part is to not
  defeat it.

## Slide 2 — Who's responsible for what

| Role | Responsibility |
|------|----------------|
| Qualified Individual (Founder) | The whole program. Decides risk acceptance. |
| Tech lead | Code controls, CI, deployments. |
| Counsel (when retained) | Notifications, contracts. |
| Every operator | Following AUP + reporting incidents fast. |

If you're not sure where something falls, ask the QI before you act.

## Slide 3 — Data classes (one-page summary)

| Class | Examples | Rule |
|-------|----------|------|
| **Restricted** | SSN, banking, Plaid tokens, 2FA secrets | Never leaves an encrypted column. Never goes to ChatGPT. |
| **Confidential** | Names, DOB, policy details, commission $$ | Authenticated + RBAC. Never in URLs. |
| **Internal** | Aggregate KPIs, team rosters | Authenticated only. |
| **Public** | Marketing pages | No restrictions. |

Full policy: `docs/security/policies/data-classification.md`.

## Slide 4 — Acceptable use top 8

1. Strong password in a password manager.
2. Enroll a passkey (or TOTP) within 7 days. Required for high-trust
   roles.
3. Disk encryption + screen-lock ≤ 10 min idle on every device.
4. **Never** share credentials. Even with spouse, family, or another
   employee.
5. **Never** disable security controls.
6. **Never** paste NPI into ChatGPT, Claude, Copilot, or any LLM.
7. **Never** export NPI to a personal device or unencrypted drive.
8. **Always** report incidents to `security@goldcoastfnl.com` + the QI.

Full policy: `docs/security/policies/acceptable-use.md`.

## Slide 5 — How to set up 2FA

**For founders, owners, system admins this is mandatory.**

1. Log in.
2. The app auto-redirects you to `/auth/2fa/enroll`.
3. **Recommended path: passkey.** Click "Use a passkey (recommended)" →
   complete the OS prompt (Touch ID / Windows Hello / hardware key).
4. **Fallback path: TOTP.** Scan the QR with your authenticator app
   (1Password / Authy / Google Authenticator). Save the recovery codes
   in your password manager. Type the 6-digit code to confirm.
5. Done. Future logins prompt for the second factor.

If you lose your authenticator: use a recovery code. If you've used all
of them, contact the QI for an account reset.

## Slide 6 — How to ship code

1. Branch from `main`. Sign your commits (`git commit -S`).
2. Open a PR. Describe what + why + test plan.
3. Wait for ≥ 1 reviewer + green CI (typecheck, npm audit, gitleaks).
4. Squash-merge. CI deploys to production.
5. Schema changes: drop a migration in `migrations/NNNN_*.sql` + a
   rollback note in the PR description.

Emergency? Tag `[EMERGENCY]` in the PR title and ping a founder. Even
emergencies still get a follow-up PR with tests + post-mortem within 24h.

Full policy: `docs/security/policies/change-management.md`.

## Slide 7 — Incident reporting

If you suspect:
- Your credentials were compromised.
- You sent NPI to the wrong recipient.
- An app is behaving unexpectedly.
- Anyone (including you) violated a policy.

Do this:
1. **Don't fix it yet.** Screenshot or copy the alert.
2. Post in `#sec-ir`. Tag the QI.
3. Follow `docs/security/breach-response.md` § 0.

We do **not** punish good-faith self-reports. Hiding a mistake makes the
blast radius worse.

## Slide 8 — Where the runbooks live

- `docs/security/glba/information-security-program.md` — the program.
- `docs/security/policies/` — the 8 policies.
- `docs/security/breach-response.md` — IR runbook.
- `docs/security/backup-restore.md` — backups + restore.
- `docs/security/secret-rotation.md` — quarterly key rotation.
- `docs/security/cloudflare.md` — edge config.
- `docs/security/soc2/audit-firm-packet.md` — what we hand the auditor.

Read at hire. Re-read at any role change.

## Slide 9 — Acknowledgement

By accessing the system you agree to:
- The Code of Conduct (`docs/security/policies/code-of-conduct.md`).
- The Acceptable Use Policy.
- The other policies referenced above.

Sign the acknowledgement form (template in
`docs/security/templates/policy-acknowledgement.md`) and email a signed
PDF to `security@goldcoastfnl.com`.

## Slide 10 — Questions

Email `security@goldcoastfnl.com` or post in `#sec-ir`. Stupid questions
prevent expensive incidents.
