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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { useLoungeAccess } from "@/hooks/useLoungeAccess";
import {
  Home,
  Users,
  BarChart3,
  DollarSign,
  Handshake,
  ShoppingBag,
  Contact,
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
  ClipboardList,
  Mail,
  Bot,
  Inbox,
  Shield,
  CreditCard,
  FolderOpen,
  Network,
  Phone,
  LayoutDashboard,
  ChevronDown,
  HeadphonesIcon,
  Briefcase,
  Lightbulb,
  UserPlus,
  Globe,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { CommandPalette } from "./CommandPalette";
import { Onboarding } from "./Onboarding";
import { ErrorBoundary } from "./primitives/ErrorBoundary";

// Import centralized design system
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
} from "@/lib/heritageDesignSystem";

const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'agent-lounge-sidebar-collapsed';

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

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  badge?: number;
}

// COMMAND CENTER - Daily operations hub
const commandCenterItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/agents/dashboard" },
  { icon: BarChart3, label: "Performance", href: "/agents/performance" },
  { icon: Inbox, label: "Lead Inbox", href: "/agents/inbox" },
  { icon: Calendar, label: "Calendar", href: "/agents/calendar" },
  { icon: Briefcase, label: "Book of Business", href: "/agents/book-of-business" },
  { icon: Handshake, label: "Agency Deals", href: "/agents/deals" },
];

// CLIENTS - Client management & servicing
const clientItems: NavItem[] = [
  { icon: Users, label: "My Clients", href: "/agents/clients" },
  { icon: ClipboardList, label: "Claims", href: "/agents/claims" },
  { icon: CreditCard, label: "Member Cards", href: "/agents/member-cards" },
  { icon: Contact, label: "Business Card", href: "/agents/business-card" },
  { icon: Globe, label: "Your Website", href: "/agents/website" },
];

// OUTREACH - All communication & engagement
const outreachItems: NavItem[] = [
  { icon: Phone, label: "Dialer", href: "/agents/dialer" },
  { icon: MessageSquare, label: "Communications", href: "/agents/communications" },
  { icon: BookOpen, label: "Scripts", href: "/agents/scripts" },
  { icon: UserPlus, label: "Recruiting", href: "/agents/recruiting" },
];

// SALES TOOLKIT - Selling tools
const toolkitItems: NavItem[] = [
  { icon: FileText, label: "Quotes", href: "/agents/quotes" },
  { icon: Shield, label: "Data Encryption", href: "/agents/data-encryption" },
  { icon: FolderOpen, label: "Resources", href: "/agents/resources" },
  { icon: Bot, label: "AI Avatar Council", href: "/agents/avatar-council" },
];

