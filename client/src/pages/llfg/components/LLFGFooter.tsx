import LionLogo from "./LionLogo";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const NAV_LINKS = [
  { label: "Who We Are", href: "#about" },
  { label: "Why Join", href: "#why" },
  { label: "Carriers", href: "#carriers" },
  { label: "Products", href: "#products" },
  { label: "Agencies", href: "#agency" },
  { label: "Apply", href: "#apply" },
  { label: "Contact", href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Data Security", href: "/legal/data-security" },
  { label: "Accessibility", href: "/legal/accessibility" },
  { label: "Licenses", href: "/legal/licenses" },
  { label: "Do Not Sell My Info", href: "/legal/do-not-sell" },
];

export default function LLFGFooter() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="bg-[#060606] border-t border-[#B8963C]/20"
      style={{ fontFamily: SANS }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Top section: Logo + Nav + Legal links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          {/* Logo + Wordmark + Tagline */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <LionLogo size={48} />
            <div className="mt-4 flex flex-col items-center md:items-start">
              <span
                className="text-[#E8C96B] font-bold text-lg"
                style={{ fontFamily: SERIF }}
              >
                Legacy Life
              </span>
              <span className="text-[#8A6E28] text-[10px] tracking-[0.2em] font-medium uppercase">
                Financial Group
              </span>
            </div>
            <p className="text-white/30 text-xs mt-4 leading-relaxed text-center md:text-left max-w-[200px]">
              Building legacies through financial protection and opportunity.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white/60 text-xs tracking-[0.15em] uppercase font-medium mb-4">
              Navigation
            </h4>
            <div className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-white/40 hover:text-[#E8C96B] transition-colors text-sm text-center md:text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white/60 text-xs tracking-[0.15em] uppercase font-medium mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-white/40 hover:text-[#E8C96B] transition-colors text-sm text-center md:text-left"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white/60 text-xs tracking-[0.15em] uppercase font-medium mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:support@llfg.us"
                className="text-white/40 hover:text-[#E8C96B] transition-colors text-sm"
              >
                support@llfg.us
              </a>
              <a
                href="https://llfg.us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#E8C96B] transition-colors text-sm"
              >
                llfg.us
              </a>
              <p className="text-white/30 text-sm">Naperville, IL</p>
            </div>
          </div>
        </div>

        {/* Compliance disclaimers */}
        <div className="pt-8 pb-6 border-b border-white/5 space-y-4">
          <p className="text-white/25 text-xs leading-relaxed text-center max-w-4xl mx-auto">
            Legacy Life Financial Group is an agency operating under Gold Coast
            Financial Partners LLC. We operate as an independent insurance
            agency, licensed in all 50 states. Policies are issued by our
            carrier partners and product availability may vary by state. All
            quotes are subject to underwriting approval by the issuing carrier.
          </p>
          <p className="text-white/25 text-xs leading-relaxed text-center max-w-4xl mx-auto">
            Life insurance premiums are based on factors including age, health,
            and coverage amount. Locking in coverage sooner typically means lower
            rates. Once your policy is in place, your premium remains fixed for
            the duration of your term. Legacy Life Financial Group partners with
            AM Best A-rated insurance carriers to provide comprehensive coverage
            options.
          </p>
          <p className="text-white/25 text-xs leading-relaxed text-center max-w-4xl mx-auto">
            Income examples shown are for illustrative purposes only and are not
            guarantees. Individual results will vary based on effort, experience,
            market conditions, and other factors. Past performance does not
            guarantee future results.
          </p>
        </div>

        {/* Copyright bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Gold Coast Financial Partners LLC.
            Legacy Life Financial Group is a DBA of Gold Coast Financial Partners
            LLC.
          </p>
          <p className="text-white/20 text-xs">
            Connected to Integrity Marketing Group
          </p>
        </div>
      </div>
    </footer>
  );
}
