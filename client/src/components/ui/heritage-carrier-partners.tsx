import { motion } from "framer-motion";
import { Shield, Award } from "lucide-react";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  cream: "#fffaf3",
  white: "#ffffff",
};

const carriers = [
  { name: "Northwestern Mutual", rating: "A++", ratingOrg: "AM Best" },
  { name: "New York Life", rating: "A++", ratingOrg: "AM Best" },
  { name: "MassMutual", rating: "A++", ratingOrg: "AM Best" },
  { name: "Guardian Life", rating: "A++", ratingOrg: "AM Best" },
  { name: "Pacific Life", rating: "A+", ratingOrg: "AM Best" },
  { name: "Mutual of Omaha", rating: "A+", ratingOrg: "AM Best" },
  { name: "Prudential", rating: "A+", ratingOrg: "AM Best" },
  { name: "John Hancock", rating: "A+", ratingOrg: "AM Best" }
];

export function HeritageCarrierPartners() {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: c.white }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Our Partners</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4" style={{ color: c.primary }}>
            Top-Rated Insurance Carriers
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: c.textSecondary }}>
            As an independent agency, we work with America's most trusted and financially strong insurance companies to find you the best coverage at competitive rates.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {carriers.map((carrier, index) => (
            <motion.div
              key={carrier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 border hover:shadow-lg transition-all duration-300 group"
              style={{
                background: `linear-gradient(to bottom right, ${c.cream}, ${c.white})`,
                borderColor: c.muted
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${c.primary}15` }}
                >
                  <Shield className="w-5 h-5" style={{ color: c.primary }} />
                </div>
                <div
                  className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: `${c.secondary}25`, color: c.primary }}
                >
                  <Award className="w-3 h-3" />
                  {carrier.rating}
                </div>
              </div>
              <h3
                className="font-semibold text-sm md:text-base mb-1 transition-colors"
                style={{ color: c.primary }}
              >
                {carrier.name}
              </h3>
              <p className="text-xs" style={{ color: c.textSecondary }}>{carrier.ratingOrg} Rated</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs mt-6"
          style={{ color: c.textSecondary }}
        >
          AM Best ratings reflect financial strength and claims-paying ability. A++ and A+ are the highest ratings available.
        </motion.p>
      </div>
    </section>
  );
}
