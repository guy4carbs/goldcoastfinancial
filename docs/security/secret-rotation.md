# Secret Rotation Runbook

**Cadence:** quarterly (every 90 days). Calendar reminder owned by the
qualified individual under the GLBA Safeguards Rule (Founder).

## Inventory

| Key | Purpose | Storage | Blast radius if leaked |
|-----|---------|---------|------------------------|
| `SESSION_SECRET` | Signs Express session cookies | Secrets Manager | Forge any user's session |
| `FIELD_ENCRYPTION_KEY` | Legacy v1 AES key for field encryption | Secrets Manager | Decrypt all v1-encrypted SSN/banking |
| `KMS_KEY_ID` | KMS Customer-Managed Key | AWS KMS (the value is a key id, not a secret) | Same as above for v2 records |
| `CSRF_SECRET` | HMAC for double-submit CSRF tokens | Secrets Manager | Forge CSRF tokens for any session |
| `PLAID_CLIENT_ID` | Plaid API client id | Secrets Manager | Some impersonation; low without secret |
| `PLAID_SECRET` | Plaid API secret | Secrets Manager | Full Plaid API access (charge against account) |
| `DATABASE_URL` | Neon connection string | Secrets Manager | Full DB read/write |
| `WEBAUTHN_RP_ID` | Stable RP ID; rotation INVALIDATES every passkey | env (don't rotate) | Forces full passkey re-enrolment |
| `TELNYX_API_KEY` | SMS/voice | Secrets Manager | SMS abuse |

## Rotation procedure (per key)

The pattern below is the same for any of the symmetric keys
(`SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, `CSRF_SECRET`):

1. Generate a new random 32-byte hex string locally:
   ```sh
   openssl rand -hex 32
   ```
2. Open the AWS Secrets Manager console → the project's secret →
   **Retrieve secret value** → **Edit**.
3. Add the new value under a new key (e.g. `FIELD_ENCRYPTION_KEY_NEW`).
   **Don't replace the old value yet.**
4. Roll out a code change that reads BOTH the old and new key, writing
   with the new key but accepting the old key on read. (For
   `FIELD_ENCRYPTION_KEY` specifically, the v1→v2 envelope migration
   already provides this — when KMS_KEY_ID is set, new writes go to v2
   and old reads still work via the legacy env-key path.)
5. Wait one full session-TTL window (7 days) so existing sessions /
   tokens fully drain.
6. Retire the old key value: rename `_NEW` to the canonical name in
   Secrets Manager, restart the prod servers.

### Plaid keys

Plaid lets you rotate `PLAID_SECRET` from their dashboard:

1. Plaid Dashboard → **Team Settings** → **Keys** → click **Rotate** next
   to the production secret.
2. Plaid emits the new secret once — copy it into Secrets Manager
   immediately (`PLAID_SECRET`).
3. Restart prod. Old secret keeps working for 24h, then expires.

### Database password

1. Neon dashboard → **Roles** → **Reset password**.
2. Update `DATABASE_URL` in Secrets Manager.
3. Restart prod. Connection pool will reconnect with the new password.
4. Drop the old role's connections via `pg_terminate_backend(...)` if
   long-running queries are blocking the rotation.

### KMS Customer-Managed Key

KMS keys can be rotated automatically by AWS (yearly). For manual rotation:

1. KMS console → key → **Rotate key** → enable yearly rotation. Past
   ciphertext keeps working because KMS tracks all key versions internally.
2. No app code change needed — the `KMS_KEY_ID` (alias) stays the same.

## Compromise procedure

When a key is suspected leaked:

1. **Isolate**: invalidate immediately (don't wait for the 7-day drain).
   - `SESSION_SECRET`: drop all rows from `sessions` table → forces every
     user to log in again.
   - `PLAID_SECRET`: rotate from Plaid dashboard, then call
     `POST /item/access_token/invalidate` for each `plaid_items` row to
     rotate per-item access_tokens.
   - `FIELD_ENCRYPTION_KEY`: this is bad. Re-encrypt every record with a
     new key. Plan for 1–2 hours of read-only mode while the migration
     runs. Recommend cutting over to KMS_KEY_ID at the same time.
2. **Audit**: query `founder_audit_log` for the time window covering the
   leak. Look for unexpected `plaid_*` actions, unfamiliar IPs in
   `login_attempts`, role changes.
3. **Notify**: per state notification laws (most are 30–60 days; California
   is 72 hours). Run point: founder.

## Verification

- After every quarterly rotation: open the live app and confirm login,
  Plaid status pill, and a sensitive-field decrypt (e.g. open a client
  detail with stored SSN/banking — last-4 should still display).
- Run `node scripts/verify-secrets.mjs` if it exists, otherwise hit
  `/api/health` and confirm 200.
