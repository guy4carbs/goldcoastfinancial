import { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  ChevronDown,
  Calculator
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators, { CarrierStrip } from "@/components/TrustIndicators";

export default function WholeLife() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageAmount, setCoverageAmount] = useState(250000);
  const [age, setAge] = useState(35);

  const calculatePremium = () => {
    const baseRate = 1.15;
    const ageMultiplier = 1 + ((age - 25) * 0.04);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier);
    return Math.round(monthly);
  };

  const calculateCashValue = (years: number) => {
    const premium = calculatePremium();
    const totalPremiums = premium * 12 * years;
    const cashValueRate = years < 10 ? 0.35 : years < 20 ? 0.55 : 0.75;
    return Math.round(totalPremiums * cashValueRate);
  };

  const faqs = [
    {
      question: "How does cash value work?",
      answer: "A portion of each premium goes into a cash value account that grows at a guaranteed rate. Over time, you can borrow against it or withdraw while you're still alive."
    },
    {
      question: "Can I access my cash value?",
      answer: "Yes. You can borrow against it anytime at favorable rates, or make withdrawals. Unpaid loans reduce your death benefit."
    },
    {
      question: "Why is whole life more expensive than term?",
      answer: "Whole life costs more because it covers your entire lifetime and builds cash value. You're getting permanent protection plus a savings component."
    },
    {
      question: "What if I stop paying premiums?",
      answer: "If you've built enough cash value, you may be able to use it to keep the policy active, convert to a reduced paid-up policy, or receive the surrender value."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-violet-500 font-semibold mb-4 uppercase text-sm tracking-wide">
                Whole Life Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-balance">
                Protection + savings.
                <span className="text-violet-500"> For life.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-pretty">
                Build guaranteed cash value while protecting your family forever. Premiums that never increase.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center justify-center gap-2 bg-violet-500 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white transition-colors text-sm sm:text-base"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base"
                >
                  <Phone className="w-5 h-5" /> (630) 778-0800
                </a>
              </div>
            </div>

            {/* Calculator Card - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">See Your Cash Value Grow</h3>
                    <p className="text-sm text-gray-500">Estimate your policy value</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age: <span className="text-primary font-bold">{age}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="60"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[100000, 250000, 500000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setCoverageAmount(amount)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            coverageAmount === amount
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ${(amount / 1000)}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary rounded-xl text-center mb-4">
                  <p className="text-white/80 text-sm">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold text-white">${calculatePremium()}<span className="text-lg">/mo</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Cash Value Year 10</p>
                    <p className="text-lg font-bold text-primary">${calculateCashValue(10).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Cash Value Year 20</p>
                    <p className="text-lg font-bold text-violet-500">${calculateCashValue(20).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Card - Mobile */}
            <div className="lg:hidden mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-violet-500" />
                    <span className="text-white font-medium">Estimated from</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${calculatePremium()}<span className="text-sm">/mo</span></p>
                    <p className="text-xs text-white/60">for ${(coverageAmount / 1000)}K coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* What is Whole Life */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">What is Whole Life Insurance?</h2>
          <p className="text-lg text-gray-600 mb-6 text-pretty">
            Whole life is permanent coverage that protects your family for your entire lifetime. Unlike term,
            it never expires and includes a cash value component that grows over time at a guaranteed rate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
              "Coverage that never expires",
              "Guaranteed cash value growth",
              "Premiums never increase",
              "Tax-advantaged growth",
              "Borrow against cash value anytime",
              "Tax-free death benefit"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center text-balance">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#fffaf3] rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrier Partners */}
      <CarrierStrip />

      {/* CTA */}
      <section className="py-12 md:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Build lifelong protection & wealth</h2>
          <p className="text-xl text-white/80 mb-8 text-pretty">
            Discover how whole life can fit into your financial plan.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-4">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-violet-500 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white transition-colors text-sm sm:text-base"
            >
              Get Your Free Quote <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:6307780800"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base"
            >
              <Phone className="w-5 h-5" /> (630) 778-0800
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
