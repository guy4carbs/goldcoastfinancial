import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const STATS = [
  { number: "30+", label: "Top-Rated Carriers" },
  { number: "100%", label: "Street-Level Contracts" },
  { number: "$0", label: "Cost to Join" },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="py-20 md:py-28 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-[#B8963C] text-sm tracking-[0.25em] font-medium uppercase mb-5">
            FMO Positioning
          </p>
          <h2
            className="text-4xl md:text-5xl text-white font-bold whitespace-nowrap"
            style={{ fontFamily: SERIF }}
          >
            Top of the <em className="italic text-[#E8C96B]">Distribution Chain</em>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mt-5 leading-relaxed text-base">
            Direct access to the highest contract levels, free leads,
            technology, and a proven system to scale — without the overhead.
          </p>
        </motion.div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <span
                className="text-4xl md:text-5xl text-[#E8C96B] font-bold"
                style={{ fontFamily: SERIF }}
              >
                {stat.number}
              </span>
              <p className="text-white/40 text-sm mt-2 whitespace-nowrap">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
