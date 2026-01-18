import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Leaf, Shield, Building2, Cpu } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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

      {/* Divider */}
      <div className="border-t border-border/60" />

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
                Gold Coast Financial acquires and develops financial services businesses with the intent to hold them indefinitely. We are not a private equity firm seeking exits; we are building permanent institutions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Each portfolio company operates independently under its own management team, serving its specific market with tailored strategies. The holding company provides governance oversight, compliance infrastructure, and access to capital—without imposing operational constraints that would diminish effectiveness.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We evaluate potential additions to our portfolio based on regulatory standing, management quality, market position, and cultural alignment. Growth is deliberate, not opportunistic.
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
                <div className="bg-[#4f5a3f] p-2 rounded-sm">
                  <Leaf className="w-5 h-5 text-[#d4a05b]" />
                </div>
                <h3 className="text-2xl font-serif text-primary">Heritage Life Solutions</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Heritage Life Solutions serves as the primary consumer-facing operating company within the Gold Coast Financial portfolio. Established in 2022, the company operates as an independent life insurance brokerage providing coverage solutions to individuals and families throughout the United States.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The organization maintains carrier relationships with over 30 highly-rated insurance providers, enabling access to a comprehensive range of products tailored to diverse client needs. Heritage operates under rigorous compliance standards established by the holding company, with full regulatory standing across all 50 states.
              </p>
              <a
                href="/heritage"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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

      {/* Future Portfolio Opportunities */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Areas of Interest
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Gold Coast Financial continues to evaluate opportunities for disciplined expansion in complementary sectors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Property & Casualty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="institutional-card border border-border/60 p-8 bg-white"
            >
              <Shield className="w-6 h-6 text-muted-foreground mb-6" strokeWidth={1.5} />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-primary">Property & Casualty</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Property and casualty insurance distribution represents a natural adjacency to existing life insurance operations. Gold Coast Financial evaluates opportunities in personal lines, commercial lines, and specialty coverages that demonstrate strong regulatory standing, experienced management, and alignment with our long-term investment horizon.
              </p>
            </motion.div>

            {/* Advisory Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="institutional-card border border-border/60 p-8 bg-white"
            >
              <Building2 className="w-6 h-6 text-muted-foreground mb-6" strokeWidth={1.5} />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-primary">Advisory Services</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strategic advisory services for insurance agencies, financial planning practices, and distribution organizations represent potential areas for capability development. Such services would leverage institutional expertise in compliance, operations, and growth strategy to assist businesses seeking operational improvement.
              </p>
            </motion.div>

            {/* Technology */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="institutional-card border border-border/60 p-8 bg-white"
            >
              <Cpu className="w-6 h-6 text-muted-foreground mb-6" strokeWidth={1.5} />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-primary">Technology & Data</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Insurance technology infrastructure—including quoting platforms, policy administration systems, and data analytics capabilities—remains an area of strategic interest. Investments in this sector would enhance underwriting efficiency, client experience, and operational scalability across portfolio companies.
              </p>
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
                We seek businesses and management teams that share our commitment to long-term value creation and principled operations.
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
              For confidential discussions regarding potential partnerships, acquisitions, or strategic opportunities, please contact our corporate development team.
            </p>
            <a
              href="/goldcoastfinancial2/contact"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
