import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCPipelineBoard, type PipelineAgent } from "@/components/gc";

const MOCK: PipelineAgent[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", approvalStatus: "pending_review", createdAt: "2026-04-10" },
  { id: "2", name: "James Rodriguez", email: "james@example.com", approvalStatus: "pending_review", createdAt: "2026-04-08" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", approvalStatus: "approved", createdAt: "2026-03-15" },
  { id: "4", name: "Emily Watson", email: "emily@example.com", approvalStatus: "in_review", createdAt: "2026-04-05" },
  { id: "5", name: "David Park", email: "david@example.com", approvalStatus: "approved", createdAt: "2026-02-20" },
  { id: "6", name: "Lisa Thompson", email: "lisa@example.com", approvalStatus: "rejected", createdAt: "2026-03-01" },
];

export default function HCMSPipeline() {
  const [agents, setAgents] = useState(MOCK);
  const counts = useMemo(() => {
    const c: Record<string, number> = { pending_review: 0, in_review: 0, approved: 0, rejected: 0 };
    agents.forEach(a => { const k = a.approvalStatus === "active" ? "approved" : a.approvalStatus === "terminated" ? "rejected" : a.approvalStatus; c[k] = (c[k] || 0) + 1; });
    return c;
  }, [agents]);

  const handleStageChange = (agentId: string, newStage: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, approvalStatus: newStage } : a));
  };

  return (
    <div>
      <GCPageHeader title="Contracting Pipeline" subtitle="Manage agent onboarding workflow" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Pending" value={counts.pending_review} accentTop />
        <GCKPICard label="In Review" value={counts.in_review} accentTop />
        <GCKPICard label="Active" value={counts.approved} accentTop delta={{ value: "+2", positive: true }} />
        <GCKPICard label="Terminated" value={counts.rejected} accentTop />
      </div>
      <GCPipelineBoard agents={agents} onStageChange={handleStageChange} />
    </div>
  );
}
