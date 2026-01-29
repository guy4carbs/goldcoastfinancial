import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
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
      <section className="pt-24 pb-12 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Privacy Policy
            </h1>
            <p className="text-white/80 text-lg text-pretty">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-white/60 text-sm mt-4">
              Last Updated: January 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:max-w-6xl lg:mx-auto">
            {/* Table of Contents */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-72 flex-shrink-0"
            >
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-primary mb-3 md:mb-4 text-sm md:text-base">Table of Contents</h3>
                <nav className="space-y-1 md:space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm text-left transition-all min-h-[44px] md:min-h-0 ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
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
              className="flex-1 bg-white rounded-2xl p-5 md:p-8 lg:p-12 shadow-sm border border-gray-100"
            >
              <div className="prose prose-gray max-w-none">
                <section id="overview" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    1. Overview
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    Heritage Life Solutions, LLC ("Heritage," "we," "us," or "our") is committed to protecting
                    your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you visit our website or use our services.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
                    <p className="text-gray-700 font-medium mb-2 text-sm md:text-base">Key Points:</p>
                    <ul className="list-disc pl-5 md:pl-6 text-gray-600 text-xs md:text-sm space-y-1 md:space-y-2">
                      <li>We collect information you provide and information collected automatically</li>
                      <li>We use your information to provide and improve our services</li>
                      <li>We do not sell your personal information to third parties</li>
                      <li>You have rights regarding your personal information</li>
                    </ul>
                  </div>
                </section>

                <section id="collection" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Database className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    2. Information We Collect
                  </h2>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Information You Provide</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                    We collect information you voluntarily provide, including:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                    <li><strong>Quote Information:</strong> Age, gender, health information, coverage preferences</li>
                    <li><strong>Application Data:</strong> Social Security number, beneficiary information, medical history</li>
                    <li><strong>Account Information:</strong> Username, password, account preferences</li>
                    <li><strong>Communication Data:</strong> Messages, inquiries, feedback you send us</li>
                  </ul>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Information Collected Automatically</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                    When you access our services, we automatically collect:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, navigation paths</li>
                    <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                    <li><strong>Cookies and Tracking:</strong> See our Cookies section below</li>
                  </ul>
                </section>

                <section id="use" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Settings className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    3. How We Use Your Information
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
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

                <section id="sharing" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Share2 className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    4. Information Sharing
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li><strong>Insurance Carriers:</strong> To process quotes and applications on your behalf</li>
                    <li><strong>Service Providers:</strong> Third parties who perform services for us (hosting, analytics, etc.)</li>
                    <li><strong>Business Partners:</strong> With your consent, for joint marketing efforts</li>
                    <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  </ul>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
                    <p className="text-gray-700 font-medium mb-2 text-sm md:text-base">We Do NOT:</p>
                    <ul className="list-disc pl-5 md:pl-6 text-gray-600 text-xs md:text-sm space-y-1 md:space-y-2">
                      <li>Sell your personal information to third parties</li>
                      <li>Share your health information for marketing purposes</li>
                      <li>Use your Social Security number for marketing</li>
                    </ul>
                  </div>
                </section>

                <section id="cookies" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Cookie className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    5. Cookies & Tracking Technologies
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We use cookies and similar tracking technologies to collect and track information about your
                    browsing activities. Types of cookies we use:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <h4 className="font-semibold text-primary mb-1 md:mb-2 text-sm md:text-base">Essential Cookies</h4>
                      <p className="text-xs md:text-sm text-gray-600">Required for basic site functionality and security.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <h4 className="font-semibold text-primary mb-1 md:mb-2 text-sm md:text-base">Analytics Cookies</h4>
                      <p className="text-xs md:text-sm text-gray-600">Help us understand how visitors interact with our site.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <h4 className="font-semibold text-primary mb-1 md:mb-2 text-sm md:text-base">Functional Cookies</h4>
                      <p className="text-xs md:text-sm text-gray-600">Remember your preferences and personalize your experience.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <h4 className="font-semibold text-primary mb-1 md:mb-2 text-sm md:text-base">Marketing Cookies</h4>
                      <p className="text-xs md:text-sm text-gray-600">Used to deliver relevant advertisements to you.</p>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    You can control cookies through your browser settings. Note that disabling cookies may
                    affect the functionality of our services.
                  </p>
                </section>

                <section id="security" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    6. Data Security
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal
                    information, including:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-3 md:mb-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted storage for sensitive data</li>
                    <li>Regular security assessments and audits</li>
                    <li>Employee training on data protection</li>
                    <li>Access controls and authentication measures</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    For more details, please see our <Link href="/legal/data-security" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">Data Security</Link> page.
                  </p>
                </section>

                <section id="rights" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    7. Your Privacy Rights
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    Depending on your location, you may have the following rights:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
                    <li><strong>Do Not Sell:</strong> Opt out of sale of personal information (CA residents)</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    To exercise your rights, contact us at{" "}
                    <a href="mailto:contact@heritagels.org" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">
                      contact@heritagels.org
                    </a>{" "}
                    or visit our <Link href="/legal/do-not-sell" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">Do Not Sell My Info</Link> page.
                  </p>
                </section>

                <section id="children" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Baby className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    8. Children's Privacy
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 text-pretty leading-relaxed">
                    Our services are not directed to children under 18 years of age. We do not knowingly collect
                    personal information from children. If you believe we have collected information from a child,
                    please contact us immediately at{" "}
                    <a href="mailto:contact@heritagels.org" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">
                      contact@heritagels.org
                    </a>.
                  </p>
                </section>

                <section id="international" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    9. International Users
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 text-pretty leading-relaxed">
                    Our services are intended for users in the United States. If you access our services from
                    outside the United States, please be aware that your information may be transferred to,
                    stored, and processed in the United States where our servers are located. By using our
                    services, you consent to this transfer.
                  </p>
                </section>

                <section id="changes" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    10. Changes to This Policy
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 text-pretty leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material
                    changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    We encourage you to review this Privacy Policy periodically.
                  </p>
                </section>

                <section id="contact" className="mb-6 md:mb-8 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    11. Contact Us
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    If you have questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <p className="font-semibold text-primary mb-2 text-sm md:text-base">Heritage Life Solutions, LLC</p>
                    <p className="text-gray-600 text-xs md:text-sm">Privacy Officer</p>
                    <MapSelector>
                      <div className="text-gray-600 text-sm hover:text-primary transition-colors cursor-pointer">
                        <p>1240 Iroquois Ave, Suite 506</p>
                        <p>Naperville, IL 60563</p>
                      </div>
                    </MapSelector>
                    <p className="text-gray-600 text-xs md:text-sm mt-2">
                      Phone: <a href="tel:6307780800" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">(630) 778-0800</a>
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Email: <a href="mailto:contact@heritagels.org" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">contact@heritagels.org</a>
                    </p>
                  </div>
                </section>

                {/* Related Links */}
                <div className="border-t border-gray-200 pt-6 md:pt-8 mt-8 md:mt-12">
                  <h3 className="font-semibold text-primary mb-3 md:mb-4 text-sm md:text-base">Related Policies</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Link href="/legal/terms" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-gray-50 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors min-h-[44px]">
                      Terms of Use <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/data-security" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-gray-50 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors min-h-[44px]">
                      Data Security <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/do-not-sell" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-gray-50 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors min-h-[44px]">
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
