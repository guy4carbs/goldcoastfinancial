/**
 * Executive Skeleton Loaders
 * Heritage Design System — Loading placeholders
 */

import { RADIUS, SHADOW, GRID } from '@/lib/heritageDesignSystem';
import { glassCard } from '../executiveConstants';

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} style={style} />;
}

export function ExecutiveSkeletonHero() {
  return (
    <div
      className="animate-pulse"
      style={{
        borderRadius: RADIUS.hero,
        height: 200,
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      }}
    />
  );
}

export function ExecutiveSkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            borderRadius: RADIUS.card,
            height: 140,
            background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
          }}
        />
      ))}
    </div>
  );
}

export function ExecutiveSkeletonCard({ height = 300 }: { height?: number }) {
  return (
    <div
      style={{
        ...glassCard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        padding: GRID.spacing.md,
        height,
      }}
    >
      <Pulse style={{ width: '40%', height: 20, marginBottom: 8, borderRadius: RADIUS.button }} />
      <Pulse style={{ width: '60%', height: 14, marginBottom: 24, borderRadius: RADIUS.button }} />
      <Pulse style={{ width: '100%', height: height - 120, borderRadius: RADIUS.button }} />
    </div>
  );
}

export function ExecutiveSkeletonTable() {
  return (
    <div
      style={{
        ...glassCard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        padding: GRID.spacing.md,
      }}
    >
      <Pulse style={{ width: '30%', height: 20, marginBottom: 16, borderRadius: RADIUS.button }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <Pulse style={{ width: 40, height: 40, borderRadius: RADIUS.button }} />
          <div className="flex-1">
            <Pulse style={{ width: '50%', height: 14, marginBottom: 6, borderRadius: RADIUS.button }} />
            <Pulse style={{ width: '30%', height: 10, borderRadius: RADIUS.button }} />
          </div>
          <Pulse style={{ width: 60, height: 14, borderRadius: RADIUS.button }} />
        </div>
      ))}
    </div>
  );
}
