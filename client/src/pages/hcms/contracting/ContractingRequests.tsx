import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink, Eye, X as XIcon } from "lucide-react";
import { Link } from "wouter";

interface Request {
  carrier: string; state: string; date: string; status: "draft" | "submitted" | "returned";
  completionPct?: number; missingItems?: string;
  submittedDate?: string; expectedDays?: number; daysSinceSubmit?: number;
  result?: "appointed" | "denied" | "incomplete";
  returnDate?: string; carrierResponse?: string; writingNumber?: string;
}

interface AgentRequests { agentId: string; agent: string; requests: Request[]; }

const MOCK: AgentRequests[] = [
  { agentId: "1", agent: "Sarah Mitchell", requests: [
    { carrier: "Americo", state: "IL", date: "2026-04-10", status: "submitted", submittedDate: "2026-04-10", expectedDays: 7, daysSinceSubmit: 5 },
    { carrier: "Mutual of Omaha", state: "IL", date: "2026-03-01", status: "returned", result: "appointed", returnDate: "2026-03-15", writingNumber: "MOO-445821", carrierResponse: "Appointment confirmed" },
    { carrier: "Transamerica", state: "IL", date: "2026-02-15", status: "returned", result: "appointed", returnDate: "2026-03-01", writingNumber: "TRA-118904", carrierResponse: "Appointment confirmed" },
  ]},
  { agentId: "2", agent: "James Rodriguez", requests: [
    { carrier: "Globe Life", state: "TX", date: "2026-03-10", status: "returned", result: "denied", returnDate: "2026-03-25", carrierResponse: "Background check discrepancy — additional documentation required" },
  ]},
  { agentId: "3", agent: "Michael Chen", requests: [
    { carrier: "North American", state: "CA", date: "2026-04-05", status: "submitted", submittedDate: "2026-04-06", expectedDays: 10, daysSinceSubmit: 9 },
    { carrier: "Corebridge Financial", state: "CA", date: "2026-01-20", status: "returned", result: "appointed", returnDate: "2026-02-10", writingNumber: "CBF-112204", carrierResponse: "Appointment confirmed" },
  ]},
  { agentId: "4", agent: "Emily Watson", requests: [
    { carrier: "Mutual of Omaha", state: "FL", date: "2026-03-28", status: "submitted", submittedDate: "2026-03-29", expectedDays: 5, daysSinceSubmit: 17 },
  ]},
  { agentId: "5", agent: "David Park", requests: [
    { carrier: "National Life Group", state: "NY", date: "2026-03-20", status: "submitted", submittedDate: "2026-03-21", expectedDays: 14, daysSinceSubmit: 25 },
  ]},
  { agentId: "6", agent: "Lisa Thompson", requests: [
    { carrier: "Foresters Financial", state: "AZ", date: "2026-02-01", status: "returned", result: "incomplete", returnDate: "2026-02-20", carrierResponse: "Missing AML certification — resubmit with updated documentation" },
  ]},
  { agentId: "7", agent: "Robert Kim", requests: [
    { carrier: "Mutual of Omaha", state: "GA", date: "2026-04-12", status: "draft", completionPct: 30, missingItems: "E&O cert, AML, bank details" },
  ]},
  { agentId: "8", agent: "Amanda Torres", requests: [
    { carrier: "Transamerica", state: "CO", date: "2026-04-11", status: "draft", completionPct: 65, missingItems: "Direct deposit form" },
  ]},
  { agentId: "9", agent: "Jack Cook", requests: [] },
];

const allReqs = MOCK.flatMap(a => a.requests);
const tabs = ["All Agents", "Has Drafts", "Awaiting Carrier", "Has Returns"] as const;

const statusColor = (s: string) => s === "draft" ? "var(--gc-status-pending)" : s === "submitted" ? "var(--gc-status-review)" : "var(--gc-status-active)";
const resultBadge = (r?: string) => r === "appointed" ? <GCStatusBadge status="active" /> : r === "denied" ? <GCStatusBadge status="rejected" /> : r === "incomplete" ? <GCStatusBadge status="warning" /> : null;

