/**
 * Client Portal Layout
 * Client-facing dashboard for policy management and support
 *
 * Heritage Command Lounge Design System - Apple-Aligned CRM + Dashboard Architecture
 * Uses professional slate theme for client-facing portal
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
  spacing,
} from '@/lib/heritageDesignSystem';
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

/**
 * Portal Logo Component
 * Professional slate-themed logo with Heritage Design System styling
 */
function PortalLogo() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex items-center justify-center"
      style={{
        width: spacing(5), // 40px
        height: spacing(5),
        borderRadius: RADIUS.card,
        background: `linear-gradient(135deg, ${COLORS.gray[600]} 0%, ${COLORS.gray[700]} 100%)`,
        boxShadow: SHADOW.level2,
      }}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: TYPE.meta }}
      >
        CP
      </span>
    </motion.div>
  );
}

/**
 * Portal Footer Component
 * Displays user-friendly footer with Heritage Design System animations
 */
function PortalFooter() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="px-2 py-3"
    >
      <motion.div
        variants={fadeInUp}
        className="text-center"
        style={{
          fontSize: TYPE.micro,
          color: COLORS.gray[500],
        }}
      >
        <p>Need help? Contact support</p>
      </motion.div>
    </motion.div>
  );
}

export function PortalLayout({ children, breadcrumbs }: PortalLayoutProps) {
  return (
    <LoungeLayout
      loungeName="Client Portal"
      loungeColor="slate"
      sidebarSections={sidebarSections}
      showSearch={true}
      showLoungeSwitcher={false}
      showNotifications={true}
      showAgentIndicator={false}
      breadcrumbs={breadcrumbs}
      logo={<PortalLogo />}
      footer={<PortalFooter />}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{
          // Apply Heritage Design System spacing
          display: 'flex',
          flexDirection: 'column',
          gap: spacing(3), // 24px
        }}
      >
        <motion.div variants={fadeInUp}>
          {children}
        </motion.div>
      </motion.div>
    </LoungeLayout>
  );
}

export default PortalLayout;
