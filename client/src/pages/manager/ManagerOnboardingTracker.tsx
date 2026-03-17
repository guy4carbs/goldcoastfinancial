/**
 * Manager Onboarding
 * Track new agent onboarding progress, milestones, and readiness
 * Heritage Design System — Emerald theme
 */

import { useState, useRef, useEffect } from 'react';
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
  X,
  ChevronRight,
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

/* ── Onboarding Plan Templates ───────────────────────────── */

const PLAN_TEMPLATES = [
  { id: 'standard', label: 'Standard 90-Day', description: '4-phase ramp with mentorship, shadow calls, and production targets' },
  { id: 'accelerated', label: 'Accelerated 60-Day', description: 'Compressed timeline for experienced agents transferring from another agency' },
  { id: 'part-time', label: 'Part-Time Flex', description: 'Extended timeline with flexible milestones for part-time recruits' },
  { id: 'custom', label: 'Custom Plan', description: 'Build a custom onboarding plan from scratch' },
];

/* ── Available Mentors (senior team members) ─────────────── */

const AVAILABLE_MENTORS = DEMO_TEAM_MEMBERS.filter((_, i) => [0, 1, 5, 6].includes(i));

/* ── Check-in Time Slots ─────────────────────────────────── */

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
  '3:30 PM', '4:00 PM', '4:30 PM',
];

/* ── Date Options (next 21 weekdays) ─────────────────────── */

