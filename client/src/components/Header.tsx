import { useState } from "react";
import { Search, User, ChevronDown, Leaf, Phone, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#fffaf3] sticky top-0 z-50 border-b border-[#e8e0d5]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-md bg-heritage-primary">
            <Leaf className="w-6 h-6 text-heritage-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-heritage-primary tracking-tight leading-none">HERITAGE</span>
            <span className="text-[0.6rem] uppercase tracking-widest text-gray-500">Life Solutions</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <button className="flex items-center gap-1 text-gray-700 hover:text-heritage-primary transition-colors">
            Life insurance <ChevronDown className="w-4 h-4" />
          </button>
          <a href="/risk-strategy" className="text-gray-700 hover:text-heritage-primary transition-colors">
            Risk Strategy
          </a>
          <button className="flex items-center gap-1 text-gray-700 hover:text-heritage-primary transition-colors">
            Wills & Trusts <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-heritage-primary transition-colors">
            About us <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-heritage-primary transition-colors">
            Resources <ChevronDown className="w-4 h-4" />
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Phone - hidden on mobile */}
          <a href="tel:6307780800" className="hidden md:flex items-center gap-2 text-sm text-gray-700 hover:text-heritage-primary transition-colors">
            <Phone className="w-4 h-4" />
            <span className="font-medium">(630) 778-0800</span>
          </a>

          {/* Desktop icons */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="p-2 hover:bg-[#e8e0d5] rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-[#e8e0d5] rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-[#e8e0d5] rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fffaf3] border-t border-[#e8e0d5] px-6 py-4 space-y-4">
          <a href="#" className="block text-gray-700 hover:text-heritage-primary py-2 font-medium">Life Insurance</a>
          <a href="/risk-strategy" className="block text-gray-700 hover:text-heritage-primary py-2 font-medium">Risk Strategy</a>
          <a href="#" className="block text-gray-700 hover:text-heritage-primary py-2 font-medium">Wills & Trusts</a>
          <a href="#" className="block text-gray-700 hover:text-heritage-primary py-2 font-medium">About Us</a>
          <a href="#" className="block text-gray-700 hover:text-heritage-primary py-2 font-medium">Resources</a>
          <div className="pt-4 border-t border-[#e8e0d5] flex items-center gap-4">
            <a href="tel:6307780800" className="flex items-center gap-2 text-heritage-primary font-medium">
              <Phone className="w-4 h-4" />
              (630) 778-0800
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
