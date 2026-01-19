import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

interface QuoteData {
  productType: string;
  age: number | null;
  gender: string;
  smoker: boolean | null;
  coverageAmount: number | null;
  termLength: string;
  healthRating: string;
}

interface QuoteEstimate {
  monthlyRate: number;
  annualRate: number;
  isApproximate: boolean;
  message: string;
}

// Animation variants for step transitions
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Fallback calculation when API is unavailable
function calculateFallbackQuote(data: QuoteData): QuoteEstimate {
  // Base rates per $1000 of coverage (annual)
  const baseRates: Record<string, number> = {
    "Term Life": 0.15,
    "Final Expense": 8.5,
    "IUL": 0.35,
    "Mortgage Protection": 0.18,
  };

  let baseRate = baseRates[data.productType] || 0.2;
  const coverage = data.coverageAmount || 250000;

  // Age factor (increases with age)
  const age = data.age || 35;
  const ageFactor = 1 + ((age - 25) * 0.025);

  // Gender factor (slightly lower for females statistically)
  const genderFactor = data.gender === "female" ? 0.92 : 1;

  // Smoker factor (significant increase)
  const smokerFactor = data.smoker ? 2.2 : 1;

  // Health rating factor
  const healthFactors: Record<string, number> = {
    excellent: 0.85,
    good: 1,
    average: 1.25,
    poor: 1.6,
  };
  const healthFactor = healthFactors[data.healthRating] || 1;

  // Term length factor for term products
  const termFactors: Record<string, number> = {
    "10 years": 0.7,
    "15 years": 0.85,
    "20 years": 1,
    "25 years": 1.15,
    "30 years": 1.3,
    "Whole Life": 1.5,
    "Permanent": 1.4,
  };
  const termFactor = termFactors[data.termLength] || 1;

  // Calculate annual rate
  const annualRate = (coverage / 1000) * baseRate * ageFactor * genderFactor * smokerFactor * healthFactor * termFactor;
  const monthlyRate = annualRate / 12;

  return {
    monthlyRate: Math.round(monthlyRate * 100) / 100,
    annualRate: Math.round(annualRate * 100) / 100,
    isApproximate: true,
    message: "This is an estimated quote. Contact us to confirm and lock in your official rate.",
  };
}

