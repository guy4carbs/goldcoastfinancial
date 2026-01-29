import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
  showValue?: boolean;
  valueClassName?: string;
  children?: React.ReactNode;
  animate?: boolean;
  duration?: number;
  color?: "primary" | "accent" | "success" | "warning" | "danger";
}

const colorMap = {
  primary: "stroke-primary",
  accent: "stroke-violet-500",
  success: "stroke-green-500",
  warning: "stroke-amber-500",
  danger: "stroke-red-500"
};

const trackColorMap = {
  primary: "stroke-primary/20",
  accent: "stroke-violet-500/20",
  success: "stroke-green-500/20",
  warning: "stroke-amber-500/20",
  danger: "stroke-red-500/20"
};

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  className,
  trackClassName,
  progressClassName,
  showValue = true,
  valueClassName,
  children,
  animate = true,
  duration = 1,
  color = "accent"
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayValue / 100) * circumference;

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    requestAnimationFrame(animateValue);
  }, [value, animate, duration]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn(trackColorMap[color], trackClassName)}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colorMap[color], progressClassName)}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showValue ? (
          <span className={cn(
            "font-bold text-primary",
            size <= 60 ? "text-sm" : size <= 80 ? "text-lg" : "text-xl",
            valueClassName
          )}>
            {Math.round(displayValue)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

// Mini version for compact spaces
export function CircularProgressMini({
  value,
  size = 32,
  strokeWidth = 3,
  color = "accent",
  className
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: CircularProgressProps["color"];
  className?: string;
}) {
  return (
    <CircularProgress
      value={value}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showValue={false}
      animate={true}
      duration={0.8}
      className={className}
    />
  );
}
