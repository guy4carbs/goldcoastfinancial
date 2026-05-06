import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyAuthenticationResponseOpts,
} from "@simplewebauthn/server";
import { pool } from "../db";

/**
 * WebAuthn / passkey service.
 *
 * Phishing-resistant 2FA — even if a user is tricked into typing on a
 * lookalike domain, the platform authenticator refuses to release the
 * credential because the origin doesn't match. This is the GLBA / NIST
 * AAL2 recommendation in 2026 and a strict upgrade over TOTP.
 *
 * Design:
 *   - One Postgres row per registered credential (`webauthn_credentials`).
 *   - `public_key` and `credential_id` stored base64url-encoded as text.
 *   - `counter` is the rolling sign count; if the authenticator ever returns
 *     a counter ≤ the stored value, we reject — that signals a cloned key.
 *   - The current challenge for a registration/auth ceremony lives in the
 *     session (`webauthnChallenge`), so it survives the round-trip without
 *     a DB write per ceremony.
 *
 * Coexistence with TOTP: a user with EITHER a verified TOTP session OR a
 * verified WebAuthn session passes the `requireAuth` 2FA gate. See
 * `server/middleware/auth.ts`.
 */

function getRpName(): string {
  return "Gold Coast Financial Partners";
}

function getRpID(req?: { hostname?: string; headers?: Record<string, any> }): string {
  // Prefer an explicit RP ID from env so prod + staging agree on the value.
  const explicit = process.env.WEBAUTHN_RP_ID;
  if (explicit) return explicit;
  // Otherwise infer from the request host. Stripped of port.
  const hostHeader = (req?.headers?.host as string | undefined) || req?.hostname;
  const host = (hostHeader || "localhost").split(":")[0];
  return host;
}

function getOrigin(req?: { protocol?: string; headers?: Record<string, any> }): string {
  const explicit = process.env.WEBAUTHN_ORIGIN;
  if (explicit) return explicit;
  const proto =
    (req?.headers?.["x-forwarded-proto"] as string | undefined) || req?.protocol || "http";
  const host = (req?.headers?.host as string | undefined) || "localhost:3000";
  return `${proto}://${host}`;
}

// ─── Registration ────────────────────────────────────────────────────────

export async function buildRegistrationOptions(opts: {
  userId: string;
  userEmail: string;
  userName: string;
  req: any;
}) {
  const existing = await pool.query(
    `SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1`,
    [opts.userId],
  );
  const excludeCredentials = existing.rows.map((r: any) => ({
    id: r.credential_id, // base64url string
    transports: r.transports
      ? (String(r.transports).split(",") as ("usb" | "nfc" | "ble" | "internal" | "hybrid")[])
      : undefined,
  }));

  const generateOpts: GenerateRegistrationOptionsOpts = {
    rpName: getRpName(),
    rpID: getRpID(opts.req),
    userID: new TextEncoder().encode(opts.userId),
    userName: opts.userEmail,
    userDisplayName: opts.userName || opts.userEmail,
    timeout: 60_000,
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: {
      // Prefer platform authenticators (Touch ID, Windows Hello, Android) but
      // allow cross-platform (USB security keys) too.
      residentKey: "preferred",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256 — the broadly-supported pair
  };
  const options = await generateRegistrationOptions(generateOpts);
  return options;
}

export async function consumeRegistration(opts: {
  userId: string;
  expectedChallenge: string;
  body: any;
  req: any;
  nickname?: string;
}) {
  const verifyOpts: VerifyRegistrationResponseOpts = {
    response: opts.body,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: getOrigin(opts.req),
    expectedRPID: getRpID(opts.req),
    requireUserVerification: false,
  };
  const verification = await verifyRegistrationResponse(verifyOpts);
  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false as const, reason: "registration verification failed" };
  }
  const info = verification.registrationInfo;
  const credential = info.credential;
  const credentialIdB64 = credential.id; // already base64url
  const publicKeyB64 = Buffer.from(credential.publicKey).toString("base64url");
  const transports = (opts.body?.response?.transports as string[] | undefined)?.join(",") || null;
  const deviceType = info.credentialDeviceType;
  const backedUp = info.credentialBackedUp;

  await pool.query(
    `INSERT INTO webauthn_credentials
       (user_id, credential_id, public_key, counter, transports, device_type, backed_up, nickname, last_used_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (credential_id) DO NOTHING`,
    [
      opts.userId,
      credentialIdB64,
      publicKeyB64,
      Number(credential.counter || 0),
      transports,
      deviceType,
      backedUp,
      opts.nickname?.slice(0, 120) || null,
    ],
  );
  return { ok: true as const };
}

