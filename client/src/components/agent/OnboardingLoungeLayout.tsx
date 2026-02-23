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
  CalendarRange,
  Trophy,
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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NotificationDropdown } from "./NotificationDropdown";
import { OnboardingCommandPalette } from "./OnboardingCommandPalette";
import { ErrorBoundary } from "./primitives/ErrorBoundary";

// ============================================
// HERITAGE COMMAND LOUNGE DESIGN SYSTEM TOKENS
// ============================================

// 8-Point Modular Grid (U = 8px)
const GRID = {
  unit: 8,
  spacing: {
    xs: 8,    // 1U
    sm: 16,   // 2U
    md: 24,   // 3U
    lg: 32,   // 4U
    xl: 40,   // 5U
    xxl: 48,  // 6U
    xxxl: 64, // 8U
  },
} as const;

// Navigation dimensions (per spec)
const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 88;
const ICON_SIZE = 24;
const ROW_HEIGHT = 48; // 6U
const BUTTON_HEIGHT = 48; // 6U

// Golden Ratio
const PHI = 1.618;

// Typography Scale (per spec)
const TYPE = {
  display: 40,
  hero: 34,
  section: 24,
  body: 17,
  meta: 14,
  caption: 13,
} as const;

// Corner Radius (per spec)
const RADIUS = {
  button: 16,
  card: 24,
  hero: 32,
  pill: 9999,
} as const;

// Shadow System - Elevation Based
// ShadowBlur = Elevation × 6px, ShadowY = Elevation × 4px, Opacity = 0.02 × Elevation
const SHADOW = {
  level1: '0 4px 6px rgba(0,0,0,0.02)',
  level2: '0 8px 12px rgba(0,0,0,0.04)',
  level3: '0 12px 18px rgba(0,0,0,0.06)',
} as const;

// Motion System - Spring-based, critically damped
const MOTION = {
  easing: [0.22, 1, 0.36, 1] as const,
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
} as const;

// Glass Material System
const GLASS = {
  blur: 20,
  background: 'rgba(255,255,255,0.72)',
  backgroundSubtle: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.18)',
  borderSubtle: 'rgba(0,0,0,0.06)',
} as const;

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  badge?: number;
  locked?: boolean;
}

const journeyNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/agents/onboarding/lounge" },
  { icon: Rocket, label: "Day 1", href: "/agents/onboarding/day-1" },
  { icon: Target, label: "Day 2", href: "/agents/onboarding/day-2" },
  { icon: Calendar, label: "Days 3-7", href: "/agents/onboarding/days-3-7" },
  { icon: CalendarDays, label: "Days 8-30", href: "/agents/onboarding/days-8-30" },
  { icon: CalendarRange, label: "Days 31-90", href: "/agents/onboarding/days-31-90" },
  { icon: Trophy, label: "Days 91-180", href: "/agents/onboarding/days-91-180" },
  { icon: GraduationCap, label: "Days 181-365", href: "/agents/onboarding/days-181-365" },
];

