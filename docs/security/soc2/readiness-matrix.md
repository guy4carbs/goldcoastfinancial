# SOC 2 Type 1 Readiness Matrix

**Last assessed:** 2026-04-28
**Next review:** weekly during prep, then on every PR that touches a control.

This is the operator-facing snapshot of where each AICPA Trust Services
Criteria control stands TODAY versus what's required for Type 1
attestation.

> **How to close any ◑ Partial / ○ Gap row:** see
> [`closing-playbook.md`](./closing-playbook.md) — concrete steps,
> commands, and acceptance criteria per row, ordered by recommended wave.

Status legend:
- **✓ Implemented** — control runs in production, evidence available.
- **◑ Partial** — implemented but missing evidence rigor or scope.
- **○ Gap** — not yet started.
- **— N/A** — not applicable to current scope.

Effort sizing for closing a Gap/Partial:
- **S** ≤ 1 day
- **M** 1–5 days
- **L** > 1 week

---

## CC1 — Control Environment

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC1.1 Integrity & ethical values | ✓ | ISP § 7 + onboarding | Founder | — | — |
| CC1.2 Board oversight | ◑ | ISP § 2 — Qualified Individual designated | Founder | Quarterly founders meeting minutes not yet captured. **S** | First Mon of next quarter |
| CC1.3 Reporting structure | ✓ | `server/types/permissions.ts` | Founder | — | — |
| CC1.4 Competence | ◑ | ISP § 7 | Founder | Onboarding security briefing slide deck doesn't exist. **M** | 2026-05-15 |
| CC1.5 Accountability | ✓ | Audit log + RBAC | Founder | — | — |

## CC2 — Communication & Information

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC2.1 Internal info needs | ✓ | `docs/security/` tree | Founder | — | — |
| CC2.2 Internal communication | ◑ | Slack channel | Founder | `#sec-ir` channel doesn't exist yet (mentioned in IR runbook). **S** | 2026-05-05 |
| CC2.3 External communication | ◑ | `security@goldcoastfnl.com` mailbox | Founder | Mailbox not provisioned + no public security.txt. **S** | 2026-05-10 |

## CC3 — Risk Assessment

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC3.1–3.4 | ✓ | `risk-assessment.md` | Founder | — | — |

## CC4 — Monitoring

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC4.1 Ongoing evaluation | ◑ | App audit log + CI workflow | Founder | Cloudflare logs not yet shipped to retention. **L** | Q3 |
| CC4.2 Communicate deficiencies | ○ | — | Founder | Quarterly review meeting cadence not set. **S** | 2026-05-12 |

