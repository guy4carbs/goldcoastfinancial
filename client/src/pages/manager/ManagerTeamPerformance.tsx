/**
 * Manager Team Performance — Consolidated Performance Hub
 * Merged from ManagerLeaderboard + ManagerPerformance
 * Rankings, analytics, contests, and promotions in a single page.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerEmptyState } from './primitives';
import { glassCard, MANAGER_GRADIENT_CSS, DEMO_TEAM_MEMBERS, DEMO_AGENT_COMMISSIONS } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, COLORS, LAYOUT,
  fadeInUp, staggerContainer, scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  Trophy, DollarSign, Users, Target,
  Phone, ArrowUp, ArrowDown, Star, Crown,
  Activity, Medal, Flame, AlertTriangle, Download, PieChart,
  Filter as FilterIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { PromotionsTabContent } from './ManagerPromotions';
import { ContestsTabContent } from './ManagerContests';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';

/* ── Design system icon badge tokens ───────────────────── */
const ICON_BADGE_GRADIENT = `linear-gradient(135deg, ${COLORS.lounges.manager.main} 0%, ${COLORS.lounges.manager.dark} 100%)`;
const ICON_BADGE_SHADOW = SHADOW.glow.emerald;

/* ── Easing cast for Framer Motion ────────────────────────── */
const EASE: [number, number, number, number] = [...MOTION.easing];