// ─── Authentication ──────────────────────────────────────────────────────

export async function buildAuthenticationOptions(opts: { userId: string; req: any }) {
  const existing = await pool.query(
    `SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1`,
    [opts.userId],
  );
  if (existing.rowCount === 0) return null;
  const allowCredentials = existing.rows.map((r: any) => ({
    id: r.credential_id,
    transports: r.transports
      ? (String(r.transports).split(",") as ("usb" | "nfc" | "ble" | "internal" | "hybrid")[])
      : undefined,
  }));
  const generateOpts: GenerateAuthenticationOptionsOpts = {
    rpID: getRpID(opts.req),
    timeout: 60_000,
    userVerification: "preferred",
    allowCredentials,
  };
  return generateAuthenticationOptions(generateOpts);
}

export async function consumeAuthentication(opts: {
  userId: string;
  expectedChallenge: string;
  body: any;
  req: any;
}) {
  const credentialId = opts.body?.id as string | undefined;
  if (!credentialId) return { ok: false as const, reason: "missing credential id" };

  const lookup = await pool.query(
    `SELECT id, credential_id, public_key, counter, transports
     FROM webauthn_credentials WHERE user_id = $1 AND credential_id = $2`,
    [opts.userId, credentialId],
  );
  if (lookup.rowCount === 0) return { ok: false as const, reason: "credential not found" };
  const row = lookup.rows[0];

  const verifyOpts: VerifyAuthenticationResponseOpts = {
    response: opts.body,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: getOrigin(opts.req),
    expectedRPID: getRpID(opts.req),
    credential: {
      id: row.credential_id,
      publicKey: new Uint8Array(Buffer.from(row.public_key, "base64url")),
      counter: Number(row.counter || 0),
      transports: row.transports
        ? (String(row.transports).split(",") as ("usb" | "nfc" | "ble" | "internal" | "hybrid")[])
        : undefined,
    },
    requireUserVerification: false,
  };
  const verification = await verifyAuthenticationResponse(verifyOpts);
  if (!verification.verified) return { ok: false as const, reason: "verification failed" };

  // Update sign counter — if the authenticator ever returns a counter ≤ the
  // stored value, that signals a clone. We bump only on success.
  await pool.query(
    `UPDATE webauthn_credentials SET counter = $1, last_used_at = NOW() WHERE id = $2`,
    [Number(verification.authenticationInfo.newCounter || 0), row.id],
  );
  return { ok: true as const };
}

// ─── Listings ────────────────────────────────────────────────────────────

export async function listCredentials(userId: string) {
  const result = await pool.query(
    `SELECT id, credential_id, transports, device_type, backed_up, nickname, last_used_at, created_at
     FROM webauthn_credentials WHERE user_id = $1 ORDER BY created_at ASC`,
    [userId],
  );
  return result.rows.map((r: any) => ({
    id: r.id,
    credentialId: r.credential_id,
    transports: r.transports,
    deviceType: r.device_type,
    backedUp: r.backed_up,
    nickname: r.nickname,
    lastUsedAt: r.last_used_at,
    createdAt: r.created_at,
  }));
}

export async function deleteCredential(userId: string, id: string) {
  const res = await pool.query(
    `DELETE FROM webauthn_credentials WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return (res.rowCount || 0) > 0;
}
