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

export default function TermLife() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(20);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [age, setAge] = useState(35);

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
      <section className="bg-heritage-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-heritage-accent font-semibold mb-4 uppercase text-sm tracking-wide">
                Term Life Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Maximum protection.
                <span className="text-heritage-accent"> Minimum cost.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Protect your family with affordable coverage. Get up to $1 million for less than $1 a day.
              </p>
              <div className="flex flex-wrap gap-4">
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

            {/* Calculator Card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-heritage-accent/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-heritage-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Quick Estimate</h3>
                    <p className="text-sm text-gray-500">See your rate in seconds</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age: <span className="text-heritage-primary font-bold">{age}</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="65"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[250000, 500000, 1000000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setCoverageAmount(amount)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            coverageAmount === amount
                              ? 'bg-heritage-primary text-white'
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
                    <div className="grid grid-cols-5 gap-2">
                      {[10, 15, 20, 25, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTerm === term
                              ? 'bg-heritage-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {term}yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-heritage-primary rounded-xl text-center">
                  <p className="text-white/80 text-sm">Estimated Monthly Premium</p>
                  <p className="text-4xl font-bold text-white">${calculatePremium()}<span className="text-lg">/mo</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Term Life */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Term Life Insurance?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Term life is straightforward: you pay a monthly premium, and if you pass away during the term,
            your family receives a tax-free payout. It's the most affordable way to protect the people you love.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Coverage from $100K to $10M",
              "Terms of 10, 15, 20, 25, or 30 years",
              "Premiums locked for entire term",
              "Tax-free payout to beneficiaries",
              "No-exam options available",
              "Can convert to permanent coverage"
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
          <h2 className="text-3xl font-bold text-white mb-4">Ready to protect your family?</h2>
          <p className="text-xl text-white/80 mb-8">
            Get a free quote in minutes. No obligation, no pressure.
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
