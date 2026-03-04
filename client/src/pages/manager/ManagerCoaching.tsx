/**
 * Manager Coaching Center
 * Track coaching sessions, development goals, and coaching notes
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  glassCard,
  DEMO_COACHING_SESSIONS,
  DEMO_LEARNING_PATHS,
  DEMO_SKILL_GAPS,
  DEMO_TEAM_MEMBERS,
  PRIORITY_COLORS,
} from './managerConstants';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  CalendarCheck,
  Users,
  Target,
  TrendingUp,
  Clock,
  FileText,
  BookOpen,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Flag,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/* ── Demo Development Goals ────────────────────────────────── */
const DEMO_GOALS = [
  { agent: 'Sarah Johnson', avatar: 'SJ', goal: 'Improve close rate to 30%', progress: 78, due: 'Mar 15' },
  { agent: 'Carlos Martinez', avatar: 'CM', goal: 'Complete IUL certification', progress: 45, due: 'Mar 22' },
  { agent: 'Anna Kim', avatar: 'AK', goal: 'Build referral pipeline', progress: 30, due: 'Apr 1' },
  { agent: 'Lisa Park', avatar: 'LP', goal: 'Master objection handling', progress: 62, due: 'Mar 28' },
];

/* ── Demo Coaching Notes ───────────────────────────────────── */
const DEMO_NOTES = [
  {
    agent: 'Carlos Martinez',
    avatar: 'CM',
    date: 'Feb 28, 2026',
    note: 'Reviewed closing techniques — Carlos is improving on trial closes but needs to work on urgency framing. Assigned role-play exercises for next week.',
  },
  {
    agent: 'Anna Kim',
    avatar: 'AK',
    date: 'Feb 26, 2026',
    note: 'Discussed referral pipeline strategy. Anna has started asking for referrals at policy delivery but needs a more systematic follow-up process.',
  },
  {
    agent: 'Ryan Taylor',
    avatar: 'RT',
    date: 'Feb 25, 2026',
    note: 'IUL product knowledge session — Ryan is still struggling with illustration software. Scheduled additional 1:1 training for next Tuesday.',
  },
];

type Tab = 'coaching' | 'learning';

