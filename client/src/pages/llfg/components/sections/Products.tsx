import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

const PRODUCTS = [
  {
    name: "Term Life",
    ideal: "Young families, mortgage holders, income replacement",
    commission: "High first-year commissions, quick-issue options, fast payouts",
  },
  {
    name: "Whole Life",
    ideal: "Estate planning, cash value seekers, legacy builders",
    commission: "Strong first-year + renewal trails, premium persistency bonuses",
  },
  {
    name: "IUL",
    ideal: "High-income earners, tax-advantaged growth, retirement supplement",
    commission: "Highest commission per case, target premium bonuses, persistency",
  },
  {
    name: "Annuities",
    ideal: "Retirees, safe-money seekers, pension alternatives",
    commission: "Large case sizes, trail commissions, bonus-eligible contracts",
  },
];

export default function Products() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="products" ref={ref} className="py-20 md:py-32 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl md:text-5xl text-white font-bold text-center mb-16"
          style={{ fontFamily: SERIF }}
        >
          What You&rsquo;ll <em className="italic text-[#E8C96B]">Sell</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              className="bg-[#1A1A1A] rounded-2xl p-8 border-t-2 border-transparent hover:border-t-[#B8963C] transition-colors duration-300"
            >
              <h3
                className="text-2xl text-white font-bold mb-4"
                style={{ fontFamily: SERIF }}
              >
                {p.name}
              </h3>

              <p className="text-white/40 text-xs tracking-wide font-medium uppercase mt-4">
                Ideal for:
              </p>
              <p className="text-white text-sm mt-1">{p.ideal}</p>

              <p className="text-[#B8963C] text-xs tracking-wide font-medium uppercase mt-5">
                Commission profile:
              </p>
              <p className="text-white/60 text-sm mt-1">{p.commission}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
