/**
 * Manager Dashboard
 * Team performance overview and key metrics
 * Heritage Design System — Emerald theme with gold accents
 *
 * Mirrors Agent Dashboard flow:
 * Hero → Quick Actions → Stats → Golden Ratio Content Grid
 */

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  COLORS,
  fadeInUp,
  staggerContainer,
  GRID,
  LAYOUT,
  GLASS,
} from '@/lib/heritageDesignSystem';
import { MANAGER_GRADIENT_CSS, DEMO_TEAM_MEMBERS } from './managerConstants';

// Quick action items for manager
const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Training', href: '/manager/training' },
  { icon: GraduationCap, label: 'Coach', href: '/manager/coaching' },
  { icon: Calendar, label: 'Meetings', href: '/manager/meetings' },
  { icon: LineChart, label: 'Forecast', href: '/manager/forecasting' },
  { icon: UserCheck, label: '1:1s', href: '/manager/one-on-ones' },
  { icon: AlertTriangle, label: 'Escalations', href: '/manager/escalations' },
  { icon: FileBarChart, label: 'Reports', href: '/manager/reports' },
  { icon: Target, label: 'Pipeline', href: '/manager/pipeline' },
  { icon: MessageSquare, label: 'Communication', href: '/manager/communications' },
];

// Deal risk alerts for dashboard
const DEAL_RISK_ALERTS = [
  { deal: 'Chen Annuity Package', agent: 'David Brown', avatar: 'DB', value: 89000, daysIdle: 12, riskType: 'stale' as const },
  { deal: 'Adams Corporate Group', agent: 'Sarah Johnson', avatar: 'SJ', value: 125000, daysIdle: 8, riskType: 'no_activity' as const },
  { deal: 'Davis Legacy Trust', agent: 'James Wilson', avatar: 'JW', value: 95000, daysIdle: 18, riskType: 'aging' as const },
];

