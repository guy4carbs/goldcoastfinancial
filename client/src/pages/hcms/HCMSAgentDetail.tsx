import { useState } from "react";
import { GCPageHeader, GCStatusBadge } from "@/components/gc";

const MOCK = { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "(312) 555-0142", state: "IL", status: "pending_review", city: "Chicago", zip: "60601", yearsExperience: "5+", npn: "18842956", eoProvider: "NAPA", eoExpiration: "2027-01-15" };

export default function HCMSAgentDetail() {
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = ["profile", "documents", "licensing", "contracting"];

  return (
    <div>
      <GCPageHeader title={MOCK.name} subtitle={MOCK.email} breadcrumbs={[{ label: "Agents", href: "/hcms/agents" }, { label: MOCK.name }]} accentUnderline
        actions={<div className="flex gap-2">
          <button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-active)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, border: "none", cursor: "pointer" }}>Approve</button>
          <button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-status-terminated)", color: "#fff", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, border: "none", cursor: "pointer" }}>Reject</button>
        </div>} />
      <div className="flex gap-1 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: activeTab === t ? 500 : 400, color: activeTab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: activeTab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", textTransform: "capitalize" as const }}>{t}</button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[["Status", <GCStatusBadge status={MOCK.status} />], ["Email", MOCK.email], ["Phone", MOCK.phone], ["State", MOCK.state], ["City", MOCK.city], ["ZIP", MOCK.zip], ["Experience", MOCK.yearsExperience], ["NPN", MOCK.npn], ["E&O Provider", MOCK.eoProvider], ["E&O Expiration", MOCK.eoExpiration]].map(([label, val], i) => (
            <div key={i} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>{label}</div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{val}</div>
            </div>
          ))}
        </div>
      )}
      {activeTab === "documents" && <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Document vault — upload and manage agent documents</div>}
      {activeTab === "licensing" && <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>License tracking — state-by-state license grid</div>}
      {activeTab === "contracting" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["NDA", "Debt Rollup", "Compliance"].map(doc => (
            <div key={doc} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>{doc}</div>
              <GCStatusBadge status="pending" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
