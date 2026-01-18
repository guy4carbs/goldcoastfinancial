import { useState } from "react";
import { Check, X } from "lucide-react";
import Header from "@/components/Header";
import QuoteCalculator from "@/components/QuoteCalculator";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO SECTION - Ethos Style with Rounded Container */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-heritage-primary rounded-3xl overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Content */}
              <div className="px-8 md:px-12 lg:px-16 py-12 lg:py-20">
                {/* Trustpilot Badge */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-white font-semibold">4.8</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-green-400 text-lg">★</span>
                    ))}
                  </div>
                  <span className="text-white text-sm">3000+ reviews on Trustpilot</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Clarity for life's complicated decisions.
                </h1>

                {/* Subtext */}
                <div className="flex flex-col gap-2 mb-10">
                  <div className="flex items-center gap-2 text-white text-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>NO MEDICAL EXAMS</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>NO BLOOD TESTS</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-8 py-4 rounded-lg font-semibold text-lg">
                    Check my price
                  </button>
                  <button className="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg">
                    Which insurance policy do I need?
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="text-white font-semibold mb-1">Best</div>
                    <div className="text-white/80 text-xs mb-2">TERM LIFE</div>
                    <div className="text-white/60 text-sm">Business Insider</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold mb-1">#1 online</div>
                    <div className="text-white/80 text-xs mb-2">ESTATE PLANNING</div>
                    <div className="text-white/60 text-sm">Award Badge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold mb-1">Trusted</div>
                    <div className="text-white/80 text-xs mb-2">PROVIDER</div>
                    <div className="text-white/60 text-sm">Forbes Advisor</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden lg:block">
                <img
                  src="/images/hero-family.jpg"
                  alt="Happy family with grandfather, daughter, and grandson"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEADLINE SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-20">
            The #1 no-medical-exam, instant life insurance provider
          </h2>

          <div className="grid md:grid-cols-4 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Get covered in 10 minutes
              </h3>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Up to $3 million in coverage
              </h3>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Free will & trust worth $898
              </h3>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Your best price from multiple carriers
              </h3>
            </div>
          </div>

          <div className="mt-16">
            <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-5 rounded-xl font-semibold text-xl">
              Check my price
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-lg text-gray-600 mb-4">How it works:</p>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
              We calculate your rate in real time, so you can get covered in 10 minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Answer a few simple questions and get your personalized quote instantly. No medical exam required.
            </p>
          </div>

          <QuoteCalculator />
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-white py-32">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Life insurance made easy
            </h2>
            <p className="text-xl text-gray-600">
              See how Heritage is changing the way people buy life insurance.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-0">
              {/* Header Row */}
              <div></div>
              <div className="bg-heritage-primary text-white py-8 px-6 text-center rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">HERITAGE</h3>
              </div>
              <div className="py-8 px-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Traditional life insurance</h3>
              </div>

              {/* Row 1: Instant underwriting */}
              <div className="py-6 px-6 border-b border-gray-200 flex items-center">
                <span className="text-lg text-gray-900">Instant underwriting</span>
              </div>
              <div className="bg-heritage-primary py-6 px-6 border-t border-white/20 flex items-center justify-center">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="py-6 px-6 border-b border-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 2: No medical exams */}
              <div className="py-6 px-6 border-b border-gray-200 flex items-center">
                <span className="text-lg text-gray-900">No medical exams</span>
              </div>
              <div className="bg-heritage-primary py-6 px-6 border-t border-white/20 flex items-center justify-center">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="py-6 px-6 border-b border-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 3: Same-day coverage */}
              <div className="py-6 px-6 border-b border-gray-200 flex items-center">
                <span className="text-lg text-gray-900">Same-day coverage</span>
              </div>
              <div className="bg-heritage-primary py-6 px-6 border-t border-white/20 flex items-center justify-center">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="py-6 px-6 border-b border-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 4: Free legal will */}
              <div className="py-6 px-6 border-b border-gray-200 flex items-center">
                <span className="text-lg text-gray-900">Free legal will</span>
              </div>
              <div className="bg-heritage-primary py-6 px-6 border-t border-white/20 flex items-center justify-center">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="py-6 px-6 border-b border-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 5: Trusted carriers */}
              <div className="py-6 px-6 flex items-center">
                <span className="text-lg text-gray-900">Trusted carriers</span>
              </div>
              <div className="bg-heritage-primary py-6 px-6 border-t border-white/20 flex items-center justify-center rounded-b-2xl">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="py-6 px-6 flex items-center justify-center">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-5 rounded-xl font-semibold text-xl">
              Check my price
            </button>
          </div>
        </div>

        {/* Pricing Table by Age - Wider Section */}
        <div className="mt-32 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
              {/* 30s Column */}
              <div className="bg-gray-50 rounded-2xl p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Life Insurance in Your 30s
                </h3>
                <p className="text-lg text-gray-600 mb-10">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $14/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $17/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $1,000,000 <span className="text-white/80 font-normal">from $18/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 40s Column */}
              <div className="bg-gray-50 rounded-2xl p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Life Insurance in Your 40s
                </h3>
                <p className="text-lg text-gray-600 mb-10">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $18/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $23/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $1,000,000 <span className="text-white/80 font-normal">from $27/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 50s Column */}
              <div className="bg-gray-50 rounded-2xl p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Life Insurance in Your 50s
                </h3>
                <p className="text-lg text-gray-600 mb-10">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $40/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $54/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-heritage-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $1,000,000 <span className="text-white/80 font-normal">from $70/mo</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* ANNUITIES PROMO 1 - Before FAQs */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-heritage-primary rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="px-12 lg:px-16 py-16 lg:py-20">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Secure your retirement with annuities
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Turn your savings into guaranteed income for life. Our annuity solutions provide financial security and peace of mind in retirement.
                </p>
                <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg">
                  Learn more
                </button>
              </div>

              {/* Right Image Placeholder */}
              <div className="hidden lg:block h-[500px] bg-white/5">
                {/* Image will be added here later */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="bg-white py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16 text-center">FAQs</h2>
          <div className="space-y-2">
            {[
              {
                question: "What is Heritage?",
                answer: "Heritage is a simple way to get clarity and direction when life gets complicated—especially when policies, paperwork, or decisions feel unclear."
              },
              {
                question: "Is this legal advice or financial advice?",
                answer: "Heritage gives practical guidance and decision structure. If your situation requires legal or tax counsel, we'll tell you what to ask and when to bring in a professional."
              },
              {
                question: "What kinds of situations do you help with?",
                answer: "Marriage, family changes, business decisions, job changes, moving, planning, protection, and anything involving \"what applies to me?\""
              },
              {
                question: "How long does it take?",
                answer: "Most people get clarity in minutes—and a plan they can follow right away."
              },
              {
                question: "Do I have to talk to someone?",
                answer: "No. You can do everything digitally. If you want help from a real person, that option is available."
              },
              {
                question: "Is this private?",
                answer: "Yes. Your situation stays yours."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-6 flex items-center justify-between hover:opacity-70 transition-opacity"
                >
                  <span className="text-xl font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <span className="text-3xl text-gray-400 flex-shrink-0">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="pb-6">
                    <p className="text-lg text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANNUITIES PROMO 2 - After FAQs */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-heritage-primary rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="px-12 lg:px-16 py-16 lg:py-20">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Guaranteed income you can't outlive
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Compare annuity rates from top-rated carriers. Get personalized quotes and find the right plan to protect your retirement income.
                </p>
                <button className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg">
                  Get your quote
                </button>
              </div>

              {/* Right Image Placeholder */}
              <div className="hidden lg:block h-[500px] bg-white/5">
                {/* Image will be added here later */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Us</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Mailing Address</p>
                  <p>1240 Iroquois Ave</p>
                  <p>Suite 506</p>
                  <p>Naperville, IL 60563</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Phone</p>
                  <p>(630) 778-0800</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <a href="mailto:info@heritagels.com" className="hover:text-heritage-primary">info@heritagels.com</a>
                </div>
                <div className="flex gap-3 pt-2">
                  <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold">f</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold">X</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold">in</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-heritage-primary">Our Policies</a></li>
                <li><a href="#faqs" className="hover:text-heritage-primary">FAQs</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Blog</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Life Insurance 101</a></li>
                <li><a href="#how-it-works" className="hover:text-heritage-primary">How It Works</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Account Login</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Get a Quote</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Company</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-heritage-primary">About Us</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Our Carriers</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Reviews</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Careers</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Contact</a></li>
                <li><a href="#" className="hover:text-heritage-primary">For Agents</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Agent Login</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-heritage-primary">Terms of Use</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Data Security</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Accessibility</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Licenses</a></li>
                <li><a href="#" className="hover:text-heritage-primary">Do Not Sell My Info</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="text-xs text-gray-500 leading-relaxed space-y-4">
              <p>
                © 2026 Heritage Life Solutions. Heritage operates as an independent insurance agency. Licensed in all 50 states.
                IL License #1001234567. Heritage offers policies issued by multiple carriers listed at heritagels.com/carriers.
                Products and their features may not be available in all states.
              </p>
              <p>
                To help avoid requiring a medical exam, our application asks certain health and lifestyle questions.
                No medical exam means online health questions are required. Customers can get approved in as little as 10 minutes.
                You can purchase instantly or do it anytime in the next 30 days as long as no information provided to us has changed.
              </p>
              <p>
                For people ages 40 and over, the average rate increase is 10% every 6 months. Once you purchase, your rate stays the same for your whole term.
              </p>
              <p className="text-gray-400 text-[10px]">
                Trustpilot rating as of January 2026. Best no-exam life insurance according to independent reviews.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
