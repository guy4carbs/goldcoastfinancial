import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star, TrendingUp, Shield, Info } from "lucide-react";

interface QuoteOption {
  id: string;
  termLength: string;
  termYears: number;
  coverage: number;
  monthlyRate: number;
  annualRate: number;
  popular?: boolean;
  savings?: string;
}

interface QuoteComparisonProps {
  baseData: {
    age: number;
    gender: string;
    smoker: boolean;
    healthRating: string;
    productType: string;
  };
  selectedCoverage: number;
  onSelect: (option: QuoteOption) => void;
  onCoverageChange: (coverage: number) => void;
}

// Rate calculation
function calculateRate(
  coverage: number,
  termYears: number,
  age: number,
  gender: string,
  smoker: boolean,
  healthRating: string
): { monthly: number; annual: number } {
  // Base rate per $1000 annual
  const baseRate = 0.14;

  // Age factor
  const ageFactor = 1 + ((age - 25) * 0.026);

  // Gender factor
  const genderFactor = gender === "female" ? 0.91 : 1;

  // Smoker factor
  const smokerFactor = smoker ? 2.3 : 1;

  // Health factor
  const healthFactors: Record<string, number> = {
    excellent: 0.8,
    good: 1,
    average: 1.3,
    poor: 1.7,
  };
  const healthFactor = healthFactors[healthRating] || 1;

  // Term factor (shorter terms = cheaper)
  const termFactors: Record<number, number> = {
    10: 0.65,
    15: 0.8,
    20: 1,
    25: 1.2,
    30: 1.4,
  };
  const termFactor = termFactors[termYears] || 1;

  const annualRate = (coverage / 1000) * baseRate * ageFactor * genderFactor * smokerFactor * healthFactor * termFactor;
  const monthlyRate = annualRate / 12;

  return {
    monthly: Math.round(monthlyRate * 100) / 100,
    annual: Math.round(annualRate * 100) / 100,
  };
}

export default function QuoteComparison({
  baseData,
  selectedCoverage,
  onSelect,
  onCoverageChange,
}: QuoteComparisonProps) {
  const [options, setOptions] = useState<QuoteOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coverage, setCoverage] = useState(selectedCoverage);

  const termOptions = [10, 15, 20, 25, 30];
  const coverageOptions = [250000, 500000, 750000, 1000000, 1500000, 2000000];

  // Generate quote options whenever inputs change
  useEffect(() => {
    const newOptions: QuoteOption[] = termOptions.map((term, index) => {
      const rates = calculateRate(
        coverage,
        term,
        baseData.age,
        baseData.gender,
        baseData.smoker,
        baseData.healthRating
      );

      return {
        id: `term-${term}`,
        termLength: `${term} Year Term`,
        termYears: term,
        coverage,
        monthlyRate: rates.monthly,
        annualRate: rates.annual,
        popular: term === 20,
        savings: term === 10 ? "Best Value" : term === 20 ? "Most Popular" : undefined,
      };
    });

    setOptions(newOptions);

    // Auto-select most popular if nothing selected
    if (!selectedId) {
      setSelectedId("term-20");
    }
  }, [coverage, baseData]);

  const handleSelect = (option: QuoteOption) => {
    setSelectedId(option.id);
    onSelect(option);
  };

  const handleCoverageChange = (newCoverage: number) => {
    setCoverage(newCoverage);
    onCoverageChange(newCoverage);
  };

  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Coverage Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Coverage Amount</h3>
            <p className="text-sm text-gray-500">Adjust to see how it affects your rate</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-heritage-primary">
              ${coverage.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Coverage Slider */}
        <div className="mb-4">
          <input
            type="range"
            min={100000}
            max={2000000}
            step={50000}
            value={coverage}
            onChange={(e) => handleCoverageChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heritage-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>$100,000</span>
            <span>$500,000</span>
            <span>$1,000,000</span>
            <span>$2,000,000</span>
          </div>
        </div>

        {/* Quick Coverage Buttons */}
        <div className="flex flex-wrap gap-2">
          {coverageOptions.map((amt) => (
            <button
              key={amt}
              onClick={() => handleCoverageChange(amt)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                coverage === amt
                  ? "bg-heritage-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ${amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
            </button>
          ))}
        </div>
      </div>

      {/* Term Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedId === option.id
                ? "border-heritage-primary bg-heritage-primary/5 shadow-lg"
                : "border-gray-200 hover:border-heritage-primary/50 bg-white"
            }`}
          >
            {/* Badge */}
            {option.savings && (
              <div
                className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  option.popular
                    ? "bg-heritage-accent text-white"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {option.savings}
              </div>
            )}

            {/* Term Length */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">{option.termYears} Year</span>
              {selectedId === option.id && (
                <Check className="w-5 h-5 text-heritage-primary" />
              )}
            </div>

            {/* Price */}
            <div className="mb-2">
              <span className="text-2xl font-bold text-heritage-primary">
                ${option.monthlyRate.toFixed(0)}
              </span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>

            {/* Annual */}
            <p className="text-xs text-gray-500">
              ${option.annualRate.toFixed(0)}/year
            </p>
          </motion.button>
        ))}
      </div>

      {/* Selected Option Summary */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-heritage-primary to-heritage-dark rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Selected Coverage</p>
              <h3 className="text-2xl font-bold">
                ${selectedOption.coverage.toLocaleString()} • {selectedOption.termLength}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Monthly Premium</p>
              <p className="text-3xl font-bold">${selectedOption.monthlyRate.toFixed(2)}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-heritage-accent" />
              <span className="text-sm">No Medical Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-heritage-accent" />
              <span className="text-sm">Instant Decision</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-heritage-accent" />
              <span className="text-sm">Locked-in Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-heritage-accent" />
              <span className="text-sm">A-Rated Carriers</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Why choose a longer term?</p>
          <p className="text-blue-700 mt-1">
            Longer terms lock in today's rate for more years. If your health changes, you're still covered at the same price.
            A 20-year term is popular for covering mortgage payments or children until they're independent.
          </p>
        </div>
      </div>
    </div>
  );
}
