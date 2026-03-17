/**
 * StepCard — Professional card wrapper for onboarding step sections
 * Consistent Heritage-styled card with icon, title, and optional subtitle
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GRID, TYPE, RADIUS, SHADOW, COLORS, GLASS } from '@/lib/heritageDesignSystem';

interface StepCardProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  accentColor?: string;
}

export function StepCard({
  icon: Icon,
  title,
  subtitle,
  children,
  accentColor = COLORS.primary.violet[600],
}: StepCardProps) {
  return (
    <Card
      className="border-0"
      style={{
        ...GLASS.css.light,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        overflow: 'hidden',
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${accentColor}, ${COLORS.primary.violet[400]})`,
        }}
      />
      <CardContent style={{ padding: GRID.spacing.lg }}>
        {(Icon || title) && (
          <div className="flex items-center gap-3 mb-5">
            {Icon && (
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.button,
                  backgroundColor: `${accentColor}12`,
                }}
              >
                <Icon size={20} style={{ color: accentColor }} />
              </div>
            )}
            <div>
              {title && (
                <h2
                  style={{
                    fontSize: TYPE.title,
                    fontWeight: 700,
                    color: COLORS.gray[900],
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: TYPE.caption,
                    color: COLORS.gray[500],
                    marginTop: 2,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
