/**
 * Executive Growth Analytics — Month-over-month, quarterly, and annual growth trends
 * Heritage Design System — Orange/Amber theme
 */

import { motion } from 'framer-motion';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  DollarSign,
  Flame,
  Target,
  Milestone,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
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
  DEMO_EXEC_GROWTH_METRICS,
  DEMO_EXEC_MONTHLY_TRENDS,
  DEMO_EXEC_COHORT_DATA,
} from './executiveConstants';

// ─── GROWTH SCORECARD METRICS ────────────────
const GROWTH_METRICS = [
  { label: 'Revenue MoM', value: DEMO_EXEC_GROWTH_METRICS.momRevenue, category: 'revenue', icon: DollarSign },
  { label: 'Revenue QoQ', value: DEMO_EXEC_GROWTH_METRICS.qoqRevenue, category: 'revenue', icon: DollarSign },
  { label: 'Revenue YoY', value: DEMO_EXEC_GROWTH_METRICS.yoyRevenue, category: 'revenue', icon: DollarSign },
  { label: 'Agent MoM', value: DEMO_EXEC_GROWTH_METRICS.momAgents, category: 'agents', icon: Users },
  { label: 'Agent QoQ', value: DEMO_EXEC_GROWTH_METRICS.qoqAgents, category: 'agents', icon: Users },
  { label: 'Agent YoY', value: DEMO_EXEC_GROWTH_METRICS.yoyAgents, category: 'agents', icon: Users },
  { label: 'Policies MoM', value: DEMO_EXEC_GROWTH_METRICS.momPolicies, category: 'policies', icon: FileText },
  { label: 'Policies QoQ', value: DEMO_EXEC_GROWTH_METRICS.qoqPolicies, category: 'policies', icon: FileText },
];

// ─── SECTION HEADER ──────────────────────────
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

// ─── PROJECTION DATA ─────────────────────────
// Take last 3 actual months, project forward 6 months with linear growth
function buildProjectionData() {
  const trends = DEMO_EXEC_MONTHLY_TRENDS.map((d) => ({ ...d }));
  const last3 = trends.slice(3, 6); // Jan, Feb, Mar (actual data)

  // Calculate average monthly growth rates
  const revenueGrowth = (last3[2].revenue - last3[0].revenue) / 2;
  const agentGrowth = (last3[2].agents - last3[0].agents) / 2;
  const policyGrowth = (last3[2].policies - last3[0].policies) / 2;

  const projectedMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const baseRevenue = last3[2].revenue;
  const baseAgents = last3[2].agents;
  const basePolicies = last3[2].policies;

  // Actual data points
  const actual = last3.map((d) => ({
    month: d.month.replace(' 2026', '').replace(' 2025', ''),
    actualRevenue: d.revenue,
    projectedRevenue: null as number | null,
    agents: d.agents,
    policies: d.policies,
  }));

  // Bridging point: last actual is also first projected
  const bridge = {
    month: last3[2].month.replace(' 2026', '').replace(' 2025', ''),
    actualRevenue: last3[2].revenue,
    projectedRevenue: last3[2].revenue,
    agents: last3[2].agents,
    policies: last3[2].policies,
  };
  actual[actual.length - 1] = bridge;

  // Projected data points
  const projected = projectedMonths.map((month, i) => ({
    month,
    actualRevenue: null as number | null,
    projectedRevenue: Math.round(baseRevenue + revenueGrowth * (i + 1)),
    agents: Math.round(baseAgents + agentGrowth * (i + 1)),
    policies: Math.round(basePolicies + policyGrowth * (i + 1)),
  }));

  return [...actual, ...projected];
}

const projectionData = buildProjectionData();

// ─── MILESTONE DATA ──────────────────────────
const MILESTONES = [
  {
    title: '100 Agents',
    icon: Users,
    target: 100,
    current: 61,
    projectedDate: 'Q4 2026',
    color: '#3b82f6',
  },
  {
    title: '$5M Pipeline',
    icon: Target,
    target: 5000000,
    current: 4800000,
    projectedDate: 'Q2 2026',
    color: '#ea580c',
  },
  {
    title: '30% Win Rate',
    icon: TrendingUp,
    target: 30,
    current: 22.6,
    projectedDate: 'Q3 2026',
    color: '#10b981',
  },
  {
    title: '$500K Monthly Revenue',
    icon: DollarSign,
    target: 500000,
    current: 312000,
    projectedDate: 'Q1 2027',
    color: '#8b5cf6',
  },
];

