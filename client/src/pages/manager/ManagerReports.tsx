/**
 * Manager Reports — Simplified
 * Tabbed layout: Generate | History | Schedules
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState, Sparkline } from './primitives';
import { glassCard } from './managerConstants';
import {
  RADIUS, TYPE, GRID, MOTION, COLORS, SHADOW, GLASS,
  fadeInUp, staggerContainer, staggerCards,
} from '@/lib/heritageDesignSystem';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  FileBarChart, BarChart3, Target, DollarSign, Activity, FileText,
  Download, Calendar, Clock, Shield, ClipboardList, FileCheck,
  Zap, LineChart, ChevronDown, Table2, Sheet, Search,
  X, Star, RefreshCw, Sparkles, Plus, Trash2,
  MoreHorizontal, Mail, CircleCheck, CheckSquare, Square,
  Share2, Users,
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────
type ReportCategory = 'performance' | 'pipeline' | 'financial' | 'compliance' | 'ai';
type TabValue = 'generate' | 'history' | 'schedules';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: typeof BarChart3;
  category: ReportCategory;
  preview: { metrics: string[] };
  chartData: number[];
  favorited?: boolean;
  aiRecommended?: string;
}

interface RecentReport {
  id: string;
  name: string;
  date: string;
  category: ReportCategory;
  size: string;
  generatedIn: string;
  dataScope: string;
  freshness: string;
  sharedWith?: string[];
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly';
  nextRun: string;
  enabled: boolean;
  format: string;
  recipients: string[];
  lastRun?: string;
}

// ─── CATEGORY CONFIG ────────────────────────────────────────
const CATEGORY_STYLES: Record<ReportCategory, { bg: string; text: string; label: string }> = {
  performance: { bg: 'rgba(16, 185, 129, 0.10)', text: '#059669', label: 'Performance' },
  pipeline: { bg: 'rgba(59, 130, 246, 0.10)', text: '#2563eb', label: 'Pipeline' },
  financial: { bg: 'rgba(139, 92, 246, 0.10)', text: '#7c3aed', label: 'Financial' },
  compliance: { bg: 'rgba(239, 68, 68, 0.10)', text: '#dc2626', label: 'Compliance' },
  ai: { bg: 'rgba(245, 158, 11, 0.10)', text: '#d97706', label: 'AI Insights' },
};

const CATEGORY_FILTERS: { value: ReportCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'performance', label: 'Performance' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'financial', label: 'Financial' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'ai', label: 'AI Insights' },
];

// ─── REPORT TYPES (with AI recommendations absorbed) ─────────
const REPORT_TYPES: ReportType[] = [
  { id: 'r1', name: 'Team Performance Summary', description: 'Comprehensive team metrics — quota attainment, call volume, close rates, and agent rankings', icon: BarChart3, category: 'performance', preview: { metrics: ['112% avg quota', '8.4 calls/day', '34% close rate', '12 active reps'] }, chartData: [65, 72, 68, 85, 78, 92, 88], aiRecommended: 'Team quota is at 112% — 8 agents above target' },
  { id: 'r2', name: 'Pipeline Health Report', description: 'Pipeline stages, deal flow velocity, conversion rates, and stale deal identification', icon: Target, category: 'pipeline', preview: { metrics: ['$847K total pipeline', '24 new leads', '62% conversion', '18-day avg age'] }, chartData: [45, 52, 58, 48, 62, 55, 71] },
  { id: 'r3', name: 'Commission Report', description: 'Commission calculations, pending payouts, chargeback risks, and split adjustments', icon: DollarSign, category: 'financial', preview: { metrics: ['$18.7K pending', '$142K paid YTD', '15.2% avg rate', '3 chargeback risks'] }, chartData: [12, 18, 15, 22, 19, 25, 21], aiRecommended: '3 agents have commissions at chargeback risk' },
  { id: 'r4', name: 'Activity Report', description: 'Call logs, email volume, meeting cadence, talk time, and engagement scoring', icon: Activity, category: 'performance', preview: { metrics: ['342 calls/week', '89 emails sent', '24 meetings', '4.1 hrs avg talk'] }, chartData: [38, 42, 35, 48, 45, 52, 49] },
  { id: 'r5', name: 'Training Compliance Report', description: 'Certification status, expiring certs, overdue agents, and CE credit tracking', icon: Shield, category: 'compliance', preview: { metrics: ['83% compliant', '4 certs expiring', '2 overdue agents', '96 modules done'] }, chartData: [78, 80, 82, 79, 83, 85, 83] },
  { id: 'r6', name: 'Activity Log Report', description: 'Complete event log — policy changes, system access, client interactions, and compliance actions', icon: ClipboardList, category: 'compliance', preview: { metrics: ['1,248 events', '98% captured', '12 agents tracked', '30-day window'] }, chartData: [92, 88, 95, 91, 94, 97, 98] },
  { id: 'r7', name: 'Regulatory Compliance Report', description: 'Pre-built templates for carrier audits, state filings, and regulatory submissions', icon: FileCheck, category: 'compliance', preview: { metrics: ['3 templates ready', '100% audit pass', '0 violations', 'Q4 filed'] }, chartData: [100, 100, 98, 100, 100, 100, 100] },
  { id: 'r8', name: 'Sales Velocity Report', description: 'Deal velocity, cycle length, throughput analysis, and bottleneck identification', icon: Zap, category: 'pipeline', preview: { metrics: ['$19.8K/day velocity', '18-day avg cycle', '42% win rate', '62 active deals'] }, chartData: [15, 18, 16, 22, 19, 24, 20], aiRecommended: 'Pipeline velocity increased 18% this week' },
  { id: 'r9', name: 'Forecast Accuracy', description: 'Projected vs actual revenue with accuracy trends and coverage ratio analysis', icon: LineChart, category: 'financial', preview: { metrics: ['87% accuracy', '$312K forecast', '3.2x coverage', '6-month trend'] }, chartData: [82, 85, 84, 88, 86, 89, 87] },
  { id: 'r10', name: 'AI Agent Insights', description: 'AI-generated performance predictions, churn risks, coaching opportunities, and deal scoring', icon: Sparkles, category: 'ai', preview: { metrics: ['3 churn risks', '2 coaching opps', '78% prediction acc', '12 agents scored'] }, chartData: [70, 74, 72, 78, 75, 80, 78] },
];

// ─── RECENT REPORTS ─────────────────────────────────────────
const RECENT_REPORTS: RecentReport[] = [
  { id: 'rec1', name: 'Training Compliance — Feb 2026', date: 'Mar 1, 2026', category: 'compliance', size: '2.4 MB', generatedIn: '2.3s', dataScope: '12 agents, 96 modules', freshness: '5 hrs ago' },
  { id: 'rec2', name: 'Team Performance — Feb 2026', date: 'Feb 28, 2026', category: 'performance', size: '3.1 MB', generatedIn: '3.8s', dataScope: '12 agents, 847 deals', freshness: '2 days ago' },
  { id: 'rec3', name: 'Regulatory Audit — Q4 2025', date: 'Feb 26, 2026', category: 'compliance', size: '1.8 MB', generatedIn: '1.9s', dataScope: '12 agents, 142 policies', freshness: '1 week ago' },
  { id: 'rec4', name: 'Pipeline Health — Week 8', date: 'Feb 24, 2026', category: 'pipeline', size: '2.7 MB', generatedIn: '2.6s', dataScope: '62 active deals', freshness: '10 days ago' },
  { id: 'rec5', name: 'Commission Report — January', date: 'Feb 1, 2026', category: 'financial', size: '1.5 MB', generatedIn: '1.4s', dataScope: '12 agents, $142K', freshness: '1 month ago' },
  { id: 'rec6', name: 'Activity Report — Q4 Summary', date: 'Jan 15, 2026', category: 'performance', size: '4.2 MB', generatedIn: '5.1s', dataScope: '12 agents, 3 months', freshness: '2 months ago' },
  { id: 'rec7', name: 'AI Insights — February', date: 'Mar 2, 2026', category: 'ai', size: '1.1 MB', generatedIn: '4.2s', dataScope: '12 agents, 30-day window', freshness: '4 hrs ago' },
];

// ─── SCHEDULED REPORTS ──────────────────────────────────────
const INITIAL_SCHEDULES: ScheduledReport[] = [
  { id: 's1', name: 'Team Performance Summary', frequency: 'Weekly', nextRun: 'Mar 10, 2026', enabled: true, format: 'PDF', recipients: ['You'], lastRun: 'Mar 3, 2026' },
  { id: 's2', name: 'Training Compliance Summary', frequency: 'Weekly', nextRun: 'Mar 10, 2026', enabled: true, format: 'PDF', recipients: ['You', 'Director'], lastRun: 'Mar 3, 2026' },
  { id: 's3', name: 'Pipeline Health Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: true, format: 'CSV', recipients: ['You'], lastRun: 'Mar 1, 2026' },
  { id: 's4', name: 'Regulatory Audit Report', frequency: 'Quarterly', nextRun: 'Apr 1, 2026', enabled: true, format: 'PDF', recipients: ['You', 'Compliance'], lastRun: 'Jan 1, 2026' },
  { id: 's5', name: 'Commission Report', frequency: 'Monthly', nextRun: 'Apr 1, 2026', enabled: false, format: 'XLSX', recipients: ['You', 'Finance'], lastRun: 'Feb 1, 2026' },
];

// ─── EXPORT FORMATS ─────────────────────────────────────────
const EXPORT_FORMATS = [
  { label: 'PDF', icon: FileText },
  { label: 'CSV', icon: Table2 },
  { label: 'XLSX', icon: Sheet },
] as const;

// ─── EXPORT CONTENT GENERATOR ────────────────────────────────
const MOCK_CSV: Record<ReportCategory, string> = {
  performance: `Agent,Quota Attainment,Calls/Day,Close Rate,Revenue MTD,Ranking
Sarah Mitchell,128%,9.2,38%,$48200,1
Marcus Johnson,118%,8.8,35%,$42100,2
Emily Chen,115%,10.1,33%,$39800,3
David Park,112%,7.6,36%,$37500,4
Rachel Adams,108%,8.4,31%,$35200,5
James Wilson,104%,7.2,29%,$31800,6
Lisa Rodriguez,98%,6.8,28%,$28900,7
Tom Anderson,95%,9.0,25%,$26400,8
Nina Patel,92%,5.9,32%,$24100,9
Chris Murphy,88%,6.1,24%,$21700,10
Amy Foster,84%,5.4,22%,$19300,11
Kevin Brooks,78%,4.8,20%,$16800,12`,
  pipeline: `Deal ID,Client,Stage,Value,Age (Days),Probability,Assigned To,Last Activity
D-1042,Hartfield Industries,$125000,Proposal Sent,12,75%,Sarah Mitchell,Mar 4 2026
D-1038,Meridian Group,$89000,Needs Analysis,8,60%,Marcus Johnson,Mar 3 2026
D-1035,Apex Solutions,$67500,Qualification,22,40%,Emily Chen,Feb 28 2026
D-1029,Pinnacle Corp,$142000,Negotiation,5,85%,David Park,Mar 5 2026
D-1024,Summit LLC,$53000,Proposal Sent,15,70%,Rachel Adams,Mar 2 2026
D-1019,Horizon Partners,$98000,Needs Analysis,18,55%,James Wilson,Feb 27 2026
D-1015,Crestview Inc,$76000,Qualification,25,35%,Lisa Rodriguez,Feb 25 2026
D-1011,Beacon Financial,$114000,Negotiation,3,90%,Tom Anderson,Mar 5 2026`,
  financial: `Agent,Gross Commission,Pending Payout,Clawback Risk,Split Adjustments,Net Commission,YTD Total
Sarah Mitchell,$4820,$1200,$0,$0,$4820,$38200
Marcus Johnson,$4210,$890,$0,$0,$4210,$33400
Emily Chen,$3980,$750,$420,$-150,$3410,$29800
David Park,$3750,$1100,$0,$0,$3750,$28200
Rachel Adams,$3520,$680,$0,$200,$3720,$26400
James Wilson,$3180,$520,$850,$0,$2330,$22100
Lisa Rodriguez,$2890,$440,$0,$0,$2890,$19800
Tom Anderson,$2640,$980,$0,$-100,$2540,$18200
Nina Patel,$2410,$350,$0,$0,$2410,$16500
Chris Murphy,$2170,$290,$1200,$0,$970,$14200
Amy Foster,$1930,$180,$0,$0,$1930,$12800
Kevin Brooks,$1680,$150,$0,$0,$1680,$10400`,
  compliance: `Agent,Certification Status,Expiring Certs,CE Credits Done,CE Credits Required,Overdue Items,Last Audit,Compliance Score
Sarah Mitchell,Current,0,24,24,0,Feb 15 2026,100%
Marcus Johnson,Current,1,22,24,0,Feb 15 2026,96%
Emily Chen,Current,0,24,24,0,Feb 15 2026,100%
David Park,Warning,2,18,24,1,Feb 15 2026,82%
Rachel Adams,Current,0,24,24,0,Feb 15 2026,100%
James Wilson,Current,1,20,24,0,Feb 15 2026,92%
Lisa Rodriguez,Overdue,0,12,24,3,Feb 15 2026,58%
Tom Anderson,Current,0,24,24,0,Feb 15 2026,100%
Nina Patel,Current,0,22,24,0,Feb 15 2026,96%
Chris Murphy,Warning,1,16,24,2,Feb 15 2026,72%
Amy Foster,Current,0,24,24,0,Feb 15 2026,100%
Kevin Brooks,Current,0,20,24,0,Feb 15 2026,88%`,
  ai: `Agent,Churn Risk,Predicted Revenue,Coaching Score,Deal Win Probability,Sentiment Trend,Prediction Accuracy
Sarah Mitchell,Low,$52000,92,82%,Positive,89%
Marcus Johnson,Low,$46000,88,78%,Positive,85%
Emily Chen,Medium,$38000,76,65%,Neutral,82%
David Park,Low,$41000,84,75%,Positive,87%
Rachel Adams,Medium,$33000,72,58%,Declining,78%
James Wilson,High,$28000,64,42%,Declining,74%
Lisa Rodriguez,High,$24000,58,35%,Declining,71%
Tom Anderson,Low,$30000,80,70%,Positive,83%
Nina Patel,Medium,$26000,70,55%,Neutral,76%
Chris Murphy,High,$20000,52,30%,Declining,68%
Amy Foster,Medium,$22000,66,48%,Neutral,73%
Kevin Brooks,High,$18000,48,25%,Declining,65%`,
};

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getExportContent(name: string, category: ReportCategory, format: string): { content: string; filename: string; mimeType: string } {
  const safeFilename = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
  const csvData = MOCK_CSV[category];

  if (format === 'CSV') {
    return { content: csvData, filename: `${safeFilename}.csv`, mimeType: 'text/csv' };
  }
  if (format === 'XLSX') {
    const tsvData = csvData.replace(/,/g, '\t');
    return { content: tsvData, filename: `${safeFilename}.xls`, mimeType: 'application/vnd.ms-excel' };
  }
  // PDF → formatted text
  const lines = csvData.split('\n');
  const header = lines[0].split(',');
  const divider = header.map((h) => '-'.repeat(h.length + 4)).join('+');
  const pdfContent = [
    `${'═'.repeat(55)}`,
    `  ${name}`,
    `  Heritage Life Solutions — Manager Report`,
    `  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `${'═'.repeat(55)}`,
    '',
    header.map((h) => h.padEnd(h.length + 4)).join('| '),
    divider,
    ...lines.slice(1).map((line) => {
      const cols = line.split(',');
      return cols.map((c, i) => c.padEnd((header[i]?.length || c.length) + 4)).join('| ');
    }),
    '',
    `${'─'.repeat(55)}`,
    `  Total rows: ${lines.length - 1}`,
    `  Confidential — Heritage Life Solutions`,
    `${'─'.repeat(55)}`,
  ].join('\n');
  return { content: pdfContent, filename: `${safeFilename}.txt`, mimeType: 'text/plain' };
}

// MiniChart replaced by shared Sparkline from primitives

// ─── TAB CONFIG ─────────────────────────────────────────────
const TABS: { value: TabValue; label: string; icon: typeof FileBarChart }[] = [
  { value: 'generate', label: 'Generate', icon: FileBarChart },
  { value: 'history', label: 'History', icon: Clock },
  { value: 'schedules', label: 'Schedules', icon: Calendar },
];

// ─── COMPONENT ──────────────────────────────────────────────
export function ManagerReports() {
  const [activeTab, setActiveTab] = useState<TabValue>('generate');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
  const [reports, setReports] = useState<ReportType[]>(REPORT_TYPES);
  const [recentReports, setRecentReports] = useState<RecentReport[]>(RECENT_REPORTS);
  const [schedules, setSchedules] = useState<ScheduledReport[]>(INITIAL_SCHEDULES);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRecent, setSelectedRecent] = useState<Set<string>>(new Set());
  const [exportingId, setExportingId] = useState<string | null>(null);
  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedName, setNewSchedName] = useState('');
  const [newSchedFreq, setNewSchedFreq] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [newSchedFormat, setNewSchedFormat] = useState('PDF');
  const [newSchedRecipients, setNewSchedRecipients] = useState<Set<string>>(new Set(['You']));

  // Close action menu on outside click
  useEffect(() => {
    if (!actionMenuFor) return;
    const handler = () => setActionMenuFor(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [actionMenuFor]);

  // Reset select mode when switching tabs
  useEffect(() => {
    setSelectMode(false);
    setSelectedRecent(new Set());
  }, [activeTab]);

  // ─── Filtered reports ───────────────────────────────────
  const filteredReports = useMemo(() => {
    let result = reports;
    if (categoryFilter !== 'all') result = result.filter((r) => r.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => (b.favorited ? 1 : 0) - (a.favorited ? 1 : 0));
  }, [reports, categoryFilter, searchQuery]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: reports.length };
    reports.forEach((r) => { c[r.category] = (c[r.category] || 0) + 1; });
    return c;
  }, [reports]);

  // ─── Computed stats ─────────────────────────────────────
  const totalGenerated = recentReports.length;
  const scheduledCount = schedules.filter((s) => s.enabled).length;

  // ─── Handlers ───────────────────────────────────────────
  const handleGenerate = useCallback((report: ReportType) => {
    setGeneratingId(report.id);
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGeneratingId(null);
            setGenerationProgress(0);
            const newRecent: RecentReport = {
              id: `rec-${Date.now()}`,
              name: `${report.name} — Mar 2026`,
              date: 'Just now',
              category: report.category,
              size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
              generatedIn: `${(Math.random() * 3 + 1).toFixed(1)}s`,
              dataScope: '12 agents',
              freshness: 'Just now',
            };
            setRecentReports((prev) => [newRecent, ...prev]);
            toast.success(`${report.name} generated`, { description: 'Switch to History to view and export' });
          }, 300);
          return 100;
        }
        return p + 8;
      });
    }, 80);
  }, []);

  const handleToggleFavorite = (id: string) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, favorited: !r.favorited } : r));
  };

  const handleExport = useCallback((reportId: string, name: string, format: string, category: ReportCategory) => {
    setActionMenuFor(null);
    setExportingId(reportId);
    setTimeout(() => {
      const { content, filename, mimeType } = getExportContent(name, category, format);
      triggerDownload(content, filename, mimeType);
      setExportingId(null);
      toast.success(`Downloaded ${filename}`);
    }, 600);
  }, []);

  const handleBulkExport = useCallback((format: string) => {
    const selected = recentReports.filter((r) => selectedRecent.has(r.id));
    const combined = selected.map((r) => {
      const { content } = getExportContent(r.name, r.category, format);
      return `\n${'='.repeat(60)}\n${r.name}\n${'='.repeat(60)}\n${content}`;
    }).join('\n\n');
    const ext = format === 'CSV' ? 'csv' : format === 'XLSX' ? 'xls' : 'txt';
    const mime = format === 'CSV' ? 'text/csv' : format === 'XLSX' ? 'application/vnd.ms-excel' : 'text/plain';
    triggerDownload(combined, `Heritage_Bulk_Export_${selected.length}_Reports.${ext}`, mime);
    toast.success(`Downloaded ${selected.length} reports as ${format}`);
    setSelectedRecent(new Set());
    setSelectMode(false);
  }, [recentReports, selectedRecent]);

  const handleShare = useCallback((reportId: string, reportName: string, target: string) => {
    setActionMenuFor(null);
    setRecentReports((prev) => prev.map((r) => {
      if (r.id !== reportId) return r;
      const existing = r.sharedWith || [];
      if (existing.includes(target)) return r;
      return { ...r, sharedWith: [...existing, target] };
    }));
    toast.success(`${reportName} shared with ${target}`);
  }, []);

  const toggleRecentSelect = (id: string) => {
    setSelectedRecent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleScheduleToggle = (id: string) => {
    setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast.success('Schedule removed');
  };

  const handleAddSchedule = useCallback(() => {
    if (!newSchedName.trim()) { toast.error('Select a report to schedule'); return; }
    const nextDate = newSchedFreq === 'Weekly' ? 'Mar 13, 2026' : newSchedFreq === 'Monthly' ? 'Apr 1, 2026' : 'Jul 1, 2026';
    const newSched: ScheduledReport = {
      id: `s-${Date.now()}`,
      name: newSchedName,
      frequency: newSchedFreq,
      nextRun: nextDate,
      enabled: true,
      format: newSchedFormat,
      recipients: Array.from(newSchedRecipients),
    };
    setSchedules((prev) => [newSched, ...prev]);
    setShowScheduleModal(false);
    setNewSchedName('');
    setNewSchedFreq('Weekly');
    setNewSchedFormat('PDF');
    setNewSchedRecipients(new Set(['You']));
    toast.success(`Scheduled "${newSched.name}"`, { description: `${newSched.frequency} · Next: ${newSched.nextRun}` });
  }, [newSchedName, newSchedFreq, newSchedFormat, newSchedRecipients]);

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
          subtitle="Generate, export, and schedule team reports"
        />

        {/* ── Stat Cards ────────────────────────────────────── */}
        <motion.div variants={staggerCards} initial="hidden" animate="visible">
          <ManagerStatCardGrid>
            <ManagerStatCard icon={FileBarChart} value={totalGenerated} label="Reports Generated" delta={5} periodLabel="vs last month" />
            <ManagerStatCard icon={Calendar} value={scheduledCount} label="Active Schedules" delta={1} periodLabel="vs last month" />
            <ManagerStatCard icon={BarChart3} value={10} label="Available Reports" delta={2} periodLabel="New this quarter" />
            <ManagerStatCard icon={Star} value={reports.filter((r) => r.favorited).length} label="Favorites" />
          </ManagerStatCardGrid>
        </motion.div>

        {/* ── Tab Navigation ──────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center p-1 gap-1 w-fit" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            {TABS.map(({ value, label, icon: TabIcon }) => {
              const isActive = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex items-center gap-2 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{
                    fontSize: TYPE.meta, padding: '4px 12px',
                    borderRadius: RADIUS.button, cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <TabIcon style={{ width: 16, height: 16 }} />
                  {label}
                  {value === 'history' && recentReports.length > 0 && (
                    <span className="ml-1 h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                      {recentReports.length}
                    </span>
                  )}
                  {value === 'schedules' && scheduledCount > 0 && (
                    <span className="ml-1 h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                      {scheduledCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════ */}
        {/* ── GENERATE TAB ──────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'generate' && (
          <>
            {/* Search Bar */}
            <motion.div variants={fadeInUp}>
              <div className="relative">
                <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-gray-700 placeholder:text-gray-400"
                  style={{ ...glassCard, padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px ${GRID.spacing.sm}px 36px`, borderRadius: RADIUS.card, fontSize: TYPE.meta, border: `1px solid ${COLORS.gray[200]}`, outline: 'none' }}
                />
                {searchQuery && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchQuery('')} className="absolute text-gray-400 hover:text-gray-600" style={{ right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                    <X style={{ width: 14, height: 14 }} />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-wrap items-center p-1 gap-1 w-fit" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = categoryFilter === cat.value;
                  const count = categoryCounts[cat.value] || 0;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategoryFilter(cat.value)}
                      className={`flex items-center gap-2 font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                      style={{
                        borderRadius: RADIUS.button, padding: '4px 12px', fontSize: TYPE.meta, cursor: 'pointer',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {cat.label}
                      {count > 0 && (
                        <span className="h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Report List */}
            <motion.div
              variants={fadeInUp}
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}
            >
              <div className="flex items-center" style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm, gap: GRID.spacing.sm, borderBottom: `1px solid ${GLASS.border}` }}>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                  <FileBarChart className="text-amber-200 drop-shadow-sm" style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Report Library</p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} available</p>
                </div>
              </div>
              <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {filteredReports.length === 0 && (
                  <ManagerEmptyState icon={FileBarChart} title="No reports found" description="Try adjusting your search or category filter." />
                )}
                {filteredReports.map((report) => {
                  const catStyle = CATEGORY_STYLES[report.category];
                  const isGenerating = generatingId === report.id;
                  const isExpanded = expandedReport === report.id;

                  return (
                    <motion.div
                      key={report.id}
                      layout
                      whileHover={!isExpanded ? { backgroundColor: COLORS.gray[50] } : {}}
                      style={{ borderRadius: RADIUS.button, backgroundColor: isExpanded ? COLORS.gray[50] : 'transparent', marginBottom: 2 }}
                    >
                      <div className="flex items-center cursor-pointer" style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm }} onClick={() => setExpandedReport(isExpanded ? null : report.id)}>
                        {/* Favorite star */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(report.id); }}
                          className="flex-shrink-0"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star style={{ width: 15, height: 15, color: report.favorited ? '#f59e0b' : COLORS.gray[300], fill: report.favorited ? '#f59e0b' : 'none', transition: 'all 0.2s' }} />
                        </motion.button>

                        {/* Icon */}
                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                          <report.icon className="text-amber-200" style={{ width: 16, height: 16 }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                            <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta, lineHeight: 1.3 }}>{report.name}</p>
                            <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: catStyle.bg, color: catStyle.text, lineHeight: 1.5 }}>
                              {catStyle.label}
                            </span>
                            {/* AI Recommended badge — absorbed from AI Insights card */}
                            {report.aiRecommended && (
                              <span className="flex items-center font-medium" style={{ gap: 3, fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: 'rgba(245, 158, 11, 0.10)', color: '#d97706', lineHeight: 1.5 }}>
                                <Sparkles style={{ width: 10, height: 10 }} />
                                Suggested
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500" style={{ fontSize: TYPE.meta, lineHeight: 1.4 }}>{report.description}</p>
                          {/* AI recommendation reason */}
                          {report.aiRecommended && (
                            <p className="text-amber-600" style={{ fontSize: TYPE.caption, marginTop: 2 }}>{report.aiRecommended}</p>
                          )}
                        </div>

                        {/* Generate button */}
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); handleGenerate(report); }}
                          className="flex items-center font-semibold text-white border-0 flex-shrink-0"
                          style={{ gap: 4, fontSize: TYPE.caption, padding: '6px 14px', borderRadius: RADIUS.pill, cursor: isGenerating ? 'default' : 'pointer', background: isGenerating ? COLORS.gray[400] : 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: isGenerating ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)' }}
                          whileHover={isGenerating ? {} : { scale: 1.04 }}
                          whileTap={isGenerating ? {} : { scale: 0.96 }}
                          disabled={!!isGenerating}
                        >
                          {isGenerating ? <><RefreshCw style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> Generating...</> : <><FileBarChart style={{ width: 12, height: 12 }} /> Generate</>}
                        </motion.button>

                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-300 flex-shrink-0">
                          <ChevronDown style={{ width: 16, height: 16 }} />
                        </motion.div>
                      </div>

                      {/* Generation progress bar */}
                      {isGenerating && (
                        <div style={{ padding: `0 ${GRID.spacing.sm}px ${GRID.spacing.xs}px` }}>
                          <div style={{ height: 4, borderRadius: 2, backgroundColor: COLORS.gray[200], overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: `${generationProgress}%` }}
                              style={{ height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)', borderRadius: 2 }}
                            />
                          </div>
                          <p className="text-gray-400 text-right" style={{ fontSize: TYPE.micro, marginTop: 2 }}>{generationProgress}%</p>
                        </div>
                      )}

                      {/* Expanded preview */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: MOTION.easing }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: `0 ${GRID.spacing.sm}px ${GRID.spacing.md}px`, paddingLeft: GRID.spacing.sm + 15 + GRID.spacing.sm + GRID.spacing.xl + GRID.spacing.sm }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                                {report.preview.metrics.map((m) => (
                                  <div key={m} className="text-center font-semibold" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, color: '#059669', fontSize: TYPE.caption }}>
                                    {m}
                                  </div>
                                ))}
                              </div>
                              <div style={{ borderRadius: RADIUS.button, overflow: 'hidden', backgroundColor: 'white', border: `1px solid ${COLORS.gray[200]}`, padding: `${GRID.spacing.xs}px` }}>
                                <Sparkline data={[...report.chartData]} width={120} height={36} showArea />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ── HISTORY TAB ───────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <motion.div
            variants={fadeInUp}
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}
          >
            {/* Header with Select toggle */}
            <div className="flex items-center" style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm, gap: GRID.spacing.sm, borderBottom: `1px solid ${GLASS.border}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                <Clock className="text-amber-200 drop-shadow-sm" style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Generated Reports</p>
                <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{recentReports.length} reports</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedRecent(new Set()); }}
                className="flex items-center font-medium"
                style={{ gap: 4, fontSize: TYPE.meta, padding: `5px 12px`, borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer', background: selectMode ? 'rgba(16, 185, 129, 0.12)' : COLORS.gray[100], color: selectMode ? '#059669' : COLORS.gray[600], transition: 'all 0.15s' }}
              >
                <CheckSquare style={{ width: 13, height: 13 }} />
                {selectMode ? `${selectedRecent.size} selected` : 'Select'}
              </motion.button>
            </div>

            {/* Bulk action bar — only in select mode with selections */}
            <AnimatePresence>
              {selectMode && selectedRecent.size > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="flex items-center flex-wrap" style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, gap: GRID.spacing.xs, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(4, 120, 87, 0.06) 100%)', borderBottom: `1px solid ${GLASS.border}` }}>
                    <span className="font-semibold text-emerald-700" style={{ fontSize: TYPE.caption }}>Export {selectedRecent.size} as:</span>
                    <div className="flex-1" />
                    {EXPORT_FORMATS.map(({ label, icon: FmtIcon }) => (
                      <motion.button key={label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleBulkExport(label)}
                        className="flex items-center font-medium text-gray-600 hover:text-emerald-600"
                        style={{ gap: 4, fontSize: TYPE.caption, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                      >
                        <FmtIcon style={{ width: 12, height: 12 }} /> {label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Report rows */}
            <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 700, overflowY: 'auto' }}>
              {recentReports.length === 0 && (
                <ManagerEmptyState icon={Clock} title="No reports yet" description="Generate a report from the Generate tab." />
              )}
              {recentReports.map((report) => {
                const catStyle = CATEGORY_STYLES[report.category];
                return (
                  <motion.div
                    key={report.id}
                    className="flex items-center"
                    style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm, borderRadius: RADIUS.button }}
                    whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                  >
                    {/* Checkbox — only in select mode */}
                    {selectMode && (
                      <motion.button initial={{ scale: 0, width: 0 }} animate={{ scale: 1, width: 'auto' }} exit={{ scale: 0, width: 0 }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => toggleRecentSelect(report.id)} className="flex-shrink-0" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        {selectedRecent.has(report.id)
                          ? <CheckSquare className="text-emerald-500" style={{ width: 15, height: 15 }} />
                          : <Square className="text-gray-300" style={{ width: 15, height: 15 }} />
                        }
                      </motion.button>
                    )}

                    <FileText className="text-gray-400 flex-shrink-0" style={{ width: 18, height: 18 }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center flex-wrap" style={{ gap: GRID.spacing.xs, marginBottom: 2 }}>
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{report.name}</p>
                        <span className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: catStyle.bg, color: catStyle.text }}>
                          {catStyle.label}
                        </span>
                        {/* Shared badges */}
                        {report.sharedWith && report.sharedWith.map((s) => (
                          <span key={s} className="font-medium" style={{ fontSize: 9, padding: `1px 5px`, borderRadius: RADIUS.pill, backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#2563eb' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        {report.date} · {report.size} · {report.freshness}
                      </p>
                    </div>

                    {/* Single action menu (...) — consolidated export + share */}
                    <div className="relative">
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); setActionMenuFor(actionMenuFor === report.id ? null : report.id); }}
                        className="flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                        style={{ width: 32, height: 32, borderRadius: RADIUS.button, border: `1px solid ${COLORS.gray[200]}`, background: 'white', cursor: 'pointer' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {exportingId === report.id
                          ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} className="text-emerald-500" />
                          : <MoreHorizontal style={{ width: 16, height: 16 }} />
                        }
                      </motion.button>
                      <AnimatePresence>
                        {actionMenuFor === report.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            className="absolute z-50"
                            style={{ top: '100%', right: 0, marginTop: 4, width: 200, backgroundColor: 'white', borderRadius: RADIUS.card, boxShadow: '0 12px 36px rgba(0,0,0,0.15)', border: `1px solid ${COLORS.gray[200]}`, overflow: 'hidden' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Export section */}
                            <div style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                              <p className="text-gray-400 font-semibold" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Export</p>
                            </div>
                            {EXPORT_FORMATS.map(({ label, icon: FmtIcon }) => (
                              <button key={label} onClick={() => handleExport(report.id, report.name, label, report.category)} className="flex items-center w-full hover:bg-gray-50" style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, fontSize: TYPE.meta, color: COLORS.gray[700], background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                <FmtIcon style={{ width: 14, height: 14, color: '#059669' }} />
                                Download {label}
                              </button>
                            ))}
                            {/* Share section */}
                            <div style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, borderBottom: `1px solid ${COLORS.gray[100]}`, borderTop: `1px solid ${COLORS.gray[100]}` }}>
                              <p className="text-gray-400 font-semibold" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Share</p>
                            </div>
                            {[{ key: 'Director', label: 'Director' }, { key: 'Team', label: 'Team' }, { key: 'Finance', label: 'Finance' }, { key: 'Compliance', label: 'Compliance' }].map(({ key, label }) => {
                              const alreadyShared = report.sharedWith?.includes(key);
                              return (
                                <button key={key} onClick={() => handleShare(report.id, report.name, key)} className="flex items-center w-full hover:bg-gray-50" style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`, fontSize: TYPE.meta, color: alreadyShared ? '#059669' : COLORS.gray[700], background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                  {alreadyShared ? <CircleCheck style={{ width: 14, height: 14, color: '#059669' }} /> : <Share2 style={{ width: 14, height: 14, color: COLORS.gray[400] }} />}
                                  {alreadyShared ? `Shared with ${label}` : `Share with ${label}`}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ── SCHEDULES TAB ─────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'schedules' && (
          <motion.div
            variants={fadeInUp}
            style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}
          >
            {/* Header with New Schedule button */}
            <div className="flex items-center" style={{ padding: GRID.spacing.md, paddingBottom: GRID.spacing.sm, gap: GRID.spacing.sm, borderBottom: `1px solid ${GLASS.border}` }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                <Calendar className="text-amber-200 drop-shadow-sm" style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Scheduled Reports</p>
                <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{schedules.filter((s) => s.enabled).length} active</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center font-semibold text-white border-0 flex-shrink-0"
                style={{ gap: 4, fontSize: TYPE.caption, padding: '6px 14px', borderRadius: RADIUS.pill, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
              >
                <Plus style={{ width: 13, height: 13 }} /> New Schedule
              </motion.button>
            </div>

            {/* Schedule rows */}
            <div style={{ padding: GRID.spacing.sm, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {schedules.length === 0 && (
                <ManagerEmptyState icon={Calendar} title="No schedules" description="Create a schedule to auto-generate reports." />
              )}
              {schedules.map((sched) => (
                <motion.div
                  key={sched.id}
                  className="flex items-center"
                  style={{ padding: GRID.spacing.sm, gap: GRID.spacing.sm, borderRadius: RADIUS.button, opacity: sched.enabled ? 1 : 0.55 }}
                  whileHover={{ backgroundColor: COLORS.gray[50], transition: { duration: MOTION.duration.hover } }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{sched.name}</p>
                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                      {sched.frequency} · Next: {sched.nextRun} · {sched.format}
                      {sched.lastRun && ` · Last: ${sched.lastRun}`}
                    </p>
                  </div>
                  {/* Recipients */}
                  <div className="hidden sm:flex items-center flex-shrink-0" style={{ gap: 2 }}>
                    {sched.recipients.map((r) => (
                      <span key={r} className="font-medium" style={{ fontSize: TYPE.micro, padding: `2px ${GRID.spacing.xs}px`, borderRadius: RADIUS.pill, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#059669' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteSchedule(sched.id)}
                    className="text-gray-300 hover:text-rose-500 flex-shrink-0"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </motion.button>
                  {/* Toggle */}
                  <Switch checked={sched.enabled} onCheckedChange={() => handleScheduleToggle(sched.id)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ── SCHEDULE MODAL ────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showScheduleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: GRID.spacing.lg }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 440, backgroundColor: 'white', borderRadius: RADIUS.card, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.md}px ${GRID.spacing.md}px ${GRID.spacing.sm}px`, borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                  <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                    <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: RADIUS.button, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                      <Calendar className="text-amber-200 drop-shadow-sm" style={{ width: 20, height: 20 }} />
                    </div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>New Schedule</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                    <X style={{ width: 18, height: 18 }} />
                  </motion.button>
                </div>

                {/* Modal body */}
                <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                  {/* Report */}
                  <div>
                    <label className="text-gray-500 font-semibold" style={{ fontSize: TYPE.micro, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Report</label>
                    <select
                      value={newSchedName}
                      onChange={(e) => setNewSchedName(e.target.value)}
                      className="w-full text-gray-700"
                      style={{ padding: '10px 12px', borderRadius: RADIUS.button, border: `1px solid ${COLORS.gray[200]}`, fontSize: TYPE.meta, background: 'white', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                    >
                      <option value="">Select a report...</option>
                      {REPORT_TYPES.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>

                  {/* Frequency + Format side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GRID.spacing.sm }}>
                    <div>
                      <label className="text-gray-500 font-semibold" style={{ fontSize: TYPE.micro, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Frequency</label>
                      <div className="flex" style={{ gap: 4 }}>
                        {(['Weekly', 'Monthly', 'Quarterly'] as const).map((freq) => (
                          <motion.button
                            key={freq}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewSchedFreq(freq)}
                            className="font-medium flex-1"
                            style={{ padding: '8px 0', borderRadius: RADIUS.button, border: 'none', cursor: 'pointer', fontSize: TYPE.caption, background: newSchedFreq === freq ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'white', color: newSchedFreq === freq ? 'white' : COLORS.gray[600], boxShadow: newSchedFreq === freq ? '0 2px 8px rgba(16, 185, 129, 0.25)' : `inset 0 0 0 1px ${COLORS.gray[200]}`, transition: 'all 0.15s' }}
                          >
                            {freq}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 font-semibold" style={{ fontSize: TYPE.micro, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Format</label>
                      <div className="flex" style={{ gap: 4 }}>
                        {['PDF', 'CSV', 'XLSX'].map((fmt) => (
                          <motion.button
                            key={fmt}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewSchedFormat(fmt)}
                            className="font-medium flex-1"
                            style={{ padding: '8px 0', borderRadius: RADIUS.button, border: 'none', cursor: 'pointer', fontSize: TYPE.caption, background: newSchedFormat === fmt ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'white', color: newSchedFormat === fmt ? 'white' : COLORS.gray[600], boxShadow: newSchedFormat === fmt ? '0 2px 8px rgba(16, 185, 129, 0.25)' : `inset 0 0 0 1px ${COLORS.gray[200]}`, transition: 'all 0.15s' }}
                          >
                            {fmt}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div>
                    <label className="text-gray-500 font-semibold" style={{ fontSize: TYPE.micro, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Send to</label>
                    <div className="flex flex-wrap" style={{ gap: 6 }}>
                      {['You', 'Director', 'Finance', 'Compliance'].map((r) => {
                        const active = newSchedRecipients.has(r);
                        return (
                          <motion.button
                            key={r}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setNewSchedRecipients((prev) => {
                              const next = new Set(prev);
                              if (next.has(r) && r !== 'You') next.delete(r); else next.add(r);
                              return next;
                            })}
                            className="flex items-center font-medium"
                            style={{ gap: 4, fontSize: TYPE.meta, padding: '6px 14px', borderRadius: RADIUS.pill, border: 'none', cursor: r === 'You' ? 'default' : 'pointer', background: active ? 'rgba(16, 185, 129, 0.12)' : 'white', color: active ? '#059669' : COLORS.gray[500], boxShadow: active ? 'none' : `inset 0 0 0 1px ${COLORS.gray[200]}`, transition: 'all 0.15s' }}
                          >
                            {active && <CircleCheck style={{ width: 12, height: 12 }} />}
                            {r}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-end" style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px ${GRID.spacing.md}px`, gap: GRID.spacing.xs }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowScheduleModal(false)}
                    className="font-medium text-gray-500 hover:text-gray-700"
                    style={{ fontSize: TYPE.meta, padding: '8px 18px', borderRadius: RADIUS.pill, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddSchedule}
                    className="flex items-center font-semibold text-white border-0"
                    style={{ gap: 5, fontSize: TYPE.meta, padding: '9px 22px', borderRadius: RADIUS.pill, cursor: 'pointer', background: newSchedName ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : COLORS.gray[300], boxShadow: newSchedName ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none', transition: 'all 0.2s' }}
                  >
                    <Calendar style={{ width: 14, height: 14 }} /> Create Schedule
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerReports;
