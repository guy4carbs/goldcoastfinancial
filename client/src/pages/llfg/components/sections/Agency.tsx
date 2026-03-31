import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const CHECKLIST = [
  "Street-level contracts with 30+ carriers",
  "Dedicated back-office and case management",
  "Branded agent websites and CRM access",
  "Co-branded marketing materials",
  "Weekly training calls and masterclasses",
  "Production bonuses and incentive trips",
];

export default function Agency() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="agency" ref={ref} className="py-20 md:py-32 bg-[#0A0A0A]" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          {/* Left: col-span-3 */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <p className="text-[#B8963C] text-xs tracking-[0.2em] font-medium uppercase mb-4">
              Agency Partnerships
            </p>
            <h2
              className="text-4xl md:text-5xl text-white leading-tight font-bold"
              style={{ fontFamily: SERIF }}
            >
              Bring Your Entire{" "}
              <em className="italic text-[#E8C96B]">Agency to LLFG</em>
            </h2>
            <p className="text-white/60 leading-relaxed mt-6">
              Whether you&rsquo;re a producing manager with a small team or an established
              agency with 100+ agents, we have the infrastructure, contracts, and
              technology to support your growth. We partner with agencies of all
              sizes across the country.
            </p>

            {/* Tier callouts */}
            <div className="mt-8 space-y-4">
              <div className="bg-[#B8963C]/8 border-l-4 border-[#B8963C] pl-6 py-5 rounded-r-xl">
                <p className="text-white font-semibold">Teams of 40+ agents</p>
                <p className="text-white/60 text-sm mt-1">
                  Custom contract negotiations, dedicated support rep, and white-labeled back office.
                </p>
              </div>
              <div className="bg-[#B8963C]/8 border-l-4 border-[#B8963C] pl-6 py-5 rounded-r-xl">
                <p className="text-white font-semibold">Teams of 5–39 agents</p>
                <p className="text-white/60 text-sm mt-1">
                  Top-tier contracts, shared case management, and full training library access.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                const el = document.querySelector("#apply");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 bg-[#B8963C] text-white font-medium px-8 py-3.5 rounded-md hover:bg-[#E8C96B] hover:text-[#0A0A0A] transition-all duration-200"
            >
              Partner with LLFG &rarr;
            </button>
          </motion.div>

          {/* Right: col-span-2 — Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#1A1A1A] border border-[#B8963C]/30 rounded-2xl p-8">
              <h3 className="text-white font-semibold mb-6">
                What We Bring to Your Agency
              </h3>
              <div className="space-y-4">
                {CHECKLIST.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="text-[#B8963C] flex-shrink-0" size={16} strokeWidth={2} />
                    <span className="text-white/70 text-sm">{item}</span>
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
