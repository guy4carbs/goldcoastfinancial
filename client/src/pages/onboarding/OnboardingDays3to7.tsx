import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { TaskContentModal } from "@/components/onboarding/TaskContentModal";
import { getTaskContent } from "@/data/onboardingTaskContent";
import { useDayProgress } from "@/hooks/useOnboardingProgress";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  BookOpen,
  Video,
  Clock,
  Zap,
  Star,
  GraduationCap,
  Shield,
  Target,
  Users,
  Phone,
  FileText,
  MessageSquare,
  Trophy,
  Sparkles,
  TrendingUp,
  ListChecks,
  ArrowRight,
  Mic,
  Brain,
  ShieldCheck,
  PartyPopper,
  Package,
  Award,
} from "lucide-react";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
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
} from "@/lib/heritageDesignSystem";

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED VISUAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Shimmer Progress Bar with animated gradient shine - Heritage brand colors
function GradientProgress({ value }: { value: number }) {
  // Consistent Heritage gradient: violet → purple → amber
  const gradient = `linear-gradient(90deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[500]} 50%, ${COLORS.accent.amber[500]} 100%)`;

  return (
    <div
      className="w-full bg-gray-100 overflow-hidden relative"
      style={{ height: 10, borderRadius: RADIUS.pill }}
    >
      {/* Animated shimmer overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite',
        }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.easing }}
        className="h-full relative"
        style={{
          background: gradient,
          borderRadius: RADIUS.pill,
        }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%)',
            borderRadius: RADIUS.pill,
          }}
        />
      </motion.div>
    </div>
  );
}

// Floating Particles Component for celebration sections - Enhanced with Framer Motion
function FloatingParticles() {
  const particles = [
    { top: "10%", left: "10%", size: 12, color: "bg-white/30", delay: 0 },
    { top: "20%", right: "15%", size: 8, color: "bg-amber-300/40", delay: 0.5 },
    { bottom: "15%", left: "25%", size: 8, color: "bg-white/25", delay: 1 },
    { bottom: "20%", right: "30%", size: 12, color: "bg-purple-300/30", delay: 0.3 },
    { top: "50%", left: "8%", size: 8, color: "bg-amber-200/35", delay: 0.7 },
    { top: "15%", right: "25%", size: 10, color: "bg-white/20", delay: 1.2 },
    { top: "35%", left: "20%", size: 6, color: "bg-violet-300/25", delay: 0.9 },
    { bottom: "35%", right: "12%", size: 6, color: "bg-amber-400/30", delay: 0.4 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full", p.color)}
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Additional sparkle effects */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full"
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 1.5,
          delay: 0.2,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-amber-300 rounded-full"
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 1.5,
          delay: 0.8,
          repeat: Infinity,
        }}
      />
    </>
  );
}

