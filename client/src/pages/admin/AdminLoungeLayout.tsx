/**
 * AdminLoungeLayout - Admin Lounge Layout
 * Heritage Command Lounge Design System - Apple-Aligned CRM + Dashboard Architecture
 *
 * Custom layout matching Agent/Manager/Executive lounges:
 * - 8-Point Modular Grid (U = 8px)
 * - Glass Material System with backdrop-blur
 * - Apple-style motion curves
 * - Slate theme for admin lounge
 * - Collapsible sidebar with performance card
 * - Command palette (Cmd+K)
 * - Mobile bottom navigation
 * - Sidebar footer actions
 */

import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { LifeOSVersionBadge } from '@/components/lifeos/LifeOSVersionBadge';
import { useLoungeAccess } from '@/hooks/useLoungeAccess';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  Inbox,
  Star,
  Mail,
  Package,
  BarChart3,
  Bot,
  Cpu,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  LogOut,
  Menu,
  X,
  Leaf,
  Shield,
  Users,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  Briefcase,
  type LucideIcon,
  Crown
} from 'lucide-react';
import { goldCoastUrlForRole } from '@/lib/goldCoastUrl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
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

// ============================================
// CONSTANTS
// ============================================
const SIDEBAR_EXPANDED = LAYOUT.sidebar.expanded;
const SIDEBAR_COLLAPSED = LAYOUT.sidebar.collapsed;
const ROW_HEIGHT = LAYOUT.sidebar.rowHeight;
const ICON_SIZE = LAYOUT.sidebar.iconSize;
const SIDEBAR_STATE_KEY = 'admin-lounge-sidebar-collapsed';

// Slate gradient for admin
const SLATE = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
};

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
  { id: 'goldcoast', name: 'Gold Coast', icon: Crown, path: '#GOLD_COAST_PLACEHOLDER#', description: 'Founders Lounge — agency oversight ↗', gradient: 'from-amber-600 to-orange-700', external: true },
] as const;

// ============================================
// NAV ITEMS
// ============================================
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

const overviewItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
];

const contentItems: NavItem[] = [
  { icon: FileText, label: 'Content Manager', href: '/admin/content' },
];

const mediaItems: NavItem[] = [
  { icon: Image, label: 'Images', href: '/admin/images' },
  { icon: Video, label: 'Videos', href: '/admin/videos' },
];

const engagementItems: NavItem[] = [
  { icon: Inbox, label: 'Submissions', href: '/admin/submissions' },
  { icon: Star, label: 'Testimonials', href: '/admin/testimonials' },
  { icon: Mail, label: 'Newsletter', href: '/admin/newsletter' },
];

const productItems: NavItem[] = [
  { icon: Package, label: 'Product Catalog', href: '/admin/products' },
];

const intelligenceItems: NavItem[] = [
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Bot, label: 'Avatar Council', href: '/admin/avatar-council' },
  { icon: Cpu, label: 'Agent Ops', href: '/admin/agent-ops' },
  { icon: DollarSign, label: 'Lead Revenue', href: '/admin/lead-revenue' },
];

const membersItems: NavItem[] = [
  { icon: Users, label: 'Member Directory', href: '/admin/members' },
];

// ============================================
// COMMAND PALETTE NAV ROUTES
// ============================================
const ADMIN_ROUTES: Record<string, string> = {
  dashboard: '/admin',
  content: '/admin/content',
  images: '/admin/images',
  videos: '/admin/videos',
  submissions: '/admin/submissions',
  testimonials: '/admin/testimonials',
  newsletter: '/admin/newsletter',
  products: '/admin/products',
  analytics: '/admin/analytics',
  'avatar-council': '/admin/avatar-council',
  'agent-ops': '/admin/agent-ops',
  'lead-revenue': '/admin/lead-revenue',
  members: '/admin/members',
  settings: '/admin/settings',
};

