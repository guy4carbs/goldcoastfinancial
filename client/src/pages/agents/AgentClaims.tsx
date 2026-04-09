/**
 * Agent Claims Management Page
 * Heritage Design System — Violet-to-Amber theme
 * Glass cards, framer-motion animations, Heritage tokens
 *
 * Agent-facing claims management: track, review, and process client claims.
 * Uses Sheet (right drawer) with tabbed detail view.
 *
 * Governance: Nova (UI) + Forge (API) + Lumen (flow) + Ledger (financial)
 */

import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RADIUS, SHADOW, MOTION, TYPE,
  fadeInUp, staggerContainer, scaleIn,
  COLORS,
} from '@/lib/heritageDesignSystem';
import {
  ClipboardList, FileText, Upload, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, Search, DollarSign, User, Phone, Mail,
  Calendar, Shield, MessageSquare, Loader2,
} from 'lucide-react';

// ─── STATUS COLORS (mirrors client constants) ─────────
const CLAIM_STATUS_COLORS = {
  filed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  documents_needed: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  under_review: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  denied: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-600' },
} as const;

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  normal: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

const NOTE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  internal: { bg: 'bg-gray-100', text: 'text-gray-600' },
  status_change: { bg: 'bg-violet-100', text: 'text-violet-700' },
  document_request: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

// ─── REQUIRED DOCUMENTS BY CLAIM TYPE ─────────────────
const REQUIRED_DOCUMENTS: Record<string, { name: string; description: string; required: boolean }[]> = {
  'Living Benefits': [
    { name: 'Medical Records', description: 'Recent medical records and diagnosis', required: true },
    { name: 'Physician Statement', description: 'Attending physician statement (APS)', required: true },
    { name: 'Claim Form', description: 'Accelerated benefit claim form', required: true },
    { name: 'Lab Results', description: 'Recent laboratory test results', required: false },
  ],
  'Disability Waiver': [
    { name: 'Disability Certification', description: 'Physician certification of disability', required: true },
    { name: 'Employer Statement', description: 'Employer statement of disability', required: true },
    { name: 'Claim Form', description: 'Disability claim form', required: true },
    { name: 'Tax Returns', description: 'Recent tax returns for income verification', required: false },
  ],
  'Death Benefit': [
    { name: 'Death Certificate', description: 'Certified death certificate', required: true },
    { name: 'Claim Form', description: 'Death benefit claim form', required: true },
    { name: 'Beneficiary ID', description: 'Government-issued photo ID of beneficiary', required: true },
    { name: 'Autopsy Report', description: 'Autopsy report if performed', required: false },
  ],
  'Accidental Death': [
    { name: 'Death Certificate', description: 'Certified death certificate showing accidental cause', required: true },
    { name: 'Police Report', description: 'Accident/police report', required: true },
    { name: 'Autopsy Report', description: 'Autopsy report if performed', required: false },
    { name: 'Claim Form', description: 'Accidental death claim form', required: true },
  ],
  Other: [
    { name: 'Claim Form', description: 'General claim form', required: true },
    { name: 'Supporting Documents', description: 'Any supporting documentation', required: false },
  ],
};

// ─── TYPES ────────────────────────────────────────────

interface ClaimDocument {
  name: string;
  description: string;
  required: boolean;
  submitted: boolean;
}

interface ClaimNote {
  id: string;
  author: string;
  date: string;
  content: string;
  type: 'internal' | 'status_change' | 'document_request';
}

interface AgentClaim {
  id: string;
  claimNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  policyId: string;
  policyNumber: string;
  policyType: string;
  carrier: string;
  claimType: string;
  status: string;
  priority: string;
  description: string;
  amount: number;
  filedDate: string;
  lastUpdate: string;
  carrierClaimNumber: string | null;
  estimatedResolution: string | null;
  documentsRequired: ClaimDocument[];
  notes: ClaimNote[];
}


