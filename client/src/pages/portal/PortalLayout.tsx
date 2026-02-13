/**
 * Client Portal Layout
 * Client-facing dashboard for policy management and support
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  FolderOpen,
  ShieldCheck,
  HeadphonesIcon,
  Settings,
  Gift,
  User,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/portal/dashboard' },
      { id: 'profile', label: 'My Profile', icon: User, href: '/portal/profile' },
    ],
  },
  {
    title: 'My Insurance',
    items: [
      { id: 'policies', label: 'My Policies', icon: FileText, href: '/portal/policies' },
      { id: 'claims', label: 'Claims', icon: ShieldCheck, href: '/portal/claims' },
      { id: 'documents', label: 'Documents', icon: FolderOpen, href: '/portal/documents' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { id: 'billing', label: 'Billing & Payments', icon: CreditCard, href: '/portal/billing' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'support', label: 'Get Help', icon: HeadphonesIcon, href: '/portal/support' },
      { id: 'referral', label: 'Refer a Friend', icon: Gift, href: '/portal/referral' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/portal/settings' },
    ],
  },
];

interface PortalLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PortalLayout({ children, breadcrumbs }: PortalLayoutProps) {
  return (
    <LoungeLayout
      loungeName="Client Portal"
      loungeColor="cyan"
      sidebarSections={sidebarSections}
      showSearch={true}
      showLoungeSwitcher={false}
      showNotifications={true}
      showAgentIndicator={false}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </LoungeLayout>
  );
}

export default PortalLayout;
