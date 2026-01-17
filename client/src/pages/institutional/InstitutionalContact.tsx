import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { MapPin, Mail, ArrowRight, Building, Briefcase, Users } from "lucide-react";

/**
 * Gold Coast Financial - Corporate Contact Page
 *
 * Design Philosophy:
 * - Professional inquiry only
 * - Not "Book a Call" style
 * - "Corporate & Partnership Inquiries"
 * - Direct consumers to operating companies
 */

export default function InstitutionalContact() {
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
              Contact
            </h2>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-primary mb-8">
              Corporate & Partnership Inquiries
            </h1>
            <div className="w-16 h-px bg-secondary" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Contact Types */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Corporate Development */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Briefcase className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-primary">Corporate Development</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For partnership opportunities, acquisition inquiries, and strategic discussions.
              </p>
              <a
                href="mailto:corporate@goldcoastfnl.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                corporate@goldcoastfnl.com
              </a>
            </motion.div>

            {/* Investor Relations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <Building className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-primary">Institutional Inquiries</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For regulatory matters, carrier relationships, and institutional communications.
              </p>
              <a
                href="mailto:info@goldcoastfnl.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                info@goldcoastfnl.com
              </a>
            </motion.div>

            {/* Careers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <Users className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-primary">Career Opportunities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For executive and corporate-level positions within the holding company.
              </p>
              <a
                href="mailto:careers@goldcoastfnl.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                careers@goldcoastfnl.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Consumer Redirect */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Insurance Inquiries
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg text-primary leading-relaxed mb-6">
                Looking for life insurance coverage?
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Consumer insurance inquiries, policy questions, and coverage requests should be directed to our operating companies. Gold Coast Financial does not sell insurance products directly; our portfolio companies serve consumer markets through their dedicated teams.
              </p>

              <div className="border border-border/60 p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#4f5a3f] p-1.5 rounded-sm">
                    <svg className="w-4 h-4 text-[#d4a05b]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.05 4.14a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.41L7.88.29a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41L7.76 4.14a1 1 0 0 1-.71.29z"/>
                      <path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8z"/>
                      <path d="M12 17a5 5 0 1 1 5-5 5 5 0 0 1-5 5zm0-8a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-primary">Heritage Life Solutions</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Life insurance, mortgage protection, whole life, IUL, and final expense coverage.
                </p>
                <a
                  href="/heritage/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Contact Heritage Life Solutions
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Headquarters */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Corporate Headquarters
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-1" strokeWidth={1.5} />
                  <div>
                    <p className="text-primary font-medium mb-1">Gold Coast Financial Holdings</p>
                    <p className="text-muted-foreground text-sm">
                      1240 Iroquois Ave, Suite 506<br />
                      Naperville, IL 60563<br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-muted-foreground mt-1" strokeWidth={1.5} />
                  <div>
                    <p className="text-primary font-medium mb-1">General Inquiries</p>
                    <a
                      href="mailto:info@goldcoastfnl.com"
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      info@goldcoastfnl.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Correspondence Guidelines
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Please include relevant context regarding the nature of your inquiry to ensure routing to the appropriate department.
                </p>
                <p>
                  For time-sensitive regulatory or legal matters, please indicate urgency in your subject line.
                </p>
                <p>
                  Unsolicited commercial communications and marketing materials will not receive responses.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Media */}
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
                Media Inquiries
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
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Gold Coast Financial responds to legitimate media inquiries from credentialed journalists and publications. Please include your publication name, deadline, and specific questions.
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
    </InstitutionalLayout>
  );
}
