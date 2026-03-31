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
  {
    icon: TrendingUp,
    title: "$10K–$15K in Your First Month",
    desc: "Our top new agents hit five figures in month one with our proven lead system and high-commission products.",
  },
  {
    icon: Gift,
    title: "Free Leads to Start",
    desc: "We invest in your success from day one. Qualified leads delivered so you can focus on closing, not prospecting.",
  },
  {
    icon: Building2,
    title: "Own Your Book of Business",
    desc: "Your clients are yours. No non-competes, no restrictions. Build equity in a real asset you can sell or pass down.",
  },
  {
    icon: GraduationCap,
    title: "Specialized Training",
    desc: "Product masterclasses, sales scripting, objection handling, and mentorship from agents earning $500K+.",
  },
  {
    icon: Infinity,
    title: "Uncapped Commissions",
    desc: "No salary caps, no income ceilings. Your production is your paycheck—earn what you're worth.",
  },
  {
    icon: Users,
    title: "Build & Lead a Team",
    desc: "Ready to recruit? Our agency-building track gives you overrides, bonuses, and a path to ownership.",
  },
];

export default function WhyJoin() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why" ref={ref} className="py-20 md:py-32 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl md:text-5xl text-white font-bold text-center mb-16"
          style={{ fontFamily: SERIF }}
        >
          Everything You Need to{" "}
          <em className="italic text-[#E8C96B]">Earn Big</em> from Day One
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#B8963C]/20 hover:border-[#B8963C]/60 hover:-translate-y-1 transition-all duration-200 cursor-default"
            >
              <card.icon
                size={28}
                className="text-[#B8963C]"
                strokeWidth={1.5}
              />
              <h3
                className="text-xl text-[#E8C96B] font-bold mt-5 mb-3"
                style={{ fontFamily: SERIF }}
              >
                {card.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
