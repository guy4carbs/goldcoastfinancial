/**
 * Executive Agency Management
 * Heritage Design System — Orange/Amber theme
 *
 * Licensing, compliance, carrier contract oversight with tabbed layout.
 * Overview, Licensing, Compliance, and Carrier Contracts tabs.
 */

import { motion } from 'framer-motion';
import {
  Building,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from './primitives/ExecutiveTabSection';
import { ExecutiveDataTable } from './primitives/ExecutiveDataTable';
import { Card, CardContent } from '@/components/ui/card';
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
  DEMO_EXEC_LICENSING,
  DEMO_EXEC_COMPLIANCE,
  DEMO_EXEC_CARRIERS,
  DEMO_TEAMS,
  LICENSE_STATUS_COLORS,
} from './executiveConstants';

// ─── INLINE DATA ──────────────────────────────────────

const LICENSE_ATTENTION_DATA = [
  { name: 'Karen Mitchell', team: 'Gamma', licenseType: 'Life & Health', expirationDate: '2026-04-15', status: 'expiring' as const },
  { name: 'Laura Campbell', team: 'Gamma', licenseType: 'Life & Health', expirationDate: '2026-03-28', status: 'expiring' as const },
  { name: 'Brian Sullivan', team: 'Echo', licenseType: 'Life Only', expirationDate: '2026-02-15', status: 'expired' as const },
  { name: 'Robert Kim', team: 'Delta', licenseType: 'Life & Health', expirationDate: '2026-04-20', status: 'expiring' as const },
  { name: 'Amy Richardson', team: 'Echo', licenseType: 'Life & Health', expirationDate: '2026-04-30', status: 'expiring' as const },
  { name: 'Victor Nguyen', team: 'Beta', licenseType: 'Life Only', expirationDate: '2026-04-10', status: 'expiring' as const },
];

// ─── AUDIT STATUS COLORS ─────────────────────────────
const AUDIT_STATUS_COLORS = {
  passed: { bg: '#ecfdf5', text: '#047857' },
  pending: { bg: '#fffbeb', text: '#b45309' },
  review: { bg: '#fff7ed', text: '#c2410c' },
} as const;

// ─── E&O STATUS COLORS ──────────────────────────────
const EO_STATUS_COLORS = {
  current: { bg: '#ecfdf5', text: '#047857' },
  expiring: { bg: '#fffbeb', text: '#b45309' },
} as const;

// ─── CARRIER STATUS COLORS ──────────────────────────
const CARRIER_STATUS_COLORS = {
  active: { bg: '#ecfdf5', text: '#047857' },
  pending: { bg: '#fffbeb', text: '#b45309' },
} as const;

