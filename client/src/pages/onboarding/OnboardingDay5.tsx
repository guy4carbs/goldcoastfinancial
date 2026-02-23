import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  Scale,
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
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Lock,
  UserCheck,
  FileSearch,
  Gavel,
  ShieldCheck,
  AlertCircle,
  CheckSquare,
  XCircle,
  GraduationCap,
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

interface Task {
  id: string;
  title: string;
  description: string;
  type: "video" | "module" | "quiz" | "read" | "certification";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
}

const day5Tasks: Task[] = [
  {
    id: "compliance-fundamentals",
    title: "Insurance Compliance Fundamentals",
    description: "Understanding state and federal regulations that govern insurance sales",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: true,
    required: true,
  },
  {
    id: "ethics-training",
    title: "Ethics in Insurance Sales",
    description: "Learn the ethical standards and fiduciary responsibilities",
    type: "module",
    duration: "40 min",
    xp: 175,
    completed: true,
    required: true,
  },
  {
    id: "anti-fraud",
    title: "Anti-Fraud & Anti-Money Laundering",
    description: "Recognize and report suspicious activities and fraud indicators",
    type: "video",
    duration: "30 min",
    xp: 150,
    completed: true,
    required: true,
  },
  {
    id: "privacy-hipaa",
    title: "Privacy & HIPAA Compliance",
    description: "Protecting client information and health data requirements",
    type: "module",
    duration: "35 min",
    xp: 175,
    completed: false,
    required: true,
  },
  {
    id: "suitability",
    title: "Suitability & Best Interest Standards",
    description: "Ensuring recommendations meet client needs and regulatory standards",
    type: "read",
    duration: "25 min",
    xp: 125,
    completed: false,
    required: true,
  },
  {
    id: "documentation",
    title: "Documentation Requirements",
    description: "Proper record-keeping and documentation practices",
    type: "module",
    duration: "30 min",
    xp: 125,
    completed: false,
    required: false,
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
  },
];

const typeIcons = {
  video: Video,
  module: BookOpen,
  quiz: GraduationCap,
  read: FileText,
  certification: ShieldCheck,
};

const typeColors = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  read: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  certification: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
};

// Compliance topics
const COMPLIANCE_TOPICS = [
  {
    id: "regulations",
    title: "State & Federal Regulations",
    icon: Gavel,
    description: "NAIC model regulations, state insurance codes, federal requirements",
    status: "completed",
    color: COLORS.primary.violet[500],
  },
  {
    id: "ethics",
    title: "Professional Ethics",
    icon: Scale,
    description: "Agent conduct standards, fiduciary duty, conflicts of interest",
    status: "completed",
    color: COLORS.primary.purple[500],
  },
  {
    id: "privacy",
    title: "Privacy & Data Security",
    icon: Lock,
    description: "HIPAA, GLBA, state privacy laws, data protection",
    status: "in-progress",
    color: COLORS.accent.amber[500],
  },
  {
    id: "aml",
    title: "Anti-Money Laundering",
    icon: Eye,
    description: "Suspicious activity reporting, customer due diligence",
    status: "pending",
    color: COLORS.semantic.error,
  },
];

// Do's and Don'ts
const DOS_AND_DONTS = {
  dos: [
    "Always verify client identity before discussing policy details",
    "Document all client interactions and recommendations",
    "Disclose all material facts about products",
    "Recommend products suitable for client's needs and financial situation",
    "Maintain current knowledge of regulations",
    "Report suspicious activities immediately",
  ],
  donts: [
    "Never guarantee investment returns on variable products",
    "Don't sign applications on behalf of clients",
    "Avoid using high-pressure sales tactics",
    "Never rebate premiums or offer inducements",
    "Don't misrepresent policy terms or benefits",
    "Never share client information without authorization",
  ],
};

// Section header component
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

export default function OnboardingDay5() {
  const [tasks, setTasks] = useState(day5Tasks);
  const [expandedTopic, setExpandedTopic] = useState<string | null>("privacy");

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
                  <Scale style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Day 5 of 30
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Compliance & Ethics
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Master the regulatory requirements and ethical standards that protect you and your clients.
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

        {/* Compliance Topics Progress */}
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
                icon={Shield}
                title="Compliance Training Progress"
                subtitle="Complete all required compliance modules"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                {COMPLIANCE_TOPICS.map((topic, i) => {
                  const TopicIcon = topic.icon;
                  const isExpanded = expandedTopic === topic.id;
                  return (
                    <motion.div
                      key={topic.id}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
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
                              background: `linear-gradient(135deg, ${topic.color}, ${topic.color}dd)`,
                            }}
                          >
                            <TopicIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900" style={{ fontSize: TYPE.body }}>
                              {topic.title}
                            </h3>
                            <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              {topic.description}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              topic.status === "completed"
                                ? "bg-violet-100 text-violet-700 border-violet-200"
                                : topic.status === "in-progress"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                            style={{ fontSize: TYPE.micro }}
                          >
                            {topic.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {topic.status === "in-progress" && <Clock className="w-3 h-3 mr-1" />}
                            {topic.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Do's and Don'ts */}
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
                icon={AlertTriangle}
                title="Compliance Quick Reference"
                subtitle="Essential do's and don'ts for insurance agents"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid md:grid-cols-2" style={{ gap: GRID.spacing.md }}>
                {/* Do's Column */}
                <div
                  className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/30 overflow-hidden"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div
                    className="bg-violet-500 text-white px-4 py-2 flex items-center gap-2"
                    style={{ fontSize: TYPE.body }}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="font-semibold">DO</span>
                  </div>
                  <div style={{ padding: GRID.spacing.sm }}>
                    <ul style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                      {DOS_AND_DONTS.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Don'ts Column */}
                <div
                  className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/30 overflow-hidden"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div
                    className="bg-red-500 text-white px-4 py-2 flex items-center gap-2"
                    style={{ fontSize: TYPE.body }}
                  >
                    <Ban className="w-4 h-4" />
                    <span className="font-semibold">DON'T</span>
                  </div>
                  <div style={{ padding: GRID.spacing.sm }}>
                    <ul style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                      {DOS_AND_DONTS.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                title="Day 5 Tasks"
                subtitle="Complete compliance training modules"
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
                          {task.type === "certification" ? "Certification" : task.type.charAt(0).toUpperCase() + task.type.slice(1)}
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
                            task.type === "certification"
                              ? "bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
                          {task.type === "video" ? (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
                              Watch
                            </>
                          ) : task.type === "certification" ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                              Get Certified
                            </>
                          ) : task.type === "read" ? (
                            <>
                              <FileText className="w-3.5 h-3.5 mr-1.5" />
                              Read
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

        {/* Certification Badge Preview */}
        <motion.div variants={fadeInUp}>
          <Card
            className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent style={{ padding: GRID.spacing.lg }} className="text-center">
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-violet-500 to-amber-500 text-white rounded-full flex items-center justify-center mb-4"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <ShieldCheck style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} />
                </motion.div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.xs }}>
                  Compliance Certification
                </h3>
                <p className="text-gray-600 max-w-md" style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }}>
                  Complete all compliance modules to earn your Heritage Life Compliance Certification badge.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-violet-100 text-violet-700 border border-violet-200">
                    <Zap className="w-3 h-3 mr-1" />
                    +300 XP Bonus
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                    <Award className="w-3 h-3 mr-1" />
                    Profile Badge
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  Day 5 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You are now compliance certified! Earned {totalXP} XP. Ready for presentation skills!
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/day-6">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        Continue to Day 6
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
