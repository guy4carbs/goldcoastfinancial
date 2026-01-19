import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ReturnOfPremium() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ROP Calculator State
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [termLength, setTermLength] = useState(20);
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<'male' | 'female'>('male');

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
      description: "ROP policies cost 2-3 times more than traditional term life. The extra premium builds up over the policy term.",
      icon: Wallet
    },
    {
      step: 2,
      title: "Maintain Coverage",
      description: "Keep your policy active for the entire term. Missing payments or canceling early may forfeit your refund rights.",
      icon: Shield
    },
    {
      step: 3,
      title: "Outlive the Policy",
      description: "If you're still alive at the end of the term, you trigger the return of premium feature.",
      icon: Clock
    },
    {
      step: 4,
      title: "Receive Your Refund",
      description: "Get back 100% of premiums paid, tax-free. No interest, but no loss either.",
      icon: RefreshCcw
    }
  ];

  const pros = [
    {
      icon: RefreshCcw,
      title: "100% Premium Refund",
      description: "The biggest benefit: if you outlive the policy, you get back every dollar you paid in premiums. Your family was protected, and you kept your money."
    },
    {
      icon: Shield,
      title: "Tax-Free Return",
      description: "The refund is considered a return of your own money, not income. You won't owe federal taxes on the returned premiums."
    },
    {
      icon: PiggyBank,
      title: "Forced Savings Mechanism",
      description: "For people who struggle to save, ROP acts like a forced savings plan. The money is locked away and returned as a lump sum later."
    },
    {
      icon: Heart,
      title: "Peace of Mind",
      description: "Eliminates the common concern of 'wasting' money on term insurance. You're guaranteed to either use the coverage or get your money back."
    },
    {
      icon: Award,
      title: "Full Death Benefit",
      description: "Your beneficiaries still receive the full death benefit if you pass away during the term—same protection as traditional term."
    },
    {
      icon: Target,
      title: "Flexibility with Milestones",
      description: "Some policies offer partial refunds at milestones (10, 15 years). You can surrender early and still receive a portion of premiums."
    }
  ];

  const cons = [
    {
      icon: DollarSign,
      title: "Significantly Higher Cost",
      description: "ROP premiums are typically 2-3 times higher than traditional term. A $50/month traditional policy might cost $140/month with ROP."
    },
    {
      icon: TrendingUp,
      title: "Opportunity Cost",
      description: "The extra money paid in premiums could be invested elsewhere. Over 20-30 years, invested funds might grow significantly more than the refund."
    },
    {
      icon: Clock,
      title: "No Interest Earned",
      description: "Your premiums sit for decades earning nothing. Due to inflation, the dollars returned are worth less than when you paid them."
    },
    {
      icon: AlertCircle,
      title: "Strict Commitment Required",
      description: "Miss a payment or cancel early, and you may lose the refund benefit entirely. Life circumstances can change unpredictably over 20-30 years."
    },
    {
      icon: XCircle,
      title: "Limited Availability",
      description: "Not all insurers offer ROP policies or riders. Your options may be more limited than with traditional term life."
    },
    {
      icon: Scale,
      title: "May Reduce Coverage Amount",
      description: "Higher premiums may force you to buy less coverage. It's better to be properly insured than underinsured with ROP."
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
      verdict: "Best for: Budget-conscious buyers, disciplined investors"
    },
    {
      title: "Return of Premium",
      subtitle: "Higher cost, guaranteed return",
      monthlyPremium: premiums.ropMonthly,
      totalPaid: premiums.ropTotal,
      ifYouDie: `Beneficiaries receive ${formatCurrency(coverageAmount)}`,
      ifYouLive: `You receive ${formatCurrency(premiums.ropTotal)} back tax-free`,
      investDifference: 0,
      verdict: "Best for: Non-investors, high earners, peace of mind seekers"
    }
  ];

  const idealCandidates = [
    {
      icon: Wallet,
      title: "High Income Earners",
      description: "If you can comfortably afford the higher premiums without sacrificing other financial goals, ROP makes more sense."
    },
    {
      icon: PiggyBank,
      title: "Non-Investors / Non-Savers",
      description: "If you know you won't invest the premium difference, ROP guarantees you'll at least get your money back."
    },
    {
      icon: Heart,
      title: "Risk-Averse Individuals",
      description: "If market volatility stresses you out and you prefer guaranteed outcomes over potential gains, ROP provides certainty."
    },
    {
      icon: Clock,
      title: "Shorter Coverage Needs",
      description: "Covering a 15-year mortgage? ROP for a specific obligation can be a 'win-win' strategy with defined endpoint."
    },
    {
      icon: Users,
      title: "Young & Healthy Applicants",
      description: "The more likely you are to outlive your policy, the more valuable the return feature becomes."
    },
    {
      icon: Target,
      title: "Those Who Hate 'Wasting' Money",
      description: "If the idea of paying for something you might never use keeps you from buying coverage, ROP removes that barrier."
    }
  ];

  const notIdealFor = [
    {
      title: "Budget-Constrained Buyers",
      reason: "Higher ROP premiums may force you to buy less coverage. Adequate protection should be the priority."
    },
    {
      title: "Disciplined Investors",
      reason: "Investing the premium difference could potentially yield higher returns over 20-30 years, even after taxes."
    },
    {
      title: "Those with Unstable Income",
      reason: "Missing payments can void the return feature. Only commit if you're confident in 20-30 years of payments."
    },
    {
      title: "Maximum Coverage Seekers",
      reason: "The goal is to maximize protection per dollar. Traditional term provides more coverage for the same budget."
    }
  ];

  const faqs = [
    {
      question: "How does return of premium term life insurance work?",
      answer: "Return of Premium (ROP) is a term life insurance policy that refunds all premiums paid if you outlive the coverage period. You pay higher premiums (typically 2-3x traditional term), maintain the policy for the full term, and if you're alive at the end, you receive 100% of your premiums back tax-free. If you pass away during the term, beneficiaries receive the full death benefit just like traditional term."
    },
    {
      question: "Is the premium refund taxable?",
      answer: "No, the premium refund is generally not taxable. The IRS considers it a return of your own money, not income or investment gains. However, tax laws can change, so consult a tax professional for your specific situation."
    },
    {
      question: "What happens if I cancel my ROP policy early?",
      answer: "If you cancel early, you may lose some or all of the return-of-premium benefit. Some policies offer partial refunds at milestones (like 10 or 15 years), while others require you to complete the full term. Always check your policy's specific terms before purchasing."
    },
    {
      question: "Is ROP better than investing the difference?",
      answer: "It depends on your investment discipline and risk tolerance. Historically, investing the premium difference in a diversified portfolio could potentially outperform the ROP refund. However, this requires discipline to actually invest the savings and comfort with market risk. ROP provides a guaranteed, risk-free return for those who value certainty."
    },
    {
      question: "Can I add ROP to an existing term policy?",
      answer: "Generally, no. ROP must be included when you first purchase the policy or added as a rider at origination. You typically cannot add the return-of-premium feature to an existing traditional term policy."
    },
    {
      question: "What if I miss a premium payment?",
      answer: "Missing payments can jeopardize your return-of-premium benefit. Most policies have a grace period (usually 30-31 days) for late payments. However, if the policy lapses, you may lose both coverage and the right to the premium refund. Set up automatic payments to protect this benefit."
    },
    {
      question: "Do ROP policies build cash value?",
      answer: "No, ROP is still term insurance—it doesn't build cash value the way whole life or universal life does. The return feature simply gives back your premiums at the end of the term. During the term, your premiums don't accumulate value you can borrow against."
    },
    {
      question: "What term lengths are available for ROP?",
      answer: "ROP is typically available in 15, 20, 25, and 30-year terms. Not all insurers offer all term lengths with the ROP feature. The longer the term, the higher the premiums but also the larger your eventual refund if you outlive the policy."
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
                Return of Premium Term Life
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Get Every Dollar
                <span className="text-heritage-accent"> Back</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                The only life insurance where you win either way. Your family gets the death benefit
                if something happens, or you get 100% of your premiums back tax-free if you outlive the policy.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get ROP Quote <ArrowRight className="w-5 h-5" />
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
                        <button
                          key={term}
                          onClick={() => setTermLength(term)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            termLength === term
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          {term}yr
                        </button>
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
                  <div className="flex justify-between items-center p-3 bg-[#f5f0e8] rounded-lg">
                    <span className="text-gray-600">Traditional Term</span>
                    <span className="font-bold text-gray-700">${premiums.traditionalMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-heritage-primary/10 rounded-lg border-2 border-heritage-primary">
                    <span className="text-heritage-primary font-medium">Return of Premium</span>
                    <span className="font-bold text-heritage-primary">${premiums.ropMonthly}/mo</span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Your Guaranteed Refund</p>
                  <p className="text-5xl font-bold text-white mb-1">{formatCurrency(premiums.ropTotal)}</p>
                  <p className="text-heritage-accent text-sm font-medium">If you outlive the policy</p>
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

      {/* How It Works */}
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
              How Return of Premium Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Return of premium term life insurance is straightforward—pay higher premiums now,
              get them all back later if you outlive the policy.
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
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-all hover:-translate-y-1 h-full">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
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
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              For the right buyer, ROP provides unique advantages that traditional term can't match.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {pros.map((pro, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 border border-[#e8e0d5]"
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
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
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
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              ROP isn't right for everyone. Here are the potential downsides to weigh carefully.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {cons.map((con, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 border border-[#e8e0d5]"
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
              Traditional Term vs. Return of Premium
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how the two approaches compare for your specific situation based on your inputs above.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {comparisonScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`rounded-3xl p-8 ${
                  index === 1
                    ? 'bg-heritage-primary text-white'
                    : 'bg-white border-2 border-[#e8e0d5]'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${index === 1 ? 'text-white' : 'text-gray-900'}`}>
                  {scenario.title}
                </h3>
                <p className={`mb-6 ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>
                  {scenario.subtitle}
                </p>

                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-xl ${index === 1 ? 'bg-white/10' : 'bg-[#f5f0e8]'}`}>
                    <p className={`text-sm ${index === 1 ? 'text-white/70' : 'text-gray-500'}`}>Monthly Premium</p>
                    <p className={`text-3xl font-bold ${index === 1 ? 'text-white' : 'text-heritage-primary'}`}>
                      ${scenario.monthlyPremium}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${index === 1 ? 'bg-white/10' : 'bg-[#f5f0e8]'}`}>
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
              Is ROP Right for You?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Return of premium works best for certain financial profiles. See if you're an ideal candidate.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {idealCandidates.map((candidate, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
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
              When Traditional Term Might Be Better
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              ROP isn't the best choice for everyone. Traditional term may be better if you fit these profiles.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {notIdealFor.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-6 bg-[#fffaf3] rounded-2xl border border-[#e8e0d5]"
                >
                  <div className="p-2 bg-gray-200 rounded-lg flex-shrink-0">
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
              "I knew I wouldn't invest the difference—I'm just not disciplined that way. After 20 years,
              I got back $34,000 in premiums. That paid for our anniversary trip to Europe and put the
              rest toward our grandkids' college funds. Best insurance decision I ever made."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">RD</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Robert D.</p>
                <p className="text-gray-500">20-Year ROP Policyholder, Phoenix AZ</p>
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
              Get answers to common questions about return of premium term life insurance.
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
              Protection That Pays You Back
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Get a personalized ROP quote and see exactly what you'd pay—and get back.
              Our advisors can help you decide if ROP is right for your situation.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Get Your ROP Quote <ArrowRight className="w-5 h-5" />
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
