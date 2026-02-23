import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Star,
  Users,
  PlayCircle,
  FileText,
  Brain,
  Target,
  Shield,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
} from "@/lib/onboardingDesignSystem";

// Course curriculum modules
const CURRICULUM = [
  {
    id: "mod-1",
    title: "Introduction to Life Insurance",
    lessons: 4,
    duration: "30 min",
    icon: BookOpen,
  },
  {
    id: "mod-2",
    title: "Types of Life Insurance",
    lessons: 5,
    duration: "45 min",
    icon: FileText,
  },
  {
    id: "mod-3",
    title: "Underwriting Basics",
    lessons: 4,
    duration: "40 min",
    icon: Shield,
  },
  {
    id: "mod-4",
    title: "Policy Components",
    lessons: 5,
    duration: "50 min",
    icon: Target,
  },
  {
    id: "mod-5",
    title: "Selling Life Insurance",
    lessons: 5,
    duration: "55 min",
    icon: Users,
  },
  {
    id: "mod-6",
    title: "Final Assessment",
    lessons: 2,
    duration: "30 min",
    icon: Award,
  },
];

const COURSE_HIGHLIGHTS = [
  { label: "Duration", value: "6 hours", icon: Clock },
  { label: "Lessons", value: "23", icon: PlayCircle },
  { label: "Rating", value: "4.8", icon: Star },
  { label: "Enrolled", value: "1,240", icon: Users },
];

const LEARNING_OUTCOMES = [
  "Understand different types of life insurance products",
  "Explain policy components and riders to clients",
  "Navigate the underwriting process confidently",
  "Apply ethical sales practices in client conversations",
  "Prepare for state licensing examinations",
  "Build a foundation for a successful insurance career",
];

export default function StudyCourse() {
  return (
    <OnboardingLoungeLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Decorative elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />

            <CardContent className="relative p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                      className="bg-white/20 backdrop-blur-md flex items-center justify-center"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: RADIUS.card,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <GraduationCap className="w-7 h-7 text-amber-200" />
                    </motion.div>
                    <div>
                      <Badge
                        className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium"
                        style={{ padding: '4px 12px' }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Heritage Life Academy
                      </Badge>
                    </div>
                  </div>

                  <h1
                    className="font-bold tracking-tight text-white mb-3"
                    style={{ fontSize: TYPE.hero, lineHeight: 1.1 }}
                  >
                    Life Insurance Fundamentals
                  </h1>
                  <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
                    Master the essential knowledge of life insurance products, coverage types, and industry practices.
                    This comprehensive course prepares you for client conversations and state licensing exams.
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    {COURSE_HIGHLIGHTS.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2"
                      >
                        <stat.icon className="w-4 h-4 text-white/70" />
                        <span className="text-white font-semibold">{stat.value}</span>
                        <span className="text-white/60 text-sm">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Course Card */}
                <div className="lg:w-72 flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/70">Price</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 line-through text-sm">$99</span>
                        <Badge className="bg-amber-500 text-white border-0">FREE</Badge>
                      </div>
                    </div>

                    <Link href="/agents/onboarding/study/fundamentals">
                      <Button
                        className="w-full bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-lg"
                        style={{ borderRadius: RADIUS.button, height: 48 }}
                      >
                        Start Course
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>

                    <p className="text-white/60 text-xs text-center mt-3">
                      Includes certificate of completion
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Curriculum */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-1" style={{ fontSize: TYPE.title }}>
                  Course Curriculum
                </h2>
                <p className="text-gray-500 mb-6" style={{ fontSize: TYPE.meta }}>
                  6 modules • 23 lessons • 6 hours total
                </p>

                <div className="space-y-3">
                  {CURRICULUM.map((module, idx) => {
                    const Icon = module.icon;
                    return (
                      <Link
                        key={module.id}
                        href={`/agents/onboarding/study/fundamentals?module=${module.id}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-100 hover:border-violet-200 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors" style={{ fontSize: TYPE.body }}>
                              Module {idx + 1}: {module.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {module.lessons} lessons • {module.duration}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Learning Outcomes & Instructor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Learning Outcomes */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: TYPE.title }}>
                  What You'll Learn
                </h2>
                <ul className="space-y-3">
                  {LEARNING_OUTCOMES.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Certificate Preview */}
            <Card
              className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
              style={{ borderRadius: RADIUS.card }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                      Earn a Certificate
                    </h3>
                    <p className="text-gray-500 text-sm">Upon course completion</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Add this credential to your LinkedIn profile and resume to showcase your expertise.
                </p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: TYPE.body }}>
                  Additional Resources
                </h3>
                <div className="space-y-2">
                  <Link href="/agents/onboarding/study/practice-exam">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Brain className="w-5 h-5 text-violet-600" />
                      <span className="text-gray-700 text-sm font-medium">Practice Exam</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/agents/onboarding/study/flashcards">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileText className="w-5 h-5 text-violet-600" />
                      <span className="text-gray-700 text-sm font-medium">Flashcards</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </OnboardingLoungeLayout>
  );
}
