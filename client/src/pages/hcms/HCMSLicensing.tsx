import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink, RefreshCw } from "lucide-react";

const MOCK = [
  { id: "1", agentName: "Sarah Mitchell", stateCode: "IL", licenseNumber: "IL-2024-18842", licenseType: "Life & Health", status: "active", effectiveDate: "2024-01-15", expirationDate: "2026-01-15" },
  { id: "2", agentName: "Sarah Mitchell", stateCode: "IN", licenseNumber: "IN-2024-99201", licenseType: "Life & Health", status: "active", effectiveDate: "2024-03-01", expirationDate: "2026-03-01" },
  { id: "3", agentName: "James Rodriguez", stateCode: "TX", licenseNumber: "TX-2023-44521", licenseType: "Life & Health", status: "expired", effectiveDate: "2023-06-01", expirationDate: "2025-06-01" },
  { id: "4", agentName: "Michael Chen", stateCode: "CA", licenseNumber: "CA-2025-67123", licenseType: "Life & Health", status: "active", effectiveDate: "2025-02-01", expirationDate: "2027-02-01" },
  { id: "5", agentName: "Michael Chen", stateCode: "NY", licenseNumber: "NY-2025-88201", licenseType: "Life & Health", status: "active", effectiveDate: "2025-03-01", expirationDate: "2027-03-01" },
  { id: "6", agentName: "Emily Watson", stateCode: "FL", licenseNumber: "FL-2024-33109", licenseType: "Life & Health", status: "active", effectiveDate: "2024-08-15", expirationDate: "2026-05-15" },
  { id: "7", agentName: "David Park", stateCode: "NY", licenseNumber: "NY-2024-55982", licenseType: "Life Only", status: "pending", effectiveDate: "2026-04-01", expirationDate: "2028-04-01" },
  { id: "8", agentName: "David Park", stateCode: "NJ", licenseNumber: "NJ-2025-44123", licenseType: "Life & Health", status: "active", effectiveDate: "2025-06-01", expirationDate: "2027-06-01" },
  { id: "9", agentName: "Sarah Mitchell", stateCode: "WI", licenseNumber: "WI-2025-33210", licenseType: "Life & Health", status: "active", effectiveDate: "2025-06-01", expirationDate: "2027-06-01" },
  { id: "10", agentName: "Lisa Thompson", stateCode: "AZ", licenseNumber: "AZ-2024-66712", licenseType: "Life & Health", status: "active", effectiveDate: "2024-09-01", expirationDate: "2026-09-01" },
];

const active = MOCK.filter(l => l.status === "active").length;
const expired = MOCK.filter(l => l.status === "expired").length;
const pending = MOCK.filter(l => l.status === "pending").length;

const cols: Column<typeof MOCK[0]>[] = [
  { key: "agentName", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "stateCode", label: "State", sortable: true, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: "licenseNumber", label: "License #", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "licenseType", label: "Type" },
  { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v} /> },
  { key: "effectiveDate", label: "Effective", sortable: true },
  { key: "expirationDate", label: "Expires", sortable: true },
];

export default function HCMSLicensing() {
  return (
    <div>
      <GCPageHeader title="License Tracker" subtitle="State license data synced from SureLC / NIPR" accentUnderline
        actions={<div className="flex gap-2">
          <button className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><RefreshCw className="w-3.5 h-3.5" /> Sync</button>
          <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> SureLC</a>
        </div>} />

      {/* SureLC sync indicator */}
      <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: `color-mix(in srgb, var(--gc-status-review) 8%, transparent)`, border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>Read-only view — license data sourced from SureLC / NIPR. Last synced: April 14, 2026 at 9:15 AM</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Licenses" value={active} accentTop />
        <GCKPICard label="Expired" value={expired} accentTop delta={{ value: "Renewal needed", positive: false }} />
        <GCKPICard label="Pending" value={pending} accentTop />
        <GCKPICard label="Total States Covered" value={new Set(MOCK.filter(l => l.status === "active").map(l => l.stateCode)).size} accentTop />
      </div>

      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search licenses..." />
    </div>
  );
}
