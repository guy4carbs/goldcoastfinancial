/**
 * Executive Agent Management
 * Heritage Design System — Orange/Amber theme
 *
 * Comprehensive agent roster with performance tracking, compliance scores,
 * filterable data table with detail drawer.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-react';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveDataTable } from './primitives/ExecutiveDataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  fmtCurrency,
  DEMO_EXEC_AGENT_ROSTER,
  AGENT_STATUS_COLORS,
} from './executiveConstants';
import { toast } from 'sonner';

// ─── TYPES ───────────────────────────────────────────
type AgentStatus = 'active' | 'on-leave' | 'probation';
type AgentRole = 'Senior Agent' | 'Agent' | 'Junior Agent';

interface Agent {
  id: string;
  name: string;
  team: string;
  manager: string;
  status: AgentStatus;
  contractLevel: number;
  quotaAttainment: number;
  revenueMTD: number;
  complianceScore: number;
  startDate: string;
  role: AgentRole;
}

// ─── ROLE BADGE COLORS ──────────────────────────────
const ROLE_BADGE_COLORS: Record<AgentRole, { bg: string; text: string }> = {
  'Senior Agent': { bg: '#fff7ed', text: '#c2410c' },
  Agent: { bg: '#f9fafb', text: '#374151' },
  'Junior Agent': { bg: '#eff6ff', text: '#1d4ed8' },
};

// ─── FILTER PILL ─────────────────────────────────────
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="font-medium transition-colors"
      style={{
        fontSize: TYPE.caption,
        padding: '6px 14px',
        borderRadius: RADIUS.pill,
        backgroundColor: active ? '#ea580c' : COLORS.gray[100],
        color: active ? '#ffffff' : COLORS.gray[600],
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────
export function ExecutiveAgentManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [teamFilter, setTeamFilter] = useState<string>('All Teams');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Mutable copy of readonly demo data
  const agentData: Agent[] = useMemo(
    () => DEMO_EXEC_AGENT_ROSTER.map((a) => ({ ...a })),
    [],
  );

  // Apply filters
  const filteredData = useMemo(() => {
    return agentData.filter((agent) => {
      if (statusFilter !== 'All') {
        const statusMap: Record<string, AgentStatus> = {
          Active: 'active',
          'On Leave': 'on-leave',
          Probation: 'probation',
        };
        if (agent.status !== statusMap[statusFilter]) return false;
      }
      if (teamFilter !== 'All Teams' && agent.team !== teamFilter) return false;
      if (roleFilter !== 'All Roles' && agent.role !== roleFilter) return false;
      return true;
    });
  }, [agentData, statusFilter, teamFilter, roleFilter]);

  // Quota attainment color
  const quotaColor = (val: number) => {
    if (val > 110) return '#059669';
    if (val >= 90) return '#2563eb';
    return '#d97706';
  };

  // Compliance color
  const complianceColor = (val: number) => {
    if (val > 95) return '#059669';
    if (val >= 85) return '#d97706';
    return '#dc2626';
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (item: Agent) => {
        const badge = ROLE_BADGE_COLORS[item.role];
        return (
          <div>
            <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
              {item.name}
            </span>
            <div style={{ marginTop: 2 }}>
              <span
                className="inline-flex items-center font-medium"
                style={{
                  fontSize: TYPE.micro,
                  padding: '1px 8px',
                  borderRadius: RADIUS.pill,
                  backgroundColor: badge.bg,
                  color: badge.text,
                }}
              >
                {item.role}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      render: (item: Agent) => (
        <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>
          {item.team}
        </span>
      ),
    },
    {
      key: 'manager',
      label: 'Manager',
      sortable: true,
      render: (item: Agent) => (
        <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>
          {item.manager}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: Agent) => {
        const colors = AGENT_STATUS_COLORS[item.status];
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium px-2.5 py-1 ${colors.bg} ${colors.text}`}
            style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill }}
          >
            <span
              className={`${colors.dot}`}
              style={{ width: 6, height: 6, borderRadius: RADIUS.pill, display: 'inline-block' }}
            />
            {item.status === 'on-leave' ? 'On Leave' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'contractLevel',
      label: 'Contract Level',
      sortable: true,
      align: 'right' as const,
      render: (item: Agent) => (
        <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
          {item.contractLevel}%
        </span>
      ),
    },
    {
      key: 'quotaAttainment',
      label: 'Quota Attainment',
      sortable: true,
      align: 'right' as const,
      render: (item: Agent) => (
        <span
          className="font-semibold"
          style={{ fontSize: TYPE.meta, color: quotaColor(item.quotaAttainment) }}
        >
          {item.quotaAttainment}%
        </span>
      ),
    },
    {
      key: 'revenueMTD',
      label: 'Revenue MTD',
      sortable: true,
      align: 'right' as const,
      render: (item: Agent) => (
        <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
          {fmtCurrency(item.revenueMTD)}
        </span>
      ),
    },
    {
      key: 'complianceScore',
      label: 'Compliance',
      sortable: true,
      align: 'right' as const,
      render: (item: Agent) => (
        <span
          className="font-semibold"
          style={{ fontSize: TYPE.meta, color: complianceColor(item.complianceScore) }}
        >
          {item.complianceScore}/100
        </span>
      ),
    },
  ];

  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Hero ── */}
        <ExecutivePageHero
          icon={UserCog}
          title="Agent Management"
          subtitle="Comprehensive agent roster, performance, and compliance tracking"
        />

        {/* ── Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={Users}
              label="Total Agents"
              value="61"
            />
            <ExecutiveStatCard
              icon={UserCheck}
              label="Active"
              value="52"
              delta={8}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Clock}
              label="On Leave"
              value="4"
            />
            <ExecutiveStatCard
              icon={AlertTriangle}
              label="Probation"
              value="5"
              delta={-2}
              periodLabel="vs last month"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Filter Row ── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="border-0"
            style={{
              ...GLASS.css.light,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Status Filters */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Status:
                  </span>
                  {['All', 'Active', 'On Leave', 'Probation'].map((s) => (
                    <FilterPill
                      key={s}
                      label={s}
                      active={statusFilter === s}
                      onClick={() => setStatusFilter(s)}
                    />
                  ))}
                </div>

                {/* Team Filters */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Team:
                  </span>
                  {['All Teams', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo'].map((t) => (
                    <FilterPill
                      key={t}
                      label={t}
                      active={teamFilter === t}
                      onClick={() => setTeamFilter(t)}
                    />
                  ))}
                </div>

                {/* Role Filters */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Role:
                  </span>
                  {['All Roles', 'Senior Agent', 'Agent', 'Junior Agent'].map((r) => (
                    <FilterPill
                      key={r}
                      label={r}
                      active={roleFilter === r}
                      onClick={() => setRoleFilter(r)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Data Table ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveDataTable
            columns={columns}
            data={filteredData}
            searchPlaceholder="Search agents..."
            searchKeys={['name', 'team', 'manager', 'role']}
            onRowClick={(item) => setSelectedAgent(item)}
          />
        </motion.div>
      </motion.div>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedAgent(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
              style={{
                width: 400,
                ...GLASS.css.light,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderLeft: `1px solid ${COLORS.gray[200]}`,
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="absolute hover:bg-gray-100 transition-colors"
                style={{
                  top: GRID.spacing.md,
                  right: GRID.spacing.md,
                  padding: GRID.spacing.xs,
                  borderRadius: RADIUS.button,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                aria-label="Close drawer"
              >
                <X className="text-gray-500" style={{ width: 20, height: 20 }} />
              </button>

              <div style={{ padding: GRID.spacing.lg }}>
                {/* Agent Name & Role */}
                <h2
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.xs }}
                >
                  {selectedAgent.name}
                </h2>
                <div className="flex items-center gap-3" style={{ marginBottom: GRID.spacing.md }}>
                  <span
                    className="inline-flex items-center font-medium"
                    style={{
                      fontSize: TYPE.micro,
                      padding: '2px 10px',
                      borderRadius: RADIUS.pill,
                      backgroundColor: ROLE_BADGE_COLORS[selectedAgent.role].bg,
                      color: ROLE_BADGE_COLORS[selectedAgent.role].text,
                    }}
                  >
                    {selectedAgent.role}
                  </span>
                  {(() => {
                    const colors = AGENT_STATUS_COLORS[selectedAgent.status];
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium px-2.5 py-1 ${colors.bg} ${colors.text}`}
                        style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill }}
                      >
                        <span
                          className={colors.dot}
                          style={{ width: 6, height: 6, borderRadius: RADIUS.pill, display: 'inline-block' }}
                        />
                        {selectedAgent.status === 'on-leave'
                          ? 'On Leave'
                          : selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                      </span>
                    );
                  })()}
                </div>

                {/* Team & Manager */}
                <div
                  style={{
                    marginBottom: GRID.spacing.lg,
                    paddingBottom: GRID.spacing.md,
                    borderBottom: `1px solid ${COLORS.gray[200]}`,
                  }}
                >
                  <div className="flex justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Team
                    </span>
                    <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.team}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Manager
                    </span>
                    <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.manager}
                    </span>
                  </div>
                </div>

                {/* Performance Section */}
                <h3
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.title, marginBottom: GRID.spacing.sm }}
                >
                  Performance
                </h3>
                <div className="space-y-4" style={{ marginBottom: GRID.spacing.lg }}>
                  {/* Revenue MTD */}
                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.input,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        Revenue MTD
                      </span>
                      <span
                        className="font-bold text-gray-900"
                        style={{ fontSize: TYPE.title }}
                      >
                        {fmtCurrency(selectedAgent.revenueMTD)}
                      </span>
                    </CardContent>
                  </Card>

                  {/* Quota Attainment */}
                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.input,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        Quota Attainment
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          fontSize: TYPE.title,
                          color: quotaColor(selectedAgent.quotaAttainment),
                        }}
                      >
                        {selectedAgent.quotaAttainment}%
                      </span>
                    </CardContent>
                  </Card>

                  {/* Compliance Score */}
                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.input,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        Compliance Score
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          fontSize: TYPE.title,
                          color: complianceColor(selectedAgent.complianceScore),
                        }}
                      >
                        {selectedAgent.complianceScore}/100
                      </span>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Rows */}
                <div
                  style={{
                    paddingTop: GRID.spacing.md,
                    borderTop: `1px solid ${COLORS.gray[200]}`,
                  }}
                >
                  <div className="flex justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Contract Level
                    </span>
                    <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.contractLevel}%
                    </span>
                  </div>
                  <div className="flex justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                    <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      Start Date
                    </span>
                    <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                      {selectedAgent.startDate}
                    </span>
                  </div>
                </div>

                {/* View Full Profile Button */}
                <div style={{ marginTop: GRID.spacing.xl }}>
                  <Button
                    className="w-full text-white font-semibold"
                    style={{
                      borderRadius: RADIUS.button,
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      padding: '12px 24px',
                      fontSize: TYPE.meta,
                    }}
                    onClick={() => toast.success('Opening full profile...')}
                  >
                    View Full Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveAgentManagement;