// AI-surfaced coaching moments
const COACHING_MOMENTS = [
  { agent: 'Carlos Martinez', avatar: 'CM', trigger: '3 consecutive lost deals in 2 weeks', action: 'Schedule Coaching', href: '/manager/coaching' },
  { agent: 'Ryan Taylor', avatar: 'RT', trigger: 'No activity for 2 days, cert overdue', action: 'Schedule 1:1', href: '/manager/one-on-ones' },
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

// Fibonacci blob sizes for gradient cards
const CARD_BLOBS = { large: 89, medium: 55, small: 34 };

export function ManagerDashboard() {
  const { currentUser } = useAgentStore();
  const firstName = currentUser?.name?.split(' ')[0] || 'Manager';

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
              className="absolute inset-0 opacity-10"
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
              style={{ width: CARD_BLOBS.large * 4, height: CARD_BLOBS.large * 4 }}
              className="absolute top-0 right-0 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.2, ease: MOTION.easing }}
              style={{ width: CARD_BLOBS.medium * 4, height: CARD_BLOBS.medium * 4 }}
              className="absolute bottom-0 left-0 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.3, ease: MOTION.easing }}
              style={{ width: CARD_BLOBS.small * 4, height: CARD_BLOBS.small * 4 }}
              className="absolute top-1/2 right-1/4 bg-teal-300/15 rounded-full blur-sm"
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
                    <DollarSign className="w-5 h-5 text-amber-200" />
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
                        <Users className="w-4 h-4 mr-2" />
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
                        <FileBarChart className="w-4 h-4 mr-2" />
                        Reports
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── QUICK ACTIONS BAR ─── */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <motion.button
                  className="flex items-center gap-2 px-4 py-2.5 font-medium text-gray-600 hover:text-emerald-700 whitespace-nowrap"
                  style={{
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.meta,
                    ...GLASS.css.light,
                    border: `1px solid ${COLORS.gray[100]}`,
                  }}
                  whileHover={{ y: -2, boxShadow: SHADOW.level2 }}
                  transition={{ duration: MOTION.duration.hover }}
                >
                  <Icon style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  {action.label}
                </motion.button>
              </Link>
            );
          })}
        </motion.div>

        {/* ─── DEAL RISK ALERTS ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              border: '1px solid rgba(245, 158, 11, 0.15)',
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 0 }}>
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                  >
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  Deal Risk Alerts
                </CardTitle>
                <span
                  className="font-semibold text-amber-700"
                  style={{
                    fontSize: TYPE.caption,
                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderRadius: RADIUS.pill,
                  }}
                >
                  {DEAL_RISK_ALERTS.length} at risk
                </span>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md }}>
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                {DEAL_RISK_ALERTS.map((deal) => (
                  <motion.div
                    key={deal.deal}
                    className="flex flex-col"
                    style={{
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                    }}
                    whileHover={{ y: MOTION.hover.y, boxShadow: SHADOW.level2, transition: { duration: MOTION.duration.hover } }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                        style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                      >
                        {deal.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{deal.deal}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{deal.agent}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                      <span className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                        ${(deal.value / 1000).toFixed(0)}K
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          deal.riskType === 'aging' ? 'text-red-600 bg-red-50' :
                          deal.riskType === 'stale' ? 'text-amber-700 bg-amber-50' :
                          'text-orange-700 bg-orange-50',
                        )}
                        style={{
                          fontSize: TYPE.caption,
                          padding: `2px ${GRID.spacing.xs}px`,
                          borderRadius: RADIUS.pill,
                        }}
                      >
                        {deal.riskType === 'aging' ? 'Aging' : deal.riskType === 'stale' ? 'Stale' : 'No Activity'} · {deal.daysIdle}d
                      </span>
                    </div>
                    <motion.button
                      className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                      style={{
                        fontSize: TYPE.caption,
                        gap: GRID.unit,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {deal.riskType === 'aging' ? 'Reassign' : deal.riskType === 'stale' ? 'Schedule Follow-up' : 'Review in 1:1'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── STAT CARDS ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Team Size" trend={{ value: '8 active', positive: true }} />
            <ManagerStatCard icon={Target} value="$847K" label="Pipeline Value" trend={{ value: '18%', positive: true, label: 'mo' }} />
            <ManagerStatCard icon={DollarSign} value="$124K" label="MTD Revenue" trend={{ value: '76%', positive: true, label: 'target' }} />
            <ManagerStatCard icon={TrendingUp} value="92%" label="Win Rate" trend={{ value: '4%', positive: true, label: 'vs last' }} />
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
                      <Users className="w-5 h-5 text-amber-200" />
                    </div>
                    Active Team
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/team">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {TEAM_ACTIVE.map((member, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Snapshot */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
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
                      <Target className="w-5 h-5 text-amber-200" />
                    </div>
                    Pipeline Snapshot
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/pipeline">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {PIPELINE_STAGES.map((s) => (
                    <motion.div
                      key={s.stage}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>{s.count}</p>
                      <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>{s.stage}</p>
                    </motion.div>
                  ))}
                </div>
                <div
                  className="flex items-center justify-between bg-emerald-50 border border-emerald-100"
                  style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                >
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Total Pipeline Value</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>61 active deals</p>
                  </div>
                  <p className="font-bold text-emerald-700" style={{ fontSize: TYPE.title }}>$847K</p>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Queue — Gradient Card */}
            <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              {/* Full gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
              {/* Fibonacci blobs */}
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <GraduationCap className="w-5 h-5 text-amber-200" />
                    </div>
                    Coaching Queue
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/coaching">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {[
                    { agent: 'Mike Chen', topic: 'Objection handling', time: 'Today 2:00 PM' },
                    { agent: 'James Wilson', topic: 'Closing techniques', time: 'Tomorrow 10:00 AM' },
                    { agent: 'Lisa Park', topic: 'Pipeline management', time: 'Wed 3:00 PM' },
                  ].map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold"
                        style={{ fontSize: TYPE.caption, width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)' }}
                      >
                        {session.agent.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>{session.agent}</p>
                        <p className="text-white/70" style={{ fontSize: TYPE.micro }}>{session.topic}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-200/80">
                        <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                        <span style={{ fontSize: TYPE.micro }}>{session.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── COACHING MOMENTS — AI-Surfaced ─── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
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
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </div>
                    Coaching Moments
                  </CardTitle>
                  <span
                    className="font-medium text-emerald-700"
                    style={{
                      fontSize: TYPE.micro,
                      padding: `2px ${GRID.spacing.xs}px`,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: RADIUS.pill,
                    }}
                  >
                    AI Coach (Beta)
                  </span>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {COACHING_MOMENTS.map((moment, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[100], transition: { duration: MOTION.duration.hover } }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                        style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                      >
                        {moment.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{moment.agent}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{moment.trigger}</p>
                      </div>
                      <Link href={moment.href}>
                        <motion.button
                          className="flex items-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 flex-shrink-0"
                          style={{
                            fontSize: TYPE.caption,
                            gap: GRID.unit,
                            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {moment.action}
                        </motion.button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── RIGHT COLUMN (38.2%) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Top Performers — Gradient Card */}
            <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              {/* Full gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
              {/* Fibonacci blobs */}
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                      <Trophy className="w-5 h-5 text-amber-200" />
                    </div>
                    Leaderboard
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/performance">
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
                      className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer backdrop-blur bg-white/15 hover:bg-white/25"
                    >
                      <div className={cn(
                        "rounded-xl flex items-center justify-center font-bold shadow-lg",
                        idx === 0 && "bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900",
                        idx === 1 && "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700",
                        idx === 2 && "bg-gradient-to-br from-amber-600 to-orange-700 text-white",
                        idx > 2 && "bg-white/30 text-white"
                      )} style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, fontSize: TYPE.caption }}>
                        {idx === 0 ? <Trophy className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                        <p className="text-white/70 flex items-center gap-1" style={{ fontSize: TYPE.micro }}>
                          <Zap className="w-3 h-3 text-amber-300" /> Level {agent.level}
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

            {/* Pending Escalations */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
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
                      <AlertTriangle className="w-5 h-5 text-amber-200" />
                    </div>
                    Escalations
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/escalations">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {ESCALATIONS.map((esc, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center cursor-pointer"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[100], transition: { duration: MOTION.duration.hover } }}
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── SALES VELOCITY — Gradient Card ─── */}
            <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-0 relative z-10">
                <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                  <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <Activity className="w-5 h-5 text-amber-200" />
                  </div>
                  Sales Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                {/* Formula visualization */}
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
                {/* Result */}
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
                    <LineChart className="w-5 h-5 text-amber-200" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Revenue Forecast</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>Weighted Forecast</span>
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

            {/* Training & Compliance */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
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
                      <ShieldCheck className="w-5 h-5 text-amber-200" />
                    </div>
                    Training & Compliance
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" asChild>
                    <Link href="/manager/training">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { label: 'Certified Agents', value: '10 of 12', dot: 'bg-emerald-500' },
                    { label: 'Expiring Soon', value: '2 agents', dot: 'bg-amber-500' },
                    { label: 'Pending Approval', value: '3 certifications', dot: 'bg-blue-500' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                      style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}
                    >
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <div
                          className={item.dot}
                          style={{ width: GRID.unit, height: GRID.unit, borderRadius: RADIUS.pill, flexShrink: 0 }}
                        />
                        <span className="text-gray-600" style={{ fontSize: TYPE.meta }}>{item.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary — Gradient Card */}
            <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              {/* Full gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
              {/* Fibonacci blobs */}
              <div style={{ width: CARD_BLOBS.large, height: CARD_BLOBS.large }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.medium, height: CARD_BLOBS.medium }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: CARD_BLOBS.small, height: CARD_BLOBS.small }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                  <div className="bg-white/20 backdrop-blur flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <DollarSign className="w-5 h-5 text-amber-200" />
                  </div>
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Closed Revenue</span>
                    <span className="font-bold text-white" style={{ fontSize: TYPE.title }}>$124,800</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                    <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Pending Commissions</span>
                    <span className="font-bold text-amber-200" style={{ fontSize: TYPE.title }}>$18,720</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
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
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Activity Feed */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
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
                    <Zap className="w-5 h-5 text-amber-200" />
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
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerDashboard;
