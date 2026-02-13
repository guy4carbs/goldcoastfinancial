/**
 * Executive Lounge Layout
 * High-level analytics, revenue forecasting, and investor views
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

interface ExecutiveLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

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

export default ExecutiveLoungeLayout;
