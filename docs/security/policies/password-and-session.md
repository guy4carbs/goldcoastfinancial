# Password & Session Policy

**Effective:** 2026-04-28
**Owner:** Qualified Individual.
**Review:** annually.

## 1. Password requirements

- Minimum length: 12 characters.
- At minimum, three of: lowercase letter, uppercase letter, digit, symbol.
- Stored as bcrypt cost 10 hash. (Argon2id migration scheduled — see
  Risk R-01.)
- Compromised-password screening: passwords are checked against a
  rotated bloom filter of the haveibeenpwned top-1M (when integrated;
  Phase 4 backlog).
- No periodic forced rotation. NIST 800-63B explicitly recommends AGAINST
  forced rotation; rotate only on suspected compromise.
- New passwords cannot match the previous 4 (history table; not yet
  enforced — backlog).

## 2. MFA

- TOTP and WebAuthn passkeys both supported. Passkeys are preferred.
- Mandatory for FOUNDER, OWNER, SYSTEM_ADMIN. Other roles opt in.
- Recovery codes issued at TOTP enrolment (10 codes, single-use, bcrypt
  hashed).
- WebAuthn sign counter monitored; cloned-authenticator detection
  rejects logins where counter regresses.

## 3. Session

- Server-side sessions backed by Postgres (connect-pg-simple).
- Cookie attributes: `httpOnly`, `secure` (prod), `sameSite=lax` (dev) /
  `sameSite=none` (prod for cross-origin embedding).
- TTL: 7 days. Idle timeout enforced by sliding renewal on any
  authenticated request.
- 2FA verification flag (`twoFactorVerified`) stored on the session;
  rotates each new session.

## 4. Account lockout

- 5 failed login attempts in 15 minutes from the same IP+email → 429
  rate-limited (in-process, express-rate-limit).
- 10 failed attempts in 30 minutes for the same email → DB-side lockout
  for 30 minutes. Account auto-unlocks after the window.
- Lockouts are visible in the access review report.

## 5. Compromise response

If a credential is suspected compromised:
1. Rotate the affected user's password.
2. Invalidate all the user's sessions:
   ```sql
   DELETE FROM sessions WHERE sess::text LIKE '%"userId":"<uuid>"%';
   ```
3. Revoke the user's recovery codes:
   ```sql
   DELETE FROM two_factor_recovery_codes WHERE user_id = '<uuid>';
   ```
4. Audit-log the event.
5. Notify the user via email at the on-file address (out-of-band channel).

## 6. Service accounts / API keys

- No service account uses an interactive password.
- API keys (Plaid, Telnyx, etc.) live in Secrets Manager, never `.env`
  in production.
- Each key has a documented owner (vendor register).
- Rotation cadence: 90 days, per the secret-rotation runbook.

## 7. Audit

Quarterly access review (`/api/founders/soc2/access-review`) flags:
- High-trust roles without 2FA enabled.
- Idle accounts (60 days no login).
- Inactive accounts with active sessions.

The Qualified Individual reviews the report and remediates within 7
days.
