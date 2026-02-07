/**
 * MessageBubble - Individual message display with avatar attribution
 *
 * Displays a single message in the chat with:
 * - Avatar icon and name (for avatar messages)
 * - Timestamp
 * - Token count
 * - Markdown rendering
 * - Streaming indicator
 */

import { cn } from "@/lib/utils";
import { User, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { AvatarMessage, Avatar } from "@/lib/avatarCouncilStore";
import { VoicePlaybackControl } from "./VoicePlaybackControl";

// =============================================================================
// TYPES
// =============================================================================

export interface MessageBubbleProps {
  message: AvatarMessage;
  avatars: Avatar[];

  // Streaming state
  isStreaming?: boolean;
  streamingContent?: string;

  // Display options
  showTimestamp?: boolean;
  showTokenCount?: boolean;
  showVoicePlayback?: boolean;

  // Avatar visual mappings (passed from parent)
  avatarIcons?: Record<string, React.ElementType>;
  avatarColors?: Record<string, string>;
}

// =============================================================================
// DEFAULT MAPPINGS
// =============================================================================

const DEFAULT_AVATAR_ICONS: Record<string, React.ElementType> = {
  "insurance-expert": Bot,
  "sales-closer": Bot,
  "mindset-coach": Bot,
  "compliance-specialist": Bot,
  "persuasion-strategist": Bot,
  "objection-handler": Bot,
  "underwriting-analyst": Bot,
  "intensity-coach": Bot,
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
// HELPER: FORMAT TIMESTAMP
// =============================================================================

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MessageBubble({
  message,
  avatars,
  isStreaming = false,
  streamingContent,
  showTimestamp = true,
  showTokenCount = true,
  showVoicePlayback = false,
  avatarIcons = DEFAULT_AVATAR_ICONS,
  avatarColors = DEFAULT_AVATAR_COLORS,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatar = avatars.find((a) => a.id === message.avatarId);
  const avatarSlug = avatar?.slug || "";

  const Icon = avatarIcons[avatarSlug] || Bot;
  const bgColor = avatarColors[avatarSlug] || "bg-gray-500";

  const content = isStreaming ? streamingContent || "" : message.content;

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      role="article"
      aria-label={isUser ? "Your message" : `Message from ${avatar?.name || "AI"}`}
    >
      {/* ===== AVATAR ICON ===== */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary" : bgColor
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* ===== MESSAGE CONTENT ===== */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted rounded-tl-sm"
        )}
      >
        {/* Avatar Name Header */}
        {!isUser && avatar && (
          <div className="font-semibold text-sm mb-1 flex items-center gap-2">
            <span>{avatar.name}</span>
            {isStreaming && (
              <Loader2 className="w-3 h-3 animate-spin" aria-label="Generating response" />
            )}
          </div>
        )}

        {/* Message Text with Markdown */}
        <div
          className={cn(
            "text-sm prose prose-sm max-w-none",
            isUser ? "prose-invert" : ""
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
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-current pl-3 italic opacity-80">
                  {children}
                </blockquote>
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

        {/* ===== FOOTER: Timestamp, Tokens, Voice ===== */}
        {!isUser && !isStreaming && (
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground opacity-60">
            <div className="flex items-center gap-2">
              {showTimestamp && message.createdAt && (
                <span>{formatTimestamp(message.createdAt)}</span>
              )}
              {showTimestamp && showTokenCount && message.tokensUsed && (
                <span aria-hidden="true">·</span>
              )}
              {showTokenCount && message.tokensUsed && (
                <span>{message.tokensUsed} tokens</span>
              )}
            </div>

            {/* Voice Playback (Future) */}
            {showVoicePlayback && avatar && (
              <VoicePlaybackControl
                content={message.content}
                avatarId={avatar.id}
                compact
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
