/**
 * Executive Reports — Generate, Schedule & Manage Executive Reports
 * Heritage Design System — Orange/Amber theme
 *
 * Report template browser, generation history, and scheduled report management.
 */

import { motion } from 'framer-motion';
import {
  FileBarChart,
  FileText,
  Clock,
  Calendar,
  Download,
  Play,
  Mail,
} from 'lucide-react';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from './primitives/ExecutiveTabSection';
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
  DEMO_EXEC_REPORT_TEMPLATES,
} from './executiveConstants';
import { toast } from 'sonner';

// ─── CATEGORY COLORS ──────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  performance: { bg: '#fff7ed', text: '#ea580c' },
  financial: { bg: '#ecfdf5', text: '#059669' },
  pipeline: { bg: '#eff6ff', text: '#2563eb' },
  compliance: { bg: '#f5f3ff', text: '#7c3aed' },
  executive: { bg: '#fffbeb', text: '#d97706' },
  recruiting: { bg: '#fdf2f8', text: '#db2777' },
};

// ─── INLINE DATA: REPORT HISTORY ──────────────────
const REPORT_HISTORY = [
  { id: 1, name: 'Agency Performance Summary', generated: '2026-03-12', format: 'PDF', size: '2.4 MB', status: 'ready' as const },
  { id: 2, name: 'Commission Statement', generated: '2026-03-11', format: 'Excel', size: '1.8 MB', status: 'ready' as const },
  { id: 3, name: 'Pipeline Health Report', generated: '2026-03-10', format: 'PDF', size: '3.1 MB', status: 'ready' as const },
  { id: 4, name: 'Board Presentation Pack', generated: '2026-03-08', format: 'PDF', size: '5.2 MB', status: 'ready' as const },
  { id: 5, name: 'Executive Dashboard Export', generated: '2026-03-05', format: 'PDF', size: '1.6 MB', status: 'ready' as const },
];

// ─── INLINE DATA: SCHEDULED REPORTS ───────────────
const REPORT_SCHEDULES = [
  { id: 1, name: 'Agency Performance Summary', frequency: 'Weekly', nextRun: '2026-03-17', recipients: 3, active: true },
  { id: 2, name: 'Commission Statement', frequency: 'Monthly', nextRun: '2026-04-01', recipients: 5, active: true },
  { id: 3, name: 'Pipeline Health Report', frequency: 'Weekly', nextRun: '2026-03-17', recipients: 2, active: true },
  { id: 4, name: 'Board Presentation Pack', frequency: 'Quarterly', nextRun: '2026-04-01', recipients: 8, active: false },
];

