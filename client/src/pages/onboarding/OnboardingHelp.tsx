import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Calendar,
  FileText,
  Users,
  Lightbulb,
  CheckCircle2,
  Clock,
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
} from "@/lib/onboardingDesignSystem";

// Help categories for onboarding
const HELP_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to onboarding? Start here",
    icon: Lightbulb,
    articles: [
      "How to navigate the Onboarding Lounge",
      "Understanding your daily tasks",
      "Tracking your progress and XP",
      "Completing your first week",
    ],
  },
  {
    id: "training",
    title: "Training & Courses",
    description: "Complete your certification",
    icon: GraduationCap,
    articles: [
      "How to access training modules",
      "Taking practice exams",
      "Using flashcards effectively",
      "Earning certifications",
    ],
  },
  {
    id: "licensing",
    title: "Licensing Process",
    description: "Get your insurance license",
    icon: FileText,
    articles: [
      "State licensing requirements",
      "Scheduling your exam",
      "Background check process",
      "Appointment with carriers",
    ],
  },
  {
    id: "mentorship",
    title: "Mentorship & Support",
    description: "Connect with your team",
    icon: Users,
    articles: [
      "Meeting your mentor",
      "Scheduling coaching calls",
      "Joining team meetings",
      "Getting feedback on calls",
    ],
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    question: "How long does the onboarding program take?",
    answer: "The complete onboarding program spans 365 days, with the most intensive training in the first 90 days. You'll be production-ready within your first month.",
  },
  {
    question: "When can I start selling?",
    answer: "Once you complete your licensing requirements and first week of training, you can begin making sales calls with supervision. Full autonomy comes after your 30-day certification.",
  },
  {
    question: "How do I track my progress?",
    answer: "Your dashboard shows your XP, completed tasks, badges earned, and overall progress through each phase of onboarding.",
  },
  {
    question: "Who do I contact if I have issues?",
    answer: "Your assigned mentor is your first point of contact. You can also reach out to support via the chat feature or email support@heritagelife.com.",
  },
];

// Contact options with action types
const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with support team",
    action: "Start Chat",
    actionType: "chat" as const,
    available: true,
  },
  {
    icon: Phone,
    title: "Call Support",
    description: "(630) 778-0888",
    action: "Call Now",
    actionType: "call" as const,
    phoneNumber: "+16307780888",
    available: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "support@heritagels.org",
    action: "Send Email",
    actionType: "email" as const,
    email: "support@heritagels.org",
    available: true,
  },
  {
    icon: Calendar,
    title: "Schedule Call",
    description: "Book with your mentor",
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
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const faqContentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
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
        className="max-w-5xl mx-auto space-y-6 pb-8"
      >
        {/* Hero Section */}
        <motion.div variants={fadeInUp}>
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
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-md flex items-center justify-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: RADIUS.card,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <HelpCircle className="w-8 h-8 text-amber-200" />
                </motion.div>
                <div>
                  <Badge
                    className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium mb-2"
                    style={{ padding: '4px 12px' }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Support Center
                  </Badge>
                  <h1
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: TYPE.display, lineHeight: 1.1 }}
                  >
                    How Can We Help?
                  </h1>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
                  style={{ borderRadius: RADIUS.button, fontSize: TYPE.body }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                  <CardTitle style={{ fontSize: TYPE.title }}>Frequently Asked Questions</CardTitle>
                  <CardDescription style={{ fontSize: TYPE.meta }}>Quick answers to common questions</CardDescription>
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
                  <CardTitle style={{ fontSize: TYPE.title }}>Need More Help?</CardTitle>
                  <CardDescription style={{ fontSize: TYPE.meta }}>Get in touch with our support team</CardDescription>
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
                  Pro Tip: Use Keyboard Shortcuts
                </h3>
                <p className="text-gray-600" style={{ fontSize: TYPE.meta }}>
                  Press <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">⌘</kbd> + <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">K</kbd> to quickly search and navigate anywhere in the onboarding lounge. You can also use it to jump to specific days, modules, or resources.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </OnboardingLoungeLayout>
  );
}
