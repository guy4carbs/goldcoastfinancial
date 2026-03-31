import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const TESTIMONIALS = [
  {
    initials: "MR",
    name: "Marcus R.",
    role: "Financial Advisor, Texas",
    quote:
      "I came from captive insurance and doubled my income in the first month. The lead flow and carrier access at LLFG is unmatched.",
    stat: "$22K",
    statLabel: "First Month",
  },
  {
    initials: "SL",
    name: "Sofia L.",
    role: "Manager, Florida",
    quote:
      "I built a team of 12 in six months. The training, mentorship, and comp structure made scaling feel effortless.",
    stat: "$60K",
    statLabel: "Month 6",
  },
  {
    initials: "JB",
    name: "Jaalyn B.",
    role: "Executive, Georgia",
    quote:
      "Legacy Life gave me the platform to build a real agency. By month 12, I had 40 agents and hit executive status.",
    stat: "$120K",
    statLabel: "Month 12",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="proof" ref={ref} className="py-20 md:py-32 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl md:text-5xl text-white font-bold text-center mb-16"
          style={{ fontFamily: SERIF }}
        >
          Agents Building <em className="italic text-[#E8C96B]">Real Businesses</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.initials}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#B8963C]/20"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-[#B8963C]/20 border-2 border-[#B8963C] flex items-center justify-center">
                <span
                  className="text-[#E8C96B] text-lg font-bold"
                  style={{ fontFamily: SERIF }}
                >
                  {t.initials}
                </span>
              </div>

              <p className="text-white font-medium mt-4">{t.name}</p>
              <p className="text-white/50 text-sm">{t.role}</p>

              <blockquote
                className="text-white/80 leading-relaxed mt-4 text-sm italic"
                style={{ fontFamily: SERIF }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <span
                className="block text-2xl text-[#E8C96B] font-bold mt-4"
                style={{ fontFamily: SERIF }}
              >
                {t.stat}
              </span>
              <span className="text-white/50 text-xs">{t.statLabel}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
