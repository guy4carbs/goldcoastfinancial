/**
 * AgentStatCard - Consistent stat card for Agent Lounge pages
 *
 * Uses Heritage Design System tokens for consistent styling across all pages.
 */

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  RADIUS,
  SHADOW,
  MOTION,
  scaleIn,
} from "@/lib/heritageDesignSystem";

export interface AgentStatCardProps {
  /** The icon to display in the stat badge */
  icon: LucideIcon;
  /** The main value to display */
  value: string | number;
  /** Label describing the stat */
  label: string;
  /** Gradient for the icon badge (e.g., "from-violet-500 to-purple-600") */
  gradient?: string;
  /** Optional trend indicator */
  trend?: {
    value: number | string;
    positive: boolean;
    label?: string;
  };
  /** Optional click handler */
  onClick?: () => void;
  /** Optional custom className */
  className?: string;
}

/**
 * AgentStatCard provides a consistent stat display for all Agent Lounge pages.
 *
 * Features:
 * - Gradient icon badge
 * - Optional trend indicator
 * - Hover animations
 * - Consistent styling with Heritage Design System
 *
 * @example
 * ```tsx
 * <AgentStatCard
 *   icon={Phone}
 *   value={42}
 *   label="Calls Today"
 *   gradient="from-blue-500 to-cyan-500"
 *   trend={{ value: 12, positive: true, label: "vs yesterday" }}
 * />
 * ```
 */
export function AgentStatCard({
  icon: Icon,
  value,
  label,
  gradient = "from-violet-500 to-purple-600",
  trend,
  onClick,
  className,
}: AgentStatCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
      onClick={onClick}
      className={cn(onClick && "cursor-pointer", className)}
    >
      <Card
        className="border-0 overflow-hidden relative"
        style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
        {/* Decorative blobs */}
        <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Icon Badge */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/20 backdrop-blur">
              <Icon className="w-5 h-5 text-amber-200" aria-hidden="true" />
            </div>

            {/* Value and Label */}
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-white">
                {value}
              </p>
              <p className="text-xs text-white/70 truncate">{label}</p>
            </div>

            {/* Optional Trend */}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  trend.positive
                    ? "bg-white/20 text-emerald-200"
                    : "bg-white/20 text-red-200"
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-3 h-3" aria-hidden="true" />
                )}
                {trend.positive ? "+" : ""}
                {trend.value}
                {trend.label && (
                  <span className="hidden sm:inline ml-0.5 text-white/50 font-normal">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * AgentStatCardGrid - A grid container for stat cards
 *
 * @example
 * ```tsx
 * <AgentStatCardGrid>
 *   <AgentStatCard ... />
 *   <AgentStatCard ... />
 * </AgentStatCardGrid>
 * ```
 */
export function AgentStatCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}

export default AgentStatCard;
