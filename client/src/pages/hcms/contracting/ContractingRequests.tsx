import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { ExternalLink, Eye, X as XIcon } from "lucide-react";
import { Link } from "wouter";

interface Request {
  id: string; agent: string; agentId: string; carrier: string; state: string;
  date: string; status: "draft" | "submitted" | "returned";
  completionPct?: number; missingItems?: string;
  submittedDate?: string; expectedDays?: number; daysSinceSubmit?: number;
  result?: "appointed" | "denied" | "incomplete";
  returnDate?: string; carrierResponse?: string; writingNumber?: string;
}

const MOCK: Request[] = [
  { id: "1", agent: "Robert Kim", agentId: "7", carrier: "Mutual of Omaha", state: "GA", date: "2026-04-12", status: "draft", completionPct: 30, missingItems: "E&O cert, AML, bank details" },
  { id: "2", agent: "Amanda Torres", agentId: "8", carrier: "Transamerica", state: "CO", date: "2026-04-11", status: "draft", completionPct: 65, missingItems: "Direct deposit form" },
  { id: "3", agent: "Daniel Martinez", agentId: "9", carrier: "Americo", state: "OH", date: "2026-04-08", status: "draft", completionPct: 15, missingItems: "Gov ID, E&O, AML, bank, DD form" },
  { id: "4", agent: "Sarah Mitchell", agentId: "1", carrier: "Americo", state: "IL", date: "2026-04-10", status: "submitted", submittedDate: "2026-04-10", expectedDays: 7, daysSinceSubmit: 5 },
  { id: "5", agent: "Michael Chen", agentId: "3", carrier: "North American", state: "CA", date: "2026-04-05", status: "submitted", submittedDate: "2026-04-06", expectedDays: 10, daysSinceSubmit: 9 },
  { id: "6", agent: "Emily Watson", agentId: "4", carrier: "Mutual of Omaha", state: "FL", date: "2026-03-28", status: "submitted", submittedDate: "2026-03-29", expectedDays: 5, daysSinceSubmit: 17 },
  { id: "7", agent: "David Park", agentId: "5", carrier: "National Life Group", state: "NY", date: "2026-03-20", status: "submitted", submittedDate: "2026-03-21", expectedDays: 14, daysSinceSubmit: 25 },
  { id: "8", agent: "Sarah Mitchell", agentId: "1", carrier: "Mutual of Omaha", state: "IL", date: "2026-03-01", status: "returned", result: "appointed", returnDate: "2026-03-15", writingNumber: "MOO-445821", carrierResponse: "Appointment confirmed — active as of 03/15/2026" },
  { id: "9", agent: "Sarah Mitchell", agentId: "1", carrier: "Transamerica", state: "IL", date: "2026-02-15", status: "returned", result: "appointed", returnDate: "2026-03-01", writingNumber: "TRA-118904", carrierResponse: "Appointment confirmed — active as of 03/01/2026" },
  { id: "10", agent: "James Rodriguez", agentId: "2", carrier: "Globe Life", state: "TX", date: "2026-03-10", status: "returned", result: "denied", returnDate: "2026-03-25", carrierResponse: "Background check discrepancy — additional documentation required. Contact carrier compliance." },
  { id: "11", agent: "Michael Chen", agentId: "3", carrier: "Corebridge Financial", state: "CA", date: "2026-01-20", status: "returned", result: "appointed", returnDate: "2026-02-10", writingNumber: "CBF-112204", carrierResponse: "Appointment confirmed — active as of 02/10/2026" },
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
  const [viewReq, setViewReq] = useState<Request | null>(null);

  const counts = useMemo(() => ({
    drafts: MOCK.filter(r => r.status === "draft").length,
    submitted: MOCK.filter(r => r.status === "submitted").length,
    returned: MOCK.filter(r => r.status === "returned").length,
    appointed: MOCK.filter(r => r.result === "appointed").length,
  }), []);

  const filtered = useMemo(() => MOCK.filter(r => r.status === tab.toLowerCase()), [tab]);

  const baseAgent: Column<Request> = { key: "agent", label: "Agent", sortable: true, width: "18%", render: (v, row) => <Link href={`/hcms/agents/${row.agentId}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> };
  const baseCarrier: Column<Request> = { key: "carrier", label: "Carrier", sortable: true, width: "18%" };
  const baseState: Column<Request> = { key: "state", label: "State", width: "7%", align: "center" };
  const viewCol: Column<Request> = { key: "id", label: "", width: "8%", align: "center", render: (_v, row) => (
    <button onClick={() => setViewReq(row)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-1) var(--gc-space-3)", backgroundColor: "transparent", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</button>
  )};

  const cols: Column<Request>[] = tab === "Drafts" ? [
    baseAgent, baseCarrier, baseState,
    { key: "date", label: "Started", sortable: true, width: "11%" },
    { key: "completionPct", label: "Progress", width: "16%", render: (v) => (
      <div className="flex items-center gap-2">
        <div style={{ width: 56, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${v || 0}%`, backgroundColor: (v || 0) >= 80 ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
        </div>
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{v || 0}%</span>
      </div>
    )},
    { key: "missingItems", label: "Missing", width: "22%", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>{v || "—"}</span> },
    viewCol,
  ] : tab === "Submitted" ? [
    baseAgent, baseCarrier, baseState,
    { key: "submittedDate", label: "Submitted", sortable: true, width: "11%" },
    { key: "daysSinceSubmit", label: "Days Waiting", sortable: true, width: "12%", render: (v, row) => {
      const days = v as number;
      const overdue = row.expectedDays ? days > row.expectedDays : false;
      return <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: overdue ? "var(--gc-status-warning)" : "var(--gc-text-primary)" }}>{days}d {overdue ? "⚠" : ""}</span>;
    }},
    { key: "expectedDays", label: "Expected", width: "12%", render: (v) => <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{v ? `${v} biz days` : "—"}</span> },
    { key: "status", label: "Status", width: "10%", render: () => <GCStatusBadge status="review" /> },
    viewCol,
  ] : [
    baseAgent, baseCarrier, baseState,
    { key: "returnDate", label: "Returned", sortable: true, width: "11%" },
    { key: "result", label: "Result", width: "12%", render: (v) => resultBadge(v) },
    { key: "writingNumber", label: "Writing #", width: "14%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>—</span> },
    viewCol,
  ];

  const DetailRow = ({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) => (
    <div style={{ padding: "var(--gc-space-2) 0", borderBottom: "1px solid var(--gc-border-subtle)" }}>
      <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "var(--gc-text-base)", color: color || "var(--gc-text-primary)", fontFamily: mono ? "monospace" : "var(--gc-font-body)" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div>
      <GCPageHeader title="Carrier Appointment Requests" subtitle="Track agent requests through SureLC" accentUnderline
        actions={<a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> Open SureLC</a>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Drafts" value={counts.drafts} accentTop delta={{ value: "In progress", positive: false }} />
        <GCKPICard label="Submitted" value={counts.submitted} accentTop delta={{ value: "Awaiting carrier", positive: false }} />
        <GCKPICard label="Returned" value={counts.returned} accentTop delta={{ value: `${counts.appointed} appointed`, positive: true }} />
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

      {/* View Request Detail Popup */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setViewReq(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: "85vh", overflow: "auto", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)" }}>{viewReq.agent} → {viewReq.carrier}</div>
                <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Carrier Appointment Request · {viewReq.state}</div>
              </div>
              <button onClick={() => setViewReq(null)} style={{ padding: "var(--gc-space-2)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-muted)" }}><XIcon className="w-5 h-5" /></button>
            </div>

            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border-subtle)" }}>
              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Agent" value={viewReq.agent} />
                <DetailRow label="Carrier" value={viewReq.carrier} />
                <DetailRow label="State" value={viewReq.state} />
                <DetailRow label="Status" value={viewReq.status.charAt(0).toUpperCase() + viewReq.status.slice(1)} />
                <DetailRow label="Request Date" value={viewReq.date} />
                {viewReq.submittedDate && <DetailRow label="Submitted Date" value={viewReq.submittedDate} />}
                {viewReq.returnDate && <DetailRow label="Return Date" value={viewReq.returnDate} />}
                {viewReq.expectedDays && <DetailRow label="Expected Processing" value={`${viewReq.expectedDays} business days`} />}
                {viewReq.daysSinceSubmit !== undefined && <DetailRow label="Days Waiting" value={`${viewReq.daysSinceSubmit} days`} color={viewReq.expectedDays && viewReq.daysSinceSubmit > viewReq.expectedDays ? "var(--gc-status-warning)" : undefined} />}
              </div>

              {viewReq.completionPct !== undefined && (
                <div style={{ marginTop: "var(--gc-space-3)", paddingTop: "var(--gc-space-3)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Application Progress</div>
                  <div className="flex items-center gap-3">
                    <div style={{ flex: 1, height: 6, backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${viewReq.completionPct}%`, backgroundColor: "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
                    </div>
                    <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: "var(--gc-text-primary)" }}>{viewReq.completionPct}%</span>
                  </div>
                  {viewReq.missingItems && <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>Missing: {viewReq.missingItems}</div>}
                </div>
              )}

              {viewReq.result && (
                <div style={{ marginTop: "var(--gc-space-3)", paddingTop: "var(--gc-space-3)", borderTop: "1px solid var(--gc-border-subtle)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)" }}>Result</div>
                    {resultBadge(viewReq.result)}
                  </div>
                  {viewReq.writingNumber && <DetailRow label="Writing Number" value={viewReq.writingNumber} mono color="var(--gc-gold)" />}
                  {viewReq.carrierResponse && (
                    <div style={{ marginTop: "var(--gc-space-2)", padding: "var(--gc-space-3)", backgroundColor: viewReq.result === "appointed" ? "color-mix(in srgb, var(--gc-status-active) 8%, transparent)" : "color-mix(in srgb, var(--gc-status-warning) 8%, transparent)", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: viewReq.result === "appointed" ? "var(--gc-status-active)" : "var(--gc-status-warning)", lineHeight: 1.5 }}>
                      {viewReq.carrierResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
