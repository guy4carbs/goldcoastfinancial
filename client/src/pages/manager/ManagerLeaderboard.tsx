/**
 * Manager Leaderboard
 * Full team leaderboard — expanded rankings with period filtering,
 * agent stats, trend indicators, gamification elements, team mode,
 * configurable metric selector, celebration animations, and contest banner.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, COLORS, LAYOUT,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  Trophy, DollarSign, Users, Target, Zap, TrendingUp, TrendingDown,
  Phone, ArrowUp, ArrowDown, ArrowRight, Star, Crown, Sparkles,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────────── */

const LEADERBOARD = [
  { rank: 1, name: 'Sarah Johnson', role: 'Senior Agent', avatar: 'SJ', level: 6, apWeekly: 8500, calls: 45, closeRate: 18, trend: +12, revenue: 42500, policies: 8 },
  { rank: 2, name: 'Rachel Green', role: 'Senior Agent', avatar: 'RG', level: 5, apWeekly: 7200, calls: 41, closeRate: 17, trend: +8, revenue: 39700, policies: 7 },
  { rank: 3, name: 'Mike Chen', role: 'Agent', avatar: 'MC', level: 5, apWeekly: 6200, calls: 38, closeRate: 16, trend: -3, revenue: 38200, policies: 6 },
  { rank: 4, name: 'Jessica Lee', role: 'Agent', avatar: 'JL', level: 4, apWeekly: 5800, calls: 36, closeRate: 17, trend: +5, revenue: 35400, policies: 6 },
  { rank: 5, name: 'Emily Davis', role: 'Agent', avatar: 'ED', level: 4, apWeekly: 5100, calls: 32, closeRate: 15, trend: +2, revenue: 31800, policies: 5 },
  { rank: 6, name: 'David Brown', role: 'Agent', avatar: 'DB', level: 3, apWeekly: 4800, calls: 35, closeRate: 14, trend: +15, revenue: 33100, policies: 5 },
  { rank: 7, name: 'James Wilson', role: 'Agent', avatar: 'JW', level: 3, apWeekly: 3800, calls: 24, closeRate: 17, trend: -7, revenue: 28400, policies: 4 },
  { rank: 8, name: 'Tom Rodriguez', role: 'Agent', avatar: 'TR', level: 2, apWeekly: 3200, calls: 30, closeRate: 13, trend: +4, revenue: 25600, policies: 4 },
  { rank: 9, name: 'Lisa Park', role: 'Junior Agent', avatar: 'LP', level: 2, apWeekly: 2100, calls: 28, closeRate: 11, trend: +22, revenue: 18900, policies: 3 },
  { rank: 10, name: 'Carlos Martinez', role: 'Agent', avatar: 'CM', level: 1, apWeekly: 1400, calls: 18, closeRate: 11, trend: -15, revenue: 14200, policies: 2 },
  { rank: 11, name: 'Anna Kim', role: 'Junior Agent', avatar: 'AK', level: 1, apWeekly: 850, calls: 12, closeRate: 8, trend: +3, revenue: 8500, policies: 1 },
  { rank: 12, name: 'Ryan Taylor', role: 'Junior Agent', avatar: 'RT', level: 0, apWeekly: 0, calls: 8, closeRate: 0, trend: 0, revenue: 0, policies: 0 },
];

/* ── Team definitions ──────────────────────────────────────── */

const TEAMS = [
  {
    id: 'alpha',
    name: 'Team Alpha',
    members: ['SJ', 'MC', 'ED', 'JW'],
    memberNames: ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson'],
  },
  {
    id: 'beta',
    name: 'Team Beta',
    members: ['RG', 'DB', 'JL', 'TR'],
    memberNames: ['Rachel Green', 'David Brown', 'Jessica Lee', 'Tom Rodriguez'],
  },
  {
    id: 'gamma',
    name: 'Team Gamma',
    members: ['LP', 'CM', 'AK', 'RT'],
    memberNames: ['Lisa Park', 'Carlos Martinez', 'Anna Kim', 'Ryan Taylor'],
  },
];

/* ── Metric options for the selector ───────────────────────── */

