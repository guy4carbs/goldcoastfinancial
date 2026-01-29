import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  variant?: 'default' | 'primary' | 'gold' | 'accent';
  showValue?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { size: 40, fontSize: 'text-xs' },
  md: { size: 60, fontSize: 'text-sm' },
  lg: { size: 80, fontSize: 'text-base' },
  xl: { size: 120, fontSize: 'text-xl' },
};

const variantColors = {
  default: { track: '#e5e7eb', fill: '#7C7CFF' },
  primary: { track: '#e5e7eb', fill: '#292966' },
  gold: { track: '#fef3c7', fill: '#E1B138' },
  accent: { track: '#ede9fe', fill: '#7C7CFF' },
};

export function ProgressRing({
  value,
  size = 'md',
  strokeWidth = 4,
  variant = 'default',
  showValue = true,
  label,
  className,
}: ProgressRingProps) {
  const config = sizeConfig[size];
  const colors = variantColors[variant];
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const radius = (config.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={colors.track}
          strokeWidth={strokeWidth}
        />
        {/* Progress fill */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={colors.fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center content */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn("font-bold text-primary", config.fontSize)}>
              {Math.round(normalizedValue)}%
            </span>
          )}
          {label && (
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
