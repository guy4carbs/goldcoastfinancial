/**
 * Manager Reports
 * Generate insights and track team metrics
 * Heritage Design System — Emerald theme
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid } from './primitives';
import { glassCard } from './managerConstants';
import {
  RADIUS, TYPE, GRID, LAYOUT, MOTION, COLORS, SHADOW,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  FileBarChart, BarChart3, Target, DollarSign, Activity, FileText,
  Download, Calendar, Clock, Shield, ClipboardList, FileCheck,
  Zap, LineChart, ChevronDown, Table2, Sheet,
} from 'lucide-react';

/* ─── Report Types (7 existing + 3 new = 10) ─────────────── */
const reportTypes = [
  {
    name: 'Team Performance Summary',
    description: 'Comprehensive team metrics overview',
    icon: BarChart3,
    preview: { metrics: ['112% avg quota', '8.4 calls/day', '34% close rate', '12 active reps'] },
  },
  {
    name: 'Pipeline Health Report',
    description: 'Pipeline stages and deal flow analysis',
    icon: Target,
    preview: { metrics: ['$847K total pipeline', '24 new leads', '62% stage conversion', '18-day avg age'] },
  },
  {
    name: 'Commission Report',
    description: 'Commission calculations and payouts',
    icon: DollarSign,
    preview: { metrics: ['$18.7K pending', '$142K paid YTD', '15.2% avg rate', '3 clawback risks'] },
  },
  {
    name: 'Activity Report',
    description: 'Call logs, meetings, and engagement metrics',
    icon: Activity,
    preview: { metrics: ['342 calls/week', '89 emails sent', '24 meetings', '4.1 hrs avg talk'] },
  },
  {
    name: 'Training Compliance Report',
    description: 'Certification status, expiring certs, and overdue agents',
    icon: Shield,
    preview: { metrics: ['83% compliant', '4 certs expiring', '2 overdue agents', '96 modules done'] },
  },
  {
    name: 'Audit Trail Report',
    description: 'Complete history of all training activities',
    icon: ClipboardList,
    preview: { metrics: ['1,248 events logged', '98% captured', '12 agents tracked', '30-day window'] },
  },
  {
    name: 'Regulatory Compliance Report',
    description: 'Pre-built templates for carrier and regulatory audits',
    icon: FileCheck,
    preview: { metrics: ['3 templates ready', '100% audit pass', '0 violations', 'Q4 report filed'] },
  },
  {
    name: 'Sales Velocity Report',
    description: 'Deal velocity, cycle length, and throughput analysis',
    icon: Zap,
    preview: { metrics: ['$19.8K/day velocity', '18-day avg cycle', '42% win rate', '62 active deals'] },
  },
  {
    name: 'Activity Summary',
    description: 'Call logs, email volume, meeting cadence, and engagement',
    icon: Activity,
    preview: { metrics: ['285 calls/week', '94 emails sent', '18 appointments', '6.2 hrs avg active'] },
  },
  {
    name: 'Forecast Accuracy',
    description: 'Projected vs actual revenue with accuracy trends',
    icon: LineChart,
    preview: { metrics: ['87% accuracy', '$312K weighted forecast', '3.2x coverage ratio', '6-month trend'] },
  },
];

/* ─── Recent Reports ──────────────────────────────────────── */
const recentReports = [
  { name: 'Training Compliance — Feb 2026', date: 'Mar 1, 2026' },
  { name: 'Team Performance — Feb 2026', date: 'Feb 28, 2026' },
  { name: 'Regulatory Audit — Q4 2025', date: 'Feb 26, 2026' },
  { name: 'Pipeline Health — Week 8', date: 'Feb 24, 2026' },
  { name: 'Commission Report — January', date: 'Feb 1, 2026' },
  { name: 'Activity Report — Q4 Summary', date: 'Jan 15, 2026' },
  { name: 'Team Performance — Jan 2026', date: 'Jan 31, 2026' },
];

