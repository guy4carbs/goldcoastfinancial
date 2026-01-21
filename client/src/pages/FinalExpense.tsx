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

export default function FinalExpense() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coverageAmount, setCoverageAmount] = useState(15000);
  const [age, setAge] = useState(65);

  const calculatePremium = () => {
    const baseRate = 0.45;
    const ageMultiplier = 1 + ((age - 50) * 0.035);
    const monthly = ((coverageAmount / 1000) * baseRate * ageMultiplier);
    return Math.round(monthly);
  };

  const faqs = [
    {
      question: "What is final expense insurance?",
      answer: "Final expense is a smaller whole life policy (typically $5,000-$50,000) designed to cover funeral costs, medical bills, and other end-of-life expenses so your family isn't burdened financially."
    },
    {
      question: "Do I need a medical exam?",
      answer: "No. Final expense policies are either guaranteed issue (no health questions) or simplified issue (a few health questions, no exam). Most people qualify regardless of health conditions."
    },
    {
      question: "What's the difference between guaranteed and simplified issue?",
      answer: "Guaranteed issue accepts everyone but may have a 2-year waiting period for full benefits. Simplified issue asks a few health questions but provides immediate full coverage if you qualify."
    },
    {
      question: "How much coverage do I need?",
      answer: "The average funeral costs $8,000-$12,000. Most people choose $10,000-$25,000 to cover funeral expenses plus any outstanding medical bills or debts."
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
                Final Expense Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Protect your family
                <span className="text-heritage-accent"> from final costs.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Affordable coverage with no medical exam. Guaranteed acceptance for ages 50-85.
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
                      min="50"
                      max="85"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10000, 15000, 20000, 25000].map((amount) => (
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

      {/* What is Final Expense */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Final Expense Insurance?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Final expense (also called burial insurance) is a small whole life policy designed to cover
            end-of-life costs. It ensures your family isn't left with funeral bills, medical expenses,
            or other debts when you pass. Most policies have no medical exam and guaranteed acceptance.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Coverage from $5,000 to $50,000",
              "No medical exam required",
              "Guaranteed acceptance available",
              "Premiums never increase",
              "Benefits paid within 24-48 hours",
              "Cash value builds over time"
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
          <h2 className="text-3xl font-bold text-white mb-4">Give your family peace of mind</h2>
          <p className="text-xl text-white/80 mb-8">
            Get covered today. No medical exam, no waiting, no hassle.
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
