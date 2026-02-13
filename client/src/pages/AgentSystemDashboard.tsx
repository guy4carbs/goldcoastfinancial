import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Gauge,
  Layers,
  Pause,
  Play,
  Power,
  RefreshCw,
  Shield,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

interface AgentInfo {
  id: string;
  name: string;
  tier: number;
  status: string;
  metrics: {
    eventsProcessed: number;
    eventsEmitted: number;
    errorsCount: number;
    avgProcessingTimeMs: number;
    successRate: number;
    uptimeMs: number;
    taskQueue: number;
  };
}

interface SystemStats {
  agents: { total: number; byStatus: Record<string, number> };
  events: { totalEvents: number; subscribers: number; deadLetters: number };
  security: { killedAgents: number; deniedActions: number; globalKillActive: boolean };
  memory: { totalNodes: number; totalEdges: number };
  revenue: { totalCommission: number; totalPremium: number; totalRevenue: number };
  funnel: {
    leadsCreated: number; leadsContacted: number; leadsQualified: number;
    policiesPlaced: number; overallConversion: number; contactRate: number; closeRate: number;
  };
}

interface EventEntry {
  id: string;
  type: string;
  source: string;
  timestamp: number;
  priority: string;
}

const STATUS_COLORS: Record<string, string> = {
  RUNNING: "bg-green-500",
  PAUSED: "bg-yellow-500",
  ERROR: "bg-red-500",
  STOPPED: "bg-gray-500",
  INITIALIZING: "bg-blue-500",
  COMPLIANCE_HOLD: "bg-orange-500",
};

const STATUS_RING: Record<string, string> = {
  RUNNING: "ring-green-500/30",
  PAUSED: "ring-yellow-500/30",
  ERROR: "ring-red-500/30",
  STOPPED: "ring-gray-500/30",
  INITIALIZING: "ring-blue-500/30",
  COMPLIANCE_HOLD: "ring-orange-500/30",
};

const TIER_NAMES: Record<number, string> = {
  0: "Orchestration",
  1: "Lead Acquisition",
  2: "Outreach & Contact",
  3: "Inbound & Speed",
  4: "Sales & Closing",
  5: "Application & Compliance",
  6: "Financial Ops",
  7: "Client Lifecycle",
  8: "Marketing & Brand",
  9: "Analytics & Learning",
  10: "Governance & Meta",
};

