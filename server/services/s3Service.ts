/**
 * Document Storage Service
 * Uses Firebase Storage REST API authenticated with the same Google service
 * account credentials the rest of the server uses for KMS / Secret Manager
 * (GOOGLE_APPLICATION_CREDENTIALS_JSON). Same interface as the original S3
 * service — all callers work unchanged.
 *
 * Unauthenticated upload attempts (the old behavior) get 404'd by the
 * Firebase Storage REST API for buckets that haven't relaxed their rules,
 * which is the case for our project. Bearer-token auth via the service
 * account is the canonical server-to-server pattern.
 */
import crypto from 'crypto';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

// =============================================================================
// FIREBASE STORAGE CONFIG
// =============================================================================

// Trim whitespace + strip a single layer of surrounding quotes. Env-var UIs
// sometimes treat quotes as part of the value, so `"gold-coast-fnl.firebasestorage.app"`
// gets stored as 38 chars instead of 36, and GCS's strict bucket-name validation
// rejects it as Invalid bucket name. Firebase's wrapper used to tolerate this;
// the canonical GCS endpoint does not.
function sanitizeEnv(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed || null;
}

function getStorageBucket(): string | null {
  return (
    sanitizeEnv(process.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    sanitizeEnv(process.env.FIREBASE_STORAGE_BUCKET) ||
    null
  );
}

function getApiKey(): string | null {
  return (
    sanitizeEnv(process.env.VITE_FIREBASE_API_KEY) ||
    sanitizeEnv(process.env.FIREBASE_API_KEY) ||
    null
  );
}

// Parse the service-account JSON out of the env var. Hosting platforms
// frequently mangle the raw JSON — Railway/Heroku in particular tend to
// strip the literal `\n` escapes inside the private_key string, leaving
// real newlines that break `JSON.parse`. We accept three formats so the
// operator's first paste works regardless:
//   1. Raw JSON (`{"type":"service_account",...}`)
//   2. Base64-encoded JSON (recommended for hostile env-var systems)
//   3. Raw JSON with literal newlines inside private_key — we repair it
//
// Returns the parsed credentials object or null, plus a parseError for
// the diagnostic endpoint so operators can see exactly what went wrong.
function parseServiceAccountCreds(raw: string): {
  creds: Record<string, unknown> | null;
  parseError: string | null;
} {
  const tried: string[] = [];

  // 1. Direct parse — the happy path.
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && obj.type === 'service_account') {
      return { creds: obj, parseError: null };
    }
    tried.push('direct: parsed but not a service_account object');
  } catch (e: any) {
    tried.push(`direct: ${e?.message || 'parse failed'}`);
  }

  // 2. Base64-decode then parse — recommended when the platform mangles
  // newlines or quotes. Detect by checking the string only contains
  // base64-safe chars.
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw)) {
    try {
      const decoded = Buffer.from(raw.replace(/\s/g, ''), 'base64').toString('utf-8');
      const obj = JSON.parse(decoded);
      if (obj && typeof obj === 'object' && obj.type === 'service_account') {
        return { creds: obj, parseError: null };
      }
      tried.push('base64: parsed but not a service_account object');
    } catch (e: any) {
      tried.push(`base64: ${e?.message || 'decode/parse failed'}`);
    }
  } else {
    tried.push('base64: skipped (contains non-base64 chars)');
  }

  // 3. Repair literal newlines inside the private_key field. When the env
  // var system replaces `\n` with actual newlines, the JSON parser chokes
  // because raw newlines aren't valid inside JSON string literals. Re-escape
  // them and try again.
  try {
    const repaired = raw.replace(
      /"private_key"\s*:\s*"([^"]*?)"/,
      (_match, body: string) => {
        const escaped = body.replace(/\r?\n/g, '\\n');
        return `"private_key":"${escaped}"`;
      },
    );
    const obj = JSON.parse(repaired);
    if (obj && typeof obj === 'object' && obj.type === 'service_account') {
      return { creds: obj, parseError: null };
    }
    tried.push('repair: parsed but not a service_account object');
  } catch (e: any) {
    tried.push(`repair: ${e?.message || 'parse failed'}`);
  }

  return { creds: null, parseError: tried.join(' | ') };
}

