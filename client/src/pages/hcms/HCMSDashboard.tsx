import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCBarChart, type Column } from "@/components/gc";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Users, FileSignature, Building2, ShieldCheck, ExternalLink, Plus, UserCheck, Send, Copy, Check } from "lucide-react";

// Recent applications
const APPLICATIONS = [
  { id: "1", name: "Jessica Davis", submittedAt: "2026-04-13", docsComplete: 4, docsTotal: 9, status: "pending_review" },
  { id: "2", name: "Robert Kim", submittedAt: "2026-04-12", docsComplete: 2, docsTotal: 9, status: "pending_review" },
  { id: "3", name: "Amanda Torres", submittedAt: "2026-04-11", docsComplete: 7, docsTotal: 9, status: "in_review" },
  { id: "4", name: "Christopher Lee", submittedAt: "2026-04-09", docsComplete: 9, docsTotal: 9, status: "in_review" },
  { id: "5", name: "Daniel Martinez", submittedAt: "2026-04-08", docsComplete: 3, docsTotal: 9, status: "pending_review" },
];

// Compliance alerts
const ALERTS = [
  { id: "1", severity: "critical", agent: "James Rodriguez", issue: "TX License expires in 12 days" },
  { id: "2", severity: "critical", agent: "David Park", issue: "E&O Certificate expires in 8 days" },
  { id: "3", severity: "warning", agent: "Emily Watson", issue: "Active in FL without FL license" },
  { id: "4", severity: "warning", agent: "Jennifer Wu", issue: "Contracting incomplete — 18 days" },
  { id: "5", severity: "info", agent: "Sarah Mitchell", issue: "IL License expires in 75 days" },
];

// Carrier appointment data
const CARRIER_STATUS = [
  { name: "Mutual of Omaha", value: 8 }, { name: "Transamerica", value: 6 },
  { name: "Americo", value: 5 }, { name: "Corebridge", value: 4 },
  { name: "National Life", value: 3 }, { name: "North American", value: 2 },
];

// Activity feed
const ACTIVITY = [
  { text: "Jessica Davis submitted contracting application", time: "2h ago", icon: FileSignature, color: "var(--gc-gold)" },
  { text: "Sarah Mitchell appointed with Mutual of Omaha — Writing #MOO-445821", time: "5h ago", icon: Building2, color: "var(--gc-status-active)" },
  { text: "James Rodriguez — TX license expiration alert (12 days)", time: "1d ago", icon: AlertTriangle, color: "var(--gc-status-warning)" },
  { text: "Michael Chen approved — all 9 documents complete", time: "1d ago", icon: Users, color: "var(--gc-status-active)" },
  { text: "Emily Watson signed NDA via signature pad", time: "2d ago", icon: FileSignature, color: "var(--gc-gold)" },
  { text: "David Park E&O certificate expiring — renewal required", time: "2d ago", icon: ShieldCheck, color: "var(--gc-status-terminated)" },
];

const sevColor: Record<string, string> = { critical: "var(--gc-status-terminated)", warning: "var(--gc-status-warning)", info: "var(--gc-status-review)" };

