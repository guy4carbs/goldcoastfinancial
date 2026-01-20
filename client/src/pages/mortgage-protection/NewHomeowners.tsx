import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Home,
  Shield,
  Calendar,
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
  Key,
  Heart,
  Users
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

export default function NewHomeowners() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(20);
  const [buyerAge, setBuyerAge] = useState(32);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculations
  const mortgageAmount = homePrice * (1 - downPayment / 100);
  const monthlyMortgage = Math.round((mortgageAmount * 0.065 / 12) / (1 - Math.pow(1 + 0.065/12, -360)));
  const ageMultiplier = 1 + (buyerAge - 25) * 0.02;
  const estimatedPremium = Math.round((mortgageAmount / 1000) * 0.16 * ageMultiplier);
  const dailyCost = Math.round((estimatedPremium / 30) * 100) / 100;

  const benefits = [
    {
      icon: Clock,
      title: "Lock in Lower Rates",
      description: "Your age at purchase determines your premium. Younger means cheaper, locked for life."
    },
    {
      icon: Shield,
      title: "Full Mortgage Payoff",
      description: "Coverage matches your exact mortgage balance, protecting your investment completely."
    },
    {
      icon: Heart,
      title: "Family Security",
      description: "Your loved ones keep the home without the burden of mortgage payments."
    },
    {
      icon: Key,
      title: "Protect Your Investment",
      description: "Don't let the unexpected threaten the home you worked so hard to buy."
    }
  ];

  const idealFor = [
    "First-time homebuyers establishing security",
    "Families with children depending on the home",
    "Single-income households needing protection",
    "Anyone who recently closed on a home",
    "Buyers who want peace of mind from day one"
  ];

  const considerations = [
    {
      title: "Apply While Young & Healthy",
      description: "Life insurance rates are based on age and health at time of application. The younger you are when you apply, the lower your premiums."
    },
    {
      title: "Coverage Amount",
      description: "Consider covering your full mortgage balance plus closing costs and a few months of expenses."
    },
    {
      title: "Term Length",
      description: "Match your policy term to your mortgage term (15, 20, or 30 years) for optimal coverage."
    }
  ];

  const faqs = [
    {
      question: "When should new homeowners get mortgage protection?",
      answer: "As soon as possible after closing. Life insurance premiums are based on your age and health at the time of application—the younger and healthier you are, the lower your rates. Waiting could mean higher premiums or potential denial if your health changes."
    },
    {
      question: "Is mortgage protection different from homeowner's insurance?",
      answer: "Yes. Homeowner's insurance protects the physical structure. Mortgage protection pays off your mortgage if you pass away, ensuring your family keeps the home."
    },
    {
      question: "How much coverage do first-time buyers typically need?",
      answer: "Most choose coverage equal to their mortgage balance. Some add extra for closing costs, moving expenses, or an income buffer for their family."
    },
    {
      question: "What if I just bought my home and can't afford another bill?",
      answer: "Mortgage protection for new buyers is surprisingly affordable—often less than a streaming subscription. The cost of NOT having it can be catastrophic for your family."
    },
    {
      question: "Can I get coverage if I had health issues during the home buying process?",
      answer: "Many conditions are still coverable. We work with carriers who specialize in various health situations. Getting coverage while you can is better than waiting."
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
                <Home className="w-4 h-4" />
                New Homeowner Protection
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Protect Your
                <span className="block text-heritage-accent">New Home From Day One</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                You worked hard to buy your first home. Don't let the unexpected take it away from your family. The sooner you apply, the lower your premiums—rates are based on age and health.
              </p>

              <div className="space-y-3 mb-8">
                {["Lock in rates at your current age", "Simple application process", "Match coverage to your exact mortgage"].map((item, i) => (
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
                    Get Protected Now
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

            {/* New Homeowner Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Protection Calculator</h3>
                <p className="text-gray-600 text-sm">See how affordable it is to protect your new home</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Purchase Price: <span className="text-heritage-accent font-bold">${homePrice.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="150000"
                    max="1000000"
                    step="25000"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$150K</span>
                    <span>$1M</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment: <span className="text-heritage-accent font-bold">{downPayment}%</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="30"
                      step="1"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Age: <span className="text-heritage-accent font-bold">{buyerAge}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="60"
                      value={buyerAge}
                      onChange={(e) => setBuyerAge(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs opacity-75 mb-1">Mortgage to Protect</p>
                      <p className="text-2xl font-bold">${mortgageAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-white/20">
                      <p className="text-xs opacity-75 mb-1">Monthly Mortgage</p>
                      <p className="text-2xl font-bold">${monthlyMortgage.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-sm">Est. Protection: <span className="font-bold text-lg">${estimatedPremium}/mo</span></p>
                    <p className="text-xs opacity-75">Just ${dailyCost}/day</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Age Matters</p>
                      <p className="text-xs text-amber-700 mt-1">Premiums increase with age—apply sooner for lower rates</p>
                    </div>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Your Exact Quote
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
              { value: "Younger", label: "Age = Lower Rates" },
              { value: "85%", label: "Qualify Easily" },
              { value: "<$3", label: "Avg Daily Cost" },
              { value: "100%", label: "Mortgage Payoff" }
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
              Why New Homeowners Need Protection
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              You've just made the biggest purchase of your life. Make sure it's protected.
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

      {/* Interactive What's at Stake Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              What's at Stake for Your Family
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See the difference protection makes when the unexpected happens.
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
                {/* Without Protection */}
                <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <h3 className="font-bold text-lg text-red-700">Without Protection</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Family must continue mortgage payments alone",
                      "Risk of foreclosure during grief",
                      "May need to sell home quickly at a loss",
                      "Children may need to change schools",
                      "Financial stress compounds emotional pain"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* With Protection */}
                <div className="p-6 rounded-xl border-2 border-heritage-accent bg-heritage-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-heritage-accent" />
                      <h3 className="font-bold text-lg text-heritage-primary">With Protection</h3>
                    </div>
                    <span className="bg-heritage-accent text-white text-xs px-3 py-1 rounded-full">Peace of Mind</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Mortgage paid off immediately",
                      "Family stays in their home",
                      "No financial pressure during grief",
                      "Stability for children and spouse",
                      "Focus on healing, not bills"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-heritage-accent mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    Protect Your Family Today
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Ideal For New Homeowners Who...
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
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
                  alt="Family in front of their new home"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary">Just Closed?</p>
                    <p className="text-xs text-gray-500">30-day window for best rates</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Important to Know
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key considerations for new homeowner mortgage protection.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{item.title}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Your Path to Protection
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Close on Home", description: "You receive the keys to your new home", icon: Key },
              { step: "2", title: "Apply for Coverage", description: "Complete a simple application process", icon: FileText },
              { step: "3", title: "Get Approved", description: "Approval typically takes 2-4 weeks", icon: CheckCircle },
              { step: "4", title: "Home Protected", description: "Your family's home is secured", icon: Shield }
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
              "We closed on our first home in March. By April, we had mortgage protection in place. It was easier and cheaper than we thought—now we can enjoy our new home without worry."
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
                <p className="text-white font-semibold">James & Emily T.</p>
                <p className="text-white/70 text-sm">First-time homebuyers, Austin TX</p>
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
              New Homeowner Questions
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
              Ready to Protect Your New Home?
            </h2>
            <p className="text-gray-600 mb-8">
              The best time to get protection is within 30 days of closing. Don't wait—your family's security depends on it.
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
