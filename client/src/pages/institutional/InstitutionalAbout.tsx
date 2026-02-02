import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { Shield, Users, Scale, FileText, Building, Target, Award, TrendingUp, Calendar } from "lucide-react";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { VideoSection } from "@/components/institutional/VideoSection";
import { AnimatedStats } from "@/components/institutional/AnimatedStats";
import { MapChoicePopover } from "@/components/ui/map-choice-popover";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Gold Coast Financial - About / Governance Page
 *
 * Design Philosophy:
 * - Institutional, conservative, permanent
 * - Focus on governance principles, not personal bios
 * - Measured, precise language
 */

// Leadership experience stats
const leadershipStats = [
  { value: 40, suffix: "+", label: "Years Combined Experience" },
  { value: 100, suffix: "%", label: "Compliance Record" },
  { value: 50, label: "States Licensed" },
  { value: 30, suffix: "+", label: "Carrier Partners" },
];

export default function InstitutionalAbout() {
  const { trackCTAClicked, trackVideoPlayed } = useAnalytics();

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

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <TrustIndicators variant="light" />
        </div>
      </section>

      {/* Leadership Stats */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <AnimatedStats stats={leadershipStats} columns={4} />
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
                Gold Coast Financial is a financial services holding company headquartered in Naperville, Illinois, providing governance and oversight to regulated insurance businesses across the United States.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We take a long-term view of value creation. Our holding company structure allows operating subsidiaries to maintain independent management while benefiting from shared infrastructure and compliance oversight.
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
                description: "Compliance programs exceeding requirements across all companies"
              },
              {
                icon: Users,
                title: "Stakeholder Alignment",
                description: "Decisions evaluated for policyholders, employees, and partners"
              },
              {
                icon: Scale,
                title: "Risk Management",
                description: "Conservative reserves and prudent underwriting standards"
              },
              {
                icon: FileText,
                title: "Transparency",
                description: "Clear stakeholder communication and timely disclosures"
              },
              {
                icon: Building,
                title: "Subsidiary Independence",
                description: "Operating companies maintain autonomy and market focus"
              },
              {
                icon: Target,
                title: "Long-Term Orientation",
                description: "Investment decisions reflecting multi-decade time horizons"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { initials: "JC", name: "Jack Cook", title: "Founder & CEO", location: "Naperville, IL", desc: "Strategic vision, capital allocation, and carrier relationships" },
              { initials: "FC", name: "Frank Carbonara", title: "Executive Chairman", location: "Oak Brook, IL", desc: "Senior governance and strategic counsel" },
              { initials: "GC", name: "Gaetano Carbonara", title: "Chief Operating Officer", location: "Oak Brook, IL", desc: "Operational infrastructure and compliance" },
              { initials: "NG", name: "Nick Gallagher", title: "Head of Strategy", location: "Naperville, IL", desc: "Corporate development and partnerships" }
            ].map((leader, index) => (
              <motion.div
                key={leader.initials}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-border/40 rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(348,65%,18%)] to-[hsl(348,65%,25%)] flex items-center justify-center mb-4">
                  <span className="text-white font-serif text-lg font-medium">{leader.initials}</span>
                </div>
                <h3 className="text-base font-medium text-primary mb-1">{leader.name}</h3>
                <p className="text-xs text-secondary font-medium mb-1">{leader.title}</p>
                <p className="text-xs text-muted-foreground mb-3">{leader.location}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{leader.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />


      {/* Visual Timeline / History */}
      <section className="py-20 md:py-28 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl mx-auto">
              Building methodically since 2025, with each step reflecting our commitment to sustainable growth.
            </p>
          </motion.div>

          {/* Visual Timeline */}
          <div className="relative">
            {/* Central timeline line */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-primary/40 to-primary/10 rounded-full" />

            <div className="space-y-12">
              {[
                {
                  year: "Jan 2025",
                  title: "Foundation",
                  description: "Gold Coast Financial established in Naperville, Illinois with a focus on life insurance distribution and financial services.",
                  icon: Building,
                  color: "bg-blue-500"
                },
                {
                  year: "Mar 2025",
                  title: "Heritage Life Solutions",
                  description: "Launched Heritage Life Solutions as a consumer-facing brand, creating clear separation between holding company and operating entity.",
                  icon: Users,
                  color: "bg-purple-500"
                },
                {
                  year: "May 2025",
                  title: "National Expansion",
                  description: "Achieved licensing across all 50 states. Expanded agent network and formalized compliance infrastructure.",
                  icon: Target,
                  color: "bg-green-500"
                },
                {
                  year: "Sep 2025",
                  title: "Carrier Growth",
                  description: "Expanded carrier partnerships to 30+ highly-rated insurers. Implemented advanced quoting and policy management systems.",
                  icon: TrendingUp,
                  color: "bg-amber-500"
                },
                {
                  year: "Nov 2025",
                  title: "Institutional Development",
                  description: "Formalized holding company structure. Enhanced governance framework and began evaluating complementary business opportunities.",
                  icon: Shield,
                  color: "bg-teal-500"
                },
                {
                  year: "2026",
                  title: "Continued Growth",
                  description: "Focus on operational excellence, technology investment, and disciplined evaluation of expansion opportunities.",
                  icon: Award,
                  color: "bg-[hsl(348,65%,25%)]"
                }
              ].map((milestone, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-start gap-6 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`w-14 h-14 rounded-full ${milestone.color} flex items-center justify-center shadow-lg border-4 border-white`}>
                        <milestone.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content card */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-4rem)] ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-white p-6 rounded-lg border border-border/60 shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : ''}`}>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${milestone.color}`}>
                            <Calendar className="w-3 h-3" />
                            {milestone.year}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-primary mb-2">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </motion.div>
                    </div>

                    {/* Spacer for opposite side */}
                    <div className="hidden md:block md:w-[calc(50%-4rem)]" />
                  </motion.div>
                );
              })}
            </div>

            {/* Future indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative mt-12 text-center"
            >
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse" />
                </div>
              </div>
              <p className="ml-20 md:ml-0 text-sm text-muted-foreground italic">And the journey continues...</p>
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
              <div className="mt-6">
                <MapChoicePopover
                  address="1240 Iroquois Ave, Suite 506"
                  addressLine2="Naperville, IL 60563"
                  iconClassName="w-4 h-4 text-primary mt-0.5 shrink-0"
                  textClassName="text-sm text-muted-foreground hover:text-primary"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
