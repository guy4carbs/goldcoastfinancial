import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
import {
  Rocket,
  Target,
  Calendar,
  CalendarDays,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
  BookOpen,
  Award,
  Flame,
  Sparkles,
  ArrowRight,
  Lock,
  Play,
  MapPin,
  ListChecks,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  CARD_STYLES,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

interface MilestonePhase {
  id: string;
  title: string;
  subtitle: string;
  dayRange: string;
  href: string;
  icon: typeof Rocket;
  status: "completed" | "current" | "locked";
  progress: number;
  tasks: number;
  completedTasks: number;
  taskPrefix: string; // prefix for task IDs in this phase
}

// Phase definitions with task ID prefixes for matching
const PHASE_DEFINITIONS: Omit<MilestonePhase, "status" | "progress" | "completedTasks">[] = [
  {
    id: "day-1",
    title: "Day 1",
    subtitle: "Launch & Learn the Platform",
    dayRange: "Day 1",
    href: "/agents/onboarding/day-1",
    icon: Rocket,
    tasks: 20, // Total Day 1 tasks
    taskPrefix: "day1-",
  },
  {
    id: "day-2",
    title: "Day 2",
    subtitle: "Master the Sales Script",
    dayRange: "Day 2",
    href: "/agents/onboarding/day-2",
    icon: Target,
    tasks: 15, // Total Day 2 tasks
    taskPrefix: "day2-",
  },
  {
    id: "days-3-7",
    title: "Days 3-7",
    subtitle: "Train with Live Roleplay",
    dayRange: "Days 3-7",
    href: "/agents/onboarding/days-3-7",
    icon: Calendar,
    tasks: 35, // Tasks across days 3-7
    taskPrefix: "day",
  },
  {
    id: "days-8-30",
    title: "Days 8-30",
    subtitle: "Write Your First AP",
    dayRange: "Days 8-30",
    href: "/agents/onboarding/days-8-30",
    icon: CalendarDays,
    tasks: 12, // Weekly activities
    taskPrefix: "week",
  },
];

export default function OnboardingDashboard() {
  // Get persistent progress data
  const { currentDay, completedTasks, totalXp, badges, progress } = useOnboardingProgress();
  const startDate = progress.startDate;

  // Calculate day streak
  const streakDays = useMemo(() => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return completedTasks.length > 0 ? Math.min(diffDays, currentDay) : 0;
  }, [startDate, completedTasks, currentDay]);

  // Calculate milestone phases with actual progress
  const milestonePhases = useMemo((): MilestonePhase[] => {
    // Define task ID patterns for each phase
    const phaseTaskPatterns: Record<string, string[]> = {
      "day-1": ["welcome-video", "complete-profile", "setup-2fa", "tour-portal", "meet-team",
                "setup-notifications", "sign-nda", "contracts-verification", "toolkit-setup",
                "contract-status", "crm-activation", "crm-tour", "crm-functions", "whole-life-basics",
                "term-life-basics", "iul-basics", "annuities-basics", "products-quiz",
                "script-philosophy", "script-structure"],
      "day-2": ["compliance-overview", "handbook-review", "script-intro-video", "script-intro-practice",
                "script-fact-video", "script-fact-practice", "script-app-video", "script-banking-video",
                "script-close-video", "roleplay-intro", "objection-handling", "day2-assessment"],
      "days-3-7": ["day3-", "day4-", "day5-", "day6-", "day7-"],
      "days-8-30": ["week2-", "week3-", "week4-"],
    };

    return PHASE_DEFINITIONS.map((phase, index) => {
      // Count completed tasks for this phase
      const patterns = phaseTaskPatterns[phase.id] || [];
      const phaseCompletedTasks = completedTasks.filter(taskId =>
        patterns.some(pattern => taskId.startsWith(pattern) || taskId === pattern)
      ).length;

      // Calculate progress
      const progress = phase.tasks > 0 ? Math.round((phaseCompletedTasks / phase.tasks) * 100) : 0;

      // Determine status
      let status: "completed" | "current" | "locked" = "locked";
      if (progress === 100) {
        status = "completed";
      } else if (index === 0 || PHASE_DEFINITIONS.slice(0, index).every((_, i) => {
        const prevPatterns = phaseTaskPatterns[PHASE_DEFINITIONS[i].id] || [];
        const prevCompleted = completedTasks.filter(taskId =>
          prevPatterns.some(pattern => taskId.startsWith(pattern) || taskId === pattern)
        ).length;
        return prevCompleted > 0; // Previous phase has at least started
      })) {
        status = "current";
      }

      return {
        ...phase,
        status,
        progress,
        completedTasks: phaseCompletedTasks,
      };
    });
  }, [completedTasks]);

  // Calculate overall progress
  const totalTasks = PHASE_DEFINITIONS.reduce((sum, p) => sum + p.tasks, 0);
  const totalCompletedTasks = milestonePhases.reduce((sum, p) => sum + p.completedTasks, 0);
  const onboardingProgress = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  // Count completed phases
  const completedPhases = milestonePhases.filter(p => p.status === "completed").length;

  // Dynamic achievements based on badges
  const recentAchievements = useMemo(() => {
    const achievements = [];
    if (badges.some(b => b.id === "first-task")) {
      achievements.push({ id: 1, title: "First Task", icon: Star, date: "Day 1" });
    }
    if (badges.some(b => b.id === "day-1-complete")) {
      achievements.push({ id: 2, title: "Day 1 Complete", icon: CheckCircle2, date: "Day 1" });
    }
    if (badges.some(b => b.id === "day-2-complete")) {
      achievements.push({ id: 3, title: "Day 2 Complete", icon: BookOpen, date: "Day 2" });
    }
    if (streakDays >= 5) {
      achievements.push({ id: 4, title: `${streakDays}-Day Streak`, icon: Flame, date: "Today" });
    }
    if (badges.some(b => b.id === "xp-500")) {
      achievements.push({ id: 5, title: "500 XP Earned", icon: Zap, date: "Recent" });
    }
    // Default achievements if none earned yet
    if (achievements.length === 0) {
      achievements.push({ id: 1, title: "Start Your Journey", icon: Rocket, date: "Today" });
    }
    return achievements.slice(0, 4); // Max 4 achievements shown
  }, [badges, streakDays]);

  // Dynamic upcoming tasks based on current phase
  const upcomingTasks = useMemo(() => {
    const tasks = [];
    const currentPhase = milestonePhases.find(p => p.status === "current");

    if (currentPhase?.id === "day-1" || !currentPhase) {
      tasks.push({ id: 1, title: "Watch Your Welcome Video", dueDay: 1, priority: "high" });
      tasks.push({ id: 2, title: "Set Up Your Agent Profile", dueDay: 1, priority: "high" });
      tasks.push({ id: 3, title: "Explore the Agent Portal", dueDay: 1, priority: "medium" });
    } else if (currentPhase?.id === "day-2") {
      tasks.push({ id: 1, title: "Review the Compliance Handbook", dueDay: 2, priority: "high" });
      tasks.push({ id: 2, title: "Learn the Script Opening", dueDay: 2, priority: "high" });
      tasks.push({ id: 3, title: "Practice the Fact Finder", dueDay: 2, priority: "medium" });
    } else if (currentPhase?.id === "days-3-7") {
      tasks.push({ id: 1, title: "Deepen Product Knowledge", dueDay: currentDay + 1, priority: "high" });
      tasks.push({ id: 2, title: "Shadow a Live Sales Call", dueDay: currentDay + 2, priority: "high" });
      tasks.push({ id: 3, title: "Run a Full Roleplay Call", dueDay: currentDay + 1, priority: "medium" });
    } else {
      tasks.push({ id: 1, title: "Complete This Week's Training", dueDay: currentDay + 1, priority: "medium" });
      tasks.push({ id: 2, title: "Debrief with Your Mentor", dueDay: currentDay + 7, priority: "high" });
    }
    return tasks;
  }, [milestonePhases, currentDay]);

  return (
    <OnboardingLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Section — shared AgentPageHero component */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Sparkles}
            title="Your Path to Production"
            subtitle="Everything you need to launch, learn, and start writing business"
          >
            <Link href="/agents/onboarding/day-1">
              <Button
                className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                style={{ borderRadius: 16 }}
              >
                Begin Your Launch
              </Button>
            </Link>
          </AgentPageHero>
        </motion.div>

        {/* Quick Stats — shared AgentStatCard components */}
        <motion.section variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={CheckCircle2} value={completedTasks.length} label="Tasks Done" />
            <AgentStatCard icon={BookOpen} value="3" label="Modules" />
            <AgentStatCard icon={Flame} value={streakDays} label="Streak" />
            <AgentStatCard icon={Award} value={badges.length} label="Badges" />
          </AgentStatCardGrid>
        </motion.section>

        {/* Journey Section */}
        <motion.section variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            {/* Journey Header */}
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white overflow-hidden">
              {/* Decorative Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Floating Circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-sm" />
              <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-purple-300/20 rounded-full translate-y-1/2 blur-md" />
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full" />

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                      className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: RADIUS.card,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <MapPin className="w-8 h-8 text-amber-200" />
                    </motion.div>
                    <div>
                      <Badge
                        className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium mb-2"
                        style={{ padding: '4px 12px' }}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        30-Day Program
                      </Badge>
                      <h2
                        className="font-bold tracking-tight text-white"
                        style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                      >
                        Your Roadmap
                      </h2>
                      <p className="text-white/80 mt-1" style={{ fontSize: TYPE.meta }}>
                        Each phase builds on the last — follow the path to your first sale
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                      <p className="text-2xl font-bold text-white">Day {currentDay}</p>
                      <p className="text-white/70 text-xs">Current</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                      <p className="text-2xl font-bold text-white">{onboardingProgress}%</p>
                      <p className="text-white/70 text-xs">Complete</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                      <p className="text-2xl font-bold text-white">{streakDays}</p>
                      <p className="text-white/70 text-xs">Day Streak</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-white/80">Overall Progress</span>
                    <span className="text-white font-medium">{onboardingProgress}% Complete</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${onboardingProgress}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full relative overflow-hidden bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Phases Content */}
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-violet-600" />
                  <h3 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900">Training Phases</h3>
                </div>
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                  {milestonePhases.filter(p => p.status === 'completed').length} of {milestonePhases.length} Complete
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {milestonePhases.map((phase, index) => (
                  <Link key={phase.id} href={phase.status !== "locked" ? phase.href : "#"}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "relative p-4 border transition-all group",
                        phase.status === "current"
                          ? "bg-violet-50 border-violet-200 shadow-md"
                          : phase.status === "completed"
                            ? "bg-violet-50/50 border-violet-200"
                            : "bg-gray-50 border-gray-200 opacity-60",
                        phase.status !== "locked" && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                      )}
                      style={{ borderRadius: RADIUS.card }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex items-center justify-center flex-shrink-0",
                            phase.status === "current"
                              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-amber-200 shadow-lg shadow-violet-500/30"
                              : phase.status === "completed"
                                ? "bg-gradient-to-br from-violet-500 to-amber-500 text-amber-200"
                                : "bg-gray-200 text-gray-400"
                          )}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: RADIUS.button,
                          }}
                        >
                          {phase.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : phase.status === "locked" ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <phase.icon className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4
                              className={cn(
                                "font-semibold text-sm truncate",
                                phase.status === "locked" ? "text-gray-400" : "text-gray-900"
                              )}
                            >
                              {phase.title}
                            </h4>
                            {phase.status === "current" && (
                              <Badge className="bg-violet-600 text-white text-xs px-1.5 py-0 h-5">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs mb-2",
                            phase.status === "locked" ? "text-gray-400" : "text-gray-500"
                          )}>
                            {phase.dayRange} • {phase.subtitle}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-xs font-medium",
                              phase.status === "completed" ? "text-violet-600"
                                : phase.status === "current" ? "text-violet-600"
                                : "text-gray-400"
                            )}>
                              {phase.completedTasks}/{phase.tasks} tasks
                            </span>
                            <span className={cn(
                              "text-xs font-bold",
                              phase.status === "completed" ? "text-violet-600"
                                : phase.status === "current" ? "text-violet-600"
                                : "text-gray-400"
                            )}>
                              {phase.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        {phase.status !== "locked" && (
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Quick Actions Row */}
        <motion.section variants={fadeInUp}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Continue Where You Left Off */}
            <div className="flex flex-col gap-4">
              <Card
                className="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 border-0 text-white overflow-hidden relative"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="relative p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Play style={{ width: 14, height: 14 }} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/70">Continue Learning</p>
                      <h3 className="text-sm font-semibold text-white truncate">Product Knowledge Module</h3>
                    </div>
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className="text-lg font-bold text-white">40%</p>
                      <p className="text-xs text-white/70">18 min</p>
                    </div>
                    <Link href="/agents/onboarding/days-3-7">
                      <Button
                        size="sm"
                        className="bg-white text-violet-700 hover:bg-violet-50 font-semibold"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        Continue
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Badges */}
              <Card
                className="border-0 overflow-hidden bg-white"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.body, gap: GRID.spacing.xs }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-sm">
                      <Trophy style={{ width: 14, height: 14 }} className="text-amber-200" />
                    </div>
                    Recent Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2" style={{ gap: GRID.spacing.xs }}>
                    {recentAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center bg-gray-50 border border-gray-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-violet-200 transition-all"
                        style={{
                          gap: GRID.spacing.xs,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <achievement.icon style={{ width: 12, height: 12 }} className="text-white" />
                        </div>
                        <span style={{ fontSize: TYPE.caption }} className="font-medium text-gray-700 truncate">{achievement.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Tasks */}
            <Card
              className="border-0 overflow-hidden bg-white h-full"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.body, gap: GRID.spacing.xs }}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Clock style={{ width: 14, height: 14 }} className="text-amber-200" />
                  </div>
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start bg-gray-50 hover:bg-violet-50 transition-colors cursor-pointer border border-transparent hover:border-violet-200"
                    style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  >
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm",
                      task.priority === "high" ? "bg-gradient-to-br from-red-400 to-red-500" : "bg-gradient-to-br from-violet-400 to-purple-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: TYPE.meta }} className="font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p style={{ fontSize: TYPE.caption }} className="text-gray-500">
                        Due Day {task.dueDay}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </motion.div>
    </OnboardingLoungeLayout>
  );
}
