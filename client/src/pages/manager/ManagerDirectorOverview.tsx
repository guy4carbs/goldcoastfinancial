/**
 * Manager Director Overview
 * Multi-team aggregate view for Director-tier users — team comparison,
 * elevated escalations, and strategic KPIs across all managed teams.
 * Heritage Design System — Emerald theme with gold accents
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/lib/heritageDesignSystem';
import {
  Building2,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  ChevronRight,
  Shield,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────────── */

const TEAMS = [
  { id: 1, name: 'Team Alpha', agents: 12, weeklyAP: 52400, pipeline: 847000, manager: 'You' },
  { id: 2, name: 'Team Beta', agents: 14, weeklyAP: 48200, pipeline: 723000, manager: 'Jennifer Walsh' },
  { id: 3, name: 'Team Gamma', agents: 10, weeklyAP: 41900, pipeline: 581000, manager: 'Robert Kim' },
];

const ELEVATED_ESCALATIONS = [
  { id: '1', description: 'Client lawsuit threat — needs legal review', team: 'Team Beta', priority: 'urgent' as const, timestamp: '2 hrs ago' },
  { id: '2', description: 'Compliance audit finding — improper disclosure', team: 'Team Alpha', priority: 'high' as const, timestamp: '5 hrs ago' },
  { id: '3', description: 'Agent misconduct report — unauthorized premium adjustment', team: 'Team Gamma', priority: 'urgent' as const, timestamp: '1 day ago' },
  { id: '4', description: 'Carrier contract dispute — commission discrepancy', team: 'Team Beta', priority: 'medium' as const, timestamp: '2 days ago' },
];

/* ── Priority styling ──────────────────────────────────────── */

const PRIORITY_DOT_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
};

/* ── Team selector options ─────────────────────────────────── */

const TEAM_FILTER_OPTIONS = ['All Teams', 'Team Alpha', 'Team Beta', 'Team Gamma'];

/* ── Computed totals ───────────────────────────────────────── */

const TOTAL_AGENTS = TEAMS.reduce((sum, t) => sum + t.agents, 0);
const AGGREGATE_AP = TEAMS.reduce((sum, t) => sum + t.weeklyAP, 0);
const COMBINED_PIPELINE = TEAMS.reduce((sum, t) => sum + t.pipeline, 0);
const MAX_AP = Math.max(...TEAMS.map((t) => t.weeklyAP));

/* ── Component ─────────────────────────────────────────────── */

