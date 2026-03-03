/**
 * Manager Escalations
 * Full escalation management — review, filter, and resolve team escalations
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard, DEMO_ESCALATIONS, PRIORITY_COLORS } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

/* ── Filter options ────────────────────────────────────────── */
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved';

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

/* ── Status badge colors ───────────────────────────────────── */
const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-red-100', text: 'text-red-700' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
  resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

/* ── Status display labels ─────────────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export function ManagerEscalations() {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ── Filtered escalations ──────────────────────────────── */
  const filtered = DEMO_ESCALATIONS.filter((e) => {
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

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
          icon={AlertTriangle}
          title="Escalations"
          subtitle="Review and resolve team escalations"
        />

        {/* ── Stat Cards ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={AlertTriangle} value={4} label="Open" />
            <ManagerStatCard icon={ShieldAlert} value={2} label="High Priority" />
            <ManagerStatCard
              icon={CheckCircle2}
              value={3}
              label="Resolved This Week"
              trend={{ value: 1, positive: true }}
            />
            <ManagerStatCard icon={Clock} value="1.8 days" label="Avg Resolution" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Filter Bar ───────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.sm }}
        >
          {/* Priority filter group */}
          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
            <span className="text-gray-500 font-medium text-sm">Priority:</span>
            <div className="flex" style={{ gap: GRID.spacing.xs / 2 }}>
              {PRIORITY_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`font-medium border-0 ${
                    priorityFilter === opt.value
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                      : 'text-gray-600'
                  }`}
                  style={{
                    ...( priorityFilter !== opt.value ? glassCard : {}),
                    borderRadius: RADIUS.button,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    fontSize: 12,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status filter group */}
          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
            <span className="text-gray-500 font-medium text-sm">Status:</span>
            <div className="flex" style={{ gap: GRID.spacing.xs / 2 }}>
              {STATUS_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`font-medium border-0 ${
                    statusFilter === opt.value
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                      : 'text-gray-600'
                  }`}
                  style={{
                    ...(statusFilter !== opt.value ? glassCard : {}),
                    borderRadius: RADIUS.button,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    fontSize: 12,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Escalation List (full width) ─────────────────── */}
        <motion.div variants={fadeInUp}>
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
            {/* Section header */}
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Escalation Queue</span>
              </CardTitle>
            </CardHeader>

            {/* Escalation rows */}
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {filtered.length === 0 && (
                  <div
                    className="text-center text-gray-400 text-sm"
                    style={{ padding: GRID.spacing.lg }}
                  >
                    No escalations match the selected filters.
                  </div>
                )}
                {filtered.map((esc) => {
                  const priorityColor = PRIORITY_COLORS[esc.priority];
                  const statusColor = STATUS_BADGE_COLORS[esc.status] || STATUS_BADGE_COLORS.open;
                  const isExpanded = selectedId === esc.id;

                  return (
                    <div key={esc.id}>
                      <motion.div
                        className="flex items-center cursor-pointer"
                        onClick={() => setSelectedId(isExpanded ? null : esc.id)}
                        style={{
                          padding: 12,
                          borderRadius: RADIUS.button,
                          gap: 12,
                          backgroundColor: isExpanded ? COLORS.gray[50] : 'transparent',
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Priority dot */}
                        <div
                          className={priorityColor.dot}
                          style={{
                            width: GRID.spacing.xs,
                            height: GRID.spacing.xs,
                            borderRadius: RADIUS.pill,
                            flexShrink: 0,
                          }}
                        />

                        {/* Expand / collapse icon */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: MOTION.duration.fast }}
                          className="flex-shrink-0 text-gray-400"
                        >
                          <ChevronDown style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        </motion.div>

                        {/* Type + agent + lead */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {esc.type}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {esc.agent} &middot; Lead: {esc.lead}
                          </p>
                        </div>

                        {/* Date */}
                        <span
                          className="text-gray-400 flex-shrink-0 hidden sm:block text-xs"
                        >
                          {esc.date}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center font-medium ${statusColor.bg} ${statusColor.text}`}
                          style={{
                            borderRadius: RADIUS.pill,
                            border: 0,
                            padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                            fontSize: 12,
                          }}
                        >
                          {STATUS_LABELS[esc.status]}
                        </span>

                        {/* Review button */}
                        <motion.button
                          className="flex items-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 flex-shrink-0"
                          style={{
                            fontSize: 14,
                            gap: GRID.spacing.xs / 2,
                            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(isExpanded ? null : esc.id);
                          }}
                        >
                          Review
                          <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        </motion.button>
                      </motion.div>

                      {/* Expandable description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div
                              className="text-gray-600 bg-gray-50 text-sm"
                              style={{
                                padding: 12,
                                paddingLeft: GRID.spacing.lg + 12,
                                lineHeight: 1.6,
                                borderRadius: `0 0 ${RADIUS.button}px ${RADIUS.button}px`,
                                marginTop: -2,
                              }}
                            >
                              {esc.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerEscalations;
