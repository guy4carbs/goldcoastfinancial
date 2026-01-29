import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  ChevronRight,
  Lock,
  Server,
  Eye,
  Users,
  FileWarning,
  RefreshCw,
  Award,
  CheckCircle,
  MessageSquare
} from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit SSL Encryption",
    description: "All data transmitted between your browser and our servers is encrypted using industry-standard TLS 1.3 encryption."
  },
  {
    icon: Server,
    title: "Secure Data Centers",
    description: "Your data is stored in SOC 2 Type II certified data centers with 24/7 physical security and monitoring."
  },
  {
    icon: Eye,
    title: "Access Controls",
    description: "Strict role-based access controls ensure only authorized personnel can access sensitive information."
  },
  {
    icon: RefreshCw,
    title: "Regular Audits",
    description: "We conduct regular security assessments, penetration testing, and compliance audits."
  }
];

const certifications = [
  { name: "SOC 2 Type II", description: "Service Organization Control compliance" },
  { name: "PCI DSS", description: "Payment Card Industry Data Security Standard" },
  { name: "HIPAA", description: "Health Insurance Portability and Accountability Act" },
  { name: "State Insurance Regulations", description: "Compliant with all applicable state requirements" }
];

const sections = [
  { id: "commitment", title: "Our Commitment", icon: ShieldCheck },
  { id: "measures", title: "Security Measures", icon: Lock },
  { id: "data-handling", title: "Data Handling", icon: Server },
  { id: "access", title: "Access Control", icon: Users },
  { id: "incident", title: "Incident Response", icon: FileWarning },
  { id: "compliance", title: "Compliance", icon: Award },
  { id: "responsibility", title: "Your Responsibility", icon: CheckCircle },
  { id: "contact", title: "Contact Security Team", icon: MessageSquare }
];