export function ManagerDirectorOverview() {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  /* Filter teams based on selector */
  const filteredTeams =
    selectedTeam === 'All Teams'
      ? TEAMS
      : TEAMS.filter((t) => t.name === selectedTeam);

  /* Filter escalations based on selected team */
  const filteredEscalations =
    selectedTeam === 'All Teams'
      ? ELEVATED_ESCALATIONS
      : ELEVATED_ESCALATIONS.filter((e) => e.team === selectedTeam);

  /* Dynamic stat values based on filter */
  const statAgents = filteredTeams.reduce((sum, t) => sum + t.agents, 0);
  const statAP = filteredTeams.reduce((sum, t) => sum + t.weeklyAP, 0);
  const statPipeline = filteredTeams.reduce((sum, t) => sum + t.pipeline, 0);
  const statEscalations = filteredEscalations.length;

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Building2}
          title="Director Overview"
          subtitle="Multi-team performance and strategic insights"
        />

        {/* ── Team Selector ─────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center"
          style={{ gap: GRID.spacing.xs }}
        >
          {TEAM_FILTER_OPTIONS.map((option) => {
            const isActive = selectedTeam === option;
            return (
              <motion.button
                key={option}
                onClick={() => setSelectedTeam(option)}
                className="font-medium border-0"
                style={{
                  ...(isActive ? {} : glassCard),
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : undefined,
                  color: isActive ? '#ffffff' : COLORS.gray[600],
                  borderRadius: RADIUS.pill,
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm + 4}px`,
                  fontSize: TYPE.meta,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {option}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard
              icon={Users}
              value={String(statAgents)}
              label="Total Agents"
            />
            <ManagerStatCard
              icon={DollarSign}
              value={`$${(statAP / 1000).toFixed(1)}K`}
              label="Aggregate AP"
            />
            <ManagerStatCard
              icon={Target}
              value={`$${(statPipeline / 1000000).toFixed(1)}M`}
              label="Combined Pipeline"
            />
            <ManagerStatCard
              icon={AlertTriangle}
              value={String(statEscalations)}
              label="Open Escalations"
            />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Two-Column Layout ─────────────────────────────── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ── Left: Team Comparison ───────────────────────── */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0 h-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
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
                    <Users
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Team Comparison</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: GRID.spacing.sm,
                  }}
                >
                  {filteredTeams.map((team) => {
                    const barPercent = (team.weeklyAP / MAX_AP) * 100;

                    return (
                      <motion.div
                        key={team.id}
                        className="cursor-pointer"
                        style={{
                          padding: GRID.spacing.sm,
                          borderRadius: RADIUS.button,
                          backgroundColor: COLORS.gray[50],
                        }}
                        whileHover={{
                          backgroundColor: COLORS.gray[100],
                          transition: { duration: MOTION.duration.hover },
                        }}
                      >
                        {/* Team name and agent count */}
                        <div
                          className="flex items-center justify-between"
                          style={{ marginBottom: GRID.spacing.xs }}
                        >
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                            <span
                              className="font-semibold text-gray-900"
                              style={{ fontSize: TYPE.body }}
                            >
                              {team.name}
                            </span>
                            <span
                              className="text-gray-400 font-medium"
                              style={{ fontSize: TYPE.caption }}
                            >
                              {team.agents} agents
                            </span>
                          </div>
                          <span
                            className="font-bold"
                            style={{
                              fontSize: TYPE.body,
                              color: '#d97706',
                            }}
                          >
                            ${(team.weeklyAP / 1000).toFixed(1)}K
                          </span>
                        </div>

                        {/* Horizontal AP bar */}
                        <div
                          style={{
                            width: '100%',
                            height: 8,
                            backgroundColor: COLORS.gray[200],
                            borderRadius: RADIUS.pill,
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPercent}%` }}
                            transition={{
                              duration: 0.8,
                              ease: MOTION.easing,
                              delay: 0.3,
                            }}
                            style={{
                              height: '100%',
                              borderRadius: RADIUS.pill,
                              background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #0d9488 100%)',
                            }}
                          />
                        </div>

                        {/* Manager and pipeline */}
                        <div
                          className="flex items-center justify-between"
                          style={{ marginTop: GRID.spacing.xs }}
                        >
                          <span
                            className="text-gray-400"
                            style={{ fontSize: TYPE.caption }}
                          >
                            Manager: {team.manager}
                          </span>
                          <span
                            className="text-gray-500 font-medium"
                            style={{ fontSize: TYPE.caption }}
                          >
                            Pipeline: ${(team.pipeline / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right: Elevated Escalations ─────────────────── */}
          <motion.div variants={fadeInUp}>
            <Card
              className="overflow-hidden border-0 h-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                <CardTitle
                  className="font-semibold flex items-center"
                  style={{ fontSize: TYPE.title, gap: 12 }}
                >
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
                    <Shield
                      className="text-amber-200"
                      style={{ width: 20, height: 20 }}
                    />
                  </div>
                  <span className="text-gray-900">Elevated Escalations</span>
                </CardTitle>
              </CardHeader>

              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: GRID.spacing.xs,
                  }}
                >
                  {filteredEscalations.length === 0 && (
                    <div
                      className="text-center text-gray-400"
                      style={{ padding: GRID.spacing.lg, fontSize: TYPE.meta }}
                    >
                      No elevated escalations for this team.
                    </div>
                  )}

                  {filteredEscalations.map((esc) => (
                    <motion.div
                      key={esc.id}
                      className="flex items-start cursor-pointer"
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
                      {/* Priority dot */}
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: RADIUS.pill,
                          backgroundColor: PRIORITY_DOT_COLORS[esc.priority] || COLORS.gray[400],
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}
                        >
                          {esc.description}
                        </p>
                        <div
                          className="flex items-center flex-wrap"
                          style={{
                            gap: GRID.spacing.xs,
                            marginTop: 4,
                          }}
                        >
                          <span
                            className="font-medium"
                            style={{
                              fontSize: TYPE.caption,
                              color: '#059669',
                            }}
                          >
                            {esc.team}
                          </span>
                          <span
                            className="text-gray-300"
                            style={{ fontSize: TYPE.caption }}
                          >
                            |
                          </span>
                          <span
                            className="text-gray-400"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {esc.timestamp}
                          </span>
                          <span
                            className="inline-flex items-center font-semibold"
                            style={{
                              fontSize: TYPE.micro,
                              padding: `2px ${GRID.spacing.xs}px`,
                              borderRadius: RADIUS.pill,
                              backgroundColor:
                                esc.priority === 'urgent'
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : esc.priority === 'high'
                                    ? 'rgba(245, 158, 11, 0.1)'
                                    : 'rgba(59, 130, 246, 0.1)',
                              color:
                                esc.priority === 'urgent'
                                  ? '#dc2626'
                                  : esc.priority === 'high'
                                    ? '#d97706'
                                    : '#2563eb',
                            }}
                          >
                            {PRIORITY_LABELS[esc.priority]}
                          </span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight
                        className="text-gray-300 flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.sm,
                          height: LAYOUT.icon.sm,
                          marginTop: 2,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerDirectorOverview;
