import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Wallet,
  Shield,
  Calendar,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Clock,
  Heart,
  Star,
  ArrowRight,
  DollarSign,
  Users,
  Target,
  Award,
  Infinity,
  PiggyBank,
  Calculator,
  BarChart3,
  Lock
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

export default function AnnuityRetirementIncome() {
  const [lumpSum, setLumpSum] = useState(250000);
  const [startAge, setStartAge] = useState(65);
  const [incomeType, setIncomeType] = useState<'immediate' | 'deferred'>('immediate');
  const [jointLife, setJointLife] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Simplified payout calculations (actual rates vary by carrier and change frequently)
  const basePayoutRate = startAge >= 70 ? 7.2 : startAge >= 65 ? 6.5 : 5.8;
  const jointAdjustment = jointLife ? 0.8 : 1;
  const deferralBonus = incomeType === 'deferred' ? 1.4 : 1;

  const monthlyIncome = Math.round((lumpSum * (basePayoutRate / 100) * jointAdjustment * deferralBonus) / 12);
  const annualIncome = monthlyIncome * 12;
  const lifetimeProjected = Math.round(annualIncome * (90 - startAge));

  const incomeOptions = [
    {
      id: 'spia',
      name: "SPIA",
      fullName: "Single Premium Immediate Annuity",
      description: "Income starts within 30 days. Highest payout rates, simple structure.",
      icon: Clock,
      bestFor: "Need income now",
      payoutExample: "6-8% annually"
    },
    {
      id: 'dia',
      name: "DIA",
      fullName: "Deferred Income Annuity",
      description: "Delay income for higher payouts. Lock in future guaranteed income today.",
      icon: Calendar,
      bestFor: "Planning 5-20 years ahead",
      payoutExample: "8-15% when it starts"
    },
    {
      id: 'rider',
      name: "Income Rider",
      fullName: "Guaranteed Lifetime Withdrawal Benefit",
      description: "Added to fixed/indexed annuity. Keep cash access while guaranteeing lifetime income.",
      icon: Shield,
      bestFor: "Flexibility + guarantees",
      payoutExample: "4-6% withdrawal rate"
    },
    {
      id: 'variable',
      name: "Variable Annuity",
      fullName: "With Living Benefit Rider",
      description: "Market growth potential with guaranteed income floor. Higher fees.",
      icon: BarChart3,
      bestFor: "Growth-focused investors",
      payoutExample: "Varies with market"
    }
  ];

  const benefits = [
    {
      icon: Infinity,
      title: "Income You Can't Outlive",
      description: "Guaranteed monthly payments for life. Eliminate longevity risk."
    },
    {
      icon: Shield,
      title: "Principal Protection",
      description: "Unlike investments, annuity income is contractually guaranteed."
    },
    {
      icon: TrendingUp,
      title: "Higher Than 4% Rule",
      description: "Payouts exceed safe withdrawal rates—includes principal + interest."
    },
    {
      icon: Heart,
      title: "Spouse & Legacy Options",
      description: "Joint-life protects your spouse. Period certain ensures minimum payout to heirs."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Determine Your Need",
      description: "Calculate income gap after Social Security/pensions.",
      icon: Calculator
    },
    {
      step: "2",
      title: "Choose Your Product",
      description: "Immediate, deferred, or income rider based on timeline.",
      icon: Target
    },
    {
      step: "3",
      title: "Fund Your Annuity",
      description: "Transfer from savings, IRAs, or 401(k)s.",
      icon: DollarSign
    },
    {
      step: "4",
      title: "Receive Lifetime Income",
      description: "Guaranteed monthly checks for life.",
      icon: Wallet
    }
  ];

  const payoutOptions = [
    {
      type: "Life Only",
      description: "Highest payout. Income stops at death.",
      rate: "Highest",
      bestFor: "Single individuals with other assets for heirs"
    },
    {
      type: "Life with Period Certain",
      description: "Income for life, minimum 10-20 years guaranteed to beneficiary.",
      rate: "Slightly lower",
      bestFor: "Beneficiary protection"
    },
    {
      type: "Joint & Survivor",
      description: "Income continues to surviving spouse for life.",
      rate: "20-30% lower",
      bestFor: "Married couples"
    },
    {
      type: "Cash Refund",
      description: "Beneficiary gets remaining premium if you die early.",
      rate: "Lower",
      bestFor: "Legacy-focused"
    }
  ];

  const comparisonData = [
    { feature: "Income Guarantee", annuity: "Lifetime guaranteed", portfolio: "Depends on market" },
    { feature: "Principal Risk", annuity: "None (protected)", portfolio: "Full market risk" },
    { feature: "Safe Withdrawal Rate", annuity: "6-8%+ of premium", portfolio: "3-4% typically" },
    { feature: "Flexibility", annuity: "Limited after purchase", portfolio: "Full access anytime" },
    { feature: "Legacy/Inheritance", annuity: "Options available", portfolio: "Full balance to heirs" },
    { feature: "Inflation Protection", annuity: "Riders available (cost extra)", portfolio: "Depends on returns" }
  ];

  const faqs = [
    {
      question: "How much income can I get?",
      answer: "Varies by age and product. Age 65: ~6-7% annually. Age 70: ~7-8%. Deferred 10 years: 10%+. We provide personalized illustrations."
    },
    {
      question: "What happens when I die?",
      answer: "Depends on your option. Life-only: stops. Period certain: remaining payments to beneficiary. Joint: spouse continues. Cash refund: unpaid premium to beneficiary."
    },
    {
      question: "Should I annuitize all my savings?",
      answer: "Generally no. Cover essential expenses with guaranteed income, keep the rest liquid for emergencies, inflation, and legacy."
    },
    {
      question: "Are payments taxable?",
      answer: "Qualified funds (IRA/401k): fully taxable. After-tax money: part tax-free return of premium. Taxation spreads over your lifetime."
    },
    {
      question: "What if I need a lump sum later?",
      answer: "SPIAs/DIAs don't allow it. Income riders on fixed/indexed annuities offer more flexibility—withdraw excess funds if needed."
    },
    {
      question: "How do I compare quotes?",
      answer: "Compare: monthly income, carrier rating, payout options, inflation features, and fees. We help compare multiple A-rated carriers."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Wallet className="w-4 h-4" />
                Guaranteed Lifetime Income
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Retirement Income
                <span className="block text-heritage-accent">You Can't Outlive</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Turn savings into pension-like income that lasts your entire lifetime. No matter how long you live, your income is guaranteed.
              </p>

              <div className="space-y-3 mb-8">
                {["Guaranteed monthly income for life", "Higher payouts than the 4% withdrawal rule", "Protect your spouse with joint-life options"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    Get Income Quote
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:6307780800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (630) 778-0800
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Income Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Income Estimator</h3>
                <p className="text-gray-500">See your potential lifetime income</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Amount: <span className="text-heritage-primary font-bold">${lumpSum.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="10000"
                    value={lumpSum}
                    onChange={(e) => setLumpSum(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$50k</span>
                    <span>$1M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Start Age: <span className="text-heritage-accent font-bold">{startAge}</span>
                  </label>
                  <input
                    type="range"
                    min="55"
                    max="80"
                    step="1"
                    value={startAge}
                    onChange={(e) => setStartAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>55</span>
                    <span>80</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Income Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIncomeType('immediate')}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        incomeType === 'immediate'
                          ? 'bg-heritage-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Immediate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIncomeType('deferred')}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        incomeType === 'deferred'
                          ? 'bg-heritage-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Deferred 10yr
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Joint Life (cover spouse)</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setJointLife(!jointLife)}
                    className={`w-12 h-6 rounded-full transition-colors ${jointLife ? 'bg-heritage-accent' : 'bg-gray-300'}`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: jointLife ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  </motion.button>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/70 text-sm">Monthly Income</p>
                      <p className="text-3xl font-bold">${monthlyIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Annual Income</p>
                      <p className="text-3xl font-bold text-heritage-accent">${annualIncome.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      <Infinity className="w-5 h-5 text-heritage-accent" />
                      <p className="text-lg font-semibold">Guaranteed for Life</p>
                    </div>
                    <p className="text-white/70 text-sm mt-1">
                      {incomeType === 'immediate' ? 'Starting immediately' : 'Starting in 10 years'} • {jointLife ? 'Covers both spouses' : 'Single life'}
                    </p>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500">
                  *Estimates only. Actual rates vary by carrier, age, gender, and current interest rates.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "6-8%", label: "Typical Payout Rates" },
              { value: "Lifetime", label: "Income Guarantee" },
              { value: "100%", label: "Principal Protected" },
              { value: "A-Rated", label: "Carrier Security" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Options */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ways to Create Retirement Income
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Different annuity products for different needs and timelines.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            {incomeOptions.map((option, index) => (
              <motion.div
                key={option.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-heritage-primary/10 rounded-full">
                    <option.icon className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-heritage-accent">{option.fullName}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                  <span className="text-sm"><strong>Payout:</strong> {option.payoutExample}</span>
                  <span className="text-sm text-heritage-primary"><strong>Best for:</strong> {option.bestFor}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Annuity Income?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              The only financial product that can guarantee income for life.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-heritage-primary/10 rounded-full mb-6">
                  <benefit.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Four steps to guaranteed lifetime income.
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-heritage-accent/30 -translate-x-1/2 z-0" />
                  )}
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-heritage-primary rounded-full mb-6 shadow-lg">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-heritage-accent rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payout Options */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payout Options
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose how you receive income and what happens to remaining funds.
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {payoutOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{option.type}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    option.rate === 'Highest' ? 'bg-green-100 text-green-700' :
                    option.rate === 'Slightly lower' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {option.rate} payout
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <p className="text-heritage-primary text-sm font-medium">Best for: {option.bestFor}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Annuity vs. Portfolio */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Annuity Income vs. Portfolio Withdrawals
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              How guaranteed income compares to the traditional approach.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto overflow-x-auto"
          >
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Factor</th>
                  <th className="p-4 text-center font-semibold">Annuity Income</th>
                  <th className="p-4 text-center font-semibold">Portfolio Withdrawals</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold">{row.annuity}</td>
                    <td className="p-4 text-center text-gray-600">{row.portfolio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-center text-sm text-gray-500 mt-4">
              Many retirees use both—annuities for essential expenses, investments for discretionary spending and legacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "I used to lie awake worrying about running out of money. Now I get $3,200 a month
              guaranteed for as long as I live. Between that and Social Security, my bills are covered
              no matter what happens in the market. I can actually enjoy retirement."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=face"
                alt="Margaret T."
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div className="text-left">
                <p className="text-white font-semibold">Margaret T.</p>
                <p className="text-white/70">Retired Accountant, Age 72</p>
              </div>
            </div>
          </motion.div>
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600">
              Common questions about annuity income.
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
                    className={`w-6 h-6 text-heritage-primary flex-shrink-0 transition-transform duration-200 ${
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Create Your Guaranteed Paycheck
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get a personalized income illustration based on your age, goals, and timeline. See exactly how much guaranteed income you could receive.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                >
                  Get Income Illustration <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-heritage-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call (630) 778-0800
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
