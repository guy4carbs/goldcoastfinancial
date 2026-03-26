import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAgentStore } from "@/lib/agentStore";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { cn } from "@/lib/utils";
import { zIndex } from "@/lib/designTokens";
import {
  Home,
  Rocket,
  Target,
  Calendar,
  CalendarDays,
  GraduationCap,
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
  Settings,
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NotificationDropdown } from "./NotificationDropdown";
import { OnboardingCommandPalette } from "./OnboardingCommandPalette";
import { ErrorBoundary } from "./primitives/ErrorBoundary";
import { motion } from "framer-motion";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  GLASS,
  LAYOUT,
  COLORS,
  getHoverBg,
} from "@/lib/heritageDesignSystem";

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  badge?: number;
  locked?: boolean;
}

const journeyNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/agents/onboarding/lounge" },
  { icon: Rocket, label: "Day 1: Launch", href: "/agents/onboarding/day-1" },
  { icon: Target, label: "Day 2: Script", href: "/agents/onboarding/day-2" },
  { icon: Calendar, label: "Week 1", href: "/agents/onboarding/days-3-7" },
  { icon: CalendarDays, label: "Month 1", href: "/agents/onboarding/days-8-30" },
];

const resourcesNavItems: NavItem[] = [
  { icon: BookOpen, label: "Resources", href: "/agents/onboarding/resources" },
  { icon: GraduationCap, label: "Study & Train", href: "/agents/onboarding/study/course" },
  { icon: Users, label: "Support", href: "/agents/onboarding/help" },
];

