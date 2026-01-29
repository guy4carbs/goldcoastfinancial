import { Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import MapSelector from "./MapSelector";

export default function Footer() {
  return (
    <footer className="bg-[#fffaf3] border-t border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Us</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Mailing Address</p>
                <MapSelector>
                  <span className="block">1240 Iroquois Ave</span>
                  <span className="block">Suite 506</span>
                  <span className="block">Naperville, IL 60563</span>
                </MapSelector>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Phone</p>
                <a href="tel:6307780800" className="hover:text-primary">(630) 778-0800</a>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Email</p>
                <a href="mailto:contact@heritagels.org" className="hover:text-primary">contact@heritagels.org</a>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-9 md:h-9 bg-[#e8e0d5] hover:bg-[#1877F2] hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 md:w-4 md:h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-9 md:h-9 bg-[#e8e0d5] hover:bg-black hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-5 h-5 md:w-4 md:h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-9 md:h-9 bg-[#e8e0d5] hover:bg-[#0A66C2] hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 md:w-4 md:h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-9 md:h-9 bg-[#e8e0d5] hover:bg-[#FF0000] hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 md:w-4 md:h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-9 md:h-9 bg-[#e8e0d5] hover:bg-gradient-to-tr hover:from-[#FCAF45] hover:via-[#E1306C] hover:to-[#833AB4] hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 md:w-4 md:h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="/products" className="hover:text-primary">Our Products</a></li>
              <li><a href="/resources/faqs" className="hover:text-primary">FAQs</a></li>
              <li><a href="/resources/blog" className="hover:text-primary">Blog</a></li>
              <li><a href="/resources/life-insurance-101" className="hover:text-primary">Life Insurance 101</a></li>
              <li><a href="/resources/calculators" className="hover:text-primary">Calculators</a></li>
              <li><a href="/quote" className="hover:text-primary">Get a Quote</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="/about" className="hover:text-primary">About Us</a></li>
              <li><a href="/about/founders" className="hover:text-primary">Meet the Founders</a></li>
              <li><a href="/risk-strategy" className="hover:text-primary">Risk Strategy</a></li>
              <li><a href="/careers" className="hover:text-primary">Careers</a></li>
              <li><a href="/contact" className="hover:text-primary">Contact</a></li>
              <li><a href="/agents/become-an-agent" className="hover:text-primary">Become an Agent</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="/legal/terms" className="hover:text-primary">Terms of Use</a></li>
              <li><a href="/legal/privacy" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="/legal/data-security" className="hover:text-primary">Data Security</a></li>
              <li><a href="/legal/accessibility" className="hover:text-primary">Accessibility</a></li>
              <li><a href="/legal/licenses" className="hover:text-primary">Licenses</a></li>
              <li><a href="/legal/do-not-sell" className="hover:text-primary">Do Not Sell My Info</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-xs text-gray-500 leading-relaxed space-y-4">
            <p>
              © 2026 Gold Coast Financial Group. Heritage Life Solutions is a DBA of Gold Coast Financial Group.
              We operate as an independent insurance agency, licensed in all 50 states. IL License #1001234567.
              Policies are issued by our carrier partners and product availability may vary by state.
            </p>
            <p>
              At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process
              connects you with coverage options from top-rated carriers, often without the need for medical exams.
              Most applications take just minutes to complete, and approvals can happen within 24-48 hours.
            </p>
            <p>
              Life insurance premiums are based on factors including age, health, and coverage amount.
              Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium
              remains fixed for the duration of your term.
            </p>
            <p className="text-gray-400 text-[10px]">
              Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options.
              All quotes are subject to underwriting approval by the issuing carrier.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
