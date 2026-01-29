import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Layers,
  ArrowRight,
  Phone,
  Shield,
  DollarSign,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Zap,
  Gift,
  Target,
  Calculator,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function PaidUpAdditions() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [puaAmount, setPuaAmount] = useState(5000);

  // Enhanced PUA Calculator State
  const [showPuaCalculator, setShowPuaCalculator] = useState(false);
  const [basePremium, setBasePremium] = useState(3600);
  const [annualPua, setAnnualPua] = useState(5000);
  const [projectionYears, setProjectionYears] = useState(20);

  // Calculate PUA growth projections
  const calculatePuaProjections = () => {
    const projections = [];
    let baseOnlyCashValue = 0;
    let withPuaCashValue = 0;
    let baseTotalPremiums = 0;
    let withPuaTotalPremiums = 0;
    let totalDeathBenefitIncrease = 0;

    const baseEfficiency = 0.55; // Base premium - ~55% to cash value (improves over time)
    const puaEfficiency = 0.95; // PUA - ~95% to cash value
    const growthRate = 0.045; // 4.5% annual growth

    for (let year = 1; year <= projectionYears; year++) {
      baseTotalPremiums += basePremium;
      withPuaTotalPremiums += basePremium + annualPua;

      // Early years have lower efficiency for base
      const yearBaseEfficiency = Math.min(baseEfficiency + (year * 0.02), 0.75);

      // Base only - cash value accumulates
      baseOnlyCashValue = (baseOnlyCashValue * (1 + growthRate)) + (basePremium * yearBaseEfficiency);

      // With PUA - both base and PUA contribute
      withPuaCashValue = (withPuaCashValue * (1 + growthRate)) + (basePremium * yearBaseEfficiency) + (annualPua * puaEfficiency);

      // Death benefit from PUA
      totalDeathBenefitIncrease += annualPua * 2.5;

      projections.push({
        year,
        baseTotalPremiums,
        withPuaTotalPremiums,
        baseOnlyCashValue: Math.round(baseOnlyCashValue),
        withPuaCashValue: Math.round(withPuaCashValue),
        difference: Math.round(withPuaCashValue - baseOnlyCashValue),
        percentageGain: Math.round(((withPuaCashValue - baseOnlyCashValue) / baseOnlyCashValue) * 100),
        totalDeathBenefitIncrease: Math.round(totalDeathBenefitIncrease)
      });
    }

    return projections;
  };

  const puaProjections = calculatePuaProjections();

  const trustStats = [
    { value: "~95%", label: "Goes to Cash Value" },
    { value: "Immediate", label: "Coverage Increase" },
    { value: "Tax-Free", label: "Accumulation" },
    { value: "Flexible", label: "Payment Schedule" }
  ];

  const howPuaWorks = [
    {
      step: 1,
      title: "Pay Extra Premium",
      description: "Add funds beyond your base premium.",
      icon: DollarSign
    },
    {
      step: 2,
      title: "Buy Mini Policies",
      description: "Extra premium buys fully paid-up whole life.",
      icon: Layers
    },
    {
      step: 3,
      title: "Boost Both Values",
      description: "Increases death benefit AND cash value.",
      icon: TrendingUp
    },
    {
      step: 4,
      title: "Compound Growth",
      description: "PUAs earn dividends, accelerating growth.",
      icon: Zap
    }
  ];

  const puaVsBase = [
    { feature: "Cash Value Efficiency", pua: "~95% to cash value", base: "~50% to cash value" },
    { feature: "Commissions", pua: "Minimal or none", base: "Higher (year 1 especially)" },
    { feature: "Death Benefit", pua: "Increases immediately", base: "Fixed amount" },
    { feature: "Dividends", pua: "Yes, earns dividends", base: "Yes, earns dividends" },
    { feature: "Premium Requirement", pua: "Flexible, optional", base: "Required, fixed" },
    { feature: "Best Use", pua: "Accelerate cash growth", base: "Foundation coverage" }
  ];

  const puaSources = [
    {
      icon: Gift,
      title: "Dividends",
      description: "Direct policy dividends to purchase PUAs.",
      efficiency: "Most common method"
    },
    {
      icon: DollarSign,
      title: "Additional Premium",
      description: "Pay extra beyond base premium.",
      efficiency: "Flexible amounts"
    },
    {
      icon: Target,
      title: "Lump Sum",
      description: "One-time payment to boost cash value.",
      efficiency: "Immediate impact"
    }
  ];

  const growthComparison = [
    { year: 5, baseOnly: "$12,000", withPua: "$28,000", difference: "+133%" },
    { year: 10, baseOnly: "$32,000", withPua: "$78,000", difference: "+144%" },
    { year: 15, baseOnly: "$58,000", withPua: "$142,000", difference: "+145%" },
    { year: 20, baseOnly: "$92,000", withPua: "$228,000", difference: "+148%" }
  ];

  const faqs = [
    {
      question: "What exactly is a paid-up addition?",
      answer: "A PUA is a small, fully paid-up whole life insurance policy added to your base policy. It has its own death benefit and cash value. Since it's 'paid up,' no future premiums are needed for that portion."
    },
    {
      question: "Why is PUA more efficient than base premium?",
      answer: "Base premium includes costs for commissions, policy administration, and mortality charges. PUAs have minimal commissions and expenses—about 95% goes directly to cash value versus roughly 50% for base premium in early years."
    },
    {
      question: "How much PUA can I add?",
      answer: "There's a limit based on IRS guidelines to avoid MEC status. Typically, you can add PUA up to the amount that keeps your policy within the 7-pay test. Your insurer will tell you the maximum allowed."
    },
    {
      question: "Can I stop or reduce PUA payments?",
      answer: "Yes—PUA is flexible. You can pay more in good years, less in tight years, or skip entirely. It won't affect your base policy as long as you pay the required base premium."
    },
    {
      question: "Do PUAs earn dividends?",
      answer: "Yes! PUAs are whole life insurance, so they participate in dividends just like your base policy. This creates compound growth—dividends buy PUAs, which earn more dividends."
    },
    {
      question: "What happens to PUAs if I surrender the policy?",
      answer: "PUAs increase your total cash surrender value. When you surrender, you receive the combined cash value of your base policy plus all PUAs."
    }
  ];

  const calculatePuaImpact = () => {
    const immediateDeathBenefit = Math.round(puaAmount * 2.5);
    const yearOneCashValue = Math.round(puaAmount * 0.95);
    const tenYearCashValue = Math.round(puaAmount * 0.95 * 1.5);
    return { immediateDeathBenefit, yearOneCashValue, tenYearCashValue };
  };

  const { immediateDeathBenefit, yearOneCashValue, tenYearCashValue } = calculatePuaImpact();

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                Whole Life Insurance
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                Paid-Up Additions:
                <span className="block text-violet-500">Supercharge Your Policy</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                Add extra premium to accelerate cash value growth. More efficient than base premium.
              </p>

              <div className="space-y-3 mb-8">
                {["~95% goes directly to cash value", "Increases both death benefit AND cash value", "Flexible—pay more, less, or skip"].map((item, i) => (
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
                    Get Your Free Quote
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:6307780800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Speak to an Advisor
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* PUA Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">PUA Impact Calculator</h3>
                <p className="text-gray-600 text-sm">See the immediate effect</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual PUA Contribution: <span className="text-violet-500 font-bold">${puaAmount.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="500"
                  value={puaAmount}
                  onChange={(e) => setPuaAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$1,000</span>
                  <span>$25,000</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between p-4 bg-[#fffaf3] rounded-xl">
                  <span className="text-gray-600">Death Benefit Increase</span>
                  <span className="font-bold text-primary">+${immediateDeathBenefit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-[#fffaf3] rounded-xl">
                  <span className="text-gray-600">Year 1 Cash Value</span>
                  <span className="font-bold text-green-600">+${yearOneCashValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-[#fffaf3] rounded-xl">
                  <span className="text-gray-600">Year 10 Cash Value</span>
                  <span className="font-bold text-violet-500">~${tenYearCashValue.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Personalized Illustration
                </motion.button>
              </Link>

              <p className="text-center text-xs text-gray-500 mt-4">
                *Illustrative only. Actual values vary by carrier.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustStats.map((stat, i) => (
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

      {/* What Are PUAs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
                What Are Paid-Up Additions?
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed text-pretty">
                Paid-up additions are mini whole life policies you buy inside your existing policy. Each PUA is "paid up"—no future premiums required—and comes with its own death benefit and cash value.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                About 95% goes directly to cash value versus roughly 50% for base premium in early years.
              </p>

              <div className="space-y-3">
                {[
                  "~95% of PUA goes directly to cash value",
                  "Increases both death benefit AND cash value",
                  "Earns dividends just like base policy",
                  "Flexible—pay more, less, or skip entirely"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
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
              className="bg-[#fffaf3] rounded-xl p-8 border border-gray-200"
            >
              <div className="text-center">
                <Layers className="w-20 h-20 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-4">PUA Efficiency</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-3xl font-bold text-violet-500">~95%</p>
                    <p className="text-sm text-gray-600">PUA to Cash Value</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-3xl font-bold text-gray-400">~50%</p>
                    <p className="text-sm text-gray-600">Base to Cash Value</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How PUA Works */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              How Paid-Up Additions Work
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Four steps to accelerated cash value growth.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {howPuaWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <step.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < howPuaWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PUA vs Base Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              PUA vs. Base Premium
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Why PUAs are more efficient for cash value growth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-x-auto max-w-4xl mx-auto border border-gray-200"
          >
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">PUA Premium</th>
                  <th className="p-4 text-center font-semibold">Base Premium</th>
                </tr>
              </thead>
              <tbody>
                {puaVsBase.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-primary font-semibold">{row.pua}</td>
                    <td className="p-4 text-center text-gray-600">{row.base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Growth Comparison */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              The Power of PUAs Over Time
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Same total premium, dramatically different results.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-x-auto max-w-4xl mx-auto border border-gray-200"
          >
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-left font-semibold">Year</th>
                  <th className="p-4 text-center font-semibold">Base Only</th>
                  <th className="p-4 text-center font-semibold">With PUA Rider</th>
                  <th className="p-4 text-center font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {growthComparison.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">Year {row.year}</td>
                    <td className="p-4 text-center text-gray-600">{row.baseOnly}</td>
                    <td className="p-4 text-center font-bold text-primary">{row.withPua}</td>
                    <td className="p-4 text-center font-bold text-green-600">{row.difference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            *Hypothetical example assuming $5,000/year PUA contribution. Actual results vary.
          </motion.p>
        </div>
      </section>

      {/* PUA Sources */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Ways to Fund PUAs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Three ways to add paid-up additions to your policy.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
          >
            {puaSources.map((source, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <source.icon className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{source.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{source.description}</p>
                <p className="text-xs font-medium text-violet-500">{source.efficiency}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MEC Warning */}
      <section className="py-12 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Watch for MEC Status</h3>
                <p className="text-gray-600 text-sm">
                  IRS limits how much you can put into a life insurance policy. Exceed the limit and your policy becomes a Modified Endowment Contract (MEC)—losing tax-advantaged loan treatment. Work with your advisor to stay within guidelines.
                </p>
              </div>
            </div>
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
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-violet-500" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "My agent showed me two projections—one with PUAs, one without. Same total outlay, but after 15 years the PUA policy had nearly double the cash value. I max out my PUA rider every year now."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Kevin L.</p>
                <p className="text-white/70 text-sm">Whole Life Policyholder Since 2018</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced PUA Growth Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              PUA Growth Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-pretty">
              See exactly how paid-up additions accelerate your cash value growth compared to base premium only.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPuaCalculator(!showPuaCalculator)}
              className="bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <Calculator className="w-5 h-5" />
              {showPuaCalculator ? 'Hide Calculator' : 'Calculate PUA Growth'}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showPuaCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto bg-[#fffaf3] rounded-2xl shadow-xl p-8 border border-gray-200">
                  {/* Input Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Base Premium
                      </label>
                      <p className="text-2xl font-bold text-primary mb-2">${basePremium.toLocaleString()}</p>
                      <input
                        type="range"
                        min="1200"
                        max="12000"
                        step="200"
                        value={basePremium}
                        onChange={(e) => setBasePremium(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$1,200/yr</span>
                        <span>$12,000/yr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual PUA Contribution
                      </label>
                      <p className="text-2xl font-bold text-violet-500 mb-2">${annualPua.toLocaleString()}</p>
                      <input
                        type="range"
                        min="1000"
                        max="25000"
                        step="500"
                        value={annualPua}
                        onChange={(e) => setAnnualPua(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$1,000/yr</span>
                        <span>$25,000/yr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Projection Period
                      </label>
                      <p className="text-2xl font-bold text-gray-700 mb-2">{projectionYears} Years</p>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="5"
                        value={projectionYears}
                        onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10 years</span>
                        <span>30 years</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl p-5 text-center shadow-sm"
                    >
                      <p className="text-gray-500 text-xs mb-1">Total Annual Investment</p>
                      <p className="text-xl font-bold text-primary">${(basePremium + annualPua).toLocaleString()}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-5 text-center shadow-sm"
                    >
                      <p className="text-gray-500 text-xs mb-1">Base Only Cash Value</p>
                      <p className="text-xl font-bold text-gray-600">
                        ${puaProjections[puaProjections.length - 1]?.baseOnlyCashValue.toLocaleString() || 0}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-violet-500/20 rounded-xl p-5 text-center shadow-sm"
                    >
                      <p className="text-gray-500 text-xs mb-1">With PUA Cash Value</p>
                      <p className="text-xl font-bold text-violet-500">
                        ${puaProjections[puaProjections.length - 1]?.withPuaCashValue.toLocaleString() || 0}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-green-100 rounded-xl p-5 text-center shadow-sm"
                    >
                      <p className="text-gray-500 text-xs mb-1">PUA Advantage</p>
                      <p className="text-xl font-bold text-green-600">
                        +${puaProjections[puaProjections.length - 1]?.difference.toLocaleString() || 0}
                      </p>
                    </motion.div>
                  </div>

                  {/* Visual Comparison Chart */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-primary mb-6">Cash Value Growth Comparison</h4>
                    <div className="space-y-3">
                      {puaProjections.filter((_, i) => (i + 1) % 5 === 0 || i === 0).map((data, index) => {
                        const maxValue = puaProjections[puaProjections.length - 1]?.withPuaCashValue || 1;
                        const baseWidth = (data.baseOnlyCashValue / maxValue) * 100;
                        const puaWidth = (data.withPuaCashValue / maxValue) * 100;

                        return (
                          <motion.div
                            key={data.year}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center gap-4 mb-1">
                              <span className="w-20 text-sm font-medium text-gray-700">Year {data.year}</span>
                              <div className="flex-1 space-y-1">
                                {/* Base Only Bar */}
                                <div className="relative h-6">
                                  <motion.div
                                    className="absolute inset-y-0 left-0 bg-gray-300 rounded"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${baseWidth}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                  />
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700">
                                    Base: ${data.baseOnlyCashValue.toLocaleString()}
                                  </span>
                                </div>
                                {/* With PUA Bar */}
                                <div className="relative h-6">
                                  <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-violet-500 rounded"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${puaWidth}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                                  />
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                                    +PUA: ${data.withPuaCashValue.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <span className="w-24 text-right text-sm font-bold text-green-600">
                                +{data.percentageGain}%
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Benefits */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary rounded-xl p-6 text-white"
                  >
                    <h4 className="font-semibold mb-4">Additional PUA Benefits After {projectionYears} Years</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Extra Death Benefit</p>
                        <p className="text-2xl font-bold text-violet-500">
                          +${puaProjections[puaProjections.length - 1]?.totalDeathBenefitIncrease.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Extra Cash Value</p>
                        <p className="text-2xl font-bold text-violet-500">
                          +${puaProjections[puaProjections.length - 1]?.difference.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Growth Advantage</p>
                        <p className="text-2xl font-bold text-violet-500">
                          +{puaProjections[puaProjections.length - 1]?.percentageGain || 0}%
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-8 text-sm mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span className="text-gray-600">Base Premium Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-primary to-violet-500 rounded"></div>
                      <span className="text-gray-600">Base + PUA Contributions</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    *Projections assume 4.5% annual growth. PUA has ~95% cash value efficiency vs ~55-75% for base. Actual results vary.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#f5f0e8]">
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
              Accelerate Your Cash Value Growth
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              See how paid-up additions can supercharge your whole life policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free Quote
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call (630) 778-0800
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
