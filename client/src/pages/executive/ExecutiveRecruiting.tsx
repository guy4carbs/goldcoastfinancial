/**
 * Executive Recruiting Dashboard
 * Heritage Design System — Orange/Amber theme
 *
 * Talent acquisition pipeline, hiring metrics, funnel visualization,
 * source effectiveness, and team hiring goals.
 */

import { motion } from 'framer-motion';
import {
  UserPlus,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  TrendingUp,
  Briefcase,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
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
  DEMO_EXEC_RECRUITING_FUNNEL,
  DEMO_EXEC_CANDIDATES,
} from './executiveConstants';

// ─── INLINE DATA ──────────────────────────────────────

const HIRING_TREND = [
  { month: 'Oct', hires: 4 },
  { month: 'Nov', hires: 5 },
  { month: 'Dec', hires: 3 },
  { month: 'Jan', hires: 6 },
  { month: 'Feb', hires: 7 },
  { month: 'Mar', hires: 8 },
];

const SOURCE_EFFECTIVENESS = [
  { source: 'Referral', conversion: 45 },
  { source: 'Job Board', conversion: 22 },
  { source: 'Events', conversion: 18 },
  { source: 'Social Media', conversion: 15 },
];

const OPEN_REQUISITIONS = [
  { title: 'Senior Agent - Team Echo', priority: 'high' as const },
  { title: 'Agent - Team Delta', priority: 'medium' as const },
  { title: 'Junior Agent - Team Echo', priority: 'low' as const },
];

const TEAM_HIRING_GOALS = [
  { team: 'Alpha', filled: 3, total: 4 },
  { team: 'Beta', filled: 2, total: 3 },
  { team: 'Gamma', filled: 2, total: 3 },
  { team: 'Delta', filled: 1, total: 2 },
  { team: 'Echo', filled: 0, total: 1 },
];

const PRIORITY_COLORS = {
  high: { bg: '#fef2f2', text: '#b91c1c' },
  medium: { bg: '#fffbeb', text: '#b45309' },
  low: { bg: '#eff6ff', text: '#1d4ed8' },
} as const;

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

// ─── MAIN COMPONENT ─────────────────────────────

