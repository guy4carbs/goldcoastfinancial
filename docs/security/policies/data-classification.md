# Data Classification Policy

**Effective:** 2026-04-28
**Owner:** Qualified Individual.
**Review:** annually.

Data we hold falls into four classes. Each class has a defined handling
floor. Higher floors are always allowed.

## 1. Classes

| Class | Examples | Handling floor |
|-------|----------|----------------|
| **Restricted** | SSN, banking routing/account, driver license, beneficiary SSN, Plaid `access_token`, 2FA secrets, recovery codes, KMS plaintext DEKs, GPG private keys, session secrets, DB credentials | Encrypted at rest with AES-256-GCM (KMS envelope where supported), encrypted in transit TLS 1.2+, never logged, never sent to LLMs, never exported to personal devices, access requires high-trust role + 2FA, audit-logged on every read/write |
| **Confidential** | Client name + DOB + email + phone, policy details, commission structure, founder distribution amounts, chargeback records | Encrypted in transit, restricted by RBAC, audit-logged on writes, must not appear in URLs/headers/server-render HTML to non-owners |
| **Internal** | Aggregate KPIs, team rosters, internal comms, support tickets | Restricted to authenticated users; no public exposure |
| **Public** | Marketing pages, blog posts, press releases | No restrictions; review before publish |

## 2. Identification

Every database column holding Restricted data carries the suffix
`_encrypted` (or has a documented exception). Anyone reviewing a schema
PR can grep for new restricted columns without prior context.

The ISP (`information-security-program.md`) § 1 maintains the canonical
list of NPI categories we hold.

## 3. Handling rules per class

### Restricted
- Storage: AES-256-GCM at rest (column-level). KMS envelope encryption
  preferred (`KMS_KEY_ID` set in production).
- Access: high-trust role + active 2FA session + RLS-scoped client.
- Display: only the last 4 chars (or comparable mask) in lists; full
  value only on a deliberate "reveal" action that audit-logs the read.
- Export: never, except through the documented backup pipeline (which
  encrypts the dump before it leaves Neon).
- LLM/AI: forbidden as input. Strip server-side before any LLM call.

### Confidential
- Storage: plain (database disk encryption protects at rest).
- Access: authenticated + RBAC.
- Display: only to the assigned agent + downline + privileged roles;
  RLS policies enforce this where applicable.
- Export: agent CSV exports allowed, audit-logged.
- LLM/AI: only with redaction (names removed, IDs hashed).

### Internal
- Storage: same DB, no special protection.
- Access: any authenticated user role allowed by RBAC.
- Display: in-app only.
- Export: at user's discretion.

### Public
- No restrictions.

## 4. Disposal

- Restricted data: soft-delete + 30-day window, then hard-delete via
  scheduled cron (one-shot script when a row's `deleted_at < NOW() -
  '30 days'::interval`). Backups retain ciphertext for the legal window
  (7 years), then expire under the S3 Object Lock retention.
- Confidential data: same soft-delete + 30-day window, then hard-delete.
- Internal: at-will deletion.

## 5. Audit

Sample audit (conducted quarterly by Qualified Individual):
- Pick 5 columns named `*_encrypted`. Verify each row's prefix matches
  expected format (v1 or v2:).
- Pick 5 records claiming to be soft-deleted (`deleted_at IS NOT NULL`)
  older than 30 days. Verify they no longer exist (i.e. the cleanup cron
  ran).
- Spot-check 3 LLM/AI call sites in code for redaction (`grep -r
  "openai\|anthropic" client/ server/`).
