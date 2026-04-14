import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { id: "1", agentName: "Sarah Mitchell", stateCode: "IL", licenseNumber: "IL-2024-18842", status: "active", effectiveDate: "2024-01-15", expirationDate: "2026-01-15" },
  { id: "2", agentName: "James Rodriguez", stateCode: "TX", licenseNumber: "TX-2023-44521", status: "expired", effectiveDate: "2023-06-01", expirationDate: "2025-06-01" },
  { id: "3", agentName: "Michael Chen", stateCode: "CA", licenseNumber: "CA-2025-67123", status: "active", effectiveDate: "2025-02-01", expirationDate: "2027-02-01" },
  { id: "4", agentName: "Emily Watson", stateCode: "FL", licenseNumber: "FL-2024-33109", status: "active", effectiveDate: "2024-08-15", expirationDate: "2026-05-15" },
  { id: "5", agentName: "David Park", stateCode: "NY", licenseNumber: "NY-2024-55982", status: "pending", effectiveDate: "2026-04-01", expirationDate: "2028-04-01" },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agentName", label: "Agent", sortable: true },
  { key: "stateCode", label: "State", sortable: true },
  { key: "licenseNumber", label: "License #" },
  { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v} /> },
  { key: "effectiveDate", label: "Effective", sortable: true },
  { key: "expirationDate", label: "Expires", sortable: true },
];
export default function HCMSLicensing() {
  return (
    <div>
      <GCPageHeader title="Licensing" subtitle="State license management & expiration tracking" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Add License</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Licenses" value={3} accentTop />
        <GCKPICard label="Expiring (30d)" value={1} accentTop delta={{ value: "Critical", positive: false }} />
        <GCKPICard label="Expiring (60d)" value={1} accentTop />
        <GCKPICard label="Expired" value={1} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search licenses..." />
    </div>
  );
}
