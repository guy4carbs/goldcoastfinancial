/**
 * Manager Onboarding
 * Track new agent onboarding progress, milestones, and readiness
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { DEMO_TEAM_MEMBERS, glassCard } from './managerConstants';
import { toast } from 'sonner';
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
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Users,
  Clock,
  TrendingUp,
  Award,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  BarChart3,
  Shield,
  UserPlus,
  FileText,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────── */

type OnboardingStatus = 'on_track' | 'slow' | 'at_risk';
type PhaseBadge = 'Week 1' | 'Week 2' | 'Week 3-4' | 'Month 2+';

interface Milestone {
  name: string;
  completed: boolean;
  completedDate?: string;
}

interface MilestonePhase {
  name: string;
  timeframe: string;
  milestones: Milestone[];
}

interface OnboardingAgent {
  name: string;
  avatar: string;
  startDate: string;
  status: OnboardingStatus;
  milestonePhases: MilestonePhase[];
}

/* ── Computed Helpers ─────────────────────────────────────── */

function getDaysInProgram(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function getPhase(days: number): PhaseBadge {
  if (days <= 7) return 'Week 1';
  if (days <= 14) return 'Week 2';
  if (days <= 28) return 'Week 3-4';
  return 'Month 2+';
}

function getMilestoneProgress(phases: MilestonePhase[]): number {
  const total = phases.reduce((sum, p) => sum + p.milestones.length, 0);
  const completed = phases.reduce((sum, p) => sum + p.milestones.filter((m) => m.completed).length, 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

interface MentorPairing {
  newAgent: string;
  newAgentAvatar: string;
  mentor: string;
  mentorAvatar: string;
  status: 'Active' | 'Pending';
}

/* ── Status Colors ────────────────────────────────────────── */

const STATUS_STYLE: Record<OnboardingStatus, { bg: string; text: string; label: string }> = {
  on_track: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'On Track' },
  slow: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Slow' },
  at_risk: { bg: 'bg-red-100', text: 'text-red-700', label: 'At Risk' },
};

const PHASE_STYLE: Record<PhaseBadge, { bg: string; text: string }> = {
  'Week 1': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Week 2': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Week 3-4': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'Month 2+': { bg: 'bg-purple-100', text: 'text-purple-700' },
};

/* ── Demo Data — Onboarding Agents ────────────────────────── */

const DEMO_ONBOARDING_AGENTS: OnboardingAgent[] = [
  {
    name: 'Ryan Taylor',
    avatar: 'RT',
    startDate: 'Feb 20, 2026',
    status: 'on_track',
    milestonePhases: [
      {
        name: 'Phase 1',
        timeframe: 'Day 1-3',
        milestones: [
          { name: 'Orientation', completed: true, completedDate: 'Feb 20' },
          { name: 'System Setup', completed: true, completedDate: 'Feb 21' },
          { name: 'Product Overview', completed: true, completedDate: 'Feb 22' },
        ],
      },
      {
        name: 'Phase 2',
        timeframe: 'Day 4-7',
        milestones: [
          { name: 'Shadow Calls', completed: true, completedDate: 'Feb 25' },
          { name: 'Script Training', completed: true, completedDate: 'Feb 26' },
          { name: 'First Mock Call', completed: false },
        ],
      },
      {
        name: 'Phase 3',
        timeframe: 'Week 2-4',
        milestones: [
          { name: 'First Solo Calls', completed: false },
          { name: 'Pipeline Building', completed: false },
          { name: 'Initial Close', completed: false },
        ],
      },
      {
        name: 'Phase 4',
        timeframe: 'Month 2+',
        milestones: [
          { name: 'Consistent Production', completed: false },
          { name: 'Mentorship Complete', completed: false },
          { name: 'Full Certification', completed: false },
        ],
      },
    ],
  },
  {
    name: 'Anna Kim',
    avatar: 'AK',
    startDate: 'Feb 4, 2026',
    status: 'on_track',
    milestonePhases: [
      {
        name: 'Phase 1',
        timeframe: 'Day 1-3',
        milestones: [
          { name: 'Orientation', completed: true, completedDate: 'Feb 4' },
          { name: 'System Setup', completed: true, completedDate: 'Feb 4' },
          { name: 'Product Overview', completed: true, completedDate: 'Feb 5' },
        ],
      },
      {
        name: 'Phase 2',
        timeframe: 'Day 4-7',
        milestones: [
          { name: 'Shadow Calls', completed: true, completedDate: 'Feb 7' },
          { name: 'Script Training', completed: true, completedDate: 'Feb 8' },
          { name: 'First Mock Call', completed: true, completedDate: 'Feb 10' },
        ],
      },
      {
        name: 'Phase 3',
        timeframe: 'Week 2-4',
        milestones: [
          { name: 'First Solo Calls', completed: true, completedDate: 'Feb 14' },
          { name: 'Pipeline Building', completed: false },
          { name: 'Initial Close', completed: false },
        ],
      },
      {
        name: 'Phase 4',
        timeframe: 'Month 2+',
        milestones: [
          { name: 'Consistent Production', completed: false },
          { name: 'Mentorship Complete', completed: false },
          { name: 'Full Certification', completed: false },
        ],
      },
    ],
  },
  {
    name: 'Sophia Chen',
    avatar: 'SC',
    startDate: 'Feb 27, 2026',
    status: 'on_track',
    milestonePhases: [
      {
        name: 'Phase 1',
        timeframe: 'Day 1-3',
        milestones: [
          { name: 'Orientation', completed: true, completedDate: 'Feb 27' },
          { name: 'System Setup', completed: true, completedDate: 'Feb 28' },
          { name: 'Product Overview', completed: false },
        ],
      },
      {
        name: 'Phase 2',
        timeframe: 'Day 4-7',
        milestones: [
          { name: 'Shadow Calls', completed: false },
          { name: 'Script Training', completed: false },
          { name: 'First Mock Call', completed: false },
        ],
      },
      {
        name: 'Phase 3',
        timeframe: 'Week 2-4',
        milestones: [
          { name: 'First Solo Calls', completed: false },
          { name: 'Pipeline Building', completed: false },
          { name: 'Initial Close', completed: false },
        ],
      },
      {
        name: 'Phase 4',
        timeframe: 'Month 2+',
        milestones: [
          { name: 'Consistent Production', completed: false },
          { name: 'Mentorship Complete', completed: false },
          { name: 'Full Certification', completed: false },
        ],
      },
    ],
  },
  {
    name: 'Marcus Webb',
    avatar: 'MW',
    startDate: 'Jan 21, 2026',
    status: 'slow',
    milestonePhases: [
      {
        name: 'Phase 1',
        timeframe: 'Day 1-3',
        milestones: [
          { name: 'Orientation', completed: true, completedDate: 'Jan 21' },
          { name: 'System Setup', completed: true, completedDate: 'Jan 21' },
          { name: 'Product Overview', completed: true, completedDate: 'Jan 22' },
        ],
      },
      {
        name: 'Phase 2',
        timeframe: 'Day 4-7',
        milestones: [
          { name: 'Shadow Calls', completed: true, completedDate: 'Jan 24' },
          { name: 'Script Training', completed: true, completedDate: 'Jan 27' },
          { name: 'First Mock Call', completed: true, completedDate: 'Jan 29' },
        ],
      },
      {
        name: 'Phase 3',
        timeframe: 'Week 2-4',
        milestones: [
          { name: 'First Solo Calls', completed: true, completedDate: 'Feb 3' },
          { name: 'Pipeline Building', completed: true, completedDate: 'Feb 10' },
          { name: 'Initial Close', completed: false },
        ],
      },
      {
        name: 'Phase 4',
        timeframe: 'Month 2+',
        milestones: [
          { name: 'Consistent Production', completed: false },
          { name: 'Mentorship Complete', completed: false },
          { name: 'Full Certification', completed: false },
        ],
      },
    ],
  },
];

/* ── Demo Data — Mentor Pairings ──────────────────────────── */

const DEMO_MENTOR_PAIRINGS: MentorPairing[] = [
  {
    newAgent: 'Ryan Taylor',
    newAgentAvatar: 'RT',
    mentor: DEMO_TEAM_MEMBERS[0].name, // Sarah Johnson
    mentorAvatar: DEMO_TEAM_MEMBERS[0].avatar,
    status: 'Active',
  },
  {
    newAgent: 'Anna Kim',
    newAgentAvatar: 'AK',
    mentor: DEMO_TEAM_MEMBERS[6].name, // Rachel Green
    mentorAvatar: DEMO_TEAM_MEMBERS[6].avatar,
    status: 'Active',
  },
  {
    newAgent: 'Sophia Chen',
    newAgentAvatar: 'SC',
    mentor: DEMO_TEAM_MEMBERS[1].name, // Mike Chen
    mentorAvatar: DEMO_TEAM_MEMBERS[1].avatar,
    status: 'Pending',
  },
  {
    newAgent: 'Marcus Webb',
    newAgentAvatar: 'MW',
    mentor: DEMO_TEAM_MEMBERS[5].name, // David Brown
    mentorAvatar: DEMO_TEAM_MEMBERS[5].avatar,
    status: 'Active',
  },
];

/* ── Demo Data — Onboarding Metrics ───────────────────────── */

const DEMO_ONBOARDING_METRICS = [
  { icon: Calendar, label: 'Avg time to first appointment', value: '8 days' },
  { icon: Target, label: 'Avg time to first close', value: '22 days' },
  { icon: Clock, label: 'Avg time to quota', value: '45 days' },
  { icon: Shield, label: 'Retention at 90 days', value: '85%' },
];

/* ── Component ────────────────────────────────────────────── */

export function ManagerOnboardingTracker() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleExpanded = (name: string) => {
    setExpandedAgent((prev) => (prev === name ? null : name));
  };

  const onTrackCount = DEMO_ONBOARDING_AGENTS.filter((a) => a.status === 'on_track').length;

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Zap}
          title="Onboarding"
          subtitle="Track new agent progress and readiness"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value={DEMO_ONBOARDING_AGENTS.length} label="New Agents" delta={1} periodLabel="vs last month" />
            <ManagerStatCard icon={Clock} value="45 days" label="Avg Ramp Time" delta={-5} periodLabel="vs prior cohort" />
            <ManagerStatCard
              icon={TrendingUp}
              value={onTrackCount}
              label="On Track"
              delta={1}
              periodLabel="vs last week"
            />
            <ManagerStatCard icon={Award} value="85%" label="Graduation Rate" delta={3} deltaFormat="percent" periodLabel="vs last quarter" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio Layout ──────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ── Left Column (1.618fr) ────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Active Onboarding Card */}
            <Card
              className="overflow-hidden"
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
                    <Users className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Active Onboarding</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {DEMO_ONBOARDING_AGENTS.map((agent, idx) => {
                    const isExpanded = expandedAgent === agent.name;
                    const statusStyle = STATUS_STYLE[agent.status];
                    const daysInProgram = getDaysInProgram(agent.startDate);
                    const phase = getPhase(daysInProgram);
                    const progress = getMilestoneProgress(agent.milestonePhases);
                    const phaseStyle = PHASE_STYLE[phase];

                    return (
                      <div key={agent.name}>
                        {/* Agent Summary Row */}
                        <motion.div
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            cursor: 'pointer',
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                          onClick={() => toggleExpanded(agent.name)}
                        >
                          <div className="flex items-center" style={{ gap: 12, marginBottom: GRID.spacing.xs }}>
                            {/* Avatar */}
                            <div
                              className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.caption,
                              }}
                            >
                              {agent.avatar}
                            </div>

                            {/* Name + start date + days */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                                Started {agent.startDate} · Day {daysInProgram}
                              </p>
                            </div>

                            {/* Phase badge */}
                            <span
                              className={`inline-flex items-center font-medium ${phaseStyle.bg} ${phaseStyle.text}`}
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                fontSize: 12,
                              }}
                            >
                              {phase}
                            </span>

                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center font-medium ${statusStyle.bg} ${statusStyle.text}`}
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                fontSize: 12,
                              }}
                            >
                              {statusStyle.label}
                            </span>

                            {/* Expand chevron */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: MOTION.duration.normal }}
                            >
                              <ChevronDown className="text-gray-400" size={LAYOUT.icon.sm} />
                            </motion.div>
                          </div>

                          {/* Progress bar */}
                          <div style={{ paddingLeft: 52 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Overall Progress</span>
                              <span className="text-emerald-600 font-semibold" style={{ fontSize: TYPE.caption }}>{progress}%</span>
                            </div>
                            <div
                              className="w-full bg-gray-100 overflow-hidden"
                              style={{ height: 6, borderRadius: RADIUS.pill }}
                            >
                              <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + idx * 0.1 }}
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Expanded Milestone Checklist */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div
                                style={{
                                  padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px 52px`,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: GRID.spacing.sm,
                                }}
                              >
                                {agent.milestonePhases.map((phase) => (
                                  <div key={phase.name}>
                                    <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs / 2 }}>
                                      {phase.name}{' '}
                                      <span className="text-gray-400 font-normal">({phase.timeframe})</span>
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      {phase.milestones.map((milestone) => (
                                        <div
                                          key={milestone.name}
                                          className="flex items-center"
                                          style={{ gap: 8 }}
                                        >
                                          {milestone.completed ? (
                                            <CheckCircle2
                                              className="text-emerald-500 flex-shrink-0"
                                              size={LAYOUT.icon.sm}
                                            />
                                          ) : (
                                            <Circle
                                              className="text-gray-300 flex-shrink-0"
                                              size={LAYOUT.icon.sm}
                                            />
                                          )}
                                          <span
                                            className={`${
                                              milestone.completed ? 'text-gray-600' : 'text-gray-400'
                                            }`}
                                            style={{ fontSize: TYPE.caption }}
                                          >
                                            {milestone.name}
                                          </span>
                                          {milestone.completedDate && (
                                            <span className="text-gray-300 ml-auto flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                                              {milestone.completedDate}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
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
          </div>

          {/* ── Right Column (1fr) ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Onboarding Metrics — Gradient Card */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
              style={{ borderRadius: RADIUS.card }}
            >
              {/* Fibonacci blobs */}
              <div
                className="absolute top-0 right-0 bg-white/10 blur-2xl"
                style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl"
                style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)', borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute top-1/2 left-1/2 bg-white/5 blur-lg"
                style={{ width: 34, height: 34, transform: 'translate(-50%, -50%)', borderRadius: RADIUS.pill }}
              />

              <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.button,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Onboarding Metrics</p>
                    <p className="text-white/70 text-[10px]">Onboarding metrics</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_ONBOARDING_METRICS.map((metric) => (
                    <div
                      key={metric.label}
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
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xl,
                          height: LAYOUT.icon.xl,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255,255,255,0.15)',
                        }}
                      >
                        <metric.icon className="text-amber-200" size={LAYOUT.icon.sm} />
                      </div>
                      <span className="text-white/80 flex-1" style={{ fontSize: TYPE.meta }}>{metric.label}</span>
                      <span className="text-white font-semibold" style={{ fontSize: TYPE.meta }}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mentor Assignments — Glass Card */}
            <Card
              className="overflow-hidden"
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
                    <UserPlus className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Mentor Assignments</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_MENTOR_PAIRINGS.map((pairing) => (
                    <motion.div
                      key={pairing.newAgent}
                      className="flex items-center"
                      style={{
                        padding: 12,
                        borderRadius: RADIUS.button,
                        gap: 10,
                      }}
                      whileHover={{
                        backgroundColor: COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover },
                      }}
                    >
                      {/* New agent avatar */}
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {pairing.newAgentAvatar}
                      </div>

                      {/* New agent name */}
                      <div className="min-w-0" style={{ flex: '0 0 auto' }}>
                        <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{pairing.newAgent}</p>
                        <p className="text-gray-400 text-[10px]">New Agent</p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="text-gray-300 flex-shrink-0" style={{ width: 14, height: 14 }} />

                      {/* Mentor avatar */}
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {pairing.mentorAvatar}
                      </div>

                      {/* Mentor name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{pairing.mentor}</p>
                        <p className="text-gray-400 text-[10px]">Mentor</p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center font-medium flex-shrink-0 ${
                          pairing.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                          fontSize: 12,
                        }}
                      >
                        {pairing.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions — Glass Card */}
            <Card
              className="overflow-hidden"
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
                    <Zap className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Quick Actions</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {[
                    { label: 'Assign Mentor', icon: UserPlus },
                    { label: 'New Plan', icon: FileText },
                    { label: 'Schedule Check-in', icon: CalendarCheck },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      className="flex items-center w-full font-medium text-gray-700 border border-gray-200 hover:border-emerald-300 bg-white"
                      style={{
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        gap: GRID.spacing.xs,
                        fontSize: TYPE.meta,
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toast.success(`${action.label} coming soon`)}
                    >
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xl,
                          height: LAYOUT.icon.xl,
                          borderRadius: RADIUS.button,
                        }}
                      >
                        <action.icon className="text-amber-200" style={{ width: 14, height: 14 }} />
                      </div>
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerOnboardingTracker;
