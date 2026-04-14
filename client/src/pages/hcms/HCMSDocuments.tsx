import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { id: "1", name: "E&O Certificate 2026", agentName: "Sarah Mitchell", category: "e&o_certificate", uploadDate: "2026-01-10", expirationDate: "2027-01-10", status: "active" },
  { id: "2", name: "IL Life License", agentName: "Sarah Mitchell", category: "state_license", uploadDate: "2024-01-15", expirationDate: "2026-01-15", status: "warning" },
  { id: "3", name: "W-9 Form", agentName: "James Rodriguez", category: "w9", uploadDate: "2025-11-01", expirationDate: "", status: "active" },
  { id: "4", name: "NDA Signed", agentName: "Michael Chen", category: "contract", uploadDate: "2025-02-01", expirationDate: "", status: "active" },
  { id: "5", name: "E&O Certificate 2025", agentName: "David Park", category: "e&o_certificate", uploadDate: "2025-03-01", expirationDate: "2026-03-01", status: "expired" },
];
const catColor: Record<string, string> = { "e&o_certificate": "var(--gc-status-review)", state_license: "var(--gc-status-active)", w9: "var(--gc-text-muted)", contract: "var(--gc-gold)" };
const cols: Column<typeof MOCK[0]>[] = [
  { key: "name", label: "Document", sortable: true },
  { key: "agentName", label: "Agent", sortable: true },
  { key: "category", label: "Category", render: (v) => <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)", color: catColor[v] || "var(--gc-text-muted)", backgroundColor: `color-mix(in srgb, ${catColor[v] || "var(--gc-text-muted)"} 15%, transparent)` }}>{v.replace(/_/g, " ")}</span> },
  { key: "uploadDate", label: "Uploaded", sortable: true },
  { key: "expirationDate", label: "Expires", sortable: true },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
];
export default function HCMSDocuments() {
  return (
    <div>
      <GCPageHeader title="Document Vault" subtitle="Agent document management & compliance tracking" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Upload Document</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Documents" value={5} accentTop />
        <GCKPICard label="E&O Certificates" value={2} accentTop />
        <GCKPICard label="Expiring (30d)" value={1} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Needs Review" value={1} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search documents..." />
    </div>
  );
}
