import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Shield, Award } from "lucide-react";

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
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold font-serif text-primary mb-2">
        <AnimatedNumber end={end} suffix={suffix} prefix={prefix} duration={duration} />
      </div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

export function AnimatedStats() {
  const stats = [
    { end: 1000, suffix: "+", label: "Families Protected", icon: <Users className="w-7 h-7" />, duration: 2000 },
    { end: 10, suffix: "M+", prefix: "$", label: "In Coverage Placed", icon: <Shield className="w-7 h-7" />, duration: 1800 },
    { end: 98, suffix: "%", label: "Client Satisfaction", icon: <Award className="w-7 h-7" />, duration: 1600 },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Trusted Results</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary">
            Why Families Trust Gold Coast
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
