import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react";

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

const PER_PAGE = 5;

function parseAnswers(raw: any): any[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AgentQuestions() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? "Please log in again" : "Failed to load"); return r.json(); })
      .then(d => { if (d?.user) setData(d); else setError("Profile data unavailable"); })
      .catch(e => setError(e.message || "Network error"));
  }, []);

  // Error state
  if (error) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="My Background Questions" subtitle="SureLC compliance questions" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load questions</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};
  const answers = parseAnswers(profile.backgroundAnswers);
  const flagged = answers.filter((a: any) => a.answer === "Yes").length;
  const totalPages = Math.ceil(SURELC_QUESTIONS.length / PER_PAGE);
  const start = page * PER_PAGE;
  const visible = SURELC_QUESTIONS.slice(start, start + PER_PAGE);

  return (
    <div>
      <GCPageHeader title="My Background Questions" subtitle={`${answers.length}/19 answered · ${flagged} flagged`} accentUnderline />

      {answers.length === 0 && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-gold) 20%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <Info className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>Background questions will be populated once your application is fully processed.</span>
        </div>
      )}

      <div data-tour-id="agent-questions-list" className="flex flex-col gap-3">
        {visible.map((q, vi) => {
          const idx = start + vi;
          const answer = answers.find((a: any) => a.questionIndex === idx);
          return (
            <div key={idx} style={{
              padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)",
              border: `1px solid ${answer?.answer === "Yes" ? "color-mix(in srgb, var(--gc-status-warning) 40%, transparent)" : "var(--gc-border)"}`,
              borderRadius: "var(--gc-radius-sm)",
            }}>
              <div className="flex gap-3 items-start">
                <span style={{
                  minWidth: 24, height: 24, borderRadius: "var(--gc-radius-full)",
                  backgroundColor: "var(--gc-surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--gc-text-xs)", fontWeight: 600, color: "var(--gc-text-muted)", flexShrink: 0,
                }}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", lineHeight: 1.5, marginBottom: "var(--gc-space-1)" }}>{q}</p>
                  {answer ? (
                    <div className="flex items-start gap-2">
                      {answer.answer === "No"
                        ? <><CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--gc-status-active)" }} /><span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)" }}>No</span></>
                        : <><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--gc-status-warning)" }} /><span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)" }}>Yes</span></>}
                      {answer.answer === "Yes" && answer.details && (
                        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginLeft: 8, wordBreak: "break-word" }}>— {answer.details}</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not answered</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div data-tour-id="agent-questions-progress" className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "var(--gc-space-1) var(--gc-space-2)", background: "none", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: page === 0 ? "var(--gc-text-muted)" : "var(--gc-text-secondary)", cursor: page === 0 ? "default" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{ width: 28, height: 28, borderRadius: "var(--gc-radius-full)", border: "none", backgroundColor: page === i ? "var(--gc-gold)" : "var(--gc-surface-2)", color: page === i ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)", fontSize: "var(--gc-text-xs)", fontWeight: 600, cursor: "pointer" }}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ padding: "var(--gc-space-1) var(--gc-space-2)", background: "none", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: page === totalPages - 1 ? "var(--gc-text-muted)" : "var(--gc-text-secondary)", cursor: page === totalPages - 1 ? "default" : "pointer", opacity: page === totalPages - 1 ? 0.4 : 1 }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
