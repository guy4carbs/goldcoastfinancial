import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
  Star,
  Clock,
  FileText,
  AlertCircle,
  Users,
  DollarSign,
  Activity,
  Clipboard,
  Timer,
  ThumbsUp,
  XCircle,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function NoExam() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'accelerated' | 'simplified' | 'guaranteed'>('accelerated');

  // Eligibility Checker State
  const [eligibilityAge, setEligibilityAge] = useState(40);
  const [isTobaccoUser, setIsTobaccoUser] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [hasBeenHospitalized, setHasBeenHospitalized] = useState(false);
  const [takesMedication, setTakesMedication] = useState(false);
  const [hasCancer, setHasCancer] = useState(false);
  const [showEligibilityResult, setShowEligibilityResult] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    recommendedType: 'accelerated' | 'simplified' | 'guaranteed';
    maxCoverage: string;
    likelihood: 'high' | 'medium' | 'low';
    reason: string;
    tips: string[];
  } | null>(null);

  // Calculate eligibility
  const checkEligibility = () => {
    let riskScore = 0;
    const tips: string[] = [];

    // Age factor
    if (eligibilityAge > 60) riskScore += 2;
    else if (eligibilityAge > 50) riskScore += 1;

    // Health factors
    if (isTobaccoUser) {
      riskScore += 2;
      tips.push("Tobacco use limits your options to simplified or guaranteed issue.");
    }
    if (hasDiabetes) {
      riskScore += 2;
      tips.push("Controlled diabetes may qualify for simplified issue.");
    }
    if (hasHeartCondition) {
      riskScore += 3;
      tips.push("Heart conditions typically require simplified or guaranteed issue.");
    }
    if (hasBeenHospitalized) {
      riskScore += 2;
      tips.push("Recent hospitalizations may affect accelerated underwriting eligibility.");
    }
    if (hasCancer) {
      riskScore += 4;
      tips.push("Cancer history usually requires simplified or guaranteed issue.");
    }
    if (takesMedication && !hasDiabetes && !hasHeartCondition) {
      riskScore += 1;
    }

    // Determine recommendation
    let recommendedType: 'accelerated' | 'simplified' | 'guaranteed';
    let maxCoverage: string;
    let likelihood: 'high' | 'medium' | 'low';
    let reason: string;

    if (riskScore <= 1) {
      recommendedType = 'accelerated';
      maxCoverage = '$2M - $5M';
      likelihood = 'high';
      reason = "You appear to be a great candidate for accelerated underwriting. Expect quick approval with competitive rates.";
      if (tips.length === 0) tips.push("Apply online for fastest approval.");
    } else if (riskScore <= 4) {
      recommendedType = 'simplified';
      maxCoverage = '$250K - $500K';
      likelihood = 'medium';
      reason = "Based on your health profile, simplified issue is likely your best option for quick coverage without a medical exam.";
      tips.push("Answer health questions honestly for best results.");
    } else {
      recommendedType = 'guaranteed';
      maxCoverage = '$5K - $25K';
      likelihood = 'low';
      reason = "Guaranteed issue ensures you can get coverage regardless of health conditions. No health questions required.";
      tips.push("Consider supplementing with other coverage if possible.");
    }

    setEligibilityResult({
      recommendedType,
      maxCoverage,
      likelihood,
      reason,
      tips
    });
    setShowEligibilityResult(true);
  };

  const resetEligibilityChecker = () => {
    setShowEligibilityResult(false);
    setEligibilityResult(null);
  };

  const trustStats = [
    { value: "24hrs", label: "Approval Time" },
    { value: "70%", label: "Approval Rate" },
    { value: "$3M", label: "Max Coverage" },
    { value: "No", label: "Needles Required" }
  ];

  const bigStats = [
    { value: "Same Day", label: "Approval Possible", sublabel: "Many policies approved instantly" },
    { value: "$3M", label: "Max Coverage", sublabel: "With accelerated underwriting" },
    { value: "32%", label: "Growth in 2024", sublabel: "Simplified issue popularity" }
  ];

  const examTypes = [
    {
      id: 'accelerated',
      icon: Zap,
      title: "Accelerated Underwriting",
      tagline: "Full Coverage, No Exam",
      approvalTime: "Minutes to Days",
      maxCoverage: "$2M - $5M",
      healthQuestions: "Yes (detailed)",
      medicalRecords: "Electronic review",
      bestFor: "Healthy individuals wanting coverage fast",
      costVsTraditional: "Same or slightly higher",
      process: [
        "Complete online application (15-20 min)",
        "Health data pulled electronically",
        "Algorithm analyzes Rx history, MIB, MVR",
        "Instant decision or short review",
        "Policy issued within days"
      ],
      pros: [
        "Highest coverage available",
        "Rates similar to traditional",
        "No blood draw or urine",
        "Quick approval if healthy",
        "Full underwriting accuracy"
      ],
      cons: [
        "May require full underwriting",
        "Health records reviewed",
        "Not available to all",
        "Some conditions need exam"
      ]
    },
    {
      id: 'simplified',
      icon: Clipboard,
      title: "Simplified Issue",
      tagline: "Quick Questions, Fast Coverage",
      approvalTime: "Same Day - 5 Days",
      maxCoverage: "$250K - $500K",
      healthQuestions: "Yes (5-15 questions)",
      medicalRecords: "Usually not reviewed",
      bestFor: "Minor health issues, need coverage fast",
      costVsTraditional: "10-30% higher",
      process: [
        "Answer health questionnaire (5-15 questions)",
        "No medical exam",
        "Basic background check",
        "Decision based on answers",
        "Coverage begins quickly"
      ],
      pros: [
        "Fast approval process",
        "No exam or lab work",
        "Good for minor conditions",
        "Simple yes/no questions",
        "Predictable qualification"
      ],
      cons: [
        "Lower coverage limits",
        "Higher premiums",
        "Answers can disqualify",
        "Less coverage per dollar"
      ]
    },
    {
      id: 'guaranteed',
      icon: Shield,
      title: "Guaranteed Issue",
      tagline: "No Questions Asked",
      approvalTime: "Instant",
      maxCoverage: "$5K - $25K",
      healthQuestions: "None",
      medicalRecords: "Not reviewed",
      bestFor: "Serious health conditions",
      costVsTraditional: "200-500% higher",
      process: [
        "Provide basic information only",
        "No health questions",
        "Automatic approval guaranteed",
        "Graded benefit (2-3 year wait)",
        "Full benefit after wait period"
      ],
      pros: [
        "Cannot be denied",
        "No health questions",
        "Perfect for serious conditions",
        "Guaranteed acceptance",
        "Simple application"
      ],
      cons: [
        "Very limited coverage",
        "Highest premiums",
        "Graded benefit waiting period",
        "Not cost-effective if healthy"
      ]
    }
  ];

  const comparisonData = [
    { feature: "Medical Exam", accelerated: "No", simplified: "No", guaranteed: "No", traditional: "Yes" },
    { feature: "Health Questions", accelerated: "Detailed", simplified: "Limited (5-15)", guaranteed: "None", traditional: "Detailed" },
    { feature: "Medical Records Review", accelerated: "Electronic", simplified: "Usually No", guaranteed: "No", traditional: "Full Review" },
    { feature: "Max Coverage", accelerated: "$2M-$5M", simplified: "$250K-$500K", guaranteed: "$5K-$25K", traditional: "Unlimited" },
    { feature: "Approval Time", accelerated: "Minutes-Days", simplified: "Same Day-5 Days", guaranteed: "Instant", traditional: "4-8 Weeks" },
    { feature: "Premium Cost", accelerated: "Similar", simplified: "10-30% Higher", guaranteed: "200-500% Higher", traditional: "Lowest" },
    { feature: "Best For", accelerated: "Healthy, Want Speed", simplified: "Minor Issues", guaranteed: "Serious Conditions", traditional: "Best Rates" }
  ];

  const whoQualifies = [
    {
      type: "Accelerated Underwriting",
      icon: ThumbsUp,
      likely: [
        "Ages 18-60 (varies by carrier)",
        "No tobacco use in 3-5 years",
        "BMI between 18-35",
        "No major health conditions",
        "Clean prescription history",
        "No recent hospitalizations"
      ],
      unlikely: [
        "Recent cancer diagnosis",
        "Heart disease or stroke",
        "Insulin-dependent diabetes",
        "Multiple chronic conditions",
        "Hazardous occupation",
        "Recent DUI or drug use"
      ]
    },
    {
      type: "Simplified Issue",
      icon: Clipboard,
      likely: [
        "Ages 18-75 (broader range)",
        "Controlled diabetes",
        "Controlled high blood pressure",
        "History of minor depression/anxiety",
        "Former smoker (1+ year quit)",
        "Overweight but not obese"
      ],
      unlikely: [
        "Current cancer treatment",
        "Recent heart attack/stroke",
        "Oxygen or dialysis dependent",
        "AIDS/HIV positive",
        "Organ transplant recipient",
        "Terminal illness diagnosis"
      ]
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Online Application",
      description: "Simple online form with basic info and coverage needs.",
      time: "10-20 minutes",
      icon: FileText
    },
    {
      step: 2,
      title: "Health Questionnaire",
      description: "Answer health questions. More detailed for accelerated underwriting.",
      time: "5-15 minutes",
      icon: Clipboard
    },
    {
      step: 3,
      title: "Electronic Data Review",
      description: "Systems pull Rx history, MIB data, and driving records automatically.",
      time: "Instant",
      icon: Activity
    },
    {
      step: 4,
      title: "Decision & Approval",
      description: "Instant approval or decision within days. Some cases need additional review.",
      time: "Minutes to Days",
      icon: ThumbsUp
    },
    {
      step: 5,
      title: "Policy Issued",
      description: "Policy issued, coverage begins. Pay first premium to activate.",
      time: "Same Day",
      icon: Shield
    }
  ];

  const faqs = [
    {
      question: "Is no-exam life insurance more expensive?",
      answer: "Depends on type. Accelerated underwriting is priced similarly to traditional if you're healthy. Simplified issue costs 10-30% more. Guaranteed issue costs 2-5x more due to higher insurer risk."
    },
    {
      question: "How do insurers evaluate me without a medical exam?",
      answer: "Accelerated underwriting uses electronic health databases, prescription histories, MIB records, motor vehicle records, and algorithms. Simplified issue relies solely on your answers to health questions."
    },
    {
      question: "Can I be denied no-exam life insurance?",
      answer: "Yes, for accelerated and simplified issue. High-risk indicators may decline you or require an exam. Only guaranteed issue can't deny you - that's why it costs more with limited coverage."
    },
    {
      question: "What is the MIB and how does it affect my application?",
      answer: "MIB is a database of coded health info from previous insurance applications. If you've applied before, your conditions may be on file. Discrepancies can trigger additional underwriting."
    },
    {
      question: "Should I get no-exam insurance if I'm healthy?",
      answer: "If you qualify for accelerated underwriting, yes - similar rates without the exam hassle. Very healthy people might get slightly better rates with an exam, but convenience usually outweighs small savings."
    },
    {
      question: "What happens if I lie on my health questions?",
      answer: "Material misrepresentation can void your policy. If discovered within the contestability period (usually 2 years), claims can be denied. Always answer honestly - there are options for most conditions."
    }
  ];

  const selectedExamType = examTypes.find(t => t.id === selectedType)!;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] py-20 md:py-28 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-primary font-semibold mb-4 tracking-wide uppercase text-sm">
                No-Exam Term Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Skip the Exam.
                <span className="text-primary"> Keep the Coverage.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
                Up to $3M coverage without needles, labs, or waiting weeks. Approved in as little as 10 minutes.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Get Instant Quote <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="tel:6307780800"
                    className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Speak to an Advisor
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* No-Exam Benefits Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">No-Exam Benefits</h3>
                    <p className="text-gray-500">Why skip the medical exam?</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Timer className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Fast Approval</p>
                      <p className="text-sm text-gray-600">Minutes instead of weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <XCircle className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">No Needles</p>
                      <p className="text-sm text-gray-600">No blood draw or urine sample</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Convenient</p>
                      <p className="text-sm text-gray-600">Apply from home, anytime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Similar Rates</p>
                      <p className="text-sm text-gray-600">Competitive pricing if healthy</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">70% of applicants</span> qualify for instant approval
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Eligibility Checker */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              No-Exam Eligibility Checker
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-pretty">
              Answer a few quick questions to see which no-exam option is right for you.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="space-y-6 mb-8">
                {/* Age Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age: <span className="text-primary font-bold">{eligibilityAge}</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="75"
                    value={eligibilityAge}
                    onChange={(e) => { setEligibilityAge(Number(e.target.value)); resetEligibilityChecker(); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>18</span>
                    <span>75</span>
                  </div>
                </div>

                {/* Health Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {[
                    { state: isTobaccoUser, setter: setIsTobaccoUser, label: "Do you use tobacco products?", icon: "cigarette" },
                    { state: hasDiabetes, setter: setHasDiabetes, label: "Have you been diagnosed with diabetes?", icon: "diabetes" },
                    { state: hasHeartCondition, setter: setHasHeartCondition, label: "Do you have a heart condition?", icon: "heart" },
                    { state: hasBeenHospitalized, setter: setHasBeenHospitalized, label: "Hospitalized in the last 2 years?", icon: "hospital" },
                    { state: hasCancer, setter: setHasCancer, label: "History of cancer?", icon: "cancer" },
                    { state: takesMedication, setter: setTakesMedication, label: "Taking prescription medications?", icon: "medication" },
                  ].map((question, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { question.setter(!question.state); resetEligibilityChecker(); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        question.state
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          question.state
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {question.state && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className={`text-sm ${question.state ? 'text-primary font-medium' : 'text-gray-700'}`}>
                          {question.label}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={checkEligibility}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Check My Eligibility
              </motion.button>

              {/* Animated Eligibility Result */}
              <AnimatePresence>
                {showEligibilityResult && eligibilityResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className={`rounded-xl p-6 ${
                      eligibilityResult.likelihood === 'high'
                        ? 'bg-gradient-to-br from-green-600 to-green-700'
                        : eligibilityResult.likelihood === 'medium'
                        ? 'bg-gradient-to-br from-primary to-primary/90'
                        : 'bg-gradient-to-br from-amber-600 to-amber-700'
                    } text-white`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-6"
                      >
                        <p className="text-white/80 text-sm mb-1">Recommended Option</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-3xl font-bold capitalize"
                        >
                          {eligibilityResult.recommendedType === 'accelerated' ? 'Accelerated Underwriting' :
                           eligibilityResult.recommendedType === 'simplified' ? 'Simplified Issue' : 'Guaranteed Issue'}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${
                            eligibilityResult.likelihood === 'high'
                              ? 'bg-white/20'
                              : eligibilityResult.likelihood === 'medium'
                              ? 'bg-violet-500/30'
                              : 'bg-white/20'
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {eligibilityResult.likelihood === 'high' ? 'Approval Likelihood: High' :
                             eligibilityResult.likelihood === 'medium' ? 'Approval Likelihood: Medium' : 'Guaranteed Acceptance'}
                          </span>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4 mb-6"
                      >
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Max Coverage Available</p>
                          <p className="text-xl font-bold text-white">{eligibilityResult.maxCoverage}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-xs mb-1">Typical Approval Time</p>
                          <p className="text-xl font-bold text-white">
                            {eligibilityResult.recommendedType === 'accelerated' ? 'Minutes-Days' :
                             eligibilityResult.recommendedType === 'simplified' ? '1-5 Days' : 'Instant'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="p-4 bg-white/10 rounded-lg mb-4"
                      >
                        <p className="text-sm text-white/90">{eligibilityResult.reason}</p>
                      </motion.div>

                      {eligibilityResult.tips.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="space-y-2 mb-4"
                        >
                          {eligibilityResult.tips.map((tip, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.0 + i * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <AlertCircle className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-white/80">{tip}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <Link href="/quote">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-white hover:bg-white/90 text-primary py-3 rounded-lg font-semibold"
                          >
                            Get My No-Exam Quote
                          </motion.button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Types of No-Exam Insurance */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              3 Types of No-Exam Life Insurance
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              Not all no-exam policies are equal. Know the differences to choose right.
            </motion.p>
          </motion.div>

          {/* Type Selector */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {examTypes.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedType === type.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary'
                }`}
              >
                <type.icon className="w-5 h-5" />
                {type.title}
              </motion.button>
            ))}
          </div>

          {/* Selected Type Details */}
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-gray-200"
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Header & Overview */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <selectedExamType.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedExamType.title}</h3>
                    <p className="text-primary font-semibold">{selectedExamType.tagline}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Approval Time</p>
                    <p className="font-bold text-primary text-lg">{selectedExamType.approvalTime}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Max Coverage</p>
                    <p className="font-bold text-primary text-lg">{selectedExamType.maxCoverage}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Cost vs Traditional</p>
                    <p className="font-bold text-primary text-lg">{selectedExamType.costVsTraditional}</p>
                  </div>
                </div>

                <p className="text-gray-600"><span className="font-semibold">Best for:</span> {selectedExamType.bestFor}</p>
              </div>

              {/* Process */}
              <div className="lg:col-span-1">
                <h4 className="font-bold text-gray-900 mb-4">How It Works</h4>
                <div className="space-y-3">
                  {selectedExamType.process.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-600 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="lg:col-span-1">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Advantages
                </h4>
                <ul className="space-y-2 mb-6">
                  {selectedExamType.pros.map((pro, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>

                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" /> Considerations
                </h4>
                <ul className="space-y-2">
                  {selectedExamType.cons.map((con, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
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
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              No-Exam vs. Traditional: Full Comparison
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              See how each type compares at a glance.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200"
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold bg-violet-500/20">Accelerated</th>
                  <th className="p-4 text-center font-semibold">Simplified</th>
                  <th className="p-4 text-center font-semibold">Guaranteed</th>
                  <th className="p-4 text-center font-semibold">Traditional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-primary font-semibold bg-primary/5">{row.accelerated}</td>
                    <td className="p-4 text-center text-gray-700">{row.simplified}</td>
                    <td className="p-4 text-center text-gray-700">{row.guaranteed}</td>
                    <td className="p-4 text-center text-gray-600">{row.traditional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Who Qualifies */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Do You Qualify?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              Your health history determines which type you can get.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8"
          >
            {whoQualifies.map((qual, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <qual.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{qual.type}</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" /> Likely to Qualify
                    </h4>
                    <ul className="space-y-2">
                      {qual.likely.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> May Not Qualify
                    </h4>
                    <ul className="space-y-2">
                      {qual.unlikely.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-6 bg-gray-50 rounded-xl text-center border border-gray-200"
          >
            <p className="text-gray-700 text-lg">
              <span className="font-semibold">Not sure which you qualify for?</span> Our advisors can review your situation
              and find the best option - even if you have health conditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              How the No-Exam Process Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto text-pretty">
              5 steps - often completed in a single sitting.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <p className="text-primary font-semibold text-sm">{step.time}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-violet-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {bigStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <p className="text-5xl md:text-6xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-xl font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-gray-500">{stat.sublabel}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face"
                  alt="Sarah K."
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-violet-500 fill-violet-500" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <Award className="w-5 h-5 text-violet-500" />
                  <span className="text-violet-500 font-semibold text-sm">Verified Customer</span>
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-6 italic leading-relaxed">
                  "I hate needles and kept putting off life insurance. Applied for a $500K policy during lunch - no exam.
                  Approved in 15 minutes. Wish I'd known about this years ago."
                </blockquote>
                <div>
                  <p className="font-semibold text-white text-lg">Sarah K.</p>
                  <p className="text-white/80">Marketing Manager, Seattle WA</p>
                </div>
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 text-pretty">
              Common questions about no-exam coverage.
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
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-200 ${
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">
              Get Covered Without the Hassle
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
              Apply in minutes. No needles. No waiting. No excuses.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Instant Quote <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak to an Advisor
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
