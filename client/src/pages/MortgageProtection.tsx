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

export default function MortgageProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mortgageAmount, setMortgageAmount] = useState(300000);
  const [age, setAge] = useState(35);
  const [term, setTerm] = useState(30);

  const { trackProductViewed, trackCTAClicked } = useAnalytics();
  useScrollTracking();

  useEffect(() => {
    trackProductViewed("mortgage_protection");
  }, []);

  const calculatePremium = () => {
    const baseRate = 0.12;
    const ageMultiplier = 1 + ((age - 25) * 0.025);
    const termMultiplier = 1 + ((term - 15) * 0.015);
    const monthly = ((mortgageAmount / 1000) * baseRate * ageMultiplier * termMultiplier);
    return Math.round(monthly);
  };

  const faqs = [
    {
      question: "What is mortgage protection insurance?",
      answer: "Mortgage protection is life insurance designed to pay off your mortgage if you pass away. It ensures your family keeps the home without the burden of monthly payments."
    },
    {
      question: "How is it different from regular life insurance?",
      answer: "Mortgage protection is simply term life insurance marketed for homeowners. The coverage amount matches your mortgage balance and term. Some policies decrease over time as your balance decreases."
    },
    {
      question: "Do I need it if I already have life insurance?",
      answer: "If your existing policy is large enough to cover your mortgage plus other needs, you may not need separate coverage. But if your coverage is limited, mortgage protection can fill the gap."
    },
    {
      question: "What are living benefits?",
      answer: "Living benefits let you access a portion of your death benefit if you're diagnosed with a critical, chronic, or terminal illness. This can help cover medical bills or living expenses while you're still alive."
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
                Mortgage Protection Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-balance">
                Keep your family
                <span className="text-violet-500"> in their home.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-pretty">
                If something happens to you, your mortgage gets paid off. Your family stays in their home.
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
                    <p className="text-sm text-gray-500">Based on your mortgage</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[200000, 300000, 500000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setMortgageAmount(amount)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            mortgageAmount === amount
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Term</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 20, 30].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTerm(t)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            term === t
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t} years
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
                    <p className="text-xs text-white/60">for ${(mortgageAmount / 1000)}K, {term}yr term</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* What is Mortgage Protection */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">What is Mortgage Protection Insurance?</h2>
          <p className="text-lg text-gray-600 mb-6 text-pretty">
            Mortgage protection is life insurance designed specifically to pay off your home loan if you pass away.
            It gives your family the security of knowing they won't lose their home during an already difficult time.
            Many policies also include living benefits for critical illness or disability.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
              "Coverage matches your mortgage",
              "Premiums locked for entire term",
              "No medical exam options available",
              "Living benefits included",
              "Tax-free payout to beneficiaries",
              "Coverage for new homeowners"
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Protect your family's home</h2>
          <p className="text-xl text-white/80 mb-8 text-pretty">
            Get a free quote and see how affordable mortgage protection can be.
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
