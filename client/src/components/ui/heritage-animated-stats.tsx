import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Shield, Award } from "lucide-react";

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

interface StatProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
  duration?: number;
}

function AnimatedNumber({ end, suffix = "", prefix = "", duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ end, suffix = "", prefix = "", label, icon, duration = 2000 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="text-center group"
    >
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: `${c.secondary}20`, color: c.secondary }}
      >
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold font-serif mb-2" style={{ color: c.primary }}>
        <AnimatedNumber end={end} suffix={suffix} prefix={prefix} duration={duration} />
      </div>
      <p className="font-medium" style={{ color: c.textSecondary }}>{label}</p>
    </motion.div>
  );
}

export function HeritageAnimatedStats() {
  const stats = [
    { end: 1000, suffix: "+", label: "Families Protected", icon: <Users className="w-7 h-7" />, duration: 2000 },
    { end: 10, suffix: "M+", prefix: "$", label: "In Coverage Placed", icon: <Shield className="w-7 h-7" />, duration: 1800 },
    { end: 98, suffix: "%", label: "Client Satisfaction", icon: <Award className="w-7 h-7" />, duration: 1600 },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: `linear-gradient(to bottom, ${c.white}, ${c.background})` }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
            <span className="font-medium tracking-wide uppercase text-sm" style={{ color: c.secondary }}>Trusted Results</span>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: c.secondary }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif" style={{ color: c.primary }}>
            Why Families Trust Heritage Life Solutions
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
