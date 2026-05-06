import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { GitBranch, User, ArrowUp, Loader2, AlertTriangle, Info, Shield, Award } from "lucide-react";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function fmtPhone(raw: string): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}

const LEVEL_LABELS: Record<number, string> = {
  0: "Founder", 1: "Diamond Director", 2: "Platinum Director",
  3: "Regional Manager", 4: "Team Lead", 5: "Senior Agent", 6: "Agent", 7: "Associate Agent",
};

export default function AgentHierarchy() {
  const [data, setData] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent-portal/me", { credentials: "include" }).then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); }),
      fetch("/api/agent-portal/hierarchy", { credentials: "include" }).then(r => r.ok ? r.json() : { placed: false }).catch(() => ({ placed: false })),
    ]).then(([me, hier]) => {
      if (me?.user) setData(me); else setError("Profile data unavailable");
      setHierarchy(hier);
      setLoading(false);
    }).catch(e => { setError(e.message || "Network error"); setLoading(false); });
  }, []);

  // Error state
  if (error && !data) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="My Hierarchy" subtitle="Your position in the organization" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load hierarchy</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const user = data.user || {};
  const profile = data.profile || {};
  const isPlaced = hierarchy?.placed;
  const h = hierarchy?.hierarchy;
  const upline = hierarchy?.upline;

  return (
    <div>
      <GCPageHeader title="My Hierarchy" subtitle="Your position in the organization" accentUnderline />

      {/* Your Position */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Your Position</span>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ width: 48, height: 48, borderRadius: "var(--gc-radius-md)", background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gc-btn-primary-text)", fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, flexShrink: 0 }}>{(user.firstName || "A").charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
              {isPlaced && h ? LEVEL_LABELS[h.level] || h.title || "Agent" : "Licensed Insurance Agent"}
            </div>
            {profile.npn && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontFamily: "monospace", marginTop: 2 }}>NPN: {profile.npn}</div>}
          </div>
        </div>
      </div>

      {/* Contract Details — only if hierarchy data exists */}
      {isPlaced && h && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contract Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Hierarchy Level</div>
              <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{LEVEL_LABELS[h.level] || `Level ${h.level}`}</div>
            </div>
            {h.contractLevel != null && (
              <div>
                <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Contract Level</div>
                <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-gold)" }}>{h.contractLevel}%</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Effective Since</div>
              <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{fmtDate(h.effectiveFrom)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Upline Manager */}
      <div data-tour-id="agent-hierarchy-upline" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUp className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Upline</span>
        </div>
        {upline ? (
          <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-gold)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--gc-radius-full)", background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gc-btn-primary-text)", fontSize: "var(--gc-text-sm)", fontWeight: 600, flexShrink: 0 }}>{(upline.firstName || "U").charAt(0)}</div>
            <div>
              <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{upline.firstName} {upline.lastName}</div>
              {upline.email && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{upline.email}</div>}
              {upline.phone && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{fmtPhone(upline.phone)}</div>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--gc-radius-full)", backgroundColor: "var(--gc-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
            </div>
            <div>
              <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Gold Coast Financial Partners, LLC</div>
              <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Agency · Naperville, IL</div>
            </div>
          </div>
        )}
      </div>

      {/* Organization Info */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Organization</span>
        </div>
        {isPlaced ? (
          <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.6 }}>
            You are contracted under Gold Coast Financial Partners, LLC (d/b/a Heritage Life Solutions) as a {LEVEL_LABELS[h?.level] || "Licensed Agent"} with a {h?.contractLevel || "—"}% contract level.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-text-muted)" }} />
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", lineHeight: 1.6 }}>
              You are contracted under Gold Coast Financial Partners, LLC (d/b/a Heritage Life Solutions). Your hierarchy placement and team structure will be assigned by your administrator once your contracting is fully processed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
