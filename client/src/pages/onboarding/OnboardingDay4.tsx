import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  MessageSquare,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  BookOpen,
  Video,
  Clock,
  Zap,
  ListChecks,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  Phone,
  Mail,
  Calendar,
  Target,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Shield,
  DollarSign,
  HelpCircle,
  Mic,
  GraduationCap,
  Brain,
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
import {
  LicensingChecklist,
  VideoTutorialsGrid,
  LICENSING_STEPS,
  VIDEO_TUTORIALS,
  type VideoTutorial,
} from "@/components/onboarding/LoungeComponents";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "video" | "module" | "quiz" | "read" | "practice" | "roleplay";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
}

const day4Tasks: Task[] = [
  {
    id: "sales-methodology",
    title: "Heritage Sales Methodology",
    description: "Learn our proven 5-step sales process from initial contact to close",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: true,
    required: true,
  },
  {
    id: "discovery-questions",
    title: "Mastering Discovery Questions",
    description: "Learn the art of asking questions that uncover client needs",
    type: "video",
    duration: "30 min",
    xp: 150,
    completed: true,
    required: true,
  },
  {
    id: "objection-handling",
    title: "Objection Handling Framework",
    description: "Turn objections into opportunities with our LAER method",
    type: "module",
    duration: "40 min",
    xp: 200,
    completed: true,
    required: true,
  },
  {
    id: "common-objections",
    title: "Top 10 Common Objections",
    description: "Practice responding to the most frequent client objections",
    type: "practice",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
  },
  {
    id: "ai-roleplay-intro",
    title: "AI Avatar Roleplay Session",
    description: "Practice your pitch with an AI-powered client simulation",
    type: "roleplay",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
  },
  {
    id: "closing-techniques",
    title: "Ethical Closing Techniques",
    description: "Learn to close confidently without being pushy",
    type: "video",
    duration: "25 min",
    xp: 125,
    completed: false,
    required: false,
  },
  {
    id: "day4-assessment",
    title: "Sales Skills Assessment",
    description: "Demonstrate your sales knowledge and technique",
    type: "quiz",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
  },
];

const typeIcons = {
  video: Video,
  module: BookOpen,
  quiz: GraduationCap,
  read: FileText,
  practice: Target,
  roleplay: Mic,
};

const typeColors = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  read: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  practice: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  roleplay: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
};

// Common objections data
const COMMON_OBJECTIONS = [
  {
    id: "too-expensive",
    objection: "It's too expensive",
    response: "I understand budget is a concern. Let me show you how this investment protects your family's financial future...",
    category: "price",
    icon: DollarSign,
    color: COLORS.accent.amber[500],
  },
  {
    id: "think-about-it",
    objection: "I need to think about it",
    response: "Absolutely, this is an important decision. What specific aspects would you like to think over?",
    category: "delay",
    icon: Clock,
    color: COLORS.primary.purple[500],
  },
  {
    id: "spouse",
    objection: "I need to talk to my spouse",
    response: "That makes sense. Would it help if we scheduled a time when both of you can be present?",
    category: "delay",
    icon: Users,
    color: COLORS.primary.violet[500],
  },
  {
    id: "already-covered",
    objection: "I already have insurance",
    response: "That's great that you've planned ahead. When did you last review your coverage to ensure it still meets your needs?",
    category: "existing",
    icon: Shield,
    color: COLORS.semantic.success,
  },
  {
    id: "not-now",
    objection: "Now is not a good time",
    response: "I understand timing is important. What would need to change for this to be the right time?",
    category: "delay",
    icon: Calendar,
    color: COLORS.semantic.error,
  },
];

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

// Sales Process Steps
const SALES_STEPS = [
  { step: 1, name: "Connect", description: "Build rapport and establish trust", icon: Users },
  { step: 2, name: "Discover", description: "Ask questions to understand needs", icon: HelpCircle },
  { step: 3, name: "Present", description: "Recommend tailored solutions", icon: Target },
  { step: 4, name: "Address", description: "Handle objections professionally", icon: MessageSquare },
  { step: 5, name: "Close", description: "Guide to a confident decision", icon: ThumbsUp },
];

