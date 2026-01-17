import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Phone, MapPin, Mail, Instagram, Linkedin, Youtube, Navigation, Map } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LiveChat } from "@/components/ui/live-chat";
import { MobileCallButton } from "@/components/ui/mobile-call-button";

const OFFICE_ADDRESS = "1240 Iroquois Ave Suite 506, Naperville, IL 60563";
const ADDRESS_ENCODED = encodeURIComponent(OFFICE_ADDRESS);

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Insurance Products" },
    { href: "/resources", label: "Resources" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - Premium Touch */}
      <div className="bg-primary text-primary-foreground py-2 text-xs md:text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-secondary" /> (630) 555-0123</span>
            <span className="flex items-center gap-1 hidden sm:flex"><MapPin className="w-3 h-3 text-secondary" /> Naperville, IL</span>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-secondary transition-colors cursor-pointer">Set Up a Meeting</Link>
            <Link href="/client-login" className="hover:text-secondary transition-colors cursor-pointer">Client Login</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-1.5 rounded-sm">
              <Shield className="w-6 h-6 text-secondary" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold leading-none text-primary tracking-tight">GOLD COAST</span>
              <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground group-hover:text-secondary transition-colors font-medium">Financial</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                location === link.href ? "text-primary font-bold" : "text-muted-foreground"
              }`}>
                {link.label}
              </Link>
            ))}
            <Link href="/get-quote">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-md cursor-pointer">
                Get a Quote
              </Button>
            </Link>
          </nav>

          {/* Mobile Nav */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-lg font-medium cursor-pointer ${
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/get-quote" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-secondary text-secondary-foreground cursor-pointer">Get a Quote</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <LiveChat />
      <MobileCallButton />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-secondary" />
                <span className="font-serif text-xl font-bold">GOLD COAST</span>
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Providing peace of mind through expert guidance and personalized life insurance solutions for families and businesses nationwide.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://instagram.com/goldcoastfinancial_" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on Instagram" data-testid="social-instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://tiktok.com/@goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on TikTok" data-testid="social-tiktok">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/goldcoastfinancial" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on Facebook" data-testid="social-facebook">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://x.com/goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on X" data-testid="social-twitter">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/goldcoastfnl" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on LinkedIn" data-testid="social-linkedin">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://youtube.com/@goldcoastfinancial" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-secondary transition-colors" aria-label="Follow us on YouTube" data-testid="social-youtube">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4 text-secondary">Quick Links</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><Link href="/about" className="hover:text-white transition-colors cursor-pointer">About Us</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors cursor-pointer">Life Insurance</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors cursor-pointer">Resources</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors cursor-pointer">Coverage Calculator</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors cursor-pointer">Contact</Link></li>
                <li><Link href="/client-login" className="hover:text-white transition-colors cursor-pointer">Client Portal</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors cursor-pointer">Careers</Link></li>
                <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">Heritage Life Solutions</Link></li>
                <li><Link href="/agent-login" className="hover:text-white transition-colors cursor-pointer">Agent Lounge</Link></li>
                <li><Link href="/exec-login" className="hover:text-white transition-colors cursor-pointer">Executive Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg mb-4 text-secondary">Contact Us</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
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
                          <Map className="w-4 h-4 text-primary" />
                          Google Maps
                        </a>
                        <a 
                          href={`https://maps.apple.com/?q=${ADDRESS_ENCODED}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <Navigation className="w-4 h-4 text-primary" />
                          Apple Maps
                        </a>
                        <a 
                          href={`geo:0,0?q=${ADDRESS_ENCODED}`}
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-primary" />
                          Default Maps App
                        </a>
                      </div>
                    </PopoverContent>
                  </Popover>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary shrink-0" />
                  <span>(630) 555-0123</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary shrink-0" />
                  <a href="mailto:contact@goldcoastfnl.com" className="hover:text-white transition-colors">contact@goldcoastfnl.com</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg mb-4 text-secondary">Office Hours</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li className="flex justify-between"><span>Mon - Fri:</span> <span>9:00 AM - 5:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span>By Appointment</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/10 pt-8 text-center text-xs text-primary-foreground/70">
            <p className="mb-2">Gold Coast Financial Group is an independent agency and not affiliated with any specific insurance carrier.</p>
            <p>&copy; {new Date().getFullYear()} Gold Coast Financial Group. All rights reserved. | <Link href="/privacy" className="hover:text-white cursor-pointer">Privacy Policy</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
