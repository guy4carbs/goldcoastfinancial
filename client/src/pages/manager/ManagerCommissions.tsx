/**
 * Manager Commissions Page
 * Track earnings, payouts, and commission structures across the team.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_AGENT_COMMISSIONS,
  DEMO_PAYOUT_TIMELINE,
  glassCard,
  SPARKLINE_COMMISSIONS_PENDING,
  SPARKLINE_COMMISSIONS_PAID,
  SPARKLINE_CLAWBACK,
  SPARKLINE_CONTRACT_LEVEL,
} from './managerConstants';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Percent,
  ChevronDown,
  ChevronUp,

  Download,
  Calendar,
  BarChart3,
} from 'lucide-react';

/* ── Period filter options ─────────────────────────────────── */

const PERIOD_OPTIONS = ['This Month', 'This Quarter', 'YTD'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── Sorted data ──────────────────────────────────────────── */

const sortedAgents = [...DEMO_AGENT_COMMISSIONS].sort((a, b) => b.paidYTD - a.paidYTD);

/* ── Computed stats ───────────────────────────────────────── */

const totalPending = sortedAgents.reduce((sum, a) => sum + a.pending, 0);
const totalPaidYTD = sortedAgents.reduce((sum, a) => sum + a.paidYTD, 0);
const totalClawback = sortedAgents.reduce((sum, a) => sum + a.clawbackRisk, 0);
const avgContractLevel = Math.round(sortedAgents.reduce((sum, a) => sum + a.contractLevel, 0) / sortedAgents.length);

/* ── Product commission summary (aggregated across agents) ─ */

const PRODUCT_NAMES = ['IUL', 'Whole Life', 'Term', 'Annuity'] as const;

const productSummary = PRODUCT_NAMES.map((product) => {
  let totalPremium = 0;
  let totalCommission = 0;
  sortedAgents.forEach((agent) => {
    const p = agent.products.find((pr) => pr.product === product);
    if (p) {
      totalPremium += p.premium;
      totalCommission += p.commission;
    }
  });
  const effectiveRate = totalPremium > 0 ? (totalCommission / totalPremium) * 100 : 0;
  return { product, totalPremium, totalCommission, effectiveRate };
});

/* ── Agents with clawback risk ────────────────────────────── */

const clawbackAgents = sortedAgents.filter((a) => a.clawbackRisk > 0);

/* ── Chart constants ──────────────────────────────────────── */

const CHART_COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  amber: '#f59e0b',
  rose: '#fb7185',
};

const PRODUCT_CHART_DATA = productSummary.map((p) => ({
  name: p.product,
  premium: p.totalPremium,
  commission: p.totalCommission,
  rate: p.effectiveRate,
}));

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: RADIUS.button,
        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
        boxShadow: SHADOW.level2,
      }}
    >
      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], margin: 0, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ fontSize: TYPE.meta, fontWeight: 600, color: entry.color, margin: 0 }}>
          {entry.name}: ${(entry.value / 1000).toFixed(1)}K
        </p>
      ))}
    </div>
  );
};

/* ── Component ────────────────────────────────────────────── */

