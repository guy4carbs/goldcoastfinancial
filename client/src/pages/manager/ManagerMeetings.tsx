/**
 * Manager Team Meetings
 * Schedule, manage, and track team meetings
 * Heritage Design System — Emerald theme
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { DEMO_MEETINGS } from './managerConstants';
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
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Users,
  FileText,
  Plus,
} from 'lucide-react';

/* ── Meeting type badge colors ─────────────────────────────── */
const MEETING_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  recurring: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  training: { bg: 'bg-violet-100', text: 'text-violet-700' },
};

/* ── Demo Past Meetings with Notes ─────────────────────────── */
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

export function ManagerMeetings() {
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
          icon={Calendar}
          title="Team Meetings"
          subtitle="Plan, schedule, and track team meetings"
        >
          {/* Schedule Meeting glass button */}
          <motion.button
            className="flex items-center bg-white/20 backdrop-blur text-white border border-white/20 font-semibold"
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
            Schedule Meeting
          </motion.button>
        </ManagerPageHero>

        {/* ── Stat Cards (3-col) ───────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid className="grid-cols-2 lg:grid-cols-3">
            <ManagerStatCard icon={CalendarDays} value={4} label="Upcoming" />
            <ManagerStatCard icon={CalendarCheck} value={2} label="This Week" />
            <ManagerStatCard
              icon={CheckSquare}
              value={7}
              label="Action Items"
              trend={{ value: 3, positive: true, label: 'resolved' }}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Two-Column Content ───────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Left: Upcoming Meetings */}
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
                  <CalendarDays className="w-5 h-5 text-amber-200" />
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
                        <p className="text-sm font-semibold text-gray-900">{meeting.date}</p>
                        <p className="text-xs text-gray-400">{meeting.time}</p>
                      </div>

                      {/* Title + attendees */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
                        <div className="flex items-center text-xs text-gray-500" style={{ gap: GRID.spacing.xs / 2 }}>
                          <Users style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                          <span>{meeting.attendees} attendees</span>
                        </div>
                      </div>

                      {/* Type badge */}
                      <span
                        className={`inline-flex items-center text-xs font-medium ${typeColor.bg} ${typeColor.text}`}
                        style={{
                          borderRadius: RADIUS.pill,
                          border: 0,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        }}
                      >
                        {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right: Meeting Notes */}
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
                  <FileText className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Meeting Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_PAST_MEETINGS.map((pm, idx) => (
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
                    {/* Title + date */}
                    <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                      <p className="text-sm font-semibold text-gray-900">{pm.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{pm.date}</span>
                    </div>

                    {/* Takeaways */}
                    <ul style={{ paddingLeft: 12, marginBottom: GRID.spacing.xs }}>
                      {pm.takeaways.map((t, ti) => (
                        <li key={ti} className="text-xs text-gray-600" style={{ lineHeight: 1.6 }}>
                          {t}
                        </li>
                      ))}
                    </ul>

                    {/* Action items */}
                    <div style={{ marginTop: GRID.spacing.xs }}>
                      {pm.actionItems.map((ai, aidx) => (
                        <div
                          key={aidx}
                          className="flex items-center text-xs text-gray-500"
                          style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs / 2 }}
                        >
                          <div
                            className="border-2 border-emerald-400 flex-shrink-0"
                            style={{
                              width: LAYOUT.icon.xs,
                              height: LAYOUT.icon.xs,
                              borderRadius: 3,
                            }}
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
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerMeetings;
