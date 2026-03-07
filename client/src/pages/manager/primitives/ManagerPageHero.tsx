/**
 * ManagerPageHero — Premium hero section for Manager Lounge pages
 *
 * Matches AgentPageHero pattern with emerald theme + gold accents:
 * - Serif title (Playfair Display)
 * - 80px liquid glass icon badge with gold icon tint
 * - Decorative floating circles with amber accent
 * - Dot pattern overlay
 * - Emerald-to-teal gradient
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  fadeInUp,
} from '@/lib/heritageDesignSystem';
import { MANAGER_GRADIENT_CSS } from '../managerConstants';

export interface ManagerPageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function ManagerPageHero({
  icon: Icon,
  title,
  subtitle,
  children,
  badge,
  className,
}: ManagerPageHeroProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn('relative overflow-hidden', className)}
      style={{
        background: MANAGER_GRADIENT_CSS,
        borderRadius: RADIUS.hero,
        boxShadow: SHADOW.hero,
        padding: GRID.spacing.lg,
      }}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative floating circles — Fibonacci sizes (89×4, 55×4, 34×4) with amber accent */}
      <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" style={{ width: 356, height: 356, borderRadius: RADIUS.pill }} />
      <div className="absolute bottom-0 left-0 bg-amber-400/20 translate-y-1/2 -translate-x-1/4 blur-md" style={{ width: 220, height: 220, borderRadius: RADIUS.pill }} />
      <div className="absolute top-1/2 right-1/4 bg-teal-300/15 blur-sm" style={{ width: 136, height: 136, borderRadius: RADIUS.pill }} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* 80px Liquid Glass Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
              delay: 0.2,
            }}
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: GRID.spacing.xxxxl,
              height: GRID.spacing.xxxxl,
              borderRadius: RADIUS.card,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Icon
              className="text-amber-200 drop-shadow-sm"
              style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Title and subtitle */}
          <div className="flex-1">
            {badge && (
              <div className="flex items-center gap-3 flex-wrap mb-1">
                {badge}
              </div>
            )}
            <h1
              className="font-bold tracking-tight text-white font-serif"
              style={{
                fontSize: TYPE.display,
                marginBottom: GRID.spacing.xs,
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            <p
              className="text-white/90 max-w-xl"
              style={{ fontSize: TYPE.body, lineHeight: 1.5 }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Optional action buttons */}
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ManagerPageHero;
