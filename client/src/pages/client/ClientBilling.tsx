/**
 * Client Billing & Payments Page
 * Heritage Design System -Violet-to-Amber theme
 * Glass cards, framer-motion animations, Heritage tokens
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { ClientPageHero } from './primitives/ClientPageHero';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, staggerCards, GRID } from '@/lib/heritageDesignSystem';
import { glassCard, PAYMENT_STATUS_COLORS, fmtCurrency } from './clientConstants';
import { usePortalBilling, usePortalPolicies } from '@/hooks/usePortalData';
import { Landmark, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download, Filter, Building2, Plus, ChevronDown, type LucideIcon } from 'lucide-react';

// ─── STAT CARD ─────────────────────────────────────────
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <motion.div
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
        className="relative overflow-hidden"
        style={{
          borderRadius: RADIUS.card,
          padding: GRID.spacing.md,
          boxShadow: SHADOW.hero,
          background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)',
          color: 'white',
        }}
      >
        {/* Icon badge */}
        <div
          className="flex items-center justify-center mb-3"
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.button,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Icon style={{ width: 20, height: 20, color: 'white' }} />
        </div>

        {/* Label */}
        <p
          className="font-medium"
          style={{ fontSize: TYPE.caption, opacity: 0.85, marginBottom: 4 }}
        >
          {label}
        </p>

        {/* Value */}
        <p className="font-bold" style={{ fontSize: TYPE.section }}>
          {value}
        </p>

        {/* Sub text */}
        {sub && (
          <p style={{ fontSize: TYPE.micro, opacity: 0.7, marginTop: 2 }}>
            {sub}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── US BANK BRAND REGISTRY ───────────────────────────
// Logo domains for Clearbit logo API + brand colors as fallback
const BANK_BRANDS: Record<string, { name: string; domain: string; color: string }> = {
  'bank_of_america': { name: 'Bank of America', domain: 'bankofamerica.com', color: '#c41230' },
  'chase':           { name: 'Chase', domain: 'chase.com', color: '#117aca' },
  'wells_fargo':     { name: 'Wells Fargo', domain: 'wellsfargo.com', color: '#cd1409' },
  'fifth_third':     { name: 'Fifth Third Bank', domain: '53.com', color: '#003d6b' },
  'us_bank':         { name: 'U.S. Bank', domain: 'usbank.com', color: '#c8102e' },
  'pnc':             { name: 'PNC Bank', domain: 'pnc.com', color: '#f47920' },
  'td_bank':         { name: 'TD Bank', domain: 'td.com', color: '#34a853' },
  'capital_one':     { name: 'Capital One', domain: 'capitalone.com', color: '#c8102e' },
  'citibank':        { name: 'Citibank', domain: 'citigroup.com', color: '#003b70' },
  'truist':          { name: 'Truist', domain: 'truist.com', color: '#5c2d91' },
  'ally':            { name: 'Ally Bank', domain: 'ally.com', color: '#7d3f98' },
  'regions':         { name: 'Regions Bank', domain: 'regions.com', color: '#007a33' },
  'huntington':      { name: 'Huntington Bank', domain: 'huntington.com', color: '#00693e' },
  'bmo':             { name: 'BMO', domain: 'bmo.com', color: '#0075be' },
  'navy_federal':    { name: 'Navy Federal CU', domain: 'navyfederal.org', color: '#003366' },
  'usaa':            { name: 'USAA', domain: 'usaa.com', color: '#1b3a5c' },
  'schwab':          { name: 'Charles Schwab', domain: 'schwab.com', color: '#00a0df' },
  'sofi':            { name: 'SoFi', domain: 'sofi.com', color: '#00d4aa' },
};

function BankLogo({ bankKey, size = 36 }: { bankKey: string; size?: number }) {
  const brand = BANK_BRANDS[bankKey];
  if (!brand) {
    return (
      <div
        className="flex items-center justify-center flex-shrink-0 bg-gray-100"
        style={{ width: size + 16, height: size, borderRadius: RADIUS.input }}
      >
        <Building2 style={{ width: size * 0.45, height: size * 0.45 }} className="text-gray-400" />
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 overflow-hidden"
      style={{ width: size + 16, height: size, borderRadius: RADIUS.input, padding: 4 }}
    >
      <img
        src={`https://logo.clearbit.com/${brand.domain}`}
        alt={brand.name}
        className="object-contain"
        style={{ width: '100%', height: '100%' }}
        onError={(e) => {
          // Fallback to colored text badge if logo fails to load
          const target = e.currentTarget;
          const parent = target.parentElement;
          if (parent) {
            parent.style.background = brand.color;
            parent.style.border = 'none';
            parent.innerHTML = `<span style="color:white;font-weight:700;font-size:11px;letter-spacing:-0.3px">${brand.name.split(' ')[0]}</span>`;
          }
        }}
      />
    </div>
  );
}


// ─── FILTER OPTIONS ────────────────────────────────────
const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '3months', label: 'Last 3 months' },
  { value: '6months', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]['value'];

// ─── MAIN COMPONENT ───────────────────────────────────
export default function ClientBilling() {
  const { data: billing = [], isLoading: billingLoading } = usePortalBilling();
  const { data: policies = [], isLoading: policiesLoading } = usePortalPolicies();
  const [historyFilter, setHistoryFilter] = useState<FilterValue>('all');

  const isLoading = billingLoading || policiesLoading;

  // Compute stats
  const activePolicies = policies.filter((p) => p.status === 'active');
  const totalMonthly = activePolicies.reduce((sum, p) => sum + p.monthlyPremium, 0);
  const autoPayCount = activePolicies.filter((p) => p.autoPayEnabled).length;
  // Compute YTD from actual paid billing records in current year
  const currentYear = new Date().getFullYear();
  const ytdAmount = billing
    .filter((b) => b.status === 'paid' && new Date(b.date).getFullYear() === currentYear)
    .reduce((sum, b) => sum + b.amount, 0);

  // Pending / upcoming payments
  const upcomingPayments = billing.filter((b) => b.status === 'pending');

  // Next payment date from upcoming or from active policies
  const nextPaymentDate = upcomingPayments.length > 0
    ? new Date(upcomingPayments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : activePolicies[0]?.nextPaymentDate ?? 'N/A';

  // Filtered payment history
  const filteredHistory = (() => {
    const sorted = [...billing].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (historyFilter === 'all') return sorted;

    const now = new Date();
    let cutoff: Date;

    switch (historyFilter) {
      case '3months':
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case '6months':
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case 'year':
        cutoff = new Date('2026-01-01');
        break;
      default:
        return sorted;
    }

    return sorted.filter((b) => new Date(b.date) >= cutoff);
  })();

  // CSV download placeholder
  const handleDownloadCSV = () => {
    const header = 'Date,Policy,Type,Amount,Status,Method';
    const rows = filteredHistory.map(
      (b) => `${b.date},${b.policyNumber},${b.policyType},$${b.amount},${b.status},${b.paymentMethod}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─────────────────────────────────────── */}
        <ClientPageHero
          icon={Landmark}
          title="Billing & Payments"
          subtitle="Manage your premiums and payment history"
        />

        {/* ─── LOADING STATE ─── */}
        {isLoading && (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Loading billing data...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── STAT CARDS ───────────────────────────────── */}
        <motion.div
          variants={staggerCards}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={DollarSign}
            label="Total Monthly"
            value={`$${totalMonthly}/mo`}
            sub={`${activePolicies.length} active policies`}
          />
          <StatCard
            icon={Calendar}
            label="Next Payment"
            value={nextPaymentDate}
            sub={autoPayCount > 0 ? 'Auto-pay scheduled' : 'Manual payment'}
          />
          <StatCard
            icon={CheckCircle}
            label="Auto-Pay"
            value="Active"
            sub={`${autoPayCount} of ${activePolicies.length} policies`}
          />
          <StatCard
            icon={DollarSign}
            label="Year-to-Date"
            value={fmtCurrency(ytdAmount)}
            sub={`${currentYear} year-to-date`}
          />
        </motion.div>

        {/* ─── UPCOMING PAYMENTS ────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0"
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                <Clock style={{ width: 20, height: 20 }} className="text-violet-600" />
                Upcoming Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-8" style={{ fontSize: TYPE.body }}>
                  No upcoming payments
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingPayments.map((payment) => {
                    const policy = policies.find((p) => p.id === payment.policyId);
                    return (
                      <motion.div
                        key={payment.id}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.04)' }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                            }}
                          >
                            <Landmark style={{ width: 18, height: 18 }} className="text-violet-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {payment.policyType} -{policy?.carrier}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {payment.policyNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                              ${payment.amount}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Due {payment.date}
                            </p>
                          </div>
                          <div className="hidden md:block">
                            {policy?.autoPayEnabled ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-pay
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Manual
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            disabled
                            className="text-white border-0"
                            style={{
                              background: '#d1d5db',
                              borderRadius: RADIUS.button,
                              cursor: 'not-allowed',
                            }}
                            title="Online payments coming soon"
                          >
                            Pay Now
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── PAYMENT HISTORY ──────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0"
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                  <DollarSign style={{ width: 20, height: 20 }} className="text-violet-600" />
                  Payment History
                </CardTitle>
                <div className="flex items-center gap-3">
                  {/* Filter dropdown */}
                  <div className="relative flex items-center gap-2">
                    <Filter style={{ width: 14, height: 14 }} className="text-gray-400" />
                    <div className="relative">
                      <select
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value as FilterValue)}
                        className="appearance-none bg-white border border-gray-200 pl-3 pr-8 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                        style={{ borderRadius: RADIUS.input, fontSize: TYPE.caption }}
                      >
                        {FILTER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* Download CSV */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCSV}
                    className="gap-1.5 text-gray-600 border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Download style={{ width: 14, height: 14 }} />
                    <span className="hidden sm:inline">Download CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 mb-1">
                <p className="font-semibold text-gray-400 uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                  Date
                </p>
                <p className="font-semibold text-gray-400 uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                  Policy
                </p>
                <p className="font-semibold text-gray-400 uppercase tracking-wider text-right" style={{ fontSize: TYPE.micro }}>
                  Amount
                </p>
                <p className="font-semibold text-gray-400 uppercase tracking-wider text-center" style={{ fontSize: TYPE.micro }}>
                  Status
                </p>
                <p className="font-semibold text-gray-400 uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                  Method
                </p>
              </div>

              {/* Table rows */}
              <div className="space-y-1">
                {filteredHistory.map((bill) => {
                  const statusColor = PAYMENT_STATUS_COLORS[bill.status] || PAYMENT_STATUS_COLORS.pending;
                  return (
                    <motion.div
                      key={bill.id}
                      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.04)' }}
                      transition={{ duration: MOTION.duration.hover }}
                      className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-center px-4 py-3"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      {/* Date */}
                      <p className="text-gray-900 font-medium" style={{ fontSize: TYPE.meta }}>
                        {bill.date}
                      </p>

                      {/* Policy */}
                      <div>
                        <p className="text-gray-900 font-medium" style={{ fontSize: TYPE.meta }}>
                          {bill.policyType}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {bill.policyNumber}
                        </p>
                      </div>

                      {/* Amount */}
                      <p className="text-gray-900 font-bold md:text-right" style={{ fontSize: TYPE.body }}>
                        ${bill.amount}
                      </p>

                      {/* Status */}
                      <div className="md:text-center">
                        <Badge className={cn(statusColor.bg, statusColor.text, 'hover:opacity-90 border-0 gap-1')}>
                          <div className={cn('w-1.5 h-1.5 rounded-full', statusColor.dot)} />
                          {(bill.status || 'pending').charAt(0).toUpperCase() + (bill.status || 'pending').slice(1)}
                        </Badge>
                      </div>

                      {/* Method / Bank */}
                      <div className="truncate">
                        {bill.bankName && (
                          <p className="text-gray-900 font-medium" style={{ fontSize: TYPE.caption }}>{bill.bankName}</p>
                        )}
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {bill.billingType || bill.paymentMethod || '—'}
                        </p>
                        {bill.description && (
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{bill.description}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredHistory.length === 0 && (
                <p className="text-gray-500 text-center py-8" style={{ fontSize: TYPE.body }}>
                  No payment records found for this period
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── PAYMENT METHODS ──────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0"
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                  <Landmark style={{ width: 20, height: 20 }} className="text-violet-600" />
                  Bank Accounts (ACH)
                </CardTitle>
                <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                  Life insurance premiums are paid via ACH bank draft
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Landmark style={{ width: 36, height: 36 }} className="text-gray-300 mb-3" />
                <p className="font-semibold text-gray-500" style={{ fontSize: TYPE.body }}>
                  No payment methods configured
                </p>
                <p className="text-gray-400 mt-1" style={{ fontSize: TYPE.caption }}>
                  ACH bank draft setup will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
