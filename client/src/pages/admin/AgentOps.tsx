import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Pause,
  Play,
  Power,
  RefreshCw,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Types
interface Agent {
  id: string;
  name: string;
  tier: number;
  status: "running" | "paused" | "error";
  eventsProcessed: number;
  successRate: number;
  avgProcessingTime: number;
  description?: string;
}

interface SystemStats {
  totalAgents: number;
  running: number;
  paused: number;
  error: number;
  totalEvents: number;
  uptime: string;
}

interface TierData {
  tier: number;
  name: string;
  agents: Agent[];
}

interface AgentEvent {
  id: string;
  type: string;
  sourceAgent: string;
  timestamp: string;
  message?: string;
}

// Status indicator component
function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        status === "running" && "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]",
        status === "paused" && "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]",
        status === "error" && "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
      )}
    />
  );
}

export default function AgentOps() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([0, 1, 2]));
  const [killSwitchConfirm, setKillSwitchConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/stats");
      if (res.ok) {
        const raw = await res.json();
        const byStatus = raw.agents?.byStatus || {};
        setStats({
          totalAgents: raw.agents?.total || 0,
          running: byStatus["RUNNING"] || 0,
          paused: byStatus["PAUSED"] || 0,
          error: byStatus["ERROR"] || 0,
          totalEvents: raw.events?.totalEvents || 0,
          uptime: "Live",
        });
      }
    } catch {}
  }, []);

  const tierNames: Record<number, string> = {
    0: "Central Intelligence", 1: "Lead Acquisition", 2: "Outreach & Contact",
    3: "Inbound & Speed", 4: "Sales & Closing", 5: "Application & Policy",
    6: "Financial Ops", 7: "Client Lifecycle", 8: "Marketing & Brand",
    9: "Analytics & Learning", 10: "Governance & Meta",
  };

  const fetchTiers = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const raw = await res.json();
        const grouped: Record<number, Agent[]> = {};
        (raw.agents || []).forEach((a: any) => {
          const tier = a.tier ?? 0;
          if (!grouped[tier]) grouped[tier] = [];
          grouped[tier].push({
            id: a.id,
            name: a.name,
            tier,
            status: (a.status || "").toLowerCase() as any,
            eventsProcessed: a.metrics?.eventsProcessed || 0,
            successRate: a.metrics?.successRate || 0,
            avgProcessingTime: a.metrics?.avgProcessingTimeMs || 0,
            description: a.config?.description,
          });
        });
        const tierData: TierData[] = Object.keys(grouped)
          .map(Number)
          .sort((a, b) => a - b)
          .map(t => ({ tier: t, name: tierNames[t] || `Tier ${t}`, agents: grouped[t] }));
        setTiers(tierData);
      }
    } catch {}
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/events?limit=50");
      if (res.ok) {
        const raw = await res.json();
        setEvents((raw.events || []).map((e: any) => ({
          id: e.id,
          type: e.type,
          sourceAgent: e.source,
          timestamp: new Date(e.timestamp).toLocaleTimeString(),
        })));
      }
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchTiers(), fetchEvents()]);
    setLoading(false);
  }, [fetchStats, fetchTiers, fetchEvents]);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh agents every 10s
  useEffect(() => {
    const id = setInterval(() => {
      fetchStats();
      fetchTiers();
    }, 10000);
    return () => clearInterval(id);
  }, [fetchStats, fetchTiers]);

  // Auto-refresh events every 5s
  useEffect(() => {
    const id = setInterval(fetchEvents, 5000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const toggleTier = (tier: number) => {
    setExpandedTiers((prev) => {
      const next = new Set(prev);
      next.has(tier) ? next.delete(tier) : next.add(tier);
      return next;
    });
  };

  const handlePauseResume = async (agent: Agent) => {
    const action = agent.status === "running" ? "pause" : "resume";
    setActionLoading(agent.id);
    try {
      const res = await fetch(`/api/agents/${agent.id}/${action}`, { method: "POST" });
      if (res.ok) {
        toast.success(`${agent.name} ${action}d`);
        await fetchTiers();
        await fetchStats();
      } else {
        toast.error(`Failed to ${action} ${agent.name}`);
      }
    } catch {
      toast.error(`Failed to ${action} ${agent.name}`);
    }
    setActionLoading(null);
  };

  const handleKillSwitch = async () => {
    try {
      const res = await fetch("/api/agents/kill-switch", { method: "POST" });
      if (res.ok) {
        toast.success("Emergency kill switch activated — all agents stopped");
        setKillSwitchConfirm(false);
        await fetchAll();
      } else {
        toast.error("Kill switch failed");
      }
    } catch {
      toast.error("Kill switch failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-4 md:p-8 space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Card - Admin Lounge */}
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 50%, ${COLORS.primary.violet[700]} 100%)`,
          borderRadius: RADIUS.hero,
          padding: spacing(4),
          boxShadow: SHADOW.hero,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontSize: TYPE.hero }}>
              <Cpu className="h-8 w-8" />
              Agent Operations Center
            </h1>
            <p className="text-white/80 mt-2" style={{ fontSize: TYPE.body }}>
              GCF 37-Agent AI Enterprise Operating System
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAll}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setKillSwitchConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Power className="h-4 w-4 mr-2" />
              Kill Switch
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Kill Switch Confirmation Dialog */}
      <AnimatePresence>
        {killSwitchConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setKillSwitchConfirm(false)}
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-destructive/50 p-6 max-w-md w-full mx-4"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontSize: TYPE.title }}>Emergency Kill Switch</h3>
                  <p className="text-muted-foreground" style={{ fontSize: TYPE.meta }}>
                    This will immediately stop ALL 37 agents
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6" style={{ fontSize: TYPE.meta }}>
                Are you sure? This action will halt all agent processing across every tier.
                Agents must be manually resumed after activation.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setKillSwitchConfirm(false)} style={{ borderRadius: RADIUS.button }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleKillSwitch}
                  className="bg-red-600 hover:bg-red-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Confirm Kill Switch
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Health Overview */}
      {stats && (
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="h-4 w-4" />
                  Total Agents
                </div>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Running
                </div>
                <div className="text-2xl font-bold text-green-500">{stats.running}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-500 text-sm mb-1">
                  <Pause className="h-4 w-4" />
                  Paused
                </div>
                <div className="text-2xl font-bold text-yellow-500">{stats.paused}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                  <XCircle className="h-4 w-4" />
                  Errors
                </div>
                <div className="text-2xl font-bold text-red-500">{stats.error}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Zap className="h-4 w-4" />
                  Total Events
                </div>
                <div className="text-2xl font-bold">{(stats.totalEvents ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  Uptime
                </div>
                <div className="text-2xl font-bold">{stats.uptime}</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="grid lg:grid-cols-3 gap-6">
        {/* Tier Sections — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontSize: TYPE.section }}>
            <Shield className="h-5 w-5" style={{ color: COLORS.primary.violet[600] }} />
            Agent Tiers
          </h2>
          {tiers.map((tierData) => (
            <motion.div
              key={tierData.tier}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card className="overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <button
                  onClick={() => toggleTier(tierData.tier)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedTiers.has(tierData.tier) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Badge variant="outline" className="font-mono" style={{ borderRadius: RADIUS.pill }}>
                      Tier {tierData.tier}
                    </Badge>
                    <span className="font-medium">{tierData.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({tierData.agents.length} agent{tierData.agents.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tierData.agents.filter((a) => a.status === "running").length > 0 && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20" style={{ borderRadius: RADIUS.pill }}>
                        {tierData.agents.filter((a) => a.status === "running").length} running
                      </Badge>
                    )}
                    {tierData.agents.filter((a) => a.status === "error").length > 0 && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20" style={{ borderRadius: RADIUS.pill }}>
                        {tierData.agents.filter((a) => a.status === "error").length} error
                      </Badge>
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedTiers.has(tierData.tier) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: MOTION.duration.expand }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-3">
                        {tierData.agents.map((agent) => (
                          <div
                            key={agent.id}
                            className="border p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <StatusDot status={agent.status} />
                                <span className="font-medium text-sm">{agent.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant={agent.status === "running" ? "outline" : "default"}
                                className="h-7 text-xs"
                                style={{ borderRadius: RADIUS.button }}
                                disabled={actionLoading === agent.id || agent.status === "error"}
                                onClick={() => handlePauseResume(agent)}
                              >
                                {agent.status === "running" ? (
                                  <>
                                    <Pause className="h-3 w-3 mr-1" /> Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3 mr-1" /> Resume
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div>
                                <div className="font-medium text-foreground">
                                  {(agent.eventsProcessed ?? 0).toLocaleString()}
                                </div>
                                events
                              </div>
                              <div>
                                <div
                                  className={cn(
                                    "font-medium",
                                    agent.successRate >= 95
                                      ? "text-green-500"
                                      : agent.successRate >= 80
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                  )}
                                >
                                  {agent.successRate}%
                                </div>
                                success
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {agent.avgProcessingTime}ms
                                </div>
                                avg time
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Event Feed — 1/3 width */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontSize: TYPE.section }}>
            <Activity className="h-5 w-5" style={{ color: COLORS.primary.violet[600] }} />
            Live Event Feed
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </h2>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <Card className="max-h-[700px] overflow-hidden flex flex-col" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No events yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              event.type === "error" && "border-red-500/30 text-red-500",
                              event.type === "success" && "border-green-500/30 text-green-500",
                              event.type === "warning" && "border-yellow-500/30 text-yellow-500"
                            )}
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{event.sourceAgent}</span>
                          {event.message && (
                            <span className="text-muted-foreground ml-1">— {event.message}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
