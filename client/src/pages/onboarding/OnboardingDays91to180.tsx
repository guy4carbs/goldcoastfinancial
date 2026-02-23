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
  Trophy,
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
  Crown,
  Rocket,
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
  focus: string;
  targets: { label: string; value: string }[];
  milestones: string[];
}

const monthGoals: MonthGoal[] = [
  {
    id: "month-4",
    month: 4,
    title: "Production Consistency",
    focus: "Establish consistent weekly production patterns",
    targets: [
      { label: "Weekly Contacts", value: "25+" },
      { label: "Weekly Presentations", value: "5+" },
      { label: "Monthly Apps", value: "8-10" },
    ],
    milestones: ["First $10K month", "10 client referrals", "Advanced product certification"],
  },
  {
    id: "month-5",
    month: 5,
    title: "Advanced Sales Techniques",
    focus: "Master complex sales and multi-policy opportunities",
    targets: [
      { label: "Multi-Policy Sales", value: "3+" },
      { label: "Large Cases", value: "2+" },
      { label: "Monthly Apps", value: "10-12" },
    ],
    milestones: ["First large case ($250K+)", "Team lead qualification", "IUL certification"],
  },
  {
    id: "month-6",
    month: 6,
    title: "Leadership Development",
    focus: "Begin developing leadership skills and mentoring others",
    targets: [
      { label: "Consistent Production", value: "Maintained" },
      { label: "Mentee Support", value: "1-2" },
      { label: "Team Activities", value: "Weekly" },
    ],
    milestones: ["6-month achievement badge", "Leadership certification", "First mentee onboarded"],
  },
];

// Type badge colors with borders
const typeColors: Record<string, string> = {
  core: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  advanced: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  practical: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
};

