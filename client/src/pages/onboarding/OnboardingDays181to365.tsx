import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TaskContentModal } from "@/components/onboarding/TaskContentModal";
import { getTaskContent } from "@/data/onboardingTaskContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  GraduationCap,
  Lock,
  Target,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  DollarSign,
  Star,
  Crown,
  Sparkles,
  CheckCircle2,
  Medal,
  Trophy,
  Rocket,
  Zap,
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

interface Quarter {
  id: string;
  quarter: string;
  months: string;
  title: string;
  focus: string;
  goals: string[];
  achievement: string;
}

const quarters: Quarter[] = [
  {
    id: "q3",
    quarter: "Q3",
    months: "Months 7-9",
    title: "Mastery & Consistency",
    focus: "Maintain consistent production and deepen expertise",
    goals: [
      "Consistent weekly production targets",
      "Expand product portfolio expertise",
      "Build referral engine",
      "Develop specialization niche",
    ],
    achievement: "Senior Agent Status",
  },
  {
    id: "q4",
    quarter: "Q4",
    months: "Months 10-12",
    title: "Year One Graduation",
    focus: "Complete your first year and plan for year two",
    goals: [
      "Achieve annual production goals",
      "Complete all certifications",
      "Mentor new agents",
      "Set year two vision",
    ],
    achievement: "Heritage Elite Agent",
  },
];

const yearOneAchievements = [
  { icon: Trophy, title: "Year One Graduate", description: "Completed 365-day onboarding program", color: "amber" },
  { icon: Crown, title: "Heritage Elite", description: "Achieved elite agent status", color: "purple" },
  { icon: Medal, title: "Top Producer", description: "Exceeded production targets", color: "violet" },
  { icon: Users, title: "Team Builder", description: "Mentored 2+ new agents", color: "violet" },
];

// Type badge colors with borders
const typeColors: Record<string, string> = {
  core: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  advanced: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  practical: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
};

