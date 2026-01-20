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
  DollarSign,
  Award,
  ArrowRight,
  XCircle,
  Zap
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

export default function SimplifiedIssue() {
  const [age, setAge] = useState(60);
  const [coverage, setCoverage] = useState(15000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [healthAnswers, setHealthAnswers] = useState<Record<number, boolean | null>>({});
  const [showQualificationResult, setShowQualificationResult] = useState(false);

  // Lower premium estimate for simplified issue
  const estimatedPremium = Math.round((coverage / 1000) * (age * 0.08 + 1.5));

  // Sample health questions for the interactive tool
  const sampleQuestions = [
    { id: 0, question: "Are you currently hospitalized or in a nursing facility?", knockoutWeight: "high" },
    { id: 1, question: "Have you been diagnosed with a terminal illness?", knockoutWeight: "high" },
    { id: 2, question: "Are you currently receiving dialysis or oxygen therapy?", knockoutWeight: "high" },
    { id: 3, question: "Have you had an organ transplant in the past 2 years?", knockoutWeight: "medium" },
    { id: 4, question: "Have you been diagnosed with AIDS or HIV?", knockoutWeight: "high" },
    { id: 5, question: "Have you had a stroke or heart attack in the past 12 months?", knockoutWeight: "medium" }
  ];

  const getQualificationResult = () => {
    const answeredQuestions = Object.keys(healthAnswers).length;
    if (answeredQuestions < sampleQuestions.length) return null;

    const yesAnswers = Object.values(healthAnswers).filter(v => v === true).length;
    const highKnockouts = sampleQuestions.filter(q => healthAnswers[q.id] === true && q.knockoutWeight === "high").length;

    if (highKnockouts > 0) {
      return {
        likelihood: "low",
        percentage: 15,
        message: "Guaranteed Issue Recommended",
        description: "Based on your answers, you may be better suited for a guaranteed issue policy with 100% acceptance. While premiums are higher, you'll have coverage regardless of health conditions.",
        recommendation: "guaranteed",
        color: "amber"
      };
    } else if (yesAnswers > 1) {
      return {
        likelihood: "moderate",
        percentage: 50,
        message: "May Qualify - Agent Review Suggested",
        description: "Your answers indicate you may still qualify for simplified issue coverage. An agent can review your specific situation and find the best option.",
        recommendation: "review",
        color: "amber"
      };
    } else if (yesAnswers === 1) {
      return {
        likelihood: "good",
        percentage: 75,
        message: "Good Chance of Approval",
        description: "Based on your answers, you have a good chance of qualifying for simplified issue coverage with immediate benefits and lower premiums.",
        recommendation: "simplified",
        color: "green"
      };
    } else {
      return {
        likelihood: "excellent",
        percentage: 95,
        message: "Excellent Chance of Approval",
        description: "Congratulations! Based on your answers, you're very likely to qualify for simplified issue coverage with immediate full death benefit and the lowest available premiums.",
        recommendation: "simplified",
        color: "green"
      };
    }
  };

  const handleQuestionAnswer = (questionId: number, answer: boolean) => {
    setHealthAnswers(prev => ({ ...prev, [questionId]: answer }));
    setShowQualificationResult(false);
  };

  const handleShowResults = () => {
    if (Object.keys(healthAnswers).length === sampleQuestions.length) {
      setShowQualificationResult(true);
    }
  };

  const resetQuiz = () => {
    setHealthAnswers({});
    setShowQualificationResult(false);
  };

  const benefits = [
    {
      icon: FileText,
      title: "No Medical Exam",
      description: "Just answer a few simple health questions"
    },
    {
      icon: DollarSign,
      title: "Lower Premiums",
      description: "Save 20-40% compared to guaranteed issue"
    },
    {
      icon: Zap,
      title: "Immediate Coverage",
      description: "Full death benefit from day one"
    },
    {
      icon: Clock,
      title: "Fast Approval",
      description: "Most applications approved same day"
    }
  ];

  const healthQuestions = [
    "Currently hospitalized or in a nursing facility?",
    "Diagnosed with terminal illness?",
    "Receiving dialysis or oxygen therapy?",
    "Had organ transplant in past 2 years?",
    "Diagnosed with AIDS or HIV?"
  ];

  const comparison = [
    { feature: "Health Questions", simplified: "5-12 questions", guaranteed: "None" },
    { feature: "Medical Exam", simplified: "No", guaranteed: "No" },
    { feature: "Death Benefit", simplified: "Immediate", guaranteed: "Graded (2-3 years)" },
    { feature: "Premium Cost", simplified: "Lower", guaranteed: "Higher" },
    { feature: "Approval Rate", simplified: "~80%", guaranteed: "100%" },
    { feature: "Coverage Amounts", simplified: "Up to $50,000", guaranteed: "Up to $25,000" }
  ];

  const faqs = [
    {
      question: "What health questions will I need to answer?",
      answer: "Simplified issue policies ask 5-12 health questions about serious conditions like terminal illness, recent hospitalizations, dialysis, and major surgeries. They don't ask about common conditions like diabetes, high blood pressure, or most medications."
    },
    {
      question: "Can I qualify with pre-existing conditions?",
      answer: "Yes! Many people with diabetes, heart disease, COPD, and cancer history qualify for simplified issue coverage. The questions focus on current severe conditions, not managed health issues."
    },
    {
      question: "How is this different from guaranteed issue?",
      answer: "Simplified issue has health questions but offers immediate full coverage and lower premiums. Guaranteed issue accepts everyone but has higher costs and a 2-3 year waiting period for full benefits."
    },
    {
      question: "How long does approval take?",
      answer: "Most simplified issue applications are approved the same day, often within hours. There's no medical exam or lab work to wait for."
    },
    {
      question: "What if I'm declined?",
      answer: "If you don't qualify for simplified issue, you can still get guaranteed issue coverage with 100% acceptance. We'll help you find the best option for your situation."
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
                <Zap className="w-4 h-4" />
                Immediate Full Coverage
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Simplified Issue
                <span className="block text-heritage-accent">Final Expense</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                No medical exam required. Just a few health questions for lower premiums and immediate full coverage from day one.
              </p>

              <div className="space-y-3 mb-8">
                {["No doctors visits or blood tests", "Full death benefit starts immediately", "Lower rates than guaranteed issue"].map((item, i) => (
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
                    Check My Eligibility
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

            {/* Premium Estimator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Premium Estimator</h3>
                <p className="text-gray-600 text-sm">Simplified issue rates</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-heritage-accent font-bold">{age}</span>
                  </label>
                  <input
                    type="range"
                    min="45"
                    max="85"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>45</span>
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
                    max="50000"
                    step="1000"
                    value={coverage}
                    onChange={(e) => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$5,000</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold">${estimatedPremium}</p>
                  <p className="text-xs opacity-75 mt-2">*Subject to health question answers</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Immediate Coverage</p>
                      <p className="text-xs text-green-700 mt-1">Full death benefit from day one—no waiting period</p>
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
              { value: "~80%", label: "Approval Rate" },
              { value: "Same Day", label: "Decisions" },
              { value: "20-40%", label: "Premium Savings" },
              { value: "$50K", label: "Max Coverage" }
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
              Why Choose Simplified Issue?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The best balance of easy qualification and affordable coverage.
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

      {/* Interactive Health Questions Preview Tool */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Pre-Qualification Health Screener
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Answer these sample questions to see your likelihood of qualifying for simplified issue coverage.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="space-y-4 mb-6">
                {sampleQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      healthAnswers[q.id] === true
                        ? "border-red-200 bg-red-50"
                        : healthAnswers[q.id] === false
                        ? "border-green-200 bg-green-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-gray-700 font-medium flex-1">{q.question}</p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuestionAnswer(q.id, false)}
                          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                            healthAnswers[q.id] === false
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          No
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuestionAnswer(q.id, true)}
                          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                            healthAnswers[q.id] === true
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          Yes
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowResults}
                  disabled={Object.keys(healthAnswers).length < sampleQuestions.length}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    Object.keys(healthAnswers).length === sampleQuestions.length
                      ? "bg-heritage-accent hover:bg-heritage-accent/90 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  See My Qualification Likelihood
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetQuiz}
                  className="px-6 py-3 border-2 border-heritage-primary text-heritage-primary hover:bg-heritage-primary hover:text-white rounded-lg font-semibold transition-colors"
                >
                  Reset
                </motion.button>
              </div>

              <AnimatePresence>
                {showQualificationResult && getQualificationResult() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 overflow-hidden"
                  >
                    {(() => {
                      const result = getQualificationResult();
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
                              <XCircle className="w-8 h-8 text-amber-600" />
                            )}
                            <h3 className={`text-xl font-bold ${
                              result.color === "green" ? "text-green-800" : "text-amber-800"
                            }`}>
                              {result.message}
                            </h3>
                          </div>

                          {/* Likelihood Meter */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Qualification Likelihood</span>
                              <span className={`font-bold ${
                                result.color === "green" ? "text-green-600" : "text-amber-600"
                              }`}>{result.percentage}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className={`h-full rounded-full ${
                                  result.color === "green" ? "bg-green-500" : "bg-amber-500"
                                }`}
                              />
                            </div>
                          </div>

                          <p className={`mb-4 ${
                            result.color === "green" ? "text-green-700" : "text-amber-700"
                          }`}>
                            {result.description}
                          </p>

                          <Link href="/quote">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                              {result.recommendation === "guaranteed"
                                ? "View Guaranteed Issue Options"
                                : "Get Your Free Quote"}
                              <ChevronRight className="w-5 h-5" />
                            </motion.button>
                          </Link>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-gray-500 mt-4 text-center">
                *This is a simplified screening tool. Actual qualification depends on carrier-specific questions. An agent can provide accurate assessment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conditions That Qualify */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                Conditions That Usually Qualify
              </h2>
              <p className="text-gray-600 mb-6">
                Many common health conditions do NOT disqualify you from simplified issue coverage. Here are conditions that typically qualify:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Type 2 Diabetes",
                  "High Blood Pressure",
                  "Heart Disease (stable)",
                  "COPD (managed)",
                  "Previous Cancer (5+ years)",
                  "Arthritis",
                  "Depression/Anxiety",
                  "Sleep Apnea"
                ].map((condition, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-green-50 rounded-lg p-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{condition}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#fffaf3] rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-xl font-bold text-heritage-primary mb-6 text-center">
                Sample Disqualifying Conditions
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                These conditions typically require guaranteed issue coverage:
              </p>
              <div className="space-y-3">
                {healthQuestions.map((question, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{question}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Simplified vs. Guaranteed Issue
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how simplified issue compares to guaranteed acceptance.
            </p>
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
                  <th className="text-center p-4 font-semibold">Simplified Issue</th>
                  <th className="text-center p-4 font-semibold">Guaranteed Issue</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 text-gray-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-accent font-semibold">{row.simplified}</td>
                    <td className="p-4 text-center text-gray-600">{row.guaranteed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
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
              How Simplified Issue Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Apply", description: "Complete short application online or by phone", icon: FileText },
              { step: "2", title: "Answer", description: "Respond to simple health questions", icon: Heart },
              { step: "3", title: "Approve", description: "Get decision same day—often within hours", icon: CheckCircle },
              { step: "4", title: "Covered", description: "Full coverage begins immediately", icon: Shield }
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
              "I was worried my diabetes would disqualify me, but I was approved the same day. The premiums are affordable and I have full coverage immediately."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80"
                  alt="Testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Patricia L.</p>
                <p className="text-white/70 text-sm">Age 67, Florida</p>
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
              See If You Qualify
            </h2>
            <p className="text-gray-600 mb-8">
              Check your eligibility in minutes. No obligation, no pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Check Eligibility
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
