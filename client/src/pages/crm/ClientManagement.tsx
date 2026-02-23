/**
 * Client Management
 * View and manage insurance clients with their policies, billing, and renewals
 *
 * Uses Heritage Design System - INDIGO theme (COLORS.lounges.crm)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS,
  fadeInUp, staggerContainer, fadeIn
} from '@/lib/heritageDesignSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Users,
  DollarSign,
  Shield,
  Calendar,
  Clock,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  AlertCircle,
  Bell,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  RefreshCw,
  Plus,
  ExternalLink,
  CreditCard,
  MessageSquare,
  File,
  Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  policyCount: number;
  totalCoverage: number;
  totalMonthlyPremium: number;
  nextRenewalDate: string | null;
  lastContact: string | null;
  policyTypes: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

interface ClientDetail {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    timezone: string;
    avatarUrl: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    updatedAt: string;
  };
  policies: Array<{
    id: string;
    policyNumber: string;
    type: string;
    status: string;
    coverageAmount: number;
    monthlyPremium: number;
    startDate: string;
    nextPaymentDate: string | null;
    beneficiaryName: string | null;
    beneficiaryRelationship: string | null;
    paymentCount: number;
    lastPaymentDate: string | null;
    createdAt: string;
  }>;
  billing: Array<{
    id: string;
    policyNumber: string;
    amount: number;
    status: string;
    paymentDate: string;
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
  }>;
  communications: Array<{
    id: string;
    fromName: string;
    fromEmail: string;
    subject: string;
    content: string;
    isRead: boolean;
    isFromClient: boolean;
    priority: string;
    createdAt: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    fileSize: string;
    policyNumber: string | null;
    uploadedAt: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    actionUrl: string | null;
    createdAt: string;
  }>;
  metrics: {
    totalPolicies: number;
    activePolicies: number;
    totalCoverage: number;
    totalMonthlyPremium: number;
    annualPremium: number;
    lifetimeValue: number;
    memberSince: string;
    policyTypes: string[];
  };
  upsellOpportunities: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
}

interface Renewal {
  policyId: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: number;
  monthlyPremium: number;
  renewalDate: string;
  daysUntilRenewal: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface RenewalsResponse {
  renewals: {
    urgent: Renewal[];
    soon: Renewal[];
    upcoming: Renewal[];
  };
  summary: {
    urgentCount: number;
    soonCount: number;
    upcomingCount: number;
    total30Days: number;
    total60Days: number;
    total90Days: number;
    revenueAtRisk30Days: number;
  };
}

interface ClientsResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalClients: number;
    totalPolicies: number;
    totalCoverage: number;
    totalMonthlyPremium: number;
    renewalsNext30Days: number;
  };
}

// =============================================================================
// API
// =============================================================================

async function fetchClients(params: Record<string, string>): Promise<ClientsResponse> {
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`/api/crm/clients?${queryString}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

async function fetchClientDetail(id: string): Promise<ClientDetail> {
  const res = await fetch(`/api/crm/clients/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}

async function fetchRenewals(days: number = 30): Promise<RenewalsResponse> {
  const res = await fetch(`/api/crm/clients/renewals?days=${days}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch renewals');
  return res.json();
}

async function addClientNote(clientId: string, data: { subject: string; content: string; priority: string }): Promise<any> {
  const res = await fetch(`/api/crm/clients/${clientId}/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ClientTable({
  clients,
  onSelectClient,
  isLoading,
}: {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-base">No clients found</p>
      </div>
    );
  }

  return (
    <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            <TableHead className="text-sm font-semibold text-gray-700">Client</TableHead>
            <TableHead className="text-sm font-semibold text-gray-700">Contact</TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-700">Policies</TableHead>
            <TableHead className="text-right text-sm font-semibold text-gray-700">Total Coverage</TableHead>
            <TableHead className="text-right text-sm font-semibold text-gray-700">Monthly Premium</TableHead>
            <TableHead className="text-sm font-semibold text-gray-700">Next Renewal</TableHead>
            <TableHead className="text-sm font-semibold text-gray-700">Last Contact</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => {
            const daysUntilRenewal = client.nextRenewalDate
              ? differenceInDays(new Date(client.nextRenewalDate), new Date())
              : null;
            const isRenewalUrgent = daysUntilRenewal !== null && daysUntilRenewal <= 7;
            const isRenewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 30;

            return (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-indigo-50/50 transition-colors duration-150"
                onClick={() => onSelectClient(client)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                        {client.firstName[0]}{client.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Client since {format(new Date(client.createdAt), 'MMM yyyy')}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono bg-indigo-100 text-indigo-700">
                    {client.policyCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900">
                  ${client.totalCoverage.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-gray-700">
                  ${client.totalMonthlyPremium.toFixed(2)}/mo
                </TableCell>
                <TableCell>
                  {client.nextRenewalDate ? (
                    <div className={cn(
                      "text-sm",
                      isRenewalUrgent && "text-red-600 font-medium",
                      isRenewalSoon && !isRenewalUrgent && "text-amber-600"
                    )}>
                      {format(new Date(client.nextRenewalDate), 'MMM d, yyyy')}
                      {isRenewalUrgent && (
                        <div className="flex items-center gap-1 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {daysUntilRenewal} days
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {client.lastContact ? (
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function RenewalAlertsList({ onSelectClient }: { onSelectClient: (clientId: string) => void }) {
  const [renewalDays, setRenewalDays] = useState(30);

  const { data: renewalsData, isLoading } = useQuery({
    queryKey: ['crm', 'renewals', renewalDays],
    queryFn: () => fetchRenewals(renewalDays),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const { renewals, summary } = renewalsData || {
    renewals: { urgent: [], soon: [], upcoming: [] },
    summary: {
      urgentCount: 0,
      soonCount: 0,
      upcomingCount: 0,
      total30Days: 0,
      total60Days: 0,
      total90Days: 0,
      revenueAtRisk30Days: 0,
    },
  };

  const renderRenewalCard = (renewal: Renewal, urgencyLevel: 'urgent' | 'soon' | 'upcoming', index: number) => {
    const colors = {
      urgent: 'border-red-200 bg-red-50',
      soon: 'border-amber-200 bg-amber-50',
      upcoming: 'border-indigo-200 bg-indigo-50',
    };

    return (
      <motion.div
        key={renewal.policyId}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        className={cn("border p-3 cursor-pointer transition-shadow", colors[urgencyLevel])}
        style={{ borderRadius: RADIUS.card / 2, boxShadow: SHADOW.level1 }}
        onClick={() => onSelectClient(renewal.client.id)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">
              {renewal.client.firstName} {renewal.client.lastName}
            </div>
            <div className="text-sm text-gray-600">
              {renewal.policyNumber} - {renewal.policyType}
            </div>
          </div>
          <Badge
            variant={urgencyLevel === 'urgent' ? 'destructive' : urgencyLevel === 'soon' ? 'default' : 'secondary'}
            className={urgencyLevel === 'upcoming' ? 'bg-indigo-100 text-indigo-700' : ''}
          >
            {renewal.daysUntilRenewal} days
          </Badge>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">
            ${renewal.monthlyPremium.toFixed(2)}/mo
          </span>
          <span className="text-gray-500">
            {format(new Date(renewal.renewalDate), 'MMM d, yyyy')}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3"
      >
        <motion.div variants={fadeInUp}>
          <Card className="border-red-200" style={{ borderRadius: RADIUS.card / 2 }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-600">Urgent (7 days)</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mt-1">{summary.urgentCount}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="border-amber-200" style={{ borderRadius: RADIUS.card / 2 }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-600">Soon (14 days)</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{summary.soonCount}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="border-indigo-200" style={{ borderRadius: RADIUS.card / 2 }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-600">30 Days</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.total30Days}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue at Risk */}
      {summary.revenueAtRisk30Days > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="bg-gradient-to-r from-red-50 to-amber-50 border-red-200" style={{ borderRadius: RADIUS.card / 2 }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Revenue at Risk (30 days)</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${summary.revenueAtRisk30Days.toLocaleString()}/mo
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Renewal Time Filter */}
      <div className="flex gap-2">
        <Button
          variant={renewalDays === 30 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRenewalDays(30)}
        >
          30 Days
        </Button>
        <Button
          variant={renewalDays === 60 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRenewalDays(60)}
        >
          60 Days
        </Button>
        <Button
          variant={renewalDays === 90 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRenewalDays(90)}
        >
          90 Days
        </Button>
      </div>

      {/* Renewal Lists */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {renewals.urgent.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Urgent - Within 7 Days
              </h4>
              <div className="space-y-2">
                {renewals.urgent.map((r, i) => renderRenewalCard(r, 'urgent', i))}
              </div>
            </div>
          )}

          {renewals.soon.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Soon - 7-14 Days
              </h4>
              <div className="space-y-2">
                {renewals.soon.map((r, i) => renderRenewalCard(r, 'soon', i))}
              </div>
            </div>
          )}

          {renewals.upcoming.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-indigo-600 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Upcoming - 14+ Days
              </h4>
              <div className="space-y-2">
                {renewals.upcoming.map((r, i) => renderRenewalCard(r, 'upcoming', i))}
              </div>
            </div>
          )}

          {renewals.urgent.length === 0 && renewals.soon.length === 0 && renewals.upcoming.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming renewals in the next {renewalDays} days</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ClientDetailView({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteSubject, setNoteSubject] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePriority, setNotePriority] = useState('normal');

  const { data: clientData, isLoading } = useQuery({
    queryKey: ['crm', 'client', clientId],
    queryFn: () => fetchClientDetail(clientId),
    enabled: !!clientId,
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: { subject: string; content: string; priority: string }) =>
      addClientNote(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'client', clientId] });
      toast.success('Note added successfully');
      setShowNoteDialog(false);
      setNoteSubject('');
      setNoteContent('');
      setNotePriority('normal');
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!clientData) return null;

  const { client, policies, billing, communications, documents, metrics, upsellOpportunities } = clientData;

  const formatPolicyType = (type: string) => {
    const types: Record<string, string> = {
      term: 'Term Life',
      whole_life: 'Whole Life',
      iul: 'IUL',
      final_expense: 'Final Expense',
      universal: 'Universal Life',
    };
    return types[type] || type;
  };

  const getPolicyStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      lapsed: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <>
      {/* Header - Enhanced with Design System */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
        className="border-b bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden"
        style={{ padding: GRID.spacing.md }}
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-4 ring-white/20">
            <AvatarImage src={client.avatarUrl || undefined} />
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
              {client.firstName[0]}{client.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {client.firstName} {client.lastName}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-indigo-100">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                Client since {format(new Date(metrics.memberSince), 'MMM yyyy')}
              </Badge>
              {metrics.policyTypes.map(type => (
                <Badge key={type} className="bg-white/20 text-white border-0">
                  {formatPolicyType(type)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowNoteDialog(true)} className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          </div>
        </div>

        {/* Quick Metrics */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-4 mt-6 relative z-10"
        >
          <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-sm text-indigo-100">Total Coverage</div>
            <div className="text-xl font-bold text-white">
              ${metrics.totalCoverage.toLocaleString()}
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-sm text-indigo-100">Monthly Premium</div>
            <div className="text-xl font-bold text-white">
              ${metrics.totalMonthlyPremium.toFixed(2)}
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-sm text-indigo-100">Active Policies</div>
            <div className="text-xl font-bold text-white">{metrics.activePolicies}</div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-sm text-indigo-100">Lifetime Value</div>
            <div className="text-xl font-bold text-white">
              ${metrics.lifetimeValue.toLocaleString()}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b px-6">
          <TabsList className="bg-transparent border-none h-12">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Policies ({policies.length})
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Billing ({billing.length})
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Communications ({communications.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Documents ({documents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Upsell Opportunities */}
              {upsellOpportunities.length > 0 && (
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <Card className="border-indigo-200 bg-indigo-50" style={{ borderRadius: RADIUS.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Upsell Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {upsellOpportunities.map((opp, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-lg p-3 border"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{opp.title}</span>
                              <Badge variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'default' : 'secondary'}>
                                {opp.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {communications.length > 0 ? (
                    <div className="space-y-3">
                      {communications.slice(0, 5).map(comm => (
                        <div key={comm.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            comm.isFromClient ? "bg-blue-100" : "bg-green-100"
                          )}>
                            <MessageSquare className={cn(
                              "w-4 h-4",
                              comm.isFromClient ? "text-blue-600" : "text-green-600"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comm.subject}</span>
                              {!comm.isRead && <Badge variant="secondary" className="text-xs">Unread</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{comm.content}</p>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>

              {/* Active Policies Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policies.filter(p => p.status === 'active').map(policy => (
                      <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{policy.policyNumber}</div>
                          <div className="text-sm text-gray-500">{formatPolicyType(policy.type)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${policy.coverageAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">${policy.monthlyPremium.toFixed(2)}/mo</div>
                        </div>
                      </div>
                    ))}
                    {policies.filter(p => p.status === 'active').length === 0 && (
                      <p className="text-gray-500 text-center py-4">No active policies</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {policies.map((policy, index) => (
                  <motion.div key={policy.id} variants={fadeInUp}>
                    <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">{policy.policyNumber}</span>
                              {getPolicyStatusBadge(policy.status)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 ml-10">
                              {formatPolicyType(policy.type)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">${policy.coverageAmount.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">${policy.monthlyPremium.toFixed(2)}/mo</div>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Start Date</div>
                            <div className="font-medium text-gray-900">{format(new Date(policy.startDate), 'MMM d, yyyy')}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Next Payment</div>
                            <div className="font-medium text-gray-900">
                              {policy.nextPaymentDate
                                ? format(new Date(policy.nextPaymentDate), 'MMM d, yyyy')
                                : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Beneficiary</div>
                            <div className="font-medium text-gray-900">{policy.beneficiaryName || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Payments Made</div>
                            <div className="font-medium text-gray-900">{policy.paymentCount}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {policies.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No policies found</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.paymentDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium">{payment.policyNumber}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {payment.paymentMethod || 'Card'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{payment.transactionId || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {billing.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No billing history</p>
                </div>
              )}
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications" className="mt-0">
              <div className="space-y-4">
                {communications.map(comm => (
                  <Card key={comm.id} className={cn(!comm.isRead && "border-blue-200")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          comm.isFromClient ? "bg-blue-100" : "bg-green-100"
                        )}>
                          <MessageSquare className={cn(
                            "w-5 h-5",
                            comm.isFromClient ? "text-blue-600" : "text-green-600"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comm.subject}</span>
                              {!comm.isRead && <Badge>Unread</Badge>}
                              {comm.priority !== 'normal' && (
                                <Badge variant={comm.priority === 'high' ? 'destructive' : 'secondary'}>
                                  {comm.priority}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {format(new Date(comm.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            From: {comm.fromName} {comm.fromEmail && `<${comm.fromEmail}>`}
                          </div>
                          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comm.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {communications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No communications</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {documents.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <File className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.name}</div>
                          <div className="text-sm text-gray-500">
                            {doc.category} • {doc.fileSize || 'Unknown size'}
                          </div>
                          {doc.policyNumber && (
                            <div className="text-xs text-gray-400 mt-1">
                              Policy: {doc.policyNumber}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {documents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents</p>
                </div>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add an internal note for {client.firstName} {client.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                placeholder="Note subject"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={notePriority} onValueChange={setNotePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addNoteMutation.mutate({
                subject: noteSubject,
                content: noteContent,
                priority: notePriority,
              })}
              disabled={!noteContent.trim() || addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function ClientManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Fetch clients
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['crm', 'clients', { search, status, sort, page }],
    queryFn: () => fetchClients({
      search,
      status,
      sort,
      page: page.toString(),
      limit: '25',
    }),
  });

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
  };

  return (
    <CRMLoungeLayout>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Hero Card */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="p-6 border-b"
          >
            {/* Hero Card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 overflow-hidden mb-6" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
                <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 lg:p-8 relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Client Management</h1>
                    <p className="text-indigo-100 text-lg">Manage your insurance clients and their policies</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Summary Cards */}
            {clientsData?.summary && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-5 gap-4 mb-6"
              >
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Clients</div>
                          <div className="text-2xl font-bold text-gray-900">{clientsData.summary.totalClients}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Active Policies</div>
                          <div className="text-2xl font-bold text-gray-900">{clientsData.summary.totalPolicies}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Coverage</div>
                          <div className="text-2xl font-bold text-gray-900">${(clientsData.summary.totalCoverage / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Monthly Revenue</div>
                          <div className="text-2xl font-bold text-gray-900">${clientsData.summary.totalMonthlyPremium.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Card
                    className={cn(clientsData.summary.renewalsNext30Days > 0 && "border-amber-300 bg-amber-50")}
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          clientsData.summary.renewalsNext30Days > 0
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        )}>
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Renewals (30d)</div>
                          <div className="text-2xl font-bold text-gray-900">{clientsData.summary.renewalsNext30Days}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Filters */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-40" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active Policies</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                <SelectTrigger className="w-44" style={{ borderRadius: RADIUS.input }}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="created_desc">Newest First</SelectItem>
                  <SelectItem value="coverage_desc">Highest Coverage</SelectItem>
                  <SelectItem value="premium_desc">Highest Premium</SelectItem>
                  <SelectItem value="renewal_asc">Renewal Date</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </motion.div>

          {/* Client Table */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="flex-1 overflow-auto p-6"
          >
            <ClientTable
              clients={clientsData?.clients || []}
              onSelectClient={handleSelectClient}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {clientsData && clientsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, clientsData.pagination.total)} of {clientsData.pagination.total} clients
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
                  <span className="text-sm px-2 font-medium text-gray-600">
                    Page {page} of {clientsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(clientsData.pagination.totalPages, p + 1))}
                    disabled={page === clientsData.pagination.totalPages}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Renewal Alerts Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing, delay: 0.2 }}
          className="w-96 border-l bg-gradient-to-b from-gray-50 to-white p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Renewal Alerts</h2>
          </div>
          <RenewalAlertsList
            onSelectClient={(clientId) => setSelectedClientId(clientId)}
          />
        </motion.div>
      </div>

      {/* Client Detail Sheet */}
      <Sheet open={!!selectedClientId} onOpenChange={(open) => !open && setSelectedClientId(null)}>
        <SheetContent className="w-[800px] sm:max-w-[800px] p-0 flex flex-col">
          {selectedClientId && (
            <ClientDetailView
              clientId={selectedClientId}
              onClose={() => setSelectedClientId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </CRMLoungeLayout>
  );
}

export default ClientManagement;
