/**
 * Executive Empty State
 * Heritage Design System
 */

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { GRID, TYPE, RADIUS, SHADOW, MOTION, fadeInUp } from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from '../executiveConstants';

interface ExecutiveEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ExecutiveEmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: ExecutiveEmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: GRID.spacing.xxxxl,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: RADIUS.card,
          background: EXECUTIVE_GRADIENT_CSS,
          boxShadow: SHADOW.level3,
          marginBottom: GRID.spacing.md,
        }}
      >
        <Icon style={{ width: 28, height: 28, color: 'white' }} />
      </div>
      <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.xs }}>
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="text-white font-medium"
          style={{
            marginTop: GRID.spacing.md,
            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
            borderRadius: RADIUS.button,
            background: EXECUTIVE_GRADIENT_CSS,
            boxShadow: SHADOW.level2,
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
