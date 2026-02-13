/**
 * Pipeline Board (Kanban)
 * Visual pipeline management with drag-and-drop functionality
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Kanban,
  Table,
  Filter,
  Search,
  Phone,
  Mail,
  MoreHorizontal,
  ArrowRight,
  Clock,
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  GripVertical,
  ChevronRight,
  ExternalLink,
  RefreshCcw,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  pipelineStage: string;
  leadScore: number;
  scoreTier: string;
  estimatedValue: number;
  closeProbability: number;
  expectedCloseDate: string | null;
  source: string;
  coverageType: string;
  assignedTo: string | null;
  assignedAgent: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  nextFollowUp: string | null;
  lastContactedAt: string | null;
  lastActivityAt: string | null;
  lastActivityType: string | null;
  activityCount: number;
  daysInStage: number;
  createdAt: string;
  updatedAt: string;
}

interface PipelineStage {
  id: string;
  label: string;
  probability: number;
  leads: Lead[];
  count: number;
  value: number;
  weightedValue: number;
}

interface PipelineData {
  stages: PipelineStage[];
  summary: {
    totalLeads: number;
    totalValue: number;
    totalWeightedValue: number;
    avgDealSize: number;
  };
}

interface ForecastData {
  pipeline: {
    totalValue: number;
    weightedValue: number;
    totalDeals: number;
    avgDealSize: number;
    byStage: Array<{
      stage: string;
      count: number;
      totalValue: number;
      avgProbability: number;
      weightedValue: number;
    }>;
  };
  forecast: {
    thisWeek: { expectedDeals: number; expectedValue: number };
    thisMonth: { expectedDeals: number; expectedValue: number };
    nextMonth: { expectedDeals: number; expectedValue: number };
  };
  actuals: {
    wonThisMonth: { deals: number; value: number };
    lostThisMonth: { deals: number; value: number };
  };
  metrics: {
    winRate: number;
    avgTimeToClose: number;
  };
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchPipeline(assignedTo?: string): Promise<PipelineData> {
  const params = new URLSearchParams();
  if (assignedTo && assignedTo !== 'all') {
    params.set('assignedTo', assignedTo);
  }
  params.set('includeClosedStages', 'false');

  const res = await fetch(`/api/crm/pipeline?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch pipeline');
  return res.json();
}

async function fetchForecast(): Promise<ForecastData> {
  const res = await fetch('/api/crm/pipeline/forecast', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

async function updateLeadStage(leadId: string, newStage: string, note?: string) {
  const res = await fetch(`/api/crm/pipeline/${leadId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newStage, note }),
  });
  if (!res.ok) throw new Error('Failed to update lead stage');
  return res.json();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreBadgeColor(scoreTier: string): string {
  switch (scoreTier) {
    case 'on_fire':
      return 'bg-red-500 text-white';
    case 'hot':
      return 'bg-orange-500 text-white';
    case 'warm':
      return 'bg-yellow-500 text-black';
    case 'cold':
    default:
      return 'bg-blue-500 text-white';
  }
}

function getScoreIcon(scoreTier: string) {
  switch (scoreTier) {
    case 'on_fire':
      return <Flame className="w-3 h-3" />;
    case 'hot':
      return <ThermometerSun className="w-3 h-3" />;
    case 'warm':
      return <TrendingUp className="w-3 h-3" />;
    case 'cold':
    default:
      return <Snowflake className="w-3 h-3" />;
  }
}

function getStageColor(stageId: string): string {
  const colors: Record<string, string> = {
    new: 'bg-slate-100 border-slate-300',
    contacted: 'bg-blue-50 border-blue-300',
    qualified: 'bg-cyan-50 border-cyan-300',
    appointment_set: 'bg-indigo-50 border-indigo-300',
    quoted: 'bg-violet-50 border-violet-300',
    application: 'bg-purple-50 border-purple-300',
    underwriting: 'bg-pink-50 border-pink-300',
    issued: 'bg-emerald-50 border-emerald-300',
    placed: 'bg-green-100 border-green-400',
    lost: 'bg-red-50 border-red-300',
  };
  return colors[stageId] || colors.new;
}

function getStageHeaderColor(stageId: string): string {
  const colors: Record<string, string> = {
    new: 'text-slate-700',
    contacted: 'text-blue-700',
    qualified: 'text-cyan-700',
    appointment_set: 'text-indigo-700',
    quoted: 'text-violet-700',
    application: 'text-purple-700',
    underwriting: 'text-pink-700',
    issued: 'text-emerald-700',
    placed: 'text-green-700',
    lost: 'text-red-700',
  };
  return colors[stageId] || colors.new;
}

// =============================================================================
// PIPELINE CARD COMPONENT
// =============================================================================

interface PipelineCardProps {
  lead: Lead;
  isDragging?: boolean;
  onQuickAction?: (action: string, lead: Lead) => void;
  onClick?: () => void;
}

function PipelineCard({ lead, isDragging, onQuickAction, onClick }: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-indigo-500',
        isSortableDragging && 'opacity-50'
      )}
      onClick={onClick}
    >
      {/* Drag Handle + Header */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {lead.firstName} {lead.lastName}
            </h4>
            <Badge className={cn('text-[10px] px-1.5 py-0 flex items-center gap-1', getScoreBadgeColor(lead.scoreTier))}>
              {getScoreIcon(lead.scoreTier)}
              {lead.leadScore}
            </Badge>
          </div>

          {/* Coverage & Value */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {lead.coverageType && (
              <span className="capitalize">{lead.coverageType.replace('_', ' ')}</span>
            )}
            {lead.estimatedValue > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(lead.estimatedValue)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Days in stage indicator */}
          <Tooltip>
            <TooltipTrigger>
              <div className={cn(
                'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
                lead.daysInStage > 14 ? 'bg-red-100 text-red-700' :
                lead.daysInStage > 7 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              )}>
                <Clock className="w-3 h-3" />
                {lead.daysInStage}d
              </div>
            </TooltipTrigger>
            <TooltipContent>Days in current stage</TooltipContent>
          </Tooltip>

          {/* Assigned agent avatar */}
          {lead.assignedAgent ? (
            <Tooltip>
              <TooltipTrigger>
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-medium">
                  {lead.assignedAgent.name.charAt(0)}
                </div>
              </TooltipTrigger>
              <TooltipContent>{lead.assignedAgent.name}</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Unassigned</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction?.('call', lead);
                }}
              >
                <Phone className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Call</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction?.('email', lead);
                }}
              >
                <Mail className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Email</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onQuickAction?.('view', lead)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onQuickAction?.('won', lead)}>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                Mark as Won
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction?.('lost', lead)}>
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                Mark as Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PIPELINE COLUMN COMPONENT
// =============================================================================

