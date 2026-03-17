/**
 * Executive Commissions — Override earnings, payouts, and commission structure
 * Heritage Design System — Orange/Blood Orange theme
 *
 * Tabs: Overview | Override Structure | Payouts | By Agent
 * Features waterfall/spread override visualization
 */

import { motion } from 'framer-motion';
import {
  PieChart as PieChartIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Users,
  Calendar,
  ArrowDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from './primitives/ExecutiveTabSection';
import { ExecutiveGlassTooltip } from './primitives/ExecutiveGlassTooltip';
import { Card, CardContent } from '@/components/ui/card';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency,
  DEMO_EXEC_COMMISSION_TIERS,
  DEMO_EXEC_COMMISSION_SUMMARY,
  DEMO_EXEC_PAYOUTS,
  DEMO_EXEC_HIERARCHY_TREE,
  DEMO_EXEC_AGENT_ROSTER,
  DEMO_REVENUE_BY_PRODUCT,
  AGENT_STATUS_COLORS,
} from './executiveConstants';

// ── Inline commission trend data (6 months) ──
const COMMISSION_TREND = [
  { month: 'Oct', earned: 122000 },
  { month: 'Nov', earned: 138000 },
  { month: 'Dec', earned: 115000 },
  { month: 'Jan', earned: 164000 },
  { month: 'Feb', earned: 189000 },
  { month: 'Mar', earned: 210000 },
];

// ── Status badge colors ──
const PAYOUT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  processing: { bg: 'bg-amber-50', text: 'text-amber-700' },
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

// ── Section Header helper ──
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.button,
          background: 'linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(251,191,36,0.15) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ── Waterfall Node Card ──
function WaterfallNode({
  name,
  role,
  contractLevel,
  color,
  revenue,
  team,
  agents,
}: {
  name: string;
  role: string;
  contractLevel: number;
  color: string;
  revenue?: number;
  team?: string;
  agents?: number;
}) {
  return (
    <div
      className="border-0 text-center"
      style={{
        ...GLASS.css.light,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        padding: GRID.spacing.sm,
        minWidth: 140,
        borderTop: `3px solid ${color}`,
      }}
    >
      <p className="font-bold text-gray-900" style={{ fontSize: TYPE.meta }}>{name}</p>
      <span
        className="inline-block mt-1"
        style={{
          fontSize: TYPE.micro,
          fontWeight: 600,
          color,
          backgroundColor: `${color}15`,
          padding: '2px 8px',
          borderRadius: RADIUS.pill,
        }}
      >
        {role}
      </span>
      <p className="font-bold mt-2" style={{ fontSize: TYPE.section, color }}>{contractLevel}%</p>
      {team && <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.micro }}>Team {team}</p>}
      {agents != null && <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{agents} agents</p>}
      {revenue != null && <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.caption }}>{fmtCurrency(revenue)}</p>}
    </div>
  );
}

// ── Spread Label ──
function SpreadLabel({ spread }: { spread: number }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 2 }}>
      <div style={{ width: 2, height: 16, backgroundColor: '#ea580c', opacity: 0.4 }} />
      <span
        className="font-semibold"
        style={{
          fontSize: TYPE.micro,
          color: '#ea580c',
          backgroundColor: 'rgba(234,88,12,0.08)',
          padding: '2px 6px',
          borderRadius: RADIUS.pill,
          whiteSpace: 'nowrap',
        }}
      >
        {spread}% override
      </span>
      <ArrowDown style={{ width: 12, height: 12, color: '#ea580c', opacity: 0.5 }} />
    </div>
  );
}

