/**
 * Manager Pipeline — Pipeline Overview Page
 * Team pipeline health, deal flow stages, and recent activity
 * Heritage Design System — Emerald theme
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_PIPELINE_STAGES } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/lib/heritageDesignSystem';
import {
  Target,
  DollarSign,
  BarChart3,
  TrendingUp,
  Activity,
} from 'lucide-react';

// Demo pipeline activity data
const DEMO_PIPELINE_ACTIVITY = [
  { id: '1', agent: 'Sarah Johnson', avatar: 'SJ', lead: 'Anderson Corp', from: 'Contacted', to: 'Qualified', time: '15 min ago' },
  { id: '2', agent: 'Mike Chen', avatar: 'MC', lead: 'Riverside LLC', from: 'New Leads', to: 'Contacted', time: '42 min ago' },
  { id: '3', agent: 'David Brown', avatar: 'DB', lead: 'Summit Partners', from: 'Qualified', to: 'Proposal', time: '1 hr ago' },
  { id: '4', agent: 'Rachel Green', avatar: 'RG', lead: 'Oakwood Holdings', from: 'Proposal', to: 'Closed Won', time: '2 hrs ago' },
  { id: '5', agent: 'Jessica Lee', avatar: 'JL', lead: 'Meridian Group', from: 'New Leads', to: 'Contacted', time: '3 hrs ago' },
];

function formatDollar(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function ManagerPipeline() {
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
            icon={Target}
            title="Pipeline Overview"
            subtitle="Track your team's deal flow and pipeline health"
          />
        </motion.div>

        {/* Stat Cards */}
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

        {/* Pipeline Stages */}
        <motion.div variants={fadeInUp}>
          <div
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
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: RADIUS.pill,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      className="font-medium text-gray-600 truncate text-sm"
                    >
                      {stage.stage}
                    </p>
                  </div>
                  <p
                    className="font-bold text-gray-900"
                    style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs / 2 }}
                  >
                    {stage.count}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDollar(stage.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Pipeline Activity */}
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
                <span className="text-gray-900">Recent Pipeline Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {DEMO_PIPELINE_ACTIVITY.map((item) => (
                  <motion.div
                    key={item.id}
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
                    {/* Avatar */}
                    <div
                      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                      style={{
                        width: LAYOUT.icon.xxl,
                        height: LAYOUT.icon.xxl,
                        borderRadius: RADIUS.pill,
                        fontSize: 14,
                      }}
                    >
                      {item.avatar}
                    </div>

                    {/* Activity Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ lineHeight: 1.4 }}>
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
                      <p className="text-gray-400 text-xs">
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
