/**
 * Executive Call Monitoring
 * Real-time call activity and agent performance analytics
 *
 * Heritage Design System — Orange/Blood Orange theme
 * - 8-point modular grid compliance
 * - Apple-style motion curves
 * - Glass material effects (liquid glass)
 * - Framer Motion animations
 */

import { motion } from 'framer-motion';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Activity,
  Clock,
  Users,
  BarChart3,
} from 'lucide-react';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { Card, CardContent } from '@/components/ui/card';
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
  scaleIn,
} from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from './executiveConstants';

// ─── DEMO DATA ───────────────────────────────────────

type CallStatus = 'active' | 'on-hold' | 'completed' | 'missed';
type CallType = 'inbound' | 'outbound';

interface CallRecord {
  id: string;
  agentName: string;
  clientName: string;
  duration: string;
  status: CallStatus;
  type: CallType;
  timestamp: string;
}

const DEMO_CALLS: CallRecord[] = [
  { id: 'c1', agentName: 'Sarah Johnson', clientName: 'Robert Williams', duration: '4:32', status: 'active', type: 'inbound', timestamp: '2:47 PM' },
  { id: 'c2', agentName: 'Mike Chen', clientName: 'Patricia Davis', duration: '12:05', status: 'active', type: 'outbound', timestamp: '2:35 PM' },
  { id: 'c3', agentName: 'Rachel Green', clientName: 'James Anderson', duration: '2:18', status: 'on-hold', type: 'inbound', timestamp: '2:44 PM' },
  { id: 'c4', agentName: 'David Brown', clientName: 'Linda Martinez', duration: '8:42', status: 'completed', type: 'outbound', timestamp: '2:22 PM' },
  { id: 'c5', agentName: 'Jessica Lee', clientName: 'Thomas Wilson', duration: '15:03', status: 'completed', type: 'inbound', timestamp: '2:10 PM' },
  { id: 'c6', agentName: 'Marcus Rivera', clientName: 'Barbara Taylor', duration: '0:00', status: 'missed', type: 'inbound', timestamp: '2:38 PM' },
  { id: 'c7', agentName: 'Emily Carter', clientName: 'Richard Thomas', duration: '6:17', status: 'completed', type: 'outbound', timestamp: '1:55 PM' },
  { id: 'c8', agentName: 'Alex Nguyen', clientName: 'Susan Jackson', duration: '3:45', status: 'active', type: 'inbound', timestamp: '2:49 PM' },
];

interface AgentCallPerformance {
  name: string;
  callsToday: number;
  avgDuration: string;
  answerRate: string;
  totalTalkTime: string;
}

const DEMO_AGENT_PERFORMANCE: AgentCallPerformance[] = [
  { name: 'Sarah Johnson', callsToday: 42, avgDuration: '7:15', answerRate: '97.6%', totalTalkTime: '5h 04m' },
  { name: 'Mike Chen', callsToday: 38, avgDuration: '9:22', answerRate: '95.1%', totalTalkTime: '5h 55m' },
  { name: 'Rachel Green', callsToday: 35, avgDuration: '8:48', answerRate: '94.3%', totalTalkTime: '5h 08m' },
  { name: 'David Brown', callsToday: 31, avgDuration: '6:33', answerRate: '93.5%', totalTalkTime: '3h 23m' },
  { name: 'Jessica Lee', callsToday: 29, avgDuration: '10:14', answerRate: '96.6%', totalTalkTime: '4h 57m' },
  { name: 'Emily Carter', callsToday: 27, avgDuration: '8:05', answerRate: '92.6%', totalTalkTime: '3h 38m' },
];

interface HourlyCallData {
  hour: string;
  count: number;
}

const DEMO_HOURLY_CALLS: HourlyCallData[] = [
  { hour: '9 AM', count: 32 },
  { hour: '10 AM', count: 45 },
  { hour: '11 AM', count: 52 },
  { hour: '12 PM', count: 38 },
  { hour: '1 PM', count: 41 },
  { hour: '2 PM', count: 48 },
  { hour: '3 PM', count: 44 },
  { hour: '4 PM', count: 35 },
];

const MAX_HOURLY = Math.max(...DEMO_HOURLY_CALLS.map((h) => h.count));

