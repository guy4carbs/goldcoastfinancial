/**
 * Manager Commissions Page
 * Track earnings, payouts, and commission structures across the team.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_AGENT_COMMISSIONS,
  DEMO_PAYOUT_TIMELINE,
  DEMO_COMMISSION_VELOCITY,
  AGENCY_CONTRACT_LEVEL,
  glassCard,
  SPARKLINE_COMMISSIONS_PENDING,
  SPARKLINE_COMMISSIONS_PAID,
  SPARKLINE_CHARGEBACK,
  SPARKLINE_CONTRACT_LEVEL,
  DEMO_PIPELINE_STAGES,
  SPARKLINE_PIPELINE,
  SPARKLINE_WIN_RATE,
  SPARKLINE_REVENUE,
} from './managerConstants';
import { ForecastingTabContent } from './ManagerForecasting';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Percent,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Zap,
  BarChart3,
  GitBranch,
  Calendar,
  Target,
  Activity,
  Bell,
  Filter,
} from 'lucide-react';

/* ── Period filter options ─────────────────────────────────── */

const PERIOD_OPTIONS = ['This Month', 'This Quarter', 'YTD'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── Period scaling ──────────────────────────────────────── */

const PERIOD_SCALE: Record<Period, number> = {
  'This Month': 1,
  'This Quarter': 3,
  'YTD': 12,
};

/** Deterministic per-agent variance so rankings shift between periods */
function agentPeriodFactor(id: string, periodIdx: number): number {
  const seed = parseInt(id) * 17 + periodIdx * 31;
  return 0.82 + ((seed * 13) % 36) / 100;
}

const PERIOD_IDX: Record<Period, number> = { 'This Month': 0, 'This Quarter': 1, 'YTD': 2 };

/* ── Monthly commission trend data (base = per month) ────── */

const MONTHLY_TREND_BASE = [
  { month: 'Oct', ap: 78400, ip: 71200 },
  { month: 'Nov', ap: 82100, ip: 76800 },
  { month: 'Dec', ap: 69500, ip: 64300 },
  { month: 'Jan', ap: 91200, ip: 84600 },
  { month: 'Feb', ap: 97800, ip: 89100 },
  { month: 'Mar', ap: 104300, ip: 92400 },
];

const QUARTERLY_TREND = [
  { month: 'Q3', ap: 229000, ip: 212300 },
  { month: 'Q4', ap: 281100, ip: 258500 },
  { month: 'Q1', ap: 293300, ip: 266100 },
];

const YTD_TREND = [
  { month: 'Oct', ap: 78400, ip: 71200 },
  { month: 'Nov', ap: 160500, ip: 148000 },
  { month: 'Dec', ap: 230000, ip: 212300 },
  { month: 'Jan', ap: 321200, ip: 296900 },
  { month: 'Feb', ap: 419000, ip: 386000 },
  { month: 'Mar', ap: 523300, ip: 478400 },
];

/* ── Base sorted data ─────────────────────────────────────── */

const baseSortedAgents = [...DEMO_AGENT_COMMISSIONS].sort((a, b) => b.paidYTD - a.paidYTD);

/* ── Static constants ─────────────────────────────────────── */

const PRODUCT_NAMES = ['IUL', 'Whole Life', 'Term', 'Annuity'] as const;
const PRODUCT_RING_COLORS = ['#059669', '#14b8a6', '#f59e0b', '#fb7185'];

/* ── Chart constants ──────────────────────────────────────── */

const CHART_COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  amber: '#f59e0b',
  rose: '#fb7185',
};

const GlassTooltip = ({ active, payload, label }: any) => {
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
      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], margin: 0, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ fontSize: TYPE.meta, fontWeight: 600, color: entry.color, margin: 0 }}>
          {entry.name}: ${(entry.value / 1000).toFixed(1)}K
        </p>
      ))}
    </div>
  );
};

