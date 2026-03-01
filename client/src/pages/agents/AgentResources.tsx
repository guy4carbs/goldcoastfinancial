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
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { AgentPageHero } from "@/components/agent/primitives";

// Product guides data with detailed content
const productGuides = [
  {
    id: "term",
    title: "Term Life Insurance",
    icon: Shield,
    description: "Affordable coverage for a specific period",
    keyPoints: ["10-30 year terms", "Most affordable option", "Convertible to permanent"],
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
      carriers: ["Lincoln Financial", "Transamerica", "Americo", "Corebridge", "Ethos", "Ladder"]
    }
  },
  {
    id: "whole",
    title: "Whole Life Insurance",
    icon: Heart,
    description: "Permanent coverage with cash value growth",
    keyPoints: ["Lifetime coverage", "Guaranteed cash value", "Potential dividends"],
    detailedContent: {
      targetMarket: "Estate planning clients, business owners, families seeking permanent protection",
      idealClient: "Ages 30-60 with stable income, seeking guaranteed death benefit and cash value accumulation",
      keyBenefits: [
        "Guaranteed death benefit that never expires",
        "Cash value grows at a guaranteed rate over time",
        "Potential participating dividends from mutual carriers",
        "Policy loans available tax-free",
        "Cash value can supplement retirement income"
      ],
      commonObjections: [
        { objection: "Premiums are too high", response: "Compare 30-year total cost to term. Whole life builds equity you can access." },
        { objection: "I can invest better elsewhere", response: "This is guaranteed growth plus a death benefit. It's a foundation, not your only investment." },
        { objection: "I don't need lifetime coverage", response: "Final expenses, estate taxes, and legacy goals don't expire. Neither should your coverage." }
      ],
      carriers: ["Ethos", "Baltimore Life", "Royal Neighbors", "Polish Falcons", "Transamerica"]
    }
  },
  {
    id: "iul",
    title: "Indexed Universal Life",
    icon: TrendingUp,
    description: "Flexible coverage with market-linked growth",
    keyPoints: ["Market participation", "Downside protection", "Tax-free loans"],
    detailedContent: {
      targetMarket: "High earners maximizing retirement savings, business owners, clients seeking tax-advantaged growth",
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
      carriers: ["Lincoln Financial", "Corebridge", "Americo", "Transamerica"]
    }
  },
  {
    id: "final-expense",
    title: "Final Expense",
    icon: Users,
    description: "Simplified issue whole life for seniors",
    keyPoints: ["Easy qualification", "No medical exam", "Quick issue"],
    detailedContent: {
      targetMarket: "Seniors 50-85 concerned about burdening family with funeral costs",
      idealClient: "Ages 50-80, fixed income, health conditions that may prevent traditional underwriting",
      keyBenefits: [
        "Simplified underwriting — no medical exam required",
        "Coverage typically from $5,000 to $50,000",
        "Level premiums that never increase",
        "Benefits paid directly to named beneficiary",
        "Can cover burial, medical bills, and outstanding debts"
      ],
      commonObjections: [
        { objection: "I don't want my family to pay if I die", response: "That's exactly why we're here. Average funeral cost is $8K-$12K — who will pay if you don't plan?" },
        { objection: "I already have burial insurance", response: "Let's review it. Many older policies have inadequate coverage for today's costs." },
        { objection: "I can't afford another bill", response: "Coverage can start at $20-30/month. That's less than a streaming subscription to protect your family." }
      ],
      carriers: ["Mutual of Omaha", "American Home Life", "Americo", "Baltimore Life", "Royal Neighbors"]
    }
  },
  {
    id: "mortgage",
    title: "Mortgage Protection",
    icon: Home,
    description: "Coverage tied to mortgage balance",
    keyPoints: ["Protects family's home", "Living benefits", "Level or decreasing term"],
    detailedContent: {
      targetMarket: "New homeowners, refinancers, families with significant mortgage debt",
      idealClient: "Ages 25-60 with mortgage, primary income earner, family in the home",
      keyBenefits: [
        "Death benefit covers remaining mortgage balance",
        "Living benefits if you can't work due to illness",
        "Can be structured as level or decreasing term",
        "Pays your family — not the bank",
        "Portable coverage that stays with you regardless of employer"
      ],
      commonObjections: [
        { objection: "My work insurance covers this", response: "Work coverage ends when employment ends. This policy stays with you regardless of job." },
        { objection: "The bank offers mortgage insurance", response: "Bank insurance pays THEM. This pays YOUR family who can use it however they need." },
        { objection: "I'll just sell the house if something happens", response: "In a crisis, that's the worst time to make that decision. Protection gives options." }
      ],
      carriers: ["Transamerica", "Mutual of Omaha", "Lincoln Financial", "Americo", "Corebridge"]
    }
  },
  {
    id: "annuities",
    title: "Fixed & Indexed Annuities",
    icon: PiggyBank,
    description: "Guaranteed income and tax-deferred growth",
    keyPoints: ["Principal protection", "Tax deferral", "Lifetime income"],
    detailedContent: {
      targetMarket: "Pre-retirees, retirees seeking guaranteed income, conservative savers",
      idealClient: "Ages 50-75, has qualified or non-qualified funds, seeking guaranteed income stream",
      keyBenefits: [
        "Principal protection — never lose money to market downturns",
        "Tax-deferred growth until withdrawal",
        "Lifetime income riders available to guarantee income you can't outlive",
        "Indexed annuities offer market-linked growth with floor protection",
        "Avoids probate — passes directly to named beneficiaries"
      ],
      commonObjections: [
        { objection: "I don't want my money locked up", response: "Most contracts allow penalty-free withdrawals annually. Income starts when YOU decide." },
        { objection: "What about inflation?", response: "Index-linked growth can keep pace with inflation. Guaranteed income provides stability for planning." },
        { objection: "The fees are too high", response: "Base fixed annuity contracts typically have no annual fees. Optional riders may have costs for added guarantees." }
      ],
      carriers: ["Athene", "Corebridge", "Lincoln Financial"]
    }
  },
];

