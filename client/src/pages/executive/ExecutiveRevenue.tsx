/**
 * Executive Revenue & Forecasting
 * Heritage Design System — Orange/Amber theme
 *
 * Financial performance dashboards with predictive analytics,
 * scenario modeling, team breakdowns, and product revenue mix.
 */

import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  ArrowUpRight,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Milestone,
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
  Legend,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from './primitives/ExecutiveTabSection';
import { ExecutiveGlassTooltip } from './primitives/ExecutiveGlassTooltip';
import { Card, CardContent } from '@/components/ui/card';
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
  DEMO_ORG_METRICS,
  DEMO_TEAMS,
  DEMO_REVENUE_BY_PRODUCT,
  DEMO_EXEC_REVENUE_MONTHLY,
  DEMO_EXEC_SCENARIOS,
} from './executiveConstants';

// ─── MILESTONE DATA ─────────────────────────────
const REVENUE_MILESTONES = [
  {
    label: '$1M Revenue',
    date: 'Dec 2025',
    status: 'achieved' as const,
    description: 'First $1M quarterly run rate achieved',
  },
  {
    label: '$1.5M Revenue',
    date: 'Feb 2026',
    status: 'achieved' as const,
    description: 'Crossed $1.5M with 57 active agents',
  },
  {
    label: '$2M Revenue',
    date: 'Apr 2026 (projected)',
    status: 'in-progress' as const,
    description: 'On track with 85% quarterly progress',
  },
  {
    label: '$3M Revenue',
    date: 'Q3 2026 (target)',
    status: 'upcoming' as const,
    description: 'Stretch goal with Team Echo ramp-up',
  },
];

// ─── SCENARIO ICON MAP ──────────────────────────
function getScenarioIcon(id: string) {
  switch (id) {
    case 'best':
      return CheckCircle2;
    case 'likely':
      return Target;
    case 'worst':
      return AlertTriangle;
    default:
      return Target;
  }
}

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

