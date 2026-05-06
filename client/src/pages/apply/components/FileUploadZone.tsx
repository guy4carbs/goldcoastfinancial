import { useState, useRef } from "react";
import { Upload, CheckCircle, X, FileText } from "lucide-react";

interface Props {
  label: string;
  accept: string;
  uploaded: boolean;
  fileName?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

export function FileUploadZone({ label, accept, uploaded, fileName, onUpload, onRemove }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  if (uploaded) {
    return (
      <div className="flex items-center gap-3" style={{
        padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-active) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--gc-status-active) 30%, transparent)",
        borderRadius: "var(--gc-radius-sm)",
      }}>
        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-active)" }} />
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{label}</div>
          {fileName && <div className="truncate" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{fileName}</div>}
        </div>
        {onRemove && (
          <button onClick={onRemove} style={{ color: "var(--gc-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        padding: "var(--gc-space-4)", textAlign: "center", cursor: "pointer",
        backgroundColor: dragOver ? "color-mix(in srgb, var(--gc-gold) 8%, transparent)" : "var(--gc-surface-2)",
        border: `2px dashed ${dragOver ? "var(--gc-gold)" : "var(--gc-border)"}`,
        borderRadius: "var(--gc-radius-sm)", transition: "all 0.2s",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: "none" }} />
      <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--gc-text-muted)" }} />
      <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Drag & drop or click to upload</div>
    </div>
  );
}
