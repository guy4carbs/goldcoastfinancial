import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Wallet,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Shield,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Lock,
  DollarSign,
  Award,
  Clock,
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

export default function CashValue() {
  const [monthlyPremium, setMonthlyPremium] = useState(300);
  const [years, setYears] = useState(20);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculateCashValue = (yr: number) => {
    const annualPremium = monthlyPremium * 12;
    const totalPremiums = annualPremium * yr;
    const efficiency = yr < 10 ? 0.35 + (yr * 0.04) : 0.6 + ((yr - 10) * 0.025);
    const growthMultiplier = Math.pow(1.045, yr);
    return Math.round(totalPremiums * efficiency * growthMultiplier);
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Guaranteed Growth",
      description: "Cash value grows at a guaranteed minimum rate, regardless of market conditions"
    },
    {
      icon: Shield,
      title: "Tax-Deferred",
      description: "No taxes on growth while it accumulates inside your policy"
    },
    {
      icon: CreditCard,
      title: "Easy Access",
      description: "Borrow against your cash value anytime—no credit check or approval needed"
    },
    {
      icon: Lock,
      title: "Protected Asset",
      description: "Cash value is protected from creditors in most states"
    }
  ];

  const commonUses = [
    "Emergency fund for unexpected expenses",
    "Supplement retirement income",
    "Pay for a child's education",
    "Down payment on a home",
    "Start or invest in a business",
    "Pay off high-interest debt",
    "Cover medical expenses",
    "Fund a major purchase"
  ];

  const faqs = [
    {
      question: "How quickly does cash value build?",
      answer: "Slowly at first—most early premiums cover insurance costs. Significant accumulation typically starts after year 7-10. After 15-20 years, cash value often exceeds total premiums paid."
    },
    {
      question: "How do policy loans work?",
      answer: "You borrow from the insurer using your cash value as collateral. No credit check, no approval needed, no fixed repayment schedule. Interest accrues on unpaid loans, and unpaid balance is deducted from the death benefit."
    },
    {
      question: "Are withdrawals taxed?",
      answer: "Withdrawals up to your cost basis (total premiums paid) are tax-free. Gains above basis are taxable. Policy loans aren't taxed since they're technically loans, not withdrawals."
    },
    {
      question: "What happens to cash value when I die?",
      answer: "Beneficiaries receive the death benefit, not the cash value separately—they don't stack. Some policies offer riders to include cash value in the payout."
    },
    {
      question: "Can I lose my cash value?",
      answer: "No. Cash value in whole life is guaranteed and can never decrease due to market conditions. It only grows. You could lose it if the policy lapses due to non-payment."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Wallet className="w-4 h-4" />
                Cash Value
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Build Wealth
                <span className="block text-heritage-accent">Inside Your Policy</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whole life insurance does more than protect—it builds tax-deferred savings you can access anytime. No credit checks, no approval process, no questions asked.
              </p>

              <div className="space-y-3 mb-8">
                {["Guaranteed growth rate every year", "Tax-deferred accumulation", "Borrow anytime without credit checks"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    Get Your Quote
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="tel:6307780800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (630) 778-0800
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Cash Value Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Cash Value Calculator</h3>
                <p className="text-gray-600 text-sm">See how your savings could grow</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Premium: <span className="text-heritage-accent font-bold">${monthlyPremium}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={monthlyPremium}
                    onChange={(e) => setMonthlyPremium(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$100</span>
                    <span>$1,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years: <span className="text-heritage-accent font-bold">{years}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 years</span>
                    <span>30 years</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Projected Cash Value</p>
                  <p className="text-4xl font-bold">${calculateCashValue(years).toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-2">After {years} years at ${monthlyPremium}/month</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Premiums</p>
                    <p className="text-lg font-bold text-heritage-primary">${(monthlyPremium * 12 * years).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Cash Value Ratio</p>
                    <p className="text-lg font-bold text-heritage-accent">
                      {Math.round((calculateCashValue(years) / (monthlyPremium * 12 * years)) * 100)}%
                    </p>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Personalized Illustration
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "4-5%", label: "Typical Growth Rate" },
              { value: "Tax-Free", label: "Policy Loans" },
              { value: "0%", label: "Market Risk" },
              { value: "Lifetime", label: "Guaranteed Access" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-heritage-accent">{stat.value}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Why Cash Value Matters
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your whole life policy is more than protection—it's a financial asset that grows every year.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-heritage-accent" />
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              How Cash Value Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Pay Premiums", description: "Part of each payment builds cash value", icon: DollarSign },
              { step: "2", title: "Value Grows", description: "Guaranteed growth rate every year", icon: TrendingUp },
              { step: "3", title: "Access Anytime", description: "Borrow against it whenever you need", icon: CreditCard },
              { step: "4", title: "Keep Protection", description: "Death benefit stays intact", icon: Shield }
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
                  <div className="w-16 h-16 bg-heritage-accent rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Uses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Use Your Cash Value for Anything
              </h2>
              <p className="text-gray-600 mb-6">
                Unlike retirement accounts with penalties and restrictions, your cash value is accessible anytime for any purpose.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {commonUses.map((use, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-heritage-accent flex-shrink-0" />
                    <span className="text-sm text-gray-700">{use}</span>
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
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 flex items-center justify-center">
                <PiggyBank className="w-32 h-32 text-heritage-primary/30" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary text-sm">No Restrictions</p>
                    <p className="text-xs text-gray-500">Your money, your choice</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-6 h-6 text-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "When I needed $30,000 for my daughter's wedding, I borrowed against my policy in 3 days. No bank, no credit check, no hassle. The money was just there."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-heritage-accent/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">TM</span>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Thomas M.</p>
                <p className="text-white/70 text-sm">Policy holder for 18 years</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
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
                  <span className="font-semibold text-heritage-primary pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-heritage-accent transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
              Start Building Cash Value Today
            </h2>
            <p className="text-gray-600 mb-8">
              Get a personalized illustration showing how cash value could work for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free Quote
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  (630) 778-0800
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
