/**
 * ReviewSection — Expandable review card with edit button
 * Used in the Review & Submit step to display section summaries
 */

import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ReviewSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  onEdit: () => void;
}

export function ReviewSection({
  title,
  icon: Icon,
  children,
  onEdit,
}: ReviewSectionProps) {
  return (
    <div
      className="border border-gray-200 bg-white"
      style={{
        borderRadius: RADIUS.button,
        padding: GRID.spacing.md,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            size={20}
            style={{ color: COLORS.primary.violet[600] }}
          />
          <h3
            style={{
              fontSize: TYPE.meta,
              fontWeight: 700,
              color: COLORS.gray[800],
              lineHeight: TYPE.lineHeight,
            }}
          >
            {title}
          </h3>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="flex items-center gap-1"
          style={{
            fontSize: TYPE.micro,
            color: COLORS.primary.violet[600],
          }}
        >
          <Pencil size={14} />
          Edit
        </Button>
      </div>

      {/* Content */}
      <div style={{ marginTop: GRID.spacing.sm }}>{children}</div>
    </div>
  );
}
