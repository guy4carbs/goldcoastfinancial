import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  GraduationCap,
  Calendar,
  FileText,
  Users,
  Lightbulb,
  Sparkles,
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
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "@/lib/heritageDesignSystem";

// Help categories for onboarding
const HELP_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Your first steps in the onboarding program",
    icon: Lightbulb,
    articles: [
      "How the Onboarding Lounge works",
      "What to expect each day",
      "How XP and progress tracking work",
      "Making the most of your first week",
    ],
  },
  {
    id: "training",
    title: "Training & Study Tools",
    description: "Course modules, flashcards, and practice exams",
    icon: GraduationCap,
    articles: [
      "Navigating the Life Insurance Mastery Course",
      "How practice exams prepare you for licensing",
      "Using flashcards to lock in key concepts",
      "Earning your Heritage certification",
    ],
  },
  {
    id: "licensing",
    title: "Licensing & Appointments",
    description: "Everything about getting your state license",
    icon: FileText,
    articles: [
      "State licensing requirements by state",
      "How to schedule your licensing exam",
      "What happens during the background check",
      "Getting appointed with insurance carriers",
    ],
  },
  {
    id: "mentorship",
    title: "Your Mentor & Team",
    description: "The people who are invested in your success",
    icon: Users,
    articles: [
      "Who is your mentor and how to connect",
      "Booking one-on-one coaching sessions",
      "Weekly team meetings and what to expect",
      "Getting feedback after your first calls",
    ],
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    question: "How long does onboarding take before I can start working with clients?",
    answer: "The core onboarding runs 30 days, with the most intensive training in your first week. Most agents are production-ready and taking supervised calls by the end of Week 1. After your first month, you transition to the Agent Lounge where ongoing coaching and advanced training continue.",
  },
  {
    question: "When can I actually start selling?",
    answer: "After you complete your state licensing requirements and finish the first week of training, you can begin client conversations with your mentor's support. Full autonomy comes after your 30-day review and Heritage certification.",
  },
  {
    question: "How do I track my progress?",
    answer: "Your Onboarding Dashboard shows your current day, completed tasks, XP earned, and overall progress percentage. Each day's checklist updates in real time as you complete activities.",
  },
  {
    question: "What if I fall behind on the daily schedule?",
    answer: "That is completely normal. The daily structure is a guide, not a deadline. Focus on completing each phase in order. Your mentor can help you adjust the pace if life gets in the way.",
  },
  {
    question: "Who should I reach out to if I need help?",
    answer: "Your assigned mentor is always your first call. For technical issues or general questions, use the live chat below or email support@heritagels.org. We typically respond within a few hours during business days.",
  },
];

// Contact options with action types
const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Get quick answers now",
    action: "Start Chat",
    actionType: "chat" as const,
    available: true,
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "(630) 778-0800",
    action: "Call Now",
    actionType: "call" as const,
    phoneNumber: "+16307780800",
    available: true,
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@heritagels.org",
    action: "Send Email",
    actionType: "email" as const,
    email: "support@heritagels.org",
    available: true,
  },
  {
    icon: Calendar,
    title: "Book a Call",
    description: "Schedule time with your mentor",
    action: "Schedule",
    actionType: "schedule" as const,
    available: true,
  },
];

// FAQ item animation variants
const faqItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: MOTION.easing,
    },
  }),
};

const faqContentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: MOTION.easing },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: MOTION.easing },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

