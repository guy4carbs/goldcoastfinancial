import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
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
  TrendingUp,
  Award,
  Trophy,
  Sparkles,
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
  GLASS,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "@/lib/onboardingDesignSystem";
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
    title: "Welcome & Account Setup",
    subtitle: "Get started with your Heritage Life account",
    icon: Rocket,
  },
  admin: {
    id: "admin",
    title: "Administrative Requirements",
    subtitle: "Complete required paperwork and tool setup",
    icon: FileText,
  },
  crm: {
    id: "crm",
    title: "CRM Training",
    subtitle: "Learn to manage your client relationships",
    icon: Settings,
  },
  products: {
    id: "products",
    title: "Product Knowledge Basics",
    subtitle: "Introduction to Heritage Life insurance products",
    icon: Award,
  },
  script: {
    id: "script",
    title: "Script Introduction",
    subtitle: "Get familiar with the Heritage sales methodology",
    icon: FileText,
  },
};

const day1Tasks: Task[] = [
  // Section 1: Welcome & Account Setup
  {
    id: "welcome-video",
    title: "Watch Welcome Video",
    description: "Meet our leadership team and learn about Heritage Life's mission",
    type: "video",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "complete-profile",
    title: "Complete Your Profile",
    description: "Add your photo, contact information, and bio",
    type: "form",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "setup-2fa",
    title: "Set Up Two-Factor Authentication",
    description: "Secure your account with 2FA for compliance",
    type: "action",
    duration: "5 min",
    xp: 100,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "tour-portal",
    title: "Tour the Agent Portal",
    description: "Interactive walkthrough of all portal features",
    type: "video",
    duration: "10 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "meet-team",
    title: "Meet Your Team",
    description: "Learn about your manager, mentor, and support team",
    type: "read",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "welcome",
  },
  {
    id: "setup-notifications",
    title: "Configure Notifications",
    description: "Set up email and push notification preferences",
    type: "action",
    duration: "5 min",
    xp: 25,
    completed: false,
    required: false,
    section: "welcome",
  },

  // Section 2: Administrative Requirements
  {
    id: "sign-nda",
    title: "Sign NDA Agreement",
    description: "Review and digitally sign the Non-Disclosure Agreement",
    type: "form",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "admin",
  },
  {
    id: "contracts-verification",
    title: "Contracts Sent Verification",
    description: "Confirm your agent contract has been received and is processing",
    type: "action",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "admin",
  },
  {
    id: "toolkit-setup",
    title: "Insurance Toolkits Credentials Setup",
    description: "Set up your email and password for carrier toolkits access",
    type: "action",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "admin",
  },
  {
    id: "contract-status",
    title: "Track Contract Status",
    description: "Learn how to check the status of your contracts and appointments",
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
    title: "CRM Account Activation",
    description: "Activate your CRM account and set up your login credentials",
    type: "action",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "crm",
  },
  {
    id: "crm-tour",
    title: "CRM Navigation Tour",
    description: "Video walkthrough of the CRM interface and key features",
    type: "video",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "crm",
  },
  {
    id: "crm-functions",
    title: "CRM Basic Functions Training",
    description: "Learn to add contacts, log calls, and manage your pipeline",
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
    title: "Whole Life Insurance Basics",
    description: "Introduction to permanent life insurance with cash value accumulation",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "term-life-basics",
    title: "Term Life Insurance Basics",
    description: "Introduction to affordable temporary coverage options",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "iul-basics",
    title: "Indexed Universal Life (IUL) Basics",
    description: "Introduction to flexible permanent coverage with market-linked growth",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "annuities-basics",
    title: "Annuities Basics",
    description: "Introduction to guaranteed income products for retirement",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "products",
  },
  {
    id: "products-quiz",
    title: "Day 1 Products Quiz",
    description: "Test your understanding of the four core product types",
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
    title: "Heritage Script Philosophy",
    description: "Understand the consultative approach behind Heritage's proven scripts",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script",
  },
  {
    id: "script-library",
    title: "Script Library Overview",
    description: "Tour the script library and learn how to access different scenarios",
    type: "read",
    duration: "10 min",
    xp: 50,
    completed: false,
    required: true,
    section: "script",
  },
  {
    id: "script-structure",
    title: "Script Structure Breakdown Preview",
    description: "Preview the 6-part script structure you'll master on Day 2",
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
        style={{ gap: GRID.spacing.md }}
        className="flex flex-col"
      >
        {/* Header - Hero Card with Enhanced Visuals */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Decorative pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            {/* Floating decorative circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-sm" />

            <CardContent style={{ padding: GRID.spacing.lg }} className="relative">
              <div className="flex items-start" style={{ gap: GRID.spacing.md }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: 0.2
                  }}
                  className="bg-white/20 backdrop-blur-md flex items-center justify-center"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    borderRadius: RADIUS.card,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Rocket style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Day 1 of 30
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Welcome & Setup
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Get started with Heritage Life! Complete your profile, learn the basics, and set up your account for success.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Stats Grid - Enhanced with Glass Morphism */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-3"
          style={{ gap: GRID.spacing.sm }}
        >
          {[
            {
              value: `${completedCount}/${totalTasks}`,
              label: "Tasks Complete",
              gradient: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.violet[600]} 100%)`,
              icon: ListChecks,
              bgGlow: COLORS.primary.violet[100],
            },
            {
              value: `${progress}%`,
              label: "Progress",
              gradient: `linear-gradient(135deg, ${COLORS.primary.purple[500]} 0%, ${COLORS.primary.purple[600]} 100%)`,
              icon: TrendingUp,
              bgGlow: COLORS.primary.purple[100],
            },
            {
              value: totalXP,
              label: "XP Earned",
              gradient: `linear-gradient(135deg, ${COLORS.accent.amber[500]} 0%, ${COLORS.accent.amber[600]} 100%)`,
              icon: Zap,
              bgGlow: COLORS.accent.amber[100],
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="relative overflow-hidden border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: GLASS.background,
                  backdropFilter: `blur(${GLASS.blur}px)`,
                  WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
                }}
              >
                {/* Subtle gradient glow in background */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-40 blur-2xl"
                  style={{ background: stat.bgGlow }}
                />
                <CardContent style={{ padding: GRID.spacing.md }} className="text-center relative">
                  <div
                    className="mx-auto flex items-center justify-center text-white mb-3"
                    style={{
                      width: GRID.spacing.xl,
                      height: GRID.spacing.xl,
                      borderRadius: RADIUS.button,
                      background: stat.gradient,
                      boxShadow: `0 4px 12px ${stat.bgGlow}`,
                    }}
                  >
                    <stat.icon style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                  </div>
                  <div
                    className="font-bold mb-1"
                    style={{ fontSize: TYPE.section }}
                  >
                    {stat.value}
                  </div>
                  <p style={{ fontSize: TYPE.caption }} className="text-gray-500 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Overall Progress Card */}
        <motion.div variants={fadeInUp}>
          <Card
            className="relative overflow-hidden border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              background: 'white',
            }}
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
        </motion.div>

        {/* Task Sections - Organized by Category */}
        {(Object.keys(SECTIONS) as Array<keyof typeof SECTIONS>).map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const sectionTasks = tasks.filter(t => t.section === sectionKey);
          const sectionCompleted = sectionTasks.filter(t => t.completed).length;
          const sectionTotal = sectionTasks.length;
          const SectionIcon = section.icon;

          return (
            <motion.div key={sectionKey} variants={fadeInUp}>
              <Card
                className="relative overflow-hidden border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'white',
                }}
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
            </motion.div>
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
                  Day 1 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  Congratulations! You have completed all Day 1 tasks and earned {totalXP} XP. You are ready to continue your journey.
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
                        Continue to Day 2
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
