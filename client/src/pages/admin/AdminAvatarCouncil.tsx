import { useEffect, useState, useRef } from "react";
import { useAgentStore } from "@/lib/agentStore";
import {
  useAvatarCouncilStore,
  useConnectionStatus,
  type Avatar,
} from "@/lib/avatarCouncilStore";
import { AdminLoungeLayout } from "./AdminLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Settings,
  Activity,
  BarChart3,
  Brain,
  Target,
  Shield,
  Flame,
  Heart,
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  Clock,
  Zap,
  Network,
} from "lucide-react";
import { AvatarNetworkGraph } from "@/components/admin/AvatarNetworkGraph";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';

// Map avatar slugs to icons
const avatarIcons: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
};

interface AvatarStats {
  avatarId: string;
  avatarName: string;
  responseCount: number;
  totalTokens: number;
  averageLatencyMs: number;
}

interface ActivityLog {
  id: string;
  sessionId: string;
  eventType: string;
  createdAt: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  errorMessage?: string;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  details: {
    database: boolean;
    avatarsAvailable: boolean;
    recentErrors: number;
  };
}

interface LiveSession {
  id: string;
  sessionId: string;
  userId: string;
  mode: "single" | "multi" | "debate";
  status: "active" | "paused" | "completed" | "interrupted";
  avatarIds: string[];
  avatarNames: string[];
  topic?: string;
  currentTurn?: number;
  maxTurns?: number;
  messageCount: number;
  startedAt: string;
  lastActivityAt: string;
}

interface RealtimeMetrics {
  activeSessions: number;
  activeDebates: number;
  messagesLastHour: number;
  tokensLastHour: number;
  averageResponseTime: number;
  errorRate: number;
}

