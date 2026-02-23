/**
 * CRM Dashboard
 * Heritage Command Lounge Design System
 * Real-time pipeline analytics, source effectiveness, and lead management
 */

import { motion } from 'framer-motion';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Target,
  Building2,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
  Clock,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
  scaleIn,
  spacing,
} from '@/lib/heritageDesignSystem';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardData {
  summary: {
    totalLeads: number;
    totalClients: number;
    totalPipelineValue: number;
    conversionRate: number;
    staleLeadsCount: number;
  };
  leadsByStatus: Record<string, number>;
  funnel: Array<{
    stage: string;
    count: number;
    conversionFromPrevious: number;
  }>;
  pipeline: Record<string, { value: number; count: number }>;
  sources: Array<{
    source: string;
    totalLeads: number;
    wonLeads: number;
    conversionRate: number;
    avgValue: number;
    totalWonValue: number;
  }>;
  staleLeads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    assignedTo: string | null;
    estimatedValue: number | null;
    lastActivity: string;
    daysSinceActivity: number;
  }>;
  activitySummary: Record<string, number>;
  performance: {
    leadsThisMonth: number;
    wonThisMonth: number;
    revenueThisMonth: number;
    leadsThisWeek: number;
  };
}

// =============================================================================
// API
// =============================================================================

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/crm/dashboard', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

async function touchLead(leadId: string): Promise<void> {
  const res = await fetch(`/api/crm/leads/${leadId}/touch`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: 'Followed up from dashboard' }),
  });
  if (!res.ok) throw new Error('Failed to touch lead');
}

// =============================================================================
// FUNNEL VISUALIZATION COMPONENT
// =============================================================================

