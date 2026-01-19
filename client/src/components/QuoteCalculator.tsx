import { useState } from "react";
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

export default function QuoteCalculator() {
  const [step, setStep] = useState(1);
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
      setStep(step + 1);
    } else if (step === totalSteps) {
      await calculateQuote();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setEstimate(null);
      setError(null);
    }
  };

  const calculateQuote = async () => {
    setLoading(true);
    setError(null);

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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get quote");
      }

      const data = await response.json();
      setEstimate({
        monthlyRate: data.estimate.monthlyRate,
        annualRate: data.estimate.annualRate,
        isApproximate: data.isApproximate,
        message: data.message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate quote");
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

        <div className="p-8">
          {/* Step 1: Product Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What type of coverage do you need?
                </h2>
                <p className="text-gray-600">Choose the insurance product that best fits your needs</p>
              </div>

              <div className="grid gap-4">
                {productTypes.map((type) => (
                  <button
                    key={type.value}
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
                        <Check className="w-6 h-6 text-heritage-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">This helps us calculate an accurate estimate</p>
              </div>

              <div className="space-y-4">
                <div>
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
                </div>

                <div>
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
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Coverage Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coverage details</h2>
                <p className="text-gray-600">Choose your coverage amount and term length</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {coverageAmountsByType[quoteData.productType]?.map((amount) => (
                      <button
                        key={amount}
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
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {termLengthsByType[quoteData.productType]?.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuoteData({ ...quoteData, termLength: term })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          quoteData.termLength === term
                            ? "border-heritage-primary bg-heritage-light/10"
                            : "border-gray-200 hover:border-heritage-primary/50"
                        }`}
                      >
                        <span className="font-medium">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Lifestyle */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle questions</h2>
                <p className="text-gray-600">Help us provide an accurate estimate</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you smoke or use tobacco products?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setQuoteData({ ...quoteData, smoker: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quoteData.smoker === false
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <span className="font-medium">No</span>
                  </button>
                  <button
                    onClick={() => setQuoteData({ ...quoteData, smoker: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quoteData.smoker === true
                        ? "border-heritage-primary bg-heritage-light/10"
                        : "border-gray-200 hover:border-heritage-primary/50"
                    }`}
                  >
                    <span className="font-medium">Yes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Health Rating */}
          {step === 5 && !estimate && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Health status</h2>
                <p className="text-gray-600">Select the option that best describes your health</p>
              </div>

              <div className="space-y-3">
                {healthRatings.map((rating) => (
                  <button
                    key={rating.value}
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
                        <Check className="w-5 h-5 text-heritage-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {estimate && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Estimated Rate
                </h2>
                <p className="text-gray-600">Based on the information you provided</p>
              </div>

              <div className="bg-gradient-to-br from-heritage-primary to-heritage-dark rounded-xl p-8 text-white">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide opacity-90 mb-2">
                    Estimated Monthly Premium
                  </p>
                  <div className="text-5xl font-bold mb-1">
                    ${estimate.monthlyRate.toFixed(2)}
                  </div>
                  <p className="text-sm opacity-90">
                    ${estimate.annualRate.toFixed(2)} per year
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> {estimate.message}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="tel:+18005551234"
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
              </div>
            </div>
          )}

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
