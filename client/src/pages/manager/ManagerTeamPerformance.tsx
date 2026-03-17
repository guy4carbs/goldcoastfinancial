/**
 * Manager Team Performance — Consolidated Performance Hub
 * Merged from ManagerLeaderboard + ManagerPerformance
 * Rankings, analytics, contests, and promotions in a single page.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerEmptyState } from './primitives';
import { glassCard, MANAGER_GRADIENT_CSS, DEMO_TEAM_MEMBERS } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, COLORS, LAYOUT,
  fadeInUp, staggerContainer, scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  Trophy, DollarSign, Users, Target,
  ArrowUp, ArrowDown, Star, ChevronDown, Calendar,
  Activity, Flame, AlertTriangle, Download,
  Crown, Medal,
} from 'lucide-react';
import { toast } from 'sonner';
import { PromotionsTabContent } from './ManagerPromotions';
import { ContestsTabContent } from './ManagerContests';

/* ── Design system icon badge tokens ───────────────────── */
const ICON_BADGE_GRADIENT = `linear-gradient(135deg, ${COLORS.lounges.manager.main} 0%, ${COLORS.lounges.manager.dark} 100%)`;
const ICON_BADGE_SHADOW = SHADOW.glow.emerald;

/* ── Easing cast for Framer Motion ────────────────────────── */
const EASE: [number, number, number, number] = [...MOTION.easing];

/* ── Podium constants ─────────────────────────────────────── */
const PODIUM_ICONS = [Crown, Medal, Medal] as const;
const PODIUM_GRADIENTS = [
  `linear-gradient(135deg, ${COLORS.accent.amber[400]} 0%, ${COLORS.accent.amber[500]} 100%)`,
  'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
  `linear-gradient(135deg, ${COLORS.accent.amber[600]} 0%, ${COLORS.accent.amber[700]} 100%)`,
];

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

