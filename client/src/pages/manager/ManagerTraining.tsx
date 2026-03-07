/**
 * Manager Training
 * Team learning progress and skill development
 * Heritage Design System — Emerald theme
 *
 * PRD 6.1 (Team Progress, Agent Comparison)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  DEMO_TEAM_MEMBERS,
  CERT_STATUS_COLORS,
  CERT_LEVEL_LABELS,
  glassCard,
  MANAGER_ICON_GRADIENT,
} from './managerConstants';
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
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  ShieldCheck,
  BarChart3,
  Users,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/* ── Training status display ──────────────────────────────── */
const TRAINING_STATUS = {
  on_track: { label: 'On Track', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  behind: { label: 'Behind', bg: 'bg-amber-100', text: 'text-amber-700' },
  overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-700' },
} as const;

function getTrainingStatus(member: typeof DEMO_TEAM_MEMBERS[number]) {
  if (member.certStatus === 'overdue') return TRAINING_STATUS.overdue;
  if (member.certStatus === 'expiring' || member.modulesCompleted / member.modulesTotal < 0.6)
    return TRAINING_STATUS.behind;
  return TRAINING_STATUS.on_track;
}

/* ── Computed stats ────────────────────────────────────────── */
const certifiedCount = DEMO_TEAM_MEMBERS.filter(
  (m) => m.certLevel >= 2 && m.certStatus !== 'overdue'
).length;
const avgAssessment = Math.round(
  DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.assessmentAvg, 0) / DEMO_TEAM_MEMBERS.length
);
const activeLearners = DEMO_TEAM_MEMBERS.filter(
  (m) => m.modulesCompleted > 0 && m.modulesCompleted < m.modulesTotal
).length;
const totalModulesCompleted = DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.modulesCompleted, 0);

/**
 * Standalone tab content — used by ManagerComplianceHub "Learning" tab.
 * Renders without ManagerLoungeLayout, hero, or stat cards.
 */
