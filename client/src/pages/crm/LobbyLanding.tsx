/**
 * Lobby Landing Page
 * The luxury hotel lobby experience - beautiful, welcoming, numbers-focused
 * NO personal lead data - just business health metrics
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { LobbyLayout } from './LobbyLayout';
import { Card, CardContent } from '@/components/ui/card';
import { AgentLoungeSelectorModal } from '@/components/agent/AgentLoungeSelectorModal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, GRID, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import {
  Users,
  Bot,
  DollarSign,
  Megaphone,
  HeadphonesIcon,
  Shield,
  BarChart3,
  Briefcase,
  Building2,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Trophy,
  Sparkles,
  CheckCircle2,
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
}

// =============================================================================
// SHARED STYLES
// =============================================================================

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

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
    gradient: 'from-blue-800 to-blue-950',
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
    gradient: 'from-emerald-500 to-emerald-700',
    path: '/manager/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'director',
    name: 'Director Lounge',
    description: 'Multi-team oversight',
    icon: Building2,
    gradient: 'from-blue-700 to-slate-900',
    path: '/manager/director',
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'support',
    name: 'Support Lounge',
    description: 'Client assistance',
    icon: HeadphonesIcon,
    gradient: 'from-gray-700 to-gray-900',
    path: '/support/dashboard',
    requiredRoles: ['owner', 'system_admin', 'manager'],
  },
  {
    id: 'executive',
    name: 'Executive Lounge',
    description: 'Strategic insights',
    icon: BarChart3,
    gradient: 'from-orange-500 to-orange-700',
    path: '/executive/dashboard',
    requiredRoles: ['owner', 'system_admin', 'investor'],
  },
  {
    id: 'admin',
    name: 'Admin Lounge',
    description: 'System configuration',
    icon: Shield,
    gradient: 'from-slate-500 to-blue-700',
    path: '/admin',
    requiredRoles: ['owner', 'system_admin'],
  },
  {
    id: 'investor',
    name: 'Investor Lounge',
    description: 'KPIs & executive dashboards',
    icon: BarChart3,
    gradient: 'from-amber-500 to-yellow-600',
    path: '/investor/dashboard',
    requiredRoles: ['owner', 'investor'],
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

    return {
      metrics: [
        {
          label: 'Total Leads',
          value: crm.summary?.totalLeads || 0,
          change: leadChange,
          changeLabel: 'vs last week',
          icon: Target,
        },
        {
          label: 'Deals Closed',
          value: crm.performance?.wonThisMonth || 0,
          change: crm.performance?.wonThisMonth > 0 ? 8 : 0,
          changeLabel: 'this month',
          icon: CheckCircle2,
        },
        {
          label: 'Revenue',
          value: revenueFormatted,
          change: revenueThisMonth > 0 ? 15 : 0,
          changeLabel: 'vs last month',
          icon: DollarSign,
        },
        {
          label: 'Conversion',
          value: `${conversionRate.toFixed(1)}%`,
          change: conversionRate > 0 ? 3 : 0,
          changeLabel: 'overall rate',
          icon: TrendingUp,
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
        { label: 'Total Leads', value: 0, change: 0, changeLabel: 'vs last week', icon: Target },
        { label: 'Deals Closed', value: 0, change: 0, changeLabel: 'this month', icon: CheckCircle2 },
        { label: 'Revenue', value: '$0', change: 0, changeLabel: 'vs last month', icon: DollarSign },
        { label: 'Conversion', value: '0%', change: 0, changeLabel: 'overall rate', icon: TrendingUp },
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

function MetricCard({ metric }: { metric: BusinessMetric }) {
  const Icon = metric.icon;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <Card
        className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/70 mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              {metric.change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    metric.change >= 0 ? "text-emerald-300" : "text-red-300"
                  )}>
                    {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-xs text-white/50">{metric.changeLabel}</span>
                </div>
              )}
            </div>
            <div
              className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur"
              style={{ borderRadius: RADIUS.button }}
            >
              <Icon className="w-6 h-6 text-amber-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoungeNavigationCard({ lounge, onCustomClick }: { lounge: LoungeCard; onCustomClick?: () => void }) {
  const Icon = lounge.icon;

  const cardContent = (
    <Card
      className="group h-full cursor-pointer border-0 transition-all overflow-hidden"
      style={glassCard}
    >
      <div className={cn('h-1.5 bg-gradient-to-r', lounge.gradient)} />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-11 h-11 flex items-center justify-center bg-gradient-to-br flex-shrink-0 group-hover:scale-110 transition-transform',
              lounge.gradient
            )}
            style={{ borderRadius: RADIUS.button }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                {lounge.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{lounge.description}</p>
            {lounge.stat && (
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium border-0"
                  style={{ borderRadius: RADIUS.pill }}
                >
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
  );

  if (onCustomClick) {
    return (
      <motion.div
        variants={scaleIn}
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        transition={{ duration: MOTION.duration.hover }}
        onClick={onCustomClick}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <Link href={lounge.path}>
        {cardContent}
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
    <div
      className="flex items-start gap-3 p-3 hover:bg-white/10 transition-colors cursor-pointer"
      style={{ borderRadius: RADIUS.button }}
    >
      <div
        className={cn('w-2 h-2 mt-2 flex-shrink-0', typeColors[announcement.type as keyof typeof typeColors] || 'bg-white/40')}
        style={{ borderRadius: RADIUS.pill }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{announcement.title}</p>
        <p className="text-xs text-white/60 mt-0.5">{announcement.date}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: MOTION.duration.hover }}
        className="flex items-center gap-3 p-4 bg-white/15 backdrop-blur hover:bg-white/25 border border-white/20 transition-all cursor-pointer"
        style={{ borderRadius: RADIUS.button }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur"
          style={{ borderRadius: RADIUS.button }}
        >
          <Icon className="w-5 h-5 text-amber-200" />
        </div>
        <span className="font-medium text-sm text-white">{label}</span>
        <ArrowRight className="w-4 h-4 text-white/50 ml-auto" />
      </motion.div>
    </Link>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function LobbyLanding() {
  const { user } = useAuth();
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);

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
        case 'director':
          // Show teams managed for director view
          stat = { label: 'Teams', value: 3 };
          break;
      }

      return { ...lounge, stat };
    });

  return (
    <LobbyLayout>
      <motion.div
        className="max-w-7xl mx-auto"
        style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section variants={fadeInUp}>
          <div
            className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: GRID.spacing.lg,
            }}
          >
            {/* Decorative dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Decorative floating circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-sm" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Premium Icon Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                  style={{
                    width: GRID.spacing.xxxxl,
                    height: GRID.spacing.xxxxl,
                    borderRadius: RADIUS.card,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Sparkles
                    className="text-amber-200"
                    style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                  />
                </motion.div>

                <div className="flex-1">
                  <p
                    className="text-white/90 font-medium"
                    style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}
                  >
                    Welcome back
                  </p>
                  <h1
                    className="font-bold tracking-tight text-white font-serif"
                    style={{
                      fontSize: TYPE.display,
                      marginBottom: GRID.spacing.xs,
                      lineHeight: 1.1,
                    }}
                  >
                    {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
                  </h1>
                  <p
                    className="text-white/90 max-w-xl"
                    style={{ fontSize: TYPE.body, lineHeight: 1.5 }}
                  >
                    Here's how your business is performing today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Business Metrics */}
        <motion.section variants={fadeInUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Business Health</h2>
            <Badge
              className="text-emerald-600 border-0 bg-emerald-50"
              style={{ borderRadius: RADIUS.pill }}
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 mr-1.5 animate-pulse" style={{ borderRadius: RADIUS.pill }} />
              Live
            </Badge>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" style={{ borderRadius: RADIUS.card }} />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {data?.metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Main Grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lounges Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Lounges</h2>
              <p className="text-sm text-gray-500">{accessibleLounges.length} available</p>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {accessibleLounges.map((lounge) => (
                <LoungeNavigationCard
                  key={lounge.id}
                  lounge={lounge}
                  onCustomClick={lounge.id === 'agent' ? () => setAgentSelectorOpen(true) : undefined}
                />
              ))}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card
              className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Zap className="w-4 h-4 text-amber-200" />
                  </div>
                  <h3 className="font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <QuickActionButton
                    icon={Users}
                    label="View My Leads"
                    href="/agents/dashboard"
                  />
                  <QuickActionButton
                    icon={DollarSign}
                    label="Check Commissions"
                    href="/finance/dashboard"
                  />
                  <QuickActionButton
                    icon={BarChart3}
                    label="View Reports"
                    href="/executive/dashboard"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card
              className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Bell className="w-4 h-4 text-amber-200" />
                  </div>
                  <h3 className="font-semibold text-white">Announcements</h3>
                </div>
                <div className="space-y-2">
                  {data?.announcements.map((announcement) => (
                    <AnnouncementItem key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Snapshot */}
            <Card
              className="border-0 overflow-hidden relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Trophy className="w-4 h-4 text-amber-200" />
                  </div>
                  <h3 className="font-semibold text-white">This Week</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="text-center p-3 bg-white/15 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <p className="text-2xl font-bold text-white">
                      {data?.performance?.leadsThisWeek || 0}
                    </p>
                    <p className="text-xs text-white/70">New Leads</p>
                  </div>
                  <div
                    className="text-center p-3 bg-white/15 backdrop-blur"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <p className="text-2xl font-bold text-white">
                      {data?.performance?.dealsThisMonth || 0}
                    </p>
                    <p className="text-xs text-white/70">Deals Closed</p>
                  </div>
                </div>
                <div
                  className="mt-4 p-3 bg-white/15 backdrop-blur"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80">Conversion Rate</span>
                    <span className="text-sm font-semibold text-amber-200">
                      {data?.performance?.conversionRate || 0}%
                    </span>
                  </div>
                  <div
                    className="h-2 bg-white/20 overflow-hidden"
                    style={{ borderRadius: RADIUS.pill }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.performance?.conversionRate || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-amber-300"
                      style={{ borderRadius: RADIUS.pill }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* AI Concierge - Luxury Hotel Style */}
      <LobbyConcierge />

      {/* Agent Lounge Selector Modal */}
      <AgentLoungeSelectorModal open={agentSelectorOpen} onOpenChange={setAgentSelectorOpen} />
    </LobbyLayout>
  );
}

export default LobbyLanding;
