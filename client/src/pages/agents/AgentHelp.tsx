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

// Type definitions
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  articles: string[];
}

interface QuickLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

// Constants
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to the platform? Start here',
    icon: Lightbulb,
    color: 'bg-amber-500/10 text-amber-600',
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
    color: 'bg-blue-500/10 text-blue-600',
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
    color: 'bg-emerald-500/10 text-emerald-600',
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
    color: 'bg-primary/10 text-primary',
    articles: [
      'Completing training modules',
      'Tracking your certifications',
      'Earning XP and leveling up',
      'Compliance requirements',
    ]
  },
  {
    id: 'earnings',
    title: 'Commissions & Earnings',
    description: 'Track your income',
    icon: DollarSign,
    color: 'bg-emerald-500/10 text-emerald-600',
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
    color: 'bg-red-500/10 text-red-600',
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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={FADE_IN_UP} className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Help & Support</h1>
          <p className="text-sm text-gray-600 mt-2">
            Find answers to your questions or contact our support team
          </p>

          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 h-12 text-base"
              aria-label="Search help articles"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={FADE_IN_UP} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block"
              aria-label={link.label}
            >
              <Card className="border-gray-100 hover:border-primary/20 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <link.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-sm text-primary">{link.label}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </motion.div>

        {/* Help Categories */}
        <motion.div variants={FADE_IN_UP}>
          <h2 className="text-lg font-semibold text-primary mb-4">Browse by Topic</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredCategories.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p>No help articles found for "{searchQuery}"</p>
              </div>
            ) : filteredCategories.map((category) => (
              <Card
                key={category.id}
                className={cn(
                  "border-gray-100 cursor-pointer transition-all",
                  expandedCategory === category.id && "ring-2 ring-primary"
                )}
                onClick={() => handleCategoryToggle(category.id)}
                role="button"
                aria-expanded={expandedCategory === category.id}
                aria-label={`${category.title} - ${category.description}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category.color)}>
                      <category.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{category.title}</h3>
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
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <ul className="space-y-2">
                        {category.articles.map((article, idx) => (
                          <li key={idx}>
                            <a
                              href="#"
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
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
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Still need help?</h2>
              <p className="text-sm text-gray-600 mb-6">
                Our support team is available Monday through Friday, 9am to 6pm PT.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <a
                  href="tel:6307780800"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors"
                  aria-label="Call support at (630) 778-0800"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-primary">Call Us</p>
                    <p className="text-xs text-gray-500">(630) 778-0800</p>
                  </div>
                </a>
                <a
                  href="mailto:agents@heritagels.org"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors"
                  aria-label="Email support at agents@heritagels.org"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-primary">Email</p>
                    <p className="text-xs text-gray-500">agents@heritagels.org</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors"
                  aria-label="Start a live chat conversation"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-primary">Live Chat</p>
                    <p className="text-xs text-gray-500">Start a conversation</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
