import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  Clock,
  Zap,
  GraduationCap,
  Target,
  Users,
  Phone,
  TrendingUp,
  Award,
  Briefcase,
  ListChecks,
  Play,
  Trophy,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { TaskContentModal } from "@/components/onboarding/TaskContentModal";
import { getTaskContent } from "@/data/onboardingTaskContent";
import { useActivityProgress } from "@/hooks/useOnboardingProgress";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "@/lib/heritageDesignSystem";

// Section header component for visual consistency
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between" style={{ marginBottom: GRID.spacing.sm }}>
      <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
        <div
          className="bg-gradient-to-br from-violet-500 to-purple-600 text-amber-200 flex items-center justify-center flex-shrink-0"
          style={{
            width: GRID.spacing.xl,
            height: GRID.spacing.xl,
            borderRadius: RADIUS.button,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Icon style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
            {title}
          </h2>
          <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
            {subtitle}
          </p>
        </div>
      </div>
      {badge}
    </div>
  );
}

// Gradient progress bar
function GradientProgress({ value }: { value: number }) {
  return (
    <div
      className="w-full bg-gray-100 overflow-hidden relative"
      style={{ height: 10, borderRadius: RADIUS.pill }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite',
        }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.easing }}
        className="h-full relative"
        style={{
          background: `linear-gradient(90deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[500]} 50%, ${COLORS.accent.amber[500]} 100%)`,
          borderRadius: RADIUS.pill,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
            borderRadius: RADIUS.pill,
          }}
        />
      </motion.div>
    </div>
  );
}

interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  tasks: number;
  completedTasks: number;
  xpReward: number;
}

const milestones: Milestone[] = [
  {
    id: "week-2",
    week: 2,
    title: "Build Your Pipeline",
    description: "Set your 30-day plan, qualify 20+ leads, and master your CRM workflow",
    tasks: 12,
    completedTasks: 4,
    xpReward: 500,
  },
  {
    id: "week-3",
    week: 3,
    title: "Close & Convert",
    description: "Perfect your presentation, close 3+ deals, and launch your referral engine",
    tasks: 15,
    completedTasks: 0,
    xpReward: 600,
  },
  {
    id: "week-4",
    week: 4,
    title: "Own Your Book",
    description: "Shadow a top producer, run solo client meetings, and earn Month 1 certification",
    tasks: 10,
    completedTasks: 0,
    xpReward: 750,
  },
];

const weekContent = {
  2: {
    focus: "Build Your Pipeline",
    objectives: [
      "Set your 30-day production plan with upline",
      "Qualify 20+ leads using the 5-minute framework",
      "Log every contact and next step in your CRM",
      "Track calls, appointments, and AP daily",
    ],
    keyActivities: [
      { title: "Build 30-Day Production Plan", type: "planning", duration: "60 min", xp: 200, completed: false },
      { title: "Lead Qualification Framework", type: "module", duration: "45 min", xp: 150, completed: false },
      { title: "Phone Script Drill", type: "video", duration: "30 min", xp: 100, completed: false },
      { title: "CRM Pipeline Setup", type: "module", duration: "60 min", xp: 200, completed: false },
      { title: "Make 10 AI Practice Calls", type: "practice", duration: "45 min", xp: 175, completed: false },
      { title: "Launch Daily Metrics Tracker", type: "action", duration: "20 min", xp: 100, completed: false },
      { title: "Week 2 Pipeline Assessment", type: "quiz", duration: "30 min", xp: 200, completed: false },
    ],
  },
  3: {
    focus: "Close & Convert",
    objectives: [
      "Deliver 5+ full presentations this week",
      "Close at least 3 applications with premium",
      "Handle every objection without breaking stride",
      "Review AP and close ratio with upline",
    ],
    keyActivities: [
      { title: "Review Weekly Metrics with Upline", type: "review", duration: "30 min", xp: 150, completed: false },
      { title: "Sharpen Your Presentation", type: "module", duration: "60 min", xp: 200, completed: false },
      { title: "Advanced Closing Techniques", type: "video", duration: "45 min", xp: 175, completed: false },
      { title: "Tough Objection Scenarios", type: "module", duration: "50 min", xp: 200, completed: false },
      { title: "Launch Your Referral Engine", type: "module", duration: "35 min", xp: 125, completed: false },
      { title: "Live Role Play: Close 3 Deals", type: "practice", duration: "60 min", xp: 250, completed: false },
      { title: "Week 3 Sales Assessment", type: "quiz", duration: "40 min", xp: 250, completed: false },
    ],
  },
  4: {
    focus: "Own Your Book",
    objectives: [
      "Shadow a top producer on 2 live client calls",
      "Run 3+ solo client meetings this week",
      "Submit at least 2 applications with AP",
      "Complete your 30-day production review",
    ],
    keyActivities: [
      { title: "Shadow Top Producer Call #1", type: "call", duration: "90 min", xp: 200, completed: false },
      { title: "Shadow Top Producer Call #2", type: "call", duration: "90 min", xp: 200, completed: false },
      { title: "Run Your First Solo Client Meeting", type: "call", duration: "60 min", xp: 300, completed: false },
      { title: "Make 50 Outbound Calls", type: "practice", duration: "45 min", xp: 150, completed: false },
      { title: "30-Day Production Review", type: "review", duration: "45 min", xp: 200, completed: false },
      { title: "Month 1 Performance Review", type: "module", duration: "45 min", xp: 175, completed: false },
      { title: "Month 1 Certification Exam", type: "quiz", duration: "60 min", xp: 400, completed: false },
    ],
  },
};

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  module: BookOpen,
  quiz: GraduationCap,
  practice: Target,
  call: Phone,
  planning: CalendarDays,
  action: Zap,
  review: TrendingUp,
};

