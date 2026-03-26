import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
import { LessonContentModal } from "@/components/onboarding/LessonContentModal";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  Lock,
  FileText,
  Video,
  Brain,
  Target,
  Shield,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";

// Course modules data
const COURSE_MODULES = [
  {
    id: "mod-1",
    title: "The Foundation: Why Life Insurance Matters",
    description: "Understand the purpose, history, and real-world impact of life insurance",
    duration: "30 min",
    lessons: [
      { id: "l1-1", title: "What Life Insurance Really Does", duration: "8 min", type: "video" },
      { id: "l1-2", title: "A Brief History of Life Insurance", duration: "6 min", type: "reading" },
      { id: "l1-3", title: "Why Families Need Coverage Today", duration: "10 min", type: "video" },
      { id: "l1-4", title: "Knowledge Check: Foundations", duration: "6 min", type: "quiz" },
    ],
    icon: BookOpen,
    color: "violet",
  },
  {
    id: "mod-2",
    title: "Product Mastery: Term, Whole, Universal & More",
    description: "Learn to compare every major policy type so you can match clients with the right product",
    duration: "45 min",
    lessons: [
      { id: "l2-1", title: "Term Life: Affordable Protection for a Set Period", duration: "12 min", type: "video" },
      { id: "l2-2", title: "Whole Life: Lifetime Coverage with Guaranteed Growth", duration: "12 min", type: "video" },
      { id: "l2-3", title: "Universal Life: Flexible Premiums & Adjustable Benefits", duration: "10 min", type: "video" },
      { id: "l2-4", title: "Variable & Indexed Life: Market-Linked Options", duration: "8 min", type: "reading" },
      { id: "l2-5", title: "Knowledge Check: Product Types", duration: "8 min", type: "quiz" },
    ],
    icon: FileText,
    color: "purple",
  },
  {
    id: "mod-3",
    title: "Underwriting: How Risk Gets Priced",
    description: "Discover how carriers evaluate applicants and assign risk classifications",
    duration: "40 min",
    lessons: [
      { id: "l3-1", title: "The Underwriting Process Step by Step", duration: "10 min", type: "video" },
      { id: "l3-2", title: "Risk Classes: Preferred to Substandard", duration: "12 min", type: "video" },
      { id: "l3-3", title: "Medical Exams, Labs & MIB Checks", duration: "10 min", type: "reading" },
      { id: "l3-4", title: "Knowledge Check: Underwriting", duration: "8 min", type: "quiz" },
    ],
    icon: Shield,
    color: "violet",
  },
  {
    id: "mod-4",
    title: "Inside the Policy: Riders, Benefits & Cash Value",
    description: "Master every component of a life insurance policy your clients will ask about",
    duration: "50 min",
    lessons: [
      { id: "l4-1", title: "How Premiums Are Calculated", duration: "10 min", type: "video" },
      { id: "l4-2", title: "Death Benefits: Level, Increasing & Decreasing", duration: "12 min", type: "video" },
      { id: "l4-3", title: "Cash Value, Policy Loans & Withdrawals", duration: "10 min", type: "video" },
      { id: "l4-4", title: "Essential Riders Every Agent Should Know", duration: "10 min", type: "reading" },
      { id: "l4-5", title: "Knowledge Check: Policy Components", duration: "8 min", type: "quiz" },
    ],
    icon: Target,
    color: "violet",
  },
  {
    id: "mod-5",
    title: "Client Conversations: Ethical Sales in Practice",
    description: "Build trust through needs-based selling, discovery, and handling objections the right way",
    duration: "55 min",
    lessons: [
      { id: "l5-1", title: "Needs-Based Selling: Putting the Client First", duration: "15 min", type: "video" },
      { id: "l5-2", title: "The Discovery Call: Asking the Right Questions", duration: "12 min", type: "video" },
      { id: "l5-3", title: "Compliance, Ethics & Avoiding Common Violations", duration: "10 min", type: "reading" },
      { id: "l5-4", title: "Handling Objections with Confidence", duration: "10 min", type: "video" },
      { id: "l5-5", title: "Knowledge Check: Sales & Ethics", duration: "8 min", type: "quiz" },
    ],
    icon: Users,
    color: "violet",
  },
  {
    id: "mod-6",
    title: "Final Assessment & Certification",
    description: "Review everything you have learned and earn your Heritage certification",
    duration: "30 min",
    lessons: [
      { id: "l6-1", title: "Comprehensive Course Review", duration: "15 min", type: "reading" },
      { id: "l6-2", title: "Certification Exam", duration: "15 min", type: "quiz" },
    ],
    icon: Award,
    color: "violet",
  },
];

