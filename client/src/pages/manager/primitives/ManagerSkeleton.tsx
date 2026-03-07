/**
 * ManagerSkeleton -- Skeleton loading primitives for Manager Lounge
 *
 * Heritage Design System -- Emerald theme:
 * - Animated pulse shimmer (bg-gray-200 -> bg-gray-100)
 * - Glass card background
 * - Matches real component layouts for seamless loading transitions
 *
 * Exports:
 * - ManagerSkeletonCard      -- Generic glass card with 3 placeholder lines
 * - ManagerSkeletonStatCards  -- 4 stat card skeletons (matches ManagerStatCardGrid)
 * - ManagerSkeletonTable      -- Table skeleton (header + 5 rows)
 * - ManagerSkeletonHero       -- Hero section skeleton
 */

import {
  LAYOUT,
  RADIUS,
  SHADOW,
  GRID,
} from '@/lib/heritageDesignSystem';
import { glassCard } from '../managerConstants';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────
 * Shared shimmer bar
 * ──────────────────────────────────────────────────────────────── */
function ShimmerBar({
  width = '100%',
  height = 14,
  className,
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        width,
        height,
        borderRadius: RADIUS.input,
        background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────
 * ManagerSkeletonCard -- Glass card shell with 3 placeholder lines
 * ──────────────────────────────────────────────────────────────── */
export function ManagerSkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(className)}
      style={{
        ...glassCard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        padding: GRID.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: GRID.spacing.sm,
      }}
    >
      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs }}>
        <div
          className="animate-pulse"
          style={{
            width: LAYOUT.icon.xxl,
            height: LAYOUT.icon.xxl,
            flexShrink: 0,
            borderRadius: RADIUS.input,
            background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <ShimmerBar width="60%" height={18} />
      </div>
      {/* Placeholder lines */}
      <ShimmerBar width="100%" height={12} />
      <ShimmerBar width="80%" height={12} />
      <ShimmerBar width="45%" height={12} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * ManagerSkeletonStatCards -- 4 stat card skeletons in a grid
 * Matches ManagerStatCardGrid layout (grid-cols-2 lg:grid-cols-4 gap-4)
 * ──────────────────────────────────────────────────────────────── */
export function ManagerSkeletonStatCards({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden relative"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 50%, #d1d5db 100%)',
            backgroundSize: '200% 100%',
          }}
        >
          <div style={{ padding: `${GRID.spacing.md}px ${GRID.spacing.md - 4}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Icon badge placeholder */}
              <div
                style={{
                  width: LAYOUT.icon.xxl,
                  height: LAYOUT.icon.xxl,
                  flexShrink: 0,
                  borderRadius: RADIUS.input,
                  background: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              {/* Value + label */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{ width: '60%', height: 22, borderRadius: RADIUS.input, background: 'rgba(255, 255, 255, 0.25)' }}
                />
                <div
                  style={{ width: '80%', height: 10, borderRadius: RADIUS.input, background: 'rgba(255, 255, 255, 0.15)' }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * ManagerSkeletonTable -- Table skeleton: header + 5 rows
 * ──────────────────────────────────────────────────────────────── */
export function ManagerSkeletonTable({ className, rows = 5 }: { className?: string; rows?: number }) {
  return (
    <div
      className={cn(className)}
      style={{
        ...glassCard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          gap: GRID.spacing.sm,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <ShimmerBar width="20%" height={12} />
        <ShimmerBar width="25%" height={12} />
        <ShimmerBar width="15%" height={12} />
        <ShimmerBar width="20%" height={12} />
        <ShimmerBar width="15%" height={12} />
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: GRID.spacing.sm,
            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
            borderBottom: i < rows - 1 ? '1px solid rgba(0, 0, 0, 0.04)' : 'none',
          }}
        >
          {/* Avatar placeholder */}
          <div
            className="animate-pulse"
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: RADIUS.pill,
              background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
              backgroundSize: '200% 100%',
            }}
          />
          <ShimmerBar width="22%" height={12} />
          <ShimmerBar width="18%" height={12} />
          <ShimmerBar width="14%" height={12} />
          <ShimmerBar width="16%" height={12} />
          <ShimmerBar width="10%" height={12} />
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * ManagerSkeletonHero -- Hero section skeleton
 * Matches ManagerPageHero layout
 * ──────────────────────────────────────────────────────────────── */
export function ManagerSkeletonHero({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse relative overflow-hidden', className)}
      style={{
        borderRadius: RADIUS.hero,
        boxShadow: SHADOW.hero,
        padding: GRID.spacing.lg,
        background: 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 50%, #d1d5db 100%)',
        backgroundSize: '200% 100%',
      }}
    >
      {/* Decorative blobs (subtle) */}
      <div
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3"
        style={{ width: 356, height: 356, borderRadius: RADIUS.pill, background: 'rgba(255, 255, 255, 0.08)' }}
      />
      <div
        className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4"
        style={{ width: 220, height: 220, borderRadius: RADIUS.pill, background: 'rgba(255, 255, 255, 0.06)' }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: GRID.spacing.sm }}>
          {/* Icon badge placeholder */}
          <div
            style={{
              width: GRID.spacing.xxxxl,
              height: GRID.spacing.xxxxl,
              flexShrink: 0,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: RADIUS.card,
            }}
          />
          {/* Title + subtitle */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
            <div
              style={{ width: '55%', height: 32, borderRadius: RADIUS.input, background: 'rgba(255, 255, 255, 0.2)' }}
            />
            <div
              style={{ width: '75%', height: 16, borderRadius: RADIUS.input, background: 'rgba(255, 255, 255, 0.12)' }}
            />
          </div>
        </div>
        {/* Action button placeholder */}
        <div
          style={{
            width: 120,
            height: LAYOUT.icon.xxl,
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: RADIUS.button,
          }}
        />
      </div>
    </div>
  );
}
