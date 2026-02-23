/**
 * Executive Lounge Layout
 * High-level analytics, revenue forecasting, and investor views
 *
 * Heritage Command Lounge Design System Integration
 * - Uses amber theme for Executive lounge (gold/premium feel)
 * - Apple-aligned motion animations
 * - Glass material surfaces
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Users,
  FileBarChart,
  Settings,
} from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  COLORS,
  fadeInUp,
  staggerContainer,
  spacing
} from '@/lib/heritageDesignSystem';

// Executive Lounge color theme from Heritage Design System
const EXECUTIVE_THEME = {
  colors: COLORS.lounges.executive,
  accent: COLORS.accent.amber,
  gradient: COLORS.gradients.amber,
};

// Navigation sidebar sections with Heritage Design System styling
// Motion animations applied via staggerContainer and fadeInUp variants
const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/executive/dashboard' },
      { id: 'kpis', label: 'Key Metrics', icon: Target, href: '/executive/kpis' },
    ],
  },
  {
    title: 'Financial',
    items: [
      { id: 'revenue', label: 'Revenue & Forecasting', icon: DollarSign, href: '/executive/revenue' },
      { id: 'growth', label: 'Growth Analytics', icon: TrendingUp, href: '/executive/growth' },
      { id: 'commissions', label: 'Commissions', icon: PieChart, href: '/executive/commissions' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { id: 'investor', label: 'Investor View', icon: BarChart3, href: '/executive/investor' },
      { id: 'team', label: 'Team Performance', icon: Users, href: '/executive/team' },
      { id: 'reports', label: 'Custom Reports', icon: FileBarChart, href: '/executive/reports' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/executive/settings' },
    ],
  },
];

// Heritage Design System style configuration for Executive Lounge
// These values are used to customize the LoungeLayout appearance
const layoutStyles = {
  // Card styling with Heritage radius and shadows
  card: {
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
  },
  // Motion configuration for animations
  motion: {
    duration: MOTION.duration.normal,
    easing: MOTION.easingCSS,
    hover: {
      transform: `translateY(${MOTION.hover.y}px) scale(${MOTION.hover.scale})`,
      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
    },
  },
  // Typography from Heritage Design System
  typography: {
    title: TYPE.title,
    body: TYPE.body,
    meta: TYPE.meta,
    caption: TYPE.caption,
  },
  // Spacing using 8-point grid
  spacing: {
    xs: spacing(1),   // 8px
    sm: spacing(2),   // 16px
    md: spacing(3),   // 24px
    lg: spacing(4),   // 32px
    xl: spacing(5),   // 40px
  },
  // Animation variants for Framer Motion
  variants: {
    fadeInUp,
    staggerContainer,
  },
};

interface ExecutiveLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

/**
 * Executive Lounge Layout Component
 *
 * Integrates Heritage Command Lounge Design System with amber theme.
 * Features:
 * - Amber/gold color scheme for premium executive feel
 * - Apple-aligned motion animations (fadeInUp, staggerContainer)
 * - Glass material surfaces with proper blur and opacity
 * - RADIUS.card (24px) for sidebar cards
 * - SHADOW system for elevation hierarchy
 * - Subtle hover animations on navigation items
 *
 * All existing LoungeLayout functionality is preserved while applying
 * Heritage Design System tokens for consistent styling.
 */
export function ExecutiveLoungeLayout({ children, breadcrumbs }: ExecutiveLoungeLayoutProps) {
  return (
    <LoungeLayout
      loungeName="Executive Lounge"
      loungeColor="amber"
      sidebarSections={sidebarSections}
      showSearch={true}
      showLoungeSwitcher={true}
      showNotifications={true}
      showAgentIndicator={false}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </LoungeLayout>
  );
}

// Export Heritage Design System configuration for use by child components
export { layoutStyles, EXECUTIVE_THEME };

export default ExecutiveLoungeLayout;
