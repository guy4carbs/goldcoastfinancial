/**
 * Manager Approvals — Centralized Approval Queue
 * Review and approve pending team requests: discounts, compliance,
 * time off, expenses, and deal overrides.
 *
 * Heritage Design System — Emerald theme with amber accents
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard } from './managerConstants';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Shield,
  Calendar,
  Briefcase,
  FileText,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────── */

type ApprovalType = 'discount' | 'compliance' | 'time_off' | 'expense' | 'deal_override';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type TabFilter = 'pending' | 'approved' | 'rejected' | 'all';

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

/* ── Demo Data ───────────────────────────────────────────── */

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

/* ── Type Config ─────────────────────────────────────────── */

const TYPE_CONFIG: Record<ApprovalType, { label: string; bg: string; text: string; icon: typeof DollarSign }> = {
  discount: { label: 'Discount', bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309', icon: DollarSign },
  compliance: { label: 'Compliance', bg: 'rgba(239, 68, 68, 0.10)', text: '#b91c1c', icon: Shield },
  time_off: { label: 'Time Off', bg: 'rgba(59, 130, 246, 0.10)', text: '#1d4ed8', icon: Calendar },
  expense: { label: 'Expense', bg: 'rgba(147, 51, 234, 0.10)', text: '#7e22ce', icon: Briefcase },
  deal_override: { label: 'Deal Override', bg: 'rgba(16, 185, 129, 0.10)', text: '#047857', icon: FileText },
};

/* ── Tab Config ──────────────────────────────────────────── */

const TAB_OPTIONS: { value: TabFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

/* ── Status Indicator Config ─────────────────────────────── */

const STATUS_INDICATOR: Record<ApprovalStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309', icon: Clock },
  approved: { label: 'Approved', bg: 'rgba(16, 185, 129, 0.10)', text: '#047857', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'rgba(239, 68, 68, 0.10)', text: '#b91c1c', icon: XCircle },
};

/* ── Helpers ──────────────────────────────────────────────── */

function formatAmount(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

/* ── Component ───────────────────────────────────────────── */

export function ManagerApprovals() {
  const [activeTab, setActiveTab] = useState<TabFilter>('pending');
  const [approvals, setApprovals] = useState<Approval[]>(DEMO_APPROVALS);

  /* ── Derived data ──────────────────────────────────────── */
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedTodayCount = approvals.filter((a) => a.status === 'approved' && a.timestamp.includes('hr')).length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const filtered = activeTab === 'all'
    ? approvals
    : approvals.filter((a) => a.status === activeTab);

  /* ── Action handlers ───────────────────────────────────── */
  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)),
    );
  };

  const handleReject = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)),
    );
  };

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
          icon={CheckSquare}
          title="Approvals"
          subtitle="Review and approve pending team requests"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Clock}
              value={pendingCount}
              label="Pending"
            />
            <ManagerStatCard
              icon={CheckCircle}
              value={approvedTodayCount}
              label="Approved Today"
              trend={{ value: 2, positive: true }}
            />
            <ManagerStatCard
              icon={XCircle}
              value={rejectedCount}
              label="Rejected"
            />
            <ManagerStatCard
              icon={Clock}
              value="4.2 hrs"
              label="Avg Response"
              trend={{ value: '12%', positive: true, label: 'faster' }}
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Bar ──────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center"
          style={{ gap: GRID.spacing.xs / 2 }}
        >
          {TAB_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count =
              tab.value === 'all'
                ? approvals.length
                : approvals.filter((a) => a.status === tab.value).length;

            return (
              <motion.button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
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
        </motion.div>

        {/* ── Approval Items List ─────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
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
                borderBottom: `1px solid ${GLASS.border}`,
              }}
            >
              <div className="flex items-center" style={{ gap: GRID.spacing.sm - 4 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <CheckSquare style={{ width: 20, height: 20 }} className="text-amber-200" />
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-900"
                    style={{ fontSize: TYPE.title }}
                  >
                    Approval Queue
                  </p>
                  <p
                    className="text-gray-500"
                    style={{ fontSize: TYPE.caption }}
                  >
                    {filtered.length} {activeTab === 'all' ? 'total' : activeTab} item{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: GRID.spacing.sm }}>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 && (
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
                    No {activeTab === 'all' ? '' : activeTab + ' '}items to display.
                  </motion.div>
                )}

                {filtered.map((item, index) => {
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
                          <span
                            className="font-bold text-white"
                            style={{ fontSize: TYPE.meta }}
                          >
                            {item.requestorAvatar}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row: type badge + name + timestamp */}
                          <div
                            className="flex items-center flex-wrap"
                            style={{ gap: GRID.spacing.xs, marginBottom: 4 }}
                          >
                            {/* Type Badge */}
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

                            {/* Requestor Name */}
                            <span
                              className="font-semibold text-gray-900"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {item.requestorName}
                            </span>

                            {/* Timestamp */}
                            <span
                              className="text-gray-400"
                              style={{ fontSize: TYPE.caption }}
                            >
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

                          {/* Bottom row: amount + status or actions */}
                          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.sm - 4 }}>
                            {/* Amount */}
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

                            {/* Status indicator for non-pending */}
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

                            {/* Action buttons for pending */}
                            {item.status === 'pending' && (
                              <div
                                className="flex items-center ml-auto"
                                style={{ gap: GRID.spacing.xs }}
                              >
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
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerApprovals;
