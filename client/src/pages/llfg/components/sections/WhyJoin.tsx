import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  Gift,
  Building2,
  GraduationCap,
  Infinity,
  Users,
} from "lucide-react";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const CARDS = [
  { icon: TrendingUp, title: "$10K–$15K Month One", desc: "Proven lead system and high-commission products." },
  { icon: Gift, title: "Free Leads", desc: "Qualified leads delivered from day one." },
  { icon: Building2, title: "Own Your Book", desc: "No non-competes. Build real equity." },
  { icon: GraduationCap, title: "Elite Training", desc: "Mentorship from $500K+ producers." },
  { icon: Infinity, title: "Uncapped Income", desc: "No ceilings. Earn what you're worth." },
  { icon: Users, title: "Build a Team", desc: "Overrides, bonuses, path to ownership." },
];

export default function WhyJoin() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why" ref={ref} className="py-20 md:py-28 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl text-white font-bold text-center mb-14 whitespace-nowrap"
          style={{ fontFamily: SERIF }}
        >
          Everything to <em className="italic text-[#E8C96B]">Earn Big</em> Day One
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-[#1A1A1A] rounded-xl p-6 border border-[#B8963C]/10 hover:border-[#B8963C]/40 transition-colors"
            >
              <card.icon size={24} className="text-[#B8963C]" strokeWidth={1.5} />
              <h3
                className="text-base text-[#E8C96B] font-bold mt-4 mb-2 whitespace-nowrap"
                style={{ fontFamily: SERIF }}
              >
                {card.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
