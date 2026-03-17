/**
 * Lobby Layout
 * The welcoming entrance to Heritage Insurance
 * Clean, minimal navigation - the lobby is about the experience, not data entry
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, spacing } from '@/lib/heritageDesignSystem';
import {
  Home,
  Users,
  Bot,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  Shield,
  BarChart3,
  Briefcase,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Leaf,
  Sparkles,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedNotificationSystem } from "@/components/notifications/UnifiedNotificationSystem";
import { UniversalSearch } from "@/components/search/UniversalSearch";
import { AgentLoungeSelectorModal } from "@/components/agent/AgentLoungeSelectorModal";

// =============================================================================
// CONSTANTS
// =============================================================================

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;

// =============================================================================
// TYPES
// =============================================================================

interface LoungeItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
  gradient: string;
  description: string;
  requiredRoles: string[];
}

// =============================================================================
// LOUNGE NAVIGATION - The main feature of the Lobby
// =============================================================================

const lounges: LoungeItem[] = [
  {
    id: 'agent',
    icon: Users,
    label: "Agent Lounge",
    href: "/agents/dashboard",
    gradient: "from-violet-500 to-purple-600",
    description: "Leads, quotes, pipeline",
    requiredRoles: ['owner', 'system_admin', 'manager', 'sales_agent', 'client'],
  },
  {
    id: 'finance',
    icon: DollarSign,
    label: "Finance Lounge",
    href: "/finance/dashboard",
    gradient: "from-blue-800 to-blue-950",
    description: "Commissions, revenue",
    requiredRoles: ['owner', 'system_admin', 'manager', 'investor'],
  },
  {
    id: 'marketing',
    icon: Megaphone,
    label: "Marketing Lounge",
    href: "/marketing/dashboard",
    gradient: "from-rose-500 to-pink-600",
    description: "Campaigns, content",
    requiredRoles: ['owner', 'system_admin', 'manager', 'marketing_staff'],
  },
  {
    id: 'ai',
    icon: Bot,
    label: "AI Lounge",
    href: "/ai/dashboard",
    gradient: "from-cyan-500 to-blue-600",
    description: "AI agents, automation",
    requiredRoles: ['owner', 'system_admin'],
  },
  {
    id: 'manager',
    icon: Briefcase,
    label: "Manager Lounge",
    href: "/manager/dashboard",
    gradient: "from-emerald-500 to-emerald-700",
    description: "Team oversight",
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'director',
    icon: Building2,
    label: "Director Lounge",
    href: "/manager/director",
    gradient: "from-blue-700 to-slate-900",
    description: "Multi-team oversight",
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    label: "Support Lounge",
    href: "/support/dashboard",
    gradient: "from-gray-700 to-gray-900",
    description: "Tickets, help desk",
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'executive',
    icon: BarChart3,
    label: "Executive Lounge",
    href: "/executive/dashboard",
    gradient: "from-orange-500 to-orange-700",
    description: "KPIs, forecasting",
    requiredRoles: ['owner', 'system_admin', 'investor'],
  },
  {
    id: 'admin',
    icon: Shield,
    label: "Admin Lounge",
    href: "/admin",
    gradient: "from-slate-500 to-blue-700",
    description: "System settings",
    requiredRoles: ['owner', 'system_admin'],
  },
  {
    id: 'investor',
    icon: BarChart3,
    label: "Investor Lounge",
    href: "/investor/dashboard",
    gradient: "from-amber-500 to-yellow-600",
    description: "KPIs & dashboards",
    requiredRoles: ['owner', 'investor'],
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface LobbyLayoutProps {
  children: React.ReactNode;
}

export function LobbyLayout({ children }: LobbyLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for search (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // Filter lounges by user role
  const accessibleLounges = lounges.filter((lounge) =>
    lounge.requiredRoles.includes(user?.role || '')
  );

  // ==========================================================================
  // SIDEBAR CONTENT
  // ==========================================================================

  const SidebarContent = () => (
    <>
      {/* Logo - total height matches header + main padding so welcome card aligns with hero */}
      <div
        className={cn("flex items-center gap-3 px-4", sidebarCollapsed && "justify-center px-2")}
        style={{ minHeight: 48, marginBottom: 24 }}
      >
        <motion.div
          whileHover={{ scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
          className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
          style={{
            borderRadius: RADIUS.button,
            boxShadow: SHADOW.level3,
          }}
        >
          <Leaf className="w-5 h-5 text-white" />
        </motion.div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-gray-900">Heritage</p>
            <p className="text-xs text-gray-500">Insurance Lobby</p>
          </div>
        )}
      </div>

      {/* Welcome Card */}
      {!sidebarCollapsed && (
        <div className="px-4 mb-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="p-4 text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 50%, #f59e0b 100%)`,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">{greeting()}</span>
              </div>
              <p className="font-semibold">
                {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
              </p>
              <p className="text-xs text-white/70 mt-1">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Home Link */}
      <div className="px-3 mb-4">
        <Link href="/crm">
          <motion.div
            whileHover={{
              x: 4,
              boxShadow: location !== '/crm' ? SHADOW.level2 : undefined,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: 'spring',
              damping: MOTION.spring.damping,
              stiffness: MOTION.spring.stiffness,
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
              location === '/crm'
                ? "text-white"
                : "text-gray-600 hover:bg-violet-50/80"
            )}
            style={{
              borderRadius: RADIUS.button,
              ...(location === '/crm' && {
                background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 60%, #f59e0b 100%)`,
                boxShadow: `${SHADOW.level3}, 0 4px 12px rgba(124, 58, 237, 0.3)`,
              }),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium text-sm">Lobby Home</span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Lounges Section */}
      <nav className="flex-1 overflow-y-auto px-3">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Your Lounges
          </p>
        )}
        <motion.div
          className="space-y-1"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {accessibleLounges.map((lounge, index) => {
            // Special handling for Agent Lounge - open selector modal
            if (lounge.id === 'agent') {
              return (
                <motion.div
                  key={lounge.id}
                  variants={fadeInUp}
                  whileHover={{
                    x: 4,
                    y: MOTION.hover.y / 2,
                    boxShadow: SHADOW.level2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    damping: MOTION.spring.damping,
                    stiffness: MOTION.spring.stiffness,
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                    "text-gray-600 hover:bg-indigo-50/80"
                  )}
                  style={{ borderRadius: RADIUS.button }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAgentSelectorOpen(true);
                  }}
                >
                  <div
                    className={cn("w-8 h-8 flex items-center justify-center bg-gradient-to-br", lounge.gradient)}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <lounge.icon className="w-4 h-4 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm text-gray-900">{lounge.label}</span>
                  )}
                </motion.div>
              );
            }

            // Default: regular Link navigation for other lounges
            return (
              <Link key={lounge.id} href={lounge.href}>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{
                    x: 4,
                    y: MOTION.hover.y / 2,
                    boxShadow: SHADOW.level2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    damping: MOTION.spring.damping,
                    stiffness: MOTION.spring.stiffness,
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                    "text-gray-600 hover:bg-indigo-50/80"
                  )}
                  style={{ borderRadius: RADIUS.button }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn("w-8 h-8 flex items-center justify-center bg-gradient-to-br", lounge.gradient)}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <lounge.icon className="w-4 h-4 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm text-gray-900">{lounge.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 pt-4 px-3 mt-auto">
        <Link href="/crm/settings">
          <motion.div
            whileHover={{ x: 2, backgroundColor: COLORS.lounges.crm.light }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              "flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-500 hover:text-indigo-700 transition-colors",
              sidebarCollapsed && "justify-center"
            )}
            style={{ borderRadius: RADIUS.input }}
          >
            <Settings className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm">Settings</span>}
          </motion.div>
        </Link>
        <Link href="/crm/help">
          <motion.div
            whileHover={{ x: 2, backgroundColor: COLORS.lounges.crm.light }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: MOTION.duration.hover }}
            className={cn(
              "flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-500 hover:text-indigo-700 transition-colors",
              sidebarCollapsed && "justify-center"
            )}
            style={{ borderRadius: RADIUS.input }}
          >
            <HelpCircle className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm">Help</span>}
          </motion.div>
        </Link>
      </div>
    </>
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/50 flex">
      {/* Universal Search Modal */}
      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Agent Lounge Selector Modal */}
      <AgentLoungeSelectorModal open={agentSelectorOpen} onOpenChange={setAgentSelectorOpen} />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: MOTION.duration.expand, ease: MOTION.easing as unknown as [number, number, number, number] }}
        className="hidden lg:flex flex-col border-r border-gray-200/60 py-6 fixed h-screen z-30"
        style={{ boxShadow: SHADOW.level1, backgroundColor: '#ffffff' }}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.1, boxShadow: SHADOW.level3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: MOTION.duration.hover }}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center transition-colors hover:bg-indigo-50 hover:border-indigo-200"
          style={{ boxShadow: SHADOW.level2 }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
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
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: MOTION.spring.type,
                damping: MOTION.spring.damping,
                stiffness: MOTION.spring.stiffness,
              }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white py-6 flex flex-col z-50"
              style={{ boxShadow: SHADOW.hero }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
      )}>
        {/* Top Bar */}
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <motion.button
                onClick={() => setSearchOpen(true)}
                whileHover={{ scale: 1.02, boxShadow: SHADOW.level2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: MOTION.duration.hover }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                style={{ borderRadius: RADIUS.button }}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Search anything...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white rounded border border-gray-300">
                  <span>⌘</span>K
                </kbd>
              </motion.button>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-3">
              <UnifiedNotificationSystem />

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ') || 'Guest'}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                  className="w-10 h-10 flex items-center justify-center text-white font-bold"
                  style={{
                    borderRadius: RADIUS.input,
                    background: `linear-gradient(135deg, ${COLORS.lounges.crm.main} 0%, ${COLORS.primary.violet[600]} 100%)`,
                    boxShadow: SHADOW.level3,
                  }}
                >
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </motion.div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Just lounges */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-30"
        style={{ boxShadow: SHADOW.level2 }}
      >
        <div className="flex items-center justify-around py-2">
          <Link href="/crm">
            <motion.div
              whileHover={{ y: MOTION.hover.y / 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: MOTION.duration.hover }}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                location === '/crm' ? "text-indigo-600" : "text-gray-500"
              )}
              style={{ borderRadius: RADIUS.input }}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Lobby</span>
            </motion.div>
          </Link>
          {accessibleLounges.slice(0, 3).map((lounge) => {
            // Special handling for Agent Lounge in mobile nav
            if (lounge.id === 'agent') {
              return (
                <motion.div
                  key={lounge.id}
                  whileHover={{ y: MOTION.hover.y / 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: MOTION.duration.hover }}
                  className="flex flex-col items-center gap-1 px-3 py-2 transition-colors text-gray-500 hover:text-indigo-600 cursor-pointer"
                  style={{ borderRadius: RADIUS.input }}
                  onClick={() => setAgentSelectorOpen(true)}
                >
                  <lounge.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{lounge.label.split(' ')[0]}</span>
                </motion.div>
              );
            }

            return (
              <Link key={lounge.id} href={lounge.href}>
                <motion.div
                  whileHover={{ y: MOTION.hover.y / 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: MOTION.duration.hover }}
                  className="flex flex-col items-center gap-1 px-3 py-2 transition-colors text-gray-500 hover:text-indigo-600"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <lounge.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{lounge.label.split(' ')[0]}</span>
                </motion.div>
              </Link>
            );
          })}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ y: MOTION.hover.y / 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: MOTION.duration.hover }}
            className="flex flex-col items-center gap-1 px-3 py-2 transition-colors text-gray-500 hover:text-indigo-600"
            style={{ borderRadius: RADIUS.input }}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}

export default LobbyLayout;
