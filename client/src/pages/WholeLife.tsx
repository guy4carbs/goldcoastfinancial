import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  Star,
  TrendingUp,
  Heart,
  PiggyBank,
  Calculator,
  Building,
  Infinity,
  Lock
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

export default function WholeLife() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageAmount, setCoverageAmount] = useState(250000);
  const [age, setAge] = useState(35);

  const calculatePremium = () => {
    const baseRate = 1.15;
    const ageMultiplier = 1 + ((age - 25) * 0.04);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier);
    return Math.round(monthly);
  };

  const calculateCashValue = (years: number) => {
    const premium = calculatePremium();
    const totalPremiums = premium * 12 * years;
    const cashValueRate = years < 10 ? 0.35 : years < 20 ? 0.55 : 0.75;
    return Math.round(totalPremiums * cashValueRate);
  };

  const benefits = [
    {
      icon: Infinity,
      title: "Lifetime Coverage",
      description: "Your policy never expires. Protection that lasts your entire life, guaranteed."
    },
    {
      icon: PiggyBank,
      title: "Cash Value Growth",
      description: "Build tax-deferred savings you can borrow against or withdraw during your lifetime."
    },
    {
      icon: Lock,
      title: "Guaranteed Premiums",
      description: "Your premium is locked in forever and will never increase regardless of health."
    },
    {
      icon: TrendingUp,
      title: "Living Benefits",
      description: "Access your cash value for emergencies, opportunities, or retirement income."
    }
  ];

  const sampleRates = [
    { age: "25", coverage: "$100K", monthly: "$95", cashValue10: "$8,200", cashValue20: "$22,500" },
    { age: "30", coverage: "$100K", monthly: "$115", cashValue10: "$9,900", cashValue20: "$27,100" },
    { age: "35", coverage: "$250K", monthly: "$285", cashValue10: "$24,500", cashValue20: "$67,200" },
    { age: "40", coverage: "$250K", monthly: "$365", cashValue10: "$31,400", cashValue20: "$86,100" },
    { age: "45", coverage: "$250K", monthly: "$465", cashValue10: "$40,000", cashValue20: "$109,700" },
    { age: "50", coverage: "$250K", monthly: "$595", cashValue10: "$51,200", cashValue20: "$140,300" }
  ];

  const whoShouldConsider = [
    {
      icon: Building,
      title: "Estate Planning",
      description: "Create a tax-efficient legacy for heirs and cover estate taxes to preserve wealth."
    },
    {
      icon: Heart,
      title: "Lifelong Protection",
      description: "Ensure your spouse or dependents are protected no matter when you pass away."
    },
    {
      icon: TrendingUp,
      title: "Wealth Building",
      description: "Build guaranteed cash value that grows tax-deferred alongside investments."
    },
    {
      icon: Users,
      title: "Business Owners",
      description: "Fund buy-sell agreements, key person coverage, or executive benefits."
    }
  ];

  const comparisonData = [
    { feature: "Monthly Cost (Age 35, $250K)", whole: "$285", term: "$25-35" },
    { feature: "Coverage Duration", whole: "Lifetime", term: "10-30 years" },
    { feature: "Cash Value", whole: "Yes, guaranteed", term: "No" },
    { feature: "Premium Changes", whole: "Fixed forever", term: "Fixed for term" },
    { feature: "Best For", whole: "Permanent needs", term: "Temporary needs" }
  ];

  const faqs = [
    {
      question: "How does whole life insurance build cash value?",
      answer: "A portion of each premium payment goes toward building cash value in your policy. This cash value grows at a guaranteed interest rate set by the insurance company. Over time, the cash value can become substantial—often tens of thousands of dollars—which you can access through loans or withdrawals while you're still alive."
    },
    {
      question: "Can I access my cash value while I'm alive?",
      answer: "Yes! You can borrow against your cash value at any time, typically at favorable interest rates, without credit checks or approval processes. You can also make partial withdrawals. Keep in mind that unpaid loans reduce your death benefit, and withdrawals may have tax implications."
    },
    {
      question: "Why is whole life more expensive than term?",
      answer: "Whole life costs more because: 1) It covers your entire lifetime, not just a set period, 2) A portion of premiums builds guaranteed cash value, 3) The insurance company takes on more risk with lifetime coverage. While the monthly premium is higher, you're getting permanent protection plus an asset that grows over time."
    },
    {
      question: "What happens if I stop paying premiums?",
      answer: "If you've built sufficient cash value, you may have options: use cash value to pay premiums temporarily, convert to a reduced 'paid-up' policy with no more premiums required, or receive the accumulated cash value (surrender value). Policies differ, so review your specific contract."
    },
    {
      question: "Are whole life insurance proceeds taxable?",
      answer: "The death benefit paid to beneficiaries is generally income tax-free. Cash value grows tax-deferred. Policy loans are not considered taxable income. However, if you surrender the policy for its cash value, any gains above your total premiums paid may be taxable."
    },
    {
      question: "Can I use whole life insurance for retirement?",
      answer: "Yes, whole life can be part of a retirement strategy. The cash value grows tax-deferred, and you can take tax-free policy loans for retirement income. However, whole life shouldn't replace traditional retirement accounts—it's best used as a supplement for those who've maxed out other options."
    }
  ];

  const trustStats = [
    { value: "150+", label: "Years of Industry" },
    { value: "$1.2T", label: "Cash Value Held" },
    { value: "99%", label: "Claims Paid" },
    { value: "4.8/5", label: "Customer Rating" }
  ];

  const bigStats = [
    { value: "$285", label: "Average Monthly Cost", sublabel: "For $250K coverage, age 35" },
    { value: "$67K", label: "Cash Value at Year 20", sublabel: "Guaranteed growth you can access" },
    { value: "Forever", label: "Coverage Duration", sublabel: "Protection that never expires" }
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
                Whole Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Protection + Savings.
                <span className="text-heritage-accent"> For Life.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Build guaranteed cash value while protecting your family forever.
                Permanent coverage with premiums that never increase.
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
                    <h3 className="text-xl font-bold text-gray-900">See Your Cash Value Grow</h3>
                    <p className="text-gray-500">Instant policy illustration</p>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age: <span className="text-heritage-primary font-bold">{age}</span></label>
                    <input
                      type="range"
                      min="25"
                      max="60"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>25</span>
                      <span>60</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[100000, 250000, 500000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setCoverageAmount(amount)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            coverageAmount === amount
                              ? 'bg-heritage-primary text-white shadow-lg scale-105'
                              : 'bg-[#f5f0e8] text-gray-700 hover:bg-heritage-primary/10'
                          }`}
                        >
                          ${(amount / 1000).toLocaleString()}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl mb-4">
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm mb-1">Estimated Monthly Premium</p>
                    <p className="text-5xl font-bold text-white">${calculatePremium()}<span className="text-xl">/mo</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#f5f0e8] rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Cash Value Year 10</p>
                    <p className="text-2xl font-bold text-heritage-primary">${calculateCashValue(10).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#f5f0e8] rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Cash Value Year 20</p>
                    <p className="text-2xl font-bold text-heritage-accent">${calculateCashValue(20).toLocaleString()}</p>
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

      {/* What is Whole Life Section */}
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
                What is Whole Life Insurance?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Whole life insurance is permanent coverage that protects your family for your entire
                lifetime. Unlike term insurance, it never expires and includes a cash value component
                that grows over time at a guaranteed rate.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every premium payment serves a dual purpose: maintaining your death benefit protection
                AND building cash value you can access during your lifetime. It's protection and
                savings combined into one powerful financial tool.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Coverage that never expires—guaranteed for life",
                  "Guaranteed cash value growth at a fixed rate",
                  "Premiums that never increase, ever",
                  "Tax-advantaged growth and death benefit",
                  "Borrow against your cash value anytime",
                  "Dividend potential from participating policies"
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
              <div className="h-[500px] bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <PiggyBank className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Family Legacy Image</p>
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
              Why Choose Whole Life Insurance?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whole life offers unique advantages that no other financial product can match.
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

      {/* Sample Rates Table */}
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
              Sample Monthly Rates & Cash Value
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how whole life insurance builds wealth over time. Rates for preferred non-smokers.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-x-auto"
          >
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Age</th>
                  <th className="p-4 text-center font-semibold">Coverage</th>
                  <th className="p-4 text-center font-semibold">Monthly</th>
                  <th className="p-4 text-center font-semibold">Cash Value Yr 10</th>
                  <th className="p-4 text-center font-semibold">Cash Value Yr 20</th>
                </tr>
              </thead>
              <tbody>
                {sampleRates.map((rate, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">{rate.age}</td>
                    <td className="p-4 text-center text-gray-600">{rate.coverage}</td>
                    <td className="p-4 text-center font-bold text-heritage-primary text-lg">{rate.monthly}</td>
                    <td className="p-4 text-center font-semibold text-gray-700">{rate.cashValue10}</td>
                    <td className="p-4 text-center font-bold text-heritage-accent">{rate.cashValue20}</td>
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
            *Rates and values are illustrative. Actual results may vary based on carrier and policy terms.
          </motion.p>
        </div>
      </section>

      {/* Who Should Consider */}
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
              Who Should Consider Whole Life?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Whole life is ideal for those with permanent protection needs and long-term financial goals.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {whoShouldConsider.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
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
              Whole Life vs. Term Life
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Compare the two most popular types of life insurance to find your best fit.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto border border-[#e8e0d5]"
          >
            <div className="grid grid-cols-3 bg-heritage-primary text-white p-4 font-semibold">
              <div>Feature</div>
              <div className="text-center">Whole Life</div>
              <div className="text-center">Term Life</div>
            </div>
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center text-heritage-primary font-semibold">{row.whole}</div>
                <div className="text-center text-gray-600">{row.term}</div>
              </div>
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
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
              "I bought my whole life policy 15 years ago. Last year, I borrowed against the cash
              value to help my daughter with her first home down payment—and my coverage stayed
              intact. It's like having a savings account that also protects my family."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">RK</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Robert K.</p>
                <p className="text-gray-500">Business Owner, Policyholder Since 2009</p>
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
              Get answers to common questions about whole life insurance.
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
              Build Lifelong Protection & Wealth
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Discover how whole life insurance can fit into your long-term financial plan.
              Get a personalized illustration today.
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
