import { generateSecret, generateURI, verifySync } from "otplib";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { encryptField, decryptField } from "./encryptionService";
import { pool } from "../db";

/**
 * TOTP service — RFC-6238 6-digit codes with a 30-second step. Built on
 * otplib v13 (functional API). Speaks the same dialect as Google
 * Authenticator, 1Password, Authy, etc.
 *
 * Storage contract:
 *   - `users.two_factor_secret` holds the AES-256-GCM-encrypted Base32 secret.
 *   - `users.two_factor_enabled` flips true after the user proves they can
 *     produce a valid code from the just-enrolled secret.
 *   - Recovery codes are stored bcrypt-hashed in `two_factor_recovery_codes`,
 *     one row per code, single-use via `used_at IS NULL`.
 */

const ISSUER = "Gold Coast Financial Partners";

export interface EnrolmentArtifact {
  /** The Base32 secret — show once during enrolment, never again. */
  secret: string;
  /** `otpauth://...` URL that authenticator apps consume. */
  otpauthUrl: string;
  /** PNG data URL of the otpauth URL, ready to drop into an <img src=...>. */
  qrDataUrl: string;
  /** 10 single-use recovery codes — show once during enrolment. */
  recoveryCodes: string[];
}

export async function startEnrolment(opts: {
  userEmail: string;
}): Promise<EnrolmentArtifact> {
  const secret = generateSecret();
  const otpauthUrl = generateURI({
    strategy: "totp",
    issuer: ISSUER,
    label: opts.userEmail,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { errorCorrectionLevel: "M" });
  const recoveryCodes = generateRecoveryCodes(10);
  return { secret, otpauthUrl, qrDataUrl, recoveryCodes };
}

/**
 * Verify a 6-digit TOTP code against a Base32 secret. Window of 1 step
 * (±30s) is the otplib default — tolerant of mild clock drift.
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  if (!secret || !code) return false;
  try {
    const result = verifySync({ token: String(code).trim(), secret, strategy: "totp" });
    return result.valid === true;
  } catch {
    return false;
  }
}

export function decryptStoredSecret(ciphertext: string): string {
  return decryptField(ciphertext);
}

export function encryptSecretForStorage(secret: string): string {
  return encryptField(secret);
}

// ─── Recovery codes ──────────────────────────────────────────────────────

function generateRecoveryCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  return codes;
}

export async function persistRecoveryCodes(userId: string, codes: string[]): Promise<void> {
  const hashes = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM two_factor_recovery_codes WHERE user_id = $1`, [userId]);
    for (const hash of hashes) {
      await client.query(
        `INSERT INTO two_factor_recovery_codes (user_id, code_hash) VALUES ($1, $2)`,
        [userId, hash],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function consumeRecoveryCode(userId: string, candidate: string): Promise<boolean> {
  const trimmed = candidate.trim().toUpperCase();
  const rows = await pool.query(
    `SELECT id, code_hash FROM two_factor_recovery_codes WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
  for (const row of rows.rows) {
    const ok = await bcrypt.compare(trimmed, row.code_hash);
    if (ok) {
      await pool.query(
        `UPDATE two_factor_recovery_codes SET used_at = NOW() WHERE id = $1`,
        [row.id],
      );
      return true;
    }
  }
  return false;
}
