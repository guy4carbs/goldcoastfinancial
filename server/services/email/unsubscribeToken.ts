import crypto from "node:crypto";
import type { EmailCategory } from "@shared/models/email";

// =============================================================================
// Unsubscribe token — stateless HMAC-SHA256 sign/verify (no expiry, RFC 8058)
// =============================================================================
//
// Token format: `${payload}.${sig}` where
//   payload = base64url(JSON.stringify({ e: email, c: category, v: 1 }))
//   sig     = base64url(HMAC-SHA256(payload, UNSUBSCRIBE_SECRET))
//
// Fail-loud: in production, a missing UNSUBSCRIBE_SECRET throws at module load
// (mirrors how other required secrets are enforced at boundaries). In dev we
// fall back to a fixed dev-only string with a loud warning so local flows work.

const DEV_FALLBACK_SECRET = "dev-only-unsubscribe-secret-do-not-use-in-prod";

function resolveSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (secret && secret.length > 0) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "UNSUBSCRIBE_SECRET must be set in production — refusing to sign unsubscribe tokens with a known dev key.",
    );
  }

  console.warn(
    "[unsubscribeToken] UNSUBSCRIBE_SECRET not set — using insecure dev-only fallback. Set UNSUBSCRIBE_SECRET before production.",
  );
  return DEV_FALLBACK_SECRET;
}

// Resolved once at module load so production fails loudly on boot.
const UNSUBSCRIBE_SECRET = resolveSecret();

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hmac(payload: string): string {
  return b64url(crypto.createHmac("sha256", UNSUBSCRIBE_SECRET).update(payload).digest());
}

export function signUnsubscribeToken(email: string, category: EmailCategory): string {
  const payloadObj = { e: email.toLowerCase().trim(), c: category, v: 1 };
  const payload = b64url(Buffer.from(JSON.stringify(payloadObj), "utf8"));
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyUnsubscribeToken(
  token: string,
): { email: string; category: EmailCategory } | null {
  if (!token || typeof token !== "string") return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot >= token.length - 1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);

  // Constant-time comparison — guard against length mismatch (timingSafeEqual
  // throws if the buffers differ in length).
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    if (!json || typeof json.e !== "string" || typeof json.c !== "string") return null;
    return { email: json.e, category: json.c as EmailCategory };
  } catch {
    return null;
  }
}

export function buildListUnsubscribeHeaders(
  email: string,
  category: EmailCategory,
): Record<string, string> {
  const base = process.env.PUBLIC_BASE_URL || "https://goldcoastfinancial.co";
  const token = signUnsubscribeToken(email, category);
  const httpUrl = `${base}/api/unsubscribe?token=${encodeURIComponent(token)}`;
  return {
    "List-Unsubscribe": `<${httpUrl}>, <mailto:unsubscribe@goldcoastfnl.com?subject=Unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
