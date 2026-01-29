import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'gold' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const variantClasses = {
  default: {
    container: 'bg-white border border-gray-100',
    icon: 'bg-gray-100 text-gray-600',
    value: 'text-primary',
    label: 'text-gray-500',
  },
  primary: {
    container: 'bg-primary text-white',
    icon: 'bg-white/20 text-white',
    value: 'text-white',
    label: 'text-white/70',
  },
  gold: {
    container: 'bg-gradient-to-br from-[#E1B138] to-[#c49a2f] text-primary',
    icon: 'bg-white/30 text-primary',
    value: 'text-primary',
    label: 'text-primary/70',
  },
  accent: {
    container: 'bg-gradient-to-br from-violet-500 to-violet-200 text-white',
    icon: 'bg-white/20 text-white',
    value: 'text-white',
    label: 'text-white/70',
  },
};

const sizeClasses = {
  sm: {
    container: 'p-3 rounded-lg',
    icon: 'w-8 h-8',
    iconSize: 'w-4 h-4',
    value: 'text-lg',
    label: 'text-[10px]',
  },
  md: {
    container: 'p-4 rounded-xl',
    icon: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    value: 'text-2xl',
    label: 'text-xs',
  },
  lg: {
    container: 'p-6 rounded-2xl',
    icon: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    value: 'text-3xl',
    label: 'text-sm',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  size = 'md',
  className,
  animate = true,
}: StatCardProps) {
  const variantStyle = variantClasses[variant];
  const sizeStyle = sizeClasses[size];

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-500'
      : trend.value < 0
        ? 'text-red-500'
        : 'text-gray-400'
    : '';

  const Container = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Container
      className={cn(
        variantStyle.container,
        sizeStyle.container,
        "shadow-sm",
        className
      )}
      {...animationProps}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(sizeStyle.label, variantStyle.label, "font-medium uppercase tracking-wide mb-1")}>
            {label}
          </p>
          <p className={cn(sizeStyle.value, variantStyle.value, "font-bold font-mono")}>
            {value}
          </p>
          {trend && TrendIcon && (
            <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-[10px] font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
                {trend.label && <span className="text-gray-400 ml-1">{trend.label}</span>}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "rounded-lg flex items-center justify-center flex-shrink-0",
            sizeStyle.icon,
            variantStyle.icon
          )}>
            <Icon className={sizeStyle.iconSize} />
          </div>
        )}
      </div>
    </Container>
  );
}

export default StatCard;
