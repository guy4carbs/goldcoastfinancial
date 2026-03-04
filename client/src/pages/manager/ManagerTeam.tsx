/**
 * Manager Team — Team Management Page
 * Full team roster with search, status, sparklines, hover actions, and detail drawer
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_TEAM_MEMBERS, STATUS_COLORS, CERT_STATUS_COLORS, CERT_LEVEL_LABELS } from './managerConstants';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserCheck,
  Percent,
  UserPlus,
  Search,
  Lightbulb,
  Trophy,
  AlertCircle,
  Flame,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Eye,
  X,
  Phone,
  Target,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ─── SPARKLINE DATA ─────────────────────────────────────────
// 7-day call trends per agent (seeded from agent data for consistency)
const SPARKLINE_DATA: Record<string, number[]> = {
  '1': [8, 10, 9, 12, 11, 14, 12],   // Sarah — trending up
  '2': [6, 7, 8, 7, 9, 8, 9],         // Mike — stable up
  '3': [5, 6, 4, 7, 5, 6, 6],         // Emily — flat
  '4': [7, 6, 5, 4, 4, 3, 5],         // James — trending down
  '5': [3, 4, 5, 5, 6, 7, 7],         // Lisa — trending up
  '6': [7, 8, 9, 8, 10, 9, 11],       // David — trending up
  '7': [9, 10, 11, 12, 11, 13, 14],   // Rachel — trending up
  '8': [4, 3, 2, 3, 2, 1, 2],         // Carlos — trending down
  '9': [2, 2, 3, 2, 1, 0, 0],         // Anna — offline
  '10': [5, 6, 5, 7, 6, 6, 6],        // Tom — stable
  '11': [7, 8, 9, 8, 10, 9, 10],      // Jessica — trending up
  '12': [1, 1, 0, 0, 0, 0, 0],        // Ryan — offline
};

// ─── SPARKLINE SVG ──────────────────────────────────────────
function Sparkline({ data, width = 60, height = 20 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const trending = data[data.length - 1] >= data[0];
  const strokeColor = trending ? '#10b981' : '#f43f5e';

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0 hidden md:block">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r={2} fill={strokeColor} />;
      })()}
    </svg>
  );
}

// ─── DRAWER DEMO DATA ───────────────────────────────────────
// Per-agent pipeline deals (demo)
const AGENT_DEALS: Record<string, Array<{ name: string; stage: string; value: number }>> = {
  '1': [
    { name: 'Thompson Estate', stage: 'Proposal', value: 48000 },
    { name: 'Adams Corporate', stage: 'Contacted', value: 125000 },
  ],
  '2': [
    { name: 'Garcia Whole Life', stage: 'Proposal', value: 35000 },
    { name: 'Martinez Key Person', stage: 'New Lead', value: 76000 },
  ],
  '7': [
    { name: 'Williams Family IUL', stage: 'Qualified', value: 62000 },
    { name: 'Lee Estate Shield', stage: 'Proposal', value: 38000 },
  ],
};

// Recent activity per agent
const AGENT_ACTIVITY: Record<string, string[]> = {
  '1': ['Closed Thompson Estate ($48K)', 'Updated 3 pipeline deals', 'Completed advanced training module'],
  '2': ['Sent proposal to Garcia', 'Made 38 calls this week', 'Passed IUL assessment (92%)'],
  '3': ['Completed client needs module', 'Moved Nguyen to qualified', 'IUL cert expiring soon'],
  '4': ['On break — lunch', 'Made 24 calls this week', 'Annuity cert current'],
  '5': ['Started IUL Specialist Track', 'Consistent call volume improving', 'On call with Patel'],
  '6': ['Updated CRM notes for Brooks', 'Made 35 calls this week', 'Earned Whole Life Expert cert'],
  '7': ['Closed Lee Estate ($38K)', 'On call with new lead', 'Expert certification current'],
  '8': ['Offline since 11am', 'IUL cert overdue 5 days', 'Only 2 closes this month'],
  '9': ['Out of office today', 'IUL cert expiring in 12 days', 'Completed 2 modules last week'],
  '10': ['Reviewing proposals', 'Made 30 calls this week', 'Annuity cert in progress'],
  '11': ['In client presentation', 'Made 36 calls this week', 'Advanced certification current'],
  '12': ['Not logged in — 2 days', 'Basic cert overdue 14 days', 'No pipeline activity'],
};

type TeamMember = (typeof DEMO_TEAM_MEMBERS)[number];

export function ManagerTeam() {
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<TeamMember | null>(null);

  const filteredMembers = DEMO_TEAM_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Quick insight calculations
  const topPerformer = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.quota - a.quota)[0];
  const needsCoaching = [...DEMO_TEAM_MEMBERS].sort((a, b) => a.quota - b.quota)[0];
  const avgStreak = Math.round(
    DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.streak, 0) / DEMO_TEAM_MEMBERS.length,
  );

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Users}
            title="Team Management"
            subtitle="Monitor and manage your team roster"
          />
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Total Agents" />
            <ManagerStatCard
              icon={UserCheck}
              value="8"
              label="Active Today"
              trend={{ value: 2, positive: true }}
            />
            <ManagerStatCard icon={Percent} value="76%" label="Avg Quota" />
            <ManagerStatCard icon={UserPlus} value="2" label="New This Month" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
            />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-gray-200"
              style={{
                paddingLeft: GRID.spacing.xl,
                borderRadius: RADIUS.input,
                height: LAYOUT.buttonHeight,
                fontSize: TYPE.meta,
              }}
            />
          </div>
        </motion.div>

        {/* Main Content — 2-col grid: roster + insights */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Agent Roster — spans 2 cols on desktop */}
          <Card
            className="overflow-hidden border-0 lg:col-span-2"
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
                  <Users className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Agent Roster</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Table header */}
              <div
                className="flex items-center text-gray-400 font-medium hidden sm:flex"
                style={{
                  padding: `${GRID.spacing.xs}px 12px`,
                  fontSize: TYPE.caption,
                  marginBottom: GRID.spacing.xs,
                  borderBottom: `1px solid ${COLORS.gray[100]}`,
                  paddingBottom: GRID.spacing.xs,
                }}
              >
                <span style={{ width: LAYOUT.icon.xxl + 12 + 100, flexShrink: 0 }}>Agent</span>
                <span className="flex-1" />
                <span style={{ width: 80, textAlign: 'center' }}>Status</span>
                <span className="hidden md:block" style={{ width: 60, textAlign: 'center' }}>Trend</span>
                <span style={{ width: 40, textAlign: 'center' }}>Cert</span>
                <span style={{ width: 48, textAlign: 'right' }}>Quota</span>
                <span className="hidden sm:block" style={{ width: 80, textAlign: 'right' }}>Active</span>
                <span className="hidden lg:block" style={{ width: 100 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {filteredMembers.map((member) => {
                  const statusColor = STATUS_COLORS[member.status];
                  const quotaColor =
                    member.quota >= 100
                      ? 'text-emerald-600'
                      : member.quota >= 70
                        ? 'text-gray-700'
                        : 'text-red-600';
                  const sparkData = SPARKLINE_DATA[member.id] || [0, 0, 0, 0, 0, 0, 0];

                  return (
                    <motion.div
                      key={member.id}
                      className="flex items-center group cursor-pointer"
                      style={{
                        padding: 12,
                        borderRadius: RADIUS.button,
                        gap: 12,
                      }}
                      whileHover={{
                        backgroundColor: COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover },
                      }}
                      onClick={() => setSelectedAgent(member)}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.meta,
                        }}
                      >
                        {member.avatar}
                      </div>

                      {/* Name & Role */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {member.name}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {member.role}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center ${statusColor.bg} ${statusColor.text} border-0`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                          gap: GRID.spacing.xs / 2,
                          fontSize: TYPE.caption,
                          fontWeight: 500,
                        }}
                      >
                        <div
                          className={statusColor.dot}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: RADIUS.pill,
                          }}
                        />
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </div>

                      {/* Sparkline — 7-day trend */}
                      <Sparkline data={sparkData} />

                      {/* Certification Level */}
                      <div
                        className={`items-center hidden sm:flex border-0 ${CERT_STATUS_COLORS[member.certStatus].bg} ${CERT_STATUS_COLORS[member.certStatus].text}`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                          fontSize: TYPE.caption,
                          fontWeight: 500,
                          gap: 4,
                        }}
                      >
                        L{member.certLevel}
                      </div>

                      {/* Quota */}
                      <div className="text-right" style={{ minWidth: 48 }}>
                        <p className={`font-semibold ${quotaColor}`} style={{ fontSize: TYPE.meta }}>
                          {member.quota}%
                        </p>
                      </div>

                      {/* Last Active */}
                      <div className="text-right hidden sm:block" style={{ minWidth: 80 }}>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                          {member.lastActive}
                        </p>
                      </div>

                      {/* Hover Quick-Action Buttons */}
                      <div
                        className="hidden lg:flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ gap: GRID.spacing.xs / 2 }}
                      >
                        <Link href="/manager/coaching">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                            style={{
                              width: LAYOUT.icon.xl,
                              height: LAYOUT.icon.xl,
                              borderRadius: RADIUS.button,
                            }}
                            title="Coach"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                          </motion.button>
                        </Link>
                        <Link href="/manager/one-on-ones">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                            style={{
                              width: LAYOUT.icon.xl,
                              height: LAYOUT.icon.xl,
                              borderRadius: RADIUS.button,
                            }}
                            title="Schedule 1:1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                          </motion.button>
                        </Link>
                        <Link href={`/manager/scorecard/${member.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: COLORS.gray[100] }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center text-gray-500 hover:text-emerald-600"
                            style={{
                              width: LAYOUT.icon.xl,
                              height: LAYOUT.icon.xl,
                              borderRadius: RADIUS.button,
                            }}
                            title="View Scorecard"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div
                    className="text-center text-gray-400"
                    style={{ padding: GRID.spacing.xl, fontSize: TYPE.meta }}
                  >
                    No team members match your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights Panel */}
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
                  <Lightbulb className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Quick Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Top Performer */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Trophy
                      className="text-amber-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Top Performer
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {topPerformer.name}
                  </p>
                  <p className="text-emerald-600 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {topPerformer.quota}% quota
                  </p>
                </div>

                {/* Needs Coaching */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <AlertCircle
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Needs Coaching
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {needsCoaching.name}
                  </p>
                  <p className="text-red-600 font-semibold" style={{ fontSize: TYPE.meta }}>
                    {needsCoaching.quota}% quota
                  </p>
                </div>

                {/* Team Avg Streak */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Flame
                      className="text-orange-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Avg Streak
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {avgStreak} days
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                    Team average activity streak
                  </p>
                </div>

                {/* Compliance Alert */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: 'rgba(254,202,202,0.15)',
                    border: '1px solid rgba(254,202,202,0.3)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <ShieldAlert
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Compliance Alert
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'overdue').length} overdue, {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'expiring').length} expiring
                  </p>
                  <p className="text-red-600 font-medium" style={{ fontSize: TYPE.meta }}>
                    Certifications need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ─── AGENT DETAIL DRAWER ─── */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.transition }}
              className="fixed inset-0 z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setSelectedAgent(null)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
              style={{
                width: 480,
                maxWidth: '100vw',
                backgroundColor: '#ffffff',
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Drawer Header — Gradient */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                  padding: GRID.spacing.md,
                }}
              >
                {/* Blobs */}
                <div style={{ width: 120, height: 120 }} className="absolute top-0 right-0 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
                <div style={{ width: 80, height: 80 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />

                {/* Close button */}
                <motion.button
                  onClick={() => setSelectedAgent(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                  style={{
                    top: GRID.spacing.sm,
                    right: GRID.spacing.sm,
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                </motion.button>

                {/* Agent header */}
                <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.md }}>
                  <div
                    className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur flex-shrink-0"
                    style={{
                      width: GRID.spacing.xxxl,
                      height: GRID.spacing.xxxl,
                      borderRadius: RADIUS.card,
                      fontSize: TYPE.title,
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>
                      {selectedAgent.name}
                    </h2>
                    <p className="text-white/80" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.role}
                    </p>
                    <div className="flex items-center mt-1" style={{ gap: GRID.spacing.xs }}>
                      <div
                        className={STATUS_COLORS[selectedAgent.status].dot}
                        style={{ width: 8, height: 8, borderRadius: RADIUS.pill }}
                      />
                      <span className="text-white/70" style={{ fontSize: TYPE.caption }}>
                        {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)} · {selectedAgent.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Content */}
              <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

                {/* KPI Mini-Cards */}
                <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                  {[
                    { icon: Target, label: 'Quota', value: `${selectedAgent.quota}%`, color: selectedAgent.quota >= 100 ? 'text-emerald-600' : selectedAgent.quota >= 70 ? 'text-gray-900' : 'text-red-600' },
                    { icon: Phone, label: 'Calls/Week', value: String(selectedAgent.calls), color: 'text-gray-900' },
                    { icon: DollarSign, label: 'Revenue', value: `$${(selectedAgent.revenue / 1000).toFixed(1)}K`, color: 'text-gray-900' },
                    { icon: Flame, label: 'Streak', value: `${selectedAgent.streak} days`, color: selectedAgent.streak >= 5 ? 'text-emerald-600' : 'text-gray-900' },
                  ].map((kpi) => {
                    const KpiIcon = kpi.icon;
                    return (
                      <div
                        key={kpi.label}
                        style={{
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: COLORS.gray[50],
                        }}
                      >
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2, marginBottom: 4 }}>
                          <KpiIcon className="text-gray-400" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                          <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{kpi.label}</span>
                        </div>
                        <p className={`font-bold ${kpi.color}`} style={{ fontSize: TYPE.title }}>{kpi.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Call Trend Sparkline (larger) */}
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                    7-Day Call Trend
                  </p>
                  <svg width="100%" height={40} viewBox="0 0 400 40" preserveAspectRatio="none">
                    {(() => {
                      const data = SPARKLINE_DATA[selectedAgent.id] || [0, 0, 0, 0, 0, 0, 0];
                      const max = Math.max(...data, 1);
                      const min = Math.min(...data);
                      const range = max - min || 1;
                      const trending = data[data.length - 1] >= data[0];
                      const color = trending ? '#10b981' : '#f43f5e';

                      const points = data.map((v, i) => {
                        const x = (i / (data.length - 1)) * 400;
                        const y = 40 - ((v - min) / range) * 32 - 4;
                        return `${x},${y}`;
                      }).join(' ');

                      const areaPoints = `0,40 ${points} 400,40`;

                      return (
                        <>
                          <defs>
                            <linearGradient id={`sparkGrad-${selectedAgent.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <polygon points={areaPoints} fill={`url(#sparkGrad-${selectedAgent.id})`} />
                          <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between" style={{ marginTop: 4 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                      <span key={d} className="text-gray-400" style={{ fontSize: TYPE.micro }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                    >
                      <Zap className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Recent Activity</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {(AGENT_ACTIVITY[selectedAgent.id] || ['No recent activity']).map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start"
                        style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px 0` }}
                      >
                        <div
                          className="bg-emerald-500 flex-shrink-0"
                          style={{ width: 6, height: 6, borderRadius: RADIUS.pill, marginTop: 6 }}
                        />
                        <p className="text-gray-700" style={{ fontSize: TYPE.meta }}>{activity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Deals */}
                {AGENT_DEALS[selectedAgent.id] && (
                  <div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                      >
                        <Target className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                      </div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Active Deals</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {AGENT_DEALS[selectedAgent.id].map((deal, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                          style={{
                            padding: GRID.spacing.sm,
                            borderRadius: RADIUS.button,
                            backgroundColor: COLORS.gray[50],
                          }}
                        >
                          <div>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{deal.name}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{deal.stage}</p>
                          </div>
                          <p className="font-bold text-gray-900" style={{ fontSize: TYPE.meta }}>
                            ${(deal.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certification & Training */}
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                    >
                      <GraduationCap className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Certification & Training</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Cert Level</span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {CERT_LEVEL_LABELS[selectedAgent.certLevel]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Status</span>
                      <span
                        className={`font-semibold ${CERT_STATUS_COLORS[selectedAgent.certStatus].text}`}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {selectedAgent.certStatus.charAt(0).toUpperCase() + selectedAgent.certStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Modules</span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {selectedAgent.modulesCompleted} / {selectedAgent.modulesTotal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                      <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Avg Assessment</span>
                      <span
                        className={`font-semibold ${selectedAgent.assessmentAvg >= 80 ? 'text-emerald-600' : selectedAgent.assessmentAvg >= 60 ? 'text-amber-600' : 'text-red-600'}`}
                        style={{ fontSize: TYPE.meta }}
                      >
                        {selectedAgent.assessmentAvg}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                  <Link href="/manager/coaching">
                    <motion.button
                      className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                      style={{
                        fontSize: TYPE.meta,
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Schedule Coaching Session
                    </motion.button>
                  </Link>
                  <Link href="/manager/one-on-ones">
                    <motion.button
                      className="flex items-center justify-center font-semibold text-emerald-700 border w-full"
                      style={{
                        fontSize: TYPE.meta,
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        borderColor: COLORS.gray[200],
                        backgroundColor: 'white',
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Schedule 1:1 Meeting
                    </motion.button>
                  </Link>
                  <Link href={`/manager/scorecard/${selectedAgent.id}`}>
                    <motion.button
                      className="flex items-center justify-center font-semibold text-gray-700 border w-full"
                      style={{
                        fontSize: TYPE.meta,
                        gap: GRID.spacing.xs,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        borderColor: COLORS.gray[200],
                        backgroundColor: 'white',
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      View Full Scorecard
                      <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

export default ManagerTeam;
