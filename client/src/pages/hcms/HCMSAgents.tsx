import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";
import { Plus, Eye } from "lucide-react";

interface Agent {
  id: string; name: string; email: string; phone: string; npn: string;
  status: string; state: string; contractLevel: string; carrierCount: number;
  docsComplete: number; docsTotal: number; createdAt: string; upline: string;
}

const MOCK: Agent[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "(312) 555-0142", npn: "18842956", status: "approved", state: "IL", contractLevel: "85%", carrierCount: 3, docsComplete: 7, docsTotal: 9, createdAt: "2026-04-01", upline: "Nicholas Gallagher" },
  { id: "2", name: "James Rodriguez", email: "james@example.com", phone: "(214) 555-0198", npn: "22109845", status: "approved", state: "TX", contractLevel: "80%", carrierCount: 2, docsComplete: 9, docsTotal: 9, createdAt: "2026-04-08", upline: "Nicholas Gallagher" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", phone: "(415) 555-0198", npn: "33201478", status: "approved", state: "CA", contractLevel: "90%", carrierCount: 5, docsComplete: 9, docsTotal: 9, createdAt: "2026-03-15", upline: "Jack Cook" },
  { id: "4", name: "Emily Watson", email: "emily@example.com", phone: "(305) 555-0167", npn: "44120093", status: "in_review", state: "FL", contractLevel: "80%", carrierCount: 1, docsComplete: 5, docsTotal: 9, createdAt: "2026-04-05", upline: "Nicholas Gallagher" },
  { id: "5", name: "David Park", email: "david@example.com", phone: "(212) 555-0145", npn: "55098234", status: "approved", state: "NY", contractLevel: "83%", carrierCount: 4, docsComplete: 9, docsTotal: 9, createdAt: "2026-02-20", upline: "Jack Cook" },
  { id: "6", name: "Lisa Thompson", email: "lisa@example.com", phone: "(480) 555-0133", npn: "66334201", status: "approved", state: "AZ", contractLevel: "80%", carrierCount: 1, docsComplete: 8, docsTotal: 9, createdAt: "2026-03-01", upline: "Jack Cook" },
  { id: "7", name: "Robert Kim", email: "robert@example.com", phone: "(404) 555-0211", npn: "", status: "pending_review", state: "GA", contractLevel: "—", carrierCount: 0, docsComplete: 2, docsTotal: 9, createdAt: "2026-04-12", upline: "—" },
  { id: "8", name: "Amanda Torres", email: "amanda@example.com", phone: "(720) 555-0188", npn: "88201340", status: "in_review", state: "CO", contractLevel: "—", carrierCount: 0, docsComplete: 5, docsTotal: 9, createdAt: "2026-04-11", upline: "Nicholas Gallagher" },
  { id: "9", name: "Jack Cook", email: "jack@goldcoastfnl.com", phone: "(630) 478-1835", npn: "22128144", status: "approved", state: "IL", contractLevel: "100%", carrierCount: 6, docsComplete: 9, docsTotal: 9, createdAt: "2022-01-01", upline: "Gaetano" },
];

const tabs = ["All", "Pending", "Active", "Terminated"] as const;

