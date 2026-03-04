/**
 * Manager Contests & SPIFFs
 * Motivate teams with competitions, incentives, and performance contests.
 * Heritage Design System — Emerald theme with gold accents
 *
 * Features: Active/Upcoming/Completed/Templates tabs, expandable leaderboards,
 * golden ratio layout, contest templates, quick stats sidebar.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_CONTESTS, CONTEST_TEMPLATES } from './managerConstants';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  DollarSign,
  Users,
  Percent,
  Phone,
  Zap,
  ChevronDown,
  ChevronUp,
  Crown,
  Medal,
} from 'lucide-react';

/* ── Glass card inline style ─────────────────────────────────── */

const glassStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
};

/* ── Contest type badge styling ───────────────────────────────── */

const CONTEST_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  call_blitz: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Call Blitz' },
  revenue: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Revenue' },
  cross_sell: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Cross-Sell' },
  team: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Team' },
  closes: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Closes' },
};

function getContestTypeStyle(type: string) {
  return CONTEST_TYPE_STYLES[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
}

/* ── Rank badge styling ──────────────────────────────────────── */

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

/* ── Score formatter ─────────────────────────────────────────── */

function formatScore(score: number, metric: string): string {
  if (metric === 'revenue') return `$${score.toLocaleString()}`;
  return String(score);
}

/* ── Template icon lookup ────────────────────────────────────── */

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Phone,
  DollarSign,
  Users,
  Zap,
};

/* ── Computed stats ──────────────────────────────────────────── */

const activeContests = DEMO_CONTESTS.filter((c) => c.status === 'active');
const totalParticipants = activeContests.reduce((sum, c) => sum + c.participants, 0);
const avgParticipation = activeContests.length > 0
  ? Math.round((totalParticipants / (activeContests.length * 12)) * 100)
  : 0;
const totalPrizePool = activeContests.reduce((sum, c) => sum + c.prizePool, 0);
const avgCompletion = activeContests.length > 0
  ? Math.round(activeContests.reduce((sum, c) => sum + c.progress, 0) / activeContests.length)
  : 0;

/* ── Component ───────────────────────────────────────────────── */

