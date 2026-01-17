import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { motion } from "framer-motion";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  cream: "#fffaf3",
  white: "#ffffff",
};

export default function HeritagePrivacy() {
  return (
    <HeritageLayout>
      <section className="relative overflow-hidden py-16 md:py-20" style={{ backgroundColor: c.primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Legal</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">Privacy Policy</h1>
          <p className="text-white/70 text-lg">Last updated: January 1, 2025</p>
        </motion.div>
      </section>

      <section className="py-16" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto prose prose-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Introduction</h2>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  Heritage Life Solutions, a DBA of Gold Coast Financial ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (the "Site") or use our services.
                </p>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-3" style={{ color: c.primary }}>Personal Information</h3>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: c.textSecondary }}>
                  <li>Fill out a quote request form</li>
                  <li>Contact us through our website</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Create a client account</li>
                  <li>Communicate with us via email, phone, or other channels</li>
                </ul>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  This information may include:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: c.textSecondary }}>
                  <li>Name (first and last)</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Mailing address</li>
                  <li>Date of birth</li>
                  <li>Information about your insurance needs and preferences</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: c.primary }}>Automatically Collected Information</h3>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  When you visit our Site, we may automatically collect certain information about your device and usage, including:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: c.textSecondary }}>
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website addresses</li>
                  <li>Pages viewed and time spent on pages</li>
                  <li>Date and time of your visit</li>
                  <li>Other technical information about your device</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>How We Use Your Information</h2>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  We use the information we collect for various purposes, including to:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: c.textSecondary }}>
                  <li>Provide, operate, and maintain our services</li>
                  <li>Respond to your inquiries and quote requests</li>
                  <li>Communicate with you about insurance products and services</li>
                  <li>Process and manage your client account</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Comply with legal obligations and protect our rights</li>
                  <li>Detect and prevent fraud or other harmful activities</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Disclosure of Your Information</h2>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  We may share your information in the following situations:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: c.textSecondary }}>
                  <li><strong>Insurance Carriers:</strong> To obtain quotes and process insurance applications on your behalf</li>
                  <li><strong>Service Providers:</strong> With third parties that perform services for us (e.g., email delivery, hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> For any other purpose with your explicit consent</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Data Security</h2>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Your Privacy Rights</h2>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: c.textSecondary }}>
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate or incomplete information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to opt out of marketing communications</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="leading-relaxed mt-4" style={{ color: c.textSecondary }}>
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Cookies and Tracking Technologies</h2>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  We may use cookies and similar tracking technologies to enhance your experience on our Site. Cookies are small files stored on your device that help us remember your preferences and understand how you use our Site. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our Site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Third-Party Links</h2>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  Our Site may contain links to third-party websites or services that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Children's Privacy</h2>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  Our Site and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us so we can take steps to delete such information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Changes to This Privacy Policy</h2>
                <p className="leading-relaxed" style={{ color: c.textSecondary }}>
                  We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date at the top of this page. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>Contact Us</h2>
                <p className="leading-relaxed mb-4" style={{ color: c.textSecondary }}>
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="rounded-xl p-6" style={{ backgroundColor: c.cream }}>
                  <p className="font-semibold mb-2" style={{ color: c.primary }}>Heritage Life Solutions</p>
                  <p style={{ color: c.textSecondary }}>A DBA of Gold Coast Financial</p>
                  <p style={{ color: c.textSecondary }}>1240 Iroquois Ave Suite 506</p>
                  <p style={{ color: c.textSecondary }}>Naperville, Illinois 60563</p>
                  <p className="mt-2" style={{ color: c.textSecondary }}>Email: <a href="mailto:contact@heritagels.com" style={{ color: c.secondary }}>contact@heritagels.com</a></p>
                  <p style={{ color: c.textSecondary }}>Phone: (630) 555-0123</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </HeritageLayout>
  );
}
