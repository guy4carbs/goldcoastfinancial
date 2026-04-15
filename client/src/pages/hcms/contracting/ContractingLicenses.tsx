import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { ExternalLink, RefreshCw, Eye, X as XIcon } from "lucide-react";

interface License { state: string; license: string; type: string; status: string; effective: string; expires: string; resident: boolean; }
interface AgentLicenses { agentId: string; agent: string; npn: string; licenses: License[]; }

const MOCK: AgentLicenses[] = [
  { agentId: "1", agent: "Sarah Mitchell", npn: "18842956", licenses: [
    { state: "IL", license: "IL-2024-18842", type: "Life & Health", status: "active", effective: "2024-01-15", expires: "2026-01-15", resident: true },
    { state: "IN", license: "IN-2024-99201", type: "Life & Health", status: "active", effective: "2024-03-01", expires: "2026-03-01", resident: false },
    { state: "WI", license: "WI-2025-33210", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01", resident: false },
  ]},
  { agentId: "2", agent: "James Rodriguez", npn: "22109845", licenses: [
    { state: "TX", license: "TX-2023-44521", type: "Life & Health", status: "expired", effective: "2023-06-01", expires: "2025-06-01", resident: true },
  ]},
  { agentId: "3", agent: "Michael Chen", npn: "33201478", licenses: [
    { state: "CA", license: "CA-2025-67123", type: "Life & Health", status: "active", effective: "2025-02-01", expires: "2027-02-01", resident: true },
    { state: "NY", license: "NY-2025-88201", type: "Life & Health", status: "active", effective: "2025-03-01", expires: "2027-03-01", resident: false },
  ]},
  { agentId: "4", agent: "Emily Watson", npn: "44120093", licenses: [
    { state: "FL", license: "FL-2024-33109", type: "Life & Health", status: "active", effective: "2024-08-15", expires: "2026-05-15", resident: true },
  ]},
  { agentId: "5", agent: "David Park", npn: "55098234", licenses: [
    { state: "NY", license: "NY-2024-55982", type: "Life Only", status: "active", effective: "2024-04-01", expires: "2026-04-01", resident: true },
    { state: "NJ", license: "NJ-2025-44123", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01", resident: false },
  ]},
  { agentId: "6", agent: "Lisa Thompson", npn: "66334201", licenses: [
    { state: "AZ", license: "AZ-2024-66712", type: "Life & Health", status: "active", effective: "2024-09-01", expires: "2026-09-01", resident: true },
  ]},
  { agentId: "7", agent: "Robert Kim", npn: "", licenses: [] },
  { agentId: "8", agent: "Amanda Torres", npn: "88201340", licenses: [
    { state: "CO", license: "CO-2025-77401", type: "Life & Health", status: "active", effective: "2025-07-01", expires: "2027-07-01", resident: true },
  ]},
];

const allLicenses = MOCK.flatMap(a => a.licenses);
const tabs = ["All Agents", "Licensed", "Unlicensed", "Expired"] as const;

export default function ContractingLicenses() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentLicenses | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const LICENSES_PER_PAGE = 5;

  const counts = useMemo(() => ({
    all: MOCK.length,
    licensed: MOCK.filter(a => a.licenses.length > 0).length,
    unlicensed: MOCK.filter(a => a.licenses.length === 0).length,
    expired: MOCK.filter(a => a.licenses.some(l => l.status === "expired")).length,
    totalLicenses: allLicenses.filter(l => l.status === "active").length,
    states: new Set(allLicenses.filter(l => l.status === "active").map(l => l.state)).size,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Licensed") return MOCK.filter(a => a.licenses.length > 0 && !a.licenses.some(l => l.status === "expired"));
    if (tab === "Unlicensed") return MOCK.filter(a => a.licenses.length === 0);
    if (tab === "Expired") return MOCK.filter(a => a.licenses.some(l => l.status === "expired"));
    return MOCK;
  }, [tab]);

  const hasExpired = (a: AgentLicenses) => a.licenses.some(l => l.status === "expired");
  const residentState = (a: AgentLicenses) => a.licenses.find(l => l.resident)?.state || "—";

  const cols: Column<AgentLicenses>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "npn", label: "NPN", width: "10%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
    { key: "licenses", label: "Licenses", width: "8%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as License[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)" }}>{(v as License[]).length}</span> },
    { key: "agentId", label: "States", width: "24%", render: (_v, row) => {
      if (row.licenses.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>No licenses</span>;
      const MAX_SHOWN = 5;
      const shown = row.licenses.slice(0, MAX_SHOWN);
      const remaining = row.licenses.length - MAX_SHOWN;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {shown.map(l => (
            <span key={l.state} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 600, color: l.status === "active" ? "var(--gc-status-active)" : "var(--gc-status-terminated)", backgroundColor: `color-mix(in srgb, ${l.status === "active" ? "var(--gc-status-active)" : "var(--gc-status-terminated)"} 12%, transparent)` }}>
              {l.state}{l.resident ? " ★" : ""}
            </span>
          ))}
          {remaining > 0 && (
            <span onClick={() => { setViewing(row); setPopupPage(0); }} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 600, color: "var(--gc-gold)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)", cursor: "pointer" }}>
              +{remaining} more
            </span>
          )}
        </div>
      );
    }},
    { key: "agent", label: "Resident", width: "10%", render: (_v, row) => <span style={{ fontWeight: 500 }}>{residentState(row)}</span> },
    { key: "agent", label: "Status", width: "12%", render: (_v, row) => row.licenses.length === 0 ? <GCStatusBadge status="warning" /> : hasExpired(row) ? <GCStatusBadge status="expired" /> : <GCStatusBadge status="active" /> },
    { key: "agent", label: "", width: "8%", align: "center", render: (_v, row) => row.licenses.length > 0 ? (
      <button onClick={() => { setViewing(row); setPopupPage(0); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)" }}>
        <Eye className="w-3 h-3" /> View
      </button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="State Licenses" subtitle="Agent license data synced from SureLC / NIPR — click View to see individual licenses" accentUnderline
        actions={<div className="flex gap-2">
          <button className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><RefreshCw className="w-3.5 h-3.5" /> Sync</button>
          <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> SureLC</a>
        </div>} />

      <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>Read-only — data sourced from SureLC / NIPR. Last synced: April 14, 2026 at 9:15 AM</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Licenses" value={counts.totalLicenses} accentTop />
        <GCKPICard label="Agents Licensed" value={counts.licensed} accentTop />
        <GCKPICard label="Unlicensed" value={counts.unlicensed} accentTop delta={{ value: "Need licensing", positive: false }} />
        <GCKPICard label="States Covered" value={counts.states} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Licensed" ? counts.licensed : t === "Unlicensed" ? counts.unlicensed : counts.expired;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name or NPN..." />

      {/* License Detail Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.licenses.length / LICENSES_PER_PAGE);
        const paged = viewing.licenses.slice(popupPage * LICENSES_PER_PAGE, (popupPage + 1) * LICENSES_PER_PAGE);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { setViewing(null); setPopupPage(0); }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 640, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                  <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>NPN: {viewing.npn || "Not assigned"} · {viewing.licenses.length} license{viewing.licenses.length !== 1 ? "s" : ""} across {new Set(viewing.licenses.map(l => l.state)).size} state{new Set(viewing.licenses.map(l => l.state)).size !== 1 ? "s" : ""}</div>
                </div>
                <button onClick={() => { setViewing(null); setPopupPage(0); }} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
              </div>

              {/* License Cards (paginated) */}
              {viewing.licenses.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {paged.map((l, i) => (
                    <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${l.status === "active" ? "var(--gc-status-active)" : "var(--gc-status-terminated)"}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", fontWeight: 600, color: "var(--gc-text-primary)" }}>{l.state}</span>
                          <div>
                            <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{l.type}</div>
                            <div style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{l.license}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {l.resident && <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 600, color: "var(--gc-gold)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)" }}>Resident</span>}
                          <GCStatusBadge status={l.status} />
                        </div>
                      </div>
                      <div className="flex gap-6" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                        <span>Effective: <span style={{ color: "var(--gc-text-secondary)" }}>{l.effective}</span></span>
                        <span>Expires: <span style={{ color: l.status === "expired" ? "var(--gc-status-terminated)" : "var(--gc-text-secondary)", fontWeight: l.status === "expired" ? 600 : 400 }}>{l.expires}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)" }}>No licenses on file for this agent.</div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                    Showing {popupPage * LICENSES_PER_PAGE + 1}–{Math.min((popupPage + 1) * LICENSES_PER_PAGE, viewing.licenses.length)} of {viewing.licenses.length}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPopupPage(p => Math.max(0, p - 1))} disabled={popupPage === 0} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage === 0 ? "default" : "pointer", opacity: popupPage === 0 ? 0.4 : 1, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}>Prev</button>
                    <button onClick={() => setPopupPage(p => Math.min(totalPages - 1, p + 1))} disabled={popupPage >= totalPages - 1} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage >= totalPages - 1 ? "default" : "pointer", opacity: popupPage >= totalPages - 1 ? 0.4 : 1, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}>Next</button>
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