// ─── HELPERS ──────────────────────────────────────────

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    filed: 'Filed',
    documents_needed: 'Documents Needed',
    under_review: 'Under Review',
    approved: 'Approved',
    denied: 'Denied',
    paid: 'Paid',
  };
  return labels[status] ?? status;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysPending(filedDate: string): number {
  const today = new Date();
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = filedDate.split(' ');
  const month = months[parts[0]] ?? 0;
  const day = parseInt(parts[1].replace(',', ''), 10);
  const year = parseInt(parts[2], 10);
  const filed = new Date(year, month, day);
  const diff = today.getTime() - filed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// ─── CLAIM STATUS TIMELINE ───────────────────────────
function ClaimStatusTimeline({ status }: { status: string }) {
  const steps = ['Filed', 'Documents', 'Under Review', 'Decision'];
  const statusIndex: Record<string, number> = {
    filed: 0,
    documents_needed: 1,
    under_review: 2,
    approved: 3,
    denied: 3,
    paid: 3,
  };
  const currentIdx = statusIndex[status] ?? 0;
  const isDenied = status === 'denied';

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <Fragment key={step}>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all',
              idx < currentIdx
                ? 'bg-violet-600 text-white'
                : idx === currentIdx
                  ? isDenied
                    ? 'bg-red-500 text-white'
                    : 'bg-violet-600 text-white ring-4 ring-violet-200'
                  : 'bg-gray-200 text-gray-500'
            )}
          >
            {idx < currentIdx ? (
              <CheckCircle size={16} />
            ) : idx === currentIdx && isDenied ? (
              <XCircle size={16} />
            ) : (
              idx + 1
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-1 rounded',
                idx < currentIdx ? 'bg-violet-600' : 'bg-gray-200'
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}


// ─── MAIN COMPONENT ──────────────────────────────────

// ─── MAP API RESPONSE → AgentClaim ───────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function mapApiClaim(raw: any): AgentClaim {
  const claimType = raw.claimType || 'Other';
  // Build documents checklist from REQUIRED_DOCUMENTS template
  const templateDocs = REQUIRED_DOCUMENTS[claimType] || REQUIRED_DOCUMENTS['Other'] || [];
  const receivedNames = Array.isArray(raw.documentsReceived) ? raw.documentsReceived : [];
  const documentsRequired: ClaimDocument[] = templateDocs.map((doc) => ({
    name: doc.name,
    description: doc.description,
    required: doc.required,
    submitted: receivedNames.includes(doc.name),
  }));

  const notes: ClaimNote[] = Array.isArray(raw.notes)
    ? raw.notes.map((n: any) => ({
        id: n.id,
        author: n.authorName || 'System',
        date: formatDate(n.createdAt),
        content: n.content,
        type: (n.noteType === 'status_change' ? 'status_change' : n.noteType === 'document_request' ? 'document_request' : 'internal') as ClaimNote['type'],
      }))
    : [];

  return {
    id: raw.id,
    claimNumber: raw.claimNumber || `CLM-${raw.id.slice(0, 8)}`,
    clientName: raw.clientName || 'Unknown',
    clientEmail: raw.clientEmail || '',
    clientPhone: raw.clientPhone || '',
    policyId: raw.policyId || '',
    policyNumber: raw.policyId || '',
    policyType: raw.carrier || '',
    carrier: raw.carrier || '',
    claimType,
    status: raw.status || 'filed',
    priority: raw.priority || 'normal',
    description: raw.internalNotes || '',
    amount: raw.claimAmount || 0,
    filedDate: formatDate(raw.submittedAt) || formatDate(raw.createdAt),
    lastUpdate: formatDate(raw.updatedAt) || formatDate(raw.createdAt),
    carrierClaimNumber: raw.carrierClaimNumber || null,
    estimatedResolution: formatDate(raw.estimatedResolutionDate) || null,
    documentsRequired,
    notes,
  };
}

