/**
 * Manager Forecasting Page
 * Scenario planning, pipeline-weighted deals, forecast accuracy, and at-risk deals
 * Heritage Design System — Emerald theme with gold accents
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_FORECAST_SCENARIOS,
  DEMO_FORECAST_DEALS,
  DEMO_FORECAST_ACCURACY,
  glassCard,
  SPARKLINE_REVENUE,
  SPARKLINE_FORECAST_ACCURACY,
  SPARKLINE_PIPELINE,
} from './managerConstants';
import {
  RADIUS, TYPE, GRID, LAYOUT, SHADOW, MOTION, COLORS,
  fadeInUp, staggerContainer, staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart as LineChartIcon,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { toast } from 'sonner';

/* ── Helpers ───────────────────────────────────────────────── */

function formatDollar(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

const RISK_COLORS = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
  high: { bg: 'bg-red-100', text: 'text-red-700' },
} as const;

/* ── Computed from data ───────────────────────────────────── */

const sortedDeals = [...DEMO_FORECAST_DEALS].sort(
  (a, b) => b.value * b.probability - a.value * a.probability,
);

const highRiskDeals = DEMO_FORECAST_DEALS.filter((d) => d.risk === 'high');

const likelyForecast = DEMO_FORECAST_SCENARIOS.find((s) => s.label === 'Likely')!.value;

const totalPipeline = DEMO_FORECAST_DEALS.reduce((sum, d) => sum + d.value, 0);

const accuracyMonths = DEMO_FORECAST_ACCURACY.filter((m) => m.actual > 0);
const avgAccuracy = Math.round(
  accuracyMonths.reduce((sum, m) => sum + (1 - Math.abs(m.projected - m.actual) / m.projected) * 100, 0) / accuracyMonths.length,
);

/* ── Chart constants ───────────────────────────────────────── */

const CHART_COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  indigo: '#6366f1',
  amber: '#f59e0b',
  rose: '#fb7185',
  gray: COLORS.gray[300],
};

const SCENARIO_CHART_DATA = DEMO_FORECAST_SCENARIOS.map((s) => ({
  name: s.label,
  value: s.value,
  probability: s.probability,
  fill:
    s.label === 'Best Case'
      ? CHART_COLORS.emerald
      : s.label === 'Likely'
        ? CHART_COLORS.teal
        : CHART_COLORS.amber,
}));

const ACCURACY_CHART_DATA = DEMO_FORECAST_ACCURACY.map((m) => ({
  name: m.month,
  projected: m.projected * 1000,
  actual: m.actual > 0 ? m.actual * 1000 : undefined,
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
          {entry.name}: {typeof entry.value === 'number' && entry.value >= 1000
            ? formatDollar(entry.value)
            : `${entry.value}%`}
        </p>
      ))}
    </div>
  );
};

/* ── Tab Content (used by ManagerPipeline "Forecasting" tab) ── */

