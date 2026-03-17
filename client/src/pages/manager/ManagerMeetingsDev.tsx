/**
 * Manager Coaching Page
 * Consolidated view merging 1:1 Meetings, Coaching, Team Meetings,
 * and Learning & Logs into a single 4-tab layout.
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  glassCard,
  DEMO_COACHING_SESSIONS,
  DEMO_LEARNING_PATHS,
  DEMO_SKILL_GAPS,
  DEMO_ONE_ON_ONES,
  DEMO_ACTION_ITEMS,
  ONE_ON_ONE_TEMPLATES,
  DEMO_MEETINGS,
  DEMO_TEAM_MEMBERS,
  PRIORITY_COLORS,
  MANAGER_ICON_GRADIENT,
} from './managerConstants';
import { ScheduleOneOnOneModal } from './ScheduleOneOnOneModal';
import { ScheduleCoachingModal } from './ScheduleCoachingModal';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  fadeInUp,
  staggerCards,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CalendarCheck,
  Calendar,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  TrendingUp,
  Clock,
  FileText,
  BookOpen,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Flag,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  CheckCircle2,
  Circle,
  UserCheck,
  Users,
  Plus,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

/* ── Demo Development Goals (from Coaching) ───────────────── */
const DEMO_GOALS = [
  { agent: 'Sarah Johnson', avatar: 'SJ', goal: 'Improve close rate to 30%', progress: 78, due: 'Mar 15' },
  { agent: 'Carlos Martinez', avatar: 'CM', goal: 'Complete IUL certification', progress: 45, due: 'Mar 22' },
  { agent: 'Anna Kim', avatar: 'AK', goal: 'Build referral pipeline', progress: 30, due: 'Apr 1' },
  { agent: 'Lisa Park', avatar: 'LP', goal: 'Master objection handling', progress: 62, due: 'Mar 28' },
];

/* ── Demo Coaching Notes (from Coaching) ──────────────────── */
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

/* ── Demo Recent History (from OneOnOnes) ─────────────────── */
const RECENT_HISTORY = [
  { agent: 'Sarah Johnson', avatar: 'SJ', date: 'Feb 28', completionRate: '4/4 items done' },
  { agent: 'Mike Chen', avatar: 'MC', date: 'Feb 27', completionRate: '3/4 items done' },
  { agent: 'Emily Davis', avatar: 'ED', date: 'Feb 26', completionRate: '2/3 items done' },
  { agent: 'David Brown', avatar: 'DB', date: 'Feb 25', completionRate: '3/3 items done' },
];

/* ── Meeting type badge colors (from OneOnOnes) ───────────── */
const MEETING_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  recurring: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  training: { bg: 'bg-violet-100', text: 'text-violet-700' },
};

/* ── Demo Past Meetings (from OneOnOnes) ──────────────────── */
const DEMO_PAST_MEETINGS = [
  {
    title: 'Weekly Team Standup',
    date: 'Feb 27, 2026',
    takeaways: [
      'Sarah J. closed 2 new whole life policies this week',
      'Pipeline value up 12% — focus on qualified leads',
      'New CRM update rolling out next Monday',
    ],
    actionItems: ['Follow up on Carlos training gap', 'Review Q1 quotas by Friday'],
  },
  {
    title: 'Pipeline Review',
    date: 'Feb 25, 2026',
    takeaways: [
      'Stage 3 (Qualified) has 12 leads worth $234K',
      'Conversion from Contacted to Qualified needs improvement',
      'Lisa P. needs help with 3 stalled prospects',
    ],
    actionItems: ['Reassign 2 stalled leads to Mike C.', 'Schedule prospect re-engagement calls'],
  },
  {
    title: 'Product Training: Term Life Updates',
    date: 'Feb 20, 2026',
    takeaways: [
      'New rate tables effective March 1',
      'Simplified underwriting for policies under $500K',
    ],
    actionItems: ['Distribute updated rate cards to all agents'],
  },
];

/* ── Outcome Badge Config (from Coaching Logs) ────────────── */
const OUTCOME_CONFIG = {
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  'follow-up': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Follow-up' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
} as const;

/* ── Coaching Logs Interfaces & Data ──────────────────────── */
interface FollowUpItem {
  text: string;
  done: boolean;
}

interface CoachingLog {
  id: string;
  date: string;
  agentName: string;
  agentAvatar: string;
  topic: string;
  duration: number;
  outcome: 'completed' | 'follow-up' | 'scheduled';
  notes: string;
  followUps: FollowUpItem[];
}

