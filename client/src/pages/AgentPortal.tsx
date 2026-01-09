import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, LayoutDashboard, CheckSquare, Users, GraduationCap, FileText, 
  TrendingUp, DollarSign, LogOut, Menu, X, Moon, Sun, Bell, ChevronRight,
  Phone, MessageSquare, Calendar, Star, Award, Clock, Target, AlertTriangle,
  ScrollText, Copy, Check, Flame, Zap, Trophy, Crown, ArrowUp, ArrowDown,
  Minus, UserPlus, Sparkles, Gift, Medal, ChevronUp, ChevronDown, BarChart3, Activity,
  Search, Command, Plus, Filter, Inbox, GripVertical, Rocket, Play, BookOpen, 
  Building2, ClipboardCheck, ExternalLink, Video, Mail, MessageCircle, Share2,
  UserCheck, BadgeDollarSign, ShieldCheck, Timer, MapPin, Briefcase, Heart
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import {
  CommandPalette,
  XPToast,
  LevelUpCelebration,
  NotificationDropdown,
  LeadDetailDrawer,
  AddLeadModal,
  AddTaskModal,
  LeaderboardModal,
  ActivityFeed,
  ActivityTicker,
  DailyChallenge,
  TrainingModuleViewer,
  LogCallModal,
  ChatRoom,
} from "@/components/agent";
import type { Lead, TrainingCourse } from "@/lib/agentStore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend, 
  PieChart, Pie, Cell
} from "recharts";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(value);
  
  useEffect(() => {
    const diff = value - prevValue.current;
    if (diff === 0) {
      setDisplayValue(value);
      return;
    }
    
    const duration = 800;
    const steps = 30;
    const increment = diff / steps;
    let current = prevValue.current;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    
    prevValue.current = value;
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

function MiniSparkline({ data, color = "#E1B138" }: { data?: number[]; color?: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block ml-2">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

type TabType = 'dashboard' | 'tasks' | 'crm' | 'training' | 'sops' | 'performance' | 'earnings' | 'scripts' | 'objections' | 'chat' | 'calendar' | 'getting-started' | 'videos' | 'resources' | 'carriers' | 'guidelines';

const navItems = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'guidelines' as TabType, label: 'Guidelines', icon: ShieldCheck },
  { id: 'crm' as TabType, label: 'Deal Room', icon: Users },
  { id: 'performance' as TabType, label: 'Performance', icon: TrendingUp },
  { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
  { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
  { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
  { id: 'getting-started' as TabType, label: 'Getting Started', icon: Rocket },
  { id: 'training' as TabType, label: 'Training', icon: GraduationCap },
  { id: 'videos' as TabType, label: 'Video Library', icon: Play },
  { id: 'scripts' as TabType, label: 'Scripts', icon: ScrollText },
  { id: 'objections' as TabType, label: 'Objections', icon: MessageCircle },
  { id: 'resources' as TabType, label: 'Resources', icon: BookOpen },
  { id: 'sops' as TabType, label: 'SOPs', icon: ClipboardCheck },
  { id: 'carriers' as TabType, label: 'Carriers', icon: Building2 },
  { id: 'earnings' as TabType, label: 'Earnings', icon: DollarSign },
];

export default function AgentPortal() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'high' | 'today' | 'completed'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('7d');
  const [apPeriod, setApPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [sopSearch, setSopSearch] = useState('');
  const [scriptSearch, setScriptSearch] = useState('');
  const [trainingFilter, setTrainingFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { 
    currentUser, logout, theme, toggleTheme,
    announcements, tasks, leads, courses, sops, performance, earnings, scripts,
    leaderboard, achievements, quickActions,
    notifications, activities, dailyChallenges,
    xpGain, levelUp,
    completeTask, addTask, addLead, addActivityToLead, updateLeadStatus, completeModule,
    markNotificationRead, markAllNotificationsRead, clearNotification,
    clearXPGain, clearLevelUp, logCall
  } = useAgentStore();
  
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandAction = useCallback((action: string) => {
    switch (action) {
      case 'log-call':
        setShowLogCall(true);
        break;
      case 'add-lead':
        setShowAddLead(true);
        break;
      case 'schedule':
        break;
      case 'leaderboard':
        setShowLeaderboard(true);
        break;
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'logout':
        logout();
        window.scrollTo(0, 0);
        navigate("/", { replace: true });
        break;
      case 'notifications':
        break;
    }
  }, [toggleTheme, logout, navigate]);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'qa-1':
        setShowLogCall(true);
        break;
      case 'qa-2':
        setShowAddLead(true);
        break;
      case 'qa-3':
        setActiveTab('calendar');
        break;
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/agent-login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    window.scrollTo(0, 0);
    navigate("/", { replace: true });
  };

  const isExecutive = currentUser.role === 'executive';
  
  const filteredLeads = isExecutive ? leads : leads.filter(l => l.assignedTo === currentUser.id);
  const filteredTasks = isExecutive ? tasks : tasks.filter(t => t.assignedTo === currentUser.id);
  
  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);
  
  const orgTotalLeads = leads.length;
  const orgTotalTasks = tasks.length;
  const orgCompletedTasks = tasks.filter(t => t.completed).length;

  const getCourseProgress = (course: typeof courses[0]) => {
    const completed = course.modules.filter(m => m.completed).length;
    return Math.round((completed / course.modules.length) * 100);
  };

  const totalEarnings = earnings.reduce((sum, e) => e.status === 'paid' ? sum + e.amount : sum, 0);
  const pendingEarnings = earnings.reduce((sum, e) => e.status === 'pending' ? sum + e.amount : sum, 0);

  return (
    <div className={cn("min-h-screen flex", theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50')}>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-r'
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="bg-primary p-1.5 rounded-sm">
                <Shield className="w-5 h-5 text-secondary" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold leading-none text-primary dark:text-white">GOLD COAST</span>
                <span className="text-[0.5rem] uppercase tracking-widest text-muted-foreground">Agent Lounge</span>
              </div>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); window.scrollTo(0, 0); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.id === 'tasks' && incompleteTasks.length > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs">{incompleteTasks.length}</Badge>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="font-bold text-secondary">{currentUser.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
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

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
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
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold dark:text-white">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
              onClick={() => setCommandPaletteOpen(true)}
              data-testid="button-command-palette"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <NotificationDropdown
              notifications={notifications.map(n => ({
                ...n,
                actionUrl: undefined
              }))}
              onMarkAsRead={markNotificationRead}
              onMarkAllAsRead={markAllNotificationsRead}
              onClear={clearNotification}
            />
          </div>
        </header>

        <main className={cn("flex-1 p-4 md:p-6", theme === 'dark' ? 'text-white' : '')}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {isExecutive && (
                  <Card className="border-secondary bg-secondary/5 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-5 h-5 text-secondary" />
                        <span className="text-sm font-medium">Executive Dashboard: Full access to all agent data and organization metrics</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{orgTotalLeads}</p>
                          <p className="text-xs text-muted-foreground">Total Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{orgTotalTasks}</p>
                          <p className="text-xs text-muted-foreground">Total Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary">{orgCompletedTasks}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <motion.h2 
                          className="text-2xl md:text-3xl font-serif font-bold"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {currentUser.name.split(' ')[0]}! <Sparkles className="inline w-6 h-6 text-secondary" />
                        </motion.h2>
                        <p className="text-muted-foreground mt-1">
                          {isExecutive ? 'Organization overview for today.' : 
                           incompleteTasks.length === 0 ? "All caught up! Great work!" :
                           `You have ${incompleteTasks.length} tasks remaining. Let's crush it!`}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                        <Command className="w-3 h-3" />
                        <span>Press</span>
                        <kbd className="px-1.5 py-0.5 bg-background rounded border font-mono">⌘K</kbd>
                        <span>to search</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(() => {
                        const userEntry = leaderboard.find(e => e.id === currentUser.id);
                        const currentAP = userEntry?.ap?.[apPeriod] || 0;
                        const goals = { daily: 5000, weekly: 25000, monthly: 100000, yearly: 1000000 };
                        const periodLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
                        const goal = goals[apPeriod];
                        const progressPct = Math.min((currentAP / goal) * 100, 100);
                        const formatAP = (val: number) => {
                          if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                          if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
                          return `$${val.toLocaleString()}`;
                        };
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div 
                                  className="bg-gradient-to-br from-primary to-primary/90 rounded-lg p-4 text-white cursor-pointer"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-5 h-5" />
                                    <span className="text-xs font-medium opacity-90">{periodLabels[apPeriod]} AP</span>
                                  </div>
                                  <p className="text-2xl font-bold">{formatAP(currentAP)}</p>
                                  <p className="text-xs opacity-80">Annual Premium</p>
                                  <Progress value={progressPct} className="mt-2 h-1.5 bg-white/20" />
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatAP(goal - currentAP)} to {apPeriod} goal</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                      
                      <motion.div 
                        className="bg-gradient-to-br from-secondary/90 to-secondary rounded-lg p-4 text-white"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-5 h-5" />
                          <span className="text-xs font-medium opacity-90">Streak</span>
                        </div>
                        <p className="text-2xl font-bold"><AnimatedCounter value={performance.currentStreak} /> days</p>
                        <p className="text-xs opacity-80">Best: {performance.longestStreak} days</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-secondary to-secondary/80 rounded-lg p-4 text-white"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-5 h-5" />
                          <span className="text-xs font-medium opacity-90">Rank</span>
                        </div>
                        <p className="text-2xl font-bold">#{performance.rank}</p>
                        <p className="text-xs opacity-80">of {performance.totalAgents} agents</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-primary/80 to-primary rounded-lg p-4 text-white"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5" fill="currentColor" />
                          <span className="text-xs font-medium opacity-90">Score</span>
                        </div>
                        <p className="text-2xl font-bold"><AnimatedCounter value={performance.behaviorScore} /></p>
                        <p className="text-xs opacity-80">Behavior Score</p>
                      </motion.div>
                    </div>
                  </div>
                  
                  <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-secondary" />
                            Leaderboard
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-secondary hover:text-secondary/80"
                            onClick={() => setShowLeaderboard(true)}
                          >
                            View All
                          </Button>
                        </div>
                        <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
                          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                            <button
                              key={period}
                              onClick={() => setApPeriod(period)}
                              className={cn(
                                "flex-1 px-2 py-1 text-[10px] sm:text-xs rounded-md transition-all font-medium",
                                apPeriod === period 
                                  ? "bg-secondary text-white shadow-sm" 
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              )}
                            >
                              {period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : period === 'monthly' ? 'Month' : 'Year'}
                            </button>
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const periodSuffixes = { daily: '/day', weekly: '/wk', monthly: '/mo', yearly: '/yr' };
                        const formatAP = (val: number) => {
                          if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                          if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
                          return `$${val.toLocaleString()}`;
                        };
                        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.ap[apPeriod] - a.ap[apPeriod]);
                        return sortedLeaderboard.slice(0, 5).map((entry, idx) => (
                          <motion.div 
                            key={entry.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg transition-colors",
                              entry.id === currentUser.id ? "bg-secondary/20 ring-1 ring-secondary" : "hover:bg-white/5"
                            )}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                              idx === 0 ? "bg-secondary text-white" :
                              idx === 1 ? "bg-gray-200 text-gray-600" :
                              idx === 2 ? "bg-secondary/70 text-white" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{entry.name}</p>
                              <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-secondary">{formatAP(entry.ap[apPeriod])}</p>
                              <div className="flex items-center justify-end gap-1 text-xs">
                                {entry.trend === 'up' && <ArrowUp className="w-3 h-3 text-secondary" />}
                                {entry.trend === 'down' && <ArrowDown className="w-3 h-3 text-primary/70" />}
                                {entry.trend === 'same' && <Minus className="w-3 h-3 text-muted-foreground" />}
                                <span className="text-muted-foreground text-[10px]">AP{periodSuffixes[apPeriod]}</span>
                              </div>
                            </div>
                          </motion.div>
                        ));
                      })()}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        className="gap-2 hover:scale-105 transition-transform hover:border-secondary hover:text-secondary"
                        onClick={() => handleQuickAction(action.id)}
                        data-testid={`quick-action-${action.id}`}
                      >
                        {action.icon === 'phone' && <Phone className="w-4 h-4" />}
                        {action.icon === 'user-plus' && <UserPlus className="w-4 h-4" />}
                        {action.icon === 'calendar' && <Calendar className="w-4 h-4" />}
                        {action.icon === 'file-text' && <FileText className="w-4 h-4" />}
                        {action.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {activities.length > 0 && (
                  <ActivityTicker activities={activities} />
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-l-4 border-l-primary overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Daily Calls</p>
                            <p className="text-2xl font-bold">
                              <AnimatedCounter value={performance.dailyCalls} />/{performance.dailyCallsTarget}
                            </p>
                          </div>
                          <div className="relative">
                            <Phone className="w-8 h-8 text-primary/30" />
                            <MiniSparkline data={performance.weeklyHistory.map(d => d.calls)} color="#541221" />
                          </div>
                        </div>
                        <Progress value={(performance.dailyCalls / performance.dailyCallsTarget) * 100} className="mt-2 h-1.5" />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-l-4 border-l-secondary overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Daily Closes</p>
                            <p className="text-2xl font-bold">
                              <AnimatedCounter value={performance.dailyCloses} />/{performance.dailyClosesTarget}
                            </p>
                          </div>
                          <Target className="w-8 h-8 text-secondary/30" />
                        </div>
                        <Progress value={(performance.dailyCloses / performance.dailyClosesTarget) * 100} className="mt-2 h-1.5" />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-l-4 border-l-primary/80 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Conversion</p>
                            <p className="text-2xl font-bold"><AnimatedCounter value={performance.conversionRate} suffix="%" /></p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-primary/30" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <DailyChallenge challenges={dailyChallenges} className="md:col-span-1" />
                  
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-secondary" />
                          Today's Tasks
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1"
                          onClick={() => setShowAddTask(true)}
                        >
                          <Plus className="w-4 h-4" />
                          Add Task
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {incompleteTasks.slice(0, 4).map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox 
                              checked={task.completed}
                              onCheckedChange={() => completeTask(task.id)}
                              data-testid={`checkbox-task-${task.id}`}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">+{task.performanceImpact}</Badge>
                          </div>
                        ))}
                        {incompleteTasks.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">All tasks complete!</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full mt-3" 
                        onClick={() => setActiveTab('tasks')}
                      >
                        View All Tasks <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-secondary" />
                        Announcements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                          {announcements.map(ann => (
                            <div key={ann.id} className={cn(
                              "p-3 rounded-lg",
                              ann.type === 'recognition' ? 'bg-secondary/10 border border-secondary/20' : 
                              ann.type === 'warning' ? 'bg-orange-500/10 border border-orange-500/20' :
                              'bg-muted/50'
                            )}>
                              <div className="flex items-start gap-2">
                                {ann.type === 'recognition' && <Trophy className="w-4 h-4 text-secondary shrink-0 mt-0.5" />}
                                {ann.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
                                {ann.type === 'info' && <Bell className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{ann.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{ann.content}</p>
                                  <p className="text-xs text-muted-foreground mt-2">{ann.date}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" />
                        Team Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <ActivityFeed activities={activities} />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-secondary" />
                        Upcoming
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { time: '9:00 AM', title: 'Team Standup', type: 'meeting', meetLink: 'https://meet.google.com/gcf-team-standup' },
                          { time: '11:30 AM', title: 'Client Call - Johnson', type: 'call', meetLink: 'tel:+15551234568' },
                          { time: '2:00 PM', title: 'Training Session', type: 'training', meetLink: 'https://meet.google.com/gcf-training' },
                          { time: '4:00 PM', title: 'Pipeline Review', type: 'meeting', meetLink: 'https://meet.google.com/gcf-pipeline' },
                        ].map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              event.type === 'meeting' ? 'bg-primary' :
                              event.type === 'call' ? 'bg-secondary' : 'bg-green-500'
                            )} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.time}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs gap-1"
                              onClick={() => window.open(event.meetLink, '_blank')}
                              data-testid={`button-dashboard-join-${idx}`}
                            >
                              {event.type === 'call' ? <Phone className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              Join
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Medal className="w-5 h-5 text-secondary" />
                      Achievements
                      <Badge variant="outline" className="ml-auto">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Unlock achievements to earn XP rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {achievements.map((ach, idx) => (
                        <TooltipProvider key={ach.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={cn(
                                  "p-3 rounded-lg text-center cursor-pointer transition-all border-2",
                                  ach.unlocked 
                                    ? "bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30" 
                                    : "bg-muted/30 border-transparent opacity-50 grayscale"
                                )}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: ach.unlocked ? 1 : 0.5, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className={cn(
                                  "w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2",
                                  ach.unlocked ? "bg-secondary text-white" : "bg-muted"
                                )}>
                                  {ach.icon === 'graduation-cap' && <GraduationCap className="w-5 h-5" />}
                                  {ach.icon === 'handshake' && <Gift className="w-5 h-5" />}
                                  {ach.icon === 'flame' && <Flame className="w-5 h-5" />}
                                  {ach.icon === 'fire' && <Flame className="w-5 h-5" />}
                                  {ach.icon === 'phone' && <Phone className="w-5 h-5" />}
                                  {ach.icon === 'trophy' && <Trophy className="w-5 h-5" />}
                                  {ach.icon === 'brain' && <Zap className="w-5 h-5" />}
                                  {ach.icon === 'crown' && <Crown className="w-5 h-5" />}
                                </div>
                                <p className="text-xs font-medium truncate">{ach.name}</p>
                                <p className="text-[10px] text-secondary">+{ach.xpReward} XP</p>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{ach.name}</p>
                              <p className="text-xs text-muted-foreground">{ach.description}</p>
                              {ach.unlocked && ach.unlockedDate && (
                                <p className="text-xs text-secondary mt-1">Unlocked: {ach.unlockedDate}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Task Arena</h2>
                    <p className="text-muted-foreground text-sm">Complete tasks to earn XP and maintain your streak</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
                      <Flame className="w-4 h-4 text-secondary" />
                      <span className="font-bold text-secondary">{performance.currentStreak}</span>
                      <span className="text-xs text-muted-foreground">day streak</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">+{incompleteTasks.reduce((sum, t) => sum + t.performanceImpact, 0)}</span>
                      <span className="text-xs text-muted-foreground">XP available</span>
                    </div>
                    <Button 
                      className="gap-2 bg-secondary hover:bg-secondary/90"
                      onClick={() => setShowAddTask(true)}
                      data-testid="button-add-task"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'all', label: 'All Tasks', count: filteredTasks.length },
                    { key: 'high', label: 'High Priority', count: filteredTasks.filter(t => t.priority === 'high').length },
                    { key: 'today', label: 'Due Today', count: filteredTasks.filter(t => t.dueDate === 'Today').length },
                    { key: 'completed', label: 'Completed', count: completedTasks.length },
                  ] as const).map(filter => (
                    <Button
                      key={filter.key}
                      variant={taskFilter === filter.key ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "gap-2",
                        taskFilter === filter.key && "bg-secondary hover:bg-secondary/90"
                      )}
                      onClick={() => setTaskFilter(filter.key)}
                      data-testid={`filter-${filter.key}`}
                    >
                      <Filter className="w-3 h-3" />
                      {filter.label}
                      <Badge variant="secondary" className="ml-1 text-[10px] h-5">{filter.count}</Badge>
                    </Button>
                  ))}
                </div>

                {incompleteTasks.length === 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Card className="border-secondary bg-gradient-to-br from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/5">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
                        </motion.div>
                        <p className="text-xl font-bold text-secondary dark:text-secondary">All tasks completed!</p>
                        <p className="text-sm text-secondary dark:text-secondary mt-1">Great work today. Your streak continues!</p>
                        <div className="flex justify-center gap-4 mt-4">
                          <Badge className="bg-secondary text-white">+25 XP Bonus</Badge>
                          <Badge variant="outline" className="border-secondary text-secondary">
                            <Flame className="w-3 h-3 mr-1" />Streak +1
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {incompleteTasks.length > 0 && (
                    <Card className="border-t-2 border-t-secondary">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Clock className="w-5 h-5 text-secondary" />
                          To Do
                          <Badge variant="secondary" className="ml-auto">{incompleteTasks.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {incompleteTasks.map((task, idx) => (
                            <motion.div 
                              key={task.id} 
                              className="group p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox 
                                  checked={task.completed}
                                  onCheckedChange={() => completeTask(task.id)}
                                  className="mt-1"
                                  data-testid={`checkbox-task-${task.id}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{task.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[10px] px-1.5 py-0",
                                        task.category === 'calls' && "border-primary text-primary",
                                        task.category === 'training' && "border-primary text-primary",
                                        task.category === 'admin' && "border-gray-500 text-gray-500",
                                        task.category === 'followup' && "border-secondary text-secondary"
                                      )}
                                    >
                                      {task.category}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <Badge className="bg-secondary/10 text-secondary border-0 text-xs">
                                    +{task.performanceImpact} XP
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-t-2 border-t-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CheckSquare className="w-5 h-5 text-secondary" />
                        Completed
                        <Badge variant="secondary" className="ml-auto bg-secondary/10 text-secondary">{completedTasks.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {completedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Complete tasks to see them here</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {completedTasks.map((task, idx) => (
                            <motion.div 
                              key={task.id} 
                              className="p-3 rounded-lg bg-secondary/5 dark:bg-secondary/10 border border-secondary/10 dark:border-secondary/20"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-sm line-through opacity-70 flex-1">{task.title}</p>
                                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-[10px]">
                                  +{task.performanceImpact} XP
                                </Badge>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-medium">Daily Progress</p>
                        <p className="text-sm text-muted-foreground">
                          {completedTasks.length} of {filteredTasks.length} tasks completed
                        </p>
                      </div>
                      <div className="flex-1 w-full">
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedTasks.length / Math.max(filteredTasks.length, 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <p className="font-bold text-xl text-secondary">
                        {Math.round((completedTasks.length / Math.max(filteredTasks.length, 1)) * 100)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'crm' && (
              <motion.div
                key="crm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Deal Room</h2>
                    <p className="text-muted-foreground text-sm">
                      {isExecutive ? 'Organization-wide pipeline view' : 'Track and manage your leads'}
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    className="gap-2 bg-secondary hover:bg-secondary/90"
                    onClick={() => setShowAddLead(true)}
                    data-testid="button-add-lead"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Lead
                  </Button>
                </div>

                {isExecutive && (
                  <Card className="border-secondary bg-gradient-to-r from-secondary/5 to-transparent">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Crown className="w-5 h-5 text-secondary" />
                      <span className="text-sm font-medium">Executive View: Full organization pipeline visibility</span>
                      <Badge variant="outline" className="ml-auto">{filteredLeads.length} total leads</Badge>
                    </CardContent>
                  </Card>
                )}

                <DragDropContext onDragEnd={(result: DropResult) => {
                  if (!result.destination) return;
                  const { draggableId, destination } = result;
                  const newStatus = destination.droppableId as Lead['status'];
                  updateLeadStatus(draggableId, newStatus);
                }}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {(['new', 'contacted', 'qualified', 'proposal', 'closed'] as const).map((status, idx) => {
                      const statusLeads = filteredLeads.filter(l => l.status === status);
                      const statusConfig = {
                        new: { label: 'New', icon: Sparkles, bg: '#541221' },
                        contacted: { label: 'Contacted', icon: Phone, bg: '#6b2c3d' },
                        qualified: { label: 'Qualified', icon: Target, bg: '#8b4a5c' },
                        proposal: { label: 'Proposal', icon: FileText, bg: '#E1B138' },
                        closed: { label: 'Closed', icon: Trophy, bg: '#c49a2f' }
                      }[status];
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <motion.div
                          key={status}
                          className="min-w-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div 
                            className="rounded-t-lg p-2 flex items-center gap-1"
                            style={{ backgroundColor: statusConfig.bg }}
                          >
                            <StatusIcon className="w-3 h-3 text-white shrink-0" />
                            <span className="font-medium text-white text-xs truncate">{statusConfig.label}</span>
                            <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px] px-1.5">{statusLeads.length}</Badge>
                          </div>
                          <Droppable droppableId={status}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                  "bg-muted/30 rounded-b-lg p-1.5 min-h-[180px] max-h-[350px] overflow-y-auto space-y-1.5 transition-colors",
                                  snapshot.isDraggingOver && "bg-secondary/10 ring-2 ring-secondary/30"
                                )}
                              >
                                {statusLeads.map((lead, lidx) => (
                                  <Draggable key={lead.id} draggableId={lead.id} index={lidx}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "bg-card p-2 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                                          snapshot.isDragging && "shadow-lg ring-2 ring-secondary"
                                        )}
                                        onClick={() => setSelectedLead(lead)}
                                        data-testid={`lead-card-${lead.id}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold">{lead.name.split(' ').map(n => n[0]).join('')}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs truncate">{lead.name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{lead.product || lead.state}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {statusLeads.length === 0 && (
                                  <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                                    <Inbox className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                    <p className="text-[10px]">Drop here</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </motion.div>
                      );
                    })}
                  </div>
                </DragDropContext>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      Pipeline Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {(['new', 'contacted', 'qualified', 'proposal', 'closed'] as const).map((status, idx) => {
                        const count = filteredLeads.filter(l => l.status === status).length;
                        const total = Math.max(filteredLeads.length, 1);
                        return (
                          <motion.div 
                            key={status}
                            className="flex-1"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div 
                              className="h-3 rounded-full relative overflow-hidden"
                              style={{ 
                                backgroundColor: status === 'new' ? '#54122120' : status === 'contacted' ? '#6b2c3d20' : status === 'qualified' ? '#8b4a5c20' : status === 'proposal' ? '#E1B13820' : '#c49a2f20'
                              }}
                            >
                              <motion.div 
                                className="h-full rounded-full"
                                style={{ 
                                  backgroundColor: status === 'new' ? '#541221' : status === 'contacted' ? '#6b2c3d' : status === 'qualified' ? '#8b4a5c' : status === 'proposal' ? '#E1B138' : '#c49a2f',
                                  width: `${(count / total) * 100}%`
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / total) * 100}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                              />
                            </div>
                            <p className="text-center text-xs text-muted-foreground mt-1">{count}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'training' && (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Training Courses</h2>
                    <p className="text-muted-foreground text-sm">Master the skills you need to succeed in insurance sales</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['all', 'product', 'sales', 'compliance'].map(cat => (
                    <Button
                      key={cat}
                      variant={trainingFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrainingFilter(cat)}
                      className={trainingFilter === cat ? 'bg-secondary hover:bg-secondary/90' : ''}
                      data-testid={`filter-${cat}`}
                    >
                      {cat === 'all' ? 'All Courses' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {courses
                    .filter(course => trainingFilter === 'all' || course.category === trainingFilter)
                    .map(course => (
                    <Card 
                      key={course.id} 
                      className="bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all"
                      data-testid={`course-card-${course.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>
                          {course.required && (
                            <Badge variant="outline" className="text-secondary border-secondary whitespace-nowrap">Required</Badge>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{getCourseProgress(course)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                              style={{ width: `${getCourseProgress(course)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-5">
                          {course.modules.map(mod => (
                            <div key={mod.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={mod.completed} 
                                  className="border-muted-foreground data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                />
                                <span className={mod.completed ? 'text-muted-foreground' : ''}>{mod.title}</span>
                              </div>
                              <span className="text-muted-foreground text-xs">{mod.duration}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full gap-2 bg-secondary hover:bg-secondary/90"
                          onClick={() => setSelectedCourse(course)}
                        >
                          {getCourseProgress(course) === 100 ? (
                            <>
                              <Award className="w-4 h-4" />
                              Review Course
                            </>
                          ) : getCourseProgress(course) > 0 ? (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Continue
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-4 h-4" />
                              Start Course
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'sops' && (
              <motion.div
                key="sops"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Standard Operating Procedures</h2>
                    <p className="text-muted-foreground text-sm">Step-by-step guides for common processes</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search SOPs..."
                      value={sopSearch}
                      onChange={(e) => setSopSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background w-64 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      data-testid="input-sop-search"
                    />
                  </div>
                </div>

                <div className="grid gap-6">
                  {sops.filter(sop => 
                    sopSearch === '' || 
                    sop.title.toLowerCase().includes(sopSearch.toLowerCase()) ||
                    sop.category.toLowerCase().includes(sopSearch.toLowerCase())
                  ).map(sop => {
                    let sopData: { icon: string; color: string; steps: { title: string; description: string; critical?: boolean }[] } | null = null;
                    try {
                      sopData = JSON.parse(sop.content);
                    } catch { /* fallback to raw display */ }
                    
                    const getIconColor = (color: string) => {
                      switch(color) {
                        case 'green': return 'bg-green-500/10 text-green-600';
                        case 'blue': return 'bg-blue-500/10 text-blue-600';
                        case 'purple': return 'bg-purple-500/10 text-purple-600';
                        case 'orange': return 'bg-orange-500/10 text-orange-600';
                        case 'red': return 'bg-red-500/10 text-red-600';
                        case 'secondary': return 'bg-secondary/10 text-secondary';
                        default: return 'bg-muted text-muted-foreground';
                      }
                    };
                    
                    const renderIcon = (iconName: string) => {
                      const iconClass = "w-6 h-6";
                      switch(iconName) {
                        case 'target': return <Target className={iconClass} />;
                        case 'clipboard': return <ClipboardCheck className={iconClass} />;
                        case 'gift': return <Gift className={iconClass} />;
                        case 'alert': return <AlertTriangle className={iconClass} />;
                        case 'user': return <Users className={iconClass} />;
                        case 'clock': return <Clock className={iconClass} />;
                        case 'shield': return <Shield className={iconClass} />;
                        case 'file': return <FileText className={iconClass} />;
                        default: return <ClipboardCheck className={iconClass} />;
                      }
                    };
                    
                    return (
                      <Card key={sop.id} className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {sopData && (
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", getIconColor(sopData.color))}>
                                  {renderIcon(sopData.icon)}
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-lg font-serif">{sop.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">{sop.category}</Badge>
                                  <span className="text-xs text-muted-foreground">v{sop.version}</span>
                                  <span className="text-xs text-muted-foreground">Updated {sop.lastUpdated}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          {sopData ? (
                            <div className="divide-y">
                              {sopData.steps.map((step, idx) => (
                                <div 
                                  key={idx} 
                                  className={cn(
                                    "flex items-start gap-4 p-4 transition-colors hover:bg-muted/30",
                                    step.critical && "bg-secondary/5"
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                                    step.critical 
                                      ? "bg-secondary text-white" 
                                      : "bg-muted text-muted-foreground"
                                  )}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm">{step.title}</h4>
                                      {step.critical && (
                                        <Badge variant="destructive" className="text-xs px-1.5 py-0">Critical</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-8 w-8"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${step.title}: ${step.description}`);
                                      setCopiedId(`${sop.id}-${idx}`);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                  >
                                    {copiedId === `${sop.id}-${idx}` ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm p-4 font-mono">
                              {sop.content}
                            </pre>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {sops.filter(sop => 
                  sopSearch === '' || 
                  sop.title.toLowerCase().includes(sopSearch.toLowerCase()) ||
                  sop.category.toLowerCase().includes(sopSearch.toLowerCase())
                ).length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No SOPs match your search</p>
                      <Button variant="link" onClick={() => setSopSearch('')}>Clear search</Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Performance Analytics</h2>
                    <p className="text-muted-foreground text-sm">Track your progress and key metrics</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border overflow-hidden">
                      {([
                        { key: '7d', label: '7 Days' },
                        { key: '30d', label: '30 Days' },
                        { key: '90d', label: '90 Days' },
                        { key: 'ytd', label: 'YTD' },
                      ] as const).map(range => (
                        <button
                          key={range.key}
                          onClick={() => setDateRange(range.key)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium transition-colors",
                            dateRange === range.key 
                              ? "bg-secondary text-white" 
                              : "bg-background hover:bg-muted"
                          )}
                          data-testid={`date-range-${range.key}`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                    <Badge className="bg-secondary text-white">Level {performance.level}</Badge>
                    <Badge variant="outline">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.monthly || 0).toLocaleString()} AP This Month</Badge>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-secondary" />
                      Weekly Performance Trend
                    </CardTitle>
                    <CardDescription>Your activity over the past 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performance.weeklyHistory}>
                          <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E1B138" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#E1B138" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#541221" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#541221" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }} 
                          />
                          <Area type="monotone" dataKey="calls" stroke="#E1B138" fillOpacity={1} fill="url(#colorCalls)" name="Calls" />
                          <Area type="monotone" dataKey="deals" stroke="#541221" fillOpacity={1} fill="url(#colorDeals)" name="Deals" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Daily Calls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pt-4">
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-3xl font-bold">{performance.dailyCalls}</span>
                          <span className="text-sm text-muted-foreground">/ {performance.dailyCallsTarget} target</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((performance.dailyCalls / performance.dailyCallsTarget) * 100, 100)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round((performance.dailyCalls / performance.dailyCallsTarget) * 100)}% complete
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-secondary" />
                        Daily Closes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pt-4">
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-3xl font-bold">{performance.dailyCloses}</span>
                          <span className="text-sm text-muted-foreground">/ {performance.dailyClosesTarget} target</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((performance.dailyCloses / performance.dailyClosesTarget) * 100, 100)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round((performance.dailyCloses / performance.dailyClosesTarget) * 100)}% complete
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-secondary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="w-4 h-4 text-secondary" fill="currentColor" />
                        Behavior Score
                      </CardTitle>
                      <CardDescription>Overall performance rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center py-4">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              className="text-muted"
                            />
                            <motion.circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="#E1B138"
                              strokeWidth="12"
                              fill="transparent"
                              strokeLinecap="round"
                              strokeDasharray={440}
                              initial={{ strokeDashoffset: 440 }}
                              animate={{ strokeDashoffset: 440 - (440 * performance.behaviorScore / 100) }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold">{performance.behaviorScore}</span>
                            <span className="text-xs text-muted-foreground">out of 100</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Daily Quota
                      </CardTitle>
                      <CardDescription>Progress toward daily goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={[
                              { name: 'Calls', actual: performance.dailyCalls, target: performance.dailyCallsTarget },
                              { name: 'Closes', actual: performance.dailyCloses, target: performance.dailyClosesTarget }
                            ]}
                            layout="vertical"
                            margin={{ left: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }} 
                            />
                            <Bar dataKey="actual" fill="#E1B138" radius={[0, 4, 4, 0]} name="Actual" />
                            <Bar dataKey="target" fill="#541221" fillOpacity={0.3} radius={[0, 4, 4, 0]} name="Target" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Performance Rank</p>
                          <p className="text-xl font-bold">#{performance.rank} of {performance.totalAgents}</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10 hidden sm:block" />
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Flame className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Streak</p>
                          <p className="text-xl font-bold">{performance.currentStreak} days</p>
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-10 hidden sm:block" />
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total AP Submitted</p>
                          <p className="text-xl font-bold">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.yearly || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Daily AP</p>
                          <p className="text-xl font-bold">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.daily || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Weekly AP</p>
                          <p className="text-xl font-bold">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.weekly || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly AP</p>
                          <p className="text-xl font-bold">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.monthly || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Yearly AP</p>
                          <p className="text-xl font-bold">${(leaderboard.find(e => e.id === currentUser?.id)?.ap.yearly || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-secondary" />
                      Conversion Metrics
                    </CardTitle>
                    <CardDescription>Key ratios driving your success</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-3xl font-bold text-secondary">{performance.conversionRate}%</p>
                        <p className="text-sm text-muted-foreground mt-1">Lead to Close Rate</p>
                        <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                          <ArrowUp className="w-3 h-3" /> 2.3% vs last month
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-3xl font-bold text-primary">${Math.round((leaderboard.find(e => e.id === currentUser?.id)?.ap.monthly || 0) / Math.max(performance.dailyCloses * 30, 1)).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">Avg Policy Size</p>
                        <p className="text-xs text-muted-foreground mt-2">Annual Premium</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-3xl font-bold">{Math.round(performance.dailyCalls / Math.max(performance.dailyCloses, 1))}</p>
                        <p className="text-sm text-muted-foreground mt-1">Calls Per Close</p>
                        <p className="text-xs text-muted-foreground mt-2">Lower is better</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div
                key="earnings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Earnings & Commissions</h2>
                    <p className="text-muted-foreground text-sm">Track your income and pending payouts</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Paid</p>
                          <p className="text-2xl font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-2xl font-bold text-secondary">${pendingEarnings.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold text-blue-600">${Math.round((totalEarnings + pendingEarnings) * 0.35).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">YTD Total</p>
                          <p className="text-2xl font-bold">${(totalEarnings + pendingEarnings).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        Monthly Earnings Trend
                      </CardTitle>
                      <CardDescription>Your commission history over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { month: 'Aug', amount: 1850 },
                            { month: 'Sep', amount: 2200 },
                            { month: 'Oct', amount: 1950 },
                            { month: 'Nov', amount: 2800 },
                            { month: 'Dec', amount: 2650 },
                            { month: 'Jan', amount: totalEarnings + pendingEarnings },
                          ]}>
                            <defs>
                              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E1B138" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#E1B138" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#E1B138" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        By Product
                      </CardTitle>
                      <CardDescription>Commission breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { product: 'Term Life', amount: 850, percent: 32, color: 'bg-blue-500' },
                          { product: 'Whole Life', amount: 1200, percent: 44, color: 'bg-secondary' },
                          { product: 'IUL', amount: 450, percent: 17, color: 'bg-green-500' },
                          { product: 'Final Expense', amount: 200, percent: 7, color: 'bg-purple-500' },
                        ].map((item, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{item.product}</span>
                              <span className="font-medium">${item.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-secondary" />
                          Commission Ledger
                        </CardTitle>
                        <CardDescription>View-only. Contact admin for questions.</CardDescription>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <FileText className="w-3 h-3" />
                        {earnings.length} transactions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium text-sm">Policy</th>
                            <th className="text-left p-3 font-medium text-sm">Client</th>
                            <th className="text-left p-3 font-medium text-sm">Product</th>
                            <th className="text-left p-3 font-medium text-sm">Date</th>
                            <th className="text-right p-3 font-medium text-sm">Commission</th>
                            <th className="text-right p-3 font-medium text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map(entry => (
                            <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3 font-mono text-sm">{entry.policyNumber}</td>
                              <td className="p-3 font-medium">{entry.clientName}</td>
                              <td className="p-3">
                                <Badge variant="outline" className="text-xs">{entry.product}</Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">{entry.date}</td>
                              <td className="p-3 text-right font-semibold text-green-600">${entry.amount.toLocaleString()}</td>
                              <td className="p-3 text-right">
                                <Badge className={cn(
                                  "gap-1",
                                  entry.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                  'bg-secondary/10 text-secondary border-secondary/20'
                                )}>
                                  {entry.status === 'paid' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {entry.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-secondary/5 to-primary/5 border-0">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <p className="font-medium">Next Payout Estimated</p>
                        <p className="text-sm text-muted-foreground">Pending commissions are typically paid within 2-4 weeks of policy issue</p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-2xl font-bold text-secondary">${pendingEarnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Est. January 15, 2026</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'scripts' && (
              <motion.div
                key="scripts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Sales Scripts</h2>
                    <p className="text-muted-foreground text-sm">Ready-to-use scripts for different products and channels</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search scripts..."
                      value={scriptSearch}
                      onChange={(e) => setScriptSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background w-64 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      data-testid="input-script-search"
                    />
                  </div>
                </div>
                
                <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-secondary" />
                      Common Objections & Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { objection: "I need to think about it", response: "I completely understand. What specific aspect would you like to think through? I'd be happy to provide more details on that." },
                        { objection: "It's too expensive", response: "I hear you. Let me show you how this actually costs less than a daily cup of coffee, while protecting your family's entire future." },
                        { objection: "I already have coverage", response: "That's great! Many of our clients had existing coverage too. May I ask when you last reviewed it? Coverage needs often change with life events." },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-lg border">
                          <p className="text-sm font-medium text-primary mb-2">"{item.objection}"</p>
                          <p className="text-xs text-muted-foreground">{item.response}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 h-7 text-xs gap-1"
                            onClick={() => navigator.clipboard.writeText(item.response)}
                          >
                            <Copy className="w-3 h-3" /> Copy Response
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ScrollText className="w-5 h-5 text-secondary" />
                      Script Library
                    </CardTitle>
                    <CardDescription>Click to copy any script to your clipboard.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scripts.filter(script => 
                        scriptSearch === '' || 
                        script.product.toLowerCase().includes(scriptSearch.toLowerCase()) ||
                        script.content.toLowerCase().includes(scriptSearch.toLowerCase()) ||
                        script.state.toLowerCase().includes(scriptSearch.toLowerCase())
                      ).map(script => (
                        <Card key={script.id} className="border-l-4 border-l-secondary">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{script.product} - {script.state}</CardTitle>
                                <CardDescription className="capitalize">{script.channel} Script</CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(script.content);
                                  setCopiedScriptId(script.id);
                                  setTimeout(() => setCopiedScriptId(null), 2000);
                                }}
                                data-testid={`button-copy-script-${script.id}`}
                              >
                                {copiedScriptId === script.id ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1 text-secondary" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg font-mono">
                              {script.content}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {scripts.filter(script => 
                        scriptSearch === '' || 
                        script.product.toLowerCase().includes(scriptSearch.toLowerCase()) ||
                        script.content.toLowerCase().includes(scriptSearch.toLowerCase()) ||
                        script.state.toLowerCase().includes(scriptSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="py-12 text-center border border-dashed rounded-lg">
                          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No scripts match your search</p>
                          <Button variant="link" onClick={() => setScriptSearch('')}>Clear search</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'objections' && (
              <motion.div
                key="objections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Objections & Rebuttals</h2>
                    <p className="text-muted-foreground text-sm">Master playbook for handling client concerns</p>
                  </div>
                </div>

                <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      How to Use This Playbook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { text: 'Objections are NOT rejection', icon: Heart },
                        { text: 'Objections mean the client is still engaged', icon: MessageCircle },
                        { text: 'Acknowledge → Reassure → Redirect', icon: Target },
                        { text: 'Do NOT argue with the client', icon: AlertTriangle },
                        { text: 'Slow your voice down', icon: Timer },
                        { text: 'Use these verbatim until experienced', icon: BookOpen },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                          <item.icon className="w-5 h-5 text-secondary shrink-0" />
                          <span className="text-sm font-medium">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Call Flow Map
                    </CardTitle>
                    <CardDescription>Tap any stage to jump to that section</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { stage: '1', label: 'Opening / Trust', color: 'bg-blue-500', targetIdx: 0 },
                        { stage: '2', label: 'Coverage / Value', color: 'bg-green-500', targetIdx: 1 },
                        { stage: '3', label: 'Time / Delay', color: 'bg-yellow-500', targetIdx: 2 },
                        { stage: '4', label: 'Trust / Legitimacy', color: 'bg-purple-500', targetIdx: 3 },
                        { stage: '5', label: 'SSN / Medical', color: 'bg-orange-500', targetIdx: 4 },
                        { stage: '6', label: 'Cost / Commitment', color: 'bg-red-500', targetIdx: 5 },
                        { stage: '7', label: 'Closing', color: 'bg-secondary', targetIdx: 6 },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const el = document.getElementById(`objection-category-${item.targetIdx}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold", item.color)}>
                            {item.stage}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                          {idx < 6 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Match the objection to the stage you're in.</p>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  {[
                    {
                      title: '1. Opening Objections',
                      subtitle: 'First 10-20 seconds',
                      color: 'blue',
                      objections: [
                        { obj: "I don't remember filling anything out.", response: "No problem — most people don't. This is in reference to the policy you already have in force, not a new application." },
                        { obj: "I already have insurance.", response: "Perfect — that's actually why I'm calling. This is just a review of your existing coverage." },
                        { obj: "I have insurance through my work.", response: "That's very common. Just keep in mind employer coverage usually expires about 30 days after you quit, retire, or are terminated, so this makes sure you're covered your entire life." },
                        { obj: "Is this a sales call?", response: "No — this is a policy review, not a new sale." },
                        { obj: "How did you get my information?", response: "It came directly from the insurance company when your policy was issued." },
                        { obj: "What company are you with again?", response: "I'm calling from the insurance division that services your policy through your carrier." },
                      ]
                    },
                    {
                      title: '2. Coverage / Value Objections',
                      subtitle: 'Understanding the offer',
                      color: 'green',
                      objections: [
                        { obj: "Why would I get more coverage for the same price?", response: "Insurance pricing updates over time, and some policies qualify for adjustments based on underwriting or age." },
                        { obj: "That doesn't make sense.", response: "I understand — that's exactly why the carrier flags policies like this for review." },
                        { obj: "Sounds too good to be true.", response: "Nothing changes unless the carrier confirms it in writing." },
                        { obj: "I don't want to change my policy.", response: "That's totally fine — nothing changes today. This just checks what you qualify for more coverage or a more manageable premium." },
                        { obj: "I'm happy with what I have.", response: "That's great — this just confirms you're not missing anything you already qualify for." },
                      ]
                    },
                    {
                      title: '3. Time / Delay Objections',
                      subtitle: 'Overcoming busy schedules',
                      color: 'yellow',
                      objections: [
                        { obj: "I'm busy.", response: "I understand — this only takes about two or three minutes." },
                        { obj: "Can you call me another day?", response: "Absolutely. Today we just want to make sure you get approved so the price doesn't change. This will take a couple moments, then we can follow up another day." },
                        { obj: "I don't have time for this.", response: "That's why the carrier keeps this very short — they don't want policies sitting unresolved." },
                      ]
                    },
                    {
                      title: '4. Trust / Legitimacy Objections',
                      subtitle: 'Building credibility',
                      color: 'purple',
                      objections: [
                        { obj: "You guys keep calling me.", response: "I know — the reason is there's a flag on your policy for review. Until it's resolved, you're going to keep receiving these calls." },
                        { obj: "How do I know this is legit?", response: "You can verify my license through the state, and everything we do is confirmed directly by the insurance company." },
                        { obj: "I've been scammed before.", response: "I understand — that's exactly why nothing is finalized today and everything is verified through the carrier." },
                        { obj: "Send me something in the mail.", response: "I can, but the carrier won't release documents until the review is completed. Once it is, they send everything directly to you." },
                        { obj: "I don't do anything over the phone.", response: "I understand. For security reasons, the carrier only allows these reviews to be completed verbally, and nothing is finalized today." },
                      ]
                    },
                    {
                      title: '5. Medical & SSN Objections',
                      subtitle: 'Most important - handle with care',
                      color: 'orange',
                      objections: [
                        { obj: "Why do you need medical information?", response: "This just allows the carrier to re-check eligibility, the same way they did when the policy was first issued." },
                        { obj: "Is this a credit check?", response: "No — this has nothing to do with credit. It's strictly medical and prescription history." },
                        { obj: "Why do you need my Social Security number?", response: "That's how the insurance company pulls the correct medical and prescription records." },
                        { obj: "I don't give my SSN over the phone.", response: "I completely understand. This is a HIPAA-protected process, and I can read it back to you for verification." },
                        { obj: "Is this required?", response: "Yes — the carrier requires it to complete the review." },
                        { obj: "Can we skip that part?", response: "I wish we could, but that's the only way the carrier can verify eligibility." },
                        { obj: "Can I call you back with that?", response: "Of course — what time works best today while the file is still open?" },
                      ]
                    },
                    {
                      title: '6. Cost / Commitment Objections',
                      subtitle: 'Addressing financial concerns',
                      color: 'red',
                      objections: [
                        { obj: "I can't afford anything else.", response: "That's totally fine — this review does not increase your payment, and will most likely decrease your payment." },
                        { obj: "I don't want my bill to change.", response: "Nothing changes without your approval." },
                        { obj: "Is this going to cost me money?", response: "No — this is strictly a review of your existing policy." },
                        { obj: "I don't want another policy or to be billed twice.", response: "You're not getting an additional policy — this just updates your coverage, and if anything replaces the old one, the carrier cancels it so you're never billed twice." },
                      ]
                    },
                    {
                      title: '7. Closing Hesitation',
                      subtitle: 'Final push to commitment',
                      color: 'secondary',
                      objections: [
                        { obj: "I need to think about it.", response: "That makes sense. This step just allows the carrier to verify everything — you'll still have time to review before any decisions." },
                        { obj: "I want to talk to my spouse.", response: "Of course — we can complete the review now and go over the results together once they're available. We'll also send you a paper policy in the mail so you guys can go over it together and call me if you have any problems." },
                      ]
                    },
                  ].map((category, catIdx) => (
                    <Card key={catIdx} id={`objection-category-${catIdx}`} className="overflow-hidden scroll-mt-24">
                      <CardHeader className={cn(
                        "border-b",
                        category.color === 'blue' && "bg-blue-500/10",
                        category.color === 'green' && "bg-green-500/10",
                        category.color === 'yellow' && "bg-yellow-500/10",
                        category.color === 'purple' && "bg-purple-500/10",
                        category.color === 'orange' && "bg-orange-500/10",
                        category.color === 'red' && "bg-red-500/10",
                        category.color === 'secondary' && "bg-secondary/10",
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                            category.color === 'blue' && "bg-blue-500",
                            category.color === 'green' && "bg-green-500",
                            category.color === 'yellow' && "bg-yellow-500",
                            category.color === 'purple' && "bg-purple-500",
                            category.color === 'orange' && "bg-orange-500",
                            category.color === 'red' && "bg-red-500",
                            category.color === 'secondary' && "bg-secondary",
                          )}>
                            {catIdx + 1}
                          </div>
                          <div>
                            <CardTitle className="text-base">{category.title}</CardTitle>
                            <CardDescription>{category.subtitle}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {category.objections.map((item, idx) => (
                            <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs font-medium text-primary">{idx + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-primary mb-1">"{item.obj}"</p>
                                  <p className="text-sm text-muted-foreground">{item.response}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 h-8 w-8"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.response);
                                    setCopiedId(`obj-${catIdx}-${idx}`);
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                >
                                  {copiedId === `obj-${catIdx}-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-secondary bg-gradient-to-r from-secondary/10 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-secondary" />
                      Live Call Cheat Sheet
                    </CardTitle>
                    <CardDescription>Pin this for quick reference during calls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { trigger: 'Already insured', response: '"Perfect, this is a review"' },
                        { trigger: 'Work policy', response: '"Ends after employment"' },
                        { trigger: 'Busy', response: '"2–3 minutes"' },
                        { trigger: 'Call later', response: '"Lock approval now"' },
                        { trigger: 'SSN hesitation', response: '"HIPAA-protected"' },
                        { trigger: 'Mail request', response: '"Docs after review"' },
                        { trigger: 'Multiple calls', response: '"Policy flag"' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-background rounded-lg border border-secondary/20">
                          <Badge variant="outline" className="shrink-0">{item.trigger}</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium text-secondary">{item.response}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Final Coaching Notes
                    </CardTitle>
                    <CardDescription>Do NOT skip these fundamentals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { note: 'Slow down — speed kills trust', icon: Timer, color: 'text-blue-600' },
                        { note: 'Silence after rebuttals is powerful', icon: Clock, color: 'text-green-600' },
                        { note: "If they're talking, you're still in control", icon: MessageCircle, color: 'text-purple-600' },
                        { note: 'Confidence beats perfect wording', icon: Star, color: 'text-secondary' },
                        { note: 'Do NOT over-explain', icon: AlertTriangle, color: 'text-red-600' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                          <item.icon className={cn("w-5 h-5 shrink-0 mt-0.5", item.color)} />
                          <p className="text-sm font-medium">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChatRoom 
                  currentUserId={currentUser?.id || ''} 
                  currentUserName={currentUser?.name || 'Agent'}
                />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Calendar</h2>
                    <p className="text-muted-foreground text-sm">Manage your schedule and appointments</p>
                  </div>
                  <Button className="bg-secondary hover:bg-secondary/90 gap-2">
                    <Plus className="w-4 h-4" />
                    New Event
                  </Button>
                </div>

                <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Connect Your Calendar</h3>
                            <p className="text-sm text-muted-foreground">Sync your personal calendar to see all your appointments in one place</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => window.open('https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=' + encodeURIComponent(window.location.origin + '/api/auth/google/callback') + '&scope=https://www.googleapis.com/auth/calendar.readonly&response_type=code&access_type=offline', '_blank')}
                          data-testid="button-connect-google"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google Calendar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => window.open('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=' + encodeURIComponent(window.location.origin + '/api/auth/outlook/callback') + '&scope=Calendars.Read', '_blank')}
                          data-testid="button-connect-outlook"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#0078D4" d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"/>
                            <path fill="#fff" d="M7 7h4v4H7zm0 6h4v4H7zm6-6h4v4h-4zm0 6h4v4h-4z"/>
                          </svg>
                          Outlook Calendar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => window.open('https://appleid.apple.com/auth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=' + encodeURIComponent(window.location.origin + '/api/auth/apple/callback') + '&response_type=code&scope=calendar', '_blank')}
                          data-testid="button-connect-apple"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          Apple Calendar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">Not Connected</Badge>
                      <span>Connect your calendar to automatically sync appointments and meetings</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">January 2026</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Month
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="py-2">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }, (_, i) => {
                          const dayNum = i - 3;
                          const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                          const isToday = dayNum === 3;
                          const hasEvent = [3, 7, 12, 15, 20, 25].includes(dayNum);
                          return (
                            <div
                              key={i}
                              className={cn(
                                "aspect-square p-1 rounded-lg text-sm flex flex-col items-center justify-start cursor-pointer hover:bg-muted/50 transition-colors",
                                !isCurrentMonth && "text-muted-foreground/30",
                                isToday && "bg-secondary text-white hover:bg-secondary/90"
                              )}
                            >
                              <span className="text-xs font-medium">{isCurrentMonth ? dayNum : dayNum <= 0 ? 31 + dayNum : dayNum - 31}</span>
                              {hasEvent && isCurrentMonth && (
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full mt-1",
                                  isToday ? "bg-white" : "bg-secondary"
                                )} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Today's Schedule</CardTitle>
                      <CardDescription>Friday, January 3rd</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { time: '9:00 AM', title: 'Team Standup', duration: '30 min', type: 'meeting', attendees: 8, meetLink: 'https://meet.google.com/gcf-team-standup', description: 'Daily team sync to discuss priorities and blockers' },
                          { time: '10:30 AM', title: 'Client Call - Williams', duration: '45 min', type: 'call', attendees: 2, meetLink: 'https://zoom.us/j/williams-consultation', description: 'Initial consultation for term life coverage' },
                          { time: '12:00 PM', title: 'Lunch & Learn: IUL Strategies', duration: '1 hr', type: 'training', attendees: 15, meetLink: 'https://meet.google.com/gcf-iul-training', description: 'Advanced IUL sales strategies and product knowledge' },
                          { time: '2:00 PM', title: 'Policy Review - Henderson', duration: '30 min', type: 'call', attendees: 1, meetLink: 'tel:+15551234567', description: 'Review policy details and answer questions' },
                          { time: '3:30 PM', title: 'Weekly Pipeline Review', duration: '1 hr', type: 'meeting', attendees: 5, meetLink: 'https://meet.google.com/gcf-pipeline', description: 'Review team pipeline and forecast for the week' },
                          { time: '5:00 PM', title: 'End of Day Wrap-up', duration: '15 min', type: 'meeting', attendees: 3, meetLink: 'https://meet.google.com/gcf-eod', description: 'Quick recap of accomplishments and next steps' },
                        ].map((event, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-lg border-l-4 bg-muted/30",
                              event.type === 'meeting' ? 'border-l-primary' :
                              event.type === 'call' ? 'border-l-secondary' : 'border-l-green-500'
                            )}
                            data-testid={`calendar-event-${idx}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{event.time} • {event.duration}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.attendees} {event.attendees === 1 ? 'person' : 'people'}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs gap-1"
                                onClick={() => window.open(event.meetLink, '_blank')}
                                data-testid={`button-join-${idx}`}
                              >
                                {event.type === 'call' ? <Phone className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                Join
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid={`button-details-${idx}`}>
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{event.title}</DialogTitle>
                                    <DialogDescription>{event.time} • {event.duration}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div>
                                      <p className="text-sm font-medium mb-1">Description</p>
                                      <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{event.attendees} {event.attendees === 1 ? 'attendee' : 'attendees'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={cn(
                                        "text-xs",
                                        event.type === 'meeting' ? 'bg-primary' :
                                        event.type === 'call' ? 'bg-secondary' : 'bg-green-500'
                                      )}>
                                        {event.type === 'meeting' ? 'Video Meeting' : event.type === 'call' ? 'Phone Call' : 'Training Session'}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <Button 
                                        className="flex-1 gap-2 bg-secondary hover:bg-secondary/90"
                                        onClick={() => window.open(event.meetLink, '_blank')}
                                      >
                                        {event.type === 'call' ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                        Join Now
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="gap-2"
                                        onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}`, '_blank')}
                                      >
                                        <Calendar className="w-4 h-4" />
                                        Add to Calendar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Upcoming This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { day: 'Monday', date: 'Jan 6', events: 4, highlight: 'Quarterly Planning' },
                        { day: 'Tuesday', date: 'Jan 7', events: 3, highlight: 'Training: Objections' },
                        { day: 'Wednesday', date: 'Jan 8', events: 5, highlight: 'Client Presentations' },
                        { day: 'Thursday', date: 'Jan 9', events: 2, highlight: 'Team Building' },
                      ].map((day, idx) => (
                        <div key={idx} className="p-4 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer">
                          <p className="text-xs text-muted-foreground">{day.day}</p>
                          <p className="text-lg font-semibold">{day.date}</p>
                          <p className="text-xs text-secondary mt-1">{day.events} events</p>
                          <p className="text-xs text-muted-foreground mt-2 truncate">{day.highlight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'getting-started' && (
              <motion.div
                key="getting-started"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Getting Started</h2>
                    <p className="text-muted-foreground text-sm">Your complete guide to launching your insurance career</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-secondary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Step 1: Get Licensed</CardTitle>
                          <CardDescription>Complete your state insurance licensing</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Standard Method (Most States)</h4>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">1</span>
                            <div>
                              <p className="font-medium">Complete Pre-Licensing Course</p>
                              <p className="text-muted-foreground text-xs">20-hour state-approved course (online or in-person)</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">2</span>
                            <div>
                              <p className="font-medium">Schedule State Exam</p>
                              <p className="text-muted-foreground text-xs">Register through Pearson VUE testing center</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">3</span>
                            <div>
                              <p className="font-medium">Pass the Exam</p>
                              <p className="text-muted-foreground text-xs">Score 70% or higher on Life & Health exam</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">4</span>
                            <div>
                              <p className="font-medium">Submit License Application</p>
                              <p className="text-muted-foreground text-xs">Apply through NIPR or state DOI website</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">5</span>
                            <div>
                              <p className="font-medium">Complete Background Check</p>
                              <p className="text-muted-foreground text-xs">Fingerprinting may be required in some states</p>
                            </div>
                          </li>
                        </ol>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary" />
                          Virginia Express Method
                        </h4>
                        <p className="text-xs text-muted-foreground">Virginia offers a faster path with no pre-licensing requirement!</p>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                            <div>
                              <p className="font-medium">Study on Your Own</p>
                              <p className="text-muted-foreground text-xs">No mandatory pre-licensing course required</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                            <div>
                              <p className="font-medium">Schedule & Pass Exam</p>
                              <p className="text-muted-foreground text-xs">Take the exam when you feel ready</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                            <div>
                              <p className="font-medium">Apply for License</p>
                              <p className="text-muted-foreground text-xs">Submit through Virginia Bureau of Insurance</p>
                            </div>
                          </li>
                        </ol>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href="https://www.scc.virginia.gov/pages/Insurance-Licensing" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                              VA Bureau of Insurance
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href="https://www.prometric.com/virginia" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                              Prometric VA
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-secondary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Step 2: Get Contracted</CardTitle>
                          <CardDescription>Join our agency and start writing business</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">1</span>
                          <div>
                            <p className="font-medium">Join Our Discord Community</p>
                            <p className="text-muted-foreground text-xs">Get instant access to training, support, and team chat</p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">2</span>
                          <div>
                            <p className="font-medium">Submit Contracting Paperwork</p>
                            <p className="text-muted-foreground text-xs">Complete W-9, direct deposit, and E&O insurance forms</p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">3</span>
                          <div>
                            <p className="font-medium">Get Appointed with Carriers</p>
                            <p className="text-muted-foreground text-xs">We'll submit appointments to our carrier partners</p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">4</span>
                          <div>
                            <p className="font-medium">Complete Product Training</p>
                            <p className="text-muted-foreground text-xs">Finish required certifications for each carrier</p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">5</span>
                          <div>
                            <p className="font-medium">Start Writing Business!</p>
                            <p className="text-muted-foreground text-xs">You're ready to help families and earn commissions</p>
                          </div>
                        </li>
                      </ol>
                      <Separator />
                      <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] gap-2" asChild>
                        <a href="https://discord.gg/goldcoastfinancial" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-4 h-4" />
                          Join Our Discord Server
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Practice Test Resources</CardTitle>
                        <CardDescription>Prepare for your licensing exam with these study tools</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { name: 'Xcel Solutions', desc: 'State-approved pre-licensing courses', url: 'https://www.xcelsolutions.com', rating: '4.9/5' },
                        { name: 'ExamFX', desc: 'Comprehensive practice exams & study guides', url: 'https://www.examfx.com', rating: '4.8/5' },
                        { name: 'StateRegulatoryInsurance', desc: 'State-specific practice tests', url: 'https://www.stateregulatoryinsurance.com', rating: '4.6/5' },
                        { name: 'PassMasters', desc: 'Free practice questions & flashcards', url: 'https://www.passmasters.com', rating: '4.5/5' },
                      ].map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group p-4 rounded-lg border hover:border-secondary/50 hover:bg-secondary/5 transition-all"
                          data-testid={`resource-${resource.name.toLowerCase().replace(/\s/g, '-')}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm group-hover:text-secondary transition-colors">{resource.name}</h4>
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{resource.desc}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{resource.rating}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Video Library</h2>
                    <p className="text-muted-foreground text-sm">Learn from real calls, product demos, and objection handling</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Live Calling Videos</CardTitle>
                          <CardDescription>Watch real agents make calls and close deals</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { title: 'Cold Call Opener That Works', duration: '12:34', views: '2.4K', category: 'Cold Calling', thumbnail: '🎯' },
                          { title: 'Warm Lead Follow-Up Script', duration: '18:22', views: '1.8K', category: 'Follow-Ups', thumbnail: '🔥' },
                          { title: 'Setting the Appointment', duration: '15:45', views: '3.1K', category: 'Appointments', thumbnail: '📅' },
                          { title: 'Building Instant Rapport', duration: '9:18', views: '2.7K', category: 'Rapport', thumbnail: '🤝' },
                          { title: 'Closing on First Call', duration: '22:10', views: '4.2K', category: 'Closing', thumbnail: '💰' },
                          { title: 'Handling Gatekeepers', duration: '11:55', views: '1.5K', category: 'Gatekeepers', thumbnail: '🚪' },
                        ].map((video, idx) => (
                          <div
                            key={idx}
                            className="group cursor-pointer rounded-lg border overflow-hidden hover:border-secondary/50 transition-all"
                            data-testid={`video-calling-${idx}`}
                          >
                            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                              <span className="text-4xl">{video.thumbnail}</span>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-primary ml-1" />
                                </div>
                              </div>
                              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">{video.duration}</Badge>
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-sm group-hover:text-secondary transition-colors">{video.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{video.views} views</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs h-5">{video.category}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'carriers' && (
              <motion.div
                key="carriers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Carrier Information</h2>
                    <p className="text-muted-foreground text-sm">Compare products, underwriting, and commissions across carriers</p>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Best Products by Carrier</CardTitle>
                    <CardDescription>Know which carrier to use for each situation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">Carrier</th>
                            <th className="text-left py-3 px-4 font-semibold">Best For</th>
                            <th className="text-left py-3 px-4 font-semibold">Products</th>
                            <th className="text-center py-3 px-4 font-semibold">AM Best</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { carrier: 'Mutual of Omaha', bestFor: 'Final Expense, Senior Market', products: ['Final Expense', 'Medicare Supp', 'Term'], rating: 'A+' },
                            { carrier: 'Americo', bestFor: 'Final Expense, Quick Issue', products: ['Final Expense', 'Whole Life'], rating: 'A' },
                            { carrier: 'National Life', bestFor: 'IUL, Living Benefits', products: ['IUL', 'Term', 'Whole Life'], rating: 'A+' },
                            { carrier: 'American Equity', bestFor: 'Annuities, Retirement', products: ['Fixed Annuity', 'FIA'], rating: 'A-' },
                            { carrier: 'Foresters', bestFor: 'Simplified Issue, Families', products: ['Term', 'Whole Life', 'Critical Illness'], rating: 'A' },
                            { carrier: 'Transamerica', bestFor: 'Mortgage Protection, Term', products: ['Term', 'UL', 'Final Expense'], rating: 'A' },
                            { carrier: 'Prosperity Life', bestFor: 'Graded/Modified Policies', products: ['Final Expense', 'Graded Whole Life'], rating: 'B++' },
                            { carrier: 'SBLI', bestFor: 'Affordable Term', products: ['Term', 'Whole Life'], rating: 'A' },
                          ].map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4 font-medium">{row.carrier}</td>
                              <td className="py-3 px-4 text-muted-foreground">{row.bestFor}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {row.products.map((p, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge className={cn(
                                  "text-xs",
                                  row.rating.startsWith('A+') ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  row.rating.startsWith('A') ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                )}>{row.rating}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-secondary" />
                        <CardTitle className="text-lg">Underwriting Strength</CardTitle>
                      </div>
                      <CardDescription>Which carriers are most lenient for health issues</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { carrier: 'Prosperity Life', strength: 95, note: 'Best for high-risk, accepts most health conditions' },
                          { carrier: 'Americo', strength: 88, note: 'Very lenient, quick decisions' },
                          { carrier: 'Mutual of Omaha', strength: 82, note: 'Good for seniors, simplified issue options' },
                          { carrier: 'Foresters', strength: 75, note: 'Family-friendly, moderate underwriting' },
                          { carrier: 'National Life', strength: 65, note: 'Standard underwriting, living benefits focus' },
                          { carrier: 'Transamerica', strength: 60, note: 'Traditional underwriting, competitive rates' },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{item.carrier}</span>
                              <span className="text-muted-foreground">{item.strength}%</span>
                            </div>
                            <Progress value={item.strength} className="h-2" />
                            <p className="text-xs text-muted-foreground">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-secondary" />
                        <CardTitle className="text-lg">Average Approval Times</CardTitle>
                      </div>
                      <CardDescription>How quickly policies get issued</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { carrier: 'Americo', time: '24-48 hours', category: 'fast' },
                          { carrier: 'Prosperity Life', time: '24-72 hours', category: 'fast' },
                          { carrier: 'Mutual of Omaha', time: '3-5 business days', category: 'medium' },
                          { carrier: 'Foresters', time: '3-7 business days', category: 'medium' },
                          { carrier: 'National Life', time: '5-10 business days', category: 'slow' },
                          { carrier: 'Transamerica', time: '7-14 business days', category: 'slow' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                            <span className="font-medium text-sm">{item.carrier}</span>
                            <Badge className={cn(
                              "text-xs",
                              item.category === 'fast' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              item.category === 'medium' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            )}>{item.time}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <BadgeDollarSign className="w-5 h-5 text-secondary" />
                      <CardTitle className="text-lg">Commission Payout Schedule</CardTitle>
                    </div>
                    <CardDescription>When you get paid after a policy is issued</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { carrier: 'Americo', timing: 'Same Week', detail: 'Paid within 3-5 days of issue', icon: Zap },
                        { carrier: 'Mutual of Omaha', timing: 'Weekly', detail: 'Every Friday for prior week', icon: Calendar },
                        { carrier: 'National Life', timing: 'Bi-Weekly', detail: '1st and 15th of month', icon: Clock },
                        { carrier: 'Foresters', timing: 'Monthly', detail: 'First week of following month', icon: FileText },
                        { carrier: 'Transamerica', timing: 'Weekly', detail: 'Every Wednesday', icon: Calendar },
                        { carrier: 'Prosperity Life', timing: 'Weekly', detail: 'Every Friday', icon: Calendar },
                        { carrier: 'American Equity', timing: 'Monthly', detail: 'End of month + 15 days', icon: FileText },
                        { carrier: 'SBLI', timing: 'Bi-Weekly', detail: 'Every other Friday', icon: Clock },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-lg border hover:border-secondary/50 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon className="w-4 h-4 text-secondary" />
                            <span className="font-semibold text-sm">{item.carrier}</span>
                          </div>
                          <Badge variant="outline" className="mb-2">{item.timing}</Badge>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Resources</h2>
                    <p className="text-muted-foreground text-sm">Templates, guides, and tools to help you succeed</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Where to Buy Leads</CardTitle>
                          <CardDescription>Trusted lead vendors for insurance agents</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'LeadConcepts', type: 'Direct Mail', cost: '$25-35/lead', quality: 'Premium', url: 'https://www.leadconcepts.com' },
                          { name: 'iLeads', type: 'Aged Internet', cost: '$2-8/lead', quality: 'Good', url: 'https://www.ileads.com' },
                          { name: 'Nectar', type: 'Live Transfer', cost: '$30-50/lead', quality: 'Hot', url: 'https://www.nectarmarketplace.com' },
                          { name: 'QuoteWizard', type: 'Real-time', cost: '$15-25/lead', quality: 'Warm', url: 'https://www.quotewizard.com/agents' },
                          { name: 'Facebook Ads Manager', type: 'Self-Generated', cost: '$5-15/lead', quality: 'Varies', url: 'https://business.facebook.com/adsmanager' },
                        ].map((lead, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer group"
                            onClick={() => window.open(lead.url, '_blank')}
                            data-testid={`lead-vendor-${idx}`}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm group-hover:text-secondary transition-colors">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.type} • {lead.cost}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{lead.quality}</Badge>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Social Media Prospecting Guide</CardTitle>
                          <CardDescription>Generate free leads through social platforms</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { platform: 'Facebook', strategy: 'Join local groups, post valuable content, run targeted ads', icon: '📘', url: 'https://www.facebook.com/groups' },
                          { platform: 'LinkedIn', strategy: 'Connect with business owners, share industry insights', icon: '💼', url: 'https://www.linkedin.com/mynetwork' },
                          { platform: 'Instagram', strategy: 'Post reels about financial protection, use local hashtags', icon: '📷', url: 'https://www.instagram.com' },
                          { platform: 'TikTok', strategy: 'Educational content, myth-busting, success stories', icon: '🎵', url: 'https://www.tiktok.com/creator-portal' },
                        ].map((item, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer group"
                            onClick={() => window.open(item.url, '_blank')}
                            data-testid={`social-platform-${idx}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium text-sm group-hover:text-secondary transition-colors">{item.platform}</span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs text-muted-foreground">{item.strategy}</p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          const playbook = `SOCIAL MEDIA PROSPECTING PLAYBOOK FOR INSURANCE AGENTS\n\n📘 FACEBOOK\n- Join local community groups and mom groups\n- Post valuable content about financial protection\n- Run targeted ads to homeowners aged 30-55\n- Create a business page and post 3x weekly\n\n💼 LINKEDIN\n- Connect with business owners and entrepreneurs\n- Share industry insights and success stories\n- Join professional networking groups\n- Comment on others' posts to build visibility\n\n📷 INSTAGRAM\n- Post reels about financial protection tips\n- Use local hashtags like #[YourCity]Insurance\n- Share client testimonials (with permission)\n- Stories for behind-the-scenes content\n\n🎵 TIKTOK\n- Educational content about life insurance myths\n- Success stories and client wins\n- Day-in-the-life content\n- Answer common questions in video format\n\nBEST PRACTICES:\n1. Post consistently (3-5x per week)\n2. Engage with comments within 1 hour\n3. Never cold-pitch in DMs\n4. Provide value first, sell second\n5. Track your leads by platform`;
                          navigator.clipboard.writeText(playbook);
                          setCopiedId('playbook');
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        data-testid="button-download-playbook"
                      >
                        {copiedId === 'playbook' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedId === 'playbook' ? 'Copied to Clipboard!' : 'Copy Social Media Playbook'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Communication Templates</CardTitle>
                        <CardDescription>Ready-to-use text, voicemail, and email templates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          Text Templates
                        </h4>
                        {[
                          { id: 'text-1', name: 'Initial Contact', preview: 'Hi [Name], this is [Your Name] from Gold Coast Financial...', full: 'Hi [Name], this is [Your Name] from Gold Coast Financial. I saw you were interested in getting a life insurance quote. Do you have a few minutes to chat about protecting your family? I can get you a free quote in just 5 minutes!' },
                          { id: 'text-2', name: 'Follow-Up', preview: 'Hi [Name], just checking in about the life insurance quote...', full: 'Hi [Name], just checking in about the life insurance quote we discussed. Have you had a chance to think it over? I\'m happy to answer any questions you might have. When works best for a quick call?' },
                          { id: 'text-3', name: 'Appointment Reminder', preview: 'Hi [Name], reminder about our call tomorrow at [Time]...', full: 'Hi [Name], just a friendly reminder about our call tomorrow at [Time]. I\'ll be calling from this number. Looking forward to helping you protect your family! Talk soon.' },
                        ].map((template) => (
                          <div 
                            key={template.id} 
                            className="p-3 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer group"
                            onClick={() => {
                              navigator.clipboard.writeText(template.full);
                              setCopiedId(template.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            data-testid={`template-${template.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              {copiedId === template.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.preview}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Voicemail Scripts
                        </h4>
                        {[
                          { id: 'vm-1', name: 'First Voicemail', preview: 'Hi [Name], this is [Your Name] calling about the quote...', full: 'Hi [Name], this is [Your Name] calling from Gold Coast Financial about the life insurance quote you requested. I have some great options for you. Please give me a call back at [Your Phone] when you get a chance. I look forward to helping you protect your family!' },
                          { id: 'vm-2', name: 'Urgency Voicemail', preview: 'Hi [Name], I have important information about your rates...', full: 'Hi [Name], this is [Your Name] from Gold Coast Financial. I have some time-sensitive information about your life insurance rates. The quotes I have for you are only valid for a limited time. Please call me back at [Your Phone] today so we can lock in these rates for you.' },
                          { id: 'vm-3', name: 'Final Attempt', preview: 'Hi [Name], this is my last attempt to reach you about...', full: 'Hi [Name], this is [Your Name] from Gold Coast Financial. This is my final attempt to reach you about your life insurance quote. I don\'t want you to miss out on protecting your family. If you\'re still interested, please call me at [Your Phone]. If not, no worries - I wish you all the best!' },
                        ].map((template) => (
                          <div 
                            key={template.id} 
                            className="p-3 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer group"
                            onClick={() => {
                              navigator.clipboard.writeText(template.full);
                              setCopiedId(template.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            data-testid={`template-${template.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              {copiedId === template.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.preview}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-600" />
                          Email Templates
                        </h4>
                        {[
                          { id: 'email-1', name: 'Quote Follow-Up', preview: 'Subject: Your Life Insurance Quote from Gold Coast...', full: 'Subject: Your Life Insurance Quote from Gold Coast Financial\n\nHi [Name],\n\nThank you for your interest in life insurance! I\'ve prepared a personalized quote based on the information you provided.\n\nHere\'s a summary of your options:\n- Option 1: $[Amount] coverage for $[Monthly] per month\n- Option 2: $[Amount] coverage for $[Monthly] per month\n\nI\'d love to walk you through these options and answer any questions you have. When works best for a quick 15-minute call?\n\nBest regards,\n[Your Name]\nGold Coast Financial\n[Your Phone]' },
                          { id: 'email-2', name: 'Policy Delivery', preview: 'Subject: Congratulations! Your Policy is Ready...', full: 'Subject: Congratulations! Your Life Insurance Policy is Ready\n\nHi [Name],\n\nGreat news! Your life insurance policy has been approved and is now active.\n\nPolicy Details:\n- Policy Number: [Number]\n- Coverage Amount: $[Amount]\n- Monthly Premium: $[Monthly]\n- Effective Date: [Date]\n\nYour policy documents are attached to this email. Please review them and let me know if you have any questions.\n\nCongratulations on taking this important step to protect your family!\n\nBest regards,\n[Your Name]\nGold Coast Financial' },
                          { id: 'email-3', name: 'Referral Request', preview: 'Subject: A Quick Favor to Ask...', full: 'Subject: A Quick Favor to Ask\n\nHi [Name],\n\nI hope your family is doing well! I wanted to reach out and thank you again for trusting me with your life insurance needs.\n\nI have a quick favor to ask: Do you know anyone else who might benefit from the same peace of mind you now have? Maybe a family member, friend, or coworker who has recently:\n- Bought a home\n- Had a baby\n- Started a new job\n- Got married\n\nIf you could pass along my information, I\'d really appreciate it. I promise to take great care of anyone you send my way.\n\nThank you so much!\n\nBest regards,\n[Your Name]\nGold Coast Financial\n[Your Phone]' },
                        ].map((template) => (
                          <div 
                            key={template.id} 
                            className="p-3 rounded-lg border hover:border-secondary/50 transition-colors cursor-pointer group"
                            onClick={() => {
                              navigator.clipboard.writeText(template.full);
                              setCopiedId(template.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            data-testid={`template-${template.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              {copiedId === template.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Referral System Training</CardTitle>
                        <CardDescription>Turn every client into a referral source</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">The 5-Step Referral System</h4>
                        <ol className="space-y-3 text-sm">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">1</span>
                            <div>
                              <p className="font-medium">Deliver Exceptional Service</p>
                              <p className="text-muted-foreground text-xs">Wow them at every touchpoint</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">2</span>
                            <div>
                              <p className="font-medium">Set Expectations Early</p>
                              <p className="text-muted-foreground text-xs">"If you're happy, I'd love referrals"</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">3</span>
                            <div>
                              <p className="font-medium">Ask at the Right Time</p>
                              <p className="text-muted-foreground text-xs">After policy delivery, claims, or anniversaries</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">4</span>
                            <div>
                              <p className="font-medium">Make It Easy</p>
                              <p className="text-muted-foreground text-xs">"Who else needs protection like this?"</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">5</span>
                            <div>
                              <p className="font-medium">Show Appreciation</p>
                              <p className="text-muted-foreground text-xs">Thank them and keep them updated</p>
                            </div>
                          </li>
                        </ol>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Referral Scripts</h4>
                        <div className="space-y-3">
                          {[
                            { id: 'ref-1', title: 'At Policy Delivery:', script: '[Name], I\'m so glad we could help protect your family. Most of my best clients come from referrals. Who else in your life might need this same peace of mind?' },
                            { id: 'ref-2', title: 'The Specific Ask:', script: 'Think of 3 people who have kids, a mortgage, or are self-employed. Can you text me their names right now?' },
                            { id: 'ref-3', title: 'After a Claim:', script: 'I\'m so glad the policy was there when you needed it. If you know anyone else who would benefit from this protection, I\'d be honored to help them too.' },
                          ].map((item) => (
                            <div 
                              key={item.id}
                              className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
                              onClick={() => {
                                navigator.clipboard.writeText(item.script);
                                setCopiedId(item.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              data-testid={`referral-script-${item.id}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">{item.title}</p>
                                {copiedId === item.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                              </div>
                              <p className="text-xs text-muted-foreground italic">"{item.script}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'guidelines' && (
              <motion.div
                key="guidelines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Guidelines & Expectations</h2>
                    <p className="text-muted-foreground text-sm">Standards for success at Gold Coast Financial</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-secondary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Leadership & Overrides</CardTitle>
                          <CardDescription>Build your team and earn passive income</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Leadership Levels</h4>
                        <div className="space-y-2">
                          {[
                            { level: 'Agent', requirement: 'Starting position', override: 'No override', color: 'bg-gray-100 dark:bg-gray-800' },
                            { level: 'Senior Agent', requirement: '25+ policies/month + 3 recruits', override: '5-10%', color: 'bg-blue-100 dark:bg-blue-900/30' },
                            { level: 'Team Lead', requirement: '30+ policies/month + 7 recruits', override: '8-15%', color: 'bg-green-100 dark:bg-green-900/30' },
                            { level: 'Manager', requirement: '$250K+/mo team AP + 15 recruits', override: '13-20%', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
                            { level: 'Director', requirement: '4+ teams + $1M+/month combined', override: '15-25%', color: 'bg-orange-100 dark:bg-orange-900/30' },
                            { level: 'Executive', requirement: 'Full branch owned', override: '21-30%', color: 'bg-secondary/20' },
                          ].map((item, idx) => (
                            <div key={idx} className={cn("flex items-center justify-between p-3 rounded-lg", item.color)}>
                              <div>
                                <p className="font-medium text-sm">{item.level}</p>
                                <p className="text-xs text-muted-foreground">{item.requirement}</p>
                              </div>
                              <Badge variant="outline" className="font-semibold">{item.override === 'No override' ? item.override : `${item.override} override`}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How Overrides Work</h4>
                        <p className="text-xs text-muted-foreground">
                          When you recruit agents to your team, you earn a percentage of their commission on every policy they write. 
                          This is <span className="font-medium text-foreground">passive income</span> that continues as long as they remain on your team.
                        </p>
                        <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                          <p className="text-sm font-medium text-secondary">Example:</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            If your downline agent earns $1,000 commission and you're at 10% override, you earn $100 extra — without doing any additional work.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Daily Expectations</CardTitle>
                          <CardDescription>Non-negotiable standards for success</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { 
                            title: 'In Office by 8:30 AM', 
                            icon: Clock, 
                            description: 'Be in the office and ready to work by 8:30 AM. Early arrival sets the tone for success.',
                            color: 'text-secondary'
                          },
                          { 
                            title: '3 Deals Per Day Goal', 
                            icon: Target, 
                            description: 'Submit at least 3 applications daily. This is the minimum to build momentum.',
                            color: 'text-green-600'
                          },
                          { 
                            title: 'Professional Dress Code', 
                            icon: Briefcase, 
                            description: 'Business professional at all times. First impressions matter — even on Zoom calls.',
                            color: 'text-blue-600'
                          },
                          { 
                            title: 'No Scrolling on Reels', 
                            icon: AlertTriangle, 
                            description: 'Social media is for prospecting only. No mindless scrolling during work hours.',
                            color: 'text-red-600'
                          },
                          { 
                            title: 'Phone Time: 5+ Hours', 
                            icon: Phone, 
                            description: 'Minimum 5 hours of talk time daily. The phone is where money is made.',
                            color: 'text-purple-600'
                          },
                          { 
                            title: 'CRM Updates', 
                            icon: Users, 
                            description: 'Update every lead after each interaction. No exceptions.',
                            color: 'text-orange-600'
                          },
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-3 p-3 rounded-lg border">
                            <div className={cn("flex-shrink-0", item.color)}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">The Gold Coast Standard</CardTitle>
                    <CardDescription>What separates top performers from everyone else</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { metric: 'Minimum Dials', value: '100/day', note: 'Talk to more people = more deals' },
                        { metric: 'Contact Rate', value: '15%', note: 'Aim for 15 conversations per 100 dials' },
                        { metric: 'Close Rate', value: '25%', note: 'Close 1 in 4 qualified appointments' },
                        { metric: 'Avg Premium', value: '$75/mo', note: 'Quality over quantity' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-lg border text-center">
                          <p className="text-3xl font-bold text-secondary mb-1">{item.value}</p>
                          <p className="font-medium text-sm">{item.metric}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-secondary/30">
                  <CardContent className="py-6">
                    <div className="text-center max-w-2xl mx-auto">
                      <Trophy className="w-12 h-12 text-secondary mx-auto mb-4" />
                      <h3 className="text-xl font-serif font-bold mb-2">Remember Why You're Here</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Every family you help is a legacy you're building. Every policy is peace of mind. 
                        Every rejection is one step closer to a yes. Stay hungry, stay focused, and protect families.
                      </p>
                      <p className="text-secondary font-semibold italic">"Success is not given. It's earned."</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={(tab) => { setActiveTab(tab as TabType); window.scrollTo(0, 0); }}
        onAction={handleCommandAction}
        theme={theme}
      />

      <XPToast
        amount={xpGain?.amount || 0}
        reason={xpGain?.reason}
        type={xpGain?.type as any}
        show={!!xpGain}
        onComplete={clearXPGain}
      />

      <LevelUpCelebration
        show={!!levelUp}
        newLevel={levelUp || 1}
        onComplete={clearLevelUp}
      />

      <LeaderboardModal
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        leaderboard={leaderboard}
        currentUserId={currentUser?.id || ''}
      />

      <AddLeadModal
        open={showAddLead}
        onOpenChange={setShowAddLead}
        onAddLead={addLead}
      />

      <AddTaskModal
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onAddTask={addTask}
      />

      <LogCallModal
        open={showLogCall}
        onOpenChange={setShowLogCall}
        leads={filteredLeads}
        onLogCall={logCall}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        onAddActivity={addActivityToLead}
        onUpdateStatus={updateLeadStatus}
      />

      <TrainingModuleViewer
        course={selectedCourse}
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
        onCompleteModule={completeModule}
      />
    </div>
  );
}
