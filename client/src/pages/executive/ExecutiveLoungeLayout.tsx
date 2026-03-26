/**
 * Executive Lounge Layout — Fully Custom
 * Matches Agent/Manager Lounge architecture: collapsible sidebar, gradient active states,
 * performance card, mobile nav, floating collapse toggle, command palette
 *
 * Heritage Design System — Orange/Amber theme with gold accents
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/agentStore';
import { cn } from '@/lib/utils';
import { useLoungeAccess } from '@/hooks/useLoungeAccess';
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
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  FileBarChart,
  Settings,
  Crown,
  Bot,
  Megaphone,
  HeadphonesIcon,
  Briefcase,
  Shield,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Zap,
  Flame,
  BookOpen,
  MessageSquare,
  UserPlus,
  GitBranch,
  ClipboardList,
  UserCog,
  Building,
  LineChart,
  ShieldCheck,
  Send,
  Phone,
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
import { ExecutiveCommandPalette } from './ExecutiveCommandPalette';
import { EXECUTIVE_GRADIENT_CSS } from './executiveConstants';
import { ContactSupportModal } from '../manager/ContactSupportModal';

// ─── CONSTANTS ───
const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'executive-lounge-sidebar-collapsed';

// Orange color tokens
const ORANGE = {
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
  50: '#fff7ed',
  200: '#fed7aa',
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
  { id: 'director', name: 'Director Lounge', icon: Building2, path: '/manager/director', description: 'Multi-team oversight', gradient: 'from-blue-700 to-slate-900' },
  { id: 'executive', name: 'Executive Lounge', icon: BarChart3, path: '/executive/dashboard', description: 'Strategic insights & forecasting', gradient: 'from-orange-500 to-orange-700' },
  { id: 'admin', name: 'Admin Lounge', icon: Shield, path: '/admin', description: 'System settings & users', gradient: 'from-slate-500 to-blue-700' },
  { id: 'investor', name: 'Investor Lounge', icon: BarChart3, path: '/investor/dashboard', description: 'KPIs & executive dashboards', gradient: 'from-amber-500 to-yellow-600' },
] as const;

// ─── NAV ITEMS ───
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

// ─── SIDEBAR NAV SECTIONS ───
const overviewItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/executive/dashboard' },
  { icon: Target, label: 'Key Metrics', href: '/executive/kpis' },
];

const financialItems: NavItem[] = [
  { icon: DollarSign, label: 'Revenue & Forecasting', href: '/executive/revenue' },
  { icon: PieChart, label: 'Commissions', href: '/executive/commissions' },
];

const salesItems: NavItem[] = [
  { icon: TrendingUp, label: 'Sales & Production', href: '/executive/sales' },
  { icon: ClipboardList, label: 'Policy Pipeline', href: '/executive/pipeline' },
  { icon: Send, label: 'Lead Distribution', href: '/executive/lead-distribution' },
];

const recruitingItems: NavItem[] = [
  { icon: UserPlus, label: 'Recruiting Dashboard', href: '/executive/recruiting' },
  { icon: GitBranch, label: 'Recruiting Pipeline', href: '/executive/recruiting-pipeline' },
];

const teamItems: NavItem[] = [
  { icon: Users, label: 'Team Performance', href: '/executive/team' },
  { icon: Building2, label: 'Agency Hierarchy', href: '/executive/hierarchy' },
  { icon: BookOpen, label: 'Book of Business', href: '/executive/book-of-business' },
];

const analyticsItems: NavItem[] = [
  { icon: LineChart, label: 'Growth Analytics', href: '/executive/growth' },
  { icon: FileBarChart, label: 'Custom Reports', href: '/executive/reports' },
  { icon: BarChart3, label: 'Investor View', href: '/executive/investor' },
];

const operationsItems: NavItem[] = [
  { icon: UserCog, label: 'Agent Management', href: '/executive/agent-management' },
  { icon: Building, label: 'Agency Management', href: '/executive/agency-management' },
  { icon: Phone, label: 'Call Monitoring', href: '/executive/call-monitoring' },
  { icon: ShieldCheck, label: 'Lounge Access', href: '/executive/lounge-access' },
];

const systemItems: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/executive/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/executive/support' },
];

// ─── EXECUTIVE THEME ───
export const executiveTheme = {
  colors: COLORS.lounges.executive,
  radius: RADIUS.card,
  shadow: SHADOW.card,
  motion: MOTION,
  typography: TYPE,
};

// ─── LAYOUT COMPONENT ───
interface ExecutiveLoungeLayoutProps {
  children: ReactNode;
}

export function ExecutiveLoungeLayout({ children }: ExecutiveLoungeLayoutProps) {
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
  const { hasAccess, isLoading: loungeAccessLoading } = useLoungeAccess();

  // Filter LOUNGE_OPTIONS by DB access (current lounge always visible)
  const visibleLounges = LOUNGE_OPTIONS.filter(
    lounge => lounge.id === 'executive' || loungeAccessLoading || hasAccess(lounge.id)
  );

  const {
    currentUser,
    performance,
    notifications,
    logout,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
  } = useAgentStore();

  // All nav items flat for lookups
  const ALL_NAV_ITEMS = [
    ...overviewItems, ...financialItems, ...salesItems, ...recruitingItems,
    ...teamItems, ...analyticsItems, ...operationsItems, ...systemItems,
  ];
  const navItemMap = Object.fromEntries(ALL_NAV_ITEMS.map((item: NavItem) => [item.href, item]));

  // Breadcrumb derivation
  const breadcrumbs = (() => {
    const segments = location.split('/').filter(Boolean);
    if (segments.length < 3) return [];

    const crumbs: { label: string; href?: string }[] = [];
    const parentPath = '/' + segments.slice(0, 2).join('/');
    const parentItem = navItemMap[parentPath];

    const sections = [
      { title: 'Overview', items: overviewItems },
      { title: 'Financial', items: financialItems },
      { title: 'Sales', items: salesItems },
      { title: 'Recruiting', items: recruitingItems },
      { title: 'Team', items: teamItems },
      { title: 'Analytics', items: analyticsItems },
      { title: 'Operations', items: operationsItems },
      { title: 'System', items: systemItems },
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
  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = location === item.href || location.startsWith(item.href + '/');
    return (
      <Link key={item.href} href={item.href}>
        <motion.div
          whileHover={{
            x: 2,
            backgroundColor: isActive ? undefined : getHoverBg(ORANGE[500], 0.08),
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
              ? `linear-gradient(135deg, ${ORANGE[600]} 0%, ${ORANGE[700]} 100%)`
              : undefined,
            color: isActive ? 'white' : COLORS.gray[600],
            boxShadow: isActive ? `${SHADOW.level2}, 0 4px 12px rgba(249, 115, 22, 0.3)` : undefined,
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
          className="font-semibold text-stone-400 uppercase tracking-wider"
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
          <NavItemComponent key={item.href} item={item} />
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
            background: `linear-gradient(135deg, ${ORANGE[500]} 0%, ${ORANGE[700]} 100%)`,
          }}
        >
          <Crown style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4, color: 'white' }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-stone-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>Executive Lounge</p>
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
              background: EXECUTIVE_GRADIENT_CSS,
              color: 'white',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <DollarSign style={{ width: 16, height: 16, color: COLORS.accent.amber[300] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>Org Revenue</span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Flame style={{ width: 16, height: 16, color: COLORS.accent.amber[400] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>+34%</span>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.xs }}>
              <span className="font-semibold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                $1.87M
              </span>
              <span style={{ fontSize: TYPE.caption, color: ORANGE[200] }}>
                61 agents
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
                Org Rank
              </span>
              <span className="font-bold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                #1
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: `0 ${GRID.spacing.xs}px` }}>
        <NavSection title="Overview" items={overviewItems} />
        <NavSection title="Financial" items={financialItems} />
        <NavSection title="Sales" items={salesItems} />
        <NavSection title="Recruiting" items={recruitingItems} />
        <NavSection title="Team" items={teamItems} />
        <NavSection title="Analytics" items={analyticsItems} />
        <NavSection title="Operations" items={operationsItems} />
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
        <Link href="/executive/settings">
          <motion.div
            whileHover={{ x: 2, backgroundColor: getHoverBg(ORANGE[500], 0.08) }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              'flex items-center cursor-pointer transition-colors',
              sidebarCollapsed && 'justify-center',
            )}
            style={{
              gap: GRID.spacing.sm - 4,
              padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
              borderRadius: RADIUS.button,
              minHeight: ROW_HEIGHT,
              background: location === '/executive/settings'
                ? `linear-gradient(135deg, ${ORANGE[500]}, ${ORANGE[600]})`
                : undefined,
              color: location === '/executive/settings' ? 'white' : COLORS.gray[600],
              boxShadow: location === '/executive/settings' ? `${SHADOW.level2}, 0 4px 12px rgba(249, 115, 22, 0.3)` : undefined,
            }}
          >
            <Settings style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
            {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: TYPE.meta }}>Settings</span>}
          </motion.div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ x: 2, backgroundColor: getHoverBg(ORANGE[500], 0.08) }}
              transition={{ duration: MOTION.duration.hover }}
              className={cn(
                'flex items-center cursor-pointer text-stone-600 hover:text-stone-900 transition-colors',
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
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-orange-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setLocation('/executive/guide')}
            >
              <BookOpen style={{ width: 16, height: 16 }} />
              Executive Guide
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-orange-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search style={{ width: 16, height: 16 }} />
              <span className="flex-1">Search Commands</span>
              <kbd className="text-stone-400" style={{ fontSize: TYPE.micro }}>⌘K</kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-orange-50"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex overflow-x-hidden">
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
          className="absolute -right-3 bg-white border flex items-center justify-center hover:bg-orange-50 transition-colors z-40"
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
            <ChevronRight className="text-stone-600" style={{ width: 12, height: 12 }} />
          ) : (
            <ChevronLeft className="text-stone-600" style={{ width: 12, height: 12 }} />
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
                className="absolute hover:bg-stone-100 transition-colors"
                style={{
                  top: GRID.spacing.sm,
                  right: GRID.spacing.sm,
                  padding: GRID.spacing.xs,
                  borderRadius: RADIUS.button,
                }}
                aria-label="Close menu"
              >
                <X className="text-stone-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
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
        className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden lg:ml-0"
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
            <div className="flex items-center min-w-0 flex-1" style={{ gap: GRID.spacing.md }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden hover:bg-stone-100 transition-colors"
                style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                aria-label="Open menu"
              >
                <Menu className="text-stone-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              </button>

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center text-stone-500 hover:text-stone-700 transition-colors"
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
                            <span className="text-stone-400" style={{ fontSize: TYPE.meta }}>{crumb.label}</span>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>

            {/* Right: Lounge Switcher + Notifications + User + Logout */}
            <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.sm - 4 }}>
              {/* Lounge Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Crown style={{ width: 16, height: 16 }} />
                    <span className="hidden sm:inline font-medium" style={{ fontSize: TYPE.meta }}>Executive</span>
                    <ChevronDown style={{ width: 14, height: 14 }} className="text-stone-400" />
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
                  {visibleLounges.map((lounge) => {
                    const Icon = lounge.icon;
                    const isActive = lounge.id === 'executive';
                    return (
                      <DropdownMenuItem key={lounge.id} asChild>
                        <Link
                          href={lounge.path}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                            isActive ? 'bg-orange-50' : 'hover:bg-gray-50',
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
                            <p className={cn('font-medium', isActive ? 'text-orange-700' : 'text-stone-900')} style={{ fontSize: TYPE.meta }}>
                              {lounge.name}
                            </p>
                            <p className="text-stone-500 truncate" style={{ fontSize: TYPE.caption }}>{lounge.description}</p>
                          </div>
                          {isActive && (
                            <div className="bg-orange-500 flex-shrink-0" style={{ width: 8, height: 8, borderRadius: RADIUS.pill }} />
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
              <Link href="/executive/settings">
                <div
                  className="hidden sm:flex items-center border-l cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    gap: GRID.spacing.sm - 4,
                    paddingLeft: GRID.spacing.sm - 4,
                    borderColor: GLASS.border,
                  }}
                >
                  <div className="text-right" style={{ maxWidth: 140 }}>
                    <p className="font-medium text-stone-900 truncate" style={{ fontSize: TYPE.meta }}>
                      {currentUser?.name || 'Executive'}
                    </p>
                    <p className="text-stone-500 truncate" style={{ fontSize: TYPE.micro }}>
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
                      background: `linear-gradient(135deg, ${ORANGE[500]} 0%, ${ORANGE[700]} 100%)`,
                    }}
                  >
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'E'}
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
                className="text-stone-500 hover:text-stone-700"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24 lg:pb-6 overflow-x-hidden" style={{ padding: GRID.spacing.md }}>
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
            { icon: LayoutDashboard, label: 'Home', href: '/executive/dashboard' },
            { icon: DollarSign, label: 'Revenue', href: '/executive/revenue' },
            { icon: Users, label: 'Teams', href: '/executive/team' },
            { icon: FileBarChart, label: 'Reports', href: '/executive/reports' },
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
                    backgroundColor: isActive ? ORANGE[50] : 'transparent',
                    color: isActive ? ORANGE[600] : COLORS.gray[500],
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
            className="flex flex-col items-center transition-colors text-stone-500"
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
      <ExecutiveCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Contact Support Modal */}
      <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
    </div>
  );
}

export default ExecutiveLoungeLayout;
