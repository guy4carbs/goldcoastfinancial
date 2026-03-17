/**
 * Executive Investor Dashboard — Key Metrics & Growth Trajectory
 * Heritage Design System — Orange/Amber theme
 *
 * Clean, board-presentation-ready view with revenue charts,
 * KPIs, product mix, quarterly summaries, and growth sparklines.
 */

import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Shield,
  DollarSign,
  Target,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
} from 'recharts';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveGlassTooltip } from './primitives/ExecutiveGlassTooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency,
  DEMO_EXEC_REVENUE_MONTHLY,
  DEMO_REVENUE_BY_PRODUCT,
  DEMO_EXEC_MONTHLY_TRENDS,
} from './executiveConstants';
import { toast } from 'sonner';

// ─── SECTION HEADER ─────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
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
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── QUARTERLY DATA ─────────────────────────────
const QUARTERLY_SUMMARY = [
  { quarter: 'Q1 2026', revenue: 938000, type: 'actual' as const, vsTarget: 107 },
  { quarter: 'Q2 2026', revenue: 741000, type: 'forecast' as const, vsTarget: 95 },
  { quarter: 'Q3 2026', revenue: 885000, type: 'forecast' as const, vsTarget: 101 },
  { quarter: 'Q4 2026', revenue: 936000, type: 'forecast' as const, vsTarget: 99 },
];

// ─── KPI DATA ───────────────────────────────────
const KEY_METRICS = [
  { label: 'Annual Run Rate', value: '$3.7M', icon: DollarSign, color: '#ea580c' },
  { label: 'Revenue Growth', value: '+34% YoY', icon: TrendingUp, color: '#10b981' },
  { label: 'Active Agents', value: '61', icon: Users, color: '#3b82f6' },
  { label: 'Agent Retention', value: '96%', icon: Shield, color: '#7c3aed' },
  { label: 'Revenue per Agent', value: '$30.7K', icon: DollarSign, color: '#f59e0b' },
  { label: 'Pipeline Coverage', value: '3.2x', icon: Target, color: '#ef4444' },
];

