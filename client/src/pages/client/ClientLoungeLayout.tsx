/**
 * Client Lounge Layout — Fully Custom
 * Matches Agent/Manager Lounge architecture: collapsible sidebar, gradient active states,
 * policy summary card, mobile nav, floating collapse toggle
 *
 * Heritage Design System — Violet theme with amber accents
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
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
  Shield,
  FileText,
  Users,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Calendar,
  Gift,
  Settings,
  User,
  Leaf,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bell,
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

// ─── CONSTANTS ───
const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'client-lounge-sidebar-collapsed';

// Violet color tokens
const VIOLET = {
  50: '#f5f3ff',
  200: '#ddd6fe',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
};

// Amber color tokens
const AMBER = {
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
};

// ─── NAV ITEMS ───
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const overviewItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
];

const insuranceItems: NavItem[] = [
  { icon: Shield, label: 'My Policies', href: '/client/policies' },
  { icon: FileText, label: 'Documents', href: '/client/documents' },
  { icon: Users, label: 'Beneficiaries', href: '/client/beneficiaries' },
];

const financialItems: NavItem[] = [
  { icon: CreditCard, label: 'Billing & Payments', href: '/client/billing' },
  { icon: ClipboardList, label: 'Claims', href: '/client/claims' },
];

const communicationItems: NavItem[] = [
  { icon: MessageSquare, label: 'Messages', href: '/client/messages' },
  { icon: Calendar, label: 'Appointments', href: '/client/appointments' },
];

const accountItems: NavItem[] = [
  { icon: Gift, label: 'Refer a Friend', href: '/client/referral' },
];

// ─── CLIENT THEME ───
export const clientTheme = {
  colors: {
    light: VIOLET[50],
    main: VIOLET[600],
    dark: VIOLET[700],
  },
  radius: RADIUS.card,
  shadow: SHADOW.card,
  motion: MOTION,
  typography: TYPE,
};

// Demo policy data for sidebar card
const TOTAL_COVERAGE = 1_275_000;
const ACTIVE_POLICIES = 3;
const NEXT_PAYMENT = 'Apr 1, 2026';
const MONTHLY_PREMIUM = 729;

// Demo notifications for client
const CLIENT_NOTIFICATIONS = [
  {
    id: 'cn1',
    type: 'reminder' as const,
    title: 'Payment Due Soon',
    description: 'Your monthly premium of $729 is due on Apr 1, 2026.',
    time: '2 days ago',
    read: false,
  },
  {
    id: 'cn2',
    type: 'message' as const,
    title: 'New Message from Agent',
    description: 'Your agent sent you a policy review summary.',
    time: '1 week ago',
    read: false,
  },
  {
    id: 'cn3',
    type: 'achievement' as const,
    title: 'Policy Anniversary',
    description: 'Congratulations on 1 year with your Whole Life policy!',
    time: '2 weeks ago',
    read: true,
  },
];

// ─── LAYOUT COMPONENT ───
interface ClientLoungeLayoutProps {
  children: ReactNode;
}

export function ClientLoungeLayout({ children }: ClientLoungeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(CLIENT_NOTIFICATIONS);

  const { user, signOut } = useAuth();

  // Derive user display info
  const userFirstName = user?.firstName || 'Client';
  const userLastName = user?.lastName || '';
  const userFullName = [userFirstName, userLastName].filter(Boolean).join(' ');
  const userInitials = [userFirstName, userLastName]
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'C';

  // Notification handlers
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // All nav items flat for lookups
  const ALL_NAV_ITEMS = [
    ...overviewItems,
    ...insuranceItems,
    ...financialItems,
    ...communicationItems,
    ...accountItems,
  ];
  const navItemMap = Object.fromEntries(
    ALL_NAV_ITEMS.map((item: NavItem) => [item.href, item])
  );

  // Breadcrumb derivation for sub-pages
  const sections = [
    { title: 'Overview', items: overviewItems },
    { title: 'Insurance', items: insuranceItems },
    { title: 'Financial', items: financialItems },
    { title: 'Connect', items: communicationItems },
    { title: 'Account', items: accountItems },
  ];

  const breadcrumbs = (() => {
    const segments = location.split('/').filter(Boolean);
    if (segments.length < 3) return [];

    const crumbs: { label: string; href?: string }[] = [];
    const parentPath = '/' + segments.slice(0, 2).join('/');
    const parentItem = navItemMap[parentPath];

    const sectionMap: Record<string, string> = {};
    sections.forEach((s) =>
      s.items.forEach((item: NavItem) => {
        sectionMap[item.href] = s.title;
      })
    );

    if (parentItem) {
      const sectionTitle = sectionMap[parentPath];
      if (sectionTitle) crumbs.push({ label: sectionTitle });
      crumbs.push({ label: parentItem.label, href: parentItem.href });
    }

    const detailSegment = segments[2];
    if (detailSegment) {
      crumbs.push({
        label: detailSegment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
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

  // ─── NAV ITEM RENDERER ───
  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive =
      location === item.href || location.startsWith(item.href + '/');
    return (
      <Link key={item.href} href={item.href}>
        <motion.div
          whileHover={{
            x: 2,
            backgroundColor: isActive
              ? undefined
              : getHoverBg(VIOLET[500], 0.08),
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: MOTION.duration.hover,
            ease: MOTION.easing,
          }}
          className={cn(
            'flex items-center cursor-pointer transition-all',
            sidebarCollapsed && 'justify-center'
          )}
          style={{
            gap: GRID.spacing.sm - 4,
            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
            borderRadius: RADIUS.button,
            minHeight: ROW_HEIGHT,
            background: isActive
              ? `linear-gradient(135deg, ${VIOLET[600]} 0%, ${VIOLET[700]} 100%)`
              : undefined,
            color: isActive ? 'white' : COLORS.gray[600],
            boxShadow: isActive
              ? `${SHADOW.level2}, 0 4px 12px rgba(124, 58, 237, 0.3)`
              : undefined,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon
            className="flex-shrink-0"
            style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
          />
          {!sidebarCollapsed && (
            <span
              className="font-medium flex-1 truncate"
              style={{ fontSize: TYPE.meta }}
            >
              {item.label}
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  // ─── NAV SECTION ───
  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: NavItem[];
  }) => (
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.xs / 2,
        }}
      >
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
        className={cn(
          'flex items-center',
          sidebarCollapsed && 'justify-center'
        )}
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
            background: `linear-gradient(135deg, ${VIOLET[500]} 0%, ${VIOLET[700]} 100%)`,
          }}
        >
          <Shield
            style={{
              width: ICON_SIZE - 4,
              height: ICON_SIZE - 4,
              color: 'white',
            }}
          />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p
              className="font-bold text-gray-900"
              style={{ fontSize: TYPE.body - 2 }}
            >
              Heritage
            </p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
              Client Lounge
            </p>
          </div>
        )}
      </div>

      {/* Policy Summary Card */}
      {!sidebarCollapsed && (
        <div
          style={{
            padding: `0 ${GRID.spacing.sm}px`,
            marginBottom: GRID.spacing.lg,
          }}
        >
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.easing,
            }}
            style={{
              borderRadius: RADIUS.card,
              padding: GRID.spacing.sm,
              boxShadow: `${SHADOW.hero}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
              background:
                'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)',
              color: 'white',
            }}
          >
            {/* Top row: Coverage + Policies */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: GRID.spacing.xs }}
            >
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.xs }}
              >
                <Shield
                  style={{ width: 16, height: 16, color: AMBER[300] }}
                />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>
                  ${(TOTAL_COVERAGE / 1000).toLocaleString()}K Coverage
                </span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Zap
                  style={{ width: 16, height: 16, color: AMBER[400] }}
                />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>
                  {ACTIVE_POLICIES} Active
                </span>
              </div>
            </div>

            {/* Premium row */}
            <div
              className="flex items-center justify-between"
              style={{ marginTop: GRID.spacing.xs }}
            >
              <span
                className="font-semibold"
                style={{ fontSize: TYPE.meta, color: AMBER[300] }}
              >
                ${MONTHLY_PREMIUM}/mo
              </span>
              <span
                style={{ fontSize: TYPE.caption, color: VIOLET[200] }}
              >
                Monthly Premium
              </span>
            </div>

            {/* Next payment row */}
            <div
              className="flex items-center justify-between"
              style={{
                marginTop: GRID.spacing.xs,
                paddingTop: GRID.spacing.xs,
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span
                style={{
                  fontSize: TYPE.caption,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Next Payment
              </span>
              <span
                className="font-bold"
                style={{ fontSize: TYPE.meta, color: AMBER[300] }}
              >
                {NEXT_PAYMENT}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: `0 ${GRID.spacing.xs}px` }}
      >
        <NavSection title="Overview" items={overviewItems} />
        <NavSection title="Insurance" items={insuranceItems} />
        <NavSection title="Financial" items={financialItems} />
        <NavSection title="Connect" items={communicationItems} />
        <NavSection title="Account" items={accountItems} />
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
        {/* Profile & Settings */}
        <Link href="/client/settings">
          <motion.div
            whileHover={{
              x: 2,
              backgroundColor: getHoverBg(VIOLET[500], 0.08),
            }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              'flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
            style={{
              gap: GRID.spacing.sm - 4,
              padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
              borderRadius: RADIUS.button,
              minHeight: ROW_HEIGHT,
            }}
          >
            <User
              style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
            />
            {!sidebarCollapsed && (
              <span
                className="font-medium"
                style={{ fontSize: TYPE.meta }}
              >
                Profile & Settings
              </span>
            )}
          </motion.div>
        </Link>

        {/* Help & Support */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{
                x: 2,
                backgroundColor: getHoverBg(VIOLET[500], 0.08),
              }}
              transition={{ duration: MOTION.duration.hover }}
              className={cn(
                'flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
              style={{
                gap: GRID.spacing.sm - 4,
                padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
                borderRadius: RADIUS.button,
                minHeight: ROW_HEIGHT,
              }}
            >
              <HelpCircle
                style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
              />
              {!sidebarCollapsed && (
                <span
                  className="font-medium"
                  style={{ fontSize: TYPE.meta }}
                >
                  Help & Support
                </span>
              )}
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
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-violet-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setLocation('/client/help')}
            >
              <HelpCircle style={{ width: 16, height: 16 }} />
              Help Center
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-violet-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setLocation('/client/support')}
            >
              <MessageSquare style={{ width: 16, height: 16 }} />
              Contact Support
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-violet-50"
              style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
              onClick={() => setLocation('/client/help')}
            >
              <FileText style={{ width: 16, height: 16 }} />
              FAQs
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
        animate={{
          width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        }}
        transition={{
          duration: MOTION.duration.expand,
          ease: MOTION.easing,
        }}
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
          aria-label={
            sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
        >
          {sidebarCollapsed ? (
            <ChevronRight
              className="text-gray-600"
              style={{ width: 12, height: 12 }}
            />
          ) : (
            <ChevronLeft
              className="text-gray-600"
              style={{ width: 12, height: 12 }}
            />
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
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
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
                <X
                  className="text-gray-600"
                  style={{
                    width: ICON_SIZE - 4,
                    height: ICON_SIZE - 4,
                  }}
                />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed
            ? SIDEBAR_COLLAPSED
            : SIDEBAR_EXPANDED,
        }}
        transition={{
          duration: MOTION.duration.expand,
          ease: MOTION.easing,
        }}
        className="flex-1 flex flex-col min-h-screen lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Header — Glass Material */}
        <header
          className="sticky top-0 z-20"
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${GLASS.border}`,
            height: LAYOUT.header.height,
          }}
        >
          <div
            className="flex items-center justify-between h-full"
            style={{
              paddingLeft: GRID.spacing.md,
              paddingRight: GRID.spacing.md,
            }}
          >
            {/* Left: Mobile Menu + Breadcrumbs */}
            <div
              className="flex items-center"
              style={{ gap: GRID.spacing.md }}
            >
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden hover:bg-gray-100 transition-colors"
                style={{
                  padding: GRID.spacing.xs,
                  borderRadius: RADIUS.button,
                }}
                aria-label="Open menu"
              >
                <Menu
                  className="text-gray-600"
                  style={{
                    width: ICON_SIZE - 4,
                    height: ICON_SIZE - 4,
                  }}
                />
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
                            <BreadcrumbPage
                              style={{ fontSize: TYPE.meta }}
                            >
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href}>
                                <span style={{ fontSize: TYPE.meta }}>
                                  {crumb.label}
                                </span>
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <span
                              className="text-gray-400"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {crumb.label}
                            </span>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>

            {/* Right: Notifications + User + Logout */}
            <div
              className="flex items-center"
              style={{ gap: GRID.spacing.sm - 4 }}
            >
              {/* Notifications */}
              <div className="relative">
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={markNotificationRead}
                  onMarkAllAsRead={markAllNotificationsRead}
                  onClear={clearNotification}
                />
                {notifications.filter((n) => !n.read).length > 0 && (
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
                    {notifications.filter((n) => !n.read).length}
                  </div>
                )}
              </div>

              {/* User Info */}
              <Link href="/client/settings">
                <div
                  className="hidden sm:flex items-center border-l cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    gap: GRID.spacing.sm - 4,
                    paddingLeft: GRID.spacing.sm - 4,
                    borderColor: GLASS.border,
                  }}
                >
                  <div className="text-right">
                    <p
                      className="font-medium text-gray-900"
                      style={{ fontSize: TYPE.meta }}
                    >
                      {userFullName}
                    </p>
                    <p
                      className="text-gray-500"
                      style={{ fontSize: TYPE.micro }}
                    >
                      {user?.email || 'client@heritage.com'}
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
                      background: `linear-gradient(135deg, ${VIOLET[500]} 0%, ${VIOLET[700]} 100%)`,
                    }}
                  >
                    {userInitials}
                  </div>
                </div>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  setLocation('/client/login');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 pb-24 lg:pb-6"
          style={{ padding: GRID.spacing.md }}
        >
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
        <div
          className="flex items-center justify-around"
          style={{ padding: `${GRID.spacing.xs}px 0` }}
        >
          {[
            {
              icon: LayoutDashboard,
              label: 'Home',
              href: '/client/dashboard',
            },
            { icon: Shield, label: 'Policies', href: '/client/policies' },
            {
              icon: MessageSquare,
              label: 'Messages',
              href: '/client/messages',
            },
            {
              icon: CreditCard,
              label: 'Billing',
              href: '/client/billing',
            },
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
                    backgroundColor: isActive
                      ? VIOLET[50]
                      : 'transparent',
                    color: isActive ? VIOLET[600] : COLORS.gray[500],
                  }}
                  role="link"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon
                    style={{
                      width: ICON_SIZE - 4,
                      height: ICON_SIZE - 4,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-medium"
                    style={{ fontSize: TYPE.micro }}
                  >
                    {item.label}
                  </span>
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
            <Menu
              style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
              aria-hidden="true"
            />
            <span
              className="font-medium"
              style={{ fontSize: TYPE.micro }}
            >
              More
            </span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}

export default ClientLoungeLayout;
