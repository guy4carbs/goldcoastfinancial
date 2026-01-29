import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  BookOpen,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  TrendingUp,
  Users,
  Headphones,
  Clock,
  Search,
  Building,
  Heart,
  Home,
  PiggyBank,
  ChevronDown,
  Folder,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Product guides data with detailed content
const productGuides = [
  {
    id: "term",
    title: "Term Life Insurance",
    icon: Shield,
    description: "Affordable coverage for a specific period",
    keyPoints: ["10-30 year terms", "Most affordable option", "Convertible to permanent"],
    commission: "90-110% first year",
    detailedContent: {
      targetMarket: "Young families, homeowners with mortgages, income earners needing temporary protection",
      idealClient: "Ages 25-55 with dependents, household income $50K+, seeking maximum coverage at lowest cost",
      keyBenefits: [
        "Lowest premium per $1,000 of coverage",
        "Level premiums for entire term (10, 15, 20, or 30 years)",
        "Convertible to permanent insurance without medical underwriting",
        "Living benefits (chronic/critical/terminal illness riders) available"
      ],
      commonObjections: [
        { objection: "I'll outlive the policy", response: "Term converts to permanent coverage. Most clients upgrade as their budget allows." },
        { objection: "What happens when it expires?", response: "You can renew annually or convert to permanent. Many policies have guaranteed renewal." },
        { objection: "It doesn't build cash value", response: "Focus on protection first. Invest the premium savings in retirement accounts for better returns." }
      ],
      carriers: ["Protective", "Lincoln Financial", "Transamerica", "Banner"]
    }
  },
  {
    id: "whole",
    title: "Whole Life Insurance",
    icon: Heart,
    description: "Permanent coverage with cash value growth",
    keyPoints: ["Lifetime coverage", "Guaranteed cash value", "Potential dividends"],
    commission: "50-90% first year",
    detailedContent: {
      targetMarket: "Estate planning clients, business owners, families seeking permanent protection",
      idealClient: "Ages 30-60 with stable income, seeking guaranteed death benefit and cash value accumulation",
      keyBenefits: [
        "Guaranteed death benefit that never expires",
        "Guaranteed cash value growth (typically 2-4% annually)",
        "Potential participating dividends (mutual companies)",
        "Policy loans available tax-free",
        "Cash value can supplement retirement income"
      ],
      commonObjections: [
        { objection: "Premiums are too high", response: "Compare 30-year total cost to term. Whole life builds equity you can access." },
        { objection: "I can invest better elsewhere", response: "This is guaranteed growth plus a death benefit. It's a foundation, not your only investment." },
        { objection: "I don't need lifetime coverage", response: "Final expenses, estate taxes, and legacy goals don't expire. Neither should your coverage." }
      ],
      carriers: ["Northwestern Mutual", "MassMutual", "New York Life", "Guardian"]
    }
  },
  {
    id: "iul",
    title: "Indexed Universal Life",
    icon: TrendingUp,
    description: "Flexible coverage with market-linked growth",
    keyPoints: ["Market participation", "Downside protection", "Tax-free loans"],
    commission: "80-110% first year",
    detailedContent: {
      targetMarket: "High earners maxing out 401k/IRA, business owners, clients seeking tax-advantaged growth",
      idealClient: "Ages 30-55, income $100K+, seeking flexible premium payments with growth potential",
      keyBenefits: [
        "Cash value grows based on index performance (S&P 500, etc.)",
        "0% floor protects against market losses",
        "Tax-free policy loans for retirement supplementation",
        "Flexible premiums and death benefit adjustments",
        "Living benefits riders available"
      ],
      commonObjections: [
        { objection: "Caps limit my upside", response: "You get market participation with zero downside. The cap is the cost of that protection." },
        { objection: "It's too complicated", response: "Think of it as 'heads I win, tails I don't lose' on your cash value growth." },
        { objection: "Fees are too high", response: "Compare net returns to after-tax investment gains. Tax-free distributions often win." }
      ],
      carriers: ["Pacific Life", "Lincoln Financial", "Protective", "Nationwide", "Allianz"]
    }
  },
  {
    id: "final-expense",
    title: "Final Expense",
    icon: Users,
    description: "Simplified issue whole life for seniors",
    keyPoints: ["Easy qualification", "No medical exam", "Quick issue"],
    commission: "100-120% first year",
    detailedContent: {
      targetMarket: "Seniors 50-85 concerned about burdening family with funeral costs",
      idealClient: "Ages 50-80, fixed income, health conditions that prevent traditional underwriting",
      keyBenefits: [
        "Simplified underwriting - no medical exam required",
        "Coverage from $5,000 to $50,000",
        "Level premiums that never increase",
        "Benefits paid within 24-48 hours",
        "Can cover burial, medical bills, and small debts"
      ],
      commonObjections: [
        { objection: "I don't want my family to pay if I die", response: "That's exactly why we're here. $10K is average funeral cost - who will pay if you don't plan?" },
        { objection: "I already have burial insurance", response: "Let's review it. Many older policies have inadequate coverage for today's costs." },
        { objection: "I can't afford another bill", response: "Coverage can start at $15-25/month. That's less than cable TV to protect your family." }
      ],
      carriers: ["Mutual of Omaha", "ANICO", "Foresters", "Gerber Life", "Colonial Penn"]
    }
  },
  {
    id: "mortgage",
    title: "Mortgage Protection",
    icon: Home,
    description: "Coverage tied to mortgage balance",
    keyPoints: ["Protects family's home", "Living benefits", "ROP options"],
    commission: "90-110% first year",
    detailedContent: {
      targetMarket: "New homeowners, refinancers, families with significant mortgage debt",
      idealClient: "Ages 25-60 with mortgage, primary income earner, family in the home",
      keyBenefits: [
        "Death benefit covers remaining mortgage balance",
        "Living benefits if you can't work due to illness",
        "Return of Premium (ROP) options available",
        "Can be level or decreasing term structure",
        "Often easier to qualify than traditional term"
      ],
      commonObjections: [
        { objection: "My work insurance covers this", response: "Work coverage ends when employment ends. This policy stays with you regardless of job." },
        { objection: "The bank offers mortgage insurance", response: "Bank insurance pays THEM. This pays YOUR family who can use it however they need." },
        { objection: "I'll just sell the house if something happens", response: "In a crisis, that's the worst time to make that decision. Protection gives options." }
      ],
      carriers: ["Transamerica", "Mutual of Omaha", "Protective", "Lincoln Financial"]
    }
  },
  {
    id: "annuities",
    title: "Fixed & Indexed Annuities",
    icon: PiggyBank,
    description: "Guaranteed income and tax-deferred growth",
    keyPoints: ["Principal protection", "Tax deferral", "Lifetime income"],
    commission: "4-7% of premium",
    detailedContent: {
      targetMarket: "Pre-retirees, retirees seeking guaranteed income, conservative savers",
      idealClient: "Ages 50-75, has qualified or non-qualified funds, seeking guaranteed income stream",
      keyBenefits: [
        "100% principal protection - never lose money to market",
        "Tax-deferred growth until withdrawal",
        "Lifetime income rider guarantees income you can't outlive",
        "Indexed annuities offer market-linked growth with floor protection",
        "Avoids probate - passes directly to beneficiaries"
      ],
      commonObjections: [
        { objection: "I don't want my money locked up", response: "Most allow 10% free withdrawal annually. Income starts when YOU decide." },
        { objection: "What about inflation?", response: "Index-linked growth can outpace inflation. Guaranteed income provides stability for planning." },
        { objection: "The fees are too high", response: "There are NO fees unless you add optional riders. Base contract is fee-free growth." }
      ],
      carriers: ["Athene", "Allianz", "Pacific Life", "Nationwide", "Lincoln Financial"]
    }
  },
];

