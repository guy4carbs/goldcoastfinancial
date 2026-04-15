import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { CheckCircle, X as XIcon } from "lucide-react";

interface BankRecord {
  agentId: string; agent: string; bank: string; accountType: string;
  routing: string; account: string; ddStatus: "active" | "pending" | "missing";
  ddFormOnFile: boolean; voidedCheckOnFile: boolean; lastUpdated: string;
}

const MOCK: BankRecord[] = [
  { agentId: "1", agent: "Sarah Mitchell", bank: "Chase Bank", accountType: "Checking", routing: "***2814", account: "***9045", ddStatus: "active", ddFormOnFile: true, voidedCheckOnFile: false, lastUpdated: "2026-01-10" },
  { agentId: "2", agent: "James Rodriguez", bank: "Bank of America", accountType: "Checking", routing: "***1190", account: "***6723", ddStatus: "active", ddFormOnFile: true, voidedCheckOnFile: true, lastUpdated: "2026-01-12" },
  { agentId: "3", agent: "Michael Chen", bank: "Wells Fargo", accountType: "Savings", routing: "***3302", account: "***8841", ddStatus: "active", ddFormOnFile: true, voidedCheckOnFile: true, lastUpdated: "2025-12-15" },
  { agentId: "4", agent: "Emily Watson", bank: "US Bank", accountType: "Checking", routing: "***4455", account: "***2210", ddStatus: "pending", ddFormOnFile: false, voidedCheckOnFile: false, lastUpdated: "2026-04-05" },
  { agentId: "5", agent: "David Park", bank: "Citibank", accountType: "Checking", routing: "***7721", account: "***3389", ddStatus: "active", ddFormOnFile: true, voidedCheckOnFile: true, lastUpdated: "2026-02-20" },
  { agentId: "6", agent: "Lisa Thompson", bank: "", accountType: "", routing: "", account: "", ddStatus: "missing", ddFormOnFile: false, voidedCheckOnFile: false, lastUpdated: "" },
  { agentId: "7", agent: "Robert Kim", bank: "", accountType: "", routing: "", account: "", ddStatus: "missing", ddFormOnFile: false, voidedCheckOnFile: false, lastUpdated: "" },
  { agentId: "8", agent: "Amanda Torres", bank: "TD Bank", accountType: "Checking", routing: "***5501", account: "***7722", ddStatus: "pending", ddFormOnFile: true, voidedCheckOnFile: false, lastUpdated: "2026-04-11" },
];

const tabs = ["All", "Active", "Pending", "Missing"] as const;
const FileIcon = ({ ok }: { ok: boolean }) => ok
  ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} />
  : <XIcon className="w-3.5 h-3.5" style={{ color: "var(--gc-status-terminated)" }} />;

const cols: Column<BankRecord>[] = [
  { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
  { key: "bank", label: "Bank Name", sortable: true, width: "17%", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not provided</span> },
  { key: "accountType", label: "Type", width: "10%", render: (v) => v || "—" },
  { key: "routing", label: "Routing #", width: "10%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
  { key: "account", label: "Account #", width: "10%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
  { key: "ddFormOnFile", label: "DD Form", width: "8%", align: "center", render: (v) => <FileIcon ok={v} /> },
  { key: "voidedCheckOnFile", label: "Voided Check", width: "10%", align: "center", render: (v) => <FileIcon ok={v} /> },
  { key: "ddStatus", label: "Status", width: "10%", render: (v) => <GCStatusBadge status={v === "active" ? "active" : v === "pending" ? "pending" : "warning"} /> },
  { key: "lastUpdated", label: "Updated", sortable: true, width: "7%", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Never</span> },
];

export default function ContractingBank() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");

  const counts = useMemo(() => ({
    all: MOCK.length,
    active: MOCK.filter(m => m.ddStatus === "active").length,
    pending: MOCK.filter(m => m.ddStatus === "pending").length,
    missing: MOCK.filter(m => m.ddStatus === "missing").length,
    voidedChecks: MOCK.filter(m => m.voidedCheckOnFile).length,
  }), []);

  const filtered = useMemo(() => {
    if (tab === "All") return MOCK;
    return MOCK.filter(m => m.ddStatus === tab.toLowerCase());
  }, [tab]);

  return (
    <div>
      <GCPageHeader title="Bank Details" subtitle="Agent banking information, direct deposit forms & voided check tracking" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Direct Deposit" value={counts.active} accentTop />
        <GCKPICard label="Pending Setup" value={counts.pending} accentTop delta={{ value: "Awaiting forms", positive: false }} />
        <GCKPICard label="Missing Bank Info" value={counts.missing} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Voided Checks on File" value={counts.voidedChecks} accentTop delta={{ value: `${counts.all - counts.voidedChecks} missing`, positive: false }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All" ? counts.all : t === "Active" ? counts.active : t === "Pending" ? counts.pending : counts.missing;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent or bank..." />
    </div>
  );
}
