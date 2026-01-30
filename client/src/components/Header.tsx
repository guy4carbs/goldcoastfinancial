import { useState } from "react";
import { Search, User, ChevronDown, Leaf, Phone, Menu, X } from "lucide-react";
import SearchModal from "./SearchModal";
import ClientPortalModal from "./ClientPortalModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

type DropdownKey = "life" | "annuities" | "about" | "resources" | "agents" | null;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [clientPortalOpen, setClientPortalOpen] = useState(false);
  const { trackMenuOpened, trackMenuClosed, trackPhoneClicked, trackCTAClicked } = useAnalytics();
  const { getPhone } = useSiteSettings();
  const phone = getPhone();

  const handleMouseEnter = (key: DropdownKey) => {
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="bg-[#fffaf3] sticky top-0 z-50 border-b border-[#e8e0d5]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-md bg-primary">
            <Leaf className="w-6 h-6 text-violet-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary tracking-tight leading-none">HERITAGE</span>
            <span className="text-[0.6rem] uppercase tracking-widest text-gray-500">Life Solutions</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Life Insurance Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("life")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors py-2">
              Life insurance <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "life" ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute top-full -left-4 pt-2 transition-all duration-200 ${activeDropdown === "life" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="bg-white rounded-xl shadow-xl border border-[#e8e0d5] p-6 w-[800px] max-w-[95vw]">
                {/* Get a Quote CTA */}
                <a
                  href="/quote"
                  className="block mb-4 p-4 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
                  onClick={() => trackCTAClicked("Get a Free Quote", "header-mega-menu", "/quote")}
                >
                  <span className="font-semibold">Get a Free Quote</span>
                  <span className="text-white/80 text-sm ml-2">Compare rates in minutes</span>
                </a>

                {/* Product Columns */}
                <div className="grid grid-cols-5 gap-6">
                  {/* Term Life */}
                  <div>
                    <a href="/life-insurance/term" className="font-semibold text-primary hover:underline block mb-2">Term Life</a>
                    <div className="space-y-1">
                      <a href="/life-insurance/term/coverage-calculator" className="block text-sm text-gray-600 hover:text-primary py-1">Coverage Calculator</a>
                      <a href="/life-insurance/term/no-exam" className="block text-sm text-gray-600 hover:text-primary py-1">No-Exam Options</a>
                    </div>
                  </div>

                  {/* Whole Life */}
                  <div>
                    <a href="/life-insurance/whole" className="font-semibold text-primary hover:underline block mb-2">Whole Life</a>
                    <div className="space-y-1">
                      <a href="/life-insurance/whole/cash-value" className="block text-sm text-gray-600 hover:text-primary py-1">Cash Value Explained</a>
                    </div>
                  </div>

                  {/* Final Expense */}
                  <div>
                    <a href="/life-insurance/final-expense" className="font-semibold text-primary hover:underline block mb-2">Final Expense</a>
                    <div className="space-y-1">
                      <a href="/life-insurance/final-expense/guaranteed-issue" className="block text-sm text-gray-600 hover:text-primary py-1">Guaranteed Acceptance</a>
                      <a href="/life-insurance/final-expense/seniors" className="block text-sm text-gray-600 hover:text-primary py-1">Coverage for Seniors</a>
                    </div>
                  </div>

                  {/* Mortgage Protection */}
                  <div>
                    <a href="/life-insurance/mortgage-protection" className="font-semibold text-primary hover:underline block mb-2">Mortgage Protection</a>
                    <div className="space-y-1">
                      <a href="/life-insurance/mortgage-protection/living-benefits" className="block text-sm text-gray-600 hover:text-primary py-1">Living Benefits</a>
                      <a href="/life-insurance/mortgage-protection/new-homeowners" className="block text-sm text-gray-600 hover:text-primary py-1">New Homeowners</a>
                    </div>
                  </div>

                  {/* IUL */}
                  <div>
                    <a href="/life-insurance/iul" className="font-semibold text-primary hover:underline block mb-2">IUL</a>
                    <div className="space-y-1">
                      <a href="/life-insurance/iul/retirement-income" className="block text-sm text-gray-600 hover:text-primary py-1">IUL for Retirement</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Annuities Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("annuities")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors py-2">
              Annuities <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "annuities" ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute top-full left-0 pt-2 transition-all duration-200 ${activeDropdown === "annuities" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="w-56 bg-white rounded-xl shadow-lg border border-[#e8e0d5] py-2">
                <a href="/annuities/fixed" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Fixed Annuities
                </a>
                <a href="/annuities/indexed" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Indexed Annuities
                </a>
                <a href="/annuities/retirement-income" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Retirement Income
                </a>
              </div>
            </div>
          </div>

          {/* About Us Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("about")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors py-2">
              About us <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "about" ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute top-full left-0 pt-2 transition-all duration-200 ${activeDropdown === "about" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="w-56 bg-white rounded-xl shadow-lg border border-[#e8e0d5] py-2">
                <a href="/about" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  About Heritage
                </a>
                <a href="/about/founders" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Meet the Team
                </a>
                <a href="/careers" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Careers
                </a>
                <a href="/contact" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          <a href="/risk-strategy" className="text-gray-700 hover:text-primary transition-colors">
            Risk Strategy
          </a>

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("resources")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors py-2">
              Resources <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute top-full left-0 pt-2 transition-all duration-200 ${activeDropdown === "resources" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="w-56 bg-white rounded-xl shadow-lg border border-[#e8e0d5] py-2">
                <a href="/products" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Our Products
                </a>
                <a href="/resources/blog" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Blog
                </a>
                <a href="/resources/life-insurance-101" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Life Insurance 101
                </a>
                <a href="/resources/faqs" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  FAQs
                </a>
                <a href="/resources/calculators" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Calculators
                </a>
              </div>
            </div>
          </div>

          {/* For Agents Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("agents")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors py-2">
              For Agents <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "agents" ? "rotate-180" : ""}`} />
            </button>
            <div className={`absolute top-full right-0 pt-2 transition-all duration-200 ${activeDropdown === "agents" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="w-56 bg-white rounded-xl shadow-lg border border-[#e8e0d5] py-2">
                <a href="/agents/login" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Agent Login
                </a>
                <a href="/agents/become-an-agent" className="block px-4 py-2 md:py-3 text-gray-700 hover:bg-[#f5f0e8] hover:text-primary transition-colors">
                  Become an Agent
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Phone - visible on all screen sizes */}
          <a
            href={phone.href}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
            onClick={() => trackPhoneClicked(phone.display, "header")}
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">{phone.display}</span>
          </a>

          {/* Desktop icons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-[#e8e0d5] rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setClientPortalOpen(true)}
              className="p-2 hover:bg-[#e8e0d5] rounded-full transition-colors"
              title="Client Portal"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-[#e8e0d5] rounded-full transition-colors"
            onClick={() => {
              const newState = !mobileMenuOpen;
              setMobileMenuOpen(newState);
              if (newState) {
                trackMenuOpened();
              } else {
                trackMenuClosed();
              }
            }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fffaf3] border-t border-[#e8e0d5] px-6 py-4 space-y-1 max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Get a Quote CTA */}
          <a
            href="/quote"
            className="block p-3 bg-primary rounded-lg text-white text-center font-semibold mb-4"
            onClick={() => trackCTAClicked("Get a Free Quote", "mobile-menu", "/quote")}
          >
            Get a Free Quote
          </a>

          {/* Term Life */}
          <div className="py-2">
            <a href="/life-insurance/term" className="font-semibold text-primary block mb-2">Term Life Insurance</a>
            <div className="pl-4 space-y-1 text-sm">
              <a href="/life-insurance/term/coverage-calculator" className="block text-gray-600 hover:text-primary py-1">Coverage Calculator</a>
              <a href="/life-insurance/term/no-exam" className="block text-gray-600 hover:text-primary py-1">No-Exam Options</a>
            </div>
          </div>

          {/* Whole Life */}
          <div className="py-2">
            <a href="/life-insurance/whole" className="font-semibold text-primary block mb-2">Whole Life Insurance</a>
            <div className="pl-4 space-y-1 text-sm">
              <a href="/life-insurance/whole/cash-value" className="block text-gray-600 hover:text-primary py-1">Cash Value Explained</a>
            </div>
          </div>

          {/* Final Expense */}
          <div className="py-2">
            <a href="/life-insurance/final-expense" className="font-semibold text-primary block mb-2">Final Expense</a>
            <div className="pl-4 space-y-1 text-sm">
              <a href="/life-insurance/final-expense/guaranteed-issue" className="block text-gray-600 hover:text-primary py-1">Guaranteed Acceptance</a>
              <a href="/life-insurance/final-expense/seniors" className="block text-gray-600 hover:text-primary py-1">Coverage for Seniors</a>
            </div>
          </div>

          {/* Mortgage Protection */}
          <div className="py-2">
            <a href="/life-insurance/mortgage-protection" className="font-semibold text-primary block mb-2">Mortgage Protection</a>
            <div className="pl-4 space-y-1 text-sm">
              <a href="/life-insurance/mortgage-protection/living-benefits" className="block text-gray-600 hover:text-primary py-1">Living Benefits</a>
              <a href="/life-insurance/mortgage-protection/new-homeowners" className="block text-gray-600 hover:text-primary py-1">New Homeowners</a>
            </div>
          </div>

          {/* IUL */}
          <div className="py-2">
            <a href="/life-insurance/iul" className="font-semibold text-primary block mb-2">IUL (Indexed Universal Life)</a>
            <div className="pl-4 space-y-1 text-sm">
              <a href="/life-insurance/iul/retirement-income" className="block text-gray-600 hover:text-primary py-1">IUL for Retirement</a>
            </div>
          </div>

          <div className="border-t border-[#e8e0d5] my-4"></div>

          {/* Annuities */}
          <div className="py-2">
            <p className="font-semibold text-gray-900 mb-2">Annuities</p>
            <div className="pl-4 space-y-2">
              <a href="/annuities/fixed" className="block text-gray-600 hover:text-primary py-1">Fixed Annuities</a>
              <a href="/annuities/indexed" className="block text-gray-600 hover:text-primary py-1">Indexed Annuities</a>
              <a href="/annuities/retirement-income" className="block text-gray-600 hover:text-primary py-1">Retirement Income</a>
            </div>
          </div>

          {/* About Us */}
          <div className="py-2">
            <p className="font-semibold text-gray-900 mb-2">About Us</p>
            <div className="pl-4 space-y-2">
              <a href="/about" className="block text-gray-600 hover:text-primary py-1">About Heritage</a>
              <a href="/about/founders" className="block text-gray-600 hover:text-primary py-1">Meet the Team</a>
              <a href="/careers" className="block text-gray-600 hover:text-primary py-1">Careers</a>
              <a href="/contact" className="block text-gray-600 hover:text-primary py-1">Contact</a>
            </div>
          </div>

          <a href="/risk-strategy" className="block text-gray-700 hover:text-primary py-2 font-medium">Risk Strategy</a>

          {/* Resources */}
          <div className="py-2">
            <p className="font-semibold text-gray-900 mb-2">Resources</p>
            <div className="pl-4 space-y-2">
              <a href="/products" className="block text-gray-600 hover:text-primary py-1">Our Products</a>
              <a href="/resources/blog" className="block text-gray-600 hover:text-primary py-1">Blog</a>
              <a href="/resources/life-insurance-101" className="block text-gray-600 hover:text-primary py-1">Life Insurance 101</a>
              <a href="/resources/faqs" className="block text-gray-600 hover:text-primary py-1">FAQs</a>
              <a href="/resources/calculators" className="block text-gray-600 hover:text-primary py-1">Calculators</a>
            </div>
          </div>

          {/* For Agents */}
          <div className="py-2">
            <p className="font-semibold text-gray-900 mb-2">For Agents</p>
            <div className="pl-4 space-y-2">
              <a href="/agents/login" className="block text-gray-600 hover:text-primary py-1">Agent Login</a>
              <a href="/agents/become-an-agent" className="block text-gray-600 hover:text-primary py-1">Become an Agent</a>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e8e0d5] space-y-3">
            <button
              onClick={() => {
                setClientPortalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary font-medium"
            >
              <User className="w-4 h-4" />
              Client Portal
            </button>
            <a
              href={phone.href}
              className="flex items-center gap-2 text-primary font-medium"
              onClick={() => trackPhoneClicked(phone.display, "mobile-menu")}
            >
              <Phone className="w-4 h-4" />
              {phone.display}
            </a>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Client Portal Modal */}
      <ClientPortalModal isOpen={clientPortalOpen} onClose={() => setClientPortalOpen(false)} />
    </header>
  );
}
