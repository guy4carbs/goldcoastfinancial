/**
 * ManagerEmptyState -- Reusable empty state component for Manager Lounge
 *
 * Heritage Design System -- Emerald theme:
 * - Centered glass card layout
 * - Large icon (48px, gray-300) to signal the empty context
 * - Title (TYPE.title, gray-700) + description (TYPE.meta, gray-500)
 * - Optional emerald gradient action button
 *
 * Usage:
 *   <ManagerEmptyState
 *     icon={Users}
 *     title="No team members yet"
 *     description="Add agents to your team to see performance data here."
 *     actionLabel="Add Agent"
 *     onAction={() => navigate('/add-agent')}
 *   />
 */

import { LucideIcon } from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  TYPE,
  GRID,
} from '@/lib/heritageDesignSystem';
import { glassCard } from '../managerConstants';
import { cn } from '@/lib/utils';

export interface ManagerEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ManagerEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: ManagerEmptyStateProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: GRID.spacing.xl,
      }}
    >
      <div
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: GRID.spacing.xl,
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: GRID.spacing.sm,
        }}
      >
        {/* Icon -- 48px, gray-300 */}
        <Icon
          style={{ width: 48, height: 48, color: '#d1d5db' }}
          aria-hidden="true"
          strokeWidth={1.5}
        />

        {/* Title */}
        <h3
          style={{
            fontSize: TYPE.title,
            fontWeight: 700,
            color: '#374151', // gray-700
            lineHeight: TYPE.lineHeight,
            margin: 0,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: TYPE.meta,
            color: '#6b7280', // gray-500
            lineHeight: TYPE.lineHeight,
            margin: 0,
            maxWidth: 340,
          }}
        >
          {description}
        </p>

        {/* Optional action button -- emerald gradient */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              marginTop: GRID.spacing.xs,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
              borderRadius: RADIUS.button,
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              color: '#ffffff',
              fontSize: TYPE.meta,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              transition: 'transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.35)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.25)';
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default ManagerEmptyState;