export default function OnboardingDays91to180() {
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

  // Handle skill/milestone click to open modal
  const handleSkillClick = (skillName: string, category: string = "core") => {
    const taskId = skillName.toLowerCase().replace(/\s+/g, '-');
    const taskObj = {
      id: taskId,
      title: skillName,
      description: `Master ${skillName.toLowerCase()} to advance your career`,
      type: category === "practical" ? "simulation" : "module",
      duration: "25 min",
      xp: 200,
      completed: false,
      required: true,
      day: 135,
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
                <radialGradient id="dotGradient91" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="heroDotsPattern91" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#dotGradient91)" />
                </pattern>
                <radialGradient id="heroFade91" cx="70%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="heroMask91">
                  <rect width="100%" height="100%" fill="url(#heroFade91)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroDotsPattern91)" mask="url(#heroMask91)" />
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
                  <Trophy style={{ width: GRID.spacing.xxl, height: GRID.spacing.xxl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                    style={{ marginBottom: GRID.spacing.xs }}
                  >
                    Days 91-180
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Scaling Success
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Scale your production, master advanced techniques, and begin your leadership journey.
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
            { label: "Milestones Hit", value: "0 / 9", icon: Star, color: "purple" },
            { label: "XP Available", value: "7,500", icon: Zap, color: "amber" },
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
            Monthly Review Sessions - Accountability System
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
                icon={Target}
                title="Monthly Agent Reviews"
                subtitle="1-hour sessions with your upline each month"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-3"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { month: 4, title: "Production Review", focus: "Review metrics vs goals, identify trends", status: "upcoming" },
                  { month: 5, title: "Goal Adjustment", focus: "Adjust targets based on performance", status: "upcoming" },
                  { month: 6, title: "6-Month Assessment", focus: "Comprehensive review & leadership eval", status: "upcoming" },
                ].map((review, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="border bg-gradient-to-br from-violet-50/50 to-purple-50/50 border-violet-200/50"
                    style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={typeColors.advanced}>
                        Month {review.month}
                      </Badge>
                      <span className="text-xs text-gray-400">1 hour</span>
                    </div>
                    <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                    <p style={{ fontSize: TYPE.meta }} className="text-gray-500">{review.focus}</p>
                    <div className="mt-3 pt-3 border-t border-violet-100">
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}>
                        <CheckCircle2 className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-600">Includes skill gap identification</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mentorship Opportunity */}
              <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                  <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p style={{ fontSize: TYPE.meta }} className="text-amber-900 font-medium">
                      Mentorship Opportunities Available
                    </p>
                    <p style={{ fontSize: TYPE.caption }} className="text-amber-600">
                      Top performers can begin mentoring new agents during Month 6 reviews.
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
                icon={Rocket}
                title="Phase Overview"
                subtitle="What to expect in Months 4-6"
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
                  { icon: DollarSign, value: "$30K+", label: "Quarterly Target", color: "violet" },
                  { icon: Briefcase, value: "30+", label: "Total Applications", color: "purple" },
                  { icon: Users, value: "50+", label: "Client Referrals", color: "violet" },
                  { icon: Crown, value: "Leader", label: "Track Unlocked", color: "amber" },
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
            Monthly Breakdown - Glass Cards
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <motion.div
            className="grid lg:grid-cols-3"
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
                    <Badge className={typeColors.advanced}>
                      Month {goal.month}
                    </Badge>
                    <CardTitle style={{ fontSize: TYPE.title, marginTop: GRID.spacing.xs }}>{goal.title}</CardTitle>
                    <CardDescription style={{ fontSize: TYPE.meta }}>{goal.focus}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                    {/* Targets */}
                    <div>
                      <h4 style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }} className="font-semibold text-gray-700">Targets</h4>
                      <div style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                        {goal.targets.map((target, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100" style={{ fontSize: TYPE.meta, padding: GRID.spacing.xs, borderRadius: RADIUS.button }}>
                            <span className="text-gray-600">{target.label}</span>
                            <span className="font-semibold text-gray-900">{target.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones */}
                    <div>
                      <h4 style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }} className="font-semibold text-gray-700">Key Milestones</h4>
                      <div style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                        {goal.milestones.map((milestone, i) => (
                          <div
                            key={i}
                            className="flex items-center text-gray-600 cursor-pointer hover:bg-amber-50 rounded-md transition-colors"
                            style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, margin: `-${GRID.spacing.xs / 2}px -${GRID.spacing.xs}px` }}
                            onClick={() => handleSkillClick(milestone, "practical")}
                          >
                            <Star style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} className="text-amber-500 flex-shrink-0" />
                            {milestone}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Advanced Certifications - Section Card with Corner Accents
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
                icon={Award}
                title="Advanced Certifications Available"
                subtitle="Unlock new opportunities with specialized training"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-3"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Award, title: "IUL Specialist", desc: "Master Indexed Universal Life products", gradient: "from-violet-50 to-purple-50", border: "border-violet-200/50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                  { icon: Crown, title: "Leadership Track", desc: "Begin building your team", gradient: "from-purple-50 to-violet-50", border: "border-purple-200/50", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
                  { icon: TrendingUp, title: "High Producer", desc: "Recognition for top performers", gradient: "from-violet-50 to-purple-50", border: "border-violet-200/50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                ].map((cert, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className={cn(`bg-gradient-to-br ${cert.gradient} border`, cert.border)}
                    style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                  >
                    <div
                      className={cn("rounded-full flex items-center justify-center", cert.iconBg)}
                      style={{ width: GRID.spacing.xxl, height: GRID.spacing.xxl, marginBottom: GRID.spacing.sm }}
                    >
                      <cert.icon style={{ width: GRID.spacing.md, height: GRID.spacing.md }} className={cert.iconColor} />
                    </div>
                    <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900 mb-1">{cert.title}</h4>
                    <p style={{ fontSize: TYPE.meta }} className="text-gray-500">{cert.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Months 4-6 Complete! - Completion Section
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Radial Gradient Dots Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <radialGradient id="completeDotGradient91" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="completeDotsPattern91" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#completeDotGradient91)" />
                </pattern>
                <radialGradient id="completeFade91" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="completeMask91">
                  <rect width="100%" height="100%" fill="url(#completeFade91)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#completeDotsPattern91)" mask="url(#completeMask91)" />
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
                style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                className="font-bold tracking-tight text-white"
              >
                Months 4-6 Complete!
              </h3>
              <p
                style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }}
                className="text-white/90 max-w-md mx-auto"
              >
                You've scaled your success and developed leadership skills. Ready to master your craft and graduate!
              </p>
              <Link href="/agents/onboarding/days-181-365">
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Button
                    className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                    style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                  >
                    Continue to Days 181-365
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
