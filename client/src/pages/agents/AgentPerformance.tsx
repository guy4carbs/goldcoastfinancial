import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Target,
  Phone,
  CheckCircle2,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  PieChart,
  Activity,
  Inbox,
  Layers,
} from "lucide-react";
import { cn, daysSinceDate, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

const STALE_DAYS = 7;
const AVG_DEAL_VALUE = 1850;

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: COLORS.semantic.info, bgColor: COLORS.semantic.info },
  contacted: { label: "Contacted", color: COLORS.semantic.warning, bgColor: COLORS.semantic.warning },
  qualified: { label: "Qualified", color: COLORS.primary.violet[600], bgColor: COLORS.primary.violet[500] },
  proposal: { label: "Proposal", color: COLORS.semantic.success, bgColor: COLORS.semantic.success },
  closed: { label: "Closed", color: COLORS.semantic.success, bgColor: COLORS.semantic.success },
  lost: { label: "Lost", color: COLORS.gray[600], bgColor: COLORS.gray[500] },
};

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

function getTimePeriodDays(period: TimePeriod): number {
  switch (period) {
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
  }
}

function getTimePeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'quarter': return 'This Quarter';
    case 'year': return 'This Year';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeCSVField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Demo data
const DEMO_PRODUCT_BREAKDOWN: any[] = [];

const DEMO_LEAD_SOURCE_ROI = [
  { source: 'Company Leads', leads: 45, conversions: 12, conversionRate: 26.7, totalSpent: 450, revenue: 18500, roi: 4011, avgDealSize: 1542, color: 'bg-blue-500' },
  { source: 'Self-Generated', leads: 28, conversions: 9, conversionRate: 32.1, totalSpent: 200, revenue: 14200, roi: 7000, avgDealSize: 1578, color: 'bg-green-500' },
  { source: 'Referrals', leads: 15, conversions: 6, conversionRate: 40.0, totalSpent: 0, revenue: 8600, roi: Infinity, avgDealSize: 1433, color: 'bg-violet-500' },
  { source: 'Website/Digital', leads: 35, conversions: 4, conversionRate: 11.4, totalSpent: 350, revenue: 5200, roi: 1386, avgDealSize: 1300, color: 'bg-amber-500' },
];

function generateStatements() {
  const now = new Date();
  const statements = [];
  for (let i = 0; i < 4; i++) {
    const qDate = new Date(now);
    qDate.setMonth(qDate.getMonth() - (i * 3));
    const q = Math.ceil((qDate.getMonth() + 1) / 3);
    const year = qDate.getFullYear();
    const issueDate = new Date(year, q * 3, 10);
    statements.push({
      period: `Q${q} ${year}`,
      date: issueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: 9600 + Math.floor(Math.random() * 3000),
    });
  }
  return statements;
}

