import { useState } from "react";
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
  Stethoscope,
  AlertCircle,
  Users,
  DollarSign,
  Heart,
  Activity,
  Clipboard,
  Timer,
  ThumbsUp,
  XCircle,
  Scale
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function NoExam() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'accelerated' | 'simplified' | 'guaranteed'>('accelerated');

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
      bestFor: "Healthy individuals wanting full coverage fast",
      costVsTraditional: "Same or slightly higher",
      process: [
        "Complete online application (15-20 min)",
        "Electronic health data pulled automatically",
        "Algorithm analyzes prescription history, MIB, MVR",
        "Instant decision or short review period",
        "Policy issued within days"
      ],
      pros: [
        "Highest coverage amounts available",
        "Rates similar to traditional policies",
        "No blood draw or urine sample",
        "Quick approval for healthy applicants",
        "Full underwriting accuracy"
      ],
      cons: [
        "May be referred to full underwriting",
        "Health records are reviewed",
        "Not available to all applicants",
        "Some conditions may require exam anyway"
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
      bestFor: "Minor health issues, need coverage quickly",
      costVsTraditional: "10-30% higher",
      process: [
        "Answer health questionnaire (5-15 questions)",
        "No medical exam required",
        "Basic background check",
        "Decision based on answers alone",
        "Coverage begins quickly"
      ],
      pros: [
        "Very fast approval process",
        "No medical exam or lab work",
        "Good for minor health conditions",
        "Simple yes/no health questions",
        "Predictable qualification"
      ],
      cons: [
        "Lower coverage limits",
        "Higher premiums than traditional",
        "Health questions can disqualify",
        "Less coverage for your money"
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
      bestFor: "Serious health conditions, guaranteed acceptance",
      costVsTraditional: "200-500% higher",
      process: [
        "Provide basic information only",
        "No health questions asked",
        "Automatic approval guaranteed",
        "Graded death benefit (2-3 year waiting period)",
        "Full benefit after waiting period"
      ],
      pros: [
        "Cannot be denied coverage",
        "No health questions whatsoever",
        "Perfect for serious conditions",
        "Guaranteed acceptance",
        "Simple application process"
      ],
      cons: [
        "Very limited coverage amounts",
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
      description: "Complete a simple online form with your basic information and coverage needs.",
      time: "10-20 minutes",
      icon: FileText
    },
    {
      step: 2,
      title: "Health Questionnaire",
      description: "Answer questions about your health history. For accelerated underwriting, this is more detailed.",
      time: "5-15 minutes",
      icon: Clipboard
    },
    {
      step: 3,
      title: "Electronic Data Review",
      description: "For accelerated underwriting, systems pull prescription history, MIB data, and driving records automatically.",
      time: "Instant",
      icon: Activity
    },
    {
      step: 4,
      title: "Decision & Approval",
      description: "Receive instant approval, or a decision within days. Some cases may be referred for additional review.",
      time: "Minutes to Days",
      icon: ThumbsUp
    },
    {
      step: 5,
      title: "Policy Issued",
      description: "Once approved, your policy is issued and coverage begins. Pay your first premium to activate.",
      time: "Same Day",
      icon: Shield
    }
  ];

  const topCarriers = [
    {
      name: "Ethos",
      maxCoverage: "$2M",
      approvalTime: "10 minutes",
      ages: "20-65",
      highlight: "Best overall no-exam experience"
    },
    {
      name: "Bestow",
      maxCoverage: "$1.5M",
      approvalTime: "5 minutes",
      ages: "21-55",
      highlight: "Fastest instant decisions"
    },
    {
      name: "Haven Life",
      maxCoverage: "$3M",
      approvalTime: "20 minutes",
      ages: "18-64",
      highlight: "Highest coverage amounts"
    },
    {
      name: "Ladder",
      maxCoverage: "$8M",
      approvalTime: "Minutes",
      ages: "20-60",
      highlight: "Flexible coverage adjustments"
    }
  ];

  const faqs = [
    {
      question: "Is no-exam life insurance more expensive?",
      answer: "It depends on the type. Accelerated underwriting policies are often priced similarly to traditional policies if you're healthy. Simplified issue policies typically cost 10-30% more. Guaranteed issue policies can cost 2-5 times more than traditional coverage because the insurer takes on more risk without health information."
    },
    {
      question: "How do insurers evaluate me without a medical exam?",
      answer: "Accelerated underwriting uses electronic health databases, prescription histories (from pharmacy benefit managers), MIB (Medical Information Bureau) records, motor vehicle records, and public records. Algorithms analyze this data to assess risk. For simplified issue, they rely solely on your answers to health questions."
    },
    {
      question: "Can I be denied no-exam life insurance?",
      answer: "Yes, for accelerated and simplified issue policies. If your health history or answers indicate high risk, you may be declined or offered a policy with an exam instead. Only guaranteed issue policies cannot deny you - that's why they're called 'guaranteed' - but they come with much higher costs and limited coverage."
    },
    {
      question: "What is the MIB and how does it affect my application?",
      answer: "The MIB (Medical Information Bureau) is a database shared by insurance companies containing coded health information from previous applications. If you've applied for life or health insurance before, your conditions may be on file. Discrepancies between your application and MIB records can trigger additional underwriting."
    },
    {
      question: "Should I get no-exam insurance if I'm healthy?",
      answer: "If you're healthy and qualify for accelerated underwriting, absolutely - you'll get similar rates without the hassle of an exam. However, if you're very healthy (excellent BMI, no medications, no family history), a traditional exam might get you the absolute best rates. For most healthy people, the convenience of no-exam outweighs the small potential savings."
    },
    {
      question: "What happens if I lie on my health questions?",
      answer: "This is considered material misrepresentation and can void your policy. If you die within the contestability period (usually 2 years) and the insurer discovers misrepresentation, they can deny the claim and only return premiums paid. Always answer honestly - there are options for most health conditions."
    }
  ];

  const selectedExamType = examTypes.find(t => t.id === selectedType)!;

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="bg-heritage-primary py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-heritage-accent font-semibold mb-4 tracking-wide uppercase text-sm">
                No-Exam Term Life Insurance
              </motion.p>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Skip the Exam.
                <span className="text-heritage-accent"> Keep the Coverage.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 leading-relaxed">
                Get up to $3 million in life insurance coverage without needles, lab work, or waiting weeks.
                Approved in as little as 10 minutes.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get Instant Quote <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Speak to an Advisor
                </a>
              </motion.div>
            </motion.div>

            {/* No-Exam Benefits Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-heritage-accent/20 rounded-xl">
                    <Zap className="w-8 h-8 text-heritage-primary" />
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

                <div className="p-4 bg-heritage-primary/10 rounded-xl text-center">
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
      <section className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
                <p className="text-3xl md:text-4xl font-bold text-heritage-primary">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of No-Exam Insurance */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3 Types of No-Exam Life Insurance
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              Not all no-exam policies are created equal. Understanding the differences helps you choose the right one.
            </motion.p>
          </motion.div>

          {/* Type Selector */}
          <div className="flex justify-center gap-4 mb-12">
            {examTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedType === type.id
                    ? 'bg-heritage-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-[#e8e0d5] hover:border-heritage-primary'
                }`}
              >
                <type.icon className="w-5 h-5" />
                {type.title}
              </button>
            ))}
          </div>

          {/* Selected Type Details */}
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#e8e0d5]"
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Header & Overview */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-heritage-primary/10 rounded-2xl">
                    <selectedExamType.icon className="w-10 h-10 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedExamType.title}</h3>
                    <p className="text-heritage-primary font-semibold">{selectedExamType.tagline}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-[#f5f0e8] rounded-xl">
                    <p className="text-sm text-gray-500">Approval Time</p>
                    <p className="font-bold text-heritage-primary text-lg">{selectedExamType.approvalTime}</p>
                  </div>
                  <div className="p-4 bg-[#f5f0e8] rounded-xl">
                    <p className="text-sm text-gray-500">Max Coverage</p>
                    <p className="font-bold text-heritage-primary text-lg">{selectedExamType.maxCoverage}</p>
                  </div>
                  <div className="p-4 bg-[#f5f0e8] rounded-xl">
                    <p className="text-sm text-gray-500">Cost vs Traditional</p>
                    <p className="font-bold text-heritage-primary text-lg">{selectedExamType.costVsTraditional}</p>
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
                      <div className="w-6 h-6 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              No-Exam vs. Traditional: Full Comparison
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how each type of no-exam insurance compares to traditional underwriting.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-[#e8e0d5]"
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-heritage-primary text-white">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold bg-heritage-accent/20">Accelerated</th>
                  <th className="p-4 text-center font-semibold">Simplified</th>
                  <th className="p-4 text-center font-semibold">Guaranteed</th>
                  <th className="p-4 text-center font-semibold">Traditional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-[#f5f0e8]' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center text-heritage-primary font-semibold bg-heritage-primary/5">{row.accelerated}</td>
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
      <section className="py-20 bg-heritage-primary">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Do You Qualify?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-3xl mx-auto">
              Your health history determines which type of no-exam coverage you can get.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {whoQualifies.map((qual, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-heritage-primary/10 rounded-xl">
                    <qual.icon className="w-8 h-8 text-heritage-primary" />
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
            className="mt-8 p-6 bg-white/10 rounded-2xl text-center"
          >
            <p className="text-white text-lg">
              <span className="font-semibold">Not sure which you qualify for?</span> Our advisors can review your situation
              and find the best option - even if you have health conditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How the No-Exam Process Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto">
              From application to approval in 5 simple steps - often completed in a single sitting.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-5 gap-6"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                  <div className="w-12 h-12 bg-heritage-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <div className="p-2 bg-heritage-primary/10 rounded-lg w-fit mb-3">
                    <step.icon className="w-5 h-5 text-heritage-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <p className="text-heritage-primary font-semibold text-sm">{step.time}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-heritage-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {bigStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 text-center shadow-lg border border-[#e8e0d5] hover:shadow-xl transition-shadow"
              >
                <p className="text-5xl md:text-6xl font-bold text-heritage-primary mb-2">{stat.value}</p>
                <p className="text-xl font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-gray-500">{stat.sublabel}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg text-center border border-[#e8e0d5]"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-heritage-accent fill-heritage-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
              "I hate needles and kept putting off life insurance for years. When I found out I could get
              a $500,000 policy without any medical exam, I applied during my lunch break. Approved in
              15 minutes. I wish I'd known about this option years ago."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-heritage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-heritage-primary">SK</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Sarah K.</p>
                <p className="text-gray-500">Marketing Manager, Seattle WA</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600">
              Get answers to common questions about no-exam life insurance.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-2xl shadow-sm overflow-hidden border border-[#e8e0d5]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f5f0e8] transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-heritage-primary flex-shrink-0 transition-transform duration-200 ${
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
      <section className="py-20 bg-heritage-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
              Get Covered Without the Hassle
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Apply in minutes, get approved without needles, and protect your family today.
              No scheduling. No waiting. No excuses.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Get Instant Quote <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:6307780800"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5" /> Speak to an Advisor
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
