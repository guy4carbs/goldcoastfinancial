/**
 * Executive Sales & Production
 * Heritage Design System — Orange/Amber theme
 *
 * Tracks sales velocity, production metrics, product mix, and team rankings.
 */

import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Zap,
  Crown,
  BarChart3,
  ShoppingBag,
  Award,
  Users,
  Trophy,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency,
  DEMO_EXEC_MONTHLY_TRENDS,
  DEMO_EXEC_SALES_VELOCITY,
  DEMO_REVENUE_BY_PRODUCT,
  DEMO_TOP_PERFORMERS,
  DEMO_TEAMS,
} from './executiveConstants';

// ─── INLINE DATA ─────────────────────────────────
const WEEKLY_PRODUCTION = [
  { week: 'Week 1', policies: 22, revenue: 142000 },
  { week: 'Week 2', policies: 25, revenue: 168000 },
  { week: 'Week 3', policies: 20, revenue: 131000 },
  { week: 'Week 4', policies: 24, revenue: 158000 },
];

const TEAM_VELOCITY = [
  { team: 'Team Alpha', avgCloseTime: '15d', winRate: 24.8 },
  { team: 'Team Beta', avgCloseTime: '17d', winRate: 21.3 },
  { team: 'Team Gamma', avgCloseTime: '19d', winRate: 22.1 },
  { team: 'Team Delta', avgCloseTime: '22d', winRate: 19.4 },
  { team: 'Team Echo', avgCloseTime: '26d', winRate: 16.8 },
];

