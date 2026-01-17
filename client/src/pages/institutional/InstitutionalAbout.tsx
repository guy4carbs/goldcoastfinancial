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
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              About
            </h2>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-primary mb-8">
              Building enduring financial institutions through disciplined governance and principled leadership.
            </h1>
            <div className="w-16 h-px bg-secondary" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

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
      <div className="border-t border-border/40" />

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

      {/* Leadership */}
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
                Leadership
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
                Gold Coast Financial's leadership team brings decades of combined experience in insurance distribution, financial services regulation, and institutional management.
              </p>

              <div className="space-y-12">
                {/* Executive Leadership */}
                <div className="border-l-2 border-secondary pl-6">
                  <h3 className="text-base font-medium text-primary mb-1">Executive Leadership</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gaetano Carbonara — Founder & Chief Executive Officer
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Responsible for overall corporate strategy, capital allocation, and stakeholder relations. Oversees governance framework and regulatory relationships across all operating companies.
                  </p>
                </div>

                {/* Operations */}
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-1">Operations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Frank Carbonara — Chief Operating Officer
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Oversees day-to-day operations, subsidiary coordination, and operational efficiency initiatives. Ensures consistent execution of corporate standards across portfolio companies.
                  </p>
                </div>

                {/* Compliance */}
                <div className="border-l-2 border-border pl-6">
                  <h3 className="text-base font-medium text-primary mb-1">Compliance & Legal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Centralized compliance function ensuring regulatory adherence across all jurisdictions. Works with external counsel and state insurance departments to maintain exemplary standing.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* History */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
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
