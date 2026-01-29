import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { PipelineKanban, type PipelineLead } from "@/components/agent/PipelineKanban";
import { AddLeadModal } from "@/components/agent/AddLeadModal";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  Clock,
  Users,
  Target,
  Phone,
  LayoutGrid,
  CheckCircle2,
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

export default function AgentPipeline() {
  const { leads, addLead, updateLeadStatus, addActivityToLead } = useAgentStore();
  const [viewMode, setViewMode] = useState<'funnel' | 'kanban'>('funnel');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [showAddLead, setShowAddLead] = useState(false);
  const [initialStage, setInitialStage] = useState<string>('new');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const periodDays = getTimePeriodDays(timePeriod);

  // Filter leads by time period (based on creation date)
  const periodLeads = useMemo(() => {
    return leads.filter(l => {
      if (!l.createdDate) return true;
      return daysSinceDate(l.createdDate) <= periodDays;
    });
  }, [leads, periodDays]);

  const handleLeadClick = (pipelineLead: PipelineLead) => {
    const lead = leads.find(l => l.id === pipelineLead.id);
    if (lead) {
      setSelectedLead(lead);
      setDrawerOpen(true);
    }
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdDate' | 'notes' | 'assignedTo'>) => {
    addLead({
      ...leadData,
      status: initialStage as Lead['status'],
    });
    toast.success('Lead added to pipeline');
  };

  const handleAddLeadToStage = (stage: string) => {
    setInitialStage(stage);
    setShowAddLead(true);
  };

  // Convert leads to PipelineLead format for Kanban
  const kanbanLeads: PipelineLead[] = useMemo(() => {
    return leads
      .filter(l => l.status !== 'lost' && l.status !== 'closed')
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        product: lead.product || 'Life Insurance',
        value: AVG_DEAL_VALUE,
        stage: lead.status as 'new' | 'contacted' | 'qualified' | 'proposal',
        daysInStage: lead.lastContactDate
          ? daysSinceDate(lead.lastContactDate)
          : 3,
        lastActivity: lead.lastContactDate,
        priority: lead.status === 'proposal' ? 'high' : undefined,
        nextAction: lead.status === 'new' ? 'Initial contact call' : lead.status === 'contacted' ? 'Schedule follow-up' : undefined,
      }));
  }, [leads]);

  // Calculate pipeline metrics
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
      {
        name: 'New',
        key: 'new',
        count: stages.new.length,
        value: stages.new.length * AVG_DEAL_VALUE,
        color: 'bg-blue-500',
        conversionRate: 80,
        avgAge: 2
      },
      {
        name: 'Contacted',
        key: 'contacted',
        count: stages.contacted.length,
        value: stages.contacted.length * AVG_DEAL_VALUE,
        color: 'bg-yellow-500',
        conversionRate: 67,
        avgAge: 5
      },
      {
        name: 'Qualified',
        key: 'qualified',
        count: stages.qualified.length,
        value: stages.qualified.length * AVG_DEAL_VALUE,
        color: 'bg-purple-500',
        conversionRate: 63,
        avgAge: 10
      },
      {
        name: 'Proposal',
        key: 'proposal',
        count: stages.proposal.length,
        value: stages.proposal.length * AVG_DEAL_VALUE,
        color: 'bg-green-500',
        conversionRate: 60,
        avgAge: 15
      },
      {
        name: 'Closed',
        key: 'closed',
        count: stages.closed.length,
        value: stages.closed.length * AVG_DEAL_VALUE,
        color: 'bg-emerald-500',
        conversionRate: null,
        avgAge: 18
      },
    ];

    const totalLeads = periodLeads.filter(l => l.status !== 'lost').length;
    const closedDeals = stages.closed.length;
    const overallConversion = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;
    const totalPipelineValue = stageData.slice(0, 4).reduce((sum, s) => sum + s.value, 0);

    return {
      stages: stageData,
      totalLeads,
      closedDeals,
      overallConversion,
      totalPipelineValue,
      avgDealValue: AVG_DEAL_VALUE,
      avgCycleTime: 12
    };
  }, [periodLeads]);

  // Get at-risk deals (stale leads)
  const atRiskDeals = useMemo(() => {
    return leads
      .filter(l => {
        if (l.status === 'closed' || l.status === 'lost' || l.status === 'new') return false;
        if (!l.lastContactDate) return true;
        return daysSinceDate(l.lastContactDate) > STALE_DAYS;
      })
      .slice(0, 5);
  }, [leads]);

  // Funnel width calculation
  const maxCount = Math.max(...pipelineMetrics.stages.map(s => s.count), 1);

  const timePeriodLabel = timePeriod === 'week' ? 'This Week' : timePeriod === 'month' ? 'This Month' : timePeriod === 'quarter' ? 'This Quarter' : 'This Year';

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
            <h1 className="text-2xl font-bold text-primary">Pipeline Overview</h1>
            <p className="text-sm text-gray-600">Visualize your sales funnel and conversion metrics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'funnel' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('funnel')}
                aria-label="Funnel view"
                className={cn(
                  "gap-2",
                  viewMode === 'funnel' && "bg-primary text-white"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                Funnel
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                aria-label="Kanban view"
                className={cn(
                  "gap-2",
                  viewMode === 'kanban' && "bg-primary text-white"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </Button>
            </div>
            <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <motion.div variants={fadeInUp}>
            <PipelineKanban
              leads={kanbanLeads}
              onLeadClick={handleLeadClick}
              onAddLead={handleAddLeadToStage}
            />
          </motion.div>
        )}

        {/* Lead Detail Drawer */}
        <LeadDetailDrawer
          lead={selectedLead}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onUpdateStatus={(leadId: string, status: Lead['status']) => {
            updateLeadStatus(leadId, status);
            toast.success(`Lead moved to ${statusConfig[status]?.label || status}`);
          }}
          onAddActivity={(leadId: string, activity) => {
            addActivityToLead(leadId, activity);
            toast.success('Activity logged');
          }}
        />

        {/* Funnel View */}
        {viewMode === 'funnel' && (
          <>
        {/* Summary Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: "Total Pipeline",
              value: pipelineMetrics.totalLeads,
              subtext: `active leads (${timePeriodLabel.toLowerCase()})`,
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              icon: DollarSign,
              label: "Pipeline Value",
              value: `$${(pipelineMetrics.totalPipelineValue / 1000).toFixed(1)}K`,
              subtext: "potential revenue",
              color: "text-green-600",
              bg: "bg-green-50"
            },
            {
              icon: Target,
              label: "Conversion Rate",
              value: `${pipelineMetrics.overallConversion}%`,
              subtext: "overall",
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
            {
              icon: Clock,
              label: "Avg. Cycle Time",
              value: `${pipelineMetrics.avgCycleTime}`,
              subtext: "days to close",
              color: "text-orange-600",
              bg: "bg-orange-50"
            }
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
        </motion.div>

        {/* Funnel Visualization */}
        <motion.div variants={fadeInUp}>
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
                          className={cn(
                            "h-10 rounded-lg flex items-center justify-between px-4",
                            stage.color
                          )}
                        >
                          <span className="text-white font-medium text-sm">
                            {stage.count} leads
                          </span>
                          <span className="text-white/80 text-sm">
                            ${(stage.value / 1000).toFixed(1)}K
                          </span>
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

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <span>Conversion: <strong>{pipelineMetrics.overallConversion}%</strong> overall</span>
                  <span>Avg. Deal: <strong>${pipelineMetrics.avgDealValue.toLocaleString()}</strong></span>
                  <span>Cycle: <strong>{pipelineMetrics.avgCycleTime} days</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stage Breakdown Table */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Stage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Stage</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Count</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Value</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Age</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-600">Conv. Rate</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineMetrics.stages.slice(0, 4).map((stage) => (
                      <tr key={stage.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                            <span className="font-medium">{stage.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold">{stage.count}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-green-600 font-medium">
                            ${stage.value.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-gray-600">{stage.avgAge} days</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={stage.conversionRate || 0} className="w-16 h-2" />
                            <span className="text-sm text-gray-600">{stage.conversionRate}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agents/leads?status=${stage.key}`}>
                              View <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* At-Risk Deals */}
        {atRiskDeals.length > 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  At-Risk Deals
                  <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
                    {atRiskDeals.length} stale leads
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-4">
                  These leads haven't been contacted in over {STALE_DAYS} days. Re-engage them to keep your pipeline healthy.
                </p>
                <div className="space-y-2">
                  {atRiskDeals.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => {
                        setSelectedLead(lead);
                        setDrawerOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedLead(lead);
                          setDrawerOpen(true);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`At-risk lead: ${lead.name}, ${statusConfig[lead.status]?.label || lead.status} status`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium text-sm">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-500">
                            <Badge variant="outline" className={cn("text-[10px] mr-1.5 px-1.5 py-0", statusConfig[lead.status]?.color)}>
                              {statusConfig[lead.status]?.label || lead.status}
                            </Badge>
                            Last contact: {lead.lastContactDate ? formatRelativeDate(lead.lastContactDate) : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Stale
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                          aria-label={`Call ${lead.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${lead.phone}`;
                          }}
                        >
                          <Phone className="w-4 h-4 mr-1" /> Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp}>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-700">All leads are healthy</p>
                <p className="text-sm text-green-600 mt-1">
                  No leads have gone more than {STALE_DAYS} days without contact. Keep up the good work!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Performance Comparison */}
        <motion.div variants={fadeInUp}>
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
        </motion.div>
          </>
        )}
      </motion.div>

      <AddLeadModal
        open={showAddLead}
        onOpenChange={setShowAddLead}
        onAddLead={handleAddLead}
      />
    </AgentLoungeLayout>
  );
}
