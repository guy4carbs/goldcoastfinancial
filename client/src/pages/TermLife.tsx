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
  Award,
  Calculator,
  Zap
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

export default function TermLife() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(20);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [age, setAge] = useState(35);

  const calculatePremium = () => {
    const baseRate = 0.15;
    const ageMultiplier = 1 + ((age - 25) * 0.03);
    const termMultiplier = 1 + ((selectedTerm - 10) * 0.02);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    return Math.round(monthly);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Lowest Premiums",
      description: "Get the most coverage for your money with rates starting as low as $15/month."
    },
    {
      icon: Shield,
      title: "Guaranteed Protection",
      description: "Your rates and coverage are locked in for the entire term - no surprises."
    },
    {
      icon: Clock,
      title: "Flexible Terms",
      description: "Choose 10, 15, 20, 25, or 30-year terms to match your protection needs."
    },
    {
      icon: Zap,
      title: "Quick Approval",
      description: "Many policies approved in 24-48 hours with no medical exam options available."
    }
  ];

  const termOptions = [10, 15, 20, 25, 30];

  const sampleRates = [
    { age: "25", coverage: "$250K", term10: "$12", term20: "$15", term30: "$19" },
    { age: "30", coverage: "$250K", term10: "$13", term20: "$16", term30: "$22" },
    { age: "35", coverage: "$500K", term10: "$18", term20: "$25", term30: "$35" },
    { age: "40", coverage: "$500K", term10: "$24", term20: "$35", term30: "$52" },
    { age: "45", coverage: "$500K", term10: "$35", term20: "$52", term30: "$78" },
    { age: "50", coverage: "$500K", term10: "$52", term20: "$78", term30: "$115" }
  ];

  const whoShouldConsider = [
    {
      icon: Users,
      title: "Young Families",
      description: "Protect your children's future and replace your income during their most dependent years."
    },
    {
      icon: Heart,
      title: "New Homeowners",
      description: "Ensure your mortgage is paid off so your family can keep their home."
    },
    {
      icon: TrendingUp,
      title: "Income Earners",
      description: "Replace 10-12x your annual income to maintain your family's lifestyle."
    },
    {
      icon: Award,
      title: "Budget-Conscious",
      description: "Get maximum coverage at the lowest cost while you need protection most."
    }
  ];

  const comparisonData = [
    { feature: "Monthly Cost (Age 35, $500K)", term: "$25-35", whole: "$350-450" },
    { feature: "Coverage Duration", term: "10-30 years", whole: "Lifetime" },
    { feature: "Cash Value", term: "No", whole: "Yes" },
    { feature: "Premium Changes", term: "Fixed for term", whole: "Fixed for life" },
    { feature: "Best For", term: "Temporary needs", whole: "Permanent needs" }
  ];

  const faqs = [
    {
      question: "What is term life insurance?",
      answer: "Term life insurance provides coverage for a specific period (10, 15, 20, 25, or 30 years). If you pass away during the term, your beneficiaries receive the death benefit tax-free. It's the most affordable type of life insurance, making it ideal for families who need maximum coverage at the lowest cost."
    },
    {
      question: "How much term life insurance do I need?",
      answer: "A common rule is 10-12 times your annual income. Consider your mortgage balance, children's education costs, outstanding debts, and how many years your family would need income replacement. Our quote calculator can help you determine the right amount for your situation."
    },
    {
      question: "What happens when my term expires?",
      answer: "When your term ends, you typically have three options: let the policy expire if you no longer need coverage, renew at a higher rate (often guaranteed renewable), or convert to a permanent policy without a new medical exam (if your policy has a conversion option)."
    },
    {
      question: "Can I get term life insurance without a medical exam?",
      answer: "Yes! Many carriers offer 'no-exam' or 'simplified issue' term policies. While premiums may be slightly higher, you can get coverage quickly without blood tests or doctor visits. Coverage amounts typically max out at $500,000-$1,000,000 for no-exam policies."
    },
    {
      question: "Is term life insurance tax-free?",
      answer: "Yes, the death benefit paid to your beneficiaries is generally income tax-free. This means if you have a $500,000 policy, your family receives the full $500,000. This is one of the most significant advantages of life insurance."
    },
    {
      question: "Can I cancel my term life insurance?",
      answer: "Yes, you can cancel anytime with no penalties. Term life has no cash value, so there's nothing to withdraw. Simply stop paying premiums and the policy will lapse. Some policies offer a return of premium option where you get your premiums back if you outlive the term."
    }
  ];

  const trustStats = [
    { value: "500K+", label: "Families Protected" },
    { value: "$50B+", label: "Coverage Issued" },
    { value: "98%", label: "Claims Paid" },
    { value: "4.9/5", label: "Customer Rating" }
  ];

  const bigStats = [
    { value: "$25", label: "Average Monthly Cost", sublabel: "For $500K coverage, age 35" },
    { value: "10-30", label: "Year Terms Available", sublabel: "Choose what fits your needs" },
    { value: "24hrs", label: "Fast Approval", sublabel: "Many policies approved same-day" }
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
                Term Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Maximum Protection.
                <span className="text-heritage-accent"> Minimum Cost.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Protect your family with affordable coverage that fits your budget.
                Get up to $1 million in coverage for less than $1 a day.
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[250000, 500000, 1000000].map((amount) => (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term Length</label>
                    <div className="grid grid-cols-5 gap-2">
                      {termOptions.map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
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

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Estimated Monthly Premium</p>
                  <p className="text-5xl font-bold text-white mb-1">${calculatePremium()}<span className="text-xl">/mo</span></p>
                  <p className="text-heritage-accent text-sm font-medium">Just ${(calculatePremium() / 30).toFixed(2)}/day to protect your family</p>
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

      {/* What is Term Life Section */}
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
                What is Term Life Insurance?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Term life insurance provides a death benefit for a specific period of time - your "term."
                If you pass away during the term, your beneficiaries receive the full death benefit
                tax-free. It's the most straightforward and affordable type of life insurance.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Think of it as "renting" protection for the years you need it most - while raising
                children, paying off a mortgage, or building retirement savings.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Coverage amounts from $100,000 to $10,000,000",
                  "Terms of 10, 15, 20, 25, or 30 years",
                  "Premiums locked in for entire term",
                  "Tax-free death benefit to beneficiaries",
                  "No medical exam options available",
                  "Convert to permanent coverage anytime"
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
                  <Shield className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Happy Family Image</p>
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
              Why Choose Term Life Insurance?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Term life offers the most coverage for the lowest cost, making it the #1 choice for families.
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
              Sample Monthly Rates
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how affordable term life insurance can be. Rates shown are for healthy non-smokers.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-5 bg-heritage-primary text-white p-4 font-semibold text-center">
              <div>Age</div>
              <div>Coverage</div>
              <div>10-Year</div>
              <div>20-Year</div>
              <div>30-Year</div>
            </div>
            {sampleRates.map((rate, index) => (
              <div
                key={index}
                className={`grid grid-cols-5 p-4 text-center items-center ${index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{rate.age}</div>
                <div className="text-gray-600">{rate.coverage}</div>
                <div className="font-bold text-heritage-primary text-lg">{rate.term10}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <div className="font-bold text-heritage-primary text-lg">{rate.term20}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <div className="font-bold text-heritage-primary text-lg">{rate.term30}<span className="text-sm font-normal text-gray-500">/mo</span></div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            *Rates are illustrative for healthy non-smokers. Your rate may vary. Get a personalized quote for exact pricing.
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
              Who Should Consider Term Life?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Term life insurance is ideal for anyone who needs affordable protection for a specific period.
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
              Term Life vs. Whole Life
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understand the key differences to choose the right coverage for your needs.
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
              <div className="text-center">Term Life</div>
              <div className="text-center">Whole Life</div>
            </div>
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center text-heritage-primary font-semibold">{row.term}</div>
                <div className="text-center text-gray-600">{row.whole}</div>
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
              "I was paying $85/month for a $250,000 policy through work. Heritage found me a
              $500,000 policy for just $32/month. That's double the coverage for less than half
              the price. My family is now fully protected."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">MJ</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Michael J.</p>
                <p className="text-gray-500">Father of 3, Protected Since 2023</p>
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
              Get answers to common questions about term life insurance.
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
              Protect Your Family Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Get a free quote in minutes. No obligation, no pressure.
              Just honest advice to protect the people you love.
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