export default function OnboardingDay4() {
  const [tasks, setTasks] = useState(day4Tasks);
  const [completedLicensingSteps, setCompletedLicensingSteps] = useState<string[]>([
    'step-1', 'step-2', 'step-3', 'step-4', 'step-5'
  ]);
  const [expandedObjection, setExpandedObjection] = useState<string | null>("too-expensive");
  const [activeStep, setActiveStep] = useState(3);

  const toggleLicensingStep = (stepId: string) => {
    setCompletedLicensingSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleWatchVideo = (video: VideoTutorial) => {
    toast.info('Opening video', { description: video.title });
  };

  // Last licensing step for Day 4
  const day4LicensingSteps = LICENSING_STEPS.slice(5, 7);

  // Sales-focused videos
  const day4Videos = VIDEO_TUTORIALS.filter(v => v.category === 'sales' || v.category === 'advanced');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = Math.round((completedCount / totalTasks) * 100);
  const totalXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
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
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
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
                  <MessageSquare style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Day 4 of 30
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Sales Mastery
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Learn proven sales techniques and objection handling strategies. Practice with AI-powered roleplay sessions.
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

        {/* Sales Process Steps */}
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
                icon={Target}
                title="Heritage Sales Process"
                subtitle="Our proven 5-step methodology"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div
                  className="absolute top-6 left-0 right-0 h-1 bg-gray-100"
                  style={{ zIndex: 0 }}
                />
                <motion.div
                  className="absolute top-6 left-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.primary.violet[500]}, ${COLORS.primary.purple[500]})`,
                    zIndex: 1,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeStep - 1) / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />

                {SALES_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  const isActive = step.step === activeStep;
                  const isCompleted = step.step < activeStep;
                  return (
                    <motion.div
                      key={step.step}
                      className="flex flex-col items-center relative z-10"
                      style={{ flex: 1 }}
                      whileHover={{ y: MOTION.hover.y }}
                      onClick={() => setActiveStep(step.step)}
                    >
                      <motion.div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all",
                          isActive
                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg"
                            : isCompleted
                            ? "bg-violet-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        )}
                        whileHover={{ scale: 1.1 }}
                        style={{
                          boxShadow: isActive ? `0 4px 20px ${COLORS.primary.violet[500]}50` : undefined,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </motion.div>
                      <span
                        className={cn(
                          "font-semibold mt-2",
                          isActive ? "text-violet-600" : isCompleted ? "text-violet-600" : "text-gray-400"
                        )}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {step.name}
                      </span>
                      <span
                        className="text-gray-400 text-center hidden sm:block"
                        style={{ fontSize: TYPE.micro, maxWidth: 100 }}
                      >
                        {step.description}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Objection Handling Practice */}
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
                icon={AlertCircle}
                title="Common Objections"
                subtitle="Practice handling these objections"
                badge={
                  <Badge
                    className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50 font-medium"
                    style={{ padding: '6px 12px' }}
                  >
                    <Brain className="w-3.5 h-3.5 mr-1.5" />
                    LAER Method
                  </Badge>
                }
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                {COMMON_OBJECTIONS.map((obj, i) => {
                  const ObjIcon = obj.icon;
                  const isExpanded = expandedObjection === obj.id;
                  return (
                    <motion.div
                      key={obj.id}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      onClick={() => setExpandedObjection(isExpanded ? null : obj.id)}
                      className={cn(
                        "cursor-pointer border transition-all overflow-hidden",
                        isExpanded
                          ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
                          : "bg-white border-gray-200 hover:border-violet-200"
                      )}
                      style={{
                        borderRadius: RADIUS.button,
                        boxShadow: isExpanded ? '0 4px 20px rgba(124, 58, 237, 0.15)' : SHADOW.level1,
                      }}
                    >
                      <div style={{ padding: GRID.spacing.sm }}>
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              width: GRID.spacing.lg + 4,
                              height: GRID.spacing.lg + 4,
                              borderRadius: RADIUS.button / 2,
                              background: `linear-gradient(135deg, ${obj.color}, ${obj.color}dd)`,
                            }}
                          >
                            <ObjIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                              <span className="font-medium text-gray-900" style={{ fontSize: TYPE.body }}>
                                "{obj.objection}"
                              </span>
                            </div>
                          </div>
                          <Badge
                            className="bg-gray-100 text-gray-500 capitalize"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {obj.category}
                          </Badge>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            style={{ marginTop: GRID.spacing.sm }}
                          >
                            <div
                              className="border-t border-violet-100 pt-3 flex items-start"
                              style={{ gap: GRID.spacing.sm }}
                            >
                              <ThumbsUp className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                  Recommended Response:
                                </span>
                                <p className="text-gray-700 mt-1" style={{ fontSize: TYPE.body }}>
                                  "{obj.response}"
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Section */}
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
                icon={ListChecks}
                title="Day 4 Tasks"
                subtitle="Master sales techniques and roleplay"
                badge={
                  <Badge
                    className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200/50 font-medium"
                    style={{ padding: '6px 12px' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {completedCount} of {totalTasks}
                  </Badge>
                }
              />
              <GradientProgress value={progress} />
            </CardHeader>

            <CardContent
              style={{ padding: GRID.spacing.md, paddingTop: 0, gap: GRID.spacing.sm }}
              className="flex flex-col"
            >
              {tasks.map((task, index) => {
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
                          className={cn(
                            "flex-shrink-0 shadow-md text-white",
                            task.type === "roleplay"
                              ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
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
                          ) : task.type === "practice" ? (
                            <>
                              <Target className="w-3.5 h-3.5 mr-1.5" />
                              Practice
                            </>
                          ) : task.type === "roleplay" ? (
                            <>
                              <Mic className="w-3.5 h-3.5 mr-1.5" />
                              Start Roleplay
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 mr-1.5" />
                              Start
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Tutorials Section */}
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
                icon={Video}
                title="Sales Training Videos"
                subtitle="Advanced techniques from top performers"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <VideoTutorialsGrid videos={day4Videos} onWatch={handleWatchVideo} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Licensing Steps Section */}
        <motion.div variants={fadeInUp}>
          <LicensingChecklist
            steps={day4LicensingSteps}
            completedSteps={completedLicensingSteps}
            onToggleStep={toggleLicensingStep}
          />
        </motion.div>

        {/* Continue to Next Day - Always visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
        >
            <Card
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white border-0 relative overflow-hidden"
              style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute top-4 left-8 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
              <div className="absolute top-12 right-16 w-2 h-2 bg-amber-300/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-8 left-1/4 w-2 h-2 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-12 right-1/3 w-3 h-3 bg-purple-300/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />

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
                  Day 4 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You have mastered sales techniques and earned {totalXP} XP. Time for compliance training!
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/day-5">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        Continue to Day 5
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
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
    </OnboardingLoungeLayout>
  );
}
