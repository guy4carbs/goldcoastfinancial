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
    title: "Know the Rules",
    subtitle: "Policies and regulations every licensed agent must follow",
    icon: Shield,
  },
  "script-intro": {
    id: "script-intro",
    title: "Open the Call",
    subtitle: "Build instant credibility and rapport in the first 30 seconds",
    icon: MessageSquare,
    scriptPart: 1,
  },
  "script-fact": {
    id: "script-fact",
    title: "Uncover the Need",
    subtitle: "Ask the right questions to find coverage gaps and set premium expectations",
    icon: FileText,
    scriptPart: 2,
  },
  "script-app": {
    id: "script-app",
    title: "Complete the Application",
    subtitle: "Navigate underwriting, collect sensitive info, and set up payment",
    icon: FileText,
    scriptPart: 3,
  },
  "script-close": {
    id: "script-close",
    title: "Close the Deal",
    subtitle: "Ask for the business and set up long-term client relationships",
    icon: Trophy,
    scriptPart: 5,
  },
  roleplay: {
    id: "roleplay",
    title: "Prove It Live",
    subtitle: "Run full sales calls with AI prospects and get real-time coaching",
    icon: MessageSquare,
  },
  objections: {
    id: "objections",
    title: "Handle Every Objection",
    subtitle: "Turn 'no' and 'let me think about it' into signed applications",
    icon: Shield,
  },
  assessment: {
    id: "assessment",
    title: "Show What You Know",
    subtitle: "Pass the script mastery assessment to unlock Days 3-7",
    icon: GraduationCap,
  },
};

const day2Tasks: Task[] = [
  // Section 1: Compliance & Handbook
  {
    id: "read-handbook",
    title: "Review the Agent Handbook",
    description: "Know Heritage policies, expectations, and how the agency operates",
    type: "read",
    duration: "20 min",
    xp: 75,
    completed: false,
    required: true,
    section: "compliance",
  },
  {
    id: "compliance-intro",
    title: "Learn Compliance Essentials",
    description: "Understand the regulations that protect you, your clients, and your license",
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
    title: "Establish Instant Credibility",
    description: "Learn the exact words that build trust before the prospect can object",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-intro",
  },
  {
    id: "script-rapport",
    title: "Master Rapport Building",
    description: "Use conversation starters that make prospects feel heard and valued",
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
    title: "Ask the Right Questions",
    description: "Use discovery questions that reveal exactly what coverage each client needs",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-fact",
  },
  {
    id: "script-premium-framework",
    title: "Frame the Premium",
    description: "Present coverage options that fit the client's budget without underselling",
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
    title: "Navigate Health Questions",
    description: "Walk clients through underwriting questions with confidence and care",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-application-walkthrough",
    title: "Walk Through the E-App",
    description: "Complete an application step-by-step so nothing gets kicked back",
    type: "video",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-sensitive-info",
    title: "Collect SSN & Banking Info",
    description: "Ask for sensitive details smoothly while keeping the client at ease",
    type: "module",
    duration: "10 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-app",
  },
  {
    id: "script-security-compliance",
    title: "Protect Client Data",
    description: "Follow required data security procedures to stay compliant and build trust",
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
    title: "Master the Close",
    description: "Use assumptive closes that make signing the application feel natural",
    type: "module",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "script-close",
  },
  {
    id: "script-closing-old-policies",
    title: "Replace Existing Coverage",
    description: "Help clients upgrade from outdated policies to better protection",
    type: "module",
    duration: "10 min",
    xp: 75,
    completed: false,
    required: true,
    section: "script-close",
  },
  {
    id: "script-client-checkin",
    title: "Build Client Loyalty",
    description: "Set up follow-up rhythms that generate referrals and repeat business",
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
    title: "Run Your First Sales Call",
    description: "Deliver the full script from intro to close with an AI prospect",
    type: "roleplay",
    duration: "15 min",
    xp: 150,
    completed: false,
    required: true,
    section: "roleplay",
  },
  {
    id: "roleplay-call-2",
    title: "Run a Tougher Scenario",
    description: "Handle a skeptical prospect who pushes back on coverage and price",
    type: "roleplay",
    duration: "15 min",
    xp: 150,
    completed: false,
    required: true,
    section: "roleplay",
  },
  {
    id: "roleplay-feedback",
    title: "Review Your Performance",
    description: "Get AI coaching on what you nailed and where to sharpen up",
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
    title: "Learn the Top 10 Objections",
    description: "Understand why prospects say no and the proven responses that turn them around",
    type: "video",
    duration: "15 min",
    xp: 100,
    completed: false,
    required: true,
    section: "objections",
  },
  {
    id: "objections-practice",
    title: "Drill Objection Responses",
    description: "Practice rebutting live objections with your AI coach until they feel natural",
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
    title: "Script Knowledge Quiz",
    description: "Prove you know every part of the 6-part Heritage script",
    type: "quiz",
    duration: "10 min",
    xp: 100,
    completed: false,
    required: true,
    section: "assessment",
  },
  {
    id: "day2-assessment",
    title: "Day 2 Final Assessment",
    description: "Pass this to prove you are ready for live practice on Days 3-7",
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
        className="space-y-6"
      >
        {/* Hero */}
        <AgentPageHero
          icon={Target}
          title="Day 2: Own the Script"
          subtitle="Learn every part of the Heritage sales call — from opening to close"
        />

        {/* Stats */}
        <motion.section variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={CheckCircle2} value={`${completedCount}/${totalTasks}`} label="Tasks Done" />
            <AgentStatCard icon={Zap} value={totalXP} label="XP Earned" />
            <AgentStatCard icon={Clock} value="~3hrs" label="Time Left" />
            <AgentStatCard icon={Trophy} value={`${progress}%`} label="Complete" />
          </AgentStatCardGrid>
        </motion.section>

        {/* Learning Objectives */}
        <motion.section variants={fadeInUp}>
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
                icon={GraduationCap}
                title="What You Will Master Today"
                subtitle="Complete these and you are ready to get on the phone"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                {[
                  { text: "Deliver the full 6-part script confidently", icon: FileText },
                  { text: "Run a complete sales call start to finish", icon: MessageSquare },
                  { text: "Overcome the top objections prospects raise", icon: Shield },
                  { text: "Pass your script mastery assessment", icon: GraduationCap },
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
        </motion.section>

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
            </motion.section>
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
                  Day 2 — Script Mastered.
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You earned {totalXP} XP and you know the script inside out. Time for live practice and real conversations.
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
                        Start Days 3-7: Live Practice
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
