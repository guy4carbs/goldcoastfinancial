# SOC 2 Control Map

**Trust Services Criteria covered:** Security (CC), Availability (A),
Confidentiality (C), Processing Integrity (PI). Privacy (P) excluded for
the initial Type 1 — re-evaluate before Type 2.

This map ties every implemented control back to the AICPA TSC reference
points and lists the file/path where the implementation lives. Auditors
reading this can trace every claim to running code or a versioned doc.

---

## CC1 — Control Environment

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC1.1 | Demonstrates commitment to integrity and ethical values | Code of conduct in `docs/security/glba/information-security-program.md` § 7. |
| CC1.2 | Board / management oversight | Founders' group meets quarterly; Qualified Individual reports annually (ISP § 2). |
| CC1.3 | Establishes structures, reporting lines, and authorities | RBAC + permissions matrix (`server/types/permissions.ts`). |
| CC1.4 | Demonstrates commitment to competence | Onboarding + annual training (ISP § 7). |
| CC1.5 | Enforces accountability | Append-only audit log + annual access review. |

## CC2 — Communication & Information

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC2.1 | Internal information requirements | This `docs/security/` directory; updated per change. |
| CC2.2 | Internal communication | Founders Slack channel; `breach-response.md` notification matrix. |
| CC2.3 | External communication | Public security contact: `security@goldcoastfnl.com`. |

## CC3 — Risk Assessment

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC3.1–3.4 | Identifies, assesses, prioritizes risks | `docs/security/glba/risk-assessment.md` (annual + on change). |

## CC4 — Monitoring Activities

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC4.1 | Ongoing evaluation | Cloudflare logs + app audit log + CI security workflow daily. |
| CC4.2 | Communicates deficiencies | Quarterly review with founders' group; near-misses logged in IR follow-ups. |

## CC5 — Control Activities

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC5.1 | Selects and develops control activities | This document. |
| CC5.2 | Selects and develops technology controls | RBAC + 2FA + RLS + KMS + WAF + tamper-evident audit chain. |
| CC5.3 | Deploys policies and procedures | All runbooks under `docs/security/`. |

## CC6 — Logical & Physical Access

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC6.1 | Identifies and authenticates users | Email+password (bcrypt cost 10) + 2FA TOTP + WebAuthn passkeys. |
| CC6.2 | Restricts logical access | `requireAuth` + `requireRole` + path-level allowlists. |
| CC6.3 | Manages identification and authentication | Account lockout after 10 failed attempts (`login_attempts` table). |
| CC6.4 | Restricts access to information assets | RBAC permissions matrix + Postgres RLS (Phase 2.3) + view-as write block. |
| CC6.5 | Protects data on disposal | Soft-delete + 30-day window; legal retention windows in vendor DPAs. |
| CC6.6 | Implements transmission protection | TLS 1.2+; HSTS preload; helmet headers; CSP. |
| CC6.7 | Restricts physical access | Workstations require disk encryption + screen-lock per onboarding. |
| CC6.8 | Detects unauthorized changes | Append-only audit log + Phase 3.3 hash chain. |

## CC7 — System Operations

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC7.1 | Detects and monitors changes | Dependabot weekly + npm audit blocking CI + gitleaks daily. |
| CC7.2 | Responds to security events | `breach-response.md`. |
| CC7.3 | Recovery procedures | `backup-restore.md`; quarterly fire-drill. |
| CC7.4 | Tests recovery | Quarterly fire-drill checklist. |
| CC7.5 | Manages incidents | `breach-response.md` + IR tabletops. |

## CC8 — Change Management

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC8.1 | Manages changes through documented procedures | Branch protection: 1 review, signed commits, required CI checks (`docs/security/branch-protection.md`). |

## CC9 — Risk Mitigation

| Ref | Control | Implementation |
|-----|---------|----------------|
| CC9.1 | Identifies, selects, and develops mitigation activities | Risk register with mitigation references. |
| CC9.2 | Assesses and manages business partners | Vendor register annual review. |

---

## Availability (A1)

| Ref | Control | Implementation |
|-----|---------|----------------|
| A1.1 | Capacity planning | Neon autoscale; Cloudflare buffer. |
| A1.2 | Backups | Neon-managed automatic backups + quarterly off-host snapshot (`backup-restore.md`). |
| A1.3 | Recovery testing | Quarterly fire-drill. |

## Confidentiality (C1)

| Ref | Control | Implementation |
|-----|---------|----------------|
| C1.1 | Identifies confidential information | NPI inventory in ISP § 1. |
| C1.2 | Encrypts confidential data | AES-256-GCM at rest (column level) + KMS envelope encryption (Phase 2.2) + TLS 1.2+ in transit. |

## Processing Integrity (PI1)

| Ref | Control | Implementation |
|-----|---------|----------------|
| PI1.1 | Defines processing requirements | Zod schemas at every boundary. |
| PI1.2 | Detects errors in inputs | Zod + 400 responses with explicit error codes. |
| PI1.3 | Outputs match specifications | Type-checked end-to-end; CI blocks builds with type errors. |
| PI1.4 | Stores data accurately | Append-only audit log + tamper-evident chain. |
| PI1.5 | Reports and corrects errors | Sentry / Vercel logs (when added) → quarterly post-mortem review. |

---

## Open items before SOC 2 Type 1 attestation

- [ ] Stand up centralized log shipping (Cloudflare Logs → Datadog / S3).
- [ ] Quarterly access-review evidence (export to a stamped PDF; retain 7y).
- [ ] Annual penetration test (engage external firm; rotation through
      AppSec specialty firms preferred).
- [ ] Tabletop exercise minutes + lessons-learned tracker.
- [ ] Workstation MDM enrollment (Kandji / Jamf) — ties to CC6.7.
- [ ] Hire / contract a Type 1 audit firm. Drata / Vanta auto-evidence
      collection recommended; engage 4–6 weeks before audit start.
