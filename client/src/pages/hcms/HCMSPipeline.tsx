import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCPipelineBoard, GCStatusBadge, type PipelineAgent } from "@/components/gc";
import { CheckCircle, Clock, X as XIcon, Plus } from "lucide-react";

const INITIAL: PipelineAgent[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", approvalStatus: "pending_review", createdAt: "2026-04-10" },
  { id: "2", name: "James Rodriguez", email: "james@example.com", approvalStatus: "pending_review", createdAt: "2026-04-08" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", approvalStatus: "approved", createdAt: "2026-03-15" },
  { id: "4", name: "Emily Watson", email: "emily@example.com", approvalStatus: "in_review", createdAt: "2026-04-05" },
  { id: "5", name: "David Park", email: "david@example.com", approvalStatus: "approved", createdAt: "2026-02-20" },
  { id: "6", name: "Lisa Thompson", email: "lisa@example.com", approvalStatus: "rejected", createdAt: "2026-03-01" },
  { id: "7", name: "Robert Kim", email: "robert@example.com", approvalStatus: "pending_review", createdAt: "2026-04-12" },
  { id: "8", name: "Amanda Torres", email: "amanda@example.com", approvalStatus: "in_review", createdAt: "2026-04-09" },
  { id: "9", name: "William Brown", email: "will@example.com", approvalStatus: "approved", createdAt: "2026-01-15" },
  { id: "10", name: "Jessica Davis", email: "jess@example.com", approvalStatus: "pending_review", createdAt: "2026-04-13" },
  { id: "11", name: "Christopher Lee", email: "chris@example.com", approvalStatus: "in_review", createdAt: "2026-04-07" },
  { id: "12", name: "Maria Gonzalez", email: "maria@example.com", approvalStatus: "approved", createdAt: "2026-03-20" },
];

const ACTIVITY = [
  { text: "Jessica Davis submitted application", time: "2h ago", type: "new" },
  { text: "Amanda Torres moved to In Review", time: "5h ago", type: "move" },
  { text: "Michael Chen approved as active agent", time: "1d ago", type: "approve" },
  { text: "Robert Kim submitted application", time: "2d ago", type: "new" },
  { text: "Lisa Thompson application rejected", time: "2w ago", type: "reject" },
];

const actIcon: Record<string, typeof CheckCircle> = { new: Plus, move: Clock, approve: CheckCircle, reject: XIcon };
const actColor: Record<string, string> = { new: "var(--gc-gold)", move: "var(--gc-status-review)", approve: "var(--gc-status-active)", reject: "var(--gc-status-terminated)" };

export default function HCMSPipeline() {
  const [agents, setAgents] = useState(INITIAL);
  const [selected, setSelected] = useState<PipelineAgent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const counts = useMemo(() => {
    const c = { pending_review: 0, in_review: 0, approved: 0, rejected: 0 };
    agents.forEach(a => { const k = a.approvalStatus === "active" ? "approved" : a.approvalStatus === "terminated" ? "rejected" : a.approvalStatus; if (k in c) (c as any)[k]++; });
    return c;
  }, [agents]);

  const handleStageChange = (agentId: string, newStage: string) => setAgents(prev => prev.map(a => a.id === agentId ? { ...a, approvalStatus: newStage } : a));

  const handleAdd = () => {
    if (!newName.trim()) return;
    setAgents(prev => [...prev, { id: String(Date.now()), name: newName, email: newEmail || `${newName.toLowerCase().replace(/\s/g, ".")}@example.com`, approvalStatus: "pending_review", createdAt: new Date().toISOString().split("T")[0] }]);
    setNewName(""); setNewEmail(""); setShowAdd(false);
  };

  const inputStyle = { padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", width: "100%" };

  return (
    <div>
      <GCPageHeader title="Contracting Pipeline" subtitle="Manage agent onboarding workflow" accentUnderline
        actions={<button onClick={() => setShowAdd(true)} className="flex items-center gap-1" style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}><Plus className="w-4 h-4" /> Add Application</button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Pending" value={counts.pending_review} accentTop />
        <GCKPICard label="In Review" value={counts.in_review} accentTop />
        <GCKPICard label="Active" value={counts.approved} accentTop delta={{ value: "+3 this month", positive: true }} />
        <GCKPICard label="Terminated" value={counts.rejected} accentTop />
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <GCPipelineBoard agents={agents} onStageChange={handleStageChange} />
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 280, padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", flexShrink: 0, alignSelf: "flex-start" }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>{selected.name}</span>
              <button onClick={() => setSelected(null)} style={{ color: "var(--gc-text-muted)", background: "none", border: "none", cursor: "pointer" }}><XIcon className="w-4 h-4" /></button>
            </div>
            <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-3)" }}>{selected.email}</div>
            <GCStatusBadge status={selected.approvalStatus} />
            <div style={{ marginTop: "var(--gc-space-4)", padding: "var(--gc-space-3) 0", borderTop: "1px solid var(--gc-border-subtle)" }}>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>Applied</div>
              <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{selected.createdAt}</div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="mt-6">
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Recent Activity</div>
        <div className="flex flex-col gap-2">
          {ACTIVITY.map((a, i) => {
            const Icon = actIcon[a.type] || Clock;
            return (
              <div key={i} className="flex items-center gap-3" style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)" }}>
                <div style={{ padding: "var(--gc-space-1)", borderRadius: "var(--gc-radius-full)", backgroundColor: `color-mix(in srgb, ${actColor[a.type]} 15%, transparent)` }}><Icon className="w-3.5 h-3.5" style={{ color: actColor[a.type] }} /></div>
                <span style={{ flex: 1, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{a.text}</span>
                <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", flexShrink: 0 }}>{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Dialog */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)" }}>
            <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Add Application</div>
            <div className="flex flex-col gap-3 mb-6">
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Full Name</label><input value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} placeholder="Agent's full name" /></div>
              <div><label style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", display: "block", marginBottom: "var(--gc-space-1)" }}>Email</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} placeholder="agent@email.com" type="email" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontWeight: 500 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
