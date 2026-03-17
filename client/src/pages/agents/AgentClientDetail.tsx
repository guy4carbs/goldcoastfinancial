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

import { useState, useMemo, useRef, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ChevronLeft, Upload, Download, Plus, Loader2,
  CheckCircle, AlertTriangle, XCircle, Calendar,
  ClipboardList, CreditCard, FolderOpen, Eye,
} from 'lucide-react';

// ─── CONSTANTS ─────────────────────────────────────────
const POLICY_TYPES = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Annuity'] as const;
const POLICY_STATUSES = ['pending_setup', 'active', 'lapsed', 'expired'] as const;
const DOC_CATEGORIES = ['policy_document', 'id_verification', 'application', 'statement', 'correspondence'] as const;

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
    category: 'policy_document' as string,
    file: null as File | null,
  });

  // ─── Billing form state ─────────────────────────────
  const [billingForm, setBillingForm] = useState({
    amount: '',
    type: 'premium',
    description: '',
    dueDate: '',
  });

  // ─── QUERIES ─────────────────────────────────────────
  const { data: client, isLoading } = useQuery<Client>({
    queryKey: [`/api/agent-clients/${clientId}`],
    enabled: !!clientId,
  });

  const { data: claims = [] } = useQuery<Claim[]>({
    queryKey: [`/api/agent-clients/${clientId}/claims`],
    enabled: !!clientId && activeTab === 'claims',
  });

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
    mutationFn: async (data: typeof billingForm) => {
      const res = await apiRequest('POST', `/api/agent-clients/${clientId}/billing`, {
        ...data,
        amount: parseFloat(data.amount) || 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-clients/${clientId}`] });
      setShowBillingDialog(false);
      resetBillingForm();
      toast.success('Billing record created successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create billing record: ${err.message}`);
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
    setDocForm({ name: '', category: 'policy_document', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const resetBillingForm = useCallback(() => {
    setBillingForm({ amount: '', type: 'premium', description: '', dueDate: '' });
  }, []);

  // ─── COMPUTED ────────────────────────────────────────
  const policies = client?.policies || [];
  const documents = client?.documents || [];
  const billingRecords = client?.billing || [];

  const totalBilling = useMemo(
    () => billingRecords.reduce((s, b) => s + (b.amount || 0), 0),
    [billingRecords]
  );

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
            <Card className="border-0" style={glassCard}>
              <CardContent className="p-4 pb-0">
                <TabsList
                  className="w-full justify-start bg-gray-100/80 p-1"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <TabsTrigger value="overview" style={{ borderRadius: RADIUS.input }}>Overview</TabsTrigger>
                  <TabsTrigger value="policies" style={{ borderRadius: RADIUS.input }}>Policies</TabsTrigger>
                  <TabsTrigger value="documents" style={{ borderRadius: RADIUS.input }}>Documents</TabsTrigger>
                  <TabsTrigger value="billing" style={{ borderRadius: RADIUS.input }}>Billing</TabsTrigger>
                  <TabsTrigger value="claims" style={{ borderRadius: RADIUS.input }}>Claims</TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

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
                    <div>
                      <span className="text-gray-900">Client Information</span>
                      <p className="text-sm font-normal text-gray-500 mt-0.5">Personal details and contact info</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
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
                <Button
                  onClick={() => setShowDocDialog(true)}
                  className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                  Upload Document
                </Button>
              </div>

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
                  {billingRecords.map((record) => (
                    <Card key={record.id} className="border-0" style={glassCard}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <DollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{record.description || record.type}</p>
                              <Badge
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
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                              <span>Due: {formatDate(record.dueDate)}</span>
                              {record.paidDate && <span>Paid: {formatDate(record.paidDate)}</span>}
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 flex-shrink-0" style={{ fontSize: TYPE.body }}>
                            {formatCurrency(record.amount || 0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── CLAIMS TAB (READ-ONLY) ──────────────────── */}
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
                <SelectTrigger style={{ borderRadius: RADIUS.input }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{formatStatus(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setDocForm({ ...docForm, file: e.target.files?.[0] || null })}
                style={{ borderRadius: RADIUS.input }}
              />
              {docForm.file && (
                <p className="text-xs text-gray-500">
                  Selected: {docForm.file.name} ({formatFileSize(docForm.file.size)})
                </p>
              )}
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

      {/* ─── ADD BILLING RECORD DIALOG ──────────────────── */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent
          className="sm:max-w-md border-0"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Add Billing Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Amount ($)</Label>
                <Input
                  type="number"
                  value={billingForm.amount}
                  onChange={(e) => setBillingForm({ ...billingForm, amount: e.target.value })}
                  placeholder="e.g. 150.00"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Type</Label>
                <Select
                  value={billingForm.type}
                  onValueChange={(val) => setBillingForm({ ...billingForm, type: val })}
                >
                  <SelectTrigger style={{ borderRadius: RADIUS.input }}>
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
            <div className="space-y-2">
              <Label className="text-gray-900">Description</Label>
              <Input
                value={billingForm.description}
                onChange={(e) => setBillingForm({ ...billingForm, description: e.target.value })}
                placeholder="e.g. Monthly premium payment"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Due Date</Label>
              <Input
                type="date"
                value={billingForm.dueDate}
                onChange={(e) => setBillingForm({ ...billingForm, dueDate: e.target.value })}
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => { setShowBillingDialog(false); resetBillingForm(); }}
              className="text-gray-600"
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createBillingMutation.mutate(billingForm)}
              disabled={createBillingMutation.isPending}
              className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              {createBillingMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                'Create Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
