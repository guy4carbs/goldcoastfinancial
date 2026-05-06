import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Briefcase, Building2, Loader2, AlertTriangle, CheckCircle, Clock, User } from "lucide-react";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function fmtExperience(exp: string): string {
  if (!exp) return "Not provided";
  const map: Record<string, string> = { "0-1": "0–1 years", "2-5": "2–5 years", "5-10": "5–10 years", "10+": "10+ years" };
  return map[exp] || exp;
}

function fmtStatus(status: string): string {
  const map: Record<string, string> = { pending_review: "Pending Review", in_review: "In Review", approved: "Approved", rejected: "Rejected" };
  return map[status] || status;
}

export default function AgentEmployment() {
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
        <GCPageHeader title="My Employment" subtitle="Your employment history and experience" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load employment details</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const user = data.user || {};
  const profile = data.profile || {};
  const isBusiness = profile.dbaType === "business_entity";
  const status = profile.approvalStatus || "pending_review";
  const isApproved = status === "approved";

  return (
    <div>
      <GCPageHeader title="My Employment" subtitle="Your employment history and experience" accentUnderline />

      {/* Current Position */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Current Position</span>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ width: 48, height: 48, borderRadius: "var(--gc-radius-md)", background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gc-btn-primary-text)", fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, flexShrink: 0 }}>{(user.firstName || "A").charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-text-primary)" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
              {isBusiness ? `${profile.title || "Agent"} · ${profile.companyName || "Business Entity"}` : "Licensed Insurance Agent · Individual"}
            </div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>Gold Coast Financial Partners, LLC</div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isApproved ? (
              <><CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /><span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", fontWeight: 500 }}>Active</span></>
            ) : (
              <><Clock className="w-4 h-4" style={{ color: "var(--gc-gold)" }} /><span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontWeight: 500 }}>{fmtStatus(status)}</span></>
            )}
          </div>
        </div>
      </div>

      {/* Contracting Status */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contracting Status</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Approval Status</div>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: isApproved ? "var(--gc-status-active)" : "var(--gc-gold)" }}>{fmtStatus(status)}</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Approved Date</div>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{profile.approvedAt ? fmtDate(profile.approvedAt) : "Pending"}</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Contracting Type</div>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{isBusiness ? "Business Entity" : profile.dbaType ? "Individual" : "Not specified"}</div>
          </div>
        </div>
      </div>

      {/* Experience Summary */}
      <div data-tour-id="agent-employment-history" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Experience Summary</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Years of Experience</div>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{fmtExperience(profile.yearsExperience)}</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Previous Agency</div>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)", wordBreak: "break-word" }}>{profile.previousAgency || "None listed"}</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Licensed</div>
            <div className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: profile.isLicensed ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>
              {profile.isLicensed ? <><CheckCircle className="w-4 h-4" /> Yes</> : "Pending"}
            </div>
          </div>
        </div>
      </div>

      {/* Previous Employment */}
      {profile.previousAgency && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Previous Employment</span>
          </div>
          <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-border)" }}>
            <Briefcase className="w-5 h-5" style={{ color: "var(--gc-text-muted)" }} />
            <div>
              <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)", wordBreak: "break-word" }}>{profile.previousAgency}</div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Insurance Agency · Previous</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
