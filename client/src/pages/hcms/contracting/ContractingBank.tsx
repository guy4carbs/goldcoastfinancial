import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { agent: "Sarah Mitchell", bank: "Chase Bank", accountType: "Checking", routing: "***2814", account: "***9045", ddStatus: "active", lastUpdated: "2026-01-10" },
  { agent: "James Rodriguez", bank: "Bank of America", accountType: "Checking", routing: "***1190", account: "***6723", ddStatus: "active", lastUpdated: "2026-01-12" },
  { agent: "Michael Chen", bank: "Wells Fargo", accountType: "Savings", routing: "***3302", account: "***8841", ddStatus: "active", lastUpdated: "2025-12-15" },
  { agent: "Emily Watson", bank: "US Bank", accountType: "Checking", routing: "***4455", account: "***2210", ddStatus: "pending", lastUpdated: "2026-04-05" },
  { agent: "David Park", bank: "Citibank", accountType: "Checking", routing: "***7721", account: "***3389", ddStatus: "active", lastUpdated: "2026-02-20" },
  { agent: "Lisa Thompson", bank: "PNC Bank", accountType: "Checking", routing: "***9910", account: "***1147", ddStatus: "missing", lastUpdated: "" },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "bank", label: "Bank Name", sortable: true },
  { key: "accountType", label: "Account Type" },
  { key: "routing", label: "Routing #", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "account", label: "Account #", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "ddStatus", label: "Direct Deposit", render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "pending" ? "pending" : "warning"} /> },
  { key: "lastUpdated", label: "Last Updated", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Never</span> },
];
export default function ContractingBank() {
  return (
    <div>
      <GCPageHeader title="Bank Details" subtitle="Agent banking information & direct deposit status" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Active Direct Deposit" value={MOCK.filter(m => m.ddStatus === "active").length} accentTop />
        <GCKPICard label="Pending Setup" value={MOCK.filter(m => m.ddStatus === "pending").length} accentTop />
        <GCKPICard label="Missing" value={MOCK.filter(m => m.ddStatus === "missing").length} accentTop delta={{ value: "Action needed", positive: false }} />
      </div>
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search agents..." />
    </div>
  );
}
