import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Check, Clock, Shield, FileText, DollarSign, ArrowRight, Star, Play, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickQuoteWidget, { type QuickQuoteData } from "@/components/QuickQuoteWidget";
import TrustIndicators from "@/components/TrustIndicators";
import Testimonials from "@/components/Testimonials";
import NewsletterBanner from "@/components/NewsletterBanner";
import LoadingScreen from "@/components/LoadingScreen";
import { useAnalytics, useScrollTracking } from "@/hooks/useAnalytics";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLeadershipVideoPlaying, setIsLeadershipVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const leadershipVideoRef = useRef<HTMLVideoElement>(null);

  // Site settings
  const { getPhone } = useSiteSettings();
  const phone = getPhone();

  // Analytics tracking
  const { trackCTAClicked, trackVideoPlayed, trackPhoneClicked } = useAnalytics();
  useScrollTracking();

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsVideoPlaying(true);
      trackVideoPlayed("hero_video", video.src);
    }
  };

  const handlePlayLeadershipVideo = () => {
    const video = leadershipVideoRef.current;
    if (video) {
      video.play();
      setIsLeadershipVideoPlaying(true);
      trackVideoPlayed("leadership_video", video.src);
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
      <LoadingScreen />
      <NewsletterBanner />
      <Header />

      {/* HERO SECTION - Ethos Style with Rounded Container */}
      <section className="bg-[#f5f0e8] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary rounded-3xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Left Content */}
              <div className="p-4 md:p-6 lg:px-16 lg:py-20">
                {/* Trustpilot Badge */}
                <div className="flex items-center gap-2 mb-6 md:mb-8">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-white font-bold">4.8</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-green-400 text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-white/80 text-sm">3000+ reviews</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight text-balance">
                  Clarity for life's complicated decisions.
                </h1>

                {/* Subtext */}
                <div className="flex flex-col gap-2 mb-6 md:mb-10">
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
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-16">
                  <a
                    href="/quote"
                    className="bg-violet-500 hover:bg-violet-400 text-white px-8 py-3.5 md:py-4 rounded-xl font-semibold text-lg text-center shadow-lg shadow-violet-500/30 transition-all"
                    onClick={() => trackCTAClicked("Check My Price", "hero", "/quote")}
                  >
                    Check my price
                  </a>
                  <a
                    href="/products"
                    className="border-2 border-white/80 hover:bg-white/10 text-white px-8 py-3.5 md:py-4 rounded-xl font-semibold text-lg text-center transition-all"
                    onClick={() => trackCTAClicked("Which policy do I need?", "hero", "/products")}
                  >
                    Which policy do I need?
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 items-center">
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

              {/* Right Image - hidden on mobile, shown on lg+ */}
              <div className="relative hidden lg:block">
                <img
                  src="/images/hero-family.jpg"
                  alt="Happy family with grandfather, daughter, and grandson"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Mobile Hero Image Alternative */}
              <div className="lg:hidden px-4 pb-4">
                <img
                  src="/images/hero-family.jpg"
                  alt="Happy family with grandfather, daughter, and grandson"
                  className="w-full h-48 sm:h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARRIER LOGOS */}
      <section className="py-12 bg-[#fffaf3] border-y border-[#e8e0d5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by families nationwide. We partner with 40+ A-rated carriers.</p>
        </div>
        <div className="relative w-full">
          <div className="flex w-max animate-carousel">
            {[...carriers, ...carriers].map((carrier, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] mx-6 h-24 flex items-center justify-center">
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className={`object-contain grayscale hover:grayscale-0 transition-all duration-300 ${carrier.size === 'large' ? 'h-20 max-w-[180px]' : 'h-16 max-w-[160px]'}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK QUOTE SECTION */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#fffaf3] to-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12 items-center">
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

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Get your rate in <span className="text-primary">30 seconds</span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
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
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
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
        className="py-12 md:py-20 bg-[#fffaf3]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-16 text-balance">
            The #1 no-medical-exam, instant life insurance provider
          </h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Card 1 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-balance">
                Get covered in 10 minutes
              </h3>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-balance">
                Up to $3 million in coverage
              </h3>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-balance">
                Free will & trust worth $898
              </h3>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={fadeInUp} className="bg-[#fffdf9] rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-balance">
                Your best price from multiple carriers
              </h3>
            </motion.div>
          </motion.div>

          <div className="mt-16">
            <a
              href="/quote"
              className="inline-block bg-violet-500 hover:bg-violet-500/80 text-white px-12 py-5 rounded-xl font-semibold text-xl"
              onClick={() => trackCTAClicked("Check My Price", "headline_section", "/quote")}
            >
              Check my price
            </a>
          </div>
        </div>
      </motion.section>

      {/* PROTECT WHAT MATTERS PROMO */}
      <section className="bg-[#f5f0e8] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12 items-center">
            {/* Video - shows on all sizes with responsive height */}
            <div className="h-[280px] sm:h-[350px] lg:h-[500px] bg-gray-900 rounded-3xl overflow-hidden relative">
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
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>

            {/* Right Content */}
            <div className="lg:pl-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Protect what matters most
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
                Life insurance isn't just about money—it's about making sure your family is taken care of no matter what. We make it simple to get the coverage you need.
              </p>
              <a
                href="/quote"
                className="inline-block bg-violet-500 hover:bg-violet-500/80 text-white px-10 py-4 rounded-xl font-semibold text-lg"
                onClick={() => trackCTAClicked("Get started", "protect_section", "/quote")}
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-[#fffaf3] py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">
              Life insurance made easy
            </h2>
            <p className="text-xl text-gray-600 text-pretty">
              See how Heritage is changing the way people buy life insurance.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Header Row - visible on md+ */}
              <div className="hidden md:block"></div>
              <div className="hidden md:block bg-primary text-white py-4 md:py-8 px-4 md:px-6 text-center rounded-t-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-white">HERITAGE</h3>
              </div>
              <div className="hidden md:block py-4 md:py-8 px-4 md:px-6 text-center">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Traditional</h3>
              </div>
              {/* Mobile Header */}
              <div className="md:hidden col-span-1 grid grid-cols-3 gap-2 mb-4">
                <div></div>
                <div className="bg-primary text-white py-3 px-2 text-center rounded-t-xl">
                  <h3 className="text-sm font-bold text-white">HERITAGE</h3>
                </div>
                <div className="py-3 px-2 text-center">
                  <h3 className="text-sm font-semibold text-gray-900">Traditional</h3>
                </div>
              </div>

              {/* Comparison Rows - Mobile Layout */}
              <div className="md:hidden space-y-2">
                {[
                  { label: "Instant underwriting", heritage: true, traditional: false },
                  { label: "No medical exams", heritage: true, traditional: false },
                  { label: "Same-day coverage", heritage: true, traditional: false },
                  { label: "Free legal will", heritage: true, traditional: false },
                  { label: "Trusted carriers", heritage: true, traditional: true },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{row.label}</span>
                    </div>
                    <div className="bg-primary flex items-center justify-center py-2 rounded-lg">
                      <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      {row.traditional ? (
                        <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Rows - Desktop Layout */}
              {/* Row 1: Instant underwriting */}
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center">
                <span className="text-base md:text-lg text-gray-900">Instant underwriting</span>
              </div>
              <div className="hidden md:flex bg-primary py-4 md:py-6 px-4 md:px-6 border-t border-white/20 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 2: No medical exams */}
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center">
                <span className="text-base md:text-lg text-gray-900">No medical exams</span>
              </div>
              <div className="hidden md:flex bg-primary py-4 md:py-6 px-4 md:px-6 border-t border-white/20 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 3: Same-day coverage */}
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center">
                <span className="text-base md:text-lg text-gray-900">Same-day coverage</span>
              </div>
              <div className="hidden md:flex bg-primary py-4 md:py-6 px-4 md:px-6 border-t border-white/20 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 4: Free legal will */}
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center">
                <span className="text-base md:text-lg text-gray-900">Free legal will</span>
              </div>
              <div className="hidden md:flex bg-primary py-4 md:py-6 px-4 md:px-6 border-t border-white/20 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 border-b border-gray-200 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300 rounded-full"></div>
              </div>

              {/* Row 5: Trusted carriers */}
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 items-center">
                <span className="text-base md:text-lg text-gray-900">Trusted carriers</span>
              </div>
              <div className="hidden md:flex bg-primary py-4 md:py-6 px-4 md:px-6 border-t border-white/20 items-center justify-center rounded-b-2xl">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex py-4 md:py-6 px-4 md:px-6 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <a
              href="/quote"
              className="inline-block bg-violet-500 hover:bg-violet-500/80 text-white px-12 py-5 rounded-xl font-semibold text-xl"
              onClick={() => trackCTAClicked("Check My Price", "comparison_section", "/quote")}
            >
              Check my price
            </a>
          </div>
        </div>

        {/* Pricing Table by Age - Wider Section */}
        <div className="mt-20 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
              {/* 30s Column */}
              <div className="bg-[#f5f0e8] rounded-2xl p-4 md:p-6 lg:p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
                  Life Insurance in Your 30s
                </h3>
                <p className="text-lg text-gray-600 mb-10 text-pretty">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $14/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $17/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $1,000,000 <span className="text-white/80 font-normal">from $18/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 40s Column */}
              <div className="bg-[#f5f0e8] rounded-2xl p-4 md:p-6 lg:p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
                  Life Insurance in Your 40s
                </h3>
                <p className="text-lg text-gray-600 mb-10 text-pretty">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $18/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $23/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $1,000,000 <span className="text-white/80 font-normal">from $27/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 50s Column */}
              <div className="bg-[#f5f0e8] rounded-2xl p-4 md:p-6 lg:p-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
                  Life Insurance in Your 50s
                </h3>
                <p className="text-lg text-gray-600 mb-10 text-pretty">
                  Find coverage in as little as 15 min.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $500,000 <span className="text-white/80 font-normal">from $40/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
                    <p className="text-xl font-bold text-white">
                      $700,000 <span className="text-white/80 font-normal">from $54/mo</span>
                    </p>
                  </div>
                  <div className="py-5 px-6 bg-primary rounded-xl">
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
      <section className="bg-[#f5f0e8] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-primary rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="p-4 md:p-6 lg:px-16 lg:py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight text-balance">
                  Secure your retirement with annuities
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed text-pretty">
                  Turn your savings into guaranteed income for life. Our annuity solutions provide financial security and peace of mind in retirement.
                </p>
                <button
                  className="bg-violet-500 hover:bg-violet-500/80 text-white px-10 py-4 rounded-xl font-semibold text-lg"
                  onClick={() => {
                    trackCTAClicked("Learn More", "annuities_section");
                    setLocation("/annuities/retirement-income");
                  }}
                >
                  Learn more
                </button>
              </div>

              {/* Right Image */}
              <div className="relative h-48 sm:h-64 lg:h-full lg:min-h-[500px]">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769115619375-7.17.24-2024-pension-research-council-symposium-retirement-GettyImages-1453972025-900x612.avif?alt=media&token=cbedfb8a-13e2-4905-926d-10cb77857375"
                  alt="Retirement planning"
                  className="absolute inset-0 w-full h-full object-cover object-top rounded-2xl lg:rounded-none"
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
      <section className="bg-[#fffaf3] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12 items-center">
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

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                "We build relationships meant to endure for generations, not transactions designed for commissions."
              </h2>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed text-pretty">
                Heritage Life Solutions was founded on the belief that financial protection requires patient guidance,
                principled leadership, and an unwavering commitment to doing what is right for families and partners alike.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/team%2F1769720305403-hf_20260129_205442_6d34e584-b5ff-4ddd-80ca-a9fc2e5c8b0a.png?alt=media&token=00e3d8ae-3929-4a45-93e5-de6e6bd2a014"
                    alt="Jack Cook"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Jack Cook</p>
                  <p className="text-sm text-gray-500">Founder & Chief Executive Officer</p>
                </div>
              </div>
            </motion.div>

            {/* Right Video */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 lg:mt-0"
            >
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
                <video
                  ref={leadershipVideoRef}
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769724797939-Avatar%20IV%20Video.mp4?alt=media&token=a1d8e99e-3bbb-4f80-89c9-53e6716a00e6"
                  poster="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769725060571-hf_20260129_215733_d1cccf71-d808-4c08-bf54-ce19c119b54d.png?alt=media&token=ed03a02c-0013-4942-b5f9-1943642ac090"
                  controls={isLeadershipVideoPlaying}
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() => setIsLeadershipVideoPlaying(false)}
                />
                {!isLeadershipVideoPlaying && (
                  <button
                    onClick={handlePlayLeadershipVideo}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">Watch our story</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="bg-[#fffaf3] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center text-balance">FAQs</h2>
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

      {/* CALL NOW FLOATING BUTTON - Mobile Only */}
      <a
        href={phone.href}
        className="fixed bottom-4 left-4 z-50 md:hidden"
        onClick={() => trackPhoneClicked(phone.display, "floating_button")}
      >
        <motion.div
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Phone className="w-5 h-5" />
          <span className="font-semibold text-sm">Call Now</span>
        </motion.div>
      </a>

    </div>
  );
}
