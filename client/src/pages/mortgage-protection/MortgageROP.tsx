import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  RefreshCcw,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  DollarSign,
  Shield,
  PiggyBank,
  Award,
  TrendingUp,
  Calendar,
  Percent,
  ArrowRight
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

export default function MortgageROP() {
  const [coverage, setCoverage] = useState(300000);
  const [term, setTerm] = useState(20);
  const [age, setAge] = useState(35);
  const [showRefund, setShowRefund] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Premium calculations
  const standardPremium = Math.round((coverage / 1000) * (0.4 + age * 0.02));
  const ropPremium = Math.round(standardPremium * 1.35);
  const totalStandardPaid = standardPremium * 12 * term;
  const totalRopPaid = ropPremium * 12 * term;
  const refundAmount = totalRopPaid;
  const extraCost = totalRopPaid - totalStandardPaid;

  const benefits = [
    {
      icon: RefreshCcw,
      title: "100% Premium Refund",
      description: "Get every dollar back if you outlive the policy"
    },
    {
      icon: Shield,
      title: "Full Protection",
      description: "Same death benefit as standard term insurance"
    },
    {
      icon: PiggyBank,
      title: "Forced Savings",
      description: "Guaranteed lump sum at end of term"
    },
    {
      icon: TrendingUp,
      title: "No Market Risk",
      description: "Refund is guaranteed regardless of economy"
    }
  ];

  const comparison = [
    { feature: "Monthly Premium", standard: `$${standardPremium}`, rop: `$${ropPremium}` },
    { feature: "Total Paid (${term} years)", standard: `$${totalStandardPaid.toLocaleString()}`, rop: `$${totalRopPaid.toLocaleString()}` },
    { feature: "If You Die", standard: `$${coverage.toLocaleString()}`, rop: `$${coverage.toLocaleString()}` },
    { feature: "If You Outlive", standard: "$0", rop: `$${refundAmount.toLocaleString()}` },
    { feature: "Net Cost", standard: `$${totalStandardPaid.toLocaleString()}`, rop: `$${extraCost.toLocaleString()}` }
  ];

  const scenarios = [
    {
      title: "You Pass Away",
      standard: "Family receives death benefit",
      rop: "Family receives death benefit",
      winner: "tie"
    },
    {
      title: "You Outlive Policy",
      standard: "Nothing—premiums are gone",
      rop: "100% of premiums returned",
      winner: "rop"
    },
    {
      title: "You Cancel Early",
      standard: "Nothing—premiums are gone",
      rop: "Partial refund (varies by carrier)",
      winner: "rop"
    }
  ];

  const faqs = [
    {
      question: "Is ROP worth the extra cost?",
      answer: "It depends on your priorities. ROP costs 25-40% more but guarantees you get money back. If you'd otherwise invest that difference and earn 6%+ returns, standard term may be better. But if you value the guaranteed return and forced savings, ROP provides peace of mind."
    },
    {
      question: "What if I cancel my ROP policy early?",
      answer: "Most ROP policies offer partial refunds after a certain period (often 10+ years). The longer you've paid, the more you get back. Check your specific policy's schedule. Canceling in the first few years typically returns nothing."
    },
    {
      question: "Are the returned premiums taxable?",
      answer: "No. The premium refund is considered a return of your own money, not income or gains. You won't owe federal income tax on the refund. It's one of the tax advantages of ROP."
    },
    {
      question: "Can I get ROP on any term length?",
      answer: "ROP is most commonly available on 20 and 30-year terms. Some carriers offer 15-year ROP. Shorter terms (10 years) rarely have ROP options because the math doesn't work well for insurers."
    },
    {
      question: "What happens to the refund if I die near the end?",
      answer: "Your beneficiaries receive the death benefit, not the premium refund. The death benefit is always higher than the refund, so your family is better protected either way."
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
                <RefreshCcw className="w-4 h-4" />
                Return of Premium
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                Get Your Premiums
                <span className="block text-violet-500">Back—Guaranteed</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                Protect your mortgage and get every dollar back if you outlive your policy. The only coverage where you can't lose.
              </p>

              <div className="space-y-3 mb-8">
                {["100% premium refund at end of term", "Same death benefit as standard term", "Tax-free refund—no income tax owed"].map((item, i) => (
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
                    Get ROP Quote
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

            {/* ROP Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">ROP Calculator</h3>
                <p className="text-gray-600 text-sm">See your potential refund</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-violet-500 font-bold">${coverage.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="750000"
                    step="25000"
                    value={coverage}
                    onChange={(e) => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length: <span className="text-violet-500 font-bold">{term} years</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 20, 30].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          term === t
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t} Years
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-violet-500 font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="55"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Animated Refund Reveal */}
                <motion.button
                  onClick={() => setShowRefund(!showRefund)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 rounded-xl font-semibold"
                >
                  {showRefund ? 'Hide Details' : 'Calculate My Refund'}
                </motion.button>

                <AnimatePresence>
                  {showRefund && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">ROP Monthly Premium</p>
                            <p className="text-2xl font-bold text-primary">${ropPremium}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Standard Monthly</p>
                            <p className="text-2xl font-bold text-gray-400">${standardPremium}</p>
                          </div>
                        </div>

                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                          <p className="text-sm text-green-700 mb-2">Your Guaranteed Refund</p>
                          <motion.p
                            className="text-4xl font-bold text-green-600"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            ${refundAmount.toLocaleString()}
                          </motion.p>
                          <p className="text-xs text-green-600 mt-2">If you outlive your {term}-year policy</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Net Cost:</span> Only ${extraCost.toLocaleString()} extra over {term} years for guaranteed return
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get My ROP Quote
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
              { value: "100%", label: "Premium Refund" },
              { value: "25-40%", label: "Higher Premium" },
              { value: "$0", label: "Tax on Refund" },
              { value: "20-30yr", label: "Available Terms" }
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

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Why Return of Premium?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              The peace of mind knowing your money isn't "wasted" if you outlive your policy.
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

      {/* Comparison Table */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Standard vs. ROP
            </h2>
            <p className="text-gray-600">Based on ${coverage.toLocaleString()} coverage, {term}-year term, age {age}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-gray-200"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Standard Term</th>
                  <th className="text-center p-4 font-semibold bg-violet-500">Return of Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 text-gray-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-gray-600">{row.standard}</td>
                    <td className="p-4 text-center text-violet-500 font-semibold bg-green-50">{row.rop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              What Happens When...
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {scenarios.map((scenario, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#fffaf3] rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-primary mb-4">{scenario.title}</h3>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Standard Term</p>
                    <p className="text-sm text-gray-700">{scenario.standard}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${scenario.winner === 'rop' || scenario.winner === 'tie' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500 mb-1">Return of Premium</p>
                    <p className={`text-sm ${scenario.winner === 'rop' ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>{scenario.rop}</p>
                  </div>
                </div>
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
              "I paid $180/month for 20 years—$43,200 total. Just got my check for $43,200 back. It's like I had free life insurance for two decades."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">David K.</p>
                <p className="text-white/70 text-sm">ROP Policyholder, Atlanta GA</p>
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
              Get Your Money Back—Guaranteed
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              See how much you could get back with a return of premium policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your ROP Quote
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
