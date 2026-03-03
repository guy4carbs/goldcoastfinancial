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
import { MANAGER_GRADIENT_CSS } from './managerConstants';

// Quick action items for manager
const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Training', href: '/manager/training' },
  { icon: GraduationCap, label: 'Coach', href: '/manager/coaching' },
  { icon: Calendar, label: 'Meetings', href: '/manager/meetings' },
  { icon: AlertTriangle, label: 'Escalations', href: '/manager/escalations' },
  { icon: FileBarChart, label: 'Reports', href: '/manager/reports' },
  { icon: Target, label: 'Pipeline', href: '/manager/pipeline' },
  { icon: MessageSquare, label: 'Communication', href: '/manager/communications' },
];

// Demo data
const TEAM_ACTIVE = [
  { name: 'Sarah Johnson', status: 'On Call', statusColor: 'bg-emerald-500', calls: 12 },
  { name: 'Mike Chen', status: 'Available', statusColor: 'bg-emerald-500', calls: 8 },
  { name: 'Emily Davis', status: 'In Meeting', statusColor: 'bg-amber-500', calls: 6 },
  { name: 'James Wilson', status: 'Available', statusColor: 'bg-emerald-500', calls: 5 },
  { name: 'Lisa Park', status: 'Break', statusColor: 'bg-gray-400', calls: 4 },
];

const TOP_PERFORMERS = [
  { name: 'Sarah Johnson', sales: 8, revenue: '$42,500' },
  { name: 'Mike Chen', sales: 6, revenue: '$38,200' },
  { name: 'Emily Davis', sales: 5, revenue: '$31,800' },
  { name: 'James Wilson', sales: 4, revenue: '$28,400' },
  { name: 'Lisa Park', sales: 3, revenue: '$22,100' },
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
              style={{ width: 89 * 4, height: 89 * 4 }}
              className="absolute top-0 right-0 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.2, ease: MOTION.easing }}
              style={{ width: 55 * 4, height: 55 * 4 }}
              className="absolute bottom-0 left-0 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: MOTION.duration.slow, delay: 0.3, ease: MOTION.easing }}
              style={{ width: 34 * 4, height: 34 * 4 }}
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
                        fontSize: '2.5rem',
                        lineHeight: 1.2,
                      }}
                    >
                      Good morning, {firstName}
                    </h1>
                    <p className="text-white/80 text-base mt-1">
                      Your team is performing well today. 8 of 12 agents are active.
                    </p>
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
                      <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium">MTD Revenue</p>
                      <p className="text-lg font-bold text-white">$124,800</p>
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
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
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
                        gap: 12,
                        padding: 12,
                        borderRadius: RADIUS.button,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-semibold bg-gradient-to-br from-emerald-500 to-teal-600 text-sm"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{member.calls} calls</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 ${member.statusColor}`} style={{ borderRadius: RADIUS.pill }} />
                          <span className="text-xs text-gray-500">{member.status}</span>
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
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
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
                      <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.stage}</p>
                    </motion.div>
                  ))}
                </div>
                <div
                  className="flex items-center justify-between bg-emerald-50 border border-emerald-100"
                  style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Total Pipeline Value</p>
                    <p className="text-xs text-gray-500">61 active deals</p>
                  </div>
                  <p className="font-bold text-xl text-emerald-700">$847K</p>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Queue — Gradient Card */}
            <Card className="overflow-hidden border-0 relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              {/* Full gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
              {/* Fibonacci blobs */}
              <div style={{ width: 89, height: 89 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: 55, height: 55 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: 34, height: 34 }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
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
                        gap: 12,
                        padding: 12,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold text-xs"
                        style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.2)' }}
                      >
                        {session.agent.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{session.agent}</p>
                        <p className="text-[10px] text-white/70">{session.topic}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-200/80">
                        <Clock style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                        <span className="text-[10px]">{session.time}</span>
                      </div>
                    </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
              {/* Fibonacci blobs */}
              <div style={{ width: 89, height: 89 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: 55, height: 55 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: 34, height: 34 }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-200" />
                    </div>
                    Top Performers
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10" asChild>
                    <Link href="/manager/performance">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {TOP_PERFORMERS.map((agent, idx) => (
                    <div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: 12,
                        padding: 12,
                        borderRadius: RADIUS.button,
                        background: idx === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
                      }}
                    >
                      <div
                        className={`flex items-center justify-center text-white font-bold text-xs ${
                          idx === 0
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                            : idx === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                              : idx === 2
                                ? 'bg-gradient-to-br from-amber-600 to-amber-800'
                                : 'bg-white/20'
                        }`}
                        style={{
                          width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill,
                          boxShadow: idx < 3 ? SHADOW.level2 : 'none',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-white">{agent.name}</p>
                        <p className="text-[10px] text-white/70">{agent.sales} sales · {agent.revenue}</p>
                      </div>
                      <span className="font-bold text-sm text-amber-200">
                        {agent.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Escalations */}
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
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
                        gap: 12,
                        padding: 12,
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
                        <p className="font-semibold text-sm text-gray-900">{esc.type}</p>
                        <p className="text-xs text-gray-500">{esc.agent} · {esc.time}</p>
                      </div>
                      <motion.button
                        className="flex items-center text-xs font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                        style={{
                          gap: 2,
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

            {/* Training & Compliance */}
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
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
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="font-semibold text-sm text-gray-900">
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
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
              {/* Fibonacci blobs */}
              <div style={{ width: 89, height: 89 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div style={{ width: 55, height: 55 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div style={{ width: 34, height: 34 }} className="absolute top-1/2 right-1/3 bg-teal-300/10 rounded-full blur-lg" />

              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="font-semibold flex items-center gap-3 text-white" style={{ fontSize: TYPE.title }}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-200" />
                  </div>
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                    <span className="text-sm text-white/80">Closed Revenue</span>
                    <span className="font-bold text-xl text-white">$124,800</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                    <span className="text-sm text-white/80">Pending Commissions</span>
                    <span className="font-bold text-xl text-amber-200">$18,720</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3">
                    <span className="text-sm text-white/80">Target Remaining</span>
                    <span className="font-bold text-xl text-white/90">$39,200</span>
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
                          style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.pill }}
                        >
                          <Icon className="text-emerald-600" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{activity.agent}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
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
