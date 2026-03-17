/**
 * RadioCardGroup — Selectable radio card group
 * Heritage-styled grid of selectable cards with optional icons
 */

import { motion } from 'framer-motion';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';
import type { LucideIcon } from 'lucide-react';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  selected: string;
  onChange: (value: string) => void;
  columns?: number;
}

export function RadioCardGroup({
  options,
  selected,
  onChange,
  columns = 2,
}: RadioCardGroupProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: GRID.spacing.sm,
      }}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.easing,
            }}
            className="text-left transition-colors"
            style={{
              borderRadius: RADIUS.button,
              border: `2px solid ${
                isSelected
                  ? COLORS.primary.violet[500]
                  : COLORS.gray[200]
              }`,
              backgroundColor: isSelected
                ? COLORS.primary.violet[50]
                : 'white',
              padding: GRID.spacing.md,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Icon && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: GRID.spacing.xs,
                }}
              >
                <Icon
                  size={24}
                  style={{
                    color: isSelected
                      ? COLORS.primary.violet[600]
                      : COLORS.gray[400],
                  }}
                />
              </div>
            )}

            <p
              style={{
                fontSize: TYPE.meta,
                fontWeight: 600,
                color: isSelected
                  ? COLORS.primary.violet[800]
                  : COLORS.gray[800],
                lineHeight: TYPE.lineHeight,
              }}
            >
              {option.label}
            </p>

            {option.description && (
              <p
                style={{
                  fontSize: TYPE.micro,
                  color: COLORS.gray[500],
                  lineHeight: TYPE.lineHeight,
                  marginTop: 4,
                }}
              >
                {option.description}
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
