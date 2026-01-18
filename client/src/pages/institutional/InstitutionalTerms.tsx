import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { Link } from "wouter";

/**
 * Gold Coast Financial - Terms of Use Page
 *
 * Design Philosophy:
 * - Standard legal terms
 * - Clear, professional language
 * - Comprehensive coverage
 */

export default function InstitutionalTerms() {
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
              Legal
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10">
              Terms of Use
            </h1>
            <div className="accent-line-animated mb-8" />
            <p className="text-sm text-white/60">
              Last updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Terms Content */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl space-y-8">
            {/* Acceptance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  By accessing and using the Gold Coast Financial website ("Site"), you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use this Site.
                </p>
                <p>
                  Gold Coast Financial ("Company," "we," "us," or "our") reserves the right to modify these terms at any time. Your continued use of the Site following any changes constitutes acceptance of those changes.
                </p>
              </div>
            </motion.div>

            {/* Use of Site */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                2. Use of Site
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  This Site is intended to provide general information about Gold Coast Financial and its subsidiaries. The information on this Site is for informational purposes only and does not constitute an offer to sell or solicitation of an offer to buy any securities, insurance products, or other financial services.
                </p>
                <p>
                  You agree to use this Site only for lawful purposes and in a manner that does not infringe upon or restrict the use of this Site by any third party.
                </p>
              </div>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                3. Intellectual Property
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  All content on this Site, including but not limited to text, graphics, logos, images, and software, is the property of Gold Coast Financial or its content suppliers and is protected by United States and international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, display, or create derivative works from any content on this Site without our prior written consent.
                </p>
              </div>
            </motion.div>

            {/* No Financial Advice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                4. No Financial or Legal Advice
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The information provided on this Site is for general informational purposes only and should not be construed as financial, legal, tax, or insurance advice. You should consult with qualified professionals before making any financial decisions.
                </p>
                <p>
                  Gold Coast Financial does not provide personalized financial advice through this Site. Insurance products and services are offered through our licensed operating companies.
                </p>
              </div>
            </motion.div>

            {/* Disclaimers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                5. Disclaimers
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  THIS SITE AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  We do not warrant that this Site will be uninterrupted, secure, or error-free, or that any defects will be corrected. We do not warrant the accuracy, completeness, or timeliness of information on this Site.
                </p>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                6. Limitation of Liability
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  IN NO EVENT SHALL GOLD COAST FINANCIAL, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THIS SITE.
                </p>
                <p>
                  Our total liability for any claims arising from your use of this Site shall not exceed the amount you paid, if any, to access this Site.
                </p>
              </div>
            </motion.div>

            {/* Third-Party Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                7. Third-Party Links
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  This Site may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of use of any third-party sites. Your use of third-party sites is at your own risk.
                </p>
              </div>
            </motion.div>

            {/* Governing Law */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                8. Governing Law
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  These Terms of Use shall be governed by and construed in accordance with the laws of the State of Illinois, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the state or federal courts located in DuPage County, Illinois.
                </p>
              </div>
            </motion.div>

            {/* Indemnification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                9. Indemnification
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You agree to indemnify and hold harmless Gold Coast Financial and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of this Site or violation of these Terms of Use.
                </p>
              </div>
            </motion.div>

            {/* Severability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                10. Severability
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If any provision of these Terms of Use is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                </p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                11. Contact Information
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If you have questions about these Terms of Use, please contact us at:
                </p>
                <div className="bg-muted/30 p-6 border border-border/60">
                  <p className="font-medium text-primary mb-2">Gold Coast Financial</p>
                  <p>1240 Iroquois Ave, Suite 506</p>
                  <p>Naperville, IL 60563</p>
                  <p className="mt-2">
                    <a href="mailto:legal@goldcoastfnl.com" className="text-primary hover:text-primary/80 transition-colors">
                      legal@goldcoastfnl.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Related Links */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-8">
            <Link
              href="/goldcoastfinancial2/privacy"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              href="/goldcoastfinancial2/contact"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}
