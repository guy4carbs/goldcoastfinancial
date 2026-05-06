import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { CheckCircle, Clock, FileText, Eye, Loader2, X, ExternalLink, AlertTriangle } from "lucide-react";
import { DOCUMENT_CONTENT } from "@shared/documentContent";

function fmtDate(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

// PDF Viewer Modal — embeds PDF in iframe or falls back to document text
const DOC_LABELS: Record<string, string> = {
  eo_cert: "E&O Insurance Certificate",
  gov_id: "Government-Issued Photo ID",
  aml_cert: "AML Certificate",
  direct_deposit: "Direct Deposit Authorization Form",
  articles: "Articles of Incorporation",
  nda: "Non-Disclosure Agreement",
  debt_rollup: "Debt Roll-Up Agreement",
  compliance: "Compliance & Ethics Agreement",
};

function humanizeDocKey(key: string): string {
  return DOC_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PDFViewerModal({ docKey, signedAt, pdfUrl, signatureUrl, onClose }: { docKey: string; signedAt: string | null; pdfUrl: string | null; signatureUrl?: string | null; onClose: () => void }) {
  const doc = DOCUMENT_CONTENT[docKey];
  const title = doc?.title || humanizeDocKey(docKey);
  // Treat http(s) URLs and same-origin proxy paths (/api/...) as valid for the
  // iframe. Inline signature data: URLs are NOT valid here (they're images,
  // shown separately at the bottom of the doc text fallback).
  const hasValidUrl = !!pdfUrl && (pdfUrl.startsWith("http") || pdfUrl.startsWith("/"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose} onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 800, maxWidth: "95vw", height: "90vh", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", borderBottom: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface-2)" }}>
          <div>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 600 }}>{title}</div>
            {signedAt && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", marginTop: 1 }}>Electronically signed {fmtDate(signedAt)}</div>}
          </div>
          <div className="flex items-center gap-2">
            {hasValidUrl && (
              <a href={pdfUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ padding: "3px 8px", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-xs)", textDecoration: "none" }}>
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            )}
            <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer" }}><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {hasValidUrl ? (
            // No sandbox attribute — Safari's built-in PDF plugin needs an
            // unsandboxed iframe to render. Same-origin guarantees safety.
            <iframe src={pdfUrl!} style={{ width: "100%", height: "100%", border: "none" }} title={title} />
          ) : doc ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "var(--gc-space-4)", scrollbarWidth: "thin" }}>
              {!hasValidUrl && pdfUrl === null && (
                <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 10%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                  <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)" }}>Signed PDF not available — showing document text. The original signed copy is stored securely.</span>
                </div>
              )}
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <h3 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-gold)", textAlign: "center", marginBottom: "var(--gc-space-4)" }}>{doc.title}</h3>
                {doc.sections.map((s, i) => (
                  <div key={i} style={{ marginBottom: "var(--gc-space-3)" }}>
                    <h4 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-sm)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-1)" }}>{s.heading}</h4>
                    <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.7 }}>{s.body}</p>
                  </div>
                ))}

                {signatureUrl && (
                  <div style={{ marginTop: "var(--gc-space-6)", paddingTop: "var(--gc-space-4)", borderTop: "2px solid var(--gc-gold)" }}>
                    <div style={{ fontSize: "var(--gc-text-xs)", textTransform: "uppercase", letterSpacing: "var(--gc-tracking-wider)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Electronic Signature</div>
                    <img src={signatureUrl} alt="Electronic signature" style={{ maxWidth: 320, height: "auto", display: "block" }} />
                    {signedAt && (
                      <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", marginTop: "var(--gc-space-1)" }}>
                        Signed {fmtDate(signedAt)} by Gaetano Carbonara
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--gc-text-muted)" }}>Document not available</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderTop: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface-2)" }}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)" }}>Gold Coast Financial Partners, LLC</span>
          </div>
          <button onClick={onClose} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Uploaded document view button with inline iframe modal
function ViewDocButton({ docType, label }: { docType: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleView = async () => {
    setLoading(true); setMsg("");
    try {
      const resp = await fetch(`/api/agent-portal/document/${docType}`, { credentials: "include" });
      if (resp.ok) {
        const data = await resp.json();
        // Accept both absolute (http) URLs and same-origin proxy paths (/api/...)
        // that the server returns when streaming via /documents/:type/stream.
        if (data.url && (data.url.startsWith("http") || data.url.startsWith("/"))) {
          setPdfUrl(data.url);
        } else {
          setMsg(data.message || "File not found — please re-upload");
        }
      } else setMsg("Unable to load document");
    } catch { setMsg("Network error"); }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {msg && <span style={{ fontSize: "10px", color: "var(--gc-text-muted)" }}>{msg}</span>}
        <button onClick={handleView} disabled={loading} className="flex items-center gap-1" style={{
          padding: "3px 8px", backgroundColor: "transparent", border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer",
          fontSize: "var(--gc-text-xs)", fontWeight: 500,
        }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
          View
        </button>
      </div>
      {pdfUrl && (
        <PDFViewerModal docKey={docType} signedAt={null} pdfUrl={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </>
  );
}

export default function AgentDocuments() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<{ key: string; signedAt: string | null; pdfUrl: string | null; signatureUrl: string | null } | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then(d => { if (d?.user) setData(d); else setError("Profile data unavailable"); })
      .catch(e => setError(e.message || "Network error"));
  }, []);

  const viewSignedDoc = async (docKey: string, signedAt: string | null) => {
    setLoadingPdf(docKey);
    let pdfUrl: string | null = null;
    let signatureUrl: string | null = null;
    try {
      const resp = await fetch(`/api/agent-portal/signed/${docKey}`, { credentials: "include" });
      if (resp.ok) {
        const data = await resp.json();
        // Iframe supports both absolute and same-origin proxy URLs.
        if (data.url && (data.url.startsWith("http") || data.url.startsWith("/"))) {
          pdfUrl = data.url;
        }
        // Inline signature data: URLs (we store one in *_document_key for
        // server-side seeded signings) — surface to the modal so it renders
        // below the document text.
        if (data.key && typeof data.key === "string" && data.key.startsWith("data:image")) {
          signatureUrl = data.key;
        }
      }
    } catch {}
    setViewing({ key: docKey, signedAt, pdfUrl, signatureUrl });
    setLoadingPdf(null);
  };

  // Error state
  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="My Documents" subtitle="Signed agreements and uploaded documents" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load documents</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  // Defensive null checks
  const profile = data.profile || {};
  const checklist = data.checklist || { ndaStatus: "pending", debtRollupStatus: "pending", complianceStatus: "pending" };
  const isBusiness = profile.dbaType === "business_entity";

  const signedDocs = [
    { label: "Non-Disclosure Agreement (NDA)", status: checklist.ndaStatus || "pending", signedAt: checklist.ndaSignedAt, key: "nda" },
    { label: "Debt Roll-Up Agreement", status: checklist.debtRollupStatus || "pending", signedAt: checklist.debtRollupSignedAt, key: "debt_rollup" },
    { label: "Compliance & Ethics Agreement", status: checklist.complianceStatus || "pending", signedAt: checklist.complianceSignedAt, key: "compliance" },
  ];

  const uploadedDocs = [
    { label: "E&O Insurance Certificate", uploaded: !!profile.eoCertificateKey, docType: "eo_cert" },
    { label: "Government-Issued Photo ID", uploaded: !!profile.driversLicenseKey, docType: "gov_id" },
    { label: "AML Certificate", uploaded: !!profile.amlCertificateKey, docType: "aml_cert" },
    { label: "Direct Deposit Authorization Form", uploaded: !!profile.directDepositFormKey, docType: "direct_deposit" },
    ...(isBusiness ? [{ label: "Articles of Incorporation", uploaded: !!profile.articlesKey, docType: "articles" }] : []),
  ];

  return (
    <div>
      <GCPageHeader title="My Documents" subtitle="Signed agreements and uploaded documents" accentUnderline />

      {/* Signed Agreements */}
      <div data-tour-id="agent-documents-signed-block" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, display: "block", marginBottom: "var(--gc-space-3)" }}>Signed Agreements</span>
        <div className="flex flex-col gap-3">
          {signedDocs.map(doc => (
            <div key={doc.label} data-tour-id={doc.key === "nda" ? "agent-documents-nda" : doc.key === "debt_rollup" ? "agent-documents-debt-rollup" : doc.key === "compliance" ? "agent-documents-compliance" : undefined} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: `3px solid ${doc.status === "signed" ? "var(--gc-status-active)" : "var(--gc-status-pending)"}` }}>
              <div className="flex items-center gap-3">
                {doc.status === "signed" ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />}
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{doc.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--gc-text-xs)", color: doc.status === "signed" ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>
                  {doc.status === "signed" && doc.signedAt ? `Signed ${fmtDate(doc.signedAt)}` : "Awaiting signature"}
                </span>
                {doc.status === "signed" && (
                  <button onClick={() => viewSignedDoc(doc.key, doc.signedAt)} disabled={loadingPdf === doc.key} className="flex items-center gap-1" style={{
                    padding: "3px 8px", backgroundColor: "transparent", border: "1px solid var(--gc-gold)",
                    borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer",
                    fontSize: "var(--gc-text-xs)", fontWeight: 500,
                  }}>
                    {loadingPdf === doc.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                    View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div data-tour-id="agent-documents-uploaded-block" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, display: "block", marginBottom: "var(--gc-space-3)" }}>Uploaded Documents</span>
        <div className="flex flex-col gap-3">
          {uploadedDocs.map(doc => (
            <div key={doc.label} data-tour-id={doc.docType === "eo_cert" ? "agent-documents-eo-upload" : doc.docType === "gov_id" ? "agent-documents-govid-upload" : doc.docType === "aml_cert" ? "agent-documents-aml-upload" : doc.docType === "direct_deposit" ? "agent-documents-dd-upload" : undefined} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: `3px solid ${doc.uploaded ? "var(--gc-status-active)" : "var(--gc-status-terminated)"}` }}>
              <div className="flex items-center gap-3">
                {doc.uploaded ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <FileText className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />}
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{doc.label}</span>
              </div>
              {doc.uploaded ? (
                <ViewDocButton docType={doc.docType} label={doc.label} />
              ) : (
                <span style={{ padding: "3px 8px", fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", borderRadius: "var(--gc-radius-sm)", fontWeight: 500 }}>Missing</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewing && (
        <PDFViewerModal docKey={viewing.key} signedAt={viewing.signedAt} pdfUrl={viewing.pdfUrl} signatureUrl={viewing.signatureUrl} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