function FunnelVisualization({ funnel }: { funnel: DashboardData['funnel'] }) {
  const stageLabels: Record<string, string> = {
    new: 'New Leads',
    contacted: 'Contacted',
    quoted: 'Quoted',
    follow_up: 'Follow-Up',
    won: 'Won',
  };

  const stageColors: Record<string, string> = {
    new: 'bg-indigo-500',
    contacted: 'bg-cyan-500',
    quoted: 'bg-violet-500',
    follow_up: 'bg-amber-500',
    won: 'bg-emerald-500',
  };

  const maxCount = Math.max(...funnel.map(s => s.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
      {funnel.map((stage, idx) => (
        <motion.div
          key={stage.stage}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: MOTION.duration.normal, delay: idx * 0.08, ease: MOTION.easing }}
          className="flex items-center"
          style={{ gap: GRID.spacing.sm }}
        >
          <div
            className="text-gray-600 font-medium"
            style={{ width: 100, fontSize: TYPE.meta }}
          >
            {stageLabels[stage.stage] || stage.stage}
          </div>
          <div className="flex-1 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((stage.count / maxCount) * 100, 5)}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: MOTION.easing }}
              className={cn(stageColors[stage.stage] || 'bg-gray-400')}
              style={{
                height: GRID.spacing.lg,
                borderRadius: RADIUS.button / 2,
              }}
            />
            <div
              className="absolute inset-y-0 flex items-center"
              style={{ left: GRID.spacing.xs }}
            >
              <span
                className="text-white font-semibold drop-shadow"
                style={{ fontSize: TYPE.meta }}
              >
                {stage.count}
              </span>
            </div>
          </div>
          <div style={{ width: 60, textAlign: 'right' }}>
            {idx > 0 && (
              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                {stage.conversionFromPrevious}%
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// SOURCE EFFECTIVENESS TABLE
// =============================================================================

function SourceEffectivenessTable({ sources }: { sources: DashboardData['sources'] }) {
  const sourceLabels: Record<string, string> = {
    quote_form: 'Quote Form',
    contact_form: 'Contact Form',
    phone: 'Phone',
    referral: 'Referral',
    website: 'Website',
    social_media: 'Social Media',
    other: 'Other',
    unknown: 'Unknown',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontSize: TYPE.meta }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
            <th
              className="text-left font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Source
            </th>
            <th
              className="text-right font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Volume
            </th>
            <th
              className="text-right font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Won
            </th>
            <th
              className="text-right font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Conv. Rate
            </th>
            <th
              className="text-right font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Avg Value
            </th>
            <th
              className="text-right font-medium text-gray-500"
              style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
            >
              Total Value
            </th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source, idx) => (
            <motion.tr
              key={source.source}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: MOTION.duration.normal, delay: idx * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
              style={{
                borderBottom: `1px solid ${COLORS.gray[100]}`,
              }}
            >
              <td
                className="font-medium text-gray-900"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                {sourceLabels[source.source] || source.source}
              </td>
              <td
                className="text-right text-gray-600"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                {source.totalLeads}
              </td>
              <td
                className="text-right text-gray-600"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                {source.wonLeads}
              </td>
              <td
                className="text-right"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    source.conversionRate >= 20
                      ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                      : source.conversionRate >= 10
                      ? 'text-amber-600 border-amber-200 bg-amber-50'
                      : 'text-gray-600 border-gray-200'
                  )}
                  style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
                >
                  {source.conversionRate}%
                </Badge>
              </td>
              <td
                className="text-right text-gray-600"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                ${source.avgValue.toLocaleString()}
              </td>
              <td
                className="text-right font-medium text-gray-900"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}
              >
                ${source.totalWonValue.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// STALE LEAD ALERTS
// =============================================================================

function StaleLeadAlerts({
  leads,
  onTouch,
}: {
  leads: DashboardData['staleLeads'];
  onTouch: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="text-center text-gray-500" style={{ padding: GRID.spacing.lg }}>
        <Clock
          className="mx-auto text-gray-400"
          style={{ width: GRID.spacing.lg, height: GRID.spacing.lg, marginBottom: GRID.spacing.xs }}
        />
        <p style={{ fontSize: TYPE.body }}>No stale leads - great job staying on top of follow-ups!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {leads.slice(0, 5).map((lead, idx) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.normal, delay: idx * 0.05 }}
          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
          className="flex items-center transition-colors"
          style={{
            gap: GRID.spacing.sm,
            padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`,
            borderRadius: RADIUS.button,
            borderBottom: idx < leads.slice(0, 5).length - 1 ? `1px solid ${COLORS.gray[100]}` : 'none',
          }}
        >
          <div
            className="rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"
            style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
          >
            <AlertTriangle
              className="text-amber-600"
              style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate" style={{ fontSize: TYPE.body }}>
              {lead.firstName} {lead.lastName}
            </p>
            <div
              className="flex items-center text-gray-500"
              style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}
            >
              <span>{lead.email}</span>
              {lead.estimatedValue && (
                <>
                  <span>|</span>
                  <span className="text-emerald-600 font-medium">
                    ${lead.estimatedValue.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-200 bg-amber-50"
              style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
            >
              {lead.daysSinceActivity} days
            </Badge>
          </div>
          <div className="flex flex-shrink-0" style={{ gap: GRID.spacing.xs / 2 }}>
            <Button
              size="sm"
              variant="ghost"
              className="p-0"
              style={{
                width: GRID.spacing.lg,
                height: GRID.spacing.lg,
                borderRadius: RADIUS.button,
              }}
              onClick={() => (window.location.href = `tel:${lead.phone}`)}
              title="Call"
            >
              <Phone style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-0"
              style={{
                width: GRID.spacing.lg,
                height: GRID.spacing.lg,
                borderRadius: RADIUS.button,
              }}
              onClick={() => (window.location.href = `mailto:${lead.email}`)}
              title="Email"
            >
              <Mail style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTouch(lead.id)}
              style={{ fontSize: TYPE.caption, borderRadius: RADIUS.button }}
            >
              Mark Contacted
            </Button>
          </div>
        </motion.div>
      ))}
      {leads.length > 5 && (
        <div className="text-center" style={{ paddingTop: GRID.spacing.sm }}>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600"
            style={{ fontSize: TYPE.meta, borderRadius: RADIUS.button }}
          >
            View all {leads.length} stale leads
            <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, marginLeft: 4 }} />
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  subtextColor = 'text-gray-500',
  isLoading = false,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  subtextColor?: string;
  isLoading?: boolean;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <Card
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.level2,
          border: `1px solid ${COLORS.gray[200]}`,
        }}
      >
        <CardHeader
          className="flex flex-row items-center justify-between"
          style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.xs }}
        >
          <CardTitle className="font-medium text-gray-500" style={{ fontSize: TYPE.meta }}>
            {title}
          </CardTitle>
          <Icon className={cn(iconColor)} style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
        </CardHeader>
        <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <div className="font-bold" style={{ fontSize: TYPE.section }}>
                {value}
              </div>
              <p className={cn(subtextColor)} style={{ fontSize: TYPE.caption }}>
                {subtext}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export function CRMDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60000,
  });

  const touchMutation = useMutation({
    mutationFn: touchLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] });
      toast.success('Lead marked as contacted');
    },
    onError: () => {
      toast.error('Failed to update lead');
    },
  });

  return (
    <CRMLoungeLayout breadcrumbs={[{ label: 'CRM Lounge' }, { label: 'Dashboard' }]}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* Hero Header */}
        <motion.div variants={fadeInUp}>
          <Card
            className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div
              className="absolute top-0 right-0 bg-white/10 rounded-full"
              style={{ width: 256, height: 256, transform: 'translate(50%, -50%)' }}
            />
            <div
              className="absolute bottom-0 left-0 bg-white/5 rounded-full"
              style={{ width: 128, height: 128, transform: 'translate(-50%, 50%)' }}
            />
            <CardContent className="relative" style={{ padding: GRID.spacing.lg }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                  <div
                    className="bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    style={{
                      width: GRID.spacing.xxl,
                      height: GRID.spacing.xxl,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <Target style={{ width: GRID.spacing.md, height: GRID.spacing.md }} />
                  </div>
                  <div>
                    <Badge
                      className="bg-white/20 text-white border-0"
                      style={{ marginBottom: GRID.spacing.xs, borderRadius: RADIUS.pill }}
                    >
                      CRM Command Center
                    </Badge>
                    <h1 className="font-bold" style={{ fontSize: TYPE.hero, marginBottom: GRID.spacing.xs }}>
                      Pipeline Dashboard
                    </h1>
                    <p className="text-indigo-100" style={{ fontSize: TYPE.body }}>
                      Real-time analytics, lead management, and source effectiveness tracking
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <RefreshCw
                    className={cn(isLoading && 'animate-spin')}
                    style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, marginRight: GRID.spacing.xs }}
                  />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-red-200 bg-red-50"
              style={{ borderRadius: RADIUS.card }}
            >
              <CardContent style={{ padding: GRID.spacing.md }}>
                <p className="text-red-600" style={{ fontSize: TYPE.meta }}>
                  Failed to load dashboard data. Please try again.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
          style={{ gap: GRID.spacing.sm }}
        >
          <StatCard
            title="Total Leads"
            value={data?.summary.totalLeads ?? 0}
            subtext={`${data?.performance.leadsThisWeek ?? 0} this week`}
            icon={Users}
            iconColor="text-indigo-500"
            subtextColor={data?.performance.leadsThisWeek ? 'text-emerald-600' : 'text-gray-500'}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Clients"
            value={data?.summary.totalClients ?? 0}
            subtext={`${data?.performance.wonThisMonth ?? 0} won this month`}
            icon={Building2}
            iconColor="text-emerald-500"
            subtextColor={data?.performance.wonThisMonth ? 'text-emerald-600' : 'text-gray-500'}
            isLoading={isLoading}
          />
          <StatCard
            title="Pipeline Value"
            value={`$${(data?.summary.totalPipelineValue ?? 0).toLocaleString()}`}
            subtext="Active opportunities"
            icon={DollarSign}
            iconColor="text-blue-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Conversion Rate"
            value={`${data?.summary.conversionRate ?? 0}%`}
            subtext="Won / Total (excl. new)"
            icon={TrendingUp}
            iconColor="text-violet-500"
            subtextColor={(data?.summary.conversionRate ?? 0) >= 15 ? 'text-emerald-600' : 'text-gray-500'}
            isLoading={isLoading}
          />
          <StatCard
            title="Stale Leads"
            value={data?.summary.staleLeadsCount ?? 0}
            subtext="No contact 7+ days"
            icon={AlertTriangle}
            iconColor={(data?.summary.staleLeadsCount ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'}
            subtextColor={(data?.summary.staleLeadsCount ?? 0) > 5 ? 'text-amber-600' : 'text-gray-500'}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Two Column Layout */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Funnel Visualization */}
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}>
                <Sparkles className="text-violet-500" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                Sales Funnel
              </CardTitle>
              <CardDescription style={{ fontSize: TYPE.meta }}>
                Lead progression through pipeline stages
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <Skeleton style={{ width: 100, height: 16 }} />
                      <Skeleton className="flex-1" style={{ height: GRID.spacing.lg }} />
                      <Skeleton style={{ width: 48, height: 16 }} />
                    </div>
                  ))}
                </div>
              ) : data?.funnel ? (
                <FunnelVisualization funnel={data.funnel} />
              ) : null}
            </CardContent>
          </Card>

          {/* Stale Leads Alert */}
          <Card
            className={cn((data?.summary.staleLeadsCount ?? 0) > 5 && 'border-amber-200')}
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}
          >
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle
                    className="flex items-center"
                    style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}
                  >
                    <AlertTriangle
                      className="text-amber-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    Stale Leads
                    {(data?.summary.staleLeadsCount ?? 0) > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700"
                        style={{ borderRadius: RADIUS.pill, marginLeft: GRID.spacing.xs }}
                      >
                        {data?.summary.staleLeadsCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription style={{ fontSize: TYPE.meta }}>
                    Leads requiring immediate attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <Skeleton className="rounded-full" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} />
                      <div className="flex-1">
                        <Skeleton style={{ height: 16, width: 128, marginBottom: 4 }} />
                        <Skeleton style={{ height: 12, width: 192 }} />
                      </div>
                      <Skeleton style={{ width: 64, height: 24 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <StaleLeadAlerts leads={data?.staleLeads ?? []} onTouch={(id) => touchMutation.mutate(id)} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Effectiveness */}
        <motion.div variants={fadeInUp}>
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}>
                <Target className="text-indigo-500" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                Source Effectiveness
              </CardTitle>
              <CardDescription style={{ fontSize: TYPE.meta }}>
                Lead performance by acquisition channel
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <Skeleton style={{ height: 40, width: '100%' }} />
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} style={{ height: LAYOUT.rowHeight, width: '100%' }} />
                  ))}
                </div>
              ) : data?.sources && data.sources.length > 0 ? (
                <SourceEffectivenessTable sources={data.sources} />
              ) : (
                <div className="text-center text-gray-500" style={{ padding: GRID.spacing.lg }}>
                  <Target
                    className="mx-auto text-gray-400"
                    style={{ width: GRID.spacing.lg, height: GRID.spacing.lg, marginBottom: GRID.spacing.xs }}
                  />
                  <p style={{ fontSize: TYPE.body }}>No source data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Summary */}
        <motion.div variants={fadeInUp}>
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
            <CardHeader style={{ padding: GRID.spacing.md }}>
              <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}>
                <TrendingUp className="text-emerald-500" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                Monthly Performance
              </CardTitle>
              <CardDescription style={{ fontSize: TYPE.meta }}>Key metrics for the current month</CardDescription>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
                {[
                  {
                    value: data?.performance.leadsThisMonth ?? 0,
                    label: 'New Leads',
                    bg: COLORS.gray[50],
                    color: COLORS.gray[900],
                  },
                  {
                    value: data?.performance.wonThisMonth ?? 0,
                    label: 'Deals Won',
                    bg: COLORS.lounges.manager.light,
                    color: COLORS.lounges.manager.main,
                  },
                  {
                    value: `$${(data?.performance.revenueThisMonth ?? 0).toLocaleString()}`,
                    label: 'Revenue',
                    bg: COLORS.lounges.crm.light,
                    color: COLORS.lounges.crm.main,
                  },
                  {
                    value: `${
                      data?.performance.leadsThisMonth && data?.performance.wonThisMonth
                        ? ((data.performance.wonThisMonth / data.performance.leadsThisMonth) * 100).toFixed(1)
                        : 0
                    }%`,
                    label: 'Win Rate',
                    bg: COLORS.primary.violet[50],
                    color: COLORS.primary.violet[600],
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover }}
                    className="text-center"
                    style={{
                      padding: GRID.spacing.sm,
                      backgroundColor: item.bg,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <div className="font-bold" style={{ fontSize: TYPE.section, color: item.color }}>
                      {item.value}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </CRMLoungeLayout>
  );
}

export default CRMDashboard;