// ─── SPARKLINE CONFIGS ──────────────────────────
const SPARKLINE_CONFIGS = [
  { key: 'revenue' as const, label: 'Revenue', color: '#ea580c' },
  { key: 'agents' as const, label: 'Agents', color: '#3b82f6' },
  { key: 'policies' as const, label: 'Policies', color: '#10b981' },
];

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveInvestorView() {
  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Hero ── */}
        <ExecutivePageHero
          icon={BarChart3}
          title="Investor Dashboard"
          subtitle="Key metrics and growth trajectory for stakeholders"
        />

        {/* ── Export Button ── */}
        <motion.div variants={fadeInUp} className="flex justify-end">
          <Button
            style={{
              borderRadius: RADIUS.button,
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              fontSize: TYPE.meta,
            }}
            onClick={() => toast.success('Generating investor report...')}
          >
            <Download style={{ width: 16, height: 16, marginRight: 8 }} />
            Print / Export
          </Button>
        </motion.div>

        {/* ── Golden Ratio Grid ── */}
        <motion.div variants={fadeInUp}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.618fr 1fr',
              gap: GRID.spacing.lg,
            }}
          >
            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div className="space-y-8">
              {/* 1. Revenue Chart */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Revenue Performance"
                  subtitle="Actual vs target over trailing 12 months"
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
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart
                        data={DEMO_EXEC_REVENUE_MONTHLY.map((d) => ({ ...d }))}
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
                          tickFormatter={(v: number) => fmtCurrency(v)}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => fmtCurrency(v)}
                            />
                          }
                        />
                        <Bar
                          dataKey="actual"
                          name="Actual"
                          fill="#ea580c"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          name="Target"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#94a3b8' }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* 2. Key Metrics — 3x2 Grid */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Key Metrics"
                  subtitle="Core performance indicators for stakeholders"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {KEY_METRICS.map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <Card
                        key={metric.label}
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent className="p-5 text-center">
                          <div
                            className="mx-auto mb-3 flex items-center justify-center"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.input,
                              backgroundColor: `${metric.color}14`,
                            }}
                          >
                            <MetricIcon style={{ width: 20, height: 20, color: metric.color }} />
                          </div>
                          <p
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.section, lineHeight: 1.1 }}
                          >
                            {metric.value}
                          </p>
                          <p
                            className="mt-1"
                            style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}
                          >
                            {metric.label}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 3. Product Mix — Donut Chart */}
              <div>
                <SectionHeader
                  icon={DollarSign}
                  title="Product Mix"
                  subtitle="Revenue distribution by product line"
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
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={DEMO_REVENUE_BY_PRODUCT.map((d) => ({
                            ...d,
                            name: d.product,
                          }))}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="revenue"
                        >
                          {DEMO_REVENUE_BY_PRODUCT.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => fmtCurrency(v)}
                            />
                          }
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ fontSize: TYPE.caption, paddingTop: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ══════════════ RIGHT COLUMN ══════════════ */}
            <div className="space-y-8">
              {/* 1. Quarterly Summary */}
              <div>
                <SectionHeader
                  icon={Target}
                  title="Quarterly Summary"
                  subtitle="Revenue by quarter with target comparison"
                />
                <div className="space-y-3">
                  {QUARTERLY_SUMMARY.map((q) => (
                    <Card
                      key={q.quarter}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {q.quarter}
                          </span>
                          <span
                            className="font-medium"
                            style={{
                              fontSize: TYPE.micro,
                              color: q.type === 'actual' ? '#10b981' : '#f59e0b',
                              backgroundColor: q.type === 'actual' ? '#ecfdf5' : '#fffbeb',
                              padding: '2px 8px',
                              borderRadius: RADIUS.pill,
                            }}
                          >
                            {q.type === 'actual' ? 'Actual' : 'Forecast'}
                          </span>
                        </div>
                        <p
                          className="font-bold text-gray-900"
                          style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                        >
                          {fmtCurrency(q.revenue)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            style={{
                              fontSize: TYPE.caption,
                              color: q.vsTarget >= 100 ? '#10b981' : '#f59e0b',
                              fontWeight: 600,
                            }}
                          >
                            {q.vsTarget >= 100 ? '+' : ''}{q.vsTarget - 100}% vs target
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2">
                          <div
                            style={{
                              width: '100%',
                              height: 4,
                              borderRadius: RADIUS.pill,
                              backgroundColor: COLORS.gray[100],
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(q.vsTarget, 110)}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              style={{
                                height: '100%',
                                borderRadius: RADIUS.pill,
                                backgroundColor: q.vsTarget >= 100 ? '#10b981' : '#f59e0b',
                                maxWidth: '100%',
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 2. Growth Sparklines */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Growth Sparklines"
                  subtitle="12-month trend indicators"
                />
                <div className="space-y-3">
                  {SPARKLINE_CONFIGS.map((config) => (
                    <Card
                      key={config.key}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-4">
                        <p
                          className="font-semibold text-gray-700 mb-1"
                          style={{ fontSize: TYPE.meta }}
                        >
                          {config.label}
                        </p>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart
                            data={DEMO_EXEC_MONTHLY_TRENDS.map((d) => ({ ...d }))}
                            margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                          >
                            <Line
                              type="monotone"
                              dataKey={config.key}
                              stroke={config.color}
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 3. Agent Metrics */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Agent Metrics"
                  subtitle="Headcount and retention summary"
                />
                <div className="space-y-3">
                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.input,
                            backgroundColor: '#ecfdf5',
                          }}
                        >
                          <Users style={{ width: 18, height: 18, color: '#10b981' }} />
                        </div>
                        <div>
                          <h4
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            Net Agent Acquisition
                          </h4>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            Year-to-date growth
                          </p>
                        </div>
                      </div>
                      <p
                        className="font-bold"
                        style={{ fontSize: TYPE.section, color: '#10b981', lineHeight: 1.1 }}
                      >
                        +24 agents YTD
                      </p>
                      <p className="mt-1" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                        From 37 to 61 active agents
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.input,
                            backgroundColor: '#eff6ff',
                          }}
                        >
                          <Shield style={{ width: 18, height: 18, color: '#3b82f6' }} />
                        </div>
                        <div>
                          <h4
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            Agent Churn
                          </h4>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            Departures and retention
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <div>
                          <p
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.section, lineHeight: 1.1 }}
                          >
                            3
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            departed
                          </p>
                        </div>
                        <div
                          style={{
                            width: 1,
                            height: 32,
                            backgroundColor: COLORS.gray[200],
                          }}
                        />
                        <div>
                          <p
                            className="font-bold"
                            style={{ fontSize: TYPE.section, color: '#10b981', lineHeight: 1.1 }}
                          >
                            96%
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            retention
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveInvestorView;
