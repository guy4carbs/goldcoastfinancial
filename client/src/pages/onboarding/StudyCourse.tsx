import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import { AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives/AgentStatCard";
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
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";

// Course curriculum modules
const CURRICULUM = [
  {
    id: "mod-1",
    title: "The Foundation: Why Life Insurance Matters",
    lessons: 4,
    duration: "30 min",
    icon: BookOpen,
  },
  {
    id: "mod-2",
    title: "Product Mastery: Term, Whole, Universal & More",
    lessons: 5,
    duration: "45 min",
    icon: FileText,
  },
  {
    id: "mod-3",
    title: "Underwriting: How Risk Gets Priced",
    lessons: 4,
    duration: "40 min",
    icon: Shield,
  },
  {
    id: "mod-4",
    title: "Inside the Policy: Riders, Benefits & Cash Value",
    lessons: 5,
    duration: "50 min",
    icon: Target,
  },
  {
    id: "mod-5",
    title: "Client Conversations: Ethical Sales in Practice",
    lessons: 5,
    duration: "55 min",
    icon: Users,
  },
  {
    id: "mod-6",
    title: "Final Assessment & Certification",
    lessons: 2,
    duration: "30 min",
    icon: Award,
  },
];

const COURSE_HIGHLIGHTS = [
  { label: "Total Duration", value: "4 hrs", icon: Clock },
  { label: "Lessons", value: "25", icon: PlayCircle },
  { label: "Avg. Rating", value: "4.9", icon: Star },
  { label: "Agents Trained", value: "2,100+", icon: Users },
];

const LEARNING_OUTCOMES = [
  "Confidently compare term, whole, universal, and IUL products for any client scenario",
  "Break down policy riders, beneficiaries, and cash value so clients actually understand them",
  "Walk a client through the underwriting process without hesitation",
  "Use needs-based selling to recommend the right coverage, every time",
  "Recognize and avoid compliance violations like twisting, churning, and rebating",
  "Pass your state licensing exam on the first attempt",
];

export default function StudyCourse() {
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
          icon={GraduationCap}
          title="Life Insurance Mastery Course"
          subtitle="Everything you need to know before your first client conversation"
        >
          <div className="flex-shrink-0">
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
                  Begin Learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <p className="text-white/60 text-xs text-center mt-3">
                Includes Heritage certification upon completion
              </p>
            </div>
          </div>
        </AgentPageHero>

        {/* Course Highlights Stats */}
        <AgentStatCardGrid>
          {COURSE_HIGHLIGHTS.map((stat, idx) => (
            <AgentStatCard
              key={idx}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </AgentStatCardGrid>

        {/* Main Content Grid */}
        <motion.section variants={fadeInUp} className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Curriculum */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2"
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-1" style={{ fontSize: TYPE.title }}>
                  Course Curriculum
                </h2>
                <p className="text-gray-500 mb-6" style={{ fontSize: TYPE.meta }}>
                  6 modules • 25 lessons • Self-paced
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
            variants={fadeInUp}
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
                      Heritage Certification
                    </h3>
                    <p className="text-gray-500 text-sm">Awarded upon completion</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Earn your Heritage Life Solutions certification and demonstrate your readiness to serve clients.
                </p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: TYPE.body }}>
                  Study Tools
                </h3>
                <div className="space-y-2">
                  <Link href="/agents/onboarding/study/practice-exam">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Brain className="w-5 h-5 text-violet-600" />
                      <span className="text-gray-700 text-sm font-medium">Practice Exam (20 Questions)</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/agents/onboarding/study/flashcards">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileText className="w-5 h-5 text-violet-600" />
                      <span className="text-gray-700 text-sm font-medium">Flashcards (36 Cards)</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </motion.div>
    </OnboardingLoungeLayout>
  );
}
