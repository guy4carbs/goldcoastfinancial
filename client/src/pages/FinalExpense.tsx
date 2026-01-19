import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  Star,
  FileText,
  Sparkles,
  HandHeart,
  Calendar,
  BadgeCheck,
  Banknote,
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

export default function FinalExpense() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageAmount, setCoverageAmount] = useState(15000);
  const [age, setAge] = useState(65);

  const calculatePremium = () => {
    const baseRate = 0.45;
    const ageMultiplier = 1 + ((age - 50) * 0.035);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier);
    return Math.round(monthly);
  };

  const trustStats = [
    { value: "200K+", label: "Seniors Protected" },
    { value: "$2.5B", label: "Benefits Paid" },
    { value: "100%", label: "Guaranteed Issue" },
    { value: "4.9/5", label: "Customer Rating" }
  ];

  const bigStats = [
    { value: "$52", label: "Average Monthly Cost", sublabel: "For $15K coverage, age 65" },
    { value: "$5-35K", label: "Coverage Range", sublabel: "Flexible amounts for your needs" },
    { value: "Same Day", label: "Approval Speed", sublabel: "No medical exam required" }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Guaranteed Acceptance",
      description: "Many plans available with no medical exam and guaranteed approval for ages 50-85."
    },
    {
      icon: Clock,
      title: "Quick & Easy Process",
      description: "Simple application that takes just minutes to complete with same-day approval available."
    },
    {
      icon: DollarSign,
      title: "Affordable Premiums",
      description: "Low monthly payments that fit any budget, with rates that never increase."
    },
    {
      icon: Heart,
      title: "Peace of Mind",
      description: "Ensure your loved ones aren't burdened with final expenses during a difficult time."
    }
  ];

  const coverageItems = [
    { item: "Funeral & burial costs", typical: "$7,000 - $12,000" },
    { item: "Cremation services", typical: "$4,000 - $7,000" },
    { item: "Casket & burial vault", typical: "$2,000 - $5,000" },
    { item: "Headstone or marker", typical: "$1,000 - $3,000" },
    { item: "Cemetery plot", typical: "$1,000 - $4,000" },
    { item: "Flowers & memorial", typical: "$500 - $2,000" },
    { item: "Medical bills", typical: "Varies" },
    { item: "Outstanding debts", typical: "Varies" }
  ];

  const planTypes = [
    {
      name: "Simplified Issue",
      description: "Answer a few health questions - no medical exam required",
      features: [
        "Coverage from $5,000 to $35,000",
        "Ages 50-80 eligible",
        "Full coverage from day one",
        "Competitive rates"
      ],
      bestFor: "Those in good to moderate health"
    },
    {
      name: "Guaranteed Issue",
      description: "No health questions, no medical exam - everyone approved",
      features: [
        "Coverage from $5,000 to $25,000",
        "Ages 50-85 eligible",
        "Graded benefits (2-year waiting period)",
        "Cannot be denied"
      ],
      bestFor: "Those with health conditions or who've been declined before"
    },
    {
      name: "Modified Benefit",
      description: "Limited health questions with modified coverage period",
      features: [
        "Coverage from $5,000 to $30,000",
        "Ages 45-85 eligible",
        "Partial benefits first 2 years",
        "Full benefits after waiting period"
      ],
      bestFor: "Those with some health concerns"
    }
  ];

  const whoShouldConsider = [
    {
      icon: Users,
      title: "Seniors 50-85",
      description: "Adults looking to protect their families from funeral costs and final expenses."
    },
    {
      icon: Heart,
      title: "Those With Health Issues",
      description: "Guaranteed acceptance options available regardless of current health conditions."
    },
    {
      icon: HandHeart,
      title: "Caring Parents",
      description: "Parents who don't want to leave financial burdens to their children."
    },
    {
      icon: Banknote,
      title: "Fixed Income Households",
      description: "Affordable coverage that fits within retirement or fixed income budgets."
    }
  ];

  const faqs = [
    {
      question: "What is final expense insurance?",
      answer: "Final expense insurance, also known as burial insurance or funeral insurance, is a type of whole life insurance designed specifically to cover end-of-life costs. These policies typically range from $5,000 to $35,000 and are intended to pay for funeral services, burial or cremation, and other final expenses so your family doesn't have to."
    },
    {
      question: "Do I need a medical exam for final expense insurance?",
      answer: "Most final expense policies do not require a medical exam. Simplified issue policies ask a few health questions, while guaranteed issue policies have no health questions at all and cannot deny coverage. This makes final expense insurance accessible even to those with health conditions."
    },
    {
      question: "What's the difference between final expense and traditional life insurance?",
      answer: "Final expense insurance has lower coverage amounts (typically $5,000-$35,000 vs. $100,000+), simpler underwriting with no medical exams, is designed for seniors 50-85, and specifically targets end-of-life costs. Traditional life insurance provides larger death benefits for income replacement and long-term family protection."
    },
    {
      question: "How much does final expense insurance cost?",
      answer: "Final expense insurance is quite affordable. Monthly premiums typically range from $20 to $100 depending on your age, health, coverage amount, and plan type. A healthy 65-year-old might pay around $50-70/month for $15,000 in coverage. Rates are locked in and never increase."
    },
    {
      question: "What is a graded benefit policy?",
      answer: "A graded benefit policy, common with guaranteed issue plans, has a waiting period (usually 2 years) before full death benefits are paid. If death occurs during this period from natural causes, beneficiaries typically receive a return of premiums paid plus interest (often 10%). After the waiting period, full benefits apply. Accidental death is usually covered in full from day one."
    },
    {
      question: "Can my family use the death benefit for anything?",
      answer: "Yes! Unlike pre-paid funeral plans that can only be used with specific funeral homes, final expense insurance pays a cash benefit directly to your beneficiary. They can use it for funeral costs, medical bills, credit card debt, mortgage payments, or any other expenses they see fit."
    }
  ];

  const sampleRates = [
    { age: "55", male: "$32", female: "$28", coverage: "$10,000" },
    { age: "60", male: "$45", female: "$38", coverage: "$10,000" },
    { age: "65", male: "$62", female: "$52", coverage: "$10,000" },
    { age: "70", male: "$85", female: "$72", coverage: "$10,000" },
    { age: "75", male: "$118", female: "$98", coverage: "$10,000" }
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
                Final Expense Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Protect Your Family From
                <span className="text-heritage-accent"> Final Expenses</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Affordable coverage that ensures your loved ones aren't burdened with funeral costs, medical bills, or other end-of-life expenses. Simple to qualify, easy to afford.
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
                      min="50"
                      max="85"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>50</span>
                      <span>85</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5000, 10000, 15000, 25000].map((amount) => (
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

                <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-2xl text-center">
                  <p className="text-white/80 text-sm mb-1">Estimated Monthly Premium</p>
                  <p className="text-5xl font-bold text-white mb-1">${calculatePremium()}<span className="text-xl">/mo</span></p>
                  <p className="text-heritage-accent text-sm font-medium">No medical exam required</p>
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

      {/* What is Final Expense Section */}
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
                What is Final Expense Insurance?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Final expense insurance is a type of whole life insurance specifically designed to cover
                end-of-life costs. With coverage amounts typically ranging from $5,000 to $35,000, these
                policies ensure your family has the funds to handle funeral arrangements, outstanding
                medical bills, and other final expenses.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Unlike traditional life insurance, final expense policies are designed for seniors ages
                50-85 and feature simplified underwriting with no medical exams required. Many plans
                offer guaranteed acceptance regardless of health conditions.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  "Coverage amounts from $5,000 to $35,000",
                  "No medical exam required",
                  "Guaranteed acceptance options available",
                  "Premiums that never increase",
                  "Benefits paid tax-free to beneficiaries",
                  "Cash benefit can be used for any purpose"
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
                  <Heart className="w-24 h-24 text-heritage-primary/30 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Caring Family Image</p>
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
              Why Choose Final Expense Insurance?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Designed specifically for seniors, final expense insurance offers unique benefits
              that make it easy and affordable to protect your family.
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

      {/* What Final Expense Covers */}
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
              What Does Final Expense Insurance Cover?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Final expense insurance provides a tax-free cash benefit that can be used for any purpose.
              Here are typical costs families face:
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 bg-heritage-primary text-white p-4 font-semibold">
              <div>Expense Type</div>
              <div className="text-right">Typical Cost</div>
            </div>
            {coverageItems.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 p-4 ${index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-heritage-accent" />
                  <span className="text-gray-700">{item.item}</span>
                </div>
                <div className="text-right font-medium text-heritage-primary">{item.typical}</div>
              </div>
            ))}
            <div className="p-4 bg-heritage-accent/10 border-t border-heritage-accent/20">
              <p className="text-center text-gray-700">
                <strong>Total Average Cost:</strong> <span className="text-heritage-primary text-xl font-bold">$15,000 - $25,000+</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plan Types */}
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
              Types of Final Expense Plans
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Choose the plan that best fits your health situation and needs.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {planTypes.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck className="w-6 h-6 text-heritage-accent" />
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-heritage-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-[#f5f0e8] rounded-xl">
                  <p className="text-sm">
                    <span className="font-semibold text-heritage-primary">Best for:</span>{" "}
                    <span className="text-gray-600">{plan.bestFor}</span>
                  </p>
                </div>
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
              See how affordable final expense insurance can be. Rates shown are for $10,000 in coverage
              with a simplified issue policy.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-4 bg-heritage-primary text-white p-4 font-semibold text-center">
              <div>Age</div>
              <div>Male</div>
              <div>Female</div>
              <div>Coverage</div>
            </div>
            {sampleRates.map((rate, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 p-4 text-center ${index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}`}
              >
                <div className="font-medium text-gray-900">{rate.age}</div>
                <div className="text-heritage-primary font-semibold">{rate.male}/mo</div>
                <div className="text-heritage-primary font-semibold">{rate.female}/mo</div>
                <div className="text-gray-600">{rate.coverage}</div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            *Rates are illustrative and may vary based on health, location, and carrier. Get a personalized quote for exact pricing.
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
              Who Should Consider Final Expense Insurance?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Final expense insurance is designed for those who want to ensure their families
              aren't burdened with end-of-life costs.
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
              "After my husband passed, I was overwhelmed with expenses I hadn't planned for.
              When my mother got her final expense policy, it gave us both peace of mind knowing
              her wishes would be taken care of without financial stress on our family."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">SM</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Susan M.</p>
                <p className="text-gray-500">Daughter & Caregiver, Age 58</p>
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
              Get answers to common questions about final expense insurance.
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
              Give Your Family Peace of Mind
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Don't leave your loved ones with the burden of final expenses.
              Get an affordable policy today with rates that never increase.
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
