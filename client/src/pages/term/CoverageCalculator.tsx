import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Calculator,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
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
  Heart,
  Award
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

export default function CoverageCalculator() {
  const { trackCalculatorUsed, trackCalculatorResultViewed } = useAnalytics();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [simpleIncome, setSimpleIncome] = useState(75000);
  const [multiplier, setMultiplier] = useState(10);
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'dime'>('simple');

  // DIME Calculator State
  const [debts, setDebts] = useState(25000);
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [yearsToReplace, setYearsToReplace] = useState(10);
  const [mortgageBalance, setMortgageBalance] = useState(300000);
  const [educationCosts, setEducationCosts] = useState(100000);
  const [existingCoverage, setExistingCoverage] = useState(0);
  const [savings, setSavings] = useState(50000);

  // Animated result reveal state
  const [showDetailedResult, setShowDetailedResult] = useState(false);
  const [detailedCalculation, setDetailedCalculation] = useState<{
    total: number;
    breakdown: { label: string; value: number }[];
    recommendation: string;
  } | null>(null);

  const calculateDIME = () => {
    const total = debts + (annualIncome * yearsToReplace) + mortgageBalance + educationCosts;
    return Math.max(0, total - existingCoverage - savings);
  };

  const calculateSimple = () => simpleIncome * multiplier;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  // Calculate detailed result for animated reveal
  const calculateDetailedResult = () => {
    const incomeReplacement = annualIncome * yearsToReplace;
    const total = debts + incomeReplacement + mortgageBalance + educationCosts;
    const adjustedTotal = Math.max(0, total - existingCoverage - savings);

    // Track calculator usage
    trackCalculatorUsed('dime', {
      debts,
      annualIncome,
      yearsToReplace,
      mortgageBalance,
      educationCosts,
      existingCoverage,
      savings
    });

    const breakdown = [
      { label: "Debts (D)", value: debts },
      { label: `Income Replacement (I) - ${yearsToReplace} years`, value: incomeReplacement },
      { label: "Mortgage Balance (M)", value: mortgageBalance },
      { label: "Education Costs (E)", value: educationCosts },
      { label: "Less: Existing Coverage", value: -existingCoverage },
      { label: "Less: Savings", value: -savings },
    ];

    let recommendation = "";
    if (adjustedTotal < 500000) {
      recommendation = "Consider a 20-year term policy for optimal coverage.";
    } else if (adjustedTotal < 1000000) {
      recommendation = "A $500K-$1M policy would provide solid protection for your family.";
    } else {
      recommendation = "Consider laddering policies or a 30-year term for comprehensive coverage.";
    }

    setDetailedCalculation({ total: adjustedTotal, breakdown, recommendation });
    setShowDetailedResult(true);

    // Track result viewed
    trackCalculatorResultViewed('dime', `$${adjustedTotal.toLocaleString()}`);
  };

  const calculationMethods = [
    {
      icon: Calculator,
      title: "10x Income Rule",
      description: "Multiply your annual salary by 10. Quick and easy starting point."
    },
    {
      icon: Target,
      title: "DIME Method",
      description: "Debt + Income replacement + Mortgage + Education. More accurate."
    },
    {
      icon: TrendingUp,
      title: "Human Life Value",
      description: "Present value of future earnings until retirement."
    },
    {
      icon: PiggyBank,
      title: "Needs Analysis",
      description: "Subtracts assets from obligations for personalized results."
    }
  ];

  const lifeStageCoverage = [
    { icon: Baby, stage: "Young Parents (25-35)", recommendation: "15-20x income", coverage: "$750K - $1.5M", termLength: "30-year term" },
    { icon: Users, stage: "Established (35-45)", recommendation: "10-15x income", coverage: "$500K - $1M", termLength: "20-year term" },
    { icon: GraduationCap, stage: "Pre-Retirement (45-55)", recommendation: "8-10x income", coverage: "$400K - $750K", termLength: "15-20 year term" },
    { icon: Heart, stage: "Near Retirement (55-65)", recommendation: "5-8x income", coverage: "$200K - $500K", termLength: "10-15 year term" }
  ];

  const coverageFactors = [
    { icon: Home, title: "Mortgage Balance", description: "Full payoff so your family keeps the home.", typical: "$200K - $500K" },
    { icon: GraduationCap, title: "Education Costs", description: "~$104K public, ~$223K private per child.", typical: "$100K - $450K" },
    { icon: CreditCard, title: "Outstanding Debts", description: "Car loans, credit cards, student loans.", typical: "$20K - $100K" },
    { icon: DollarSign, title: "Income Replacement", description: "10 years of income is standard.", typical: "$500K - $1.5M" },
    { icon: Briefcase, title: "Final Expenses", description: "Funeral costs average $12-15K.", typical: "$15K - $25K" },
    { icon: Heart, title: "Emergency Fund", description: "6-12 months for family to adjust.", typical: "$30K - $75K" }
  ];

  const faqs = [
    { question: "How much life insurance do I really need?", answer: "Start with 10-12x your annual income. For a more precise number, use the DIME method (Debt + Income + Mortgage + Education). A family earning $75K with a $300K mortgage and two college-bound kids typically needs $1-1.5M." },
    { question: "What's the difference between 10x rule and DIME?", answer: "The 10x rule is quick: income × 10. DIME is more accurate: it adds your actual Debts, Income replacement needs, Mortgage balance, and Education costs." },
    { question: "Should I include my spouse's income?", answer: "Yes. If your spouse earns enough to cover basics, you may need less. But consider: would they reduce work hours for childcare? Would they lose your benefits?" },
    { question: "How often should I recalculate?", answer: "Every 3-5 years, or after major life events: marriage, divorce, new baby, home purchase, salary change, paying off debt, or kids becoming independent." },
    { question: "Is it possible to have too much?", answer: "Yes. Don't over-insure at the expense of retirement savings. The goal is replacing your economic contribution, not creating a windfall." }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calculator className="w-4 h-4" />
                Coverage Calculator
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                How Much Coverage
                <span className="block text-violet-500">Do You Need?</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                42% of families would struggle within 6 months of losing a breadwinner. Find the right coverage amount for your family.
              </p>

              <div className="space-y-3 mb-8">
                {["10-12x income is the starting point", "DIME method for precise calculation", "Factor in debts, mortgage, and education"].map((item, i) => (
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
                    Get Your Quote
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
                    Speak to an Advisor
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Quick Calculator</h3>
                <p className="text-gray-600 text-sm">Estimate your coverage needs</p>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setCalculatorMode('simple');
                    trackCalculatorUsed('simple_10x_rule', { income: simpleIncome, multiplier });
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    calculatorMode === 'simple'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  10x Rule
                </button>
                <button
                  onClick={() => {
                    setCalculatorMode('dime');
                    trackCalculatorUsed('dime_method', { debts, annualIncome, yearsToReplace, mortgageBalance, educationCosts });
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    calculatorMode === 'dime'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  DIME Method
                </button>
              </div>

              {calculatorMode === 'simple' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Income: <span className="text-violet-500 font-bold">${simpleIncome.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="30000"
                      max="300000"
                      step="5000"
                      value={simpleIncome}
                      onChange={(e) => setSimpleIncome(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Multiplier</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[8, 10, 12, 15].map((mult) => (
                        <button
                          key={mult}
                          onClick={() => {
                            setMultiplier(mult);
                            const result = simpleIncome * mult;
                            trackCalculatorUsed('simple_10x_rule', { income: simpleIncome, multiplier: mult });
                            trackCalculatorResultViewed('simple_10x_rule', `$${result.toLocaleString()}`);
                          }}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            multiplier === mult
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {[
                    { label: "D - Debts", value: debts },
                    { label: `I - Income (${yearsToReplace}yr)`, value: annualIncome * yearsToReplace },
                    { label: "M - Mortgage", value: mortgageBalance },
                    { label: "E - Education", value: educationCosts }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-bold text-primary">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white text-center">
                <p className="text-sm opacity-90 mb-1">Recommended Coverage</p>
                <p className="text-4xl font-bold">
                  {formatCurrency(calculatorMode === 'simple' ? calculateSimple() : calculateDIME())}
                </p>
                <p className="text-xs opacity-75 mt-2">
                  {calculatorMode === 'simple' ? `${multiplier}x your income` : 'Based on DIME method'}
                </p>
              </div>

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Quote for This Amount
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10-12x", label: "Income Rule of Thumb" },
              { value: "DIME", label: "Expert Method" },
              { value: "42%", label: "Americans Underinsured" },
              { value: "$500K", label: "Average Need" }
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

      {/* Interactive DIME Calculator with Animated Result Reveal */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Detailed DIME Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Input your specific numbers for a personalized coverage recommendation with breakdown.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outstanding Debts: <span className="text-violet-500 font-bold">${debts.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={debts}
                    onChange={(e) => { setDebts(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income: <span className="text-violet-500 font-bold">${annualIncome.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="30000"
                    max="300000"
                    step="5000"
                    value={annualIncome}
                    onChange={(e) => { setAnnualIncome(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Replace Income: <span className="text-violet-500 font-bold">{yearsToReplace} years</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={yearsToReplace}
                    onChange={(e) => { setYearsToReplace(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortgage Balance: <span className="text-violet-500 font-bold">${mortgageBalance.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="750000"
                    step="25000"
                    value={mortgageBalance}
                    onChange={(e) => { setMortgageBalance(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Costs: <span className="text-violet-500 font-bold">${educationCosts.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={educationCosts}
                    onChange={(e) => { setEducationCosts(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Life Insurance: <span className="text-violet-500 font-bold">${existingCoverage.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="25000"
                    value={existingCoverage}
                    onChange={(e) => { setExistingCoverage(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Savings: <span className="text-violet-500 font-bold">${savings.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={savings}
                    onChange={(e) => { setSavings(Number(e.target.value)); setShowDetailedResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateDetailedResult}
                className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate My Coverage Need
              </motion.button>

              {/* Animated Result Reveal */}
              <AnimatePresence>
                {showDetailedResult && detailedCalculation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-6 text-white">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-6"
                      >
                        <p className="text-white/80 text-sm mb-1">Your Recommended Coverage</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-5xl font-bold text-violet-500"
                        >
                          {formatCurrency(detailedCalculation.total)}
                        </motion.p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2 mb-6"
                      >
                        {detailedCalculation.breakdown.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex justify-between items-center p-2 bg-white/10 rounded-lg"
                          >
                            <span className="text-sm text-white/90">{item.label}</span>
                            <span className={`font-semibold ${item.value < 0 ? 'text-red-300' : 'text-white'}`}>
                              {item.value < 0 ? '-' : ''}${Math.abs(item.value).toLocaleString()}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="p-4 bg-violet-500/20 rounded-lg border border-violet-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-white/90">{detailedCalculation.recommendation}</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                      >
                        <Link href="/quote">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 bg-violet-500 hover:bg-violet-500/90 text-white py-3 rounded-lg font-semibold"
                          >
                            Get Quote for {formatCurrency(detailedCalculation.total)} Coverage
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

      {/* Calculation Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              4 Ways to Calculate Coverage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Different methods for different situations. Choose what fits your needs.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {calculationMethods.map((method, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Life Stage Coverage */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Coverage by Life Stage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Your needs change as you age. Here's what experts recommend.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {lifeStageCoverage.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stage.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-2">{stage.stage}</h3>
                <p className="text-2xl font-bold text-violet-500 mb-1">{stage.recommendation}</p>
                <p className="text-gray-600 text-sm mb-2">{stage.coverage}</p>
                <p className="text-primary text-xs font-medium">{stage.termLength}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Factors */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              What to Include in Your Calculation
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {coverageFactors.map((factor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#fffaf3] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <factor.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">{factor.title}</h3>
                    <p className="text-violet-500 text-sm font-semibold">{factor.typical}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{factor.description}</p>
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
              "I thought $250K was enough until I used the DIME calculator. We actually needed $1.2M. Heritage found us a policy for just $65/month."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Jennifer T.</p>
                <p className="text-white/70 text-sm">Mother of 2, Denver CO</p>
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
              Know Your Number. Get Protected.
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              Now find the right policy at the best price. Free quote in minutes.
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