const COACHING_LOGS: CoachingLog[] = [
  {
    id: '1',
    date: '2026-02-28',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    topic: 'Objection Handling Techniques',
    duration: 45,
    outcome: 'completed',
    notes: 'Reviewed common price objections. Sarah demonstrated strong reframing techniques. Practiced the "value stack" method with role-play scenarios. She closed 3 deals this week using the new approach.',
    followUps: [
      { text: 'Practice value stack with 5 prospects', done: true },
      { text: 'Review recorded calls for improvement areas', done: true },
    ],
  },
  {
    id: '2',
    date: '2026-02-26',
    agentName: 'Mike Chen',
    agentAvatar: 'MC',
    topic: 'Pipeline Management',
    duration: 30,
    outcome: 'follow-up',
    notes: 'Identified 4 stale deals in pipeline over 30 days. Created action plan to either advance or close them. Mike needs to follow up with Thompson Corp by Friday.',
    followUps: [
      { text: 'Contact Thompson Corp re: proposal', done: false },
      { text: 'Update deal stages for 3 stale leads', done: true },
    ],
  },
  {
    id: '3',
    date: '2026-02-24',
    agentName: 'Emily Davis',
    agentAvatar: 'ED',
    topic: 'Certification Prep',
    duration: 25,
    outcome: 'follow-up',
    notes: "Emily's Advanced Life cert expires in 2 weeks. Reviewed study materials and created a prep schedule. She needs to complete practice exam by next Monday.",
    followUps: [
      { text: 'Complete practice exam', done: false },
      { text: 'Schedule certification test', done: false },
    ],
  },
  {
    id: '4',
    date: '2026-02-21',
    agentName: 'James Wilson',
    agentAvatar: 'JW',
    topic: 'Closing Techniques',
    duration: 40,
    outcome: 'completed',
    notes: 'Focused on assumptive close and urgency techniques. James showed improvement in transitioning from presentation to close. Need to monitor his close rate over the next 2 weeks.',
    followUps: [
      { text: 'Track close rate for 2 weeks', done: true },
    ],
  },
  {
    id: '5',
    date: '2026-02-19',
    agentName: 'Lisa Park',
    agentAvatar: 'LP',
    topic: 'New Agent Onboarding Review',
    duration: 35,
    outcome: 'completed',
    notes: "Lisa completed week 4 of onboarding. She's progressing well with product knowledge. Assigned her 5 warm leads to practice with. Discussed call structure and follow-up cadence.",
    followUps: [
      { text: 'Contact 5 assigned warm leads', done: true },
      { text: 'Submit call recordings for review', done: true },
    ],
  },
  {
    id: '6',
    date: '2026-02-14',
    agentName: 'Sarah Johnson',
    agentAvatar: 'SJ',
    topic: 'Q1 Goal Setting',
    duration: 50,
    outcome: 'completed',
    notes: 'Set Q1 target at $95K AP. Sarah is on track for Level 7 promotion. Discussed strategies for high-value clients and cross-selling opportunities. She will focus on the corporate segment this quarter.',
    followUps: [
      { text: 'Identify 10 corporate prospects', done: true },
      { text: 'Create cross-sell pitch deck', done: false },
    ],
  },
  {
    id: '7',
    date: '2026-02-12',
    agentName: 'Carlos Martinez',
    agentAvatar: 'CM',
    topic: 'Performance Improvement Plan',
    duration: 55,
    outcome: 'follow-up',
    notes: 'Carlos has been underperforming for 3 weeks. Created a 30-day PIP with specific milestones: 20 calls/day, 3 deals/week minimum. Will check in weekly.',
    followUps: [
      { text: 'Weekly check-in (Week 1)', done: true },
      { text: 'Weekly check-in (Week 2)', done: false },
      { text: 'Review PIP progress at 30 days', done: false },
    ],
  },
];

