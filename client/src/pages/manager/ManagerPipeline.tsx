/**
 * Manager Pipeline Page
 * Team pipeline health, deal flow stages, stale deal detection,
 * coverage ratio, conversion funnel, and recent activity
 * Heritage Design System — Emerald theme
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_PIPELINE_STAGES,
  glassCard,
  SPARKLINE_PIPELINE,
  SPARKLINE_WIN_RATE,
  SPARKLINE_REVENUE,
} from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ForecastingTabContent } from './ManagerForecasting';
import {
  RADIUS, TYPE, GRID, LAYOUT, MOTION, COLORS, SHADOW,
  fadeInUp, staggerContainer, staggerCards,
} from '@/lib/heritageDesignSystem';
import {
  Target, DollarSign, BarChart3, TrendingUp, Activity,
  AlertTriangle, Bell, ChevronDown, Filter, LineChart,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── TYPES ──────────────────────────────────────────────────

interface PipelineDeal {
  id: string;
  name: string;
  agent: string;
  avatar: string;
  value: number;
  stage: string;
  daysIdle: number;
}

// ─── DEMO DATA ──────────────────────────────────────────────

const DEMO_PIPELINE_ACTIVITY = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', lead: 'Anderson Corp', from: 'Contacted', to: 'Qualified', time: '15 min ago' },
  { id: '2', agent: 'Mike Chen', avatar: 'MC', lead: 'Riverside LLC', from: 'New Leads', to: 'Contacted', time: '42 min ago' },
  { id: '3', agent: 'David Brown', avatar: 'DB', lead: 'Summit Partners', from: 'Qualified', to: 'Proposal', time: '1 hr ago' },
  { id: '4', agent: 'Rachel Green', avatar: 'RG', lead: 'Oakwood Holdings', from: 'Proposal', to: 'Closed Won', time: '2 hrs ago' },
  { id: '5', agent: 'Jessica Lee', avatar: 'JL', lead: 'Meridian Group', from: 'New Leads', to: 'Contacted', time: '3 hrs ago' },
];

const DEMO_PIPELINE_DEALS: PipelineDeal[] = [
  // New Leads
  { id: 'k1', name: 'Thompson Estate', agent: 'Sarah Johnson', avatar: 'SJ', value: 48000, stage: 'New Leads', daysIdle: 2 },
  { id: 'k2', name: 'Martinez Key Person', agent: 'Mike Chen', avatar: 'MC', value: 76000, stage: 'New Leads', daysIdle: 5 },
  { id: 'k3', name: 'Davis Legacy Trust', agent: 'James Wilson', avatar: 'JW', value: 95000, stage: 'New Leads', daysIdle: 18 },
  { id: 'k4', name: 'Wilson Group Plan', agent: 'Emily Davis', avatar: 'ED', value: 34000, stage: 'New Leads', daysIdle: 1 },
  { id: 'k5', name: 'Park Retirement', agent: 'Tom Rodriguez', avatar: 'TR', value: 29000, stage: 'New Leads', daysIdle: 12 },
  { id: 'k6', name: 'Taylor Basic Life', agent: 'Lisa Park', avatar: 'LP', value: 18000, stage: 'New Leads', daysIdle: 3 },
  { id: 'k7', name: 'Nguyen Premium', agent: 'David Brown', avatar: 'DB', value: 52000, stage: 'New Leads', daysIdle: 8 },
  { id: 'k8', name: 'Adams Universal', agent: 'Anna Kim', avatar: 'AK', value: 22000, stage: 'New Leads', daysIdle: 16 },
  // Contacted
  { id: 'k9', name: 'Chen Annuity Pkg', agent: 'David Brown', avatar: 'DB', value: 89000, stage: 'Contacted', daysIdle: 21 },
  { id: 'k10', name: 'Kim Retirement Plus', agent: 'Lisa Park', avatar: 'LP', value: 31000, stage: 'Contacted', daysIdle: 4 },
  { id: 'k11', name: 'Roberts Family', agent: 'Mike Chen', avatar: 'MC', value: 42000, stage: 'Contacted', daysIdle: 9 },
  { id: 'k12', name: 'Lee Protection', agent: 'Jessica Lee', avatar: 'JL', value: 38000, stage: 'Contacted', daysIdle: 15 },
  { id: 'k13', name: 'Garcia Convert', agent: 'Rachel Green', avatar: 'RG', value: 27000, stage: 'Contacted', daysIdle: 2 },
  { id: 'k14', name: 'Hall Executive', agent: 'Sarah Johnson', avatar: 'SJ', value: 67000, stage: 'Contacted', daysIdle: 6 },
  // Qualified
  { id: 'k15', name: 'Williams Family IUL', agent: 'Rachel Green', avatar: 'RG', value: 62000, stage: 'Qualified', daysIdle: 3 },
  { id: 'k16', name: 'Patel Term Convert', agent: 'Jessica Lee', avatar: 'JL', value: 28000, stage: 'Qualified', daysIdle: 7 },
  { id: 'k17', name: 'Nguyen Family Plan', agent: 'Emily Davis', avatar: 'ED', value: 54000, stage: 'Qualified', daysIdle: 19 },
  { id: 'k18', name: 'Brooks Whole Life', agent: 'Tom Rodriguez', avatar: 'TR', value: 36000, stage: 'Qualified', daysIdle: 11 },
  { id: 'k19', name: 'Cooper Annuity', agent: 'Mike Chen', avatar: 'MC', value: 45000, stage: 'Qualified', daysIdle: 1 },
  // Proposal
  { id: 'k20', name: 'Garcia Whole Life', agent: 'Mike Chen', avatar: 'MC', value: 35000, stage: 'Proposal', daysIdle: 4 },
  { id: 'k21', name: 'Brooks IUL Transfer', agent: 'Tom Rodriguez', avatar: 'TR', value: 42000, stage: 'Proposal', daysIdle: 10 },
  { id: 'k22', name: 'Lee Estate Shield', agent: 'Rachel Green', avatar: 'RG', value: 38000, stage: 'Proposal', daysIdle: 2 },
  { id: 'k23', name: 'Anderson Corp', agent: 'Sarah Johnson', avatar: 'SJ', value: 58000, stage: 'Proposal', daysIdle: 6 },
  // Closed Won
  { id: 'k24', name: 'Summit Partners', agent: 'David Brown', avatar: 'DB', value: 41000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k25', name: 'Riverside LLC', agent: 'Jessica Lee', avatar: 'JL', value: 33000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k26', name: 'Oakwood Holdings', agent: 'Rachel Green', avatar: 'RG', value: 28000, stage: 'Closed Won', daysIdle: 0 },
];

// ─── FUNNEL DATA (derived from DEMO_PIPELINE_STAGES) ─────────

const FUNNEL_STAGES = DEMO_PIPELINE_STAGES.map((s, i, arr) => ({
  ...s,
  pct: Math.round((s.count / arr[0].count) * 100),
  conversion: i > 0 ? Math.round((s.count / arr[i - 1].count) * 100) : 100,
  dropOff: i > 0 ? Math.round(((arr[i - 1].count - s.count) / arr[i - 1].count) * 100) : 0,
}));

// ─── COMPUTED CONSTANTS ─────────────────────────────────────

function formatDollar(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

const pipelineTotal = DEMO_PIPELINE_STAGES.reduce((sum, s) => sum + s.value, 0);
const activeDealCount = DEMO_PIPELINE_STAGES.filter((s) => s.stage !== 'Closed Won').reduce((sum, s) => sum + s.count, 0);
const totalDealCount = DEMO_PIPELINE_STAGES.reduce((sum, s) => sum + s.count, 0);
const avgDealSize = Math.round(pipelineTotal / totalDealCount);
const targetTotal = 400000;
const surplusValue = pipelineTotal - targetTotal;
const targetPct = Math.round((targetTotal / pipelineTotal) * 100);
const coverageRatio = (pipelineTotal / targetTotal).toFixed(1);
const coverageNum = parseFloat(coverageRatio);

const STALE_DEALS = DEMO_PIPELINE_DEALS.filter((d) => d.daysIdle > 14 && d.stage !== 'Closed Won');

// ─── COMPONENT ───────────────────────────────────────────────

export function ManagerPipeline() {
  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── 1. Hero ────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Target}
            title="Pipeline"
            subtitle="Deal flow and pipeline health"
          />
        </motion.div>

        {/* ── 2. Stat Cards ──────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value={formatDollar(pipelineTotal)}
              label="Total Pipeline"
              sparklineData={[...SPARKLINE_PIPELINE]}
              delta={18}
              deltaFormat="percent"
              periodLabel="vs last month"
              northStar
            />
            <ManagerStatCard icon={Target} value={activeDealCount} label="Active Deals" sparklineData={[...SPARKLINE_REVENUE].slice(0, 14)} delta={3} periodLabel="Last 14 days" />
            <ManagerStatCard icon={BarChart3} value={formatDollar(avgDealSize)} label="Avg Deal Size" delta={5.2} deltaFormat="percent" periodLabel="vs last month" />
            <ManagerStatCard
              icon={TrendingUp}
              value="42%"
              label="Win Rate"
              sparklineData={[...SPARKLINE_WIN_RATE]}
              delta={5}
              deltaFormat="percent"
              periodLabel="vs last month"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Navigation ──────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="pipeline">
            <TabsList
              className="w-fit border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="pipeline"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Target style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Pipeline
              </TabsTrigger>
              <TabsTrigger
                value="forecasting"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <LineChart style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Forecasting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" style={{ marginTop: GRID.spacing.md }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

        {/* ── 3. Pipeline Coverage ──────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
            {/* Fibonacci blobs */}
            <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-2xl" style={{ width: 89, height: 89, borderRadius: RADIUS.pill }} />
            <div className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-xl" style={{ width: 55, height: 55, borderRadius: RADIUS.pill }} />
            <div className="absolute top-1/2 right-1/4 bg-teal-300/10 blur-sm" style={{ width: 34, height: 34, borderRadius: RADIUS.pill }} />

            <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
              {/* Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.md }}>
                <div>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: 4 }}>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }}
                    >
                      <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                    </div>
                    <span className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Pipeline Coverage</span>
                  </div>
                  <p className="text-white/60" style={{ fontSize: TYPE.caption, paddingLeft: LAYOUT.icon.xxl + GRID.spacing.xs }}>
                    {formatDollar(pipelineTotal)} pipeline vs {formatDollar(targetTotal)} target
                  </p>
                </div>
                <div className="text-right">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: MOTION.easing }}
                    className="font-bold"
                    style={{
                      fontSize: TYPE.display,
                      lineHeight: 1,
                      color: coverageNum >= 3 ? '#bbf7d0' : coverageNum >= 2 ? '#fef3c7' : '#fecaca',
                    }}
                  >
                    {coverageRatio}x
                  </motion.div>
                  <p className="text-white/50" style={{ fontSize: TYPE.micro, marginTop: 2 }}>coverage ratio</p>
                </div>
              </div>

              {/* Two-tone segmented bar */}
              <div style={{ position: 'relative', marginBottom: GRID.spacing.sm }}>
                {/* Bar track */}
                <div style={{ height: 40, borderRadius: RADIUS.button, background: 'rgba(0,0,0,0.15)', overflow: 'hidden', position: 'relative' }}>
                  {/* Covered segment (0 → target) — bright solid */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${targetPct}%` }}
                    transition={{ duration: 0.8, ease: MOTION.easing }}
                    style={{
                      position: 'absolute', top: 0, left: 0, height: '100%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.35) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <span className="font-bold text-white/90" style={{ fontSize: TYPE.caption }}>
                      {formatDollar(targetTotal)}
                    </span>
                  </motion.div>

                  {/* Surplus segment (target → pipeline) — lighter with pattern */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - targetPct}%` }}
                    transition={{ duration: 0.6, delay: 0.4, ease: MOTION.easing }}
                    style={{
                      position: 'absolute', top: 0, left: `${targetPct}%`, height: '100%',
                      background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <span className="font-semibold text-white/70" style={{ fontSize: TYPE.caption }}>
                      +{formatDollar(surplusValue)}
                    </span>
                  </motion.div>

                  {/* Target marker — gold line with glow */}
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    style={{
                      position: 'absolute', top: -6, left: `${targetPct}%`, marginLeft: -1,
                      width: 2, height: 'calc(100% + 12px)',
                      background: '#fbbf24',
                      borderRadius: 2,
                      boxShadow: '0 0 12px rgba(251,191,36,0.7), 0 0 4px rgba(251,191,36,0.5)',
                    }}
                  />
                </div>

                {/* Target label floating above the marker */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  style={{
                    position: 'absolute', bottom: -20, left: `${targetPct}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span className="text-amber-300 font-semibold" style={{ fontSize: TYPE.micro }}>
                    Target
                  </span>
                </motion.div>
              </div>

              {/* Bottom metric pills */}
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.md }}>
                <div
                  className="flex items-center"
                  style={{
                    gap: 6,
                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.pill,
                    background: 'rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.6)' }} />
                  <span className="text-white/90 font-medium" style={{ fontSize: TYPE.caption }}>
                    Covered: {formatDollar(targetTotal)}
                  </span>
                </div>
                <div
                  className="flex items-center"
                  style={{
                    gap: 6,
                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.pill,
                    background: 'rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.4)' }} />
                  <span className="text-white/70 font-medium" style={{ fontSize: TYPE.caption }}>
                    Surplus: +{formatDollar(surplusValue)}
                  </span>
                </div>
                <div
                  className="flex items-center ml-auto"
                  style={{
                    gap: 6,
                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.pill,
                    background: 'rgba(251,191,36,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ width: 8, height: 2, borderRadius: 1, background: '#fbbf24' }} />
                  <span className="text-amber-200 font-medium" style={{ fontSize: TYPE.caption }}>
                    Target: {formatDollar(targetTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 4. Pipeline Stages ──────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          style={{ gap: GRID.spacing.sm }}
        >
          {DEMO_PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.stage}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <div style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                  <div
                    className={stage.color}
                    style={{ width: 10, height: 10, borderRadius: RADIUS.pill, flexShrink: 0 }}
                  />
                  <p className="font-medium text-gray-600 truncate" style={{ fontSize: TYPE.meta }}>
                    {stage.stage}
                  </p>
                </div>
                <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>
                  {stage.count}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── 5. Conversion Funnel ───────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Filter className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Conversion Funnel</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {FUNNEL_STAGES.map((stage, i) => (
                  <div key={stage.stage}>
                    {i > 0 && (
                      <div className="flex items-center justify-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                        <ChevronDown className="text-emerald-400" size={LAYOUT.icon.sm} />
                        <span className="font-medium text-emerald-600" style={{ fontSize: TYPE.caption }}>
                          {stage.conversion}% conversion
                        </span>
                        <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                          ({stage.dropOff}% drop-off)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <span
                        className="font-medium text-gray-600 text-right flex-shrink-0"
                        style={{ fontSize: TYPE.caption, width: 90 }}
                      >
                        {stage.stage}
                      </span>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1, ease: MOTION.easing }}
                          style={{
                            height: 36,
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(90deg, #059669 0%, #0d9488 100%)',
                            opacity: 1 - i * 0.12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 48,
                          }}
                        >
                          <span className="font-bold text-white" style={{ fontSize: TYPE.caption }}>
                            {stage.count}
                          </span>
                        </motion.div>
                      </div>
                      <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption, width: 40, textAlign: 'right' }}>
                        {stage.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 6. Stale Deal Detection ────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden"
            style={{
              background: 'rgba(255, 251, 235, 0.90)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
              border: '1px solid rgba(245, 158, 11, 0.20)',
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="text-amber-100" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Stale Deals</span>
                <span
                  className="font-bold text-amber-700"
                  style={{
                    fontSize: TYPE.micro,
                    background: 'rgba(245,158,11,0.15)',
                    padding: '2px 8px',
                    borderRadius: RADIUS.pill,
                  }}
                >
                  {STALE_DEALS.length} no activity in 14+ days
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {STALE_DEALS.map((deal) => (
                  <motion.div
                    key={deal.id}
                    className="flex items-center"
                    style={{
                      padding: 12,
                      borderRadius: RADIUS.button,
                      gap: 12,
                      background: 'rgba(255,255,255,0.60)',
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    {/* Agent avatar */}
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                      style={{
                        width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.button, fontSize: TYPE.meta,
                      }}
                    >
                      {deal.avatar}
                    </div>

                    {/* Deal info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                        {deal.name}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        {deal.agent} &middot; {deal.stage} &middot; {formatDollar(deal.value)}
                      </p>
                    </div>

                    {/* Days idle badge */}
                    <div
                      className="flex-shrink-0 font-bold text-red-700"
                      style={{
                        fontSize: TYPE.caption,
                        background: 'rgba(239,68,68,0.12)',
                        padding: '2px 8px',
                        borderRadius: RADIUS.pill,
                      }}
                    >
                      {deal.daysIdle}d idle
                    </div>

                    {/* Nudge button */}
                    <button
                      className="flex items-center flex-shrink-0 font-semibold text-white"
                      style={{
                        fontSize: TYPE.caption,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.pill,
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        boxShadow: SHADOW.level1,
                        gap: 4,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => toast.success(`Nudge sent to ${deal.agent} about "${deal.name}"`)}
                    >
                      <Bell size={LAYOUT.icon.xs} />
                      Nudge Agent
                    </button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 7. Recent Activity ─────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Activity className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {DEMO_PIPELINE_ACTIVITY.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center"
                    style={{ padding: 12, borderRadius: RADIUS.button, gap: 12 }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                      style={{
                        width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.button, fontSize: TYPE.meta,
                      }}
                    >
                      {item.avatar}
                    </div>

                    {/* Activity text */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}>
                        <span className="font-semibold text-gray-900">{item.agent}</span>
                        <span className="text-gray-500"> moved </span>
                        <span className="font-medium text-gray-800">{item.lead}</span>
                        <span className="text-gray-500"> from </span>
                        <span className="font-medium text-gray-700">{item.from}</span>
                        <span className="text-gray-500"> to </span>
                        <span className="font-medium text-emerald-600">{item.to}</span>
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0">
                      <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        {item.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="forecasting" style={{ marginTop: GRID.spacing.md }}>
              <ForecastingTabContent />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerPipeline;