/* ── Currency formatting ──────────────────────────────────── */
function formatAP(v: number): string {
  if (v <= 0) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v}`;
}

/* ── Metric options for the selector ───────────────────────── */

const METRIC_OPTIONS = [
  { key: 'ap', label: 'AP', format: formatAP },
  { key: 'calls', label: 'Calls', format: (v: number) => `${v}` },
  { key: 'closeRate', label: 'Close Rate', format: (v: number) => `${v}%` },
  { key: 'policies', label: 'Policies', format: (v: number) => `${v}` },
] as const;

type MetricKey = (typeof METRIC_OPTIONS)[number]['key'];

/* ── Period filter options ─────────────────────────────────── */

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Quarter', 'All Time'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── Period scaling — makes data change across periods ────── */
type PeriodKey = 'week' | 'month' | 'quarter' | 'allTime';
const PERIOD_KEY_MAP: Record<Period, PeriodKey> = {
  'This Week': 'week', 'This Month': 'month', 'This Quarter': 'quarter', 'All Time': 'allTime',
};
const PERIOD_SCALE: Record<PeriodKey, number> = { week: 1, month: 4.3, quarter: 13, allTime: 52 };

/** Deterministic per-agent variance so rankings shift between periods */
function agentPeriodFactor(id: string, pIdx: number): number {
  const seed = parseInt(id) * 17 + pIdx * 31;
  return 0.82 + ((seed * 13) % 36) / 100; // 0.82–1.17
}
const PERIOD_IDX: Record<PeriodKey, number> = { week: 0, month: 1, quarter: 2, allTime: 3 };

/* ── View mode ──────────────────────────────────────────────── */

type ViewMode = 'individual' | 'team';

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
function getMetricValue(agent: { apWeekly: number; calls: number; closeRate: number; policies: number }, metric: MetricKey): number {
  switch (metric) {
    case 'ap': return agent.apWeekly;
    case 'calls': return agent.calls;
    case 'closeRate': return agent.closeRate;
    case 'policies': return agent.policies;
  }
}

/* ── Computed stats ────────────────────────────────────────── */

/* (stat card section removed — stats visible inline in leaderboard) */

/* ── Component ─────────────────────────────────────────────── */

export function ManagerTeamPerformance() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<Period>('This Week');
  const [viewMode, setViewMode] = useState<ViewMode>('individual');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ap');
  const [activeTab, setActiveTab] = useState('rankings');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  /* Close period dropdown on outside click */
  useEffect(() => {
    if (!showPeriodDropdown) return;
    const handler = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setShowPeriodDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPeriodDropdown]);

  /* Scroll to top on tab change (#29) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  /* ── Period-scaled leaderboard ────────────────────────────── */
  const periodKey = PERIOD_KEY_MAP[period];

  const periodLeaderboard = useMemo(() => {
    const scale = PERIOD_SCALE[periodKey];
    const pIdx = PERIOD_IDX[periodKey];
    return LEADERBOARD.map((agent) => {
      if (periodKey === 'week') return agent;
      const v = agentPeriodFactor(agent.id, pIdx);
      return {
        ...agent,
        apWeekly: Math.round(agent.apWeekly * scale * v),
        calls: Math.round(agent.calls * scale * v),
        policies: Math.round(agent.policies * scale * v),
        closeRate: Math.min(40, Math.max(0, Math.round(agent.closeRate + (v - 1) * 12))),
        trend: Math.round(agent.trend * (v > 1 ? 1.3 : 0.6)),
      };
    });
  }, [periodKey]);

  /* Sorted leaderboard based on selected metric */
  const sortedLeaderboard = useMemo(() => {
    const sorted = [...periodLeaderboard].sort(
      (a, b) => getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric)
    );
    return sorted.map((agent, idx) => ({ ...agent, rank: idx + 1 }));
  }, [periodLeaderboard, selectedMetric]);

  /* Team aggregates (period-aware) */
  const teamData = useMemo(() => {
    return TEAMS.map((team) => {
      const members = periodLeaderboard.filter((a) => team.memberIds.includes(a.id));
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
    }).sort((a, b) => {
      if (selectedMetric === 'calls') return b.totalCalls - a.totalCalls;
      if (selectedMetric === 'closeRate') return b.avgCloseRate - a.avgCloseRate;
      if (selectedMetric === 'policies') return b.totalPolicies - a.totalPolicies;
      return b.totalAP - a.totalAP;
    });
  }, [periodLeaderboard, selectedMetric]);

  /* Current metric config */
  const metricConfig = METRIC_OPTIONS.find((m) => m.key === selectedMetric)!;

  /* Team-level KPIs for Analytics tab (period-aware) */
  const teamKPIs = useMemo(() => {
    const totalAP = periodLeaderboard.reduce((s, a) => s + a.apWeekly, 0);
    const avgCloseRate = Math.round(periodLeaderboard.reduce((s, a) => s + a.closeRate, 0) / periodLeaderboard.length);
    const totalPolicies = periodLeaderboard.reduce((s, a) => s + a.policies, 0);
    return { totalAP, avgCloseRate, totalPolicies };
  }, [periodLeaderboard]);

  /* At-risk agents (period-aware) */
  const atRiskAgents = useMemo(() => {
    return periodLeaderboard.filter(a => a.trend < 0 || (a.streak === 0 && a.level > 0));
  }, [periodLeaderboard]);

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
            className="!overflow-visible"
          >
            {/* Period selector pill */}
            <div className="relative" ref={periodDropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center border-0"
                style={{
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: RADIUS.pill,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: TYPE.meta,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
              >
                <Calendar size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
                {period}
                <motion.div
                  animate={{ rotate: showPeriodDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ display: 'flex' }}
                >
                  <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showPeriodDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: GRID.spacing.xs,
                      borderRadius: RADIUS.card,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.97) 100%)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      padding: GRID.spacing.xs,
                      minWidth: 170,
                      zIndex: 50,
                    }}
                  >
                    {PERIOD_OPTIONS.map((option) => {
                      const isActive = period === option;
                      return (
                        <button
                          key={option}
                          onClick={() => { setPeriod(option); setShowPeriodDropdown(false); }}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.meta,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? COLORS.lounges.manager.dark : COLORS.gray[600],
                            background: isActive ? COLORS.lounges.manager.light : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = COLORS.gray[100]; }}
                          onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export pill */}
            <button
              onClick={handleExport}
              className="flex items-center border-0"
              style={{
                gap: 8,
                padding: '10px 18px',
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontSize: TYPE.meta,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <Download size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
              Export
            </button>
          </ManagerPageHero>
        </motion.div>

        {/* ── Section Tabs ──── */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="w-fit border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {(['rankings', 'analytics', 'contests', 'promotions'] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
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
            className="flex items-center p-1 gap-1"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
          >
            {(['individual', 'team'] as const).map((mode) => {
              const isActive = viewMode === mode;
              return (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setViewMode(mode)}
                  className={`font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{
                    borderRadius: RADIUS.button,
                    padding: '4px 12px',
                    fontSize: TYPE.meta,
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
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
              className="flex items-center p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {METRIC_OPTIONS.map((option) => {
                const isActive = selectedMetric === option.key;
                return (
                  <button
                    key={option.key}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedMetric(option.key)}
                    className={`font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                    style={{
                      borderRadius: RADIUS.button,
                      padding: '4px 12px',
                      fontSize: TYPE.meta,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

        </motion.div>

        {/* ── Main Content: Individual or Team view ─────────── */}
        <AnimatePresence mode="wait">
          {sortedLeaderboard.length === 0 ? (
            <motion.div key="empty" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
              <ManagerEmptyState icon={Users} title="No agent data available" description="Agent performance data will appear here once available." />
            </motion.div>
          ) : viewMode === 'individual' ? (
            /* ── Individual: Redesigned Leaderboard ── */
            <motion.div
              key="individual"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}
            >
              {/* ── Top Performer Card ── */}
              {sortedLeaderboard.length > 0 && (() => {
                const top = sortedLeaderboard[0];
                return (
                  <motion.div variants={fadeInUp}>
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: EASE }}
                    >
                      <Card
                        className="border-0 overflow-hidden relative cursor-pointer"
                        onClick={() => handleAgentClick(top.id)}
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                          background: MANAGER_GRADIENT_CSS,
                        }}
                      >
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                        <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                          <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                            <div
                              className="flex items-center justify-center flex-shrink-0"
                              style={{
                                width: 48, height: 48,
                                borderRadius: RADIUS.button,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(8px)',
                                color: '#fde68a',
                                fontWeight: 700,
                                fontSize: TYPE.title,
                              }}
                            >
                              #1
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>Top Performer</p>
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                <p className="truncate" style={{ fontWeight: 700, color: '#ffffff', fontSize: TYPE.body }}>{top.name}</p>
                                {top.trend > 0 && (
                                  <span className="flex items-center flex-shrink-0" style={{ fontSize: TYPE.micro, color: '#86efac', gap: 2 }}>
                                    <ArrowUp size={10} />+{top.trend}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ fontSize: TYPE.title, fontWeight: 700, color: '#ffffff' }}>
                                {metricConfig.format(getMetricValue(top, selectedMetric))}
                              </p>
                              <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)' }}>{metricConfig.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })()}

              {/* ── Top 3 Podium ── */}
              <motion.div variants={fadeInUp}>
                <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: GRID.spacing.sm, listStyle: 'none', padding: 0, margin: 0 }}>
                  {sortedLeaderboard.slice(0, 3).map((agent, index) => {
                    const Icon = PODIUM_ICONS[index];
                    return (
                      <li key={agent.id}>
                        <motion.div
                          variants={scaleIn}
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: EASE }}
                        >
                          <Card
                            className="border-0 cursor-pointer"
                            onClick={() => handleAgentClick(agent.id)}
                            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                          >
                            <CardContent style={{ padding: GRID.spacing.sm, textAlign: 'center' }}>
                              <div
                                className="flex items-center justify-center mx-auto"
                                style={{
                                  width: 40, height: 40, borderRadius: RADIUS.pill,
                                  background: PODIUM_GRADIENTS[index],
                                  boxShadow: SHADOW.level1,
                                  marginBottom: GRID.spacing.xs,
                                }}
                              >
                                <Icon size={20} style={{ color: '#ffffff' }} />
                              </div>
                              <p className="truncate" style={{ fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[800] }}>{agent.name}</p>
                              <p style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.accent.amber[600] }}>
                                {metricConfig.format(getMetricValue(agent, selectedMetric))}
                              </p>
                              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{metricConfig.label}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </li>
                    );
                  })}
                </ol>
              </motion.div>

              {/* ── Full Leaderboard (4+) ── */}
              {sortedLeaderboard.length > 3 && (
                <motion.div variants={fadeInUp}>
                  <Card
                    className="border-0"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
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
                                borderBottom: `1px solid ${COLORS.gray[100]}`,
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = COLORS.gray[50]; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              <span style={{ width: 32, fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[400] }}>#{agent.rank}</span>
                              <div
                                className="flex items-center justify-center text-white flex-shrink-0"
                                style={{
                                  width: 32, height: 32,
                                  borderRadius: RADIUS.button,
                                  background: tier.gradient,
                                  fontSize: TYPE.micro, fontWeight: 700,
                                }}
                              >
                                {agent.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{agent.name}</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 600, fontSize: TYPE.meta, color: COLORS.gray[900] }}>
                                  {metricConfig.format(getMetricValue(agent, selectedMetric))}
                                </p>
                                <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{metricConfig.label}</p>
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
            /* ── Team View ──────────────────────────────────── */
            <motion.div
              key="team"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}
            >
              {teamData.map((team, idx) => {
                const isTopTeam = idx === 0;
                const isExpanded = expandedTeam === team.id;
                return (
                  <motion.div
                    key={team.id}
                    variants={fadeInUp}
                    style={{
                      ...glassCard,
                      border: isTopTeam
                        ? `2px solid rgba(${245},${158},${11},0.4)`
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: RADIUS.card,
                      boxShadow: isTopTeam
                        ? `0 8px 12px rgba(0,0,0,0.04), 0 0 16px rgba(${245},${158},${11},0.15)`
                        : SHADOW.card,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Clickable header */}
                    <div
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      style={{
                        padding: GRID.spacing.md,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: GRID.spacing.sm,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = COLORS.gray[50]; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {/* Team rank + name + chevron */}
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
                        <div className="flex-1">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <span style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.title }}>
                              {team.name}
                            </span>
                            {isTopTeam && (
                              <Star size={LAYOUT.icon.sm} style={{ color: COLORS.accent.amber[500], fill: COLORS.accent.amber[500] }} />
                            )}
                          </div>
                          <span style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                            {team.members.length} agents
                          </span>
                        </div>
                        <span style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.accent.amber[600] }}>
                          {selectedMetric === 'ap'
                            ? formatAP(team.totalAP)
                            : selectedMetric === 'calls'
                              ? `${team.totalCalls} calls`
                              : selectedMetric === 'closeRate'
                                ? `${team.avgCloseRate}% close`
                                : `${team.totalPolicies} policies`}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        >
                          <ChevronDown size={18} style={{ color: COLORS.gray[400] }} />
                        </motion.div>
                      </div>

                      {/* Member avatars row */}
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-center text-white"
                            title={member.name}
                            style={{
                              width: LAYOUT.icon.xl,
                              height: LAYOUT.icon.xl,
                              borderRadius: RADIUS.button,
                              background: ICON_BADGE_GRADIENT,
                              fontSize: TYPE.micro,
                              fontWeight: 700,
                              boxShadow: SHADOW.level1,
                            }}
                          >
                            {member.avatar}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded agent list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          {/* Aggregate stats row */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(5, 1fr)',
                              gap: GRID.spacing.xs,
                              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                              borderTop: '1px solid rgba(0,0,0,0.06)',
                              background: COLORS.gray[50],
                            }}
                          >
                            {[
                              { label: 'Total AP', value: formatAP(team.totalAP), highlight: true },
                              { label: 'Calls', value: `${team.totalCalls}` },
                              { label: 'Close Rate', value: `${team.avgCloseRate}%` },
                              { label: 'Policies', value: `${team.totalPolicies}` },
                              { label: 'Streaks', value: `${team.activeStreaks}/${team.members.length}`, flame: true },
                            ].map((stat) => (
                              <div key={stat.label}>
                                <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{stat.label}</p>
                                <div className="flex items-center" style={{ gap: 3 }}>
                                  {stat.flame && <Flame size={11} style={{ color: COLORS.semantic.warning }} />}
                                  <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: stat.highlight ? COLORS.accent.amber[600] : COLORS.gray[900] }}>
                                    {stat.value}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Individual agent rows */}
                          <div>
                            {[...team.members]
                              .sort((a, b) => getMetricValue(b, selectedMetric) - getMetricValue(a, selectedMetric))
                              .map((member, mIdx) => {
                                const tierKey = getTier(member.level);
                                const tier = TIER_CONFIG[tierKey];
                                return (
                                  <div
                                    key={member.id}
                                    onClick={() => handleAgentClick(member.id)}
                                    className="flex items-center"
                                    style={{
                                      padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.md}px`,
                                      gap: GRID.spacing.sm,
                                      cursor: 'pointer',
                                      borderTop: `1px solid ${COLORS.gray[100]}`,
                                      transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = COLORS.gray[50]; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                  >
                                    <span style={{ width: 20, fontSize: TYPE.micro, fontWeight: 500, color: COLORS.gray[400] }}>{mIdx + 1}</span>
                                    <div
                                      className="flex items-center justify-center text-white flex-shrink-0"
                                      style={{
                                        width: 28, height: 28,
                                        borderRadius: RADIUS.button,
                                        background: tier.gradient,
                                        fontSize: TYPE.micro, fontWeight: 700,
                                      }}
                                    >
                                      {member.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{member.name}</p>
                                      <p className="truncate" style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>{member.role}</p>
                                    </div>
                                    <div className="hidden sm:flex items-center" style={{ gap: GRID.spacing.sm }}>
                                      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{member.calls} calls</span>
                                      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{member.closeRate}%</span>
                                    </div>
                                    <span style={{ fontSize: TYPE.meta, fontWeight: 700, color: COLORS.accent.amber[600], minWidth: 70, textAlign: 'right' }}>
                                      {metricConfig.format(getMetricValue(member, selectedMetric))}
                                    </span>
                                    <div
                                      className="flex items-center flex-shrink-0"
                                      style={{
                                        gap: 2, fontSize: TYPE.micro, fontWeight: 600, minWidth: 40, justifyContent: 'flex-end',
                                        color: member.trend > 0 ? COLORS.semantic.success : member.trend < 0 ? COLORS.semantic.error : COLORS.gray[400],
                                      }}
                                    >
                                      {member.trend > 0 ? (
                                        <><ArrowUp size={10} />+{member.trend}%</>
                                      ) : member.trend < 0 ? (
                                        <><ArrowDown size={10} />{member.trend}%</>
                                      ) : (
                                        <span style={{ color: COLORS.gray[300] }}>--</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: GRID.spacing.sm }}>
                    {[
                      { icon: DollarSign, label: 'Total Team AP', value: formatAP(teamKPIs.totalAP), sub: period.toLowerCase() },
                      { icon: Activity, label: 'Avg Close Rate', value: `${teamKPIs.avgCloseRate}%`, sub: 'avg across team' },
                      { icon: Target, label: 'New Policies', value: `${teamKPIs.totalPolicies}`, sub: period.toLowerCase() },
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
                          <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                              <div className="flex items-center justify-center" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                                <kpi.icon size={LAYOUT.icon.sm} style={{ color: '#ffffff' }} />
                              </div>
                              <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{kpi.label}</span>
                            </div>
                            <p style={{ fontSize: TYPE.section, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{kpi.value}</p>
                            <p style={{ fontSize: TYPE.micro, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{kpi.sub}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
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