export default function AgentClaims() {
  // ─── TanStack Query ─────────────────────────────────
  const queryClient = useQueryClient();
  const { data: claimsRaw, isLoading, error } = useQuery({
    queryKey: ['/api/claims'],
    refetchInterval: 30000,
  });
  const claims: AgentClaim[] = useMemo(() => {
    const raw = (claimsRaw as any)?.data || claimsRaw || [];
    return Array.isArray(raw) ? raw.map(mapApiClaim) : [];
  }, [claimsRaw]);

  // ─── Mutations ─────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: async ({ claimId, status, denialReason: reason }: { claimId: string; status: string; denialReason?: string }) => {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, denialReason: reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: async ({ claimId, content }: { claimId: string; content: string }) => {
      const res = await fetch(`/api/claims/${claimId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, isInternal: true }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
    },
  });

  const carrierUpdateMutation = useMutation({
    mutationFn: async ({ claimId, carrierClaimNumber, estimatedResolutionDate }: { claimId: string; carrierClaimNumber?: string; estimatedResolutionDate?: string }) => {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ carrierClaimNumber, estimatedResolutionDate }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
    },
  });

  const markDocMutation = useMutation({
    mutationFn: async ({ claimId, documentsReceived }: { claimId: string; documentsReceived: string[] }) => {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ documentsReceived }),
      });
      if (!res.ok) throw new Error('Failed to update document status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
    },
  });

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Update status state
  const [denialReason, setDenialReason] = useState('');
  const [carrierClaimInput, setCarrierClaimInput] = useState('');
  const [estimatedResInput, setEstimatedResInput] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateAction, setUpdateAction] = useState<string | null>(null);

  // Notes state
  const [newNote, setNewNote] = useState('');

  // Derive selectedClaim from query data so it stays in sync
  const selectedClaim = useMemo(() => {
    if (!selectedClaimId) return null;
    return claims.find((c) => c.id === selectedClaimId) || null;
  }, [claims, selectedClaimId]);

  // Computed stats
  const totalClaims = claims.length;
  const activeClaims = claims.filter(
    (c) => c.status === 'under_review' || c.status === 'documents_needed' || c.status === 'filed'
  ).length;
  const approvedClaims = claims.filter((c) => c.status === 'approved' || c.status === 'paid').length;
  const criticalClaims = claims.filter((c) => c.priority === 'critical').length;

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        searchQuery === '' ||
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesType = typeFilter === 'all' || claim.claimType === typeFilter;
      const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [claims, searchQuery, statusFilter, typeFilter, priorityFilter]);

  // Unique claim types for filter
  const claimTypes = Array.from(new Set(claims.map((c) => c.claimType)));

  // Open detail sheet
  const openClaimSheet = (claim: AgentClaim) => {
    setSelectedClaimId(claim.id);
    setSheetOpen(true);
    setActiveTab('overview');
    setUpdateSuccess(false);
    setUpdateAction(null);
    setDenialReason('');
    setCarrierClaimInput(claim.carrierClaimNumber || '');
    setEstimatedResInput(claim.estimatedResolution || '');
    setNewNote('');
  };

  // ─── STATUS UPDATE → MUTATION ──────────────────────
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedClaim || statusMutation.isPending) return;

    try {
      await statusMutation.mutateAsync({
        claimId: selectedClaim.id,
        status: newStatus,
        denialReason: newStatus === 'denied' ? denialReason.trim() : undefined,
      });

      // Save carrier info if changed
      if (carrierClaimInput !== (selectedClaim.carrierClaimNumber || '') ||
          estimatedResInput !== (selectedClaim.estimatedResolution || '')) {
        await carrierUpdateMutation.mutateAsync({
          claimId: selectedClaim.id,
          carrierClaimNumber: carrierClaimInput || undefined,
          estimatedResolutionDate: estimatedResInput || undefined,
        });
      }

      toast.success(`Claim status updated to ${getStatusLabel(newStatus)}`);
      setUpdateSuccess(true);
      setUpdateAction(null);
      setDenialReason('');
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update claim status');
    }
  };

  // ─── ADD NOTE → MUTATION ──────────────────────────
  const handleAddNote = async () => {
    if (!selectedClaim || !newNote.trim() || noteMutation.isPending) return;

    try {
      await noteMutation.mutateAsync({
        claimId: selectedClaim.id,
        content: newNote.trim(),
      });
      toast.success('Note added');
      setNewNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    }
  };

  // Determine if a claim is death/accidental death
  const isDeathClaim = (claim: AgentClaim) =>
    claim.claimType === 'Accidental Death' || claim.claimType === 'Death Benefit';

  // ─── ERROR STATE ─────────────────────────────────────
  if (error) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">Failed to load claims.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/claims'] })}>Retry</Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  return (
    <AgentLoungeLayout>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* ─── HERO ─────────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <AgentPageHero
          icon={ClipboardList}
          title="Claims Management"
          subtitle="Track, review, and process client claims"
        />
      </motion.div>

      {/* ─── STAT CARDS ───────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <AgentStatCardGrid>
          <AgentStatCard icon={ClipboardList} value={totalClaims} label="Total Claims" gradient="from-violet-500 to-purple-600" />
          <AgentStatCard icon={Clock} value={activeClaims} label="Active / Under Review" gradient="from-blue-500 to-indigo-600" />
          <AgentStatCard icon={CheckCircle} value={approvedClaims} label="Approved" gradient="from-emerald-500 to-green-600" />
          <AgentStatCard icon={AlertTriangle} value={criticalClaims} label="Critical Priority" gradient="from-red-500 to-rose-600" />
        </AgentStatCardGrid>
      </motion.div>

      {/* ─── FILTER BAR ───────────────────────────────────── */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search claims, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ borderRadius: RADIUS.input }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'filed', 'under_review', 'approved', 'denied', 'paid'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : ''}
              style={{ borderRadius: RADIUS.pill }}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
              {status !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({claims.filter((c) => c.status === status).length})
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 px-3 pr-8 py-1.5 text-gray-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            style={{ borderRadius: RADIUS.pill }}
          >
            <option value="all">All Types</option>
            {claimTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 px-3 pr-8 py-1.5 text-gray-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            style={{ borderRadius: RADIUS.pill }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* ─── CLAIMS LIST ──────────────────────────────────── */}
      <motion.div variants={fadeInUp} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              key="loading"
              variants={scaleIn}
              className="bg-white py-16 text-center border border-gray-100"
              style={{ boxShadow: SHADOW.level1, borderRadius: RADIUS.card }}
            >
              <Loader2 style={{ width: 32, height: 32 }} className="text-violet-500 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.body }}>Loading claims...</p>
            </motion.div>
          ) : filteredClaims.length === 0 ? (
            <motion.div
              key="empty"
              variants={scaleIn}
              className="bg-white py-16 text-center border border-gray-100"
              style={{ boxShadow: SHADOW.level1, borderRadius: RADIUS.card }}
            >
              <Search style={{ width: 40, height: 40 }} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.body }}>
                No claims match your filters
              </p>
              <p className="text-gray-400 mt-1" style={{ fontSize: TYPE.meta }}>
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            filteredClaims.map((claim) => {
              const statusColor = CLAIM_STATUS_COLORS[claim.status as keyof typeof CLAIM_STATUS_COLORS]
                || CLAIM_STATUS_COLORS.filed;
              const daysPending = getDaysPending(claim.filedDate);
              const isDeath = isDeathClaim(claim);

              // Map status → icon for the leading indicator
              const StatusIcon = {
                filed: FileText,
                documents_needed: Upload,
                under_review: Clock,
                approved: CheckCircle,
                denied: XCircle,
                paid: DollarSign,
              }[claim.status] || FileText;

              // Ring color matching status
              const ringColor = {
                filed: 'ring-blue-200',
                documents_needed: 'ring-amber-200',
                under_review: 'ring-violet-200',
                approved: 'ring-emerald-200',
                denied: 'ring-red-200',
                paid: 'ring-emerald-200',
              }[claim.status] || 'ring-gray-200';

              return (
                <motion.div
                  key={claim.id}
                  variants={scaleIn}
                  layout
                  className="bg-white p-4 border border-gray-100 hover:border-violet-200 transition-all cursor-pointer"
                  style={{
                    boxShadow: SHADOW.level1,
                    borderRadius: RADIUS.card,
                    ...(isDeath ? { borderLeft: '4px solid #ef4444' } : {}),
                  }}
                  onClick={() => openClaimSheet(claim)}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2', statusColor.bg, ringColor)}>
                      <StatusIcon className={cn('w-5 h-5', statusColor.text)} />
                    </div>

                    {/* Claim Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{claim.claimNumber}</h3>
                        <Badge variant="secondary" className={cn(statusColor.bg, statusColor.text, 'border-0')} style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}>
                          {getStatusLabel(claim.status)}
                        </Badge>
                        {claim.priority === 'critical' && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 gap-1" style={{ fontSize: TYPE.micro }}>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            CRITICAL
                          </Badge>
                        )}
                        {claim.priority === 'high' && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 gap-1" style={{ fontSize: TYPE.micro }}>
                            <AlertTriangle style={{ width: 10, height: 10 }} />
                            High
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-gray-500" style={{ fontSize: TYPE.caption }}>
                        <span>{claim.clientName}</span>
                        <span>{claim.claimType}</span>
                        <span>{claim.carrier}</span>
                        <span className="hidden sm:inline">{claim.policyNumber}</span>
                      </div>
                    </div>

                    {/* Amount & Days Pending */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="font-bold text-gray-900">{formatAmount(claim.amount)}</p>
                      <p
                        className={cn(
                          'font-medium',
                          daysPending > 30 ? 'text-red-600' : daysPending > 14 ? 'text-amber-600' : 'text-gray-500'
                        )}
                        style={{ fontSize: TYPE.caption }}
                      >
                        {daysPending} days pending
                      </p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── DETAIL SHEET (RIGHT DRAWER) ──────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0" side="right">
          {selectedClaim && (
            <>
              {/* Sheet Header */}
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-gray-900 font-bold" style={{ fontSize: TYPE.title }}>
                      {selectedClaim.claimNumber}
                    </SheetTitle>
                    <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.meta }}>
                      {selectedClaim.clientName} — {selectedClaim.claimType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(() => {
                      const sc = CLAIM_STATUS_COLORS[selectedClaim.status as keyof typeof CLAIM_STATUS_COLORS]
                        || CLAIM_STATUS_COLORS.filed;
                      return (
                        <Badge className={cn(sc.bg, sc.text, 'hover:opacity-90 border-0 gap-1')}>
                          <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                          {getStatusLabel(selectedClaim.status)}
                        </Badge>
                      );
                    })()}
                    {selectedClaim.priority !== 'normal' && (
                      <Badge
                        className={cn(
                          PRIORITY_COLORS[selectedClaim.priority]?.bg,
                          PRIORITY_COLORS[selectedClaim.priority]?.text,
                          'hover:opacity-90 border-0'
                        )}
                      >
                        {getPriorityLabel(selectedClaim.priority)}
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
                  <TabsTrigger value="update" className="text-xs sm:text-sm">Update</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                </TabsList>

                {/* ─── TAB 1: OVERVIEW ─────────────────────── */}
                <TabsContent value="overview" className="space-y-5 pb-6">
                  {/* Client info */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Client Information
                    </p>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4"
                      style={{
                        borderRadius: RADIUS.input,
                        background: 'rgba(139, 92, 246, 0.04)',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <User style={{ width: 14, height: 14 }} className="text-violet-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Name</p>
                          <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.clientName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail style={{ width: 14, height: 14 }} className="text-violet-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Email</p>
                          <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.clientEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone style={{ width: 14, height: 14 }} className="text-violet-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Phone</p>
                          <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.clientPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Policy details */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Policy Details
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FileText style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Number</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.policyNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Policy Type</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.policyType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 col-span-2">
                        <Shield style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Carrier</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.carrier}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Claim details */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Claim Details
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <ClipboardList style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Claim Type</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.claimType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Amount</p>
                          <p className="text-gray-800 font-bold" style={{ fontSize: TYPE.meta }}>
                            {formatAmount(selectedClaim.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Filed Date</p>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                            {selectedClaim.filedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock style={{ width: 14, height: 14 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Days Pending</p>
                          <p
                            className={cn(
                              'font-medium',
                              getDaysPending(selectedClaim.filedDate) > 30
                                ? 'text-red-600'
                                : getDaysPending(selectedClaim.filedDate) > 14
                                  ? 'text-amber-600'
                                  : 'text-gray-800'
                            )}
                            style={{ fontSize: TYPE.meta }}
                          >
                            {getDaysPending(selectedClaim.filedDate)} days
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="bg-gray-50 px-4 py-3 text-gray-700"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta, lineHeight: 1.6 }}
                    >
                      {selectedClaim.description}
                    </div>
                  </div>

                  {/* Status timeline */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Claim Progress
                    </p>
                    <ClaimStatusTimeline status={selectedClaim.status} />
                    <div className="flex justify-between mt-2">
                      {['Filed', 'Documents', 'Under Review', 'Decision'].map((step) => (
                        <p key={step} className="text-gray-400 text-center" style={{ fontSize: TYPE.micro, width: '25%' }}>
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Carrier info */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Carrier Information
                    </p>
                    <div
                      className="p-4 space-y-3"
                      style={{
                        borderRadius: RADIUS.input,
                        background: 'rgba(245, 158, 11, 0.04)',
                        border: '1px solid rgba(245, 158, 11, 0.12)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Carrier Claim #</p>
                        <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                          {selectedClaim.carrierClaimNumber || 'Not yet assigned'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Estimated Resolution</p>
                        <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                          {selectedClaim.estimatedResolution || 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ─── TAB 2: DOCUMENTS ────────────────────── */}
                <TabsContent value="documents" className="space-y-5 pb-6">
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Required Documents
                    </p>
                    <p className="text-gray-500 mb-4" style={{ fontSize: TYPE.caption }}>
                      Documents required for {selectedClaim.claimType} claim processing
                    </p>

                    <div className="space-y-2">
                      {selectedClaim.documentsRequired.map((doc, idx) => {
                        const handleDocToggle = () => {
                          if (markDocMutation.isPending) return;
                          const currentReceived = selectedClaim.documentsRequired
                            .filter((d) => d.submitted)
                            .map((d) => d.name);
                          const updated = doc.submitted
                            ? currentReceived.filter((n) => n !== doc.name)
                            : [...currentReceived, doc.name];
                          markDocMutation.mutate({
                            claimId: selectedClaim.id,
                            documentsReceived: updated,
                          });
                        };

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              borderRadius: RADIUS.input,
                              background: doc.submitted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                              border: doc.submitted
                                ? '1px solid rgba(16, 185, 129, 0.15)'
                                : '1px solid rgba(245, 158, 11, 0.15)',
                            }}
                            onClick={handleDocToggle}
                          >
                            {/* Clickable checkbox */}
                            <button
                              type="button"
                              disabled={markDocMutation.isPending}
                              className={cn(
                                'flex items-center justify-center flex-shrink-0 transition-all',
                                markDocMutation.isPending && 'opacity-50'
                              )}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: RADIUS.pill,
                                background: doc.submitted
                                  ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                                  : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocToggle();
                              }}
                            >
                              {markDocMutation.isPending ? (
                                <Loader2 style={{ width: 14, height: 14 }} className="text-gray-400 animate-spin" />
                              ) : doc.submitted ? (
                                <CheckCircle style={{ width: 16, height: 16 }} className="text-emerald-600" />
                              ) : (
                                <div
                                  className="border-2 border-amber-300 bg-white"
                                  style={{ width: 16, height: 16, borderRadius: 4 }}
                                />
                              )}
                            </button>

                            {/* Doc info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.meta }}>
                                  {doc.name}
                                </p>
                                <Badge
                                  className={cn(
                                    'text-xs border-0',
                                    doc.required
                                      ? 'bg-violet-100 text-violet-700'
                                      : 'bg-gray-100 text-gray-500'
                                  )}
                                >
                                  {doc.required ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>
                                {doc.description}
                              </p>
                            </div>

                            {/* Submitted status */}
                            <p
                              className={cn(
                                'text-xs font-medium flex-shrink-0',
                                doc.submitted ? 'text-emerald-600' : 'text-amber-600'
                              )}
                            >
                              {doc.submitted ? 'Received' : 'Pending'}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary */}
                    <div
                      className="flex items-center justify-between mt-4 p-3"
                      style={{
                        borderRadius: RADIUS.input,
                        background: 'rgba(139, 92, 246, 0.04)',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                      }}
                    >
                      <p className="text-gray-600 font-medium" style={{ fontSize: TYPE.meta }}>
                        Documents Received
                      </p>
                      <p className="font-bold text-violet-700" style={{ fontSize: TYPE.meta }}>
                        {selectedClaim.documentsRequired.filter((d) => d.submitted).length} / {selectedClaim.documentsRequired.length}
                      </p>
                    </div>

                    {/* Documents from reference list */}
                    {(() => {
                      const refDocs = REQUIRED_DOCUMENTS[selectedClaim.claimType];
                      if (!refDocs) return null;

                      const submittedDocs = selectedClaim.documentsRequired.filter((d) => d.submitted);
                      if (submittedDocs.length === 0) return null;

                      return (
                        <div className="mt-5">
                          <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                            Documents Received
                          </p>
                          <div className="space-y-2">
                            {submittedDocs.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-gray-50"
                                style={{ borderRadius: RADIUS.input }}
                              >
                                <FileText style={{ width: 16, height: 16 }} className="text-violet-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.meta }}>
                                    {doc.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 flex-shrink-0">
                                  <CheckCircle style={{ width: 14, height: 14 }} />
                                  <span style={{ fontSize: TYPE.caption }}>Submitted</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </TabsContent>

                {/* ─── TAB 3: UPDATE STATUS ────────────────── */}
                <TabsContent value="update" className="space-y-5 pb-6">
                  {/* Current status display */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Current Status
                    </p>
                    {(() => {
                      const sc = CLAIM_STATUS_COLORS[selectedClaim.status as keyof typeof CLAIM_STATUS_COLORS]
                        || CLAIM_STATUS_COLORS.filed;
                      return (
                        <Badge
                          className={cn(sc.bg, sc.text, 'hover:opacity-90 border-0 gap-1.5 text-sm px-4 py-2')}
                        >
                          <div className={cn('w-2.5 h-2.5 rounded-full', sc.dot)} />
                          {getStatusLabel(selectedClaim.status)}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* Success state */}
                  <AnimatePresence>
                    {updateSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <CheckCircle style={{ width: 18, height: 18 }} className="text-emerald-600 flex-shrink-0" />
                        <p className="text-emerald-800 font-medium" style={{ fontSize: TYPE.meta }}>
                          Claim status updated successfully
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Valid transition buttons */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Available Actions
                    </p>

                    {selectedClaim.status === 'filed' && (
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: statusMutation.isPending ? 1 : 1.01 }}
                          whileTap={{ scale: statusMutation.isPending ? 1 : 0.99 }}
                          onClick={() => handleStatusUpdate('under_review')}
                          disabled={statusMutation.isPending}
                          className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-violet-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            borderRadius: RADIUS.input,
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            background: 'rgba(139, 92, 246, 0.04)',
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.button,
                              background: COLORS.gradients.heroWithAccent,
                            }}
                          >
                            {statusMutation.isPending ? (
                              <Loader2 style={{ width: 20, height: 20 }} className="text-white animate-spin" />
                            ) : (
                              <ClipboardList style={{ width: 20, height: 20 }} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {statusMutation.isPending ? 'Updating...' : 'Begin Review'}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Move this claim to Under Review status
                            </p>
                          </div>
                          <ChevronRight style={{ width: 18, height: 18 }} className="text-gray-400 ml-auto flex-shrink-0" />
                        </motion.button>
                      </div>
                    )}

                    {selectedClaim.status === 'under_review' && (
                      <div className="space-y-3">
                        {/* Approve */}
                        <motion.button
                          whileHover={{ scale: statusMutation.isPending ? 1 : 1.01 }}
                          whileTap={{ scale: statusMutation.isPending ? 1 : 0.99 }}
                          onClick={() => {
                            if (updateAction === 'approve') {
                              handleStatusUpdate('approved');
                            } else {
                              setUpdateAction('approve');
                            }
                          }}
                          disabled={statusMutation.isPending}
                          className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            borderRadius: RADIUS.input,
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            background: updateAction === 'approve' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                            }}
                          >
                            {statusMutation.isPending ? (
                              <Loader2 style={{ width: 20, height: 20 }} className="text-white animate-spin" />
                            ) : (
                              <CheckCircle style={{ width: 20, height: 20 }} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {statusMutation.isPending ? 'Approving...' : updateAction === 'approve' ? 'Click again to confirm Approve' : 'Approve Claim'}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Approve and begin payout processing
                            </p>
                          </div>
                          <ChevronRight style={{ width: 18, height: 18 }} className="text-emerald-400 ml-auto flex-shrink-0" />
                        </motion.button>

                        {/* Deny */}
                        <motion.button
                          whileHover={{ scale: statusMutation.isPending ? 1 : 1.01 }}
                          whileTap={{ scale: statusMutation.isPending ? 1 : 0.99 }}
                          onClick={() => setUpdateAction(updateAction === 'deny' ? null : 'deny')}
                          disabled={statusMutation.isPending}
                          className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            borderRadius: RADIUS.input,
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            background: updateAction === 'deny' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            }}
                          >
                            <XCircle style={{ width: 20, height: 20 }} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>Deny Claim</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Deny this claim with a reason
                            </p>
                          </div>
                          <ChevronRight style={{ width: 18, height: 18 }} className="text-red-400 ml-auto flex-shrink-0" />
                        </motion.button>

                        {/* Denial reason textarea */}
                        <AnimatePresence>
                          {updateAction === 'deny' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: MOTION.duration.normal }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pt-1">
                                <div>
                                  <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                                    Denial Reason
                                  </label>
                                  <textarea
                                    value={denialReason}
                                    onChange={(e) => setDenialReason(e.target.value)}
                                    placeholder="Enter the reason for denial..."
                                    rows={3}
                                    className="w-full bg-white border border-gray-200 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none"
                                    style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleStatusUpdate('denied')}
                                  disabled={!denialReason.trim() || statusMutation.isPending}
                                  className="gap-2 text-white font-semibold border-0"
                                  style={{
                                    background: (!denialReason.trim() || statusMutation.isPending)
                                      ? '#d1d5db'
                                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    borderRadius: RADIUS.button,
                                    height: 40,
                                    padding: '0 20px',
                                  }}
                                >
                                  {statusMutation.isPending ? (
                                    <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                                  ) : (
                                    <XCircle style={{ width: 16, height: 16 }} />
                                  )}
                                  {statusMutation.isPending ? 'Denying...' : 'Confirm Denial'}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {selectedClaim.status === 'approved' && (
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: statusMutation.isPending ? 1 : 1.01 }}
                          whileTap={{ scale: statusMutation.isPending ? 1 : 0.99 }}
                          onClick={() => handleStatusUpdate('paid')}
                          disabled={statusMutation.isPending}
                          className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            borderRadius: RADIUS.input,
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            background: 'rgba(16, 185, 129, 0.04)',
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #10b981, #047857)',
                            }}
                          >
                            {statusMutation.isPending ? (
                              <Loader2 style={{ width: 20, height: 20 }} className="text-white animate-spin" />
                            ) : (
                              <DollarSign style={{ width: 20, height: 20 }} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {statusMutation.isPending ? 'Processing...' : 'Mark as Paid'}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Confirm payout has been issued to beneficiary
                            </p>
                          </div>
                          <ChevronRight style={{ width: 18, height: 18 }} className="text-emerald-400 ml-auto flex-shrink-0" />
                        </motion.button>
                      </div>
                    )}

                    {(selectedClaim.status === 'denied' || selectedClaim.status === 'paid') && (
                      <div
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <CheckCircle style={{ width: 18, height: 18 }} className="text-gray-400 flex-shrink-0" />
                        <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                          This claim has reached its final status. No further transitions available.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Carrier claim number input */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                      Carrier Claim Number
                    </label>
                    <input
                      type="text"
                      value={carrierClaimInput}
                      onChange={(e) => setCarrierClaimInput(e.target.value)}
                      placeholder="e.g. LFG-2026-88421"
                      className="w-full bg-white border border-gray-200 px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  {/* Estimated resolution date input */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                      Estimated Resolution Date
                    </label>
                    <input
                      type="text"
                      value={estimatedResInput}
                      onChange={(e) => setEstimatedResInput(e.target.value)}
                      placeholder="e.g. Apr 8, 2026"
                      className="w-full bg-white border border-gray-200 px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>

                  {/* Confirm Update button (saves carrier # and resolution date) */}
                  <Button
                    onClick={async () => {
                      if (!selectedClaim) return;
                      try {
                        await carrierUpdateMutation.mutateAsync({
                          claimId: selectedClaim.id,
                          carrierClaimNumber: carrierClaimInput || undefined,
                          estimatedResolutionDate: estimatedResInput || undefined,
                        });
                        toast.success('Claim details updated');
                        setUpdateSuccess(true);
                        setTimeout(() => setUpdateSuccess(false), 3000);
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to update claim');
                      }
                    }}
                    disabled={carrierUpdateMutation.isPending}
                    className="gap-2 text-white font-semibold border-0 w-full"
                    style={{
                      background: carrierUpdateMutation.isPending ? '#d1d5db' : COLORS.gradients.heroWithAccent,
                      borderRadius: RADIUS.button,
                      height: 44,
                      padding: '0 24px',
                    }}
                  >
                    {carrierUpdateMutation.isPending ? (
                      <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                    ) : (
                      <CheckCircle style={{ width: 16, height: 16 }} />
                    )}
                    {carrierUpdateMutation.isPending ? 'Updating...' : 'Confirm Update'}
                  </Button>
                </TabsContent>

                {/* ─── TAB 4: NOTES & HISTORY ─────────────── */}
                <TabsContent value="notes" className="space-y-5 pb-6">
                  {/* Add note form */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      Add Note
                    </p>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal note about this claim..."
                      rows={3}
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none mb-3"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || noteMutation.isPending}
                      className="gap-2 text-white font-semibold border-0"
                      style={{
                        background: (!newNote.trim() || noteMutation.isPending)
                          ? '#d1d5db'
                          : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                        borderRadius: RADIUS.button,
                        height: 40,
                        padding: '0 20px',
                      }}
                    >
                      {noteMutation.isPending ? (
                        <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                      ) : (
                        <MessageSquare style={{ width: 16, height: 16 }} />
                      )}
                      {noteMutation.isPending ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>

                  {/* Notes list */}
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                      History ({selectedClaim.notes.length})
                    </p>

                    <div className="space-y-3">
                      {selectedClaim.notes.map((note) => {
                        const noteColors = NOTE_TYPE_COLORS[note.type] || NOTE_TYPE_COLORS.internal;
                        const isStatusChange = note.type === 'status_change';

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: MOTION.duration.normal }}
                            className="p-4"
                            style={{
                              borderRadius: RADIUS.input,
                              background: isStatusChange
                                ? 'rgba(139, 92, 246, 0.04)'
                                : 'rgba(0, 0, 0, 0.02)',
                              border: isStatusChange
                                ? '1px solid rgba(139, 92, 246, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.06)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                {isStatusChange ? (
                                  <div
                                    className="flex items-center justify-center flex-shrink-0"
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: RADIUS.pill,
                                      background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                                    }}
                                  >
                                    <ChevronRight style={{ width: 12, height: 12 }} className="text-violet-600" />
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center justify-center flex-shrink-0"
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: RADIUS.pill,
                                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                                    }}
                                  >
                                    <MessageSquare style={{ width: 12, height: 12 }} className="text-gray-500" />
                                  </div>
                                )}
                                <p className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                                  {note.author}
                                </p>
                                <Badge
                                  className={cn(
                                    noteColors.bg,
                                    noteColors.text,
                                    'hover:opacity-90 border-0 text-xs'
                                  )}
                                >
                                  {note.type === 'internal'
                                    ? 'Internal'
                                    : note.type === 'status_change'
                                      ? 'Status Change'
                                      : 'Doc Request'}
                                </Badge>
                              </div>
                              <p className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                                {note.date}
                              </p>
                            </div>
                            <p className="text-gray-700 pl-8" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>
                              {note.content}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
    </AgentLoungeLayout>
  );
}