interface PipelineColumnProps {
  stage: PipelineStage;
  onQuickAction: (action: string, lead: Lead) => void;
  onLeadClick: (lead: Lead) => void;
}

function PipelineColumn({ stage, onQuickAction, onLeadClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] rounded-lg border-2 transition-colors',
        getStageColor(stage.id),
        isOver && 'ring-2 ring-indigo-500 border-indigo-400'
      )}
    >
      {/* Column Header */}
      <div className={cn('px-3 py-2 border-b', getStageColor(stage.id))}>
        <div className="flex items-center justify-between">
          <h3 className={cn('font-semibold text-sm', getStageHeaderColor(stage.id))}>
            {stage.label}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {stage.count}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{formatCurrency(stage.value)}</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-600">{formatCurrency(stage.weightedValue)} weighted</span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[100px]"
      >
        <SortableContext
          items={stage.leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {stage.leads.map((lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              onQuickAction={onQuickAction}
              onClick={() => onLeadClick(lead)}
            />
          ))}
        </SortableContext>

        {stage.leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-sm text-gray-400 border-2 border-dashed rounded-lg">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PIPELINE SUMMARY BAR COMPONENT
// =============================================================================

interface PipelineSummaryBarProps {
  data: PipelineData | undefined;
  forecast: ForecastData | undefined;
  isLoading: boolean;
}

function PipelineSummaryBar({ data, forecast, isLoading }: PipelineSummaryBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Pipeline',
      value: formatCurrency(data?.summary.totalValue || 0),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      label: 'Weighted Value',
      value: formatCurrency(data?.summary.totalWeightedValue || 0),
      icon: Target,
      color: 'text-indigo-600',
    },
    {
      label: 'Active Deals',
      value: data?.summary.totalLeads || 0,
      icon: Kanban,
      color: 'text-blue-600',
    },
    {
      label: 'Avg Deal Size',
      value: formatCurrency(data?.summary.avgDealSize || 0),
      icon: TrendingUp,
      color: 'text-violet-600',
    },
    {
      label: 'Expected This Month',
      value: formatCurrency(forecast?.forecast.thisMonth.expectedValue || 0),
      subValue: `${forecast?.forecast.thisMonth.expectedDeals || 0} deals`,
      icon: Calendar,
      color: 'text-amber-600',
    },
    {
      label: 'Win Rate',
      value: `${forecast?.metrics.winRate || 0}%`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className={cn('text-xl font-bold mt-1', stat.color)}>{stat.value}</p>
            {stat.subValue && (
              <p className="text-xs text-gray-400">{stat.subValue}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// PIPELINE FILTERS COMPONENT
// =============================================================================

interface PipelineFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  assignedTo: string;
  onAssignedToChange: (value: string) => void;
  view: 'kanban' | 'table';
  onViewChange: (view: 'kanban' | 'table') => void;
  onRefresh: () => void;
}

function PipelineFilters({
  search,
  onSearchChange,
  assignedTo,
  onAssignedToChange,
  view,
  onViewChange,
  onRefresh,
}: PipelineFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Assigned To Filter */}
      <Select value={assignedTo} onValueChange={onAssignedToChange}>
        <SelectTrigger className="w-[180px]">
          <User className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Assigned to" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Agents</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {/* Would populate from agents list */}
        </SelectContent>
      </Select>

      {/* View Toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <Button
          variant={view === 'kanban' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('kanban')}
          className={cn(view === 'kanban' && 'shadow-sm')}
        >
          <Kanban className="w-4 h-4 mr-1" />
          Kanban
        </Button>
        <Button
          variant={view === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('table')}
          className={cn(view === 'table' && 'shadow-sm')}
        >
          <Table className="w-4 h-4 mr-1" />
          Table
        </Button>
      </div>

      {/* Refresh */}
      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}

// =============================================================================
// TABLE VIEW COMPONENT
// =============================================================================

interface TableViewProps {
  data: PipelineData | undefined;
  onLeadClick: (lead: Lead) => void;
  onQuickAction: (action: string, lead: Lead) => void;
  search: string;
}

function TableView({ data, onLeadClick, onQuickAction, search }: TableViewProps) {
  // Flatten all leads from all stages
  const allLeads = useMemo(() => {
    if (!data) return [];
    return data.stages.flatMap((stage) =>
      stage.leads.map((lead) => ({ ...lead, stageLabel: stage.label }))
    );
  }, [data]);

  // Filter by search
  const filteredLeads = useMemo(() => {
    if (!search) return allLeads;
    const searchLower = search.toLowerCase();
    return allLeads.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower)
    );
  }, [allLeads, search]);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredLeads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onLeadClick(lead)}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="capitalize">
                  {lead.stageLabel}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge className={cn('text-xs', getScoreBadgeColor(lead.scoreTier))}>
                  {lead.leadScore}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-green-600">
                {formatCurrency(lead.estimatedValue)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                {lead.source?.replace('_', ' ')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {lead.assignedAgent?.name || 'Unassigned'}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-sm',
                  lead.daysInStage > 14 ? 'text-red-600 font-medium' :
                  lead.daysInStage > 7 ? 'text-amber-600' : 'text-gray-500'
                )}>
                  {lead.daysInStage}d
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction('call', lead);
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction('email', lead);
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLeads.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No leads found
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PipelineBoard() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [assignedTo, setAssignedTo] = useState('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch pipeline data
  const { data: pipelineData, isLoading: pipelineLoading, refetch } = useQuery({
    queryKey: ['crm-pipeline', assignedTo],
    queryFn: () => fetchPipeline(assignedTo),
  });

  // Fetch forecast data
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['crm-pipeline-forecast'],
    queryFn: fetchForecast,
  });

  // Stage update mutation
  const stageMutation = useMutation({
    mutationFn: ({ leadId, newStage, note }: { leadId: string; newStage: string; note?: string }) =>
      updateLeadStage(leadId, newStage, note),
    onSuccess: (data) => {
      toast.success(`Lead moved to ${data.transition.to}`);
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-forecast'] });
    },
    onError: () => {
      toast.error('Failed to move lead');
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find active lead for drag overlay
  const activeLead = useMemo(() => {
    if (!activeId || !pipelineData) return null;
    for (const stage of pipelineData.stages) {
      const lead = stage.leads.find((l) => l.id === activeId);
      if (lead) return lead;
    }
    return null;
  }, [activeId, pipelineData]);

  // Filter stages by search
  const filteredStages = useMemo(() => {
    if (!pipelineData) return [];
    if (!search) return pipelineData.stages;

    const searchLower = search.toLowerCase();
    return pipelineData.stages.map((stage) => ({
      ...stage,
      leads: stage.leads.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(searchLower) ||
          lead.lastName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower)
      ),
    }));
  }, [pipelineData, search]);

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Could add preview logic here
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const leadId = active.id as string;
      const newStage = over.id as string;

      // Find current stage
      if (!pipelineData) return;
      let currentStage = '';
      for (const stage of pipelineData.stages) {
        if (stage.leads.find((l) => l.id === leadId)) {
          currentStage = stage.id;
          break;
        }
      }

      // If dropped on same stage, do nothing
      if (currentStage === newStage) return;

      // Update stage via API
      stageMutation.mutate({ leadId, newStage });
    },
    [pipelineData, stageMutation]
  );

  // Quick actions handler
  const handleQuickAction = useCallback((action: string, lead: Lead) => {
    switch (action) {
      case 'call':
        if (lead.phone) {
          window.open(`tel:${lead.phone}`, '_self');
        } else {
          toast.error('No phone number available');
        }
        break;
      case 'email':
        window.open(`mailto:${lead.email}`, '_blank');
        break;
      case 'view':
        setSelectedLead(lead);
        break;
      case 'won':
        stageMutation.mutate({ leadId: lead.id, newStage: 'placed', note: 'Marked as won' });
        break;
      case 'lost':
        stageMutation.mutate({ leadId: lead.id, newStage: 'lost', note: 'Marked as lost' });
        break;
    }
  }, [stageMutation]);

  return (
    <CRMLoungeLayout
      breadcrumbs={[
        { label: 'CRM', href: '/crm/dashboard' },
        { label: 'Pipeline' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Board</h1>
          <p className="text-gray-500 mt-1">
            Manage your sales pipeline with drag-and-drop simplicity
          </p>
        </div>

        {/* Summary Bar */}
        <PipelineSummaryBar
          data={pipelineData}
          forecast={forecastData}
          isLoading={pipelineLoading || forecastLoading}
        />

        {/* Filters */}
        <PipelineFilters
          search={search}
          onSearchChange={setSearch}
          assignedTo={assignedTo}
          onAssignedToChange={setAssignedTo}
          view={view}
          onViewChange={setView}
          onRefresh={() => refetch()}
        />

        {/* Main Content */}
        {pipelineLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="min-w-[280px] h-[400px] rounded-lg" />
            ))}
          </div>
        ) : view === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {filteredStages
                .filter((s) => !['placed', 'lost'].includes(s.id))
                .map((stage) => (
                  <PipelineColumn
                    key={stage.id}
                    stage={stage}
                    onQuickAction={handleQuickAction}
                    onLeadClick={(lead) => setSelectedLead(lead)}
                  />
                ))}
            </div>

            <DragOverlay>
              {activeLead && (
                <PipelineCard lead={activeLead} isDragging />
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <TableView
            data={pipelineData}
            onLeadClick={(lead) => setSelectedLead(lead)}
            onQuickAction={handleQuickAction}
            search={search}
          />
        )}

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {selectedLead.firstName} {selectedLead.lastName}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedLead.email} | {selectedLead.phone || 'No phone'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Estimated Value</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedLead.estimatedValue)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Lead Score</p>
                      <p className="text-lg font-bold text-indigo-600">{selectedLead.leadScore}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Close Probability</p>
                      <p className="text-lg font-bold text-violet-600">{selectedLead.closeProbability}%</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Pipeline Stage</p>
                      <p className="font-medium capitalize">{selectedLead.pipelineStage?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Source</p>
                      <p className="font-medium capitalize">{selectedLead.source?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Coverage Type</p>
                      <p className="font-medium capitalize">{selectedLead.coverageType?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned To</p>
                      <p className="font-medium">{selectedLead.assignedAgent?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days in Stage</p>
                      <p className="font-medium">{selectedLead.daysInStage} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Activities</p>
                      <p className="font-medium">{selectedLead.activityCount} logged</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        window.location.href = `/crm/contacts?id=${selectedLead.id}`;
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Details
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickAction('call', selectedLead)}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickAction('email', selectedLead)}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CRMLoungeLayout>
  );
}

export default PipelineBoard;
