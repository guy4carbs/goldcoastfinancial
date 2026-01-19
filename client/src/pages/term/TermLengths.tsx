import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
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
  AlertCircle
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

export default function TermLengths() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(20);
  const [age, setAge] = useState(35);

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

  const trustStats = [
    { value: "20yr", label: "Most Popular Term" },
    { value: "30yr", label: "Best for Young Families" },
    { value: "40%", label: "Cost Savings (10yr vs 30yr)" },
    { value: "65", label: "Max Issue Age (Most Carriers)" }
  ];

  const bigStats = [
    { value: "20", label: "Year Term", sublabel: "Most popular choice" },
    { value: "2x", label: "Price Difference", sublabel: "Between 10yr and 30yr" },
    { value: "75%", label: "Of Buyers", sublabel: "Choose 20 or 30 year terms" }
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
        "Lowest monthly premiums",
        "Perfect for specific short-term needs",
        "Often convertible to permanent",
        "Good for supplemental coverage"
      ],
      cons: [
        "May need to reapply when it expires",
        "Higher rates if you renew later",
        "Limited long-term protection"
      ],
      idealAge: "50-65",
      scenarios: [
        "10 years from retirement with pension",
        "Business loan payoff timeline",
        "Children graduating college soon",
        "Supplementing employer coverage"
      ]
    },
    {
      years: 15,
      icon: GraduationCap,
      title: "15-Year Term",
      tagline: "Teen to Independence",
      monthlyRate: "$26",
      bestFor: "Teenagers heading to college, 15-year mortgage",
      coverage: "Children through college and early adulthood",
      pros: [
        "Lower cost than 20-year",
        "Matches 15-year mortgages",
        "Good balance of cost and coverage",
        "Kids protected through college"
      ],
      cons: [
        "May fall short if kids delay independence",
        "Less common than 20 or 30 year",
        "Limited flexibility"
      ],
      idealAge: "40-55",
      scenarios: [
        "Kids ages 8-12 (college in 6-10 years)",
        "15-year mortgage refinance",
        "Mid-career with growing savings",
        "Spouse can work but needs bridge"
      ]
    },
    {
      years: 20,
      icon: Home,
      title: "20-Year Term",
      tagline: "The Sweet Spot",
      monthlyRate: "$32",
      bestFor: "Young families, new homeowners, most situations",
      coverage: "Mortgage payoff, kids through college",
      pros: [
        "Most popular choice for a reason",
        "Covers typical 20-year mortgage",
        "Kids from birth to adulthood",
        "Balanced cost and protection"
      ],
      cons: [
        "May need extension if obligations last longer",
        "Slightly higher than 10 or 15 year"
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
      bestFor: "Growing families, longer mortgages, planning ahead",
      coverage: "Multiple children through adulthood",
      pros: [
        "Extra 5 years vs 20-year term",
        "Kids protected into mid-20s",
        "Good for late starters",
        "Room for life changes"
      ],
      cons: [
        "Higher premiums than 20-year",
        "Less common offering",
        "May be over-insuring"
      ],
      idealAge: "28-40",
      scenarios: [
        "Planning to have more children",
        "Kids will need support through grad school",
        "Longer mortgage timeline",
        "Want extra buffer room"
      ]
    },
    {
      years: 30,
      icon: Baby,
      title: "30-Year Term",
      tagline: "Maximum Protection",
      monthlyRate: "$52",
      bestFor: "Young parents, 30-year mortgages, maximum security",
      coverage: "Full mortgage, kids completely independent",
      pros: [
        "Longest available protection",
        "Locks in young, healthy rates",
        "Covers 30-year mortgage completely",
        "Maximum peace of mind"
      ],
      cons: [
        "Highest monthly premiums",
        "May outlive the need",
        "Age restrictions (usually must start by 45-50)"
      ],
      idealAge: "25-40",
      scenarios: [
        "Newborn or planning children",
        "30-year mortgage",
        "Single income supporting family",
        "Want to lock in rates while young"
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
      answer: "The 20-year term is the most popular choice, accounting for about 40% of all term life purchases. It aligns perfectly with typical mortgage lengths and covers children from young ages through college graduation. The 30-year term is the second most popular, especially among younger buyers who want to lock in low rates."
    },
    {
      question: "Should I match my term to my mortgage?",
      answer: "Generally yes, but consider your full picture. If you have a 30-year mortgage but plan to pay it off in 20 years, a 20-year term might suffice. If you have young children, prioritize covering them until independence, which might require a longer term than your mortgage."
    },
    {
      question: "Can I extend my term if I still need coverage when it expires?",
      answer: "Most policies allow you to renew annually after the term expires, but at significantly higher rates based on your current age. Some policies offer a conversion option to permanent insurance without a medical exam. The best strategy is to buy the right term length upfront while you're young and healthy."
    },
    {
      question: "What is policy laddering and should I consider it?",
      answer: "Laddering means buying multiple policies with different term lengths. For example, a 30-year policy for $500K, a 20-year for $300K, and a 10-year for $200K. As shorter policies expire, your coverage decreases along with your actual needs. This can save money while ensuring adequate protection at each life stage."
    },
    {
      question: "I'm 45 - can I still get a 30-year term?",
      answer: "It depends on the carrier. Most insurers cap 30-year terms at ages 45-50 because the policy would extend past typical life expectancy calculations. At 45, you may find 20-year terms more readily available and cost-effective. Some carriers do offer 30-year terms up to age 50."
    },
    {
      question: "Is it better to buy a longer term 'just in case'?",
      answer: "There's wisdom in buying slightly longer than you think you need - life often takes unexpected turns. However, don't over-insure. A 30-year term at age 35 covers you to 65, which may be overkill if your kids will be grown and your mortgage paid by 55. Balance protection needs with premium costs."
    }
  ];

  const decisionFactors = [
    {
      icon: Home,
      title: "Mortgage Length",
      description: "Match your term to your mortgage payoff date. If you have a 30-year mortgage and just bought your home, consider a 30-year term."
    },
    {
      icon: Baby,
      title: "Children's Ages",
      description: "Cover until your youngest is financially independent. If your youngest is 5, a 20-year term covers them to age 25."
    },
    {
      icon: Calendar,
      title: "Years to Retirement",
      description: "If you're 55 and retiring at 65, a 10-year term bridges the gap until your pension and Social Security begin."
    },
    {
      icon: DollarSign,
      title: "Budget Constraints",
      description: "Longer terms cost more. If budget is tight, a shorter term with adequate coverage beats a longer term with insufficient coverage."
    },
    {
      icon: TrendingUp,
      title: "Career Trajectory",
      description: "Expect significant income growth? Consider more coverage now while it's cheap, or plan to add policies later."
    },
    {
      icon: Heart,
      title: "Spouse's Situation",
      description: "If your spouse can support the family eventually, you may need shorter coverage. If not, plan for longer-term protection."
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
                Term Length Guide
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                10, 15, 20, 25, or 30 Years?
                <span className="text-heritage-accent"> Choose Wisely.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                The right term length protects your family exactly when they need it most -
                without paying for coverage you don't need. Here's how to decide.
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

            {/* Interactive Term Comparison Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-accent/20 rounded-xl">
                    <Clock className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Term Comparison</h3>
                    <p className="text-gray-500">$500K coverage rates</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Age: <span className="text-heritage-primary font-bold">{age}</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Term Length</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[10, 15, 20, 25, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`py-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTerm === term
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          {term}yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
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

                <div className="p-4 bg-heritage-accent/10 rounded-xl border border-heritage-accent/20 text-center">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Coverage ends at age {age + selectedTerm}</span>
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

      {/* Term Options Deep Dive */}
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
              Every Term Length Explained
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each term length serves a specific purpose. Find the one that matches your life stage and financial obligations.
            </motion.p>
          </motion.div>

          <div className="space-y-8">
            {termOptions.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-shadow"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Header */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-heritage-primary/10 rounded-2xl">
                        <term.icon className="w-10 h-10 text-heritage-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{term.title}</h3>
                        <p className="text-heritage-primary font-semibold">{term.tagline}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-heritage-primary rounded-xl text-center mb-4">
                      <p className="text-white/80 text-sm">Starting at</p>
                      <p className="text-3xl font-bold text-white">{term.monthlyRate}<span className="text-lg">/mo</span></p>
                      <p className="text-heritage-accent text-sm">$500K coverage, age 35</p>
                    </div>
                    <p className="text-gray-600">{term.coverage}</p>
                    <p className="mt-3 text-sm"><span className="font-semibold">Best ages:</span> {term.idealAge}</p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="lg:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Advantages
                    </h4>
                    <ul className="space-y-2 mb-6">
                      {term.pros.map((pro, i) => (
                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
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
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-heritage-primary" /> Ideal Scenarios
                    </h4>
                    <ul className="space-y-3">
                      {term.scenarios.map((scenario, i) => (
                        <li key={i} className="p-3 bg-[#f5f0e8] rounded-lg text-sm text-gray-700">
                          {scenario}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
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
              Side-by-Side Comparison
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how each term length stacks up across key factors.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-[#e8e0d5]"
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
                    className={index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}
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
              How to Choose Your Term Length
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Consider these six factors to find the term length that fits your life perfectly.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {decisionFactors.map((factor, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-3 bg-heritage-primary/10 rounded-xl w-fit mb-4">
                  <factor.icon className="w-6 h-6 text-heritage-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{factor.title}</h3>
                <p className="text-gray-600 text-sm">{factor.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Laddering Strategy */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-heritage-primary/10 rounded-xl">
                  <Layers className="w-8 h-8 text-heritage-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  The Laddering Strategy
                </h2>
              </motion.div>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Smart buyers don't always choose just one policy. Laddering means buying multiple
                policies with different term lengths, so your coverage decreases as your needs decrease.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                This strategy can save significant money while ensuring you're never under-insured.
                As shorter policies expire, you still have coverage from longer policies.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Match different policies to different obligations",
                  "Coverage decreases as debts are paid off",
                  "Lower total premiums than one large policy",
                  "Flexibility as your life changes"
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
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#e8e0d5]">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Example Ladder ($1M Total Coverage)</h3>
                <div className="space-y-4">
                  {ladderingStrategy.map((policy, index) => (
                    <div key={index} className="p-4 bg-[#f5f0e8] rounded-xl">
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
              </div>
            </motion.div>
          </div>
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
              "I was about to buy a 30-year term at age 42, but my Heritage advisor suggested
              laddering instead. Now I have better coverage that matches my actual needs, and
              I'm saving $35/month. That's $12,600 over the life of my policies."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">DM</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">David M.</p>
                <p className="text-gray-500">Father of 3, Chicago IL</p>
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
              Get answers to common questions about term life insurance lengths.
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
              Ready to Choose Your Term?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Get personalized quotes for any term length. Our advisors can help you find the
              perfect fit for your family's needs.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Compare Term Lengths <ArrowRight className="w-5 h-5" />
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
