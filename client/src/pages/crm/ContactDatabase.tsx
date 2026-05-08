/**
 * Contact Database
 * Unified view of leads and clients with search, filters, and bulk actions
 * Updated with Heritage Design System
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CRMLoungeLayout } from './CRMLoungeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  SheetDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, LAYOUT, COLORS, TABLE,
  fadeInUp, staggerContainer, fadeIn
} from '@/lib/heritageDesignSystem';
import { TOUR } from '@/lib/tour/selectors';

// =============================================================================
// TYPES
// =============================================================================

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assignedTo: string | null;
  estimatedValue: number | null;
  pipelineStage: string | null;
  leadScore: number | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contactType: 'lead' | 'client';
  activityCount: number;
}

interface ContactDetail {
  contact: Contact & {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    priority?: string;
    coverageType?: string;
    coverageAmount?: string;
    nextFollowUp?: string;
    notes?: string;
    tags?: string[];
    contactCount?: number;
  };
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    performedBy: string;
    createdAt: string;
  }>;
  relatedContacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }>;
  policies: Array<{
    id: string;
    policyNumber: string;
    type: string;
    status: string;
    coverageAmount: number;
    monthlyPremium: string;
  }>;
}

interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  facets: {
    status: Record<string, number>;
    source: Record<string, number>;
  };
}

// =============================================================================
// API
// =============================================================================

async function fetchContacts(params: Record<string, string>): Promise<ContactsResponse> {
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`/api/crm/contacts?${queryString}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

async function fetchContactDetail(id: string): Promise<ContactDetail> {
  const res = await fetch(`/api/crm/contacts/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch contact');
  return res.json();
}

async function exportContacts(ids?: string[]): Promise<void> {
  const res = await fetch('/api/crm/contacts/export', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to export');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contacts-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

async function addActivity(id: string, data: { type: string; title: string; description: string }) {
  const res = await fetch(`/api/crm/contacts/${id}/activity`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add activity');
  return res.json();
}

// =============================================================================
// STATUS BADGE STYLES (with gradients)
// =============================================================================

const statusBadgeStyles: Record<string, string> = {
  new: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0',
  contacted: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0',
  quoted: 'bg-gradient-to-r from-violet-500 to-violet-600 text-white border-0',
  follow_up: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0',
  won: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0',
  lost: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0',
  client: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0',
};

// =============================================================================
// CONTACT TABLE
// =============================================================================

function ContactTable({
  contacts,
  isLoading,
  selectedIds,
  onSelect,
  onSelectAll,
  onRowClick,
}: {
  contacts: Contact[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onRowClick: (contact: Contact) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No contacts found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-100">
          <TableHead className="w-12" style={{ height: TABLE.headerHeight }}>
            <Checkbox
              checked={selectedIds.size === contacts.length && contacts.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700">Name</TableHead>
          <TableHead className="font-semibold text-gray-700">Type</TableHead>
          <TableHead className="font-semibold text-gray-700">Email</TableHead>
          <TableHead className="font-semibold text-gray-700">Phone</TableHead>
          <TableHead className="font-semibold text-gray-700">Status</TableHead>
          <TableHead className="font-semibold text-gray-700">Source</TableHead>
          <TableHead className="text-right font-semibold text-gray-700">Value</TableHead>
          <TableHead className="font-semibold text-gray-700">Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow
            key={contact.id}
            className="cursor-pointer transition-colors duration-150 hover:bg-indigo-50/50 border-b border-gray-50"
            style={{ height: TABLE.rowHeight }}
            onClick={() => onRowClick(contact)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedIds.has(contact.id)}
                onCheckedChange={() => onSelect(contact.id)}
              />
            </TableCell>
            <TableCell className="font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(
                'font-medium',
                contact.contactType === 'client'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              )}>
                {contact.contactType === 'client' ? (
                  <><Building2 className="w-3 h-3 mr-1" />Client</>
                ) : (
                  <><User className="w-3 h-3 mr-1" />Lead</>
                )}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600">{contact.email}</TableCell>
            <TableCell className="text-gray-600">{contact.phone}</TableCell>
            <TableCell>
              <Badge className={cn(
                'font-medium shadow-sm',
                statusBadgeStyles[contact.status] || 'bg-gray-100 text-gray-700'
              )}>
                {contact.status.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600 capitalize">
              {contact.source?.replace('_', ' ') || '-'}
            </TableCell>
            <TableCell className="text-right font-semibold text-emerald-600">
              {contact.estimatedValue ? `$${contact.estimatedValue.toLocaleString()}` : '-'}
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              {contact.lastContactedAt
                ? formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })
                : 'Never'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// =============================================================================
// CONTACT DETAIL DRAWER
// =============================================================================

function ContactDetailDrawer({
  contactId,
  open,
  onClose,
}: {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contact-detail', contactId],
    queryFn: () => fetchContactDetail(contactId!),
    enabled: !!contactId && open,
  });

  const activityMutation = useMutation({
    mutationFn: (activityData: { type: string; title: string; description: string }) =>
      addActivity(contactId!, activityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-detail', contactId] });
      toast.success('Activity added');
    },
  });

  const [activityType, setActivityType] = useState('note');
  const [activityNote, setActivityNote] = useState('');

  const handleAddActivity = () => {
    if (!activityNote.trim()) return;
    activityMutation.mutate({
      type: activityType,
      title: activityType === 'note' ? 'Note Added' : `${activityType} logged`,
      description: activityNote,
    });
    setActivityNote('');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="border-b border-gray-100 pb-4">
          <SheetTitle className="text-xl">
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              `${data?.contact.firstName} ${data?.contact.lastName}`
            )}
          </SheetTitle>
          <SheetDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  'mt-1',
                  data?.contact.contactType === 'client'
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                )}
              >
                {data?.contact.contactType === 'client' ? 'Client' : 'Lead'}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <motion.div
            className="mt-6 space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Contact Info */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                Contact Information
              </h3>
              <div
                className="grid grid-cols-2 gap-3 text-sm p-4 bg-gray-50 rounded-xl"
                style={{ borderRadius: RADIUS.card }}
              >
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="font-medium text-gray-900">{data.contact.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium text-gray-900">{data.contact.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium capitalize text-gray-900">{data.contact.status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Source</span>
                  <p className="font-medium capitalize text-gray-900">{data.contact.source?.replace('_', ' ') || '-'}</p>
                </div>
                {data.contact.estimatedValue && (
                  <div>
                    <span className="text-gray-500">Estimated Value</span>
                    <p className="font-semibold text-emerald-600">
                      ${data.contact.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                )}
                {data.contact.coverageType && (
                  <div>
                    <span className="text-gray-500">Coverage Type</span>
                    <p className="font-medium capitalize text-gray-900">{data.contact.coverageType}</p>
                  </div>
                )}
              </div>
              {(data.contact.streetAddress || data.contact.city) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 text-sm">Address</span>
                  <p className="font-medium text-sm text-gray-900">
                    {data.contact.streetAddress}
                    {data.contact.city && `, ${data.contact.city}`}
                    {data.contact.state && `, ${data.contact.state}`}
                    {data.contact.zipCode && ` ${data.contact.zipCode}`}
                  </p>
                </div>
              )}
              {data.contact.notes && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-amber-700 text-sm font-medium">Notes</span>
                  <p className="text-sm text-amber-900 mt-1">{data.contact.notes}</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = `tel:${data.contact.phone}`}
                className="flex-1 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = `mailto:${data.contact.email}`}
                className="flex-1 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </motion.div>

            {/* Add Activity */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                Add Activity
              </h3>
              <div className="flex gap-2">
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Add a note..."
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddActivity}
                  disabled={!activityNote.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Activity History */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                Activity History
              </h3>
              {data.activities.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">No activities yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {data.activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex gap-3 text-sm p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        {activity.description && (
                          <p className="text-gray-500">{activity.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Policies (for clients) */}
            {data.policies.length > 0 && (
              <motion.div variants={fadeInUp} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                  Policies
                </h3>
                <div className="space-y-2">
                  {data.policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                      style={{ borderRadius: RADIUS.card }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{policy.type}</p>
                          <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                        </div>
                        <Badge
                          className={cn(
                            'font-medium',
                            policy.status === 'active'
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {policy.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Coverage: <span className="font-medium">${policy.coverageAmount?.toLocaleString()}</span> |
                        Premium: <span className="font-medium text-emerald-600">${policy.monthlyPremium}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Contacts */}
            {data.relatedContacts.length > 0 && (
              <motion.div variants={fadeInUp} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                  Related Contacts
                </h3>
                <div className="space-y-2">
                  {data.relatedContacts.map((related) => (
                    <div
                      key={related.id}
                      className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{related.firstName} {related.lastName}</p>
                        <p className="text-xs text-gray-500">{related.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{related.status}</Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ContactDatabase() {
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState('both');
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['crm-contacts', { search, type, status, source, page }],
    queryFn: () => fetchContacts({
      search,
      type,
      status,
      source,
      page: String(page),
      limit: '25',
    }),
  });

  // Handlers
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === (data?.contacts.length || 0)) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.contacts.map(c => c.id) || []));
    }
  };

  const handleRowClick = (contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const handleExport = async () => {
    try {
      const ids = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
      await exportContacts(ids);
      toast.success(`Exported ${ids ? ids.length : 'all'} contacts`);
    } catch (error) {
      toast.error('Failed to export contacts');
    }
  };

  return (
    <CRMLoungeLayout breadcrumbs={[{ label: 'CRM Lounge' }, { label: 'Contacts' }]}>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.CONTACTS.HEADER}>
          <Card
            className="border-0 overflow-hidden"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 lg:p-8 relative">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Contact Database</h1>
                  <p className="text-indigo-100 text-lg">{data?.pagination.total ?? 0} contacts</p>
                </div>
                <Button className="bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.CONTACTS.FILTERS}>
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]" data-tour-id={TOUR.CRM.CONTACTS.SEARCH}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">All Types</SelectItem>
                    <SelectItem value="lead">Leads</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                {/* Source Filter */}
                <Select value={source} onValueChange={(v) => { setSource(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="quote_form">Quote Form</SelectItem>
                    <SelectItem value="contact_form">Contact Form</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleSearch}
                  className="hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div variants={fadeIn} data-tour-id={TOUR.CRM.CONTACTS.BULK}>
            <Card
              className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50"
              style={{ borderRadius: RADIUS.card }}
            >
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-700">
                    {selectedIds.size} contact(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExport}
                      className="hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-white"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Bulk Email
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedIds(new Set())}
                      className="hover:bg-white/50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Table */}
        <motion.div variants={fadeInUp} data-tour-id={TOUR.CRM.CONTACTS.TABLE}>
          <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardContent className="p-0">
              <ContactTable
                contacts={data?.contacts ?? []}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="hover:bg-indigo-50 hover:border-indigo-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="hover:bg-indigo-50 hover:border-indigo-200 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Detail Drawer */}
      <ContactDetailDrawer
        contactId={selectedContact?.id ?? null}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </CRMLoungeLayout>
  );
}

export default ContactDatabase;
