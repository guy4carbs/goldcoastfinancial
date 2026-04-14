import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink, RefreshCw } from "lucide-react";
const MOCK = [
  { agent: "Sarah Mitchell", state: "IL", license: "IL-2024-18842", type: "Life & Health", status: "active", effective: "2024-01-15", expires: "2026-01-15", resident: "Y" },
  { agent: "Sarah Mitchell", state: "IN", license: "IN-2024-99201", type: "Life & Health", status: "active", effective: "2024-03-01", expires: "2026-03-01", resident: "N" },
  { agent: "Sarah Mitchell", state: "WI", license: "WI-2025-33210", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01", resident: "N" },
  { agent: "James Rodriguez", state: "TX", license: "TX-2023-44521", type: "Life & Health", status: "expired", effective: "2023-06-01", expires: "2025-06-01", resident: "Y" },
  { agent: "Michael Chen", state: "CA", license: "CA-2025-67123", type: "Life & Health", status: "active", effective: "2025-02-01", expires: "2027-02-01", resident: "Y" },
  { agent: "Michael Chen", state: "NY", license: "NY-2025-88201", type: "Life & Health", status: "active", effective: "2025-03-01", expires: "2027-03-01", resident: "N" },
  { agent: "Emily Watson", state: "FL", license: "FL-2024-33109", type: "Life & Health", status: "active", effective: "2024-08-15", expires: "2026-05-15", resident: "Y" },
  { agent: "David Park", state: "NY", license: "NY-2024-55982", type: "Life Only", status: "active", effective: "2024-04-01", expires: "2026-04-01", resident: "Y" },
  { agent: "David Park", state: "NJ", license: "NJ-2025-44123", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01", resident: "N" },
  { agent: "Lisa Thompson", state: "AZ", license: "AZ-2024-66712", type: "Life & Health", status: "active", effective: "2024-09-01", expires: "2026-09-01", resident: "Y" },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "state", label: "State", sortable: true, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: "license", label: "License #", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "type", label: "Type" },
  { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v} /> },
  { key: "effective", label: "Effective" },
  { key: "expires", label: "Expires", sortable: true },
  { key: "resident", label: "Resident", render: (v) => v === "Y" ? <span style={{ color: "var(--gc-status-active)" }}>Yes</span> : <span style={{ color: "var(--gc-text-muted)" }}>No</span> },
];
export default function ContractingLicenses() {
  return (
    <div>
      <GCPageHeader title="State Licenses" subtitle="License data synced from SureLC / NIPR" accentUnderline
        actions={<div className="flex gap-2"><button className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}><RefreshCw className="w-3.5 h-3.5" /> Sync</button><a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)" }}><ExternalLink className="w-3.5 h-3.5" /> SureLC</a></div>} />
      <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>Read-only — data sourced from SureLC / NIPR. Last synced: April 14, 2026 at 9:15 AM</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Licenses" value={MOCK.filter(m => m.status === "active").length} accentTop />
        <GCKPICard label="Expired" value={MOCK.filter(m => m.status === "expired").length} accentTop delta={{ value: "Renewal needed", positive: false }} />
        <GCKPICard label="States Covered" value={new Set(MOCK.filter(m => m.status === "active").map(m => m.state)).size} accentTop />
        <GCKPICard label="Agents Licensed" value={new Set(MOCK.map(m => m.agent)).size} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search licenses..." />
    </div>
  );
}