const lessonTypeIcons = {
  video: Video,
  reading: FileText,
  quiz: Brain,
};

const colorClasses = {
  violet: {
    bg: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
  },
  purple: {
    bg: "from-purple-500 to-violet-600",
    light: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  blue: {
    bg: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    bg: "from-violet-600 to-purple-600",
    light: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
  },
  amber: {
    bg: "from-violet-500 to-amber-500",
    light: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
  },
};

export default function StudyFundamentals() {
  const searchString = useSearch();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>("mod-1");
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);

  // Modal state for lesson content
  const [openLesson, setOpenLesson] = useState<{
    id: string;
    title: string;
    type: "video" | "reading" | "quiz";
  } | null>(null);

  // Auto-expand module from URL query param
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const moduleId = params.get("module");
    if (moduleId && COURSE_MODULES.some(m => m.id === moduleId)) {
      setExpandedModule(moduleId);
    }
  }, [searchString]);

  const totalLessons = COURSE_MODULES.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progress = Math.round((completedCount / totalLessons) * 100);

  // Open lesson content modal
  const openLessonModal = (lesson: { id: string; title: string; type: string }) => {
    setOpenLesson({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type as "video" | "reading" | "quiz",
    });
  };

  // Handle lesson completion from modal
  const handleLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  // Close modal
  const closeLessonModal = () => {
    setOpenLesson(null);
  };

  const isModuleComplete = (moduleId: string) => {
    const module = COURSE_MODULES.find(m => m.id === moduleId);
    if (!module) return false;
    return module.lessons.every(lesson => completedLessons.includes(lesson.id));
  };

  const isModuleUnlocked = (_moduleIndex: number) => {
    // All modules are unlocked - users can start any module they want
    // Only lessons within a module are sequential
    return true;
  };

  const getModuleProgress = (moduleId: string) => {
    const module = COURSE_MODULES.find(m => m.id === moduleId);
    if (!module) return 0;
    const completed = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  return (
    <OnboardingLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Section */}
        <AgentPageHero
          icon={BookOpen}
          title="Course Modules"
          subtitle="Work through each module at your own pace -- your progress is saved automatically"
        />

        {/* Progress Stats */}
        <AgentStatCardGrid>
          <AgentStatCard
            icon={TrendingUp}
            value={`${progress}%`}
            label="Progress"
          />
          <AgentStatCard
            icon={CheckCircle2}
            value={`${completedCount}/${totalLessons}`}
            label="Lessons Completed"
          />
          <AgentStatCard
            icon={Clock}
            value="4"
            label="Est. Hours"
          />
          <AgentStatCard
            icon={Award}
            value={progress >= 100 ? "Earned" : "In Progress"}
            label="Certification"
          />
        </AgentStatCardGrid>

        {/* Back Navigation */}
        <Link href="/agents/onboarding/study/course">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-violet-600">
            <ChevronLeft className="w-4 h-4" />
            Back to Course Overview
          </Button>
        </Link>

        {/* Course Modules */}
        <div className="space-y-4">
          {COURSE_MODULES.map((module, index) => {
            const colors = colorClasses[module.color as keyof typeof colorClasses];
            const isComplete = isModuleComplete(module.id);
            const isUnlocked = isModuleUnlocked(index);
            const moduleProgress = getModuleProgress(module.id);
            const isExpanded = expandedModule === module.id;
            const Icon = module.icon;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "border-2 overflow-hidden transition-all",
                    isComplete
                      ? "border-violet-200 bg-violet-50/30"
                      : isUnlocked
                        ? cn("hover:shadow-lg", colors.border)
                        : "border-gray-200 bg-gray-50/50 opacity-75"
                  )}
                  style={{ borderRadius: RADIUS.card }}
                >
                  {/* Module Header */}
                  <div
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      isUnlocked ? "hover:bg-gray-50" : "cursor-not-allowed"
                    )}
                    onClick={() => isUnlocked && setExpandedModule(isExpanded ? null : module.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Module Icon */}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          isComplete
                            ? "bg-gradient-to-br from-violet-500 to-amber-500"
                            : isUnlocked
                              ? `bg-gradient-to-br ${colors.bg}`
                              : "bg-gray-300"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : !isUnlocked ? (
                          <Lock className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              isComplete ? "bg-violet-100 text-violet-700 border-violet-200" : colors.badge
                            )}
                          >
                            Module {index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {module.duration}
                          </Badge>
                        </div>
                        <h3
                          className={cn(
                            "font-semibold",
                            isComplete ? "text-violet-700" : isUnlocked ? "text-gray-900" : "text-gray-400"
                          )}
                          style={{ fontSize: TYPE.title }}
                        >
                          {module.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-0.5">{module.description}</p>
                      </div>

                      {/* Progress */}
                      <div className="hidden md:flex items-center gap-4">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{moduleProgress}%</span>
                          </div>
                          <Progress
                            value={moduleProgress}
                            className={cn(
                              "h-2",
                              isComplete ? "[&>div]:bg-violet-500" : `[&>div]:bg-gradient-to-r [&>div]:${colors.bg}`
                            )}
                          />
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 text-gray-400 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lessons */}
                  {isExpanded && isUnlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isLessonComplete = completedLessons.includes(lesson.id);
                          const LessonIcon = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons];
                          const isPrevComplete = lessonIndex === 0 || completedLessons.includes(module.lessons[lessonIndex - 1].id);
                          const isLessonUnlocked = isPrevComplete || isLessonComplete;

                          return (
                            <div
                              key={lesson.id}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all",
                                isLessonComplete
                                  ? "bg-violet-50 border border-violet-200"
                                  : isLessonUnlocked
                                    ? "bg-gray-50 hover:bg-gray-100 cursor-pointer border border-transparent"
                                    : "bg-gray-50/50 opacity-60 border border-transparent"
                              )}
                              onClick={() => isLessonUnlocked && openLessonModal(lesson)}
                            >
                              {/* Lesson Status */}
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                  isLessonComplete
                                    ? "bg-violet-500 text-white"
                                    : isLessonUnlocked
                                      ? "bg-gray-200 text-gray-500"
                                      : "bg-gray-200 text-gray-400"
                                )}
                              >
                                {isLessonComplete ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : !isLessonUnlocked ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  <LessonIcon className="w-4 h-4" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium",
                                    isLessonComplete ? "text-violet-700" : "text-gray-700"
                                  )}
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-xs capitalize h-5">
                                    {lesson.type}
                                  </Badge>
                                  <span className="text-xs text-gray-400">{lesson.duration}</span>
                                </div>
                              </div>

                              {/* Action */}
                              {isLessonUnlocked && !isLessonComplete && (
                                <Button
                                  size="sm"
                                  className={cn("gap-1.5 bg-gradient-to-r", colors.bg, "text-white")}
                                  style={{ borderRadius: RADIUS.button }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLessonModal(lesson);
                                  }}
                                >
                                  <Play className="w-3 h-3" />
                                  Start
                                </Button>
                              )}
                              {isLessonComplete && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                                  style={{ borderRadius: RADIUS.button }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLessonModal(lesson);
                                  }}
                                >
                                  Review
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Completion CTA */}
        {progress >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              className="bg-gradient-to-r from-violet-500 to-amber-500 text-white border-0 overflow-hidden"
              style={{ borderRadius: RADIUS.hero }}
            >
              <CardContent className="p-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                <h2 className="text-2xl font-bold mb-2">You Did It -- Course Complete!</h2>
                <p className="text-white/80 mb-6">
                  You have completed every module in the Life Insurance Mastery Course. Your Heritage certification is ready.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-violet-600 hover:bg-white/90"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Download Your Certification
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Lesson Content Modal */}
      <LessonContentModal
        isOpen={openLesson !== null}
        onClose={closeLessonModal}
        lessonId={openLesson?.id || null}
        lessonTitle={openLesson?.title || ""}
        lessonType={openLesson?.type || "video"}
        onComplete={handleLessonComplete}
      />
    </OnboardingLoungeLayout>
  );
}
