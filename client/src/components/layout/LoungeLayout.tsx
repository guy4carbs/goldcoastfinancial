/**
 * LoungeLayout - Shared layout for all lounges
 * Heritage Command Lounge Design System - Apple-Aligned CRM + Dashboard Architecture
 *
 * Design System Specs:
 * - 8-Point Modular Grid (U = 8px)
 * - Golden Ratio (φ = 1.618) proportions
 * - Glass Material System with backdrop-blur
 * - Apple-style motion curves
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { PersistedScrollNav } from './PersistedScrollNav';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbUIItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { LoungeSwitcher } from '@/components/navigation/LoungeSwitcher';
import { NotificationBell } from '@/components/tour/NotificationBell';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { AgentActivityIndicator } from '@/components/agents/AgentActivityIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { TOUR } from '@/lib/tour/selectors';

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

// =============================================================================
// CONSTANTS
// =============================================================================

const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'lounge-sidebar-collapsed';

// =============================================================================
// TYPES
// =============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'destructive' | 'warning';
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface LoungeLayoutProps {
  children: ReactNode;
  loungeName: string;
  loungeColor: string; // Tailwind color class e.g., 'violet', 'emerald', 'blue'
  sidebarSections: SidebarSection[];
  headerActions?: ReactNode;
  showSearch?: boolean;
  showLoungeSwitcher?: boolean;
  showNotifications?: boolean;
  showAgentIndicator?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  logo?: ReactNode;
  footer?: ReactNode;
  /** Brand name shown above lounge name in sidebar (e.g., "Heritage") */
  brandName?: string;
  /** Custom search placeholder text */
  searchPlaceholder?: string;
  /** Custom user info section to replace default in header */
  userInfo?: ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LoungeLayout({
  children,
  loungeName,
  loungeColor,
  sidebarSections,
  headerActions,
  showSearch = true,
  showLoungeSwitcher = true,
  showNotifications = true,
  showAgentIndicator = false,
  breadcrumbs,
  logo,
  footer,
  brandName,
  searchPlaceholder = 'Search...',
  userInfo,
}: LoungeLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Sidebar state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = useCallback(() => {
    logout();
    setLocation('/');
  }, [logout, setLocation]);

  // Color variants for active states with Heritage Design System colors
  const colorVariants: Record<string, {
    bg: string;
    text: string;
    border: string;
    gradient: string;
    hoverBg: string;
  }> = {
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-600',
      border: 'border-violet-500',
      gradient: 'from-violet-600 to-purple-600',
      hoverBg: 'rgba(139, 92, 246, 0.08)',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      gradient: 'from-emerald-600 to-teal-600',
      hoverBg: 'rgba(16, 185, 129, 0.08)',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-500',
      gradient: 'from-blue-600 to-indigo-600',
      hoverBg: 'rgba(59, 130, 246, 0.08)',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-500',
      gradient: 'from-amber-600 to-orange-600',
      hoverBg: 'rgba(245, 158, 11, 0.08)',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500',
      gradient: 'from-rose-600 to-pink-600',
      hoverBg: 'rgba(244, 63, 94, 0.08)',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-600',
      border: 'border-cyan-500',
      gradient: 'from-cyan-600 to-teal-600',
      hoverBg: 'rgba(6, 182, 212, 0.08)',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-500',
      gradient: 'from-indigo-600 to-violet-600',
      hoverBg: 'rgba(99, 102, 241, 0.08)',
    },
    slate: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-600',
      border: 'border-slate-500',
      gradient: 'from-slate-600 to-gray-600',
      hoverBg: 'rgba(100, 116, 139, 0.08)',
    },
  };
  const colors = colorVariants[loungeColor] || colorVariants.violet;

  // ==========================================================================
  // SIDEBAR ITEM COMPONENT
  // ==========================================================================

  const SidebarItemComponent = ({ item }: { item: SidebarItem }) => {
    const isActive = location === item.href || location.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link href={item.href}>
        <motion.div
          whileHover={{
            x: 2,
            backgroundColor: colors.hoverBg,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          className={cn(
            'flex items-center cursor-pointer transition-all relative',
            isActive
              ? `${colors.bg} ${colors.text}`
              : 'text-gray-600 hover:text-gray-900',
            isActive && `border-l-2 ${colors.border} ml-[-2px]`,
            sidebarCollapsed && 'justify-center'
          )}
          style={{
            gap: GRID.spacing.sm - 4,
            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.md - 8}px`,
            paddingLeft: isActive ? GRID.spacing.md - 10 : GRID.spacing.md - 8,
            borderRadius: RADIUS.button,
            minHeight: ROW_HEIGHT,
          }}
        >
          <Icon
            className={cn('flex-shrink-0', isActive && colors.text)}
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
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'font-medium',
                    item.badgeVariant === 'destructive'
                      ? 'bg-red-500 text-white'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                  style={{
                    fontSize: TYPE.micro,
                    padding: '2px 6px',
                    borderRadius: RADIUS.pill,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </motion.div>
      </Link>
    );
  };

  // ==========================================================================
  // SIDEBAR SECTION COMPONENT
  // ==========================================================================

  const SidebarSectionComponent = ({ section }: { section: SidebarSection }) => (
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
          {section.title}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
        {section.items.map((item) => (
          <SidebarItemComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  // ==========================================================================
  // SIDEBAR CONTENT
  // ==========================================================================

  const SidebarContent = () => (
    <>
      {/* Logo / Lounge Header */}
      {logo ? (
        <div style={{ padding: `0 ${GRID.spacing.md - 8}px` }}>
          {logo}
        </div>
      ) : (
        <div
          className={cn('flex items-center', sidebarCollapsed && 'justify-center')}
          style={{
            gap: GRID.spacing.sm - 4,
            padding: `0 ${GRID.spacing.md - 8}px`,
            marginBottom: GRID.spacing.lg,
          }}
        >
          <div
            className={cn(`flex items-center justify-center bg-gradient-to-br ${colors.gradient}`)}
            style={{
              width: GRID.spacing.xl,
              height: GRID.spacing.xl,
              borderRadius: RADIUS.button,
              boxShadow: SHADOW.level2,
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: TYPE.meta }}>
              {loungeName.charAt(0)}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              {brandName && (
                <p
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.body - 2 }}
                >
                  {brandName}
                </p>
              )}
              <p
                className={cn(brandName ? "text-gray-500" : "font-semibold text-gray-900", "truncate")}
                style={{ fontSize: brandName ? TYPE.caption : TYPE.body - 2 }}
              >
                {loungeName}
              </p>
              {showLoungeSwitcher && (
                <LoungeSwitcher
                  variant="link"
                  className="text-gray-500 hover:text-gray-700"
                  style={{ fontSize: TYPE.micro }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <PersistedScrollNav
        className="flex-1 overflow-y-auto"
        style={{ padding: `0 ${GRID.spacing.xs}px` }}
      >
        {sidebarSections.map((section, idx) => (
          <SidebarSectionComponent key={idx} section={section} />
        ))}
      </PersistedScrollNav>

      {/* Footer */}
      {footer && (
        <div
          className="border-t mt-auto"
          style={{
            borderColor: GLASS.border,
            paddingTop: GRID.spacing.sm,
            padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px 0`,
          }}
        >
          {footer}
        </div>
      )}
    </>
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
      {/* Universal Search Modal */}
      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Desktop Sidebar - Glass Material */}
      <motion.aside
        data-tour-id={TOUR.SHELL.SIDEBAR}
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="hidden md:flex flex-col fixed h-screen z-30"
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
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_EXPANDED }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 flex flex-col z-50"
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

      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="flex-1 flex flex-col min-h-screen md:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Header - Glass Material */}
        <header
          data-tour-id={TOUR.SHELL.TOPBAR}
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
            {/* Left: Mobile Menu + Breadcrumbs/Search */}
            <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden hover:bg-gray-100 transition-colors"
                style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button }}
                aria-label="Open menu"
              >
                <Menu className="text-gray-600" style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
              </button>

              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb className="hidden sm:flex">
                  <BreadcrumbList style={{ fontSize: TYPE.meta }}>
                    {breadcrumbs.map((crumb, idx) => (
                      <BreadcrumbUIItem key={idx}>
                        {idx > 0 && <BreadcrumbSeparator />}
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbUIItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}

              {/* Search Button - Glass Style */}
              {showSearch && (
                <motion.button
                  data-tour-id={TOUR.SHELL.SEARCH}
                  onClick={() => setSearchOpen(true)}
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
                  <span className="hidden sm:inline" style={{ fontSize: TYPE.meta }}>{searchPlaceholder}</span>
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
              )}
            </div>

            {/* Right: Actions + Notifications + User */}
            <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
              {/* Agent Activity Indicator */}
              {showAgentIndicator && <AgentActivityIndicator mode="compact" />}

              {/* Custom Header Actions */}
              {headerActions}

              {/* Notifications */}
              {showNotifications && <NotificationBell />}

              {/* Lounge Switcher (dropdown in header) */}
              {showLoungeSwitcher && (
                <div data-tour-id={TOUR.SHELL.APP_SWITCHER} className="hidden lg:block">
                  <LoungeSwitcher variant="dropdown" />
                </div>
              )}

              {/* User Menu */}
              {userInfo || (
                <div
                  data-tour-id={TOUR.SHELL.USER_MENU}
                  className="hidden sm:flex items-center border-l"
                  style={{
                    gap: GRID.spacing.sm - 4,
                    paddingLeft: GRID.spacing.sm - 4,
                    borderColor: GLASS.border,
                  }}
                >
                  <div className="text-right">
                    <p
                      className="font-medium text-gray-900 truncate"
                      style={{ fontSize: TYPE.meta, maxWidth: 120 }}
                    >
                      {user?.displayName || user?.email || 'User'}
                    </p>
                    <p className="text-gray-500 capitalize" style={{ fontSize: TYPE.micro }}>
                      {user?.role || 'Guest'}
                    </p>
                  </div>
                  <div
                    className={cn(`flex items-center justify-center text-white font-medium bg-gradient-to-br ${colors.gradient}`)}
                    style={{
                      width: GRID.spacing.xl - 4,
                      height: GRID.spacing.xl - 4,
                      borderRadius: RADIUS.pill,
                      fontSize: TYPE.meta,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                </div>
              )}

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Logout"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1"
          style={{
            padding: GRID.spacing.md,
          }}
        >
          {children}
        </main>
      </motion.div>
    </div>
  );
}

export default LoungeLayout;
