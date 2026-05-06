import { useState, useEffect } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCBarChart, type Column } from "@/components/gc";
import { SendApplicationDialog } from "@/components/SendApplicationDialog";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Users, FileSignature, ShieldCheck, ExternalLink, Send, Loader2, Eye } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Agent {
  userId: string; firstName: string; lastName: string; email: string;
  status: string; npn: string; dbaType: string; state: string;
  joinedAt: string; docsSigned: number; docsUploaded: number;
  docsTotal: number; allCompleted: boolean; eoExpiration: string | null;
  ceExpirationDate: string | null; amlCertificateKey: string | null;
  ndaStatus: string; complianceStatus: string; debtRollupStatus: string;
}

interface Stats {
  total: number; pending_review: number; in_review: number; approved: number; rejected: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(d: string | null): string {
  if (!d) return "\u2014";
  try { const date = new Date(d); return isNaN(date.getTime()) ? "\u2014" : `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`; } catch { return "\u2014"; }
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  try { const ms = new Date(d).getTime() - Date.now(); return Math.ceil(ms / 86400000); } catch { return null; }
}

function timeAgo(d: string): string {
  const parsed = new Date(d).getTime();
  if (isNaN(parsed)) return "just now";
  const diff = Date.now() - parsed;
  if (diff <= 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/* Column definitions                                                 */
/* ------------------------------------------------------------------ */

const appCols: Column<Agent>[] = [
  { key: "firstName", label: "Agent", sortable: true, render: (_v, row) => (
    <Link href={`/hcms/agents/${row.userId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{row.firstName} {row.lastName}</span></Link>
  )},
  { key: "joinedAt", label: "Submitted", sortable: true, render: (v) => fmtDate(v) },
  { key: "docsTotal", label: "Docs", render: (_v, row) => {
    const total = row.docsSigned + row.docsUploaded;
    return (
      <div className="flex items-center gap-2">
        <div style={{ width: 48, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(total / 7) * 100}%`, backgroundColor: row.allCompleted ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
        </div>
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{total}/7</span>
      </div>
    );
  }},
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v === "approved" ? "active" : v === "in_review" ? "warning" : v === "rejected" ? "terminated" : "pending"} /> },
  { key: "userId", label: "", width: "60px", align: "center", render: (_v, row) => (
    <Link href={`/hcms/agents/${row.userId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer" }}><Eye className="w-3.5 h-3.5" /></span></Link>
  )},
];

interface AlertRow { id: string; severity: string; agent: string; agentId: string; issue: string; }

const alertCols: Column<AlertRow>[] = [
  { key: "severity", label: "", width: "24px", render: (v) => {
    const color = v === "critical" ? "var(--gc-status-terminated)" : v === "warning" ? "var(--gc-status-warning)" : "var(--gc-status-review)";
    return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />;
  }},
  { key: "agent", label: "Agent", render: (v, row) => (
    <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer" }}>{v}</span></Link>
  )},
  { key: "issue", label: "Issue" },
];

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function HCMSDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending_review: 0, in_review: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Send Application dialog state
  const [showSend, setShowSend] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/hcms/agents/stats", { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/hcms/agents/", { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([s, a]) => {
      if (!s && !a) {
        setError("Failed to load dashboard data. Please check your connection and try again.");
      } else {
        if (s) setStats(s as Stats);
        if (Array.isArray(a)) setAgents(a);
      }
      setLoading(false);
    }).catch(() => { setError("Failed to load dashboard data. Please check your connection and try again."); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  if (error) return (
    <div style={{ padding: "var(--gc-space-8)" }}>
      <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)", flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)", marginBottom: 4 }}>Unable to Load Dashboard</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
        </div>
      </div>
    </div>
  );

  /* -- Derive dashboard data from real agents ----------------------- */
  const pendingAgents = agents.filter(a => a.status === "pending_review" || a.status === "in_review")
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  const docsIncomplete = agents.filter(a => !a.allCompleted).length;

  // Build compliance alerts from real data
  const alerts: AlertRow[] = [];
  let alertId = 0;
  agents.forEach(a => {
    const name = `${a.firstName} ${a.lastName}`;
    // E&O expiration
    if (a.eoExpiration) {
      const days = daysUntil(a.eoExpiration);
      if (days !== null && days <= 30 && days > 0) {
        alerts.push({ id: String(++alertId), severity: days <= 14 ? "critical" : "warning", agent: name, agentId: a.userId, issue: `E&O expires in ${days} days` });
      } else if (days !== null && days <= 0) {
        alerts.push({ id: String(++alertId), severity: "critical", agent: name, agentId: a.userId, issue: `E&O expired ${Math.abs(days)} days ago` });
      }
    }
    // CE Credits expiration
    if (a.ceExpirationDate) {
      const ceDays = daysUntil(a.ceExpirationDate);
      if (ceDays !== null && ceDays <= 30 && ceDays > 0) {
        alerts.push({ id: String(++alertId), severity: ceDays <= 14 ? "critical" : "warning", agent: name, agentId: a.userId, issue: `CE credits expire in ${ceDays} days` });
      } else if (ceDays !== null && ceDays <= 0) {
        alerts.push({ id: String(++alertId), severity: "critical", agent: name, agentId: a.userId, issue: `CE credits expired ${Math.abs(ceDays)} days ago` });
      }
    }
    // Active agent checks
    if (a.status === "approved") {
      // Missing docs
      if (!a.allCompleted) {
        alerts.push({ id: String(++alertId), severity: "warning", agent: name, agentId: a.userId, issue: `Active agent — documents incomplete (${a.docsSigned + a.docsUploaded}/7)` });
      }
      // AML certificate missing
      if (!a.amlCertificateKey) {
        alerts.push({ id: String(++alertId), severity: "warning", agent: name, agentId: a.userId, issue: "AML certificate missing" });
      }
      // NDA not signed
      if (a.ndaStatus && a.ndaStatus !== "signed") {
        alerts.push({ id: String(++alertId), severity: "warning", agent: name, agentId: a.userId, issue: "NDA not signed" });
      }
      // Compliance agreement not signed
      if (a.complianceStatus && a.complianceStatus !== "signed") {
        alerts.push({ id: String(++alertId), severity: "warning", agent: name, agentId: a.userId, issue: "Compliance agreement not signed" });
      }
      // Debt rollup not signed
      if (a.debtRollupStatus && a.debtRollupStatus !== "signed") {
        alerts.push({ id: String(++alertId), severity: "info", agent: name, agentId: a.userId, issue: "Debt rollup agreement not signed" });
      }
    }
  });
  // Sort: critical first
  alerts.sort((a, b) => (a.severity === "critical" ? 0 : a.severity === "warning" ? 1 : 2) - (b.severity === "critical" ? 0 : b.severity === "warning" ? 1 : 2));

  // Build activity from recent agents
  const recentActivity = agents
    .filter(a => a.joinedAt)
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 8)
    .map(a => {
      const name = `${a.firstName} ${a.lastName}`;
      const time = timeAgo(a.joinedAt);
      if (a.status === "approved") return { text: `${name} approved — ${a.allCompleted ? "all documents complete" : "awaiting remaining documents"}`, time, icon: Users, color: "var(--gc-status-active)" };
      if (a.status === "in_review") return { text: `${name} application under review`, time, icon: ShieldCheck, color: "var(--gc-status-warning)" };
      if (a.status === "rejected") return { text: `${name} application rejected`, time, icon: AlertTriangle, color: "var(--gc-status-terminated)" };
      return { text: `${name} application submitted`, time, icon: FileSignature, color: "var(--gc-gold)" };
    });

  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.HEADER}>
        <GCPageHeader title="Command Center" subtitle="Agent contracting, carrier tracking & compliance overview" accentUnderline />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_AGENTS}>
          <GCKPICard label="Total Agents" value={stats.total || agents.length} accentTop href="/hcms/agents" />
        </div>
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_PENDING}>
          <GCKPICard label="Pending Review" value={stats.pending_review || 0} accentTop delta={{ value: (stats.pending_review || 0) > 0 ? "Needs attention" : "All clear", positive: !(stats.pending_review || 0) }} href="/hcms/contracting" />
        </div>
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_IN_REVIEW}>
          <GCKPICard label="In Review" value={stats.in_review || 0} accentTop href="/hcms/agents" />
        </div>
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_ACTIVE}>
          <GCKPICard label="Active Agents" value={stats.approved || 0} accentTop delta={{ value: `${Math.round(((stats.approved || 0) / Math.max(stats.total || 1, 1)) * 100)}%`, positive: true }} href="/hcms/agents" />
        </div>
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_ALERTS}>
          <GCKPICard label="Compliance Alerts" value={alerts.length} accentTop delta={{ value: criticalAlerts > 0 ? `${criticalAlerts} critical` : "All clear", positive: criticalAlerts === 0 }} />
        </div>
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.KPI_REQUESTS}>
          <GCKPICard label="Docs Incomplete" value={docsIncomplete} accentTop delta={{ value: docsIncomplete > 0 ? "Action needed" : "All complete", positive: docsIncomplete === 0 }} href="/hcms/contracting" />
        </div>
      </div>

      {/* Quick Actions */}
      <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.QUICK_LINKS} className="flex flex-wrap gap-3 mb-6">
        <button data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.QUICK_SEND_APP} onClick={() => setShowSend(true)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, border: "none", cursor: "pointer" }}>
          <Send className="w-4 h-4" /> Send Application
        </button>
        <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="no-underline flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer" }}>
          <ExternalLink className="w-4 h-4" /> Open SureLC
        </a>
      </div>

      {/* Tables: Applications + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.APPLICATIONS_TABLE} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Recent Applications</span>
            <Link href="/hcms/agents"><span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", cursor: "pointer" }}>View all <ArrowRight className="w-3 h-3" /></span></Link>
          </div>
          {pendingAgents.length === 0 ? (
            <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>No pending applications</div>
          ) : (
            <GCDataTable columns={appCols} data={pendingAgents.slice(0, 5)} pageSize={5} />
          )}
        </div>

        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.ALERTS_TABLE} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Compliance Alerts</span>
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>No compliance alerts</div>
          ) : (
            <GCDataTable columns={alertCols} data={alerts.slice(0, 5)} pageSize={5} />
          )}
        </div>
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Status Breakdown */}
        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.STATUS_CHART} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Agents by Status</span>
          </div>
          {(stats.approved || 0) + (stats.in_review || 0) + (stats.pending_review || 0) + (stats.rejected || 0) === 0 ? (
            <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>No agent data available</div>
          ) : (
            <div style={{ padding: "var(--gc-space-4)" }}>
              <GCBarChart bare data={[
                { name: "Active", value: stats.approved || 0 },
                { name: "In Review", value: stats.in_review || 0 },
                { name: "Pending", value: stats.pending_review || 0 },
                { name: "Rejected", value: stats.rejected || 0 },
              ]} valueFormatter={v => `${v} agents`} />
            </div>
          )}
        </div>

        <div data-tour-id={TOUR.ADMIN.HCMS_DASHBOARD.RECENT_ACTIVITY} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Recent Activity</span>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: "var(--gc-space-6)", textAlign: "center", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>No recent activity</div>
          ) : (
            <div className="flex flex-col gap-2" style={{ padding: "var(--gc-space-4)" }}>
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3" style={{ padding: "var(--gc-space-2) 0", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--gc-border-subtle)" : "none" }}>
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
          )}
        </div>
      </div>

      <SendApplicationDialog open={showSend} onClose={() => setShowSend(false)} />
    </div>
  );
}
