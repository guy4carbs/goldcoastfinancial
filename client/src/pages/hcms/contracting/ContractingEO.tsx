import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { CheckCircle, X as XIcon } from "lucide-react";
const MOCK = [
  { agent: "Sarah Mitchell", provider: "NAPA", policyNumber: "EO-2026-445821", coverage: "$1,000,000", effective: "2026-01-10", expires: "2027-01-10", status: "active", certOnFile: true },
  { agent: "James Rodriguez", provider: "CalSurance", policyNumber: "EO-2025-331209", coverage: "$1,000,000", effective: "2025-03-01", expires: "2026-03-01", status: "active", certOnFile: true },
  { agent: "Michael Chen", provider: "NAPA", policyNumber: "EO-2025-887412", coverage: "$2,000,000", effective: "2025-06-01", expires: "2026-06-01", status: "active", certOnFile: true },
  { agent: "Emily Watson", provider: "EOforLess", policyNumber: "EO-2024-119003", coverage: "$1,000,000", effective: "2024-08-01", expires: "2025-08-01", status: "expired", certOnFile: false },
  { agent: "David Park", provider: "NAPA", policyNumber: "EO-2025-554210", coverage: "$1,000,000", effective: "2025-09-01", expires: "2026-09-01", status: "active", certOnFile: true },
  { agent: "Lisa Thompson", provider: "", policyNumber: "", coverage: "", effective: "", expires: "", status: "missing", certOnFile: false },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "provider", label: "Provider", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
  { key: "policyNumber", label: "Policy #", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : "—" },
  { key: "coverage", label: "Coverage", render: (v) => v || "—" },
  { key: "effective", label: "Effective", render: (v) => v || "—" },
  { key: "expires", label: "Expires", sortable: true, render: (v) => v || "—" },
  { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "expired" ? "expired" : "warning"} /> },
  { key: "certOnFile", label: "Certificate", render: (v) => v ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /> },
];
export default function ContractingEO() {
  return (
    <div>
      <GCPageHeader title="E&O Insurance" subtitle="Errors & Omissions insurance tracking across all agents" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Policies" value={MOCK.filter(m => m.status === "active").length} accentTop />
        <GCKPICard label="Expired" value={MOCK.filter(m => m.status === "expired").length} accentTop delta={{ value: "Renewal needed", positive: false }} />
        <GCKPICard label="Missing E&O" value={MOCK.filter(m => m.status === "missing").length} accentTop delta={{ value: "Critical", positive: false }} />
        <GCKPICard label="Certificates on File" value={MOCK.filter(m => m.certOnFile).length} accentTop />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search agents..." />
    </div>
  );
}
