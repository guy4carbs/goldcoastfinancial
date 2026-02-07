/**
 * SelectionBar - Horizontal bar showing selected avatars
 *
 * Displays:
 * - Selected avatar chips (clickable to remove)
 * - Count of selections
 * - Clear all button
 * - Overflow handling for many selections
 */

import { cn } from "@/lib/utils";
import { X, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export interface SelectionBarProps {
  selectedAvatars: Avatar[];
  onRemove: (avatarId: string) => void;
  onClearAll: () => void;

  // Limits
  maxVisible?: number;        // Max chips to show before overflow

  // Visual options
  showClearAll?: boolean;
  showCount?: boolean;

  // Avatar visual mappings
  avatarColors?: Record<string, string>;

  // Customization
  className?: string;
}

// =============================================================================
// DEFAULT COLORS
// =============================================================================

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
// AVATAR CHIP COMPONENT
// =============================================================================

interface AvatarChipProps {
  avatar: Avatar;
  onRemove: () => void;
  color: string;
}

function AvatarChip({ avatar, onRemove, color }: AvatarChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full",
        "bg-muted hover:bg-muted/80 transition-colors"
      )}
    >
      {/* Mini avatar indicator */}
      <div
        className={cn("w-4 h-4 rounded-full flex items-center justify-center", color)}
      >
        <Bot className="w-2.5 h-2.5 text-white" />
      </div>

      {/* Name */}
      <span className="text-xs font-medium truncate max-w-[100px]">
        {avatar.name}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          "hover:bg-destructive/20 hover:text-destructive transition-colors"
        )}
        aria-label={`Remove ${avatar.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SelectionBar({
  selectedAvatars,
  onRemove,
  onClearAll,
  maxVisible = 5,
  showClearAll = true,
  showCount = true,
  avatarColors = DEFAULT_AVATAR_COLORS,
  className,
}: SelectionBarProps) {
  const count = selectedAvatars.length;

  if (count === 0) {
    return null;
  }

  const visibleAvatars = selectedAvatars.slice(0, maxVisible);
  const overflowCount = count - maxVisible;
  const hasOverflow = overflowCount > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-muted/50",
        className
      )}
      role="region"
      aria-label={`${count} avatar${count !== 1 ? "s" : ""} selected`}
    >
      {/* ===== SELECTION INDICATOR ===== */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Users className="w-4 h-4" />
        {showCount && (
          <span className="text-xs font-medium">{count}</span>
        )}
      </div>

      {/* ===== AVATAR CHIPS ===== */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
        {visibleAvatars.map((avatar) => (
          <AvatarChip
            key={avatar.id}
            avatar={avatar}
            onRemove={() => onRemove(avatar.id)}
            color={avatarColors[avatar.slug] || "bg-gray-500"}
          />
        ))}

        {/* Overflow indicator */}
        {hasOverflow && (
          <span className="text-xs text-muted-foreground px-2">
            +{overflowCount} more
          </span>
        )}
      </div>

      {/* ===== CLEAR ALL ===== */}
      {showClearAll && count > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

export default SelectionBar;
