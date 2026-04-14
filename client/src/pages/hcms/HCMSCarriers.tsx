import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const CARRIERS = ["Mutual of Omaha", "Transamerica", "Americo", "Corebridge", "National Life"];
const AGENTS = ["Sarah Mitchell", "James Rodriguez", "Michael Chen", "Emily Watson", "David Park"];
const MOCK_APPTS = [
  { id: "1", agentName: "Sarah Mitchell", carrierName: "Mutual of Omaha", status: "active", stateCode: "IL", commissionLevel: "85%" },
  { id: "2", agentName: "Sarah Mitchell", carrierName: "Transamerica", status: "active", stateCode: "IL", commissionLevel: "80%" },
  { id: "3", agentName: "James Rodriguez", carrierName: "Americo", status: "pending", stateCode: "TX", commissionLevel: "75%" },
  { id: "4", agentName: "Michael Chen", carrierName: "Corebridge", status: "active", stateCode: "CA", commissionLevel: "90%" },
  { id: "5", agentName: "Emily Watson", carrierName: "Mutual of Omaha", status: "terminated", stateCode: "FL", commissionLevel: "70%" },
];
const cols: Column<typeof MOCK_APPTS[0]>[] = [
  { key: "agentName", label: "Agent", sortable: true },
  { key: "carrierName", label: "Carrier", sortable: true },
  { key: "stateCode", label: "State" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "commissionLevel", label: "Commission" },
];
export default function HCMSCarriers() {
  const [view, setView] = useState<"matrix"|"list">("matrix");
  return (
    <div>
      <GCPageHeader title="Carrier Appointments" subtitle="Manage agent-carrier appointment status" accentUnderline
        actions={<div className="flex gap-2">{(["matrix","list"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: view === v ? "var(--gc-gold)" : "var(--gc-surface)", color: view === v ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer", textTransform: "capitalize" as const }}>{v}</button>)}</div>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Total Carriers" value={5} accentTop />
        <GCKPICard label="Active Appointments" value={3} accentTop />
        <GCKPICard label="Pending" value={1} accentTop />
      </div>
      {view === "matrix" ? (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", overflow: "auto" }}>
          <table className="w-full"><thead><tr style={{ borderBottom: "1px solid var(--gc-border)" }}>
            <th style={{ padding: "var(--gc-space-3) var(--gc-space-4)", textAlign: "left", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)" }}>Agent</th>
            {CARRIERS.map(c => <th key={c} style={{ padding: "var(--gc-space-3)", textAlign: "center", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)" }}>{c}</th>)}
          </tr></thead><tbody>
            {AGENTS.map(agent => <tr key={agent} style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
              <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{agent}</td>
              {CARRIERS.map(carrier => {
                const appt = MOCK_APPTS.find(a => a.agentName === agent && a.carrierName === carrier);
                const color = appt?.status === "active" ? "var(--gc-status-active)" : appt?.status === "pending" ? "var(--gc-status-pending)" : appt?.status === "terminated" ? "var(--gc-status-terminated)" : "var(--gc-text-muted)";
                return <td key={carrier} style={{ textAlign: "center", padding: "var(--gc-space-3)" }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: color, opacity: appt ? 1 : 0.2 }} /></td>;
              })}
            </tr>)}
          </tbody></table>
        </div>
      ) : <GCDataTable columns={cols} data={MOCK_APPTS} searchable />}
    </div>
  );
}