export default function AdminAvatarCouncil() {
  const { currentUser } = useAgentStore();
  const [activeTab, setActiveTab] = useState("network");
  const [stats, setStats] = useState<AvatarStats[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const initializedRef = useRef(false);

  // Live monitoring state
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get store state with individual selectors to avoid re-render loops
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const isLoading = useAvatarCouncilStore((state) => state.isLoading);
  const error = useAvatarCouncilStore((state) => state.error);

  // Get actions from store - these are stable references
  const fetchAvatars = useAvatarCouncilStore((state) => state.fetchAvatars);
  const connect = useAvatarCouncilStore((state) => state.connect);
  const disconnect = useAvatarCouncilStore((state) => state.disconnect);

  const connectionStatus = useConnectionStatus();

  // Fetch data on mount (only once)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    fetchAvatars();
    connect(currentUser?.id || "admin", true);
    fetchStats();
    fetchLogs();
    fetchHealth();

    // Refresh health status periodically
    const healthInterval = setInterval(fetchHealth, 30000);

    return () => {
      disconnect();
      clearInterval(healthInterval);
    };
  }, [fetchAvatars, connect, disconnect, currentUser?.id]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch("/api/avatar-council/stats", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
    setIsLoadingStats(false);
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/avatar-council/logs?limit=100", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch("/api/avatar-council/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error("Failed to fetch health:", error);
    }
  };

  // Live monitoring functions
  const fetchLiveSessions = async () => {
    try {
      const response = await fetch("/api/avatar-council/sessions/active", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setLiveSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch live sessions:", error);
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      const response = await fetch("/api/avatar-council/metrics/realtime", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setRealtimeMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch realtime metrics:", error);
    }
  };

  const startMonitoring = () => {
    if (monitoringIntervalRef.current) return;

    setIsMonitoring(true);
    fetchLiveSessions();
    fetchRealtimeMetrics();

    // Poll every 5 seconds
    monitoringIntervalRef.current = setInterval(() => {
      fetchLiveSessions();
      fetchRealtimeMetrics();
    }, 5000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  };

  // Auto-start monitoring when on Monitor tab
  useEffect(() => {
    if (activeTab === "monitor") {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  // Admin actions
  const interruptSession = async (sessionId: string, debateId?: string) => {
    try {
      if (debateId) {
        await fetch(`/api/avatar-council/debates/${debateId}/interrupt`, {
          method: "POST",
          credentials: "include",
        });
      } else {
        await fetch(`/api/avatar-council/sessions/${sessionId}/end`, {
          method: "POST",
          credentials: "include",
        });
      }
      fetchLiveSessions();
    } catch (error) {
      console.error("Failed to interrupt session:", error);
    }
  };

  const pauseDebate = async (debateId: string) => {
    try {
      await fetch(`/api/avatar-council/debates/${debateId}/pause`, {
        method: "POST",
        credentials: "include",
      });
      fetchLiveSessions();
    } catch (error) {
      console.error("Failed to pause debate:", error);
    }
  };

  const resumeDebate = async (debateId: string) => {
    try {
      await fetch(`/api/avatar-council/debates/${debateId}/resume`, {
        method: "POST",
        credentials: "include",
      });
      fetchLiveSessions();
    } catch (error) {
      console.error("Failed to resume debate:", error);
    }
  };

  const toggleAvatarActive = async (avatarId: string) => {
    try {
      const response = await fetch(`/api/avatar-council/avatars/${avatarId}/toggle`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        fetchAvatars();
      }
    } catch (error) {
      console.error("Failed to toggle avatar:", error);
    }
  };

  const isConnected = connectionStatus === "connected";

  // Health status badge
  const HealthBadge = () => {
    if (!health) return null;

    const statusConfig = {
      healthy: { icon: CheckCircle, color: "bg-emerald-500", text: "Healthy" },
      degraded: { icon: AlertTriangle, color: "bg-amber-500", text: "Degraded" },
      unhealthy: { icon: XCircle, color: "bg-red-500", text: "Unhealthy" },
    };

    const config = statusConfig[health.status];
    const Icon = config.icon;

    return (
      <Badge className={cn("gap-1.5 text-white", config.color)}>
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </Badge>
    );
  };

  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Avatar Council' }]}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero Header */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden mb-6"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 lg:p-8 relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3"
                    style={{ fontSize: TYPE.section }}
                  >
                    <Bot className="w-7 h-7" />
                    Avatar Council
                  </h1>
                  <p className="text-violet-100 mt-1" style={{ fontSize: TYPE.body }}>
                    Manage AI avatars, monitor activity, and configure settings
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <HealthBadge />

                  <Badge
                    variant={isConnected ? "default" : "secondary"}
                    className={cn(
                      "gap-1.5 py-1.5",
                      isConnected ? "bg-white/20 text-white border-white/30" : ""
                    )}
                  >
                    {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    {connectionStatus}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/20"
                    onClick={() => { fetchAvatars(); fetchStats(); fetchLogs(); }}
                  >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 bg-slate-100">
                  <TabsTrigger value="network" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Network className="w-4 h-4" />
                    Network
                  </TabsTrigger>
                  <TabsTrigger value="avatars" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Users className="w-4 h-4" />
                    Avatars
                  </TabsTrigger>
                  <TabsTrigger value="monitor" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Zap className="w-4 h-4" />
                    Live Monitor
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <BarChart3 className="w-4 h-4" />
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Activity className="w-4 h-4" />
                    Activity Logs
                  </TabsTrigger>
                </TabsList>

                {/* Avatars Tab */}
                <TabsContent value="avatars">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                  >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <motion.div variants={fadeInUp}>
                        <motion.div
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        >
                          <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500" style={{ fontSize: TYPE.meta }}>Total Avatars</p>
                                  <p className="text-3xl font-bold text-slate-900">{avatars.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <motion.div
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        >
                          <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500" style={{ fontSize: TYPE.meta }}>Active</p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {avatars.filter(a => a.isActive).length}
                                  </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <motion.div
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        >
                          <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500" style={{ fontSize: TYPE.meta }}>Inactive</p>
                                  <p className="text-3xl font-bold text-slate-400">
                                    {avatars.filter(a => !a.isActive).length}
                                  </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
                                  <EyeOff className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <motion.div
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        >
                          <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500" style={{ fontSize: TYPE.meta }}>Total Responses</p>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {stats.reduce((sum, s) => sum + s.responseCount, 0)}
                                  </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                  <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Avatar Table */}
                    <motion.div variants={fadeInUp}>
                      <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle style={{ fontSize: TYPE.title }}>Avatar Management</CardTitle>
                          <CardDescription style={{ fontSize: TYPE.meta }}>View and manage all AI avatars</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Avatar</TableHead>
                                <TableHead>Domain Expertise</TableHead>
                                <TableHead>Debate Style</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {avatars.map((avatar) => {
                                const Icon = avatarIcons[avatar.slug] || Bot;
                                const avatarStats = stats.find(s => s.avatarId === avatar.id);

                                return (
                                  <TableRow key={avatar.id} className="hover:bg-violet-50/50">
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                          <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-900">{avatar.name}</p>
                                          <p className="text-xs text-slate-500">{avatar.slug}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {avatar.domainExpertise.slice(0, 3).map((domain) => (
                                          <Badge key={domain} variant="outline" className="text-xs border-violet-200 text-violet-700 bg-violet-50">
                                            {domain}
                                          </Badge>
                                        ))}
                                        {avatar.domainExpertise.length > 3 && (
                                          <Badge variant="outline" className="text-xs border-slate-200">
                                            +{avatar.domainExpertise.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700">
                                        {avatar.debateStyle}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                          <div
                                            key={i}
                                            className={cn(
                                              "w-1.5 h-4 rounded-sm",
                                              i < avatar.responsePriority ? "bg-violet-500" : "bg-slate-200"
                                            )}
                                          />
                                        ))}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={avatar.isActive ? "default" : "secondary"}
                                        className={avatar.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}
                                      >
                                        {avatar.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleAvatarActive(avatar.id)}
                                          className="hover:bg-violet-100 hover:text-violet-700"
                                        >
                                          {avatar.isActive ? (
                                            <EyeOff className="w-4 h-4" />
                                          ) : (
                                            <Eye className="w-4 h-4" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingAvatar(avatar);
                                            setIsEditDialogOpen(true);
                                          }}
                                          className="hover:bg-violet-100 hover:text-violet-700"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                {/* Live Monitor Tab */}
                <TabsContent value="monitor">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                  >
                    {/* Real-time Metrics */}
                    {realtimeMetrics && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                          { label: "Active Sessions", value: realtimeMetrics.activeSessions, icon: Users, color: "violet" },
                          { label: "Active Debates", value: realtimeMetrics.activeDebates, icon: Flame, color: "orange" },
                          { label: "Msgs/Hour", value: realtimeMetrics.messagesLastHour, icon: MessageSquare, color: "indigo" },
                          { label: "Tokens/Hour", value: `${(realtimeMetrics.tokensLastHour / 1000).toFixed(1)}k`, icon: Zap, color: "purple" },
                          { label: "Avg Response", value: `${realtimeMetrics.averageResponseTime}ms`, icon: Clock, color: "slate" },
                          {
                            label: "Error Rate",
                            value: `${realtimeMetrics.errorRate.toFixed(1)}%`,
                            icon: AlertTriangle,
                            color: realtimeMetrics.errorRate > 5 ? "red" : realtimeMetrics.errorRate > 1 ? "amber" : "emerald"
                          },
                        ].map((metric, index) => (
                          <motion.div key={metric.label} variants={fadeInUp}>
                            <motion.div
                              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                            >
                              <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider">{metric.label}</p>
                                      <p className={cn(
                                        "text-2xl font-bold",
                                        metric.color === "violet" && "text-violet-600",
                                        metric.color === "orange" && "text-orange-500",
                                        metric.color === "indigo" && "text-indigo-600",
                                        metric.color === "purple" && "text-purple-600",
                                        metric.color === "slate" && "text-slate-700",
                                        metric.color === "red" && "text-red-500",
                                        metric.color === "amber" && "text-amber-500",
                                        metric.color === "emerald" && "text-emerald-500"
                                      )}>
                                        {metric.value}
                                      </p>
                                    </div>
                                    <metric.icon className={cn(
                                      "w-8 h-8 opacity-50",
                                      metric.color === "violet" && "text-violet-500",
                                      metric.color === "orange" && "text-orange-500",
                                      metric.color === "indigo" && "text-indigo-500",
                                      metric.color === "purple" && "text-purple-500",
                                      metric.color === "slate" && "text-slate-400",
                                      metric.color === "red" && "text-red-500",
                                      metric.color === "amber" && "text-amber-500",
                                      metric.color === "emerald" && "text-emerald-500"
                                    )} />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Live Sessions */}
                    <motion.div variants={fadeInUp}>
                      <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  isMonitoring ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                )} />
                                Live Sessions
                              </CardTitle>
                              <CardDescription style={{ fontSize: TYPE.meta }}>Active avatar council sessions in real-time</CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => isMonitoring ? stopMonitoring() : startMonitoring()}
                              className="border-violet-200 text-violet-700 hover:bg-violet-50"
                            >
                              {isMonitoring ? "Pause" : "Resume"} Monitoring
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {liveSessions.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p>No active sessions</p>
                              <p className="text-sm mt-1">Sessions will appear here when users start conversations</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {liveSessions.map((session) => {
                                const timeSinceActivity = Date.now() - new Date(session.lastActivityAt).getTime();
                                const isStale = timeSinceActivity > 60000;

                                return (
                                  <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                      "p-4 rounded-xl border transition-all",
                                      session.mode === "debate" ? "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50" : "border-slate-200 bg-gradient-to-r from-slate-50 to-white",
                                      isStale && "opacity-60"
                                    )}
                                    style={{ borderRadius: RADIUS.card }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge
                                            variant={session.mode === "debate" ? "default" : "secondary"}
                                            className={session.mode === "debate" ? "bg-orange-500 text-white" : "bg-violet-100 text-violet-700"}
                                          >
                                            {session.mode}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              session.status === "active" && "border-emerald-500 text-emerald-600",
                                              session.status === "paused" && "border-amber-500 text-amber-600",
                                              session.status === "completed" && "border-slate-500 text-slate-600",
                                              session.status === "interrupted" && "border-red-500 text-red-600"
                                            )}
                                          >
                                            {session.status}
                                          </Badge>
                                          {isStale && (
                                            <Badge variant="outline" className="text-xs text-slate-400">
                                              Idle
                                            </Badge>
                                          )}
                                        </div>

                                        {session.topic && (
                                          <p className="font-medium mb-1 text-slate-900">"{session.topic}"</p>
                                        )}

                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {session.avatarNames.map((name, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs border-violet-200 text-violet-700 bg-violet-50">
                                              {name}
                                            </Badge>
                                          ))}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                          <span>User: {session.userId.slice(0, 8)}...</span>
                                          <span>{session.messageCount} messages</span>
                                          {session.currentTurn && session.maxTurns && (
                                            <span>Turn {session.currentTurn}/{session.maxTurns}</span>
                                          )}
                                          <span>Started {new Date(session.startedAt).toLocaleTimeString()}</span>
                                        </div>
                                      </div>

                                      <div className="flex gap-2 ml-4">
                                        {session.mode === "debate" && session.status === "active" && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => pauseDebate(session.id)}
                                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                          >
                                            <Loader2 className="w-3 h-3 mr-1" />
                                            Pause
                                          </Button>
                                        )}
                                        {session.mode === "debate" && session.status === "paused" && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => resumeDebate(session.id)}
                                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                          >
                                            <Zap className="w-3 h-3 mr-1" />
                                            Resume
                                          </Button>
                                        )}
                                        {session.status !== "completed" && session.status !== "interrupted" && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => interruptSession(session.sessionId, session.mode === "debate" ? session.id : undefined)}
                                          >
                                            <X className="w-3 h-3 mr-1" />
                                            End
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Recent Activity Feed */}
                    <motion.div variants={fadeInUp}>
                      <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle style={{ fontSize: TYPE.title }}>Recent Activity</CardTitle>
                          <CardDescription style={{ fontSize: TYPE.meta }}>Latest events from the avatar council system</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {logs.slice(0, 20).map((log) => (
                                <div
                                  key={log.id}
                                  className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg text-sm",
                                    log.errorMessage ? "bg-red-50" : "bg-slate-50"
                                  )}
                                  style={{ borderRadius: RADIUS.input }}
                                >
                                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                  </span>
                                  <Badge variant="outline" className="capitalize text-xs border-violet-200 text-violet-700">
                                    {log.eventType.replace(/_/g, " ")}
                                  </Badge>
                                  {log.tokensOut && (
                                    <span className="text-xs text-slate-500">
                                      {log.tokensOut} tokens
                                    </span>
                                  )}
                                  {log.latencyMs && (
                                    <span className="text-xs text-slate-500">
                                      {log.latencyMs}ms
                                    </span>
                                  )}
                                  {log.errorMessage && (
                                    <span className="text-xs text-red-500 truncate flex-1">
                                      {log.errorMessage}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                  >
                    {/* Usage by Avatar */}
                    <motion.div variants={fadeInUp}>
                      <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle style={{ fontSize: TYPE.title }}>Avatar Usage Statistics</CardTitle>
                          <CardDescription style={{ fontSize: TYPE.meta }}>Response counts and token usage per avatar</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingStats ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                          ) : stats.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              No usage data available yet
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Avatar</TableHead>
                                  <TableHead className="text-right">Responses</TableHead>
                                  <TableHead className="text-right">Total Tokens</TableHead>
                                  <TableHead className="text-right">Avg Latency</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stats.map((stat) => (
                                  <TableRow key={stat.avatarId} className="hover:bg-violet-50/50">
                                    <TableCell className="font-medium text-slate-900">{stat.avatarName}</TableCell>
                                    <TableCell className="text-right text-slate-700">{stat.responseCount}</TableCell>
                                    <TableCell className="text-right text-slate-700">
                                      {stat.totalTokens.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-700">
                                      {stat.averageLatencyMs}ms
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* System Health */}
                    {health && (
                      <motion.div variants={fadeInUp}>
                        <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                              System Health
                              <HealthBadge />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <motion.div
                                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50"
                                style={{ borderRadius: RADIUS.card }}
                              >
                                {health.details.database ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">Database</p>
                                  <p className="text-sm text-slate-500">
                                    {health.details.database ? "Connected" : "Disconnected"}
                                  </p>
                                </div>
                              </motion.div>

                              <motion.div
                                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50"
                                style={{ borderRadius: RADIUS.card }}
                              >
                                {health.details.avatarsAvailable ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">Avatars</p>
                                  <p className="text-sm text-slate-500">
                                    {health.details.avatarsAvailable ? "Available" : "None Active"}
                                  </p>
                                </div>
                              </motion.div>

                              <motion.div
                                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50"
                                style={{ borderRadius: RADIUS.card }}
                              >
                                {health.details.recentErrors < 5 ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : health.details.recentErrors < 10 ? (
                                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">Recent Errors</p>
                                  <p className="text-sm text-slate-500">
                                    {health.details.recentErrors} in last 100 events
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>

                {/* Logs Tab */}
                <TabsContent value="logs">
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle style={{ fontSize: TYPE.title }}>Activity Logs</CardTitle>
                        <CardDescription style={{ fontSize: TYPE.meta }}>Recent avatar council activity</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[600px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Tokens</TableHead>
                                <TableHead>Latency</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-violet-50/50">
                                  <TableCell className="text-sm text-slate-600">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize border-violet-200 text-violet-700 bg-violet-50">
                                      {log.eventType.replace(/_/g, " ")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs text-slate-500">
                                    {log.sessionId.slice(0, 8)}...
                                  </TableCell>
                                  <TableCell>
                                    {log.tokensIn || log.tokensOut ? (
                                      <span className="text-sm text-slate-600">
                                        {log.tokensIn || 0} / {log.tokensOut || 0}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                                  </TableCell>
                                  <TableCell>
                                    {log.errorMessage ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Error
                                      </Badge>
                                    ) : (
                                      <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                                        OK
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Network Tab */}
                <TabsContent value="network">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6"
                  >
                    {/* Network Graph */}
                    <motion.div variants={fadeInUp}>
                      <AvatarNetworkGraph
                        avatars={avatars}
                        className="min-h-[500px]"
                      />
                    </motion.div>

                    {/* Communication Pathways Info */}
                    <motion.div variants={fadeInUp}>
                      <Card style={{ borderRadius: RADIUS.card }} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <Network className="w-4 h-4 text-white" />
                            </div>
                            Communication Pathways
                          </CardTitle>
                          <CardDescription style={{ fontSize: TYPE.meta }}>
                            All avatars are fully connected for real-time collaborative intelligence
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {avatars.map((avatar, index) => {
                              const otherAvatars = avatars.filter((other) => other.id !== avatar.id);

                              return (
                                <motion.div
                                  key={avatar.id}
                                  variants={scaleIn}
                                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                                >
                                  <div
                                    className={cn(
                                      "p-4 rounded-xl border transition-all",
                                      avatar.isActive
                                        ? "border-violet-200 bg-gradient-to-br from-violet-50/80 to-white shadow-md"
                                        : "border-slate-200 bg-slate-50/50 opacity-60"
                                    )}
                                    style={{ borderRadius: RADIUS.card }}
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      {/* Avatar image */}
                                      <div className="relative">
                                        {avatar.avatarImageUrl ? (
                                          <img
                                            src={avatar.avatarImageUrl}
                                            alt={avatar.name}
                                            className={cn(
                                              "w-12 h-12 rounded-full object-cover object-top border-2",
                                              avatar.isActive ? "border-violet-400" : "border-slate-300"
                                            )}
                                          />
                                        ) : (
                                          <div
                                            className={cn(
                                              "w-12 h-12 rounded-full flex items-center justify-center",
                                              avatar.isActive ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-slate-200"
                                            )}
                                          >
                                            <Bot
                                              className={cn(
                                                "w-6 h-6",
                                                avatar.isActive ? "text-white" : "text-slate-400"
                                              )}
                                            />
                                          </div>
                                        )}
                                        {/* Status indicator */}
                                        <div
                                          className={cn(
                                            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white",
                                            avatar.isActive ? "bg-emerald-500" : "bg-slate-400"
                                          )}
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-slate-900">{avatar.name}</p>
                                        <div className="flex items-center gap-1">
                                          <span className={cn(
                                            "text-xs",
                                            avatar.isActive ? "text-emerald-600" : "text-slate-500"
                                          )}>
                                            {avatar.isActive ? "Online" : "Offline"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Connected to all {otherAvatars.length} avatars
                                      </p>
                                      {/* Show connected avatar thumbnails */}
                                      <div className="flex -space-x-2">
                                        {otherAvatars.slice(0, 6).map((connected) => (
                                          connected.avatarImageUrl ? (
                                            <img
                                              key={connected.id}
                                              src={connected.avatarImageUrl}
                                              alt={connected.name}
                                              title={connected.name}
                                              className={cn(
                                                "w-7 h-7 rounded-full object-cover object-top border-2 border-white",
                                                connected.isActive ? "opacity-100" : "opacity-50 grayscale"
                                              )}
                                            />
                                          ) : (
                                            <div
                                              key={connected.id}
                                              title={connected.name}
                                              className={cn(
                                                "w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center",
                                                connected.isActive ? "opacity-100" : "opacity-50"
                                              )}
                                            >
                                              <Bot className="w-3 h-3 text-slate-500" />
                                            </div>
                                          )
                                        ))}
                                        {otherAvatars.length > 6 && (
                                          <div className="w-7 h-7 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-violet-600">
                                            +{otherAvatars.length - 6}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Avatar Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: RADIUS.card }}>
            <DialogHeader>
              <DialogTitle style={{ fontSize: TYPE.title }}>Edit Avatar</DialogTitle>
              <DialogDescription style={{ fontSize: TYPE.meta }}>
                Modify avatar settings and system prompt
              </DialogDescription>
            </DialogHeader>

            {editingAvatar && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editingAvatar.name} disabled className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={editingAvatar.slug} disabled className="bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speaking Style</Label>
                  <Textarea
                    value={editingAvatar.speakingStyle}
                    className="min-h-[80px] bg-slate-50"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    value={editingAvatar.systemPrompt}
                    className="min-h-[200px] font-mono text-sm bg-slate-50"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Debate Style</Label>
                    <Select value={editingAvatar.debateStyle} disabled>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analytical">Analytical</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Response Priority (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={editingAvatar.responsePriority}
                      disabled
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div>
                    <p className="font-medium text-slate-900">Active Status</p>
                    <p className="text-sm text-slate-500">
                      Enable or disable this avatar
                    </p>
                  </div>
                  <Switch
                    checked={editingAvatar.isActive}
                    onCheckedChange={() => {
                      toggleAvatarActive(editingAvatar.id);
                      setIsEditDialogOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AdminLoungeLayout>
  );
}
