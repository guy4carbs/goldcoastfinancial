import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const FLAGS = [
  { id: "1", severity: "critical", flagType: "license_expiring", agentName: "James Rodriguez", title: "TX License expires in 12 days", status: "open", createdAt: "2026-04-01" },
  { id: "2", severity: "critical", flagType: "eo_expiring", agentName: "David Park", title: "E&O Certificate expires in 8 days", status: "open", createdAt: "2026-03-28" },
  { id: "3", severity: "warning", flagType: "contracting_stalled", agentName: "New Agent A", title: "Contracting incomplete for 18 days", status: "open", createdAt: "2026-03-26" },
  { id: "4", severity: "warning", flagType: "agent_inactive", agentName: "Former Agent C", title: "No activity in 65 days", status: "open", createdAt: "2026-04-10" },
  { id: "5", severity: "info", flagType: "license_expiring", agentName: "Sarah Mitchell", title: "IL License expires in 75 days", status: "open", createdAt: "2026-04-13" },
];
const AUDIT = [
  { id: "1", timestamp: "2026-04-13 14:22", user: "Jack Cook", action: "agent_approved", details: "Approved Sarah Mitchell" },
  { id: "2", timestamp: "2026-04-13 11:05", user: "System", action: "compliance_check", details: "Auto-check: 3 new flags" },
  { id: "3", timestamp: "2026-04-12 16:45", user: "Nicholas Gallagher", action: "commission_adjustment", details: "Adjusted target for David Park" },
];
const sevColor: Record<string, string> = { critical: "var(--gc-status-terminated)", warning: "var(--gc-status-warning)", info: "var(--gc-status-review)" };
const flagCols: Column<typeof FLAGS[0]>[] = [
  { key: "severity", label: "Sev", render: (v) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: sevColor[v] }} /> },
  { key: "flagType", label: "Type", render: (v) => v.replace(/_/g, " ") },
  { key: "agentName", label: "Agent", sortable: true },
  { key: "title", label: "Title" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "createdAt", label: "Created", sortable: true },
];
const auditCols: Column<typeof AUDIT[0]>[] = [
  { key: "timestamp", label: "Time", sortable: true },
  { key: "user", label: "User" },
  { key: "action", label: "Action", render: (v) => v.replace(/_/g, " ") },
  { key: "details", label: "Details" },
];
export default function OpsCompliance() {
  const [view, setView] = useState<"flags"|"audit">("flags");
  return (
    <div>
      <GCPageHeader title="Compliance" subtitle="Compliance monitoring, flag management & audit trail" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Run Check</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Critical Flags" value={2} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Warning Flags" value={2} accentTop />
        <GCKPICard label="Open Total" value={5} accentTop />
        <GCKPICard label="Resolved (Month)" value={22} accentTop delta={{ value: "+5", positive: true }} />
      </div>
      <div className="flex gap-2 mb-4">{(["flags","audit"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: view === v ? "var(--gc-gold)" : "var(--gc-surface)", color: view === v ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer", textTransform: "capitalize" as const }}>{v === "flags" ? "Flags" : "Audit Trail"}</button>)}</div>
      {view === "flags" ? <GCDataTable columns={flagCols} data={FLAGS} searchable /> : <GCDataTable columns={auditCols} data={AUDIT} searchable />}
    </div>
  );
}
