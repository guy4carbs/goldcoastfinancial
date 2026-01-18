import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "wouter";

/**
 * Gold Coast Financial - News & Announcements Page
 *
 * Design Philosophy:
 * - Corporate announcements, not marketing content
 * - Regulatory updates, milestones, leadership changes
 * - Minimal, factual tone
 */

const newsItems = [
  {
    date: "January 2026",
    category: "Corporate",
    title: "Gold Coast Financial Enters Second Year of Operations",
    summary: "As we enter 2026, Gold Coast Financial continues to focus on operational excellence and measured growth across our portfolio of regulated financial services businesses.",
    featured: true
  },
  {
    date: "November 2025",
    category: "Governance",
    title: "Formalization of Holding Company Structure",
    summary: "Gold Coast Financial has completed the formalization of its institutional holding company structure, enhancing governance frameworks and compliance oversight capabilities.",
    featured: false
  },
  {
    date: "September 2025",
    category: "Portfolio",
    title: "Heritage Life Solutions Expands Carrier Partnerships",
    summary: "Heritage Life Solutions, our life insurance operating company, has expanded its carrier network to over 30 highly-rated insurance providers.",
    featured: false
  },
  {
    date: "July 2025",
    category: "Milestone",
    title: "1,000 Families Protected",
    summary: "Through our operating companies, Gold Coast Financial portfolio companies have now provided coverage solutions to over 1,000 American families.",
    featured: false
  },
  {
    date: "May 2025",
    category: "Operations",
    title: "National Licensing Achievement",
    summary: "Heritage Life Solutions has achieved full licensing across all 50 states, enabling nationwide distribution of life insurance products.",
    featured: false
  },
  {
    date: "March 2025",
    category: "Portfolio",
    title: "Launch of Heritage Life Solutions",
    summary: "Gold Coast Financial announces the launch of Heritage Life Solutions, an independent life insurance brokerage focused on personalized coverage for individuals and families.",
    featured: false
  },
  {
    date: "January 2025",
    category: "Corporate",
    title: "Gold Coast Financial Established",
    summary: "Gold Coast Financial is established in Naperville, Illinois as a diversified financial services holding company.",
    featured: false
  }
];

export default function InstitutionalNews() {
  const featuredNews = newsItems.find(item => item.featured);
  const otherNews = newsItems.filter(item => !item.featured);

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
              News & Updates
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Corporate announcements and company milestones.
            </h1>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Featured News */}
      {featuredNews && (
        <>
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-16"
              >
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary">
                    Latest Update
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {featuredNews.date}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-secondary">
                      {featuredNews.category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary mb-6">
                    {featuredNews.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {featuredNews.summary}
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border/60" />
        </>
      )}

      {/* News Archive */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Archive
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Previous announcements and company updates.
            </p>
          </motion.div>

          <div className="space-y-0">
            {otherNews.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="news-item border-b border-border/60 py-8 first:pt-0 px-4 -mx-4 rounded-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <span className="text-xs uppercase tracking-wider text-secondary mb-2 block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-medium text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Media Contact */}
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
                Media Contact
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed mb-6">
                For press inquiries and media requests, please contact our communications team.
              </p>
              <a
                href="mailto:media@goldcoastfnl.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                media@goldcoastfnl.com
              </a>
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
              Contact
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
              Questions about our announcements?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              For questions regarding company announcements or additional information, please contact our corporate communications team.
            </p>
            <Link
              href="/goldcoastfinancial2/contact"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Contact us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