export function TrainingTabContent() {
  const [compareAgents, setCompareAgents] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareAgents((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const comparedMembers = DEMO_TEAM_MEMBERS.filter((m) =>
    compareAgents.includes(m.id)
  );

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
      style={{ gap: GRID.spacing.md }}
    >
      {/* ── LEFT COLUMN — Team Training Progress ──────── */}
      <Card
        className="overflow-hidden"
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
          <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
            <div
              className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
              style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
            >
              <Users className="text-amber-200" size={LAYOUT.icon.md} />
            </div>
            <span className="text-gray-900">Team Training Progress</span>
          </CardTitle>
        </CardHeader>

        <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
          {/* Column headers */}
          <div
            className="hidden sm:grid items-center text-gray-400 font-medium"
            style={{
              gridTemplateColumns: '1fr auto auto auto auto',
              gap: 12,
              padding: `0 12px ${GRID.spacing.xs}px`,
              fontSize: TYPE.micro,
            }}
          >
            <span>Agent</span>
            <span className="w-20 text-center">Level</span>
            <span className="w-24 text-center">Modules</span>
            <span className="w-16 text-center">Score</span>
            <span className="w-20 text-center">Status</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
            {[...DEMO_TEAM_MEMBERS]
              .sort((a, b) => b.assessmentAvg - a.assessmentAvg)
              .map((member) => {
                const status = getTrainingStatus(member);
                const certColor = CERT_STATUS_COLORS[member.certStatus];
                const isSelected = compareAgents.includes(member.id);
                const progress = Math.round(
                  (member.modulesCompleted / member.modulesTotal) * 100
                );

                return (
                  <motion.div
                    key={member.id}
                    className="grid items-center cursor-pointer"
                    style={{
                      gridTemplateColumns: '1fr auto auto auto auto',
                      gap: 12,
                      padding: 12,
                      borderRadius: RADIUS.button,
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined,
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                    }}
                    whileHover={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                    onClick={() => toggleCompare(member.id)}
                  >
                    {/* Agent */}
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <div
                        className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                        }}
                      >
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                          {member.name}
                        </p>
                        <p className="text-gray-400 hidden sm:block" style={{ fontSize: TYPE.caption }}>
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Level badge */}
                    <span
                      className={`inline-flex items-center font-medium w-20 justify-center ${certColor.bg} ${certColor.text}`}
                      style={{
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        fontSize: TYPE.micro,
                      }}
                    >
                      L{member.certLevel} {CERT_LEVEL_LABELS[member.certLevel]}
                    </span>

                    {/* Modules progress */}
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {member.modulesCompleted}/{member.modulesTotal}
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {/* Score */}
                    <span
                      className={`w-16 text-center font-semibold ${
                        member.assessmentAvg >= 85
                          ? 'text-emerald-700'
                          : member.assessmentAvg >= 70
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                      style={{ fontSize: TYPE.meta }}
                    >
                      {member.assessmentAvg}%
                    </span>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center font-medium w-20 justify-center ${status.bg} ${status.text}`}
                      style={{
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        fontSize: TYPE.micro,
                      }}
                    >
                      {status.label}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* ── RIGHT COLUMN — Agent Comparison ───────────── */}
      <Card
        className="overflow-hidden"
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
          <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
            <div
              className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
              style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
            >
              <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
            </div>
            <span className="text-gray-900">Agent Comparison</span>
          </CardTitle>
        </CardHeader>

        <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
          {comparedMembers.length === 0 ? (
            <div
              className="text-center text-gray-400"
              style={{ padding: GRID.spacing.md, fontSize: TYPE.meta }}
            >
              Select agents from the training table to compare their metrics side by side.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
              {comparedMembers.map((member) => {
                const certColor = CERT_STATUS_COLORS[member.certStatus];
                return (
                  <div
                    key={member.id}
                    className="border border-gray-100"
                    style={{
                      padding: 12,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <div
                          className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                          style={{ width: LAYOUT.icon.lg, height: LAYOUT.icon.lg, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                        >
                          {member.avatar}
                        </div>
                        <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {member.name}
                        </span>
                      </div>
                      <motion.button
                        className="text-gray-400 border-0 bg-transparent"
                        style={{ fontSize: TYPE.caption }}
                        whileHover={{ color: COLORS.gray[600] }}
                        onClick={() => toggleCompare(member.id)}
                      >
                        Remove
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-3 text-center" style={{ gap: GRID.spacing.xs }}>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Level</p>
                        <p className={`font-semibold ${certColor.text}`} style={{ fontSize: TYPE.meta }}>
                          L{member.certLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Modules</p>
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {member.modulesCompleted}/{member.modulesTotal}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Score</p>
                        <p
                          className={`font-semibold ${
                            member.assessmentAvg >= 85 ? 'text-emerald-700' : member.assessmentAvg >= 70 ? 'text-amber-700' : 'text-red-700'
                          }`}
                          style={{ fontSize: TYPE.meta }}
                        >
                          {member.assessmentAvg}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ManagerTraining() {
  const [compareAgents, setCompareAgents] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareAgents((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const comparedMembers = DEMO_TEAM_MEMBERS.filter((m) =>
    compareAgents.includes(m.id)
  );

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={BookOpen}
          title="Training"
          subtitle="Team learning progress and skill development"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={ShieldCheck}
              value={`${certifiedCount}/${DEMO_TEAM_MEMBERS.length}`}
              label="Certified Agents"
              delta={1}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={BarChart3}
              value={`${avgAssessment}%`}
              label="Avg Assessment"
              delta={3}
              deltaFormat="percent"
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={activeLearners}
              label="Active Learners"
              delta={2}
              periodLabel="vs last week"
            />
            <ManagerStatCard
              icon={GraduationCap}
              value={totalModulesCompleted}
              label="Modules Completed"
              delta={8}
              periodLabel="This month"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Content Grid ────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ── LEFT COLUMN — Team Training Progress ──────── */}
          <Card
            className="overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <Users className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Team Training Progress</span>
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Column headers */}
              <div
                className="hidden sm:grid items-center text-gray-400 font-medium"
                style={{
                  gridTemplateColumns: '1fr auto auto auto auto',
                  gap: 12,
                  padding: `0 12px ${GRID.spacing.xs}px`,
                  fontSize: TYPE.micro,
                }}
              >
                <span>Agent</span>
                <span className="w-20 text-center">Level</span>
                <span className="w-24 text-center">Modules</span>
                <span className="w-16 text-center">Score</span>
                <span className="w-20 text-center">Status</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs / 2 }}>
                {[...DEMO_TEAM_MEMBERS]
                  .sort((a, b) => b.assessmentAvg - a.assessmentAvg)
                  .map((member) => {
                    const status = getTrainingStatus(member);
                    const certColor = CERT_STATUS_COLORS[member.certStatus];
                    const isSelected = compareAgents.includes(member.id);
                    const progress = Math.round(
                      (member.modulesCompleted / member.modulesTotal) * 100
                    );

                    return (
                      <motion.div
                        key={member.id}
                        className="grid items-center cursor-pointer"
                        style={{
                          gridTemplateColumns: '1fr auto auto auto auto',
                          gap: 12,
                          padding: 12,
                          borderRadius: RADIUS.button,
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined,
                          border: isSelected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                        }}
                        whileHover={{
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                        onClick={() => toggleCompare(member.id)}
                      >
                        {/* Agent */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                          <div
                            className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.caption,
                            }}
                          >
                            {member.avatar}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-gray-900 truncate"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {member.name}
                            </p>
                            <p className="text-gray-400 hidden sm:block" style={{ fontSize: TYPE.caption }}>
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {/* Level badge */}
                        <span
                          className={`inline-flex items-center font-medium w-20 justify-center ${certColor.bg} ${certColor.text}`}
                          style={{
                            borderRadius: RADIUS.pill,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: TYPE.micro,
                          }}
                        >
                          L{member.certLevel} {CERT_LEVEL_LABELS[member.certLevel]}
                        </span>

                        {/* Modules progress */}
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {member.modulesCompleted}/{member.modulesTotal}
                            </span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>

                        {/* Score */}
                        <span
                          className={`w-16 text-center font-semibold ${
                            member.assessmentAvg >= 85
                              ? 'text-emerald-700'
                              : member.assessmentAvg >= 70
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                          style={{ fontSize: TYPE.meta }}
                        >
                          {member.assessmentAvg}%
                        </span>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center font-medium w-20 justify-center ${status.bg} ${status.text}`}
                          style={{
                            borderRadius: RADIUS.pill,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: TYPE.micro,
                          }}
                        >
                          {status.label}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* ── RIGHT COLUMN — Agent Comparison ───────────── */}
          <Card
            className="overflow-hidden"
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <BarChart3 className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                <span className="text-gray-900">Agent Comparison</span>
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {comparedMembers.length === 0 ? (
                <div
                  className="text-center text-gray-400"
                  style={{ padding: GRID.spacing.md, fontSize: TYPE.meta }}
                >
                  Select agents from the training table to compare their metrics side by side.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {comparedMembers.map((member) => {
                    const certColor = CERT_STATUS_COLORS[member.certStatus];
                    return (
                      <div
                        key={member.id}
                        className="border border-gray-100"
                        style={{
                          padding: 12,
                          borderRadius: RADIUS.button,
                          backgroundColor: COLORS.gray[50],
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{ width: LAYOUT.icon.lg, height: LAYOUT.icon.lg, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                            >
                              {member.avatar}
                            </div>
                            <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                              {member.name}
                            </span>
                          </div>
                          <motion.button
                            className="text-gray-400 border-0 bg-transparent"
                            style={{ fontSize: TYPE.caption }}
                            whileHover={{ color: COLORS.gray[600] }}
                            onClick={() => toggleCompare(member.id)}
                          >
                            Remove
                          </motion.button>
                        </div>
                        <div className="grid grid-cols-3 text-center" style={{ gap: GRID.spacing.xs }}>
                          <div>
                            <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Level</p>
                            <p className={`font-semibold ${certColor.text}`} style={{ fontSize: TYPE.meta }}>
                              L{member.certLevel}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Modules</p>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                              {member.modulesCompleted}/{member.modulesTotal}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Score</p>
                            <p
                              className={`font-semibold ${
                                member.assessmentAvg >= 85 ? 'text-emerald-700' : member.assessmentAvg >= 70 ? 'text-amber-700' : 'text-red-700'
                              }`}
                              style={{ fontSize: TYPE.meta }}
                            >
                              {member.assessmentAvg}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerTraining;
