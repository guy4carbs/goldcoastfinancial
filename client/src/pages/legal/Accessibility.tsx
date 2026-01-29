import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accessibility as AccessibilityIcon,
  ChevronRight,
  Eye,
  Keyboard,
  Monitor,
  Volume2,
  MousePointer,
  Smartphone,
  CheckCircle,
  MessageSquare,
  Phone,
  Mail
} from "lucide-react";

const accessibilityFeatures = [
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description: "Full keyboard accessibility for all interactive elements",
    details: [
      "Tab through all interactive elements",
      "Enter/Space to activate buttons and links",
      "Arrow keys for menu navigation",
      "Escape to close modals and dropdowns"
    ]
  },
  {
    icon: Eye,
    title: "Screen Reader Support",
    description: "Optimized for assistive technologies",
    details: [
      "ARIA labels and landmarks",
      "Descriptive alt text for images",
      "Proper heading hierarchy",
      "Form field labels and instructions"
    ]
  },
  {
    icon: Monitor,
    title: "Visual Accessibility",
    description: "Designed for diverse visual needs",
    details: [
      "High contrast color combinations",
      "Resizable text up to 200%",
      "No reliance on color alone",
      "Clear focus indicators"
    ]
  },
  {
    icon: Volume2,
    title: "Audio & Video",
    description: "Accessible multimedia content",
    details: [
      "Captions for video content",
      "Transcripts available on request",
      "No auto-playing audio",
      "Volume controls provided"
    ]
  }
];

const wcagCriteria = [
  { level: "A", description: "Essential accessibility requirements", status: "compliant" },
  { level: "AA", description: "Enhanced accessibility for most users", status: "compliant" },
  { level: "AAA", description: "Highest level of accessibility", status: "partial" }
];

export default function Accessibility() {
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
              <AccessibilityIcon className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Accessibility Statement
            </h1>
            <p className="text-white/80 text-lg text-pretty">
              We are committed to ensuring digital accessibility for people of all abilities
            </p>
            <p className="text-white/60 text-sm mt-4">
              Last Updated: January 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-12 md:py-20 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 md:mb-4 text-balance">Our Commitment</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed text-pretty">
              Heritage Life Solutions is committed to ensuring that our website and services are accessible
              to everyone, including people with disabilities. We strive to meet or exceed the Web Content
              Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </motion.div>

          {/* WCAG Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-2xl p-5 md:p-8"
          >
            <h3 className="font-bold text-primary mb-4 md:mb-6 text-center text-sm md:text-base">WCAG 2.1 Compliance Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {wcagCriteria.map((criteria) => (
                <div
                  key={criteria.level}
                  className={`rounded-xl p-4 md:p-6 text-center ${
                    criteria.status === "compliant" ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
                  }`}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">Level {criteria.level}</div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{criteria.description}</p>
                  <span className={`inline-flex items-center gap-1 text-xs md:text-sm font-medium ${
                    criteria.status === "compliant" ? "text-green-600" : "text-amber-600"
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    {criteria.status === "compliant" ? "Compliant" : "Partially Compliant"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 lg:max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 md:mb-4 text-balance">Accessibility Features</h2>
            <p className="text-sm md:text-base text-gray-600 text-pretty">
              Our website includes the following accessibility features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {accessibilityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1 text-sm md:text-base">{feature.title}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">{feature.description}</p>
                    <ul className="space-y-1 md:space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Browser Compatibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-4 md:p-6"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Monitor className="w-5 h-5 md:w-6 md:h-6 text-violet-500" />
                <h3 className="font-bold text-primary text-sm md:text-base">Browser Compatibility</h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                Our site is optimized for accessibility with:
              </p>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                <li>Chrome (latest 2 versions)</li>
                <li>Firefox (latest 2 versions)</li>
                <li>Safari (latest 2 versions)</li>
                <li>Edge (latest 2 versions)</li>
              </ul>
            </motion.div>

            {/* Assistive Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-4 md:p-6"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-violet-500" />
                <h3 className="font-bold text-primary text-sm md:text-base">Assistive Technologies</h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                We test compatibility with:
              </p>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                <li>JAWS screen reader</li>
                <li>NVDA screen reader</li>
                <li>VoiceOver (macOS/iOS)</li>
                <li>TalkBack (Android)</li>
              </ul>
            </motion.div>
          </div>

          {/* Known Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 md:mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6"
          >
            <h3 className="font-bold text-primary mb-3 md:mb-4 text-sm md:text-base">Known Limitations</h3>
            <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
              While we strive for full accessibility, some limitations may exist:
            </p>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
              <li>Some third-party content may not meet all accessibility standards</li>
              <li>Older PDF documents may not be fully accessible (we are working to remediate)</li>
              <li>Some interactive calculators may have limited screen reader support</li>
            </ul>
            <p className="text-gray-600 text-xs md:text-sm mt-3 md:mt-4">
              We are actively working to address these limitations. Please contact us if you encounter
              any barriers.
            </p>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 md:mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <MousePointer className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h3 className="font-bold text-primary text-sm md:text-base">Tips for Better Experience</h3>
            </div>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
              <li>Use Ctrl/Cmd + Plus (+) to increase text size</li>
              <li>Use Ctrl/Cmd + Minus (-) to decrease text size</li>
              <li>Use Tab to navigate through interactive elements</li>
              <li>Enable high contrast mode in your operating system for enhanced visibility</li>
              <li>Use browser reader mode for simplified content viewing</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#fffaf3] to-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-8"
          >
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-violet-500 mx-auto mb-3 md:mb-4" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 md:mb-4 text-balance">Feedback & Assistance</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto text-pretty">
              We welcome your feedback on the accessibility of our website. If you encounter any
              barriers or need assistance, please let us know.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="font-bold text-primary mb-3 md:mb-4 text-sm md:text-base">Contact Us</h3>
                <div className="space-y-3 md:space-y-4">
                  <a
                    href="tel:6307780800"
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors min-h-[44px]"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">(630) 778-0800</p>
                      <p className="text-xs md:text-sm text-gray-500">Mon-Fri, 9am-5pm CST</p>
                    </div>
                  </a>
                  <a
                    href="mailto:contact@heritagels.org"
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors min-h-[44px]"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">contact@heritagels.org</p>
                      <p className="text-xs md:text-sm text-gray-500">We respond within 2 business days</p>
                    </div>
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-3 md:mb-4 text-sm md:text-base">When Contacting Us</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                  Please include the following information:
                </p>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                  <li>URL of the page with the issue</li>
                  <li>Description of the accessibility barrier</li>
                  <li>Assistive technology used (if applicable)</li>
                  <li>Your contact information</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Related Links */}
          <div className="mt-6 md:mt-8 text-center">
            <h3 className="font-semibold text-primary mb-3 md:mb-4 text-sm md:text-base">Related Policies</h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <Link href="/legal/terms" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                Terms of Use <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                Privacy Policy <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-primary bg-white px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-colors shadow-sm min-h-[44px]">
                Contact Us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
