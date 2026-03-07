/**
 * DeltaBadge — Period-over-period change indicator
 * Heritage Design System — Emerald theme
 *
 * Shows +12.3% ↑ (green) or -5.2% ↓ (red) with pill styling.
 * Used in stat cards and table rows.
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { RADIUS, TYPE, LAYOUT } from '@/lib/heritageDesignSystem';

export interface DeltaBadgeProps {
  value: number;
  format?: 'percent' | 'currency' | 'number';
  size?: 'sm' | 'md';
  className?: string;
}

export function DeltaBadge({
  value,
  format = 'percent',
  size = 'sm',
  className,
}: DeltaBadgeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const absVal = Math.abs(value);

  let display: string;
  if (format === 'currency') {
    display = `$${absVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
  } else if (format === 'percent') {
    display = `${absVal.toFixed(1)}%`;
  } else {
    display = absVal.toLocaleString();
  }

  const prefix = isNeutral ? '' : isPositive ? '+' : '-';
  const iconSize = size === 'sm' ? LAYOUT.icon.xs - 2 : LAYOUT.icon.xs;
  const fontSize = size === 'sm' ? TYPE.caption : TYPE.meta;

  const bgColor = isNeutral ? '#f3f4f6' : isPositive ? '#ecfdf5' : '#fef2f2';
  const textColor = isNeutral ? '#6b7280' : isPositive ? '#047857' : '#b91c1c';

  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '1px 6px',
        borderRadius: RADIUS.pill,
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {prefix}{display}
    </span>
  );
}

export default DeltaBadge;