export function ManagerCoaching() {
  const [activeTab, setActiveTab] = useState<Tab>('coaching');

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={GraduationCap}
          title="Coaching Center"
          subtitle="Develop your team's skills and drive growth"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={CalendarCheck}
              value={8}
              label="Sessions This Month"
              trend={{ value: 3, positive: true }}
            />
            <ManagerStatCard icon={Users} value={6} label="Agents Coached" />
            <ManagerStatCard icon={Target} value={15} label="Goals Set" />
            <ManagerStatCard
              icon={TrendingUp}
              value="72%"
              label="Completion Rate"
              trend={{ value: '8%', positive: true }}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Switcher ─────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex"
          style={{ gap: GRID.spacing.xs / 2 }}
        >
          {[
            { id: 'coaching' as Tab, label: 'Coaching', icon: GraduationCap },
            { id: 'learning' as Tab, label: 'Learning Paths', icon: BookOpen },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center font-medium border-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                  : 'text-gray-600'
              }`}
              style={{
                ...(activeTab !== tab.id ? glassCard : {}),
                borderRadius: RADIUS.button,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                fontSize: 14,
                gap: GRID.spacing.xs,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <tab.icon style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── TAB: Coaching Content ─────────────────────────── */}
        {activeTab === 'coaching' && (
        <>
        {/* ── Two-Column Content ───────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Left: Upcoming Sessions */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
                  <Clock className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Upcoming Sessions</span>
              </CardTitle>
            </CardHeader>

            {/* Session rows */}
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {DEMO_COACHING_SESSIONS.map((session) => (
                  <motion.div
                    key={session.id}
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
                    {/* Date / time */}
                    <div className="flex-shrink-0 text-center" style={{ minWidth: 56 }}>
                      <p className="font-semibold text-gray-900 text-sm">{session.date}</p>
                      <p className="text-gray-400 text-xs">{session.time}</p>
                    </div>

                    {/* Agent + topic */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{session.agent}</p>
                      <p className="text-gray-500 text-xs">{session.topic}</p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center font-medium ${
                        session.status === 'scheduled'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={{
                        borderRadius: RADIUS.pill,
                        border: 0,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        fontSize: 12,
                      }}
                    >
                      {session.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Development Goals */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
                  <Target className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Development Goals</span>
              </CardTitle>
            </CardHeader>

            {/* Goal rows */}
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_GOALS.map((g, idx) => (
                  <motion.div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: RADIUS.button,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{g.agent}</p>
                        <p className="text-gray-500 text-xs">{g.goal}</p>
                      </div>
                      <span className="text-gray-400 flex-shrink-0 text-xs">
                        Due {g.due}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      className="w-full bg-gray-100 overflow-hidden"
                      style={{ height: 6, borderRadius: RADIUS.pill }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${g.progress}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + idx * 0.1 }}
                        style={{ borderRadius: RADIUS.pill }}
                      />
                    </div>
                    <p className="text-right text-emerald-600 font-semibold text-xs" style={{ marginTop: GRID.spacing.xs / 2 }}>
                      {g.progress}%
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Recent Coaching Notes (full width) ───────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
                  <FileText className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Recent Coaching Notes</span>
              </CardTitle>
            </CardHeader>

            {/* Notes list */}
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_NOTES.map((n, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start"
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
                    {/* Small avatar circle */}
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex-shrink-0"
                      style={{
                        width: LAYOUT.icon.xxl,
                        height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.caption,
                      }}
                    >
                      {n.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs / 2 }}>
                        <p className="font-semibold text-gray-900 text-sm">{n.agent}</p>
                        <span className="text-gray-400 flex-shrink-0 text-xs">{n.date}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">{n.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </>
        )}

        {/* ── TAB: Learning Paths Content ───────────────────── */}
        {activeTab === 'learning' && (
        <>
        {/* ── Two-Column Content ───────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Left: Learning Paths */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
                  <BookOpen className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Assigned Learning Paths</span>
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_LEARNING_PATHS.map((path) => {
                  const assignedNames = DEMO_TEAM_MEMBERS
                    .filter((m) => (path.assignedAgents as readonly string[]).includes(m.id))
                    .map((m) => m.name.split(' ')[0]);
                  const priorityColor = PRIORITY_COLORS[path.priority];

                  return (
                    <motion.div
                      key={path.id}
                      style={{
                        padding: 12,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{
                        backgroundColor: COLORS.gray[100],
                        transition: { duration: MOTION.duration.hover },
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                        <p className="font-semibold text-gray-900 text-sm">
                          {path.name}
                        </p>
                        <span
                          className={`inline-flex items-center font-medium ${priorityColor.bg} ${priorityColor.text}`}
                          style={{
                            borderRadius: RADIUS.pill,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: 12,
                            gap: 4,
                          }}
                        >
                          <Flag style={{ width: 10, height: 10 }} />
                          {path.priority}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs" style={{ marginBottom: GRID.spacing.xs }}>
                        {path.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">
                          {path.modules} modules · {path.estimatedHours}h
                        </span>
                        <div className="flex items-center" style={{ gap: 4 }}>
                          <Users className="text-gray-400" style={{ width: 12, height: 12 }} />
                          <span className="text-gray-500 text-xs">
                            {assignedNames.join(', ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right: Skill Gap Analysis */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
                  <AlertTriangle className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Skill Gap Analysis</span>
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_SKILL_GAPS.map((gap, idx) => (
                  <motion.div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: RADIUS.button,
                      backgroundColor: gap.assessmentScore < 60 ? 'rgba(254,202,202,0.15)' : COLORS.gray[50],
                      border: `1px solid ${gap.assessmentScore < 60 ? 'rgba(254,202,202,0.4)' : COLORS.gray[100]}`,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[100],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 12, marginBottom: GRID.spacing.xs }}>
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                      >
                        {gap.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {gap.agent}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          gap.assessmentScore < 60 ? 'text-red-600' : gap.assessmentScore < 75 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {gap.assessmentScore}%
                      </span>
                    </div>
                    <div style={{ marginBottom: GRID.spacing.xs }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                        <span className="text-gray-500 text-xs">
                          Weak area: {gap.weakArea}
                        </span>
                      </div>
                      <Progress value={gap.assessmentScore} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ gap: 4 }}>
                        <Zap className="text-amber-500" style={{ width: 12, height: 12 }} />
                        <span className="text-gray-500 text-xs">
                          Recommended: {gap.recommendedPath}
                        </span>
                      </div>
                      <motion.button
                        className="font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                        style={{
                          fontSize: 12,
                          padding: `2px ${GRID.spacing.xs}px`,
                          borderRadius: RADIUS.button,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Assign
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Prerequisite Overrides (full width) ──────────── */}
        <motion.div variants={fadeInUp}>
          <div
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
            style={{ borderRadius: RADIUS.card }}
          >
            <div className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)' }} />
            <div className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl" style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)' }} />

            <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button,
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                  }}
                >
                  <Lock className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                </div>
                <div>
                  <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Prerequisite Overrides</p>
                  <p className="text-white/70 text-[10px]">Unlock modules early for specific agents</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {[
                  { agent: 'Carlos Martinez', avatar: 'CM', module: 'Advanced IUL Illustrations', prerequisite: 'IUL Fundamentals', unlocked: false },
                  { agent: 'Anna Kim', avatar: 'AK', module: 'Client Retention Strategies', prerequisite: 'Sales Fundamentals', unlocked: true },
                  { agent: 'Ryan Taylor', avatar: 'RT', module: 'Closing Mastery', prerequisite: 'Objection Handling', unlocked: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center"
                    style={{
                      gap: 12,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', fontSize: TYPE.micro }}
                    >
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{item.agent}</p>
                      <p className="text-white/60 text-xs">
                        {item.module} <span className="text-white/40">← needs {item.prerequisite}</span>
                      </p>
                    </div>
                    <motion.button
                      className={`flex items-center font-medium border-0 ${
                        item.unlocked ? 'text-amber-200' : 'text-white/80'
                      }`}
                      style={{
                        fontSize: 12,
                        gap: 4,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        borderRadius: RADIUS.button,
                        background: item.unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.unlocked ? (
                        <><Unlock style={{ width: 12, height: 12 }} /> Unlocked</>
                      ) : (
                        <><Lock style={{ width: 12, height: 12 }} /> Override</>
                      )}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </>
        )}
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerCoaching;
