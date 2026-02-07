/**
 * ChatInput - Message composition and submission
 *
 * Handles:
 * - Text input with auto-resize
 * - Submit on Enter (Shift+Enter for newline)
 * - Submit button
 * - Disabled state during streaming
 * - Character count (optional)
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatInputProps {
  onSubmit: (message: string) => void;

  // State
  disabled?: boolean;
  isStreaming?: boolean;

  // Display options
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;

  // Customization
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChatInput({
  onSubmit,
  disabled = false,
  isStreaming = false,
  placeholder = "Ask your question...",
  maxLength = 4000,
  showCharCount = false,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = disabled || isStreaming;
  const canSubmit = value.trim().length > 0 && !isDisabled;

  // ===== AUTO-RESIZE TEXTAREA =====
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // ===== SUBMIT HANDLER =====
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    const trimmed = value.trim();
    onSubmit(trimmed);
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [canSubmit, value, onSubmit]);

  // ===== KEYBOARD HANDLER =====
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // ===== CHARACTER COUNT =====
  const charCount = value.length;
  const charCountDisplay = showCharCount ? `${charCount}/${maxLength}` : null;
  const isOverLimit = charCount > maxLength;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-end gap-2 p-2 border rounded-xl bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          isDisabled && "opacity-60"
        )}
      >
        {/* ===== TEXT INPUT ===== */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxLength + 100))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent border-0 outline-none",
            "text-sm placeholder:text-muted-foreground",
            "min-h-[40px] max-h-[200px] py-2 px-2",
            isOverLimit && "text-destructive"
          )}
          aria-label="Message input"
          aria-describedby={showCharCount ? "char-count" : undefined}
        />

        {/* ===== SUBMIT BUTTON ===== */}
        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-10 w-10 rounded-lg flex-shrink-0"
          aria-label={isStreaming ? "Waiting for response" : "Send message"}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* ===== CHARACTER COUNT ===== */}
      {showCharCount && (
        <div
          id="char-count"
          className={cn(
            "absolute right-14 bottom-4 text-xs",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {charCountDisplay}
        </div>
      )}
    </div>
  );
}

export default ChatInput;