// ─── SECTION HEADER ─────────────────────────────
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
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
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── FREQUENCY BADGE COLORS ───────────────────────
const FREQUENCY_COLORS: Record<string, { bg: string; text: string }> = {
  Weekly: { bg: '#eff6ff', text: '#2563eb' },
  Monthly: { bg: '#ecfdf5', text: '#059669' },
  Quarterly: { bg: '#f5f3ff', text: '#7c3aed' },
};

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveReports() {
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
          icon={FileBarChart}
          title="Custom Reports"
          subtitle="Generate, schedule, and manage executive reports"
        />

        {/* ── Top-Level Stats ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveStatCardGrid>
            <ExecutiveStatCard
              icon={FileText}
              label="Reports This Month"
              value="12"
              delta={20}
              periodLabel="vs last month"
            />
            <ExecutiveStatCard
              icon={Calendar}
              label="Scheduled Active"
              value="4"
              delta={1}
              deltaFormat="number"
              periodLabel="new this month"
            />
            <ExecutiveStatCard
              icon={Clock}
              label="Avg Gen Time"
              value="3.2s"
              delta={-15}
              periodLabel="faster"
            />
            <ExecutiveStatCard
              icon={FileBarChart}
              label="Report Types"
              value="14"
            />
          </ExecutiveStatCardGrid>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeInUp}>
          <ExecutiveTabSection
            defaultValue="generate"
            tabs={[
              { value: 'generate', label: 'Generate', icon: Play },
              { value: 'history', label: 'History', icon: Clock },
              { value: 'schedules', label: 'Schedules', icon: Calendar },
            ]}
          >
            {/* ════════════════ GENERATE TAB ════════════════ */}
            <TabsContent value="generate" className="mt-6 space-y-6">
              <SectionHeader
                icon={FileBarChart}
                title="Report Templates"
                subtitle="Select a template to generate a custom report"
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: GRID.spacing.sm,
                }}
              >
                {DEMO_EXEC_REPORT_TEMPLATES.map((template) => {
                  const catColors = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.performance;

                  return (
                    <Card
                      key={template.id}
                      className="border-0 group relative"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                      }}
                    >
                      <CardContent className="p-5">
                        {/* Category badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: RADIUS.input,
                              backgroundColor: catColors.bg,
                            }}
                          >
                            <FileBarChart style={{ width: 18, height: 18, color: catColors.text }} />
                          </div>
                          <span
                            className="font-medium"
                            style={{
                              fontSize: TYPE.micro,
                              color: catColors.text,
                              backgroundColor: catColors.bg,
                              padding: '2px 8px',
                              borderRadius: RADIUS.pill,
                            }}
                          >
                            {template.category}
                          </span>
                        </div>

                        {/* Template name & description */}
                        <h4
                          className="font-bold text-gray-900 mb-1"
                          style={{ fontSize: TYPE.meta, lineHeight: 1.3 }}
                        >
                          {template.name}
                        </h4>
                        <p
                          style={{
                            fontSize: TYPE.caption,
                            color: COLORS.gray[500],
                            lineHeight: 1.4,
                            minHeight: 36,
                          }}
                        >
                          {template.description}
                        </p>

                        {/* Generate button */}
                        <Button
                          size="sm"
                          className="w-full mt-3"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                            fontSize: TYPE.caption,
                          }}
                          onClick={() => toast.success(`Generating ${template.name}...`)}
                        >
                          <Play style={{ width: 14, height: 14, marginRight: 6 }} />
                          Generate
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════════════ HISTORY TAB ════════════════ */}
            <TabsContent value="history" className="mt-6 space-y-6">
              <SectionHeader
                icon={Clock}
                title="Recent Reports"
                subtitle="Previously generated reports available for download"
              />

              <Card
                className="border-0"
                style={{
                  ...GLASS.css.light,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                        {['Report Name', 'Generated', 'Format', 'Size', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="text-left font-semibold text-gray-600 px-5 py-3"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {REPORT_HISTORY.map((report) => (
                        <tr
                          key={report.id}
                          className="transition-colors hover:bg-gray-50/50"
                          style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: RADIUS.input,
                                  backgroundColor: report.format === 'PDF' ? '#fef2f2' : '#ecfdf5',
                                }}
                              >
                                <FileText
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: report.format === 'PDF' ? '#ef4444' : '#10b981',
                                  }}
                                />
                              </div>
                              <span
                                className="font-semibold text-gray-900"
                                style={{ fontSize: TYPE.meta }}
                              >
                                {report.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-5 py-4 text-gray-600"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {report.generated}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="font-medium"
                              style={{
                                fontSize: TYPE.micro,
                                color: report.format === 'PDF' ? '#ef4444' : '#10b981',
                                backgroundColor: report.format === 'PDF' ? '#fef2f2' : '#ecfdf5',
                                padding: '2px 8px',
                                borderRadius: RADIUS.pill,
                              }}
                            >
                              {report.format}
                            </span>
                          </td>
                          <td
                            className="px-5 py-4 text-gray-500"
                            style={{ fontSize: TYPE.caption }}
                          >
                            {report.size}
                          </td>
                          <td className="px-5 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              style={{
                                borderRadius: RADIUS.button,
                                fontSize: TYPE.caption,
                              }}
                              onClick={() => toast.success(`Downloading ${report.name}...`)}
                            >
                              <Download style={{ width: 14, height: 14, marginRight: 6 }} />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════════════ SCHEDULES TAB ════════════════ */}
            <TabsContent value="schedules" className="mt-6 space-y-6">
              <SectionHeader
                icon={Calendar}
                title="Scheduled Reports"
                subtitle="Automated report generation and distribution"
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: GRID.spacing.sm,
                }}
              >
                {REPORT_SCHEDULES.map((schedule) => {
                  const freqColors = FREQUENCY_COLORS[schedule.frequency] || FREQUENCY_COLORS.Weekly;

                  return (
                    <Card
                      key={schedule.id}
                      className="border-0"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                        opacity: schedule.active ? 1 : 0.65,
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4
                              className="font-bold text-gray-900"
                              style={{ fontSize: TYPE.meta, lineHeight: 1.3 }}
                            >
                              {schedule.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className="font-medium"
                                style={{
                                  fontSize: TYPE.micro,
                                  color: freqColors.text,
                                  backgroundColor: freqColors.bg,
                                  padding: '2px 8px',
                                  borderRadius: RADIUS.pill,
                                }}
                              >
                                {schedule.frequency}
                              </span>
                            </div>
                          </div>

                          {/* Toggle (visual only) */}
                          <div
                            style={{
                              width: 40,
                              height: 22,
                              borderRadius: RADIUS.pill,
                              backgroundColor: schedule.active ? '#10b981' : COLORS.gray[300],
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: RADIUS.pill,
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: 3,
                                left: schedule.active ? 21 : 3,
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar style={{ width: 14, height: 14, color: COLORS.gray[400] }} />
                            <span style={{ fontSize: TYPE.caption, color: COLORS.gray[600] }}>
                              Next: {schedule.nextRun}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail style={{ width: 14, height: 14, color: COLORS.gray[400] }} />
                            <span style={{ fontSize: TYPE.caption, color: COLORS.gray[600] }}>
                              {schedule.recipients} recipient{schedule.recipients !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ExecutiveTabSection>
        </motion.div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveReports;
