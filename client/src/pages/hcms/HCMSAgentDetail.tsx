import { useState } from "react";
import { GCPageHeader, GCStatusBadge, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Download, ExternalLink } from "lucide-react";

const AGENT = { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "(312) 555-0142", state: "IL", status: "pending_review", city: "Chicago", zip: "60601", street: "1240 Michigan Ave", dob: "1989-06-15", ssn: "***-**-4523", yearsExperience: "5+", npn: "18842956", previousAgency: "Northwestern Mutual", eoProvider: "NAPA", eoPolicyNumber: "EO-2026-445821", eoExpiration: "2027-01-15", eoCoverage: "$1,000,000", contractLevel: "85%", upline: "Nicholas Gallagher", isLicensed: true };

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
  { state: "IL", number: "IL-2024-18842", type: "Life & Health", status: "active", effective: "2024-01-15", expires: "2026-01-15" },
  { state: "IN", number: "IN-2024-99201", type: "Life & Health", status: "active", effective: "2024-03-01", expires: "2026-03-01" },
  { state: "WI", number: "WI-2025-33210", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01" },
  { state: "MI", number: "MI-2025-44102", type: "Life Only", status: "pending", effective: "2026-04-01", expires: "2028-04-01" },
];

const CARRIER_APPTS = [
  { carrier: "Mutual of Omaha", writing: "MOO-445821", status: "appointed", date: "2024-06-15", level: "85%", state: "IL" },
  { carrier: "Transamerica", writing: "TRA-118904", status: "appointed", date: "2024-07-01", level: "80%", state: "IL" },
  { carrier: "National Life Group", writing: "NLG-228110", status: "appointed", date: "2025-01-15", level: "82%", state: "IL, IN" },
  { carrier: "Americo", writing: "", status: "pending", date: "2026-04-01", level: "", state: "IL" },
];

const CONTRACTING = [
  { doc: "Non-Disclosure Agreement", status: "signed", signedAt: "2026-01-12 14:22:05", hash: "a3f2b8c4...91d0e2f1" },
  { doc: "Debt Roll-Up Agreement", status: "signed", signedAt: "2026-01-12 14:25:18", hash: "7e4d1ab3...f823c09a" },
  { doc: "Compliance & Ethics Agreement", status: "pending", signedAt: null, hash: null },
];

const docIcon = (s: string) => s === "signed" || s === "uploaded" ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : s === "pending" ? <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} /> : s === "missing" ? <XIcon className="w-4 h-4" style={{ color: "var(--gc-status-terminated)" }} /> : <span style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}>N/A</span>;

const licCols: Column<typeof LICENSES[0]>[] = [
  { key: "state", label: "State", sortable: true, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: "number", label: "License #", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "type", label: "Type" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "effective", label: "Effective" },
  { key: "expires", label: "Expires" },
];

const carrierCols: Column<typeof CARRIER_APPTS[0]>[] = [
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "writing", label: "Writing #", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Pending</span> },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v === "appointed" ? "active" : v} /> },
  { key: "date", label: "Appointment Date" },
  { key: "level", label: "Commission", render: (v) => v || "—" },
  { key: "state", label: "States" },
];

export default function HCMSAgentDetail() {
  const [tab, setTab] = useState("profile");
  const [agentStatus, setAgentStatus] = useState(AGENT.status);
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);

  const tabs = ["profile", "documents", "licensing", "carriers", "contracting"];
  const docsComplete = DOCUMENTS.filter(d => d.status === "signed" || d.status === "uploaded").length;
  const docsRequired = DOCUMENTS.filter(d => d.required).length;

  return (
    <div>
      <GCPageHeader title={AGENT.name} subtitle={`${AGENT.email} · NPN: ${AGENT.npn} · Contract: ${AGENT.contractLevel}`}
        breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }, { label: AGENT.name }]} accentUnderline
        actions={agentStatus === "pending_review" ? (
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm("approve")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-active)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Approve</button>
            <button onClick={() => setShowConfirm("reject")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Reject</button>
          </div>
        ) : <GCStatusBadge status={agentStatus} />} />

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", textTransform: "capitalize" as const, whiteSpace: "nowrap" as const }}>{t}</button>)}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[["Status", <GCStatusBadge status={agentStatus} />], ["Email", AGENT.email], ["Phone", AGENT.phone], ["Date of Birth", AGENT.dob], ["SSN", AGENT.ssn], ["Address", `${AGENT.street}, ${AGENT.city}, ${AGENT.state} ${AGENT.zip}`], ["Experience", AGENT.yearsExperience], ["Previous Agency", AGENT.previousAgency], ["NPN", AGENT.npn], ["Contract Level", AGENT.contractLevel], ["Upline", AGENT.upline], ["E&O Provider", AGENT.eoProvider], ["E&O Policy #", AGENT.eoPolicyNumber], ["E&O Coverage", AGENT.eoCoverage], ["E&O Expiration", AGENT.eoExpiration]].map(([label, val], i) => (
            <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>{label}</div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Tab — 9 doc checklist */}
      {tab === "documents" && (
        <div>
          <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", marginBottom: "var(--gc-space-4)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Document Completion</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{docsComplete}/{DOCUMENTS.length}</span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(docsComplete / DOCUMENTS.length) * 100}%`, backgroundColor: docsComplete === docsRequired ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {DOCUMENTS.map((d, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)" }}>
                <div className="flex items-center gap-3">
                  {docIcon(d.status)}
                  <div>
                    <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>{d.name}</div>
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

      {/* Licensing Tab — read-only from SureLC */}
      {tab === "licensing" && (
        <div>
          <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: `color-mix(in srgb, var(--gc-status-review) 10%, transparent)`, border: "1px solid var(--gc-status-review)", borderRadius: "var(--gc-radius-md)" }}>
            <ExternalLink className="w-4 h-4" style={{ color: "var(--gc-status-review)" }} />
            <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-review)" }}>License data synced from SureLC / NIPR — read-only view</span>
          </div>
          <GCDataTable columns={licCols} data={LICENSES} />
        </div>
      )}

      {/* Carriers Tab — writing numbers */}
      {tab === "carriers" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{CARRIER_APPTS.filter(c => c.status === "appointed").length} appointed · {CARRIER_APPTS.filter(c => c.status === "pending").length} pending in SureLC</span>
          </div>
          <GCDataTable columns={carrierCols} data={CARRIER_APPTS} />
        </div>
      )}

      {/* Contracting Tab — signing progress */}
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
            <div key={i} className="flex items-center justify-between" style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
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
          <div onClick={e => e.stopPropagation()} style={{ width: 380, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>{showConfirm === "approve" ? "Approve Agent?" : "Reject Agent?"}</div>
            <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>{showConfirm === "approve" ? `Activate ${AGENT.name} as a sales agent.` : `Reject ${AGENT.name}'s application.`}</p>
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
