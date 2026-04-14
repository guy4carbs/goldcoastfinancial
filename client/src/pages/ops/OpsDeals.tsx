import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const MOCK = [
  { id: "1", agentName: "Sarah Mitchell", clientName: "John & Mary Smith", carrier: "Mutual of Omaha", productType: "term_life", monthlyPremium: 125, annualPremium: 1500, status: "verified", submittedAt: "2026-04-10" },
  { id: "2", agentName: "James Rodriguez", clientName: "Roberto Garcia", carrier: "Transamerica", productType: "whole_life", monthlyPremium: 280, annualPremium: 3360, status: "submitted", submittedAt: "2026-04-12" },
  { id: "3", agentName: "Michael Chen", clientName: "Lisa Wang", carrier: "Corebridge", productType: "iul", monthlyPremium: 450, annualPremium: 5400, status: "submitted", submittedAt: "2026-04-11" },
  { id: "4", agentName: "Emily Watson", clientName: "Thomas Baker", carrier: "Americo", productType: "final_expense", monthlyPremium: 65, annualPremium: 780, status: "verified", submittedAt: "2026-04-08" },
];
const tabs = ["All", "Submitted", "Verified", "Rejected"];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agentName", label: "Agent", sortable: true },
  { key: "clientName", label: "Client" },
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "productType", label: "Product", render: (v) => v.replace(/_/g, " ") },
  { key: "annualPremium", label: "Annual", sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "submittedAt", label: "Submitted", sortable: true },
];
export default function OpsDeals() {
  const [tab, setTab] = useState("All");
  const filtered = useMemo(() => tab === "All" ? MOCK : MOCK.filter(d => d.status === tab.toLowerCase()), [tab]);
  return (
    <div>
      <GCPageHeader title="Deal Submissions" subtitle="Track and verify agent deal submissions" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Submit Deal</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Submitted (Month)" value={4} accentTop />
        <GCKPICard label="Verified" value={2} accentTop />
        <GCKPICard label="Total AP (Month)" value="$11K" accentTop delta={{ value: "+8%", positive: true }} />
        <GCKPICard label="Pending Review" value={2} accentTop />
      </div>
      <div className="flex gap-1 mb-4">{tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}</div>
      <GCDataTable columns={cols} data={filtered} searchable />
    </div>
  );
}
