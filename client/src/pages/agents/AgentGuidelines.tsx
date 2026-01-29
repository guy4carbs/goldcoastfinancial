import { useState } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Core values
const CORE_VALUES = [
  {
    icon: Heart,
    title: 'Client First',
    description: 'Every decision we make starts with what\'s best for the client and their family.',
    color: 'text-red-500 bg-red-50'
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We do the right thing, even when no one is watching. Honesty is non-negotiable.',
    color: 'text-blue-500 bg-blue-50'
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, continuously improving our skills.',
    color: 'text-purple-500 bg-purple-50'
  },
  {
    icon: Users,
    title: 'Teamwork',
    description: 'We support each other, share knowledge, and celebrate wins together.',
    color: 'text-green-500 bg-green-50'
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

const SCHEDULE_STYLES: Record<string, string> = {
  arrival: 'bg-blue-100 text-blue-700 border-blue-200',
  meeting: 'bg-purple-100 text-purple-700 border-purple-200',
  dial: 'bg-green-100 text-green-700 border-green-200',
  break: 'bg-gray-100 text-gray-600 border-gray-200',
  elite: 'bg-amber-100 text-amber-700 border-amber-200',
};

// Commission structure
const COMMISSION_TIERS = [
  { tier: 'New Agent', apRange: '$0 - $10K/mo', rate: '75%', bonus: '-' },
  { tier: 'Agent', apRange: '$10K - $25K/mo', rate: '85%', bonus: '2% Override' },
  { tier: 'Senior Agent', apRange: '$25K - $50K/mo', rate: '95%', bonus: '5% Override' },
  { tier: 'Elite Agent', apRange: '$50K+/mo', rate: '105%', bonus: '10% Override' }
];

const TIER_STAR_COLORS = [
  'text-gray-300',
  'text-blue-500',
  'text-purple-500',
  'text-amber-500',
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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="bg-gradient-to-r from-primary to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                  <Scale className="w-7 h-7" aria-hidden="true" />
                  Guidelines & Expectations
                </h1>
                <p className="text-gray-100">
                  Standards, policies, and best practices for Heritage Life agents
                </p>
              </div>
              <div className="flex items-center gap-3">
                {acknowledgment ? (
                  <Badge className="bg-emerald-500 text-white px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Acknowledged
                  </Badge>
                ) : (
                  <Button variant="secondary" onClick={handleAcknowledge}>
                    Acknowledge Guidelines
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Quick navigation to guideline sections">
                {[
                  { value: 'values', label: 'Core Values' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'commission', label: 'Commission' },
                  { value: 'compliance', label: 'Compliance' },
                  { value: 'practices', label: 'Best Practices' },
                  { value: 'documents', label: 'Documents' },
                ].map((link) => (
                  <Button
                    key={link.value}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "hover:bg-primary/5",
                      activeTab === link.value && "bg-primary/10 border-primary text-primary"
                    )}
                    onClick={() => setActiveTab(link.value)}
                    aria-label={`Go to ${link.label} section`}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="values" className="gap-2">
                <Heart className="w-4 h-4" aria-hidden="true" />
                Values
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <Target className="w-4 h-4" aria-hidden="true" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="commission" className="gap-2">
                <DollarSign className="w-4 h-4" aria-hidden="true" />
                Commission
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2">
                <Shield className="w-4 h-4" aria-hidden="true" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="practices" className="gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Best Practices
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="w-4 h-4" aria-hidden="true" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Core Values Tab */}
            <TabsContent value="values" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {CORE_VALUES.map((value) => {
                  const Icon = value.icon;
                  return (
                    <Card key={value.title}>
                      <CardContent className="p-6">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", value.color)}>
                          <Icon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary mb-2">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Award className="w-8 h-8 text-primary flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-primary mb-2">Our Mission</h3>
                      <p className="text-gray-700">
                        To protect families across America by providing accessible, affordable life insurance
                        solutions while building a community of ethical, professional agents who prioritize
                        client needs above all else.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              {/* Daily Expectations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" aria-hidden="true" />
                    Daily Expectations
                  </CardTitle>
                  <CardDescription>
                    What's expected of every Heritage Life agent, every day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {DAILY_EXPECTATIONS.map((item, idx) => {
                      const Icon = EXPECTATION_ICONS[item.icon] || Target;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary/5 transition-colors">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.rule}</p>
                            <p className="text-xs text-gray-500">{item.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                    Daily Schedule
                  </CardTitle>
                  <CardDescription>
                    Our standard day — stay till 9 PM to be elite
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {DAILY_SCHEDULE.map((block, idx) => {
                      const style = SCHEDULE_STYLES[block.type] || SCHEDULE_STYLES.dial;
                      return (
                        <div key={idx} className={cn("flex items-center gap-4 p-3 rounded-lg border", style)}>
                          <time className="text-sm font-semibold w-36 flex-shrink-0">{block.time}</time>
                          <span className="font-medium text-sm">{block.activity}</span>
                          {block.type === 'elite' && (
                            <Badge className="ml-auto bg-amber-500 text-white text-xs">Elite</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commission Tab */}
            <TabsContent value="commission" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" aria-hidden="true" />
                    Commission Structure
                  </CardTitle>
                  <CardDescription>
                    Your earnings grow as your production increases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <caption className="sr-only">Commission tiers showing monthly AP range, rate, and team bonus</caption>
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th scope="col" className="text-left p-3 text-sm font-medium text-gray-500">Tier</th>
                          <th scope="col" className="text-left p-3 text-sm font-medium text-gray-500">Monthly AP</th>
                          <th scope="col" className="text-center p-3 text-sm font-medium text-gray-500">Commission Rate</th>
                          <th scope="col" className="text-center p-3 text-sm font-medium text-gray-500">Team Bonus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMMISSION_TIERS.map((tier, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Star
                                  className={cn("w-4 h-4", TIER_STAR_COLORS[idx] || 'text-gray-300')}
                                  aria-hidden="true"
                                />
                                <span className="font-medium">{tier.tier}</span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">{tier.apRange}</td>
                            <td className="p-3 text-center">
                              <Badge className="bg-emerald-100 text-emerald-700 text-lg px-4">
                                {tier.rate}
                              </Badge>
                            </td>
                            <td className="p-3 text-center text-gray-600">{tier.bonus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 pt-6 border-t grid sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-6 h-6 text-primary mx-auto mb-2" aria-hidden="true" />
                      <p className="font-medium">Payment Schedule</p>
                      <p className="text-sm text-gray-600">Weekly on Fridays</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" aria-hidden="true" />
                      <p className="font-medium">Minimum Payout</p>
                      <p className="text-sm text-gray-600">$100</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto mb-2" aria-hidden="true" />
                      <p className="font-medium">Direct Deposit</p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-4">
              <Card className="bg-red-50 border-red-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-medium text-red-800">Compliance is Non-Negotiable</h4>
                      <p className="text-sm text-red-700">
                        Violations of compliance standards may result in immediate termination and
                        reporting to state insurance departments. When in doubt, always ask.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                {COMPLIANCE_ITEMS.map((section) => (
                  <Card key={section.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Need Compliance Help?</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                      <a href="tel:8005550199" aria-label="Call compliance department at (800) 555-0199">
                        <Phone className="w-4 h-4" aria-hidden="true" />
                        Call Compliance: (800) 555-0199
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2" asChild>
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
                  <Card key={section.title}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {section.practices.map((practice, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                              {idx + 1}
                            </div>
                            <span>{practice}</span>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                    Downloadable Resources
                  </CardTitle>
                  <CardDescription>
                    Official documents and guides for Heritage Life agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {DOCUMENTS.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium">No documents available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {DOCUMENTS.map((doc) => (
                        <button
                          key={doc.title}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          onClick={() => handleDownload(doc.title)}
                          aria-label={`Download ${doc.title} (${doc.type}, ${doc.size})`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-600" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.type} - {doc.size}</p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-gray-400" aria-hidden="true" />
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