// Resource downloads
const resourceDownloads = [
  { title: "Term Life Insurance Guide", description: "Product overview, talking points & carrier comparison", icon: Shield },
  { title: "Whole Life Insurance Guide", description: "Cash value breakdown, dividends & client scenarios", icon: Heart },
  { title: "Indexed Universal Life Guide", description: "IUL mechanics, illustrations & sales strategies", icon: TrendingUp },
  { title: "Final Expense Guide", description: "Simplified issue products, scripts & lead approaches", icon: Users },
  { title: "Mortgage Protection Guide", description: "Homeowner outreach, objection handling & quoting", icon: Home },
  { title: "Annuities Guide", description: "Fixed & indexed annuity products, suitability & income planning", icon: PiggyBank },
  { title: "Compensation Sheet", description: "Commission schedules, bonus tiers & incentive programs", icon: FileText },
  { title: "Agent Guide", description: "Onboarding, compliance, systems & best practices", icon: BookOpen },
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
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Folder}
            title="Resources"
            subtitle="Guides, training, marketing materials, and support"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/60 font-medium">Contact Support</div>
                <a href="tel:6307780800" className="text-sm font-semibold text-white hover:text-amber-200 transition-colors">(630) 778-0800</a>
              </div>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Product Guides', value: productGuides.length, icon: BookOpen },
            { label: 'Carrier Partners', value: carriers.length, icon: Building },
            { label: 'Downloads', value: resourceDownloads.length, icon: Download },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card
                className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card
                }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/70 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="guides" className="space-y-6">
            <TabsList
              className="p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {[
                { value: "guides", icon: FileText, label: "Guides" },
                { value: "marketing", icon: Download, label: "Resources" },
                { value: "carriers", icon: Building, label: "Carriers" },
                { value: "support", icon: Headphones, label: "Support" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <tab.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Product Guides Tab */}
            <TabsContent value="guides">
              <Card
                className="border-0 overflow-hidden"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CardContent className="p-0 divide-y divide-gray-200/80">
                  {productGuides.map((guide) => {
                    const Icon = guide.icon;
                    const isExpanded = expandedGuide === guide.id;
                    return (
                      <div key={guide.id}>
                        <button
                          onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-violet-50/40 transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={`${guide.title} - ${guide.description}. ${isExpanded ? 'Collapse' : 'Expand'} details`}
                        >
                          <div
                            className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                            <p className="text-sm text-gray-500">{guide.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 hidden sm:flex">
                            {guide.keyPoints.map((point, idx) => (
                              <Badge
                                key={idx}
                                className="bg-violet-100 text-violet-700 border-0 text-xs"
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                {point}
                              </Badge>
                            ))}
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-5 h-5 text-gray-400 transition-transform ml-2",
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
                              <div className="px-5 pb-5 pt-2 space-y-4">
                                {/* Key Points (mobile) */}
                                <div className="flex flex-wrap gap-1.5 sm:hidden">
                                  {guide.keyPoints.map((point, idx) => (
                                    <Badge
                                      key={idx}
                                      className="bg-violet-100 text-violet-700 border-0 text-xs"
                                      style={{ borderRadius: RADIUS.pill }}
                                    >
                                      {point}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Target Market & Ideal Client */}
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="bg-violet-50 p-3" style={{ borderRadius: RADIUS.button }}>
                                    <p className="text-xs font-semibold text-violet-700 mb-1">Target Market</p>
                                    <p className="text-sm text-gray-700">{guide.detailedContent.targetMarket}</p>
                                  </div>
                                  <div className="bg-amber-50 p-3" style={{ borderRadius: RADIUS.button }}>
                                    <p className="text-xs font-semibold text-amber-700 mb-1">Ideal Client</p>
                                    <p className="text-sm text-gray-700">{guide.detailedContent.idealClient}</p>
                                  </div>
                                </div>

                                {/* Key Benefits */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 mb-2">Key Benefits to Emphasize</p>
                                  <ul className="grid sm:grid-cols-2 gap-1">
                                    {guide.detailedContent.keyBenefits.map((benefit, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-violet-500 mt-1">•</span>
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Common Objections */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 mb-2">Handling Common Objections</p>
                                  <div className="space-y-2">
                                    {guide.detailedContent.commonObjections.map((item, idx) => (
                                      <div key={idx} className="bg-violet-50/60 p-3" style={{ borderRadius: RADIUS.button }}>
                                        <p className="text-sm font-medium text-amber-700 mb-1">"{item.objection}"</p>
                                        <p className="text-sm text-gray-700">→ {item.response}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Recommended Carriers */}
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-2">Recommended Carriers</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {guide.detailedContent.carriers.map((carrier, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-gray-100 text-gray-700 border-0 text-xs"
                                        style={{ borderRadius: RADIUS.pill }}
                                      >
                                        {carrier}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="marketing">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resourceDownloads.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <motion.div
                      key={resource.title}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                      <Card
                        className="border-0 h-full cursor-pointer"
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                        onClick={() => {
                          toast.success(`Downloading ${resource.title}`, {
                            description: "Preparing your file..."
                          });
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                          <div
                            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-6 h-6 text-amber-200" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-violet-600 mt-auto"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
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
                  style={{ borderRadius: RADIUS.input }}
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
                    <motion.div
                      key={carrier.name}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                    <Card
                      className="border-0 h-full"
                      style={{
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{carrier.name}</h3>
                          <Badge
                            className={cn(ratingColors[carrier.rating] || 'bg-gray-100 text-gray-700', 'border-0')}
                            style={{ borderRadius: RADIUS.pill }}
                            aria-label={`AM Best rating: ${carrier.rating}`}
                          >
                            {carrier.rating}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {carrier.products.map((product, idx) => (
                            <Badge
                              key={idx}
                              className="bg-violet-100 text-violet-700 border-0 text-xs"
                              style={{ borderRadius: RADIUS.pill }}
                            >
                              {product}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-violet-600 hover:bg-violet-50"
                          style={{ borderRadius: RADIUS.button }}
                          asChild
                        >
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
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {supportContacts.map((contact) => (
                    <motion.div
                      key={contact.department}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                    <Card
                      className="border-0 h-full"
                      style={{
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-11 h-11 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Headphones className="w-5 h-5 text-amber-200" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{contact.department}</h3>
                            <div className="space-y-1 mt-2 text-sm">
                              <a
                                href="tel:6307780800"
                                className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
                                aria-label={`Call ${contact.department} at (630) 778-0800 ${contact.phone}`}
                              >
                                <Phone className="w-3 h-3" aria-hidden="true" />
                                (630) 778-0800 {contact.phone}
                              </a>
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
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
                    </motion.div>
                ))}
              </div>
              <Card
                className="border-0 overflow-hidden relative"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Business Hours</p>
                      <p className="text-sm text-white/90">Mon-Fri 8am-6pm CT • Urgent: (630) 778-0800 option 0</p>
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
