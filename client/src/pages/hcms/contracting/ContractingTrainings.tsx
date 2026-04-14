import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { CheckCircle, X as XIcon } from "lucide-react";
const MOCK = [
  { agent: "Sarah Mitchell", type: "AML", completionDate: "2026-01-15", expirationDate: "2027-01-15", status: "active", certOnFile: true },
  { agent: "Sarah Mitchell", type: "CE Credits (IL)", completionDate: "2025-12-01", expirationDate: "2027-12-01", status: "active", certOnFile: true },
  { agent: "James Rodriguez", type: "AML", completionDate: "2025-06-01", expirationDate: "2026-06-01", status: "active", certOnFile: true },
  { agent: "James Rodriguez", type: "CE Credits (TX)", completionDate: "", expirationDate: "2026-04-30", status: "expired", certOnFile: false },
  { agent: "Michael Chen", type: "AML", completionDate: "2026-02-01", expirationDate: "2027-02-01", status: "active", certOnFile: true },
  { agent: "Michael Chen", type: "CE Credits (CA)", completionDate: "2025-09-15", expirationDate: "2027-09-15", status: "active", certOnFile: true },
  { agent: "Michael Chen", type: "Product Training (Americo)", completionDate: "2026-03-01", expirationDate: "", status: "active", certOnFile: true },
  { agent: "Emily Watson", type: "AML", completionDate: "", expirationDate: "", status: "missing", certOnFile: false },
  { agent: "Emily Watson", type: "CE Credits (FL)", completionDate: "2025-08-01", expirationDate: "2027-08-01", status: "active", certOnFile: true },
  { agent: "David Park", type: "AML", completionDate: "2025-11-01", expirationDate: "2026-11-01", status: "active", certOnFile: true },
  { agent: "David Park", type: "Compliance Training", completionDate: "2026-01-20", expirationDate: "2027-01-20", status: "active", certOnFile: true },
];
const types = ["All", "AML", "CE Credits", "Product Training", "Compliance"];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "type", label: "Training Type", sortable: true },
  { key: "completionDate", label: "Completed", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not completed</span> },
  { key: "expirationDate", label: "Expires", sortable: true, render: (v) => v || "N/A" },
  { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "expired" ? "expired" : "warning"} /> },
  { key: "certOnFile", label: "Certificate", render: (v) => v ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /> },
];
export default function ContractingTrainings() {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => filter === "All" ? MOCK : MOCK.filter(m => m.type.startsWith(filter)), [filter]);
  return (
    <div>
      <GCPageHeader title="Trainings" subtitle="AML, CE credits, product training & compliance certifications" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Certifications" value={MOCK.filter(m => m.status === "active").length} accentTop />
        <GCKPICard label="Expired" value={MOCK.filter(m => m.status === "expired").length} accentTop delta={{ value: "Renewal needed", positive: false }} />
        <GCKPICard label="Missing" value={MOCK.filter(m => m.status === "missing").length} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Certificates on File" value={MOCK.filter(m => m.certOnFile).length} accentTop />
      </div>
      <div className="flex gap-1 mb-4">{types.map(t => <button key={t} onClick={() => setFilter(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: filter === t ? 500 : 400, color: filter === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: filter === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}</div>
      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search trainings..." />
    </div>
  );
}
