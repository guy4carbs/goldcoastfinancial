import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import React from "react";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";
import { useCelebration } from "@/lib/celebrationContext";
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS, GLASS, PHI,
  fadeInUp, staggerContainer, staggerFast,
  golden, goldenInverse
} from '@/lib/heritageDesignSystem';
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { DailyChallenge } from "@/components/agent/DailyChallenge";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { DeltaBadge } from "@/pages/manager/primitives/DeltaBadge";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LogCallModal } from "@/components/agent/LogCallModal";
import { AddTaskModal } from "@/components/agent/AddTaskModal";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardModal } from "@/components/agent/LeaderboardModal";
import { StateMapWidget } from "@/components/agent/StateMapWidget";
import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  UserPlus,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Flame,
  Trophy,
  Calendar,
  Bell,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  Zap,
  Users,
  Brain,
  Lightbulb,
  AlertCircle,
  Mail,
  User,
  Sparkles,
  Shield,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { cn, formatProductLabel } from "@/lib/utils";

// Static announcements and events removed — now wired to real API data

// Format a date string into a human-readable relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}


// Error boundary to prevent dashboard crashes from taking down the app
class DashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("[AgentDashboard] Caught error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Loading Error</h2>
          <p className="text-gray-500 mb-4">Something went wrong. Please refresh the page.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AgentDashboardInner() {
  const {
    currentUser,
    performance,
    tasks,
    leads,
    dailyChallenges,
    leaderboard,
    completeTask,
    addLead,
    addTask,
    logCall
  } = useAgentStore();

  const { showXP, showAchievement } = useCelebration();
  const [, navigate] = useLocation();

  // Override Zustand leaderboard with real deals API data
  const { data: apiLeaderboardData } = useQuery<{ success: boolean; data: Array<{
    rank: number; agentUserId: string; firstName: string; lastName: string; name: string; totalAP: number; dealCount: number;
  }> }>({
    queryKey: ['/api/deals/leaderboard?period=month'],
    staleTime: 60000,
  });

  // Agent's personal deal stats
  const { data: myDealStats } = useQuery<{ success: boolean; data: { totalAP: number; totalDeals: number; rank: number } }>({
    queryKey: ['/api/deals/my-stats?period=month'],
    staleTime: 60000,
  });
  const personalAP = myDealStats?.data?.totalAP || 0;

  // Pipeline stats from real API
  const { data: apiPipelineStats } = useQuery<any>({
    queryKey: ['/api/commissions/pipeline-stats?period=month'],
    staleTime: 60000,
  });

  // Call stats from real API
  const { data: apiCallStats } = useQuery<{ today: number; week: number; month: number; avgDuration: number }>({
    queryKey: ['/api/calls/stats'],
    staleTime: 60000,
  });

  // Earnings from real API
  const { data: apiEarnings } = useQuery<any>({
    queryKey: ['/api/commissions/my-earnings'],
    staleTime: 60000,
  });

  // Streak from achievements API
  const { data: streakData } = useQuery<any>({
    queryKey: ['/api/achievements'],
    staleTime: 60000,
  });
  const currentStreak = (streakData as any)?.stats?.currentStreak || 0;

  // Calendar events for upcoming events widget
  const { data: calendarEvents } = useQuery<any>({
    queryKey: ['/api/calendar/events'],
    staleTime: 60000,
  });

  // Loading states for main data
  const isDashboardLoading = !apiLeaderboardData && !myDealStats && !apiEarnings;

  const realLeaderboard = apiLeaderboardData?.data?.length ? apiLeaderboardData.data.map((e) => ({
    id: e.agentUserId,
    name: e.name || `${e.firstName} ${e.lastName}`.trim(),
    avatar: undefined,
    xp: e.totalAP,
    level: e.totalAP >= 50000 ? 5 : e.totalAP >= 30000 ? 4 : e.totalAP >= 15000 ? 3 : e.totalAP >= 5000 ? 2 : 1,
    closedDeals: e.dealCount,
    streak: 0,
    rank: e.rank,
    trend: 'same' as const,
    ap: { daily: e.totalAP, weekly: e.totalAP, monthly: e.totalAP, yearly: e.totalAP },
  })) : leaderboard;

  const [showLogCall, setShowLogCall] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Handle task completion
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    completeTask(taskId);

    // Check for achievements (first task of the day, etc)
    const completedToday = tasks.filter(t => t.completed).length;
    if (completedToday === 0) {
      setTimeout(() => {
        showAchievement({
          title: 'Early Bird',
          description: 'Complete your first task of the day',
          rarity: 'common',
          xpReward: 50,
        });
      }, 1500);
    }
  };

  // Get aggressive command center directive
  const getCommandDirective = () => {
    const dailyCalls = apiCallStats?.today ?? performance.dailyCalls;
    const callsRemaining = performance.dailyCallsTarget - dailyCalls;
    const closesRemaining = performance.dailyClosesTarget - (myDealStats?.data?.totalDeals ?? performance.dailyCloses);
    const rank = myDealStats?.data?.rank ?? performance.rank;

    // Only show critical/warning for truly urgent situations

    // Critical: Way behind on calls (less than 30% done late in day) — only if they've started
    if (performance.dailyCalls > 0 && callsRemaining > performance.dailyCallsTarget * 0.7) {
      return {
        main: `${callsRemaining} CALLS LEFT.`,
        sub: "You're behind pace. Pick up the phone.",
        urgency: 'critical'
      };
    }

    // Close opportunity - exciting, use brand color
    if (closesRemaining === 1) {
      return {
        main: "ONE MORE CLOSE.",
        sub: `That's $${Math.round(pendingEarnings / 3)} in commission. Finish strong.`,
        urgency: 'standard'
      };
    }

    // Good momentum - streak protection
    if (currentStreak >= 5) {
      return {
        main: `${currentStreak}-DAY STREAK.`,
        sub: `${callsRemaining} calls to keep it alive. Don't break it.`,
        urgency: 'standard'
      };
    }

    // Ranking push - but keep brand colors
    if (rank <= 3 && rank > 1) {
      return {
        main: `#${rank} ON LEADERBOARD.`,
        sub: `${5 - rank + 2} more calls to overtake #${rank - 1}. Push harder.`,
        urgency: 'standard'
      };
    }

    // Default: Clear mission
    return {
      main: `${callsRemaining} CALLS. ${closesRemaining} CLOSES.`,
      sub: "That's today's mission. Execute.",
      urgency: 'standard'
    };
  };

  // Earnings from API (must be before getCommandDirective which references pendingEarnings)
  const pendingEarnings = apiEarnings?.monthlyAp ?? 0;
  const paidEarnings = apiEarnings?.ytdEarnings ?? 0;

  const directive = getCommandDirective();

  // Pipeline stats from API
  const pipelineStats = useMemo(() => {
    const stageMap: Record<string, number> = {};
    if (apiPipelineStats?.stages) {
      for (const s of apiPipelineStats.stages) {
        stageMap[s.stage] = s.count;
      }
    }
    return {
      new: stageMap['new'] || 0,
      contacted: stageMap['contacted'] || 0,
      qualified: stageMap['qualified'] || (stageMap['appointment_set'] || 0),
      proposal: stageMap['quoted'] || 0,
    };
  }, [apiPipelineStats]);

  // Hot leads from store (populated by useLeadInbox API hook on other pages)
  const hotLeads = useMemo(() => leads
    .filter(l => l.status === 'qualified' || l.status === 'proposal')
    .slice(0, 3), [leads]);

  // Get pending tasks for today
  const todaysTasks = useMemo(() => tasks
    .filter(t => t.dueDate === 'Today' && !t.completed)
    .slice(0, 5), [tasks]);

  // Earnings from API
  // Fetch real team activity from API
  const { data: activityData } = useQuery<any>({
    queryKey: ['/api/team-activity?limit=20'],
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // WebSocket subscription for real-time team activity updates
  const { addMessageHandler, subscribe } = useWebSocket();
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  // Subscribe to team channel
  useEffect(() => {
    subscribe('team');
  }, [subscribe]);

  // Listen for new activities via WebSocket
  useEffect(() => {
    const cleanup = addMessageHandler((data: any, channel: string | undefined) => {
      if (data?.type === 'team_activity' && data.activity) {
        setLiveActivities(prev => [data.activity, ...prev].slice(0, 10));
      }
    });
    return cleanup;
  }, [addMessageHandler]);

  // Combine live WebSocket activities with API-fetched activities
  const teamActivities = useMemo(() => {
    const apiActivities = (activityData?.activities || []).map((a: any) => ({
      id: a.id,
      type: a.activity_type || 'deal',
      agentName: a.agent_name || 'Agent',
      message: a.message || '',
      timestamp: formatRelativeTime(a.created_at),
      highlight: false,
      xp: a.metadata?.xp,
    }));

    const wsActivities = liveActivities.map((a: any) => ({
      id: a.id || `ws-${Date.now()}-${Math.random()}`,
      type: a.activity_type || 'deal',
      agentName: a.agent_name || 'Agent',
      message: a.message || '',
      timestamp: 'Just now',
      highlight: true,
      xp: a.metadata?.xp,
    }));

    // Dedupe by ID, live activities take priority
    const seen = new Set<string>();
    const merged = [...wsActivities, ...apiActivities].filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    return merged.slice(0, 10);
  }, [activityData, liveActivities]);

  // Upcoming events from calendar API
  const upcomingEvents = useMemo(() => {
    if (!calendarEvents?.events) return [];
    const now = new Date();
    return (calendarEvents.events as any[])
      .filter((e: any) => new Date(e.date || e.start) >= now)
      .slice(0, 3)
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date || (e.start ? new Date(e.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''),
        time: e.time || (e.start ? new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''),
        type: e.type || 'event',
      }));
  }, [calendarEvents]);

  return (
    <AgentLoungeLayout>
      <LoadingScreen />

      {/* Subtle loading indicator while API data loads */}
      {isDashboardLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-violet-100"
        >
          <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
          <span className="text-xs font-medium text-gray-600">Loading data...</span>
        </motion.div>
      )}

      {/* Modals */}
      <LogCallModal open={showLogCall} onOpenChange={setShowLogCall} leads={leads} onLogCall={logCall} />
      <AddLeadModal open={showAddLead} onOpenChange={setShowAddLead} onAddLead={addLead} />
      <AddTaskModal open={showAddTask} onOpenChange={setShowAddTask} onAddTask={addTask} />
      <LeaderboardModal
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        leaderboard={realLeaderboard}
        currentUserId={currentUser?.id || ''}
      />

      {/* Background gradient flow: violet (left/work) → amber (right/rewards)
          Sizes follow Fibonacci sequence: 377, 233, 144 (scaled to viewport) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 -left-32 w-[377px] h-[377px] bg-violet-300/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[233px] h-[233px] bg-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[144px] h-[144px] bg-amber-200/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.md,  // 24px - 3U on 8-point grid
          paddingBottom: 80      // 10U - matches GRID.spacing.xxxxl
        }}
      >
        {/* Command Center Banner - Premium Hero */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              background: directive.urgency === 'critical'
                ? COLORS.gradients.critical
                : COLORS.gradients.heroWithAccent,
            }}
          >
            {/* Decorative floating circles - Fibonacci sizes: 89, 55, 34 (×4 for visibility) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.1, ease: MOTION.easing }}
              style={{ width: 89 * 4, height: 89 * 4 }}
              className="absolute top-0 right-0 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.2, ease: MOTION.easing }}
              style={{ width: 55 * 4, height: 55 * 4 }}
              className="absolute bottom-0 left-0 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.3, ease: MOTION.easing }}
              style={{ width: 34 * 4, height: 34 * 4 }}
              className="absolute top-1/2 right-1/4 bg-purple-300/15 rounded-full blur-sm"
            />

            <CardContent className="relative z-10" style={{ padding: GRID.spacing.lg }}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left: Profile Icon + Greeting */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Profile Icon Badge - Glass effect matching AgentPageHero */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.2
                    }}
                    className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                    style={{
                      width: GRID.spacing.xxxxl,
                      height: GRID.spacing.xxxxl,
                      borderRadius: RADIUS.card,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <User
                      className="text-amber-200"
                      style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                    />
                  </motion.div>

                  {/* Greeting Content */}
                  <div className="flex-1 min-w-0">
                    <h1
                      className="font-bold tracking-tight text-white"
                      style={{
                        fontSize: '2.5rem',
                        lineHeight: 1.2
                      }}
                    >
                      {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Agent'}
                    </h1>
                    <p className="text-white/80 text-base mt-1">
                      Your command center for success
                    </p>
                  </div>
                </div>

                {/* Right: AP Stat + Action Buttons */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  {/* Monthly AP - Liquid Glass */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: RADIUS.button,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <DollarSign className="w-5 h-5 text-amber-200" />
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Monthly AP</p>
                      <p className="text-lg font-bold text-white">
                        ${personalAP.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddLead(true)}
                      size="lg"
                      className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-white/30"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Lead
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-white/30"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                      asChild
                    >
                      <Link href="/agents/quotes">
                        <FileText className="w-4 h-4 mr-2" />
                        Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions — Command Center */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...GLASS.css.light,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.sm }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Sparkles className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>Your Command Center</h3>
              </div>
              <div className="grid grid-cols-4" style={{ gap: GRID.spacing.sm }}>
                {[
                  { icon: Phone, label: 'Dialer', description: 'Call leads & prospects', href: '/agents/dialer' },
                  { icon: BarChart3, label: 'Performance', description: 'Track your metrics & goals', href: '/agents/performance' },
                  { icon: GraduationCap, label: 'Schedule 1:1', description: 'Book training with upline', href: '/agents/training-sessions' },
                  { icon: FileText, label: 'Create Quote', description: 'Generate insurance quotes', href: '/agents/quotes' },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      className="bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors cursor-pointer"
                      style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.input }}
                    >
                      <action.icon className="text-violet-600" size={LAYOUT.icon.lg} style={{ marginBottom: GRID.spacing.xs }} />
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{action.label}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Progress Section */}
        <motion.div variants={fadeInUp}>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4"
            style={{ gap: GRID.spacing.sm }}
          >
          {([
            { icon: Phone, value: `${myDealStats?.data?.totalDeals || 0}`, label: "Deals This Month", periodLabel: "submitted" },
            { icon: Target, value: `$${(myDealStats?.data?.totalAP || 0).toLocaleString()}`, label: "Monthly AP", periodLabel: "annual premium" },
            { icon: BarChart3, value: `${myDealStats?.data?.rank || 0}`, label: "Leaderboard Rank", periodLabel: "this month" },
            { icon: Flame, value: `${currentStreak}`, label: "Day Streak", periodLabel: "consecutive days" },
          ] as Array<{ icon: typeof Phone; value: string; label: string; delta?: number; deltaFormat?: 'percent' | 'number'; periodLabel?: string }>).map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="border-0 overflow-hidden relative"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3" style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} />
                <div className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/4" style={{ width: 50, height: 50, borderRadius: RADIUS.pill }} />

                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                  {/* Row 1: Icon + Value */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: LAYOUT.icon.xxl,
                        height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.input,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <stat.icon className="text-amber-200 drop-shadow-sm" size={LAYOUT.icon.md} aria-hidden="true" />
                    </div>
                    <p className="font-bold text-white" style={{ fontSize: TYPE.section, lineHeight: 1.1 }}>
                      {stat.value}
                    </p>
                  </div>

                  {/* Row 2: Label */}
                  <p className="text-white/70 mt-1.5" style={{ fontSize: TYPE.caption, fontWeight: 500 }}>
                    {stat.label}
                  </p>

                  {/* Row 3: Delta + Period */}
                  {(stat.delta != null || stat.periodLabel) && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {stat.delta != null && <DeltaBadge value={stat.delta} format={stat.deltaFormat} size="sm" />}
                      {stat.periodLabel && (
                        <span className="text-white/40" style={{ fontSize: TYPE.micro }}>
                          {stat.periodLabel}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </motion.div>
        </motion.div>

        {/* Main Content Grid - Golden Ratio: φ:1 ≈ 1.618:1
            Desktop: 61.8% / 38.2% (golden ratio)
            Tablet: 50% / 50%
            Mobile: stacked */}
        <div
          className="grid dashboard-golden-grid"
          style={{ gap: GRID.spacing.md }}
        >
          <style>{`
            @media (min-width: 768px) {
              .dashboard-golden-grid { grid-template-columns: 1fr 1fr !important; }
            }
            @media (min-width: 1024px) {
              .dashboard-golden-grid { grid-template-columns: 1.618fr 1fr !important; }
            }
          `}</style>
          {/* Left Column - φ proportion (≈61.8% on desktop) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* State Coverage Map */}
            <StateMapWidget agentId={currentUser?.id} />

            {/* Daily Challenges */}
            <motion.div variants={fadeInUp}>
              <DailyChallenge challenges={dailyChallenges} />
            </motion.div>

            {/* Pipeline Snapshot - Regular Card */}
            <motion.div variants={fadeInUp}>
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Users className="w-5 h-5 text-amber-200" />
                      </div>
                      Pipeline Snapshot
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                      <Link href="/agents/inbox">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Stage Counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "New", count: pipelineStats.new, filter: 'new' },
                      { label: "Contacted", count: pipelineStats.contacted, filter: 'contacted' },
                      { label: "Qualified", count: pipelineStats.qualified, filter: 'qualified' },
                      { label: "Proposal", count: pipelineStats.proposal, filter: 'proposal' }
                    ].map((stage) => (
                      <motion.div
                        key={stage.label}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        onClick={() => navigate(`/agents/inbox?status=${stage.filter}`)}
                        className="text-center p-4 rounded-xl bg-violet-50 border border-violet-100 cursor-pointer hover:bg-violet-100 transition-colors"
                      >
                        <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                        <p className="text-xs text-gray-500 font-medium">{stage.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Hot Leads */}
                  {hotLeads.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hot Leads</p>
                      </div>
                      <div className="space-y-2">
                        {hotLeads.map((lead) => (
                          <Link key={lead.id} href={`/agents/inbox?id=${lead.id}`}>
                            <motion.div
                              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                              className="group flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-violet-50 hover:border-violet-200 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                                  {lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{lead.name}</p>
                                  <p className="text-[10px] text-gray-500">{formatProductLabel(lead.product)} · {lead.state}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge className={cn(
                                  "text-[10px] border-0",
                                  lead.status === 'proposal'
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                )}>
                                  {lead.status}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Priority Tasks - Gradient Card */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
                {/* Full gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                {/* Decorative elements */}
                <div style={{ width: 120, height: 120 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                <div style={{ width: 80, height: 80 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
                <div style={{ width: 50, height: 50 }} className="absolute top-1/2 right-1/4 bg-purple-300/10 rounded-full blur-lg" />

                <CardHeader className="pb-3 relative z-10" style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-amber-200" />
                      </div>
                      Priority Tasks
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddTask(true)} className="text-white/90 hover:text-white hover:bg-white/10">
                      + Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {todaysTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                      </div>
                      <p className="font-bold text-emerald-300">All caught up!</p>
                      <p className="text-sm text-white/60">No tasks due today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todaysTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                          className="flex items-start gap-3 p-3 bg-white/15 backdrop-blur rounded-xl hover:bg-white/25 transition-colors border border-white/10 cursor-pointer group"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleCompleteTask(task.id)}
                            className="mt-0.5 border-white/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <div className="flex-1">
                            <p className={cn(
                              "font-semibold text-sm text-white group-hover:text-white transition-colors",
                              task.completed && "line-through opacity-50"
                            )}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-white/60 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> {task.dueDate}
                              </span>
                              <Badge
                                className={cn(
                                  "text-[10px] px-2 py-0.5 border-0 shadow-sm",
                                  task.priority === 'high' && "bg-red-500/80 text-white",
                                  task.priority === 'medium' && "bg-amber-400/80 text-amber-900",
                                  task.priority === 'low' && "bg-white/20 text-white/70"
                                )}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-lg">
                            <Zap className="w-3 h-3 text-amber-200" />
                            <span className="text-[10px] text-white font-bold">
                              +{task.performanceImpact}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Right Column - 1 proportion (≈38.2% on desktop) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Leaderboard Preview - Full Gradient Card */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
                {/* Full gradient background - violet to amber theme */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                {/* Decorative elements - Fibonacci sizes: 89, 55, 34 */}
                <div style={{ width: 89, height: 89 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div style={{ width: 55, height: 55 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                <div style={{ width: 34, height: 34 }} className="absolute top-1/2 right-0 bg-purple-300/10 rounded-full blur-lg" />

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-200" />
                      </div>
                      Leaderboard
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLeaderboard(true)}
                      className="text-white/90 hover:text-white hover:bg-white/10"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    {realLeaderboard.slice(0, 5).map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer backdrop-blur",
                          entry.id === currentUser?.id
                            ? "bg-white/30 ring-2 ring-white/50"
                            : "bg-white/15 hover:bg-white/25"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg",
                          idx === 0 && "bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900",
                          idx === 1 && "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700",
                          idx === 2 && "bg-gradient-to-br from-amber-600 to-orange-700 text-white",
                          idx > 2 && "bg-white/30 text-white"
                        )}>
                          {idx === 0 ? <Trophy className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm truncate text-white block">
                            {entry.name}
                            {entry.id === currentUser?.id && (
                              <Badge className="ml-2 text-[9px] px-1.5 py-0 bg-white/30 text-white border-0">
                                You
                              </Badge>
                            )}
                          </span>
                          <p className="text-[10px] text-white/70 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-300" /> Level {entry.level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-yellow-200">
                            ${(entry.ap.weekly / 1000).toFixed(1)}K
                          </p>
                          <p className="text-[10px] text-white/60 font-medium">AP</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* What's New - Consolidated Announcements & Events */}
            <motion.div variants={fadeInUp}>
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Bell className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">What's New</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }} className="space-y-4">
                  {/* Upcoming Events from Calendar */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming</p>
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-4">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No upcoming events</p>
                        <p className="text-xs text-gray-400 mt-1">Connect your calendar or add events to see them here</p>
                      </div>
                    ) : (
                      upcomingEvents.slice(0, 3).map((event: any, idx: number) => (
                        <div
                          key={event.id || `evt-${idx}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors cursor-pointer group"
                        >
                          <div className="text-center min-w-[44px] bg-white rounded-lg p-1.5 border border-violet-100 group-hover:border-violet-200 transition-colors">
                            <p className="text-[8px] text-violet-400 uppercase font-semibold">{String(event.date).split(' ')[0]}</p>
                            <p className="font-bold text-lg text-violet-600">{String(event.date).split(' ')[1] || ''}</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 group-hover:text-violet-900 transition-colors">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.time}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
                        </div>
                      ))
                    )}
                  </div>

                  <Button variant="ghost" size="sm" asChild className="w-full text-violet-600 hover:bg-violet-50">
                    <Link href="/agents/calendar">
                      View All Events <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Earnings Summary */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                {/* Fibonacci: 89, 55 */}
                <div style={{ width: 89, height: 89 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div style={{ width: 55, height: 55 }} className="absolute bottom-0 left-0 bg-amber-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-200" />
                    </div>
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                      <span className="text-sm text-white/80">Pending</span>
                      <span className="font-bold text-xl text-amber-200">
                        ${pendingEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                      <span className="text-sm text-white/80">Paid this month</span>
                      <span className="font-bold text-xl text-white">
                        ${paidEarnings.toLocaleString()}
                      </span>
                    </div>
                    <Button className="w-full mt-2 bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-lg" asChild>
                      <Link href="/agents/commissions">
                        View Statements <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Activity */}
            <motion.div variants={fadeInUp}>
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Zap className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Team Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <ActivityFeed activities={teamActivities} showLiveIndicator={liveActivities.length > 0} maxItems={10} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Need Help - Simple Footer */}
            <motion.div variants={fadeInUp} className="text-center py-4 border-t border-gray-100 mt-2">
              <p className="text-sm text-gray-500 mb-2">Need help?</p>
              <div className="flex items-center justify-center gap-4">
                <a href="tel:6307780800" className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1.5 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  (630) 778-0800
                </a>
                <span className="text-gray-200">|</span>
                <a href="mailto:agents@heritagels.org" className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1.5 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  Email Support
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AgentLoungeLayout>
  );
}

export default function AgentDashboard() {
  return (
    <DashboardErrorBoundary>
      <AgentDashboardInner />
    </DashboardErrorBoundary>
  );
}