// Cached GoogleAuth client + access token. The token has a ~1h TTL; the
// GoogleAuth client refreshes it automatically on each getAccessToken() call.
let _authClient: GoogleAuth | null = null;
let _credsParseError: string | null = null;
function getAuthClient(): GoogleAuth {
  if (_authClient) return _authClient;
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: any = {
    scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
  };
  if (credsJson) {
    const { creds, parseError } = parseServiceAccountCreds(credsJson);
    if (creds) {
      opts.credentials = creds;
    } else {
      _credsParseError = parseError;
      console.error('[Storage] GOOGLE_APPLICATION_CREDENTIALS_JSON parse failed:', parseError);
    }
  }
  _authClient = new GoogleAuth(opts);
  return _authClient as GoogleAuth;
}

interface AccessTokenResult {
  token: string | null;
  errorMessage: string | null;
}

async function getStorageAccessToken(): Promise<AccessTokenResult> {
  try {
    const auth = getAuthClient();
    const token = await auth.getAccessToken();
    if (typeof token === 'string') return { token, errorMessage: null };
    return { token: null, errorMessage: 'GoogleAuth returned a non-string token' };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error('[Storage] Failed to get access token:', msg);
    return { token: null, errorMessage: msg };
  }
}

// Public diagnostic — returns auth state WITHOUT exposing the token or
// credential JSON. Used by the founder-only /api/admin/_debug/storage-auth
// endpoint so we can see whether the service-account env var is actually
// present + usable in production. Surfaces the JSON parse error separately
// from the token-mint error so operators can tell whether the issue is a
// mangled paste (parse_error) vs missing IAM role (token_error).
export async function probeStorageAuth(): Promise<{
  credentials_inline_present: boolean;
  credentials_path_present: boolean;
  bucket_configured: boolean;
  api_key_present: boolean;
  can_get_token: boolean;
  token_error: string | null;
  creds_parse_error: string | null;
  creds_inline_length: number;
  service_account_email: string | null;
}> {
  const rawCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '';
  const credsInline = !!rawCreds;
  const credsPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const bucket = !!getStorageBucket();
  const apiKey = !!getApiKey();
  // Warm up the auth client so _credsParseError gets populated.
  getAuthClient();
  const result = await getStorageAccessToken();
  // Re-parse to extract the service account email for the diagnostic. Email
  // is safe to expose; private_key + token are not.
  let saEmail: string | null = null;
  if (rawCreds) {
    const { creds } = parseServiceAccountCreds(rawCreds);
    if (creds && typeof creds.client_email === 'string') {
      saEmail = creds.client_email;
    }
  }
  return {
    credentials_inline_present: credsInline,
    credentials_path_present: credsPath,
    bucket_configured: bucket,
    api_key_present: apiKey,
    can_get_token: !!result.token,
    token_error: result.errorMessage,
    creds_parse_error: _credsParseError,
    creds_inline_length: rawCreds.length,
    service_account_email: saEmail,
  };
}

// =============================================================================
// ALLOWED FILE TYPES
// =============================================================================

const ALLOWED_DOCUMENT_TYPES: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.txt': ['text/plain'],
  '.csv': ['text/csv'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// =============================================================================
// AVAILABILITY CHECK
// =============================================================================

export function isS3Available(): boolean {
  return !!(getStorageBucket() && getApiKey());
}

// =============================================================================
// FILE VALIDATION
// =============================================================================

export function validateFile(
  filename: string,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_DOCUMENT_TYPES[ext]) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }

  if (!ALLOWED_DOCUMENT_TYPES[ext].includes(mimeType)) {
    return { valid: false, error: `Invalid file type for extension ${ext}` };
  }

  return { valid: true };
}

// =============================================================================
// FILE KEY GENERATION
// =============================================================================

function generateFileKey(userId: string, filename: string, folder?: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

  const keyParts = ['documents'];
  if (folder) keyParts.push(folder);
  keyParts.push(userId);
  keyParts.push(`${timestamp}-${random}-${safeName}${ext}`);

  return keyParts.join('/');
}

// =============================================================================
// FIREBASE STORAGE REST API HELPERS
// =============================================================================

function encodeFirebasePath(filePath: string): string {
  return encodeURIComponent(filePath);
}

