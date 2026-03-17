/**
 * Manager Lounge Layout — Fully Custom
 * Matches Agent Lounge architecture: collapsible sidebar, gradient active states,
 * performance card, mobile nav, floating collapse toggle
 *
 * Heritage Design System — Emerald theme with gold accents
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/agentStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from '@/components/agent/NotificationDropdown';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  Leaf,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bot,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  BarChart3,
  Shield,
  Search,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Zap,
  Flame,
  BookOpen,
  Bell,
  UserCheck,
  Trophy,
  Award,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  Building2,
  LineChart,
  Crosshair,
  Send,
  type LucideIcon,
} from 'lucide-react';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  LAYOUT,
  COLORS,
  getHoverBg,
} from '@/lib/heritageDesignSystem';
import { useManagerTier } from '@/hooks/useManagerTier';
import { ManagerCommandPalette } from './ManagerCommandPalette';
import { ContactSupportModal } from './ContactSupportModal';
import { useManagerAnalytics } from './useManagerAnalytics';
import { DEMO_TEAM_MEMBERS } from './managerConstants';

// Computed team stats for sidebar performance card
const TEAM_SIZE = DEMO_TEAM_MEMBERS.length;
const WEEKLY_AP_TOTAL = DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.revenue, 0);
const TEAM_RANK = 2; // Demo: team rank within org

// ─── CONSTANTS ───
const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'manager-lounge-sidebar-collapsed';

// Emerald color tokens
const EMERALD = {
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  50: '#ecfdf5',
  200: '#a7f3d0',
};

// ─── LOUNGE SWITCHER OPTIONS ───
const LOUNGE_OPTIONS = [
  { id: 'agent', name: 'Agent Lounge', icon: Users, path: '/agents/dashboard', description: 'Sales, leads & performance', gradient: 'from-violet-500 to-purple-600' },
  { id: 'crm', name: 'Lobby', icon: LayoutDashboard, path: '/crm', description: 'Welcome center & navigation', gradient: 'from-violet-600 to-purple-700' },
  { id: 'ai', name: 'AI Lounge', icon: Bot, path: '/ai/dashboard', description: 'AI agents & automation', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'finance', name: 'Finance Lounge', icon: DollarSign, path: '/finance/dashboard', description: 'Commissions & financial reporting', gradient: 'from-blue-800 to-blue-950' },
  { id: 'marketing', name: 'Marketing Lounge', icon: Megaphone, path: '/marketing/dashboard', description: 'Campaigns & content', gradient: 'from-rose-500 to-pink-600' },
  { id: 'support', name: 'Support Lounge', icon: HeadphonesIcon, path: '/support/dashboard', description: 'Tickets & help desk', gradient: 'from-gray-700 to-gray-900' },
  { id: 'manager', name: 'Manager Lounge', icon: Briefcase, path: '/manager/dashboard', description: 'Team coaching & pipeline oversight', gradient: 'from-emerald-500 to-emerald-700' },
  { id: 'executive', name: 'Executive Lounge', icon: BarChart3, path: '/executive/dashboard', description: 'Strategic insights', gradient: 'from-orange-500 to-orange-700' },
  { id: 'admin', name: 'Admin Lounge', icon: Shield, path: '/admin', description: 'System settings & users', gradient: 'from-slate-500 to-blue-700' },
  { id: 'investor', name: 'Investor Lounge', icon: BarChart3, path: '/investor/dashboard', description: 'KPIs & executive dashboards', gradient: 'from-amber-500 to-yellow-600' },
] as const;

// ─── NAV ITEMS ───
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

// Psychology-driven ordering: People → Money → Urgent → Growth → Admin
const homeItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/manager/dashboard' },
  { icon: Users, label: 'Roster', href: '/manager/team' },
  { icon: DollarSign, label: 'Commissions', href: '/manager/commissions' },
  { icon: MessageSquare, label: 'Communications', href: '/manager/communications' },
];

const teamItems: NavItem[] = [
  { icon: Trophy, label: 'Performance', href: '/manager/team-performance' },
  { icon: ClipboardList, label: 'Scorecard', href: '/manager/scorecard' },
  { icon: Briefcase, label: 'Book of Business', href: '/manager/client-health' },
  { icon: Zap, label: 'Onboarding', href: '/manager/onboarding-tracker' },
];

const actionItems: NavItem[] = [
  { icon: AlertTriangle, label: 'Escalations', href: '/manager/escalations' },
  { icon: Send, label: 'Lead Distribution', href: '/manager/lead-distribution' },
];

const growthItems: NavItem[] = [
  { icon: GraduationCap, label: 'Coaching', href: '/manager/development' },

  { icon: Crosshair, label: 'Goals', href: '/manager/goals' },
];

const adminItems: NavItem[] = [
  { icon: FileBarChart, label: 'Reports', href: '/manager/reports' },
  { icon: ShieldCheck, label: 'Compliance', href: '/manager/compliance' },
];

const directorItems: NavItem[] = [
  { icon: Building2, label: 'Director View', href: '/manager/director' },
];

// ─── MANAGER THEME ───
export const managerTheme = {
  colors: COLORS.lounges.manager,
  radius: RADIUS.card,
  shadow: SHADOW.card,
  motion: MOTION,
  typography: TYPE,
};

// ─── LAYOUT COMPONENT ───
interface ManagerLoungeLayoutProps {
  children: ReactNode;
}

export function ManagerLoungeLayout({ children }: ManagerLoungeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const {
    currentUser,
    performance,
    notifications,
    logout,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
  } = useAgentStore();

  const { isDirector } = useManagerTier();

  const analytics = useManagerAnalytics();

  // All nav items flat for lookups
  const ALL_NAV_ITEMS = [
    ...homeItems, ...teamItems,
    ...actionItems, ...growthItems, ...adminItems, ...directorItems,
  ];
  const navItemMap = Object.fromEntries(ALL_NAV_ITEMS.map((item: NavItem) => [item.href, item]));
  const recentPaths = analytics.getRecentlyVisited(4);

  // Breadcrumb derivation for sub-pages
  const breadcrumbs = (() => {
    const segments = location.split('/').filter(Boolean);
    if (segments.length < 3) return [];

    const crumbs: { label: string; href?: string }[] = [];
    const parentPath = '/' + segments.slice(0, 2).join('/');
    const parentItem = navItemMap[parentPath];

    const sections = [
      { title: 'Home', items: homeItems },
      { title: 'Team', items: teamItems },
      { title: 'Action Items', items: actionItems },
      { title: 'Growth', items: growthItems },
      { title: 'Admin', items: adminItems },
    ];
    const sectionMap: Record<string, string> = {};
    sections.forEach(s => s.items.forEach((item: NavItem) => { sectionMap[item.href] = s.title; }));

    if (parentItem) {
      const sectionTitle = sectionMap[parentPath];
      if (sectionTitle) crumbs.push({ label: sectionTitle });
      crumbs.push({ label: parentItem.label, href: parentItem.href });
    }

    const detailSegment = segments[2];
    if (detailSegment) {
      crumbs.push({ label: detailSegment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    }

    return crumbs;
  })();

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcut: Ctrl/Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── NAV ITEM RENDERER ───
  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location === item.href || location.startsWith(item.href + '/');
    return (
      <Link key={item.href} href={item.href}>
        <motion.div
          whileHover={{
            x: 2,
            backgroundColor: isActive ? undefined : getHoverBg(EMERALD[500], 0.08),
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className={cn(
            'flex items-center cursor-pointer transition-all',
            sidebarCollapsed && 'justify-center',
          )}
          style={{
            gap: GRID.spacing.sm - 4,
            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
            borderRadius: RADIUS.button,
            minHeight: ROW_HEIGHT,
            background: isActive
              ? `linear-gradient(135deg, ${EMERALD[600]} 0%, ${EMERALD[700]} 100%)`
              : undefined,
            color: isActive ? 'white' : COLORS.gray[600],
            boxShadow: isActive ? `${SHADOW.level2}, 0 4px 12px rgba(16, 185, 129, 0.3)` : undefined,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon
            className="flex-shrink-0"
            style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
          />
          {!sidebarCollapsed && (
            <span className="font-medium flex-1 truncate" style={{ fontSize: TYPE.meta }}>
              {item.label}
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  // ─── NAV SECTION ───
  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div style={{ marginBottom: GRID.spacing.md }}>
      {!sidebarCollapsed && (
        <p
          className="font-semibold text-gray-400 uppercase tracking-wider"
          style={{
            paddingLeft: GRID.spacing.md - 8,
            paddingRight: GRID.spacing.md - 8,
            marginBottom: GRID.spacing.xs,
            fontSize: TYPE.micro,
          }}
        >
          {title}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
        {items.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );

  // ─── SIDEBAR CONTENT ───
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className={cn('flex items-center', sidebarCollapsed && 'justify-center')}
        style={{
          gap: GRID.spacing.sm - 4,
          padding: `0 ${GRID.spacing.md - 8}px`,
          minHeight: LAYOUT.header.height - GRID.spacing.md,
          marginBottom: GRID.spacing.md,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: GRID.spacing.xl,
            height: GRID.spacing.xl,
            borderRadius: RADIUS.button,
            boxShadow: SHADOW.level2,
            background: `linear-gradient(135deg, ${EMERALD[500]} 0%, ${EMERALD[700]} 100%)`,
          }}
        >
          <Leaf style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4, color: 'white' }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Manager Lounge</p>
          </div>
        )}
      </div>

      {/* Performance Card */}
      {!sidebarCollapsed && (
        <div style={{ padding: `0 ${GRID.spacing.sm}px`, marginBottom: GRID.spacing.lg }}>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            style={{
              borderRadius: RADIUS.card,
              padding: GRID.spacing.sm,
              boxShadow: `${SHADOW.hero}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
              color: 'white',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <Zap style={{ width: 16, height: 16, color: COLORS.accent.amber[300] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>Level {performance.level}</span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Flame style={{ width: 16, height: 16, color: COLORS.accent.amber[400] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>{performance.currentStreak}</span>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.xs }}>
              <span className="font-semibold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                ${(WEEKLY_AP_TOTAL / 1000).toFixed(0)}K
              </span>
              <span style={{ fontSize: TYPE.caption, color: EMERALD[200] }}>
                {TEAM_SIZE} agents
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              style={{
                marginTop: GRID.spacing.xs,
                paddingTop: GRID.spacing.xs,
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.7)' }}>
                Team Rank
              </span>
              <span className="font-bold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                #{TEAM_RANK}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: `0 ${GRID.spacing.xs}px` }}>
        <NavSection title="Home" items={homeItems} />
        <NavSection title="Team" items={teamItems} />
        <NavSection title="Action Items" items={actionItems} />
        <NavSection title="Growth" items={growthItems} />
        <NavSection title="Admin" items={adminItems} />
        {isDirector && <NavSection title="Director" items={directorItems} />}
      </nav>

      {/* Bottom Actions */}
      <div
        className="mt-auto"
        style={{
          borderTop: `1px solid ${GLASS.border}`,
          paddingTop: GRID.spacing.sm,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px 0`,
        }}
      >
        {/* Settings */}
        <Link href="/manager/settings">
          <motion.div
            whileHover={{ x: 2, backgroundColor: getHoverBg(EMERALD[500], 0.08) }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              'flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors',
              sidebarCollapsed && 'justify-center',
            )}
            style={{
              gap: GRID.spacing.sm - 4,
              padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
              borderRadius: RADIUS.button,
              minHeight: ROW_HEIGHT,
            }}
          >
            <Settings style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
            {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: TYPE.meta }}>Settings</span>}
          </motion.div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ x: 2, backgroundColor: getHoverBg(EMERALD[500], 0.08) }}
              transition={{ duration: MOTION.duration.hover }}
              className={cn(
                'flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors',
                sidebarCollapsed && 'justify-center',
              )}
              style={{
                gap: GRID.spacing.sm - 4,
                padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
                borderRadius: RADIUS.button,
                minHeight: ROW_HEIGHT,
              }}
            >
              <HelpCircle style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: TYPE.meta }}>Help & Support</span>}
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            className="w-56 p-1 border-0"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setLocation('/manager/guide')}
            >
              <BookOpen style={{ width: 16, height: 16 }} />
              Manager Guide
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search style={{ width: 16, height: 16 }} />
              <span className="flex-1">Search Commands</span>
              <kbd className="text-gray-400" style={{ fontSize: TYPE.micro }}>⌘K</kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setContactSupportOpen(true)}
            >
              <MessageSquare style={{ width: 16, height: 16 }} />
              Contact Support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="hidden lg:flex flex-col fixed h-screen z-30"
        style={{
          backgroundColor: '#ffffff',
          borderRight: `1px solid ${GLASS.border}`,
          paddingTop: GRID.spacing.md,
          paddingBottom: GRID.spacing.md,
        }}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: MOTION.duration.hover }}
          className="absolute -right-3 bg-white border flex items-center justify-center hover:bg-gray-50 transition-colors z-40"
          style={{
            top: GRID.spacing.xxxxl,
            width: GRID.spacing.md,
            height: GRID.spacing.md,
            borderRadius: RADIUS.button,
            borderColor: GLASS.border,
            boxShadow: SHADOW.level2,
          }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="text-gray-600" style={{ width: 12, height: 12 }} />
          ) : (
            <ChevronLeft className="text-gray-600" style={{ width: 12, height: 12 }} />
          )}
        </motion.button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.transition }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_EXPANDED }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 flex flex-col z-50"
              style={{
                width: SIDEBAR_EXPANDED,
                backgroundColor: '#ffffff',
                paddingTop: GRID.spacing.md,
                paddingBottom: GRID.spacing.md,
              }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute hover:bg-gray-100 transition-colors"
                style={{
                  top: GRID.spacing.sm,
                  right: GRID.spacing.sm,
                  padding: GRID.spacing.xs,
                  borderRadius: RADIUS.button,
                }}
                aria-label="Close menu"
              >
                <X className="text-gray-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="flex-1 flex flex-col min-h-screen lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Header — Glass Material */}
        <header
          className="sticky top-0 z-20"
          style={{
            backgroundColor: GLASS.background,
            backdropFilter: `blur(${GLASS.blur}px)`,
            WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
            borderBottom: `1px solid ${GLASS.border}`,
            height: LAYOUT.header.height,
          }}
        >
          <div
            className="flex items-center justify-between h-full"
            style={{ paddingLeft: GRID.spacing.md, paddingRight: GRID.spacing.md }}
          >
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden hover:bg-gray-100 transition-colors"
                style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                aria-label="Open menu"
              >
                <Menu className="text-gray-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              </button>

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                style={{
                  gap: GRID.spacing.xs,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: RADIUS.button,
                }}
              >
                <Search style={{ width: 16, height: 16 }} />
                <span className="hidden sm:inline" style={{ fontSize: TYPE.meta }}>Search anything...</span>
                <kbd
                  className="hidden md:inline-flex items-center font-medium bg-white border"
                  style={{
                    gap: 2,
                    padding: '2px 6px',
                    fontSize: TYPE.micro,
                    borderRadius: RADIUS.button / 2,
                    borderColor: GLASS.border,
                  }}
                >
                  <span>⌘</span>K
                </kbd>
              </button>

              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <Breadcrumb className="hidden md:flex">
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {idx === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage style={{ fontSize: TYPE.meta }}>{crumb.label}</BreadcrumbPage>
                          ) : crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href}>
                                <span style={{ fontSize: TYPE.meta }}>{crumb.label}</span>
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <span className="text-gray-400" style={{ fontSize: TYPE.meta }}>{crumb.label}</span>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>

            {/* Right: Lounge Switcher + Notifications + User + Logout */}
            <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
              {/* Lounge Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Briefcase style={{ width: 16, height: 16 }} />
                    <span className="hidden sm:inline font-medium" style={{ fontSize: TYPE.meta }}>Manager</span>
                    <ChevronDown style={{ width: 14, height: 14 }} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-1 border-0"
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.hero,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {LOUNGE_OPTIONS.map((lounge) => {
                    const Icon = lounge.icon;
                    const isActive = lounge.id === 'manager';
                    return (
                      <DropdownMenuItem key={lounge.id} asChild>
                        <Link
                          href={lounge.path}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                            isActive ? 'bg-emerald-50' : 'hover:bg-gray-50',
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <div
                            className={cn('flex items-center justify-center flex-shrink-0 bg-gradient-to-br', lounge.gradient)}
                            style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                          >
                            <Icon className="text-white" size={LAYOUT.icon.sm} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('font-medium', isActive ? 'text-emerald-700' : 'text-gray-900')} style={{ fontSize: TYPE.meta }}>
                              {lounge.name}
                            </p>
                            <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>{lounge.description}</p>
                          </div>
                          {isActive && (
                            <div className="bg-emerald-500 flex-shrink-0" style={{ width: 8, height: 8, borderRadius: RADIUS.pill }} />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <div className="relative">
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={markNotificationRead}
                  onMarkAllAsRead={markAllNotificationsRead}
                  onClear={clearNotification}
                />
                {notifications.filter(n => !n.read).length > 0 && (
                  <div
                    className="absolute flex items-center justify-center font-bold text-white bg-red-500 pointer-events-none"
                    style={{
                      top: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      borderRadius: RADIUS.pill,
                      fontSize: 9,
                      border: '2px solid white',
                      transform: 'translate(25%, -25%)',
                    }}
                  >
                    {notifications.filter(n => !n.read).length}
                  </div>
                )}
              </div>

              {/* User Info */}
              <Link href="/manager/settings">
                <div
                  className="hidden sm:flex items-center border-l cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    gap: GRID.spacing.sm - 4,
                    paddingLeft: GRID.spacing.sm - 4,
                    borderColor: GLASS.border,
                  }}
                >
                  <div className="text-right">
                    <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {currentUser?.name || 'Manager'}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                      Level {performance.level} · ${(performance.xp || 0).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center text-white font-bold"
                    style={{
                      width: GRID.spacing.xl,
                      height: GRID.spacing.xl,
                      borderRadius: RADIUS.button,
                      boxShadow: SHADOW.level2,
                      fontSize: TYPE.meta,
                      background: `linear-gradient(135deg, ${EMERALD[500]} 0%, ${EMERALD[700]} 100%)`,
                    }}
                  >
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                  </div>
                </div>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  setLocation('/agents/login');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24 lg:pb-6" style={{ padding: GRID.spacing.md }}>
          {children}
        </main>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          backgroundColor: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
          borderTop: `1px solid ${GLASS.border}`,
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around" style={{ padding: `${GRID.spacing.xs}px 0` }}>
          {[
            { icon: LayoutDashboard, label: 'Home', href: '/manager/dashboard' },
            { icon: Users, label: 'Team', href: '/manager/team' },
            { icon: DollarSign, label: 'Commissions', href: '/manager/commissions' },
            { icon: AlertTriangle, label: 'Escalations', href: '/manager/escalations' },
          ].map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: MOTION.duration.hover }}
                  className="flex flex-col items-center transition-colors"
                  style={{
                    gap: 4,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm - 4}px`,
                    borderRadius: RADIUS.button,
                    backgroundColor: isActive ? EMERALD[50] : 'transparent',
                    color: isActive ? EMERALD[600] : COLORS.gray[500],
                  }}
                  role="link"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
                  <span className="font-medium" style={{ fontSize: TYPE.micro }}>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: MOTION.duration.hover }}
            className="flex flex-col items-center transition-colors text-gray-500"
            style={{
              gap: 4,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm - 4}px`,
              borderRadius: RADIUS.button,
            }}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
            <span className="font-medium" style={{ fontSize: TYPE.micro }}>More</span>
          </motion.button>
        </div>
      </nav>

      {/* Command Palette */}
      <ManagerCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Contact Support Modal */}
      <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
    </div>
  );
}

export default ManagerLoungeLayout;
