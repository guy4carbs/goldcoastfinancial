/**
 * Manager Goals
 * Set, track, and achieve team objectives with quarterly OKR tracking.
 * Heritage Design System — Emerald theme with gold accents
 *
 * Features: Team Goals / Individual Goals tabs, quarterly objectives with key results,
 * golden ratio layout, goal distribution, milestones, agent goal table, templates.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard, DEMO_TEAM_MEMBERS, MANAGER_ICON_GRADIENT } from './managerConstants';
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
  Target,
  Users,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  BarChart3,
  BookOpen,
  Trophy,
  X,
  ClipboardList,
} from 'lucide-react';

/* ── Demo Data: Team Objectives & Key Results ────────────────── */

type OkrStatus = 'on_track' | 'at_risk' | 'behind';

interface KeyResult {
  description: string;
  current: number;
  target: number;
  unit: string;
}

interface TeamObjective {
  id: string;
  title: string;
  status: OkrStatus;
  progress: number;
  keyResults: KeyResult[];
}

const DEMO_TEAM_OBJECTIVES: TeamObjective[] = [
  {
    id: '1',
    title: 'Increase Revenue by 25%',
    status: 'on_track',
    progress: 72,
    keyResults: [
      { description: 'Grow monthly premium volume to $180K', current: 142, target: 180, unit: 'K' },
      { description: 'Close 15 new enterprise policies', current: 11, target: 15, unit: '' },
      { description: 'Achieve $50K in cross-sell revenue', current: 38, target: 50, unit: 'K' },
    ],
  },
  {
    id: '2',
    title: 'Improve Win Rate to 35%',
    status: 'at_risk',
    progress: 54,
    keyResults: [
      { description: 'Increase proposal-to-close ratio to 35%', current: 28, target: 35, unit: '%' },
      { description: 'Reduce average objections per call to 2', current: 3, target: 2, unit: '' },
    ],
  },
  {
    id: '3',
    title: 'Reduce Sales Cycle to 14 Days',
    status: 'behind',
    progress: 38,
    keyResults: [
      { description: 'Decrease avg days from lead to close', current: 21, target: 14, unit: ' days' },
      { description: 'Automate follow-up sequences for 80% of leads', current: 45, target: 80, unit: '%' },
      { description: 'Achieve same-day response rate of 95%', current: 72, target: 95, unit: '%' },
    ],
  },
];

/* ── Demo Data: Goal Distribution ───────────────────────────── */

