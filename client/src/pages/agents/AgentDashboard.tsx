import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import React from "react";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";
import { useCelebration } from "@/lib/celebrationContext";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { DailyChallenge } from "@/components/agent/DailyChallenge";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { QuickActions } from "@/components/agent/QuickActions";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LogCallModal } from "@/components/agent/LogCallModal";
import { AddTaskModal } from "@/components/agent/AddTaskModal";
import { LeaderboardModal } from "@/components/agent/LeaderboardModal";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Generate upcoming events relative to today so they never go stale
function getUpcomingEvents() {
  const today = new Date();
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return [
    { date: fmt(addDays(today, 3)), title: "IUL Product Training Webinar", time: "2:00 PM CST" },
    { date: fmt(addDays(today, 6)), title: "Monthly Sales Meeting", time: "10:00 AM CST" },
    { date: fmt(addDays(today, 12)), title: "New Agent Orientation", time: "9:00 AM CST" }
  ];
}
const UPCOMING_EVENTS = getUpcomingEvents();

const STATIC_ANNOUNCEMENTS = [
  {
    date: "Jan 15, 2026",
    title: "New IUL Product Launch",
    description: "Introducing our enhanced IUL product with improved cap rates. Training webinar scheduled for next week.",
    priority: "high"
  },
  {
    date: "Jan 12, 2026",
    title: "Q4 Bonus Payouts",
    description: "Q4 2025 bonuses will be paid by January 20th. Check your earnings dashboard for details.",
    priority: "medium"
  }
];

const DemoModeIndicator = React.memo(() => (
  <div className="fixed bottom-24 lg:bottom-4 right-4 z-50">
    <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      Demo Mode
    </div>
  </div>
));

