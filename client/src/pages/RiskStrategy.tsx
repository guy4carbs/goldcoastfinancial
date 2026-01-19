import { useState } from "react";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RiskStrategy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO SECTION - Wide Centered */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-heritage-primary rounded-3xl overflow-hidden">
            <div className="text-center px-12 lg:px-24 py-24 lg:py-32">
              <p className="text-xl uppercase tracking-wider text-white/80 font-semibold mb-10">
                Risk Strategy • Not Insurance Sales
              </p>
              <h1 className="text-7xl md:text-8xl font-bold text-white mb-12 leading-tight max-w-5xl mx-auto">
                Protection isn't a policy. It's a plan.
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-6 rounded-xl font-semibold text-xl">
                  Schedule consultation
                </button>
                <button className="border-2 border-white hover:bg-white/10 text-white px-12 py-6 rounded-xl font-semibold text-xl">
                  Our approach
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-10 leading-tight">
                We don't sell life insurance. We architect protection.
              </h2>
              <p className="text-2xl text-gray-600 leading-relaxed">
                Insurance is the instrument. The product is continuity, control, and preservation of what you've built.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl h-[500px]">
              {/* Image placeholder */}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE PROTECT */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900">
              When life interrupts
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Protect Income
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your family's financial foundation remains intact
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Preserve Control
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Ownership and decision-making power stay intact
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ensure Continuity
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Generational wealth and stability protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE - Rounded Hero Blocks */}
      <section className="bg-white py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900">
              Built for decision-makers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-gray-50 rounded-3xl p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Business Owners & Founders
              </h3>
              <ul className="space-y-4 text-xl text-gray-600">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Key person protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Buy-sell agreement funding</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Succession continuity planning</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-3xl p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                High-Income Families
              </h3>
              <ul className="space-y-4 text-xl text-gray-600">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Estate liquidity solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Wealth transfer strategies</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-heritage-accent flex-shrink-0 mt-1" />
                  <span>Multi-generational protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE'RE DIFFERENT - Image + Advisory Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-heritage-primary rounded-3xl overflow-hidden">
            {/* Horizontal Image */}
            <div className="relative bg-heritage-primary h-[550px] overflow-hidden">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1768770792872-strategy-man-heritage-insurance.png?alt=media&token=497977f7-59ff-453a-b7f4-6d36d21e7e57"
                alt="Heritage Life Solutions Strategy"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Content Below Image */}
            <div className="p-16">
              <div className="text-center mb-20">
                <h2 className="text-6xl md:text-7xl font-bold text-white">
                  Advisory, not transactional
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-20">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-8">Most Insurance Shops</h3>
                  <ul className="space-y-5 text-white/80 text-2xl">
                    <li>Focused on closing sales</li>
                    <li>Quote-based competition</li>
                    <li>Transaction ends at signature</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-white mb-8">Heritage Approach</h3>
                  <ul className="space-y-5 text-white/90 text-2xl">
                    <li className="flex items-start gap-4">
                      <Check className="w-7 h-7 text-heritage-accent flex-shrink-0 mt-1" />
                      <span>Comprehensive protection plans</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="w-7 h-7 text-heritage-accent flex-shrink-0 mt-1" />
                      <span>Outcome-focused, not product-focused</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <Check className="w-7 h-7 text-heritage-accent flex-shrink-0 mt-1" />
                      <span>Ongoing strategic relationships</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-16 text-center">
            Common Questions
          </h2>
          <div className="space-y-2">
            {[
              {
                question: "How is this different from buying life insurance online?",
                answer: "Online platforms sell commoditized products at the lowest price. We design protection architectures tailored to your specific risk profile, business structure, and wealth goals. The difference is a transactional purchase vs. strategic planning."
              },
              {
                question: "Do you only work with wealthy clients?",
                answer: "We work with decision-makers who value planning over price shopping. That includes young professionals building wealth, business owners protecting key assets, and families ensuring generational continuity. Income matters less than mindset."
              },
              {
                question: "What does a strategic consultation include?",
                answer: "We analyze your current risk exposures, income dependencies, business continuity gaps, and estate planning needs. Then we design a protection architecture—not just recommend products. You leave with clarity, not a sales pitch."
              },
              {
                question: "Is this more expensive than traditional insurance?",
                answer: "Sometimes yes, sometimes no. We're not competing on price—we're competing on outcome. Our clients pay for comprehensive protection planning, not the cheapest policy. Long-term, that often costs less because we prevent gaps and overlaps."
              },
              {
                question: "Do you work with my existing advisors?",
                answer: "Absolutely. We collaborate with CPAs, estate attorneys, and wealth managers regularly. Risk strategy should integrate with your broader financial plan, not exist in isolation."
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-6 flex items-center justify-between hover:opacity-70 transition-opacity"
                >
                  <span className="text-2xl md:text-3xl font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <span className="text-3xl text-gray-400 flex-shrink-0">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="pb-6">
                    <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Ready to move beyond price quotes?
          </h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Let's design a protection plan that ensures income, control, and continuity—no matter what life interrupts.
          </p>
          <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-5 rounded-xl font-semibold text-xl">
            Schedule your strategic consultation
          </button>
          <p className="text-sm text-gray-500 mt-6">
            No sales pitch. No pressure. Just strategic clarity.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
