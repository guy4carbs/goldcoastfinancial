import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
import {
  Rocket,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Settings,
  Video,
  Clock,
  Zap,
  ListChecks,
  Award,
  Trophy,
  ArrowRight,
} from "lucide-react";
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
import { TaskContentModal } from "@/components/onboarding/TaskContentModal";
import { getTaskContent } from "@/data/onboardingTaskContent";
import { useDayProgress } from "@/hooks/useOnboardingProgress";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "video" | "form" | "action" | "read" | "module" | "quiz";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
  section: "welcome" | "admin" | "crm" | "products" | "script";
}

// Section definitions for organization
const SECTIONS = {
  welcome: {
    id: "welcome",
    title: "Set Up Your Account",
    subtitle: "Get your profile, security, and notifications ready to go",
    icon: Rocket,
  },
  admin: {
    id: "admin",
    title: "Lock In Your Contracts",
    subtitle: "Verify paperwork and activate your carrier credentials",
    icon: FileText,
  },
  crm: {
    id: "crm",
    title: "Activate Your CRM",
    subtitle: "Your command center for leads, calls, and pipeline tracking",
    icon: Settings,
  },
  products: {
    id: "products",
    title: "Know Your Products",
    subtitle: "Learn the four core product lines you will sell",
    icon: Award,
  },
  script: {
    id: "script",
    title: "Preview the Sales Script",
    subtitle: "See the proven structure you will master on Day 2",
    icon: FileText,
  },
};

const day1Tasks: Task[] = [
  // Section 1: Welcome & Account Setup
  {
    id: "welcome-video",
    title: "Watch Your Welcome Video",
    description: "Meet the leadership team and see what top Heritage agents achieve",
    type: "video",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "complete-profile",
    title: "Set Up Your Agent Profile",
    description: "Add your photo, bio, and contact info so clients can find you",
    type: "form",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "setup-2fa",
    title: "Verify Your Phone Number",
    description: "Confirm your mobile number with a verification code to secure your account",
    type: "action",
    duration: "5 min",
    xp: 100,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "tour-portal",
    title: "Explore the Agent Portal",
    description: "Walk through every tool you will use daily to manage your book of business",
    type: "video",
    duration: "10 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "meet-team",
    title: "Meet Your Support Team",
    description: "Know your manager, mentor, and who to call when you need help",
    type: "read",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "setup-notifications",
    title: "Turn On Notifications",
    description: "Set up alerts so you never miss a lead or important update",
    type: "action",
    duration: "5 min",
    xp: 25,
    completed: false,
    required: false,
    section: "welcome",
  },

  // Section 2: Administrative Requirements
  {
    id: "contracts-verification",
    title: "Verify Your Contracts",
    description: "Confirm your agent contract is received and processing with carriers",
    type: "action",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "admin",
  },
  {
    id: "toolkit-setup",
    title: "Set Up Carrier Toolkits",
    description: "Create your login credentials to access carrier quoting and e-apps",
    type: "action",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "admin",
  },
  {
    id: "contract-status",
    title: "Check Appointment Status",
    description: "Learn to track your carrier appointments so you know when you can sell",
    type: "action",
    duration: "5 min",
    xp: 25,
    completed: false,
    required: true,
    section: "admin",
  },

  // Section 3: CRM Training
  {
    id: "crm-activation",
    title: "Activate Your CRM",
    description: "Set up your login and get your pipeline dashboard ready",
    type: "action",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "crm",
  },
  {
    id: "crm-tour",
    title: "Navigate the CRM",
    description: "Watch a walkthrough of the interface you will use to track every lead and deal",
    type: "video",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "crm",
  },
  {
    id: "crm-functions",
    title: "Master CRM Basics",
    description: "Add contacts, log calls, and move leads through your sales pipeline",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "crm",
  },

  // Section 4: Product Knowledge Basics
  {
    id: "whole-life-basics",
    title: "Whole Life Overview",
    description: "Understand permanent coverage with cash value — a cornerstone product for families",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "term-life-basics",
    title: "Term Life Overview",
    description: "Learn affordable temporary coverage — the easiest product to sell and close",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "iul-basics",
    title: "IUL Overview",
    description: "Explore flexible permanent coverage with market-linked growth potential",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "annuities-basics",
    title: "Annuities Overview",
    description: "Learn guaranteed income products that protect your clients' retirement",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "products-quiz",
    title: "Product Knowledge Check",
    description: "Prove you understand all four product lines before moving forward",
    type: "quiz",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "products",
  },

  // Section 5: Script Introduction
  {
    id: "script-philosophy",
    title: "Why This Script Works",
    description: "See the consultative approach that drives Heritage's top producers",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script",
  },
  {
    id: "script-library",
    title: "Browse the Script Library",
    description: "Find scripts for every scenario — cold calls, referrals, and follow-ups",
    type: "read",
    duration: "10 min",
    xp: 50,
    completed: false,
    required: true,
    section: "script",
  },
  {
    id: "script-structure",
    title: "Preview the 6-Part Script",
    description: "Get a first look at the complete script structure you will master tomorrow",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script",
  },
];

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  form: FileText,
  action: Settings,
  read: FileText,
  module: Award,
  quiz: Zap,
};

