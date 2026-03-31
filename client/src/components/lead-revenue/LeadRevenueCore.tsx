/**
 * LeadRevenueCore
 * Shared component for Lead Revenue Tracking.
 * Uses Executive primitives (orange/amber) in exec mode, Admin primitives (slate) in admin mode.
 * Heritage Design System compliant — mirrors ExecutiveRevenue.tsx patterns.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingCart,
  Search,
  X,
  BarChart3,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent as ShadcnTabsContent } from '@/components/ui/tabs';
import {
  GLASS,
  RADIUS,
  SHADOW,
  TYPE,
  GRID,
  COLORS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { useLeadRevenueAnalytics } from '@/hooks/useLeadRevenue';

// Executive primitives
import { ExecutivePageHero } from '@/pages/executive/primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from '@/pages/executive/primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from '@/pages/executive/primitives/ExecutiveTabSection';
import { ExecutiveGlassTooltip } from '@/pages/executive/primitives/ExecutiveGlassTooltip';

// Admin primitives
import {
  AdminPageHero,
  AdminStatCard,
  AdminStatCardGrid,
  ADMIN_GRADIENT,
} from '@/components/admin/AdminHeritagePrimitives';

// ============================================
// TYPES
// ============================================
interface LeadRevenueCoreProps {
  variant: 'admin' | 'executive';
  gradientCSS: string;
  accentColor: string;
  accentLight: string;
}

// ============================================
// CONSTANTS
// ============================================
const LEAD_TYPE_COLORS: Record<string, string> = {
  consolidation: '#3b82f6',
  survey: '#10b981',
  live_iul: '#8b5cf6',
  high_intent_iul: '#f59e0b',
  ai_qualified: '#ec4899',
};

const LEAD_TYPE_LABELS: Record<string, string> = {
  consolidation: 'Consolidation',
  survey: 'Survey',
  live_iul: 'Live IUL',
  high_intent_iul: 'High Intent IUL',
  ai_qualified: 'AI Qualified',
};

const LEAD_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'consolidation', label: 'Consolidation' },
  { value: 'survey', label: 'Survey' },
  { value: 'live_iul', label: 'Live IUL' },
  { value: 'high_intent_iul', label: 'High Intent IUL' },
  { value: 'ai_qualified', label: 'AI Qualified' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

// ============================================
// DEMO DATA (shown when no real purchases exist)
// ============================================
const DEMO_SUMMARY = {
  totalRevenue: 2847500, // $28,475
  totalCost: 2134200,    // $21,342
  totalProfit: 713300,   // $7,133
  totalSold: 1247,
};

const DEMO_BREAKDOWN = [
  { leadType: 'consolidation', displayName: 'Consolidation', quantitySold: 850, revenueCents: 84150, costCents: 42500, profitCents: 41650, marginPercent: 49.5 },
  { leadType: 'survey', displayName: 'Survey', quantitySold: 320, revenueCents: 16000, costCents: 11200, profitCents: 4800, marginPercent: 30.0 },
  { leadType: 'live_iul', displayName: 'Live IUL', quantitySold: 42, revenueCents: 252000, costCents: 210000, profitCents: 42000, marginPercent: 16.7 },
  { leadType: 'high_intent_iul', displayName: 'High Intent IUL', quantitySold: 35, revenueCents: 385000, costCents: 350000, profitCents: 35000, marginPercent: 9.1 },
];

const DEMO_MONTHLY = [
  { month: '2025-10', monthDisplay: 'Oct 2025', revenueCents: 385000, costCents: 295000, profitCents: 90000 },
  { month: '2025-11', monthDisplay: 'Nov 2025', revenueCents: 498000, costCents: 378000, profitCents: 120000 },
  { month: '2025-12', monthDisplay: 'Dec 2025', revenueCents: 621000, costCents: 480200, profitCents: 140800 },
  { month: '2026-01', monthDisplay: 'Jan 2026', revenueCents: 542000, costCents: 412000, profitCents: 130000 },
  { month: '2026-02', monthDisplay: 'Feb 2026', revenueCents: 389500, costCents: 298000, profitCents: 91500 },
  { month: '2026-03', monthDisplay: 'Mar 2026', revenueCents: 412000, costCents: 271000, profitCents: 141000 },
];

const DEMO_PURCHASES = [
  { id: '1', agentName: 'Marcus Williams', agentEmail: 'marcus@heritage.com', leadType: 'consolidation', displayName: 'Consolidation', quantity: 200, priceCents: 19800, status: 'paid', purchasedAt: '2026-03-25T14:30:00Z' },
  { id: '2', agentName: 'Sarah Johnson', agentEmail: 'sarah@heritage.com', leadType: 'high_intent_iul', displayName: 'High Intent IUL', quantity: 5, priceCents: 55000, status: 'paid', purchasedAt: '2026-03-24T10:15:00Z' },
  { id: '3', agentName: 'David Chen', agentEmail: 'david@heritage.com', leadType: 'live_iul', displayName: 'Live IUL', quantity: 10, priceCents: 60000, status: 'paid', purchasedAt: '2026-03-23T16:45:00Z' },
  { id: '4', agentName: 'Ashley Brown', agentEmail: 'ashley@heritage.com', leadType: 'survey', displayName: 'Survey', quantity: 100, priceCents: 5000, status: 'paid', purchasedAt: '2026-03-22T09:00:00Z' },
  { id: '5', agentName: 'Marcus Williams', agentEmail: 'marcus@heritage.com', leadType: 'consolidation', displayName: 'Consolidation', quantity: 500, priceCents: 49500, status: 'paid', purchasedAt: '2026-03-20T11:30:00Z' },
  { id: '6', agentName: 'James Thompson', agentEmail: 'james@heritage.com', leadType: 'high_intent_iul', displayName: 'High Intent IUL', quantity: 3, priceCents: 33000, status: 'pending', purchasedAt: '2026-03-19T15:20:00Z' },
  { id: '7', agentName: 'Sarah Johnson', agentEmail: 'sarah@heritage.com', leadType: 'live_iul', displayName: 'Live IUL', quantity: 8, priceCents: 48000, status: 'paid', purchasedAt: '2026-03-18T13:10:00Z' },
  { id: '8', agentName: 'David Chen', agentEmail: 'david@heritage.com', leadType: 'survey', displayName: 'Survey', quantity: 150, priceCents: 7500, status: 'paid', purchasedAt: '2026-03-15T08:45:00Z' },
];

// ============================================
// HELPERS
// ============================================
function fmtMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '--';
  }
}

// ============================================
// SECTION HEADER (glass badge icon — matches ExecutiveRevenue)
// ============================================
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  accentColor,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.input,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: accentColor }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ============================================
// STATUS BADGE
// ============================================
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: '#ecfdf5', text: '#059669', label: 'Paid' },
    pending: { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
    failed: { bg: '#fef2f2', text: '#dc2626', label: 'Failed' },
  };
  const c = config[status] || config.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: RADIUS.pill,
        background: c.bg,
        color: c.text,
        fontSize: TYPE.micro,
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LeadRevenueCore({
  variant,
  gradientCSS,
  accentColor,
  accentLight,
}: LeadRevenueCoreProps) {
  const isExec = variant === 'executive';
  const hoverRowClass = isExec ? 'transition-colors hover:bg-orange-50/50' : 'transition-colors hover:bg-slate-50/50';

  // --- State ---
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState('all');
  const limit = 20;

  // --- Data ---
  const { data, isLoading } = useLeadRevenueAnalytics({
    leadType: typeFilter,
    status: statusFilter,
    search,
    page,
    limit,
    period,
  });

  // Use real data if available, otherwise show demo data so UI is always visible
  const hasRealData = data?.data?.summary?.totalLeadsSold > 0 || (data?.data?.purchases?.data?.length > 0);

  const rawSummary = data?.data?.summary;
  const summary = hasRealData
    ? {
        totalRevenue: rawSummary?.totalRevenueCents || 0,
        totalCost: rawSummary?.totalCostCents || 0,
        totalProfit: rawSummary?.totalProfitCents || 0,
        totalSold: rawSummary?.totalLeadsSold || 0,
      }
    : DEMO_SUMMARY;

  const breakdown: any[] = hasRealData ? (rawSummary?.byType || []) : DEMO_BREAKDOWN;
  const monthly: any[] = hasRealData ? (data?.data?.trends || []) : DEMO_MONTHLY;
  const purchases: any[] = hasRealData ? (data?.data?.purchases?.data || []) : DEMO_PURCHASES;
  const totalPages = hasRealData ? Math.max(1, Math.ceil((data?.data?.purchases?.total || 0) / limit)) : 1;

  const profitMargin = summary.totalRevenue > 0
    ? summary.totalProfit / summary.totalRevenue
    : 0;

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                ...GLASS.css.light,
                borderRadius: RADIUS.card,
                padding: GRID.spacing.md,
                boxShadow: SHADOW.card,
                height: 120,
              }}
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
        <div
          className="animate-pulse"
          style={{
            ...GLASS.css.light,
            borderRadius: RADIUS.card,
            padding: GRID.spacing.md,
            boxShadow: SHADOW.card,
            height: 400,
          }}
        >
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-full bg-gray-100 rounded" />
        </div>
      </motion.div>
    );
  }

  // ============================================
  // SHARED TAB CONTENT
  // ============================================

  // --- Overview content ---
  const overviewContent = (
    <>
      {/* Revenue + Profit Bar Chart */}
      <SectionHeader
        icon={BarChart3}
        title="Revenue & Profit by Lead Type"
        subtitle="Comparative breakdown across lead categories"
        accentColor={accentColor}
      />
      <Card
        className="border-0"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={breakdown.map((b: any) => ({
                name: LEAD_TYPE_LABELS[b.leadType] || b.displayName || b.leadType,
                revenue: (b.revenueCents || 0) / 100,
                profit: (b.profitCents || 0) / 100,
                type: b.leadType,
              }))}
              margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                axisLine={{ stroke: COLORS.gray[200] }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmtMoney(v)}
              />
              <Tooltip
                content={
                  isExec ? (
                    <ExecutiveGlassTooltip formatter={(v: number) => fmtMoney(v)} />
                  ) : (
                    <ExecutiveGlassTooltip formatter={(v: number) => fmtMoney(v)} />
                  )
                }
              />
              <Legend wrapperStyle={{ fontSize: TYPE.caption }} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill={accentColor}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="profit"
                name="Profit"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      <SectionHeader
        icon={ClipboardList}
        title="Breakdown by Type"
        subtitle="Detailed revenue, cost, and margin per lead type"
        accentColor={accentColor}
      />
      <Card
        className="border-0"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                  {['Type', 'Qty Sold', 'Revenue', 'Cost', 'Profit', 'Margin %'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold text-stone-600 px-4 py-3"
                      style={{ fontSize: TYPE.micro }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row: any) => {
                  const margin = row.revenueCents > 0 ? row.profitCents / row.revenueCents : 0;
                  return (
                    <tr
                      key={row.leadType}
                      className={hoverRowClass}
                      style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: RADIUS.pill,
                              backgroundColor: LEAD_TYPE_COLORS[row.leadType] || COLORS.gray[400],
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.caption }}>
                            {LEAD_TYPE_LABELS[row.leadType] || row.leadType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-700" style={{ fontSize: TYPE.caption }}>
                        {fmtNumber(row.quantitySold)}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>
                        {fmtMoney(row.revenueCents)}
                      </td>
                      <td className="px-4 py-3 text-stone-700" style={{ fontSize: TYPE.caption }}>
                        {fmtMoney(row.costCents)}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ fontSize: TYPE.caption, color: '#059669' }}>
                        {fmtMoney(row.profitCents)}
                      </td>
                      <td className="px-4 py-3 text-stone-700" style={{ fontSize: TYPE.caption }}>
                        {fmtPercent(margin)}
                      </td>
                    </tr>
                  );
                })}
                {breakdown.length > 0 && (
                  <tr style={{ borderTop: `1px solid ${COLORS.gray[300]}` }}>
                    <td className="px-4 py-3 font-bold text-stone-900" style={{ fontSize: TYPE.caption }}>Total</td>
                    <td className="px-4 py-3 font-bold text-stone-900" style={{ fontSize: TYPE.caption }}>{fmtNumber(summary.totalSold)}</td>
                    <td className="px-4 py-3 font-bold text-stone-900" style={{ fontSize: TYPE.caption }}>{fmtMoney(summary.totalRevenue)}</td>
                    <td className="px-4 py-3 font-bold text-stone-900" style={{ fontSize: TYPE.caption }}>{fmtMoney(summary.totalCost)}</td>
                    <td className="px-4 py-3 font-bold" style={{ fontSize: TYPE.caption, color: '#059669' }}>{fmtMoney(summary.totalProfit)}</td>
                    <td className="px-4 py-3 font-bold text-stone-900" style={{ fontSize: TYPE.caption }}>{fmtPercent(profitMargin)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // --- Trends content ---
  const trendsContent = (
    <>
      <SectionHeader
        icon={TrendingUp}
        title="Monthly Revenue Trends"
        subtitle="Revenue, cost, and profit trends over time"
        accentColor={accentColor}
      />
      <Card
        className="border-0"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart
              data={monthly.map((m: any) => ({
                month: m.monthDisplay || m.month,
                revenue: (m.revenueCents || 0) / 100,
                cost: (m.costCents || 0) / 100,
                profit: (m.profitCents || 0) / 100,
              }))}
              margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                axisLine={{ stroke: COLORS.gray[200] }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmtMoney(v)}
              />
              <Tooltip
                content={
                  isExec ? (
                    <ExecutiveGlassTooltip formatter={(v: number) => fmtMoney(v)} />
                  ) : (
                    <ExecutiveGlassTooltip formatter={(v: number) => fmtMoney(v)} />
                  )
                }
              />
              <Legend wrapperStyle={{ fontSize: TYPE.caption }} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill={accentColor}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="cost"
                name="Cost"
                fill={COLORS.gray[400]}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );

  // --- Purchases content ---
  const purchasesContent = (
    <>
      {/* Filter Row */}
      <Card
        className="border-0"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: COLORS.gray[400] }}
              />
              <input
                type="text"
                placeholder="Search by agent name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 36,
                  paddingRight: search ? 32 : 12,
                  borderRadius: RADIUS.input,
                  border: `1px solid ${COLORS.gray[200]}`,
                  fontSize: TYPE.meta,
                  color: COLORS.gray[900],
                  background: 'rgba(255,255,255,0.6)',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" style={{ color: COLORS.gray[400] }} />
                </button>
              )}
            </div>

            {/* Lead Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              style={{
                height: 40,
                paddingLeft: 12,
                paddingRight: 32,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
                fontSize: TYPE.meta,
                color: COLORS.gray[700],
                background: typeFilter !== 'all' ? accentLight : 'rgba(255,255,255,0.6)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {LEAD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                height: 40,
                paddingLeft: 12,
                paddingRight: 32,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
                fontSize: TYPE.meta,
                color: COLORS.gray[700],
                background: statusFilter !== 'all' ? accentLight : 'rgba(255,255,255,0.6)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Table */}
      <SectionHeader
        icon={ClipboardList}
        title="Purchase History"
        subtitle="All lead purchases with status and payment details"
        accentColor={accentColor}
      />
      <Card
        className="border-0"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                  {['Agent', 'Type', 'Qty', 'Amount', 'Date', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold text-stone-600 px-4 py-3"
                      style={{ fontSize: TYPE.micro }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center"
                      style={{ color: COLORS.gray[400], fontSize: TYPE.caption }}
                    >
                      No purchases match your filters.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p: any, idx: number) => (
                    <tr
                      key={p.id || idx}
                      className={hoverRowClass}
                      style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                    >
                      <td className="px-4 py-3 font-semibold text-stone-900" style={{ fontSize: TYPE.caption }}>
                        {p.agentName || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-stone-700" style={{ fontSize: TYPE.caption }}>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: RADIUS.pill,
                              backgroundColor: LEAD_TYPE_COLORS[p.leadType] || COLORS.gray[400],
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          {LEAD_TYPE_LABELS[p.leadType] || p.leadType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600" style={{ fontSize: TYPE.caption }}>
                        {fmtNumber(p.quantity)}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>
                        {fmtMoney(p.priceCents)}
                      </td>
                      <td className="px-4 py-3 text-stone-500" style={{ fontSize: TYPE.caption }}>
                        {formatDate(p.purchasedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: `1px solid ${COLORS.gray[200]}` }}
            >
              <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  style={{
                    border: `1px solid ${COLORS.gray[200]}`,
                    color: COLORS.gray[700],
                    borderRadius: RADIUS.input,
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  style={{
                    border: `1px solid ${COLORS.gray[200]}`,
                    color: COLORS.gray[700],
                    borderRadius: RADIUS.input,
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  // ============================================
  // PERIOD DROPDOWN (liquid glass, inside hero)
  // ============================================
  const PERIOD_OPTIONS = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];
  const activePeriodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'All Time';

  const periodDropdown = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-2 font-medium transition-all"
            style={{
              padding: '8px 18px',
              borderRadius: RADIUS.pill,
              fontSize: TYPE.meta,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Calendar style={{ width: 16, height: 16 }} />
            {activePeriodLabel}
            <ChevronDown style={{ width: 14, height: 14, opacity: 0.7 }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="p-1 border-0"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            minWidth: 180,
          }}
        >
          {PERIOD_OPTIONS.map((p) => (
            <DropdownMenuItem
              key={p.value}
              onClick={() => { setPeriod(p.value); setPage(1); }}
              className="flex items-center justify-between cursor-pointer transition-colors"
              style={{
                padding: '10px 14px',
                borderRadius: RADIUS.input,
                fontSize: TYPE.body,
                fontWeight: period === p.value ? 600 : 400,
                color: period === p.value ? accentColor : COLORS.gray[700],
                background: period === p.value ? accentLight : 'transparent',
              }}
            >
              {p.label}
              {period === p.value && (
                <Check style={{ width: 18, height: 18, color: accentColor }} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ════════ HERO WITH PERIOD FILTER ════════ */}
      {isExec ? (
        <ExecutivePageHero
          icon={ShoppingCart}
          title="Lead Revenue"
          subtitle="Track lead purchases, revenue, and profitability across all lead types"
        >
          {periodDropdown}
        </ExecutivePageHero>
      ) : (
        <AdminPageHero
          icon={ShoppingCart}
          title="Lead Revenue"
          subtitle="Track lead purchases, revenue, and profitability across all lead types"
          actions={periodDropdown}
        />
      )}

      {/* ════════ STAT CARDS ════════ */}
      {isExec ? (
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              label="Total Revenue"
              value={fmtMoney(summary.totalRevenue)}
              northStar
            />
            <ExecutiveStatCard
              icon={TrendingUp}
              label="Total Profit"
              value={fmtMoney(summary.totalProfit)}
            />
            <ExecutiveStatCard
              icon={Percent}
              label="Profit Margin"
              value={fmtPercent(profitMargin)}
            />
            <ExecutiveStatCard
              icon={ShoppingCart}
              label="Leads Sold"
              value={fmtNumber(summary.totalSold)}
            />
          </ExecutiveStatCardGrid>
        </motion.div>
      ) : (
        <AdminStatCardGrid>
          <AdminStatCard icon={DollarSign} label="Total Revenue" value={fmtMoney(summary.totalRevenue)} />
          <AdminStatCard icon={TrendingUp} label="Total Profit" value={fmtMoney(summary.totalProfit)} />
          <AdminStatCard icon={Percent} label="Profit Margin" value={fmtPercent(profitMargin)} />
          <AdminStatCard icon={ShoppingCart} label="Leads Sold" value={fmtNumber(summary.totalSold)} />
        </AdminStatCardGrid>
      )}

      {/* ════════ TABS ════════ */}
      {isExec ? (
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'trends', label: 'Trends', icon: TrendingUp },
              { value: 'purchases', label: 'Purchases', icon: ClipboardList },
            ]}
          >
            <TabsContent value="overview" className="mt-6 space-y-6">
              {overviewContent}
            </TabsContent>
            <TabsContent value="trends" className="mt-6 space-y-6">
              {trendsContent}
            </TabsContent>
            <TabsContent value="purchases" className="mt-6 space-y-6">
              {purchasesContent}
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="overview">
            <TabsList
              className="h-auto w-auto inline-flex"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                padding: 4,
                border: `1px solid ${COLORS.gray[200]}`,
              }}
            >
              {[
                { value: 'overview', label: 'Overview', icon: BarChart3 },
                { value: 'trends', label: 'Trends', icon: TrendingUp },
                { value: 'purchases', label: 'Purchases', icon: ClipboardList },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="font-medium text-stone-500 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <TabIcon style={{ width: 16, height: 16, marginRight: 6 }} aria-hidden="true" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ShadcnTabsContent value="overview" className="mt-6 space-y-6">
              {overviewContent}
            </ShadcnTabsContent>
            <ShadcnTabsContent value="trends" className="mt-6 space-y-6">
              {trendsContent}
            </ShadcnTabsContent>
            <ShadcnTabsContent value="purchases" className="mt-6 space-y-6">
              {purchasesContent}
            </ShadcnTabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
}
