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
  Users,
  Home,
  Car,
  Calendar,
  ListChecks,
  MessageCircle,
  MapPin,
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

export default function PrePlanning() {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("national");
  const [serviceType, setServiceType] = useState<"burial" | "cremation">("burial");
  const [showCalculatorResult, setShowCalculatorResult] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    funeral: true,
    burial: true,
    casket: true,
    marker: true,
    flowers: true,
    other: true
  });

  // Regional cost multipliers
  const regionData: Record<string, { name: string; multiplier: number; avgCost: number }> = {
    national: { name: "National Average", multiplier: 1.0, avgCost: 9420 },
    northeast: { name: "Northeast (NY, NJ, MA)", multiplier: 1.25, avgCost: 11775 },
    midwest: { name: "Midwest (IL, OH, MI)", multiplier: 0.95, avgCost: 8949 },
    south: { name: "South (TX, FL, GA)", multiplier: 0.90, avgCost: 8478 },
    west: { name: "West (CA, WA, AZ)", multiplier: 1.15, avgCost: 10833 },
    mountain: { name: "Mountain (CO, UT, NV)", multiplier: 0.85, avgCost: 8007 }
  };

  // Enhanced expense categories with cremation alternatives
  const expenseCategories = {
    burial: [
      { id: 'funeral', label: 'Funeral Service', base: 2500, icon: Heart },
      { id: 'burial', label: 'Burial/Cemetery Plot', base: 2500, icon: Home },
      { id: 'casket', label: 'Casket', base: 2500, icon: FileText },
      { id: 'vault', label: 'Burial Vault/Liner', base: 1500, icon: Shield },
      { id: 'marker', label: 'Headstone/Marker', base: 2000, icon: Calendar },
      { id: 'flowers', label: 'Flowers & Obituary', base: 800, icon: Users },
      { id: 'transport', label: 'Transportation', base: 500, icon: Car },
      { id: 'other', label: 'Other Costs', base: 1200, icon: DollarSign }
    ],
    cremation: [
      { id: 'funeral', label: 'Memorial Service', base: 1800, icon: Heart },
      { id: 'cremation', label: 'Cremation Fee', base: 1200, icon: Home },
      { id: 'urn', label: 'Urn', base: 300, icon: FileText },
      { id: 'niche', label: 'Columbarium Niche (opt)', base: 1000, icon: Shield },
      { id: 'marker', label: 'Memorial Marker', base: 500, icon: Calendar },
      { id: 'flowers', label: 'Flowers & Obituary', base: 600, icon: Users },
      { id: 'transport', label: 'Transportation', base: 300, icon: Car },
      { id: 'other', label: 'Other Costs', base: 800, icon: DollarSign }
    ]
  };

  const calculateTotalCost = () => {
    const categories = serviceType === "burial" ? expenseCategories.burial : expenseCategories.cremation;
    const multiplier = regionData[selectedRegion].multiplier;

    let total = 0;
    categories.forEach(cat => {
      if (selectedCategories[cat.id] !== false) {
        total += Math.round(cat.base * multiplier);
      }
    });

    return total;
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const expenses = [
    { id: 'funeral', label: 'Funeral Service', min: 7000, max: 12000, avg: 9000, icon: Heart },
    { id: 'burial', label: 'Burial/Cemetery', min: 2000, max: 5000, avg: 3500, icon: Home },
    { id: 'casket', label: 'Casket/Urn', min: 1000, max: 10000, avg: 2500, icon: FileText },
    { id: 'marker', label: 'Headstone/Marker', min: 1000, max: 3000, avg: 2000, icon: Calendar },
    { id: 'flowers', label: 'Flowers/Obituary', min: 500, max: 1500, avg: 800, icon: Users },
    { id: 'other', label: 'Other Costs', min: 500, max: 2000, avg: 1200, icon: DollarSign }
  ];

  const totalMin = expenses.reduce((sum, e) => sum + e.min, 0);
  const totalMax = expenses.reduce((sum, e) => sum + e.max, 0);
  const totalAvg = expenses.reduce((sum, e) => sum + e.avg, 0);

  const planningSteps = [
    {
      step: "1",
      title: "Estimate Your Costs",
      description: "Calculate expected funeral, burial, and related expenses in your area",
      icon: DollarSign
    },
    {
      step: "2",
      title: "Consider Additional Needs",
      description: "Account for medical bills, debts, or gifts you want to leave behind",
      icon: ListChecks
    },
    {
      step: "3",
      title: "Choose Coverage Amount",
      description: "Select a policy that covers your total estimated expenses",
      icon: Shield
    },
    {
      step: "4",
      title: "Document Your Wishes",
      description: "Write down your preferences and share with loved ones",
      icon: FileText
    }
  ];

  const documentChecklist = [
    "Preferred funeral home",
    "Burial or cremation preference",
    "Service location and type",
    "Music and readings selections",
    "Who should be notified",
    "Cemetery plot location (if owned)",
    "Special requests or traditions",
    "Policy information and beneficiary"
  ];

  const familyBenefits = [
    {
      icon: Heart,
      title: "Removes Financial Burden",
      description: "Your family won't face unexpected costs during grief"
    },
    {
      icon: MessageCircle,
      title: "Eliminates Guesswork",
      description: "Clear instructions mean no family disagreements"
    },
    {
      icon: Clock,
      title: "Provides Peace of Mind",
      description: "Knowing everything is arranged brings comfort"
    },
    {
      icon: Users,
      title: "Honors Your Wishes",
      description: "Your service reflects what matters to you"
    }
  ];

  const faqs = [
    {
      question: "How much final expense coverage do I need?",
      answer: "Most people need $10,000-$25,000 to cover funeral costs, burial, and related expenses. Consider the average funeral cost in your area ($9,000-$12,000), plus cemetery costs, headstone, and any outstanding debts or medical bills you want covered."
    },
    {
      question: "Should I prepay my funeral or buy insurance?",
      answer: "Final expense insurance is often more flexible than prepaid funeral plans. Insurance benefits go to your beneficiary who can use them anywhere, while prepaid plans are tied to one funeral home. Insurance also provides funds for non-funeral expenses."
    },
    {
      question: "What if I already have life insurance?",
      answer: "Final expense insurance can supplement existing coverage. Large policies may have delays or be tied up in estate processes. A smaller final expense policy pays quickly, ensuring immediate costs are covered while other matters settle."
    },
    {
      question: "How do I share my plans with family?",
      answer: "Have an open conversation about your wishes. Give your beneficiary a copy of your policy and your documented preferences. Some people create a simple letter or folder with all important information in one place."
    },
    {
      question: "Can I change my plans later?",
      answer: "Yes. Your insurance beneficiary can be changed anytime. Your documented wishes are guidelines—they're not legally binding like a will, so you can update them whenever your preferences change."
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
                <ListChecks className="w-4 h-4" />
                Plan Ahead with Confidence
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Final Expense
                <span className="block text-heritage-accent">Pre-Planning Guide</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Give your family the gift of preparation. Pre-planning removes financial burden and ensures your wishes are honored.
              </p>

              <div className="space-y-3 mb-8">
                {["Estimate costs and coverage needs", "Document your preferences", "Protect your family from unexpected expenses"].map((item, i) => (
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
                    Get Coverage Quote
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

            {/* Cost Estimator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-heritage-primary mb-2">Cost Estimator</h3>
                <p className="text-gray-600 text-sm">Click each category to see range</p>
              </div>

              <div className="space-y-3 mb-6">
                {expenses.map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => setSelectedExpense(selectedExpense === expense.id ? null : expense.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedExpense === expense.id
                        ? 'bg-heritage-accent/10 border-2 border-heritage-accent'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <expense.icon className={`w-5 h-5 ${selectedExpense === expense.id ? 'text-heritage-accent' : 'text-gray-400'}`} />
                      <span className="font-medium text-heritage-primary">{expense.label}</span>
                    </div>
                    <span className="font-bold text-heritage-accent">${expense.avg.toLocaleString()}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedExpense && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-[#fffaf3] rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {expenses.find(e => e.id === selectedExpense)?.label} Range:
                      </p>
                      <div className="flex justify-between">
                        <span className="text-heritage-primary">
                          Low: ${expenses.find(e => e.id === selectedExpense)?.min.toLocaleString()}
                        </span>
                        <span className="text-heritage-primary">
                          High: ${expenses.find(e => e.id === selectedExpense)?.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                <p className="text-sm opacity-90 mb-1">Estimated Total Range</p>
                <p className="text-3xl font-bold">
                  ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
                </p>
                <p className="text-xs opacity-75 mt-2">Average: ${totalAvg.toLocaleString()}</p>
              </div>

              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold"
                >
                  Get Coverage for Your Needs
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$9,420", label: "Avg. Funeral Cost" },
              { value: "70%", label: "Families Unprepared" },
              { value: "48 hrs", label: "Avg. Claim Payout" },
              { value: "$15-25K", label: "Recommended Coverage" }
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

      {/* Interactive Funeral Cost Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Regional Funeral Cost Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Funeral costs vary significantly by region. Customize your estimate based on your location and service preferences.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {/* Service Type Toggle */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setServiceType("burial");
                      setShowCalculatorResult(false);
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      serviceType === "burial"
                        ? "bg-heritage-accent text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Traditional Burial
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setServiceType("cremation");
                      setShowCalculatorResult(false);
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      serviceType === "cremation"
                        ? "bg-heritage-accent text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Cremation
                  </motion.button>
                </div>
              </div>

              {/* Region Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Select Your Region
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(regionData).map(([key, data]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedRegion(key);
                        setShowCalculatorResult(false);
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedRegion === key
                          ? "bg-heritage-primary text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {data.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  Select Expenses to Include
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(serviceType === "burial" ? expenseCategories.burial : expenseCategories.cremation).map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        toggleCategory(cat.id);
                        setShowCalculatorResult(false);
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedCategories[cat.id] !== false
                          ? "bg-green-50 border-2 border-green-300 text-green-700"
                          : "bg-gray-50 border-2 border-gray-200 text-gray-500"
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      <span className="text-xs">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCalculatorResult(true)}
                className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white py-4 rounded-lg font-semibold mb-6"
              >
                Calculate My Estimated Costs
              </motion.button>

              {/* Results */}
              <AnimatePresence>
                {showCalculatorResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#fffaf3] rounded-xl p-6 border-2 border-heritage-accent/20"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-bold text-heritage-primary mb-4">Your Expense Breakdown</h4>
                          <div className="space-y-2">
                            {(serviceType === "burial" ? expenseCategories.burial : expenseCategories.cremation)
                              .filter(cat => selectedCategories[cat.id] !== false)
                              .map((cat, i) => (
                                <motion.div
                                  key={cat.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.05 }}
                                  className="flex justify-between items-center bg-white rounded-lg p-2"
                                >
                                  <span className="text-sm text-gray-700">{cat.label}</span>
                                  <span className="font-semibold text-heritage-primary">
                                    ${Math.round(cat.base * regionData[selectedRegion].multiplier).toLocaleString()}
                                  </span>
                                </motion.div>
                              ))}
                          </div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="bg-gradient-to-r from-heritage-primary to-heritage-primary/90 rounded-xl p-6 text-white text-center">
                            <p className="text-sm opacity-90 mb-1">Estimated Total Cost</p>
                            <motion.p
                              key={`total-${calculateTotalCost()}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-4xl font-bold"
                            >
                              ${calculateTotalCost().toLocaleString()}
                            </motion.p>
                            <p className="text-xs opacity-75 mt-2">
                              {regionData[selectedRegion].name} - {serviceType === "burial" ? "Traditional Burial" : "Cremation"}
                            </p>
                          </div>

                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">Recommended Coverage</p>
                            <p className="text-lg font-bold text-green-700">
                              ${(Math.ceil(calculateTotalCost() / 5000) * 5000).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Rounded up for additional expenses and inflation
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link href="/quote">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-6 bg-heritage-accent hover:bg-heritage-accent/90 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          Get a Quote for This Coverage
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Regional Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-[#f5f0e8] rounded-xl p-6"
            >
              <h4 className="font-bold text-heritage-primary mb-4">Regional Cost Comparison (Burial)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(regionData).map(([key, data]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg ${
                      selectedRegion === key ? "bg-heritage-accent/10 border-2 border-heritage-accent" : "bg-white"
                    }`}
                  >
                    <p className="text-xs text-gray-500">{data.name}</p>
                    <p className="font-bold text-heritage-primary">${data.avgCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {data.multiplier > 1 ? `+${Math.round((data.multiplier - 1) * 100)}%` :
                       data.multiplier < 1 ? `-${Math.round((1 - data.multiplier) * 100)}%` : "Avg"}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Planning Steps */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              4 Steps to Pre-Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple roadmap to protect your family and document your wishes.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {planningSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[#fffaf3] rounded-xl p-6 text-center hover:shadow-lg transition-shadow relative"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-heritage-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-14 h-14 bg-heritage-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-heritage-accent" />
                </div>
                <h3 className="text-lg font-bold text-heritage-primary mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Document Checklist */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-6">
                What to Document
              </h2>
              <p className="text-gray-600 mb-6">
                Create a simple document with your preferences. Share it with your beneficiary and keep a copy somewhere accessible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentChecklist.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
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
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                  alt="Planning documents"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-heritage-accent/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-heritage-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-heritage-primary text-sm">Your Wishes</p>
                    <p className="text-xs text-gray-500">Documented & Shared</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits for Family */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
              Why Pre-Planning Matters
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The greatest gift you can give your family is preparation.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {familyBenefits.map((benefit, i) => (
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

      {/* Conversation Starter */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-heritage-primary mb-4">
                Starting the Conversation
              </h2>
              <p className="text-gray-600">
                Talking about final wishes can be difficult. Here are some ways to start.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  opener: "I've been thinking about...",
                  example: "I've been thinking about making sure you're not burdened with decisions if something happens to me. Can we talk about what I'd want?"
                },
                {
                  opener: "I want you to know...",
                  example: "I want you to know my wishes so you don't have to guess. I've written some things down and got coverage to pay for everything."
                },
                {
                  opener: "I read something that made me think...",
                  example: "I read that most families aren't prepared for funeral costs. I want to make sure we are. Here's what I've planned."
                },
                {
                  opener: "I did something today...",
                  example: "I got final expense insurance today. It means you won't have to worry about costs, and I wrote down what I'd like for my service."
                }
              ].map((convo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-heritage-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-heritage-primary mb-2">"{convo.opener}"</p>
                      <p className="text-gray-600 text-sm italic">"{convo.example}"</p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              "When my mother passed, everything was arranged. She had written down her wishes and the insurance paid for everything within days. It was the greatest gift she could have given us."
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
                <p className="text-white font-semibold">Karen D.</p>
                <p className="text-white/70 text-sm">Daughter of policyholder</p>
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
              Start Your Pre-Planning Today
            </h2>
            <p className="text-gray-600 mb-8">
              Get a quote and take the first step toward protecting your family.
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
