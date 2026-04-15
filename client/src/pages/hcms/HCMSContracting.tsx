import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Minus } from "lucide-react";
import { Link } from "wouter";

const DOCS = [
  { key: "nda", label: "NDA", short: "NDA", required: true },
  { key: "debtRollup", label: "Debt Rollup", short: "Debt", required: true },
  { key: "compliance", label: "Compliance", short: "Comp", required: true },
  { key: "eo", label: "E&O Cert", short: "E&O", required: true },
  { key: "govId", label: "Gov ID", short: "ID", required: true },
  { key: "aml", label: "AML Cert", short: "AML", required: true },
  { key: "directDeposit", label: "Direct Deposit", short: "DD", required: true },
  { key: "voidedCheck", label: "Voided Check", short: "Check", required: false },
  { key: "articles", label: "Articles of Inc.", short: "Art.", required: false },
];

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

const DocIcon = ({ status }: { status: DocStatus }) => {
  if (status === "signed" || status === "uploaded") return <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} />;
  if (status === "pending") return <Clock className="w-3.5 h-3.5" style={{ color: "var(--gc-status-pending)" }} />;
  if (status === "missing") return <XIcon className="w-3.5 h-3.5" style={{ color: "var(--gc-status-terminated)" }} />;
  return <Minus className="w-3.5 h-3.5" style={{ color: "var(--gc-text-muted)", opacity: 0.3 }} />;
};

const isComplete = (a: AgentDocs) => a.docs.every((d, i) => !DOCS[i].required || d === "signed" || d === "uploaded");
const requiredPending = (a: AgentDocs) => a.docs.filter((d, i) => DOCS[i].required && (d === "pending" || d === "missing")).length;

const tabs = ["All Agents", "Missing Docs", "Complete"] as const;

export default function HCMSContracting() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");

  const counts = useMemo(() => {
    const missing = MOCK.filter(a => !isComplete(a)).length;
    const complete = MOCK.filter(a => isComplete(a)).length;
    return { all: MOCK.length, missing, complete };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "Missing Docs") return MOCK.filter(a => !isComplete(a));
    if (tab === "Complete") return MOCK.filter(a => isComplete(a));
    return MOCK;
  }, [tab]);

  const totalRequired = DOCS.filter(d => d.required).length;
  const totalRequiredDocs = MOCK.length * totalRequired;
  const completedRequiredDocs = MOCK.reduce((s, a) => s + a.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length, 0);
  const avgCompletion = Math.round((completedRequiredDocs / totalRequiredDocs) * 100);

  const cols: Column<AgentDocs>[] = [
    { key: "agent", label: "Agent", sortable: true, width: 160, render: (v, row) => (
      <Link href={`/hcms/agents/${row.id}`}>
        <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
      </Link>
    )},
    ...DOCS.map((doc, di) => ({
      key: `doc_${di}`,
      label: doc.short,
      width: 50,
      align: "center" as const,
      render: (_: any, row: AgentDocs) => (
        <div title={`${doc.label}: ${row.docs[di]}${!doc.required ? " (optional)" : ""}`} style={{ display: "flex", justifyContent: "center" }}>
          <DocIcon status={row.docs[di]} />
        </div>
      ),
    })),
    { key: "id", label: "Progress", width: 100, render: (_: any, row: AgentDocs) => {
      const done = row.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length;
      const pct = Math.round((done / totalRequired) * 100);
      return (
        <div className="flex items-center gap-2" style={{ minWidth: 80 }}>
          <div style={{ width: 48, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
          </div>
          <span style={{ fontSize: "var(--gc-text-xs)", color: pct === 100 ? "var(--gc-status-active)" : "var(--gc-text-muted)", whiteSpace: "nowrap" }}>{done}/{totalRequired}</span>
        </div>
      );
    }},
    { key: "submittedAt", label: "Submitted", sortable: true },
    { key: "reviewer", label: "Reviewer", render: (v: any) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Unassigned</span> },
  ];

  return (
    <div>
      <GCPageHeader title="Contracting Overview" subtitle="Document execution tracking — 7 required + 2 optional documents per agent" accentUnderline />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.all} accentTop href="/hcms/agents" />
        <GCKPICard label="Fully Documented" value={counts.complete} accentTop delta={{ value: `${Math.round((counts.complete / counts.all) * 100)}%`, positive: true }} />
        <GCKPICard label="Docs Pending" value={totalRequiredDocs - completedRequiredDocs} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Avg Completion" value={`${avgCompletion}%`} accentTop />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Missing Docs" ? counts.missing : counts.complete;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search agents..." />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const }}>Legend:</span>
        {[
          ["Signed / Uploaded", "var(--gc-status-active)", 1],
          ["Pending", "var(--gc-status-pending)", 1],
          ["Missing", "var(--gc-status-terminated)", 1],
          ["N/A (Optional)", "var(--gc-text-muted)", 0.3],
        ].map(([label, color, opacity]) => (
          <span key={label as string} className="flex items-center gap-1.5" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color as string, opacity: opacity as number }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
