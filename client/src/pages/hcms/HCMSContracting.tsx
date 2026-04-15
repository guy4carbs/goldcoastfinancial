import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Minus, Send, Copy, Check, Eye } from "lucide-react";
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
  const [showSend, setShowSend] = useState(false);
  const [viewAgent, setViewAgent] = useState<AgentDocs | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendName, setSendName] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const applicationUrl = typeof window !== "undefined" ? `${window.location.origin}/apply` : "/apply";

  const handleSend = () => {
    if (!sendEmail.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setShowSend(false); setSendEmail(""); setSendName(""); }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(applicationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    { key: "id", label: "", width: 60, align: "center" as const, render: (_: any, row: AgentDocs) => (
      <button onClick={() => setViewAgent(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  return (
    <div>
      <GCPageHeader title="Contracting Overview" subtitle="Document execution tracking — 7 required + 2 optional documents per agent" accentUnderline
        actions={
          <button onClick={() => setShowSend(true)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>
            <Send className="w-4 h-4" /> Send Application
          </button>
        } />

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

      {/* View Agent Doc Checklist Popup */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewAgent(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewAgent.agent}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Document Checklist · Submitted {viewAgent.submittedAt} · Reviewer: {viewAgent.reviewer || "Unassigned"}</div>
              </div>
              <button onClick={() => setViewAgent(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: "var(--gc-space-4)", padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Required Documents</span>
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>
                  {viewAgent.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length}/{totalRequired}
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(viewAgent.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length / totalRequired) * 100}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {DOCS.map((doc, di) => (
                <div key={di} style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${viewAgent.docs[di] === "signed" || viewAgent.docs[di] === "uploaded" ? "var(--gc-status-active)" : viewAgent.docs[di] === "pending" ? "var(--gc-status-pending)" : viewAgent.docs[di] === "missing" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)"}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DocIcon status={viewAgent.docs[di]} />
                      <div>
                        <span style={{ fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{doc.label}</span>
                        {!doc.required && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginLeft: 8 }}>(Optional)</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: "var(--gc-text-sm)", color: viewAgent.docs[di] === "signed" || viewAgent.docs[di] === "uploaded" ? "var(--gc-status-active)" : viewAgent.docs[di] === "pending" ? "var(--gc-status-pending)" : viewAgent.docs[di] === "missing" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)", textTransform: "capitalize" as const }}>{viewAgent.docs[di]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Send Application Dialog */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { setShowSend(false); setSent(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Send Application</div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Send the contracting application link to a prospective agent via email.</p>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle className="w-10 h-10" style={{ color: "var(--gc-status-active)" }} />
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Application Sent!</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>Email sent to {sendEmail}</div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Agent Name</label>
                    <input value={sendName} onChange={e => setSendName(e.target.value)} placeholder="Full name" style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email Address</label>
                    <input value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="agent@email.com" type="email" style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)" }} />
                  </div>
                </div>

                {/* Copy link section */}
                <div style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", marginBottom: "var(--gc-space-4)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Or copy application link</div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={applicationUrl} style={{ flex: 1, padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }} />
                    <button onClick={handleCopyLink} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: copied ? "var(--gc-status-active)" : "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)", whiteSpace: "nowrap" as const }}>
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowSend(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleSend} disabled={!sendEmail.trim()} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: sendEmail.trim() ? "pointer" : "not-allowed", fontWeight: 500, opacity: sendEmail.trim() ? 1 : 0.5 }}>
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
