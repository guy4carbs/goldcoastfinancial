import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Edit3, ExternalLink } from "lucide-react";

const CARRIERS = ["Mutual of Omaha", "Transamerica", "Americo", "Corebridge Financial", "National Life Group", "North American"];
const AGENTS_DATA: { name: string; appointments: Record<string, { status: string; writing: string; level: string }> }[] = [
  { name: "Sarah Mitchell", appointments: { "Mutual of Omaha": { status: "appointed", writing: "MOO-445821", level: "85%" }, "Transamerica": { status: "appointed", writing: "TRA-118904", level: "80%" }, "Americo": { status: "pending", writing: "", level: "" }, "Corebridge Financial": { status: "none", writing: "", level: "" }, "National Life Group": { status: "appointed", writing: "NLG-228110", level: "82%" }, "North American": { status: "none", writing: "", level: "" } } },
  { name: "James Rodriguez", appointments: { "Mutual of Omaha": { status: "none", writing: "", level: "" }, "Transamerica": { status: "appointed", writing: "TRA-229015", level: "78%" }, "Americo": { status: "appointed", writing: "AMR-334201", level: "75%" }, "Corebridge Financial": { status: "pending", writing: "", level: "" }, "National Life Group": { status: "none", writing: "", level: "" }, "North American": { status: "none", writing: "", level: "" } } },
  { name: "Michael Chen", appointments: { "Mutual of Omaha": { status: "appointed", writing: "MOO-556932", level: "90%" }, "Transamerica": { status: "appointed", writing: "TRA-330122", level: "88%" }, "Americo": { status: "appointed", writing: "AMR-441003", level: "85%" }, "Corebridge Financial": { status: "appointed", writing: "CBF-112204", level: "90%" }, "National Life Group": { status: "appointed", writing: "NLG-339211", level: "88%" }, "North American": { status: "pending", writing: "", level: "" } } },
  { name: "Emily Watson", appointments: { "Mutual of Omaha": { status: "terminated", writing: "MOO-221334", level: "70%" }, "Transamerica": { status: "appointed", writing: "TRA-441223", level: "80%" }, "Americo": { status: "none", writing: "", level: "" }, "Corebridge Financial": { status: "none", writing: "", level: "" }, "National Life Group": { status: "none", writing: "", level: "" }, "North American": { status: "none", writing: "", level: "" } } },
  { name: "David Park", appointments: { "Mutual of Omaha": { status: "appointed", writing: "MOO-667845", level: "83%" }, "Transamerica": { status: "none", writing: "", level: "" }, "Americo": { status: "appointed", writing: "AMR-552134", level: "80%" }, "Corebridge Financial": { status: "appointed", writing: "CBF-223315", level: "83%" }, "National Life Group": { status: "none", writing: "", level: "" }, "North American": { status: "appointed", writing: "NAM-114502", level: "80%" } } },
];

const statusDot: Record<string, string> = { appointed: "var(--gc-status-active)", pending: "var(--gc-status-pending)", terminated: "var(--gc-status-terminated)", none: "var(--gc-text-muted)" };

// Flatten for list view
const flatList = AGENTS_DATA.flatMap(a => Object.entries(a.appointments).filter(([_, v]) => v.status !== "none").map(([carrier, v]) => ({ agent: a.name, carrier, writing: v.writing, status: v.status, level: v.level })));

const listCols: Column<typeof flatList[0]>[] = [
  { key: "agent", label: "Agent", sortable: true },
  { key: "carrier", label: "Carrier", sortable: true },
  { key: "writing", label: "Writing #", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)", color: "var(--gc-gold)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Not assigned</span> },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v === "appointed" ? "active" : v} /> },
  { key: "level", label: "Commission", render: (v) => v || "—" },
];

