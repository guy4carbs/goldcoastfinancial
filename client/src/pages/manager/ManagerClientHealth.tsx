/**
 * Manager Client Retention
 * Monitor retention, satisfaction, and book of business metrics
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  glassCard,
  MANAGER_ICON_GRADIENT,
  SPARKLINE_RETENTION,
} from './managerConstants';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  MOTION,
  COLORS,
  SHADOW,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield,
  Calendar,
  Phone,
  FileSearch,
  ArrowUpRight,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────── */
type Tab = 'overview' | 'at-risk';
type SortKey = 'name' | 'clients' | 'premium' | 'retention' | 'nps';
type SortDir = 'asc' | 'desc';
type RiskFilter = 'all' | 'high' | 'medium';

/* ── Demo Data: Agent Client Base ───────────────────── */
const AGENT_BOOK = [
  { id: '1', name: 'Sarah Johnson', avatar: 'SJ', totalClients: 142, totalPremium: 486000, retention: 97.1, nps: 84 },
  { id: '2', name: 'Mike Chen', avatar: 'MC', totalClients: 118, totalPremium: 392000, retention: 95.3, nps: 78 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', totalClients: 104, totalPremium: 338000, retention: 92.8, nps: 71 },
  { id: '4', name: 'James Wilson', avatar: 'JW', totalClients: 89, totalPremium: 274000, retention: 88.4, nps: 64 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', totalClients: 76, totalPremium: 218000, retention: 94.6, nps: 73 },
  { id: '6', name: 'David Brown', avatar: 'DB', totalClients: 112, totalPremium: 365000, retention: 96.2, nps: 80 },
  { id: '7', name: 'Rachel Green', avatar: 'RG', totalClients: 131, totalPremium: 448000, retention: 97.8, nps: 86 },
  { id: '8', name: 'Carlos Martinez', avatar: 'CM', totalClients: 75, totalPremium: 198000, retention: 85.2, nps: 58 },
] as const;

/* ── Demo Data: Policy Distribution ──────────────────────── */
const POLICY_DISTRIBUTION = [
  { type: 'Term Life', percentage: 35, count: 296, color: '#059669' },
  { type: 'Whole Life', percentage: 28, count: 237, color: '#0d9488' },
  { type: 'IUL', percentage: 22, count: 186, color: '#6366f1' },
  { type: 'Final Expense', percentage: 10, count: 85, color: '#f59e0b' },
  { type: 'Annuity', percentage: 5, count: 43, color: '#ec4899' },
] as const;

/* ── Demo Data: Retention Trend (6 months) ───────────────── */
const RETENTION_TREND = [
  { month: 'Sep', value: 92.4 },
  { month: 'Oct', value: 92.8 },
  { month: 'Nov', value: 93.1 },
  { month: 'Dec', value: 93.6 },
  { month: 'Jan', value: 94.0 },
  { month: 'Feb', value: 94.2 },
] as const;

/* ── Demo Data: Upcoming Renewals ────────────────────────── */
const UPCOMING_RENEWALS = [
  { client: 'Margaret Thompson', policyType: 'Whole Life', premium: 4200, renewalDate: 'Mar 12', agentId: '1', agentName: 'Sarah Johnson', agentAvatar: 'SJ' },
  { client: 'Robert Chen', policyType: 'IUL', premium: 6800, renewalDate: 'Mar 15', agentId: '2', agentName: 'Mike Chen', agentAvatar: 'MC' },
  { client: 'Patricia Williams', policyType: 'Term Life', premium: 1850, renewalDate: 'Mar 18', agentId: '7', agentName: 'Rachel Green', agentAvatar: 'RG' },
  { client: 'David Garcia', policyType: 'Annuity', premium: 12500, renewalDate: 'Mar 22', agentId: '6', agentName: 'David Brown', agentAvatar: 'DB' },
  { client: 'Susan Martinez', policyType: 'Whole Life', premium: 3600, renewalDate: 'Mar 25', agentId: '3', agentName: 'Emily Davis', agentAvatar: 'ED' },
] as const;

/* ── Demo Data: At-Risk Clients ──────────────────────────── */
type RiskReason = 'Lapse Warning' | 'Complaint Filed' | 'Payment Missed' | 'No Contact 60d' | 'Rate Increase Pending';
type RiskLevel = 'high' | 'medium';
type ActionLabel = 'Contact' | 'Review' | 'Escalate';

const AT_RISK_CLIENTS: Array<{
  id: string;
  client: string;
  policyType: string;
  premium: number;
  agentName: string;
  agentAvatar: string;
  riskReason: RiskReason;
  riskLevel: RiskLevel;
  action: ActionLabel;
}> = [
  { id: '1', client: 'Harold Peters', policyType: 'Whole Life', premium: 5200, agentName: 'Carlos Martinez', agentAvatar: 'CM', riskReason: 'Lapse Warning', riskLevel: 'high', action: 'Escalate' },
  { id: '2', client: 'Dorothy Mitchell', policyType: 'IUL', premium: 8400, agentName: 'James Wilson', agentAvatar: 'JW', riskReason: 'Complaint Filed', riskLevel: 'high', action: 'Escalate' },
  { id: '3', client: 'Frank Anderson', policyType: 'Term Life', premium: 1200, agentName: 'Emily Davis', agentAvatar: 'ED', riskReason: 'Payment Missed', riskLevel: 'medium', action: 'Contact' },
  { id: '4', client: 'Barbara Clark', policyType: 'Whole Life', premium: 3800, agentName: 'Carlos Martinez', agentAvatar: 'CM', riskReason: 'No Contact 60d', riskLevel: 'medium', action: 'Contact' },
  { id: '5', client: 'George Turner', policyType: 'Annuity', premium: 15000, agentName: 'Lisa Park', agentAvatar: 'LP', riskReason: 'Rate Increase Pending', riskLevel: 'high', action: 'Review' },
  { id: '6', client: 'Nancy Walker', policyType: 'IUL', premium: 6200, agentName: 'James Wilson', agentAvatar: 'JW', riskReason: 'Lapse Warning', riskLevel: 'high', action: 'Escalate' },
  { id: '7', client: 'Richard Lewis', policyType: 'Term Life', premium: 980, agentName: 'Emily Davis', agentAvatar: 'ED', riskReason: 'Payment Missed', riskLevel: 'medium', action: 'Contact' },
  { id: '8', client: 'Helen Young', policyType: 'Whole Life', premium: 4100, agentName: 'Mike Chen', agentAvatar: 'MC', riskReason: 'No Contact 60d', riskLevel: 'medium', action: 'Review' },
];

/* ── Risk Reason Badge Colors ────────────────────────────── */
const RISK_REASON_COLORS: Record<RiskReason, { bg: string; text: string }> = {
  'Lapse Warning': { bg: 'bg-red-100', text: 'text-red-700' },
  'Complaint Filed': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Payment Missed': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'No Contact 60d': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Rate Increase Pending': { bg: 'bg-violet-100', text: 'text-violet-700' },
};

const RISK_LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

/* ── Helpers ─────────────────────────────────────────────── */
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function healthDotColor(retention: number): string {
  if (retention >= 90) return '#059669'; // emerald-600
  if (retention >= 80) return '#d97706'; // amber-600
  return '#dc2626'; // red-600
}

/* ── SVG Retention Line Chart ────────────────────────────── */
function RetentionChart() {
  const chartWidth = 280;
  const chartHeight = 140;
  const padX = 36;
  const padY = 16;
  const padBottom = 24;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY - padBottom;

  const minVal = 91.5;
  const maxVal = 95;
  const range = maxVal - minVal;

  const points = RETENTION_TREND.map((d, i) => {
    const x = padX + (i / (RETENTION_TREND.length - 1)) * innerW;
    const y = padY + innerH - ((d.value - minVal) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`;

  // Y-axis labels
  const yLabels = [92, 93, 94, 95];

  return (
    <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {yLabels.map((v) => {
        const y = padY + innerH - ((v - minVal) / range) * innerH;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke={COLORS.gray[200]} strokeWidth={0.5} />
            <text x={padX - 6} y={y + 3} textAnchor="end" fill={COLORS.gray[400]} fontSize={9}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#retentionGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#059669" stroke="white" strokeWidth={2} />
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={chartHeight - 4} textAnchor="middle" fill={COLORS.gray[400]} fontSize={9}>
          {p.month}
        </text>
      ))}
    </svg>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export function ManagerClientHealth() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sortKey, setSortKey] = useState<SortKey>('clients');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  /* Sorting logic */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedAgents = [...AGENT_BOOK].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'name': return mul * a.name.localeCompare(b.name);
      case 'clients': return mul * (a.totalClients - b.totalClients);
      case 'premium': return mul * (a.totalPremium - b.totalPremium);
      case 'retention': return mul * (a.retention - b.retention);
      case 'nps': return mul * (a.nps - b.nps);
      default: return 0;
    }
  });

  /* Risk filter */
  const filteredRiskClients = AT_RISK_CLIENTS.filter((c) => {
    if (riskFilter === 'all') return true;
    return c.riskLevel === riskFilter;
  });

  /* Sort indicator */
  const SortIndicator = ({ column }: { column: SortKey }) => (
    <span className="ml-1 text-gray-400" style={{ fontSize: 10 }}>
      {sortKey === column ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
    </span>
  );

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Briefcase}
          title="Client Retention"
          subtitle="Retention, satisfaction, and client base"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Users}
              value={847}
              label="Total Clients"
              delta={12}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={Shield}
              value="94.2%"
              label="Retention Rate"
              sparklineData={[...SPARKLINE_RETENTION]}
              delta={1.2}
              deltaFormat="percent"
              periodLabel="vs last month"
              northStar
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={23}
              label="At-Risk Clients"
              delta={-3}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={72}
              label="Avg NPS Score"
              delta={4}
              periodLabel="vs last quarter"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Switcher ─────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex"
          style={{ gap: GRID.spacing.xs / 2 }}
        >
          {[
            { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
            { id: 'at-risk' as Tab, label: 'At Risk', icon: AlertTriangle },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center font-medium border-0 ${
                activeTab === tab.id
                  ? `bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white`
                  : 'text-gray-600'
              }`}
              style={{
                ...(activeTab !== tab.id ? glassCard : {}),
                borderRadius: RADIUS.button,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                fontSize: TYPE.meta,
                gap: GRID.spacing.xs,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <tab.icon size={LAYOUT.icon.md} />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── TAB: Overview ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* Golden ratio grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
              style={{ gap: GRID.spacing.md }}
            >
              {/* ── Left Column (1.618fr) ──────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Client Base */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Briefcase className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Client Base</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                          <tr>
                            {[
                              { key: 'name' as SortKey, label: 'Agent' },
                              { key: 'clients' as SortKey, label: 'Clients' },
                              { key: 'premium' as SortKey, label: 'Premium' },
                              { key: 'retention' as SortKey, label: 'Retention' },
                              { key: 'nps' as SortKey, label: 'NPS' },
                            ].map((col) => (
                              <th
                                key={col.key}
                                className="text-left text-gray-500 font-medium cursor-pointer select-none"
                                style={{
                                  fontSize: TYPE.micro,
                                  padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`,
                                  borderBottom: `1px solid ${COLORS.gray[200]}`,
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => handleSort(col.key)}
                              >
                                {col.label}
                                <SortIndicator column={col.key} />
                              </th>
                            ))}
                            <th
                              className="text-left text-gray-500 font-medium"
                              style={{
                                fontSize: TYPE.micro,
                                padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`,
                                borderBottom: `1px solid ${COLORS.gray[200]}`,
                              }}
                            >
                              Health
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAgents.map((agent) => (
                            <motion.tr
                              key={agent.id}
                              whileHover={{
                                backgroundColor: COLORS.gray[50],
                                transition: { duration: MOTION.duration.hover },
                              }}
                            >
                              <td style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px` }}>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <div
                                    className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: RADIUS.button,
                                      fontSize: TYPE.micro,
                                    }}
                                  >
                                    {agent.avatar}
                                  </div>
                                  <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{agent.name}</span>
                                </div>
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                {agent.totalClients}
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                ${agent.totalPremium.toLocaleString()}
                              </td>
                              <td className="font-medium" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, color: healthDotColor(agent.retention), fontSize: TYPE.meta }}>
                                {agent.retention}%
                              </td>
                              <td className="text-gray-700" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px`, fontSize: TYPE.meta }}>
                                {agent.nps}
                              </td>
                              <td style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.xs}px` }}>
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: healthDotColor(agent.retention),
                                  }}
                                />
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Distribution */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Policy Distribution</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    {/* Stacked bar */}
                    <div
                      className="flex overflow-hidden"
                      style={{ height: 32, borderRadius: RADIUS.button, marginBottom: GRID.spacing.sm }}
                    >
                      {POLICY_DISTRIBUTION.map((p) => (
                        <motion.div
                          key={p.type}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.percentage}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                          style={{ backgroundColor: p.color, height: '100%' }}
                          className="relative group"
                        />
                      ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {POLICY_DISTRIBUTION.map((p) => (
                        <div key={p.type} className="flex items-center justify-between">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                backgroundColor: p.color,
                                flexShrink: 0,
                              }}
                            />
                            <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{p.type}</span>
                          </div>
                          <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{p.count} policies</span>
                            <span className="text-gray-900 font-semibold" style={{ minWidth: 36, textAlign: 'right', fontSize: TYPE.meta }}>
                              {p.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Right Column (1fr) ─────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Retention Trend */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <TrendingUp className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Retention Trend</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <RetentionChart />
                  </CardContent>
                </Card>

                {/* Top Renewal Opportunities */}
                <Card
                  className="overflow-hidden"
                  style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
                >
                  <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <Calendar className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Top Renewal Opportunities</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {UPCOMING_RENEWALS.map((renewal, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center"
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            gap: 12,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Agent avatar */}
                          <div
                            className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.micro,
                            }}
                          >
                            {renewal.agentAvatar}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{renewal.client}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {renewal.policyType} · ${renewal.premium.toLocaleString()}/yr
                            </p>
                          </div>

                          {/* Renewal date */}
                          <span className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                            {renewal.renewalDate}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* ── TAB: At Risk ───────────────────────────────────── */}
        {activeTab === 'at-risk' && (
          <>
            <motion.div variants={fadeInUp}>
              <Card
                className="overflow-hidden"
                style={{...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card}}
              >
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <AlertTriangle className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">At-Risk Clients</span>
                    </CardTitle>

                    {/* Filter pills */}
                    <div className="flex" style={{ gap: GRID.spacing.xs / 2 }}>
                      {[
                        { id: 'all' as RiskFilter, label: 'All' },
                        { id: 'high' as RiskFilter, label: 'High Risk' },
                        { id: 'medium' as RiskFilter, label: 'Medium Risk' },
                      ].map((filter) => (
                        <motion.button
                          key={filter.id}
                          onClick={() => setRiskFilter(filter.id)}
                          className={`font-medium border-0 ${
                            riskFilter === filter.id
                              ? `bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white`
                              : 'text-gray-600'
                          }`}
                          style={{
                            ...(riskFilter !== filter.id ? glassCard : {}),
                            borderRadius: RADIUS.pill,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: TYPE.micro,
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {filteredRiskClients.map((client) => {
                      const reasonColor = RISK_REASON_COLORS[client.riskReason];
                      const levelColor = RISK_LEVEL_COLORS[client.riskLevel];

                      const ActionIcon = client.action === 'Contact' ? Phone : client.action === 'Review' ? FileSearch : ArrowUpRight;

                      return (
                        <motion.div
                          key={client.id}
                          className="flex items-center"
                          style={{
                            padding: 12,
                            borderRadius: RADIUS.button,
                            gap: 12,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Client info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{client.client}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {client.policyType} · ${client.premium.toLocaleString()}/yr
                            </p>
                          </div>

                          {/* Agent avatar + name */}
                          <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: RADIUS.button,
                                fontSize: 9,
                              }}
                            >
                              {client.agentAvatar}
                            </div>
                            <span className="text-gray-500 hidden sm:inline" style={{ fontSize: TYPE.caption }}>{client.agentName}</span>
                          </div>

                          {/* Risk reason badge */}
                          <span
                            className={`inline-flex items-center font-medium flex-shrink-0 ${reasonColor.bg} ${reasonColor.text}`}
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              fontSize: TYPE.micro,
                            }}
                          >
                            {client.riskReason}
                          </span>

                          {/* Risk level */}
                          <span
                            className={`inline-flex items-center font-semibold flex-shrink-0 ${levelColor.bg} ${levelColor.text}`}
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              fontSize: TYPE.micro,
                              minWidth: 56,
                              justifyContent: 'center',
                            }}
                          >
                            {client.riskLevel === 'high' ? 'High' : 'Medium'}
                          </span>

                          {/* Action button */}
                          <motion.button
                            onClick={() => toast.success(`${client.action} initiated for ${client.client}`)}
                            className="flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent flex-shrink-0"
                            style={{
                              fontSize: TYPE.caption,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              borderRadius: RADIUS.button,
                              gap: 4,
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ActionIcon size={LAYOUT.icon.xs} />
                            {client.action}
                          </motion.button>
                        </motion.div>
                      );
                    })}

                    {filteredRiskClients.length === 0 && (
                      <div className="text-center text-gray-400 py-8" style={{ fontSize: TYPE.meta }}>
                        No clients match the selected filter.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerClientHealth;
