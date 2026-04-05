/**
 * AgentAutomations - Real-time automation system for agents
 * Supports creating, managing, and monitoring automations
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Clock,
  FileText,
  CheckCircle2,
  Plus,
  Activity,
  TrendingUp,
  History,
  Inbox,
  Loader2,
  XCircle,
  SkipForward,
  Eye,
  Filter,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RADIUS, SHADOW, MOTION, COLORS, fadeInUp, staggerContainer, scaleIn } from "@/lib/heritageDesignSystem";
import { AutomationCard } from "@/components/agent/automations/AutomationCard";
import { AutomationWizard } from "@/components/agent/automations/AutomationWizard";
import { ExecutionDetailDialog } from "@/components/agent/automations/ExecutionDetailDialog";
import { TemplatePreviewModal } from "@/components/agent/automations/TemplatePreviewModal";
import {
  useAutomations,
  useAutomationTemplates,
  useToggleAutomation,
  useDeleteAutomation,
  useCreateFromTemplate,
  useCreateAutomation,
  useUpdateAutomation,
  useRunAutomation,
  useRecentExecutions,
} from "@/hooks/useAutomations";
import type { Automation, AutomationTemplate, AutomationExecution } from "@shared/models/automations";
import { getAutomationIcon, formatRelativeTime } from "@/lib/automationConstants";

export default function AgentAutomations() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"automations" | "templates" | "log">("automations");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Queries
  const { data: automations = [], isLoading: loadingAutomations } = useAutomations();
  const { data: templates = [], isLoading: loadingTemplates } = useAutomationTemplates();
  const { data: executions = [], isLoading: loadingExecutions } = useRecentExecutions(100);

  // Mutations
  const toggleMutation = useToggleAutomation();
  const deleteMutation = useDeleteAutomation();
  const createFromTemplateMutation = useCreateFromTemplate();
  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation();
  const runMutation = useRunAutomation();

  // Stats calculations
  const activeCount = automations.filter((a) => a.enabled).length;
  const totalRuns = automations.reduce((sum, a) => sum + (a.executedCount || 0), 0);
  const totalSuccess = automations.reduce((sum, a) => sum + (a.successCount || 0), 0);
  // Success rate: show actual percentage, or "--" if no runs yet
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : null;
  // Time saved: estimate ~5 minutes per successful automation run
  const timeSavedMinutes = totalSuccess * 5;
  const timeSavedDisplay = timeSavedMinutes >= 60
    ? `${Math.round(timeSavedMinutes / 60)}h`
    : `${timeSavedMinutes}m`;

  // Filter executions by status
  const filteredExecutions = statusFilter === "all"
    ? executions
    : executions.filter(e => e.status === statusFilter);

  // Handlers
  const handleToggle = (id: string, enabled: boolean) => {
    toggleMutation.mutate(
      { id, enabled },
      {
        onSuccess: () => {
          toast.success(enabled ? "Automation enabled" : "Automation paused");
        },
        onError: () => {
          toast.error("Failed to toggle automation");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Automation deleted");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Failed to delete automation");
      },
    });
  };

  const handleRun = (id: string) => {
    runMutation.mutate(
      { id },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Automation completed successfully");
          } else {
            toast.warning("Automation ran with issues");
          }
        },
        onError: () => {
          toast.error("Failed to run automation");
        },
      }
    );
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    createFromTemplateMutation.mutate(
      { templateId: selectedTemplate.id },
      {
        onSuccess: () => {
          toast.success(`Created automation: ${selectedTemplate.name}`);
          setSelectedTemplate(null);
          setActiveTab("automations");
        },
        onError: () => {
          toast.error("Failed to create automation");
        },
      }
    );
  };

  const handleOpenTemplateInBuilder = () => {
    if (!selectedTemplate) return;
    // Navigate to visual builder with template data
    // Store template in session storage for the builder to pick up
    sessionStorage.setItem("workflow-template", JSON.stringify(selectedTemplate));
    setLocation("/agents/workflows/new?template=" + selectedTemplate.id);
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowWizard(true);
  };

  const handleSaveAutomation = (data: {
    name: string;
    description: string;
    triggerType: "time_based" | "event_based" | "condition_based";
    triggerConfig: Record<string, unknown>;
    conditions: Array<{ field: string; operator: string; value: unknown }>;
    actions: Array<{ type: string; config: Record<string, unknown> }>;
  }) => {
    if (editingAutomation) {
      // Update existing
      updateMutation.mutate(
        { id: editingAutomation.id, data },
        {
          onSuccess: () => {
            toast.success("Automation updated");
            setShowWizard(false);
            setEditingAutomation(null);
          },
          onError: () => {
            toast.error("Failed to update automation");
          },
        }
      );
    } else {
      // Create new
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Automation created");
          setShowWizard(false);
        },
        onError: () => {
          toast.error("Failed to create automation");
        },
      });
    }
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Zap}
            title="Automations"
            subtitle="Automate your workflow and save time"

          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20"
                style={{ borderRadius: RADIUS.button }}
                onClick={() => setActiveTab("templates")}
              >
                <FileText className="w-4 h-4" />
                Templates
              </Button>
              <Button
                className="gap-2 bg-white text-violet-600 hover:bg-white/90 shadow-lg"
                style={{ borderRadius: RADIUS.button }}
                onClick={() => setLocation("/agents/workflows/new")}
              >
                <Plus className="w-4 h-4" />
                Create New
              </Button>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            <AgentStatCard
              icon={Activity}
              value={activeCount}
              label="Active Automations"
              gradient="from-violet-500 to-violet-600"
            />
            <AgentStatCard
              icon={TrendingUp}
              value={totalRuns}
              label="Total Runs"
              gradient="from-violet-400 to-violet-500"
            />
            <AgentStatCard
              icon={Clock}
              value={timeSavedDisplay}
              label="Time Saved"
              gradient="from-amber-500 to-amber-600"
            />
            <AgentStatCard
              icon={CheckCircle2}
              value={successRate !== null ? `${successRate}%` : "--"}
              label="Success Rate"
              gradient="from-amber-400 to-amber-500"
            />
          </AgentStatCardGrid>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full"
          >
            <TabsList
              className="w-fit mb-4 border-0 p-1 gap-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="automations"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <Zap className="w-4 h-4" />
                My Automations
                {automations.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700"
                  >
                    {automations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <FileText className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger
                value="log"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                style={{ borderRadius: RADIUS.button }}
              >
                <History className="w-4 h-4" />
                Execution Log
                {executions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700"
                  >
                    {executions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Automations Tab */}
            <TabsContent value="automations" className="mt-0">
              {loadingAutomations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : automations.length === 0 ? (
                <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="py-12 text-center">
                    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No automations yet</h3>
                    <p className="text-gray-500 mb-4">Create your first automation to get started</p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("templates")}
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                      <Button
                        onClick={() => setLocation("/agents/workflows/new")}
                        className="bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {automations.map((automation, index) => (
                    <motion.div
                      key={automation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <AutomationCard
                        automation={automation}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
                        onRun={handleRun}
                        isToggling={toggleMutation.isPending}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Choose a template to quickly create an automation
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation("/agents/workflows/new")}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Build from Scratch
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {templates.map((template, index) => {
                      const IconComponent = getAutomationIcon(template.icon);
                      return (
                        <motion.div
                          key={template.id}
                          variants={scaleIn}
                          whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                          transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                        >
                          <Card
                            className="border-0 transition-all cursor-pointer hover:ring-2 hover:ring-violet-200"
                            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md flex-shrink-0"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-violet-100 text-violet-700 text-[10px]">
                                      {template.category.replace(/-/g, " ")}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px]">
                                      {template.actions.length} action{template.actions.length > 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Execution Log Tab */}
            <TabsContent value="log" className="mt-0">
              {loadingExecutions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : executions.length === 0 ? (
                <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="py-12 text-center">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No executions yet</h3>
                    <p className="text-gray-500">Automation runs will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="p-0">
                    {/* Filter bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">
                        Showing {filteredExecutions.length} of {executions.length} executions
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Filter className="w-3 h-3" />
                            {statusFilter === "all" ? "All Status" : statusFilter}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                            All Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-violet-500" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                            <XCircle className="w-4 h-4 mr-2 text-amber-600" />
                            Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("skipped")}>
                            <SkipForward className="w-4 h-4 mr-2 text-violet-400" />
                            Skipped
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                      {filteredExecutions.map((execution) => {
                        const automation = automations.find((a) => a.id === execution.automationId);
                        return (
                          <div
                            key={execution.id}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedExecution(execution)}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 flex items-center justify-center flex-shrink-0",
                                execution.status === "completed" && "bg-violet-100 text-violet-600",
                                execution.status === "failed" && "bg-amber-100 text-amber-700",
                                execution.status === "running" && "bg-amber-50 text-amber-500",
                                execution.status === "pending" && "bg-gray-100 text-gray-600",
                                execution.status === "skipped" && "bg-violet-50 text-violet-400"
                              )}
                              style={{ borderRadius: RADIUS.button }}
                            >
                              {execution.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                              {execution.status === "failed" && <XCircle className="w-4 h-4" />}
                              {execution.status === "running" && <Loader2 className="w-4 h-4 animate-spin" />}
                              {execution.status === "pending" && <Clock className="w-4 h-4" />}
                              {execution.status === "skipped" && <SkipForward className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {automation?.name || "Unknown Automation"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(execution.startedAt)}
                                {execution.duration && ` • ${execution.duration}ms`}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px]",
                                execution.status === "completed" && "bg-violet-100 text-violet-700",
                                execution.status === "failed" && "bg-amber-100 text-amber-700",
                                execution.status === "running" && "bg-amber-50 text-amber-600",
                                execution.status === "skipped" && "bg-violet-50 text-violet-500"
                              )}
                            >
                              {execution.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExecution(execution);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The automation and all its execution history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onCreateAutomation={handleCreateFromTemplate}
        onOpenInBuilder={handleOpenTemplateInBuilder}
        isCreating={createFromTemplateMutation.isPending}
      />

      {/* Automation Wizard */}
      <AutomationWizard
        open={showWizard}
        onClose={() => {
          setShowWizard(false);
          setEditingAutomation(null);
        }}
        onSave={handleSaveAutomation}
        automation={editingAutomation}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Execution Detail Dialog */}
      <ExecutionDetailDialog
        open={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
        execution={selectedExecution}
        automation={selectedExecution ? automations.find(a => a.id === selectedExecution.automationId) || null : null}
      />
    </AgentLoungeLayout>
  );
}
