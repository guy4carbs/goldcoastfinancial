import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  DollarSign,
  ChevronDown,
  Star,
  Sparkles,
  PiggyBank,
  LineChart,
  Lock,
  Unlock,
  Target,
  BarChart3,
  AlertCircle,
  Gift,
  Briefcase,
  Calculator
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

export default function IUL() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'growth' | 'protection'>('growth');
  const [age, setAge] = useState(35);
  const [monthlyPremium, setMonthlyPremium] = useState(500);

  const calculateProjectedValue = (years: number) => {
    const annualPremium = monthlyPremium * 12;
    const avgReturn = 0.065; // 6.5% average after caps/floors
    const totalPremiums = annualPremium * years;
    const compoundedValue = totalPremiums * Math.pow(1 + avgReturn, years / 2);
    return Math.round(compoundedValue);
  };

  const trustStats = [
    { value: "150K+", label: "Policies Issued" },
    { value: "$8B+", label: "Cash Value Managed" },
    { value: "0%", label: "Floor Protection" },
    { value: "4.9/5", label: "Customer Rating" }
  ];

  const bigStats = [
    { value: "6.5%", label: "Average Annual Return", sublabel: "Historical indexed returns" },
    { value: "0%", label: "Loss Protection Floor", sublabel: "Never lose principal" },
    { value: "Tax-Free", label: "Policy Loans", sublabel: "Access your money tax-free" }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Market-Linked Growth",
      description: "Cash value growth tied to market indexes like the S&P 500, without direct market investment."
    },
    {
      icon: Shield,
      title: "Downside Protection",
      description: "A guaranteed floor (typically 0-1%) protects your cash value from market losses."
    },
    {
      icon: DollarSign,
      title: "Tax-Free Access",
      description: "Access your cash value through tax-free policy loans for any purpose."
    },
    {
      icon: Sparkles,
      title: "Flexible Premiums",
      description: "Adjust your premium payments based on your financial situation and goals."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Premium Payments",
      description: "You pay flexible premiums into your policy. A portion covers the cost of insurance, and the rest goes into your cash value account."
    },
    {
      step: 2,
      title: "Index Crediting",
      description: "Your cash value is credited interest based on the performance of a market index (like S&P 500), subject to caps and floors."
    },
    {
      step: 3,
      title: "Cash Value Growth",
      description: "Over time, your cash value grows tax-deferred. You're protected from losses but participate in market gains up to the cap."
    },
    {
      step: 4,
      title: "Access & Benefits",
      description: "Access cash value via tax-free loans for retirement, education, emergencies. Your beneficiaries receive a tax-free death benefit."
    }
  ];

  const capsAndFloors = {
    growth: [
      { scenario: "Strong Market Year (+25%)", yourGain: "+10% (capped)", note: "Cap limits upside" },
      { scenario: "Moderate Growth (+8%)", yourGain: "+8%", note: "Full participation" },
      { scenario: "Flat Market (0%)", yourGain: "0% (floor)", note: "Protected by floor" },
      { scenario: "Market Decline (-15%)", yourGain: "0% (floor)", note: "No losses!" }
    ],
    protection: [
      { year: "Year 5", premium: "$10,000/yr", cashValue: "$42,000", deathBenefit: "$500,000" },
      { year: "Year 10", premium: "$10,000/yr", cashValue: "$98,000", deathBenefit: "$500,000" },
      { year: "Year 20", premium: "$10,000/yr", cashValue: "$245,000", deathBenefit: "$500,000" },
      { year: "Year 30", premium: "$10,000/yr", cashValue: "$485,000", deathBenefit: "$500,000" }
    ]
  };

  const useCases = [
    {
      icon: Target,
      title: "Tax-Free Retirement Income",
      description: "Supplement your retirement with tax-free policy loans, avoiding the tax burden of 401(k) withdrawals."
    },
    {
      icon: Gift,
      title: "College Funding",
      description: "Build cash value to fund education expenses without affecting financial aid eligibility."
    },
    {
      icon: Briefcase,
      title: "Business Planning",
      description: "Use for key person insurance, buy-sell agreements, or executive bonus plans with living benefits."
    },
    {
      icon: PiggyBank,
      title: "Wealth Transfer",
      description: "Pass wealth to heirs tax-free while maintaining access to cash value during your lifetime."
    }
  ];

  const comparison = [
    { feature: "Death Benefit", iul: "Flexible", whole: "Fixed", term: "Fixed" },
    { feature: "Cash Value Growth", iul: "Market-linked (with caps/floors)", whole: "Fixed rate (2-4%)", term: "None" },
    { feature: "Downside Protection", iul: "Yes (0% floor)", whole: "Yes (guaranteed)", term: "N/A" },
    { feature: "Premium Flexibility", iul: "Very flexible", whole: "Fixed", term: "Fixed" },
    { feature: "Tax-Free Loans", iul: "Yes", whole: "Yes", term: "No" },
    { feature: "Upside Potential", iul: "Moderate (capped)", whole: "Low", term: "None" },
    { feature: "Complexity", iul: "Higher", whole: "Moderate", term: "Low" },
    { feature: "Best For", iul: "Growth-focused savers", whole: "Conservative planners", term: "Pure protection" }
  ];

  const faqs = [
    {
      question: "What is Indexed Universal Life (IUL) insurance?",
      answer: "IUL is a type of permanent life insurance that combines a death benefit with a cash value component. The cash value earns interest based on the performance of a market index (like the S&P 500), but your money isn't directly invested in the market. You benefit from market gains up to a cap, while being protected from losses by a guaranteed floor (typically 0%)."
    },
    {
      question: "How do caps and floors work in an IUL?",
      answer: "The floor guarantees you won't lose money when the market drops - typically set at 0% or 1%. The cap limits how much you can earn in any period - for example, if the cap is 10% and the S&P 500 gains 25%, you're credited 10%. If the index loses 20%, you're credited the floor (0%). This creates a 'participate but protect' dynamic."
    },
    {
      question: "Is my money invested in the stock market?",
      answer: "No, your cash value is not directly invested in the stock market. The insurance company uses the index performance as a measuring stick to calculate your interest credit. Your principal is protected by the insurance company's general account, which is invested in conservative assets like bonds."
    },
    {
      question: "What are the tax benefits of an IUL?",
      answer: "IUL offers multiple tax advantages: (1) Cash value grows tax-deferred, (2) You can access cash value through tax-free policy loans, (3) The death benefit passes to beneficiaries income tax-free, (4) There are no contribution limits like 401(k)s or IRAs. This makes IUL a powerful tool for tax-free retirement income."
    },
    {
      question: "What are the risks or downsides of IUL?",
      answer: "Key considerations include: (1) Caps limit your upside in strong market years, (2) Policy fees and costs of insurance reduce returns, (3) Requires proper funding to perform well, (4) More complex than term or whole life, (5) If underfunded, the policy could lapse. Working with an experienced agent is crucial for proper policy design."
    },
    {
      question: "How much should I contribute to an IUL?",
      answer: "IUL works best when funded at or near the maximum allowable (MEC limit) to maximize cash value growth while maintaining tax benefits. The ideal contribution depends on your age, goals, and financial situation. Many advisors recommend 'max-funding' the policy for the first 5-10 years if retirement income is a primary goal."
    }
  ];

  const indexOptions = [
    { name: "S&P 500", description: "Most popular - tracks 500 largest US companies" },
    { name: "Nasdaq 100", description: "Tech-focused index for higher growth potential" },
    { name: "Russell 2000", description: "Small-cap stocks for diversification" },
    { name: "Fixed Account", description: "Guaranteed rate option (typically 2-3%)" },
    { name: "Hybrid/Blended", description: "Mix of indexes for balanced approach" }
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
                Indexed Universal Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Growth Potential.
                <span className="text-heritage-accent"> Downside Protection.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Combine the security of life insurance with market-linked growth potential.
                Participate in market gains while your cash value is protected from losses.
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

            {/* Interactive Rate Card */}
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
                    <h3 className="text-xl font-bold text-gray-900">Growth Calculator</h3>
                    <p className="text-gray-500">See your potential cash value</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age: <span className="text-heritage-primary font-bold">{age}</span></label>
                    <input
                      type="range"
                      min="25"
                      max="55"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>25</span>
                      <span>55</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Premium</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[300, 500, 1000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setMonthlyPremium(amount)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            monthlyPremium === amount
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          ${amount}/mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl">
                  <p className="text-white/80 text-sm mb-2 text-center">Projected Cash Value at Age 65</p>
                  <p className="text-4xl font-bold text-white text-center mb-3">${calculateProjectedValue(65 - age).toLocaleString()}</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-heritage-accent text-sm font-medium">Year 10</p>
                      <p className="text-white font-bold">${calculateProjectedValue(10).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-heritage-accent text-sm font-medium">Year 20</p>
                      <p className="text-white font-bold">${calculateProjectedValue(20).toLocaleString()}</p>
                    </div>
                  </div>
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

      {/* What is IUL Section */}
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
                What is Indexed Universal Life?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Indexed Universal Life (IUL) is a type of permanent life insurance that offers
                both a death benefit and a cash value component that can grow based on the
                performance of a stock market index, like the S&P 500.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Unlike direct stock market investments, IUL provides a <strong>floor</strong> (typically 0%)
                that protects your cash value from market losses, and a <strong>cap</strong> that limits
                gains in exchange for that protection. This creates a "participate but protect" approach
                to building cash value.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Tax-free cash value growth",
                  "Tax-free policy loans for retirement income",
                  "Market-linked returns without direct market risk",
                  "Flexible premium payments",
                  "Adjustable death benefit",
                  "Living benefits for chronic/critical illness"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-[500px] bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart3 className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Growth Chart Illustration</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
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
              How IUL Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understanding the mechanics of an IUL policy helps you maximize its benefits.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
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
                <div className="bg-[#fffaf3] rounded-2xl p-8 h-full">
                  <div className="w-12 h-12 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-heritage-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
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
              Why Choose IUL?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              IUL offers a unique combination of growth potential, protection, and flexibility
              that's hard to find in other financial products.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-[#e8e0d5]"
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

      {/* Caps & Floors Interactive Section */}
      <section className="py-20 bg-heritage-primary">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Understanding Caps & Floors
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              See how your cash value is credited in different market scenarios.
            </motion.p>

            {/* Tabs */}
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <button
                onClick={() => setActiveTab('growth')}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  activeTab === 'growth'
                    ? 'bg-white text-heritage-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Market Scenarios
              </button>
              <button
                onClick={() => setActiveTab('protection')}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  activeTab === 'protection'
                    ? 'bg-white text-heritage-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Growth Projection
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
          >
            {activeTab === 'growth' ? (
              <>
                <div className="grid grid-cols-3 bg-gray-100 p-4 font-semibold text-gray-700">
                  <div>Market Performance</div>
                  <div className="text-center">Your Credit</div>
                  <div className="text-right">Result</div>
                </div>
                {capsAndFloors.growth.map((item, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-3 p-4 items-center ${
                      index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'
                    }`}
                  >
                    <div className="text-gray-700">{item.scenario}</div>
                    <div className="text-center">
                      <span className={`font-bold text-lg ${
                        item.yourGain.includes('+') ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {item.yourGain}
                      </span>
                    </div>
                    <div className="text-right text-gray-500 text-sm">{item.note}</div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 bg-gray-100 p-4 font-semibold text-gray-700">
                  <div>Policy Year</div>
                  <div className="text-center">Annual Premium</div>
                  <div className="text-center">Cash Value*</div>
                  <div className="text-right">Death Benefit</div>
                </div>
                {capsAndFloors.protection.map((item, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-4 p-4 items-center ${
                      index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{item.year}</div>
                    <div className="text-center text-gray-700">{item.premium}</div>
                    <div className="text-center font-bold text-heritage-primary">{item.cashValue}</div>
                    <div className="text-right text-gray-700">{item.deathBenefit}</div>
                  </div>
                ))}
                <div className="p-4 bg-heritage-accent/10 text-center text-sm text-gray-600">
                  *Illustrative example assuming 6.5% average annual credited rate. Actual results will vary.
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Index Options */}
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
              Available Index Options
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from multiple index strategies to match your risk tolerance and goals.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto"
          >
            {indexOptions.map((index, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="w-12 h-12 bg-heritage-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{index.name}</h3>
                <p className="text-sm text-gray-600">{index.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
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
              Popular IUL Use Cases
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              IUL is a versatile tool that can help achieve multiple financial goals.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-6">
                  <useCase.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className="py-20">
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

      {/* Comparison Table */}
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
              IUL vs. Other Life Insurance Types
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how IUL compares to whole life and term life insurance.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-[#e8e0d5]"
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">IUL</th>
                  <th className="p-4 text-center font-semibold">Whole Life</th>
                  <th className="p-4 text-center font-semibold">Term Life</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold">{row.iul}</td>
                    <td className="p-4 text-center text-gray-600">{row.whole}</td>
                    <td className="p-4 text-center text-gray-600">{row.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Important Considerations */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-heritage-accent" />
              <h2 className="text-2xl font-bold text-gray-900">Important Considerations</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-heritage-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Long-Term Commitment</h3>
                  <p className="text-gray-600">IUL works best as a long-term strategy. Plan to hold the policy for 10-20+ years to maximize cash value growth and minimize the impact of early-year costs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <DollarSign className="w-6 h-6 text-heritage-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proper Funding is Key</h3>
                  <p className="text-gray-600">Underfunded IUL policies may not perform well. Work with an experienced advisor to determine the right premium level for your goals.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <LineChart className="w-6 h-6 text-heritage-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Illustrations Aren't Guarantees</h3>
                  <p className="text-gray-600">Policy illustrations show hypothetical scenarios. Actual results depend on market performance, caps, and policy costs. Review illustrations carefully with your advisor.</p>
                </div>
              </div>
            </div>
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
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
              "After maxing out my 401(k), I wanted a tax-advantaged way to save more for retirement.
              My IUL has grown significantly over the past 12 years, and I love knowing that if the
              market crashes, my cash value is protected. The tax-free loan feature will be a game
              changer when I retire."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">RK</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Robert K.</p>
                <p className="text-gray-500">Business Owner, IUL Policyholder Since 2012</p>
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
              Get answers to common questions about Indexed Universal Life insurance.
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
              Ready to Explore IUL?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              IUL can be a powerful tool for building tax-free retirement income.
              Let's discuss if it's right for your financial goals.
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
                <Phone className="w-5 h-5" /> Call (630) 778-0800
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
