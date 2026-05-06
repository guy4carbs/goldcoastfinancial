import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { Loader2, AlertTriangle, Eye, X as XIcon } from "lucide-react";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  yearsExperience: string;
  previousAgency: string;
  title: string;
  status: string;
  dbaType: string;
  state: string;
  joinedAt: string;
}

const tabs = ["All", "Experienced", "New"] as const;

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "—" : `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch {
    return "—";
  }
}

function parseYears(v: string | null | undefined): number {
  if (!v || v.trim() === "") return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

export default function ContractingEmployment() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewing, setViewing] = useState<Agent | null>(null);

  const loadData = () => {
    setLoading(true);
    setError("");
    fetch("/api/hcms/agents/", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to load agents"); return r.json(); })
      .then(data => { setAgents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => { setError(e.message || "Failed to load agents"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    if (tab === "Experienced") return agents.filter(a => parseYears(a.yearsExperience) > 0);
    if (tab === "New") return agents.filter(a => parseYears(a.yearsExperience) === 0);
    return agents;
  }, [tab, agents]);

  const kpis = useMemo(() => {
    const total = agents.length;
    const years = agents.map(a => parseYears(a.yearsExperience));
    const experienced = years.filter(y => y > 0);
    const avgExp = experienced.length > 0 ? (experienced.reduce((s, y) => s + y, 0) / experienced.length).toFixed(1) : "0";
    const hasPrevAgency = agents.filter(a => a.previousAgency && a.previousAgency.trim() !== "").length;
    const newAgents = agents.filter(a => parseYears(a.yearsExperience) === 0).length;
    return { total, avgExp, hasPrevAgency, newAgents };
  }, [agents]);

  if (loading) {
    return (
      <div>
        <GCPageHeader title="Employment & Background" subtitle="Professional background overview for all agents" accentUnderline />
        <div className="flex items-center justify-center gap-2" style={{ padding: "var(--gc-space-8)", color: "var(--gc-text-muted)" }}>
          <Loader2 className="w-5 h-5 animate-spin" /> Loading agents...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader title="Employment & Background" subtitle="Professional background overview for all agents" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Employment Data</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  const cols: Column<Agent>[] = [
    { key: "firstName", label: "Agent", sortable: true, width: "16%", render: (_v, row) => (
      <Link href={`/hcms/agents/${row.userId}`}>
        <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{row.firstName} {row.lastName}</span>
      </Link>
    )},
    { key: "title", label: "Title / Position", sortable: true, width: "14%", render: (v) => <span>{v || "—"}</span> },
    { key: "yearsExperience", label: "Years Exp.", sortable: true, width: "10%", render: (v) => {
      const yrs = parseYears(v as string);
      return <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: yrs > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{yrs > 0 ? `${yrs} yrs` : "None"}</span>;
    }},
    { key: "previousAgency", label: "Previous Agency", sortable: true, width: "14%", render: (v) => (
      <span style={{ fontSize: "var(--gc-text-sm)", color: v ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{v || "—"}</span>
    )},
    { key: "dbaType", label: "DBA Type", width: "10%", render: (v) => {
      const label = v === "business_entity" ? "Business" : v === "individual" ? "Individual" : v || "—";
      return <span style={{ padding: "1px 6px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", backgroundColor: "var(--gc-surface-2)" }}>{label}</span>;
    }},
    { key: "state", label: "State", sortable: true, width: "8%", render: (v) => <span>{v || "—"}</span> },
    { key: "joinedAt", label: "Joined", sortable: true, width: "10%", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)" }}>{fmtDate(v as string)}</span> },
    { key: "status", label: "Status", width: "10%", render: (v) => {
      const s = v as string;
      const mapped = s === "approved" ? "active" : s === "in_review" ? "warning" : s === "rejected" ? "terminated" : "pending";
      return <GCStatusBadge status={mapped} />;
    }},
    { key: "userId" as any, label: "", width: "8%", align: "center" as const, render: (_v: any, row: Agent) => (
      <button onClick={() => setViewing(row)} className="flex items-center gap-1" style={{
        padding: "var(--gc-space-1) var(--gc-space-3)",
        backgroundColor: "transparent", border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)",
        cursor: "pointer", fontSize: "var(--gc-text-sm)",
      }}>
        <Eye className="w-3 h-3" /> View
      </button>
    )},
  ];

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_EMPLOYMENT.HEADER}>
        <GCPageHeader title="Employment & Background" subtitle="Professional background overview for all agents" accentUnderline />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_EMPLOYMENT.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={kpis.total} accentTop />
        <GCKPICard label="Avg Experience" value={`${kpis.avgExp} yrs`} accentTop />
        <GCKPICard label="Has Previous Agency" value={kpis.hasPrevAgency} accentTop delta={{ value: `${kpis.total - kpis.hasPrevAgency} first-time`, positive: kpis.hasPrevAgency >= kpis.total }} />
        <GCKPICard label="New Agents" value={kpis.newAgents} accentTop delta={kpis.newAgents > 0 ? { value: "No prior experience", positive: false } : { value: "All experienced", positive: true }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All" ? kpis.total : t === "Experienced" ? (kpis.total - kpis.newAgents) : kpis.newAgents;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by name, agency, or state..." />

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.firstName} {viewing.lastName}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Employment & Professional Background</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["Title / Position", viewing.title || "—"],
                  ["Years Experience", parseYears(viewing.yearsExperience) > 0 ? `${viewing.yearsExperience} years` : "None"],
                  ["Previous Agency", viewing.previousAgency || "—"],
                  ["DBA Type", viewing.dbaType === "business_entity" ? "Business Entity" : viewing.dbaType === "individual" ? "Individual" : viewing.dbaType || "—"],
                  ["State", viewing.state || "—"],
                  ["Email", viewing.email || "—"],
                  ["Joined", fmtDate(viewing.joinedAt)],
                  ["Status", viewing.status === "approved" ? "Active" : viewing.status === "in_review" ? "In Review" : viewing.status === "rejected" ? "Rejected" : "Pending"],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/hcms/agents/${viewing.userId}`}>
              <span className="flex items-center justify-center gap-2 mt-4" style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
                border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)",
                color: "var(--gc-gold)", fontSize: "var(--gc-text-sm)", fontWeight: 500, cursor: "pointer",
                textAlign: "center", display: "block"
              }}>View Full Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
