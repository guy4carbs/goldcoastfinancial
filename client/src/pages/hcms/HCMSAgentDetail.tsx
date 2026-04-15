import { useState } from "react";
import { GCPageHeader, GCKPICard, GCStatusBadge, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Download, ExternalLink, User, AlertTriangle } from "lucide-react";

// Full agent data
const AGENT = {
  id: "1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "(312) 555-0142",
  state: "IL", city: "Chicago", zip: "60601", street: "1240 Michigan Ave",
  dob: "1989-06-15", ssn: "***-**-4523", npn: "18842956",
  status: "pending_review", contractLevel: "85%", upline: "Nicholas Gallagher",
  yearsExperience: "5+", previousAgency: "Northwestern Mutual", isLicensed: true,
  // E&O
  eoProvider: "NAPA", eoPolicyNumber: "EO-2026-445821", eoExpiration: "2027-01-15", eoCoverage: "$1,000,000",
  // Bank
  bank: "Chase Bank", accountType: "Checking", ddStatus: "active",
  // Training
  amlStatus: "active", amlExpiration: "2027-01-15", ceStatus: "active",
  // DBA
  dbaType: "Individual",
  // Questions
  flaggedQuestions: 0,
  // Dates
  applicationDate: "2026-01-08", approvedDate: null as string | null,
};

const DOCUMENTS = [
  { name: "Non-Disclosure Agreement (NDA)", status: "signed", date: "2026-01-12", required: true },
  { name: "Debt Roll-Up Agreement", status: "signed", date: "2026-01-12", required: true },
  { name: "Compliance & Ethics Agreement", status: "pending", date: null, required: true },
  { name: "E&O Certificate", status: "uploaded", date: "2026-01-10", required: true },
  { name: "Government ID", status: "uploaded", date: "2026-01-10", required: true },
  { name: "AML Certificate", status: "uploaded", date: "2026-01-11", required: true },
  { name: "Direct Deposit Form", status: "uploaded", date: "2026-01-11", required: true },
  { name: "Voided Check", status: "missing", date: null, required: false },
  { name: "Articles of Incorporation", status: "n/a", date: null, required: false },
];

const LICENSES = [
  { state: "IL", number: "IL-2024-18842", type: "Life & Health", status: "active", effective: "2024-01-15", expires: "2026-01-15", resident: true },
  { state: "IN", number: "IN-2024-99201", type: "Life & Health", status: "active", effective: "2024-03-01", expires: "2026-03-01", resident: false },
  { state: "WI", number: "WI-2025-33210", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01", resident: false },
  { state: "MI", number: "MI-2025-44102", type: "Life Only", status: "pending", effective: "2026-04-01", expires: "2028-04-01", resident: false },
];

const CARRIER_APPTS = [
  { carrier: "Mutual of Omaha", writing: "MOO-445821", status: "appointed", date: "2024-06-15", level: "85%", states: "IL" },
  { carrier: "Transamerica", writing: "TRA-118904", status: "appointed", date: "2024-07-01", level: "80%", states: "IL" },
  { carrier: "National Life Group", writing: "NLG-228110", status: "appointed", date: "2025-01-15", level: "82%", states: "IL, IN" },
  { carrier: "Americo", writing: "", status: "pending", date: "2026-04-01", level: "", states: "IL" },
];

const CONTRACTING = [
  { doc: "Non-Disclosure Agreement", status: "signed", signedAt: "2026-01-12 14:22:05", hash: "a3f2b8c4...91d0e2f1" },
  { doc: "Debt Roll-Up Agreement", status: "signed", signedAt: "2026-01-12 14:25:18", hash: "7e4d1ab3...f823c09a" },
  { doc: "Compliance & Ethics Agreement", status: "pending", signedAt: null, hash: null },
];

const docIcon = (s: string) => s === "signed" || s === "uploaded" ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : s === "pending" ? <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} /> : s === "missing" ? <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /> : <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>N/A</span>;

const docsComplete = DOCUMENTS.filter(d => d.status === "signed" || d.status === "uploaded").length;

const DetailField = ({ label, value, mono, gold }: { label: string; value: string | React.ReactNode; mono?: boolean; gold?: boolean }) => (
  <div>
    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: "var(--gc-text-base)", color: gold ? "var(--gc-gold)" : "var(--gc-text-primary)", fontFamily: mono ? "monospace" : "var(--gc-font-body)", fontWeight: gold ? 600 : 400 }}>{value || "—"}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", marginBottom: "var(--gc-space-4)" }}>
    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)", paddingBottom: "var(--gc-space-2)", borderBottom: "1px solid var(--gc-border-subtle)" }}>{title}</div>
    {children}
  </div>
);

