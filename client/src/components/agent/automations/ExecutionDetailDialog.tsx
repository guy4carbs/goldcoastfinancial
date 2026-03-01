/**
 * ExecutionDetailDialog - Shows detailed information about an automation execution
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Zap,
  Target,
  Mail,
  MessageSquare,
  Bell,
  CheckSquare,
  User,
  Tag,
  Webhook,
  Timer,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RADIUS } from "@/lib/heritageDesignSystem";
import type { AutomationExecution, Automation } from "@shared/models/automations";

interface ExecutionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  execution: AutomationExecution | null;
  automation: Automation | null;
}

const ACTION_ICONS: Record<string, typeof Zap> = {
  send_email: Mail,
  send_sms: MessageSquare,
  send_notification: Bell,
  create_task: CheckSquare,
  update_lead: User,
  add_tag: Tag,
  webhook: Webhook,
  wait: Timer,
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number | null): string {
  if (!ms) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function ExecutionDetailDialog({
  open,
  onClose,
  execution,
  automation,
}: ExecutionDetailDialogProps) {
  if (!execution) return null;

  const triggeredBy = execution.triggeredBy as any;
  const conditionResults = execution.conditionResults as any;
  const actionResults = (execution.actionResults || []) as any[];

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
    running: { icon: Loader2, color: "text-amber-600", bg: "bg-amber-100", label: "Running" },
    pending: { icon: Clock, color: "text-gray-600", bg: "bg-gray-100", label: "Pending" },
    skipped: { icon: SkipForward, color: "text-blue-600", bg: "bg-blue-100", label: "Skipped" },
  }[execution.status] || { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-100", label: execution.status };

  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("w-10 h-10 flex items-center justify-center", statusConfig.bg)} style={{ borderRadius: RADIUS.button }}>
              <StatusIcon className={cn("w-5 h-5", statusConfig.color, execution.status === "running" && "animate-spin")} />
            </div>
            <div>
              <div className="font-semibold">{automation?.name || "Automation Execution"}</div>
              <div className="text-sm text-gray-500 font-normal">
                {formatDate(execution.startedAt)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Status & Duration */}
            <div className="flex items-center gap-4">
              <Badge className={cn(statusConfig.bg, statusConfig.color, "border-0")}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-gray-500">
                Duration: {formatDuration(execution.duration)}
              </span>
            </div>

            {/* Trigger Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                Trigger
              </h4>
              <div className="bg-violet-50 border border-violet-200 p-3" style={{ borderRadius: RADIUS.input }}>
                <div className="text-sm">
                  <span className="font-medium">Type:</span>{" "}
                  {triggeredBy?.type === "event" ? "Event-based" :
                   triggeredBy?.type === "manual" ? "Manual trigger" :
                   triggeredBy?.type === "schedule" ? "Scheduled" :
                   triggeredBy?.type === "test" ? "Test run" : "Unknown"}
                </div>
                {triggeredBy?.eventType && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Event:</span> {triggeredBy.eventType}
                  </div>
                )}
                {triggeredBy?.triggeredBy && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">By:</span> {triggeredBy.triggeredBy}
                  </div>
                )}
              </div>
            </div>

            {/* Conditions */}
            {conditionResults && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Conditions
                  <Badge variant="secondary" className={cn(
                    "text-[10px]",
                    conditionResults.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {conditionResults.passed ? "Passed" : "Failed"}
                  </Badge>
                </h4>
                {conditionResults.conditions?.length > 0 ? (
                  <div className="space-y-2">
                    {conditionResults.conditions.map((cond: any, idx: number) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-2 p-2 text-sm",
                          cond.passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200",
                          "border"
                        )}
                        style={{ borderRadius: RADIUS.input }}
                      >
                        {cond.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className="font-medium">{cond.field}</span>
                        <span className="text-gray-500">{cond.operator}</span>
                        <span className="text-gray-700">{JSON.stringify(cond.expected)}</span>
                        {cond.actual !== undefined && (
                          <span className="text-gray-400 text-xs">(was: {JSON.stringify(cond.actual)})</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No conditions configured</p>
                )}
              </div>
            )}

            {/* Actions */}
            {actionResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Actions
                </h4>
                <div className="space-y-2">
                  {actionResults.map((action: any, idx: number) => {
                    const IconComponent = ACTION_ICONS[action.type] || Zap;
                    const isSuccess = action.status === "success" || action.status === "simulated";
                    const isFailed = action.status === "failed";

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 border",
                          isSuccess && "bg-emerald-50 border-emerald-200",
                          isFailed && "bg-red-50 border-red-200",
                          !isSuccess && !isFailed && "bg-gray-50 border-gray-200"
                        )}
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn(
                            "w-6 h-6 flex items-center justify-center",
                            isSuccess && "bg-emerald-100 text-emerald-600",
                            isFailed && "bg-red-100 text-red-600",
                            !isSuccess && !isFailed && "bg-gray-100 text-gray-600"
                          )} style={{ borderRadius: RADIUS.button }}>
                            <IconComponent className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-sm capitalize">
                            {action.type.replace(/_/g, " ")}
                          </span>
                          <Badge variant="secondary" className={cn(
                            "text-[10px] ml-auto",
                            isSuccess && "bg-emerald-100 text-emerald-700",
                            isFailed && "bg-red-100 text-red-700"
                          )}>
                            {action.status}
                          </Badge>
                        </div>
                        {action.result && (
                          <div className="text-xs text-gray-600 mt-1">
                            {typeof action.result === "object" ? (
                              <pre className="whitespace-pre-wrap font-mono bg-white/50 p-2 rounded text-[10px]">
                                {JSON.stringify(action.result, null, 2)}
                              </pre>
                            ) : (
                              action.result
                            )}
                          </div>
                        )}
                        {action.error && (
                          <div className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded">
                            Error: {action.error}
                          </div>
                        )}
                        {action.duration && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {formatDuration(action.duration)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {execution.errorMessage && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Error
                </h4>
                <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700" style={{ borderRadius: RADIUS.input }}>
                  {execution.errorMessage}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-400 space-y-1 pt-2 border-t">
              <div>Started: {formatDate(execution.startedAt)}</div>
              {execution.completedAt && (
                <div>Completed: {formatDate(execution.completedAt)}</div>
              )}
              <div>Execution ID: {execution.id}</div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ExecutionDetailDialog;
