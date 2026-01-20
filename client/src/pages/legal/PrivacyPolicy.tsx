import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Lock,
  ChevronRight,
  Eye,
  Database,
  Share2,
  Shield,
  Cookie,
  Baby,
  Globe,
  RefreshCw,
  MessageSquare,
  FileText,
  Users,
  Settings
} from "lucide-react";

const sections = [
  { id: "overview", title: "Overview", icon: Eye },
  { id: "collection", title: "Information We Collect", icon: Database },
  { id: "use", title: "How We Use Information", icon: Settings },
  { id: "sharing", title: "Information Sharing", icon: Share2 },
  { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
  { id: "security", title: "Data Security", icon: Shield },
  { id: "rights", title: "Your Privacy Rights", icon: Users },
  { id: "children", title: "Children's Privacy", icon: Baby },
  { id: "international", title: "International Users", icon: Globe },
  { id: "changes", title: "Policy Changes", icon: RefreshCw },
  { id: "contact", title: "Contact Us", icon: MessageSquare }
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8]">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-heritage-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-heritage-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-heritage-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/80 text-lg">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-white/60 text-sm mt-4">
              Last Updated: January 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Table of Contents */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-72 flex-shrink-0"
            >
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-heritage-primary mb-4">Table of Contents</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        activeSection === section.id
                          ? "bg-heritage-primary/10 text-heritage-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100"
            >
              <div className="prose prose-gray max-w-none">
                <section id="overview" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-heritage-accent" />
                    1. Overview
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Heritage Life Solutions, LLC ("Heritage," "we," "us," or "our") is committed to protecting
                    your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you visit our website or use our services.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-gray-700 font-medium mb-2">Key Points:</p>
                    <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                      <li>We collect information you provide and information collected automatically</li>
                      <li>We use your information to provide and improve our services</li>
                      <li>We do not sell your personal information to third parties</li>
                      <li>You have rights regarding your personal information</li>
                    </ul>
                  </div>
                </section>

                <section id="collection" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Database className="w-6 h-6 text-heritage-accent" />
                    2. Information We Collect
                  </h2>

                  <h3 className="text-lg font-semibold text-heritage-primary mt-6 mb-3">Information You Provide</h3>
                  <p className="text-gray-600 mb-4">
                    We collect information you voluntarily provide, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                    <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                    <li><strong>Quote Information:</strong> Age, gender, health information, coverage preferences</li>
                    <li><strong>Application Data:</strong> Social Security number, beneficiary information, medical history</li>
                    <li><strong>Account Information:</strong> Username, password, account preferences</li>
                    <li><strong>Communication Data:</strong> Messages, inquiries, feedback you send us</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-heritage-primary mt-6 mb-3">Information Collected Automatically</h3>
                  <p className="text-gray-600 mb-4">
                    When you access our services, we automatically collect:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, navigation paths</li>
                    <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                    <li><strong>Cookies and Tracking:</strong> See our Cookies section below</li>
                  </ul>
                </section>

                <section id="use" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-heritage-accent" />
                    3. How We Use Your Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process insurance quotes and applications</li>
                    <li>Communicate with you about our services</li>
                    <li>Send you marketing communications (with your consent)</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Analyze usage patterns to improve user experience</li>
                    <li>Detect, prevent, and address fraud and security issues</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section id="sharing" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Share2 className="w-6 h-6 text-heritage-accent" />
                    4. Information Sharing
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                    <li><strong>Insurance Carriers:</strong> To process quotes and applications on your behalf</li>
                    <li><strong>Service Providers:</strong> Third parties who perform services for us (hosting, analytics, etc.)</li>
                    <li><strong>Business Partners:</strong> With your consent, for joint marketing efforts</li>
                    <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  </ul>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <p className="text-gray-700 font-medium mb-2">We Do NOT:</p>
                    <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                      <li>Sell your personal information to third parties</li>
                      <li>Share your health information for marketing purposes</li>
                      <li>Use your Social Security number for marketing</li>
                    </ul>
                  </div>
                </section>

                <section id="cookies" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Cookie className="w-6 h-6 text-heritage-accent" />
                    5. Cookies & Tracking Technologies
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use cookies and similar tracking technologies to collect and track information about your
                    browsing activities. Types of cookies we use:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-heritage-primary mb-2">Essential Cookies</h4>
                      <p className="text-sm text-gray-600">Required for basic site functionality and security.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-heritage-primary mb-2">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">Help us understand how visitors interact with our site.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-heritage-primary mb-2">Functional Cookies</h4>
                      <p className="text-sm text-gray-600">Remember your preferences and personalize your experience.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-heritage-primary mb-2">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">Used to deliver relevant advertisements to you.</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    You can control cookies through your browser settings. Note that disabling cookies may
                    affect the functionality of our services.
                  </p>
                </section>

                <section id="security" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-heritage-accent" />
                    6. Data Security
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We implement appropriate technical and organizational measures to protect your personal
                    information, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted storage for sensitive data</li>
                    <li>Regular security assessments and audits</li>
                    <li>Employee training on data protection</li>
                    <li>Access controls and authentication measures</li>
                  </ul>
                  <p className="text-gray-600">
                    For more details, please see our <Link href="/legal/data-security" className="text-heritage-primary hover:text-heritage-accent">Data Security</Link> page.
                  </p>
                </section>

                <section id="rights" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Users className="w-6 h-6 text-heritage-accent" />
                    7. Your Privacy Rights
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Depending on your location, you may have the following rights:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
                    <li><strong>Do Not Sell:</strong> Opt out of sale of personal information (CA residents)</li>
                  </ul>
                  <p className="text-gray-600">
                    To exercise your rights, contact us at{" "}
                    <a href="mailto:privacy@heritagels.com" className="text-heritage-primary hover:text-heritage-accent">
                      privacy@heritagels.com
                    </a>{" "}
                    or visit our <Link href="/legal/do-not-sell" className="text-heritage-primary hover:text-heritage-accent">Do Not Sell My Info</Link> page.
                  </p>
                </section>

                <section id="children" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Baby className="w-6 h-6 text-heritage-accent" />
                    8. Children's Privacy
                  </h2>
                  <p className="text-gray-600">
                    Our services are not directed to children under 18 years of age. We do not knowingly collect
                    personal information from children. If you believe we have collected information from a child,
                    please contact us immediately at{" "}
                    <a href="mailto:privacy@heritagels.com" className="text-heritage-primary hover:text-heritage-accent">
                      privacy@heritagels.com
                    </a>.
                  </p>
                </section>

                <section id="international" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-heritage-accent" />
                    9. International Users
                  </h2>
                  <p className="text-gray-600">
                    Our services are intended for users in the United States. If you access our services from
                    outside the United States, please be aware that your information may be transferred to,
                    stored, and processed in the United States where our servers are located. By using our
                    services, you consent to this transfer.
                  </p>
                </section>

                <section id="changes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-heritage-accent" />
                    10. Changes to This Policy
                  </h2>
                  <p className="text-gray-600">
                    We may update this Privacy Policy from time to time. We will notify you of any material
                    changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    We encourage you to review this Privacy Policy periodically.
                  </p>
                </section>

                <section id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-heritage-accent" />
                    11. Contact Us
                  </h2>
                  <p className="text-gray-600 mb-4">
                    If you have questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="font-semibold text-heritage-primary mb-2">Heritage Life Solutions, LLC</p>
                    <p className="text-gray-600 text-sm">Privacy Officer</p>
                    <a
                      href="https://maps.google.com/?q=1240+Iroquois+Ave,+Suite+506,+Naperville,+IL+60563"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm hover:text-heritage-primary transition-colors block"
                    >
                      <p>1240 Iroquois Ave, Suite 506</p>
                      <p>Naperville, IL 60563</p>
                    </a>
                    <p className="text-gray-600 text-sm mt-2">
                      Phone: <a href="tel:6307780800" className="text-heritage-primary hover:text-heritage-accent">(630) 778-0800</a>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Email: <a href="mailto:privacy@heritagels.com" className="text-heritage-primary hover:text-heritage-accent">privacy@heritagels.com</a>
                    </p>
                  </div>
                </section>

                {/* Related Links */}
                <div className="border-t border-gray-200 pt-8 mt-12">
                  <h3 className="font-semibold text-heritage-primary mb-4">Related Policies</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/legal/terms" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Terms of Use <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/data-security" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Data Security <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/do-not-sell" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Do Not Sell My Info <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
