import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Award,
  ArrowRight,
  Target,
  Lock,
  Gauge,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Phone,
  DollarSign,
  Percent,
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

export default function CapsAndFloors() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cap, setCap] = useState(10);
  const [floor, setFloor] = useState(0);
  const [marketReturn, setMarketReturn] = useState(15);

  // Calculate credited rate based on cap and floor
  const calculateCredit = (returnValue: number) => {
    if (returnValue < 0) return floor;
    return Math.min(returnValue, cap);
  };

  const creditedRate = calculateCredit(marketReturn);

  // Historical S&P 500 returns simulation
  const marketYears = [
    { year: 2019, return: 28.9, description: "Strong bull market" },
    { year: 2020, return: 16.3, description: "COVID recovery" },
    { year: 2021, return: 26.9, description: "Post-pandemic surge" },
    { year: 2022, return: -19.4, description: "Bear market" },
    { year: 2023, return: 24.2, description: "AI-driven rally" },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Cap Rate Protection",
      description: "Know your maximum potential return upfront, allowing for predictable planning and expectations"
    },
    {
      icon: Shield,
      title: "Floor Guarantee",
      description: "Your money is protected from market losses with a guaranteed minimum rate, typically 0%"
    },
    {
      icon: Lock,
      title: "Locked-In Credits",
      description: "Once credited, index gains are protected from future market downturns"
    },
    {
      icon: Gauge,
      title: "Participation Options",
      description: "Choose from various crediting strategies to match your risk tolerance and goals"
    }
  ];

  const idealFor = [
    "Investors who want market participation without full market risk",
    "Those nearing retirement who can't afford significant losses",
    "People who prefer predictable, steady growth over volatility",
    "Families seeking protected wealth accumulation",
    "Anyone who lost money in 2008 or 2022 and wants protection"
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Market Performs",
      description: "The S&P 500 or your chosen index rises or falls over the crediting period",
      icon: TrendingUp
    },
    {
      step: "2",
      title: "Floor Protects",
      description: "If the market goes negative, your floor (typically 0%) kicks in to protect you",
      icon: Shield
    },
    {
      step: "3",
      title: "Cap Applies",
      description: "If the market exceeds your cap, you earn up to the cap rate (e.g., 10%)",
      icon: Target
    },
    {
      step: "4",
      title: "Credits Lock In",
      description: "Your credited rate is protected from future market declines",
      icon: Lock
    }
  ];

  const faqs = [
    {
      question: "Why do insurance companies use caps?",
      answer: "Caps allow insurance companies to offer floor protection. They invest premiums in bonds and use options strategies. The cap represents the trade-off for guaranteeing you'll never lose money to market declines."
    },
    {
      question: "What's a typical cap rate?",
      answer: "Cap rates vary by product and market conditions, typically ranging from 8-14%. Higher caps are available with lower participation rates or higher premiums. Your agent can show you current rates."
    },
    {
      question: "Is a 0% floor really protection?",
      answer: "Yes! In a year when the S&P 500 drops 20%, earning 0% is actually a 20% better outcome than being invested directly. Your principal is protected, and previous gains remain locked in."
    },
    {
      question: "Do caps and floors change over time?",
      answer: "Caps and participation rates can be adjusted annually by the insurance company based on interest rates and market conditions. However, your floor guarantee remains constant."
    },
    {
      question: "Should I prioritize higher caps or higher participation?",
      answer: "It depends on your outlook. Higher caps benefit you in strong bull markets. Higher participation rates help in moderate growth years. Many IUL products offer allocation strategies for both."
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
                <Gauge className="w-4 h-4" />
                Understanding IUL
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Caps, Floors
                <span className="block text-heritage-accent">& Participation</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The guardrails that define your IUL's growth potential and downside protection.
                Master these concepts to maximize your policy's performance.
              </p>

              <div className="space-y-3 mb-8">
                {["0% floor protects against market losses", "Caps provide predictable maximum returns", "Index credits locked in each year"].map((item, i) => (
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

            {/* Cap & Floor Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Cap & Floor Visualizer</h3>
                <p className="text-gray-600 text-sm">See how caps and floors protect your returns</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Return: <span className={`font-bold ${marketReturn >= 0 ? 'text-green-600' : 'text-red-500'}`}>{marketReturn >= 0 ? '+' : ''}{marketReturn}%</span>
                  </label>
                  <input
                    type="range"
                    min="-30"
                    max="35"
                    value={marketReturn}
                    onChange={(e) => setMarketReturn(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-30%</span>
                    <span>+35%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cap Rate: <span className="text-heritage-accent font-bold">{cap}%</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="14"
                    value={cap}
                    onChange={(e) => setCap(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>6%</span>
                    <span>14%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Rate: <span className="text-heritage-accent font-bold">{floor}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.5"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>2%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Your Credited Rate</p>
                  <p className="text-4xl font-bold text-heritage-accent">{creditedRate.toFixed(1)}%</p>
                  <p className="text-xs opacity-75 mt-2">
                    {marketReturn < 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" /> Floor protected you from a {Math.abs(marketReturn)}% loss!
                      </span>
                    ) : marketReturn > cap ? (
                      <span className="flex items-center justify-center gap-1">
                        <Target className="w-3 h-3" /> Cap applied - still earned {cap}%
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Full market return credited
                      </span>
                    )}
                  </p>
                </div>

                {marketReturn < 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Protection Activated</p>
                        <p className="text-xs text-green-700 mt-1">You avoided a {Math.abs(marketReturn)}% loss. Direct investors lost money—you didn't.</p>
                      </div>
                    </div>
                  </div>
                )}

                {marketReturn > cap && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Target className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Cap Applied</p>
                        <p className="text-xs text-amber-700 mt-1">Market returned {marketReturn}%, you earned {cap}%. The tradeoff for downside protection.</p>
                      </div>
                    </div>
                  </div>
                )}

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Your Personalized Quote
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
              { value: "8-14%", label: "Typical Cap Range" },
              { value: "0%", label: "Common Floor" },
              { value: "50-150%", label: "Participation Range" },
              { value: "Protected", label: "From Market Loss" }
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
              The Power of Caps & Floors
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Understanding these key concepts helps you make the most of your IUL policy.
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

      {/* Interactive 5-Year Comparison */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              5-Year Real-World Comparison
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how a {cap}% cap with {floor}% floor would have performed vs. direct S&P 500 investment.
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
                      <p className="text-xs text-green-600">{cap}% cap, {floor}% floor</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {marketYears.map((year) => {
                      const credit = calculateCredit(year.return);
                      return (
                        <div key={year.year} className="flex justify-between items-center py-2 border-b border-green-200">
                          <span className="text-gray-600">{year.year}</span>
                          <div className="text-right">
                            <span className="font-bold text-green-600">+{credit.toFixed(1)}%</span>
                            {year.return < 0 && <span className="text-xs text-green-500 ml-2">(Protected)</span>}
                            {year.return > cap && <span className="text-xs text-green-500 ml-2">(Capped)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <div className="flex justify-between">
                      <span className="font-medium text-green-800">5-Year Total</span>
                      <span className="font-bold text-green-600">
                        +{marketYears.reduce((sum, year) => sum + calculateCredit(year.return), 0).toFixed(1)}%
                      </span>
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
                      <p className="text-xs text-gray-500">No protection</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {marketYears.map((year) => (
                      <div key={year.year} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">{year.year}</span>
                        <span className={`font-bold ${year.return >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {year.return >= 0 ? '+' : ''}{year.return}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">5-Year Total</span>
                      <span className="font-bold text-gray-700">
                        +{marketYears.reduce((sum, year) => sum + year.return, 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-heritage-accent/10 rounded-lg">
                <p className="text-center text-heritage-primary font-medium">
                  <span className="font-bold">Key Insight:</span> The IUL provided smoother, more predictable growth.
                  In 2022, when the market dropped 19.4%, IUL holders were protected while direct investors lost money.
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
                  src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80"
                  alt="Financial security and planning"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary">Protected</p>
                    <p className="text-xs text-gray-500">0% floor guarantee</p>
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
              How Caps & Floors Work
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
              "Understanding caps and floors changed everything. I stopped chasing maximum returns
              and started appreciating consistent, protected growth. My index credits have been positive every year."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Patricia L.</p>
                <p className="text-white/70 text-sm">IUL Policyholder, Denver</p>
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
              Ready for Protected Growth?
            </h2>
            <p className="text-gray-600 mb-8">
              See current cap rates and find the IUL that fits your goals. Get a personalized illustration today.
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
