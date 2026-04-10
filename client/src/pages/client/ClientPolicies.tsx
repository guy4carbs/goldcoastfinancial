/**
 * ClientPolicies -My Policies Listing Page
 * Heritage Design System -Violet-to-amber theme
 *
 * Full-featured policy listing with filter tabs, glass card rows,
 * type icons, status badges, and action buttons.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, staggerCards, GRID } from '@/lib/heritageDesignSystem';
import { CLIENT_GRADIENT_CSS, glassCard, POLICY_STATUS_COLORS, fmtCurrency } from './clientConstants';
import { usePortalPolicies, type PortalPolicy } from '@/hooks/usePortalData';
import { Shield, Heart, TrendingUp, Flower2, FileText, Download, MessageSquare, ChevronRight, Filter, Search, type LucideIcon } from 'lucide-react';

// ─── POLICY TYPE ICON MAP ───
const POLICY_TYPE_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  'Term Life': { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Whole Life': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  'IUL': { icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
  'Final Expense': { icon: Flower2, color: 'text-amber-600', bg: 'bg-amber-100' },
};

// ─── FILTER TABS ───
type FilterStatus = 'all' | 'active' | 'pending' | 'expired';

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Expired', value: 'expired' },
];

// ─── PDF DOWNLOAD HELPER ───
function downloadPolicyPDF(policy: PortalPolicy) {
  const html = `
<!DOCTYPE html>
<html><head>
<title>${policy.type} -${policy.policyNumber}</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; }
  .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; color: #7c3aed; font-size: 28px; }
  .header p { margin: 0; color: #666; font-size: 14px; }
  .badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .active { background: #dcfce7; color: #166534; }
  .pending { background: #fef9c3; color: #854d0e; }
  .expired { background: #fee2e2; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
  .section-title { font-size: 18px; color: #7c3aed; margin: 28px 0 8px; border-bottom: 1px solid #ede9fe; padding-bottom: 6px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
<div class="header">
  <h1>Heritage Life Solutions</h1>
  <p>Policy Summary Document</p>
</div>
<h2 style="margin:0 0 4px">${policy.type} <span class="badge ${policy.status}">${policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}</span></h2>
<p style="color:#666;margin:0 0 16px">${policy.carrier}</p>
<table>
  <tr><th>Policy Number</th><td>${policy.policyNumber}</td></tr>
  <tr><th>Coverage Amount</th><td>${fmtCurrency(policy.coverageAmount)}</td></tr>
  <tr><th>Monthly Premium</th><td>$${policy.monthlyPremium}/mo</td></tr>
  <tr><th>Start Date</th><td>${policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td></tr>
  ${policy.endDate ? `<tr><th>End Date</th><td>${policy.endDate}</td></tr>` : ''}
  <tr><th>Next Payment</th><td>${policy.nextPaymentDate ? new Date(policy.nextPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td></tr>
  <tr><th>Auto-Pay</th><td>${policy.autoPayEnabled ? 'Enabled' : 'Disabled'}</td></tr>
  ${policy.cashValue ? `<tr><th>Cash Value</th><td>${fmtCurrency(policy.cashValue)}</td></tr>` : ''}
</table>
<h3 class="section-title">Beneficiary</h3>
<table>
  <tr><th>Name</th><td>${policy.beneficiaryName}</td></tr>
</table>
<div class="footer">
  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} -Heritage Life Solutions &copy; ${new Date().getFullYear()}
  <br/>This is a summary document. For official policy documents, please contact your agent.
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function ClientPolicies() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [, setLocation] = useLocation();
  const { data: policies = [], isLoading } = usePortalPolicies();

  // Filter policies based on active tab
  const filteredPolicies = policies.filter((policy) => {
    if (activeFilter === 'all') return true;
    return policy.status === activeFilter;
  });

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

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon badge */}
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
                <Shield
                  className="text-amber-200 drop-shadow-sm"
                  style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                  aria-hidden="true"
                />
              </motion.div>

              <div className="flex-1">
                <h1
                  className="font-bold tracking-tight text-white font-serif"
                  style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}
                >
                  My Policies
                </h1>
                <p className="text-white/90 max-w-xl" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                  Manage and review your insurance coverage
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── FILTER TABS ─── */}
        <motion.div variants={fadeInUp}>
          <div
            className="inline-flex items-center bg-gray-100/80 p-1 gap-1"
            style={{ borderRadius: RADIUS.pill }}
          >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-violet-600',
                )}
                style={{ borderRadius: RADIUS.pill }}
              >
                {tab.label}
              </button>
            );
          })}
          </div>
        </motion.div>

        {/* ─── POLICY CARDS ─── */}
        <motion.div variants={staggerCards} className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                key="loading"
                variants={fadeInUp}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card
                  className="border-0"
                  style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Loading your policies...</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => {
                const typeInfo = POLICY_TYPE_ICONS[policy.type] || POLICY_TYPE_ICONS['Term Life'];
                const TypeIcon = typeInfo.icon;
                const statusColors = POLICY_STATUS_COLORS[policy.status] || POLICY_STATUS_COLORS.active;

                return (
                  <motion.div
                    key={policy.id}
                    variants={fadeInUp}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -2, boxShadow: SHADOW.level3 }}
                    transition={{ duration: MOTION.duration.hover }}
                  >
                    <Card
                      className="border-0 overflow-hidden"
                      style={{
                        ...glassCard,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row lg:items-center">
                          {/* Left: Type icon */}
                          <div className="flex items-center gap-4 p-5 lg:p-6 lg:pr-0 lg:min-w-[60px]">
                            <div
                              className={cn('flex items-center justify-center flex-shrink-0', typeInfo.bg)}
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: RADIUS.button,
                              }}
                            >
                              <TypeIcon className={typeInfo.color} size={24} aria-hidden="true" />
                            </div>
                          </div>

                          {/* Main content */}
                          <div className="flex-1 px-5 pb-5 lg:p-6">
                            {/* Row 1: Type + Status */}
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <span
                                className="font-semibold text-gray-900"
                                style={{ fontSize: TYPE.body }}
                              >
                                {policy.type}
                              </span>
                              <Badge
                                className={cn(
                                  'border-0 font-medium',
                                  statusColors.bg,
                                  statusColors.text,
                                )}
                                style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                              >
                                <span
                                  className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', statusColors.dot)}
                                />
                                {(policy.status || 'active').charAt(0).toUpperCase() + (policy.status || 'active').slice(1)}
                              </Badge>
                            </div>

                            {/* Row 2: Policy number + Carrier */}
                            <div className="flex items-center gap-3 flex-wrap mb-3">
                              <span
                                className="font-bold text-gray-800 font-mono"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {policy.policyNumber}
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                                {policy.carrier}
                              </span>
                            </div>

                            {/* Row 3: Detail grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                              <div>
                                <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Coverage</p>
                                <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                                  {fmtCurrency(policy.coverageAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Premium</p>
                                <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                                  ${policy.monthlyPremium}/mo
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Start Date</p>
                                <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                                  {policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Next Payment</p>
                                <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                                  {policy.nextPaymentDate ? new Date(policy.nextPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Beneficiary</p>
                                <p className="text-gray-900 font-semibold" style={{ fontSize: TYPE.meta }}>
                                  {policy.beneficiaryName ?? 'Not assigned'}
                                </p>
                              </div>
                              {policy.cashValue && (
                                <div>
                                  <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>Cash Value</p>
                                  <p className="text-violet-600 font-semibold" style={{ fontSize: TYPE.meta }}>
                                    {fmtCurrency(policy.cashValue)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Action buttons */}
                          <div className="flex lg:flex-col items-center lg:items-end gap-2 px-5 pb-5 lg:p-6 lg:pl-0 lg:min-w-[180px]">
                            <Button
                              size="sm"
                              className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 flex-1 lg:flex-none lg:w-full"
                              style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                              onClick={() => setLocation(`/client/policies/${policy.id}`)}
                            >
                              <FileText size={14} />
                              View Details
                              <ChevronRight size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-violet-700 hover:border-violet-300 gap-1.5 flex-1 lg:flex-none lg:w-full"
                              style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                              onClick={() => downloadPolicyPDF(policy)}
                            >
                              <Download size={14} />
                              Download PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-violet-700 hover:border-violet-300 gap-1.5 flex-1 lg:flex-none lg:w-full"
                              style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                              onClick={() => setLocation('/client/messages')}
                            >
                              <MessageSquare size={14} />
                              Contact Agent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              /* ─── EMPTY STATE ─── */
              <motion.div
                key="empty"
                variants={fadeInUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card
                  className="border-0"
                  style={{
                    ...glassCard,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div
                      className="flex items-center justify-center bg-violet-100 mb-4"
                      style={{ width: 64, height: 64, borderRadius: RADIUS.button }}
                    >
                      <Filter className="text-violet-500" size={28} />
                    </div>
                    <h3
                      className="font-semibold text-gray-900 mb-2"
                      style={{ fontSize: TYPE.title }}
                    >
                      No {activeFilter !== 'all' ? activeFilter : ''} policies found
                    </h3>
                    <p className="text-gray-500 max-w-sm" style={{ fontSize: TYPE.meta }}>
                      {activeFilter !== 'all'
                        ? `You don't have any ${activeFilter} policies. Try selecting a different filter.`
                        : 'No policies are associated with your account yet.'}
                    </p>
                    {activeFilter !== 'all' && (
                      <Button
                        variant="outline"
                        className="mt-4 text-violet-600 border-violet-200 hover:bg-violet-50"
                        style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        onClick={() => setActiveFilter('all')}
                      >
                        View All Policies
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