const DEMO_GOAL_DISTRIBUTION = [
  { label: 'On Track', count: 5, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { label: 'At Risk', count: 2, color: 'bg-amber-500', textColor: 'text-amber-700' },
  { label: 'Behind', count: 1, color: 'bg-red-500', textColor: 'text-red-700' },
];

/* ── Demo Data: Upcoming Milestones ─────────────────────────── */

const DEMO_MILESTONES = [
  { id: '1', date: 'Mar 15', description: 'Q1 Mid-Quarter Review', owner: 'SJ' },
  { id: '2', date: 'Mar 22', description: 'Enterprise Pipeline Target Check', owner: 'RG' },
  { id: '3', date: 'Mar 31', description: 'Q1 OKR Final Assessment', owner: 'MC' },
  { id: '4', date: 'Apr 5', description: 'Q2 Goal Setting Kickoff', owner: 'ED' },
];

/* ── Demo Data: Individual Agent Goals ──────────────────────── */

interface AgentGoal {
  title: string;
  progress: number;
  status: OkrStatus;
  keyResults: { description: string; current: number; target: number; unit: string }[];
}

interface AgentGoalData {
  agentId: string;
  name: string;
  avatar: string;
  goalsCount: number;
  completion: number;
  status: OkrStatus;
  goals: AgentGoal[];
}

const DEMO_AGENT_GOALS: AgentGoalData[] = [
  {
    agentId: '1', name: 'Sarah Johnson', avatar: 'SJ', goalsCount: 3, completion: 82, status: 'on_track',
    goals: [
      { title: 'Close 10 IUL policies this quarter', progress: 80, status: 'on_track', keyResults: [
        { description: 'IUL policies closed', current: 8, target: 10, unit: '' },
        { description: 'Average premium per policy', current: 4200, target: 4500, unit: '$' },
      ]},
      { title: 'Build 5 referral partnerships', progress: 60, status: 'at_risk', keyResults: [
        { description: 'Active referral partners', current: 3, target: 5, unit: '' },
      ]},
      { title: 'Maintain 95% client satisfaction', progress: 97, status: 'on_track', keyResults: [
        { description: 'Client satisfaction score', current: 97, target: 95, unit: '%' },
      ]},
    ],
  },
  {
    agentId: '2', name: 'Mike Chen', avatar: 'MC', goalsCount: 2, completion: 71, status: 'on_track',
    goals: [
      { title: 'Increase call volume to 50/week', progress: 76, status: 'on_track', keyResults: [
        { description: 'Weekly call average', current: 38, target: 50, unit: '' },
      ]},
      { title: 'Complete Advanced IUL certification', progress: 65, status: 'at_risk', keyResults: [
        { description: 'Modules completed', current: 13, target: 20, unit: '' },
        { description: 'Assessment score', current: 88, target: 90, unit: '%' },
      ]},
    ],
  },
  {
    agentId: '3', name: 'Emily Davis', avatar: 'ED', goalsCount: 3, completion: 64, status: 'at_risk',
    goals: [
      { title: 'Grow pipeline to $200K', progress: 68, status: 'on_track', keyResults: [
        { description: 'Pipeline value', current: 136, target: 200, unit: 'K' },
      ]},
      { title: 'Improve close rate to 20%', progress: 55, status: 'at_risk', keyResults: [
        { description: 'Monthly close rate', current: 16, target: 20, unit: '%' },
      ]},
      { title: 'Renew Life Insurance License', progress: 70, status: 'at_risk', keyResults: [
        { description: 'CE credits completed', current: 14, target: 20, unit: '' },
      ]},
    ],
  },
  {
    agentId: '4', name: 'James Wilson', avatar: 'JW', goalsCount: 2, completion: 48, status: 'at_risk',
    goals: [
      { title: 'Hit 80% quota consistently', progress: 52, status: 'at_risk', keyResults: [
        { description: 'Average monthly quota %', current: 71, target: 80, unit: '%' },
      ]},
      { title: 'Complete objection handling training', progress: 44, status: 'behind', keyResults: [
        { description: 'Training modules done', current: 4, target: 8, unit: '' },
        { description: 'Role-play sessions attended', current: 2, target: 5, unit: '' },
      ]},
    ],
  },
  {
    agentId: '5', name: 'Lisa Park', avatar: 'LP', goalsCount: 3, completion: 55, status: 'on_track',
    goals: [
      { title: 'Generate 20 qualified leads/month', progress: 60, status: 'on_track', keyResults: [
        { description: 'Qualified leads this month', current: 12, target: 20, unit: '' },
      ]},
      { title: 'Master IUL product line', progress: 50, status: 'at_risk', keyResults: [
        { description: 'IUL training modules', current: 6, target: 12, unit: '' },
      ]},
      { title: 'Achieve first $5K commission month', progress: 55, status: 'on_track', keyResults: [
        { description: 'Monthly commission', current: 2750, target: 5000, unit: '$' },
      ]},
    ],
  },
  {
    agentId: '6', name: 'David Brown', avatar: 'DB', goalsCount: 2, completion: 76, status: 'on_track',
    goals: [
      { title: 'Close 8 whole life policies', progress: 75, status: 'on_track', keyResults: [
        { description: 'Whole life policies closed', current: 6, target: 8, unit: '' },
      ]},
      { title: 'Increase avg deal size to $40K', progress: 78, status: 'on_track', keyResults: [
        { description: 'Average deal size', current: 33, target: 40, unit: 'K' },
      ]},
    ],
  },
  {
    agentId: '7', name: 'Rachel Green', avatar: 'RG', goalsCount: 3, completion: 85, status: 'on_track',
    goals: [
      { title: 'Achieve $45K monthly revenue', progress: 88, status: 'on_track', keyResults: [
        { description: 'Monthly revenue', current: 39700, target: 45000, unit: '$' },
      ]},
      { title: 'Mentor 2 junior agents', progress: 80, status: 'on_track', keyResults: [
        { description: 'Mentoring sessions completed', current: 8, target: 10, unit: '' },
      ]},
      { title: 'Earn Expert certification', progress: 90, status: 'on_track', keyResults: [
        { description: 'Expert track modules', current: 22, target: 24, unit: '' },
        { description: 'Final assessment score', current: 94, target: 90, unit: '%' },
      ]},
    ],
  },
  {
    agentId: '8', name: 'Carlos Martinez', avatar: 'CM', goalsCount: 2, completion: 28, status: 'behind',
    goals: [
      { title: 'Complete IUL certification', progress: 33, status: 'behind', keyResults: [
        { description: 'Certification modules done', current: 4, target: 12, unit: '' },
      ]},
      { title: 'Reach 20 calls per week', progress: 22, status: 'behind', keyResults: [
        { description: 'Weekly call average', current: 18, target: 20, unit: '' },
        { description: 'Contact rate', current: 35, target: 50, unit: '%' },
      ]},
    ],
  },
];

/* ── Demo Data: Goal Templates ──────────────────────────────── */

const DEMO_GOAL_TEMPLATES = [
  {
    id: '1',
    name: 'Revenue Target',
    description: 'Set monthly or quarterly revenue goals with premium volume and close rate key results.',
    icon: TrendingUp,
    prefill: { title: 'Revenue Target — Q1 2026', scope: 'team' as const, keyResult: 'Grow monthly premium volume' },
  },
  {
    id: '2',
    name: 'Activity Metrics',
    description: 'Track call volume, appointments booked, and follow-up completion rates.',
    icon: BarChart3,
    prefill: { title: 'Activity Metrics — Weekly', scope: 'individual' as const, keyResult: 'Achieve target call volume per week' },
  },
  {
    id: '3',
    name: 'Skill Development',
    description: 'Certification milestones, training module completions, and assessment score targets.',
    icon: BookOpen,
    prefill: { title: 'Skill Development Plan', scope: 'individual' as const, keyResult: 'Complete certification modules' },
  },
];

/* ── Status helpers ─────────────────────────────────────────── */

const STATUS_CONFIG: Record<OkrStatus, { bg: string; text: string; label: string; barColor: string }> = {
  on_track: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'On Track', barColor: 'from-emerald-500 to-emerald-600' },
  at_risk: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'At Risk', barColor: 'from-amber-400 to-amber-500' },
  behind: { bg: 'bg-red-100', text: 'text-red-700', label: 'Behind', barColor: 'from-red-400 to-red-500' },
};

