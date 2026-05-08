/**
 * Lead Profile (Full 360° View)
 * Comprehensive lead detail page with timeline, enrichment, and actions
 * Updated with Heritage Design System
 */

import { useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from '@/lib/tour/selectors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Send,
  Edit,
  MoreHorizontal,
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  User,
  Target,
  TrendingUp,
  Flame,
  ThermometerSun,
  Snowflake,
  Sparkles,
  History,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ExternalLink,
  Copy,
  Briefcase,
  DollarSign,
  Tag,
  RefreshCcw,
  UserPlus,
  PhoneOff,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface LeadAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: string;
  source: string;
  sourceId: string | null;
  priority: string;
  coverageType: string | null;
  coverageAmount: string | null;
  estimatedValue: number;
  pipelineStage: string;
  leadScore: number;
  scoreTier: string;
  closeProbability: number;
  expectedCloseDate: string | null;
  assignedTo: string | null;
  assignedAgent: LeadAgent | null;
  nextFollowUp: string | null;
  lastContactedAt: string | null;
  contactCount: number;
  lostReason: string | null;
  wonAmount: number | null;
  wonDate: string | null;
  notes: string | null;
  tags: string[];
  enrichmentData: any;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  oldStatus: string | null;
  newStatus: string | null;
  performedBy: string | null;
  performerName: string | null;
  createdAt: string;
}

interface RelatedContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  pipelineStage: string;
  estimatedValue: number;
}

