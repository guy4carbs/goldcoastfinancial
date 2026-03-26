import { Phone, PhoneCall, Clock, Mic } from "lucide-react";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";

function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface RecordingStatsData {
  totalCalls: number;
  callsToday: number;
  callsThisWeek: number;
  connectedCount: number;
  connectedRate: number;
  withRecording: number;
  avgDuration: number;
}

export function RecordingsStats({ stats }: { stats?: RecordingStatsData }) {
  return (
    <AgentStatCardGrid>
      <AgentStatCard
        icon={Phone}
        value={stats?.callsToday ?? 0}
        label="Calls Today"
        gradient="from-violet-500 to-purple-600"
        trend={stats ? { value: stats.callsThisWeek, positive: true, label: "this week" } : undefined}
      />
      <AgentStatCard
        icon={PhoneCall}
        value={`${stats?.connectedRate ?? 0}%`}
        label="Connected Rate"
        gradient="from-emerald-500 to-teal-600"
        trend={stats ? { value: `${stats.connectedCount} connected`, positive: true } : undefined}
      />
      <AgentStatCard
        icon={Clock}
        value={formatDuration(stats?.avgDuration ?? 0)}
        label="Avg Duration"
        gradient="from-amber-500 to-orange-600"
      />
      <AgentStatCard
        icon={Mic}
        value={stats?.withRecording ?? 0}
        label="Recorded Calls"
        gradient="from-violet-500 to-purple-600"
        trend={stats ? { value: `${stats.totalCalls} total`, positive: true } : undefined}
      />
    </AgentStatCardGrid>
  );
}
