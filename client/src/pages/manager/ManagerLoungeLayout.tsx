/**
 * Manager Lounge Layout
 * Team management, coaching, and pipeline oversight
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
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
      {children}
    </LoungeLayout>
  );
}

export default ManagerLoungeLayout;
