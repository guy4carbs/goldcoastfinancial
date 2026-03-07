/**
 * ProgressRing — Radial/donut progress indicator
 * Heritage Design System — Emerald theme
 *
 * SVG circle with animated stroke-dashoffset.
 * Used for quota attainment, goal progress, compliance scores.
 */

import { useEffect, useState } from 'react';
import { TYPE } from '@/lib/heritageDesignSystem';

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = '#10b981',
  trackColor = '#e5e7eb',
  label,
  sublabel,
  animate = true,
  className,
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(animate ? 0 : value);
  const clampedValue = Math.min(100, Math.max(0, animatedValue));

  useEffect(() => {
    if (!animate) {
      setAnimatedValue(value);
      return;
    }
    const timeout = setTimeout(() => setAnimatedValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value, animate]);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const displayLabel = label ?? `${Math.round(value)}%`;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animate ? 'stroke-dashoffset 0.5s ease-out' : 'none',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Center label */}
        <text
          x={center}
          y={sublabel ? center - 4 : center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#111827"
          fontSize={size <= 48 ? TYPE.caption : TYPE.meta}
          fontWeight={700}
        >
          {displayLabel}
        </text>
        {sublabel && (
          <text
            x={center}
            y={center + (size <= 48 ? 10 : 14)}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#9ca3af"
            fontSize={TYPE.micro}
            fontWeight={500}
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
}

export default ProgressRing;
