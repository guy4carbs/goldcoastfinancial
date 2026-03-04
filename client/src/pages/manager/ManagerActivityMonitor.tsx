/**
 * Manager Activity Monitor — Live Activity Monitor Page
 * Real-time team activity and engagement tracking
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_AGENT_ACTIVITY,
  ACTIVITY_STATUS_COLORS,
  DEMO_LIVE_FEED,
  DEMO_ACTIVITY_HEATMAP,
} from './managerConstants';
import type { AgentActivityStatus } from './managerConstants';
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
import {
  Activity,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';

// ─── STATUS FILTER OPTIONS ───
type FilterStatus = 'all' | AgentActivityStatus;

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on_call', label: 'On Call' },
  { key: 'available', label: 'Available' },
  { key: 'meeting', label: 'In Meeting' },
  { key: 'break', label: 'On Break' },
  { key: 'offline', label: 'Offline' },
];

// ─── HEATMAP CONSTANTS ───
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HEATMAP_HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];

// ─── LIVE FEED TYPE COLORS ───
const FEED_TYPE_COLORS: Record<string, string> = {
  call: 'bg-emerald-500',
  close: 'bg-amber-500',
  email: 'bg-blue-500',
  appointment: 'bg-violet-500',
  update: 'bg-gray-400',
};

export function ManagerActivityMonitor() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

  // Filter agents by selected status
  const filteredAgents =
    activeFilter === 'all'
      ? DEMO_AGENT_ACTIVITY
      : DEMO_AGENT_ACTIVITY.filter((a) => a.status === activeFilter);

  // Count agents by status for the team summary bar
  const statusCounts = DEMO_AGENT_ACTIVITY.reduce<Record<AgentActivityStatus, number>>(
    (acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1;
      return acc;
    },
    { on_call: 0, available: 0, meeting: 0, break: 0, offline: 0 },
  );
  const totalAgents = DEMO_AGENT_ACTIVITY.length;

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ─── HERO ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Activity}
            title="Activity Monitor"
            subtitle="Real-time team activity and engagement tracking"
            badge={
              <div
                className="flex items-center"
                style={{
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: RADIUS.pill,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: RADIUS.pill,
                    background: '#4ade80',
                    boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)',
                  }}
                />
                <span
                  className="font-semibold text-white"
                  style={{ fontSize: TYPE.caption }}
                >
                  Live
                </span>
              </div>
            }
          />
        </motion.div>

        {/* ─── STAT CARDS ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Phone} value="285" label="Calls Today" />
            <ManagerStatCard icon={Mail} value="94" label="Emails Sent" />
            <ManagerStatCard icon={Calendar} value="18" label="Appointments" />
            <ManagerStatCard icon={Clock} value="6.2 hrs" label="Avg Active Time" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ─── STATUS FILTER PILLS ─── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {STATUS_FILTERS.map(({ key, label }) => {
            const isActive = activeFilter === key;
            const statusColor = key !== 'all' ? ACTIVITY_STATUS_COLORS[key] : null;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: MOTION.duration.hover }}
                onClick={() => setActiveFilter(key)}
                className="font-medium"
                style={{
                  fontSize: TYPE.meta,
                  padding: '6px 16px',
                  borderRadius: RADIUS.pill,
                  border: isActive ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
                  background: isActive
                    ? statusColor
                      ? undefined
                      : 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? 'white' : COLORS.gray[600],
                  cursor: 'pointer',
                }}
              >
                {isActive && statusColor && (
                  <span
                    className={`inline-block ${statusColor.dot}`}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      marginRight: 6,
                      background: isActive ? 'white' : undefined,
                    }}
                  />
                )}
                {label}
                {key !== 'all' && (
                  <span
                    className="ml-1"
                    style={{ opacity: 0.7 }}
                  >
                    ({statusCounts[key as AgentActivityStatus] || 0})
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ─── GOLDEN RATIO 2-COL GRID ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ═══ LEFT COLUMN (1.618fr) ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ─── AGENT ACTIVITY GRID ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <Users className="text-amber-200" style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Agent Activity
                    </h3>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      {filteredAgents.length} agents shown
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"
                  style={{ gap: GRID.spacing.sm }}
                >
                  {filteredAgents.map((agent) => {
                    const statusStyle = ACTIVITY_STATUS_COLORS[agent.status];
                    return (
                      <motion.div
                        key={agent.id}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          borderRadius: RADIUS.button,
                          boxShadow: SHADOW.card,
                          padding: GRID.spacing.sm,
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                      >
                        {/* Avatar + Name + Status */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                          {/* Avatar */}
                          <div
                            className="bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                            }}
                          >
                            <span className="text-white font-bold" style={{ fontSize: TYPE.meta }}>
                              {agent.avatar}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {agent.name.split(' ')[0]}
                            </p>
                            <div className="flex items-center" style={{ gap: 4 }}>
                              {agent.status === 'on_call' ? (
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                  className={statusStyle.dot}
                                  style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                                />
                              ) : (
                                <div
                                  className={statusStyle.dot}
                                  style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                                />
                              )}
                              <span className={statusStyle.text} style={{ fontSize: TYPE.caption }}>
                                {statusStyle.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Micro-counts */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: 6 }}>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Phone className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.calls}
                            </span>
                          </div>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Mail className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.emails}
                            </span>
                          </div>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Calendar className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.meetings}
                            </span>
                          </div>
                        </div>

                        {/* Last action */}
                        <p
                          className="text-gray-500 truncate"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {agent.lastAction}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ─── ACTIVITY HEATMAP ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                <div
                  className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <Activity className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Activity Heatmap
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Team activity intensity by day and hour
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 400 }}>
                  {/* Hour labels */}
                  <div className="flex" style={{ paddingLeft: 40, marginBottom: 4 }}>
                    {HEATMAP_HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="text-center text-gray-400 font-medium"
                        style={{ flex: 1, fontSize: TYPE.micro }}
                      >
                        {hour}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {DEMO_ACTIVITY_HEATMAP.map((row, dayIdx) => (
                    <div key={dayIdx} className="flex items-center" style={{ gap: 4, marginBottom: 4 }}>
                      {/* Day label */}
                      <div
                        className="text-gray-500 font-medium text-right flex-shrink-0"
                        style={{ width: 36, fontSize: TYPE.caption }}
                      >
                        {HEATMAP_DAYS[dayIdx]}
                      </div>
                      {/* Cells */}
                      <div className="flex flex-1" style={{ gap: 3 }}>
                        {row.map((value, hourIdx) => {
                          const opacity = Math.max(0.08, value / 18);
                          const isHovered =
                            hoveredCell?.day === dayIdx && hoveredCell?.hour === hourIdx;
                          return (
                            <div
                              key={hourIdx}
                              className="relative"
                              style={{ flex: 1 }}
                              onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  paddingTop: '100%',
                                  borderRadius: 4,
                                  background: `rgba(16, 185, 129, ${opacity})`,
                                  border: isHovered
                                    ? '2px solid #059669'
                                    : '1px solid rgba(0, 0, 0, 0.04)',
                                  cursor: 'pointer',
                                  transition: 'border 0.15s ease',
                                }}
                              />
                              {/* Tooltip */}
                              {isHovered && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '110%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: COLORS.gray[800],
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: RADIUS.input,
                                    fontSize: TYPE.micro,
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                    boxShadow: SHADOW.level3,
                                  }}
                                >
                                  {HEATMAP_DAYS[dayIdx]} {HEATMAP_HOURS[hourIdx]}: {value} activities
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div
                className="flex items-center justify-end"
                style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.sm }}
              >
                <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>Less</span>
                {[0.08, 0.2, 0.4, 0.6, 0.85].map((op, i) => (
                  <div
                    key={i}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: `rgba(16, 185, 129, ${op})`,
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                    }}
                  />
                ))}
                <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>More</span>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN (1fr) ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ─── LIVE ACTIVITY FEED ─── */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: RADIUS.hero,
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                boxShadow: SHADOW.hero,
                padding: GRID.spacing.md,
              }}
            >
              {/* Fibonacci blobs */}
              <div
                className="absolute bg-amber-400/15 rounded-full blur-2xl"
                style={{ width: 89, height: 89, top: -20, right: -10 }}
              />
              <div
                className="absolute bg-white/10 rounded-full blur-xl"
                style={{ width: 55, height: 55, bottom: 40, left: -15 }}
              />
              <div
                className="absolute bg-teal-300/15 rounded-full blur-lg"
                style={{ width: 34, height: 34, top: '60%', right: '30%' }}
              />

              <div className="relative z-10">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: GRID.spacing.sm }}
                >
                  <h3 className="font-bold text-white" style={{ fontSize: TYPE.title }}>
                    Live Activity Feed
                  </h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {DEMO_LIVE_FEED.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Number(item.id) * 0.06, duration: MOTION.duration.normal }}
                      className="flex items-start"
                      style={{ gap: GRID.spacing.xs }}
                    >
                      {/* Avatar */}
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-white font-bold" style={{ fontSize: TYPE.caption }}>
                          {item.avatar}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-white/95 leading-snug"
                          style={{ fontSize: TYPE.meta }}
                        >
                          <span className="font-semibold">{item.agent.split(' ')[0]}</span>{' '}
                          <span className="text-white/80">
                            {item.action.replace(item.agent, '').trim()}
                          </span>
                        </p>
                        <div
                          className="flex items-center"
                          style={{ gap: 6, marginTop: 2 }}
                        >
                          <div
                            className={FEED_TYPE_COLORS[item.type] || 'bg-gray-400'}
                            style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                          />
                          <span className="text-white/60" style={{ fontSize: TYPE.caption }}>
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── TEAM STATUS SUMMARY ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                <div
                  className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <Users className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Team Status Summary
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {totalAgents} team members
                  </p>
                </div>
              </div>

              {/* Stacked bar */}
              <div
                className="flex overflow-hidden"
                style={{
                  height: GRID.spacing.lg,
                  borderRadius: RADIUS.button,
                  marginBottom: GRID.spacing.sm,
                }}
              >
                {(Object.entries(statusCounts) as [AgentActivityStatus, number][]).map(
                  ([status, count]) => {
                    if (count === 0) return null;
                    const pct = (count / totalAgents) * 100;
                    const colors = ACTIVITY_STATUS_COLORS[status];
                    return (
                      <motion.div
                        key={status}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: MOTION.duration.slow, ease: MOTION.easing }}
                        className={`${colors.dot} relative group`}
                        style={{ height: '100%' }}
                        title={`${colors.label}: ${count}`}
                      >
                        {pct > 12 && (
                          <span
                            className="absolute inset-0 flex items-center justify-center text-white font-bold"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {count}
                          </span>
                        )}
                      </motion.div>
                    );
                  },
                )}
              </div>

              {/* Legend */}
              <div
                className="grid grid-cols-2"
                style={{ gap: GRID.spacing.xs }}
              >
                {(Object.entries(statusCounts) as [AgentActivityStatus, number][]).map(
                  ([status, count]) => {
                    const colors = ACTIVITY_STATUS_COLORS[status];
                    return (
                      <div key={status} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <div
                          className={colors.dot}
                          style={{ width: 10, height: 10, borderRadius: RADIUS.pill, flexShrink: 0 }}
                        />
                        <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>
                          {colors.label}
                        </span>
                        <span className="font-semibold text-gray-900 ml-auto" style={{ fontSize: TYPE.caption }}>
                          {count}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerActivityMonitor;
