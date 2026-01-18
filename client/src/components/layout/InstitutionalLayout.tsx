import { Link, useLocation } from "wouter";
import { Shield, Menu, Leaf, ChevronDown, Linkedin, Twitter, Mail, MapPin, Phone, Clock, Search } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstitutionalLiveChat } from "@/components/ui/institutional-live-chat";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { InstitutionalAnnouncementBanner } from "@/components/ui/institutional-announcement-banner";
import { InstitutionalSearch } from "@/components/ui/institutional-search";
import { InstitutionalNewsletter } from "@/components/ui/institutional-newsletter";

/**
 * Institutional Layout for Gold Coast Financial Holdings
 *
 * Design Philosophy:
 * - Goldman Sachs / Berkshire Hathaway style
 * - Minimal, authoritative, non-promotional
 * - Conservative and permanent feel
 * - No aggressive CTAs or consumer-facing copy
 */

export function InstitutionalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { href: "/goldcoastfinancial2", label: "Overview" },
    { href: "/goldcoastfinancial2/about", label: "About" },
    { href: "/goldcoastfinancial2/portfolio", label: "Portfolio" },
    { href: "/goldcoastfinancial2/investors", label: "Investors" },
    { href: "/goldcoastfinancial2/contact", label: "Contact" },
  ];

  const moreLinks = [
    { href: "/goldcoastfinancial2/careers", label: "Careers" },
    { href: "/goldcoastfinancial2/blog", label: "Insights" },
    { href: "/goldcoastfinancial2/media", label: "Media" },
    { href: "/goldcoastfinancial2/news", label: "News" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Accessibility: Skip to main content */}
      <SkipLink />

      {/* Announcement Banner */}
      <InstitutionalAnnouncementBanner />

      {/* Site Search Modal */}
      <InstitutionalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Minimal Header */}
      <header className="border-b border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-20 flex items-center justify-between">
            {/* Logo - Simple, understated */}
            <Link href="/goldcoastfinancial2" className="flex items-center gap-3 cursor-pointer group">
              <div className="bg-primary p-2 rounded-sm transition-transform duration-200 group-hover:scale-105">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold leading-none text-primary tracking-tight">
                  GOLD COAST FINANCIAL
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                  Group
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Clean, minimal */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all duration-200 cursor-pointer relative ${
                    location === link.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  } after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:bg-secondary after:transition-all after:duration-200 ${
                    location === link.href
                      ? "after:w-full"
                      : "after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm tracking-wide text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer flex items-center gap-1 group">
                  More
                  <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  {moreLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href} className="cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <div className="border-t border-border/40 my-1" />
                  <DropdownMenuItem asChild>
                    <a href="/heritage" className="flex items-center gap-2 cursor-pointer">
                      <div className="bg-[#4f5a3f] p-1 rounded-sm">
                        <Leaf className="w-3 h-3 text-[#d4a05b]" />
                      </div>
                      <span>Heritage Life Solutions</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Search site"
              >
                <Search className="w-4 h-4" />
              </button>
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="flex flex-col gap-6 mt-12">
                  {/* Search Button - Mobile */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>

                  <div className="border-t border-border/60 pt-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-2 text-base tracking-wide cursor-pointer ${
                          location === link.href
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/60 pt-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">More</p>
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-2 text-sm tracking-wide cursor-pointer ${
                          location === link.href
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/60 pt-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Subsidiaries</p>
                    <a
                      href="/heritage"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <div className="bg-[#4f5a3f] p-1 rounded-sm">
                        <Leaf className="w-3 h-3 text-[#d4a05b]" />
                      </div>
                      <span>Heritage Life Solutions</span>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>

      {/* Live Chat Widget */}
      <InstitutionalLiveChat />

      {/* Newsletter CTA */}
      <InstitutionalNewsletter variant="banner" />

      {/* Institutional Footer - Dark burgundy */}
      <footer className="bg-[hsl(348,65%,15%)] text-white">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-6">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 p-1.5 rounded-sm">
                  <Shield className="w-4 h-4 text-[hsl(42,60%,55%)]" />
                </div>
                <span className="font-serif text-base font-semibold text-white">
                  GOLD COAST FINANCIAL
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-5">
                A diversified financial services holding company providing governance and strategic oversight to regulated businesses.
              </p>
              {/* Social Media Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://linkedin.com/company/goldcoastfinancial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(42,60%,55%)] transition-colors group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-white/70 group-hover:text-[hsl(348,65%,15%)]" />
                </a>
                <a
                  href="https://twitter.com/goldcoastfnl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(42,60%,55%)] transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 text-white/70 group-hover:text-[hsl(348,65%,15%)]" />
                </a>
                <a
                  href="mailto:contact@goldcoastfnl.com"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(42,60%,55%)] transition-colors group"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-white/70 group-hover:text-[hsl(348,65%,15%)]" />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(42,60%,55%)] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/goldcoastfinancial2/about" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/portfolio" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/investors" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Investors
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/careers" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/contact" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(42,60%,55%)] mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/goldcoastfinancial2/news" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/blog" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/media" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Media Center
                  </Link>
                </li>
                <li>
                  <a href="/heritage" className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <Leaf className="w-3 h-3 text-[hsl(42,60%,55%)]" />
                    Heritage Life
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(42,60%,55%)] mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/goldcoastfinancial2/privacy" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/terms" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(42,60%,55%)] mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://maps.google.com/?q=1240+Iroquois+Ave+Suite+506+Naperville+IL+60563"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors flex items-start gap-2 group"
                  >
                    <MapPin className="w-4 h-4 text-[hsl(42,60%,55%)] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">
                      1240 Iroquois Ave Suite 506<br />
                      Naperville, IL 60563
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+16305550123"
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[hsl(42,60%,55%)] shrink-0" />
                    (630) 555-0123
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@goldcoastfnl.com"
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-[hsl(42,60%,55%)] shrink-0" />
                    contact@goldcoastfnl.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Office Hours */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(42,60%,55%)] mb-4">
                Office Hours
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[hsl(42,60%,55%)] mt-0.5 shrink-0" />
                  <div className="text-white/60">
                    <p className="text-white/80 font-medium">Mon - Fri</p>
                    <p>9:00 AM - 5:00 PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <div className="text-white/60">
                    <p className="text-white/80 font-medium">Saturday</p>
                    <p>By Appointment</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <div className="text-white/60">
                    <p className="text-white/80 font-medium">Sunday</p>
                    <p>Closed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Regulatory Disclosures */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="mb-6">
              <p className="text-xs text-white/40 leading-relaxed max-w-4xl">
                Gold Coast Financial is a financial services holding company. Insurance products are offered through licensed subsidiaries. Products and services may not be available in all states. Insurance products are not deposits, not FDIC insured, not insured by any federal government agency, not guaranteed by a bank or savings association, and may lose value. Gold Coast Financial and its subsidiaries are not affiliated with or endorsed by the U.S. government or any government agency.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-white/50">
                &copy; {new Date().getFullYear()} Gold Coast Financial Group. All rights reserved.
              </p>
              <p className="text-xs text-white/50">
                Naperville, Illinois
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