export function ExecutiveRecruiting() {
  const maxCount = DEMO_EXEC_RECRUITING_FUNNEL[0].count;

  // Get candidates in Onboarding or Offer stage for "Recent New Hires"
  const recentHires = DEMO_EXEC_CANDIDATES.filter(
    (c) => c.stage === 'Onboarding' || c.stage === 'Offer'
  ).slice(0, 4);

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
          icon={UserPlus}
          title="Recruiting Dashboard"
          subtitle="Talent acquisition pipeline and hiring metrics"
        />

        {/* ── Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Users}
              label="Active Candidates"
              value="34"
              delta={12}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={UserPlus}
              label="New Hires MTD"
              value="8"
              delta={33}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Clock}
              label="Avg Time to Hire"
              value="22 days"
              delta={-8}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={DollarSign}
              label="Cost per Hire"
              value={fmtCurrency(2400)}
              delta={-5}
              periodLabel="vs last quarter"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio Layout ── */}
        <motion.div variants={fadeInUp}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.618fr 1fr',
              gap: GRID.spacing.lg,
            }}
          >
            {/* ═══════════ LEFT COLUMN (1.618fr) ═══════════ */}
            <div className="space-y-6">
              {/* ── Recruiting Funnel ── */}
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Recruiting Funnel"
                  subtitle="Candidate progression through stages"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6 space-y-3">
                    {DEMO_EXEC_RECRUITING_FUNNEL.map((stage) => {
                      const widthPct = Math.round(
                        (stage.count / maxCount) * 100
                      );
                      return (
                        <div key={stage.stage} className="flex items-center gap-3">
                          <span
                            className="font-medium text-stone-700 flex-shrink-0"
                            style={{
                              fontSize: TYPE.meta,
                              width: 100,
                              textAlign: 'right',
                            }}
                          >
                            {stage.stage}
                          </span>
                          <div
                            className="flex-1 relative"
                            style={{
                              height: 32,
                              borderRadius: RADIUS.input,
                              backgroundColor: COLORS.gray[100],
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="h-full flex items-center justify-end pr-3"
                              style={{
                                borderRadius: RADIUS.input,
                                backgroundColor: stage.color,
                                minWidth: 40,
                              }}
                            >
                              <span
                                className="font-bold text-white"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {stage.count}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* ── Source Effectiveness ── */}
              <div>
                <SectionHeader
                  icon={Target}
                  title="Source Effectiveness"
                  subtitle="Conversion rates by acquisition channel"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    {SOURCE_EFFECTIVENESS.map((src) => (
                      <div key={src.source}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="font-medium text-stone-700"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {src.source}
                          </span>
                          <span
                            className="font-bold text-stone-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {src.conversion}%
                          </span>
                        </div>
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
                            animate={{ width: `${src.conversion}%` }}
                            transition={{
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              height: '100%',
                              borderRadius: RADIUS.pill,
                              backgroundColor: '#ea580c',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* ── Hiring Trend ── */}
              <div>
                <SectionHeader
                  icon={TrendingUp}
                  title="Hiring Trend"
                  subtitle="Monthly new hires over the last 6 months"
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
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={HIRING_TREND}
                        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={COLORS.gray[200]}
                        />
                        <XAxis
                          dataKey="month"
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
                        <Line
                          type="monotone"
                          dataKey="hires"
                          name="Hires"
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#ea580c' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ═══════════ RIGHT COLUMN (1fr) ═══════════ */}
            <div className="space-y-6">
              {/* ── Recent New Hires ── */}
              <div>
                <SectionHeader
                  icon={UserPlus}
                  title="Recent New Hires"
                  subtitle="Latest candidates joining the team"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-5 space-y-4">
                    {recentHires.map((hire) => (
                      <div
                        key={hire.id}
                        className="flex items-center justify-between"
                        style={{
                          padding: '12px 0',
                          borderBottom: `1px solid ${COLORS.gray[100]}`,
                        }}
                      >
                        <div>
                          <p
                            className="font-semibold text-stone-900"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {hire.name}
                          </p>
                          <p
                            style={{
                              fontSize: TYPE.caption,
                              color: COLORS.gray[500],
                            }}
                          >
                            {hire.team} &middot; Started{' '}
                            {Number(hire.daysInStage) === 1
                              ? '1 day ago'
                              : `${hire.daysInStage} days ago`}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center font-medium px-2.5 py-1"
                          style={{
                            fontSize: TYPE.micro,
                            color: '#047857',
                            backgroundColor: '#ecfdf5',
                            borderRadius: RADIUS.pill,
                          }}
                        >
                          Onboarding
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* ── Hiring Goals by Team ── */}
              <div>
                <SectionHeader
                  icon={Target}
                  title="Hiring Goals by Team"
                  subtitle="Progress toward headcount targets"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-5 space-y-4">
                    {TEAM_HIRING_GOALS.map((goal) => {
                      const pct =
                        goal.total > 0
                          ? Math.round((goal.filled / goal.total) * 100)
                          : 0;
                      return (
                        <div key={goal.team}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className="font-medium text-stone-700"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {goal.team}
                            </span>
                            <span
                              className="font-semibold text-stone-900"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {goal.filled}/{goal.total}
                            </span>
                          </div>
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
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              style={{
                                height: '100%',
                                borderRadius: RADIUS.pill,
                                backgroundColor: '#ea580c',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* ── Open Requisitions ── */}
              <div>
                <SectionHeader
                  icon={Briefcase}
                  title="Open Requisitions"
                  subtitle="Positions currently being filled"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-5 space-y-3">
                    {OPEN_REQUISITIONS.map((req) => {
                      const priorityStyle = PRIORITY_COLORS[req.priority];
                      return (
                        <div
                          key={req.title}
                          className="flex items-center justify-between"
                          style={{
                            padding: '12px 0',
                            borderBottom: `1px solid ${COLORS.gray[100]}`,
                          }}
                        >
                          <p
                            className="font-medium text-stone-800"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {req.title}
                          </p>
                          <span
                            className="inline-flex items-center font-medium px-2.5 py-1 capitalize"
                            style={{
                              fontSize: TYPE.micro,
                              color: priorityStyle.text,
                              backgroundColor: priorityStyle.bg,
                              borderRadius: RADIUS.pill,
                            }}
                          >
                            {req.priority}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveRecruiting;
