import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { Link } from "wouter";
import { ArrowRight, Shield, Scale, TrendingUp, Building2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Gold Coast Financial - Institutional Homepage
 *
 * Design Philosophy:
 * - Goldman Sachs / Berkshire Hathaway style
 * - Calm, minimal, authoritative
 * - Non-promotional, intentionally understated
 * - Focus on credibility, not conversion
 */

export default function InstitutionalHome() {
  return (
    <InstitutionalLayout>
      {/* Hero Section - Simple statement of authority */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-primary mb-8">
              A diversified financial services holding company providing governance and strategic oversight to regulated businesses across the United States.
            </h1>
            <div className="w-16 h-px bg-secondary mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl">
              Gold Coast Financial maintains long-term capital commitments to insurance and advisory operations, emphasizing compliance, risk management, and sustainable growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Who We Are - Brief, authoritative */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Who We Are
              </h2>
              <p className="text-2xl md:text-3xl font-serif text-primary leading-relaxed">
                Gold Coast Financial serves as the parent holding company for a portfolio of regulated financial services businesses.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground leading-relaxed">
                Headquartered in Naperville, Illinois, we provide centralized governance, capital allocation, and strategic direction to our operating companies. Each subsidiary maintains independent management while benefiting from shared infrastructure and institutional oversight.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our approach prioritizes regulatory compliance, conservative risk management, and the long-term interests of policyholders and stakeholders. We do not pursue short-term growth at the expense of stability.
              </p>
              <Link
                href="/goldcoastfinancial2/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Learn more about our company
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Our Philosophy */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Philosophy
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              We believe financial services require patience, discipline, and an unwavering commitment to doing what is right.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                icon: Shield,
                title: "Compliance First",
                description: "Regulatory adherence is not a constraint but a foundation. We exceed requirements rather than merely meeting them."
              },
              {
                icon: Scale,
                title: "Risk Management",
                description: "Conservative underwriting and capital reserves protect policyholders and ensure long-term viability."
              },
              {
                icon: TrendingUp,
                title: "Sustainable Growth",
                description: "We prioritize measured expansion over aggressive scaling, building enterprises meant to endure."
              },
              {
                icon: Building2,
                title: "Long-Term Orientation",
                description: "Decisions are made with a multi-decade horizon, not quarterly pressures."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Portfolio Companies */}
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
              Portfolio Companies
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Our operating companies serve distinct markets while sharing a commitment to excellence and integrity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Heritage Life Solutions - Active */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border border-border/60 p-8 md:p-10 bg-white"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wider text-secondary">
                  Life Insurance
                </span>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <h3 className="text-xl font-serif text-primary mb-4">
                Heritage Life Solutions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                An independent life insurance brokerage providing personalized coverage solutions to individuals and families nationwide. Operates under Gold Coast Financial governance with full regulatory compliance across all 50 states.
              </p>
              <a
                href="/heritage"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Visit Heritage Life Solutions
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Future - Property & Casualty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="border border-border/40 p-8 md:p-10 bg-muted/20"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Property & Casualty
                </span>
                <span className="text-xs text-muted-foreground">Planned</span>
              </div>
              <h3 className="text-xl font-serif text-muted-foreground mb-4">
                Future Expansion
              </h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed">
                Gold Coast Financial continues to evaluate opportunities in property and casualty insurance, maintaining disciplined criteria for market entry and partnership selection.
              </p>
            </motion.div>

            {/* Future - Advisory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-border/40 p-8 md:p-10 bg-muted/20"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Consulting & Advisory
                </span>
                <span className="text-xs text-muted-foreground">Planned</span>
              </div>
              <h3 className="text-xl font-serif text-muted-foreground mb-4">
                Future Expansion
              </h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed">
                Strategic advisory services for insurance distribution, agency operations, and financial planning represent potential areas of future development.
              </p>
            </motion.div>

            {/* Future - Technology */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border border-border/40 p-8 md:p-10 bg-muted/20"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Technology & Data
                </span>
                <span className="text-xs text-muted-foreground">Planned</span>
              </div>
              <h3 className="text-xl font-serif text-muted-foreground mb-4">
                Future Expansion
              </h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed">
                Investment in insurance technology and data analytics capabilities to enhance underwriting efficiency and customer experience across portfolio companies.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Link
              href="/goldcoastfinancial2/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              View all portfolio information
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Leadership Preview */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
                Leadership
              </h2>
              <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                Experienced leadership with a commitment to integrity, regulatory excellence, and long-term value creation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <p className="text-primary-foreground/80 leading-relaxed">
                Gold Coast Financial's governance structure ensures accountability, transparency, and alignment with the interests of all stakeholders. Our leadership team brings decades of combined experience in insurance, finance, and regulatory affairs.
              </p>
              <Link
                href="/goldcoastfinancial2/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
              >
                Meet our leadership
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section - Professional inquiry only */}
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
              Contact
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
              Corporate & Partnership Inquiries
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              For corporate development, partnership opportunities, or institutional inquiries, please contact our corporate office. Consumer insurance inquiries should be directed to our operating companies.
            </p>
            <Link
              href="/goldcoastfinancial2/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Contact information
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
