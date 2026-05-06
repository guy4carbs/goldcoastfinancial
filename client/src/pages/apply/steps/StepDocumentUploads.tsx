import { useState } from "react";
import { FileUploadZone } from "../components/FileUploadZone";

interface UploadStatus { eoCert: boolean; govId: boolean; amlCert: boolean; directDeposit: boolean; }

interface Props {
  token: string;
  uploads: UploadStatus;
  onUploaded: (docType: string) => void;
}

const UPLOAD_ITEMS = [
  { key: "eo_cert", label: "E&O Insurance Certificate", accept: ".pdf", field: "eoCert" as const },
  { key: "gov_id", label: "Government-Issued Photo ID", accept: ".pdf,.jpg,.jpeg,.png", field: "govId" as const },
  { key: "aml_cert", label: "AML (Anti-Money Laundering) Certificate", accept: ".pdf", field: "amlCert" as const },
  { key: "direct_deposit", label: "Direct Deposit Authorization Form", accept: ".pdf", field: "directDeposit" as const },
];

export function StepDocumentUploads({ token, uploads, onUploaded }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const resp = await fetch("/api/apply/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token, documentType: docType,
            fileName: file.name, fileData: base64,
            mimeType: file.type, fileSize: file.size,
          }),
        });
        if (resp.ok) {
          setFileNames(prev => ({ ...prev, [docType]: file.name }));
          onUploaded(docType);
        }
        setUploading(null);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(null);
    }
  };

  const doneCount = UPLOAD_ITEMS.filter(u => uploads[u.field]).length;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Document Uploads</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-2)" }}>Upload the required documents to complete your application.</p>
      <div style={{ marginBottom: "var(--gc-space-6)" }}>
        <div className="flex items-center gap-2">
          <div style={{ flex: 1, height: 4, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(doneCount / UPLOAD_ITEMS.length) * 100}%`, backgroundColor: doneCount === UPLOAD_ITEMS.length ? "var(--gc-status-active)" : "var(--gc-gold)", transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{doneCount}/{UPLOAD_ITEMS.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {UPLOAD_ITEMS.map(u => (
          <div key={u.key} style={{ opacity: uploading && uploading !== u.key ? 0.5 : 1 }}>
            <FileUploadZone
              label={uploading === u.key ? "Uploading..." : u.label}
              accept={u.accept}
              uploaded={uploads[u.field]}
              fileName={fileNames[u.key]}
              onUpload={file => handleUpload(u.key, file)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