const typeColors: Record<string, string> = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  form: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  action: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  read: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  quiz: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
};

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

// Custom progress bar with gradient fill
function GradientProgress({ value }: { value: number }) {
  return (
    <div
      className="w-full bg-gray-100 overflow-hidden relative"
      style={{ height: 10, borderRadius: RADIUS.pill }}
    >
      {/* Animated shimmer overlay */}
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
        {/* Inner glow effect */}
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

export default function OnboardingDay1() {
  // Use persistent progress tracking
  const {
    tasks,
    handleTaskComplete: persistTaskComplete,
    stats,
    isLoaded,
    totalXp: globalXp,
    markDayComplete,
  } = useDayProgress("day-1", day1Tasks);

  // Task content modal state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTaskContent, setActiveTaskContent] = useState<{
    type: "video" | "module" | "quiz" | "simulation" | "roleplay" | "celebration";
    content: any;
  } | null>(null);

  const completedCount = stats.completed;
  const totalTasks = stats.total;
  const progress = stats.progressPercent;
  const totalXP = stats.xpEarned;

  // Check for day completion
  useEffect(() => {
    if (stats.completed === stats.total && stats.total > 0) {
      markDayComplete(1);
    }
  }, [stats.completed, stats.total, markDayComplete]);

  // Open task content modal
  const handleTaskAction = (task: Task) => {
    const content = getTaskContent(task.id);
    if (content) {
      setActiveTask(task);
      setActiveTaskContent(content as any);
    }
  };

  // Handle task completion from modal
  const handleTaskComplete = (taskId: string) => {
    persistTaskComplete(taskId);
    setActiveTask(null);
    setActiveTaskContent(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setActiveTask(null);
    setActiveTaskContent(null);
  };

  return (
    <OnboardingLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero */}
        <AgentPageHero
          icon={Rocket}
          title="Day 1: Welcome to Heritage"
          subtitle="Set up your account, learn the tools, and take your first steps toward production"
        />

        {/* Stats */}
        <motion.section variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={CheckCircle2} value={`${completedCount}/${totalTasks}`} label="Tasks Done" />
            <AgentStatCard icon={Zap} value={totalXP} label="XP Earned" />
            <AgentStatCard icon={Clock} value="~2hrs" label="Time Left" />
            <AgentStatCard icon={Trophy} value={`${progress}%`} label="Complete" />
          </AgentStatCardGrid>
        </motion.section>

        {/* Overall Progress Card */}
        <motion.section variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center"
                    style={{
                      width: GRID.spacing.xl,
                      height: GRID.spacing.xl,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <ListChecks style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                      Day 1 Progress
                    </h2>
                    <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                      {completedCount} of {totalTasks} tasks complete
                    </p>
                  </div>
                </div>
                <Badge
                  className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50 font-semibold"
                  style={{ padding: '8px 16px', fontSize: TYPE.body }}
                >
                  {progress}%
                </Badge>
              </div>
              <GradientProgress value={progress} />
            </CardContent>
          </Card>
        </motion.section>

        {/* Task Sections - Organized by Category */}
        {(Object.keys(SECTIONS) as Array<keyof typeof SECTIONS>).map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const sectionTasks = tasks.filter(t => t.section === sectionKey);
          const sectionCompleted = sectionTasks.filter(t => t.completed).length;
          const sectionTotal = sectionTasks.length;
          const SectionIcon = section.icon;

          return (
            <motion.section key={sectionKey} variants={fadeInUp}>
              <Card
                className="border-0 overflow-hidden"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                {/* Decorative corner accent */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-5"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, transparent 70%)`,
                    borderRadius: `0 ${RADIUS.card}px 0 100%`,
                  }}
                />

                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                  <SectionHeader
                    icon={SectionIcon}
                    title={section.title}
                    subtitle={section.subtitle}
                    badge={
                      <Badge
                        className={cn(
                          "font-medium",
                          sectionCompleted === sectionTotal
                            ? "bg-violet-50 text-violet-700 border border-violet-200/50"
                            : "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50"
                        )}
                        style={{ padding: '6px 12px' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {sectionCompleted} of {sectionTotal}
                      </Badge>
                    }
                  />
                </CardHeader>

                <CardContent
                  style={{ padding: GRID.spacing.md, paddingTop: 0, gap: GRID.spacing.sm }}
                  className="flex flex-col"
                >
                  {sectionTasks.map((task, index) => {
                    const Icon = typeIcons[task.type];
                    return (
                      <motion.div
                        key={task.id}
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          y: MOTION.hover.y,
                          scale: MOTION.hover.scale,
                          transition: { duration: MOTION.duration.hover }
                        }}
                        className={cn(
                          "flex items-start border transition-all cursor-pointer group relative overflow-hidden",
                          task.completed
                            ? "bg-gradient-to-r from-violet-50/80 to-purple-50/50 border-violet-200/50"
                            : "bg-white border-gray-200/80 hover:border-violet-300 hover:shadow-md"
                        )}
                        style={{
                          gap: GRID.spacing.sm,
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          boxShadow: task.completed ? 'none' : SHADOW.level1,
                        }}
                      >
                        {/* Hover gradient overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            background: 'linear-gradient(90deg, rgba(124,58,237,0.02) 0%, rgba(147,51,234,0.02) 100%)',
                          }}
                        />

                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 relative z-10 transition-transform hover:scale-110"
                        >
                          {task.completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            >
                              <CheckCircle2
                                style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                                className="text-violet-500 drop-shadow-sm"
                              />
                            </motion.div>
                          ) : (
                            <Circle
                              style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                              className="text-gray-300 group-hover:text-violet-400 transition-colors"
                            />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={cn(
                                "font-medium transition-colors",
                                task.completed ? "text-gray-500 line-through" : "text-gray-900"
                              )}
                              style={{ fontSize: TYPE.body }}
                            >
                              {task.title}
                            </h3>
                            {task.required && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50/80 text-amber-700 border-amber-200/50"
                                style={{ fontSize: TYPE.micro, padding: '2px 8px' }}
                              >
                                Required
                              </Badge>
                            )}
                          </div>
                          <p
                            style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}
                            className={cn(
                              "transition-colors",
                              task.completed ? "text-gray-400" : "text-gray-500"
                            )}
                          >
                            {task.description}
                          </p>
                          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}>
                            <span
                              className={cn("flex items-center gap-1 font-medium", typeColors[task.type])}
                              style={{ padding: `4px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill }}
                            >
                              <Icon className="w-3 h-3" />
                              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              {task.duration}
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50/80 px-2 py-1 rounded-full border border-amber-200/50">
                              <Zap className="w-3 h-3" />
                              +{task.xp} XP
                            </span>
                          </div>
                        </div>

                        {!task.completed && (
                          <motion.div
                            className="relative z-10"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                          >
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskAction(task);
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
                                {task.type === "video" ? (
                                  <>
                                    <Play className="w-3.5 h-3.5 mr-1.5" />
                                    Watch
                                  </>
                                ) : task.type === "read" ? (
                                  <>
                                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                                    Read
                                  </>
                                ) : task.type === "quiz" ? (
                                  <>
                                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                                    Take Quiz
                                  </>
                                ) : task.type === "module" ? (
                                  <>
                                    <Award className="w-3.5 h-3.5 mr-1.5" />
                                    Learn
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                                    Start
                                  </>
                                )}
                              </span>
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.section>
          );
        })}

        {/* Continue to Next Day - Always visible */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
        >
            <Card
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white border-0 relative overflow-hidden"
              style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
            >
              {/* Animated sparkle overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Floating particles with staggered animations */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + (i % 3) * 2,
                    height: 4 + (i % 3) * 2,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.4)',
                    top: `${15 + (i * 15) % 70}%`,
                    left: `${10 + (i * 17) % 80}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2 + (i * 0.3),
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <CardContent style={{ padding: GRID.spacing.lg }} className="text-center relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    delay: 0.2
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    marginBottom: GRID.spacing.md,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Trophy style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-300" />
                </motion.div>
                <h3
                  style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                  className="font-bold tracking-tight text-white"
                >
                  Day 1 — Done.
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You earned {totalXP} XP and your foundation is locked in. Tomorrow you learn the script that closes deals.
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/day-2">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        Start Day 2: Script Mastery
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </motion.div>

      {/* Add shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>


      {/* Task Content Modal */}
      <TaskContentModal
        isOpen={!!activeTask}
        onClose={handleCloseModal}
        task={activeTask}
        content={activeTaskContent}
        onComplete={handleTaskComplete}
      />
    </OnboardingLoungeLayout>
  );
}
