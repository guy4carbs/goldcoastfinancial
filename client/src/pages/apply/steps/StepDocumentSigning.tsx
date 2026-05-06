import { useState, useEffect } from "react";
import { CheckCircle, FileSignature, Loader2, AlertTriangle } from "lucide-react";
import { DocumentViewer } from "../components/DocumentViewer";
import { SignaturePadCanvas } from "../components/SignaturePadCanvas";

interface SigningStatus { nda_status: string; debt_rollup_status: string; compliance_status: string; }

interface Props {
  token: string;
  signing: SigningStatus;
  onSigned: (docType: string) => void;
}

const DOCS = [
  { key: "nda", label: "Non-Disclosure Agreement (NDA)", short: "NDA", field: "nda_status" },
  { key: "debt_rollup", label: "Debt Roll-Up Agreement", short: "Debt Roll-Up", field: "debt_rollup_status" },
  { key: "compliance", label: "Compliance & Ethics Agreement", short: "Compliance", field: "compliance_status" },
] as const;

export function StepDocumentSigning({ token, signing, onSigned }: Props) {
  const [activeDoc, setActiveDoc] = useState<number>(() => {
    const idx = DOCS.findIndex(d => signing[d.field] !== "signed");
    return idx >= 0 ? idx : 0;
  });
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allSigned = DOCS.every(d => signing[d.field] === "signed");
  const currentDoc = DOCS[activeDoc];
  const isSigned = signing[currentDoc.field] === "signed";

  // Auto-advance to next unsigned doc when signing status updates
  useEffect(() => {
    if (isSigned) {
      const nextIdx = DOCS.findIndex((d, i) => i > activeDoc && signing[d.field] !== "signed");
      if (nextIdx >= 0) {
        setActiveDoc(nextIdx);
        setAgreed(false);
        setSignatureData("");
      }
    }
  }, [signing, isSigned, activeDoc]);

  // Reset agreed/signature when switching docs
  useEffect(() => {
    setAgreed(false);
    setSignatureData("");
    setError("");
  }, [activeDoc]);

  const handleSign = async () => {
    if (!signatureData || !agreed) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`/api/apply/sign/${currentDoc.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signatureDataUrl: signatureData }),
      });
      if (resp.ok) {
        onSigned(currentDoc.key);
        // Reset for next doc — auto-advance handled by useEffect above
        setAgreed(false);
        setSignatureData("");
      } else {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || `Signing failed (${resp.status}). Please try again.`);
      }
    } catch (e) {
      setError("Network error. Please check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Document Signing</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Read each agreement carefully, check the box to confirm, then sign. All three are required.</p>

      {/* Document tabs */}
      <div className="flex gap-2 mb-6">
        {DOCS.map((d, i) => {
          const signed = signing[d.field] === "signed";
          const isActive = activeDoc === i;
          return (
            <button key={d.key} onClick={() => setActiveDoc(i)} className="flex items-center gap-2 flex-1" style={{
              padding: "var(--gc-space-2) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)",
              border: `1px solid ${isActive ? "var(--gc-gold)" : signed ? "color-mix(in srgb, var(--gc-status-active) 30%, transparent)" : "var(--gc-border)"}`,
              backgroundColor: signed ? "color-mix(in srgb, var(--gc-status-active) 8%, transparent)" : isActive ? "color-mix(in srgb, var(--gc-gold) 8%, transparent)" : "var(--gc-surface)",
              cursor: "pointer",
            }}>
              {signed
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-active)" }} />
                : <FileSignature className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? "var(--gc-gold)" : "var(--gc-text-muted)" }} />}
              <span style={{ fontSize: "var(--gc-text-xs)", fontWeight: 500, color: signed ? "var(--gc-status-active)" : isActive ? "var(--gc-gold)" : "var(--gc-text-secondary)" }}>
                {d.short}
              </span>
            </button>
          );
        })}
      </div>

      {allSigned ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <CheckCircle className="w-12 h-12" style={{ color: "var(--gc-status-active)" }} />
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>All Documents Signed</div>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>All three agreements have been electronically signed. Click Continue to proceed.</p>
        </div>
      ) : isSigned ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <CheckCircle className="w-10 h-10" style={{ color: "var(--gc-status-active)" }} />
          <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 500, color: "var(--gc-status-active)" }}>{currentDoc.label} — Signed</div>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Select the next document above to continue signing.</p>
        </div>
      ) : (
        <>
          {/* Document content — must read */}
          <DocumentViewer documentType={currentDoc.key} />

          {/* Agree checkbox */}
          <label className="flex items-start gap-3 mt-4 cursor-pointer" style={{
            padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)",
            border: `1px solid ${agreed ? "var(--gc-gold)" : "var(--gc-border)"}`,
            borderRadius: "var(--gc-radius-sm)", transition: "border-color 0.2s",
          }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-sm)", color: agreed ? "var(--gc-text-primary)" : "var(--gc-text-secondary)" }}>
              I have read and agree to the <strong>{currentDoc.label}</strong>
            </span>
          </label>

          {/* Signature pad — only shows after agreeing */}
          {agreed && (
            <div className="mt-4">
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)", fontWeight: 600 }}>Your Signature</div>
              <SignaturePadCanvas onSignature={setSignatureData} />

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 mt-3" style={{
                  padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)",
                  borderRadius: "var(--gc-radius-sm)",
                }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{error}</span>
                </div>
              )}

              {/* Sign button */}
              <button onClick={handleSign} disabled={!signatureData || loading}
                className="flex items-center gap-2 mt-4"
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)",
                  color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none",
                  cursor: signatureData && !loading ? "pointer" : "not-allowed", fontWeight: 500,
                  opacity: signatureData && !loading ? 1 : 0.5,
                }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                Sign {currentDoc.short}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
