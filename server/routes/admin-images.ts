/**
 * Admin Image CDN Routes
 *
 * Server-side image management for the admin Image CDN Manager.
 *
 * Why server-side, not client-side: the client-side Firebase SDK upload path
 * (client/src/lib/storageUtils.ts) fails opaquely on `.firebasestorage.app`
 * buckets. This route group wraps the proven `s3Service.uploadFile()` (which
 * uploads via the Firebase Storage REST API and returns real public URLs) so
 * admins get a reliable path.
 *
 * Auth: requireAuth + requireRole(FOUNDER, OWNER, SYSTEM_ADMIN) — matches
 * RoleGroups.ADMINS in server/types/permissions.ts.
 *
 * Endpoints:
 *   POST   /api/admin/images/upload           — multipart upload (file + folder)
 *   GET    /api/admin/images/list?folder=...  — list files in folder
 *   DELETE /api/admin/images?path=...         — delete file by bucket key
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { requireRole } from "../middleware/auth";
import * as s3Service from "../services/s3Service";

const router = Router();

// =============================================================================
// CONFIG
// =============================================================================

/**
 * Whitelist of allowed folder names. This is the entire defence against path
 * traversal — never accept a folder value that isn't in this set.
 */
const ALLOWED_FOLDERS = new Set<string>(["images", "hero", "products", "team", "logos"]);

/**
 * Allowed MIME types for image uploads. Anything else is rejected at the
 * multer layer (so a bogus payload never even reaches the handler).
 */
const ALLOWED_IMAGE_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Disallowed file type: ${file.mimetype}. Allowed: ${Array.from(ALLOWED_IMAGE_MIMES).join(", ")}`,
        ),
      );
    }
  },
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Sanitize a filename: lowercase, strip everything outside [a-z0-9._-], and
 * prepend a timestamp + short random token to guarantee uniqueness.
 */
function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, path.extname(originalName)).toLowerCase();
  const safeBase = baseName.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const finalBase = safeBase.length > 0 ? safeBase : "image";
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${timestamp}-${random}-${finalBase}${ext}`;
}

/**
 * Validate that a folder string is in the whitelist. Returns the folder or
 * null if invalid. Prevents path traversal — strings with "..", "/", etc.
 * won't match any whitelist entry.
 */
function validateFolder(folder: unknown): string | null {
  if (typeof folder !== "string") return null;
  if (!ALLOWED_FOLDERS.has(folder)) return null;
  return folder;
}

/**
 * Multer error handler — surface size/type/file-count errors as 400s instead
 * of crashing the request.
 */
function handleMulterError(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    // fileFilter rejections come through here
    return res.status(400).json({ error: err.message || "Invalid upload" });
  }
  next();
}

// =============================================================================
// AUTH GATE — all routes require admin role
// =============================================================================

const adminGate = [
  requireAuth,
  requireRole(Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN),
];

// =============================================================================
// POST /api/admin/images/upload
// =============================================================================

