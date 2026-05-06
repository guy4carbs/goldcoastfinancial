import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { GraduationCap, AlertTriangle, Loader2, Info, CheckCircle, Clock, XCircle } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function getDaysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const exp = new Date(dateStr).getTime();
    if (isNaN(exp)) return null;
    return Math.floor((exp - Date.now()) / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

export default function AgentTrainings() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); })
      .then(d => { if (d?.user) setData(d); else setError("Profile data unavailable"); })
      .catch(e => setError(e.message || "Network error"));
  }, []);

  // Error state
  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="Trainings & Certifications" subtitle="Your AML certificate, government ID, and continuing education" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load trainings</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};

  // CE expiration logic
  const ceDaysLeft = getDaysLeft(profile.ceExpirationDate);
  const ceExpired = ceDaysLeft !== null && ceDaysLeft <= 0;
  const ceExpiring = ceDaysLeft !== null && ceDaysLeft > 0 && ceDaysLeft <= 90;
  const hasCE = !!profile.ceExpirationDate;

  // Summary counts
  const docsOnFile = [profile.amlCertificateKey, profile.driversLicenseKey].filter(Boolean).length;

  return (
    <div>
      <GCPageHeader title="Trainings & Certifications" subtitle="Your AML certificate, government ID, and continuing education" accentUnderline />

      {/* CE Expiration Warning */}
      {ceExpired && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <XCircle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)", fontWeight: 500 }}>Your continuing education credits expired {Math.abs(ceDaysLeft!)} days ago. Contact your administrator for renewal.</span>
        </div>
      )}
      {ceExpiring && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-warning) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>Your CE credits expire in {ceDaysLeft} days. Ensure your continuing education is current.</span>
        </div>
      )}

      {/* Continuing Education Status */}
      <div data-tour-id="agent-trainings-ce" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Continuing Education</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>CE Expiration Date</span>
            <div style={{ fontSize: "var(--gc-text-md)", color: ceExpired ? "var(--gc-status-terminated)" : ceExpiring ? "var(--gc-status-warning)" : "var(--gc-text-primary)", fontWeight: (ceExpired || ceExpiring) ? 600 : 400, marginTop: 4 }}>
              {hasCE ? fmtDate(profile.ceExpirationDate) : "Not provided"}
              {ceExpired && <span style={{ marginLeft: 6 }}>(Expired)</span>}
              {ceExpiring && <span style={{ marginLeft: 6 }}>({ceDaysLeft}d)</span>}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</span>
            <div className="flex items-center gap-1" style={{ marginTop: 4 }}>
              {ceExpired ? (
                <><XCircle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /><span style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-status-terminated)", fontWeight: 500 }}>Expired</span></>
              ) : ceExpiring ? (
                <><Clock className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} /><span style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-status-warning)", fontWeight: 500 }}>Expiring Soon</span></>
              ) : hasCE ? (
                <><CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /><span style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-status-active)", fontWeight: 500 }}>Current</span></>
              ) : (
                <><Info className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} /><span style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-muted)" }}>Pending</span></>
              )}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Documents on File</span>
            <div style={{ fontSize: "var(--gc-text-md)", color: docsOnFile === 2 ? "var(--gc-status-active)" : "var(--gc-text-primary)", fontWeight: 500, marginTop: 4 }}>{docsOnFile}/2</div>
          </div>
        </div>
      </div>

      {/* Document Uploads */}
      <div data-tour-id="agent-trainings-upload" className="flex flex-col gap-4">
        <div data-tour-id="agent-trainings-aml">
          <DocumentCard
            title="AML Certificate"
            description="Anti-Money Laundering training certification — required for all contracted agents"
            docType="aml_cert"
            accept=".pdf"
            hasFile={!!profile.amlCertificateKey}
          />
        </div>

        <div data-tour-id="agent-trainings-gov-id">
          <DocumentCard
            title="Government Photo ID"
            description="Driver's license, state ID, or passport"
            docType="gov_id"
            accept=".pdf,.jpg,.jpeg,.png"
            hasFile={!!profile.driversLicenseKey}
          />
        </div>
      </div>
    </div>
  );
}
