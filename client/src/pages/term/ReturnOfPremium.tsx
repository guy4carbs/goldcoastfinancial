import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  RefreshCcw,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
  Star,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Clock,
  AlertCircle,
  Wallet,
  Calculator,
  XCircle,
  Target,
  Heart,
  Award,
  Scale,
  Users
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

export default function ReturnOfPremium() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ROP Calculator State
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [termLength, setTermLength] = useState(20);
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Animated ROP Calculator State
  const [showRopResult, setShowRopResult] = useState(false);
  const [ropResult, setRopResult] = useState<{
    ropMonthly: number;
    traditionalMonthly: number;
    totalRopPaid: number;
    totalTraditionalPaid: number;
    refundAmount: number;
    effectiveCost: number;
    investmentAlternative: number;
  } | null>(null);

  // Estimate monthly premiums (simplified calculation)
  const calculatePremiums = () => {
    const baseRate = gender === 'male' ? 0.12 : 0.10;
    const ageMultiplier = 1 + ((age - 25) * 0.03);
    const termMultiplier = 1 + ((termLength - 10) * 0.02);

    const traditionalMonthly = Math.round((coverageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    const ropMonthly = Math.round(traditionalMonthly * 2.8); // ROP typically costs 2-3x more

    const traditionalTotal = traditionalMonthly * 12 * termLength;
    const ropTotal = ropMonthly * 12 * termLength;

    return {
      traditionalMonthly,
      ropMonthly,
      traditionalTotal,
      ropTotal,
      refundAmount: ropTotal,
      difference: ropMonthly - traditionalMonthly
    };
  };

  const premiums = calculatePremiums();

  // Calculate detailed ROP result for animated reveal
  const calculateRopResult = () => {
    const baseRate = gender === 'male' ? 0.12 : 0.10;
    const ageMultiplier = 1 + ((age - 25) * 0.03);
    const termMultiplier = 1 + ((termLength - 10) * 0.02);

    const traditionalMonthly = Math.round((coverageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    const ropMonthly = Math.round(traditionalMonthly * 2.8);

    const totalRopPaid = ropMonthly * 12 * termLength;
    const totalTraditionalPaid = traditionalMonthly * 12 * termLength;

    // Calculate what you'd have if you invested the difference
    const monthlyDifference = ropMonthly - traditionalMonthly;
    const investmentReturn = 0.07; // 7% annual return
    let investmentAlternative = 0;
    for (let year = 0; year < termLength; year++) {
      investmentAlternative = (investmentAlternative + (monthlyDifference * 12)) * (1 + investmentReturn);
    }
    investmentAlternative = Math.round(investmentAlternative);

    // Effective cost (ROP total - refund)
    const effectiveCost = 0; // With ROP, you get it all back

    setRopResult({
      ropMonthly,
      traditionalMonthly,
      totalRopPaid,
      totalTraditionalPaid,
      refundAmount: totalRopPaid,
      effectiveCost,
      investmentAlternative
    });
    setShowRopResult(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const trustStats = [
    { value: "100%", label: "Premium Refund" },
    { value: "Tax-Free", label: "Returned Premiums" },
    { value: "20-30", label: "Year Terms Available" },
    { value: "0%", label: "Risk of Loss" }
  ];

  const bigStats = [
    { value: "100%", label: "Premium Return", sublabel: "If you outlive your policy" },
    { value: "2-3x", label: "Higher Premiums", sublabel: "Compared to traditional term" },
    { value: "$0", label: "Tax Liability", sublabel: "On returned premiums" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Pay Higher Premiums",
      description: "ROP costs 2-3x more than traditional term.",
      icon: Wallet
    },
    {
      step: 2,
      title: "Maintain Coverage",
      description: "Keep your policy active for the full term.",
      icon: Shield
    },
    {
      step: 3,
      title: "Outlive the Policy",
      description: "Alive at the end? You trigger the return feature.",
      icon: Clock
    },
    {
      step: 4,
      title: "Receive Your Refund",
      description: "Get 100% of premiums back, tax-free.",
      icon: RefreshCcw
    }
  ];

  const pros = [
    {
      icon: RefreshCcw,
      title: "100% Premium Refund",
      description: "Outlive the policy, get every dollar back."
    },
    {
      icon: Shield,
      title: "Tax-Free Return",
      description: "Refund is a return of your own money, not income."
    },
    {
      icon: PiggyBank,
      title: "Forced Savings",
      description: "Locks money away and returns it as a lump sum."
    },
    {
      icon: Heart,
      title: "Peace of Mind",
      description: "Either use the coverage or get your money back."
    },
    {
      icon: Award,
      title: "Full Death Benefit",
      description: "Same protection as traditional term."
    },
    {
      icon: Target,
      title: "Milestone Flexibility",
      description: "Some policies offer partial refunds at 10, 15 years."
    }
  ];

  const cons = [
    {
      icon: DollarSign,
      title: "Higher Cost",
      description: "ROP costs 2-3x more than traditional term."
    },
    {
      icon: TrendingUp,
      title: "Opportunity Cost",
      description: "Extra premiums could be invested elsewhere."
    },
    {
      icon: Clock,
      title: "No Interest Earned",
      description: "Premiums sit for decades earning nothing."
    },
    {
      icon: AlertCircle,
      title: "Strict Commitment",
      description: "Miss payments and you may lose the refund."
    },
    {
      icon: XCircle,
      title: "Limited Availability",
      description: "Not all insurers offer ROP."
    },
    {
      icon: Scale,
      title: "May Reduce Coverage",
      description: "Higher premiums may force lower coverage."
    }
  ];

  const comparisonScenarios = [
    {
      title: "Traditional Term",
      subtitle: "Lower cost, pure protection",
      monthlyPremium: premiums.traditionalMonthly,
      totalPaid: premiums.traditionalTotal,
      ifYouDie: `Beneficiaries receive ${formatCurrency(coverageAmount)}`,
      ifYouLive: "Premiums are gone (protection was the value)",
      investDifference: Math.round((premiums.ropMonthly - premiums.traditionalMonthly) * 12 * termLength * 1.5),
      verdict: "Best for: Budget-conscious, disciplined investors"
    },
    {
      title: "Return of Premium",
      subtitle: "Higher cost, guaranteed return",
      monthlyPremium: premiums.ropMonthly,
      totalPaid: premiums.ropTotal,
      ifYouDie: `Beneficiaries receive ${formatCurrency(coverageAmount)}`,
      ifYouLive: `You receive ${formatCurrency(premiums.ropTotal)} back tax-free`,
      investDifference: 0,
      verdict: "Best for: Non-investors, high earners"
    }
  ];

  const idealCandidates = [
    {
      icon: Wallet,
      title: "High Income Earners",
      description: "Can afford higher premiums without sacrificing other goals."
    },
    {
      icon: PiggyBank,
      title: "Non-Investors",
      description: "Won't invest the difference? ROP guarantees your money back."
    },
    {
      icon: Heart,
      title: "Risk-Averse",
      description: "Prefer guaranteed outcomes over potential gains."
    },
    {
      icon: Clock,
      title: "Shorter Coverage Needs",
      description: "Covering a 15-year mortgage? ROP can be a win-win."
    },
    {
      icon: Users,
      title: "Young & Healthy",
      description: "More likely to outlive the policy."
    },
    {
      icon: Target,
      title: "Hate Wasting Money",
      description: "If that concern stops you from buying, ROP removes the barrier."
    }
  ];

  const notIdealFor = [
    {
      title: "Budget-Constrained Buyers",
      reason: "Higher premiums may force less coverage."
    },
    {
      title: "Disciplined Investors",
      reason: "Investing the difference could yield higher returns."
    },
    {
      title: "Unstable Income",
      reason: "Missing payments can void the return feature."
    },
    {
      title: "Maximum Coverage Seekers",
      reason: "Traditional term provides more coverage per dollar."
    }
  ];

  const faqs = [
    {
      question: "How does return of premium term life insurance work?",
      answer: "ROP refunds all premiums if you outlive the policy. Pay 2-3x more than traditional term, maintain for the full term, get 100% back tax-free."
    },
    {
      question: "Is the premium refund taxable?",
      answer: "No. The IRS considers it a return of your own money, not income."
    },
    {
      question: "What happens if I cancel early?",
      answer: "You may lose some or all of the refund. Some policies offer partial refunds at milestones."
    },
    {
      question: "Is ROP better than investing the difference?",
      answer: "Depends on discipline and risk tolerance. Investing could outperform, but ROP provides guaranteed, risk-free return."
    },
    {
      question: "Can I add ROP to an existing policy?",
      answer: "Generally no. ROP must be included at purchase or added as a rider at origination."
    },
    {
      question: "What if I miss a payment?",
      answer: "Missing payments can jeopardize your refund. Most policies have a 30-31 day grace period. Set up auto-pay."
    },
    {
      question: "Do ROP policies build cash value?",
      answer: "No. ROP is still term insurance with no cash value to borrow against."
    },
    {
      question: "What term lengths are available?",
      answer: "Typically 15, 20, 25, and 30-year terms. Not all insurers offer all lengths."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-heritage-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-heritage-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-heritage-primary font-semibold mb-4 tracking-wide uppercase text-sm">
                Return of Premium Term Life
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Get Every Dollar
                <span className="text-heritage-primary"> Back</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
                Win either way. Family gets the death benefit, or you get 100% of premiums back tax-free.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href="/quote">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/90 transition-colors cursor-pointer"
                  >
                    Get ROP Quote <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
                <motion.a
                  href="tel:6307780800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak to an Advisor
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Interactive Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-primary/10 rounded-xl">
                    <Calculator className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">ROP Cost Comparison</h3>
                    <p className="text-gray-500">See what you'd pay vs. get back</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Amount: <span className="text-heritage-primary font-bold">{formatCurrency(coverageAmount)}</span>
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="2000000"
                      step="50000"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term Length: <span className="text-heritage-primary font-bold">{termLength} years</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 20, 25, 30].map((term) => (
                        <motion.button
                          key={term}
                          onClick={() => setTermLength(term)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            termLength === term
                              ? 'bg-heritage-primary text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {term}yr
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Age: <span className="text-heritage-primary font-bold">{age}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="55"
                      step="1"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Traditional Term</span>
                    <span className="font-bold text-gray-700">${premiums.traditionalMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-heritage-primary/10 rounded-lg border-2 border-heritage-primary">
                    <span className="text-heritage-primary font-medium">Return of Premium</span>
                    <span className="font-bold text-heritage-primary">${premiums.ropMonthly}/mo</span>
                  </div>
                </div>

                <div className="p-6 bg-heritage-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm mb-1">Your Guaranteed Refund</p>
                  <p className="text-5xl font-bold text-white mb-1">{formatCurrency(premiums.ropTotal)}</p>
                  <p className="text-heritage-accent text-sm font-medium">If you outlive the policy</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                <p className="text-white/70 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive ROP Calculator with Animated Refund Reveal */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ROP Refund Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See exactly how much you would pay and get back with a Return of Premium policy.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-heritage-primary font-bold">{formatCurrency(coverageAmount)}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={coverageAmount}
                    onChange={(e) => { setCoverageAmount(parseInt(e.target.value)); setShowRopResult(false); }}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length: <span className="text-heritage-primary font-bold">{termLength} years</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 20, 25, 30].map((term) => (
                      <motion.button
                        key={term}
                        onClick={() => { setTermLength(term); setShowRopResult(false); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          termLength === term
                            ? 'bg-heritage-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {term}yr
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-heritage-primary font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="55"
                    step="1"
                    value={age}
                    onChange={(e) => { setAge(parseInt(e.target.value)); setShowRopResult(false); }}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' }
                    ].map((g) => (
                      <motion.button
                        key={g.id}
                        onClick={() => { setGender(g.id as 'male' | 'female'); setShowRopResult(false); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          gender === g.id
                            ? 'bg-heritage-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateRopResult}
                className="w-full bg-heritage-primary hover:bg-heritage-primary/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Calculate My Refund
              </motion.button>

              {/* Animated ROP Result Reveal */}
              <AnimatePresence>
                {showRopResult && ropResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-6"
                      >
                        <p className="text-white/80 text-sm mb-1">Your Guaranteed Refund</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-6xl font-bold text-heritage-accent"
                        >
                          {formatCurrency(ropResult.refundAmount)}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-white/70 text-sm mt-2"
                        >
                          Tax-free if you outlive the policy
                        </motion.p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                      >
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">ROP Monthly</p>
                          <p className="text-xl font-bold text-white">${ropResult.ropMonthly}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Traditional Monthly</p>
                          <p className="text-xl font-bold text-white">${ropResult.traditionalMonthly}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Total Paid (ROP)</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(ropResult.totalRopPaid)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Effective Cost</p>
                          <p className="text-xl font-bold text-heritage-accent">$0</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 bg-heritage-accent/20 rounded-lg border border-heritage-accent/30 mb-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-heritage-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-white mb-1">Win-Win Scenario</p>
                            <p className="text-sm text-white/90">
                              Your family gets {formatCurrency(coverageAmount)} if you pass away. You get {formatCurrency(ropResult.refundAmount)} back if you outlive the policy.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="p-4 bg-white/10 rounded-lg mb-4"
                      >
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-white/70 mb-1">Investment Alternative Comparison</p>
                            <p className="text-sm text-white/90">
                              Investing the ${ropResult.ropMonthly - ropResult.traditionalMonthly}/mo difference at 7% return could grow to <span className="font-bold text-white">{formatCurrency(ropResult.investmentAlternative)}</span> - but requires market discipline and comes with risk.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <Link href="/quote">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-3 rounded-lg font-semibold"
                          >
                            Get My ROP Quote
                          </motion.button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
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
              How Return of Premium Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pay higher premiums now, get them all back if you outlive the policy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-lg transition-shadow h-full">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-heritage-primary text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-4 mt-4">
                    <step.icon className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-heritage-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pros Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              The Benefits
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Consider Return of Premium
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {pros.map((pro, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
                    <pro.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{pro.title}</h3>
                    <p className="text-gray-600">{pro.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cons Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              The Drawbacks
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What to Consider Before Buying ROP
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {cons.map((con, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl flex-shrink-0">
                    <con.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{con.title}</h3>
                    <p className="text-gray-600">{con.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Side-by-Side Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Traditional Term vs. Return of Premium
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {comparisonScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`rounded-xl p-8 ${
                  index === 1
                    ? 'bg-heritage-primary text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {scenario.title}
                </h3>
                <p className={`mb-6 ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>
                  {scenario.subtitle}
                </p>

                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-xl ${index === 1 ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Monthly Premium</p>
                    <p className={`text-3xl font-bold ${index === 1 ? 'text-white' : 'text-heritage-primary'}`}>
                      ${scenario.monthlyPremium}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${index === 1 ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Total Paid Over {termLength} Years</p>
                    <p className={`text-2xl font-bold ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(scenario.totalPaid)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${index === 1 ? 'text-heritage-accent' : 'text-green-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>If You Pass Away</p>
                      <p className={`font-semibold ${index === 1 ? 'text-white' : 'text-gray-900'}`}>{scenario.ifYouDie}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${index === 1 ? 'text-heritage-accent' : 'text-green-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>If You Outlive Policy</p>
                      <p className={`font-semibold ${index === 1 ? 'text-white' : 'text-gray-900'}`}>{scenario.ifYouLive}</p>
                    </div>
                  </div>
                  {scenario.investDifference > 0 && (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">If Difference Invested (7% return)</p>
                        <p className="font-semibold text-gray-900">Potential: {formatCurrency(scenario.investDifference)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`mt-6 p-4 rounded-xl ${index === 1 ? 'bg-heritage-accent/20' : 'bg-heritage-primary/10'}`}>
                  <p className={`text-sm font-medium ${index === 1 ? 'text-heritage-accent' : 'text-heritage-primary'}`}>
                    {scenario.verdict}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who Should Consider ROP */}
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
              Is ROP Right for You?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Works best for certain profiles.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {idealCandidates.map((candidate, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-3 bg-heritage-primary/10 rounded-xl w-fit mb-4">
                  <candidate.icon className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{candidate.title}</h3>
                <p className="text-gray-600">{candidate.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who Should NOT Consider ROP */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              When Traditional Term Might Be Better
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {notIdealFor.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.reason}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {bigStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <p className="text-5xl md:text-6xl font-bold text-heritage-primary mb-2">{stat.value}</p>
                <p className="text-xl font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-gray-500">{stat.sublabel}</p>
              </motion.div>
            ))}
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
                <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <div className="flex items-center gap-2 justify-center mb-6">
              <Award className="w-5 h-5 text-heritage-accent" />
              <span className="text-heritage-accent font-semibold">Verified Customer</span>
            </div>
            <blockquote className="text-xl md:text-2xl text-white mb-8 italic leading-relaxed">
              "I knew I wouldn't invest the difference. After 20 years, I got back $34K - paid for our trip to Europe and went toward grandkids' college. Best insurance decision I ever made."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Robert D."
                className="w-16 h-16 rounded-full object-cover border-2 border-heritage-accent"
              />
              <div className="text-left">
                <p className="font-semibold text-white">Robert D.</p>
                <p className="text-white/70">20-Year ROP Policyholder, Phoenix AZ</p>
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
                className="bg-white rounded-xl overflow-hidden border border-gray-200"
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
              Protection That Pays You Back
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              See exactly what you'd pay and get back. We'll help you decide if ROP is right for you.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/90 transition-colors cursor-pointer"
                >
                  Get Your ROP Quote <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
              <motion.a
                href="tel:6307780800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
              >
                <Phone className="w-5 h-5" /> Speak to an Advisor
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
