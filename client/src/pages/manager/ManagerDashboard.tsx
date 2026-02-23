/**
 * Manager Dashboard
 * Team performance overview and key metrics
 * Updated with Heritage Command Lounge Design System
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Target, DollarSign, TrendingUp, Award, AlertTriangle, ChevronRight } from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  COLORS,
  fadeInUp,
  staggerContainer,
  scaleIn,
  spacing,
  GRID,
  LAYOUT,
  GLASS,
} from '@/lib/heritageDesignSystem';

export function ManagerDashboard() {
  // Manager lounge theme colors
  const loungeColors = COLORS.lounges.manager;

  return (
    <ManagerLoungeLayout breadcrumbs={[{ label: 'Manager Lounge' }, { label: 'Dashboard' }]}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.lg,
        }}
      >
        {/* Hero Command Card */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700"
          style={{
            borderRadius: RADIUS.hero,
            padding: GRID.spacing.xl,
            boxShadow: SHADOW.hero,
            minHeight: LAYOUT.card.heroHeight,
          }}
        >
          {/* Glass overlay effect */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <motion.p
                className="text-emerald-100 font-medium"
                style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.xs }}
              >
                Manager Command Center
              </motion.p>
              <motion.h1
                className="text-white font-bold"
                style={{ fontSize: TYPE.hero, lineHeight: 1.2 }}
              >
                Team Dashboard
              </motion.h1>
              <motion.p
                className="text-emerald-100 mt-2"
                style={{ fontSize: TYPE.body, maxWidth: '500px' }}
              >
                Monitor your team's performance, track pipeline health, and drive results with real-time insights.
              </motion.p>
            </div>

            {/* Hero Stats Row */}
            <div
              className="flex flex-wrap gap-6 mt-6"
              style={{ gap: GRID.spacing.lg }}
            >
              <div
                className="backdrop-blur-md bg-white/10 rounded-2xl px-5 py-4"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${GLASS.borderLight}`,
                }}
              >
                <p className="text-emerald-100 text-sm">Team Quota</p>
                <p className="text-white text-2xl font-bold">76%</p>
              </div>
              <div
                className="backdrop-blur-md bg-white/10 rounded-2xl px-5 py-4"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${GLASS.borderLight}`,
                }}
              >
                <p className="text-emerald-100 text-sm">Active Agents</p>
                <p className="text-white text-2xl font-bold">8/12</p>
              </div>
              <div
                className="backdrop-blur-md bg-white/10 rounded-2xl px-5 py-4"
                style={{
                  borderRadius: RADIUS.button,
                  border: `1px solid ${GLASS.borderLight}`,
                }}
              >
                <p className="text-emerald-100 text-sm">Pipeline</p>
                <p className="text-white text-2xl font-bold">$847K</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: GRID.spacing.sm }}
        >
          {/* Team Size Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between p-0"
                style={{ paddingBottom: GRID.spacing.sm }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Team Size
                </CardTitle>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.input,
                    backgroundColor: loungeColors.light,
                  }}
                >
                  <Users
                    style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    className="text-emerald-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.section }}
                >
                  12
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs / 2 }}
                >
                  8 active today
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pipeline Value Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between p-0"
                style={{ paddingBottom: GRID.spacing.sm }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Pipeline Value
                </CardTitle>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.input,
                    backgroundColor: COLORS.lounges.crm.light,
                  }}
                >
                  <Target
                    style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    className="text-indigo-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.section }}
                >
                  $847K
                </div>
                <p
                  className="text-emerald-600 font-medium"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs / 2 }}
                >
                  +18% this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* MTD Revenue Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between p-0"
                style={{ paddingBottom: GRID.spacing.sm }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  MTD Revenue
                </CardTitle>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.input,
                    backgroundColor: loungeColors.light,
                  }}
                >
                  <DollarSign
                    style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    className="text-emerald-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.section }}
                >
                  $124K
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs / 2 }}
                >
                  76% of target
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Quota Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between p-0"
                style={{ paddingBottom: GRID.spacing.sm }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Team Quota
                </CardTitle>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.input,
                    backgroundColor: COLORS.lounges.agent.light,
                  }}
                >
                  <TrendingUp
                    style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    className="text-violet-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.section }}
                >
                  76%
                </div>
                <Progress
                  value={76}
                  className="h-2 mt-3"
                  style={{
                    marginTop: GRID.spacing.sm,
                    borderRadius: RADIUS.pill,
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Top Performers Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <CardTitle
                  className="flex items-center text-gray-900"
                  style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.input,
                      backgroundColor: COLORS.accent.amber[100],
                    }}
                  >
                    <Award
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                      className="text-amber-600"
                    />
                  </div>
                  Top Performers
                </CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta, marginTop: GRID.spacing.xs / 2 }}>
                  This month's leaders
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { name: 'Sarah Johnson', sales: 8, revenue: '$42,500', quota: 112 },
                    { name: 'Mike Chen', sales: 6, revenue: '$38,200', quota: 95 },
                    { name: 'Emily Davis', sales: 5, revenue: '$31,800', quota: 88 },
                    { name: 'James Wilson', sales: 4, revenue: '$28,400', quota: 71 },
                  ].map((agent, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: idx === 0 ? COLORS.accent.amber[50] : 'transparent',
                      }}
                      whileHover={{
                        backgroundColor: COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover }
                      }}
                    >
                      <div
                        className={`flex items-center justify-center text-white font-bold ${
                          idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                          idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                          'bg-gray-300'
                        }`}
                        style={{
                          width: LAYOUT.icon.xl,
                          height: LAYOUT.icon.xl,
                          borderRadius: RADIUS.pill,
                          fontSize: TYPE.meta,
                          boxShadow: idx < 3 ? SHADOW.level1 : 'none',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontSize: TYPE.body }}
                        >
                          {agent.name}
                        </p>
                        <p
                          className="text-gray-500"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {agent.sales} sales · {agent.revenue}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-semibold ${agent.quota >= 100 ? 'text-emerald-600' : 'text-gray-600'}`}
                          style={{ fontSize: TYPE.body }}
                        >
                          {agent.quota}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Escalations Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              className="border-0 h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm }}>
                <CardTitle
                  className="flex items-center text-gray-900"
                  style={{ fontSize: TYPE.title, gap: GRID.spacing.xs }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.input,
                      backgroundColor: COLORS.accent.amber[100],
                    }}
                  >
                    <AlertTriangle
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                      className="text-amber-600"
                    />
                  </div>
                  Pending Escalations
                </CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta, marginTop: GRID.spacing.xs / 2 }}>
                  Requires your attention
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { type: 'Compliance Review', agent: 'Mike Chen', lead: 'Robert M.', priority: 'high' },
                    { type: 'Discount Approval', agent: 'Emily Davis', lead: 'Susan K.', priority: 'medium' },
                    { type: 'Policy Exception', agent: 'James Wilson', lead: 'Thomas L.', priority: 'medium' },
                  ].map((escalation, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center cursor-pointer"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{
                        backgroundColor: COLORS.gray[100],
                        scale: 1.01,
                        transition: { duration: MOTION.duration.hover }
                      }}
                    >
                      <div
                        className={`${
                          escalation.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                        style={{
                          width: GRID.spacing.xs,
                          height: GRID.spacing.xs,
                          borderRadius: RADIUS.pill,
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontSize: TYPE.body }}
                        >
                          {escalation.type}
                        </p>
                        <p
                          className="text-gray-500"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {escalation.agent} · Lead: {escalation.lead}
                        </p>
                      </div>
                      <motion.button
                        className="flex items-center font-semibold text-emerald-600 hover:text-emerald-700"
                        style={{
                          fontSize: TYPE.meta,
                          gap: GRID.spacing.xs / 2,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: loungeColors.light,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Review
                        <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerDashboard;
