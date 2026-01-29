import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  User,
  Heart
} from "lucide-react";

interface QuickQuoteWidgetProps {
  variant?: "hero" | "sidebar" | "inline";
  onGetFullQuote?: (data: QuickQuoteData) => void;
}

export interface QuickQuoteData {
  zipCode: string;
  firstName: string;
  lastName: string;
  age: number;
  heightFeet: number;
  heightInches: number;
  weight: number;
  gender: string;
  tobacco: boolean;
}

export default function QuickQuoteWidget({ variant = "hero", onGetFullQuote }: QuickQuoteWidgetProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuickQuoteData>({
    zipCode: "",
    firstName: "",
    lastName: "",
    age: 35,
    heightFeet: 5,
    heightInches: 8,
    weight: 170,
    gender: "",
    tobacco: false,
  });

  const handleNext = () => {
    console.log("handleNext called, step:", step, "formData:", formData);
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final step - continue to full application
      console.log("Calling onGetFullQuote, callback exists:", !!onGetFullQuote);
      if (onGetFullQuote) {
        onGetFullQuote(formData);
      }
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.zipCode.length === 5;
      case 2:
        return (
          formData.firstName.length >= 2 &&
          formData.lastName.length >= 2 &&
          formData.age >= 18 &&
          formData.age <= 85 &&
          formData.weight >= 80 &&
          formData.weight <= 500
        );
      case 3:
        return formData.gender !== "";
      default:
        return false;
    }
  };

  const containerClass = variant === "hero"
    ? "bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full"
    : variant === "sidebar"
    ? "bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 w-full"
    : "bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 w-full";

  return (
    <div className={containerClass}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="zip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-gray-900">
                {variant === "hero" ? "Let's Get You Protected" : "Quick Quote"}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Answer a few quick questions to get started
            </p>

            {/* Progress */}
            <div className="flex gap-2 mb-6">
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
              <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
            </div>

            {/* ZIP Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your ZIP code?
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                  onKeyDown={(e) => e.key === "Enter" && isStepValid() && handleNext()}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter ZIP"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">
                  We'll confirm coverage is available in your area
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Takes 5 minutes</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Great! We cover your area</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Tell us a bit about yourself
            </p>

            {/* Progress */}
            <div className="flex gap-2 mb-6">
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="85"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={formData.heightFeet}
                    onChange={(e) => setFormData({ ...formData, heightFeet: parseInt(e.target.value) })}
                    className="flex-1 px-2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {[4, 5, 6, 7].map((ft) => (
                      <option key={ft} value={ft}>{ft} ft</option>
                    ))}
                  </select>
                  <select
                    value={formData.heightInches}
                    onChange={(e) => setFormData({ ...formData, heightInches: parseInt(e.target.value) })}
                    className="flex-1 px-2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                      <option key={inch} value={inch}>{inch} in</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  min="80"
                  max="500"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 150 })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 md:py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="health"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-gray-900">Nice to meet you, {formData.firstName}!</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Just two more quick questions
            </p>

            {/* Progress */}
            <div className="flex gap-2 mb-6">
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
              <div className="h-1.5 flex-1 rounded-full bg-primary" />
            </div>

            {/* Gender & Tobacco */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all capitalize ${
                        formData.gender === g
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you used tobacco in the last 12 months?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: false, label: "No" }, { value: true, label: "Yes" }].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setFormData({ ...formData, tobacco: option.value })}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        formData.tobacco === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 md:py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Find My Coverage
                </button>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Your info is secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
