# Data Retention Policy

**Effective:** 2026-04-28
**Owner:** Qualified Individual.
**Review:** annually.

We keep data only as long as we need it for legitimate business or
legal reasons, then delete it.

## 1. Retention windows

| Data | Retention | Rationale |
|------|-----------|-----------|
| Active user account | While active + 12 months after deactivation | Reactivation grace + legal review |
| `users` row (deactivated) | Hard-delete 12 months after `is_active = false`, except where legally required | GLBA + state insurance recordkeeping |
| `client_profiles` (NPI) | Length of policy + 7 years after termination | Standard insurance recordkeeping |
| `policies` | Same as client_profiles | Same |
| `commission_records` | 7 years | IRS / state insurance audit |
| `founder_distributions` | 7 years | Tax + financial recordkeeping |
| `plaid_items` | While active; 90 days after disconnect (audit window), then hard-delete | Operational only |
| `plaid_pending_deposits` | 90 days after `reviewed_at` | Operational |
| `founder_audit_log` | 7 years | GLBA + SOC 2 evidence retention |
| `audit_logs` (generic) | 2 years | Operational debugging |
| `login_attempts` | 1 year | Brute-force forensics |
| `sessions` | TTL = 7 days (auto-purged by `connect-pg-simple`) | Cookie session expiry |
| `webauthn_credentials` | While the user is active; deletion follows user deletion | — |
| `two_factor_recovery_codes` | While the user is active; deleted on re-enrolment | Single-use codes |
| Encrypted backups in S3 | 7 years (Object Lock COMPLIANCE) | GLBA recordkeeping |
| Cloudflare access logs | 90 days hot, 7 years cold (S3 Glacier Deep Archive) | Forensics + compliance |
| Email archives (Workspace) | 7 years (legal hold off by default) | Legal + business |
| HR files (signed AUP, training records) | 7 years post-departure | Defense against claims |

## 2. Deletion process

For each table with a finite retention:
1. A nightly cron (`scripts/retention-sweep.mjs`, when implemented)
   queries rows past retention.
2. Each row is hard-deleted in a transaction that also writes a single
   `founder_audit_log` row of type `retention_swept` with the count
   (not the values).
3. Backups are NOT touched — the retention there is enforced by S3
   Object Lock + lifecycle.

## 3. Legal holds

If counsel notifies the Qualified Individual of pending litigation,
discovery, or regulatory inquiry that touches a category of data, the
retention sweep for that category PAUSES until the hold is lifted.

Procedure:
- Counsel emails `legal@goldcoastfnl.com` with the hold scope + estimated
  duration.
- Qualified Individual flips a `LEGAL_HOLDS` env / config entry that the
  retention cron reads.
- Retention resumes only after counsel confirms the hold is lifted in
  writing.

## 4. Right to deletion (consumer requests)

Per CPRA/CCPA, California residents may request deletion of their data.
Process:
1. Receive request at `privacy@goldcoastfnl.com`.
2. Verify identity (signed-in account, two factors of evidence).
3. Within 45 days: hard-delete the consumer's `users` row + linked
   records, except those subject to insurance recordkeeping laws.
4. Audit-log + send written confirmation.
5. The data persists in encrypted backups for the duration of the
   backup retention; that's an accepted exemption under CPRA.

## 5. Records

Annual audit by the Qualified Individual confirms:
- Retention sweep cron ran at expected cadence with no errors.
- Spot-check 5 random tables for rows past retention.
- Legal hold register reviewed.
