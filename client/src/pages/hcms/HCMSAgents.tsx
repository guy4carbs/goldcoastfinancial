import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Plus } from "lucide-react";

const MOCK = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", status: "approved", state: "IL", contractLevel: "85%", carrierCount: 3, writingNums: "MOO-445821, TRA-118904, NLG-228110", createdAt: "2026-04-01", upline: "Nicholas Gallagher" },
  { id: "2", name: "James Rodriguez", email: "james@example.com", status: "approved", state: "TX", contractLevel: "80%", carrierCount: 2, writingNums: "TRA-229015, AMR-334201", createdAt: "2026-04-08", upline: "Nicholas Gallagher" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", status: "approved", state: "CA", contractLevel: "90%", carrierCount: 5, writingNums: "MOO-556932, TRA-330122, AMR-441003, CBF-112204, NLG-339211", createdAt: "2026-03-15", upline: "Jack Cook" },
  { id: "4", name: "Emily Watson", email: "emily@example.com", status: "in_review", state: "FL", contractLevel: "80%", carrierCount: 1, writingNums: "TRA-441223", createdAt: "2026-04-05", upline: "Nicholas Gallagher" },
  { id: "5", name: "David Park", email: "david@example.com", status: "approved", state: "NY", contractLevel: "83%", carrierCount: 4, writingNums: "MOO-667845, AMR-552134, CBF-223315, NAM-114502", createdAt: "2026-02-20", upline: "Jack Cook" },
  { id: "6", name: "Lisa Thompson", email: "lisa@example.com", status: "rejected", state: "AZ", contractLevel: "—", carrierCount: 0, writingNums: "", createdAt: "2026-03-01", upline: "—" },
  { id: "7", name: "Robert Kim", email: "robert@example.com", status: "pending_review", state: "GA", contractLevel: "—", carrierCount: 0, writingNums: "", createdAt: "2026-04-12", upline: "—" },
  { id: "8", name: "Amanda Torres", email: "amanda@example.com", status: "in_review", state: "CO", contractLevel: "—", carrierCount: 0, writingNums: "", createdAt: "2026-04-11", upline: "Nicholas Gallagher" },
];

const tabs = ["All", "Pending", "Active", "Terminated"];
const [showAdd, setShowAdd] = [false, () => {}]; // placeholder

export default function HCMSAgents() {
  const [tab, setTab] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [agents, setAgents] = useState(MOCK);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filtered = useMemo(() => {
    if (tab === "All") return agents;
    const m: Record<string, string[]> = { Pending: ["pending_review", "in_review"], Active: ["approved"], Terminated: ["rejected", "terminated"] };
    return agents.filter(a => m[tab]?.includes(a.status));
  }, [tab, agents]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setAgents(prev => [...prev, { id: String(Date.now()), name: newName, email: newEmail, status: "pending_review", state: "—", contractLevel: "—", carrierCount: 0, writingNums: "", createdAt: new Date().toISOString().split("T")[0], upline: "—" }]);
    setNewName(""); setNewEmail(""); setAddOpen(false);
  };

  const cols: Column<typeof MOCK[0]>[] = [
    { key: "name", label: "Agent", sortable: true, render: (v, row) => <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v} /> },
    { key: "state", label: "State", sortable: true },
    { key: "contractLevel", label: "Contract", sortable: true, render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", color: v !== "—" ? "var(--gc-gold)" : "var(--gc-text-muted)" }}>{v}</span> },
    { key: "carrierCount", label: "Carriers", sortable: true, render: (v) => v > 0 ? <span style={{ fontWeight: 500 }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)" }}>0</span> },
    { key: "upline", label: "Upline", sortable: true },
    { key: "createdAt", label: "Applied", sortable: true },
    { key: "id", label: "", render: (_, row) => <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}>View</span></Link> },
  ];

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: "100%" };

  return (
    <div>
      <GCPageHeader title="Agent Directory" subtitle="All registered agents with carrier & contract tracking" accentUnderline
        actions={<button onClick={() => setAddOpen(true)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}><Plus className="w-4 h-4" /> Add Agent</button>} />

      <div className="flex gap-1 mb-4">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search agents by name, email, or state..." />

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setAddOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Add Agent</div>
            <div className="flex flex-col gap-3 mb-6">
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Full Name</label><input value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} type="email" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddOpen(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
