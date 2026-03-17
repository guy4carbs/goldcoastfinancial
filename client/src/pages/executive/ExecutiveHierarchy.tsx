/**
 * Executive Hierarchy — Organization structure and override waterfall
 * Heritage Design System — Orange/Blood Orange theme
 *
 * Full-width connected node tree visualization with no tabs.
 * Shows Owner -> Managers -> Agents with spread/override labels.
 */

import { motion } from 'framer-motion';
import {
  Building2,
  Layers,
  DollarSign,
  Users,
  Crown,
  ArrowDown,
} from 'lucide-react';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { Card, CardContent } from '@/components/ui/card';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency,
  EXECUTIVE_GRADIENT_CSS,
  DEMO_EXEC_HIERARCHY_TREE,
  DEMO_EXEC_COMMISSION_SUMMARY,
} from './executiveConstants';

// ── Level color mapping ──
const LEVEL_COLORS = {
  owner: '#ea580c',
  manager: '#f59e0b',
  agent: '#94a3b8',
} as const;

// ── Hierarchy Node Card ──
function HierarchyNodeCard({
  name,
  role,
  contractLevel,
  level,
  revenue,
  team,
  agents,
  isRoot,
}: {
  name: string;
  role: string;
  contractLevel: number;
  level: 'owner' | 'manager' | 'agent';
  revenue?: number;
  team?: string;
  agents?: number;
  isRoot?: boolean;
}) {
  const color = LEVEL_COLORS[level];
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
    >
      <div
        className="border-0 relative"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: isRoot ? SHADOW.hero : SHADOW.card,
          padding: isRoot ? GRID.spacing.md : GRID.spacing.sm,
          minWidth: isRoot ? 220 : 140,
          textAlign: 'center',
          borderTop: `3px solid ${color}`,
          ...(isRoot ? { outline: `2px solid ${color}30` } : {}),
        }}
      >
        {/* Icon badge for root */}
        {isRoot && (
          <div
            className="flex items-center justify-center mx-auto"
            style={{
              width: 48,
              height: 48,
              borderRadius: RADIUS.button,
              background: EXECUTIVE_GRADIENT_CSS,
              marginBottom: GRID.spacing.xs,
              boxShadow: '0 4px 14px rgba(234,88,12,0.25)',
            }}
          >
            <Crown style={{ width: 24, height: 24, color: '#fde68a' }} />
          </div>
        )}

        <p
          className="font-bold text-gray-900"
          style={{ fontSize: isRoot ? TYPE.title : TYPE.meta }}
        >
          {name}
        </p>

        {/* Role badge */}
        <span
          className="inline-block mt-1"
          style={{
            fontSize: TYPE.micro,
            fontWeight: 600,
            color,
            backgroundColor: `${color}15`,
            padding: '2px 8px',
            borderRadius: RADIUS.pill,
          }}
        >
          {role}
        </span>

        {/* Contract Level */}
        <p
          className="font-bold mt-2"
          style={{ fontSize: isRoot ? TYPE.hero : TYPE.section, color }}
        >
          {contractLevel}%
        </p>

        {/* Meta info */}
        {team && (
          <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.micro }}>
            Team {team}
          </p>
        )}
        {agents != null && (
          <div className="flex items-center justify-center mt-1" style={{ gap: 4 }}>
            <Users style={{ width: 12, height: 12, color: COLORS.gray[400] }} />
            <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>{agents} agents</span>
          </div>
        )}
        {revenue != null && (
          <p className="text-gray-600 font-semibold mt-1" style={{ fontSize: TYPE.caption }}>
            {fmtCurrency(revenue)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Vertical Connector with spread label ──
function VerticalConnector({ spread }: { spread: number }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 2 }}>
      <div style={{ width: 2, height: 16, backgroundColor: '#ea580c', opacity: 0.3 }} />
      <span
        className="font-semibold whitespace-nowrap"
        style={{
          fontSize: TYPE.micro,
          color: '#ea580c',
          backgroundColor: 'rgba(234,88,12,0.08)',
          padding: '2px 6px',
          borderRadius: RADIUS.pill,
        }}
      >
        {spread}% spread
      </span>
      <ArrowDown style={{ width: 12, height: 12, color: '#ea580c', opacity: 0.5 }} />
    </div>
  );
}

