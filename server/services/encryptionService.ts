/**
 * Field-Level Encryption Service
 * AES-256-GCM for sensitive PII fields (SSN, bank routing/account numbers)
 * Sentinel Domain — Security & Risk Authority
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag
const PREFIX = "enc:v1:";

/**
 * Get encryption key from environment variable.
 * Must be 32 bytes (64 hex characters).
 */
function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY environment variable is required for PII encryption. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  if (hex.length !== 64) {
    throw new Error("FIELD_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a versioned, base64-encoded string: "enc:v1:<base64(iv + authTag + ciphertext)>"
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: iv (12) + authTag (16) + ciphertext (variable)
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return PREFIX + packed.toString("base64");
}

/**
 * Decrypt an encrypted field value.
 * Expects format: "enc:v1:<base64(iv + authTag + ciphertext)>"
 */
export function decryptField(encrypted: string): string {
  if (!encrypted || !encrypted.startsWith(PREFIX)) {
    return encrypted; // Return as-is if not encrypted
  }

  const key = getKey();
  const packed = Buffer.from(encrypted.slice(PREFIX.length), "base64");

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Decrypt and mask a field, showing only the last N characters.
 * E.g., maskField(encryptedSSN, 4) → "***-**-1234"
 */
export function maskField(encrypted: string, showLast: number = 4): string {
  if (!encrypted) return "—";
  if (!isEncrypted(encrypted)) return encrypted;

  try {
    const plaintext = decryptField(encrypted);
    if (plaintext.length <= showLast) return plaintext;

    const visible = plaintext.slice(-showLast);
    const masked = "•".repeat(plaintext.length - showLast);

    // Format SSN-style if 9 digits
    if (plaintext.replace(/\D/g, "").length === 9 && showLast === 4) {
      return `•••-••-${visible}`;
    }

    return masked + visible;
  } catch {
    return "•••••";
  }
}

/**
 * Check if a value is encrypted (has the version prefix).
 */
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}
