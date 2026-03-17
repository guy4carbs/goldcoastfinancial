/**
 * Executive Stat Card — KPI display with delta badge
 * Heritage Design System — Orange/Blood Orange theme
 *
 * Matches Manager/Agent stat card pattern:
 * Card/CardContent, liquid glass icon badge, gradient background
 */

import { motion } from 'framer-motion';
import { type LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  LAYOUT,
  TYPE,
  RADIUS,
  MOTION,
  COLORS,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from '../executiveConstants';

// ─── DELTA BADGE ───
interface DeltaBadgeProps {
  value: number;
  format?: 'percent' | 'currency' | 'number';
  size?: 'sm' | 'md';
}

export function DeltaBadge({ value, format = 'percent', size = 'sm' }: DeltaBadgeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isPositive ? ArrowUp : isNeutral ? Minus : ArrowDown;
  const color = isPositive ? '#10b981' : isNeutral ? COLORS.gray[400] : '#ef4444';
  const bg = isPositive ? '#ecfdf5' : isNeutral ? COLORS.gray[100] : '#fef2f2';

  let display = '';
  if (format === 'percent') display = `${value > 0 ? '+' : ''}${value}%`;
  else if (format === 'currency') display = `${value > 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`;
  else display = `${value > 0 ? '+' : ''}${value}`;

  return (
    <span
      className="inline-flex items-center font-medium"
      style={{
        gap: 2,
        fontSize: size === 'sm' ? TYPE.micro : TYPE.caption,
        color,
        backgroundColor: bg,
        padding: `2px ${size === 'sm' ? 6 : 8}px`,
        borderRadius: RADIUS.pill,
      }}
    >
      <Icon style={{ width: size === 'sm' ? 10 : 12, height: size === 'sm' ? 10 : 12 }} />
      {display}
    </span>
  );
}

// ─── STAT CARD ───
interface ExecutiveStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  gradient?: string;
  delta?: number;
  deltaFormat?: 'percent' | 'currency' | 'number';
  periodLabel?: string;
  northStar?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ExecutiveStatCard({
  icon: Icon,
  value,
  label,
  gradient,
  delta,
  deltaFormat = 'percent',
  periodLabel,
  northStar,
  onClick,
  className,
}: ExecutiveStatCardProps) {
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
            ? '0 16px 32px rgba(185, 28, 28, 0.2), 0 8px 16px rgba(0, 0, 0, 0.08)'
            : '0 16px 24px rgba(0, 0, 0, 0.08)',
          ...(northStar ? { outline: '2px solid rgba(249, 115, 22, 0.3)' } : {}),
        }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: gradient || EXECUTIVE_GRADIENT_CSS }}
        />
        {/* Decorative blobs — Fibonacci 80, 50 */}
        <div
          className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3"
          style={{ width: 80, height: 80, borderRadius: RADIUS.pill }}
        />
        <div
          className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/4"
          style={{ width: 50, height: 50, borderRadius: RADIUS.pill }}
        />

        <CardContent className="px-5 py-5 relative z-10">
          {/* Row 1: Icon + Value */}
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

          {/* Row 2: Label */}
          <p className="text-white/70 mt-1.5" style={{ fontSize: TYPE.caption, fontWeight: 500 }}>
            {label}
          </p>

          {/* Row 3: Delta + Period (only if present) */}
          {(delta != null || periodLabel) && (
            <div className="flex items-center gap-2 mt-1.5">
              {delta != null && <DeltaBadge value={delta} format={deltaFormat} size="sm" />}
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

// ─── GRID WRAPPER ───
export function ExecutiveStatCardGrid({
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

export default ExecutiveStatCard;
