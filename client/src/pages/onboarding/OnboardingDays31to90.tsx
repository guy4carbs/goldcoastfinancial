import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TaskContentModal } from "@/components/onboarding/TaskContentModal";
import { getTaskContent } from "@/data/onboardingTaskContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  CalendarRange,
  Lock,
  Target,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  DollarSign,
  Star,
  Zap,
  CheckCircle2,
  ArrowRight,
  Trophy,
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

// ─────────────────────────────────────────────────────────────
// SectionHeader - Consistent header component with gradient icon
// ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient?: string;
}

function SectionHeader({ icon: Icon, title, subtitle, gradient = "from-violet-500 to-purple-600" }: SectionHeaderProps) {
  return (
    <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.xs }}>
      <div
        className={`bg-gradient-to-br ${gradient} flex items-center justify-center`}
        style={{
          width: GRID.spacing.xl,
          height: GRID.spacing.xl,
          borderRadius: RADIUS.button,
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}
      >
        <Icon style={{ width: GRID.spacing.sm + 4, height: GRID.spacing.sm + 4 }} className="text-amber-200" />
      </div>
      <div>
        <CardTitle style={{ fontSize: TYPE.title }}>{title}</CardTitle>
        <CardDescription style={{ fontSize: TYPE.meta }}>{subtitle}</CardDescription>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GradientProgress - Shimmer progress bar component
// ─────────────────────────────────────────────────────────────
interface GradientProgressProps {
  value: number;
  className?: string;
}

function GradientProgress({ value, className }: GradientProgressProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        height: 8,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.gray[200],
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute inset-y-0 left-0"
        style={{
          background: `linear-gradient(90deg, ${COLORS.primary.violet[500]}, ${COLORS.primary.purple[500]}, ${COLORS.accent.amber[500]})`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
          borderRadius: RADIUS.pill,
        }}
      />
    </div>
  );
}

interface MonthGoal {
  id: string;
  month: number;
  title: string;
  description: string;
  targets: { label: string; value: string }[];
  skills: string[];
  certification: string;
  xpReward: number;
}

const monthGoals: MonthGoal[] = [
  {
    id: "month-2",
    month: 2,
    title: "Building Your Foundation",
    description: "Establish your client base and develop consistent activity habits",
    targets: [
      { label: "Client Contacts", value: "50+" },
      { label: "Presentations", value: "10+" },
      { label: "Applications", value: "3-5" },
    ],
    skills: ["Pipeline management", "Time blocking", "Follow-up sequences", "Referral requests"],
    certification: "Client Engagement Certification",
    xpReward: 2000,
  },
  {
    id: "month-3",
    month: 3,
    title: "Scaling Your Production",
    description: "Increase your production and refine your personal sales style",
    targets: [
      { label: "Client Contacts", value: "75+" },
      { label: "Presentations", value: "15+" },
      { label: "Applications", value: "5-8" },
    ],
    skills: ["Advanced closing", "Multi-policy sales", "Center of influence", "Team collaboration"],
    certification: "Sales Professional Certification",
    xpReward: 2500,
  },
];

// Type badge colors with borders
const typeColors: Record<string, string> = {
  core: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  advanced: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  practical: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
};

