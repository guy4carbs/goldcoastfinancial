import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  RefreshCw,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  Heart,
  DollarSign,
  TrendingUp,
  Lock,
  Users,
  Briefcase,
  PiggyBank,
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

export default function Conversion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [termAge, setTermAge] = useState(35);
  const [currentAge, setCurrentAge] = useState(45);
  const [healthStatus, setHealthStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Conversion Calculator State
  const [termCoverage, setTermCoverage] = useState(500000);
  const [convertAmount, setConvertAmount] = useState(100000);
  const [conversionAge, setConversionAge] = useState(45);
  const [policyType, setPolicyType] = useState<'whole' | 'ul' | 'iul'>('whole');
  const [showConversionResult, setShowConversionResult] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    monthlyPremium: number;
    annualPremium: number;
    cashValueYear10: number;
    cashValueYear20: number;
    remainingTerm: number;
    recommendation: string;
  } | null>(null);

  // Calculate conversion estimates
  const calculateConversion = () => {
    // Base premium rates per $1000 of coverage (simplified)
    const baseRates: { [key: string]: number } = {
      whole: 12,
      ul: 9,
      iul: 10
    };

    // Age factor
    const ageFactor = 1 + ((conversionAge - 30) * 0.045);

    // Calculate monthly premium
    const monthlyPremium = Math.round((convertAmount / 1000) * baseRates[policyType] * ageFactor);
    const annualPremium = monthlyPremium * 12;

    // Estimate cash value growth (simplified)
    const growthRates: { [key: string]: number } = {
      whole: 0.03,
      ul: 0.035,
      iul: 0.045
    };

    // Cash value after premiums (rough estimate)
    const totalPremiums10 = annualPremium * 10;
    const totalPremiums20 = annualPremium * 20;
    const cashValueYear10 = Math.round(totalPremiums10 * 0.65 * Math.pow(1 + growthRates[policyType], 10));
    const cashValueYear20 = Math.round(totalPremiums20 * 0.70 * Math.pow(1 + growthRates[policyType], 20));

    // Remaining term
    const remainingTerm = termCoverage - convertAmount;

    // Recommendation
    let recommendation = "";
    if (healthStatus === 'poor' || healthStatus === 'fair') {
      recommendation = "With your current health status, conversion is strongly recommended to lock in coverage without medical underwriting.";
    } else if (conversionAge > 55) {
      recommendation = "Given your age, converting now ensures you have permanent coverage before premiums increase further.";
    } else {
      recommendation = "Partial conversion gives you flexibility - permanent coverage for life plus term for temporary needs.";
    }

    setConversionResult({
      monthlyPremium,
      annualPremium,
      cashValueYear10,
      cashValueYear20,
      remainingTerm,
      recommendation
    });
    setShowConversionResult(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const trustStats = [
    { value: "10-15yr", label: "Typical Conversion Window" },
    { value: "No Exam", label: "Required to Convert" },
    { value: "100%", label: "Coverage Maintained" },
    { value: "65-70", label: "Max Conversion Age" }
  ];

  const conversionBenefits = [
    {
      icon: Shield,
      title: "No Medical Underwriting",
      description: "Convert without an exam, health questions, or blood tests."
    },
    {
      icon: Lock,
      title: "Lock In Your Health Class",
      description: "Keep your original health rating even if health declined."
    },
    {
      icon: Heart,
      title: "Guaranteed Acceptance",
      description: "Cannot be denied. Conversion is your contractual right."
    },
    {
      icon: PiggyBank,
      title: "Build Cash Value",
      description: "Permanent policies grow cash value tax-deferred."
    },
    {
      icon: TrendingUp,
      title: "Lifetime Protection",
      description: "Unlike term, permanent coverage never expires."
    },
    {
      icon: Users,
      title: "Estate Planning Benefits",
      description: "Tax-free death benefits for wealth transfer."
    }
  ];

  const conversionTimeline = [
    {
      period: "Years 1-5",
      status: "Conversion Window Open",
      color: "green",
      description: "Most flexibility. All options available.",
      recommendation: "Convert if health has changed significantly"
    },
    {
      period: "Years 6-10",
      status: "Window Still Open",
      color: "green",
      description: "Full conversion rights in most policies.",
      recommendation: "Review your policy terms"
    },
    {
      period: "Years 11-15",
      status: "Check Your Policy",
      color: "yellow",
      description: "Many policies restrict conversion here.",
      recommendation: "Contact insurer to confirm deadline"
    },
    {
      period: "After Deadline",
      status: "Window Closed",
      color: "red",
      description: "This privilege is gone forever.",
      recommendation: "Must apply and re-qualify"
    }
  ];

  const whenToConvert = [
    {
      icon: Heart,
      title: "Your Health Has Declined",
      description: "Converting locks in your original health class.",
      urgency: "High Priority"
    },
    {
      icon: Clock,
      title: "Approaching Deadline",
      description: "Don't let your window close without deciding.",
      urgency: "Time Sensitive"
    },
    {
      icon: Users,
      title: "Need Permanent Coverage",
      description: "For estate planning or special needs dependents.",
      urgency: "Strategic"
    },
    {
      icon: Briefcase,
      title: "Business Succession",
      description: "For buy-sell agreements or key person insurance.",
      urgency: "Strategic"
    },
    {
      icon: PiggyBank,
      title: "Want Cash Value",
      description: "Building tax-advantaged cash for retirement.",
      urgency: "Long-term Planning"
    },
    {
      icon: DollarSign,
      title: "Can Afford Higher Premiums",
      description: "Income increased—can now afford permanent.",
      urgency: "Opportunistic"
    }
  ];

  const conversionOptions = [
    {
      type: "Whole Life Insurance",
      description: "Fixed premiums, guaranteed growth, potential dividends.",
      premiumChange: "5-10x higher than term",
      cashValue: "Guaranteed growth",
      bestFor: "Conservative savers wanting guarantees"
    },
    {
      type: "Universal Life (UL)",
      description: "Flexible premiums and death benefits.",
      premiumChange: "4-8x higher than term",
      cashValue: "Interest-based growth",
      bestFor: "Those wanting premium flexibility"
    },
    {
      type: "Indexed Universal Life (IUL)",
      description: "Cash value linked to market indexes with protection.",
      premiumChange: "4-8x higher than term",
      cashValue: "Index-linked with floor",
      bestFor: "Growth-oriented with some risk tolerance"
    }
  ];

  const partialConversion = {
    description: "You don't have to convert it all. Many convert a portion while keeping some term.",
    example: {
      original: "$500,000 Term Policy",
      converted: "$100,000 Whole Life",
      remaining: "$400,000 Term",
      strategy: "Permanent for final expenses, term for income replacement"
    }
  };

  const faqs = [
    {
      question: "How do I find my conversion deadline?",
      answer: "Check your policy for 'Conversion Privilege' or 'Conversion Option.' It specifies years or age limit. Can't find it? Call your insurer. Know your deadline now."
    },
    {
      question: "Will my premium increase if I convert?",
      answer: "Yes, significantly—5-10x more than term. But premium is based on your age, not health. Someone converting at 50 with cancer pays the same as a healthy 50-year-old."
    },
    {
      question: "Can I convert to any permanent policy?",
      answer: "Not always. Most carriers limit conversion to their own products. Some exclude IUL. Check which options are available with your carrier."
    },
    {
      question: "What happens if I miss my deadline?",
      answer: "You lose the ability to convert without medical underwriting forever. Must apply for new coverage based on current health."
    },
    {
      question: "Should I convert if I'm healthy?",
      answer: "If healthy, applying fresh might get better rates. Conversion is most valuable when health has declined. But converting eliminates risk."
    },
    {
      question: "Can I convert just part of my policy?",
      answer: "Yes! Partial conversion is common. Convert $100K to whole life while keeping $400K term. More affordable while securing lifetime coverage."
    }
  ];

  const getHealthRecommendation = () => {
    if (healthStatus === 'excellent') {
      return {
        recommendation: "You have options - converting or applying new may both work",
        detail: "With excellent health, you might qualify for great rates on a new policy. However, converting eliminates application risk.",
        color: "green"
      };
    } else if (healthStatus === 'good') {
      return {
        recommendation: "Consider converting if within your window",
        detail: "Good health may still qualify for new coverage, but conversion provides certainty.",
        color: "blue"
      };
    } else if (healthStatus === 'fair') {
      return {
        recommendation: "Conversion likely your best option",
        detail: "With health challenges, a new policy may have higher rates or exclusions. Conversion locks in your original class.",
        color: "orange"
      };
    } else {
      return {
        recommendation: "Convert immediately if possible",
        detail: "With serious health issues, conversion may be your only path to permanent coverage.",
        color: "red"
      };
    }
  };

  const healthRec = getHealthRecommendation();

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
                <RefreshCw className="w-4 h-4" />
                Term Life Conversion
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Convert Your Term.
                <span className="block text-heritage-accent">Keep Your Health Class.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your term policy may include a hidden gem: the right to convert to permanent coverage without an exam—even if your health changed.
              </p>

              <div className="space-y-3 mb-8">
                {["No medical exam required", "Original health class preserved", "Guaranteed acceptance"].map((item, i) => (
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
                    Check Conversion Options
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

            {/* Conversion Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Should You Convert?</h3>
                <p className="text-gray-600 text-sm">Quick assessment tool</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age When You Got Term: <span className="text-heritage-accent font-bold">{termAge}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="55"
                    value={termAge}
                    onChange={(e) => setTermAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>55</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Current Age: <span className="text-heritage-accent font-bold">{currentAge}</span>
                  </label>
                  <input
                    type="range"
                    min={termAge}
                    max="70"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{termAge}</span>
                    <span>70</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Health Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['excellent', 'good', 'fair', 'poor'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setHealthStatus(status)}
                        className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          healthStatus === status
                            ? 'bg-heritage-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border-2 ${
                  healthRec.color === 'green' ? 'bg-green-50 border-green-200' :
                  healthRec.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                  healthRec.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <p className={`font-semibold mb-1 ${
                    healthRec.color === 'green' ? 'text-green-700' :
                    healthRec.color === 'blue' ? 'text-blue-700' :
                    healthRec.color === 'orange' ? 'text-orange-700' :
                    'text-red-700'
                  }`}>
                    {healthRec.recommendation}
                  </p>
                  <p className="text-sm text-gray-600">{healthRec.detail}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Policy Age: {currentAge - termAge} years</span> - Check your policy for conversion deadline
                  </p>
                </div>
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

      {/* Interactive Conversion Calculator */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Conversion Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how converting your term policy to permanent coverage would look with estimated premiums and cash value projections.
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
                    Current Term Coverage: <span className="text-heritage-accent font-bold">{formatCurrency(termCoverage)}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={termCoverage}
                    onChange={(e) => { setTermCoverage(Number(e.target.value)); setShowConversionResult(false); setConvertAmount(Math.min(convertAmount, Number(e.target.value))); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Convert: <span className="text-heritage-accent font-bold">{formatCurrency(convertAmount)}</span>
                  </label>
                  <input
                    type="range"
                    min="25000"
                    max={termCoverage}
                    step="25000"
                    value={convertAmount}
                    onChange={(e) => { setConvertAmount(Number(e.target.value)); setShowConversionResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining term: {formatCurrency(termCoverage - convertAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age at Conversion: <span className="text-heritage-accent font-bold">{conversionAge}</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="65"
                    value={conversionAge}
                    onChange={(e) => { setConversionAge(Number(e.target.value)); setShowConversionResult(false); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Convert To:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'whole', label: 'Whole Life' },
                      { id: 'ul', label: 'Universal' },
                      { id: 'iul', label: 'IUL' }
                    ].map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => { setPolicyType(type.id as 'whole' | 'ul' | 'iul'); setShowConversionResult(false); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          policyType === type.id
                            ? 'bg-heritage-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateConversion}
                className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Calculate Conversion
              </motion.button>

              {/* Animated Conversion Result */}
              <AnimatePresence>
                {showConversionResult && conversionResult && (
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
                        <p className="text-white/80 text-sm mb-1">Estimated Monthly Premium</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-5xl font-bold text-heritage-accent"
                        >
                          ${conversionResult.monthlyPremium}
                          <span className="text-xl">/mo</span>
                        </motion.p>
                        <p className="text-white/70 text-sm mt-1">
                          ${conversionResult.annualPremium.toLocaleString()}/year
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                      >
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Converting</p>
                          <p className="text-lg font-bold text-white">{formatCurrency(convertAmount)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Keeping as Term</p>
                          <p className="text-lg font-bold text-white">{formatCurrency(conversionResult.remainingTerm)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Cash Value (Year 10)</p>
                          <p className="text-lg font-bold text-heritage-accent">{formatCurrency(conversionResult.cashValueYear10)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Cash Value (Year 20)</p>
                          <p className="text-lg font-bold text-heritage-accent">{formatCurrency(conversionResult.cashValueYear20)}</p>
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
                          <p className="text-sm text-white/90">{conversionResult.recommendation}</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="grid grid-cols-3 gap-2 mb-4"
                      >
                        {[
                          { label: "No medical exam required", icon: Shield },
                          { label: "Original health class preserved", icon: Heart },
                          { label: "Guaranteed acceptance", icon: Lock }
                        ].map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + i * 0.1 }}
                            className="flex items-center gap-2 p-2 bg-white/10 rounded-lg"
                          >
                            <benefit.icon className="w-4 h-4 text-heritage-accent" />
                            <span className="text-xs text-white/80">{benefit.label}</span>
                          </motion.div>
                        ))}
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
                            className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-3 rounded-lg font-semibold"
                          >
                            Explore Conversion Options
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

      {/* What is Conversion */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                What is the Conversion Privilege?
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The conversion privilege lets you convert some or all of your term coverage to permanent insurance—no exam, no health questions.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Even with serious health conditions, you can get permanent coverage at standard rates based on your current age. The insurer must accept you—it's your contractual right.
              </p>

              <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Critical Warning</h4>
                    <p className="text-gray-600">
                      Strict deadlines apply. Once your window closes, this right is gone forever. <span className="font-semibold">Check your deadline today.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-[400px] bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <RefreshCw className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Conversion Process</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conversion Benefits */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Why Conversion is So Valuable
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Can be worth hundreds of thousands if your health changes.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {conversionBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-heritage-accent" />
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Conversion Timeline */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don't Miss Your Window
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Limited time to convert. Know where you stand.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {conversionTimeline.map((period, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-full h-2 rounded-full mb-4 ${
                  period.color === 'green' ? 'bg-green-500' :
                  period.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <h3 className="text-lg font-bold text-gray-900 mb-1">{period.period}</h3>
                <p className={`text-sm font-semibold mb-3 ${
                  period.color === 'green' ? 'text-green-600' :
                  period.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{period.status}</p>
                <p className="text-gray-600 text-sm mb-4">{period.description}</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Action:</span> {period.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* When to Convert */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              When Should You Convert?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Common triggers that make conversion the right move.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {whenToConvert.map((scenario, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center">
                    <scenario.icon className="w-6 h-6 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      scenario.urgency === 'High Priority' ? 'bg-red-100 text-red-700' :
                      scenario.urgency === 'Time Sensitive' ? 'bg-orange-100 text-orange-700' :
                      scenario.urgency === 'Strategic' ? 'bg-blue-100 text-blue-700' :
                      scenario.urgency === 'Long-term Planning' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{scenario.urgency}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{scenario.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Conversion Options */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              What Can You Convert To?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Multiple permanent policy options available.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {conversionOptions.map((option, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-heritage-primary mb-4">{option.type}</h3>
                <p className="text-gray-600 mb-6 text-sm">{option.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Premium Change</span>
                    <span className="font-semibold text-gray-900">{option.premiumChange}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cash Value</span>
                    <span className="font-semibold text-gray-900">{option.cashValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Best For</span>
                    <span className="font-semibold text-gray-900 text-right">{option.bestFor}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partial Conversion */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Partial Conversion: The Smart Middle Ground
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {partialConversion.description}
              </p>

              <div className="space-y-4">
                {["More affordable than full conversion", "Keep term for temporary needs", "Permanent for lifetime goals", "Can convert more later"].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Example: Partial Conversion</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Original Policy</p>
                    <p className="text-2xl font-bold text-gray-900">{partialConversion.example.original}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-heritage-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-heritage-primary/10 rounded-xl border border-heritage-primary/20">
                      <p className="text-sm text-gray-500">Converted to Permanent</p>
                      <p className="text-xl font-bold text-heritage-primary">{partialConversion.example.converted}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Remaining Term</p>
                      <p className="text-xl font-bold text-gray-900">{partialConversion.example.remaining}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-heritage-accent/10 rounded-xl">
                    <p className="text-sm text-gray-700"><span className="font-semibold">Strategy:</span> {partialConversion.example.strategy}</p>
                  </div>
                </div>
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
              "Two years after getting my term policy, I was diagnosed with MS. My Heritage advisor reminded me about conversion—I converted $200K to whole life at my original health rating. That policy is now worth everything to my family."
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
                <p className="text-white font-semibold">Linda P.</p>
                <p className="text-white/70 text-sm">Teacher, Austin TX</p>
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
              Don't Let Your Window Close
            </h2>
            <p className="text-gray-600 mb-8">
              Find your deadline and explore options. We'll help you decide if conversion is right for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Check My Options
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
                  Speak to an Advisor
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
