/**
 * DebateControls - Debate session management controls
 *
 * Provides:
 * - Start/Stop debate
 * - Pause/Resume
 * - Turn count display
 * - Progress indicator
 * - Admin-only controls (if enabled)
 */

import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Plus,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

export type DebateStatus = "idle" | "active" | "paused" | "completed" | "interrupted";

export interface DebateControlsProps {
  // Debate state
  status: DebateStatus;
  currentTurn: number;
  maxTurns: number;

  // Handlers
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onExtend?: () => void;      // Admin: add more turns
  onSettings?: () => void;    // Open settings modal

  // Options
  isAdmin?: boolean;          // Show admin controls
  canExtend?: boolean;        // Allow extending turns
  disabled?: boolean;

  // Customization
  className?: string;
}

// =============================================================================
// STATUS LABELS
// =============================================================================

const STATUS_LABELS: Record<DebateStatus, string> = {
  idle: "Ready to start",
  active: "In progress",
  paused: "Paused",
  completed: "Completed",
  interrupted: "Interrupted",
};

const STATUS_COLORS: Record<DebateStatus, string> = {
  idle: "text-muted-foreground",
  active: "text-green-600 dark:text-green-400",
  paused: "text-amber-600 dark:text-amber-400",
  completed: "text-blue-600 dark:text-blue-400",
  interrupted: "text-red-600 dark:text-red-400",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function DebateControls({
  status,
  currentTurn,
  maxTurns,
  onStart,
  onPause,
  onResume,
  onStop,
  onExtend,
  onSettings,
  isAdmin = false,
  canExtend = false,
  disabled = false,
  className,
}: DebateControlsProps) {
  const isActive = status === "active";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const isFinished = status === "completed" || status === "interrupted";

  const progress = maxTurns > 0 ? (currentTurn / maxTurns) * 100 : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 border rounded-xl bg-card",
        className
      )}
      role="region"
      aria-label="Debate controls"
    >
      {/* ===== STATUS & PROGRESS ===== */}
      <div className="flex items-center justify-between">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          {isActive && (
            <Loader2 className="w-4 h-4 animate-spin text-green-500" aria-hidden="true" />
          )}
          <span className={cn("text-sm font-medium", STATUS_COLORS[status])}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* Turn counter */}
        <div className="text-sm text-muted-foreground">
          Turn <span className="font-semibold">{currentTurn}</span> / {maxTurns}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentTurn}
        aria-valuemin={0}
        aria-valuemax={maxTurns}
        aria-label="Debate progress"
      >
        <div
          className={cn(
            "h-full transition-all duration-500",
            isActive && "bg-green-500",
            isPaused && "bg-amber-500",
            isFinished && "bg-blue-500",
            isIdle && "bg-muted-foreground"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ===== CONTROL BUTTONS ===== */}
      <div className="flex items-center gap-2">
        {/* Start Button (idle state) */}
        {isIdle && (
          <Button
            onClick={onStart}
            disabled={disabled || !onStart}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Debate
          </Button>
        )}

        {/* Pause/Resume (active/paused state) */}
        {(isActive || isPaused) && (
          <>
            {isActive ? (
              <Button
                variant="outline"
                onClick={onPause}
                disabled={disabled || !onPause}
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={onResume}
                disabled={disabled || !onResume}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}

            {/* Stop Button */}
            <Button
              variant="destructive"
              size="icon"
              onClick={onStop}
              disabled={disabled || !onStop}
              aria-label="Stop debate"
            >
              <Square className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Restart (finished state) */}
        {isFinished && (
          <Button
            onClick={onStart}
            disabled={disabled || !onStart}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start New Debate
          </Button>
        )}
      </div>

      {/* ===== ADMIN CONTROLS ===== */}
      {isAdmin && (isActive || isPaused) && (
        <div className="flex items-center gap-2 pt-2 border-t">
          {/* Extend turns */}
          {canExtend && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExtend}
              disabled={disabled || !onExtend}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Turns
            </Button>
          )}

          {/* Skip to next turn */}
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !isActive}
            aria-label="Skip to next turn"
          >
            <SkipForward className="w-3 h-3 mr-1" />
            Skip
          </Button>

          {/* Settings */}
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              aria-label="Debate settings"
              className="ml-auto"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default DebateControls;
