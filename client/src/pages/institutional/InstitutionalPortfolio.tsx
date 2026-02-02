import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Leaf, Shield, Building2, Cpu, TrendingUp, CheckCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Gold Coast Financial - Portfolio Companies Page
 *
 * Design Philosophy:
 * - Introduce subsidiaries at a high level
 * - Link out to subsidiary sites for consumer information
 * - No product explanations or sales language
 */

// Animated number component with institutional pacing
function AnimatedNumber({ end, suffix = "", duration = 2500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      setCount(Math.floor(easeOutQuint * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function InstitutionalPortfolio() {
  const { trackCTAClicked, trackOutboundLink } = useAnalytics();

  return (
    <InstitutionalLayout>
      {/* Hero */}
      <section className="hero-gradient py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
              Portfolio
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Operating companies serving distinct markets with shared commitment to excellence.
            </h1>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <TrustIndicators variant="light" />
        </div>
      </section>

      {/* Portfolio Philosophy */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Our Approach
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <p className="text-lg text-primary leading-relaxed">
                We acquire and develop financial services businesses with the intent to hold them indefinitely—building permanent institutions, not seeking exits.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Each portfolio company operates independently under its own management team. We provide governance, compliance infrastructure, and capital without imposing operational constraints.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Active Portfolio Company - Heritage Life Solutions */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-secondary">
                Life Insurance
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-sm" style={{ backgroundColor: "#6B5B95" }}>
                  <Leaf className="w-6 h-6" style={{ color: "#C4B7D5" }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold leading-none tracking-tight" style={{ color: "#6B5B95" }}>HERITAGE LIFE</span>
                  <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "#6B5B95" }}>Solutions</span>
                </div>
              </div>

              {/* Website Preview - Clickable */}
              <a
                href="https://heritagels.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-6 rounded-lg overflow-hidden border border-border/40 shadow-lg hover:shadow-xl transition-all sm:hover:scale-[1.02] group"
              >
                <div className="bg-gray-100 relative">
                  {/* Browser chrome - responsive */}
                  <div className="h-6 sm:h-7 md:h-8 bg-gray-100 flex items-center px-2 sm:px-3 gap-1 sm:gap-1.5 border-b border-gray-200">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#27CA40]" />
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div className="bg-white rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-500 max-w-[140px] sm:max-w-[200px] md:max-w-[240px] mx-auto text-center border border-gray-200 truncate">
                        heritagels.org
                      </div>
                    </div>
                  </div>

                  {/* Actual screenshot */}
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1770065325098-Screenshot%202026-02-02%20at%202.47.06%E2%80%AFPM.png?alt=media&token=9329a821-b0c2-4f0d-a9a2-6adcdd8fb5ba"
                    alt="Heritage Life Solutions website"
                    className="w-full object-cover object-top"
                    loading="lazy"
                  />

                  {/* Hover overlay - hidden on mobile (tap works), visible on desktop */}
                  <div className="absolute inset-0 top-6 sm:top-7 md:top-8 bg-black/0 group-hover:bg-black/10 transition-colors hidden sm:flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
                      Visit Website →
                    </span>
                  </div>
                </div>
              </a>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Our consumer-facing life insurance brokerage, established in 2025. Provides coverage solutions to individuals and families nationwide through partnerships with 30+ highly-rated carriers.
              </p>
              <a
                href="https://heritagels.org"
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Visit Heritage Life Solutions
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              {/* Key Metrics Grid with animated counting */}
              <div className="grid grid-cols-2 gap-6 pb-8 border-b border-border/60">
                {[
                  { value: 2025, label: "Established", suffix: "", isYear: true },
                  { value: 50, label: "States Licensed", suffix: "" },
                  { value: 30, label: "Carrier Partners", suffix: "+" },
                  { value: 1000, label: "Families Served", suffix: "+" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <p className="text-2xl font-serif font-medium text-primary mb-1">
                      {metric.isYear ? (
                        metric.value
                      ) : (
                        <AnimatedNumber end={metric.value} suffix={metric.suffix} duration={2500} />
                      )}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Market Focus
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Individual life insurance, mortgage protection, whole life, indexed universal life, and final expense coverage. Serves consumers directly through licensed agents.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Geographic Reach
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Licensed to operate in all 50 states. Headquarters in Naperville, Illinois with nationwide distribution capabilities.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Regulatory Status
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fully compliant with state insurance regulations. Maintains appropriate licenses and appointments across all operating jurisdictions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Areas of Interest - Enhanced Design */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Areas of Interest
              </h2>
              <div className="h-px w-12 bg-secondary" />
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl mx-auto mb-4">
              Disciplined expansion in complementary sectors
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We evaluate opportunities that align with our expertise in regulated financial services and our commitment to long-term value creation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property & Casualty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-border/60 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  Insurance
                </span>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                  Evaluating
                </span>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">Property & Casualty</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Personal lines, commercial lines, and specialty coverages that complement our life insurance platform.
              </p>
              <div className="pt-4 border-t border-border/60">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Focus Areas</h4>
                <ul className="space-y-1.5">
                  {["Auto & Home Insurance", "Commercial Small Business", "Specialty Coverages"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Advisory Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-border/60 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                  Consulting
                </span>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                  Evaluating
                </span>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">Advisory Services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Strategic advisory for insurance agencies leveraging our compliance expertise and growth methodologies.
              </p>
              <div className="pt-4 border-t border-border/60">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Focus Areas</h4>
                <ul className="space-y-1.5">
                  {["Agency M&A Advisory", "Compliance Consulting", "Growth Strategy"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Technology & Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-border/60 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  Technology
                </span>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                  Evaluating
                </span>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">Technology & Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Quoting platforms, policy administration systems, and analytics tools that scale our operations.
              </p>
              <div className="pt-4 border-t border-border/60">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Focus Areas</h4>
                <ul className="space-y-1.5">
                  {["Quoting & Underwriting", "Policy Administration", "Data Analytics"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Acquisition Criteria */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
                Partnership Criteria
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed mb-8">
                We seek businesses that share our commitment to long-term value creation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-3">What We Look For</h4>
                  <ul className="space-y-2 text-sm text-primary-foreground/80">
                    <li>• Clean regulatory history</li>
                    <li>• Experienced management teams</li>
                    <li>• Sustainable competitive position</li>
                    <li>• Culture of compliance and integrity</li>
                    <li>• Alignment on long-term orientation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-3">What We Offer</h4>
                  <ul className="space-y-2 text-sm text-primary-foreground/80">
                    <li>• Permanent capital commitment</li>
                    <li>• Operational independence</li>
                    <li>• Compliance infrastructure</li>
                    <li>• Strategic support without interference</li>
                    <li>• Long-term partnership orientation</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Inquiries
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
              Partnership & Development Opportunities
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              For discussions regarding partnerships or strategic opportunities.
            </p>
            <a
              href="/contact"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Contact corporate development
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
