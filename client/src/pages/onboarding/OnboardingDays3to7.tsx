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
    description: "Learn what to observe and take notes on during upline shadow sessions",
    type: "module",
    duration: "30 min",
    xp: 100,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-call-1",
    title: "Shadow Upline - Live Call #1",
    description: "Observe your upline on a live prospect call. Take notes on script usage and tone",
    type: "call",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-call-2",
    title: "Shadow Upline - Live Call #2",
    description: "Second observation call. Focus on objection handling and closing techniques",
    type: "call",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "shadow-debrief-1",
    title: "Debrief Session",
    description: "Review observations with upline. Discuss what worked and areas for improvement",
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
    title: "Term Life Insurance Deep Dive",
    description: "Comprehensive training on term life products, riders, and underwriting",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "whole-life-deep",
    title: "Whole Life Insurance Mastery",
    description: "Understanding cash value, dividends, and policy loans",
    type: "module",
    duration: "45 min",
    xp: 225,
    completed: false,
    required: true,
    day: 3,
  },
  {
    id: "day3-quiz",
    title: "Day 3 Product Quiz",
    description: "Quick check on term and whole life product knowledge",
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
    title: "Shadow Upline - Live Application",
    description: "Observe your upline completing a full application with a client",
    type: "call",
    duration: "60 min",
    xp: 250,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "shadow-close",
    title: "Shadow Upline - Observe Close",
    description: "Watch how your upline handles the close and secures commitment",
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
    title: "Practice Script in Front of Upline",
    description: "Run through the full script with your upline observing and coaching",
    type: "roleplay",
    duration: "45 min",
    xp: 200,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "upline-feedback-session",
    title: "Upline Feedback Session",
    description: "Receive detailed feedback on your script delivery and areas to improve",
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
    description: "Advanced concepts: caps, floors, participation rates, and illustration strategies",
    type: "video",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
    day: 4,
  },
  {
    id: "advanced-objections",
    title: "Advanced Objection Handling",
    description: "Master the LAER method for complex objections like price and timing concerns",
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
    description: "Quick assessment of today's shadow session and product learning",
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
    title: "Agent Practice Call #1 with Upline",
    description: "Make your first practice call while upline observes and takes notes",
    type: "call",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "agent-call-2",
    title: "Agent Practice Call #2 with Upline",
    description: "Second practice call. Apply feedback from the first call",
    type: "call",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "midday-debrief",
    title: "Mid-Day Debrief",
    description: "Review your practice calls with upline. Identify strengths and areas to improve",
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
    title: "Insurance Compliance Deep Dive",
    description: "Understanding state and federal regulations that govern insurance sales",
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
    description: "Recognize and report suspicious activities and fraud indicators",
    type: "video",
    duration: "30 min",
    xp: 150,
    completed: false,
    required: true,
    day: 5,
  },
  {
    id: "compliance-cert",
    title: "Compliance Certification Exam",
    description: "Complete certification to demonstrate compliance knowledge",
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
    title: "Understanding Communication Styles",
    description: "Learn to adapt your communication to different personality types",
    type: "module",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "phone-skills",
    title: "Phone Skills Mastery",
    description: "Master the art of phone conversations and cold calling",
    type: "video",
    duration: "25 min",
    xp: 125,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification Training",
    description: "Learn to identify and qualify high-potential leads efficiently",
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
    title: "Agent Closes in Front of Upline - Session 1",
    description: "Practice closing a sale with your upline observing and providing real-time guidance",
    type: "call",
    duration: "60 min",
    xp: 350,
    completed: false,
    required: true,
    day: 6,
  },
  {
    id: "presentation-basics",
    title: "Presentation Fundamentals",
    description: "Structure and deliver impactful client presentations",
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
    description: "Demonstrate your communication and closing abilities",
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
    title: "Week 1 Knowledge Review",
    description: "Quick review of all concepts covered in Days 1-6",
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
    description: "Complete a full client interaction from introduction to close",
    type: "simulation",
    duration: "45 min",
    xp: 300,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "agent-close-until-confident",
    title: "Agent Closes in Front of Upline Until Confident",
    description: "Continue practicing closes with upline observation until you feel confident to go solo",
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
    title: "Week 1 Product Certification",
    description: "Comprehensive test on all Heritage Life products - must pass to proceed",
    type: "assessment",
    duration: "30 min",
    xp: 250,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "final-sales-assessment",
    title: "Week 1 Sales Certification",
    description: "Demonstrate mastery of the full sales process from script to close",
    type: "assessment",
    duration: "25 min",
    xp: 250,
    completed: false,
    required: true,
    day: 7,
  },
  {
    id: "week1-complete",
    title: "Week 1 Graduation Ceremony",
    description: "Celebrate your achievements and receive your Week 1 badge",
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
  3: { title: "Shadow Session 1", subtitle: "Observe upline on live calls & product deep dive", icon: Users },
  4: { title: "Shadow Session 2", subtitle: "Shadow application & practice with upline", icon: Target },
  5: { title: "Agent Practice", subtitle: "Make practice calls with upline observation", icon: Phone },
  6: { title: "Building Your Book", subtitle: "Lead qualification & first close with upline", icon: TrendingUp },
  7: { title: "Week 1 Finale", subtitle: "Final assessments & graduation", icon: Trophy },
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
        {/* Header - Hero Card */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Decorative pattern overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <radialGradient id="dotGradient37" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="heroDotsPattern37" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#dotGradient37)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroDotsPattern37)" />
            </svg>
            {/* Floating decorative circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

            <CardContent style={{ padding: GRID.spacing.lg }} className="relative">
              <div className="flex items-start" style={{ gap: GRID.spacing.md }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-md flex items-center justify-center"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    borderRadius: RADIUS.card,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <Calendar style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Days 3-7
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    First Week Deep Dive
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Master product knowledge, sales techniques, compliance, and communication. Complete your first week strong!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Stats Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-3"
          style={{ gap: GRID.spacing.sm }}
        >
          {[
            { value: `${completedCount}/${totalTasks}`, label: "Tasks Complete", icon: ListChecks, color: "violet" },
            { value: `${progress}%`, label: "Week Progress", icon: TrendingUp, color: "purple" },
            { value: totalXP.toLocaleString(), label: "XP Earned", icon: Zap, color: "amber" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="relative overflow-hidden border-0"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card, ...GLASS.css.standard }}
              >
                <CardContent style={{ padding: GRID.spacing.sm }}>
                  <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full",
                        stat.color === "violet" && "bg-violet-100",
                        stat.color === "purple" && "bg-purple-100",
                        stat.color === "amber" && "bg-amber-100"
                      )}
                      style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                    >
                      <stat.icon
                        style={{ width: GRID.spacing.sm + 4, height: GRID.spacing.sm + 4 }}
                        className={cn(
                          stat.color === "violet" && "text-violet-600",
                          stat.color === "purple" && "text-purple-600",
                          stat.color === "amber" && "text-amber-600"
                        )}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: TYPE.meta }} className="text-gray-500">{stat.label}</p>
                      <p style={{ fontSize: TYPE.title }} className="font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

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
                  Day {activeDay} Training
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  {activeDay === "3" && "Master product knowledge and prepare for sales training."}
                  {activeDay === "4" && "Learn sales techniques and prepare for compliance."}
                  {activeDay === "5" && "Complete compliance certification and prepare for communication skills."}
                  {activeDay === "6" && "Develop communication mastery for your final day of Week 1."}
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
                  Congratulations! You've mastered products, sales, compliance, and communication. Ready for real-world application!
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
