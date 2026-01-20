import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FileText,
  Video,
  Download,
  BookOpen,
  Calculator,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  TrendingUp,
  Users,
  Headphones,
  Clock,
  CheckCircle,
  ChevronDown,
  Play,
  Briefcase,
  DollarSign,
  Search,
  Building,
  Heart,
  Home,
  PiggyBank,
  ArrowRight,
  Info,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

type TabKey = "guides" | "training" | "marketing" | "tools" | "carriers" | "support";

export default function AgentResources() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabFromUrl = urlParams.get("tab") as TabKey | null;

  const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl || "guides");
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["guides", "training", "marketing", "tools", "carriers", "support"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs = [
    { id: "guides" as TabKey, label: "Product Guides", icon: FileText },
    { id: "training" as TabKey, label: "Training", icon: Video },
    { id: "marketing" as TabKey, label: "Marketing", icon: Download },
    { id: "tools" as TabKey, label: "Sales Tools", icon: Calculator },
    { id: "carriers" as TabKey, label: "Carriers", icon: Building },
    { id: "support" as TabKey, label: "Support", icon: Headphones }
  ];

  const productGuides = [
    {
      id: "term",
      title: "Term Life Insurance",
      icon: Shield,
      description: "Affordable coverage for a specific period",
      content: [
        { title: "Overview", text: "Term life provides pure death benefit protection for 10, 15, 20, or 30 years. Most affordable option for maximum coverage." },
        { title: "Target Market", text: "Young families, mortgage holders, income replacement needs, budget-conscious clients." },
        { title: "Key Selling Points", text: "Lowest cost per $1,000 of coverage. Convertible to permanent. No-exam options available." },
        { title: "Commission Structure", text: "First-year: 90-110% of target premium. Renewals: 2-4% years 2-10." },
        { title: "Top Carriers", text: "Protective, Banner, Principal, Transamerica, Lincoln Financial" }
      ]
    },
    {
      id: "whole",
      title: "Whole Life Insurance",
      icon: Heart,
      description: "Permanent coverage with cash value growth",
      content: [
        { title: "Overview", text: "Lifetime coverage with guaranteed cash value accumulation. Premiums never increase." },
        { title: "Target Market", text: "Estate planning, wealth transfer, conservative savers, final expense needs." },
        { title: "Key Selling Points", text: "Guaranteed death benefit. Tax-advantaged cash value. Policy loans available. Potential dividends." },
        { title: "Commission Structure", text: "First-year: 50-90% of target premium. Renewals: 2-5% years 2-10+." },
        { title: "Top Carriers", text: "MassMutual, Northwestern Mutual, New York Life, Guardian" }
      ]
    },
    {
      id: "iul",
      title: "Indexed Universal Life",
      icon: TrendingUp,
      description: "Flexible coverage with market-linked growth",
      content: [
        { title: "Overview", text: "Permanent coverage with cash value tied to market index performance. Downside protection with caps and floors." },
        { title: "Target Market", text: "Retirement planning, tax-free income seekers, max-funded strategies, business owners." },
        { title: "Key Selling Points", text: "Market participation with downside protection. Tax-free policy loans. Flexible premiums." },
        { title: "Commission Structure", text: "First-year: 80-110% of target premium. Bonuses for persistency." },
        { title: "Top Carriers", text: "Pacific Life, Nationwide, Lincoln Financial, Securian, Transamerica" }
      ]
    },
    {
      id: "final-expense",
      title: "Final Expense",
      icon: Users,
      description: "Simplified issue whole life for seniors",
      content: [
        { title: "Overview", text: "Small face amount whole life ($5K-$50K) designed for burial costs. Simplified or guaranteed issue underwriting." },
        { title: "Target Market", text: "Seniors 50-85, those with health issues, fixed income clients." },
        { title: "Key Selling Points", text: "Easy qualification. No medical exam. Quick issue. Affordable premiums." },
        { title: "Commission Structure", text: "First-year: 100-120% of annual premium. High volume potential." },
        { title: "Top Carriers", text: "Mutual of Omaha, American Amicable, KSKJ Life, Transamerica, Liberty Bankers" }
      ]
    },
    {
      id: "mortgage",
      title: "Mortgage Protection",
      icon: Home,
      description: "Coverage tied to mortgage balance",
      content: [
        { title: "Overview", text: "Term coverage designed to pay off mortgage if insured dies. Can be level or decreasing term." },
        { title: "Target Market", text: "New homeowners, refinancers, those receiving mortgage mailers." },
        { title: "Key Selling Points", text: "Protects family's home. Often includes living benefits. Return of premium options." },
        { title: "Commission Structure", text: "First-year: 90-110% of target premium. Strong lead programs available." },
        { title: "Top Carriers", text: "Mutual of Omaha, Protective, North American, Foresters" }
      ]
    },
    {
      id: "annuities",
      title: "Fixed & Indexed Annuities",
      icon: PiggyBank,
      description: "Guaranteed income and tax-deferred growth",
      content: [
        { title: "Overview", text: "Tax-deferred accumulation with guaranteed minimum rates. Options for lifetime income." },
        { title: "Target Market", text: "Pre-retirees, retirees seeking guaranteed income, CD alternatives, IRA rollovers." },
        { title: "Key Selling Points", text: "Principal protection. Tax deferral. Lifetime income options. No market risk (fixed)." },
        { title: "Commission Structure", text: "Fixed: 1-4% of premium. FIA: 4-7% of premium. Trails available." },
        { title: "Top Carriers", text: "Athene, Allianz, Global Atlantic, American Equity, Nationwide" }
      ]
    }
  ];

  const trainingModules = [
    {
      category: "Getting Started",
      videos: [
        { title: "Welcome to Heritage Life Solutions", duration: "8 min", description: "Company overview and culture" },
        { title: "Setting Up Your Business", duration: "15 min", description: "Contracting, licensing, and E&O" },
        { title: "Using the Agent Portal", duration: "12 min", description: "Navigate tools and resources" }
      ]
    },
    {
      category: "Product Training",
      videos: [
        { title: "Term Life Deep Dive", duration: "25 min", description: "Features, riders, and positioning" },
        { title: "IUL Fundamentals", duration: "30 min", description: "Index strategies and illustrations" },
        { title: "Final Expense Mastery", duration: "20 min", description: "Simplified underwriting and sales" },
        { title: "Annuity Essentials", duration: "28 min", description: "Fixed, indexed, and income riders" }
      ]
    },
    {
      category: "Sales Skills",
      videos: [
        { title: "Needs Analysis Process", duration: "18 min", description: "Uncovering client needs" },
        { title: "Handling Objections", duration: "22 min", description: "Common objections and responses" },
        { title: "Closing Techniques", duration: "20 min", description: "Moving to the application" },
        { title: "Building Referrals", duration: "15 min", description: "Growing your business" }
      ]
    },
    {
      category: "Compliance & Ethics",
      videos: [
        { title: "Suitability Requirements", duration: "20 min", description: "Ensuring appropriate recommendations" },
        { title: "State Regulations Overview", duration: "25 min", description: "Key compliance considerations" },
        { title: "Anti-Money Laundering", duration: "15 min", description: "AML requirements and red flags" }
      ]
    }
  ];

  const marketingMaterials = [
    {
      category: "Client Brochures",
      items: [
        { name: "Why Life Insurance Matters", type: "PDF", size: "2.4 MB" },
        { name: "Term vs. Permanent Comparison", type: "PDF", size: "1.8 MB" },
        { name: "IUL for Retirement Planning", type: "PDF", size: "3.1 MB" },
        { name: "Final Expense Planning Guide", type: "PDF", size: "1.5 MB" },
        { name: "Mortgage Protection Overview", type: "PDF", size: "2.0 MB" }
      ]
    },
    {
      category: "Presentation Decks",
      items: [
        { name: "Life Insurance Basics Presentation", type: "PPTX", size: "5.2 MB" },
        { name: "IUL Retirement Strategy", type: "PPTX", size: "4.8 MB" },
        { name: "Business Owner Presentation", type: "PPTX", size: "6.1 MB" },
        { name: "Senior Market Presentation", type: "PPTX", size: "4.2 MB" }
      ]
    },
    {
      category: "Social Media",
      items: [
        { name: "Social Media Image Pack", type: "ZIP", size: "15.4 MB" },
        { name: "Quote Graphics Templates", type: "ZIP", size: "8.7 MB" },
        { name: "Educational Post Templates", type: "ZIP", size: "12.3 MB" },
        { name: "Video Clips for Social", type: "ZIP", size: "45.6 MB" }
      ]
    },
    {
      category: "Email Templates",
      items: [
        { name: "Prospecting Email Series", type: "DOC", size: "156 KB" },
        { name: "Policy Review Request", type: "DOC", size: "98 KB" },
        { name: "Referral Request Templates", type: "DOC", size: "112 KB" },
        { name: "Birthday/Anniversary Emails", type: "DOC", size: "134 KB" }
      ]
    }
  ];

  const carriers = [
    { name: "Protective", products: ["Term", "IUL", "VUL"], rating: "A+", portal: "https://www.protective.com" },
    { name: "Lincoln Financial", products: ["Term", "IUL", "Annuities"], rating: "A+", portal: "https://www.lfg.com" },
    { name: "Transamerica", products: ["Term", "Whole", "IUL", "Final Expense"], rating: "A", portal: "https://www.transamerica.com" },
    { name: "Mutual of Omaha", products: ["Term", "Whole", "Final Expense", "Mortgage"], rating: "A+", portal: "https://www.mutualofomaha.com" },
    { name: "Pacific Life", products: ["IUL", "VUL", "Annuities"], rating: "A+", portal: "https://www.pacificlife.com" },
    { name: "Nationwide", products: ["Term", "IUL", "Annuities"], rating: "A+", portal: "https://www.nationwide.com" },
    { name: "Athene", products: ["Fixed Annuities", "FIA"], rating: "A", portal: "https://www.athene.com" },
    { name: "Allianz", products: ["FIA", "Income Annuities"], rating: "A+", portal: "https://www.allianzlife.com" },
    { name: "North American", products: ["IUL", "Annuities"], rating: "A+", portal: "https://www.northamericancompany.com" },
    { name: "Global Atlantic", products: ["FIA", "IUL"], rating: "A", portal: "https://www.globalatlantic.com" },
    { name: "American Equity", products: ["FIA", "MYGA"], rating: "A-", portal: "https://www.american-equity.com" },
    { name: "F&G", products: ["FIA", "MYGA", "IUL"], rating: "A-", portal: "https://www.fglife.com" }
  ];

  const filteredCarriers = carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carrier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const supportContacts = [
    {
      department: "New Business",
      description: "Application submissions, requirements, and status updates",
      phone: "(630) 778-0800 ext. 1",
      email: "newbusiness@heritagels.com",
      hours: "Mon-Fri 8am-6pm CT"
    },
    {
      department: "Underwriting Support",
      description: "Case consultation, informal inquiries, and field underwriting",
      phone: "(630) 778-0800 ext. 2",
      email: "underwriting@heritagels.com",
      hours: "Mon-Fri 8am-5pm CT"
    },
    {
      department: "Contracting",
      description: "Carrier appointments, licensing, and commission questions",
      phone: "(630) 778-0800 ext. 3",
      email: "contracting@heritagels.com",
      hours: "Mon-Fri 9am-5pm CT"
    },
    {
      department: "Agent Development",
      description: "Training, mentorship, and business building support",
      phone: "(630) 778-0800 ext. 4",
      email: "development@heritagels.com",
      hours: "Mon-Fri 9am-5pm CT"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Link
              href="/agents/lounge"
              className="inline-flex items-center gap-2 text-heritage-primary hover:text-heritage-accent transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Agent Lounge
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-4">
              Agent Resources
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive guides, training, and tools to help you succeed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-heritage-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#case-status" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
              <Search className="w-4 h-4" /> Check Case Status
            </a>
            <a href="mailto:newbusiness@heritagels.com" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
              <FileText className="w-4 h-4" /> Submit New Business
            </a>
            <a href="#support" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
              <DollarSign className="w-4 h-4" /> Commission Questions
            </a>
            <a href="tel:6307780800" className="flex items-center gap-2 px-5 py-2.5 bg-heritage-accent hover:bg-heritage-accent/90 text-white rounded-lg font-medium transition-colors">
              <Phone className="w-4 h-4" /> (630) 778-0800
            </a>
          </div>
        </div>
      </section>

      {/* Main Tabs */}
      <section className="py-4 bg-white border-b border-gray-100 sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 pb-2 -mb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-heritage-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 bg-[#fffaf3] min-h-[600px]">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Product Guides Tab */}
            {activeTab === "guides" && (
              <motion.div
                key="guides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Guides</h2>
                <p className="text-gray-600 mb-8">Comprehensive guides for each product line. Click to expand for details.</p>

                <div className="space-y-4">
                  {productGuides.map((guide) => (
                    <div key={guide.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center">
                            <guide.icon className="w-6 h-6 text-heritage-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">{guide.title}</h3>
                            <p className="text-gray-600 text-sm">{guide.description}</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedGuide === guide.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedGuide === guide.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-gray-100">
                              <div className="grid md:grid-cols-2 gap-6 pt-6">
                                {guide.content.map((section, idx) => (
                                  <div key={idx} className={idx === guide.content.length - 1 && guide.content.length % 2 !== 0 ? "md:col-span-2" : ""}>
                                    <h4 className="font-semibold text-heritage-primary mb-2">{section.title}</h4>
                                    <p className="text-gray-600 text-sm">{section.text}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4">
                                <Link href={`/life-insurance/${guide.id === 'mortgage' ? 'mortgage-protection' : guide.id === 'annuities' ? '' : guide.id}`}>
                                  <span className="text-heritage-primary hover:text-heritage-accent font-medium text-sm flex items-center gap-1">
                                    View Product Page <ArrowRight className="w-4 h-4" />
                                  </span>
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Training Tab */}
            {activeTab === "training" && (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Center</h2>
                <p className="text-gray-600 mb-8">On-demand video training to sharpen your skills and grow your business.</p>

                <div className="space-y-8">
                  {trainingModules.map((module, moduleIdx) => (
                    <div key={moduleIdx}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{module.category}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {module.videos.map((video, videoIdx) => (
                          <div
                            key={videoIdx}
                            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-heritage-primary transition-colors">
                                <Play className="w-5 h-5 text-heritage-primary group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                                <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                                <span className="text-xs text-heritage-primary font-medium">{video.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-heritage-primary/5 rounded-xl border border-heritage-primary/10">
                  <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-heritage-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Need Live Training?</h4>
                      <p className="text-gray-600 text-sm">We offer weekly live training sessions and one-on-one coaching. Contact the Agent Development team to schedule.</p>
                      <a href="mailto:development@heritagels.com" className="text-heritage-primary hover:text-heritage-accent font-medium text-sm mt-2 inline-flex items-center gap-1">
                        Schedule Training <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Marketing Tab */}
            {activeTab === "marketing" && (
              <motion.div
                key="marketing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Materials</h2>
                <p className="text-gray-600 mb-8">Professional materials to help you grow your business. Click to download.</p>

                <div className="grid md:grid-cols-2 gap-8">
                  {marketingMaterials.map((category, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                      <div className="space-y-3">
                        {category.items.map((item, itemIdx) => (
                          <a
                            key={itemIdx}
                            href="#"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-heritage-primary/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Download className="w-4 h-4 text-gray-400 group-hover:text-heritage-primary transition-colors" />
                              <span className="text-gray-700 group-hover:text-heritage-primary transition-colors">{item.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.type} • {item.size}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Marketing Requests</h3>
                  <p className="text-gray-600 mb-4">Need personalized materials with your contact information? We can help.</p>
                  <a
                    href="mailto:marketing@heritagels.com"
                    className="inline-flex items-center gap-2 bg-heritage-primary hover:bg-heritage-primary/90 text-white px-5 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Request Custom Materials
                  </a>
                </div>
              </motion.div>
            )}

            {/* Sales Tools Tab */}
            {activeTab === "tools" && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Tools</h2>
                <p className="text-gray-600 mb-8">Interactive tools to help you close more business.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/resources/calculators">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="w-12 h-12 bg-heritage-accent/10 rounded-xl flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-heritage-accent" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Coverage Calculator</h3>
                      <p className="text-gray-600 text-sm">Help clients determine how much coverage they need based on their financial situation.</p>
                    </div>
                  </Link>

                  <Link href="/resources/calculators">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-heritage-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Estimator</h3>
                      <p className="text-gray-600 text-sm">Get quick premium estimates based on age, health class, and coverage amount.</p>
                    </div>
                  </Link>

                  <Link href="/resources/calculators">
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Human Life Value</h3>
                      <p className="text-gray-600 text-sm">Calculate a client's economic value to their family over their working lifetime.</p>
                    </div>
                  </Link>

                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Needs Analysis Form</h3>
                    <p className="text-gray-600 text-sm">Comprehensive fact-finder to uncover all client protection needs.</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Product Comparison</h3>
                    <p className="text-gray-600 text-sm">Side-by-side comparison of product features across carriers.</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Underwriting Guide</h3>
                    <p className="text-gray-600 text-sm">Quick reference for health conditions and how they're rated by carrier.</p>
                  </div>
                </div>

                {/* Case Status Checker */}
                <div id="case-status" className="mt-10 bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Check Case Status</h3>
                  <p className="text-gray-600 mb-6">Enter a case or policy number to check its current status.</p>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="Enter case number"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    />
                    <button className="px-6 py-3 bg-heritage-primary hover:bg-heritage-primary/90 text-white rounded-xl font-medium transition-colors">
                      Check Status
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">For detailed status, contact New Business at (630) 778-0800 ext. 1</p>
                </div>
              </motion.div>
            )}

            {/* Carriers Tab */}
            {activeTab === "carriers" && (
              <motion.div
                key="carriers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Carrier Partners</h2>
                <p className="text-gray-600 mb-6">Access to 30+ A-rated carriers. Click to visit carrier portals.</p>

                {/* Search */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search carriers or products..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent bg-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCarriers.map((carrier, idx) => (
                    <a
                      key={idx}
                      href={carrier.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-heritage-primary transition-colors">{carrier.name}</h3>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">{carrier.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {carrier.products.map((product, pIdx) => (
                          <span key={pIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-heritage-primary text-sm font-medium">
                        <span>Open Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Need Carrier Appointment?</h3>
                  <p className="text-gray-600 mb-4">Contact contracting to get appointed with additional carriers.</p>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:contracting@heritagels.com" className="flex items-center gap-2 text-heritage-primary hover:text-heritage-accent font-medium">
                      <Mail className="w-4 h-4" /> contracting@heritagels.com
                    </a>
                    <a href="tel:6307780800" className="flex items-center gap-2 text-heritage-primary hover:text-heritage-accent font-medium">
                      <Phone className="w-4 h-4" /> (630) 778-0800 ext. 3
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support Tab */}
            {activeTab === "support" && (
              <motion.div
                key="support"
                id="support"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Team</h2>
                <p className="text-gray-600 mb-8">We're here to help you succeed. Reach out to the right team for fastest service.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {supportContacts.map((contact, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Headphones className="w-6 h-6 text-heritage-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{contact.department}</h3>
                          <p className="text-gray-600 text-sm mb-4">{contact.description}</p>
                          <div className="space-y-2">
                            <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-heritage-primary hover:text-heritage-accent transition-colors">
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">{contact.phone}</span>
                            </a>
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-gray-600 hover:text-heritage-primary transition-colors text-sm">
                              <Mail className="w-4 h-4" />
                              <span>{contact.email}</span>
                            </a>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>{contact.hours}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Support */}
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Urgent Case Support</h4>
                      <p className="text-gray-600 text-sm mb-2">For time-sensitive cases or urgent underwriting questions, call our main line and select option 0 for immediate assistance.</p>
                      <a href="tel:6307780800" className="text-heritage-primary hover:text-heritage-accent font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4" /> (630) 778-0800
                      </a>
                    </div>
                  </div>
                </div>

                {/* Commission Info */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Information</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Schedule</h4>
                      <p className="text-gray-600 text-sm">Commissions are paid weekly on Fridays for all business submitted through the previous Friday.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Direct Deposit</h4>
                      <p className="text-gray-600 text-sm">Set up direct deposit through contracting for fastest payment. Paper checks add 3-5 business days.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Statement Access</h4>
                      <p className="text-gray-600 text-sm">Commission statements are available in the agent portal under "My Commissions" section.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-heritage-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Not an Agent Yet?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Join our team and get access to all these resources, competitive commissions, and dedicated support.
            </p>
            <Link href="/agents/become-an-agent">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-xl font-semibold"
              >
                Become an Agent
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
