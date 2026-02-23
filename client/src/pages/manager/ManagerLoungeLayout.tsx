/**
 * Manager Lounge Layout
 * Team management, coaching, and pipeline oversight
 *
 * Uses Heritage Design System for consistent styling
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
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
import {
  LayoutDashboard,
  Users,
  Target,
  GraduationCap,
  FileBarChart,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Settings,
  TrendingUp,
} from 'lucide-react';

// Manager lounge uses emerald theme from Heritage Design System
// These theme values are available for child components and page-level styling
export const managerTheme = {
  colors: COLORS.lounges.manager,
  radius: RADIUS.card,
  shadow: SHADOW.card,
  motion: MOTION,
  typography: TYPE,
};

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/manager/dashboard' },
      { id: 'team', label: 'Team Management', icon: Users, href: '/manager/team' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { id: 'pipeline', label: 'Pipeline Overview', icon: Target, href: '/manager/pipeline' },
      { id: 'performance', label: 'Performance', icon: TrendingUp, href: '/manager/performance' },
    ],
  },
  {
    title: 'Development',
    items: [
      { id: 'coaching', label: 'Coaching Center', icon: GraduationCap, href: '/manager/coaching' },
      { id: 'meetings', label: 'Team Meetings', icon: Calendar, href: '/manager/meetings' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'escalations', label: 'Escalations', icon: AlertTriangle, href: '/manager/escalations' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/manager/reports' },
      { id: 'chat', label: 'Team Chat', icon: MessageSquare, href: '/manager/chat' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/manager/settings' },
    ],
  },
];

interface ManagerLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function ManagerLoungeLayout({ children, breadcrumbs }: ManagerLoungeLayoutProps) {
  return (
    <LoungeLayout
      loungeName="Manager Lounge"
      loungeColor="emerald"
      sidebarSections={sidebarSections}
      showSearch={true}
      showLoungeSwitcher={true}
      showNotifications={true}
      showAgentIndicator={true}
      breadcrumbs={breadcrumbs}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing(3), // 24px - 3U spacing
        }}
      >
        <motion.div
          variants={fadeInUp}
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.level1,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </LoungeLayout>
  );
}

export default ManagerLoungeLayout;
