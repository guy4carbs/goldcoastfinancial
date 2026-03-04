/**
 * Manager Performance — Performance Analytics Page (Phase 3)
 * Team metrics, agent rankings, performance trends, sales velocity,
 * conversion funnel, rep-vs-rep comparison, period comparison toggle
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_TEAM_MEMBERS, glassCard } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  RADIUS, TYPE, GRID, LAYOUT, SHADOW, MOTION, COLORS,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  TrendingUp, DollarSign, Phone, Percent, Clock, Award, BarChart3,
  Activity, Zap, ArrowRight, ChevronDown, Users, GitCompare,
  Filter as FilterIcon,
} from 'lucide-react';

// ─── EXISTING DATA ──────────────────────────────────────────

const rankedMembers = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.quota - a.quota);
const topMembers = rankedMembers.slice(0, 8);

const TREND_DATA = [
  { label: 'Calls', value: 285, max: 400, display: '285' },
  { label: 'Appointments', value: 64, max: 100, display: '64' },
  { label: 'Closes', value: 51, max: 80, display: '51' },
  { label: 'Revenue', value: 124, max: 180, display: '$124K' },
];

// ─── NEW DEMO DATA ──────────────────────────────────────────

const FUNNEL_STAGES = [
  { stage: 'Leads', count: 186, color: '#059669' },
  { stage: 'Contacted', count: 142, color: '#0d9488' },
  { stage: 'Qualified', count: 94, color: '#14b8a6' },
  { stage: 'Proposal', count: 58, color: '#2dd4bf' },
  { stage: 'Closed Won', count: 38, color: '#10b981' },
];

const PREV_TREND_DATA = [
  { label: 'Calls', value: 248, max: 400, display: '248' },
  { label: 'Appointments', value: 52, max: 100, display: '52' },
  { label: 'Closes', value: 44, max: 80, display: '44' },
  { label: 'Revenue', value: 108, max: 180, display: '$108K' },
];

const VELOCITY = {
  deals: 62,
  winRate: 42,
  avgDeal: 13700,
  cycleLength: 18,
  result: 19800,
};

// ─── COMPARISON METRICS ─────────────────────────────────────

type ComparisonMetric = {
  key: string;
  label: string;
  getValue: (m: typeof DEMO_TEAM_MEMBERS[number]) => number;
  format: (v: number) => string;
};

const COMPARISON_METRICS: ComparisonMetric[] = [
  { key: 'quota', label: 'Quota', getValue: (m) => m.quota, format: (v) => `${v}%` },
  { key: 'calls', label: 'Calls', getValue: (m) => m.calls, format: (v) => `${v}` },
  { key: 'closes', label: 'Closes', getValue: (m) => m.closes, format: (v) => `${v}` },
  { key: 'revenue', label: 'Revenue', getValue: (m) => m.revenue, format: (v) => `$${v.toLocaleString()}` },
  { key: 'closeRate', label: 'Close Rate', getValue: (m) => m.calls > 0 ? Math.round((m.closes / m.calls) * 100) : 0, format: (v) => `${v}%` },
  { key: 'streak', label: 'Streak', getValue: (m) => m.streak, format: (v) => `${v} days` },
];

// ─── COMPONENT ──────────────────────────────────────────────

export function ManagerPerformance() {
  const [_tab, setTab] = useState('monthly');
  const [repA, setRepA] = useState('1'); // Sarah Johnson
  const [repB, setRepB] = useState('7'); // Rachel Green
  const [showPrevious, setShowPrevious] = useState(false);

  const memberA = DEMO_TEAM_MEMBERS.find((m) => m.id === repA)!;
  const memberB = DEMO_TEAM_MEMBERS.find((m) => m.id === repB)!;

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ═══ 1. Hero ═══ */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={TrendingUp}
            title="Performance"
            subtitle="Analyze team metrics and identify trends"
          />
        </motion.div>

        {/* ═══ 2. Stat Cards ═══ */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value="$124K"
              label="Team Revenue MTD"
              trend={{ value: '12%', positive: true }}
            />
            <ManagerStatCard icon={Phone} value="285" label="Calls This Week" />
            <ManagerStatCard
              icon={Percent}
              value="42%"
              label="Conversion Rate"
              trend={{ value: '3%', positive: true }}
            />
            <ManagerStatCard icon={Clock} value="2.4 hrs" label="Avg Response Time" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ═══ 3. Sales Velocity Card ═══ */}
        <motion.div variants={fadeInUp}>
          <div
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: GRID.spacing.lg,
            }}
          >
            {/* Fibonacci blobs */}
            <div
              className="absolute"
              style={{
                width: 89, height: 89, borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.15)',
                top: -20, right: 40,
              }}
            />
            <div
              className="absolute"
              style={{
                width: 55, height: 55, borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.1)',
                bottom: -10, left: 60,
              }}
            />
            <div
              className="absolute"
              style={{
                width: 34, height: 34, borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.2)',
                top: 20, left: '45%',
              }}
            />

            {/* Title */}
            <div className="relative z-10" style={{ marginBottom: GRID.spacing.md }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Zap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <p className="text-white font-bold" style={{ fontSize: TYPE.title }}>
                    Sales Velocity
                  </p>
                  <p className="text-white/70" style={{ fontSize: TYPE.meta }}>
                    Revenue generated per day from your pipeline
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Row */}
            <div
              className="relative z-10 flex flex-wrap items-center justify-center"
              style={{ gap: GRID.spacing.sm }}
            >
              {/* Deals */}
              <div
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: TYPE.section }}>
                  {VELOCITY.deals}
                </span>
                <span className="text-white/70" style={{ fontSize: TYPE.micro }}>deals</span>
              </div>

              <span className="text-white/60 font-bold" style={{ fontSize: TYPE.section }}>x</span>

              {/* Win Rate */}
              <div
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: TYPE.section }}>
                  {VELOCITY.winRate}%
                </span>
                <span className="text-white/70" style={{ fontSize: TYPE.micro }}>win rate</span>
              </div>

              <span className="text-white/60 font-bold" style={{ fontSize: TYPE.section }}>x</span>

              {/* Avg Deal */}
              <div
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: TYPE.section }}>
                  $13.7K
                </span>
                <span className="text-white/70" style={{ fontSize: TYPE.micro }}>avg deal</span>
              </div>

              <span className="text-white/60 font-bold" style={{ fontSize: TYPE.section }}>/</span>

              {/* Cycle Length */}
              <div
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: TYPE.section }}>
                  {VELOCITY.cycleLength}
                </span>
                <span className="text-white/70" style={{ fontSize: TYPE.micro }}>days</span>
              </div>

              <span className="text-white/60 font-bold" style={{ fontSize: TYPE.section }}>=</span>

              {/* Result */}
              <div
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.sm}px ${GRID.spacing.lg}px`,
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
              >
                <span className="text-white font-bold" style={{ fontSize: TYPE.hero }}>
                  $19.8K
                </span>
                <span className="text-amber-200 font-semibold" style={{ fontSize: TYPE.meta }}>
                  per day
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ 4. Tabs (Weekly/Monthly/Quarterly) ═══ */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="monthly" onValueChange={setTab}>
            <TabsList style={{ borderRadius: RADIUS.button }}>
              <TabsTrigger value="weekly" style={{ borderRadius: RADIUS.button }}>
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" style={{ borderRadius: RADIUS.button }}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="quarterly" style={{ borderRadius: RADIUS.button }}>
                Quarterly
              </TabsTrigger>
            </TabsList>

            {['weekly', 'monthly', 'quarterly'].map((period) => (
              <TabsContent key={period} value={period}>
                {/* ─── Conversion Funnel ─── */}
                <Card
                  className="overflow-hidden border-0"
                  style={{
                    ...glassCard,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                    marginTop: GRID.spacing.md,
                    marginBottom: GRID.spacing.lg,
                  }}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <FilterIcon className="w-5 h-5 text-amber-200" />
                      </div>
                      <span className="text-gray-900">Conversion Funnel</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {FUNNEL_STAGES.map((s, idx) => {
                        const widthPct = (s.count / FUNNEL_STAGES[0].count) * 100;
                        const overallPct = ((s.count / FUNNEL_STAGES[0].count) * 100).toFixed(1);
                        const stagePct = idx > 0
                          ? ((s.count / FUNNEL_STAGES[idx - 1].count) * 100).toFixed(1)
                          : null;
                        const dropOff = idx > 0
                          ? (100 - (s.count / FUNNEL_STAGES[idx - 1].count) * 100).toFixed(1)
                          : null;

                        return (
                          <div key={s.stage}>
                            {/* Drop-off indicator */}
                            {dropOff && (
                              <div
                                className="flex items-center justify-center"
                                style={{ marginBottom: 4, gap: GRID.spacing.xs }}
                              >
                                <ArrowRight className="w-3 h-3 text-red-400" style={{ transform: 'rotate(90deg)' }} />
                                <span style={{ fontSize: TYPE.micro, color: '#ef4444', fontWeight: 600 }}>
                                  -{dropOff}% drop-off
                                </span>
                              </div>
                            )}
                            <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                              {/* Stage label */}
                              <div style={{ width: 90, flexShrink: 0 }}>
                                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                                  {s.stage}
                                </span>
                              </div>

                              {/* Bar container — centered funnel */}
                              <div className="flex-1 flex justify-center">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${widthPct}%` }}
                                  transition={{
                                    duration: 0.8,
                                    ease: MOTION.easing as unknown as [number, number, number, number],
                                    delay: idx * 0.12,
                                  }}
                                  style={{
                                    height: 36,
                                    borderRadius: RADIUS.button,
                                    background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <span className="text-white font-bold" style={{ fontSize: TYPE.meta }}>
                                    {s.count}
                                  </span>
                                </motion.div>
                              </div>

                              {/* Percentages */}
                              <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>
                                <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                                  {overallPct}%
                                </span>
                                {stagePct && (
                                  <span className="text-emerald-600 font-semibold ml-2" style={{ fontSize: TYPE.caption }}>
                                    {stagePct}% conv
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* ─── Agent Rankings + Key Metrics — 2-col ─── */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-2"
                  style={{ gap: GRID.spacing.lg }}
                >
                  {/* Agent Rankings */}
                  <Card
                    className="overflow-hidden border-0"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                          style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                        >
                          <Award className="w-5 h-5 text-amber-200" />
                        </div>
                        <span className="text-gray-900">Agent Rankings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {rankedMembers.map((member, idx) => (
                          <motion.div
                            key={member.id}
                            className="flex items-center"
                            style={{
                              padding: 12,
                              borderRadius: RADIUS.button,
                              gap: 12,
                            }}
                            whileHover={{
                              backgroundColor: COLORS.gray[50],
                              transition: { duration: MOTION.duration.hover },
                            }}
                          >
                            <span
                              className="font-bold text-gray-400 flex-shrink-0"
                              style={{ width: 20, textAlign: 'center', fontSize: TYPE.meta }}
                            >
                              #{idx + 1}
                            </span>
                            <div
                              className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                              style={{
                                width: LAYOUT.icon.xxl,
                                height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.meta,
                              }}
                            >
                              {member.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                                {member.name}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0 hidden sm:block">
                              <Progress
                                value={Math.min(member.quota, 100)}
                                className="h-2 [&>div]:bg-emerald-500"
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>
                            <span
                              className={`font-semibold flex-shrink-0 ${
                                member.quota >= 100
                                  ? 'text-emerald-600'
                                  : member.quota >= 70
                                    ? 'text-gray-700'
                                    : 'text-red-600'
                              }`}
                              style={{ minWidth: 44, textAlign: 'right', fontSize: TYPE.meta }}
                            >
                              {member.quota}%
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <Card
                    className="overflow-hidden border-0"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                          style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                        >
                          <BarChart3 className="w-5 h-5 text-amber-200" />
                        </div>
                        <span className="text-gray-900">Key Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div
                        className="flex items-center text-gray-500 font-medium"
                        style={{
                          padding: `${GRID.spacing.xs}px 12px`,
                          borderBottom: `1px solid ${COLORS.gray[200]}`,
                          marginBottom: GRID.spacing.xs,
                          fontSize: TYPE.caption,
                        }}
                      >
                        <span className="flex-1">Agent</span>
                        <span style={{ width: 60, textAlign: 'right' }}>Calls</span>
                        <span style={{ width: 60, textAlign: 'right' }}>Closes</span>
                        <span style={{ width: 80, textAlign: 'right' }}>Revenue</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {topMembers.map((member) => (
                          <motion.div
                            key={member.id}
                            className="flex items-center"
                            style={{ padding: 12, borderRadius: RADIUS.button }}
                            whileHover={{
                              backgroundColor: COLORS.gray[50],
                              transition: { duration: MOTION.duration.hover },
                            }}
                          >
                            <span className="flex-1 font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {member.name}
                            </span>
                            <span className="text-gray-600" style={{ width: 60, textAlign: 'right', fontSize: TYPE.meta }}>
                              {member.calls}
                            </span>
                            <span className="text-gray-600" style={{ width: 60, textAlign: 'right', fontSize: TYPE.meta }}>
                              {member.closes}
                            </span>
                            <span className="font-semibold text-gray-900" style={{ width: 80, textAlign: 'right', fontSize: TYPE.meta }}>
                              ${member.revenue.toLocaleString()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* ═══ 5. Rep-vs-Rep Comparison ═══ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <GitCompare className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Rep-vs-Rep Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Dropdowns */}
              <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div className="flex-1 flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0`}
                    style={{
                      width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                      borderRadius: RADIUS.button, fontSize: TYPE.meta,
                    }}
                  >
                    {memberA.avatar}
                  </div>
                  <select
                    value={repA}
                    onChange={(e) => setRepA(e.target.value)}
                    className="flex-1 font-semibold text-gray-900 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      fontSize: TYPE.meta,
                    }}
                  >
                    {DEMO_TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <span className="text-gray-400 font-bold self-center" style={{ fontSize: TYPE.meta }}>vs</span>

                <div className="flex-1 flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0`}
                    style={{
                      width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                      borderRadius: RADIUS.button, fontSize: TYPE.meta,
                    }}
                  >
                    {memberB.avatar}
                  </div>
                  <select
                    value={repB}
                    onChange={(e) => setRepB(e.target.value)}
                    className="flex-1 font-semibold text-gray-900 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      fontSize: TYPE.meta,
                    }}
                  >
                    {DEMO_TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metric Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {COMPARISON_METRICS.map((metric) => {
                  const valA = metric.getValue(memberA);
                  const valB = metric.getValue(memberB);
                  const maxVal = Math.max(valA, valB, 1);
                  const aWins = valA >= valB;
                  const bWins = valB >= valA;

                  return (
                    <div key={metric.key}>
                      {/* Label centered */}
                      <div className="flex justify-center" style={{ marginBottom: 4 }}>
                        <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>
                          {metric.label}
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        {/* Left agent value */}
                        <span
                          className={`font-semibold flex-shrink-0 ${aWins ? 'text-emerald-600' : 'text-gray-500'}`}
                          style={{ width: 70, textAlign: 'right', fontSize: TYPE.meta }}
                        >
                          {metric.format(valA)}
                        </span>

                        {/* Left bar (right-aligned) */}
                        <div className="flex-1 flex justify-end">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(valA / maxVal) * 100}%` }}
                            transition={{
                              duration: 0.6,
                              ease: MOTION.easing as unknown as [number, number, number, number],
                            }}
                            style={{
                              height: 24,
                              borderRadius: RADIUS.pill,
                              background: aWins
                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                : COLORS.gray[200],
                            }}
                          />
                        </div>

                        {/* Divider */}
                        <div style={{ width: 2, height: 24, background: COLORS.gray[200], flexShrink: 0 }} />

                        {/* Right bar (left-aligned) */}
                        <div className="flex-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(valB / maxVal) * 100}%` }}
                            transition={{
                              duration: 0.6,
                              ease: MOTION.easing as unknown as [number, number, number, number],
                            }}
                            style={{
                              height: 24,
                              borderRadius: RADIUS.pill,
                              background: bWins
                                ? 'linear-gradient(90deg, #0d9488, #14b8a6)'
                                : COLORS.gray[200],
                            }}
                          />
                        </div>

                        {/* Right agent value */}
                        <span
                          className={`font-semibold flex-shrink-0 ${bWins ? 'text-teal-600' : 'text-gray-500'}`}
                          style={{ width: 70, textAlign: 'left', fontSize: TYPE.meta }}
                        >
                          {metric.format(valB)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ 6. Performance Trends (with Period Comparison Toggle) ═══ */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Activity className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Performance Trends</span>
                </CardTitle>

                {/* Period Comparison Toggle */}
                <button
                  onClick={() => setShowPrevious(!showPrevious)}
                  className="flex items-center cursor-pointer"
                  style={{
                    gap: GRID.spacing.xs,
                    borderRadius: RADIUS.pill,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    background: showPrevious
                      ? 'linear-gradient(135deg, #059669, #0d9488)'
                      : COLORS.gray[100],
                    border: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 20, borderRadius: RADIUS.pill,
                      background: showPrevious ? 'rgba(255,255,255,0.3)' : COLORS.gray[300],
                      position: 'relative',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <motion.div
                      animate={{ x: showPrevious ? 16 : 2 }}
                      transition={{ duration: MOTION.duration.fast }}
                      style={{
                        width: 16, height: 16, borderRadius: RADIUS.pill,
                        background: 'white',
                        position: 'absolute',
                        top: 2,
                        boxShadow: SHADOW.level1,
                      }}
                    />
                  </div>
                  <span
                    className="font-medium"
                    style={{
                      fontSize: TYPE.caption,
                      color: showPrevious ? 'white' : COLORS.gray[600],
                    }}
                  >
                    Compare to Previous
                  </span>
                </button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {TREND_DATA.map((trend, idx) => {
                  const prev = PREV_TREND_DATA[idx];
                  const delta = trend.value - prev.value;
                  const deltaPct = prev.value > 0 ? Math.round((delta / prev.value) * 100) : 0;

                  return (
                    <div key={trend.label}>
                      <div
                        className="flex items-center justify-between"
                        style={{ marginBottom: GRID.spacing.xs }}
                      >
                        <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                          {trend.label}
                        </p>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                            {trend.display}
                          </p>
                          <AnimatePresence>
                            {showPrevious && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: MOTION.duration.fast }}
                                className={`font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                                style={{
                                  fontSize: TYPE.micro,
                                  borderRadius: RADIUS.pill,
                                  padding: `2px ${GRID.spacing.xs}px`,
                                  background: delta >= 0 ? '#ecfdf5' : '#fef2f2',
                                }}
                              >
                                {delta >= 0 ? '+' : ''}{deltaPct}%
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Bar container */}
                      <div style={{ position: 'relative' }}>
                        {/* Previous period bar (behind) */}
                        <AnimatePresence>
                          {showPrevious && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: MOTION.duration.normal }}
                              className="w-full overflow-hidden"
                              style={{
                                height: GRID.spacing.sm,
                                borderRadius: RADIUS.pill,
                                backgroundColor: COLORS.gray[100],
                                marginBottom: 6,
                              }}
                            >
                              <motion.div
                                className="h-full"
                                style={{
                                  borderRadius: RADIUS.pill,
                                  background: COLORS.gray[300],
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(prev.value / prev.max) * 100}%` }}
                                transition={{
                                  duration: 0.8,
                                  ease: MOTION.easing as unknown as [number, number, number, number],
                                  delay: 0.1,
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Current period bar */}
                        <div
                          className="w-full overflow-hidden"
                          style={{
                            height: GRID.spacing.sm,
                            borderRadius: RADIUS.pill,
                            backgroundColor: COLORS.gray[100],
                          }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                            style={{ borderRadius: RADIUS.pill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(trend.value / trend.max) * 100}%` }}
                            transition={{
                              duration: 0.8,
                              ease: MOTION.easing as unknown as [number, number, number, number],
                              delay: 0.3,
                            }}
                          />
                        </div>
                      </div>

                      {/* Legend when showing previous */}
                      <AnimatePresence>
                        {showPrevious && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: MOTION.duration.fast }}
                            className="flex items-center"
                            style={{ gap: GRID.spacing.sm, marginTop: 4 }}
                          >
                            <div className="flex items-center" style={{ gap: 4 }}>
                              <div style={{ width: 12, height: 4, borderRadius: RADIUS.pill, background: COLORS.gray[300] }} />
                              <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                                Previous: {prev.display}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerPerformance;