const ADMIN_SEARCH_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'content', label: 'Content Manager', icon: FileText, href: '/admin/content' },
  { id: 'images', label: 'Image CDN', icon: Image, href: '/admin/images' },
  { id: 'videos', label: 'Video Manager', icon: Video, href: '/admin/videos' },
  { id: 'submissions', label: 'Submissions', icon: Inbox, href: '/admin/submissions' },
  { id: 'testimonials', label: 'Testimonials', icon: Star, href: '/admin/testimonials' },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, href: '/admin/newsletter' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/products' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'avatar-council', label: 'Avatar Council', icon: Bot, href: '/admin/avatar-council' },
  { id: 'agent-ops', label: 'Agent Ops', icon: Cpu, href: '/admin/agent-ops' },
  { id: 'lead-revenue', label: 'Lead Revenue', icon: DollarSign, href: '/admin/lead-revenue' },
  { id: 'members', label: 'Member Directory', icon: Users, href: '/admin/members' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

// ============================================
// LAYOUT PROPS
// ============================================
interface AdminLoungeLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

// Export styles for page-level use
export const adminLoungeStyles = {
  theme: {
    primary: COLORS.lounges.admin.main,
    light: COLORS.lounges.admin.light,
    dark: COLORS.lounges.admin.dark,
  },
  card: {
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export function AdminLoungeLayout({ children, breadcrumbs }: AdminLoungeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { hasAccess, isLoading: loungeAccessLoading } = useLoungeAccess();

  const visibleLounges = LOUNGE_OPTIONS.filter(
    lounge => lounge.id === 'admin' || (lounge as any).external || loungeAccessLoading || hasAccess(lounge.id)
  )
    .map((lounge) => lounge.path === '#GOLD_COAST_PLACEHOLDER#' ? { ...lounge, path: goldCoastUrlForRole(user?.role) } : lounge);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B — toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Cmd/Ctrl + K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        setCommandSearch('');
      }
      // Escape — close command palette
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const handleLogout = async () => {
    await signOut();
    setLocation('/admin/login');
  };

  const filteredSearchItems = commandSearch.trim()
    ? ADMIN_SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(commandSearch.toLowerCase())
      )
    : ADMIN_SEARCH_ITEMS;

  // ============================================
  // NAV SECTION COMPONENT
  // ============================================
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
          const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href + '/'));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{
                  x: 2,
                  backgroundColor: isActive ? undefined : getHoverBg(SLATE[500], 0.08),
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
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
                    ? `linear-gradient(135deg, ${SLATE[600]} 0%, ${SLATE[700]} 100%)`
                    : undefined,
                  color: isActive ? 'white' : COLORS.gray[600],
                  boxShadow: isActive ? `${SHADOW.level2}, 0 4px 12px rgba(100, 116, 139, 0.3)` : undefined,
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
        })}
      </div>
    </div>
  );

  // ============================================
  // SIDEBAR CONTENT
  // ============================================
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
            background: `linear-gradient(135deg, ${SLATE[600]} 0%, ${SLATE[700]} 100%)`,
          }}
        >
          <Leaf style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4, color: 'white' }} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body - 2 }}>Heritage</p>
            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Admin Lounge</p>
          </div>
        )}
      </div>

      {/* Performance Card - System Stats */}
      {!sidebarCollapsed && (
        <div style={{ padding: `0 ${GRID.spacing.sm}px`, marginBottom: GRID.spacing.lg }}>
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            style={{
              borderRadius: RADIUS.card,
              padding: GRID.spacing.sm,
              boxShadow: `${SHADOW.hero}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
              background: `linear-gradient(135deg, ${SLATE[600]} 0%, ${SLATE[800]} 50%, ${SLATE[500]} 100%)`,
              color: 'white',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <Shield style={{ width: 16, height: 16, color: SLATE[200] }} />
                <span className="font-medium" style={{ fontSize: TYPE.meta }}>System Admin</span>
              </div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium" style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.7)' }}>Live</span>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.xs }}>
              <span className="font-semibold" style={{ fontSize: TYPE.meta, color: SLATE[200] }}>Heritage Life</span>
              <span style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.6)' }}>heritagels.org</span>
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
                Admin Panel
              </span>
              <span className="font-bold" style={{ fontSize: TYPE.meta, color: SLATE[200] }}>
                {user?.firstName || 'Admin'}
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
        <NavSection title="Content" items={contentItems} />
        <NavSection title="Media" items={mediaItems} />
        <NavSection title="Engagement" items={engagementItems} />
        <NavSection title="Products" items={productItems} />
        <NavSection title="Intelligence" items={intelligenceItems} />
        <NavSection title="Members" items={membersItems} />
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
        <Link href="/admin/settings">
          <motion.div
            whileHover={{ x: 2, backgroundColor: getHoverBg(SLATE[500], 0.08) }}
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
            <Settings style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
            {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: TYPE.meta }}>Settings</span>}
          </motion.div>
        </Link>
        <motion.div
          whileHover={{ x: 2, backgroundColor: getHoverBg(SLATE[500], 0.08) }}
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
          <HelpCircle style={{ width: ICON_SIZE - 4, height: ICON_SIZE - 4 }} />
          {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: TYPE.meta }}>Help & Support</span>}
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
      {/* Command Palette Overlay */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.fast }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCommandPaletteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
            >
              <div
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.hero,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: GLASS.border }}>
                  <Search style={{ width: 18, height: 18 }} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admin pages..."
                    className="flex-1 bg-transparent outline-none text-gray-900"
                    style={{ fontSize: TYPE.body }}
                    value={commandSearch}
                    onChange={(e) => setCommandSearch(e.target.value)}
                    autoFocus
                  />
                  <kbd
                    className="text-gray-400 bg-gray-100 border"
                    style={{
                      padding: '2px 8px',
                      fontSize: TYPE.micro,
                      borderRadius: RADIUS.input,
                      borderColor: GLASS.border,
                    }}
                  >
                    ESC
                  </kbd>
                </div>
                <div className="max-h-80 overflow-y-auto py-2">
                  {filteredSearchItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setLocation(item.href);
                          setCommandPaletteOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isActive ? 'bg-slate-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: RADIUS.input,
                            background: isActive
                              ? `linear-gradient(135deg, ${SLATE[600]} 0%, ${SLATE[700]} 100%)`
                              : SLATE[100],
                          }}
                        >
                          <Icon style={{ width: 16, height: 16 }} className={isActive ? 'text-white' : 'text-slate-600'} />
                        </div>
                        <span
                          className={cn('font-medium', isActive ? 'text-slate-700' : 'text-gray-900')}
                          style={{ fontSize: TYPE.meta }}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: SLATE[500] }} />
                        )}
                      </button>
                    );
                  })}
                  {filteredSearchItems.length === 0 && (
                    <p className="text-center text-gray-500 py-8" style={{ fontSize: TYPE.meta }}>
                      No results found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
        animate={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
        className="flex-1 flex flex-col min-h-screen lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* Glass Header */}
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
            {/* Left: Mobile Menu + Search + Breadcrumbs */}
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
                onClick={() => { setCommandPaletteOpen(true); setCommandSearch(''); }}
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

              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="hidden md:flex items-center" style={{ gap: GRID.spacing.xs, fontSize: TYPE.meta }}>
                  <Link href="/admin">
                    <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Admin</span>
                  </Link>
                  {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <ChevronRight style={{ width: 14, height: 14 }} className="text-gray-300" />
                      {crumb.href ? (
                        <Link href={crumb.href}>
                          <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">{crumb.label}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-700 font-medium">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>

            {/* Right: lifeOS badge + Lounge Switcher + Notifications + User + Logout */}
            <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
              <LifeOSVersionBadge />
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
                    <Shield style={{ width: 16, height: 16 }} />
                    <span className="hidden sm:inline text-sm font-medium">Admin</span>
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
                    const isActive = lounge.id === 'admin';
                    return (
                      <DropdownMenuItem key={lounge.id} asChild>
                        {(lounge as any).external ? (
                          <a href={lounge.path} target="_blank" rel="noopener noreferrer" className={cn(
                            'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                            isActive ? 'bg-slate-50' : 'hover:bg-gray-50'
                          )} style={{ borderRadius: RADIUS.button }}>
                          <div
                            className={cn(
                              'w-8 h-8 flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                              lounge.gradient
                            )}
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium', isActive ? 'text-slate-700' : 'text-gray-900')}>
                              {lounge.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{lounge.description}</p>
                          </div>
                          {isActive && (
                            <div
                              className="w-2 h-2 flex-shrink-0"
                              style={{ borderRadius: RADIUS.pill, backgroundColor: SLATE[500] }}
                            />
                          )}
                          </a>
                        ) : (
                          <Link href={lounge.path} className={cn(
                            'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                            isActive ? 'bg-slate-50' : 'hover:bg-gray-50'
                          )} style={{ borderRadius: RADIUS.button }}>
                          <div
                            className={cn(
                              'w-8 h-8 flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                              lounge.gradient
                            )}
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium', isActive ? 'text-slate-700' : 'text-gray-900')}>
                              {lounge.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{lounge.description}</p>
                          </div>
                          {isActive && (
                            <div
                              className="w-2 h-2 flex-shrink-0"
                              style={{ borderRadius: RADIUS.pill, backgroundColor: SLATE[500] }}
                            />
                          )}
                          </Link>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <UnifiedNotificationSystem />

              {/* User Info */}
              <div
                className="hidden sm:flex items-center border-l"
                style={{
                  gap: GRID.spacing.sm - 4,
                  paddingLeft: GRID.spacing.sm - 4,
                  borderColor: GLASS.border,
                }}
              >
                <div className="text-right">
                  <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {user?.firstName || 'Admin'}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                    System Admin
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
                    background: `linear-gradient(135deg, ${SLATE[500]} 0%, ${SLATE[700]} 100%)`,
                  }}
                >
                  {user?.firstName?.[0] || 'A'}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
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
            { icon: LayoutDashboard, label: 'Home', href: '/admin' },
            { icon: Inbox, label: 'Submissions', href: '/admin/submissions' },
            { icon: FileText, label: 'Content', href: '/admin/content' },
            { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
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
                    backgroundColor: isActive ? SLATE[50] : 'transparent',
                    color: isActive ? SLATE[600] : COLORS.gray[500],
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

export default AdminLoungeLayout;
