import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { id: "1", agent: "James Rodriguez", issue: "TX License expires in 12 days", severity: "critical", status: "open", createdAt: "2026-04-01" },
  { id: "2", agent: "David Park", issue: "E&O Certificate expires in 8 days", severity: "critical", status: "open", createdAt: "2026-03-28" },
  { id: "3", agent: "Emily Watson", issue: "Active in FL without FL license", severity: "warning", status: "open", createdAt: "2026-04-05" },
];
const sevColor: Record<string, string> = { critical: "var(--gc-status-terminated)", warning: "var(--gc-status-warning)", info: "var(--gc-status-review)" };
const cols: Column<typeof MOCK[0]>[] = [
  { key: "severity", label: "Severity", render: (v) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: sevColor[v] || "var(--gc-text-muted)" }} /> },
  { key: "agent", label: "Agent", sortable: true },
  { key: "issue", label: "Issue" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "createdAt", label: "Created", sortable: true },
];
export default function HCMSCompliance() {
  return (
    <div>
      <GCPageHeader title="Compliance" subtitle="Compliance monitoring & flag management" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Critical Flags" value={2} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Warning Flags" value={1} accentTop />
        <GCKPICard label="Open Total" value={3} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable />
    </div>
  );
}
