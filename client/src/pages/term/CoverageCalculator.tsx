import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
  Star,
  Home,
  GraduationCap,
  CreditCard,
  DollarSign,
  Users,
  Baby,
  Briefcase,
  PiggyBank,
  AlertCircle,
  TrendingUp,
  Target,
  Heart
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function CoverageCalculator() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // DIME Calculator State
  const [debts, setDebts] = useState(25000);
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [yearsToReplace, setYearsToReplace] = useState(10);
  const [mortgageBalance, setMortgageBalance] = useState(300000);
  const [educationCosts, setEducationCosts] = useState(100000);
  const [existingCoverage, setExistingCoverage] = useState(0);
  const [savings, setSavings] = useState(50000);

  // Simple Calculator State
  const [simpleIncome, setSimpleIncome] = useState(75000);
  const [multiplier, setMultiplier] = useState(10);
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'dime'>('simple');

  const calculateDIME = () => {
    const d = debts;
    const i = annualIncome * yearsToReplace;
    const m = mortgageBalance;
    const e = educationCosts;
    const total = d + i + m + e;
    const adjusted = total - existingCoverage - savings;
    return Math.max(0, adjusted);
  };

  const calculateSimple = () => {
    return simpleIncome * multiplier;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const trustStats = [
    { value: "10-12x", label: "Income Rule of Thumb" },
    { value: "DIME", label: "Expert Method" },
    { value: "42%", label: "Americans Underinsured" },
    { value: "$500K", label: "Average Coverage Need" }
  ];

  const bigStats = [
    { value: "10x", label: "Minimum Coverage", sublabel: "Times your annual income" },
    { value: "42%", label: "Coverage Gap", sublabel: "Americans are underinsured" },
    { value: "$200K", label: "Average Shortfall", sublabel: "Per underinsured family" }
  ];

  const calculationMethods = [
    {
      icon: Calculator,
      title: "10x Income Rule",
      description: "The simplest method: multiply your annual salary by 10. If you earn $75,000, you'd need $750,000 in coverage. Quick but doesn't account for specific needs.",
      pros: ["Easy to calculate", "Good starting point", "Works for many situations"],
      cons: ["Doesn't consider debts", "Ignores savings", "One-size-fits-all"]
    },
    {
      icon: Target,
      title: "DIME Method",
      description: "A comprehensive approach that adds Debt + Income replacement + Mortgage + Education costs. More accurate but requires gathering financial details.",
      pros: ["More accurate", "Considers all obligations", "Customized to your situation"],
      cons: ["More complex", "Requires detailed info", "May overestimate"]
    },
    {
      icon: TrendingUp,
      title: "Human Life Value",
      description: "Calculates the present value of your future earnings until retirement. Used by financial professionals for precise planning.",
      pros: ["Most precise", "Accounts for earning growth", "Professional method"],
      cons: ["Complex calculations", "Requires assumptions", "May be overwhelming"]
    },
    {
      icon: PiggyBank,
      title: "Needs Analysis",
      description: "Subtracts your assets from your obligations. Accounts for savings, investments, and existing coverage you already have.",
      pros: ["Accounts for assets", "Most personalized", "Avoids over-insurance"],
      cons: ["Requires full financial picture", "Time-consuming", "Assets may change"]
    }
  ];

  const lifeStageCoverage = [
    {
      icon: Baby,
      stage: "Young Parents (25-35)",
      recommendation: "15-20x income",
      coverage: "$750K - $1.5M",
      reason: "Maximum protection needed with young children, mortgage, and decades of income to replace.",
      termLength: "30-year term"
    },
    {
      icon: Users,
      stage: "Established Families (35-45)",
      recommendation: "10-15x income",
      coverage: "$500K - $1M",
      reason: "Kids approaching college, mortgage partially paid. Balance protection with growing savings.",
      termLength: "20-year term"
    },
    {
      icon: GraduationCap,
      stage: "Pre-Retirement (45-55)",
      recommendation: "8-10x income",
      coverage: "$400K - $750K",
      reason: "Kids independent soon, retirement savings growing. Focus on debt elimination and income bridge.",
      termLength: "15-20 year term"
    },
    {
      icon: Heart,
      stage: "Near Retirement (55-65)",
      recommendation: "5-8x income",
      coverage: "$200K - $500K",
      reason: "Minimal debts, substantial savings. Coverage for final expenses, estate planning, spousal support.",
      termLength: "10-15 year term"
    }
  ];

  const coverageFactors = [
    {
      icon: Home,
      title: "Mortgage Balance",
      description: "Include your full mortgage payoff amount so your family can keep the home without payments.",
      typical: "$200K - $500K"
    },
    {
      icon: GraduationCap,
      title: "Education Costs",
      description: "Average 4-year public college: $104,000. Private: $223,000. Multiply by number of children.",
      typical: "$100K - $450K"
    },
    {
      icon: CreditCard,
      title: "Outstanding Debts",
      description: "Car loans, credit cards, student loans, personal loans. Don't leave debt to your family.",
      typical: "$20K - $100K"
    },
    {
      icon: DollarSign,
      title: "Income Replacement",
      description: "10 years of income is standard. Consider your spouse's earning potential and needs.",
      typical: "$500K - $1.5M"
    },
    {
      icon: Briefcase,
      title: "Final Expenses",
      description: "Funeral costs average $12,000-$15,000. Include legal fees, estate settlement costs.",
      typical: "$15K - $25K"
    },
    {
      icon: Heart,
      title: "Emergency Fund",
      description: "Leave 6-12 months of expenses for your family to adjust without financial pressure.",
      typical: "$30K - $75K"
    }
  ];

  const faqs = [
    {
      question: "How much life insurance do I really need?",
      answer: "Most financial experts recommend 10-12 times your annual income as a starting point. However, the DIME method (Debt + Income + Mortgage + Education) provides a more accurate calculation. For a family with a $75,000 income, $300,000 mortgage, and two kids heading to college, coverage of $1-1.5 million is often appropriate."
    },
    {
      question: "What's the difference between the 10x rule and DIME method?",
      answer: "The 10x rule is simple: multiply your income by 10. It's quick but generic. The DIME method adds up your specific Debts, Income replacement needs (income × years), Mortgage balance, and Education costs. DIME is more accurate because it considers your actual financial obligations rather than just your income."
    },
    {
      question: "Should I include my spouse's income in the calculation?",
      answer: "Yes, if your spouse works, their income affects how much coverage you need. If they earn enough to cover basic expenses, you may need less coverage. However, consider: would they need to reduce hours to care for children? Would they lose your benefits? Many families insure both spouses."
    },
    {
      question: "How often should I recalculate my coverage needs?",
      answer: "Review your coverage every 3-5 years, or after major life events: marriage, divorce, new baby, home purchase, salary increase, paying off debt, or children becoming independent. Your coverage needs typically decrease as you age and build wealth."
    },
    {
      question: "Is it possible to have too much life insurance?",
      answer: "While more coverage provides greater security, you shouldn't over-insure at the expense of other financial goals like retirement savings. The goal is to replace your economic contribution, not create a windfall. Balance coverage with premiums you can comfortably afford long-term."
    },
    {
      question: "What if I can't afford the coverage I need?",
      answer: "If the ideal coverage is too expensive, prioritize the most critical needs: mortgage and income replacement for young children. Consider a shorter term (20 vs 30 years), or 'ladder' multiple smaller policies. Some coverage is always better than none."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="bg-heritage-primary py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">
                Life Insurance Coverage Calculator
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                How Much Coverage
                <span className="text-heritage-accent"> Do You Need?</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                42% of American families would face financial hardship within 6 months of losing a breadwinner.
                Use our calculator to find the right coverage amount for your family.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak to an Advisor
                </a>
              </motion.div>
            </motion.div>

            {/* Interactive Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-accent/20 rounded-xl">
                    <Calculator className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Quick Calculator</h3>
                    <p className="text-gray-500">Estimate your coverage needs</p>
                  </div>
                </div>

                {/* Calculator Mode Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setCalculatorMode('simple')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      calculatorMode === 'simple'
                        ? 'bg-heritage-primary text-white'
                        : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                    }`}
                  >
                    10x Rule
                  </button>
                  <button
                    onClick={() => setCalculatorMode('dime')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      calculatorMode === 'dime'
                        ? 'bg-heritage-primary text-white'
                        : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                    }`}
                  >
                    DIME Method
                  </button>
                </div>

                {calculatorMode === 'simple' ? (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Income: <span className="text-heritage-primary font-bold">${simpleIncome.toLocaleString()}</span>
                      </label>
                      <input
                        type="range"
                        min="30000"
                        max="300000"
                        step="5000"
                        value={simpleIncome}
                        onChange={(e) => setSimpleIncome(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Multiplier</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[8, 10, 12, 15].map((mult) => (
                          <button
                            key={mult}
                            onClick={() => setMultiplier(mult)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                              multiplier === mult
                                ? 'bg-heritage-primary text-white shadow-lg scale-105'
                                : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between items-center p-2 bg-[#f5f0e8] rounded-lg">
                      <span className="text-gray-600">D - Debts</span>
                      <span className="font-bold text-heritage-primary">${debts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#f5f0e8] rounded-lg">
                      <span className="text-gray-600">I - Income ({yearsToReplace}yr)</span>
                      <span className="font-bold text-heritage-primary">${(annualIncome * yearsToReplace).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#f5f0e8] rounded-lg">
                      <span className="text-gray-600">M - Mortgage</span>
                      <span className="font-bold text-heritage-primary">${mortgageBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#f5f0e8] rounded-lg">
                      <span className="text-gray-600">E - Education</span>
                      <span className="font-bold text-heritage-primary">${educationCosts.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Recommended Coverage</p>
                  <p className="text-5xl font-bold text-white mb-1">
                    {formatCurrency(calculatorMode === 'simple' ? calculateSimple() : calculateDIME())}
                  </p>
                  <p className="text-heritage-accent text-sm font-medium">
                    {calculatorMode === 'simple' ? `${multiplier}x your income` : 'Based on DIME method'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
                <p className="text-3xl md:text-4xl font-bold text-heritage-primary">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full DIME Calculator Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The DIME Method Calculator
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              The most comprehensive way to calculate your coverage needs. Add up your Debts, Income replacement,
              Mortgage, and Education costs, then subtract existing resources.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#e8e0d5] max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Inputs */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold">D</span>
                  Debts (excluding mortgage)
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Debts: <span className="text-heritage-primary font-bold">${debts.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={debts}
                    onChange={(e) => setDebts(parseInt(e.target.value))}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Car loans, credit cards, student loans, personal loans</p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-4">
                  <span className="w-8 h-8 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold">I</span>
                  Income Replacement
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income: <span className="text-heritage-primary font-bold">${annualIncome.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="30000"
                    max="500000"
                    step="5000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(parseInt(e.target.value))}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Replace: <span className="text-heritage-primary font-bold">{yearsToReplace} years</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={yearsToReplace}
                    onChange={(e) => setYearsToReplace(parseInt(e.target.value))}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many years until your youngest is independent?</p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-4">
                  <span className="w-8 h-8 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold">M</span>
                  Mortgage Balance
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortgage: <span className="text-heritage-primary font-bold">${mortgageBalance.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={mortgageBalance}
                    onChange={(e) => setMortgageBalance(parseInt(e.target.value))}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-4">
                  <span className="w-8 h-8 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold">E</span>
                  Education Costs
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Education: <span className="text-heritage-primary font-bold">${educationCosts.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={educationCosts}
                    onChange={(e) => setEducationCosts(parseInt(e.target.value))}
                    className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">~$100K per child for public, ~$220K for private college</p>
                </div>
              </div>

              {/* Right Column - Subtractions & Results */}
              <div className="space-y-6">
                <div className="p-6 bg-[#f5f0e8] rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Subtract Existing Resources</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Existing Life Insurance: <span className="text-heritage-primary font-bold">${existingCoverage.toLocaleString()}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="25000"
                        value={existingCoverage}
                        onChange={(e) => setExistingCoverage(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Savings & Investments: <span className="text-heritage-primary font-bold">${savings.toLocaleString()}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="10000"
                        value={savings}
                        onChange={(e) => setSavings(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="p-6 bg-white border-2 border-heritage-primary/20 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Calculation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">D - Debts</span>
                      <span className="font-semibold">${debts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">I - Income ({yearsToReplace} years)</span>
                      <span className="font-semibold">${(annualIncome * yearsToReplace).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">M - Mortgage</span>
                      <span className="font-semibold">${mortgageBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">E - Education</span>
                      <span className="font-semibold">${educationCosts.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="text-gray-900 font-semibold">Total Needs</span>
                      <span className="font-bold text-heritage-primary">${(debts + annualIncome * yearsToReplace + mortgageBalance + educationCosts).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Existing Coverage</span>
                      <span>-${existingCoverage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Savings</span>
                      <span>-${savings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Final Result */}
                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Coverage You Need</p>
                  <p className="text-5xl font-bold text-white mb-2">{formatCurrency(calculateDIME())}</p>
                  <p className="text-heritage-accent text-sm font-medium">Based on DIME analysis</p>
                  <a
                    href="/quote"
                    className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors mt-4"
                  >
                    Get Quote for This Amount <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculation Methods Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              4 Ways to Calculate Coverage
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Different methods work for different situations. Here's how each approach calculates your needs.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {calculationMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-[#e8e0d5]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-heritage-primary/10 rounded-xl">
                    <method.icon className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{method.title}</h3>
                    <p className="text-gray-600 mt-2">{method.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {method.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-600 mb-2">Cons</p>
                    <ul className="space-y-1">
                      {method.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
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

      {/* Life Stage Coverage Recommendations */}
      <section className="py-20 bg-heritage-primary">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Coverage by Life Stage
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Your coverage needs change as you move through life. Here's what experts recommend at each stage.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {lifeStageCoverage.map((stage, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-4">
                  <stage.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{stage.stage}</h3>
                <p className="text-3xl font-bold text-heritage-primary mb-1">{stage.recommendation}</p>
                <p className="text-gray-600 text-sm mb-4">{stage.coverage}</p>
                <p className="text-gray-500 text-sm">{stage.reason}</p>
                <p className="mt-4 text-heritage-primary font-semibold text-sm">{stage.termLength}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Coverage Factors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What to Include in Your Calculation
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't overlook these important factors when determining how much coverage you need.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {coverageFactors.map((factor, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-heritage-primary/10 rounded-xl">
                    <factor.icon className="w-6 h-6 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{factor.title}</h3>
                    <p className="text-heritage-primary font-semibold">{factor.typical}</p>
                  </div>
                </div>
                <p className="text-gray-600">{factor.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {bigStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-shadow"
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg text-center border border-[#e8e0d5]"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
              "I thought $250,000 was enough until I used the DIME calculator. Between our mortgage,
              two kids' college funds, and income replacement, we actually needed $1.2 million.
              Heritage found us a policy for just $65/month. That peace of mind is priceless."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">JT</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Jennifer T.</p>
                <p className="text-gray-500">Mother of 2, Denver CO</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600">
              Get answers to common questions about calculating life insurance coverage.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-2xl shadow-sm overflow-hidden border border-[#e8e0d5]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f5f0e8] transition-colors"
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
      <section className="py-20 bg-heritage-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
              Know Your Number. Get Protected.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Now that you know how much coverage you need, let's find the right policy at the best price.
              Get a free quote in minutes.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Get Your Free Quote <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:6307780800"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5" /> Speak to an Advisor
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
