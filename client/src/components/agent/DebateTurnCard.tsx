/**
 * DebateTurnCard - Visual representation of a debate turn
 *
 * Displays:
 * - Turn number indicator
 * - Avatar info with stance badge
 * - Response content (streaming or complete)
 * - Turn metadata (tokens, timing)
 * - Connection lines to show conversation flow
 */

import { cn } from "@/lib/utils";
import { Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Avatar } from "@/lib/avatarCouncilStore";

// =============================================================================
// TYPES
// =============================================================================

export type DebateStance = "advocate" | "challenger" | "evaluator" | "devils_advocate";

export interface DebateTurn {
  id: string;
  turnNumber: number;
  avatarId: string;
  stance?: DebateStance;
  content: string;
  tokensUsed?: number;
  createdAt: string;
  respondingTo?: string; // ID of turn being responded to
}

export interface DebateTurnCardProps {
  turn: DebateTurn;
  avatar: Avatar | undefined;

  // Streaming state
  isStreaming?: boolean;
  streamingContent?: string;

  // Visual options
  showTurnNumber?: boolean;
  showStance?: boolean;
  showConnector?: boolean;
  isFirst?: boolean;
  isLast?: boolean;

  // Avatar visual mappings
  avatarColors?: Record<string, string>;
}

// =============================================================================
// STANCE MAPPINGS
// =============================================================================

const STANCE_LABELS: Record<DebateStance, string> = {
  advocate: "Advocating",
  challenger: "Challenging",
  evaluator: "Evaluating",
  devils_advocate: "Devil's Advocate",
};

const STANCE_COLORS: Record<DebateStance, string> = {
  advocate: "bg-green-500/20 text-green-700 dark:text-green-300",
  challenger: "bg-red-500/20 text-red-700 dark:text-red-300",
  evaluator: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  devils_advocate: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
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
// COMPONENT
// =============================================================================

export function DebateTurnCard({
  turn,
  avatar,
  isStreaming = false,
  streamingContent,
  showTurnNumber = true,
  showStance = true,
  showConnector = true,
  isFirst = false,
  isLast = false,
  avatarColors = DEFAULT_AVATAR_COLORS,
}: DebateTurnCardProps) {
  const avatarSlug = avatar?.slug || "";
  const bgColor = avatarColors[avatarSlug] || "bg-gray-500";
  const content = isStreaming ? streamingContent || "" : turn.content;

  return (
    <div
      className={cn(
        "relative flex gap-4",
        !isLast && showConnector && "pb-6"
      )}
      role="article"
      aria-label={`Turn ${turn.turnNumber}: ${avatar?.name || "Unknown"}`}
    >
      {/* ===== CONNECTOR LINE ===== */}
      {showConnector && !isLast && (
        <div
          className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"
          aria-hidden="true"
        />
      )}

      {/* ===== TURN NUMBER / AVATAR ICON ===== */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Turn number badge */}
        {showTurnNumber && (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "text-white font-semibold text-sm",
              bgColor
            )}
          >
            {turn.turnNumber}
          </div>
        )}
        {!showTurnNumber && (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              bgColor
            )}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* ===== CONTENT CARD ===== */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">
            {avatar?.name || "Unknown Avatar"}
          </span>

          {/* Stance Badge */}
          {showStance && turn.stance && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                STANCE_COLORS[turn.stance]
              )}
            >
              {STANCE_LABELS[turn.stance]}
            </span>
          )}

          {/* Streaming Indicator */}
          {isStreaming && (
            <Loader2
              className="w-3 h-3 animate-spin text-muted-foreground"
              aria-label="Generating response"
            />
          )}
        </div>

        {/* Response Content */}
        <div
          className={cn(
            "rounded-xl px-4 py-3 bg-muted",
            "prose prose-sm max-w-none text-sm"
          )}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Streaming cursor */}
          {isStreaming && (
            <span
              className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Footer Metadata */}
        {!isStreaming && turn.tokensUsed && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{turn.tokensUsed} tokens</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebateTurnCard;
