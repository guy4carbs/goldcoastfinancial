import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { carrierLinks } from "@/data/carriers";
import {
  Shield,
  Heart,
  TrendingUp,
  Home,
  Users,
  PiggyBank,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  Award,
  Sparkles,
  Target,
  Umbrella,
  BadgeCheck,
  Calculator,
  Phone,
  FileText
} from "lucide-react";

const productCategories = [
  {
    id: "life-insurance",
    title: "Life Insurance",
    description: "Protect your loved ones with coverage designed for your unique needs",
    products: [
      {
        id: "term",
        name: "Term Life",
        icon: Shield,
        tagline: "Affordable Protection",
        description: "Pure protection for a specific period. The most affordable way to get maximum coverage when you need it most.",
        features: ["10, 15, 20, or 30-year terms", "No cash value—lowest premiums", "Convertible to permanent coverage", "No-exam options available"],
        idealFor: "Young families, mortgage holders, income replacement",
        startingAt: "$15/month",
        href: "/life-insurance/term",
        color: "from-blue-500 to-blue-600"
      },
      {
        id: "whole",
        name: "Whole Life",
        icon: Heart,
        tagline: "Lifetime Security",
        description: "Permanent coverage that builds tax-advantaged cash value. Your premiums never increase.",
        features: ["Lifetime coverage guaranteed", "Cash value accumulation", "Fixed premiums for life", "Potential dividend payments"],
        idealFor: "Estate planning, wealth transfer, legacy building",
        startingAt: "$75/month",
        href: "/life-insurance/whole",
        color: "from-rose-500 to-rose-600"
      },
      {
        id: "iul",
        name: "Indexed Universal Life",
        icon: TrendingUp,
        tagline: "Growth Potential",
        description: "Flexible permanent coverage with cash value tied to market index performance—with downside protection.",
        features: ["Market-linked growth potential", "Downside protection (0% floor)", "Flexible premium payments", "Tax-free policy loans"],
        idealFor: "Retirement planning, tax-free income, wealth accumulation",
        startingAt: "$150/month",
        href: "/life-insurance/iul",
        color: "from-emerald-500 to-emerald-600"
      },
      {
        id: "final-expense",
        name: "Final Expense",
        icon: Users,
        tagline: "Peace of Mind",
        description: "Simplified whole life designed to cover end-of-life costs. Easy qualification with no medical exam.",
        features: ["$5,000 to $50,000 coverage", "No medical exam required", "Guaranteed acceptance options", "Quick approval process"],
        idealFor: "Seniors 50-85, covering burial costs, leaving a legacy",
        startingAt: "$30/month",
        href: "/life-insurance/final-expense",
        color: "from-purple-500 to-purple-600"
      },
      {
        id: "mortgage",
        name: "Mortgage Protection",
        icon: Home,
        tagline: "Protect Your Home",
        description: "Ensure your family can stay in their home if something happens to you. Coverage designed around your mortgage.",
        features: ["Level or decreasing benefit options", "Living benefits included", "Return of premium available", "Joint coverage for couples"],
        idealFor: "New homeowners, refinancing, protecting family home",
        startingAt: "$25/month",
        href: "/life-insurance/mortgage-protection",
        color: "from-amber-500 to-amber-600"
      }
    ]
  },
  {
    id: "annuities",
    title: "Annuities",
    description: "Secure your retirement with guaranteed income solutions",
    products: [
      {
        id: "fixed",
        name: "Fixed Annuities",
        icon: PiggyBank,
        tagline: "Guaranteed Growth",
        description: "Earn a guaranteed interest rate with principal protection. Safe, predictable growth for your retirement savings.",
        features: ["Guaranteed interest rates", "Principal protection", "Tax-deferred growth", "Flexible payout options"],
        idealFor: "Conservative investors, retirement income, CD alternatives",
        startingAt: "$10,000 minimum",
        href: "/annuities/fixed",
        color: "from-sky-500 to-sky-600"
      },
      {
        id: "indexed",
        name: "Indexed Annuities",
        icon: TrendingUp,
        tagline: "Protected Growth",
        description: "Participate in market gains while protecting against losses. The best of both worlds for retirement planning.",
        features: ["Market-linked returns", "Principal protection", "No market loss risk", "Lifetime income riders"],
        idealFor: "Growth-oriented retirees, market participation, income planning",
        startingAt: "$25,000 minimum",
        href: "/annuities/indexed",
        color: "from-indigo-500 to-indigo-600"
      }
    ]
  }
];

const comparisonFeatures = [
  { feature: "Death Benefit", term: true, whole: true, iul: true, finalExpense: true, mortgage: true },
  { feature: "Cash Value", term: false, whole: true, iul: true, finalExpense: true, mortgage: false },
  { feature: "Fixed Premiums", term: true, whole: true, iul: false, finalExpense: true, mortgage: true },
  { feature: "Lifetime Coverage", term: false, whole: true, iul: true, finalExpense: true, mortgage: false },
  { feature: "No Medical Exam Option", term: true, whole: false, iul: false, finalExpense: true, mortgage: true },
  { feature: "Living Benefits", term: true, whole: true, iul: true, finalExpense: false, mortgage: true },
  { feature: "Tax-Free Loans", term: false, whole: true, iul: true, finalExpense: true, mortgage: false }
];

