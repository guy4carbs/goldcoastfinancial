# Vendor Register

**Owner:** Qualified Individual.
**Review cadence:** annually + on any service-relationship change.

Every external party with access (direct or contractual) to NPI is logged
here. Per § 314.4(f), each row's contractual safeguards must be documented
and the vendor's posture must be periodically reviewed.

| # | Vendor | Service | NPI / sensitive data shared | Safeguards | DPA | SOC 2 / ISO | Last review |
|---|--------|---------|----------------------------|------------|-----|-------------|-------------|
| 1 | **Plaid** | Bank account aggregation; Chase business account read | None of OUR clients' NPI; only the founders' own bank `access_token` | TLS 1.2+, JWT-signed webhooks, OAuth at bank, `access_token` revocable | Yes — standard Plaid DPA | SOC 2 Type 2 (annual) | 2026-04-28 |
| 2 | **Neon** | Postgres hosting | All NPI (encrypted at column level for SSN/banking; row-level for everything else) | TLS to DB; encrypted-at-rest disks; KMS-managed key by Neon | Yes — Neon DPA | SOC 2 Type 2 + ISO 27001 | 2026-04-28 |
| 3 | **AWS** | KMS, Secrets Manager, S3 (backups, future) | Wrapped DEKs, secret values, encrypted backups | IAM, mFA, scoped roles, customer-managed CMK | Yes — AWS DPA | SOC 2 + many | 2026-04-28 |
| 4 | **Cloudflare** | Edge proxy, WAF, DNS | Request metadata; no NPI in URLs/headers if app is built correctly | TLS termination + Full Strict to origin; SOC 2 Type 2 | Yes — Cloudflare DPA | SOC 2 Type 2 + ISO 27001 | 2026-04-28 |
| 5 | **Telnyx** | SMS / voice | Phone numbers (PII, not NPI); no SSN | TLS API, signed webhooks (not yet wired) | Yes — Telnyx DPA | SOC 2 Type 2 | 2026-04-28 |
| 6 | **Google Workspace** | Email, calendar, Drive | Email metadata; no NPI in email body if templates are followed | OAuth scopes; 2FA on Workspace admin | Yes — Google DPA | SOC 2 + ISO 27001 + many | 2026-04-28 |
| 7 | **DocuSign** | Agent contracting signatures | Agent name, address, NPN; no client NPI | OAuth; envelope encryption at DocuSign | Yes — DocuSign DPA | SOC 2 Type 2 + ISO 27001 | 2026-04-28 |
| 8 | **SureLC** | Carrier appointments / licensing | Agent NPI license info | API key auth; minimal scope | Standard agreement | Vendor SOC 2 status: **REVIEW** | 2026-04-28 |
| 9 | **OpenAI / Anthropic** (if used for AI features) | Model inference | **No NPI ever sent.** | Code-level guard: input redaction before any LLM call | Per provider DPA | SOC 2 Type 2 | 2026-04-28 |
| 10 | **Firebase Storage** | File storage for agent docs | Document images may contain SSN/banking | Per-bucket access rules, signed URLs short-lived | Google DPA | SOC 2 + ISO 27001 | 2026-04-28 |

---

## Review checklist (per vendor, per year)

- [ ] Pull the latest SOC 2 Type 2 (or equivalent) report and skim Section
      4 for any new exceptions affecting our data.
- [ ] Review their public security disclosure page for any breaches in the
      past 12 months. If a breach exposed our category of data, escalate to
      the Qualified Individual.
- [ ] Confirm the DPA / data-sharing agreement is still current and our
      contact + billing entity match.
- [ ] Confirm the API key / OAuth scopes haven't drifted to broader access.
- [ ] Update the "Last review" column with today's date.

## Onboarding a new vendor

Before sharing any NPI:

1. Add a row to this table.
2. Document the categories of NPI to be shared.
3. Sign a DPA. If the vendor refuses, run it past the Qualified Individual.
4. Confirm minimum-necessary scopes.
5. Pull or request their latest SOC 2 / ISO 27001 evidence.
6. Add an env-var entry to `secret-rotation.md` if they issue a long-lived
   credential.
