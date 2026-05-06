import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Lock, Loader2, AlertTriangle, Info } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  business_checking: "Business Checking",
  business_savings: "Business Savings",
  personal_checking: "Personal Checking",
  personal_savings: "Personal Savings",
  checking: "Checking",
  savings: "Savings",
};

function fmtAccountType(raw: string | null | undefined): string {
  if (!raw) return "Not provided";
  const key = String(raw).toLowerCase();
  return ACCOUNT_TYPE_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AgentBank() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); })
      .then(d => { if (d?.user) setData(d); else setError("Profile data unavailable"); })
      .catch(e => setError(e.message || "Network error"));
  }, []);

  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="Bank Details" subtitle="Your direct deposit information" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load bank details</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};
  const hasBankingInfo = profile.bankName || profile.bankAccountType || profile.routingLast4 || profile.accountLast4;

  return (
    <div>
      <GCPageHeader title="Bank Details" subtitle="Your direct deposit information" accentUnderline />

      {/* Banking Info */}
      <div data-tour-id="agent-bank-form" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        {hasBankingInfo ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bank Name</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, marginTop: 4 }}>{profile.bankName || "Not provided"}</div>
              </div>
              <div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Account Type</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 500, marginTop: 4 }}>{fmtAccountType(profile.bankAccountType)}</div>
              </div>
              <div data-tour-id="agent-bank-routing">
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Routing Number</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontFamily: "monospace", marginTop: 4 }}>{profile.routingLast4 || "Not provided"}</div>
              </div>
              <div data-tour-id="agent-bank-account">
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Account Number</span>
                <div style={{ fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontFamily: "monospace", marginTop: 4 }}>{profile.accountLast4 || "Not provided"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
              <Lock className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Banking information is encrypted and secure. To update, contact your administrator.</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-3)" }}>
            <Info className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />
            <div>
              <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Banking information not yet provided</div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Your banking details will be available once your application is fully processed. Contact your administrator if you need to update this information.</div>
            </div>
          </div>
        )}
      </div>

      {/* Direct Deposit Form */}
      <div data-tour-id="agent-bank-upload">
        <DocumentCard
          title="Direct Deposit Form"
          description="Your direct deposit authorization form"
          docType="direct_deposit"
          accept=".pdf"
          hasFile={!!profile.directDepositFormKey}
        />
      </div>
    </div>
  );
}
