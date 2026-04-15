import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { CheckCircle, X as XIcon, Eye, AlertTriangle } from "lucide-react";

interface Training { type: string; completionDate: string; expirationDate: string; status: "active" | "expiring" | "expired" | "missing"; daysUntilExpiry: number | null; certOnFile: boolean; }
interface AgentTrainings { agentId: string; agent: string; trainings: Training[]; }

const MOCK: AgentTrainings[] = [
  { agentId: "1", agent: "Sarah Mitchell", trainings: [
    { type: "AML", completionDate: "2026-01-15", expirationDate: "2027-01-15", status: "active", daysUntilExpiry: 275, certOnFile: true },
    { type: "CE Credits (IL)", completionDate: "2025-12-01", expirationDate: "2027-12-01", status: "active", daysUntilExpiry: 596, certOnFile: true },
    { type: "Compliance", completionDate: "2026-01-15", expirationDate: "2027-01-15", status: "active", daysUntilExpiry: 275, certOnFile: true },
  ]},
  { agentId: "2", agent: "James Rodriguez", trainings: [
    { type: "AML", completionDate: "2025-06-01", expirationDate: "2026-06-01", status: "active", daysUntilExpiry: 47, certOnFile: true },
    { type: "CE Credits (TX)", completionDate: "", expirationDate: "2026-04-30", status: "expired", daysUntilExpiry: null, certOnFile: false },
  ]},
  { agentId: "3", agent: "Michael Chen", trainings: [
    { type: "AML", completionDate: "2026-02-01", expirationDate: "2027-02-01", status: "active", daysUntilExpiry: 292, certOnFile: true },
    { type: "CE Credits (CA)", completionDate: "2025-09-15", expirationDate: "2027-09-15", status: "active", daysUntilExpiry: 518, certOnFile: true },
    { type: "Product Training (Americo)", completionDate: "2026-03-01", expirationDate: "", status: "active", daysUntilExpiry: null, certOnFile: true },
    { type: "Product Training (Corebridge)", completionDate: "2026-01-15", expirationDate: "", status: "active", daysUntilExpiry: null, certOnFile: true },
  ]},
  { agentId: "4", agent: "Emily Watson", trainings: [
    { type: "AML", completionDate: "", expirationDate: "", status: "missing", daysUntilExpiry: null, certOnFile: false },
    { type: "CE Credits (FL)", completionDate: "2025-08-01", expirationDate: "2027-08-01", status: "active", daysUntilExpiry: 474, certOnFile: true },
  ]},
  { agentId: "5", agent: "David Park", trainings: [
    { type: "AML", completionDate: "2025-11-01", expirationDate: "2026-11-01", status: "active", daysUntilExpiry: 200, certOnFile: true },
    { type: "CE Credits (NY)", completionDate: "2025-06-01", expirationDate: "2027-06-01", status: "active", daysUntilExpiry: 413, certOnFile: true },
    { type: "Compliance", completionDate: "2026-01-20", expirationDate: "2027-01-20", status: "active", daysUntilExpiry: 280, certOnFile: true },
  ]},
  { agentId: "6", agent: "Lisa Thompson", trainings: [
    { type: "AML", completionDate: "2025-09-01", expirationDate: "2026-09-01", status: "active", daysUntilExpiry: 139, certOnFile: true },
  ]},
  { agentId: "7", agent: "Robert Kim", trainings: [] },
  { agentId: "8", agent: "Amanda Torres", trainings: [
    { type: "AML", completionDate: "2026-04-01", expirationDate: "2027-04-01", status: "active", daysUntilExpiry: 351, certOnFile: true },
  ]},
  { agentId: "9", agent: "Jack Cook", trainings: [
    { type: "AML", completionDate: "2025-01-01", expirationDate: "2026-01-01", status: "expiring", daysUntilExpiry: 261, certOnFile: true },
    { type: "CE Credits (IL)", completionDate: "2025-01-01", expirationDate: "2027-01-01", status: "active", daysUntilExpiry: 626, certOnFile: true },
    { type: "Compliance", completionDate: "2025-06-01", expirationDate: "2026-06-01", status: "active", daysUntilExpiry: 47, certOnFile: true },
    { type: "Product Training (Mutual of Omaha)", completionDate: "2025-03-01", expirationDate: "", status: "active", daysUntilExpiry: null, certOnFile: true },
    { type: "Product Training (Transamerica)", completionDate: "2025-04-01", expirationDate: "", status: "active", daysUntilExpiry: null, certOnFile: true },
    { type: "Product Training (Americo)", completionDate: "2025-05-01", expirationDate: "", status: "active", daysUntilExpiry: null, certOnFile: true },
  ]},
];

const allTrainings = MOCK.flatMap(a => a.trainings);
const hasAML = (a: AgentTrainings) => a.trainings.some(t => t.type === "AML" && (t.status === "active" || t.status === "expiring"));
const amlStatus = (a: AgentTrainings) => {
  const aml = a.trainings.find(t => t.type === "AML");
  if (!aml) return "missing";
  return aml.status;
};

const tabs = ["All Agents", "AML Complete", "AML Missing/Expired", "No Trainings"] as const;

const FileIcon = ({ ok }: { ok: boolean }) => ok
  ? <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}><CheckCircle className="w-3.5 h-3.5" /> On File</span>
  : <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}><XIcon className="w-3.5 h-3.5" /> Missing</span>;

