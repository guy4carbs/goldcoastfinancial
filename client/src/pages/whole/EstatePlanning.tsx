import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowRight,
  Phone,
  Shield,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Star,
  Users,
  Scale,
  FileText,
  Landmark,
  Gift,
  Heart,
  TrendingUp,
  Lock,
  Calculator,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function EstatePlanning() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [estateValue, setEstateValue] = useState(5000000);

  // Enhanced Estate Tax Calculator State
  const [showEstateTool, setShowEstateTool] = useState(false);
  const [hasSpouse, setHasSpouse] = useState(true);
  const [stateTaxRate, setStateTaxRate] = useState(0);
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);

  // Calculate comprehensive estate tax analysis
  const calculateEstateAnalysis = () => {
    const federalExemption = 13610000;
    const portabilityExemption = hasSpouse ? federalExemption * 2 : federalExemption;
    const effectiveExemption = hasSpouse ? portabilityExemption : federalExemption;

    const taxableEstate = Math.max(0, estateValue - effectiveExemption);
    const federalTax = Math.round(taxableEstate * 0.40);
    const stateTax = Math.round(estateValue * (stateTaxRate / 100));
    const totalTax = federalTax + stateTax;

    const taxCoveredByInsurance = Math.min(insuranceCoverage, totalTax);
    const remainingTaxBurden = Math.max(0, totalTax - insuranceCoverage);
    const percentCovered = totalTax > 0 ? Math.round((taxCoveredByInsurance / totalTax) * 100) : 100;

    return {
      effectiveExemption,
      taxableEstate,
      federalTax,
      stateTax,
      totalTax,
      taxCoveredByInsurance,
      remainingTaxBurden,
      percentCovered
    };
  };

  const estateAnalysis = calculateEstateAnalysis();

  const trustStats = [
    { value: "Tax-Free", label: "Death Benefit" },
    { value: "40%", label: "Estate Tax Rate" },
    { value: "$13.61M", label: "2024 Exemption*" },
    { value: "Instant", label: "Liquidity" }
  ];

  const estatePlanningUses = [
    {
      icon: Landmark,
      title: "Estate Tax Coverage",
      description: "Pay estate taxes without forcing heirs to sell assets."
    },
    {
      icon: Scale,
      title: "Wealth Equalization",
      description: "Leave the business to one child, life insurance to another."
    },
    {
      icon: Gift,
      title: "Charitable Giving",
      description: "Name a charity as beneficiary or fund a charitable trust."
    },
    {
      icon: Users,
      title: "Legacy Creation",
      description: "Create wealth for future generations, bypasses probate."
    }
  ];

  const irlitBenefits = [
    {
      title: "Removes from Estate",
      description: "Death benefit not counted in taxable estate."
    },
    {
      title: "Tax-Free to Heirs",
      description: "Beneficiaries receive funds income tax-free."
    },
    {
      title: "Creditor Protection",
      description: "Assets in ILIT typically protected from creditors."
    },
    {
      title: "Generation Skipping",
      description: "Can benefit multiple generations tax-efficiently."
    }
  ];

  const ownershipOptions = [
    {
      option: "Individual Ownership",
      estateTax: "Included in estate",
      control: "Full control",
      bestFor: "Estates below exemption",
      pros: ["Simple", "Full control", "Easy to change"],
      cons: ["Included in estate", "Subject to estate tax"]
    },
    {
      option: "ILIT Ownership",
      estateTax: "Excluded from estate",
      control: "Trustee controls",
      bestFor: "Large estates, tax reduction",
      pros: ["Estate tax free", "Creditor protection", "Generation planning"],
      cons: ["Irrevocable", "Complex", "Less flexibility"]
    },
    {
      option: "Spousal Ownership",
      estateTax: "Deferred until spouse dies",
      control: "Spouse controls",
      bestFor: "Simple estate plans",
      pros: ["Unlimited marital deduction", "Spouse has control"],
      cons: ["Included in spouse's estate", "Lost if divorce"]
    }
  ];

  const strategies = [
    {
      icon: Building2,
      title: "Premium Financing",
      description: "Borrow premium payments from banks. Use life insurance as collateral.",
      bestFor: "High net worth, cash flow sensitive"
    },
    {
      icon: TrendingUp,
      title: "Wealth Replacement Trust",
      description: "Donate assets to charity for tax deduction. Replace wealth via ILIT.",
      bestFor: "Charitably inclined, large estates"
    },
    {
      icon: Users,
      title: "Dynasty Trust",
      description: "Fund multi-generational trust with life insurance.",
      bestFor: "Multi-generational wealth transfer"
    },
    {
      icon: Scale,
      title: "Buy-Sell Funding",
      description: "Fund business succession agreements. Ensure fair buyout.",
      bestFor: "Business owners with partners"
    }
  ];

  const calculateEstateTax = () => {
    const exemption = 13610000;
    const taxableEstate = Math.max(0, estateValue - exemption);
    const estateTax = Math.round(taxableEstate * 0.40);
    const effectiveRate = estateValue > exemption
      ? Math.round((estateTax / estateValue) * 100)
      : 0;
    return { taxableEstate, estateTax, effectiveRate };
  };

  const { taxableEstate, estateTax, effectiveRate } = calculateEstateTax();

  const faqs = [
    {
      question: "Why use life insurance for estate planning?",
      answer: "Life insurance provides immediate, tax-free liquidity at death. Without it, heirs may need to sell assets quickly to pay estate taxes."
    },
    {
      question: "What is an ILIT and why would I need one?",
      answer: "An Irrevocable Life Insurance Trust owns your policy so the death benefit isn't in your taxable estate. Can save 40% in estate taxes."
    },
    {
      question: "How much coverage do I need for estate planning?",
      answer: "Typically enough to cover projected estate taxes plus liquidity needs. For a $10M estate above exemption, that could mean $4M+ in coverage."
    },
    {
      question: "Can I change beneficiaries with an ILIT?",
      answer: "No - it's irrevocable. The trust owns the policy. However, trust documents can include flexibility provisions."
    },
    {
      question: "What about gift tax on ILIT premiums?",
      answer: "Annual premium gifts can be covered by the gift exclusion ($18,000 per beneficiary) using Crummey withdrawal powers."
    },
    {
      question: "Should my policy be inside or outside my estate?",
      answer: "Below the exemption, it often doesn't matter. Above $13.61M, an ILIT can save significant estate taxes. Note: The current $13.61M exemption is scheduled to sunset after 2025, potentially dropping to ~$6-7M. Plan ahead."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-primary font-semibold mb-4 tracking-wide uppercase text-sm">
                Whole Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Estate Planning
                <span className="text-primary"> with Life Insurance</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
                Preserve wealth, pay estate taxes, and create a lasting legacy with tax-free death benefits.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Get Your Free Quote <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="tel:6307780800"
                    className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Speak to an Advisor
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Estate Tax Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Estate Tax Estimator</h3>
                    <p className="text-gray-500">2024 rates (exemption sunsets 2026)</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Estate Value: <span className="text-primary font-bold">${(estateValue / 1000000).toFixed(1)}M</span>
                  </label>
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="500000"
                    value={estateValue}
                    onChange={(e) => setEstateValue(parseInt(e.target.value))}
                    className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$1M</span>
                    <span>$50M</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Federal Exemption (2024)</span>
                    <span className="font-semibold text-gray-900">$13.61M</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Taxable Amount</span>
                    <span className="font-semibold text-primary">${(taxableEstate / 1000000).toFixed(2)}M</span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-primary to-primary/90 rounded-xl">
                  <p className="text-white/80 text-sm mb-1">Estimated Estate Tax</p>
                  <p className="text-4xl font-bold text-white mb-2">${(estateTax / 1000000).toFixed(2)}M</p>
                  <p className="text-violet-500 text-sm">Effective rate: {effectiveRate}% of estate</p>
                </div>

                {estateTax > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Life insurance can provide this liquidity tax-free.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Life Insurance for Estates */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">
                Why Life Insurance for Estate Planning?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed text-pretty">
                Estate taxes are due 9 months after death - in cash. Without liquidity, heirs may be forced to sell assets at fire-sale prices.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                Life insurance solves this. The death benefit arrives tax-free, exactly when heirs need it.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Tax-free death benefit to beneficiaries",
                  "Immediate liquidity at death",
                  "Bypasses probate with proper beneficiary designation",
                  "Can be structured outside your taxable estate",
                  "Guaranteed death benefit regardless of market conditions"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=600&fit=crop"
                alt="Estate planning documents"
                className="rounded-xl shadow-lg w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Estate Planning Uses */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              How Life Insurance Fits Your Estate Plan
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              Four primary uses for estate planning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {estatePlanningUses.map((use, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 border border-gray-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
                  <use.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{use.title}</h3>
                <p className="text-gray-600">{use.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ILIT Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              The ILIT Advantage
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto text-pretty">
              Irrevocable Life Insurance Trust - the gold standard for estate tax efficiency.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-6">How an ILIT Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">1</div>
                    <p className="text-white/90">You create an irrevocable trust with an estate attorney.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">2</div>
                    <p className="text-white/90">The trust applies for and owns the life insurance policy.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">3</div>
                    <p className="text-white/90">You gift premiums to the trust annually.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">4</div>
                    <p className="text-white/90">At death, proceeds go to trust beneficiaries - outside your estate.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {irlitBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ownership Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Policy Ownership Options
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              Who owns the policy matters for estate taxes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {ownershipOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{option.option}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estate Tax</span>
                    <span className="font-medium text-gray-900">{option.estateTax}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Control</span>
                    <span className="font-medium text-gray-900">{option.control}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Best For</span>
                    <span className="font-medium text-primary">{option.bestFor}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-2">Cons</p>
                    <ul className="space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-red-500">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advanced Strategies */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Advanced Strategies
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              Sophisticated techniques for high-net-worth estate planning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <strategy.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{strategy.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{strategy.description}</p>
                <p className="text-sm text-primary font-medium">
                  Best for: {strategy.bestFor}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                  alt="Richard W."
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-violet-500 fill-violet-500" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <Award className="w-5 h-5 text-violet-500" />
                  <span className="text-violet-500 font-semibold text-sm">Verified Customer</span>
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-6 italic leading-relaxed">
                  "Our estate attorney said we faced $2.4M in estate taxes. With an ILIT-owned policy, our heirs will receive that amount tax-free. The family business stays intact."
                </blockquote>
                <div>
                  <p className="font-semibold text-white text-lg">Richard W.</p>
                  <p className="text-white/80">Business Owner, Estate Planning Client</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Estate Tax Calculator */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Estate Tax Planning Tool
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 text-pretty">
              See how life insurance can offset estate taxes and protect your legacy.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEstateTool(!showEstateTool)}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <Calculator className="w-5 h-5" />
              {showEstateTool ? 'Hide Calculator' : 'Calculate Estate Tax Impact'}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showEstateTool && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  {/* Input Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
                    {/* Left Column - Estate Details */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-primary text-lg">Your Estate</h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Estate Value: <span className="text-primary font-bold">${(estateValue / 1000000).toFixed(1)}M</span>
                        </label>
                        <input
                          type="range"
                          min="1000000"
                          max="100000000"
                          step="500000"
                          value={estateValue}
                          onChange={(e) => setEstateValue(parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>$1M</span>
                          <span>$100M</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Married?</label>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setHasSpouse(!hasSpouse)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${hasSpouse ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Yes
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setHasSpouse(!hasSpouse)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${!hasSpouse ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          No
                        </motion.button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State Estate Tax Rate: <span className="text-violet-500 font-bold">{stateTaxRate}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={stateTaxRate}
                          onChange={(e) => setStateTaxRate(parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">States like MA, OR, WA have estate taxes (0% if your state doesn't)</p>
                      </div>
                    </div>

                    {/* Right Column - Insurance */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-primary text-lg">Life Insurance Coverage</h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Death Benefit: <span className="text-green-600 font-bold">${insuranceCoverage > 0 ? `${(insuranceCoverage / 1000000).toFixed(1)}M` : '$0'}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20000000"
                          step="250000"
                          value={insuranceCoverage}
                          onChange={(e) => setInsuranceCoverage(parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>$0</span>
                          <span>$20M</span>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800">
                          <strong>Tip:</strong> Place the policy in an ILIT to keep the death benefit outside your taxable estate.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results Visualization */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-primary mb-6">Estate Tax Analysis</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                      {/* Tax Breakdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-xl p-6"
                      >
                        <h5 className="font-medium text-gray-700 mb-4">Tax Calculation</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estate Value</span>
                            <span className="font-semibold">${(estateValue / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exemption {hasSpouse ? '(w/ portability)' : ''}</span>
                            <span className="font-semibold text-green-600">-${(estateAnalysis.effectiveExemption / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="text-gray-600">Taxable Amount</span>
                            <span className="font-semibold">${(estateAnalysis.taxableEstate / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Federal Tax (40%)</span>
                            <span className="font-semibold text-red-600">${(estateAnalysis.federalTax / 1000000).toFixed(2)}M</span>
                          </div>
                          {stateTaxRate > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">State Tax ({stateTaxRate}%)</span>
                              <span className="font-semibold text-red-600">${(estateAnalysis.stateTax / 1000000).toFixed(2)}M</span>
                            </div>
                          )}
                          <div className="border-t pt-2 flex justify-between text-lg">
                            <span className="font-bold text-gray-900">Total Estate Tax</span>
                            <span className="font-bold text-red-600">${(estateAnalysis.totalTax / 1000000).toFixed(2)}M</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Coverage Analysis */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-primary rounded-xl p-6 text-white"
                      >
                        <h5 className="font-medium text-white/80 mb-4">Insurance Coverage Analysis</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-white/70">Total Tax Liability</span>
                            <span className="font-semibold">${(estateAnalysis.totalTax / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Insurance Coverage</span>
                            <span className="font-semibold text-violet-500">${(insuranceCoverage / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="border-t border-white/20 pt-2 flex justify-between">
                            <span className="text-white/70">Taxes Covered</span>
                            <span className="font-semibold text-violet-500">${(estateAnalysis.taxCoveredByInsurance / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="flex justify-between text-lg">
                            <span className="font-bold">Remaining Burden</span>
                            <span className={`font-bold ${estateAnalysis.remainingTaxBurden === 0 ? 'text-green-400' : 'text-orange-300'}`}>
                              ${(estateAnalysis.remainingTaxBurden / 1000000).toFixed(2)}M
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress */}
                        <div className="mt-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Coverage</span>
                            <span className="font-bold">{estateAnalysis.percentCovered}%</span>
                          </div>
                          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${estateAnalysis.percentCovered >= 100 ? 'bg-green-400' : 'bg-violet-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(estateAnalysis.percentCovered, 100)}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Recommendation */}
                    <AnimatePresence mode="wait">
                      {estateAnalysis.totalTax > 0 && (
                        <motion.div
                          key={`recommendation-${insuranceCoverage}-${estateAnalysis.totalTax}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-6 rounded-xl text-center ${
                            estateAnalysis.remainingTaxBurden === 0
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-orange-50 border border-orange-200'
                          }`}
                        >
                          {estateAnalysis.remainingTaxBurden === 0 ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-green-800 font-semibold">Your estate taxes are fully covered by life insurance!</p>
                              <p className="text-green-700 text-sm mt-1">Heirs won't need to liquidate assets to pay estate taxes.</p>
                            </>
                          ) : (
                            <>
                              <Landmark className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                              <p className="text-orange-800 font-semibold">
                                Recommended Coverage: ${(estateAnalysis.totalTax / 1000000).toFixed(2)}M
                              </p>
                              <p className="text-orange-700 text-sm mt-1">
                                Consider increasing coverage by ${((estateAnalysis.totalTax - insuranceCoverage) / 1000000).toFixed(2)}M to fully protect your estate.
                              </p>
                            </>
                          )}
                        </motion.div>
                      )}
                      {estateAnalysis.totalTax === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center"
                        >
                          <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-blue-800 font-semibold">Your estate is below the federal exemption!</p>
                          <p className="text-blue-700 text-sm mt-1">
                            No federal estate tax is due. Life insurance can still provide liquidity and equalization benefits.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-center text-gray-500 text-xs">
                    *Based on 2024 federal exemption of $13.61M. Important: This exemption is set to sunset after 2025, potentially dropping to ~$6-7M unless Congress acts. State exemptions vary. Consult with an estate planning attorney.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 text-pretty">
              Common questions about estate planning with life insurance.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">
              Protect Your Legacy
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
              Ensure your wealth passes to your heirs - not the IRS. Start planning with a free consultation.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call (630) 778-0800
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
