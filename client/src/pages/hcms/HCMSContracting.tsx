import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { CheckCircle, Clock, X } from "lucide-react";

const INITIAL = [
  { id: "1", agent: "Sarah Mitchell", ndaSigned: true, debtRollupSigned: true, complianceSigned: true, carriers: 3, submittedAt: "2026-04-01", reviewer: "Jack Cook", status: "completed" },
  { id: "2", agent: "James Rodriguez", ndaSigned: true, debtRollupSigned: false, complianceSigned: false, carriers: 2, submittedAt: "2026-04-08", reviewer: "Nicholas Gallagher", status: "active" },
  { id: "3", agent: "Michael Chen", ndaSigned: true, debtRollupSigned: true, complianceSigned: true, carriers: 4, submittedAt: "2026-03-15", reviewer: "Jack Cook", status: "completed" },
  { id: "4", agent: "Emily Watson", ndaSigned: true, debtRollupSigned: true, complianceSigned: false, carriers: 2, submittedAt: "2026-04-05", reviewer: null as string | null, status: "active" },
  { id: "5", agent: "David Park", ndaSigned: false, debtRollupSigned: false, complianceSigned: false, carriers: 1, submittedAt: "2026-04-10", reviewer: null as string | null, status: "pending" },
  { id: "6", agent: "Lisa Thompson", ndaSigned: true, debtRollupSigned: true, complianceSigned: true, carriers: 3, submittedAt: "2026-02-20", reviewer: "Jack Cook", status: "completed" },
  { id: "7", agent: "Robert Kim", ndaSigned: false, debtRollupSigned: false, complianceSigned: false, carriers: 0, submittedAt: "2026-04-12", reviewer: null as string | null, status: "pending" },
  { id: "8", agent: "Amanda Torres", ndaSigned: true, debtRollupSigned: false, complianceSigned: false, carriers: 1, submittedAt: "2026-04-11", reviewer: "Nicholas Gallagher", status: "active" },
];

const tabs = ["All", "Pending", "Active", "Completed"];
const DocBadge = ({ signed }: { signed: boolean }) => signed
  ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
  : <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />;

export default function HCMSContracting() {
  const [tab, setTab] = useState("All");
  const [agents, setAgents] = useState(INITIAL);
  const [showDialog, setShowDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filtered = useMemo(() => tab === "All" ? agents : agents.filter(a => a.status === tab.toLowerCase()), [tab, agents]);
  const counts = useMemo(() => {
    const c = { total: agents.length, pending: 0, active: 0, completed: 0, docsPending: 0 };
    agents.forEach(a => { (c as any)[a.status] = ((c as any)[a.status] || 0) + 1; if (!a.ndaSigned || !a.debtRollupSigned || !a.complianceSigned) c.docsPending++; });
    return c;
  }, [agents]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setAgents(prev => [...prev, { id: String(Date.now()), agent: newName, ndaSigned: false, debtRollupSigned: false, complianceSigned: false, carriers: 0, submittedAt: new Date().toISOString().split("T")[0], reviewer: null, status: "pending" }]);
    setNewName(""); setNewEmail(""); setShowDialog(false);
  };

  const cols: Column<typeof INITIAL[0]>[] = [
    { key: "agent", label: "Agent", sortable: true },
    { key: "ndaSigned", label: "NDA", render: (v) => <DocBadge signed={v} /> },
    { key: "debtRollupSigned", label: "Debt Rollup", render: (v) => <DocBadge signed={v} /> },
    { key: "complianceSigned", label: "Compliance", render: (v) => <DocBadge signed={v} /> },
    { key: "carriers", label: "Carriers", sortable: true },
    { key: "submittedAt", label: "Submitted", sortable: true },
    { key: "reviewer", label: "Reviewer", render: (v) => v || <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>Unassigned</span> },
    { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v === "completed" ? "active" : v} /> },
  ];

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: "100%" };

  return (
    <div>
      <GCPageHeader title="Contracting" subtitle="Agent contracting status & document execution" accentUnderline
        actions={<button onClick={() => setShowDialog(true)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Initiate Contracting</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Applications" value={counts.total} accentTop />
        <GCKPICard label="Documents Pending" value={counts.docsPending} accentTop delta={{ value: "Action needed", positive: false }} />
        <GCKPICard label="Fully Contracted" value={counts.completed} accentTop delta={{ value: `${Math.round((counts.completed / Math.max(1, counts.total)) * 100)}%`, positive: true }} />
        <GCKPICard label="Avg Time to Contract" value="12 days" accentTop />
      </div>
      <div className="flex gap-1 mb-4">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}
      </div>
      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search agents..." />

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowDialog(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Initiate Contracting</div>
            <div className="flex flex-col gap-3 mb-6">
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Agent Name</label><input value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} placeholder="Full legal name" /></div>
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} placeholder="agent@email.com" type="email" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDialog(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Initiate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
