/**
 * ClientBeneficiaries - Beneficiary Management Page
 * Heritage Design System - Violet-to-amber theme
 *
 * All changes (add/edit/delete) go through agent request flow.
 * Client fills out details + message, request is "sent to agent" for processing.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { ClientPageHero } from './primitives/ClientPageHero';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { glassCard } from './clientConstants';
import { usePortalPolicies, type PortalPolicy } from '@/hooks/usePortalData';
import { useAuth } from '@/hooks/use-auth';
import {
  Users, UserPlus, Edit2, Trash2, Shield, Heart, TrendingUp, Flower2,
  X, CheckCircle, Send, AlertTriangle, ChevronDown, type LucideIcon,
} from 'lucide-react';

// ─── POLICY TYPE ICON MAP ───
const POLICY_TYPE_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  'Term Life': { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Whole Life': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  'IUL': { icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
  'Final Expense': { icon: Flower2, color: 'text-amber-600', bg: 'bg-amber-100' },
};

const RELATIONSHIP_OPTIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Other'] as const;

// ─── TYPES ───
type ModalMode = null | 'add' | 'edit' | 'delete';

interface BeneficiaryForm {
  policyId: string;
  type: 'primary' | 'contingent';
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  allocationPercent: number;
  message: string;
}

interface DerivedBeneficiary {
  id: string;
  policyId: string;
  policyNumber: string;
  type: 'primary' | 'contingent';
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  allocationPercent: number;
}

type DemoBeneficiary = DerivedBeneficiary;

const EMPTY_FORM: BeneficiaryForm = {
  policyId: '',
  type: 'primary',
  firstName: '',
  lastName: '',
  relationship: '',
  dateOfBirth: '',
  allocationPercent: 0,
  message: '',
};

// ─── SHARED INPUT STYLES ───
const inputClass = 'w-full bg-white border border-gray-200 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all';

// ─── MODAL OVERLAY ───
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: MOTION.easing }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── SUCCESS CONFIRMATION ───
function SuccessView({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}>
      <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="flex items-center justify-center mb-4"
          style={{
            width: 64, height: 64, borderRadius: RADIUS.pill,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle style={{ width: 32, height: 32, color: 'white' }} />
        </motion.div>
        <p className="font-bold text-gray-900 mb-1" style={{ fontSize: TYPE.title }}>{title}</p>
        <p className="text-gray-500 mb-1" style={{ fontSize: TYPE.body }}>{subtitle}</p>
        <p className="text-gray-400 mb-6" style={{ fontSize: TYPE.caption }}>
          Your agent will review and process your request.
        </p>
        <Button
          onClick={onClose}
          className="font-semibold text-white"
          style={{ borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' }}
        >
          Done
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── MAIN COMPONENT ───
export default function ClientBeneficiaries() {
  const { user } = useAuth();
  const { data: policies = [], isLoading } = usePortalPolicies();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [form, setForm] = useState<BeneficiaryForm>({ ...EMPTY_FORM });
  const [targetBen, setTargetBen] = useState<DemoBeneficiary | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showSuccess, setShowSuccess] = useState<{ title: string; subtitle: string } | null>(null);

  // Derive beneficiaries from policy data (each policy has one beneficiary)
  const derivedBeneficiaries: DerivedBeneficiary[] = policies
    .filter((p) => p.beneficiaryName)
    .map((p) => {
      const nameParts = (p.beneficiaryName ?? '').split(' ');
      return {
        id: `ben-${p.id}`,
        policyId: p.id,
        policyNumber: p.policyNumber,
        type: 'primary' as const,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        relationship: p.beneficiaryRelationship || 'N/A',
        dateOfBirth: '',
        allocationPercent: 100,
      };
    });

  // Group beneficiaries by policyId
  const policiesWithBeneficiaries = policies.map((policy) => {
    const beneficiaries = derivedBeneficiaries.filter((b) => b.policyId === policy.id);
    return { policy, beneficiaries };
  }).filter((g) => g.beneficiaries.length > 0);

  // Allocation helpers
  const getTotalAllocation = (policyId: string, type: 'primary' | 'contingent') => {
    return derivedBeneficiaries
      .filter((b) => b.policyId === policyId && b.type === type)
      .reduce((sum, b) => sum + b.allocationPercent, 0);
  };

  // Open modals
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setModalMode('add');
  };

  const openEdit = (ben: DemoBeneficiary) => {
    setTargetBen(ben);
    setForm({
      policyId: ben.policyId,
      type: ben.type,
      firstName: ben.firstName,
      lastName: ben.lastName,
      relationship: ben.relationship,
      dateOfBirth: ben.dateOfBirth,
      allocationPercent: ben.allocationPercent,
      message: '',
    });
    setModalMode('edit');
  };

  const openDelete = (ben: DemoBeneficiary) => {
    setTargetBen(ben);
    setDeleteReason('');
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setTargetBen(null);
    setForm({ ...EMPTY_FORM });
    setDeleteReason('');
    setShowSuccess(null);
    setSubmitError(null);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Submit beneficiary request to API (sends via chat, notification, and email)
  const submitRequest = async (payload: Record<string, any>, success: { title: string; subtitle: string }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/client-portal/beneficiary-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }
      const data = await res.json();
      // Check if all channels failed despite API success
      if (data.channels && !data.channels.chat && !data.channels.notification && !data.channels.email) {
        setShowSuccess({
          title: 'Request Received',
          subtitle: 'Your request was saved but delivery is pending. Your agent will follow up.',
        });
      } else {
        setShowSuccess(success);
      }
    } catch (err: any) {
      console.error('Beneficiary request failed:', err.message);
      setSubmitError(err.message || 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const policy = policies.find((p) => p.id === form.policyId);
    submitRequest({
      requestType: 'add',
      message: form.message,
      policyId: form.policyId,
      policyNumber: policy?.policyNumber,
      policyType: policy?.type,
      beneficiaryType: form.type,
      firstName: form.firstName,
      lastName: form.lastName,
      relationship: form.relationship,
      dateOfBirth: form.dateOfBirth,
      allocationPercent: form.allocationPercent,
    }, {
      title: 'Request Sent to Agent',
      subtitle: 'Your request to add a new beneficiary has been submitted.',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const policy = policies.find((p) => p.id === form.policyId);
    submitRequest({
      requestType: 'edit',
      message: form.message,
      policyId: form.policyId,
      policyNumber: policy?.policyNumber,
      policyType: policy?.type,
      beneficiaryType: form.type,
      firstName: form.firstName,
      lastName: form.lastName,
      relationship: form.relationship,
      dateOfBirth: form.dateOfBirth,
      allocationPercent: form.allocationPercent,
    }, {
      title: 'Change Request Sent',
      subtitle: `Your request to update ${targetBen?.firstName} ${targetBen?.lastName} has been submitted.`,
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest({
      requestType: 'delete',
      message: deleteReason,
      reason: deleteReason,
      beneficiaryName: `${targetBen?.firstName} ${targetBen?.lastName}`,
      policyNumber: targetBen?.policyNumber,
    }, {
      title: 'Removal Request Sent',
      subtitle: `Your request to remove ${targetBen?.firstName} ${targetBen?.lastName} has been submitted.`,
    });
  };

  // Check if add/edit form is valid
  const isFormValid = form.policyId && form.firstName && form.lastName && form.relationship && form.dateOfBirth && form.allocationPercent > 0 && form.message.trim();

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─── */}
        <ClientPageHero
          icon={Users}
          title="Beneficiaries"
          subtitle="Manage who receives your policy benefits"
        >
          <Button
            onClick={openAdd}
            className="font-semibold text-white hover:opacity-90 gap-2 flex-shrink-0"
            style={{
              borderRadius: RADIUS.button,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <UserPlus size={18} />
            Add Beneficiary
          </Button>
        </ClientPageHero>

        {/* ─── LOADING STATE ─── */}
        {isLoading && (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Loading beneficiaries...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── EMPTY STATE ─── */}
        {!isLoading && policiesWithBeneficiaries.length === 0 && (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="flex items-center justify-center bg-violet-100 mb-4"
                  style={{ width: 64, height: 64, borderRadius: RADIUS.button }}
                >
                  <Users className="text-violet-500" size={28} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: TYPE.title }}>
                  No beneficiaries found
                </h3>
                <p className="text-gray-500 max-w-sm" style={{ fontSize: TYPE.meta }}>
                  Your policies don't have any beneficiaries assigned yet. Click "Add Beneficiary" to request one.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── POLICY-GROUPED BENEFICIARY CARDS ─── */}
        {policiesWithBeneficiaries.map(({ policy, beneficiaries }) => {
          const typeInfo = POLICY_TYPE_ICONS[policy.type] || POLICY_TYPE_ICONS['Term Life'];
          const TypeIcon = typeInfo.icon;

          const primaryBens = beneficiaries.filter((b) => b.type === 'primary');
          const contingentBens = beneficiaries.filter((b) => b.type === 'contingent');
          const primaryTotal = primaryBens.reduce((sum, b) => sum + b.allocationPercent, 0);
          const contingentTotal = contingentBens.reduce((sum, b) => sum + b.allocationPercent, 0);

          return (
            <motion.div key={policy.id} variants={fadeInUp}>
              <Card
                className="border-0 overflow-hidden"
                style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                {/* Policy Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn('flex items-center justify-center flex-shrink-0', typeInfo.bg)}
                      style={{ width: 44, height: 44, borderRadius: RADIUS.button }}
                    >
                      <TypeIcon className={typeInfo.color} size={22} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                        {policy.type}
                      </CardTitle>
                      <p className="text-gray-500 font-mono" style={{ fontSize: TYPE.caption }}>
                        {policy.policyNumber} &middot; ${(policy.coverageAmount / 1000).toLocaleString()}K Coverage
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {beneficiaries.map((ben) => {
                      const isPrimary = ben.type === 'primary';
                      return (
                        <div
                          key={ben.id}
                          className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                          style={{
                            gap: GRID.spacing.sm, padding: GRID.spacing.sm,
                            borderRadius: RADIUS.button, backgroundColor: '#f9fafb',
                          }}
                        >
                          <Badge
                            className={cn(
                              'border-0 font-medium flex-shrink-0',
                              isPrimary ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600',
                            )}
                            style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro, minWidth: 80, justifyContent: 'center' }}
                          >
                            {isPrimary ? 'Primary' : 'Contingent'}
                          </Badge>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {ben.firstName} {ben.lastName}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{ben.relationship}</span>
                              {ben.dateOfBirth && (
                                <>
                                  <span className="text-gray-300">&middot;</span>
                                  <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                    DOB: {new Date(ben.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="font-bold text-gray-900 flex-shrink-0" style={{ fontSize: TYPE.title }}>
                            {ben.allocationPercent}%
                          </p>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => openEdit(ben)}
                              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                              style={{ borderRadius: RADIUS.input }}
                              aria-label={`Edit ${ben.firstName} ${ben.lastName}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => openDelete(ben)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              style={{ borderRadius: RADIUS.input }}
                              aria-label={`Remove ${ben.firstName} ${ben.lastName}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Allocation summary bars */}
                  <div className="mt-4 space-y-2">
                    {primaryBens.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>Primary Allocation</span>
                          <span className={cn('font-semibold', primaryTotal === 100 ? 'text-emerald-600' : 'text-amber-600')} style={{ fontSize: TYPE.caption }}>
                            {primaryTotal}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 overflow-hidden" style={{ height: 6, borderRadius: RADIUS.pill }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(primaryTotal, 100)}%` }}
                            transition={{ duration: 0.6, ease: MOTION.easing }}
                            className={primaryTotal === 100 ? 'bg-emerald-500' : 'bg-amber-500'}
                            style={{ height: '100%', borderRadius: RADIUS.pill }}
                          />
                        </div>
                      </div>
                    )}
                    {contingentBens.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>Contingent Allocation</span>
                          <span className={cn('font-semibold', contingentTotal === 100 ? 'text-emerald-600' : 'text-amber-600')} style={{ fontSize: TYPE.caption }}>
                            {contingentTotal}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 overflow-hidden" style={{ height: 6, borderRadius: RADIUS.pill }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(contingentTotal, 100)}%` }}
                            transition={{ duration: 0.6, ease: MOTION.easing }}
                            className={contingentTotal === 100 ? 'bg-emerald-500' : 'bg-amber-500'}
                            style={{ height: '100%', borderRadius: RADIUS.pill }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          MODALS
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalMode && (
          <ModalOverlay onClose={closeModal}>
            {showSuccess ? (
              <SuccessView title={showSuccess.title} subtitle={showSuccess.subtitle} onClose={closeModal} />
            ) : modalMode === 'delete' ? (
              /* ─── DELETE MODAL ─── */
              <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                      <div
                        className="flex items-center justify-center bg-red-100"
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <AlertTriangle className="text-red-600" size={20} />
                      </div>
                      Request Beneficiary Removal
                    </CardTitle>
                    <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" style={{ borderRadius: RADIUS.input }}>
                      <X size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {targetBen && (
                    <form onSubmit={handleDeleteSubmit} className="space-y-4">
                      {/* Error banner */}
                      {submitError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700" style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.input, fontSize: TYPE.meta }}>
                          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">Request failed</p>
                            <p style={{ fontSize: TYPE.caption }}>{submitError}</p>
                          </div>
                          <button type="button" onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        </div>
                      )}
                      {/* Beneficiary info summary */}
                      <div
                        className="flex items-center gap-3"
                        style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                            {targetBen.firstName} {targetBen.lastName}
                          </p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                            {targetBen.type === 'primary' ? 'Primary' : 'Contingent'} &middot; {targetBen.relationship} &middot; {targetBen.allocationPercent}% allocation
                          </p>
                          <p className="text-gray-400 font-mono" style={{ fontSize: TYPE.caption }}>
                            {targetBen.policyNumber}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                          Reason for removal <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          placeholder="Please describe why you'd like to remove this beneficiary (e.g., divorce, updated estate plan, etc.)"
                          rows={3}
                          className={cn(inputClass, 'resize-none')}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          required
                        />
                      </div>

                      <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        This request will be sent to your agent for review. Beneficiary changes require carrier processing and may take 5-10 business days.
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          type="submit"
                          disabled={!deleteReason.trim() || isSubmitting}
                          className="font-semibold text-white gap-2"
                          style={{
                            borderRadius: RADIUS.button,
                            background: deleteReason.trim() && !isSubmitting ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : '#d1d5db',
                          }}
                        >
                          {isSubmitting ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                          ) : (
                            <><Send size={16} /> Send Removal Request</>
                          )}
                        </Button>
                        <Button type="button" variant="outline" className="text-gray-600" style={{ borderRadius: RADIUS.button }} onClick={closeModal}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* ─── ADD / EDIT MODAL ─── */
              <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        {modalMode === 'add' ? <UserPlus className="text-amber-200" size={20} /> : <Edit2 className="text-amber-200" size={20} />}
                      </div>
                      {modalMode === 'add' ? 'Add New Beneficiary' : 'Edit Beneficiary'}
                    </CardTitle>
                    <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" style={{ borderRadius: RADIUS.input }}>
                      <X size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <form onSubmit={modalMode === 'add' ? handleAddSubmit : handleEditSubmit} className="space-y-4">
                    {/* Error banner */}
                    {submitError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700" style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.input, fontSize: TYPE.meta }}>
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">Request failed</p>
                          <p style={{ fontSize: TYPE.caption }}>{submitError}</p>
                        </div>
                        <button type="button" onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    )}
                    {/* Policy Select */}
                    <div>
                      <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Policy</label>
                      <div className="relative">
                        <select
                          value={form.policyId}
                          onChange={(e) => setForm({ ...form, policyId: e.target.value })}
                          className={cn(inputClass, 'appearance-none pr-10 cursor-pointer')}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          required
                          disabled={modalMode === 'edit'}
                        >
                          <option value="">Select a policy</option>
                          {policies.map((p) => (
                            <option key={p.id} value={p.id}>{p.type} - {p.policyNumber}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Type Toggle */}
                    <div>
                      <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Beneficiary Type</label>
                      <div className="flex gap-2">
                        {(['primary', 'contingent'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, type: t })}
                            className={cn(
                              'px-4 py-2 font-medium transition-all flex-1',
                              form.type === t
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200',
                            )}
                            style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>First Name</label>
                        <input
                          type="text" required
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          className={inputClass}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Last Name</label>
                        <input
                          type="text" required
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          className={inputClass}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    {/* Relationship + DOB */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Relationship</label>
                        <div className="relative">
                          <select
                            value={form.relationship}
                            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                            className={cn(inputClass, 'appearance-none pr-10 cursor-pointer')}
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                            required
                          >
                            <option value="">Select</option>
                            {RELATIONSHIP_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Date of Birth</label>
                        <input
                          type="date" required
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className={inputClass}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Allocation */}
                    <div>
                      <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>Allocation %</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number" required
                          min={1} max={100}
                          value={form.allocationPercent || ''}
                          onChange={(e) => setForm({ ...form, allocationPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                          className={cn(inputClass, 'w-24')}
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          placeholder="0"
                        />
                        <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>%</span>
                        {form.policyId && (
                          <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                            Current {form.type} total: {getTotalAllocation(form.policyId, form.type)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message to Agent */}
                    <div>
                      <label className="block font-medium text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                        Message to Agent <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={modalMode === 'add'
                          ? 'Describe why you are adding this beneficiary (e.g., newborn child, marriage, etc.)'
                          : 'Describe the changes you are requesting and why'}
                        rows={3}
                        className={cn(inputClass, 'resize-none')}
                        style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        required
                      />
                    </div>

                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                      This request will be sent to your agent for review. Beneficiary changes require carrier processing and may take 5-10 business days.
                    </p>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="font-semibold text-white gap-2"
                        style={{
                          borderRadius: RADIUS.button,
                          background: isFormValid && !isSubmitting ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : '#d1d5db',
                        }}
                      >
                        {isSubmitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={16} /> {modalMode === 'add' ? 'Send Request to Agent' : 'Send Change Request'}</>
                        )}
                      </Button>
                      <Button type="button" variant="outline" className="text-gray-600" style={{ borderRadius: RADIUS.button }} onClick={closeModal}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </ModalOverlay>
        )}
      </AnimatePresence>
    </ClientLoungeLayout>
  );
}
