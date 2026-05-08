import { useState } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  FileText,
  Target,
  Users,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Award,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Heart,
  Sparkles,
  Download,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";

// Core values
const CORE_VALUES = [
  {
    icon: Heart,
    title: 'Client First',
    description: 'Every decision we make starts with what\'s best for the client and their family.',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We do the right thing, even when no one is watching. Honesty is non-negotiable.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, continuously improving our skills.',
  },
  {
    icon: Users,
    title: 'Teamwork',
    description: 'We support each other, share knowledge, and celebrate wins together.',
  }
];

// Icon lookup for daily expectations
const EXPECTATION_ICONS: Record<string, typeof Target> = {
  clock: Clock,
  target: Target,
  shield: Shield,
  phone: Phone,
  star: Star,
  heart: Heart,
};

// Daily expectations
const DAILY_EXPECTATIONS = [
  { rule: 'In office by 8:30 AM', detail: 'Schedule abiding — be on time, every time', icon: 'clock' },
  { rule: '3 deals per day', detail: 'Minimum daily production target', icon: 'target' },
  { rule: 'Professional dress code', detail: 'Dress to impress — represent Heritage Life well', icon: 'shield' },
  { rule: 'Phone time: 5+ hours', detail: 'Minimum daily dial time on the phones', icon: 'phone' },
  { rule: 'In the office till 6:00 PM', detail: 'Standard hours; 9:00 PM to be elite', icon: 'clock' },
  { rule: 'Act professional', detail: 'Represent yourself and the company with integrity', icon: 'star' },
  { rule: 'Hold a high standard for yourself', detail: 'Push yourself to be better every day', icon: 'target' },
  { rule: 'Take care of the place', detail: 'Keep the office clean and organized', icon: 'heart' },
];

// Daily schedule
const DAILY_SCHEDULE = [
  { time: '8:30 AM', activity: 'Arrive', type: 'arrival' },
  { time: '8:45 - 9:00 AM', activity: 'Daily Meeting', type: 'meeting' },
  { time: '9:00 - 12:00 PM', activity: 'Dial Block #1', type: 'dial' },
  { time: '12:00 - 1:00 PM', activity: 'Lunch', type: 'break' },
  { time: '1:00 - 5:00 PM', activity: 'Dial Block #2', type: 'dial' },
  { time: '5:00 - 5:15 PM', activity: 'Meeting', type: 'meeting' },
  { time: '5:15 - 6:00 PM', activity: 'Dial Block #3', type: 'dial' },
  { time: '6:00 - 9:00 PM', activity: 'Dial / Teaching / Character Development', type: 'elite' },
];


// Commission structure — imported from shared single source of truth
import { COMMISSION_TIERS as SHARED_TIERS, AGENCY_TIERS as SHARED_AGENCY_TIERS } from '@/lib/commissionTiers';

const COMMISSION_TIERS = SHARED_TIERS.map((t) => ({
  ap: t.apLabel,
  rate: `${t.rate}%`,
  downlines: t.downlines,
}));

const AGENCY_TIERS = SHARED_AGENCY_TIERS.map((t) => ({
  ap: t.apLabel,
  rate: `${t.rate}%`,
  downlines: t.downlines,
}));

const COMP_GUIDELINES = [
  'Before reaching 80%, only one month of hitting numbers is required. After 80%, numbers must be achieved for two consecutive months.',
  'If targets are missed for two consecutive months after a comp change, compensation will be adjusted downward.',
];


// Compliance requirements
const COMPLIANCE_ITEMS = [
  {
    category: 'Sales Practices',
    items: [
      'Never misrepresent policy features or benefits',
      'Always provide accurate premium quotes',
      'Disclose all policy limitations and exclusions',
      'Never guarantee future dividends or returns',
      'Complete suitability analysis for every sale'
    ]
  },
  {
    category: 'Documentation',
    items: [
      'All applications must be signed and dated',
      'Keep copies of all client communications',
      'Document needs analysis conversations',
      'Maintain accurate records for 7 years minimum',
      'Report all complaints within 24 hours'
    ]
  },
  {
    category: 'Prohibited Actions',
    items: [
      'No rebating or inducements',
      'No replacement without disclosure',
      'No unauthorized use of company materials',
      'No sharing of client information',
      'No churning or twisting policies'
    ]
  }
];

// Best practices
const BEST_PRACTICES = [
  {
    title: 'Lead Management',
    practices: [
      'Call new leads within 5 minutes',
      'Follow up at least 7 times before closing',
      'Use multi-channel outreach (call, text, email)',
      'Set appointments within 48 hours of contact',
      'Track all touchpoints in the CRM'
    ]
  },
  {
    title: 'Client Meetings',
    practices: [
      'Always conduct a thorough needs analysis',
      'Present at least 2-3 product options',
      'Use visual aids and illustrations',
      'Address objections with empathy',
      'Set clear next steps before ending'
    ]
  },
  {
    title: 'Ongoing Service',
    practices: [
      'Review policies annually with clients',
      'Send birthday and policy anniversary cards',
      'Ask for referrals after positive experiences',
      'Respond to service requests within 24 hours',
      'Keep clients informed of new products'
    ]
  }
];

