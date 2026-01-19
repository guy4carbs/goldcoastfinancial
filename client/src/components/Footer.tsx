export default function Footer() {
  return (
    <footer className="bg-[#fffaf3] border-t border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Us</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Mailing Address</p>
                <p>1240 Iroquois Ave</p>
                <p>Suite 506</p>
                <p>Naperville, IL 60563</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Phone</p>
                <p>(630) 778-0800</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Email</p>
                <a href="mailto:info@heritagels.com" className="hover:text-heritage-primary">info@heritagels.com</a>
              </div>
              <div className="flex gap-3 pt-2">
                <a href="#" className="w-8 h-8 bg-[#e8e0d5] hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#e8e0d5] hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">X</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#e8e0d5] hover:bg-heritage-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">in</span>
                </a>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-heritage-primary">Our Policies</a></li>
              <li><a href="/#faqs" className="hover:text-heritage-primary">FAQs</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Blog</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Life Insurance 101</a></li>
              <li><a href="/quote" className="hover:text-heritage-primary">How It Works</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Account Login</a></li>
              <li><a href="/quote" className="hover:text-heritage-primary">Get a Quote</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="/about" className="hover:text-heritage-primary">About Us</a></li>
              <li><a href="/about/founders" className="hover:text-heritage-primary">Our Team</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Our Carriers</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Reviews</a></li>
              <li><a href="/careers" className="hover:text-heritage-primary">Careers</a></li>
              <li><a href="/contact" className="hover:text-heritage-primary">Contact</a></li>
              <li><a href="#" className="hover:text-heritage-primary">For Agents</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-heritage-primary">Terms of Use</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Data Security</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Accessibility</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Licenses</a></li>
              <li><a href="#" className="hover:text-heritage-primary">Do Not Sell My Info</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-xs text-gray-500 leading-relaxed space-y-4">
            <p>
              © 2026 Heritage Life Solutions. Heritage operates as an independent insurance agency. Licensed in all 50 states.
              IL License #1001234567. Heritage offers policies issued by multiple carriers listed at heritagels.com/carriers.
              Products and their features may not be available in all states.
            </p>
            <p>
              To help avoid requiring a medical exam, our application asks certain health and lifestyle questions.
              No medical exam means online health questions are required. Customers can get approved in as little as 10 minutes.
              You can purchase instantly or do it anytime in the next 30 days as long as no information provided to us has changed.
            </p>
            <p>
              For people ages 40 and over, the average rate increase is 10% every 6 months. Once you purchase, your rate stays the same for your whole term.
            </p>
            <p className="text-gray-400 text-[10px]">
              Trustpilot rating as of January 2026. Best no-exam life insurance according to independent reviews.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