export default function AgentDashboard() {
  const {
    currentUser,
    performance,
    tasks,
    leads,
    announcements,
    activities,
    dailyChallenges,
    leaderboard,
    earnings,
    completeTask,
    addLead,
    addTask,
    logCall
  } = useAgentStore();

  const { showXP, showAchievement } = useCelebration();
  const [, navigate] = useLocation();

  const [showLogCall, setShowLogCall] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Handle task completion with XP celebration
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    completeTask(taskId);

    // Show XP popup
    const xp = task?.performanceImpact || 10;
    showXP(xp);

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
    const callsRemaining = performance.dailyCallsTarget - performance.dailyCalls;
    const closesRemaining = performance.dailyClosesTarget - performance.dailyCloses;
    const rank = performance.rank;

    // Only show critical/warning for truly urgent situations

    // Critical: Way behind on calls (less than 30% done late in day)
    if (callsRemaining > performance.dailyCallsTarget * 0.7) {
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
    if (performance.currentStreak >= 5) {
      return {
        main: `${performance.currentStreak}-DAY STREAK.`,
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

  const directive = getCommandDirective();

  const pipelineStats = useMemo(() => ({
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    proposal: leads.filter(l => l.status === 'proposal').length,
  }), [leads]);

  // Get hot leads (qualified or proposal stage)
  const hotLeads = useMemo(() => leads
    .filter(l => l.status === 'qualified' || l.status === 'proposal')
    .slice(0, 3), [leads]);

  // Get pending tasks for today
  const todaysTasks = useMemo(() => tasks
    .filter(t => t.dueDate === 'Today' && !t.completed)
    .slice(0, 5), [tasks]);

  // Calculate pending earnings
  const { pendingEarnings, paidEarnings } = useMemo(() => ({
    pendingEarnings: earnings
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
    paidEarnings: earnings
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0)
  }), [earnings]);

  const upcomingEvents = UPCOMING_EVENTS;
  const staticAnnouncements = STATIC_ANNOUNCEMENTS;

  return (
    <AgentLoungeLayout>
      <LoadingScreen />
      <DemoModeIndicator />

      {/* Modals */}
      <LogCallModal open={showLogCall} onOpenChange={setShowLogCall} leads={leads} onLogCall={logCall} />
      <AddLeadModal open={showAddLead} onOpenChange={setShowAddLead} onAddLead={addLead} />
      <AddTaskModal open={showAddTask} onOpenChange={setShowAddTask} onAddTask={addTask} />
      <LeaderboardModal
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        leaderboard={leaderboard}
        currentUserId={currentUser?.id || ''}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Command Center Banner */}
        <motion.div variants={fadeInUp}>
          <Card className={cn(
            "border-0 overflow-hidden shadow-xl",
            directive.urgency === 'critical'
              ? "bg-gradient-to-r from-red-600 via-rose-600 to-pink-600"
              : "bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"
          )}>
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <CardContent className="p-6 lg:p-8 relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left: Command Directive */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      directive.urgency === 'critical' ? "bg-white animate-pulse" : "bg-amber-300 animate-pulse"
                    )} />
                    <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                      {directive.urgency === 'critical' ? 'ACTION REQUIRED' : 'COMMAND CENTER'}
                    </span>
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full ml-2">
                      <Trophy className="w-4 h-4 text-amber-300" />
                      <span className="text-sm font-bold text-amber-300">#{performance.rank}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-2">
                    {directive.main}
                  </h1>
                  <p className="text-indigo-100 text-lg font-medium">
                    {directive.sub}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-5 max-w-md">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/80 font-medium">Today's Progress</span>
                      <span className="text-white font-bold">{performance.dailyCalls}/{performance.dailyCallsTarget} calls</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((performance.dailyCalls / performance.dailyCallsTarget) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowLogCall(true)}
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-white/90 font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    LOG CALL NOW
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddLead(true)}
                      variant="outline"
                      className="border-white/40 text-white hover:bg-white/20 flex-1 backdrop-blur-sm"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Lead
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/40 text-white hover:bg-white/20 flex-1 backdrop-blur-sm"
                      asChild
                    >
                      <Link href="/agents/quotes">
                        <FileText className="w-4 h-4 mr-1" />
                        Quote
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-bold text-orange-300">{performance.currentStreak}-day streak</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div variants={fadeInUp}>
          <QuickActions
            variant="horizontal"
            onAddLead={() => setShowAddLead(true)}
            onLogCall={() => setShowLogCall(true)}
            onSchedule={() => setShowAddTask(true)}
            onSendEmail={() => navigate('/agents/email')}
            onCreateQuote={() => navigate('/agents/quotes')}
            onOpenChat={() => navigate('/agents/chat')}
          />
        </motion.div>

        {/* Enhanced KPI Cards with Trends & Coaching */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calls Card */}
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  performance.dailyCalls >= 38 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {performance.dailyCalls >= 38 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {performance.dailyCalls >= 38 ? `+${performance.dailyCalls - 38}` : `${performance.dailyCalls - 38}`} vs avg
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{performance.dailyCalls}</p>
              <p className="text-xs text-gray-500 font-medium">Calls Today</p>
              {/* Mini Sparkline */}
              <div className="flex items-end gap-0.5 h-8 mt-2">
                {performance.weeklyHistory.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm transition-all",
                      i === performance.weeklyHistory.length - 1 ? "bg-blue-500" : "bg-blue-200"
                    )}
                    style={{ height: `${Math.max((day.calls / 30) * 100, 10)}%` }}
                  />
                ))}
              </div>
                          </CardContent>
          </Card>

          {/* Closes Card */}
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  performance.dailyCloses >= 1 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}>
                  {performance.dailyCloses >= 1 ? <TrendingUp className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {performance.dailyCloses >= 1 ? `+${performance.dailyCloses}` : "0"} this week
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{performance.dailyCloses}</p>
              <p className="text-xs text-gray-500 font-medium">Closes This Week</p>
              {/* Mini Sparkline */}
              <div className="flex items-end gap-0.5 h-8 mt-2">
                {performance.weeklyHistory.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm transition-all",
                      day.deals > 0 ? "bg-gradient-to-t from-emerald-500 to-teal-400" : "bg-emerald-100"
                    )}
                    style={{ height: `${Math.max(day.deals * 33, 10)}%` }}
                  />
                ))}
              </div>
                          </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  performance.conversionRate >= 12 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {performance.conversionRate >= 12 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {performance.conversionRate >= 12 ? `+${performance.conversionRate - 10}%` : `-${12 - performance.conversionRate}%`} vs baseline
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{performance.conversionRate}%</p>
              <p className="text-xs text-gray-500 font-medium">Conversion Rate</p>
              {/* Visual gauge */}
              <div className="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    performance.conversionRate >= 15 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                    performance.conversionRate >= 10 ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                  style={{ width: `${Math.min(performance.conversionRate * 5, 100)}%` }}
                />
              </div>
                          </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  <TrendingUp className="w-3 h-3" />
                  +${Math.round(pendingEarnings * 0.15).toLocaleString()} projected
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${pendingEarnings.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">Pending Earnings</p>
              {/* Earnings breakdown bar */}
              <div className="mt-2 flex gap-1.5 h-8">
                <div className="flex-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-emerald-700">${paidEarnings.toLocaleString()} paid</span>
                </div>
                <div className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-amber-700">${pendingEarnings.toLocaleString()} pending</span>
                </div>
              </div>
                          </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Challenges */}
            <motion.div variants={fadeInUp}>
              <DailyChallenge challenges={dailyChallenges} />
            </motion.div>

            {/* Pipeline Snapshot */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Pipeline Snapshot
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-100" asChild>
                      <Link href="/agents/pipeline">
                        View Pipeline <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Stage Counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "New", count: pipelineStats.new, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                      { label: "Contacted", count: pipelineStats.contacted, gradient: "from-amber-500 to-yellow-500", bg: "from-amber-50 to-yellow-50" },
                      { label: "Qualified", count: pipelineStats.qualified, gradient: "from-violet-500 to-purple-500", bg: "from-violet-50 to-purple-50" },
                      { label: "Proposal", count: pipelineStats.proposal, gradient: "from-emerald-500 to-teal-500", bg: "from-emerald-50 to-teal-50" }
                    ].map((stage) => (
                      <div key={stage.label} className={cn("text-center p-4 rounded-xl bg-gradient-to-br", stage.bg)}>
                        <div className={cn("w-3 h-3 rounded-full mx-auto mb-2 bg-gradient-to-r", stage.gradient)} />
                        <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                        <p className="text-xs text-gray-600 font-medium">{stage.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hot Leads */}
                  {hotLeads.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Hot Leads</p>
                      <div className="space-y-2">
                        {hotLeads.map((lead) => (
                          <Link key={lead.id} href={`/agents/leads?id=${lead.id}`}>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-transparent rounded-lg hover:from-orange-100 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                  {lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{lead.name}</p>
                                  <p className="text-[10px] text-gray-500">{lead.product} · {lead.state}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                lead.status === 'proposal' ? "border-green-500 text-green-600" : "border-purple-500 text-purple-600"
                              )}>
                                {lead.status}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Priority Tasks */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Priority Tasks</span>
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setShowAddTask(true)} className="border-violet-200 text-violet-600 hover:bg-violet-50">
                      + Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {todaysTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      </div>
                      <p className="font-bold text-green-600">All caught up!</p>
                      <p className="text-sm text-gray-500">No tasks due today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todaysTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-violet-50/30 rounded-xl hover:from-violet-50 hover:to-purple-50/50 transition-all border border-gray-100"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleCompleteTask(task.id)}
                            className="mt-0.5 border-violet-300 data-[state=checked]:bg-violet-500"
                          />
                          <div className="flex-1">
                            <p className={cn(
                              "font-medium text-sm",
                              task.completed && "line-through text-gray-400"
                            )}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.dueDate}
                              </span>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 border-0",
                                  task.priority === 'high' && "bg-red-100 text-red-600",
                                  task.priority === 'medium' && "bg-amber-100 text-amber-600",
                                  task.priority === 'low' && "bg-gray-100 text-gray-500"
                                )}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-[10px] bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent font-bold">
                            +{task.performanceImpact} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Team Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed activities={activities.slice(0, 5)} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Leaderboard Preview */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-white">Leaderboard</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowLeaderboard(true)} className="text-white hover:bg-white/20">
                      View All
                    </Button>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                          entry.id === currentUser?.id
                            ? "bg-gradient-to-r from-violet-100 to-purple-100 ring-2 ring-violet-400"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-md",
                          idx === 0 && "bg-gradient-to-br from-yellow-400 to-amber-500 text-white",
                          idx === 1 && "bg-gradient-to-br from-gray-300 to-gray-400 text-white",
                          idx === 2 && "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
                          idx > 2 && "bg-gray-100 text-gray-600"
                        )}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.name}
                            {entry.id === currentUser?.id && (
                              <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent text-[10px] ml-1 font-bold">(You)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            ${(entry.ap.weekly / 1000).toFixed(1)}K
                          </p>
                          <p className="text-[10px] text-gray-400">AP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Announcements</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-pink-600 hover:bg-pink-50">
                      <Link href="/agents/announcements">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staticAnnouncements.map((announcement, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "pb-4",
                          idx !== staticAnnouncements.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {announcement.priority === 'high' && (
                            <span className="w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm animate-pulse" />
                          )}
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">{announcement.date}</p>
                            <h4 className="font-semibold text-sm bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {announcement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Upcoming Events</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-cyan-600 hover:bg-cyan-50">
                      <Link href="/agents/calendar">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50/50 rounded-xl border border-cyan-100 hover:shadow-md transition-all"
                      >
                        <div className="text-center min-w-[50px] bg-white rounded-lg p-2 shadow-sm">
                          <p className="text-[10px] text-gray-500 uppercase font-medium">{event.date.split(' ')[0]}</p>
                          <p className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{event.date.split(' ')[1]}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Earnings Summary */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-lg p-3">
                      <span className="text-sm text-white/80">Pending</span>
                      <span className="font-bold text-xl text-white">
                        ${pendingEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-lg p-3">
                      <span className="text-sm text-white/80">Paid this month</span>
                      <span className="font-bold text-xl text-white">
                        ${paidEarnings.toLocaleString()}
                      </span>
                    </div>
                    <Button className="w-full mt-2 bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-lg" asChild>
                      <Link href="/agents/earnings">
                        View Statements <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Need Help */}
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Need Help?</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Our agent support team is here to help you succeed.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:6307780800"
                      className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-indigo-50 to-violet-50 p-2.5 rounded-lg hover:from-indigo-100 hover:to-violet-100 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-indigo-500" />
                      <span className="text-indigo-600">(630) 778-0800</span>
                    </a>
                    <a
                      href="mailto:agents@heritagels.org"
                      className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-indigo-50 to-violet-50 p-2.5 rounded-lg hover:from-indigo-100 hover:to-violet-100 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <span className="text-indigo-600">agents@heritagels.org</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
