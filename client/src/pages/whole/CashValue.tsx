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

export default function CashValue() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [monthlyPremium, setMonthlyPremium] = useState(300);
  const [years, setYears] = useState(20);

  const calculateCashValue = (yr: number) => {
    const annualPremium = monthlyPremium * 12;
    const totalPremiums = annualPremium * yr;
    const efficiency = yr < 10 ? 0.35 + (yr * 0.04) : 0.6 + ((yr - 10) * 0.025);
    const growthMultiplier = Math.pow(1.045, yr);
    return Math.round(totalPremiums * efficiency * growthMultiplier);
  };

  const faqs = [
    {
      question: "How quickly does cash value build?",
      answer: "Slowly at first - most early premiums cover insurance costs. Significant accumulation typically starts after year 7-10. After 15-20 years, cash value often exceeds total premiums paid."
    },
    {
      question: "How do policy loans work?",
      answer: "You borrow from the insurer using your cash value as collateral. No credit check, no approval needed, no fixed repayment schedule. Interest accrues on unpaid loans, and unpaid balance is deducted from the death benefit."
    },
    {
      question: "Are withdrawals taxed?",
      answer: "Withdrawals up to your cost basis (total premiums paid) are tax-free. Gains above basis are taxable. Policy loans aren't taxed since they're technically loans, not withdrawals."
    },
    {
      question: "What happens to cash value when I die?",
      answer: "Beneficiaries receive the death benefit, not the cash value separately - they don't stack. Some policies offer riders to include cash value in the payout."
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
                Whole Life Insurance
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Build savings
                <span className="text-heritage-accent"> inside your policy.</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Cash value grows tax-deferred at guaranteed rates. Access it anytime through policy loans - no credit check required.
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
                    <h3 className="font-bold text-gray-900">Cash Value Calculator</h3>
                    <p className="text-sm text-gray-500">See your potential growth</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Premium: <span className="text-heritage-primary font-bold">${monthlyPremium}</span>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={monthlyPremium}
                      onChange={(e) => setMonthlyPremium(parseInt(e.target.value))}
                      className="w-full accent-heritage-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 15, 20, 25].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setYears(yr)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            years === yr
                              ? 'bg-heritage-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {yr} yrs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-heritage-primary rounded-xl text-center mb-4">
                  <p className="text-white/80 text-sm">Projected Cash Value</p>
                  <p className="text-4xl font-bold text-white">${calculateCashValue(years).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Premiums Paid</p>
                    <p className="text-lg font-bold text-gray-700">${(monthlyPremium * 12 * years).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Cash Value %</p>
                    <p className="text-lg font-bold text-heritage-accent">
                      {Math.round((calculateCashValue(years) / (monthlyPremium * 12 * years)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Cash Value */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Cash Value?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Cash value is a savings component inside whole life insurance. Part of every premium goes toward
            building this tax-deferred account that grows at guaranteed rates. You can access it through
            policy loans - no credit checks, no approval process, no questions asked.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Guaranteed minimum growth rate",
              "Tax-deferred accumulation",
              "Borrow without credit checks",
              "No contribution limits",
              "Protected from market losses",
              "Use for any purpose"
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
          <h2 className="text-3xl font-bold text-white mb-4">Start building cash value today</h2>
          <p className="text-xl text-white/80 mb-8">
            See how much cash value you could accumulate. Get a personalized illustration.
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