interface OnboardingLoungeLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLoungeLayout({ children }: OnboardingLoungeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const {
    currentUser,
    performance,
    notifications,
    theme,
    logout,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
  } = useAgentStore();

  // Get persistent onboarding progress
  const { currentDay, completedTasks, totalXp, startDate, badges } = useOnboardingProgress();

  // Calculate overall onboarding progress (based on total tasks across all days)
  // Rough estimate: ~20 tasks per day phase, 30 day journey
  const onboardingProgress = useMemo(() => {
    const totalExpectedTasks = 150; // Approximate total tasks across all phases
    return Math.min(Math.round((completedTasks.length / totalExpectedTasks) * 100), 100);
  }, [completedTasks]);

  // Calculate day streak (consecutive days with activity)
  const dayStreak = useMemo(() => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // For now, assume streak = days since start if they have completed tasks
    return completedTasks.length > 0 ? Math.min(diffDays, currentDay) : 0;
  }, [startDate, completedTasks, currentDay]);

  // Navigation handler for command palette
  const handleNavigate = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: '/agents/onboarding/lounge',
      'day-1': '/agents/onboarding/day-1',
      'day-2': '/agents/onboarding/day-2',
      'days-3-7': '/agents/onboarding/days-3-7',
      'days-8-30': '/agents/onboarding/days-8-30',
      resources: '/agents/onboarding/resources',
      course: '/agents/onboarding/study/course',
      fundamentals: '/agents/onboarding/study/fundamentals',
      flashcards: '/agents/onboarding/study/flashcards',
      'practice-exam': '/agents/onboarding/study/practice-exam',
      help: '/agents/onboarding/help',
    };
    if (routes[tab]) {
      setLocation(routes[tab]);
    }
  };

  // Helper to check if a nav item should be active
  const isNavItemActive = (itemHref: string): boolean => {
    // Exact match
    if (location === itemHref) return true;
    // Child route match
    if (location.startsWith(itemHref + "/")) return true;
    // Special case: Course link should be active for all /study/* routes
    if (itemHref === "/agents/onboarding/study/course" && location.startsWith("/agents/onboarding/study/")) return true;
    return false;
  };

  // Navigation Section Component — matches AgentLoungeLayout
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
          const isActive = isNavItemActive(item.href);
          const isLocked = item.locked;
          return (
            <Link key={item.href} href={isLocked ? "#" : item.href}>
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
                  minHeight: LAYOUT.rowHeight,
                  background: isActive
                    ? `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 100%)`
                    : undefined,
                  color: isActive ? 'white' : COLORS.gray[600],
                  boxShadow: isActive ? `${SHADOW.level2}, 0 4px 12px rgba(124, 58, 237, 0.3)` : undefined,
                }}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <item.icon
                  className="flex-shrink-0"
                  style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                />
                {!sidebarCollapsed && (
                  <>
                    <span
                      className="font-medium flex-1 truncate"
                      style={{ fontSize: TYPE.meta }}
                    >
                      {item.label}
                    </span>
                    {isLocked && (
                      <Badge
                        variant="outline"
                        className="opacity-50"
                        style={{ fontSize: TYPE.micro, padding: '2px 6px', height: 'auto' }}
                      >
                        Locked
                      </Badge>
                    )}
                    {item.badge && (
                      <Badge
                        className="text-white"
                        style={{
                          fontSize: TYPE.micro,
                          padding: '2px 6px',
                          height: 'auto',
                          background: isActive
                            ? 'rgba(255, 255, 255, 0.2)'
                            : `linear-gradient(135deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[500]} 100%)`,
                        }}
                      >
                        {item.badge}
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

  // Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Logo — matches AgentLoungeLayout */}
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
          <Leaf style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md, color: 'white' }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Onboarding</p>
          </div>
        )}
      </div>

      {/* Progress Card — matches AgentLoungeLayout performance card */}
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
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>Day {currentDay}</span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Flame style={{ width: 16, height: 16, color: COLORS.accent.amber[400] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>{dayStreak}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div
              className="bg-white/20 overflow-hidden"
              style={{ height: GRID.spacing.xs, borderRadius: GRID.spacing.xs / 2 }}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                style={{ width: `${onboardingProgress}%` }}
              />
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
                {onboardingProgress}% done
              </span>
              <span className="font-bold" style={{ fontSize: TYPE.meta, color: COLORS.accent.amber[300] }}>
                {30 - currentDay > 0 ? `${30 - currentDay} days left` : 'Complete'}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: `0 ${GRID.spacing.xs}px` }}>
        <NavSection title="Your Path" items={journeyNavItems} />
        <NavSection title="Learn & Grow" items={resourcesNavItems} />
      </nav>

      {/* Bottom Actions — matches AgentLoungeLayout */}
      <div
        className="mt-auto"
        style={{
          borderTop: `1px solid ${GLASS.border}`,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px 0`,
        }}
      >
        <Link href="/agents/dashboard">
          <motion.div
            whileHover={{ x: 2, backgroundColor: getHoverBg(COLORS.primary.violet[500], 0.08) }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              "flex items-center cursor-pointer",
              sidebarCollapsed && "justify-center"
            )}
            style={{
              gap: GRID.spacing.sm - 4,
              padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
              borderRadius: RADIUS.button,
              minHeight: LAYOUT.rowHeight,
              color: COLORS.primary.violet[600],
            }}
          >
            <ArrowLeft style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
            {!sidebarCollapsed && (
              <span className="font-medium" style={{ fontSize: TYPE.meta }}>Back to Agent Hub</span>
            )}
          </motion.div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
      {/* Command Palette */}
      <OnboardingCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={handleNavigate}
        theme={theme}
      />

      {/* Desktop Sidebar — matches AgentLoungeLayout */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? LAYOUT.sidebar.collapsed : LAYOUT.sidebar.expanded }}
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

        {/* Collapse Toggle — matches AgentLoungeLayout */}
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

      {/* Mobile Sidebar Overlay — matches AgentLoungeLayout with AnimatePresence */}
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
            initial={{ x: -LAYOUT.sidebar.expanded }}
            animate={{ x: 0 }}
            exit={{ x: -LAYOUT.sidebar.expanded }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 flex flex-col z-50"
            style={{
              width: LAYOUT.sidebar.expanded,
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
              <X className="text-gray-600" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
            </button>
            <SidebarContent />
          </motion.aside>
        </>
      )}

      {/* Main Content — matches AgentLoungeLayout with animated marginLeft */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? LAYOUT.sidebar.collapsed : LAYOUT.sidebar.expanded,
        }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="flex-1 flex flex-col min-h-screen lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Top Bar — matches AgentLoungeLayout header height */}
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
                <Menu className="text-gray-600" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
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
                <span className="hidden sm:inline" style={{ fontSize: TYPE.meta }}>Search...</span>
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
                  className="hidden sm:flex items-center cursor-pointer hover:opacity-90"
                  style={{ gap: GRID.spacing.sm, paddingLeft: GRID.spacing.sm }}
                >
                  <div className="text-right">
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {currentUser?.name || 'New Agent'}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption - 2 }}>
                      Onboarding · Day {currentDay}
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
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                style={{ borderRadius: RADIUS.button / 2 }}
              >
                <LogOut style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content — matches AgentLoungeLayout padding */}
        <main
          className="flex-1 pb-24 lg:pb-6"
          style={{ padding: GRID.spacing.md }}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </motion.div>

      {/* Mobile Bottom Navigation - Glass Material */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0"
        style={{
          zIndex: zIndex.fixed,
          backgroundColor: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
          borderTop: `1px solid ${GLASS.border}`,
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around" style={{ padding: `${GRID.spacing.xs}px 0` }}>
          {[
            { icon: Home, label: "Home", href: "/agents/onboarding/lounge" },
            { icon: Rocket, label: "Day 1", href: "/agents/onboarding/day-1" },
            { icon: Target, label: "Day 2", href: "/agents/onboarding/day-2" },
            { icon: Calendar, label: "Week 1", href: "/agents/onboarding/days-3-7" },
          ].map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center",
                    isActive ? "text-violet-600" : "text-gray-500"
                  )}
                  style={{
                    gap: 4,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.button,
                    backgroundColor: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  }}
                  role="link"
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon style={{ width: LAYOUT.icon.lg - 4, height: LAYOUT.icon.lg - 4 }} aria-hidden="true" />
                  <span className="font-medium" style={{ fontSize: TYPE.caption - 3 }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center text-gray-500"
            style={{
              gap: 4,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
              borderRadius: RADIUS.button,
            }}
            aria-label="Open menu for more options"
            aria-expanded={mobileMenuOpen}
          >
            <Menu style={{ width: LAYOUT.icon.lg - 4, height: LAYOUT.icon.lg - 4 }} aria-hidden="true" />
            <span className="font-medium" style={{ fontSize: TYPE.caption - 3 }}>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
