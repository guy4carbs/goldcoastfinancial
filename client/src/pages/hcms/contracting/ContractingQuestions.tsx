import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Eye, X as XIcon, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Exact SureLC questions from screenshots (19 total)
const SURELC_QUESTIONS = [
  "Have you ever been charged or convicted of or plead guilty or no contest to any Felony, Misdemeanor, federal/state insurance and/or securities or investments regulations and statutes? Have you ever been on probation?",
  "Have you ever been or are you currently being investigated, have any pending indictments, lawsuits, or have you ever been in a lawsuit with insurance company?",
  "Have you ever been alleged to have engaged in any fraud?",
  "Have you ever been found to have engaged in any fraud?",
  "Has any insurance or financial services company, or broker-dealer terminated your contract or appointment or permitted you to resign for reason other than lack of sales?",
  "Have you ever had an appointment with any insurance company terminated for cause or been denied an appointment?",
  "Does any insurer, insured, or other person claim any commission chargeback or other indebtedness from you as a result of any insurance transactions or business?",
  "Has any lawsuit or claim ever been made against your surety company, or errors and omissions insurer, arising out of your sales or practices, or have you been refused surety bonding or E&O coverage?",
  "Have you ever had an insurance or securities license denied, suspended, cancelled or revoked?",
  "Has any state or federal regulatory body found you to have been a cause of an investment OR insurance-related business having its authorization to do business denied, suspended, revoked, or restricted?",
  "Has any state or federal regulatory agency revoked or suspended your license as an attorney, accountant, or federal contractor?",
  "Has any state or federal regulatory agency found you to have made a false statement or omission or been dishonest, unfair, or unethical?",
  "Have you ever had any interruptions in licensing?",
  "Has any state, federal or self-regulatory agency filed a complaint against you, fined, sanctioned, censured, penalized or otherwise disciplined you for a violation of their regulations or state or federal statutes? Have you ever been the subject of a consumer initiated complaint?",
  "Has personally or any insurance or securities brokerage firm with whom you have been associated filed a bankruptcy petition or declared bankruptcy?",
  "Have you ever had any judgments, garnishments, or liens against you?",
  "Are you connected in any way with a bank, savings & loan association, or other lending or financial institution?",
  "Have you ever used any other names or aliases?",
  "Do you have any unresolved matters pending with the Internal Revenue Service or other taxing authority?",
];

interface Answer { questionIndex: number; answer: "Yes" | "No"; details: string; }
interface AgentQuestions { agentId: string; agent: string; answers: Answer[]; updatedAt: string; }

const MOCK: AgentQuestions[] = [
  { agentId: "1", agent: "Sarah Mitchell", updatedAt: "2026-01-10", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: "No" as const, details: "" })) },
  { agentId: "2", agent: "James Rodriguez", updatedAt: "2026-01-12", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: (i === 6 ? "Yes" : "No") as "Yes" | "No", details: i === 6 ? "Outstanding balance of $2,400 with Globe Life from advance repayment — payment plan in place, expected resolution June 2026" : "" })) },
  { agentId: "3", agent: "Michael Chen", updatedAt: "2025-12-15", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: "No" as const, details: "" })) },
  { agentId: "4", agent: "Emily Watson", updatedAt: "2026-04-05", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: "No" as const, details: "" })) },
  { agentId: "5", agent: "David Park", updatedAt: "2025-11-20", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: (i === 14 ? "Yes" : "No") as "Yes" | "No", details: i === 14 ? "Chapter 7 filed 2018, discharged 2019 — fully resolved, no outstanding debts" : "" })) },
  { agentId: "6", agent: "Lisa Thompson", updatedAt: "2026-03-01", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: (i === 15 ? "Yes" : "No") as "Yes" | "No", details: i === 15 ? "Tax lien from 2020 — $4,200, resolved and released March 2024" : "" })) },
  { agentId: "7", agent: "Robert Kim", updatedAt: "", answers: [] },
  { agentId: "8", agent: "Amanda Torres", updatedAt: "2026-04-11", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: "No" as const, details: "" })) },
  { agentId: "9", agent: "Jack Cook", updatedAt: "2025-06-01", answers: SURELC_QUESTIONS.map((_, i) => ({ questionIndex: i, answer: (i === 16 ? "Yes" : "No") as "Yes" | "No", details: i === 16 ? "Managing Member of Gold Coast Financial Partners LLC — business banking relationship with Chase Bank" : "" })) },
];

const flagCount = (a: AgentQuestions) => a.answers.filter(ans => ans.answer === "Yes").length;
const tabs = ["All Agents", "Flagged (Yes Answers)", "Not Answered", "All Clear"] as const;

