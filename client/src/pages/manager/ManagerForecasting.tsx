/**
 * Manager Forecasting — Revenue Forecast Page
 * Pipeline projections, scenario planning, and deal analysis
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_FORECAST_SCENARIOS,
  DEMO_FORECAST_DEALS,
  DEMO_FORECAST_ACCURACY,
} from './managerConstants';
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
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  DollarSign,
  Shield,
  Target,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

/* ── Period filter ─────────────────────────────────────────── */

const PERIOD_OPTIONS = ['This Month', 'Next Month', 'This Quarter'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

/* ── Helpers ───────────────────────────────────────────────── */

function formatDollar(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

const RISK_COLORS = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
  high: { bg: 'bg-red-100', text: 'text-red-700' },
} as const;

/* ── Sorted deals by weighted value (descending) ──────────── */

const sortedDeals = [...DEMO_FORECAST_DEALS].sort(
  (a, b) => b.value * b.probability - a.value * a.probability
);

const highRiskDeals = DEMO_FORECAST_DEALS.filter((d) => d.risk === 'high');

/* ── Coverage ratio ───────────────────────────────────────── */

const PIPELINE_TOTAL = 847000;
const TARGET = 400000;
const COVERAGE_RATIO = +(PIPELINE_TOTAL / TARGET).toFixed(1);

function getCoverageColor(ratio: number) {
  if (ratio >= 3) return '#10b981';
  if (ratio >= 2) return '#f59e0b';
  return '#ef4444';
}

/* ── Accuracy chart max ───────────────────────────────────── */

const accuracyMax = Math.max(
  ...DEMO_FORECAST_ACCURACY.flatMap((m) => [m.projected, m.actual])
);

/* ── Component ─────────────────────────────────────────────── */

export function ManagerForecasting() {
  const [period, setPeriod] = useState<Period>('This Month');

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={LineChart}
            title="Revenue Forecast"
            subtitle="Pipeline projections and deal analysis"
          />
        </motion.div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value="$312K"
              label="Weighted Forecast"
              trend={{ value: '8%', positive: true }}
            />
            <ManagerStatCard
              icon={Shield}
              value="3.2x"
              label="Coverage Ratio"
            />
            <ManagerStatCard
              icon={Target}
              value="87%"
              label="Forecast Accuracy"
              trend={{ value: '3%', positive: true }}
            />
            <ManagerStatCard
              icon={TrendingUp}
              value="$847K"
              label="Total Pipeline"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Period Selector Pills ───────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive = period === option;
            return (
              <motion.button
                key={option}
                onClick={() => setPeriod(option)}
                className="font-medium border-0"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: isActive ? undefined : 'blur(20px)',
                  WebkitBackdropFilter: isActive ? undefined : 'blur(20px)',
                  color: isActive ? '#ffffff' : COLORS.gray[600],
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {option}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Golden Ratio 2-Col Grid ────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
            style={{ gap: GRID.spacing.lg }}
          >
            {/* ═══ LEFT COLUMN (1.618fr) ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>

              {/* ── Scenario Planner ─────────────────────────── */}
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
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <BarChart3 className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Scenario Planner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {DEMO_FORECAST_SCENARIOS.map((scenario) => (
                      <div key={scenario.label}>
                        <div
                          className="flex items-center justify-between"
                          style={{ marginBottom: GRID.spacing.xs / 2 }}
                        >
                          <span
                            className="font-semibold text-gray-800"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {scenario.label}
                          </span>
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <span
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.body }}
                            >
                              {formatDollar(scenario.value)}
                            </span>
                            <span
                              className="text-gray-400 font-medium"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {scenario.probability}%
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={scenario.probability}
                          className={`h-3 ${scenario.color}`}
                          style={{ borderRadius: RADIUS.pill }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Pipeline-Weighted Deals Table ────────────── */}
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
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <DollarSign className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Pipeline-Weighted Deals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {/* Table header */}
                  <div
                    className="hidden md:grid items-center"
                    style={{
                      gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr',
                      gap: GRID.spacing.xs,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      marginBottom: GRID.spacing.xs / 2,
                    }}
                  >
                    {['Deal Name', 'Agent', 'Stage', 'Value', 'Prob', 'Weighted', 'Risk'].map(
                      (header) => (
                        <span
                          key={header}
                          className="font-semibold text-gray-400 uppercase tracking-wider"
                          style={{ fontSize: TYPE.micro }}
                        >
                          {header}
                        </span>
                      )
                    )}
                  </div>

                  {/* Table rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedDeals.map((deal) => {
                      const weighted = deal.value * (deal.probability / 100);
                      const risk = RISK_COLORS[deal.risk];
                      return (
                        <motion.div
                          key={deal.id}
                          className="grid items-center"
                          style={{
                            gridTemplateColumns: '1.6fr 1fr 0.8fr 0.7fr 0.5fr 0.8fr 0.6fr',
                            gap: GRID.spacing.xs,
                            padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                        >
                          {/* Deal Name */}
                          <span
                            className="font-semibold text-gray-900 truncate"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {deal.name}
                          </span>

                          {/* Agent (avatar + name) */}
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: LAYOUT.icon.xxl,
                                height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.micro,
                              }}
                            >
                              {deal.agentAvatar}
                            </div>
                            <span
                              className="text-gray-600 truncate"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {deal.agent}
                            </span>
                          </div>

                          {/* Stage */}
                          <span
                            className="text-gray-500"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {deal.stage}
                          </span>

                          {/* Value */}
                          <span
                            className="font-semibold text-gray-800"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {formatDollar(deal.value)}
                          </span>

                          {/* Probability */}
                          <span
                            className="text-gray-500 font-medium"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {deal.probability}%
                          </span>

                          {/* Weighted Value */}
                          <span
                            className="font-bold"
                            style={{ fontSize: TYPE.meta, color: '#d97706' }}
                          >
                            {formatDollar(weighted)}
                          </span>

                          {/* Risk Badge */}
                          <span
                            className={`${risk.bg} ${risk.text} font-semibold text-center`}
                            style={{
                              fontSize: TYPE.micro,
                              borderRadius: RADIUS.pill,
                              padding: `2px ${GRID.spacing.xs}px`,
                              textTransform: 'capitalize',
                            }}
                          >
                            {deal.risk}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ═══ RIGHT COLUMN (1fr) ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>

              {/* ── Coverage Ratio Visual ────────────────────── */}
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
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Shield className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Coverage Ratio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {/* Ratio display */}
                  <div className="text-center" style={{ marginBottom: GRID.spacing.md }}>
                    <span
                      className="font-bold"
                      style={{
                        fontSize: TYPE.display,
                        color: getCoverageColor(COVERAGE_RATIO),
                      }}
                    >
                      {COVERAGE_RATIO}x
                    </span>
                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                      Pipeline vs Target
                    </p>
                  </div>

                  {/* Pipeline bar */}
                  <div style={{ marginBottom: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs / 2 }}
                    >
                      <span className="text-gray-600 font-medium" style={{ fontSize: TYPE.caption }}>
                        Pipeline
                      </span>
                      <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                        {formatDollar(PIPELINE_TOTAL)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 12,
                        borderRadius: RADIUS.pill,
                        backgroundColor: COLORS.gray[100],
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: '100%',
                          borderRadius: RADIUS.pill,
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Target bar */}
                  <div>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs / 2 }}
                    >
                      <span className="text-gray-600 font-medium" style={{ fontSize: TYPE.caption }}>
                        Target
                      </span>
                      <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                        {formatDollar(TARGET)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 12,
                        borderRadius: RADIUS.pill,
                        backgroundColor: COLORS.gray[100],
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(TARGET / PIPELINE_TOTAL) * 100}%`,
                          borderRadius: RADIUS.pill,
                          background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Legend */}
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.sm }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#10b981',
                        }}
                      />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                        Pipeline
                      </span>
                    </div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#6366f1',
                        }}
                      />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                        Target
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Forecast Accuracy ────────────────────────── */}
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
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Target className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Forecast Accuracy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  {/* Inline SVG bar chart */}
                  <svg
                    width="100%"
                    viewBox="0 0 300 160"
                    style={{ overflow: 'visible' }}
                  >
                    {DEMO_FORECAST_ACCURACY.map((month, i) => {
                      const barWidth = 18;
                      const gap = 300 / DEMO_FORECAST_ACCURACY.length;
                      const x = i * gap + (gap - barWidth * 2 - 4) / 2;
                      const projectedHeight = (month.projected / accuracyMax) * 120;
                      const actualHeight = month.actual > 0 ? (month.actual / accuracyMax) * 120 : 0;

                      return (
                        <g key={month.month}>
                          {/* Projected bar */}
                          <rect
                            x={x}
                            y={130 - projectedHeight}
                            width={barWidth}
                            height={projectedHeight}
                            rx={4}
                            fill="#10b981"
                            opacity={0.7}
                          />
                          {/* Actual bar */}
                          {month.actual > 0 && (
                            <rect
                              x={x + barWidth + 4}
                              y={130 - actualHeight}
                              width={barWidth}
                              height={actualHeight}
                              rx={4}
                              fill="#6366f1"
                              opacity={0.8}
                            />
                          )}
                          {/* Month label */}
                          <text
                            x={x + barWidth + 2}
                            y={150}
                            textAnchor="middle"
                            fontSize={TYPE.micro}
                            fill={COLORS.gray[400]}
                          >
                            {month.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.xs }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#10b981',
                        }}
                      />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                        Projected
                      </span>
                    </div>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: RADIUS.pill,
                          backgroundColor: '#6366f1',
                        }}
                      />
                      <span className="text-gray-500" style={{ fontSize: TYPE.micro }}>
                        Actual
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── At-Risk Deals ────────────────────────────── */}
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
                  <CardTitle
                    className="font-semibold flex items-center"
                    style={{ fontSize: TYPE.title, gap: 12 }}
                  >
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">At-Risk Deals</span>
                    <span
                      className="bg-red-100 text-red-700 font-semibold"
                      style={{
                        fontSize: TYPE.micro,
                        borderRadius: RADIUS.pill,
                        padding: `2px ${GRID.spacing.xs}px`,
                        marginLeft: 'auto',
                      }}
                    >
                      {highRiskDeals.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                    {highRiskDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        className="flex items-center"
                        style={{
                          padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          gap: GRID.spacing.xs,
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Agent avatar */}
                        <div
                          className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600"
                          style={{
                            width: LAYOUT.icon.xxl,
                            height: LAYOUT.icon.xxl,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.micro,
                          }}
                        >
                          {deal.agentAvatar}
                        </div>

                        {/* Deal info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-gray-900 truncate"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {deal.name}
                          </p>
                          <p
                            className="text-gray-400 truncate"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {deal.agent} &middot; {formatDollar(deal.value)}
                          </p>
                        </div>

                        {/* Review button */}
                        <motion.button
                          className="flex-shrink-0 font-semibold border-0"
                          style={{
                            fontSize: TYPE.caption,
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: RADIUS.button,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                            cursor: 'pointer',
                          }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          Review
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerForecasting;
