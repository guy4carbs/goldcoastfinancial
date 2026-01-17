import { Link, useLocation } from "wouter";
import { Shield, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  const navLinks = [
    { href: "/goldcoastfinancial2", label: "Overview" },
    { href: "/goldcoastfinancial2/about", label: "About" },
    { href: "/goldcoastfinancial2/portfolio", label: "Portfolio" },
    { href: "/goldcoastfinancial2/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Minimal Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-20 flex items-center justify-between">
            {/* Logo - Simple, understated */}
            <Link href="/goldcoastfinancial2" className="flex items-center gap-3 cursor-pointer">
              <div className="bg-primary p-2 rounded-sm">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold leading-none text-primary tracking-tight">
                  GOLD COAST FINANCIAL
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                  Holdings
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Clean, minimal */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors cursor-pointer ${
                    location === link.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="flex flex-col gap-8 mt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-base tracking-wide cursor-pointer ${
                        location === link.href
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Minimal Footer - Institutional style */}
      <footer className="border-t border-border/40 bg-white">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-1.5 rounded-sm">
                  <Shield className="w-4 h-4 text-secondary" />
                </div>
                <span className="font-serif text-base font-semibold text-primary">
                  GOLD COAST FINANCIAL
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                A diversified financial services holding company providing governance,
                capital stewardship, and strategic oversight to regulated insurance
                and advisory businesses across the United States.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/goldcoastfinancial2/about" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/portfolio" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Portfolio Companies
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/contact" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/goldcoastfinancial2/contact" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Regulatory Information
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/40 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Gold Coast Financial Holdings. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Naperville, Illinois
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
