import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteCalculator, { type QuoteCalculatorPrefillData } from "@/components/QuoteCalculator";
import QuickQuoteWidget, { type QuickQuoteData } from "@/components/QuickQuoteWidget";
import TrustIndicators, { RatingBadge } from "@/components/TrustIndicators";
import LoadingScreen from "@/components/LoadingScreen";

const carriers = [
  { name: "Americo", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba" },
  { name: "Athene", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643" },
  { name: "Baltimore Life", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c" },
  { name: "Corebridge", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2" },
  { name: "Mutual of Omaha", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173", size: "large" },
  { name: "Ethos", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52" },
  { name: "Royal Neighbors", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56" },
  { name: "Transamerica", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d", size: "large" },
  { name: "American Home Life", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b", size: "large" },
  { name: "Polish Falcons", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238" },
  { name: "Ladder", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733" },
  { name: "Lincoln Financial", logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b" },
];
import Testimonials, { MiniTestimonial } from "@/components/Testimonials";
import { Phone, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Quote() {
  const search = useSearch();
  const [showQuoter, setShowQuoter] = useState(false);
  const applicationRef = useRef<HTMLDivElement>(null);

  // Pre-fill data from quick quote widget
  const [prefillData, setPrefillData] = useState<QuoteCalculatorPrefillData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const age = params.get("age");
    const gender = params.get("gender");
    const tobacco = params.get("tobacco");
    const firstName = params.get("firstName");
    const lastName = params.get("lastName");
    const zipCode = params.get("zipCode");
    const heightFeet = params.get("heightFeet");
    const heightInches = params.get("heightInches");
    const weight = params.get("weight");

    if (age || gender || tobacco || firstName) {
      setPrefillData({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        tobacco: tobacco === "true",
        zipCode: zipCode || undefined,
        heightFeet: heightFeet ? parseInt(heightFeet) : undefined,
        heightInches: heightInches ? parseInt(heightInches) : undefined,
        weight: weight ? parseInt(weight) : undefined,
      });
      // If we have URL params, go directly to the quoter
      setShowQuoter(true);
      setTimeout(() => {
        applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [search]);

  const handleQuickQuoteComplete = (data: QuickQuoteData) => {
    console.log("handleQuickQuoteComplete called with:", data);
    // Convert widget data to quoter prefill format
    setPrefillData({
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      gender: data.gender,
      tobacco: data.tobacco,
      zipCode: data.zipCode,
      heightFeet: data.heightFeet,
      heightInches: data.heightInches,
      weight: data.weight,
    });
    setShowQuoter(true);
    setTimeout(() => {
      applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleStartQuote = () => {
    setShowQuoter(true);
    setTimeout(() => {
      applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <LoadingScreen />
      <Header />

      {/* Hero Section */}
      <section className="pt-8 pb-12 md:pt-12 md:pb-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Messaging */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <RatingBadge />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
              >
                Find the right coverage{" "}
                <span className="text-primary">for your life</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                Answer a few questions about your goals and we'll recommend the perfect policy.
                No jargon, no pressure - just honest guidance.
              </motion.p>

              {/* Trust Points */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-8"
              >
                {[
                  "Personalized recommendations based on your needs",
                  "No medical exam for most applicants",
                  "Approval in as fast as 10 minutes",
                  "30-day money-back guarantee",
                ].map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:hidden"
              >
                <button
                  onClick={handleStartQuote}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-heritage-dark transition-colors text-lg"
                >
                  Get My Recommendation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>

            {/* Right: Quick Quote Widget or Testimonial */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {!showQuoter ? (
                <QuickQuoteWidget
                  variant="hero"
                  onGetFullQuote={handleQuickQuoteComplete}
                />
              ) : (
                <div className="space-y-4">
                  <MiniTestimonial />
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      You're on your way!
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Complete the questions below to get your personalized recommendation. It only takes a few minutes.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Your application is in progress
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Carrier Logos */}
      <section className="py-12 bg-[#fffaf3] border-y border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by families nationwide. We partner with 40+ A-rated carriers.</p>
          <div className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex animate-marquee-slow gap-12 items-center">
                {carriers.map((carrier, i) => (
                  <div key={i} className="flex-shrink-0 w-[240px] h-28 flex items-center justify-center">
                    <img
                      src={carrier.logo}
                      alt={carrier.name}
                      className={`object-contain ${carrier.size === 'large' ? 'h-24 max-w-[220px]' : 'h-[72px] max-w-[200px]'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex animate-marquee-slow gap-12 items-center" aria-hidden="true">
                {carriers.map((carrier, i) => (
                  <div key={`dup-${i}`} className="flex-shrink-0 w-[240px] h-28 flex items-center justify-center">
                    <img
                      src={carrier.logo}
                      alt={carrier.name}
                      className={`object-contain ${carrier.size === 'large' ? 'h-24 max-w-[220px]' : 'h-[72px] max-w-[200px]'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {!showQuoter ? (
            <>
              {/* Why Choose Heritage Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
                  Why Choose Heritage?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We don't just sell policies - we help you understand what you actually need. Our recommendation engine considers your unique situation to find the right fit.
                </p>
              </motion.div>

              {/* How It Works */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-16">
                {[
                  {
                    step: "1",
                    title: "Tell Us About Yourself",
                    description: "Answer 8 simple questions about your goals, family, and financial situation. No personal info required yet.",
                  },
                  {
                    step: "2",
                    title: "Get Your Recommendation",
                    description: "Our smart engine analyzes your answers and recommends the best product type, coverage amount, and term length.",
                  },
                  {
                    step: "3",
                    title: "Apply in Minutes",
                    description: "Happy with the recommendation? Complete your application right here. Most applicants get approved the same day.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-4 md:p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={handleStartQuote}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-heritage-dark transition-colors text-lg"
                >
                  Start My Free Quote
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Takes about 5 minutes. No commitment required.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-16">
                <TrustIndicators variant="badges" />
              </div>
            </>
          ) : (
            /* Full Quoter */
            <div ref={applicationRef}>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-balance">
                  Let's Find Your Perfect Coverage
                </h2>
                <p className="text-gray-600">
                  Answer a few questions and we'll recommend the best policy for your situation.
                </p>
              </div>
              <QuoteCalculator prefillData={prefillData} />
            </div>
          )}
        </div>
      </section>

      {/* Testimonials (only when not in quoter) */}
      {!showQuoter && <Testimonials variant="carousel" />}

      {/* Full Trust Section (only when not in quoter) */}
      {!showQuoter && <TrustIndicators variant="full" />}

      {/* Help Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our licensed insurance specialists are here to answer your questions and help you find the right coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+16307780800"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-heritage-dark transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (630) 778-0800
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Contact Us Online
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Available Monday - Friday, 9am - 6pm CST
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center text-balance">Common Questions</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How does the recommendation work?</h3>
                <p className="text-gray-600 text-sm">
                  We ask about your goals, family situation, budget, and timeline. Our algorithm then matches you with the right type of policy (term, whole life, etc.) and suggests appropriate coverage amounts based on your specific needs.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Do I need a medical exam?</h3>
                <p className="text-gray-600 text-sm">
                  Many of our policies don't require a medical exam. Based on your health profile and coverage amount,
                  you may qualify for instant approval without any medical tests.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How long does approval take?</h3>
                <p className="text-gray-600 text-sm">
                  Many applicants receive instant or same-day approval. If additional review is needed,
                  our team typically processes applications within 24-48 hours.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">What if I don't agree with the recommendation?</h3>
                <p className="text-gray-600 text-sm">
                  No problem! Our recommendation is a starting point. You can adjust coverage amounts, explore alternatives, or speak with one of our specialists to find exactly what works for you.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">What's the 30-day money-back guarantee?</h3>
                <p className="text-gray-600 text-sm">
                  If you're not completely satisfied with your policy, you can cancel within 30 days of issuance
                  and receive a full refund of any premiums paid. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
