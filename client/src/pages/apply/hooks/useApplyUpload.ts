import { useCallback, useState } from "react";

/**
 * Shared upload hook for the public /apply flow.
 *
 * Every document the applicant uploads (E&O cert, Government ID, AML cert,
 * Direct Deposit form, Articles of Incorporation, owner photo IDs) goes
 * through the same /api/apply/upload endpoint. Before this hook, each step
 * had to wire its own file → base64 → fetch → error-handling code, and a
 * couple of steps (Banking, Trainings, original E&O) were missing the
 * fetch call entirely, so the bytes never reached the server.
 *
 * Returns a `upload(documentType, file, options?)` callable that:
 *   - guards on a present token
 *   - rejects files larger than 10 MB
 *   - posts the base64 file to /api/apply/upload
 *   - surfaces server-side error messages via the `error` state
 *   - tracks `uploading` as the in-flight documentType (or null when idle)
 *
 * The `ownerId` option exists for the business-entity owner-photo flow,
 * which uses the same endpoint but with an extra body field so the server
 * can key the upload to a specific owner record.
 */
export type ApplyDocumentType =
  | "eo_cert"
  | "gov_id"
  | "aml_cert"
  | "direct_deposit"
  | "articles"
  | "owner_photo";

export interface ApplyUploadOptions {
  ownerId?: string;
}

export function useApplyUpload(token: string | undefined) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const upload = useCallback(
    async (
      documentType: ApplyDocumentType,
      file: File,
      options: ApplyUploadOptions = {},
    ): Promise<boolean> => {
      if (!token) {
        setError("Missing application token — refresh the page and try again.");
        return false;
      }
      // Composite key for the in-flight tracker so two owner-photo uploads
      // for different owners don't both render as "uploading" on the same tile.
      const inflightKey = options.ownerId
        ? `${documentType}:${options.ownerId}`
        : documentType;
      setUploading(inflightKey);
      setError("");
      try {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File is too large (max 10 MB)");
        }
        const reader = new FileReader();
        const fileData: string = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const dataUrl = String(reader.result || "");
            const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
            resolve(base64);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        const r = await fetch("/api/apply/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            documentType,
            fileName: file.name,
            fileData,
            mimeType: file.type || "application/octet-stream",
            fileSize: file.size,
            ...(options.ownerId ? { ownerId: options.ownerId } : {}),
          }),
        });
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${r.status}`);
        }
        return true;
      } catch (e: any) {
        setError(e?.message || "Upload failed");
        return false;
      } finally {
        setUploading(null);
      }
    },
    [token],
  );

  return { upload, uploading, error };
}