## CC5 — Control Activities

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC5.1 Selects controls | ✓ | `control-map.md` | Founder | — | — |
| CC5.2 Technology controls | ✓ | RBAC + 2FA + RLS + KMS + WAF + audit chain | Founder | — | — |
| CC5.3 Policies & procedures | ◑ | `docs/security/` partial | Founder | Need: AUP, change mgmt, data classification, data retention, vendor mgmt, vuln mgmt as standalone policies. **M** (covered by Task #68) | 2026-05-20 |

## CC6 — Logical & Physical Access

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC6.1 Auth | ✓ | bcrypt, TOTP, WebAuthn | Founder | — | — |
| CC6.2 Logical access | ✓ | requireAuth + requireRole | Founder | — | — |
| CC6.3 Login throttling | ✓ | `login_attempts` + express-rate-limit | Founder | — | — |
| CC6.4 Asset access restriction | ✓ | RBAC + RLS | Founder | — | — |
| CC6.5 Disposal | ◑ | Soft-delete | Founder | Hard-delete after retention not yet automated. **M** | Q3 |
| CC6.6 Transmission protection | ✓ | TLS + HSTS + helmet | Founder | — | — |
| CC6.7 Physical access | ○ | — | Founder | Workstation MDM not provisioned. **L** | Q3 (Kandji evaluation) |
| CC6.8 Detect unauthorized changes | ✓ | Append-only audit + hash chain | Founder | — | — |

## CC7 — System Operations

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC7.1 Detect changes | ✓ | Dependabot + npm audit + gitleaks | Founder | — | — |
| CC7.2 Respond to events | ✓ | `breach-response.md` | Founder | — | — |
| CC7.3 Recovery procedures | ✓ | `backup-restore.md` | Founder | — | — |
| CC7.4 Test recovery | ◑ | Quarterly fire-drill defined | Founder | Drill not yet conducted. **M** | 2026-05-30 |
| CC7.5 Incident management | ✓ | IR runbook | Founder | — | — |

## CC8 — Change Management

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC8.1 Documented procedures | ◑ | `branch-protection.md` runbook | Founder | Branch protection rule not yet ENABLED on the live `main` branch. **S** | 2026-05-05 |

## CC9 — Risk Mitigation

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| CC9.1 Mitigation | ✓ | risk register + control map | Founder | — | — |
| CC9.2 Vendor mgmt | ◑ | `vendor-register.md` | Founder | Annual SOC 2 pull not yet performed for any vendor. **M** | 2026-05-31 |

## A1 — Availability

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| A1.1 Capacity planning | ✓ | Neon autoscale + CF | Founder | — | — |
| A1.2 Backups | ◑ | Neon-managed; runbook drafted | Founder | Off-host weekly snapshot pipeline not yet wired. **L** | Q3 |
| A1.3 Recovery testing | ◑ | Drill defined | Founder | Drill not yet conducted (see CC7.4). **M** | 2026-05-30 |

## C1 — Confidentiality

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| C1.1 Identifies confidential data | ✓ | ISP § 1 | Founder | — | — |
| C1.2 Encrypts | ◑ | AES-256-GCM v1 active; v2 (Cloud KMS envelope) wired but deferred | Founder | Provisioning blocked on Workspace org policy (`iam.disableServiceAccountKeyCreation`, `iam.allowedPolicyMemberDomains`). v1 env-key path still meets GLBA 16 CFR § 314.4(c)(3). **M** | Q3 (pre-audit) |

## PI1 — Processing Integrity

| Ref | Status | Evidence | Owner | Gap | ETA |
|-----|--------|----------|-------|-----|-----|
| PI1.1–1.5 | ✓ | Zod + tsc + audit chain | Founder | — | — |

---

## Summary

| Status | Count |
|--------|-------|
| ✓ Implemented | 24 |
| ◑ Partial | 13 |
| ○ Gap | 3 |
| **Total controls** | **40** |

## Next 30 days — top 10 to close

1. ✅ Stand up `#sec-ir` Slack channel + `security@goldcoastfnl.com` mailbox + `/.well-known/security.txt`. **S**
2. ✅ Enable GitHub branch protection on `main` per `branch-protection.md`. **S**
3. ✅ Schedule quarterly meetings: founders' security review + ops fire-drill + tabletop. Capture minutes. **S**
4. ⏸ **DEFERRED — blocked on GCP org policy.** Provision the Cloud KMS key + impersonate-SA path; revisit with Workspace admin before SOC 2 Type 1 kickoff. v1 env-key encryption is the active fallback and meets GLBA. **M**
5. Run the first quarterly fire-drill following `backup-restore.md`; file the report. **M**
6. Pull SOC 2 reports for Plaid, Neon, AWS, Cloudflare, Google Workspace, DocuSign — file under `Security/Vendors/`. **M**
7. Draft + sign the missing policy pack (Task #68). **M**
8. Stand up Cloudflare per `cloudflare.md` runbook (zone live, WAF rules, SSL/TLS hardened). **L**
9. Wire daily continuous-monitoring health digest (Task #67). **M**
10. Engage Drata or Vanta for evidence automation; engage a Type 1 audit firm with target kickoff Q3. **L**
