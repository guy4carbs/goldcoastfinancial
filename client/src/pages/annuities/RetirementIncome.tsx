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

export default function RetirementIncome() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lumpSum, setLumpSum] = useState(250000);
  const [startAge, setStartAge] = useState(65);

  const payoutRate = startAge >= 70 ? 7.2 : startAge >= 65 ? 6.5 : 5.8;
  const monthlyIncome = Math.round((lumpSum * (payoutRate / 100)) / 12);
  const annualIncome = monthlyIncome * 12;

  const faqs = [
    {
      question: "How much income can I get?",
      answer: "Varies by age and product. Age 65: ~6-7% annually. Age 70: ~7-8%. Deferred 10 years: 10%+. We provide personalized illustrations based on your situation."
    },
    {
      question: "What happens when I die?",
      answer: "Depends on your payout option. Life-only: stops. Period certain: remaining payments to beneficiary. Joint: spouse continues. Cash refund: unpaid premium returned."
    },
    {
      question: "Should I annuitize all my savings?",
      answer: "Generally no. Cover essential expenses with guaranteed income, keep the rest liquid for emergencies, inflation, and legacy. Most people annuitize 30-50% of savings."
    },
    {
      question: "What if I need a lump sum later?",
      answer: "Immediate annuities (SPIAs) don't allow it. Income riders on fixed/indexed annuities offer more flexibility—you can withdraw excess funds if needed."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-violet-500 font-semibold mb-4 uppercase text-sm tracking-wide">
                Retirement Income
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight text-balance">
                Income for life.
                <span className="text-violet-500"> Guaranteed.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-pretty">
                Turn savings into pension-like income you can't outlive. No matter how long you live, your check arrives every month.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 bg-violet-500 text-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
                >
                  Get Income Quote <ArrowRight className="w-5 h-5" />
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
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Income Estimator</h3>
                    <p className="text-sm text-gray-500">See your potential lifetime income</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Premium: <span className="text-primary font-bold">${lumpSum.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="500000"
                      step="10000"
                      value={lumpSum}
                      onChange={(e) => setLumpSum(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Age: <span className="text-violet-500 font-bold">{startAge}</span>
                    </label>
                    <input
                      type="range"
                      min="55"
                      max="80"
                      step="1"
                      value={startAge}
                      onChange={(e) => setStartAge(parseInt(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">Estimated Monthly Income</p>
                  <p className="text-4xl font-bold text-white">${monthlyIncome.toLocaleString()}<span className="text-lg">/mo</span></p>
                  <p className="text-violet-500 text-sm mt-1">${annualIncome.toLocaleString()}/year • Guaranteed for life</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Retirement Income Annuity */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">What is a Retirement Income Annuity?</h2>
          <p className="text-lg text-gray-600 mb-6 text-pretty">
            A retirement income annuity converts a lump sum into guaranteed monthly payments for life.
            It's like creating your own pension. The insurance company pools risk across many people,
            allowing them to pay you more than you could safely withdraw on your own.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Guaranteed income for life",
              "Payments higher than 4% rule",
              "Eliminate longevity risk",
              "Joint-life options for spouses",
              "Start immediately or defer",
              "Period certain for beneficiaries"
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
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
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

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Create your guaranteed paycheck</h2>
          <p className="text-xl text-white/80 mb-8 text-pretty">
            See exactly how much lifetime income you could receive. Free, personalized illustration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/quote"
              className="inline-flex items-center gap-2 bg-violet-500 text-primary px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors"
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