function formatCurrency(v: number): string {
  if (v <= 0) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v}`;
}

/* ── Pipeline Data & Constants ────────────────────────────── */

interface PipelineDeal {
  id: string;
  name: string;
  agent: string;
  avatar: string;
  value: number;
  stage: string;
  daysIdle: number;
}

const DEMO_PIPELINE_ACTIVITY = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', lead: 'Anderson Corp', from: 'Contacted', to: 'Qualified', time: '15 min ago' },
  { id: '2', agent: 'Mike Chen', avatar: 'MC', lead: 'Riverside LLC', from: 'New Leads', to: 'Contacted', time: '42 min ago' },
  { id: '3', agent: 'David Brown', avatar: 'DB', lead: 'Summit Partners', from: 'Qualified', to: 'Proposal', time: '1 hr ago' },
  { id: '4', agent: 'Rachel Green', avatar: 'RG', lead: 'Oakwood Holdings', from: 'Proposal', to: 'Closed Won', time: '2 hrs ago' },
  { id: '5', agent: 'Jessica Lee', avatar: 'JL', lead: 'Meridian Group', from: 'New Leads', to: 'Contacted', time: '3 hrs ago' },
];

const DEMO_PIPELINE_DEALS: PipelineDeal[] = [
  { id: 'k1', name: 'Thompson Estate', agent: 'Sarah Johnson', avatar: 'SJ', value: 48000, stage: 'New Leads', daysIdle: 2 },
  { id: 'k2', name: 'Martinez Key Person', agent: 'Mike Chen', avatar: 'MC', value: 76000, stage: 'New Leads', daysIdle: 5 },
  { id: 'k3', name: 'Davis Legacy Trust', agent: 'James Wilson', avatar: 'JW', value: 95000, stage: 'New Leads', daysIdle: 18 },
  { id: 'k4', name: 'Wilson Group Plan', agent: 'Emily Davis', avatar: 'ED', value: 34000, stage: 'New Leads', daysIdle: 1 },
  { id: 'k5', name: 'Park Retirement', agent: 'Tom Rodriguez', avatar: 'TR', value: 29000, stage: 'New Leads', daysIdle: 12 },
  { id: 'k6', name: 'Taylor Basic Life', agent: 'Lisa Park', avatar: 'LP', value: 18000, stage: 'New Leads', daysIdle: 3 },
  { id: 'k7', name: 'Nguyen Premium', agent: 'David Brown', avatar: 'DB', value: 52000, stage: 'New Leads', daysIdle: 8 },
  { id: 'k8', name: 'Adams Universal', agent: 'Anna Kim', avatar: 'AK', value: 22000, stage: 'New Leads', daysIdle: 16 },
  { id: 'k9', name: 'Chen Annuity Pkg', agent: 'David Brown', avatar: 'DB', value: 89000, stage: 'Contacted', daysIdle: 21 },
  { id: 'k10', name: 'Kim Retirement Plus', agent: 'Lisa Park', avatar: 'LP', value: 31000, stage: 'Contacted', daysIdle: 4 },
  { id: 'k11', name: 'Roberts Family', agent: 'Mike Chen', avatar: 'MC', value: 42000, stage: 'Contacted', daysIdle: 9 },
  { id: 'k12', name: 'Lee Protection', agent: 'Jessica Lee', avatar: 'JL', value: 38000, stage: 'Contacted', daysIdle: 15 },
  { id: 'k13', name: 'Garcia Convert', agent: 'Rachel Green', avatar: 'RG', value: 27000, stage: 'Contacted', daysIdle: 2 },
  { id: 'k14', name: 'Hall Executive', agent: 'Sarah Johnson', avatar: 'SJ', value: 67000, stage: 'Contacted', daysIdle: 6 },
  { id: 'k15', name: 'Williams Family IUL', agent: 'Rachel Green', avatar: 'RG', value: 62000, stage: 'Qualified', daysIdle: 3 },
  { id: 'k16', name: 'Patel Term Convert', agent: 'Jessica Lee', avatar: 'JL', value: 28000, stage: 'Qualified', daysIdle: 7 },
  { id: 'k17', name: 'Nguyen Family Plan', agent: 'Emily Davis', avatar: 'ED', value: 54000, stage: 'Qualified', daysIdle: 19 },
  { id: 'k18', name: 'Brooks Whole Life', agent: 'Tom Rodriguez', avatar: 'TR', value: 36000, stage: 'Qualified', daysIdle: 11 },
  { id: 'k19', name: 'Cooper Annuity', agent: 'Mike Chen', avatar: 'MC', value: 45000, stage: 'Qualified', daysIdle: 1 },
  { id: 'k20', name: 'Garcia Whole Life', agent: 'Mike Chen', avatar: 'MC', value: 35000, stage: 'Proposal', daysIdle: 4 },
  { id: 'k21', name: 'Brooks IUL Transfer', agent: 'Tom Rodriguez', avatar: 'TR', value: 42000, stage: 'Proposal', daysIdle: 10 },
  { id: 'k22', name: 'Lee Estate Shield', agent: 'Rachel Green', avatar: 'RG', value: 38000, stage: 'Proposal', daysIdle: 2 },
  { id: 'k23', name: 'Anderson Corp', agent: 'Sarah Johnson', avatar: 'SJ', value: 58000, stage: 'Proposal', daysIdle: 6 },
  { id: 'k24', name: 'Summit Partners', agent: 'David Brown', avatar: 'DB', value: 41000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k25', name: 'Riverside LLC', agent: 'Jessica Lee', avatar: 'JL', value: 33000, stage: 'Closed Won', daysIdle: 0 },
  { id: 'k26', name: 'Oakwood Holdings', agent: 'Rachel Green', avatar: 'RG', value: 28000, stage: 'Closed Won', daysIdle: 0 },
];

const FUNNEL_STAGES = DEMO_PIPELINE_STAGES.map((s, i, arr) => ({
  ...s,
  pct: Math.round((s.count / arr[0].count) * 100),
  conversion: i > 0 ? Math.round((s.count / arr[i - 1].count) * 100) : 100,
  dropOff: i > 0 ? Math.round(((arr[i - 1].count - s.count) / arr[i - 1].count) * 100) : 0,
}));

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

/* ── Component ────────────────────────────────────────────── */

export function ManagerCommissions() {
  const [period, setPeriod] = useState<Period>('This Month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [pageTab, setPageTab] = useState<'commissions' | 'pipeline' | 'forecasting'>('commissions');
  const [commissionTab, setCommissionTab] = useState<'earnings' | 'hierarchy'>('earnings');
  const [showVelocityDetails, setShowVelocityDetails] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setShowPeriodDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Period-scaled agent data ─────────────────────────────── */

  const scale = PERIOD_SCALE[period];
  const pIdx = PERIOD_IDX[period];

  const sortedAgents = useMemo(() =>
    baseSortedAgents.map((a) => {
      const f = agentPeriodFactor(a.agentId, pIdx);
      return {
        ...a,
        pending: Math.round(a.pending * scale * f),
        paidYTD: Math.round(a.paidYTD * scale * f),
        chargebackRisk: Math.round(a.chargebackRisk * scale * f),
        products: a.products.map((p) => ({
          ...p,
          premium: Math.round(p.premium * scale * f),
          commission: Math.round(p.commission * scale * f),
        })),
      };
    }).sort((a, b) => b.paidYTD - a.paidYTD),
  [period, scale, pIdx]);

  const totalPending = useMemo(() => sortedAgents.reduce((sum, a) => sum + a.pending, 0), [sortedAgents]);
  const totalPaidYTD = useMemo(() => sortedAgents.reduce((sum, a) => sum + a.paidYTD, 0), [sortedAgents]);
  const totalChargeback = useMemo(() => sortedAgents.reduce((sum, a) => sum + a.chargebackRisk, 0), [sortedAgents]);
  const avgContractLevel = Math.round(baseSortedAgents.reduce((sum, a) => sum + a.contractLevel, 0) / baseSortedAgents.length);

  const totalCommissionEarned = useMemo(() =>
    sortedAgents.reduce((sum, a) => sum + a.products.reduce((ps, p) => ps + p.commission, 0), 0),
  [sortedAgents]);

  const productSummary = useMemo(() =>
    PRODUCT_NAMES.map((product) => {
      let totalPremium = 0;
      let totalCommission = 0;
      sortedAgents.forEach((agent) => {
        const p = agent.products.find((pr) => pr.product === product);
        if (p) { totalPremium += p.premium; totalCommission += p.commission; }
      });
      return { product, totalPremium, totalCommission, effectiveRate: totalPremium > 0 ? (totalCommission / totalPremium) * 100 : 0 };
    }),
  [sortedAgents]);

  const PRODUCT_RING_DATA = useMemo(() =>
    productSummary.map((p, i) => ({
      name: p.product,
      value: p.totalCommission,
      color: PRODUCT_RING_COLORS[i],
      pct: totalCommissionEarned > 0 ? Math.round((p.totalCommission / totalCommissionEarned) * 100) : 0,
    })),
  [productSummary, totalCommissionEarned]);

  const hierarchyData = useMemo(() =>
    sortedAgents.map((a) => {
      const agentPremium = a.products.reduce((s, p) => s + p.premium, 0);
      const overrideRate = AGENCY_CONTRACT_LEVEL - a.contractLevel;
      return { ...a, totalPremium: agentPremium, overrideRate, overrideEarned: Math.round(agentPremium * overrideRate / 100) };
    }).sort((a, b) => b.overrideEarned - a.overrideEarned),
  [sortedAgents]);

  const totalOverrideIncome = useMemo(() => hierarchyData.reduce((sum, a) => sum + a.overrideEarned, 0), [hierarchyData]);

  const chargebackAgents = useMemo(() => sortedAgents.filter((a) => a.chargebackRisk > 0), [sortedAgents]);

  const trendData = useMemo(() =>
    period === 'This Month' ? MONTHLY_TREND_BASE
    : period === 'This Quarter' ? QUARTERLY_TREND
    : YTD_TREND,
  [period]);

  const PRODUCT_CHART_DATA = useMemo(() =>
    productSummary.map((p) => ({
      name: p.product,
      premium: p.totalPremium,
      commission: p.totalCommission,
      rate: p.effectiveRate,
    })),
  [productSummary]);

  const toggleExpand = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <ManagerPageHero
          icon={DollarSign}
          title="Commissions"
          subtitle="Track earnings, manage your hierarchy, and monitor your pipeline"
          className="!overflow-visible"
        >
          <div ref={periodDropdownRef} className="relative">
            <button
              onClick={() => setShowPeriodDropdown((p) => !p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: TYPE.meta,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <Calendar size={16} />
              {period}
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.2s',
                  transform: showPeriodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            <AnimatePresence>
              {showPeriodDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 8,
                    minWidth: 180,
                    background: '#ffffff',
                    borderRadius: RADIUS.input,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    padding: 6,
                    zIndex: 50,
                  }}
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setPeriod(option);
                        setShowPeriodDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: RADIUS.button,
                        fontSize: TYPE.meta,
                        fontWeight: period === option ? 600 : 400,
                        color: period === option ? COLORS.lounges.manager.dark : COLORS.gray[700],
                        background: period === option ? 'rgba(16,185,129,0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (period !== option) e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = period === option ? 'rgba(16,185,129,0.08)' : 'transparent';
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => toast.success('Commission report exported')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: RADIUS.pill,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: TYPE.meta,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <Download size={16} />
            Export
          </button>
        </ManagerPageHero>

        {/* ── Page Toggle ──────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center p-1 gap-1 w-fit" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            {(['commissions', 'pipeline', 'forecasting'] as const).map((tab) => {
              const isActive = pageTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setPageTab(tab)}
                  className={`font-medium border-0 capitalize flex items-center gap-2 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{
                    borderRadius: RADIUS.button,
                    padding: '6px 16px',
                    fontSize: TYPE.meta,
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {tab === 'commissions' && <DollarSign style={{ width: 14, height: 14 }} />}
                  {tab === 'pipeline' && <Target style={{ width: 14, height: 14 }} />}
                  {tab === 'forecasting' && <TrendingUp style={{ width: 14, height: 14 }} />}
                  {tab}
                </button>
              );
            })}
          </div>
        </motion.div>

        {pageTab === 'commissions' && (
        <>
        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value={formatCurrency(totalPending)}
              label="Pending"
              sparklineData={[...SPARKLINE_COMMISSIONS_PENDING]}
              delta={8}
              deltaFormat="percent"
              periodLabel={period.toLowerCase()}
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={formatCurrency(totalPaidYTD)}
              label={period === 'YTD' ? 'Paid YTD' : period === 'This Quarter' ? 'Paid QTD' : 'Paid MTD'}
              sparklineData={[...SPARKLINE_COMMISSIONS_PAID]}
              delta={22.4}
              deltaFormat="percent"
              periodLabel={period.toLowerCase()}
              northStar
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={formatCurrency(totalChargeback)}
              label="Chargeback Risk"
              sparklineData={[...SPARKLINE_CHARGEBACK]}
              delta={-15}
              deltaFormat="percent"
              periodLabel={period.toLowerCase()}
            />
            <ManagerStatCard
              icon={Percent}
              value={`${avgContractLevel}%`}
              label="Avg Contract Level"
              sparklineData={[...SPARKLINE_CONTRACT_LEVEL]}
              delta={2.1}
              deltaFormat="percent"
              periodLabel={period.toLowerCase()}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio Content Grid ─────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ── LEFT COLUMN (61.8%) ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Monthly Commission Trend */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <TrendingUp
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Monthly Commission Trend</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[100]} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: TYPE.caption, fill: COLORS.gray[400] }}
                        axisLine={{ stroke: COLORS.gray[200] }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: TYPE.caption, fill: COLORS.gray[400] }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: RADIUS.button,
                          border: `1px solid ${COLORS.gray[200]}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: TYPE.caption,
                        }}
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`,
                          name === 'ap' ? 'AP' : 'IP',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="ap"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ip"
                        stroke="#0d9488"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center" style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.sm }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <div style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#059669' }} />
                    <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>AP (Annual Premium)</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <div style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#0d9488', backgroundImage: 'repeating-linear-gradient(90deg, #0d9488 0 6px, transparent 6px 9px)' }} />
                    <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.caption }}>IP (Issued Premium)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Commission Table */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <DollarSign
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Agent Commissions</span>
                  {/* Tab Pills */}
                  <div className="flex items-center p-1 gap-1" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button, marginLeft: 'auto' }}>
                    {(['earnings', 'hierarchy'] as const).map((tab) => {
                      const isActive = commissionTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={(e) => { e.stopPropagation(); setCommissionTab(tab); }}
                          className={`font-medium border-0 capitalize flex items-center gap-2 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                          style={{
                            borderRadius: RADIUS.button,
                            padding: '4px 12px',
                            fontSize: TYPE.meta,
                            cursor: 'pointer',
                            fontWeight: isActive ? 600 : 500,
                          }}
                        >
                          {tab === 'hierarchy' && <GitBranch style={{ width: 12, height: 12 }} />}
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {commissionTab === 'earnings' && (
                <>
                {/* Table Header */}
                <div
                  className="hidden md:grid items-center"
                  style={{
                    gridTemplateColumns: '48px 1fr 100px 100px 100px 40px',
                    gap: GRID.spacing.xs,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    marginBottom: GRID.spacing.xs,
                  }}
                >
                  <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Rank</span>
                  <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Agent</span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Pending</span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>
                    {period === 'YTD' ? 'Paid YTD' : period === 'This Quarter' ? 'Paid QTD' : 'Paid MTD'}
                  </span>
                  <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Chargeback</span>
                  <span className="text-gray-400 font-semibold text-center" style={{ fontSize: TYPE.caption }}></span>
                </div>

                {/* Agent Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {sortedAgents.map((agent, index) => {
                    const isExpanded = expandedAgents.has(agent.agentId);
                    return (
                      <div key={agent.agentId}>
                        <motion.div
                          className="grid items-center cursor-pointer"
                          style={{
                            gridTemplateColumns: '48px 1fr 100px 100px 100px 40px',
                            gap: GRID.spacing.xs,
                            padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{ backgroundColor: COLORS.gray[50] }}
                          onClick={() => toggleExpand(agent.agentId)}
                        >
                          {/* Rank */}
                          <span
                            className="font-bold text-gray-500"
                            style={{ fontSize: TYPE.meta }}
                          >
                            #{index + 1}
                          </span>

                          {/* Avatar + Name */}
                          <div className="flex items-center min-w-0" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: LAYOUT.icon.xxl,
                                height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.meta,
                              }}
                            >
                              {agent.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                                {agent.name}
                              </p>
                            </div>
                          </div>

                          {/* Pending */}
                          <span className="font-semibold text-gray-700 text-right" style={{ fontSize: TYPE.meta }}>
                            ${agent.pending.toLocaleString()}
                          </span>

                          {/* Paid */}
                          <span className="font-bold text-right" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                            ${agent.paidYTD.toLocaleString()}
                          </span>

                          {/* Chargeback */}
                          <span
                            className="font-semibold text-right"
                            style={{
                              fontSize: TYPE.meta,
                              color: agent.chargebackRisk > 0 ? '#ef4444' : COLORS.gray[300],
                            }}
                          >
                            {agent.chargebackRisk > 0
                              ? `$${agent.chargebackRisk.toLocaleString()}`
                              : '\u2014'}
                          </span>

                          {/* Expand chevron */}
                          <div className="flex items-center justify-center">
                            {isExpanded ? (
                              <ChevronUp className="text-gray-400" style={{ width: 16, height: 16 }} />
                            ) : (
                              <ChevronDown className="text-gray-400" style={{ width: 16, height: 16 }} />
                            )}
                          </div>
                        </motion.div>

                        {/* Expanded Product Breakdown */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                            style={{
                              marginLeft: 48 + GRID.spacing.xs,
                              marginRight: GRID.spacing.sm,
                              marginTop: GRID.spacing.xs,
                              marginBottom: GRID.spacing.xs,
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              backgroundColor: COLORS.gray[50],
                            }}
                          >
                            {/* Sub-table header */}
                            <div
                              className="grid items-center"
                              style={{
                                gridTemplateColumns: '1fr 100px 60px 100px',
                                gap: GRID.spacing.xs,
                                paddingBottom: GRID.spacing.xs,
                                borderBottom: `1px solid ${COLORS.gray[200]}`,
                                marginBottom: GRID.spacing.xs,
                              }}
                            >
                              <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Product</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Premium</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Rate</span>
                              <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Commission</span>
                            </div>
                            {agent.products.map((product) => (
                              <div
                                key={product.product}
                                className="grid items-center"
                                style={{
                                  gridTemplateColumns: '1fr 100px 60px 100px',
                                  gap: GRID.spacing.xs,
                                  padding: `${GRID.spacing.xs / 2}px 0`,
                                }}
                              >
                                <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                                  {product.product}
                                </span>
                                <span className="text-gray-600 text-right" style={{ fontSize: TYPE.meta }}>
                                  ${product.premium.toLocaleString()}
                                </span>
                                <span className="text-gray-500 text-right" style={{ fontSize: TYPE.meta }}>
                                  {product.rate}%
                                </span>
                                <span className="font-semibold text-right" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                                  ${product.commission.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </>
                )}
                {commissionTab === 'hierarchy' && (
                /* ── Hierarchy Tab ─────────────────────────────── */
                <>
                  {/* Summary row */}
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      marginBottom: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    <span className="font-semibold text-gray-600" style={{ fontSize: TYPE.meta }}>
                      Agency Level: <span style={{ color: '#059669' }}>{AGENCY_CONTRACT_LEVEL}%</span>
                    </span>
                    <span className="font-bold" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                      Total Override Income: ${totalOverrideIncome.toLocaleString()}
                    </span>
                  </div>

                  {/* Hierarchy header */}
                  <div
                    className="hidden md:grid items-center"
                    style={{
                      gridTemplateColumns: '1fr 90px 80px 100px 110px',
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      marginBottom: GRID.spacing.xs,
                    }}
                  >
                    <span className="text-gray-400 font-semibold" style={{ fontSize: TYPE.caption }}>Agent</span>
                    <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Contract</span>
                    <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Override %</span>
                    <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Premium</span>
                    <span className="text-gray-400 font-semibold text-right" style={{ fontSize: TYPE.caption }}>Override $</span>
                  </div>

                  {/* Hierarchy rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {hierarchyData.map((agent) => (
                      <div
                        key={agent.agentId}
                        className="grid items-center"
                        style={{
                          gridTemplateColumns: '1fr 90px 80px 100px 110px',
                          gap: GRID.spacing.xs,
                          padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                        }}
                      >
                        {/* Agent */}
                        <div className="flex items-center min-w-0" style={{ gap: GRID.spacing.xs }}>
                          <div
                            className="flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.meta,
                            }}
                          >
                            {agent.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {agent.name}
                            </p>
                          </div>
                        </div>

                        {/* Contract Level with mini bar */}
                        <div className="text-right">
                          <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                            {agent.contractLevel}%
                          </span>
                          <div
                            style={{
                              height: 3,
                              borderRadius: 2,
                              backgroundColor: COLORS.gray[200],
                              marginTop: 3,
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${(agent.contractLevel / AGENCY_CONTRACT_LEVEL) * 100}%`,
                                borderRadius: 2,
                                background: 'linear-gradient(90deg, #059669, #0d9488)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Override % */}
                        <span className="font-bold text-right" style={{ fontSize: TYPE.meta, color: '#d97706' }}>
                          {agent.overrideRate}%
                        </span>

                        {/* Premium */}
                        <span className="font-semibold text-gray-600 text-right" style={{ fontSize: TYPE.meta }}>
                          ${agent.totalPremium.toLocaleString()}
                        </span>

                        {/* Override Earned */}
                        <span className="font-bold text-right" style={{ fontSize: TYPE.meta, color: '#059669' }}>
                          ${agent.overrideEarned.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
                )}
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT COLUMN (38.2%) ────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Commission Velocity — Gradient Card */}
            {(() => {
              const v = DEMO_COMMISSION_VELOCITY;
              const dailyRate = v.thisMonth.earned / v.thisMonth.daysElapsed;
              const projected = Math.round(dailyRate * v.thisMonth.daysTotal);
              const lastMonthDaily = v.lastMonth.earned / v.lastMonth.daysElapsed;
              const velocityChange = Math.round(((dailyRate - lastMonthDaily) / lastMonthDaily) * 100);
              const pctOfTarget = Math.round((v.thisMonth.earned / v.thisMonth.target) * 100);
              const projectedPct = Math.round((projected / v.thisMonth.target) * 100);
              const isAhead = dailyRate > lastMonthDaily;

              return (
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400"
                  style={{ borderRadius: RADIUS.hero }}
                >
                  {/* Fibonacci blobs */}
                  <div
                    className="absolute top-0 right-0 bg-white/10 blur-2xl"
                    style={{ width: 89, height: 89, transform: 'translate(30%, -40%)', borderRadius: RADIUS.pill }}
                  />
                  <div
                    className="absolute bottom-0 left-0 bg-amber-400/15 blur-xl"
                    style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)', borderRadius: RADIUS.pill }}
                  />
                  <div
                    className="absolute top-1/2 right-1/4 bg-teal-300/10 blur-sm"
                    style={{ width: 34, height: 34, borderRadius: RADIUS.pill }}
                  />

                  <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                    {/* Header */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: LAYOUT.icon.xl,
                          height: LAYOUT.icon.xl,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Zap className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                          Commission Velocity
                        </p>
                        <p className="text-white/70" style={{ fontSize: TYPE.caption }}>
                          Earnings pace · Day {v.thisMonth.daysElapsed} of {v.thisMonth.daysTotal}
                        </p>
                      </div>
                      <div
                        className="font-bold"
                        style={{
                          fontSize: TYPE.meta,
                          padding: `3px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.pill,
                          backgroundColor: isAhead ? 'rgba(16, 185, 129, 0.25)' : 'rgba(251, 191, 36, 0.25)',
                          color: isAhead ? '#6ee7b7' : '#fcd34d',
                        }}
                      >
                        {isAhead ? '+' : ''}{velocityChange}%
                      </div>
                    </div>

                    {/* Big number — daily rate */}
                    <div style={{ marginBottom: GRID.spacing.md }}>
                      <p className="text-white/60" style={{ fontSize: TYPE.caption, marginBottom: 2 }}>
                        Daily Earning Rate
                      </p>
                      <p className="text-white font-bold" style={{ fontSize: 28, lineHeight: 1 }}>
                        ${Math.round(dailyRate).toLocaleString()}
                        <span className="text-white/50 font-medium" style={{ fontSize: TYPE.caption }}> /day</span>
                      </p>
                    </div>

                    {/* Progress toward target */}
                    <div style={{ marginBottom: GRID.spacing.md }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                        <span className="text-white/80 font-medium" style={{ fontSize: TYPE.caption }}>
                          ${v.thisMonth.earned.toLocaleString()} of ${v.thisMonth.target.toLocaleString()}
                        </span>
                        <span className="text-amber-200 font-bold" style={{ fontSize: TYPE.caption }}>
                          {pctOfTarget}%
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(pctOfTarget, 100)}%`,
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Details toggle */}
                    <button
                      onClick={() => setShowVelocityDetails((p) => !p)}
                      className="flex items-center justify-center border-0 w-full cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: RADIUS.pill,
                        padding: `4px 0`,
                        fontSize: TYPE.caption,
                        color: 'rgba(255,255,255,0.6)',
                        gap: 4,
                      }}
                    >
                      {showVelocityDetails ? 'Hide' : 'Details'}
                      <ChevronDown style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: showVelocityDetails ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    <AnimatePresence>
                    {showVelocityDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm, marginTop: GRID.spacing.xs }}
                      >
                        {[
                          { label: 'Projected This Month', value: `$${projected.toLocaleString()}`, badge: `${projectedPct}% of target`, highlight: projectedPct >= 100 },
                          { label: 'Last Month Total', value: `$${v.lastMonth.earned.toLocaleString()}`, badge: `${Math.round((v.lastMonth.earned / v.lastMonth.target) * 100)}%`, highlight: false },
                          { label: '3-Month Average', value: `$${v.threeMonthAvg.earned.toLocaleString()}`, badge: `${Math.round((v.threeMonthAvg.earned / v.threeMonthAvg.target) * 100)}%`, highlight: false },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between">
                            <div>
                              <p className="text-white/60" style={{ fontSize: TYPE.caption }}>{row.label}</p>
                              <p className="text-white font-semibold" style={{ fontSize: TYPE.meta }}>{row.value}</p>
                            </div>
                            <span
                              className="font-semibold"
                              style={{
                                fontSize: TYPE.caption,
                                padding: `2px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.pill,
                                backgroundColor: row.highlight ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.12)',
                                color: row.highlight ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
                              }}
                            >
                              {row.badge}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}

            {/* Product Mix (Donut Ring) */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <BarChart3
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Product Mix</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
                  {/* Donut Ring */}
                  <div className="flex-shrink-0 relative" style={{ width: 140, height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PRODUCT_RING_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={62}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {PRODUCT_RING_DATA.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ pointerEvents: 'none' }}
                    >
                      <span className="font-bold text-gray-900" style={{ fontSize: TYPE.meta, lineHeight: 1 }}>
                        ${(totalCommissionEarned / 1000).toFixed(1)}K
                      </span>
                      <span className="text-gray-400" style={{ fontSize: 9 }}>total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {PRODUCT_RING_DATA.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              backgroundColor: item.color,
                              flexShrink: 0,
                            }}
                          />
                          <span className="text-gray-600 font-medium" style={{ fontSize: TYPE.meta }}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                            ${(item.value / 1000).toFixed(1)}K
                          </span>
                          <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption, width: 30, textAlign: 'right' }}>
                            {item.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chargeback Alerts */}
            <Card
              className="overflow-hidden"
              style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <AlertTriangle
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Chargeback Alerts</span>
                  {chargebackAgents.length > 0 && (
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: TYPE.caption,
                        padding: `2px ${GRID.spacing.xs}px`,
                        borderRadius: RADIUS.pill,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        marginLeft: 'auto',
                      }}
                    >
                      {chargebackAgents.length} at risk
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {chargebackAgents.length === 0 ? (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.meta, padding: GRID.spacing.md }}>
                    No active chargeback risks
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {chargebackAgents.map((agent) => (
                      <motion.div
                        key={agent.agentId}
                        className="flex items-center"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        }}
                        whileHover={{ backgroundColor: COLORS.gray[50] }}
                      >
                        <div
                          className="flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                          style={{
                            width: LAYOUT.icon.xxl,
                            height: LAYOUT.icon.xxl,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.meta,
                          }}
                        >
                          {agent.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {agent.name}
                          </p>
                          <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>
                            Lapse risk (13-month window)
                          </p>
                        </div>
                        <span
                          className="font-bold flex-shrink-0"
                          style={{ fontSize: TYPE.meta, color: '#ef4444' }}
                        >
                          ${agent.chargebackRisk.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
        </>
        )}

        {pageTab === 'pipeline' && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
        >
          {/* Pipeline Stat Cards */}
          <motion.div variants={staggerCards} initial="hidden" animate="visible">
            <ManagerStatCardGrid>
              <ManagerStatCard icon={DollarSign} value={formatDollar(pipelineTotal)} label="Total Pipeline" sparklineData={[...SPARKLINE_PIPELINE]} delta={18} deltaFormat="percent" periodLabel="vs last month" northStar />
              <ManagerStatCard icon={Target} value={activeDealCount} label="Active Deals" sparklineData={[...SPARKLINE_REVENUE].slice(0, 14)} delta={3} periodLabel="Last 14 days" />
              <ManagerStatCard icon={BarChart3} value={formatDollar(avgDealSize)} label="Avg Deal Size" delta={5.2} deltaFormat="percent" periodLabel="vs last month" />
              <ManagerStatCard icon={TrendingUp} value="42%" label="Win Rate" sparklineData={[...SPARKLINE_WIN_RATE]} delta={5} deltaFormat="percent" periodLabel="vs last month" />
            </ManagerStatCardGrid>
          </motion.div>

          {/* Pipeline Coverage */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 overflow-hidden relative" style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-rose-400" />
              <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-2xl" style={{ width: 89, height: 89, borderRadius: RADIUS.pill }} />
              <div className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-xl" style={{ width: 55, height: 55, borderRadius: RADIUS.pill }} />
              <div className="absolute top-1/2 right-1/4 bg-teal-300/10 blur-sm" style={{ width: 34, height: 34, borderRadius: RADIUS.pill }} />
              <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.md }}>
                  <div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: 4 }}>
                      <div className="flex items-center justify-center" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                        <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Pipeline Coverage</span>
                    </div>
                    <p className="text-white/60" style={{ fontSize: TYPE.caption, paddingLeft: LAYOUT.icon.xxl + GRID.spacing.xs }}>{formatDollar(pipelineTotal)} pipeline vs {formatDollar(targetTotal)} target</p>
                  </div>
                  <div className="text-right">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: MOTION.easing }} className="font-bold" style={{ fontSize: TYPE.display, lineHeight: 1, color: coverageNum >= 3 ? '#bbf7d0' : coverageNum >= 2 ? '#fef3c7' : '#fecaca' }}>
                      {coverageRatio}x
                    </motion.div>
                    <p className="text-white/50" style={{ fontSize: TYPE.micro, marginTop: 2 }}>coverage ratio</p>
                  </div>
                </div>
                <div style={{ position: 'relative', marginBottom: GRID.spacing.sm }}>
                  <div style={{ height: 40, borderRadius: RADIUS.button, background: 'rgba(0,0,0,0.15)', overflow: 'hidden', position: 'relative' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${targetPct}%` }} transition={{ duration: 0.8, ease: MOTION.easing }} style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.35) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-bold text-white/90" style={{ fontSize: TYPE.caption }}>{formatDollar(targetTotal)}</span>
                    </motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${100 - targetPct}%` }} transition={{ duration: 0.6, delay: 0.4, ease: MOTION.easing }} style={{ position: 'absolute', top: 0, left: `${targetPct}%`, height: '100%', background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-semibold text-white/70" style={{ fontSize: TYPE.caption }}>+{formatDollar(surplusValue)}</span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.4, delay: 0.7 }} style={{ position: 'absolute', top: -6, left: `${targetPct}%`, marginLeft: -1, width: 2, height: 'calc(100% + 12px)', background: '#fbbf24', borderRadius: 2, boxShadow: '0 0 12px rgba(251,191,36,0.7), 0 0 4px rgba(251,191,36,0.5)' }} />
                  </div>
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.9 }} style={{ position: 'absolute', bottom: -20, left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
                    <span className="text-amber-300 font-semibold" style={{ fontSize: TYPE.micro }}>Target</span>
                  </motion.div>
                </div>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.md }}>
                  <div className="flex items-center" style={{ gap: 6, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.6)' }} />
                    <span className="text-white/90 font-medium" style={{ fontSize: TYPE.caption }}>Covered: {formatDollar(targetTotal)}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 6, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: RADIUS.pill, background: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.4)' }} />
                    <span className="text-white/70 font-medium" style={{ fontSize: TYPE.caption }}>Surplus: +{formatDollar(surplusValue)}</span>
                  </div>
                  <div className="flex items-center ml-auto" style={{ gap: 6, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill, background: 'rgba(251,191,36,0.15)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: 8, height: 2, borderRadius: 1, background: '#fbbf24' }} />
                    <span className="text-amber-200 font-medium" style={{ fontSize: TYPE.caption }}>Target: {formatDollar(targetTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pipeline Stages */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" style={{ gap: GRID.spacing.sm }}>
            {DEMO_PIPELINE_STAGES.map((stage) => (
              <div key={stage.stage} style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <div style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                    <div className={stage.color} style={{ width: 10, height: 10, borderRadius: RADIUS.pill, flexShrink: 0 }} />
                    <p className="font-medium text-gray-600 truncate" style={{ fontSize: TYPE.meta }}>{stage.stage}</p>
                  </div>
                  <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>{stage.count}</p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{formatDollar(stage.value)}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Conversion Funnel */}
          <motion.div variants={fadeInUp}>
            <Card className="overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
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
                          <span className="font-medium text-emerald-600" style={{ fontSize: TYPE.caption }}>{stage.conversion}% conversion</span>
                          <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>({stage.dropOff}% drop-off)</span>
                        </div>
                      )}
                      <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                        <span className="font-medium text-gray-600 text-right flex-shrink-0" style={{ fontSize: TYPE.caption, width: 90 }}>{stage.stage}</span>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${stage.pct}%` }} transition={{ duration: 0.6, delay: i * 0.1, ease: MOTION.easing }} style={{ height: 36, borderRadius: RADIUS.button, background: 'linear-gradient(90deg, #059669 0%, #0d9488 100%)', opacity: 1 - i * 0.12, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 48 }}>
                            <span className="font-bold text-white" style={{ fontSize: TYPE.caption }}>{stage.count}</span>
                          </motion.div>
                        </div>
                        <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption, width: 40, textAlign: 'right' }}>{stage.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stale Deals */}
          <motion.div variants={fadeInUp}>
            <Card className="overflow-hidden" style={{ background: 'rgba(255, 251, 235, 0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: RADIUS.card, boxShadow: SHADOW.card, border: '1px solid rgba(245, 158, 11, 0.20)' }}>
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <AlertTriangle className="text-amber-100" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Stale Deals</span>
                  <span className="font-bold text-amber-700" style={{ fontSize: TYPE.micro, background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: RADIUS.pill }}>{STALE_DEALS.length} no activity in 14+ days</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {STALE_DEALS.map((deal) => (
                    <motion.div key={deal.id} className="flex items-center" style={{ padding: 12, borderRadius: RADIUS.button, gap: 12, background: 'rgba(255,255,255,0.60)' }} whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}>
                      <div className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`} style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.meta }}>{deal.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{deal.name}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{deal.agent} &middot; {deal.stage} &middot; {formatDollar(deal.value)}</p>
                      </div>
                      <div className="flex-shrink-0 font-bold text-red-700" style={{ fontSize: TYPE.caption, background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: RADIUS.pill }}>{deal.daysIdle}d idle</div>
                      <button className="flex items-center flex-shrink-0 font-semibold text-white" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill, background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', boxShadow: SHADOW.level1, gap: 4, border: 'none', cursor: 'pointer' }} onClick={() => toast.success(`Nudge sent to ${deal.agent} about "${deal.name}"`)}>
                        <Bell size={LAYOUT.icon.xs} />
                        Nudge Agent
                      </button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeInUp}>
            <Card className="overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                  <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20" style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}>
                    <Activity className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  <span className="text-gray-900">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_PIPELINE_ACTIVITY.map((item) => (
                    <motion.div key={item.id} className="flex items-center" style={{ padding: 12, borderRadius: RADIUS.button, gap: 12 }} whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}>
                      <div className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`} style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button, fontSize: TYPE.meta }}>{item.avatar}</div>
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
                      <div className="flex-shrink-0">
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        )}

        {pageTab === 'forecasting' && (
          <ForecastingTabContent />
        )}
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerCommissions;
