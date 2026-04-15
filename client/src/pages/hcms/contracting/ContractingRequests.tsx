import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface Request {
  id: string; agent: string; agentId: string; carrier: string; state: string;
  date: string; status: "draft" | "submitted" | "returned";
  // Draft-specific
  completionPct?: number; missingItems?: string;
  // Submitted-specific
  submittedDate?: string; expectedDays?: number;
  // Returned-specific
  result?: "appointed" | "denied" | "incomplete";
  returnDate?: string; carrierResponse?: string; writingNumber?: string;
}

const MOCK: Request[] = [
  // Drafts — agents started their application but haven't submitted yet
  { id: "1", agent: "Robert Kim", agentId: "7", carrier: "Mutual of Omaha", state: "GA", date: "2026-04-12", status: "draft", completionPct: 30, missingItems: "E&O cert, AML, bank details" },
  { id: "2", agent: "Amanda Torres", agentId: "8", carrier: "Transamerica", state: "CO", date: "2026-04-11", status: "draft", completionPct: 65, missingItems: "Direct deposit form" },
  { id: "3", agent: "Daniel Martinez", agentId: "9", carrier: "Americo", state: "OH", date: "2026-04-08", status: "draft", completionPct: 15, missingItems: "Gov ID, E&O, AML, bank, DD form" },

  // Submitted — agents completed and submitted, awaiting carrier processing
  { id: "4", agent: "Sarah Mitchell", agentId: "1", carrier: "Americo", state: "IL", date: "2026-04-10", status: "submitted", submittedDate: "2026-04-10", expectedDays: 7 },
  { id: "5", agent: "Michael Chen", agentId: "3", carrier: "North American", state: "CA", date: "2026-04-05", status: "submitted", submittedDate: "2026-04-06", expectedDays: 10 },
  { id: "6", agent: "Emily Watson", agentId: "4", carrier: "Mutual of Omaha", state: "FL", date: "2026-03-28", status: "submitted", submittedDate: "2026-03-29", expectedDays: 5 },
  { id: "7", agent: "David Park", agentId: "5", carrier: "National Life Group", state: "NY", date: "2026-03-20", status: "submitted", submittedDate: "2026-03-21", expectedDays: 14 },

  // Returned — carrier has responded (appointed, denied, or sent back incomplete)
  { id: "8", agent: "Sarah Mitchell", agentId: "1", carrier: "Mutual of Omaha", state: "IL", date: "2026-03-01", status: "returned", result: "appointed", returnDate: "2026-03-15", writingNumber: "MOO-445821", carrierResponse: "Appointment confirmed" },
  { id: "9", agent: "Sarah Mitchell", agentId: "1", carrier: "Transamerica", state: "IL", date: "2026-02-15", status: "returned", result: "appointed", returnDate: "2026-03-01", writingNumber: "TRA-118904", carrierResponse: "Appointment confirmed" },
  { id: "10", agent: "James Rodriguez", agentId: "2", carrier: "Globe Life", state: "TX", date: "2026-03-10", status: "returned", result: "denied", returnDate: "2026-03-25", carrierResponse: "Background check discrepancy — additional documentation required" },
  { id: "11", agent: "Michael Chen", agentId: "3", carrier: "Corebridge Financial", state: "CA", date: "2026-01-20", status: "returned", result: "appointed", returnDate: "2026-02-10", writingNumber: "CBF-112204", carrierResponse: "Appointment confirmed" },
  { id: "12", agent: "Lisa Thompson", agentId: "6", carrier: "Foresters Financial", state: "AZ", date: "2026-02-01", status: "returned", result: "incomplete", returnDate: "2026-02-20", carrierResponse: "Missing AML certification — resubmit with updated documentation" },
];

const tabs = ["Drafts", "Submitted", "Returned"] as const;

const resultBadge = (result?: string) => {
  if (result === "appointed") return <GCStatusBadge status="active" />;
  if (result === "denied") return <GCStatusBadge status="rejected" />;
  if (result === "incomplete") return <GCStatusBadge status="warning" />;
  return null;
};

export default function ContractingRequests() {
  const [tab, setTab] = useState<typeof tabs[number]>("Drafts");

  const counts = useMemo(() => ({
    drafts: MOCK.filter(r => r.status === "draft").length,
    submitted: MOCK.filter(r => r.status === "submitted").length,
    returned: MOCK.filter(r => r.status === "returned").length,
    appointed: MOCK.filter(r => r.result === "appointed").length,
  }), []);

  const filtered = useMemo(() => MOCK.filter(r => r.status === tab.toLowerCase()), [tab]);

  // Tab-specific columns
  const draftCols: Column<Request>[] = [
    { key: "agent", label: "Agent", sortable: true, width: 160, render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "carrier", label: "Carrier", sortable: true },
    { key: "state", label: "State", width: 60, align: "center" },
    { key: "date", label: "Started", sortable: true, width: 110 },
    { key: "completionPct", label: "Progress", width: 120, render: (v) => (
      <div className="flex items-center gap-2">
        <div style={{ width: 48, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${v || 0}%`, backgroundColor: (v || 0) >= 80 ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
        </div>
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{v || 0}%</span>
      </div>
    )},
    { key: "missingItems", label: "Missing Items", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>{v || "—"}</span> },
  ];

  const submittedCols: Column<Request>[] = [
    { key: "agent", label: "Agent", sortable: true, width: 160, render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "carrier", label: "Carrier", sortable: true },
    { key: "state", label: "State", width: 60, align: "center" },
    { key: "submittedDate", label: "Submitted", sortable: true, width: 110 },
    { key: "expectedDays", label: "Expected", width: 100, render: (v) => <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{v ? `${v} business days` : "—"}</span> },
    { key: "status", label: "Status", width: 120, render: () => <GCStatusBadge status="review" /> },
  ];

  const returnedCols: Column<Request>[] = [
    { key: "agent", label: "Agent", sortable: true, width: 160, render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "carrier", label: "Carrier", sortable: true },
    { key: "state", label: "State", width: 60, align: "center" },
    { key: "returnDate", label: "Returned", sortable: true, width: 110 },
    { key: "result", label: "Result", width: 120, render: (v) => resultBadge(v) },
    { key: "writingNumber", label: "Writing #", width: 120, render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    { key: "carrierResponse", label: "Carrier Response", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{v || "—"}</span> },
  ];

  const cols = tab === "Drafts" ? draftCols : tab === "Submitted" ? submittedCols : returnedCols;

  return (
    <div>
      <GCPageHeader title="Carrier Appointment Requests" subtitle="View agent-submitted carrier appointment requests and track their status" accentUnderline
        actions={<a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> Open SureLC</a>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Drafts (In Progress)" value={counts.drafts} accentTop delta={{ value: "Not yet submitted", positive: false }} />
        <GCKPICard label="Submitted" value={counts.submitted} accentTop delta={{ value: "Awaiting carrier", positive: false }} />
        <GCKPICard label="Returned" value={counts.returned} accentTop />
        <GCKPICard label="Appointed" value={counts.appointed} accentTop delta={{ value: "Confirmed", positive: true }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "Drafts" ? counts.drafts : t === "Submitted" ? counts.submitted : counts.returned;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by agent or carrier..." />
    </div>
  );
}
