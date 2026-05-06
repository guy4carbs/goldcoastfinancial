import { useState, useMemo, useEffect, useRef } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { CheckCircle, Clock, X as XIcon, Minus, Send, Copy, Check, Eye, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const LEGAL_ENTITY_NAME = "Gold Coast Financial Partners LLC";
function uplineLabel(u: { firstName: string; lastName: string; displayName?: string; role?: string; contractLevel: number }): string {
  if (u.role === "owner" || u.contractLevel >= 120) return LEGAL_ENTITY_NAME;
  return u.displayName || `${u.firstName} ${u.lastName}`.trim();
}

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

interface Agent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  joinedAt: string;
  ndaStatus: string;
  ndaSignedAt: string | null;
  debtRollupStatus: string;
  debtRollupSignedAt: string | null;
  complianceStatus: string;
  complianceSignedAt: string | null;
  eoCertificateKey: string | null;
  driversLicenseKey: string | null;
  amlCertificateKey: string | null;
  directDepositFormKey: string | null;
  articlesKey: string | null;
  allCompleted: boolean;
  dbaType: string;
  docsSigned: number;
  docsUploaded: number;
}

interface AgentDocs {
  id: string;
  agent: string;
  docs: DocStatus[];
  submittedAt: string;
}

function deriveDocStatuses(agent: Agent): DocStatus[] {
  const nda: DocStatus = agent.ndaStatus === "signed" ? "signed" : "pending";
  const debtRollup: DocStatus = agent.debtRollupStatus === "signed" ? "signed" : "pending";
  const compliance: DocStatus = agent.complianceStatus === "signed" ? "signed" : "pending";
  const eo: DocStatus = agent.eoCertificateKey ? "uploaded" : "missing";
  const govId: DocStatus = agent.driversLicenseKey ? "uploaded" : "missing";
  const aml: DocStatus = agent.amlCertificateKey ? "uploaded" : "missing";
  const directDeposit: DocStatus = agent.directDepositFormKey ? "uploaded" : "missing";
  const voidedCheck: DocStatus = "n/a";
  const articles: DocStatus = agent.articlesKey
    ? "uploaded"
    : agent.dbaType === "business_entity"
      ? "missing"
      : "n/a";

  return [nda, debtRollup, compliance, eo, govId, aml, directDeposit, voidedCheck, articles];
}

function transformAgent(agent: Agent): AgentDocs {
  return {
    id: agent.userId,
    agent: `${agent.firstName} ${agent.lastName}`,
    docs: deriveDocStatuses(agent),
    submittedAt: agent.joinedAt ? new Date(agent.joinedAt).toISOString().split("T")[0] : "",
  };
}

const DocIcon = ({ status }: { status: DocStatus }) => {
  if (status === "signed" || status === "uploaded") return <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} />;
  if (status === "pending") return <Clock className="w-3.5 h-3.5" style={{ color: "var(--gc-status-pending)" }} />;
  if (status === "missing") return <XIcon className="w-3.5 h-3.5" style={{ color: "var(--gc-status-terminated)" }} />;
  return <Minus className="w-3.5 h-3.5" style={{ color: "var(--gc-text-muted)", opacity: 0.3 }} />;
};

const isComplete = (a: AgentDocs) => a.docs.every((d, i) => !DOCS[i].required || d === "signed" || d === "uploaded");

const tabs = ["All Agents", "Missing Docs", "Complete"] as const;

