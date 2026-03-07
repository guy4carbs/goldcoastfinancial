/**
 * Manager Dashboard
 * Team performance overview and key metrics
 * Heritage Design System — Emerald theme with gold accents
 *
 * Mirrors Agent Dashboard flow:
 * Hero → Quick Actions → Stats → Golden Ratio Content Grid
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { useAgentStore } from '@/lib/agentStore';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  FileBarChart,
  MessageSquare,
  Zap,
  Phone,
  Clock,
  CheckCircle,
  ArrowRight,
  Trophy,
  BookOpen,
  ShieldCheck,
  LineChart,
  UserCheck,
  Sparkles,
  Activity,
  X,
  Bell,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PieChart, Pie } from 'recharts';
import {
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  COLORS,
  fadeInUp,
  staggerContainer,
  staggerCards,
  GRID,
  LAYOUT,
  GLASS,
} from '@/lib/heritageDesignSystem';
import {
  MANAGER_GRADIENT_CSS,
  DEMO_TEAM_MEMBERS,
  SPARKLINE_TEAM_SIZE,
  SPARKLINE_PIPELINE,
  SPARKLINE_REVENUE,
  SPARKLINE_WIN_RATE,
} from './managerConstants';

// Quick action items for manager (reduced from 8 to 4 per AXIOM UX review)
const QUICK_ACTIONS = [
  { icon: Target, label: 'Pipeline', href: '/manager/pipeline', gradient: 'from-emerald-500 to-emerald-700', shadowColor: 'shadow-emerald-500/25' },
  { icon: GraduationCap, label: 'Development', href: '/manager/development', gradient: 'from-rose-400 to-rose-500', shadowColor: 'shadow-rose-400/25' },
  { icon: AlertTriangle, label: 'Escalations', href: '/manager/escalations', gradient: 'from-emerald-500 to-emerald-700', shadowColor: 'shadow-emerald-500/25' },
  { icon: FileBarChart, label: 'Reports', href: '/manager/reports', gradient: 'from-rose-400 to-rose-500', shadowColor: 'shadow-rose-400/25' },
];

// AI-surfaced coaching moments
const COACHING_INSIGHTS = [
  { agent: 'Carlos Martinez', avatar: 'CM', trigger: '3 consecutive lost deals in 2 weeks', action: 'Schedule Coaching', href: '/manager/development' },
  { agent: 'Ryan Taylor', avatar: 'RT', trigger: 'No activity for 2 days, cert overdue', action: 'Schedule 1:1', href: '/manager/development' },
  { agent: 'Anna Kim', avatar: 'AK', trigger: 'Close rate improving — ready for advanced leads', action: 'Assign Leads', href: '/manager/pipeline' },
];

// Agent status dots for activity pulse
const AGENT_ACTIVITY_DOTS = DEMO_TEAM_MEMBERS.map((m) => ({
  name: m.name,
  status: m.status,
  color: m.status === 'active' ? '#10b981' : m.status === 'away' ? '#f59e0b' : '#9ca3af',
}));

// Demo data
const TEAM_ACTIVE = [
  { name: 'Sarah Johnson', status: 'On Call', statusColor: 'bg-emerald-500', calls: 12 },
  { name: 'Mike Chen', status: 'Available', statusColor: 'bg-emerald-500', calls: 8 },
  { name: 'Emily Davis', status: 'In Meeting', statusColor: 'bg-amber-500', calls: 6 },
  { name: 'James Wilson', status: 'Available', statusColor: 'bg-emerald-500', calls: 5 },
  { name: 'Lisa Park', status: 'Break', statusColor: 'bg-gray-400', calls: 4 },
];

const TOP_PERFORMERS = [
  { name: 'Sarah Johnson', level: 7, apWeekly: 42500 },
  { name: 'Mike Chen', level: 6, apWeekly: 38200 },
  { name: 'Emily Davis', level: 5, apWeekly: 31800 },
  { name: 'James Wilson', level: 4, apWeekly: 28400 },
  { name: 'Lisa Park', level: 3, apWeekly: 22100 },
];

const ESCALATIONS = [
  { type: 'Compliance Review', agent: 'Mike Chen', lead: 'Robert M.', priority: 'high' as const, time: '2h ago' },
  { type: 'Discount Approval', agent: 'Emily Davis', lead: 'Susan K.', priority: 'medium' as const, time: '4h ago' },
  { type: 'Policy Exception', agent: 'James Wilson', lead: 'Thomas L.', priority: 'medium' as const, time: '6h ago' },
];

const PIPELINE_STAGES = [
  { stage: 'New Leads', count: 24, color: 'bg-blue-500' },
  { stage: 'Contacted', count: 18, color: 'bg-violet-500' },
  { stage: 'Qualified', count: 12, color: 'bg-amber-500' },
  { stage: 'Proposal', count: 7, color: 'bg-emerald-500' },
];

const TEAM_ACTIVITY = [
  { agent: 'Sarah J.', action: 'Closed policy — $8,200 premium', time: '12m ago', icon: CheckCircle },
  { agent: 'Mike C.', action: 'Booked appointment with lead', time: '28m ago', icon: Calendar },
  { agent: 'Emily D.', action: 'Completed 15 calls today', time: '45m ago', icon: Phone },
  { agent: 'James W.', action: 'Moved 3 leads to Qualified', time: '1h ago', icon: ArrowRight },
];

// Training compliance data
const TRAINING_COMPLIANCE = [
  { name: 'Sarah Johnson', avatar: 'SJ', status: 'current' as const, cert: 'Life & Health', expires: 'Jun 2026' },
  { name: 'Mike Chen', avatar: 'MC', status: 'expiring' as const, cert: 'Property & Casualty', expires: 'Mar 2026' },
  { name: 'Emily Davis', avatar: 'ED', status: 'current' as const, cert: 'Life & Health', expires: 'Sep 2026' },
  { name: 'Carlos Martinez', avatar: 'CM', status: 'overdue' as const, cert: 'Anti-Money Laundering', expires: 'Feb 2026' },
  { name: 'Ryan Taylor', avatar: 'RT', status: 'overdue' as const, cert: 'Ethics & Conduct', expires: 'Jan 2026' },
];

// Upcoming 1:1 meetings
const UPCOMING_1ON1S = [
  { agent: 'Carlos Martinez', avatar: 'CM', date: 'Today', time: '2:00 PM', topic: 'Performance review — 3 lost deals' },
  { agent: 'Lisa Park', avatar: 'LP', date: 'Tomorrow', time: '10:30 AM', topic: 'Promotion readiness check-in' },
  { agent: 'Ryan Taylor', avatar: 'RT', date: 'Thu', time: '3:00 PM', topic: 'Onboarding progress & cert status' },
];

// Quota/goal progress
const QUOTA_PROGRESS = {
  monthly: { target: 164000, current: 124800, label: 'Monthly Revenue' },
  policies: { target: 50, current: 38, label: 'Policies Sold' },
  calls: { target: 400, current: 312, label: 'Team Calls' },
};

// Fibonacci blob sizes for gradient cards
const CARD_BLOBS = { large: 89, medium: 55, small: 34 };

// Team Health Score data
const TEAM_HEALTH = {
  score: 82,
  grade: 'B+',
  factors: [
    { label: 'Quota Attainment', value: 76, weight: 30 },
    { label: 'Cert Compliance', value: 88, weight: 25 },
    { label: 'Activity Level', value: 91, weight: 25 },
    { label: 'Retention Rate', value: 73, weight: 20 },
  ],
};

const HEALTH_GAUGE_DATA = [{ value: TEAM_HEALTH.score, fill: 'rgba(255,255,255,0.9)' }];

// Goal Progress data
const TEAM_GOALS = [
  { id: '1', title: 'Q1 Revenue Target', progress: 76, status: 'on_track' as const },
  { id: '2', title: 'New Policy Acquisition', progress: 62, status: 'at_risk' as const },
  { id: '3', title: 'Team Certification 100%', progress: 88, status: 'on_track' as const },
];

const GOAL_STATUS_STYLES = {
  on_track: { bg: 'rgba(16,185,129,0.1)', text: '#059669', label: 'On Track' },
  at_risk: { bg: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'At Risk' },
  behind: { bg: 'rgba(244,63,94,0.1)', text: '#e11d48', label: 'Behind' },
};

const PIPELINE_CHART_DATA = PIPELINE_STAGES.map((s) => ({
  name: s.stage,
  count: s.count,
}));

const PIPELINE_CHART_COLORS = ['#818cf8', '#a78bfa', '#f59e0b', '#10b981'];

export function ManagerDashboard() {
  const { currentUser } = useAgentStore();
  const firstName = currentUser?.name?.split(' ')[0] || 'Manager';
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('manager-lounge-welcome-dismissed') !== 'true';
  });
  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('manager-lounge-welcome-dismissed', 'true');
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.md,
        }}
      >
        {/* ─── HERO — Personalized Command Center ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              background: MANAGER_GRADIENT_CSS,
            }}
          >
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Decorative floating circles — Fibonacci sizes: 89, 55, 34 (×4 for visibility) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.1, ease: MOTION.easing }}
              style={{ width: CARD_BLOBS.large * 4, height: CARD_BLOBS.large * 4, borderRadius: RADIUS.pill }}
              className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.2, ease: MOTION.easing }}
              style={{ width: CARD_BLOBS.medium * 4, height: CARD_BLOBS.medium * 4, borderRadius: RADIUS.pill }}
              className="absolute bottom-0 left-0 bg-amber-400/20 translate-y-1/2 -translate-x-1/4 blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.3, ease: MOTION.easing }}
              style={{ width: CARD_BLOBS.small * 4, height: CARD_BLOBS.small * 4, borderRadius: RADIUS.pill }}
              className="absolute top-1/2 right-1/4 bg-teal-300/15 blur-sm"
            />

            <CardContent className="relative z-10" style={{ padding: GRID.spacing.lg }}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left: Profile Icon + Greeting */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Profile Icon Badge — Glass effect matching AgentPageHero */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 200,
                      delay: 0.2,
                    }}
                    className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                    style={{
                      width: GRID.spacing.xxxxl,
                      height: GRID.spacing.xxxxl,
                      borderRadius: RADIUS.card,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <LayoutDashboard
                      className="text-amber-200"
                      style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                    />
                  </motion.div>

                  {/* Greeting Content */}
                  <div className="flex-1 min-w-0">
                    <h1
                      className="font-bold tracking-tight text-white"
                      style={{
                        fontSize: TYPE.display,
                        lineHeight: 1.2,
                      }}
                    >
                      Good morning, {firstName}
                    </h1>
                    <p className="text-white/80 mt-1" style={{ fontSize: TYPE.body }}>
                      Your team is performing well today.
                    </p>
                    {/* Activity Pulse — 12 agent status dots */}
                    <div className="flex items-center mt-3" style={{ gap: GRID.spacing.xs }}>
                      <div className="flex items-center" style={{ gap: 6 }}>
                        {AGENT_ACTIVITY_DOTS.map((dot, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 300 }}
                            title={`${dot.name} — ${dot.status}`}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: RADIUS.pill,
                              backgroundColor: dot.color,
                              boxShadow: dot.status === 'active' ? `0 0 6px ${dot.color}` : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-white/60 font-medium" style={{ fontSize: TYPE.caption }}>
                        {AGENT_ACTIVITY_DOTS.filter((d) => d.status === 'active').length} of {AGENT_ACTIVITY_DOTS.length} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: MTD Stat + Action Buttons */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  {/* MTD Revenue — Liquid Glass */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: RADIUS.button,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <DollarSign className="text-amber-200" size={LAYOUT.icon.md} />
                    <div>
                      <p className="text-white/70 uppercase tracking-wider font-medium" style={{ fontSize: TYPE.micro }}>MTD Revenue</p>
                      <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>$124,800</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="lg"
                      className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-white/30"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                      asChild
                    >
                      <Link href="/manager/team">
                        <Users className="mr-2" size={LAYOUT.icon.sm} />
                        Team
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:bg-white/30"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                      asChild
                    >
                      <Link href="/manager/reports">
                        <FileBarChart className="mr-2" size={LAYOUT.icon.sm} />
                        Reports
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── WELCOME BANNER (first visit) ─── */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              variants={fadeInUp}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: MOTION.duration.expand }}
            >
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
                  <div className="flex items-start justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700"
                        style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                      >
                        <Sparkles className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>Welcome to Manager Lounge</h3>
                        <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Here are the key areas to get started</p>
                      </div>
                    </div>
                    <button
                      onClick={dismissWelcome}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
                    {[
                      { icon: Users, label: 'Team Roster', description: 'View agent status & performance', href: '/manager/team' },
                      { icon: Target, label: 'Pipeline', description: 'Track deals across stages', href: '/manager/pipeline' },
                      { icon: GraduationCap, label: 'Development', description: 'Schedule sessions & track progress', href: '/manager/development' },
                      { icon: Bell, label: 'Alerts', description: 'Escalations & action items', href: '/manager/alerts' },
                    ].map((area) => (
                      <Link key={area.href} href={area.href}>
                        <motion.div
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                          className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                          style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.input }}
                        >
                          <area.icon className="text-emerald-600" size={LAYOUT.icon.lg} style={{ marginBottom: GRID.spacing.xs }} />
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{area.label}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{area.description}</p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── QUICK ACTIONS BAR ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: GRID.spacing.sm }}
        >
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl cursor-pointer overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${action.gradient}`} />

                  {/* Icon with gradient background */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 bg-gradient-to-br ${action.gradient} ${action.shadowColor} group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Label */}
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-center leading-tight">
                    {action.label}
                  </span>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-12 transition-all duration-300 rounded-full bg-gradient-to-r ${action.gradient}`} />
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* ─── STAT CARDS ─── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Team Size" sparklineData={[...SPARKLINE_TEAM_SIZE]} delta={0} periodLabel="Last 30 days" />
            <ManagerStatCard icon={Target} value="$847K" label="Pipeline Value" sparklineData={[...SPARKLINE_PIPELINE]} delta={18} deltaFormat="percent" periodLabel="vs last month" northStar />
            <ManagerStatCard icon={DollarSign} value="$124K" label="MTD Revenue" sparklineData={[...SPARKLINE_REVENUE]} delta={12.3} deltaFormat="percent" periodLabel="Last 30 days" />
            <ManagerStatCard icon={TrendingUp} value="92%" label="Win Rate" sparklineData={[...SPARKLINE_WIN_RATE]} delta={4} deltaFormat="percent" periodLabel="vs last month" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ─── GOLDEN RATIO CONTENT GRID — 1.618fr / 1fr ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ─── LEFT COLUMN (61.8%) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Team Activity Today */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                    >
                      <Users className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Active Team
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/team">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {TEAM_ACTIVE.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: 'none',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-semibold bg-gradient-to-br from-emerald-500 to-teal-600"
                        style={{ fontSize: TYPE.meta, width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{member.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{member.calls} calls</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 ${member.statusColor}`} style={{ borderRadius: RADIUS.pill }} />
                          <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{member.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Snapshot — Gradient Card */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Target className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Pipeline Snapshot
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/pipeline">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {PIPELINE_STAGES.map((s) => (
                    <motion.div
                      key={s.stage}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      className="text-center p-4 bg-white/10 backdrop-blur cursor-pointer hover:bg-white/20 transition-colors"
                      style={{ borderRadius: RADIUS.input, border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <p className="font-bold text-white" style={{ fontSize: TYPE.section }}>{s.count}</p>
                      <p className="text-white/70 font-medium" style={{ fontSize: TYPE.caption }}>{s.stage}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Mini pipeline bar chart */}
                <div style={{ marginBottom: 12 }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={PIPELINE_CHART_DATA} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div style={{
                              background: 'rgba(0,0,0,0.8)',
                              backdropFilter: 'blur(12px)',
                              borderRadius: 8,
                              padding: '6px 10px',
                              border: '1px solid rgba(255,255,255,0.15)',
                            }}>
                              <p style={{ fontSize: 12, color: 'white', margin: 0, fontWeight: 600 }}>
                                {payload[0].payload.name}: {payload[0].value}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {PIPELINE_CHART_DATA.map((_, idx) => (
                          <Cell key={idx} fill={PIPELINE_CHART_COLORS[idx]} opacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="flex items-center justify-between bg-white/10 backdrop-blur"
                  style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>Total Pipeline Value</p>
                    <p className="text-white/60" style={{ fontSize: TYPE.caption }}>61 active deals</p>
                  </div>
                  <p className="font-bold text-amber-200" style={{ fontSize: TYPE.title }}>$847K</p>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Queue */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                    >
                      <GraduationCap className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Coaching Queue
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/development">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {[
                    { agent: 'Mike Chen', topic: 'Objection handling', time: 'Today 2:00 PM' },
                    { agent: 'James Wilson', topic: 'Closing techniques', time: 'Tomorrow 10:00 AM' },
                    { agent: 'Lisa Park', topic: 'Pipeline management', time: 'Wed 3:00 PM' },
                  ].map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: 'none',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                        style={{ fontSize: TYPE.caption, width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                      >
                        {session.agent.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{session.agent}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>{session.topic}</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                        <span style={{ fontSize: TYPE.micro }}>{session.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── COACHING MOMENTS — AI-Surfaced — Gradient Card ─── */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="relative z-10" style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Sparkles className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Coaching Insights
                  </CardTitle>
                  <span
                    className="font-medium text-white"
                    style={{
                      fontSize: TYPE.micro,
                      padding: `2px ${GRID.spacing.xs}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: RADIUS.pill,
                    }}
                  >
                    AI Coach (Beta)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10" style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {COACHING_INSIGHTS.map((moment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center transition-colors duration-200 hover:bg-white/20"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.meta,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {moment.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>{moment.agent}</p>
                        <p className="text-white/70" style={{ fontSize: TYPE.caption }}>{moment.trigger}</p>
                      </div>
                      <Link href={moment.href}>
                        <motion.button
                          className="flex items-center font-semibold border-0 flex-shrink-0"
                          style={{
                            fontSize: TYPE.caption,
                            gap: GRID.unit,
                            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#047857',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {moment.action}
                        </motion.button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── TRAINING COMPLIANCE ─── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                    >
                      <ShieldCheck className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Training Compliance
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/compliance">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {/* Summary bar */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                    marginBottom: GRID.spacing.sm,
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                    <span className="flex items-center font-semibold text-emerald-600" style={{ gap: 4, fontSize: TYPE.caption }}>
                      <div className="bg-emerald-500" style={{ width: GRID.unit, height: GRID.unit, borderRadius: RADIUS.pill }} />
                      {TRAINING_COMPLIANCE.filter(t => t.status === 'current').length} Current
                    </span>
                    <span className="flex items-center font-semibold text-amber-600" style={{ gap: 4, fontSize: TYPE.caption }}>
                      <div className="bg-amber-500" style={{ width: GRID.unit, height: GRID.unit, borderRadius: RADIUS.pill }} />
                      {TRAINING_COMPLIANCE.filter(t => t.status === 'expiring').length} Expiring
                    </span>
                    <span className="flex items-center font-semibold text-red-600" style={{ gap: 4, fontSize: TYPE.caption }}>
                      <div className="bg-red-500" style={{ width: GRID.unit, height: GRID.unit, borderRadius: RADIUS.pill }} />
                      {TRAINING_COMPLIANCE.filter(t => t.status === 'overdue').length} Overdue
                    </span>
                  </div>
                </div>

                {/* Agent list — only show non-current (issues) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {TRAINING_COMPLIANCE.filter(t => t.status !== 'current').map((agent) => (
                    <div
                      key={agent.avatar}
                      className={`flex items-center transition-colors duration-200 ${agent.status === 'overdue' ? 'hover:bg-red-500/10' : 'hover:bg-gray-200/60'}`}
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: agent.status === 'overdue' ? 'rgba(239, 68, 68, 0.04)' : COLORS.gray[50],
                        border: agent.status === 'overdue' ? '1px solid rgba(239, 68, 68, 0.12)' : `1px solid ${COLORS.gray[100]}`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                        style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                      >
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {agent.cert} · {agent.status === 'overdue' ? 'Expired' : 'Expires'} {agent.expires}
                        </p>
                      </div>
                      <span
                        className="font-semibold flex-shrink-0"
                        style={{
                          fontSize: TYPE.micro,
                          padding: `2px ${GRID.spacing.xs}px`,
                          borderRadius: RADIUS.pill,
                          backgroundColor: agent.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: agent.status === 'overdue' ? '#dc2626' : '#d97706',
                        }}
                      >
                        {agent.status === 'overdue' ? 'OVERDUE' : 'EXPIRING'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── SALES VELOCITY — Gradient Card ─── */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="pb-0 relative z-10">
                <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                  <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <Activity className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  Sales Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                <div className="flex flex-wrap items-center justify-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                  {[
                    { label: 'Deals', value: '62' },
                    { op: '×' },
                    { label: 'Win Rate', value: '42%' },
                    { op: '×' },
                    { label: 'Avg Size', value: '$13.7K' },
                    { op: '÷' },
                    { label: 'Cycle', value: '18d' },
                  ].map((item, i) =>
                    'op' in item ? (
                      <span key={i} className="text-white/50 font-bold" style={{ fontSize: TYPE.title }}>
                        {item.op}
                      </span>
                    ) : (
                      <div
                        key={i}
                        className="text-center bg-white/10 backdrop-blur"
                        style={{
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>{item.value}</p>
                        <p className="text-white/60" style={{ fontSize: TYPE.micro }}>{item.label}</p>
                      </div>
                    ),
                  )}
                </div>
                <div
                  className="text-center bg-white/15 backdrop-blur"
                  style={{
                    padding: GRID.spacing.sm,
                    borderRadius: RADIUS.button,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <p className="text-white/70 font-medium" style={{ fontSize: TYPE.caption }}>Velocity</p>
                  <p className="font-bold text-amber-200" style={{ fontSize: TYPE.section }}>$19.8K / day</p>
                </div>
              </CardContent>
            </Card>

            {/* ─── FORECAST MINI-WIDGET ─── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardContent style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.sm }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                  >
                    <LineChart className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Revenue Forecast</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Expected Revenue</span>
                    <span className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>$312K</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Coverage Ratio</span>
                    <span className="font-bold text-emerald-600" style={{ fontSize: TYPE.body }}>3.2x</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Accuracy</span>
                    <span className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>87%</span>
                  </div>
                </div>
                <Link href="/manager/forecasting">
                  <motion.button
                    className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                    style={{
                      fontSize: TYPE.meta,
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      marginTop: GRID.spacing.sm,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Full Forecast
                    <ArrowRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                  </motion.button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* ─── RIGHT COLUMN (38.2%) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Top Performers — Gradient Card */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              {/* Full gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              {/* Fibonacci blobs */}
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Trophy className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Leaderboard
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/team-performance">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-2">
                  {TOP_PERFORMERS.map((agent, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      className="flex items-center gap-3 p-3 transition-all cursor-pointer backdrop-blur bg-white/15 hover:bg-white/25"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      <div className={cn(
                        "flex items-center justify-center font-bold shadow-lg",
                        idx === 0 && "bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900",
                        idx === 1 && "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700",
                        idx === 2 && "bg-gradient-to-br from-amber-600 to-orange-700 text-white",
                        idx > 2 && "bg-white/30 text-white"
                      )} style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, fontSize: TYPE.caption, borderRadius: RADIUS.input }}>
                        {idx === 0 ? <Trophy size={LAYOUT.icon.sm} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                        <p className="text-white/70 flex items-center gap-1" style={{ fontSize: TYPE.micro }}>
                          <Zap className="text-amber-300" size={LAYOUT.icon.xs} /> Level {agent.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-200" style={{ fontSize: TYPE.meta }}>
                          ${(agent.apWeekly / 1000).toFixed(1)}K
                        </p>
                        <p className="text-white/60 font-medium" style={{ fontSize: TYPE.micro }}>AP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── GOAL / QUOTA PROGRESS ─── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                  >
                    <Target className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  Quota Progress
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {Object.values(QUOTA_PROGRESS).map((q) => {
                    const pct = Math.round((q.current / q.target) * 100);
                    const isOnTrack = pct >= 70;
                    return (
                      <div key={q.label}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                          <span className="text-gray-600 font-medium" style={{ fontSize: TYPE.caption }}>{q.label}</span>
                          <span className="font-bold" style={{ fontSize: TYPE.caption, color: isOnTrack ? '#059669' : '#d97706' }}>
                            {pct}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div
                          style={{
                            width: '100%',
                            height: 8,
                            backgroundColor: COLORS.gray[100],
                            borderRadius: RADIUS.pill,
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: MOTION.duration.slow, ease: MOTION.easing }}
                            style={{
                              height: '100%',
                              borderRadius: RADIUS.pill,
                              background: isOnTrack
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
                          <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                            {q.label === 'Monthly Revenue' ? `$${(q.current / 1000).toFixed(0)}K` : q.current}
                          </span>
                          <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                            {q.label === 'Monthly Revenue' ? `$${(q.target / 1000).toFixed(0)}K` : q.target}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary — Gradient Card */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                  <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <DollarSign className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur p-3" style={{ borderRadius: RADIUS.input }}>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Closed Revenue</span>
                    <span className="font-bold text-white" style={{ fontSize: TYPE.title }}>$124,800</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur p-3" style={{ borderRadius: RADIUS.input }}>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Pending Commissions</span>
                    <span className="font-bold text-amber-200" style={{ fontSize: TYPE.title }}>$18,720</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur p-3" style={{ borderRadius: RADIUS.input }}>
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Target Remaining</span>
                    <span className="font-bold text-white/90" style={{ fontSize: TYPE.title }}>$39,200</span>
                  </div>
                  <Button
                    className="w-full font-semibold text-emerald-700 bg-white hover:bg-white/90"
                    style={{ borderRadius: RADIUS.button }}
                    asChild
                  >
                    <Link href="/manager/reports">
                      View Reports
                      <ArrowRight className="ml-2" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Escalations */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Escalations
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/escalations">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {ESCALATIONS.map((esc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-gray-200/60"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: 'none',
                      }}
                    >
                      <div
                        className={esc.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}
                        style={{ width: GRID.unit, height: GRID.unit, borderRadius: RADIUS.pill, flexShrink: 0 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{esc.type}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{esc.agent} · {esc.time}</p>
                      </div>
                      <motion.button
                        className="flex items-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                        style={{
                          fontSize: TYPE.caption,
                          gap: GRID.unit,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Review
                        <ChevronRight style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── UPCOMING 1:1s — Gradient Card ─── */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />

              <CardHeader className="relative z-10" style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Calendar className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Upcoming 1:1s
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/development">
                      All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10" style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {UPCOMING_1ON1S.map((meeting) => (
                    <Link key={meeting.avatar} href="/manager/development">
                      <div
                        className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-white/20"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        <div
                          className="flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{
                            width: LAYOUT.icon.xxl,
                            height: LAYOUT.icon.xxl,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.meta,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {meeting.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>{meeting.agent}</p>
                            {meeting.date === 'Today' && (
                              <span
                                className="font-semibold"
                                style={{
                                  fontSize: TYPE.micro,
                                  padding: `1px ${GRID.spacing.xs - 2}px`,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: 'rgba(255,255,255,0.25)',
                                  color: '#ffffff',
                                }}
                              >
                                TODAY
                              </span>
                            )}
                          </div>
                          <p className="text-white/70" style={{ fontSize: TYPE.caption }}>{meeting.topic}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-white" style={{ fontSize: TYPE.caption }}>{meeting.date}</p>
                          <p className="text-white/60" style={{ fontSize: TYPE.micro }}>{meeting.time}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Activity Feed */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                  >
                    <Zap className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Team Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {TEAM_ACTIVITY.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3"
                        style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}
                      >
                        <div
                          className="flex items-center justify-center bg-emerald-50 flex-shrink-0"
                          style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                        >
                          <Icon className="text-emerald-600" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900" style={{ fontSize: TYPE.meta }}>
                            <span className="font-semibold">{activity.agent}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ─── TEAM HEALTH SCORE ─── */}
            <Card className="overflow-hidden border-0 relative transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small, borderRadius: RADIUS.pill }} className="absolute top-1/2 right-1/3 bg-teal-300/10 blur-lg pointer-events-none" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Activity className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Team Health
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Circular gauge with score centered inside */}
                <div className="flex items-center justify-center" style={{ marginBottom: GRID.spacing.md }}>
                  <div className="relative" style={{ width: 160, height: 160 }}>
                    {/* SVG ring gauge */}
                    <svg viewBox="0 0 160 160" width={160} height={160}>
                      {/* Track */}
                      <circle
                        cx={80} cy={80} r={64}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={12}
                        strokeLinecap="round"
                      />
                      {/* Filled arc */}
                      <circle
                        cx={80} cy={80} r={64}
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth={12}
                        strokeLinecap="round"
                        strokeDasharray={`${(TEAM_HEALTH.score / 100) * 2 * Math.PI * 64} ${2 * Math.PI * 64}`}
                        transform="rotate(-90 80 80)"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
                      />
                    </svg>
                    {/* Centered score + grade */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-bold text-white" style={{ fontSize: 36, lineHeight: 1 }}>
                        {TEAM_HEALTH.score}
                      </span>
                      <span className="font-semibold text-white/70" style={{ fontSize: TYPE.meta, marginTop: 2 }}>
                        {TEAM_HEALTH.grade}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Factor bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {TEAM_HEALTH.factors.map((f) => (
                    <div key={f.label}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                        <span className="text-white/80 font-medium" style={{ fontSize: TYPE.caption }}>{f.label}</span>
                        <span className="font-bold text-white" style={{ fontSize: TYPE.caption }}>
                          {f.value}%
                        </span>
                      </div>
                      <div className="w-full" style={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <div
                          style={{
                            height: 6,
                            borderRadius: RADIUS.pill,
                            width: `${f.value}%`,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── GOAL PROGRESS ─── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                    >
                      <Target className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    Goal Progress
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/goals">
                      View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {TEAM_GOALS.map((goal) => {
                    const status = GOAL_STATUS_STYLES[goal.status];
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs / 2 }}>
                          <span className="font-medium text-gray-800" style={{ fontSize: TYPE.meta }}>
                            {goal.title}
                          </span>
                          <span
                            style={{
                              fontSize: TYPE.micro,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: RADIUS.pill,
                              backgroundColor: status.bg,
                              color: status.text,
                            }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              borderRadius: RADIUS.pill,
                              backgroundColor: COLORS.gray[100],
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 0.8, ease: MOTION.easing }}
                              style={{
                                height: '100%',
                                borderRadius: RADIUS.pill,
                                background: goal.status === 'on_track'
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : goal.status === 'at_risk'
                                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                    : 'linear-gradient(90deg, #fb7185, #e11d48)',
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-600" style={{ fontSize: TYPE.caption, minWidth: 32 }}>
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ─── NEED HELP? ─── */}
            <div
              className="text-center"
              style={{
                padding: GRID.spacing.md,
                borderRadius: RADIUS.card,
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
              }}
            >
              <p className="font-semibold text-emerald-700" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}>
                Need help?
              </p>
              <div className="flex items-center justify-center" style={{ gap: GRID.spacing.sm }}>
                <a
                  href="tel:6307780800"
                  className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                  style={{ fontSize: TYPE.meta }}
                >
                  (630) 778-0800
                </a>
                <span className="text-emerald-300" style={{ fontSize: TYPE.meta }}>|</span>
                <a
                  href="mailto:support@goldcoastfnl.com"
                  className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                  style={{ fontSize: TYPE.meta }}
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerDashboard;
