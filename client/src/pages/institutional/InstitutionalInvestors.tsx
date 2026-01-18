import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Target, Users, Building2, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO, InstitutionalSchema } from "@/components/seo/InstitutionalSEO";
import { InstitutionalPartnershipQuiz } from "@/components/ui/institutional-partnership-quiz";

const capitalPhilosophy = [
  {
    icon: Shield,
    title: "Permanent Capital",
    description: "We invest with a long-term perspective, providing stable capital to portfolio companies without arbitrary exit timelines."
  },
  {
    icon: Target,
    title: "Disciplined Allocation",
    description: "Every capital deployment undergoes rigorous evaluation for sustainable returns and strategic fit within our portfolio."
  },
  {
    icon: TrendingUp,
    title: "Operational Excellence",
    description: "We actively support portfolio companies with governance, compliance, and operational resources to drive value creation."
  },
  {
    icon: Users,
    title: "Aligned Interests",
    description: "Our structure ensures alignment between management, capital partners, and the long-term interests of policyholders."
  }
];

const keyMetrics = [
  { label: "Assets Under Management", value: "Growing", icon: DollarSign },
  { label: "Portfolio Companies", value: "1", icon: Building2 },
  { label: "States Licensed", value: "50", icon: BarChart3 },
  { label: "Families Served", value: "1,000+", icon: Users },
];

const partnershipCriteria = [
  "Regulated financial services businesses (insurance, advisory)",
  "Strong compliance culture and clean regulatory history",
  "Established market position with growth potential",
  "Management teams committed to long-term value creation",
  "Annual revenue typically $1M-$50M",
  "Geographic focus on United States markets"
];

export default function InstitutionalInvestors() {
  return (
    <InstitutionalLayout>
      <InstitutionalSEO />
      <InstitutionalSchema />

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
              Investor Relations
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6">
              Capital Partnership Opportunities
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Gold Coast Financial seeks strategic capital partners who share our commitment to long-term value creation in regulated financial services.
            </p>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Capital Philosophy */}
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
              Capital Philosophy
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Patient capital, disciplined allocation, and operational excellence drive our approach to value creation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capitalPhilosophy.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-b from-white to-gray-50/50 border border-border/60 p-6 rounded-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[hsl(348,65%,20%)]/5 rounded-sm flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[hsl(348,65%,25%)]" />
                </div>
                <h3 className="text-base font-medium text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Key Metrics */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Company Metrics
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Our operational footprint and reach.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-border/60 p-6 rounded-sm text-center"
              >
                <metric.icon className="w-6 h-6 text-[hsl(42,60%,55%)] mx-auto mb-3" />
                <p className="text-2xl font-serif font-medium text-primary mb-1">{metric.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Partnership Criteria */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Partnership Criteria
              </h2>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
                What we look for in portfolio companies and capital partners.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We evaluate potential partnerships based on strategic fit, management quality, regulatory standing, and alignment with our long-term investment philosophy. Our focus is on building lasting relationships that create value for all stakeholders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-gradient-to-b from-white to-gray-50/50 border border-border/60 p-8 rounded-sm">
                <h3 className="text-base font-medium text-primary mb-6">Investment Focus Areas</h3>
                <ul className="space-y-4">
                  {partnershipCriteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[hsl(348,65%,20%)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[hsl(348,65%,25%)]" />
                      </div>
                      <span className="text-sm text-muted-foreground">{criterion}</span>
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

      {/* Partnership Assessment */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Partnership Assessment
              </h2>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
                Explore fit with Gold Coast Financial.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Complete our brief assessment to help us understand your organization and partnership objectives. Our corporate development team will follow up on qualified inquiries.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <InstitutionalPartnershipQuiz />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Contact CTA */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
                Explore Partnership
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
                For confidential discussions regarding capital partnerships, portfolio company opportunities, or institutional inquiries, please contact our corporate development team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/goldcoastfinancial2/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  Contact Corporate Development
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:corporate@goldcoastfnl.com"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm font-medium hover:bg-white/10 transition-colors"
                >
                  corporate@goldcoastfnl.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
            This page is for informational purposes only and does not constitute an offer to sell or solicitation of an offer to buy any securities. Gold Coast Financial is a private company and does not offer securities to the general public. Any potential investment opportunities are available only to qualified institutional investors and accredited individuals in compliance with applicable securities laws.
          </p>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
