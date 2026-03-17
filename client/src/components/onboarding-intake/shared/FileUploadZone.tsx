/**
 * FileUploadZone — Drag-and-drop file upload with preview
 * Heritage-styled upload zone with thumbnail support for images
 */

import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  fileName?: string;
  onRemove?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
}

function getAcceptHint(accept?: string): string {
  if (!accept) return 'Any file type';
  const types = accept.split(',').map((t) => t.trim());
  const labels: string[] = [];
  for (const t of types) {
    if (t.includes('pdf')) labels.push('PDF');
    if (t.includes('jpeg') || t.includes('jpg')) labels.push('JPG');
    if (t.includes('png')) labels.push('PNG');
    if (t.includes('image/*')) labels.push('Images');
  }
  return labels.length ? labels.join(', ') : accept;
}

export function FileUploadZone({
  onFileSelect,
  accept,
  maxSizeMB = 10,
  fileName,
  onRemove,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setSizeError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setSizeError(`File exceeds ${maxSizeMB}MB limit`);
        return;
      }
      setSelectedFile(file);
      // Create thumbnail preview for images
      if (isImageFile(file.name)) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSizeError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  }, [previewUrl, onRemove]);

  const displayName = selectedFile?.name || fileName;
  const hasFile = !!displayName;

  // File selected state — show file info
  if (hasFile) {
    return (
      <div
        className="flex items-center gap-3 border border-gray-200 bg-white"
        style={{
          borderRadius: RADIUS.card,
          padding: GRID.spacing.md,
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: RADIUS.input,
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center flex-shrink-0 bg-violet-50"
            style={{
              width: 48,
              height: 48,
              borderRadius: RADIUS.input,
            }}
          >
            <FileText size={20} style={{ color: COLORS.primary.violet[600] }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{
              fontSize: TYPE.meta,
              fontWeight: 600,
              color: COLORS.gray[800],
            }}
          >
            {displayName}
          </p>
          {selectedFile && (
            <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
              {formatFileSize(selectedFile.size)}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="flex-shrink-0 h-8 w-8"
          aria-label="Remove file"
        >
          <X size={16} style={{ color: COLORS.gray[500] }} />
        </Button>
      </div>
    );
  }

  // Empty state — drop zone
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center cursor-pointer
          border-2 border-dashed transition-colors
          ${isDragOver
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 bg-white hover:border-violet-300'
          }
        `}
        style={{
          borderRadius: RADIUS.card,
          padding: GRID.spacing.md,
          minHeight: 120,
          transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
        }}
      >
        <Upload
          size={24}
          style={{
            color: isDragOver
              ? COLORS.primary.violet[500]
              : COLORS.gray[400],
            marginBottom: GRID.spacing.xs,
          }}
        />
        <p
          style={{
            fontSize: TYPE.meta,
            fontWeight: 600,
            color: COLORS.gray[700],
            marginBottom: 4,
          }}
        >
          Drag &amp; drop or click to browse
        </p>
        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
          {getAcceptHint(accept)} &middot; Max {maxSizeMB}MB
        </p>
      </div>

      {sizeError && (
        <p
          role="alert"
          style={{
            fontSize: TYPE.micro,
            color: COLORS.semantic.error,
            marginTop: 4,
          }}
        >
          {sizeError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