const typeColors: Record<string, string> = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  practice: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  call: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  planning: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  action: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  review: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
};

export default function OnboardingDays8to30() {
  const [activeWeek, setActiveWeek] = useState("2");

  // Use persistent activity progress tracking
  const {
    activities,
    toggleActivity,
    stats,
    isLoaded,
    getActivityId,
  } = useActivityProgress("weeks-2-4", weekContent);

  // Active task for modal
  const [activeTask, setActiveTask] = useState<{
    id: string;
    title: string;
    description: string;
    type: string;
    duration: string;
    xp: number;
    completed: boolean;
    required: boolean;
    day: number;
  } | null>(null);
  const [activeTaskContent, setActiveTaskContent] = useState<any>(null);

  const currentWeek = parseInt(activeWeek) as 2 | 3 | 4;
  const content = activities[currentWeek];

  // Calculate progress from activities state
  const getCompletedCount = (week: 2 | 3 | 4) =>
    activities[week].keyActivities.filter(a => a.completed).length;

  const totalTasks = stats.total;
  const completedTasks = stats.completed;
  const progress = stats.progressPercent;
  const totalXP = stats.xpEarned;

  // Handle activity click to open modal
  const handleActivityClick = (activity: typeof content.keyActivities[0], week: number, index: number) => {
    // Create a task-like object for the modal
    const taskObj = {
      id: `week${week}-${activity.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: activity.title,
      description: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} activity for Week ${week}`,
      type: activity.type,
      duration: activity.duration,
      xp: activity.xp,
      completed: activity.completed,
      required: true,
      day: week * 7,
    };

    // Store the index for completion tracking
    setCurrentActivityIndex({ week: week as 2 | 3 | 4, index });

    // Try to get matching content from task content map
    const contentData = getTaskContent(taskObj.id);
    if (contentData) {
      setActiveTask(taskObj);
      setActiveTaskContent(contentData);
    } else {
      // If no content, just toggle completion
      toggleActivity(week as 2 | 3 | 4, index);
    }
  };

  // Track current activity for completion
  const [currentActivityIndex, setCurrentActivityIndex] = useState<{ week: 2 | 3 | 4; index: number } | null>(null);

  // Close modal
  const handleCloseModal = () => {
    setActiveTask(null);
    setActiveTaskContent(null);
    setCurrentActivityIndex(null);
  };

  // Handle task completion from modal
  const handleTaskComplete = (taskId: string) => {
    // Mark the activity as complete
    if (currentActivityIndex) {
      toggleActivity(currentActivityIndex.week, currentActivityIndex.index);
    }
    handleCloseModal();
  };

  return (
    <OnboardingLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ gap: GRID.spacing.md }}
        className="flex flex-col"
      >
        {/* Header - Hero Card */}
        <AgentPageHero
          icon={CalendarDays}
          title="Days 8-30: Go Produce"
          subtitle="Make 50+ calls, close your first clients, and write real AP every week"
        />

        {/* Progress Stats Grid */}
        <AgentStatCardGrid className="grid-cols-3 lg:grid-cols-3">
          <AgentStatCard
            icon={ListChecks}
            value={`${completedTasks}/${totalTasks}`}
            label="Tasks Complete"
          />
          <AgentStatCard
            icon={TrendingUp}
            value={`${progress}%`}
            label="Progress"
          />
          <AgentStatCard
            icon={Zap}
            value={Math.round(totalXP)}
            label="XP Earned"
          />
        </AgentStatCardGrid>

        {/* Back to Days 3-7 */}
        <motion.div variants={fadeInUp}>
          <Link href="/agents/onboarding/days-3-7">
            <Button variant="ghost" className="text-violet-600 hover:text-violet-700" style={{ fontSize: TYPE.meta }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Review Boot Camp (Days 3-7)
            </Button>
          </Link>
        </motion.div>

        {/* Milestones Overview */}
        <motion.div variants={fadeInUp}>
          <Card
            className="relative overflow-hidden border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              background: 'white',
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, transparent 70%)`,
                borderRadius: `0 ${RADIUS.card}px 0 100%`,
              }}
            />

            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
              <SectionHeader
                icon={Award}
                title="Production Milestones"
                subtitle="Hit each weekly target to unlock your next level"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <motion.div
                className="grid md:grid-cols-3"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {milestones.map((milestone, index) => {
                  const milestoneProgress = Math.round((milestone.completedTasks / milestone.tasks) * 100);
                  return (
                    <motion.div
                      key={milestone.id}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      className={cn(
                        "border transition-all",
                        milestoneProgress > 0
                          ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
                          : "bg-white border-gray-200"
                      )}
                      style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, boxShadow: SHADOW.level1 }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                        <Badge
                          className={cn(
                            "font-medium",
                            milestoneProgress > 0
                              ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          Week {milestone.week}
                        </Badge>
                        {milestoneProgress === 100 && (
                          <CheckCircle2 className="w-5 h-5 text-violet-500" />
                        )}
                      </div>
                      <h3 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                      <p style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.sm }} className="text-gray-500">{milestone.description}</p>
                      <div className="flex items-center justify-between" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        <span className="text-gray-500">{milestone.completedTasks}/{milestone.tasks} tasks</span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Zap style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                          {milestone.xpReward} XP
                        </span>
                      </div>
                      <GradientProgress value={milestoneProgress} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Week Content */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeWeek} onValueChange={setActiveWeek}>
            <TabsList
              className="grid grid-cols-3 bg-gray-100/80 backdrop-blur-sm p-1"
              style={{
                marginBottom: GRID.spacing.md,
                borderRadius: RADIUS.button,
                height: GRID.spacing.xxl,
              }}
            >
              {[2, 3, 4].map(week => (
                <TabsTrigger
                  key={week}
                  value={week.toString()}
                  className={cn(
                    "relative font-medium transition-all",
                    "data-[state=active]:bg-white data-[state=active]:shadow-md"
                  )}
                  style={{ borderRadius: RADIUS.button - 4 }}
                >
                  Week {week}
                </TabsTrigger>
              ))}
            </TabsList>

            {[2, 3, 4].map((week) => (
              <TabsContent key={week} value={week.toString()}>
                <div className="grid lg:grid-cols-3" style={{ gap: GRID.spacing.md }}>
                  {/* Objectives */}
                  <Card
                    className="lg:col-span-1 relative overflow-hidden border-0"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'white',
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-5"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, transparent 70%)`,
                        borderRadius: `0 ${RADIUS.card}px 0 100%`,
                      }}
                    />

                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <SectionHeader
                        icon={Target}
                        title={`Week ${week} Targets`}
                        subtitle="Hit every number this week"
                      />
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0, gap: GRID.spacing.sm }} className="flex flex-col">
                      {activities[week as 2 | 3 | 4].objectives.map((obj, i) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, duration: MOTION.duration.normal, ease: MOTION.easing }}
                        >
                          <Circle style={{ width: GRID.spacing.sm + 4, height: GRID.spacing.sm + 4 }} className="text-violet-300 mt-0.5 flex-shrink-0" />
                          <span style={{ fontSize: TYPE.body }} className="text-gray-600">{obj}</span>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Activities */}
                  <Card
                    className="lg:col-span-2 relative overflow-hidden border-0"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'white',
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-5"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, transparent 70%)`,
                        borderRadius: `0 ${RADIUS.card}px 0 100%`,
                      }}
                    />

                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <SectionHeader
                        icon={ListChecks}
                        title="Key Activities"
                        subtitle={activities[week as 2 | 3 | 4].focus}
                        badge={
                          <Badge
                            className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50 font-medium"
                            style={{ padding: '6px 12px' }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            {activities[week as 2 | 3 | 4].keyActivities.filter(a => a.completed).length} of {activities[week as 2 | 3 | 4].keyActivities.length}
                          </Badge>
                        }
                      />
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0, gap: GRID.spacing.sm }} className="flex flex-col">
                      {activities[week as 2 | 3 | 4].keyActivities.map((activity, i) => {
                        const Icon = typeIcons[activity.type];
                        return (
                          <motion.div
                            key={i}
                            variants={scaleIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.05 }}
                            whileHover={{
                              y: MOTION.hover.y,
                              scale: MOTION.hover.scale,
                              transition: { duration: MOTION.duration.hover }
                            }}
                            onClick={() => handleActivityClick(activity, week, i)}
                            className={cn(
                              "flex items-start border transition-all cursor-pointer group relative overflow-hidden",
                              activity.completed
                                ? "bg-gradient-to-r from-violet-50/80 to-purple-50/50 border-violet-200/50"
                                : "bg-white border-gray-200/80 hover:border-violet-300 hover:shadow-md"
                            )}
                            style={{
                              gap: GRID.spacing.sm,
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              boxShadow: activity.completed ? 'none' : SHADOW.level1,
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              style={{
                                background: 'linear-gradient(90deg, rgba(124,58,237,0.02) 0%, rgba(147,51,234,0.02) 100%)',
                              }}
                            />

                            <motion.div
                              className="mt-0.5 relative z-10 cursor-pointer"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleActivity(week as 2 | 3 | 4, i);
                              }}
                            >
                              {activity.completed ? (
                                <CheckCircle2
                                  style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                                  className="text-violet-500 drop-shadow-sm"
                                />
                              ) : (
                                <Circle
                                  style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                                  className="text-gray-300 group-hover:text-violet-400 transition-colors"
                                />
                              )}
                            </motion.div>

                            <div className="flex-1 min-w-0 relative z-10">
                              <h4
                                className={cn(
                                  "font-medium mb-1",
                                  activity.completed ? "text-gray-500 line-through" : "text-gray-900"
                                )}
                                style={{ fontSize: TYPE.body }}
                              >
                                {activity.title}
                              </h4>
                              <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}>
                                <span
                                  className={cn("flex items-center gap-1 font-medium", typeColors[activity.type])}
                                  style={{ padding: `4px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill }}
                                >
                                  <Icon className="w-3 h-3" />
                                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                </span>
                                <span className="flex items-center gap-1 text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {activity.duration}
                                </span>
                                <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50/80 px-2 py-1 rounded-full border border-amber-200/50">
                                  <Zap className="w-3 h-3" />
                                  +{activity.xp} XP
                                </span>
                              </div>
                            </div>

                            <motion.div
                              className="relative z-10"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                            >
                              {activity.completed ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleActivity(week as 2 | 3 | 4, i);
                                  }}
                                  className="flex-shrink-0 border-violet-300 text-violet-600 hover:bg-violet-50"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                  Completed
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivityClick(activity, week, i);
                                  }}
                                  className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md relative overflow-hidden group/btn"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  {/* Shimmer overlay */}
                                  <div
                                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                    style={{
                                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                                      animation: 'shimmer 2s infinite',
                                    }}
                                  />
                                  <span className="relative z-10 flex items-center">
                                    {activity.type === "video" ? (
                                      <>
                                        <Play className="w-3.5 h-3.5 mr-1.5" />
                                        Watch
                                      </>
                                    ) : activity.type === "call" ? (
                                      <>
                                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                                        Schedule
                                      </>
                                    ) : activity.type === "quiz" ? (
                                      <>
                                        <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                                        Take Quiz
                                      </>
                                    ) : activity.type === "practice" ? (
                                      <>
                                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                        Practice
                                      </>
                                    ) : (
                                      <>
                                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                                        Start
                                      </>
                                    )}
                                  </span>
                                </Button>
                              )}
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* What You'll Achieve */}
        <motion.div variants={fadeInUp}>
          <Card
            className="relative overflow-hidden border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              background: 'white',
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, transparent 70%)`,
                borderRadius: `0 ${RADIUS.card}px 0 100%`,
              }}
            />

            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
              <SectionHeader
                icon={TrendingUp}
                title="Month 1 Production Goals"
                subtitle="Real numbers, real results -- track these weekly"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-4"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Phone, value: "50+", label: "Outbound Calls", color: COLORS.primary.violet[500], bgColor: COLORS.primary.violet[50] },
                  { icon: Briefcase, value: "5+", label: "Apps Submitted", color: COLORS.primary.purple[500], bgColor: COLORS.primary.purple[50] },
                  { icon: Users, value: "10+", label: "Client Meetings", color: COLORS.primary.violet[500], bgColor: COLORS.primary.violet[50] },
                  { icon: Award, value: "Month 1", label: "Certified Producer", color: COLORS.accent.amber[500], bgColor: COLORS.accent.amber[50] },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="text-center border border-gray-100/50"
                    style={{
                      padding: GRID.spacing.md,
                      borderRadius: RADIUS.button,
                      boxShadow: SHADOW.level1,
                      background: item.bgColor,
                    }}
                  >
                    <div
                      className="mx-auto mb-3 flex items-center justify-center text-white"
                      style={{
                        width: GRID.spacing.xxl,
                        height: GRID.spacing.xxl,
                        borderRadius: RADIUS.button,
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                        boxShadow: `0 4px 12px ${item.color}40`,
                      }}
                    >
                      <item.icon style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                    </div>
                    <h4 style={{ fontSize: TYPE.title }} className="font-bold text-gray-900">{item.value}</h4>
                    <p style={{ fontSize: TYPE.meta }} className="text-gray-500 font-medium">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Phase Complete Section
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Radial Gradient Dots Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }}>
              <defs>
                <radialGradient id="completeDotGradient8" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="completeDotsPattern8" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#completeDotGradient8)" />
                </pattern>
                <radialGradient id="completeFade8" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="completeMask8">
                  <rect width="100%" height="100%" fill="url(#completeFade8)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#completeDotsPattern8)" mask="url(#completeMask8)" />
            </svg>

            {/* Blur Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-400/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

            {/* Floating Particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/30"
                style={{
                  width: 6 + i * 2,
                  height: 6 + i * 2,
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}

            <CardContent style={{ padding: GRID.spacing.lg }} className="text-center relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto"
                style={{
                  width: GRID.spacing.xxxxl,
                  height: GRID.spacing.xxxxl,
                  marginBottom: GRID.spacing.md,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                <Trophy style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-300" />
              </motion.div>
              <h3
                style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                className="font-bold tracking-tight text-white"
              >
                Month 1: Mission Accomplished
              </h3>
              <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                You have clients, AP on the books, and a growing pipeline. This is just the beginning.
              </p>
              <Link href="/agents/onboarding/lounge">
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Button
                    className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                    style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                  >
                    Back to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>


      {/* Task Content Modal */}
      <AnimatePresence>
        {activeTask && activeTaskContent && (
          <TaskContentModal
            isOpen={!!activeTask}
            onClose={handleCloseModal}
            task={activeTask}
            content={activeTaskContent}
            onComplete={handleTaskComplete}
          />
        )}
      </AnimatePresence>
    </OnboardingLoungeLayout>
  );
}
