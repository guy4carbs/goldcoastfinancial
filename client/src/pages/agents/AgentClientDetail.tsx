/**
 * Agent Client Detail Page
 * Heritage Design System — Violet-to-Amber theme
 * Glass cards, framer-motion animations, Heritage tokens
 *
 * Tabbed detail view: Overview | Policies | Documents | Billing | Claims
 * Full CRUD for policies, documents, billing. Claims are read-only.
 *
 * Governance: Nova (UI) + Forge (API) + Lumen (flow) + Ledger (financial)
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AgentLoungeLayout } from '@/components/agent/AgentLoungeLayout';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from '@/components/agent/primitives';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import {
  RADIUS, SHADOW, MOTION, TYPE,
  fadeInUp, staggerContainer,
  COLORS,
} from '@/lib/heritageDesignSystem';
import {
  User, Mail, Phone, FileText, Shield, Clock, DollarSign,
  ChevronLeft, Upload, Download, Plus, Loader2, Pencil, Trash2,
  CheckCircle, AlertTriangle, XCircle, Calendar, X,
  ClipboardList, CreditCard, FolderOpen, Eye, Send,
} from 'lucide-react';

// ─── CONSTANTS ─────────────────────────────────────────
const POLICY_TYPES = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Annuity'] as const;
const POLICY_STATUSES = ['pending_setup', 'active', 'lapsed', 'expired'] as const;
const DOC_CATEGORIES = [
  { value: 'policy', label: 'Policy' },
  { value: 'application', label: 'Application' },
  { value: 'claims', label: 'Claims' },
  { value: 'billing', label: 'Billing' },
  { value: 'tax', label: 'Tax' },
  { value: 'beneficiary', label: 'Beneficiary' },
  { value: 'statements', label: 'Statements' },
  { value: 'correspondence', label: 'Letters' },
  { value: 'identification', label: 'ID & Verification' },
] as const;

const US_BANKS = [
  'Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank',
  'PNC', 'Truist', 'Capital One', 'TD Bank', 'BMO Harris',
  'Fifth Third', 'Citizens', 'KeyBank', 'Huntington', 'M&T Bank',
  'Regions', 'Ally', 'Discover', 'Charles Schwab', 'USAA',
  'Navy Federal', 'Goldman Sachs', 'Morgan Stanley', 'American Express',
  'Synchrony', 'Comerica', 'Zions Bank',
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending_setup: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  onboarding: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  lapsed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  churned: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const CLAIM_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  filed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  documents_needed: { bg: 'bg-amber-100', text: 'text-amber-700' },
  under_review: { bg: 'bg-violet-100', text: 'text-violet-700' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  denied: { bg: 'bg-red-100', text: 'text-red-700' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
};

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

// ─── TYPES ─────────────────────────────────────────────
interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onboardingStatus: string;
  policyCount: number;
  lastActivity: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  policies?: Policy[];
  documents?: Doc[];
  billing?: BillingRecord[];
}

interface Policy {
  id: number;
  type: string;
  policyNumber: string;
  carrier: string;
  status: string;
  coverageAmount: number;
  monthlyPremium: number;
  startDate: string;
  beneficiaryName: string;
  beneficiaryRelationship: string;
  createdAt: string;
}

interface Doc {
  id: number;
  name: string;
  category: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

interface BillingRecord {
  id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
}

interface Claim {
  id: number;
  claimNumber: string;
  type: string;
  status: string;
  amount: number;
  filedDate: string;
  description: string;
}

// ─── HELPERS ───────────────────────────────────────────
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatStatus = (status: string) =>
  (status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getStatusColor = (status: string) =>
  STATUS_COLORS[status] || STATUS_COLORS.inactive;

const getClaimStatusColor = (status: string) =>
  CLAIM_STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };

// ─── COMPONENT ─────────────────────────────────────────
export default function AgentClientDetail() {
  const [, params] = useRoute('/agents/clients/:clientId');
  const clientId = params?.clientId;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  // ─── Edit client state ────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  // ─── Policy form state ──────────────────────────────
  const [policyForm, setPolicyForm] = useState({
    type: 'Term Life',
    policyNumber: '',
    carrier: '',
    status: 'pending_setup',
    coverageAmount: '',
    monthlyPremium: '',
    startDate: '',
    beneficiaryName: '',
    beneficiaryRelationship: '',
  });

  // ─── Document upload state ──────────────────────────
  const [docForm, setDocForm] = useState({
    name: '',
    category: 'policy' as string,
    file: null as File | null,
  });

  // ─── Send document state ──────────────────────────
  const [showSendDocSheet, setShowSendDocSheet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [sendDocPolicyId, setSendDocPolicyId] = useState('');
  const [sendDocNote, setSendDocNote] = useState('');
  const [sendingDoc, setSendingDoc] = useState(false);

  // ─── Claims status update state ───────────────────
  const [claimStatusMap, setClaimStatusMap] = useState<Record<number, string>>({});
  const [claimNoteMap, setClaimNoteMap] = useState<Record<number, string>>({});
  const [updatingClaimId, setUpdatingClaimId] = useState<number | null>(null);

  // ─── Billing form state ─────────────────────────────
  const [billingForm, setBillingForm] = useState({
    amount: '',
    type: 'premium',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    bankName: '',
    routingNumber: '',
    accountNumber: '',
  });
  const [editingBilling, setEditingBilling] = useState<any>(null);

  // ─── QUERIES ─────────────────────────────────────────
  const { data: rawData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/agent-clients/${clientId}`],
    enabled: !!clientId,
    staleTime: 30000,
  });

  // API returns { client, policies, documents, billing, claims } — extract and merge
  const client: Client | undefined = rawData ? {
    ...rawData.client,
    firstName: rawData.client?.firstName || rawData.client?.first_name,
    lastName: rawData.client?.lastName || rawData.client?.last_name,
    lastLoginAt: rawData.client?.lastLoginAt || rawData.client?.last_login_at,
    onboardingStatus: rawData.client?.onboardingStatus || rawData.client?.onboarding_status || 'pending',
    createdAt: rawData.client?.createdAt || rawData.client?.created_at,
    policies: rawData.policies || [],
    documents: rawData.documents || [],
    billing: rawData.billing || [],
    policyCount: rawData.policies?.length || 0,
    lastActivity: rawData.client?.updatedAt || rawData.client?.updated_at || null,
  } as Client : undefined;

  const { data: claims = [] } = useQuery<Claim[]>({
    queryKey: [`/api/agent-clients/${clientId}/claims`],
    enabled: !!clientId && activeTab === 'claims',
  });

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/document-templates'],
    enabled: activeTab === 'documents',
  });

  const { data: docQueue = [] } = useQuery<any[]>({
    queryKey: ['/api/document-templates/queue', clientId],
    queryFn: async () => {
      const res = await fetch(`/api/document-templates/queue/${clientId}`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: activeTab === 'documents' && !!clientId,
  });

  // ─── Initialize edit data when client loads ─────────
  useEffect(() => {
    if (rawData?.client) {
      const c = rawData.client;
      setEditData({
        firstName: c.firstName || c.first_name || '',
        lastName: c.lastName || c.last_name || '',
        email: c.email || '',
        phone: c.phone || '',
      });
    }
  }, [rawData]);

  // ─── Edit client handler ──────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await fetch(`/api/agent-clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      toast.success('Client info updated');
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
    } catch {
      toast.error('Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  // ─── Resend welcome email handler ─────────────────
  const handleResendWelcome = async () => {
    setResending(true);
    try {
      const res = await fetch(`/api/agent-clients/${clientId}/resend-welcome`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      toast.success('Login email resent to client');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // ─── MUTATIONS ───────────────────────────────────────
  const createPolicyMutation = useMutation({
    mutationFn: async (data: typeof policyForm) => {
      const res = await apiRequest('POST', `/api/agent-clients/${clientId}/policies`, {
        ...data,
        coverageAmount: parseFloat(data.coverageAmount) || 0,
        monthlyPremium: parseFloat(data.monthlyPremium) || 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
      setShowPolicyDialog(false);
      resetPolicyForm();
      toast.success('Policy created successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create policy: ${err.message}`);
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      if (!docForm.file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', docForm.file);
      formData.append('name', docForm.name || docForm.file.name);
      formData.append('category', docForm.category);

      const res = await fetch(`/api/agent-clients/${clientId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
      setShowDocDialog(false);
      resetDocForm();
      toast.success('Document uploaded successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to upload document: ${err.message}`);
    },
  });

  const createBillingMutation = useMutation({
    mutationFn: async (data: typeof billingForm & { _editing?: any }) => {
      const isEdit = !!data._editing;
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit
        ? `/api/agent-clients/${clientId}/billing/${data._editing.id}`
        : `/api/agent-clients/${clientId}/billing`;

      const payload: any = {
        amount: parseFloat(data.amount) || 0,
        status: 'pending',
        billingType: data.type,
        description: data.description,
        dueDate: data.dueDate,
        bankName: data.bankName || undefined,
        paymentDate: new Date().toISOString(),
      };
      // Only send routing/account if provided (don't overwrite with empty on edit)
      if (data.routingNumber) payload.routingNumber = data.routingNumber;
      if (data.accountNumber) payload.accountNumber = data.accountNumber;

      const res = await apiRequest(method, url, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
      setShowBillingDialog(false);
      resetBillingForm();
      toast.success(editingBilling ? 'Billing record updated' : 'Billing record created successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to ${editingBilling ? 'update' : 'create'} billing record: ${err.message}`);
    },
  });

  // ─── FORM HELPERS ────────────────────────────────────
  const resetPolicyForm = useCallback(() => {
    setPolicyForm({
      type: 'Term Life', policyNumber: '', carrier: '', status: 'pending_setup',
      coverageAmount: '', monthlyPremium: '', startDate: '',
      beneficiaryName: '', beneficiaryRelationship: '',
    });
  }, []);

  const resetDocForm = useCallback(() => {
    setDocForm({ name: '', category: 'policy', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const resetBillingForm = useCallback(() => {
    setBillingForm({ amount: '', type: 'premium', description: '', dueDate: new Date().toISOString().split('T')[0], bankName: '', routingNumber: '', accountNumber: '' });
    setEditingBilling(null);
  }, []);

  const startEditBilling = (record: any) => {
    setBillingForm({
      amount: String(record.amount || ''),
      type: record.billing_type || record.billingType || 'premium',
      description: record.description || '',
      dueDate: record.due_date || record.dueDate ? new Date(record.due_date || record.dueDate).toISOString().split('T')[0] : '',
      bankName: record.bank_name || record.bankName || '',
      routingNumber: record.routing_number || record.routingNumber || '',
      accountNumber: record.account_number || record.accountNumber || '',
    });
    setEditingBilling(record);
    setShowBillingDialog(true);
  };

  const handleDeleteBilling = async (billingId: number) => {
    if (!confirm('Delete this billing record?')) return;
    try {
      const res = await fetch(`/api/agent-clients/${clientId}/billing/${billingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Billing record deleted');
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
    } catch {
      toast.error('Failed to delete billing record');
    }
  };

  // ─── SEND DOCUMENT HANDLER ──────────────────────────
  const handleSendDocument = async () => {
    if (!selectedTemplate) return;
    setSendingDoc(true);
    try {
      const res = await fetch('/api/document-templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateKey: selectedTemplate.template_key || selectedTemplate.key,
          clientUserId: parseInt(clientId!),
          policyId: sendDocPolicyId ? parseInt(sendDocPolicyId) : undefined,
          personalNote: sendDocNote || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(data.error || 'Failed to send document');
      }
      toast.success(selectedTemplate.requires_approval ? 'Document queued for review' : 'Document sent successfully');
      setShowSendDocSheet(false);
      setSelectedTemplate(null);
      setSendDocPolicyId('');
      setSendDocNote('');
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates/queue', clientId] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send document');
    } finally {
      setSendingDoc(false);
    }
  };

  // ─── DOCUMENT QUEUE ACTIONS ────────────────────────
  const handleApproveDoc = async (queueId: number) => {
    try {
      const res = await fetch(`/api/document-templates/queue/${queueId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success('Document approved and sent');
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates/queue', clientId] });
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
    } catch {
      toast.error('Failed to approve document');
    }
  };

  const handleCancelDoc = async (queueId: number) => {
    try {
      const res = await fetch(`/api/document-templates/queue/${queueId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to cancel');
      toast.success('Document cancelled');
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates/queue', clientId] });
    } catch {
      toast.error('Failed to cancel document');
    }
  };

  // ─── CLAIM STATUS UPDATE WITH DOCUMENT ─────────────
  const handleClaimStatusUpdate = async (claim: Claim, newStatus: string, personalNote: string) => {
    setUpdatingClaimId(claim.id);
    try {
      // Update claim status
      const statusRes = await fetch(`/api/agent-clients/${clientId}/claims/${claim.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!statusRes.ok) throw new Error('Failed to update claim status');

      // Send document notification based on status
      const templateMap: Record<string, string> = {
        approved: 'claim_approval_letter',
        denied: 'claim_denial_letter',
        under_review: 'claim_status_update',
      };

      const templateKey = templateMap[newStatus];
      if (templateKey) {
        try {
          await fetch('/api/document-templates/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              templateKey,
              clientUserId: parseInt(clientId!),
              claimId: claim.id,
              personalNote: personalNote || undefined,
            }),
          });
        } catch {
          // Document sending is non-blocking — notify but don't fail the status update
          toast.error('Status updated but notification failed to send');
        }
      }

      toast.success(`Claim status updated to ${formatStatus(newStatus)}`);
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}/claims`] });
      // Clear the status/note for this claim
      setClaimStatusMap((prev) => { const next = { ...prev }; delete next[claim.id]; return next; });
      setClaimNoteMap((prev) => { const next = { ...prev }; delete next[claim.id]; return next; });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update claim status');
    } finally {
      setUpdatingClaimId(null);
    }
  };

  // ─── COMPUTED ────────────────────────────────────────
  const policies = client?.policies || [];
  const documents = client?.documents || [];
  const billingRecords = client?.billing || [];

  const totalBilling = useMemo(
    () => billingRecords.reduce((s: number, b: any) => s + (parseFloat(b.amount) || 0), 0),
    [billingRecords]
  );

  // ─── ERROR STATE ────────────────────────────────────
  if (error) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">Failed to load client details. Please try again.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] })} variant="outline">
            Retry
          </Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  // ─── LOADING STATE ───────────────────────────────────
  if (isLoading || !client) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-gray-500" style={{ fontSize: TYPE.body }}>Loading client details...</p>
        </div>
      </AgentLoungeLayout>
    );
  }

  const statusColor = getStatusColor(client.onboardingStatus);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Back Link */}
        <motion.div variants={fadeInUp}>
          <Link href="/agents/clients">
            <button
              className="flex items-center gap-1.5 text-violet-600 hover:text-violet-800 transition-colors font-medium"
              style={{ fontSize: TYPE.meta }}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back to Clients
            </button>
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={User}
            title={`${client.firstName} ${client.lastName}`}
            subtitle={`Client since ${formatDate(client.createdAt)}`}
          >
            <Badge
              className={cn(statusColor.bg, statusColor.text, 'border-0')}
              style={{ borderRadius: RADIUS.pill }}
            >
              <div className={cn('w-1.5 h-1.5 rounded-full mr-1.5', statusColor.dot)} />
              {formatStatus(client.onboardingStatus)}
            </Badge>
          </AgentPageHero>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={Shield}
              value={policies.length}
              label="Policies"
              gradient="from-violet-500 to-purple-600"
            />
            <AgentStatCard
              icon={FolderOpen}
              value={documents.length}
              label="Documents"
              gradient="from-blue-500 to-cyan-600"
            />
            <AgentStatCard
              icon={DollarSign}
              value={formatCurrency(totalBilling)}
              label="Total Billing"
              gradient="from-emerald-500 to-teal-600"
            />
            <AgentStatCard
              icon={ClipboardList}
              value={claims.length}
              label="Claims"
              gradient="from-amber-500 to-orange-600"
            />
          </AgentStatCardGrid>
        </motion.div>

        {/* Tabbed Content */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="w-auto justify-start bg-gray-100/80 p-1 gap-1"
              style={{ borderRadius: RADIUS.pill }}
            >
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 text-sm font-medium px-4" style={{ borderRadius: RADIUS.pill }}>Overview</TabsTrigger>
              <TabsTrigger value="policies" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 text-sm font-medium px-4" style={{ borderRadius: RADIUS.pill }}>Policies</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 text-sm font-medium px-4" style={{ borderRadius: RADIUS.pill }}>Documents</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 text-sm font-medium px-4" style={{ borderRadius: RADIUS.pill }}>Billing</TabsTrigger>
              <TabsTrigger value="claims" className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 text-sm font-medium px-4" style={{ borderRadius: RADIUS.pill }}>Claims</TabsTrigger>
            </TabsList>

            {/* ─── OVERVIEW TAB ────────────────────────────── */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="border-0" style={glassCard}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <User className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900">Client Information</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">Personal details and contact info</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                      className="rounded-xl"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {editMode ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">First Name</Label>
                          <Input
                            value={editData.firstName}
                            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Last Name</Label>
                          <Input
                            value={editData.lastName}
                            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs">Full Name</Label>
                        <p className="font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs">Status</Label>
                        <div>
                          <Badge
                            className={cn(statusColor.bg, statusColor.text, 'border-0')}
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            <div className={cn('w-1.5 h-1.5 rounded-full mr-1', statusColor.dot)} />
                            {formatStatus(client.onboardingStatus)}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3" aria-hidden="true" /> Email
                        </Label>
                        <p className="font-medium text-gray-900">{client.email || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3" aria-hidden="true" /> Phone
                        </Label>
                        <p className="font-medium text-gray-900">{client.phone || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" /> Member Since
                        </Label>
                        <p className="font-medium text-gray-900">{formatDate(client.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" /> Last Activity
                        </Label>
                        <p className="font-medium text-gray-900">{formatDate(client.lastActivity)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Login Status & Quick Actions */}
              <Card className="border-0" style={glassCard}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {client.lastLoginAt ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Last login: {new Date(client.lastLoginAt).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-600">Has not logged in yet</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2"
                      onClick={handleResendWelcome}
                      disabled={resending}
                    >
                      <Mail className="w-4 h-4" />
                      {resending ? 'Sending...' : 'Resend Login Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card className="border-0" style={glassCard}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Eye className="w-5 h-5 text-amber-200" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-gray-900">Quick Summary</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">Overview of client account</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-gray-100">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-500" aria-hidden="true" />
                        <span className="text-sm text-gray-700">Active Policies</span>
                      </div>
                      <span className="font-semibold text-gray-900">{policies.filter((p) => p.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        <span className="text-sm text-gray-700">Total Coverage</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(policies.reduce((s, p) => s + (p.coverageAmount || 0), 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" aria-hidden="true" />
                        <span className="text-sm text-gray-700">Monthly Premium</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(policies.reduce((s, p) => s + (p.monthlyPremium || 0), 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-blue-500" aria-hidden="true" />
                        <span className="text-sm text-gray-700">Documents on File</span>
                      </div>
                      <span className="font-semibold text-gray-900">{documents.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── POLICIES TAB ────────────────────────────── */}
            <TabsContent value="policies" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                  Policies ({policies.length})
                </h3>
                <Button
                  onClick={() => setShowPolicyDialog(true)}
                  className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Add Policy
                </Button>
              </div>

              {policies.length === 0 ? (
                <Card className="border-0" style={glassCard}>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="w-10 h-10 text-gray-300 mb-3" aria-hidden="true" />
                    <p className="text-gray-500 text-sm">No policies yet. Add the first policy for this client.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => {
                    const pStatusColor = getStatusColor(policy.status);
                    return (
                      <Card key={policy.id} className="border-0" style={glassCard}>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold text-gray-900">{policy.type}</h4>
                                <Badge
                                  className={cn(pStatusColor.bg, pStatusColor.text, 'border-0 text-xs')}
                                  style={{ borderRadius: RADIUS.pill }}
                                >
                                  {formatStatus(policy.status)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                <div>
                                  <p className="text-xs text-gray-400">Policy #</p>
                                  <p className="text-sm font-medium text-gray-700">{policy.policyNumber || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Carrier</p>
                                  <p className="text-sm font-medium text-gray-700">{policy.carrier || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Coverage</p>
                                  <p className="text-sm font-medium text-gray-700">{formatCurrency(policy.coverageAmount || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Monthly Premium</p>
                                  <p className="text-sm font-medium text-gray-700">{formatCurrency(policy.monthlyPremium || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Start Date</p>
                                  <p className="text-sm font-medium text-gray-700">{formatDate(policy.startDate)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Beneficiary</p>
                                  <p className="text-sm font-medium text-gray-700">
                                    {policy.beneficiaryName ? `${policy.beneficiaryName} (${policy.beneficiaryRelationship || '—'})` : '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── DOCUMENTS TAB ───────────────────────────── */}
            <TabsContent value="documents" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                  Documents ({documents.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowSendDocSheet(true)}
                    className="bg-gradient-to-br from-violet-600 to-amber-500 hover:from-violet-700 hover:to-amber-600 text-white border-0"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                    Send Document
                  </Button>
                  <Button
                    onClick={() => setShowDocDialog(true)}
                    className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    Upload Document
                  </Button>
                </div>
              </div>

              {/* ─── Pending Documents Queue ─────────────────── */}
              {docQueue.filter((q: any) => q.status === 'pending_review').length > 0 && (
                <Card className="border-0 border-l-4 border-l-amber-400" style={glassCard}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Review ({docQueue.filter((q: any) => q.status === 'pending_review').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {docQueue
                      .filter((q: any) => q.status === 'pending_review')
                      .map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.documentName || item.template_key || 'Document'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{formatDate(item.createdAt || item.created_at)}</span>
                              {(item.personalNote || item.personal_note) && (
                                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {(item.personalNote || item.personal_note || '').slice(0, 60)}{(item.personalNote || item.personal_note || '').length > 60 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApproveDoc(item.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-7"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Approve & Send
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelDoc(item.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {documents.length === 0 ? (
                <Card className="border-0" style={glassCard}>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="w-10 h-10 text-gray-300 mb-3" aria-hidden="true" />
                    <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="border-0" style={glassCard}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <Badge
                                className="bg-gray-100 text-gray-600 border-0 text-xs"
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                {formatStatus(doc.category)}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {doc.fileSize ? formatFileSize(doc.fileSize) : ''}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/api/agent-clients/${clientId}/documents/${doc.id}/download`}
                            className="flex-shrink-0"
                            download
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-violet-700 border-violet-200 hover:bg-violet-50"
                              style={{ borderRadius: RADIUS.button }}
                            >
                              <Download className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── BILLING TAB ─────────────────────────────── */}
            <TabsContent value="billing" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                  Billing Records ({billingRecords.length})
                </h3>
                <Button
                  onClick={() => setShowBillingDialog(true)}
                  className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Add Billing Record
                </Button>
              </div>

              {billingRecords.length === 0 ? (
                <Card className="border-0" style={glassCard}>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="w-10 h-10 text-gray-300 mb-3" aria-hidden="true" />
                    <p className="text-gray-500 text-sm">No billing records yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {billingRecords.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{record.billingType || record.billing_type || record.type || 'Premium'}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'border-0 text-xs',
                                record.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                record.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              )}
                              style={{ borderRadius: RADIUS.pill }}
                            >
                              {formatStatus(record.status || 'pending')}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            {(record.bankName || record.bank_name) ? <span>{record.bankName || record.bank_name}</span> : null}
                            {record.description && <span>· {record.description}</span>}
                            {(record.dueDate || record.due_date) && <span>· Due: {new Date(record.dueDate || record.due_date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">${parseFloat(record.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => startEditBilling(record)}>
                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleDeleteBilling(record.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── CLAIMS TAB ─────────────────────────────── */}
            <TabsContent value="claims" className="mt-4 space-y-4">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                Claims ({claims.length})
              </h3>

              {claims.length === 0 ? (
                <Card className="border-0" style={glassCard}>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="w-10 h-10 text-gray-300 mb-3" aria-hidden="true" />
                    <p className="text-gray-500 text-sm">No claims filed for this client.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => {
                    const claimColor = getClaimStatusColor(claim.status);
                    const selectedStatus = claimStatusMap[claim.id] || '';
                    const claimNote = claimNoteMap[claim.id] || '';
                    return (
                      <Card key={claim.id} className="border-0" style={glassCard}>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold text-gray-900">{claim.type}</h4>
                                <Badge
                                  className={cn(claimColor.bg, claimColor.text, 'border-0 text-xs')}
                                  style={{ borderRadius: RADIUS.pill }}
                                >
                                  {formatStatus(claim.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{claim.description || '—'}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Claim #{claim.claimNumber}</span>
                                <span>Filed: {formatDate(claim.filedDate)}</span>
                                <span className="font-medium text-gray-700">{formatCurrency(claim.amount || 0)}</span>
                              </div>

                              {/* ─── Status Update Section ─────────────── */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                  <Label className="text-xs text-gray-500 whitespace-nowrap">Update Status</Label>
                                  <Select
                                    value={selectedStatus}
                                    onValueChange={(val) => setClaimStatusMap((prev) => ({ ...prev, [claim.id]: val }))}
                                  >
                                    <SelectTrigger className="h-8 text-xs w-[160px]" style={{ borderRadius: RADIUS.input }}>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['filed', 'documents_needed', 'under_review', 'approved', 'denied', 'paid'].map((s) => (
                                        <SelectItem key={s} value={s} disabled={s === claim.status}>
                                          {formatStatus(s)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Conditional document notification cards */}
                                {selectedStatus === 'approved' && (
                                  <div
                                    className="mt-3 p-3 bg-emerald-50 border border-emerald-200"
                                    style={{ borderRadius: RADIUS.input }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      <p className="text-sm font-medium text-emerald-800">Claim Approval Letter will be sent to client</p>
                                    </div>
                                    <Textarea
                                      value={claimNote || 'We are pleased to inform you that your claim has been approved.'}
                                      onChange={(e) => setClaimNoteMap((prev) => ({ ...prev, [claim.id]: e.target.value }))}
                                      placeholder="Add a personal message"
                                      className="text-sm bg-white border-emerald-200 min-h-[60px]"
                                      style={{ borderRadius: RADIUS.input }}
                                    />
                                    <Button
                                      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                      style={{ borderRadius: RADIUS.button }}
                                      disabled={updatingClaimId === claim.id}
                                      onClick={() => handleClaimStatusUpdate(
                                        claim,
                                        'approved',
                                        claimNote || 'We are pleased to inform you that your claim has been approved.'
                                      )}
                                    >
                                      {updatingClaimId === claim.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                      ) : (
                                        <><Send className="w-4 h-4 mr-2" />Update Status & Send Letter</>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {selectedStatus === 'denied' && (
                                  <div
                                    className="mt-3 p-3 bg-red-50 border border-red-200"
                                    style={{ borderRadius: RADIUS.input }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <p className="text-sm font-medium text-red-800">Claim Denial Letter will be sent to client</p>
                                    </div>
                                    <Textarea
                                      value={claimNote}
                                      onChange={(e) => setClaimNoteMap((prev) => ({ ...prev, [claim.id]: e.target.value }))}
                                      placeholder="Add a personal message explaining the denial reason"
                                      className="text-sm bg-white border-red-200 min-h-[60px]"
                                      style={{ borderRadius: RADIUS.input }}
                                    />
                                    <Button
                                      className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white border-0"
                                      style={{ borderRadius: RADIUS.button }}
                                      disabled={updatingClaimId === claim.id}
                                      onClick={() => handleClaimStatusUpdate(claim, 'denied', claimNote)}
                                    >
                                      {updatingClaimId === claim.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                      ) : (
                                        <><Send className="w-4 h-4 mr-2" />Update Status & Send Letter</>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {selectedStatus === 'under_review' && (
                                  <div
                                    className="mt-3 p-3 bg-violet-50 border border-violet-200"
                                    style={{ borderRadius: RADIUS.input }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Eye className="w-4 h-4 text-violet-600" />
                                      <p className="text-sm font-medium text-violet-800">Client will be notified of the status change</p>
                                    </div>
                                    <Textarea
                                      value={claimNote}
                                      onChange={(e) => setClaimNoteMap((prev) => ({ ...prev, [claim.id]: e.target.value }))}
                                      placeholder="Add a personal message (optional)"
                                      className="text-sm bg-white border-violet-200 min-h-[60px]"
                                      style={{ borderRadius: RADIUS.input }}
                                    />
                                    <Button
                                      className="mt-2 w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                                      style={{ borderRadius: RADIUS.button }}
                                      disabled={updatingClaimId === claim.id}
                                      onClick={() => handleClaimStatusUpdate(claim, 'under_review', claimNote)}
                                    >
                                      {updatingClaimId === claim.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                      ) : (
                                        <><Send className="w-4 h-4 mr-2" />Update Status & Notify Client</>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {/* Generic status update for statuses without document generation */}
                                {selectedStatus && !['approved', 'denied', 'under_review'].includes(selectedStatus) && (
                                  <Button
                                    className="mt-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                                    style={{ borderRadius: RADIUS.button }}
                                    disabled={updatingClaimId === claim.id}
                                    onClick={() => handleClaimStatusUpdate(claim, selectedStatus, '')}
                                  >
                                    {updatingClaimId === claim.id ? (
                                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                                    ) : (
                                      `Update to ${formatStatus(selectedStatus)}`
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* ─── ADD POLICY DIALOG ──────────────────────────── */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent
          className="sm:max-w-lg border-0"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Add Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Policy Type</Label>
                <Select
                  value={policyForm.type}
                  onValueChange={(val) => setPolicyForm({ ...policyForm, type: val })}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Status</Label>
                <Select
                  value={policyForm.status}
                  onValueChange={(val) => setPolicyForm({ ...policyForm, status: val })}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Policy Number (optional)</Label>
                <Input
                  value={policyForm.policyNumber}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                  placeholder="Auto-generated if blank"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Carrier</Label>
                <Input
                  value={policyForm.carrier}
                  onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                  placeholder="e.g. Nationwide, AIG"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Coverage Amount ($)</Label>
                <Input
                  type="number"
                  value={policyForm.coverageAmount}
                  onChange={(e) => setPolicyForm({ ...policyForm, coverageAmount: e.target.value })}
                  placeholder="e.g. 500000"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Monthly Premium ($)</Label>
                <Input
                  type="number"
                  value={policyForm.monthlyPremium}
                  onChange={(e) => setPolicyForm({ ...policyForm, monthlyPremium: e.target.value })}
                  placeholder="e.g. 75"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Start Date</Label>
              <Input
                type="date"
                value={policyForm.startDate}
                onChange={(e) => setPolicyForm({ ...policyForm, startDate: e.target.value })}
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Beneficiary Name</Label>
                <Input
                  value={policyForm.beneficiaryName}
                  onChange={(e) => setPolicyForm({ ...policyForm, beneficiaryName: e.target.value })}
                  placeholder="Full name"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Relationship</Label>
                <Input
                  value={policyForm.beneficiaryRelationship}
                  onChange={(e) => setPolicyForm({ ...policyForm, beneficiaryRelationship: e.target.value })}
                  placeholder="e.g. Spouse, Child"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => { setShowPolicyDialog(false); resetPolicyForm(); }}
              className="text-gray-600"
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createPolicyMutation.mutate(policyForm)}
              disabled={createPolicyMutation.isPending}
              className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              {createPolicyMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                'Create Policy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── UPLOAD DOCUMENT DIALOG ─────────────────────── */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent
          className="sm:max-w-md border-0"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-gray-900">Document Name</Label>
              <Input
                value={docForm.name}
                onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                placeholder="e.g. Policy Application"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Category</Label>
              <Select
                value={docForm.category}
                onValueChange={(val) => setDocForm({ ...docForm, category: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">File</Label>
              <label className="cursor-pointer block">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => setDocForm({ ...docForm, file: e.target.files?.[0] || null })}
                />
                {docForm.file ? (
                  <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{docForm.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(docForm.file.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={(e) => { e.preventDefault(); setDocForm({ ...docForm, file: null }); }}>
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Click to select a file</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => { setShowDocDialog(false); resetDocForm(); }}
              className="text-gray-600"
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => uploadDocMutation.mutate()}
              disabled={uploadDocMutation.isPending || !docForm.file}
              className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              {uploadDocMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" aria-hidden="true" />Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── SEND DOCUMENT SHEET ──────────────────────── */}
      <Sheet open={showSendDocSheet} onOpenChange={(open) => {
        setShowSendDocSheet(open);
        if (!open) { setSelectedTemplate(null); setSendDocPolicyId(''); setSendDocNote(''); }
      }}>
        <SheetContent className="sm:max-w-md overflow-y-auto" style={{ borderRadius: `${RADIUS.card}px 0 0 ${RADIUS.card}px` }}>
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-violet-600" />
              Send Document
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-6">
            {/* Template Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Document Template</Label>
              <Select
                value={selectedTemplate?.template_key || selectedTemplate?.key || ''}
                onValueChange={(val) => {
                  const tmpl = (templates as any[]).find((t: any) => (t.template_key || t.key) === val);
                  setSelectedTemplate(tmpl || null);
                  setSendDocPolicyId('');
                  setSendDocNote('');
                }}
              >
                <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {(templates as any[]).map((tmpl: any) => (
                    <SelectItem key={tmpl.template_key || tmpl.key} value={tmpl.template_key || tmpl.key}>{tmpl.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Info */}
            {selectedTemplate && (
              <div
                className="p-3 bg-violet-50/50 border border-violet-100"
                style={{ borderRadius: RADIUS.input }}
              >
                <p className="text-sm font-medium text-violet-900">{selectedTemplate.name}</p>
                {selectedTemplate.description && (
                  <p className="text-xs text-violet-600 mt-1">{selectedTemplate.description}</p>
                )}
                {selectedTemplate.requires_approval && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-amber-700 font-medium">Requires manager approval before sending</span>
                  </div>
                )}
              </div>
            )}

            {/* Policy Selector (if template is policy-specific) */}
            {['onboarding', 'annual', 'billing', 'beneficiary'].includes(selectedTemplate?.category) && policies.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Select Policy</Label>
                <Select value={sendDocPolicyId} onValueChange={setSendDocPolicyId}>
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                    <SelectValue placeholder="Choose a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.type} — {p.policyNumber || `#${p.id}`} ({formatStatus(p.status)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Personal Note */}
            {selectedTemplate?.allows_personal_note && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Personal Note</Label>
                <Textarea
                  value={sendDocNote}
                  onChange={(e) => setSendDocNote(e.target.value)}
                  placeholder="Add a personal message (optional)"
                  className="min-h-[80px] text-sm"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            )}

            {/* Actions */}
            {selectedTemplate && (
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full text-violet-700 border-violet-200 hover:bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={() =>
                    window.open(
                      `/api/document-templates/preview/${selectedTemplate.key}/${clientId}${sendDocPolicyId ? `?policyId=${sendDocPolicyId}` : ''}`,
                      '_blank'
                    )
                  }
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-700 hover:to-amber-600 text-white border-0"
                  style={{ borderRadius: RADIUS.button }}
                  disabled={sendingDoc || (['onboarding', 'annual', 'billing', 'beneficiary'].includes(selectedTemplate?.category) && !sendDocPolicyId)}
                  onClick={handleSendDocument}
                >
                  {sendingDoc ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                  ) : selectedTemplate.requires_approval ? (
                    <><Clock className="w-4 h-4 mr-2" />Queue for Review</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Send Document</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── ADD / EDIT BILLING RECORD DIALOG ──────────────────── */}
      <Dialog open={showBillingDialog} onOpenChange={(open) => { setShowBillingDialog(open); if (!open) { resetBillingForm(); } }}>
        <DialogContent
          className="sm:max-w-md border-0"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">{editingBilling ? 'Edit Billing Record' : 'Add Billing Record'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Amount</Label>
                <Input
                  value={billingForm.amount ? `$${billingForm.amount.replace(/\$/g, '').replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[$,\s]/g, '');
                    if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
                      setBillingForm({ ...billingForm, amount: raw });
                    }
                  }}
                  placeholder="$0.00"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Type</Label>
                <Select
                  value={billingForm.type}
                  onValueChange={(val) => setBillingForm({ ...billingForm, type: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bank Selection */}
            <div>
              <Label className="text-xs font-medium">Bank</Label>
              <Select value={billingForm.bankName} onValueChange={(v) => setBillingForm({...billingForm, bankName: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {US_BANKS.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Routing + Account */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Routing Number</Label>
                <Input
                  value={billingForm.routingNumber}
                  onChange={(e) => setBillingForm({...billingForm, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                  placeholder="9-digit routing"
                  maxLength={9}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Account Number</Label>
                <Input
                  value={billingForm.accountNumber}
                  onChange={(e) => setBillingForm({...billingForm, accountNumber: e.target.value.replace(/\D/g, '')})}
                  placeholder="Account number"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                value={billingForm.description}
                onChange={(e) => setBillingForm({ ...billingForm, description: e.target.value })}
                placeholder="e.g. Monthly premium payment"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Due Date</Label>
              <Input
                type="date"
                value={billingForm.dueDate}
                onChange={(e) => setBillingForm({ ...billingForm, dueDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowBillingDialog(false); resetBillingForm(); }} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => createBillingMutation.mutate({ ...billingForm, _editing: editingBilling })}
              disabled={createBillingMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl"
            >
              {createBillingMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingBilling ? 'Updating...' : 'Creating...'}</>
              ) : (
                editingBilling ? 'Update Record' : 'Create Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
