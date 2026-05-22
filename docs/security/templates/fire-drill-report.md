# Backup Fire-Drill — YYYY-Qx

**Date:**
**Operator (rotates each quarter):**
**Witness (Qualified Individual):**
**Reference runbook:** `docs/security/backup-restore.md`

> Save as `Security/Fire-drills/YYYY-Qx-restore.md`. RTO target: ≤ 60 min.

---

## 1. Source

| Field | Value |
|-------|-------|
| Backup pulled from | s3://gc-backups-prod/db/<YYYYMM>/<filename> |
| Object Lock retain-until | |
| Object size | |
| GPG recipient | backup@goldcoastfnl.com |

## 2. Decryption

- Time start:
- Time end:
- GPG private key source: (Shamir share count combined / safety-deposit
  box / etc.)
- Notes:

## 3. Restore

- Target: fresh Neon branch named `firedrill-<YYYY-MM-DD>`.
- `pg_restore` start:
- `pg_restore` end:
- Total restored size:
- Errors / warnings:

## 4. Smoke checks

| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| `SELECT count(*) FROM users;` matches prod ±1% | | | |
| `SELECT count(*) FROM founder_distributions;` matches prod ±1% | | | |
| Decrypt one `plaid_items.access_token_encrypted` row via `decryptFieldUnified` | succeeds | | |
| Run `verifyAuditChain()` against the restored copy | `ok: true` | | |
| Confirm RLS policies travel: `SELECT tablename, policyname FROM pg_policies` matches prod | | | |

## 5. Timing summary

| Phase | Minutes |
|-------|---------|
| Pull from S3 | |
| Decrypt | |
| pg_restore | |
| Smoke checks | |
| **Total time-to-restore** | |

RTO target (≤ 60 min) met? **YES / NO**

## 6. Surprises + fixes

(Anything that didn't match the runbook. File issues + link them here.)

- Issue 1:
  - Fix: (PR link)
- Issue 2:

## 7. Cleanup

- [ ] Test branch dropped.
- [ ] Local copies of dump shredded.
- [ ] GPG private key returned to safe / shares re-distributed.
- [ ] Audit-log row recorded.

---

**Sign-off:**

| Name | Role | Signature | Date |
|------|------|-----------|------|
| | Operator | | |
| | Witness (QI) | | |
