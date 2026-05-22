# Security Records — Filing Rules

> **GITIGNORED.** This entire tree is in `.gitignore`. Signed PDFs,
> exported logs, and access-review minutes never get committed publicly.
> Long-term home: 1Password "GCF — Security Records" vault + the encrypted
> S3 backup bucket once provisioned.

## What goes where

| Folder | What lives here | Naming | Retention |
|--------|-----------------|--------|-----------|
| `Policies/` | Signed PDFs of policies 01–09 + the ISP. One per policy. | `ISP-v1.0-signed-YYYY-MM-DD.pdf`, `AUP-v1.0-signed-YYYY-MM-DD.pdf`, etc. | Forever (current + 3 prior versions) |
| `Acknowledgements/` | Per-operator signed acknowledgement PDFs. Re-signed annually. | `<firstname>-acknowledgement-YYYY-MM-DD.pdf` | 7 years after operator offboard |
| `Vendors/<vendor>/` | SOC 2 reports, DPAs, MSAs pulled from each vendor in `vendor-register.md`. | `<vendor>/YYYY-soc2-type2.pdf`, `<vendor>/MSA-YYYY-MM-DD.pdf` | Lifetime of vendor relationship + 3 yr |
| `Cloudflare/` | Exported WAF rule lists, Logpush configs, page rules screenshots. | `cf-waf-rules-YYYY-MM-DD.json` | Current + 1 prior |
| `Communication/` | Screenshots of `#sec-ir`, the `security@goldcoastfnl.com` group config, security.txt resolving. | Date-prefixed PNGs | Forever |
| `Change-Management/` | Branch-protection screenshot, deploy approval evidence. | `branch-protection-YYYY-MM-DD.png` | Forever |
| `Backups/` | GPG public key, key-shares document, fire-drill reports. **Never the private key.** | `key-shares.md`, `gpg-public-key.asc` | Forever |
| `Fire-drills/` | Quarterly restore reports filled in from the template. | `YYYY-Qx-restore.md` | Forever |
| `Tabletops/` | Quarterly tabletop exercise minutes. | `YYYY-Qx-tabletop.md` | Forever |
| `Incidents/` | Incident postmortems filled in from the template. | `YYYY-MM-DD-<short-name>.md` | Forever |
| `Access-Reviews/` | Quarterly access-review exports + reviewer sign-off. | `YYYY-Qx-access-review.{json,md}` | 7 yr |
| `Evidence-Bundles/` | Snapshots of `/api/founders/soc2/evidence` pulled before audit windows. | `YYYY-MM-DD-evidence.json` | 7 yr |

## Annual cadence (per operator)

1. **On hire** — operator signs a fresh acknowledgement; QI counter-signs.
2. **Annually** (anniversary or company-wide drive) — all operators
   re-sign the latest acknowledgement against the current policy
   versions.
3. **On material policy revision** — re-sign the affected policies plus
   a fresh acknowledgement. A "material revision" is anything that
   changes operator obligations (data classes, AUP rules, IR steps).
4. **On offboard** — record the offboard date in the acknowledgement
   filename so the 7-year clock is unambiguous.

## Quarterly cadence (whoever is on rotation)

- **Q1/Q2/Q3/Q4** — file fire-drill report, tabletop minutes, access
  review, founders security review minutes. Use the templates under
  `docs/security/templates/`.
- **Once per quarter** — export the latest evidence bundle from
  `/api/founders/soc2/evidence` into `Evidence-Bundles/`.

## Where the master copies live

- **Primary** — 1Password "GCF — Security Records" vault.
- **Working copy** — this folder.
- **Disaster-recovery copy** — once `gc-backups-prod` S3 bucket is up,
  a weekly `aws s3 sync` of this folder lands there encrypted.

## Vendor SOC 2 pull schedule

Pull each vendor's current SOC 2 Type 2 once per calendar year. Set
calendar reminders 90 days before each vendor's report-period end so
you can grab the new one as soon as it's published:

- Plaid → Compliance Dashboard.
- Neon → account portal request.
- AWS → AWS Artifact.
- Cloudflare → support portal.
- Google Workspace → Admin → Compliance.
- DocuSign → Trust Center.
- SureLC → account manager.

## When in doubt

If you're unsure where a record belongs, default to `Incidents/` (if it
documents something that went wrong) or `Evidence-Bundles/` (if it
documents something that's working). Better to over-file than to lose it.
