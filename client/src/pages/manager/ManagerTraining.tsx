/**
 * Manager Training Oversight
 * Monitor team certifications, compliance, and training progress
 * Heritage Design System — Emerald theme
 *
 * PRD 6.1 (Team Progress, Compliance Tracker, Approval Queue, Agent Comparison)
 * PRD 6.5 (Audit Trail view)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import {
  DEMO_TEAM_MEMBERS,
  DEMO_COMPLIANCE_DEADLINES,
  DEMO_APPROVAL_QUEUE,
  DEMO_AUDIT_TRAIL,
  CERT_STATUS_COLORS,
  CERT_LEVEL_LABELS,
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
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  ShieldCheck,
  ClipboardCheck,
  Award,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  TrendingUp,
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

/* ── Urgency color for compliance deadlines ────────────────── */
function getUrgencyColor(daysRemaining: number) {
  if (daysRemaining < 0) return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Overdue' };
  if (daysRemaining <= 7) return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', label: 'Critical' };
  if (daysRemaining <= 30) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Expiring' };
  return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Current' };
}

/* ── Audit trail type icons ────────────────────────────────── */
const AUDIT_ICONS = {
  completion: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  assessment: { icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
  started: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  certification: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
} as const;

/* ── Computed stats ────────────────────────────────────────── */
const certifiedCount = DEMO_TEAM_MEMBERS.filter(
  (m) => m.certLevel >= 2 && m.certStatus !== 'overdue'
).length;
const complianceRate = Math.round(
  (DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'current').length / DEMO_TEAM_MEMBERS.length) * 100
);
const avgAssessment = Math.round(
  DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.assessmentAvg, 0) / DEMO_TEAM_MEMBERS.length
);

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
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <ManagerPageHero
          icon={BookOpen}
          title="Training Oversight"
          subtitle="Monitor team certifications, compliance, and training progress"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={ShieldCheck}
              value={`${certifiedCount}/12`}
              label="Certified Agents"
            />
            <ManagerStatCard
              icon={TrendingUp}
              value={`${complianceRate}%`}
              label="Compliance Rate"
              trend={{ value: '5%', positive: true, label: 'mo' }}
            />
            <ManagerStatCard
              icon={ClipboardCheck}
              value={DEMO_APPROVAL_QUEUE.length}
              label="Pending Approvals"
            />
            <ManagerStatCard
              icon={BarChart3}
              value={`${avgAssessment}%`}
              label="Avg Assessment"
              trend={{ value: '3%', positive: true }}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Golden Ratio Content Grid ─────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ── LEFT COLUMN (61.8%) ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Team Training Progress */}
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
                    <Users className="w-5 h-5 text-amber-200" />
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
                    fontSize: 12,
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
                          }}
                          whileHover={{
                            backgroundColor: COLORS.gray[50],
                            transition: { duration: MOTION.duration.hover },
                          }}
                          onClick={() => toggleCompare(member.id)}
                        >
                          {/* Agent */}
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: RADIUS.pill,
                                fontSize: 12,
                              }}
                            >
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-gray-900 truncate text-sm"
                              >
                                {member.name}
                              </p>
                              <p className="text-gray-400 hidden sm:block text-xs">
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
                              fontSize: 12,
                            }}
                          >
                            L{member.certLevel} {CERT_LEVEL_LABELS[member.certLevel]}
                          </span>

                          {/* Modules progress */}
                          <div className="w-24">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500 text-xs">
                                {member.modulesCompleted}/{member.modulesTotal}
                              </span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>

                          {/* Score */}
                          <span
                            className={`w-16 text-center font-semibold text-sm ${
                              member.assessmentAvg >= 85
                                ? 'text-emerald-700'
                                : member.assessmentAvg >= 70
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                            }`}
                          >
                            {member.assessmentAvg}%
                          </span>

                          {/* Status */}
                          <span
                            className={`inline-flex items-center font-medium w-20 justify-center ${status.bg} ${status.text}`}
                            style={{
                              borderRadius: RADIUS.pill,
                              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                              fontSize: 12,
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

            {/* Compliance Tracker */}
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
                    <ShieldCheck className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Compliance Tracker</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_COMPLIANCE_DEADLINES.map((item) => {
                    const urgency = getUrgencyColor(item.expiresIn);
                    return (
                      <motion.div
                        key={item.id}
                        className="flex items-center"
                        style={{
                          gap: 12,
                          padding: 12,
                          borderRadius: RADIUS.button,
                          backgroundColor: item.expiresIn < 0 ? 'rgba(254,202,202,0.2)' : 'transparent',
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Urgency dot */}
                        <div
                          className={urgency.dot}
                          style={{
                            width: GRID.spacing.xs,
                            height: GRID.spacing.xs,
                            borderRadius: RADIUS.pill,
                            flexShrink: 0,
                          }}
                        />

                        {/* Avatar */}
                        <div
                          className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                          style={{ width: 28, height: 28, borderRadius: RADIUS.pill, fontSize: 11 }}
                        >
                          {item.avatar}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.agent}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {item.certification}
                          </p>
                        </div>

                        {/* Deadline */}
                        <div className="flex-shrink-0 text-right">
                          <p className={`font-medium text-xs ${urgency.text}`}>
                            {item.expiresIn < 0
                              ? `${Math.abs(item.expiresIn)}d overdue`
                              : `${item.expiresIn}d remaining`}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {item.expiresDate}
                          </p>
                        </div>

                        {/* Urgency badge */}
                        <span
                          className={`inline-flex items-center font-medium ${urgency.bg} ${urgency.text}`}
                          style={{
                            borderRadius: RADIUS.pill,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: 12,
                          }}
                        >
                          {urgency.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (38.2%) ────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

            {/* Approval Queue — Gradient Card */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
              style={{ borderRadius: RADIUS.card }}
            >
              <div className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl" style={{ width: 89, height: 89, transform: 'translate(30%, -40%)' }} />
              <div className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl" style={{ width: 55, height: 55, transform: 'translate(-30%, 40%)' }} />

              <div className="relative z-10" style={{ padding: GRID.spacing.md }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: LAYOUT.icon.xl,
                        height: LAYOUT.icon.xl,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <ClipboardCheck className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                        Approval Queue
                      </p>
                      <p className="text-white/70 text-[10px]">
                        Certifications awaiting sign-off
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_APPROVAL_QUEUE.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center"
                      style={{
                        gap: 12,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: RADIUS.pill,
                          background: 'rgba(255,255,255,0.2)',
                          fontSize: 11,
                        }}
                      >
                        {item.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{item.agent}</p>
                        <p className="text-white/60 text-xs">{item.certification}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-amber-200 font-semibold text-sm">{item.score}%</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <motion.button
                          className="flex items-center justify-center border-0 text-white"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: RADIUS.pill,
                            background: 'rgba(255,255,255,0.2)',
                          }}
                          whileHover={{ scale: 1.1, background: 'rgba(16,185,129,0.4)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle2 style={{ width: 16, height: 16 }} />
                        </motion.button>
                        <motion.button
                          className="flex items-center justify-center border-0 text-white/60"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: RADIUS.pill,
                            background: 'rgba(255,255,255,0.1)',
                          }}
                          whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.3)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XCircle style={{ width: 16, height: 16 }} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Comparison */}
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
                  <span className="text-gray-900">Agent Comparison</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                {comparedMembers.length === 0 ? (
                  <div
                    className="text-center text-gray-400 text-sm"
                    style={{ padding: GRID.spacing.md }}
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
                                style={{ width: 24, height: 24, borderRadius: RADIUS.pill, fontSize: 9 }}
                              >
                                {member.avatar}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">
                                {member.name}
                              </span>
                            </div>
                            <motion.button
                              className="text-gray-400 border-0 bg-transparent text-xs"
                              whileHover={{ color: COLORS.gray[600] }}
                              onClick={() => toggleCompare(member.id)}
                            >
                              Remove
                            </motion.button>
                          </div>
                          <div className="grid grid-cols-3 text-center" style={{ gap: GRID.spacing.xs }}>
                            <div>
                              <p className="text-gray-400 text-xs">Level</p>
                              <p className={`font-semibold text-sm ${certColor.text}`}>
                                L{member.certLevel}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Modules</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {member.modulesCompleted}/{member.modulesTotal}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Score</p>
                              <p
                                className={`font-semibold text-sm ${
                                  member.assessmentAvg >= 85 ? 'text-emerald-700' : member.assessmentAvg >= 70 ? 'text-amber-700' : 'text-red-700'
                                }`}
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

            {/* Audit Trail Feed */}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Clock className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="text-gray-900">Audit Trail</span>
                  </CardTitle>
                  <Link href="/manager/reports">
                    <span className="text-emerald-600 font-medium text-sm hover:underline cursor-pointer">
                      Full Log
                    </span>
                  </Link>
                </div>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {DEMO_AUDIT_TRAIL.slice(0, 6).map((entry) => {
                    const auditStyle = AUDIT_ICONS[entry.type];
                    const Icon = auditStyle.icon;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-start"
                        style={{ gap: 12, padding: `${GRID.spacing.xs}px 0` }}
                      >
                        <div
                          className={`flex items-center justify-center flex-shrink-0 ${auditStyle.bg}`}
                          style={{ width: 28, height: 28, borderRadius: RADIUS.pill }}
                        >
                          <Icon className={auditStyle.color} style={{ width: 14, height: 14 }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{entry.agent}</span>{' '}
                            {entry.action.replace(entry.agent, '').trim()}
                          </p>
                          <p className="text-xs text-gray-400">{entry.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerTraining;