export default function ContractingRequests() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentRequests | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const PER_PAGE = 5;

  const counts = useMemo(() => ({
    all: MOCK.length,
    hasDrafts: MOCK.filter(a => a.requests.some(r => r.status === "draft")).length,
    awaiting: MOCK.filter(a => a.requests.some(r => r.status === "submitted")).length,
    hasReturns: MOCK.filter(a => a.requests.some(r => r.status === "returned")).length,
    totalAppointed: allReqs.filter(r => r.result === "appointed").length,
    totalDrafts: allReqs.filter(r => r.status === "draft").length,
    totalSubmitted: allReqs.filter(r => r.status === "submitted").length,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Has Drafts") return MOCK.filter(a => a.requests.some(r => r.status === "draft"));
    if (tab === "Awaiting Carrier") return MOCK.filter(a => a.requests.some(r => r.status === "submitted"));
    if (tab === "Has Returns") return MOCK.filter(a => a.requests.some(r => r.status === "returned"));
    return MOCK;
  }, [tab]);

  const cols: Column<AgentRequests>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "requests", label: "Requests", width: "8%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Request[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{(v as Request[]).length}</span> },
    { key: "agentId", label: "Status Breakdown", width: "28%", render: (_v, row) => {
      if (row.requests.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>No requests</span>;
      const d = row.requests.filter(r => r.status === "draft").length;
      const s = row.requests.filter(r => r.status === "submitted").length;
      const ret = row.requests.filter(r => r.status === "returned").length;
      return (
        <div className="flex items-center gap-3">
          {d > 0 && <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--gc-status-pending)" }} /><span style={{ color: "var(--gc-text-secondary)" }}>{d} draft{d > 1 ? "s" : ""}</span></span>}
          {s > 0 && <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--gc-status-review)" }} /><span style={{ color: "var(--gc-text-secondary)" }}>{s} submitted</span></span>}
          {ret > 0 && <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--gc-status-active)" }} /><span style={{ color: "var(--gc-text-secondary)" }}>{ret} returned</span></span>}
        </div>
      );
    }},
    { key: "agentId", label: "Carriers", width: "22%", render: (_v, row) => {
      if (row.requests.length === 0) return <span style={{ color: "var(--gc-text-muted)" }}>—</span>;
      const MAX = 3;
      const carriers = row.requests.map(r => r.carrier);
      return (
        <div className="flex flex-wrap items-center gap-1">
          {carriers.slice(0, MAX).map((c, i) => (
            <span key={i} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", backgroundColor: "var(--gc-surface-2)" }}>{c}</span>
          ))}
          {carriers.length > MAX && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)" }}>+{carriers.length - MAX}</span>}
        </div>
      );
    }},
    { key: "agentId", label: "Appointed", width: "10%", align: "center", render: (_v, row) => {
      const a = row.requests.filter(r => r.result === "appointed").length;
      return a > 0 ? <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-status-active)" }}>{a}</span> : <span style={{ color: "var(--gc-text-muted)" }}>0</span>;
    }},
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => row.requests.length > 0 ? (
      <button onClick={() => { setViewing(row); setPopupPage(0); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="Carrier Appointment Requests" subtitle="Track agent requests through SureLC" accentUnderline
        actions={<a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> Open SureLC</a>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Requests" value={allReqs.length} accentTop />
        <GCKPICard label="Drafts" value={counts.totalDrafts} accentTop delta={{ value: "In progress", positive: false }} />
        <GCKPICard label="Awaiting Carrier" value={counts.totalSubmitted} accentTop delta={{ value: "Submitted", positive: false }} />
        <GCKPICard label="Appointed" value={counts.totalAppointed} accentTop delta={{ value: "Confirmed", positive: true }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Has Drafts" ? counts.hasDrafts : t === "Awaiting Carrier" ? counts.awaiting : counts.hasReturns;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {/* View Agent Requests Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.requests.length / PER_PAGE);
        const paged = viewing.requests.slice(popupPage * PER_PAGE, (popupPage + 1) * PER_PAGE);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 600, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.requests.length} request{viewing.requests.length !== 1 ? "s" : ""} · {viewing.requests.filter(r => r.result === "appointed").length} appointed</div>
                </div>
                <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col gap-3">
                {paged.map((r, i) => (
                  <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${statusColor(r.status)}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{r.carrier}</div>
                        <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{r.state} · Started {r.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.result ? resultBadge(r.result) : <GCStatusBadge status={r.status === "draft" ? "pending" : "review"} />}
                      </div>
                    </div>

                    {/* Draft info */}
                    {r.status === "draft" && r.completionPct !== undefined && (
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div style={{ flex: 1, height: 5, backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${r.completionPct}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
                          </div>
                          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{r.completionPct}%</span>
                        </div>
                        {r.missingItems && <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>Missing: {r.missingItems}</div>}
                      </div>
                    )}

                    {/* Submitted info */}
                    {r.status === "submitted" && (
                      <div className="flex gap-4" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                        <span>Submitted: {r.submittedDate}</span>
                        <span>Expected: {r.expectedDays} biz days</span>
                        {r.daysSinceSubmit !== undefined && <span style={{ color: r.expectedDays && r.daysSinceSubmit > r.expectedDays ? "var(--gc-status-warning)" : "var(--gc-text-secondary)", fontWeight: 500 }}>Waiting: {r.daysSinceSubmit}d{r.expectedDays && r.daysSinceSubmit > r.expectedDays ? " ⚠" : ""}</span>}
                      </div>
                    )}

                    {/* Returned info */}
                    {r.status === "returned" && (
                      <div>
                        <div className="flex gap-4 mb-2" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                          <span>Returned: {r.returnDate}</span>
                          {r.writingNumber && <span>Writing #: <span style={{ fontFamily: "monospace", color: "var(--gc-gold)" }}>{r.writingNumber}</span></span>}
                        </div>
                        {r.carrierResponse && (
                          <div style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: r.result === "appointed" ? "color-mix(in srgb, var(--gc-status-active) 8%, transparent)" : "color-mix(in srgb, var(--gc-status-warning) 8%, transparent)", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: r.result === "appointed" ? "var(--gc-status-active)" : "var(--gc-status-warning)", lineHeight: 1.5 }}>
                            {r.carrierResponse}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Showing {popupPage * PER_PAGE + 1}–{Math.min((popupPage + 1) * PER_PAGE, viewing.requests.length)} of {viewing.requests.length}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPopupPage(p => Math.max(0, p - 1))} disabled={popupPage === 0} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage === 0 ? "default" : "pointer", opacity: popupPage === 0 ? 0.4 : 1, fontSize: "var(--gc-text-sm)" }}>Prev</button>
                    <button onClick={() => setPopupPage(p => Math.min(totalPages - 1, p + 1))} disabled={popupPage >= totalPages - 1} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage >= totalPages - 1 ? "default" : "pointer", opacity: popupPage >= totalPages - 1 ? 0.4 : 1, fontSize: "var(--gc-text-sm)" }}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
