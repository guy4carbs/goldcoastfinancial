/**
 * ClientStatCard — Gradient stat card for Client Lounge
 *
 * Violet-to-amber gradient background with liquid glass icon badge.
 * Clean layout with optional trend display and period context.
 */

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  LAYOUT,
  TYPE,
  RADIUS,
  MOTION,
  scaleIn,
} from '@/lib/heritageDesignSystem';

export interface ClientStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number | string;
    positive: boolean;
    label?: string;
  };
  periodLabel?: string;
  northStar?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ClientStatCard({
  icon: Icon,
  value,
  label,
  trend,
  periodLabel,
  northStar,
  onClick,
  className,
}: ClientStatCardProps) {
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
        style={{
          borderRadius: RADIUS.card,
          boxShadow: northStar
            ? '0 16px 32px rgba(245, 158, 11, 0.2), 0 8px 16px rgba(0, 0, 0, 0.08)'
            : '0 16px 24px rgba(0, 0, 0, 0.08)',
          ...(northStar ? { outline: '2px solid rgba(245, 158, 11, 0.3)' } : {}),
        }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3" style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} />
        <div className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/4" style={{ width: 50, height: 50, borderRadius: RADIUS.pill }} />

        <CardContent className="px-5 py-5 relative z-10">
          {/* Row 1: Icon + Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: LAYOUT.icon.xxl,
                  height: LAYOUT.icon.xxl,
                  borderRadius: RADIUS.input,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Icon className="text-amber-200 drop-shadow-sm" size={LAYOUT.icon.md} aria-hidden="true" />
              </div>
              <p className="font-bold text-white" style={{ fontSize: TYPE.section, lineHeight: 1.1 }}>
                {value}
              </p>
            </div>
          </div>

          {/* Row 2: Label */}
          <p className="text-white/70 mt-1.5" style={{ fontSize: TYPE.caption, fontWeight: 500 }}>
            {label}
          </p>

          {/* Row 3: Trend + Period (only if present) */}
          {(trend || periodLabel) && (
            <div className="flex items-center gap-2 mt-1.5">
              {trend && (
                <span
                  className={cn(
                    'flex items-center gap-1 font-semibold',
                    trend.positive ? 'text-amber-200' : 'text-red-200',
                  )}
                  style={{ fontSize: TYPE.caption }}
                >
                  {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {trend.positive ? '+' : ''}{trend.value}
                </span>
              )}
              {periodLabel && (
                <span className="text-white/40" style={{ fontSize: TYPE.micro }}>
                  {periodLabel}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClientStatCardGrid({
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

export default ClientStatCard;