/* ── Performance Tier System (replaces numeric Lv.N) ───────── */
const TIER_CONFIG = {
  elite:  { name: 'Elite',  gradient: `linear-gradient(135deg, ${COLORS.lounges.manager.main} 0%, ${COLORS.lounges.manager.dark} 100%)`, color: COLORS.lounges.manager.dark },
  proven: { name: 'Proven', gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', color: '#0d9488' },
  rising: { name: 'Rising', gradient: `linear-gradient(135deg, ${COLORS.accent.amber[400]} 0%, ${COLORS.accent.amber[500]} 100%)`, color: COLORS.accent.amber[600] },
  newcomer: { name: 'New', gradient: `linear-gradient(135deg, ${COLORS.gray[300]} 0%, ${COLORS.gray[400]} 100%)`, color: COLORS.gray[500] },
} as const;

function getTier(level: number): keyof typeof TIER_CONFIG {
  if (level >= 5) return 'elite';
  if (level >= 3) return 'proven';
  if (level >= 1) return 'rising';
  return 'newcomer';
}

/* ── Podium icon map ───────────────────────────────────────── */
const PODIUM_ICONS = [Crown, Medal, Medal] as const;

/* ── Team Product Mix — aggregated from commission data ──── */
const TEAM_PRODUCT_MIX = (() => {
  const agg: Record<string, { premium: number; commission: number; count: number; rate: number }> = {};
  DEMO_AGENT_COMMISSIONS.forEach(agent => {
    agent.products.forEach(p => {
      if (!agg[p.product]) agg[p.product] = { premium: 0, commission: 0, count: 0, rate: p.rate };
      agg[p.product].premium += p.premium;
      agg[p.product].commission += p.commission;
      agg[p.product].count += 1;
    });
  });
  const total = Object.values(agg).reduce((s, v) => s + v.commission, 0);
  return Object.entries(agg).map(([name, d]) => ({
    product: name,
    premium: d.premium,
    commission: d.commission,
    policies: d.count,
    rate: d.rate,
    avgPremium: Math.round(d.premium / d.count),
    avgCommission: Math.round(d.commission / d.count),
    percent: Math.round((d.commission / total) * 100),
  })).sort((a, b) => b.commission - a.commission);
})();

const PRODUCT_COLORS: Record<string, string> = {
  IUL: COLORS.lounges.manager.dark,
  'Whole Life': '#0d9488',
  Term: COLORS.semantic.info,
  Annuity: COLORS.semantic.warning,
};

/* ── Team Lead Source ROI ───────────────────────────────────── */
const TEAM_LEAD_SOURCE_ROI = [
  { source: 'Company Leads', leads: 156, conversions: 38, convRate: 24.4, spend: 3200, revenue: 189000, roi: 5806, color: COLORS.lounges.manager.dark },
  { source: 'Self-Generated', leads: 89, conversions: 28, convRate: 31.5, spend: 1800, revenue: 142000, roi: 7789, color: '#0d9488' },
  { source: 'Referrals', leads: 52, conversions: 22, convRate: 42.3, spend: 0, revenue: 98000, roi: Infinity, color: COLORS.semantic.warning },
  { source: 'Digital/Web', leads: 124, conversions: 14, convRate: 11.3, spend: 4500, revenue: 68000, roi: 1411, color: COLORS.semantic.info },
];

/* ── Demo Data — derived from canonical DEMO_TEAM_MEMBERS ─── */

/** Per-agent enrichment for fields not present in the canonical DEMO_TEAM_MEMBERS. */
const AGENT_EXTRA: Record<string, { level: number; apWeekly: number; closeRate: number; trend: number; policies: number }> = {
  '1':  { level: 6, apWeekly: 8500, closeRate: 18, trend: +12, policies: 8 },
  '7':  { level: 5, apWeekly: 7200, closeRate: 17, trend: +8,  policies: 7 },
  '2':  { level: 5, apWeekly: 6200, closeRate: 16, trend: -3,  policies: 6 },
  '11': { level: 4, apWeekly: 5800, closeRate: 17, trend: +5,  policies: 6 },
  '3':  { level: 4, apWeekly: 5100, closeRate: 15, trend: +2,  policies: 5 },
  '6':  { level: 3, apWeekly: 4800, closeRate: 14, trend: +15, policies: 5 },
  '4':  { level: 3, apWeekly: 3800, closeRate: 17, trend: -7,  policies: 4 },
  '10': { level: 2, apWeekly: 3200, closeRate: 13, trend: +4,  policies: 4 },
  '5':  { level: 2, apWeekly: 2100, closeRate: 11, trend: +22, policies: 3 },
  '8':  { level: 1, apWeekly: 1400, closeRate: 11, trend: -15, policies: 2 },
  '9':  { level: 1, apWeekly: 850,  closeRate: 8,  trend: +3,  policies: 1 },
  '12': { level: 0, apWeekly: 0,    closeRate: 0,  trend: 0,   policies: 0 },
};

const LEADERBOARD = DEMO_TEAM_MEMBERS.map((m, idx) => {
  const extra = AGENT_EXTRA[m.id] || { level: 0, apWeekly: 0, closeRate: 0, trend: 0, policies: 0 };
  return {
    id: m.id,
    rank: idx + 1,
    name: m.name,
    role: m.role,
    avatar: m.avatar,
    level: extra.level,
    apWeekly: extra.apWeekly,
    calls: m.calls,
    closeRate: extra.closeRate,
    trend: extra.trend,
    policies: extra.policies,
    streak: m.streak,
    quota: m.quota,
  };
}).sort((a, b) => b.apWeekly - a.apWeekly).map((a, idx) => ({ ...a, rank: idx + 1 }));

/* ── Team definitions (using IDs, not avatar strings) ──────── */

const TEAMS = [
  { id: 'alpha', name: 'Team Alpha', memberIds: ['1', '2', '3', '4'] },
  { id: 'beta', name: 'Team Beta', memberIds: ['7', '6', '11', '10'] },
  { id: 'gamma', name: 'Team Gamma', memberIds: ['5', '8', '9', '12'] },
];

/* ── Metric options for the selector ───────────────────────── */

const METRIC_OPTIONS = [
  { key: 'ap', label: 'AP', format: (v: number) => v > 0 ? `$${(v / 1000).toFixed(1)}K` : '$0' },
  { key: 'calls', label: 'Calls', format: (v: number) => `${v}` },
  { key: 'closeRate', label: 'Close Rate', format: (v: number) => `${v}%` },
  { key: 'policies', label: 'Policies', format: (v: number) => `${v}` },
] as const;

type MetricKey = (typeof METRIC_OPTIONS)[number]['key'];

/* ── Period filter options ─────────────────────────────────── */

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Quarter', 'All Time'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── View mode ──────────────────────────────────────────────── */

type ViewMode = 'individual' | 'team';

/* ── Confetti dot colors ────────────────────────────────────── */

const CONFETTI_COLORS = [COLORS.semantic.success, '#14b8a6', COLORS.semantic.warning, '#f43f5e', '#8b5cf6'];

/** Returns gradient styling for rank badges — gold (#1), silver (#2), bronze (#3), neutral (rest). */
function getRankBadgeStyle(rank: number): React.CSSProperties {
  if (rank === 1) {
    return {
      background: `linear-gradient(135deg, ${COLORS.accent.amber[400]} 0%, ${COLORS.accent.amber[500]} 50%, ${COLORS.accent.amber[600]} 100%)`,
      color: '#ffffff',
      boxShadow: SHADOW.glow.amber,
    };
  }
  if (rank === 2) {
    return {
      background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(107, 114, 128, 0.25)',
    };
  }
  if (rank === 3) {
    return {
      background: `linear-gradient(135deg, ${COLORS.accent.amber[600]} 0%, ${COLORS.accent.amber[700]} 50%, ${COLORS.accent.amber[800]} 100%)`,
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(180, 83, 9, 0.25)',
    };
  }
  return {
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[500],
  };
}

/** Returns the numeric value for the given metric key from a leaderboard agent entry. */
function getMetricValue(agent: (typeof LEADERBOARD)[number], metric: MetricKey): number {
  switch (metric) {
    case 'ap': return agent.apWeekly;
    case 'calls': return agent.calls;
    case 'closeRate': return agent.closeRate;
    case 'policies': return agent.policies;
  }
}

/* ── Computed stats ────────────────────────────────────────── */

/* (stat card section removed — stats visible inline in leaderboard) */

/* ── Chart color references ────────────────────────────────── */

const CHART_COLORS = {
  emerald: COLORS.lounges.manager.dark,
  teal: '#0d9488',
  rose: '#fb7185',
  amber: COLORS.semantic.warning,
  gray200: COLORS.gray[200],
  gray400: COLORS.gray[400],
  gray500: COLORS.gray[500],
};

/** Tooltip component using glass morphism from Heritage Design System. */
const GlassTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: RADIUS.button,
        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
        boxShadow: SHADOW.level2,
      }}
    >
      {label && (
        <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.caption, marginBottom: 4 }}>
          {label}
        </p>
      )}
      {payload.map((entry, idx) => (
        <p key={idx} style={{ fontSize: TYPE.micro, color: entry.color, fontWeight: 500 }}>
          {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const FUNNEL_STAGES = [
  { stage: 'Leads', count: 186, color: CHART_COLORS.emerald },
  { stage: 'Contacted', count: 142, color: CHART_COLORS.teal },
  { stage: 'Qualified', count: 94, color: '#14b8a6' },
  { stage: 'Proposal', count: 58, color: '#2dd4bf' },
  { stage: 'Closed Won', count: 38, color: COLORS.semantic.success },
];

const FUNNEL_CHART_DATA = FUNNEL_STAGES.map((s, idx) => ({
  name: s.stage,
  value: s.count,
  fill: s.color,
  convRate: idx > 0 ? `${((s.count / FUNNEL_STAGES[idx - 1].count) * 100).toFixed(0)}%` : '100%',
}));

/* ── Confetti Dots Component ───────────────────────────────── */

function ConfettiDots() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showConfetti) return null;

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const radians = (angle * Math.PI) / 180;
    const distance = 40 + Math.random() * 30;
    const size = 6 + Math.random() * 4;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    return (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
        animate={{
          scale: [0, 1, 0],
          opacity: [1, 1, 0],
          x: Math.cos(radians) * distance,
          y: Math.sin(radians) * distance,
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: RADIUS.pill,
          backgroundColor: color,
          top: '50%',
          left: '50%',
          marginTop: -size / 2,
          marginLeft: -size / 2,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 10 }}>
      {dots}
    </div>
  );
}

/* ── Fibonacci Blob Decoration ─────────────────────────────── */

/** Decorative Fibonacci-sized translucent circles for hero/banner backgrounds. */
function FibonacciBlobs() {
  const positions = [{ w: 89, h: 89, o: 0.15, top: -20, right: 40 }, { w: 55, h: 55, o: 0.1, bottom: -10, left: 60 }, { w: 34, h: 34, o: 0.2, top: 10, left: '40%' }];

  return (
    <>
      {positions.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.w,
            height: p.h,
            borderRadius: RADIUS.pill,
            background: `rgba(255,255,255,${p.o})`,
            ...(p.top !== undefined ? { top: p.top } : {}),
            ...(p.bottom !== undefined ? { bottom: p.bottom } : {}),
            ...(p.left !== undefined ? { left: p.left } : {}),
            ...(p.right !== undefined ? { right: p.right } : {}),
          }}
        />
      ))}
    </>
  );
}