const METRIC_OPTIONS = [
  { key: 'ap', label: 'AP', format: (v: number) => v > 0 ? `$${(v / 1000).toFixed(1)}K` : '$0' },
  { key: 'calls', label: 'Calls', format: (v: number) => `${v}` },
  { key: 'closeRate', label: 'Close Rate', format: (v: number) => `${v}%` },
  { key: 'revenue', label: 'Revenue', format: (v: number) => `$${(v / 1000).toFixed(1)}K` },
  { key: 'policies', label: 'Policies', format: (v: number) => `${v}` },
] as const;

type MetricKey = (typeof METRIC_OPTIONS)[number]['key'];

/* ── Period filter options ─────────────────────────────────── */

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Quarter', 'All Time'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── View mode ──────────────────────────────────────────────── */

type ViewMode = 'individual' | 'team';

/* ── Confetti dot colors ────────────────────────────────────── */

const CONFETTI_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6'];

/* ── Rank badge styling ────────────────────────────────────── */

function getRankBadgeStyle(rank: number): React.CSSProperties {
  if (rank === 1) {
    return {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
    };
  }
  if (rank === 2) {
    return {
      background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(107, 114, 128, 0.25)',
    };
  }
  if (rank === 3) {
    return {
      background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(180, 83, 9, 0.25)',
    };
  }
  return {
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[500],
  };
}

/* ── Helper: get metric value from agent ───────────────────── */

function getMetricValue(agent: (typeof LEADERBOARD)[number], metric: MetricKey): number {
  switch (metric) {
    case 'ap': return agent.apWeekly;
    case 'calls': return agent.calls;
    case 'closeRate': return agent.closeRate;
    case 'revenue': return agent.revenue;
    case 'policies': return agent.policies;
  }
}

/* ── Computed stats ────────────────────────────────────────── */

const topAgent = LEADERBOARD[0];
const teamAP = LEADERBOARD.reduce((sum, a) => sum + a.apWeekly, 0);
const activeAgents = LEADERBOARD.filter((a) => a.apWeekly > 0).length;
const topCloseRate = Math.max(...LEADERBOARD.map((a) => a.closeRate));

/* ── Confetti Dots Component ───────────────────────────────── */