const appCols: Column<typeof APPLICATIONS[0]>[] = [
  { key: "name", label: "Agent", sortable: true, render: (v, row) => <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
  { key: "submittedAt", label: "Submitted", sortable: true },
  { key: "docsComplete", label: "Docs", render: (v, row) => (
    <div className="flex items-center gap-2">
      <div style={{ width: 48, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(v / row.docsTotal) * 100}%`, backgroundColor: v === row.docsTotal ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
      </div>
      <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{v}/{row.docsTotal}</span>
    </div>
  )},
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
];

const alertCols: Column<typeof ALERTS[0]>[] = [
  { key: "severity", label: "", render: (v) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: sevColor[v] }} /> },
  { key: "agent", label: "Agent" },
  { key: "issue", label: "Issue" },
];

// Assign reviewer dialog
const REVIEWERS = ["Jack Cook", "Nicholas Gallagher", "Gaetano"];
const PENDING_AGENTS = APPLICATIONS.filter(a => a.status === "pending_review");

export default function HCMSDashboard() {
  const [showAssign, setShowAssign] = useState(false);
  const [assignAgent, setAssignAgent] = useState("");
  const [assignReviewer, setAssignReviewer] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [sendName, setSendName] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const applicationUrl = typeof window !== "undefined" ? `${window.location.origin}/apply` : "/apply";

  const docsIncomplete = APPLICATIONS.filter(a => a.docsComplete < a.docsTotal).length;

  return (
    <div>
      <GCPageHeader title="Command Center" subtitle="Agent contracting, carrier tracking & compliance overview" accentUnderline />

      {/* KPIs — all clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <GCKPICard label="New Applications" value={5} accentTop delta={{ value: "+3 this week", positive: true }} href="/hcms/contracting" />
        <GCKPICard label="Active Agents" value={34} accentTop href="/hcms/agents" />
        <GCKPICard label="Pending in SureLC" value={8} accentTop delta={{ value: "Awaiting", positive: false }} href="/hcms/contracting/requests" />
        <GCKPICard label="Compliance Alerts" value={5} accentTop delta={{ value: "2 critical", positive: false }} />
        <GCKPICard label="Docs Incomplete" value={docsIncomplete} accentTop delta={{ value: `${docsIncomplete} of ${APPLICATIONS.length} agents`, positive: false }} href="/hcms/contracting" />
        <GCKPICard label="Returned from Carrier" value={2} accentTop delta={{ value: "Action needed", positive: false }} href="/hcms/contracting/requests" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setShowSend(true)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, border: "none", cursor: "pointer" }}>
          <Send className="w-4 h-4" /> Send Application
        </button>
        <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="no-underline flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer" }}>
          <ExternalLink className="w-4 h-4" /> Open SureLC
        </a>
        <button onClick={() => setShowAssign(true)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer" }}>
          <UserCheck className="w-4 h-4" /> Assign Reviewer
        </button>
      </div>

      {/* Tables: Applications + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Recent Applications</span>
            <Link href="/hcms/contracting"><span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", cursor: "pointer" }}>View all <ArrowRight className="w-3 h-3" /></span></Link>
          </div>
          <GCDataTable columns={appCols} data={APPLICATIONS} pageSize={5} />
        </div>

        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Compliance Alerts</span>
          </div>
          <GCDataTable columns={alertCols} data={ALERTS} pageSize={5} />
        </div>
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GCBarChart data={CARRIER_STATUS} title="Active Appointments by Carrier" valueFormatter={v => `${v} agents`} />

        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>Recent Activity</div>
          <div className="flex flex-col gap-2">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3" style={{ padding: "var(--gc-space-2) 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--gc-border-subtle)" : "none" }}>
                <div style={{ padding: "var(--gc-space-1)", borderRadius: "var(--gc-radius-full)", backgroundColor: `color-mix(in srgb, ${a.color} 15%, transparent)`, flexShrink: 0, marginTop: 2 }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Reviewer Dialog */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowAssign(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Assign Reviewer</div>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Pending Application</label>
                <select value={assignAgent} onChange={e => setAssignAgent(e.target.value)} style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none", appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B8A898' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="">Select agent...</option>
                  {PENDING_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name} — submitted {a.submittedAt}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Reviewer</label>
                <select value={assignReviewer} onChange={e => setAssignReviewer(e.target.value)} style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none", appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B8A898' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="">Select reviewer...</option>
                  {REVIEWERS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAssign(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setShowAssign(false); setAssignAgent(""); setAssignReviewer(""); }} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Application Dialog */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { setShowSend(false); setSent(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Send Application</div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Send the contracting application link to a prospective agent via email.</p>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Check className="w-10 h-10" style={{ color: "var(--gc-status-active)" }} />
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Application Sent!</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>Email sent to {sendEmail}</div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Agent Name</label>
                    <input value={sendName} onChange={e => setSendName(e.target.value)} placeholder="Full name" style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email Address</label>
                    <input value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="agent@email.com" type="email" style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" }} />
                  </div>
                </div>
                <div style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", marginBottom: "var(--gc-space-4)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Or copy application link</div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={applicationUrl} style={{ flex: 1, padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }} />
                    <button onClick={() => { navigator.clipboard.writeText(applicationUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: copied ? "var(--gc-status-active)" : "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)", whiteSpace: "nowrap" as const }}>
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowSend(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => { setSent(true); setTimeout(() => { setSent(false); setShowSend(false); setSendName(""); setSendEmail(""); }, 2000); }} disabled={!sendEmail.trim()} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: sendEmail.trim() ? "pointer" : "not-allowed", fontWeight: 500, opacity: sendEmail.trim() ? 1 : 0.5 }}>
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
