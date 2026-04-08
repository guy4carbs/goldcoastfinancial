/**
 * ClientPolicyDetail — Single Policy Detail View
 * Heritage Design System — Violet-to-amber theme
 *
 * Coverage details, beneficiaries, payment history, and related documents
 * for a specific policy identified by route param.
 */

import { motion } from 'framer-motion';
import { useRoute, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { CLIENT_GRADIENT_CSS, glassCard, POLICY_STATUS_COLORS, PAYMENT_STATUS_COLORS, fmtCurrency } from './clientConstants';
import { usePortalPolicy, usePortalBilling, usePortalDocuments } from '@/hooks/usePortalData';
import { Shield, Heart, TrendingUp, Flower2, ArrowLeft, FileText, DollarSign, Users, Calendar, Download, type LucideIcon } from 'lucide-react';

// ─── POLICY TYPE ICON MAP ───
const POLICY_TYPE_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  'Term Life': { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Whole Life': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  'IUL': { icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
  'Final Expense': { icon: Flower2, color: 'text-amber-600', bg: 'bg-amber-100' },
};

export default function ClientPolicyDetail() {
  const [match, params] = useRoute('/client/policies/:id');

  // Fetch policy, billing, and documents via API hooks
  const { data: policy, isLoading: policyLoading } = usePortalPolicy(params?.id);
  const { data: allBilling = [] } = usePortalBilling();
  const { data: allDocuments = [] } = usePortalDocuments();

  // Show loading state
  if (policyLoading) {
    return (
      <ClientLoungeLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Loading policy details...</p>
        </div>
      </ClientLoungeLayout>
    );
  }

  // If not found, show error state
  if (!policy) {
    return (
      <ClientLoungeLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div
            className="flex items-center justify-center bg-gray-100 mb-4"
            style={{ width: 64, height: 64, borderRadius: RADIUS.button }}
          >
            <Shield className="text-gray-400" size={28} />
          </div>
          <h2
            className="font-semibold text-gray-900 mb-2"
            style={{ fontSize: TYPE.title }}
          >
            Policy Not Found
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm" style={{ fontSize: TYPE.meta }}>
            The policy you're looking for doesn't exist or may have been removed.
          </p>
          <Button
            variant="outline"
            className="text-violet-600 border-violet-200 hover:bg-violet-50 gap-2"
            style={{ borderRadius: RADIUS.button }}
            asChild
          >
            <Link href="/client/policies">
              <ArrowLeft size={16} />
              Back to Policies
            </Link>
          </Button>
        </motion.div>
      </ClientLoungeLayout>
    );
  }

  const typeInfo = POLICY_TYPE_ICONS[policy.type] || POLICY_TYPE_ICONS['Term Life'];
  const TypeIcon = typeInfo.icon;
  const statusColors = POLICY_STATUS_COLORS[policy.status] || POLICY_STATUS_COLORS.active;

  // Get related data filtered by this policy
  const payments = allBilling.filter((b) => b.policyId === policy.id);
  const documents = allDocuments.filter((d) => d.policyId === policy.id);

  // Build beneficiary list: prefer JSONB array, fallback to legacy single fields
  const beneficiaries = (() => {
    if (Array.isArray(policy.beneficiaries) && policy.beneficiaries.length > 0) {
      return policy.beneficiaries.map((b, idx) => ({
        id: `ben-${policy.id}-${idx}`,
        type: 'primary' as const,
        firstName: (b.name || '').split(' ')[0] || '',
        lastName: (b.name || '').split(' ').slice(1).join(' ') || '',
        relationship: b.relationship || 'N/A',
        allocationPercent: b.percentage || 0,
      }));
    }
    if (policy.beneficiaryName) {
      return [{
        id: `ben-${policy.id}`,
        type: 'primary' as const,
        firstName: policy.beneficiaryName.split(' ')[0] || '',
        lastName: policy.beneficiaryName.split(' ').slice(1).join(' ') || '',
        relationship: policy.beneficiaryRelationship || 'N/A',
        allocationPercent: 100,
      }];
    }
    return [];
  })();

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─── */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden"
          style={{
            background: CLIENT_GRADIENT_CSS,
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.lg,
          }}
        >
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Decorative floating circles */}
          <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" style={{ width: 356, height: 356, borderRadius: RADIUS.pill }} />
          <div className="absolute top-1/2 right-1/4 bg-amber-400/15 blur-sm" style={{ width: 136, height: 136, borderRadius: RADIUS.pill }} />

          <div className="relative z-10">
            {/* Back button */}
            <Link href="/client/policies">
              <motion.div
                whileHover={{ x: -2 }}
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer mb-4"
                style={{ fontSize: TYPE.meta }}
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Back to Policies</span>
              </motion.div>
            </Link>

            <div className="flex items-start gap-4">
              {/* 80px Liquid Glass Icon Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: GRID.spacing.xxxxl,
                  height: GRID.spacing.xxxxl,
                  borderRadius: RADIUS.card,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <TypeIcon
                  className="text-amber-200 drop-shadow-sm"
                  style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                  aria-hidden="true"
                />
              </motion.div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1
                    className="font-bold tracking-tight text-white font-serif"
                    style={{ fontSize: TYPE.display, lineHeight: 1.1 }}
                  >
                    {policy.policyNumber}
                  </h1>
                  <Badge
                    className={cn('border-0 font-medium', statusColors.bg, statusColors.text)}
                    style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                  >
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', statusColors.dot)} />
                    {(policy.status || 'active').charAt(0).toUpperCase() + (policy.status || 'active').slice(1)}
                  </Badge>
                </div>
                <p className="text-white/90" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                  {policy.type} &middot; {policy.carrier}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── COVERAGE DETAILS ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="font-semibold flex items-center gap-3 text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <Shield className="text-amber-200" size={20} />
                </div>
                Coverage Details
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <div>
                  <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                    Coverage Amount
                  </p>
                  <p className="text-gray-900 font-bold" style={{ fontSize: TYPE.title }}>
                    {fmtCurrency(policy.coverageAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                    Monthly Premium
                  </p>
                  <p className="text-gray-900 font-bold" style={{ fontSize: TYPE.title }}>
                    ${policy.monthlyPremium}/mo
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                    Start Date
                  </p>
                  <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {policy.startDate}
                  </p>
                </div>
                {policy.endDate && (
                  <div>
                    <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                      End Date
                    </p>
                    <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                      {policy.endDate}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                    Next Payment
                  </p>
                  <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {policy.nextPaymentDate ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                    Auto-Pay
                  </p>
                  <Badge
                    className={cn(
                      'border-0 font-medium',
                      policy.autoPayEnabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500',
                    )}
                    style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                  >
                    {policy.autoPayEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {policy.cashValue && (
                  <div>
                    <p className="text-gray-400 font-medium mb-1" style={{ fontSize: TYPE.micro }}>
                      Cash Value
                    </p>
                    <p className="text-violet-600 font-bold" style={{ fontSize: TYPE.title }}>
                      {fmtCurrency(policy.cashValue)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── BENEFICIARIES ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="font-semibold flex items-center gap-3 text-gray-900"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Users className="text-amber-200" size={20} />
                  </div>
                  Beneficiaries
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-violet-600 border-violet-200 hover:bg-violet-50 font-medium"
                  style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                  asChild
                >
                  <Link href="/client/beneficiaries">
                    Manage
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {beneficiaries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {beneficiaries.map((ben) => {
                    const isPrimary = ben.type === 'primary';
                    return (
                      <div
                        key={ben.id}
                        className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        {/* Type badge */}
                        <Badge
                          className={cn(
                            'border-0 font-medium flex-shrink-0',
                            isPrimary
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-gray-100 text-gray-600',
                          )}
                          style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                        >
                          {isPrimary ? 'Primary' : 'Contingent'}
                        </Badge>

                        {/* Name & relationship */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {ben.firstName} {ben.lastName}
                          </p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                            {ben.relationship}
                          </p>
                        </div>

                        {/* Allocation */}
                        <p className="font-bold text-gray-900 flex-shrink-0" style={{ fontSize: TYPE.body }}>
                          {ben.allocationPercent}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                    No beneficiaries assigned to this policy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── PAYMENT HISTORY ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="font-semibold flex items-center gap-3 text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <DollarSign className="text-amber-200" size={20} />
                </div>
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {payments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {payments.map((payment) => {
                    const paymentStatusColors = PAYMENT_STATUS_COLORS[payment.status] || PAYMENT_STATUS_COLORS.paid;
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        {/* Date */}
                        <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: 100 }}>
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                            {payment.date}
                          </span>
                        </div>

                        {/* Method */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>
                            {payment.paymentMethod}
                          </p>
                        </div>

                        {/* Status badge */}
                        <Badge
                          className={cn(
                            'border-0 font-medium flex-shrink-0',
                            paymentStatusColors.bg,
                            paymentStatusColors.text,
                          )}
                          style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                        >
                          <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', paymentStatusColors.dot)} />
                          {(payment.status || 'pending').charAt(0).toUpperCase() + (payment.status || 'pending').slice(1)}
                        </Badge>

                        {/* Amount */}
                        <p className="font-bold text-gray-900 flex-shrink-0" style={{ fontSize: TYPE.meta }}>
                          ${payment.amount}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                    No payment history for this policy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── RELATED DOCUMENTS ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="font-semibold flex items-center gap-3 text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <FileText className="text-amber-200" size={20} />
                </div>
                Related Documents
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {documents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      {/* Document icon */}
                      <div
                        className="flex items-center justify-center bg-blue-100 flex-shrink-0"
                        style={{ width: 36, height: 36, borderRadius: RADIUS.input }}
                      >
                        <FileText className="text-blue-600" size={18} />
                      </div>

                      {/* Name & date */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {doc.name}
                          </p>
                          {doc.isNew && (
                            <Badge
                              className="border-0 bg-violet-100 text-violet-700 font-medium"
                              style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {doc.date} &middot; {doc.fileSize}
                        </p>
                      </div>

                      {/* Download button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-violet-700 hover:border-violet-300 gap-1.5 flex-shrink-0"
                        style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                        onClick={() => window.open(`/api/portal/documents/${doc.id}/download`, '_blank')}
                      >
                        <Download size={14} />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                    No documents for this policy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
