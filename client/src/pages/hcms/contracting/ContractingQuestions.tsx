import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, type Column } from "@/components/gc";
import { AlertTriangle } from "lucide-react";
const QUESTIONS = [
  "Have you ever been convicted of a felony?",
  "Have you ever filed for bankruptcy?",
  "Have you ever had an insurance license revoked or suspended?",
  "Have you ever been named in any regulatory action?",
  "Have you ever been terminated by an insurance carrier?",
  "Are you currently involved in any litigation?",
  "Do you have any outstanding debts to insurance carriers?",
  "Have you ever had a complaint filed against you?",
];
const AGENTS_ANSWERS: { agent: string; answers: { question: string; answer: "No" | "Yes"; details: string; updatedAt: string }[] }[] = [
  { agent: "Sarah Mitchell", answers: QUESTIONS.map((q, i) => ({ question: q, answer: "No" as const, details: "", updatedAt: "2026-01-10" })) },
  { agent: "James Rodriguez", answers: QUESTIONS.map((q, i) => ({ question: q, answer: i === 6 ? "Yes" as const : "No" as const, details: i === 6 ? "Outstanding balance of $2,400 with Globe Life from advance repayment — payment plan in place" : "", updatedAt: "2026-01-12" })) },
  { agent: "Michael Chen", answers: QUESTIONS.map((q) => ({ question: q, answer: "No" as const, details: "", updatedAt: "2025-12-15" })) },
  { agent: "Emily Watson", answers: QUESTIONS.map((q) => ({ question: q, answer: "No" as const, details: "", updatedAt: "2026-04-05" })) },
  { agent: "David Park", answers: QUESTIONS.map((q, i) => ({ question: q, answer: i === 1 ? "Yes" as const : "No" as const, details: i === 1 ? "Chapter 7 discharged 2019 — fully resolved" : "", updatedAt: "2025-11-20" })) },
];
const flat = AGENTS_ANSWERS.flatMap(a => a.answers.map(ans => ({ agent: a.agent, ...ans })));
const flagged = flat.filter(f => f.answer === "Yes");
const tabs = ["All Agents", "Flagged Only"] as const;
const cols: Column<typeof flat[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "question", label: "Question" },
  { key: "answer", label: "Answer", sortable: true, render: (v) => v === "Yes" ? <span className="flex items-center gap-1" style={{ color: "var(--gc-status-warning)", fontWeight: 500 }}><AlertTriangle className="w-3.5 h-3.5" /> Yes</span> : <span style={{ color: "var(--gc-status-active)" }}>No</span> },
  { key: "details", label: "Details", render: (v) => v || "—" },
  { key: "updatedAt", label: "Updated" },
];
export default function ContractingQuestions() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const data = tab === "Flagged Only" ? flagged : flat;
  return (
    <div>
      <GCPageHeader title="SureLC Questions" subtitle="Background & disclosure questions — stored answers per agent" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Total Responses" value={flat.length} accentTop />
        <GCKPICard label="Flagged (Yes)" value={flagged.length} accentTop delta={{ value: "Review needed", positive: false }} />
        <GCKPICard label="Agents Answered" value={AGENTS_ANSWERS.length} accentTop />
      </div>
      <div className="flex gap-1 mb-4">{tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t} ({tab === t ? data.length : t === "Flagged Only" ? flagged.length : flat.length})</button>)}</div>
      <GCDataTable columns={cols} data={data} searchable searchPlaceholder="Search by agent or question..." pageSize={10} />
    </div>
  );
}
