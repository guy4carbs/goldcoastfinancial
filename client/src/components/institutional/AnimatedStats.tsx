import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
}

interface AnimatedStatsProps {
  stats: StatItem[];
  variant?: "light" | "dark";
  className?: string;
  columns?: 2 | 3 | 4;
}

function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 2000
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out quint for smooth deceleration
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      setCount(Math.floor(easeOutQuint * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function AnimatedStats({
  stats,
  variant = "light",
  className = "",
  columns = 4
}: AnimatedStatsProps) {
  const isDark = variant === "dark";

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={className}>
      <div className={`grid ${gridCols[columns]} gap-8 md:gap-12`}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <p className={`text-4xl md:text-5xl font-serif font-medium mb-2 ${
              isDark ? "text-white" : "text-primary"
            }`}>
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                duration={2000 + index * 200}
              />
            </p>
            <p className={`text-sm uppercase tracking-wider font-medium mb-1 ${
              isDark ? "text-secondary" : "text-primary"
            }`}>
              {stat.label}
            </p>
            {stat.description && (
              <p className={`text-xs ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
                {stat.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const companyStats: StatItem[] = [
  { value: 2022, label: "Founded", description: "Naperville, IL" },
  { value: 50, label: "States Licensed", description: "Nationwide coverage" },
  { value: 30, suffix: "+", label: "Carrier Partners", description: "A-rated insurers" },
  { value: 1000, suffix: "+", label: "Families Served", description: "And growing" },
];

export const investorStats: StatItem[] = [
  { value: 10, prefix: "$", suffix: "M+", label: "Premium Written", description: "Annual volume" },
  { value: 98, suffix: "%", label: "Client Retention", description: "Year over year" },
  { value: 15, suffix: "+", label: "Years Experience", description: "Leadership team" },
  { value: 4.9, suffix: "/5", label: "Client Rating", description: "Average satisfaction" },
];
