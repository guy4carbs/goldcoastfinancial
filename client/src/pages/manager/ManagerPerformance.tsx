/**
 * Manager Performance — Performance Analytics Page
 * Team metrics, agent rankings, and performance trends
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_TEAM_MEMBERS } from './managerConstants';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Phone,
  Percent,
  Clock,
  Award,
  BarChart3,
  Activity,
} from 'lucide-react';

// Sort team members by quota descending
const rankedMembers = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.quota - a.quota);
const topMembers = rankedMembers.slice(0, 8);

// Performance trend data
const TREND_DATA = [
  { label: 'Calls', value: 285, max: 400, display: '285' },
  { label: 'Appointments', value: 64, max: 100, display: '64' },
  { label: 'Closes', value: 51, max: 80, display: '51' },
  { label: 'Revenue', value: 124, max: 180, display: '$124K' },
];

export function ManagerPerformance() {
  const [_tab, setTab] = useState('monthly');

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={TrendingUp}
            title="Performance"
            subtitle="Analyze team metrics and identify trends"
          />
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={DollarSign}
              value="$124K"
              label="Team Revenue MTD"
              trend={{ value: '12%', positive: true }}
            />
            <ManagerStatCard icon={Phone} value="285" label="Calls This Week" />
            <ManagerStatCard
              icon={Percent}
              value="42%"
              label="Conversion Rate"
              trend={{ value: '3%', positive: true }}
            />
            <ManagerStatCard icon={Clock} value="2.4 hrs" label="Avg Response Time" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="monthly" onValueChange={setTab}>
            <TabsList style={{ borderRadius: RADIUS.button }}>
              <TabsTrigger value="weekly" style={{ borderRadius: RADIUS.button }}>
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" style={{ borderRadius: RADIUS.button }}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="quarterly" style={{ borderRadius: RADIUS.button }}>
                Quarterly
              </TabsTrigger>
            </TabsList>

            {/* All tabs share the same content layout; data would change per period in production */}
            {['weekly', 'monthly', 'quarterly'].map((period) => (
              <TabsContent key={period} value={period}>
                {/* Main Content — 2-col grid */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-2"
                  style={{ gap: GRID.spacing.lg, marginTop: GRID.spacing.md }}
                >
                  {/* Agent Rankings */}
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
                          style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                        >
                          <Award className="w-5 h-5 text-amber-200" />
                        </div>
                        <span className="text-gray-900">Agent Rankings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {rankedMembers.map((member, idx) => (
                          <motion.div
                            key={member.id}
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
                            {/* Rank */}
                            <span
                              className="text-sm font-bold text-gray-400 flex-shrink-0"
                              style={{ width: 20, textAlign: 'center' }}
                            >
                              #{idx + 1}
                            </span>

                            {/* Avatar */}
                            <div
                              className={`flex items-center justify-center text-xs bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                              style={{
                                width: LAYOUT.icon.xl,
                                height: LAYOUT.icon.xl,
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {member.avatar}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-semibold text-gray-900 truncate"
                              >
                                {member.name}
                              </p>
                            </div>

                            {/* Quota Bar */}
                            <div className="flex-1 min-w-0 hidden sm:block">
                              <Progress
                                value={Math.min(member.quota, 100)}
                                className="h-2 [&>div]:bg-emerald-500"
                                style={{ borderRadius: RADIUS.pill }}
                              />
                            </div>

                            {/* Quota % */}
                            <span
                              className={`text-sm font-semibold flex-shrink-0 ${
                                member.quota >= 100
                                  ? 'text-emerald-600'
                                  : member.quota >= 70
                                    ? 'text-gray-700'
                                    : 'text-red-600'
                              }`}
                              style={{ minWidth: 44, textAlign: 'right' }}
                            >
                              {member.quota}%
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
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
                          style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                        >
                          <BarChart3 className="w-5 h-5 text-amber-200" />
                        </div>
                        <span className="text-gray-900">Key Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      {/* Table Header */}
                      <div
                        className="flex items-center text-xs text-gray-500 font-medium"
                        style={{
                          padding: `${GRID.spacing.xs}px 12px`,
                          borderBottom: `1px solid ${COLORS.gray[200]}`,
                          marginBottom: GRID.spacing.xs,
                        }}
                      >
                        <span className="flex-1">Agent</span>
                        <span style={{ width: 60, textAlign: 'right' }}>Calls</span>
                        <span style={{ width: 60, textAlign: 'right' }}>Closes</span>
                        <span style={{ width: 80, textAlign: 'right' }}>Revenue</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {topMembers.map((member) => (
                          <motion.div
                            key={member.id}
                            className="flex items-center"
                            style={{
                              padding: 12,
                              borderRadius: RADIUS.button,
                            }}
                            whileHover={{
                              backgroundColor: COLORS.gray[50],
                              transition: { duration: MOTION.duration.hover },
                            }}
                          >
                            <span
                              className="flex-1 text-sm font-semibold text-gray-900 truncate"
                            >
                              {member.name}
                            </span>
                            <span
                              className="text-sm text-gray-600"
                              style={{ width: 60, textAlign: 'right' }}
                            >
                              {member.calls}
                            </span>
                            <span
                              className="text-sm text-gray-600"
                              style={{ width: 60, textAlign: 'right' }}
                            >
                              {member.closes}
                            </span>
                            <span
                              className="text-sm font-semibold text-gray-900"
                              style={{ width: 80, textAlign: 'right' }}
                            >
                              ${member.revenue.toLocaleString()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Performance Trends — Full Width */}
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
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <Activity className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Performance Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {TREND_DATA.map((trend) => (
                  <div key={trend.label}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs }}
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        {trend.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {trend.display}
                      </p>
                    </div>
                    <div
                      className="w-full overflow-hidden"
                      style={{
                        height: GRID.spacing.sm,
                        borderRadius: RADIUS.pill,
                        backgroundColor: COLORS.gray[100],
                      }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                        style={{ borderRadius: RADIUS.pill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(trend.value / trend.max) * 100}%` }}
                        transition={{
                          duration: 0.8,
                          ease: MOTION.easing as unknown as [number, number, number, number],
                          delay: 0.3,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerPerformance;
