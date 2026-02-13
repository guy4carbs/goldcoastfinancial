/**
 * LoungeLayout - Shared layout for all 8 lounges
 * Provides consistent sidebar, header, and content area across lounges
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
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
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { AgentActivityIndicator } from '@/components/agents/AgentActivityIndicator';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// CONSTANTS
// =============================================================================

const SIDEBAR_EXPANDED = 256; // w-64
const SIDEBAR_COLLAPSED = 64; // w-16
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

  // Color variants for active states
  const colorVariants: Record<string, { bg: string; text: string; border: string }> = {
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500' },
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
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all relative',
            isActive
              ? `${colors.bg} ${colors.text}`
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            isActive && `border-l-2 ${colors.border} ml-[-2px] pl-[14px]`
          )}
        >
          <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && colors.text)} />
          {!sidebarCollapsed && (
            <>
              <span className="font-medium text-sm flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                    item.badgeVariant === 'destructive'
                      ? 'bg-red-500 text-white'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
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
    <div className="mb-4">
      {!sidebarCollapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {section.title}
        </p>
      )}
      <div className="space-y-1">
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
      <div className={cn('flex items-center gap-3 px-3 mb-6', sidebarCollapsed && 'justify-center')}>
        {logo || (
          <div className={cn(`w-9 h-9 rounded-lg flex items-center justify-center bg-${loungeColor}-500`)}>
            <span className="text-white font-bold text-sm">{loungeName.charAt(0)}</span>
          </div>
        )}
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{loungeName}</p>
            {showLoungeSwitcher && (
              <LoungeSwitcher variant="link" className="text-[10px] text-gray-500 hover:text-gray-700" />
            )}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2">
        {sidebarSections.map((section, idx) => (
          <SidebarSectionComponent key={idx} section={section} />
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="border-t border-gray-200 pt-4 px-2 mt-auto">
          {footer}
        </div>
      )}
    </>
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Universal Search Modal */}
      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white border-r border-gray-200 py-4 fixed h-screen z-30"
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-40"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white py-4 flex flex-col z-50"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-200',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            {/* Left: Mobile Menu + Breadcrumbs/Search */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb className="hidden sm:flex">
                  <BreadcrumbList>
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

              {/* Search Button */}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Search...</span>
                  <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white rounded border border-gray-300">
                    <span>⌘</span>K
                  </kbd>
                </button>
              )}
            </div>

            {/* Right: Actions + Notifications + User */}
            <div className="flex items-center gap-3">
              {/* Agent Activity Indicator */}
              {showAgentIndicator && <AgentActivityIndicator mode="compact" />}

              {/* Custom Header Actions */}
              {headerActions}

              {/* Notifications */}
              {showNotifications && <UnifiedNotificationSystem />}

              {/* Lounge Switcher (dropdown in header) */}
              {showLoungeSwitcher && (
                <div className="hidden lg:block">
                  <LoungeSwitcher variant="dropdown" />
                </div>
              )}

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.displayName || user?.email || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'Guest'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-medium text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default LoungeLayout;
