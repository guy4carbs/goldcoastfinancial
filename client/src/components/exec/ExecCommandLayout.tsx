import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Crown, LayoutDashboard, TrendingUp, AlertTriangle, Users,
  DollarSign, ListTodo, CalendarDays, Shield, Menu, Sun, Moon, LogOut,
  RefreshCw, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecUser {
  name?: string;
  email?: string;
}

interface ExecCommandContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: ExecUser | null;
  handleLogout: () => void;
}

const ExecCommandContext = createContext<ExecCommandContextType | null>(null);

export function useExecCommand() {
  const context = useContext(ExecCommandContext);
  if (!context) throw new Error("useExecCommand must be used within ExecCommandLayout");
  return context;
}

type NavId = 'dashboard' | 'tasks' | 'calendar' | 'revenue' | 'forecasts' | 'risk' | 'leadership' | 'partnerships' | 'access';

interface NavItem {
  id: NavId;
  label: string;
  icon: any;
  href: string;
  isExternal?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'destructive' | 'warning';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/exec#dashboard' },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, href: '/exec/tasks', badge: 'NEW', badgeVariant: 'warning' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, href: '/exec/calendar', badge: 'NEW', badgeVariant: 'warning' },
  { id: 'revenue', label: 'Revenue & Capital', icon: DollarSign, href: '/exec#revenue' },
  { id: 'forecasts', label: 'Forecasts', icon: TrendingUp, href: '/exec#forecasts' },
  { id: 'risk', label: 'Risk', icon: AlertTriangle, href: '/exec#risk' },
  { id: 'leadership', label: 'Leadership', icon: Users, href: '/exec#leadership' },
  { id: 'partnerships', label: 'Partnerships', icon: Building2, href: '/exec#partnerships' },
  { id: 'access', label: 'Access Control', icon: Shield, href: '/exec#access' },
];

interface ExecCommandLayoutProps {
  children: ReactNode;
  activeNav: NavId;
  title: string;
  alertCount?: number;
  headerActions?: ReactNode;
}

export default function ExecCommandLayout({ 
  children, 
  activeNav, 
  title,
  alertCount = 0,
  headerActions
}: ExecCommandLayoutProps) {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("execTheme");
    return saved === "dark" ? "dark" : "light";
  });
  const [user, setUser] = useState<ExecUser | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("execAuth");
    if (!auth) {
      navigate("/exec-login");
      return;
    }
    setUser(JSON.parse(auth));
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("execTheme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    localStorage.removeItem("execAuth");
    navigate("/exec-login");
  };

  if (!user) return null;

  return (
    <ExecCommandContext.Provider value={{ theme, toggleTheme, user, handleLogout }}>
      <div className={cn("min-h-screen flex", theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50')}>
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-r'
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="bg-primary p-1.5 rounded-sm">
                  <Crown className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold leading-none text-primary dark:text-white">GOLD COAST</span>
                  <span className="text-[0.5rem] uppercase tracking-widest text-muted-foreground">Exec Command</span>
                </div>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = item.id === activeNav;
                const showRiskBadge = item.id === 'risk' && alertCount > 0;
                
                return (
                  <Link key={item.id} href={item.href}>
                    <div
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-violet-50 text-secondary" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-auto bg-amber-500/20 text-amber-500 text-[10px]">{item.badge}</Badge>
                      )}
                      {showRiskBadge && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">{alertCount}</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="font-bold text-secondary">{user.name?.charAt(0) || 'E'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate dark:text-white">{user.name || 'Executive'}</p>
                  <p className="text-xs text-muted-foreground">Executive</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleTheme}
                  className="flex-1"
                  data-testid="button-toggle-theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className={cn(
            "sticky top-0 z-30 h-16 border-b flex items-center justify-between px-4",
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          )}>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              {headerActions}
              {alertCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {alertCount} Alerts
                </Badge>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className={cn("flex-1 p-4 md:p-6", theme === 'dark' ? 'text-white' : '')}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </ExecCommandContext.Provider>
  );
}
