/**
 * Marketing Lounge Layout
 * Content creation, social media, and campaign management
 *
 * Heritage Command Lounge Design System
 * - Uses rose theme for Marketing lounge
 * - Apple-aligned motion curves and animations
 * - Glass material system with proper shadows
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

// Marketing lounge rose theme colors from Heritage Design System
const MARKETING_THEME = {
  light: COLORS.lounges.marketing.light,   // '#fff1f2'
  main: COLORS.lounges.marketing.main,     // '#f43f5e'
  dark: COLORS.lounges.marketing.dark,     // '#be123c'
};

// Motion variants for sidebar navigation items
const navItemVariants = {
  hidden: {
    opacity: 0,
    x: -12
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
    },
  },
  hover: {
    x: spacing(0.5), // 4px shift using Heritage spacing
    transition: {
      duration: MOTION.duration.hover,
      ease: MOTION.easing,
    },
  },
};

// Sidebar card styling using Heritage tokens
const sidebarCardStyle = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.level2,
};

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

/**
 * Marketing Lounge Layout Component
 *
 * Implements Heritage Design System with:
 * - Rose theme for marketing department
 * - RADIUS.card (24px) for sidebar cards
 * - SHADOW.level2 for proper elevation
 * - MOTION system for smooth animations
 * - Staggered fade-in animations for nav items
 */
export function MarketingLoungeLayout({ children, breadcrumbs }: MarketingLoungeLayoutProps) {
  // Marketing lounge footer with Heritage styling
  const loungeFooter = (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      style={{
        padding: spacing(2),
        borderRadius: RADIUS.card,
        backgroundColor: MARKETING_THEME.light,
        marginTop: spacing(1),
      }}
    >
      <p
        style={{
          fontSize: TYPE.micro,
          color: MARKETING_THEME.dark,
          fontWeight: 500,
        }}
      >
        Marketing Hub
      </p>
      <p
        style={{
          fontSize: TYPE.caption,
          color: COLORS.gray[500],
          marginTop: spacing(0.5),
        }}
      >
        Content & Campaign Center
      </p>
    </motion.div>
  );

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
      footer={loungeFooter}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ height: '100%' }}
      >
        {children}
      </motion.div>
    </LoungeLayout>
  );
}

export default MarketingLoungeLayout;
