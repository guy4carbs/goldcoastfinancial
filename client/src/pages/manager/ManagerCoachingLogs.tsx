/**
 * Manager Coaching Logs
 * Searchable history of coaching sessions with expandable details,
 * follow-up tracking, and agent filtering.
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  UserCheck,
  FileText,
} from 'lucide-react';

/* ── Glass Card Style ──────────────────────────────────────── */
const glassCardStyle = {
  backgroundColor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
} as const;

/* ── Outcome Badge Config ──────────────────────────────────── */
const OUTCOME_CONFIG = {
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  'follow-up': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Follow-up' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
} as const;

/* ── Demo Coaching Logs ────────────────────────────────────── */
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

/* ── Date Formatter ────────────────────────────────────────── */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Unique Agent Names ────────────────────────────────────── */
const AGENT_NAMES = Array.from(
  new Set(COACHING_LOGS.map((log) => log.agentName))
).sort();

/* ── Component ─────────────────────────────────────────────── */
export function ManagerCoachingLogs() {
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  /* ── Filtered Logs ──────────────────────────────────────── */
  const filteredLogs = useMemo(() => {
    return COACHING_LOGS.filter((log) => {
      // Agent filter
      if (selectedAgent !== 'all' && log.agentName !== selectedAgent) return false;

      // Search filter — match against agent name, topic, or notes
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesAgent = log.agentName.toLowerCase().includes(query);
        const matchesTopic = log.topic.toLowerCase().includes(query);
        const matchesNotes = log.notes.toLowerCase().includes(query);
        if (!matchesAgent && !matchesTopic && !matchesNotes) return false;
      }

      return true;
    });
  }, [search, selectedAgent]);

  /* ── Toggle Expand ──────────────────────────────────────── */
  const toggleExpand = (id: string) => {
    setExpandedLog((prev) => (prev === id ? null : id));
  };

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
          icon={ClipboardList}
          title="Coaching Logs"
          subtitle="Session history, notes, and follow-up tracking"
        >
          <motion.button
            className="flex items-center gap-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0 font-semibold"
            style={{
              borderRadius: RADIUS.button,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
              fontSize: TYPE.meta,
              gap: GRID.spacing.xs,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
            New Session
          </motion.button>
        </ManagerPageHero>

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={ClipboardList} value="47" label="Total Sessions" />
            <ManagerStatCard icon={Calendar} value="8" label="This Month" />
            <ManagerStatCard icon={Clock} value="32 min" label="Avg Duration" />
            <ManagerStatCard icon={CheckCircle} value="89%" label="Follow-up Rate" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Search + Filter Bar ──────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row"
          style={{ gap: GRID.spacing.sm }}
        >
          {/* Search Input */}
          <div
            className="flex items-center flex-1"
            style={{
              ...glassCardStyle,
              borderRadius: RADIUS.input,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
              gap: GRID.spacing.xs,
              boxShadow: SHADOW.level1,
            }}
          >
            <Search
              className="text-gray-400 flex-shrink-0"
              style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }}
            />
            <input
              type="text"
              placeholder="Search by agent, topic, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
              style={{ fontSize: TYPE.meta, border: 'none' }}
            />
          </div>

          {/* Agent Dropdown Filter */}
          <div
            className="flex items-center relative"
            style={{
              ...glassCardStyle,
              borderRadius: RADIUS.input,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
              gap: GRID.spacing.xs,
              boxShadow: SHADOW.level1,
              minWidth: 200,
            }}
          >
            <UserCheck
              className="text-gray-400 flex-shrink-0"
              style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }}
            />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 appearance-none cursor-pointer"
              style={{
                fontSize: TYPE.meta,
                border: 'none',
                paddingRight: GRID.spacing.md,
              }}
            >
              <option value="all">All Agents</option>
              {AGENT_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="text-gray-400 flex-shrink-0 pointer-events-none absolute"
              style={{
                width: LAYOUT.icon.xs,
                height: LAYOUT.icon.xs,
                right: GRID.spacing.sm,
              }}
            />
          </div>
        </motion.div>

        {/* ── Log List ─────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}
        >
          {filteredLogs.length === 0 && (
            <div
              className="text-center"
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                padding: GRID.spacing.xl,
                boxShadow: SHADOW.card,
              }}
            >
              <ClipboardList
                className="mx-auto text-gray-300"
                style={{
                  width: LAYOUT.icon.xxl,
                  height: LAYOUT.icon.xxl,
                  marginBottom: GRID.spacing.sm,
                }}
              />
              <p
                className="text-gray-500 font-medium"
                style={{ fontSize: TYPE.body }}
              >
                No coaching logs match your search
              </p>
              <p
                className="text-gray-400"
                style={{ fontSize: TYPE.meta, marginTop: GRID.spacing.xs }}
              >
                Try adjusting your filters or search terms
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLog === log.id;
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
                  transition={{
                    duration: MOTION.duration.normal,
                    ease: MOTION.easing,
                  }}
                  style={{
                    ...glassCardStyle,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                    overflow: 'hidden',
                  }}
                >
                  {/* ── Collapsed Row ───────────────────────── */}
                  <motion.div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleExpand(log.id)}
                    style={{
                      padding: GRID.spacing.md,
                      gap: GRID.spacing.sm,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    {/* Date */}
                    <div
                      className="flex-shrink-0 text-center hidden sm:block"
                      style={{ minWidth: 72 }}
                    >
                      <p
                        className="font-semibold text-gray-900"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {formatDate(log.date).split(',')[0]}
                      </p>
                      <p
                        className="text-gray-400"
                        style={{ fontSize: TYPE.micro }}
                      >
                        {formatDate(log.date).split(',')[1]?.trim()}
                      </p>
                    </div>

                    {/* Agent Avatar */}
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                      style={{
                        width: LAYOUT.icon.xxl,
                        height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.caption,
                        boxShadow: SHADOW.glow.emerald,
                      }}
                    >
                      {log.agentAvatar}
                    </div>

                    {/* Agent Name + Topic */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-gray-900 truncate"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {log.agentName}
                      </p>
                      <p
                        className="font-bold text-gray-800 truncate"
                        style={{ fontSize: TYPE.body - 2 }}
                      >
                        {log.topic}
                      </p>
                      {/* Mobile date */}
                      <p
                        className="text-gray-400 sm:hidden"
                        style={{ fontSize: TYPE.micro }}
                      >
                        {formatDate(log.date)}
                      </p>
                    </div>

                    {/* Duration */}
                    <div
                      className="flex items-center text-gray-500 flex-shrink-0 hidden md:flex"
                      style={{ gap: GRID.spacing.xs / 2, fontSize: TYPE.meta }}
                    >
                      <Clock
                        style={{
                          width: LAYOUT.icon.xs,
                          height: LAYOUT.icon.xs,
                        }}
                      />
                      <span>{log.duration} min</span>
                    </div>

                    {/* Outcome Badge */}
                    <span
                      className={`inline-flex items-center font-medium flex-shrink-0 ${outcomeConfig.bg} ${outcomeConfig.text}`}
                      style={{
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        fontSize: TYPE.micro,
                      }}
                    >
                      {outcomeConfig.label}
                    </span>

                    {/* Expand/Collapse Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: MOTION.duration.fast }}
                      className="flex-shrink-0 text-gray-400"
                    >
                      <ChevronDown
                        style={{
                          width: LAYOUT.icon.md,
                          height: LAYOUT.icon.md,
                        }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* ── Expanded Details ────────────────────── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: MOTION.duration.expand,
                          ease: MOTION.easing,
                        }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: `0 ${GRID.spacing.md}px ${GRID.spacing.md}px`,
                            borderTop: `1px solid ${GLASS.border}`,
                            paddingTop: GRID.spacing.md,
                          }}
                        >
                          {/* Duration on mobile */}
                          <div
                            className="flex items-center text-gray-500 md:hidden"
                            style={{
                              gap: GRID.spacing.xs / 2,
                              fontSize: TYPE.meta,
                              marginBottom: GRID.spacing.sm,
                            }}
                          >
                            <Clock
                              style={{
                                width: LAYOUT.icon.xs,
                                height: LAYOUT.icon.xs,
                              }}
                            />
                            <span>{log.duration} min session</span>
                          </div>

                          {/* Notes Section */}
                          <div style={{ marginBottom: GRID.spacing.md }}>
                            <div
                              className="flex items-center"
                              style={{
                                gap: GRID.spacing.xs,
                                marginBottom: GRID.spacing.xs,
                              }}
                            >
                              <FileText
                                className="text-emerald-600"
                                style={{
                                  width: LAYOUT.icon.sm,
                                  height: LAYOUT.icon.sm,
                                }}
                              />
                              <p
                                className="font-semibold text-gray-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                Session Notes
                              </p>
                            </div>
                            <p
                              className="text-gray-600 leading-relaxed"
                              style={{
                                fontSize: TYPE.meta,
                                lineHeight: 1.7,
                                paddingLeft: GRID.spacing.md,
                              }}
                            >
                              {log.notes}
                            </p>
                          </div>

                          {/* Follow-up Items */}
                          <div style={{ marginBottom: GRID.spacing.md }}>
                            <div
                              className="flex items-center justify-between"
                              style={{ marginBottom: GRID.spacing.xs }}
                            >
                              <div
                                className="flex items-center"
                                style={{ gap: GRID.spacing.xs }}
                              >
                                <CheckCircle
                                  className="text-emerald-600"
                                  style={{
                                    width: LAYOUT.icon.sm,
                                    height: LAYOUT.icon.sm,
                                  }}
                                />
                                <p
                                  className="font-semibold text-gray-900"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  Follow-up Items
                                </p>
                              </div>
                              <span
                                className="text-gray-400 font-medium"
                                style={{ fontSize: TYPE.micro }}
                              >
                                {completedFollowUps}/{totalFollowUps} completed
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: GRID.spacing.xs,
                                paddingLeft: GRID.spacing.md,
                              }}
                            >
                              {log.followUps.map((followUp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center"
                                  style={{ gap: GRID.spacing.xs }}
                                >
                                  {/* Checkbox-style indicator */}
                                  <div
                                    className="flex items-center justify-center flex-shrink-0"
                                    style={{
                                      width: LAYOUT.icon.md,
                                      height: LAYOUT.icon.md,
                                      borderRadius: RADIUS.input / 3,
                                      border: followUp.done
                                        ? 'none'
                                        : `2px solid ${COLORS.gray[300]}`,
                                      backgroundColor: followUp.done
                                        ? COLORS.semantic.success
                                        : 'transparent',
                                    }}
                                  >
                                    {followUp.done && (
                                      <CheckCircle
                                        className="text-white"
                                        style={{
                                          width: LAYOUT.icon.xs,
                                          height: LAYOUT.icon.xs,
                                        }}
                                      />
                                    )}
                                  </div>
                                  <span
                                    className={
                                      followUp.done
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-700'
                                    }
                                    style={{ fontSize: TYPE.meta }}
                                  >
                                    {followUp.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Link to Agent Scorecard */}
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
                            <UserCheck
                              style={{
                                width: LAYOUT.icon.sm,
                                height: LAYOUT.icon.sm,
                              }}
                            />
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
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerCoachingLogs;
