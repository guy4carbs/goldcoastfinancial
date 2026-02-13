/**
 * CRM Dashboard
 * Real-time pipeline analytics, source effectiveness, and lead management
 */

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
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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
    new: 'bg-blue-500',
    contacted: 'bg-cyan-500',
    quoted: 'bg-violet-500',
    follow_up: 'bg-amber-500',
    won: 'bg-emerald-500',
  };

  // Calculate max for relative width
  const maxCount = Math.max(...funnel.map(s => s.count), 1);

  return (
    <div className="space-y-3">
      {funnel.map((stage, idx) => (
        <div key={stage.stage} className="flex items-center gap-4">
          <div className="w-24 text-sm text-gray-600 font-medium">
            {stageLabels[stage.stage] || stage.stage}
          </div>
          <div className="flex-1 relative">
            <div
              className={cn(
                'h-8 rounded-md transition-all duration-500',
                stageColors[stage.stage] || 'bg-gray-400'
              )}
              style={{ width: `${Math.max((stage.count / maxCount) * 100, 5)}%` }}
            />
            <div className="absolute inset-y-0 left-2 flex items-center">
              <span className="text-white font-semibold text-sm drop-shadow">
                {stage.count}
              </span>
            </div>
          </div>
          <div className="w-20 text-right">
            {idx > 0 && (
              <span className="text-xs text-gray-500">
                {stage.conversionFromPrevious}%
              </span>
            )}
          </div>
        </div>
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-500">Source</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Volume</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Won</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Conv. Rate</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Avg Value</th>
            <th className="text-right py-3 px-2 font-medium text-gray-500">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.source} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-2 font-medium text-gray-900">
                {sourceLabels[source.source] || source.source}
              </td>
              <td className="py-3 px-2 text-right text-gray-600">
                {source.totalLeads}
              </td>
              <td className="py-3 px-2 text-right text-gray-600">
                {source.wonLeads}
              </td>
              <td className="py-3 px-2 text-right">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    source.conversionRate >= 20 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                    source.conversionRate >= 10 ? 'text-amber-600 border-amber-200 bg-amber-50' :
                    'text-gray-600 border-gray-200'
                  )}
                >
                  {source.conversionRate}%
                </Badge>
              </td>
              <td className="py-3 px-2 text-right text-gray-600">
                ${source.avgValue.toLocaleString()}
              </td>
              <td className="py-3 px-2 text-right font-medium text-gray-900">
                ${source.totalWonValue.toLocaleString()}
              </td>
            </tr>
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
  onTouch
}: {
  leads: DashboardData['staleLeads'];
  onTouch: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No stale leads - great job staying on top of follow-ups!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {leads.slice(0, 5).map((lead) => (
        <div key={lead.id} className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {lead.firstName} {lead.lastName}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
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
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 mb-1">
              {lead.daysSinceActivity} days
            </Badge>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => window.location.href = `tel:${lead.phone}`}
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => window.location.href = `mailto:${lead.email}`}
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTouch(lead.id)}
              className="text-xs"
            >
              Mark Contacted
            </Button>
          </div>
        </div>
      ))}
      {leads.length > 5 && (
        <div className="pt-3 text-center">
          <Button variant="ghost" size="sm" className="text-indigo-600">
            View all {leads.length} stale leads
            <ChevronRight className="w-4 h-4 ml-1" />
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
  isLoading = false
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  subtextColor?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className={cn('text-xs', subtextColor)}>{subtext}</p>
          </>
        )}
      </CardContent>
    </Card>
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
    refetchInterval: 60000, // Refresh every minute
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-500 mt-1">Pipeline analytics and lead management</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600 text-sm">Failed to load dashboard data. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            subtextColor={
              (data?.summary.conversionRate ?? 0) >= 15 ? 'text-emerald-600' : 'text-gray-500'
            }
            isLoading={isLoading}
          />

          <StatCard
            title="Stale Leads"
            value={data?.summary.staleLeadsCount ?? 0}
            subtext="No contact 7+ days"
            icon={AlertTriangle}
            iconColor={(data?.summary.staleLeadsCount ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'}
            subtextColor={
              (data?.summary.staleLeadsCount ?? 0) > 5 ? 'text-amber-600' : 'text-gray-500'
            }
            isLoading={isLoading}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>Lead progression through pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="flex-1 h-8" />
                      <Skeleton className="w-12 h-4" />
                    </div>
                  ))}
                </div>
              ) : data?.funnel ? (
                <FunnelVisualization funnel={data.funnel} />
              ) : null}
            </CardContent>
          </Card>

          {/* Stale Leads Alert */}
          <Card className={cn(
            (data?.summary.staleLeadsCount ?? 0) > 5 && 'border-amber-200'
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Stale Leads
                    {(data?.summary.staleLeadsCount ?? 0) > 0 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        {data?.summary.staleLeadsCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Leads requiring immediate attention</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="w-16 h-6" />
                    </div>
                  ))}
                </div>
              ) : (
                <StaleLeadAlerts
                  leads={data?.staleLeads ?? []}
                  onTouch={(id) => touchMutation.mutate(id)}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Source Effectiveness</CardTitle>
            <CardDescription>Lead performance by acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.sources && data.sources.length > 0 ? (
              <SourceEffectivenessTable sources={data.sources} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No source data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Key metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {data?.performance.leadsThisMonth ?? 0}
                </div>
                <div className="text-sm text-gray-500">New Leads</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {data?.performance.wonThisMonth ?? 0}
                </div>
                <div className="text-sm text-gray-500">Deals Won</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${(data?.performance.revenueThisMonth ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Revenue</div>
              </div>
              <div className="text-center p-4 bg-violet-50 rounded-lg">
                <div className="text-2xl font-bold text-violet-600">
                  {data?.performance.leadsThisMonth && data?.performance.wonThisMonth
                    ? ((data.performance.wonThisMonth / data.performance.leadsThisMonth) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLoungeLayout>
  );
}

export default CRMDashboard;
