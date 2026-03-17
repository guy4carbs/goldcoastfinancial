/**
 * Executive Recruiting Pipeline
 * Heritage Design System — Orange/Amber theme
 *
 * Candidate progression tracking, onboarding milestones,
 * and team-level hiring analysis.
 */

import { motion } from 'framer-motion';
import {
  GitBranch,
  Users,
  UserCheck,
  TrendingUp,
  Percent,
  ArrowRight,
  Clipboard,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
  DEMO_EXEC_RECRUITING_FUNNEL,
  DEMO_EXEC_CANDIDATES,
} from './executiveConstants';

// ─── INLINE DATA ──────────────────────────────────────

const ONBOARDING_PHASES = [
  {
    phase: 'Week 1',
    label: 'Orientation',
    description: 'Company intro, compliance training',
  },
  {
    phase: 'Week 2',
    label: 'Product Training',
    description: 'Product knowledge, sales techniques',
  },
  {
    phase: 'Week 3-4',
    label: 'Shadowing',
    description: 'Ride-alongs with senior agents',
  },
  {
    phase: 'Month 2+',
    label: 'Independent',
    description: 'Solo production with mentor check-ins',
  },
];

const SOURCE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  referral: { bg: '#faf5ff', text: '#7c3aed' },
  job_board: { bg: '#eff6ff', text: '#2563eb' },
  event: { bg: '#ecfdf5', text: '#059669' },
  social: { bg: '#fffbeb', text: '#d97706' },
};

const SOURCE_LABELS: Record<string, string> = {
  referral: 'Referral',
  job_board: 'Job Board',
  event: 'Event',
  social: 'Social',
};

