/**
 * Executive Dashboard
 * High-level business metrics and forecasting
 *
 * Heritage Command Lounge Design System Applied
 * - 8-point modular grid compliance
 * - Apple-style motion curves
 * - Glass material effects
 * - Executive lounge theme (amber/gold)
 */

import { motion } from 'framer-motion';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Crown, BarChart3 } from 'lucide-react';
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

// Executive lounge theme colors
const executiveColors = COLORS.lounges.executive;

export function ExecutiveDashboard() {
  return (
    <ExecutiveLoungeLayout breadcrumbs={[{ label: 'Executive Lounge' }, { label: 'Dashboard' }]}>
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
        {/* Hero Card */}
        <motion.div
          variants={fadeInUp}
          className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700"
          style={{
            borderRadius: RADIUS.hero,
            padding: GRID.spacing.xl,
            boxShadow: SHADOW.hero,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glass overlay for depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.sm, marginBottom: GRID.spacing.sm }}>
              <Crown className="text-amber-200" style={{ width: LAYOUT.icon.lg, height: LAYOUT.icon.lg }} />
              <span
                style={{
                  fontSize: TYPE.meta,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Executive Command Center
              </span>
            </div>

            <h1 style={{
              fontSize: TYPE.hero,
              fontWeight: 700,
              color: 'white',
              marginBottom: GRID.spacing.xs,
              lineHeight: TYPE.lineHeight
            }}>
              Executive Dashboard
            </h1>

            <p style={{
              fontSize: TYPE.body,
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 600
            }}>
              Business performance overview and strategic forecasting
            </p>

            {/* Quick stats in hero */}
            <div style={{
              display: 'flex',
              gap: GRID.spacing.lg,
              marginTop: GRID.spacing.md,
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: GRID.spacing.xs,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: RADIUS.button,
                backdropFilter: 'blur(8px)',
              }}>
                <BarChart3 style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                <span style={{ fontSize: TYPE.meta, color: 'white', fontWeight: 500 }}>
                  Q1 Progress: 83%
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: GRID.spacing.xs,
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: RADIUS.button,
                backdropFilter: 'blur(8px)',
              }}>
                <TrendingUp style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                <span style={{ fontSize: TYPE.meta, color: 'white', fontWeight: 500 }}>
                  +22% Revenue Growth
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Revenue Stats */}
        <motion.div
          variants={fadeInUp}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: GRID.spacing.sm,
          }}
        >
          {/* Monthly Revenue Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                borderLeft: `4px solid ${COLORS.semantic.success}`,
                overflow: 'hidden',
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
                  Monthly Revenue
                </CardTitle>
                <div style={{
                  width: LAYOUT.icon.lg,
                  height: LAYOUT.icon.lg,
                  borderRadius: RADIUS.button,
                  background: `${COLORS.semantic.success}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <DollarSign style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: COLORS.semantic.success }} />
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>$248,500</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: TYPE.caption,
                  color: COLORS.semantic.success,
                  marginTop: GRID.spacing.xs
                }}>
                  <ArrowUpRight style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs, marginRight: 4 }} />
                  +22% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pipeline Value Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                borderLeft: `4px solid ${COLORS.semantic.info}`,
                overflow: 'hidden',
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
                  Pipeline Value
                </CardTitle>
                <div style={{
                  width: LAYOUT.icon.lg,
                  height: LAYOUT.icon.lg,
                  borderRadius: RADIUS.button,
                  background: `${COLORS.semantic.info}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Target style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: COLORS.semantic.info }} />
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>$1.2M</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: TYPE.caption,
                  color: COLORS.semantic.success,
                  marginTop: GRID.spacing.xs
                }}>
                  <ArrowUpRight style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs, marginRight: 4 }} />
                  +15% growth
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Agents Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                borderLeft: `4px solid ${COLORS.primary.violet[500]}`,
                overflow: 'hidden',
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
                  Active Agents
                </CardTitle>
                <div style={{
                  width: LAYOUT.icon.lg,
                  height: LAYOUT.icon.lg,
                  borderRadius: RADIUS.button,
                  background: `${COLORS.primary.violet[500]}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: COLORS.primary.violet[500] }} />
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>24</div>
                <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: GRID.spacing.xs }}>
                  3 new this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversion Rate Card */}
          <motion.div
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                borderLeft: `4px solid ${executiveColors.main}`,
                overflow: 'hidden',
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between"
                style={{ paddingBottom: GRID.spacing.xs }}
              >
                <CardTitle style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
                  Conversion Rate
                </CardTitle>
                <div style={{
                  width: LAYOUT.icon.lg,
                  height: LAYOUT.icon.lg,
                  borderRadius: RADIUS.button,
                  background: `${executiveColors.main}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: executiveColors.main }} />
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: TYPE.section, fontWeight: 700, color: COLORS.gray[900] }}>18.4%</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: TYPE.caption,
                  color: COLORS.semantic.error,
                  marginTop: GRID.spacing.xs
                }}>
                  <ArrowDownRight style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs, marginRight: 4 }} />
                  -2% from target
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={fadeInUp}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: GRID.spacing.md,
          }}
        >
          {/* Revenue Forecast */}
          <motion.div
            style={{ gridColumn: 'span 8' }}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            className="lg:col-span-8 col-span-12"
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                height: '100%',
                ...GLASS.css.light,
              }}
            >
              <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                <CardTitle style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>
                  Revenue Forecast
                </CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                  Projected revenue vs. actual for the quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    height: 256,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: COLORS.gray[50],
                    borderRadius: RADIUS.button,
                    border: `1px dashed ${COLORS.gray[300]}`,
                  }}
                >
                  <p style={{ color: COLORS.gray[400], fontSize: TYPE.body }}>Revenue chart will be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quarterly Goals */}
          <motion.div
            style={{ gridColumn: 'span 4' }}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            className="lg:col-span-4 col-span-12"
          >
            <Card
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                height: '100%',
                background: 'white',
              }}
            >
              <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs }}>
                  <div style={{
                    width: LAYOUT.icon.lg,
                    height: LAYOUT.icon.lg,
                    borderRadius: RADIUS.button,
                    background: `linear-gradient(135deg, ${executiveColors.main} 0%, ${executiveColors.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Target style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: 'white' }} />
                  </div>
                  <CardTitle style={{ fontSize: TYPE.title, fontWeight: 600, color: COLORS.gray[900] }}>
                    Q1 Goals
                  </CardTitle>
                </div>
                <CardDescription style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                  Progress toward quarterly targets
                </CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Revenue Goal */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: GRID.spacing.xs
                  }}>
                    <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>Revenue</span>
                    <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>$248K / $300K</span>
                  </div>
                  <Progress value={83} className="h-2" style={{ borderRadius: RADIUS.input }} />
                </div>

                {/* New Policies Goal */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: GRID.spacing.xs
                  }}>
                    <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>New Policies</span>
                    <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>127 / 150</span>
                  </div>
                  <Progress value={85} className="h-2" style={{ borderRadius: RADIUS.input }} />
                </div>

                {/* Agent Hiring Goal */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: GRID.spacing.xs
                  }}>
                    <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>Agent Hiring</span>
                    <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>3 / 5</span>
                  </div>
                  <Progress value={60} className="h-2" style={{ borderRadius: RADIUS.input }} />
                </div>

                {/* Retention Rate Goal */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: GRID.spacing.xs
                  }}>
                    <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[700] }}>Retention Rate</span>
                    <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>94% / 95%</span>
                  </div>
                  <Progress value={99} className="h-2" style={{ borderRadius: RADIUS.input }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveDashboard;
