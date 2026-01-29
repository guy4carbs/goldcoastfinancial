import { motion } from "framer-motion";
import { Shield, Award } from "lucide-react";

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

export function CarrierPartners() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Our Partners</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
            Top-Rated Insurance Carriers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-violet-200/30 transition-all duration-300 group"
              data-testid={`card-carrier-${carrier.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-violet-100 text-xs font-bold px-2 py-1 rounded-full text-primary flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {carrier.rating}
                </div>
              </div>
              <h3 className="font-semibold text-primary text-sm md:text-base mb-1 group-hover:text-secondary transition-colors">
                {carrier.name}
              </h3>
              <p className="text-xs text-muted-foreground">{carrier.ratingOrg} Rated</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          AM Best ratings reflect financial strength and claims-paying ability. A++ and A+ are the highest ratings available.
        </motion.p>
      </div>
    </section>
  );
}