// Marketing materials data
const marketingMaterials = [
  { category: "Client Brochures", count: 5, icon: FileText },
  { category: "Presentation Decks", count: 4, icon: Folder },
  { category: "Social Media", count: 4, icon: Users },
  { category: "Email Templates", count: 4, icon: Mail },
];

// Carriers data
const carriers = [
  { name: "American Home Life", products: ["Final Expense", "Whole Life"], rating: "A-", portal: "https://ahlpatriotseries.com/new-agent-portal/" },
  { name: "Americo", products: ["Term", "IUL", "Final Expense"], rating: "A", portal: "https://portal.americoagent.com/" },
  { name: "Athene", products: ["Fixed Annuities", "FIA"], rating: "A", portal: "https://www.athene.com/producer/login" },
  { name: "Baltimore Life", products: ["Term", "Whole Life", "Final Expense"], rating: "A-", portal: "https://agentportal.baltlife.com/" },
  { name: "Corebridge", products: ["Term", "IUL", "Annuities"], rating: "A+", portal: "https://www.connext.corebridgefinancial.com/life/connext-portal/public/login" },
  { name: "Ethos", products: ["Term", "Whole Life"], rating: "A", portal: "https://agents.ethoslife.com/login" },
  { name: "Ladder", products: ["Term"], rating: "A", portal: "https://www.ladderlife.com/advisors/login" },
  { name: "Lincoln Financial", products: ["Term", "IUL", "Annuities"], rating: "A+", portal: "https://www.lincolnfinancial.com/public/general/registration" },
  { name: "Mutual of Omaha", products: ["Term", "Final Expense"], rating: "A+", portal: "https://producer.mutualofomaha.com/" },
  { name: "Polish Falcons", products: ["Whole Life", "Final Expense"], rating: "A-", portal: "https://www.polishfalcons.org/" },
  { name: "Royal Neighbors", products: ["Term", "Whole Life", "Final Expense"], rating: "A", portal: "https://agent.royalneighbors.org/" },
  { name: "Transamerica", products: ["Term", "Whole Life", "IUL"], rating: "A", portal: "https://transact.transamerica.com/" },
];

