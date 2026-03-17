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
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutiveStatCard, ExecutiveStatCardGrid, DeltaBadge } from './primitives/ExecutiveStatCard';
import { Progress } from '@/components/ui/progress';
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
  deal: { icon: DollarSign, color: '#10b981' },
  hire: { icon: UserPlus, color: '#3b82f6' },
  milestone: { icon: Trophy, color: '#f59e0b' },
  alert: { icon: AlertTriangle, color: '#ef4444' },
};

export function ExecutiveDashboard() {
  const currentUser = useAgentStore((s) => s.currentUser);
  const firstName = currentUser?.name?.split(' ')[0] || 'Executive';

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
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left: Profile Icon + Greeting */}
                <div className="flex items-center gap-4 flex-1">
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
                          Q1 Progress: {DEMO_ORG_METRICS.quarterlyProgress}%
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
                          +{DEMO_ORG_METRICS.revenueGrowth}% Revenue Growth
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: YTD Revenue + Action Buttons */}
                <div className="flex flex-col gap-3 flex-shrink-0">
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
                        {fmtCurrency(DEMO_ORG_METRICS.totalRevenue)}
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
                    >
                      <Download className="mr-2" size={LAYOUT.icon.sm} />
                      Export
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

        {/* ─── STAT CARDS ─── */}
        <motion.section variants={fadeInUp} style={{ position: 'relative', zIndex: 1 }}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              value={fmtCurrency(DEMO_ORG_METRICS.totalRevenue)}
              label="Monthly Revenue"
              delta={DEMO_ORG_METRICS.revenueGrowth}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Target}
              value={fmtCurrency(DEMO_ORG_METRICS.pipelineValue)}
              label="Pipeline Value"
              delta={DEMO_ORG_METRICS.pipelineGrowth}
              periodLabel="total active"
            />
            <ExecutiveStatCard
              icon={Users}
              value={DEMO_ORG_METRICS.activeAgents}
              label="Active Agents"
              delta={DEMO_ORG_METRICS.newAgentsThisMonth}
              deltaFormat="number"
              periodLabel={`${DEMO_ORG_METRICS.newAgentsThisMonth} new this month`}
            />
            <ExecutiveStatCard
              icon={TrendingUp}
              value={`${DEMO_ORG_METRICS.conversionRate}%`}
              label="Conversion Rate"
              delta={-2}
              periodLabel={`vs ${DEMO_ORG_METRICS.conversionTarget}% target`}
            />
          </ExecutiveStatCardGrid>
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
                      <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                        Team Performance
                      </h2>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div
                    className="grid items-center text-gray-500 font-medium border-b"
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
                  {DEMO_TEAMS.map((team) => {
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
                          <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{team.name}</p>
                          <div className="flex items-center" style={{ gap: 6, marginTop: 2 }}>
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{team.manager}</span>
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
                        <span className="text-right font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>{team.agents}</span>
                        <span className="text-right font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                          {fmtCurrency(team.revenue)}
                        </span>
                        <span className="text-right font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                          {fmtCurrency(team.pipeline)}
                        </span>
                        <span className="text-right" style={{ fontSize: TYPE.meta }}>
                          <DeltaBadge value={team.conversion > 18 ? Math.round(team.conversion - 18) : -Math.round(18 - team.conversion)} />
                        </span>
                      </motion.div>
                    );
                  })}
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
                    <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Revenue by Product
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {DEMO_REVENUE_BY_PRODUCT.map((product) => (
                      <div key={product.product}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div style={{ width: 10, height: 10, borderRadius: RADIUS.pill, backgroundColor: product.color }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>{product.product}</span>
                          </div>
                          <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
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
                    <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Q1 Goals
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                    {DEMO_QUARTERLY_GOALS.map((goal) => (
                      <div key={goal.label}>
                        <div className="flex justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                          <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>{goal.label}</span>
                          <span className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                            {typeof goal.current === 'number' && goal.current > 1000
                              ? `${fmtCurrency(goal.current)} / ${fmtCurrency(goal.target)}`
                              : `${goal.current} / ${goal.target}${goal.label === 'Retention Rate' ? '%' : ''}`}
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2" style={{ borderRadius: RADIUS.input }} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (38.2%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Top Performers */}
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
                      <Trophy style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                    </div>
                    <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Top Performers
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {DEMO_TOP_PERFORMERS.map((agent, idx) => (
                      <motion.div
                        key={agent.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)', x: 2 }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex items-center"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`,
                          borderRadius: RADIUS.button,
                        }}
                      >
                        <span
                          className="font-bold flex-shrink-0"
                          style={{
                            width: 24,
                            fontSize: TYPE.meta,
                            color: idx === 0 ? '#f59e0b' : idx === 1 ? COLORS.gray[400] : idx === 2 ? '#b45309' : COLORS.gray[300],
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <div
                          className="flex items-center justify-center font-bold text-white flex-shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.button,
                            background: EXECUTIVE_GRADIENT_CSS,
                            fontSize: TYPE.caption,
                          }}
                        >
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{agent.name}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                            {agent.team} · {agent.deals} deals
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900 flex-shrink-0" style={{ fontSize: TYPE.meta }}>
                          {fmtCurrency(agent.revenue)}
                        </span>
                      </motion.div>
                    ))}
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
                    <h2 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Activity Feed
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {DEMO_EXECUTIVE_ACTIVITY.map((item) => {
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
                            <p className="text-gray-700" style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}>
                              {item.message}
                            </p>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginTop: 2 }}>
                              <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>{item.time}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>{item.team}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
                      <p className="font-bold text-2xl">{DEMO_ORG_METRICS.retentionRate}%</p>
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
                      <p className="font-bold text-2xl">{fmtCurrency(DEMO_ORG_METRICS.avgDealSize)}</p>
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
                        {DEMO_ORG_METRICS.quarterlyProgress}%
                      </span>
                    </div>
                    <div
                      className="overflow-hidden"
                      style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${DEMO_ORG_METRICS.quarterlyProgress}%` }}
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
