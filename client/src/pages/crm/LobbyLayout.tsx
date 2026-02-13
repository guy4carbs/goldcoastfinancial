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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedNotificationSystem } from "@/components/notifications/UnifiedNotificationSystem";
import { UniversalSearch } from "@/components/search/UniversalSearch";

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
  color: string;
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
    color: "text-violet-600 bg-violet-100",
    description: "Leads, quotes, pipeline",
    requiredRoles: ['owner', 'system_admin', 'manager', 'sales_agent', 'client'],
  },
  {
    id: 'finance',
    icon: DollarSign,
    label: "Finance Lounge",
    href: "/finance/dashboard",
    color: "text-emerald-600 bg-emerald-100",
    description: "Commissions, revenue",
    requiredRoles: ['owner', 'system_admin', 'manager', 'investor'],
  },
  {
    id: 'marketing',
    icon: Megaphone,
    label: "Marketing Lounge",
    href: "/marketing/dashboard",
    color: "text-rose-600 bg-rose-100",
    description: "Campaigns, content",
    requiredRoles: ['owner', 'system_admin', 'manager', 'marketing_staff'],
  },
  {
    id: 'ai',
    icon: Bot,
    label: "AI Lounge",
    href: "/ai/dashboard",
    color: "text-cyan-600 bg-cyan-100",
    description: "AI agents, automation",
    requiredRoles: ['owner', 'system_admin'],
  },
  {
    id: 'manager',
    icon: Briefcase,
    label: "Manager Lounge",
    href: "/manager/dashboard",
    color: "text-blue-600 bg-blue-100",
    description: "Team oversight",
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    label: "Support Lounge",
    href: "/support/dashboard",
    color: "text-amber-600 bg-amber-100",
    description: "Tickets, help desk",
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'executive',
    icon: BarChart3,
    label: "Executive Lounge",
    href: "/executive/dashboard",
    color: "text-indigo-600 bg-indigo-100",
    description: "KPIs, forecasting",
    requiredRoles: ['owner', 'system_admin', 'investor'],
  },
  {
    id: 'admin',
    icon: Shield,
    label: "Admin Lounge",
    href: "/admin",
    color: "text-slate-600 bg-slate-100",
    description: "System settings",
    requiredRoles: ['owner', 'system_admin'],
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
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 mb-6", sidebarCollapsed && "justify-center px-2")}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
          <Leaf className="w-5 h-5 text-white" />
        </div>
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
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium">{greeting()}</span>
            </div>
            <p className="font-semibold">
              {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
            </p>
            <p className="text-xs text-indigo-200 mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Home Link */}
      <div className="px-3 mb-4">
        <Link href="/crm">
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
              location === '/crm'
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            )}
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
        <div className="space-y-1">
          {accessibleLounges.map((lounge) => (
            <Link key={lounge.id} href={lounge.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                  "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", lounge.color)}>
                  <lounge.icon className="w-4 h-4" />
                </div>
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm text-gray-900">{lounge.label}</span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>

      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 pt-4 px-3 mt-auto">
        <Link href="/crm/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all",
            sidebarCollapsed && "justify-center"
          )}>
            <Settings className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <Link href="/crm/help">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all",
            sidebarCollapsed && "justify-center"
          )}>
            <HelpCircle className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm">Help</span>}
          </div>
        </Link>
      </div>
    </>
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex">
      {/* Universal Search Modal */}
      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-white/80 backdrop-blur-sm border-r border-gray-200/60 py-6 fixed h-screen z-30"
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
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
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white py-6 flex flex-col z-50"
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

              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 rounded-xl text-gray-500 hover:bg-gray-200/80 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Search anything...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white rounded border border-gray-300">
                  <span>⌘</span>K
                </kbd>
              </button>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          <Link href="/crm">
            <div className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              location === '/crm' ? "text-indigo-600" : "text-gray-500"
            )}>
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Lobby</span>
            </div>
          </Link>
          {accessibleLounges.slice(0, 3).map((lounge) => (
            <Link key={lounge.id} href={lounge.href}>
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-500">
                <lounge.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{lounge.label.split(' ')[0]}</span>
              </div>
            </Link>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default LobbyLayout;
