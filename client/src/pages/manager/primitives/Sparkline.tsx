/**
 * Sparkline — Smooth inline trend visualization
 * Heritage Design System — Emerald theme
 *
 * SVG path with cubic bezier curves for smooth rendering.
 * Auto-colors based on trend direction (emerald up, rose down).
 */

import { useId } from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showEndDot?: boolean;
  strokeWidth?: number;
  autoColor?: boolean;
  className?: string;
}

/**
 * Build a smooth cubic bezier SVG path through the given points.
 * Uses Catmull-Rom → Bezier conversion for natural curves.
 */
function smoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length < 2) return '';
  if (coords.length === 2) {
    return `M${coords[0].x},${coords[0].y} L${coords[1].x},${coords[1].y}`;
  }

  let d = `M${coords[0].x},${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];

    // Catmull-Rom to Bezier control points (tension = 0.35)
    const t = 0.35;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

export function Sparkline({
  data,
  width = 64,
  height = 20,
  color,
  showArea = false,
  showEndDot = true,
  strokeWidth = 1.5,
  autoColor = true,
  className,
}: SparklineProps) {
  const id = useId();

  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 3;

  const trending = data[data.length - 1] >= data[0];
  const strokeColor = color ?? (autoColor ? (trending ? '#10b981' : '#f43f5e') : '#10b981');

  const coords = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - pad * 2) - pad,
  }));

  const last = coords[coords.length - 1];
  const linePath = smoothPath(coords);

  // Area: close the smooth path back to bottom
  const areaPath = showArea
    ? `${linePath} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`
    : undefined;

  const gradientId = `sparkline-${id}`;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ flexShrink: 0 }}
      role="img"
      aria-label={`Trend ${trending ? 'up' : 'down'}`}
    >
      {showArea && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
        </>
      )}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && (
        <circle cx={last.x} cy={last.y} r={2} fill={strokeColor} />
      )}
    </svg>
  );
}

export default Sparkline;
