import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { agent: "Sarah Mitchell", carrier: "Mutual of Omaha", status: "active", contractDate: "2024-06-15" },
  { agent: "James Rodriguez", carrier: "Americo", status: "pending", contractDate: "2026-04-01" },
  { agent: "Michael Chen", carrier: "Corebridge", status: "active", contractDate: "2025-01-15" },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true },
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "contractDate", label: "Contract Date", sortable: true },
];
export default function HCMSContracting() {
  return (
    <div>
      <GCPageHeader title="Contracting" subtitle="Agent contracting status by carrier" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Active Contracts" value={2} accentTop />
        <GCKPICard label="Pending" value={1} accentTop />
        <GCKPICard label="Total Agents" value={3} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable />
    </div>
  );
}
