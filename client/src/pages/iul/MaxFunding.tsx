import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Rocket,
  Shield,
  ChevronRight,
  ChevronDown,
  Award,
  ArrowRight,
  Calculator,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  PiggyBank,
  BarChart3,
  CheckCircle,
  Phone,
  AlertCircle,
  Users,
  Clock
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function MaxFunding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [fundingLevel, setFundingLevel] = useState<'minimum' | 'target' | 'max'>('max');
  const [annualPremium, setAnnualPremium] = useState(15000);

  const calculateProjection = (level: 'minimum' | 'target' | 'max') => {
    const multipliers = {
      minimum: { premium: 0.5, cashValue10: 0.3, cashValue20: 0.5, deathBenefit: 1.0 },
      target: { premium: 1.0, cashValue10: 0.7, cashValue20: 1.2, deathBenefit: 1.0 },
      max: { premium: 1.5, cashValue10: 1.1, cashValue20: 2.0, deathBenefit: 1.2 }
    };

    const m = multipliers[level];
    const premium = Math.round(annualPremium * m.premium);
    const totalPremium10 = premium * 10;
    const totalPremium20 = premium * 20;

    return {
      premium,
      cashValue10: Math.round(totalPremium10 * m.cashValue10 * 1.5),
      cashValue20: Math.round(totalPremium20 * m.cashValue20 * 1.4),
      deathBenefit: Math.round(annualPremium * 50 * m.deathBenefit),
      totalPaid10: totalPremium10,
      totalPaid20: totalPremium20
    };
  };

  const projection = calculateProjection(fundingLevel);
  const maxProjection = calculateProjection('max');

  const benefits = [
    {
      icon: TrendingUp,
      title: "Faster Cash Accumulation",
      description: "More premium means more money earning index credits each year"
    },
    {
      icon: DollarSign,
      title: "Higher Retirement Income",
      description: "Larger cash value means more tax-free loans in retirement"
    },
    {
      icon: Zap,
      title: "Reduced Cost of Insurance",
      description: "Higher cash value offsets policy costs over time"
    },
    {
      icon: PiggyBank,
      title: "Policy Efficiency",
      description: "More of your premium goes to cash value, less to insurance costs"
    }
  ];

  const idealFor = [
    "High-income earners seeking tax-advantaged growth",
    "Business owners with excess cash flow",
    "Those prioritizing retirement income over death benefit",
    "Investors wanting market-linked returns without direct risk",
    "Families building multi-generational wealth"
  ];

  const faqs = [
    {
      question: "What does 'max funding' actually mean?",
      answer: "Max funding means contributing the maximum premium allowed under IRS guidelines without making your policy a Modified Endowment Contract (MEC). This maximizes cash value growth while maintaining tax advantages."
    },
    {
      question: "What is a MEC and why avoid it?",
      answer: "A Modified Endowment Contract (MEC) is a life insurance policy that exceeds IRS limits under the '7-pay test'—meaning if you pay more than what would fund the policy in 7 level annual payments, it becomes a MEC. MECs lose some tax advantages: distributions become taxable (LIFO) and subject to 10% penalties before age 59.5. Proper max funding stays just under this limit."
    },
    {
      question: "How much can I contribute?",
      answer: "The MEC limit varies by age, health, and death benefit. Generally, younger and healthier individuals can contribute more. Your agent can calculate your exact maximum based on your specific policy design."
    },
    {
      question: "Should everyone max fund their IUL?",
      answer: "Max funding is ideal if your goal is cash accumulation and retirement income. If you primarily need death benefit protection with limited budget, minimum or target funding may be more appropriate."
    },
    {
      question: "Can I change my funding level later?",
      answer: "Yes, you can increase or decrease premiums within policy guidelines. However, starting with higher funding from the beginning maximizes compound growth over time."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Rocket className="w-4 h-4" />
                Advanced Wealth Strategy
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                Max Funding
                <span className="block text-violet-500">Strategies</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                Supercharge your IUL's cash value growth by contributing the maximum premium allowed while maintaining all tax advantages.
              </p>

              <div className="space-y-3 mb-8">
                {["Maximize cash value accumulation", "Stay below MEC limits for tax benefits", "Build 2-3x more wealth than minimum funding"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    Design My Policy
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:+1234567890">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Speak to a Specialist
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Funding Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Funding Comparison</h3>
                <p className="text-gray-600 text-sm">See how funding level affects your cash value</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Annual Premium: <span className="text-violet-500 font-bold">${annualPremium.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={annualPremium}
                    onChange={(e) => setAnnualPremium(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$5,000</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Funding Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'minimum' as const, label: 'Minimum', icon: Shield },
                      { key: 'target' as const, label: 'Target', icon: Target },
                      { key: 'max' as const, label: 'Max', icon: Rocket }
                    ].map((level) => (
                      <button
                        key={level.key}
                        onClick={() => setFundingLevel(level.key)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          fundingLevel === level.key
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <level.icon className={`w-5 h-5 mx-auto mb-1 ${fundingLevel === level.key ? 'text-white' : 'text-primary'}`} />
                        <div className="text-xs font-medium">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white">
                  <div className="text-center mb-4">
                    <p className="text-sm opacity-90 mb-1">Annual Premium at {fundingLevel.charAt(0).toUpperCase() + fundingLevel.slice(1)} Level</p>
                    <p className="text-4xl font-bold">${projection.premium.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-xs opacity-75">Year 10 Cash Value</p>
                      <p className="text-lg font-bold">${projection.cashValue10.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs opacity-75">Year 20 Cash Value</p>
                      <p className="text-lg font-bold">${projection.cashValue20.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {fundingLevel !== 'max' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Max Funding Advantage</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Max funding would give you ${(maxProjection.cashValue20 - projection.cashValue20).toLocaleString()} more at year 20
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Your Max Funding Quote
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "2-3x", label: "More Cash Value" },
              { value: "Non-MEC", label: "Tax Advantages Preserved" },
              { value: "Higher", label: "Retirement Income" },
              { value: "Lower", label: "Effective Cost" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-violet-500">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Why Max Fund Your IUL?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              The advantages of maximum funding compound significantly over time.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Funding Level Comparison */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Three Funding Approaches
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Choose the strategy that matches your financial goals and see the difference.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                {[
                  {
                    key: 'minimum' as const,
                    title: "Minimum Funded",
                    subtitle: "Death Benefit Focus",
                    description: "Lowest premium, maximum death benefit per dollar, minimal cash value growth",
                    icon: Shield
                  },
                  {
                    key: 'target' as const,
                    title: "Target Funded",
                    subtitle: "Balanced Approach",
                    description: "Good balance of death benefit and cash value accumulation",
                    icon: Target
                  },
                  {
                    key: 'max' as const,
                    title: "Max Funded",
                    subtitle: "Cash Value Focus",
                    description: "Maximum premium allowed, fastest cash value growth, optimal for retirement",
                    icon: Rocket,
                    recommended: true
                  }
                ].map((level, index) => {
                  const proj = calculateProjection(level.key);
                  return (
                    <motion.div
                      key={level.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        level.recommended
                          ? 'bg-primary/5 border-violet-500'
                          : 'bg-gray-50 border-transparent'
                      }`}
                    >
                      {level.recommended && (
                        <div className="text-xs text-violet-500 font-semibold mb-2">RECOMMENDED FOR WEALTH BUILDING</div>
                      )}
                      <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                        <level.icon className="w-6 h-6 text-violet-500" />
                      </div>
                      <h3 className="text-lg font-bold text-primary mb-1">{level.title}</h3>
                      <div className="text-sm text-violet-500 font-medium mb-3">{level.subtitle}</div>
                      <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Premium</span>
                          <span className="font-semibold text-primary">${proj.premium.toLocaleString()}/yr</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Year 20 Value</span>
                          <span className="font-semibold text-primary">${proj.cashValue20.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Visual Comparison Bar */}
              <div className="bg-[#fffaf3] rounded-xl p-6">
                <div className="text-sm font-medium text-gray-700 mb-4">Year 20 Cash Value Comparison (based on ${annualPremium.toLocaleString()} base premium)</div>
                <div className="space-y-4">
                  {(['minimum', 'target', 'max'] as const).map((level) => {
                    const proj = calculateProjection(level);
                    const maxCash = calculateProjection('max').cashValue20;
                    const percentage = (proj.cashValue20 / maxCash) * 100;
                    const labels = { minimum: 'Minimum', target: 'Target', max: 'Max' };

                    return (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{labels[level]} Funded</span>
                          <span className="font-semibold text-primary">
                            ${proj.cashValue20.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full rounded-full ${
                              level === 'max'
                                ? 'bg-violet-500'
                                : level === 'target'
                                ? 'bg-primary/60'
                                : 'bg-primary/30'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
                Ideal For Those Who...
              </h2>
              <div className="space-y-4">
                {idealFor.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                  alt="Successful business owner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">2-3x Growth</p>
                    <p className="text-xs text-gray-500">vs minimum funding</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              How Max Funding Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Design Policy", description: "Work with an advisor to set optimal death benefit", icon: Target },
              { step: "2", title: "Calculate MEC Limit", description: "Determine maximum premium using the 7-pay test", icon: Calculator },
              { step: "3", title: "Fund Maximally", description: "Contribute at or near the MEC limit each year", icon: DollarSign },
              { step: "4", title: "Accelerate Growth", description: "Watch your cash value grow faster than traditional funding", icon: TrendingUp }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {i < 3 && (
                  <ArrowRight className="w-6 h-6 text-violet-500/30 mx-auto mt-4 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-violet-500" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "My advisor showed me the difference between minimum and max funding. After 12 years, my max-funded policy has nearly 3x the cash value. Best financial decision I ever made."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Michael T.</p>
                <p className="text-white/70 text-sm">Business Owner, Chicago</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Common Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-primary pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-violet-500 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="p-6 pt-0 text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
              Ready to Maximize Your IUL?
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              Get a custom illustration showing your max funding potential and projected cash value growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Max-Funded Quote
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:+1234567890">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call (555) 123-4567
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
