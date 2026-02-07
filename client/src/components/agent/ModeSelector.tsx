/**
 * ModeSelector - Toggle between chat modes
 *
 * Modes:
 * - Single: One avatar responds
 * - Multi: Multiple avatars respond in parallel
 * - Debate: Avatars debate each other
 */

import { cn } from "@/lib/utils";
import { MessageSquare, Users, Swords } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export type ChatMode = "single" | "multi" | "debate";

export interface ModeSelectorProps {
  value: ChatMode;
  onChange: (mode: ChatMode) => void;

  // Options
  disabled?: boolean;
  disabledModes?: ChatMode[];  // Specific modes to disable

  // Visual options
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showDescriptions?: boolean;

  // Customization
  className?: string;
}

// =============================================================================
// MODE DEFINITIONS
// =============================================================================

interface ModeDefinition {
  id: ChatMode;
  label: string;
  description: string;
  Icon: React.ElementType;
}

const MODES: ModeDefinition[] = [
  {
    id: "single",
    label: "Single",
    description: "One avatar responds",
    Icon: MessageSquare,
  },
  {
    id: "multi",
    label: "Multi",
    description: "Multiple avatars respond",
    Icon: Users,
  },
  {
    id: "debate",
    label: "Debate",
    description: "Avatars discuss together",
    Icon: Swords,
  },
];

// =============================================================================
// SIZE MAPPINGS
// =============================================================================

const SIZE_CLASSES = {
  sm: {
    container: "p-1 gap-1",
    button: "px-2 py-1",
    icon: "w-3.5 h-3.5",
    label: "text-xs",
    description: "text-[10px]",
  },
  md: {
    container: "p-1 gap-1",
    button: "px-3 py-2",
    icon: "w-4 h-4",
    label: "text-sm",
    description: "text-xs",
  },
  lg: {
    container: "p-1.5 gap-2",
    button: "px-4 py-3",
    icon: "w-5 h-5",
    label: "text-base",
    description: "text-sm",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ModeSelector({
  value,
  onChange,
  disabled = false,
  disabledModes = [],
  size = "md",
  showLabels = true,
  showDescriptions = false,
  className,
}: ModeSelectorProps) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "inline-flex rounded-lg bg-muted",
        sizeClasses.container,
        className
      )}
      role="radiogroup"
      aria-label="Chat mode"
    >
      {MODES.map((mode) => {
        const isSelected = value === mode.id;
        const isDisabled = disabled || disabledModes.includes(mode.id);

        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${mode.label}: ${mode.description}`}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(mode.id)}
            className={cn(
              "flex items-center gap-2 rounded-md transition-all",
              sizeClasses.button,
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <mode.Icon className={sizeClasses.icon} aria-hidden="true" />

            {showLabels && (
              <div className="flex flex-col items-start">
                <span className={cn("font-medium", sizeClasses.label)}>
                  {mode.label}
                </span>
                {showDescriptions && (
                  <span className={cn("text-muted-foreground", sizeClasses.description)}>
                    {mode.description}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ModeSelector;
