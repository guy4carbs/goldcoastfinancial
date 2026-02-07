/**
 * DebateControlPanel - Admin controls for active debates
 *
 * Provides:
 * - List of active/paused debates
 * - Pause/Resume/Stop controls
 * - Inject message capability
 * - Force turn order
 * - Mute/unmute participants
 * - Global debate controls
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Swords,
  Play,
  Pause,
  Square,
  SkipForward,
  Syringe,
  VolumeX,
  Volume2,
  Plus,
  Minus,
  StopCircle,
  Trash2,
  Bot,
} from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export type DebateStatus = "active" | "paused" | "completed" | "interrupted";

export interface DebateParticipant {
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  isMuted: boolean;
  turnsTaken: number;
}

export interface ActiveDebate {
  id: string;
  topic: string;
  status: DebateStatus;
  participants: DebateParticipant[];
  currentTurn: number;
  maxTurns: number;
  currentSpeaker?: string;  // Avatar ID currently responding
  startedAt: string;
  totalTokens: number;
}

export interface DebateControlPanelProps {
  debates: ActiveDebate[];
  avatars: Avatar[];

  // Debate actions
  onPause: (debateId: string) => void;
  onResume: (debateId: string) => void;
  onStop: (debateId: string) => void;
  onInject: (debateId: string) => void;  // Opens inject modal
  onSkipTurn: (debateId: string) => void;
  onForceTurn: (debateId: string, avatarId: string) => void;
  onMuteParticipant: (debateId: string, avatarId: string) => void;
  onUnmuteParticipant: (debateId: string, avatarId: string) => void;
  onAddParticipant: (debateId: string) => void;
  onRemoveParticipant: (debateId: string, avatarId: string) => void;
  onExtendTurns: (debateId: string, additionalTurns: number) => void;

  // Global actions
  onPauseAll: () => void;
  onStopAll: () => void;
  onClearQueue: () => void;

  // State
  pendingQueueCount?: number;

  // Customization
  className?: string;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_CONFIG: Record<DebateStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: "Active", color: "text-green-600", bgColor: "bg-green-500" },
  paused: { label: "Paused", color: "text-amber-600", bgColor: "bg-amber-500" },
  completed: { label: "Completed", color: "text-blue-600", bgColor: "bg-blue-500" },
  interrupted: { label: "Interrupted", color: "text-red-600", bgColor: "bg-red-500" },
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
// DEBATE CARD
// =============================================================================

interface DebateCardProps {
  debate: ActiveDebate;
  avatars: Avatar[];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onInject: () => void;
  onSkipTurn: () => void;
  onForceTurn: (avatarId: string) => void;
  onMuteParticipant: (avatarId: string) => void;
  onUnmuteParticipant: (avatarId: string) => void;
  onExtendTurns: (additionalTurns: number) => void;
}

function DebateCard({
  debate,
  avatars,
  onPause,
  onResume,
  onStop,
  onInject,
  onSkipTurn,
  onForceTurn,
  onMuteParticipant,
  onUnmuteParticipant,
  onExtendTurns,
}: DebateCardProps) {
  const [forceTurnAvatar, setForceTurnAvatar] = useState<string>("");

  const statusConfig = STATUS_CONFIG[debate.status];
  const progress = (debate.currentTurn / debate.maxTurns) * 100;
  const isActive = debate.status === "active";
  const isPaused = debate.status === "paused";
  const canControl = isActive || isPaused;

  const startedAgo = getTimeAgo(new Date(debate.startedAt));

  return (
    <div className="p-4 rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", statusConfig.bgColor)}>
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {debate.id.slice(0, 12)}
            </span>
          </div>
          <h4 className="font-semibold mt-1 truncate" title={debate.topic}>
            "{debate.topic}"
          </h4>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-center gap-2 my-3">
        {debate.participants.map((p, idx) => {
          const bgColor = AVATAR_COLORS[p.avatarSlug] || "bg-gray-500";
          const isCurrentSpeaker = p.avatarId === debate.currentSpeaker;

          return (
            <div key={p.avatarId} className="flex items-center gap-2">
              {idx > 0 && <span className="text-lg font-bold text-muted-foreground">vs</span>}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    bgColor,
                    p.isMuted && "opacity-40",
                    isCurrentSpeaker && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs mt-1 truncate max-w-[80px]">
                  {p.avatarName.split(" ")[0]}
                </span>
                <div className="flex gap-1 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => p.isMuted ? onUnmuteParticipant(p.avatarId) : onMuteParticipant(p.avatarId)}
                    disabled={!canControl}
                  >
                    {p.isMuted ? (
                      <VolumeX className="w-3 h-3 text-destructive" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Turn {debate.currentTurn} of {debate.maxTurns}</span>
          <span>Started {startedAgo}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground text-right">
          {debate.totalTokens.toLocaleString()} tokens used
        </div>
      </div>

      {/* Primary Controls */}
      <div className="flex items-center gap-2 mb-3">
        {isActive ? (
          <Button variant="outline" size="sm" onClick={onPause} className="flex-1">
            <Pause className="w-3 h-3 mr-1" />
            Pause
          </Button>
        ) : isPaused ? (
          <Button variant="outline" size="sm" onClick={onResume} className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Resume
          </Button>
        ) : null}

        <Button variant="destructive" size="sm" onClick={onStop} disabled={!canControl}>
          <Square className="w-3 h-3 mr-1" />
          Stop
        </Button>

        <Button variant="outline" size="sm" onClick={onInject} disabled={!canControl}>
          <Syringe className="w-3 h-3 mr-1" />
          Inject
        </Button>

        <Button variant="outline" size="sm" onClick={onSkipTurn} disabled={!isActive}>
          <SkipForward className="w-3 h-3" />
        </Button>
      </div>

      {/* Advanced Controls */}
      <div className="flex items-center gap-2 pt-3 border-t">
        {/* Force Turn */}
        <div className="flex items-center gap-1 flex-1">
          <Select value={forceTurnAvatar} onValueChange={setForceTurnAvatar}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Force turn..." />
            </SelectTrigger>
            <SelectContent>
              {debate.participants.map((p) => (
                <SelectItem key={p.avatarId} value={p.avatarId}>
                  {p.avatarName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (forceTurnAvatar) {
                onForceTurn(forceTurnAvatar);
                setForceTurnAvatar("");
              }
            }}
            disabled={!forceTurnAvatar || !isActive}
            className="h-8"
          >
            Force
          </Button>
        </div>

        {/* Extend Turns */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExtendTurns(2)}
          disabled={!canControl}
          className="h-8"
        >
          <Plus className="w-3 h-3 mr-1" />
          +2 Turns
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER
// =============================================================================

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DebateControlPanel({
  debates,
  avatars,
  onPause,
  onResume,
  onStop,
  onInject,
  onSkipTurn,
  onForceTurn,
  onMuteParticipant,
  onUnmuteParticipant,
  onAddParticipant,
  onRemoveParticipant,
  onExtendTurns,
  onPauseAll,
  onStopAll,
  onClearQueue,
  pendingQueueCount = 0,
  className,
}: DebateControlPanelProps) {
  const activeCount = debates.filter((d) => d.status === "active").length;
  const pausedCount = debates.filter((d) => d.status === "paused").length;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Swords className="w-5 h-5" />
              Debate Control
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} active · {pausedCount} paused
              {pendingQueueCount > 0 && ` · ${pendingQueueCount} queued`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Debate Cards */}
            {debates.map((debate) => (
              <DebateCard
                key={debate.id}
                debate={debate}
                avatars={avatars}
                onPause={() => onPause(debate.id)}
                onResume={() => onResume(debate.id)}
                onStop={() => onStop(debate.id)}
                onInject={() => onInject(debate.id)}
                onSkipTurn={() => onSkipTurn(debate.id)}
                onForceTurn={(avatarId) => onForceTurn(debate.id, avatarId)}
                onMuteParticipant={(avatarId) => onMuteParticipant(debate.id, avatarId)}
                onUnmuteParticipant={(avatarId) => onUnmuteParticipant(debate.id, avatarId)}
                onExtendTurns={(turns) => onExtendTurns(debate.id, turns)}
              />
            ))}

            {debates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active debates</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Global Controls Footer */}
        {debates.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Global Controls</h4>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPauseAll}>
                <Pause className="w-3 h-3 mr-1" />
                Pause All
              </Button>
              <Button variant="destructive" size="sm" onClick={onStopAll}>
                <StopCircle className="w-3 h-3 mr-1" />
                Stop All
              </Button>
              {pendingQueueCount > 0 && (
                <Button variant="outline" size="sm" onClick={onClearQueue}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Queue ({pendingQueueCount})
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DebateControlPanel;
