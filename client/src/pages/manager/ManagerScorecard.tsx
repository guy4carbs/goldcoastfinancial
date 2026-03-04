/**
 * Manager Scorecard — Deep-dive agent performance view
 *
 * Detailed KPI scorecard for individual agents with activity timeline,
 * call recordings, performance trends, AI coaching moments, coaching notes
 * with linked actions, quick actions, and comparison mode.
 *
 * Heritage Design System — Emerald theme with amber accents
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { MANAGER_ICON_GRADIENT } from './managerConstants';
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
  UserCheck,
  DollarSign,
  Phone,
  Target,
  Shield,
  Mail,
  GraduationCap,
  Award,
  CheckCircle,
  Calendar,
  ChevronDown,
  Flag,
  Network,
  TrendingUp,
  Sparkles,
  Play,
  ClipboardList,
  GitCompare,
  ArrowUp,
  ArrowDown,
  PhoneOutgoing,
  PhoneIncoming,
  type LucideIcon,
} from 'lucide-react';

// ─── DEMO DATA ───────────────────────────────────────────────

const AGENTS = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Agent', avatar: 'SJ', level: 6, apWeekly: 8500, calls: 45, closeRate: 18, complianceScore: 96 },
  { id: '2', name: 'Mike Chen', role: 'Agent', avatar: 'MC', level: 5, apWeekly: 6200, calls: 38, closeRate: 16, complianceScore: 91 },
  { id: '3', name: 'Emily Davis', role: 'Agent', avatar: 'ED', level: 4, apWeekly: 5100, calls: 32, closeRate: 15, complianceScore: 87 },
  { id: '4', name: 'James Wilson', role: 'Agent', avatar: 'JW', level: 3, apWeekly: 3800, calls: 24, closeRate: 17, complianceScore: 82 },
  { id: '5', name: 'Lisa Park', role: 'Junior Agent', avatar: 'LP', level: 2, apWeekly: 2100, calls: 28, closeRate: 11, complianceScore: 79 },
];

const ACTIVITY_TIMELINE: { id: string; type: string; description: string; timestamp: string; icon: LucideIcon }[] = [
  { id: '1', type: 'call', description: 'Completed 45-minute client call with Anderson Group', timestamp: '10 min ago', icon: Phone },
  { id: '2', type: 'deal', description: 'Moved Thompson Corp to Proposal stage ($32K)', timestamp: '1 hr ago', icon: Target },
  { id: '3', type: 'email', description: 'Sent follow-up quote to Williams Family', timestamp: '2 hrs ago', icon: Mail },
  { id: '4', type: 'coaching', description: 'Completed coaching session — objection handling', timestamp: '1 day ago', icon: GraduationCap },
  { id: '5', type: 'cert', description: 'Passed Advanced Life Insurance certification', timestamp: '3 days ago', icon: Award },
  { id: '6', type: 'deal', description: 'Closed Rodriguez policy ($18K annual premium)', timestamp: '4 days ago', icon: CheckCircle },
];

const COACHING_NOTES = [
  { id: '1', date: 'Feb 28', topic: 'Objection Handling', summary: 'Worked on price objection responses. Agent showing improvement in reframing value proposition.' },
  { id: '2', date: 'Feb 21', topic: 'Pipeline Review', summary: 'Reviewed 8 active deals. Identified 3 that need acceleration. Set follow-up cadence.' },
  { id: '3', date: 'Feb 14', topic: 'Goal Setting', summary: 'Set Q1 target to $95K AP. Discussed strategies for reaching Level 7 by end of quarter.' },
];

const PERFORMANCE_TRENDS = [
  { label: 'Weekly AP', current: 85, target: 100, color: '#10b981' },
  { label: 'Call Volume', current: 72, target: 100, color: '#0d9488' },
  { label: 'Close Rate', current: 90, target: 100, color: '#f59e0b' },
  { label: 'Compliance', current: 96, target: 100, color: '#059669' },
];

const CALL_RECORDINGS = [
  { id: '1', contact: 'Anderson Group — Jim Anderson', duration: '45:12', outcome: 'positive' as const, date: 'Today, 10:15 AM', type: 'outbound' as const },
  { id: '2', contact: 'Thompson Estate — Lisa Thompson', duration: '32:08', outcome: 'positive' as const, date: 'Today, 9:00 AM', type: 'outbound' as const },
  { id: '3', contact: 'Williams Family — Mark Williams', duration: '18:45', outcome: 'neutral' as const, date: 'Yesterday, 4:30 PM', type: 'inbound' as const },
  { id: '4', contact: 'Garcia Corp — Ana Garcia', duration: '52:33', outcome: 'positive' as const, date: 'Yesterday, 2:15 PM', type: 'outbound' as const },
  { id: '5', contact: 'Rodriguez Policy — Maria Rodriguez', duration: '12:20', outcome: 'negative' as const, date: 'Yesterday, 11:00 AM', type: 'inbound' as const },
];

const AI_COACHING_INSIGHTS = [
  {
    id: '1',
    insight: 'Call-to-close ratio has improved 22% over the past 2 weeks',
    confidence: 94,
    action: 'Reinforce current objection handling approach',
    dataPoints: ['8 closes from 45 calls', 'vs 5 from 42 calls last period'],
  },
  {
    id: '2',
    insight: 'Average deal size trending upward — $13.7K vs $11.2K last month',
    confidence: 87,
    action: 'Consider assigning larger pipeline opportunities',
    dataPoints: ['Top 3 deals all >$30K', 'Upsell rate increased 15%'],
  },
  {
    id: '3',
    insight: 'Activity dip detected on Thursdays — 40% fewer calls than avg',
    confidence: 78,
    action: 'Discuss time management during next 1:1',
    dataPoints: ['Avg 12 calls Mon-Wed', 'Only 7 calls on Thursdays'],
  },
];

// ─── STYLES ─────────────────────────────────────────────────

const glassCardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

const ACTIVITY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  call: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
  deal: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
  email: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
  coaching: { bg: 'rgba(139, 92, 246, 0.1)', text: '#7c3aed' },
  cert: { bg: 'rgba(20, 184, 166, 0.1)', text: '#0d9488' },
};

const OUTCOME_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', label: 'Won' },
  neutral: { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', label: 'Follow-up' },
  negative: { bg: 'rgba(244, 63, 94, 0.12)', text: '#e11d48', label: 'Lost' },
};

// ─── COMPONENT ───────────────────────────────────────────────

export function ManagerScorecard() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareAgent, setCompareAgent] = useState(AGENTS[1]);
  const [compareSelectorOpen, setCompareSelectorOpen] = useState(false);

  const formatAP = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const calcDelta = (a: number, b: number): { value: string; positive: boolean } => {
    if (b === 0) return { value: '+100%', positive: true };
    const pct = Math.round(((a - b) / b) * 100);
    return { value: `${pct >= 0 ? '+' : ''}${pct}%`, positive: pct >= 0 };
  };

  // ─── Agent Selector Renderer ───────────────────────────────
  const renderAgentSelector = (
    agent: typeof AGENTS[0],
    setAgent: (a: typeof AGENTS[0]) => void,
    isOpen: boolean,
    setOpen: (v: boolean) => void,
    label: string,
    excludeId?: string,
  ) => (
    <div style={{ position: 'relative', flex: 1 }}>
      <motion.button
        onClick={() => setOpen(!isOpen)}
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        transition={{ duration: MOTION.duration.hover }}
        style={{
          ...glassCardStyle,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
          display: 'flex',
          alignItems: 'center',
          gap: GRID.spacing.sm,
          width: '100%',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
      >
        <div
          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
          style={{
            width: LAYOUT.icon.xxl + 8,
            height: LAYOUT.icon.xxl + 8,
            borderRadius: RADIUS.button,
            fontSize: TYPE.meta,
            boxShadow: SHADOW.glow.emerald,
          }}
        >
          {agent.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
            {agent.name}
          </p>
          <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
            {agent.role} &middot; Level {agent.level}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: MOTION.duration.fast }}
        >
          <ChevronDown
            className="text-gray-400 flex-shrink-0"
            style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
          />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.fast, ease: MOTION.easing }}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: GRID.spacing.xs,
            ...glassCardStyle,
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.xs,
            zIndex: 50,
          }}
          role="listbox"
          aria-label={`${label} list`}
        >
          {AGENTS.filter((a) => a.id !== excludeId).map((a) => {
            const isSelected = a.id === agent.id;
            return (
              <motion.button
                key={a.id}
                onClick={() => {
                  setAgent(a);
                  setOpen(false);
                }}
                whileHover={{ backgroundColor: COLORS.gray[50] }}
                transition={{ duration: MOTION.duration.hover }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: GRID.spacing.sm,
                  width: '100%',
                  padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                  borderRadius: RADIUS.button,
                  cursor: 'pointer',
                  textAlign: 'left',
                  backgroundColor: isSelected ? COLORS.lounges.manager.light : 'transparent',
                  border: 'none',
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.caption,
                  }}
                >
                  {a.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {a.name}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {a.role} &middot; Level {a.level}
                  </p>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      backgroundColor: COLORS.lounges.manager.main,
                      flexShrink: 0,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Click-away overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );

  // ─── Stat Row Renderer ─────────────────────────────────────
  const renderStatRow = (agent: typeof AGENTS[0]) => (
    <ManagerStatCardGrid>
      <ManagerStatCard
        icon={DollarSign}
        value={formatAP(agent.apWeekly)}
        label="Weekly AP"
        trend={{ value: '12%', positive: true, label: 'vs last wk' }}
      />
      <ManagerStatCard
        icon={Phone}
        value={`${agent.calls} calls`}
        label="Call Volume"
        trend={{ value: '8%', positive: true }}
      />
      <ManagerStatCard
        icon={Target}
        value={`${agent.closeRate}%`}
        label="Close Rate"
        trend={{ value: '2%', positive: agent.closeRate >= 15 }}
      />
      <ManagerStatCard
        icon={Shield}
        value={`${agent.complianceScore}/100`}
        label="Compliance Score"
        trend={{ value: agent.complianceScore >= 90 ? '3' : '-2', positive: agent.complianceScore >= 90 }}
      />
    </ManagerStatCardGrid>
  );

  // ─── Delta Row ─────────────────────────────────────────────
  const renderDeltaRow = () => {
    const deltas = [
      { label: 'AP', ...calcDelta(selectedAgent.apWeekly, compareAgent.apWeekly) },
      { label: 'Calls', ...calcDelta(selectedAgent.calls, compareAgent.calls) },
      { label: 'Close', ...calcDelta(selectedAgent.closeRate, compareAgent.closeRate) },
      { label: 'Compliance', ...calcDelta(selectedAgent.complianceScore, compareAgent.complianceScore) },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: GRID.spacing.sm }}>
        {deltas.map((d) => (
          <div
            key={d.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: `${GRID.spacing.xs}px 0`,
            }}
          >
            {d.positive ? (
              <ArrowUp style={{ width: 14, height: 14, color: '#059669' }} />
            ) : (
              <ArrowDown style={{ width: 14, height: 14, color: '#e11d48' }} />
            )}
            <span
              style={{
                fontSize: TYPE.caption,
                fontWeight: 600,
                color: d.positive ? '#059669' : '#e11d48',
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ─── 1. HERO ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={UserCheck}
            title="Agent Scorecard"
            subtitle="Deep-dive into individual agent performance"
          />
        </motion.div>

        {/* ─── 2. AGENT SELECTOR + COMPARE TOGGLE ─── */}
        <motion.div
          variants={fadeInUp}
          style={{ display: 'flex', alignItems: 'flex-start', gap: GRID.spacing.sm }}
        >
          {renderAgentSelector(
            selectedAgent,
            setSelectedAgent,
            selectorOpen,
            setSelectorOpen,
            'Select agent',
            compareMode ? compareAgent.id : undefined,
          )}

          {/* Compare Toggle */}
          <motion.button
            onClick={() => setCompareMode(!compareMode)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: MOTION.duration.hover }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: GRID.spacing.xs,
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              borderRadius: RADIUS.pill,
              border: compareMode
                ? `2px solid ${COLORS.lounges.manager.main}`
                : `1px solid ${GLASS.border}`,
              backgroundColor: compareMode ? COLORS.lounges.manager.light : 'white',
              cursor: 'pointer',
              flexShrink: 0,
              height: LAYOUT.icon.xxl + 8 + GRID.spacing.sm * 2,
            }}
            type="button"
          >
            <GitCompare
              style={{
                width: LAYOUT.icon.sm,
                height: LAYOUT.icon.sm,
                color: compareMode ? COLORS.lounges.manager.main : COLORS.gray[400],
              }}
            />
            <span
              className="font-medium"
              style={{
                fontSize: TYPE.meta,
                color: compareMode ? COLORS.lounges.manager.dark : COLORS.gray[600],
              }}
            >
              Compare
            </span>
          </motion.button>

          {/* Compare Agent Selector */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: 'auto', marginLeft: 0 }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.sm, overflow: 'hidden', flex: 1 }}
              >
                <span className="font-bold text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.title }}>
                  vs
                </span>
                {renderAgentSelector(
                  compareAgent,
                  setCompareAgent,
                  compareSelectorOpen,
                  setCompareSelectorOpen,
                  'Select comparison agent',
                  selectedAgent.id,
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── 3. STAT CARDS ─── */}
        <motion.div variants={fadeInUp}>
          {compareMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
              {/* Agent A label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginBottom: 4 }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold`}
                  style={{ width: 24, height: 24, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                >
                  {selectedAgent.avatar}
                </div>
                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                  {selectedAgent.name}
                </span>
              </div>
              {renderStatRow(selectedAgent)}

              {/* Delta indicators */}
              {renderDeltaRow()}

              {/* Agent B label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginBottom: 4 }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold`}
                  style={{ width: 24, height: 24, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                >
                  {compareAgent.avatar}
                </div>
                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                  {compareAgent.name}
                </span>
              </div>
              {renderStatRow(compareAgent)}
            </div>
          ) : (
            renderStatRow(selectedAgent)
          )}
        </motion.div>

        {/* ─── 4. AI COACHING MOMENTS ─── */}
        <motion.div variants={fadeInUp}>
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: MOTION.duration.hover }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: GRID.spacing.md,
            }}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-rose-400"
          >
            {/* Fibonacci blobs */}
            <div
              style={{
                position: 'absolute',
                width: 89,
                height: 89,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.15)',
                top: -20,
                right: 40,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 55,
                height: 55,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.1)',
                bottom: -10,
                left: 60,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 34,
                height: 34,
                borderRadius: RADIUS.pill,
                background: 'rgba(255,255,255,0.2)',
                top: 20,
                left: '45%',
              }}
            />

            {/* Header */}
            <div
              className="flex items-center"
              style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md, position: 'relative', zIndex: 1 }}
            >
              <Sparkles style={{ width: 24, height: 24, color: 'white' }} />
              <span className="font-semibold text-white" style={{ fontSize: TYPE.title }}>
                AI Coach
              </span>
              <span
                style={{
                  fontSize: TYPE.micro,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: RADIUS.pill,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  fontWeight: 600,
                }}
              >
                Beta
              </span>
            </div>

            {/* Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm, position: 'relative', zIndex: 1 }}>
              {AI_COACHING_INSIGHTS.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && (
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: GRID.spacing.sm }} />
                  )}
                  <div
                    style={{
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.pill,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    {/* Insight text */}
                    <p className="font-medium" style={{ fontSize: TYPE.meta, color: 'white', marginBottom: GRID.spacing.xs }}>
                      {item.insight}
                    </p>

                    {/* Confidence badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: TYPE.micro,
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: RADIUS.pill,
                        background: 'rgba(255,255,255,0.18)',
                        fontWeight: 600,
                        marginBottom: GRID.spacing.xs,
                      }}
                    >
                      {item.confidence}% confidence
                    </span>

                    {/* Suggested action */}
                    <p style={{ fontSize: TYPE.caption, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: GRID.spacing.xs }}>
                      {item.action}
                    </p>

                    {/* Data points */}
                    <div style={{ display: 'flex', gap: GRID.spacing.xs, flexWrap: 'wrap' }}>
                      {item.dataPoints.map((dp) => (
                        <span
                          key={dp}
                          style={{
                            fontSize: TYPE.micro,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: RADIUS.pill,
                            background: 'rgba(255,255,255,0.12)',
                            fontWeight: 500,
                          }}
                        >
                          {dp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── 5. TWO-COLUMN LAYOUT (Golden Ratio 61.8% / 38.2%) ─── */}
        <motion.div
          variants={fadeInUp}
          style={{
            display: 'grid',
            gridTemplateColumns: '61.8fr 38.2fr',
            gap: GRID.spacing.md,
          }}
          className="grid-cols-1 lg:!grid-cols-[61.8fr_38.2fr]"
        >
          {/* ─── LEFT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Activity Timeline */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <TrendingUp className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Activity Timeline
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent agent activities
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {ACTIVITY_TIMELINE.map((activity, index) => {
                  const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.call;
                  const ActivityIcon = activity.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: MOTION.duration.normal,
                        delay: index * 0.06,
                        ease: MOTION.easing,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[50] }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: GRID.spacing.sm,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        transition: `background-color ${MOTION.duration.hover}s`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: RADIUS.button,
                          backgroundColor: typeColor.bg,
                        }}
                      >
                        <ActivityIcon
                          style={{
                            width: LAYOUT.icon.sm,
                            height: LAYOUT.icon.sm,
                            color: typeColor.text,
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-gray-800" style={{ fontSize: TYPE.meta, lineHeight: 1.45 }}>
                          {activity.description}
                        </p>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ─── CALL RECORDINGS (NEW) ─── */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Phone className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Call Recordings
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent calls
                  </p>
                </div>
              </div>

              {/* Recording Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {CALL_RECORDINGS.map((rec, index) => {
                  const outcome = OUTCOME_BADGES[rec.outcome];
                  const CallTypeIcon = rec.type === 'outbound' ? PhoneOutgoing : PhoneIncoming;
                  const callColor = rec.type === 'outbound' ? '#059669' : '#2563eb';

                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: MOTION.duration.normal,
                        delay: index * 0.06,
                        ease: MOTION.easing,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[50] }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: GRID.spacing.sm,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        transition: `background-color ${MOTION.duration.hover}s`,
                      }}
                    >
                      {/* Call type icon */}
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: RADIUS.button,
                          backgroundColor: `${callColor}14`,
                        }}
                      >
                        <CallTypeIcon
                          style={{
                            width: LAYOUT.icon.sm,
                            height: LAYOUT.icon.sm,
                            color: callColor,
                          }}
                        />
                      </div>

                      {/* Contact + Duration */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta, lineHeight: 1.45 }}>
                          {rec.contact}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginTop: 2 }}>
                          <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                            {rec.duration}
                          </span>
                          <span className="text-gray-300" style={{ fontSize: TYPE.caption }}>
                            &middot;
                          </span>
                          <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                            {rec.date}
                          </span>
                        </div>
                      </div>

                      {/* Outcome badge */}
                      <span
                        style={{
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: RADIUS.pill,
                          backgroundColor: outcome.bg,
                          color: outcome.text,
                          flexShrink: 0,
                        }}
                      >
                        {outcome.label}
                      </span>

                      {/* Play button */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: RADIUS.pill,
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        type="button"
                        aria-label={`Play recording for ${rec.contact}`}
                      >
                        <Play
                          style={{
                            width: LAYOUT.icon.md,
                            height: LAYOUT.icon.md,
                            color: '#059669',
                          }}
                        />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Performance Trends */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Target className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Performance Trends
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Weekly metric progress
                  </p>
                </div>
              </div>

              {/* Metric Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {PERFORMANCE_TRENDS.map((metric, index) => (
                  <div key={metric.label}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs }}
                    >
                      <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                        {metric.label}
                      </span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {metric.current}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 10,
                        borderRadius: RADIUS.pill,
                        backgroundColor: COLORS.gray[100],
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.current}%` }}
                        transition={{
                          duration: MOTION.duration.slow,
                          delay: 0.2 + index * 0.1,
                          ease: MOTION.easing,
                        }}
                        style={{
                          height: '100%',
                          borderRadius: RADIUS.pill,
                          background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`,
                          boxShadow: `0 2px 8px ${metric.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Coaching Notes (Enhanced with Linked Actions) */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <GraduationCap className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Coaching Notes
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent session summaries
                  </p>
                </div>
              </div>

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {COACHING_NOTES.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: MOTION.duration.normal,
                      delay: 0.1 + index * 0.08,
                      ease: MOTION.easing,
                    }}
                    style={{
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                      borderLeft: `3px solid ${COLORS.lounges.manager.main}`,
                    }}
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs }}
                    >
                      <span
                        className="font-semibold text-gray-800"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {note.topic}
                      </span>
                      <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        {note.date}
                      </span>
                    </div>
                    <p
                      className="text-gray-600"
                      style={{ fontSize: TYPE.caption, lineHeight: 1.5 }}
                    >
                      {note.summary}
                    </p>

                    {/* ─── Linked Coaching Actions (NEW) ─── */}
                    <div style={{ display: 'flex', gap: GRID.spacing.xs, marginTop: GRID.spacing.sm }}>
                      <motion.button
                        whileHover={{ scale: 1.04, backgroundColor: COLORS.lounges.manager.light }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 12px',
                          borderRadius: RADIUS.pill,
                          border: '1px solid #a7f3d0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: '#047857',
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                        }}
                        type="button"
                      >
                        <Calendar style={{ width: 12, height: 12 }} />
                        Schedule Follow-Up
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.04, backgroundColor: 'rgba(13, 148, 136, 0.08)' }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 12px',
                          borderRadius: RADIUS.pill,
                          border: '1px solid #99f6e4',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: '#0f766e',
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                        }}
                        type="button"
                      >
                        <ClipboardList style={{ width: 12, height: 12 }} />
                        Create Action Item
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCardStyle,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <UserCheck className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Quick Actions
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Manage this agent
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {[
                  { icon: Calendar, label: 'Schedule Coaching', color: COLORS.lounges.manager.main },
                  { icon: Flag, label: 'Flag for Review', color: COLORS.accent.amber[500] },
                  { icon: Network, label: 'View in Hierarchy', color: '#0d9488' },
                ].map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: COLORS.gray[50],
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: MOTION.duration.hover }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: GRID.spacing.sm,
                        width: '100%',
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        border: `1px solid ${GLASS.border}`,
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      type="button"
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: RADIUS.button,
                          backgroundColor: `${action.color}14`,
                        }}
                      >
                        <ActionIcon
                          style={{
                            width: LAYOUT.icon.sm,
                            height: LAYOUT.icon.sm,
                            color: action.color,
                          }}
                        />
                      </div>
                      <span
                        className="font-medium text-gray-700"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerScorecard;
