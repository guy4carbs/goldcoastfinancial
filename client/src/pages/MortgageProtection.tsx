import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  Star,
  TrendingDown,
  Umbrella,
  Heart,
  Calculator,
  FileText,
  BadgeCheck,
  Wallet
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

export default function MortgageProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mortgageAmount, setMortgageAmount] = useState(300000);
  const [age, setAge] = useState(35);
  const [term, setTerm] = useState(30);

  const calculatePremium = () => {
    const baseRate = 0.12;
    const ageMultiplier = 1 + ((age - 25) * 0.025);
    const termMultiplier = 1 + ((term - 15) * 0.015);
    const monthly = ((mortgageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    return Math.round(monthly);
  };

  const trustStats = [
    { value: "350K+", label: "Homes Protected" },
    { value: "$45B+", label: "Coverage Issued" },
    { value: "99%", label: "Claims Paid" },
    { value: "4.8/5", label: "Customer Rating" }
  ];

  const bigStats = [
    { value: "$35", label: "Average Monthly Cost", sublabel: "For $300K mortgage, age 35" },
    { value: "15-30", label: "Year Terms Available", sublabel: "Match your mortgage length" },
    { value: "48hrs", label: "Fast Approval", sublabel: "Most policies approved quickly" }
  ];

  const benefits = [
    {
      icon: Home,
      title: "Protect Your Home",
      description: "Ensure your family can keep their home if something happens to you."
    },
    {
      icon: TrendingDown,
      title: "Decreasing or Level Options",
      description: "Choose coverage that decreases with your mortgage or stays level for maximum protection."
    },
    {
      icon: DollarSign,
      title: "Affordable Premiums",
      description: "Cost-effective coverage designed specifically for mortgage protection needs."
    },
    {
      icon: Heart,
      title: "Living Benefits",
      description: "Access funds if you become critically ill or disabled and can't work."
    }
  ];

  const coverageOptions = [
    {
      name: "Decreasing Term",
      description: "Coverage decreases as your mortgage balance decreases",
      pros: [
        "Lowest premium costs",
        "Matches declining mortgage balance",
        "Simple and straightforward"
      ],
      cons: [
        "Less coverage over time",
        "No additional protection"
      ],
      bestFor: "Budget-conscious homeowners focused solely on mortgage payoff"
    },
    {
      name: "Level Term",
      description: "Coverage stays the same throughout the policy term",
      pros: [
        "Consistent death benefit",
        "Extra funds for family beyond mortgage",
        "More flexibility in how funds are used"
      ],
      cons: [
        "Slightly higher premiums than decreasing"
      ],
      bestFor: "Homeowners who want maximum protection and flexibility"
    },
    {
      name: "Return of Premium",
      description: "Get your premiums back if you outlive the policy",
      pros: [
        "Money back if you don't use it",
        "Forces savings discipline",
        "No money \"wasted\" on insurance"
      ],
      cons: [
        "Higher premium costs",
        "Locked into full term"
      ],
      bestFor: "Those who want a safety net with savings component"
    }
  ];

  const scenarios = [
    {
      title: "Primary Income Earner",
      description: "If the main breadwinner passes away, mortgage protection ensures monthly payments continue and the family stays in their home.",
      icon: Users
    },
    {
      title: "Dual Income Household",
      description: "When both spouses work to afford the mortgage, losing either income could make payments impossible. Protect both earners.",
      icon: Heart
    },
    {
      title: "Self-Employed Homeowners",
      description: "Business owners often have inconsistent income. Mortgage protection provides certainty regardless of business performance.",
      icon: FileText
    },
    {
      title: "New Home Buyers",
      description: "Just purchased a home with a 30-year mortgage? This is the perfect time to lock in affordable rates while you're young and healthy.",
      icon: Home
    }
  ];

  const comparisonData = [
    { feature: "Primary Purpose", mortgage: "Pay off mortgage", term: "Income replacement" },
    { feature: "Beneficiary", mortgage: "Family (flexible use)", term: "Named beneficiary" },
    { feature: "Coverage Amount", mortgage: "Matches mortgage balance", term: "Based on income needs" },
    { feature: "Policy Term", mortgage: "Matches mortgage term", term: "10, 15, 20, 30 years" },
    { feature: "Living Benefits", mortgage: "Often included", term: "May require rider" },
    { feature: "Disability Coverage", mortgage: "Often included", term: "Usually separate policy" }
  ];

  const faqs = [
    {
      question: "What is mortgage protection insurance?",
      answer: "Mortgage protection insurance (MPI) is a type of life insurance designed to pay off your mortgage balance if you pass away during the policy term. It ensures your family can keep their home without the burden of monthly mortgage payments. Some policies also include living benefits that can help if you become disabled or critically ill."
    },
    {
      question: "How is mortgage protection different from PMI?",
      answer: "Private Mortgage Insurance (PMI) protects the lender if you default on your loan - it provides no benefit to you or your family. Mortgage Protection Insurance protects YOUR family by paying off the mortgage if you die or become disabled. They serve completely different purposes and protect different parties."
    },
    {
      question: "Should I get decreasing or level term coverage?",
      answer: "It depends on your goals. Decreasing term is cheaper and matches your declining mortgage balance perfectly. Level term costs slightly more but provides consistent coverage - any excess after paying the mortgage goes to your family for other needs like college funds, living expenses, or emergency savings. Most families prefer level term for the added flexibility."
    },
    {
      question: "What if I refinance or sell my home?",
      answer: "Your mortgage protection policy stays with you, not your home. If you refinance, your policy continues unchanged. If you sell and buy a new home, you can keep your existing policy or adjust coverage to match your new mortgage. The flexibility is a key advantage over lender-offered mortgage protection."
    },
    {
      question: "Can I get mortgage protection with health issues?",
      answer: "Yes! Many mortgage protection policies have simplified underwriting with fewer health questions than traditional life insurance. Some guaranteed issue options are available with no health questions at all, though premiums may be higher. We work with multiple carriers to find coverage for almost any health situation."
    },
    {
      question: "How much does mortgage protection cost?",
      answer: "Costs vary based on your age, health, mortgage amount, and policy type. A healthy 35-year-old might pay $30-50/month for $300,000 in level term coverage for 30 years. Decreasing term options cost even less. The key is that rates are locked in and never increase during the policy term."
    }
  ];

  const sampleRates = [
    { mortgage: "$200,000", term: "20 Year", monthly: "$24-35" },
    { mortgage: "$300,000", term: "30 Year", monthly: "$35-55" },
    { mortgage: "$400,000", term: "30 Year", monthly: "$45-70" },
    { mortgage: "$500,000", term: "30 Year", monthly: "$55-85" }
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
                Mortgage Protection Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Protect Your Home &
                <span className="text-heritage-accent"> Your Family's Future</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Ensure your loved ones can keep their home if something unexpected happens.
                Affordable coverage that pays off your mortgage so your family never has to worry.
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
                    <h3 className="text-xl font-bold text-gray-900">Instant Quote</h3>
                    <p className="text-gray-500">See your estimated rate</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age: <span className="text-heritage-primary font-bold">{age}</span></label>
                    <input
                      type="range"
                      min="25"
                      max="65"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>25</span>
                      <span>65</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Amount</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[200000, 300000, 500000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setMortgageAmount(amount)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            mortgageAmount === amount
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          ${(amount / 1000).toLocaleString()}K
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term Length</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 20, 30].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTerm(t)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            term === t
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          {t}yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Estimated Monthly Premium</p>
                  <p className="text-5xl font-bold text-white mb-1">${calculatePremium()}<span className="text-xl">/mo</span></p>
                  <p className="text-heritage-accent text-sm font-medium">Keep your home protected</p>
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

      {/* What is Mortgage Protection Section */}
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
                What is Mortgage Protection Insurance?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Mortgage protection insurance is a life insurance policy specifically designed to pay off
                your mortgage balance if you pass away. Unlike private mortgage insurance (PMI) which
                protects your lender, mortgage protection insurance protects your family.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                For most families, their home is their largest asset and their mortgage is their biggest
                debt. Mortgage protection ensures that if the primary breadwinner passes away, the
                surviving family members can keep their home without worrying about monthly payments.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Pays off your mortgage if you pass away",
                  "Living benefits for disability or critical illness",
                  "Premiums that never increase",
                  "Portable - stays with you if you move",
                  "Benefit paid directly to your family",
                  "No medical exam options available"
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
                  <Home className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Family Home Image</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
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
              Why Choose Mortgage Protection?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mortgage protection insurance offers peace of mind that your family's home
              is secure no matter what life brings.
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

      {/* Coverage Options */}
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
              Coverage Options
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the type of mortgage protection that best fits your needs and budget.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {coverageOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.name}</h3>
                <p className="text-gray-600 mb-6">{option.description}</p>

                <div className="mb-4">
                  <p className="font-semibold text-heritage-primary mb-2">Advantages:</p>
                  <ul className="space-y-2">
                    {option.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <p className="font-semibold text-gray-500 mb-2">Considerations:</p>
                  <ul className="space-y-2">
                    {option.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-[#f5f0e8] rounded-xl">
                  <p className="text-sm">
                    <span className="font-semibold text-heritage-primary">Best for:</span>{" "}
                    <span className="text-gray-600">{option.bestFor}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Scenarios Section */}
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
              Who Needs Mortgage Protection?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              If you have a mortgage and people who depend on you, mortgage protection should be part of your financial plan.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {scenarios.map((scenario, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-6">
                  <scenario.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{scenario.title}</h3>
                <p className="text-gray-600">{scenario.description}</p>
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
              Mortgage Protection vs. Term Life
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              While similar, there are key differences to understand when choosing your coverage.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto border border-[#e8e0d5]"
          >
            <div className="grid grid-cols-3 bg-heritage-primary text-white p-4 font-semibold">
              <div>Feature</div>
              <div className="text-center">Mortgage Protection</div>
              <div className="text-center">Term Life</div>
            </div>
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center text-heritage-primary font-semibold">{row.mortgage}</div>
                <div className="text-center text-gray-600">{row.term}</div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-600 mt-8 max-w-2xl mx-auto"
          >
            <strong>Pro Tip:</strong> Many families benefit from having both mortgage protection and
            additional term life coverage to protect their home AND provide income replacement for
            other family needs.
          </motion.p>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-[#f5f0e8]">
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
              "When my husband passed unexpectedly, I was devastated. But thanks to our mortgage
              protection policy, I didn't have to worry about losing our home on top of everything else.
              The kids and I got to stay in the house where all our memories are. I can't express
              how much that meant to us."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">JT</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Jennifer T.</p>
                <p className="text-gray-500">Mother of 3, Mortgage Protected Since 2019</p>
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
              Get answers to common questions about mortgage protection insurance.
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
              Protect Your Family's Home Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Don't wait until it's too late. Get affordable mortgage protection coverage
              and ensure your family can keep their home no matter what.
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