export default function OnboardingHelp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();

  // Handle contact actions
  const handleContactAction = (option: typeof CONTACT_OPTIONS[0]) => {
    switch (option.actionType) {
      case "chat":
        setChatOpen(true);
        toast({
          title: "Live Chat",
          description: "Connecting you to a support representative...",
        });
        // In production, this would open a chat widget like Intercom, Crisp, etc.
        break;
      case "call":
        if (option.phoneNumber) {
          window.location.href = `tel:${option.phoneNumber}`;
        }
        break;
      case "email":
        if (option.email) {
          window.location.href = `mailto:${option.email}?subject=Onboarding Support Request&body=Hi Heritage Support Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A`;
        }
        break;
      case "schedule":
        toast({
          title: "Schedule a Call",
          description: "Opening the scheduling calendar...",
        });
        // In production, this would open Calendly or a similar scheduling tool
        window.open("https://calendly.com", "_blank");
        break;
    }
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
          icon={HelpCircle}
          title="Support Center"
          subtitle="Answers, guides, and real people -- whatever you need, we are here"
        >
          <div className="relative max-w-xl w-full mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for answers, guides, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.body }}
            />
          </div>
        </AgentPageHero>

        {/* Help Categories */}
        <motion.div variants={fadeInUp}>
          <div className="grid md:grid-cols-2 gap-4">
            {HELP_CATEGORIES.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  variants={scaleIn}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card
                    className="border-0 cursor-pointer group h-full"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className="bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: RADIUS.button,
                          }}
                        >
                          <Icon className="w-6 h-6 text-amber-200" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1" style={{ fontSize: TYPE.title }}>
                            {category.title}
                          </h3>
                          <p className="text-gray-500 mb-3" style={{ fontSize: TYPE.meta }}>
                            {category.description}
                          </p>
                          <ul className="space-y-1.5">
                            {category.articles.slice(0, 3).map((article, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-gray-600 hover:text-violet-600 cursor-pointer transition-colors"
                                style={{ fontSize: TYPE.caption }}
                              >
                                <ChevronRight className="w-3 h-3" />
                                {article}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Lightbulb className="w-5 h-5 text-amber-200" />
                </motion.div>
                <div>
                  <CardTitle style={{ fontSize: TYPE.title }}>Common Questions</CardTitle>
                  <CardDescription style={{ fontSize: TYPE.meta }}>Straight answers from agents who have been where you are</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={faqItemVariants}
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all duration-300",
                      expandedFaq === idx
                        ? "border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50 shadow-md"
                        : "border-gray-100 hover:border-violet-200 hover:shadow-sm"
                    )}
                  >
                    <motion.button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left transition-colors"
                      whileHover={{ backgroundColor: expandedFaq === idx ? "transparent" : "rgba(139, 92, 246, 0.05)" }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
                            expandedFaq === idx
                              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          )}
                          animate={{
                            scale: expandedFaq === idx ? 1.1 : 1,
                            rotate: expandedFaq === idx ? 360 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {idx + 1}
                        </motion.div>
                        <span className="font-medium text-gray-900" style={{ fontSize: TYPE.body }}>
                          {faq.question}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedFaq === idx ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ChevronRight className={cn(
                          "w-5 h-5 transition-colors",
                          expandedFaq === idx ? "text-violet-500" : "text-gray-400"
                        )} />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence initial={false}>
                      {expandedFaq === idx && (
                        <motion.div
                          key="content"
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={faqContentVariants}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <div className="pl-11 border-l-2 border-violet-200 ml-4">
                              <motion.p
                                className="text-gray-600 pl-3"
                                style={{ fontSize: TYPE.meta }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                              >
                                {faq.answer}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Options */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Phone className="w-5 h-5 text-amber-200" />
                </motion.div>
                <div>
                  <CardTitle style={{ fontSize: TYPE.title }}>Talk to a Real Person</CardTitle>
                  <CardDescription style={{ fontSize: TYPE.meta }}>Our team responds fast -- pick the channel that works for you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CONTACT_OPTIONS.map((option, idx) => {
                  const Icon = option.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContactAction(option)}
                      className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/50 transition-all cursor-pointer text-center group"
                    >
                      <motion.div
                        className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200/50"
                        whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-7 h-7 text-amber-200" />
                      </motion.div>
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors" style={{ fontSize: TYPE.body }}>
                        {option.title}
                      </h4>
                      <p className="text-gray-500 mb-4 group-hover:text-gray-600 transition-colors" style={{ fontSize: TYPE.caption }}>
                        {option.description}
                      </p>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all w-full"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <motion.span
                          className="flex items-center justify-center gap-1"
                          whileHover={{ x: 2 }}
                        >
                          {option.action}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div variants={fadeInUp}>
          <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-amber-50 border border-violet-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: TYPE.title }}>
                  Pro Tip: Quick Navigation
                </h3>
                <p className="text-gray-600" style={{ fontSize: TYPE.meta }}>
                  Press <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">⌘</kbd> + <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">K</kbd> from anywhere to instantly jump to any day, module, or resource in your onboarding program. It is the fastest way to get where you need to go.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </OnboardingLoungeLayout>
  );
}