function getStatusConfig(status: OkrStatus) {
  return STATUS_CONFIG[status];
}

/* ── Key Result progress helper ─────────────────────────────── */

function krProgress(kr: { current: number; target: number }): number {
  if (kr.target === 0) return 0;
  return Math.min(100, Math.round((kr.current / kr.target) * 100));
}

/* ── Tab type ────────────────────────────────────────────────── */

type Tab = 'team' | 'individual';

/* ── Computed Stats ────────────────────────────────────────────── */

const allGoals = DEMO_AGENT_GOALS.flatMap((a) => a.goals);
const activeGoalCount = allGoals.length;
const onTrackCount = allGoals.filter((g) => g.status === 'on_track').length;
const atRiskCount = allGoals.filter((g) => g.status === 'at_risk').length;
const avgCompletion = Math.round(
  DEMO_AGENT_GOALS.reduce((sum, a) => sum + a.completion, 0) / DEMO_AGENT_GOALS.length,
);

/* ── Date dropdown helpers ────────────────────────────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DUE_DATE_YEARS = [2025, 2026, 2027, 2028, 2029];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

/* ── Component ───────────────────────────────────────────────── */

export function ManagerGoals() {
  const [activeTab, setActiveTab] = useState<Tab>('team');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  /* ── Create Goal Modal state ─────────────────────────────── */
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalScope, setGoalScope] = useState<'team' | 'individual'>('team');
  const [goalKeyResult, setGoalKeyResult] = useState('');
  const [goalAssignee, setGoalAssignee] = useState('');
  const [goalDueMonth, setGoalDueMonth] = useState(0);
  const [goalDueDay, setGoalDueDay] = useState(0);
  const [goalDueYear, setGoalDueYear] = useState(0);

  const dueDateMaxDays = getDaysInMonth(goalDueMonth, goalDueYear || new Date().getFullYear());

  const resetGoalModal = () => {
    setGoalTitle('');
    setGoalScope('team');
    setGoalKeyResult('');
    setGoalAssignee('');
    setGoalDueMonth(0);
    setGoalDueDay(0);
    setGoalDueYear(0);
  };

  const openGoalModal = (prefill?: { title: string; scope: 'team' | 'individual'; keyResult: string }) => {
    if (prefill) {
      setGoalTitle(prefill.title);
      setGoalScope(prefill.scope);
      setGoalKeyResult(prefill.keyResult);
    } else {
      resetGoalModal();
    }
    setShowGoalModal(true);
  };

  const handleCreateGoal = () => {
    if (!goalTitle.trim()) {
      toast.error('Please enter a goal title');
      return;
    }
    if (!goalDueMonth || !goalDueDay || !goalDueYear) {
      toast.error('Please select a complete due date');
      return;
    }
    const dateLabel = `${MONTH_NAMES[goalDueMonth - 1]} ${goalDueDay}, ${goalDueYear}`;
    const assignLabel = goalScope === 'team' ? 'entire team' : (goalAssignee || 'selected agent');
    toast.success(`Goal "${goalTitle}" created for ${assignLabel} — due ${dateLabel}`);
    setShowGoalModal(false);
    resetGoalModal();
  };

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
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
          icon={Target}
          title="Goals"
          subtitle="Set, track, and achieve team objectives"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Target} value={activeGoalCount} label="Active Goals" delta={1} periodLabel="vs last quarter" />
            <ManagerStatCard
              icon={CheckCircle2}
              value={onTrackCount}
              label="On Track"
              delta={2}
              periodLabel="vs last month"
            />
            <ManagerStatCard icon={AlertTriangle} value={atRiskCount} label="At Risk" delta={-1} periodLabel="vs last month" />
            <ManagerStatCard icon={TrendingUp} value={`${avgCompletion}%`} label="Avg Completion" delta={5} deltaFormat="percent" periodLabel="vs last month" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Switcher ─────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex"
          style={{ gap: GRID.spacing.xs / 2 }}
        >
          {[
            { id: 'team' as Tab, label: 'Team Goals', icon: Users },
            { id: 'individual' as Tab, label: 'Individual Goals', icon: UserCheck },
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
                fontSize: TYPE.meta,
                gap: GRID.spacing.xs,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <tab.icon size={LAYOUT.icon.md} />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── TAB: Team Goals ────────────────────────────────── */}
        {activeTab === 'team' && (
          <>
            {/* Golden ratio two-column layout */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
              style={{ gap: GRID.spacing.md }}
            >
              {/* Left (1.618fr): Q1 2026 Objectives */}
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
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Target className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    <span className="text-gray-900">Q1 2026 Objectives</span>
                  </CardTitle>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                    {DEMO_TEAM_OBJECTIVES.map((obj, objIdx) => {
                      const statusCfg = getStatusConfig(obj.status);
                      return (
                        <motion.div
                          key={obj.id}
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.button,
                            backgroundColor: COLORS.gray[50],
                            border: `1px solid ${COLORS.gray[100]}`,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[100],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Objective header */}
                          <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {obj.title}
                            </p>
                            <span
                              className={`inline-flex items-center font-medium ${statusCfg.bg} ${statusCfg.text}`}
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                fontSize: TYPE.micro,
                              }}
                            >
                              {statusCfg.label}
                            </span>
                          </div>

                          {/* Overall objective progress */}
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                            <div
                              className="flex-1 bg-gray-100 overflow-hidden"
                              style={{ height: 8, borderRadius: RADIUS.pill }}
                            >
                              <motion.div
                                className={`h-full bg-gradient-to-r ${statusCfg.barColor}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${obj.progress}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + objIdx * 0.15 }}
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>
                            <span className="font-semibold text-gray-700 flex-shrink-0" style={{ fontSize: TYPE.caption, minWidth: 36, textAlign: 'right' }}>
                              {obj.progress}%
                            </span>
                          </div>

                          {/* Key Results */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                            {obj.keyResults.map((kr, krIdx) => {
                              const pct = krProgress(kr);
                              return (
                                <div
                                  key={krIdx}
                                  style={{
                                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                                    borderRadius: RADIUS.button,
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                  }}
                                >
                                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                    <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>
                                      {kr.description}
                                    </span>
                                    <span className="text-gray-500 font-medium flex-shrink-0" style={{ fontSize: TYPE.micro }}>
                                      {kr.current}{kr.unit} / {kr.target}{kr.unit}
                                    </span>
                                  </div>
                                  <div
                                    className="w-full bg-gray-100 overflow-hidden"
                                    style={{ height: 5, borderRadius: RADIUS.pill }}
                                  >
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 + objIdx * 0.15 + krIdx * 0.08 }}
                                      style={{ borderRadius: RADIUS.pill }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Right (1fr): Goal Distribution + Upcoming Milestones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Goal Distribution */}
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
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Goal Distribution</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                      {DEMO_GOAL_DISTRIBUTION.map((item, idx) => {
                        const totalGoals = DEMO_GOAL_DISTRIBUTION.reduce((s, g) => s + g.count, 0);
                        const pct = Math.round((item.count / totalGoals) * 100);
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                              <span className={`font-medium ${item.textColor}`} style={{ fontSize: TYPE.body }}>
                                {item.label}
                              </span>
                              <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.body }}>
                                {item.count}
                              </span>
                            </div>
                            <div
                              className="w-full bg-gray-100 overflow-hidden"
                              style={{ height: 10, borderRadius: RADIUS.pill }}
                            >
                              <motion.div
                                className={`h-full ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 + idx * 0.12 }}
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Milestones */}
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
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Calendar className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Upcoming Milestones</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {DEMO_MILESTONES.map((ms) => (
                        <motion.div
                          key={ms.id}
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
                          {/* Date badge */}
                          <div className="flex-shrink-0 text-center" style={{ minWidth: 56 }}>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.caption }}>
                              {ms.date}
                            </p>
                          </div>

                          {/* Description */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800" style={{ fontSize: TYPE.caption }}>
                              {ms.description}
                            </p>
                          </div>

                          {/* Owner avatar */}
                          <div
                            className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.micro,
                            }}
                          >
                            {ms.owner}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* ── TAB: Individual Goals ─────────────────────────── */}
        {activeTab === 'individual' && (
          <>
            {/* Golden ratio two-column layout */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
              style={{ gap: GRID.spacing.md }}
            >
              {/* Left (1.618fr): Agent Goals Table */}
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
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Users className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    <span className="text-gray-900">Agent Goals</span>
                  </CardTitle>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {DEMO_AGENT_GOALS.map((agent, agentIdx) => {
                      const statusCfg = getStatusConfig(agent.status);
                      const isExpanded = expandedAgents.has(agent.agentId);

                      return (
                        <div key={agent.agentId}>
                          {/* Agent row */}
                          <motion.div
                            className="flex items-center cursor-pointer"
                            style={{
                              padding: 12,
                              borderRadius: RADIUS.button,
                              gap: 12,
                              ...(isExpanded
                                ? { backgroundColor: COLORS.gray[50], borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                                : {}),
                            }}
                            onClick={() => toggleAgent(agent.agentId)}
                            whileHover={{
                              backgroundColor: COLORS.gray[50],
                              transition: { duration: MOTION.duration.hover },
                            }}
                          >
                            {/* Avatar */}
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.caption,
                              }}
                            >
                              {agent.avatar}
                            </div>

                            {/* Name + goals count */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.caption }}>
                                {agent.name}
                              </p>
                              <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                                {agent.goalsCount} goal{agent.goalsCount !== 1 ? 's' : ''}
                              </p>
                            </div>

                            {/* Completion + progress bar */}
                            <div style={{ width: 100 }}>
                              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.micro }}>
                                  {agent.completion}%
                                </span>
                              </div>
                              <div
                                className="w-full bg-gray-100 overflow-hidden"
                                style={{ height: 6, borderRadius: RADIUS.pill }}
                              >
                                <motion.div
                                  className={`h-full bg-gradient-to-r ${statusCfg.barColor}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${agent.completion}%` }}
                                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + agentIdx * 0.06 }}
                                  style={{ borderRadius: RADIUS.pill }}
                                />
                              </div>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center font-medium ${statusCfg.bg} ${statusCfg.text} flex-shrink-0`}
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                fontSize: TYPE.micro,
                              }}
                            >
                              {statusCfg.label}
                            </span>

                            {/* Chevron */}
                            {isExpanded ? (
                              <ChevronUp className="text-gray-400 flex-shrink-0" size={LAYOUT.icon.sm} />
                            ) : (
                              <ChevronDown className="text-gray-400 flex-shrink-0" size={LAYOUT.icon.sm} />
                            )}
                          </motion.div>

                          {/* Expanded: Agent's individual goals with key results */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div
                                  style={{
                                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px`,
                                    backgroundColor: COLORS.gray[50],
                                    borderBottomLeftRadius: RADIUS.button,
                                    borderBottomRightRadius: RADIUS.button,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: GRID.spacing.xs,
                                  }}
                                >
                                  {agent.goals.map((goal, goalIdx) => {
                                    const goalStatusCfg = getStatusConfig(goal.status);
                                    return (
                                      <div
                                        key={goalIdx}
                                        style={{
                                          padding: GRID.spacing.sm,
                                          borderRadius: RADIUS.button,
                                          backgroundColor: 'rgba(255,255,255,0.8)',
                                          border: `1px solid ${COLORS.gray[100]}`,
                                        }}
                                      >
                                        {/* Goal title + status */}
                                        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                                          <p className="font-medium text-gray-800" style={{ fontSize: TYPE.caption }}>
                                            {goal.title}
                                          </p>
                                          <span
                                            className={`inline-flex items-center font-medium ${goalStatusCfg.bg} ${goalStatusCfg.text}`}
                                            style={{
                                              borderRadius: RADIUS.pill,
                                              padding: `2px ${GRID.spacing.xs}px`,
                                              fontSize: TYPE.micro,
                                            }}
                                          >
                                            {goalStatusCfg.label}
                                          </span>
                                        </div>

                                        {/* Goal progress bar */}
                                        <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                                          <div
                                            className="flex-1 bg-gray-100 overflow-hidden"
                                            style={{ height: 5, borderRadius: RADIUS.pill }}
                                          >
                                            <motion.div
                                              className={`h-full bg-gradient-to-r ${goalStatusCfg.barColor}`}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${goal.progress}%` }}
                                              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 + goalIdx * 0.1 }}
                                              style={{ borderRadius: RADIUS.pill }}
                                            />
                                          </div>
                                          <span className="font-medium text-gray-600 flex-shrink-0" style={{ fontSize: TYPE.micro }}>
                                            {goal.progress}%
                                          </span>
                                        </div>

                                        {/* Key results */}
                                        {goal.keyResults.map((kr, krIdx) => {
                                          const pct = krProgress(kr);
                                          return (
                                            <div
                                              key={krIdx}
                                              style={{
                                                padding: `${GRID.spacing.xs / 2}px 0`,
                                                borderTop: krIdx > 0 ? `1px solid ${COLORS.gray[100]}` : undefined,
                                              }}
                                            >
                                              <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
                                                <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                                                  {kr.description}
                                                </span>
                                                <span className="text-gray-400 font-medium flex-shrink-0" style={{ fontSize: TYPE.micro }}>
                                                  {kr.current}{kr.unit} / {kr.target}{kr.unit}
                                                </span>
                                              </div>
                                              <div
                                                className="w-full bg-gray-100 overflow-hidden"
                                                style={{ height: 4, borderRadius: RADIUS.pill }}
                                              >
                                                <motion.div
                                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${pct}%` }}
                                                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 + krIdx * 0.08 }}
                                                  style={{ borderRadius: RADIUS.pill }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
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

              {/* Right (1fr): Create Goal + Goal Templates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Create Goal — Gradient card */}
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
                  style={{ borderRadius: RADIUS.card }}
                >
                  {/* Fibonacci blobs: 89, 55, 34 px */}
                  <div
                    className="absolute top-0 right-0 bg-white/10 blur-2xl"
                    style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }}
                  />
                  <div
                    className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl"
                    style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)', borderRadius: RADIUS.pill }}
                  />
                  <div
                    className="absolute top-1/2 right-1/4 bg-white/5 blur-lg"
                    style={{ width: 34, height: 34, transform: 'translate(50%, -50%)', borderRadius: RADIUS.pill }}
                  />

                  <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Plus className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <div>
                        <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                          Create Goal
                        </p>
                        <p className="text-white/70" style={{ fontSize: TYPE.micro }}>
                          Set new objectives for your team
                        </p>
                      </div>
                    </div>

                    <p className="text-white/80" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.md, lineHeight: 1.5 }}>
                      Define objectives, assign key results, and track progress toward quarterly targets. Goals can be assigned to individual agents or the whole team.
                    </p>

                    <motion.button
                      className="flex items-center font-medium text-white border-0"
                      style={{
                        fontSize: TYPE.caption,
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                      }}
                      whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openGoalModal()}
                    >
                      <Plus size={LAYOUT.icon.xs} />
                      New Goal
                    </motion.button>
                  </div>
                </div>

                {/* Goal Templates */}
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
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Trophy className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Goal Templates</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                      {DEMO_GOAL_TEMPLATES.map((template) => (
                        <motion.div
                          key={template.id}
                          className="flex items-start"
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            gap: 12,
                            backgroundColor: COLORS.gray[50],
                            border: `1px solid ${COLORS.gray[100]}`,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[100],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Template icon badge */}
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex-shrink-0`}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.button,
                            }}
                          >
                            <template.icon className="text-amber-200" size={LAYOUT.icon.md} />
                          </div>

                          {/* Template content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.caption }}>
                              {template.name}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.micro, lineHeight: 1.4 }}>
                              {template.description}
                            </p>
                          </div>
                          <motion.button
                            className="font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent flex-shrink-0"
                            style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openGoalModal(template.prefill)}
                          >
                            Use
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Create Goal Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowGoalModal(false); resetGoalModal(); }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: GRID.spacing.md,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: MOTION.duration.normal, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                backgroundColor: '#fff',
                borderRadius: RADIUS.card,
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600"
                style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px` }}
              >
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <ClipboardList className="text-amber-200" size={LAYOUT.icon.md} />
                  <span className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                    Create Goal
                  </span>
                </div>
                <motion.button
                  className="bg-transparent border-0 text-white/70"
                  whileHover={{ color: '#fff', scale: 1.1 }}
                  onClick={() => { setShowGoalModal(false); resetGoalModal(); }}
                >
                  <X size={LAYOUT.icon.md} />
                </motion.button>
              </div>

              {/* Body */}
              <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {/* Title */}
                <div>
                  <label className="block text-gray-600 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Increase Q1 Revenue by 25%"
                    className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      fontSize: TYPE.meta,
                    }}
                  />
                </div>

                {/* Scope Toggle */}
                <div>
                  <label className="block text-gray-600 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                    Scope
                  </label>
                  <div className="flex" style={{ gap: GRID.spacing.xs / 2 }}>
                    {(['team', 'individual'] as const).map((s) => (
                      <motion.button
                        key={s}
                        className={`flex-1 font-medium border-0 ${
                          goalScope === s
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        style={{
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGoalScope(s)}
                      >
                        {s === 'team' ? 'Team' : 'Individual'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Assignee (only for individual scope) */}
                {goalScope === 'individual' && (
                  <div>
                    <label className="block text-gray-600 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                      Assign To
                    </label>
                    <select
                      value={goalAssignee}
                      onChange={(e) => setGoalAssignee(e.target.value)}
                      className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white hover:bg-gray-50 appearance-none"
                      style={{
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.meta,
                        transition: `all ${MOTION.duration.hover}s`,
                      }}
                    >
                      <option value="">Select an agent...</option>
                      {DEMO_AGENT_GOALS.map((a) => (
                        <option key={a.agentId} value={a.name}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Key Result */}
                <div>
                  <label className="block text-gray-600 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                    Primary Key Result
                  </label>
                  <textarea
                    value={goalKeyResult}
                    onChange={(e) => setGoalKeyResult(e.target.value)}
                    placeholder="Describe the measurable outcome..."
                    rows={2}
                    className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      fontSize: TYPE.meta,
                    }}
                  />
                </div>

                {/* Due Date — Month / Day / Year dropdowns */}
                <div>
                  <label className="block text-gray-600 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                    Due Date
                  </label>
                  <div className="grid grid-cols-3" style={{ gap: GRID.spacing.xs / 2 }}>
                    <select
                      value={goalDueMonth || ''}
                      onChange={(e) => {
                        const m = Number(e.target.value);
                        setGoalDueMonth(m);
                        if (goalDueDay > getDaysInMonth(m, goalDueYear || new Date().getFullYear())) setGoalDueDay(0);
                      }}
                      className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white hover:bg-gray-50 appearance-none"
                      style={{
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.meta,
                        transition: `all ${MOTION.duration.hover}s`,
                      }}
                    >
                      <option value="">Month</option>
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={goalDueDay || ''}
                      onChange={(e) => setGoalDueDay(Number(e.target.value))}
                      className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white hover:bg-gray-50 appearance-none"
                      style={{
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.meta,
                        transition: `all ${MOTION.duration.hover}s`,
                      }}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: dueDateMaxDays }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={goalDueYear || ''}
                      onChange={(e) => {
                        const y = Number(e.target.value);
                        setGoalDueYear(y);
                        if (goalDueDay > getDaysInMonth(goalDueMonth, y)) setGoalDueDay(0);
                      }}
                      className="w-full border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white hover:bg-gray-50 appearance-none"
                      style={{
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.meta,
                        transition: `all ${MOTION.duration.hover}s`,
                      }}
                    >
                      <option value="">Year</option>
                      {DUE_DATE_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end"
                style={{
                  padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                  borderTop: `1px solid ${COLORS.gray[100]}`,
                  gap: GRID.spacing.xs,
                }}
              >
                <motion.button
                  className="font-medium text-gray-600 bg-transparent border border-gray-200"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.caption,
                  }}
                  whileHover={{ scale: 1.03, backgroundColor: COLORS.gray[50] }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowGoalModal(false); resetGoalModal(); }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-700 border-0"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.caption,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateGoal}
                >
                  Create Goal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

export default ManagerGoals;
