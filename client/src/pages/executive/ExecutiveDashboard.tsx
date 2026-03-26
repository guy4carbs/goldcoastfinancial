/**
 * Executive Dashboard
 * Premium executive command center with golden ratio layout
 *
 * Heritage Command Lounge Design System — Orange/Blood Orange theme
 * - 8-point modular grid compliance
 * - Apple-style motion curves
 * - Glass material effects (liquid glass matching Agent/Manager)
 * - Fibonacci decorative elements (89×4, 55×4, 34×4)
 * - Golden ratio (1.618:1) content split
 */

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAgentStore } from '@/lib/agentStore';
import { useExecutiveDashboard } from '@/hooks/useExecutiveDashboard';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutiveStatCard, ExecutiveStatCardGrid, DeltaBadge } from './primitives/ExecutiveStatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Crown,
  BarChart3,
  Download,
  Calendar,
  ArrowUpRight,
  Trophy,
  Activity,
  Zap,
  AlertTriangle,
  UserPlus,
  FileBarChart,
  ShieldCheck,
  Clock,
  Gauge,
  Loader2,
  Wifi,
  Phone,
  Server,
  Radio,
  type LucideIcon,
} from 'lucide-react';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
  GLASS,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  DEMO_ORG_METRICS,
  DEMO_TOP_PERFORMERS,
  DEMO_TEAMS,
  DEMO_REVENUE_BY_PRODUCT,
  DEMO_EXECUTIVE_ACTIVITY,
  DEMO_QUARTERLY_GOALS,
  DEMO_EXEC_SALES_VELOCITY,
  DEMO_EXEC_COMPLIANCE,
  DEMO_EXEC_AGENT_ROSTER,
  TEAM_STATUS_COLORS,
  EXECUTIVE_GRADIENT_CSS,
} from './executiveConstants';

// Fibonacci blob sizes for hero card (×4 for visibility)
const CARD_BLOBS = { large: 89, medium: 55, small: 34 };