export default function OnboardingDays181to365() {
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
      description: `Master ${skillName.toLowerCase()} for year one excellence`,
      type: category === "practical" ? "simulation" : "module",
      duration: "30 min",
      xp: 250,
      completed: false,
      required: true,
      day: 270,
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
                <radialGradient id="dotGradient181" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="heroDotsPattern181" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#dotGradient181)" />
                </pattern>
                <radialGradient id="heroFade181" cx="70%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="heroMask181">
                  <rect width="100%" height="100%" fill="url(#heroFade181)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroDotsPattern181)" mask="url(#heroMask181)" />
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
                  <GraduationCap style={{ width: GRID.spacing.xxl, height: GRID.spacing.xxl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                    style={{ marginBottom: GRID.spacing.xs }}
                  >
                    Days 181-365
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Year One Graduation
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Master your craft, achieve elite status, and graduate from the Heritage Life onboarding program.
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
            { label: "Achievements", value: "0 / 4", icon: Trophy, color: "purple" },
            { label: "XP Available", value: "10,000", icon: Zap, color: "amber" },
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
            Monthly Reviews - Continued Accountability
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
                subtitle="Continue your monthly 1-hour sessions with upline"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-3 lg:grid-cols-6"
                style={{ gap: GRID.spacing.xs }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { month: 7, focus: "Q3 Kickoff" },
                  { month: 8, focus: "Mid-Q3 Check" },
                  { month: 9, focus: "Q3 Review" },
                  { month: 10, focus: "Q4 Kickoff" },
                  { month: 11, focus: "Pre-Grad Check" },
                  { month: 12, focus: "Graduation" },
                ].map((review, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="text-center border bg-gradient-to-br from-violet-50/30 to-purple-50/30 border-violet-200/50"
                    style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                  >
                    <div
                      className="mx-auto mb-1 flex items-center justify-center rounded-full bg-violet-100"
                      style={{ width: GRID.spacing.lg, height: GRID.spacing.lg }}
                    >
                      <span className="text-xs font-bold text-violet-600">{review.month}</span>
                    </div>
                    <p style={{ fontSize: TYPE.caption }} className="text-gray-600 font-medium">{review.focus}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Year 1 Graduation Ceremony Highlight */}
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-lg relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}
                />
                <div className="flex items-center relative z-10" style={{ gap: GRID.spacing.sm }}>
                  <div className="flex-shrink-0 bg-amber-100 rounded-full p-3">
                    <GraduationCap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p style={{ fontSize: TYPE.body }} className="text-amber-900 font-semibold">
                      Year 1 Graduation Ceremony
                    </p>
                    <p style={{ fontSize: TYPE.meta }} className="text-amber-700">
                      Celebrate your achievements and receive your Heritage Elite badge at Month 12 review!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Year One Summary - Section Card with Corner Accents
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
                icon={Sparkles}
                title="Year One Summary"
                subtitle="Your journey to becoming a Heritage Elite Agent"
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
                  { icon: DollarSign, value: "$100K+", label: "Year One Target", color: "violet" },
                  { icon: Briefcase, value: "100+", label: "Total Policies", color: "purple" },
                  { icon: Users, value: "150+", label: "Client Relationships", color: "violet" },
                  { icon: Award, value: "10+", label: "Certifications", color: "amber" },
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
            Quarterly Breakdown - Glass Cards
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          {/* SectionHeader Pattern */}
          <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}>
            <div
              className="bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center"
              style={{
                width: GRID.spacing.xl,
                height: GRID.spacing.xl,
                borderRadius: RADIUS.button,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              <Target style={{ width: GRID.spacing.sm + 4, height: GRID.spacing.sm + 4 }} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: TYPE.title }} className="font-semibold text-gray-900">Quarterly Breakdown</h2>
              <p style={{ fontSize: TYPE.meta }} className="text-gray-500">Your path through Q3 and Q4</p>
            </div>
          </div>
          <motion.div
            className="grid lg:grid-cols-2"
            style={{ gap: GRID.spacing.md }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {quarters.map((quarter) => (
              <motion.div
                key={quarter.id}
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
                        {quarter.quarter} ({quarter.months})
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                      </div>
                    </div>
                    <CardTitle style={{ fontSize: TYPE.title, marginTop: GRID.spacing.xs }}>{quarter.title}</CardTitle>
                    <CardDescription style={{ fontSize: TYPE.meta }}>{quarter.focus}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                    <div>
                      <h4 style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }} className="font-semibold text-gray-700">Key Goals</h4>
                      <div style={{ gap: GRID.spacing.xs }} className="flex flex-col">
                        {quarter.goals.map((goal, i) => (
                          <div
                            key={i}
                            className="flex items-center text-gray-600 cursor-pointer hover:bg-violet-50 rounded-md transition-colors"
                            style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, margin: `-${GRID.spacing.xs / 2}px -${GRID.spacing.xs}px` }}
                            onClick={() => handleSkillClick(goal, "practical")}
                          >
                            <CheckCircle2 style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} className="text-violet-500 flex-shrink-0" />
                            {goal}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievement Section with Gradient Shimmer */}
                    <div
                      className="flex items-center bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 relative overflow-hidden border border-amber-200/50"
                      style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}
                      />
                      <Crown style={{ width: GRID.spacing.lg, height: GRID.spacing.lg }} className="text-amber-500 relative z-10" />
                      <div className="flex-1 relative z-10">
                        <p style={{ fontSize: TYPE.meta }} className="font-medium text-amber-900">{quarter.achievement}</p>
                        <p style={{ fontSize: TYPE.caption }} className="text-amber-700">Unlocked upon completion</p>
                        {/* Gradient Shimmer Progress Bar */}
                        <GradientProgress value={0} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Graduation Achievements - Section Card with Corner Accents
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
                icon={GraduationCap}
                title="Year One Graduation Achievements"
                subtitle="Badges and recognition you'll earn upon completing Year One"
                gradient="from-violet-500 to-amber-500"
              />
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4"
                style={{ gap: GRID.spacing.sm }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {yearOneAchievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="text-center border"
                    style={{
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      backgroundColor: achievement.color === 'amber' ? COLORS.accent.amber[50] :
                        achievement.color === 'purple' ? COLORS.primary.purple[50] : COLORS.primary.violet[50],
                      borderColor: achievement.color === 'amber' ? COLORS.accent.amber[200] :
                        achievement.color === 'purple' ? COLORS.primary.purple[200] : COLORS.primary.violet[200],
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center mx-auto"
                      style={{
                        width: GRID.spacing.xxl,
                        height: GRID.spacing.xxl,
                        marginBottom: GRID.spacing.sm,
                        backgroundColor: achievement.color === 'amber' ? COLORS.accent.amber[100] :
                          achievement.color === 'purple' ? COLORS.primary.purple[100] : COLORS.primary.violet[100],
                      }}
                    >
                      <achievement.icon
                        style={{
                          width: GRID.spacing.md,
                          height: GRID.spacing.md,
                          color: achievement.color === 'amber' ? COLORS.accent.amber[600] :
                            achievement.color === 'purple' ? COLORS.primary.purple[600] : COLORS.primary.violet[600],
                        }}
                      />
                    </div>
                    <h4 style={{ fontSize: TYPE.body }} className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                    <p style={{ fontSize: TYPE.caption }} className="text-gray-500">{achievement.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            Year One Complete! - Graduation Completion Section
        ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Radial Gradient Dots Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <radialGradient id="completeDotGradient181" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <pattern id="completeDotsPattern181" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="url(#completeDotGradient181)" />
                </pattern>
                <radialGradient id="completeFade181" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="completeMask181">
                  <rect width="100%" height="100%" fill="url(#completeFade181)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#completeDotsPattern181)" mask="url(#completeMask181)" />
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
                style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs }}
                className="font-bold tracking-tight text-white"
              >
                Year One Complete!
              </h3>
              <p
                style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }}
                className="text-white/90 max-w-lg mx-auto"
              >
                Congratulations! You've graduated from the Heritage Life onboarding program. Welcome to the Heritage Elite!
              </p>
              <motion.div
                className="flex flex-wrap justify-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {["Leadership Academy", "Producer Circle", "Team Building", "Advanced Certifications"].map((badge, i) => (
                  <motion.div key={i} variants={scaleIn}>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">{badge}</Badge>
                  </motion.div>
                ))}
              </motion.div>
              <Link href="/agents/onboarding/lounge">
                <Button
                  className="bg-white text-violet-600 hover:bg-violet-50 font-semibold"
                  style={{ borderRadius: RADIUS.button, padding: `${GRID.spacing.sm}px ${GRID.spacing.lg}px` }}
                >
                  <GraduationCap style={{ width: GRID.spacing.sm, height: GRID.spacing.sm, marginRight: GRID.spacing.xs }} />
                  Enter Heritage Elite
                </Button>
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