export function ManagerCommissions() {
  const [period, setPeriod] = useState<Period>('This Month');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const toggleExpand = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <ManagerPageHero
          icon={DollarSign}
          title="Commissions"
          subtitle="Earnings, payouts, and commission rates"
        />

        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value={`$${(totalPending / 1000).toFixed(1)}K`}
              label="Pending"
              sparklineData={[...SPARKLINE_COMMISSIONS_PENDING]}
              delta={8}
              deltaFormat="percent"
              periodLabel="This month"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={`$${(totalPaidYTD / 1000).toFixed(1)}K`}
              label="Paid YTD"
              sparklineData={[...SPARKLINE_COMMISSIONS_PAID]}
              delta={22.4}
              deltaFormat="percent"
              periodLabel="Year to date"
              northStar
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={`$${(totalClawback / 1000).toFixed(1)}K`}
              label="Clawback Risk"
              sparklineData={[...SPARKLINE_CLAWBACK]}
              delta={-15}
              deltaFormat="percent"
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={Percent}
              value={`${avgContractLevel}%`}
              label="Avg Contract Level"
              sparklineData={[...SPARKLINE_CONTRACT_LEVEL]}
              delta={2.1}
              deltaFormat="percent"
              periodLabel="Last 30 days"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Period Selector Pills ─────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive = period === option;
            return (
              <motion.button
                key={option}
                onClick={() => setPeriod(option)}
                className="font-medium border-0"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: isActive ? undefined : 'blur(20px)',
                  WebkitBackdropFilter: isActive ? undefined : 'blur(20px)',
                  color: isActive ? '#ffffff' : COLORS.gray[600],
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {option}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Golden Ratio Content Grid ─────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ── LEFT COLUMN (61.8%) ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Agent Commission Table */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <DollarSign
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Agent Commissions</span>
                  <span
                    className="text-gray-400 font-normal"
                    style={{ fontSize: TYPE.caption, marginLeft: 'auto' }}
                  >
                    {period}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {/* Table Header */}
                <div
                  className="hidden md:grid items-center"
                  style={{
                    gridTemplateColumns: '48px 1fr 100px 100px 100px 40px',
                    gap: GRID.spacing.xs,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    marginBottom: GRID.spacing.xs,
                  }}
                >
                  <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Rank</span>
                  <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Agent</span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Pending</span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Paid YTD</span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Clawback</span>
                  <span className="text-gray-400 font-semibold text-center" style={{ fontSize: TYPE.caption }}></span>
                </div>

                {/* Agent Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {sortedAgents.map((agent, index) => {
                    const isExpanded = expandedAgents.has(agent.agentId);
                    return (
                      <div key={agent.agentId}>
                        <motion.div
                          className="grid items-center cursor-pointer"
                          style={{
                            gridTemplateColumns: '48px 1fr 100px 100px 100px 40px',
                            gap: GRID.spacing.xs,
                            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{ backgroundColor: COLORS.gray[50] }}
                          onClick={() => toggleExpand(agent.agentId)}
                        >
                          {/* Rank */}
                          <span
                            className="font-bold text-gray-500"
                            style={{ fontSize: TYPE.meta }}
                          >
                            #{index + 1}
                          </span>

                          {/* Avatar + Name */}
                          <div className="flex items-center min-w-0" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: LAYOUT.icon.xxl,
                                height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.meta,
                              }}
                            >
                              {agent.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                                {agent.name}
                              </p>
                              <p className="text-gray-400 truncate" style={{ fontSize: TYPE.caption }}>
                                {agent.apTier} AP · {agent.contractLevel}% Contract
                              </p>
                            </div>
                          </div>

                          {/* Pending */}
                          <span className="font-semibold text-gray-700 text-right" style={{ fontSize: TYPE.meta }}>
                            ${agent.pending.toLocaleString()}
                          </span>

                          {/* Paid YTD */}
                          <span className="font-bold text-right" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                            ${agent.paidYTD.toLocaleString()}
                          </span>

                          {/* Clawback */}
                          <span
                            className="font-semibold text-right"
                            style={{
                              fontSize: TYPE.meta,
                              color: agent.clawbackRisk > 0 ? '#ef4444' : COLORS.gray[300],
                            }}
                          >
                            {agent.clawbackRisk > 0
                              ? `$${agent.clawbackRisk.toLocaleString()}`
                              : '\u2014'}
                          </span>

                          {/* Expand chevron */}
                          <div className="flex items-center justify-center">
                            {isExpanded ? (
                              <ChevronUp className="text-gray-400" style={{ width: 16, height: 16 }} />
                            ) : (
                              <ChevronDown className="text-gray-400" style={{ width: 16, height: 16 }} />
                            )}
                          </div>
                        </motion.div>

                        {/* Expanded Product Breakdown */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                            style={{
                              marginLeft: 48 + GRID.spacing.xs,
                              marginRight: GRID.spacing.sm,
                              marginTop: GRID.spacing.xs,
                              marginBottom: GRID.spacing.xs,
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              backgroundColor: COLORS.gray[50],
                            }}
                          >
                            {/* Sub-table header */}
                            <div
                              className="grid items-center"
                              style={{
                                gridTemplateColumns: '1fr 100px 60px 100px',
                                gap: GRID.spacing.xs,
                                paddingBottom: GRID.spacing.xs,
                                borderBottom: `1px solid ${COLORS.gray[200]}`,
                                marginBottom: GRID.spacing.xs,
                              }}
                            >
                              <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Product</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Premium</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Rate</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Commission</span>
                            </div>
                            {agent.products.map((product) => (
                              <div
                                key={product.product}
                                className="grid items-center"
                                style={{
                                  gridTemplateColumns: '1fr 100px 60px 100px',
                                  gap: GRID.spacing.xs,
                                  padding: `${GRID.spacing.xs / 2}px 0`,
                                }}
                              >
                                <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                                  {product.product}
                                </span>
                                <span className="text-gray-600 text-right" style={{ fontSize: TYPE.meta }}>
                                  ${product.premium.toLocaleString()}
                                </span>
                                <span className="text-gray-500 text-right" style={{ fontSize: TYPE.meta }}>
                                  {product.rate}%
                                </span>
                                <span className="font-semibold text-right" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                                  ${product.commission.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Product Summary */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <BarChart3
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Product Summary</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={PRODUCT_CHART_DATA}
                    margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
                    barGap={4}
                    barSize={24}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: TYPE.caption, fill: COLORS.gray[600], fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                      tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<GlassTooltip />} />
                    <Bar
                      dataKey="premium"
                      name="Premium"
                      fill={CHART_COLORS.emerald}
                      radius={[4, 4, 0, 0]}
                      opacity={0.85}
                    />
                    <Bar
                      dataKey="commission"
                      name="Commission"
                      fill={CHART_COLORS.amber}
                      radius={[4, 4, 0, 0]}
                      opacity={0.9}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {/* Rate badges below chart */}
                <div className="flex items-center justify-around" style={{ marginTop: GRID.spacing.xs }}>
                  {PRODUCT_CHART_DATA.map((p) => (
                    <div key={p.name} className="text-center">
                      <span className="font-semibold" style={{ fontSize: TYPE.caption, color: '#d97706' }}>
                        {p.rate.toFixed(1)}%
                      </span>
                      <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>rate</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (38.2%) ────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Payout Timeline — Gradient Card */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
              style={{ borderRadius: RADIUS.hero }}
            >
              {/* Fibonacci blobs */}
              <div
                className="absolute top-0 right-0 bg-white/10 blur-2xl"
                style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl"
                style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)', borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute top-1/2 right-1/4 bg-teal-300/10 blur-sm"
                style={{ width: 34, height: 34, borderRadius: RADIUS.pill }}
              />

              <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.button,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Calendar className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                      Payout Timeline
                    </p>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>
                      Upcoming and recent payouts
                    </p>
                  </div>
                </div>

                {/* Timeline entries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {DEMO_PAYOUT_TIMELINE.map((entry, idx) => {
                    const isLast = idx === DEMO_PAYOUT_TIMELINE.length - 1;
                    return (
                      <div key={entry.id} className="flex" style={{ gap: GRID.spacing.sm }}>
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: RADIUS.pill,
                              backgroundColor: entry.status === 'upcoming' ? '#fbbf24' : '#10b981',
                              boxShadow: entry.status === 'upcoming'
                                ? '0 0 8px rgba(251, 191, 36, 0.5)'
                                : '0 0 8px rgba(16, 185, 129, 0.5)',
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                          {!isLast && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                                minHeight: 24,
                              }}
                            />
                          )}
                        </div>

                        {/* Entry content */}
                        <div
                          style={{
                            flex: 1,
                            paddingBottom: isLast ? 0 : GRID.spacing.sm,
                          }}
                        >
                          <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
                            <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>
                              {entry.label}
                            </p>
                            <span
                              className="font-semibold"
                              style={{
                                fontSize: TYPE.caption,
                                padding: `2px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.pill,
                                backgroundColor: entry.status === 'upcoming'
                                  ? 'rgba(251, 191, 36, 0.2)'
                                  : 'rgba(16, 185, 129, 0.2)',
                                color: entry.status === 'upcoming' ? '#fcd34d' : '#6ee7b7',
                              }}
                            >
                              {entry.status === 'upcoming' ? 'Upcoming' : 'Paid'}
                            </span>
                          </div>
                          <p className="text-white/70" style={{ fontSize: TYPE.caption }}>
                            {entry.date}
                          </p>
                          <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                            <span className="text-amber-200 font-bold" style={{ fontSize: TYPE.meta }}>
                              ${entry.amount.toLocaleString()}
                            </span>
                            <span className="text-white/60" style={{ fontSize: TYPE.caption }}>
                              {entry.agents} agents
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Clawback Alerts */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <AlertTriangle
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Clawback Alerts</span>
                  {clawbackAgents.length > 0 && (
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: TYPE.caption,
                        padding: `2px ${GRID.spacing.xs}px`,
                        borderRadius: RADIUS.pill,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        marginLeft: 'auto',
                      }}
                    >
                      {clawbackAgents.length} at risk
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {clawbackAgents.length === 0 ? (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.meta, padding: GRID.spacing.md }}>
                    No active clawback risks
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {clawbackAgents.map((agent) => (
                      <motion.div
                        key={agent.agentId}
                        className="flex items-center"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        }}
                        whileHover={{ backgroundColor: COLORS.gray[50] }}
                      >
                        {/* Avatar */}
                        <div
                          className="flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                          style={{
                            width: LAYOUT.icon.xxl,
                            height: LAYOUT.icon.xxl,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.meta,
                          }}
                        >
                          {agent.avatar}
                        </div>

                        {/* Name + Reason */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {agent.name}
                          </p>
                          <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>
                            Lapse risk (13-month window)
                          </p>
                        </div>

                        {/* Amount at risk */}
                        <span
                          className="font-bold flex-shrink-0"
                          style={{ fontSize: TYPE.meta, color: '#ef4444' }}
                        >
                          ${agent.clawbackRisk.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <Download
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Export Options</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                  <motion.button
                    onClick={() => toast.success('Commission report exported as CSV')}
                    className="flex-1 flex items-center justify-center font-medium border-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      cursor: 'pointer',
                      gap: GRID.spacing.xs,
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download style={{ width: 16, height: 16 }} />
                    Export CSV
                  </motion.button>

                  <motion.button
                    onClick={() => toast.success('Commission report exported as PDF')}
                    className="flex-1 flex items-center justify-center font-medium border-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                      color: COLORS.gray[700],
                      cursor: 'pointer',
                      gap: GRID.spacing.xs,
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download style={{ width: 16, height: 16 }} />
                    Export PDF
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerCommissions;
