import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { Link } from "wouter";

/**
 * Gold Coast Financial - Privacy Policy Page
 *
 * Design Philosophy:
 * - Standard privacy policy
 * - Clear, professional language
 * - Comprehensive coverage
 */

export default function InstitutionalPrivacy() {
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
              Privacy Policy
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

      {/* Privacy Content */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl space-y-8">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                Introduction
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Gold Coast Financial ("Company," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with our services.
                </p>
                <p>
                  Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                </p>
              </div>
            </motion.div>

            {/* Information We Collect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We may collect personal information that you voluntarily provide when you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Submit inquiries through our contact forms</li>
                  <li>Request information about our services</li>
                  <li>Correspond with us via email or other channels</li>
                  <li>Apply for employment opportunities</li>
                </ul>
                <p>
                  This information may include your name, email address, phone number, organization name, and the content of your communications with us.
                </p>
              </div>
            </motion.div>

            {/* Automatic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                2. Automatically Collected Information
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  When you visit our website, we may automatically collect certain information about your device and usage patterns, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address and geographic location</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                </ul>
                <p>
                  This information is collected through cookies and similar tracking technologies and is used to improve our website and understand how visitors interact with our content.
                </p>
              </div>
            </motion.div>

            {/* How We Use Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                3. How We Use Your Information
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We may use the information we collect for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To respond to your inquiries and provide requested information</li>
                  <li>To evaluate partnership and business opportunities</li>
                  <li>To process employment applications</li>
                  <li>To improve our website and user experience</li>
                  <li>To comply with legal obligations and regulatory requirements</li>
                  <li>To protect our rights and prevent fraudulent activity</li>
                </ul>
              </div>
            </motion.div>

            {/* Disclosure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                4. Disclosure of Information
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To our subsidiaries and affiliated companies for business purposes</li>
                  <li>To service providers who assist in operating our website and business</li>
                  <li>When required by law or to respond to legal process</li>
                  <li>To protect our rights, property, or safety, or that of others</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </motion.div>

            {/* Data Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                5. Data Security
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </motion.div>

            {/* Data Retention */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                6. Data Retention
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, regulatory, accounting, or reporting requirements. The retention period may vary depending on the context and our legal obligations.
                </p>
              </div>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                7. Your Rights
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Depending on your jurisdiction, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to opt out of certain data processing</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </motion.div>

            {/* Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                8. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Our website uses cookies and similar tracking technologies to enhance your browsing experience. You can control cookie settings through your browser preferences. However, disabling cookies may limit certain functionality of our website.
                </p>
              </div>
            </motion.div>

            {/* Third-Party Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                9. Third-Party Links
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </div>
            </motion.div>

            {/* Children's Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                10. Children's Privacy
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Our website is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
                </p>
              </div>
            </motion.div>

            {/* Changes to Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="p-6 rounded-sm"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                11. Changes to This Policy
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will post the updated policy on this page with a revised "Last updated" date. Your continued use of our website after any changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 rounded-sm bg-muted/30"
            >
              <h2 className="text-lg font-medium text-primary mb-4">
                12. Contact Information
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your rights regarding your personal information, please contact us at:
                </p>
                <div className="bg-muted/30 p-6 border border-border/60">
                  <p className="font-medium text-primary mb-2">Gold Coast Financial</p>
                  <p>1240 Iroquois Ave, Suite 506</p>
                  <p>Naperville, IL 60563</p>
                  <p className="mt-2">
                    <a href="mailto:privacy@goldcoastfnl.com" className="text-primary hover:text-primary/80 transition-colors">
                      privacy@goldcoastfnl.com
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
              href="/goldcoastfinancial2/terms"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Terms of Use
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