export function ManagerContests() {
  const [expandedContests, setExpandedContests] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedContests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const upcomingContests = DEMO_CONTESTS.filter((c) => c.status === 'upcoming');
  const completedContests = DEMO_CONTESTS.filter((c) => c.status === 'completed');

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
          title="Contests & SPIFFs"
          subtitle="Motivate your team with competitions and incentives"
        />

        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Trophy}
              value={activeContests.length}
              label="Active Contests"
            />
            <ManagerStatCard
              icon={Percent}
              value={`${avgParticipation}%`}
              label="Participation"
            />
            <ManagerStatCard
              icon={DollarSign}
              value={`$${totalPrizePool.toLocaleString()}`}
              label="Total Prizes"
            />
            <ManagerStatCard
              icon={Trophy}
              value={`${avgCompletion}%`}
              label="Completion Rate"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="active">
            <TabsList
              className="bg-white/80 border border-gray-200/60"
              style={{ borderRadius: RADIUS.button }}
            >
              <TabsTrigger value="active" style={{ borderRadius: RADIUS.button }}>Active</TabsTrigger>
              <TabsTrigger value="upcoming" style={{ borderRadius: RADIUS.button }}>Upcoming</TabsTrigger>
              <TabsTrigger value="completed" style={{ borderRadius: RADIUS.button }}>Completed</TabsTrigger>
              <TabsTrigger value="templates" style={{ borderRadius: RADIUS.button }}>Templates</TabsTrigger>
            </TabsList>

            {/* ═══════════════ ACTIVE TAB ═══════════════ */}
            <TabsContent value="active" style={{ marginTop: GRID.spacing.md }}>
              <div
                className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
                style={{ gap: GRID.spacing.lg }}
              >
                {/* ── Left: Contest Cards ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                  {activeContests.map((contest) => {
                    const isExpanded = expandedContests.has(contest.id);
                    const typeStyle = getContestTypeStyle(contest.type);

                    return (
                      <motion.div key={contest.id} variants={fadeInUp}>
                        <Card
                          className="overflow-hidden border-0"
                          style={{
                            ...glassStyle,
                            borderRadius: RADIUS.card,
                            boxShadow: SHADOW.card,
                          }}
                        >
                          <CardContent style={{ padding: GRID.spacing.md }}>
                            {/* Header: Name, Type Badge, Dates */}
                            <div
                              className="flex flex-wrap items-center"
                              style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}
                            >
                              <span
                                className="font-bold text-gray-900"
                                style={{ fontSize: TYPE.title }}
                              >
                                {contest.name}
                              </span>
                              <span
                                className={`${typeStyle.bg} ${typeStyle.text} font-semibold`}
                                style={{
                                  fontSize: TYPE.caption,
                                  padding: '2px 10px',
                                  borderRadius: RADIUS.pill,
                                }}
                              >
                                {typeStyle.label}
                              </span>
                              <span
                                className="text-gray-400 ml-auto"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {contest.startDate} — {contest.endDate}
                              </span>
                            </div>

                            {/* Prize + Description */}
                            <div
                              className="flex items-center"
                              style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}
                            >
                              <span
                                className="font-bold text-emerald-600"
                                style={{ fontSize: TYPE.body }}
                              >
                                {contest.prize}
                              </span>
                              <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                                — {contest.description}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginBottom: GRID.spacing.sm }}>
                              <div
                                className="flex items-center justify-between"
                                style={{ marginBottom: GRID.spacing.xs / 2, fontSize: TYPE.caption }}
                              >
                                <span className="text-gray-500 font-medium">Progress</span>
                                <span className="text-gray-700 font-semibold">{contest.progress}%</span>
                              </div>
                              <Progress
                                value={contest.progress}
                                className="h-2 [&>div]:bg-emerald-500"
                              />
                            </div>

                            {/* Leaderboard toggle */}
                            <motion.button
                              onClick={() => toggleExpanded(contest.id)}
                              className="flex items-center text-emerald-600 font-semibold cursor-pointer"
                              style={{ gap: GRID.spacing.xs / 2, fontSize: TYPE.meta }}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp style={{ width: 16, height: 16 }} />
                                  Hide Leaderboard
                                </>
                              ) : (
                                <>
                                  <ChevronDown style={{ width: 16, height: 16 }} />
                                  Show Leaderboard
                                </>
                              )}
                            </motion.button>

                            {/* Expandable mini-leaderboard */}
                            {isExpanded && contest.leaderboard.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: GRID.spacing.xs,
                                  marginTop: GRID.spacing.sm,
                                  paddingTop: GRID.spacing.sm,
                                  borderTop: '1px solid rgba(0,0,0,0.06)',
                                }}
                              >
                                {contest.leaderboard.slice(0, 5).map((entry, idx) => {
                                  const rank = idx + 1;
                                  const maxScore = contest.leaderboard[0].score;
                                  const progressPct = maxScore > 0 ? Math.round((entry.score / maxScore) * 100) : 0;

                                  return (
                                    <div
                                      key={entry.agentId}
                                      className="flex items-center"
                                      style={{ gap: GRID.spacing.sm }}
                                    >
                                      {/* Rank badge */}
                                      <div
                                        className="flex items-center justify-center flex-shrink-0 font-bold"
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: RADIUS.button,
                                          fontSize: TYPE.caption,
                                          ...getRankBadgeStyle(rank),
                                        }}
                                      >
                                        {rank === 1 ? (
                                          <Crown style={{ width: 14, height: 14, color: '#ffffff' }} />
                                        ) : rank === 2 ? (
                                          <Medal style={{ width: 14, height: 14, color: '#ffffff' }} />
                                        ) : rank === 3 ? (
                                          <Medal style={{ width: 14, height: 14, color: '#ffffff' }} />
                                        ) : (
                                          `#${rank}`
                                        )}
                                      </div>

                                      {/* Avatar */}
                                      <div
                                        className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                                        style={{
                                          width: LAYOUT.icon.xxl,
                                          height: LAYOUT.icon.xxl,
                                          borderRadius: RADIUS.button,
                                          fontSize: TYPE.caption,
                                          boxShadow: SHADOW.level1,
                                        }}
                                      >
                                        {entry.avatar}
                                      </div>

                                      {/* Name + Progress */}
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className="font-semibold text-gray-900 truncate"
                                          style={{ fontSize: TYPE.meta }}
                                        >
                                          {entry.name}
                                        </p>
                                        <Progress
                                          value={progressPct}
                                          className="h-1.5 mt-1 [&>div]:bg-emerald-500"
                                        />
                                      </div>

                                      {/* Score */}
                                      <span
                                        className="font-bold text-gray-900 flex-shrink-0"
                                        style={{ fontSize: TYPE.meta, minWidth: 60, textAlign: 'right' }}
                                      >
                                        {formatScore(entry.score, entry.metric)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Right: Quick Stats + Create + Templates ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                  {/* Quick Stats card */}
                  <motion.div variants={fadeInUp}>
                    <Card
                      className="overflow-hidden border-0"
                      style={{
                        ...glassStyle,
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
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.button,
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            <Trophy
                              className="text-amber-200"
                              style={{ width: 20, height: 20 }}
                            />
                          </div>
                          <span className="text-gray-900">Quick Stats</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: GRID.spacing.sm,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              Participation Rate
                            </span>
                            <span
                              className="font-bold text-emerald-600"
                              style={{ fontSize: TYPE.body }}
                            >
                              {avgParticipation}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              Active Participants
                            </span>
                            <span
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.body }}
                            >
                              {totalParticipants}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              Prizes Remaining
                            </span>
                            <span
                              className="font-bold text-amber-600"
                              style={{ fontSize: TYPE.body }}
                            >
                              ${totalPrizePool.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Create Contest button */}
                  <motion.div variants={fadeInUp}>
                    <motion.button
                      onClick={() => {}}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: MOTION.duration.hover }}
                      className="w-full flex items-center justify-center font-semibold text-white cursor-pointer"
                      style={{
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        boxShadow: `${SHADOW.level2}, 0 4px 14px rgba(16, 185, 129, 0.25)`,
                        fontSize: TYPE.body,
                        border: 'none',
                      }}
                    >
                      <Trophy style={{ width: 20, height: 20 }} />
                      Create Contest
                    </motion.button>
                  </motion.div>

                  {/* Contest Templates */}
                  <motion.div variants={fadeInUp}>
                    <p
                      className="font-semibold text-gray-900"
                      style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.sm }}
                    >
                      Contest Templates
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: GRID.spacing.xs,
                      }}
                    >
                      {CONTEST_TEMPLATES.map((template) => {
                        const IconComponent = TEMPLATE_ICONS[template.icon] || Trophy;
                        return (
                          <Card
                            key={template.id}
                            className="overflow-hidden border-0"
                            style={{
                              ...glassStyle,
                              borderRadius: RADIUS.card,
                              boxShadow: SHADOW.card,
                            }}
                          >
                            <CardContent style={{ padding: GRID.spacing.sm }}>
                              <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                                {/* Icon badge */}
                                <div
                                  className={`flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: RADIUS.button,
                                  }}
                                >
                                  <IconComponent
                                    className="text-amber-200"
                                    style={{ width: 20, height: 20 }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-semibold text-gray-900"
                                    style={{ fontSize: TYPE.meta }}
                                  >
                                    {template.name}
                                  </p>
                                  <p
                                    className="text-gray-500"
                                    style={{ fontSize: TYPE.caption }}
                                  >
                                    {template.description}
                                  </p>
                                  <div
                                    className="flex items-center flex-wrap"
                                    style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.xs / 2 }}
                                  >
                                    <span
                                      className="bg-gray-100 text-gray-600 font-medium"
                                      style={{
                                        fontSize: TYPE.caption,
                                        padding: '1px 8px',
                                        borderRadius: RADIUS.pill,
                                      }}
                                    >
                                      {template.duration}
                                    </span>
                                    <span
                                      className="bg-emerald-50 text-emerald-700 font-medium"
                                      style={{
                                        fontSize: TYPE.caption,
                                        padding: '1px 8px',
                                        borderRadius: RADIUS.pill,
                                      }}
                                    >
                                      {template.metric}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════════ UPCOMING TAB ═══════════════ */}
            <TabsContent value="upcoming" style={{ marginTop: GRID.spacing.md }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: GRID.spacing.md,
                }}
              >
                {upcomingContests.length === 0 && (
                  <Card
                    className="overflow-hidden border-0"
                    style={{
                      ...glassStyle,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent style={{ padding: GRID.spacing.lg, textAlign: 'center' }}>
                      <Trophy className="text-gray-300 mx-auto" style={{ width: 48, height: 48, marginBottom: GRID.spacing.sm }} />
                      <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.body }}>
                        No upcoming contests scheduled
                      </p>
                    </CardContent>
                  </Card>
                )}
                {upcomingContests.map((contest) => {
                  const typeStyle = getContestTypeStyle(contest.type);
                  return (
                    <motion.div key={contest.id} variants={fadeInUp}>
                      <Card
                        className="overflow-hidden border-0"
                        style={{
                          ...glassStyle,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent style={{ padding: GRID.spacing.md }}>
                          <div
                            className="flex flex-wrap items-center"
                            style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}
                          >
                            <span
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.title }}
                            >
                              {contest.name}
                            </span>
                            <span
                              className={`${typeStyle.bg} ${typeStyle.text} font-semibold`}
                              style={{
                                fontSize: TYPE.caption,
                                padding: '2px 10px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {typeStyle.label}
                            </span>
                            <span
                              className="text-gray-400 ml-auto"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {contest.startDate} — {contest.endDate}
                            </span>
                          </div>
                          <div
                            className="flex items-center"
                            style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}
                          >
                            <span
                              className="font-bold text-emerald-600"
                              style={{ fontSize: TYPE.body }}
                            >
                              {contest.prize}
                            </span>
                            <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              — {contest.description}
                            </span>
                          </div>
                          <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                            Starts {contest.startDate}. Enrollment not yet open.
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══════════════ COMPLETED TAB ═══════════════ */}
            <TabsContent value="completed" style={{ marginTop: GRID.spacing.md }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: GRID.spacing.md,
                }}
              >
                {completedContests.length === 0 && (
                  <Card
                    className="overflow-hidden border-0"
                    style={{
                      ...glassStyle,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent style={{ padding: GRID.spacing.lg, textAlign: 'center' }}>
                      <Trophy className="text-gray-300 mx-auto" style={{ width: 48, height: 48, marginBottom: GRID.spacing.sm }} />
                      <p className="text-gray-400 font-medium" style={{ fontSize: TYPE.body }}>
                        No completed contests yet
                      </p>
                    </CardContent>
                  </Card>
                )}
                {completedContests.map((contest) => {
                  const typeStyle = getContestTypeStyle(contest.type);
                  const winner = contest.leaderboard[0];

                  return (
                    <motion.div key={contest.id} variants={fadeInUp}>
                      <Card
                        className="overflow-hidden border-0"
                        style={{
                          ...glassStyle,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent style={{ padding: GRID.spacing.md }}>
                          {/* Header */}
                          <div
                            className="flex flex-wrap items-center"
                            style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}
                          >
                            <span
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.title }}
                            >
                              {contest.name}
                            </span>
                            <span
                              className={`${typeStyle.bg} ${typeStyle.text} font-semibold`}
                              style={{
                                fontSize: TYPE.caption,
                                padding: '2px 10px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {typeStyle.label}
                            </span>
                            <span
                              className="bg-gray-100 text-gray-500 font-medium"
                              style={{
                                fontSize: TYPE.caption,
                                padding: '2px 10px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              Completed
                            </span>
                            <span
                              className="text-gray-400 ml-auto"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {contest.startDate} — {contest.endDate}
                            </span>
                          </div>

                          {/* Winner highlight */}
                          {winner && (
                            <div
                              className="flex items-center"
                              style={{
                                gap: GRID.spacing.sm,
                                padding: GRID.spacing.sm,
                                borderRadius: RADIUS.button,
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)',
                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                marginBottom: GRID.spacing.sm,
                              }}
                            >
                              <div
                                className="flex items-center justify-center flex-shrink-0"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: RADIUS.button,
                                  ...getRankBadgeStyle(1),
                                }}
                              >
                                <Crown style={{ width: 16, height: 16, color: '#ffffff' }} />
                              </div>
                              <div
                                className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                                style={{
                                  width: LAYOUT.icon.xxl,
                                  height: LAYOUT.icon.xxl,
                                  borderRadius: RADIUS.button,
                                  fontSize: TYPE.caption,
                                  boxShadow: SHADOW.level1,
                                }}
                              >
                                {winner.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-amber-700" style={{ fontSize: TYPE.meta }}>
                                  {winner.name}
                                </p>
                                <p className="text-amber-600" style={{ fontSize: TYPE.caption }}>
                                  Winner — {formatScore(winner.score, winner.metric)}
                                </p>
                              </div>
                              <span className="font-bold text-emerald-600" style={{ fontSize: TYPE.body }}>
                                {contest.prize}
                              </span>
                            </div>
                          )}

                          {/* Top 3 final leaderboard */}
                          {contest.leaderboard.length > 1 && (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: GRID.spacing.xs,
                              }}
                            >
                              {contest.leaderboard.slice(0, 3).map((entry, idx) => {
                                const rank = idx + 1;
                                return (
                                  <div
                                    key={entry.agentId}
                                    className="flex items-center"
                                    style={{ gap: GRID.spacing.sm }}
                                  >
                                    <div
                                      className="flex items-center justify-center flex-shrink-0 font-bold"
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: RADIUS.button,
                                        fontSize: TYPE.caption,
                                        ...getRankBadgeStyle(rank),
                                      }}
                                    >
                                      {rank === 1 ? (
                                        <Crown style={{ width: 14, height: 14, color: '#ffffff' }} />
                                      ) : rank === 2 ? (
                                        <Medal style={{ width: 14, height: 14, color: '#ffffff' }} />
                                      ) : (
                                        <Medal style={{ width: 14, height: 14, color: '#ffffff' }} />
                                      )}
                                    </div>
                                    <div
                                      className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                                      style={{
                                        width: LAYOUT.icon.xxl,
                                        height: LAYOUT.icon.xxl,
                                        borderRadius: RADIUS.button,
                                        fontSize: TYPE.caption,
                                        boxShadow: SHADOW.level1,
                                      }}
                                    >
                                      {entry.avatar}
                                    </div>
                                    <span
                                      className="font-semibold text-gray-900 flex-1"
                                      style={{ fontSize: TYPE.meta }}
                                    >
                                      {entry.name}
                                    </span>
                                    <span
                                      className="font-bold text-gray-700 flex-shrink-0"
                                      style={{ fontSize: TYPE.meta }}
                                    >
                                      {formatScore(entry.score, entry.metric)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══════════════ TEMPLATES TAB ═══════════════ */}
            <TabsContent value="templates" style={{ marginTop: GRID.spacing.md }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: GRID.spacing.md }}>
                {CONTEST_TEMPLATES.map((template) => {
                  const IconComponent = TEMPLATE_ICONS[template.icon] || Trophy;
                  return (
                    <motion.div key={template.id} variants={fadeInUp}>
                      <Card
                        className="overflow-hidden border-0"
                        style={{
                          ...glassStyle,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent style={{ padding: GRID.spacing.md }}>
                          {/* Icon badge */}
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.button,
                              marginBottom: GRID.spacing.sm,
                            }}
                          >
                            <IconComponent
                              className="text-amber-200"
                              style={{ width: 20, height: 20 }}
                            />
                          </div>

                          {/* Name */}
                          <p
                            className="font-bold text-gray-900"
                            style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.xs / 2 }}
                          >
                            {template.name}
                          </p>

                          {/* Description */}
                          <p
                            className="text-gray-500"
                            style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.sm }}
                          >
                            {template.description}
                          </p>

                          {/* Duration & Metric tags */}
                          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
                            <span
                              className="bg-gray-100 text-gray-600 font-medium"
                              style={{
                                fontSize: TYPE.caption,
                                padding: '2px 10px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {template.duration}
                            </span>
                            <span
                              className="bg-emerald-50 text-emerald-700 font-medium"
                              style={{
                                fontSize: TYPE.caption,
                                padding: '2px 10px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {template.metric}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerContests;
