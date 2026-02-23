/**
 * AI Dashboard
 * Overview of all AI agents and system status
 *
 * Updated with Heritage Command Lounge Design System
 * - 8-point grid compliance
 * - Apple-style motion curves
 * - Glass material effects
 * - Premium card elevation
 */

import { motion } from 'framer-motion';
import { AILoungeLayout } from './AILoungeLayout';
import { AgentActivityIndicator } from '@/components/agents/AgentActivityIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Activity, Zap, CheckCircle, Clock, Sparkles, Brain, Network } from 'lucide-react';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
  GLASS,
  fadeInUp,
  staggerContainer,
  scaleIn,
  spacing,
} from '@/lib/heritageDesignSystem';

// AI Lounge theme colors
const aiColors = COLORS.lounges.ai;

export function AIDashboard() {
  return (
    <AILoungeLayout breadcrumbs={[{ label: 'AI Lounge' }, { label: 'Dashboard' }]}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.lg
        }}
      >
        {/* Hero Command Card */}
        <motion.div variants={fadeInUp}>
          <div
            className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 text-white relative overflow-hidden"
            style={{
              borderRadius: RADIUS.hero,
              padding: GRID.spacing.xl,
              boxShadow: SHADOW.hero,
              minHeight: LAYOUT.card.heroHeight,
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
              <Network className="w-full h-full" />
            </div>
            <div className="absolute bottom-0 left-1/2 w-64 h-64 opacity-5">
              <Brain className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h1
                    className="font-bold tracking-tight"
                    style={{ fontSize: TYPE.hero, lineHeight: 1.2 }}
                  >
                    AI Command Center
                  </h1>
                  <p
                    className="text-cyan-100 mt-1"
                    style={{ fontSize: TYPE.body }}
                  >
                    Monitor and control your 37-agent AI workforce
                  </p>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div
                className="flex flex-wrap gap-6 mt-6"
                style={{ marginTop: GRID.spacing.lg }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span style={{ fontSize: TYPE.meta }}>32 Active Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-300" />
                  <span style={{ fontSize: TYPE.meta }}>1,247 Events Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span style={{ fontSize: TYPE.meta }}>All Systems Operational</span>
                </div>
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
          {/* Total Agents Card */}
          <motion.div
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Total Agents
                </CardTitle>
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: aiColors.light }}
                >
                  <Bot className="h-5 w-5" style={{ color: aiColors.main }} />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.hero }}
                >
                  37
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs }}
                >
                  Across 10 tiers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Now Card */}
          <motion.div
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Active Now
                </CardTitle>
                <div
                  className="p-2 rounded-xl bg-emerald-50"
                >
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="font-bold text-emerald-600"
                  style={{ fontSize: TYPE.hero }}
                >
                  32
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs }}
                >
                  5 idle
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Events Today Card */}
          <motion.div
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  Events Today
                </CardTitle>
                <div
                  className="p-2 rounded-xl bg-violet-50"
                >
                  <Zap className="h-5 w-5 text-violet-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.hero }}
                >
                  1,247
                </div>
                <p
                  className="text-emerald-600"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs }}
                >
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Health Card */}
          <motion.div
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                padding: GRID.spacing.md,
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle
                  className="font-medium text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  System Health
                </CardTitle>
                <div
                  className="p-2 rounded-xl bg-emerald-50"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="font-bold text-emerald-600"
                  style={{ fontSize: TYPE.hero }}
                >
                  Healthy
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontSize: TYPE.caption, marginTop: GRID.spacing.xs }}
                >
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Agent Status */}
          <motion.div
            className="lg:col-span-2"
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md }}>
                <CardTitle style={{ fontSize: TYPE.title }}>Agent Status</CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta }}>
                  Real-time status of all AI agents
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <AgentActivityIndicator mode="full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="h-full border-0"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                ...GLASS.css.light,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md }}>
                <CardTitle style={{ fontSize: TYPE.title }}>Recent Activity</CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta }}>
                  Latest agent events
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { agent: 'Lead Scoring', action: 'Scored lead: Maria G. (85/100)', time: '2m ago', status: 'success' },
                    { agent: 'Dialer Agent', action: 'Call connected: John S.', time: '5m ago', status: 'success' },
                    { agent: 'Compliance', action: 'Blocked: Invalid disclosure', time: '8m ago', status: 'warning' },
                    { agent: 'Email Agent', action: 'Sent follow-up to 12 leads', time: '15m ago', status: 'success' },
                    { agent: 'Enrichment', action: 'Enriched 3 new leads', time: '22m ago', status: 'success' },
                  ].map((event, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start"
                      style={{ gap: GRID.spacing.sm }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: idx * 0.08,
                        duration: MOTION.duration.normal,
                        ease: MOTION.easing
                      }}
                      whileHover={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: RADIUS.button,
                        transition: { duration: MOTION.duration.hover }
                      }}
                      style={{
                        padding: GRID.spacing.xs,
                        borderRadius: RADIUS.button,
                        gap: GRID.spacing.sm,
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          event.status === 'success' ? 'bg-emerald-500' :
                          event.status === 'warning' ? 'bg-amber-500' : 'bg-gray-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-gray-900"
                          style={{ fontSize: TYPE.meta }}
                        >
                          {event.agent}
                        </p>
                        <p
                          className="text-gray-500 truncate"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {event.action}
                        </p>
                      </div>
                      <span
                        className="text-gray-400 flex items-center shrink-0"
                        style={{ fontSize: TYPE.caption, gap: 4 }}
                      >
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </AILoungeLayout>
  );
}

export default AIDashboard;