// SVG Circular Progress Indicator - Heritage brand colors with gradient
function CircularProgress({ value, size = 32, strokeWidth = 3, isComplete = false }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  isComplete?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Unique ID for gradient
  const gradientId = `progress-gradient-${size}-${isComplete ? 'complete' : 'active'}`;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        {/* Gradient for progress - using Heritage design system colors */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isComplete ? (
            <>
              <stop offset="0%" stopColor={COLORS.accent.amber[500]} />
              <stop offset="50%" stopColor={COLORS.accent.amber[400]} />
              <stop offset="100%" stopColor={COLORS.accent.amber[500]} />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={COLORS.primary.violet[500]} />
              <stop offset="50%" stopColor={COLORS.primary.purple[600]} />
              <stop offset="100%" stopColor={COLORS.primary.violet[600]} />
            </>
          )}
        </linearGradient>
        {/* Glow filter */}
        <filter id={`glow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle with subtle pattern */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-gray-200"
        strokeDasharray="2 2"
        opacity={0.5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth - 1}
        fill="none"
        className="text-gray-100"
      />

      {/* Progress circle with gradient and glow */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        filter={value > 0 ? `url(#glow-${gradientId})` : undefined}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />

      {/* Animated pulse for complete state */}
      {isComplete && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 2}
          stroke={COLORS.accent.amber[500]}
          strokeWidth={1}
          fill="none"
          opacity={0.3}
          animate={{
            r: [radius + 2, radius + 4, radius + 2],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </svg>
  );
}

// Extended Task interface to support all task types
interface Task {
  id: string;
  title: string;
  description: string;
  type: "video" | "module" | "quiz" | "practice" | "call" | "read" | "roleplay" | "certification" | "simulation" | "review" | "assessment" | "celebration";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
  day: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY 3: Shadow Upline Session 1 + Product Knowledge Deep Dive
// ═══════════════════════════════════════════════════════════════════════════
const day3Tasks: Task[] = [
  // Morning: Shadow Upline Session 1
  {
    id: "pre-shadow-briefing",
    title: "Pre-Shadow Briefing",
    description: "Know exactly what to watch for before your first upline shadow call.",
    type: "module",
    duration: "30 min",
    xp: 100,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-call-1",
    title: "Shadow Live Call #1",
    description: "Observe your upline closing a real prospect -- note script flow and tone.",
    type: "call",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-call-2",
    title: "Shadow Live Call #2",
    description: "Second live observation -- focus on objection handling and the close.",
    type: "call",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-debrief-1",
    title: "Shadow Debrief",
    description: "Break down both calls with your upline -- what worked and what to steal.",
    type: "review",
    duration: "30 min",
    xp: 100,
    completed: false,
    required: true,
    day: 3,
  },
  // Afternoon: Product Knowledge
  {
    id: "term-life-deep",
    title: "Term Life Deep Dive",
    description: "Master term products, riders, and underwriting guidelines cold.",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "whole-life-deep",
    title: "Whole Life Mastery",
    description: "Learn cash value, dividends, and policy loans inside and out.",
    type: "module",
    duration: "45 min",
    xp: 225,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "day3-quiz",
    title: "Product Knowledge Quiz",
    description: "Prove you can explain term and whole life coverage to any client.",
    type: "quiz",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DAY 4: Shadow Upline Session 2 + Agent Practice
// ═══════════════════════════════════════════════════════════════════════════
const day4Tasks: Task[] = [
  // Morning: Shadow Upline Session 2
  {
    id: "shadow-application",
    title: "Shadow Live Application",
    description: "Watch your upline complete a real application from start to signature.",
    type: "call",
    duration: "60 min",
    xp: 250,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "shadow-close",
    title: "Shadow the Close",
    description: "Study how your upline handles final objections and secures commitment.",
    type: "call",
    duration: "60 min",
    xp: 250,
    completed: false,
    required: true,
    day: 4,
  },
  // Afternoon: Agent Practice
  {
    id: "agent-practice-upline",
    title: "Deliver Full Script Live",
    description: "Run the complete script with your upline coaching in real time.",
    type: "roleplay",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "upline-feedback-session",
    title: "Script Feedback Review",
    description: "Get direct coaching on your delivery, pacing, and confidence.",
    type: "review",
    duration: "30 min",
    xp: 100,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "iul-deep-dive",
    title: "IUL Deep Dive",
    description: "Master caps, floors, participation rates, and illustration strategies.",
    type: "video",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "advanced-objections",
    title: "Crush Common Objections",
    description: "Use the LAER method to handle price, timing, and spouse objections.",
    type: "module",
    duration: "40 min",
    xp: 200,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "day4-assessment",
    title: "Day 4 Skills Check",
    description: "Show what you learned from shadowing and IUL product training.",
    type: "quiz",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
    day: 4,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DAY 5: Agent Practice Calls + Compliance Training
// ═══════════════════════════════════════════════════════════════════════════
const day5Tasks: Task[] = [
  // Morning: Agent Practice Calls with Upline Observation
  {
    id: "agent-call-1",
    title: "Your First Live Call",
    description: "Dial a real prospect while your upline listens and takes notes.",
    type: "call",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "agent-call-2",
    title: "Second Live Call",
    description: "Apply feedback from call one -- sharper opening, stronger close.",
    type: "call",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "midday-debrief",
    title: "Call Performance Debrief",
    description: "Review both calls with your upline -- lock in what's working.",
    type: "review",
    duration: "30 min",
    xp: 100,
    completed: false,
    required: true,
    day: 5,
  },
  // Afternoon: Compliance Deep Dive
  {
    id: "compliance-fundamentals",
    title: "Compliance Essentials",
    description: "Know the state and federal regulations that protect you and your clients.",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "anti-fraud",
    title: "Anti-Fraud & AML Training",
    description: "Spot red flags and know exactly when and how to report them.",
    type: "video",
    duration: "30 min",
    xp: 150,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "compliance-cert",
    title: "Compliance Certification",
    description: "Pass your compliance exam -- required before you can sell.",
    type: "certification",
    duration: "30 min",
    xp: 300,
    completed: false,
    required: true,
    day: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DAY 6: Building Book of Business - Communication, Lead Qualification, First Close
// ═══════════════════════════════════════════════════════════════════════════
const day6Tasks: Task[] = [
  // Morning: Communication Skills
  {
    id: "communication-styles",
    title: "Read Any Client",
    description: "Adapt your pitch to analytical, expressive, driver, and amiable types.",
    type: "module",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "phone-skills",
    title: "Cold Call Mastery",
    description: "Own the first 15 seconds -- hook, qualify, and book the appointment.",
    type: "video",
    duration: "25 min",
    xp: 125,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "lead-qualification",
    title: "Qualify Leads Fast",
    description: "Separate buyers from tire-kickers in under 5 minutes.",
    type: "module",
    duration: "30 min",
    xp: 150,
    completed: false,
    required: true,
    day: 6,
  },
  // Afternoon: Presentation & First Close with Upline
  {
    id: "agent-close-upline-1",
    title: "Close with Upline Watching",
    description: "Run a full close from presentation to signature while your upline coaches.",
    type: "call",
    duration: "60 min",
    xp: 350,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "presentation-basics",
    title: "Nail the Presentation",
    description: "Structure a compelling coverage presentation that drives decisions.",
    type: "video",
    duration: "40 min",
    xp: 200,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "day6-assessment",
    title: "Day 6 Skills Assessment",
    description: "Prove you can qualify, present, and close under pressure.",
    type: "quiz",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
    day: 6,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DAY 7: Week 1 Finale - Review, assessment, and graduation
// ═══════════════════════════════════════════════════════════════════════════
const day7Tasks: Task[] = [
  // Morning: Review & Simulation
  {
    id: "week-review",
    title: "Week 1 Rapid Review",
    description: "Consolidate everything from products to compliance in one session.",
    type: "review",
    duration: "30 min",
    xp: 150,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "full-simulation",
    title: "Full Client Simulation",
    description: "Run a complete sale: intro, needs analysis, presentation, and close.",
    type: "simulation",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "agent-close-until-confident",
    title: "Close Until Confident",
    description: "Keep closing with your upline until you're ready to fly solo.",
    type: "call",
    duration: "90 min",
    xp: 400,
    completed: false,
    required: true,
    day: 7,
  },
  // Afternoon: Week 1 Final Assessments
  {
    id: "final-product-assessment",
    title: "Product Certification Exam",
    description: "Pass the full product exam -- term, whole life, and IUL required.",
    type: "assessment",
    duration: "30 min",
    xp: 250,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "final-sales-assessment",
    title: "Sales Certification Exam",
    description: "Demonstrate mastery of the full sales process from script to close.",
    type: "assessment",
    duration: "25 min",
    xp: 250,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "week1-complete",
    title: "Boot Camp Graduation",
    description: "You earned it -- collect your Week 1 badge and get ready to produce.",
    type: "celebration",
    duration: "10 min",
    xp: 500,
    completed: false,
    required: true,
    day: 7,
  },
];

// Combine all tasks
const allTasks = [...day3Tasks, ...day4Tasks, ...day5Tasks, ...day6Tasks, ...day7Tasks];

// Icon mapping for all task types
const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  module: BookOpen,
  quiz: GraduationCap,
  practice: Target,
  call: Phone,
  read: FileText,
  roleplay: Mic,
  certification: ShieldCheck,
  simulation: Brain,
  review: BookOpen,
  assessment: GraduationCap,
  celebration: PartyPopper,
};

// Color mapping for all task types - Heritage brand palette (violet/purple primary, amber for achievements only)
const typeColors: Record<string, string> = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  practice: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  call: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  read: "bg-violet-50/80 text-violet-500 border border-violet-200/50",
  roleplay: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  certification: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  simulation: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  review: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  assessment: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  celebration: "bg-gradient-to-r from-violet-100/80 to-purple-100/80 text-violet-600 border border-violet-200/50",
};

// Day themes and descriptions - All use Heritage brand colors (violet/purple icons, amber accents)
const dayInfo: Record<number, { title: string; subtitle: string; icon: React.ElementType }> = {
  3: { title: "Shadow & Learn", subtitle: "Watch your upline sell, then master the products", icon: Users },
  4: { title: "Shadow & Practice", subtitle: "Observe the close, then deliver the script yourself", icon: Target },
  5: { title: "Make Live Calls", subtitle: "Dial real prospects with your upline coaching you", icon: Phone },
  6: { title: "Qualify & Close", subtitle: "Build your pipeline and close with upline backup", icon: TrendingUp },
  7: { title: "Certify & Graduate", subtitle: "Pass your exams and earn your Week 1 badge", icon: Trophy },
};

export default function OnboardingDays3to7() {
  // Use persistent progress tracking for days 3-7
  const {
    tasks,
    handleTaskComplete: persistTaskComplete,
    stats,
    isLoaded,
    markDayComplete,
  } = useDayProgress("days-3-7", allTasks);

  const [activeDay, setActiveDay] = useState("3");
  const [weekJustCompleted, setWeekJustCompleted] = useState(false);

  // Task interactivity state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const completedCount = stats.completed;
  const totalTasks = stats.total;
  const progress = stats.progressPercent;
  const totalXP = stats.xpEarned;

  // Check for week 1 completion
  useEffect(() => {
    if (stats.completed === stats.total && stats.total > 0) {
      markDayComplete(7);
      setWeekJustCompleted(true);
    }
  }, [stats.completed, stats.total, markDayComplete]);

  // Open task content modal
  const openTaskModal = useCallback((task: Task) => {
    setActiveTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Close task content modal
  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setActiveTask(null);
  }, []);

  // Handle task completion from modal
  const handleTaskComplete = useCallback((taskId: string) => {
    persistTaskComplete(taskId);
  }, [persistTaskComplete]);

  // Get content for active task
  const activeTaskContent = activeTask ? getTaskContent(activeTask.id) : null;

  const getDayProgress = (day: number) => {
    const dt = tasks.filter(t => t.day === day);
    const dc = dt.filter(t => t.completed).length;
    return Math.round((dc / dt.length) * 100);
  };

  const getDayXP = (day: number) => {
    return tasks.filter(t => t.day === day && t.completed).reduce((sum, t) => sum + t.xp, 0);
  };

  const goToNextDay = () => {
    const currentDay = parseInt(activeDay);
    if (currentDay < 7) {
      setActiveDay((currentDay + 1).toString());
    }
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
        <AgentPageHero icon={Calendar} title="Days 3-7: Boot Camp" subtitle="Shadow top producers, master products, and close your first sale" />

        <motion.section variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard icon={CheckCircle2} value={`${completedCount}/${totalTasks}`} label="Tasks Complete" />
            <AgentStatCard icon={Zap} value={totalXP.toLocaleString()} label="XP Earned" />
            <AgentStatCard icon={Clock} value="~2hrs" label="Est. Time" />
            <AgentStatCard icon={Trophy} value={`${progress}%`} label="Progress" />
          </AgentStatCardGrid>
        </motion.section>

        {/* Day Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList
              className="grid grid-cols-5 bg-gray-100/80 backdrop-blur-sm p-1.5"
              style={{ marginBottom: GRID.spacing.md, borderRadius: RADIUS.button, height: GRID.spacing.xxxl }}
            >
              {[3, 4, 5, 6, 7].map(day => {
                const info = dayInfo[day];
                const dayProgress = getDayProgress(day);
                const isComplete = dayProgress === 100;
                return (
                  <TabsTrigger
                    key={day}
                    value={day.toString()}
                    className={cn(
                      "relative font-medium transition-all flex items-center justify-center gap-2 group",
                      "data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/15",
                      "hover:bg-white/50",
                      isComplete && "text-amber-600"
                    )}
                    style={{ borderRadius: RADIUS.button - 4, height: '100%' }}
                  >
                    {/* Active indicator line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500 rounded-full transition-all duration-300 group-data-[state=active]:w-8 group-data-[state=inactive]:w-0" />

                    {/* Circular Progress Indicator - Heritage colors */}
                    <div className="relative flex items-center justify-center">
                      <CircularProgress
                        value={dayProgress}
                        size={28}
                        strokeWidth={3}
                        isComplete={isComplete}
                      />
                      {isComplete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </motion.div>
                      ) : (
                        <span
                          className="text-[10px] font-bold absolute"
                          style={{
                            color: dayProgress > 0 ? COLORS.primary.violet[500] : COLORS.gray[400],
                            textShadow: dayProgress > 0 ? `0 0 8px ${COLORS.primary.violet[500]}4d` : 'none'
                          }}
                        >
                          {day}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-semibold leading-tight group-data-[state=active]:text-gray-900 group-data-[state=inactive]:text-gray-600">Day {day}</span>
                      <span className={cn(
                        "text-[10px] leading-tight hidden sm:block transition-colors",
                        isComplete ? "text-amber-500 font-medium" : "text-gray-400"
                      )}>
                        {isComplete ? "✓ Done" : `${dayProgress}%`}
                      </span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {[3, 4, 5, 6, 7].map(day => {
              const info = dayInfo[day];
              const DayIcon = info.icon;
              const dayTaskList = tasks.filter(t => t.day === day);

              return (
                <TabsContent key={day} value={day.toString()}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: MOTION.duration.fast }}
                    className="flex flex-col"
                    style={{ gap: GRID.spacing.md }}
                  >
                    {/* Day Header Card - Heritage brand colors */}
                    <Card
                      className="border-0 overflow-hidden relative"
                      style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <div
                        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, transparent 50%, ${COLORS.primary.violet[50]} 50%)`,
                          opacity: 0.6,
                        }}
                      />
                      <CardHeader style={{ padding: GRID.spacing.md }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                            {/* Heritage gradient icon: violet → purple → amber */}
                            <div
                              className="flex items-center justify-center bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500"
                              style={{
                                width: GRID.spacing.xxl,
                                height: GRID.spacing.xxl,
                                borderRadius: RADIUS.button,
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                              }}
                            >
                              <DayIcon className="w-6 h-6 text-amber-200" />
                            </div>
                            <div>
                              <CardTitle style={{ fontSize: TYPE.title }}>Day {day}: {info.title}</CardTitle>
                              <CardDescription style={{ fontSize: TYPE.meta }}>{info.subtitle}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                getDayProgress(day) === 100
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-gray-50 border-gray-200"
                              )}
                            >
                              {getDayProgress(day) === 100 && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {getDayProgress(day)}%
                            </Badge>
                            <p style={{ fontSize: TYPE.caption }} className="text-gray-500 mt-1">
                              {getDayXP(day)} / {dayTaskList.reduce((s, t) => s + t.xp, 0)} XP
                            </p>
                          </div>
                        </div>
                        {/* Progress Bar with Shimmer - Heritage gradient */}
                        <div style={{ marginTop: GRID.spacing.sm }}>
                          <GradientProgress value={getDayProgress(day)} />
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Task List */}
                    <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                      <CardContent style={{ padding: GRID.spacing.md, gap: GRID.spacing.sm }} className="flex flex-col">
                        {dayTaskList.map((task, index) => {
                          const Icon = typeIcons[task.type] || BookOpen;
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04, duration: MOTION.duration.fast }}
                              whileHover={{
                                y: MOTION.hover.y,
                                scale: MOTION.hover.scale,
                                transition: { duration: MOTION.duration.hover }
                              }}
                              className={cn(
                                "flex items-start border transition-all cursor-pointer group relative overflow-hidden",
                                task.completed
                                  ? "bg-gradient-to-r from-violet-50/80 via-purple-50/60 to-violet-50/40 border-violet-200/50"
                                  : "bg-white border-gray-200/80 hover:border-violet-300 hover:shadow-lg"
                              )}
                              style={{
                                gap: GRID.spacing.sm,
                                padding: GRID.spacing.sm,
                                borderRadius: RADIUS.button,
                                boxShadow: task.completed ? 'none' : SHADOW.level1,
                              }}
                            >
                              {/* Hover gradient overlay */}
                              {!task.completed && (
                                <div
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                  style={{
                                    background: 'linear-gradient(90deg, rgba(124,58,237,0.03) 0%, rgba(147,51,234,0.03) 50%, rgba(124,58,237,0.01) 100%)',
                                  }}
                                />
                              )}

                              <button
                                onClick={() => toggleTask(task.id)}
                                className="mt-0.5 flex-shrink-0 relative z-10 transition-transform hover:scale-110"
                              >
                                {task.completed ? (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  >
                                    <CheckCircle2
                                      style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                                      className="text-amber-500 drop-shadow-sm"
                                    />
                                  </motion.div>
                                ) : (
                                  <Circle
                                    style={{ width: GRID.spacing.md + 4, height: GRID.spacing.md + 4 }}
                                    className="text-gray-300 group-hover:text-violet-400 transition-colors duration-200"
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
                                  {task.required && !task.completed && (
                                    <Badge variant="outline" className="bg-amber-50/80 text-amber-700 border-amber-200/50 text-xs">
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
                                <div className="flex flex-wrap items-center" style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}>
                                  <span
                                    className={cn("flex items-center gap-1 font-medium", typeColors[task.type])}
                                    style={{ padding: `4px 8px`, borderRadius: RADIUS.pill }}
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
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ duration: MOTION.duration.hover }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => openTaskModal(task)}
                                    className="flex-shrink-0 shadow-md text-white relative overflow-hidden group/btn bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                                    style={{ borderRadius: RADIUS.button }}
                                  >
                                    {/* Shimmer effect on hover */}
                                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                                      <span
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        style={{
                                          animation: 'shimmer 1.5s infinite',
                                          transform: 'skewX(-15deg)',
                                        }}
                                      />
                                    </span>
                                    <span className="relative flex items-center">
                                      {task.type === "video" && <Play className="w-3 h-3 mr-1" />}
                                      {task.type === "roleplay" && <Mic className="w-3 h-3 mr-1" />}
                                      {task.type === "simulation" && <Target className="w-3 h-3 mr-1" />}
                                      {task.type === "quiz" && <GraduationCap className="w-3 h-3 mr-1" />}
                                      {task.type === "video" ? "Watch" : task.type === "call" ? "Schedule" : task.type === "roleplay" ? "Practice" : task.type === "simulation" ? "Start Sim" : task.type === "quiz" ? "Take Quiz" : "Start"}
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
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>

        {/* Continue to Next Day - Days 3-6 */}
        {activeDay !== "7" && (
          <motion.div
            key={`continue-day-${activeDay}`}
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
              {/* Floating particles */}
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
                  <Award style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} />
                </motion.div>
                <h3
                  style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                  className="font-bold tracking-tight text-white"
                >
                  Day {activeDay} Complete
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  {activeDay === "3" && "Products locked in. Tomorrow you shadow the close and practice your script."}
                  {activeDay === "4" && "Script sharpened. Tomorrow you make live calls with your upline."}
                  {activeDay === "5" && "Compliance certified. Tomorrow you qualify leads and close for real."}
                  {activeDay === "6" && "Pipeline started. Tomorrow you certify and graduate from boot camp."}
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <motion.div
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  >
                    <Button
                      className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                      style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      onClick={goToNextDay}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continue to Day {parseInt(activeDay) + 1}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Week Complete - Day 7 Only */}
        {activeDay === "7" && (
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
              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + (i % 3) * 2,
                    height: 4 + (i % 3) * 2,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.4)',
                    top: `${10 + (i * 12) % 80}%`,
                    left: `${8 + (i * 14) % 84}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + (i * 0.3),
                    repeat: Infinity,
                    delay: i * 0.15,
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
                  className="bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto relative"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    marginBottom: GRID.spacing.md,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Trophy style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-300" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                  </motion.div>
                </motion.div>
                <h3
                  style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                  className="font-bold tracking-tight text-white"
                >
                  Week 1 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You know the products, you've passed compliance, and you can close. Time to build your book of business.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    {totalXP.toLocaleString()} XP
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {totalTasks} Tasks
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1.5">
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    5 Days
                  </Badge>
                </div>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/days-8-30">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Continue to Days 8-30
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Persistent Navigation to Days 8-30 */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.hero, background: COLORS.gradients.heroWithAccent, boxShadow: SHADOW.hero }}>
            <CardContent className="text-center relative" style={{ padding: GRID.spacing.lg }}>
              <h3 className="font-bold tracking-tight text-white" style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}>
                Launch into Production
              </h3>
              <p className="text-white/90 max-w-md mx-auto" style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }}>
                Boot camp is done. Start making calls, booking appointments, and writing AP.
              </p>
              <Link href="/agents/onboarding/days-8-30">
                <Button className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg" style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}>
                  Continue to Days 8-30
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Task Content Modal - Handles all interactive task content */}
      <TaskContentModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onComplete={handleTaskComplete}
        task={activeTask}
        content={activeTaskContent}
      />
    </OnboardingLoungeLayout>
  );
}
