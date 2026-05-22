# Change Management Policy

**Effective:** 2026-04-28
**Owner:** Founders.
**Review:** annually.

Every change to production code, configuration, schema, or third-party
integration follows the process below. The goal: traceable, reviewed,
testable, reversible.

## 1. Scope

In scope:
- Application code in this repository.
- Database schema migrations (`migrations/`).
- Infrastructure config (Cloudflare WAF rules, AWS IAM, KMS key
  policies, Secrets Manager secrets, branch protection rules).
- Vendor scope changes (adding a Plaid product, granting a Google
  Workspace admin role, etc.).

Out of scope (covered by other policies):
- Routine ops actions (founder-initiated deposit confirms, etc.) —
  governed by application audit log.
- Vendor-initiated changes (Plaid API version bumps) — tracked in
  vendor register.

## 2. Change classes

### 2.1 Standard
Examples: feature work, bug fixes, refactors, dep bumps.

Process:
1. Branch from `main`.
2. Open a PR with description, test plan, security considerations.
3. ≥ 1 reviewer approval. Code Owners required when present.
4. CI green: typecheck, npm audit (high+critical block), gitleaks.
5. Squash-merge into `main`. Signed commits required.
6. Continuous deploy from `main` to production.

### 2.2 Schema migrations
Same as standard, plus:
- Migration file in `migrations/NNNN_<slug>.sql`.
- Applied via the documented one-shot script (or `npm run db:push` after
  manual review of the diff).
- Audit-logged via `founder_audit_log` (`schema_migration_applied`).
- Rollback plan documented in the PR.

### 2.3 Emergency change
Defined as: production is broken or a security incident is in progress.

Process:
1. Author opens PR with `[EMERGENCY]` label.
2. ≥ 1 founder approval (verbal in `#sec-ir` is acceptable; written
   approval in the PR within 4h).
3. CI may be bypassed only by a founder.
4. Within 24 hours: a follow-up PR adds tests, evidence, and a
   post-mortem entry.
5. Audit-log entry with `emergency_change=true` payload.

### 2.4 Vendor / infrastructure change
Examples: new Plaid product, Cloudflare rule, KMS key policy.

Process:
1. PR or written ticket capturing the proposal + risk + rollback.
2. Founder approval (any of the three).
3. Apply.
4. Audit-log via `founder_audit_log` (manual `infrastructure_change`
   action).

## 3. Required artifacts per change

- Linked PR (or ticket) describing what + why.
- Reviewer attestation in the PR.
- CI run history.
- Rollback plan (in-PR description).
- For schema: migration file in `migrations/`.
- For sensitive infrastructure: who approved, when, what was changed.

## 4. Branch protection (live config)

The `main` branch is protected per `docs/security/branch-protection.md`.
Operators who can bypass protection: none (including admins) until
SOC 2 Type 2 attestation is signed, after which a documented break-glass
account exists.

## 5. Records retention

Git history holds change records indefinitely. The Qualified Individual
exports a quarterly summary into `Security/Change-Management/` for SOC 2
evidence.
