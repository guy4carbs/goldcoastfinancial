import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAgentStore } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PieChart,
  BarChart3,
  Target,
  Users,
  Percent,
  Layers,
  Activity,
  Inbox,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, daysSinceDate } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

type TimeRange = 'month' | 'quarter' | 'year';

function getTimeRangeDays(range: TimeRange): number {
  switch (range) {
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
  }
}

function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
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

interface ProductBreakdown {
  product: string;
  amount: number;
  percent: number;
  color: string;
  policies: number;
  avgPremium: number;
  avgCommission: number;
}

interface LeadSourceROI {
  source: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  totalSpent: number;
  revenue: number;
  roi: number;
  avgDealSize: number;
  color: string;
}

interface WeeklyTrendEntry {
  week: string;
  leads: number;
  quotes: number;
  sales: number;
  revenue: number;
}

interface StatementEntry {
  period: string;
  date: string;
  amount: number;
}

// Demo analytics data (will be replaced with real data when API is available)
const DEMO_PRODUCT_BREAKDOWN: ProductBreakdown[] = [
  { product: 'Term Life', amount: 18200, percent: 43, color: 'bg-blue-500', policies: 12, avgPremium: 1517, avgCommission: 287 },
  { product: 'Whole Life', amount: 12400, percent: 29, color: 'bg-green-500', policies: 6, avgPremium: 3200, avgCommission: 620 },
  { product: 'IUL', amount: 7600, percent: 18, color: 'bg-purple-500', policies: 3, avgPremium: 4800, avgCommission: 760 },
  { product: 'Final Expense', amount: 4400, percent: 10, color: 'bg-orange-500', policies: 8, avgPremium: 850, avgCommission: 165 },
];

const DEMO_LEAD_SOURCE_ROI: LeadSourceROI[] = [
  {
    source: 'Company Leads', leads: 45, conversions: 12, conversionRate: 26.7,
    totalSpent: 450, revenue: 18500, roi: Math.round(((18500 - 450) / 450) * 100),
    avgDealSize: 1542, color: 'bg-blue-500'
  },
  {
    source: 'Self-Generated', leads: 28, conversions: 9, conversionRate: 32.1,
    totalSpent: 200, revenue: 14200, roi: Math.round(((14200 - 200) / 200) * 100),
    avgDealSize: 1578, color: 'bg-green-500'
  },
  {
    source: 'Referrals', leads: 15, conversions: 6, conversionRate: 40.0,
    totalSpent: 0, revenue: 8600, roi: Infinity,
    avgDealSize: 1433, color: 'bg-violet-500'
  },
  {
    source: 'Website/Digital', leads: 35, conversions: 4, conversionRate: 11.4,
    totalSpent: 350, revenue: 5200, roi: Math.round(((5200 - 350) / 350) * 100),
    avgDealSize: 1300, color: 'bg-amber-500'
  }
];

const DEMO_WEEKLY_TREND: WeeklyTrendEntry[] = [
  { week: 'W1', leads: 12, quotes: 8, sales: 3, revenue: 4200 },
  { week: 'W2', leads: 15, quotes: 10, sales: 4, revenue: 5600 },
  { week: 'W3', leads: 18, quotes: 12, sales: 5, revenue: 7100 },
  { week: 'W4', leads: 14, quotes: 9, sales: 4, revenue: 5800 },
];

