import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  Lightbulb,
  Shield,
  DollarSign,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { AgentPageHero } from "@/components/agent/primitives";

// Type definitions
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: string[];
}

interface QuickLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

// Constants
const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to the platform? Start here',
    icon: Lightbulb,
    articles: [
      'How to navigate the Agent Lounge',
      'Setting up your profile',
      'Understanding your dashboard',
      'First steps for new agents',
    ]
  },
  {
    id: 'leads',
    title: 'Managing Leads',
    description: 'Learn how to work with leads',
    icon: Users,
    articles: [
      'Adding and importing leads',
      'Lead status workflow',
      'Using the pipeline view',
      'Lead follow-up best practices',
    ]
  },
  {
    id: 'quotes',
    title: 'Creating Quotes',
    description: 'Generate quotes for clients',
    icon: FileText,
    articles: [
      'How to create a new quote',
      'Understanding coverage options',
      'Premium calculations explained',
      'Sending quotes to clients',
    ]
  },
  {
    id: 'training',
    title: 'Training & Certification',
    description: 'Complete your training modules',
    icon: GraduationCap,
    articles: [
      'Completing training modules',
      'Tracking your certifications',
      'Advancing through agent tiers',
      'Compliance requirements',
    ]
  },
  {
    id: 'earnings',
    title: 'Commissions & Earnings',
    description: 'Track your income',
    icon: DollarSign,
    articles: [
      'Understanding your commissions',
      'When payments are processed',
      'Viewing your statements',
      'Tax documentation',
    ]
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Manage your account settings',
    icon: Shield,
    articles: [
      'Updating your profile',
      'Changing your password',
      'Two-factor authentication',
      'Notification preferences',
    ]
  },
];

const QUICK_LINKS: QuickLink[] = [
  { label: 'Video Tutorials', icon: Video, href: '#tutorials' },
  { label: 'Documentation', icon: Book, href: '#docs' },
  { label: 'FAQs', icon: HelpCircle, href: '#faqs' },
  { label: 'Contact Support', icon: MessageSquare, href: '#contact' },
];

export default function AgentHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  const filteredCategories = useMemo(() =>
    HELP_CATEGORIES.filter(cat =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.articles.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [searchQuery]
  );

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Find answers to your questions or contact our support team"
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" aria-hidden="true" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-11 bg-white/25 backdrop-blur-md border-white/30 text-white placeholder:text-white/80 focus:bg-white/30 focus:border-white/40 focus:ring-0"
                style={{ borderRadius: RADIUS.button }}
                aria-label="Search help articles"
              />
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="block"
              aria-label={link.label}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card
                className="border-0 cursor-pointer h-full overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
                <CardContent className="p-4 flex items-center gap-3 relative z-10">
                  <div
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <link.icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm text-white">{link.label}</span>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* Help Categories */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Topic</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredCategories.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p>No help articles found for "{searchQuery}"</p>
              </div>
            ) : filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover }}
              >
                <Card
                  className={cn(
                    "border-0 cursor-pointer transition-all",
                    expandedCategory === category.id && "ring-2 ring-violet-400"
                  )}
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                  }}
                  onClick={() => handleCategoryToggle(category.id)}
                  role="button"
                  aria-expanded={expandedCategory === category.id}
                  aria-label={`${category.title} - ${category.description}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <category.icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                      <ChevronRight className={cn(
                        "w-5 h-5 text-gray-400 transition-transform",
                        expandedCategory === category.id && "rotate-90"
                      )} aria-hidden="true" />
                    </div>

                    {expandedCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: MOTION.duration.expand }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <ul className="space-y-2">
                          {category.articles.map((article, idx) => (
                            <li key={idx}>
                              <a
                                href="#"
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Read article: ${article}`}
                              >
                                <FileText className="w-4 h-4" aria-hidden="true" />
                                {article}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-amber-400/15 rounded-full blur-xl" />
            <CardContent className="p-6 relative z-10">
              <h2 className="text-lg font-semibold text-white mb-2">Still need help?</h2>
              <p className="text-sm text-white/70 mb-6">
                Our support team is available Monday through Friday, 9am to 6pm CT.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <motion.a
                  href="tel:6307780800"
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                  style={{ borderRadius: RADIUS.button }}
                  aria-label="Call support at (630) 778-0800"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <div
                    className="w-10 h-10 bg-white/20 backdrop-blur flex items-center justify-center"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Phone className="w-5 h-5 text-amber-200" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Call Us</p>
                    <p className="text-xs text-white/70">(630) 778-0800</p>
                  </div>
                </motion.a>
                <motion.a
                  href="mailto:agents@heritagels.org"
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                  style={{ borderRadius: RADIUS.button }}
                  aria-label="Email support at agents@heritagels.org"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <div
                    className="w-10 h-10 bg-white/20 backdrop-blur flex items-center justify-center"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Mail className="w-5 h-5 text-amber-200" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Email</p>
                    <p className="text-xs text-white/70">agents@heritagels.org</p>
                  </div>
                </motion.a>
                <motion.a
                  href="#"
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                  style={{ borderRadius: RADIUS.button }}
                  aria-label="Start a live chat conversation"
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <div
                    className="w-10 h-10 bg-white/20 backdrop-blur flex items-center justify-center"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <MessageSquare className="w-5 h-5 text-amber-200" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Live Chat</p>
                    <p className="text-xs text-white/70">Start a conversation</p>
                  </div>
                </motion.a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
