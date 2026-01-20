import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  PiggyBank,
  ChevronRight,
  Phone,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronDown,
  Wallet,
  Lock,
  Percent,
  LineChart,
  BadgeCheck,
  Award
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(10);

  // Interactive Calculator State
  const [calcPremium, setCalcPremium] = useState(300);
  const [calcYears, setCalcYears] = useState(20);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate projected cash values based on premium and years
  const calculateProjectedGrowth = () => {
    const annualPremium = calcPremium * 12;
    const growthRate = 0.045; // 4.5% average growth
    const years = [5, 10, 15, 20, 25, 30].filter(y => y <= calcYears);

    return years.map(year => {
      const totalPremiums = annualPremium * year;
      // Cash value builds slowly early, accelerates later
      const efficiency = year < 7 ? 0.3 + (year * 0.08) : 0.7 + ((year - 7) * 0.025);
      const baseCashValue = totalPremiums * efficiency;
      // Add compound growth
      const growthMultiplier = Math.pow(1 + growthRate, year);
      const cashValue = Math.round(baseCashValue * growthMultiplier);
      const percentage = Math.round((cashValue / totalPremiums) * 100);

      return {
        year,
        totalPremiums,
        cashValue,
        percentage
      };
    });
  };

  const projectedGrowth = calculateProjectedGrowth();

  const trustStats = [
    { value: "3-5%", label: "Guaranteed Rate", sublabel: "Typical minimum growth" },
    { value: "Tax-Free", label: "Growth", sublabel: "Deferred until withdrawal" },
    { value: "Yr 7-10", label: "Break-Even", sublabel: "When cash value exceeds premiums" },
    { value: "100%", label: "Accessible", sublabel: "Borrow against anytime" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Premium Payment",
      description: "Part covers insurance costs, part goes to cash value.",
      icon: Wallet
    },
    {
      step: 2,
      title: "Guaranteed Growth",
      description: "Cash value grows at a fixed rate set by the insurer.",
      icon: TrendingUp
    },
    {
      step: 3,
      title: "Tax-Deferred",
      description: "No taxes on growth while money stays in the policy.",
      icon: Shield
    },
    {
      step: 4,
      title: "Access Anytime",
      description: "Borrow or withdraw from your cash value as needed.",
      icon: DollarSign
    }
  ];

  const cashValueGrowth = [
    { year: 5, premiums: "$17,100", cashValue: "$8,500", percentage: "50%" },
    { year: 10, premiums: "$34,200", cashValue: "$24,000", percentage: "70%" },
    { year: 15, premiums: "$51,300", cashValue: "$45,000", percentage: "88%" },
    { year: 20, premiums: "$68,400", cashValue: "$72,000", percentage: "105%" },
    { year: 25, premiums: "$85,500", cashValue: "$105,000", percentage: "123%" },
    { year: 30, premiums: "$102,600", cashValue: "$148,000", percentage: "144%" }
  ];

  const accessMethods = [
    {
      icon: DollarSign,
      title: "Policy Loans",
      description: "Borrow against cash value at low rates. No credit check, no approval process.",
      pros: ["No application needed", "Competitive rates", "Death benefit stays intact (minus loan)"],
      cons: ["Interest accrues", "Unpaid loans reduce benefit"]
    },
    {
      icon: Wallet,
      title: "Partial Withdrawals",
      description: "Take money out permanently. Tax-free up to your basis (premiums paid).",
      pros: ["No interest to pay", "Tax-free up to basis", "Immediate access"],
      cons: ["Reduces death benefit", "May trigger taxes", "Can't put it back"]
    },
    {
      icon: BadgeCheck,
      title: "Full Surrender",
      description: "Cancel policy and take all cash value. Ends coverage permanently.",
      pros: ["Get all cash value", "No future premiums"],
      cons: ["Lose all coverage", "Gains may be taxed", "Surrender charges early on"]
    }
  ];

  const factors = [
    {
      icon: Clock,
      title: "Time in Policy",
      description: "Cash value grows slowly early, accelerates over time. Best results after 10+ years."
    },
    {
      icon: Percent,
      title: "Interest Rate",
      description: "Guaranteed minimum plus potential dividends. Rates vary by carrier."
    },
    {
      icon: PiggyBank,
      title: "Premium Amount",
      description: "Higher premiums = more cash value. Overfunding accelerates growth."
    },
    {
      icon: LineChart,
      title: "Policy Type",
      description: "Participating policies may earn dividends. Non-participating have fixed rates."
    }
  ];

  const faqs = [
    {
      question: "How quickly does cash value build?",
      answer: "Slowly at first - most early premiums cover insurance costs and commissions. Significant accumulation typically starts after year 7-10. After 15-20 years, cash value often exceeds total premiums paid."
    },
    {
      question: "Is the cash value growth rate guaranteed?",
      answer: "Yes, whole life has a guaranteed minimum rate (typically 3-5%). Participating policies may earn additional dividends, but those aren't guaranteed. The minimum is locked in."
    },
    {
      question: "Can I lose my cash value?",
      answer: "The guaranteed cash value can't decrease. However, unpaid policy loans reduce your net cash value and death benefit. Surrendering early may result in less than premiums paid due to surrender charges."
    },
    {
      question: "How do policy loans work?",
      answer: "You borrow from the insurer using your cash value as collateral. No credit check, no approval, no fixed repayment schedule. Interest accrues on unpaid loans. Unpaid balance is deducted from death benefit."
    },
    {
      question: "Are withdrawals taxed?",
      answer: "Withdrawals up to your cost basis (total premiums paid) are tax-free. Gains above basis are taxable as ordinary income. Policy loans aren't taxed since they're technically loans, not withdrawals."
    },
    {
      question: "What happens to cash value when I die?",
      answer: "Beneficiaries receive the death benefit, not the cash value - they don't stack. Some policies offer riders to include cash value in the payout. Without riders, cash value returns to the insurer."
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
                <PiggyBank className="w-4 h-4" />
                Whole Life Insurance
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Cash Value
                <span className="block text-heritage-accent">Explained</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Build tax-deferred savings inside your life insurance. Access it anytime for any reason.
              </p>

              <div className="space-y-3 mb-8">
                {["Guaranteed minimum growth rate (3-5%)", "Tax-deferred accumulation", "Borrow against it without credit checks"].map((item, i) => (
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
                    Speak to an Advisor
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Cash Value Growth Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-heritage-accent/20 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-heritage-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cash Value Growth</h3>
                  <p className="text-gray-500 text-sm">$285/month premium, age 35</p>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                {[10, 15, 20, 25, 30].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedYear === year
                        ? 'bg-heritage-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yr {year}
                  </button>
                ))}
              </div>

              <div className="p-6 bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Total Premiums Paid</p>
                    <p className="text-2xl font-bold text-white">
                      {cashValueGrowth.find(c => c.year === selectedYear)?.premiums}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Cash Value</p>
                    <p className="text-2xl font-bold text-heritage-accent">
                      {cashValueGrowth.find(c => c.year === selectedYear)?.cashValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm">Cash Value as % of Premiums</p>
                <p className="text-4xl font-bold text-heritage-primary">
                  {cashValueGrowth.find(c => c.year === selectedYear)?.percentage}
                </p>
              </div>

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Your Personalized Illustration
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl md:text-4xl font-bold text-heritage-accent">{stat.value}</p>
                <p className="font-medium">{stat.label}</p>
                <p className="text-sm opacity-80">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Cash Value Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                What is Cash Value?
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Cash value is a savings component inside permanent life insurance. Part of every premium goes toward building this tax-deferred account.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Unlike a bank account, cash value grows at guaranteed rates and isn't taxed while it accumulates. You can access it through loans or withdrawals - no questions asked.
              </p>

              <div className="space-y-3">
                {[
                  "Guaranteed minimum growth rate (typically 3-5%)",
                  "Tax-deferred accumulation",
                  "Borrow against it without credit checks",
                  "Use for emergencies, opportunities, or retirement",
                  "Grows alongside your death benefit protection"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80"
                  alt="Cash value growth concept"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
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
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every premium payment does double duty.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-6 h-6 text-heritage-accent" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cash Value Growth Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Cash Value Over Time
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Example: $250K policy, age 35, $285/month premium.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-x-auto max-w-4xl mx-auto border border-gray-200"
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Policy Year</th>
                  <th className="p-4 text-center font-semibold">Total Premiums Paid</th>
                  <th className="p-4 text-center font-semibold">Cash Value</th>
                  <th className="p-4 text-center font-semibold">% of Premiums</th>
                </tr>
              </thead>
              <tbody>
                {cashValueGrowth.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#fffaf3]' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">Year {row.year}</td>
                    <td className="p-4 text-center text-gray-600">{row.premiums}</td>
                    <td className="p-4 text-center font-bold text-heritage-primary">{row.cashValue}</td>
                    <td className="p-4 text-center">
                      <span className={`font-semibold ${parseInt(row.percentage) >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                        {row.percentage}
                      </span>
                    </td>
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
            *Illustrative values. Actual results vary by carrier and policy.
          </motion.p>
        </div>
      </section>

      {/* How to Access Cash Value */}
      <section className="py-20 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              3 Ways to Access Your Cash Value
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Your money, your choice. Each method has trade-offs.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {accessMethods.map((method, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-xl w-fit mb-6">
                  <method.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-6">{method.description}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {method.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-2">Cons</p>
                    <ul className="space-y-1">
                      {method.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Factors Affecting Growth */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              What Affects Cash Value Growth
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Four key factors determine how fast your cash value builds.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {factors.map((factor, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="p-4 bg-heritage-primary/10 rounded-full w-fit mx-auto mb-4">
                  <factor.icon className="w-8 h-8 text-heritage-primary" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary mb-3">{factor.title}</h3>
                <p className="text-gray-600">{factor.description}</p>
              </motion.div>
            ))}
          </motion.div>
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
              "After 12 years, my policy had $45,000 in cash value. I borrowed $20,000 for my son's wedding - no application, no credit check. Best part? My coverage stayed fully intact."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80"
                  alt="Margaret J."
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Margaret J.</p>
                <p className="text-white/70 text-sm">Whole Life Policyholder Since 2012</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Cash Value Calculator */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Cash Value Growth Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              See how your cash value could grow over time. Adjust the sliders to explore different scenarios.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCalculator(!showCalculator)}
              className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <LineChart className="w-5 h-5" />
              {showCalculator ? 'Hide Calculator' : 'Open Calculator'}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  {/* Slider Controls */}
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Monthly Premium: <span className="text-heritage-accent font-bold text-lg">${calcPremium}</span>
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="25"
                        value={calcPremium}
                        onChange={(e) => setCalcPremium(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>$100/mo</span>
                        <span>$1,000/mo</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Time Horizon: <span className="text-heritage-accent font-bold text-lg">{calcYears} Years</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="5"
                        value={calcYears}
                        onChange={(e) => setCalcYears(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>10 years</span>
                        <span>30 years</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-heritage-primary/10 rounded-xl p-5 text-center">
                      <p className="text-gray-600 text-sm mb-1">Annual Premium</p>
                      <p className="text-2xl font-bold text-heritage-primary">${(calcPremium * 12).toLocaleString()}</p>
                    </div>
                    <div className="bg-heritage-primary/10 rounded-xl p-5 text-center">
                      <p className="text-gray-600 text-sm mb-1">Total Premiums ({calcYears}yr)</p>
                      <p className="text-2xl font-bold text-heritage-primary">${(calcPremium * 12 * calcYears).toLocaleString()}</p>
                    </div>
                    <div className="bg-heritage-accent/20 rounded-xl p-5 text-center">
                      <p className="text-gray-600 text-sm mb-1">Projected Cash Value</p>
                      <p className="text-2xl font-bold text-heritage-accent">
                        ${projectedGrowth.length > 0 ? projectedGrowth[projectedGrowth.length - 1].cashValue.toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>

                  {/* Animated Bar Chart */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-heritage-primary mb-6">Cash Value Growth Over Time</h4>
                    <div className="space-y-4">
                      {projectedGrowth.map((data, index) => {
                        const maxCashValue = projectedGrowth.length > 0 ? projectedGrowth[projectedGrowth.length - 1].cashValue : 1;
                        const barWidth = (data.cashValue / maxCashValue) * 100;
                        const premiumWidth = (data.totalPremiums / maxCashValue) * 100;

                        return (
                          <motion.div
                            key={data.year}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-20 text-sm font-medium text-gray-700">Year {data.year}</span>
                              <div className="flex-1 relative h-10">
                                {/* Premium bar (background) */}
                                <motion.div
                                  className="absolute inset-y-0 left-0 bg-gray-200 rounded-lg"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${premiumWidth}%` }}
                                  transition={{ duration: 0.6, delay: index * 0.1 }}
                                />
                                {/* Cash value bar (foreground) */}
                                <motion.div
                                  className={`absolute inset-y-0 left-0 rounded-lg ${data.percentage >= 100 ? 'bg-gradient-to-r from-heritage-primary to-heritage-accent' : 'bg-heritage-primary'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidth}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                                />
                                {/* Value labels */}
                                <div className="absolute inset-0 flex items-center justify-between px-4">
                                  <span className="text-white text-sm font-medium z-10">${data.cashValue.toLocaleString()}</span>
                                  <span className={`text-sm font-bold ${data.percentage >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {data.percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-heritage-primary rounded"></div>
                      <span className="text-gray-600">Cash Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span className="text-gray-600">Total Premiums Paid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-heritage-primary to-heritage-accent rounded"></div>
                      <span className="text-gray-600">Cash Value Exceeds Premiums</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    *Projections are illustrative only and assume 4.5% average growth. Actual results will vary by carrier and policy.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Common questions about cash value.
            </p>
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
              See how much cash value you could accumulate. Get a personalized illustration.
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
                  Call (630) 778-0800
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
