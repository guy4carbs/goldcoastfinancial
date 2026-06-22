/**
 * Executive KPIs — Key Performance Indicators
 * Heritage Design System — Orange/Amber theme
 *
 * Tracks organizational performance against strategic targets
 * with detailed breakdowns by team, trends, and OKR progress.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Target,
  LayoutDashboard,
  TrendingUp,
  Users,
  Crosshair,
  DollarSign,
  FileText,
  UserCheck,
  BarChart3,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid, DeltaBadge } from './primitives/ExecutiveStatCard';
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
  DEMO_QUARTERLY_GOALS,
  DEMO_EXEC_MONTHLY_TRENDS,
  TEAM_STATUS_COLORS,
} from './executiveConstants';

// KPI_CARDS and TARGET_CARDS are now built inside the component to use live API data.

// ─── TEAM STATUS STYLES ─────────────────────────
function getStatusStyle(status: 'on-track' | 'at-risk' | 'behind') {
  const map = {
    'on-track': { bg: '#ecfdf5', text: '#047857', label: 'On Track' },
    'at-risk': { bg: '#fffbeb', text: '#b45309', label: 'At Risk' },
    'behind': { bg: '#fef2f2', text: '#b91c1c', label: 'Behind' },
  };
  return map[status];
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

// ─── PROGRESS BAR ───────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
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

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveKPIs() {
  // ── Live data queries ──
  const { data: kpiData } = useQuery<{
    leads: { total: number; thisMonth: number; won: number; wonThisMonth: number; totalRevenue: number; revenueThisMonth: number; pipelineValue: number; avgLeadScore: number };
    calls: { total: number; thisMonth: number; avgDuration: number };
    licenses: { total: number; valid: number; expiring: number; expired: number };
  }>({ queryKey: ['/api/executive/kpis'], refetchInterval: 15000 });

  const { data: dashboardData } = useQuery<{
    orgMetrics?: typeof DEMO_ORG_METRICS;
    teams?: typeof DEMO_TEAMS;
    topPerformers?: any[];
    quarterlyGoals?: typeof DEMO_QUARTERLY_GOALS;
    monthlyTrends?: typeof DEMO_EXEC_MONTHLY_TRENDS;
  }>({ queryKey: ['/api/executive/dashboard'], refetchInterval: 15000 });

  // ── Map API responses to local variables, falling back to DEMO_* constants ──
  const orgMetrics = useMemo(() => {
    const dash = dashboardData?.orgMetrics;
    const kpi = kpiData?.leads;
    if (dash) return dash;
    if (kpi) {
      // Build orgMetrics shape from KPI endpoint data
      return {
        ...DEMO_ORG_METRICS,
        totalRevenue: kpi.totalRevenue,
        pipelineValue: kpi.pipelineValue,
        activeAgents: DEMO_ORG_METRICS.activeAgents, // not in KPI endpoint
        conversionRate: kpi.won && kpi.total ? Math.round((kpi.won / kpi.total) * 1000) / 10 : DEMO_ORG_METRICS.conversionRate,
        quarterlyProgress: DEMO_ORG_METRICS.quarterlyTarget > 0
          ? Math.round((kpi.totalRevenue / DEMO_ORG_METRICS.quarterlyTarget) * 100)
          : DEMO_ORG_METRICS.quarterlyProgress,
      };
    }
    return DEMO_ORG_METRICS;
  }, [kpiData, dashboardData]);

  const teams = dashboardData?.teams ?? DEMO_TEAMS;

  const quarterlyGoals = useMemo(() => {
    if (dashboardData?.quarterlyGoals) return dashboardData.quarterlyGoals;
    if (kpiData?.leads) {
      // Patch the Revenue goal with live data
      return DEMO_QUARTERLY_GOALS.map((goal) => {
        if (goal.label === 'Revenue') {
          const current = kpiData.leads.totalRevenue;
          const target = DEMO_ORG_METRICS.quarterlyTarget;
          return { ...goal, current, target, progress: Math.round((current / target) * 100) };
        }
        if (goal.label === 'New Policies') {
          return { ...goal, current: kpiData.leads.won, progress: Math.round((kpiData.leads.won / goal.target) * 100) };
        }
        return goal;
      });
    }
    return DEMO_QUARTERLY_GOALS;
  }, [kpiData, dashboardData]);

  const monthlyTrends = dashboardData?.monthlyTrends ?? DEMO_EXEC_MONTHLY_TRENDS;

  // ── Build KPI cards from live orgMetrics ──
  const KPI_CARDS = useMemo(() => [
    {
      label: 'Revenue',
      value: fmtCurrency(orgMetrics.totalRevenue),
      target: fmtCurrency(orgMetrics.quarterlyTarget),
      delta: orgMetrics.revenueGrowth,
      progress: orgMetrics.quarterlyProgress,
      icon: DollarSign,
      color: '#ea580c',
    },
    {
      label: 'Pipeline Value',
      value: fmtCurrency(orgMetrics.pipelineValue),
      target: '$5.5M',
      delta: orgMetrics.pipelineGrowth,
      progress: 87,
      icon: BarChart3,
      color: '#f59e0b',
    },
    {
      label: 'Policies Written',
      value: kpiData?.leads?.won?.toString() ?? '412',
      target: '500',
      delta: 12,
      progress: kpiData?.leads?.won ? Math.round((kpiData.leads.won / 500) * 100) : 82,
      icon: FileText,
      color: '#10b981',
    },
    {
      label: 'Win Rate',
      value: `${orgMetrics.conversionRate}%`,
      target: `${orgMetrics.conversionTarget}%`,
      delta: 2.4,
      progress: Math.round((orgMetrics.conversionRate / orgMetrics.conversionTarget) * 100),
      icon: Crosshair,
      color: '#3b82f6',
    },
    {
      label: 'Avg Deal Size',
      value: fmtCurrency(orgMetrics.avgDealSize),
      target: '$20K',
      delta: 8.5,
      progress: 92,
      icon: Award,
      color: '#8b5cf6',
    },
    {
      label: 'Agent Count',
      value: `${orgMetrics.activeAgents}`,
      target: '70',
      delta: orgMetrics.newAgentsThisMonth,
      progress: Math.round((orgMetrics.activeAgents / 70) * 100),
      icon: Users,
      color: '#06b6d4',
    },
    {
      label: 'Retention Rate',
      value: `${orgMetrics.retentionRate}%`,
      target: `${orgMetrics.retentionTarget}%`,
      delta: 1.2,
      progress: Math.round((orgMetrics.retentionRate / orgMetrics.retentionTarget) * 100),
      icon: UserCheck,
      color: '#14b8a6',
    },
    {
      label: 'Revenue / Agent',
      value: fmtCurrency(Math.round(orgMetrics.totalRevenue / orgMetrics.activeAgents)),
      target: '$35K',
      delta: 14,
      progress: 88,
      icon: ArrowUpRight,
      color: '#f43f5e',
    },
  ], [orgMetrics, kpiData]);

  const TARGET_CARDS = useMemo(() => KPI_CARDS.map((kpi) => ({
    label: kpi.label,
    current: kpi.value,
    target: kpi.target,
    progress: kpi.progress,
    icon: kpi.icon,
    color: kpi.color,
  })), [KPI_CARDS]);

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
          icon={Target}
          title="Key Performance Indicators"
          subtitle="Track organizational performance against strategic targets"
        />

        {/* ── Top-Level Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              label="Revenue vs Target"
              value={`${fmtCurrency(orgMetrics.totalRevenue)} / ${fmtCurrency(orgMetrics.quarterlyTarget)}`}
              delta={orgMetrics.revenueGrowth}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={BarChart3}
              label="Pipeline Coverage"
              value={orgMetrics.quarterlyTarget > 0 ? `${(orgMetrics.pipelineValue / orgMetrics.quarterlyTarget).toFixed(1)}x` : '3.2x'}
              delta={orgMetrics.pipelineGrowth}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={Crosshair}
              label="Org Win Rate"
              value={`${orgMetrics.conversionRate}%`}
              delta={2.4}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={UserCheck}
              label="Agent Retention"
              value={`${orgMetrics.retentionRate}%`}
              delta={1.2}
              periodLabel="trailing 12 months"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Overview', icon: LayoutDashboard },
              { value: 'trends', label: 'Trends', icon: TrendingUp },
              { value: 'team', label: 'Team Breakdown', icon: Users },
              { value: 'targets', label: 'Targets', icon: Target },
            ]}
          >
            {/* ════════════════ OVERVIEW TAB ════════════════ */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* 4x2 KPI Grid */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Performance Metrics"
                  subtitle="8 core KPIs with progress against targets"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {KPI_CARDS.map((kpi) => (
                    <Card
                      key={kpi.label}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: RADIUS.input,
                              backgroundColor: `${kpi.color}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <kpi.icon style={{ width: 16, height: 16, color: kpi.color }} />
                          </div>
                          <span
                            style={{
                              fontSize: TYPE.caption,
                              fontWeight: 600,
                              color: COLORS.gray[600],
                            }}
                          >
                            {kpi.label}
                          </span>
                        </div>

                        <p
                          className="font-bold text-stone-900"
                          style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                        >
                          {kpi.value}
                        </p>

                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <span
                            style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                          >
                            Target: {kpi.target}
                          </span>
                          <DeltaBadge value={kpi.delta} />
                        </div>

                        <ProgressBar value={kpi.progress} color={kpi.color} />
                        <p
                          className="text-right mt-1"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          {kpi.progress}%
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quarterly OKR Section */}
              <div>
                <SectionHeader
                  icon={Target}
                  title="Quarterly OKR Progress"
                  subtitle="Key results for Q1 2026"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6 space-y-5">
                    {quarterlyGoals.map((goal) => {
                      const isRevenue = goal.label === 'Revenue';
                      const currentDisplay = isRevenue
                        ? fmtCurrency(goal.current)
                        : goal.current.toLocaleString();
                      const targetDisplay = isRevenue
                        ? fmtCurrency(goal.target)
                        : goal.target.toLocaleString();
                      const progressColor =
                        goal.progress >= 90
                          ? '#10b981'
                          : goal.progress >= 70
                          ? '#f59e0b'
                          : '#ef4444';

                      return (
                        <div key={goal.label}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span
                                className="font-semibold text-stone-800"
                                style={{ fontSize: TYPE.body }}
                              >
                                {goal.label}
                              </span>
                              <span
                                className="ml-3"
                                style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}
                              >
                                {currentDisplay} / {targetDisplay}
                              </span>
                            </div>
                            <span
                              className="font-bold"
                              style={{ fontSize: TYPE.meta, color: progressColor }}
                            >
                              {goal.progress}%
                            </span>
                          </div>
                          <ProgressBar value={goal.progress} color={progressColor} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ TRENDS TAB ════════════════ */}
            <TabsContent value="trends" className="mt-6">
              <SectionHeader
                icon={TrendingUp}
                title="Monthly Trends"
                subtitle="Revenue and policies over 12 months"
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
                      data={monthlyTrends.map((d) => ({ ...d }))}
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
                        yAxisId="revenue"
                        tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => fmtCurrency(v)}
                      />
                      <YAxis
                        yAxisId="policies"
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
                      <Legend
                        wrapperStyle={{ fontSize: TYPE.caption }}
                      />
                      <Line
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#ea580c"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#ea580c' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="policies"
                        type="monotone"
                        dataKey="policies"
                        name="Policies"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#3b82f6' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════════════ TEAM BREAKDOWN TAB ════════════════ */}
            <TabsContent value="team" className="mt-6">
              <SectionHeader
                icon={Users}
                title="Team Breakdown"
                subtitle="Performance by team with status indicators"
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
                        <tr
                          style={{
                            borderBottom: `1px solid ${COLORS.gray[200]}`,
                          }}
                        >
                          {['Team', 'Manager', 'Revenue', 'Pipeline', 'Conversion', 'Status'].map(
                            (header) => (
                              <th
                                key={header}
                                className="text-left font-semibold text-stone-600 px-6 py-4"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team) => {
                          const status = getStatusStyle(team.status);
                          const conversionColor =
                            team.conversion >= 22
                              ? '#047857'
                              : team.conversion >= 18
                              ? '#b45309'
                              : '#b91c1c';

                          return (
                            <tr
                              key={team.id}
                              className="transition-colors hover:bg-orange-50/50"
                              style={{
                                borderBottom: `1px solid ${COLORS.gray[100]}`,
                              }}
                            >
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold text-stone-900"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {team.name}
                                </span>
                                <span
                                  className="block"
                                  style={{
                                    fontSize: TYPE.micro,
                                    color: COLORS.gray[400],
                                  }}
                                >
                                  {team.agents} agents
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {team.manager}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold text-stone-900"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {fmtCurrency(team.revenue)}
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {fmtCurrency(team.pipeline)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold"
                                  style={{
                                    fontSize: TYPE.meta,
                                    color: conversionColor,
                                  }}
                                >
                                  {team.conversion}%
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 font-medium"
                                  style={{
                                    fontSize: TYPE.micro,
                                    color: status.text,
                                    backgroundColor: status.bg,
                                    borderRadius: RADIUS.pill,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: RADIUS.pill,
                                      backgroundColor: status.text,
                                    }}
                                  />
                                  {status.label}
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
            </TabsContent>

            {/* ════════════════ TARGETS TAB ════════════════ */}
            <TabsContent value="targets" className="mt-6">
              <SectionHeader
                icon={Target}
                title="Performance Targets"
                subtitle="Current vs target values across all KPIs"
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: GRID.spacing.sm,
                }}
              >
                {TARGET_CARDS.map((t) => (
                  <Card
                    key={t.label}
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
                            backgroundColor: `${t.color}12`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <t.icon style={{ width: 18, height: 18, color: t.color }} />
                        </div>
                        <span
                          className="font-semibold text-stone-700"
                          style={{ fontSize: TYPE.meta }}
                        >
                          {t.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span
                            style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                          >
                            Current
                          </span>
                          <span
                            className="font-bold text-stone-900"
                            style={{ fontSize: TYPE.title }}
                          >
                            {t.current}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span
                            style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                          >
                            Target
                          </span>
                          <span
                            className="font-semibold"
                            style={{ fontSize: TYPE.body, color: t.color }}
                          >
                            {t.target}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <ProgressBar value={t.progress} color={t.color} />
                        <p
                          className="text-right mt-1"
                          style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                        >
                          {t.progress}% achieved
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveKPIs;
