/**
 * Admin Heritage Primitives
 * Shared reusable components for admin lounge pages
 * Following Heritage Design System patterns from AgentLoungeLayout
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import {
  GLASS,
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  GRID,
  COLORS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';

// ============================================
// ADMIN GRADIENT CONSTANT
// ============================================
export const ADMIN_GRADIENT = 'linear-gradient(135deg, #475569 0%, #334155 50%, #64748b 100%)';

// ============================================
// ADMIN PAGE HERO
// ============================================
interface AdminPageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function AdminPageHero({ icon: Icon, title, subtitle, actions, children }: AdminPageHeroProps) {
  return (
    <motion.div
      variants={fadeInUp}
      style={{
        background: ADMIN_GRADIENT,
        borderRadius: RADIUS.hero,
        padding: `${GRID.spacing.xl}px`,
        boxShadow: SHADOW.hero,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          left: '40%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}
      />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: RADIUS.button,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
              flexShrink: 0,
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 style={{ fontSize: TYPE.hero, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              {title}
            </h1>
            <p style={{ fontSize: TYPE.body, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
              {subtitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
    </motion.div>
  );
}

// ============================================
// ADMIN GLASS CARD
// ============================================
interface AdminGlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function AdminGlassCard({ children, className, hover = false, style }: AdminGlassCardProps) {
  const baseStyle: React.CSSProperties = {
    ...GLASS.css.standard,
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.card,
    ...style,
  };

  if (hover) {
    return (
      <motion.div
        variants={fadeInUp}
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
        className={className}
        style={baseStyle}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className={className}
      style={baseStyle}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ADMIN SECTION HEADER
// ============================================
interface AdminSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  iconColor?: string;
  actions?: ReactNode;
}

export function AdminSectionHeader({ icon: Icon, title, iconColor = 'text-slate-500', actions }: AdminSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2" style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        {title}
      </h2>
      {actions}
    </div>
  );
}

// ============================================
// ADMIN STAT CARD
// ============================================
interface AdminStatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  value: string | number;
  label: string;
  sub?: string;
}

export function AdminStatCard({ icon: Icon, iconColor = 'text-slate-500', value, label, sub }: AdminStatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
      style={{
        ...GLASS.css.standard,
        borderRadius: RADIUS.card,
        padding: GRID.spacing.md,
        boxShadow: SHADOW.card,
        cursor: 'default',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>{label}</h3>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ============================================
// ADMIN STAT CARD GRID
// ============================================
interface AdminStatCardGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}

export function AdminStatCardGrid({ children, cols = 4 }: AdminStatCardGridProps) {
  const colsClass = cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return (
    <motion.div
      className={`grid ${colsClass} gap-4`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ADMIN STAGGER CONTAINER
// ============================================
interface AdminStaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function AdminStaggerContainer({ children, className }: AdminStaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className || 'max-w-7xl mx-auto'}
      style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ADMIN GLASS TOOLBAR (for editor pages)
// ============================================
interface AdminGlassToolbarProps {
  children: ReactNode;
}

export function AdminGlassToolbar({ children }: AdminGlassToolbarProps) {
  return (
    <div
      className="sticky top-0 z-10"
      style={{
        ...GLASS.css.light,
        borderBottom: `1px solid ${GLASS.border}`,
        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
        borderRadius: 0,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// ADMIN EMPTY STATE
// ============================================
interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: COLORS.gray[400] }} />
      <p className="font-medium" style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>{title}</p>
      {description && (
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 4 }}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