export default function HCMSContracting() {
  const [tab, setTab] = useState<typeof tabs[number]>("All Agents");
  const [showSend, setShowSend] = useState(false);
  const [viewAgent, setViewAgent] = useState<AgentDocs | null>(null);
  const [sendFirst, setSendFirst] = useState("");
  const [sendLast, setSendLast] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sentInfo, setSentInfo] = useState<{ name: string; email: string; url: string; emailSent: boolean; contractLevel: string; uplineName: string } | null>(null);
  const [uplines, setUplines] = useState<{ id: string; firstName: string; lastName: string; displayName?: string; role?: string; contractLevel: number; title: string }[]>([]);
  const [sendUpline, setSendUpline] = useState("");
  const [sendContract, setSendContract] = useState("");
  const [uplineOpen, setUplineOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [copied, setCopied] = useState(false);

  // Data fetching state
  const [agents, setAgents] = useState<AgentDocs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/hcms/agents/", { credentials: "include" });
      if (!resp.ok) {
        throw new Error(`Failed to load agents (${resp.status})`);
      }
      const data: Agent[] = await resp.json();
      setAgents(data.map(transformAgent));
    } catch (err: any) {
      setError(err.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/hcms/hierarchy/uplines", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setUplines(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAgents();
  }, []);

  const closeSendDialog = () => {
    if (sendTimerRef.current) { clearTimeout(sendTimerRef.current); sendTimerRef.current = null; }
    setSent(false); setSentInfo(null); setSendError("");
    setShowSend(false);
    setSendFirst(""); setSendLast(""); setSendEmail(""); setSendPhone("");
    setSendUpline(""); setSendContract("");
  };

  const applicationUrl = typeof window !== "undefined" ? `${window.location.origin}/apply` : "/apply";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(applicationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const counts = useMemo(() => {
    const missing = agents.filter(a => !isComplete(a)).length;
    const complete = agents.filter(a => isComplete(a)).length;
    return { all: agents.length, missing, complete };
  }, [agents]);

  const filtered = useMemo(() => {
    if (tab === "Missing Docs") return agents.filter(a => !isComplete(a));
    if (tab === "Complete") return agents.filter(a => isComplete(a));
    return agents;
  }, [tab, agents]);

  const totalRequired = DOCS.filter(d => d.required).length;
  const totalRequiredDocs = agents.length * totalRequired;
  const completedRequiredDocs = agents.reduce((s, a) => s + a.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length, 0);
  const avgCompletion = totalRequiredDocs > 0 ? Math.round((completedRequiredDocs / totalRequiredDocs) * 100) : 0;

  const cols: Column<AgentDocs>[] = [
    { key: "agent", label: "Agent", sortable: true, width: "16%", render: (v, row) => (
      <Link href={`/hcms/agents/${row.id}`}>
        <span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span>
      </Link>
    )},
    { key: "docStatus", label: "Documents", width: "16%", render: (_: any, row: AgentDocs) => (
      <div className="flex items-center gap-0.5">
        {row.docs.map((d, i) => (
          <div key={i} title={`${DOCS[i].label}: ${d}`} style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: d === "signed" || d === "uploaded" ? "var(--gc-status-active)" : d === "pending" ? "var(--gc-status-pending)" : d === "missing" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)",
            opacity: d === "n/a" ? 0.2 : 1,
          }} />
        ))}
      </div>
    )},
    { key: "completion", label: "Completion", width: "18%", render: (_: any, row: AgentDocs) => {
      const done = row.docs.filter((d, i) => DOCS[i].required && (d === "signed" || d === "uploaded")).length;
      const pct = Math.round((done / totalRequired) * 100);
      return (
        <div className="flex items-center gap-3">
          <div style={{ width: 80, height: 6, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)", transition: "width var(--gc-transition-normal)" }} />
          </div>
          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600, color: pct === 100 ? "var(--gc-status-active)" : "var(--gc-text-primary)" }}>{done}/{totalRequired}</span>
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{pct}%</span>
        </div>
      );
    }},
    { key: "signedCount", label: "Signed", width: "8%", align: "center" as const, render: (_: any, row: AgentDocs) => {
      const c = row.docs.filter(d => d === "signed").length;
      return <span style={{ color: c > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{c}</span>;
    }},
    { key: "uploadedCount", label: "Uploaded", width: "8%", align: "center" as const, render: (_: any, row: AgentDocs) => {
      const c = row.docs.filter(d => d === "uploaded").length;
      return <span style={{ color: c > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{c}</span>;
    }},
    { key: "pendingCount", label: "Pending", width: "8%", align: "center" as const, render: (_: any, row: AgentDocs) => {
      const c = row.docs.filter(d => d === "pending" || d === "missing").length;
      return <span style={{ color: c > 0 ? "var(--gc-status-warning)" : "var(--gc-text-muted)" }}>{c}</span>;
    }},
    { key: "submittedAt", label: "Joined", sortable: true, width: "12%", render: (v) => {
      if (!v) return "\u2014";
      try {
        const d = new Date(v);
        return isNaN(d.getTime()) ? "\u2014" : `${String(d.getUTCMonth()+1).padStart(2,"0")}/${String(d.getUTCDate()).padStart(2,"0")}/${d.getUTCFullYear()}`;
      } catch { return "\u2014"; }
    }},
    { key: "actions", label: "", width: "8%", align: "center" as const, render: (_: any, row: AgentDocs) => (
      <button onClick={() => setViewAgent(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
    )},
  ];

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.CONTRACTING_OVERVIEW.HEADER}>
        <GCPageHeader title="Contracting Overview" subtitle="Document execution tracking — 7 required + 2 optional documents per agent" accentUnderline
          actions={
            <button data-tour-id={TOUR.ADMIN.CONTRACTING_OVERVIEW.RESEND_CTA} onClick={() => setShowSend(true)} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>
              <Send className="w-4 h-4" /> Send Application
            </button>
          } />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-status-terminated)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{error}</span>
          <button onClick={() => loadAgents()} style={{ marginLeft: "auto", padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3" style={{ padding: "var(--gc-space-12) 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gc-gold)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Loading contracting data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GCKPICard label="Total Agents" value={counts.all} accentTop href="/hcms/agents" />
            <GCKPICard label="Fully Documented" value={counts.complete} accentTop delta={counts.all > 0 ? { value: `${Math.round((counts.complete / counts.all) * 100)}%`, positive: true } : undefined} />
            <GCKPICard label="Docs Pending" value={totalRequiredDocs - completedRequiredDocs} accentTop delta={(totalRequiredDocs - completedRequiredDocs) > 0 ? { value: "Action needed", positive: false } : { value: "All complete", positive: true }} />
            <GCKPICard label="Avg Completion" value={`${avgCompletion}%`} accentTop />
          </div>

          <div data-tour-id={TOUR.ADMIN.CONTRACTING_OVERVIEW.TABS} className="flex gap-1 mb-4">
            {tabs.map(t => {
              const count = t === "All Agents" ? counts.all : t === "Missing Docs" ? counts.missing : counts.complete;
              return (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
                  {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>

          <div data-tour-id={TOUR.ADMIN.CONTRACTING_OVERVIEW.MATRIX}>
            <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search agents..." />
          </div>

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
        </>
      )}

      {/* View Agent Doc Checklist Popup */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewAgent(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewAgent.agent}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Document Checklist · Joined {viewAgent.submittedAt}</div>
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

            <Link href={`/hcms/agents/${viewAgent.id}`}>
              <span className="flex items-center justify-center gap-2 mt-4" style={{
                padding: "var(--gc-space-2) var(--gc-space-4)",
                backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
                border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)",
                color: "var(--gc-gold)", fontSize: "var(--gc-text-sm)", fontWeight: 500, cursor: "pointer",
                textAlign: "center"
              }}>View Full Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Send Application Dialog */}
      {showSend && (() => {
        const inputStyle = { width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none" };
        const labelStyle = { fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" };
        const canSend = sendFirst.trim() && sendLast.trim() && sendEmail.trim() && sendUpline && sendContract;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => closeSendDialog()}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "95vw", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Send Application</div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>Send the contracting application link to a prospective agent via email.</p>

            {sent && sentInfo ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Check className="w-10 h-10" style={{ color: "var(--gc-status-active)" }} />
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>Application Sent!</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
                  {sentInfo.emailSent ? `Email sent to ${sentInfo.name} at ${sentInfo.email}` : `Invitation created for ${sentInfo.name} — email delivery failed. Share the link below manually.`}
                </div>
                <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 4 }}>
                  Contract Level: {sentInfo.contractLevel}% · Upline: {sentInfo.uplineName}
                </div>
                <div style={{ marginTop: "var(--gc-space-2)", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", width: "100%" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Application Link</div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={sentInfo.url} style={{ flex: 1, padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "monospace", fontSize: "var(--gc-text-xs)", outline: "none" }} />
                    <button onClick={() => { navigator.clipboard.writeText(sentInfo.url); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: copied ? "var(--gc-status-active)" : "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)", whiteSpace: "nowrap" as const }}>
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>
                <button onClick={() => closeSendDialog()} style={{ marginTop: "var(--gc-space-2)", padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Done</button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input value={sendFirst} onChange={e => setSendFirst(e.target.value)} placeholder="First name" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input value={sendLast} onChange={e => setSendLast(e.target.value)} placeholder="Last name" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="agent@email.com" type="email" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number <span style={{ opacity: 0.5, textTransform: "none" as const }}>(optional)</span></label>
                    <input value={sendPhone} onChange={e => setSendPhone(e.target.value)} placeholder="(312) 555-0100" style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Upline *</label>
                      <div onClick={() => { setUplineOpen(!uplineOpen); setContractOpen(false); }} style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: `1px solid ${uplineOpen ? "var(--gc-gold)" : "var(--gc-border)"}`, borderRadius: "var(--gc-radius-sm)", color: sendUpline ? "var(--gc-text-primary)" : "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(() => { const u = uplines.find(u => u.id === sendUpline); return u ? `${uplineLabel(u)} (${u.contractLevel}%)` : "Select upline..."; })()}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gc-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: uplineOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      {uplineOpen && (
                        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 60, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", maxHeight: 200, overflowY: "auto" }}>
                          {uplines.map(u => (
                            <div key={u.id} onClick={() => { setSendUpline(u.id); setSendContract(""); setUplineOpen(false); }} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", cursor: "pointer", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)", fontFamily: "var(--gc-font-body)", backgroundColor: sendUpline === u.id ? "var(--gc-surface-2)" : "transparent", borderBottom: "1px solid var(--gc-border-subtle)" }}
                              onMouseEnter={e => { if (sendUpline !== u.id) e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
                              onMouseLeave={e => { if (sendUpline !== u.id) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >{uplineLabel(u)} ({u.contractLevel}%)</div>
                          ))}
                          {uplines.length === 0 && <div style={{ padding: "var(--gc-space-3)", color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)", textAlign: "center" }}>No uplines available</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Commission Level *</label>
                      <div onClick={() => { if (sendUpline) { setContractOpen(!contractOpen); setUplineOpen(false); } }} style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: `1px solid ${contractOpen ? "var(--gc-gold)" : "var(--gc-border)"}`, borderRadius: "var(--gc-radius-sm)", color: sendContract ? "var(--gc-text-primary)" : "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", cursor: sendUpline ? "pointer" : "not-allowed", opacity: sendUpline ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{sendContract ? `${sendContract}%` : "Select level..."}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gc-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: contractOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      {contractOpen && sendUpline && (() => {
                        const upline = uplines.find(u => u.id === sendUpline);
                        if (!upline) return null;
                        const maxLevel = upline.contractLevel - 5;
                        const levels = [];
                        for (let i = maxLevel; i >= 5; i -= 5) levels.push(i);
                        return (
                          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 60, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", maxHeight: 200, overflowY: "auto" }}>
                            {levels.map(l => (
                              <div key={l} onClick={() => { setSendContract(String(l)); setContractOpen(false); }} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", cursor: "pointer", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-md)", fontFamily: "var(--gc-font-body)", backgroundColor: sendContract === String(l) ? "var(--gc-surface-2)" : "transparent", borderBottom: "1px solid var(--gc-border-subtle)" }}
                                onMouseEnter={e => { if (sendContract !== String(l)) e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
                                onMouseLeave={e => { if (sendContract !== String(l)) e.currentTarget.style.backgroundColor = "transparent"; }}
                              >{l}%</div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {sendError && (
                  <div className="flex items-center gap-2 mb-3" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-status-terminated)", borderRadius: "var(--gc-radius-sm)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
                    <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{sendError}</span>
                  </div>
                )}

                {/* Copy link section */}
                <div style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", marginBottom: "var(--gc-space-4)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Or copy application link</div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={applicationUrl} style={{ flex: 1, padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "monospace", fontSize: "var(--gc-text-sm)", outline: "none" }} />
                    <button onClick={handleCopyLink} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: copied ? "var(--gc-status-active)" : "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)", whiteSpace: "nowrap" as const }}>
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={() => closeSendDialog()} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
                  <button onClick={async () => {
                    setSending(true); setSendError("");
                    try {
                      const resp = await fetch("/api/apply/invite", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ firstName: sendFirst, lastName: sendLast, email: sendEmail, phone: sendPhone || undefined, uplineId: sendUpline, contractLevel: parseInt(sendContract) }) });
                      const data = await resp.json();
                      if (resp.ok) {
                        const selectedUpline = uplines.find(u => u.id === sendUpline);
                        setSentInfo({ name: `${sendFirst} ${sendLast}`, email: sendEmail, url: data.applicationUrl || "", emailSent: data.emailSent !== false, contractLevel: sendContract, uplineName: selectedUpline ? uplineLabel(selectedUpline) : "" });
                        setSent(true);
                      } else { setSendError(data.error || "Failed to send invitation"); }
                    } catch { setSendError("Network error"); }
                    setSending(false);
                  }} disabled={!canSend || sending} className="flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: canSend && !sending ? "pointer" : "not-allowed", fontWeight: 500, opacity: canSend && !sending ? 1 : 0.5 }}>
                    <Send className="w-3.5 h-3.5" /> {sending ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
