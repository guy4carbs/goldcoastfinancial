import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TrendingDown,
  Minus,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  DollarSign,
  Shield,
  Home,
  Award,
  Calculator,
  ArrowRight,
  Info
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

export default function DecreasingVsLevel() {
  const [selectedType, setSelectedType] = useState<'decreasing' | 'level'>('level');
  const [mortgageAmount, setMortgageAmount] = useState(300000);
  const [termYears, setTermYears] = useState(30);
  const [currentYear, setCurrentYear] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculate coverage at any given year
  const getDecreasingCoverage = (year: number) => {
    const remaining = mortgageAmount * (1 - (year - 1) / termYears);
    return Math.max(0, Math.round(remaining));
  };

  const getLevelCoverage = () => mortgageAmount;

  // Estimated premiums (simplified)
  const decreasingPremium = Math.round((mortgageAmount / 1000) * 0.15);
  const levelPremium = Math.round((mortgageAmount / 1000) * 0.25);

  const comparison = [
    { feature: "Death Benefit", decreasing: "Decreases over time", level: "Stays the same" },
    { feature: "Matches Mortgage", decreasing: "Yes, mirrors payoff", level: "Exceeds as you pay down" },
    { feature: "Premium Cost", decreasing: "20-40% lower", level: "Higher but fixed" },
    { feature: "Flexibility", decreasing: "Limited", level: "Can use for any purpose" },
    { feature: "Cash Value", decreasing: "None", level: "None (term)" },
    { feature: "Best For", decreasing: "Budget-focused buyers", level: "Maximum protection" }
  ];

  const decreasingPros = [
    "Lower monthly premiums",
    "Coverage matches what you owe",
    "Simple and straightforward",
    "Good for tight budgets"
  ];

  const decreasingCons = [
    "Benefit shrinks each year",
    "No extra protection over time",
    "Less flexibility",
    "Family gets less if you die later"
  ];

  const levelPros = [
    "Coverage never decreases",
    "Extra funds for family as mortgage shrinks",
    "More flexibility in use",
    "Better long-term value"
  ];

  const levelCons = [
    "Higher monthly premium",
    "May be more than you need",
    "Paying for coverage you might not use"
  ];

  const faqs = [
    {
      question: "Which type do most people choose?",
      answer: "About 70% of mortgage protection buyers choose level term coverage. The extra security of knowing your family gets the full amount regardless of when you pass away is worth the slightly higher premium for most."
    },
    {
      question: "Can I switch from decreasing to level later?",
      answer: "You'd need to apply for a new policy, which means new underwriting and potentially higher rates due to age. It's generally better to start with level coverage if you're unsure."
    },
    {
      question: "Does decreasing term match my actual mortgage balance?",
      answer: "Not exactly. Decreasing term typically reduces linearly, while your mortgage balance decreases based on amortization (more goes to interest early on, more to principal later). In early years, linear decreasing coverage often exceeds your remaining mortgage balance, but in later years it may fall short. This is why many experts recommend level term for mortgage protection."
    },
    {
      question: "What if I refinance or pay off my mortgage early?",
      answer: "With level term, you keep full coverage regardless. With decreasing term, you might have less coverage than your new mortgage balance if you refinance to a higher amount."
    },
    {
      question: "Is the premium difference really significant?",
      answer: "For a $300,000 mortgage, decreasing term might cost $25-30/month while level term costs $35-45/month. Over 30 years, that's $3,600-$5,400 more—but level provides much more value."
    }
  ];

  // Generate chart data points
  const chartYears = [1, 5, 10, 15, 20, 25, 30].filter(y => y <= termYears);

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
                <TrendingDown className="w-4 h-4" />
                Mortgage Protection
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Decreasing vs. Level
                <span className="block text-heritage-accent">Term Coverage</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Should your coverage shrink with your mortgage or stay level? See the difference and choose what's right for your family.
              </p>

              <div className="space-y-3 mb-8">
                {["Decreasing: Lower cost, coverage shrinks", "Level: Higher cost, coverage stays same", "Interactive comparison tool below"].map((item, i) => (
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
                <a href="tel:+1234567890">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary hover:text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Speak to an Agent
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Interactive Coverage Comparison */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Coverage Comparison</h3>
                <p className="text-gray-600 text-sm">See how coverage changes over time</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortgage Amount: <span className="text-heritage-accent font-bold">${mortgageAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="750000"
                    step="25000"
                    value={mortgageAmount}
                    onChange={(e) => setMortgageAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year: <span className="text-heritage-accent font-bold">{currentYear} of {termYears}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={termYears}
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>

                {/* Visual Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedType === 'decreasing' ? 'border-heritage-accent bg-heritage-accent/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedType('decreasing')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-heritage-accent" />
                      <span className="font-semibold text-heritage-primary">Decreasing</span>
                    </div>
                    <p className="text-2xl font-bold text-heritage-primary">
                      ${getDecreasingCoverage(currentYear).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">~${decreasingPremium}/mo</p>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedType === 'level' ? 'border-heritage-accent bg-heritage-accent/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedType('level')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="w-5 h-5 text-heritage-accent" />
                      <span className="font-semibold text-heritage-primary">Level</span>
                    </div>
                    <p className="text-2xl font-bold text-heritage-primary">
                      ${getLevelCoverage().toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">~${levelPremium}/mo</p>
                  </motion.div>
                </div>

                {/* Visual Bar Comparison */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Decreasing Coverage</span>
                      <span>{Math.round((getDecreasingCoverage(currentYear) / mortgageAmount) * 100)}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(getDecreasingCoverage(currentYear) / mortgageAmount) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Level Coverage</span>
                      <span>100%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      At year {currentYear}, level coverage provides <span className="font-bold">${(getLevelCoverage() - getDecreasingCoverage(currentYear)).toLocaleString()}</span> more protection.
                    </p>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Compare Quotes for Both
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
              { value: "70%", label: "Choose Level Term" },
              { value: "20-40%", label: "Savings with Decreasing" },
              { value: "30 Years", label: "Most Common Term" },
              { value: "$300K", label: "Average Coverage" }
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

      {/* Coverage Over Time Visualization */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Coverage Over Time
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how each type of coverage changes throughout your mortgage term.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-[#fffaf3] rounded-2xl p-8"
          >
            {/* Interactive Chart */}
            <div className="relative h-64 mb-6">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                <span>${mortgageAmount.toLocaleString()}</span>
                <span>${(mortgageAmount / 2).toLocaleString()}</span>
                <span>$0</span>
              </div>

              {/* Chart area */}
              <div className="ml-20 h-full relative border-l-2 border-b-2 border-gray-300">
                {/* Level line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500" />
                <div className="absolute top-0 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Level
                </div>

                {/* Decreasing line - diagonal */}
                <svg className="absolute inset-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                  Decreasing
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-6 flex justify-between text-xs text-gray-500">
                  {chartYears.map((year) => (
                    <span key={year}>Yr {year}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-800">Level Term</span>
                </div>
                <p className="text-sm text-green-700">Coverage stays at ${mortgageAmount.toLocaleString()} for the entire term.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="font-semibold text-amber-800">Decreasing Term</span>
                </div>
                <p className="text-sm text-amber-700">Coverage reduces to $0 by year {termYears}.</p>
              </div>
            </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Side-by-Side Comparison
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-gray-200"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Decreasing
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Minus className="w-4 h-4" />
                      Level
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 text-gray-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-gray-600">{row.decreasing}</td>
                    <td className="p-4 text-center text-heritage-accent font-semibold">{row.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Pros and Cons */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Pros & Cons
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Decreasing Term */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#fffaf3] rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary">Decreasing Term</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2">Pros</p>
                  {decreasingPros.map((pro, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{pro}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Cons</p>
                  {decreasingCons.map((con, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="w-4 h-4 text-red-500 flex items-center justify-center">×</span>
                      <span className="text-sm text-gray-700">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Level Term */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-xl p-6 border-2 border-green-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Minus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-heritage-primary">Level Term</h3>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Recommended</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2">Pros</p>
                  {levelPros.map((pro, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{pro}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Cons</p>
                  {levelCons.map((con, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="w-4 h-4 text-red-500 flex items-center justify-center">×</span>
                      <span className="text-sm text-gray-700">{con}</span>
                    </div>
                  ))}
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
              "I almost got decreasing term to save $15/month. My agent showed me how level term gives my family an extra $150K if something happens in year 20. That peace of mind is worth way more."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Michael R.</p>
                <p className="text-white/70 text-sm">Homeowner, Chicago IL</p>
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
              Compare Your Options
            </h2>
            <p className="text-gray-600 mb-8">
              Get quotes for both decreasing and level term. See exactly what you'd pay.
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
              <a href="tel:+1234567890">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-primary hover:bg-heritage-primary/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
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
