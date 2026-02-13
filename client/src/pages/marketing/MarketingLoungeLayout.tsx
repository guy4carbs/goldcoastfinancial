/**
 * Marketing Lounge Layout
 * Content creation, social media, and campaign management
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
import {
  LayoutDashboard,
  PenTool,
  Share2,
  Star,
  Mail,
  Megaphone,
  BarChart3,
  Calendar,
  Settings,
  ImageIcon,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/marketing/dashboard' },
      { id: 'calendar', label: 'Content Calendar', icon: Calendar, href: '/marketing/calendar' },
    ],
  },
  {
    title: 'Content',
    items: [
      { id: 'studio', label: 'Content Studio', icon: PenTool, href: '/marketing/studio' },
      { id: 'media', label: 'Media Library', icon: ImageIcon, href: '/marketing/media' },
    ],
  },
  {
    title: 'Channels',
    items: [
      { id: 'social', label: 'Social Media', icon: Share2, href: '/marketing/social' },
      { id: 'email', label: 'Email Campaigns', icon: Mail, href: '/marketing/email' },
      { id: 'campaigns', label: 'Campaign Manager', icon: Megaphone, href: '/marketing/campaigns' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'reputation', label: 'Reputation Monitor', icon: Star, href: '/marketing/reputation' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/marketing/analytics' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/marketing/settings' },
    ],
  },
];

interface MarketingLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function MarketingLoungeLayout({ children, breadcrumbs }: MarketingLoungeLayoutProps) {
  return (
    <LoungeLayout
      loungeName="Marketing Lounge"
      loungeColor="rose"
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

export default MarketingLoungeLayout;
