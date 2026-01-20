import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Gift,
  ArrowRight,
  Phone,
  TrendingUp,
  Shield,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Star,
  PiggyBank,
  Percent,
  BarChart3,
  Wallet,
  Building,
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

export default function Dividends() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('pua');

  // Interactive Dividend Comparison State
  const [showComparison, setShowComparison] = useState(false);
  const [annualDividend, setAnnualDividend] = useState(2000);
  const [yearsHeld, setYearsHeld] = useState(20);

  // Calculate outcomes for each dividend option over time
  const calculateDividendOutcomes = () => {
    const outcomes = {
      pua: {
        totalDeathBenefitIncrease: 0,
        totalCashValueIncrease: 0,
        cashReceived: 0,
        premiumSavings: 0
      },
      cash: {
        totalDeathBenefitIncrease: 0,
        totalCashValueIncrease: 0,
        cashReceived: 0,
        premiumSavings: 0
      },
      premium: {
        totalDeathBenefitIncrease: 0,
        totalCashValueIncrease: 0,
        cashReceived: 0,
        premiumSavings: 0
      },
      accumulate: {
        totalDeathBenefitIncrease: 0,
        totalCashValueIncrease: 0,
        cashReceived: 0,
        premiumSavings: 0
      }
    };

    // PUA: Compounds - death benefit and cash value grow
    for (let year = 1; year <= yearsHeld; year++) {
      const yearDividend = annualDividend * Math.pow(1.03, year - 1); // Dividends grow 3%/yr
      outcomes.pua.totalDeathBenefitIncrease += yearDividend * 2.5; // Each dollar buys ~$2.50 coverage
      outcomes.pua.totalCashValueIncrease += yearDividend * 0.95 * Math.pow(1.045, yearsHeld - year);
    }

    // Cash: Simple - take the money
    for (let year = 1; year <= yearsHeld; year++) {
      const yearDividend = annualDividend * Math.pow(1.03, year - 1);
      outcomes.cash.cashReceived += yearDividend;
    }

    // Premium Reduction: Save on premiums
    for (let year = 1; year <= yearsHeld; year++) {
      const yearDividend = annualDividend * Math.pow(1.03, year - 1);
      outcomes.premium.premiumSavings += yearDividend;
    }

    // Accumulate: Leave with insurer at interest
    for (let year = 1; year <= yearsHeld; year++) {
      const yearDividend = annualDividend * Math.pow(1.03, year - 1);
      outcomes.accumulate.totalCashValueIncrease += yearDividend * Math.pow(1.04, yearsHeld - year);
    }

    return outcomes;
  };

  const dividendOutcomes = calculateDividendOutcomes();

  const trustStats = [
    { value: "170+", label: "Years of Dividends", sublabel: "From top mutual companies" },
    { value: "4-6%", label: "Recent Rates", sublabel: "Dividend interest rates" },
    { value: "~$15B", label: "Paid Annually", sublabel: "By major insurers combined" },
    { value: "Tax-Free", label: "If Structured Right", sublabel: "Dividends on premiums paid" }
  ];

  const participatingVsNon = [
    { feature: "Dividends", participating: "Yes (not guaranteed)", nonParticipating: "No" },
    { feature: "Premium", participating: "Slightly higher", nonParticipating: "Lower" },
    { feature: "Cash Value Growth", participating: "Guaranteed + dividends", nonParticipating: "Guaranteed only" },
    { feature: "Issuing Company", participating: "Mutual companies", nonParticipating: "Stock companies" },
    { feature: "Best For", participating: "Long-term growth seekers", nonParticipating: "Budget-conscious buyers" }
  ];

  const dividendOptions = [
    {
      id: 'pua',
      icon: TrendingUp,
      title: "Paid-Up Additions",
      tagline: "Compound Your Growth",
      description: "Buy additional permanent insurance with your dividends. Increases both death benefit and cash value.",
      benefit: "Fastest cash value growth",
      example: "$500 dividend buys ~$2,500 additional coverage"
    },
    {
      id: 'cash',
      icon: Wallet,
      title: "Cash Payment",
      tagline: "Money in Your Pocket",
      description: "Receive dividends as a check or direct deposit. Simple and immediate.",
      benefit: "Liquid cash each year",
      example: "$500 dividend = $500 check to you"
    },
    {
      id: 'premium',
      icon: DollarSign,
      title: "Premium Reduction",
      tagline: "Lower Your Out-of-Pocket",
      description: "Apply dividends toward your premium, reducing your annual cost.",
      benefit: "Lower effective premium",
      example: "$500 dividend reduces $3,420 premium to $2,920"
    },
    {
      id: 'accumulate',
      icon: PiggyBank,
      title: "Accumulate at Interest",
      tagline: "Savings Within Savings",
      description: "Leave dividends with the insurer earning interest. Withdraw anytime.",
      benefit: "Flexible access + growth",
      example: "$500/yr grows to ~$6,500 in 10 years"
    }
  ];

  const topMutualCompanies = [
    { name: "Northwestern Mutual", dividendRate: "5.0%", streak: "170+ years" },
    { name: "MassMutual", dividendRate: "6.2%", streak: "170+ years" },
    { name: "New York Life", dividendRate: "5.65%", streak: "169 years" },
    { name: "Guardian", dividendRate: "5.65%", streak: "160+ years" },
    { name: "Penn Mutual", dividendRate: "5.5%", streak: "175+ years" }
  ];

  const howDividendsWork = [
    {
      icon: Building,
      title: "Company Profits",
      description: "Mutual insurers share profits with policyholders—you're part owner."
    },
    {
      icon: BarChart3,
      title: "Annual Declaration",
      description: "Board declares dividend rate each year based on investment returns, mortality, and expenses."
    },
    {
      icon: Percent,
      title: "Applied to Policy",
      description: "Your share is based on your policy's cash value and premiums paid."
    },
    {
      icon: Gift,
      title: "You Choose",
      description: "Take cash, buy more coverage, reduce premiums, or let it accumulate."
    }
  ];

  const faqs = [
    {
      question: "Are dividends guaranteed?",
      answer: "No. Dividends are not guaranteed and depend on the insurer's financial performance. However, top mutual companies have paid dividends continuously for over 100 years—even through the Great Depression and 2008 financial crisis."
    },
    {
      question: "What's the difference between mutual and stock insurance companies?",
      answer: "Mutual companies are owned by policyholders and share profits as dividends. Stock companies are owned by shareholders—profits go to them, not you. Only mutual companies offer true participating policies with dividends."
    },
    {
      question: "Are dividends taxable?",
      answer: "Generally no, as long as total dividends received don't exceed total premiums paid. The IRS treats them as a return of premium. If dividends plus interest exceed your basis, the excess may be taxable."
    },
    {
      question: "What's the best dividend option?",
      answer: "For maximum growth, paid-up additions compound your coverage and cash value fastest. For cash flow, take cash or reduce premiums. Your best choice depends on your goals—growth vs. income."
    },
    {
      question: "How much can I expect in dividends?",
      answer: "Typical participating policies return 4-6% of cash value annually as dividends. On a $100K cash value, that's $4,000-$6,000. New policies have low early dividends since cash value builds over time."
    },
    {
      question: "Can dividends eventually pay my entire premium?",
      answer: "Yes, with a \"dividend offset\" or \"vanishing premium\" strategy. After enough years, accumulated dividends can cover premiums. Timing depends on dividend rates and policy performance—typically 15-25 years."
    }
  ];

  const selectedDividendOption = dividendOptions.find(o => o.id === selectedOption)!;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-heritage-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-heritage-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">
                Whole Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Dividends &
                <span className="text-heritage-primary"> Participating Policies</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
                Share in your insurer's profits. Dividends can boost cash value, reduce premiums, or put cash in your pocket.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-dark transition-colors"
                  >
                    Get Your Free Quote <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="tel:6307780800"
                    className="inline-flex items-center gap-2 border-2 border-heritage-primary text-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Speak to an Advisor
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Dividend Options Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-accent/20 rounded-xl">
                    <Gift className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dividend Options</h3>
                    <p className="text-gray-500">Choose how to use your dividends</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {dividendOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedOption === option.id
                          ? 'bg-heritage-primary text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 mb-1 ${selectedOption === option.id ? 'text-heritage-accent' : 'text-heritage-primary'}`} />
                      <p className="text-sm font-medium">{option.title}</p>
                    </motion.button>
                  ))}
                </div>

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl">
                  <p className="text-white/80 text-sm mb-2">{selectedDividendOption.tagline}</p>
                  <p className="text-white mb-4">{selectedDividendOption.description}</p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-heritage-accent text-sm font-medium">Example:</p>
                    <p className="text-white text-sm">{selectedDividendOption.example}</p>
                  </div>
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
                <p className="text-white font-medium">{stat.label}</p>
                <p className="text-white/70 text-sm">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Are Dividends */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What Are Policy Dividends?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Participating whole life policies share in the insurance company's profits. When the company performs well, you receive a dividend—essentially a return of excess premiums.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Only mutual insurance companies (owned by policyholders) offer true participating policies. Top mutual insurers have paid dividends for over 150 consecutive years.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Share in company profits as a policyholder-owner",
                  "Not guaranteed, but historically consistent",
                  "Multiple ways to use your dividends",
                  "Can significantly boost long-term returns",
                  "Potentially tax-free in most situations"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-heritage-accent flex-shrink-0" />
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
              <div className="h-[500px] bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Gift className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Dividend Growth Image</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How Dividends Work */}
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
              How Dividends Work
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              From company profits to your policy benefits.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howDividendsWork.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 border border-gray-200 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howDividendsWork.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-heritage-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dividend Options Detail */}
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
              4 Ways to Use Your Dividends
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your choice, your strategy. Each option serves different goals.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {dividendOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-heritage-primary/10 rounded-xl">
                    <option.icon className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
                    <p className="text-heritage-accent text-sm font-medium">{option.tagline}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Benefit</p>
                  <p className="font-semibold text-heritage-primary">{option.benefit}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Participating vs Non-Participating */}
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
              Participating vs. Non-Participating
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Not all whole life policies pay dividends.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto border border-gray-200"
          >
            <div className="grid grid-cols-3 bg-heritage-primary text-white p-4 font-semibold">
              <div>Feature</div>
              <div className="text-center">Participating</div>
              <div className="text-center">Non-Participating</div>
            </div>
            {participatingVsNon.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center text-heritage-primary font-semibold">{row.participating}</div>
                <div className="text-center text-gray-600">{row.nonParticipating}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Mutual Companies */}
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
              Top Dividend-Paying Insurers
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mutual companies with century-plus dividend streaks.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {topMutualCompanies.map((company, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow"
              >
                <Award className="w-10 h-10 text-heritage-accent mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{company.name}</h3>
                <p className="text-2xl font-bold text-heritage-primary mb-1">{company.dividendRate}</p>
                <p className="text-xs text-gray-500">{company.streak}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            *Dividend rates are illustrative and subject to change annually. Past dividends don't guarantee future results.
          </motion.p>
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
            <blockquote className="text-xl md:text-2xl text-white mb-8 italic leading-relaxed">
              "I've directed dividends to paid-up additions for 18 years. My original $250K policy is now worth $380K—and my cash value grew 40% faster than projected. Compound growth is real."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="David T."
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div className="text-left">
                <p className="font-semibold text-white">David T.</p>
                <p className="text-white/70">Participating Policy Holder Since 2006</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Dividend Options Comparison */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dividend Options Comparison Tool
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              See how different dividend choices affect your policy over time. Adjust the values to match your situation.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowComparison(!showComparison)}
              className="bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              {showComparison ? 'Hide Comparison' : 'Compare Dividend Options'}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  {/* Slider Controls */}
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Annual Dividend: <span className="text-heritage-primary font-bold text-lg">${annualDividend.toLocaleString()}</span>
                      </label>
                      <input
                        type="range"
                        min="500"
                        max="10000"
                        step="250"
                        value={annualDividend}
                        onChange={(e) => setAnnualDividend(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>$500/yr</span>
                        <span>$10,000/yr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Time Period: <span className="text-heritage-primary font-bold text-lg">{yearsHeld} Years</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={yearsHeld}
                        onChange={(e) => setYearsHeld(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>5 years</span>
                        <span>30 years</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Paid-Up Additions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-heritage-accent" />
                        <h4 className="font-bold">Paid-Up Additions</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-white/70 text-xs">Death Benefit Increase</p>
                          <p className="text-xl font-bold text-heritage-accent">
                            +${Math.round(dividendOutcomes.pua.totalDeathBenefitIncrease).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs">Cash Value Increase</p>
                          <p className="text-lg font-semibold">
                            +${Math.round(dividendOutcomes.pua.totalCashValueIncrease).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs text-white/80">Best for: Long-term growth</p>
                      </div>
                    </motion.div>

                    {/* Cash Payment */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-6 h-6 text-heritage-primary" />
                        <h4 className="font-bold text-gray-900">Cash Payment</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-xs">Total Cash Received</p>
                          <p className="text-xl font-bold text-green-600">
                            ${Math.round(dividendOutcomes.cash.cashReceived).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Policy Growth</p>
                          <p className="text-lg font-semibold text-gray-400">
                            $0 additional
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Best for: Immediate income</p>
                      </div>
                    </motion.div>

                    {/* Premium Reduction */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-6 h-6 text-heritage-primary" />
                        <h4 className="font-bold text-gray-900">Premium Reduction</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-xs">Total Premium Savings</p>
                          <p className="text-xl font-bold text-heritage-primary">
                            ${Math.round(dividendOutcomes.premium.premiumSavings).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Policy Growth</p>
                          <p className="text-lg font-semibold text-gray-400">
                            $0 additional
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Best for: Lower out-of-pocket</p>
                      </div>
                    </motion.div>

                    {/* Accumulate at Interest */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <PiggyBank className="w-6 h-6 text-heritage-primary" />
                        <h4 className="font-bold text-gray-900">Accumulate</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-xs">Account Value</p>
                          <p className="text-xl font-bold text-heritage-accent">
                            ${Math.round(dividendOutcomes.accumulate.totalCashValueIncrease).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Access</p>
                          <p className="text-lg font-semibold text-gray-600">
                            Withdraw anytime
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Best for: Flexible savings</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Winner Highlight */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-heritage-accent/10 border border-heritage-accent/30 rounded-xl p-6 text-center"
                  >
                    <p className="text-heritage-primary font-medium mb-2">For Maximum Long-Term Value</p>
                    <p className="text-2xl font-bold text-heritage-accent">
                      Paid-Up Additions adds ${Math.round(dividendOutcomes.pua.totalDeathBenefitIncrease + dividendOutcomes.pua.totalCashValueIncrease - dividendOutcomes.cash.cashReceived).toLocaleString()} more value than taking cash
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Over {yearsHeld} years, PUAs create compounding growth that significantly outpaces other options.
                    </p>
                  </motion.div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    *Projections assume 3% annual dividend growth and 4.5% cash value growth. Actual results vary.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
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
              Common questions about dividends.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
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
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Earn Dividends on Your Policy
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              See how a participating whole life policy can work for you. Get a personalized illustration.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-heritage-dark transition-colors"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 border-2 border-heritage-primary text-heritage-primary px-8 py-4 rounded-lg font-semibold hover:bg-heritage-primary/5 transition-colors"
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
