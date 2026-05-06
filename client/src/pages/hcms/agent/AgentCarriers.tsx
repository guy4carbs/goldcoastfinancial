import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Building2, Clock, CheckCircle, Loader2, AlertTriangle, FileText, Send, Info } from "lucide-react";
import { Link } from "wouter";

interface ContractRequest { id: string; carrier: string; states: string[]; status: string; returnedReason?: string; createdAt: string; }

export default function AgentCarriers() {
  const [data, setData] = useState<any>(null);
  const [requests, setRequests] = useState<ContractRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent-portal/me", { credentials: "include" }).then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); }),
      fetch("/api/agent-portal/requests", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([me, reqs]) => {
      if (me?.user) setData(me); else setError("Profile data unavailable");
      setRequests(Array.isArray(reqs) ? reqs : []);
      setLoading(false);
    }).catch(e => { setError(e.message || "Network error"); setLoading(false); });
  }, []);

  // Error state
  if (error && !data) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="My Carriers" subtitle="Your carrier appointments and contracting status" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load carriers</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};
  const checklist = data.checklist || { allCompleted: false };
  const status = profile.approvalStatus || "pending_review";
  const isApproved = status === "approved";
  const allSigned = checklist.allCompleted || false;

  const draftRequests = requests.filter(r => r.status === "draft");
  const awaitingRequests = requests.filter(r => r.status === "awaiting_carrier");
  const returnedRequests = requests.filter(r => r.status === "returned");

  return (
    <div>
      <GCPageHeader title="My Carriers" subtitle="Your carrier appointments and contracting status" accentUnderline />

      {/* Info Banner */}
      <div data-tour-id="agent-carriers-request" className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-gold) 20%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
        <Building2 className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
          Carrier appointments are managed by Gold Coast Financial. Submit contracting requests from the{" "}
          <Link href="/hcms/my/requests"><span style={{ color: "var(--gc-gold)", fontWeight: 500, cursor: "pointer" }}>Requests page</span></Link> to get appointed.
        </span>
      </div>

      {/* Contracting Status */}
      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contracting Status</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Application</span>
            <div className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: isApproved ? "var(--gc-status-active)" : "var(--gc-gold)", marginTop: 4 }}>
              {isApproved ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {isApproved ? "Approved" : "Pending Review"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Documents Signed</span>
            <div className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: allSigned ? "var(--gc-status-active)" : "var(--gc-text-primary)", marginTop: 4 }}>
              {allSigned ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {allSigned ? "3/3 Complete" : "In Progress"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Carrier Requests</span>
            <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: requests.length > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)", marginTop: 4 }}>
              {requests.length > 0 ? `${requests.length} total` : "None submitted"}
            </div>
          </div>
        </div>
      </div>

      {/* Returned Carriers — Ready to Use */}
      {returnedRequests.length > 0 && (
        <div data-tour-id="agent-carriers-appointed" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-status-active)", fontWeight: 600 }}>Active Carriers</span>
          </div>
          <div className="flex flex-col gap-2">
            {returnedRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-active)" }}>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                  <div>
                    <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{req.carrier}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(Array.isArray(req.states) ? req.states : []).map(s => <span key={s} style={{ padding: "1px 6px", fontSize: "10px", fontWeight: 600, borderRadius: "var(--gc-radius-sm)", backgroundColor: "color-mix(in srgb, var(--gc-status-active) 12%, transparent)", color: "var(--gc-status-active)", border: "1px solid color-mix(in srgb, var(--gc-status-active) 25%, transparent)" }}>{s}</span>)}
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", fontWeight: 500 }}><CheckCircle className="w-3 h-3" /> Ready</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awaiting Carrier Response */}
      {awaitingRequests.length > 0 && (
        <div data-tour-id="agent-carriers-pending" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Awaiting Carrier Response</span>
          </div>
          <div className="flex flex-col gap-2">
            {awaitingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-gold)" }}>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
                  <div>
                    <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{req.carrier}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(Array.isArray(req.states) ? req.states : []).map(s => <span key={s} style={{ padding: "1px 6px", fontSize: "10px", fontWeight: 600, borderRadius: "var(--gc-radius-sm)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)", color: "var(--gc-gold)" }}>{s}</span>)}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontWeight: 500 }}>Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Requests */}
      {draftRequests.length > 0 && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", fontWeight: 600 }}>Draft Requests</span>
          </div>
          <div className="flex flex-col gap-2">
            {draftRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-border)" }}>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)" }}>{req.carrier}</span>
                </div>
                <Link href="/hcms/my/requests"><span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}><Send className="w-3 h-3" /> Complete</span></Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)", textAlign: "center" }}>
          <Building2 className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gc-text-muted)", opacity: 0.4 }} />
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>
            {isApproved
              ? "No carrier requests yet. Submit a contracting request to get appointed with a carrier."
              : "Carrier appointments will be available once your application is approved and contracting is complete."}
          </p>
          {isApproved && (
            <Link href="/hcms/my/requests">
              <button className="flex items-center gap-1 mx-auto" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
                <Send className="w-3.5 h-3.5" /> New Contracting Request
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