export default function QuoteCalculator() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [quoteData, setQuoteData] = useState<QuoteData>({
    productType: "",
    age: null,
    gender: "",
    smoker: null,
    coverageAmount: null,
    termLength: "",
    healthRating: "",
  });
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const productTypes = [
    { value: "Term Life", label: "Term Life Insurance", description: "Affordable coverage for a specific period" },
    { value: "Final Expense", label: "Final Expense Insurance", description: "Cover funeral and end-of-life costs" },
    { value: "IUL", label: "Indexed Universal Life", description: "Permanent coverage with cash value growth" },
    { value: "Mortgage Protection", label: "Mortgage Protection", description: "Protect your home and family" },
  ];

  const coverageAmountsByType: Record<string, number[]> = {
    "Term Life": [250000, 500000, 750000, 1000000],
    "Final Expense": [5000, 10000, 15000, 25000],
    "IUL": [500000, 1000000, 2000000, 5000000],
    "Mortgage Protection": [200000, 300000, 400000, 500000],
  };

  const termLengthsByType: Record<string, string[]> = {
    "Term Life": ["10 years", "20 years", "25 years", "30 years"],
    "Final Expense": ["Whole Life"],
    "IUL": ["Permanent"],
    "Mortgage Protection": ["15 years", "20 years", "25 years", "30 years"],
  };

  const healthRatings = [
    { value: "excellent", label: "Excellent", description: "No health issues, healthy lifestyle" },
    { value: "good", label: "Good", description: "Minor health issues, generally healthy" },
    { value: "average", label: "Average", description: "Some health concerns or medications" },
    { value: "poor", label: "Poor", description: "Significant health issues" },
  ];

  const handleNext = async () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else if (step === totalSteps) {
      await calculateQuote();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
      setEstimate(null);
      setError(null);
    }
  };

  const calculateQuote = async () => {
    setLoading(true);
    setError(null);
    setDirection(1);

    try {
      const response = await fetch("/api/quotes/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: quoteData.productType,
          age: quoteData.age,
          gender: quoteData.gender,
          smoker: quoteData.smoker,
          coverageAmount: quoteData.coverageAmount,
          termLength: quoteData.termLength,
          healthRating: quoteData.healthRating,
        }),
      });

      if (!response.ok) {
        // Use fallback calculation if API fails
        const fallbackEstimate = calculateFallbackQuote(quoteData);
        setEstimate(fallbackEstimate);
        return;
      }

      const data = await response.json();
      setEstimate({
        monthlyRate: data.estimate.monthlyRate,
        annualRate: data.estimate.annualRate,
        isApproximate: data.isApproximate,
        message: data.message,
      });
    } catch (err) {
      // Use fallback calculation on any error
      const fallbackEstimate = calculateFallbackQuote(quoteData);
      setEstimate(fallbackEstimate);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return quoteData.productType !== "";
      case 2:
        return quoteData.age !== null && quoteData.gender !== "";
      case 3:
        return quoteData.coverageAmount !== null && quoteData.termLength !== "";
      case 4:
        return quoteData.smoker !== null;
      case 5:
        return quoteData.healthRating !== "";
      default:
        return false;
    }
  };

  const resetForm = () => {
    setStep(1);
    setQuoteData({
      productType: "",
      age: null,
      gender: "",
      smoker: null,
      coverageAmount: null,
      termLength: "",
      healthRating: "",
    });
    setEstimate(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress Bar */}
        {!estimate && (
          <div className="bg-gray-50 px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-heritage-primary">
                {Math.round((step / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-heritage-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Product Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What type of coverage do you need?
                </h2>
                <p className="text-gray-600">Choose the insurance product that best fits your needs</p>
              </div>

              <div className="grid gap-4">
                {productTypes.map((type, index) => (
                  <motion.button
                    key={type.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setQuoteData({ ...quoteData, productType: type.value })}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      quoteData.productType === type.value
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      {quoteData.productType === type.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-6 h-6 text-heritage-primary flex-shrink-0" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">This helps us calculate an accurate estimate</p>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="85"
                    value={quoteData.age || ""}
                    onChange={(e) =>
                      setQuoteData({ ...quoteData, age: parseInt(e.target.value) || null })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    placeholder="Enter your age"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setQuoteData({ ...quoteData, gender: "male" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        quoteData.gender === "male"
                          ? "border-heritage-primary bg-heritage-light/10"
                          : "border-gray-200 hover:border-heritage-primary/50"
                      }`}
                    >
                      <span className="font-medium">Male</span>
                    </button>
                    <button
                      onClick={() => setQuoteData({ ...quoteData, gender: "female" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        quoteData.gender === "female"
                          ? "border-heritage-primary bg-heritage-light/10"
                          : "border-gray-200 hover:border-heritage-primary/50"
                      }`}
                    >
                      <span className="font-medium">Female</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Coverage Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coverage details</h2>
                <p className="text-gray-600">Choose your coverage amount and term length</p>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {coverageAmountsByType[quoteData.productType]?.map((amount, index) => (
                      <motion.button
                        key={amount}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + index * 0.05 }}
                        onClick={() => setQuoteData({ ...quoteData, coverageAmount: amount })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          quoteData.coverageAmount === amount
                            ? "border-heritage-primary bg-heritage-light/10"
                            : "border-gray-200 hover:border-heritage-primary/50"
                        }`}
                      >
                        <span className="font-medium">
                          ${amount.toLocaleString()}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {termLengthsByType[quoteData.productType]?.map((term, index) => (
                      <motion.button
                        key={term}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        onClick={() => setQuoteData({ ...quoteData, termLength: term })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          quoteData.termLength === term
                            ? "border-heritage-primary bg-heritage-light/10"
                            : "border-gray-200 hover:border-heritage-primary/50"
                        }`}
                      >
                        <span className="font-medium">{term}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Lifestyle */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle questions</h2>
                <p className="text-gray-600">Help us provide an accurate estimate</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you smoke or use tobacco products?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setQuoteData({ ...quoteData, smoker: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quoteData.smoker === false
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <span className="font-medium">No</span>
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => setQuoteData({ ...quoteData, smoker: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quoteData.smoker === true
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <span className="font-medium">Yes</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 5: Health Rating */}
          {step === 5 && !estimate && (
            <motion.div
              key="step5"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Health status</h2>
                <p className="text-gray-600">Select the option that best describes your health</p>
              </div>

              <div className="space-y-3">
                {healthRatings.map((rating, index) => (
                  <motion.button
                    key={rating.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    onClick={() => setQuoteData({ ...quoteData, healthRating: rating.value })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      quoteData.healthRating === rating.value
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{rating.label}</h3>
                        <p className="text-sm text-gray-600">{rating.description}</p>
                      </div>
                      {quoteData.healthRating === rating.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-5 h-5 text-heritage-primary flex-shrink-0" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {estimate && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Estimated Rate
                </h2>
                <p className="text-gray-600">Based on the information you provided</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-heritage-primary to-heritage-dark rounded-xl p-8 text-white"
              >
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide opacity-90 mb-2">
                    Estimated Monthly Premium
                  </p>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    className="text-5xl font-bold mb-1"
                  >
                    ${estimate.monthlyRate.toFixed(2)}
                  </motion.div>
                  <p className="text-sm opacity-90">
                    ${estimate.annualRate.toFixed(2)} per year
                  </p>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-red-800 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> {estimate.message}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <a
                  href="tel:+16307780800"
                  className="block w-full bg-heritage-primary text-white py-4 px-6 rounded-lg font-semibold text-center hover:bg-heritage-dark transition-colors"
                >
                  Call Us to Lock In Your Rate
                </a>
                <button
                  onClick={resetForm}
                  className="block w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                >
                  Start New Quote
                </button>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!estimate && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className="flex items-center gap-2 px-6 py-3 bg-heritage-primary text-white rounded-lg font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Calculating..." : step === totalSteps ? "Get My Quote" : "Continue"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
