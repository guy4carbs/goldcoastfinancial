import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import LionLogo from "../LionLogo";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

interface Carrier {
  name: string;
  sub?: string;
  products: string;
}

const CARRIERS: Carrier[] = [
  { name: "Mutual", sub: "of Omaha", products: "Life · Annuity" },
  { name: "Trinity", sub: "Life", products: "Life" },
  { name: "Baltimore", sub: "Life", products: "Life · Final Expense" },
  { name: "Foresters", sub: "Financial", products: "Life · Annuity" },
  { name: "Liberty Bankers", sub: "Life", products: "Life · FE" },
  { name: "Corebridge", sub: "Financial", products: "Life · Annuity · IUL" },
  { name: "American", sub: "Amicable", products: "Life · FE" },
  { name: "SPLI", sub: "Term", products: "Term Life" },
  { name: "Trans", sub: "america", products: "Life · Annuity · IUL" },
  { name: "Lafayette", sub: "Life", products: "Whole Life · IUL" },
  { name: "Americo", sub: "", products: "Life · FE · Annuity" },
  { name: "SPLI", sub: "Senior Life", products: "Senior Life" },
  { name: "UHL", sub: "United Home Life", products: "Life · FE" },
  { name: "Banner", sub: "Life", products: "Term · Whole Life" },
  { name: "Royal Neighbors", sub: "of America", products: "Life · Annuity" },
  { name: "Columbus", sub: "Life", products: "Life · IUL" },
  { name: "GTL", sub: "Guaranteed Trust Life", products: "Medicare · Supp" },
  { name: "Ethos", sub: "Life", products: "Term Life · WL" },
  { name: "Polish Falcons", sub: "of America", products: "Life · Annuity" },
  { name: "American", sub: "Home Life", products: "Life · FE" },
  { name: "Aetna", sub: "Insurance", products: "Health · Life · Dental" },
  { name: "Fidelity", sub: "Life", products: "Term · WL · GI" },
  { name: "Chubb", sub: "", products: "Life · Supplemental" },
  { name: "InstaBrain", sub: "", products: "Insurtech · Term · GI" },
  { name: "Aflac", sub: "Supplemental", products: "Supplemental · Cancer" },
  { name: "Fidelity", sub: "Term Life", products: "Term Life" },
  { name: "Fidelity", sub: "Final Expense", products: "Final Expense" },
  { name: "Fidelity", sub: "Guar. Issue", products: "Guaranteed Issue" },
  { name: "Aetna", sub: "Medicare Supp", products: "Medicare Supplement" },
  { name: "Aetna", sub: "Medicare Adv", products: "Medicare Advantage" },
  { name: "Aflac", sub: "Cancer / CI", products: "Critical Illness" },
  { name: "Aflac", sub: "Accident", products: "Accident Insurance" },
];

export default function Carriers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="carriers" ref={ref} className="py-20 md:py-28 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl text-white font-bold text-center mb-4"
          style={{ fontFamily: SERIF }}
        >
          Our <em className="italic text-[#E8C96B]">Carrier Partners</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/40 text-center max-w-lg mx-auto mb-12 text-sm"
        >
          Direct access to 30+ of the most competitive, highly-rated carriers in the industry.
        </motion.p>

        {/* Carrier grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2"
        >
          {CARRIERS.map((c, i) => (
            <div
              key={`${c.name}-${c.sub}-${i}`}
              className="bg-[#0A0A0A] border border-[#B8963C]/15 rounded-lg px-3 py-4 flex flex-col items-center text-center hover:border-[#B8963C]/40 transition-colors"
            >
              <span
                className="text-white text-sm font-bold leading-tight"
                style={{ fontFamily: SERIF }}
              >
                {c.name}
              </span>
              {c.sub && (
                <span className="text-[#B8963C] text-[10px] font-medium uppercase tracking-wider mt-0.5">
                  {c.sub}
                </span>
              )}
              <span className="text-white/30 text-[10px] mt-2 uppercase tracking-wide">
                {c.products}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center mt-14"
        >
          <div className="w-12 h-px bg-[#B8963C]/30 mb-6" />
          <div className="flex items-center gap-3">
            <LionLogo size={20} />
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">
              Trust &middot; Strength &middot; Legacy &middot; AM Best A-Rated
              and Above
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
