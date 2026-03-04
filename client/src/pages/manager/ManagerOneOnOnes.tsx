/**
 * Manager 1:1 Meetings
 * Prepare, track, and follow up on individual meetings
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_ONE_ON_ONES, DEMO_ACTION_ITEMS, ONE_ON_ONE_TEMPLATES } from './managerConstants';
import { RADIUS, TYPE, GRID, LAYOUT, SHADOW, MOTION, COLORS, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserCheck,
  Calendar,
  ClipboardList,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  FileText,
  Users,
} from 'lucide-react';

/* ── Demo Recent History ──────────────────────────────────── */
const RECENT_HISTORY = [
  { agent: 'Sarah Johnson', avatar: 'SJ', date: 'Feb 28', completionRate: '4/4 items done' },
  { agent: 'Mike Chen', avatar: 'MC', date: 'Feb 27', completionRate: '3/4 items done' },
  { agent: 'Emily Davis', avatar: 'ED', date: 'Feb 26', completionRate: '2/3 items done' },
  { agent: 'David Brown', avatar: 'DB', date: 'Feb 25', completionRate: '3/3 items done' },
];

export function ManagerOneOnOnes() {
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleMeeting = (id: string) => {
    setExpandedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const overdueItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'overdue');
  const dueThisWeekItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'due_this_week');
  const upcomingItems = DEMO_ACTION_ITEMS.filter((i) => i.status === 'upcoming');

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
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={UserCheck}
          title="1:1 Meetings"
          subtitle="Prepare, track, and follow up on individual meetings"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Calendar} value={4} label="Upcoming" />
            <ManagerStatCard icon={CheckCircle2} value={8} label="Completed This Month" />
            <ManagerStatCard icon={ClipboardList} value={12} label="Open Action Items" />
            <ManagerStatCard icon={Clock} value="28 min" label="Avg Duration" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio 2-Column Grid ───────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ══════════════════════════════════════════════════
              LEFT COLUMN (1.618fr)
              ══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ── Upcoming 1:1s ─────────────────────────────── */}
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
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Calendar className="w-5 h-5 text-amber-200" />
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
                        {/* Meeting Row */}
                        <motion.div
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
                          {/* Agent avatar */}
                          <div
                            className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.caption,
                            }}
                          >
                            {meeting.avatar}
                          </div>

                          {/* Agent name + date/time */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                              {meeting.agent}
                            </p>
                            <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                              {meeting.date} at {meeting.time}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
                            {/* Agenda count */}
                            <span
                              className="inline-flex items-center font-medium bg-emerald-100 text-emerald-700"
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `2px ${GRID.spacing.xs}px`,
                                fontSize: TYPE.caption,
                                gap: 4,
                              }}
                            >
                              <FileText style={{ width: 12, height: 12 }} />
                              {meeting.agendaItems}
                            </span>

                            {/* Action item count */}
                            <span
                              className="inline-flex items-center font-medium bg-blue-100 text-blue-700"
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `2px ${GRID.spacing.xs}px`,
                                fontSize: TYPE.caption,
                                gap: 4,
                              }}
                            >
                              <ClipboardList style={{ width: 12, height: 12 }} />
                              {meeting.actionItems}
                            </span>

                            {/* Carry-forward pill */}
                            {meeting.carryForward > 0 && (
                              <span
                                className="inline-flex items-center font-medium bg-amber-100 text-amber-700"
                                style={{
                                  borderRadius: RADIUS.pill,
                                  padding: `2px ${GRID.spacing.xs}px`,
                                  fontSize: TYPE.caption,
                                }}
                              >
                                {meeting.carryForward} carry-forward
                              </span>
                            )}

                            {/* Open Briefing button */}
                            <motion.button
                              onClick={() => toggleMeeting(meeting.id)}
                              className="flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                              style={{
                                fontSize: TYPE.caption,
                                padding: `4px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.button,
                                gap: 4,
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp style={{ width: 14, height: 14 }} />
                                  Close
                                </>
                              ) : (
                                <>
                                  <ChevronDown style={{ width: 14, height: 14 }} />
                                  Open Briefing
                                </>
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
                                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                  KPI Summary
                                </p>
                                <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                                  {meeting.briefing.kpis.map((kpi, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center bg-white"
                                      style={{
                                        borderRadius: RADIUS.pill,
                                        padding: `4px ${GRID.spacing.sm}px`,
                                        gap: GRID.spacing.xs,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                      }}
                                    >
                                      <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{kpi.label}</span>
                                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{kpi.value}</span>
                                      <TrendArrow trend={kpi.trend} />
                                    </div>
                                  ))}
                                </div>

                                {/* Recent Activity */}
                                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                  Recent Activity
                                </p>
                                <ul style={{ marginBottom: GRID.spacing.sm, paddingLeft: GRID.spacing.sm }}>
                                  {meeting.briefing.recentActivity.map((activity, idx) => (
                                    <li key={idx} className="text-gray-600" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                                      {activity}
                                    </li>
                                  ))}
                                </ul>

                                {/* Risk Flags */}
                                {meeting.briefing.riskFlags.length > 0 && (
                                  <>
                                    <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                      Risk Flags
                                    </p>
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
                                              ? 'rgba(254, 202, 202, 0.4)'
                                              : 'rgba(252, 211, 77, 0.3)',
                                            color: flag.toLowerCase().includes('overdue') || flag.toLowerCase().includes('active')
                                              ? '#b91c1c'
                                              : '#92400e',
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
                                    <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                                      Carried-Forward Items
                                    </p>
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

            {/* ── Recent 1:1 History ────────────────────────── */}
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
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Clock className="w-5 h-5 text-amber-200" />
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
                      {/* Avatar */}
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {entry.avatar}
                      </div>

                      {/* Name + date */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {entry.agent}
                        </p>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                          {entry.date}
                        </p>
                      </div>

                      {/* Completion rate */}
                      <span
                        className="inline-flex items-center font-medium bg-emerald-100 text-emerald-700"
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `2px ${GRID.spacing.xs}px`,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {entry.completionRate}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT COLUMN (1fr)
              ══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ── Action Items Tracker ──────────────────────── */}
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
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <ClipboardList className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Action Items Tracker</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                  {/* Overdue Section */}
                  {overdueItems.length > 0 && (
                    <div
                      style={{
                        borderLeft: '3px solid #ef4444',
                        paddingLeft: GRID.spacing.sm,
                      }}
                    >
                      <p className="font-semibold text-red-600" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        Overdue ({overdueItems.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {overdueItems.map((item) => (
                          <ActionItemRow
                            key={item.id}
                            item={item}
                            checked={checkedItems.has(item.id)}
                            onToggle={() => toggleChecked(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due This Week Section */}
                  {dueThisWeekItems.length > 0 && (
                    <div>
                      <p className="font-semibold text-amber-600" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        Due This Week ({dueThisWeekItems.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {dueThisWeekItems.map((item) => (
                          <ActionItemRow
                            key={item.id}
                            item={item}
                            checked={checkedItems.has(item.id)}
                            onToggle={() => toggleChecked(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Section */}
                  {upcomingItems.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-500" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                        Upcoming ({upcomingItems.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {upcomingItems.map((item) => (
                          <ActionItemRow
                            key={item.id}
                            item={item}
                            checked={checkedItems.has(item.id)}
                            onToggle={() => toggleChecked(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Agenda Templates ──────────────────────────── */}
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
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <FileText className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Agenda Templates</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {ONE_ON_ONE_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
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
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta, marginBottom: 4 }}>
                        {template.name}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>
                        {template.description}
                      </p>
                      <div className="flex flex-wrap" style={{ gap: 6 }}>
                        {template.items.map((agendaItem, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center bg-emerald-50 text-emerald-700 font-medium"
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `2px ${GRID.spacing.xs}px`,
                              fontSize: TYPE.caption,
                            }}
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
        </motion.div>
      </motion.div>
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
      {/* Checkbox */}
      <motion.button
        onClick={onToggle}
        className="flex-shrink-0 border-0 bg-transparent p-0"
        style={{ marginTop: 2 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        {checked ? (
          <CheckCircle2 style={{ width: 18, height: 18 }} className="text-emerald-500" />
        ) : (
          <Circle style={{ width: 18, height: 18 }} className="text-gray-300" />
        )}
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`${checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
          style={{ fontSize: TYPE.caption, marginBottom: 4 }}
        >
          {item.description}
        </p>
        <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
          {/* Owner badge */}
          <span
            className={`inline-flex items-center font-medium ${
              item.owner === 'manager'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}
            style={{
              borderRadius: RADIUS.pill,
              padding: `1px 6px`,
              fontSize: TYPE.micro,
            }}
          >
            {item.owner === 'manager' ? 'Manager' : 'Agent'}
          </span>

          {/* Due date */}
          <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
            Due {item.dueDate}
          </span>

          {/* Agent avatar (if has one) */}
          {item.agentAvatar && (
            <div
              className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold"
              style={{
                width: LAYOUT.icon.md,
                height: LAYOUT.icon.md,
                borderRadius: RADIUS.button,
                fontSize: 8,
              }}
            >
              {item.agentAvatar}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ManagerOneOnOnes;