router.post(
  "/upload",
  ...adminGate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: any) => handleMulterError(err, req, res, next));
  },
  async (req: Request, res: Response) => {
    try {
      const admin = req.user as AuthenticatedUser;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded. Send the file under field name 'file'." });
      }

      const folder = validateFolder(req.body?.folder);
      if (!folder) {
        return res.status(400).json({
          error: `Invalid or missing folder. Must be one of: ${Array.from(ALLOWED_FOLDERS).join(", ")}.`,
        });
      }

      // Defense in depth: the multer fileFilter should already have rejected
      // any non-image MIME, but re-check here in case fileFilter is bypassed.
      if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
        return res.status(400).json({
          error: `Disallowed file type: ${file.mimetype}.`,
        });
      }

      const sanitizedFilename = sanitizeFilename(file.originalname);

      // s3Service.uploadFile signature:
      //   uploadFile(userId, filename, content, options?, folder?)
      // Returns: { success, key?, url?, error? }
      // The `folder` argument becomes part of the bucket key prefix.
      const result = await s3Service.uploadFile(
        admin.id,
        sanitizedFilename,
        file.buffer,
        {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: admin.id,
            uploadedByEmail: admin.email,
            originalFilename: file.originalname,
            folder,
          },
        },
        folder,
      );

      if (!result.success || !result.url || !result.key) {
        return res.status(500).json({
          error: result.error || "Failed to upload file to storage",
        });
      }

      console.log(
        `[AdminImages] Uploaded ${result.key} (${file.size} bytes) by ${admin.email}`,
      );

      return res.status(201).json({
        url: result.url,
        path: result.key,
        name: sanitizedFilename,
        size: file.size,
      });
    } catch (error: any) {
      console.error("[AdminImages] Upload failed:", error?.message || error);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

// =============================================================================
// GET /api/admin/images/list?folder=<folder>
// =============================================================================

router.get("/list", ...adminGate, async (req: Request, res: Response) => {
  try {
    const folder = validateFolder(req.query.folder);
    if (!folder) {
      return res.status(400).json({
        error: `Invalid or missing folder. Must be one of: ${Array.from(ALLOWED_FOLDERS).join(", ")}.`,
      });
    }

    // s3Service.listFiles(prefix, maxKeys) — uses the bucket's `o?prefix=` API.
    // Files end up keyed under `documents/<folder>/<userId>/<timestamp>-...` per
    // s3Service.generateFileKey, so we list by the same folder segment.
    // NOTE: generateFileKey prepends "documents/" — list under that namespace
    // with the folder as the secondary segment.
    const listResult = await s3Service.listFiles(`documents/${folder}/`, 200);

    if (!listResult.success) {
      return res.status(500).json({ error: listResult.error || "Failed to list images" });
    }

    const files = listResult.files || [];

    // Resolve a public download URL for each file (uses the stored Firebase
    // download token). Run in parallel for speed.
    const images = await Promise.all(
      files.map(async (file) => {
        const urlResult = await s3Service.getSignedDownloadUrl(file.key);
        const url = urlResult.success && urlResult.url ? urlResult.url : "";
        const name = file.key.split("/").pop() || file.key;
        return {
          name,
          url,
          path: file.key,
        };
      }),
    );

    return res.json({ images: images.filter((img) => img.url) });
  } catch (error: any) {
    console.error("[AdminImages] List failed:", error?.message || error);
    return res.status(500).json({ error: "Failed to list images" });
  }
});

// =============================================================================
// DELETE /api/admin/images?path=<encoded-path>
// =============================================================================

router.delete("/", ...adminGate, async (req: Request, res: Response) => {
  try {
    const rawPath = req.query.path;
    if (typeof rawPath !== "string" || rawPath.length === 0) {
      return res.status(400).json({ error: "Missing required query parameter: path" });
    }

    // The path may arrive URL-encoded — Express usually decodes query params,
    // but be defensive.
    let decodedPath: string;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      decodedPath = rawPath;
    }

    // Guard against path traversal — reject any path with ".." segments.
    if (decodedPath.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }

    // Path must live under documents/<whitelisted-folder>/ — this prevents
    // an admin from accidentally (or maliciously) deleting documents,
    // voicemails, or any other non-image asset via this endpoint.
    const allowedPrefixes = Array.from(ALLOWED_FOLDERS).map((f) => `documents/${f}/`);
    const isAllowed = allowedPrefixes.some((prefix) => decodedPath.startsWith(prefix));
    if (!isAllowed) {
      return res.status(400).json({
        error: `Path must start with one of: ${allowedPrefixes.join(", ")}`,
      });
    }

    const result = await s3Service.deleteFile(decodedPath);
    if (!result.success) {
      return res.status(500).json({ error: result.error || "Failed to delete image" });
    }

    const admin = req.user as AuthenticatedUser;
    console.log(`[AdminImages] Deleted ${decodedPath} by ${admin.email}`);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[AdminImages] Delete failed:", error?.message || error);
    return res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
