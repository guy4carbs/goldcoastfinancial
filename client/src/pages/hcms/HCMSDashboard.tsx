import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCBarChart, type Column } from "@/components/gc";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Users, FileSignature, Building2, ShieldCheck } from "lucide-react";

const APPLICATIONS = [
  { id: "1", name: "Jessica Davis", submittedAt: "2026-04-13", docsComplete: 4, docsTotal: 9, status: "pending_review" },
  { id: "2", name: "Robert Kim", submittedAt: "2026-04-12", docsComplete: 2, docsTotal: 9, status: "pending_review" },
  { id: "3", name: "Amanda Torres", submittedAt: "2026-04-11", docsComplete: 7, docsTotal: 9, status: "in_review" },
  { id: "4", name: "Christopher Lee", submittedAt: "2026-04-09", docsComplete: 9, docsTotal: 9, status: "in_review" },
  { id: "5", name: "Daniel Martinez", submittedAt: "2026-04-08", docsComplete: 3, docsTotal: 9, status: "pending_review" },
];

const ALERTS = [
  { id: "1", severity: "critical", agent: "James Rodriguez", issue: "TX License expires in 12 days" },
  { id: "2", severity: "critical", agent: "David Park", issue: "E&O Certificate expires in 8 days" },
  { id: "3", severity: "warning", agent: "Emily Watson", issue: "Active in FL without FL license" },
  { id: "4", severity: "warning", agent: "New Agent A", issue: "Contracting incomplete — 18 days" },
  { id: "5", severity: "info", agent: "Sarah Mitchell", issue: "IL License expires in 75 days" },
];

const CARRIER_STATUS = [
  { name: "Mutual of Omaha", value: 8 }, { name: "Transamerica", value: 6 },
  { name: "Americo", value: 5 }, { name: "Corebridge", value: 4 },
  { name: "National Life", value: 3 }, { name: "North American", value: 2 },
];

const ACTIVITY = [
  { text: "Jessica Davis submitted agent application", time: "2h ago", icon: FileSignature, color: "var(--gc-gold)" },
  { text: "Sarah Mitchell appointed with Mutual of Omaha", time: "5h ago", icon: Building2, color: "var(--gc-status-active)" },
  { text: "James Rodriguez — TX license expiring (12 days)", time: "1d ago", icon: AlertTriangle, color: "var(--gc-status-warning)" },
  { text: "Michael Chen approved as active agent", time: "1d ago", icon: Users, color: "var(--gc-status-active)" },
  { text: "Emily Watson signed NDA agreement", time: "2d ago", icon: FileSignature, color: "var(--gc-gold)" },
  { text: "David Park — E&O certificate expires in 8 days", time: "2d ago", icon: ShieldCheck, color: "var(--gc-status-terminated)" },
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

export default function HCMSDashboard() {
  return (
    <div>
      <GCPageHeader title="Command Center" subtitle="Agent contracting, carrier tracking & compliance overview" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <GCKPICard label="New Applications" value={5} accentTop delta={{ value: "+3 this week", positive: true }} />
        <GCKPICard label="Active Agents" value={34} accentTop />
        <GCKPICard label="Pending in SureLC" value={8} accentTop delta={{ value: "Awaiting", positive: false }} />
        <GCKPICard label="Compliance Alerts" value={5} accentTop delta={{ value: "2 critical", positive: false }} />
        <GCKPICard label="Avg Contract Level" value="84%" accentTop />
        <GCKPICard label="Missing Carriers" value={6} accentTop delta={{ value: "< 3 carriers", positive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Recent Applications</span>
            <Link href="/hcms/pipeline"><span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", cursor: "pointer" }}>View all <ArrowRight className="w-3 h-3" /></span></Link>
          </div>
          <GCDataTable columns={appCols} data={APPLICATIONS} pageSize={5} />
        </div>

        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Compliance Alerts</span>
            <Link href="/hcms/compliance"><span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)", cursor: "pointer" }}>View all <ArrowRight className="w-3 h-3" /></span></Link>
          </div>
          <GCDataTable columns={alertCols} data={ALERTS} pageSize={5} />
        </div>
      </div>

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
    </div>
  );
}
