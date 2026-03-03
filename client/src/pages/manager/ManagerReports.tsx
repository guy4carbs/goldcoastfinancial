/**
 * Manager Reports
 * Generate insights and track team metrics
 * Heritage Design System — Emerald theme
 */

import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { RADIUS, TYPE, GRID, LAYOUT, MOTION, COLORS, SHADOW, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileBarChart,
  BarChart3,
  Target,
  DollarSign,
  Activity,
  FileText,
  Download,
  Calendar,
  Clock,
  Shield,
  ClipboardList,
  FileCheck,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const reportTypes = [
  {
    name: 'Team Performance Summary',
    description: 'Comprehensive team metrics overview',
    icon: BarChart3,
  },
  {
    name: 'Pipeline Health Report',
    description: 'Pipeline stages and deal flow analysis',
    icon: Target,
  },
  {
    name: 'Commission Report',
    description: 'Commission calculations and payouts',
    icon: DollarSign,
  },
  {
    name: 'Activity Report',
    description: 'Call logs, meetings, and engagement metrics',
    icon: Activity,
  },
  {
    name: 'Training Compliance Report',
    description: 'Certification status, expiring certs, and overdue agents',
    icon: Shield,
  },
  {
    name: 'Audit Trail Report',
    description: 'Complete history of all training activities',
    icon: ClipboardList,
  },
  {
    name: 'Regulatory Compliance Report',
    description: 'Pre-built templates for carrier and regulatory audits',
    icon: FileCheck,
  },
];

const recentReports = [
  { name: 'Training Compliance — Feb 2026', date: 'Mar 1, 2026' },
  { name: 'Team Performance — Feb 2026', date: 'Feb 28, 2026' },
  { name: 'Regulatory Audit — Q4 2025', date: 'Feb 26, 2026' },
  { name: 'Pipeline Health — Week 8', date: 'Feb 24, 2026' },
  { name: 'Commission Report — January', date: 'Feb 1, 2026' },
  { name: 'Activity Report — Q4 Summary', date: 'Jan 15, 2026' },
  { name: 'Team Performance — Jan 2026', date: 'Jan 31, 2026' },
];

const scheduledReports = [
  { name: 'Team Performance Summary', frequency: 'Weekly', nextRun: 'Mar 3, 2026', enabled: true },
  { name: 'Training Compliance Summary', frequency: 'Weekly', nextRun: 'Mar 3, 2026', enabled: true },
  { name: 'Pipeline Health Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: true },
  { name: 'Regulatory Audit Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: true },
  { name: 'Commission Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: false },
];

export function ManagerReports() {
  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}
      >
        {/* Hero */}
        <ManagerPageHero
          icon={FileBarChart}
          title="Reports"
          subtitle="Generate insights and track team metrics"
        />

        {/* Stat Cards */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid className="grid-cols-2 lg:grid-cols-3">
            <ManagerStatCard icon={FileBarChart} value="12" label="Reports Generated" />
            <ManagerStatCard icon={Calendar} value="3" label="Scheduled Reports" />
            <ManagerStatCard icon={Clock} value="Today" label="Last Generated" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* Main Content — 2 Column Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* Available Reports */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <FileBarChart className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Available Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {reportTypes.map((report) => (
                  <motion.div
                    key={report.name}
                    className="flex items-center"
                    style={{
                      gap: 12,
                      padding: 12,
                      borderRadius: RADIUS.button,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <report.icon className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.description}</p>
                    </div>
                    <motion.button
                      className="flex-shrink-0 font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                      style={{
                        fontSize: TYPE.meta,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generate
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <Clock className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Recent Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {recentReports.map((report) => (
                  <motion.div
                    key={report.name}
                    className="flex items-center"
                    style={{
                      gap: 12,
                      padding: 12,
                      borderRadius: RADIUS.button,
                    }}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    <FileText
                      className="text-gray-400 flex-shrink-0"
                      style={{ width: LAYOUT.icon.lg, height: LAYOUT.icon.lg }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.date}</p>
                    </div>
                    <motion.button
                      className="flex-shrink-0 flex items-center font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                      style={{
                        fontSize: TYPE.meta,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        gap: GRID.spacing.xs / 2,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                      Download
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scheduled Reports — Full Width */}
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
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <Calendar className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-gray-900">Scheduled Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {scheduledReports.map((report, idx) => (
                  <div
                    key={report.name}
                    className="flex items-center"
                    style={{
                      gap: 12,
                      padding: 12,
                      borderRadius: RADIUS.button,
                      borderTop: idx > 0 ? '1px solid' : 'none',
                      borderColor: idx > 0 ? COLORS.gray[100] : undefined,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">
                        {report.frequency} &middot; Next: {report.nextRun}
                      </p>
                    </div>
                    <span
                      className="text-xs text-gray-500 font-medium"
                      style={{
                        borderRadius: RADIUS.pill,
                        padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                        background: COLORS.gray[100],
                        border: 0,
                      }}
                    >
                      {report.frequency}
                    </span>
                    <Switch defaultChecked={report.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerReports;
