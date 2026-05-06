import { useState } from "react";
import { SURELC_QUESTIONS, type BackgroundAnswer } from "../backgroundQuestions";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  answers: BackgroundAnswer[];
  setAnswers: (a: BackgroundAnswer[]) => void;
}

const PER_PAGE = 5;

export function StepBackgroundQuestions({ answers, setAnswers }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(SURELC_QUESTIONS.length / PER_PAGE);
  const start = page * PER_PAGE;
  const visible = SURELC_QUESTIONS.slice(start, start + PER_PAGE);

  const getAnswer = (idx: number) => answers.find(a => a.questionIndex === idx);

  const setAnswer = (idx: number, answer: "Yes" | "No") => {
    const existing = answers.filter(a => a.questionIndex !== idx);
    setAnswers([...existing, { questionIndex: idx, answer, details: getAnswer(idx)?.details || "" }]);
  };

  const setDetails = (idx: number, details: string) => {
    const existing = answers.filter(a => a.questionIndex !== idx);
    const current = getAnswer(idx);
    setAnswers([...existing, { questionIndex: idx, answer: current?.answer || "No", details }]);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Background Questions</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>
        Answer all 19 questions honestly. These are required by SureLC for contracting compliance.
        <span style={{ color: "var(--gc-text-muted)", marginLeft: 8 }}>Page {page + 1} of {totalPages}</span>
      </p>

      <div className="flex flex-col gap-4">
        {visible.map((q, vi) => {
          const idx = start + vi;
          const a = getAnswer(idx);
          return (
            <div key={idx} style={{
              padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface)",
              border: `1px solid ${a?.answer === "Yes" ? "color-mix(in srgb, var(--gc-status-warning) 40%, transparent)" : "var(--gc-border)"}`,
              borderRadius: "var(--gc-radius-sm)",
            }}>
              <div className="flex gap-3 items-start">
                <span style={{
                  minWidth: 24, height: 24, borderRadius: "var(--gc-radius-full)",
                  backgroundColor: "var(--gc-surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--gc-text-xs)", fontWeight: 600, color: "var(--gc-text-muted)", flexShrink: 0,
                }}>{idx + 1}</span>
                <div className="flex-1">
                  <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", lineHeight: 1.5, marginBottom: "var(--gc-space-2)" }}>{q}</p>
                  <div className="flex gap-2">
                    {(["No", "Yes"] as const).map(v => (
                      <button key={v} onClick={() => setAnswer(idx, v)} style={{
                        padding: "4px 16px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-xs)", fontWeight: 500,
                        border: `1px solid ${a?.answer === v ? (v === "Yes" ? "var(--gc-status-warning)" : "var(--gc-status-active)") : "var(--gc-border)"}`,
                        backgroundColor: a?.answer === v ? (v === "Yes" ? "color-mix(in srgb, var(--gc-status-warning) 12%, transparent)" : "color-mix(in srgb, var(--gc-status-active) 12%, transparent)") : "transparent",
                        color: a?.answer === v ? (v === "Yes" ? "var(--gc-status-warning)" : "var(--gc-status-active)") : "var(--gc-text-muted)",
                        cursor: "pointer",
                      }}>{v}</button>
                    ))}
                  </div>
                  {a?.answer === "Yes" && (
                    <textarea
                      value={a.details} onChange={e => setDetails(idx, e.target.value)}
                      placeholder="Please explain..."
                      rows={2}
                      style={{
                        width: "100%", marginTop: "var(--gc-space-2)", padding: "var(--gc-space-2)",
                        backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
                        borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)",
                        fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", resize: "vertical",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: "var(--gc-space-1) var(--gc-space-2)", background: "none", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: page === 0 ? "var(--gc-text-muted)" : "var(--gc-text-secondary)", cursor: page === 0 ? "default" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: 28, height: 28, borderRadius: "var(--gc-radius-full)", border: "none",
              backgroundColor: page === i ? "var(--gc-gold)" : "var(--gc-surface-2)",
              color: page === i ? "var(--gc-btn-primary-text)" : "var(--gc-text-muted)",
              fontSize: "var(--gc-text-xs)", fontWeight: 600, cursor: "pointer",
            }}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            style={{ padding: "var(--gc-space-1) var(--gc-space-2)", background: "none", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: page === totalPages - 1 ? "var(--gc-text-muted)" : "var(--gc-text-secondary)", cursor: page === totalPages - 1 ? "default" : "pointer", opacity: page === totalPages - 1 ? 0.4 : 1 }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
