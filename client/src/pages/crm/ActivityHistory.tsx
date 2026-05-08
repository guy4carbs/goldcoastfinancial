/**
 * Activity History
 * View all CRM activities across leads
 *
 * Uses Heritage Design System with INDIGO (CRM) theme
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
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
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS,
  fadeInUp, staggerContainer
} from '@/lib/heritageDesignSystem';
import { TOUR } from '@/lib/tour/selectors';

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

function ActivityTypeGradient(type: string): string {
  const gradients: Record<string, string> = {
    call: 'bg-gradient-to-br from-green-500 to-emerald-600',
    email: 'bg-gradient-to-br from-blue-500 to-blue-600',
    sms: 'bg-gradient-to-br from-purple-500 to-purple-600',
    meeting: 'bg-gradient-to-br from-amber-500 to-amber-600',
    note: 'bg-gradient-to-br from-gray-400 to-gray-500',
    stage_change: 'bg-gradient-to-br from-violet-500 to-violet-600',
    status_change: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    update: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  };
  return gradients[type] || 'bg-gradient-to-br from-gray-400 to-gray-500';
}

function SummaryCards({ summary }: { summary: ActivitySummary | undefined }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" style={{ borderRadius: RADIUS.card }} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: Activity,
      label: 'Total Activities',
      value: summary.summary.totalActivities,
      gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    },
    {
      icon: Users,
      label: 'Leads Touched',
      value: summary.summary.leadsTouched,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      icon: Phone,
      label: 'Calls Made',
      value: summary.byType.calls,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      icon: Mail,
      label: 'Emails Sent',
      value: summary.byType.emails,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          variants={fadeInUp}
          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
          transition={{ duration: MOTION.duration.hover }}
        >
          <Card
            className="border-0 overflow-hidden cursor-pointer"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  card.gradient
                )}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{card.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
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
          <Skeleton key={i} className="h-20" style={{ borderRadius: RADIUS.card }} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        className="text-center py-12 text-gray-500"
      >
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No activities found</p>
      </motion.div>
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
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {Object.entries(grouped).map(([date, dayActivities]) => (
        <motion.div key={date} variants={fadeInUp}>
          <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2 z-10">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="space-y-3">
            {dayActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                variants={fadeInUp}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover }}
              >
                <Card
                  className="border-0 overflow-hidden"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon with gradient */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                        ActivityTypeGradient(activity.type)
                      )}>
                        <ActivityIcon type={activity.type} className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{activity.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Lead info */}
                        <div
                          className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer mt-1 font-medium"
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
                            <Badge className="bg-indigo-600">{activity.newStatus}</Badge>
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
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
        <motion.div
          key={performer.id}
          className="flex items-center gap-3"
          whileHover={{ x: 4 }}
          transition={{ duration: MOTION.duration.hover }}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm",
            idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" :
            idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
            idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
            "bg-gray-100 text-gray-600"
          )}>
            {idx + 1}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-900">{performer.name}</div>
          </div>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{performer.count}</Badge>
        </motion.div>
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
        <motion.div
          key={day.date}
          className="flex-1 flex flex-col items-center gap-1"
          title={`${format(new Date(day.date), 'MMM d')}: ${day.count} activities`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: idx * 0.05, duration: MOTION.duration.normal }}
        >
          <div
            className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t hover:from-indigo-600 hover:to-violet-500 transition-colors origin-bottom"
            style={{ height: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%`, minHeight: day.count > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-gray-400">
            {format(new Date(day.date), 'd')}
          </span>
        </motion.div>
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
      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Header */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.HISTORY.HEADER}>
          <Card
            className="border-0 overflow-hidden"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 lg:p-8 relative">
              {/* Decorative blur element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Activity History</h1>
                  <p className="text-indigo-100 text-lg">Track all CRM activities across your leads</p>
                </div>
                <Select value={summaryDays.toString()} onValueChange={(v) => setSummaryDays(parseInt(v))}>
                  <SelectTrigger
                    className="w-36 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors"
                  >
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
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.HISTORY.SUMMARY}>
          <SummaryCards summary={summaryData} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Activity Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.HISTORY.FILTERS}>
              <Card
                className="border-0"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                      <SelectTrigger className="w-full sm:w-40">
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
                      <SelectTrigger className="w-full sm:w-44">
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
            </motion.div>

            {/* Activity Feed */}
            <div data-tour-id={TOUR.CRM.HISTORY.FEED}>
              <ActivityFeed
                activities={activitiesData?.activities || []}
                isLoading={activitiesLoading}
                onLeadClick={handleLeadClick}
              />
            </div>

            {/* Pagination */}
            {activitiesData && activitiesData.pagination.totalPages > 1 && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t"
              >
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, activitiesData.pagination.total)} of {activitiesData.pagination.total} activities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ borderRadius: RADIUS.button }}
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
                    style={{ borderRadius: RADIUS.button }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Trend */}
            <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.HISTORY.TREND_CHART}>
              <Card
                className="border-0"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Activity Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTrend trend={summaryData?.trend || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Breakdown */}
            <motion.div variants={fadeInUp}>
              <Card
                className="border-0"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">By Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {summaryData && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Phone className="w-3.5 h-3.5 text-white" />
                          </div>
                          Calls
                        </span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">{summaryData.byType.calls}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-white" />
                          </div>
                          Emails
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">{summaryData.byType.emails}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5 text-white" />
                          </div>
                          SMS
                        </span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">{summaryData.byType.sms}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                          </div>
                          Meetings
                        </span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">{summaryData.byType.meetings}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          Notes
                        </span>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">{summaryData.byType.notes}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                            <GitBranch className="w-3.5 h-3.5 text-white" />
                          </div>
                          Stage Changes
                        </span>
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700">{summaryData.byType.stageChanges}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Performers */}
            <motion.div variants={fadeInUp}>
              <Card
                className="border-0"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopPerformers performers={summaryData?.topPerformers || []} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </CRMLoungeLayout>
  );
}

export default ActivityHistory;