// ─── PROGRESS BAR ────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: 8,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.gray[100],
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: '100%',
          borderRadius: RADIUS.pill,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// ─── COHORT BAR DATA ─────────────────────────
const cohortBarData = DEMO_EXEC_COHORT_DATA.map((d) => ({
  cohort: d.cohort,
  avgRevenue: d.avgRevenue,
}));

// ─── MAIN COMPONENT ─────────────────────────
export function ExecutiveGrowthAnalytics() {
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
          icon={LineChartIcon}
          title="Growth Analytics"
          subtitle="Month-over-month, quarterly, and annual growth trends"
        />

        {/* ── Top-Level Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={TrendingUp}
              label="MoM Growth"
              value={`+${DEMO_EXEC_GROWTH_METRICS.momRevenue}%`}
              delta={DEMO_EXEC_GROWTH_METRICS.momRevenue}
              periodLabel="revenue"
            />
            <ExecutiveStatCard
              icon={BarChart3}
              label="QoQ Growth"
              value={`+${DEMO_EXEC_GROWTH_METRICS.qoqRevenue}%`}
              delta={DEMO_EXEC_GROWTH_METRICS.qoqRevenue}
              periodLabel="revenue"
            />
            <ExecutiveStatCard
              icon={ArrowUpRight}
              label="YoY Growth"
              value={`+${DEMO_EXEC_GROWTH_METRICS.yoyRevenue}%`}
              delta={DEMO_EXEC_GROWTH_METRICS.yoyRevenue}
              periodLabel="revenue"
            />
            <ExecutiveStatCard
              icon={Users}
              label="Agent Growth"
              value={`+${DEMO_EXEC_GROWTH_METRICS.yoyAgents}%`}
              delta={DEMO_EXEC_GROWTH_METRICS.yoyAgents}
              periodLabel="year-over-year"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'cohorts', label: 'Cohort Analysis', icon: Users },
              { value: 'projections', label: 'Projections', icon: Milestone },
            ]}
          >
            {/* ════════════════ OVERVIEW TAB ════════════════ */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Growth Scorecard */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Growth Scorecard"
                  subtitle="Key growth metrics across revenue, agents, and policies"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {GROWTH_METRICS.map((metric) => {
                    const isPositive = metric.value > 0;
                    const isHigh = metric.value > 20;
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
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: RADIUS.input,
                                  backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <metric.icon
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: isPositive ? '#059669' : '#dc2626',
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: TYPE.caption,
                                  fontWeight: 600,
                                  color: COLORS.gray[600],
                                }}
                              >
                                {metric.label}
                              </span>
                            </div>
                            {isHigh && (
                              <Flame style={{ width: 16, height: 16, color: '#ea580c' }} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isPositive ? (
                              <ArrowUpRight style={{ width: 18, height: 18, color: '#059669' }} />
                            ) : (
                              <ArrowDownRight style={{ width: 18, height: 18, color: '#dc2626' }} />
                            )}
                            <span
                              className="font-bold"
                              style={{
                                fontSize: TYPE.section,
                                color: isPositive ? '#059669' : '#dc2626',
                              }}
                            >
                              +{metric.value}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Metric Composed Chart */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Multi-Metric Trends"
                  subtitle="Revenue, agents, and policies over 6 months"
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
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart
                        data={DEMO_EXEC_MONTHLY_TRENDS.slice(0, 6).map((d) => ({ ...d }))}
                        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={{ stroke: COLORS.gray[200] }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="revenue"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => fmtCurrency(v)}
                        />
                        <YAxis
                          yAxisId="count"
                          orientation="right"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => {
                                if (v > 1000) return fmtCurrency(v);
                                return v.toString();
                              }}
                            />
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: TYPE.caption }} />
                        <Area
                          yAxisId="revenue"
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          fill="url(#revenueGradient)"
                          dot={{ r: 3, fill: '#ea580c' }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="count"
                          type="monotone"
                          dataKey="agents"
                          name="Agents"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#3b82f6' }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="count"
                          type="monotone"
                          dataKey="policies"
                          name="Policies"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#10b981' }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ COHORT ANALYSIS TAB ════════════════ */}
            <TabsContent value="cohorts" className="mt-6 space-y-6">
              {/* Cohort Retention Table */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Cohort Retention"
                  subtitle="Quarterly hiring cohorts with retention and revenue performance"
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
                            {['Cohort', 'Agents Hired', 'Retained', 'Retention Rate', 'Avg Revenue'].map(
                              (header) => (
                                <th
                                  key={header}
                                  className="text-left font-semibold text-gray-600 px-6 py-4"
                                  style={{ fontSize: TYPE.caption }}
                                >
                                  {header}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_EXEC_COHORT_DATA.map((cohort) => {
                            const retentionColor =
                              cohort.retentionRate > 90
                                ? '#047857'
                                : cohort.retentionRate >= 85
                                ? '#b45309'
                                : '#b91c1c';
                            const retentionBg =
                              cohort.retentionRate > 90
                                ? '#ecfdf5'
                                : cohort.retentionRate >= 85
                                ? '#fffbeb'
                                : '#fef2f2';

                            return (
                              <tr
                                key={cohort.cohort}
                                className="transition-colors hover:bg-gray-50/50"
                                style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                              >
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                    {cohort.cohort}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-700" style={{ fontSize: TYPE.meta }}>
                                  {cohort.agentsHired}
                                </td>
                                <td className="px-6 py-4 text-gray-700" style={{ fontSize: TYPE.meta }}>
                                  {cohort.retained}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 font-semibold"
                                    style={{
                                      fontSize: TYPE.micro,
                                      color: retentionColor,
                                      backgroundColor: retentionBg,
                                      borderRadius: RADIUS.pill,
                                    }}
                                  >
                                    {cohort.retentionRate}%
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                    {fmtCurrency(cohort.avgRevenue)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cohort Performance Bar Chart */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Cohort Revenue Performance"
                  subtitle="Average revenue per agent by hiring cohort"
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
                      <BarChart
                        data={cohortBarData}
                        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                        <XAxis
                          dataKey="cohort"
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
                            <ExecutiveGlassTooltip formatter={(v: number) => fmtCurrency(v)} />
                          }
                        />
                        <Bar
                          dataKey="avgRevenue"
                          name="Avg Revenue"
                          fill="#ea580c"
                          radius={[6, 6, 0, 0]}
                          barSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ PROJECTIONS TAB ════════════════ */}
            <TabsContent value="projections" className="mt-6 space-y-6">
              {/* Forward Projection Chart */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Revenue Projection"
                  subtitle="Actual (solid) vs projected (dashed) revenue over 9 months"
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
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={projectionData}
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
                            <ExecutiveGlassTooltip formatter={(v: number) => fmtCurrency(v)} />
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: TYPE.caption }} />
                        <Line
                          type="monotone"
                          dataKey="actualRevenue"
                          name="Actual Revenue"
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#ea580c' }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="projectedRevenue"
                          name="Projected Revenue"
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          strokeDasharray="8 4"
                          dot={{ r: 4, fill: '#fff', stroke: '#ea580c', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Growth Milestones */}
              <div>
                <SectionHeader
                  icon={Milestone}
                  title="Growth Milestones"
                  subtitle="Upcoming targets with projected achievement dates"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {MILESTONES.map((milestone) => {
                    const progress = Math.min(
                      Math.round((milestone.current / milestone.target) * 100),
                      100
                    );
                    const formattedCurrent =
                      milestone.target >= 1000
                        ? fmtCurrency(milestone.current)
                        : typeof milestone.current === 'number' && milestone.target <= 100
                        ? `${milestone.current}%`
                        : `${milestone.current}`;
                    const formattedTarget =
                      milestone.target >= 1000
                        ? fmtCurrency(milestone.target)
                        : typeof milestone.target === 'number' && milestone.target <= 100
                        ? `${milestone.target}%`
                        : `${milestone.target}`;

                    return (
                      <Card
                        key={milestone.title}
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: RADIUS.input,
                                backgroundColor: `${milestone.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <milestone.icon
                                style={{ width: 18, height: 18, color: milestone.color }}
                              />
                            </div>
                            <h4
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {milestone.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                              Current: {formattedCurrent}
                            </span>
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                              Target: {formattedTarget}
                            </span>
                          </div>

                          <ProgressBar value={progress} color={milestone.color} />

                          <div className="flex items-center justify-between mt-3">
                            <span
                              className="font-semibold"
                              style={{ fontSize: TYPE.meta, color: milestone.color }}
                            >
                              {progress}%
                            </span>
                            <div className="flex items-center gap-1">
                              <Calendar
                                style={{ width: 12, height: 12, color: COLORS.gray[400] }}
                              />
                              <span
                                style={{
                                  fontSize: TYPE.micro,
                                  color: COLORS.gray[500],
                                  fontWeight: 600,
                                }}
                              >
                                {milestone.projectedDate}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveGrowthAnalytics;
