import { motion } from "framer-motion";
import { CheckCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function IndependentAgencyCTA() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold font-serif text-primary mb-2">
              Why Work With an Independent Agency?
            </h3>
            <p className="text-muted-foreground text-sm">
              Unlike captive agents who can only offer one company's products, we compare quotes from multiple top-rated carriers to find you the best coverage at the best price.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Unbiased Advice</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">More Options</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Better Rates</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-primary/10">
          <div className="flex items-start gap-3 flex-1">
            <Quote className="w-5 h-5 text-secondary shrink-0 mt-1" />
            <p className="text-sm text-foreground/80 italic">
              "I was paying $180/month with my old agent. Gold Coast found me the same coverage for $95. That's over $1,000 saved every year!"
              <span className="block text-xs text-muted-foreground mt-1 not-italic">— Michael R., San Diego</span>
            </p>
          </div>
          <Link href="/get-quote">
            <Button className="bg-primary text-white hover:bg-primary/90 whitespace-nowrap" data-testid="button-independent-cta">
              Compare Quotes Free
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
