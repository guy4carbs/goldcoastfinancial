import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BarChart3,
  Shield,
  ChevronRight,
  ChevronDown,
  Award,
  ArrowRight,
  TrendingUp,
  Globe,
  Cpu,
  Building2,
  Layers,
  CheckCircle,
  Info,
  Phone,
  DollarSign,
  Lock,
  Percent,
  Target
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

export default function IndexOptions() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<string>("sp500");

  const indexes = [
    {
      id: 'sp500',
      name: "S&P 500",
      icon: Building2,
      description: "500 largest U.S. companies",
      histReturn: "~10% (index)",
      typicalCap: "10-12%",
      volatility: "Medium",
      bestFor: "Balanced growth seekers",
      details: "The most common index option. Tracks 500 large-cap U.S. stocks. Actual credited rate is subject to cap. Offers good balance of growth potential and stability.",
      pros: ["Most familiar benchmark", "Strong historical returns", "Broad diversification"],
      cons: ["U.S. only exposure", "Cap limits big gains", "Subject to market cycles"]
    },
    {
      id: 'nasdaq',
      name: "NASDAQ-100",
      icon: Cpu,
      description: "100 largest non-financial companies",
      histReturn: "~14% (index)",
      typicalCap: "8-10%",
      volatility: "High",
      bestFor: "Growth-oriented investors",
      details: "Tech-heavy index with higher growth potential but more volatility. Lower caps typical due to higher volatility. Actual credited rate is subject to cap.",
      pros: ["Higher growth potential", "Tech sector exposure", "Innovation-focused"],
      cons: ["More volatile", "Lower caps typical", "Sector concentrated"]
    },
    {
      id: 'global',
      name: "Global Index",
      icon: Globe,
      description: "International diversification",
      histReturn: "~8% (index)",
      typicalCap: "11-14%",
      volatility: "Medium",
      bestFor: "Diversification seekers",
      details: "Includes international markets for geographic diversification. May include developed and emerging markets. Actual credited rate is subject to cap.",
      pros: ["Geographic diversification", "Higher caps often available", "Hedge against U.S. markets"],
      cons: ["Currency risk factors", "Lower historical returns", "More complex"]
    },
    {
      id: 'proprietary',
      name: "Proprietary Index",
      icon: Layers,
      description: "Custom volatility-controlled index",
      histReturn: "Varies",
      typicalCap: "Uncapped*",
      volatility: "Low",
      bestFor: "Conservative investors",
      details: "Insurance company-designed indexes that control volatility. Often uncapped but with participation rates (typically 50-100%). Designed for steady growth.",
      pros: ["Often uncapped", "Lower volatility", "Steady crediting"],
      cons: ["Less transparent", "Participation rates apply", "Newer track record"]
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Market-Linked Growth",
      description: "Participate in market gains without direct market exposure"
    },
    {
      icon: Shield,
      title: "Downside Protection",
      description: "Your principal is protected from market losses with a 0% floor"
    },
    {
      icon: Layers,
      title: "Multiple Options",
      description: "Choose from various indexes to match your risk tolerance"
    },
    {
      icon: Target,
      title: "Flexible Allocation",
      description: "Reallocate between indexes annually to optimize returns"
    }
  ];

  const idealFor = [
    "Investors seeking tax-advantaged growth",
    "Those wanting market participation with downside protection",
    "People planning for retirement income",
    "Anyone seeking flexible premium options",
    "Those who want to diversify beyond traditional investments"
  ];

  const faqs = [
    {
      question: "Can I choose multiple indexes?",
      answer: "Yes! Most IUL policies allow you to allocate your premium across multiple index options. You can choose different percentages for each index based on your goals and risk tolerance."
    },
    {
      question: "Can I change my index selection?",
      answer: "Yes, most policies allow you to reallocate between indexes once per year (on your policy anniversary) or sometimes more frequently. This lets you adjust your strategy over time."
    },
    {
      question: "What's a fixed account option?",
      answer: "Most IULs also offer a fixed account that pays a guaranteed interest rate (typically 3-4%) regardless of market performance. This can be part of a diversified allocation strategy."
    },
    {
      question: "Why do different indexes have different caps?",
      answer: "Caps are based on the cost of options the insurance company purchases to provide index-linked returns. More volatile indexes (like NASDAQ) typically have lower caps because the options cost more."
    },
    {
      question: "What are proprietary indexes?",
      answer: "These are custom indexes created by or for insurance companies, often using volatility-control mechanisms. They're designed to provide more consistent crediting with higher caps or uncapped structures."
    }
  ];

  const selectedIndexData = indexes.find(i => i.id === selectedIndex);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" />
                IUL Index Selection
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                Choose Your
                <span className="block text-violet-500">Index Options</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                IUL policies offer multiple indexes to link your growth. Build a customized strategy that balances growth potential with downside protection.
              </p>

              <div className="space-y-3 mb-8">
                {["Multiple index options to choose from", "Reallocate annually to optimize returns", "0% floor protects against market losses"].map((item, i) => (
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
                    Get IUL Quote
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
                    Speak to a Specialist
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Interactive Index Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Index Explorer</h3>
                <p className="text-gray-600 text-sm">Select an index to see details</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {indexes.map((index) => (
                  <button
                    key={index.id}
                    onClick={() => setSelectedIndex(index.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedIndex === index.id
                        ? 'bg-primary text-white ring-2 ring-primary/30'
                        : 'bg-[#fffaf3] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <index.icon className={`w-5 h-5 mb-2 ${
                      selectedIndex === index.id ? 'text-white' : 'text-violet-500'
                    }`} />
                    <p className={`font-semibold text-sm ${
                      selectedIndex === index.id ? 'text-white' : 'text-primary'
                    }`}>{index.name}</p>
                  </button>
                ))}
              </div>

              {selectedIndexData && (
                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white">
                  <h4 className="font-bold text-lg mb-2">{selectedIndexData.name}</h4>
                  <p className="text-white/80 text-sm mb-4">{selectedIndexData.details}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/60">Hist. Return</p>
                      <p className="text-xl font-bold text-violet-500">{selectedIndexData.histReturn}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/60">Typical Cap</p>
                      <p className="text-xl font-bold">{selectedIndexData.typicalCap}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/60 mb-1">Best For</p>
                    <p className="text-sm font-medium">{selectedIndexData.bestFor}</p>
                  </div>
                </div>
              )}

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Custom Illustration
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "4+", label: "Index Options" },
              { value: "0%", label: "Floor Protection" },
              { value: "10-14%", label: "Typical Caps" },
              { value: "Annual", label: "Reallocation" }
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
              Why Index-Linked Growth?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              IUL index options give you the potential for market-linked returns with built-in protection.
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

      {/* Interactive Index Explorer Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Explore Index Options
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Click on each index to learn about its characteristics, advantages, and considerations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Index Tabs */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                {indexes.map((index) => (
                  <motion.button
                    key={index.id}
                    onClick={() => setSelectedIndex(index.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedIndex === index.id
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <index.icon className="w-5 h-5" />
                    {index.name}
                  </motion.button>
                ))}
              </div>

              {/* Selected Index Details */}
              <AnimatePresence mode="wait">
                {selectedIndexData && (
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                          <selectedIndexData.icon className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-primary">{selectedIndexData.name}</h3>
                          <p className="text-gray-500">{selectedIndexData.description}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6">{selectedIndexData.details}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-[#fffaf3] rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">Hist. Return</p>
                          <p className="text-xl font-bold text-violet-500">{selectedIndexData.histReturn}</p>
                        </div>
                        <div className="bg-[#fffaf3] rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">Typical Cap</p>
                          <p className="text-xl font-bold text-primary">{selectedIndexData.typicalCap}</p>
                        </div>
                        <div className="bg-[#fffaf3] rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">Volatility</p>
                          <p className="text-xl font-bold text-primary">{selectedIndexData.volatility}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          Advantages
                        </h4>
                        <ul className="space-y-2">
                          {selectedIndexData.pros.map((pro, i) => (
                            <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5 text-amber-500" />
                          Considerations
                        </h4>
                        <ul className="space-y-2">
                          {selectedIndexData.cons.map((con, i) => (
                            <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-primary">Best For:</span> {selectedIndexData.bestFor}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
                  alt="Financial planning discussion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Growth + Protection</p>
                    <p className="text-xs text-gray-500">Market gains, no losses</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              How Index Options Work
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Understanding the mechanics of IUL index crediting
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Choose Index", description: "Select from available index options based on your goals", icon: Layers },
              { step: "2", title: "Allocate Premium", description: "Distribute your premium across one or more indexes", icon: Percent },
              { step: "3", title: "Track Performance", description: "Index performance is calculated at each crediting period", icon: TrendingUp },
              { step: "4", title: "Receive Credits", description: "Gains are credited to your cash value, losses are protected", icon: DollarSign }
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
              "I split my allocation 60% S&P 500 and 40% proprietary index. The S&P gives me growth in good years, and the proprietary index smooths out the ride. It's the perfect combination for my retirement strategy."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Jennifer H.</p>
                <p className="text-white/70 text-sm">IUL Policyholder, Seattle</p>
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
              Ready to Build Your Strategy?
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              Get a custom IUL illustration with your preferred index allocation. Our specialists will help you design a strategy that fits your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your IUL Quote
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
