import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { HeritageCoverageCalculator } from "@/components/ui/heritage-coverage-calculator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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

export default function HeritageCalculator() {
  return (
    <HeritageLayout>
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: c.primary }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryHover})` }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: `${c.secondary}10` }} />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Free Tool</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">
            Coverage Calculator
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover how much life insurance coverage your family needs with our personalized calculator.
          </p>
        </motion.div>
      </section>

      <HeritageCoverageCalculator />

      <section className="py-16" style={{ backgroundColor: c.cream }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: c.primary }}>
            Need Help Understanding Your Results?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto" style={{ color: c.textSecondary }}>
            Our licensed advisors are ready to review your coverage needs and find the perfect policy for your situation. Schedule a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/heritage/get-quote">
              <Button className="px-8 py-3 font-semibold" style={{ backgroundColor: c.secondary, color: c.textPrimary }}>
                Get a Free Quote
              </Button>
            </Link>
            <Link href="/heritage/contact">
              <Button variant="outline" className="px-8 py-3 font-semibold" style={{ borderColor: c.primary, color: c.primary }}>
                Contact an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </HeritageLayout>
  );
}