function generateStatements(): StatementEntry[] {
  const now = new Date();
  const statements: StatementEntry[] = [];
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

export default function AgentEarnings() {
  const { earnings } = useAgentStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeTab, setActiveTab] = useState('earnings');

  const rangeDays = getTimeRangeDays(timeRange);

  // Filter earnings by time range
  const filteredEarnings = useMemo(() => {
    return earnings.filter(e => {
      if (!e.date) return true;
      return daysSinceDate(e.date) <= rangeDays;
    });
  }, [earnings, rangeDays]);

  // Calculate earnings metrics from filtered data
  const metrics = useMemo(() => {
    const pending = filteredEarnings.filter(e => e.status === 'pending');
    const paid = filteredEarnings.filter(e => e.status === 'paid');
    const clawback = filteredEarnings.filter(e => e.status === 'clawback');

    const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0);
    const paidTotal = paid.reduce((sum, e) => sum + e.amount, 0);
    const clawbackTotal = clawback.reduce((sum, e) => sum + e.amount, 0);

    // Net total accounts for clawbacks
    const netTotal = pendingTotal + paidTotal - clawbackTotal;

    // YTD from all earnings this year
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const ytdEarnings = earnings.filter(e => e.date >= yearStart && e.status !== 'clawback');
    const ytdClawbacks = earnings.filter(e => e.date >= yearStart && e.status === 'clawback');
    const ytdTotal = ytdEarnings.reduce((sum, e) => sum + e.amount, 0) - ytdClawbacks.reduce((sum, e) => sum + e.amount, 0);

    // Demo comparison - last year total
    const lastYearTotal = 36100;
    const yoyGrowth = lastYearTotal > 0 ? Math.round(((ytdTotal - lastYearTotal) / lastYearTotal) * 100) : 0;

    // Previous period comparison for the current timeRange
    const prevPeriodEarnings = earnings.filter(e => {
      if (!e.date) return false;
      const days = daysSinceDate(e.date);
      return days > rangeDays && days <= rangeDays * 2;
    });
    const prevPeriodTotal = prevPeriodEarnings
      .filter(e => e.status !== 'clawback')
      .reduce((sum, e) => sum + e.amount, 0) -
      prevPeriodEarnings
        .filter(e => e.status === 'clawback')
        .reduce((sum, e) => sum + e.amount, 0);

    return {
      pending: { count: pending.length, total: pendingTotal },
      paid: { count: paid.length, total: paidTotal },
      clawback: { count: clawback.length, total: clawbackTotal },
      netTotal,
      ytd: ytdTotal || 42600, // fallback to demo if no real data
      lastYear: lastYearTotal,
      yoyGrowth,
      prevPeriodTotal,
    };
  }, [filteredEarnings, earnings, rangeDays]);

  // Monthly trend - last 6 months
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
      const monthClawbacks = earnings.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= date && eDate <= monthEnd && e.status === 'clawback';
      });
      const amount = monthEarnings.reduce((s, e) => s + e.amount, 0) - monthClawbacks.reduce((s, e) => s + e.amount, 0);
      months.push({ month: monthLabel, amount: Math.max(0, amount) || (3200 + i * 400) }); // fallback to demo
    }
    return months;
  }, [earnings]);

  const maxMonthly = Math.max(...monthlyTrend.map(m => m.amount), 1);

  // Statements - dynamically generated
  const statements = useMemo(() => generateStatements(), []);

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
      a.download = `earnings-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export downloaded', {
        description: `${filteredEarnings.length} earnings for ${getTimeRangeLabel(timeRange).toLowerCase()}`
      });
    } catch {
      toast.error('Export failed', {
        description: 'Unable to generate the CSV file. Please try again.'
      });
    }
  };

  const handleDownloadStatement = (period: string, amount: number) => {
    toast.success(`Downloading ${period} Statement`, {
      description: `Commission statement for $${amount.toLocaleString()}`
    });
  };

  const prevLabel = timeRange === 'month' ? 'last month' : timeRange === 'quarter' ? 'last quarter' : 'last year';

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
            <h1 className="text-2xl font-bold text-primary">Earnings & Analytics</h1>
            <p className="text-sm text-gray-600">Track your commissions, payouts, and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} aria-label="Export earnings as CSV">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="earnings" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Activity className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="earnings" className="space-y-6 mt-0">

        {/* Summary Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                ${metrics.pending.total.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {metrics.pending.count} {metrics.pending.count === 1 ? 'policy' : 'policies'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Paid</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                ${metrics.paid.total.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {metrics.paid.count} {metrics.paid.count === 1 ? 'policy' : 'policies'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-medium text-primary">Net Total</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${metrics.netTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {metrics.prevPeriodTotal > 0 ? (
                  <>vs ${metrics.prevPeriodTotal.toLocaleString()} {prevLabel}</>
                ) : (
                  <>{getTimeRangeLabel(timeRange).toLowerCase()}</>
                )}
              </p>
              {metrics.clawback.total > 0 && (
                <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  -${metrics.clawback.total.toLocaleString()} clawbacks
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
              <p className="text-2xl font-bold text-primary">
                ${metrics.ytd.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {metrics.yoyGrowth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={cn("text-xs", metrics.yoyGrowth >= 0 ? "text-green-600" : "text-red-600")}>
                  {metrics.yoyGrowth >= 0 ? '+' : ''}{metrics.yoyGrowth}% YoY
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Trend & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Trend */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-500" />
                    Earnings Trend (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label="Bar chart showing earnings over the last 6 months">
                    <div className="flex items-end gap-4 h-40">
                      {monthlyTrend.map((month, idx) => (
                        <div key={month.month} className="flex-1 h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(month.amount / maxMonthly) * 100}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={cn(
                              "w-full rounded-t-lg min-h-[4px]",
                              idx === monthlyTrend.length - 1
                                ? "bg-violet-500"
                                : "bg-primary/20"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2">
                      {monthlyTrend.map((month) => (
                        <div key={month.month} className="flex-1 text-center">
                          <p className="text-xs font-medium text-gray-600">
                            ${(month.amount / 1000).toFixed(1)}K
                          </p>
                          <p className="text-[10px] text-gray-400">{month.month}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Commissions */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Commissions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredEarnings.length === 0 ? (
                    <div className="text-center py-12">
                      <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium">No earnings recorded</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Commission entries will appear here as policies are sold
                      </p>
                    </div>
                  ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <caption className="sr-only">Recent commission earnings with policy details, amounts, and status</caption>
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
                        {filteredEarnings.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">
                              <span className="text-sm font-mono text-gray-600">
                                {entry.policyNumber}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium">{entry.clientName}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-600">{entry.product}</span>
                            </td>
                            <td className="p-3 text-right">
                              <span className={cn(
                                "text-sm font-semibold",
                                entry.status === 'clawback' ? "text-red-600" : "text-green-600"
                              )}>
                                {entry.status === 'clawback' ? '-' : ''}${entry.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                variant="outline"
                                aria-label={`Status: ${entry.status === 'paid' ? 'Paid and deposited' : entry.status === 'pending' ? 'Pending payment' : 'Clawback deduction'}`}
                                className={cn(
                                  "text-[10px]",
                                  entry.status === 'paid' && "border-green-300 text-green-600 bg-green-50",
                                  entry.status === 'pending' && "border-yellow-300 text-yellow-600 bg-yellow-50",
                                  entry.status === 'clawback' && "border-red-300 text-red-600 bg-red-50"
                                )}
                              >
                                {entry.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {entry.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {entry.status === 'clawback' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Breakdown & Statements */}
          <div className="space-y-6">
            {/* Product Breakdown */}
            <motion.div variants={fadeInUp}>
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
                          <span className="text-sm font-medium text-primary w-20 text-right">
                            ${(item.amount / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Commission Statements */}
            <motion.div variants={fadeInUp}>
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
                        aria-label={`Download ${statement.period} statement, $${statement.amount.toLocaleString()}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{statement.period}</p>
                          <p className="text-xs text-gray-500">{statement.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-primary">
                            ${statement.amount.toLocaleString()}
                          </span>
                          <Download className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Commission Info */}
            <motion.div variants={fadeInUp}>
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
                      <Badge variant="outline" className="text-green-600 border-green-300" aria-label="Direct deposit is active">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-0">
              {/* Weekly Funnel Trend */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-violet-500" />
                      Weekly Sales Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <caption className="sr-only">Weekly sales funnel showing leads, quotes, sales, conversion rates, and revenue</caption>
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 text-xs font-medium text-gray-500">Week</th>
                            <th className="text-center p-3 text-xs font-medium text-gray-500">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="w-3 h-3" /> Leads
                              </div>
                            </th>
                            <th className="text-center p-3 text-xs font-medium text-gray-500">
                              <div className="flex items-center justify-center gap-1">
                                <FileText className="w-3 h-3" /> Quotes
                              </div>
                            </th>
                            <th className="text-center p-3 text-xs font-medium text-gray-500">
                              <div className="flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Sales
                              </div>
                            </th>
                            <th className="text-center p-3 text-xs font-medium text-gray-500">
                              <div className="flex items-center justify-center gap-1">
                                <Percent className="w-3 h-3" /> Conv. Rate
                              </div>
                            </th>
                            <th className="text-right p-3 text-xs font-medium text-gray-500">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_WEEKLY_TREND.map((week, idx) => {
                            const convRate = ((week.sales / week.leads) * 100).toFixed(1);
                            const prevWeek = idx > 0 ? DEMO_WEEKLY_TREND[idx - 1] : null;
                            const revenueChange = prevWeek ? ((week.revenue - prevWeek.revenue) / prevWeek.revenue * 100).toFixed(1) : null;
                            return (
                              <tr key={week.week} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 font-medium">{week.week}</td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                    {week.leads}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                    {week.quotes}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    {week.sales}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={cn(
                                    "text-sm font-medium",
                                    parseFloat(convRate) >= 25 ? "text-green-600" : parseFloat(convRate) >= 15 ? "text-amber-600" : "text-gray-600"
                                  )}>
                                    {convRate}%
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="font-semibold text-primary">${week.revenue.toLocaleString()}</span>
                                    {revenueChange && (
                                      <span className={cn(
                                        "text-xs",
                                        parseFloat(revenueChange) >= 0 ? "text-green-600" : "text-red-600"
                                      )}>
                                        {parseFloat(revenueChange) >= 0 ? '+' : ''}{revenueChange}%
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Monthly Totals:</span>
                        <div className="flex items-center gap-6">
                          <span><strong>{DEMO_WEEKLY_TREND.reduce((s, w) => s + w.leads, 0)}</strong> leads</span>
                          <span><strong>{DEMO_WEEKLY_TREND.reduce((s, w) => s + w.quotes, 0)}</strong> quotes</span>
                          <span><strong>{DEMO_WEEKLY_TREND.reduce((s, w) => s + w.sales, 0)}</strong> sales</span>
                          <span className="font-bold text-primary">
                            ${DEMO_WEEKLY_TREND.reduce((s, w) => s + w.revenue, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lead Source ROI */}
              <motion.div variants={fadeInUp}>
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
                            <Badge className={cn(
                              "text-xs",
                              source.roi === Infinity ? "bg-violet-100 text-violet-700" :
                              source.roi >= 1000 ? "bg-green-100 text-green-700" :
                              source.roi >= 500 ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {source.roi === Infinity ? '∞' : `${source.roi}%`} ROI
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Leads</p>
                              <p className="font-semibold">{source.leads}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Conversions</p>
                              <p className="font-semibold">{source.conversions}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Conv. Rate</p>
                              <p className={cn(
                                "font-semibold",
                                source.conversionRate >= 30 ? "text-green-600" : source.conversionRate >= 20 ? "text-blue-600" : "text-gray-600"
                              )}>
                                {source.conversionRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Cost</p>
                              <p className="font-semibold">${source.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Revenue</p>
                              <p className="font-semibold text-primary">${source.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Conversion funnel</span>
                              <span className="text-gray-600">{source.conversions} of {source.leads}</span>
                            </div>
                            <Progress value={(source.conversions / source.leads) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-violet-600" />
                        <span className="text-violet-800">
                          <strong>Recommendation:</strong> Referrals have the highest conversion rate ({DEMO_LEAD_SOURCE_ROI.find(l => l.source === 'Referrals')?.conversionRate}%) and infinite ROI. Focus on building your referral network.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Product Mix Analysis */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-violet-500" />
                      Product Mix Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Visual breakdown */}
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
                                <span className="text-sm font-bold text-primary w-16 text-right">
                                  ${(product.amount / 1000).toFixed(1)}K
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detailed metrics */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Metrics</h4>
                        <div className="space-y-3">
                          {DEMO_PRODUCT_BREAKDOWN.map((product) => (
                            <div key={product.product} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{product.product}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {product.policies} policies
                                </Badge>
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

                    {/* Insights */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Insights</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">Top Volume</span>
                          </div>
                          <p className="text-sm text-blue-700">Term Life leads with {DEMO_PRODUCT_BREAKDOWN[0].policies} policies</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-800">Highest Commission</span>
                          </div>
                          <p className="text-sm text-green-700">IUL averages ${DEMO_PRODUCT_BREAKDOWN[2].avgCommission.toLocaleString()}/policy</p>
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
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
