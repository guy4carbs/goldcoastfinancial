/**
 * AdminHeader - Admin dashboard header with system status
 *
 * Displays:
 * - Dashboard title
 * - System health indicator
 * - Active debates count
 * - WebSocket connection status
 * - Last sync timestamp
 */

import { cn } from "@/lib/utils";
import { Activity, Swords, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

export type SystemHealth = "healthy" | "degraded" | "down";
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface SystemStats {
  health: SystemHealth;
  activeDebates: number;
  activeUsers: number;
  messagesLastHour: number;
  avgLatencyMs: number;
  errorRate: number;  // Percentage
}

export interface AdminHeaderProps {
  stats: SystemStats;
  connectionStatus: ConnectionStatus;
  lastSync?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// =============================================================================
// HEALTH INDICATOR
// =============================================================================

const HEALTH_CONFIG: Record<SystemHealth, { label: string; color: string; dotColor: string }> = {
  healthy: {
    label: "Healthy",
    color: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  degraded: {
    label: "Degraded",
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  down: {
    label: "Down",
    color: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function AdminHeader({
  stats,
  connectionStatus,
  lastSync,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  const healthConfig = HEALTH_CONFIG[stats.health];
  const isConnected = connectionStatus === "connected";

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* ===== LEFT: Title & Health ===== */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Admin Lounge</h1>

          {/* System Health */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                healthConfig.dotColor,
                stats.health === "healthy" && "animate-pulse"
              )}
              aria-hidden="true"
            />
            <span className={cn("text-sm font-medium", healthConfig.color)}>
              {healthConfig.label}
            </span>
          </div>
        </div>

        {/* ===== CENTER: Quick Stats ===== */}
        <div className="flex items-center gap-6">
          {/* Active Debates */}
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{stats.activeDebates}</span>
              <span className="text-muted-foreground ml-1">active debates</span>
            </span>
          </div>

          {/* Messages/Hour */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{stats.messagesLastHour}</span>
              <span className="text-muted-foreground ml-1">msgs/hr</span>
            </span>
          </div>

          {/* Avg Latency */}
          <div className="text-sm">
            <span className="font-semibold">{stats.avgLatencyMs}ms</span>
            <span className="text-muted-foreground ml-1">avg</span>
          </div>

          {/* Error Rate */}
          {stats.errorRate > 0 && (
            <Badge variant={stats.errorRate > 5 ? "destructive" : "secondary"}>
              {stats.errorRate.toFixed(1)}% errors
            </Badge>
          )}
        </div>

        {/* ===== RIGHT: Connection & Refresh ===== */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-sm",
                isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}
            >
              {connectionStatus}
            </span>
          </div>

          {/* Last Sync */}
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
