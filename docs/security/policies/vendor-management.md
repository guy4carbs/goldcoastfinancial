# Vendor Management Policy

**Effective:** 2026-04-28
**Owner:** Qualified Individual.
**Review:** annually.

This is the program that governs how we onboard, monitor, and offboard
third-party vendors who touch NPI, infrastructure, or business-critical
processes. Operationally, the canonical record is
`docs/security/glba/vendor-register.md`.

## 1. Tiering

Each vendor is classified at onboarding:

| Tier | Definition | Examples |
|------|------------|----------|
| **Critical** | Outage = company outage; or holds Restricted data | Plaid, Neon, AWS (KMS, Secrets Manager) |
| **High** | Holds Confidential data, or unique-per-vendor recovery | Cloudflare, Google Workspace, DocuSign, Telnyx |
| **Standard** | Holds Internal/Public only; replaceable | Vercel/Railway hosting, GitHub, Slack |
| **Casual** | One-off transactions, no ongoing data flow | (e.g. ad-hoc PDF tools) |

## 2. Onboarding

Before sharing any data:
1. Categorize the data shared per `data-classification.md`.
2. Sign a DPA. Restricted-tier vendors must also have a DPA addendum
   with breach-notification SLAs.
3. For Critical and High tiers: pull and review the vendor's most recent
   SOC 2 Type 2 (or ISO 27001) report. File under `Security/Vendors/<vendor>/`.
4. Use minimum-necessary scopes. Document the scopes in the vendor
   register row.
5. Add the row to `vendor-register.md` with onboarding date.

## 3. Continuous monitoring

- Subscribe to each Critical vendor's status page + breach disclosures.
- Track CVE feeds for vendor-published advisories.
- Annual SOC 2 Type 2 pull for every Critical and High tier vendor.
- Quarterly review of API-key scopes to catch drift.

## 4. Annual recertification

Each year, the Qualified Individual:
1. Re-pulls SOC 2 / ISO 27001 reports for Critical + High vendors.
2. Confirms DPA is current.
3. Confirms scopes / billing entity haven't drifted.
4. Updates the "Last review" column in the vendor register.
5. Files the recertification packet under `Security/Vendors/<vendor>/<year>/`.

If a vendor refuses to provide a SOC 2 report and an alternative
attestation isn't available, escalate to founders for a
risk-acceptance decision (or replace the vendor).

## 5. Offboarding

When ending a vendor relationship:
1. Rotate / revoke credentials immediately.
2. Request data deletion in writing; receive written confirmation.
3. Decommission any inbound webhooks, IP allowlists, OAuth scopes.
4. Mark the row in vendor register as "offboarded" with date.
5. Audit-log via `founder_audit_log` (`vendor_offboarded` action).

## 6. Vendor-initiated changes

When a vendor announces a security-relevant change (API version, OAuth
scope shift, account migration):
1. Triage within 1 business day.
2. Classify per change-management policy.
3. Apply through the same PR process.

## 7. Records

- Vendor register: indefinitely.
- DPAs / contracts: 7 years post-termination.
- SOC 2 reports: as long as the relationship + 1 year.