// ─── STATUS HELPERS ──────────────────────────────────

const STATUS_COLORS: Record<CallStatus, string> = {
  active: '#10b981',
  'on-hold': '#f59e0b',
  completed: '#78716c',
  missed: '#ef4444',
};

const STATUS_LABELS: Record<CallStatus, string> = {
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  missed: 'Missed',
};

// ─── COMPONENT ───────────────────────────────────────

export function ExecutiveCallMonitoring() {
  return (
    <ExecutiveLoungeLayout>
      {/* ─── HERO ─── */}
      <ExecutivePageHero
        title="Call Monitoring"
        subtitle="Real-time call activity and agent performance analytics"
        icon={Phone}
      />

      {/* ─── CONTENT SECTIONS ─── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg, marginTop: GRID.spacing.lg }}
      >
        {/* ─── A) LIVE CALL FEED ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...GLASS.css.light,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent style={{ padding: GRID.spacing.md }}>
              {/* Section header */}
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xxl,
                      height: LAYOUT.icon.xxl,
                      borderRadius: RADIUS.button,
                      background: EXECUTIVE_GRADIENT_CSS,
                    }}
                  >
                    <Activity style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                  </div>
                  <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                    Live Call Feed
                  </h2>
                </div>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: '#10b981' }}
                  />
                  <span className="text-emerald-600 font-medium" style={{ fontSize: TYPE.caption }}>Live</span>
                </div>
              </div>

              {/* Table header (desktop) */}
              <div
                className="hidden md:grid items-center text-stone-500 font-medium border-b"
                style={{
                  gridTemplateColumns: '24px 1fr 1fr 64px 90px 80px 64px',
                  fontSize: TYPE.caption,
                  paddingBottom: GRID.spacing.sm,
                  borderColor: COLORS.gray[200],
                  gap: GRID.spacing.sm,
                }}
              >
                <span />
                <span>Agent</span>
                <span>Client</span>
                <span className="text-right">Duration</span>
                <span>Type</span>
                <span>Status</span>
                <span className="text-right">Time</span>
              </div>

              {/* Call rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {DEMO_CALLS.map((call) => (
                  <motion.div
                    key={call.id}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="flex md:grid items-center border-b last:border-b-0"
                    style={{
                      gridTemplateColumns: '24px 1fr 1fr 64px 90px 80px 64px',
                      padding: `${GRID.spacing.sm}px 0`,
                      borderColor: COLORS.gray[100],
                      gap: GRID.spacing.sm,
                    }}
                  >
                    {/* Status dot */}
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 24 }}>
                      {call.status === 'active' ? (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: RADIUS.pill,
                            backgroundColor: STATUS_COLORS.active,
                            boxShadow: `0 0 8px ${STATUS_COLORS.active}`,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: RADIUS.pill,
                            backgroundColor: STATUS_COLORS[call.status],
                          }}
                        />
                      )}
                    </div>

                    {/* Agent name */}
                    <div className="flex-1 md:flex-none" style={{ minWidth: 0 }}>
                      <p className="font-medium text-stone-900 truncate" style={{ fontSize: TYPE.meta }}>
                        {call.agentName}
                      </p>
                    </div>

                    {/* Client name */}
                    <div className="hidden md:block" style={{ minWidth: 0 }}>
                      <p className="text-stone-600 truncate" style={{ fontSize: TYPE.meta }}>
                        {call.clientName}
                      </p>
                    </div>

                    {/* Duration */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {call.duration}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="hidden md:block" style={{ flexShrink: 0 }}>
                      <span
                        className="inline-flex items-center font-medium"
                        style={{
                          fontSize: TYPE.micro,
                          padding: '2px 8px',
                          borderRadius: RADIUS.pill,
                          gap: 4,
                          backgroundColor: call.type === 'inbound' ? '#eff6ff' : '#f0fdf4',
                          color: call.type === 'inbound' ? '#2563eb' : '#059669',
                        }}
                      >
                        {call.type === 'inbound' ? (
                          <PhoneIncoming style={{ width: 10, height: 10 }} />
                        ) : (
                          <PhoneOutgoing style={{ width: 10, height: 10 }} />
                        )}
                        {call.type === 'inbound' ? 'Inbound' : 'Outbound'}
                      </span>
                    </div>

                    {/* Status label */}
                    <div style={{ flexShrink: 0 }}>
                      <span
                        className="inline-flex items-center font-medium"
                        style={{
                          fontSize: TYPE.micro,
                          padding: '2px 8px',
                          borderRadius: RADIUS.pill,
                          color: STATUS_COLORS[call.status],
                          backgroundColor:
                            call.status === 'active'
                              ? '#ecfdf5'
                              : call.status === 'on-hold'
                                ? '#fffbeb'
                                : call.status === 'missed'
                                  ? '#fef2f2'
                                  : COLORS.gray[100],
                        }}
                      >
                        {STATUS_LABELS[call.status]}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="hidden md:block" style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="text-stone-400" style={{ fontSize: TYPE.caption }}>
                        {call.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── B) CALL METRICS GRID ─── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Phone}
              value="247"
              label="Total Calls Today"
              delta={12}
              periodLabel="vs yesterday"
            />
            <ExecutiveStatCard
              icon={Clock}
              value="8:42"
              label="Avg Duration"
              delta={-3}
              periodLabel="vs last week"
            />
            <ExecutiveStatCard
              icon={PhoneIncoming}
              value="94.2%"
              label="Answer Rate"
              delta={2.1}
              periodLabel="vs last week"
            />
            <ExecutiveStatCard
              icon={Users}
              value="3"
              label="Calls in Queue"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ─── C) AGENT CALL PERFORMANCE ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...GLASS.css.light,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent style={{ padding: GRID.spacing.md }}>
              {/* Section header */}
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    background: EXECUTIVE_GRADIENT_CSS,
                  }}
                >
                  <Users style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                </div>
                <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                  Agent Call Performance
                </h2>
              </div>

              {/* Table — horizontally scrollable on mobile */}
              <div className="overflow-x-auto" style={{ minWidth: 0 }}>
                <div style={{ minWidth: 480 }}>
                  {/* Table Header */}
                  <div
                    className="grid items-center text-stone-500 font-medium border-b"
                    style={{
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      fontSize: TYPE.caption,
                      paddingBottom: GRID.spacing.sm,
                      borderColor: COLORS.gray[200],
                    }}
                  >
                    <span>Agent</span>
                    <span className="text-right">Calls Today</span>
                    <span className="text-right">Avg Duration</span>
                    <span className="text-right">Answer Rate</span>
                    <span className="text-right">Total Talk Time</span>
                  </div>

                  {/* Table Rows */}
                  {DEMO_AGENT_PERFORMANCE.map((agent) => (
                    <motion.div
                      key={agent.name}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="grid items-center border-b last:border-b-0"
                      style={{
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                        padding: `${GRID.spacing.sm}px 0`,
                        borderColor: COLORS.gray[100],
                      }}
                    >
                      <p className="font-medium text-stone-900" style={{ fontSize: TYPE.meta }}>
                        {agent.name}
                      </p>
                      <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {agent.callsToday}
                      </span>
                      <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {agent.avgDuration}
                      </span>
                      <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {agent.answerRate}
                      </span>
                      <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {agent.totalTalkTime}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── D) CALL DISTRIBUTION BY HOUR ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden"
            style={{
              ...GLASS.css.light,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent style={{ padding: GRID.spacing.md }}>
              {/* Section header */}
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    background: EXECUTIVE_GRADIENT_CSS,
                  }}
                >
                  <BarChart3 style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                </div>
                <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                  Call Distribution by Hour
                </h2>
              </div>

              {/* Horizontal bar chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DEMO_HOURLY_CALLS.map((slot, index) => (
                  <div key={slot.hour}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span className="font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                        {slot.hour}
                      </span>
                      <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                        {slot.count} calls
                      </span>
                    </div>
                    <div
                      className="overflow-hidden"
                      style={{ height: 8, backgroundColor: COLORS.gray[100], borderRadius: RADIUS.pill }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(slot.count / MAX_HOURLY) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.05, ease: MOTION.easing }}
                        style={{
                          height: '100%',
                          background: EXECUTIVE_GRADIENT_CSS,
                          borderRadius: RADIUS.pill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveCallMonitoring;
