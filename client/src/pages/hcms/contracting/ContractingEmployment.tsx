import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Eye, X as XIcon, Building2, Briefcase } from "lucide-react";

interface Employment { employer: string; position: string; startDate: string; endDate: string; reason: string; current: boolean; isInsurance: boolean; }
interface AgentEmployment { agentId: string; agent: string; employment: Employment[]; yearsInInsurance: number; }

const MOCK: AgentEmployment[] = [
  { agentId: "1", agent: "Sarah Mitchell", yearsInInsurance: 5, employment: [
    { employer: "Heritage Life Solutions", position: "Sales Agent", startDate: "2026-01-01", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Northwestern Mutual", position: "Financial Advisor", startDate: "2020-03-01", endDate: "2025-12-31", reason: "Seeking independent opportunity", current: false, isInsurance: true },
  ]},
  { agentId: "2", agent: "James Rodriguez", yearsInInsurance: 7, employment: [
    { employer: "Heritage Life Solutions", position: "Sales Agent", startDate: "2026-01-15", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Primerica", position: "Senior Agent", startDate: "2023-09-01", endDate: "2025-11-30", reason: "Transition to independent", current: false, isInsurance: true },
    { employer: "New York Life", position: "Agent", startDate: "2018-06-01", endDate: "2023-08-15", reason: "Relocated to Texas", current: false, isInsurance: true },
  ]},
  { agentId: "3", agent: "Michael Chen", yearsInInsurance: 6, employment: [
    { employer: "Heritage Life Solutions", position: "Senior Agent", startDate: "2025-01-15", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "State Farm", position: "Licensed Agent", startDate: "2019-01-15", endDate: "2024-12-31", reason: "Career advancement", current: false, isInsurance: true },
  ]},
  { agentId: "4", agent: "Emily Watson", yearsInInsurance: 1, employment: [
    { employer: "Heritage Life Solutions", position: "Agent", startDate: "2025-08-15", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Allstate", position: "Claims Adjuster", startDate: "2021-05-01", endDate: "2025-07-31", reason: "Transition to sales", current: false, isInsurance: true },
    { employer: "Target Corp", position: "Team Lead", startDate: "2018-06-01", endDate: "2021-04-30", reason: "Career change", current: false, isInsurance: false },
  ]},
  { agentId: "5", agent: "David Park", yearsInInsurance: 8, employment: [
    { employer: "Heritage Life Solutions", position: "Team Lead", startDate: "2024-07-15", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "MetLife", position: "Financial Planner", startDate: "2017-09-01", endDate: "2024-06-30", reason: "Independent practice", current: false, isInsurance: true },
    { employer: "Edward Jones", position: "Financial Advisor", startDate: "2015-03-01", endDate: "2017-08-31", reason: "Better opportunity", current: false, isInsurance: true },
  ]},
  { agentId: "6", agent: "Lisa Thompson", yearsInInsurance: 3, employment: [
    { employer: "Heritage Life Solutions", position: "Agent", startDate: "2025-06-01", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Farmers Insurance", position: "Agent", startDate: "2022-04-01", endDate: "2025-05-31", reason: "Seeking IMO partnership", current: false, isInsurance: true },
  ]},
  { agentId: "7", agent: "Robert Kim", yearsInInsurance: 0, employment: [] },
  { agentId: "8", agent: "Amanda Torres", yearsInInsurance: 2, employment: [
    { employer: "Heritage Life Solutions", position: "Agent", startDate: "2026-04-01", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Bankers Life", position: "Associate Agent", startDate: "2024-01-01", endDate: "2026-03-31", reason: "Better compensation", current: false, isInsurance: true },
  ]},
  { agentId: "9", agent: "Jack Cook", yearsInInsurance: 15, employment: [
    { employer: "Heritage Life Solutions", position: "Director", startDate: "2022-01-01", endDate: "", reason: "", current: true, isInsurance: true },
    { employer: "Family First Life", position: "Regional Director", startDate: "2018-06-01", endDate: "2021-12-31", reason: "Founded own agency", current: false, isInsurance: true },
    { employer: "Symmetry Financial Group", position: "Senior Agent", startDate: "2015-01-01", endDate: "2018-05-31", reason: "Leadership opportunity", current: false, isInsurance: true },
    { employer: "American Income Life", position: "Agent", startDate: "2012-03-01", endDate: "2014-12-31", reason: "Career growth", current: false, isInsurance: true },
    { employer: "US Army", position: "E-5 Sergeant", startDate: "2008-06-01", endDate: "2012-02-28", reason: "Honorable discharge", current: false, isInsurance: false },
  ]},
];

const tabs = ["All Agents", "Experienced (5+ yrs)", "New (< 2 yrs)", "No History"] as const;

export default function ContractingEmployment() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentEmployment | null>(null);

  const counts = useMemo(() => ({
    all: MOCK.length,
    experienced: MOCK.filter(a => a.yearsInInsurance >= 5).length,
    newAgents: MOCK.filter(a => a.yearsInInsurance > 0 && a.yearsInInsurance < 2).length,
    noHistory: MOCK.filter(a => a.employment.length === 0).length,
    avgYears: Math.round(MOCK.filter(a => a.yearsInInsurance > 0).reduce((s, a) => s + a.yearsInInsurance, 0) / Math.max(1, MOCK.filter(a => a.yearsInInsurance > 0).length)),
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Experienced (5+ yrs)") return MOCK.filter(a => a.yearsInInsurance >= 5);
    if (tab === "New (< 2 yrs)") return MOCK.filter(a => a.yearsInInsurance > 0 && a.yearsInInsurance < 2);
    if (tab === "No History") return MOCK.filter(a => a.employment.length === 0);
    return MOCK;
  }, [tab]);

  const cols: Column<AgentEmployment>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "yearsInInsurance", label: "Insurance Exp.", sortable: true, width: "12%", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as number) >= 5 ? "var(--gc-status-active)" : (v as number) > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)" }}>{v === 0 ? "None" : `${v} yrs`}</span> },
    { key: "employment", label: "Positions", width: "8%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Employment[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)" }}>{(v as Employment[]).length}</span> },
    { key: "agentId", label: "Current Position", width: "22%", render: (_v, row) => {
      const current = row.employment.find(e => e.current);
      return current ? <span style={{ fontSize: "var(--gc-text-sm)" }}>{current.position} at <span style={{ fontWeight: 500 }}>{current.employer}</span></span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span>;
    }},
    { key: "agentId", label: "Previous Agencies", width: "22%", render: (_v, row) => {
      const prev = row.employment.filter(e => !e.current && e.isInsurance);
      if (prev.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span>;
      const MAX = 2;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {prev.slice(0, MAX).map((e, i) => (
            <span key={i} style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", backgroundColor: "var(--gc-surface-2)" }}>{e.employer}</span>
          ))}
          {prev.length > MAX && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", cursor: "pointer" }} onClick={() => { setViewing(row); }}>+{prev.length - MAX} more</span>}
        </div>
      );
    }},
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => row.employment.length > 0 ? (
      <button onClick={() => setViewing(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)" }}>
        <Eye className="w-3 h-3" /> View
      </button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="Employment History" subtitle="Previous agencies & employment records relevant to insurance licensing" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Avg Insurance Experience" value={`${counts.avgYears} yrs`} accentTop />
        <GCKPICard label="Experienced (5+ yrs)" value={counts.experienced} accentTop />
        <GCKPICard label="New Agents (< 2 yrs)" value={counts.newAgents} accentTop />
        <GCKPICard label="No History on File" value={counts.noHistory} accentTop delta={{ value: counts.noHistory > 0 ? "Needs entry" : "All complete", positive: counts.noHistory === 0 }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Experienced (5+ yrs)" ? counts.experienced : t === "New (< 2 yrs)" ? counts.newAgents : counts.noHistory;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent or employer..." />

      {/* View Employment Popup */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 580, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.yearsInInsurance} years in insurance · {viewing.employment.length} position{viewing.employment.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-3">
              {viewing.employment.map((e, i) => (
                <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${e.current ? "var(--gc-status-active)" : e.isInsurance ? "var(--gc-gold)" : "var(--gc-text-muted)"}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {e.isInsurance ? <Building2 className="w-4 h-4" style={{ color: "var(--gc-gold)" }} /> : <Briefcase className="w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />}
                      <div>
                        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{e.employer}</div>
                        <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{e.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.isInsurance && <span style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 12%, transparent)" }}>Insurance</span>}
                      {e.current && <GCStatusBadge status="active" />}
                    </div>
                  </div>
                  <div className="flex gap-6" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                    <span>{e.startDate} — {e.endDate || <span style={{ color: "var(--gc-status-active)", fontWeight: 500 }}>Present</span>}</span>
                    {e.reason && <span>Reason: <span style={{ color: "var(--gc-text-secondary)" }}>{e.reason}</span></span>}
                  </div>
                </div>
              ))}
            </div>

            {viewing.employment.length === 0 && (
              <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)" }}>No employment history on file.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
