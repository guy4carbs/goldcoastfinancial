# Breach Response Runbook

**Owner:** Qualified Individual (Founder).
**Last reviewed:** 2026-04-28.
**Next tabletop:** quarterly.

This is the runbook for a confirmed or suspected security incident
involving NPI. The first goal is to STOP the bleed; second goal is to
PRESERVE evidence; third is to NOTIFY per applicable laws.

If you're not sure whether something is an incident, treat it as one
until proven otherwise.

---

## 0. The first 5 minutes

When an alert fires (or you spot something off):

1. **Don't fix anything yet.** Take a screenshot or copy the alert.
2. **Open the IR channel** (`#sec-ir` in Slack). Tag the Qualified
   Individual (`@gaetano`).
3. **Note the time** — wall-clock, UTC. This goes in the timeline.
4. **State the symptom**, not the conclusion. "/api/auth/login is
   returning 500s at 3× normal rate" is good. "We're being hacked" is
   premature.
5. **Pick an Incident Commander.** Default: the founder who notices.
   They drive the rest of the runbook.

## 1. Detection signals

Monitor at minimum:

| Signal | Source | Threshold |
|--------|--------|-----------|
| 401/403 spike on `/api/auth/login` | Cloudflare WAF logs | 3× hourly baseline |
| `account_locked` rows in `login_attempts` | DB query | >10 in 1 hour |
| Sudden burst of `/api/founders/plaid/items DELETE` | App audit log | >2 in 10 minutes |
| KMS access denied | AWS CloudTrail | Any |
| New `system_admin` role grant | App audit log | Any |
| Audit-chain verifier divergence | Cron job + manual run | Any |
| Failed webhook signature verifications | App audit log (`plaid_webhook_rejected`) | >5 in 10 minutes |
| Cloudflare bot challenge spike | Cloudflare Analytics | >5× hourly baseline |
| Outbound API errors (Plaid/Telnyx) | App logs | Any "401 unauthorized" |

## 2. Classify

Within 30 minutes, classify using this matrix:

| Severity | Definition | Examples |
|----------|------------|----------|
| **SEV-1** | Confirmed compromise of NPI; data exfiltrated or in transit | Plaid `access_token` posted publicly; SSN dump leaked; sustained unauthorized DB read |
| **SEV-2** | High likelihood of compromise; not yet confirmed | Successful auth from anomalous geography; KMS Decrypt from unknown principal |
| **SEV-3** | Successful intrusion attempt blocked; or weakness found before exploit | WAF blocked credential-stuffing; pen-test finding; suspicious 0-day in dependency |
| **SEV-4** | Anomaly worth a record but probably benign | One-off failed login from a known traveler |

SEV-1 and SEV-2 trigger the full notification pipeline. SEV-3 gets a
post-mortem. SEV-4 gets a line in the audit log.

## 3. Contain (within 1 hour)

### Step-by-step (run all that apply)

#### 3a. Lock the actor

If a specific user account looks compromised:
```sql
UPDATE users SET is_active = false WHERE id = '<uuid>';
DELETE FROM sessions WHERE sess::text LIKE '%"userId":"<uuid>"%';
```
Audit-log: `incident_account_locked`.

#### 3b. Rotate session secret (forces every user to log in again)

1. Generate a new `SESSION_SECRET` and store in Secrets Manager.
2. Delete all rows from `sessions`.
3. Restart prod.

#### 3c. Rotate Plaid `access_token`s

For every linked item (or just the affected one):

```ts
// invalidates the stored token, returns a new one
import { plaidClient } from "./services/plaidClient";
const c = plaidClient();
const fresh = await c.itemAccessTokenInvalidate({ access_token: <decrypted> });
// re-encrypt + UPDATE plaid_items SET access_token_encrypted = ...
```

Audit-log: `plaid_access_token_rotated`.

#### 3d. Rotate KMS DEKs (in extreme cases)

KMS keys themselves can't be rotated in-flight if data is encrypted under
them. To force a re-encryption:

1. Provision a NEW CMK alongside the old.
2. Update `KMS_KEY_ID` in Secrets Manager to the new alias.
3. Run a one-shot script that reads every `*_encrypted` column on
   sensitive tables, calls `decryptFieldUnified` then `encryptFieldAsync`,
   writes the new ciphertext back.
4. Schedule the OLD CMK for deletion only AFTER the migration completes
   and a verifier confirms zero remaining ciphertext under it.

#### 3e. Block the source

If the attack came from a known IP / range, add a Cloudflare WAF rule:

- Action: Block
- Expression: `(ip.src in {<list>})`

#### 3f. Snapshot evidence