// Smart currency formatter: <1K → $999, <1M → $248.5K, ≥1M → $1.8M
function fmtCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(val >= 100_000 ? 0 : 1)}K`;
  return `$${val.toLocaleString()}`;
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── ACTIVITY TYPE ICONS ───
const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  deal: { icon: DollarSign, color: '#ea580c' },
  hire: { icon: UserPlus, color: '#f97316' },
  milestone: { icon: Trophy, color: '#f59e0b' },
  alert: { icon: AlertTriangle, color: '#b91c1c' },
};

// Agent status dots fallback from demo data
const DEMO_ACTIVITY_DOTS = DEMO_EXEC_AGENT_ROSTER.map((m) => ({
  name: m.name,
  status: m.status,
  color: m.status === 'active' ? '#10b981' : m.status === 'on-leave' ? '#f59e0b' : '#9ca3af',
}));

export function ExecutiveDashboard() {
  const currentUser = useAgentStore((s) => s.currentUser);
  const firstName = currentUser?.name?.split(' ')[0] || 'Executive';
  const { data, isLoading } = useExecutiveDashboard();

  // Use real data when available, fall back to demo constants
  const orgMetrics = data?.orgMetrics || DEMO_ORG_METRICS;
  const teams = data?.teams?.length ? data.teams : DEMO_TEAMS;
  const topPerformers = data?.topPerformers?.length ? data.topPerformers : DEMO_TOP_PERFORMERS;
  const revenueByProduct = data?.revenueByProduct?.length ? data.revenueByProduct : DEMO_REVENUE_BY_PRODUCT;
  const activityFeed = data?.recentActivity?.length ? data.recentActivity : DEMO_EXECUTIVE_ACTIVITY;
  const quarterlyGoals = data?.quarterlyGoals?.length ? data.quarterlyGoals : DEMO_QUARTERLY_GOALS;
  const salesVelocity = data?.salesVelocity || DEMO_EXEC_SALES_VELOCITY;
  const compliance = data?.compliance;

  // Build activity pulse dots from real agent statuses or demo data
  const AGENT_ACTIVITY_DOTS = data?.agentStatuses?.length
    ? data.agentStatuses.map((a) => ({
        name: a.name,
        status: a.status,
        color: a.status === 'active' ? '#10b981' : a.status === 'idle' ? '#f59e0b' : '#9ca3af',
      }))
    : DEMO_ACTIVITY_DOTS;

  // Build compliance display from real data or demo
  const complianceTeams = compliance
    ? [
        { team: 'Licenses', score: compliance.totalLicenses > 0 ? Math.round((compliance.validLicenses / compliance.totalLicenses) * 100) : 100, auditStatus: 'passed' as const, eAndO: 'current' as const, lastAudit: '' },
        { team: 'Expiring', score: compliance.totalLicenses > 0 ? Math.round(((compliance.totalLicenses - compliance.expiringSoon) / compliance.totalLicenses) * 100) : 100, auditStatus: compliance.expiringSoon > 0 ? 'review' as const : 'passed' as const, eAndO: 'current' as const, lastAudit: '' },
      ]
    : DEMO_EXEC_COMPLIANCE;

  return (
    <ExecutiveLoungeLayout>
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
        {/* Background Fibonacci Blobs */}
        <div className="fixed pointer-events-none" style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.slow, delay: 0.1, ease: MOTION.easing }}
            className="absolute bg-orange-500/8 rounded-full blur-3xl"
            style={{ top: '10%', left: '-5%', width: 377, height: 377 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.slow, delay: 0.2, ease: MOTION.easing }}
            className="absolute bg-red-500/6 rounded-full blur-3xl"
            style={{ top: '40%', left: '15%', width: 233, height: 233 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION.duration.slow, delay: 0.3, ease: MOTION.easing }}
            className="absolute bg-orange-400/5 rounded-full blur-3xl"
            style={{ bottom: '10%', right: '5%', width: 144, height: 144 }}
          />
        </div>

        {/* ─── HERO — Executive Command Center ─── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              background: EXECUTIVE_GRADIENT_CSS,
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
              className="absolute top-1/2 right-1/4 bg-red-300/15 blur-sm"
            />

            <CardContent className="relative z-10" style={{ padding: GRID.spacing.lg }}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 min-w-0">
                {/* Left: Profile Icon + Greeting */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Profile Icon Badge — Glass effect matching Agent/Manager */}
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
                    <Crown
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
                      {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-white/80 mt-1" style={{ fontSize: TYPE.body }}>
                      Your executive command center for organizational performance
                    </p>

                    {/* Hero Quick Stats — Glass pills */}
                    <div className="flex flex-wrap items-center mt-3" style={{ gap: GRID.spacing.xs }}>
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: RADIUS.button,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <BarChart3 style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                        <span style={{ fontSize: TYPE.caption, color: 'white', fontWeight: 500 }}>
                          Q1 Progress: {orgMetrics.quarterlyProgress}%
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: RADIUS.button,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <TrendingUp style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                        <span style={{ fontSize: TYPE.caption, color: 'white', fontWeight: 500 }}>
                          +{orgMetrics.revenueGrowth}% Revenue Growth
                        </span>
                      </div>
                    </div>

                    {/* Activity Pulse — Agent status dots (matches Manager pattern) */}
                    <div className="flex items-center mt-3" style={{ gap: GRID.spacing.xs }}>
                      <div className="flex items-center" style={{ gap: 4 }}>
                        {AGENT_ACTIVITY_DOTS.map((dot, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.03, type: 'spring', stiffness: 300 }}
                            title={`${dot.name} — ${dot.status}`}
                            style={{
                              width: 8,
                              height: 8,
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

                {/* Right: YTD Revenue + Action Buttons */}
                <div className="flex flex-col gap-3 lg:flex-shrink-0">
                  {/* YTD Revenue — Liquid Glass (matches Agent/Manager) */}
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
                      <p className="text-white/70 uppercase tracking-wider font-medium" style={{ fontSize: TYPE.micro }}>YTD Revenue</p>
                      <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>
                        {fmtCurrency(orgMetrics.totalRevenue)}
                      </p>
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
                      <Link href="/executive/team">
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
                      <Link href="/executive/reports">
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

        {/* ─── NAVIGATION CARDS — Quick Actions (matches Manager pattern) ─── */}
        <motion.div variants={fadeInUp} style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
            {[
              { icon: Users, label: 'Team Overview', description: 'Monitor agents & teams', href: '/executive/team' },
              { icon: DollarSign, label: 'Commissions', description: 'Earnings & override structure', href: '/executive/commissions' },
              { icon: BarChart3, label: 'Pipeline', description: 'Deal flow & conversion', href: '/executive/pipeline' },
              { icon: FileBarChart, label: 'Reports', description: 'Analytics & exports', href: '/executive/reports' },
            ].map((area) => (
              <Link key={area.href} href={area.href}>
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  className="bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors cursor-pointer"
                  style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.input }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.button,
                      background: EXECUTIVE_GRADIENT_CSS,
                      marginBottom: GRID.spacing.xs,
                    }}
                  >
                    <area.icon className="text-white" size={LAYOUT.icon.sm} />
                  </div>
                  <p className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>{area.label}</p>
                  <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>{area.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ─── STAT CARDS ─── */}
        <motion.section variants={fadeInUp} style={{ position: 'relative', zIndex: 1 }}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              value={fmtCurrency(orgMetrics.totalRevenue)}
              label="Monthly Revenue"
              delta={orgMetrics.revenueGrowth}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Target}
              value={fmtCurrency(orgMetrics.pipelineValue)}
              label="Pipeline Value"
              delta={orgMetrics.pipelineGrowth}
              periodLabel="total active"
            />
            <ExecutiveStatCard
              icon={Users}
              value={orgMetrics.activeAgents}
              label="Active Agents"
              delta={orgMetrics.newAgentsThisMonth}
              deltaFormat="number"
              periodLabel={`${orgMetrics.newAgentsThisMonth} new this month`}
            />
            <ExecutiveStatCard
              icon={TrendingUp}
              value={`${orgMetrics.conversionRate}%`}
              label="Conversion Rate"
              delta={-2}
              periodLabel={`vs ${orgMetrics.conversionTarget}% target`}
            />
          </ExecutiveStatCardGrid>
        </motion.section>

        {/* ─── REAL-TIME MONITORING HUB ─── */}
        <motion.section variants={fadeInUp} style={{ position: 'relative', zIndex: 1 }}>
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
              {/* Header */}
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
                    <Radio style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                      Real-Time Monitoring
                    </h2>
                    <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                      Live system health &amp; agent activity
                    </p>
                  </div>
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

              {/* Monitoring Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
                {/* System Health */}
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    backgroundColor: '#f0fdf4',
                    borderRadius: RADIUS.button,
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Server style={{ width: 14, height: 14, color: '#16a34a' }} />
                    <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>System Health</span>
                  </div>
                  <p className="font-bold text-emerald-700" style={{ fontSize: TYPE.section }}>99.9%</p>
                  <p className="text-stone-500" style={{ fontSize: TYPE.micro }}>All services operational</p>
                </div>

                {/* Active Sessions */}
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    backgroundColor: '#fff7ed',
                    borderRadius: RADIUS.button,
                    border: '1px solid #fed7aa',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Wifi style={{ width: 14, height: 14, color: '#ea580c' }} />
                    <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>Active Sessions</span>
                  </div>
                  <p className="font-bold text-orange-700" style={{ fontSize: TYPE.section }}>
                    {AGENT_ACTIVITY_DOTS.filter((d) => d.status === 'active').length}
                  </p>
                  <p className="text-stone-500" style={{ fontSize: TYPE.micro }}>Agents online now</p>
                </div>

                {/* Live Calls */}
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    backgroundColor: '#eff6ff',
                    borderRadius: RADIUS.button,
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Phone style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>Live Calls</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <p className="font-bold text-blue-700" style={{ fontSize: TYPE.section }}>7</p>
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center" style={{ gap: 3 }}
                    >
                      <div style={{ width: 4, height: 12, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                      <div style={{ width: 4, height: 18, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                      <div style={{ width: 4, height: 10, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                    </motion.div>
                  </div>
                  <p className="text-stone-500" style={{ fontSize: TYPE.micro }}>In progress right now</p>
                </div>

                {/* Response Time */}
                <div
                  style={{
                    padding: GRID.spacing.sm,
                    backgroundColor: '#faf5ff',
                    borderRadius: RADIUS.button,
                    border: '1px solid #e9d5ff',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Clock style={{ width: 14, height: 14, color: '#7c3aed' }} />
                    <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>Avg Response</span>
                  </div>
                  <p className="font-bold text-violet-700" style={{ fontSize: TYPE.section }}>1.2s</p>
                  <p className="text-stone-500" style={{ fontSize: TYPE.micro }}>API latency (p50)</p>
                </div>
              </div>

              {/* Agent Activity Timeline — compact horizontal scroll */}
              <div style={{ marginTop: GRID.spacing.md }}>
                <p className="font-medium text-stone-600" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>
                  Recent Agent Activity
                </p>
                <div className="flex overflow-x-auto" style={{ gap: GRID.spacing.xs, paddingBottom: 4 }}>
                  {activityFeed.slice(0, 5).map((item) => {
                    const activityType = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.deal;
                    const Icon = activityType.icon;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -2 }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex items-center flex-shrink-0"
                        style={{
                          gap: GRID.spacing.xs,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          backgroundColor: `${activityType.color}08`,
                          borderRadius: RADIUS.button,
                          border: `1px solid ${activityType.color}20`,
                        }}
                      >
                        <Icon style={{ width: 12, height: 12, color: activityType.color }} />
                        <span className="text-stone-700 truncate" style={{ fontSize: TYPE.micro, maxWidth: 160 }}>
                          {item.message}
                        </span>
                        <span className="text-stone-400" style={{ fontSize: TYPE.micro }}>{item.time}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ─── MAIN CONTENT — GOLDEN RATIO GRID ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:[grid-template-columns:1.618fr_1fr]"
          style={{ gap: GRID.spacing.md, position: 'relative', zIndex: 1 }}
        >
          {/* LEFT COLUMN (61.8%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Team Performance Table */}
            <motion.div variants={scaleIn}>
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
                        <Users style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                      </div>
                      <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                        Team Performance
                      </h2>
                    </div>
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
                        <span>Team</span>
                        <span className="text-right">Agents</span>
                        <span className="text-right">Revenue</span>
                        <span className="text-right">Pipeline</span>
                        <span className="text-right">Conv.</span>
                      </div>

                      {/* Table Rows */}
                      {teams.map((team) => {
                        const statusColors = TEAM_STATUS_COLORS[team.status];
                        return (
                          <motion.div
                            key={team.id}
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            className="grid items-center border-b last:border-b-0"
                            style={{
                              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                              padding: `${GRID.spacing.sm}px 0`,
                              borderColor: COLORS.gray[100],
                            }}
                          >
                            <div>
                              <p className="font-medium text-stone-900" style={{ fontSize: TYPE.meta }}>{team.name}</p>
                              <div className="flex items-center" style={{ gap: 6, marginTop: 2 }}>
                                <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>{team.manager}</span>
                                <span
                                  className={`inline-flex items-center ${statusColors.bg} ${statusColors.text}`}
                                  style={{
                                    fontSize: TYPE.micro,
                                    padding: '1px 6px',
                                    borderRadius: RADIUS.pill,
                                    fontWeight: 500,
                                  }}
                                >
                                  <span className={`${statusColors.dot} inline-block`} style={{ width: 5, height: 5, borderRadius: RADIUS.pill, marginRight: 4 }} />
                                  {team.status.replace('-', ' ')}
                                </span>
                              </div>
                            </div>
                            <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>{team.agents}</span>
                            <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                              {fmtCurrency(team.revenue)}
                            </span>
                            <span className="text-right font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>
                              {fmtCurrency(team.pipeline)}
                            </span>
                            <span className="text-right" style={{ fontSize: TYPE.meta }}>
                              <DeltaBadge value={team.conversion > 18 ? Math.round(team.conversion - 18) : -Math.round(18 - team.conversion)} />
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue by Product */}
            <motion.div variants={scaleIn}>
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
                      Revenue by Product
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {revenueByProduct.map((product) => (
                      <div key={product.product}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: product.color }} />
                            <span className="font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>{product.product}</span>
                          </div>
                          <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                            {fmtCurrency(product.revenue)} ({product.percentage}%)
                          </span>
                        </div>
                        <div
                          className="overflow-hidden"
                          style={{ height: 8, backgroundColor: COLORS.gray[100], borderRadius: RADIUS.pill }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${product.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: MOTION.easing }}
                            style={{ height: '100%', backgroundColor: product.color, borderRadius: RADIUS.pill }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quarterly Goals */}
            <motion.div variants={scaleIn}>
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
                      <Target style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                    </div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                      Q1 Goals
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                    {quarterlyGoals.map((goal) => (
                      <div key={goal.label}>
                        <div className="flex justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                          <span className="font-medium text-stone-700" style={{ fontSize: TYPE.meta }}>{goal.label}</span>
                          <span className="text-stone-500" style={{ fontSize: TYPE.meta }}>
                            {typeof goal.current === 'number' && goal.current > 1000
                              ? `${fmtCurrency(goal.current)} / ${fmtCurrency(goal.target)}`
                              : `${goal.current} / ${goal.target}${goal.label === 'Retention Rate' ? '%' : ''}`}
                          </span>
                        </div>
                        <div
                          className="overflow-hidden"
                          style={{ height: 8, backgroundColor: '#fff7ed', borderRadius: RADIUS.pill }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: MOTION.easing }}
                            style={{
                              height: '100%',
                              background: goal.progress >= 90
                                ? 'linear-gradient(90deg, #ea580c, #f59e0b)'
                                : goal.progress >= 70
                                  ? 'linear-gradient(90deg, #ea580c, #f97316)'
                                  : 'linear-gradient(90deg, #b91c1c, #ea580c)',
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
          </div>

          {/* RIGHT COLUMN (38.2%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Top Performers — Leaderboard Style */}
            <motion.div variants={scaleIn}>
              <Card
                className="border-0 overflow-hidden relative text-white"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: EXECUTIVE_GRADIENT_CSS,
                }}
              >
                <CardContent className="relative z-10" style={{ padding: `${GRID.spacing.sm + 4}px ${GRID.spacing.sm + 4}px` }}>
                  {/* Header */}
                  <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        <Trophy style={{ width: 16, height: 16, color: '#fcd34d' }} />
                      </div>
                      <h2 className="font-bold" style={{ fontSize: TYPE.body, color: '#fff' }}>
                        Leaderboard
                      </h2>
                    </div>
                    <Link href="/executive/team">
                      <span className="text-white/80 font-medium hover:text-white transition-colors" style={{ fontSize: TYPE.caption, cursor: 'pointer' }}>
                        View All
                      </span>
                    </Link>
                  </div>

                  {/* Performer Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {topPerformers.map((agent, idx) => {
                      const rankBadgeStyle = idx === 0
                        ? { backgroundColor: '#f59e0b', color: '#78350f' }
                        : idx === 1
                          ? { backgroundColor: '#d1d5db', color: '#374151' }
                          : idx === 2
                            ? { backgroundColor: '#b45309', color: '#fff' }
                            : { backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)' };

                      return (
                        <motion.div
                          key={agent.id}
                          whileHover={{ scale: 1.01, x: 2 }}
                          transition={{ duration: MOTION.duration.hover }}
                          className="flex items-center"
                          style={{
                            gap: 10,
                            padding: '8px 10px',
                            borderRadius: RADIUS.input,
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {/* Rank Badge */}
                          <div
                            className="flex items-center justify-center font-bold flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              fontSize: idx === 0 ? 0 : TYPE.meta,
                              ...rankBadgeStyle,
                            }}
                          >
                            {idx === 0 ? (
                              <Trophy style={{ width: 16, height: 16 }} />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          {/* Name & Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                            <div className="flex items-center" style={{ gap: 3, marginTop: 1 }}>
                              <Zap style={{ width: 10, height: 10, color: '#fcd34d' }} />
                              <span className="text-white/50" style={{ fontSize: TYPE.micro }}>
                                {agent.team} · {agent.deals} deals
                              </span>
                            </div>
                          </div>

                          {/* Revenue */}
                          <div className="flex-shrink-0 text-right">
                            <p className="font-bold" style={{ fontSize: TYPE.meta, color: '#fde68a' }}>
                              {fmtCurrency(agent.revenue)}
                            </p>
                            <p className="text-white/35" style={{ fontSize: 9 }}>
                              AP
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={scaleIn}>
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
                      <Activity style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                    </div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                      Activity Feed
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activityFeed.map((item) => {
                      const activityType = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.deal;
                      const Icon = activityType.icon;
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          className="flex items-start"
                          style={{
                            gap: GRID.spacing.sm,
                            padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`,
                            borderRadius: RADIUS.button,
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: RADIUS.button,
                              backgroundColor: `${activityType.color}15`,
                            }}
                          >
                            <Icon style={{ width: 16, height: 16, color: activityType.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-700" style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}>
                              {item.message}
                            </p>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginTop: 2 }}>
                              <span className="text-stone-400" style={{ fontSize: TYPE.caption }}>{item.time}</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-stone-400" style={{ fontSize: TYPE.caption }}>{item.team}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sales Velocity */}
            <motion.div variants={scaleIn}>
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
                      <Gauge style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                    </div>
                    <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                      Sales Velocity
                    </h2>
                  </div>

                  <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                    <div style={{ padding: GRID.spacing.sm, backgroundColor: '#fff7ed', borderRadius: RADIUS.button }}>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{salesVelocity.avgDaysToClose}</p>
                      <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>Avg Days to Close</p>
                    </div>
                    <div style={{ padding: GRID.spacing.sm, backgroundColor: '#fff7ed', borderRadius: RADIUS.button }}>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{salesVelocity.winRate}%</p>
                      <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>Win Rate</p>
                    </div>
                    <div style={{ padding: GRID.spacing.sm, backgroundColor: '#fff7ed', borderRadius: RADIUS.button }}>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{salesVelocity.dealsPerDay}</p>
                      <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>Deals / Day</p>
                    </div>
                    <div style={{ padding: GRID.spacing.sm, backgroundColor: '#fff7ed', borderRadius: RADIUS.button }}>
                      <p className="font-bold text-stone-900" style={{ fontSize: TYPE.section }}>{fmtCurrency(salesVelocity.avgDealSize)}</p>
                      <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>Avg Deal Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Compliance Health */}
            <motion.div variants={scaleIn}>
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
                        <ShieldCheck style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                      </div>
                      <h2 className="font-semibold text-stone-900" style={{ fontSize: TYPE.title }}>
                        Compliance
                      </h2>
                    </div>
                    <span
                      className="font-bold"
                      style={{
                        fontSize: TYPE.body,
                        color: '#ea580c',
                      }}
                    >
                      {Math.round(complianceTeams.reduce((a: number, c: any) => a + c.score, 0) / complianceTeams.length)}% Avg
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {complianceTeams.map((team: any) => (
                      <div key={team.team} className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                        <span className="font-medium text-stone-700 flex-shrink-0" style={{ fontSize: TYPE.meta, width: 56 }}>
                          {team.team}
                        </span>
                        <div
                          className="flex-1 overflow-hidden"
                          style={{ height: 6, backgroundColor: '#fff7ed', borderRadius: RADIUS.pill }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${team.score}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: MOTION.easing }}
                            style={{
                              height: '100%',
                              background: team.score >= 95
                                ? '#f59e0b'
                                : team.score >= 90
                                  ? '#ea580c'
                                  : '#b91c1c',
                              borderRadius: RADIUS.pill,
                            }}
                          />
                        </div>
                        <span className="text-stone-500 flex-shrink-0" style={{ fontSize: TYPE.caption, width: 32, textAlign: 'right' }}>
                          {team.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Org Health Summary — Gradient card */}
            <motion.div variants={scaleIn}>
              <Card
                className="border-0 overflow-hidden relative text-white"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: EXECUTIVE_GRADIENT_CSS,
                }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/15 rounded-full blur-lg pointer-events-none" />

                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                    <Zap style={{ width: 20, height: 20, color: '#fcd34d' }} />
                    <h3 className="font-semibold" style={{ fontSize: TYPE.title }}>Org Health</h3>
                  </div>

                  <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                    <div
                      className="text-center"
                      style={{
                        padding: GRID.spacing.sm,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <p className="font-bold text-2xl">{orgMetrics.retentionRate}%</p>
                      <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Retention</p>
                    </div>
                    <div
                      className="text-center"
                      style={{
                        padding: GRID.spacing.sm,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: RADIUS.button,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <p className="font-bold text-2xl">{fmtCurrency(orgMetrics.avgDealSize)}</p>
                      <p className="text-white/70" style={{ fontSize: TYPE.caption }}>Avg Deal</p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: GRID.spacing.sm,
                      padding: GRID.spacing.sm,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: RADIUS.button,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                      <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Quarterly Target</span>
                      <span className="font-semibold text-amber-200" style={{ fontSize: TYPE.meta }}>
                        {orgMetrics.quarterlyProgress}%
                      </span>
                    </div>
                    <div
                      className="overflow-hidden"
                      style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${orgMetrics.quarterlyProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-amber-300"
                        style={{ borderRadius: RADIUS.pill }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveDashboard;
