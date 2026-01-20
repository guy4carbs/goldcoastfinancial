import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Star,
  Home,
  GraduationCap,
  Baby,
  Briefcase,
  Heart,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Layers,
  AlertCircle,
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

export default function TermLengths() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(20);
  const [age, setAge] = useState(35);

  // Term Recommendation Tool State
  const [recAge, setRecAge] = useState(35);
  const [recCoverage, setRecCoverage] = useState(500000);
  const [mortgageYears, setMortgageYears] = useState(25);
  const [youngestChildAge, setYoungestChildAge] = useState(5);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    primaryTerm: number;
    alternativeTerm: number;
    reason: string;
    coverageEndAge: number;
    monthlyEstimate: number;
  } | null>(null);

  // Sample monthly rates by term length (for $500K coverage)
  const getRateByTerm = (termYears: number) => {
    const baseRates: { [key: number]: number } = {
      10: 22,
      15: 26,
      20: 32,
      25: 42,
      30: 52
    };
    const ageMultiplier = 1 + ((age - 30) * 0.04);
    return Math.round(baseRates[termYears] * ageMultiplier);
  };

  // Calculate term recommendation
  const calculateRecommendation = () => {
    const yearsUntilChildIndependent = Math.max(0, 25 - youngestChildAge);
    const yearsUntilMortgagePaid = mortgageYears;
    const yearsUntilRetirement = Math.max(0, 65 - recAge);

    // Determine minimum coverage period needed
    const minYearsNeeded = Math.max(yearsUntilChildIndependent, yearsUntilMortgagePaid);

    // Determine recommended term
    let primaryTerm: number;
    let alternativeTerm: number;
    let reason: string;

    if (minYearsNeeded <= 10) {
      primaryTerm = 10;
      alternativeTerm = 15;
      reason = "Your children will be independent and mortgage paid off soon.";
    } else if (minYearsNeeded <= 15) {
      primaryTerm = 15;
      alternativeTerm = 20;
      reason = "A 15-year term covers your major obligations with some buffer.";
    } else if (minYearsNeeded <= 20) {
      primaryTerm = 20;
      alternativeTerm = 25;
      reason = "The most popular choice - covers mortgage and kids through college.";
    } else if (minYearsNeeded <= 25) {
      primaryTerm = 25;
      alternativeTerm = 30;
      reason = "Extended coverage for your longer-term obligations.";
    } else {
      primaryTerm = 30;
      alternativeTerm = 30;
      reason = "Maximum protection for your family's long-term needs.";
    }

    // Check if age allows the recommended term
    if (recAge + primaryTerm > 80) {
      primaryTerm = Math.min(primaryTerm, 80 - recAge);
      primaryTerm = Math.max(10, Math.floor(primaryTerm / 5) * 5);
      reason = `Based on age restrictions, a ${primaryTerm}-year term is your best option.`;
    }

    // Calculate estimated monthly premium
    const baseRate = 0.12;
    const ageMultiplier = 1 + ((recAge - 25) * 0.035);
    const termMultiplier = 1 + ((primaryTerm - 10) * 0.025);
    const monthlyEstimate = Math.round((recCoverage / 1000) * baseRate * ageMultiplier * termMultiplier);

    setRecommendation({
      primaryTerm,
      alternativeTerm,
      reason,
      coverageEndAge: recAge + primaryTerm,
      monthlyEstimate
    });
    setShowRecommendation(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const trustStats = [
    { value: "20yr", label: "Most Popular Term" },
    { value: "30yr", label: "Best for Young Families" },
    { value: "40%", label: "Cost Savings (10yr vs 30yr)" },
    { value: "65", label: "Max Issue Age (Most Carriers)" }
  ];

  const termOptions = [
    {
      years: 10,
      icon: Briefcase,
      title: "10-Year Term",
      tagline: "Short-Term Protection",
      monthlyRate: "$22",
      bestFor: "Near retirement, short-term debt, business loans",
      coverage: "Bridge to retirement or pay off specific debts",
      pros: [
        "Lowest premiums",
        "Great for short-term needs",
        "Often convertible",
        "Good supplemental coverage"
      ],
      cons: [
        "May need to reapply at expiration",
        "Higher rates if renewed later",
        "Limited long-term protection"
      ],
      idealAge: "50-65",
      scenarios: [
        "10 years from retirement",
        "Business loan payoff",
        "Kids graduating college soon",
        "Supplementing employer coverage"
      ]
    },
    {
      years: 15,
      icon: GraduationCap,
      title: "15-Year Term",
      tagline: "Teen to Independence",
      monthlyRate: "$26",
      bestFor: "Teens heading to college, 15-year mortgage",
      coverage: "Kids through college and early adulthood",
      pros: [
        "Lower cost than 20-year",
        "Matches 15-year mortgages",
        "Good cost/coverage balance",
        "Kids protected through college"
      ],
      cons: [
        "May fall short if kids delay",
        "Less common option",
        "Limited flexibility"
      ],
      idealAge: "40-55",
      scenarios: [
        "Kids ages 8-12",
        "15-year mortgage refinance",
        "Mid-career, growing savings",
        "Spouse can work but needs bridge"
      ]
    },
    {
      years: 20,
      icon: Home,
      title: "20-Year Term",
      tagline: "The Sweet Spot",
      monthlyRate: "$32",
      bestFor: "Young families, new homeowners",
      coverage: "Mortgage payoff, kids through college",
      pros: [
        "Most popular for a reason",
        "Covers typical mortgage",
        "Kids birth to adulthood",
        "Balanced cost and protection"
      ],
      cons: [
        "May need extension",
        "Slightly higher than 10 or 15yr"
      ],
      idealAge: "30-45",
      scenarios: [
        "New baby or young children",
        "Just purchased a home",
        "Single-income family",
        "Building retirement savings"
      ]
    },
    {
      years: 25,
      icon: Users,
      title: "25-Year Term",
      tagline: "Extended Security",
      monthlyRate: "$42",
      bestFor: "Growing families, longer mortgages",
      coverage: "Multiple children through adulthood",
      pros: [
        "5 extra years vs 20-year",
        "Kids protected into mid-20s",
        "Good for late starters",
        "Room for life changes"
      ],
      cons: [
        "Higher premiums",
        "Less common offering",
        "May be over-insuring"
      ],
      idealAge: "28-40",
      scenarios: [
        "Planning more children",
        "Kids may need grad school",
        "Longer mortgage timeline",
        "Want extra buffer"
      ]
    },
    {
      years: 30,
      icon: Baby,
      title: "30-Year Term",
      tagline: "Maximum Protection",
      monthlyRate: "$52",
      bestFor: "Young parents, 30-year mortgages",
      coverage: "Full mortgage, kids fully independent",
      pros: [
        "Longest protection",
        "Lock in young, healthy rates",
        "Covers 30-year mortgage",
        "Maximum peace of mind"
      ],
      cons: [
        "Highest premiums",
        "May outlive the need",
        "Age restrictions apply"
      ],
      idealAge: "25-40",
      scenarios: [
        "Newborn or planning kids",
        "30-year mortgage",
        "Single income family",
        "Lock in rates while young"
      ]
    }
  ];

  const comparisonData = [
    { feature: "Monthly Cost ($500K, age 35)", t10: "$22", t15: "$26", t20: "$32", t25: "$42", t30: "$52" },
    { feature: "Total Premiums Paid", t10: "$2,640", t15: "$4,680", t20: "$7,680", t25: "$12,600", t30: "$18,720" },
    { feature: "Cost Per Year of Coverage", t10: "$264", t15: "$312", t20: "$384", t25: "$504", t30: "$624" },
    { feature: "Best Starting Age", t10: "50-60", t15: "40-50", t20: "30-45", t25: "28-40", t30: "25-40" },
    { feature: "Typical Max Issue Age", t10: "75", t15: "70", t20: "65", t25: "60", t30: "50-55" },
    { feature: "Availability", t10: "All carriers", t15: "Most carriers", t20: "All carriers", t25: "Some carriers", t30: "Most carriers" }
  ];

  const ladderingStrategy = [
    {
      policy: "Policy 1",
      amount: "$500,000",
      term: "30 years",
      purpose: "Income replacement for young children",
      monthly: "$52"
    },
    {
      policy: "Policy 2",
      amount: "$300,000",
      term: "20 years",
      purpose: "Mortgage protection",
      monthly: "$19"
    },
    {
      policy: "Policy 3",
      amount: "$200,000",
      term: "10 years",
      purpose: "Business loan / car loans",
      monthly: "$9"
    }
  ];

  const faqs = [
    {
      question: "What's the most popular term length?",
      answer: "20-year term is most popular (~40% of purchases). It matches typical mortgages and covers kids through college. 30-year is second, especially for younger buyers locking in low rates."
    },
    {
      question: "Should I match my term to my mortgage?",
      answer: "Generally yes, but consider the full picture. Planning to pay off a 30-year mortgage in 20 years? A 20-year term might work. Young children? Prioritize covering them to independence, which may require a longer term."
    },
    {
      question: "Can I extend my term if I still need coverage when it expires?",
      answer: "Most policies allow annual renewal after expiration, but at much higher rates. Some offer conversion to permanent insurance without an exam. Best strategy: buy the right term upfront while young and healthy."
    },
    {
      question: "What is policy laddering and should I consider it?",
      answer: "Laddering means buying multiple policies with different lengths (e.g., 30yr for $500K + 20yr for $300K + 10yr for $200K). As shorter policies expire, coverage decreases with your actual needs. Saves money while ensuring protection."
    },
    {
      question: "I'm 45 - can I still get a 30-year term?",
      answer: "Depends on the carrier. Most cap 30-year terms at ages 45-50. At 45, 20-year terms are more available and cost-effective. Some carriers offer 30-year terms up to age 50."
    },
    {
      question: "Is it better to buy a longer term 'just in case'?",
      answer: "There's wisdom in going slightly longer—life takes turns. But don't over-insure. A 30-year term at 35 covers you to 65, which may be overkill if kids are grown and mortgage paid by 55. Balance protection with premium costs."
    }
  ];

  const decisionFactors = [
    {
      icon: Home,
      title: "Mortgage Length",
      description: "Match your term to your mortgage. 30-year mortgage? Consider a 30-year term."
    },
    {
      icon: Baby,
      title: "Children's Ages",
      description: "Cover until your youngest is independent. Kid is 5? A 20-year term covers them to 25."
    },
    {
      icon: Calendar,
      title: "Years to Retirement",
      description: "55 and retiring at 65? A 10-year term bridges to pension and Social Security."
    },
    {
      icon: DollarSign,
      title: "Budget Constraints",
      description: "Tight budget? A shorter term with adequate coverage beats a longer term with insufficient coverage."
    },
    {
      icon: TrendingUp,
      title: "Career Trajectory",
      description: "Expecting income growth? Get more coverage now while it's cheap, or add policies later."
    },
    {
      icon: Heart,
      title: "Spouse's Situation",
      description: "Can your spouse support the family eventually? You may need shorter coverage. If not, plan longer."
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Term Length Guide
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                10, 15, 20, 25, or 30 Years?
                <span className="block text-heritage-accent">Choose Wisely.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The right term protects your family when they need it—without overpaying.
              </p>

              <div className="space-y-3 mb-8">
                {["Most buyers choose 20 or 30 year terms", "Match coverage to your actual needs", "Lock in rates while young and healthy"].map((item, i) => (
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
                    Speak to an Advisor
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Interactive Term Comparison Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Term Comparison</h3>
                <p className="text-gray-600 text-sm">$500K coverage rates</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-heritage-accent font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="55"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>55</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Term Length</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[10, 15, 20, 25, 30].map((term) => (
                      <motion.button
                        key={term}
                        onClick={() => setSelectedTerm(term)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`py-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTerm === term
                            ? 'bg-heritage-primary text-white shadow-lg'
                            : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                        }`}
                      >
                        {term}yr
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {[10, 15, 20, 25, 30].map((term) => (
                    <div
                      key={term}
                      className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                        selectedTerm === term ? 'bg-heritage-primary/10 border-2 border-heritage-primary' : 'bg-[#f5f0e8]'
                      }`}
                    >
                      <span className={`font-medium ${selectedTerm === term ? 'text-heritage-primary' : 'text-gray-700'}`}>
                        {term}-Year Term
                      </span>
                      <span className={`font-bold text-lg ${selectedTerm === term ? 'text-heritage-primary' : 'text-gray-900'}`}>
                        ${getRateByTerm(term)}/mo
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-4 text-white text-center">
                  <p className="text-sm opacity-90">Coverage ends at age</p>
                  <p className="text-3xl font-bold">{age + selectedTerm}</p>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Exact Quote
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-heritage-accent">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Term Recommendation Tool */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Find Your Ideal Term Length
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Answer a few questions and we'll recommend the best term length for your situation.
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
                    Your Age: <span className="text-heritage-accent font-bold">{recAge}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="60"
                    value={recAge}
                    onChange={(e) => { setRecAge(Number(e.target.value)); setShowRecommendation(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>60</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-heritage-accent font-bold">{formatCurrency(recCoverage)}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={recCoverage}
                    onChange={(e) => { setRecCoverage(Number(e.target.value)); setShowRecommendation(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$100K</span>
                    <span>$2M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Left on Mortgage: <span className="text-heritage-accent font-bold">{mortgageYears} years</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={mortgageYears}
                    onChange={(e) => { setMortgageYears(Number(e.target.value)); setShowRecommendation(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (paid off)</span>
                    <span>30</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Youngest Child's Age: <span className="text-heritage-accent font-bold">{youngestChildAge === 0 ? 'No children' : `${youngestChildAge} years`}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={youngestChildAge}
                    onChange={(e) => { setYoungestChildAge(Number(e.target.value)); setShowRecommendation(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>None</span>
                    <span>25+</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateRecommendation}
                className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Get My Term Recommendation
              </motion.button>

              {/* Animated Recommendation Reveal */}
              <AnimatePresence>
                {showRecommendation && recommendation && (
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
                        <p className="text-white/80 text-sm mb-1">Recommended Term Length</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-6xl font-bold text-heritage-accent"
                        >
                          {recommendation.primaryTerm}
                          <span className="text-3xl ml-1">years</span>
                        </motion.p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4 mb-6"
                      >
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Coverage Ends At Age</p>
                          <p className="text-2xl font-bold text-white">{recommendation.coverageEndAge}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Est. Monthly Premium</p>
                          <p className="text-2xl font-bold text-white">${recommendation.monthlyEstimate}</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="p-4 bg-heritage-accent/20 rounded-lg border border-heritage-accent/30 mb-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-white/90">{recommendation.reason}</p>
                        </div>
                      </motion.div>

                      {recommendation.alternativeTerm !== recommendation.primaryTerm && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-center text-white/70 text-sm mb-4"
                        >
                          Alternative option: <span className="font-semibold text-white">{recommendation.alternativeTerm}-year term</span> for extra buffer
                        </motion.p>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                      >
                        <Link href="/quote">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-3 rounded-lg font-semibold"
                          >
                            Get Quote for {recommendation.primaryTerm}-Year Term
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

      {/* Term Options Deep Dive */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Every Term Length Explained
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each serves a specific purpose. Find the one that fits your life stage.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {termOptions.map((term, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Header */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center">
                        <term.icon className="w-7 h-7 text-heritage-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-heritage-primary">{term.title}</h3>
                        <p className="text-heritage-accent font-semibold text-sm">{term.tagline}</p>
                      </div>
                    </div>
                    <div className="bg-heritage-primary rounded-xl p-4 text-center mb-4">
                      <p className="text-white/80 text-sm">Starting at</p>
                      <p className="text-2xl font-bold text-white">{term.monthlyRate}<span className="text-sm">/mo</span></p>
                      <p className="text-heritage-accent text-xs">$500K coverage, age 35</p>
                    </div>
                    <p className="text-gray-600 text-sm">{term.coverage}</p>
                    <p className="mt-2 text-sm"><span className="font-semibold">Best ages:</span> {term.idealAge}</p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="lg:col-span-1">
                    <h4 className="font-bold text-heritage-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" /> Advantages
                    </h4>
                    <ul className="space-y-2 mb-6">
                      {term.pros.map((pro, i) => (
                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                    <h4 className="font-bold text-heritage-primary mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" /> Considerations
                    </h4>
                    <ul className="space-y-2">
                      {term.cons.map((con, i) => (
                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal Scenarios */}
                  <div className="lg:col-span-1">
                    <h4 className="font-bold text-heritage-primary mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-heritage-accent" /> Ideal Scenarios
                    </h4>
                    <ul className="space-y-2">
                      {term.scenarios.map((scenario, i) => (
                        <li key={i} className="p-3 bg-white rounded-lg text-sm text-gray-700 border border-gray-100">
                          {scenario}
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

      {/* Comparison Table */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Side-by-Side Comparison
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare all term lengths at a glance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200"
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">10-Year</th>
                  <th className="p-4 text-center font-semibold">15-Year</th>
                  <th className="p-4 text-center font-semibold bg-heritage-accent/20">20-Year</th>
                  <th className="p-4 text-center font-semibold">25-Year</th>
                  <th className="p-4 text-center font-semibold">30-Year</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-gray-700">{row.t10}</td>
                    <td className="p-4 text-center text-gray-700">{row.t15}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold bg-heritage-primary/5">{row.t20}</td>
                    <td className="p-4 text-center text-gray-700">{row.t25}</td>
                    <td className="p-4 text-center text-gray-700">{row.t30}</td>
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
            *Rates shown are illustrative for healthy non-smokers. Your actual rate may vary.
          </motion.p>
        </div>
      </section>

      {/* Decision Factors */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              How to Choose Your Term Length
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Six factors to find the right fit.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {decisionFactors.map((factor, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-heritage-accent/10 rounded-full flex items-center justify-center mb-4">
                  <factor.icon className="w-6 h-6 text-heritage-accent" />
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{factor.title}</h3>
                <p className="text-gray-600 text-sm">{factor.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Laddering Strategy */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-heritage-accent/10 rounded-full flex items-center justify-center">
                  <Layers className="w-6 h-6 text-heritage-accent" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary">
                  The Laddering Strategy
                </h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Smart buyers don't always choose just one policy. Laddering means multiple policies with different lengths—coverage decreases as needs decrease.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Saves money while ensuring you're never under-insured.
              </p>

              <div className="space-y-3">
                {[
                  "Match different policies to different obligations",
                  "Coverage decreases as debts are paid off",
                  "Lower total premiums than one large policy",
                  "Flexibility as your life changes"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-bold text-heritage-primary mb-6">Example Ladder ($1M Total Coverage)</h3>
              <div className="space-y-4">
                {ladderingStrategy.map((policy, index) => (
                  <div key={index} className="p-4 bg-[#fffaf3] rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-heritage-primary">{policy.policy}</span>
                      <span className="font-bold text-gray-900">{policy.monthly}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{policy.amount}</span>
                      <span>{policy.term}</span>
                    </div>
                    <p className="text-sm text-gray-500">{policy.purpose}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-heritage-primary/10 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Monthly Cost</span>
                  <span className="text-2xl font-bold text-heritage-primary">$80/mo</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  vs. ~$95/mo for a single $1M 30-year policy
                </p>
              </div>
            </motion.div>
          </div>
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
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "At 42, I was about to buy a 30-year term. My Heritage advisor suggested laddering instead. Better coverage, matches my actual needs, and I'm saving $35/month."
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
                <p className="text-white font-semibold">David M.</p>
                <p className="text-white/70 text-sm">Father of 3, Chicago IL</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
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
                  <span className="font-semibold text-heritage-primary pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-heritage-accent transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
              Ready to Choose Your Term?
            </h2>
            <p className="text-gray-600 mb-8">
              Get personalized quotes for any term length. We'll help you find the perfect fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Compare Term Lengths
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
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
