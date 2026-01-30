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

export default function IUL() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [age, setAge] = useState(35);
  const [monthlyPremium, setMonthlyPremium] = useState(500);

  const { trackProductViewed, trackCTAClicked } = useAnalytics();
  useScrollTracking();

  useEffect(() => {
    trackProductViewed("iul");
  }, []);

  const calculateProjectedValue = (years: number) => {
    const annualPremium = monthlyPremium * 12;
    const avgReturn = 0.065;
    const totalPremiums = annualPremium * years;
    const compoundedValue = totalPremiums * Math.pow(1 + avgReturn, years / 2);
    return Math.round(compoundedValue);
  };

  const faqs = [
    {
      question: "What is IUL insurance?",
      answer: "IUL combines life insurance with a cash value component that earns interest based on a market index (like S&P 500). You get upside potential with a floor that protects against losses."
    },
    {
      question: "How do caps and floors work?",
      answer: "The floor (typically 0%) means you won't lose money when markets drop. The cap (typically 8-12%) limits how much you earn in strong years. You participate in gains while being protected from losses."
    },
    {
      question: "Is my money in the stock market?",
      answer: "No. Your cash value isn't directly invested in stocks. The insurance company uses the index as a measuring stick to calculate your interest. Your principal is protected."
    },
    {
      question: "What are the tax benefits?",
      answer: "Cash value grows tax-deferred, policy loans are tax-free, and the death benefit passes to beneficiaries income tax-free. There are no contribution limits like 401(k)s or IRAs."
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
                Indexed Universal Life
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-balance">
                Growth potential.
                <span className="text-violet-500"> Downside protection.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-pretty">
                Combine life insurance with market-linked growth. Participate in gains while your cash value is protected from losses.
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
                    <h3 className="font-bold text-gray-900">Growth Calculator</h3>
                    <p className="text-sm text-gray-500">See your potential cash value</p>
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
                      max="55"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Premium</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[300, 500, 1000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setMonthlyPremium(amount)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            monthlyPremium === amount
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ${amount}/mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">Projected Cash Value at 65</p>
                  <p className="text-4xl font-bold text-white">${calculateProjectedValue(65 - age).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Year 10</p>
                    <p className="text-lg font-bold text-primary">${calculateProjectedValue(10).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Year 20</p>
                    <p className="text-lg font-bold text-violet-500">${calculateProjectedValue(20).toLocaleString()}</p>
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
                    <span className="text-white font-medium">Projected at 65</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${calculateProjectedValue(65 - age).toLocaleString()}</p>
                    <p className="text-xs text-white/60">at ${monthlyPremium}/mo premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* What is IUL */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">What is Indexed Universal Life?</h2>
          <p className="text-lg text-gray-600 mb-6 text-pretty">
            IUL is permanent life insurance with a cash value that grows based on market index performance.
            You get the upside potential of the market with a guaranteed floor that protects against losses.
            When markets go up, you participate. When they go down, you're credited 0% - not negative.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
              "Tax-free cash value growth",
              "Tax-free policy loans",
              "0% floor - never lose principal",
              "Flexible premium payments",
              "Adjustable death benefit",
              "Living benefits included"
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Ready to explore IUL?</h2>
          <p className="text-xl text-white/80 mb-8 text-pretty">
            IUL can be a powerful tool for tax-free retirement income. Let's see if it's right for you.
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
