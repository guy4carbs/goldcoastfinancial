import { useState, useEffect } from "react";
import { useAnalytics, useScrollTracking } from "@/hooks/useAnalytics";
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

export default function TermLife() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(20);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [age, setAge] = useState(35);

  const { trackProductViewed, trackCTAClicked } = useAnalytics();
  useScrollTracking();

  useEffect(() => {
    trackProductViewed("term_life");
  }, []);

  const calculatePremium = () => {
    const baseRate = 0.15;
    const ageMultiplier = 1 + ((age - 25) * 0.03);
    const termMultiplier = 1 + ((selectedTerm - 10) * 0.02);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    return Math.round(monthly);
  };

  const faqs = [
    {
      question: "What is term life insurance?",
      answer: "Term life provides coverage for a specific period (10-30 years). If you pass away during the term, your beneficiaries receive the death benefit tax-free. It's the most affordable type of life insurance."
    },
    {
      question: "How much coverage do I need?",
      answer: "A common rule is 10-12 times your annual income. Consider your mortgage, debts, and how many years your family would need income replacement."
    },
    {
      question: "What happens when my term ends?",
      answer: "You can let it expire, renew at a higher rate, or convert to permanent coverage without a new medical exam (if your policy has a conversion option)."
    },
    {
      question: "Can I get coverage without a medical exam?",
      answer: "Yes! Many carriers offer no-exam policies with just health questions. Coverage amounts typically max out at $500K-$1M."
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
                Term Life Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-balance">
                Maximum protection.
                <span className="text-violet-500"> Minimum cost.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-pretty">
                Protect your family with affordable coverage. Get up to $1 million for less than $1 a day.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <a
                  href="/quote"
                  onClick={() => trackCTAClicked("Get Your Free Quote", "hero", "/quote")}
                  className="inline-flex items-center justify-center gap-2 bg-violet-500 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white transition-colors text-sm sm:text-base"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  onClick={() => trackCTAClicked("Phone", "hero", "tel:6307780800")}
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
                    <h3 className="font-bold text-gray-900">Quick Estimate</h3>
                    <p className="text-sm text-gray-500">See your rate in seconds</p>
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
                      max="65"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      {[250000, 500000, 1000000].map((amount) => (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
                      {[10, 15, 20, 25, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTerm === term
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {term}yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold text-white">${calculatePremium()}<span className="text-lg">/mo</span></p>
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
                    <p className="text-xs text-white/60">for ${(coverageAmount / 1000)}K, {selectedTerm}yr term</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* What is Term Life */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">What is Term Life Insurance?</h2>
          <p className="text-lg text-gray-600 mb-6 text-pretty">
            Term life is straightforward: you pay a monthly premium, and if you pass away during the term,
            your family receives a tax-free payout. It's the most affordable way to protect the people you love.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
              "Coverage from $100K to $10M",
              "Terms of 10, 15, 20, 25, or 30 years",
              "Premiums locked for entire term",
              "Tax-free payout to beneficiaries",
              "No-exam options available",
              "Can convert to permanent coverage"
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Ready to protect your family?</h2>
          <p className="text-xl text-white/80 mb-8 text-pretty">
            Get a free quote in minutes. No obligation, no pressure.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-4">
            <a
              href="/quote"
              onClick={() => trackCTAClicked("Get Your Free Quote", "footer_cta", "/quote")}
              className="inline-flex items-center justify-center gap-2 bg-violet-500 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white transition-colors text-sm sm:text-base"
            >
              Get Your Free Quote <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:6307780800"
              onClick={() => trackCTAClicked("Phone", "footer_cta", "tel:6307780800")}
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