export default function AgentPerformance() {
  const { leads, earnings, addLead, updateLeadStatus, addActivityToLead } = useAgentStore();
  const { trackAgentPipelineUpdated, trackAgentLeadStatusChanged } = useAnalytics();

  const [activeTab, setActiveTab] = useState('earnings');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  // Real performance data from API — re-fetches when time period changes
  const { data: perfData } = useQuery<any>({
    queryKey: [`/api/commissions/performance?period=${timePeriod}`],
  });
  const [showAddLead, setShowAddLead] = useState(false);
  const [initialStage, setInitialStage] = useState<string>('new');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const periodDays = getTimePeriodDays(timePeriod);
  const periodLabel = getTimePeriodLabel(timePeriod);

  // Filter leads by time period
  const periodLeads = useMemo(() => {
    return leads.filter(l => {
      if (!l.createdDate) return true;
      return daysSinceDate(l.createdDate) <= periodDays;
    });
  }, [leads, periodDays]);

  // Filter earnings by time period
  const filteredEarnings = useMemo(() => {
    return earnings.filter(e => {
      if (!e.date) return true;
      return daysSinceDate(e.date) <= periodDays;
    });
  }, [earnings, periodDays]);

  // Pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const stages = {
      new: periodLeads.filter(l => l.status === 'new'),
      contacted: periodLeads.filter(l => l.status === 'contacted'),
      qualified: periodLeads.filter(l => l.status === 'qualified'),
      proposal: periodLeads.filter(l => l.status === 'proposal'),
      closed: periodLeads.filter(l => l.status === 'closed'),
      lost: periodLeads.filter(l => l.status === 'lost'),
    };

    const stageData = [
      { name: 'New', key: 'new', count: stages.new.length, value: stages.new.length * AVG_DEAL_VALUE, color: 'bg-blue-500', conversionRate: 80, avgAge: 2 },
      { name: 'Contacted', key: 'contacted', count: stages.contacted.length, value: stages.contacted.length * AVG_DEAL_VALUE, color: 'bg-yellow-500', conversionRate: 67, avgAge: 5 },
      { name: 'Qualified', key: 'qualified', count: stages.qualified.length, value: stages.qualified.length * AVG_DEAL_VALUE, color: 'bg-purple-500', conversionRate: 63, avgAge: 10 },
      { name: 'Proposal', key: 'proposal', count: stages.proposal.length, value: stages.proposal.length * AVG_DEAL_VALUE, color: 'bg-green-500', conversionRate: 60, avgAge: 15 },
      { name: 'Closed', key: 'closed', count: stages.closed.length, value: stages.closed.length * AVG_DEAL_VALUE, color: 'bg-emerald-500', conversionRate: null, avgAge: 18 },
    ];

    const totalLeads = periodLeads.filter(l => l.status !== 'lost').length;
    const closedDeals = stages.closed.length;
    const overallConversion = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;
    const totalPipelineValue = stageData.slice(0, 4).reduce((sum, s) => sum + s.value, 0);

    return { stages: stageData, totalLeads, closedDeals, overallConversion, totalPipelineValue, avgDealValue: AVG_DEAL_VALUE, avgCycleTime: 12 };
  }, [periodLeads]);

  // Earnings metrics — use real API data if available, fallback to store
  const earningsMetrics = useMemo(() => {
    if (perfData?.pending) {
      return {
        pending: perfData.pending,
        paid: perfData.paid,
        clawback: perfData.clawback || { count: 0, total: 0 },
        netTotal: perfData.netTotal || 0,
        ytd: perfData.ytd || 0,
      };
    }

    // Fallback to Zustand store data
    const pending = filteredEarnings.filter(e => e.status === 'pending');
    const paid = filteredEarnings.filter(e => e.status === 'paid');
    const clawback = filteredEarnings.filter(e => e.status === 'clawback');

    const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0);
    const paidTotal = paid.reduce((sum, e) => sum + e.amount, 0);
    const clawbackTotal = clawback.reduce((sum, e) => sum + e.amount, 0);
    const netTotal = pendingTotal + paidTotal - clawbackTotal;

    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const ytdEarnings = earnings.filter(e => e.date >= yearStart && e.status !== 'clawback');
    const ytdClawbacks = earnings.filter(e => e.date >= yearStart && e.status === 'clawback');
    const ytdTotal = ytdEarnings.reduce((sum, e) => sum + e.amount, 0) - ytdClawbacks.reduce((sum, e) => sum + e.amount, 0);

    return {
      pending: { count: pending.length, total: pendingTotal },
      paid: { count: paid.length, total: paidTotal },
      clawback: { count: clawback.length, total: clawbackTotal },
      netTotal,
      ytd: ytdTotal || 0,
    };
  }, [filteredEarnings, earnings, perfData]);

  // Monthly earnings trend — use API data if available
  const monthlyTrend = useMemo(() => {
    if (perfData?.monthlyTrend) {
      return perfData.monthlyTrend;
    }
    // Fallback to store-based calculation
    const months: { month: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const monthEarnings = earnings.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= date && eDate <= monthEnd && e.status !== 'clawback';
      });
      const amount = monthEarnings.reduce((s, e) => s + e.amount, 0);
      months.push({ month: monthLabel, amount: Math.max(0, amount) });
    }
    return months;
  }, [earnings, perfData]);

  // At-risk deals
  const atRiskDeals = useMemo(() => {
    return leads
      .filter(l => {
        if (l.status === 'closed' || l.status === 'lost' || l.status === 'new') return false;
        if (!l.lastContactDate) return true;
        return daysSinceDate(l.lastContactDate) > STALE_DAYS;
      })
      .slice(0, 5);
  }, [leads]);

  const statements = useMemo(() => generateStatements(), []);
  const maxCount = Math.max(...pipelineMetrics.stages.map(s => s.count), 1);
  const maxMonthly = Math.max(...monthlyTrend.map((m: any) => m.amount), 1);

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => {
    addLead({ ...leadData, status: initialStage as Lead['status'] });
    trackAgentPipelineUpdated('lead_added');
    toast.success('Lead added to pipeline');
  };

  const handleExport = () => {
    try {
      const headers = ['Policy Number', 'Client', 'Product', 'Amount', 'Status', 'Date'];
      const rows = filteredEarnings.map(e => [
        escapeCSVField(e.policyNumber),
        escapeCSVField(e.clientName),
        escapeCSVField(e.product),
        escapeCSVField(e.amount),
        escapeCSVField(e.status),
        escapeCSVField(e.date)
      ]);
      const csv = [headers.map(escapeCSVField).join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${timePeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleDownloadStatement = (period: string, amount: number) => {
    toast.success(`Downloading ${period} Statement`, {
      description: `Commission statement for $${amount.toLocaleString()}`
    });
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Activity}
            title="Performance"
            subtitle="Track your pipeline, earnings, and analytics"
          >
            <div className="flex items-center gap-3">
              <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                <SelectTrigger
                  className="w-[150px] text-white font-medium transition-all hover:bg-white/30"
                  style={{
                    borderRadius: RADIUS.button,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ borderRadius: RADIUS.card }}>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              {activeTab === 'earnings' && (
                <Button
                  variant="ghost"
                  onClick={handleExport}
                  className="text-white font-medium transition-all hover:bg-white/30"
                  style={{
                    borderRadius: RADIUS.button,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div
              className="flex gap-1 p-1 w-fit"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {[
                { value: 'earnings', label: 'Earnings', icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all",
                    activeTab === tab.value
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  style={{ borderRadius: RADIUS.button }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pipeline Tab - Removed */}
            <TabsContent value="pipeline_removed" className="hidden">
              {/* Summary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Users, label: "Total Pipeline", value: pipelineMetrics.totalLeads, subtext: `active leads` },
                      { icon: DollarSign, label: "Pipeline Value", value: `$${(pipelineMetrics.totalPipelineValue / 1000).toFixed(1)}K`, subtext: "potential revenue" },
                      { icon: Target, label: "Conversion Rate", value: `${pipelineMetrics.overallConversion}%`, subtext: "overall" },
                      { icon: Clock, label: "Avg. Cycle Time", value: `${pipelineMetrics.avgCycleTime}`, subtext: "days to close" }
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                      >
                        <Card
                          className="overflow-hidden border-0 relative h-full"
                          style={{
                            borderRadius: RADIUS.card,
                            boxShadow: SHADOW.hero,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                          }}
                        >
                          <CardContent className="p-4 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                <stat.icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-white/90">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-white/70 mt-1">{stat.subtext}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Funnel Visualization */}
                  <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Sales Funnel</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pipelineMetrics.stages.map((stage, idx) => {
                          const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
                          // Gradient from violet to amber based on stage
                          const stageColors = [
                            'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', // New - violet
                            'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)', // Contacted - purple
                            'linear-gradient(90deg, #6d28d9 0%, #7c3aed 100%)', // Qualified - deep purple
                            'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', // Proposal - amber
                            'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)', // Closed - dark amber
                          ];
                          return (
                            <div key={stage.name} className="flex items-center gap-4">
                              <div className="w-24 text-sm font-semibold text-gray-700">{stage.name}</div>
                              <div className="flex-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${widthPercent}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  className="h-10 flex items-center justify-between px-4"
                                  style={{
                                    background: stageColors[idx],
                                    borderRadius: RADIUS.button,
                                  }}
                                >
                                  <span className="text-white font-semibold text-sm">{stage.count} leads</span>
                                  <span className="text-white/90 text-sm font-medium">${(stage.value / 1000).toFixed(1)}K</span>
                                </motion.div>
                              </div>
                              <div className="w-20 text-right">
                                {stage.conversionRate !== null ? (
                                  <Badge
                                    className="bg-violet-100 text-violet-700 font-medium"
                                    style={{ borderRadius: RADIUS.pill }}
                                  >
                                    {stage.conversionRate}%
                                  </Badge>
                                ) : (
                                  <Badge
                                    className="bg-amber-100 text-amber-700 font-medium"
                                    style={{ borderRadius: RADIUS.pill }}
                                  >
                                    Won
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* At-Risk Deals */}
                  {atRiskDeals.length > 0 ? (
                    <Card
                      className="overflow-hidden border-0"
                      style={{
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center shadow-lg"
                            style={{
                              borderRadius: RADIUS.button,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            }}
                          >
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-gray-800">At-Risk Deals</span>
                          <Badge
                            className="bg-amber-600 text-white font-medium ml-auto"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            {atRiskDeals.length} stale
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-amber-800 mb-4">
                          These leads haven't been contacted in over {STALE_DAYS} days.
                        </p>
                        <div className="space-y-2">
                          {atRiskDeals.map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between p-3 bg-white/80 backdrop-blur cursor-pointer hover:bg-white transition-colors"
                              style={{ borderRadius: RADIUS.button }}
                              onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}
                              tabIndex={0}
                              role="button"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 flex items-center justify-center text-white font-medium text-sm"
                                  style={{
                                    borderRadius: RADIUS.button,
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  }}
                                >
                                  {lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-800">{lead.name}</p>
                                  <p className="text-xs text-gray-600">
                                    <Badge
                                      className="text-[10px] mr-1.5 px-1.5 py-0 bg-violet-100 text-violet-700"
                                      style={{ borderRadius: RADIUS.pill }}
                                    >
                                      {statusConfig[lead.status]?.label}
                                    </Badge>
                                    Last: {lead.lastContactDate ? formatRelativeDate(lead.lastContactDate) : 'Never'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="text-white font-medium shadow-md"
                                style={{
                                  borderRadius: RADIUS.button,
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                }}
                                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${lead.phone}`; }}
                              >
                                <Phone className="w-4 h-4 mr-1" /> Call
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      className="overflow-hidden border-0"
                      style={{
                        borderRadius: RADIUS.card,
                        boxShadow: SHADOW.card,
                        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold text-violet-800">All leads are healthy</p>
                        <p className="text-sm text-violet-600 mt-1">No stale leads. Keep up the good work!</p>
                      </CardContent>
                    </Card>
                  )}
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-6 mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                  <Card
                    className="overflow-hidden border-0 relative h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.hero,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                    }}
                  >
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-white">${earningsMetrics.pending.total.toLocaleString()}</p>
                      <p className="text-xs text-white/70 mt-1">{earningsMetrics.pending.count} policies</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                  <Card
                    className="overflow-hidden border-0 relative h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.hero,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                    }}
                  >
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">Paid</span>
                      </div>
                      <p className="text-2xl font-bold text-white">${earningsMetrics.paid.total.toLocaleString()}</p>
                      <p className="text-xs text-white/70 mt-1">{earningsMetrics.paid.count} policies</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                  <Card
                    className="overflow-hidden border-0 relative h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.hero,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                    }}
                  >
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">Net Total</span>
                      </div>
                      <p className="text-2xl font-bold text-white">${earningsMetrics.netTotal.toLocaleString()}</p>
                      <p className="text-xs text-white/70 mt-1">{periodLabel.toLowerCase()}</p>
                      {earningsMetrics.clawback.total > 0 && (
                        <p className="text-[10px] text-red-200 mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />-${earningsMetrics.clawback.total.toLocaleString()} clawbacks
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover }}>
                  <Card
                    className="overflow-hidden border-0 relative h-full"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.hero,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                    }}
                  >
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">YTD</span>
                      </div>
                      <p className="text-2xl font-bold text-white">${earningsMetrics.ytd.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-white/80" />
                        <span className="text-xs text-white/80 font-medium">+18% YoY</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Monthly Trend */}
                  <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Earnings Trend (6 Months)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-3 h-40">
                        {monthlyTrend.map((month: any, idx: number) => (
                          <div key={month.month} className="flex-1 h-full flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${(month.amount / maxMonthly) * 100}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className="w-full min-h-[4px]"
                              style={{
                                borderRadius: `${RADIUS.button}px ${RADIUS.button}px 0 0`,
                                background: idx === monthlyTrend.length - 1
                                  ? 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)'
                                  : 'linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%)',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-3">
                        {monthlyTrend.map((month: any, idx: number) => (
                          <div key={month.month} className="flex-1 text-center">
                            <p className={cn("text-xs font-semibold", idx === monthlyTrend.length - 1 ? "text-violet-600" : "text-gray-600")}>
                              ${(month.amount / 1000).toFixed(1)}K
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{month.month}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Commissions */}
                  <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Recent Commissions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredEarnings.length === 0 ? (
                        <div className="text-center py-12">
                          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-600 font-medium">No earnings recorded</p>
                          <p className="text-sm text-gray-400 mt-1">Commission entries will appear here as policies are sold</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy</th>
                                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(perfData?.recentCommissions || filteredEarnings.slice(0, 10)).map((entry: any) => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-violet-50/50 transition-colors">
                                  <td className="p-3"><span className="text-sm font-mono text-gray-600">{entry.policyNumber || entry.source || '—'}</span></td>
                                  <td className="p-3"><span className="text-sm font-medium text-gray-800">{entry.clientName}</span></td>
                                  <td className="p-3"><span className="text-sm text-gray-600">{entry.product}</span></td>
                                  <td className="p-3 text-right">
                                    <span className={cn("text-sm font-bold", entry.status === 'clawback' ? "text-red-600" : "text-violet-600")}>
                                      {entry.status === 'clawback' ? '-' : ''}${(entry.amount || 0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge
                                      className={cn("text-[10px] font-medium",
                                        entry.status === 'paid' && "bg-violet-100 text-violet-700 border-violet-200",
                                        entry.status === 'pending' && "bg-amber-100 text-amber-700 border-amber-200",
                                        entry.status === 'clawback' && "bg-red-100 text-red-700 border-red-200"
                                      )}
                                      style={{ borderRadius: RADIUS.pill }}
                                    >
                                      {(entry.status || 'pending').charAt(0).toUpperCase() + (entry.status || 'pending').slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right"><span className="text-sm text-gray-500">{formatDate(entry.date)}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Product Breakdown */}
                  <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <PieChart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">By Product</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(perfData?.productBreakdown || DEMO_PRODUCT_BREAKDOWN).map((item: any, idx: number) => (
                          <div key={item.product}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{item.product}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{item.percent}%</span>
                                <span className="text-sm font-bold text-violet-600">${(item.amount / 1000).toFixed(1)}K</span>
                              </div>
                            </div>
                            <div
                              className="h-2 w-full bg-gray-100 overflow-hidden"
                              style={{ borderRadius: RADIUS.pill }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full"
                                style={{
                                  background: 'linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%)',
                                  borderRadius: RADIUS.pill,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statements */}
                  <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Statements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {statements.map((statement) => (
                          <button
                            key={statement.period}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-violet-50 transition-colors cursor-pointer w-full text-left group"
                            style={{ borderRadius: RADIUS.button }}
                            onClick={() => handleDownloadStatement(statement.period, statement.amount)}
                          >
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{statement.period}</p>
                              <p className="text-xs text-gray-500">{statement.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-violet-600">${statement.amount.toLocaleString()}</span>
                              <Download className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Commission Info */}
                  <Card
                    className="overflow-hidden border-0 relative"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                      background: 'linear-gradient(135deg, #ede9fe 0%, #fef3c7 100%)',
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 flex items-center justify-center shadow-lg"
                          style={{
                            borderRadius: RADIUS.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Commission Info</span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Schedule</span>
                          <span className="font-semibold text-gray-800">Weekly (Fridays)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Min. Payout</span>
                          <span className="font-semibold text-gray-800">$100</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Direct Deposit</span>
                          <Badge
                            className="bg-violet-100 text-violet-700 border-violet-200 font-medium"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab - Removed */}
            <TabsContent value="analytics_removed" className="hidden">
              {/* Lead Source ROI */}
              <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center shadow-lg"
                      style={{
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Lead Source ROI Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_LEAD_SOURCE_ROI.map((source, idx) => (
                      <div
                        key={source.source}
                        className="p-4 bg-gray-50 hover:bg-violet-50/50 transition-colors"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3"
                              style={{
                                borderRadius: RADIUS.pill,
                                background: idx % 2 === 0 ? '#8b5cf6' : '#f59e0b',
                              }}
                            />
                            <span className="font-semibold text-gray-800">{source.source}</span>
                          </div>
                          <Badge
                            className={cn("font-medium",
                              source.roi === Infinity ? "bg-violet-100 text-violet-700" :
                              source.roi >= 1000 ? "bg-violet-100 text-violet-700" :
                              "bg-amber-100 text-amber-700"
                            )}
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            {source.roi === Infinity ? '∞' : `${source.roi}%`} ROI
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                          <div><p className="text-gray-500 text-xs font-medium">Leads</p><p className="font-bold text-gray-800">{source.leads}</p></div>
                          <div><p className="text-gray-500 text-xs font-medium">Conversions</p><p className="font-bold text-gray-800">{source.conversions}</p></div>
                          <div><p className="text-gray-500 text-xs font-medium">Conv. Rate</p><p className={cn("font-bold", source.conversionRate >= 30 ? "text-violet-600" : "text-gray-800")}>{source.conversionRate}%</p></div>
                          <div><p className="text-gray-500 text-xs font-medium">Cost</p><p className="font-bold text-gray-800">${source.totalSpent.toLocaleString()}</p></div>
                          <div><p className="text-gray-500 text-xs font-medium">Revenue</p><p className="font-bold text-violet-600">${source.revenue.toLocaleString()}</p></div>
                        </div>
                        <div className="mt-3">
                          <div
                            className="h-2 w-full bg-gray-200 overflow-hidden"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(source.conversions / source.leads) * 100}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className="h-full"
                              style={{
                                background: 'linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%)',
                                borderRadius: RADIUS.pill,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-4 p-4"
                    style={{
                      borderRadius: RADIUS.button,
                      background: 'linear-gradient(135deg, #ede9fe 0%, #fef3c7 100%)',
                    }}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        }}
                      >
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700">
                        <strong className="text-violet-700">Recommendation:</strong> Referrals have the highest conversion rate (40%) and infinite ROI. Focus on building your referral network.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Mix */}
              <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center shadow-lg"
                      style={{
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      }}
                    >
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Product Mix Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue Distribution</h4>
                      <div className="space-y-4">
                        {(perfData?.productBreakdown || DEMO_PRODUCT_BREAKDOWN).map((product: any, idx: number) => (
                          <div key={product.product}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3"
                                  style={{
                                    borderRadius: RADIUS.pill,
                                    background: idx % 2 === 0 ? '#8b5cf6' : '#f59e0b',
                                  }}
                                />
                                <span className="text-sm font-medium text-gray-700">{product.product}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{product.percent}%</span>
                                <span className="text-sm font-bold text-violet-600">${(product.amount / 1000).toFixed(1)}K</span>
                              </div>
                            </div>
                            <div
                              className="h-3 w-full bg-gray-100 overflow-hidden"
                              style={{ borderRadius: RADIUS.pill }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${product.percent}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full"
                                style={{
                                  background: 'linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%)',
                                  borderRadius: RADIUS.pill,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        {(perfData?.productBreakdown || DEMO_PRODUCT_BREAKDOWN).map((product: any) => (
                          <div
                            key={product.product}
                            className="p-3 bg-gray-50 hover:bg-violet-50/50 transition-colors"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm text-gray-800">{product.product}</span>
                              <Badge
                                className="bg-violet-100 text-violet-700 font-medium"
                                style={{ borderRadius: RADIUS.pill }}
                              >
                                {product.policies} policies
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500 font-medium">Avg Premium</span>
                                <p className="font-bold text-gray-800">${product.avgPremium.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Avg Commission</span>
                                <p className="font-bold text-violet-600">${product.avgCommission.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Insights</h4>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div
                        className="p-3"
                        style={{
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-violet-600" />
                          <span className="text-xs font-semibold text-violet-800">Top Volume</span>
                        </div>
                        <p className="text-sm text-violet-700">Term Life leads with 12 policies</p>
                      </div>
                      <div
                        className="p-3"
                        style={{
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-800">Highest Commission</span>
                        </div>
                        <p className="text-sm text-amber-700">IUL averages $760/policy</p>
                      </div>
                      <div
                        className="p-3"
                        style={{
                          borderRadius: RADIUS.button,
                          background: 'linear-gradient(135deg, #ede9fe 0%, #fef3c7 100%)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-violet-600" />
                          <span className="text-xs font-semibold text-violet-800">Growth Opportunity</span>
                        </div>
                        <p className="text-sm text-violet-700">Consider expanding Whole Life sales</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trends */}
              <Card className="overflow-hidden border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center shadow-lg"
                      style={{
                        borderRadius: RADIUS.button,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      }}
                    >
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Performance Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                      <Card
                        className="overflow-hidden border-0 relative h-full"
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.hero,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                        }}
                      >
                            <CardContent className="p-4 relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white/90">New Leads</span>
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-white">+23%</p>
                          <p className="text-xs text-white/70 mt-1">vs last {timePeriod}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                      <Card
                        className="overflow-hidden border-0 relative h-full"
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.hero,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                        }}
                      >
                            <CardContent className="p-4 relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white/90">Close Rate</span>
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-white">+8%</p>
                          <p className="text-xs text-white/70 mt-1">vs last {timePeriod}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                      <Card
                        className="overflow-hidden border-0 relative h-full"
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.hero,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)',
                        }}
                      >
                            <CardContent className="p-4 relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white/90">Avg Deal Size</span>
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-white">-5%</p>
                          <p className="text-xs text-white/70 mt-1">vs last {timePeriod}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <AddLeadModal open={showAddLead} onOpenChange={setShowAddLead} onAddLead={handleAddLead} />
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdateStatus={(leadId: string, status: Lead['status']) => {
          const oldStatus = selectedLead?.status || 'unknown';
          updateLeadStatus(leadId, status);
          trackAgentLeadStatusChanged(leadId, oldStatus, status);
          trackAgentPipelineUpdated('status_changed', leadId);
          toast.success(`Lead moved to ${statusConfig[status]?.label || status}`);
        }}
        onAddActivity={(leadId: string, activity) => {
          addActivityToLead(leadId, activity);
          trackAgentPipelineUpdated('activity_added', leadId);
          toast.success('Activity logged');
        }}
      />
    </AgentLoungeLayout>
  );
}