/* ── Date Formatter (for Logs) ────────────────────────────── */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Unique Agent Names for Log filter ────────────────────── */
const AGENT_NAMES = Array.from(
  new Set(COACHING_LOGS.map((log) => log.agentName))
).sort();

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function ManagerMeetingsDev() {
  /* ── Modal state ────────────────────────────────────────── */
  const [showOneOnOneModal, setShowOneOnOneModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  /* ── Meeting form state ────────────────────────────────── */
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [meetingType, setMeetingType] = useState<'standup' | 'review' | 'training'>('standup');

  /* ── Override toggle state ─────────────────────────────── */
  const [overrides, setOverrides] = useState<Set<number>>(new Set([1]));

  /* ── 1:1 Meetings state ───────────────────────────────── */
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  /* ── Coaching state ───────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('');
  /* ── Learning & Logs state ────────────────────────────── */
  const [logSearch, setLogSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  /* ── Toggles ──────────────────────────────────────────── */
  const toggleMeeting = (id: string) => {
    setExpandedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLogExpand = (id: string) => {
    setExpandedLog((prev) => (prev === id ? null : id));
  };

  /* ── Derived data ─────────────────────────────────────── */
  const overdueItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'overdue');
  const dueThisWeekItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'due_this_week');
  const upcomingItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'upcoming');
  const openActionItems = DEMO_ACTION_ITEMS.filter((i) => !checkedItems.has(i.id)).length;
  const upcomingMeetingsCount = DEMO_ONE_ON_ONES.length + DEMO_MEETINGS.length;
  const sessionsThisMonth = DEMO_ONE_ON_ONES.length + DEMO_COACHING_SESSIONS.length;
  const totalFollowUps = COACHING_LOGS.reduce((sum, log) => sum + log.followUps.length, 0);
  const completedFollowUps = COACHING_LOGS.reduce((sum, log) => sum + log.followUps.filter((f) => f.done).length, 0);
  const completionRate = totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 0;

  /* ── Coaching sessions filtered ───────────────────────── */
  const filteredSessions = useMemo(() => {
    return DEMO_COACHING_SESSIONS.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.agent.toLowerCase().includes(q) && !s.topic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery]);

  /* ── Coaching logs filtered ───────────────────────────── */
  const filteredLogs = useMemo(() => {
    return COACHING_LOGS.filter((log) => {
      if (selectedAgent !== 'all' && log.agentName !== selectedAgent) return false;
      if (logSearch.trim()) {
        const query = logSearch.toLowerCase();
        const matchesAgent = log.agentName.toLowerCase().includes(query);
        const matchesTopic = log.topic.toLowerCase().includes(query);
        const matchesNotes = log.notes.toLowerCase().includes(query);
        if (!matchesAgent && !matchesTopic && !matchesNotes) return false;
      }
      return true;
    });
  }, [logSearch, selectedAgent]);

  /* ── Trend arrow helper ───────────────────────────────── */
  const TrendArrow = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <ArrowUp style={{ width: 14, height: 14 }} className="text-emerald-600" />;
    if (trend === 'down') return <ArrowDown style={{ width: 14, height: 14 }} className="text-red-500" />;
    return <ArrowRight style={{ width: 14, height: 14 }} className="text-gray-400" />;
  };

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
          icon={CalendarCheck}
          title="Coaching"
          subtitle="Sessions, 1:1 meetings, and team growth"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Calendar} value={upcomingMeetingsCount} label="Upcoming Meetings" delta={2} periodLabel="This week" />
            <ManagerStatCard icon={CheckSquare} value={openActionItems} label="Open Action Items" delta={-3} periodLabel="vs last week" />
            <ManagerStatCard
              icon={GraduationCap}
              value={sessionsThisMonth}
              label="Sessions This Month"
              delta={3}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={`${completionRate}%`}
              label="Completion Rate"
              delta={8}
              deltaFormat="percent"
              periodLabel="vs last month"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="one_on_ones" className="w-full">
            <TabsList
              className="w-fit border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="one_on_ones"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <UserCheck style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                1:1 Meetings
              </TabsTrigger>
              <TabsTrigger
                value="coaching"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Coaching
              </TabsTrigger>
              <TabsTrigger
                value="team_meetings"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Team Meetings
              </TabsTrigger>
              <TabsTrigger
                value="learning_logs"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <BookOpen style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Learning & Logs
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════════
                TAB 1: 1:1 Meetings
                ════════════════════════════════════════════════ */}
            <TabsContent value="one_on_ones">
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md, marginTop: GRID.spacing.md }}>
                {/* Schedule 1:1 CTA */}
                <div className="flex justify-start">
                  <motion.button
                    className="flex items-center font-semibold text-white shadow-lg shadow-emerald-500/20 border-0"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowOneOnOneModal(true)}
                  >
                    <Calendar size={LAYOUT.icon.sm} />
                    Schedule 1:1
                  </motion.button>
                </div>

                {/* Golden Ratio Grid */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
                  style={{ gap: GRID.spacing.md }}
                >
                  {/* LEFT COLUMN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                    {/* Upcoming 1:1s */}
                    <Card
                      className="overflow-hidden"
                      style={{
                        ...glassCard,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                        <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                          >
                            <Calendar className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <span className="text-gray-900">Upcoming 1:1s</span>
                        </CardTitle>
                      </CardHeader>

                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {DEMO_ONE_ON_ONES.map((meeting) => {
                            const isExpanded = expandedMeetings.has(meeting.id);
                            return (
                              <div key={meeting.id}>
                                <motion.div
                                  className="flex items-center"
                                  style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, gap: GRID.spacing.sm }}
                                  whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                                >
                                  {/* Avatar */}
                                  <div
                                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                                  >
                                    {meeting.avatar}
                                  </div>
                                  {/* Agent name + date/time */}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{meeting.agent}</p>
                                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{meeting.date} at {meeting.time}</p>
                                  </div>
                                  {/* Badges */}
                                  <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
                                    <span className="inline-flex items-center font-medium bg-emerald-100 text-emerald-700" style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.caption, gap: 4 }}>
                                      <FileText style={{ width: 12, height: 12 }} />
                                      {meeting.agendaItems}
                                    </span>
                                    <span className="inline-flex items-center font-medium bg-blue-100 text-blue-700" style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.caption, gap: 4 }}>
                                      <ClipboardList style={{ width: 12, height: 12 }} />
                                      {meeting.actionItems}
                                    </span>
                                    {meeting.carryForward > 0 && (
                                      <span className="inline-flex items-center font-medium bg-amber-100 text-amber-700" style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.caption }}>
                                        {meeting.carryForward} carry-forward
                                      </span>
                                    )}
                                    <motion.button
                                      onClick={() => toggleMeeting(meeting.id)}
                                      className="flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                                      style={{ fontSize: TYPE.caption, padding: `4px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button, gap: 4 }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      {isExpanded ? (
                                        <><ChevronUp style={{ width: 14, height: 14 }} />Close</>
                                      ) : (
                                        <><ChevronDown style={{ width: 14, height: 14 }} />Open Briefing</>
                                      )}
                                    </motion.button>
                                  </div>
                                </motion.div>

                                {/* Expanded Briefing Panel */}
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
                                          margin: `0 12px ${GRID.spacing.xs}px 12px`,
                                          padding: GRID.spacing.sm,
                                          borderRadius: RADIUS.button,
                                          backgroundColor: 'rgba(236, 253, 245, 0.6)',
                                          border: '1px solid rgba(16, 185, 129, 0.15)',
                                        }}
                                      >
                                        {/* KPI Summary */}
                                        <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>KPI Summary</p>
                                        <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                                          {meeting.briefing.kpis.map((kpi, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center bg-white"
                                              style={{ borderRadius: RADIUS.pill, padding: `4px ${GRID.spacing.sm}px`, gap: GRID.spacing.xs, border: '1px solid rgba(0,0,0,0.06)' }}
                                            >
                                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{kpi.label}</span>
                                              <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{kpi.value}</span>
                                              <TrendArrow trend={kpi.trend} />
                                            </div>
                                          ))}
                                        </div>

                                        {/* Recent Activity */}
                                        <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Recent Activity</p>
                                        <ul style={{ marginBottom: GRID.spacing.sm, paddingLeft: GRID.spacing.sm }}>
                                          {meeting.briefing.recentActivity.map((activity, idx) => (
                                            <li key={idx} className="text-gray-600" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>{activity}</li>
                                          ))}
                                        </ul>

                                        {/* Risk Flags */}
                                        {meeting.briefing.riskFlags.length > 0 && (
                                          <>
                                            <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Risk Flags</p>
                                            <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                                              {meeting.briefing.riskFlags.map((flag, idx) => (
                                                <span
                                                  key={idx}
                                                  className="inline-flex items-center font-medium"
                                                  style={{
                                                    borderRadius: RADIUS.pill,
                                                    padding: `3px ${GRID.spacing.xs}px`,
                                                    fontSize: TYPE.caption,
                                                    gap: 4,
                                                    backgroundColor: flag.toLowerCase().includes('overdue') || flag.toLowerCase().includes('active')
                                                      ? 'rgba(254, 202, 202, 0.4)' : 'rgba(252, 211, 77, 0.3)',
                                                    color: flag.toLowerCase().includes('overdue') || flag.toLowerCase().includes('active')
                                                      ? '#b91c1c' : '#92400e',
                                                  }}
                                                >
                                                  <AlertTriangle style={{ width: 12, height: 12 }} />
                                                  {flag}
                                                </span>
                                              ))}
                                            </div>
                                          </>
                                        )}

                                        {/* Carried-Forward Items */}
                                        {meeting.briefing.carryForwardItems.length > 0 && (
                                          <>
                                            <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>Carried-Forward Items</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                              {meeting.briefing.carryForwardItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center text-gray-600" style={{ gap: GRID.spacing.xs, fontSize: TYPE.caption }}>
                                                  <ArrowRight style={{ width: 14, height: 14 }} className="text-amber-500 flex-shrink-0" />
                                                  {item}
                                                </div>
                                              ))}
                                            </div>
                                          </>
                                        )}
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

                    {/* Recent 1:1 History */}
                    <Card
                      className="overflow-hidden"
                      style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                        <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                          >
                            <Clock className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <span className="text-gray-900">Recent 1:1 History</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {RECENT_HISTORY.map((entry, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center"
                              style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, gap: GRID.spacing.sm }}
                              whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                            >
                              <div
                                className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                              >
                                {entry.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{entry.agent}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{entry.date}</p>
                              </div>
                              <span className="inline-flex items-center font-medium bg-emerald-100 text-emerald-700" style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.caption }}>
                                {entry.completionRate}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                    {/* Action Items Tracker */}
                    <Card
                      className="overflow-hidden"
                      style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                        <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                          >
                            <ClipboardList className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <span className="text-gray-900">Action Items Tracker</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                          {/* Overdue */}
                          {overdueItems.length > 0 && (
                            <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: GRID.spacing.sm }}>
                              <p className="font-semibold text-red-600" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                Overdue ({overdueItems.length})
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                                {overdueItems.map((item) => (
                                  <ActionItemRow key={item.id} item={item} checked={checkedItems.has(item.id)} onToggle={() => toggleChecked(item.id)} />
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Due This Week */}
                          {dueThisWeekItems.length > 0 && (
                            <div>
                              <p className="font-semibold text-amber-600" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                Due This Week ({dueThisWeekItems.length})
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                                {dueThisWeekItems.map((item) => (
                                  <ActionItemRow key={item.id} item={item} checked={checkedItems.has(item.id)} onToggle={() => toggleChecked(item.id)} />
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Upcoming */}
                          {upcomingItems.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-500" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                Upcoming ({upcomingItems.length})
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                                {upcomingItems.map((item) => (
                                  <ActionItemRow key={item.id} item={item} checked={checkedItems.has(item.id)} onToggle={() => toggleChecked(item.id)} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Agenda Templates */}
                    <Card
                      className="overflow-hidden"
                      style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                        <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                          >
                            <FileText className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>
                          <span className="text-gray-900">Agenda Templates</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                          {ONE_ON_ONE_TEMPLATES.map((template) => (
                            <motion.div
                              key={template.id}
                              style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50], border: `1px solid ${COLORS.gray[100]}` }}
                              whileHover={{ backgroundColor: COLORS.gray[100], transition: { duration: MOTION.duration.hover } }}
                            >
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta, marginBottom: 4 }}>{template.name}</p>
                              <p className="text-gray-500" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>{template.description}</p>
                              <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs }}>
                                {template.items.map((agendaItem, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center bg-emerald-50 text-emerald-700 font-medium"
                                    style={{ borderRadius: RADIUS.pill, padding: `2px ${GRID.spacing.xs}px`, fontSize: TYPE.caption }}
                                  >
                                    {agendaItem}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════
                TAB 2: Coaching
                ════════════════════════════════════════════════ */}
            <TabsContent value="coaching">
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md, marginTop: GRID.spacing.md }}>
                {/* Schedule Coaching CTA + Search/Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between" style={{ gap: GRID.spacing.sm }}>
                  <div
                    className="flex items-center flex-1"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.input,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      gap: GRID.spacing.xs,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    <Search className="text-gray-400 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      style={{ fontSize: TYPE.meta, border: 'none' }}
                    />
                  </div>
                  <motion.button
                    className="flex items-center font-semibold text-white shadow-lg shadow-emerald-500/20 border-0"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCoachingModal(true)}
                  >
                    <GraduationCap size={LAYOUT.icon.sm} />
                    Schedule Coaching
                  </motion.button>
                </div>

                {/* Two-Column: Sessions + Goals */}
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: GRID.spacing.md }}>
                  {/* Left: Upcoming Coaching Sessions */}
                  <Card
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <Clock className="text-amber-200" size={LAYOUT.icon.md} />
                        </div>
                        <span className="text-gray-900">Upcoming Sessions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {filteredSessions.map((session) => (
                          <motion.div
                            key={session.id}
                            className="flex items-center"
                            style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, gap: GRID.spacing.sm }}
                            whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                          >
                            <div className="flex-shrink-0 text-center" style={{ minWidth: 56 }}>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{session.date}</p>
                              <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{session.time}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{session.agent}</p>
                              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{session.topic}</p>
                            </div>
                            <span
                              className={`inline-flex items-center font-medium ${
                                session.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}
                              style={{ borderRadius: RADIUS.pill, border: 0, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, fontSize: TYPE.micro }}
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
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <Target className="text-amber-200" size={LAYOUT.icon.md} />
                        </div>
                        <span className="text-gray-900">Development Goals</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                        {DEMO_GOALS.map((g, idx) => (
                          <motion.div
                            key={idx}
                            style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                            whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                          >
                            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                              <div>
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{g.agent}</p>
                                <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{g.goal}</p>
                              </div>
                              <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>Due {g.due}</span>
                            </div>
                            <div className="w-full bg-gray-100 overflow-hidden" style={{ height: 6, borderRadius: RADIUS.pill }}>
                              <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${g.progress}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + idx * 0.1 }}
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>
                            <p className="text-right text-emerald-600 font-semibold" style={{ marginTop: GRID.spacing.xs / 2, fontSize: TYPE.caption }}>{g.progress}%</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Coaching Notes (full width) */}
                <Card
                  className="overflow-hidden"
                  style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                      >
                        <FileText className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Recent Coaching Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                      {DEMO_NOTES.map((n, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-start"
                          style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, gap: GRID.spacing.sm }}
                          whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                        >
                          <div
                            className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex-shrink-0"
                            style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.caption }}
                          >
                            {n.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs / 2 }}>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{n.agent}</p>
                              <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>{n.date}</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed" style={{ fontSize: TYPE.meta }}>{n.note}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════
                TAB 3: Team Meetings
                ════════════════════════════════════════════════ */}
            <TabsContent value="team_meetings">
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md, marginTop: GRID.spacing.md }}>
                {/* Schedule Meeting Button */}
                <div className="flex justify-start">
                  <motion.button
                    className="flex items-center font-semibold text-white shadow-lg shadow-emerald-500/20 border-0"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMeetingModal(true)}
                  >
                    <Plus size={LAYOUT.icon.sm} />
                    Schedule Meeting
                  </motion.button>
                </div>

                {/* Two-Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: GRID.spacing.md }}>
                  {/* Left: Upcoming Meetings */}
                  <Card
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <CalendarDays className="text-amber-200" size={LAYOUT.icon.md} />
                        </div>
                        <span className="text-gray-900">Upcoming Meetings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {DEMO_MEETINGS.map((meeting) => {
                          const typeColor = MEETING_TYPE_COLORS[meeting.type] || MEETING_TYPE_COLORS.scheduled;
                          return (
                            <motion.div
                              key={meeting.id}
                              className="flex items-center"
                              style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, gap: GRID.spacing.sm }}
                              whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                            >
                              <div className="flex-shrink-0 text-center" style={{ minWidth: 56 }}>
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{meeting.date}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{meeting.time}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{meeting.title}</p>
                                <div className="flex items-center text-gray-500" style={{ fontSize: TYPE.caption, gap: GRID.spacing.xs / 2 }}>
                                  <Users size={LAYOUT.icon.xs} />
                                  <span>{meeting.attendees} attendees</span>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center font-medium ${typeColor.bg} ${typeColor.text}`}
                                style={{ borderRadius: RADIUS.pill, border: 0, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, fontSize: TYPE.caption }}
                              >
                                {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Past Meeting Notes */}
                  <Card
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <FileText className="text-amber-200" size={LAYOUT.icon.md} />
                        </div>
                        <span className="text-gray-900">Meeting Notes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                        {DEMO_PAST_MEETINGS.map((pm, idx) => (
                          <motion.div
                            key={idx}
                            style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                            whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                          >
                            <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{pm.title}</p>
                              <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>{pm.date}</span>
                            </div>
                            <ul style={{ paddingLeft: 12, marginBottom: GRID.spacing.xs }}>
                              {pm.takeaways.map((t, ti) => (
                                <li key={ti} className="text-gray-600" style={{ fontSize: TYPE.caption, lineHeight: 1.6 }}>{t}</li>
                              ))}
                            </ul>
                            <div style={{ marginTop: GRID.spacing.xs }}>
                              {pm.actionItems.map((ai, aidx) => (
                                <div
                                  key={aidx}
                                  className="flex items-center text-gray-500"
                                  style={{ fontSize: TYPE.caption, gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs / 2 }}
                                >
                                  <div
                                    className="border-2 border-emerald-400 flex-shrink-0"
                                    style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs, borderRadius: 3 }}
                                  />
                                  <span>{ai}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════
                TAB 4: Learning & Logs
                ════════════════════════════════════════════════ */}
            <TabsContent value="learning_logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md, marginTop: GRID.spacing.md }}>
                {/* Learning Paths + Skill Gaps */}
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: GRID.spacing.md }}>
                  {/* Left: Learning Paths */}
                  <Card
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <BookOpen className="text-amber-200" size={LAYOUT.icon.md} />
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
                                padding: GRID.spacing.sm,
                                borderRadius: RADIUS.button,
                                backgroundColor: COLORS.gray[50],
                                border: `1px solid ${COLORS.gray[100]}`,
                              }}
                              whileHover={{ backgroundColor: COLORS.gray[100], transition: { duration: MOTION.duration.hover } }}
                            >
                              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{path.name}</p>
                                <span
                                  className={`inline-flex items-center font-medium ${priorityColor.bg} ${priorityColor.text}`}
                                  style={{ borderRadius: RADIUS.pill, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, fontSize: TYPE.micro, gap: 4 }}
                                >
                                  <Flag size={LAYOUT.icon.xs} />
                                  {path.priority}
                                </span>
                              </div>
                              <p className="text-gray-500" style={{ marginBottom: GRID.spacing.xs, fontSize: TYPE.caption }}>{path.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                  {path.modules} modules · {path.estimatedHours}h
                                </span>
                                <div className="flex items-center" style={{ gap: 4 }}>
                                  <Users className="text-gray-400" size={LAYOUT.icon.xs} />
                                  <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{assignedNames.join(', ')}</span>
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
                    className="overflow-hidden h-full"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <div
                          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                        >
                          <AlertTriangle className="text-amber-200" size={LAYOUT.icon.md} />
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
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              backgroundColor: gap.assessmentScore < 60 ? 'rgba(254,202,202,0.15)' : COLORS.gray[50],
                              border: `1px solid ${gap.assessmentScore < 60 ? 'rgba(254,202,202,0.4)' : COLORS.gray[100]}`,
                            }}
                            whileHover={{ backgroundColor: COLORS.gray[100], transition: { duration: MOTION.duration.hover } }}
                          >
                            <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.xs }}>
                              <div
                                className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                                style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                              >
                                {gap.avatar}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{gap.agent}</p>
                              </div>
                              <span
                                className={`font-semibold ${
                                  gap.assessmentScore < 60 ? 'text-red-600' : gap.assessmentScore < 75 ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                                style={{ fontSize: TYPE.meta }}
                              >
                                {gap.assessmentScore}%
                              </span>
                            </div>
                            <div style={{ marginBottom: GRID.spacing.xs }}>
                              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Weak area: {gap.weakArea}</span>
                              </div>
                              <Progress value={gap.assessmentScore} className="h-1.5" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center" style={{ gap: 4 }}>
                                <Zap className="text-amber-500" size={LAYOUT.icon.xs} />
                                <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Recommended: {gap.recommendedPath}</span>
                              </div>
                              <motion.button
                                className="font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                                style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toast.success(`Assigning "${gap.recommendedPath}" to ${gap.agent}`)}
                              >
                                Assign
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Prerequisite Overrides (gradient banner) */}
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <div className="absolute top-0 right-0 bg-white/10 blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }} />
                  <div className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl" style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)', borderRadius: RADIUS.pill }} />
                  <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                      <div
                        className="flex items-center justify-center"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
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
                        { agent: 'Carlos Martinez', avatar: 'CM', module: 'Advanced IUL Illustrations', prerequisite: 'IUL Basics' },
                        { agent: 'Anna Kim', avatar: 'AK', module: 'Client Retention Strategies', prerequisite: 'Sales Basics' },
                        { agent: 'Ryan Taylor', avatar: 'RT', module: 'Closing Mastery', prerequisite: 'Objection Handling' },
                      ].map((item, idx) => {
                        const isUnlocked = overrides.has(idx);
                        return (
                          <div
                            key={idx}
                            className="flex items-center"
                            style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}
                          >
                            <div
                              className="flex items-center justify-center text-white font-bold flex-shrink-0"
                              style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', fontSize: TYPE.micro }}
                            >
                              {item.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>{item.agent}</p>
                              <p className="text-white/60" style={{ fontSize: TYPE.caption }}>
                                {item.module} <span className="text-white/40">← needs {item.prerequisite}</span>
                              </p>
                            </div>
                            <motion.button
                              className={`flex items-center font-medium border-0 ${isUnlocked ? 'text-amber-200' : 'text-white/80'}`}
                              style={{
                                fontSize: TYPE.micro,
                                gap: 4,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.button,
                                background: isUnlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setOverrides((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(idx)) {
                                    next.delete(idx);
                                    toast.success(`Locked "${item.module}" for ${item.agent}`);
                                  } else {
                                    next.add(idx);
                                    toast.success(`Unlocked "${item.module}" for ${item.agent}`);
                                  }
                                  return next;
                                });
                              }}
                            >
                              {isUnlocked ? (
                                <><Unlock size={LAYOUT.icon.xs} /> Unlocked</>
                              ) : (
                                <><Lock size={LAYOUT.icon.xs} /> Override</>
                              )}
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Coaching Log — Search + Filter */}
                <div className="flex flex-col sm:flex-row" style={{ gap: GRID.spacing.sm }}>
                  <div
                    className="flex items-center flex-1"
                    style={{ ...glassCard, borderRadius: RADIUS.input, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, gap: GRID.spacing.xs, boxShadow: SHADOW.level1 }}
                  >
                    <Search className="text-gray-400 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    <input
                      type="text"
                      placeholder="Search by agent, topic, or notes..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      style={{ fontSize: TYPE.meta, border: 'none' }}
                    />
                  </div>
                  <div
                    className="flex items-center relative"
                    style={{ ...glassCard, borderRadius: RADIUS.input, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, gap: GRID.spacing.xs, boxShadow: SHADOW.level1, minWidth: 200 }}
                  >
                    <UserCheck className="text-gray-400 flex-shrink-0" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 appearance-none cursor-pointer"
                      style={{ fontSize: TYPE.meta, border: 'none', paddingRight: GRID.spacing.md }}
                    >
                      <option value="all">All Agents</option>
                      {AGENT_NAMES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown
                      className="text-gray-400 flex-shrink-0 pointer-events-none absolute"
                      style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs, right: GRID.spacing.sm }}
                    />
                  </div>
                </div>

                {/* Coaching Log List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {filteredLogs.length === 0 && (
                    <div
                      className="text-center"
                      style={{ ...glassCard, borderRadius: RADIUS.card, padding: GRID.spacing.xl, boxShadow: SHADOW.card }}
                    >
                      <ClipboardList className="mx-auto text-gray-300" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, marginBottom: GRID.spacing.sm }} />
                      <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.body }}>No coaching logs match your search</p>
                      <p className="text-gray-400" style={{ fontSize: TYPE.meta, marginTop: GRID.spacing.xs }}>Try adjusting your filters or search terms</p>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => {
                      const isLogExpanded = expandedLog === log.id;
                      const outcomeConfig = OUTCOME_CONFIG[log.outcome];
                      const completedFollowUps = log.followUps.filter((f) => f.done).length;
                      const totalFollowUps = log.followUps.length;

                      return (
                        <motion.div
                          key={log.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                          style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}
                        >
                          {/* Collapsed Row */}
                          <motion.div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleLogExpand(log.id)}
                            style={{ padding: GRID.spacing.md, gap: GRID.spacing.sm }}
                            whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                          >
                            <div className="flex-shrink-0 text-center hidden sm:block" style={{ minWidth: 72 }}>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{formatDate(log.date).split(',')[0]}</p>
                              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{formatDate(log.date).split(',')[1]?.trim()}</p>
                            </div>
                            <div
                              className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                              style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.caption, boxShadow: SHADOW.glow.emerald }}
                            >
                              {log.agentAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{log.agentName}</p>
                              <p className="font-bold text-gray-800 truncate" style={{ fontSize: TYPE.body - 2 }}>{log.topic}</p>
                              <p className="text-gray-400 sm:hidden" style={{ fontSize: TYPE.micro }}>{formatDate(log.date)}</p>
                            </div>
                            <div className="flex items-center text-gray-500 flex-shrink-0 hidden md:flex" style={{ gap: GRID.spacing.xs / 2, fontSize: TYPE.meta }}>
                              <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                              <span>{log.duration} min</span>
                            </div>
                            <span
                              className={`inline-flex items-center font-medium flex-shrink-0 ${outcomeConfig.bg} ${outcomeConfig.text}`}
                              style={{ borderRadius: RADIUS.pill, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`, fontSize: TYPE.micro }}
                            >
                              {outcomeConfig.label}
                            </span>
                            <motion.div
                              animate={{ rotate: isLogExpanded ? 180 : 0 }}
                              transition={{ duration: MOTION.duration.fast }}
                              className="flex-shrink-0 text-gray-400"
                            >
                              <ChevronDown style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                            </motion.div>
                          </motion.div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isLogExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div
                                  style={{
                                    padding: `0 ${GRID.spacing.md}px ${GRID.spacing.md}px`,
                                    borderTop: '1px solid rgba(0,0,0,0.06)',
                                    paddingTop: GRID.spacing.md,
                                  }}
                                >
                                  {/* Duration on mobile */}
                                  <div
                                    className="flex items-center text-gray-500 md:hidden"
                                    style={{ gap: GRID.spacing.xs / 2, fontSize: TYPE.meta, marginBottom: GRID.spacing.sm }}
                                  >
                                    <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                                    <span>{log.duration} min session</span>
                                  </div>

                                  {/* Notes */}
                                  <div style={{ marginBottom: GRID.spacing.md }}>
                                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                                      <FileText className="text-emerald-600" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Session Notes</p>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed" style={{ fontSize: TYPE.meta, lineHeight: 1.7, paddingLeft: GRID.spacing.md }}>
                                      {log.notes}
                                    </p>
                                  </div>

                                  {/* Follow-ups */}
                                  <div style={{ marginBottom: GRID.spacing.md }}>
                                    <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                        <CheckCircle className="text-emerald-600" style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Follow-up Items</p>
                                      </div>
                                      <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.micro }}>
                                        {completedFollowUps}/{totalFollowUps} completed
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs, paddingLeft: GRID.spacing.md }}>
                                      {log.followUps.map((followUp, fidx) => (
                                        <div key={fidx} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                          <div
                                            className="flex items-center justify-center flex-shrink-0"
                                            style={{
                                              width: LAYOUT.icon.md,
                                              height: LAYOUT.icon.md,
                                              borderRadius: RADIUS.input / 3,
                                              border: followUp.done ? 'none' : `2px solid ${COLORS.gray[300]}`,
                                              backgroundColor: followUp.done ? COLORS.semantic.success : 'transparent',
                                            }}
                                          >
                                            {followUp.done && <CheckCircle className="text-white" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />}
                                          </div>
                                          <span className={followUp.done ? 'text-gray-400 line-through' : 'text-gray-700'} style={{ fontSize: TYPE.meta }}>
                                            {followUp.text}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Agent scorecard link */}
                                  <motion.a
                                    href="/manager/scorecard"
                                    className="inline-flex items-center font-medium text-emerald-700 hover:text-emerald-800"
                                    style={{
                                      fontSize: TYPE.meta,
                                      gap: GRID.spacing.xs,
                                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                                      borderRadius: RADIUS.button,
                                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <UserCheck style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                                    View {log.agentName.split(' ')[0]}'s Scorecard
                                  </motion.a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* ── Modals ──────────────────────────────────────────── */}
      <ScheduleOneOnOneModal
        agent={{ name: 'Team Member', avatar: 'TM', role: 'Agent' }}
        open={showOneOnOneModal}
        onClose={() => setShowOneOnOneModal(false)}
      />
      <ScheduleCoachingModal
        agent={{ name: 'Team Member', avatar: 'TM', role: 'Agent' }}
        open={showCoachingModal}
        onClose={() => setShowCoachingModal(false)}
      />

      {/* ── Schedule Meeting Modal ─────────────────────────── */}
      <AnimatePresence>
        {showMeetingModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.fast }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMeetingModal(false)}
            />
            <motion.div
              className="relative w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
              style={{
                ...glassCard,
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.hero,
                padding: GRID.spacing.md,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 36, height: 36, borderRadius: RADIUS.button }}
                  >
                    <CalendarDays className="text-amber-200" size={LAYOUT.icon.sm} />
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Schedule Meeting</p>
                </div>
                <motion.button
                  className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-1"
                  onClick={() => setShowMeetingModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={LAYOUT.icon.md} style={{ transform: 'rotate(45deg)' }} />
                </motion.button>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {/* Title */}
                <div>
                  <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Meeting Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Team Standup"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30"
                    style={{ fontSize: TYPE.meta, border: `1px solid ${COLORS.gray[200]}`, borderRadius: RADIUS.input, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}
                  />
                </div>

                {/* Type pills */}
                <div>
                  <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Type</label>
                  <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                    {([
                      { value: 'standup' as const, label: 'Standup' },
                      { value: 'review' as const, label: 'Review' },
                      { value: 'training' as const, label: 'Training' },
                    ]).map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setMeetingType(t.value)}
                        className={`font-medium border-0 transition-all ${meetingType === t.value ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                        style={{ borderRadius: RADIUS.button, padding: '4px 12px', fontSize: TYPE.meta, cursor: 'pointer', fontWeight: meetingType === t.value ? 600 : 500 }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                  <div>
                    <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30"
                      style={{ fontSize: TYPE.meta, border: `1px solid ${COLORS.gray[200]}`, borderRadius: RADIUS.input, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Time</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30"
                      style={{ fontSize: TYPE.meta, border: `1px solid ${COLORS.gray[200]}`, borderRadius: RADIUS.input, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.xs }}>
                  <motion.button
                    className="font-medium text-gray-500 border border-gray-200 bg-white"
                    style={{ borderRadius: RADIUS.button, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, fontSize: TYPE.meta }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowMeetingModal(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="font-semibold text-white border-0 shadow-lg shadow-emerald-500/20"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                      fontSize: TYPE.meta,
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (!meetingTitle.trim() || !meetingDate) {
                        toast.error('Please fill in title and date');
                        return;
                      }
                      toast.success(`"${meetingTitle}" scheduled for ${meetingDate}`);
                      setShowMeetingModal(false);
                      setMeetingTitle('');
                      setMeetingDate('');
                      setMeetingTime('10:00');
                      setMeetingType('standup');
                    }}
                  >
                    Schedule
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

/* ── Action Item Row Sub-Component ────────────────────────── */
function ActionItemRow({
  item,
  checked,
  onToggle,
}: {
  item: (typeof DEMO_ACTION_ITEMS)[number];
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="flex items-start"
      style={{ padding: GRID.spacing.xs, borderRadius: RADIUS.button, gap: GRID.spacing.xs }}
      whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
    >
      <motion.button
        onClick={onToggle}
        className="flex-shrink-0 border-0 bg-transparent p-0"
        style={{ marginTop: 2 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        {checked ? (
          <CheckCircle2 size={LAYOUT.icon.md} className="text-emerald-500" />
        ) : (
          <Circle size={LAYOUT.icon.md} className="text-gray-300" />
        )}
      </motion.button>
      <div className="flex-1 min-w-0">
        <p className={`${checked ? 'line-through text-gray-400' : 'text-gray-700'}`} style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
          {item.description}
        </p>
        <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
          <span
            className={`inline-flex items-center font-medium ${item.owner === 'manager' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
            style={{ borderRadius: RADIUS.pill, padding: '1px 6px', fontSize: TYPE.micro }}
          >
            {item.owner === 'manager' ? 'Manager' : 'Agent'}
          </span>
          <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>Due {item.dueDate}</span>
          {item.agentAvatar && (
            <div
              className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold"
              style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
            >
              {item.agentAvatar}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ManagerMeetingsDev;
