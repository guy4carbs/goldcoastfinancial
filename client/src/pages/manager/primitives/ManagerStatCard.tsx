/**
 * ManagerStatCard — Consistent stat card for Manager Lounge pages
 *
 * Mirrors AgentStatCard with emerald theme + gold accents:
 * - Emerald-to-teal gradient background
 * - Liquid glass icon badge with amber-200 (gold) icon tint
 * - Optional trend indicator
 * - Hover lift animation
 */

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  RADIUS,
  MOTION,
  scaleIn,
} from '@/lib/heritageDesignSystem';

export interface ManagerStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number | string;
    positive: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function ManagerStatCard({
  icon: Icon,
  value,
  label,
  trend,
  onClick,
  className,
}: ManagerStatCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer', className)}
    >
      <Card
        className="border-0 overflow-hidden relative"
        style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)' }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
        {/* Decorative blobs with amber accent */}
        <div style={{ width: 80, height: 80 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        <div style={{ width: 50, height: 50 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />

        <CardContent className="px-5 py-6 relative z-10">
          <div className="flex items-center gap-3">
            {/* Liquid Glass Icon Badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Icon className="w-5 h-5 text-amber-200 drop-shadow-sm" aria-hidden="true" />
            </div>

            {/* Value and Label */}
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/70 truncate">{label}</p>
            </div>

            {/* Optional Trend */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                  trend.positive
                    ? 'bg-white/20 text-amber-200'
                    : 'bg-white/20 text-red-200'
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-3 h-3" aria-hidden="true" />
                )}
                {trend.positive ? '+' : ''}
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

export function ManagerStatCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  );
}

export default ManagerStatCard;
