import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { AlertTriangle, Loader2, Info, ShieldCheck, XCircle } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function fmtCoverage(amount: string | null): string {
  if (!amount) return "—";
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return `$${num.toLocaleString()}`;
}

function getDaysUntilExpiry(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const exp = new Date(dateStr).getTime();
    if (isNaN(exp)) return null;
    return Math.floor((exp - Date.now()) / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

export default function AgentEO() {
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
        <GCPageHeader title="E&O Insurance" subtitle="Your Errors & Omissions insurance details" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load E&O details</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};
  const hasEOInfo = profile.eoProvider || profile.eoPolicyNumber || profile.eoEffectiveDate;
  const daysUntilExpiry = getDaysUntilExpiry(profile.eoExpirationDate);
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isExpiring = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 90;

  return (
    <div>
      <GCPageHeader title="E&O Insurance" subtitle="Your Errors & Omissions insurance details" accentUnderline />

      {/* Expired Banner */}
      {isExpired && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <XCircle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)", fontWeight: 500 }}>Your E&O policy has expired ({Math.abs(daysUntilExpiry!)} days ago). Upload a renewed certificate immediately.</span>
        </div>
      )}

      {/* Expiring Soon Banner */}
      {isExpiring && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-warning) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>Your E&O policy expires in {daysUntilExpiry} days. Please upload a renewed certificate.</span>
        </div>
      )}

      {/* Missing E&O Banner */}
      {!hasEOInfo && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>E&O insurance information is required. Contact your administrator to complete your E&O details.</span>
        </div>
      )}

      {/* E&O Details */}
      <div data-tour-id="agent-eo-current" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        {hasEOInfo ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div data-tour-id="agent-eo-provider">
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Provider</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, marginTop: 4 }}>{profile.eoProvider || "Not provided"}</div>
              </div>
              <div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Policy Number</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, marginTop: 4, fontFamily: "monospace" }}>{profile.eoPolicyNumber || "Not provided"}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Effective Date</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", marginTop: 4 }}>{fmtDate(profile.eoEffectiveDate)}</div>
              </div>
              <div data-tour-id="agent-eo-expiration">
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Expiration Date</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: isExpired ? "var(--gc-status-terminated)" : isExpiring ? "var(--gc-status-warning)" : "var(--gc-text-primary)", fontWeight: (isExpired || isExpiring) ? 600 : 400, marginTop: 4 }}>
                  {fmtDate(profile.eoExpirationDate)}
                  {daysUntilExpiry !== null && !isExpired && daysUntilExpiry <= 90 && <span style={{ marginLeft: 6 }}>({daysUntilExpiry}d)</span>}
                  {isExpired && <span style={{ marginLeft: 6 }}>(Expired)</span>}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Coverage Amount</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, marginTop: 4 }}>{fmtCoverage(profile.eoCoverageAmount)}</div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-4" style={{ paddingTop: "var(--gc-space-3)", borderTop: "1px solid var(--gc-border-subtle)" }}>
              {isExpired ? (
                <><XCircle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /><span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)", fontWeight: 500 }}>Policy Expired</span></>
              ) : isExpiring ? (
                <><AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} /><span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)", fontWeight: 500 }}>Expiring Soon — Renewal Required</span></>
              ) : (
                <><ShieldCheck className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /><span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-active)" }}>Policy Active</span></>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />
            <div>
              <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>E&O insurance information not yet provided</div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Your E&O details will be available once your application is fully processed. A minimum coverage of $1,000,000 is required.</div>
            </div>
          </div>
        )}
      </div>

      {/* E&O Certificate Upload */}
      <div data-tour-id="agent-eo-upload">
        <DocumentCard
          title="E&O Certificate"
          description="Your Errors & Omissions insurance certificate"
          docType="eo_cert"
          accept=".pdf"
          hasFile={!!profile.eoCertificateKey}
        />
      </div>
    </div>
  );
}
