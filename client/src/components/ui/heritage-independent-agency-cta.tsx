import { motion } from "framer-motion";
import { CheckCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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

export function HeritageIndependentAgencyCTA() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rounded-2xl p-6 md:p-8"
      style={{ background: `linear-gradient(to right, ${c.primary}10, ${c.secondary}15, ${c.primary}10)` }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold font-serif mb-2" style={{ color: c.primary }}>
              Why Work With an Independent Agency?
            </h3>
            <p className="text-sm" style={{ color: c.textSecondary }}>
              Unlike captive agents who can only offer one company's products, we compare quotes from multiple top-rated carriers to find you the best coverage at the best price.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: c.white }}>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium" style={{ color: c.textPrimary }}>Unbiased Advice</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: c.white }}>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium" style={{ color: c.textPrimary }}>More Options</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: c.white }}>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium" style={{ color: c.textPrimary }}>Better Rates</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t" style={{ borderColor: `${c.primary}15` }}>
          <div className="flex items-start gap-3 flex-1">
            <Quote className="w-5 h-5 shrink-0 mt-1" style={{ color: c.secondary }} />
            <p className="text-sm italic" style={{ color: c.textSecondary }}>
              "I was paying $180/month with my old agent. Heritage Life Solutions found me the same coverage for $95. That's over $1,000 saved every year!"
              <span className="block text-xs mt-1 not-italic" style={{ color: c.muted }}>— Michael R., San Diego</span>
            </p>
          </div>
          <Link href="/heritage/get-quote">
            <Button className="whitespace-nowrap" style={{ backgroundColor: c.primary, color: c.white }}>
              Compare Quotes Free
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