const resourcesNavItems: NavItem[] = [
  { icon: BookOpen, label: "Resources", href: "/agents/onboarding/resources" },
  { icon: GraduationCap, label: "Course", href: "/agents/onboarding/study/course" },
  { icon: Users, label: "Get Help", href: "/agents/onboarding/help" },
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
  // Rough estimate: ~20 tasks per day phase, 365 day journey
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
      'days-31-90': '/agents/onboarding/days-31-90',
      'days-91-180': '/agents/onboarding/days-91-180',
      'days-181-365': '/agents/onboarding/days-181-365',
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

  // Navigation Section Component
  const NavSection = ({ title, items, sectionId }: { title: string; items: NavItem[]; sectionId: string }) => (
    <div className="mb-6">
      {!sidebarCollapsed && (
        <p
          className="px-3 mb-3 font-semibold text-gray-400 uppercase tracking-wider"
          style={{ fontSize: TYPE.caption - 2, letterSpacing: '0.05em' }}
        >
          {title}
        </p>
      )}
      <div style={{ gap: GRID.spacing.xs }} className="flex flex-col">
        {items.map((item) => {
          const isActive = isNavItemActive(item.href);
          const isLocked = item.locked;
          return (
            <Link key={item.href} href={isLocked ? "#" : item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 cursor-pointer relative transition-all duration-200",
                  sidebarCollapsed ? "justify-center" : "",
                  !isActive && !isLocked && "hover:bg-gray-100"
                )}
                style={{
                  padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
                  borderRadius: RADIUS.button,
                  minHeight: ROW_HEIGHT,
                  background: isActive
                    ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                    : undefined,
                  boxShadow: isActive
                    ? '0 4px 12px rgba(124, 58, 237, 0.4)'
                    : undefined,
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
                  className={cn(
                    "flex-shrink-0",
                    isActive ? "text-white" : isLocked ? "text-gray-300" : "text-gray-500"
                  )}
                  style={{ width: ICON_SIZE, height: ICON_SIZE }}
                />
                {!sidebarCollapsed && (
                  <>
                    <span
                      className={cn(
                        "font-semibold flex-1",
                        isActive ? "text-white" : isLocked ? "text-gray-300" : "text-gray-600"
                      )}
                      style={{ fontSize: TYPE.body - 2 }}
                    >
                      {item.label}
                    </span>
                    {isLocked && (
                      <Badge
                        variant="outline"
                        className="opacity-50"
                        style={{ fontSize: TYPE.caption - 3, padding: '2px 8px', borderRadius: RADIUS.pill }}
                      >
                        Locked
                      </Badge>
                    )}
                    {item.badge && (
                      <Badge
                        className={cn(
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        )}
                        style={{ fontSize: TYPE.caption - 3, padding: '2px 8px', borderRadius: RADIUS.pill }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  // Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: `0 ${GRID.spacing.md}px`, marginBottom: GRID.spacing.lg }}>
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div
            className="bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center"
            style={{
              width: GRID.spacing.xl,
              height: GRID.spacing.xl,
              borderRadius: RADIUS.button,
              boxShadow: SHADOW.level2,
            }}
          >
            <Sparkles className="text-amber-300" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>Heritage</p>
              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Onboarding</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Card - Glass Material */}
      {!sidebarCollapsed && (
        <div style={{ padding: `0 ${GRID.spacing.md}px`, marginBottom: GRID.spacing.lg }}>
          <div
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 text-white"
            style={{
              borderRadius: RADIUS.card,
              padding: GRID.spacing.md,
              boxShadow: `${SHADOW.level3}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
              <div className="flex items-center gap-2">
                <Zap className="text-amber-300" style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                <span className="font-semibold" style={{ fontSize: TYPE.meta }}>Day {currentDay}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="text-amber-400" style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                <span className="font-semibold" style={{ fontSize: TYPE.meta }}>{dayStreak}</span>
              </div>
            </div>
            {/* Progress bar - 8px height, 4px radius per spec */}
            <div
              className="bg-white/20 overflow-hidden"
              style={{ height: GRID.spacing.xs, borderRadius: GRID.spacing.xs / 2 }}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                style={{ width: `${onboardingProgress}%` }}
              />
            </div>
            <p className="text-violet-200" style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.sm }}>
              {onboardingProgress}% Complete · {365 - currentDay} days remaining
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: `0 ${GRID.spacing.sm}px` }}>
        <NavSection title="Your Journey" items={journeyNavItems} sectionId="journey" />
        <NavSection title="Resources" items={resourcesNavItems} sectionId="resources" />
      </nav>

      {/* Bottom Actions */}
      <div
        className="border-t border-gray-200/60 mt-auto"
        style={{ padding: `${GRID.spacing.md}px ${GRID.spacing.sm}px` }}
      >
        {/* Agent Lounge Link */}
        <Link href="/agents/dashboard">
          <div
            className={cn(
              "flex items-center gap-3 text-violet-600 hover:text-violet-700 hover:bg-violet-50 cursor-pointer",
              sidebarCollapsed && "justify-center"
            )}
            style={{
              padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
              borderRadius: RADIUS.button,
              minHeight: ROW_HEIGHT,
            }}
          >
            <ArrowLeft style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
            {!sidebarCollapsed && (
              <span className="font-medium" style={{ fontSize: TYPE.body - 2 }}>Agent Lounge</span>
            )}
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex">
      {/* Command Palette */}
      <OnboardingCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={handleNavigate}
        theme={theme}
      />

      {/* Desktop Sidebar - Glass Material */}
      <aside
        className="hidden lg:flex flex-col fixed h-screen"
        style={{
          width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
          zIndex: zIndex.fixed,
          backgroundColor: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
          borderRight: `1px solid ${GLASS.borderSubtle}`,
          paddingTop: GRID.spacing.lg,
          paddingBottom: GRID.spacing.md,
        }}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          style={{
            top: GRID.spacing.xxxl + GRID.spacing.lg,
            width: GRID.spacing.md,
            height: GRID.spacing.md,
            borderRadius: RADIUS.pill,
            boxShadow: SHADOW.level1,
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="text-gray-600" style={{ width: 12, height: 12 }} />
          ) : (
            <ChevronLeft className="text-gray-600" style={{ width: 12, height: 12 }} />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40"
            style={{
              zIndex: zIndex.modalBackdrop,
              backdropFilter: `blur(${GRID.spacing.xs}px)`,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="lg:hidden fixed left-0 top-0 bottom-0 bg-white flex flex-col"
            style={{
              width: SIDEBAR_EXPANDED,
              zIndex: zIndex.modal,
              paddingTop: GRID.spacing.lg,
              paddingBottom: GRID.spacing.md,
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute hover:bg-gray-100"
              style={{
                top: GRID.spacing.md,
                right: GRID.spacing.md,
                padding: GRID.spacing.xs,
                borderRadius: RADIUS.button / 2,
              }}
            >
              <X className="text-gray-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen",
        sidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"
      )}
      >
        {/* Top Bar - Glass Material */}
        <header
          className="sticky top-0"
          style={{
            zIndex: zIndex.sticky,
            backgroundColor: GLASS.background,
            backdropFilter: `blur(${GLASS.blur}px)`,
            WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
            borderBottom: `1px solid ${GLASS.borderSubtle}`,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: `0 ${GRID.spacing.md}px`,
              height: GRID.spacing.xxxl + GRID.spacing.sm, // 72px
            }}
          >
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden hover:bg-gray-100"
                style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button / 2 }}
              >
                <Menu className="text-gray-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              </button>

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center bg-gray-100/80 text-gray-500 hover:bg-gray-200/80"
                style={{
                  gap: GRID.spacing.xs,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                  borderRadius: RADIUS.button,
                  height: GRID.spacing.xl,
                }}
              >
                <Search style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
                <span className="hidden sm:inline" style={{ fontSize: TYPE.meta }}>Search...</span>
                <kbd
                  className="hidden md:inline-flex items-center bg-white border border-gray-300"
                  style={{
                    gap: 2,
                    padding: '2px 6px',
                    fontSize: TYPE.caption - 3,
                    borderRadius: GRID.spacing.xs / 2,
                  }}
                >
                  <span>⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Center: Day Progress (desktop) */}
            <div
              className="hidden lg:flex items-center bg-violet-50/80"
              style={{
                gap: GRID.spacing.sm,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                borderRadius: RADIUS.button,
                border: '1px solid rgba(139, 92, 246, 0.1)',
              }}
            >
              <Award className="text-violet-600" style={{ width: GRID.spacing.sm, height: GRID.spacing.sm }} />
              <div>
                <p className="text-violet-600 font-semibold" style={{ fontSize: TYPE.caption }}>Day {currentDay} of 365</p>
                <div
                  className="bg-violet-200/50 overflow-hidden"
                  style={{
                    height: 6,
                    width: 96,
                    borderRadius: 3,
                    marginTop: 4,
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                    style={{ width: `${onboardingProgress}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-violet-700" style={{ fontSize: TYPE.meta }}>{onboardingProgress}%</span>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={markNotificationRead}
                onMarkAllAsRead={markAllNotificationsRead}
                onClear={clearNotification}
              />

              <Link href="/agents/settings">
                <div
                  className="hidden sm:flex items-center cursor-pointer border-l border-gray-200 hover:opacity-90"
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

        {/* Page Content - Proper spacing per 8pt grid */}
        <main
          className="flex-1 overflow-x-hidden"
          style={{
            padding: GRID.spacing.lg,
            paddingBottom: GRID.spacing.xxxl + GRID.spacing.lg, // Extra for mobile nav
          }}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Glass Material */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0"
        style={{
          zIndex: zIndex.fixed,
          backgroundColor: GLASS.background,
          backdropFilter: `blur(${GLASS.blur}px)`,
          WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
          borderTop: `1px solid ${GLASS.borderSubtle}`,
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around" style={{ padding: `${GRID.spacing.xs}px 0` }}>
          {[
            { icon: Home, label: "Dashboard", href: "/agents/onboarding/lounge" },
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
                  <item.icon style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
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
            <Menu style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} aria-hidden="true" />
            <span className="font-medium" style={{ fontSize: TYPE.caption - 3 }}>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