// GCS direct REST API — canonical server-to-server upload pattern. Uses the
// same Bearer token + the same bucket name, but talks to storage.googleapis.com
// instead of firebasestorage.googleapis.com. The Firebase Storage wrapper
// at firebasestorage.googleapis.com returns 404 for authenticated requests
// against `.firebasestorage.app` buckets even when the SA has Storage Admin —
// it's a wrapper meant primarily for Firebase Auth ID tokens, not GCS service
// account tokens. The GCS direct endpoint bypasses the wrapper and goes
// straight to the bucket via standard IAM, which actually works.
function getGcsUploadUrl(bucket: string, filePath: string): string {
  return `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeFirebasePath(filePath)}`;
}

function getGcsObjectUrl(bucket: string, filePath: string): string {
  return `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeFirebasePath(filePath)}`;
}

// Firebase-style URLs retained for the legacy download-token download URL
// returned to clients. The actual download path streams server-side via
// `getFile()`, which uses the GCS endpoint — these are only for display.
function getFileUrl(bucket: string, filePath: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeFirebasePath(filePath)}`;
}

function getDownloadUrl(bucket: string, filePath: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeFirebasePath(filePath)}?alt=media&token=${token}`;
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: boolean;
}

export async function uploadFile(
  userId: string,
  filename: string,
  content: Buffer | Uint8Array | string,
  options?: UploadOptions,
  folder?: string
): Promise<{ success: boolean; key?: string; url?: string; error?: string }> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return { success: false, error: 'Storage not configured' };
  }

  const key = generateFileKey(userId, filename, folder);
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

  // Bucket naming changed in newer Firebase projects — modern projects use
  // <id>.firebasestorage.app, older ones use <id>.appspot.com. If the env
  // var has the wrong format, Firebase returns 404 and the upload silently
  // fails. Try both forms before giving up.
  const bucketCandidates = [bucket];
  if (bucket.endsWith(".firebasestorage.app")) {
    bucketCandidates.push(bucket.replace(/\.firebasestorage\.app$/, ".appspot.com"));
  } else if (bucket.endsWith(".appspot.com")) {
    bucketCandidates.push(bucket.replace(/\.appspot\.com$/, ".firebasestorage.app"));
  }

  let lastStatus = 0;
  let lastBody = "";
  let lastBucket = bucket;

  // Try to get a Bearer token. If we can't, fall through to unauthenticated
  // upload — Firebase Storage Rules are the authoritative gate. If rules
  // permit anonymous writes to `applications/*` (the only path we use),
  // the upload succeeds without auth. If rules deny, the per-bucket 404/403
  // surfaces with a clear message and we know to fix one of: env var or rules.
  const tokenResult = await getStorageAccessToken();
  if (!tokenResult.token) {
    console.warn(
      `[Storage] No access token — attempting unauthenticated upload. Token error: ${tokenResult.errorMessage || "no creds"}`,
    );
  }

  for (const candidate of bucketCandidates) {
    try {
      // GCS direct upload — the canonical server-to-server path. Works for
      // both `.firebasestorage.app` and `.appspot.com` bucket names when the
      // service account has Storage Object Admin (or Storage Admin).
      const uploadUrl = getGcsUploadUrl(candidate, key);
      const headers: Record<string, string> = {
        'Content-Type': options?.contentType || 'application/octet-stream',
      };
      if (tokenResult.token) headers['Authorization'] = `Bearer ${tokenResult.token}`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastStatus = response.status;
        lastBody = errorText.slice(0, 500);
        lastBucket = candidate;
        console.error(`[Storage] Upload failed bucket=${candidate} status=${response.status} body=${lastBody}`);
        // 404 likely means wrong bucket name → try the next candidate.
        if (response.status === 404 && candidate !== bucketCandidates[bucketCandidates.length - 1]) {
          continue;
        }
        return {
          success: false,
          error: `Storage rejected the upload (bucket=${candidate}, status=${response.status}): ${lastBody.slice(0, 120) || "no body"}`,
        };
      }

      // GCS returns object metadata (mediaLink, selfLink, etc.) on success.
      // The Firebase-style downloadTokens URL is no longer minted by GCS, so
      // the returned `url` field is the GCS mediaLink — server-side downloads
      // via getFile(key) work unchanged because they re-fetch by key.
      const result = await response.json();
      const url =
        result.mediaLink ||
        `https://storage.googleapis.com/${candidate}/${encodeFirebasePath(key)}`;

      if (options?.metadata && Object.keys(options.metadata).length > 0) {
        try {
          // GCS metadata PATCH uses a different URL than the Firebase wrapper.
          const metadataUrl = getGcsObjectUrl(candidate, key);
          await fetch(metadataUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(tokenResult.token ? { Authorization: `Bearer ${tokenResult.token}` } : {}),
            },
            body: JSON.stringify({
              metadata: {
                userId,
                originalFilename: filename,
                uploadedAt: new Date().toISOString(),
                ...options.metadata,
              },
            }),
          });
        } catch {
          // Metadata update is non-critical
        }
      }

      console.log(`[Storage] File uploaded: ${key} (bucket=${candidate}, via GCS)`);
      return { success: true, key, url };
    } catch (error: any) {
      console.error(`[Storage] Upload threw on bucket=${candidate}:`, error?.message);
      lastBucket = candidate;
      lastBody = error?.message || "unknown";
      // Network/runtime error — try the next bucket variant if any remain.
      continue;
    }
  }

  return {
    success: false,
    error: `All storage attempts failed (last bucket=${lastBucket}, status=${lastStatus || "n/a"}): ${lastBody.slice(0, 120) || "no body"}`,
  };
}