export default function DataSecurity() {
  const [activeSection, setActiveSection] = useState("commitment");

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
              <ShieldCheck className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Data Security
            </h1>
            <p className="text-white/80 text-lg text-pretty">
              How we protect your sensitive information with enterprise-grade security
            </p>
            <p className="text-white/60 text-sm mt-4">
              Last Updated: January 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-8 md:py-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 lg:max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 md:p-6"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <h3 className="font-bold text-primary mb-1 md:mb-2 text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
                <section id="commitment" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    1. Our Security Commitment
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    At Heritage Life Solutions, protecting your personal and financial information is our highest
                    priority. We understand that you entrust us with sensitive data, including health information
                    and financial details, and we take that responsibility seriously.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
                    <p className="text-gray-700 font-medium mb-2 text-sm md:text-base">Our Security Promise:</p>
                    <ul className="list-disc pl-5 md:pl-6 text-gray-600 text-xs md:text-sm space-y-1 md:space-y-2">
                      <li>We implement industry-leading security measures</li>
                      <li>We continuously monitor and improve our security posture</li>
                      <li>We never sell your personal information</li>
                      <li>We maintain compliance with all applicable regulations</li>
                    </ul>
                  </div>
                </section>

                <section id="measures" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Lock className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    2. Technical Security Measures
                  </h2>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Encryption</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li><strong>In Transit:</strong> All data transmitted between your device and our servers uses TLS 1.3 encryption with 256-bit keys</li>
                    <li><strong>At Rest:</strong> Sensitive data is encrypted using AES-256 encryption in our databases</li>
                    <li><strong>End-to-End:</strong> Certain sensitive communications use end-to-end encryption</li>
                  </ul>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Infrastructure Security</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li>Enterprise-grade firewalls and intrusion detection systems</li>
                    <li>DDoS protection and traffic filtering</li>
                    <li>Regular vulnerability scanning and penetration testing</li>
                    <li>Automated security patching and updates</li>
                    <li>Redundant systems and disaster recovery capabilities</li>
                  </ul>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Application Security</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
                    <li>Secure coding practices following OWASP guidelines</li>
                    <li>Regular code reviews and security audits</li>
                    <li>Input validation and output encoding</li>
                    <li>Protection against common vulnerabilities (XSS, CSRF, SQL injection)</li>
                  </ul>
                </section>

                <section id="data-handling" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Server className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    3. Data Handling Practices
                  </h2>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Data Minimization</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We collect only the information necessary to provide our services. We do not retain data
                    longer than needed for business or legal purposes.
                  </p>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Secure Storage</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li>Data stored in SOC 2 Type II certified data centers</li>
                    <li>Geographic redundancy across multiple locations</li>
                    <li>Regular backups with encrypted storage</li>
                    <li>Strict physical access controls</li>
                  </ul>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Data Retention</h3>
                  <p className="text-sm md:text-base text-gray-600 text-pretty leading-relaxed">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined
                    in our Privacy Policy, unless a longer retention period is required by law. Insurance-related
                    records are maintained in accordance with state insurance regulations.
                  </p>
                </section>

                <section id="access" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    4. Access Control
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We implement strict access controls to protect your information:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li><strong>Role-Based Access:</strong> Employees only access data necessary for their job functions</li>
                    <li><strong>Multi-Factor Authentication:</strong> Required for all employee access to systems</li>
                    <li><strong>Access Logging:</strong> All access to sensitive data is logged and monitored</li>
                    <li><strong>Regular Reviews:</strong> Access privileges are reviewed and updated regularly</li>
                    <li><strong>Background Checks:</strong> All employees undergo background verification</li>
                  </ul>

                  <h3 className="text-base md:text-lg font-semibold text-primary mt-4 md:mt-6 mb-2 md:mb-3 text-balance">Employee Training</h3>
                  <p className="text-sm md:text-base text-gray-600 text-pretty leading-relaxed">
                    All employees receive comprehensive security awareness training upon hiring and annually
                    thereafter. This includes training on data protection, phishing awareness, and incident reporting.
                  </p>
                </section>

                <section id="incident" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <FileWarning className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    5. Incident Response
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    We maintain a comprehensive incident response plan that includes:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <li>24/7 security monitoring and alerting</li>
                    <li>Defined incident classification and escalation procedures</li>
                    <li>Dedicated incident response team</li>
                    <li>Regular incident response drills and tabletop exercises</li>
                    <li>Post-incident analysis and improvement processes</li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6">
                    <p className="text-gray-700 font-medium mb-2 text-sm md:text-base">Breach Notification:</p>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      In the event of a data breach affecting your personal information, we will notify you
                      in accordance with applicable state and federal laws, typically within 72 hours of
                      discovery.
                    </p>
                  </div>
                </section>

                <section id="compliance" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    6. Compliance & Certifications
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-pretty leading-relaxed">
                    We maintain compliance with applicable industry standards and regulations:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {certifications.map((cert) => (
                      <div key={cert.name} className="bg-gray-50 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-primary text-sm md:text-base">{cert.name}</p>
                          <p className="text-xs md:text-sm text-gray-600">{cert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="responsibility" className="mb-8 md:mb-12 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    7. Your Security Responsibility
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    Security is a shared responsibility. We recommend you:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
                    <li>Use strong, unique passwords for your accounts</li>
                    <li>Enable two-factor authentication when available</li>
                    <li>Keep your devices and software updated</li>
                    <li>Be cautious of phishing emails and suspicious links</li>
                    <li>Avoid accessing sensitive accounts on public Wi-Fi</li>
                    <li>Report any suspicious activity to us immediately</li>
                    <li>Review your account statements regularly</li>
                  </ul>
                </section>

                <section id="contact" className="mb-6 md:mb-8 scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-balance">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-violet-500 flex-shrink-0" />
                    8. Contact Our Security Team
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-pretty leading-relaxed">
                    If you have security concerns or want to report a vulnerability, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <p className="font-semibold text-primary mb-2 text-sm md:text-base">Heritage Life Solutions Security Team</p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Email: <a href="mailto:contact@heritagels.org" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">contact@heritagels.org</a>
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Phone: <a href="tel:6307780800" className="text-primary hover:text-violet-500 min-h-[44px] inline-flex items-center">(630) 778-0800</a>
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm mt-3 md:mt-4">
                      For urgent security issues, please call our security hotline directly.
                    </p>
                  </div>
                </section>

                {/* Related Links */}
                <div className="border-t border-gray-200 pt-6 md:pt-8 mt-8 md:mt-12">
                  <h3 className="font-semibold text-primary mb-3 md:mb-4 text-sm md:text-base">Related Policies</h3>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-gray-50 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors min-h-[44px]">
                      Privacy Policy <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/terms" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-gray-50 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors min-h-[44px]">
                      Terms of Use <ChevronRight className="w-4 h-4" />
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
