import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LionLogo from "./LionLogo";

const NAV_LINKS = [
  { label: "Who We Are", href: "#about" },
  { label: "Why Join", href: "#why" },
  { label: "Carriers", href: "#carriers" },
  { label: "Agencies", href: "#agency" },
];

export default function LLFGNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 w-full z-50 transition-colors duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(10,10,10,0.95)" : "rgba(10,10,10,0.7)",
          backdropFilter: "blur(8px)",
          borderBottom: scrolled
            ? "1px solid rgba(184,150,60,0.3)"
            : "1px solid rgba(184,150,60,0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Left: Logo + Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3"
          >
            <LionLogo size={32} />
            <div className="flex flex-col leading-none">
              <span
                className="text-[#E8C96B] font-bold text-base"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Legacy Life
              </span>
              <span
                className="text-[#8A6E28] text-[10px] tracking-[0.2em] font-medium uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Financial Group
              </span>
            </div>
          </a>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-white/70 hover:text-[#E8C96B] transition-colors text-base font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right: CTA (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollTo("#apply")}
              className="hidden md:block border border-[#B8963C] text-[#E8C96B] bg-transparent hover:bg-[#B8963C] hover:text-white transition-all duration-200 px-6 py-2.5 rounded text-base font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Apply Now
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-white/80 hover:text-[#E8C96B] transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-6 text-white/80 hover:text-[#E8C96B] transition-colors"
            >
              <X size={28} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => scrollTo(link.href)}
                  className="text-[#E8C96B] text-3xl font-bold hover:text-white transition-colors"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.08 }}
                onClick={() => scrollTo("#apply")}
                className="mt-4 bg-[#B8963C] text-white font-medium px-8 py-3.5 rounded-md hover:bg-[#E8C96B] hover:text-[#0A0A0A] transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Apply Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
