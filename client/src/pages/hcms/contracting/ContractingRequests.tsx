import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink } from "lucide-react";

const MOCK = [
  { id: "1", agent: "Sarah Mitchell", carrier: "Americo", state: "IL", requestDate: "2026-04-10", status: "draft", notes: "Awaiting E&O upload", returnReason: "" },
  { id: "2", agent: "James Rodriguez", carrier: "Corebridge Financial", state: "TX", requestDate: "2026-04-08", status: "draft", notes: "Missing state license", returnReason: "" },
  { id: "3", agent: "Michael Chen", carrier: "North American", state: "CA", requestDate: "2026-04-05", status: "submitted", notes: "Submitted via SureLC 4/6", returnReason: "" },
  { id: "4", agent: "Emily Watson", carrier: "Mutual of Omaha", state: "FL", requestDate: "2026-03-28", status: "submitted", notes: "Expected 5-7 business days", returnReason: "" },
  { id: "5", agent: "David Park", carrier: "National Life Group", state: "NY", requestDate: "2026-03-20", status: "submitted", notes: "Under review", returnReason: "" },
  { id: "6", agent: "Sarah Mitchell", carrier: "Foresters Financial", state: "IN", requestDate: "2026-03-15", status: "returned", notes: "", returnReason: "Missing AML certification — required by carrier" },
  { id: "7", agent: "James Rodriguez", carrier: "Globe Life", state: "TX", requestDate: "2026-03-10", status: "returned", notes: "", returnReason: "Background check discrepancy — additional documentation needed" },
  { id: "8", agent: "Lisa Thompson", carrier: "Transamerica", state: "AZ", requestDate: "2026-04-01", status: "draft", notes: "Pending license verification", returnReason: "" },
];

const tabs = ["Drafts", "Submitted", "Returned"] as const;
const tabStatus: Record<string, string> = { Drafts: "draft", Submitted: "submitted", Returned: "returned" };

const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "state", label: "State", sortable: true },
  { key: "requestDate", label: "Request Date", sortable: true },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v === "draft" ? "pending" : v === "submitted" ? "review" : "warning"} /> },
  { key: "notes", label: "Notes", render: (v, row) => row.returnReason || v || "—" },
];

export default function ContractingRequests() {
  const [tab, setTab] = useState<typeof tabs[number]>("Drafts");
  const filtered = useMemo(() => MOCK.filter(r => r.status === tabStatus[tab]), [tab]);
  return (
    <div>
      <GCPageHeader title="Carrier Appointment Requests" subtitle="Track requests through SureLC — drafts, submissions & returns" accentUnderline
        actions={<a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> Open SureLC</a>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Drafts" value={MOCK.filter(r => r.status === "draft").length} accentTop />
        <GCKPICard label="Submitted" value={MOCK.filter(r => r.status === "submitted").length} accentTop delta={{ value: "Awaiting carrier", positive: false }} />
        <GCKPICard label="Returned" value={MOCK.filter(r => r.status === "returned").length} accentTop delta={{ value: "Action needed", positive: false }} />
      </div>
      <div className="flex gap-1 mb-4">{tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t} ({MOCK.filter(r => r.status === tabStatus[t]).length})</button>)}</div>
      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search requests..." />
    </div>
  );
}
