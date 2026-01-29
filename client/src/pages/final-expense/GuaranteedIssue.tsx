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
  FileText,
  Heart,
  Clock,
  Users,
  AlertCircle,
  DollarSign,
  Award,
  Calendar,
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

export default function GuaranteedIssue() {
  const [age, setAge] = useState(65);
  const [coverage, setCoverage] = useState(10000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [eligibilityAge, setEligibilityAge] = useState<string>("");
  const [showEligibilityResult, setShowEligibilityResult] = useState(false);

  // Simple premium estimate for guaranteed issue
  const estimatedPremium = Math.round((coverage / 1000) * (age * 0.12 + 2.5));

  // Eligibility age checker logic
  const getEligibilityResult = () => {
    const ageNum = parseInt(eligibilityAge);
    if (isNaN(ageNum)) return null;

    if (ageNum < 50) {
      return {
        eligible: false,
        message: "Not Yet Eligible",
        description: "Guaranteed issue coverage is typically available starting at age 50. However, you may qualify for simplified issue coverage with immediate benefits and lower premiums.",
        options: ["Simplified Issue (ages 18-85)", "Term Life Insurance", "Whole Life Insurance"],
        color: "amber"
      };
    } else if (ageNum >= 50 && ageNum <= 64) {
      return {
        eligible: true,
        message: "Eligible - Best Rates Available",
        description: "At your age, you have access to the lowest premium rates. You may also qualify for simplified issue coverage with immediate benefits.",
        options: ["Guaranteed Issue ($5K-$25K)", "Simplified Issue (if health qualifies)", "Combination policies available"],
        coverageRange: "$5,000 - $25,000",
        estimatedRate: `$${Math.round(25 + (ageNum - 50) * 1.5)}-$${Math.round(45 + (ageNum - 50) * 2.5)}/month`,
        color: "green"
      };
    } else if (ageNum >= 65 && ageNum <= 74) {
      return {
        eligible: true,
        message: "Eligible - Prime Coverage Window",
        description: "You're in the most common age range for final expense coverage. Guaranteed acceptance regardless of health conditions.",
        options: ["Guaranteed Issue ($5K-$25K)", "No medical exam required", "Premiums locked for life"],
        coverageRange: "$5,000 - $25,000",
        estimatedRate: `$${Math.round(40 + (ageNum - 65) * 2)}-$${Math.round(70 + (ageNum - 65) * 3.5)}/month`,
        color: "green"
      };
    } else if (ageNum >= 75 && ageNum <= 85) {
      return {
        eligible: true,
        message: "Eligible - Guaranteed Acceptance",
        description: "Coverage is available with no health questions. 100% acceptance regardless of any health conditions.",
        options: ["Guaranteed Issue ($5K-$25K)", "No health questions", "Graded benefit (2-3 year wait for full benefit)"],
        coverageRange: "$5,000 - $25,000",
        estimatedRate: `$${Math.round(60 + (ageNum - 75) * 3)}-$${Math.round(100 + (ageNum - 75) * 5)}/month`,
        color: "green"
      };
    } else {
      return {
        eligible: false,
        message: "Above Standard Age Range",
        description: "Most guaranteed issue policies have an upper age limit of 85. However, some carriers offer coverage up to age 89. Contact us to discuss your options.",
        options: ["Limited carrier options available", "Contact agent for personalized help", "Final expense alternatives"],
        color: "amber"
      };
    }
  };

  const handleEligibilityCheck = () => {
    if (eligibilityAge.trim()) {
      setShowEligibilityResult(true);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "No Health Questions",
      description: "100% acceptance regardless of health conditions"
    },
    {
      icon: FileText,
      title: "No Medical Exam",
      description: "No doctors, no tests, no waiting for results"
    },
    {
      icon: Clock,
      title: "Quick Approval",
      description: "Coverage can begin within 24-48 hours"
    },
    {
      icon: Heart,
      title: "Permanent Coverage",
      description: "Policy stays active for your entire lifetime"
    }
  ];

  const idealFor = [
    "Seniors with serious health conditions",
    "Those declined by other insurers",
    "People with chronic illnesses",
    "Anyone wanting guaranteed acceptance",
    "Those who value simplicity"
  ];

  const considerations = [
    {
      title: "Graded Death Benefit",
      description: "Full benefit after 2-3 year waiting period. Limited payout if death occurs earlier."
    },
    {
      title: "Higher Premiums",
      description: "Costs more than simplified issue due to guaranteed acceptance."
    },
    {
      title: "Coverage Limits",
      description: "Typically $5,000 to $25,000 maximum coverage."
    }
  ];

  const faqs = [
    {
      question: "What does 'guaranteed issue' mean?",
      answer: "Guaranteed issue means you cannot be denied coverage for any reason. There are no health questions, no medical exams, and no underwriting. If you meet the age requirements and can pay the premium, you're approved."
    },
    {
      question: "What is the graded benefit period?",
      answer: "Most guaranteed issue policies have a 2-3 year waiting period before the full death benefit is paid. If you pass away during this period, beneficiaries typically receive a return of premiums paid plus interest (usually 10%)."
    },
    {
      question: "Who qualifies for guaranteed issue?",
      answer: "Anyone within the age range (typically 50-85) qualifies. There are no health restrictions—even terminal illness won't disqualify you. You simply need to answer basic identity questions and pay the premium."
    },
    {
      question: "Is guaranteed issue more expensive?",
      answer: "Yes, premiums are higher than simplified or fully underwritten policies because the insurer assumes more risk. However, for those who can't qualify for other coverage, it provides valuable peace of mind."
    },
    {
      question: "Can my premiums increase?",
      answer: "No. Guaranteed issue final expense policies have level premiums that never increase for the life of the policy, regardless of age or health changes."
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
                <Shield className="w-4 h-4" />
                100% Acceptance Guaranteed
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                Guaranteed Issue
                <span className="block text-violet-500">Final Expense</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed text-pretty">
                No health questions. No medical exams. No denials. Coverage for everyone, regardless of health conditions.
              </p>

              <div className="space-y-3 mb-8">
                {["Acceptance guaranteed regardless of health", "No medical exams or doctor visits", "Premiums locked in for life"].map((item, i) => (
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
                    Get Your Quote
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

            {/* Premium Estimator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Premium Estimator</h3>
                <p className="text-gray-600 text-sm">See your estimated monthly cost</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-violet-500 font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="85"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50</span>
                    <span>85</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-violet-500 font-bold">${coverage.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="1000"
                    value={coverage}
                    onChange={(e) => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$5,000</span>
                    <span>$25,000</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold">${estimatedPremium}</p>
                  <p className="text-xs opacity-75 mt-2">*Actual rates may vary by state and carrier</p>
                </div>

                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-4 rounded-lg font-semibold"
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
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "100%", label: "Acceptance Rate" },
              { value: "0", label: "Health Questions" },
              { value: "24-48hrs", label: "Approval Time" },
              { value: "50-85", label: "Age Range" }
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
              Why Choose Guaranteed Issue?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              The simplest path to final expense coverage with zero health barriers.
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

      {/* Interactive Eligibility Age Checker */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Check Your Eligibility
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Enter your age to see your guaranteed issue coverage options and estimated rates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={eligibilityAge}
                    onChange={(e) => {
                      setEligibilityAge(e.target.value);
                      setShowEligibilityResult(false);
                    }}
                    placeholder="e.g., 65"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none text-lg"
                  />
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEligibilityCheck}
                    className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Check Eligibility
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {showEligibilityResult && getEligibilityResult() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    {(() => {
                      const result = getEligibilityResult();
                      if (!result) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className={`rounded-xl p-6 ${
                            result.color === "green"
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-amber-50 border-2 border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {result.color === "green" ? (
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                              <AlertCircle className="w-8 h-8 text-amber-600" />
                            )}
                            <h3 className={`text-xl font-bold ${
                              result.color === "green" ? "text-green-800" : "text-amber-800"
                            }`}>
                              {result.message}
                            </h3>
                          </div>

                          <p className={`mb-4 ${
                            result.color === "green" ? "text-green-700" : "text-amber-700"
                          }`}>
                            {result.description}
                          </p>

                          {'coverageRange' in result && (
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white/60 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Coverage Range</p>
                                <p className="text-lg font-bold text-primary">{result.coverageRange}</p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Estimated Premium</p>
                                <p className="text-lg font-bold text-primary">{result.estimatedRate}</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Your Options:</p>
                            {result.options.map((option, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className={`w-4 h-4 ${
                                  result.color === "green" ? "text-green-500" : "text-amber-500"
                                }`} />
                                <span className="text-gray-700 text-sm">{option}</span>
                              </motion.div>
                            ))}
                          </div>

                          <Link href="/quote">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full mt-6 bg-violet-500 hover:bg-violet-500/90 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                              Get Your Personalized Quote
                              <ChevronRight className="w-5 h-5" />
                            </motion.button>
                          </Link>
                        </motion.div>
                      );
                    })()}
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
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769116290684-caretech-26.jpg?alt=media&token=efa35480-86c0-4696-86c3-3c6dc788cdb3"
                  alt="Senior couple at peace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Approved</p>
                    <p className="text-xs text-gray-500">No health questions</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              Important to Know
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Understand the trade-offs of guaranteed acceptance coverage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
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
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-balance">
              How Guaranteed Issue Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Apply", description: "Answer basic identity questions only", icon: FileText },
              { step: "2", title: "Approve", description: "Instant approval—no waiting", icon: CheckCircle },
              { step: "3", title: "Pay", description: "Set up monthly premium payment", icon: DollarSign },
              { step: "4", title: "Covered", description: "Coverage begins immediately", icon: Shield }
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
              "After being declined twice due to my diabetes, I was approved instantly with guaranteed issue. It's a huge relief knowing my family is protected."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Robert M.</p>
                <p className="text-white/70 text-sm">Age 72, Texas</p>
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
              Get Approved Today
            </h2>
            <p className="text-gray-600 mb-8 text-pretty">
              No health questions. No waiting. Just protection for your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-violet-500 hover:bg-violet-500/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Your Free Quote
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
