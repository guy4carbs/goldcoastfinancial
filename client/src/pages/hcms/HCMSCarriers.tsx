import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { ExternalLink, Eye, X as XIcon } from "lucide-react";

interface Appointment { carrier: string; writing: string; status: string; level: string; date: string; states: string; }
interface AgentCarriers { agentId: string; agent: string; appointments: Appointment[]; }

const MOCK: AgentCarriers[] = [
  { agentId: "1", agent: "Sarah Mitchell", appointments: [
    { carrier: "Mutual of Omaha", writing: "MOO-445821", status: "appointed", level: "85%", date: "2024-06-15", states: "IL" },
    { carrier: "Transamerica", writing: "TRA-118904", status: "appointed", level: "80%", date: "2024-07-01", states: "IL" },
    { carrier: "National Life Group", writing: "NLG-228110", status: "appointed", level: "82%", date: "2025-01-15", states: "IL, IN" },
    { carrier: "Americo", writing: "", status: "pending", level: "", date: "2026-04-01", states: "IL" },
  ]},
  { agentId: "2", agent: "James Rodriguez", appointments: [
    { carrier: "Transamerica", writing: "TRA-229015", status: "appointed", level: "78%", date: "2024-09-01", states: "TX" },
    { carrier: "Americo", writing: "AMR-334201", status: "appointed", level: "75%", date: "2025-02-01", states: "TX" },
    { carrier: "Corebridge Financial", writing: "", status: "pending", level: "", date: "2026-04-08", states: "TX" },
  ]},
  { agentId: "3", agent: "Michael Chen", appointments: [
    { carrier: "Mutual of Omaha", writing: "MOO-556932", status: "appointed", level: "90%", date: "2024-03-15", states: "CA" },
    { carrier: "Transamerica", writing: "TRA-330122", status: "appointed", level: "88%", date: "2024-05-01", states: "CA" },
    { carrier: "Americo", writing: "AMR-441003", status: "appointed", level: "85%", date: "2024-08-01", states: "CA" },
    { carrier: "Corebridge Financial", writing: "CBF-112204", status: "appointed", level: "90%", date: "2025-01-20", states: "CA" },
    { carrier: "National Life Group", writing: "NLG-339211", status: "appointed", level: "88%", date: "2025-04-01", states: "CA, NY" },
    { carrier: "North American", writing: "", status: "pending", level: "", date: "2026-04-05", states: "CA" },
  ]},
  { agentId: "4", agent: "Emily Watson", appointments: [
    { carrier: "Transamerica", writing: "TRA-441223", status: "appointed", level: "80%", date: "2025-06-01", states: "FL" },
    { carrier: "Mutual of Omaha", writing: "MOO-221334", status: "terminated", level: "70%", date: "2024-01-15", states: "FL" },
  ]},
  { agentId: "5", agent: "David Park", appointments: [
    { carrier: "Mutual of Omaha", writing: "MOO-667845", status: "appointed", level: "83%", date: "2024-04-01", states: "NY" },
    { carrier: "Americo", writing: "AMR-552134", status: "appointed", level: "80%", date: "2024-09-01", states: "NY" },
    { carrier: "Corebridge Financial", writing: "CBF-223315", status: "appointed", level: "83%", date: "2025-03-01", states: "NY, NJ" },
    { carrier: "North American", writing: "NAM-114502", status: "appointed", level: "80%", date: "2025-07-01", states: "NY" },
  ]},
  { agentId: "6", agent: "Lisa Thompson", appointments: [
    { carrier: "Transamerica", writing: "TRA-661102", status: "appointed", level: "78%", date: "2025-08-01", states: "AZ" },
  ]},
  { agentId: "7", agent: "Robert Kim", appointments: [] },
  { agentId: "8", agent: "Amanda Torres", appointments: [
    { carrier: "Transamerica", writing: "", status: "pending", level: "", date: "2026-04-11", states: "CO" },
  ]},
  { agentId: "9", agent: "Jack Cook", appointments: [
    { carrier: "Mutual of Omaha", writing: "MOO-100001", status: "appointed", level: "100%", date: "2022-01-15", states: "IL, IN, WI" },
    { carrier: "Transamerica", writing: "TRA-100002", status: "appointed", level: "100%", date: "2022-02-01", states: "IL, IN" },
    { carrier: "Americo", writing: "AMR-100003", status: "appointed", level: "100%", date: "2022-03-01", states: "IL" },
    { carrier: "Corebridge Financial", writing: "CBF-100004", status: "appointed", level: "100%", date: "2022-06-01", states: "IL, IN" },
    { carrier: "National Life Group", writing: "NLG-100005", status: "appointed", level: "100%", date: "2023-01-01", states: "IL, IN, WI" },
    { carrier: "North American", writing: "NAM-100006", status: "appointed", level: "100%", date: "2023-06-01", states: "IL" },
  ]},
];

const allAppts = MOCK.flatMap(a => a.appointments);
const tabs = ["All Agents", "Fully Appointed", "Has Pending", "No Appointments"] as const;
const MAX_CARRIERS_SHOWN = 3;

