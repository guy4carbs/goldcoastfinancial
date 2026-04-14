import { useState } from "react";
import { GCPageHeader, GCStatusBadge, GCDataTable, type Column } from "@/components/gc";
import { CheckCircle, Clock, Download, FileText, Shield } from "lucide-react";

const AGENT = { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "(312) 555-0142", state: "IL", status: "pending_review", city: "Chicago", zip: "60601", street: "1240 Michigan Ave", yearsExperience: "5+", npn: "18842956", previousAgency: "Northwestern Mutual", eoProvider: "NAPA", eoPolicyNumber: "EO-2026-445821", eoExpiration: "2027-01-15", eoCoverage: "$1,000,000", dob: "1989-06-15", ssn: "***-**-4523", isLicensed: true };

const DOCUMENTS = [
  { id: "1", name: "E&O Certificate 2026", type: "e&o_certificate", uploadDate: "2026-01-10", expiration: "2027-01-10", status: "active", size: "245 KB" },
  { id: "2", name: "W-9 Form", type: "w9", uploadDate: "2026-01-10", expiration: null, status: "active", size: "128 KB" },
  { id: "3", name: "Driver's License (Front)", type: "id_document", uploadDate: "2026-01-10", expiration: "2028-06-15", status: "active", size: "1.2 MB" },
  { id: "4", name: "NDA — Signed", type: "contract", uploadDate: "2026-01-12", expiration: null, status: "active", size: "340 KB" },
  { id: "5", name: "Compliance Agreement — Signed", type: "contract", uploadDate: "2026-01-12", expiration: null, status: "active", size: "310 KB" },
];

const LICENSES = [
  { state: "IL", number: "IL-2024-18842", type: "Life & Health", status: "active", effective: "2024-01-15", expires: "2026-01-15" },
  { state: "IN", number: "IN-2024-99201", type: "Life & Health", status: "active", effective: "2024-03-01", expires: "2026-03-01" },
  { state: "WI", number: "WI-2025-33210", type: "Life & Health", status: "active", effective: "2025-06-01", expires: "2027-06-01" },
  { state: "MI", number: "MI-2025-44102", type: "Life Only", status: "pending", effective: "2026-04-01", expires: "2028-04-01" },
];

const CONTRACTING = [
  { doc: "Non-Disclosure Agreement", status: "signed", signedAt: "2026-01-12 14:22:05", hash: "a3f2b8...c91d" },
  { doc: "Debt Roll-Up Agreement", status: "signed", signedAt: "2026-01-12 14:25:18", hash: "7e4d1a...f823" },
  { doc: "Compliance & Ethics Agreement", status: "pending", signedAt: null, hash: null },
];

const docCols: Column<typeof DOCUMENTS[0]>[] = [
  { key: "name", label: "Document", sortable: true },
  { key: "type", label: "Type", render: (v) => v.replace(/_/g, " ") },
  { key: "uploadDate", label: "Uploaded" },
  { key: "expiration", label: "Expires", render: (v) => v || "—" },
  { key: "size", label: "Size" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "id", label: "", render: () => <button style={{ color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Download className="w-3.5 h-3.5" /> Download</button> },
];

const licCols: Column<typeof LICENSES[0]>[] = [
  { key: "state", label: "State", sortable: true, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: "number", label: "License #" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "effective", label: "Effective" },
  { key: "expires", label: "Expires" },
];

export default function HCMSAgentDetail() {
  const [activeTab, setActiveTab] = useState("profile");
  const [agentStatus, setAgentStatus] = useState(AGENT.status);
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);

  const tabs = ["profile", "documents", "licensing", "contracting"];

  const handleAction = (action: "approve" | "reject") => {
    setAgentStatus(action === "approve" ? "approved" : "rejected");
    setShowConfirm(null);
  };

  const profileFields = [
    ["Status", <GCStatusBadge status={agentStatus} />], ["Email", AGENT.email], ["Phone", AGENT.phone],
    ["Date of Birth", AGENT.dob], ["SSN", AGENT.ssn], ["Street", AGENT.street],
    ["City", AGENT.city], ["State", AGENT.state], ["ZIP", AGENT.zip],
    ["Experience", AGENT.yearsExperience], ["Previous Agency", AGENT.previousAgency], ["NPN", AGENT.npn],
    ["Licensed", AGENT.isLicensed ? "Yes" : "No"], ["E&O Provider", AGENT.eoProvider], ["E&O Policy #", AGENT.eoPolicyNumber],
    ["E&O Coverage", AGENT.eoCoverage], ["E&O Expiration", AGENT.eoExpiration],
  ];

  return (
    <div>
      <GCPageHeader title={AGENT.name} subtitle={AGENT.email} breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }, { label: AGENT.name }]} accentUnderline
        actions={agentStatus === "pending_review" ? (
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm("approve")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-active)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Approve</button>
            <button onClick={() => setShowConfirm("reject")} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Reject</button>
          </div>
        ) : <GCStatusBadge status={agentStatus} />} />

      <div className="flex gap-1 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: activeTab === t ? 500 : 400, color: activeTab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: activeTab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", textTransform: "capitalize" as const }}>{t}</button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileFields.map(([label, val], i) => (
            <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>{label}</div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "documents" && <GCDataTable columns={docCols} data={DOCUMENTS} searchable searchPlaceholder="Search documents..." />}

      {activeTab === "licensing" && <GCDataTable columns={licCols} data={LICENSES} searchable searchPlaceholder="Search licenses..." />}

      {activeTab === "contracting" && (
        <div className="flex flex-col gap-4">
          {/* Progress bar */}
          <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", fontWeight: 500 }}>Contracting Progress</span>
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-gold)" }}>{CONTRACTING.filter(c => c.status === "signed").length}/{CONTRACTING.length} Complete</span>
            </div>
            <div style={{ height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(CONTRACTING.filter(c => c.status === "signed").length / CONTRACTING.length) * 100}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)", transition: "width var(--gc-transition-normal)" }} />
            </div>
          </div>

          {CONTRACTING.map((c, i) => (
            <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="flex items-center gap-3">
                {c.status === "signed" ? <CheckCircle className="w-5 h-5" style={{ color: "var(--gc-status-active)" }} /> : <Clock className="w-5 h-5" style={{ color: "var(--gc-status-pending)" }} />}
                <div>
                  <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{c.doc}</div>
                  {c.signedAt && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Signed: {c.signedAt}</div>}
                  {c.hash && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>SHA-256: {c.hash}</div>}
                </div>
              </div>
              <GCStatusBadge status={c.status === "signed" ? "active" : "pending"} />
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 380, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>
              {showConfirm === "approve" ? "Approve Agent?" : "Reject Agent?"}
            </div>
            <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>
              {showConfirm === "approve" ? `This will activate ${AGENT.name} as a sales agent with access to the platform.` : `This will reject ${AGENT.name}'s application. They will be notified via email.`}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(null)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleAction(showConfirm)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: showConfirm === "approve" ? "var(--gc-status-active)" : "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>
                {showConfirm === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
