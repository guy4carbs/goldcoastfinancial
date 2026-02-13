/**
 * AI Lounge Layout
 * Admin-only access to AI agent control, monitoring, and configuration
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
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

export default AILoungeLayout;
