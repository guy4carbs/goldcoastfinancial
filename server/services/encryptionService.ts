import crypto from "crypto";
import { KeyManagementServiceClient } from "@google-cloud/kms";

/**
 * Field-level encryption (Google Cloud KMS edition).
 *
 * Two formats coexist for a lazy rollout:
 *
 *   v1 (legacy)  — `<iv-hex>:<cipher-hex>:<tag-hex>`
 *     Symmetric AES-256-GCM with a single project-wide key from
 *     `FIELD_ENCRYPTION_KEY`. Sync (no I/O). All existing rows are v1.
 *
 *   v2 (envelope) — `v2:<wrapped-dek-b64url>:<iv-hex>:<cipher-hex>:<tag-hex>`
 *     Per-record Data Encryption Key (DEK). Generated locally with
 *     `crypto.randomBytes(32)`, then **wrapped by Google Cloud KMS** before
 *     storage. Decrypt path calls Cloud KMS to unwrap the DEK, then decrypts
 *     locally. Async because KMS is over the network.
 *
 * Selection:
 *   - If `GCP_KMS_KEY_NAME` is set → new writes use v2 via `encryptFieldAsync`.
 *   - Otherwise → new writes use v1 via `encryptField`.
 *   - Reads detect the format and dispatch to the right path.
 *   - `decryptFieldUnified(ciphertext)` is the safe one to call from any
 *     codepath that might encounter either format.
 *
 * Authentication (in order of precedence):
 *   - `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var — inline service-account
 *     JSON (best for Vercel/Railway/Render).
 *   - `GOOGLE_APPLICATION_CREDENTIALS` env var — file path to a service-account
 *     JSON (standard local dev path).
 *   - Ambient credentials — works automatically on Cloud Run, App Engine,
 *     Firebase Hosting, Cloud Functions, Compute Engine, etc.
 *
 * Key resource name format:
 *   projects/{PROJECT}/locations/{LOC}/keyRings/{RING}/cryptoKeys/{KEY}
 */

const ALGORITHM = "aes-256-gcm";
const KEY_HEX = process.env.FIELD_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const v1Key = Buffer.from(KEY_HEX.slice(0, 64), "hex");

// Single env var, full GCP resource path. Backward-compat shim — if someone
// migrates from the AWS world they may still have `KMS_KEY_ID`; we support
// both names but prefer the GCP-specific one.
const GCP_KMS_KEY_NAME =
  process.env.GCP_KMS_KEY_NAME || process.env.KMS_KEY_NAME || null;

// Lazy KMS client — only constructed when GCP_KMS_KEY_NAME is set.
let _kms: KeyManagementServiceClient | null = null;
function kms(): KeyManagementServiceClient {
  if (_kms) return _kms;

  // Honor inline credentials JSON if provided.
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJson) {
    try {
      const parsed = JSON.parse(credsJson);
      _kms = new KeyManagementServiceClient({ credentials: parsed });
      return _kms;
    } catch (e: any) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON: ${e?.message}`);
    }
  }
  // Otherwise rely on ADC: GOOGLE_APPLICATION_CREDENTIALS file path or ambient.
  _kms = new KeyManagementServiceClient();
  return _kms;
}

export function isKmsEnabled(): boolean {
  return Boolean(GCP_KMS_KEY_NAME);
}

// ─── v1 — sync, env-key ──────────────────────────────────────────────────

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, v1Key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

export function decryptField(ciphertext: string): string {
  if (ciphertext.startsWith("v2:")) {
    throw new Error(
      "Ciphertext is in v2 (envelope) format — call decryptFieldAsync or decryptFieldUnified instead.",
    );
  }
  const [ivHex, encHex, tagHex] = ciphertext.split(":");
  if (!ivHex || !encHex || !tagHex) throw new Error("Invalid encrypted format");
  const decipher = crypto.createDecipheriv(ALGORITHM, v1Key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return (
    decipher.update(Buffer.from(encHex, "hex"), undefined, "utf8") + decipher.final("utf8")
  );
}

// ─── v2 — async, Cloud KMS envelope ──────────────────────────────────────

export async function encryptFieldAsync(plaintext: string): Promise<string> {
  if (!isKmsEnabled()) {
    // No KMS configured — fall back to v1 so callers can use the async API
    // unconditionally without forcing dev/staging to provision KMS.
    return encryptField(plaintext);
  }
  // Generate a fresh 256-bit DEK locally.
  const dek = crypto.randomBytes(32);
  // Ask Cloud KMS to wrap (encrypt) the DEK so we can persist it safely.
  const [wrap] = await kms().encrypt({
    name: GCP_KMS_KEY_NAME!,
    plaintext: dek,
  });
  if (!wrap?.ciphertext) throw new Error("Cloud KMS encrypt returned no ciphertext");
  const wrappedDek = Buffer.from(wrap.ciphertext as Uint8Array);

  // Encrypt the field with the plaintext DEK, then zero it out.
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  dek.fill(0);

  const wrappedB64 = wrappedDek.toString("base64url");
  return `v2:${wrappedB64}:${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

export async function decryptFieldAsync(ciphertext: string): Promise<string> {
  if (!ciphertext.startsWith("v2:")) {
    return decryptField(ciphertext);
  }
  const parts = ciphertext.split(":");
  // ["v2", wrappedDek, iv, cipher, tag]
  if (parts.length !== 5) throw new Error("Invalid v2 envelope format");
  const [, wrappedB64, ivHex, encHex, tagHex] = parts;
  if (!isKmsEnabled()) {
    throw new Error("Cannot decrypt v2 ciphertext without GCP_KMS_KEY_NAME configured");
  }
  const [unwrap] = await kms().decrypt({
    name: GCP_KMS_KEY_NAME!,
    ciphertext: Buffer.from(wrappedB64, "base64url"),
  });
  if (!unwrap?.plaintext) throw new Error("Cloud KMS decrypt returned no plaintext");
  const dek = Buffer.from(unwrap.plaintext as Uint8Array);
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, dek, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return (
      decipher.update(Buffer.from(encHex, "hex"), undefined, "utf8") + decipher.final("utf8")
    );
  } finally {
    dek.fill(0);
  }
}

/**
 * Async dispatcher — accepts either format and returns plaintext. Use this
 * from any codepath that might read records written by either era.
 */
export async function decryptFieldUnified(ciphertext: string): Promise<string> {
  return ciphertext.startsWith("v2:") ? decryptFieldAsync(ciphertext) : decryptField(ciphertext);
}

// ─── Display helpers ─────────────────────────────────────────────────────

export function maskField(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return "*".repeat(value.length);
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

export function isEncrypted(value: string): boolean {
  if (value.startsWith("v2:")) return /^v2:[A-Za-z0-9_\-]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/.test(value);
  return /^[0-9a-f]{24}:[0-9a-f]+:[0-9a-f]{32}$/.test(value);
}
