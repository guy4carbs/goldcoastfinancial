import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Plus, Clock, CheckCircle, AlertTriangle, Send, FileText, X, Building2, Loader2 } from "lucide-react";
import { CustomSelect } from "@/pages/apply/steps/StepAddress";
import { csrfHeaders } from "@/lib/queryClient";

// Wave 4 — carrier list now comes from /api/agent-portal/carriers/available
// which only returns carriers the agent's agency holds an active MPA with.
// The hardcoded fallback is gone.
interface AvailableCarrier { id: string; name: string; short_name?: string | null }

const inputStyle: React.CSSProperties = { width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none" };

interface ContractRequest { id: string; carrier: string; states: string[]; status: string; returnedReason?: string; createdAt: string; }

export default function AgentRequests() {
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<"drafts" | "awaiting" | "returned">("drafts");
  const [showNew, setShowNew] = useState(false);
  const [requests, setRequests] = useState<ContractRequest[]>([]);
  const [availableCarriers, setAvailableCarriers] = useState<AvailableCarrier[]>([]);
  const [carriersLoading, setCarriersLoading] = useState(true);
  const [carriersError, setCarriersError] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [newStates, setNewStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Wave 4 hotfix — the available-carriers fetch is decoupled from the page-level
  // error guard. A failure to load carriers shows an inline error inside the
  // carrier picker; it does NOT take down the whole requests page.
  useEffect(() => {
    // Critical fetches: profile + requests. Failure here = whole page error.
    Promise.all([
      fetch("/api/agent-portal/me", { credentials: "include" }).then(r => { if (!r.ok) throw new Error("auth"); return r.json(); }),
      fetch("/api/agent-portal/requests", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    ]).then(([me, reqs]) => {
      if (me?.profile) setProfile(me.profile);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setLoading(false);
    }).catch(e => { setError(e.message === "auth" ? "Please log in again" : "Failed to load requests"); setLoading(false); });

    // Non-critical: available carriers. Errors are surfaced inline inside the
    // carrier picker only, never as a page-level failure.
    fetch("/api/agent-portal/carriers/available", { credentials: "include" })
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(avail => {
        setAvailableCarriers(Array.isArray(avail) ? avail : []);
        setCarriersError("");
        setCarriersLoading(false);
      })
      .catch(() => {
        setAvailableCarriers([]);
        setCarriersError("Unable to load available carriers. Try refreshing.");
        setCarriersLoading(false);
      });
  }, []);

  const carrierNameSet = new Set(availableCarriers.map(c => c.name));
  const carrierOptions = availableCarriers.map(c => ({ value: c.name, label: c.name }));

  const addRequest = async () => {
    if (!newCarrier || newStates.length === 0 || !carrierNameSet.has(newCarrier)) return;
    setCreating(true); setActionError("");
    try {
      const resp = await fetch("/api/agent-portal/requests", { method: "POST", headers: { "Content-Type": "application/json", ...(await csrfHeaders()) }, credentials: "include", body: JSON.stringify({ carrier: newCarrier, states: newStates }) });
      const data = await resp.json();
      if (resp.ok && data.id) {
        setRequests(prev => [{ ...data, states: Array.isArray(data.states) ? data.states : (data.states || "").split(","), returnedReason: data.returnedReason || null }, ...prev]);
        setNewCarrier(""); setNewStates([]); setShowNew(false);
      } else { setActionError(data.error || "Failed to create request"); }
    } catch { setActionError("Network error — please try again"); }
    setCreating(false);
  };

  const submitRequest = async (id: string) => {
    setSubmitting(id); setActionError("");
    try {
      const resp = await fetch(`/api/agent-portal/requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...(await csrfHeaders()) }, credentials: "include", body: JSON.stringify({ status: "awaiting_carrier" }) });
      if (resp.ok) { setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "awaiting_carrier" } : r)); }
      else { const data = await resp.json().catch(() => ({})); setActionError(data.error || "Failed to submit"); }
    } catch { setActionError("Network error"); }
    setSubmitting(null);
  };

  const deleteRequest = async (id: string) => {
    setDeleting(id); setActionError("");
    try {
      const resp = await fetch(`/api/agent-portal/requests/${id}`, { method: "DELETE", headers: { ...(await csrfHeaders()) }, credentials: "include" });
      if (resp.ok) { setRequests(prev => prev.filter(r => r.id !== id)); }
      else { setActionError("Failed to delete request"); }
    } catch { setActionError("Network error"); }
    setDeleting(null);
  };

  // Error state
  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="Contracting Requests" subtitle="Submit and track your carrier contracting requests" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load requests</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  // licensed_states comes back as a Postgres text[] (already an array) for
  // newer profiles, but legacy rows stored it as a CSV string. Coerce both.
  const agentStates: string[] = (() => {
    const raw = profile?.licensedStates;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((s: any) => String(s).trim()).filter(Boolean);
    if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  })();

  const tabs = [
    { key: "drafts" as const, label: "Drafts", count: requests.filter(r => r.status === "draft").length, icon: FileText },
    { key: "awaiting" as const, label: "Awaiting Carriers", count: requests.filter(r => r.status === "awaiting_carrier").length, icon: Clock },
    { key: "returned" as const, label: "Returned Carriers", count: requests.filter(r => r.status === "returned").length, icon: CheckCircle },
  ];

  const filtered = requests.filter(r => {
    if (tab === "drafts") return r.status === "draft";
    if (tab === "awaiting") return r.status === "awaiting_carrier";
    return r.status === "returned";
  });

  return (
    <div>
      <GCPageHeader title="Contracting Requests" subtitle="Submit and track your carrier contracting requests" accentUnderline />

      {/* Action error */}
      {actionError && (
        <div className="flex items-center justify-between mb-4" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{actionError}</span>
          </div>
          <button onClick={() => setActionError("")} style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer" }}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Tabs + New Request */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} data-tour-id={t.key === "drafts" ? "agent-requests-tab-drafts" : t.key === "awaiting" ? "agent-requests-tab-awaiting" : "agent-requests-tab-returned"} onClick={() => setTab(t.key)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: `1px solid ${tab === t.key ? "var(--gc-gold)" : "var(--gc-border)"}`, backgroundColor: tab === t.key ? "color-mix(in srgb, var(--gc-gold) 10%, transparent)" : "var(--gc-surface)", color: tab === t.key ? "var(--gc-gold)" : "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: "var(--gc-radius-full)", backgroundColor: tab === t.key ? "var(--gc-gold)" : "var(--gc-surface-2)", color: tab === t.key ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)", fontSize: "10px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.count}</span>}
            </button>
          ))}
        </div>
        <button data-tour-id="agent-requests-new" onClick={() => { setShowNew(true); setActionError(""); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* New Request Form */}
      {showNew && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>New Contracting Request</span>
            <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", color: "var(--gc-text-muted)", cursor: "pointer" }}><X className="w-4 h-4" /></button>
          </div>
          <div className="mb-4">
            <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Carrier *</label>
            {/* Wave 4 — only carriers the agency holds an active MPA with appear here. */}
            <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)", fontStyle: "italic" }}>
              Only carriers your agency holds active contracts with are shown. To request a new carrier, ask your founder.
            </p>
            {carriersLoading ? (
              <div className="flex items-center gap-2" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)" }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--gc-gold)" }} />
                <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Loading available carriers…</p>
              </div>
            ) : carriersError ? (
              <div className="flex items-center gap-2" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", borderRadius: "var(--gc-radius-sm)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
                <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{carriersError}</p>
              </div>
            ) : availableCarriers.length === 0 ? (
              <div style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)" }}>
                <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                  Your agency doesn't have any active carrier contracts yet. Ask your founder to add carriers in Agency Management → Carriers.
                </p>
              </div>
            ) : (
              <CustomSelect value={newCarrier} onChange={setNewCarrier} options={carrierOptions} placeholder="Select carrier" inputStyle={inputStyle} />
            )}
          </div>
          {agentStates.length > 0 ? (
            <div className="mb-4">
              <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>States * ({newStates.length} selected)</label>
              <div className="flex flex-wrap gap-1.5">
                {agentStates.map(s => (
                  <button key={s} onClick={() => setNewStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{ padding: "6px 12px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 600, border: `1px solid ${newStates.includes(s) ? "var(--gc-gold)" : "var(--gc-border)"}`, backgroundColor: newStates.includes(s) ? "color-mix(in srgb, var(--gc-gold) 15%, transparent)" : "transparent", color: newStates.includes(s) ? "var(--gc-gold)" : "var(--gc-text-muted)", cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
              <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No licensed states on file. Contact your administrator to update your license information.</p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Cancel</button>
            <button onClick={addRequest} disabled={!newCarrier || newStates.length === 0 || creating} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: newCarrier && newStates.length > 0 && !creating ? "pointer" : "not-allowed", fontSize: "var(--gc-text-sm)", fontWeight: 500, opacity: newCarrier && newStates.length > 0 && !creating ? 1 : 0.5 }}>
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} {creating ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </div>
      )}

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div data-tour-id="agent-requests-list" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-8)", textAlign: "center" }}>
          {tab === "drafts" ? <><FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gc-text-muted)", opacity: 0.4 }} /><p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No draft requests. Click "New Request" to start a carrier contracting request.</p></>
          : tab === "awaiting" ? <><Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gc-text-muted)", opacity: 0.4 }} /><p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No requests currently awaiting carrier response.</p></>
          : <><CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gc-text-muted)", opacity: 0.4 }} /><p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No returned carriers yet. Carriers that have been processed and returned for your use will appear here.</p></>}
        </div>
      ) : (
        <div data-tour-id="agent-requests-list" className="flex flex-col gap-2">
          {filtered.map(req => (
            <div key={req.id} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", padding: "var(--gc-space-3)", borderLeft: `3px solid ${req.status === "returned" ? "var(--gc-status-active)" : req.status === "awaiting_carrier" ? "var(--gc-gold)" : "var(--gc-border)"}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                  <div>
                    <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{req.carrier}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(Array.isArray(req.states) ? req.states : []).map(s => <span key={s} style={{ padding: "1px 6px", fontSize: "10px", fontWeight: 600, borderRadius: "var(--gc-radius-sm)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)", color: "var(--gc-gold)", border: "1px solid color-mix(in srgb, var(--gc-gold) 25%, transparent)" }}>{s}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === "draft" && (
                    <>
                      <button onClick={() => submitRequest(req.id)} disabled={submitting === req.id} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: submitting === req.id ? "wait" : "pointer", fontSize: "var(--gc-text-xs)", fontWeight: 500 }}>
                        {submitting === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Submit
                      </button>
                      <button onClick={() => deleteRequest(req.id)} disabled={deleting === req.id} style={{ padding: "var(--gc-space-1)", background: "none", border: "none", color: deleting === req.id ? "var(--gc-text-muted)" : "var(--gc-status-terminated)", cursor: deleting === req.id ? "wait" : "pointer" }}>
                        {deleting === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                  {req.status === "awaiting_carrier" && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontWeight: 500 }}>Awaiting Response</span>}
                  {req.status === "returned" && <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", fontWeight: 500 }}><CheckCircle className="w-3 h-3" /> Ready</span>}
                </div>
              </div>
              {req.status === "returned" && req.returnedReason && <div className="mt-2" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", padding: "var(--gc-space-1) var(--gc-space-2)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>{req.returnedReason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
