import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const CHECKLIST = [
  "Street-level contracts, 30+ carriers",
  "Dedicated back-office support",
  "Branded websites and CRM",
  "Co-branded marketing",
  "Weekly training and masterclasses",
  "Production bonuses and trips",
];

export default function Agency() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="agency" ref={ref} className="py-20 md:py-28 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#B8963C] text-xs tracking-[0.25em] font-medium uppercase mb-5">
              Agency Partnerships
            </p>
            <h2
              className="text-3xl md:text-4xl text-white font-bold whitespace-nowrap"
              style={{ fontFamily: SERIF }}
            >
              Bring Your <em className="italic text-[#E8C96B]">Agency to LLFG</em>
            </h2>
            <p className="text-white/50 mt-5 leading-relaxed text-sm max-w-md">
              Whether you have 5 agents or 100+, we have the contracts,
              infrastructure, and technology to support your growth.
            </p>

            <div className="mt-8 space-y-3">
              <div className="bg-[#B8963C]/5 border-l-2 border-[#B8963C] pl-5 py-4 rounded-r-lg">
                <p className="text-white text-sm font-medium">40+ agents</p>
                <p className="text-white/45 text-xs mt-1">Custom contracts, dedicated rep, white-label</p>
              </div>
              <div className="bg-[#B8963C]/5 border-l-2 border-[#B8963C] pl-5 py-4 rounded-r-lg">
                <p className="text-white text-sm font-medium">5–39 agents</p>
                <p className="text-white/45 text-xs mt-1">Top-tier contracts, shared case management</p>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.querySelector("#apply");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 bg-[#B8963C] text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-[#E8C96B] hover:text-[#0A0A0A] transition-all"
            >
              Partner with LLFG
            </button>
          </motion.div>

          {/* Right: Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-[#1A1A1A] border border-[#B8963C]/15 rounded-xl p-6">
              <h3 className="text-white text-sm font-semibold mb-5 whitespace-nowrap">
                What We Bring
              </h3>
              <div className="space-y-3.5">
                {CHECKLIST.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="text-[#B8963C] flex-shrink-0" size={14} strokeWidth={2} />
                    <span className="text-white/60 text-sm whitespace-nowrap">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
