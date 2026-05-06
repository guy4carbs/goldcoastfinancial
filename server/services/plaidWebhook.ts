import crypto from "node:crypto";
import { jwtVerify, importJWK } from "jose";
import { getWebhookVerificationKey } from "./plaidClient";

/**
 * Verify a Plaid webhook signature. Plaid signs every webhook with ES256 and
 * places the JWT in the `Plaid-Verification` header. The JWT's payload
 * contains `request_body_sha256`; we compute SHA-256 of our raw body and
 * constant-time compare.
 *
 * Failure modes (each rejected with 401):
 *   - Missing/malformed Plaid-Verification header
 *   - alg ≠ ES256 (algorithm confusion)
 *   - kid not present
 *   - JWT signature invalid
 *   - iat older than 5 minutes (replay protection)
 *   - request_body_sha256 mismatch (body tampered)
 *
 * @param verificationHeader — `Plaid-Verification` header value
 * @param rawBody — exact bytes received (use express.raw, NOT express.json)
 */
export async function verifyPlaidWebhook(
  verificationHeader: string | undefined,
  rawBody: Buffer,
): Promise<{ ok: boolean; reason?: string }> {
  if (!verificationHeader || typeof verificationHeader !== "string") {
    return { ok: false, reason: "missing Plaid-Verification header" };
  }

  // Decode header to read kid + alg without verifying yet (so we can fetch the
  // right key). The JWT library re-validates alg during verify.
  let kid: string | null = null;
  let alg: string | null = null;
  try {
    const [headerB64] = verificationHeader.split(".");
    const headerJson = JSON.parse(
      Buffer.from(headerB64, "base64url").toString("utf8"),
    );
    kid = headerJson.kid;
    alg = headerJson.alg;
  } catch {
    return { ok: false, reason: "malformed JWT header" };
  }

  if (alg !== "ES256") return { ok: false, reason: "unexpected alg (must be ES256)" };
  if (!kid) return { ok: false, reason: "missing kid" };

  let jwk;
  try {
    jwk = await getWebhookVerificationKey(kid);
  } catch (e: any) {
    return { ok: false, reason: `verification key fetch failed: ${e.message}` };
  }

  let payload: any;
  try {
    const key = await importJWK(jwk, "ES256");
    const verified = await jwtVerify(verificationHeader, key, {
      algorithms: ["ES256"],
      maxTokenAge: "5m", // replay protection
    });
    payload = verified.payload;
  } catch (e: any) {
    return { ok: false, reason: `JWT verify failed: ${e.message}` };
  }

  const expected = payload.request_body_sha256;
  if (typeof expected !== "string") {
    return { ok: false, reason: "missing request_body_sha256 claim" };
  }
  const actual = crypto.createHash("sha256").update(rawBody).digest("hex");
  // Constant-time compare to defeat timing oracles.
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(actual, "hex");
  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return { ok: false, reason: "body sha256 mismatch" };
  }

  return { ok: true };
}
