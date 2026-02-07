/**
 * DebateParticipantCard - Avatar card showing debate participation status
 *
 * Displays:
 * - Avatar info (name, image/icon)
 * - Assigned stance
 * - Active/inactive state (whose turn)
 * - Muted state (if admin muted)
 * - Turn count for this participant
 */

import { cn } from "@/lib/utils";
import { Bot, Mic, MicOff, Volume2 } from "lucide-react";
import type { Avatar } from "@/lib/avatarCouncilStore";
import type { DebateStance } from "./DebateTurnCard";

// =============================================================================
// TYPES
// =============================================================================

export interface DebateParticipantCardProps {
  avatar: Avatar;

  // Debate state
  stance?: DebateStance;
  isActive?: boolean;       // Currently responding
  isMuted?: boolean;        // Admin muted
  turnsTaken?: number;

  // Visual options
  size?: "sm" | "md" | "lg";
  showStance?: boolean;
  showTurnCount?: boolean;

  // Avatar visual mappings
  avatarColors?: Record<string, string>;
  avatarIcons?: Record<string, React.ElementType>;
}

// =============================================================================
// STANCE MAPPINGS
// =============================================================================

const STANCE_LABELS: Record<DebateStance, string> = {
  advocate: "Advocate",
  challenger: "Challenger",
  evaluator: "Evaluator",
  devils_advocate: "Devil's Adv.",
};

const STANCE_ICONS: Record<DebateStance, string> = {
  advocate: "👍",
  challenger: "⚔️",
  evaluator: "⚖️",
  devils_advocate: "😈",
};

const DEFAULT_AVATAR_COLORS: Record<string, string> = {
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
// SIZE MAPPINGS
// =============================================================================

const SIZE_CLASSES = {
  sm: {
    card: "p-2",
    avatar: "w-8 h-8",
    icon: "w-4 h-4",
    name: "text-xs",
    stance: "text-[10px]",
  },
  md: {
    card: "p-3",
    avatar: "w-10 h-10",
    icon: "w-5 h-5",
    name: "text-sm",
    stance: "text-xs",
  },
  lg: {
    card: "p-4",
    avatar: "w-12 h-12",
    icon: "w-6 h-6",
    name: "text-base",
    stance: "text-sm",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function DebateParticipantCard({
  avatar,
  stance,
  isActive = false,
  isMuted = false,
  turnsTaken = 0,
  size = "md",
  showStance = true,
  showTurnCount = true,
  avatarColors = DEFAULT_AVATAR_COLORS,
  avatarIcons,
}: DebateParticipantCardProps) {
  const sizeClasses = SIZE_CLASSES[size];
  const bgColor = avatarColors[avatar.slug] || "bg-gray-500";
  const Icon = avatarIcons?.[avatar.slug] || Bot;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        sizeClasses.card,
        isActive
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-background",
        isMuted && "opacity-50"
      )}
      role="listitem"
      aria-label={`${avatar.name}${isActive ? " (speaking)" : ""}${isMuted ? " (muted)" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* ===== AVATAR ICON ===== */}
        <div className="relative">
          <div
            className={cn(
              "rounded-full flex items-center justify-center",
              sizeClasses.avatar,
              bgColor
            )}
          >
            <Icon className={cn(sizeClasses.icon, "text-white")} />
          </div>

          {/* Active indicator (pulsing ring) */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: "currentColor" }}
              aria-hidden="true"
            />
          )}

          {/* Muted badge */}
          {isMuted && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <MicOff className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* ===== INFO ===== */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className={cn("font-semibold truncate", sizeClasses.name)}>
            {avatar.name}
          </div>

          {/* Stance */}
          {showStance && stance && (
            <div className={cn("text-muted-foreground flex items-center gap-1", sizeClasses.stance)}>
              <span>{STANCE_ICONS[stance]}</span>
              <span>{STANCE_LABELS[stance]}</span>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDE INDICATORS ===== */}
        <div className="flex flex-col items-end gap-1">
          {/* Active speaking indicator */}
          {isActive && !isMuted && (
            <Volume2 className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" />
          )}

          {/* Turn count */}
          {showTurnCount && turnsTaken > 0 && (
            <span className={cn("text-muted-foreground", sizeClasses.stance)}>
              {turnsTaken} {turnsTaken === 1 ? "turn" : "turns"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebateParticipantCard;