const licCols: Column<typeof LICENSES[0]>[] = [
  { key: "state", label: "State", sortable: true, width: "10%", render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: "number", label: "License #", width: "18%", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "type", label: "Type", width: "18%" },
  { key: "status", label: "Status", width: "12%", render: (v) => <GCStatusBadge status={v} /> },
  { key: "effective", label: "Effective", width: "14%" },
  { key: "expires", label: "Expires", sortable: true, width: "14%" },
  { key: "resident", label: "Resident", width: "10%", align: "center", render: (v) => v ? <span style={{ color: "var(--gc-status-active)" }}>Yes</span> : <span style={{ color: "var(--gc-text-muted)" }}>No</span> },
];

const carrierCols: Column<typeof CARRIER_APPTS[0]>[] = [
  { key: "carrier", label: "Carrier", sortable: true, width: "22%" },
  { key: "writing", label: "Writing #", width: "16%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Pending</span> },
  { key: "status", label: "Status", width: "12%", render: (v) => <GCStatusBadge status={v === "appointed" ? "active" : v} /> },
  { key: "date", label: "Appointment Date", width: "16%" },
  { key: "level", label: "Commission", width: "12%", render: (v) => v ? <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
  { key: "states", label: "States", width: "12%" },
];

export default function HCMSAgentDetail() {
  const [tab, setTab] = useState("profile");
  const [agentStatus, setAgentStatus] = useState(AGENT.status);
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);

  const tabLabels = [
    { key: "profile", label: "Profile" },
    { key: "documents", label: `Documents (${docsComplete}/9)` },
    { key: "licensing", label: `Licensing (${LICENSES.length})` },
    { key: "carriers", label: `Carriers (${CARRIER_APPTS.filter(c => c.status === "appointed").length})` },
    { key: "contracting", label: `Contracting (${CONTRACTING.filter(c => c.status === "signed").length}/3)` },
  ];

  return (
    <div>
      <GCPageHeader title={AGENT.name} subtitle={`${AGENT.email} · ${AGENT.phone}`}
        breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }, { label: AGENT.name }]} accentUnderline
        actions={agentStatus === "pending_review" ? (
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm("approve")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-active)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Approve</button>
            <button onClick={() => setShowConfirm("reject")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Reject</button>
          </div>
        ) : <GCStatusBadge status={agentStatus} />} />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <GCKPICard label="Documents" value={`${docsComplete}/9`} accentTop delta={{ value: docsComplete === 9 ? "Complete" : `${9 - docsComplete} remaining`, positive: docsComplete === 9 }} />
        <GCKPICard label="Carriers" value={CARRIER_APPTS.filter(c => c.status === "appointed").length} accentTop delta={{ value: `${CARRIER_APPTS.filter(c => c.status === "pending").length} pending`, positive: false }} />
        <GCKPICard label="Licensed States" value={LICENSES.filter(l => l.status === "active").length} accentTop />
        <GCKPICard label="Contract Level" value={AGENT.contractLevel} accentTop />
        <GCKPICard label="AML Status" value={AGENT.amlStatus === "active" ? "Complete" : "Missing"} accentTop delta={{ value: AGENT.amlStatus === "active" ? "Current" : "Required", positive: AGENT.amlStatus === "active" }} />
      </div>

      {/* Tabs with counts */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabLabels.map(t => <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t.key ? 500 : 400, color: tab === t.key ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t.key ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" as const }}>{t.label}</button>)}
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
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)" }}>{AGENT.name}</span>
                <GCStatusBadge status={agentStatus} />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
                <span>NPN: <span style={{ fontFamily: "monospace", color: "var(--gc-text-primary)" }}>{AGENT.npn}</span></span>
                <span>Contract: <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-gold)" }}>{AGENT.contractLevel}</span></span>
                <span>Upline: <span style={{ color: "var(--gc-text-primary)" }}>{AGENT.upline}</span></span>
                <span>DBA: <span style={{ color: "var(--gc-text-primary)" }}>{AGENT.dbaType}</span></span>
                <span>Applied: <span style={{ color: "var(--gc-text-primary)" }}>{AGENT.applicationDate}</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Section title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Full Name" value={AGENT.name} />
                <DetailField label="Date of Birth" value={AGENT.dob} />
                <DetailField label="SSN" value={AGENT.ssn} mono />
                <DetailField label="NPN" value={AGENT.npn} mono />
                <DetailField label="Email" value={AGENT.email} />
                <DetailField label="Phone" value={AGENT.phone} />
              </div>
            </Section>

            {/* Address */}
            <Section title="Address">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Street" value={AGENT.street} />
                <DetailField label="City" value={AGENT.city} />
                <DetailField label="State" value={AGENT.state} />
                <DetailField label="ZIP Code" value={AGENT.zip} />
              </div>
            </Section>

            {/* Professional */}
            <Section title="Professional Background">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Experience" value={AGENT.yearsExperience} />
                <DetailField label="Previous Agency" value={AGENT.previousAgency} />
                <DetailField label="Contract Level" value={AGENT.contractLevel} gold />
                <DetailField label="Upline" value={AGENT.upline} />
              </div>
            </Section>

            {/* E&O Insurance */}
            <Section title="E&O Insurance">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Provider" value={AGENT.eoProvider} />
                <DetailField label="Policy Number" value={AGENT.eoPolicyNumber} mono />
                <DetailField label="Coverage" value={AGENT.eoCoverage} />
                <DetailField label="Expiration" value={AGENT.eoExpiration} />
              </div>
            </Section>

            {/* Banking */}
            <Section title="Banking & Direct Deposit">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Bank" value={AGENT.bank} />
                <DetailField label="Account Type" value={AGENT.accountType} />
                <DetailField label="Direct Deposit" value={<GCStatusBadge status={AGENT.ddStatus === "active" ? "active" : "pending"} />} />
                <DetailField label="DBA Type" value={AGENT.dbaType} />
              </div>
            </Section>

            {/* Compliance Summary */}
            <Section title="Compliance Summary">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="AML Training" value={AGENT.amlStatus === "active" ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> Complete</span> : <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-warning)" }} /> Missing</span>} />
                <DetailField label="AML Expiration" value={AGENT.amlExpiration} />
                <DetailField label="CE Credits" value={AGENT.ceStatus === "active" ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> Current</span> : "—"} />
                <DetailField label="SureLC Questions" value={AGENT.flaggedQuestions === 0 ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-active)" }} /> All clear</span> : <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--gc-status-warning)" }} /> {AGENT.flaggedQuestions} flagged</span>} />
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
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{docsComplete}/{DOCUMENTS.length}</span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(docsComplete / DOCUMENTS.length) * 100}%`, backgroundColor: docsComplete === DOCUMENTS.length ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {DOCUMENTS.map((d, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${d.status === "signed" || d.status === "uploaded" ? "var(--gc-status-active)" : d.status === "pending" ? "var(--gc-status-pending)" : d.status === "missing" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)"}` }}>
                <div className="flex items-center gap-3">
                  {docIcon(d.status)}
                  <div>
                    <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{d.name}</div>
                    {d.date && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{d.status === "signed" ? "Signed" : "Uploaded"}: {d.date}</div>}
                    {!d.required && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontStyle: "italic" }}>Optional</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GCStatusBadge status={d.status === "signed" || d.status === "uploaded" ? "active" : d.status === "pending" ? "pending" : d.status === "missing" ? "warning" : "review"} />
                  {(d.status === "signed" || d.status === "uploaded") && <button style={{ color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer" }}><Download className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== LICENSING TAB ===== */}
      {tab === "licensing" && (
        <div>
          <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-review) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-review) 30%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
            <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>License data synced from SureLC / NIPR — read-only view</span>
          </div>
          <GCDataTable columns={licCols} data={LICENSES} />
        </div>
      )}

      {/* ===== CARRIERS TAB ===== */}
      {tab === "carriers" && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{CARRIER_APPTS.filter(c => c.status === "appointed").length} appointed · {CARRIER_APPTS.filter(c => c.status === "pending").length} pending in SureLC</span>
            <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}><ExternalLink className="w-3 h-3" /> SureLC</a>
          </div>
          <GCDataTable columns={carrierCols} data={CARRIER_APPTS} />
        </div>
      )}

      {/* ===== CONTRACTING TAB ===== */}
      {tab === "contracting" && (
        <div className="flex flex-col gap-4">
          <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>Signing Progress</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{CONTRACTING.filter(c => c.status === "signed").length}/{CONTRACTING.length}</span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(CONTRACTING.filter(c => c.status === "signed").length / CONTRACTING.length) * 100}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
            </div>
          </div>
          {CONTRACTING.map((c, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", borderLeft: `3px solid ${c.status === "signed" ? "var(--gc-status-active)" : "var(--gc-status-pending)"}` }}>
              <div className="flex items-center gap-3">
                {c.status === "signed" ? <CheckCircle className="w-5 h-5" style={{ color: "var(--gc-status-active)" }} /> : <Clock className="w-5 h-5" style={{ color: "var(--gc-status-pending)" }} />}
                <div>
                  <div style={{ fontWeight: 500, color: "var(--gc-text-primary)" }}>{c.doc}</div>
                  {c.signedAt && <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Signed: {c.signedAt}</div>}
                  {c.hash && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontFamily: "monospace" }}>SHA-256: {c.hash}</div>}
                </div>
              </div>
              <GCStatusBadge status={c.status === "signed" ? "active" : "pending"} />
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>{showConfirm === "approve" ? "Approve Agent?" : "Reject Agent?"}</div>
            <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>{showConfirm === "approve" ? `Activate ${AGENT.name} as a sales agent with ${AGENT.contractLevel} contract level under ${AGENT.upline}.` : `Reject ${AGENT.name}'s application. They will be notified via email.`}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(null)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setAgentStatus(showConfirm === "approve" ? "approved" : "rejected"); setShowConfirm(null); }} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: showConfirm === "approve" ? "var(--gc-status-active)" : "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>{showConfirm === "approve" ? "Approve" : "Reject"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
