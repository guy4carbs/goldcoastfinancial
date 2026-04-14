import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { id: "1", agentName: "Sarah Mitchell", requestType: "level_change", currentValue: "Agent (Level 4)", requestedValue: "Senior Agent (Level 3)", status: "pending", submittedAt: "2026-04-10" },
  { id: "2", agentName: "James Rodriguez", requestType: "commission_change", currentValue: "80%", requestedValue: "85%", status: "pending", submittedAt: "2026-04-08" },
  { id: "3", agentName: "Emily Watson", requestType: "placement", currentValue: "Under Nicholas", requestedValue: "Under Jack Cook", status: "approved", submittedAt: "2026-04-01" },
  { id: "4", agentName: "David Park", requestType: "level_change", currentValue: "Team Lead", requestedValue: "Regional Manager", status: "rejected", submittedAt: "2026-03-25" },
];
const typeColor: Record<string, string> = { level_change: "var(--gc-gold)", commission_change: "var(--gc-chart-2)", placement: "var(--gc-chart-4)" };
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agentName", label: "Agent", sortable: true },
  { key: "requestType", label: "Type", render: (v) => <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)", color: typeColor[v] || "var(--gc-text-muted)", backgroundColor: `color-mix(in srgb, ${typeColor[v] || "var(--gc-text-muted)"} 15%, transparent)` }}>{v.replace(/_/g, " ")}</span> },
  { key: "currentValue", label: "Current" },
  { key: "requestedValue", label: "Requested" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "submittedAt", label: "Submitted", sortable: true },
];
export default function HCMSHierarchyRequests() {
  return (
    <div>
      <GCPageHeader title="Hierarchy Requests" subtitle="Review placement & commission change requests" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>New Request</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Pending Review" value={2} accentTop />
        <GCKPICard label="Approved (Month)" value={1} accentTop delta={{ value: "+1", positive: true }} />
        <GCKPICard label="Rejected (Month)" value={1} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable />
    </div>
  );
}
