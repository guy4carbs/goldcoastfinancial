import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const TESTIMONIALS = [
  {
    initials: "MR",
    name: "Marcus R.",
    role: "Texas",
    quote: "Doubled my income in month one. Lead flow and carrier access is unmatched.",
    stat: "$22K",
    statLabel: "Month 1",
  },
  {
    initials: "SL",
    name: "Sofia L.",
    role: "Florida",
    quote: "Built a team of 12 in six months. Scaling felt effortless.",
    stat: "$60K",
    statLabel: "Month 6",
  },
  {
    initials: "JB",
    name: "Jaalyn B.",
    role: "Georgia",
    quote: "40 agents and executive status by month 12.",
    stat: "$120K",
    statLabel: "Month 12",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="proof" ref={ref} className="py-20 md:py-28 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl text-white font-bold text-center mb-14"
          style={{ fontFamily: SERIF }}
        >
          Agents Building <em className="italic text-[#E8C96B]">Real Businesses</em>
        </motion.h2>

        <div className="grid grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.initials}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-[#1A1A1A] rounded-xl p-6 border border-[#B8963C]/10 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#B8963C]/15 border border-[#B8963C]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#E8C96B] text-xs font-bold" style={{ fontFamily: SERIF }}>
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium whitespace-nowrap">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>

              <p className="text-white/60 text-xs leading-relaxed italic flex-1" style={{ fontFamily: SERIF }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="text-[#E8C96B] text-xl font-bold" style={{ fontFamily: SERIF }}>
                  {t.stat}
                </span>
                <span className="text-white/30 text-xs ml-2">{t.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
