# Incident Post-Mortem — YYYY-MM-DD-<slug>

**Severity:** SEV-1 / SEV-2 / SEV-3
**Incident Commander:**
**Status:** resolved / monitoring
**Reference runbook:** `docs/security/breach-response.md`

> Save as `Security/Incidents/YYYY-MM-DD-<slug>/postmortem.md` along with
> evidence captures (Slack export, audit-log dump, etc.).

---

## 1. Summary (one paragraph for the founders' group)

What happened, when, who was affected, and the current status. Plain
language; no jargon.

## 2. Timeline (UTC)

| Time | Event |
|------|-------|
| | First signal |
| | First operator notified |
| | Severity assigned |
| | Containment started |
| | Containment complete |
| | Eradication complete |
| | Recovery complete |
| | All-clear declared |
| | Notification(s) sent |

## 3. Detection

- How was the incident first observed?
- Was it detected by automation or by a human?
- Time-to-detect (signal → human awareness):

## 4. Impact

- Data classes touched (Restricted / Confidential / Internal):
- Number of records / users / sessions affected:
- Customer-facing impact (downtime, missed SLA, etc.):
- Financial exposure (if any):

## 5. Root cause (5-whys)

Walk back from the symptom to the underlying cause.

1.
2.
3.
4.
5.

## 6. Containment + eradication

- Actions taken (with timestamps + owner):
- Audit-log entries:
- Keys / sessions / tokens rotated:

## 7. What worked

(Things to keep doing.)

## 8. What didn't

(Things to fix.)

## 9. Action items

| # | Action | Severity | Owner | Due | Tracking issue |
|---|--------|----------|-------|-----|----------------|
| 1 | | | | | |

## 10. Notifications

| Audience | When | How | Sent by |
|----------|------|-----|---------|
| Founders | | | |
| Counsel | | | |
| Affected users | | | |
| Regulators (per state matrix) | | | |
| Vendors | | | |

## 11. Evidence captured

- Slack `#sec-ir` export: `Security/Incidents/<slug>/slack-export.zip`
- Audit log dump: `Security/Incidents/<slug>/audit-log.csv`
- DB snapshot: `Security/Incidents/<slug>/db-snapshot.dump.gpg`
- Cloudflare logs window: `Security/Incidents/<slug>/cf-logs.json`
- Other:

---

**Sign-off:**

| Name | Role | Signature | Date |
|------|------|-----------|------|
| | Incident Commander | | |
| | Qualified Individual | | |
