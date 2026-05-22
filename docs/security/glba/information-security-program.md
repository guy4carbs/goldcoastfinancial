# Information Security Program (ISP) — Gold Coast Financial Partners LLC

**Version:** 1.0
**Effective:** 2026-04-28
**Owner (Qualified Individual under 16 CFR § 314.4(a)):** Gaetano Carbonara,
Founder.
**Review cadence:** annually, plus on any material change to systems or
threat model.

The Federal Trade Commission's Standards for Safeguarding Customer
Information ("Safeguards Rule," 16 CFR Part 314) requires every "financial
institution" subject to the Gramm-Leach-Bliley Act to maintain a written
Information Security Program. Gold Coast Financial Partners LLC sells
insurance products, holds non-public personal information ("NPI") on
applicants and policyholders, and is therefore in scope. This document is
the written ISP.

---

## 1. Scope

The ISP covers every system, service, and human process that touches NPI:

- The web application at `app.heritagels.org` (this repo).
- The PostgreSQL database hosted at Neon.
- AWS KMS, AWS Secrets Manager, AWS S3 (when in use for backups).
- Cloudflare (edge layer).
- Third-party processors handling NPI on our behalf (Plaid, Telnyx,
  Google Workspace, DocuSign, SureLC).
- Workstations used by founders, agents, and admins to access the above.
- All hard-copy NPI (rare, but not zero).

NPI in scope explicitly includes: SSNs, banking routing/account numbers,
driver-license numbers, beneficiary SSNs, financial account credentials
(Plaid `access_token`s), and any combination of name + medical condition
disclosed during underwriting.

## 2. Designation of Qualified Individual

Per § 314.4(a): the Qualified Individual responsible for overseeing,
implementing, and enforcing the ISP is the named Founder above. The
Qualified Individual reports at least annually to the founders' group on
the program's status, current and emerging risks, and any incidents.

If the Qualified Individual leaves the role, the founders' group must
designate a replacement within 30 days and update this document.

## 3. Risk Assessment

A documented risk assessment lives in
[`risk-assessment.md`](./risk-assessment.md). It is updated:

- on any material change to the system (new integration, schema change to
  a table holding NPI, change in hosting provider);
- after any security incident, near-miss, or audit finding;
- otherwise annually.

The current assessment identifies the following top-tier risks:

| # | Risk | Mitigation reference |
|---|------|----------------------|
| 1 | Compromise of admin credentials | 2FA mandatory for FOUNDER/OWNER/SYSTEM_ADMIN, WebAuthn passkeys preferred (see `auth/2fa/*`, `auth/webauthn/*` routes) |
| 2 | Field-level NPI exfiltration | AES-256-GCM at rest, KMS envelope encryption (Phase 2), append-only audit log |
| 3 | Plaid `access_token` leak | Encrypted at write, KMS-wrapped when KMS_KEY_ID set, never returned over API, never logged (log scrubber) |
| 4 | CSRF / forged write | Double-submit token on every state change |
| 5 | SQL injection | Parameterized queries via Drizzle / pg; Zod at every boundary |
| 6 | Vendor breach (Plaid, Neon, etc.) | Vendor register + due diligence in [`vendor-register.md`](./vendor-register.md); rotation runbook in `secret-rotation.md` |
| 7 | Insider misuse | Append-only audit log, view-as session blocking writes, role-based access |

## 4. Safeguards Implemented (§ 314.4(c))

Each item maps to the controlling code or doc.

### Access controls
- RBAC enforced at every API boundary (`requireAuth` → `requireRole`).
- Postgres Row-Level Security on the highest-risk tables (Phase 2.3).
- Mandatory 2FA on high-trust roles (FOUNDER/OWNER/SYSTEM_ADMIN).
- View-as impersonation flag prevents writes during impersonation.

### Encryption
- TLS 1.2+ in transit (enforced by Neon `sslmode=require` + Cloudflare).
- AES-256-GCM at rest for SSN, banking, beneficiary SSN, driver license,
  Plaid `access_token`, 2FA secret, recovery codes.
- KMS envelope encryption available for production (Phase 2.2).

### Multi-factor authentication
- TOTP enrolment + verification via `otplib` (RFC-6238).
- WebAuthn passkeys via `@simplewebauthn/server` (Phase 2.1, NIST AAL2).
- High-trust roles cannot reach `/api/founders/*` without verifying.

### Logging and monitoring
- Append-only `founder_audit_log` (DB triggers prevent UPDATE / DELETE).
- Generic `audit_logs` table for non-founder writes.
- Phase 3.3 hash-chain makes the audit log tamper-evident.

### Secure development
- TypeScript strict mode; `npm run check` blocks builds with type errors.
- Dependabot weekly + `npm audit --audit-level=high --omit=dev` in CI.
- gitleaks secret scan in CI.
- Branch protection: 1 review, signed commits, required checks.

### Inventory + classification
- This file's Section 1 lists the NPI we hold.
- The vendor register tracks every external party with NPI access.
- Database schema annotates encrypted columns with `_encrypted` suffix
  so search-and-grep works as a poor-man's classification.

### Disposal
- Soft-delete + 30-day recovery window for `founder_distributions`,
  `plaid_pending_deposits`, etc.
- Hard-delete after legal retention windows (see § 6).

## 5. Service Provider Oversight (§ 314.4(f))

Every service provider with access to NPI is contracted under terms
requiring them to maintain appropriate safeguards. The vendor register
([`vendor-register.md`](./vendor-register.md)) tracks:

- Service provider name + service.
- Type of NPI shared.
- Contractual safeguards (DPA, SOC 2 type 2 certification, etc.).
- Date of last review.

The Qualified Individual reviews the register annually and on any change
to the service relationship.

## 6. Incident Response (§ 314.4(h))

The detailed runbook is in [`../breach-response.md`](../breach-response.md).
Summary:

- Detect: alert thresholds + audit-chain verification (Phase 3.3).
- Contain within 1 hour of detection (rotate keys, suspend access).
- Notify: founders within 1 hour; affected individuals per applicable
  state notification laws (most 30–60 days; California 72 hours under
  CPRA breach amendments; New York DFS 23 NYCRR 500: 72 hours to NYDFS).
- Federal Trade Commission notification within 30 days when an incident
  involves the NPI of 500+ consumers (§ 314.5).

## 7. Training (§ 314.4(e))

All personnel with access to NPI complete:
- An onboarding security briefing (covers this ISP, the IR runbook,
  and the secret-rotation runbook).
- An annual refresher.

Founders and admins additionally complete:
- Quarterly tabletop exercise covering one IR scenario.

Records of completion are kept in the project's HR system and reviewed
by the Qualified Individual annually.

## 8. Continuous Evaluation (§ 314.4(d))

- Continuous monitoring: Cloudflare WAF logs, application audit log,
  CI security workflow.
- Periodic testing: quarterly backup restore drill, annual penetration
  test (engaged externally), annual review of this ISP.

## 9. Records

The Qualified Individual maintains the following records:

- This ISP (versioned in git).
- Every risk assessment.
- Every service-provider review.
- Every incident, near-miss, and post-mortem.
- Every annual report to the founders' group.

Retention: minimum 7 years.

---

## Change log

| Date | Version | Author | Notes |
|------|---------|--------|-------|
| 2026-04-28 | 1.0 | Founders | Initial issuance covering Phase 1 + Phase 2 controls and Phase 3 documentation. |
