# SOC 2 Evidence Collection

**Audit type targeted first:** Type 1 (point-in-time). Type 2 follows once
the controls have run for 6 months.

Evidence must be:
- **Reproducible** — the auditor can re-collect it from the same source
  on demand.
- **Timestamped** — when it was captured matters.
- **Owner-attributable** — every artifact has a known capturer.
- **Retained** — minimum 7 years, encrypted at rest.

---

## Where evidence lives

| Bucket | Tooling | Retention | Owner |
|--------|---------|-----------|-------|
| Code controls | This git repo | Indefinite (git history) | Founders |
| CI run history | GitHub Actions | 90 days default; export quarterly | Founders |
| Cloudflare logs | Cloudflare Analytics → S3 (when on Pro+) | 90 days hot, 7y cold | Founders |
| Application audit log | Postgres `founder_audit_log` table | Append-only forever | Founders |
| Authentication events | Postgres `login_attempts` + 2FA tables | Indefinite | Founders |
| Vendor reports | Notion / Drive (`Security/Vendors/`) | 7 years | Qualified Individual |
| Tabletop minutes | Notion / Drive (`Security/Tabletops/`) | 7 years | Qualified Individual |
| Access reviews | Notion / Drive (`Security/Access/`) | 7 years | Qualified Individual |

## Per-control evidence checklist

For the auditor, the easiest path is a one-folder-per-criterion layout in
the secure file store. The list below is what each folder should contain.

### CC1 — Control Environment
- [ ] Signed copy of this ISP (PDF export per version).
- [ ] Org chart with role assignments.
- [ ] Acknowledgement signatures from every employee with NPI access.

### CC2 — Communication
- [ ] Screenshot or export of the security@goldcoastfnl.com inbox config.
- [ ] Sample of an internal security communication.

### CC3 — Risk Assessment
- [ ] Latest risk register snapshot (PDF of `risk-assessment.md`).
- [ ] Minutes of the annual risk review meeting.

### CC4 — Monitoring
- [ ] One week of Cloudflare access logs.
- [ ] One week of `founder_audit_log` rows (sanitized export).
- [ ] CI security workflow run history (GitHub Actions export).

### CC5 — Control Activities
- [ ] PDF export of `control-map.md` (this file's parent).

### CC6 — Logical & Physical Access
- [ ] Output of `SELECT id, role, two_factor_enabled FROM users WHERE role
      IN ('founder', 'owner', 'system_admin')`.
- [ ] Output of `SELECT user_id, COUNT(*) FROM webauthn_credentials GROUP
      BY user_id` (passkey adoption proof).
- [ ] Sample login flow demonstrating 2FA enforcement.
- [ ] Disk-encryption + screen-lock attestation per workstation.

### CC7 — System Operations
- [ ] Latest 4 quarterly fire-drill reports.
- [ ] Sample IR runbook walkthrough.
- [ ] Patch management evidence: Dependabot PRs merged in the last 90 days.

### CC8 — Change Management
- [ ] PR template + branch-protection rules screenshot.
- [ ] Sample PR with code review + CI green + signed commit.

### CC9 — Risk Mitigation
- [ ] Vendor register PDF.
- [ ] Vendor SOC 2 reports for each in-scope provider (in their folder).

### A1 — Availability
- [ ] Backup retention policy (Neon dashboard screenshot).
- [ ] Latest fire-drill report.
- [ ] Cloudflare uptime dashboard export.

### C1 — Confidentiality
- [ ] Encryption-at-rest evidence: KMS console screenshot + key policy.
- [ ] TLS report from SSL Labs (A or A+).
- [ ] Sample row from `users` showing `*_encrypted` column populated.

### PI1 — Processing Integrity
- [ ] Sample CI run showing `npm run check` passing.
- [ ] Sample Zod schema rejection (`/api/founders/profit/deposits` with
      bad payload returning 400 with details).

---

## Capture cadence

| Interval | Artifact |
|----------|----------|
| Every PR | Code review + CI evidence (GitHub captures automatically) |
| Daily | CI security workflow run |
| Weekly | Audit-chain verifier output (Phase 3.3) |
| Monthly | Cloudflare log export to S3 |
| Quarterly | Access review, fire-drill, vendor SOC 2 status check |
| Annually | Risk assessment, ISP review, penetration test |

---

## Audit-firm selection

Recommended progression:

1. Start with **Drata** or **Vanta** for evidence automation. Both
   integrate with GitHub, AWS, Cloudflare, and Google Workspace and pull
   evidence on a schedule.
2. Use either platform's "auditor network" to engage a Type 1 audit firm.
   Expect ~3 months from kickoff to signed report; budget ~$15–25k.
3. After Type 1 lands, observe the controls for 6 months, then hire the
   same auditor for Type 2.

The Qualified Individual owns this engagement.