// Team hiring data derived from DEMO_TEAMS
const TEAM_HIRING_DATA = [
  { team: 'Alpha', manager: 'Marcus Rivera', currentSize: 16, hiringNeed: 4, filled: 3, open: 1 },
  { team: 'Beta', manager: 'Jennifer Walsh', currentSize: 14, hiringNeed: 3, filled: 2, open: 1 },
  { team: 'Gamma', manager: 'Kevin Park', currentSize: 12, hiringNeed: 3, filled: 2, open: 1 },
  { team: 'Delta', manager: 'Natasha Romero', currentSize: 11, hiringNeed: 2, filled: 1, open: 1 },
  { team: 'Echo', manager: 'Brandon Mills', currentSize: 8, hiringNeed: 1, filled: 0, open: 1 },
];

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
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── SOURCE BADGE ───────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const colors = SOURCE_BADGE_COLORS[source] || { bg: COLORS.gray[100], text: COLORS.gray[600] };
  const label = SOURCE_LABELS[source] || source;
  return (
    <span
      className="inline-flex items-center font-medium px-2 py-0.5"
      style={{
        fontSize: TYPE.micro,
        color: colors.text,
        backgroundColor: colors.bg,
        borderRadius: RADIUS.pill,
      }}
    >
      {label}
    </span>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────

export function ExecutiveRecruitingPipeline() {
  // Group candidates by stage
  const candidatesByStage = DEMO_EXEC_RECRUITING_FUNNEL.reduce<
    Record<string, Array<{ id: string; name: string; source: string; stage: string; daysInStage: number; assignedManager: string; team: string }>>
  >((acc, stage) => {
    acc[stage.stage] = DEMO_EXEC_CANDIDATES.filter((c) => c.stage === stage.stage).map((c) => ({
      id: c.id,
      name: c.name,
      source: c.source as string,
      stage: c.stage,
      daysInStage: c.daysInStage,
      assignedManager: c.assignedManager,
      team: c.team,
    }));
    return acc;
  }, {});

  // Candidates in Onboarding stage
  const onboardingCandidates = DEMO_EXEC_CANDIDATES.filter(
    (c) => c.stage === 'Onboarding'
  ).map((c) => ({
    id: c.id,
    name: c.name,
    source: c.source as string,
    stage: c.stage,
    daysInStage: c.daysInStage,
    assignedManager: c.assignedManager,
    team: c.team,
  }));

  // Bar chart data for team hiring progress
  const teamHiringChartData = TEAM_HIRING_DATA.map((t) => ({
    team: t.team,
    Filled: t.filled,
    Open: t.open,
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
          icon={GitBranch}
          title="Recruiting Pipeline"
          subtitle="Candidate progression and onboarding tracking"
        />

        {/* ── Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Users}
              label="Total in Pipeline"
              value="34"
              delta={15}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={UserCheck}
              label="Interviewing"
              value="8"
              delta={23}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Clipboard}
              label="Onboarding"
              value="5"
              delta={40}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Percent}
              label="Conversion Rate"
              value="32%"
              delta={4}
              periodLabel="vs last quarter"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="pipeline"
            tabs={[
              { value: 'pipeline', label: 'Pipeline', icon: GitBranch },
              { value: 'onboarding', label: 'Onboarding', icon: UserCheck },
              { value: 'by-team', label: 'By Team', icon: Users },
            ]}
          >
            {/* ════════════════ PIPELINE TAB ════════════════ */}
            <TabsContent value="pipeline" className="mt-6 space-y-6">
              <SectionHeader
                icon={GitBranch}
                title="Candidate Pipeline"
                subtitle="Candidates organized by funnel stage"
              />

              <div className="space-y-4">
                {DEMO_EXEC_RECRUITING_FUNNEL.map((stage, idx) => {
                  const candidates = candidatesByStage[stage.stage] || [];
                  const nextStage = DEMO_EXEC_RECRUITING_FUNNEL[idx + 1];

                  return (
                    <div key={stage.stage}>
                      {/* Stage Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h4
                          className="font-semibold text-gray-800"
                          style={{ fontSize: TYPE.body }}
                        >
                          {stage.stage}
                        </h4>
                        <span
                          className="inline-flex items-center justify-center font-bold"
                          style={{
                            fontSize: TYPE.micro,
                            color: 'white',
                            backgroundColor: stage.color,
                            borderRadius: RADIUS.pill,
                            width: 28,
                            height: 22,
                          }}
                        >
                          {stage.count}
                        </span>
                      </div>

                      {/* Candidate Cards */}
                      {candidates.length > 0 ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: GRID.spacing.sm,
                          }}
                        >
                          {candidates.map((candidate) => (
                            <Card
                              key={candidate.id}
                              className="border-0"
                              style={{
                                ...GLASS.css.light,
                                borderRadius: RADIUS.card,
                                boxShadow: SHADOW.card,
                              }}
                            >
                              <CardContent className="p-4">
                                <p
                                  className="font-semibold text-gray-900 mb-2"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {candidate.name}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  <SourceBadge source={candidate.source} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span
                                    style={{
                                      fontSize: TYPE.caption,
                                      color: COLORS.gray[500],
                                    }}
                                  >
                                    {candidate.daysInStage} days in stage
                                  </span>
                                  <span
                                    style={{
                                      fontSize: TYPE.caption,
                                      color: COLORS.gray[400],
                                    }}
                                  >
                                    {candidate.assignedManager}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p
                          className="text-gray-400 italic ml-2"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {stage.count} candidates
                        </p>
                      )}

                      {/* Conversion Arrow */}
                      {nextStage && (
                        <div className="flex items-center gap-2 py-3 pl-4">
                          <ArrowRight
                            style={{
                              width: 16,
                              height: 16,
                              color: COLORS.gray[400],
                            }}
                          />
                          <span
                            style={{
                              fontSize: TYPE.caption,
                              color: COLORS.gray[500],
                            }}
                          >
                            {stage.count} &rarr; {nextStage.count} ={' '}
                            <span className="font-semibold text-gray-700">
                              {((nextStage.count / stage.count) * 100).toFixed(
                                1
                              )}
                              % conversion
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ ONBOARDING TAB ════════════════ */}
            <TabsContent value="onboarding" className="mt-6 space-y-6">
              <SectionHeader
                icon={UserCheck}
                title="Onboarding Milestones"
                subtitle="New hire progression through onboarding phases"
              />

              <div className="space-y-4">
                {ONBOARDING_PHASES.map((phase, idx) => {
                  // Place onboarding candidates in first phase(s) based on daysInStage
                  const phaseCandidates =
                    idx === 0
                      ? onboardingCandidates.filter(
                          (c) => c.daysInStage <= 7
                        )
                      : idx === 1
                      ? onboardingCandidates.filter(
                          (c) => c.daysInStage > 7 && c.daysInStage <= 14
                        )
                      : idx === 2
                      ? onboardingCandidates.filter(
                          (c) => c.daysInStage > 14 && c.daysInStage <= 30
                        )
                      : onboardingCandidates.filter(
                          (c) => c.daysInStage > 30
                        );

                  return (
                    <Card
                      key={phase.phase}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Phase indicator */}
                          <div
                            className="flex-shrink-0 flex items-center justify-center font-bold text-white"
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: RADIUS.input,
                              backgroundColor: '#ea580c',
                              fontSize: TYPE.caption,
                            }}
                          >
                            {phase.phase}
                          </div>

                          <div className="flex-1">
                            <h4
                              className="font-semibold text-gray-900 mb-0.5"
                              style={{ fontSize: TYPE.body }}
                            >
                              {phase.label}
                            </h4>
                            <p
                              style={{
                                fontSize: TYPE.caption,
                                color: COLORS.gray[500],
                                marginBottom: 12,
                              }}
                            >
                              {phase.description}
                            </p>

                            {phaseCandidates.length > 0 ? (
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'repeat(auto-fill, minmax(220px, 1fr))',
                                  gap: GRID.spacing.xs,
                                }}
                              >
                                {phaseCandidates.map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex items-center justify-between"
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: RADIUS.input,
                                      backgroundColor: COLORS.gray[50],
                                      border: `1px solid ${COLORS.gray[100]}`,
                                    }}
                                  >
                                    <div>
                                      <p
                                        className="font-medium text-gray-800"
                                        style={{ fontSize: TYPE.meta }}
                                      >
                                        {c.name}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: TYPE.micro,
                                          color: COLORS.gray[400],
                                        }}
                                      >
                                        {c.team} &middot; Day {c.daysInStage}
                                      </p>
                                    </div>
                                    <SourceBadge source={c.source} />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p
                                className="text-gray-400 italic"
                                style={{ fontSize: TYPE.caption }}
                              >
                                No candidates in this phase
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ BY TEAM TAB ════════════════ */}
            <TabsContent value="by-team" className="mt-6 space-y-6">
              <SectionHeader
                icon={Users}
                title="Team Hiring Overview"
                subtitle="Hiring needs and progress by team"
              />

              {/* Hiring Table */}
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
                          {[
                            'Team',
                            'Manager',
                            'Current Size',
                            'Hiring Need',
                            'Filled',
                            'Open',
                          ].map((header) => (
                            <th
                              key={header}
                              className="text-left font-semibold text-gray-600 px-6 py-4"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TEAM_HIRING_DATA.map((row) => (
                          <tr
                            key={row.team}
                            className="transition-colors hover:bg-gray-50/50"
                            style={{
                              borderBottom: `1px solid ${COLORS.gray[100]}`,
                            }}
                          >
                            <td className="px-6 py-4">
                              <span
                                className="font-semibold text-gray-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                Team {row.team}
                              </span>
                            </td>
                            <td
                              className="px-6 py-4 text-gray-700"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {row.manager}
                            </td>
                            <td
                              className="px-6 py-4 text-gray-700"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {row.currentSize}
                            </td>
                            <td
                              className="px-6 py-4 text-gray-700"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {row.hiringNeed}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="font-semibold"
                                style={{
                                  fontSize: TYPE.meta,
                                  color: row.filled > 0 ? '#047857' : COLORS.gray[400],
                                }}
                              >
                                {row.filled}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center font-medium px-2.5 py-1"
                                style={{
                                  fontSize: TYPE.micro,
                                  color: row.open > 0 ? '#b45309' : '#047857',
                                  backgroundColor:
                                    row.open > 0 ? '#fffbeb' : '#ecfdf5',
                                  borderRadius: RADIUS.pill,
                                }}
                              >
                                {row.open}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Team Hiring Progress Bar Chart */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Hiring Progress Comparison"
                  subtitle="Filled vs open positions by team"
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
                        data={teamHiringChartData}
                        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={COLORS.gray[200]}
                        />
                        <XAxis
                          dataKey="team"
                          tick={{
                            fontSize: TYPE.micro,
                            fill: COLORS.gray[500],
                          }}
                          axisLine={{ stroke: COLORS.gray[200] }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: TYPE.micro,
                            fill: COLORS.gray[500],
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => v.toString()}
                            />
                          }
                        />
                        <Bar
                          dataKey="Filled"
                          fill="#ea580c"
                          radius={[4, 4, 0, 0]}
                          stackId="hiring"
                        />
                        <Bar
                          dataKey="Open"
                          fill={COLORS.gray[300]}
                          radius={[4, 4, 0, 0]}
                          stackId="hiring"
                        />
                      </BarChart>
                    </ResponsiveContainer>
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

export default ExecutiveRecruitingPipeline;
