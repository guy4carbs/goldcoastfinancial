import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { Shield, Users, Scale, FileText, Building, Target } from "lucide-react";

/**
 * Gold Coast Financial - About / Governance Page
 *
 * Design Philosophy:
 * - Institutional, conservative, permanent
 * - Focus on governance principles, not personal bios
 * - Measured, precise language
 */

export default function InstitutionalAbout() {
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
              About
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Building enduring financial institutions through disciplined governance and principled leadership.
            </h1>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Company Overview */}
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
                Our Company
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
                Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois. We provide governance, capital stewardship, and strategic oversight to a portfolio of regulated insurance and advisory businesses operating across the United States.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Founded with the conviction that financial services require patient capital and principled management, Gold Coast Financial takes a long-term view of value creation. We do not pursue rapid growth or short-term returns at the expense of stability, compliance, or the interests of policyholders.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our holding company structure allows operating subsidiaries to maintain independent management and market focus while benefiting from shared resources, institutional infrastructure, and centralized compliance oversight. This approach balances entrepreneurial agility with institutional discipline.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Governance Principles */}
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
              Governance Principles
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Our governance framework reflects our commitment to accountability, transparency, and stakeholder alignment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: "Regulatory Excellence",
                description: "We maintain rigorous compliance programs across all operating companies, exceeding minimum requirements and cooperating proactively with regulators. Compliance is a competitive advantage, not a burden."
              },
              {
                icon: Users,
                title: "Stakeholder Alignment",
                description: "Decisions are evaluated against the interests of policyholders, employees, partners, and communities—not solely shareholders. Sustainable success requires broad alignment."
              },
              {
                icon: Scale,
                title: "Risk Management",
                description: "Conservative capital reserves, prudent underwriting standards, and comprehensive reinsurance arrangements protect against adverse scenarios. We prepare for uncertainty rather than assuming stability."
              },
              {
                icon: FileText,
                title: "Transparency",
                description: "Clear communication with stakeholders, honest assessment of challenges, and timely disclosure of material information. Trust is built through consistency, not marketing."
              },
              {
                icon: Building,
                title: "Subsidiary Independence",
                description: "Operating companies maintain management autonomy and market-specific strategies. Centralized oversight provides support without constraining operational flexibility."
              },
              {
                icon: Target,
                title: "Long-Term Orientation",
                description: "Investment decisions, compensation structures, and strategic planning reflect multi-decade horizons. We avoid actions that sacrifice future strength for present appearance."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="space-y-4 p-5 rounded-sm transition-colors hover:bg-white/50 cursor-default"
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
      <div className="border-t border-border/60" />

      {/* Leadership */}
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
              Leadership
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Experienced leadership with a commitment to integrity, regulatory excellence, and long-term value creation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Jack Cook - Founder & CEO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="team-card p-8 rounded-lg"
            >
              <div className="flex items-start gap-5 mb-4">
                <div className="initials-avatar w-14 h-14 rounded-full text-lg shrink-0">
                  JC
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary">Jack Cook</h3>
                  <p className="text-sm text-secondary">Founder & Chief Executive Officer</p>
                  <p className="text-xs text-muted-foreground mt-1">Naperville, Illinois</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Mr. Cook founded Gold Coast Financial with the conviction that financial services require patient capital and principled leadership. As Chief Executive Officer, he establishes the firm's strategic vision, oversees capital allocation, and maintains relationships with carrier partners and institutional stakeholders.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                His leadership approach emphasizes long-term value creation over short-term metrics, disciplined underwriting standards, and organizational structures designed for permanence. Mr. Cook's background in competitive athletics instilled a commitment to preparation, accountability, and performance under pressure that informs the firm's operating culture.
              </p>
            </motion.div>

            {/* Frank Carbonara - Executive Chairman */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="team-card p-8 rounded-lg"
            >
              <div className="flex items-start gap-5 mb-4">
                <div className="initials-avatar w-14 h-14 rounded-full text-lg shrink-0">
                  FC
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary">Frank Carbonara</h3>
                  <p className="text-sm text-secondary">Executive Chairman & Risk Strategist</p>
                  <p className="text-xs text-muted-foreground mt-1">Elmwood Park, Illinois</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Mr. Carbonara provides senior governance oversight and strategic counsel to the executive team. His career spans multiple decades across financial services, real estate, and enterprise operations, with particular expertise in risk assessment and capital markets.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Prior experience includes commodities trading through the Dubai Mercantile Exchange, securities licensing (Series 3, Series 6), real estate brokerage, and public adjusting. This diverse background enables a multi-dimensional perspective on risk management, regulatory compliance, and strategic opportunity evaluation across Gold Coast Financial's portfolio companies.
              </p>
            </motion.div>

            {/* Gaetano Carbonara - COO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="team-card p-8 rounded-lg"
            >
              <div className="flex items-start gap-5 mb-4">
                <div className="initials-avatar w-14 h-14 rounded-full text-lg shrink-0">
                  GC
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary">Gaetano Carbonara</h3>
                  <p className="text-sm text-secondary">Chief Operating Officer | Head of Systems & Culture</p>
                  <p className="text-xs text-muted-foreground mt-1">Oak Brook, Illinois</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Mr. Carbonara oversees the operational infrastructure that translates executive strategy into consistent, scalable execution. His portfolio encompasses organizational design, compliance frameworks, performance management systems, and leadership development across all operating companies.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                His leadership philosophy emphasizes systematic processes, clear accountability structures, and a culture of operational excellence. Mr. Carbonara ensures that growth never compromises quality, compliance, or the institutional standards that define Gold Coast Financial's approach to financial services.
              </p>
            </motion.div>

            {/* Nick Gallagher - Head of Strategy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="team-card p-8 rounded-lg"
            >
              <div className="flex items-start gap-5 mb-4">
                <div className="initials-avatar w-14 h-14 rounded-full text-lg shrink-0">
                  NG
                </div>
                <div>
                  <h3 className="text-lg font-medium text-primary">Nick Gallagher</h3>
                  <p className="text-sm text-secondary">Head of Strategy & Negotiation</p>
                  <p className="text-xs text-muted-foreground mt-1">Naperville, Illinois</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Mr. Gallagher leads corporate development initiatives, including partnership evaluation, strategic planning, and negotiation of commercial agreements. He coordinates with external stakeholders and supports the executive team in identifying and structuring growth opportunities aligned with the firm's long-term objectives.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                His approach to strategy emphasizes thorough preparation, disciplined evaluation criteria, and communication clarity. Mr. Gallagher contributes to Gold Coast Financial's measured expansion by ensuring that potential opportunities meet the firm's standards for regulatory standing, management quality, and strategic fit.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Board & Advisory */}
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
                Advisory & Oversight
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg text-primary leading-relaxed mb-8">
                Gold Coast Financial maintains relationships with external advisors and counsel to ensure independent perspective on governance and strategic matters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-2">Legal & Compliance Counsel</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    External legal counsel provides guidance on regulatory matters, contract review, and compliance across all operating jurisdictions. Maintains relationships with state insurance departments.
                  </p>
                </div>
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-2">Financial Advisory</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Independent financial advisors assist with capital planning, risk assessment, and strategic evaluation of growth opportunities.
                  </p>
                </div>
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-2">Insurance Industry Advisors</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Seasoned insurance industry professionals provide perspective on market trends, carrier relationships, and distribution strategies.
                  </p>
                </div>
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-2">Technology Partners</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Strategic technology partners support digital infrastructure, data security, and operational efficiency initiatives.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Timeline / History */}
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
              Our Journey
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Building methodically since 2025, with each step reflecting our commitment to sustainable growth.
            </p>
          </motion.div>

          <div className="space-y-0">
            {[
              {
                year: "Jan 2025",
                title: "Foundation",
                description: "Gold Coast Financial established in Naperville, Illinois with a focus on life insurance distribution and financial services."
              },
              {
                year: "Mar 2025",
                title: "Heritage Life Solutions",
                description: "Launched Heritage Life Solutions as a consumer-facing brand, creating clear separation between holding company and operating entity."
              },
              {
                year: "May 2025",
                title: "National Expansion",
                description: "Achieved licensing across all 50 states. Expanded agent network and formalized compliance infrastructure."
              },
              {
                year: "Sep 2025",
                title: "Carrier Growth",
                description: "Expanded carrier partnerships to 30+ highly-rated insurers. Implemented advanced quoting and policy management systems."
              },
              {
                year: "Nov 2025",
                title: "Institutional Development",
                description: "Formalized holding company structure. Enhanced governance framework and began evaluating complementary business opportunities."
              },
              {
                year: "2026",
                title: "Continued Growth",
                description: "Focus on operational excellence, technology investment, and disciplined evaluation of expansion opportunities."
              }
            ].map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="timeline-item flex gap-8 pb-8"
              >
                <div className="w-16 shrink-0">
                  <span className="text-lg font-serif font-medium text-secondary">{milestone.year}</span>
                </div>
                <div className="pl-8">
                  <h3 className="text-base font-medium text-primary mb-2">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* History - Vision Statement */}
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
                Our History
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <p className="text-lg leading-relaxed">
                Gold Coast Financial was established with a clear vision: to build a financial services organization that prioritizes long-term value over short-term metrics.
              </p>
              <p className="text-primary-foreground/80 leading-relaxed">
                Beginning with life insurance distribution, we have methodically expanded our capabilities while maintaining the disciplined approach that defines our culture. Each step has been deliberate, ensuring we never outpace our ability to maintain quality and compliance.
              </p>
              <p className="text-primary-foreground/80 leading-relaxed">
                Today, Gold Coast Financial continues to evaluate opportunities for measured expansion, always applying the same rigorous criteria that have guided our development from the beginning.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location */}
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
                Headquarters
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg text-primary leading-relaxed mb-4">
                Naperville, Illinois
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Located in the Chicago metropolitan area, our headquarters provides access to major financial and insurance markets while maintaining the measured pace appropriate to our long-term orientation.
              </p>
              <p className="text-sm text-muted-foreground mt-6">
                1240 Iroquois Ave, Suite 506<br />
                Naperville, IL 60563
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
