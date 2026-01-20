import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Award,
  BarChart3,
  ArrowRight,
  Calculator,
  CheckCircle,
  Percent,
  Lock,
  Zap,
  Phone,
  FileText,
  Target,
  LineChart
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

export default function IndexCrediting() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [indexReturn, setIndexReturn] = useState(12);
  const [cap, setCap] = useState(10);
  const [floor, setFloor] = useState(0);
  const [participationRate, setParticipationRate] = useState(100);

  const calculateCredit = () => {
    let credit = indexReturn * (participationRate / 100);
    if (credit > cap) credit = cap;
    if (credit < floor) credit = floor;
    return credit;
  };

  const creditedRate = calculateCredit();

  const benefits = [
    {
      icon: TrendingUp,
      title: "Market-Linked Growth",
      description: "Earn interest based on index performance without direct market risk or volatility exposure"
    },
    {
      icon: Shield,
      title: "Principal Protection",
      description: "Your cash value is protected from market downturns with guaranteed floor rates"
    },
    {
      icon: Lock,
      title: "Annual Lock-In",
      description: "Index credits are locked in annually and protected from market downturns"
    },
    {
      icon: Zap,
      title: "Tax-Deferred Growth",
      description: "Your cash value grows without annual taxation, maximizing compound growth"
    }
  ];

  const idealFor = [
    "Those seeking market-linked returns without direct risk",
    "Investors wanting principal protection",
    "People planning for tax-advantaged retirement income",
    "Those who value predictable, steady growth",
    "Families building multi-generational wealth"
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your Index",
      description: "Select from popular indexes like S&P 500, NASDAQ, or proprietary indexes designed for stability",
      icon: Target
    },
    {
      step: "2",
      title: "Track Performance",
      description: "The insurance company tracks your chosen index over the crediting period (usually 1 year)",
      icon: LineChart
    },
    {
      step: "3",
      title: "Calculate Credits",
      description: "Your interest is calculated based on index gains, subject to caps and participation rates",
      icon: Calculator
    },
    {
      step: "4",
      title: "Lock In Gains",
      description: "Index credits are added to your account and protected from future market declines",
      icon: Lock
    }
  ];

  const faqs = [
    {
      question: "How is my interest actually calculated?",
      answer: "Interest is calculated by tracking your chosen index's performance over a crediting period (usually 1 year). The gain is then multiplied by your participation rate and subject to any cap. If the index is negative, you receive your floor rate (often 0%)."
    },
    {
      question: "Do I own shares in the index?",
      answer: "No, you don't directly invest in the market. The insurance company uses the index as a benchmark to calculate your interest credit. This means you get upside potential without direct market exposure."
    },
    {
      question: "What happens if the market crashes?",
      answer: "Your cash value is protected by the floor (typically 0-2%). Even in years when the index loses 30%+, your credited rate won't go below the floor. Previous gains remain locked in."
    },
    {
      question: "How often is interest credited?",
      answer: "Most IUL policies use annual point-to-point crediting, meaning they compare the index value at the start and end of each policy year. Some offer monthly averaging or other strategies."
    },
    {
      question: "Can caps and participation rates change?",
      answer: "Yes, insurance companies can adjust caps and participation rates annually based on market conditions. However, the floor guarantee and your locked-in gains cannot be taken away."
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
                <BarChart3 className="w-4 h-4" />
                IUL Fundamentals
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                How Index
                <span className="block text-heritage-accent">Crediting Works</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Earn interest linked to market indexes while protecting your principal from losses.
                Experience the growth potential of the market with a safety net built in.
              </p>

              <div className="space-y-3 mb-8">
                {["Market-linked returns without direct risk", "0% floor protects against market losses", "Index credits locked in each year"].map((item, i) => (
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
                    Get Your IUL Quote
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
                    Speak to a Specialist
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Index Credit Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Credit Calculator</h3>
                <p className="text-gray-600 text-sm">See how index returns translate to policy credits</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Index Return (S&P 500): <span className={`font-bold ${indexReturn >= 0 ? 'text-green-600' : 'text-red-500'}`}>{indexReturn >= 0 ? '+' : ''}{indexReturn}%</span>
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="30"
                    value={indexReturn}
                    onChange={(e) => setIndexReturn(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-20%</span>
                    <span>+30%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cap Rate: <span className="text-heritage-accent font-bold">{cap}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    value={cap}
                    onChange={(e) => setCap(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participation Rate: <span className="text-heritage-accent font-bold">{participationRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={participationRate}
                    onChange={(e) => setParticipationRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>150%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Your Credited Rate</p>
                  <p className="text-4xl font-bold">{creditedRate.toFixed(1)}%</p>
                  <p className="text-xs opacity-75 mt-2">
                    {indexReturn < 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" /> Floor protected you from a {Math.abs(indexReturn)}% loss!
                      </span>
                    ) : creditedRate < indexReturn * participationRate / 100 ? (
                      `Cap limited gain, but you still earned ${creditedRate.toFixed(1)}%`
                    ) : (
                      "Full participation credited to your policy"
                    )}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Protected Growth</p>
                      <p className="text-xs text-green-700 mt-1">Index credits locked in annually. Policy charges apply separately.</p>
                    </div>
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
              { value: "0%", label: "Downside Risk" },
              { value: "8-12%", label: "Typical Caps" },
              { value: "100%+", label: "Participation Available" },
              { value: "Annual", label: "Lock-In Guarantee" }
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
              Why Index Crediting Matters
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A smarter way to grow your wealth with built-in protection against market volatility.
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

      {/* Interactive Comparison Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              IUL vs. Direct Market Investment
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how index crediting provides smoother, protected growth compared to direct market exposure.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* IUL Side */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800">IUL Policy</h4>
                      <p className="text-xs text-green-600">Protected Growth</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { year: "2021", market: "+26.9%", iul: "+10%" },
                      { year: "2022", market: "-19.4%", iul: "0%" },
                      { year: "2023", market: "+24.2%", iul: "+10%" }
                    ].map((row) => (
                      <div key={row.year} className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-gray-600">{row.year}</span>
                        <span className="font-bold text-green-600">{row.iul}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <div className="flex justify-between">
                      <span className="font-medium text-green-800">3-Year Total</span>
                      <span className="font-bold text-green-600">+20%</span>
                    </div>
                  </div>
                </div>

                {/* Market Side */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-700">Direct S&P 500</h4>
                      <p className="text-xs text-gray-500">Unprotected</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { year: "2021", value: "+26.9%" },
                      { year: "2022", value: "-19.4%" },
                      { year: "2023", value: "+24.2%" }
                    ].map((row) => (
                      <div key={row.year} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">{row.year}</span>
                        <span className={`font-bold ${row.value.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">3-Year Total</span>
                      <span className="font-bold text-gray-700">+31.7%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-heritage-accent/10 rounded-lg">
                <p className="text-center text-heritage-primary font-medium">
                  <span className="font-bold">The IUL Advantage:</span> While you may earn less in strong bull markets,
                  you avoid the stomach-churning losses. In 2022, IUL holders kept their gains while the market dropped 19.4%.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Ideal For Those Who...
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
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
                  alt="Financial planning and growth"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary">Protected</p>
                    <p className="text-xs text-gray-500">Market-linked growth</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              How Index Crediting Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
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
                {i < 3 && (
                  <ArrowRight className="w-6 h-6 text-heritage-accent/30 mx-auto mt-4 hidden md:block" />
                )}
              </motion.div>
            ))}
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
              "In 2022, when the S&P dropped 18%, my IUL was credited 0%. In 2023, when it rose 24%,
              I was credited my full 10% cap. My index credits never go negative—that's peace of mind."
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
                <p className="text-white font-semibold">David K.</p>
                <p className="text-white/70 text-sm">IUL Policyholder, 8 years</p>
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
              Ready for Market-Linked Growth?
            </h2>
            <p className="text-gray-600 mb-8">
              See how index crediting can work for your financial goals. Get a personalized illustration today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free IUL Quote
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
