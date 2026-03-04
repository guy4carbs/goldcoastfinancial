/**
 * Manager Pipeline — Pipeline Overview Page (Phase 3 Enhanced)
 * Team pipeline health, deal flow stages, kanban board, stale deal detection,
 * coverage ratio, conversion funnel, and recent activity
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_PIPELINE_STAGES, glassCard } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RADIUS, TYPE, GRID, LAYOUT, MOTION, COLORS, SHADOW,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  Target, DollarSign, BarChart3, TrendingUp, Activity,
  LayoutList, LayoutGrid, AlertTriangle, ArrowRight, Bell,
  ChevronDown, Filter,
} from 'lucide-react';

// ─── DEMO DATA ──────────────────────────────────────────────

const DEMO_PIPELINE_ACTIVITY = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', lead: 'Anderson Corp', from: 'Contacted', to: 'Qualified', time: '15 min ago' },
  { id: '2', agent: 'Mike Chen', avatar: 'MC', lead: 'Riverside LLC', from: 'New Leads', to: 'Contacted', time: '42 min ago' },
  { id: '3', agent: 'David Brown', avatar: 'DB', lead: 'Summit Partners', from: 'Qualified', to: 'Proposal', time: '1 hr ago' },
  { id: '4', agent: 'Rachel Green', avatar: 'RG', lead: 'Oakwood Holdings', from: 'Proposal', to: 'Closed Won', time: '2 hrs ago' },
  { id: '5', agent: 'Jessica Lee', avatar: 'JL', lead: 'Meridian Group', from: 'New Leads', to: 'Contacted', time: '3 hrs ago' },
];

const DEMO_KANBAN_DEALS = [
  // New Leads (8 deals)
  { id: 'k1', name: 'Thompson Estate', agent: 'Sarah Johnson', avatar: 'SJ', value: 48000, stage: 'New Leads', daysIdle: 2 },
  { id: 'k2', name: 'Martinez Key Person', agent: 'Mike Chen', avatar: 'MC', value: 76000, stage: 'New Leads', daysIdle: 5 },
  { id: 'k3', name: 'Davis Legacy Trust', agent: 'James Wilson', avatar: 'JW', value: 95000, stage: 'New Leads', daysIdle: 18 },
  { id: 'k4', name: 'Wilson Group Plan', agent: 'Emily Davis', avatar: 'ED', value: 34000, stage: 'New Leads', daysIdle: 1 },
  { id: 'k5', name: 'Park Retirement', agent: 'Tom Rodriguez', avatar: 'TR', value: 29000, stage: 'New Leads', daysIdle: 12 },
  { id: 'k6', name: 'Taylor Basic Life', agent: 'Lisa Park', avatar: 'LP', value: 18000, stage: 'New Leads', daysIdle: 3 },
  { id: 'k7', name: 'Nguyen Premium', agent: 'David Brown', avatar: 'DB', value: 52000, stage: 'New Leads', daysIdle: 8 },
  { id: 'k8', name: 'Adams Universal', agent: 'Anna Kim', avatar: 'AK', value: 22000, stage: 'New Leads', daysIdle: 16 },
  // Contacted (6 deals)
  { id: 'k9', name: 'Chen Annuity Pkg', agent: 'David Brown', avatar: 'DB', value: 89000, stage: 'Contacted', daysIdle: 21 },
  { id: 'k10', name: 'Kim Retirement Plus', agent: 'Lisa Park', avatar: 'LP', value: 31000, stage: 'Contacted', daysIdle: 4 },
  { id: 'k11', name: 'Roberts Family', agent: 'Mike Chen', avatar: 'MC', value: 42000, stage: 'Contacted', daysIdle: 9 },
  { id: 'k12', name: 'Lee Protection', agent: 'Jessica Lee', avatar: 'JL', value: 38000, stage: 'Contacted', daysIdle: 15 },
  { id: 'k13', name: 'Garcia Convert', agent: 'Rachel Green', avatar: 'RG', value: 27000, stage: 'Contacted', daysIdle: 2 },
  { id: 'k14', name: 'Hall Executive', agent: 'Sarah Johnson', avatar: 'SJ', value: 67000, stage: 'Contacted', daysIdle: 6 },
  // Qualified (5 deals)
  { id: 'k15', name: 'Williams Family IUL', agent: 'Rachel Green', avatar: 'RG', value: 62000, stage: 'Qualified', daysIdle: 3 },
  { id: 'k16', name: 'Patel Term Convert', agent: 'Jessica Lee', avatar: 'JL', value: 28000, stage: 'Qualified', daysIdle: 7 },
  { id: 'k17', name: 'Nguyen Family Plan', agent: 'Emily Davis', avatar: 'ED', value: 54000, stage: 'Qualified', daysIdle: 19 },
  { id: 'k18', name: 'Brooks Whole Life', agent: 'Tom Rodriguez', avatar: 'TR', value: 36000, stage: 'Qualified', daysIdle: 11 },
  { id: 'k19', name: 'Cooper Annuity', agent: 'Mike Chen', avatar: 'MC', value: 45000, stage: 'Qualified', daysIdle: 1 },
  // Proposal (4 deals)
  { id: 'k20', name: 'Garcia Whole Life', agent: 'Mike Chen', avatar: 'MC', value: 35000, stage: 'Proposal', daysIdle: 4 },
  { id: 'k21', name: 'Brooks IUL Transfer', agent: 'Tom Rodriguez', avatar: 'TR', value: 42000, stage: 'Proposal', daysIdle: 10 },
  { id: 'k22', name: 'Lee Estate Shield', agent: 'Rachel Green', avatar: 'RG', value: 38000, stage: 'Proposal', daysIdle: 2 },
  { id: 'k23', name: 'Anderson Corp', agent: 'Sarah Johnson', avatar: 'SJ', value: 58000, stage: 'Proposal', daysIdle: 6 },
  // Closed Won (3 deals)
  { id: 'k24', name: 'Summit Partners', agent: 'David Brown', avatar: 'DB', value: 41000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k25', name: 'Riverside LLC', agent: 'Jessica Lee', avatar: 'JL', value: 33000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k26', name: 'Oakwood Holdings', agent: 'Rachel Green', avatar: 'RG', value: 28000, stage: 'Closed Won', daysIdle: 0 },
];

const STALE_DEALS = DEMO_KANBAN_DEALS.filter(d => d.daysIdle > 14 && d.stage !== 'Closed Won');

// ─── FUNNEL DATA (derived from DEMO_PIPELINE_STAGES) ─────────

const FUNNEL_STAGES = DEMO_PIPELINE_STAGES.map((s, i, arr) => ({
  ...s,
  pct: Math.round((s.count / arr[0].count) * 100),
  conversion: i > 0 ? Math.round((s.count / arr[i - 1].count) * 100) : 100,
  dropOff: i > 0 ? Math.round(((arr[i - 1].count - s.count) / arr[i - 1].count) * 100) : 0,
}));

// ─── HELPERS ─────────────────────────────────────────────────

function formatDollar(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function agingColor(days: number): { dot: string; border: string } {
  if (days < 7) return { dot: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
  if (days <= 14) return { dot: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
  return { dot: '#ef4444', border: 'rgba(239, 68, 68, 0.30)' };
}

const STAGE_NAMES = DEMO_PIPELINE_STAGES.map(s => s.stage);

// ─── COMPONENT ───────────────────────────────────────────────

export function ManagerPipeline() {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const pipelineTotal = 847000;
  const targetTotal = 400000;
  const coverageRatio = (pipelineTotal / targetTotal).toFixed(1);
  const coverageNum = parseFloat(coverageRatio);
  const coverageColor = coverageNum >= 3 ? '#10b981' : coverageNum >= 2 ? '#f59e0b' : '#ef4444';

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
            title="Pipeline Overview"
            subtitle="Track your team's deal flow and pipeline health"
          />
        </motion.div>

        {/* ── 2. Stat Cards ──────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value="$847K"
              label="Total Pipeline"
              trend={{ value: '18%', positive: true }}
            />
            <ManagerStatCard icon={Target} value="62" label="Active Deals" />
            <ManagerStatCard icon={BarChart3} value="$13.7K" label="Avg Deal Size" />
            <ManagerStatCard
              icon={TrendingUp}
              value="42%"
              label="Win Rate"
              trend={{ value: '5%', positive: true }}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── 3. Pipeline Coverage Ratio Bar ──────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
            {/* Fibonacci blobs */}
            <div className="absolute top-0 right-0 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" style={{ width: 89, height: 89 }} />
            <div className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" style={{ width: 55, height: 55 }} />
            <div className="absolute top-1/2 right-1/4 bg-teal-300/10 rounded-full blur-sm" style={{ width: 34, height: 34 }} />

            <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    <BarChart3 className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Pipeline Coverage</span>
                </div>
                <div
                  className="font-bold text-white"
                  style={{
                    fontSize: TYPE.hero,
                    color: coverageNum >= 3 ? '#bbf7d0' : coverageNum >= 2 ? '#fef3c7' : '#fecaca',
                  }}
                >
                  {coverageRatio}x
                </div>
              </div>

              {/* Coverage bar */}
              <div style={{ position: 'relative', height: 32, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                {/* Pipeline fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, ease: MOTION.easing }}
                  style={{
                    position: 'absolute', top: 0, left: 0, height: '100%',
                    borderRadius: RADIUS.button,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%)',
                  }}
                />
                {/* Target marker line */}
                <motion.div
                  initial={{ left: 0, opacity: 0 }}
                  animate={{ left: `${Math.min((targetTotal / pipelineTotal) * 100, 100)}%`, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: MOTION.easing }}
                  style={{
                    position: 'absolute', top: 0, height: '100%', width: 3,
                    background: '#fbbf24', borderRadius: 2,
                    boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                  }}
                />
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between" style={{ marginTop: GRID.spacing.xs }}>
                <span className="text-white/80" style={{ fontSize: TYPE.meta }}>Pipeline: {formatDollar(pipelineTotal)}</span>
                <span className="text-amber-200/90" style={{ fontSize: TYPE.meta }}>Target: {formatDollar(targetTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 4. View Toggle + Pipeline Stages / Kanban Board ──── */}
        <motion.div variants={fadeInUp}>
          {/* Toggle pills */}
          <div className="flex items-center" style={{ marginBottom: GRID.spacing.sm, gap: GRID.spacing.xs }}>
            {(['list', 'board'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center font-medium transition-all"
                style={{
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                  borderRadius: RADIUS.pill,
                  fontSize: TYPE.meta,
                  gap: 6,
                  ...(viewMode === mode
                    ? { background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', color: 'white', boxShadow: SHADOW.card }
                    : { ...glassCard, color: COLORS.gray[600], cursor: 'pointer' }),
                }}
              >
                {mode === 'list' ? <LayoutList style={{ width: 16, height: 16 }} /> : <LayoutGrid style={{ width: 16, height: 16 }} />}
                {mode === 'list' ? 'List' : 'Board'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              /* ── List View (existing pipeline stage cards) ── */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: MOTION.duration.normal }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                style={{ gap: GRID.spacing.sm }}
              >
                {DEMO_PIPELINE_STAGES.map((stage) => (
                  <div
                    key={stage.stage}
                    style={{
                      borderRadius: RADIUS.card,
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
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
                      <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs / 2 }}>
                        {stage.count}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        {formatDollar(stage.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              /* ── Board View (kanban columns) ── */
              <motion.div
                key="board"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: MOTION.duration.normal }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                style={{ gap: GRID.spacing.xs, alignItems: 'start' }}
              >
                {STAGE_NAMES.map((stageName) => {
                  const stageDeals = DEMO_KANBAN_DEALS.filter(d => d.stage === stageName);
                  const stageInfo = DEMO_PIPELINE_STAGES.find(s => s.stage === stageName)!;
                  return (
                    <div
                      key={stageName}
                      style={{
                        borderRadius: RADIUS.card,
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: SHADOW.card,
                        padding: GRID.spacing.sm,
                      }}
                    >
                      {/* Column header */}
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                        <div className={stageInfo.color} style={{ width: 10, height: 10, borderRadius: RADIUS.pill, flexShrink: 0 }} />
                        <span className="font-semibold text-gray-700 truncate" style={{ fontSize: TYPE.meta }}>{stageName}</span>
                        <span className="text-gray-400 ml-auto" style={{ fontSize: TYPE.micro }}>{stageDeals.length}</span>
                      </div>

                      {/* Deal cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {stageDeals.map((deal) => {
                          const aging = agingColor(deal.daysIdle);
                          return (
                            <motion.div
                              key={deal.id}
                              whileHover={{ y: -2, transition: { duration: MOTION.duration.hover } }}
                              style={{
                                padding: GRID.spacing.xs,
                                borderRadius: RADIUS.button,
                                background: COLORS.gray[50],
                                borderLeft: `3px solid ${aging.dot}`,
                              }}
                            >
                              <p className="font-medium text-gray-800 truncate" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>
                                {deal.name}
                              </p>
                              <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
                                {/* Agent avatar */}
                                <div
                                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex-shrink-0"
                                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                                >
                                  {deal.avatar}
                                </div>
                                <span className="text-gray-500 truncate" style={{ fontSize: TYPE.micro }}>{deal.agent}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>
                                  {formatDollar(deal.value)}
                                </span>
                                <div className="flex items-center" style={{ gap: 4 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: RADIUS.pill, background: aging.dot }} />
                                  <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>{deal.daysIdle}d</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── 5. Conversion Funnel ───────────────────────────── */}
        <motion.div variants={fadeInUp}>
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
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Filter className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Conversion Funnel</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {FUNNEL_STAGES.map((stage, i) => (
                  <div key={stage.stage}>
                    {/* Conversion arrow between stages */}
                    {i > 0 && (
                      <div className="flex items-center justify-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                        <ChevronDown className="text-emerald-400" style={{ width: 16, height: 16 }} />
                        <span className="font-medium text-emerald-600" style={{ fontSize: TYPE.caption }}>
                          {stage.conversion}% conversion
                        </span>
                        <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                          ({stage.dropOff}% drop-off)
                        </span>
                      </div>
                    )}
                    {/* Funnel bar */}
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
            className="overflow-hidden border-0"
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
                  <AlertTriangle className="w-5 h-5 text-amber-100" />
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
                  {STALE_DEALS.length} idle &gt;14 days
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
                    >
                      <Bell style={{ width: 12, height: 12 }} />
                      Nudge Agent
                    </button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 7. Recent Pipeline Activity ─────────────────────── */}
        <motion.div variants={fadeInUp}>
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
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Activity className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Recent Pipeline Activity</span>
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
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerPipeline;
