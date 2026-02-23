/**
 * AgentLoungeLayout - Agent Lounge Layout
 * Heritage Command Lounge Design System - Apple-Aligned CRM + Dashboard Architecture
 *
 * Design System Specs:
 * - 8-Point Modular Grid (U = 8px)
 * - Golden Ratio (φ = 1.618) proportions
 * - Glass Material System with backdrop-blur
 * - Apple-style motion curves
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  BarChart3,
  DollarSign,
  FileText,
  BookOpen,
  Trophy,
  Star,
  MessageSquare,
  Megaphone,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Flame,
  Zap,
  Leaf,
  Calendar,
  Rocket,
  ClipboardCheck,
  Mail,
  Bot,
  Inbox,
  Shield,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { CommandPalette } from "./CommandPalette";
import { Onboarding } from "./Onboarding";
import { ErrorBoundary } from "./primitives/ErrorBoundary";

// =============================================================================
// HERITAGE COMMAND LOUNGE DESIGN SYSTEM
// =============================================================================

// 8-Point Modular Grid
const GRID = {
  unit: 8,
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
    xxxl: 64,
    xxxxl: 80,
    section: 96,
  },
};

// Typography Scale
const TYPE = {
  display: 40,
  hero: 34,
  section: 24,
  title: 20,
  body: 17,
  meta: 14,
  caption: 13,
  micro: 11,
  lineHeight: 1.4,
};

// Corner Radius System
const RADIUS = {
  button: 16,
  card: 24,
  hero: 32,
  pill: 9999,
};

// Elevation-Based Shadow System
const SHADOW = {
  level1: '0 4px 6px rgba(0, 0, 0, 0.02)',
  level2: '0 8px 12px rgba(0, 0, 0, 0.04)',
  level3: '0 12px 18px rgba(0, 0, 0, 0.06)',
  hero: '0 16px 24px rgba(0, 0, 0, 0.08)',
};

// Glass Material System
const GLASS = {
  blur: 20,
  background: 'rgba(255, 255, 255, 0.72)',
  backgroundDark: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(0, 0, 0, 0.06)',
};

// Motion System (Apple-style curves)
const MOTION = {
  easing: [0.22, 1, 0.36, 1],
  duration: {
    hover: 0.12,
    expand: 0.22,
    transition: 0.35,
    modal: 0.4,
  },
  hover: {
    y: -4,
    scale: 1.01,
  },
};

// Layout Dimensions
const LAYOUT = {
  sidebar: {
    expanded: 280,
    collapsed: 88,
    rowHeight: 48,
    iconSize: 24,
  },
  header: {
    height: 64,
  },
};

// Heritage Brand Colors
const COLORS = {
  primary: {
    violet: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
    },
  },
  accent: {
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
  },
};

const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'agent-lounge-sidebar-collapsed';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/agents/dashboard" },
  { icon: Inbox, label: "Lead Inbox", href: "/agents/inbox" },
  { icon: Calendar, label: "Calendar", href: "/agents/calendar" },
  { icon: BarChart3, label: "Performance", href: "/agents/performance" },
];

const toolsNavItems: NavItem[] = [
  { icon: CreditCard, label: "Member Cards", href: "/agents/member-cards" },
  { icon: Shield, label: "Data Encryption", href: "/agents/data-encryption" },
  { icon: Zap, label: "Automations", href: "/agents/automations" },
  { icon: Bot, label: "AI Avatar Council", href: "/agents/avatar-council" },
  { icon: FileText, label: "Quotes", href: "/agents/quotes" },
  { icon: BookOpen, label: "Scripts", href: "/agents/scripts" },
  { icon: BookOpen, label: "Resources", href: "/agents/resources" },
  { icon: ClipboardCheck, label: "Guidelines", href: "/agents/guidelines" },
];

const growthNavItems: NavItem[] = [
  { icon: Trophy, label: "Leaderboard", href: "/agents/leaderboard" },
  { icon: Star, label: "Achievements", href: "/agents/achievements" },
];

const teamNavItems: NavItem[] = [
  { icon: Mail, label: "Email", href: "/agents/email" },
  { icon: MessageSquare, label: "Chat", href: "/agents/chat" },
];

interface AgentLoungeLayoutProps {
  children: React.ReactNode;
}

export function AgentLoungeLayout({ children }: AgentLoungeLayoutProps) {
  // Sidebar state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
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
  const {
    currentUser,
    performance,
    notifications,
    theme,
    logout,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    getOverdueLeads,
  } = useAgentStore();

  // Get overdue leads count for badge
  const overdueCount = getOverdueLeads().length;

  // Navigation handler for command palette - uses wouter for SPA navigation (no page reload)
  const handleNavigate = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: '/agents/dashboard',
      inbox: '/agents/inbox',
      'getting-started': '/agents/getting-started',
      calendar: '/agents/calendar',
      performance: '/agents/performance',
      chat: '/agents/chat',
      email: '/agents/email',
      quotes: '/agents/quotes',
      scripts: '/agents/scripts',
      resources: '/agents/resources',
      guidelines: '/agents/guidelines',
      leaderboard: '/agents/leaderboard',
      achievements: '/agents/achievements',
      settings: '/agents/settings',
      'avatar-council': '/agents/avatar-council',
      automations: '/agents/automations',
      'data-encryption': '/agents/data-encryption',
    };
    if (routes[tab]) {
      setLocation(routes[tab]);
    }
  };

  // Action handler for command palette
  const handleAction = (action: string) => {
    console.log('Action:', action);
  };

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
        {items.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          // Dynamic badge for Lead Inbox showing overdue count
          const dynamicBadge = item.href === "/agents/inbox" && overdueCount > 0 ? overdueCount : item.badge;
          const isOverdueBadge = item.href === "/agents/inbox" && overdueCount > 0;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{
                  x: 2,
                  backgroundColor: isActive ? undefined : 'rgba(139, 92, 246, 0.08)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                className={cn(
                  "flex items-center cursor-pointer transition-all",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                    : "text-gray-600",
                  sidebarCollapsed && "justify-center"
                )}
                style={{
                  gap: GRID.spacing.sm - 4,
                  padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
                  borderRadius: RADIUS.button,
                  minHeight: ROW_HEIGHT,
                  boxShadow: isActive ? SHADOW.level2 : undefined,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon
                  className="flex-shrink-0"
                  style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }}
                />
                {!sidebarCollapsed && (
                  <>
                    <span
                      className="font-medium flex-1 truncate"
                      style={{ fontSize: TYPE.meta }}
                    >
                      {item.label}
                    </span>
                    {dynamicBadge && (
                      <Badge
                        className={cn(
                          "text-white",
                          isOverdueBadge ? "bg-red-500 animate-pulse" : isActive ? "bg-white/20" : "bg-gradient-to-r from-violet-500 to-purple-500"
                        )}
                        style={{
                          fontSize: TYPE.micro,
                          padding: '2px 6px',
                          height: 'auto',
                        }}
                      >
                        {dynamicBadge}
                      </Badge>
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className={cn("flex items-center", sidebarCollapsed && "justify-center")}
        style={{
          gap: GRID.spacing.sm - 4,
          padding: `0 ${GRID.spacing.md - 8}px`,
          marginBottom: GRID.spacing.lg,
        }}
      >
        <div
          className="bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center"
          style={{
            width: GRID.spacing.xl,
            height: GRID.spacing.xl,
            borderRadius: RADIUS.button,
            boxShadow: SHADOW.level2,
          }}
        >
          <Leaf className="text-white" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Agent Lounge</p>
          </div>
        )}
      </div>

      {/* User Level & XP Card */}
      {!sidebarCollapsed && (
        <div style={{ padding: `0 ${GRID.spacing.sm}px`, marginBottom: GRID.spacing.lg }}>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-purple-700 text-white"
            style={{
              borderRadius: RADIUS.card,
              padding: GRID.spacing.sm,
              boxShadow: SHADOW.hero,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <Zap className="text-amber-300" style={{ width: 16, height: 16 }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>Level {performance.level}</span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Flame className="text-orange-400" style={{ width: 16, height: 16 }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>{performance.currentStreak}</span>
              </div>
            </div>
            <div
              className="w-full bg-white/20"
              style={{ borderRadius: RADIUS.pill, height: 8 }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(performance.xp % 1000) / 10}%` }}
                transition={{ duration: 0.8, ease: MOTION.easing }}
                className="bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ height: 8, borderRadius: RADIUS.pill, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              />
            </div>
            <p className="text-violet-200" style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs }}>
              {1000 - (performance.xp % 1000)} XP to next level
            </p>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: `0 ${GRID.spacing.xs}px` }}
      >
        <NavSection title="Main" items={mainNavItems} />
        <NavSection title="Tools" items={toolsNavItems} />
        <NavSection title="Growth" items={growthNavItems} />
        <NavSection title="Team" items={teamNavItems} />
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
        <Link href="/agents/settings">
          <motion.div
            whileHover={{ x: 2, backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              "flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors",
              sidebarCollapsed && "justify-center"
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
        <Link href="/agents/help">
          <motion.div
            whileHover={{ x: 2, backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              "flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors",
              sidebarCollapsed && "justify-center"
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
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex">
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={handleNavigate}
        onAction={handleAction}
        theme={theme}
      />

      {/* Desktop Sidebar - Glass Material */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="hidden lg:flex flex-col fixed h-screen z-30"
        style={{
          backgroundColor: GLASS.backgroundDark,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
          borderRight: `1px solid ${GLASS.border}`,
          paddingTop: GRID.spacing.md,
          paddingBottom: GRID.spacing.md,
        }}
      >
        <SidebarContent />

        {/* Collapse Toggle - Floating Button */}
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
            borderRadius: RADIUS.pill,
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 flex flex-col z-50"
              style={{
                width: SIDEBAR_EXPANDED,
                backgroundColor: GLASS.backgroundDark,
                backdropFilter: `blur(${GLASS.blur}px)`,
                WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
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
        animate={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="flex-1 flex flex-col min-h-screen lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Top Bar - Glass Material */}
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
            style={{
              paddingLeft: GRID.spacing.md,
              paddingRight: GRID.spacing.md,
            }}
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

              <motion.button
                onClick={() => setCommandPaletteOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: MOTION.duration.hover }}
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
              </motion.button>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={markNotificationRead}
                onMarkAllAsRead={markAllNotificationsRead}
                onClear={clearNotification}
              />

              <Link href="/agents/settings">
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
                      {currentUser?.name || 'Agent'}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                      Level {performance.level} · {performance.xp} XP
                    </p>
                  </div>
                  <div
                    className="bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold"
                    style={{
                      width: GRID.spacing.xl,
                      height: GRID.spacing.xl,
                      borderRadius: RADIUS.button,
                      boxShadow: SHADOW.level2,
                      fontSize: TYPE.meta,
                    }}
                  >
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </div>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  setLocation("/agents/login");
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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </motion.div>

      {/* Onboarding for new agents */}
      <Onboarding />

      {/* Mobile Bottom Navigation - Glass Material */}
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
            { icon: Home, label: "Home", href: "/agents/dashboard" },
            { icon: Inbox, label: "Inbox", href: "/agents/inbox" },
            { icon: BarChart3, label: "Performance", href: "/agents/performance" },
            { icon: Calendar, label: "Calendar", href: "/agents/calendar" },
          ].map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: MOTION.duration.hover }}
                  className={cn(
                    "flex flex-col items-center transition-colors",
                    isActive ? "text-violet-600" : "text-gray-500"
                  )}
                  style={{
                    gap: 4,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm - 4}px`,
                    borderRadius: RADIUS.button,
                    backgroundColor: isActive ? COLORS.primary.violet[50] : 'transparent',
                  }}
                  role="link"
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
                  <span className="font-medium" style={{ fontSize: TYPE.micro }}>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
          {/* More menu button */}
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
            aria-label="Open menu for more options"
            aria-expanded={mobileMenuOpen}
          >
            <Menu style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
            <span className="font-medium" style={{ fontSize: TYPE.micro }}>More</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
