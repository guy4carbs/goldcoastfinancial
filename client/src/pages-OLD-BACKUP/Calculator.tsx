import { Layout } from "@/components/layout/Layout";
import { CoverageCalculator } from "@/components/ui/coverage-calculator";
import { motion } from "framer-motion";

export default function Calculator() {
  return (
    <Layout>
      <section className="bg-primary relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-50 rounded-full -translate-x-1/2 translate-y-1/2" />
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Free Tool</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">
            Coverage Calculator
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover how much life insurance coverage your family needs with our personalized calculator.
          </p>
        </motion.div>
      </section>

      <CoverageCalculator />

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold font-serif text-primary mb-4">
            Need Help Understanding Your Results?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our licensed advisors are ready to review your coverage needs and find the perfect policy for your situation. Schedule a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/get-quote" className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-8 py-3 font-semibold hover:bg-secondary/90 transition-colors">
              Get a Free Quote
            </a>
            <a href="/contact" className="inline-flex items-center justify-center rounded-md border-2 border-primary text-primary px-8 py-3 font-semibold hover:bg-primary/5 transition-colors">
              Contact an Advisor
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