export default function ContractingTrainings() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentTrainings | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const PER_PAGE = 5;

  const counts = useMemo(() => ({
    all: MOCK.length,
    amlComplete: MOCK.filter(a => hasAML(a)).length,
    amlMissing: MOCK.filter(a => !hasAML(a) && a.trainings.length > 0).length + MOCK.filter(a => { const aml = a.trainings.find(t => t.type === "AML"); return aml && (aml.status === "expired" || aml.status === "missing"); }).length,
    noTrainings: MOCK.filter(a => a.trainings.length === 0).length,
    totalActive: allTrainings.filter(t => t.status === "active").length,
    totalCerts: allTrainings.filter(t => t.certOnFile).length,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "AML Complete") return MOCK.filter(a => hasAML(a));
    if (tab === "AML Missing/Expired") return MOCK.filter(a => !hasAML(a));
    if (tab === "No Trainings") return MOCK.filter(a => a.trainings.length === 0);
    return MOCK;
  }, [tab]);

  const cols: Column<AgentTrainings>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "trainings", label: "Total", width: "8%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Training[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)" }}>{(v as Training[]).length}</span> },
    { key: "agentId", label: "AML", width: "12%", render: (_v, row) => {
      const s = amlStatus(row);
      if (s === "active") return <span className="flex items-center gap-1" style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}><CheckCircle className="w-3.5 h-3.5" /> Complete</span>;
      if (s === "expiring") return <span className="flex items-center gap-1" style={{ color: "var(--gc-status-warning)", fontSize: "var(--gc-text-sm)" }}><AlertTriangle className="w-3.5 h-3.5" /> Expiring</span>;
      if (s === "expired") return <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}><XIcon className="w-3.5 h-3.5" /> Expired</span>;
      return <span className="flex items-center gap-1" style={{ color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}><XIcon className="w-3.5 h-3.5" /> Missing</span>;
    }},
    { key: "agentId", label: "Types", width: "30%", render: (_v, row) => {
      if (row.trainings.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>No trainings</span>;
      const types = Array.from(new Set(row.trainings.map(t => t.type.split(" (")[0])));
      return (
        <div className="flex flex-wrap gap-1">
          {types.map(t => (
            <span key={t} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 500, color: "var(--gc-text-secondary)", backgroundColor: "var(--gc-surface-2)" }}>{t}</span>
          ))}
        </div>
      );
    }},
    { key: "agentId", label: "Certs on File", width: "12%", render: (_v, row) => {
      const onFile = row.trainings.filter(t => t.certOnFile).length;
      return <span style={{ fontSize: "var(--gc-text-sm)", color: onFile === row.trainings.length && row.trainings.length > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{onFile}/{row.trainings.length}</span>;
    }},
    { key: "agentId", label: "Status", width: "10%", render: (_v, row) => {
      if (row.trainings.length === 0) return <GCStatusBadge status="warning" />;
      if (row.trainings.some(t => t.status === "expired" || t.status === "missing")) return <GCStatusBadge status="warning" />;
      return <GCStatusBadge status="active" />;
    }},
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => row.trainings.length > 0 ? (
      <button onClick={() => { setViewing(row); setPopupPage(0); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)" }}>
        <Eye className="w-3 h-3" /> View
      </button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="Trainings" subtitle="AML certification, CE credits, product training & compliance — AML is required for contracting" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="AML Certified" value={counts.amlComplete} accentTop delta={{ value: `${counts.all - counts.amlComplete} missing`, positive: false }} />
        <GCKPICard label="Active Certifications" value={counts.totalActive} accentTop />
        <GCKPICard label="No Trainings" value={counts.noTrainings} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Certificates on File" value={`${counts.totalCerts}/${allTrainings.length}`} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "AML Complete" ? counts.amlComplete : t === "AML Missing/Expired" ? MOCK.filter(a => !hasAML(a)).length : counts.noTrainings;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {/* View Trainings Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.trainings.length / PER_PAGE);
        const paged = viewing.trainings.slice(popupPage * PER_PAGE, (popupPage + 1) * PER_PAGE);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 560, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                  <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.trainings.length} training{viewing.trainings.length !== 1 ? "s" : ""} · {viewing.trainings.filter(t => t.certOnFile).length} certificates on file</div>
                </div>
                <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col gap-3">
                {paged.map((t, i) => (
                  <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${t.status === "active" ? "var(--gc-status-active)" : t.status === "expiring" ? "var(--gc-status-warning)" : "var(--gc-status-terminated)"}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{t.type}</div>
                      <div className="flex items-center gap-2">
                        <FileIcon ok={t.certOnFile} />
                        <GCStatusBadge status={t.status === "active" ? "active" : t.status === "expiring" ? "warning" : t.status === "expired" ? "expired" : "warning"} />
                      </div>
                    </div>
                    <div className="flex gap-6" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                      <span>Completed: <span style={{ color: "var(--gc-text-secondary)" }}>{t.completionDate || "Not completed"}</span></span>
                      {t.expirationDate && <span>Expires: <span style={{ color: t.status === "expired" ? "var(--gc-status-terminated)" : "var(--gc-text-secondary)", fontWeight: t.status === "expired" ? 600 : 400 }}>{t.expirationDate}</span>{t.daysUntilExpiry !== null && t.daysUntilExpiry <= 90 && <span style={{ color: "var(--gc-status-warning)", marginLeft: 4 }}>({t.daysUntilExpiry}d)</span>}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Showing {popupPage * PER_PAGE + 1}–{Math.min((popupPage + 1) * PER_PAGE, viewing.trainings.length)} of {viewing.trainings.length}</span>
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
