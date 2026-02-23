import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  Target,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  BookOpen,
  Video,
  Clock,
  Zap,
  ListChecks,
  GraduationCap,
  Trophy,
  Sparkles,
  TrendingUp,
  Shield,
  MessageSquare,
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
  type: "video" | "module" | "quiz" | "read" | "roleplay";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
  section: "compliance" | "script-intro" | "script-fact" | "script-app" | "script-close" | "roleplay" | "objections" | "assessment";
}

// Section definitions for Day 2 - Script Mastery Focus
const SECTIONS = {
  compliance: {
    id: "compliance",
    title: "Compliance & Handbook",
    subtitle: "Essential policies and regulations",
    icon: Shield,
  },
  "script-intro": {
    id: "script-intro",
    title: "Script Part 1: Introduction",
    subtitle: "Building credibility & rapport with prospects",
    icon: MessageSquare,
    scriptPart: 1,
  },
  "script-fact": {
    id: "script-fact",
    title: "Script Part 2: Fact Finder",
    subtitle: "Discovering coverage needs and premium expectations",
    icon: FileText,
    scriptPart: 2,
  },
  "script-app": {
    id: "script-app",
    title: "Script Parts 3-4: Application & Banking",
    subtitle: "Medical underwriting, SSN, and payment setup",
    icon: FileText,
    scriptPart: 3,
  },
  "script-close": {
    id: "script-close",
    title: "Script Parts 5-6: Close & Follow-up",
    subtitle: "Closing techniques and ongoing client care",
    icon: Trophy,
    scriptPart: 5,
  },
  roleplay: {
    id: "roleplay",
    title: "Roleplay Practice",
    subtitle: "Put your script knowledge into action",
    icon: MessageSquare,
  },
  objections: {
    id: "objections",
    title: "Objection Handling Intro",
    subtitle: "Learn to overcome common prospect concerns",
    icon: Shield,
  },
  assessment: {
    id: "assessment",
    title: "Day 2 Assessment",
    subtitle: "Test your script mastery",
    icon: GraduationCap,
  },
};

const day2Tasks: Task[] = [
  // Section 1: Compliance & Handbook
  {
    id: "read-handbook",
    title: "Read Agent Handbook",
    description: "Review Heritage Life policies, procedures, and expectations",
    type: "read",
    duration: "20 min",
    xp: 75,
    completed: false,
    required: true,
    section: "compliance",
  },
  {
    id: "compliance-intro",
    title: "Compliance Introduction",
    description: "Understanding insurance regulations and compliance requirements",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "compliance",
  },

  // Section 2: Script Part 1 - Introduction (Building credibility & rapport)
  {
    id: "script-credibility",
    title: "Building Credibility",
    description: "Learn how to establish trust and authority in the first 30 seconds",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-intro",
  },
  {
    id: "script-rapport",
    title: "Building Rapport Techniques",
    description: "Master conversation starters and connection-building strategies",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-intro",
  },

  // Section 3: Script Part 2 - Fact Finder (Coverage and premium)
  {
    id: "script-coverage-questions",
    title: "Coverage Discovery Questions",
    description: "Learn the key questions to uncover client protection needs",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-fact",
  },
  {
    id: "script-premium-framework",
    title: "Premium Discussion Framework",
    description: "How to discuss budget and present affordable options",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-fact",
  },

  // Section 4: Script Parts 3-4 - Application & Banking
  {
    id: "script-medical-underwriting",
    title: "Medical Underwriting Questions",
    description: "Navigate health questions professionally and thoroughly",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-application-walkthrough",
    title: "Application Walkthrough",
    description: "Step-by-step guide to completing applications accurately",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-sensitive-info",
    title: "Handling Sensitive Information",
    description: "Best practices for collecting SSN and banking details securely",
    type: "module",
    duration: "10 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-security-compliance",
    title: "Security Compliance",
    description: "Data protection requirements and secure handling procedures",
    type: "read",
    duration: "5 min",
    xp: 50,
    completed: false,
    required: true,
    section: "script-app",
  },

  // Section 5: Script Parts 5-6 - Close & Follow-up
  {
    id: "script-closing-techniques",
    title: "Closing Techniques",
    description: "Learn assumptive closes and how to ask for the business",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-close",
  },
  {
    id: "script-closing-old-policies",
    title: "Closing Old Policies",
    description: "How to help clients transition from existing coverage",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-close",
  },
  {
    id: "script-client-checkin",
    title: "Client Check-in Best Practices",
    description: "Building long-term relationships through regular follow-ups",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-close",
  },

  // Section 6: Roleplay Practice
  {
    id: "roleplay-call-1",
    title: "Full Script Roleplay - Phone Call #1",
    description: "Practice a complete sales call from introduction to close",
    type: "roleplay",
    duration: "15 min",
    xp: 150,
    completed: false,
    required: true,
    section: "roleplay",
  },
  {
    id: "roleplay-call-2",
    title: "Full Script Roleplay - Phone Call #2",
    description: "Second practice call with a different prospect scenario",
    type: "roleplay",
    duration: "15 min",
    xp: 150,
    completed: false,
    required: true,
    section: "roleplay",
  },
  {
    id: "roleplay-feedback",
    title: "AI Avatar Feedback Review",
    description: "Review your roleplay performance and get personalized tips",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "roleplay",
  },

  // Section 7: Objection Handling Intro
  {
    id: "objections-overview",
    title: "Common Objections Overview",
    description: "Learn the top 10 objections and why prospects raise them",
    type: "video",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "objections",
  },
  {
    id: "objections-practice",
    title: "Objection Handling Practice",
    description: "Roleplay responding to common objections with AI coach",
    type: "roleplay",
    duration: "15 min",
    xp: 150,
    completed: false,
    required: true,
    section: "objections",
  },

  // Section 8: Day 2 Assessment
  {
    id: "script-quiz",
    title: "Script Knowledge Check",
    description: "Test your understanding of the 6-part script structure",
    type: "quiz",
    duration: "10 min",
    xp: 100,
    completed: false,
    required: true,
    section: "assessment",
  },
  {
    id: "day2-assessment",
    title: "Day 2 Skills Assessment",
    description: "Comprehensive assessment of Day 2 learning objectives",
    type: "quiz",
    duration: "10 min",
    xp: 150,
    completed: false,
    required: true,
    section: "assessment",
  },
];

