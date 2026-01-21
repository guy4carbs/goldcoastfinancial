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

export default function FixedAnnuities() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [principal, setPrincipal] = useState(100000);
  const [years, setYears] = useState(5);

  const rate = 5.0;
  const futureValue = Math.round(principal * Math.pow(1 + rate / 100, years));
  const totalInterest = futureValue - principal;

  const faqs = [
    {
      question: "How safe are fixed annuities?",
      answer: "Backed by insurance company reserves and regulated by state departments. Choose A-rated carriers for maximum security. Not FDIC insured, but strict reserve requirements apply."
    },
    {
      question: "What if I need money early?",
      answer: "Most allow 10% annual penalty-free withdrawals. Beyond that, surrender charges apply (decreasing each year until zero at maturity)."
    },
    {
      question: "How are they taxed?",
      answer: "Growth is tax-deferred until withdrawal, then taxed as ordinary income. Withdrawals before 59½ may incur a 10% IRS penalty."
    },
    {
      question: "Fixed annuity vs. CD?",
      answer: "Both offer guaranteed rates. Annuities typically pay more, grow tax-deferred, and aren't limited by FDIC caps. CDs are simpler and more liquid."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="bg-heritage-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-heritage-accent font-semibold mb-4 uppercase text-sm tracking-wide">
                Fixed Annuities
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Guaranteed rates.
                <span className="text-heritage-accent"> Zero risk.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Lock in competitive rates with 100% principal protection. Tax-deferred growth, no market risk.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get Today's Rates <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="tel:6307780800"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" /> (630) 778-0800
                </a>
              </div>
            </div>

            {/* Calculator Card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-heritage-accent/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Growth Calculator</h3>
                    <p className="text-sm text-gray-500">See your guaranteed returns</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit: <span className="text-heritage-primary font-bold">${principal.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="25000"
                      max="500000"
                      step="5000"
                      value={principal}
                      onChange={(e) => setPrincipal(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term Length</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 7, 10].map((term) => (
                        <button
                          key={term}
                          onClick={() => setYears(term)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            years === term
                              ? 'bg-heritage-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {term} yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-heritage-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">At {rate}% for {years} years</p>
                  <p className="text-4xl font-bold text-white">${futureValue.toLocaleString()}</p>
                  <p className="text-heritage-accent text-sm mt-1">+${totalInterest.toLocaleString()} interest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Fixed Annuity */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Fixed Annuity?</h2>
          <p className="text-lg text-gray-600 mb-6">
            A fixed annuity is a safe-money contract with an insurance company. You deposit a lump sum,
            earn a guaranteed interest rate for a set term, and your principal is 100% protected.
            Think of it like a CD, but with higher rates and tax-deferred growth.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Rates up to 5.50% APY",
              "100% principal protection",
              "Tax-deferred growth",
              "10% annual penalty-free withdrawals",
              "No market risk or volatility",
              "Terms from 3 to 10 years"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Questions</h2>
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

      {/* CTA */}
      <section className="py-16 bg-heritage-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for guaranteed growth?</h2>
          <p className="text-xl text-white/80 mb-8">
            Lock in today's rates before they change. Get a personalized quote in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/quote"
              className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
            >
              Get Your Free Quote <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:6307780800"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
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
