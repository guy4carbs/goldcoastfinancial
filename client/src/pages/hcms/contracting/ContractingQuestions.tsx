import { useState, useMemo, useEffect } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Link } from "wouter";
import { Eye, X as XIcon, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface BackgroundAnswer {
  question?: string;
  answer?: string | boolean;
  explanation?: string;
}

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  backgroundAnswers: BackgroundAnswer[];
  status: string;
}

interface AgentRow {
  userId: string;
  name: string;
  answeredCount: number;
  flaggedCount: number;
  backgroundAnswers: BackgroundAnswer[];
}

function isFlagged(answer: string | boolean | undefined): boolean {
  if (typeof answer === "boolean") return answer;
  if (typeof answer === "string") return answer.toLowerCase() === "yes";
  return false;
}

const tabs = ["All", "Has Flags", "All Clear", "No Answers"] as const;

export default function ContractingQuestions() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [viewing, setViewing] = useState<AgentRow | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/hcms/agents/", { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error(`Failed to fetch agents (${res.status})`); return res.json(); })
      .then((data: Agent[]) => { setAgents(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const rows: AgentRow[] = useMemo(
    () =>
      agents.map((a) => ({
        userId: a.userId,
        name: `${a.firstName} ${a.lastName}`,
        answeredCount: a.backgroundAnswers?.length ?? 0,
        flaggedCount: (a.backgroundAnswers ?? []).filter((ba) => isFlagged(ba.answer)).length,
        backgroundAnswers: a.backgroundAnswers ?? [],
      })),
    [agents]
  );

  const counts = useMemo(
    () => ({
      total: rows.length,
      withAnswers: rows.filter((r) => r.answeredCount > 0).length,
      withFlags: rows.filter((r) => r.flaggedCount > 0).length,
      totalFlags: rows.reduce((s, r) => s + r.flaggedCount, 0),
      allClear: rows.filter((r) => r.answeredCount > 0 && r.flaggedCount === 0).length,
      noAnswers: rows.filter((r) => r.answeredCount === 0).length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    if (tab === "Has Flags") return rows.filter((r) => r.flaggedCount > 0);
    if (tab === "All Clear") return rows.filter((r) => r.answeredCount > 0 && r.flaggedCount === 0);
    if (tab === "No Answers") return rows.filter((r) => r.answeredCount === 0);
    return rows;
  }, [rows, tab]);

  const cols: Column<AgentRow>[] = [
    {
      key: "name",
      label: "Agent",
      sortable: true,
      width: "25%",
      render: (v, row) => (
        <Link href={`/hcms/agents/${row.userId}`}>
          <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
        </Link>
      ),
    },
    {
      key: "answeredCount",
      label: "Questions Answered",
      sortable: true,
      width: "18%",
      align: "center",
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--gc-font-display)",
            fontWeight: 600,
            color: (v as number) > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)",
          }}
        >
          {v as number}
        </span>
      ),
    },
    {
      key: "flaggedCount",
      label: "Flagged",
      sortable: true,
      width: "15%",
      align: "center",
      render: (v) => {
        const f = v as number;
        return f > 0 ? (
          <span className="flex items-center justify-center gap-1" style={{ color: "var(--gc-status-warning)", fontWeight: 600 }}>
            <AlertTriangle className="w-3.5 h-3.5" /> {f}
          </span>
        ) : (
          <span style={{ color: "var(--gc-text-muted)" }}>0</span>
        );
      },
    },
    {
      key: "statusDisplay" as any,
      label: "Status",
      width: "20%",
      render: (_v: any, row: AgentRow) => {
        if (row.answeredCount === 0) {
          return <GCStatusBadge status="warning" />;
        }
        if (row.flaggedCount > 0) {
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 10px",
                borderRadius: "var(--gc-radius-sm)",
                fontSize: "var(--gc-text-sm)",
                fontWeight: 600,
                color: "var(--gc-status-warning)",
                backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 12%, transparent)",
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              {row.flaggedCount} Flagged
            </span>
          );
        }
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 10px",
              borderRadius: "var(--gc-radius-sm)",
              fontSize: "var(--gc-text-sm)",
              fontWeight: 600,
              color: "var(--gc-status-active)",
              backgroundColor: "color-mix(in srgb, var(--gc-status-active) 12%, transparent)",
            }}
          >
            <CheckCircle className="w-3 h-3" />
            All Clear
          </span>
        );
      },
    },
    {
      key: "actions" as any,
      label: "",
      width: "10%",
      align: "center" as const,
      render: (_v: any, row: AgentRow) =>
        <button
          onClick={() => setViewing(row)}
          className="flex items-center gap-1"
          style={{
            padding: "var(--gc-space-1) var(--gc-space-3)",
            backgroundColor: "transparent",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-sm)",
            color: "var(--gc-gold)",
            cursor: "pointer",
            fontSize: "var(--gc-text-sm)",
          }}
        >
          <Eye className="w-3 h-3" /> View
        </button>,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <GCPageHeader title="SureLC Questions" subtitle="Background & disclosure questions" accentUnderline />
        <div className="flex items-center gap-3" style={{
          padding: "var(--gc-space-4)",
          backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)",
          borderRadius: "var(--gc-radius-md)",
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Questions Data</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_QUESTIONS.HEADER}>
        <GCPageHeader title="SureLC Questions" subtitle="Background & disclosure questions across all agents" accentUnderline />
      </div>

      <div data-tour-id={TOUR.ADMIN.CONTRACTING_QUESTIONS.SUMMARY} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.total} accentTop />
        <GCKPICard label="Agents with Answers" value={counts.withAnswers} accentTop
          delta={(counts.total - counts.withAnswers) > 0
            ? { value: `${counts.total - counts.withAnswers} unanswered`, positive: false }
            : { value: "All answered", positive: true }} />
        <GCKPICard
          label="Agents with Flags"
          value={counts.withFlags}
          accentTop
          delta={{ value: counts.withFlags > 0 ? "Review needed" : "None", positive: counts.withFlags === 0 }}
        />
        <GCKPICard
          label="Total Flagged Answers"
          value={counts.totalFlags}
          accentTop
          delta={{ value: counts.totalFlags > 0 ? "Attention required" : "All clear", positive: counts.totalFlags === 0 }}
        />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => {
          const count = t === "All" ? counts.total : t === "Has Flags" ? counts.withFlags : t === "All Clear" ? counts.allClear : counts.noAnswers;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)",
                fontWeight: tab === t ? 500 : 400,
                color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent name..." />

      {/* Question Detail Popup */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 640,
              maxWidth: "95vw",
              maxHeight: "85vh",
              overflow: "auto",
              backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-md)",
              padding: "var(--gc-space-6)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>
                  {viewing.name}
                </div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
                  {viewing.answeredCount} questions answered · {viewing.flaggedCount} flagged
                </div>
              </div>
              <button
                onClick={() => setViewing(null)}
                style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {viewing.backgroundAnswers.length === 0 ? (
                <div style={{
                  padding: "var(--gc-space-4)",
                  backgroundColor: "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border-subtle)",
                  borderRadius: "var(--gc-radius-md)",
                  textAlign: "center",
                  color: "var(--gc-text-muted)",
                  fontSize: "var(--gc-text-sm)",
                }}>
                  No background answers on file for this agent.
                </div>
              ) : viewing.backgroundAnswers.map((ba, idx) => {
                const flagged = isFlagged(ba.answer);
                const answerDisplay = flagged ? "Yes" : "No";
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "var(--gc-space-3) var(--gc-space-4)",
                      backgroundColor: "var(--gc-surface-2)",
                      border: "1px solid var(--gc-border-subtle)",
                      borderRadius: "var(--gc-radius-md)",
                      borderLeft: `3px solid ${flagged ? "var(--gc-status-warning)" : "var(--gc-status-active)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {flagged ? (
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--gc-status-warning)" }} />
                        ) : (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--gc-status-active)" }} />
                        )}
                        <div className="flex flex-col gap-1 flex-1">
                          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontWeight: 600 }}>
                            Question {idx + 1}
                          </span>
                          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", lineHeight: 1.5 }}>
                            {ba.question || `Question ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "2px 12px",
                          borderRadius: "var(--gc-radius-sm)",
                          fontSize: "var(--gc-text-sm)",
                          fontWeight: 600,
                          flexShrink: 0,
                          color: flagged ? "var(--gc-status-warning)" : "var(--gc-status-active)",
                          backgroundColor: `color-mix(in srgb, ${flagged ? "var(--gc-status-warning)" : "var(--gc-status-active)"} 12%, transparent)`,
                        }}
                      >
                        {answerDisplay}
                      </span>
                    </div>
                    {ba.explanation && (
                      <div
                        style={{
                          marginTop: "var(--gc-space-2)",
                          marginLeft: 28,
                          padding: "var(--gc-space-2) var(--gc-space-3)",
                          backgroundColor: "color-mix(in srgb, var(--gc-surface-2) 60%, var(--gc-border-subtle))",
                          borderRadius: "var(--gc-radius-sm)",
                          fontSize: "var(--gc-text-sm)",
                          color: "var(--gc-text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {ba.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link href={`/hcms/agents/${viewing.userId}`}>
              <span className="flex items-center justify-center gap-2 mt-4" style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
                border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)",
                color: "var(--gc-gold)", fontSize: "var(--gc-text-sm)", fontWeight: 500, cursor: "pointer",
                textAlign: "center", display: "block"
              }}>View Full Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