export default function HCMSCarriers() {
  const [view, setView] = useState<"matrix" | "list">("matrix");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const appointed = flatList.filter(f => f.status === "appointed").length;
  const pending = flatList.filter(f => f.status === "pending").length;
  const noWriting = flatList.filter(f => f.status === "appointed" && !f.writing).length;

  return (
    <div>
      <GCPageHeader title="Carrier Appointments" subtitle="Track agent-carrier appointments, writing numbers & SureLC status" accentUnderline
        actions={<div className="flex gap-2">
          {(["matrix", "list"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: view === v ? "var(--gc-gold)" : "var(--gc-surface)", color: view === v ? "var(--gc-btn-primary-text)" : "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer", textTransform: "capitalize" as const }}>{v}</button>)}
          <a href="https://www.surelc.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 no-underline" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}><ExternalLink className="w-3.5 h-3.5" /> SureLC</a>
        </div>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Carriers in Network" value={CARRIERS.length} accentTop />
        <GCKPICard label="Active Appointments" value={appointed} accentTop delta={{ value: `${AGENTS_DATA.length} agents`, positive: true }} />
        <GCKPICard label="Pending in SureLC" value={pending} accentTop delta={{ value: "Awaiting submission", positive: false }} />
        <GCKPICard label="Missing Writing #s" value={noWriting} accentTop />
      </div>

      {view === "matrix" ? (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", overflow: "auto" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "var(--gc-space-3) var(--gc-space-4)", textAlign: "left", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)", borderBottom: "2px solid var(--gc-gold)", position: "sticky" as const, left: 0, backgroundColor: "var(--gc-surface)", zIndex: 1, minWidth: 160 }}>Agent</th>
                {CARRIERS.map(c => <th key={c} style={{ padding: "var(--gc-space-3)", textAlign: "center", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)", borderBottom: "2px solid var(--gc-gold)", minWidth: 140 }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {AGENTS_DATA.map((agent, ai) => (
                <tr key={agent.name} style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
                  <td style={{ padding: "var(--gc-space-3) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)", position: "sticky" as const, left: 0, backgroundColor: ai % 2 === 0 ? "var(--gc-surface)" : "var(--gc-surface-2)", zIndex: 1 }}>{agent.name}</td>
                  {CARRIERS.map(carrier => {
                    const appt = agent.appointments[carrier];
                    const cellKey = `${agent.name}-${carrier}`;
                    const isEditing = editingCell === cellKey;
                    const isHovered = hoveredCell === cellKey;
                    return (
                      <td key={carrier}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ padding: "var(--gc-space-2) var(--gc-space-3)", textAlign: "center", backgroundColor: ai % 2 === 0 ? "var(--gc-surface)" : "var(--gc-surface-2)", position: "relative" as const, cursor: appt.status !== "none" ? "pointer" : "default" }}>
                        <div className="flex flex-col items-center gap-1">
                          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: statusDot[appt.status], opacity: appt.status === "none" ? 0.2 : 1 }} />
                          {appt.writing ? (
                            isEditing ? (
                              <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={e => e.key === "Enter" && setEditingCell(null)} style={{ width: 100, padding: "2px 4px", fontSize: "var(--gc-text-xs)", fontFamily: "monospace", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", textAlign: "center" }} />
                            ) : (
                              <span onClick={() => { setEditingCell(cellKey); setEditValue(appt.writing); }} style={{ fontFamily: "monospace", fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", cursor: "pointer" }}>{appt.writing}</span>
                            )
                          ) : appt.status !== "none" ? (
                            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", fontStyle: "italic" }}>No #</span>
                          ) : null}
                          {appt.level && <span style={{ fontSize: "9px", color: "var(--gc-text-muted)" }}>{appt.level}</span>}
                        </div>
                        {isHovered && appt.status !== "none" && !isEditing && (
                          <div style={{ position: "absolute", top: 2, right: 2 }}><Edit3 className="w-3 h-3" style={{ color: "var(--gc-text-muted)", opacity: 0.5 }} /></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-6 px-4 py-3" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
            {[["Appointed", "var(--gc-status-active)"], ["Pending in SureLC", "var(--gc-status-pending)"], ["Terminated", "var(--gc-status-terminated)"], ["Not Started", "var(--gc-text-muted)"]].map(([label, color]) => (
              <span key={label as string} className="flex items-center gap-1.5" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color as string, opacity: label === "Not Started" ? 0.2 : 1 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <GCDataTable columns={listCols} data={flatList} searchable searchPlaceholder="Search appointments..." />
      )}
    </div>
  );
}
