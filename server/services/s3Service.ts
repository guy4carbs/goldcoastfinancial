import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

/**
 * S3 Document Storage Service
 * Handles secure file uploads with signed URLs
 */

let s3Client: S3Client | null = null;

// Allowed file types and their MIME types
const ALLOWED_DOCUMENT_TYPES: Record<string, string[]> = {
  // Documents
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  // Images
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  // Text
  '.txt': ['text/plain'],
  '.csv': ['text/csv'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Get the S3 client instance
 */
function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    console.warn('[S3] AWS credentials not configured');
    return null;
  }

  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    console.log('[S3] S3 client initialized');
    return s3Client;
  } catch (error: any) {
    console.error('[S3] Failed to initialize S3 client:', error.message);
    return null;
  }
}

/**
 * Get the S3 bucket name
 */
function getBucket(): string {
  return process.env.AWS_S3_BUCKET || 'heritage-documents';
}

/**
 * Check if S3 is configured and available
 */
export function isS3Available(): boolean {
  return getS3Client() !== null;
}

// =============================================================================
// FILE VALIDATION
// =============================================================================

/**
 * Validate a file before upload
 */
export function validateFile(
  filename: string,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  // Check file size
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Get file extension
  const ext = path.extname(filename).toLowerCase();

  // Check if extension is allowed
  if (!ALLOWED_DOCUMENT_TYPES[ext]) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }

  // Check if MIME type matches
  if (!ALLOWED_DOCUMENT_TYPES[ext].includes(mimeType)) {
    return { valid: false, error: `Invalid file type for extension ${ext}` };
  }

  return { valid: true };
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: boolean;
}

/**
 * Generate a unique file key
 */
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

/**
 * Upload a file to S3
 */
export async function uploadFile(
  userId: string,
  filename: string,
  content: Buffer | Uint8Array | string,
  options?: UploadOptions,
  folder?: string
): Promise<{ success: boolean; key?: string; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  const key = generateFileKey(userId, filename, folder);
  const bucket = getBucket();

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: options?.contentType || 'application/octet-stream',
      Metadata: {
        userId,
        originalFilename: filename,
        uploadedAt: new Date().toISOString(),
        ...options?.metadata,
      },
      ServerSideEncryption: options?.serverSideEncryption !== false ? 'AES256' : undefined,
    });

    await client.send(command);
    console.log(`[S3] File uploaded: ${key}`);

    return { success: true, key };
  } catch (error: any) {
    console.error('[S3] Upload failed:', error.message);
    return { success: false, error: 'Failed to upload file' };
  }
}

/**
 * Get a file from S3
 */
export async function getFile(key: string): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  try {
    const command = new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    const response = await client.send(command);
    const chunks: Uint8Array[] = [];

    if (response.Body) {
      // Convert stream to buffer
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }

    return { success: true, data: Buffer.concat(chunks) };
  } catch (error: any) {
    console.error('[S3] Get file failed:', error.message);
    return { success: false, error: 'Failed to get file' };
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    await client.send(command);
    console.log(`[S3] File deleted: ${key}`);

    return { success: true };
  } catch (error: any) {
    console.error('[S3] Delete failed:', error.message);
    return { success: false, error: 'Failed to delete file' };
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;

  try {
    const command = new HeadObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string): Promise<{
  contentType?: string;
  size?: number;
  lastModified?: Date;
  metadata?: Record<string, string>;
} | null> {
  const client = getS3Client();
  if (!client) return null;

  try {
    const command = new HeadObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    const response = await client.send(command);
    return {
      contentType: response.ContentType,
      size: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch {
    return null;
  }
}

// =============================================================================
// SIGNED URLS
// =============================================================================

/**
 * Generate a signed URL for downloading a file
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600 // 1 hour
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  try {
    const command = new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return { success: true, url };
  } catch (error: any) {
    console.error('[S3] Signed URL generation failed:', error.message);
    return { success: false, error: 'Failed to generate download URL' };
  }
}

/**
 * Generate a signed URL for uploading a file
 */
export async function getSignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  expiresInSeconds: number = 3600,
  folder?: string
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  const key = generateFileKey(userId, filename, folder);

  try {
    const command = new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType,
      Metadata: {
        userId,
        originalFilename: filename,
      },
      ServerSideEncryption: 'AES256',
    });

    const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return { success: true, url, key };
  } catch (error: any) {
    console.error('[S3] Signed upload URL generation failed:', error.message);
    return { success: false, error: 'Failed to generate upload URL' };
  }
}

// =============================================================================
// FOLDER OPERATIONS
// =============================================================================

/**
 * List files in a folder
 */
export async function listFiles(
  prefix: string,
  maxKeys: number = 100
): Promise<{
  success: boolean;
  files?: Array<{ key: string; size: number; lastModified: Date }>;
  error?: string;
}> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'S3 not configured' };
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await client.send(command);
    const files = (response.Contents || []).map(item => ({
      key: item.Key!,
      size: item.Size!,
      lastModified: item.LastModified!,
    }));

    return { success: true, files };
  } catch (error: any) {
    console.error('[S3] List files failed:', error.message);
    return { success: false, error: 'Failed to list files' };
  }
}

/**
 * List all files for a user
 */
export async function listUserFiles(userId: string): Promise<{
  success: boolean;
  files?: Array<{ key: string; size: number; lastModified: Date }>;
  error?: string;
}> {
  return listFiles(`documents/${userId}/`);
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

/**
 * Upload a policy document
 */
export async function uploadPolicyDocument(
  userId: string,
  policyId: string,
  filename: string,
  content: Buffer
): Promise<{ success: boolean; key?: string; error?: string }> {
  return uploadFile(userId, filename, content, {
    metadata: { policyId, documentType: 'policy' },
  }, `policies/${policyId}`);
}

/**
 * Upload a user document (ID, proof of income, etc.)
 */
export async function uploadUserDocument(
  userId: string,
  documentType: string,
  filename: string,
  content: Buffer
): Promise<{ success: boolean; key?: string; error?: string }> {
  return uploadFile(userId, filename, content, {
    metadata: { documentType },
  }, 'user-documents');
}

/**
 * Upload a form submission document
 */
export async function uploadFormDocument(
  userId: string,
  formType: string,
  filename: string,
  content: Buffer
): Promise<{ success: boolean; key?: string; error?: string }> {
  return uploadFile(userId, filename, content, {
    metadata: { formType, documentType: 'form' },
  }, 'forms');
}

export default {
  isS3Available,
  validateFile,
  uploadFile,
  getFile,
  deleteFile,
  fileExists,
  getFileMetadata,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  listFiles,
  listUserFiles,
  uploadPolicyDocument,
  uploadUserDocument,
  uploadFormDocument,
};