Before doing anything else destructive:
```sh
pg_dump --format=custom $DATABASE_URL > /tmp/incident-$(date +%s).dump
```
Encrypt + upload to the dedicated forensics S3 bucket (separate from
backups). Object Lock COMPLIANCE retention 7 years.

Save the audit log dump:
```sql
COPY (SELECT * FROM founder_audit_log WHERE created_at > NOW() - INTERVAL '7 days')
  TO STDOUT WITH (FORMAT csv, HEADER);
```

## 4. Investigate

### Questions the IC should be able to answer

- What time did the bad actor first get in?
- What time did we detect them?
- What did they read, modify, or take?
- How did they get in (vector)?
- Are they still in?

### Tools

- `founder_audit_log` (the primary data source).
- Cloudflare access logs.
- AWS CloudTrail (KMS, Secrets Manager events).
- Neon's connection log + slow-query log.
- `login_attempts`.
- Sentry / app logs (when wired in).

### Audit-chain integrity check

Run the verifier (`/api/founders/audit-chain/verify`). If the chain
diverges, a database-level tamper happened — escalate to SEV-1 even if
the original symptom looked smaller. The off-host hash anchor (when
implemented) is the trustworthy comparison point.

## 5. Notify

### Internal — immediate

- Founders' group: ≤ 1 hour from detection.
- Counsel: ≤ 4 hours for SEV-1/SEV-2.

### Regulators

| Jurisdiction | Trigger | Window |
|--------------|---------|--------|
| FTC (Safeguards Rule § 314.5) | Notification event affecting NPI of ≥500 consumers | 30 days |
| New York DFS (23 NYCRR 500) | Cybersecurity event materially likely to harm | 72 hours |
| California (CCPA / Civ. Code 1798.82) | Unencrypted PI exposure | "Most expedient time possible" — practical: 72 hours |
| Texas (Bus. & Com. Code 521.053) | Breach affecting ≥250 Texas residents | 60 days |
| Most other states | Varies | 30–60 days |
| GDPR (if any EU subjects) | High risk to rights/freedoms | 72 hours to supervisory authority |

The Qualified Individual is responsible for triggering the right
notifications. Counsel reviews every public statement before it goes out.

### Affected individuals

For SEV-1 with confirmed NPI exposure, send a written notice to each
affected individual within the state-mandated window. Template lives in
`docs/security/templates/breach-notice.md` (to be drafted on first need).

### Vendors

If a vendor was the cause, notify the vendor's security team and request
an RCA. If a vendor was a victim alongside us, coordinate the
notification timeline.

## 6. Eradicate

After containment, find and close the root cause:

- Patch the vulnerability (code change, config change, vendor request).
- Update detection rules so the same signal triggers a faster response
  next time.
- File issues for any deferred hardening that came up.

## 7. Recover

- Restore service to normal. If service was up the whole time, this is
  brief. If we cut over to backups, run the restore checklist in
  `backup-restore.md`.
- Confirm KPIs are back to baseline (login rate, error rate, latency).
- Communicate to staff that the IR is over.

## 8. Post-mortem

Within 7 days of resolution, the IC produces a post-mortem covering:

1. Timeline (UTC).
2. Detection delay (time-to-detect).
3. Containment delay (time-to-contain).
4. Root cause (5-whys).
5. Affected data + individuals + jurisdictions notified.
6. What worked.
7. What didn't.
8. Action items with owner + due date.

The post-mortem is filed in `Security/Incidents/YYYY-MM-DD-<slug>/` and
reviewed at the next quarterly tabletop.

## 9. Tabletop exercises

Run quarterly. Pick one of:

- **Plaid token leak** — assume a Plaid `access_token` shows up in a
  public Pastebin. Walk through detection, rotation, notification.
- **DB read scrape** — assume a SQL injection (or app bug) leaked
  10,000 rows of `client_profiles` to an attacker. Walk through
  containment + state-by-state notifications.
- **Insider** — assume a former founder or admin account leaked a
  backup. Walk through key rotation + access revocation.
- **Vendor breach** — assume Plaid or Neon discloses a breach. Walk
  through assessing impact and our notification obligations.

Document the exercise in `Security/Tabletops/`. Each exercise produces
at least one action item.

---

## Appendix — quick contact list

| Role | Contact | Escalation |
|------|---------|------------|
| Qualified Individual | Gaetano Carbonara | First responder |
| CTO / Tech lead | Founders | Containment |
| Counsel | (TBD) | Notifications |
| External IR firm | (TBD; recommend retainer with Mandiant or CrowdStrike Services) | SEV-1 escalation |
| Cyber insurance broker | (TBD) | SEV-1 — claim filed within 24h |
