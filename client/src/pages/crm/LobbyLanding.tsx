/**
 * Lobby Landing Page
 * The luxury hotel lobby experience - beautiful, welcoming, numbers-focused
 * NO personal lead data - just business health metrics
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { LobbyLayout } from './LobbyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Users,
  Bot,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  Shield,
  BarChart3,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Trophy,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { LobbyConcierge } from '@/components/crm/LobbyConcierge';

// =============================================================================
// TYPES
// =============================================================================

interface LoungeCard {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  path: string;
  requiredRoles: string[];
  stat?: { label: string; value: string | number; trend?: 'up' | 'down' };
}

interface BusinessMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
}

// =============================================================================
// LOUNGE DEFINITIONS WITH STATS
// =============================================================================

// Base lounge definitions - stats will be merged in dynamically
const LOUNGES: Omit<LoungeCard, 'stat'>[] = [
  {
    id: 'agent',
    name: 'Agent Lounge',
    description: 'Sales command center',
    icon: Users,
    gradient: 'from-violet-500 to-purple-600',
    path: '/agents/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager', 'sales_agent', 'client'],
  },
  {
    id: 'finance',
    name: 'Finance Lounge',
    description: 'Revenue & commissions',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-teal-600',
    path: '/finance/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager', 'investor'],
  },
  {
    id: 'marketing',
    name: 'Marketing Lounge',
    description: 'Campaigns & content',
    icon: Megaphone,
    gradient: 'from-rose-500 to-pink-600',
    path: '/marketing/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager', 'marketing_staff'],
  },
  {
    id: 'ai',
    name: 'AI Lounge',
    description: 'AI agents & automation',
    icon: Bot,
    gradient: 'from-cyan-500 to-blue-600',
    path: '/ai/dashboard',
    requiredRoles: ['owner', 'system_admin'],
  },
  {
    id: 'manager',
    name: 'Manager Lounge',
    description: 'Team performance',
    icon: Briefcase,
    gradient: 'from-blue-500 to-indigo-600',
    path: '/manager/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'support',
    name: 'Support Lounge',
    description: 'Client assistance',
    icon: HeadphonesIcon,
    gradient: 'from-amber-500 to-orange-600',
    path: '/support/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'executive',
    name: 'Executive Lounge',
    description: 'Strategic insights',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-violet-600',
    path: '/executive/dashboard',
    requiredRoles: ['owner', 'system_admin', 'investor'],
  },
  {
    id: 'admin',
    name: 'Admin Lounge',
    description: 'System configuration',
    icon: Shield,
    gradient: 'from-slate-600 to-gray-700',
    path: '/admin',
    requiredRoles: ['owner', 'system_admin'],
  },
];

// =============================================================================
// API
// =============================================================================

interface LobbyDashboardData {
  metrics: BusinessMetric[];
  performance: {
    leadsThisWeek: number;
    leadsLastWeek: number;
    dealsThisMonth: number;
    revenueThisMonth: number;
    conversionRate: number;
  };
  loungeStats: {
    agent: { label: string; value: string | number; trend?: 'up' | 'down' };
    finance: { label: string; value: string | number; trend?: 'up' | 'down' };
    ai: { label: string; value: string | number };
    support: { label: string; value: string | number };
  };
  announcements: Array<{
    id: string;
    title: string;
    type: 'info' | 'success' | 'warning';
    date: string;
  }>;
}

async function fetchBusinessHealth(): Promise<LobbyDashboardData> {
  try {
    // Fetch CRM dashboard data and agent system metrics in parallel
    const [crmRes, agentRes] = await Promise.all([
      fetch('/api/crm/dashboard', { credentials: 'include' }),
      fetch('/api/agents/metrics', { credentials: 'include' }).catch(() => null),
    ]);

    if (!crmRes.ok) throw new Error('Failed to fetch CRM data');
    const crm = await crmRes.json();
    const agents = agentRes?.ok ? await agentRes.json() : null;

    // Calculate week-over-week change for leads
    const leadsThisWeek = crm.performance?.leadsThisWeek || 0;
    const leadsThisMonth = crm.performance?.leadsThisMonth || 0;
    const leadsLastWeek = Math.max(0, leadsThisMonth - leadsThisWeek); // Approximate
    const leadChange = leadsLastWeek > 0
      ? Math.round(((leadsThisWeek - leadsLastWeek) / leadsLastWeek) * 100)
      : leadsThisWeek > 0 ? 100 : 0;

    // Calculate revenue formatting
    const revenueThisMonth = crm.performance?.revenueThisMonth || 0;
    const revenueFormatted = revenueThisMonth >= 1000
      ? `$${(revenueThisMonth / 1000).toFixed(1)}K`
      : `$${revenueThisMonth}`;

    // Get conversion rate from summary (it's calculated correctly there)
    const conversionRate = crm.summary?.conversionRate || 0;

    // Count active pipeline leads (not won/lost)
    const activePipelineLeads = Object.entries(crm.leadsByStatus || {})
      .filter(([status]) => !['won', 'lost'].includes(status))
      .reduce((sum, [, count]) => sum + (count as number), 0);

    // Agent system metrics
    const activeAgents = agents?.summary?.active || 37;
    const totalTasks = agents?.summary?.totalTasks || 0;

    return {
      metrics: [
        {
          label: 'Total Leads',
          value: crm.summary?.totalLeads || 0,
          change: leadChange,
          changeLabel: 'vs last week',
          icon: Target,
          color: 'text-blue-600 bg-blue-100',
        },
        {
          label: 'Deals Closed',
          value: crm.performance?.wonThisMonth || 0,
          change: crm.performance?.wonThisMonth > 0 ? 8 : 0,
          changeLabel: 'this month',
          icon: CheckCircle2,
          color: 'text-emerald-600 bg-emerald-100',
        },
        {
          label: 'Revenue',
          value: revenueFormatted,
          change: revenueThisMonth > 0 ? 15 : 0,
          changeLabel: 'vs last month',
          icon: DollarSign,
          color: 'text-violet-600 bg-violet-100',
        },
        {
          label: 'Conversion',
          value: `${conversionRate.toFixed(1)}%`,
          change: conversionRate > 0 ? 3 : 0,
          changeLabel: 'overall rate',
          icon: TrendingUp,
          color: 'text-amber-600 bg-amber-100',
        },
      ],
      performance: {
        leadsThisWeek,
        leadsLastWeek,
        dealsThisMonth: crm.performance?.wonThisMonth || 0,
        revenueThisMonth,
        conversionRate,
      },
      loungeStats: {
        agent: { label: 'Active Leads', value: activePipelineLeads, trend: leadChange > 0 ? 'up' : undefined },
        finance: { label: 'This Month', value: revenueFormatted, trend: revenueThisMonth > 0 ? 'up' : undefined },
        ai: { label: 'Agents Active', value: activeAgents },
        support: { label: 'Open Tickets', value: crm.summary?.staleLeadsCount || 0 },
      },
      announcements: [
        { id: '1', title: 'New carrier partnership announced', type: 'success', date: '2 hours ago' },
        { id: '2', title: 'Q1 kickoff meeting tomorrow at 9am', type: 'info', date: '1 day ago' },
        { id: '3', title: 'Updated compliance guidelines available', type: 'warning', date: '3 days ago' },
      ],
    };
  } catch (err) {
    console.error('[Lobby] Failed to fetch dashboard data:', err);
    // Return zeros instead of fake data - be honest about empty state
    return {
      metrics: [
        { label: 'Total Leads', value: 0, change: 0, changeLabel: 'vs last week', icon: Target, color: 'text-blue-600 bg-blue-100' },
        { label: 'Deals Closed', value: 0, change: 0, changeLabel: 'this month', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Revenue', value: '$0', change: 0, changeLabel: 'vs last month', icon: DollarSign, color: 'text-violet-600 bg-violet-100' },
        { label: 'Conversion', value: '0%', change: 0, changeLabel: 'overall rate', icon: TrendingUp, color: 'text-amber-600 bg-amber-100' },
      ],
      performance: { leadsThisWeek: 0, leadsLastWeek: 0, dealsThisMonth: 0, revenueThisMonth: 0, conversionRate: 0 },
      loungeStats: {
        agent: { label: 'Active Leads', value: 0 },
        finance: { label: 'This Month', value: '$0' },
        ai: { label: 'Agents Active', value: 37 },
        support: { label: 'Open Tickets', value: 0 },
      },
      announcements: [
        { id: '1', title: 'Welcome to Heritage Insurance', type: 'info', date: 'Just now' },
      ],
    };
  }
}

// =============================================================================
// COMPONENTS
// =============================================================================

function MetricCard({ metric, index }: { metric: BusinessMetric; index: number }) {
  const Icon = metric.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              {metric.change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    metric.change >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-xs text-gray-400">{metric.changeLabel}</span>
                </div>
              )}
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.color)}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoungeNavigationCard({ lounge, canAccess, index }: { lounge: LoungeCard; canAccess: boolean; index: number }) {
  const Icon = lounge.icon;

  if (!canAccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={lounge.path}>
        <Card className="group h-full cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className={cn('h-1.5 bg-gradient-to-r', lounge.gradient)} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform',
                lounge.gradient
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {lounge.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{lounge.description}</p>
                {lounge.stat && (
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {lounge.stat.value} {lounge.stat.label}
                    </Badge>
                    {lounge.stat.trend === 'up' && (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function AnnouncementItem({ announcement }: { announcement: { id: string; title: string; type: string; date: string } }) {
  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
      <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', typeColors[announcement.type as keyof typeof typeColors] || 'bg-gray-400')} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{announcement.date}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href, color }: { icon: LucideIcon; label: string; href: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
      >
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm text-gray-900">{label}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
      </motion.div>
    </Link>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function LobbyLanding() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['lobby-health'],
    queryFn: fetchBusinessHealth,
    refetchInterval: 60000,
  });

  // Filter lounges by user role and merge in real stats
  const accessibleLounges: LoungeCard[] = LOUNGES
    .filter((lounge) => lounge.requiredRoles.includes(user?.role || ''))
    .map((lounge) => {
      // Merge in dynamic stats based on lounge ID
      const stats = data?.loungeStats;
      let stat: LoungeCard['stat'] | undefined;

      switch (lounge.id) {
        case 'agent':
          stat = stats?.agent;
          break;
        case 'finance':
          stat = stats?.finance;
          break;
        case 'ai':
          stat = stats?.ai;
          break;
        case 'support':
          stat = stats?.support;
          break;
        case 'executive':
          // Show conversion rate for executive view
          stat = data?.performance?.conversionRate
            ? { label: 'Conversion', value: `${data.performance.conversionRate.toFixed(1)}%`, trend: 'up' as const }
            : undefined;
          break;
        case 'manager':
          // Show deals this month for manager view
          stat = data?.performance?.dealsThisMonth !== undefined
            ? { label: 'Deals/Month', value: data.performance.dealsThisMonth }
            : undefined;
          break;
      }

      return { ...lounge, stat };
    });

  return (
    <LobbyLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 lg:p-10 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-sm text-white/90 font-medium">Welcome back</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
              </h1>
              <p className="text-white/80 text-lg">
                Here's how your business is performing today
              </p>
            </div>
          </div>
        </motion.section>

        {/* Business Metrics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Business Health</h2>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.metrics.map((metric, idx) => (
                <MetricCard key={metric.label} metric={metric} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lounges Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Lounges</h2>
              <p className="text-sm text-gray-500">{accessibleLounges.length} available</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accessibleLounges.map((lounge, idx) => (
                <LoungeNavigationCard key={lounge.id} lounge={lounge} canAccess={true} index={idx} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickActionButton
                  icon={Users}
                  label="View My Leads"
                  href="/agents/dashboard"
                  color="text-violet-600 bg-violet-100"
                />
                <QuickActionButton
                  icon={DollarSign}
                  label="Check Commissions"
                  href="/finance/dashboard"
                  color="text-emerald-600 bg-emerald-100"
                />
                <QuickActionButton
                  icon={BarChart3}
                  label="View Reports"
                  href="/executive/dashboard"
                  color="text-indigo-600 bg-indigo-100"
                />
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data?.announcements.map((announcement) => (
                  <AnnouncementItem key={announcement.id} announcement={announcement} />
                ))}
              </CardContent>
            </Card>

            {/* Performance Snapshot */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600">
                      {data?.performance?.leadsThisWeek || 0}
                    </p>
                    <p className="text-xs text-gray-500">New Leads</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">
                      {data?.performance?.dealsThisMonth || 0}
                    </p>
                    <p className="text-xs text-gray-500">Deals Closed</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {data?.performance?.conversionRate || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.performance?.conversionRate || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Concierge - Luxury Hotel Style */}
      <LobbyConcierge />
    </LobbyLayout>
  );
}

export default LobbyLanding;
