import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

/**
 * Credential loader (Google Cloud Secret Manager edition).
 *
 * Populates `process.env` from a single GCP Secret Manager secret when
 * NODE_ENV=production. Local development continues to read from .env, so
 * existing dev workflows are unchanged.
 *
 * Convention: store one secret per environment whose latest version is a JSON
 * object of key→value pairs:
 *
 *   {
 *     "SESSION_SECRET": "...",
 *     "FIELD_ENCRYPTION_KEY": "...",
 *     "GCP_KMS_KEY_NAME": "projects/.../locations/.../keyRings/.../cryptoKeys/...",
 *     "PLAID_CLIENT_ID": "...",
 *     "PLAID_SECRET": "...",
 *     ...
 *   }
 *
 * Secret resource read from `GCP_SECRET_NAME`. Format:
 *   projects/{PROJECT}/secrets/{SECRET}/versions/{latest|N}
 *
 * Authentication uses Application Default Credentials, same precedence as
 * encryptionService:
 *   1. GOOGLE_APPLICATION_CREDENTIALS_JSON (inline JSON)
 *   2. GOOGLE_APPLICATION_CREDENTIALS (file path)
 *   3. Ambient (Cloud Run / App Engine / Firebase / etc.)
 *
 * Existing process.env values WIN — a deploy can still override individual
 * values without rotating the whole bag. New keys are only set when the env
 * var isn't already populated.
 *
 * Fail behavior:
 *   - Production with the loader configured but unreachable → refuse to boot.
 *     Better an outage than a silent run without prod credentials.
 *   - Anywhere else → log and continue.
 */

export async function loadCredentialsIntoEnv(): Promise<void> {
  const secretName = process.env.GCP_SECRET_NAME;
  if (!secretName) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[credentialLoader] No GCP_SECRET_NAME set — falling back to process.env. " +
          "Production should populate values via Google Cloud Secret Manager.",
      );
    }
    return;
  }

  // Build the client honoring inline JSON credentials when present.
  let client: SecretManagerServiceClient;
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJson) {
    try {
      const parsed = JSON.parse(credsJson);
      client = new SecretManagerServiceClient({ credentials: parsed });
    } catch (e: any) {
      const msg = `GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON: ${e?.message}`;
      if (process.env.NODE_ENV === "production") throw new Error(`[credentialLoader] FATAL: ${msg}`);
      console.error(`[credentialLoader] ${msg} — continuing with process.env`);
      return;
    }
  } else {
    client = new SecretManagerServiceClient();
  }

  // If the caller passed a bare "projects/.../secrets/NAME" without a
  // version suffix, treat it as "latest".
  const versionPath = /\/versions\//.test(secretName)
    ? secretName
    : `${secretName}/versions/latest`;

  try {
    const [accessResponse] = await client.accessSecretVersion({ name: versionPath });
    const raw = accessResponse?.payload?.data
      ? Buffer.from(accessResponse.payload.data as Uint8Array).toString("utf8")
      : "";
    if (!raw) throw new Error("Secret payload is empty");
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Secret payload is not a JSON object");
    }
    let injected = 0;
    for (const [k, v] of Object.entries(parsed)) {
      if (process.env[k] === undefined) {
        process.env[k] = String(v);
        injected++;
      }
    }
    console.log(`[credentialLoader] Injected ${injected} keys (${secretName}).`);
  } catch (e: any) {
    const msg = e?.message || "credential_load_failed";
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[credentialLoader] FATAL: ${msg}`);
    }
    console.error(`[credentialLoader] ${msg} — continuing with process.env`);
  }
}