export default function ContractingQuestions() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [viewing, setViewing] = useState<AgentQuestions | null>(null);
  const [popupPage, setPopupPage] = useState(0);
  const PER_PAGE = 5;

  const counts = useMemo(() => ({
    all: MOCK.length,
    flagged: MOCK.filter(a => flagCount(a) > 0).length,
    notAnswered: MOCK.filter(a => a.answers.length === 0).length,
    allClear: MOCK.filter(a => a.answers.length > 0 && flagCount(a) === 0).length,
    totalFlags: MOCK.reduce((s, a) => s + flagCount(a), 0),
  }), []);

  const filtered = useMemo(() => {
    if (tab === "Flagged (Yes Answers)") return MOCK.filter(a => flagCount(a) > 0);
    if (tab === "Not Answered") return MOCK.filter(a => a.answers.length === 0);
    if (tab === "All Clear") return MOCK.filter(a => a.answers.length > 0 && flagCount(a) === 0);
    return MOCK;
  }, [tab]);

  const cols: Column<AgentQuestions>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "answers", label: "Answered", width: "10%", align: "center", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: (v as Answer[]).length > 0 ? "var(--gc-text-primary)" : "var(--gc-status-terminated)" }}>{(v as Answer[]).length > 0 ? `${(v as Answer[]).length}/19` : "0"}</span> },
    { key: "agentId", label: "Flagged", width: "10%", align: "center", render: (_v, row) => {
      const f = flagCount(row);
      return f > 0
        ? <span className="flex items-center justify-center gap-1" style={{ color: "var(--gc-status-warning)", fontWeight: 600 }}><AlertTriangle className="w-3.5 h-3.5" /> {f}</span>
        : row.answers.length > 0 ? <span style={{ color: "var(--gc-status-active)" }}>0</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span>;
    }},
    { key: "agentId", label: "Flag Details", width: "32%", render: (_v, row) => {
      const flags = row.answers.filter(a => a.answer === "Yes");
      if (flags.length === 0 && row.answers.length > 0) return <span style={{ color: "var(--gc-status-active)", fontSize: "var(--gc-text-sm)" }}>All clear — no disclosures</span>;
      if (row.answers.length === 0) return <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic", fontSize: "var(--gc-text-sm)" }}>Not yet answered</span>;
      return (
        <div className="flex flex-col gap-0.5">
          {flags.slice(0, 2).map((f, i) => (
            <span key={i} style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)" }}>Q{f.questionIndex + 1}: {f.details.slice(0, 60)}{f.details.length > 60 ? "..." : ""}</span>
          ))}
          {flags.length > 2 && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)" }}>+{flags.length - 2} more flags</span>}
        </div>
      );
    }},
    { key: "updatedAt", label: "Last Updated", sortable: true, width: "12%", render: (v) => (v as string) || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Never</span> },
    { key: "agentId", label: "Status", width: "10%", render: (_v, row) => row.answers.length === 0 ? <GCStatusBadge status="warning" /> : flagCount(row) > 0 ? <GCStatusBadge status="review" /> : <GCStatusBadge status="active" /> },
    { key: "agentId", label: "", width: "8%", align: "center", render: (_v, row) => row.answers.length > 0 ? (
      <button onClick={() => { setViewing(row); setPopupPage(0); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    ) : null },
  ];

  return (
    <div>
      <GCPageHeader title="SureLC Questions" subtitle="Background & disclosure questions — 19 standard carrier questions per agent" accentUnderline />

      {/* SureLC info banner */}
      <div className="flex items-start gap-3 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--gc-status-review)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)", lineHeight: 1.5 }}>These are the most common background questions asked by carriers, but not all carriers ask the same questions. The specific questions for each carrier will be asked during the Contracting Request process, and if any of them match these common questions they will inherit the answers provided here.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Agents Answered" value={`${counts.all - counts.notAnswered}/${counts.all}`} accentTop />
        <GCKPICard label="Flagged (Yes)" value={counts.totalFlags} accentTop delta={{ value: counts.totalFlags > 0 ? "Review needed" : "None", positive: counts.totalFlags === 0 }} />
        <GCKPICard label="All Clear" value={counts.allClear} accentTop delta={{ value: "No disclosures", positive: true }} />
        <GCKPICard label="Not Answered" value={counts.notAnswered} accentTop delta={{ value: counts.notAnswered > 0 ? "Action needed" : "Complete", positive: counts.notAnswered === 0 }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All Agents" ? counts.all : t === "Flagged (Yes Answers)" ? counts.flagged : t === "Not Answered" ? counts.notAnswered : counts.allClear;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {/* View Questions Popup */}
      {viewing && (() => {
        const totalPages = Math.ceil(viewing.answers.length / PER_PAGE);
        const paged = viewing.answers.slice(popupPage * PER_PAGE, (popupPage + 1) * PER_PAGE);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewing(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 680, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewing.agent}</div>
                  <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{viewing.answers.length} questions · {flagCount(viewing)} flagged · Updated {viewing.updatedAt}</div>
                </div>
                <button onClick={() => setViewing(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col gap-2">
                {paged.map((a) => (
                  <div key={a.questionIndex} style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${a.answer === "Yes" ? "var(--gc-status-warning)" : "var(--gc-status-active)"}` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-muted)", minWidth: 28, flexShrink: 0 }}>{a.questionIndex + 1}</span>
                        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", lineHeight: 1.5 }}>{SURELC_QUESTIONS[a.questionIndex]}</span>
                      </div>
                      <span style={{ padding: "2px 12px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", fontWeight: 600, flexShrink: 0, color: a.answer === "Yes" ? "var(--gc-status-warning)" : "var(--gc-status-active)", backgroundColor: `color-mix(in srgb, ${a.answer === "Yes" ? "var(--gc-status-warning)" : "var(--gc-status-active)"} 12%, transparent)` }}>{a.answer}</span>
                    </div>
                    {a.details && (
                      <div style={{ marginTop: "var(--gc-space-2)", marginLeft: 40, padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 8%, transparent)", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)", lineHeight: 1.5 }}>
                        {a.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Questions {popupPage * PER_PAGE + 1}–{Math.min((popupPage + 1) * PER_PAGE, viewing.answers.length)} of {viewing.answers.length}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPopupPage(p => Math.max(0, p - 1))} disabled={popupPage === 0} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage === 0 ? "default" : "pointer", opacity: popupPage === 0 ? 0.4 : 1, fontSize: "var(--gc-text-sm)" }}>Prev</button>
                    <button onClick={() => setPopupPage(p => Math.min(totalPages - 1, p + 1))} disabled={popupPage >= totalPages - 1} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", cursor: popupPage >= totalPages - 1 ? "default" : "pointer", opacity: popupPage >= totalPages - 1 ? 0.4 : 1, fontSize: "var(--gc-text-sm)" }}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
