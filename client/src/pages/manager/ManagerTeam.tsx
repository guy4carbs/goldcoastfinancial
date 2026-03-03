/**
 * Manager Team — Team Management Page
 * Full team roster with search, status, and quick insights
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT, DEMO_TEAM_MEMBERS, STATUS_COLORS, CERT_STATUS_COLORS, CERT_LEVEL_LABELS } from './managerConstants';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserCheck,
  Percent,
  UserPlus,
  Search,
  Lightbulb,
  Trophy,
  AlertCircle,
  Flame,
  ShieldAlert,
} from 'lucide-react';

export function ManagerTeam() {
  const [search, setSearch] = useState('');

  const filteredMembers = DEMO_TEAM_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Quick insight calculations
  const topPerformer = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.quota - a.quota)[0];
  const needsCoaching = [...DEMO_TEAM_MEMBERS].sort((a, b) => a.quota - b.quota)[0];
  const avgStreak = Math.round(
    DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.streak, 0) / DEMO_TEAM_MEMBERS.length,
  );

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
            icon={Users}
            title="Team Management"
            subtitle="Monitor and manage your team roster"
          />
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Total Agents" />
            <ManagerStatCard
              icon={UserCheck}
              value="8"
              label="Active Today"
              trend={{ value: 2, positive: true }}
            />
            <ManagerStatCard icon={Percent} value="76%" label="Avg Quota" />
            <ManagerStatCard icon={UserPlus} value="2" label="New This Month" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
            />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-gray-200"
              style={{
                paddingLeft: GRID.spacing.xl,
                borderRadius: RADIUS.input,
                height: LAYOUT.buttonHeight,
                fontSize: 14,
              }}
            />
          </div>
        </motion.div>

        {/* Main Content — 2-col grid: roster + insights */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Agent Roster — spans 2 cols on desktop */}
          <Card
            className="overflow-hidden border-0 lg:col-span-2"
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
                  <Users className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Agent Roster</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {filteredMembers.map((member) => {
                  const statusColor = STATUS_COLORS[member.status];
                  const quotaColor =
                    member.quota >= 100
                      ? 'text-emerald-600'
                      : member.quota >= 70
                        ? 'text-gray-700'
                        : 'text-red-600';

                  return (
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
                        {member.avatar}
                      </div>

                      {/* Name & Role */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {member.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {member.role}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center ${statusColor.bg} ${statusColor.text} border-0`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
                          gap: GRID.spacing.xs / 2,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        <div
                          className={statusColor.dot}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: RADIUS.pill,
                          }}
                        />
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </div>

                      {/* Certification Level */}
                      <div
                        className={`items-center hidden sm:flex border-0 ${CERT_STATUS_COLORS[member.certStatus].bg} ${CERT_STATUS_COLORS[member.certStatus].text}`}
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                          fontSize: 12,
                          fontWeight: 500,
                          gap: 4,
                        }}
                      >
                        L{member.certLevel}
                      </div>

                      {/* Quota */}
                      <div className="text-right" style={{ minWidth: 48 }}>
                        <p className={`font-semibold text-sm ${quotaColor}`}>
                          {member.quota}%
                        </p>
                      </div>

                      {/* Last Active */}
                      <div className="text-right hidden sm:block" style={{ minWidth: 80 }}>
                        <p className="text-gray-400 text-xs">
                          {member.lastActive}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div
                    className="text-center text-gray-400 text-sm"
                    style={{ padding: GRID.spacing.xl }}
                  >
                    No team members match your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights Panel */}
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
                  <Lightbulb className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Quick Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {/* Top Performer */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Trophy
                      className="text-amber-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500 text-xs">
                      Top Performer
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {topPerformer.name}
                  </p>
                  <p className="text-emerald-600 font-semibold text-sm">
                    {topPerformer.quota}% quota
                  </p>
                </div>

                {/* Needs Coaching */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <AlertCircle
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500 text-xs">
                      Needs Coaching
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {needsCoaching.name}
                  </p>
                  <p className="text-red-600 font-semibold text-sm">
                    {needsCoaching.quota}% quota
                  </p>
                </div>

                {/* Team Avg Streak */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: COLORS.gray[50],
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <Flame
                      className="text-orange-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500 text-xs">
                      Avg Streak
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {avgStreak} days
                  </p>
                  <p className="text-gray-500 text-sm">
                    Team average activity streak
                  </p>
                </div>

                {/* Compliance Alert */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: RADIUS.button,
                    backgroundColor: 'rgba(254,202,202,0.15)',
                    border: '1px solid rgba(254,202,202,0.3)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                    <ShieldAlert
                      className="text-red-500"
                      style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
                    />
                    <p className="font-medium text-gray-500 text-xs">
                      Compliance Alert
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'overdue').length} overdue, {DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'expiring').length} expiring
                  </p>
                  <p className="text-red-600 font-medium text-sm">
                    Certifications need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerTeam;