interface LeadProfileData {
  lead: Lead;
  activities: Activity[];
  communicationSummary: Record<string, { count: number; lastAt: string }>;
  relatedContacts: RelatedContact[];
  relatedEntities: {
    quotes: any[];
    appointments: any[];
    applications: any[];
    policies: any[];
  };
  aiRecommendations: {
    available: boolean;
    message: string;
    suggestions: string[];
  };
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchLeadProfile(id: string): Promise<LeadProfileData> {
  const res = await fetch(`/api/crm/leads/${id}/full`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch lead profile');
  return res.json();
}

async function addNote(leadId: string, content: string) {
  const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

async function logActivity(leadId: string, data: { type: string; title: string; description?: string }) {
  const res = await fetch(`/api/crm/leads/${leadId}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to log activity');
  return res.json();
}

async function updateLead(leadId: string, updates: Partial<Lead>) {
  const res = await fetch(`/api/crm/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreBadgeColor(scoreTier: string): string {
  switch (scoreTier) {
    case 'on_fire': return 'bg-red-500 text-white';
    case 'hot': return 'bg-orange-500 text-white';
    case 'warm': return 'bg-yellow-500 text-black';
    case 'cold':
    default: return 'bg-blue-500 text-white';
  }
}

function getScoreIcon(scoreTier: string) {
  switch (scoreTier) {
    case 'on_fire': return <Flame className="w-4 h-4" />;
    case 'hot': return <ThermometerSun className="w-4 h-4" />;
    case 'warm': return <TrendingUp className="w-4 h-4" />;
    case 'cold':
    default: return <Snowflake className="w-4 h-4" />;
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-cyan-100 text-cyan-700',
    quoted: 'bg-violet-100 text-violet-700',
    follow_up: 'bg-amber-100 text-amber-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function getActivityIcon(type: string) {
  const icons: Record<string, any> = {
    call: Phone,
    email: Mail,
    sms: MessageSquare,
    meeting: Calendar,
    note: FileText,
    status_change: RefreshCcw,
    stage_change: TrendingUp,
    update: Edit,
    quote: DollarSign,
    application: Briefcase,
    policy: CheckCircle2,
    merge: UserPlus,
  };
  const Icon = icons[type] || History;
  return <Icon className="w-4 h-4" />;
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    call: 'bg-green-100 text-green-600',
    email: 'bg-blue-100 text-blue-600',
    sms: 'bg-purple-100 text-purple-600',
    meeting: 'bg-amber-100 text-amber-600',
    note: 'bg-gray-100 text-gray-600',
    status_change: 'bg-indigo-100 text-indigo-600',
    stage_change: 'bg-violet-100 text-violet-600',
    update: 'bg-cyan-100 text-cyan-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// =============================================================================
// ACTIVITY TIMELINE COMPONENT
// =============================================================================

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4 pl-2">
            {/* Icon */}
            <div className={cn(
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
              getActivityColor(activity.type)
            )}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                  )}
                  {activity.oldStatus && activity.newStatus && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.oldStatus} → {activity.newStatus}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
              {activity.performerName && (
                <p className="text-xs text-gray-400 mt-1">by {activity.performerName}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// LEAD ACTION BAR COMPONENT
// =============================================================================

interface LeadActionBarProps {
  lead: Lead;
  onAction: (action: string) => void;
  onStatusChange: (status: string) => void;
}

function LeadActionBar({ lead, onAction, onStatusChange }: LeadActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 p-4 z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={() => onAction('call')} className="bg-green-600 hover:bg-green-700">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" onClick={() => onAction('email')}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={() => onAction('sms')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button variant="outline" onClick={() => onAction('schedule')}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onAction('quote')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Create Quote
          </Button>

          {/* Status Dropdown */}
          <Select
            value={lead.status}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('transfer')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Transfer Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('edit')}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('copy')}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Contact Info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENRICHMENT DATA CARD COMPONENT
// =============================================================================

interface EnrichmentDataCardProps {
  data: any;
}

function EnrichmentDataCard({ data }: EnrichmentDataCardProps) {
  if (!data) {
    return (
      <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Enrichment Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No enrichment data available
          </p>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Sparkles className="w-4 h-4 mr-2" />
            Enrich Lead (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Enrichment Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {data.company && (
          <div>
            <p className="text-gray-500">Company</p>
            <p className="font-medium">{data.company}</p>
          </div>
        )}
        {data.title && (
          <div>
            <p className="text-gray-500">Job Title</p>
            <p className="font-medium">{data.title}</p>
          </div>
        )}
        {data.linkedin && (
          <div>
            <p className="text-gray-500">LinkedIn</p>
            <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              View Profile
            </a>
          </div>
        )}
        {data.estimatedIncome && (
          <div>
            <p className="text-gray-500">Est. Income</p>
            <p className="font-medium">{formatCurrency(data.estimatedIncome)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// AI RECOMMENDATION CARD COMPONENT (Placeholder)
// =============================================================================

function AiRecommendationCard() {
  return (
    <Card
      className="border-dashed border-indigo-200 bg-indigo-50/30"
      style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-700">
          <Sparkles className="w-4 h-4" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
          <p className="text-sm text-indigo-600 font-medium">Coming in Phase 6</p>
          <p className="text-xs text-indigo-500 mt-1">
            AI-powered next best actions, talking points, and objection handling
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LeadProfile() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const leadId = params.id;

  // State
  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState('call');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

  // Fetch lead profile
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lead-profile', leadId],
    queryFn: () => fetchLeadProfile(leadId!),
    enabled: !!leadId,
  });

  // Mutations
  const noteMutation = useMutation({
    mutationFn: (content: string) => addNote(leadId!, content),
    onSuccess: () => {
      toast.success('Note added');
      setNoteContent('');
      setIsAddingNote(false);
      queryClient.invalidateQueries({ queryKey: ['lead-profile', leadId] });
    },
    onError: () => toast.error('Failed to add note'),
  });

  const activityMutation = useMutation({
    mutationFn: (data: { type: string; title: string; description?: string }) =>
      logActivity(leadId!, data),
    onSuccess: () => {
      toast.success('Activity logged');
      setActivityDialogOpen(false);
      setActivityTitle('');
      setActivityDescription('');
      queryClient.invalidateQueries({ queryKey: ['lead-profile', leadId] });
    },
    onError: () => toast.error('Failed to log activity'),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Lead>) => updateLead(leadId!, updates),
    onSuccess: () => {
      toast.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['lead-profile', leadId] });
    },
    onError: () => toast.error('Failed to update lead'),
  });

  // DNC check
  const phone = data?.lead?.phone;
  const { data: dncData } = useQuery({
    queryKey: ['dnc-check', phone],
    queryFn: async () => {
      const res = await fetch(`/api/dnc/check/${encodeURIComponent(phone!)}`, { credentials: 'include' });
      if (!res.ok) return { isDnc: false };
      return res.json();
    },
    enabled: !!phone,
  });

  // Call count
  const { data: callCountData } = useQuery({
    queryKey: ['call-count', phone],
    queryFn: async () => {
      const res = await fetch('/api/calls/count-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumbers: [phone] }),
      });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!phone,
  });

  const isDnc = dncData?.isDnc ?? false;
  const phoneCallCount = phone ? (callCountData?.[phone] ?? 0) : 0;

  // DNC state
  const [dncDialogOpen, setDncDialogOpen] = useState(false);
  const [dncReason, setDncReason] = useState('customer_request');

  const addDncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/dnc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: phone, reason: dncReason, source: 'manual' }),
      });
      if (!res.ok) throw new Error('Failed to add to DNC');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Number added to Do Not Call list');
      setDncDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dnc-check', phone] });
    },
    onError: () => toast.error('Failed to add to DNC'),
  });

  const removeDncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dnc/${encodeURIComponent(phone!)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove from DNC');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Number removed from Do Not Call list');
      queryClient.invalidateQueries({ queryKey: ['dnc-check', phone] });
    },
    onError: () => toast.error('Failed to remove from DNC'),
  });

  // Handlers
  const handleAction = useCallback((action: string) => {
    if (!data?.lead) return;

    switch (action) {
      case 'call':
        if (data.lead.phone) {
          window.open(`tel:${data.lead.phone}`, '_self');
          setActivityType('call');
          setActivityDialogOpen(true);
        } else {
          toast.error('No phone number available');
        }
        break;
      case 'email':
        window.open(`mailto:${data.lead.email}`, '_blank');
        setActivityType('email');
        setActivityDialogOpen(true);
        break;
      case 'sms':
        if (data.lead.phone) {
          window.open(`sms:${data.lead.phone}`, '_self');
          setActivityType('sms');
          setActivityDialogOpen(true);
        } else {
          toast.error('No phone number available');
        }
        break;
      case 'schedule':
        toast.info('Calendar integration coming soon');
        break;
      case 'quote':
        toast.info('Quote builder coming soon');
        break;
      case 'transfer':
        toast.info('Lead transfer coming soon');
        break;
      case 'edit':
        // Could open edit dialog
        toast.info('Edit mode coming soon');
        break;
      case 'copy':
        const contactInfo = `${data.lead.firstName} ${data.lead.lastName}\n${data.lead.email}\n${data.lead.phone || ''}`;
        navigator.clipboard.writeText(contactInfo);
        toast.success('Contact info copied');
        break;
    }
  }, [data?.lead]);

  const handleStatusChange = useCallback((newStatus: string) => {
    updateMutation.mutate({ status: newStatus });
  }, [updateMutation]);

  const handleAddNote = useCallback(() => {
    if (noteContent.trim()) {
      noteMutation.mutate(noteContent.trim());
    }
  }, [noteContent, noteMutation]);

  const handleLogActivity = useCallback(() => {
    if (activityType) {
      activityMutation.mutate({
        type: activityType,
        title: activityTitle || `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} logged`,
        description: activityDescription || undefined,
      });
    }
  }, [activityType, activityTitle, activityDescription, activityMutation]);

  // Loading state
  if (isLoading) {
    return (
      <CRMLoungeLayout breadcrumbs={[{ label: 'CRM', href: '/crm/dashboard' }, { label: 'Loading...' }]}>
        <div className="space-y-6 pb-24">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </CRMLoungeLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <CRMLoungeLayout breadcrumbs={[{ label: 'CRM', href: '/crm/dashboard' }, { label: 'Error' }]}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-gray-500 mb-4">The lead you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => setLocation('/crm/contacts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contacts
          </Button>
        </div>
      </CRMLoungeLayout>
    );
  }

  const { lead, activities, communicationSummary, relatedContacts, relatedEntities, aiRecommendations } = data;

  return (
    <CRMLoungeLayout
      breadcrumbs={[
        { label: 'CRM', href: '/crm/dashboard' },
        { label: 'Contacts', href: '/crm/contacts' },
        { label: `${lead.firstName} ${lead.lastName}` },
      ]}
    >
      <div className="space-y-6 pb-24">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => setLocation('/crm/contacts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contacts
        </Button>

        {/* Hero Header Card - Heritage Design System */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          data-tour-id={TOUR.CRM.LEAD_PROFILE.HEADER}
        >
          <Card
            className="overflow-hidden border-0"
            style={{
              borderRadius: RADIUS.hero,
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
              boxShadow: SHADOW.hero,
            }}
          >
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left: Name, Status, Score */}
                <div className="flex items-start gap-5">
                  <Avatar className="w-20 h-20 border-4 border-white/20">
                    <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">
                      {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {lead.firstName} {lead.lastName}
                      </h1>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-white/80 text-lg">{lead.email}</p>
                    {lead.phone && (
                      <p className="text-white/70">{lead.phone}</p>
                    )}
                    {lead.assignedAgent && (
                      <p className="text-sm text-white/60 mt-2">
                        Assigned to {lead.assignedAgent.firstName} {lead.assignedAgent.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Score, Value, Coverage */}
                <div className="flex flex-wrap gap-5">
                  {/* Lead Score */}
                  <div className="text-center bg-white/10 rounded-2xl px-5 py-3">
                    <p className="text-xs text-white/70 mb-1">Lead Score</p>
                    <div className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold',
                      getScoreBadgeColor(lead.scoreTier)
                    )}>
                      {getScoreIcon(lead.scoreTier)}
                      {lead.leadScore}
                    </div>
                  </div>

                  {/* Estimated Value */}
                  <div className="text-center bg-white/10 rounded-2xl px-5 py-3">
                    <p className="text-xs text-white/70 mb-1">Est. Value</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(lead.estimatedValue)}
                    </p>
                  </div>

                  {/* Coverage Type */}
                  {lead.coverageType && (
                    <div className="text-center bg-white/10 rounded-2xl px-5 py-3">
                      <p className="text-xs text-white/70 mb-1">Coverage</p>
                      <p className="text-sm font-semibold text-white capitalize">
                        {lead.coverageType.replace('_', ' ')}
                      </p>
                    </div>
                  )}

                  {/* Close Probability */}
                  <div className="text-center bg-white/10 rounded-2xl px-5 py-3">
                    <p className="text-xs text-white/70 mb-1">Close Prob.</p>
                    <p className="text-2xl font-bold text-white">
                      {lead.closeProbability}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Left Column (65%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info Card */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
              data-tour-id={TOUR.CRM.LEAD_PROFILE.CONTACT_INFO}
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lead.phone || 'Not provided'}</p>
                    {lead.phone && (
                      <>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 text-slate-600">
                          {phoneCallCount > 0 ? `Called ${phoneCallCount}x` : 'Never called'}
                        </Badge>
                        {isDnc && (
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-red-100 text-red-700 border-red-200">
                            DNC
                          </Badge>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6", isDnc ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500")}
                              onClick={() => {
                                if (isDnc) {
                                  removeDncMutation.mutate();
                                } else {
                                  setDncDialogOpen(true);
                                }
                              }}
                            >
                              <PhoneOff className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isDnc ? 'Remove from Do Not Call list' : 'Add to Do Not Call list'}
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </p>
                  <p className="font-medium">{lead.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Address
                  </p>
                  <p className="font-medium">
                    {lead.streetAddress ? (
                      <>
                        {lead.streetAddress}<br />
                        {lead.city}, {lead.state} {lead.zipCode}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Source
                  </p>
                  <p className="font-medium capitalize">{lead.source.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created
                  </p>
                  <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Last Contact
                  </p>
                  <p className="font-medium">
                    {lead.lastContactedAt
                      ? formatRelativeTime(lead.lastContactedAt)
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Contact Count
                  </p>
                  <p className="font-medium">{lead.contactCount} interactions</p>
                </div>
              </CardContent>
              </Card>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
              data-tour-id={TOUR.CRM.LEAD_PROFILE.TIMELINE}
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActivityType('call');
                    setActivityDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities} />
              </CardContent>
              </Card>
            </motion.div>

            {/* Notes Section */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Notes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                {isAddingNote && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Textarea
                      placeholder="Write a note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNoteContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={!noteContent.trim() || noteMutation.isPending}
                      >
                        {noteMutation.isPending ? 'Saving...' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notes from activities */}
                <div className="space-y-3">
                  {activities
                    .filter((a) => a.type === 'note')
                    .map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">{note.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {note.performerName || 'Unknown'} · {formatRelativeTime(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  {activities.filter((a) => a.type === 'note').length === 0 && !isAddingNote && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No notes yet. Add one to track important details.
                    </p>
                  )}
                </div>

                {/* Lead notes field */}
                {lead.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1">Legacy Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}
              </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column (35%) */}
          <div className="space-y-6">
            {/* AI Recommendations (Placeholder) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
              data-tour-id={TOUR.CRM.LEAD_PROFILE.AI_RECS}
            >
              <AiRecommendationCard />
            </motion.div>

            {/* Enrichment Data */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <EnrichmentDataCard data={lead.enrichmentData} />
            </motion.div>

            {/* Related Entities */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover }}
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Related Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="quotes" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="quotes" className="text-xs">
                      Quotes ({relatedEntities.quotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="appts" className="text-xs">
                      Appts ({relatedEntities.appointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="apps" className="text-xs">
                      Apps ({relatedEntities.applications.length})
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="text-xs">
                      Policies ({relatedEntities.policies.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="quotes" className="mt-3">
                    {relatedEntities.quotes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No quotes yet</p>
                    ) : (
                      <div className="space-y-2">
                        {relatedEntities.quotes.map((q) => (
                          <div key={q.id} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{q.quoteNumber}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(q.monthlyPremium)}/mo</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="appts" className="mt-3">
                    {relatedEntities.appointments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No appointments</p>
                    ) : (
                      <div className="space-y-2">
                        {relatedEntities.appointments.map((a) => (
                          <div key={a.id} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{a.title}</p>
                            <p className="text-xs text-gray-500">{new Date(a.scheduledAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="apps" className="mt-3">
                    {relatedEntities.applications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No applications</p>
                    ) : (
                      <div className="space-y-2">
                        {relatedEntities.applications.map((a) => (
                          <div key={a.id} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{a.applicationNumber}</p>
                            <Badge variant="outline" className="text-xs">{a.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="policies" className="mt-3">
                    {relatedEntities.policies.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No policies</p>
                    ) : (
                      <div className="space-y-2">
                        {relatedEntities.policies.map((p) => (
                          <div key={p.id} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{p.policyNumber}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(p.coverageAmount)} coverage</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              </Card>
            </motion.div>

            {/* Related Contacts */}
            {relatedContacts.length > 0 && (
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover }}
              >
                <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Related Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setLocation(`/crm/leads/${contact.id}`)}
                    >
                      <p className="font-medium text-sm">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                  ))}
                </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Communication Summary */}
            {Object.keys(communicationSummary).length > 0 && (
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                transition={{ duration: MOTION.duration.hover }}
              >
                <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Communication Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {Object.entries(communicationSummary).map(([type, data]) => (
                    <div key={type} className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">{data.count}</p>
                      <p className="text-xs text-gray-500 capitalize">{type}s</p>
                    </div>
                  ))}
                </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Action Bar */}
        <div data-tour-id={TOUR.CRM.LEAD_PROFILE.ACTION_BAR}>
          <LeadActionBar
            lead={lead}
            onAction={handleAction}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Log Activity Dialog */}
        <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>
                Record this interaction with {lead.firstName} {lead.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">Text Message</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder={`${activityType.charAt(0).toUpperCase() + activityType.slice(1)} logged`}
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add details about this interaction..."
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogActivity} disabled={activityMutation.isPending}>
                {activityMutation.isPending ? 'Saving...' : 'Log Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DNC Confirmation Dialog */}
        <Dialog open={dncDialogOpen} onOpenChange={setDncDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Do Not Call List</DialogTitle>
              <DialogDescription>
                This number ({phone}) will be blocked from all outbound dialing. This action is tracked for compliance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <label className="text-sm font-medium">Reason</label>
              <Select value={dncReason} onValueChange={setDncReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDncDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => addDncMutation.mutate()}
                disabled={addDncMutation.isPending}
              >
                {addDncMutation.isPending ? 'Adding...' : 'Add to DNC'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLoungeLayout>
  );
}

export default LeadProfile;
