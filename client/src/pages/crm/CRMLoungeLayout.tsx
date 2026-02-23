/**
 * CRM Lounge Layout
 * Contact management, pipeline, and client relationships
 *
 * Uses Heritage Design System for consistent styling:
 * - Indigo theme for CRM lounge
 * - Motion animations for navigation elements
 * - RADIUS.card for sidebar cards
 * - Proper shadows from SHADOW system
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

// CRM Lounge specific styles using Heritage Design System
const crmLoungeStyles = {
  // Indigo theme colors from Heritage Design System
  theme: {
    primary: COLORS.lounges.crm.main,
    light: COLORS.lounges.crm.light,
    dark: COLORS.lounges.crm.dark,
  },
  // Card styling with Heritage RADIUS and SHADOW
  card: {
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
  },
  // Navigation item hover animation
  navItemHover: {
    y: MOTION.hover.y / 2, // Subtle lift on hover (-2px)
    scale: 1.005, // Very subtle scale
    transition: {
      duration: MOTION.duration.hover,
      ease: MOTION.easing,
    },
  },
  // Content area styling
  content: {
    padding: spacing(3), // 24px
    borderRadius: RADIUS.card,
  },
};

// Animation variants for page content
const pageContentVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
    },
  },
};

// Container variants for staggered children animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

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
      {/* Animated content wrapper with Heritage Design System motion */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageContentVariants}
        style={{
          minHeight: '100%',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      </motion.div>
    </LoungeLayout>
  );
}

export default CRMLoungeLayout;
