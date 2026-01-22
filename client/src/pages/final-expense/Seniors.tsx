import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Heart,
  Clock,
  DollarSign,
  Award,
  Users,
  AlertCircle,
  Pill,
  Activity,
  Calendar,
  Stethoscope,
  BadgeCheck
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

export default function Seniors() {
  const [age, setAge] = useState(70);
  const [coverage, setCoverage] = useState(15000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<string | null>(null);
  const [showBracketDetails, setShowBracketDetails] = useState(false);

  // Age-adjusted premium
  const estimatedPremium = Math.round((coverage / 1000) * (age * 0.09 + 1.8));

  // Age bracket data for the interactive finder
  const ageBrackets = {
    "50-65": {
      title: "Early Senior Years",
      range: "50-65",
      description: "The ideal time to lock in the lowest rates. Most coverage options available.",
      bestOptions: [
        { type: "Simplified Issue", reason: "Lowest premiums, immediate coverage", recommended: true },
        { type: "Guaranteed Issue", reason: "Available if health issues exist", recommended: false },
        { type: "Term Life", reason: "Can still qualify for term policies", recommended: false }
      ],
      premiumRange: "$25-$60/month",
      coverageRange: "$10,000 - $50,000",
      healthImpact: "Minor health issues rarely affect eligibility",
      topBenefit: "Lock in lowest rates for life",
      color: "green"
    },
    "65-75": {
      title: "Prime Coverage Window",
      range: "65-75",
      description: "Most common age to purchase final expense. Excellent options still available.",
      bestOptions: [
        { type: "Simplified Issue", reason: "Good rates with immediate coverage", recommended: true },
        { type: "Guaranteed Issue", reason: "100% acceptance if needed", recommended: false },
        { type: "Modified Benefit", reason: "Middle ground option", recommended: false }
      ],
      premiumRange: "$45-$90/month",
      coverageRange: "$10,000 - $35,000",
      healthImpact: "Managed conditions typically qualify",
      topBenefit: "Balance of affordability and coverage",
      color: "green"
    },
    "75-85": {
      title: "Guaranteed Acceptance",
      range: "75-85",
      description: "Coverage available regardless of health. Premiums are higher but still affordable.",
      bestOptions: [
        { type: "Guaranteed Issue", reason: "100% acceptance, no health questions", recommended: true },
        { type: "Simplified Issue", reason: "If you can answer health questions favorably", recommended: false },
        { type: "Graded Benefit", reason: "Lower premiums with waiting period", recommended: false }
      ],
      premiumRange: "$70-$150/month",
      coverageRange: "$5,000 - $25,000",
      healthImpact: "All conditions accepted with guaranteed issue",
      topBenefit: "Guaranteed acceptance regardless of health",
      color: "amber"
    }
  };

  const handleBracketSelect = (bracket: string) => {
    setSelectedAgeBracket(bracket);
    setShowBracketDetails(true);
  };

  const ageGroups = [
    {
      range: "50-64",
      title: "Early Planning",
      description: "Lowest premiums, most options available",
      benefits: ["Lowest rates lock in for life", "All policy types available", "Best time to get coverage"]
    },
    {
      range: "65-74",
      title: "Prime Coverage",
      description: "Most common age to purchase final expense",
      benefits: ["Competitive rates", "Many options still available", "Simplified issue often qualifies"]
    },
    {
      range: "75-85",
      title: "Guaranteed Options",
      description: "Coverage available regardless of health",
      benefits: ["Guaranteed acceptance policies", "No medical exams", "Premiums stay level for life"]
    }
  ];

  const seniorBenefits = [
    {
      icon: Shield,
      title: "Guaranteed Acceptance",
      description: "Coverage available up to age 85 with no health questions"
    },
    {
      icon: DollarSign,
      title: "Fixed Premiums",
      description: "Your rate never increases, no matter your age or health"
    },
    {
      icon: Heart,
      title: "No Medical Exams",
      description: "No doctors, blood tests, or physical exams required"
    },
    {
      icon: Clock,
      title: "Lifetime Coverage",
      description: "Policy never expires as long as premiums are paid"
    }
  ];

  const commonConditions = [
    { condition: "Diabetes", qualifying: true },
    { condition: "High Blood Pressure", qualifying: true },
    { condition: "Heart Disease (stable)", qualifying: true },
    { condition: "COPD", qualifying: true },
    { condition: "Cancer History (5+ years)", qualifying: true },
    { condition: "Arthritis", qualifying: true },
    { condition: "Previous Stroke (stable)", qualifying: true },
    { condition: "Taking Medications", qualifying: true }
  ];

  const concerns = [
    {
      concern: "I'm too old to get coverage",
      response: "Coverage is available up to age 85. Many carriers specialize in senior coverage with guaranteed acceptance."
    },
    {
      concern: "My health issues will disqualify me",
      response: "Guaranteed issue policies accept everyone regardless of health. Even terminal illness won't prevent you from getting covered."
    },
    {
      concern: "I can't afford the premiums",
      response: "Coverage starts as low as $20-30/month. Policies range from $5,000-$25,000 to fit any budget."
    },
    {
      concern: "The process is too complicated",
      response: "Applications take 15-20 minutes by phone. No medical exams, no paperwork hassle."
    }
  ];

  const faqs = [
    {
      question: "What's the oldest age I can apply?",
      answer: "Most final expense policies accept applicants up to age 85. Some carriers offer coverage up to age 89. Guaranteed issue policies are available at all ages within these ranges regardless of health status."
    },
    {
      question: "Will my premiums increase as I get older?",
      answer: "No. Final expense premiums are locked in at the time of purchase and never increase. A policy purchased at 70 will have the same premium at 80, 90, and beyond."
    },
    {
      question: "Can I get coverage with pre-existing conditions?",
      answer: "Yes. Many conditions like diabetes, heart disease, and COPD qualify for simplified issue coverage. Guaranteed issue policies accept any health condition with no questions asked."
    },
    {
      question: "How much coverage do seniors typically need?",
      answer: "Most seniors choose $10,000-$20,000 to cover funeral costs, burial, and related expenses. Some add extra for outstanding bills or to leave a small inheritance."
    },
    {
      question: "What if I already have life insurance?",
      answer: "Final expense insurance can supplement existing coverage. Unlike large policies, it pays out quickly (often within 48 hours) to cover immediate expenses while other matters settle."
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
                <Users className="w-4 h-4" />
                Coverage for Ages 50-85
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Final Expense
                <span className="block text-heritage-accent">Coverage for Seniors</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                It's never too late to protect your family. Affordable coverage designed specifically for seniors, with options for every health situation.
              </p>

              <div className="space-y-3 mb-8">
                {["Coverage available ages 50-85", "No medical exams required", "Premiums locked in for life"].map((item, i) => (
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
                    Call for Senior Rates
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Senior Quote Tool */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Senior Rate Calculator</h3>
                <p className="text-gray-600 text-sm">See rates for your age</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-heritage-accent font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="85"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50</span>
                    <span>65</span>
                    <span>75</span>
                    <span>85</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-heritage-accent font-bold">${coverage.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="1000"
                    value={coverage}
                    onChange={(e) => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$5,000</span>
                    <span>$15,000</span>
                    <span>$25,000</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold">${estimatedPremium}</p>
                  <p className="text-xs opacity-75 mt-2">*Rate locked in for life</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Senior-Friendly Coverage</p>
                      <p className="text-xs text-green-700 mt-1">No medical exam • Simple application • Quick approval</p>
                    </div>
                  </div>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                  >
                    Get Exact Quote
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
              { value: "50-85", label: "Age Range" },
              { value: "$20+", label: "Starting Monthly" },
              { value: "No Exam", label: "Required" },
              { value: "Lifetime", label: "Coverage" }
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

      {/* Age Groups */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Coverage by Age Group
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Options exist for every age. Here's what to expect.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {ageGroups.map((group, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-heritage-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{group.range}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-heritage-primary">{group.title}</h3>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-heritage-accent flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Age-Based Coverage Finder */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Find Your Best Coverage Option
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Click your age bracket to see the best coverage options, typical premiums, and recommendations for your situation.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Age Bracket Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-4 mb-8"
            >
              {Object.entries(ageBrackets).map(([key, bracket]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBracketSelect(key)}
                  className={`p-6 rounded-xl text-center transition-all ${
                    selectedAgeBracket === key
                      ? bracket.color === "green"
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-amber-500 text-white shadow-lg"
                      : "bg-white text-heritage-primary hover:shadow-md"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    selectedAgeBracket === key
                      ? "bg-white/20"
                      : bracket.color === "green" ? "bg-green-100" : "bg-amber-100"
                  }`}>
                    <span className={`text-xl font-bold ${
                      selectedAgeBracket === key
                        ? "text-white"
                        : bracket.color === "green" ? "text-green-600" : "text-amber-600"
                    }`}>
                      {bracket.range}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{bracket.title}</h3>
                  <p className={`text-sm ${
                    selectedAgeBracket === key ? "text-white/80" : "text-gray-500"
                  }`}>
                    {bracket.premiumRange}
                  </p>
                </motion.button>
              ))}
            </motion.div>

            {/* Detailed Results */}
            <AnimatePresence>
              {showBracketDetails && selectedAgeBracket && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  {(() => {
                    const bracket = ageBrackets[selectedAgeBracket as keyof typeof ageBrackets];
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                      >
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Left Column - Overview */}
                          <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                              bracket.color === "green"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              <Users className="w-4 h-4" />
                              Ages {bracket.range}
                            </div>

                            <h3 className="text-2xl font-bold text-heritage-primary mb-3">
                              {bracket.title}
                            </h3>

                            <p className="text-gray-600 mb-6">
                              {bracket.description}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-[#fffaf3] rounded-lg">
                                <span className="text-sm text-gray-600">Typical Premiums</span>
                                <span className="font-bold text-heritage-accent">{bracket.premiumRange}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-[#fffaf3] rounded-lg">
                                <span className="text-sm text-gray-600">Coverage Range</span>
                                <span className="font-bold text-heritage-primary">{bracket.coverageRange}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-[#fffaf3] rounded-lg">
                                <span className="text-sm text-gray-600">Health Impact</span>
                                <span className="font-semibold text-gray-700 text-sm text-right max-w-[180px]">{bracket.healthImpact}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Best Options */}
                          <div>
                            <h4 className="font-bold text-heritage-primary mb-4">Best Coverage Options</h4>
                            <div className="space-y-3">
                              {bracket.bestOptions.map((option, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.1 }}
                                  className={`p-4 rounded-lg ${
                                    option.recommended
                                      ? bracket.color === "green"
                                        ? "bg-green-50 border-2 border-green-300"
                                        : "bg-amber-50 border-2 border-amber-300"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`font-semibold ${
                                      option.recommended
                                        ? bracket.color === "green" ? "text-green-700" : "text-amber-700"
                                        : "text-gray-700"
                                    }`}>
                                      {option.type}
                                    </span>
                                    {option.recommended && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        bracket.color === "green"
                                          ? "bg-green-500 text-white"
                                          : "bg-amber-500 text-white"
                                      }`}>
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{option.reason}</p>
                                </motion.div>
                              ))}
                            </div>

                            {/* Top Benefit Highlight */}
                            <div className={`mt-6 p-4 rounded-lg ${
                              bracket.color === "green"
                                ? "bg-green-100 border border-green-200"
                                : "bg-amber-100 border border-amber-200"
                            }`}>
                              <div className="flex items-center gap-2">
                                <CheckCircle className={`w-5 h-5 ${
                                  bracket.color === "green" ? "text-green-600" : "text-amber-600"
                                }`} />
                                <span className={`font-semibold ${
                                  bracket.color === "green" ? "text-green-800" : "text-amber-800"
                                }`}>
                                  Key Advantage: {bracket.topBenefit}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Link href="/quote">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-8 bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                          >
                            Get a Quote for Ages {bracket.range}
                            <ChevronRight className="w-5 h-5" />
                          </motion.button>
                        </Link>
                      </motion.div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt to select */}
            {!showBracketDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8 bg-white rounded-xl shadow-sm"
              >
                <Users className="w-12 h-12 text-heritage-accent mx-auto mb-4" />
                <p className="text-gray-600">Click your age bracket above to see personalized coverage recommendations</p>
              </motion.div>
            )}
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
              Why Seniors Choose Final Expense
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {seniorBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
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

      {/* Health Conditions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Coverage with Health Conditions
              </h2>
              <p className="text-gray-600 mb-6">
                Most health conditions don't prevent you from getting coverage. These common conditions typically qualify for simplified issue or guaranteed issue policies.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {commonConditions.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-green-50 rounded-lg p-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item.condition}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                *Even conditions not listed may qualify. Guaranteed issue accepts all health conditions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769116558696-istockphoto-1980166648-612x612.jpg?alt=media&token=ab5c2ab3-c0d9-46a2-9b29-db9dc20bd608"
                  alt="Senior couple"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary text-sm">No Exam</p>
                    <p className="text-xs text-gray-500">Ever Required</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Common Concerns */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Addressing Common Concerns
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {concerns.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="font-semibold text-heritage-primary">"{item.concern}"</p>
                </div>
                <div className="flex items-start gap-3 pl-8">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">{item.response}</p>
                </div>
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
              "At 78, I thought insurance wasn't an option. I was approved in one phone call with no medical exam. The peace of mind is worth every penny."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Dorothy H.</p>
                <p className="text-white/70 text-sm">Age 78, Arizona</p>
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
              Senior Coverage Questions
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
              Get Senior-Friendly Coverage
            </h2>
            <p className="text-gray-600 mb-8">
              No medical exam. No health questions (guaranteed issue). Approval in minutes.
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
