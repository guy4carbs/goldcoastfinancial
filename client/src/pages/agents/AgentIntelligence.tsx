import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Phone, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Target, CheckCircle2, XCircle, ChevronRight,
  Zap, BarChart3, Users, Calendar, ArrowUpRight,
  ArrowDownRight, Minus, FileText, Mail, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { EnhancedActivityModal } from "@/components/agent/EnhancedActivityModal";
import { AssistedActionsPanel } from "@/components/agent/AssistedActionsPanel";
import { SmartTemplatePanel } from "@/components/agent/SmartTemplatePanel";
import { CrossSellPrompts } from "@/components/agent/CrossSellPrompts";
import { AppointmentBookingModal } from "@/components/agent/AppointmentBookingModal";

const FOLLOW_UP_TYPE_ICONS = {
  call: Phone,
  email: Mail,
  text: MessageSquare,
  meeting: Calendar,
};

function UrgencyBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-red-500 text-white";
    if (score >= 60) return "bg-orange-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  const getLabel = () => {
    if (score >= 80) return "Critical";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  return (
    <Badge className={cn("text-[10px] font-bold", getColor())}>
      {getLabel()} ({score})
    </Badge>
  );
}

function ReadinessIndicator({ lead }: { lead: Lead }) {
  const { getAppointmentReadiness } = useAgentStore();
  const readiness = getAppointmentReadiness(lead);

  return (
    <div className="flex items-center gap-2">
      {readiness.ready ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium">Ready</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">{readiness.missing.length} missing</span>
        </div>
      )}
      <Progress value={readiness.score} className="w-16 h-1.5" />
    </div>
  );
}