export default function HCMSAgents() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [agents, setAgents] = useState(MOCK);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newState, setNewState] = useState("");

  const counts = useMemo(() => ({
    all: agents.length,
    pending: agents.filter(a => a.status === "pending_review" || a.status === "in_review").length,
    active: agents.filter(a => a.status === "approved").length,
    terminated: agents.filter(a => a.status === "rejected" || a.status === "terminated").length,
  }), [agents]);

  const filtered = useMemo(() => {
    if (tab === "Pending") return agents.filter(a => a.status === "pending_review" || a.status === "in_review");
    if (tab === "Active") return agents.filter(a => a.status === "approved");
    if (tab === "Terminated") return agents.filter(a => a.status === "rejected" || a.status === "terminated");
    return agents;
  }, [tab, agents]);

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setAgents(prev => [...prev, { id: String(Date.now()), name: newName, email: newEmail, phone: newPhone, npn: "", status: "pending_review", state: newState || "—", contractLevel: "—", carrierCount: 0, docsComplete: 0, docsTotal: 9, createdAt: new Date().toISOString().split("T")[0], upline: "—" }]);
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewState(""); setAddOpen(false);
  };

  const cols: Column<Agent>[] = [
    { key: "name", label: "Agent", sortable: true, width: "16%", render: (v, row) => <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontWeight: 500 }}>{v}</span></Link> },
    { key: "status", label: "Status", sortable: true, width: "10%", render: (v) => <GCStatusBadge status={v} /> },
    { key: "npn", label: "NPN", width: "10%", render: (v) => v ? <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> : <span style={{ color: "var(--gc-text-muted)", fontStyle: "italic" }}>None</span> },
    { key: "state", label: "State", sortable: true, width: "6%", align: "center" },
    { key: "contractLevel", label: "Contract", sortable: true, width: "8%", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: v !== "—" ? "var(--gc-gold)" : "var(--gc-text-muted)" }}>{v}</span> },
    { key: "carrierCount", label: "Carriers", sortable: true, width: "7%", align: "center", render: (v) => <span style={{ fontWeight: 500, color: (v as number) > 0 ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{v}</span> },
    { key: "docsComplete", label: "Docs", width: "12%", render: (v, row) => (
      <div className="flex items-center gap-2">
        <div style={{ width: 48, height: 5, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((v as number) / row.docsTotal) * 100}%`, backgroundColor: v === row.docsTotal ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)" }} />
        </div>
        <span style={{ fontSize: "var(--gc-text-xs)", color: v === row.docsTotal ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{v}/{row.docsTotal}</span>
      </div>
    )},
    { key: "upline", label: "Upline", sortable: true, width: "14%" },
    { key: "createdAt", label: "Applied", sortable: true, width: "10%" },
    { key: "id", label: "", width: "7%", align: "center", render: (_, row) => <Link href={`/hcms/agents/${row.id}`}><span className="flex items-center gap-1" style={{ color: "var(--gc-gold)", cursor: "pointer", fontSize: "var(--gc-text-sm)" }}><Eye className="w-3 h-3" /> View</span></Link> },
  ];

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: "100%" };

  return (
    <div>
      <GCPageHeader title="Agent Directory" subtitle="All registered agents — contracting, carriers & compliance status" accentUnderline
        actions={<button onClick={() => setAddOpen(true)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}><Plus className="w-4 h-4" /> Add Agent</button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={counts.all} accentTop />
        <GCKPICard label="Active" value={counts.active} accentTop delta={{ value: `${Math.round((counts.active / counts.all) * 100)}% of total`, positive: true }} />
        <GCKPICard label="Pending Review" value={counts.pending} accentTop delta={{ value: counts.pending > 0 ? "Needs action" : "None", positive: counts.pending === 0 }} />
        <GCKPICard label="Fully Documented" value={agents.filter(a => a.docsComplete === a.docsTotal).length} accentTop delta={{ value: `${agents.filter(a => a.docsComplete < a.docsTotal).length} incomplete`, positive: false }} />
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = t === "All" ? counts.all : t === "Pending" ? counts.pending : t === "Active" ? counts.active : counts.terminated;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>
              {t} <span style={{ fontSize: "var(--gc-text-xs)", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search by name, NPN, or state..." />

      {/* Add Agent Dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setAddOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Add Agent</div>
            <div className="flex flex-col gap-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Full Name *</label><input value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} placeholder="Agent's full name" /></div>
                <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>State</label><input value={newState} onChange={e => setNewState(e.target.value)} style={inputStyle} placeholder="IL" maxLength={2} /></div>
              </div>
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email *</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} type="email" placeholder="agent@email.com" /></div>
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Phone</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} style={inputStyle} placeholder="(312) 555-0100" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddOpen(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} disabled={!newName.trim() || !newEmail.trim()} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: newName.trim() && newEmail.trim() ? "pointer" : "not-allowed", fontWeight: 500, opacity: newName.trim() && newEmail.trim() ? 1 : 0.5 }}>Add Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