export function ForecastingTabContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      <div
        className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
        style={{ gap: GRID.spacing.md }}
      >
        {/* ═══ LEFT COLUMN (1.618fr) ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

          {/* ── Revenue Scenarios ────────────────────────── */}
          <Card
            className="overflow-hidden"
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <BarChart3 size={LAYOUT.icon.md} className="text-amber-200" />
                </div>
                <span className="text-gray-900">Revenue Scenarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={SCENARIO_CHART_DATA} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barSize={28}>
                  <XAxis type="number" tickFormatter={(v) => formatDollar(v)} tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: TYPE.caption, fill: COLORS.gray[600], fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="value" name="Revenue" radius={[0, 8, 8, 0]}>
                    {SCENARIO_CHART_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="probability" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: TYPE.caption, fill: COLORS.gray[500], fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── Top Deals Table ─────────────────────────── */}
          <Card className="overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`} style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <DollarSign size={LAYOUT.icon.md} className="text-amber-200" />
                </div>
                <span className="text-gray-900">Top Deals</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="hidden md:grid items-center" style={{ gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr', gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, marginBottom: GRID.spacing.xs / 2 }}>
                {['Deal Name', 'Agent', 'Stage', 'Value', 'Prob', 'Weighted', 'Risk'].map((header) => (
                  <span key={header} className="font-semibold text-gray-400 uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>{header}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedDeals.map((deal) => {
                  const weighted = deal.value * (deal.probability / 100);
                  const risk = RISK_COLORS[deal.risk];
                  return (
                    <motion.div key={deal.id} className="grid items-center" style={{ gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr', gap: GRID.spacing.xs, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button }} whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}>
                      <span className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{deal.name}</span>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <div className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}>{deal.agentAvatar}</div>
                        <span className="text-gray-600 truncate" style={{ fontSize: TYPE.caption }}>{deal.agent}</span>
                      </div>
                      <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{deal.stage}</span>
                      <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>{formatDollar(deal.value)}</span>
                      <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>{deal.probability}%</span>
                      <span className="font-bold" style={{ fontSize: TYPE.meta, color: '#d97706' }}>{formatDollar(weighted)}</span>
                      <span className={`${risk.bg} ${risk.text} font-semibold text-center`} style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, textTransform: 'capitalize' }}>{deal.risk}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ RIGHT COLUMN (1fr) ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

          {/* ── Forecast Accuracy ────────────────────────── */}
          <Card className="overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`} style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <Target size={LAYOUT.icon.md} className="text-amber-200" />
                </div>
                <span className="text-gray-900">Forecast Accuracy</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ACCURACY_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2} barSize={14}>
                  <XAxis dataKey="name" tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatDollar(v)} tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="projected" name="Projected" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="actual" name="Actual" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center" style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.xs }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: CHART_COLORS.emerald }} />
                  <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>Projected</span>
                </div>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: CHART_COLORS.indigo }} />
                  <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>Actual</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── At-Risk Deals ────────────────────────────── */}
          <Card className="overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`} style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <AlertTriangle size={LAYOUT.icon.md} className="text-amber-200" />
                </div>
                <span className="text-gray-900">At-Risk Deals</span>
                <span className="bg-red-100 text-red-700 font-semibold" style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, marginLeft: 'auto' }}>{highRiskDeals.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {highRiskDeals.map((deal) => (
                  <motion.div key={deal.id} className="flex items-center" style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, gap: GRID.spacing.xs }} whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}>
                    <div className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}>{deal.agentAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{deal.name}</p>
                      <p className="text-gray-400 truncate" style={{ fontSize: TYPE.caption }}>{deal.agent} &middot; {formatDollar(deal.value)}</p>
                    </div>
                    <motion.button className="flex-shrink-0 font-semibold border-0" style={{ fontSize: TYPE.caption, color: '#ffffff', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: RADIUS.button, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`, cursor: 'pointer' }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => toast.success(`Reviewing "${deal.name}" — ${deal.agent}`)}>
                      Review
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────── */

export function ManagerForecasting() {
  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={LineChartIcon}
            title="Forecasting"
            subtitle="Pipeline projections and deal analysis"
          />
        </motion.div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value={formatDollar(likelyForecast)}
              label="Expected Revenue"
              sparklineData={[...SPARKLINE_REVENUE]}
              delta={8}
              deltaFormat="percent"
              periodLabel="vs last month"
              northStar
            />
            <ManagerStatCard
              icon={Target}
              value={`${avgAccuracy}%`}
              label="Forecast Accuracy"
              sparklineData={[...SPARKLINE_FORECAST_ACCURACY]}
              delta={3}
              deltaFormat="percent"
              periodLabel="Last 5 months"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={formatDollar(totalPipeline)}
              label="Total Pipeline"
              sparklineData={[...SPARKLINE_PIPELINE]}
              delta={12.5}
              deltaFormat="percent"
              periodLabel="Last 30 days"
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={highRiskDeals.length}
              label="At-Risk Deals"
              delta={-1}
              periodLabel="vs last week"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio 2-Col Grid ────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
            style={{ gap: GRID.spacing.md }}
          >
            {/* ═══ LEFT COLUMN (1.618fr) ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

              {/* ── Revenue Scenarios ────────────────────────── */}
              <Card
                className="overflow-hidden"
                style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle
                    className="font-semibold flex items-center gap-3"
                    style={{ fontSize: TYPE.title }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <BarChart3 size={LAYOUT.icon.md} className="text-amber-200" />
                    </div>
                    <span className="text-gray-900">Revenue Scenarios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={SCENARIO_CHART_DATA}
                      layout="vertical"
                      margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                      barSize={28}
                    >
                      <XAxis
                        type="number"
                        tickFormatter={(v) => formatDollar(v)}
                        tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: TYPE.caption, fill: COLORS.gray[600], fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip content={<GlassTooltip />} />
                      <Bar dataKey="value" name="Revenue" radius={[0, 8, 8, 0]}>
                        {SCENARIO_CHART_DATA.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="probability"
                          position="right"
                          formatter={(v: number) => `${v}%`}
                          style={{ fontSize: TYPE.caption, fill: COLORS.gray[500], fontWeight: 600 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ── Top Deals Table ─────────────────────────── */}
              <Card
                className="overflow-hidden"
                style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle
                    className="font-semibold flex items-center gap-3"
                    style={{ fontSize: TYPE.title }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <DollarSign size={LAYOUT.icon.md} className="text-amber-200" />
                    </div>
                    <span className="text-gray-900">Top Deals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {/* Table header */}
                  <div
                    className="hidden md:grid items-center"
                    style={{
                      gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr',
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      marginBottom: GRID.spacing.xs / 2,
                    }}
                  >
                    {['Deal Name', 'Agent', 'Stage', 'Value', 'Prob', 'Weighted', 'Risk'].map(
                      (header) => (
                        <span
                          key={header}
                          className="font-semibold text-gray-400 uppercase tracking-wider"
                          style={{ fontSize: TYPE.micro }}
                        >
                          {header}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Table rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedDeals.map((deal) => {
                      const weighted = deal.value * (deal.probability / 100);
                      const risk = RISK_COLORS[deal.risk];
                      return (
                        <motion.div
                          key={deal.id}
                          className="grid items-center"
                          style={{
                            gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr',
                            gap: GRID.spacing.xs,
                            padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          <span className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {deal.name}
                          </span>

                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button, fontSize: TYPE.micro,
                              }}
                            >
                              {deal.agentAvatar}
                            </div>
                            <span className="text-gray-600 truncate" style={{ fontSize: TYPE.caption }}>
                              {deal.agent}
                            </span>
                          </div>

                          <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                            {deal.stage}
                          </span>

                          <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                            {formatDollar(deal.value)}
                          </span>

                          <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>
                            {deal.probability}%
                          </span>

                          <span className="font-bold" style={{ fontSize: TYPE.meta, color: '#d97706' }}>
                            {formatDollar(weighted)}
                          </span>

                          <span
                            className={`${risk.bg} ${risk.text} font-semibold text-center`}
                            style={{
                              fontSize: TYPE.micro,
                              borderRadius: RADIUS.pill,
                              padding: `2px ${GRID.spacing.xs}px`,
                              textTransform: 'capitalize',
                            }}
                          >
                            {deal.risk}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ═══ RIGHT COLUMN (1fr) ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

              {/* ── Forecast Accuracy ────────────────────────── */}
              <Card
                className="overflow-hidden"
                style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle
                    className="font-semibold flex items-center gap-3"
                    style={{ fontSize: TYPE.title }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Target size={LAYOUT.icon.md} className="text-amber-200" />
                    </div>
                    <span className="text-gray-900">Forecast Accuracy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={ACCURACY_CHART_DATA}
                      margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
                      barGap={2}
                      barSize={14}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatDollar(v)}
                        tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<GlassTooltip />} />
                      <Bar
                        dataKey="projected"
                        name="Projected"
                        fill={CHART_COLORS.emerald}
                        radius={[4, 4, 0, 0]}
                        opacity={0.85}
                      />
                      <Bar
                        dataKey="actual"
                        name="Actual"
                        fill={CHART_COLORS.indigo}
                        radius={[4, 4, 0, 0]}
                        opacity={0.9}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.xs }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: CHART_COLORS.emerald }} />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>Projected</span>
                    </div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: CHART_COLORS.indigo }} />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>Actual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── At-Risk Deals ────────────────────────────── */}
              <Card
                className="overflow-hidden"
                style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle
                    className="font-semibold flex items-center gap-3"
                    style={{ fontSize: TYPE.title }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle size={LAYOUT.icon.md} className="text-amber-200" />
                    </div>
                    <span className="text-gray-900">At-Risk Deals</span>
                    <span
                      className="bg-red-100 text-red-700 font-semibold"
                      style={{
                        fontSize: TYPE.micro,
                        borderRadius: RADIUS.pill,
                        padding: `2px ${GRID.spacing.xs}px`,
                        marginLeft: 'auto',
                      }}
                    >
                      {highRiskDeals.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {highRiskDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        className="flex items-center"
                        style={{
                          padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          gap: GRID.spacing.xs,
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        <div
                          className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                          style={{
                            width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                            borderRadius: RADIUS.button, fontSize: TYPE.micro,
                          }}
                        >
                          {deal.agentAvatar}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {deal.name}
                          </p>
                          <p className="text-gray-400 truncate" style={{ fontSize: TYPE.caption }}>
                            {deal.agent} &middot; {formatDollar(deal.value)}
                          </p>
                        </div>

                        <motion.button
                          className="flex-shrink-0 font-semibold border-0"
                          style={{
                            fontSize: TYPE.caption,
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: RADIUS.button,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                            cursor: 'pointer',
                          }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => toast.success(`Reviewing "${deal.name}" — ${deal.agent}`)}
                        >
                          Review
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerForecasting;
