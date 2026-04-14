import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Minus } from "lucide-react";

const DOCS = ["NDA", "Debt Rollup", "Compliance", "E&O Cert", "Gov ID", "AML Cert", "Direct Deposit", "Voided Check", "Articles of Inc."] as const;
const REQ = [true, true, true, true, true, true, true, false, false]; // required flags

type DocStatus = "signed" | "uploaded" | "pending" | "missing" | "n/a";
interface AgentDocs { id: string; agent: string; docs: DocStatus[]; submittedAt: string; reviewer: string | null; }

const MOCK: AgentDocs[] = [
  { id: "1", agent: "Sarah Mitchell", docs: ["signed", "signed", "pending", "uploaded", "uploaded", "uploaded", "uploaded", "missing", "n/a"], submittedAt: "2026-04-01", reviewer: "Jack Cook" },
  { id: "2", agent: "James Rodriguez", docs: ["signed", "signed", "signed", "uploaded", "uploaded", "uploaded", "uploaded", "uploaded", "n/a"], submittedAt: "2026-04-08", reviewer: "Nicholas Gallagher" },
  { id: "3", agent: "Michael Chen", docs: ["signed", "signed", "signed", "uploaded", "uploaded", "uploaded", "uploaded", "uploaded", "n/a"], submittedAt: "2026-03-15", reviewer: "Jack Cook" },
  { id: "4", agent: "Emily Watson", docs: ["signed", "signed", "pending", "uploaded", "uploaded", "pending", "uploaded", "missing", "n/a"], submittedAt: "2026-04-05", reviewer: null },
  { id: "5", agent: "David Park", docs: ["pending", "pending", "pending", "uploaded", "uploaded", "pending", "pending", "missing", "n/a"], submittedAt: "2026-04-10", reviewer: null },
  { id: "6", agent: "Lisa Thompson", docs: ["signed", "signed", "signed", "uploaded", "uploaded", "uploaded", "uploaded", "uploaded", "n/a"], submittedAt: "2026-02-20", reviewer: "Jack Cook" },
  { id: "7", agent: "Robert Kim", docs: ["pending", "pending", "pending", "pending", "pending", "pending", "pending", "missing", "n/a"], submittedAt: "2026-04-12", reviewer: null },
  { id: "8", agent: "Amanda Torres", docs: ["signed", "pending", "pending", "uploaded", "uploaded", "pending", "pending", "missing", "uploaded"], submittedAt: "2026-04-11", reviewer: "Nicholas Gallagher" },
];

const Icon = ({ status }: { status: DocStatus }) => {
  if (status === "signed" || status === "uploaded") return <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />;
  if (status === "pending") return <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />;
  if (status === "missing") return <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />;
  return <Minus className="w-4 h-4" style={{ color: "var(--gc-text-muted)", opacity: 0.3 }} />;
};

const tabs = ["All Agents", "Missing Docs", "Complete"];

export default function HCMSContracting() {
  const [tab, setTab] = useState("All Agents");

  const filtered = useMemo(() => {
    if (tab === "All Agents") return MOCK;
    if (tab === "Missing Docs") return MOCK.filter(a => a.docs.some((d, i) => REQ[i] && (d === "pending" || d === "missing")));
    return MOCK.filter(a => a.docs.every((d, i) => !REQ[i] || d === "signed" || d === "uploaded"));
  }, [tab]);

  const totalAgents = MOCK.length;
  const fullyComplete = MOCK.filter(a => a.docs.every((d, i) => !REQ[i] || d === "signed" || d === "uploaded")).length;
  const docsPending = MOCK.reduce((sum, a) => sum + a.docs.filter((d, i) => REQ[i] && (d === "pending" || d === "missing")).length, 0);

  const cols: Column<AgentDocs>[] = [
    { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    ...DOCS.map((doc, di) => ({
      key: `doc_${di}`,
      label: doc,
      render: (_: any, row: AgentDocs) => <Icon status={row.docs[di]} />,
    })),
    { key: "submittedAt", label: "Submitted", sortable: true },
    { key: "reviewer", label: "Reviewer", render: (v: any) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Unassigned</span> },
  ];

  return (
    <div>
      <GCPageHeader title="Contracting Status" subtitle="Document execution tracking across all agents — 9 required documents" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={totalAgents} accentTop />
        <GCKPICard label="Fully Documented" value={fullyComplete} accentTop delta={{ value: `${Math.round((fullyComplete / totalAgents) * 100)}% complete`, positive: true }} />
        <GCKPICard label="Documents Pending" value={docsPending} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Avg Completion" value={`${Math.round(MOCK.reduce((s, a) => s + a.docs.filter((d, i) => REQ[i] && (d === "signed" || d === "uploaded")).length, 0) / (totalAgents * DOCS.filter((_, i) => REQ[i]).length) * 100)}%`} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search agents..." />

      <div className="flex items-center gap-6 mt-4">
        {[["Signed/Uploaded", "var(--gc-status-active)"], ["Pending", "var(--gc-status-pending)"], ["Missing", "var(--gc-status-terminated)"], ["N/A", "var(--gc-text-muted)"]].map(([label, color]) => (
          <span key={label as string} className="flex items-center gap-1.5" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color as string, opacity: label === "N/A" ? 0.3 : 1 }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