/* ─── Scheduled Reports ───────────────────────────────────── */
const scheduledReports = [
  { name: 'Team Performance Summary', frequency: 'Weekly', nextRun: 'Mar 3, 2026', enabled: true },
  { name: 'Training Compliance Summary', frequency: 'Weekly', nextRun: 'Mar 3, 2026', enabled: true },
  { name: 'Pipeline Health Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: true },
  { name: 'Regulatory Audit Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: true },
  { name: 'Commission Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: false },
];

/* ─── Mini Chart SVG ──────────────────────────────────────── */
const CHART_POINTS = [
  [0, 28], [25, 12], [50, 22], [75, 8], [100, 18],
] as const;

function MiniChart() {
  const width = 100;
  const height = 40;
  const points = CHART_POINTS;
  const linePoints = points.map(([x, y]) => `${(x / 100) * width},${y}`).join(' ');
  const areaPoints = `0,${height} ${points.map(([x, y]) => `${(x / 100) * width},${y}`).join(' ')} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: 40, display: 'block' }}
    >
      <defs>
        <linearGradient id="miniChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.15)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#miniChartFill)" />
      <polyline
        points={linePoints}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Export Format Options ────────────────────────────────── */
const exportFormats = [
  { label: 'PDF', icon: FileText },
  { label: 'CSV', icon: Table2 },
  { label: 'XLSX', icon: Sheet },
] as const;

/* ─── Glass card style shorthand ──────────────────────────── */
const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
} as const;

/* ================================================================
   COMPONENT
   ================================================================ */
export function ManagerReports() {
  const [hoveredReport, setHoveredReport] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* Auto-dismiss toast after 2 seconds */
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => setOpenDropdown(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [openDropdown]);

  const handleExport = (reportName: string, format: string) => {
    setToastMessage(`Exporting ${reportName} as ${format}...`);
    setOpenDropdown(null);
  };

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
          icon={FileBarChart}
          title="Reports"
          subtitle="Generate insights and track team metrics"
        />

        {/* ── Stat Cards (4) ────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerStatCardGrid>
            <ManagerStatCard icon={FileBarChart} value="15" label="Reports Generated" />
            <ManagerStatCard icon={Calendar} value="5" label="Scheduled Reports" />
            <ManagerStatCard icon={Zap} value="3" label="New Report Types" />
            <ManagerStatCard icon={Clock} value="Today" label="Last Generated" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Main Content — 2 Column Grid ──────────────────── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ── Available Reports ────────────────────────────── */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={glassCardStyle}
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
                    style={{ borderRadius: RADIUS.button, overflow: 'hidden' }}
                    onMouseEnter={() => setHoveredReport(report.name)}
                    onMouseLeave={() => setHoveredReport(null)}
                    whileHover={{
                      backgroundColor: COLORS.gray[50],
                      transition: { duration: MOTION.duration.hover },
                    }}
                  >
                    {/* Row */}
                    <div
                      className="flex items-center"
                      style={{ gap: 12, padding: 12 }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20"
                        style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                      >
                        <report.icon className="w-5 h-5 text-amber-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{report.name}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{report.description}</p>
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
                    </div>

                    {/* Hover Preview */}
                    <AnimatePresence>
                      {hoveredReport === report.name && report.preview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: `0 12px 12px 12px` }}>
                            {/* Metric Pills — 2x2 Grid */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: GRID.spacing.xs,
                                marginBottom: GRID.spacing.xs,
                              }}
                            >
                              {report.preview.metrics.map((metric) => (
                                <div
                                  key={metric}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: RADIUS.pill,
                                    padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.xs}px`,
                                    fontSize: TYPE.caption,
                                    color: '#059669',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    border: '1px solid rgba(16, 185, 129, 0.15)',
                                  }}
                                >
                                  {metric}
                                </div>
                              ))}
                            </div>
                            {/* Mini Chart */}
                            <div
                              style={{
                                borderRadius: RADIUS.input,
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.6)',
                              }}
                            >
                              <MiniChart />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Recent Reports ───────────────────────────────── */}
          <Card
            className="overflow-hidden border-0 h-full"
            style={{ ...glassCardStyle, position: 'relative' }}
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
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{report.name}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{report.date}</p>
                    </div>

                    {/* Split-Button Export Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        className="flex-shrink-0 flex items-center font-medium text-emerald-700 border border-emerald-200 bg-transparent"
                        style={{
                          fontSize: TYPE.meta,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          gap: GRID.spacing.xs / 2,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === report.name ? null : report.name);
                        }}
                      >
                        <Download style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                        Export
                        <ChevronDown
                          style={{
                            width: LAYOUT.icon.xs,
                            height: LAYOUT.icon.xs,
                            transition: 'transform 0.15s',
                            transform: openDropdown === report.name ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </motion.button>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {openDropdown === report.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: MOTION.duration.fast }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: 4,
                              zIndex: 50,
                              minWidth: 140,
                              background: 'rgba(255, 255, 255, 0.92)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              borderRadius: RADIUS.button,
                              boxShadow: '0 12px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
                              border: '1px solid rgba(0,0,0,0.06)',
                              overflow: 'hidden',
                            }}
                          >
                            {exportFormats.map((fmt) => {
                              const FmtIcon = fmt.icon;
                              return (
                                <button
                                  key={fmt.label}
                                  onClick={() => handleExport(report.name, fmt.label)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: GRID.spacing.xs,
                                    width: '100%',
                                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                                    fontSize: TYPE.meta,
                                    color: COLORS.gray[700],
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = COLORS.gray[50];
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                  }}
                                >
                                  <FmtIcon style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm, color: '#059669' }} />
                                  {fmt.label}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>

            {/* Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: MOTION.duration.fast }}
                  style={{
                    position: 'absolute',
                    bottom: GRID.spacing.sm,
                    left: GRID.spacing.sm,
                    right: GRID.spacing.sm,
                    background: '#059669',
                    color: 'white',
                    fontSize: TYPE.meta,
                    fontWeight: 600,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.button,
                    textAlign: 'center',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)',
                    zIndex: 60,
                  }}
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ── Scheduled Reports — Full Width ─────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card
            className="overflow-hidden border-0"
            style={glassCardStyle}
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
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{report.name}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                        {report.frequency} &middot; Next: {report.nextRun}
                      </p>
                    </div>
                    <span
                      className="text-gray-500 font-medium"
                      style={{
                        fontSize: TYPE.caption,
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
