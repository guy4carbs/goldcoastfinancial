/**
 * Executive Page Hero — Consistent hero section for all Executive Lounge pages
 * Heritage Design System — Orange/Amber theme
 */

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from '../executiveConstants';

interface ExecutivePageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function ExecutivePageHero({ icon: Icon, title, subtitle, children, badge, className }: ExecutivePageHeroProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden"
        style={{
          borderRadius: RADIUS.hero,
          padding: GRID.spacing.xl,
          boxShadow: SHADOW.hero,
          background: EXECUTIVE_GRADIENT_CSS,
        }}
      >
        {/* Decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Decorative floating circles (Fibonacci sizes) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow, delay: 0.1 }}
          className="absolute bg-white/10 rounded-full blur-sm pointer-events-none"
          style={{ top: 0, right: 0, width: 356, height: 356, transform: 'translate(30%, -50%)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow, delay: 0.2 }}
          className="absolute bg-amber-400/20 rounded-full blur-md pointer-events-none"
          style={{ bottom: 0, left: 0, width: 136, height: 136, transform: 'translate(-25%, 50%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
              style={{
                width: GRID.spacing.xxxxl,
                height: GRID.spacing.xxxxl,
                borderRadius: RADIUS.card,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Icon className="text-amber-200" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} />
            </motion.div>

            <div className="flex-1">
              {badge && <div style={{ marginBottom: GRID.spacing.xs }}>{badge}</div>}
              <h1
                className="font-bold tracking-tight text-white font-serif"
                style={{ fontSize: TYPE.display, lineHeight: 1.1, marginBottom: GRID.spacing.xs }}
              >
                {title}
              </h1>
              <p className="text-white/85 max-w-xl" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Action buttons slot */}
          {children && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {children}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ExecutivePageHero;
