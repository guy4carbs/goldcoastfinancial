import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const STATS = [
  { number: "30+", label: "Top-Rated Carriers", sub: "A-rated and above, all product lines" },
  { number: "100%", label: "Contract Levels", sub: "Street-level from day one, no build-up" },
  { number: "$0", label: "Cost to Join", sub: "Zero startup fees, zero monthly costs" },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="py-20 md:py-32 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-[#B8963C] text-xs tracking-[0.2em] font-medium uppercase mb-4">
              FMO Positioning
            </p>
            <h2
              className="text-4xl md:text-5xl text-white leading-tight font-bold"
              style={{ fontFamily: SERIF }}
            >
              We Sit at the Top of the{" "}
              <em className="italic text-[#E8C96B]">Distribution Chain</em>
            </h2>
            <p className="text-white/60 leading-relaxed mt-6">
              Legacy Life Financial Group is a national field marketing organization
              partnered with the top-rated insurance carriers in the country. We give
              independent agents and agencies direct access to the highest contract
              levels, free leads, cutting-edge technology, and a proven system to
              scale—without the overhead.
            </p>
          </motion.div>

          {/* Right: Stat Cards */}
          <div className="flex flex-col gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.number}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                className="bg-[#1A1A1A] border-l-4 border-[#B8963C] p-6 rounded-r-xl"
              >
                <span
                  className="text-3xl text-[#E8C96B] font-bold"
                  style={{ fontFamily: SERIF }}
                >
                  {stat.number}
                </span>
                <p className="text-white font-medium mt-1">{stat.label}</p>
                <p className="text-white/50 text-sm mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