export async function getFile(key: string): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const url = `${getGcsObjectUrl(bucket, key)}?alt=media`;
    const tokenResult = await getStorageAccessToken();
    const headers: Record<string, string> = {};
    if (tokenResult.token) headers['Authorization'] = `Bearer ${tokenResult.token}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return { success: false, error: `Failed to get file: ${response.status}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    return { success: true, data: Buffer.from(arrayBuffer) };
  } catch (error: any) {
    console.error('[Storage] Get file failed:', error.message);
    return { success: false, error: 'Failed to get file' };
  }
}

export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const url = getGcsObjectUrl(bucket, key);
    const tokenResult = await getStorageAccessToken();
    const headers: Record<string, string> = {};
    if (tokenResult.token) headers['Authorization'] = `Bearer ${tokenResult.token}`;
    const response = await fetch(url, { method: 'DELETE', headers });

    if (!response.ok && response.status !== 404) {
      return { success: false, error: `Failed to delete: ${response.status}` };
    }

    console.log(`[Storage] File deleted: ${key}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Storage] Delete failed:', error.message);
    return { success: false, error: 'Failed to delete file' };
  }
}

export async function fileExists(key: string): Promise<boolean> {
  const bucket = getStorageBucket();
  if (!bucket) return false;

  try {
    const url = getGcsObjectUrl(bucket, key);
    const tokenResult = await getStorageAccessToken();
    const headers: Record<string, string> = {};
    if (tokenResult.token) headers['Authorization'] = `Bearer ${tokenResult.token}`;
    const response = await fetch(url, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * @deprecated DO NOT USE for any user-supplied download. The returned URL
 * embeds a Firebase `downloadToken` that NEVER expires — the
 * `_expiresInSeconds` parameter is a lie carried over from the v1 API. Any
 * leak (referer logs, browser history, screenshare) → indefinite access.
 *
 * Instead, stream the file server-side via `getFile(key)` and pipe the bytes
 * after re-checking auth. The canonical pattern lives at
 * `server/routes/book-of-business.ts:980-1050` (gcf) and
 * `server/routes/agent-clients.ts` GET `/:clientId/documents/:docId/download`
 * (heritage, fixed in audit pass 3, 2026-05-12).
 */
export async function getSignedDownloadUrl(
  key: string,
  _expiresInSeconds: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return { success: true, url: key };
  }

  const bucket = getStorageBucket();
  if (!bucket) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const metaUrl = getFileUrl(bucket, key);
    const response = await fetch(metaUrl);

    if (!response.ok) {
      return { success: false, error: `File not found: ${response.status}` };
    }

    const data = await response.json();
    const token = data.downloadTokens || '';
    const url = getDownloadUrl(bucket, key, token);

    return { success: true, url };
  } catch (error: any) {
    console.error('[Storage] Download URL generation failed:', error.message);
    return { success: false, error: 'Failed to generate download URL' };
  }
}