export function ExecutiveCommissions() {
  const ownerTier = DEMO_EXEC_COMMISSION_TIERS.find((t) => t.role === 'owner')!;
  const managerTiers = DEMO_EXEC_COMMISSION_TIERS.filter((t) => t.role === 'manager');
  const upcomingPayouts = DEMO_EXEC_PAYOUTS.filter((p) => p.status === 'upcoming' || p.status === 'processing');

  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── HERO ── */}
        <ExecutivePageHero
          icon={PieChartIcon}
          title="Commission Oversight"
          subtitle="Override earnings, payouts, and commission structure"
        />

        {/* ── STAT CARDS ── */}
        <motion.section variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              label="Total Pending"
              value={fmtCurrency(DEMO_EXEC_COMMISSION_SUMMARY.totalPending)}
            />
            <ExecutiveStatCard
              icon={TrendingUp}
              label="Paid YTD"
              value={fmtCurrency(DEMO_EXEC_COMMISSION_SUMMARY.paidYTD)}
            />
            <ExecutiveStatCard
              icon={Layers}
              label="Override Earnings"
              value={fmtCurrency(DEMO_EXEC_COMMISSION_SUMMARY.overrideEarnings)}
            />
            <ExecutiveStatCard
              icon={AlertTriangle}
              label="Chargeback Rate"
              value={`${DEMO_EXEC_COMMISSION_SUMMARY.chargebackRate}%`}
              delta={-DEMO_EXEC_COMMISSION_SUMMARY.chargebackRate}
            />
          </ExecutiveStatCardGrid>
        </motion.section>

        {/* ── TABS ── */}
        <motion.section variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Overview', icon: PieChartIcon },
              { value: 'override', label: 'Override Structure', icon: Layers },
              { value: 'payouts', label: 'Payouts', icon: DollarSign },
              { value: 'by-agent', label: 'By Agent', icon: Users },
            ]}
          >
            {/* ═══ OVERVIEW TAB ═══ */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Commission Trend Chart */}
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent style={{ padding: GRID.spacing.md }}>
                    <SectionHeader icon={TrendingUp} title="Commission Trend" subtitle="Earned commissions over 6 months" />
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={COMMISSION_TREND} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[100]} vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: TYPE.caption, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: TYPE.caption, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmtCurrency(v)} />
                        <Tooltip content={<ExecutiveGlassTooltip formatter={(v: number) => fmtCurrency(v)} />} />
                        <Bar dataKey="earned" fill="#ea580c" radius={[6, 6, 0, 0]} name="Earned" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Product Split */}
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent style={{ padding: GRID.spacing.md }}>
                    <SectionHeader icon={PieChartIcon} title="Commission by Product" subtitle="Revenue split across product lines" />
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
                          <div className="overflow-hidden" style={{ height: 8, backgroundColor: COLORS.gray[100], borderRadius: RADIUS.pill }}>
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

              {/* Upcoming Payouts */}
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent style={{ padding: GRID.spacing.md }}>
                    <SectionHeader icon={Calendar} title="Upcoming Payouts" subtitle="Next scheduled commission distributions" />
                    <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                      {upcomingPayouts.map((payout) => {
                        const statusColor = PAYOUT_STATUS_COLORS[payout.status];
                        return (
                          <div
                            key={payout.id}
                            style={{
                              ...GLASS.css.light,
                              borderRadius: RADIUS.card,
                              padding: GRID.spacing.sm,
                              boxShadow: SHADOW.level1,
                            }}
                          >
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="font-bold text-gray-900 mt-1" style={{ fontSize: TYPE.title }}>
                              {fmtCurrency(payout.amount)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>{payout.agentCount} agents</span>
                              <span
                                className={`${statusColor.bg} ${statusColor.text} font-medium`}
                                style={{ fontSize: TYPE.micro, padding: '2px 8px', borderRadius: RADIUS.pill }}
                              >
                                {payout.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ═══ OVERRIDE STRUCTURE TAB ═══ */}
            <TabsContent value="override" className="mt-6">
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent style={{ padding: GRID.spacing.md }}>
                    <SectionHeader icon={Layers} title="Waterfall Override Structure" subtitle="Spread-based override earnings across the hierarchy" />

                    <div className="flex flex-col items-center" style={{ gap: 0 }}>
                      {/* Owner Node */}
                      <WaterfallNode
                        name={ownerTier.name}
                        role="Owner"
                        contractLevel={ownerTier.contractLevel}
                        color="#ea580c"
                      />

                      {/* Spread Labels from Owner to Managers */}
                      <div className="flex justify-center" style={{ margin: `${GRID.spacing.xs}px 0` }}>
                        <div style={{ width: 2, height: 24, backgroundColor: '#ea580c', opacity: 0.3 }} />
                      </div>

                      {/* Connecting horizontal line */}
                      <div className="hidden lg:block relative w-full" style={{ maxWidth: 900 }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: 2,
                            backgroundColor: '#ea580c',
                            opacity: 0.25,
                          }}
                        />
                      </div>

                      {/* Manager Row */}
                      <div
                        className="flex flex-wrap justify-center"
                        style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.xs }}
                      >
                        {managerTiers.map((manager) => {
                          const spread = ownerTier.contractLevel - manager.contractLevel;
                          const hierarchyChildren = DEMO_EXEC_HIERARCHY_TREE.children.find(
                            (c) => c.name === manager.name
                          );
                          const agentExamples = hierarchyChildren?.children?.slice(0, 2) || [];

                          return (
                            <div key={manager.name} className="flex flex-col items-center" style={{ gap: 0 }}>
                              {/* Spread from Owner */}
                              <SpreadLabel spread={spread} />

                              {/* Manager Card */}
                              <WaterfallNode
                                name={manager.name}
                                role="Manager"
                                contractLevel={manager.contractLevel}
                                color="#f59e0b"
                                team={manager.team}
                                agents={hierarchyChildren?.agents}
                                revenue={hierarchyChildren?.revenue}
                              />

                              {/* Agent examples below manager */}
                              {agentExamples.length > 0 && (
                                <div className="flex flex-col items-center" style={{ gap: 0, marginTop: GRID.spacing.xs }}>
                                  <div style={{ width: 2, height: 12, backgroundColor: '#94a3b8', opacity: 0.3 }} />
                                  <div className="flex" style={{ gap: GRID.spacing.xs }}>
                                    {agentExamples.map((agent) => {
                                      const agentSpread = manager.contractLevel - agent.contractLevel;
                                      return (
                                        <div key={agent.name} className="flex flex-col items-center" style={{ gap: 0 }}>
                                          <SpreadLabel spread={agentSpread > 0 ? agentSpread : 0} />
                                          <WaterfallNode
                                            name={agent.name}
                                            role={agent.role}
                                            contractLevel={agent.contractLevel}
                                            color="#94a3b8"
                                            revenue={agent.revenue}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div
                      className="mt-6"
                      style={{
                        backgroundColor: COLORS.gray[50],
                        borderRadius: RADIUS.button,
                        padding: GRID.spacing.sm,
                        border: `1px solid ${COLORS.gray[200]}`,
                      }}
                    >
                      <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: 4 }}>
                        How Waterfall Overrides Work
                      </p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption, lineHeight: 1.5 }}>
                        Each level earns the <strong>spread</strong> (difference) between their contract level and the level
                        directly below them. The Owner (120%) earns overrides only on the gap to each Manager — not directly
                        down to agents. Example: Owner(120%) to Marcus Rivera(105%) = 15% override on that team's production.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ═══ PAYOUTS TAB ═══ */}
            <TabsContent value="payouts" className="mt-6">
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: COLORS.gray[50] }}>
                            <th className="text-left font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Date</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Amount</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Agent Count</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_EXEC_PAYOUTS.map((payout) => {
                            const statusColor = PAYOUT_STATUS_COLORS[payout.status];
                            return (
                              <tr
                                key={payout.id}
                                className="transition-colors duration-150"
                                style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.gray[50]; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                              >
                                <td className="text-gray-700" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                  {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="text-right font-semibold text-gray-900" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                  {fmtCurrency(payout.amount)}
                                </td>
                                <td className="text-right text-gray-600" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                  {payout.agentCount}
                                </td>
                                <td className="text-right" style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                  <span
                                    className={`${statusColor.bg} ${statusColor.text} font-medium inline-block`}
                                    style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill }}
                                  >
                                    {payout.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ═══ BY AGENT TAB ═══ */}
            <TabsContent value="by-agent" className="mt-6">
              <motion.div variants={scaleIn}>
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: COLORS.gray[50] }}>
                            <th className="text-left font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Name</th>
                            <th className="text-left font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Team</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Contract Level</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Revenue MTD</th>
                            <th className="text-right font-medium text-gray-500" style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...DEMO_EXEC_AGENT_ROSTER]
                            .sort((a, b) => b.revenueMTD - a.revenueMTD)
                            .map((agent) => {
                              const statusColor = AGENT_STATUS_COLORS[agent.status] || AGENT_STATUS_COLORS.active;
                              return (
                                <tr
                                  key={agent.id}
                                  className="transition-colors duration-150"
                                  style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.gray[50]; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                >
                                  <td style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                    <div>
                                      <p className="font-medium text-gray-900">{agent.name}</p>
                                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{agent.role}</p>
                                    </div>
                                  </td>
                                  <td className="text-gray-600" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                    {agent.team}
                                  </td>
                                  <td className="text-right font-semibold text-gray-900" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                    {agent.contractLevel}%
                                  </td>
                                  <td className="text-right font-semibold text-gray-900" style={{ fontSize: TYPE.meta, padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                    {fmtCurrency(agent.revenueMTD)}
                                  </td>
                                  <td className="text-right" style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                    <span
                                      className={`${statusColor.bg} ${statusColor.text} font-medium inline-flex items-center`}
                                      style={{ fontSize: TYPE.micro, padding: '2px 10px', borderRadius: RADIUS.pill, gap: 4 }}
                                    >
                                      <span className={`${statusColor.dot} inline-block`} style={{ width: 6, height: 6, borderRadius: RADIUS.pill }} />
                                      {agent.status.replace('-', ' ')}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.section>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveCommissions;