// ─── CUSTOM PIE CHART LABEL ─────────────────────
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={COLORS.gray[600]}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={TYPE.micro}
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveRevenue() {
  const monthlyRunRate = Math.round(
    DEMO_ORG_METRICS.totalRevenue / 6
  ); // 6 months of data

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
          icon={DollarSign}
          title="Revenue & Forecasting"
          subtitle="Financial performance and predictive analytics"
        />

        {/* ── Top-Level Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              label="YTD Revenue"
              value={fmtCurrency(DEMO_ORG_METRICS.totalRevenue)}
              delta={DEMO_ORG_METRICS.revenueGrowth}
              periodLabel="vs last year"
              northStar
            />
            <ExecutiveStatCard
              icon={Zap}
              label="Monthly Run Rate"
              value={fmtCurrency(monthlyRunRate)}
              delta={8.2}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={ArrowUpRight}
              label="Revenue Growth"
              value={`+${DEMO_ORG_METRICS.revenueGrowth}%`}
              delta={DEMO_ORG_METRICS.revenueGrowth}
              periodLabel="year-over-year"
            />
            <ExecutiveStatCard
              icon={Target}
              label="Forecast Accuracy"
              value="87%"
              delta={3}
              periodLabel="vs last quarter"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="trends"
            tabs={[
              { value: 'trends', label: 'Revenue Trends', icon: TrendingUp },
              { value: 'forecast', label: 'Forecasting', icon: Target },
              { value: 'team', label: 'By Team', icon: Users },
              { value: 'product', label: 'By Product', icon: PieChartIcon },
            ]}
          >
            {/* ════════════════ REVENUE TRENDS TAB ════════════════ */}
            <TabsContent value="trends" className="mt-6 space-y-6">
              <SectionHeader
                icon={TrendingUp}
                title="Revenue Performance"
                subtitle="Actual vs target vs forecast over 12 months"
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
                      <Legend wrapperStyle={{ fontSize: TYPE.caption }} />
                      <Bar
                        dataKey="actual"
                        name="Actual"
                        fill="#ea580c"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
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
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Forecast"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#f59e0b' }}
                        activeDot={{ r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Milestones */}
              <SectionHeader
                icon={Milestone}
                title="Revenue Milestones"
                subtitle="Key financial milestones and targets"
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: GRID.spacing.sm,
                }}
              >
                {REVENUE_MILESTONES.map((m) => {
                  const statusConfig = {
                    achieved: {
                      icon: CheckCircle2,
                      color: '#10b981',
                      bg: '#ecfdf5',
                      label: 'Achieved',
                    },
                    'in-progress': {
                      icon: Zap,
                      color: '#f59e0b',
                      bg: '#fffbeb',
                      label: 'In Progress',
                    },
                    upcoming: {
                      icon: Target,
                      color: '#3b82f6',
                      bg: '#eff6ff',
                      label: 'Upcoming',
                    },
                  };
                  const sc = statusConfig[m.status];
                  const StatusIcon = sc.icon;

                  return (
                    <Card
                      key={m.label}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <StatusIcon
                            style={{ width: 18, height: 18, color: sc.color }}
                          />
                          <span
                            className="font-medium"
                            style={{
                              fontSize: TYPE.micro,
                              color: sc.color,
                              backgroundColor: sc.bg,
                              padding: '2px 8px',
                              borderRadius: RADIUS.pill,
                            }}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <p
                          className="font-bold text-stone-900"
                          style={{ fontSize: TYPE.body, lineHeight: 1.3 }}
                        >
                          {m.label}
                        </p>
                        <p
                          className="mt-1"
                          style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}
                        >
                          {m.date}
                        </p>
                        <p
                          className="mt-2"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          {m.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ FORECASTING TAB ════════════════ */}
            <TabsContent value="forecast" className="mt-6 space-y-6">
              {/* Scenario Cards */}
              <SectionHeader
                icon={Target}
                title="Scenario Analysis"
                subtitle="Best, most likely, and worst case projections"
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: GRID.spacing.sm,
                }}
              >
                {DEMO_EXEC_SCENARIOS.map((scenario) => {
                  const ScenarioIcon = getScenarioIcon(scenario.id);
                  return (
                    <Card
                      key={scenario.id}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                        borderLeft: `4px solid ${scenario.color}`,
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.input,
                              backgroundColor: `${scenario.color}14`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ScenarioIcon
                              style={{
                                width: 22,
                                height: 22,
                                color: scenario.color,
                              }}
                            />
                          </div>
                          <div>
                            <h4
                              className="font-bold text-stone-900"
                              style={{ fontSize: TYPE.body }}
                            >
                              {scenario.label}
                            </h4>
                            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                              {scenario.probability}% probability
                            </p>
                          </div>
                        </div>
                        <p
                          className="font-bold text-stone-900"
                          style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                        >
                          {fmtCurrency(scenario.value)}
                        </p>
                        <p
                          className="mt-1"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          Annual projection
                        </p>
                        {/* Probability bar */}
                        <div className="mt-4">
                          <div
                            style={{
                              width: '100%',
                              height: 6,
                              borderRadius: RADIUS.pill,
                              backgroundColor: COLORS.gray[100],
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${scenario.probability}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              style={{
                                height: '100%',
                                borderRadius: RADIUS.pill,
                                backgroundColor: scenario.color,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Forecast Accuracy */}
              <SectionHeader
                icon={BarChart3}
                title="Forecast Accuracy"
                subtitle="How closely projections match actual results"
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
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.618fr 1fr',
                      gap: GRID.spacing.lg,
                    }}
                  >
                    <div className="space-y-4">
                      {[
                        { label: 'Q4 2025 Accuracy', value: '82%', color: '#f59e0b' },
                        { label: 'Q1 2026 Accuracy', value: '87%', color: '#10b981' },
                        { label: '6-Month Avg', value: '85%', color: '#3b82f6' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between p-4"
                          style={{
                            backgroundColor: COLORS.gray[50],
                            borderRadius: RADIUS.input,
                          }}
                        >
                          <span
                            className="font-medium text-stone-700"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {item.label}
                          </span>
                          <span
                            className="font-bold"
                            style={{ fontSize: TYPE.title, color: item.color }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex flex-col items-center justify-center p-6"
                      style={{
                        backgroundColor: COLORS.gray[50],
                        borderRadius: RADIUS.card,
                      }}
                    >
                      <p
                        className="font-bold text-stone-900"
                        style={{ fontSize: TYPE.display, lineHeight: 1 }}
                      >
                        87%
                      </p>
                      <p
                        className="mt-2"
                        style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}
                      >
                        Current Quarter Accuracy
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight
                          style={{ width: 14, height: 14, color: '#10b981' }}
                        />
                        <span
                          className="font-medium"
                          style={{ fontSize: TYPE.caption, color: '#10b981' }}
                        >
                          +5% vs last quarter
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════════════ BY TEAM TAB ════════════════ */}
            <TabsContent value="team" className="mt-6 space-y-6">
              <SectionHeader
                icon={Users}
                title="Revenue by Team"
                subtitle="Comparative team revenue performance"
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.618fr 1fr',
                  gap: GRID.spacing.lg,
                }}
              >
                {/* Horizontal Bar Chart */}
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
                      <BarChart
                        data={DEMO_TEAMS.map((t) => ({
                          name: t.name.replace('Team ', ''),
                          revenue: t.revenue,
                        }))}
                        layout="vertical"
                        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={COLORS.gray[200]}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => fmtCurrency(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: TYPE.caption, fill: COLORS.gray[600] }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => fmtCurrency(v)}
                            />
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#ea580c"
                          radius={[0, 6, 6, 0]}
                          barSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Comparison Table */}
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: `1px solid ${COLORS.gray[200]}`,
                          }}
                        >
                          {['Team', 'Revenue', 'Agents', 'Rev/Agent'].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left font-semibold text-stone-600 px-4 py-3"
                                style={{ fontSize: TYPE.micro }}
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_TEAMS.map((team) => {
                          const revPerAgent = Math.round(
                            team.revenue / team.agents
                          );
                          return (
                            <tr
                              key={team.id}
                              className="transition-colors hover:bg-orange-50/50"
                              style={{
                                borderBottom: `1px solid ${COLORS.gray[100]}`,
                              }}
                            >
                              <td
                                className="px-4 py-3 font-semibold text-stone-900"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {team.name.replace('Team ', '')}
                              </td>
                              <td
                                className="px-4 py-3 font-medium text-stone-700"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {fmtCurrency(team.revenue)}
                              </td>
                              <td
                                className="px-4 py-3 text-stone-600"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {team.agents}
                              </td>
                              <td
                                className="px-4 py-3 font-medium"
                                style={{
                                  fontSize: TYPE.caption,
                                  color:
                                    revPerAgent >= 35000
                                      ? '#047857'
                                      : revPerAgent >= 25000
                                      ? '#b45309'
                                      : '#b91c1c',
                                }}
                              >
                                {fmtCurrency(revPerAgent)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ BY PRODUCT TAB ════════════════ */}
            <TabsContent value="product" className="mt-6 space-y-6">
              <SectionHeader
                icon={PieChartIcon}
                title="Revenue by Product"
                subtitle="Product line contribution to total revenue"
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.618fr 1fr',
                  gap: GRID.spacing.lg,
                }}
              >
                {/* Donut Chart */}
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={DEMO_REVENUE_BY_PRODUCT.map((d) => ({
                            ...d,
                            name: d.product,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="revenue"
                          label={renderCustomLabel}
                          labelLine={false}
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
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Product Detail List */}
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    {DEMO_REVENUE_BY_PRODUCT.map((product) => (
                      <div key={product.product}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: RADIUS.pill,
                                backgroundColor: product.color,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              className="font-semibold text-stone-800"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {product.product}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className="font-bold text-stone-900"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {fmtCurrency(product.revenue)}
                            </span>
                            <span
                              className="ml-2"
                              style={{
                                fontSize: TYPE.micro,
                                color: COLORS.gray[400],
                              }}
                            >
                              {product.percentage}%
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div
                          style={{
                            width: '100%',
                            height: 6,
                            borderRadius: RADIUS.pill,
                            backgroundColor: COLORS.gray[100],
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${product.percentage}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              height: '100%',
                              borderRadius: RADIUS.pill,
                              backgroundColor: product.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div
                      className="pt-4 mt-4 flex items-center justify-between"
                      style={{
                        borderTop: `1px solid ${COLORS.gray[200]}`,
                      }}
                    >
                      <span
                        className="font-bold text-stone-700"
                        style={{ fontSize: TYPE.meta }}
                      >
                        Total Revenue
                      </span>
                      <span
                        className="font-bold text-stone-900"
                        style={{ fontSize: TYPE.body }}
                      >
                        {fmtCurrency(DEMO_ORG_METRICS.totalRevenue)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveRevenue;