// Downloadable documents (demo file sizes)
const DOCUMENTS = [
  { title: 'Agent Handbook', size: '2.4 MB', type: 'PDF' },
  { title: 'Compliance Guide', size: '1.8 MB', type: 'PDF' },
  { title: 'Commission Schedule', size: '500 KB', type: 'PDF' },
  { title: 'Sales Scripts', size: '1.2 MB', type: 'PDF' },
  { title: 'Product Guide', size: '3.1 MB', type: 'PDF' }
];

export default function AgentGuidelines() {
  const [activeTab, setActiveTab] = useState('values');
  const [acknowledgment, setAcknowledgment] = useState(false);

  const handleDownload = (docTitle: string) => {
    toast.success('Download started', { description: docTitle });
    // TODO: Implement actual file download
  };

  const handleAcknowledge = () => {
    setAcknowledgment(true);
    toast.success('Guidelines acknowledged', { description: 'Thank you for reviewing our policies' });
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Header - Agent Lounge violet gradient */}
        <motion.div data-tour-id={TOUR.AGENT.GUIDELINES.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Scale}
            title="Guidelines & Expectations"
            subtitle="Standards, policies, and best practices for Heritage Life agents"
          >
            {acknowledgment ? (
              <Badge
                className="bg-emerald-500/20 text-emerald-200 border-0 px-4 py-2 backdrop-blur"
                style={{ borderRadius: RADIUS.pill }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Acknowledged
              </Badge>
            ) : (
              <Button
                onClick={handleAcknowledge}
                className="bg-white/20 backdrop-blur text-white border-0 hover:bg-white/30 transition-colors"
                style={{ borderRadius: RADIUS.button }}
              >
                Acknowledge Guidelines
              </Button>
            )}
          </AgentPageHero>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="mb-4 flex-wrap h-auto gap-1 p-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {[
                { value: 'values', icon: Heart, label: 'Values' },
                { value: 'performance', icon: Target, label: 'Performance' },
                { value: 'commission', icon: DollarSign, label: 'Commission' },
                { value: 'compliance', icon: Shield, label: 'Compliance' },
                { value: 'practices', icon: Sparkles, label: 'Best Practices' },
                { value: 'documents', icon: FileText, label: 'Documents' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <tab.icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Core Values Tab */}
            <TabsContent data-tour-id={TOUR.AGENT.GUIDELINES.CORE_VALUES} value="values" className="space-y-4">
              <motion.div
                className="grid md:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {CORE_VALUES.map((value) => {
                  const Icon = value.icon;
                  return (
                    <motion.div key={value.title} variants={fadeInUp}>
                      <motion.div
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      >
                        <Card
                          className="border-0 h-full overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                        >
                          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                          <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                          <CardContent className="p-6 relative z-10">
                            <div
                              className="w-12 h-12 flex items-center justify-center mb-4 bg-white/20 backdrop-blur"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <Icon className="w-6 h-6 text-amber-200" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                            <p className="text-white/80">{value.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Card
                    className="border-0"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Award className="w-6 h-6 text-amber-200" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Our Mission</h3>
                          <p className="text-gray-600">
                            To protect families across America by providing accessible, affordable life insurance
                            solutions while building a community of ethical, professional agents who prioritize
                            client needs above all else.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent data-tour-id={TOUR.AGENT.GUIDELINES.EXPECTATIONS} value="performance" className="space-y-4">
              {/* Daily Expectations */}
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Target className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Daily Expectations</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">What's expected of every Heritage Life agent, every day</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-gray-100">
                    {DAILY_EXPECTATIONS.map((item, idx) => {
                      const Icon = EXPECTATION_ICONS[item.icon] || Target;
                      return (
                        <div key={idx} className="flex items-center gap-3 px-2 py-3 hover:bg-violet-50/40 transition-colors" style={{ borderRadius: RADIUS.button }}>
                          <div
                            className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-4 h-4 text-amber-200" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{item.rule}</p>
                            <p className="text-xs text-gray-500">{item.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Schedule */}
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Clock className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Daily Schedule</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">Our standard day — stay till 9 PM to be elite</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-gray-100">
                    {DAILY_SCHEDULE.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-4 px-2 py-3">
                        <time className="text-sm font-semibold text-violet-700 w-36 flex-shrink-0">{block.time}</time>
                        <span className="font-medium text-sm text-gray-900 flex-1">{block.activity}</span>
                        {block.type === 'elite' && (
                          <Badge
                            className="bg-amber-100 text-amber-700 border-0 text-xs"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            Elite
                          </Badge>
                        )}
                        {block.type === 'dial' && (
                          <Badge
                            className="bg-emerald-100 text-emerald-700 border-0 text-xs"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            Dial
                          </Badge>
                        )}
                        {block.type === 'meeting' && (
                          <Badge
                            className="bg-violet-100 text-violet-700 border-0 text-xs"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            Meeting
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Tab */}
            <TabsContent data-tour-id={TOUR.AGENT.GUIDELINES.SCHEDULE} value="commission" className="space-y-4">
              {/* Comp Guidelines — top, gradient */}
              <Card
                className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-400/15 rounded-full blur-lg" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-white">Compensation Guidelines</span>
                      <p className="text-sm font-normal text-white/60 mt-0.5">Important rules to understand</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 relative z-10">
                  {COMP_GUIDELINES.map((guideline, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-200 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-sm text-white/90">{guideline}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agent Comp Tiers */}
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <DollarSign className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Compensation Tiers</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">65% starting contract — climb the ladder as your production grows</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-gray-100">
                    {COMMISSION_TIERS.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-4 px-2 py-3 hover:bg-violet-50/40 transition-colors">
                        <div
                          className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Star className="w-4 h-4 text-amber-200" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">{tier.ap}</p>
                          {tier.downlines && (
                            <p className="text-xs text-gray-500">{tier.downlines}</p>
                          )}
                        </div>
                        <Badge
                          className="bg-emerald-100 text-emerald-700 border-0 text-sm font-bold px-3"
                          style={{ borderRadius: RADIUS.pill }}
                        >
                          {tier.rate}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Agency Tiers */}
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Award className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Agency Level</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">For agency owners building teams</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-gray-100">
                    {AGENCY_TIERS.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-4 px-2 py-3 hover:bg-violet-50/40 transition-colors">
                        <div
                          className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Star className="w-4 h-4 text-amber-200" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">{tier.ap}</p>
                          <p className="text-xs text-gray-500">{tier.downlines}</p>
                        </div>
                        <Badge
                          className="bg-emerald-100 text-emerald-700 border-0 text-sm font-bold px-3"
                          style={{ borderRadius: RADIUS.pill }}
                        >
                          {tier.rate}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-4">
              {/* Non-Negotiable Banner */}
              <Card
                className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-400/15 rounded-full blur-lg" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur flex-shrink-0"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Compliance is Non-Negotiable</h4>
                      <p className="text-sm text-white/80 mt-1">
                        Violations of compliance standards may result in immediate termination and
                        reporting to state insurance departments. When in doubt, always ask.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Sections */}
              <div className="grid md:grid-cols-3 gap-4">
                {COMPLIANCE_ITEMS.map((section) => (
                  <Card
                    key={section.category}
                    className="border-0 h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Shield className="w-5 h-5 text-amber-200" aria-hidden="true" />
                        </div>
                        <span className="text-gray-900">{section.category}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Need Help */}
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardContent className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-3">Need Compliance Help?</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="gap-2 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                      style={{ borderRadius: RADIUS.button }}
                      asChild
                    >
                      <a href="tel:6307780800" aria-label="Call compliance at (630) 778-0800">
                        <Phone className="w-4 h-4" aria-hidden="true" />
                        (630) 778-0800
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-violet-700 border-violet-200 hover:bg-violet-50"
                      style={{ borderRadius: RADIUS.button }}
                      asChild
                    >
                      <a href="mailto:compliance@heritagels.org" aria-label="Email compliance at compliance@heritagels.org">
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        compliance@heritagels.org
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Best Practices Tab */}
            <TabsContent value="practices" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {BEST_PRACTICES.map((section) => (
                  <Card
                    key={section.title}
                    className="border-0 h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Sparkles className="w-5 h-5 text-amber-200" aria-hidden="true" />
                        </div>
                        <span className="text-gray-900">{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-3">
                        {section.practices.map((practice, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div
                              className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium bg-violet-100 text-violet-700"
                              style={{ borderRadius: RADIUS.pill }}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-gray-700">{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card
                className="border-0"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <FileText className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Downloadable Resources</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">Official documents and guides for Heritage Life agents</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {DOCUMENTS.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium">No documents available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {DOCUMENTS.map((doc) => (
                        <button
                          key={doc.title}
                          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-violet-50/40 transition-colors text-left"
                          onClick={() => handleDownload(doc.title)}
                          style={{ borderRadius: RADIUS.button }}
                          aria-label={`Download ${doc.title} (${doc.type}, ${doc.size})`}
                        >
                          <div
                            className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <FileText className="w-4 h-4 text-amber-200" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.type} · {doc.size}</p>
                          </div>
                          <div
                            className="w-8 h-8 flex items-center justify-center bg-violet-100 hover:bg-violet-200 transition-colors"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Download className="w-4 h-4 text-violet-600" aria-hidden="true" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
