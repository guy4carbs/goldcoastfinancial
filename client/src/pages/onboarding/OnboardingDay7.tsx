import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  Trophy,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Video,
  Clock,
  Zap,
  ListChecks,
  TrendingUp,
  Award,
  Sparkles,
  Star,
  Target,
  Users,
  MessageSquare,
  Brain,
  Flame,
  Medal,
  Crown,
  Rocket,
  PartyPopper,
  Shield,
  BookOpen,
  GraduationCap,
  Mic,
  BarChart3,
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
  type: "video" | "simulation" | "assessment" | "review" | "roleplay" | "celebration";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
}

const day7Tasks: Task[] = [
  {
    id: "week-review",
    title: "Week 1 Knowledge Review",
    description: "Quick review of all concepts covered in Days 1-6",
    type: "review",
    duration: "30 min",
    xp: 150,
    completed: true,
    required: true,
  },
  {
    id: "full-simulation",
    title: "Full Client Simulation",
    description: "Complete a full client interaction from introduction to close",
    type: "simulation",
    duration: "45 min",
    xp: 300,
    completed: true,
    required: true,
  },
  {
    id: "product-assessment",
    title: "Product Knowledge Assessment",
    description: "Comprehensive test on all Heritage Life products",
    type: "assessment",
    duration: "30 min",
    xp: 250,
    completed: true,
    required: true,
  },
  {
    id: "sales-assessment",
    title: "Sales Skills Assessment",
    description: "Demonstrate your sales process and objection handling",
    type: "assessment",
    duration: "25 min",
    xp: 250,
    completed: false,
    required: true,
  },
  {
    id: "compliance-assessment",
    title: "Compliance & Ethics Assessment",
    description: "Final compliance certification exam",
    type: "assessment",
    duration: "20 min",
    xp: 200,
    completed: false,
    required: true,
  },
  {
    id: "final-roleplay",
    title: "Final AI Roleplay Challenge",
    description: "Face a challenging client scenario with our AI avatars",
    type: "roleplay",
    duration: "25 min",
    xp: 300,
    completed: false,
    required: true,
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
  },
];

const typeIcons = {
  video: Video,
  simulation: Brain,
  assessment: GraduationCap,
  review: BookOpen,
  roleplay: Mic,
  celebration: PartyPopper,
};

const typeColors = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  simulation: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  assessment: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  review: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  roleplay: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  celebration: "bg-gradient-to-r from-violet-100/80 to-purple-100/80 text-violet-600 border border-violet-200/50",
};

// Week 1 achievements
const WEEK1_ACHIEVEMENTS = [
  { id: "tasks", label: "Tasks Completed", value: 42, total: 48, icon: CheckCircle2, color: COLORS.primary.violet[500] },
  { id: "xp", label: "Total XP Earned", value: 4850, total: 5500, icon: Zap, color: COLORS.accent.amber[500] },
  { id: "products", label: "Products Mastered", value: 8, total: 9, icon: Shield, color: COLORS.primary.purple[500] },
  { id: "roleplay", label: "Roleplay Sessions", value: 5, total: 6, icon: MessageSquare, color: COLORS.semantic.success },
];

// Skill levels
const SKILL_LEVELS = [
  { skill: "Product Knowledge", level: 85, color: COLORS.primary.violet[500] },
  { skill: "Sales Techniques", level: 78, color: COLORS.primary.purple[500] },
  { skill: "Compliance", level: 92, color: COLORS.accent.amber[500] },
  { skill: "Communication", level: 81, color: COLORS.semantic.success },
  { skill: "Objection Handling", level: 74, color: COLORS.primary.violet[400] },
];

// Badges earned
const BADGES_EARNED = [
  { id: "quick-start", name: "Quick Starter", description: "Completed Day 1", icon: Rocket, color: COLORS.primary.violet[500], earned: true },
  { id: "product-pro", name: "Product Pro", description: "Mastered all products", icon: Shield, color: COLORS.primary.purple[500], earned: true },
  { id: "compliance-certified", name: "Compliance Certified", description: "Passed compliance exam", icon: Award, color: COLORS.accent.amber[500], earned: true },
  { id: "sales-star", name: "Sales Star", description: "Aced sales assessment", icon: Star, color: COLORS.primary.violet[400], earned: false },
  { id: "week1-graduate", name: "Week 1 Graduate", description: "Completed Week 1", icon: Crown, color: COLORS.semantic.success, earned: false },
];

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

