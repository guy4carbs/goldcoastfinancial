/**
 * Manager Alerts — Real-Time Team Activity Alerts
 * Heritage Design System — Emerald theme with amber accents
 *
 * Shows live team activity alerts with priority filtering, category badges,
 * and one-click remediation buttons. Includes deal risk and predictive AI
 * categories with context-specific action buttons per category.
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
  Bell,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  Users,
  X,
  ChevronRight,
  Target,
  Sparkles,
  GraduationCap,
  Calendar,
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────
type AlertPriority = 'urgent' | 'high' | 'medium' | 'low';
type AlertCategory =
  | 'compliance'
  | 'pipeline'
  | 'escalation'
  | 'team'
  | 'deal_risk'
  | 'predictive';
type FilterKey =
  | 'all'
  | 'urgent'
  | 'compliance'
  | 'pipeline'
  | 'team'
  | 'deal_risk'
  | 'predictive';

interface Alert {
  id: string;
  title: string;
  description: string;
  agentName: string;
  agentAvatar: string;
  priority: AlertPriority;
  category: AlertCategory;
  timestamp: string;
  read: boolean;
}

// ─── DEMO DATA ──────────────────────────────────────────────
const DEMO_ALERTS: Alert[] = [
  { id: '1', title: 'Missed Follow-Up', description: 'Carlos Martinez has 3 overdue follow-ups from last week', agentName: 'Carlos Martinez', agentAvatar: 'CM', priority: 'urgent', category: 'compliance', timestamp: '5 min ago', read: false },
  { id: '2', title: 'Deal Stage Change', description: 'Sarah Johnson moved Anderson Group to Proposal stage ($45K)', agentName: 'Sarah Johnson', agentAvatar: 'SJ', priority: 'medium', category: 'pipeline', timestamp: '12 min ago', read: false },
  { id: '3', title: 'Certification Expiring', description: 'Emily Davis Life Insurance cert expires in 7 days', agentName: 'Emily Davis', agentAvatar: 'ED', priority: 'high', category: 'compliance', timestamp: '1 hr ago', read: false },
  { id: '4', title: 'Escalation Received', description: 'Client complaint from Ryan Taylor — billing dispute', agentName: 'Ryan Taylor', agentAvatar: 'RT', priority: 'urgent', category: 'escalation', timestamp: '2 hrs ago', read: true },
  { id: '5', title: 'New Agent Active', description: 'Lisa Park completed onboarding and is now active', agentName: 'Lisa Park', agentAvatar: 'LP', priority: 'low', category: 'team', timestamp: '3 hrs ago', read: true },
  { id: '6', title: 'Quota Warning', description: 'James Wilson is at 35% of monthly quota with 8 days remaining', agentName: 'James Wilson', agentAvatar: 'JW', priority: 'high', category: 'pipeline', timestamp: '4 hrs ago', read: false },
  { id: '7', title: 'Compliance Override Needed', description: 'Anna Kim submitted a discount request exceeding 15% threshold', agentName: 'Anna Kim', agentAvatar: 'AK', priority: 'high', category: 'compliance', timestamp: '5 hrs ago', read: true },
  { id: '8', title: 'Team Achievement', description: 'Team closed 5 deals this week — exceeding weekly target by 25%', agentName: 'Team', agentAvatar: 'TM', priority: 'low', category: 'team', timestamp: 'Yesterday', read: true },
  { id: '9', title: 'Stale Deal Alert', description: 'Chen Annuity Package has been idle for 21 days in Contacted stage ($89K)', agentName: 'David Brown', agentAvatar: 'DB', priority: 'high', category: 'deal_risk', timestamp: '30 min ago', read: false },
  { id: '10', title: 'At-Risk Deal', description: 'Williams Family IUL — no client contact in 14 days, proposal expires soon ($62K)', agentName: 'Rachel Green', agentAvatar: 'RG', priority: 'urgent', category: 'deal_risk', timestamp: '1 hr ago', read: false },
  { id: '11', title: 'Predicted Churn Risk', description: 'AI model: Carlos Martinez has 78% probability of missing quota this month based on activity trends', agentName: 'Carlos Martinez', agentAvatar: 'CM', priority: 'high', category: 'predictive', timestamp: '2 hrs ago', read: false },
  { id: '12', title: 'Coaching Opportunity Detected', description: 'AI detected: Anna Kim has improved call-to-close ratio by 40% — consider advancement discussion', agentName: 'Anna Kim', agentAvatar: 'AK', priority: 'medium', category: 'predictive', timestamp: '3 hrs ago', read: false },
];

// ─── FILTER OPTIONS ─────────────────────────────────────────
const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'team', label: 'Team' },
  { value: 'deal_risk', label: 'Deal Risk' },
  { value: 'predictive', label: 'Predictive' },
];

// ─── PRIORITY DOT COLORS ────────────────────────────────────
const PRIORITY_DOT_COLORS: Record<AlertPriority, string> = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#10b981',
  low: '#9ca3af',
};

// ─── CATEGORY BADGE STYLES ──────────────────────────────────
const CATEGORY_BADGE_STYLES: Record<AlertCategory, { bg: string; text: string }> = {
  compliance: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626' },
  pipeline: { bg: 'rgba(16, 185, 129, 0.10)', text: '#059669' },
  escalation: { bg: 'rgba(245, 158, 11, 0.10)', text: '#d97706' },
  team: { bg: 'rgba(59, 130, 246, 0.10)', text: '#2563eb' },
  deal_risk: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626' },
  predictive: { bg: 'rgba(139, 92, 246, 0.10)', text: '#7c3aed' },
};

// ─── CATEGORY LABELS ────────────────────────────────────────
const CATEGORY_LABELS: Record<AlertCategory, string> = {
  compliance: 'Compliance',
  pipeline: 'Pipeline',
  escalation: 'Escalation',
  team: 'Team',
  deal_risk: 'Deal Risk',
  predictive: 'Predictive',
};

// ─── CATEGORY ACTION CONFIG ─────────────────────────────────
const CATEGORY_ACTIONS: Record<
  AlertCategory,
  {
    label: string;
    icon: typeof Shield;
    gradient: string;
    shadow: string;
  }
> = {
  compliance: {
    label: 'Review Compliance',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
  },
  pipeline: {
    label: 'View Pipeline',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
  },
  escalation: {
    label: 'Handle Escalation',
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
  },
  team: {
    label: 'View Team',
    icon: Users,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
  },
  deal_risk: {
    label: 'Coach Agent',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)',
    shadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
  },
  predictive: {
    label: 'Schedule 1:1',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    shadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
  },
};

// ─── COMPONENT ──────────────────────────────────────────────
export function ManagerAlerts() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  // Computed counts
  const unreadCount = alerts.filter((a) => !a.read).length;
  const urgentCount = alerts.filter((a) => a.priority === 'urgent').length;
  const dealRiskCount = alerts.filter((a) => a.category === 'deal_risk').length;
  const predictiveCount = alerts.filter((a) => a.category === 'predictive').length;

  // Filtered alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return alert.priority === 'urgent';
    return alert.category === activeFilter;
  });

  // Dismiss handler
  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Mark as read handler
  const handleReview = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
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
        {/* ── Hero ─────────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Bell}
          title="Activity Alerts"
          subtitle="Real-time team events requiring your attention"
        />

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Bell}
              value={unreadCount}
              label="Unread Alerts"
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={urgentCount}
              label="Urgent"
            />
            <ManagerStatCard
              icon={Target}
              value={dealRiskCount}
              label="Deal Risks"
            />
            <ManagerStatCard
              icon={Sparkles}
              value={predictiveCount}
              label="AI Insights"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className="font-medium border-0"
                style={{
                  ...(isActive
                    ? {
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }
                    : {
                        ...glassCard,
                        color: COLORS.gray[600],
                      }),
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Alert List ───────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          style={{
            ...glassCard,
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.card,
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <div
            className="flex items-center"
            style={{
              padding: GRID.spacing.md,
              paddingBottom: GRID.spacing.sm,
              gap: GRID.spacing.sm,
              borderBottom: `1px solid ${GLASS.border}`,
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.button,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}
            >
              <Bell
                className="text-amber-200 drop-shadow-sm"
                style={{ width: 20, height: 20 }}
                aria-hidden="true"
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                className="font-semibold text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                Alert Feed
              </p>
              <p
                className="text-gray-500"
                style={{ fontSize: TYPE.caption }}
              >
                {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} showing
              </p>
            </div>
          </div>

          {/* Alert rows */}
          <div
            style={{
              padding: GRID.spacing.sm,
              display: 'flex',
              flexDirection: 'column',
              gap: GRID.spacing.xs / 2,
              maxHeight: 640,
              overflowY: 'auto',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-gray-400"
                  style={{
                    padding: GRID.spacing.xl,
                    fontSize: TYPE.body,
                  }}
                >
                  No alerts match the selected filter.
                </motion.div>
              )}

              {filteredAlerts.map((alert) => {
                const dotColor = PRIORITY_DOT_COLORS[alert.priority];
                const badgeStyle = CATEGORY_BADGE_STYLES[alert.category];
                const categoryLabel = CATEGORY_LABELS[alert.category];
                const action = CATEGORY_ACTIONS[alert.category];
                const ActionIcon = action.icon;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: MOTION.duration.fast } }}
                    transition={{
                      duration: MOTION.duration.normal,
                      ease: MOTION.easing,
                    }}
                    className="flex items-start"
                    style={{
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      gap: GRID.spacing.sm,
                      backgroundColor: alert.read
                        ? 'transparent'
                        : 'rgba(16, 185, 129, 0.04)',
                      transition: `background-color ${MOTION.duration.hover}s`,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    {/* Priority dot */}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: RADIUS.pill,
                        backgroundColor: dotColor,
                        flexShrink: 0,
                        marginTop: 6,
                        boxShadow: alert.priority === 'urgent'
                          ? `0 0 8px ${dotColor}80`
                          : undefined,
                      }}
                    />

                    {/* Agent avatar */}
                    <div
                      className="flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{
                        width: GRID.spacing.xl,
                        height: GRID.spacing.xl,
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        fontSize: TYPE.caption,
                        boxShadow: SHADOW.level2,
                      }}
                    >
                      {alert.agentAvatar}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="flex items-center flex-wrap"
                        style={{ gap: GRID.spacing.xs, marginBottom: 2 }}
                      >
                        <p
                          className="font-semibold text-gray-900"
                          style={{
                            fontSize: TYPE.body,
                            lineHeight: 1.3,
                            opacity: alert.read ? 0.7 : 1,
                          }}
                        >
                          {alert.title}
                        </p>

                        {/* Category badge */}
                        <span
                          className="font-medium"
                          style={{
                            fontSize: TYPE.micro,
                            padding: `2px ${GRID.spacing.xs}px`,
                            borderRadius: RADIUS.pill,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.text,
                            lineHeight: 1.5,
                          }}
                        >
                          {categoryLabel}
                        </span>

                        {/* Unread indicator */}
                        {!alert.read && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: RADIUS.pill,
                              backgroundColor: '#10b981',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <p
                        className="text-gray-500"
                        style={{
                          fontSize: TYPE.meta,
                          lineHeight: 1.5,
                          opacity: alert.read ? 0.65 : 0.85,
                        }}
                      >
                        {alert.description}
                      </p>

                      {/* Agent name on mobile */}
                      <p
                        className="text-gray-400 sm:hidden"
                        style={{
                          fontSize: TYPE.micro,
                          marginTop: 4,
                        }}
                      >
                        {alert.agentName}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div
                      className="hidden sm:flex items-center flex-shrink-0 text-gray-400"
                      style={{
                        gap: 4,
                        fontSize: TYPE.caption,
                        minWidth: 80,
                        justifyContent: 'flex-end',
                        marginTop: 2,
                      }}
                    >
                      <Clock
                        style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }}
                        aria-hidden="true"
                      />
                      <span>{alert.timestamp}</span>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center flex-shrink-0"
                      style={{ gap: GRID.spacing.xs / 2, marginTop: 2 }}
                    >
                      {/* Category-specific action button */}
                      <motion.button
                        onClick={() => handleReview(alert.id)}
                        className="flex items-center font-semibold text-white border-0"
                        style={{
                          background: action.gradient,
                          borderRadius: RADIUS.button,
                          padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.sm}px`,
                          fontSize: TYPE.caption,
                          gap: 4,
                          cursor: 'pointer',
                          boxShadow: action.shadow,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <ActionIcon
                          style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }}
                          aria-hidden="true"
                        />
                        {action.label}
                      </motion.button>

                      {/* Dismiss button */}
                      <motion.button
                        onClick={() => handleDismiss(alert.id)}
                        className="flex items-center font-medium border-0 text-gray-400 hover:text-gray-600"
                        style={{
                          background: 'transparent',
                          borderRadius: RADIUS.button,
                          padding: `${GRID.spacing.xs - 2}px ${GRID.spacing.xs}px`,
                          fontSize: TYPE.caption,
                          gap: 4,
                          cursor: 'pointer',
                        }}
                        whileHover={{ scale: 1.05, backgroundColor: COLORS.gray[100] }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <X
                          style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }}
                          aria-hidden="true"
                        />
                        <span className="hidden sm:inline">Dismiss</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerAlerts;
