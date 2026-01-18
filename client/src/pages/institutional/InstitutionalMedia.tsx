import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Download, Mail, User, Building2, FileText, Image, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";
import { Button } from "@/components/ui/button";

const pressReleases = [
  {
    date: "January 2026",
    title: "Gold Coast Financial Enters Second Year of Operations",
    summary: "Company announces continued growth and operational milestones as it begins its second year."
  },
  {
    date: "November 2025",
    title: "Gold Coast Financial Formalizes Holding Company Structure",
    summary: "Enhanced governance framework positions company for continued portfolio expansion."
  },
  {
    date: "September 2025",
    title: "Heritage Life Solutions Expands Carrier Network",
    summary: "Portfolio company adds partnerships with leading insurance carriers."
  },
  {
    date: "January 2025",
    title: "Gold Coast Financial Announces Formation",
    summary: "New financial services holding company established in Naperville, Illinois."
  }
];

const executives = [
  {
    name: "Jack Cook",
    title: "Chief Executive Officer",
    bio: "Jack Cook serves as CEO of Gold Coast Financial, overseeing strategic direction, capital allocation, and portfolio company governance.",
    available: true
  },
  {
    name: "Guy Carbonara",
    title: "Chief Operating Officer",
    bio: "Guy Carbonara leads operations, compliance, and technology initiatives across Gold Coast Financial and its portfolio companies.",
    available: true
  }
];

const brandAssets = [
  {
    name: "Primary Logo",
    description: "Gold Coast Financial logo in primary colors",
    format: "PNG, SVG",
    icon: Image
  },
  {
    name: "Logo - White",
    description: "Logo variant for dark backgrounds",
    format: "PNG, SVG",
    icon: Image
  },
  {
    name: "Brand Guidelines",
    description: "Complete brand identity guidelines",
    format: "PDF",
    icon: FileText
  },
  {
    name: "Fact Sheet",
    description: "Company overview and key facts",
    format: "PDF",
    icon: FileText
  }
];

export default function InstitutionalMedia() {
  return (
    <InstitutionalLayout>
      <InstitutionalSEO />

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
              Media Center
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6">
              Press Resources
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Press releases, executive information, and brand assets for media professionals.
            </p>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Media Contact */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-medium text-primary mb-1">Media Inquiries</h2>
              <p className="text-sm text-muted-foreground">
                For press inquiries, interview requests, or media information
              </p>
            </div>
            <a
              href="mailto:media@goldcoastfnl.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(348,65%,20%)] text-white rounded-sm font-medium hover:bg-[hsl(348,65%,25%)] transition-colors"
            >
              <Mail className="w-4 h-4" />
              media@goldcoastfnl.com
            </a>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Press Releases */}
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
              Press Releases
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Recent announcements and news.
            </p>
          </motion.div>

          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white border border-border/60 p-6 rounded-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{release.date}</span>
                    <h3 className="text-base font-medium text-primary mt-1 group-hover:text-[hsl(348,65%,25%)] transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">{release.summary}</p>
                  </div>
                  <Link
                    href="/goldcoastfinancial2/news"
                    className="text-sm text-[hsl(348,65%,25%)] font-medium hover:underline flex items-center gap-1 shrink-0"
                  >
                    Read More
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/goldcoastfinancial2/news"
              className="inline-flex items-center gap-2 text-sm text-[hsl(348,65%,25%)] font-medium hover:underline"
            >
              View All News & Updates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Executive Information */}
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
              Executive Information
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Leadership bios and availability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {executives.map((exec, index) => (
              <motion.div
                key={exec.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-border/60 p-6 rounded-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[hsl(348,65%,20%)]/5 rounded-sm flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-[hsl(348,65%,25%)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-primary">{exec.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{exec.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{exec.bio}</p>
                    {exec.available && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-sm">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Available for interviews
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Brand Assets */}
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
              Brand Assets
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Logos, guidelines, and company materials.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandAssets.map((asset, index) => (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-border/60 p-6 rounded-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-muted/50 rounded-sm flex items-center justify-center mb-4">
                  <asset.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-primary mb-1">{asset.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{asset.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{asset.format}</span>
                  <button className="p-1 text-[hsl(348,65%,25%)] hover:bg-[hsl(348,65%,20%)]/5 rounded-sm transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-muted/30 rounded-sm">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">Usage Guidelines:</strong> These assets are provided for editorial and news coverage purposes.
              Please maintain proportions and do not alter colors or add effects. For questions about usage, contact{" "}
              <a href="mailto:media@goldcoastfnl.com" className="text-[hsl(348,65%,25%)] hover:underline">
                media@goldcoastfnl.com
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Company Facts */}
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
                Quick Facts
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Company Name</p>
                  <p className="text-white">Gold Coast Financial Group</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Founded</p>
                  <p className="text-white">January 2025</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Headquarters</p>
                  <p className="text-white">Naperville, Illinois</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Industry</p>
                  <p className="text-white">Financial Services Holding Company</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Leadership</p>
                  <p className="text-white">Jack Cook, CEO</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Portfolio</p>
                  <p className="text-white">Heritage Life Solutions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