// GROWTH - Development & gamification
const growthItems: NavItem[] = [
  { icon: Trophy, label: "Leaderboard", href: "/agents/leaderboard" },
  { icon: Star, label: "Achievements", href: "/agents/achievements" },
  { icon: Network, label: "My Hierarchy", href: "/agents/hierarchy" },
  { icon: DollarSign, label: "My Commissions", href: "/agents/commissions" },
  { icon: ShoppingBag, label: "Buy Leads", href: "/agents/lead-marketplace" },
  { icon: GraduationCap, label: "Training Sessions", href: "/agents/training-sessions" },
  { icon: ClipboardCheck, label: "Guidelines", href: "/agents/guidelines" },
  { icon: Lightbulb, label: "Ideas & Feedback", href: "/agents/ideas" },
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
  const { hasAccess, isLoading: loungeAccessLoading } = useLoungeAccess();

  // Filter LOUNGE_OPTIONS by DB access (current lounge always visible)
  const visibleLounges = LOUNGE_OPTIONS.filter(
    lounge => lounge.id === 'agent' || loungeAccessLoading || hasAccess(lounge.id)
  );

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
    theme,
    logout,
    getOverdueLeads,
    leads,
  } = useAgentStore();

  // Lead inbox badge — disabled to avoid count mismatch. Shows 0 (no badge).
  const overdueCount = 0;

  const queryClient = useQueryClient();

  // Fetch agent's personal deal stats from real API
  const { data: myDealStats } = useQuery<{ success: boolean; data: { totalAP: number; totalDeals: number; rank: number } }>({
    queryKey: ['/api/deals/my-stats?period=month'],
    staleTime: 60000,
  });

  // Fetch real notifications from API
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/portal/notifications'],
    refetchInterval: 30000,
  });
  const notifications = (Array.isArray(notificationsData) ? notificationsData : []) as any[];

  const markNotificationRead = async (notificationId: string) => {
    try {
      await apiRequest('PATCH', `/api/portal/notifications/${notificationId}/read`);
      queryClient.invalidateQueries({ queryKey: ['/api/portal/notifications'] });
    } catch {
      // Silently fail
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiRequest('PATCH', '/api/portal/notifications/read-all');
      queryClient.invalidateQueries({ queryKey: ['/api/portal/notifications'] });
    } catch {
      // Silently fail
    }
  };

  const clearNotification = (id: string) => {
    // Remove from local view by marking as read (API doesn't have a delete endpoint)
    markNotificationRead(id);
  };

  // Navigation handler for command palette - uses wouter for SPA navigation (no page reload)
  const handleNavigate = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: '/agents/dashboard',
      inbox: '/agents/inbox',
      'getting-started': '/agents/getting-started',
      calendar: '/agents/calendar',
      performance: '/agents/performance',
      dialer: '/agents/dialer',
      communications: '/agents/communications',
      quotes: '/agents/quotes',
      scripts: '/agents/scripts',
      resources: '/agents/resources',
      guidelines: '/agents/guidelines',
      leaderboard: '/agents/leaderboard',
      achievements: '/agents/achievements',
      hierarchy: '/agents/hierarchy',
      settings: '/agents/settings',
      'avatar-council': '/agents/avatar-council',
      'member-cards': '/agents/member-cards',
      ideas: '/agents/ideas',
      'book-of-business': '/agents/book-of-business',
      clients: '/agents/clients',
      recruiting: '/agents/recruiting',
      crm: '/agents/clients',
      email: '/agents/communications',
      chat: '/agents/communications',
      training: '/agents/training-sessions',
      videos: '/agents/resources',
      carriers: '/agents/resources',
      sops: '/agents/guidelines',
      earnings: '/agents/commissions',
    };
    if (routes[tab]) {
      setLocation(routes[tab]);
    }
  };

  // Action handler for command palette - routes to real pages
  const handleAction = (action: string) => {
    switch (action) {
      case 'log-call':
        setLocation('/agents/dialer');
        break;
      case 'add-lead':
        setLocation('/agents/inbox');
        break;
      case 'schedule':
        setLocation('/agents/calendar');
        break;
      case 'leaderboard':
        setLocation('/agents/leaderboard');
        break;
      case 'achievements':
        setLocation('/agents/achievements');
        break;
      case 'notifications':
        // Just open the notification dropdown by scrolling to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'toggle-theme':
        useAgentStore.getState().toggleTheme();
        break;
      case 'logout':
        logout();
        setLocation('/agents/login');
        break;
      default:
        break;
    }
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
                  backgroundColor: isActive ? undefined : getHoverBg(COLORS.primary.violet[500], 0.08),
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                className={cn(
                  "flex items-center cursor-pointer transition-all",
                  sidebarCollapsed && "justify-center"
                )}
                style={{
                  gap: GRID.spacing.sm - 4,
                  padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
                  borderRadius: RADIUS.button,
                  minHeight: ROW_HEIGHT,
                  background: isActive
                    ? `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 100%)`
                    : undefined,
                  color: isActive ? 'white' : COLORS.gray[600],
                  boxShadow: isActive ? `${SHADOW.level2}, 0 4px 12px rgba(124, 58, 237, 0.3)` : undefined,
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
                          isOverdueBadge && "animate-pulse"
                        )}
                        style={{
                          fontSize: TYPE.micro,
                          padding: '2px 6px',
                          height: 'auto',
                          background: isOverdueBadge
                            ? COLORS.semantic.error
                            : isActive
                            ? 'rgba(255, 255, 255, 0.2)'
                            : `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[500]} 100%)`,
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
      {/* Logo - height matches header so level card aligns with hero */}
      <div
        className={cn("flex items-center", sidebarCollapsed && "justify-center")}
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
            background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 100%)`,
          }}
        >
          <Leaf style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4, color: 'white' }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Agent Lounge</p>
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
              background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 50%, #f59e0b 100%)`,
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
              <span className="font-semibold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>${(myDealStats?.data?.totalAP || performance.xp || 0).toLocaleString()}</span>
              <span style={{ fontSize: TYPE.caption, color: COLORS.primary.violet[200] }}>
                {myDealStats?.data?.totalDeals || performance.dailyCloses || 0} sales
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
                Agent Rank
              </span>
              <span className="font-bold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                #{myDealStats?.data?.rank || performance.rank || 1}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto scrollbar-none"
        style={{ padding: `0 ${GRID.spacing.xs}px` }}
      >
        <NavSection title="Command Center" items={commandCenterItems} />
        <NavSection title="Clients" items={clientItems} />
        <NavSection title="Outreach" items={outreachItems} />
        <NavSection title="Sales Toolkit" items={toolkitItems} />
        <NavSection title="Growth" items={growthItems} />
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
            whileHover={{ x: 2, backgroundColor: getHoverBg(COLORS.primary.violet[500], 0.08) }}
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
            whileHover={{ x: 2, backgroundColor: getHoverBg(COLORS.primary.violet[500], 0.08) }}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
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
          backgroundColor: '#ffffff',
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

            {/* Right: Lounge Switcher + Notifications + User */}
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
                    <Users style={{ width: 16, height: 16 }} />
                    <span className="hidden sm:inline text-sm font-medium">Agent</span>
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
                  {visibleLounges.map((lounge) => {
                    const Icon = lounge.icon;
                    const isActive = lounge.id === 'agent';
                    return (
                      <DropdownMenuItem key={lounge.id} asChild>
                        <Link
                          href={lounge.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                            isActive ? "bg-violet-50" : "hover:bg-gray-50"
                          )}
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                              lounge.gradient
                            )}
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", isActive ? "text-violet-700" : "text-gray-900")}>
                              {lounge.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{lounge.description}</p>
                          </div>
                          {isActive && (
                            <div
                              className="w-2 h-2 bg-violet-500 flex-shrink-0"
                              style={{ borderRadius: RADIUS.pill }}
                            />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

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
                      Level {performance.level} · ${(myDealStats?.data?.totalAP || performance.xp || 0).toLocaleString()}
                    </p>
                  </div>
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="object-cover"
                      style={{
                        width: GRID.spacing.xl,
                        height: GRID.spacing.xl,
                        borderRadius: RADIUS.button,
                        boxShadow: SHADOW.level2,
                      }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center text-white font-bold"
                      style={{
                        width: GRID.spacing.xl,
                        height: GRID.spacing.xl,
                        borderRadius: RADIUS.button,
                        boxShadow: SHADOW.level2,
                        fontSize: TYPE.meta,
                        background: `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[600]} 100%)`,
                      }}
                    >
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                    </div>
                  )}
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
            { icon: MessageSquare, label: "Outreach", href: "/agents/communications" },
            { icon: FileText, label: "Quotes", href: "/agents/quotes" },
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
                    backgroundColor: isActive ? COLORS.primary.violet[50] : 'transparent',
                    color: isActive ? COLORS.primary.violet[600] : COLORS.gray[500],
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
