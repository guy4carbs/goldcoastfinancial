import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shield,
  Lock,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Calculator,
  PiggyBank,
  Calendar,
  Award,
  Star,
  Clock,
  Percent,
  ArrowRight,
  Building2,
  Target,
  Landmark
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

export default function FixedAnnuities() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(5.0);
  const [years, setYears] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number>(5);

  // Calculate growth
  const futureValue = Math.round(principal * Math.pow(1 + rate / 100, years));
  const totalInterest = futureValue - principal;
  const effectiveMonthlyIncome = Math.round(totalInterest / (years * 12));

  // Current rates by term (sample rates - should be updated regularly)
  const termRates = [
    { term: 3, rate: 4.50, minDeposit: 10000 },
    { term: 5, rate: 5.15, minDeposit: 10000 },
    { term: 7, rate: 5.35, minDeposit: 25000 },
    { term: 10, rate: 5.50, minDeposit: 25000 }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Principal Protection",
      description: "100% protected. You cannot lose money to market declines."
    },
    {
      icon: Percent,
      title: "Guaranteed Rate",
      description: "Lock in today's rate for the entire term. No fluctuations."
    },
    {
      icon: Lock,
      title: "Tax-Deferred Growth",
      description: "No taxes on growth until you withdraw. Compounds faster."
    },
    {
      icon: PiggyBank,
      title: "Better Than CDs",
      description: "Typically 1-2% higher rates than bank CDs."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your Term",
      description: "Select 3-10 years based on your timeline.",
      icon: Calendar
    },
    {
      step: "2",
      title: "Make Your Deposit",
      description: "Transfer from savings, CDs, or IRA/401k.",
      icon: DollarSign
    },
    {
      step: "3",
      title: "Earn Guaranteed Interest",
      description: "Grows at a fixed rate, tax-deferred.",
      icon: TrendingUp
    },
    {
      step: "4",
      title: "Access Your Funds",
      description: "At maturity: withdraw, renew, or convert to income.",
      icon: Landmark
    }
  ];

  const comparisonData = [
    { feature: "Principal Protection", fixed: "100% Guaranteed", cd: "FDIC up to $250k", savings: "FDIC up to $250k", stocks: "None" },
    { feature: "Interest Rate", fixed: "4.5-5.5% (2024)", cd: "3-4.5%", savings: "0.5-1%", stocks: "Variable" },
    { feature: "Tax Treatment", fixed: "Tax-deferred", cd: "Taxed annually", savings: "Taxed annually", stocks: "Capital gains" },
    { feature: "Early Withdrawal", fixed: "Surrender charges*", cd: "Penalty", savings: "None", stocks: "None" },
    { feature: "Minimum Deposit", fixed: "$10,000+", cd: "Varies", savings: "Low", stocks: "None" }
  ];

  const idealFor = [
    "Retirees seeking safe, predictable growth",
    "Savers frustrated with low CD rates",
    "Pre-retirees building their nest egg",
    "Conservative investors avoiding market risk",
    "Those rolling over 401(k) or IRA funds"
  ];

  const faqs = [
    {
      question: "How safe are fixed annuities?",
      answer: "Backed by insurance company reserves and regulated by state departments. Not FDIC insured, but strict reserve requirements apply. Choose A-rated carriers for maximum security."
    },
    {
      question: "What if I need money early?",
      answer: "Most allow 10% annual penalty-free withdrawals. Beyond that, surrender charges apply (decreasing each year until zero at maturity)."
    },
    {
      question: "How are they taxed?",
      answer: "Growth is tax-deferred until withdrawal, then taxed as ordinary income. Withdrawals before 59½ may incur a 10% IRS penalty."
    },
    {
      question: "Can I add more money later?",
      answer: "Most are single-premium (one deposit). You can open additional annuities anytime."
    },
    {
      question: "Fixed annuity vs. CD?",
      answer: "Both offer guaranteed rates. Annuities typically pay more, grow tax-deferred, and aren't limited by FDIC caps. CDs are simpler and more liquid."
    },
    {
      question: "What happens at maturity?",
      answer: "Take a lump sum, renew at current rates, transfer to another annuity, or convert to lifetime income. No obligation to annuitize."
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
          <div className="grid lg:grid-cols-2 gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Safe & Guaranteed Growth
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Fixed Annuities
                <span className="block text-heritage-accent">Guaranteed Returns</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Guaranteed rates with 100% principal protection. No market risk, no surprises—just predictable, tax-deferred growth.
              </p>

              <div className="space-y-3 mb-8">
                {["Rates up to 5.50% APY (2024)", "100% principal protection guaranteed", "Tax-deferred growth until withdrawal"].map((item, i) => (
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
                    Get Today's Rates
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

            {/* Growth Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Growth Calculator</h3>
                <p className="text-gray-500">See how your money grows with guaranteed rates</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Deposit: <span className="text-heritage-primary font-bold">${principal.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={principal}
                    onChange={(e) => setPrincipal(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$10k</span>
                    <span>$500k</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate: <span className="text-heritage-accent font-bold">{rate.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>3%</span>
                    <span>6%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Term Length</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((term) => (
                      <motion.button
                        key={term}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setYears(term)}
                        className={`py-3 rounded-lg font-semibold transition-colors ${
                          years === term
                            ? 'bg-heritage-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {term} yr
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/70 text-sm">Future Value</p>
                      <p className="text-3xl font-bold">${futureValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Total Interest</p>
                      <p className="text-3xl font-bold text-heritage-accent">${totalInterest.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-white/70 text-sm">Your Guaranteed Growth</p>
                    <p className="text-lg font-semibold">
                      ${principal.toLocaleString()} → ${futureValue.toLocaleString()} in {years} years
                    </p>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500">
                  *Rates shown are illustrative. Actual rates vary by carrier and may change.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5.50%", label: "Top Rates Available" },
              { value: "100%", label: "Principal Protected" },
              { value: "$0", label: "Annual Tax Until Withdrawal" },
              { value: "A-Rated", label: "Carrier Security" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Rates Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Current Fixed Annuity Rates
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sample rates from top-rated carriers. Rates change frequently—contact us for today's best offers.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 bg-heritage-primary text-white font-semibold">
                <div className="p-4 text-center">Term</div>
                <div className="p-4 text-center">Rate (APY)</div>
                <div className="p-4 text-center">Min. Deposit</div>
                <div className="p-4 text-center">Action</div>
              </div>
              {termRates.map((item, index) => (
                <motion.div
                  key={item.term}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`grid grid-cols-4 items-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-heritage-accent/5 transition-colors`}
                >
                  <div className="p-4 text-center font-semibold text-gray-900">{item.term} Years</div>
                  <div className="p-4 text-center">
                    <span className="text-2xl font-bold text-heritage-primary">{item.rate}%</span>
                  </div>
                  <div className="p-4 text-center text-gray-600">${item.minDeposit.toLocaleString()}</div>
                  <div className="p-4 text-center">
                    <Link href="/quote">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-heritage-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-heritage-accent/90 transition-colors"
                      >
                        Get Quote
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              *Rates as of January 2024. Subject to change. Higher rates may be available for larger deposits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fixed Annuities?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              The safety of a CD with better rates and tax advantages.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-heritage-primary/10 rounded-full mb-6">
                  <benefit.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Fixed Annuities Work
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              A simple, straightforward path to guaranteed growth.
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-heritage-accent/30 -translate-x-1/2 z-0" />
                  )}
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-heritage-primary rounded-full mb-6 shadow-lg">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-heritage-accent rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fixed Annuities vs. Alternatives
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              How fixed annuities compare to other safe-money options.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto overflow-x-auto"
          >
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold">Fixed Annuity</th>
                  <th className="p-4 text-center font-semibold">Bank CD</th>
                  <th className="p-4 text-center font-semibold">Savings Account</th>
                  <th className="p-4 text-center font-semibold">Stocks/Bonds</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold">{row.fixed}</td>
                    <td className="p-4 text-center text-gray-600">{row.cd}</td>
                    <td className="p-4 text-center text-gray-600">{row.savings}</td>
                    <td className="p-4 text-center text-gray-600">{row.stocks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-center text-sm text-gray-500 mt-4">
              *Surrender charges typically range from 7-10% in year 1, declining to 0% at maturity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Is a Fixed Annuity Right for You?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Fixed annuities are ideal for anyone who wants guaranteed growth without market risk.
                If you're looking for safety, predictability, and tax-efficient growth, a fixed annuity deserves consideration.
              </p>
              <div className="space-y-4">
                {idealFor.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-heritage-accent flex-shrink-0" />
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
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                alt="Retirement planning"
                className="rounded-2xl shadow-xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-heritage-accent/20 rounded-full">
                    <Shield className="w-8 h-8 text-heritage-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-heritage-primary">100%</p>
                    <p className="text-gray-600">Principal Protected</p>
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
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-light mb-8 leading-relaxed">
              "After losing money in 2008, I wanted safety above all else. My fixed annuity gives me
              peace of mind knowing my principal is protected and I'm earning a solid rate. No more
              watching the market with anxiety."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="Robert M."
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div className="text-left">
                <p className="text-white font-semibold">Robert M.</p>
                <p className="text-white/70">Retired Teacher, Fixed Annuity Client</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600">
              Common questions about fixed annuities answered.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
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
      <section className="py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready for Guaranteed Growth?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Lock in today's competitive rates before they change. Get a personalized quote in minutes.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-heritage-primary border-2 border-heritage-primary px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-heritage-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call (630) 778-0800
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
