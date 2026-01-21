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

export default function IndexedAnnuities() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [marketReturn, setMarketReturn] = useState(12);
  const [cap] = useState(10);

  const creditedRate = Math.min(Math.max(marketReturn, 0), cap);

  const faqs = [
    {
      question: "How is interest determined?",
      answer: "Based on index performance (like S&P 500) over each crediting period, subject to caps and floors. You don't invest directly in the index—your principal is always protected."
    },
    {
      question: "Can I lose money?",
      answer: "Not from market performance—that's the 0% floor benefit. When markets drop, you get 0%, not negative. Surrender charges apply for early withdrawals."
    },
    {
      question: "What are caps and participation rates?",
      answer: "Cap = maximum rate you can earn (10% cap on 20% gain = 10%). Participation = percentage of gain (50% participation on 20% = 10%). Products use one or both."
    },
    {
      question: "Indexed annuity vs. IUL?",
      answer: "Similar crediting mechanics. Key difference: indexed annuities have no death benefit; IUL does. Indexed annuities typically have simpler fees and higher caps."
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
                Indexed Annuities
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Upside potential.
                <span className="text-heritage-accent"> Downside protection.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Earn interest linked to market indexes. When markets go up, you participate. When they drop, you're protected at 0%.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-heritage-accent text-heritage-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get Your Quote <ArrowRight className="w-5 h-5" />
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
                    <h3 className="font-bold text-gray-900">Credit Simulator</h3>
                    <p className="text-sm text-gray-500">See how caps and floors work</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Index Return: <span className={`font-bold ${marketReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{marketReturn}%</span>
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="25"
                      step="1"
                      value={marketReturn}
                      onChange={(e) => setMarketReturn(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>-20%</span>
                      <span>0%</span>
                      <span>+25%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Index return:</span>
                      <span className={`font-bold ${marketReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{marketReturn}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Cap:</span>
                      <span className="font-medium">{cap}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Floor:</span>
                      <span className="font-medium">0%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-heritage-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">Your Credited Rate</p>
                  <p className="text-4xl font-bold text-white">{creditedRate}%</p>
                  <p className="text-heritage-accent text-sm mt-1">
                    {marketReturn < 0 ? "Protected by 0% floor" : marketReturn > cap ? `Capped at ${cap}%` : "Full gain credited"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Indexed Annuity */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an Indexed Annuity?</h2>
          <p className="text-lg text-gray-600 mb-6">
            An indexed annuity earns interest based on market index performance (like the S&P 500),
            but your money isn't directly invested in the market. You get the upside when indexes rise,
            and a 0% floor protects you when they fall. Gains lock in annually—you can't lose them later.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Linked to S&P 500 and other indexes",
              "0% floor—never lose principal",
              "Gains lock in annually",
              "Tax-deferred growth",
              "Typical caps of 8-12%",
              "10% annual penalty-free withdrawals"
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
          <h2 className="text-3xl font-bold text-white mb-4">Grow your money without the risk</h2>
          <p className="text-xl text-white/80 mb-8">
            Get a personalized illustration showing how an indexed annuity could work for you.
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
