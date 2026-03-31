import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const PRODUCTS = [
  { name: "Term Life", clients: "Families, mortgage holders", commission: "High first-year, quick-issue" },
  { name: "Whole Life", clients: "Estate planning, legacy", commission: "Strong renewals + trails" },
  { name: "IUL", clients: "High earners, retirement", commission: "Highest per case" },
  { name: "Annuities", clients: "Retirees, safe money", commission: "Large cases + trails" },
];

export default function Products() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="products" ref={ref} className="py-20 md:py-28 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl text-white font-bold text-center mb-14"
          style={{ fontFamily: SERIF }}
        >
          What You&rsquo;ll <em className="italic text-[#E8C96B]">Sell</em>
        </motion.h2>

        <div className="grid grid-cols-4 gap-4">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#1A1A1A] rounded-xl p-6 border-t-2 border-transparent hover:border-t-[#B8963C] transition-colors"
            >
              <h3
                className="text-lg text-white font-bold whitespace-nowrap"
                style={{ fontFamily: SERIF }}
              >
                {p.name}
              </h3>
              <p className="text-white/35 text-[10px] tracking-wider uppercase mt-4 whitespace-nowrap">Ideal for</p>
              <p className="text-white/70 text-xs mt-1">{p.clients}</p>
              <p className="text-[#B8963C]/60 text-[10px] tracking-wider uppercase mt-4 whitespace-nowrap">Commission</p>
              <p className="text-white/50 text-xs mt-1">{p.commission}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