export default function OnboardingDays31to90() {
  const isLocked = false; // Unlocked for access
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

  // For demo - track progress (would come from API in production)
  const progress: number = 0;

  // Close modal
  const handleCloseModal = () => {
    setActiveTask(null);
    setActiveTaskContent(null);
  };

  // Handle task completion from modal
  const handleTaskComplete = (taskId: string) => {
    handleCloseModal();
  };

  // Handle skill/activity click to open modal
  const handleSkillClick = (skillName: string, category: string = "core") => {
    const taskId = skillName.toLowerCase().replace(/\s+/g, '-');
    const taskObj = {
      id: taskId,
      title: skillName,
      description: `Master ${skillName.toLowerCase()} to enhance your production`,
      type: category === "practical" ? "simulation" : "module",
      duration: "20 min",
      xp: 150,
      completed: false,
      required: true,
      day: 45,
    };

    const contentData = getTaskContent(taskId);
    if (contentData) {
      setActiveTask(taskObj);
      setActiveTaskContent(contentData);
    }
  };

  return (
    <OnboardingLoungeLayout>
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ gap: GRID.spacing.md }}
        className="flex flex-col"
      >
        {/* ══════════════════════════════════════════════════════════════
            Hero Card - Radial Gradient Dots Pattern + Large Icon
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Radial Gradient Dots Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <radialGradient id="dotGradient31" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="heroDotsPattern31" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#dotGradient31)" />
                </pattern>
                <radialGradient id="heroFade31" cx="70%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="heroMask31">
                  <rect width="100%" height="100%" fill="url(#heroFade31)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroDotsPattern31)" mask="url(#heroMask31)" />
            </svg>

            {/* Blur Circles for Depth */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-300/15 rounded-full blur-xl" />

            <CardContent style={{ padding: GRID.spacing.lg }} className="relative">
              <div className="flex items-start" style={{ gap: GRID.spacing.md }}>
                {/* Large Icon Container - GRID.spacing.xxxxl (80px) */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    borderRadius: RADIUS.card,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <CalendarRange style={{ width: GRID.spacing.xxl, height: GRID.spacing.xxl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                    style={{ marginBottom: GRID.spacing.xs }}
                  >
                    Days 31-90
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Building Momentum
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Put your training into action. Build your client base and develop your personal sales style.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Progress Stats Grid - Glass Morphism Cards
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-3"
          style={{ gap: GRID.spacing.sm }}
        >
          {[
            { label: "Phase Progress", value: "0%", icon: Target, color: "violet" },
            { label: "Skills Mastered", value: "0 / 8", icon: TrendingUp, color: "purple" },
            { label: "XP Available", value: "4,500", icon: Zap, color: "amber" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  ...GLASS.css.standard,
                }}
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

        {/* ══════════════════════════════════════════════════════════════
            Weekly Check-In System - Required for accountability
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-white relative overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${COLORS.accent.amber[50]} 50%)`,
                opacity: 0.6,
              }}
            />

            <CardHeader>
              <SectionHeader
                icon={CalendarRange}
                title="Weekly Check-Ins"
                subtitle="Review your progress with your upline each week"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-4"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { week: 5, status: "completed", note: "Strong start!", date: "Week 5" },
                  { week: 6, status: "current", note: "In progress", date: "Week 6" },
                  { week: 7, status: "upcoming", note: "Scheduled", date: "Week 7" },
                  { week: 8, status: "upcoming", note: "Scheduled", date: "Week 8" },
                ].map((checkin, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className={cn(
                      "text-center border relative overflow-hidden",
                      checkin.status === "completed" && "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200",
                      checkin.status === "current" && "bg-gradient-to-br from-amber-50 to-violet-50 border-amber-300",
                      checkin.status === "upcoming" && "bg-gray-50 border-gray-200"
                    )}
                    style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  >
                    {checkin.status === "current" && (
                      <Badge
                        className="absolute top-2 right-2 bg-amber-500 text-white border-0"
                        style={{ fontSize: TYPE.caption, padding: '2px 6px' }}
                      >
                        This Week
                      </Badge>
                    )}
                    <div
                      className={cn(
                        "mx-auto mb-2 flex items-center justify-center rounded-full",
                        checkin.status === "completed" && "bg-green-100",
                        checkin.status === "current" && "bg-amber-100",
                        checkin.status === "upcoming" && "bg-gray-100"
                      )}
                      style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                    >
                      {checkin.status === "completed" ? (
                        <CheckCircle2 className="text-green-600" style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                      ) : checkin.status === "current" ? (
                        <Target className="text-amber-600" style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                      ) : (
                        <CalendarRange className="text-gray-400" style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                      )}
                    </div>
                    <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900">{checkin.date}</h4>
                    <p
                      style={{ fontSize: TYPE.meta }}
                      className={cn(
                        checkin.status === "completed" && "text-green-600",
                        checkin.status === "current" && "text-amber-600",
                        checkin.status === "upcoming" && "text-gray-400"
                      )}
                    >
                      {checkin.note}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Performance Alert - Shows if not on track */}
              <div className="mt-4 p-3 bg-violet-50/50 border border-violet-100 rounded-lg">
                <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                  <div className="flex-shrink-0 bg-violet-100 rounded-full p-2">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p style={{ fontSize: TYPE.meta }} className="text-violet-900 font-medium">
                      On Track for Goals
                    </p>
                    <p style={{ fontSize: TYPE.caption }} className="text-violet-600">
                      Keep up the great work! If you fall behind, your upline will work with you on a remediation plan.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Phase Overview - Section Card with Corner Accents
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-white relative overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            {/* Corner Accent Decorations */}
            <div
              className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${COLORS.primary.violet[50]} 50%)`,
                opacity: 0.6,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none"
              style={{
                background: `linear-gradient(-45deg, transparent 50%, ${COLORS.accent.amber[50]} 50%)`,
                opacity: 0.4,
              }}
            />

            <CardHeader>
              <SectionHeader
                icon={TrendingUp}
                title="Phase Overview"
                subtitle="What to expect in Months 2-3"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-4"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Users, value: "125+", label: "Total Contacts", color: "violet" },
                  { icon: Briefcase, value: "25+", label: "Presentations", color: "purple" },
                  { icon: DollarSign, value: "8-13", label: "Applications", color: "violet" },
                  { icon: Award, value: "2", label: "Certifications", color: "amber" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className={cn(
                      "text-center",
                      item.color === "violet" && "bg-violet-50",
                      item.color === "purple" && "bg-purple-50",
                      item.color === "amber" && "bg-amber-50"
                    )}
                    style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, boxShadow: SHADOW.level1 }}
                  >
                    <item.icon
                      style={{ width: GRID.spacing.lg, height: GRID.spacing.lg }}
                      className={cn(
                        "mx-auto mb-2",
                        item.color === "violet" && "text-violet-500",
                        item.color === "purple" && "text-purple-500",
                        item.color === "amber" && "text-amber-500"
                      )}
                    />
                    <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900">{item.value}</h4>
                    <p style={{ fontSize: TYPE.meta }} className="text-gray-500">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Monthly Goals - Card Grid with Glass Morphism
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <motion.div
            className="grid lg:grid-cols-2"
            style={{ gap: GRID.spacing.md }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {monthGoals.map((goal) => (
              <motion.div
                key={goal.id}
                variants={scaleIn}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
              >
                <Card
                  className="bg-white relative overflow-hidden"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card, height: '100%' }}
                >
                  {/* Corner Accent */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, transparent 50%, ${COLORS.primary.purple[50]} 50%)`,
                      opacity: 0.5,
                    }}
                  />

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={typeColors.advanced}>
                        Month {goal.month}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-600 font-medium" style={{ fontSize: TYPE.meta }}>
                        <Zap style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                        {goal.xpReward} XP
                      </div>
                    </div>
                    <CardTitle style={{ fontSize: TYPE.title, marginTop: GRID.spacing.xs }}>{goal.title}</CardTitle>
                    <CardDescription style={{ fontSize: TYPE.meta }}>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                    {/* Targets */}
                    <div>
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        <Target style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                        Monthly Targets
                      </h4>
                      <motion.div
                        className="grid grid-cols-3"
                        style={{ gap: GRID.spacing.xs }}
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {goal.targets.map((target, i) => (
                          <motion.div
                            key={i}
                            variants={scaleIn}
                            className="text-center bg-gray-50 border border-gray-100"
                            style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                          >
                            <div style={{ fontSize: TYPE.title }} className="font-bold text-gray-900">{target.value}</div>
                            <div style={{ fontSize: TYPE.caption }} className="text-gray-500">{target.label}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        <TrendingUp style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                        Skills to Master
                      </h4>
                      <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs }}>
                        {goal.skills.map((skill, i) => (
                          <Badge
                            key={i}
                            className={cn(typeColors.core, "cursor-pointer hover:scale-105 transition-transform")}
                            onClick={() => handleSkillClick(skill, "core")}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Certification with gradient shimmer */}
                    <div
                      className="flex items-center bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 relative overflow-hidden border border-amber-200/50"
                      style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}
                      />
                      <Award style={{ width: GRID.spacing.lg, height: GRID.spacing.lg }} className="text-amber-500 relative z-10" />
                      <div className="relative z-10">
                        <p style={{ fontSize: TYPE.meta }} className="font-medium text-amber-900">{goal.certification}</p>
                        <p style={{ fontSize: TYPE.caption }} className="text-amber-700">Awarded upon completion</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Key Focus Areas - Section Card with Corner Accents
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-white relative overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            {/* Corner Accent Decorations */}
            <div
              className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${COLORS.accent.amber[50]} 50%)`,
                opacity: 0.6,
              }}
            />

            <CardHeader>
              <SectionHeader
                icon={Star}
                title="Key Focus Areas"
                subtitle="Master these skills during Months 2-3"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-2"
                style={{ gap: GRID.spacing.md }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={scaleIn}
                  style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  className="flex flex-col bg-violet-50/50 border border-violet-100/50"
                  whileHover={{ y: MOTION.hover.y }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900">Activity Habits</h4>
                  {["Daily prospecting routine", "Weekly goal tracking", "Pipeline management", "Time blocking mastery"].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center cursor-pointer hover:bg-violet-100/50 rounded-md transition-colors"
                      style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, margin: `-${GRID.spacing.xs / 2}px -${GRID.spacing.xs}px` }}
                      onClick={() => handleSkillClick(item, "practical")}
                    >
                      <CheckCircle2 style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} className="text-violet-500" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </motion.div>
                <motion.div
                  variants={scaleIn}
                  style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  className="flex flex-col bg-purple-50/50 border border-purple-100/50"
                  whileHover={{ y: MOTION.hover.y }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900">Sales Excellence</h4>
                  {["Consistent follow-up", "Referral generation", "Multi-policy opportunities", "Objection mastery"].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center cursor-pointer hover:bg-purple-100/50 rounded-md transition-colors"
                      style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, margin: `-${GRID.spacing.xs / 2}px -${GRID.spacing.xs}px` }}
                      onClick={() => handleSkillClick(item, "advanced")}
                    >
                      <CheckCircle2 style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} className="text-purple-500" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Months 2-3 Complete! - Completion Section
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Radial Gradient Dots Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <radialGradient id="completeDotGradient31" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="completeDotsPattern31" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#completeDotGradient31)" />
                </pattern>
                <radialGradient id="completeFade31" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="completeMask31">
                  <rect width="100%" height="100%" fill="url(#completeFade31)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#completeDotsPattern31)" mask="url(#completeMask31)" />
            </svg>

            {/* Blur Circles for Depth */}
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
                style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.xs }}
                className="font-bold tracking-tight text-white"
              >
                Months 2-3 Complete!
              </h3>
              <p
                style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }}
                className="text-white/90 max-w-md mx-auto"
              >
                You've built momentum and mastered your sales foundation. Ready to scale your success in months 4-6!
              </p>
              <Link href="/agents/onboarding/days-91-180">
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Button
                    className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                    style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                  >
                    Continue to Days 91-180
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>


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