function ConfettiDots() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showConfetti) return null;

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const radians = (angle * Math.PI) / 180;
    const distance = 40 + Math.random() * 30;
    const size = 6 + Math.random() * 4;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    return (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
        animate={{
          scale: [0, 1, 0],
          opacity: [1, 1, 0],
          x: Math.cos(radians) * distance,
          y: Math.sin(radians) * distance,
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: RADIUS.pill,
          backgroundColor: color,
          top: '50%',
          left: '50%',
          marginTop: -size / 2,
          marginLeft: -size / 2,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
      {dots}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────── */

export function ManagerLeaderboard() {
  const [period, setPeriod] = useState<Period>('This Week');
  const [viewMode, setViewMode] = useState<ViewMode>('individual');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ap');

  /* Sorted leaderboard based on selected metric */
  const sortedLeaderboard = useMemo(() => {
    const sorted = [...LEADERBOARD].sort(
      (a, b) => getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric)
    );
    return sorted.map((agent, idx) => ({ ...agent, rank: idx + 1 }));
  }, [selectedMetric]);

  /* Team aggregates */
  const teamData = useMemo(() => {
    return TEAMS.map((team) => {
      const members = LEADERBOARD.filter((a) => team.members.includes(a.avatar));
      const totalAP = members.reduce((s, m) => s + m.apWeekly, 0);
      const totalCalls = members.reduce((s, m) => s + m.calls, 0);
      const avgCloseRate = members.length > 0
        ? Math.round(members.reduce((s, m) => s + m.closeRate, 0) / members.length)
        : 0;
      const totalRevenue = members.reduce((s, m) => s + m.revenue, 0);
      const totalPolicies = members.reduce((s, m) => s + m.policies, 0);
      return { ...team, totalAP, totalCalls, avgCloseRate, totalRevenue, totalPolicies };
    }).sort((a, b) => b.totalAP - a.totalAP);
  }, []);

  /* Current metric config */
  const metricConfig = METRIC_OPTIONS.find((m) => m.key === selectedMetric)!;

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Trophy}
          title="Leaderboard"
          subtitle="Team rankings and performance recognition"
        />

        {/* ── Contest Integration Banner ─────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px`,
            }}
          >
            {/* Fibonacci blobs */}
            <div
              style={{
                position: 'absolute',
                width: 89,
                height: 89,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.15)',
                top: -20,
                right: 40,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 55,
                height: 55,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.1)',
                bottom: -10,
                left: 60,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 34,
                height: 34,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.2)',
                top: 10,
                left: '40%',
              }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: GRID.spacing.sm }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                {/* Icon badge */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Sparkles className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                    <span className="font-bold text-white" style={{ fontSize: TYPE.title }}>
                      March Madness Blitz
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: TYPE.micro,
                        padding: '2px 8px',
                        borderRadius: RADIUS.pill,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: '#ffffff',
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.sm, marginTop: 4 }}>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>
                      Prize: $500
                    </span>
                    <span className="text-white/50" style={{ fontSize: TYPE.meta }}>|</span>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>
                      Ends: Mar 15
                    </span>
                    <span className="text-white/50" style={{ fontSize: TYPE.meta }}>|</span>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>
                      Leader: Rachel Green (142 calls)
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/manager/contests">
                <motion.div
                  className="flex items-center font-semibold cursor-pointer"
                  style={{
                    gap: 4,
                    color: '#ffffff',
                    fontSize: TYPE.meta,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.pill,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    whiteSpace: 'nowrap',
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                >
                  View Contest <ArrowRight style={{ width: 14, height: 14 }} />
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Trophy}
              value={topAgent.name}
              label="#1 Agent"
            />
            <ManagerStatCard
              icon={DollarSign}
              value={`$${(teamAP / 1000).toFixed(1)}K`}
              label="Team AP"
            />
            <ManagerStatCard
              icon={Users}
              value={`${activeAgents}/${LEADERBOARD.length}`}
              label="Active Agents"
            />
            <ManagerStatCard
              icon={Target}
              value={`${topCloseRate}%`}
              label="Top Close Rate"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Mode Toggle + Metric Selector ─────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-between"
          style={{ gap: GRID.spacing.sm }}
        >
          {/* Mode toggle: Individual | Team */}
          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
            {(['individual', 'team'] as const).map((mode) => {
              const isActive = viewMode === mode;
              return (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="font-medium border-0"
                  style={{
                    ...(isActive ? {} : glassCard),
                    background: isActive
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                      : undefined,
                    color: isActive ? '#ffffff' : COLORS.gray[600],
                    borderRadius: RADIUS.pill,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                    fontSize: TYPE.meta,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {mode === 'individual' ? 'Individual' : 'Team'}
                </motion.button>
              );
            })}
          </div>

          {/* Metric selector: AP | Calls | Close Rate | Revenue | Policies */}
          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
            {METRIC_OPTIONS.map((option) => {
              const isActive = selectedMetric === option.key;
              return (
                <motion.button
                  key={option.key}
                  onClick={() => setSelectedMetric(option.key)}
                  className="font-medium border-0"
                  style={{
                    ...(isActive ? {} : glassCard),
                    background: isActive
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                      : undefined,
                    color: isActive ? '#ffffff' : COLORS.gray[600],
                    borderRadius: RADIUS.pill,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                    fontSize: TYPE.meta,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Period Filter ──────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive = period === option;
            return (
              <motion.button
                key={option}
                onClick={() => setPeriod(option)}
                className="font-medium border-0"
                style={{
                  ...(isActive ? {} : glassCard),
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : undefined,
                  color: isActive ? '#ffffff' : COLORS.gray[600],
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {option}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Main Content: Individual or Team view ─────────── */}
        <AnimatePresence mode="wait">
          {viewMode === 'individual' ? (
            /* ── Individual Leaderboard ───────────────────── */
            <motion.div
              key="individual"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card
                className="overflow-hidden border-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <Trophy
                        className="text-amber-200"
                        style={{ width: 20, height: 20 }}
                      />
                    </div>
                    <span className="text-gray-900">Team Rankings</span>
                    <span
                      className="text-gray-400 font-normal"
                      style={{ fontSize: TYPE.caption, marginLeft: 'auto' }}
                    >
                      {period} &middot; Sorted by {metricConfig.label}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: GRID.spacing.xs,
                    }}
                  >
                    {sortedLeaderboard.map((agent) => {
                      const isFirst = agent.rank === 1;
                      return (
                        <motion.div
                          key={agent.avatar}
                          className="flex items-center"
                          style={{
                            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                            gap: GRID.spacing.sm,
                            position: 'relative',
                            ...(isFirst ? {
                              background: 'linear-gradient(90deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)',
                              border: '1px solid rgba(245,158,11,0.18)',
                            } : {}),
                          }}
                          whileHover={{
                            y: -2,
                            backgroundColor: isFirst ? 'rgba(245,158,11,0.1)' : COLORS.gray[50],
                            boxShadow: SHADOW.level2,
                            transition: { duration: MOTION.duration.hover },
                          }}
                          {...(isFirst ? {
                            animate: {
                              boxShadow: [
                                '0 0 0 rgba(245,158,11,0)',
                                '0 0 20px rgba(245,158,11,0.3)',
                                '0 0 0 rgba(245,158,11,0)',
                              ],
                            },
                            transition: {
                              boxShadow: {
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              },
                            },
                          } : {})}
                        >
                          {/* Confetti on #1 */}
                          {isFirst && <ConfettiDots />}

                          {/* Rank badge */}
                          <div
                            className="flex items-center justify-center flex-shrink-0 font-bold"
                            style={{
                              width: LAYOUT.icon.xl + 4,
                              height: LAYOUT.icon.xl + 4,
                              borderRadius: RADIUS.button,
                              fontSize: agent.rank === 1 ? 0 : TYPE.meta,
                              ...getRankBadgeStyle(agent.rank),
                            }}
                          >
                            {agent.rank === 1 ? (
                              <Trophy style={{ width: 18, height: 18, color: '#ffffff' }} />
                            ) : (
                              `#${agent.rank}`
                            )}
                          </div>

                          {/* Avatar */}
                          <div
                            className="flex items-center justify-center flex-shrink-0 font-bold text-white"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                              fontSize: TYPE.meta,
                              boxShadow: SHADOW.level1,
                            }}
                          >
                            {agent.avatar}
                          </div>

                          {/* Name + Role + TOP PERFORMER badge */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                              <p
                                className="font-semibold text-gray-900 truncate"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {agent.name}
                              </p>
                              {isFirst && (
                                <span
                                  className="flex items-center flex-shrink-0 font-bold"
                                  style={{
                                    gap: 3,
                                    fontSize: TYPE.micro,
                                    padding: '2px 6px',
                                    borderRadius: RADIUS.pill,
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    color: '#ffffff',
                                    boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                  }}
                                >
                                  <Crown style={{ width: 10, height: 10 }} />
                                  TOP PERFORMER
                                </span>
                              )}
                            </div>
                            <p
                              className="text-gray-400 truncate"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {agent.role}
                            </p>
                          </div>

                          {/* Level badge */}
                          <div
                            className="hidden sm:flex items-center flex-shrink-0 font-semibold"
                            style={{
                              gap: 4,
                              padding: `3px ${GRID.spacing.xs}px`,
                              borderRadius: RADIUS.pill,
                              backgroundColor: agent.level >= 4
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(16, 185, 129, 0.1)',
                              color: agent.level >= 4 ? '#d97706' : '#059669',
                              fontSize: TYPE.micro,
                            }}
                          >
                            <Zap style={{ width: 12, height: 12 }} />
                            Lv.{agent.level}
                          </div>

                          {/* Metric value (changes based on selector) */}
                          <div
                            className="font-bold flex-shrink-0 text-right"
                            style={{
                              fontSize: TYPE.body,
                              color: '#d97706',
                              minWidth: 70,
                            }}
                          >
                            {metricConfig.format(getMetricValue(agent, selectedMetric))}
                          </div>

                          {/* Calls + Close Rate */}
                          <div
                            className="hidden md:flex items-center flex-shrink-0"
                            style={{ gap: GRID.spacing.sm, minWidth: 130 }}
                          >
                            <div className="flex items-center" style={{ gap: 4 }}>
                              <Phone
                                className="text-gray-400"
                                style={{ width: 12, height: 12 }}
                              />
                              <span
                                className="text-gray-500 font-medium"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {agent.calls}
                              </span>
                            </div>
                            <div className="flex items-center" style={{ gap: 4 }}>
                              <Target
                                className="text-gray-400"
                                style={{ width: 12, height: 12 }}
                              />
                              <span
                                className="text-gray-500 font-medium"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {agent.closeRate}%
                              </span>
                            </div>
                          </div>

                          {/* Trend indicator */}
                          <div
                            className="flex items-center flex-shrink-0 font-semibold"
                            style={{
                              gap: 2,
                              fontSize: TYPE.caption,
                              minWidth: 52,
                              justifyContent: 'flex-end',
                              color:
                                agent.trend > 0
                                  ? '#10b981'
                                  : agent.trend < 0
                                    ? '#ef4444'
                                    : COLORS.gray[400],
                            }}
                          >
                            {agent.trend > 0 ? (
                              <>
                                <ArrowUp style={{ width: 14, height: 14 }} />
                                +{agent.trend}%
                              </>
                            ) : agent.trend < 0 ? (
                              <>
                                <ArrowDown style={{ width: 14, height: 14 }} />
                                {agent.trend}%
                              </>
                            ) : (
                              <span className="text-gray-300" style={{ fontSize: TYPE.caption }}>
                                --
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* ── Team View ───────────────────────────────────── */
            <motion.div
              key="team"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: GRID.spacing.sm,
              }}
            >
              {teamData.map((team, idx) => {
                const isTopTeam = idx === 0;
                return (
                  <motion.div
                    key={team.id}
                    variants={fadeInUp}
                    whileHover={{
                      y: -2,
                      boxShadow: SHADOW.level2,
                      transition: { duration: MOTION.duration.hover },
                    }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: isTopTeam
                        ? '2px solid rgba(245,158,11,0.4)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: RADIUS.card,
                      boxShadow: isTopTeam
                        ? '0 8px 12px rgba(0,0,0,0.04), 0 0 16px rgba(245,158,11,0.15)'
                        : SHADOW.card,
                      padding: GRID.spacing.md,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: GRID.spacing.sm,
                    }}
                  >
                    {/* Team rank + name */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center flex-shrink-0 font-bold"
                        style={{
                          width: LAYOUT.icon.xl + 4,
                          height: LAYOUT.icon.xl + 4,
                          borderRadius: RADIUS.button,
                          fontSize: isTopTeam ? 0 : TYPE.meta,
                          ...getRankBadgeStyle(idx + 1),
                        }}
                      >
                        {isTopTeam ? (
                          <Trophy style={{ width: 18, height: 18, color: '#ffffff' }} />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>
                      <div>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                            {team.name}
                          </span>
                          {isTopTeam && (
                            <Star style={{ width: 16, height: 16, color: '#f59e0b', fill: '#f59e0b' }} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member avatars row */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      {team.members.map((avatar) => (
                        <div
                          key={avatar}
                          className="flex items-center justify-center font-bold text-white"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                            fontSize: TYPE.micro,
                            boxShadow: SHADOW.level1,
                          }}
                        >
                          {avatar}
                        </div>
                      ))}
                    </div>

                    {/* Aggregate metrics */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: GRID.spacing.xs,
                        paddingTop: GRID.spacing.xs,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Total AP</p>
                        <p className="font-bold" style={{ fontSize: TYPE.body, color: '#d97706' }}>
                          ${(team.totalAP / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Total Calls</p>
                        <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                          {team.totalCalls}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Avg Close Rate</p>
                        <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                          {team.avgCloseRate}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerLeaderboard;
