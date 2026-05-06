/**
 * Document Storage Service
 * Uses Firebase Storage REST API (no service account needed)
 * Same interface as the original S3 service — all callers work unchanged
 */
import crypto from 'crypto';
import path from 'path';

// =============================================================================
// FIREBASE STORAGE CONFIG
// =============================================================================

function getStorageBucket(): string | null {
  return process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || null;
}

function getApiKey(): string | null {
  return process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || null;
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

function getUploadUrl(bucket: string, filePath: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeFirebasePath(filePath)}`;
}

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

  try {
    const uploadUrl = getUploadUrl(bucket, key);
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': options?.contentType || 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Storage] Upload failed:', response.status, errorText);
      return { success: false, error: `Upload failed: ${response.status}` };
    }

    const result = await response.json();
    const downloadToken = result.downloadTokens || '';
    const url = getDownloadUrl(bucket, key, downloadToken);

    if (options?.metadata && Object.keys(options.metadata).length > 0) {
      try {
        const metadataUrl = getFileUrl(bucket, key);
        await fetch(metadataUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
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

    console.log(`[Storage] File uploaded: ${key}`);
    return { success: true, key, url };
  } catch (error: any) {
    console.error('[Storage] Upload failed:', error.message);
    return { success: false, error: 'Failed to upload file' };
  }
}

export async function getFile(key: string): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  const bucket = getStorageBucket();
  if (!bucket) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const url = `${getFileUrl(bucket, key)}?alt=media`;
    const response = await fetch(url);

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
    const url = getFileUrl(bucket, key);
    const response = await fetch(url, { method: 'DELETE' });

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
    const url = getFileUrl(bucket, key);
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

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