export default function HCMSCarriers() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentCarriers | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const PER_PAGE = 5;

  const counts = useMemo(() => ({
    all: MOCK.length,
    fullyAppointed: MOCK.filter(a => a.appointments.length > 0 && a.appointments.every(ap => ap.status === "appointed")).length,
    hasPending: MOCK.filter(a => a.appointments.some(ap => ap.status === "pending")).length,
    noAppts: MOCK.filter(a => a.appointments.length === 0).length,
    totalAppointed: allAppts.filter(a => a.status === "appointed").length,
    totalPending: allAppts.filter(a => a.status === "pending").length,
    totalTerminated: allAppts.filter(a => a.status === "terminated").length,
    uniqueCarriers: new Set(allAppts.map(a => a.carrier)).size,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Fully Appointed") return MOCK.filter(a => a.appointments.length > 0 && a.appointments.every(ap => ap.status === "appointed"));
    if (tab === "Has Pending") return MOCK.filter(a => a.appointments.some(ap => ap.status === "pending"));
    if (tab === "No Appointments") return MOCK.filter(a => a.appointments.length === 0);
    return MOCK;
  }, [tab]);

  const cols: Column<AgentCarriers>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "16%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "appointments", label: "Total", width: "7%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Appointment[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{(v as Appointment[]).length}</span> },
    { key: "agentId", label: "Appointed", width: "8%", align: "center", render: (_v, row) => {
      const c = row.appointments.filter(a => a.status === "appointed").length;
      return <span style={{ fontWeight: 600, color: c > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{c}</span>;
    }},
    { key: "agentId", label: "Pending", width: "8%", align: "center", render: (_v, row) => {
      const c = row.appointments.filter(a => a.status === "pending").length;
      return <span style={{ fontWeight: 500, color: c > 0 ? "var(--gc-status-pending)" : "var(--gc-text-muted)" }}>{c}</span>;
    }},
    { key: "agentId", label: "Carriers", width: "28%", render: (_v, row) => {
      if (row.appointments.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>No appointments</span>;
      const appointed = row.appointments.filter(a => a.status === "appointed");
      const shown = appointed.slice(0, MAX_CARRIERS_SHOWN);
      const remaining = appointed.length - MAX_CARRIERS_SHOWN;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {shown.map((a, i) => (
            <span key={i} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", backgroundColor: "color-mix(in srgb, var(--gc-status-active) 12%, transparent)" }}>{a.carrier}</span>
          ))}
          {remaining > 0 && <span onClick={() => { setViewing(row); setPopupPage(0); }} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)", cursor: "pointer" }}>+{remaining} more</span>}
          {row.appointments.some(a => a.status === "pending") && <span style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-status-pending)", backgroundColor: "color-mix(in srgb, var(--gc-status-pending) 12%, transparent)" }}>{row.appointments.filter(a => a.status === "pending").length} pending</span>}
        </div>
      );
    }},
    { key: "agentId", label: "Writing #s", width: "18%", render: (_v, row) => {
      const withWriting = row.appointments.filter(a => a.writing);
      if (withWriting.length === 0) return <span style={{ color: "var(--gc-text-muted)" }}>—</span>;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {withWriting.slice(0, 2).map((a, i) => <span key={i} style={{ fontFamily: "monospace", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)" }}>{a.writing}</span>)}
          {withWriting.length > 2 && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>+{withWriting.length - 2}</span>}
        </div>
      );
    }},
    { key: "agentId", label: "", width: "7%", align: "center", render: (_v, row) => row.appointments.length > 0 ? (
      <button onClick={() => { setViewing(row); setPopupPage(0); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="Carrier Appointments" subtitle="Agent-carrier appointments, writing numbers & SureLC tracking" accentUnderline
        actions={<a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> Open SureLC</a>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Appointments" value={counts.totalAppointed} accentTop delta={{ value: `${counts.uniqueCarriers} carriers`, positive: true }} />
        <GCKPICard label="Pending in SureLC" value={counts.totalPending} accentTop delta={{ value: "Awaiting", positive: false }} />
        <GCKPICard label="No Appointments" value={counts.noAppts} accentTop delta={{ value: counts.noAppts > 0 ? "Needs carriers" : "All covered", positive: counts.noAppts === 0 }} />
        <GCKPICard label="Terminated" value={counts.totalTerminated} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Fully Appointed" ? counts.fullyAppointed : t === "Has Pending" ? counts.hasPending : counts.noAppts;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {/* View Agent Carriers Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.appointments.length / PER_PAGE);
        const paged = viewing.appointments.slice(popupPage * PER_PAGE, (popupPage + 1) * PER_PAGE);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 620, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.appointments.length} appointment{viewing.appointments.length !== 1 ? "s" : ""} · {viewing.appointments.filter(a => a.status === "appointed").length} active</div>
                </div>
                <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col gap-3">
                {paged.map((a, i) => (
                  <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${a.status === "appointed" ? "var(--gc-status-active)" : a.status === "pending" ? "var(--gc-status-pending)" : "var(--gc-status-terminated)"}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div style={{ fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{a.carrier}</div>
                        <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{a.states} · Appointed {a.date}</div>
                      </div>
                      <GCStatusBadge status={a.status === "appointed" ? "active" : a.status === "pending" ? "pending" : "terminated"} />
                    </div>
                    <div className="flex gap-6" style={{ fontSize: "var(--gc-text-sm)" }}>
                      <span style={{ color: "var(--gc-text-muted)" }}>Writing #: {a.writing ? <span style={{ fontFamily: "monospace", color: "var(--gc-gold)" }}>{a.writing}</span> : <span style={{ fontStyle: "italic" }}>Pending</span>}</span>
                      {a.level && <span style={{ color: "var(--gc-text-muted)" }}>Commission: <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{a.level}</span></span>}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Showing {popupPage * PER_PAGE + 1}–{Math.min((popupPage + 1) * PER_PAGE, viewing.appointments.length)} of {viewing.appointments.length}</span>
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
