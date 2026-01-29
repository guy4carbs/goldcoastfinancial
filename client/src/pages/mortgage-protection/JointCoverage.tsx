import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Users,
  Shield,
  Heart,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  FileText,
  ArrowRight,
  Calculator
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

export default function JointCoverage() {
  const [mortgageAmount, setMortgageAmount] = useState(350000);
  const [spouse1Age, setSpouse1Age] = useState(35);
  const [spouse2Age, setSpouse2Age] = useState(33);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Premium calculation
  const calculatePremiums = () => {
    const baseRate = 0.15;
    const coverage = mortgageAmount / 1000;
    const avgAge = (spouse1Age + spouse2Age) / 2;
    const jointAgeMultiplier = 1 + (avgAge - 30) * 0.03;
    const jointPremium = Math.round(coverage * baseRate * jointAgeMultiplier * 0.75);

    const spouse1Multiplier = 1 + (spouse1Age - 30) * 0.03;
    const spouse2Multiplier = 1 + (spouse2Age - 30) * 0.03;
    const spouse1Premium = Math.round(coverage * baseRate * spouse1Multiplier);
    const spouse2Premium = Math.round(coverage * baseRate * spouse2Multiplier);
    const separateTotal = spouse1Premium + spouse2Premium;
    const savings = separateTotal - jointPremium;
    const savingsPercent = Math.round((savings / separateTotal) * 100);

    return { jointPremium, spouse1Premium, spouse2Premium, separateTotal, savings, savingsPercent };
  };

  const premiums = calculatePremiums();

  const benefits = [
    {
      icon: DollarSign,
      title: "Save 25-40% on Premiums",
      description: "One joint policy costs significantly less than two separate policies"
    },
    {
      icon: Shield,
      title: "Full Mortgage Payoff",
      description: "Complete protection ensures your mortgage is paid in full"
    },
    {
      icon: Heart,
      title: "Survivor Protection",
      description: "Surviving spouse keeps the home without financial burden"
    },
    {
      icon: Clock,
      title: "Simplified Management",
      description: "One policy, one premium payment, one beneficiary to manage"
    }
  ];

  const idealFor = [
    "Married couples with a shared mortgage",
    "Partners who want to maximize coverage efficiency",
    "Families looking to reduce insurance costs",
    "Homeowners who want streamlined paperwork",
    "Couples with similar health profiles"
  ];

  const considerations = [
    {
      title: "First-to-Die Coverage",
      description: "Policy pays out when the first spouse passes. Surviving spouse may need individual coverage after."
    },
    {
      title: "Health Underwriting",
      description: "Both spouses are underwritten. One spouse's health issues may affect the joint rate."
    },
    {
      title: "Divorce Considerations",
      description: "Joint policies may need to be split or converted if circumstances change."
    }
  ];

  const faqs = [
    {
      question: "How does joint mortgage protection work?",
      answer: "Joint mortgage protection covers both spouses under one policy. When the first spouse passes away, the policy pays off the mortgage, protecting the surviving spouse. This is called 'first-to-die' coverage."
    },
    {
      question: "Is joint coverage cheaper than separate policies?",
      answer: "Yes, typically 25-40% cheaper. You're only insuring one payout event (the first death), so premiums are lower than maintaining two separate policies."
    },
    {
      question: "What happens after the first spouse passes?",
      answer: "The policy pays the death benefit to cover the mortgage. The surviving spouse may want to consider purchasing individual coverage at that point for continued protection."
    },
    {
      question: "Can we convert to separate policies later?",
      answer: "Many joint policies offer conversion options. You can often split into two individual policies if circumstances change, like divorce or different coverage needs."
    },
    {
      question: "What if we have different health conditions?",
      answer: "Joint policies consider both applicants' health. If one spouse has health issues, separate policies might be more cost-effective, with the healthier spouse getting better rates."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Joint Mortgage Protection
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                One Policy,
                <span className="block text-violet-500">Two Lives Protected</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                Joint mortgage protection covers both spouses under a single policy, saving you money while ensuring your home stays in the family.
              </p>

              <div className="space-y-3 mb-8">
                {["Save 25-40% compared to separate policies", "Full mortgage payoff when needed most", "Simplified management with one policy"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    Get Joint Quote
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:+1234567890">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Speak to an Agent
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Joint Premium Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Joint vs Separate Calculator</h3>
                <p className="text-gray-600 text-sm">See how much you could save together</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortgage Amount: <span className="text-violet-500 font-bold">${mortgageAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="1000000"
                    step="25000"
                    value={mortgageAmount}
                    onChange={(e) => setMortgageAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$100K</span>
                    <span>$1M</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse 1 Age: <span className="text-violet-500 font-bold">{spouse1Age}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="65"
                      value={spouse1Age}
                      onChange={(e) => setSpouse1Age(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse 2 Age: <span className="text-violet-500 font-bold">{spouse2Age}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="65"
                      value={spouse2Age}
                      onChange={(e) => setSpouse2Age(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs opacity-75 mb-1">Joint Policy</p>
                      <p className="text-3xl font-bold">${premiums.jointPremium}</p>
                      <p className="text-xs opacity-75">/month</p>
                    </div>
                    <div className="text-center border-l border-white/20">
                      <p className="text-xs opacity-75 mb-1">Separate Policies</p>
                      <p className="text-3xl font-bold">${premiums.separateTotal}</p>
                      <p className="text-xs opacity-75">/month</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-sm">You Save <span className="font-bold text-lg">${premiums.savings}/mo</span> ({premiums.savingsPercent}%)</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Annual Savings</p>
                      <p className="text-xs text-green-700 mt-1">Save ${premiums.savings * 12}/year with joint coverage</p>
                    </div>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Your Joint Quote
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "25-40%", label: "Premium Savings" },
              { value: "100%", label: "Mortgage Payoff" },
              { value: "1", label: "Policy to Manage" },
              { value: "2", label: "Lives Protected" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-violet-500">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Why Couples Choose Joint Coverage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Protect your home and each other with streamlined, affordable coverage.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Comparison Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Joint vs Separate: Side by Side
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              See exactly how joint coverage compares to maintaining two separate policies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Joint Policy Card */}
                <div className="p-6 rounded-xl border-2 border-violet-500 bg-violet-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-violet-500" />
                      <h3 className="font-bold text-lg text-primary">Joint Policy</h3>
                    </div>
                    <span className="bg-violet-500 text-white text-xs px-3 py-1 rounded-full">Recommended</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-500" />
                      <span className="text-gray-700">One simple application</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-500" />
                      <span className="text-gray-700">Single monthly payment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-500" />
                      <span className="text-gray-700">25-40% lower premiums</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-500" />
                      <span className="text-gray-700">Full mortgage coverage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-500" />
                      <span className="text-gray-700">Easier to manage</span>
                    </li>
                  </ul>
                </div>

                {/* Separate Policies Card */}
                <div className="p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-6 h-6 text-gray-500" />
                    <h3 className="font-bold text-lg text-primary">Separate Policies</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      <span className="text-gray-600">Two separate applications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      <span className="text-gray-600">Multiple payment dates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      <span className="text-gray-600">Higher combined cost</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      <span className="text-gray-600">Double the coverage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      <span className="text-gray-600">More paperwork</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    Compare Your Exact Rates
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
                Ideal For Couples Who...
              </h2>
              <div className="space-y-4">
                {idealFor.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
                  alt="Happy couple with their home"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Save 25-40%</p>
                    <p className="text-xs text-gray-500">vs separate policies</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Important Considerations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Important to Know
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Understand the key aspects of joint mortgage protection coverage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {considerations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-amber-50 border border-amber-100 rounded-xl p-6"
              >
                <AlertCircle className="w-8 h-8 text-amber-600 mb-4" />
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              How Joint Coverage Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Apply Together", description: "Both spouses complete one joint application", icon: FileText },
              { step: "2", title: "Get Approved", description: "Underwriting considers both applicants", icon: CheckCircle },
              { step: "3", title: "One Premium", description: "Single monthly payment covers both lives", icon: DollarSign },
              { step: "4", title: "Protected", description: "Mortgage paid off at first death", icon: Shield }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {i < 3 && (
                  <ArrowRight className="w-6 h-6 text-violet-500/30 mx-auto mt-4 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-violet-500" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "We saved over $80 a month switching to a joint policy. One less thing to manage, and we both sleep better knowing our home is protected."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Sarah & Michael R.</p>
                <p className="text-white/70 text-sm">Joint policyholders, Dallas TX</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
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
                  <span className="font-semibold text-primary pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-violet-500 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
              Protect Your Home Together
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              Get a joint quote in minutes and see how much you can save as a couple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Joint Quote
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:+1234567890">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call (555) 123-4567
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
