import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
  Star,
  Clock,
  Calendar,
  AlertTriangle,
  Heart,
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
  FileText,
  Users,
  Briefcase,
  PiggyBank,
  XCircle,
  HelpCircle
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

export default function Conversion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [termAge, setTermAge] = useState(35);
  const [currentAge, setCurrentAge] = useState(45);
  const [healthStatus, setHealthStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  const trustStats = [
    { value: "10-15yr", label: "Typical Conversion Window" },
    { value: "No Exam", label: "Required to Convert" },
    { value: "100%", label: "Coverage Maintained" },
    { value: "65-70", label: "Max Conversion Age" }
  ];

  const bigStats = [
    { value: "No Exam", label: "Medical Underwriting", sublabel: "Convert without health review" },
    { value: "Original", label: "Health Class Kept", sublabel: "Even if health has changed" },
    { value: "Lifetime", label: "Coverage Duration", sublabel: "Permanent protection" }
  ];

  const conversionBenefits = [
    {
      icon: Shield,
      title: "No Medical Underwriting",
      description: "Convert to permanent insurance without a medical exam, health questionnaire, or blood tests - regardless of your current health status."
    },
    {
      icon: Lock,
      title: "Lock In Your Health Class",
      description: "Keep your original health rating from when you first applied. If you were 'Preferred' then, you're 'Preferred' now - even if your health has declined."
    },
    {
      icon: Heart,
      title: "Guaranteed Acceptance",
      description: "You cannot be denied conversion. Even if you've developed cancer, heart disease, or other conditions, you have the right to convert."
    },
    {
      icon: PiggyBank,
      title: "Build Cash Value",
      description: "Permanent policies accumulate cash value that grows tax-deferred. Access it through loans or withdrawals for retirement, emergencies, or opportunities."
    },
    {
      icon: TrendingUp,
      title: "Lifetime Protection",
      description: "Unlike term that expires, permanent coverage lasts your entire life. Your death benefit is guaranteed as long as premiums are paid."
    },
    {
      icon: Users,
      title: "Estate Planning Benefits",
      description: "Permanent life insurance provides tax-free death benefits for estate planning, wealth transfer, and legacy goals."
    }
  ];

  const conversionTimeline = [
    {
      period: "Years 1-5",
      status: "Conversion Window Open",
      color: "green",
      description: "Most flexibility. All conversion options available. This is generally the best time to convert if you're considering it.",
      recommendation: "Consider converting if health has changed significantly"
    },
    {
      period: "Years 6-10",
      status: "Window Still Open",
      color: "green",
      description: "Still have full conversion rights in most policies. Options may begin to narrow depending on your carrier.",
      recommendation: "Review your policy terms - some limit conversion after year 10"
    },
    {
      period: "Years 11-15",
      status: "Check Your Policy",
      color: "yellow",
      description: "Many policies restrict or end conversion privileges during this period. Critical to verify your specific deadline.",
      recommendation: "Contact your insurer to confirm exact conversion deadline"
    },
    {
      period: "After Deadline",
      status: "Window Closed",
      color: "red",
      description: "Once your conversion window closes, you lose this privilege forever. You'd need to apply for new coverage with full underwriting.",
      recommendation: "If you need permanent coverage, you must apply and re-qualify"
    }
  ];

  const whenToConvert = [
    {
      icon: Heart,
      title: "Your Health Has Declined",
      description: "Diagnosed with a serious condition? Converting locks in your original health class. Without conversion, you might be uninsurable or face very high rates.",
      urgency: "High Priority",
      example: "Diagnosed with diabetes, cancer, or heart condition after your term policy began"
    },
    {
      icon: Clock,
      title: "Approaching Conversion Deadline",
      description: "Don't let your conversion window close without a conscious decision. Even if unsure, converting preserves your options.",
      urgency: "Time Sensitive",
      example: "Your 20-year policy allows conversion only in the first 10 years, and year 9 is ending"
    },
    {
      icon: Users,
      title: "Need Permanent Coverage",
      description: "Realized you need lifetime protection for estate planning, special needs dependents, or charitable giving.",
      urgency: "Strategic",
      example: "Child with special needs who will require lifelong financial support"
    },
    {
      icon: Briefcase,
      title: "Business Succession Planning",
      description: "Business owners often need permanent coverage for buy-sell agreements, key person insurance, or executive benefits.",
      urgency: "Strategic",
      example: "Partner buy-sell agreement funded by life insurance"
    },
    {
      icon: PiggyBank,
      title: "Want Cash Value Accumulation",
      description: "Building a tax-advantaged cash reserve for retirement supplementation or emergency fund.",
      urgency: "Long-term Planning",
      example: "Maxing out 401(k) and looking for additional tax-advantaged savings"
    },
    {
      icon: DollarSign,
      title: "Can Afford Higher Premiums",
      description: "Income has increased and you can now afford permanent insurance premiums that were previously out of reach.",
      urgency: "Opportunistic",
      example: "Career advancement means the 5-10x premium increase is now manageable"
    }
  ];

  const conversionOptions = [
    {
      type: "Whole Life Insurance",
      description: "Fixed premiums, guaranteed cash value growth, potential dividends. The most straightforward permanent option.",
      premiumChange: "5-10x higher than term",
      cashValue: "Guaranteed growth",
      bestFor: "Conservative savers wanting guarantees",
      pros: ["Guaranteed cash value", "Level premiums for life", "Dividend potential"],
      cons: ["Highest premiums", "Slower cash value growth initially"]
    },
    {
      type: "Universal Life (UL)",
      description: "Flexible premiums and death benefits. Cash value earns interest based on current rates.",
      premiumChange: "4-8x higher than term",
      cashValue: "Interest-based growth",
      bestFor: "Those wanting flexibility in premiums",
      pros: ["Premium flexibility", "Adjustable death benefit", "Lower initial cost"],
      cons: ["Interest rate risk", "Requires monitoring", "Can lapse if underfunded"]
    },
    {
      type: "Indexed Universal Life (IUL)",
      description: "Cash value linked to market indexes like S&P 500, with downside protection.",
      premiumChange: "4-8x higher than term",
      cashValue: "Index-linked with floor protection",
      bestFor: "Growth-oriented with some risk tolerance",
      pros: ["Growth potential", "Downside protection", "Tax-free loans"],
      cons: ["Caps limit upside", "Complex", "Requires higher premiums for best results"]
    }
  ];

  const partialConversion = {
    description: "You don't have to convert your entire policy. Many people convert a portion to permanent coverage while keeping some term protection.",
    example: {
      original: "$500,000 Term Policy",
      converted: "$100,000 Whole Life",
      remaining: "$400,000 Term (continues to original expiration)",
      strategy: "Permanent coverage for final expenses and estate, term for income replacement"
    },
    benefits: [
      "More affordable than full conversion",
      "Keeps term protection for temporary needs",
      "Permanent coverage for lifetime goals",
      "Flexibility to convert more later (if within deadline)"
    ]
  };

  const faqs = [
    {
      question: "How do I find my conversion deadline?",
      answer: "Check your original policy contract - look for sections titled 'Conversion Privilege' or 'Conversion Option.' It will specify either a number of years (e.g., 'convertible during the first 10 policy years') or an age limit (e.g., 'convertible before age 70'). If you can't find it, call your insurance company's policy services number. Don't wait until you think you need it - know your deadline now."
    },
    {
      question: "Will my premium increase if I convert?",
      answer: "Yes, significantly. Permanent life insurance costs 5-10 times more than term for the same death benefit because it lasts your entire life and builds cash value. However, your premium will be based on your current age, not your health. Someone converting at 50 with cancer pays the same as a healthy 50-year-old with the same original policy - that's the value of conversion."
    },
    {
      question: "Can I convert to any permanent policy I want?",
      answer: "Not necessarily. Most carriers limit conversion to their own permanent products, and often only specific policies within their portfolio. Some may exclude certain products like IUL. Check with your carrier about which permanent policies are available for conversion. The options are still typically broad enough to find a suitable fit."
    },
    {
      question: "What happens if I miss my conversion deadline?",
      answer: "You permanently lose the ability to convert without medical underwriting. If you still need permanent coverage, you'll have to apply for a new policy and qualify based on your current health. For someone whose health has declined, this could mean denial, exclusions, or very high premiums. The conversion option is valuable precisely because it's time-limited."
    },
    {
      question: "Should I convert if I'm healthy?",
      answer: "If you're healthy and need permanent coverage, you might get better rates applying for a new policy with full underwriting rather than converting. Conversion is most valuable when your health has declined. However, converting eliminates application risk and guarantees coverage. Some healthy people convert simply for the certainty."
    },
    {
      question: "Can I convert just part of my policy?",
      answer: "Yes! Partial conversion is common and often the smart choice. You might convert $100,000 to whole life for permanent needs while keeping $400,000 in term for temporary income replacement. This makes conversion more affordable while securing lifetime coverage for specific goals."
    }
  ];

  const getHealthRecommendation = () => {
    if (healthStatus === 'excellent') {
      return {
        recommendation: "You have options - converting or applying new may both work",
        detail: "With excellent health, you might qualify for great rates on a new policy. However, converting eliminates application risk and guarantees coverage.",
        color: "green"
      };
    } else if (healthStatus === 'good') {
      return {
        recommendation: "Consider converting if within your window",
        detail: "Good health may still qualify for new coverage, but conversion provides certainty. Health can change unexpectedly.",
        color: "blue"
      };
    } else if (healthStatus === 'fair') {
      return {
        recommendation: "Conversion likely your best option",
        detail: "With health challenges, a new policy may come with higher rates, exclusions, or denial. Conversion locks in your original health class.",
        color: "orange"
      };
    } else {
      return {
        recommendation: "Convert immediately if possible",
        detail: "With serious health issues, conversion may be your only path to permanent coverage. Don't wait - convert while you still can.",
        color: "red"
      };
    }
  };

  const healthRec = getHealthRecommendation();

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
                Term Life Conversion
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Convert Your Term.
                <span className="text-heritage-accent"> Keep Your Health Class.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Your term policy may include the most valuable benefit you didn't know you had:
                the right to convert to permanent coverage without a medical exam - even if your health has changed.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Check Conversion Options <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak to an Advisor
                </a>
              </motion.div>
            </motion.div>

            {/* Conversion Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-accent/20 rounded-xl">
                    <RefreshCw className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Should You Convert?</h3>
                    <p className="text-gray-500">Quick assessment tool</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age When You Got Term Policy: <span className="text-heritage-primary font-bold">{termAge}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="55"
                      value={termAge}
                      onChange={(e) => setTermAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Current Age: <span className="text-heritage-primary font-bold">{currentAge}</span>
                    </label>
                    <input
                      type="range"
                      min={termAge}
                      max="70"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
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
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
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

                <div className="mt-4 p-3 bg-[#f5f0e8] rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Policy Age: {currentAge - termAge} years</span> -
                    Check your policy for conversion deadline
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

      {/* What is Conversion */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What is the Conversion Privilege?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                The conversion privilege is a contractual right included in most term life policies that allows you
                to convert some or all of your term coverage to permanent life insurance without providing evidence
                of insurability (no medical exam, no health questions).
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                This means even if you've developed serious health conditions since purchasing your term policy,
                you can still obtain permanent coverage at standard rates based on your current age. The insurer
                must accept you - it's your contractual right.
              </motion.p>

              <motion.div variants={fadeInUp} className="p-6 bg-heritage-primary/10 rounded-2xl border border-heritage-primary/20">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-heritage-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Critical Warning</h4>
                    <p className="text-gray-600">
                      Conversion privileges have strict deadlines. Once your window closes, you lose this right forever.
                      Many people don't realize they had this option until it's too late. <span className="font-semibold">Check your deadline today.</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-[400px] bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <RefreshCw className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Conversion Process Illustration</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conversion Benefits */}
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
              Why Conversion is So Valuable
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              The conversion privilege can be worth hundreds of thousands of dollars if your health changes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {conversionBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-[#e8e0d5]"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-xl w-fit mb-6">
                  <benefit.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Conversion Timeline */}
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
              Conversion Timeline: Don't Miss Your Window
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Most policies allow conversion for a limited time. Know where you stand.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {conversionTimeline.map((period, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <div className={`w-full h-2 rounded-full mb-4 ${
                  period.color === 'green' ? 'bg-green-500' :
                  period.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{period.period}</h3>
                <p className={`text-sm font-semibold mb-3 ${
                  period.color === 'green' ? 'text-green-600' :
                  period.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{period.status}</p>
                <p className="text-gray-600 text-sm mb-4">{period.description}</p>
                <div className="p-3 bg-[#f5f0e8] rounded-lg">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Action:</span> {period.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* When to Convert */}
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
              When Should You Convert?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conversion makes sense in specific situations. Here are the most common triggers.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {whenToConvert.map((scenario, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-heritage-primary/10 rounded-xl">
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
                <p className="text-gray-600 text-sm mb-4">{scenario.description}</p>
                <div className="p-3 bg-[#f5f0e8] rounded-lg">
                  <p className="text-sm text-gray-500"><span className="font-semibold">Example:</span> {scenario.example}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Conversion Options */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Can You Convert To?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Most carriers offer multiple permanent policy options for conversion.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {conversionOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-all"
              >
                <h3 className="text-xl font-bold text-heritage-primary mb-4">{option.type}</h3>
                <p className="text-gray-600 mb-6">{option.description}</p>

                <div className="space-y-3 mb-6">
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
                    <span className="font-semibold text-gray-900">{option.bestFor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-green-600">Pros:</p>
                  <ul className="space-y-1">
                    {option.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partial Conversion */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Partial Conversion: The Smart Middle Ground
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                {partialConversion.description}
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {partialConversion.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
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
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#e8e0d5]">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Example: Partial Conversion</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#f5f0e8] rounded-xl">
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
                    <div className="p-4 bg-[#f5f0e8] rounded-xl">
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

      {/* Big Stats Section */}
      <section className="py-20 bg-white">
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
                className="bg-[#fffaf3] rounded-2xl p-8 text-center shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-shadow"
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
      <section className="py-20 bg-[#f5f0e8]">
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
              "Two years after getting my term policy, I was diagnosed with MS. I thought I'd never be able
              to get permanent coverage. My Heritage advisor reminded me about my conversion option - I converted
              $200,000 to whole life at my original health rating. That policy is now worth everything to my family."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">LP</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Linda P.</p>
                <p className="text-gray-500">Teacher, Austin TX</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
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
              Get answers to common questions about converting term life insurance.
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
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e8e0d5]"
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
              Don't Let Your Conversion Window Close
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Find out your conversion deadline and explore your options. Our advisors can review your
              policy and help you decide if conversion is right for you.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Check My Options <ArrowRight className="w-5 h-5" />
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
