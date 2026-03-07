/**
 * Manager Compliance
 * Certifications, approvals, and compliance tracking — unified view.
 * Merges Training compliance sections + Approvals into a single hub.
 *
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import { TrainingTabContent } from './ManagerTraining';
import {
  DEMO_TEAM_MEMBERS,
  DEMO_COMPLIANCE_DEADLINES,
  DEMO_ACTIVITY_LOG,
  CERT_STATUS_COLORS,
  CERT_LEVEL_LABELS,
  glassCard,
  MANAGER_ICON_GRADIENT,
  SPARKLINE_COMPLIANCE,
} from './managerConstants';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckSquare,
  CheckCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  Briefcase,
  FileText,
  Award,
  BookOpen,
  BarChart3,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   CERTIFICATIONS TAB — Helpers & Config
   ══════════════════════════════════════════════════════════════ */

function getUrgencyColor(daysRemaining: number) {
  if (daysRemaining < 0) return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Overdue' };
  if (daysRemaining <= 7) return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', label: 'Critical' };
  if (daysRemaining <= 30) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Expiring' };
  return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Current' };
}

const AUDIT_ICONS = {
  completion: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  assessment: { icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
  started: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  certification: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
} as const;

/* ══════════════════════════════════════════════════════════════
   APPROVALS TAB — Types, Data & Config
   ══════════════════════════════════════════════════════════════ */

type ApprovalType = 'discount' | 'compliance' | 'time_off' | 'expense' | 'deal_override';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type ApprovalTabFilter = 'pending' | 'approved' | 'rejected' | 'all';

interface Approval {
  id: string;
  type: ApprovalType;
  requestorName: string;
  requestorAvatar: string;
  description: string;
  timestamp: string;
  status: ApprovalStatus;
  amount?: number;
}

const DEMO_APPROVALS: Approval[] = [
  { id: '1', type: 'discount', requestorName: 'Sarah Johnson', requestorAvatar: 'SJ', description: '12% discount on Anderson Group term life policy ($45K premium)', timestamp: '2 hrs ago', status: 'pending', amount: 5400 },
  { id: '2', type: 'compliance', requestorName: 'Mike Chen', requestorAvatar: 'MC', description: 'Compliance exception — client signature collected digitally', timestamp: '3 hrs ago', status: 'pending' },
  { id: '3', type: 'time_off', requestorName: 'Emily Davis', requestorAvatar: 'ED', description: 'PTO request: March 15-19 (5 days)', timestamp: '5 hrs ago', status: 'pending' },
  { id: '4', type: 'expense', requestorName: 'James Wilson', requestorAvatar: 'JW', description: 'Client dinner expense — networking event', timestamp: '1 day ago', status: 'pending', amount: 285 },
  { id: '5', type: 'deal_override', requestorName: 'David Brown', requestorAvatar: 'DB', description: 'Override deal stage from Qualified to Proposal — client requested expedited review', timestamp: '1 day ago', status: 'approved' },
  { id: '6', type: 'discount', requestorName: 'Lisa Park', requestorAvatar: 'LP', description: '18% discount on family whole life bundle — exceeds 15% threshold', timestamp: '2 days ago', status: 'rejected', amount: 3200 },
  { id: '7', type: 'compliance', requestorName: 'Tom Rodriguez', requestorAvatar: 'TR', description: 'Late filing exception — client documentation delayed', timestamp: '2 days ago', status: 'approved' },
  { id: '8', type: 'expense', requestorName: 'Rachel Green', requestorAvatar: 'RG', description: 'Marketing materials printing for community event', timestamp: '3 days ago', status: 'approved', amount: 450 },
];

const TYPE_CONFIG: Record<ApprovalType, { label: string; bg: string; text: string; icon: typeof DollarSign }> = {
  discount: { label: 'Discount', bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309', icon: DollarSign },
  compliance: { label: 'Compliance', bg: 'rgba(239, 68, 68, 0.10)', text: '#b91c1c', icon: Shield },
  time_off: { label: 'Time Off', bg: 'rgba(59, 130, 246, 0.10)', text: '#1d4ed8', icon: Calendar },
  expense: { label: 'Expense', bg: 'rgba(147, 51, 234, 0.10)', text: '#7e22ce', icon: Briefcase },
  deal_override: { label: 'Deal Override', bg: 'rgba(16, 185, 129, 0.10)', text: '#047857', icon: FileText },
};

const STATUS_INDICATOR: Record<ApprovalStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309', icon: Clock },
  approved: { label: 'Approved', bg: 'rgba(16, 185, 129, 0.10)', text: '#047857', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'rgba(239, 68, 68, 0.10)', text: '#b91c1c', icon: XCircle },
};

const TAB_OPTIONS: { value: ApprovalTabFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

function formatAmount(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

/* ══════════════════════════════════════════════════════════════
   ALERTS TAB — Demo Data
   ══════════════════════════════════════════════════════════════ */

const COMPLIANCE_ALERTS = [
  { id: '1', agent: 'Carlos Martinez', avatar: 'CM', title: 'Missed Follow-Up Deadline', description: '3 client follow-ups overdue by >48 hours', priority: 'high' as const, timestamp: '2h ago' },
  { id: '2', agent: 'Rachel Green', avatar: 'RG', title: 'CE Credits Expiring', description: 'State continuing education expires in 14 days', priority: 'medium' as const, timestamp: '4h ago' },
  { id: '3', agent: 'James Wilson', avatar: 'JW', title: 'Compliance Override Requested', description: 'Requested exception on suitability documentation', priority: 'high' as const, timestamp: '6h ago' },
  { id: '4', agent: 'Anna Kim', avatar: 'AK', title: 'AML Training Overdue', description: 'Annual anti-money laundering certification past due', priority: 'urgent' as const, timestamp: '1d ago' },
];

const ALERT_PRIORITY_COLORS = {
  urgent: 'bg-red-600',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
} as const;

/* ══════════════════════════════════════════════════════════════
   COMPUTED STATS
   ══════════════════════════════════════════════════════════════ */

const overdueCerts = DEMO_COMPLIANCE_DEADLINES.filter((d) => d.expiresIn < 0).length;
const expiringSoon = DEMO_COMPLIANCE_DEADLINES.filter((d) => d.expiresIn > 0 && d.expiresIn <= 30).length;
const pendingApprovals = DEMO_APPROVALS.filter((a) => a.status === 'pending').length;
const complianceRate = Math.round(
  (DEMO_TEAM_MEMBERS.filter((m) => m.certStatus === 'current').length / DEMO_TEAM_MEMBERS.length) * 100,
);

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

export function ManagerComplianceHub() {
  /* ── Approvals state ──────────────────────────────────────── */
  const [approvalFilter, setApprovalFilter] = useState<ApprovalTabFilter>('pending');
  const [approvalItems, setApprovalItems] = useState<Approval[]>(DEMO_APPROVALS);

  const filteredApprovals =
    approvalFilter === 'all'
      ? approvalItems
      : approvalItems.filter((a) => a.status === approvalFilter);

  const handleApprove = (id: string) => {
    const item = approvalItems.find((a) => a.id === id);
    setApprovalItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)),
    );
    if (item) toast.success(`Approved: ${item.requestorName}'s ${TYPE_CONFIG[item.type].label.toLowerCase()} request`);
  };

  const handleReject = (id: string) => {
    const item = approvalItems.find((a) => a.id === id);
    setApprovalItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)),
    );
    if (item) toast.success(`Rejected: ${item.requestorName}'s ${TYPE_CONFIG[item.type].label.toLowerCase()} request`);
  };

  /* ── Alerts state ─────────────────────────────────────────── */
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = COMPLIANCE_ALERTS.filter((a) => !dismissedAlerts.has(a.id));

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(id));
  };

  /* ── Sorted team for certification overview ───────────────── */
  const sortedTeam = [...DEMO_TEAM_MEMBERS].sort((a, b) => b.certLevel - a.certLevel);

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
          icon={Shield}
          title="Compliance"
          subtitle="Certifications, approvals, and tracking"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={AlertTriangle}
              value={overdueCerts}
              label="Overdue Certs"
              delta={-1}
              periodLabel="vs last month"
            />
            <ManagerStatCard
              icon={Clock}
              value={expiringSoon}
              label="Expiring Soon"
              delta={0}
              periodLabel="This month"
            />
            <ManagerStatCard
              icon={CheckSquare}
              value={pendingApprovals}
              label="Pending Approvals"
              delta={-2}
              periodLabel="vs last week"
            />
            <ManagerStatCard
              icon={ShieldCheck}
              value={`${complianceRate}%`}
              label="Compliance Rate"
              sparklineData={[...SPARKLINE_COMPLIANCE]}
              delta={5}
              deltaFormat="percent"
              periodLabel="vs last month"
              northStar
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tabbed Content ───────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="certifications">
            <TabsList
              className="w-full justify-start bg-white/60 backdrop-blur-xl border border-black/[0.06]"
              style={{
                borderRadius: RADIUS.card,
                padding: 4,
                height: 'auto',
                gap: 4,
              }}
            >
              <TabsTrigger
                value="certifications"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-gray-600 font-semibold"
                style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
              >
                <ShieldCheck style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Certifications
              </TabsTrigger>
              <TabsTrigger
                value="approvals"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-gray-600 font-semibold"
                style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
              >
                <CheckSquare style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Approvals
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-gray-600 font-semibold"
                style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
              >
                <AlertTriangle style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Alerts
              </TabsTrigger>
              <TabsTrigger
                value="learning"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-gray-600 font-semibold"
                style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta, padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px` }}
              >
                <BookOpen style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                Learning
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════════
               TAB 1: CERTIFICATIONS
               ════════════════════════════════════════════════ */}
            <TabsContent value="certifications" style={{ marginTop: GRID.spacing.md }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

                {/* ── Compliance Tracker ────────────────────── */}
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
                        <ShieldCheck className="text-amber-200" size={LAYOUT.icon.md} />
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
                              style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                            >
                              {item.avatar}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                {item.agent}
                              </p>
                              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                                {item.certification}
                              </p>
                            </div>

                            {/* Deadline */}
                            <div className="flex-shrink-0 text-right">
                              <p className={`font-medium ${urgency.text}`} style={{ fontSize: TYPE.caption }}>
                                {item.expiresIn < 0
                                  ? `${Math.abs(item.expiresIn)}d overdue`
                                  : `${item.expiresIn}d remaining`}
                              </p>
                              <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                {item.expiresDate}
                              </p>
                            </div>

                            {/* Urgency badge */}
                            <span
                              className={`inline-flex items-center font-medium ${urgency.bg} ${urgency.text}`}
                              style={{
                                borderRadius: RADIUS.pill,
                                padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                fontSize: TYPE.micro,
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

                {/* ── Team Certification Overview ──────────── */}
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
                        <Award className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Team Certification Overview</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: GRID.spacing.xs }}>
                      {sortedTeam.map((member) => {
                        const certColor = CERT_STATUS_COLORS[member.certStatus];
                        return (
                          <div
                            key={member.id}
                            className="flex items-center border border-gray-100"
                            style={{
                              gap: 12,
                              padding: 12,
                              borderRadius: RADIUS.button,
                              backgroundColor: COLORS.gray[50],
                            }}
                          >
                            <div
                              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                              style={{
                                width: LAYOUT.icon.xxl,
                                height: LAYOUT.icon.xxl,
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.caption,
                              }}
                            >
                              {member.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                                {member.name}
                              </p>
                              <div className="flex items-center flex-wrap" style={{ gap: 4, marginTop: 2 }}>
                                <span
                                  className={`inline-flex items-center font-medium ${certColor.bg} ${certColor.text}`}
                                  style={{
                                    borderRadius: RADIUS.pill,
                                    padding: '2px 8px',
                                    fontSize: TYPE.micro,
                                  }}
                                >
                                  L{member.certLevel} {CERT_LEVEL_LABELS[member.certLevel]}
                                </span>
                                <span
                                  className={`inline-flex items-center font-medium ${certColor.bg} ${certColor.text}`}
                                  style={{
                                    borderRadius: RADIUS.pill,
                                    padding: '2px 8px',
                                    fontSize: TYPE.micro,
                                  }}
                                >
                                  {member.certStatus.charAt(0).toUpperCase() + member.certStatus.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* ── Activity Log Feed ────────────────────── */}
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
                        <Clock className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <span className="text-gray-900">Activity Log</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                      {DEMO_ACTIVITY_LOG.map((entry) => {
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
                              style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}
                            >
                              <Icon className={auditStyle.color} size={LAYOUT.icon.xs} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900" style={{ fontSize: TYPE.meta }}>
                                <span className="font-semibold">{entry.agent}</span>{' '}
                                {entry.action.replace(entry.agent, '').trim()}
                              </p>
                              <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>{entry.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════
               TAB 2: APPROVALS
               ════════════════════════════════════════════════ */}
            <TabsContent value="approvals" style={{ marginTop: GRID.spacing.md }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>

                {/* ── Filter Tabs ──────────────────────────── */}
                <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2 }}>
                  {TAB_OPTIONS.map((tab) => {
                    const isActive = approvalFilter === tab.value;
                    const count =
                      tab.value === 'all'
                        ? approvalItems.length
                        : approvalItems.filter((a) => a.status === tab.value).length;

                    return (
                      <motion.button
                        key={tab.value}
                        onClick={() => setApprovalFilter(tab.value)}
                        className="font-medium border-0"
                        style={{
                          ...(isActive
                            ? {
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                                color: 'white',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                              }
                            : {
                                ...glassCard,
                                color: COLORS.gray[600],
                              }),
                          borderRadius: RADIUS.button,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          fontSize: TYPE.meta,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: GRID.spacing.xs / 2,
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {tab.label}
                        <span
                          style={{
                            fontSize: TYPE.micro,
                            fontWeight: 600,
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.06)',
                            borderRadius: RADIUS.pill,
                            padding: '2px 8px',
                            minWidth: 22,
                            textAlign: 'center',
                          }}
                        >
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── Approval Queue List ──────────────────── */}
                <div
                  style={{
                    ...glassCard,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                    overflow: 'hidden',
                  }}
                >
                  {/* Section Header */}
                  <div
                    style={{
                      padding: GRID.spacing.md,
                      paddingBottom: GRID.spacing.sm,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
                      <div
                        className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <CheckSquare className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                          Approval Queue
                        </p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {filteredApprovals.length} {approvalFilter === 'all' ? 'total' : approvalFilter} item{filteredApprovals.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: GRID.spacing.sm }}>
                    <AnimatePresence mode="popLayout">
                      {filteredApprovals.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-gray-400"
                          style={{
                            padding: GRID.spacing.xxxxl,
                            fontSize: TYPE.body,
                          }}
                        >
                          No {approvalFilter === 'all' ? '' : approvalFilter + ' '}items to display.
                        </motion.div>
                      )}

                      {filteredApprovals.map((item, index) => {
                        const typeConfig = TYPE_CONFIG[item.type];
                        const TypeIcon = typeConfig.icon;
                        const statusConfig = STATUS_INDICATOR[item.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12, scale: 0.95 }}
                            transition={{
                              duration: MOTION.duration.normal,
                              ease: MOTION.easing,
                              delay: index * 0.04,
                            }}
                            style={{
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              marginBottom: GRID.spacing.xs / 2,
                            }}
                            whileHover={{
                              backgroundColor: COLORS.gray[50],
                              transition: { duration: MOTION.duration.hover },
                            }}
                          >
                            <div className="flex items-start" style={{ gap: GRID.spacing.sm - 4 }}>
                              {/* Requestor Avatar */}
                              <div
                                className="flex items-center justify-center flex-shrink-0"
                                style={{
                                  width: LAYOUT.icon.xxl + 4,
                                  height: LAYOUT.icon.xxl + 4,
                                  borderRadius: RADIUS.button,
                                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                                }}
                              >
                                <span className="font-bold text-white" style={{ fontSize: TYPE.meta }}>
                                  {item.requestorAvatar}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Top row */}
                                <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 4 }}>
                                  <span
                                    className="inline-flex items-center font-semibold"
                                    style={{
                                      fontSize: TYPE.micro,
                                      backgroundColor: typeConfig.bg,
                                      color: typeConfig.text,
                                      borderRadius: RADIUS.pill,
                                      padding: '3px 10px',
                                      gap: 4,
                                    }}
                                  >
                                    <TypeIcon style={{ width: 12, height: 12 }} />
                                    {typeConfig.label}
                                  </span>
                                  <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                    {item.requestorName}
                                  </span>
                                  <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                    {item.timestamp}
                                  </span>
                                </div>

                                {/* Description */}
                                <p
                                  className="text-gray-600"
                                  style={{
                                    fontSize: TYPE.meta,
                                    lineHeight: 1.5,
                                    marginBottom: item.status === 'pending' || item.amount ? 8 : 0,
                                  }}
                                >
                                  {item.description}
                                </p>

                                {/* Bottom row */}
                                <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.sm - 4 }}>
                                  {item.amount != null && (
                                    <span
                                      className="inline-flex items-center font-bold"
                                      style={{
                                        fontSize: TYPE.meta,
                                        color: COLORS.gray[800],
                                        gap: 4,
                                      }}
                                    >
                                      <DollarSign style={{ width: 14, height: 14 }} className="text-gray-400" />
                                      {formatAmount(item.amount)}
                                    </span>
                                  )}

                                  {item.status !== 'pending' && (
                                    <span
                                      className="inline-flex items-center font-semibold"
                                      style={{
                                        fontSize: TYPE.micro,
                                        backgroundColor: statusConfig.bg,
                                        color: statusConfig.text,
                                        borderRadius: RADIUS.pill,
                                        padding: '3px 10px',
                                        gap: 4,
                                      }}
                                    >
                                      <StatusIcon style={{ width: 12, height: 12 }} />
                                      {statusConfig.label}
                                    </span>
                                  )}

                                  {item.status === 'pending' && (
                                    <div className="flex items-center ml-auto" style={{ gap: GRID.spacing.xs }}>
                                      <motion.button
                                        onClick={() => handleReject(item.id)}
                                        className="font-semibold"
                                        style={{
                                          fontSize: TYPE.meta,
                                          color: '#dc2626',
                                          backgroundColor: 'transparent',
                                          border: '1.5px solid rgba(220, 38, 38, 0.3)',
                                          borderRadius: RADIUS.button,
                                          padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 4,
                                        }}
                                        whileHover={{
                                          scale: 1.03,
                                          borderColor: 'rgba(220, 38, 38, 0.6)',
                                          backgroundColor: 'rgba(220, 38, 38, 0.04)',
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                      >
                                        <XCircle style={{ width: 14, height: 14 }} />
                                        Reject
                                      </motion.button>

                                      <motion.button
                                        onClick={() => handleApprove(item.id)}
                                        className="font-semibold text-white"
                                        style={{
                                          fontSize: TYPE.meta,
                                          backgroundColor: '#10b981',
                                          border: 'none',
                                          borderRadius: RADIUS.button,
                                          padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                                        }}
                                        whileHover={{
                                          scale: 1.03,
                                          backgroundColor: '#059669',
                                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                      >
                                        <CheckCircle style={{ width: 14, height: 14 }} />
                                        Approve
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════
               TAB 3: ALERTS
               ════════════════════════════════════════════════ */}
            <TabsContent value="alerts" style={{ marginTop: GRID.spacing.md }}>
              {visibleAlerts.length === 0 ? (
                <ManagerEmptyState
                  icon={ShieldCheck}
                  title="All Clear"
                  description="No compliance alerts require attention"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <AnimatePresence mode="popLayout">
                    {visibleAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, scale: 0.95 }}
                        transition={{
                          duration: MOTION.duration.normal,
                          ease: MOTION.easing,
                          delay: index * 0.04,
                        }}
                      >
                        <Card
                          className="overflow-hidden"
                          style={{
                            ...glassCard,
                            borderRadius: RADIUS.card,
                            boxShadow: SHADOW.card,
                          }}
                        >
                          <CardContent style={{ padding: GRID.spacing.md }}>
                            <div className="flex items-start" style={{ gap: 12 }}>
                              {/* Priority dot */}
                              <div
                                className={ALERT_PRIORITY_COLORS[alert.priority]}
                                style={{
                                  width: GRID.spacing.xs,
                                  height: GRID.spacing.xs,
                                  borderRadius: RADIUS.pill,
                                  flexShrink: 0,
                                  marginTop: 6,
                                }}
                              />

                              {/* Avatar */}
                              <div
                                className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0"
                                style={{
                                  width: LAYOUT.icon.xxl,
                                  height: LAYOUT.icon.xxl,
                                  borderRadius: RADIUS.button,
                                  fontSize: TYPE.caption,
                                }}
                              >
                                {alert.avatar}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                    {alert.title}
                                  </p>
                                  <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                                    {alert.timestamp}
                                  </span>
                                </div>
                                <p className="text-gray-500" style={{ fontSize: TYPE.caption, marginBottom: 2 }}>
                                  {alert.agent}
                                </p>
                                <p className="text-gray-600" style={{ fontSize: TYPE.meta, lineHeight: 1.5 }}>
                                  {alert.description}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center flex-shrink-0" style={{ gap: GRID.spacing.xs }}>
                                <motion.button
                                  onClick={() => dismissAlert(alert.id)}
                                  className="font-semibold"
                                  style={{
                                    fontSize: TYPE.meta,
                                    color: COLORS.gray[600],
                                    backgroundColor: 'transparent',
                                    border: `1.5px solid ${COLORS.gray[200]}`,
                                    borderRadius: RADIUS.button,
                                    padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                                    cursor: 'pointer',
                                  }}
                                  whileHover={{ scale: 1.03, borderColor: COLORS.gray[400] }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  Dismiss
                                </motion.button>

                                <motion.button
                                  onClick={() => toast.success(`Reviewing alert: "${alert.title}" for ${alert.agent}`)}
                                  className="font-semibold text-white"
                                  style={{
                                    fontSize: TYPE.meta,
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                                    border: 'none',
                                    borderRadius: RADIUS.button,
                                    padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                                  }}
                                  whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  Review
                                </motion.button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* ════════════════════════════════════════════════
               TAB 4: LEARNING
               ════════════════════════════════════════════════ */}
            <TabsContent value="learning" style={{ marginTop: GRID.spacing.md }}>
              <TrainingTabContent />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerComplianceHub;