export default function AgentSystemDashboard() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5]));
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, statsRes, eventsRes] = await Promise.all([
        fetch("/api/agents").then(r => r.json()),
        fetch("/api/agents/stats").then(r => r.json()),
        fetch("/api/agents/events?limit=50").then(r => r.json()),
      ]);
      setAgents(agentsRes.agents || []);
      setStats(statsRes);
      setEvents(eventsRes.events || []);
      setKillSwitchActive(statsRes?.security?.globalKillActive || false);
    } catch (err) {
      console.error("Failed to fetch agent data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handlePause = async (id: string) => {
    await fetch(`/api/agents/${id}/pause`, { method: "POST" });
    fetchData();
  };

  const handleResume = async (id: string) => {
    await fetch(`/api/agents/${id}/resume`, { method: "POST" });
    fetchData();
  };

  const handleKillSwitch = async () => {
    if (!killSwitchActive) {
      if (!window.confirm("⚠️ ACTIVATE GLOBAL KILL SWITCH?\n\nThis will halt ALL agents immediately.")) return;
      await fetch("/api/agents/kill-switch", { method: "POST" });
    } else {
      await fetch("/api/agents/kill-switch/deactivate", { method: "POST" });
    }
    fetchData();
  };

  const toggleTier = (tier: number) => {
    setExpandedTiers(prev => {
      const next = new Set(prev);
      next.has(tier) ? next.delete(tier) : next.add(tier);
      return next;
    });
  };

  // Group agents by tier
  const tierGroups = agents.reduce<Record<number, AgentInfo[]>>((acc, agent) => {
    if (!acc[agent.tier]) acc[agent.tier] = [];
    acc[agent.tier].push(agent);
    return acc;
  }, {});

  const runningCount = agents.filter(a => a.status === "RUNNING").length;
  const errorCount = agents.filter(a => a.status === "ERROR").length;
  const pausedCount = agents.filter(a => a.status === "PAUSED").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Cpu className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading Agent System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GCF Agent System</h1>
              <p className="text-sm text-gray-400">{agents.length} Agents • 11 Tiers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleKillSwitch}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
                killSwitchActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Power className="w-4 h-4" />
              {killSwitchActive ? "Deactivate Kill Switch" : "Kill Switch"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Kill Switch Warning */}
        {killSwitchActive && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-400">GLOBAL KILL SWITCH ACTIVE</p>
              <p className="text-sm text-red-300">All agents are halted. No events are being processed.</p>
            </div>
          </div>
        )}

        {/* System Health Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-400" />} label="Running" value={runningCount} color="text-green-400" />
          <StatCard icon={<XCircle className="w-5 h-5 text-red-400" />} label="Errors" value={errorCount} color="text-red-400" />
          <StatCard icon={<Pause className="w-5 h-5 text-yellow-400" />} label="Paused" value={pausedCount} color="text-yellow-400" />
          <StatCard icon={<Zap className="w-5 h-5 text-blue-400" />} label="Events" value={stats?.events.totalEvents || 0} color="text-blue-400" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} label="Revenue" value={`$${(stats?.revenue.totalRevenue || 0).toLocaleString()}`} color="text-emerald-400" />
          <StatCard icon={<Gauge className="w-5 h-5 text-purple-400" />} label="Conversion" value={`${(stats?.funnel.overallConversion || 0).toFixed(1)}%`} color="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Grid by Tier */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Agent Tiers
            </h2>
            {Object.keys(tierGroups).sort((a, b) => Number(a) - Number(b)).map(tierStr => {
              const tier = Number(tierStr);
              const tierAgents = tierGroups[tier];
              const expanded = expandedTiers.has(tier);
              const tierRunning = tierAgents.filter(a => a.status === "RUNNING").length;
              const tierErrors = tierAgents.filter(a => a.status === "ERROR").length;

              return (
                <div key={tier} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => toggleTier(tier)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className="text-xs font-mono text-gray-500">T{tier}</span>
                      <span className="font-medium">{TIER_NAMES[tier] || `Tier ${tier}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">{tierRunning}✓</span>
                      {tierErrors > 0 && <span className="text-red-400">{tierErrors}✗</span>}
                      <span className="text-gray-500">{tierAgents.length} agents</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                      {tierAgents.map(agent => (
                        <div key={agent.id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[agent.status] || "bg-gray-500"} ring-4 ${STATUS_RING[agent.status] || "ring-gray-500/30"}`} />
                            <div>
                              <p className="text-sm font-medium">{agent.name.replace(/_/g, " ")}</p>
                              <p className="text-xs text-gray-500">{agent.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span title="Events Processed">{agent.metrics.eventsProcessed} events</span>
                            <span title="Success Rate" className={agent.metrics.successRate < 90 ? "text-yellow-400" : ""}>
                              {agent.metrics.successRate.toFixed(0)}%
                            </span>
                            <span title="Avg Processing Time">{agent.metrics.avgProcessingTimeMs.toFixed(0)}ms</span>
                            {agent.metrics.errorsCount > 0 && (
                              <span className="text-red-400" title="Errors">{agent.metrics.errorsCount} err</span>
                            )}
                            <div className="flex gap-1">
                              {agent.status === "RUNNING" ? (
                                <button onClick={() => handlePause(agent.id)} className="p-1 rounded hover:bg-gray-700" title="Pause">
                                  <Pause className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => handleResume(agent.id)} className="p-1 rounded hover:bg-gray-700" title="Resume">
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Event Feed */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Event Feed
            </h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 max-h-[600px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No events yet</p>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {events.slice(0, 30).map(event => (
                    <div key={event.id} className="px-3 py-2 hover:bg-gray-800/30">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono ${
                          event.priority === "critical" ? "text-red-400" :
                          event.priority === "high" ? "text-yellow-400" : "text-gray-400"
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{event.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Info */}
            <h2 className="text-lg font-semibold flex items-center gap-2 pt-2">
              <Shield className="w-5 h-5 text-blue-400" />
              System Info
            </h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-2 text-sm">
              <InfoRow label="Memory Nodes" value={stats?.memory.totalNodes || 0} />
              <InfoRow label="Memory Edges" value={stats?.memory.totalEdges || 0} />
              <InfoRow label="Event Subscribers" value={stats?.events.subscribers || 0} />
              <InfoRow label="Dead Letters" value={stats?.events.deadLetters || 0} />
              <InfoRow label="Security Denied" value={stats?.security.deniedActions || 0} />
              <InfoRow label="Killed Agents" value={stats?.security.killedAgents || 0} />
              <InfoRow label="Leads Created" value={stats?.funnel.leadsCreated || 0} />
              <InfoRow label="Policies Placed" value={stats?.funnel.policiesPlaced || 0} />
              <InfoRow label="Contact Rate" value={`${(stats?.funnel.contactRate || 0).toFixed(1)}%`} />
              <InfoRow label="Close Rate" value={`${(stats?.funnel.closeRate || 0).toFixed(1)}%`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-400">{label}</span></div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-mono">{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}
