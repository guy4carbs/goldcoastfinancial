/**
 * CRM Lounge Layout
 * Contact management, pipeline, and client relationships
 */

import { type ReactNode } from 'react';
import { LoungeLayout, type SidebarSection } from '@/components/layout/LoungeLayout';
import {
  LayoutDashboard,
  Users,
  Target,
  Database,
  Upload,
  Download,
  Building2,
  History,
  Tags,
  Settings,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/crm/dashboard' },
      { id: 'pipeline', label: 'Pipeline', icon: Target, href: '/crm/pipeline' },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { id: 'contacts', label: 'Contact Database', icon: Database, href: '/crm/contacts' },
      { id: 'clients', label: 'Client Management', icon: Building2, href: '/crm/clients' },
      { id: 'segments', label: 'Segments & Tags', icon: Tags, href: '/crm/segments' },
    ],
  },
  {
    title: 'Data',
    items: [
      { id: 'import', label: 'Import', icon: Upload, href: '/crm/import' },
      { id: 'export', label: 'Export', icon: Download, href: '/crm/export' },
      { id: 'history', label: 'Activity History', icon: History, href: '/crm/history' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/crm/settings' },
    ],
  },
];

interface CRMLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function CRMLoungeLayout({ children, breadcrumbs }: CRMLoungeLayoutProps) {
  return (
    <LoungeLayout
      loungeName="CRM Lounge"
      loungeColor="indigo"
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

export default CRMLoungeLayout;
