import { motion } from "framer-motion";
import { Shield, Award, CheckCircle, Building2 } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Fully Licensed",
    description: "All 50 States",
  },
  {
    icon: Award,
    title: "A+ Rating",
    description: "BBB Accredited",
  },
  {
    icon: CheckCircle,
    title: "SEC Compliant",
    description: "Regulatory Standing",
  },
  {
    icon: Building2,
    title: "Est. 2025",
    description: "Naperville, IL",
  },
];

interface TrustIndicatorsProps {
  variant?: "light" | "dark";
  className?: string;
}

export function TrustIndicators({ variant = "light", className = "" }: TrustIndicatorsProps) {
  const isDark = variant === "dark";

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
      >
        {indicators.map((indicator, index) => (
          <motion.div
            key={indicator.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              isDark ? "bg-white/10" : "bg-primary/10"
            }`}>
              <indicator.icon className={`w-6 h-6 ${isDark ? "text-secondary" : "text-primary"}`} />
            </div>
            <h4 className={`font-medium mb-1 ${isDark ? "text-white" : "text-primary"}`}>
              {indicator.title}
            </h4>
            <p className={`text-sm ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
              {indicator.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Compact inline version for headers/footers
export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-primary" />
        <span>Licensed in 50 States</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Award className="w-4 h-4 text-primary" />
        <span>BBB A+ Rated</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>SEC Compliant</span>
      </div>
    </div>
  );
}