export default function OnboardingDay7() {
  const [tasks, setTasks] = useState(day7Tasks);

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
            className="bg-gradient-to-br from-amber-500 via-purple-600 to-violet-600 text-white border-0 overflow-hidden relative"
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
                  <Trophy style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-300" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Flame className="w-3 h-3 mr-1 text-amber-300" />
                    Day 7 - Week 1 Finale
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Graduation Day
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Complete your final assessments and simulations to earn your Week 1 certification. You have come so far!
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
              label: "Final Tasks",
              gradient: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.violet[600]} 100%)`,
              icon: ListChecks,
              bgGlow: COLORS.primary.violet[100],
            },
            {
              value: `${progress}%`,
              label: "Day Progress",
              gradient: `linear-gradient(135deg, ${COLORS.primary.purple[500]} 0%, ${COLORS.primary.purple[600]} 100%)`,
              icon: TrendingUp,
              bgGlow: COLORS.primary.purple[100],
            },
            {
              value: totalXP,
              label: "Day XP",
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

        {/* Week 1 Summary */}
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
                icon={BarChart3}
                title="Week 1 Progress Summary"
                subtitle="Your training journey so far"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
                {WEEK1_ACHIEVEMENTS.map((achievement, i) => {
                  const AchIcon = achievement.icon;
                  const percentage = Math.round((achievement.value / achievement.total) * 100);
                  return (
                    <motion.div
                      key={achievement.id}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50"
                      style={{ boxShadow: SHADOW.level1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ background: achievement.color }}
                        >
                          <AchIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                          {achievement.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-bold text-2xl text-gray-900">{achievement.value}</span>
                        <span className="text-gray-400" style={{ fontSize: TYPE.meta }}>/ {achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-2 rounded-full"
                          style={{ background: achievement.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Levels */}
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
                title="Skill Proficiency"
                subtitle="Your current skill levels based on assessments"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ gap: GRID.spacing.sm }} className="flex flex-col">
                {SKILL_LEVELS.map((skill, i) => (
                  <div key={skill.skill} className="flex items-center gap-4">
                    <span className="w-40 text-gray-700 font-medium" style={{ fontSize: TYPE.body }}>
                      {skill.skill}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: MOTION.easing }}
                        className="h-full rounded-full relative"
                        style={{ background: skill.color }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                          }}
                        />
                      </motion.div>
                    </div>
                    <span
                      className="font-bold w-12 text-right"
                      style={{ color: skill.color, fontSize: TYPE.body }}
                    >
                      {skill.level}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
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
                icon={Medal}
                title="Badges & Achievements"
                subtitle="Unlock all badges to graduate Week 1"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: GRID.spacing.sm }}>
                {BADGES_EARNED.map((badge, i) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <motion.div
                      key={badge.id}
                      variants={scaleIn}
                      whileHover={badge.earned ? { y: MOTION.hover.y, scale: 1.05 } : undefined}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border transition-all",
                        badge.earned
                          ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
                          : "bg-gray-50 border-gray-200 opacity-50"
                      )}
                    >
                      <motion.div
                        animate={badge.earned ? { rotate: [0, 5, -5, 0] } : undefined}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center mb-2",
                          badge.earned ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"
                        )}
                        style={{
                          background: badge.earned ? badge.color : undefined,
                          boxShadow: badge.earned ? `0 4px 20px ${badge.color}40` : undefined,
                        }}
                      >
                        <BadgeIcon className="w-6 h-6" />
                      </motion.div>
                      <span
                        className={cn(
                          "font-semibold text-center",
                          badge.earned ? "text-gray-900" : "text-gray-400"
                        )}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {badge.name}
                      </span>
                      <span
                        className={cn(
                          "text-center",
                          badge.earned ? "text-gray-500" : "text-gray-400"
                        )}
                        style={{ fontSize: TYPE.micro }}
                      >
                        {badge.description}
                      </span>
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
                title="Final Day Tasks"
                subtitle="Complete all assessments to graduate"
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
                            task.type === "celebration"
                              ? "bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
                              : task.type === "simulation"
                              ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                              : task.type === "roleplay"
                              ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
                          {task.type === "assessment" ? (
                            <>
                              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                              Take Exam
                            </>
                          ) : task.type === "simulation" ? (
                            <>
                              <Brain className="w-3.5 h-3.5 mr-1.5" />
                              Start Sim
                            </>
                          ) : task.type === "roleplay" ? (
                            <>
                              <Mic className="w-3.5 h-3.5 mr-1.5" />
                              Challenge
                            </>
                          ) : task.type === "celebration" ? (
                            <>
                              <PartyPopper className="w-3.5 h-3.5 mr-1.5" />
                              Graduate!
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
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

        {/* Continue to Next Phase - Always visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: MOTION.duration.modal, ease: MOTION.easing }}
        >
            <Card
              className="bg-gradient-to-r from-amber-500 via-purple-600 to-violet-600 text-white border-0 relative overflow-hidden"
              style={{ borderRadius: RADIUS.hero, boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)' }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />

              <CardContent style={{ padding: GRID.spacing.xl }} className="text-center relative">
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
                    width: GRID.spacing.xxxxl + 16,
                    height: GRID.spacing.xxxxl + 16,
                    marginBottom: GRID.spacing.md,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <Crown style={{ width: GRID.spacing.xxl, height: GRID.spacing.xxl }} className="text-amber-300" />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
                  </motion.div>
                </motion.div>

                <h3
                  style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs }}
                  className="font-bold tracking-tight text-white"
                >
                  Week 1 Complete!
                </h3>
                <p style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-lg mx-auto">
                  Congratulations, Heritage Life Agent! You have successfully completed your first week of training.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <Badge className="bg-white/20 text-white border-0 text-sm py-1 px-3">
                    <Zap className="w-4 h-4 mr-1" />
                    4,850 Total XP
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-sm py-1 px-3">
                    <Medal className="w-4 h-4 mr-1" />
                    5 Badges Earned
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-sm py-1 px-3">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    48 Tasks Complete
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
                        Continue to Days 8-30
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
