/**
 * Marketing Dashboard
 * Content performance and campaign overview
 * Built with Heritage Command Lounge Design System
 */

import { motion } from 'framer-motion';
import { MarketingLoungeLayout } from './MarketingLoungeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Heart, Share2, Star, TrendingUp, Sparkles } from 'lucide-react';
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

// Marketing lounge theme colors
const marketingColors = COLORS.lounges.marketing;

export function MarketingDashboard() {
  return (
    <MarketingLoungeLayout breadcrumbs={[{ label: 'Marketing Lounge' }, { label: 'Dashboard' }]}>
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
          className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700"
          style={{
            borderRadius: RADIUS.hero,
            padding: GRID.spacing.xl,
            boxShadow: SHADOW.hero,
            minHeight: 180,
          }}
        >
          {/* Decorative gradient overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.3), transparent 60%)',
            }}
          />

          {/* Glass accent */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: `blur(${GLASS.blur}px)`,
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span
                className="text-white/80 font-medium"
                style={{ fontSize: TYPE.meta }}
              >
                Marketing Command Center
              </span>
            </div>

            <h1
              className="text-white font-bold mb-2"
              style={{ fontSize: TYPE.hero, lineHeight: 1.2 }}
            >
              Marketing Dashboard
            </h1>
            <p
              className="text-white/80"
              style={{ fontSize: TYPE.body }}
            >
              Content performance and campaign insights at a glance
            </p>

            {/* Quick stats row */}
            <div
              className="flex gap-6 mt-6"
              style={{ marginTop: GRID.spacing.md }}
            >
              <div
                className="px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: `blur(${GLASS.blurLight}px)`,
                  borderRadius: RADIUS.button,
                }}
              >
                <span className="text-white/70 text-sm">This Month</span>
                <div className="text-white font-bold text-xl flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  +24% Growth
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: GRID.spacing.sm }}
        >
          {[
            {
              title: 'Content Published',
              value: '47',
              subtitle: 'This month',
              icon: FileText,
              iconColor: marketingColors.main,
              iconBg: marketingColors.light
            },
            {
              title: 'Total Reach',
              value: '124K',
              subtitle: '+18% this month',
              subtitleColor: COLORS.semantic.success,
              icon: Eye,
              iconColor: '#3b82f6',
              iconBg: '#eff6ff'
            },
            {
              title: 'Engagement',
              value: '4.2%',
              subtitle: '+0.8% this month',
              subtitleColor: COLORS.semantic.success,
              icon: Heart,
              iconColor: marketingColors.main,
              iconBg: marketingColors.light
            },
            {
              title: 'Reputation Score',
              value: '4.8',
              subtitle: 'Based on 127 reviews',
              icon: Star,
              iconColor: COLORS.accent.amber[500],
              iconBg: COLORS.accent.amber[50]
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{
                y: MOTION.hover.y,
                scale: MOTION.hover.scale,
                transition: { duration: MOTION.duration.hover }
              }}
            >
              <Card
                className="border-0 bg-white"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.level2,
                  border: `1px solid ${COLORS.gray[100]}`,
                }}
              >
                <CardHeader
                  className="flex flex-row items-center justify-between"
                  style={{ paddingBottom: GRID.spacing.xs }}
                >
                  <CardTitle
                    className="font-medium"
                    style={{
                      fontSize: TYPE.meta,
                      color: COLORS.gray[500]
                    }}
                  >
                    {stat.title}
                  </CardTitle>
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: stat.iconBg }}
                  >
                    <stat.icon
                      className="h-4 w-4"
                      style={{ color: stat.iconColor }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: TYPE.section,
                      color: COLORS.gray[900]
                    }}
                  >
                    {stat.value}
                  </div>
                  <p
                    style={{
                      fontSize: TYPE.caption,
                      color: stat.subtitleColor || COLORS.gray[500],
                      marginTop: GRID.spacing.xs / 2
                    }}
                  >
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.md }}
        >
          {/* Top Content */}
          <motion.div
            variants={fadeInUp}
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="border-0 bg-white h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                border: `1px solid ${COLORS.gray[100]}`,
              }}
            >
              <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                <CardTitle style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
                  Top Performing Content
                </CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                  Best engagement this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { title: '5 Ways to Protect Your Family', type: 'Blog', views: '8.2K', engagement: '6.2%' },
                    { title: 'Life Insurance Explained', type: 'Video', views: '5.1K', engagement: '8.4%' },
                    { title: 'IUL vs Whole Life', type: 'Infographic', views: '3.8K', engagement: '5.1%' },
                    { title: 'Client Success Story: The Johnsons', type: 'Social', views: '2.4K', engagement: '9.2%' },
                  ].map((content, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        background: COLORS.gray[50],
                        borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{
                        background: marketingColors.light,
                        transition: { duration: MOTION.duration.hover }
                      }}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: LAYOUT.icon.xl + GRID.spacing.sm,
                          height: LAYOUT.icon.xl + GRID.spacing.sm,
                          borderRadius: RADIUS.input,
                          background: marketingColors.light,
                        }}
                      >
                        <FileText
                          className="w-5 h-5"
                          style={{ color: marketingColors.main }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate"
                          style={{
                            fontSize: TYPE.meta,
                            color: COLORS.gray[900]
                          }}
                        >
                          {content.title}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                          {content.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-medium"
                          style={{
                            fontSize: TYPE.meta,
                            color: COLORS.gray[900]
                          }}
                        >
                          {content.views}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.semantic.success }}>
                          {content.engagement}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Social Channels */}
          <motion.div
            variants={fadeInUp}
            whileHover={{
              y: MOTION.hover.y,
              scale: MOTION.hover.scale,
              transition: { duration: MOTION.duration.hover }
            }}
          >
            <Card
              className="border-0 bg-white h-full"
              style={{
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.level2,
                border: `1px solid ${COLORS.gray[100]}`,
              }}
            >
              <CardHeader style={{ paddingBottom: GRID.spacing.sm }}>
                <CardTitle style={{ fontSize: TYPE.title, color: COLORS.gray[900] }}>
                  Channel Performance
                </CardTitle>
                <CardDescription style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
                  Social media metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {[
                    { channel: 'Facebook', followers: '12.4K', growth: '+2.1%', engagement: '4.8%', color: '#1877f2' },
                    { channel: 'Instagram', followers: '8.7K', growth: '+5.3%', engagement: '6.2%', color: '#e4405f' },
                    { channel: 'LinkedIn', followers: '5.2K', growth: '+3.8%', engagement: '3.1%', color: '#0a66c2' },
                    { channel: 'YouTube', followers: '2.1K', growth: '+8.2%', engagement: '7.4%', color: '#ff0000' },
                  ].map((channel, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[100]}`,
                      }}
                      whileHover={{
                        background: COLORS.gray[50],
                        transition: { duration: MOTION.duration.hover }
                      }}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: LAYOUT.icon.xl + GRID.spacing.sm,
                          height: LAYOUT.icon.xl + GRID.spacing.sm,
                          borderRadius: RADIUS.input,
                          background: `${channel.color}15`,
                        }}
                      >
                        <Share2
                          className="w-5 h-5"
                          style={{ color: channel.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-medium"
                          style={{
                            fontSize: TYPE.meta,
                            color: COLORS.gray[900]
                          }}
                        >
                          {channel.channel}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                          {channel.followers} followers
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-medium"
                          style={{
                            fontSize: TYPE.meta,
                            color: COLORS.semantic.success
                          }}
                        >
                          {channel.growth}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                          {channel.engagement} eng.
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </MarketingLoungeLayout>
  );
}

export default MarketingDashboard;
