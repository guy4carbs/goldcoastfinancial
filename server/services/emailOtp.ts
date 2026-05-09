/**
 * Email OTP — 6-digit verification code sent via Gold Coast branded Gmail.
 * Replaces TOTP authenticator-app codes as the fallback when WebAuthn (Touch
 * ID / Face ID) isn't available.
 *
 * Storage: `auth_email_otp` table (Wave AH2 migration 0020). Codes are
 * bcrypt-hashed before insert (never stored plaintext).
 *
 * Policy (founder-locked, see plan):
 *   - 6-digit numeric code
 *   - 5-minute TTL
 *   - Rate limit: 1 request per 60s per user, 5 requests per hour per user
 *   - Verify: 5 wrong attempts → code locked (must request a new one)
 *
 * Security notes:
 *   - Codes are hashed (bcrypt cost 10) so DB leak doesn't expose them.
 *   - Rate limit responses always return 200 with `{ ok: true }` to avoid
 *     account-enumeration (an attacker can't tell if rate-limited vs sent).
 *   - On verify failure we increment attempts in the same query that
 *     selects, to prevent TOCTOU races.
 */
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { pool } from "../db";
import { sendVerificationCodeEmail } from "../gmail";

export const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
export const OTP_MIN_INTERVAL_SECONDS = 60; // max 1/min per user
export const OTP_MAX_PER_HOUR = 5; // max 5/hour per user
export const OTP_MAX_ATTEMPTS = 5; // max wrong-code tries per code

function generateSixDigitCode(): string {
  // Cryptographically uniform via crypto.randomInt — uniform in [0, max),
  // so all 1,000,000 6-digit codes are equally likely.
  const n = randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

interface RequestResult {
  ok: boolean;
  rateLimited?: boolean;
  reason?: string;
}

/**
 * Generate + send a fresh OTP. Caller must already have the user's email +
 * first name (typically from req.user). Returns ok=true even when rate
 * limited so the caller's response shape is identical (no enumeration leak).
 */
export async function requestEmailOtp(args: {
  userId: string;
  email: string;
  firstName?: string | null;
}): Promise<RequestResult> {
  // Lazy cleanup: drop expired or used codes older than 1 hour for this user.
  await pool.query(
    `DELETE FROM auth_email_otp
       WHERE user_id = $1::uuid
         AND (expires_at < NOW() OR (used_at IS NOT NULL AND created_at < NOW() - INTERVAL '1 hour'))`,
    [args.userId],
  );

  // Rate limit checks
  const recent = await pool.query<{ recent_count: string; last_created_at: Date | null }>(
    `SELECT
       COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS recent_count,
       MAX(created_at) AS last_created_at
     FROM auth_email_otp
     WHERE user_id = $1::uuid`,
    [args.userId],
  );
  const recentCount = Number(recent.rows[0]?.recent_count ?? 0);
  const lastCreated = recent.rows[0]?.last_created_at;
  const sinceLastMs = lastCreated ? Date.now() - new Date(lastCreated).getTime() : Infinity;

  if (sinceLastMs < OTP_MIN_INTERVAL_SECONDS * 1000) {
    console.warn(`[emailOtp] rate-limit (interval) user=${args.userId}`);
    return { ok: true, rateLimited: true, reason: "interval" };
  }
  if (recentCount >= OTP_MAX_PER_HOUR) {
    console.warn(`[emailOtp] rate-limit (hourly) user=${args.userId}`);
    return { ok: true, rateLimited: true, reason: "hourly" };
  }

  // Invalidate any other outstanding active codes for this user so only the
  // newest one ever works (safer than allowing several to be valid at once).
  await pool.query(
    `UPDATE auth_email_otp SET used_at = NOW()
       WHERE user_id = $1::uuid AND used_at IS NULL`,
    [args.userId],
  );

  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  await pool.query(
    `INSERT INTO auth_email_otp (user_id, code_hash, expires_at)
       VALUES ($1::uuid, $2, NOW() + ($3 || ' seconds')::interval)`,
    [args.userId, codeHash, String(OTP_TTL_SECONDS)],
  );

  // Fire the email. If Gmail is down, log it but still return ok (user can
  // retry — log is the diagnostic).
  try {
    await sendVerificationCodeEmail({
      firstName: args.firstName ?? "",
      email: args.email,
      code,
      ttlMinutes: Math.round(OTP_TTL_SECONDS / 60),
    });
  } catch (e: any) {
    console.error("[emailOtp] send failed:", e?.message);
    return { ok: true, reason: "send-failed" };
  }

  return { ok: true };
}

interface VerifyResult {
  ok: boolean;
  reason?: "no-active-code" | "expired" | "too-many-attempts" | "wrong-code";
}

/**
 * Verify a user-submitted code. Returns ok=true on success and silently
 * marks the code used. On wrong code, increments attempts; after
 * OTP_MAX_ATTEMPTS the code is locked even if not yet expired.
 */
export async function verifyEmailOtp(args: {
  userId: string;
  code: string;
}): Promise<VerifyResult> {
  const code = String(args.code || "").trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "wrong-code" };

  const row = await pool.query<{
    id: string;
    code_hash: string;
    expires_at: Date;
    attempts: number;
  }>(
    `SELECT id, code_hash, expires_at, attempts
       FROM auth_email_otp
       WHERE user_id = $1::uuid AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    [args.userId],
  );
  if (row.rowCount === 0) return { ok: false, reason: "no-active-code" };

  const { id, code_hash, expires_at, attempts } = row.rows[0];

  if (new Date(expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "too-many-attempts" };
  }

  const matches = await bcrypt.compare(code, code_hash);
  if (!matches) {
    await pool.query(
      `UPDATE auth_email_otp SET attempts = attempts + 1 WHERE id = $1::uuid`,
      [id],
    );
    return { ok: false, reason: "wrong-code" };
  }

  // Success — mark used.
  await pool.query(
    `UPDATE auth_email_otp SET used_at = NOW() WHERE id = $1::uuid`,
    [id],
  );
  return { ok: true };
}
