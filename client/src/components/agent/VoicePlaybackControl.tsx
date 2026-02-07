/**
 * VoicePlaybackControl - Voice synthesis playback controls
 *
 * PLACEHOLDER COMPONENT - Future ElevenLabs integration
 *
 * Will provide:
 * - Play/Pause voice playback
 * - Progress indicator
 * - Speed control
 * - Voice selection (per avatar)
 */

import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

export interface VoicePlaybackControlProps {
  content: string;          // Text to synthesize
  avatarId: string;         // For voice selection

  // Visual options
  compact?: boolean;
  showProgress?: boolean;

  // Customization
  className?: string;
}

// =============================================================================
// COMPONENT (PLACEHOLDER)
// =============================================================================

export function VoicePlaybackControl({
  content,
  avatarId,
  compact = false,
  showProgress = false,
  className,
}: VoicePlaybackControlProps) {
  // PLACEHOLDER: Voice playback not yet implemented
  // This component will integrate with ElevenLabs TTS API

  const isPlaying = false;
  const progress = 0;
  const isEnabled = false; // Voice feature flag

  if (!isEnabled) {
    // Return minimal placeholder when voice is not enabled
    return null;
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", className)}
        disabled
        aria-label="Voice playback (coming soon)"
      >
        <Volume2 className="w-3 h-3 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-muted/50",
        className
      )}
      role="region"
      aria-label="Voice playback controls"
    >
      {/* ===== PLAY/PAUSE ===== */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* ===== PROGRESS BAR ===== */}
      {showProgress && (
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ===== MUTE TOGGLE ===== */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled
        aria-label="Toggle mute"
      >
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

export default VoicePlaybackControl;
