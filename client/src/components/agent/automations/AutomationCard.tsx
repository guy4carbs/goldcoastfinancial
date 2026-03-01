/**
 * AutomationCard - Visual card for displaying automation with trigger → condition → action flow
 * Uses shared constants from automationConstants.ts for DRY code
 */

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Clock,
  Target,
  ArrowRight,
  Play,
  Trash2,
  Edit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RADIUS, SHADOW, MOTION } from "@/lib/heritageDesignSystem";
import {
  getAutomationIcon,
  getCategoryGradient,
  formatConditionsSummary,
  formatActionsSummary,
  formatRelativeTime,
} from "@/lib/automationConstants";
import type { Automation } from "@shared/models/automations";

interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (automation: Automation) => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
  isToggling?: boolean;
}

/**
 * Get human-readable trigger description from config
 */
function getTriggerDescription(
  triggerConfig: Record<string, unknown> | null,
  triggerType: string
): string {
  if (!triggerConfig) return "Unknown trigger";

  if (triggerType === "time_based") {
    return `Schedule: ${(triggerConfig.schedule as string) || "Not set"}`;
  }
  if (triggerType === "event_based") {
    const eventType = (triggerConfig.eventType as string) || "event";
    const event = eventType.replace(/_/g, " ").toLowerCase();
    return `When ${event}`;
  }
  if (triggerType === "condition_based") {
    const field = ((triggerConfig.field as string) || "field").replace(/([A-Z])/g, " $1").toLowerCase();
    const operator = ((triggerConfig.operator as string) || "matches").replace(/_/g, " ");
    const value = triggerConfig.value || "";
    return `${field} ${operator} ${value}`;
  }
  return "Trigger configured";
}

export function AutomationCard({
  automation,
  onToggle,
  onEdit,
  onDelete,
  onRun,
  isToggling,
}: AutomationCardProps) {
  // Type-safe extraction with proper types
  const triggerConfig = automation.triggerConfig as Record<string, unknown> | null;
  const conditions = (automation.conditions || []) as Array<{ field: string; operator: string; value: unknown }>;
  const actions = (automation.actions || []) as Array<{ type: string; config: Record<string, unknown> }>;

  // Get icon and gradient from shared constants
  const IconComponent = getAutomationIcon(automation.templateId || undefined);
  const gradient = getCategoryGradient(undefined);

  const successRate = automation.executedCount > 0
    ? Math.round((automation.successCount / automation.executedCount) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
    >
      <Card
        className={cn(
          "border-0 transition-all",
          !automation.enabled && "opacity-60"
        )}
        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
      >
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center bg-gradient-to-br shadow-md",
                  gradient
                )}
                style={{ borderRadius: RADIUS.button }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                  <Badge
                    variant={automation.enabled ? "default" : "secondary"}
                    className={cn(
                      "text-[10px]",
                      automation.enabled && "bg-violet-100 text-violet-700"
                    )}
                  >
                    {automation.enabled ? "Active" : "Paused"}
                  </Badge>
                </div>
                {automation.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{automation.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={automation.enabled}
                onCheckedChange={(checked) => onToggle(automation.id, checked)}
                disabled={isToggling}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(automation)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRun(automation.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(automation.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto py-2">
            {/* Trigger */}
            <div
              className="flex-shrink-0 px-3 py-2 bg-violet-50 border border-violet-200 min-w-[140px]"
              style={{ borderRadius: RADIUS.input }}
            >
              <div className="flex items-center gap-1.5 text-violet-700 text-[10px] font-medium mb-1">
                <Zap className="w-3 h-3" />
                TRIGGER
              </div>
              <p className="text-xs text-gray-700 truncate">
                {getTriggerDescription(triggerConfig, automation.triggerType)}
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />

            {/* Conditions */}
            {conditions.length > 0 && (
              <>
                <div
                  className="flex-shrink-0 px-3 py-2 bg-amber-50 border border-amber-200 min-w-[120px]"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-medium mb-1">
                    <Target className="w-3 h-3" />
                    IF
                  </div>
                  <p className="text-xs text-gray-700 truncate">
                    {formatConditionsSummary(conditions)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </>
            )}

            {/* Actions */}
            <div
              className="flex-shrink-0 px-3 py-2 bg-emerald-50 border border-emerald-200 min-w-[120px]"
              style={{ borderRadius: RADIUS.input }}
            >
              <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-medium mb-1">
                <CheckCircle2 className="w-3 h-3" />
                THEN
              </div>
              <p className="text-xs text-gray-700 truncate">
                {formatActionsSummary(actions)}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(automation.lastExecutedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {automation.executedCount} runs
            </span>
            {automation.executedCount > 0 && (
              <span className="flex items-center gap-1">
                {successRate >= 90 ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : successRate >= 70 ? (
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500" />
                )}
                {successRate}% success
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AutomationCard;
