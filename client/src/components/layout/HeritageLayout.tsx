import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, Phone, MapPin, Mail, Instagram, Linkedin, Youtube, Navigation, Map } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HeritageLiveChat } from "@/components/ui/heritage-live-chat";
import { MobileCallButton } from "@/components/ui/mobile-call-button";

const OFFICE_ADDRESS = "1240 Iroquois Ave Suite 506, Naperville, IL 60563";
const ADDRESS_ENCODED = encodeURIComponent(OFFICE_ADDRESS);

// Heritage Life Solutions color palette
// Primary = Forest Green, Background = Warm Beige
const c = {
  background: "#f5f0e8",      // Warm Beige - Page background
  primary: "#4f5a3f",         // Deep Forest Green - Primary buttons, headers
  primaryHover: "#3d4730",    // Darker forest green - Hover states
  secondary: "#d4a05b",       // Golden Ochre - CTA buttons, accents
  secondaryHover: "#c49149",  // Darker gold - Hover states
  muted: "#c8b6a6",           // Warm Taupe - Secondary elements, cards
  textPrimary: "#333333",     // Dark Charcoal - Main text
  textSecondary: "#5c5347",   // Warm brown-gray - Secondary text
  accent: "#8b5a3c",          // Warm brown - Accent details
  cream: "#fffaf3",           // Soft Cream - Card backgrounds
  white: "#ffffff",
};

export function HeritageLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/heritage", label: "Home" },
    { href: "/heritage/about", label: "About Us" },
    { href: "/heritage/products", label: "Insurance Products" },
    { href: "/heritage/resources", label: "Resources" },
    { href: "/heritage/careers", label: "Careers" },
    { href: "/heritage/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: c.background }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: c.primary }} className="py-2 text-xs md:text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center text-white">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" style={{ color: c.secondary }} /> (630) 555-0123</span>
            <span className="flex items-center gap-1 hidden sm:flex"><MapPin className="w-3 h-3" style={{ color: c.secondary }} /> Naperville, IL</span>
          </div>
          <div className="flex gap-4">
            <Link href="/heritage/contact" className="hover:opacity-80 transition-opacity cursor-pointer">Set Up a Meeting</Link>
            <Link href="/client-login" className="hover:opacity-80 transition-opacity cursor-pointer">Client Login</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur" style={{ backgroundColor: `${c.cream}f0`, borderColor: c.muted }}>
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/heritage" className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 rounded-sm" style={{ backgroundColor: c.primary }}>
              <Leaf className="w-6 h-6" style={{ color: c.secondary }} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold leading-none tracking-tight" style={{ color: c.primary }}>HERITAGE LIFE</span>
              <span className="text-[0.65rem] uppercase tracking-widest font-medium transition-colors" style={{ color: c.textSecondary }}>Solutions</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors cursor-pointer"
                style={{
                  color: location === link.href ? c.primary : c.textSecondary,
                  fontWeight: location === link.href ? 700 : 500
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/heritage/get-quote">
              <Button
                className="font-semibold shadow-md cursor-pointer"
                style={{ backgroundColor: c.secondary, color: c.textPrimary }}
              >
                Get a Quote
              </Button>
            </Link>
          </nav>

          {/* Mobile Nav */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" style={{ color: c.primary }} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" style={{ backgroundColor: c.cream }}>
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium cursor-pointer"
                    style={{ color: location === link.href ? c.primary : c.textSecondary }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/heritage/get-quote" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full cursor-pointer" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <HeritageLiveChat />
      <MobileCallButton />

      {/* Footer */}
      <footer style={{ backgroundColor: c.primary }} className="pt-16 pb-8">
        <div className="container mx-auto px-4 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-6 h-6" style={{ color: c.secondary }} />
                <span className="font-serif text-xl font-bold">HERITAGE LIFE</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                A division of Gold Coast Financial Group. Providing peace of mind through expert guidance and personalized life insurance solutions for families and businesses nationwide.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://instagram.com/goldcoastfinancial_" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://tiktok.com/@goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/goldcoastfinancial" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://x.com/goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://youtube.com/@goldcoastfinancial" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg mb-4" style={{ color: c.secondary }}>Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">Heritage Home</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">Gold Coast Financial</Link></li>
                <li><Link href="/heritage/products" className="hover:text-white transition-colors cursor-pointer">Life Insurance</Link></li>
                <li><Link href="/heritage/resources" className="hover:text-white transition-colors cursor-pointer">Resources</Link></li>
                <li><Link href="/heritage/calculator" className="hover:text-white transition-colors cursor-pointer">Coverage Calculator</Link></li>
                <li><Link href="/heritage/contact" className="hover:text-white transition-colors cursor-pointer">Contact</Link></li>
                <li><Link href="/heritage/careers" className="hover:text-white transition-colors cursor-pointer">Careers</Link></li>
                <li><Link href="/client-login" className="hover:text-white transition-colors cursor-pointer">Client Portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg mb-4" style={{ color: c.secondary }}>Contact Us</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: c.secondary }} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-left hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline">
                        1240 Iroquois Ave Suite 506<br/>Naperville, Illinois 60563
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <div className="grid gap-1">
                        <p className="text-xs text-muted-foreground px-2 py-1.5 font-medium">Open in Maps</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${ADDRESS_ENCODED}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <Map className="w-4 h-4" style={{ color: c.primary }} />
                          Google Maps
                        </a>
                        <a
                          href={`https://maps.apple.com/?q=${ADDRESS_ENCODED}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <Navigation className="w-4 h-4" style={{ color: c.primary }} />
                          Apple Maps
                        </a>
                        <a
                          href={`geo:0,0?q=${ADDRESS_ENCODED}`}
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <MapPin className="w-4 h-4" style={{ color: c.primary }} />
                          Default Maps App
                        </a>
                      </div>
                    </PopoverContent>
                  </Popover>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 shrink-0" style={{ color: c.secondary }} />
                  <span>(630) 555-0123</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 shrink-0" style={{ color: c.secondary }} />
                  <a href="mailto:contact@heritagels.com" className="hover:text-white transition-colors">contact@heritagels.com</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg mb-4" style={{ color: c.secondary }}>Office Hours</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex justify-between"><span>Mon - Fri:</span> <span>9:00 AM - 5:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span>By Appointment</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-xs text-white/70">
            <p className="mb-2">Heritage Life Solutions is a DBA of Gold Coast Financial Group, an independent agency.</p>
            <p>&copy; {new Date().getFullYear()} Gold Coast Financial. All rights reserved. | <Link href="/heritage/privacy" className="hover:text-white cursor-pointer">Privacy Policy</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