const typeIcons = {
  video: Video,
  module: BookOpen,
  quiz: GraduationCap,
  read: FileText,
  roleplay: MessageSquare,
};

const typeColors = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  read: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  roleplay: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
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

export default function OnboardingDay2() {
  // Use persistent progress tracking
  const {
    tasks,
    handleTaskComplete: persistTaskComplete,
    stats,
    isLoaded,
    totalXp: globalXp,
    markDayComplete,
  } = useDayProgress("day-2", day2Tasks);

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
      markDayComplete(2);
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
        {/* Header - Hero Card with Pattern Overlay */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
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
                  <Target style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Day 2 of 30
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Script Mastery
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Master the Heritage 6-part sales script. Today you'll learn Introduction, Fact Finding, Application, Banking, Close, and Follow-up.
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

        {/* Learning Objectives - Glass Morphism */}
        <motion.div variants={scaleIn}>
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
                icon={GraduationCap}
                title="Learning Objectives"
                subtitle="Master these skills to advance"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                {[
                  { text: "Master the 6-part Heritage script", icon: FileText },
                  { text: "Practice full sales conversations", icon: MessageSquare },
                  { text: "Handle common objections", icon: Shield },
                  { text: "Complete roleplay assessments", icon: GraduationCap },
                ].map((objective, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="flex items-center bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100/50"
                    style={{
                      gap: GRID.spacing.sm,
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
                    }}
                  >
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: GRID.spacing.lg,
                        height: GRID.spacing.lg,
                        borderRadius: RADIUS.button / 2,
                        background: `linear-gradient(135deg, ${COLORS.primary.violet[500]}, ${COLORS.primary.purple[500]})`,
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span style={{ fontSize: TYPE.body }} className="text-gray-700 font-medium">{objective.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                      Day 2 Progress
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

        {/* Task Sections - Organized by Script Parts */}
        {(Object.keys(SECTIONS) as Array<keyof typeof SECTIONS>).map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const sectionTasks = tasks.filter(t => t.section === sectionKey);
          const sectionCompleted = sectionTasks.filter(t => t.completed).length;
          const sectionTotal = sectionTasks.length;
          const SectionIcon = section.icon;

          // Skip empty sections
          if (sectionTotal === 0) return null;

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
                                ) : task.type === "quiz" ? (
                                  <>
                                    <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                                    Take Quiz
                                  </>
                                ) : task.type === "roleplay" ? (
                                  <>
                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                    Practice
                                  </>
                                ) : task.type === "read" ? (
                                  <>
                                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                                    Read
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                    Learn
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

        {/* Continue to Next Phase - Always visible */}
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
                  Day 2 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You have mastered the basics and earned {totalXP} XP. Ready for the next challenge!
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/days-3-7">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        Continue to Days 3-7
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