// ─── SECTION HEADER ─────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.input,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveSales() {
  // First 6 months with actual data for bar chart
  const chartData = DEMO_EXEC_MONTHLY_TRENDS.slice(0, 6).map((d) => ({
    month: d.month.replace('2025', "'25").replace('2026', "'26"),
    revenue: d.revenue,
  }));

  // Top 3 performers for podium
  const top3 = DEMO_TOP_PERFORMERS.slice(0, 3);

  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Hero ── */}
        <ExecutivePageHero
          icon={TrendingUp}
          title="Sales & Production"
          subtitle="Monitor sales velocity, production metrics, and team rankings"
        />

        {/* ── Stat Cards ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={DollarSign}
              label="Monthly AP"
              value="$312K"
              delta={12}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={FileText}
              label="Policies Written"
              value="91"
              delta={8}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={BarChart3}
              label="Avg Premium"
              value="$18.4K"
              delta={5.2}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Zap}
              label="Sales Velocity"
              value="$19.8K/day"
              delta={14}
              periodLabel="vs last month"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="production"
            tabs={[
              { value: 'production', label: 'Production', icon: BarChart3 },
              { value: 'product-mix', label: 'Product Mix', icon: ShoppingBag },
              { value: 'velocity', label: 'Velocity', icon: Zap },
              { value: 'rankings', label: 'Rankings', icon: Trophy },
            ]}
          >
            {/* ════════════════ PRODUCTION TAB ════════════════ */}
            <TabsContent value="production" className="mt-6 space-y-6">
              <div>
                <SectionHeader
                  icon={BarChart3}
                  title="Monthly Production"
                  subtitle="Revenue by month (Oct 2025 - Mar 2026)"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={{ stroke: COLORS.gray[200] }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: TYPE.micro, fill: COLORS.gray[500] }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => fmtCurrency(v)}
                        />
                        <Tooltip
                          content={
                            <ExecutiveGlassTooltip
                              formatter={(v: number) => fmtCurrency(v)}
                            />
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#ea580c"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Production Table */}
              <div>
                <SectionHeader
                  icon={FileText}
                  title="Weekly Production"
                  subtitle="Last 4 weeks breakdown"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                            {['Week', 'Policies', 'Revenue'].map((h) => (
                              <th
                                key={h}
                                className="text-left font-semibold text-stone-600 px-6 py-4"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {WEEKLY_PRODUCTION.map((w) => (
                            <tr
                              key={w.week}
                              className="transition-colors hover:bg-orange-50/50"
                              style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                            >
                              <td
                                className="px-6 py-4 font-semibold text-stone-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {w.week}
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {w.policies}
                              </td>
                              <td
                                className="px-6 py-4 font-semibold text-stone-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {fmtCurrency(w.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ PRODUCT MIX TAB ════════════════ */}
            <TabsContent value="product-mix" className="mt-6">
              <SectionHeader
                icon={ShoppingBag}
                title="Revenue by Product"
                subtitle="Product line contribution to total revenue"
              />
              <Card
                className="border-0"
                style={{
                  ...GLASS.css.light,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                          {['Product', 'Revenue', 'Volume %', 'Distribution'].map((h) => (
                            <th
                              key={h}
                              className="text-left font-semibold text-stone-600 px-6 py-4"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_REVENUE_BY_PRODUCT.map((p) => (
                          <tr
                            key={p.product}
                            className="transition-colors hover:bg-orange-50/50"
                            style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                          >
                            <td
                              className="px-6 py-4 font-semibold text-stone-900"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {p.product}
                            </td>
                            <td
                              className="px-6 py-4 font-semibold text-stone-900"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {fmtCurrency(p.revenue)}
                            </td>
                            <td
                              className="px-6 py-4 text-stone-700"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {p.percentage}%
                            </td>
                            <td className="px-6 py-4" style={{ minWidth: 200 }}>
                              <div
                                style={{
                                  width: '100%',
                                  height: 8,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: COLORS.gray[100],
                                  overflow: 'hidden',
                                }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.percentage}%` }}
                                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                  style={{
                                    height: '100%',
                                    borderRadius: RADIUS.pill,
                                    backgroundColor: p.color,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════════════ VELOCITY TAB ════════════════ */}
            <TabsContent value="velocity" className="mt-6 space-y-6">
              <div>
                <SectionHeader
                  icon={Zap}
                  title="Sales Velocity Metrics"
                  subtitle="Key speed and efficiency indicators"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {[
                    {
                      label: 'Avg Days to Close',
                      value: `${DEMO_EXEC_SALES_VELOCITY.avgDaysToClose}`,
                      unit: 'days',
                      color: '#3b82f6',
                    },
                    {
                      label: 'Win Rate',
                      value: `${DEMO_EXEC_SALES_VELOCITY.winRate}%`,
                      unit: '',
                      color: '#10b981',
                    },
                    {
                      label: 'Avg Deal Size',
                      value: fmtCurrency(DEMO_EXEC_SALES_VELOCITY.avgDealSize),
                      unit: '',
                      color: '#f59e0b',
                    },
                    {
                      label: 'Deals / Day',
                      value: `${DEMO_EXEC_SALES_VELOCITY.dealsPerDay}`,
                      unit: '',
                      color: '#8b5cf6',
                    },
                    {
                      label: 'Revenue / Day',
                      value: fmtCurrency(DEMO_EXEC_SALES_VELOCITY.revenuePerDay),
                      unit: '',
                      color: '#ea580c',
                    },
                  ].map((metric) => (
                    <Card
                      key={metric.label}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5 text-center">
                        <p
                          className="font-bold text-stone-900"
                          style={{ fontSize: TYPE.section, lineHeight: 1.2 }}
                        >
                          {metric.value}
                        </p>
                        {metric.unit && (
                          <p style={{ fontSize: TYPE.caption, color: metric.color, fontWeight: 600 }}>
                            {metric.unit}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: TYPE.caption,
                            color: COLORS.gray[500],
                            marginTop: GRID.spacing.xs,
                          }}
                        >
                          {metric.label}
                        </p>
                        <div
                          style={{
                            width: 40,
                            height: 3,
                            borderRadius: RADIUS.pill,
                            backgroundColor: metric.color,
                            margin: '8px auto 0',
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Team Velocity Comparison */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Team Velocity Comparison"
                  subtitle="Average close time and win rate by team"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                            {['Team', 'Avg Close Time', 'Win Rate'].map((h) => (
                              <th
                                key={h}
                                className="text-left font-semibold text-stone-600 px-6 py-4"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {TEAM_VELOCITY.map((t) => (
                            <tr
                              key={t.team}
                              className="transition-colors hover:bg-orange-50/50"
                              style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                            >
                              <td
                                className="px-6 py-4 font-semibold text-stone-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {t.team}
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {t.avgCloseTime}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold"
                                  style={{
                                    fontSize: TYPE.meta,
                                    color: t.winRate >= 22 ? '#047857' : t.winRate >= 18 ? '#b45309' : '#b91c1c',
                                  }}
                                >
                                  {t.winRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════ RANKINGS TAB ════════════════ */}
            <TabsContent value="rankings" className="mt-6 space-y-6">
              {/* Podium */}
              <div>
                <SectionHeader
                  icon={Trophy}
                  title="Top Performers"
                  subtitle="Leading agents by revenue this quarter"
                />
                <div
                  className="flex items-end justify-center"
                  style={{ gap: GRID.spacing.md, paddingTop: GRID.spacing.lg }}
                >
                  {/* #2 — Left */}
                  {top3[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{ flex: '0 0 200px' }}
                    >
                      <Card
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent className="p-5 text-center">
                          <div
                            className="mx-auto flex items-center justify-center font-bold text-white"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.pill,
                              backgroundColor: '#94a3b8',
                              fontSize: TYPE.body,
                              marginBottom: GRID.spacing.sm,
                            }}
                          >
                            2
                          </div>
                          <p className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                            {top3[1].name}
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            {top3[1].team}
                          </p>
                          <p
                            className="font-bold"
                            style={{ fontSize: TYPE.title, color: '#ea580c', marginTop: GRID.spacing.xs }}
                          >
                            {fmtCurrency(top3[1].revenue)}
                          </p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                            {top3[1].deals} deals
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* #1 — Center (larger) */}
                  {top3[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      style={{ flex: '0 0 240px' }}
                    >
                      <Card
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: '0 16px 32px rgba(234, 88, 12, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08)',
                          outline: '2px solid rgba(249, 115, 22, 0.25)',
                        }}
                      >
                        <CardContent className="p-6 text-center">
                          <Crown
                            style={{
                              width: 28,
                              height: 28,
                              color: '#f59e0b',
                              margin: '0 auto',
                              marginBottom: GRID.spacing.xs,
                            }}
                          />
                          <div
                            className="mx-auto flex items-center justify-center font-bold text-white"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: RADIUS.pill,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                              fontSize: TYPE.section,
                              marginBottom: GRID.spacing.sm,
                            }}
                          >
                            1
                          </div>
                          <p className="font-bold text-stone-900" style={{ fontSize: TYPE.title }}>
                            {top3[0].name}
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            {top3[0].team}
                          </p>
                          <p
                            className="font-bold"
                            style={{ fontSize: TYPE.section, color: '#ea580c', marginTop: GRID.spacing.sm }}
                          >
                            {fmtCurrency(top3[0].revenue)}
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
                            {top3[0].deals} deals
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* #3 — Right */}
                  {top3[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ flex: '0 0 200px' }}
                    >
                      <Card
                        className="border-0"
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent className="p-5 text-center">
                          <div
                            className="mx-auto flex items-center justify-center font-bold text-white"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.pill,
                              backgroundColor: '#cd7f32',
                              fontSize: TYPE.body,
                              marginBottom: GRID.spacing.sm,
                            }}
                          >
                            3
                          </div>
                          <p className="font-bold text-stone-900" style={{ fontSize: TYPE.body }}>
                            {top3[2].name}
                          </p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                            {top3[2].team}
                          </p>
                          <p
                            className="font-bold"
                            style={{ fontSize: TYPE.title, color: '#ea580c', marginTop: GRID.spacing.xs }}
                          >
                            {fmtCurrency(top3[2].revenue)}
                          </p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}>
                            {top3[2].deals} deals
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Full Leaderboard Table */}
              <div>
                <SectionHeader
                  icon={Award}
                  title="Full Leaderboard"
                  subtitle="All top performers ranked by revenue"
                />
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                            {['Rank', 'Name', 'Team', 'Revenue', 'Deals'].map((h) => (
                              <th
                                key={h}
                                className="text-left font-semibold text-stone-600 px-6 py-4"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_TOP_PERFORMERS.map((p, idx) => (
                            <tr
                              key={p.id}
                              className="transition-colors hover:bg-orange-50/50"
                              style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                            >
                              <td className="px-6 py-4">
                                <span
                                  className="inline-flex items-center justify-center font-bold text-white"
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: RADIUS.pill,
                                    fontSize: TYPE.caption,
                                    backgroundColor:
                                      idx === 0
                                        ? '#f59e0b'
                                        : idx === 1
                                        ? '#94a3b8'
                                        : idx === 2
                                        ? '#cd7f32'
                                        : COLORS.gray[300],
                                  }}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold text-stone-900"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {p.name}
                                </span>
                                <span
                                  className="block"
                                  style={{ fontSize: TYPE.micro, color: COLORS.gray[400] }}
                                >
                                  {p.role}
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {p.team}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="font-semibold text-stone-900"
                                  style={{ fontSize: TYPE.meta }}
                                >
                                  {fmtCurrency(p.revenue)}
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-stone-700"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {p.deals}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveSales;
