/**
 * AvatarManagementPanel - Admin controls for avatar management
 *
 * Provides:
 * - List of all avatars with status
 * - Enable/disable toggle
 * - Quick stats per avatar
 * - Edit and delete actions
 * - Add new avatar button
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Plus,
  Edit2,
  Trash2,
  BarChart3,
  AlertCircle,
  Brain,
  Target,
  Heart,
  Shield,
  Flame,
  MessageSquare,
} from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export interface AvatarStats {
  sessionCount: number;
  messageCount: number;
  avgLatencyMs: number;
  errorCount: number;
  tokensUsed: number;
}

export interface AvatarWithStats extends Avatar {
  stats: AvatarStats;
}

export interface AvatarManagementPanelProps {
  avatars: AvatarWithStats[];

  // Actions
  onToggle: (avatarId: string, enabled: boolean) => void;
  onEdit: (avatar: Avatar) => void;
  onDelete: (avatarId: string) => void;
  onViewStats: (avatarId: string) => void;
  onAddNew: () => void;

  // State
  isLoading?: boolean;

  // Customization
  className?: string;
}

// =============================================================================
// AVATAR ICONS
// =============================================================================

const AVATAR_ICONS: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "persuasion-strategist": Flame,
  "objection-handler": MessageSquare,
};

const AVATAR_COLORS: Record<string, string> = {
  "insurance-expert": "bg-blue-500",
  "sales-closer": "bg-orange-500",
  "mindset-coach": "bg-purple-500",
  "compliance-specialist": "bg-emerald-500",
  "persuasion-strategist": "bg-red-500",
  "objection-handler": "bg-amber-500",
  "underwriting-analyst": "bg-indigo-500",
  "intensity-coach": "bg-rose-500",
};

// =============================================================================
// AVATAR CONTROL CARD
// =============================================================================

interface AvatarControlCardProps {
  avatar: AvatarWithStats;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewStats: () => void;
}

function AvatarControlCard({
  avatar,
  onToggle,
  onEdit,
  onDelete,
  onViewStats,
}: AvatarControlCardProps) {
  const Icon = AVATAR_ICONS[avatar.slug] || Bot;
  const bgColor = AVATAR_COLORS[avatar.slug] || "bg-gray-500";
  const hasErrors = avatar.stats.errorCount > 0;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card transition-all",
        !avatar.isActive && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar Icon */}
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", bgColor)}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{avatar.name}</h3>
            {hasErrors && (
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            )}
          </div>

          {/* Domains */}
          <div className="flex flex-wrap gap-1 mt-1">
            {avatar.domainExpertise.slice(0, 3).map((domain) => (
              <Badge key={domain} variant="secondary" className="text-xs">
                {domain}
              </Badge>
            ))}
            {avatar.domainExpertise.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{avatar.domainExpertise.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{avatar.stats.sessionCount} sessions</span>
            <span>{avatar.stats.messageCount} msgs</span>
            <span>{avatar.stats.avgLatencyMs}ms avg</span>
          </div>
        </div>

        {/* Enable Toggle */}
        <div className="flex flex-col items-end gap-2">
          <Switch
            checked={avatar.isActive}
            onCheckedChange={onToggle}
            aria-label={`${avatar.isActive ? "Disable" : "Enable"} ${avatar.name}`}
          />
          <span className="text-xs text-muted-foreground">
            Priority: {avatar.responsePriority}/10
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onViewStats} className="flex-1">
          <BarChart3 className="w-3 h-3 mr-1" />
          Stats
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AvatarManagementPanel({
  avatars,
  onToggle,
  onEdit,
  onDelete,
  onViewStats,
  onAddNew,
  isLoading = false,
  className,
}: AvatarManagementPanelProps) {
  const activeCount = avatars.filter((a) => a.isActive).length;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Avatar Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} of {avatars.length} active
            </p>
          </div>
          <Button size="sm" onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-1" />
            Add Avatar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {avatars.map((avatar) => (
              <AvatarControlCard
                key={avatar.id}
                avatar={avatar}
                onToggle={(enabled) => onToggle(avatar.id, enabled)}
                onEdit={() => onEdit(avatar)}
                onDelete={() => onDelete(avatar.id)}
                onViewStats={() => onViewStats(avatar.id)}
              />
            ))}

            {avatars.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No avatars configured</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onAddNew}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Avatar
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AvatarManagementPanel;
