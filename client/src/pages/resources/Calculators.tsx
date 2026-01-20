import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Calculator,
  Target,
  DollarSign,
  TrendingUp,
  Shield,
  ArrowRight,
  Phone,
  CheckCircle,
  Users,
  Home,
  GraduationCap,
  PiggyBank,
  RefreshCw
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

export default function Calculators() {
  const [activeCalc, setActiveCalc] = useState<string>("coverage");

  // Coverage Calculator State
  const [income, setIncome] = useState(75000);
  const [yearsToReplace, setYearsToReplace] = useState(10);
  const [mortgage, setMortgage] = useState(250000);
  const [otherDebts, setOtherDebts] = useState(25000);
  const [collegeFund, setCollegeFund] = useState(100000);
  const [existingSavings, setExistingSavings] = useState(50000);
  const [existingCoverage, setExistingCoverage] = useState(0);

  // Premium Estimator State
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [smoker, setSmoker] = useState(false);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [termLength, setTermLength] = useState(20);

  // Human Life Value State
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualIncome2, setAnnualIncome2] = useState(75000);
  const [incomeGrowth, setIncomeGrowth] = useState(3);

  // Calculations
  const coverageNeeded = Math.max(0,
    (income * yearsToReplace) + mortgage + otherDebts + collegeFund - existingSavings - existingCoverage
  );

  // Simplified premium estimate (for illustration only)
  const baseRate = gender === 'female' ? 0.08 : 0.10;
  const ageMultiplier = 1 + ((age - 25) * 0.05);
  const smokerMultiplier = smoker ? 2.5 : 1;
  const termMultiplier = 1 + ((termLength - 10) * 0.02);
  const estimatedMonthly = Math.round(
    (coverageAmount / 1000) * baseRate * ageMultiplier * smokerMultiplier * termMultiplier
  );

  // Human Life Value
  const workingYears = retirementAge - currentAge;
  const humanLifeValue = Math.round(
    incomeGrowth === 0
      ? annualIncome2 * workingYears
      : annualIncome2 * ((Math.pow(1 + incomeGrowth/100, workingYears) - 1) / (incomeGrowth/100))
  );

  // Reset functions
  const resetCoverage = () => {
    setIncome(75000);
    setYearsToReplace(10);
    setMortgage(250000);
    setOtherDebts(25000);
    setCollegeFund(100000);
    setExistingSavings(50000);
    setExistingCoverage(0);
  };

  const resetPremium = () => {
    setAge(35);
    setGender('male');
    setSmoker(false);
    setCoverageAmount(500000);
    setTermLength(20);
  };

  const resetHLV = () => {
    setCurrentAge(35);
    setRetirementAge(65);
    setAnnualIncome2(75000);
    setIncomeGrowth(3);
  };

  // Check if any slider is at max
  const coverageAtMax = income >= 500000 || mortgage >= 1000000 || collegeFund >= 400000;
  const premiumAtMax = coverageAmount >= 2000000 || age >= 70;
  const hlvAtMax = annualIncome2 >= 500000;

  const calculators = [
    { id: "coverage", name: "Coverage Needs", icon: Target, description: "How much insurance do you need?" },
    { id: "premium", name: "Premium Estimator", icon: DollarSign, description: "Estimate your monthly cost" },
    { id: "hlv", name: "Human Life Value", icon: TrendingUp, description: "Your economic value to family" }
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              Free Tools
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6">
              Insurance Calculators
            </h1>
            <p className="text-lg text-gray-600">
              Interactive tools to help you make informed decisions about your coverage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator Tabs */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {calculators.map((calc) => (
              <motion.button
                key={calc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCalc(calc.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                  activeCalc === calc.id
                    ? 'bg-heritage-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <calc.icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">{calc.name}</p>
                  <p className={`text-xs ${activeCalc === calc.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {calc.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Content */}
      <section className="py-16 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Coverage Needs Calculator */}
            {activeCalc === "coverage" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-6">Your Financial Picture</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4" /> Annual Income: ${income.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="25000"
                        max="500000"
                        step="5000"
                        value={income}
                        onChange={(e) => setIncome(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Years to Replace Income: {yearsToReplace}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        value={yearsToReplace}
                        onChange={(e) => setYearsToReplace(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Home className="w-4 h-4" /> Mortgage Balance: ${mortgage.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="10000"
                        value={mortgage}
                        onChange={(e) => setMortgage(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Other Debts: ${otherDebts.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200000"
                        step="5000"
                        value={otherDebts}
                        onChange={(e) => setOtherDebts(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <GraduationCap className="w-4 h-4" /> College Fund Needed: ${collegeFund.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="400000"
                        step="10000"
                        value={collegeFund}
                        onChange={(e) => setCollegeFund(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <PiggyBank className="w-4 h-4" /> Existing Savings: ${existingSavings.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="10000"
                        value={existingSavings}
                        onChange={(e) => setExistingSavings(parseInt(e.target.value))}
                        className="w-full accent-heritage-accent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Shield className="w-4 h-4" /> Existing Coverage: ${existingCoverage.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="25000"
                        value={existingCoverage}
                        onChange={(e) => setExistingCoverage(parseInt(e.target.value))}
                        className="w-full accent-heritage-accent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={resetCoverage}
                    className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-heritage-primary transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to defaults
                  </button>
                </div>

                <div className="bg-heritage-primary rounded-2xl p-8 shadow-xl text-white">
                  <h2 className="text-2xl font-bold text-white mb-6">Your Coverage Recommendation</h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Income Replacement</span>
                      <span className="font-semibold">${(income * yearsToReplace).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Mortgage</span>
                      <span className="font-semibold">${mortgage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Other Debts</span>
                      <span className="font-semibold">${otherDebts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">College Fund</span>
                      <span className="font-semibold">${collegeFund.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Less: Savings</span>
                      <span className="font-semibold text-heritage-accent">-${existingSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Less: Existing Coverage</span>
                      <span className="font-semibold text-heritage-accent">-${existingCoverage.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <p className="text-white/80 text-sm mb-2">Recommended Coverage</p>
                    <p className="text-4xl font-bold text-heritage-accent">${coverageNeeded.toLocaleString()}</p>
                  </div>

                  {coverageAtMax && (
                    <div className="bg-heritage-accent/20 border border-heritage-accent/30 rounded-xl p-4 mb-6">
                      <p className="text-white text-sm font-medium">Need higher coverage?</p>
                      <p className="text-white/70 text-xs mt-1">Our sliders have limits, but your needs don't. Get a personalized quote for any amount.</p>
                    </div>
                  )}

                  <Link href="/quote">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-heritage-accent text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      Get Quotes for This Amount <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Premium Estimator */}
            {activeCalc === "premium" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-6">About You</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Age: {age}
                      </label>
                      <input
                        type="range"
                        min="18"
                        max="70"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Gender</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setGender('male')}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            gender === 'male' ? 'bg-heritage-primary text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          onClick={() => setGender('female')}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            gender === 'female' ? 'bg-heritage-primary text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Tobacco Use</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSmoker(false)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            !smoker ? 'bg-heritage-primary text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Non-Smoker
                        </button>
                        <button
                          onClick={() => setSmoker(true)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            smoker ? 'bg-heritage-primary text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Smoker
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Coverage Amount: ${coverageAmount.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="100000"
                        max="2000000"
                        step="50000"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Term Length: {termLength} years
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="5"
                        value={termLength}
                        onChange={(e) => setTermLength(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={resetPremium}
                    className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-heritage-primary transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to defaults
                  </button>
                </div>

                <div className="bg-heritage-primary rounded-2xl p-8 shadow-xl text-white">
                  <h2 className="text-2xl font-bold text-white mb-6">Estimated Premium</h2>

                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <p className="text-white/80 text-sm mb-2">Estimated Monthly Cost</p>
                    <p className="text-5xl font-bold text-heritage-accent">${estimatedMonthly}</p>
                    <p className="text-white/60 text-sm mt-2">For ${coverageAmount.toLocaleString()} • {termLength}-year term</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-heritage-accent" />
                      <span className="text-white/90">Rate locked for {termLength} years</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-heritage-accent" />
                      <span className="text-white/90">Tax-free death benefit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-heritage-accent" />
                      <span className="text-white/90">Coverage starts immediately</span>
                    </div>
                  </div>

                  <p className="text-white/60 text-xs mb-6">
                    *Estimate only. Actual rates depend on health, lifestyle, and underwriting. Get a real quote for accurate pricing.
                  </p>

                  {premiumAtMax && (
                    <div className="bg-heritage-accent/20 border border-heritage-accent/30 rounded-xl p-4 mb-6">
                      <p className="text-white text-sm font-medium">Need more coverage or different options?</p>
                      <p className="text-white/70 text-xs mt-1">We can quote higher amounts and special circumstances. Talk to an advisor.</p>
                    </div>
                  )}

                  <Link href="/quote">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-heritage-accent text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      Get Your Real Quote <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Human Life Value Calculator */}
            {activeCalc === "hlv" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-6">Your Earning Potential</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Current Age: {currentAge}
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="60"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Planned Retirement Age: {retirementAge}
                      </label>
                      <input
                        type="range"
                        min="55"
                        max="75"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Current Annual Income: ${annualIncome2.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="30000"
                        max="500000"
                        step="5000"
                        value={annualIncome2}
                        onChange={(e) => setAnnualIncome2(parseInt(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Expected Annual Income Growth: {incomeGrowth}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="7"
                        step="0.5"
                        value={incomeGrowth}
                        onChange={(e) => setIncomeGrowth(parseFloat(e.target.value))}
                        className="w-full accent-heritage-primary"
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">
                      <strong>What is Human Life Value?</strong> The total economic value you provide to your family over your working lifetime—the income you'd earn between now and retirement.
                    </p>
                  </div>

                  <button
                    onClick={resetHLV}
                    className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-heritage-primary transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to defaults
                  </button>
                </div>

                <div className="bg-heritage-primary rounded-2xl p-8 shadow-xl text-white">
                  <h2 className="text-2xl font-bold text-white mb-6">Your Economic Value</h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Working Years Remaining</span>
                      <span className="font-semibold">{workingYears} years</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Current Income</span>
                      <span className="font-semibold">${annualIncome2.toLocaleString()}/year</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/20">
                      <span className="text-white/80">Growth Rate</span>
                      <span className="font-semibold">{incomeGrowth}% annually</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <p className="text-white/80 text-sm mb-2">Your Human Life Value</p>
                    <p className="text-4xl font-bold text-heritage-accent">${humanLifeValue.toLocaleString()}</p>
                    <p className="text-white/60 text-sm mt-2">Total income until retirement</p>
                  </div>

                  <p className="text-white/70 text-sm mb-6">
                    This represents the income your family would lose if something happened to you. Consider coverage to protect this value.
                  </p>

                  {hlvAtMax && (
                    <div className="bg-heritage-accent/20 border border-heritage-accent/30 rounded-xl p-4 mb-6">
                      <p className="text-white text-sm font-medium">Earning more than $500K?</p>
                      <p className="text-white/70 text-xs mt-1">High earners need specialized coverage. Let us help you protect your full income.</p>
                    </div>
                  )}

                  <Link href="/quote">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-heritage-accent text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      Protect Your Value <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need Help with Your Calculations?
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Our licensed advisors can help you determine the right coverage for your unique situation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-primary text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" /> (630) 778-0800
                </motion.button>
              </a>
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-heritage-primary text-heritage-primary px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-heritage-primary/5 transition-colors"
                >
                  Get a Free Quote <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