const processSteps = [
  {
    step: 1,
    title: "Explore Your Options",
    description: "Browse our products or speak with an advisor to understand which coverage fits your needs.",
    icon: Target
  },
  {
    step: 2,
    title: "Get a Personalized Quote",
    description: "Answer a few simple questions to receive a customized quote in minutes.",
    icon: Calculator
  },
  {
    step: 3,
    title: "Apply Online or By Phone",
    description: "Complete your application digitally or with guidance from our licensed agents.",
    icon: FileText
  },
  {
    step: 4,
    title: "Get Covered",
    description: "Once approved, your coverage begins immediately. Most approvals happen within 24-48 hours.",
    icon: BadgeCheck
  }
];

export default function Products() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("life-insurance");
  const [showComparison, setShowComparison] = useState(false);

  const currentCategory = productCategories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Umbrella className="w-4 h-4" />
              Protection for Every Stage of Life
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 text-balance">
              Our{" "}
              <span className="relative">
                Products
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-violet-500/30 -z-10 origin-left"
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
              From term life to retirement annuities, we offer comprehensive coverage
              solutions tailored to protect what matters most to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold border-2 border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak with an Advisor
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-4 bg-white border-y border-gray-100 sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2">
            {productCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.title}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 text-balance">
                  {currentCategory?.title}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
                  {currentCategory?.description}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {currentCategory?.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  >
                    <div
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${
                        expandedProduct === product.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${product.color} p-6 text-white`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <product.icon className="w-10 h-10 mb-3 opacity-90" />
                            <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                            <p className="text-white/80 text-sm">{product.tagline}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/70">Starting at</p>
                            <p className="font-bold">{product.startingAt}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 md:p-6">
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed text-pretty">
                          {product.description}
                        </p>

                        <button
                          onClick={() => setExpandedProduct(
                            expandedProduct === product.id ? null : product.id
                          )}
                          className="flex items-center gap-2 text-primary font-medium text-sm mb-4 hover:text-violet-500 transition-colors"
                        >
                          {expandedProduct === product.id ? "Show Less" : "View Features"}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedProduct === product.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {expandedProduct === product.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-4 pb-4">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Key Features
                                  </p>
                                  <ul className="space-y-2">
                                    {product.features.map((feature, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Ideal For
                                  </p>
                                  <p className="text-sm text-gray-600">{product.idealFor}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Link
                          href={product.href}
                          className="block w-full text-center bg-primary/10 hover:bg-primary hover:text-white text-primary py-3 rounded-xl font-semibold transition-all group-hover:bg-primary group-hover:text-white"
                        >
                          Learn More <ArrowRight className="w-4 h-4 inline ml-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Product Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 text-balance">
              Compare Life Insurance Options
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6 text-pretty">
              Not sure which product is right for you? Compare features side-by-side to find your perfect fit.
            </p>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-violet-500 transition-colors"
            >
              {showComparison ? "Hide Comparison" : "Show Comparison Table"}
              <ChevronDown className={`w-5 h-5 transition-transform ${showComparison ? "rotate-180" : ""}`} />
            </button>
          </motion.div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full max-w-4xl mx-auto">
                    <thead>
                      <tr className="border-b-2 border-primary/20">
                        <th className="text-left py-4 px-4 text-primary font-semibold">Feature</th>
                        <th className="text-center py-4 px-3 text-primary font-semibold">Term</th>
                        <th className="text-center py-4 px-3 text-primary font-semibold">Whole</th>
                        <th className="text-center py-4 px-3 text-primary font-semibold">IUL</th>
                        <th className="text-center py-4 px-3 text-primary font-semibold">Final Expense</th>
                        <th className="text-center py-4 px-3 text-primary font-semibold">Mortgage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((row, index) => (
                        <motion.tr
                          key={row.feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 text-gray-700 font-medium">{row.feature}</td>
                          <td className="py-4 px-3 text-center">
                            {row.term ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {row.whole ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {row.iul ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {row.finalExpense ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {row.mortgage ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 text-balance">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Getting protected is simple. Here's how to get started in four easy steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-violet-500/30" />
                )}
                <div className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow relative z-10">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-violet-500" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-primary mb-2 text-balance">{step.title}</h3>
                  <p className="text-sm text-gray-600 text-pretty">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, value: "50+", label: "Carrier Partners" },
              { icon: Users, value: "10,000+", label: "Families Protected" },
              { icon: Award, value: "A+ Rated", label: "Carrier Options" },
              { icon: Clock, value: "24-48 hrs", label: "Average Approval" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-violet-500" />
                </div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrier Logos */}
      <section className="py-12 bg-[#fffaf3] border-y border-[#e8e0d5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by families nationwide. We partner with 40+ A-rated carriers.</p>
        </div>
        <div className="relative w-full">
          <div className="flex w-max animate-carousel">
            {[...carrierLinks, ...carrierLinks].map((carrier, i) => (
              <Link key={i} href={carrier.href} className="flex-shrink-0 w-[200px] mx-6 h-24 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer">
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className={`object-contain ${carrier.size === 'large' ? 'h-20 max-w-[180px]' : 'h-16 max-w-[160px]'}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Sparkles className="w-12 h-12 text-violet-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Ready to Protect What Matters Most?
            </h2>
            <p className="text-white/80 text-lg mb-8 text-pretty">
              Get a personalized quote in minutes. Our licensed advisors are here to help
              you find the perfect coverage for your unique situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-violet-500 text-primary px-8 py-4 rounded-xl font-semibold hover:bg-violet-500/90 transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Schedule a Consultation
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