export function ExecutiveHierarchy() {
  const root = DEMO_EXEC_HIERARCHY_TREE;

  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── HERO ── */}
        <ExecutivePageHero
          icon={Building2}
          title="Agency Hierarchy"
          subtitle="Organization structure and override waterfall"
        />

        {/* ── STAT CARDS ── */}
        <motion.section variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Layers}
              label="Hierarchy Levels"
              value="3"
            />
            <ExecutiveStatCard
              icon={DollarSign}
              label="Total Override Pool"
              value={fmtCurrency(DEMO_EXEC_COMMISSION_SUMMARY.overrideEarnings)}
            />
            <ExecutiveStatCard
              icon={Crown}
              label="Agency Contract"
              value="120%"
            />
            <ExecutiveStatCard
              icon={Users}
              label="Spread Range"
              value="10-50%"
            />
          </ExecutiveStatCardGrid>
        </motion.section>

        {/* ── HIERARCHY TREE ── */}
        <motion.section variants={fadeInUp}>
          <Card
            className="border-0 overflow-x-auto"
            style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
          >
            <CardContent style={{ padding: GRID.spacing.lg, minWidth: 900 }}>
              {/* Section Header */}
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.lg }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                    background: 'linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(251,191,36,0.15) 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Building2 style={{ width: 20, height: 20, color: '#ea580c' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>
                    Organization Tree
                  </h3>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
                    Connected hierarchy with override spread at each level
                  </p>
                </div>
              </div>

              {/* Tree Layout */}
              <div className="flex flex-col items-center" style={{ gap: 0 }}>
                {/* LEVEL 1: Root / Owner */}
                <HierarchyNodeCard
                  name={root.name}
                  role={root.role}
                  contractLevel={root.contractLevel}
                  level="owner"
                  isRoot
                />

                {/* Connector down from root */}
                <div className="flex justify-center" style={{ margin: `${GRID.spacing.xs}px 0` }}>
                  <div style={{ width: 2, height: 24, backgroundColor: '#ea580c', opacity: 0.3 }} />
                </div>

                {/* Horizontal connector line across managers */}
                <div className="relative w-full" style={{ maxWidth: 1000 }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '10%',
                      right: '10%',
                      height: 2,
                      backgroundColor: '#ea580c',
                      opacity: 0.2,
                    }}
                  />
                </div>

                {/* LEVEL 2: Managers */}
                <div
                  className="flex flex-wrap justify-center"
                  style={{ gap: GRID.spacing.md, marginTop: GRID.spacing.xs }}
                >
                  {root.children.map((manager) => {
                    const spreadToManager = root.contractLevel - manager.contractLevel;
                    return (
                      <div
                        key={manager.name}
                        className="flex flex-col items-center"
                        style={{ gap: 0 }}
                      >
                        {/* Spread label: Owner to Manager */}
                        <VerticalConnector spread={spreadToManager} />

                        {/* Manager node */}
                        <HierarchyNodeCard
                          name={manager.name}
                          role={manager.role}
                          contractLevel={manager.contractLevel}
                          level="manager"
                          team={manager.team}
                          agents={manager.agents}
                          revenue={manager.revenue}
                        />

                        {/* LEVEL 3: Agents under this manager */}
                        {manager.children && manager.children.length > 0 && (
                          <div className="flex flex-col items-center" style={{ marginTop: GRID.spacing.xs }}>
                            {/* Vertical connector from manager down */}
                            <div style={{ width: 2, height: 12, backgroundColor: '#94a3b8', opacity: 0.3 }} />

                            <div className="flex flex-wrap justify-center" style={{ gap: GRID.spacing.xs }}>
                              {manager.children.map((agent) => {
                                const spreadToAgent = manager.contractLevel - agent.contractLevel;
                                return (
                                  <div
                                    key={agent.name}
                                    className="flex flex-col items-center"
                                    style={{ gap: 0 }}
                                  >
                                    {/* Spread label: Manager to Agent */}
                                    <div className="flex flex-col items-center" style={{ gap: 2 }}>
                                      <div style={{ width: 2, height: 10, backgroundColor: '#94a3b8', opacity: 0.25 }} />
                                      <span
                                        className="font-medium whitespace-nowrap"
                                        style={{
                                          fontSize: 10,
                                          color: '#94a3b8',
                                          backgroundColor: 'rgba(148,163,184,0.1)',
                                          padding: '1px 5px',
                                          borderRadius: RADIUS.pill,
                                        }}
                                      >
                                        {spreadToAgent > 0 ? `${spreadToAgent}%` : '0%'}
                                      </span>
                                      <ArrowDown style={{ width: 10, height: 10, color: '#94a3b8', opacity: 0.4 }} />
                                    </div>

                                    {/* Agent node */}
                                    <HierarchyNodeCard
                                      name={agent.name}
                                      role={agent.role}
                                      contractLevel={agent.contractLevel}
                                      level="agent"
                                      revenue={agent.revenue}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div
                className="flex flex-wrap items-center justify-center mt-8"
                style={{ gap: GRID.spacing.md }}
              >
                {[
                  { label: 'Owner', color: LEVEL_COLORS.owner },
                  { label: 'Manager', color: LEVEL_COLORS.manager },
                  { label: 'Agent', color: LEVEL_COLORS.agent },
                ].map((item) => (
                  <div key={item.label} className="flex items-center" style={{ gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: RADIUS.pill, backgroundColor: item.color }} />
                    <span className="font-medium text-gray-600" style={{ fontSize: TYPE.caption }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Zoom note */}
              <p
                className="text-center mt-4 text-gray-400"
                style={{ fontSize: TYPE.micro }}
              >
                Scroll horizontally to view the full hierarchy tree.
                Spread percentages show override earnings at each level transition.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveHierarchy;
