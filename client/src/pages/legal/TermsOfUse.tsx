import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
import {
  FileText,
  ChevronRight,
  Scale,
  AlertTriangle,
  Shield,
  Users,
  Globe,
  MessageSquare,
  Ban,
  RefreshCw,
  Mail
} from "lucide-react";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms", icon: FileText },
  { id: "services", title: "Description of Services", icon: Globe },
  { id: "eligibility", title: "Eligibility", icon: Users },
  { id: "account", title: "Account Registration", icon: Shield },
  { id: "conduct", title: "User Conduct", icon: Scale },
  { id: "prohibited", title: "Prohibited Activities", icon: Ban },
  { id: "intellectual", title: "Intellectual Property", icon: FileText },
  { id: "disclaimers", title: "Disclaimers", icon: AlertTriangle },
  { id: "limitation", title: "Limitation of Liability", icon: Scale },
  { id: "indemnification", title: "Indemnification", icon: Shield },
  { id: "termination", title: "Termination", icon: RefreshCw },
  { id: "governing", title: "Governing Law", icon: Scale },
  { id: "changes", title: "Changes to Terms", icon: RefreshCw },
  { id: "contact", title: "Contact Information", icon: MessageSquare }
];

export default function TermsOfUse() {
  const [activeSection, setActiveSection] = useState("acceptance");

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
              <Scale className="w-8 h-8 text-heritage-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Use
            </h1>
            <p className="text-white/80 text-lg">
              Please read these terms carefully before using our services
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
            {/* Table of Contents - Sticky Sidebar */}
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
                <p className="text-lg text-gray-600 mb-8">
                  Welcome to Heritage Life Solutions. These Terms of Use ("Terms") govern your access to and use of our website,
                  services, and applications. By accessing or using our services, you agree to be bound by these Terms.
                </p>

                <section id="acceptance" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-heritage-accent" />
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-600 mb-4">
                    By accessing or using the Heritage Life Solutions website and services, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these
                    Terms, please do not use our services.
                  </p>
                  <p className="text-gray-600">
                    These Terms constitute a legally binding agreement between you and Heritage Life Solutions, LLC ("Heritage,"
                    "we," "us," or "our"). We reserve the right to modify these Terms at any time, and such modifications will
                    be effective immediately upon posting.
                  </p>
                </section>

                <section id="services" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-heritage-accent" />
                    2. Description of Services
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Heritage Life Solutions is an independent insurance agency that provides:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Insurance product information and educational resources</li>
                    <li>Quote comparison tools for life insurance and annuity products</li>
                    <li>Application assistance and policy placement services</li>
                    <li>Customer service and policy support</li>
                    <li>Agent recruitment and training resources</li>
                  </ul>
                  <p className="text-gray-600">
                    We act as an intermediary between you and insurance carriers. All insurance policies are issued by
                    third-party insurance companies, not Heritage Life Solutions.
                  </p>
                </section>

                <section id="eligibility" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Users className="w-6 h-6 text-heritage-accent" />
                    3. Eligibility
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To use our services, you must:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Be at least 18 years of age</li>
                    <li>Be a legal resident of the United States</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Not be prohibited from using our services under applicable law</li>
                  </ul>
                </section>

                <section id="account" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-heritage-accent" />
                    4. Account Registration
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Certain features of our services may require you to create an account. When registering, you agree to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                  <p className="text-gray-600">
                    We reserve the right to suspend or terminate accounts that violate these Terms or contain
                    inaccurate information.
                  </p>
                </section>

                <section id="conduct" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-heritage-accent" />
                    5. User Conduct
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You agree to use our services only for lawful purposes and in accordance with these Terms.
                    You agree not to use our services:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>In any way that violates applicable laws or regulations</li>
                    <li>To transmit false, misleading, or fraudulent information</li>
                    <li>To impersonate any person or entity</li>
                    <li>To interfere with or disrupt our services or servers</li>
                    <li>To collect information about other users without consent</li>
                  </ul>
                </section>

                <section id="prohibited" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Ban className="w-6 h-6 text-heritage-accent" />
                    6. Prohibited Activities
                  </h2>
                  <p className="text-gray-600 mb-4">
                    The following activities are strictly prohibited:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Using automated systems to access our services without permission</li>
                    <li>Transmitting viruses, malware, or other harmful code</li>
                    <li>Engaging in any activity that could damage or impair our services</li>
                    <li>Using our services for any illegal or unauthorized purpose</li>
                    <li>Reverse engineering or attempting to extract source code</li>
                    <li>Removing or altering any proprietary notices or labels</li>
                  </ul>
                </section>

                <section id="intellectual" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-heritage-accent" />
                    7. Intellectual Property
                  </h2>
                  <p className="text-gray-600 mb-4">
                    All content, features, and functionality of our services—including but not limited to text,
                    graphics, logos, icons, images, audio clips, video clips, data compilations, and software—are
                    the exclusive property of Heritage Life Solutions or its licensors and are protected by
                    intellectual property laws.
                  </p>
                  <p className="text-gray-600">
                    You may not reproduce, distribute, modify, create derivative works of, publicly display,
                    publicly perform, republish, download, store, or transmit any materials from our services
                    without our prior written consent.
                  </p>
                </section>

                <section id="disclaimers" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-heritage-accent" />
                    8. Disclaimers
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
                    <p className="text-gray-700 font-medium mb-2">Important Notice:</p>
                    <p className="text-gray-600 text-sm">
                      Our services are provided "as is" and "as available" without warranties of any kind,
                      either express or implied. We do not warrant that our services will be uninterrupted,
                      secure, or error-free.
                    </p>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Information provided on our website is for general informational purposes only and does not
                    constitute professional financial, legal, or insurance advice. You should consult with
                    qualified professionals before making insurance decisions.
                  </p>
                  <p className="text-gray-600">
                    Quote estimates provided through our tools are for illustrative purposes only and are subject
                    to underwriting approval by the issuing carrier.
                  </p>
                </section>

                <section id="limitation" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-heritage-accent" />
                    9. Limitation of Liability
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To the fullest extent permitted by law, Heritage Life Solutions shall not be liable for any
                    indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Loss of profits, data, or goodwill</li>
                    <li>Service interruption or computer damage</li>
                    <li>Cost of substitute services</li>
                    <li>Any damages arising from your use of our services</li>
                  </ul>
                  <p className="text-gray-600">
                    Our total liability for any claims arising from these Terms or your use of our services
                    shall not exceed the amount you paid us, if any, in the twelve months preceding the claim.
                  </p>
                </section>

                <section id="indemnification" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-heritage-accent" />
                    10. Indemnification
                  </h2>
                  <p className="text-gray-600">
                    You agree to indemnify, defend, and hold harmless Heritage Life Solutions, its officers,
                    directors, employees, agents, and affiliates from any claims, damages, losses, liabilities,
                    and expenses (including reasonable attorneys' fees) arising from your use of our services,
                    violation of these Terms, or infringement of any third-party rights.
                  </p>
                </section>

                <section id="termination" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-heritage-accent" />
                    11. Termination
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We may terminate or suspend your access to our services immediately, without prior notice,
                    for any reason, including breach of these Terms. Upon termination:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Your right to use our services will immediately cease</li>
                    <li>All provisions that should survive termination will survive</li>
                    <li>We may delete your account and associated data</li>
                  </ul>
                </section>

                <section id="governing" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-heritage-accent" />
                    12. Governing Law
                  </h2>
                  <p className="text-gray-600 mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of the State of
                    Illinois, without regard to its conflict of law provisions.
                  </p>
                  <p className="text-gray-600">
                    Any disputes arising from these Terms or your use of our services shall be resolved
                    exclusively in the state or federal courts located in DuPage County, Illinois.
                  </p>
                </section>

                <section id="changes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-heritage-accent" />
                    13. Changes to Terms
                  </h2>
                  <p className="text-gray-600">
                    We reserve the right to modify these Terms at any time. Changes will be effective immediately
                    upon posting to our website. Your continued use of our services after any changes constitutes
                    acceptance of the modified Terms. We encourage you to review these Terms periodically.
                  </p>
                </section>

                <section id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-heritage-primary mb-4 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-heritage-accent" />
                    14. Contact Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about these Terms of Use, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="font-semibold text-heritage-primary mb-2">Heritage Life Solutions, LLC</p>
                    <MapSelector>
                      <div className="text-gray-600 text-sm hover:text-heritage-primary transition-colors cursor-pointer">
                        <p>1240 Iroquois Ave, Suite 506</p>
                        <p>Naperville, IL 60563</p>
                      </div>
                    </MapSelector>
                    <p className="text-gray-600 text-sm mt-2">
                      Phone: <a href="tel:6307780800" className="text-heritage-primary hover:text-heritage-accent">(630) 778-0800</a>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Email: <a href="mailto:contact@heritagels.org" className="text-heritage-primary hover:text-heritage-accent">contact@heritagels.org</a>
                    </p>
                  </div>
                </section>

                {/* Related Links */}
                <div className="border-t border-gray-200 pt-8 mt-12">
                  <h3 className="font-semibold text-heritage-primary mb-4">Related Policies</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Privacy Policy <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/data-security" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Data Security <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/legal/accessibility" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-heritage-primary bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                      Accessibility <ChevronRight className="w-4 h-4" />
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
