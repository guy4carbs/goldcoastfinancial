import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check, Shield, Home, Heart, Play } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAnalytics, useScrollTracking } from "@/hooks/useAnalytics";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function RiskStrategy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackVideoPlayed, trackFAQExpanded } = useAnalytics();
  useScrollTracking();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
    if (openFaq !== index) {
      trackFAQExpanded(`FAQ ${index + 1}`, "risk_strategy");
    }
  };

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
      trackVideoPlayed("risk_strategy_video", video.src);
    }
  };

  const scrollToApproach = () => {
    document.getElementById('approach-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO SECTION - Wide Centered */}
      <section className="bg-[#fffaf3] py-8 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-primary rounded-2xl md:rounded-3xl overflow-hidden"
          >
            <div className="text-center px-5 md:px-12 lg:px-24 py-12 md:py-24 lg:py-32">
              <p className="text-sm md:text-xl uppercase tracking-wider text-white/80 font-semibold mb-4 md:mb-10">
                Risk Strategy - Not Insurance Sales
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 md:mb-12 leading-tight max-w-5xl mx-auto">
                Protection isn't a policy. It's a plan.
              </h1>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-violet-500 hover:bg-violet-500/80 text-white px-6 md:px-12 py-4 md:py-6 rounded-xl font-semibold text-base md:text-xl min-h-[48px]"
                  >
                    Schedule consultation
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToApproach}
                  className="border-2 border-white hover:bg-white/10 text-white px-6 md:px-12 py-4 md:py-6 rounded-xl font-semibold text-base md:text-xl min-h-[48px]"
                >
                  Our approach
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section id="approach-section" className="py-16 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 md:mb-10 leading-tight">
                We don't sell life insurance. We architect protection.
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed">
                Insurance is the instrument. The product is peace of mind—knowing your family, your home, and your future are protected no matter what.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900 rounded-2xl h-[500px] overflow-hidden shadow-lg relative"
            >
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769054792010-Architecting%20Protection.mp4?alt=media&token=ae9ab262-87ba-470d-98ba-953c8e6b0787"
                controls={isPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT WE PROTECT */}
      <section className="bg-[#fffaf3] py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900">
              When life interrupts
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { title: "Protect Income", desc: "Replace lost earnings so your family maintains their lifestyle", icon: Shield },
              { title: "Protect Your Home", desc: "Ensure your mortgage gets paid no matter what happens", icon: Home },
              { title: "Protect Your Legacy", desc: "Leave your family with security, not debt", icon: Heart }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl md:rounded-2xl p-6 md:p-10 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">{item.title}</h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE SERVE - Rounded Hero Blocks */}
      <section className="bg-[#fffaf3] py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900">
              Built for decision-makers
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-xl md:rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <Home className="w-6 h-6 md:w-7 md:h-7 text-violet-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                Homeowners & Breadwinners
              </h3>
              <ul className="space-y-3 md:space-y-4 text-base md:text-lg text-gray-600">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Mortgage protection coverage</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Income replacement strategies</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Term & whole life solutions</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-100 rounded-xl md:rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                Families & Retirees
              </h3>
              <ul className="space-y-3 md:space-y-4 text-base md:text-lg text-gray-600">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Final expense planning</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Retirement income with IUL & annuities</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <span>Legacy & wealth transfer</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW WE'RE DIFFERENT - Image + Advisory Section */}
      <section className="bg-[#fffaf3] py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-2xl md:rounded-3xl overflow-hidden"
          >
            {/* Horizontal Image */}
            <div className="relative bg-primary h-[250px] md:h-[400px] lg:h-[550px] overflow-hidden">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1768770792872-strategy-man-heritage-insurance.png?alt=media&token=497977f7-59ff-453a-b7f4-6d36d21e7e57"
                alt="Heritage Life Solutions Strategy"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Content Below Image */}
            <div className="p-6 md:p-12 lg:p-16">
              <div className="text-center mb-10 md:mb-20">
                <h2 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-white">
                  Advisory, not transactional
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20">
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-8">Most Insurance Shops</h3>
                  <ul className="space-y-3 md:space-y-5 text-white/80 text-base md:text-xl lg:text-2xl">
                    <li>Focused on closing sales</li>
                    <li>Quote-based competition</li>
                    <li>Transaction ends at signature</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-8">Heritage Approach</h3>
                  <ul className="space-y-3 md:space-y-5 text-white/90 text-base md:text-xl lg:text-2xl">
                    <li className="flex items-start gap-2 md:gap-4">
                      <Check className="w-5 h-5 md:w-7 md:h-7 text-violet-500 flex-shrink-0 mt-0.5 md:mt-1" />
                      <span>Comprehensive protection plans</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-4">
                      <Check className="w-5 h-5 md:w-7 md:h-7 text-violet-500 flex-shrink-0 mt-0.5 md:mt-1" />
                      <span>Outcome-focused, not product-focused</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-4">
                      <Check className="w-5 h-5 md:w-7 md:h-7 text-violet-500 flex-shrink-0 mt-0.5 md:mt-1" />
                      <span>Ongoing strategic relationships</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 md:mb-16 text-center"
          >
            Common Questions
          </motion.h2>
          <div className="space-y-1 md:space-y-2">
            {[
              {
                question: "How is this different from buying life insurance online?",
                answer: "Online platforms sell commoditized products at the lowest price. We design protection plans tailored to your specific situation—your family, your mortgage, your retirement goals. The difference is a transactional purchase vs. strategic planning."
              },
              {
                question: "Do you only work with wealthy clients?",
                answer: "We work with anyone who values planning over price shopping. That includes young families protecting their home, parents securing their children's future, and retirees ensuring their legacy. Income matters less than mindset."
              },
              {
                question: "What does a strategic consultation include?",
                answer: "We analyze your current coverage gaps, income protection needs, mortgage obligations, and retirement planning goals. Then we design a protection plan using the right mix of term, whole life, IUL, or annuities—not just recommend the cheapest option."
              },
              {
                question: "What types of insurance do you offer?",
                answer: "We specialize in life insurance products: Term Life, Whole Life, Final Expense, Mortgage Protection, Indexed Universal Life (IUL), and Annuities. Each serves a different purpose in your overall protection strategy."
              },
              {
                question: "Do you work with my existing advisors?",
                answer: "Absolutely. We collaborate with CPAs, estate attorneys, and financial planners regularly. Your life insurance strategy should integrate with your broader financial plan, not exist in isolation."
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-4 md:py-6 flex items-center justify-between hover:opacity-70 transition-opacity min-h-[48px]"
                >
                  <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-gray-900 pr-4 md:pr-8">{faq.question}</span>
                  <span className="text-2xl md:text-3xl text-gray-400 flex-shrink-0">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="pb-4 md:pb-6">
                    <p className="text-base md:text-xl lg:text-2xl text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#fffaf3] py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 md:mb-8 leading-tight">
              Ready to move beyond price quotes?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
              Let's design a protection plan that ensures income, control, and continuity—no matter what life interrupts.
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-violet-500 hover:bg-violet-500/80 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl font-semibold text-base md:text-xl min-h-[48px]"
              >
                Schedule your strategic consultation
              </motion.button>
            </Link>
            <p className="text-xs md:text-sm text-gray-500 mt-4 md:mt-6">
              No sales pitch. No pressure. Just strategic clarity.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
