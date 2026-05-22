# Risk Assessment

**Last assessed:** 2026-04-28
**Next review:** 2027-04-28 (annually) or on any material change.
**Owner:** Qualified Individual (Founder).

This is the working risk register. Each row captures one identified risk to
NPI confidentiality, integrity, or availability.

Scoring (qualitative, NIST 800-30 style):
- **Likelihood:** very low / low / moderate / high / very high
- **Impact:** very low / low / moderate / high / very high
- **Residual risk:** ll × ii (after current controls)

Order is by residual risk descending.

---

## R-01 — Compromise of a founder/admin account

| Field | Value |
|-------|-------|
| Threat | External attacker, social engineering, phishing |
| Vulnerability | Account holds full data access |
| Likelihood (raw) | High |
| Impact | Very High |
| Existing controls | TOTP for FOUNDER/OWNER/SYSTEM_ADMIN; WebAuthn passkeys preferred; account lockout at 10 fails / 30min; CSRF; HSTS; helmet headers; log scrubber. |
| Residual likelihood | Low |
| Residual impact | Very High |
| Residual risk | **Moderate** |
| Action | Track adoption: every high-trust user enrolled in passkeys by 2026-06-30. Record-keep enrolment dates. |

## R-02 — Plaid `access_token` exfiltration

| Field | Value |
|-------|-------|
| Threat | DB read leak; credential leak from logs; insider |
| Vulnerability | Token grants ongoing read of the founder's Chase account |
| Likelihood | Low |
| Impact | High |
| Existing controls | AES-256-GCM at rest (KMS envelope when KMS_KEY_ID set); never returned via API; never logged (scrubber); audit-chain on every read in `decryptFieldUnified` paths. |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | Once KMS provisioned, re-encrypt all existing rows (Phase 2.2 is lazy; force-rotate via a one-shot script). |

## R-03 — Field-level NPI exfiltration (SSN / banking)

| Field | Value |
|-------|-------|
| Threat | Database breach, backup leak, insider with read access |
| Vulnerability | NPI columns store ciphertext but key is shared across rows in v1 |
| Likelihood | Low |
| Impact | Very High |
| Existing controls | AES-256-GCM at rest; column-level (only sensitive fields encrypted, last-4 stored unencrypted for UX); KMS envelope encryption variant ready (per-record DEK). |
| Residual likelihood | Very Low |
| Residual impact | Very High |
| Residual risk | **Moderate** |
| Action | Migrate all `*_encrypted` columns to KMS envelope path within Q3. Add a periodic test that reads + re-encrypts a sampling of rows so the migration is forced. |

## R-04 — Vendor breach (Plaid, Neon, Telnyx, AWS, Cloudflare, Google)

| Field | Value |
|-------|-------|
| Threat | Vendor security incident exposes our data or impersonates us |
| Vulnerability | NPI shared with multiple SaaS providers |
| Likelihood | Low (each vendor is a hardened SOC 2 / ISO 27001 shop) |
| Impact | Variable — Plaid + Neon are highest |
| Existing controls | Vendor register; DPA where required; SOC 2 review on each vendor; IP allowlist where supported; minimal scopes. |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | Add the vendor SOC 2 report-pull date to the vendor register; review annually. |

## R-05 — CSRF / forged state change

| Field | Value |
|-------|-------|
| Threat | Malicious site triggers a write from a victim's authenticated tab |
| Vulnerability | Cookie-based session auth |
| Likelihood | Moderate (broad attack surface on the open internet) |
| Impact | High |
| Existing controls | Double-submit CSRF token via `csrf-csrf`, bound to session id, on every POST/PATCH/DELETE. Webhook routes exempted but vendor-signature-verified. |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | None — re-test on every browser-API change (e.g. when SameSite defaults shift). |

## R-06 — SQL injection / app-layer logic flaw

| Field | Value |
|-------|-------|
| Threat | Crafted input causes the app to misbehave (return wrong rows, drop a table, etc.) |
| Vulnerability | Hand-rolled SQL in many places |
| Likelihood | Low |
| Impact | Very High |
| Existing controls | All pg queries parameterized; Drizzle ORM at most call sites; Zod validation at every external boundary; Postgres RLS as a backstop on the highest-risk tables. |
| Residual likelihood | Very Low |
| Residual impact | Very High |
| Residual risk | **Moderate** |
| Action | Annual penetration test; any SQL string-interpolation flagged in code review must include a clear comment justifying it. |

## R-07 — Insider misuse (legitimate access used for illegitimate purpose)

| Field | Value |
|-------|-------|
| Threat | Founder, admin, or agent uses access in violation of policy |
| Vulnerability | Trusted personnel have wide read access |
| Likelihood | Very Low (3-person founding team) |
| Impact | High |
| Existing controls | Append-only audit log; tamper-evident hash chain (Phase 3.3); view-as session blocks writes; mandatory 2FA. |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | Annual review of access scopes; audit-log spot-check quarterly. |

## R-08 — Backup exposure

| Field | Value |
|-------|-------|
| Threat | A backup of the database is leaked or accessed by unauthorized party |
| Vulnerability | Backups contain plaintext (column-level ciphertext only protects the encrypted columns) |
| Likelihood | Very Low |
| Impact | High |
| Existing controls | Neon-managed encrypted backups; export procedure encrypts before leaving Neon (Phase 3.4 runbook). |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | Quarterly fire-drill restore (verify ciphertext decrypts; verify RLS policies travel). |

## R-09 — Audit-log tampering

| Field | Value |
|-------|-------|
| Threat | Attacker with DB access deletes or rewrites audit rows |
| Vulnerability | Audit table is in the same DB as the data |
| Likelihood | Very Low |
| Impact | High |
| Existing controls | Append-only triggers (Phase 1); tamper-evident hash chain (Phase 3.3); periodic off-host hash anchor (Phase 3.3 future). |
| Residual likelihood | Very Low |
| Residual impact | High |
| Residual risk | **Low** |
| Action | Set up the off-host weekly hash anchor (S3 Object Lock) by 2026-09-30. |

## R-10 — Availability disruption (denial of service)

| Field | Value |
|-------|-------|
| Threat | DDoS, resource exhaustion |
| Vulnerability | Single-origin web app |
| Likelihood | Moderate |
| Impact | Moderate (can't process applications, but no NPI compromise) |
| Existing controls | Cloudflare WAF + bot mitigation; in-app rate limits; Neon scales independently. |
| Residual likelihood | Low |
| Residual impact | Low |
| Residual risk | **Low** |
| Action | None — re-evaluate when traffic crosses 1k req/min sustained. |

---

## Acceptance criteria

- Risks ≤ Low residual: accepted, monitor.
- Risks Moderate residual: action item with owner + due date.
- Risks High residual or above: must be tracked weekly until reduced.

The Qualified Individual is the final decision-maker on risk acceptance.
