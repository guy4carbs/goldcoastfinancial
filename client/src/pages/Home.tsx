import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Check, X, Clock, Shield, FileText, DollarSign, MessageCircle, Send, ArrowRight, Star, Play } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickQuoteWidget, { type QuickQuoteData } from "@/components/QuickQuoteWidget";
import TrustIndicators from "@/components/TrustIndicators";
import Testimonials from "@/components/Testimonials";
import NewsletterBanner from "@/components/NewsletterBanner";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const carriers = [
  "Americo", "Athene", "Baltimore Life", "Corebridge",
  "Mutual of Omaha", "Ethos", "Royal Neighbors", "Transamerica",
  "American Home Life", "Polish Falcons", "Ladder", "Lincoln Financial"
];

const testimonials = [
  {
    quote: "Heritage made getting life insurance so simple. I was covered in less than 15 minutes with no medical exam required.",
    name: "Sarah M.",
    location: "Chicago, IL"
  },
  {
    quote: "The team took the time to explain my options and find the best rate. I'm saving over $50/month compared to my old policy.",
    name: "Michael T.",
    location: "Naperville, IL"
  },
  {
    quote: "Finally, an insurance company that doesn't make you jump through hoops. Professional, fast, and genuinely helpful.",
    name: "Jennifer L.",
    location: "Aurora, IL"
  }
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsVideoPlaying(true);
    }
  };

  // Handle widget completion - redirect to quote page with data
  const handleQuickQuoteComplete = (data: QuickQuoteData) => {
    // Build URL params for the quote page
    const params = new URLSearchParams({
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age.toString(),
      gender: data.gender,
      tobacco: data.tobacco.toString(),
      zipCode: data.zipCode,
      heightFeet: data.heightFeet.toString(),
      heightInches: data.heightInches.toString(),
      weight: data.weight.toString(),
    });
    setLocation(`/quote?${params.toString()}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <NewsletterBanner />
      <Header />

      {/* HERO SECTION - Ethos Style with Rounded Container */}
      <section className="bg-[#f5f0e8] py-8">
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
                    <span className="w-2 h-2 bg-[#fffaf3] rounded-full"></span>
                    <span>NO MEDICAL EXAMS</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-lg">
                    <span className="w-2 h-2 bg-[#fffaf3] rounded-full"></span>
                    <span>NO BLOOD TESTS</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <a href="/quote" className="bg-heritage-accent hover:bg-heritage-accent/80 text-white px-8 py-4 rounded-lg font-semibold text-lg text-center">
                    Check my price
                  </a>
                  <button className="border-2 border-white hover:bg-[#fffaf3]/10 text-white px-8 py-4 rounded-lg font-semibold text-lg">
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

      {/* CARRIER LOGOS */}
      <section className="py-12 bg-[#fffaf3] border-y border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by families nationwide. We partner with 40+ A-rated carriers.</p>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee-slow gap-12">
              {[...carriers, ...carriers].map((carrier, i) => (
                <div key={i} className="flex-shrink-0 px-6 py-3 bg-[#f5f0e8] rounded-lg">
                  <span className="text-gray-600 font-medium whitespace-nowrap">{carrier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK QUOTE SECTION */}
      <section className="py-20 bg-gradient-to-b from-[#fffaf3] to-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">4.9/5 from 2,500+ reviews</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Get your rate in <span className="text-heritage-primary">30 seconds</span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Answer 3 quick questions and see your estimated rate instantly.
                No contact info required until you're ready.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Instant estimates - no waiting",
                  "Compare multiple term lengths",
                  "No medical exam for most applicants",
                  "30-day money-back guarantee",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <a
                href="/quote"
                className="inline-flex items-center gap-2 text-heritage-primary font-medium hover:underline"
              >
                Or start full application
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Right: Quick Quote Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <QuickQuoteWidget variant="hero" onGetFullQuote={handleQuickQuoteComplete} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HEADLINE SECTION */}
      <motion.section
        className="py-24 bg-[#fffaf3]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-20">
            The #1 no-medical-exam, instant life insurance provider
          </h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Card 1 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <Clock className="w-7 h-7 text-heritage-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Get covered in 10 minutes
              </h3>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <Shield className="w-7 h-7 text-heritage-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Up to $3 million in coverage
              </h3>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <FileText className="w-7 h-7 text-heritage-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Free will & trust worth $898
              </h3>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-heritage-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <DollarSign className="w-7 h-7 text-heritage-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Your best price from multiple carriers
              </h3>
            </motion.div>
          </motion.div>

          <div className="mt-16">
            <a href="/quote" className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-5 rounded-xl font-semibold text-xl">
              Check my price
            </a>
          </div>
        </div>
      </motion.section>

      {/* PROTECT WHAT MATTERS PROMO */}
      <section className="bg-[#f5f0e8] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Video */}
            <div className="hidden lg:block h-[500px] bg-gray-900 rounded-3xl overflow-hidden relative">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769056902708-Family%20Future%20Protected.mp4?alt=media&token=1b984fa6-f024-4f9d-b26b-9f096ee01454"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-heritage-primary ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>

            {/* Right Content */}
            <div className="lg:pl-8">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Protect what matters most
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Life insurance isn't just about money—it's about making sure your family is taken care of no matter what. We make it simple to get the coverage you need.
              </p>
              <a href="/quote" className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-10 py-4 rounded-xl font-semibold text-lg">
                Get started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-[#fffaf3] py-32">
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
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-0">
              {/* Header Row */}
              <div></div>
              <div className="bg-heritage-primary text-white py-8 px-6 text-center rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">HERITAGE</h3>
              </div>
              <div className="py-8 px-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Traditional</h3>
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
            <a href="/quote" className="inline-block bg-heritage-accent hover:bg-heritage-accent/80 text-white px-12 py-5 rounded-xl font-semibold text-xl">
              Check my price
            </a>
          </div>
        </div>

        {/* Pricing Table by Age - Wider Section */}
        <div className="mt-32 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
              {/* 30s Column */}
              <div className="bg-[#f5f0e8] rounded-2xl p-10 text-center">
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
              <div className="bg-[#f5f0e8] rounded-2xl p-10 text-center">
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
              <div className="bg-[#f5f0e8] rounded-2xl p-10 text-center">
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

      {/* ANNUITIES PROMO 1 */}
      <section className="bg-[#f5f0e8] py-24">
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

              {/* Right Image */}
              <div className="hidden lg:block h-[500px] overflow-hidden">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769115619375-7.17.24-2024-pension-research-council-symposium-retirement-GettyImages-1453972025-900x612.avif?alt=media&token=cbedfb8a-13e2-4905-926d-10cb77857375"
                  alt="Retirement planning"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - New Enhanced Version */}
      <Testimonials variant="carousel" />

      {/* TRUST INDICATORS */}
      <TrustIndicators variant="full" />

      {/* FROM OUR LEADERSHIP */}
      <section className="bg-[#fffaf3] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg text-gray-600 mb-4">
                From Our Leadership
              </p>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                "We build relationships meant to endure for generations, not transactions designed for commissions."
              </h2>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Heritage Life Solutions was founded on the belief that financial protection requires patient guidance,
                principled leadership, and an unwavering commitment to doing what is right for families and partners alike.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-heritage-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JC</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Jack Cook</p>
                  <p className="text-sm text-gray-500">Founder & Chief Executive Officer</p>
                </div>
              </div>
            </motion.div>

            {/* Right Video Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative aspect-video bg-[#e8e0d5] rounded-2xl overflow-hidden">
                {/* Video placeholder with play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-heritage-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-heritage-primary/90 transition-colors shadow-lg">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-heritage-primary/5 to-transparent" />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">Watch our story</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="bg-[#fffaf3] py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16 text-center">FAQs</h2>
          <div className="space-y-2">
            {[
              {
                question: "What is Heritage?",
                answer: "Heritage is a life insurance agency that makes it easy to protect your family. We help you find the right coverage at the best price—no confusing jargon, no pushy sales tactics."
              },
              {
                question: "Do I need a medical exam?",
                answer: "Most of our policies don't require one. Answer a few health questions online and you could be approved the same day."
              },
              {
                question: "How much coverage do I need?",
                answer: "A good rule of thumb is 10-12x your annual income. Our quote tool helps you figure out the right amount based on your situation."
              },
              {
                question: "How long does it take to get covered?",
                answer: "Most people complete the application in about 10 minutes. Many get approved instantly or within 24 hours."
              },
              {
                question: "Can I talk to a real person?",
                answer: "Absolutely. You can do everything online, but our licensed agents are available by phone if you have questions or want guidance."
              },
              {
                question: "What if I change my mind?",
                answer: "No problem. You have 30 days to cancel for a full refund, no questions asked."
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

      <Footer />

      {/* LIVE CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-[#e8e0d5] overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-heritage-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Heritage Support</h4>
                  <p className="text-white/70 text-xs">We typically reply in minutes</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 h-64 bg-[#f5f0e8]">
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                <p className="text-sm text-gray-700">Hi! 👋 How can we help you today?</p>
                <p className="text-xs text-gray-400 mt-1">Just now</p>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#e8e0d5] bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#e8e0d5] rounded-lg text-sm focus:outline-none focus:border-heritage-primary"
                />
                <button className="p-2 bg-heritage-primary text-white rounded-lg hover:bg-heritage-primary/90">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Toggle Button */}
        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 bg-heritage-primary text-white rounded-full shadow-lg hover:bg-heritage-primary/90 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}
