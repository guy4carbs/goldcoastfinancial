/**
 * ConnectionBadge - WebSocket connection status indicator
 *
 * Shows:
 * - Connection state (connected, disconnected, reconnecting, error)
 * - Visual indicator (color-coded dot with pulse animation)
 * - Reconnection attempts counter
 * - Optional retry button
 * - Optional queued messages indicator
 */

import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Loader2, RefreshCw, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "reconnecting" | "error";

export interface ConnectionBadgeProps {
  status: ConnectionStatus;

  // Visual options
  showLabel?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";

  // Reconnection details
  reconnectAttempts?: number;
  maxAttempts?: number;
  queuedMessages?: number;

  // Callbacks
  onRetry?: () => void;
  onCancel?: () => void;

  // Customization
  className?: string;
}

// =============================================================================
// STATUS MAPPINGS
// =============================================================================

const STATUS_CONFIG: Record<ConnectionStatus, {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  Icon: React.ElementType;
}> = {
  connected: {
    label: "Connected",
    dotColor: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-500/30",
    Icon: Wifi,
  },
  connecting: {
    label: "Connecting...",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
    Icon: Loader2,
  },
  disconnected: {
    label: "Disconnected",
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-500/10",
    textColor: "text-muted-foreground",
    borderColor: "border-gray-500/30",
    Icon: WifiOff,
  },
  reconnecting: {
    label: "Reconnecting",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
    Icon: RefreshCw,
  },
  error: {
    label: "Connection Error",
    dotColor: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/30",
    Icon: AlertCircle,
  },
};

// =============================================================================
// SIZE MAPPINGS
// =============================================================================

const SIZE_CONFIG = {
  sm: {
    container: "gap-1.5",
    dot: "w-1.5 h-1.5",
    icon: "w-3 h-3",
    text: "text-xs",
  },
  md: {
    container: "gap-2",
    dot: "w-2 h-2",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  lg: {
    container: "gap-2",
    dot: "w-2.5 h-2.5",
    icon: "w-5 h-5",
    text: "text-base",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ConnectionBadge({
  status,
  showLabel = true,
  showIcon = false,
  size = "sm",
  reconnectAttempts = 0,
  maxAttempts = 10,
  queuedMessages = 0,
  onRetry,
  onCancel,
  className,
}: ConnectionBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const isAnimated = status === "reconnecting" || status === "connecting";
  const showRetry = status === "error" || status === "disconnected";
  const showAttempts = status === "reconnecting" && reconnectAttempts > 0;

  // Generate label with attempt info
  const label = showAttempts
    ? `Reconnecting (${reconnectAttempts}/${maxAttempts})`
    : config.label;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "inline-flex items-center",
          sizeConfig.container,
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        {/* ===== STATUS DOT ===== */}
        {!showIcon && (
          <span
            className={cn(
              "rounded-full flex-shrink-0",
              sizeConfig.dot,
              config.dotColor,
              isAnimated && "animate-pulse"
            )}
            aria-hidden="true"
          />
        )}

        {/* ===== ICON (alternative to dot) ===== */}
        {showIcon && (
          <config.Icon
            className={cn(
              sizeConfig.icon,
              config.textColor,
              isAnimated && "animate-spin"
            )}
            aria-hidden="true"
          />
        )}

        {/* ===== LABEL ===== */}
        {showLabel && (
          <span className={cn(sizeConfig.text, config.textColor)}>
            {label}
          </span>
        )}

        {/* ===== QUEUED MESSAGES INDICATOR ===== */}
        {queuedMessages > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs font-medium">{queuedMessages}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{queuedMessages} message{queuedMessages > 1 ? 's' : ''} queued for sending</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* ===== RETRY BUTTON ===== */}
        {showRetry && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className={cn(
              "h-6 px-2 text-xs",
              config.textColor,
              "hover:bg-white/10"
            )}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}

        {/* ===== CANCEL RECONNECTION ===== */}
        {status === "reconnecting" && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}

// =============================================================================
// EXPANDED CONNECTION BANNER - For prominent display
// =============================================================================

export interface ConnectionBannerProps {
  status: ConnectionStatus;
  errorMessage?: string;
  reconnectAttempts?: number;
  maxAttempts?: number;
  queuedMessages?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ConnectionBanner({
  status,
  errorMessage,
  reconnectAttempts = 0,
  maxAttempts = 10,
  queuedMessages = 0,
  onRetry,
  onCancel,
  onDismiss,
  className,
}: ConnectionBannerProps) {
  const config = STATUS_CONFIG[status];

  // Don't show banner for connected state
  if (status === "connected") return null;

  const showAttempts = status === "reconnecting" && reconnectAttempts > 0;
  const showRetry = status === "error" || status === "disconnected";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2 rounded-lg border",
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <config.Icon
          className={cn(
            "w-5 h-5 flex-shrink-0",
            config.textColor,
            (status === "reconnecting" || status === "connecting") && "animate-spin"
          )}
        />
        <div className="flex flex-col">
          <span className={cn("font-medium text-sm", config.textColor)}>
            {showAttempts
              ? `Reconnecting... (attempt ${reconnectAttempts}/${maxAttempts})`
              : config.label}
          </span>
          {errorMessage && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {errorMessage}
            </span>
          )}
          {queuedMessages > 0 && (
            <span className="text-xs text-amber-400 mt-0.5">
              {queuedMessages} message{queuedMessages > 1 ? 's' : ''} will be sent when reconnected
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 border-white/20 hover:bg-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        )}
        {status === "reconnecting" && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
        {onDismiss && status !== "reconnecting" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-7 w-7 hover:bg-white/10"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

export default ConnectionBadge;