function generateDateOptions(): { value: string; label: string; day: string }[] {
  const dates: { value: string; label: string; day: string }[] = [];
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  while (dates.length < 21) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push({
        value: iso,
        label: `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
        day: dayNames[dow],
      });
    }
    d = new Date(d.getTime() + 86400000);
  }
  return dates;
}

const DATE_OPTIONS = generateDateOptions();

export function ManagerOnboardingTracker() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'assign-mentor' | 'new-plan' | 'schedule-checkin' | null>(null);

  /* ── Assign Mentor form state ── */
  const [mentorFormAgent, setMentorFormAgent] = useState('');
  const [mentorFormMentor, setMentorFormMentor] = useState('');

  /* ── New Plan form state ── */
  const [planFormAgent, setPlanFormAgent] = useState('');
  const [planFormTemplate, setPlanFormTemplate] = useState('');
  const [planFormStartDate, setPlanFormStartDate] = useState('');

  /* ── Schedule Check-in form state ── */
  const [checkinFormAgent, setCheckinFormAgent] = useState('');
  const [checkinFormDate, setCheckinFormDate] = useState('');
  const [checkinFormTime, setCheckinFormTime] = useState('');
  const [checkinFormNotes, setCheckinFormNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCheckinDatePicker, setShowCheckinDatePicker] = useState(false);
  const [showPlanDatePicker, setShowPlanDatePicker] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const checkinDateRef = useRef<HTMLDivElement>(null);
  const planDateRef = useRef<HTMLDivElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) setShowTimePicker(false);
      if (checkinDateRef.current && !checkinDateRef.current.contains(e.target as Node)) setShowCheckinDatePicker(false);
      if (planDateRef.current && !planDateRef.current.contains(e.target as Node)) setShowPlanDatePicker(false);
    };
    if (showTimePicker || showCheckinDatePicker || showPlanDatePicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimePicker, showCheckinDatePicker, showPlanDatePicker]);

  const resetModalForms = () => {
    setMentorFormAgent(''); setMentorFormMentor('');
    setPlanFormAgent(''); setPlanFormTemplate(''); setPlanFormStartDate('');
    setCheckinFormAgent(''); setCheckinFormDate(''); setCheckinFormTime(''); setCheckinFormNotes('');
    setShowTimePicker(false); setShowCheckinDatePicker(false); setShowPlanDatePicker(false);
  };

  const closeModal = () => { setActiveModal(null); resetModalForms(); };

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
                        padding: GRID.spacing.xs,
                        borderRadius: RADIUS.button,
                        gap: GRID.spacing.xs,
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
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {pairing.newAgentAvatar}
                      </div>

                      {/* New agent name */}
                      <div className="min-w-0" style={{ flex: '0 0 auto' }}>
                        <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{pairing.newAgent}</p>
                        <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>New Agent</p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="text-gray-300 flex-shrink-0" size={LAYOUT.icon.xs} />

                      {/* Mentor avatar */}
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {pairing.mentorAvatar}
                      </div>

                      {/* Mentor name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{pairing.mentor}</p>
                        <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Mentor</p>
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
                          fontSize: TYPE.micro,
                        }}
                      >
                        {pairing.status}
                      </span>
                    </motion.div>
                  ))}
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
                    <p className="text-white/70" style={{ fontSize: TYPE.micro }}>Onboarding metrics</p>
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
                  {([
                    { label: 'Assign Mentor', icon: UserPlus, modal: 'assign-mentor' as const },
                    { label: 'New Plan', icon: FileText, modal: 'new-plan' as const },
                    { label: 'Schedule Check-in', icon: CalendarCheck, modal: 'schedule-checkin' as const },
                  ] as const).map((action) => (
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
                      onClick={() => setActiveModal(action.modal)}
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
                      <ChevronRight className="ml-auto text-gray-300" size={14} />
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          QUICK ACTION MODALS
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.modal }}
              onClick={closeModal}
            />

            {/* Modal Panel */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ padding: GRID.spacing.md }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ...MOTION.spring }}
            >
              <div
                className="bg-white w-full overflow-hidden flex flex-col"
                style={{ maxWidth: 520, maxHeight: `calc(100vh - ${GRID.spacing.xxxl * 2}px)`, borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── ASSIGN MENTOR MODAL ── */}
                {activeModal === 'assign-mentor' && (
                  <>
                    {/* Header */}
                    <div
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0"
                      style={{ padding: GRID.spacing.md }}
                    >
                      <div className="absolute top-0 right-0 bg-white/10 blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }} />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)' }}
                          >
                            <UserPlus className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <div>
                            <p className="font-bold text-white" style={{ fontSize: TYPE.title }}>Assign Mentor</p>
                            <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Pair a new agent with a senior team member</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={closeModal}
                          className="flex items-center justify-center flex-shrink-0"
                          style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.15)' }}
                        >
                          <X className="text-white" size={LAYOUT.icon.sm} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Body — scrollable */}
                    <div
                      className="overflow-y-auto flex-1 min-h-0"
                      style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
                    >
                      {/* Select Agent */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>New Agent</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {DEMO_ONBOARDING_AGENTS.map((agent) => (
                            <motion.button
                              key={agent.name}
                              className={`flex items-center w-full text-left border ${mentorFormAgent === agent.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
                              whileHover={{ backgroundColor: mentorFormAgent === agent.name ? undefined : COLORS.gray[50] }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setMentorFormAgent(agent.name)}
                            >
                              <div
                                className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                              >
                                {agent.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{agent.name}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Started {agent.startDate}</p>
                              </div>
                              {mentorFormAgent === agent.name && <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={LAYOUT.icon.sm} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Select Mentor */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Assign Mentor</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {AVAILABLE_MENTORS.map((mentor) => (
                            <motion.button
                              key={mentor.name}
                              className={`flex items-center w-full text-left border ${mentorFormMentor === mentor.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
                              whileHover={{ backgroundColor: mentorFormMentor === mentor.name ? undefined : COLORS.gray[50] }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setMentorFormMentor(mentor.name)}
                            >
                              <div
                                className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                              >
                                {mentor.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{mentor.name}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{mentor.role}</p>
                              </div>
                              {mentorFormMentor === mentor.name && <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={LAYOUT.icon.sm} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 flex items-center justify-end flex-shrink-0" style={{ padding: GRID.spacing.md, gap: GRID.spacing.xs }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-medium text-gray-500 border border-gray-200 bg-white"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        onClick={closeModal}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        disabled={!mentorFormAgent || !mentorFormMentor}
                        onClick={() => {
                          toast.success(`${mentorFormMentor} assigned as mentor for ${mentorFormAgent}`);
                          closeModal();
                        }}
                      >
                        Assign Mentor
                      </motion.button>
                    </div>
                  </>
                )}

                {/* ── NEW PLAN MODAL ── */}
                {activeModal === 'new-plan' && (
                  <>
                    {/* Header */}
                    <div
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0"
                      style={{ padding: GRID.spacing.md }}
                    >
                      <div className="absolute top-0 right-0 bg-white/10 blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }} />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)' }}
                          >
                            <FileText className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <div>
                            <p className="font-bold text-white" style={{ fontSize: TYPE.title }}>New Onboarding Plan</p>
                            <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Create a structured ramp plan for a new agent</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={closeModal}
                          className="flex items-center justify-center flex-shrink-0"
                          style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.15)' }}
                        >
                          <X className="text-white" size={LAYOUT.icon.sm} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Body — scrollable */}
                    <div
                      className="overflow-y-auto flex-1 min-h-0"
                      style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
                    >
                      {/* Select Agent */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Agent</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {DEMO_ONBOARDING_AGENTS.map((agent) => (
                            <motion.button
                              key={agent.name}
                              className={`flex items-center w-full text-left border ${planFormAgent === agent.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
                              whileHover={{ backgroundColor: planFormAgent === agent.name ? undefined : COLORS.gray[50] }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setPlanFormAgent(agent.name)}
                            >
                              <div
                                className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                              >
                                {agent.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{agent.name}</p>
                              </div>
                              {planFormAgent === agent.name && <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={LAYOUT.icon.sm} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Select Template */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Plan Template</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {PLAN_TEMPLATES.map((tmpl) => (
                            <motion.button
                              key={tmpl.id}
                              className={`flex items-start w-full text-left border ${planFormTemplate === tmpl.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
                              whileHover={{ backgroundColor: planFormTemplate === tmpl.id ? undefined : COLORS.gray[50] }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setPlanFormTemplate(tmpl.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{tmpl.label}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{tmpl.description}</p>
                              </div>
                              {planFormTemplate === tmpl.id && <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={LAYOUT.icon.sm} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Start Date */}
                      <div ref={planDateRef} className="relative">
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Start Date</label>
                        {/* Trigger */}
                        <motion.button
                          type="button"
                          className={`flex items-center w-full border bg-white text-left ${showPlanDatePicker ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'}`}
                          style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, gap: GRID.spacing.xs }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setShowPlanDatePicker((v) => !v)}
                        >
                          <Calendar className={planFormStartDate ? 'text-emerald-500' : 'text-gray-300'} size={LAYOUT.icon.xs} />
                          <span className={planFormStartDate ? 'text-gray-900 font-medium flex-1 truncate' : 'text-gray-400 flex-1'}>
                            {planFormStartDate ? DATE_OPTIONS.find((d) => d.value === planFormStartDate)?.label ?? planFormStartDate : 'Select start date'}
                          </span>
                          <motion.div animate={{ rotate: showPlanDatePicker ? 180 : 0 }} transition={{ duration: MOTION.duration.fast }}>
                            <ChevronDown className="text-gray-400" size={LAYOUT.icon.xs} />
                          </motion.div>
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {showPlanDatePicker && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.96 }}
                              transition={{ duration: MOTION.duration.fast }}
                              className="absolute left-0 right-0 z-10 bg-white border border-gray-200 overflow-hidden"
                              style={{ top: '100%', marginTop: GRID.spacing.xs / 2, borderRadius: RADIUS.button, boxShadow: SHADOW.card, maxHeight: 200, overflowY: 'auto' }}
                            >
                              <div style={{ padding: GRID.spacing.xs / 2 }}>
                                {DATE_OPTIONS.map((opt) => (
                                  <motion.button
                                    key={opt.value}
                                    type="button"
                                    className={`flex items-center w-full text-left ${
                                      planFormStartDate === opt.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    style={{ padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, gap: GRID.spacing.xs }}
                                    whileHover={{ backgroundColor: planFormStartDate === opt.value ? undefined : COLORS.gray[50] }}
                                    onClick={() => { setPlanFormStartDate(opt.value); setShowPlanDatePicker(false); }}
                                  >
                                    <span className={`font-mono flex-shrink-0 ${planFormStartDate === opt.value ? 'text-emerald-500' : 'text-gray-400'}`} style={{ fontSize: TYPE.micro, width: 28 }}>
                                      {opt.day}
                                    </span>
                                    <span className="flex-1">{opt.label}</span>
                                    {planFormStartDate === opt.value && <CheckCircle2 className="text-emerald-500 ml-auto flex-shrink-0" size={LAYOUT.icon.xs} />}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 flex items-center justify-end flex-shrink-0" style={{ padding: GRID.spacing.md, gap: GRID.spacing.xs }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-medium text-gray-500 border border-gray-200 bg-white"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        onClick={closeModal}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        disabled={!planFormAgent || !planFormTemplate || !planFormStartDate}
                        onClick={() => {
                          const template = PLAN_TEMPLATES.find((t) => t.id === planFormTemplate);
                          toast.success(`${template?.label} plan created for ${planFormAgent}`);
                          closeModal();
                        }}
                      >
                        Create Plan
                      </motion.button>
                    </div>
                  </>
                )}

                {/* ── SCHEDULE CHECK-IN MODAL ── */}
                {activeModal === 'schedule-checkin' && (
                  <>
                    {/* Header */}
                    <div
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0"
                      style={{ padding: GRID.spacing.md }}
                    >
                      <div className="absolute top-0 right-0 bg-white/10 blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }} />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)' }}
                          >
                            <CalendarCheck className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <div>
                            <p className="font-bold text-white" style={{ fontSize: TYPE.title }}>Schedule Check-in</p>
                            <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Book a progress review with a new agent</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={closeModal}
                          className="flex items-center justify-center flex-shrink-0"
                          style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.15)' }}
                        >
                          <X className="text-white" size={LAYOUT.icon.sm} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Body — scrollable */}
                    <div
                      className="overflow-y-auto flex-1 min-h-0"
                      style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
                    >
                      {/* Select Agent */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Agent</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {DEMO_ONBOARDING_AGENTS.map((agent) => (
                            <motion.button
                              key={agent.name}
                              className={`flex items-center w-full text-left border ${checkinFormAgent === agent.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                              style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
                              whileHover={{ backgroundColor: checkinFormAgent === agent.name ? undefined : COLORS.gray[50] }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setCheckinFormAgent(agent.name)}
                            >
                              <div
                                className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                              >
                                {agent.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900" style={{ fontSize: TYPE.caption }}>{agent.name}</p>
                              </div>
                              {checkinFormAgent === agent.name && <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={LAYOUT.icon.sm} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                        <div ref={checkinDateRef} className="relative">
                          <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Date</label>
                          {/* Trigger */}
                          <motion.button
                            type="button"
                            className={`flex items-center w-full border bg-white text-left ${showCheckinDatePicker ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'}`}
                            style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, gap: GRID.spacing.xs }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { setShowCheckinDatePicker((v) => !v); setShowTimePicker(false); }}
                          >
                            <Calendar className={checkinFormDate ? 'text-emerald-500' : 'text-gray-300'} size={LAYOUT.icon.xs} />
                            <span className={checkinFormDate ? 'text-gray-900 font-medium flex-1 truncate' : 'text-gray-400 flex-1'}>
                              {checkinFormDate ? DATE_OPTIONS.find((d) => d.value === checkinFormDate)?.label ?? checkinFormDate : 'Select date'}
                            </span>
                            <motion.div animate={{ rotate: showCheckinDatePicker ? 180 : 0 }} transition={{ duration: MOTION.duration.fast }}>
                              <ChevronDown className="text-gray-400" size={LAYOUT.icon.xs} />
                            </motion.div>
                          </motion.button>

                          {/* Dropdown */}
                          <AnimatePresence>
                            {showCheckinDatePicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: MOTION.duration.fast }}
                                className="absolute left-0 right-0 z-10 bg-white border border-gray-200 overflow-hidden"
                                style={{ top: '100%', marginTop: GRID.spacing.xs / 2, borderRadius: RADIUS.button, boxShadow: SHADOW.card, maxHeight: 200, overflowY: 'auto' }}
                              >
                                <div style={{ padding: GRID.spacing.xs / 2 }}>
                                  {DATE_OPTIONS.map((opt) => (
                                    <motion.button
                                      key={opt.value}
                                      type="button"
                                      className={`flex items-center w-full text-left ${
                                        checkinFormDate === opt.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      style={{ padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, gap: GRID.spacing.xs }}
                                      whileHover={{ backgroundColor: checkinFormDate === opt.value ? undefined : COLORS.gray[50] }}
                                      onClick={() => { setCheckinFormDate(opt.value); setShowCheckinDatePicker(false); }}
                                    >
                                      <span className={`font-mono flex-shrink-0 ${checkinFormDate === opt.value ? 'text-emerald-500' : 'text-gray-400'}`} style={{ fontSize: TYPE.micro, width: 28 }}>
                                        {opt.day}
                                      </span>
                                      <span className="flex-1">{opt.label}</span>
                                      {checkinFormDate === opt.value && <CheckCircle2 className="text-emerald-500 ml-auto flex-shrink-0" size={LAYOUT.icon.xs} />}
                                    </motion.button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div ref={timePickerRef} className="relative">
                          <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Time</label>
                          {/* Trigger button */}
                          <motion.button
                            type="button"
                            className={`flex items-center w-full border bg-white text-left ${showTimePicker ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'}`}
                            style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta, gap: GRID.spacing.xs }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { setShowTimePicker((v) => !v); setShowCheckinDatePicker(false); }}
                          >
                            <Clock className={checkinFormTime ? 'text-emerald-500' : 'text-gray-300'} size={LAYOUT.icon.xs} />
                            <span className={checkinFormTime ? 'text-gray-900 font-medium flex-1' : 'text-gray-400 flex-1'}>{checkinFormTime || 'Select time'}</span>
                            <motion.div animate={{ rotate: showTimePicker ? 180 : 0 }} transition={{ duration: MOTION.duration.fast }}>
                              <ChevronDown className="text-gray-400" size={LAYOUT.icon.xs} />
                            </motion.div>
                          </motion.button>

                          {/* Dropdown panel */}
                          <AnimatePresence>
                            {showTimePicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: MOTION.duration.fast }}
                                className="absolute left-0 right-0 z-10 bg-white border border-gray-200 overflow-hidden"
                                style={{
                                  top: '100%',
                                  marginTop: GRID.spacing.xs / 2,
                                  borderRadius: RADIUS.button,
                                  boxShadow: SHADOW.card,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                }}
                              >
                                <div style={{ padding: GRID.spacing.xs / 2 }}>
                                  {TIME_SLOTS.map((slot) => (
                                    <motion.button
                                      key={slot}
                                      type="button"
                                      className={`flex items-center w-full text-left ${
                                        checkinFormTime === slot
                                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      style={{
                                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                        borderRadius: RADIUS.input,
                                        fontSize: TYPE.meta,
                                        gap: GRID.spacing.xs,
                                      }}
                                      whileHover={{ backgroundColor: checkinFormTime === slot ? undefined : COLORS.gray[50] }}
                                      onClick={() => { setCheckinFormTime(slot); setShowTimePicker(false); }}
                                    >
                                      <Clock className={checkinFormTime === slot ? 'text-emerald-500' : 'text-gray-300'} size={LAYOUT.icon.xs} />
                                      {slot}
                                      {checkinFormTime === slot && <CheckCircle2 className="text-emerald-500 ml-auto" size={LAYOUT.icon.xs} />}
                                    </motion.button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Notes (optional)</label>
                        <textarea
                          value={checkinFormNotes}
                          onChange={(e) => setCheckinFormNotes(e.target.value)}
                          placeholder="Topics to discuss, concerns, goals..."
                          rows={3}
                          className="w-full border border-gray-200 text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none placeholder:text-gray-300"
                          style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 flex items-center justify-end flex-shrink-0" style={{ padding: GRID.spacing.md, gap: GRID.spacing.xs }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-medium text-gray-500 border border-gray-200 bg-white"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        onClick={closeModal}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                        disabled={!checkinFormAgent || !checkinFormDate || !checkinFormTime}
                        onClick={() => {
                          toast.success(`Check-in scheduled with ${checkinFormAgent} on ${checkinFormDate} at ${checkinFormTime}`);
                          closeModal();
                        }}
                      >
                        Schedule Check-in
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

export default ManagerOnboardingTracker;