// ─── SECTION HEADER ─────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.input,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── HEALTH METRIC CARD ──────────────────────────────
function HealthMetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'green' | 'amber' | 'red';
}) {
  const dotColor =
    status === 'green' ? '#059669' : status === 'amber' ? '#d97706' : '#dc2626';
  return (
    <Card
      className="border-0"
      style={{
        ...GLASS.css.light,
        borderRadius: RADIUS.input,
        boxShadow: SHADOW.level1,
      }}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <span className="text-stone-600 font-medium" style={{ fontSize: TYPE.meta }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-900" style={{ fontSize: TYPE.title }}>
            {value}
          </span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: RADIUS.pill,
              backgroundColor: dotColor,
              display: 'inline-block',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────
export function ExecutiveAgencyManagement() {
  // Mutable copies for tables
  const complianceData = DEMO_EXEC_COMPLIANCE.map((c) => ({ ...c }));
  const carrierData = DEMO_EXEC_CARRIERS.map((c) => ({ ...c }));
  const teamData = DEMO_TEAMS.map((t) => ({ ...t }));

  // Carriers with renewal in next 6 months (from Mar 2026)
  const upcomingRenewals = carrierData.filter((c) => {
    const renewalDate = new Date(c.renewalDate);
    const sixMonthsOut = new Date('2026-09-12');
    return renewalDate <= sixMonthsOut;
  });

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
          icon={Building}
          title="Agency Management"
          subtitle="Licensing, compliance, and carrier contract oversight"
        />

        {/* ── Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={FileText}
              label="Active Licenses"
              value="58"
              delta={4}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={ShieldCheck}
              label="Compliance Score"
              value="94%"
              delta={2}
              periodLabel="vs last quarter"
            />
            <ExecutiveStatCard
              icon={AlertTriangle}
              label="E&O Expiring"
              value="3"
            />
            <ExecutiveStatCard
              icon={Briefcase}
              label="Carrier Contracts"
              value="8"
              delta={1}
              deltaFormat="number"
              periodLabel="new this quarter"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="overview"
            tabs={[
              { value: 'overview', label: 'Overview' },
              { value: 'licensing', label: 'Licensing' },
              { value: 'compliance', label: 'Compliance' },
              { value: 'carriers', label: 'Carrier Contracts' },
            ]}
          >
            {/* ═══════════ OVERVIEW TAB ═══════════ */}
            <TabsContent value="overview">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.618fr 1fr',
                  gap: GRID.spacing.lg,
                  marginTop: GRID.spacing.md,
                }}
              >
                {/* Left: Agency Profile */}
                <div>
                  <SectionHeader
                    icon={Building}
                    title="Agency Profile"
                    subtitle="Heritage Life Solutions overview"
                  />
                  <Card
                    className="border-0"
                    style={{
                      ...GLASS.css.light,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
                    <CardContent className="p-6">
                      <h4
                        className="font-bold text-stone-900"
                        style={{ fontSize: TYPE.section, marginBottom: GRID.spacing.sm }}
                      >
                        Heritage Life Solutions
                      </h4>
                      <div className="space-y-2" style={{ marginBottom: GRID.spacing.lg }}>
                        {[
                          { label: 'Founded', value: '2022' },
                          { label: 'Total Agents', value: '61' },
                          { label: 'Teams', value: '5' },
                          { label: 'Licensed States', value: '12' },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between">
                            <span className="text-stone-500" style={{ fontSize: TYPE.meta }}>
                              {row.label}
                            </span>
                            <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Team Distribution */}
                      <h5
                        className="font-semibold text-stone-700"
                        style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.sm }}
                      >
                        Team Distribution
                      </h5>
                      <div className="space-y-3">
                        {teamData.map((team) => {
                          const maxAgents = Math.max(...teamData.map((t) => t.agents));
                          const widthPct = Math.round((team.agents / maxAgents) * 100);
                          return (
                            <div key={team.id} className="flex items-center gap-3">
                              <span
                                className="font-medium text-stone-700 flex-shrink-0"
                                style={{ fontSize: TYPE.caption, width: 90 }}
                              >
                                {team.name}
                              </span>
                              <div className="flex-1 flex items-center gap-2">
                                <div
                                  style={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: RADIUS.pill,
                                    backgroundColor: COLORS.gray[100],
                                    overflow: 'hidden',
                                  }}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPct}%` }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                      height: '100%',
                                      borderRadius: RADIUS.pill,
                                      backgroundColor: '#ea580c',
                                    }}
                                  />
                                </div>
                                <span
                                  className="font-semibold text-stone-900 flex-shrink-0"
                                  style={{ fontSize: TYPE.caption, width: 24, textAlign: 'right' }}
                                >
                                  {team.agents}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Health Metrics */}
                <div>
                  <SectionHeader
                    icon={ShieldCheck}
                    title="Health Metrics"
                    subtitle="Agency health at a glance"
                  />
                  <div className="space-y-4">
                    <HealthMetricCard label="Compliance" value="94%" status="green" />
                    <HealthMetricCard label="Licensing" value="52 active" status="green" />
                    <HealthMetricCard label="E&O Coverage" value="95%" status="amber" />
                    <HealthMetricCard label="Carrier Relationships" value="6 active" status="green" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ LICENSING TAB ═══════════ */}
            <TabsContent value="licensing">
              <div style={{ marginTop: GRID.spacing.md }} className="space-y-6">
                {/* License overview stat cards */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Current', value: DEMO_EXEC_LICENSING.current, color: '#059669', bg: '#ecfdf5' },
                    { label: 'Expiring Soon', value: DEMO_EXEC_LICENSING.expiring, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Expired', value: DEMO_EXEC_LICENSING.expired, color: '#dc2626', bg: '#fef2f2' },
                  ].map((stat) => (
                    <Card
                      key={stat.label}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5 text-center">
                        <p
                          className="font-bold"
                          style={{ fontSize: TYPE.section, color: stat.color, marginBottom: 4 }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-stone-500 font-medium" style={{ fontSize: TYPE.caption }}>
                          {stat.label}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Agents Needing Attention Table */}
                <div>
                  <SectionHeader
                    icon={AlertTriangle}
                    title="Agents Needing Attention"
                    subtitle="Licenses expiring or expired"
                  />
                  <ExecutiveDataTable
                    columns={[
                      {
                        key: 'name',
                        label: 'Name',
                        sortable: true,
                        render: (item: typeof LICENSE_ATTENTION_DATA[number]) => (
                          <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                            {item.name}
                          </span>
                        ),
                      },
                      {
                        key: 'team',
                        label: 'Team',
                        sortable: true,
                        render: (item: typeof LICENSE_ATTENTION_DATA[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.team}
                          </span>
                        ),
                      },
                      {
                        key: 'licenseType',
                        label: 'License Type',
                        sortable: true,
                        render: (item: typeof LICENSE_ATTENTION_DATA[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.licenseType}
                          </span>
                        ),
                      },
                      {
                        key: 'expirationDate',
                        label: 'Expiration',
                        sortable: true,
                        render: (item: typeof LICENSE_ATTENTION_DATA[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.expirationDate}
                          </span>
                        ),
                      },
                      {
                        key: 'status',
                        label: 'Status',
                        sortable: true,
                        render: (item: typeof LICENSE_ATTENTION_DATA[number]) => {
                          const colors = LICENSE_STATUS_COLORS[item.status];
                          return (
                            <span
                              className={`inline-flex items-center font-medium px-2.5 py-1 capitalize ${colors.bg} ${colors.text}`}
                              style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill }}
                            >
                              {item.status}
                            </span>
                          );
                        },
                      },
                    ]}
                    data={LICENSE_ATTENTION_DATA}
                    searchPlaceholder="Search agents..."
                    searchKeys={['name', 'team', 'licenseType']}
                  />
                </div>
              </div>
            </TabsContent>

            {/* ═══════════ COMPLIANCE TAB ═══════════ */}
            <TabsContent value="compliance">
              <div style={{ marginTop: GRID.spacing.md }} className="space-y-6">
                {/* Compliance Table */}
                <div>
                  <SectionHeader
                    icon={ShieldCheck}
                    title="Team Compliance"
                    subtitle="Compliance scores, audit status, and E&O by team"
                  />
                  <ExecutiveDataTable
                    columns={[
                      {
                        key: 'team',
                        label: 'Team',
                        sortable: true,
                        render: (item: typeof complianceData[number]) => (
                          <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                            {item.team}
                          </span>
                        ),
                      },
                      {
                        key: 'score',
                        label: 'Score',
                        sortable: true,
                        align: 'right' as const,
                        render: (item: typeof complianceData[number]) => {
                          const color =
                            item.score > 95 ? '#059669' : item.score >= 85 ? '#d97706' : '#dc2626';
                          return (
                            <span className="font-bold" style={{ fontSize: TYPE.meta, color }}>
                              {item.score}%
                            </span>
                          );
                        },
                      },
                      {
                        key: 'auditStatus',
                        label: 'Audit Status',
                        sortable: true,
                        render: (item: typeof complianceData[number]) => {
                          const colors = AUDIT_STATUS_COLORS[item.auditStatus];
                          return (
                            <span
                              className="inline-flex items-center font-medium px-2.5 py-1 capitalize"
                              style={{
                                fontSize: TYPE.micro,
                                borderRadius: RADIUS.pill,
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {item.auditStatus}
                            </span>
                          );
                        },
                      },
                      {
                        key: 'eAndO',
                        label: 'E&O Status',
                        sortable: true,
                        render: (item: typeof complianceData[number]) => {
                          const colors = EO_STATUS_COLORS[item.eAndO];
                          return (
                            <span
                              className="inline-flex items-center font-medium px-2.5 py-1 capitalize"
                              style={{
                                fontSize: TYPE.micro,
                                borderRadius: RADIUS.pill,
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {item.eAndO}
                            </span>
                          );
                        },
                      },
                      {
                        key: 'lastAudit',
                        label: 'Last Audit',
                        sortable: true,
                        render: (item: typeof complianceData[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.lastAudit}
                          </span>
                        ),
                      },
                    ]}
                    data={complianceData}
                    searchPlaceholder="Search teams..."
                    searchKeys={['team']}
                  />
                </div>

                {/* Compliance Trend Summary */}
                <Card
                  className="border-0"
                  style={{
                    ...GLASS.css.light,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                  }}
                >
                  <CardContent className="p-6">
                    <SectionHeader
                      icon={CheckCircle2}
                      title="Compliance Trend"
                      subtitle="Overall compliance trajectory"
                    />
                    <div className="space-y-3">
                      <p className="text-stone-700" style={{ fontSize: TYPE.meta, lineHeight: 1.6 }}>
                        Overall agency compliance score stands at{' '}
                        <span className="font-bold" style={{ color: '#059669' }}>94%</span>,
                        reflecting a{' '}
                        <span className="font-bold" style={{ color: '#059669' }}>+2%</span>{' '}
                        improvement over the previous quarter. Teams Alpha and Beta continue to lead
                        with scores above 95%, while Delta and Echo have been flagged for targeted
                        compliance coaching.
                      </p>
                      <p className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                        Next scheduled agency-wide audit: April 15, 2026
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ═══════════ CARRIER CONTRACTS TAB ═══════════ */}
            <TabsContent value="carriers">
              <div style={{ marginTop: GRID.spacing.md }} className="space-y-6">
                {/* Carrier Table */}
                <div>
                  <SectionHeader
                    icon={Briefcase}
                    title="Carrier Contracts"
                    subtitle="Active and pending carrier relationships"
                  />
                  <ExecutiveDataTable
                    columns={[
                      {
                        key: 'name',
                        label: 'Carrier Name',
                        sortable: true,
                        render: (item: typeof carrierData[number]) => (
                          <span className="font-semibold text-stone-900" style={{ fontSize: TYPE.meta }}>
                            {item.name}
                          </span>
                        ),
                      },
                      {
                        key: 'contractType',
                        label: 'Contract Type',
                        sortable: true,
                        render: (item: typeof carrierData[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.contractType}
                          </span>
                        ),
                      },
                      {
                        key: 'baseRate',
                        label: 'Base Rate',
                        sortable: true,
                        align: 'right' as const,
                        render: (item: typeof carrierData[number]) => (
                          <span className="font-medium text-stone-900" style={{ fontSize: TYPE.meta }}>
                            {item.baseRate}%
                          </span>
                        ),
                      },
                      {
                        key: 'overrideRate',
                        label: 'Override Rate',
                        sortable: true,
                        align: 'right' as const,
                        render: (item: typeof carrierData[number]) => (
                          <span className="font-medium text-stone-900" style={{ fontSize: TYPE.meta }}>
                            {item.overrideRate}%
                          </span>
                        ),
                      },
                      {
                        key: 'renewalDate',
                        label: 'Renewal Date',
                        sortable: true,
                        render: (item: typeof carrierData[number]) => (
                          <span className="text-stone-700" style={{ fontSize: TYPE.meta }}>
                            {item.renewalDate}
                          </span>
                        ),
                      },
                      {
                        key: 'status',
                        label: 'Status',
                        sortable: true,
                        render: (item: typeof carrierData[number]) => {
                          const colors = CARRIER_STATUS_COLORS[item.status];
                          return (
                            <span
                              className="inline-flex items-center font-medium px-2.5 py-1 capitalize"
                              style={{
                                fontSize: TYPE.micro,
                                borderRadius: RADIUS.pill,
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {item.status}
                            </span>
                          );
                        },
                      },
                    ]}
                    data={carrierData}
                    searchPlaceholder="Search carriers..."
                    searchKeys={['name', 'contractType']}
                  />
                </div>

                {/* Upcoming Renewals */}
                {upcomingRenewals.length > 0 && (
                  <div>
                    <SectionHeader
                      icon={CalendarClock}
                      title="Upcoming Renewals"
                      subtitle="Contracts renewing in the next 6 months"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingRenewals.map((carrier) => (
                        <Card
                          key={carrier.name}
                          className="border-0"
                          style={{
                            ...GLASS.css.light,
                            borderRadius: RADIUS.card,
                            boxShadow: SHADOW.card,
                            borderLeft: '4px solid #d97706',
                          }}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                              <h4 className="font-bold text-stone-900" style={{ fontSize: TYPE.meta }}>
                                {carrier.name}
                              </h4>
                              <span
                                className="inline-flex items-center font-medium px-2.5 py-1"
                                style={{
                                  fontSize: TYPE.micro,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: '#fffbeb',
                                  color: '#b45309',
                                }}
                              >
                                Renewal Due
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                                  Contract Type
                                </span>
                                <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>
                                  {carrier.contractType}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                                  Renewal Date
                                </span>
                                <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>
                                  {carrier.renewalDate}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500" style={{ fontSize: TYPE.caption }}>
                                  Base / Override
                                </span>
                                <span className="font-medium text-stone-700" style={{ fontSize: TYPE.caption }}>
                                  {carrier.baseRate}% / {carrier.overrideRate}%
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveAgencyManagement;
