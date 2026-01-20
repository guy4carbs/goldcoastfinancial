import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Lock,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Percent,
  Target,
  Zap,
  Star,
  ArrowRight,
  LineChart,
  PieChart,
  Gauge,
  RefreshCw,
  Award,
  DollarSign,
  Calendar
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

export default function IndexedAnnuities() {
  const [principal, setPrincipal] = useState(100000);
  const [marketReturn, setMarketReturn] = useState(12);
  const [cap, setCap] = useState(10);
  const [floor] = useState(0);
  const [years, setYears] = useState(10);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('point-to-point');

  // Calculate credited rate
  const creditedRate = Math.min(Math.max(marketReturn, floor), cap);
  const indexedValue = Math.round(principal * Math.pow(1 + creditedRate / 100, years));
  const totalGrowth = indexedValue - principal;

  // Simulate a scenario
  const scenarioYears = [
    { year: 1, market: 15, credited: Math.min(15, cap) },
    { year: 2, market: -10, credited: 0 },
    { year: 3, market: 20, credited: Math.min(20, cap) },
    { year: 4, market: 8, credited: 8 },
    { year: 5, market: -5, credited: 0 }
  ];

  const creditingStrategies = [
    {
      id: 'point-to-point',
      name: "Point-to-Point",
      description: "Measures index change from start to end of year. Simple and straightforward.",
      typicalCap: "8-12%",
      bestFor: "Simplicity seekers"
    },
    {
      id: 'monthly-sum',
      name: "Monthly Sum",
      description: "Adds each month's gain with a monthly cap. Good for trending markets.",
      typicalCap: "2-3% monthly",
      bestFor: "Steady growth expectations"
    },
    {
      id: 'participation',
      name: "Participation Rate",
      description: "Get a percentage of the index gain, no cap. 50% of 20% gain = 10%.",
      typicalCap: "No cap, 40-80% participation",
      bestFor: "Uncapped potential"
    },
    {
      id: 'spread',
      name: "Spread/Margin",
      description: "Index gain minus a spread. 10% gain - 2% spread = 8% credit.",
      typicalCap: "No cap, 1-3% spread",
      bestFor: "Rising markets"
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Market-Linked Growth",
      description: "Earn interest based on index performance without direct market investment."
    },
    {
      icon: Shield,
      title: "0% Floor Protection",
      description: "Market drops? You get 0%—never negative. Principal always protected."
    },
    {
      icon: Lock,
      title: "Tax-Deferred Growth",
      description: "No annual taxes on growth until withdrawal."
    },
    {
      icon: RefreshCw,
      title: "Annual Reset",
      description: "Gains lock in yearly. Can't lose them in future down years."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Link to an Index",
      description: "Account linked to S&P 500 or other index (no direct investment).",
      icon: LineChart
    },
    {
      step: "2",
      title: "Index Moves",
      description: "Insurance company calculates index change each period.",
      icon: BarChart3
    },
    {
      step: "3",
      title: "Apply Cap & Floor",
      description: "Gains capped at max rate. Losses floored at 0%.",
      icon: Gauge
    },
    {
      step: "4",
      title: "Lock In Credits",
      description: "Credited interest locked in permanently.",
      icon: Lock
    }
  ];

  const vsComparison = [
    { feature: "Upside Potential", indexed: "Moderate (capped)", fixed: "Limited (fixed rate)", variable: "Unlimited" },
    { feature: "Downside Risk", indexed: "None (0% floor)", fixed: "None", variable: "Full market risk" },
    { feature: "Principal Protection", indexed: "Yes", fixed: "Yes", variable: "No" },
    { feature: "Fees", indexed: "Built into cap", fixed: "None visible", variable: "1-3% annually" },
    { feature: "Complexity", indexed: "Moderate", fixed: "Simple", variable: "Complex" },
    { feature: "Best For", indexed: "Balanced growth seekers", fixed: "Safety-first savers", variable: "Risk-tolerant investors" }
  ];

  const faqs = [
    {
      question: "How is interest determined?",
      answer: "Based on index performance over each crediting period, subject to caps, floors, and participation rates. You don't invest directly in the index."
    },
    {
      question: "Caps vs. participation rates?",
      answer: "Cap = maximum rate (10% cap on 20% gain = 10%). Participation = percentage of gain (50% participation on 20% = 10%). Some products use one, some use both."
    },
    {
      question: "Can I lose money?",
      answer: "Not from market performance—that's the 0% floor benefit. Surrender charges apply for early withdrawals. Fees are built into the product structure."
    },
    {
      question: "Indexed annuity vs. IUL?",
      answer: "Similar crediting mechanics. Key difference: indexed annuities have no death benefit; IUL does. Indexed annuities typically have simpler fees and higher caps."
    },
    {
      question: "What indexes are available?",
      answer: "S&P 500, NASDAQ-100, Russell 2000, international, and proprietary indexes. Allocate across multiple and change annually."
    },
    {
      question: "After the surrender period?",
      answer: "Full access with no charges. Take a lump sum, keep growing, start income, or 1035 exchange to another annuity."
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
                <TrendingUp className="w-4 h-4" />
                Market-Linked Growth
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Indexed Annuities
                <span className="block text-heritage-accent">Upside Without Downside</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Capture market gains when indexes rise, stay protected when they fall. Growth potential with a 0% floor protecting your principal.
              </p>

              <div className="space-y-3 mb-8">
                {["Earn interest linked to S&P 500 and other indexes", "0% floor—never lose principal to market drops", "Tax-deferred growth with no annual limits"].map((item, i) => (
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
                    Get Your Quote
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

            {/* Index Credit Simulator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Credit Simulator</h3>
                <p className="text-gray-500">See how caps and floors work</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Index Return: <span className={`font-bold ${marketReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{marketReturn}%</span>
                  </label>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={marketReturn}
                    onChange={(e) => setMarketReturn(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-30%</span>
                    <span>0%</span>
                    <span>+30%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cap Rate: <span className="text-heritage-accent font-bold">{cap}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.5"
                    value={cap}
                    onChange={(e) => setCap(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Visual representation */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Index Return</p>
                      <p className={`text-2xl font-bold ${marketReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marketReturn}%
                      </p>
                    </div>
                    <ArrowRight className="w-8 h-8 text-heritage-primary" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Your Credit</p>
                      <p className="text-2xl font-bold text-heritage-primary">{creditedRate}%</p>
                    </div>
                  </div>

                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    {/* Floor indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-red-100 flex items-center justify-center">
                      <span className="text-xs text-red-600 font-medium">Floor: 0%</span>
                    </div>
                    {/* Cap indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-green-100 flex items-center justify-center">
                      <span className="text-xs text-green-600 font-medium">Cap: {cap}%</span>
                    </div>
                    {/* Current position */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-1 bg-heritage-primary shadow-lg"
                      initial={{ left: '50%' }}
                      animate={{ left: `${50 + (creditedRate / cap) * 50}%` }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </div>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    {marketReturn < 0
                      ? "Market is down, but you're protected at 0%!"
                      : marketReturn > cap
                        ? `Market gained ${marketReturn}%, you earn the ${cap}% cap`
                        : `You earn the full ${marketReturn}% index gain`
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-white">
                    <Shield className="w-6 h-6 text-heritage-accent" />
                    <p className="text-sm">
                      <span className="font-semibold">Key benefit:</span> When the market drops,
                      you earn 0%—not negative. Your principal never decreases due to market performance.
                    </p>
                  </div>
                </div>
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
              { value: "0%", label: "Minimum Credit (Floor)" },
              { value: "8-12%", label: "Typical Cap Range" },
              { value: "100%", label: "Principal Protected" },
              { value: "Annual", label: "Gain Lock-In" }
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
              How Indexed Annuities Work
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Market-linked growth with built-in downside protection.
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
              Key Benefits
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              The best of both worlds—growth potential with principal protection.
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

      {/* Crediting Strategies */}
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
              Crediting Strategies
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different ways to calculate your interest credits.
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {creditingStrategies.map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStrategy === strategy.id
                      ? 'border-heritage-primary bg-heritage-primary/5 shadow-lg'
                      : 'border-gray-200 hover:border-heritage-accent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${selectedStrategy === strategy.id ? 'bg-heritage-primary' : 'bg-gray-100'}`}>
                      <BarChart3 className={`w-6 h-6 ${selectedStrategy === strategy.id ? 'text-white' : 'text-heritage-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{strategy.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{strategy.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-heritage-primary font-medium">Cap/Rate: {strategy.typicalCap}</span>
                        <span className="text-gray-500">Best for: {strategy.bestFor}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Year Scenario */}
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
              Real-World Example
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how an indexed annuity performs through market ups and downs.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-900">Year</th>
                    <th className="text-center p-4 font-semibold text-gray-900">S&P 500 Return</th>
                    <th className="text-center p-4 font-semibold text-gray-900">Your Credited Rate</th>
                    <th className="text-center p-4 font-semibold text-gray-900">Why?</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioYears.map((year, index) => (
                    <motion.tr
                      key={year.year}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="p-4 font-medium">Year {year.year}</td>
                      <td className={`p-4 text-center font-bold ${year.market >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {year.market > 0 ? '+' : ''}{year.market}%
                      </td>
                      <td className="p-4 text-center font-bold text-heritage-primary">
                        +{year.credited}%
                      </td>
                      <td className="p-4 text-center text-sm text-gray-600">
                        {year.market < 0
                          ? "Floor protection (0%)"
                          : year.market > cap
                            ? `Capped at ${cap}%`
                            : "Full gain credited"
                        }
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-xl p-6">
                <p className="text-sm text-red-600 mb-2">If 100% in S&P 500:</p>
                <p className="text-2xl font-bold text-red-700">+23% over 5 years</p>
                <p className="text-sm text-red-600 mt-1">With -10% and -5% losses along the way</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <p className="text-sm text-green-600 mb-2">With Indexed Annuity ({cap}% cap):</p>
                <p className="text-2xl font-bold text-green-700">+{scenarioYears.reduce((sum, y) => sum + y.credited, 0)}% over 5 years</p>
                <p className="text-sm text-green-600 mt-1">No negative years, steady growth</p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              *Hypothetical example for illustration only. Actual results will vary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
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
              Indexed vs. Other Annuities
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              How indexed annuities compare to fixed and variable options.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto overflow-x-auto"
          >
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">Indexed Annuity</th>
                  <th className="p-4 text-center font-semibold">Fixed Annuity</th>
                  <th className="p-4 text-center font-semibold">Variable Annuity</th>
                </tr>
              </thead>
              <tbody>
                {vsComparison.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold">{row.indexed}</td>
                    <td className="p-4 text-center text-gray-600">{row.fixed}</td>
                    <td className="p-4 text-center text-gray-600">{row.variable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              "In 2022, when my friends' portfolios dropped 20%, my indexed annuity was credited 0%.
              I didn't gain that year, but I didn't lose either. Then in 2023, I captured my full cap.
              That's exactly what I wanted—growth when possible, protection when needed."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face"
                alt="Patricia L."
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div className="text-left">
                <p className="text-white font-semibold">Patricia L.</p>
                <p className="text-white/70">Retired Nurse, Indexed Annuity Client</p>
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
              Common questions about indexed annuities.
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
              Grow Your Money Without the Risk
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get a personalized illustration showing how an indexed annuity could work for your retirement goals.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                >
                  Get Your Illustration <ArrowRight className="w-5 h-5" />
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
