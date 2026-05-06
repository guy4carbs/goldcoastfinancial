import { useState, useEffect, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Loader2, AlertTriangle, Eye } from "lucide-react";
import { TOUR } from "@/lib/tour/selectors";

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  npn: string;
  dbaType: string;
  state: string;
  joinedAt: string;
  docsSigned: number;
  docsUploaded: number;
  allCompleted: boolean;
}

interface Stats {
  total?: number; pending_review?: number; in_review?: number; approved?: number; rejected?: number;
}

const tabs = ["All", "Pending", "In Review", "Active", "Rejected"] as const;

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try { const date = new Date(d); return isNaN(date.getTime()) ? "—" : `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`; } catch { return "—"; }
}

function statusForTab(tab: string): string | null {
  if (tab === "Pending") return "pending_review";
  if (tab === "In Review") return "in_review";
  if (tab === "Active") return "approved";
  if (tab === "Rejected") return "rejected";
  return null;
}

export default function HCMSAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [tab, setTab] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/hcms/agents/stats", { credentials: "include" }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch("/api/hcms/agents/", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([s, a]) => {
      setStats(s as Stats); setAgents(Array.isArray(a) ? a : []); setLoading(false);
    }).catch(() => { setError("Failed to load agents"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const tabCounts = useMemo(() => ({
    All: agents.length,
    Pending: agents.filter(a => a.status === "pending_review").length,
    "In Review": agents.filter(a => a.status === "in_review").length,
    Active: agents.filter(a => a.status === "approved").length,
    Rejected: agents.filter(a => a.status === "rejected").length,
  }), [agents]);

  if (error) {
    return (
      <div>
        <GCPageHeader title="Agent Directory" subtitle="All contracted agents" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Agent Directory</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const statusFilter = statusForTab(tab);
  const filtered = statusFilter ? agents.filter(a => a.status === statusFilter) : agents;

  const columns: Column<Agent>[] = [
    { key: "firstName", label: "Agent", sortable: true, width: "22%", render: (_v, row) => (
      <Link href={`/hcms/agents/${row.userId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{row.firstName} {row.lastName}</span></Link>
    )},
    { key: "email", label: "Email", width: "22%" },
    { key: "status", label: "Status", width: "12%", render: (v) => <GCStatusBadge status={v === "approved" ? "active" : v === "in_review" ? "warning" : v === "rejected" ? "terminated" : "pending"} /> },
    { key: "docsSigned", label: "Docs", width: "10%", render: (_v, row) => {
      const total = row.docsSigned + row.docsUploaded;
      return (
        <div className="flex items-center gap-2">
          <div style={{ width: 40, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(total / 7) * 100}%`, backgroundColor: row.allCompleted ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
          </div>
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{total}/7</span>
        </div>
      );
    }},
    { key: "state", label: "State", width: "8%", align: "center" },
    { key: "joinedAt", label: "Joined", width: "12%", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)" }}>{fmtDate(v)}</span> },
    { key: "userId", label: "", width: "8%", align: "center", render: (_v, row) => (
      <Link href={`/hcms/agents/${row.userId}`}><span className="flex items-center gap-1" style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</span></Link>
    )},
  ];

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.HEADER}>
        <GCPageHeader title="Agent Directory" subtitle="All contracted agents" accentUnderline />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.KPI_TOTAL}>
          <GCKPICard label="Total Agents" value={stats.total || agents.length} accentTop />
        </div>
        <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.KPI_PENDING}>
          <GCKPICard label="Pending Review" value={stats.pending_review || 0} delta={{ value: (stats.pending_review || 0) > 0 ? "Needs attention" : "All clear", positive: !(stats.pending_review || 0) }} accentTop />
        </div>
        <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.KPI_IN_REVIEW}>
          <GCKPICard label="In Review" value={stats.in_review || 0} accentTop />
        </div>
        <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.KPI_ACTIVE}>
          <GCKPICard label="Active" value={stats.approved || 0} delta={{ value: `${Math.round(((stats.approved || 0) / Math.max(stats.total || 1, 1)) * 100)}% of total`, positive: true }} accentTop />
        </div>
      </div>

      {/* Tabs */}
      <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.TABS} className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = tabCounts[t];
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "var(--gc-space-2) var(--gc-space-4)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-base)",
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent",
              cursor: "pointer",
            }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <div data-tour-id={TOUR.ADMIN.AGENTS_LIST.TABLE}>
        <GCDataTable data={filtered} columns={columns} searchable pageSize={20} />
      </div>
    </div>
  );
}
