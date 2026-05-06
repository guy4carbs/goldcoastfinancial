import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Eye, Loader2, X, ExternalLink, Upload } from "lucide-react";
import { csrfHeaders } from "@/lib/queryClient";

interface Props {
  title: string;
  description?: string;
  docType: string;
  accept: string;
  hasFile: boolean;
  fileName?: string;
}

function DocViewerModal({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 800, maxWidth: "95vw", height: "90vh", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", borderBottom: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface-2)" }}>
          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 600 }}>{title}</span>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ padding: "3px 8px", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-xs)", textDecoration: "none" }}>
              <ExternalLink className="w-3 h-3" /> Open
            </a>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer" }}><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <iframe src={url} style={{ width: "100%", height: "100%", border: "none" }} title={title} />
        </div>
      </div>
    </div>
  );
}

export function DocumentCard({ title, description, docType, accept, hasFile }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(false);
  const [viewMsg, setViewMsg] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const isOnFile = hasFile || uploaded;

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 5000); return () => clearTimeout(t); }
  }, [error]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size === 0) { setError("File is empty"); return; }
    if (file.size > 50 * 1024 * 1024) { setError("File too large (max 50MB)"); return; }
    setUploading(true); setError(""); setViewMsg("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const resp = await fetch("/api/agent-portal/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
            credentials: "include",
            body: JSON.stringify({ documentType: docType, fileName: file.name, fileData: base64, mimeType: file.type, fileSize: file.size }),
          });
          const data = await resp.json().catch(() => ({}));
          if (resp.ok && data.success) {
            setUploaded(true);
            setUploadedFileName(file.name);
          } else {
            setError(data.error || data.message || `Upload failed (HTTP ${resp.status})`);
          }
        } catch {
          setError("Upload failed — network error");
        }
        setUploading(false);
      };
      reader.onerror = () => { setError("Failed to read file"); setUploading(false); };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to process file");
      setUploading(false);
    }
  };

  const handleView = async () => {
    setViewing(true); setViewMsg("");
    try {
      const resp = await fetch(`/api/agent-portal/document/${docType}`, { credentials: "include" });
      if (resp.ok) {
        const data = await resp.json();
        if (data.url) setPdfUrl(data.url);
        else setViewMsg(data.message || "Preview not available");
      } else setViewMsg("Unable to load");
    } catch { setViewMsg("Unable to load"); }
    setViewing(false);
  };

  return (
    <>
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>{title}</span>
            {description && <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>{description}</p>}
          </div>
          {isOnFile && (
            <button onClick={handleView} disabled={viewing} className="flex items-center gap-1" style={{
              padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "transparent",
              border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)",
              color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-xs)", fontWeight: 500,
            }}>
              {viewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
              View
            </button>
          )}
        </div>

        {viewMsg && (
          <div className="flex items-center justify-between" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)", padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
            <span>{viewMsg}</span>
            <button onClick={() => setViewMsg("")} style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer", padding: 0, marginLeft: 8 }}><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          {isOnFile
            ? <><CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /><span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-active)" }}>On file{uploadedFileName ? ` — ${uploadedFileName}` : ""}</span></>
            : <><AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /><span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>Not uploaded</span></>
          }
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)", padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>{error}</div>
        )}

        {/* Upload */}
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          padding: "var(--gc-space-3)", cursor: uploading ? "wait" : "pointer",
          backgroundColor: "var(--gc-surface-2)", border: "2px dashed var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)", transition: "border-color 0.2s",
        }}>
          <input type="file" accept={accept} onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--gc-gold)" }} />
          ) : (
            <Upload className="w-5 h-5" style={{ color: "var(--gc-text-muted)" }} />
          )}
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>
            {uploading ? "Uploading..." : isOnFile ? `Re-upload ${title}` : `Upload ${title}`}
          </span>
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
            Click to select file
          </span>
        </label>
      </div>

      {pdfUrl && (
        <DocViewerModal title={title} url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </>
  );
}
