/**
 * Executive Policy Pipeline
 * Heritage Design System — Orange/Amber theme
 *
 * Tracks deal flow, conversion rates, pipeline health, and team pipeline breakdown.
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Filter,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowDown,
  Users,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  DEMO_EXEC_PIPELINE_STAGES,
  DEMO_TEAMS,
} from './executiveConstants';

// ─── INLINE DATA: SAMPLE DEALS PER STAGE ─────────
const SAMPLE_DEALS: Record<string, { name: string; value: number; days: number; agent: string }[]> = {
  'New Leads': [
    { name: 'Johnson Family IUL', value: 24600, days: 5, agent: 'Sarah Johnson' },
    { name: 'Patel Term Life', value: 12800, days: 3, agent: 'Mike Chen' },
    { name: 'Rodriguez WL', value: 18200, days: 7, agent: 'David Brown' },
  ],
  'Contacted': [
    { name: 'Williams Annuity', value: 31200, days: 4, agent: 'Rachel Green' },
    { name: 'Lee IUL Policy', value: 22400, days: 6, agent: 'Jessica Lee' },
    { name: 'Thompson FE', value: 8900, days: 2, agent: 'Chris Taylor' },
  ],
  'Qualified': [
    { name: 'Garcia Family IUL', value: 28500, days: 8, agent: 'Sarah Johnson' },
    { name: 'Martinez WL', value: 15600, days: 5, agent: 'Mike Chen' },
  ],
  'Proposal': [
    { name: 'Kim IUL Package', value: 42000, days: 10, agent: 'Rachel Green' },
    { name: 'Davis Term Bundle', value: 19800, days: 7, agent: 'David Brown' },
  ],
  'Negotiation': [
    { name: 'Wilson Annuity', value: 35600, days: 12, agent: 'Jessica Lee' },
    { name: 'Anderson IUL', value: 28400, days: 9, agent: 'Sarah Johnson' },
  ],
  'Closed Won': [
    { name: 'Taylor WL Policy', value: 24600, days: 1, agent: 'Mike Chen' },
    { name: 'Brown FE Package', value: 11200, days: 1, agent: 'Chris Taylor' },
    { name: 'Clark IUL Premium', value: 38900, days: 1, agent: 'Rachel Green' },
  ],
};

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
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
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

// ─── STATUS STYLE ─────────────────────────────
function getStatusStyle(status: 'on-track' | 'at-risk' | 'behind') {
  const map = {
    'on-track': { bg: '#ecfdf5', text: '#047857', label: 'On Track' },
    'at-risk': { bg: '#fffbeb', text: '#b45309', label: 'At Risk' },
    'behind': { bg: '#fef2f2', text: '#b91c1c', label: 'Behind' },
  };
  return map[status];
}

// ─── MAIN COMPONENT ─────────────────────────────
// ─── PIPELINE STAGE CONFIG ─────────────────────────
const PIPELINE_STAGE_ORDER = [
  'new', 'contacted', 'qualified', 'appointment_set', 'quoted',
  'application', 'underwriting', 'issued', 'placed', 'lost',
] as const;

const PIPELINE_STAGE_COLORS: Record<string, string> = {
  new: '#fdba74',
  contacted: '#fb923c',
  qualified: '#f97316',
  appointment_set: '#ea580c',
  quoted: '#c2410c',
  application: '#9a3412',
  underwriting: '#7c2d12',
  issued: '#dc2626',
  placed: '#22c55e',
  lost: '#b91c1c',
};

const PIPELINE_STAGE_LABELS: Record<string, string> = {
  new: 'New Leads',
  contacted: 'Contacted',
  qualified: 'Qualified',
  appointment_set: 'Appointment Set',
  quoted: 'Quoted',
  application: 'Application',
  underwriting: 'Underwriting',
  issued: 'Issued',
  placed: 'Placed',
  lost: 'Lost',
};

export function ExecutivePipeline() {
  // Fetch real CRM dashboard data
  const { data: dashboardData } = useQuery<{
    summary: { totalLeads: number; totalClients: number; totalPipelineValue: number; conversionRate: number; staleLeadsCount: number };
    leadsByStatus: Record<string, number>;
    funnel: Array<{ stage: string; count: number; conversionFromPrevious: number }>;
    pipeline: Record<string, { value: number; count: number }>;
    sources: Array<{ source: string; totalLeads: number; wonLeads: number; conversionRate: number; avgValue: number; totalWonValue: number }>;
    performance: { leadsThisMonth: number; wonThisMonth: number; revenueThisMonth: number; leadsThisWeek: number };
  }>({ queryKey: ['/api/crm/dashboard'] });

  // Map real pipeline data to the stage shape, falling back to DEMO data
  const pipelineStages: Array<{ stage: string; count: number; value: number; color: string; conversionRate?: number }> = (() => {
    if (dashboardData?.pipeline && Object.keys(dashboardData.pipeline).length > 0) {
      const stages: Array<{ stage: string; count: number; value: number; color: string; conversionRate?: number }> = [];
      for (const key of PIPELINE_STAGE_ORDER) {
        const entry = dashboardData.pipeline[key];
        if (entry) {
          // Find matching funnel entry for conversion rate
          const funnelEntry = dashboardData.funnel?.find((f) => f.stage === key);
          stages.push({
            stage: PIPELINE_STAGE_LABELS[key] || key,
            count: entry.count,
            value: entry.value,
            color: PIPELINE_STAGE_COLORS[key] || '#ea580c',
            conversionRate: funnelEntry?.conversionFromPrevious,
          });
        }
      }
      return stages.length > 0 ? stages : [...DEMO_EXEC_PIPELINE_STAGES];
    }
    return [...DEMO_EXEC_PIPELINE_STAGES];
  })();

  // Summary stats from real data (fallback to hardcoded demo values)
  const totalPipelineValue = dashboardData?.summary?.totalPipelineValue ?? 4800000;
  const totalActiveDeals = dashboardData?.summary?.totalLeads ?? 142;
  const staleDealsCount = dashboardData?.summary?.staleLeadsCount ?? 18;

  // Compute max count for funnel width calculation
  const maxCount = Math.max(...pipelineStages.map((s) => s.count));

  // Team pipeline data for bar chart
  const teamPipelineData = DEMO_TEAMS.map((t) => ({
    name: t.name.replace('Team ', ''),
    pipeline: t.pipeline,
  }));

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
          icon={ClipboardList}
          title="Policy Pipeline"
          subtitle="Track deal flow, conversion rates, and pipeline health"
        />

        {/* ── Stat Cards ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Layers}
              label="Active Pipeline"
              value={fmtCurrency(totalPipelineValue)}
              delta={28}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={ClipboardList}
              label="Active Deals"
              value={String(totalActiveDeals)}
              delta={15}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={ShieldCheck}
              label="Coverage Ratio"
              value="3.2x"
              delta={8}
              periodLabel="vs target"
            />
            <ExecutiveStatCard
              icon={AlertTriangle}
              label="Stale Deals"
              value={String(staleDealsCount)}
              delta={-12}
              periodLabel="vs last month"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Pipeline Overview', icon: Layers },
              { value: 'funnel', label: 'Funnel Analysis', icon: Filter },
              { value: 'deal-flow', label: 'Deal Flow', icon: ClipboardList },
              { value: 'by-team', label: 'By Team', icon: Users },
            ]}
          >
            {/* ════════════════ PIPELINE OVERVIEW TAB ════════════════ */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Funnel Visualization */}
              <div>
                <SectionHeader
                  icon={Filter}
                  title="Pipeline Funnel"
                  subtitle={`${pipelineStages.length} stages from lead to close`}
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
                    <div className="flex flex-col items-center" style={{ gap: GRID.spacing.xs }}>
                      {pipelineStages.map((stage) => {
                        const widthPercent = Math.max((stage.count / maxCount) * 100, 20);
                        return (
                          <motion.div
                            key={stage.stage}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              width: `${widthPercent}%`,
                              minWidth: 200,
                              backgroundColor: stage.color,
                              borderRadius: RADIUS.button,
                              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>
                              {stage.stage}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-white/80" style={{ fontSize: TYPE.caption }}>
                                {stage.count} deals
                              </span>
                              <span className="font-bold text-white" style={{ fontSize: TYPE.meta }}>
                                {fmtCurrency(stage.value)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Indicators */}
              <div>
                <SectionHeader
                  icon={ShieldCheck}
                  title="Pipeline Health"
                  subtitle="Key health indicators for your pipeline"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: GRID.spacing.md,
                  }}
                >
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Pipeline Coverage',
                      value: '3.2x',
                      subtitle: 'Target: 3.0x',
                      color: '#10b981',
                    },
                    {
                      icon: AlertTriangle,
                      title: 'Stale Deal Alert',
                      value: `${staleDealsCount} deals`,
                      subtitle: '>30 days without activity',
                      color: '#f59e0b',
                    },
                    {
                      icon: Clock,
                      title: 'Average Stage Time',
                      value: '12 days',
                      subtitle: 'Across all stages',
                      color: '#3b82f6',
                    },
                  ].map((item) => (
                    <Card
                      key={item.title}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.input,
                              backgroundColor: `${item.color}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <item.icon style={{ width: 18, height: 18, color: item.color }} />
                          </div>
                          <span
                            className="font-semibold text-stone-700"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {item.title}
                          </span>
                        </div>
                        <p
                          className="font-bold text-stone-900"
                          style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                        >
                          {item.value}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
                          {item.subtitle}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ════════════════ FUNNEL ANALYSIS TAB ════════════════ */}
            <TabsContent value="funnel" className="mt-6">
              <SectionHeader
                icon={Filter}
                title="Stage-to-Stage Conversion"
                subtitle="Conversion rates and drop-off between pipeline stages"
              />
              <div className="flex flex-col items-center" style={{ gap: 0 }}>
                {pipelineStages.map((stage, idx) => {
                  const prevStage = idx > 0 ? pipelineStages[idx - 1] : null;
                  const dropOff = prevStage ? prevStage.count - stage.count : 0;

                  return (
                    <div key={stage.stage} className="flex flex-col items-center w-full" style={{ maxWidth: 600 }}>
                      {/* Conversion arrow between stages */}
                      {idx > 0 && (
                        <div
                          className="flex items-center justify-center"
                          style={{
                            padding: `${GRID.spacing.sm}px 0`,
                            gap: GRID.spacing.md,
                            width: '100%',
                          }}
                        >
                          <div className="flex flex-col items-center" style={{ gap: 4 }}>
                            <ArrowDown style={{ width: 20, height: 20, color: COLORS.gray[400] }} />
                            <span
                              className="font-bold"
                              style={{
                                fontSize: TYPE.meta,
                                color: (prevStage!.conversionRate ?? 0) >= 60 ? '#10b981' : '#f59e0b',
                              }}
                            >
                              {prevStage!.conversionRate ?? 0}%
                            </span>
                            <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                              conversion
                            </span>
                          </div>
                          {dropOff > 0 && (
                            <div className="flex items-center" style={{ gap: 4 }}>
                              <ArrowRight style={{ width: 14, height: 14, color: '#ef4444' }} />
                              <span
                                className="font-medium"
                                style={{ fontSize: TYPE.caption, color: '#ef4444' }}
                              >
                                {dropOff} dropped
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stage Card */}
                      <Card
                        className="border-0 w-full"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                          borderLeft: `4px solid ${stage.color}`,
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: stage.color,
                                }}
                              />
                              <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.body }}>
                                {stage.stage}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-stone-600" style={{ fontSize: TYPE.meta }}>
                                {stage.count} deals
                              </span>
                              <span className="font-bold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                {fmtCurrency(stage.value)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ DEAL FLOW TAB ════════════════ */}
            <TabsContent value="deal-flow" className="mt-6">
              <SectionHeader
                icon={ClipboardList}
                title="Deal Flow Board"
                subtitle="Active deals by pipeline stage"
              />
              <div
                className="overflow-x-auto"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${pipelineStages.length}, minmax(200px, 1fr))`,
                  gap: GRID.spacing.sm,
                }}
              >
                {pipelineStages.map((stage) => {
                  const deals = SAMPLE_DEALS[stage.stage] || [];
                  return (
                    <div key={stage.stage}>
                      {/* Column Header */}
                      <div
                        className="text-center"
                        style={{
                          padding: `${GRID.spacing.sm}px`,
                          marginBottom: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: `${stage.color}12`,
                        }}
                      >
                        <p className="font-semibold" style={{ fontSize: TYPE.meta, color: stage.color }}>
                          {stage.stage}
                        </p>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                          {stage.count} deals
                        </p>
                      </div>

                      {/* Deal Cards */}
                      <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                        {deals.map((deal) => (
                          <Card
                            key={deal.name}
                            className="border-0"
                            style={{
                              ...GLASS.css.light,
                              borderRadius: RADIUS.card,
                              boxShadow: SHADOW.card,
                            }}
                          >
                            <CardContent className="p-3">
                              <p
                                className="font-semibold text-stone-900 truncate"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {deal.name}
                              </p>
                              <p
                                className="font-bold"
                                style={{ fontSize: TYPE.meta, color: '#ea580c', marginTop: 4 }}
                              >
                                {fmtCurrency(deal.value)}
                              </p>
                              <div
                                className="flex items-center justify-between"
                                style={{ marginTop: GRID.spacing.xs }}
                              >
                                <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                                  {deal.days}d in stage
                                </span>
                                <span
                                  className="truncate"
                                  style={{
                                    fontSize: TYPE.micro,
                                    color: COLORS.gray[500],
                                    maxWidth: 80,
                                  }}
                                >
                                  {deal.agent}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ BY TEAM TAB ════════════════ */}
            <TabsContent value="by-team" className="mt-6 space-y-6">
              {/* Team Pipeline Bar Chart */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Pipeline by Team"
                  subtitle="Pipeline value comparison across teams"
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
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={teamPipelineData}
                        layout="vertical"
                        margin={{ top: 8, right: 24, left: 60, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={{ stroke: COLORS.gray[200] }}
                          tickLine={false}
                          tickFormatter={(v: number) => fmtCurrency(v)}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: TYPE.caption, fill: COLORS.gray[700] }}
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
                          dataKey="pipeline"
                          name="Pipeline Value"
                          fill="#ea580c"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Team Pipeline Table */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Team Pipeline Details"
                  subtitle="Pipeline value, conversion, and status by team"
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
                            {['Team', 'Pipeline Value', 'Conversion Rate', 'Status'].map((h) => (
                              <th
                                key={h}
                                className="text-left font-semibold text-stone-600 px-6 py-4"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_TEAMS.map((team) => {
                            const status = getStatusStyle(team.status);
                            return (
                              <tr
                                key={team.id}
                                className="transition-colors hover:bg-orange-50/50"
                                style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
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
                                    style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                                  >
                                    {team.manager}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className="font-semibold text-stone-900"
                                    style={{ fontSize: TYPE.meta }}
                                  >
                                    {fmtCurrency(team.pipeline)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className="font-semibold"
                                    style={{
                                      fontSize: TYPE.meta,
                                      color:
                                        team.conversion >= 22
                                          ? '#047857'
                                          : team.conversion >= 18
                                          ? '#b45309'
                                          : '#b91c1c',
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
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutivePipeline;
