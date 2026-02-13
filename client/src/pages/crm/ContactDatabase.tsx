/**
 * Contact Database
 * Unified view of leads and clients with search, filters, and bulk actions
 */

import { useState } from 'react';
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
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-cyan-100 text-cyan-700',
    quoted: 'bg-violet-100 text-violet-700',
    follow_up: 'bg-amber-100 text-amber-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-gray-100 text-gray-700',
    client: 'bg-indigo-100 text-indigo-700',
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
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
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedIds.size === contacts.length && contacts.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead>Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow
            key={contact.id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => onRowClick(contact)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedIds.has(contact.id)}
                onCheckedChange={() => onSelect(contact.id)}
              />
            </TableCell>
            <TableCell className="font-medium">
              {contact.firstName} {contact.lastName}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(
                contact.contactType === 'client' ? 'border-indigo-200 text-indigo-600' : 'border-gray-200'
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
              <Badge className={statusColors[contact.status] || 'bg-gray-100 text-gray-700'}>
                {contact.status}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600 capitalize">
              {contact.source?.replace('_', ' ') || '-'}
            </TableCell>
            <TableCell className="text-right font-medium">
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
        <SheetHeader>
          <SheetTitle>
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
              <Badge variant="outline">
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
          <div className="mt-6 space-y-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="font-medium">{data.contact.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium">{data.contact.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium capitalize">{data.contact.status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Source</span>
                  <p className="font-medium capitalize">{data.contact.source?.replace('_', ' ') || '-'}</p>
                </div>
                {data.contact.estimatedValue && (
                  <div>
                    <span className="text-gray-500">Estimated Value</span>
                    <p className="font-medium text-emerald-600">
                      ${data.contact.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                )}
                {data.contact.coverageType && (
                  <div>
                    <span className="text-gray-500">Coverage Type</span>
                    <p className="font-medium capitalize">{data.contact.coverageType}</p>
                  </div>
                )}
              </div>
              {(data.contact.streetAddress || data.contact.city) && (
                <div>
                  <span className="text-gray-500 text-sm">Address</span>
                  <p className="font-medium text-sm">
                    {data.contact.streetAddress}
                    {data.contact.city && `, ${data.contact.city}`}
                    {data.contact.state && `, ${data.contact.state}`}
                    {data.contact.zipCode && ` ${data.contact.zipCode}`}
                  </p>
                </div>
              )}
              {data.contact.notes && (
                <div>
                  <span className="text-gray-500 text-sm">Notes</span>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1">{data.contact.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => window.location.href = `tel:${data.contact.phone}`}>
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.href = `mailto:${data.contact.email}`}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>

            {/* Add Activity */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Add Activity</h3>
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
                <Button size="sm" onClick={handleAddActivity} disabled={!activityNote.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Activity History */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Activity History</h3>
              {data.activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activities yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {data.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-gray-500">{activity.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Policies (for clients) */}
            {data.policies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Policies</h3>
                <div className="space-y-2">
                  {data.policies.map((policy) => (
                    <div key={policy.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{policy.type}</p>
                          <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                        </div>
                        <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Coverage: ${policy.coverageAmount?.toLocaleString()} | Premium: ${policy.monthlyPremium}/mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Contacts */}
            {data.relatedContacts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Related Contacts</h3>
                <div className="space-y-2">
                  {data.relatedContacts.map((related) => (
                    <div key={related.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{related.firstName} {related.lastName}</p>
                        <p className="text-xs text-gray-500">{related.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{related.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Database</h1>
            <p className="text-gray-500 mt-1">
              {data?.pagination.total ?? 0} contacts
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
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

              <Button variant="outline" onClick={handleSearch}>
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700">
                  {selectedIds.size} contact(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="w-4 h-4 mr-1" />
                    Bulk Email
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
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

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
