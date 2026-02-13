/**
 * Activity History
 * View all CRM activities across leads
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
  GitBranch,
  Users,
  Activity,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

interface ActivityItem {
  id: string;
  leadId: string;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  title: string;
  description: string;
  oldStatus: string | null;
  newStatus: string | null;
  performedBy: string;
  performerName: string;
  createdAt: string;
}

interface ActivitySummary {
  period: string;
  summary: {
    totalActivities: number;
    leadsTouched: number;
    activeUsers: number;
  };
  byType: {
    calls: number;
    emails: number;
    sms: number;
    meetings: number;
    notes: number;
    stageChanges: number;
    statusChanges: number;
  };
  trend: Array<{ date: string; count: number }>;
  topPerformers: Array<{ id: string; name: string; count: number }>;
}

// =============================================================================
// API
// =============================================================================

async function fetchActivities(params: Record<string, string>): Promise<{
  activities: ActivityItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  facets: { types: Array<{ type: string; count: number }>; performers: Array<{ id: string; name: string; count: number }> };
}> {
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`/api/crm/activities?${queryString}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

async function fetchActivitySummary(days: number): Promise<ActivitySummary> {
  const res = await fetch(`/api/crm/activities/summary?days=${days}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ActivityIcon({ type, className }: { type: string; className?: string }) {
  const icons: Record<string, any> = {
    call: Phone,
    email: Mail,
    sms: MessageSquare,
    meeting: Calendar,
    note: FileText,
    stage_change: GitBranch,
    status_change: ArrowRight,
    update: RefreshCw,
    contact: Phone,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={className} />;
}

function ActivityTypeColor(type: string): string {
  const colors: Record<string, string> = {
    call: 'bg-green-100 text-green-600',
    email: 'bg-blue-100 text-blue-600',
    sms: 'bg-purple-100 text-purple-600',
    meeting: 'bg-amber-100 text-amber-600',
    note: 'bg-gray-100 text-gray-600',
    stage_change: 'bg-violet-100 text-violet-600',
    status_change: 'bg-indigo-100 text-indigo-600',
    update: 'bg-cyan-100 text-cyan-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

function SummaryCards({ summary }: { summary: ActivitySummary | undefined }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-violet-600" />
            <div>
              <div className="text-sm text-gray-500">Total Activities</div>
              <div className="text-2xl font-bold">{summary.summary.totalActivities}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Leads Touched</div>
              <div className="text-2xl font-bold">{summary.summary.leadsTouched}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-500">Calls Made</div>
              <div className="text-2xl font-bold">{summary.byType.calls}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Emails Sent</div>
              <div className="text-2xl font-bold">{summary.byType.emails}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeed({
  activities,
  isLoading,
  onLeadClick,
}: {
  activities: ActivityItem[];
  isLoading: boolean;
  onLeadClick: (leadId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No activities found</p>
      </div>
    );
  }

  // Group by date
  const grouped = activities.reduce((acc, activity) => {
    const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white py-2">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="space-y-3">
            {dayActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      ActivityTypeColor(activity.type)
                    )}>
                      <ActivityIcon type={activity.type} className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Lead info */}
                      <div
                        className="text-sm text-violet-600 hover:underline cursor-pointer mt-1"
                        onClick={() => onLeadClick(activity.leadId)}
                      >
                        {activity.lead.firstName} {activity.lead.lastName} ({activity.lead.email})
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      {/* Stage/Status change */}
                      {activity.oldStatus && activity.newStatus && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Badge variant="outline">{activity.oldStatus}</Badge>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <Badge variant="default">{activity.newStatus}</Badge>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(activity.createdAt), 'h:mm a')}
                        </span>
                        <span>by {activity.performerName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopPerformers({ performers }: { performers: Array<{ id: string; name: string; count: number }> }) {
  if (performers.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {performers.map((performer, idx) => (
        <div key={performer.id} className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            idx === 0 ? "bg-amber-100 text-amber-700" :
            idx === 1 ? "bg-gray-100 text-gray-700" :
            idx === 2 ? "bg-orange-100 text-orange-700" :
            "bg-gray-50 text-gray-600"
          )}>
            {idx + 1}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{performer.name}</div>
          </div>
          <Badge variant="secondary">{performer.count}</Badge>
        </div>
      ))}
    </div>
  );
}

function ActivityTrend({ trend }: { trend: Array<{ date: string; count: number }> }) {
  if (trend.length === 0) return null;

  const maxCount = Math.max(...trend.map(t => t.count));

  return (
    <div className="flex items-end gap-1 h-24">
      {trend.map((day, idx) => (
        <div
          key={day.date}
          className="flex-1 flex flex-col items-center gap-1"
          title={`${format(new Date(day.date), 'MMM d')}: ${day.count} activities`}
        >
          <div
            className="w-full bg-violet-200 rounded-t hover:bg-violet-300 transition-colors"
            style={{ height: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%`, minHeight: day.count > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-gray-400">
            {format(new Date(day.date), 'd')}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function ActivityHistory() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [performedBy, setPerformedBy] = useState('all');
  const [page, setPage] = useState(1);
  const [summaryDays, setSummaryDays] = useState(7);

  // Fetch activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['crm', 'activities', { search, type, performedBy, page }],
    queryFn: () => fetchActivities({
      search,
      type: type !== 'all' ? type : '',
      performedBy: performedBy !== 'all' ? performedBy : '',
      page: page.toString(),
      limit: '50',
    }),
  });

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ['crm', 'activities-summary', summaryDays],
    queryFn: () => fetchActivitySummary(summaryDays),
  });

  const handleLeadClick = (leadId: string) => {
    navigate(`/crm/leads/${leadId}`);
  };

  return (
    <CRMLoungeLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Activity History</h1>
            <p className="text-gray-500">Track all CRM activities across your leads</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={summaryDays.toString()} onValueChange={(v) => setSummaryDays(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={summaryData} />

        <div className="grid grid-cols-4 gap-6">
          {/* Main Activity Feed */}
          <div className="col-span-3 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search activities..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {activitiesData?.facets.types.map((t) => (
                        <SelectItem key={t.type} value={t.type}>
                          {t.type.replace('_', ' ')} ({t.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={performedBy} onValueChange={(v) => { setPerformedBy(v); setPage(1); }}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Performed By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {activitiesData?.facets.performers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed
              activities={activitiesData?.activities || []}
              isLoading={activitiesLoading}
              onLeadClick={handleLeadClick}
            />

            {/* Pagination */}
            {activitiesData && activitiesData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, activitiesData.pagination.total)} of {activitiesData.pagination.total} activities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm px-2">
                    Page {page} of {activitiesData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(activitiesData.pagination.totalPages, p + 1))}
                    disabled={page === activitiesData.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  Activity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTrend trend={summaryData?.trend || []} />
              </CardContent>
            </Card>

            {/* Activity Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summaryData && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        Calls
                      </span>
                      <Badge variant="secondary">{summaryData.byType.calls}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Emails
                      </span>
                      <Badge variant="secondary">{summaryData.byType.emails}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        SMS
                      </span>
                      <Badge variant="secondary">{summaryData.byType.sms}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        Meetings
                      </span>
                      <Badge variant="secondary">{summaryData.byType.meetings}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        Notes
                      </span>
                      <Badge variant="secondary">{summaryData.byType.notes}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-violet-600" />
                        Stage Changes
                      </span>
                      <Badge variant="secondary">{summaryData.byType.stageChanges}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopPerformers performers={summaryData?.topPerformers || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CRMLoungeLayout>
  );
}

export default ActivityHistory;
