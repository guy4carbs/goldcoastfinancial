import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { components, zIndex } from "@/lib/designTokens";
import {
  Home,
  Users,
  BarChart3,
  DollarSign,
  FileText,
  BookOpen,
  GraduationCap,
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
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { CommandPalette } from "./CommandPalette";
import { Onboarding } from "./Onboarding";
import { ErrorBoundary } from "./primitives/ErrorBoundary";

// Use design token values
const SIDEBAR_EXPANDED = parseInt(components.sidebar.width.expanded);
const SIDEBAR_COLLAPSED = parseInt(components.sidebar.width.collapsed);

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/agents/dashboard" },
  { icon: Rocket, label: "Getting Started", href: "/agents/getting-started" },
  { icon: Calendar, label: "Calendar", href: "/agents/calendar" },
  { icon: Users, label: "Leads", href: "/agents/leads" },
  { icon: BarChart3, label: "Pipeline", href: "/agents/pipeline" },
  { icon: DollarSign, label: "Earnings", href: "/agents/earnings" },
];

const toolsNavItems: NavItem[] = [
  { icon: FileText, label: "Quotes", href: "/agents/quotes" },
  { icon: BookOpen, label: "Scripts", href: "/agents/scripts" },
  { icon: BookOpen, label: "Resources", href: "/agents/resources" },
  { icon: ClipboardCheck, label: "Guidelines", href: "/agents/guidelines" },
];

const growthNavItems: NavItem[] = [
  { icon: GraduationCap, label: "Training", href: "/agents/training" },
  { icon: Trophy, label: "Leaderboard", href: "/agents/leaderboard" },
  { icon: Star, label: "Achievements", href: "/agents/achievements" },
];

const teamNavItems: NavItem[] = [
  { icon: Mail, label: "Email", href: "/agents/email" },
  { icon: MessageSquare, label: "Chat", href: "/agents/chat" },
  { icon: Megaphone, label: "Announcements", href: "/agents/announcements" },
];

interface AgentLoungeLayoutProps {
  children: React.ReactNode;
}

export function AgentLoungeLayout({ children }: AgentLoungeLayoutProps) {
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
    clearNotification
  } = useAgentStore();

  // Navigation handler for command palette - uses wouter for SPA navigation (no page reload)
  const handleNavigate = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: '/agents/dashboard',
      'getting-started': '/agents/getting-started',
      calendar: '/agents/calendar',
      leads: '/agents/leads',
      pipeline: '/agents/pipeline',
      earnings: '/agents/earnings',
      training: '/agents/training',
      chat: '/agents/chat',
      email: '/agents/email',
      quotes: '/agents/quotes',
      scripts: '/agents/scripts',
      resources: '/agents/resources',
      guidelines: '/agents/guidelines',
      leaderboard: '/agents/leaderboard',
      achievements: '/agents/achievements',
      announcements: '/agents/announcements',
      settings: '/agents/settings',
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
    <div className="mb-4">
      {!sidebarCollapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                  isActive
                    ? "bg-violet-500/10 text-violet-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-violet-500")} />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-violet-500 text-white text-[10px] px-1.5 h-5">
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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-3 mb-8", sidebarCollapsed && "justify-center")}>
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-primary text-sm">Heritage</p>
            <p className="text-[10px] text-gray-500">Agent Lounge</p>
          </div>
        )}
      </div>

      {/* User Level & XP (collapsed: just icon) */}
      {!sidebarCollapsed && (
        <div className="px-3 mb-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Level {performance.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">{performance.currentStreak}</span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(performance.xp % 1000) / 10}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1">
              {1000 - (performance.xp % 1000)} XP to next level
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <NavSection title="Main" items={mainNavItems} />
        <NavSection title="Tools" items={toolsNavItems} />
        <NavSection title="Growth" items={growthNavItems} />
        <NavSection title="Team" items={teamNavItems} />
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 pt-4 px-2 mt-auto">
        <Link href="/agents/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-primary transition-all",
            sidebarCollapsed && "justify-center"
          )}>
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
          </div>
        </Link>
        <Link href="/agents/help">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-primary transition-all",
            sidebarCollapsed && "justify-center"
          )}>
            <HelpCircle className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium text-sm">Help & Support</span>}
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fffaf3] flex">
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={handleNavigate}
        onAction={handleAction}
        theme={theme}
      />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-white border-r border-gray-200 py-6 fixed h-screen"
        style={{ zIndex: zIndex.fixed }}
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
              className="lg:hidden fixed inset-0 bg-black/50"
              style={{ zIndex: zIndex.modalBackdrop }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white py-6 flex flex-col"
              style={{ zIndex: zIndex.modal }}
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
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
      )}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0" style={{ zIndex: zIndex.sticky }}>
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
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Search...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white rounded border border-gray-300">
                  <span>⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-3">
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={markNotificationRead}
                onMarkAllAsRead={markAllNotificationsRead}
                onClear={clearNotification}
              />

              <Link href="/agents/settings">
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {currentUser?.name || 'Agent'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Level {performance.level} · {performance.xp} XP
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold">
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
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content - #88: Added pb-20 for mobile bottom nav */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Onboarding for new agents */}
      <Onboarding />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200" style={{ zIndex: zIndex.fixed }}>
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: "Home", href: "/agents/dashboard" },
            { icon: Users, label: "Leads", href: "/agents/leads" },
            { icon: GraduationCap, label: "Training", href: "/agents/training" },
            { icon: MessageSquare, label: "Chat", href: "/agents/chat" },
          ].map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                  isActive ? "text-violet-500" : "text-gray-500"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
