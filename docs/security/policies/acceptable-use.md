# Acceptable Use Policy (AUP)

**Effective:** 2026-04-28
**Owner:** Qualified Individual.
**Review:** annually.

This policy governs how every employee, contractor, founder, and third
party with credentials to Gold Coast Financial Partners systems uses
those systems and the data they hold.

## 1. Scope

Applies to:
- The web application at `app.heritagels.org` and any successor host.
- The Postgres database hosted at Neon.
- AWS, Cloudflare, Google Workspace, Plaid, Telnyx, DocuSign, SureLC.
- Any workstation, mobile device, or VM used to access the above.

## 2. Acceptable use

You may:
- Access only the data and systems you need to do your assigned job.
- Use strong, unique passwords stored in a password manager.
- Enroll a passkey or TOTP device when prompted (mandatory for
  founder / owner / system_admin roles within 7 days of role assignment).
- Use company-issued or attested personal devices that have:
  - Disk encryption enabled (FileVault, BitLocker, dm-crypt).
  - Auto-screen-lock at ≤ 10 minutes idle.
  - OS up to date with auto-updates enabled.

## 3. Prohibited use

You may NOT:
- Share login credentials, sessions, or recovery codes with anyone.
  Includes spouses, family, contractors, or other employees.
- Disable security controls (2FA, screen lock, antivirus, MDM, audit
  logging) on any system you access.
- Export NPI to a personal device, personal cloud account, or
  unencrypted external drive.
- Send NPI in plaintext over email, Slack, SMS, or any messaging tool.
- Use AI / LLM tools (ChatGPT, Claude, Copilot, etc.) with prompts
  containing NPI. Models may train on input or log it.
- Bypass the production deployment process (PR + review + CI green +
  merge to main).
- Connect to production systems from public Wi-Fi without a VPN.
- Use jailbroken or rooted devices.

## 4. Monitoring

All access to production systems is logged. The append-only
`founder_audit_log` records every state change and impersonation in the
Founders Lounge. Cloudflare logs every HTTP request.

By accessing the systems you consent to this monitoring. Use the
systems for legitimate work purposes; expect no privacy on company
systems.

## 5. Reporting

If you suspect:
- Your credentials are compromised
- You sent NPI to the wrong recipient
- A system is behaving unexpectedly
- Anyone (including you) violated this policy

… report immediately to `security@goldcoastfnl.com` and the Qualified
Individual. We do not punish good-faith self-reports of mistakes; we
investigate and improve.

## 6. Enforcement

Violations may result in:
- Immediate revocation of access.
- Termination of employment / engagement.
- Civil or criminal referral if intentional and harmful.

The Qualified Individual is the final decision-maker.

## 7. Acknowledgement

Every person with credentials signs this policy at onboarding and on
any material revision. Signatures kept in `Security/AUP-signatures/`.
