import { useState } from "react";
import { GCStatusBadge } from "./GCStatusBadge";

export interface PipelineAgent {
  id: string; name: string; email: string; approvalStatus: string; createdAt: string;
}

const stageColors: Record<string, string> = {
  pending_review: "var(--gc-status-pending)", in_review: "var(--gc-status-review)",
  approved: "var(--gc-status-active)", active: "var(--gc-status-active)",
  rejected: "var(--gc-status-terminated)", terminated: "var(--gc-status-terminated)",
};

function timeAgo(date: string): string {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return "Today"; if (d === 1) return "Yesterday"; return `${d}d ago`;
}

export interface GCPipelineCardProps { agent: PipelineAgent; onClick?: () => void; }

export function GCPipelineCard({ agent, onClick }: GCPipelineCardProps) {
  const [hovered, setHovered] = useState(false);
  const borderColor = stageColors[agent.approvalStatus] || "var(--gc-border)";
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="cursor-pointer" style={{
        padding: "12px 16px", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)",
        borderLeft: `3px solid ${borderColor}`, borderTop: "1px solid", borderRight: "1px solid", borderBottom: "1px solid",
        borderTopColor: hovered ? "var(--gc-gold)" : "var(--gc-border)", borderRightColor: hovered ? "var(--gc-gold)" : "var(--gc-border)", borderBottomColor: hovered ? "var(--gc-gold)" : "var(--gc-border)",
        transition: "border-color var(--gc-transition-normal)",
      }}>
      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: 4 }}>{agent.name}</div>
      <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: 8 }}>{agent.email}</div>
      <div className="flex items-center justify-between">
        <GCStatusBadge status={agent.approvalStatus} />
        <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{timeAgo(agent.createdAt)}</span>
      </div>
    </div>
  );
}
