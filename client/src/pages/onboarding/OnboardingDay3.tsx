import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  Package,
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
  Heart,
  Umbrella,
  PiggyBank,
  Users,
  BarChart3,
  Calculator,
  Target,
  DollarSign,
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
import {
  LicensingChecklist,
  HeritageProductsTraining,
  LICENSING_STEPS,
} from "@/components/onboarding/LoungeComponents";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "video" | "module" | "quiz" | "read" | "practice";
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
}

const day3Tasks: Task[] = [
  {
    id: "term-life-deep",
    title: "Term Life Insurance Deep Dive",
    description: "Comprehensive training on term life products, riders, and underwriting",
    type: "module",
    duration: "45 min",
    xp: 200,
    completed: true,
    required: true,
  },
  {
    id: "whole-life-deep",
    title: "Whole Life Insurance Mastery",
    description: "Understanding cash value, dividends, and policy loans",
    type: "module",
    duration: "50 min",
    xp: 225,
    completed: true,
    required: true,
  },
  {
    id: "iul-training",
    title: "Indexed Universal Life (IUL) Training",
    description: "Learn how IUL works, caps, floors, and participation rates",
    type: "video",
    duration: "35 min",
    xp: 175,
    completed: true,
    required: true,
  },
  {
    id: "annuities-intro",
    title: "Introduction to Annuities",
    description: "Fixed, variable, and indexed annuity fundamentals",
    type: "module",
    duration: "40 min",
    xp: 175,
    completed: false,
    required: true,
  },
  {
    id: "product-comparison",
    title: "Product Comparison Workshop",
    description: "Learn when to recommend each product type",
    type: "practice",
    duration: "30 min",
    xp: 150,
    completed: false,
    required: true,
  },
  {
    id: "underwriting-basics",
    title: "Underwriting Fundamentals",
    description: "Risk classes, medical requirements, and approval processes",
    type: "read",
    duration: "25 min",
    xp: 100,
    completed: false,
    required: false,
  },
  {
    id: "day3-quiz",
    title: "Product Knowledge Assessment",
    description: "Test your understanding of Heritage Life products",
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
};

const typeColors = {
  video: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  module: "bg-purple-100/80 text-purple-600 border border-purple-200/50",
  quiz: "bg-amber-100/80 text-amber-600 border border-amber-200/50",
  read: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
  practice: "bg-violet-100/80 text-violet-600 border border-violet-200/50",
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

// Product category card component
const PRODUCT_CATEGORIES = [
  {
    id: "term",
    name: "Term Life",
    icon: Clock,
    color: COLORS.primary.violet[500],
    description: "Affordable coverage for specific time periods",
    products: ["10-Year Term", "20-Year Term", "30-Year Term", "Return of Premium"],
  },
  {
    id: "whole",
    name: "Whole Life",
    icon: Shield,
    color: COLORS.primary.purple[500],
    description: "Lifetime coverage with guaranteed cash value",
    products: ["Traditional Whole Life", "Limited Pay", "Single Premium"],
  },
  {
    id: "universal",
    name: "Universal Life",
    icon: BarChart3,
    color: COLORS.accent.amber[500],
    description: "Flexible premiums and death benefits",
    products: ["Current Assumption UL", "Guaranteed UL", "Indexed UL", "Variable UL"],
  },
  {
    id: "annuities",
    name: "Annuities",
    icon: PiggyBank,
    color: COLORS.semantic.success,
    description: "Retirement income solutions",
    products: ["Fixed Annuity", "Fixed Indexed Annuity", "SPIA", "MYGA"],
  },
];

export default function OnboardingDay3() {
  const [tasks, setTasks] = useState(day3Tasks);
  const [completedLicensingSteps, setCompletedLicensingSteps] = useState<string[]>([
    'step-1', 'step-2', 'step-3', 'step-4'
  ]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([
    'term-10', 'term-20', 'term-30', 'whole-traditional'
  ]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("term");

  const toggleLicensingStep = (stepId: string) => {
    setCompletedLicensingSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const toggleProduct = (productId: string) => {
    setCompletedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Licensing steps 5-6 for Day 3
  const day3LicensingSteps = LICENSING_STEPS.slice(4, 6);

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
                  <Package style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} className="text-amber-200" />
                </motion.div>
                <div className="flex-1">
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                    style={{ marginBottom: GRID.spacing.xs, padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Day 3 of 30
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                  >
                    Product Deep Dive
                  </h1>
                  <p style={{ fontSize: TYPE.body, lineHeight: 1.5 }} className="text-white/90 max-w-xl">
                    Master our complete product portfolio. Learn the features, benefits, and ideal use cases for each insurance product.
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

        {/* Learning Objectives */}
        <motion.div variants={scaleIn}>
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
                icon={GraduationCap}
                title="Learning Objectives"
                subtitle="Master these product knowledge areas"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                {[
                  { text: "Understand all term life variations", icon: Clock },
                  { text: "Master whole life mechanics", icon: Shield },
                  { text: "Explain IUL benefits clearly", icon: BarChart3 },
                  { text: "Match products to client needs", icon: Users },
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

        {/* Product Categories Overview */}
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
                icon={Package}
                title="Product Portfolio Overview"
                subtitle="Explore each product category in detail"
              />
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                {PRODUCT_CATEGORIES.map((category, i) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.id;
                  return (
                    <motion.div
                      key={category.id}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className={cn(
                        "cursor-pointer border transition-all overflow-hidden",
                        isExpanded
                          ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
                          : "bg-white border-gray-200 hover:border-violet-200"
                      )}
                      style={{
                        borderRadius: RADIUS.card,
                        boxShadow: isExpanded ? '0 4px 20px rgba(124, 58, 237, 0.15)' : SHADOW.level1,
                      }}
                    >
                      <div style={{ padding: GRID.spacing.md }}>
                        <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center text-white"
                            style={{
                              width: GRID.spacing.xl,
                              height: GRID.spacing.xl,
                              borderRadius: RADIUS.button,
                              background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                              boxShadow: `0 4px 12px ${category.color}30`,
                            }}
                          >
                            <Icon style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {category.name}
                            </h3>
                            <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              {category.description}
                            </p>
                          </div>
                          <Badge
                            className="bg-gray-100 text-gray-600"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {category.products.length} products
                          </Badge>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            style={{ marginTop: GRID.spacing.sm }}
                          >
                            <div className="border-t border-violet-100 pt-3">
                              <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs }}>
                                {category.products.map((product, j) => (
                                  <Badge
                                    key={j}
                                    className="bg-white border border-violet-200 text-violet-700"
                                    style={{ fontSize: TYPE.caption, padding: '4px 10px' }}
                                  >
                                    {product}
                                  </Badge>
                                ))}
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
                title="Day 3 Tasks"
                subtitle="Complete product training modules"
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
                          className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md"
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

        {/* Heritage Products Training */}
        <motion.div variants={fadeInUp}>
          <HeritageProductsTraining
            completedProducts={completedProducts}
            onToggleProduct={toggleProduct}
          />
        </motion.div>

        {/* Licensing Steps Section */}
        <motion.div variants={fadeInUp}>
          <LicensingChecklist
            steps={day3LicensingSteps}
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
                  Day 3 Complete!
                </h3>
                <p style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.md }} className="text-white/90 max-w-md mx-auto">
                  You have mastered the product portfolio and earned {totalXP} XP. Ready for sales training!
                </p>
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                  <Link href="/agents/onboarding/day-4">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Button
                        className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48, padding: '0 24px' }}
                      >
                        Continue to Day 4
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
