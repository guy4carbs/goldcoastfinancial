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
  Clock,
  DollarSign,
  Award,
  Calendar,
  AlertCircle,
  Zap,
  TrendingUp
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

export default function GradedBenefits() {
  const [selectedType, setSelectedType] = useState<'immediate' | 'graded'>('immediate');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTimelineYear, setActiveTimelineYear] = useState<number>(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [coverageAmount, setCoverageAmount] = useState(15000);
  const [premiumsPaid, setPremiumsPaid] = useState(1800);

  const immediateFeatures = [
    { label: "Full Death Benefit", value: "Day 1", highlight: true },
    { label: "Health Questions", value: "5-12 questions" },
    { label: "Approval Rate", value: "~80%" },
    { label: "Premium Level", value: "Lower" },
    { label: "Best For", value: "Good health" }
  ];

  const gradedFeatures = [
    { label: "Full Death Benefit", value: "After 2-3 years", highlight: false },
    { label: "Health Questions", value: "None" },
    { label: "Approval Rate", value: "100%" },
    { label: "Premium Level", value: "Higher" },
    { label: "Best For", value: "Health issues" }
  ];

  const gradedTimeline = [
    { year: "Year 1", benefit: "Return of premiums + 10% interest", percentage: "~110%" },
    { year: "Year 2", benefit: "Return of premiums + 10% interest OR 30-50% of face value", percentage: "30-50%" },
    { year: "Year 3+", benefit: "Full death benefit", percentage: "100%" }
  ];

  const whenToChoose = {
    immediate: [
      "You're in relatively good health",
      "You can answer 'no' to basic health questions",
      "You want full coverage from day one",
      "You prefer lower monthly premiums",
      "You have manageable chronic conditions"
    ],
    graded: [
      "You have serious health conditions",
      "You've been declined for other coverage",
      "You want guaranteed acceptance",
      "You're willing to pay higher premiums",
      "You're planning long-term protection"
    ]
  };

  const faqs = [
    {
      question: "What happens if I pass away during the graded period?",
      answer: "During the graded benefit period (typically 2-3 years), your beneficiaries will receive a return of all premiums paid plus interest (usually 10%). Some policies pay a percentage of the face value (30-50%) in year 2. After the waiting period, 100% of the death benefit is paid."
    },
    {
      question: "Are graded benefits only for guaranteed issue policies?",
      answer: "Graded benefits are most common with guaranteed issue policies, but some simplified issue policies may have modified or graded benefits for certain health conditions. Always ask about the benefit structure when applying."
    },
    {
      question: "Can my policy change from graded to immediate?",
      answer: "No, once you purchase a graded benefit policy, it stays graded. However, after the waiting period ends (2-3 years), you'll have full immediate coverage for life. The waiting period only applies once."
    },
    {
      question: "Is death from any cause excluded during the waiting period?",
      answer: "Most policies exclude death from any cause during the graded period, returning premiums plus interest. However, many policies make an exception for accidental death, paying the full benefit even in year one."
    },
    {
      question: "Should I wait to buy coverage?",
      answer: "No—the sooner you start, the sooner your waiting period ends. At age 65, if you buy today, you'll have full coverage by 67-68. Waiting only delays when you're fully protected and premiums increase with age."
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
                <Clock className="w-4 h-4" />
                Understand Your Options
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Graded vs. Immediate
                <span className="block text-heritage-accent">Death Benefits</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Understand the difference between immediate full coverage and graded benefit policies to choose the right protection for your situation.
              </p>

              <div className="space-y-3 mb-8">
                {["Immediate: Full benefit from day one", "Graded: Waiting period, then full benefit", "Both provide permanent lifetime coverage"].map((item, i) => (
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
                    Find Your Best Option
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
                    Talk to an Expert
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* Comparison Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Compare Benefits</h3>
                <p className="text-gray-600 text-sm">Select to see details</p>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSelectedType('immediate')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    selectedType === 'immediate'
                      ? 'bg-heritage-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Immediate
                </button>
                <button
                  onClick={() => setSelectedType('graded')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    selectedType === 'graded'
                      ? 'bg-heritage-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Graded
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {(selectedType === 'immediate' ? immediateFeatures : gradedFeatures).map((feature, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        feature.highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-gray-700 font-medium">{feature.label}</span>
                      <span className={`font-semibold ${feature.highlight ? 'text-green-600' : 'text-heritage-primary'}`}>
                        {feature.value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className={`mt-6 p-4 rounded-lg ${selectedType === 'immediate' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex gap-3">
                  {selectedType === 'immediate' ? (
                    <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${selectedType === 'immediate' ? 'text-green-800' : 'text-amber-800'}`}>
                      {selectedType === 'immediate' ? 'Full Protection Immediately' : 'Waiting Period Applies'}
                    </p>
                    <p className={`text-xs mt-1 ${selectedType === 'immediate' ? 'text-green-700' : 'text-amber-700'}`}>
                      {selectedType === 'immediate'
                        ? 'Your beneficiaries receive 100% from day one'
                        : 'Full benefit after 2-3 year waiting period'}
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Personalized Quote
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Difference */}
      <section className="bg-heritage-primary py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur rounded-xl p-6 text-center"
            >
              <Zap className="w-10 h-10 text-heritage-accent mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Immediate Benefit</h3>
              <p className="text-white/80 text-sm">Full death benefit paid from day one. Requires answering health questions.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur rounded-xl p-6 text-center"
            >
              <Clock className="w-10 h-10 text-heritage-accent mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Graded Benefit</h3>
              <p className="text-white/80 text-sm">Full benefit after 2-3 years. No health questions—guaranteed acceptance.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Graded Benefit Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Interactive Graded Benefit Timeline
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See exactly what your beneficiaries would receive at each stage of the graded benefit period.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Coverage Amount Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount: <span className="text-heritage-accent font-bold">${coverageAmount.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="1000"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Premiums Paid: <span className="text-heritage-accent font-bold">${premiumsPaid.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="600"
                    max="4800"
                    step="100"
                    value={premiumsPaid}
                    onChange={(e) => setPremiumsPaid(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-accent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Interactive Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#fffaf3] rounded-2xl p-8"
            >
              {/* Timeline Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {[0, 1, 2].map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTimelineYear(year);
                        setIsTimelinePlaying(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        activeTimelineYear === year
                          ? year === 2 ? "bg-green-500 text-white" : "bg-heritage-accent text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {year === 0 ? "Year 1" : year === 1 ? "Year 2" : "Year 3+"}
                    </motion.button>
                  ))}
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${((activeTimelineYear + 1) / 3) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      activeTimelineYear === 2 ? "bg-green-500" : "bg-heritage-accent"
                    }`}
                  />
                </div>
              </div>

              {/* Animated Results */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTimelineYear}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl p-6 ${
                    activeTimelineYear === 2
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-amber-50 border-2 border-amber-200"
                  }`}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          activeTimelineYear === 2 ? "bg-green-500" : "bg-heritage-accent"
                        }`}>
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-heritage-primary">
                            {activeTimelineYear === 0 ? "Year 1" : activeTimelineYear === 1 ? "Year 2" : "Year 3+"}
                          </p>
                          <p className={`text-sm ${
                            activeTimelineYear === 2 ? "text-green-600" : "text-amber-600"
                          }`}>
                            {activeTimelineYear === 2 ? "Full Coverage Active" : "Graded Period"}
                          </p>
                        </div>
                      </div>

                      <h4 className={`text-lg font-bold mb-2 ${
                        activeTimelineYear === 2 ? "text-green-800" : "text-amber-800"
                      }`}>
                        {activeTimelineYear === 0
                          ? "Premium Refund + Interest"
                          : activeTimelineYear === 1
                          ? "Partial Benefit or Refund"
                          : "Full Death Benefit"}
                      </h4>

                      <p className={`text-sm ${
                        activeTimelineYear === 2 ? "text-green-700" : "text-amber-700"
                      }`}>
                        {activeTimelineYear === 0
                          ? "If death occurs in year 1, beneficiaries receive all premiums paid plus 10% interest."
                          : activeTimelineYear === 1
                          ? "Beneficiaries receive either premium refund + interest OR 30-50% of face value (whichever is greater, varies by policy)."
                          : "After the waiting period, your beneficiaries receive the full death benefit regardless of cause of death."}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className={`rounded-xl p-6 text-center ${
                        activeTimelineYear === 2 ? "bg-green-100" : "bg-amber-100"
                      }`}>
                        <p className="text-sm text-gray-600 mb-1">Beneficiary Receives</p>
                        <motion.p
                          key={`amount-${activeTimelineYear}-${coverageAmount}-${premiumsPaid}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`text-3xl font-bold ${
                            activeTimelineYear === 2 ? "text-green-600" : "text-heritage-accent"
                          }`}
                        >
                          ${activeTimelineYear === 0
                            ? Math.round(premiumsPaid * 1.1).toLocaleString()
                            : activeTimelineYear === 1
                            ? Math.max(Math.round(premiumsPaid * 2 * 1.1), Math.round(coverageAmount * 0.4)).toLocaleString()
                            : coverageAmount.toLocaleString()}
                        </motion.p>
                        <p className="text-xs text-gray-500 mt-2">
                          {activeTimelineYear === 0
                            ? `(${premiumsPaid.toLocaleString()} premiums + 10% interest)`
                            : activeTimelineYear === 1
                            ? "(Greater of refund or 40% of face value)"
                            : "(100% of coverage amount)"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Play Through Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsTimelinePlaying(true);
                  setActiveTimelineYear(0);
                  setTimeout(() => setActiveTimelineYear(1), 1500);
                  setTimeout(() => setActiveTimelineYear(2), 3000);
                  setTimeout(() => setIsTimelinePlaying(false), 4500);
                }}
                disabled={isTimelinePlaying}
                className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isTimelinePlaying
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-heritage-primary hover:bg-heritage-primary/90 text-white"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                {isTimelinePlaying ? "Playing Timeline..." : "Play Timeline Progression"}
              </motion.button>
            </motion.div>

            {/* Exception Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6"
            >
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-amber-800 mb-2">Important Exception: Accidental Death</p>
                  <p className="text-amber-700 text-sm">
                    Many graded benefit policies pay the <strong>full death benefit</strong> for accidental death even during years 1 and 2. This provides additional peace of mind during the initial waiting period.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* When to Choose */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Which Is Right for You?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary">Choose Immediate If...</h3>
              </div>
              <div className="space-y-3">
                {whenToChoose.immediate.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-heritage-primary">Choose Graded If...</h3>
              </div>
              <div className="space-y-3">
                {whenToChoose.graded.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visual Comparison */}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-[#fffaf3] rounded-2xl p-8"
          >
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Day 1</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Year 1</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Year 2</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Year 3+</p>
              </div>
            </div>

            {/* Immediate Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-heritage-primary">Immediate Benefit</span>
              </div>
              <div className="h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">100% Death Benefit</span>
              </div>
            </div>

            {/* Graded Bar */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-heritage-primary">Graded Benefit</span>
              </div>
              <div className="h-8 rounded-lg flex overflow-hidden">
                <div className="w-1/4 bg-amber-300 flex items-center justify-center">
                  <span className="text-amber-800 text-xs font-medium">Premiums + 10%</span>
                </div>
                <div className="w-1/4 bg-amber-400 flex items-center justify-center">
                  <span className="text-amber-800 text-xs font-medium">30-50%</span>
                </div>
                <div className="w-2/4 bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">100% Death Benefit</span>
                </div>
              </div>
            </div>
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
              "My agent explained both options clearly. I qualified for simplified issue, so I got immediate coverage. The peace of mind knowing my family is protected from day one is priceless."
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
                <p className="text-white font-semibold">James T.</p>
                <p className="text-white/70 text-sm">Age 63, Ohio</p>
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
              Let Us Help You Decide
            </h2>
            <p className="text-gray-600 mb-8">
              We'll review your options and find the best coverage type for your situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Compare Your Options
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