/* ── Component ─────────────────────────────────────────────── */

export function ManagerTeamPerformance() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<Period>('This Week');
  const [viewMode, setViewMode] = useState<ViewMode>('individual');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ap');
  const [activeTab, setActiveTab] = useState('rankings');

  /* Scroll to top on tab change (#29) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  /* Sorted leaderboard based on selected metric */
  const sortedLeaderboard = useMemo(() => {
    const sorted = [...LEADERBOARD].sort(
      (a, b) => getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric)
    );
    return sorted.map((agent, idx) => ({ ...agent, rank: idx + 1 }));
  }, [selectedMetric]);

  /* Team aggregates */
  const teamData = useMemo(() => {
    return TEAMS.map((team) => {
      const members = LEADERBOARD.filter((a) => team.memberIds.includes(a.id));
      const totalAP = members.reduce((s, m) => s + m.apWeekly, 0);
      const totalCalls = members.reduce((s, m) => s + m.calls, 0);
      const avgCloseRate = members.length > 0
        ? Math.round(members.reduce((s, m) => s + m.closeRate, 0) / members.length)
        : 0;
      const totalPolicies = members.reduce((s, m) => s + m.policies, 0);
      const avgStreak = members.length > 0
        ? Math.round(members.reduce((s, m) => s + m.streak, 0) / members.length)
        : 0;
      const activeStreaks = members.filter((m) => m.streak > 0).length;
      return { ...team, members, totalAP, totalCalls, avgCloseRate, totalPolicies, avgStreak, activeStreaks };
    }).sort((a, b) => b.totalAP - a.totalAP);
  }, []);

  /* Current metric config */
  const metricConfig = METRIC_OPTIONS.find((m) => m.key === selectedMetric)!;

  /* Team-level KPIs for Analytics tab */
  const teamKPIs = useMemo(() => {
    const totalAP = LEADERBOARD.reduce((s, a) => s + a.apWeekly, 0);
    const avgQuota = Math.round(LEADERBOARD.reduce((s, a) => s + a.quota, 0) / LEADERBOARD.length);
    const avgCloseRate = Math.round(LEADERBOARD.reduce((s, a) => s + a.closeRate, 0) / LEADERBOARD.length);
    const activeAgents = LEADERBOARD.filter(a => a.apWeekly > 0).length;
    return { totalAP, avgQuota, avgCloseRate, activeAgents };
  }, []);

  /* At-risk agents (negative trend or zero streak with level > 0) */
  const atRiskAgents = useMemo(() => {
    return LEADERBOARD.filter(a => a.trend < 0 || (a.streak === 0 && a.level > 0));
  }, []);

  /* Navigate to agent scorecard (#14) */
  const handleAgentClick = useCallback((agentId: string) => {
    navigate(`/manager/scorecard?agent=${agentId}`);
  }, [navigate]);

  /* Export rankings as CSV (#14) */
  const handleExport = useCallback(() => {
    const headers = ['Rank', 'Name', 'Role', 'Tier', 'AP', 'Calls', 'Close Rate', 'Policies', 'Trend', 'Streak'];
    const rows = sortedLeaderboard.map(a => [
      a.rank, `"${a.name}"`, `"${a.role}"`, TIER_CONFIG[getTier(a.level)].name,
      a.apWeekly, a.calls, a.closeRate, a.policies, a.trend, a.streak,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-rankings-${period.toLowerCase().replace(/\s/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Rankings exported', { description: `${sortedLeaderboard.length} agents` });
  }, [sortedLeaderboard, period]);

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}
      >
        {/* ── Hero (#6: wrapped in fadeInUp) ───────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Trophy}
            title="Team Performance"
            subtitle="Rankings, analytics, contests, and promotions"
          />
        </motion.div>

        {/* ── Section Tabs ──── */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              style={{
                backgroundColor: 'rgba(255,255,255,0.80)',
                border: `1px solid ${COLORS.gray[200]}60`,
                borderRadius: RADIUS.button,
              }}
            >
              <TabsTrigger value="rankings" style={{ borderRadius: RADIUS.button }}>Rankings</TabsTrigger>
              <TabsTrigger value="analytics" style={{ borderRadius: RADIUS.button }}>Analytics</TabsTrigger>
              <TabsTrigger value="contests" style={{ borderRadius: RADIUS.button }}>Contests</TabsTrigger>
              <TabsTrigger value="promotions" style={{ borderRadius: RADIUS.button }}>Promotions</TabsTrigger>
            </TabsList>

            {/* ── Rankings Tab ─────────────────────────────────── */}
            <TabsContent value="rankings" style={{ marginTop: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>

        {/* ── Controls Row ── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.sm }}
        >
          {/* Mode toggle */}
          <div
            role="radiogroup"
            aria-label="View mode"
            className="flex items-center"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button, padding: 3 }}
          >
            {(['individual', 'team'] as const).map((mode) => {
              const isActive = viewMode === mode;
              return (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setViewMode(mode)}
                  style={{
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? COLORS.gray[900] : COLORS.gray[500],
                    borderRadius: RADIUS.button,
                    padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                    fontSize: TYPE.meta,
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    boxShadow: isActive ? SHADOW.level1 : 'none',
                    border: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {mode === 'individual' ? 'Individual' : 'Team'}
                </button>
              );
            })}
          </div>

          {/* Sort by: label + metric pills */}
          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs }}>
            <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Sort by:</span>
            <div
              role="radiogroup"
              aria-label="Sort metric"
              className="flex items-center"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button, padding: 3, gap: 2 }}
            >
              {METRIC_OPTIONS.map((option) => {
                const isActive = selectedMetric === option.key;
                return (
                  <button
                    key={option.key}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedMetric(option.key)}
                    style={{
                      background: isActive ? MANAGER_GRADIENT_CSS : 'transparent',
                      color: isActive ? '#ffffff' : COLORS.gray[600],
                      borderRadius: RADIUS.button,
                      padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                      fontSize: TYPE.meta,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period pills */}
          <div
            role="radiogroup"
            aria-label="Time period"
            className="flex items-center"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button, padding: 3, gap: 2 }}
          >
            {PERIOD_OPTIONS.map((option) => {
              const isActive = period === option;
              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setPeriod(option)}
                  style={{
                    background: isActive ? COLORS.gray[800] : 'transparent',
                    color: isActive ? '#ffffff' : COLORS.gray[500],
                    borderRadius: RADIUS.button,
                    padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                    fontSize: TYPE.caption,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Export button */}
          <motion.button
            onClick={handleExport}
            className="flex items-center border-0 ml-auto"
            style={{
              gap: 4,
              fontSize: TYPE.caption,
              fontWeight: 500,
              color: COLORS.gray[500],
              padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
              borderRadius: RADIUS.button,
              backgroundColor: COLORS.gray[100],
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: COLORS.gray[200] }}
          >
            <Download size={14} /> Export
          </motion.button>
        </motion.div>

        {/* ── Main Content: Individual or Team view ─────────── */}
        <AnimatePresence mode="wait">
          {sortedLeaderboard.length === 0 ? (
            <motion.div key="empty" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
              <ManagerEmptyState icon={Users} title="No agent data available" description="Agent performance data will appear here once available." />
            </motion.div>
          ) : viewMode === 'individual' ? (
            /* ── Individual: Spotlight → Podium → Rank 4+ List ── */
            <motion.div
              key="individual"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}
            >
              {/* ── Top Performer Spotlight ── */}
              {sortedLeaderboard.length > 0 && (() => {
                const top = sortedLeaderboard[0];
                const topTier = TIER_CONFIG[getTier(top.level)];
                return (
                  <motion.div variants={fadeInUp}>
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: EASE }}
                    >
                      <Card
                        data-testid="top-performer-spotlight"
                        onClick={() => handleAgentClick(top.id)}
                        className="border-0 overflow-hidden relative cursor-pointer"
                        style={{ background: MANAGER_GRADIENT_CSS, borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
                      >
                        <FibonacciBlobs />
                        <CardContent className="relative z-10" style={{ padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px` }}>
                          <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
                            {/* Rank badge with confetti */}
                            <div style={{ position: 'relative' }}>
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: 56, height: 56,
                                  background: 'rgba(255,255,255,0.2)',
                                  backdropFilter: 'blur(8px)',
                                  borderRadius: RADIUS.button,
                                }}
                              >
                                <Trophy size={28} style={{ color: COLORS.accent.amber[200] }} />
                              </div>
                              <ConfettiDots />
                            </div>

                            {/* Agent info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                <span style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>Top Performer</span>
                                <span
                                  style={{
                                    fontSize: TYPE.micro, fontWeight: 600,
                                    padding: '2px 8px', borderRadius: RADIUS.pill,
                                    background: topTier.gradient, color: '#fff',
                                  }}
                                >
                                  {topTier.name}
                                </span>
                              </div>
                              <p className="truncate" style={{ fontSize: TYPE.section, fontWeight: 700, color: '#ffffff' }}>{top.name}</p>
                              <p className="truncate" style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.6)' }}>{top.role}</p>
                            </div>

                            {/* Stats cluster */}
                            <div className="hidden sm:flex items-center" style={{ gap: GRID.spacing.md }}>
                              <div className="text-center">
                                <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: '#ffffff' }}>
                                  {metricConfig.format(getMetricValue(top, selectedMetric))}
                                </p>
                                <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>{metricConfig.label}</p>
                              </div>
                              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
                              <div className="text-center">
                                <p style={{ fontSize: TYPE.title, fontWeight: 600, color: '#ffffff' }}>{top.calls}</p>
                                <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>Calls</p>
                              </div>
                              <div className="text-center">
                                <p style={{ fontSize: TYPE.title, fontWeight: 600, color: '#ffffff' }}>{top.closeRate}%</p>
                                <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>Close Rate</p>
                              </div>
                              {top.streak > 0 && (
                                <div className="text-center">
                                  <div className="flex items-center justify-center" style={{ gap: 4, color: COLORS.accent.amber[200] }}>
                                    <Flame size={18} />
                                    <span style={{ fontSize: TYPE.title, fontWeight: 600 }}>{top.streak}d</span>
                                  </div>
                                  <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>Streak</p>
                                </div>
                              )}
                            </div>

                            {/* Trend */}
                            {top.trend !== 0 && (
                              <div
                                className="flex items-center"
                                style={{
                                  gap: 4, padding: `4px ${GRID.spacing.xs}px`,
                                  borderRadius: RADIUS.pill,
                                  background: top.trend > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                  color: top.trend > 0 ? '#a7f3d0' : '#fca5a5',
                                  fontSize: TYPE.meta, fontWeight: 600,
                                }}
                              >
                                {top.trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {top.trend > 0 ? '+' : ''}{top.trend}%
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })()}

              {/* ── #2 & #3 Podium ── */}
              {sortedLeaderboard.length >= 3 && (
                <motion.div variants={fadeInUp}>
                  <ol data-testid="podium-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GRID.spacing.sm, listStyle: 'none', padding: 0, margin: 0 }}>
                    {sortedLeaderboard.slice(1, 3).map((agent, index) => {
                      const Icon = PODIUM_ICONS[index + 1];
                      const tierKey = getTier(agent.level);
                      const tier = TIER_CONFIG[tierKey];
                      return (
                        <li key={agent.id}>
                          <motion.div
                            variants={scaleIn}
                            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                            transition={{ duration: MOTION.duration.hover, ease: EASE }}
                          >
                            <Card
                              onClick={() => handleAgentClick(agent.id)}
                              className="border-0 cursor-pointer h-full"
                              style={{
                                ...glassCard,
                                borderRadius: RADIUS.card,
                                boxShadow: SHADOW.card,
                              }}
                            >
                              <CardContent style={{ padding: GRID.spacing.md, textAlign: 'center' }}>
                                {/* Medal/Crown */}
                                <div
                                  className="mx-auto flex items-center justify-center"
                                  style={{
                                    width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                                    borderRadius: RADIUS.pill,
                                    ...getRankBadgeStyle(agent.rank),
                                    marginBottom: GRID.spacing.xs,
                                  }}
                                >
                                  <Icon size={LAYOUT.icon.md} style={{ color: '#ffffff' }} />
                                </div>

                                {/* Avatar */}
                                <div
                                  className="mx-auto flex items-center justify-center text-white"
                                  style={{
                                    width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl,
                                    borderRadius: RADIUS.button,
                                    background: ICON_BADGE_GRADIENT,
                                    fontSize: TYPE.meta, fontWeight: 700,
                                    boxShadow: SHADOW.level1,
                                    marginBottom: GRID.spacing.xs,
                                  }}
                                >
                                  {agent.avatar}
                                </div>

                                <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{agent.name}</p>
                                <p className="truncate" style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{agent.role}</p>

                                {/* Primary metric */}
                                <p style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.accent.amber[600], marginTop: 4 }}>
                                  {metricConfig.format(getMetricValue(agent, selectedMetric))}
                                </p>
                                <p style={{ fontSize: 9, color: COLORS.gray[400] }}>{metricConfig.label}</p>

                                {/* Sub stats 3-col */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: GRID.spacing.xs, paddingTop: GRID.spacing.xs, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                  <div>
                                    <p style={{ fontSize: TYPE.micro, fontWeight: 700, color: COLORS.gray[700] }}>{agent.calls}</p>
                                    <p style={{ fontSize: 9, color: COLORS.gray[400] }}>Calls</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: TYPE.micro, fontWeight: 700, color: COLORS.gray[700] }}>{agent.closeRate}%</p>
                                    <p style={{ fontSize: 9, color: COLORS.gray[400] }}>Close</p>
                                  </div>
                                  <div>
                                    <p style={{
                                      fontSize: TYPE.micro, fontWeight: 700,
                                      color: agent.trend > 0 ? COLORS.semantic.success : agent.trend < 0 ? COLORS.semantic.error : COLORS.gray[400],
                                    }}>
                                      {agent.trend > 0 ? '+' : ''}{agent.trend}%
                                    </p>
                                    <p style={{ fontSize: 9, color: COLORS.gray[400] }}>Trend</p>
                                  </div>
                                </div>

                                {/* Tier + Streak */}
                                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.xs }}>
                                  <span
                                    style={{
                                      fontSize: TYPE.micro, fontWeight: 600,
                                      padding: '2px 8px', borderRadius: RADIUS.pill,
                                      background: tier.gradient, color: '#fff',
                                    }}
                                  >
                                    {tier.name}
                                  </span>
                                  {agent.streak > 0 && (
                                    <span className="flex items-center" style={{ gap: 2, fontSize: TYPE.micro, fontWeight: 600, color: COLORS.semantic.warning }}>
                                      <Flame size={10} />{agent.streak}d
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ol>
                </motion.div>
              )}

              {/* ── Rank 4+ Leaderboard ── */}
              {sortedLeaderboard.length > 3 && (
                <motion.div variants={fadeInUp}>
                  <Card
                    className="border-0"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.level1 }}
                  >
                    <CardContent style={{ padding: 0 }}>
                      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sortedLeaderboard.slice(3).map((agent) => {
                          const tierKey = getTier(agent.level);
                          const tier = TIER_CONFIG[tierKey];
                          return (
                            <li
                              key={agent.id}
                              onClick={() => handleAgentClick(agent.id)}
                              className="flex items-center"
                              style={{
                                padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.md}px`,
                                gap: GRID.spacing.sm,
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = COLORS.gray[50]; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              {/* Rank */}
                              <span style={{ width: 32, fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[400], textAlign: 'center', flexShrink: 0 }}>
                                #{agent.rank}
                              </span>

                              {/* Avatar */}
                              <div
                                className="flex items-center justify-center text-white flex-shrink-0"
                                style={{
                                  width: LAYOUT.icon.xl, height: LAYOUT.icon.xl,
                                  borderRadius: RADIUS.button,
                                  background: ICON_BADGE_GRADIENT,
                                  fontSize: TYPE.micro, fontWeight: 700,
                                }}
                              >
                                {agent.avatar}
                              </div>

                              {/* Name + Role */}
                              <div className="flex-1 min-w-0">
                                <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{agent.name}</p>
                                <p className="truncate" style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{agent.role}</p>
                              </div>

                              {/* Tier badge */}
                              <span
                                className="hidden sm:inline-block flex-shrink-0"
                                style={{
                                  fontSize: TYPE.micro, fontWeight: 600,
                                  padding: '2px 8px', borderRadius: RADIUS.pill,
                                  background: tier.gradient, color: '#fff',
                                }}
                              >
                                {tier.name}
                              </span>

                              {/* Streak */}
                              {agent.streak > 0 && (
                                <span className="hidden sm:flex items-center flex-shrink-0" style={{ gap: 2, fontSize: TYPE.micro, fontWeight: 600, color: COLORS.semantic.warning }}>
                                  <Flame size={10} />{agent.streak}d
                                </span>
                              )}

                              {/* Metric value */}
                              <span style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.accent.amber[600], minWidth: 70, textAlign: 'right', flexShrink: 0 }}>
                                {metricConfig.format(getMetricValue(agent, selectedMetric))}
                              </span>

                              {/* Calls + Close Rate */}
                              <div className="hidden md:flex items-center flex-shrink-0" style={{ gap: GRID.spacing.sm, minWidth: 110 }}>
                                <div className="flex items-center" style={{ gap: 3 }}>
                                  <Phone size={12} style={{ color: COLORS.gray[400] }} />
                                  <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{agent.calls}</span>
                                </div>
                                <div className="flex items-center" style={{ gap: 3 }}>
                                  <Target size={12} style={{ color: COLORS.gray[400] }} />
                                  <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{agent.closeRate}%</span>
                                </div>
                              </div>

                              {/* Trend */}
                              <div
                                className="flex items-center flex-shrink-0"
                                style={{
                                  gap: 2, fontSize: TYPE.caption, fontWeight: 600, minWidth: 50, justifyContent: 'flex-end',
                                  color: agent.trend > 0 ? COLORS.semantic.success : agent.trend < 0 ? COLORS.semantic.error : COLORS.gray[400],
                                }}
                              >
                                {agent.trend > 0 ? (
                                  <><ArrowUp size={LAYOUT.icon.xs} />+{agent.trend}%</>
                                ) : agent.trend < 0 ? (
                                  <><ArrowDown size={LAYOUT.icon.xs} />{agent.trend}%</>
                                ) : (
                                  <span style={{ color: COLORS.gray[300] }}>--</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ── Team View (#21: responsive grid) ──────────── */
            <motion.div
              key="team"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: GRID.spacing.sm,
              }}
            >
              {teamData.map((team, idx) => {
                const isTopTeam = idx === 0;
                return (
                  <motion.div
                    key={team.id}
                    variants={fadeInUp}
                    whileHover={{
                      y: -2,
                      boxShadow: SHADOW.level2,
                      transition: { duration: MOTION.duration.hover },
                    }}
                    style={{
                      ...glassCard,
                      border: isTopTeam
                        ? `2px solid rgba(${245},${158},${11},0.4)`
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: RADIUS.card,
                      boxShadow: isTopTeam
                        ? `0 8px 12px rgba(0,0,0,0.04), 0 0 16px rgba(${245},${158},${11},0.15)`
                        : SHADOW.card,
                      padding: GRID.spacing.md,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: GRID.spacing.sm,
                    }}
                  >
                    {/* Team rank + name */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xl + 4,
                          height: LAYOUT.icon.xl + 4,
                          borderRadius: RADIUS.button,
                          fontSize: isTopTeam ? 0 : TYPE.meta,
                          fontWeight: 700,
                          ...getRankBadgeStyle(idx + 1),
                        }}
                      >
                        {isTopTeam ? (
                          <Trophy size={LAYOUT.icon.sm + 2} style={{ color: '#ffffff' }} />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>
                      <div>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <span style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.title }}>
                            {team.name}
                          </span>
                          {isTopTeam && (
                            <Star size={LAYOUT.icon.sm} style={{ color: COLORS.accent.amber[500], fill: COLORS.accent.amber[500] }} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member avatars row */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-center text-white"
                          title={member.name}
                          onClick={() => handleAgentClick(member.id)}
                          style={{
                            width: LAYOUT.icon.xl,
                            height: LAYOUT.icon.xl,
                            borderRadius: RADIUS.button,
                            background: ICON_BADGE_GRADIENT,
                            fontSize: TYPE.micro,
                            fontWeight: 700,
                            boxShadow: SHADOW.level1,
                            cursor: 'pointer',
                          }}
                        >
                          {member.avatar}
                        </div>
                      ))}
                    </div>

                    {/* Aggregate metrics (#21: responsive wrap) */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: GRID.spacing.xs,
                        paddingTop: GRID.spacing.xs,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Total AP</p>
                        <p style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.accent.amber[600] }}>
                          ${(team.totalAP / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Calls</p>
                        <p style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>
                          {team.totalCalls}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Close Rate</p>
                        <p style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>
                          {team.avgCloseRate}%
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: GRID.spacing.xs,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Policies</p>
                        <p style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>
                          {team.totalPolicies}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Streaks</p>
                        <div className="flex items-center" style={{ gap: 3 }}>
                          <Flame size={12} style={{ color: COLORS.semantic.warning }} />
                          <p style={{ fontSize: TYPE.body, fontWeight: 700, color: COLORS.gray[900] }}>
                            {team.activeStreaks}/{team.members.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

            </TabsContent>

            {/* ── Analytics Tab ─────────────────────────────────── */}
            <TabsContent value="analytics" style={{ marginTop: GRID.spacing.sm }}>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
              >

                {/* ─── Team KPI Summary Cards ─── */}
                <motion.div variants={fadeInUp}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GRID.spacing.sm }}>
                    {[
                      { icon: DollarSign, label: 'Total Team AP', value: `$${(teamKPIs.totalAP / 1000).toFixed(1)}K`, sub: 'weekly production' },
                      { icon: Target, label: 'Team Quota', value: `${teamKPIs.avgQuota}%`, sub: 'avg attainment' },
                      { icon: Activity, label: 'Avg Close Rate', value: `${teamKPIs.avgCloseRate}%`, sub: 'across team' },
                      { icon: Users, label: 'Active Agents', value: `${teamKPIs.activeAgents}`, sub: `of ${LEADERBOARD.length} total` },
                    ].map((kpi, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                      >
                        <Card
                          className="overflow-hidden border-0 relative h-full"
                          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero, background: MANAGER_GRADIENT_CSS }}
                        >
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                          <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                              <div className="flex items-center justify-center" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                                <kpi.icon size={LAYOUT.icon.sm} style={{ color: '#ffffff' }} />
                              </div>
                              <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{kpi.label}</span>
                            </div>
                            <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: '#ffffff' }}>{kpi.value}</p>
                            <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{kpi.sub}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* ─── Conversion Funnel (#10: show X-axis for scale) ─── */}
                <motion.div variants={fadeInUp}>
                  <Card
                    className="border-0"
                    style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, fontWeight: 600, gap: GRID.spacing.sm }}>
                        <div
                          className="flex items-center justify-center"
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: ICON_BADGE_GRADIENT, boxShadow: ICON_BADGE_SHADOW }}
                        >
                          <FilterIcon size={LAYOUT.icon.md} style={{ color: COLORS.accent.amber[200] }} />
                        </div>
                        <span style={{ color: COLORS.gray[900] }}>Conversion Funnel</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={FUNNEL_CHART_DATA}
                          layout="vertical"
                          margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                          barCategoryGap="20%"
                        >
                          <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: COLORS.gray[400], fontSize: TYPE.micro }}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: COLORS.gray[700], fontSize: TYPE.meta, fontWeight: 600 }}
                            width={90}
                          />
                          <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(16,185,129,0.04)' }} />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={800}>
                            {FUNNEL_CHART_DATA.map((entry, idx) => (
                              <Cell key={idx} fill={entry.fill} />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="right"
                              style={{ fill: COLORS.gray[700], fontWeight: 700, fontSize: TYPE.meta }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {/* Conversion rates */}
                      <div className="flex items-center justify-center flex-wrap" style={{ gap: GRID.spacing.sm, marginTop: GRID.spacing.xs }}>
                        {FUNNEL_CHART_DATA.map((s, idx) => {
                          if (idx === 0) return null;
                          return (
                            <div key={s.name} className="flex items-center" style={{ gap: 4 }}>
                              <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{FUNNEL_CHART_DATA[idx - 1].name} &rarr;</span>
                              <span style={{ fontSize: TYPE.caption, fontWeight: 700, color: COLORS.lounges.manager.dark }}>{s.convRate}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ─── Team Product Mix ─── */}
                <motion.div variants={fadeInUp}>
                  <Card className="border-0" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, fontWeight: 600, gap: GRID.spacing.sm }}>
                        <div
                          className="flex items-center justify-center"
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: ICON_BADGE_GRADIENT, boxShadow: ICON_BADGE_SHADOW }}
                        >
                          <PieChart size={LAYOUT.icon.md} style={{ color: COLORS.accent.amber[200] }} />
                        </div>
                        <span style={{ color: COLORS.gray[900] }}>Team Product Mix</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                        {TEAM_PRODUCT_MIX.map((p) => {
                          const maxCommission = Math.max(...TEAM_PRODUCT_MIX.map(x => x.commission));
                          const barWidth = Math.max((p.commission / maxCommission) * 100, 15);
                          return (
                            <div key={p.product}>
                              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}>{p.product}</span>
                                <span style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.gray[900] }}>${(p.commission / 1000).toFixed(1)}K</span>
                              </div>
                              <div style={{ position: 'relative', height: 28, background: COLORS.gray[100], borderRadius: RADIUS.button, overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidth}%` }}
                                  transition={{ duration: 0.6, ease: EASE }}
                                  style={{
                                    height: '100%',
                                    background: PRODUCT_COLORS[p.product] || COLORS.gray[400],
                                    borderRadius: RADIUS.button,
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: GRID.spacing.xs,
                                  }}
                                >
                                  <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: '#ffffff' }}>{p.percent}%</span>
                                </motion.div>
                              </div>
                              <div className="flex items-center" style={{ gap: GRID.spacing.md, marginTop: 4 }}>
                                <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{p.policies} agents</span>
                                <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Avg Premium: ${p.avgPremium.toLocaleString()}</span>
                                <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>Rate: {p.rate}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ─── Team Lead Source ROI ─── */}
                <motion.div variants={fadeInUp}>
                  <Card className="border-0" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, fontWeight: 600, gap: GRID.spacing.sm }}>
                        <div
                          className="flex items-center justify-center"
                          style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: ICON_BADGE_GRADIENT, boxShadow: ICON_BADGE_SHADOW }}
                        >
                          <Target size={LAYOUT.icon.md} style={{ color: COLORS.accent.amber[200] }} />
                        </div>
                        <span style={{ color: COLORS.gray[900] }}>Lead Source ROI</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: TYPE.meta }}>
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${COLORS.gray[200]}` }}>
                              {['Source', 'Leads', 'Conv.', 'Rate', 'Spend', 'ROI'].map((h) => (
                                <th key={h} style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, textAlign: 'left', fontWeight: 600, color: COLORS.gray[500], fontSize: TYPE.micro }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {TEAM_LEAD_SOURCE_ROI.map((row) => (
                              <tr key={row.source} style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                                <td style={{ padding: `${GRID.spacing.xs}px`, fontWeight: 600, color: COLORS.gray[900] }}>
                                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                    <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, background: row.color, flexShrink: 0 }} />
                                    {row.source}
                                  </div>
                                </td>
                                <td style={{ padding: `${GRID.spacing.xs}px`, color: COLORS.gray[700] }}>{row.leads}</td>
                                <td style={{ padding: `${GRID.spacing.xs}px`, color: COLORS.gray[700] }}>{row.conversions}</td>
                                <td style={{ padding: `${GRID.spacing.xs}px`, fontWeight: 600, color: COLORS.lounges.manager.dark }}>{row.convRate}%</td>
                                <td style={{ padding: `${GRID.spacing.xs}px`, color: COLORS.gray[500] }}>${row.spend.toLocaleString()}</td>
                                <td style={{ padding: `${GRID.spacing.xs}px` }}>
                                  <span
                                    style={{
                                      fontSize: TYPE.micro, fontWeight: 600,
                                      padding: '2px 8px', borderRadius: RADIUS.pill,
                                      background: row.roi === Infinity ? COLORS.lounges.manager.light : row.roi > 3000 ? COLORS.lounges.manager.light : `rgba(239,68,68,0.08)`,
                                      color: row.roi === Infinity ? COLORS.lounges.manager.dark : row.roi > 3000 ? COLORS.lounges.manager.dark : COLORS.semantic.error,
                                    }}
                                  >
                                    {row.roi === Infinity ? '∞' : `${Math.round(row.roi / 100)}x`}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ─── At-Risk Agents ─── */}
                {atRiskAgents.length > 0 && (
                  <motion.div variants={fadeInUp}>
                    <Card
                      data-testid="at-risk-agents"
                      className="border-0 overflow-hidden"
                      style={{
                        borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      }}
                    >
                      <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                        <CardTitle className="flex items-center" style={{ fontSize: TYPE.title, fontWeight: 600, gap: GRID.spacing.sm }}>
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button,
                              background: `linear-gradient(135deg, ${COLORS.semantic.warning} 0%, ${COLORS.accent.amber[600]} 100%)`,
                              boxShadow: SHADOW.glow.amber,
                            }}
                          >
                            <AlertTriangle size={LAYOUT.icon.md} style={{ color: '#ffffff' }} />
                          </div>
                          <span style={{ color: COLORS.gray[900] }}>At-Risk Agents</span>
                          <span
                            style={{
                              fontSize: TYPE.micro, fontWeight: 600,
                              padding: '2px 8px', borderRadius: RADIUS.pill,
                              background: COLORS.accent.amber[600], color: '#fff', marginLeft: 'auto',
                            }}
                          >
                            {atRiskAgents.length} flagged
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                          {atRiskAgents.map((agent) => (
                            <div
                              key={agent.id}
                              className="flex items-center"
                              style={{
                                gap: GRID.spacing.sm,
                                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                                background: 'rgba(255,255,255,0.6)',
                                borderRadius: RADIUS.button,
                              }}
                            >
                              <div
                                className="flex items-center justify-center text-white flex-shrink-0"
                                style={{
                                  width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button,
                                  background: ICON_BADGE_GRADIENT, fontSize: TYPE.micro, fontWeight: 700,
                                }}
                              >
                                {agent.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{agent.name}</p>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  {agent.trend < 0 && (
                                    <span className="flex items-center" style={{ gap: 2, fontSize: TYPE.micro, fontWeight: 600, color: COLORS.semantic.error }}>
                                      <ArrowDown size={10} />{agent.trend}% trend
                                    </span>
                                  )}
                                  {agent.streak === 0 && agent.level > 0 && (
                                    <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: COLORS.accent.amber[700] }}>No streak</span>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                onClick={() => navigate(`/manager/scorecard?agent=${agent.id}`)}
                                className="flex items-center flex-shrink-0 border-0"
                                style={{
                                  gap: 4, fontSize: TYPE.micro, fontWeight: 600,
                                  padding: `4px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill,
                                  background: MANAGER_GRADIENT_CSS, color: '#fff', cursor: 'pointer',
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Coach
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              </motion.div>
            </TabsContent>

            {/* ── Contests Tab ──────────────────────────────────── */}
            <TabsContent value="contests" style={{ marginTop: GRID.spacing.sm }}>
              <ContestsTabContent />
            </TabsContent>

            {/* ── Promotions Tab ────────────────────────────────── */}
            <TabsContent value="promotions" style={{ marginTop: GRID.spacing.sm }}>
              <PromotionsTabContent />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerTeamPerformance;
