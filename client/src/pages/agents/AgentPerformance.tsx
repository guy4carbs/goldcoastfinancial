import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const STALE_DAYS = 7;
const AVG_DEAL_VALUE = 1850;

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-600", bgColor: "bg-blue-500" },
  contacted: { label: "Contacted", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  qualified: { label: "Qualified", color: "text-purple-600", bgColor: "bg-purple-500" },
  proposal: { label: "Proposal", color: "text-green-600", bgColor: "bg-green-500" },
  closed: { label: "Closed", color: "text-emerald-600", bgColor: "bg-emerald-500" },
  lost: { label: "Lost", color: "text-gray-600", bgColor: "bg-gray-500" },
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
const DEMO_PRODUCT_BREAKDOWN = [
  { product: 'Term Life', amount: 18200, percent: 43, color: 'bg-blue-500', policies: 12, avgPremium: 1517, avgCommission: 287 },
  { product: 'Whole Life', amount: 12400, percent: 29, color: 'bg-green-500', policies: 6, avgPremium: 3200, avgCommission: 620 },
  { product: 'IUL', amount: 7600, percent: 18, color: 'bg-purple-500', policies: 3, avgPremium: 4800, avgCommission: 760 },
  { product: 'Final Expense', amount: 4400, percent: 10, color: 'bg-orange-500', policies: 8, avgPremium: 850, avgCommission: 165 },
];

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

  const [activeTab, setActiveTab] = useState('pipeline');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
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

  // Earnings metrics
  const earningsMetrics = useMemo(() => {
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
      ytd: ytdTotal || 42600,
    };
  }, [filteredEarnings, earnings]);

  // Monthly earnings trend
  const monthlyTrend = useMemo(() => {
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
      months.push({ month: monthLabel, amount: Math.max(0, amount) || (3200 + i * 400) });
    }
    return months;
  }, [earnings]);

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
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.amount), 1);

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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Performance</h1>
            <p className="text-sm text-gray-600">Track your pipeline, earnings, and analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            {activeTab === 'earnings' && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pipeline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="earnings" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Activity className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="space-y-6 mt-6">
              {/* Summary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Users, label: "Total Pipeline", value: pipelineMetrics.totalLeads, subtext: `active leads`, color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: DollarSign, label: "Pipeline Value", value: `$${(pipelineMetrics.totalPipelineValue / 1000).toFixed(1)}K`, subtext: "potential revenue", color: "text-green-600", bg: "bg-green-50" },
                      { icon: Target, label: "Conversion Rate", value: `${pipelineMetrics.overallConversion}%`, subtext: "overall", color: "text-purple-600", bg: "bg-purple-50" },
                      { icon: Clock, label: "Avg. Cycle Time", value: `${pipelineMetrics.avgCycleTime}`, subtext: "days to close", color: "text-orange-600", bg: "bg-orange-50" }
                    ].map((stat, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                          </div>
                          <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{stat.subtext}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Funnel Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-violet-500" />
                        Sales Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pipelineMetrics.stages.map((stage, idx) => {
                          const widthPercent = Math.max((stage.count / maxCount) * 100, 10);
                          return (
                            <div key={stage.name} className="flex items-center gap-4">
                              <div className="w-24 text-sm font-medium text-gray-700">{stage.name}</div>
                              <div className="flex-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${widthPercent}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  className={cn("h-10 rounded-lg flex items-center justify-between px-4", stage.color)}
                                >
                                  <span className="text-white font-medium text-sm">{stage.count} leads</span>
                                  <span className="text-white/80 text-sm">${(stage.value / 1000).toFixed(1)}K</span>
                                </motion.div>
                              </div>
                              <div className="w-20 text-right">
                                {stage.conversionRate !== null ? (
                                  <span className="text-sm text-gray-600">{stage.conversionRate}%</span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
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
                    <Card className="border-orange-200 bg-orange-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                          <AlertTriangle className="w-5 h-5" />
                          At-Risk Deals
                          <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
                            {atRiskDeals.length} stale
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-orange-700 mb-4">
                          These leads haven't been contacted in over {STALE_DAYS} days.
                        </p>
                        <div className="space-y-2">
                          {atRiskDeals.map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 cursor-pointer hover:shadow-sm transition-shadow"
                              onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}
                              tabIndex={0}
                              role="button"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium text-sm">
                                  {lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{lead.name}</p>
                                  <p className="text-xs text-gray-500">
                                    <Badge variant="outline" className={cn("text-[10px] mr-1.5 px-1.5 py-0", statusConfig[lead.status]?.color)}>
                                      {statusConfig[lead.status]?.label}
                                    </Badge>
                                    Last: {lead.lastContactDate ? formatRelativeDate(lead.lastContactDate) : 'Never'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-300 text-orange-700 hover:bg-orange-100"
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
                    <Card className="border-green-200 bg-green-50/50">
                      <CardContent className="p-6 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-700">All leads are healthy</p>
                        <p className="text-sm text-green-600 mt-1">No stale leads. Keep up the good work!</p>
                      </CardContent>
                    </Card>
                  )}
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-6 mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">${earningsMetrics.pending.total.toLocaleString()}</p>
                    <p className="text-xs text-yellow-600 mt-1">{earningsMetrics.pending.count} policies</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Paid</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">${earningsMetrics.paid.total.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">{earningsMetrics.paid.count} policies</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-medium text-primary">Net Total</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${earningsMetrics.netTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 mt-1">{periodLabel.toLowerCase()}</p>
                    {earningsMetrics.clawback.total > 0 && (
                      <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />-${earningsMetrics.clawback.total.toLocaleString()} clawbacks
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">YTD</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${earningsMetrics.ytd.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+18% YoY</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Monthly Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                        Earnings Trend (6 Months)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-4 h-40">
                        {monthlyTrend.map((month, idx) => (
                          <div key={month.month} className="flex-1 h-full flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${(month.amount / maxMonthly) * 100}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className={cn("w-full rounded-t-lg min-h-[4px]", idx === monthlyTrend.length - 1 ? "bg-violet-500" : "bg-primary/20")}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-2">
                        {monthlyTrend.map((month) => (
                          <div key={month.month} className="flex-1 text-center">
                            <p className="text-xs font-medium text-gray-600">${(month.amount / 1000).toFixed(1)}K</p>
                            <p className="text-[10px] text-gray-400">{month.month}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Commissions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Commissions</CardTitle>
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
                                <th className="text-left p-3 text-xs font-medium text-gray-500">Policy</th>
                                <th className="text-left p-3 text-xs font-medium text-gray-500">Client</th>
                                <th className="text-left p-3 text-xs font-medium text-gray-500">Product</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Amount</th>
                                <th className="text-center p-3 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredEarnings.slice(0, 10).map((entry) => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="p-3"><span className="text-sm font-mono text-gray-600">{entry.policyNumber}</span></td>
                                  <td className="p-3"><span className="text-sm font-medium">{entry.clientName}</span></td>
                                  <td className="p-3"><span className="text-sm text-gray-600">{entry.product}</span></td>
                                  <td className="p-3 text-right">
                                    <span className={cn("text-sm font-semibold", entry.status === 'clawback' ? "text-red-600" : "text-green-600")}>
                                      {entry.status === 'clawback' ? '-' : ''}${entry.amount.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge variant="outline" className={cn("text-[10px]",
                                      entry.status === 'paid' && "border-green-300 text-green-600 bg-green-50",
                                      entry.status === 'pending' && "border-yellow-300 text-yellow-600 bg-yellow-50",
                                      entry.status === 'clawback' && "border-red-300 text-red-600 bg-red-50"
                                    )}>
                                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-violet-500" />
                        By Product
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {DEMO_PRODUCT_BREAKDOWN.map((item) => (
                          <div key={item.product}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.product}</span>
                              <span className="text-sm text-gray-600">{item.percent}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={item.percent} className="h-2 flex-1" />
                              <span className="text-sm font-medium text-primary w-20 text-right">${(item.amount / 1000).toFixed(1)}K</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        Statements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {statements.map((statement) => (
                          <button
                            key={statement.period}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer w-full text-left"
                            onClick={() => handleDownloadStatement(statement.period, statement.amount)}
                          >
                            <div>
                              <p className="font-medium text-sm">{statement.period}</p>
                              <p className="text-xs text-gray-500">{statement.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-primary">${statement.amount.toLocaleString()}</span>
                              <Download className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Commission Info */}
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-primary mb-2">Commission Info</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Payment Schedule</span>
                          <span className="font-medium">Weekly (Fridays)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min. Payout</span>
                          <span className="font-medium">$100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Direct Deposit</span>
                          <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-6">
              {/* Lead Source ROI */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-500" />
                    Lead Source ROI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_LEAD_SOURCE_ROI.map((source) => (
                      <div key={source.source} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", source.color)} />
                            <span className="font-medium">{source.source}</span>
                          </div>
                          <Badge className={cn("text-xs",
                            source.roi === Infinity ? "bg-violet-100 text-violet-700" :
                            source.roi >= 1000 ? "bg-green-100 text-green-700" :
                            source.roi >= 500 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {source.roi === Infinity ? '∞' : `${source.roi}%`} ROI
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                          <div><p className="text-gray-500 text-xs">Leads</p><p className="font-semibold">{source.leads}</p></div>
                          <div><p className="text-gray-500 text-xs">Conversions</p><p className="font-semibold">{source.conversions}</p></div>
                          <div><p className="text-gray-500 text-xs">Conv. Rate</p><p className={cn("font-semibold", source.conversionRate >= 30 ? "text-green-600" : "text-gray-600")}>{source.conversionRate}%</p></div>
                          <div><p className="text-gray-500 text-xs">Cost</p><p className="font-semibold">${source.totalSpent.toLocaleString()}</p></div>
                          <div><p className="text-gray-500 text-xs">Revenue</p><p className="font-semibold text-primary">${source.revenue.toLocaleString()}</p></div>
                        </div>
                        <div className="mt-3">
                          <Progress value={(source.conversions / source.leads) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-violet-600" />
                      <span className="text-violet-800">
                        <strong>Recommendation:</strong> Referrals have the highest conversion rate (40%) and infinite ROI. Focus on building your referral network.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Mix */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-500" />
                    Product Mix Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue Distribution</h4>
                      <div className="space-y-3">
                        {DEMO_PRODUCT_BREAKDOWN.map((product) => (
                          <div key={product.product}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", product.color)} />
                                <span className="text-sm font-medium">{product.product}</span>
                              </div>
                              <span className="text-sm text-gray-600">{product.percent}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={product.percent} className="h-3 flex-1" />
                              <span className="text-sm font-bold text-primary w-16 text-right">${(product.amount / 1000).toFixed(1)}K</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        {DEMO_PRODUCT_BREAKDOWN.map((product) => (
                          <div key={product.product} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{product.product}</span>
                              <Badge variant="outline" className="text-[10px]">{product.policies} policies</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Avg Premium</span>
                                <p className="font-semibold">${product.avgPremium.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Avg Commission</span>
                                <p className="font-semibold text-green-600">${product.avgCommission.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Insights</h4>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">Top Volume</span>
                        </div>
                        <p className="text-sm text-blue-700">Term Life leads with 12 policies</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">Highest Commission</span>
                        </div>
                        <p className="text-sm text-green-700">IUL averages $760/policy</p>
                      </div>
                      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-violet-600" />
                          <span className="text-xs font-medium text-violet-800">Growth Opportunity</span>
                        </div>
                        <p className="text-sm text-violet-700">Consider expanding Whole Life sales</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">New Leads</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-primary">+23%</p>
                      <p className="text-xs text-gray-500">vs last {timePeriod}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Close Rate</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-primary">+8%</p>
                      <p className="text-xs text-gray-500">vs last {timePeriod}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Avg Deal Size</span>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-primary">-5%</p>
                      <p className="text-xs text-gray-500">vs last {timePeriod}</p>
                    </div>
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
