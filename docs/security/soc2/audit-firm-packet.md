# SOC 2 Audit Firm Kickoff Packet

**Audience:** the engaged audit firm (Drata-network or independent CPA).
**Contact:** `security@goldcoastfnl.com` · Qualified Individual: Founder.
**Target attestation:** SOC 2 Type 1, point-in-time as of YYYY-MM-DD
(date set at engagement letter).

This is the single document a new audit firm receives at kickoff. It
links every other artifact they'll need.

---

## 1. Service organization description

**Legal entity:** Gold Coast Financial Partners LLC (Delaware), operating
the Heritage Life Solutions insurance product.

**Service:** A SaaS platform that:
- Originates and tracks life-insurance applications.
- Manages agent contracting and carrier appointments.
- Tracks commissions and founder distributions.
- Provides a Founders Lounge for ownership-level financial oversight,
  including a Plaid-driven view of the company's Chase business
  checking account.

**Production architecture (as of 2026-04-28):**
- Web app: React 19 + Vite SPA + Express + TypeScript on Node 22.
- Database: Postgres on Neon (US East). TLS to client; AES-256
  encrypted at rest by Neon; column-level AES-256-GCM at the app for
  Restricted fields; KMS envelope encryption available when
  `KMS_KEY_ID` is configured.
- Edge: Cloudflare in front of `app.heritagels.org` (Full Strict TLS,
  WAF, Bot Fight Mode).
- Secrets: AWS Secrets Manager in production; `.env` in dev.
- Object storage: AWS S3 (backups w/ Object Lock COMPLIANCE; future).
- KMS: AWS KMS Customer-Managed Key for envelope encryption + backup
  encryption (separate keys).

**Locations:**
- Code: this GitHub repository.
- Production data: Neon US-East-1.
- Backups: AWS S3 us-east-1 (when wired).
- Operators: founders only at this stage; no offshore.

**Boundary:** the system in scope ends at vendor APIs (Plaid, Neon,
Cloudflare, Google Workspace, etc.). Vendor controls are addressed via
the vendor management program (CC9.2).

## 2. Trust Services Criteria selected

For Type 1:
- ✅ **Security (Common Criteria CC1–CC9)**
- ✅ **Availability (A1)**
- ✅ **Confidentiality (C1)**
- ✅ **Processing Integrity (PI1)**
- ⏸ **Privacy (P1–P8)** — deferred to Type 2 once consumer-facing
  flows expand. Today, NPI flows are limited to client onboarding via
  agents and are governed by GLBA (covered separately).

## 3. Control matrix

The complete map of control → implementation → evidence is in:
- [`control-map.md`](./control-map.md) — every TSC reference linked
  to file paths.
- [`readiness-matrix.md`](./readiness-matrix.md) — current
  Implemented/Partial/Gap status.

## 4. Evidence layout

Three sources:

### 4.1 Code controls — this repo
- `server/middleware/auth.ts` — RBAC + 2FA gate.
- `server/middleware/csrf.ts` — CSRF.
- `server/middleware/rlsContext.ts` — RLS session vars.
- `server/services/encryptionService.ts` — v1 + v2 encryption.
- `server/services/totp.ts`, `webauthn.ts` — MFA.
- `server/services/auditChainVerifier.ts` — tamper-evidence.
- `server/services/soc2Evidence.ts` — live evidence bundle.
- `server/services/accessReview.ts` — quarterly access review.
- `migrations/000{0..7}*.sql` — schema with RLS + audit chain.
- `.github/workflows/security.yml` — CI enforcement.
- `.github/workflows/daily-security-health.yml` — continuous monitoring.

### 4.2 Live system probes (auditor must be granted access)
- `GET /api/founders/soc2/evidence` — JSON snapshot of authentication
  state, RLS policies, encryption settings, audit chain status.
- `GET /api/founders/soc2/access-review?days=90` — quarterly access
  review JSON.
- `GET /api/founders/audit-chain/verify` — live tamper check.

### 4.3 Documentation (this directory tree)
- `docs/security/glba/` — ISP, risk register, vendor register.
- `docs/security/soc2/` — control map, readiness matrix, this packet.
- `docs/security/policies/` — AUP, change-management,
  data-classification, data-retention, password-and-session,
  code-of-conduct, vendor-management, vulnerability-management.
- `docs/security/breach-response.md`, `backup-restore.md`,
  `cloudflare.md`, `branch-protection.md`, `secret-rotation.md`.

## 5. Personnel

| Role | Person | SOC 2 responsibility |
|------|--------|----------------------|
| Qualified Individual | Founder (Gaetano Carbonara) | Owns the program; signs ISP; primary auditor contact |
| Tech lead | Founders | Owns code controls + CI |
| Counsel | (TBD) | Notifications + DPAs |

## 6. Audit period (Type 1) and observation period (Type 2)

- **Type 1**: as-of date selected at engagement letter, typically the
  Monday after the readiness gaps in `readiness-matrix.md` are closed.
- **Type 2**: 6-month observation window starting the day after Type 1
  is signed. Evidence collection cadence in
  `evidence-collection.md`.

## 7. What the auditor needs from us at kickoff

- [ ] Read access to this repo (or a snapshot zip if external).
- [ ] A read-only Postgres role with `SELECT` on the public schema
      (auditor can verify RLS, audit chain, schema digest).
- [ ] A read-only Cloudflare role.
- [ ] A read-only AWS IAM role limited to KMS, Secrets Manager,
      CloudTrail (for evidence on encryption + secret access).
- [ ] Founder availability for control walkthroughs.
- [ ] Latest SOC 2 reports for Plaid, Neon, AWS, Cloudflare, Google
      Workspace, DocuSign — already filed under `Security/Vendors/`.
- [ ] HR records: signed AUP + Code of Conduct from each operator.
- [ ] Quarterly access review report (most recent).
- [ ] Quarterly fire-drill report (most recent).

## 8. What the auditor commits to

- A scoping call within 2 weeks of engagement letter signing.
- A draft control matrix walkthrough within 4 weeks.
- A signed Type 1 report within ~3 months of kickoff.
- Communication of any findings via tracked issues; no surprise
  qualifications.

## 9. Change log

| Date | Version | Notes |
|------|---------|-------|
| 2026-04-28 | 1.0 | Initial packet. |