const ratingColors: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A': 'bg-green-100 text-green-700',
  'A-': 'bg-blue-100 text-blue-700',
};

// Support contacts
const supportContacts = [
  { department: "New Business", phone: "ext. 1", email: "newbusiness@heritagels.org" },
  { department: "Underwriting", phone: "ext. 2", email: "underwriting@heritagels.org" },
  { department: "Contracting", phone: "ext. 3", email: "contracting@heritagels.org" },
  { department: "Agent Development", phone: "ext. 4", email: "development@heritagels.org" },
];

export default function AgentResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const filteredCarriers = useMemo(() => carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carrier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery]);

  const handleDownloadMarketing = (category: string, count: number) => {
    toast.success(`Downloading ${category}`, {
      description: `Preparing ${count} files for download...`
    });
    // TODO: Implement actual file download
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
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Resources</h1>
            <p className="text-sm text-gray-600">Guides, training, marketing materials, and support</p>
          </div>
          <Button variant="outline" asChild>
            <a href="tel:6307780800" aria-label="Call support at (630) 778-0800">
              <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
              (630) 778-0800
            </a>
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Product Guides', value: productGuides.length, icon: BookOpen, color: 'text-primary' },
            { label: 'Carrier Partners', value: carriers.length, icon: Building, color: 'text-blue-600' },
            { label: 'Downloads', value: marketingMaterials.reduce((acc, m) => acc + m.count, 0), icon: Download, color: 'text-purple-600' },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="guides" className="space-y-6">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="guides" className="data-[state=active]:bg-white">
                <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="marketing" className="data-[state=active]:bg-white">
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Marketing
              </TabsTrigger>
              <TabsTrigger value="carriers" className="data-[state=active]:bg-white">
                <Building className="w-4 h-4 mr-2" aria-hidden="true" />
                Carriers
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-white">
                <Headphones className="w-4 h-4 mr-2" aria-hidden="true" />
                Support
              </TabsTrigger>
            </TabsList>

            {/* Product Guides Tab */}
            <TabsContent value="guides" className="space-y-4">
              {productGuides.map((guide) => {
                const Icon = guide.icon;
                const isExpanded = expandedGuide === guide.id;
                return (
                  <Card key={guide.id} className="border-gray-100">
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                        aria-expanded={isExpanded}
                        aria-label={`${guide.title} - ${guide.description}. ${isExpanded ? 'Collapse' : 'Expand'} details`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-primary">{guide.title}</h3>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                        </div>
                        <Badge variant="outline" className="hidden sm:flex">
                          {guide.commission}
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-gray-400 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                              {/* Key Points */}
                              <div className="flex flex-wrap gap-2">
                                {guide.keyPoints.map((point, idx) => (
                                  <Badge key={idx} className="bg-primary/10 text-primary">
                                    {point}
                                  </Badge>
                                ))}
                              </div>

                              {/* Target Market & Ideal Client */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-blue-700 mb-1">Target Market</p>
                                  <p className="text-sm text-blue-900">{guide.detailedContent.targetMarket}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-green-700 mb-1">Ideal Client</p>
                                  <p className="text-sm text-green-900">{guide.detailedContent.idealClient}</p>
                                </div>
                              </div>

                              {/* Key Benefits */}
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">Key Benefits to Emphasize</p>
                                <ul className="grid sm:grid-cols-2 gap-1">
                                  {guide.detailedContent.keyBenefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                      <span className="text-primary mt-1">•</span>
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Common Objections */}
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">Handling Common Objections</p>
                                <div className="space-y-2">
                                  {guide.detailedContent.commonObjections.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-sm font-medium text-red-600 mb-1">"{item.objection}"</p>
                                      <p className="text-sm text-gray-700">→ {item.response}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Carriers & Commission */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Recommended Carriers</p>
                                  <div className="flex flex-wrap gap-1">
                                    {guide.detailedContent.carriers.map((carrier, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {carrier}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Commission</p>
                                  <p className="text-lg font-bold text-primary">{guide.commission}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing">
              <div className="grid sm:grid-cols-2 gap-4">
                {marketingMaterials.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.category}
                      className="border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleDownloadMarketing(category.category, category.count)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary">{category.category}</h3>
                            <p className="text-sm text-gray-600">{category.count} files available</p>
                          </div>
                          <Download className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Card className="border-gray-100 mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-primary mb-2">Custom Marketing Requests</h3>
                  <p className="text-sm text-gray-600 mb-4">Need personalized materials with your contact information?</p>
                  <Button variant="outline" asChild>
                    <a href="mailto:marketing@heritagels.org" aria-label="Email marketing team for custom materials">
                      <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                      Request Custom Materials
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Carriers Tab */}
            <TabsContent value="carriers" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <Input
                  placeholder="Search carriers or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search carriers by name or product"
                />
              </div>
              {filteredCarriers.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 font-medium">No carriers match your search</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different carrier name or product type</p>
                  <Button
                    variant="link"
                    className="mt-2 text-violet-600"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCarriers.map((carrier) => (
                    <Card key={carrier.name} className="border-gray-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-primary">{carrier.name}</h3>
                          <Badge
                            className={ratingColors[carrier.rating] || 'bg-gray-100 text-gray-700'}
                            aria-label={`AM Best rating: ${carrier.rating}`}
                          >
                            {carrier.rating}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {carrier.products.map((product, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
                          <a
                            href={carrier.portal}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${carrier.name} agent portal in new tab`}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" aria-hidden="true" />
                            Open Portal
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {supportContacts.map((contact) => (
                  <Card key={contact.department} className="border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Headphones className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary">{contact.department}</h3>
                          <div className="space-y-1 mt-2 text-sm">
                            <a
                              href="tel:6307780800"
                              className="flex items-center gap-2 text-gray-600 hover:text-primary"
                              aria-label={`Call ${contact.department} at (630) 778-0800 ${contact.phone}`}
                            >
                              <Phone className="w-3 h-3" aria-hidden="true" />
                              (630) 778-0800 {contact.phone}
                            </a>
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-primary"
                              aria-label={`Email ${contact.department} at ${contact.email}`}
                            >
                              <Mail className="w-3 h-3" aria-hidden="true" />
                              {contact.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <p className="text-sm text-gray-600">Mon-Fri 8am-6pm CT • Urgent: (630) 778-0800 option 0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