export default function AgentIntelligence() {
  const {
    leads,
    currentUser,
    getDailyPriorityList,
    getMissedCallAlerts,
    getCloseRateStats,
    addActivityToLead,
    updateLeadStatus,
    updateLeadFollowUp,
  } = useAgentStore();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentLead, setAppointmentLead] = useState<Lead | null>(null);

  const priorityList = useMemo(() => getDailyPriorityList(), [leads, currentUser]);
  const missedAlerts = useMemo(() => getMissedCallAlerts(), [leads, currentUser]);
  const closeRateStats = useMemo(() => getCloseRateStats(), [leads, currentUser]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleQuickCall = (lead: Lead) => {
    window.location.href = `tel:${lead.phone}`;
  };

  const handleLogActivity = (lead: Lead) => {
    setActivityLead(lead);
    setActivityModalOpen(true);
  };

  const handleActivitySubmit = (data: any) => {
    if (!activityLead) return;
    addActivityToLead(activityLead.id, {
      type: data.type,
      disposition: data.disposition,
      notes: data.notes,
    });
    if (data.nextFollowUpDate && data.nextFollowUpType) {
      updateLeadFollowUp(activityLead.id, data.nextFollowUpDate, data.nextFollowUpType);
    }
    setActivityModalOpen(false);
    setActivityLead(null);
  };

  const TrendIcon = closeRateStats.trend === 'up' ? TrendingUp :
    closeRateStats.trend === 'down' ? TrendingDown : Minus;

  return (
    <AgentLoungeLayout>
      <div className="space-y-6">
        {/* Stage 3 Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold">Stage 3: AI Assisted Execution</h2>
              <p className="text-purple-100 text-sm">Appointments, Renewals, Cross-Sell Prompts & Smart Templates</p>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel - Moved to top for visibility */}
        <AssistedActionsPanel
          onSelectLead={(lead) => {
            setSelectedLead(lead);
            setDrawerOpen(true);
          }}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
              <Brain className="w-7 h-7" />
              Intelligence Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered insights to maximize your productivity
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 bg-gradient-to-br from-violet-50 to-white border-violet-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-violet-600" />
              <Badge className="bg-violet-100 text-violet-700 text-[10px]">This Month</Badge>
            </div>
            <p className="text-3xl font-bold text-violet-700">{closeRateStats.thisMonth}</p>
            <p className="text-xs text-gray-500">Deals Closed</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={cn(
                "w-4 h-4",
                closeRateStats.trend === 'up' ? "text-green-500" :
                closeRateStats.trend === 'down' ? "text-red-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-xs font-medium",
                closeRateStats.trend === 'up' ? "text-green-600" :
                closeRateStats.trend === 'down' ? "text-red-600" : "text-gray-500"
              )}>
                {closeRateStats.trend === 'up' ? '+' : closeRateStats.trend === 'down' ? '-' : ''}
                {Math.abs(closeRateStats.thisMonth - closeRateStats.lastMonth)} vs last month
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl border-2 bg-gradient-to-br from-green-50 to-white border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{closeRateStats.overall}%</p>
            <p className="text-xs text-gray-500">Close Rate</p>
            <Progress value={closeRateStats.overall} className="mt-2 h-1.5" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-white border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700">{closeRateStats.leadsInPipeline}</p>
            <p className="text-xs text-gray-500">Active Pipeline</p>
            <p className="text-xs text-blue-600 mt-2">
              ~{closeRateStats.projectedCloses} projected closes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-4 rounded-xl border-2",
              missedAlerts.length > 0
                ? "bg-gradient-to-br from-red-50 to-white border-red-200"
                : "bg-gradient-to-br from-green-50 to-white border-green-200"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className={cn(
                "w-5 h-5",
                missedAlerts.length > 0 ? "text-red-600" : "text-green-600"
              )} />
            </div>
            <p className={cn(
              "text-3xl font-bold",
              missedAlerts.length > 0 ? "text-red-700" : "text-green-700"
            )}>
              {missedAlerts.length}
            </p>
            <p className="text-xs text-gray-500">Missed Follow-ups</p>
            {missedAlerts.length > 0 && (
              <p className="text-xs text-red-600 mt-2 font-medium">Needs attention!</p>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Priority List - Main Column */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Who to Call Today
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Prioritized by urgency score - work from top to bottom
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {priorityList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">No urgent leads to contact today.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {priorityList.map((item, index) => {
                      const FollowUpIcon = item.lead.nextFollowUpType
                        ? FOLLOW_UP_TYPE_ICONS[item.lead.nextFollowUpType]
                        : Phone;
                      return (
                        <motion.div
                          key={item.lead.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                            item.score >= 80 ? "bg-red-50 border-red-200" :
                            item.score >= 60 ? "bg-orange-50 border-orange-200" :
                            item.score >= 40 ? "bg-amber-50 border-amber-200" :
                            "bg-white border-gray-200"
                          )}
                          onClick={() => handleLeadClick(item.lead)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Rank */}
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                              index === 0 ? "bg-red-500 text-white" :
                              index === 1 ? "bg-orange-500 text-white" :
                              index === 2 ? "bg-amber-500 text-white" :
                              "bg-gray-200 text-gray-600"
                            )}>
                              {index + 1}
                            </div>

                            {/* Lead Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {item.lead.name}
                                </h3>
                                <UrgencyBadge score={item.score} />
                              </div>

                              {/* Call Reason */}
                              <p className="text-sm text-gray-700 font-medium mb-2">
                                {item.callReason}
                              </p>

                              {/* Meta */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {item.lead.product && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {item.lead.product}
                                  </span>
                                )}
                                {item.lead.status && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {item.lead.status}
                                  </Badge>
                                )}
                                <ReadinessIndicator lead={item.lead} />
                              </div>

                              {/* Reasons */}
                              {item.reasons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.reasons.slice(0, 3).map((reason, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                    >
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                className="gap-1 bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickCall(item.lead);
                                }}
                              >
                                <FollowUpIcon className="w-4 h-4" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLogActivity(item.lead);
                                }}
                              >
                                Log
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-4">
            {/* Missed Call Alerts */}
            <Card className={cn(
              missedAlerts.length > 0 && "border-red-200"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    missedAlerts.length > 0 ? "text-red-500" : "text-gray-400"
                  )} />
                  Missed Follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {missedAlerts.length === 0 ? (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">No missed follow-ups!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {missedAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.lead.id}
                        className="p-3 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => handleLeadClick(alert.lead)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {alert.lead.name}
                            </p>
                            <p className="text-xs text-red-600 font-medium">
                              {alert.daysMissed} day{alert.daysMissed > 1 ? 's' : ''} overdue
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCall(alert.lead);
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {missedAlerts.length > 5 && (
                      <p className="text-xs text-center text-gray-500">
                        +{missedAlerts.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Close Rate Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(closeRateStats.byStage).map(([stage, rate]) => {
                  const [from, to] = stage.split('_to_');
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                          {from} → {to === 'next' ? 'Next' : to}
                        </span>
                        <span className="font-medium">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Assisted Actions - Stage 3 */}
            <AssistedActionsPanel
              onSelectLead={(lead) => {
                setSelectedLead(lead);
                setDrawerOpen(true);
              }}
            />

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-violet-700">
                  <Brain className="w-5 h-5" />
                  AI Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {closeRateStats.trend === 'up' ? (
                    <>
                      <span className="font-medium text-green-600">Great momentum! </span>
                      You're closing more deals than last month. Focus on your proposal-stage leads to keep it going.
                    </>
                  ) : closeRateStats.trend === 'down' ? (
                    <>
                      <span className="font-medium text-amber-600">Time to refocus. </span>
                      Your close rate dipped this month. Try re-engaging your {missedAlerts.length} overdue leads first.
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">Steady progress. </span>
                      You have {closeRateStats.projectedCloses} projected closes in your pipeline. Keep following up consistently.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lead Detail Drawer */}
        {selectedLead && (
          <LeadDetailDrawer
            lead={selectedLead}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            onAddActivity={addActivityToLead}
            onUpdateStatus={updateLeadStatus}
          />
        )}

        {/* Enhanced Activity Modal */}
        {activityLead && (
          <EnhancedActivityModal
            open={activityModalOpen}
            onOpenChange={(open) => {
              setActivityModalOpen(open);
              if (!open) setActivityLead(null);
            }}
            lead={activityLead}
            onLogActivity={handleActivitySubmit}
          />
        )}

        {/* Appointment Booking Modal */}
        {appointmentLead && (
          <AppointmentBookingModal
            lead={appointmentLead}
            isOpen={appointmentModalOpen}
            onClose={() => {
              setAppointmentModalOpen(false);
              setAppointmentLead(null);
            }}
          />
        )}
      </div>
    </AgentLoungeLayout>
  );
}
