import { useState, useEffect } from "react";
import { GCPageHeader, GCKPICard, GCStatusBadge, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, ExternalLink, User, AlertTriangle, Loader2, FileText, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { TOUR } from "@/lib/tour/selectors";
import { CustomSelect } from "@/pages/apply/steps/StepAddress";
import { DOCUMENT_CONTENT } from "@shared/documentContent";

const HCMS_DOC_LABELS: Record<string, string> = {
  eo_cert: "E&O Insurance Certificate",
  gov_id: "Government-Issued Photo ID",
  aml_cert: "AML Certificate",
  direct_deposit: "Direct Deposit Authorization Form",
  articles: "Articles of Incorporation",
  nda: "Non-Disclosure Agreement",
  debt_rollup: "Debt Roll-Up Agreement",
  compliance: "Compliance & Ethics Agreement",
};
function humanizeDocType(t: string): string {
  return HCMS_DOC_LABELS[t] || t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const AGENT_HCMS_LINK_OPTIONS = [
  { value: "", label: "No action link" },
  { value: "/hcms/my/dashboard", label: "Dashboard" },
  { value: "/hcms/my/profile", label: "My Profile" },
  { value: "/hcms/my/documents", label: "Documents" },
  { value: "/hcms/my/licenses", label: "Licenses" },
  { value: "/hcms/my/eo", label: "E&O Insurance" },
  { value: "/hcms/my/bank", label: "Banking" },
  { value: "/hcms/my/trainings", label: "Trainings & IDs" },
  { value: "/hcms/my/employment", label: "Employment" },
  { value: "/hcms/my/dba", label: "Doing Business As" },
  { value: "/hcms/my/questions", label: "Background Questions" },
  { value: "/hcms/my/carriers", label: "Carriers" },
  { value: "/hcms/my/hierarchy", label: "Hierarchy" },
  { value: "/hcms/my/requests", label: "Contracting Requests" },
];

/* ------------------------------------------------------------------ */
/* Types matching backend GET /api/hcms/agents/:userId                */
/* ------------------------------------------------------------------ */

interface AgentUser {
  id: string; email: string; firstName: string; lastName: string;
  phone: string; role: string; onboardingStatus: string; joinedAt: string;
}

interface AgentProfile {
  dateOfBirth: string | null; streetAddress: string; city: string; state: string; zipCode: string;
  npn: string; isLicensed: boolean; licenseNumber: string; licensedStates: string;
  yearsExperience: string; previousAgency: string; companyName: string; title: string;
  eoProvider: string; eoPolicyNumber: string; eoEffectiveDate: string; eoExpirationDate: string; eoCoverageAmount: string;
  bankName: string; bankAccountType: string; routingLast4: string | null; accountLast4: string | null;
  approvalStatus: string; approvedBy: string | null; approvedAt: string | null; rejectionReason: string | null;
  dbaType: string; ein: string; companyType: string; stateOfInc: string; dbaName: string;
  licenseType: string; formationDate: string;
  businessEmail: string; businessPhone: string; businessFax: string; businessWebsite: string;
  businessStreet: string; businessUnit: string; businessCity: string; businessState: string; businessZip: string;
  mailingStreet: string; mailingUnit: string; mailingCity: string; mailingState: string; mailingZip: string;
  mailingSameAsBusiness: boolean;
  ceExpirationDate: string | null;
  owners: any[];
  drlp: any | null;
  beneficiary: any | null;
  articlesKey: string | null;
  eoCertificateKey: string | null; driversLicenseKey: string | null;
  amlCertificateKey: string | null; directDepositFormKey: string | null;
  backgroundAnswers: any[];
}

interface Checklist {
  ndaStatus: string; ndaSignedAt: string | null; ndaDocumentKey: string | null;
  debtRollupStatus: string; debtRollupSignedAt: string | null; debtRollupDocumentKey: string | null;
  complianceStatus: string; complianceSignedAt: string | null; complianceDocumentKey: string | null;
  allCompleted: boolean;
}

interface License {
  id: number; stateCode: string; licenseNumber: string; licenseType: string;
  status: string; effectiveDate: string; expirationDate: string;
  isResident: boolean; syncSource: string;
}

interface ContractingRequest {
  id: number; carrier: string; states: string[];
  status: string; returnedReason: string | null; createdAt: string;
}

interface AgentDetail {
  user: AgentUser;
  profile: AgentProfile;
  checklist: Checklist;
  licenses: License[];
  requests: ContractingRequest[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(d: string | null): string {
  if (!d) return "\u2014";
  try { const date = new Date(d); return isNaN(date.getTime()) ? "\u2014" : `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`; } catch { return "\u2014"; }
}

function fmtDateTime(d: string | null): string {
  if (!d) return "\u2014";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "\u2014";
    return `${fmtDate(d)} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
  } catch { return "\u2014"; }
}

const docIcon = (s: string) =>
  s === "signed" || s === "uploaded"
    ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
    : s === "pending"
      ? <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />
      : s === "missing"
        ? <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
        : <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>N/A</span>;

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

const DetailField = ({ label, value, mono, gold }: { label: string; value: string | React.ReactNode; mono?: boolean; gold?: boolean }) => (
  <div>
    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: "var(--gc-text-base)", color: gold ? "var(--gc-gold)" : "var(--gc-text-primary)", fontFamily: mono ? "monospace" : "var(--gc-font-body)", fontWeight: gold ? 600 : 400 }}>{value || "\u2014"}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", marginBottom: "var(--gc-space-4)" }}>
    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)", paddingBottom: "var(--gc-space-2)", borderBottom: "1px solid var(--gc-border-subtle)" }}>{title}</div>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function HCMSAgentDetail({ agentId }: { agentId?: string }) {
  const id = agentId || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "") || "";

  const [data, setData] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("profile");
  const [agentStatus, setAgentStatus] = useState("");
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [docViewer, setDocViewer] = useState<{ url: string; title: string } | null>(null);
  const [statusError, setStatusError] = useState("");
  const [docError, setDocError] = useState("");

  // Carrier request admin actions
  const [requestAction, setRequestAction] = useState<{ id: number; carrier: string; action: "approved" | "rejected" | "returned" } | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [requestActionBusy, setRequestActionBusy] = useState<number | null>(null);
  const [requestActionError, setRequestActionError] = useState("");

  // Admin direct message
  const [showMessage, setShowMessage] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageUrl, setMessageUrl] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState("");

  const loadData = () => {
    if (!id) { setError("No agent ID"); setLoading(false); return; }
    setLoading(true);
    setError("");
    fetch(`/api/hcms/agents/${id}`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((d: AgentDetail) => { setData(d); setAgentStatus(d.profile.approvalStatus || "pending_review"); setLoading(false); })
      .catch(() => { setError("Failed to load agent"); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [id]);

  /* -- Status update ------------------------------------------------ */
  const updateStatus = async (status: string) => {
    setSaving(true);
    setStatusError("");
    try {
      const resp = await fetch(`/api/hcms/agents/${id}/status`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: rejectReason || undefined }),
      });
      if (resp.ok) { setAgentStatus(status); setShowConfirm(null); setRejectReason(""); setStatusError(""); }
    } catch { setStatusError("Failed to update status. Please try again."); }
    setSaving(false);
  };

  /* -- Carrier request status update -------------------------------- */
  const submitRequestAction = async () => {
    if (!requestAction) return;
    const { id: reqId, action } = requestAction;
    if ((action === "returned" || action === "rejected") && !requestReason.trim()) {
      setRequestActionError(action === "returned" ? "A reason is required to return a request." : "Please add a short reason for the agent.");
      return;
    }
    setRequestActionBusy(reqId);
    setRequestActionError("");
    try {
      const resp = await fetch(`/api/hcms/agents/${id}/requests/${reqId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, returnedReason: requestReason.trim() || undefined }),
      });
      if (resp.ok) {
        setRequestAction(null);
        setRequestReason("");
        loadData();
      } else {
        const err = await resp.json().catch(() => ({}));
        setRequestActionError(err.error || "Failed to update request status.");
      }
    } catch {
      setRequestActionError("Network error. Please try again.");
    }
    setRequestActionBusy(null);
  };

  /* -- Admin direct message ----------------------------------------- */
  const sendAdminMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      setMessageError("Both a title and a message are required.");
      return;
    }
    setMessageSending(true);
    setMessageError("");
    try {
      const resp = await fetch(`/api/hcms/agents/${id}/notify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: messageTitle.trim(),
          message: messageBody.trim(),
          actionUrl: messageUrl.trim() || undefined,
        }),
      });
      if (resp.ok) {
        setMessageSent(true);
        setTimeout(() => {
          setShowMessage(false);
          setMessageSent(false);
          setMessageTitle("");
          setMessageBody("");
          setMessageUrl("");
        }, 1200);
      } else {
        const err = await resp.json().catch(() => ({}));
        setMessageError(err.error || "Failed to send message.");
      }
    } catch {
      setMessageError("Network error. Please try again.");
    }
    setMessageSending(false);
  };

  /* -- Document viewer ---------------------------------------------- */
  const viewDocument = async (type: string) => {
    setDocError("");
    try {
      const resp = await fetch(`/api/hcms/agents/${id}/document/${type}`, { credentials: "include" });
      if (!resp.ok) { setDocError("Document not available"); return; }
      const contentType = resp.headers.get("content-type") || "";
      const title = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      // Backend streams PDF directly for regenerated documents
      const friendlyTitle = humanizeDocType(type);
      if (contentType.includes("application/pdf")) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setDocViewer({ url, title: friendlyTitle });
      } else {
        const data = await resp.json();
        // Direct URL (signed http or relative proxy) — load in iframe.
        if (data.url) {
          setDocViewer({ url: data.url, title: friendlyTitle });
        } else if (data.key && typeof data.key === "string" && data.key.startsWith("data:image")) {
          // Inline signature data: URI — wrap in an HTML preview that includes
          // the full document text + the signature image at the bottom.
          const doc = DOCUMENT_CONTENT[type];
          const docTitle = doc?.title || friendlyTitle;
          const sectionsHtml = doc
            ? doc.sections.map((s) => `<div class="section"><h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body)}</p></div>`).join("")
            : `<div class="section"><p style="text-align:center;color:#6B5548;">Document text not available — original copy stored securely.</p></div>`;
          const html = `<!doctype html><html><head><title>${escapeHtml(friendlyTitle)}</title><style>
            body{margin:0;font-family:Georgia,serif;background:#FAF6F0;color:#2D1810;padding:40px;}
            .wrap{max-width:680px;margin:0 auto;}
            h1{font-family:'Playfair Display',Georgia,serif;color:#C4975A;font-size:22px;text-align:center;margin:0 0 8px;}
            .meta{text-align:center;font-size:12px;color:#6B5548;margin-bottom:32px;}
            .section{margin-bottom:18px;}
            h2{font-size:14px;color:#2D1810;margin:0 0 6px;}
            p{font-size:13px;color:#3F2A1A;line-height:1.7;margin:0;}
            .sig-block{margin-top:36px;padding-top:18px;border-top:2px solid #C4975A;text-align:center;}
            .sig-label{text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#6B5548;margin-bottom:14px;}
            .sig-img{max-width:360px;height:auto;display:block;margin:0 auto;}
            .sig-note{margin-top:10px;font-size:12px;color:#6B5548;}
          </style></head><body><div class="wrap">
            <h1>${escapeHtml(docTitle)}</h1>
            <div class="meta">Electronically signed copy on file</div>
            ${sectionsHtml}
            <div class="sig-block">
              <div class="sig-label">Electronic Signature</div>
              <img class="sig-img" src="${data.key}" alt="signature"/>
              <div class="sig-note">${escapeHtml(friendlyTitle)} — signed by Gaetano Carbonara</div>
            </div>
          </div></body></html>`;
          const blob = new Blob([html], { type: "text/html" });
          setDocViewer({ url: URL.createObjectURL(blob), title: friendlyTitle });
        } else {
          setDocError(data.message || "Document preview unavailable");
        }
      }
    } catch { setDocError("Failed to load document"); }
  };

  /* ---------------------------------------------------------------- */
  /* Loading / Error states                                           */
  /* ---------------------------------------------------------------- */

  if (loading) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  if (error || !data) {
    return (
      <div>
        <GCPageHeader title="Agent Detail" subtitle="Not found" breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }]} />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gc-status-terminated)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500 }}>Unable to Load Agent</div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{error || "Agent not found"}</div>
          </div>
          <button onClick={loadData} style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>Retry</button>
        </div>
        <Link href="/hcms/agents"><span className="flex items-center gap-1 mt-4" style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><ArrowLeft className="w-4 h-4" /> Back to Agents</span></Link>
      </div>
    );
  }

  const { user, profile, checklist, licenses, requests } = data;
  const fullName = `${user.firstName} ${user.lastName}`;

  /* -- Build document list from real data --------------------------- */
  const documents = [
    { name: "Non-Disclosure Agreement (NDA)", status: checklist.ndaStatus === "signed" ? "signed" : "pending", date: checklist.ndaSignedAt, key: checklist.ndaDocumentKey, type: "nda", required: true },
    { name: "Debt Roll-Up Agreement", status: checklist.debtRollupStatus === "signed" ? "signed" : "pending", date: checklist.debtRollupSignedAt, key: checklist.debtRollupDocumentKey, type: "debt_rollup", required: true },
    { name: "Compliance & Ethics Agreement", status: checklist.complianceStatus === "signed" ? "signed" : "pending", date: checklist.complianceSignedAt, key: checklist.complianceDocumentKey, type: "compliance", required: true },
    { name: "E&O Certificate", status: profile.eoCertificateKey ? "uploaded" : "missing", date: null, key: profile.eoCertificateKey, type: "eo_certificate", required: true },
    { name: "Government ID", status: profile.driversLicenseKey ? "uploaded" : "missing", date: null, key: profile.driversLicenseKey, type: "drivers_license", required: true },
    { name: "AML Certificate", status: profile.amlCertificateKey ? "uploaded" : "missing", date: null, key: profile.amlCertificateKey, type: "aml_certificate", required: true },
    { name: "Direct Deposit Form", status: profile.directDepositFormKey ? "uploaded" : "missing", date: null, key: profile.directDepositFormKey, type: "direct_deposit_form", required: true },
    { name: "Articles of Incorporation", status: profile.articlesKey ? "uploaded" : (profile.dbaType === "business_entity" ? "missing" : "n/a"), date: null, key: profile.articlesKey, type: "articles", required: profile.dbaType === "business_entity" },
  ];

  const docsComplete = documents.filter(d => d.status === "signed" || d.status === "uploaded").length;
  const docsTotal = documents.filter(d => d.required || d.status === "signed" || d.status === "uploaded").length;
  const activeLicenses = licenses.filter(l => l.status === "active").length;
  const appointedCarriers = requests.filter(r => r.status === "approved" || r.status === "appointed").length;
  const flaggedQuestions = Array.isArray(profile.backgroundAnswers) ? profile.backgroundAnswers.filter((a: any) => a?.answer === true || (typeof a?.answer === "string" && a.answer.toLowerCase() === "yes")).length : 0;

  /* -- Tab labels --------------------------------------------------- */
  const answeredCount = Array.isArray(profile.backgroundAnswers) ? profile.backgroundAnswers.length : 0;
  const tabLabels = [
    { key: "profile", label: "Profile" },
    { key: "documents", label: `Documents (${docsComplete}/${docsTotal})` },
    { key: "licensing", label: `Licensing (${licenses.length})` },
    { key: "carriers", label: `Carriers (${requests.length})` },
    { key: "contracting", label: `Contracting (${documents.filter(d => d.required && (d.status === "signed" || d.status === "uploaded")).length}/${docsTotal})` },
    { key: "questions", label: `Questions${flaggedQuestions > 0 ? ` (${flaggedQuestions} flagged)` : answeredCount > 0 ? ` (${answeredCount})` : ""}` },
  ];

  if (profile.dbaType === "business_entity") {
    tabLabels.push({ key: "business", label: "Business Entity" });
  }

  /* -- License columns ---------------------------------------------- */
  const licCols: Column<License>[] = [
    { key: "stateCode", label: "State", sortable: true, width: "10%", render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: "licenseNumber", label: "License #", width: "18%", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v || "\u2014"}</span> },
    { key: "licenseType", label: "Type", width: "18%" },
    { key: "status", label: "Status", width: "12%", render: (v) => <GCStatusBadge status={v} /> },
    { key: "effectiveDate", label: "Effective", width: "14%", render: (v) => fmtDate(v) },
    { key: "expirationDate", label: "Expires", sortable: true, width: "14%", render: (v) => fmtDate(v) },
    { key: "isResident", label: "Resident", width: "10%", align: "center", render: (v) => v ? <span style={{ color: "var(--gc-status-active)" }}>Yes</span> : <span style={{ color: "var(--gc-text-muted)" }}>No</span> },
  ];

  /* -- Request columns ---------------------------------------------- */
  const requestActionStyle = (color: string, disabled: boolean): React.CSSProperties => ({
    padding: "3px 8px",
    background: disabled ? "transparent" : `color-mix(in srgb, ${color} 12%, transparent)`,
    color: disabled ? "var(--gc-text-muted)" : color,
    border: `1px solid ${disabled ? "var(--gc-border)" : color}`,
    borderRadius: "var(--gc-radius-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "var(--gc-text-xs)",
    fontWeight: 600,
    opacity: disabled ? 0.5 : 1,
  });

  const requestCols: Column<ContractingRequest>[] = [
    { key: "carrier", label: "Carrier", sortable: true, width: "18%" },
    { key: "states", label: "States", width: "16%", render: (v) => (Array.isArray(v) ? v.join(", ") : v) || "\u2014" },
    { key: "status", label: "Status", width: "14%", render: (v) => <GCStatusBadge status={v === "approved" || v === "appointed" ? "active" : v === "awaiting_carrier" ? "pending" : v === "returned" ? "warning" : v} /> },
    { key: "returnedReason", label: "Notes", width: "24%", render: (v) => v ? <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>\u2014</span> },
    { key: "createdAt", label: "Submitted", width: "12%", render: (v) => fmtDate(v) },
    {
      key: "id",
      label: "Actions",
      width: "28%",
      render: (_v, row) => {
        const busy = requestActionBusy === row.id;
        const canApprove = row.status !== "approved" && row.status !== "appointed";
        const canReject = row.status !== "rejected";
        const canReturn = row.status !== "returned" && row.status !== "approved" && row.status !== "appointed";
        return (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => { setRequestAction({ id: row.id, carrier: row.carrier, action: "approved" }); setRequestReason(""); setRequestActionError(""); }}
              disabled={!canApprove || busy}
              style={requestActionStyle("var(--gc-status-active)", !canApprove || busy)}
              title="Approve this request"
            >
              Approve
            </button>
            <button
              onClick={() => { setRequestAction({ id: row.id, carrier: row.carrier, action: "returned" }); setRequestReason(row.returnedReason || ""); setRequestActionError(""); }}
              disabled={!canReturn || busy}
              style={requestActionStyle("var(--gc-gold)", !canReturn || busy)}
              title="Return with a note for the agent"
            >
              Return
            </button>
            <button
              onClick={() => { setRequestAction({ id: row.id, carrier: row.carrier, action: "rejected" }); setRequestReason(""); setRequestActionError(""); }}
              disabled={!canReject || busy}
              style={requestActionStyle("var(--gc-status-terminated)", !canReject || busy)}
              title="Reject this request"
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div data-tour-id={TOUR.ADMIN.AGENT_DETAIL.HEADER}>
      <GCPageHeader
        title={fullName}
        subtitle={`${user.email} \u00b7 ${user.phone || "\u2014"}`}
        breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }, { label: fullName }]}
        accentUnderline
        actions={
          <div className="flex items-center gap-2" data-tour-id={TOUR.ADMIN.AGENT_DETAIL.STATUS_ACTIONS}>
            <button
              onClick={() => { setShowMessage(true); setMessageError(""); setMessageSent(false); }}
              className="flex items-center gap-1"
              style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "transparent", color: "var(--gc-gold)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-gold)", cursor: "pointer", fontWeight: 500, fontSize: "var(--gc-text-sm)" }}
              title="Send a notification to this agent"
            >
              <FileText className="w-3.5 h-3.5" />
              Send Message
            </button>
            {agentStatus === "pending_review" || agentStatus === "in_review" ? (
              <>
                {agentStatus === "pending_review" && (
                  <button onClick={() => updateStatus("in_review")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 15%, transparent)", color: "var(--gc-gold)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-gold)", cursor: "pointer", fontWeight: 500, fontSize: "var(--gc-text-sm)" }}>Start Review</button>
                )}
                <button onClick={() => setShowConfirm("approve")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-active)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "var(--gc-text-sm)" }}>Approve</button>
                <button onClick={() => setShowConfirm("reject")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "var(--gc-text-sm)" }}>Reject</button>
              </>
            ) : (
              <GCStatusBadge status={agentStatus === "approved" ? "active" : agentStatus === "rejected" ? "terminated" : agentStatus} />
            )}
          </div>
        }
      />
      </div>

      {statusError && (
        <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{statusError}</span>
        </div>
      )}

      {/* Rejection reason banner */}
      {agentStatus === "rejected" && profile.rejectionReason && (
        <div className="flex items-center gap-3 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} />
          <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>Rejected: {profile.rejectionReason}</span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Documents" value={`${docsComplete}/${docsTotal}`} accentTop delta={{ value: docsComplete === docsTotal ? "Complete" : `${docsTotal - docsComplete} remaining`, positive: docsComplete === docsTotal }} />
        <GCKPICard label="Carriers" value={requests.length} accentTop delta={{ value: `${appointedCarriers} appointed`, positive: appointedCarriers > 0 }} />
        <GCKPICard label="Licensed States" value={activeLicenses} accentTop />
        <GCKPICard label="DBA Type" value={profile.dbaType === "business_entity" ? "Business" : "Individual"} accentTop />
        <GCKPICard label="Questions" value={flaggedQuestions === 0 ? "All Clear" : `${flaggedQuestions} Flagged`} accentTop delta={{ value: flaggedQuestions === 0 ? "No flags" : "Review needed", positive: flaggedQuestions === 0 }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabLabels.map(t => {
          const tourIdByKey: Record<string, string> = {
            profile: TOUR.ADMIN.AGENT_DETAIL.TAB_PROFILE,
            documents: TOUR.ADMIN.AGENT_DETAIL.TAB_DOCUMENTS,
            licensing: TOUR.ADMIN.AGENT_DETAIL.TAB_LICENSING,
            carriers: TOUR.ADMIN.AGENT_DETAIL.TAB_CARRIERS,
            contracting: TOUR.ADMIN.AGENT_DETAIL.TAB_CONTRACTING,
            questions: TOUR.ADMIN.AGENT_DETAIL.TAB_QUESTIONS,
            business: TOUR.ADMIN.AGENT_DETAIL.TAB_BUSINESS,
          };
          return (
            <button key={t.key} data-tour-id={tourIdByKey[t.key]} onClick={() => setTab(t.key)} style={{
              padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)",
              fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
              backgroundColor: "transparent", border: "none",
              borderBottom: tab === t.key ? "2px solid var(--gc-gold)" : "2px solid transparent",
              cursor: "pointer", whiteSpace: "nowrap" as const,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* ===== PROFILE TAB ===== */}
      {tab === "profile" && (
        <div>
          {/* Quick Info Card */}
          <div className="flex items-start gap-6 mb-6" style={{ padding: "var(--gc-space-6)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))", boxShadow: "0 2px 8px color-mix(in srgb, var(--gc-gold) 30%, transparent)" }}>
              <User className="w-7 h-7" style={{ color: "var(--gc-btn-primary-text)" }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)" }}>{fullName}</span>
                <GCStatusBadge status={agentStatus === "approved" ? "active" : agentStatus === "rejected" ? "terminated" : agentStatus} />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
                <span>NPN: <span style={{ fontFamily: "monospace", color: "var(--gc-text-primary)" }}>{profile.npn || "\u2014"}</span></span>
                <span>DBA: <span style={{ color: "var(--gc-text-primary)" }}>{profile.dbaType === "business_entity" ? (profile.companyName || "Business Entity") : "Individual"}</span></span>
                <span>Applied: <span style={{ color: "var(--gc-text-primary)" }}>{fmtDate(user.joinedAt)}</span></span>
                {profile.approvedAt && <span>Approved: <span style={{ color: "var(--gc-text-primary)" }}>{fmtDate(profile.approvedAt)}</span></span>}
                {profile.approvedBy && <span>By: <span style={{ color: "var(--gc-text-primary)" }}>{profile.approvedBy}</span></span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Full Name" value={fullName} />
                <DetailField label="Date of Birth" value={fmtDate(profile.dateOfBirth)} />
                <DetailField label="NPN" value={profile.npn} mono />
                <DetailField label="Licensed" value={profile.isLicensed ? "Yes" : "No"} />
                <DetailField label="Email" value={user.email} />
                <DetailField label="Phone" value={user.phone} />
              </div>
            </Section>

            <Section title="Address">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Street" value={profile.streetAddress} />
                <DetailField label="City" value={profile.city} />
                <DetailField label="State" value={profile.state} />
                <DetailField label="ZIP Code" value={profile.zipCode} />
              </div>
            </Section>

            <Section title="Professional Background">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Experience" value={profile.yearsExperience ? `${profile.yearsExperience} years` : "\u2014"} />
                <DetailField label="Previous Agency" value={profile.previousAgency} />
                <DetailField label="Title" value={profile.title} />
                <DetailField label="Onboarding Status" value={user.onboardingStatus} />
              </div>
            </Section>

            <Section title="E&O Insurance">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Provider" value={profile.eoProvider} />
                <DetailField label="Policy Number" value={profile.eoPolicyNumber} mono />
                <DetailField label="Coverage" value={profile.eoCoverageAmount ? `$${Number(profile.eoCoverageAmount).toLocaleString()}` : "\u2014"} />
                <DetailField label="Effective" value={fmtDate(profile.eoEffectiveDate)} />
                <DetailField label="Expiration" value={fmtDate(profile.eoExpirationDate)} />
              </div>
            </Section>

            <Section title="Banking & Direct Deposit">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Bank" value={profile.bankName} />
                <DetailField label="Account Type" value={profile.bankAccountType} />
                <DetailField label="Routing (last 4)" value={profile.routingLast4} mono />
                <DetailField label="Account (last 4)" value={profile.accountLast4} mono />
              </div>
            </Section>

            <Section title="Compliance Summary">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="AML Certificate" value={
                  profile.amlCertificateKey
                    ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> Uploaded</span>
                    : <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-warning)" }} /> Missing</span>
                } />
                <DetailField label="CE Expiration" value={fmtDate(profile.ceExpirationDate)} />
                <DetailField label="All Docs Complete" value={
                  checklist.allCompleted
                    ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> Yes</span>
                    : <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" style={{ color: "var(--gc-status-pending)" }} /> In progress</span>
                } />
                <DetailField label="Background Questions" value={
                  flaggedQuestions === 0
                    ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> All clear</span>
                    : <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-warning)" }} /> {flaggedQuestions} flagged</span>
                } />
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ===== DOCUMENTS TAB ===== */}
      {tab === "documents" && (
        <div>
          <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", marginBottom: "var(--gc-space-4)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>Document Completion</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{docsComplete}/{docsTotal}</span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(docsComplete / Math.max(docsTotal, 1)) * 100}%`, backgroundColor: docsComplete === docsTotal ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
            </div>
          </div>
          {docError && (
            <div className="flex items-center gap-2 mb-3" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-warning) 25%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-warning)" }} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>{docError}</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between" style={{
                padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
                border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)",
                borderLeft: `3px solid ${d.status === "signed" || d.status === "uploaded" ? "var(--gc-status-active)" : d.status === "pending" ? "var(--gc-status-pending)" : d.status === "missing" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)"}`,
              }}>
                <div className="flex items-center gap-3">
                  {docIcon(d.status)}
                  <div>
                    <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{d.name}</div>
                    {d.date && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{d.status === "signed" ? "Signed" : "Uploaded"}: {fmtDateTime(d.date)}</div>}
                    {!d.required && d.status === "n/a" && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not applicable (Individual)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GCStatusBadge status={d.status === "signed" || d.status === "uploaded" ? "active" : d.status === "pending" ? "pending" : d.status === "missing" ? "warning" : "review"} />
                  {d.key && (
                    <button onClick={() => viewDocument(d.type)} style={{ color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer" }} title="View document">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== LICENSING TAB ===== */}
      {tab === "licensing" && (
        <div>
          {licenses.length === 0 ? (
            <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <FileText className="w-5 h-5" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-sm)" }}>No licenses on file. Licenses will appear here once synced from NIPR/SureLC or added manually.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
                <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>{activeLicenses} active licenses across {new Set(licenses.map(l => l.stateCode)).size} states</span>
              </div>
              <GCDataTable columns={licCols} data={licenses} />
            </>
          )}
        </div>
      )}

      {/* ===== CARRIERS TAB ===== */}
      {tab === "carriers" && (
        <div>
          {requests.length === 0 ? (
            <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <FileText className="w-5 h-5" style={{ color: "var(--gc-text-muted)" }} />
              <span style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-sm)" }}>No contracting requests submitted yet.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{appointedCarriers} appointed \u00b7 {requests.filter(r => r.status === "awaiting_carrier").length} pending \u00b7 {requests.filter(r => r.status === "returned").length} returned</span>
              </div>
              <GCDataTable columns={requestCols} data={requests} />
            </>
          )}
        </div>
      )}

      {/* ===== CONTRACTING TAB ===== */}
      {tab === "contracting" && (
        <div className="flex flex-col gap-4">
          <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>Agreement Signing Progress</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>
                {[checklist.ndaStatus, checklist.debtRollupStatus, checklist.complianceStatus].filter(s => s === "signed").length}/3
              </span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${([checklist.ndaStatus, checklist.debtRollupStatus, checklist.complianceStatus].filter(s => s === "signed").length / 3) * 100}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
            </div>
          </div>

          {[
            { doc: "Non-Disclosure Agreement (NDA)", status: checklist.ndaStatus, signedAt: checklist.ndaSignedAt, key: checklist.ndaDocumentKey, type: "nda" },
            { doc: "Debt Roll-Up Agreement", status: checklist.debtRollupStatus, signedAt: checklist.debtRollupSignedAt, key: checklist.debtRollupDocumentKey, type: "debt_rollup" },
            { doc: "Compliance & Ethics Agreement", status: checklist.complianceStatus, signedAt: checklist.complianceSignedAt, key: checklist.complianceDocumentKey, type: "compliance" },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
              border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)",
              borderLeft: `3px solid ${c.status === "signed" ? "var(--gc-status-active)" : "var(--gc-status-pending)"}`,
            }}>
              <div className="flex items-center gap-3">
                {c.status === "signed" ? <CheckCircle className="w-5 h-5" style={{ color: "var(--gc-status-active)" }} /> : <Clock className="w-5 h-5" style={{ color: "var(--gc-status-pending)" }} />}
                <div>
                  <div style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>{c.doc}</div>
                  {c.signedAt && <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Signed: {fmtDateTime(c.signedAt)}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GCStatusBadge status={c.status === "signed" ? "active" : "pending"} />
                {c.key && (
                  <button onClick={() => viewDocument(c.type)} style={{ color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer" }} title="View signed document">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== QUESTIONS TAB ===== */}
      {tab === "questions" && (
        (!profile.backgroundAnswers || profile.backgroundAnswers.length === 0) ? (
          <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <FileText className="w-5 h-5" style={{ color: "var(--gc-text-muted)" }} />
            <span style={{ color: "var(--gc-text-secondary)", fontSize: "var(--gc-text-sm)" }}>No background questions answered yet. Questions will appear here once the agent completes the SureLC background section of the application.</span>
          </div>
        ) : (
        <div className="flex flex-col gap-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{profile.backgroundAnswers.length} questions answered</span>
            <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: flaggedQuestions > 0 ? "var(--gc-status-warning)" : "var(--gc-status-active)" }}>
              {flaggedQuestions > 0 ? `${flaggedQuestions} flagged — review required` : "All clear — no flags"}
            </span>
          </div>
          {profile.backgroundAnswers.map((q: any, i: number) => {
            const isFlagged = q?.answer === true || (typeof q?.answer === "string" && q.answer.toLowerCase() === "yes");
            return (
              <div key={i} style={{
                padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
                border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)",
                borderLeft: `3px solid ${isFlagged ? "var(--gc-status-warning)" : "var(--gc-status-active)"}`,
              }}>
                <div className="flex items-start gap-3">
                  {isFlagged ? <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--gc-status-warning)" }} /> : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--gc-status-active)" }} />}
                  <div>
                    <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", marginBottom: 2 }}>Q{i + 1}: {q?.question || `Question ${i + 1}`}</div>
                    <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: isFlagged ? "var(--gc-status-warning)" : "var(--gc-status-active)" }}>
                      Answer: {String(q?.answer || "No").toUpperCase()}
                    </div>
                    {q?.explanation && (
                      <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginTop: 4, padding: "var(--gc-space-2)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* ===== BUSINESS ENTITY TAB ===== */}
      {tab === "business" && profile.dbaType === "business_entity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Entity Information">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Company Name" value={profile.companyName} />
              <DetailField label="DBA Name" value={profile.dbaName} />
              <DetailField label="EIN" value={profile.ein} mono />
              <DetailField label="Company Type" value={profile.companyType} />
              <DetailField label="State of Incorporation" value={profile.stateOfInc} />
              <DetailField label="Formation Date" value={fmtDate(profile.formationDate)} />
              <DetailField label="License Type" value={profile.licenseType} />
            </div>
          </Section>

          <Section title="Business Contact">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Email" value={profile.businessEmail} />
              <DetailField label="Phone" value={profile.businessPhone} />
              <DetailField label="Fax" value={profile.businessFax} />
              <DetailField label="Website" value={profile.businessWebsite} />
            </div>
          </Section>

          <Section title="Business Address">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Street" value={profile.businessStreet} />
              <DetailField label="Unit" value={profile.businessUnit} />
              <DetailField label="City" value={profile.businessCity} />
              <DetailField label="State" value={profile.businessState} />
              <DetailField label="ZIP" value={profile.businessZip} />
            </div>
          </Section>

          {!profile.mailingSameAsBusiness && (
            <Section title="Mailing Address">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Street" value={profile.mailingStreet} />
                <DetailField label="Unit" value={profile.mailingUnit} />
                <DetailField label="City" value={profile.mailingCity} />
                <DetailField label="State" value={profile.mailingState} />
                <DetailField label="ZIP" value={profile.mailingZip} />
              </div>
            </Section>
          )}

          {profile.drlp && (
            <Section title="Designated Responsible Licensed Producer (DRLP)">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Name" value={`${profile.drlp.firstName || ""} ${profile.drlp.lastName || ""}`.trim()} />
                <DetailField label="NPN" value={profile.drlp.npn} mono />
                <DetailField label="License #" value={profile.drlp.licenseNumber} mono />
                <DetailField label="State" value={profile.drlp.state} />
                <DetailField label="Email" value={profile.drlp.email} />
                <DetailField label="Phone" value={profile.drlp.phone} />
              </div>
            </Section>
          )}

          {profile.beneficiary && (
            <Section title="Beneficiary">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Name" value={profile.beneficiary.name} />
                <DetailField label="Relationship" value={profile.beneficiary.relationship} />
                <DetailField label="Phone" value={profile.beneficiary.phone} />
                <DetailField label="Percentage" value={profile.beneficiary.percentage ? `${profile.beneficiary.percentage}%` : "\u2014"} />
              </div>
            </Section>
          )}

          {profile.owners && profile.owners.length > 0 && (
            <Section title={`Owners (${profile.owners.length})`}>
              {profile.owners.map((o: any, i: number) => (
                <div key={i} style={{ marginBottom: i < profile.owners.length - 1 ? "var(--gc-space-4)" : 0, paddingBottom: i < profile.owners.length - 1 ? "var(--gc-space-4)" : 0, borderBottom: i < profile.owners.length - 1 ? "1px solid var(--gc-border-subtle)" : "none" }}>
                  <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Owner {i + 1}: {o.name || `${o.firstName || ""} ${o.lastName || ""}`.trim()}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <DetailField label="Title" value={o.title} />
                    <DetailField label="Ownership %" value={o.ownershipPercentage ? `${o.ownershipPercentage}%` : "\u2014"} />
                    <DetailField label="SSN" value={o.ssn ? `***-**-${o.ssn.slice(-4)}` : "\u2014"} mono />
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}

      {/* ===== CONFIRM DIALOG ===== */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: "95vw", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>
              {showConfirm === "approve" ? "Approve Agent?" : "Reject Agent?"}
            </div>
            <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)" }}>
              {showConfirm === "approve"
                ? `Activate ${fullName} as a contracted sales agent. They will be notified via email.`
                : `Reject ${fullName}'s application. They will be notified via email.`}
            </p>
            {showConfirm === "reject" && (
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                rows={3}
                style={{
                  width: "100%", padding: "var(--gc-space-3)", marginBottom: "var(--gc-space-4)",
                  backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)",
                  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", resize: "vertical",
                }}
              />
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowConfirm(null); setRejectReason(""); }} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button
                onClick={() => updateStatus(showConfirm === "approve" ? "approved" : "rejected")}
                disabled={saving}
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: showConfirm === "approve" ? "var(--gc-status-active)" : "var(--gc-status-terminated)",
                  color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none",
                  cursor: saving ? "not-allowed" : "pointer", fontWeight: 500, opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : showConfirm === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARRIER REQUEST ACTION MODAL ===== */}
      {requestAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { setRequestAction(null); setRequestReason(""); setRequestActionError(""); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: "95vw", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>
              {requestAction.action === "approved" && `Approve ${requestAction.carrier}?`}
              {requestAction.action === "returned" && `Return ${requestAction.carrier} to agent`}
              {requestAction.action === "rejected" && `Reject ${requestAction.carrier}?`}
            </div>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)", lineHeight: 1.5 }}>
              {requestAction.action === "approved" && `Mark this carrier appointment as active. The agent will be notified that they can write business with ${requestAction.carrier}.`}
              {requestAction.action === "returned" && `Send this request back to the agent with a note so they can update and resubmit.`}
              {requestAction.action === "rejected" && `Decline this contracting request. The agent will be notified. An optional note is included in their notification.`}
            </p>
            {(requestAction.action === "returned" || requestAction.action === "rejected") && (
              <div style={{ marginBottom: "var(--gc-space-3)" }}>
                <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: 4, fontWeight: 500 }}>
                  {requestAction.action === "returned" ? "Reason (required)" : "Reason (optional)"}
                </label>
                <textarea
                  value={requestReason}
                  onChange={e => { setRequestReason(e.target.value); setRequestActionError(""); }}
                  placeholder={requestAction.action === "returned" ? "What does the agent need to correct?" : "Why is this being rejected?"}
                  rows={3}
                  maxLength={500}
                  style={{ width: "100%", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", resize: "vertical" }}
                />
              </div>
            )}
            {requestActionError && (
              <div className="flex items-center gap-2 mb-3" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{requestActionError}</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setRequestAction(null); setRequestReason(""); setRequestActionError(""); }} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button
                onClick={submitRequestAction}
                disabled={requestActionBusy !== null}
                style={{
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: requestAction.action === "approved" ? "var(--gc-status-active)" : requestAction.action === "returned" ? "var(--gc-gold)" : "var(--gc-status-terminated)",
                  color: requestAction.action === "returned" ? "var(--gc-btn-primary-text)" : "#fff",
                  borderRadius: "var(--gc-radius-sm)",
                  border: "none",
                  cursor: requestActionBusy !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  opacity: requestActionBusy !== null ? 0.6 : 1,
                }}
              >
                {requestActionBusy !== null ? "Saving..." : requestAction.action === "approved" ? "Approve" : requestAction.action === "returned" ? "Return" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEND MESSAGE MODAL ===== */}
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { if (!messageSending) setShowMessage(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: "95vw", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: 4 }}>Send message to {fullName}</div>
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-4)", lineHeight: 1.5 }}>
              The agent gets this in their <strong>Notifications</strong> bell — with your title, message, and an optional action link. Use for compliance follow-ups, missing documents, or personal messages.
            </p>
            {messageSent ? (
              <div className="flex items-center gap-2 mb-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-status-active) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-active) 30%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
                <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-active)", fontWeight: 500 }}>Message sent</span>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "var(--gc-space-3)" }}>
                  <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: 4, fontWeight: 500 }}>Title</label>
                  <input
                    value={messageTitle}
                    onChange={e => { setMessageTitle(e.target.value); setMessageError(""); }}
                    placeholder="e.g. E&O certificate needed before Friday"
                    maxLength={140}
                    style={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}
                  />
                </div>
                <div style={{ marginBottom: "var(--gc-space-3)" }}>
                  <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: 4, fontWeight: 500 }}>Message</label>
                  <textarea
                    value={messageBody}
                    onChange={e => { setMessageBody(e.target.value); setMessageError(""); }}
                    placeholder="Write the full message. The agent will see this in their notification."
                    rows={4}
                    maxLength={1000}
                    style={{ width: "100%", padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", resize: "vertical" }}
                  />
                  <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textAlign: "right", marginTop: 2 }}>{messageBody.length} / 1000</div>
                </div>
                <div style={{ marginBottom: "var(--gc-space-3)" }}>
                  <label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gc-text-muted)", display: "block", marginBottom: 4, fontWeight: 500 }}>Action link (optional)</label>
                  <CustomSelect
                    value={messageUrl}
                    onChange={setMessageUrl}
                    options={AGENT_HCMS_LINK_OPTIONS}
                    placeholder="No action link"
                    inputStyle={{ width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)" }}
                  />
                  <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>Tapping the notification (and the email CTA) takes the agent to this page.</div>
                </div>
                {messageError && (
                  <div className="flex items-center gap-2 mb-3" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{messageError}</span>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowMessage(false)} disabled={messageSending} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: messageSending ? "not-allowed" : "pointer" }}>Cancel</button>
                  <button
                    onClick={sendAdminMessage}
                    disabled={messageSending || !messageTitle.trim() || !messageBody.trim()}
                    style={{
                      padding: "var(--gc-space-2) var(--gc-space-4)",
                      backgroundColor: "var(--gc-btn-primary-bg)",
                      color: "var(--gc-btn-primary-text)",
                      borderRadius: "var(--gc-radius-sm)",
                      border: "none",
                      cursor: messageSending || !messageTitle.trim() || !messageBody.trim() ? "not-allowed" : "pointer",
                      fontWeight: 500,
                      opacity: messageSending || !messageTitle.trim() || !messageBody.trim() ? 0.5 : 1,
                    }}
                  >
                    {messageSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== DOCUMENT VIEWER MODAL ===== */}
      {docViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => { if (docViewer?.url?.startsWith("blob:")) URL.revokeObjectURL(docViewer.url); setDocViewer(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "90%", maxWidth: 900, height: "85vh", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", borderBottom: "1px solid var(--gc-border)" }}>
              <span style={{ fontWeight: 600, color: "var(--gc-text-primary)" }}>{docViewer.title}</span>
              <button onClick={() => { if (docViewer?.url?.startsWith("blob:")) URL.revokeObjectURL(docViewer.url); setDocViewer(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gc-text-muted)", fontSize: 18 }}>&times;</button>
            </div>
            <iframe src={docViewer.url} style={{ flex: 1, border: "none", width: "100%" }} title={docViewer.title} />
          </div>
        </div>
      )}
    </div>
  );
}
