/**
 * AI Lounge Layout
 * Admin-only access to AI agent control, monitoring, and configuration
 *
 * Heritage Design System Integration:
 * - Cyan theme for AI lounge
 * - Motion animations on sidebar navigation
 * - RADIUS.card for sidebar cards
 * - SHADOW system for elevation
 * - Subtle hover animations
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, spacing } from '@/lib/heritageDesignSystem';
import {
  LayoutDashboard,
  Bot,
  Activity,
  Network,
  BookOpen,
  BarChart3,
  Shield,
  Users,
  Settings,
  Terminal,
  Cpu,
  Zap,
} from 'lucide-react';

// Heritage Design System styles for AI Lounge sidebar
const aiLoungeStyles = {
  // Cyan theme colors from Heritage Design System
  theme: {
    light: COLORS.lounges.ai.light,
    main: COLORS.lounges.ai.main,
    dark: COLORS.lounges.ai.dark,
  },
  // Card styling with design system tokens
  card: {
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
  },
  // Motion configuration for nav items
  motion: {
    hover: {
      y: MOTION.hover.y,
      scale: MOTION.hover.scale,
      transition: {
        duration: MOTION.duration.hover,
        ease: MOTION.easing,
      },
    },
    tap: {
      scale: 0.98,
    },
  },
  // Typography
  typography: {
    sectionTitle: TYPE.micro,
    navItem: TYPE.meta,
  },
  // Spacing using design system
  spacing: {
    sectionGap: spacing(3), // 24px
    itemGap: spacing(1),    // 8px
  },
  // Animation variants for staggered entrance
  animations: {
    container: staggerContainer,
    item: fadeInUp,
  },
};

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/ai/dashboard' },
      { id: 'agents', label: 'Agent Control', icon: Bot, href: '/ai/agents' },
      { id: 'workforce', label: 'AI Workforce', icon: Cpu, href: '/ai/workforce' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { id: 'eventbus', label: 'EventBus Monitor', icon: Activity, href: '/ai/eventbus' },
      { id: 'memory', label: 'Memory Graph', icon: Network, href: '/ai/memory' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/ai/analytics' },
    ],
  },
  {
    title: 'AI Council',
    items: [
      { id: 'avatar-council', label: 'Avatar Council', icon: Users, href: '/ai/avatar-council' },
      { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, href: '/ai/knowledge' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'security', label: 'Security', icon: Shield, href: '/ai/security' },
      { id: 'integrations', label: 'Integrations', icon: Zap, href: '/ai/integrations' },
      { id: 'logs', label: 'System Logs', icon: Terminal, href: '/ai/logs' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/ai/settings' },
    ],
  },
];

interface AILoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

/**
 * AI Lounge Layout Component
 *
 * Applies Heritage Design System tokens:
 * - Cyan theme (COLORS.lounges.ai)
 * - Motion animations (MOTION.easing, MOTION.duration)
 * - Card radius (RADIUS.card = 24px)
 * - Elevation shadows (SHADOW.card)
 * - Staggered entrance animations (staggerContainer, fadeInUp)
 */
export function AILoungeLayout({ children, breadcrumbs }: AILoungeLayoutProps) {
  return (
    <LoungeLayout
      loungeName="AI Lounge"
      loungeColor="cyan"
      sidebarSections={sidebarSections}
      showSearch={true}
      showLoungeSwitcher={true}
      showNotifications={true}
      showAgentIndicator={true}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </LoungeLayout>
  );
}

// Export design system styles for use in AI Lounge pages
export { aiLoungeStyles };

export default AILoungeLayout;
