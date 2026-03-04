/**
 * Manager Promotions & Roster — Agent Progression and Team Composition
 * Level distribution, promotion candidates, onboarding pipeline, recent changes
 * Heritage Design System — Emerald theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard, MANAGER_ICON_GRADIENT } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award,
  Users,
  UserPlus,
  Clock,
  Zap,
  ChevronRight,
  Check,
  X,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

// ─── DEMO DATA ───────────────────────────────────────────────

const LEVEL_DISTRIBUTION = [
  { level: 1, count: 2, label: 'Trainee' },
  { level: 2, count: 3, label: 'Junior Agent' },
  { level: 3, count: 3, label: 'Agent' },
  { level: 4, count: 2, label: 'Senior Agent' },
  { level: 5, count: 1, label: 'Lead Agent' },
  { level: 6, count: 1, label: 'Principal Agent' },
];

const PROMOTION_CANDIDATES = [
  {
    id: '1',
    name: 'David Brown',
    avatar: 'DB',
    currentLevel: 3,
    timeInLevel: '5.1 months',
    criteria: [
      { label: 'AP Target ($5K/wk)', met: true },
      { label: 'Advanced Cert', met: true },
      { label: '6+ months tenure', met: false },
    ],
  },
  {
    id: '2',
    name: 'Jessica Lee',
    avatar: 'JL',
    currentLevel: 3,
    timeInLevel: '6.8 months',
    criteria: [
      { label: 'AP Target ($5K/wk)', met: true },
      { label: 'Advanced Cert', met: true },
      { label: '6+ months tenure', met: true },
    ],
  },
  {
    id: '3',
    name: 'Tom Rodriguez',
    avatar: 'TR',
    currentLevel: 2,
    timeInLevel: '4.3 months',
    criteria: [
      { label: 'AP Target ($3K/wk)', met: true },
      { label: 'Intermediate Cert', met: true },
      { label: '4+ months tenure', met: true },
    ],
  },
];

const ONBOARDING_STAGES = [
  { stage: 'Invited', count: 1, agents: ['Marcus Webb'] },
  { stage: 'Registered', count: 1, agents: ['Nicole Adams'] },
  { stage: 'Training', count: 0, agents: [] },
  { stage: 'Active', count: 10, agents: [] },
];

const RECENT_CHANGES = [
  {
    id: '1',
    type: 'promotion' as const,
    description: 'Rachel Green promoted to Level 4 (Senior Agent)',
    timestamp: '1 week ago',
  },
  {
    id: '2',
    type: 'join' as const,
    description: 'Marcus Webb invited to join team',
    timestamp: '2 weeks ago',
  },
  {
    id: '3',
    type: 'promotion' as const,
    description: 'Mike Chen promoted to Level 5 (Lead Agent)',
    timestamp: '1 month ago',
  },
  {
    id: '4',
    type: 'departure' as const,
    description: 'Alex Turner transferred to Team B',
    timestamp: '6 weeks ago',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────

const MAX_LEVEL_COUNT = Math.max(...LEVEL_DISTRIBUTION.map((l) => l.count));

const CHANGE_TYPE_CONFIG: Record<
  string,
  { icon: typeof ArrowUp; color: string; bg: string }
> = {
  promotion: { icon: ArrowUp, color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
  join: { icon: ArrowRight, color: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)' },
  departure: { icon: ArrowDown, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.08)' },
};

const STAGE_DOT_COLORS: Record<string, string> = {
  Invited: '#f59e0b',
  Registered: '#3b82f6',
  Training: '#8b5cf6',
  Active: '#10b981',
};

// ─── COMPONENT ───────────────────────────────────────────────

export function ManagerPromotions() {
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());

  const handleRecommend = (id: string) => {
    setRecommendedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Award}
            title="Promotions & Roster"
            subtitle="Manage team composition and agent progression"
          />
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={Users} value="12" label="Total Agents" />
            <ManagerStatCard icon={Award} value="3" label="Promotion Eligible" />
            <ManagerStatCard icon={UserPlus} value="2" label="In Onboarding" />
            <ManagerStatCard icon={Clock} value="4.2 mo" label="Avg Time-in-Level" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Two-Column Layout ── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ═══ LEFT COLUMN (larger — spans 2) ═══ */}
          <div
            className="lg:col-span-2"
            style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
          >
            {/* ── Team by Level ── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center gap-3"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Zap className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Team by Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {LEVEL_DISTRIBUTION.map((item) => {
                    const barPercent = (item.count / MAX_LEVEL_COUNT) * 100;
                    return (
                      <div
                        key={item.level}
                        className="flex items-center"
                        style={{ gap: GRID.spacing.sm }}
                      >
                        {/* Level label */}
                        <div style={{ minWidth: 140, flexShrink: 0 }}>
                          <span
                            className="font-medium text-gray-700"
                            style={{ fontSize: TYPE.meta }}
                          >
                            L{item.level}
                          </span>
                          <span
                            className="text-gray-400 ml-2"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Bar */}
                        <div
                          className="flex-1"
                          style={{
                            height: 28,
                            backgroundColor: COLORS.gray[100],
                            borderRadius: RADIUS.button,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPercent}%` }}
                            transition={{
                              duration: MOTION.duration.slow,
                              ease: MOTION.easing,
                              delay: item.level * 0.06,
                            }}
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, #10b981 0%, #059669 50%, #0d9488 100%)`,
                              borderRadius: RADIUS.button,
                              minWidth: barPercent > 0 ? 32 : 0,
                            }}
                          />
                        </div>

                        {/* Count */}
                        <span
                          className="font-semibold text-gray-800 text-right"
                          style={{ fontSize: TYPE.meta, minWidth: 28 }}
                        >
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ── Promotion Candidates ── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center gap-3"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Award className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Promotion Candidates</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {PROMOTION_CANDIDATES.map((candidate) => {
                    const allCriteriaMet = candidate.criteria.every((c) => c.met);
                    const isRecommended = recommendedIds.has(candidate.id);

                    return (
                      <motion.div
                        key={candidate.id}
                        className="flex flex-col sm:flex-row sm:items-center"
                        style={{
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: isRecommended
                            ? 'rgba(5, 150, 105, 0.06)'
                            : COLORS.gray[50],
                          border: isRecommended
                            ? '1px solid rgba(5, 150, 105, 0.2)'
                            : '1px solid transparent',
                          gap: GRID.spacing.sm,
                          transition: `all ${MOTION.duration.normal}s ${MOTION.easingCSS}`,
                        }}
                        whileHover={{
                          backgroundColor: isRecommended
                            ? 'rgba(5, 150, 105, 0.08)'
                            : COLORS.gray[100],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Avatar + Info */}
                        <div
                          className="flex items-center flex-1 min-w-0"
                          style={{ gap: GRID.spacing.sm }}
                        >
                          {/* Avatar */}
                          <div
                            className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                              fontSize: TYPE.meta,
                            }}
                          >
                            {candidate.avatar}
                          </div>

                          {/* Name + details */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-gray-900 truncate"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {candidate.name}
                            </p>
                            <div
                              className="flex items-center flex-wrap"
                              style={{ gap: GRID.spacing.xs, marginTop: 2 }}
                            >
                              <span
                                className="text-gray-500"
                                style={{ fontSize: TYPE.caption }}
                              >
                                Level {candidate.currentLevel}
                              </span>
                              <span
                                className="text-gray-300"
                                style={{ fontSize: TYPE.caption }}
                              >
                                |
                              </span>
                              <span
                                className="text-gray-500"
                                style={{ fontSize: TYPE.caption }}
                              >
                                {candidate.timeInLevel} in level
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Criteria Checklist */}
                        <div
                          className="flex items-center flex-wrap"
                          style={{ gap: GRID.spacing.xs }}
                        >
                          {candidate.criteria.map((criterion, idx) => (
                            <div
                              key={idx}
                              className="flex items-center"
                              style={{
                                gap: 4,
                                padding: `3px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.pill,
                                backgroundColor: criterion.met
                                  ? 'rgba(5, 150, 105, 0.08)'
                                  : 'rgba(239, 68, 68, 0.06)',
                                border: criterion.met
                                  ? '1px solid rgba(5, 150, 105, 0.15)'
                                  : '1px solid rgba(239, 68, 68, 0.12)',
                              }}
                            >
                              {criterion.met ? (
                                <Check
                                  style={{ width: 12, height: 12, color: '#059669' }}
                                  aria-hidden="true"
                                />
                              ) : (
                                <X
                                  style={{ width: 12, height: 12, color: '#ef4444' }}
                                  aria-hidden="true"
                                />
                              )}
                              <span
                                className={criterion.met ? 'text-emerald-700' : 'text-red-600'}
                                style={{ fontSize: TYPE.micro, fontWeight: 500 }}
                              >
                                {criterion.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Recommend Button */}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: MOTION.duration.hover }}
                          onClick={() => handleRecommend(candidate.id)}
                          disabled={!allCriteriaMet && !isRecommended}
                          className="flex items-center justify-center font-semibold flex-shrink-0 transition-colors"
                          style={{
                            gap: 6,
                            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                            borderRadius: RADIUS.button,
                            fontSize: TYPE.caption,
                            cursor: allCriteriaMet || isRecommended ? 'pointer' : 'not-allowed',
                            background: isRecommended
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : allCriteriaMet
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)'
                                : COLORS.gray[200],
                            color: allCriteriaMet || isRecommended ? 'white' : COLORS.gray[500],
                            boxShadow:
                              allCriteriaMet || isRecommended
                                ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                                : 'none',
                            border: 'none',
                            minHeight: 36,
                          }}
                          aria-label={
                            isRecommended
                              ? `Remove recommendation for ${candidate.name}`
                              : `Recommend ${candidate.name} for promotion`
                          }
                        >
                          {isRecommended ? (
                            <>
                              <Check style={{ width: 14, height: 14 }} aria-hidden="true" />
                              Recommended
                            </>
                          ) : (
                            <>
                              <ChevronRight style={{ width: 14, height: 14 }} aria-hidden="true" />
                              Recommend
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══ RIGHT COLUMN (smaller) ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ── Onboarding Pipeline ── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center gap-3"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <UserPlus className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Onboarding Pipeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {ONBOARDING_STAGES.map((item, idx) => {
                    const dotColor = STAGE_DOT_COLORS[item.stage] || COLORS.gray[400];
                    const isLast = idx === ONBOARDING_STAGES.length - 1;

                    return (
                      <div key={item.stage} className="flex" style={{ gap: GRID.spacing.sm }}>
                        {/* Vertical pipeline connector */}
                        <div
                          className="flex flex-col items-center"
                          style={{ width: 24, flexShrink: 0 }}
                        >
                          {/* Dot */}
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: RADIUS.pill,
                              backgroundColor: dotColor,
                              boxShadow: `0 0 0 3px ${dotColor}22`,
                              flexShrink: 0,
                              marginTop: 4,
                            }}
                          />
                          {/* Line */}
                          {!isLast && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: COLORS.gray[200],
                                minHeight: 24,
                              }}
                            />
                          )}
                        </div>

                        {/* Stage content */}
                        <div
                          style={{
                            flex: 1,
                            paddingBottom: isLast ? 0 : GRID.spacing.md,
                          }}
                        >
                          <div
                            className="flex items-center justify-between"
                            style={{ marginBottom: 2 }}
                          >
                            <span
                              className="font-medium text-gray-800"
                              style={{ fontSize: TYPE.meta }}
                            >
                              {item.stage}
                            </span>
                            <span
                              className="font-semibold text-gray-900"
                              style={{
                                fontSize: TYPE.meta,
                                backgroundColor: COLORS.gray[100],
                                padding: `2px ${GRID.spacing.xs}px`,
                                borderRadius: RADIUS.pill,
                                minWidth: 28,
                                textAlign: 'center',
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                          {item.agents.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              {item.agents.map((agent) => (
                                <span
                                  key={agent}
                                  className="text-gray-500"
                                  style={{ fontSize: TYPE.caption }}
                                >
                                  {agent}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ── Recent Changes ── */}
            <Card
              className="overflow-hidden border-0"
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center gap-3"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
                    style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                  >
                    <Clock className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-gray-900">Recent Changes</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {RECENT_CHANGES.map((change) => {
                    const config = CHANGE_TYPE_CONFIG[change.type] || CHANGE_TYPE_CONFIG.departure;
                    const ChangeIcon = config.icon;

                    return (
                      <motion.div
                        key={change.id}
                        className="flex items-start"
                        style={{
                          gap: GRID.spacing.sm,
                          padding: 12,
                          borderRadius: RADIUS.button,
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[50],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Type icon */}
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: RADIUS.button,
                            backgroundColor: config.bg,
                          }}
                        >
                          <ChangeIcon
                            style={{
                              width: LAYOUT.icon.sm,
                              height: LAYOUT.icon.sm,
                              color: config.color,
                            }}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Description + timestamp */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-gray-800"
                            style={{ fontSize: TYPE.caption, lineHeight: 1.4 }}
                          >
                            {change.description}
                          </p>
                          <p
                            className="text-gray-400"
                            style={{ fontSize: TYPE.micro, marginTop: 2 }}
                          >
                            {change.timestamp}
                          </p>
                        </div>
                      </motion.div>
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

export default ManagerPromotions;
