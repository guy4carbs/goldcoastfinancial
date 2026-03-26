/**
 * Executive Team Performance — Cross-team metrics, rankings, and productivity analysis
 * Heritage Design System — Orange/Amber theme
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Trophy,
  Crown,
  TrendingUp,
  BarChart3,
  Star,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
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
  DEMO_TEAMS,
  DEMO_TOP_PERFORMERS,
  DEMO_EXEC_AGENT_ROSTER,
  DEMO_ORG_METRICS,
} from './executiveConstants';

// ─── TEAM COLORS ─────────────────────────────
const TEAM_COLORS: Record<string, string> = {
  Alpha: '#ea580c',
  Beta: '#f59e0b',
  Gamma: '#10b981',
  Delta: '#3b82f6',
  Echo: '#8b5cf6',
};

// ─── TIER HELPERS ────────────────────────────
function getTier(quotaAttainment: number) {
  if (quotaAttainment > 110) return { label: 'Elite', bg: '#fff7ed', text: '#ea580c', border: '#ea580c' };
  if (quotaAttainment >= 90) return { label: 'Proven', bg: '#ecfdf5', text: '#059669', border: '#10b981' };
  if (quotaAttainment >= 70) return { label: 'Rising', bg: '#eff6ff', text: '#2563eb', border: '#3b82f6' };
  return { label: 'New', bg: '#f9fafb', text: '#6b7280', border: '#9ca3af' };
}

function getStatusStyle(status: 'on-track' | 'at-risk' | 'behind') {
  const map = {
    'on-track': { bg: '#ecfdf5', text: '#047857', label: 'On Track' },
    'at-risk': { bg: '#fffbeb', text: '#b45309', label: 'At Risk' },
    'behind': { bg: '#fef2f2', text: '#b91c1c', label: 'Behind' },
  };
  return map[status];
}

// ─── API RESPONSE TYPES ─────────────────────
type TeamData = {
  id: string;
  name: string;
  manager: string;
  agents: number;
  revenue: number;
  pipeline: number;
  conversion: number;
  status: 'on-track' | 'at-risk' | 'behind';
};

type TopPerformerData = {
  id: string;
  name: string;
  role: string;
  team: string;
  revenue: number;
  deals: number;
  trend: 'up' | 'down';
};

type AgentRosterData = {
  id: string;
  name: string;
  team: string;
  manager: string;
  status: 'active' | 'on-leave' | 'probation';
  contractLevel: number;
  quotaAttainment: number;
  revenueMTD: number;
  complianceScore: number;
  startDate: string;
  role: string;
};

type ExecDashboardResponse = {
  orgMetrics: {
    activeAgents: number;
    newAgentsThisMonth: number;
    totalRevenue: number;
    [key: string]: unknown;
  };
  teams: TeamData[];
  topPerformers: TopPerformerData[];
  [key: string]: unknown;
};

// ─── TREND DATA (6 months, inline) ──────────
const TEAM_TREND_DATA = [
  { month: 'Oct', Alpha: 82000, Beta: 71000, Gamma: 58000, Delta: 44000, Echo: 26000 },
  { month: 'Nov', Alpha: 88000, Beta: 76000, Gamma: 62000, Delta: 48000, Echo: 28000 },
  { month: 'Dec', Alpha: 78000, Beta: 68000, Gamma: 55000, Delta: 42000, Echo: 24000 },
  { month: 'Jan', Alpha: 96000, Beta: 84000, Gamma: 68000, Delta: 52000, Echo: 32000 },
  { month: 'Feb', Alpha: 105000, Beta: 92000, Gamma: 74000, Delta: 58000, Echo: 36000 },
  { month: 'Mar', Alpha: 112000, Beta: 98000, Gamma: 80000, Delta: 62000, Echo: 38000 },
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

// ─── MAIN COMPONENT ─────────────────────────
export function ExecutiveTeamPerformance() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // ── Fetch real data from APIs ──
  const { data: dashboardData } = useQuery<ExecDashboardResponse>({
    queryKey: ['/api/executive/dashboard'],
  });

  const { data: teamTreeData } = useQuery({
    queryKey: ['/api/hierarchy/team-tree'],
  });

  // ── Local variables with real data → DEMO fallbacks ──
  const teams: TeamData[] = useMemo(() => {
    if (dashboardData?.teams && dashboardData.teams.length > 0) {
      return dashboardData.teams.map((t) => ({
        ...t,
        id: String(t.id),
        status: (t.status || 'behind') as 'on-track' | 'at-risk' | 'behind',
      }));
    }
    return DEMO_TEAMS as unknown as TeamData[];
  }, [dashboardData]);

  const topPerformers: TopPerformerData[] = useMemo(() => {
    if (dashboardData?.topPerformers && dashboardData.topPerformers.length > 0) {
      return dashboardData.topPerformers.map((p) => ({
        ...p,
        id: String(p.id),
        team: String(p.team).replace('Team ', ''),
        trend: (p.trend || 'up') as 'up' | 'down',
      }));
    }
    return DEMO_TOP_PERFORMERS as unknown as TopPerformerData[];
  }, [dashboardData]);

  const agentRoster: AgentRosterData[] = useMemo(() => {
    // For now, DEMO_EXEC_AGENT_ROSTER is the only source for the full roster
    // The team-tree endpoint could enrich this in the future
    return DEMO_EXEC_AGENT_ROSTER as unknown as AgentRosterData[];
  }, [teamTreeData]);

  // ── Derived data ──
  const teamBarData = useMemo(
    () =>
      teams.map((t) => ({
        name: t.name.replace('Team ', ''),
        revenue: t.revenue,
        fill: TEAM_COLORS[t.name.replace('Team ', '')] || '#ea580c',
      })),
    [teams]
  );

  const sortedRoster = useMemo(
    () => [...agentRoster].sort((a, b) => b.quotaAttainment - a.quotaAttainment),
    [agentRoster]
  );

  // Count on-track teams
  const onTrackCount = teams.filter((t) => t.status === 'on-track').length;

  // Org metrics with fallback
  const orgMetrics = dashboardData?.orgMetrics ?? DEMO_ORG_METRICS;

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
          icon={Users}
          title="Team Performance"
          subtitle="Cross-team metrics, rankings, and productivity analysis"
        />

        {/* ── Top-Level Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Users}
              label="Active Agents"
              value={`${orgMetrics.activeAgents}`}
              delta={orgMetrics.newAgentsThisMonth}
              periodLabel="new this month"
            />
            <ExecutiveStatCard
              icon={Target}
              label="Avg Quota Attainment"
              value="87%"
              delta={4.2}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Trophy}
              label={`Top ${teams[0]?.name ?? 'Team Alpha'}`}
              value={fmtCurrency(teams[0]?.revenue ?? 542000)}
              delta={12}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={BarChart3}
              label="Teams On Track"
              value={`${onTrackCount}/${teams.length}`}
              delta={onTrackCount >= 3 ? 1 : -1}
              periodLabel="vs last month"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="comparison"
            tabs={[
              { value: 'comparison', label: 'Team Comparison', icon: BarChart3 },
              { value: 'rankings', label: 'Agent Rankings', icon: Award },
              { value: 'trends', label: 'Trends', icon: TrendingUp },
              { value: 'details', label: 'Team Details', icon: Users },
            ]}
          >
            {/* ════════════════ TEAM COMPARISON TAB ════════════════ */}
            <TabsContent value="comparison" className="mt-6 space-y-6">
              {/* Revenue Bar Chart */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Revenue by Team"
                  subtitle="Side-by-side comparison of team revenue"
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
                        data={teamBarData}
                        layout="vertical"
                        margin={{ top: 8, right: 32, left: 16, bottom: 0 }}
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
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: TYPE.meta, fill: COLORS.gray[700], fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip formatter={(v: number) => fmtCurrency(v)} />
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          radius={[0, 6, 6, 0]}
                          barSize={28}
                        >
                          {teamBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Team Status Cards */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Team Overview"
                  subtitle="Status and key metrics for each team"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {teams.map((team) => {
                    const status = getStatusStyle(team.status);
                    const teamColor = TEAM_COLORS[team.name.replace('Team ', '')] || '#ea580c';
                    return (
                      <Card
                        key={team.id}
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                          borderLeft: `4px solid ${teamColor}`,
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                              {team.name}
                            </h4>
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
                          </div>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 12 }}>
                            Manager: {team.manager}
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Agents</p>
                              <p className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                {team.agents}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Revenue</p>
                              <p className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                {fmtCurrency(team.revenue)}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Pipeline</p>
                              <p className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                {fmtCurrency(team.pipeline)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.gray[100]}` }}>
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                                Conversion Rate
                              </span>
                              <span
                                className="font-semibold"
                                style={{
                                  fontSize: TYPE.meta,
                                  color: team.conversion >= 22 ? '#047857' : team.conversion >= 18 ? '#b45309' : '#b91c1c',
                                }}
                              >
                                {team.conversion}%
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

            {/* ════════════════ AGENT RANKINGS TAB ════════════════ */}
            <TabsContent value="rankings" className="mt-6 space-y-6">
              {/* Podium */}
              <div>
                <SectionHeader
                  icon={Trophy}
                  title="Top Performers"
                  subtitle="Podium — highest revenue producers this quarter"
                />
                <div className="flex items-end justify-center gap-4" style={{ minHeight: 280 }}>
                  {/* #2 - Left */}
                  <Card
                    className="border-0 flex-1 max-w-[220px]"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent className="p-5 text-center">
                      <div
                        className="mx-auto mb-3 flex items-center justify-center font-bold text-white"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#94a3b8',
                          fontSize: TYPE.body,
                        }}
                      >
                        2
                      </div>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.meta }}>
                        {topPerformers[1]?.name}
                      </p>
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                        Team {topPerformers[1]?.team}
                      </p>
                      <p className="font-bold mt-2" style={{ fontSize: TYPE.body, color: '#ea580c' }}>
                        {fmtCurrency(topPerformers[1]?.revenue ?? 0)}
                      </p>
                      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                        {topPerformers[1]?.deals ?? 0} deals
                      </p>
                    </CardContent>
                  </Card>

                  {/* #1 - Center (tallest) */}
                  <Card
                    className="border-0 flex-1 max-w-[240px]"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: '0 16px 32px rgba(234, 88, 12, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08)',
                      border: '2px solid #fbbf24',
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Crown style={{ width: 24, height: 24, color: '#fbbf24' }} />
                      </div>
                      <div
                        className="mx-auto mb-3 flex items-center justify-center font-bold text-white"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: RADIUS.pill,
                          background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                          fontSize: TYPE.section,
                        }}
                      >
                        1
                      </div>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                        {topPerformers[0]?.name}
                      </p>
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                        Team {topPerformers[0]?.team}
                      </p>
                      <p className="font-bold mt-2" style={{ fontSize: TYPE.section, color: '#ea580c' }}>
                        {fmtCurrency(topPerformers[0]?.revenue ?? 0)}
                      </p>
                      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                        {topPerformers[0]?.deals ?? 0} deals
                      </p>
                      <div className="flex items-center justify-center mt-2 gap-1">
                        <Trophy style={{ width: 14, height: 14, color: '#fbbf24' }} />
                        <span style={{ fontSize: TYPE.micro, color: '#b45309', fontWeight: 600 }}>
                          Top Producer
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* #3 - Right */}
                  <Card
                    className="border-0 flex-1 max-w-[220px]"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent className="p-5 text-center">
                      <div
                        className="mx-auto mb-3 flex items-center justify-center font-bold text-white"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#d97706',
                          fontSize: TYPE.body,
                        }}
                      >
                        3
                      </div>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.meta }}>
                        {topPerformers[2]?.name}
                      </p>
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                        Team {topPerformers[2]?.team}
                      </p>
                      <p className="font-bold mt-2" style={{ fontSize: TYPE.body, color: '#ea580c' }}>
                        {fmtCurrency(topPerformers[2]?.revenue ?? 0)}
                      </p>
                      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                        {topPerformers[2]?.deals ?? 0} deals
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tier Badges Explainer */}
              <div>
                <SectionHeader
                  icon={Star}
                  title="Performance Tiers"
                  subtitle="Agent classification based on quota attainment"
                />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Elite', range: '>110% quota', bg: '#fff7ed', text: '#ea580c', icon: Star },
                    { label: 'Proven', range: '90-110% quota', bg: '#ecfdf5', text: '#059669', icon: Award },
                    { label: 'Rising', range: '70-90% quota', bg: '#eff6ff', text: '#2563eb', icon: TrendingUp },
                    { label: 'New', range: '<70% quota', bg: '#f9fafb', text: '#6b7280', icon: Users },
                  ].map((tier) => (
                    <Card
                      key={tier.label}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.input,
                            backgroundColor: tier.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <tier.icon style={{ width: 18, height: 18, color: tier.text }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ fontSize: TYPE.meta, color: tier.text }}>
                            {tier.label}
                          </p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{tier.range}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Full Leaderboard */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Full Leaderboard"
                  subtitle="All 20 agents ranked by quota attainment"
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
                            {['Rank', 'Name', 'Team', 'Quota %', 'Revenue MTD', 'Tier'].map(
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
                          {sortedRoster.map((agent, idx) => {
                            const tier = getTier(agent.quotaAttainment);
                            return (
                              <tr
                                key={agent.id}
                                className="transition-colors hover:bg-orange-50/50"
                                style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                              >
                                <td className="px-6 py-3">
                                  <span
                                    className="font-bold"
                                    style={{
                                      fontSize: TYPE.meta,
                                      color: idx < 3 ? '#ea580c' : COLORS.gray[600],
                                    }}
                                  >
                                    #{idx + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                    {agent.name}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-stone-600" style={{ fontSize: TYPE.meta }}>
                                  {agent.team}
                                </td>
                                <td className="px-6 py-3">
                                  <span
                                    className="font-semibold"
                                    style={{
                                      fontSize: TYPE.meta,
                                      color: agent.quotaAttainment >= 100 ? '#047857' : agent.quotaAttainment >= 80 ? '#b45309' : '#b91c1c',
                                    }}
                                  >
                                    {agent.quotaAttainment}%
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                    {fmtCurrency(agent.revenueMTD)}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 font-medium"
                                    style={{
                                      fontSize: TYPE.micro,
                                      color: tier.text,
                                      backgroundColor: tier.bg,
                                      borderRadius: RADIUS.pill,
                                      border: `1px solid ${tier.border}20`,
                                    }}
                                  >
                                    {tier.label}
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

            {/* ════════════════ TRENDS TAB ════════════════ */}
            <TabsContent value="trends" className="mt-6">
              <SectionHeader
                icon={TrendingUp}
                title="Team Revenue Trends"
                subtitle="6-month comparison across all teams"
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
                      data={TEAM_TREND_DATA}
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
                      {Object.entries(TEAM_COLORS).map(([team, color]) => (
                        <Line
                          key={team}
                          type="monotone"
                          dataKey={team}
                          name={`Team ${team}`}
                          stroke={color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: color }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════════════ TEAM DETAILS TAB ════════════════ */}
            <TabsContent value="details" className="mt-6 space-y-4">
              <SectionHeader
                icon={Users}
                title="Team Rosters"
                subtitle="Click to expand each team and view agent details"
              />
              {teams.map((team) => {
                const isExpanded = expandedTeam === team.id;
                const status = getStatusStyle(team.status);
                const teamColor = TEAM_COLORS[team.name.replace('Team ', '')] || '#ea580c';
                const teamAgents = agentRoster.filter(
                  (a) => a.team === team.name.replace('Team ', '')
                );

                return (
                  <Card
                    key={team.id}
                    className="border-0 overflow-hidden"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      className="w-full text-left"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: RADIUS.pill,
                                backgroundColor: teamColor,
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                                {team.name}
                              </h4>
                              <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                                {team.manager} &middot; {team.agents} agents
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                              {fmtCurrency(team.revenue)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 font-medium"
                              style={{
                                fontSize: TYPE.micro,
                                color: status.text,
                                backgroundColor: status.bg,
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {status.label}
                            </span>
                            {isExpanded ? (
                              <ChevronUp style={{ width: 18, height: 18, color: COLORS.gray[400] }} />
                            ) : (
                              <ChevronDown style={{ width: 18, height: 18, color: COLORS.gray[400] }} />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </button>

                    {/* Expanded Roster */}
                    {isExpanded && teamAgents.length > 0 && (
                      <div
                        style={{
                          borderTop: `1px solid ${COLORS.gray[100]}`,
                        }}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                                {['Name', 'Role', 'Quota %', 'Revenue MTD', 'Compliance'].map(
                                  (header) => (
                                    <th
                                      key={header}
                                      className="text-left font-semibold text-stone-500 px-6 py-3"
                                      style={{ fontSize: TYPE.micro }}
                                    >
                                      {header}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {teamAgents.map((agent) => (
                                <tr
                                  key={agent.id}
                                  className="hover:bg-orange-50/50 transition-colors"
                                  style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                                >
                                  <td className="px-6 py-3">
                                    <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                      {agent.name}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-stone-600" style={{ fontSize: TYPE.meta }}>
                                    {agent.role}
                                  </td>
                                  <td className="px-6 py-3">
                                    <span
                                      className="font-semibold"
                                      style={{
                                        fontSize: TYPE.meta,
                                        color: agent.quotaAttainment >= 100 ? '#047857' : agent.quotaAttainment >= 80 ? '#b45309' : '#b91c1c',
                                      }}
                                    >
                                      {agent.quotaAttainment}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                      {fmtCurrency(agent.revenueMTD)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <span
                                      className="font-semibold"
                                      style={{
                                        fontSize: TYPE.meta,
                                        color: agent.complianceScore >= 95 ? '#047857' : agent.complianceScore >= 85 ? '#b45309' : '#b91c1c',
                                      }}
                                    >
                                      {agent.complianceScore}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveTeamPerformance;
