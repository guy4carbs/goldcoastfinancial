/**
 * ObservabilityPanel - Log viewer for admin dashboard
 *
 * Displays:
 * - Streaming log entries
 * - Filters by type, severity, avatar, time
 * - Search functionality
 * - Expandable log details
 * - Pagination
 * - Export capability
 */

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  Route,
  Swords,
  Zap,
  WifiOff,
  Shield,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export type LogEntryType =
  | "prompt"
  | "routing"
  | "response_start"
  | "response_end"
  | "debate_start"
  | "debate_turn"
  | "debate_end"
  | "admin_action"
  | "error"
  | "rate_limit"
  | "websocket";

export type LogSeverity = "info" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogEntryType;
  severity: LogSeverity;
  summary: string;
  details: Record<string, any>;
  userId?: string;
  sessionId?: string;
  debateId?: string;
  avatarId?: string;
  avatarName?: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  tags: string[];
}

export interface ObservabilityPanelProps {
  logs: LogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;

  // Filters
  onFilterChange: (filters: LogFilters) => void;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;

  // Actions
  onRefresh: () => void;
  onExport: () => void;

  // State
  isLoading?: boolean;
  autoRefresh?: boolean;
  onAutoRefreshChange?: (enabled: boolean) => void;

  // Avatar list for filter
  avatars: Array<{ id: string; name: string }>;

  // Customization
  className?: string;
}

export interface LogFilters {
  type?: LogEntryType | "all";
  severity?: LogSeverity | "all";
  avatarId?: string | "all";
  timeRange?: "1h" | "6h" | "24h" | "7d" | "all";
}

// =============================================================================
// TYPE CONFIG
// =============================================================================

const TYPE_CONFIG: Record<LogEntryType, { icon: React.ElementType; label: string; color: string }> = {
  prompt: { icon: MessageSquare, label: "Prompt", color: "text-blue-500" },
  routing: { icon: Route, label: "Routing", color: "text-purple-500" },
  response_start: { icon: Zap, label: "Response Start", color: "text-green-500" },
  response_end: { icon: Zap, label: "Response End", color: "text-green-600" },
  debate_start: { icon: Swords, label: "Debate Start", color: "text-orange-500" },
  debate_turn: { icon: Swords, label: "Debate Turn", color: "text-orange-400" },
  debate_end: { icon: Swords, label: "Debate End", color: "text-orange-600" },
  admin_action: { icon: Shield, label: "Admin Action", color: "text-indigo-500" },
  error: { icon: AlertCircle, label: "Error", color: "text-red-500" },
  rate_limit: { icon: AlertTriangle, label: "Rate Limit", color: "text-amber-500" },
  websocket: { icon: WifiOff, label: "WebSocket", color: "text-gray-500" },
};

const SEVERITY_CONFIG: Record<LogSeverity, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
};

// =============================================================================
// LOG ENTRY COMPONENT
// =============================================================================

interface LogEntryCardProps {
  entry: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function LogEntryCard({ entry, isExpanded, onToggle }: LogEntryCardProps) {
  const typeConfig = TYPE_CONFIG[entry.type];
  const severityConfig = SEVERITY_CONFIG[entry.severity];
  const TypeIcon = typeConfig.icon;

  const timestamp = new Date(entry.timestamp);
  const timeStr = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entry.details, null, 2));
  };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        severityConfig.bgColor
      )}
    >
      {/* Summary Row */}
      <button
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {/* Expand icon */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        )}

        {/* Timestamp */}
        <span className="text-xs font-mono text-muted-foreground w-24 flex-shrink-0">
          {timeStr}
        </span>

        {/* Severity */}
        <Badge variant="outline" className={cn("text-xs", severityConfig.color)}>
          {entry.severity.toUpperCase()}
        </Badge>

        {/* Type */}
        <div className={cn("flex items-center gap-1", typeConfig.color)}>
          <TypeIcon className="w-4 h-4" />
          <span className="text-xs font-medium">{typeConfig.label}</span>
        </div>

        {/* Summary */}
        <span className="flex-1 text-sm truncate">{entry.summary}</span>

        {/* Metrics */}
        {entry.latencyMs && (
          <span className="text-xs text-muted-foreground">
            {entry.latencyMs}ms
          </span>
        )}
        {(entry.tokensIn || entry.tokensOut) && (
          <span className="text-xs text-muted-foreground">
            {entry.tokensIn ?? 0}→{entry.tokensOut ?? 0} tok
          </span>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-3 bg-background/50">
          {/* Context info */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
            {entry.userId && <span>User: {entry.userId}</span>}
            {entry.sessionId && <span>Session: {entry.sessionId}</span>}
            {entry.debateId && <span>Debate: {entry.debateId}</span>}
            {entry.avatarName && <span>Avatar: {entry.avatarName}</span>}
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* JSON Details */}
          <div className="relative">
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-[300px]">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleCopyJson}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ObservabilityPanel({
  logs,
  totalCount,
  page,
  pageSize,
  onFilterChange,
  onSearch,
  onPageChange,
  onRefresh,
  onExport,
  isLoading = false,
  autoRefresh = true,
  onAutoRefreshChange,
  avatars,
  className,
}: ObservabilityPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LogFilters>({
    type: "all",
    severity: "all",
    avatarId: "all",
    timeRange: "1h",
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Observability Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            {onAutoRefreshChange && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={(c) => onAutoRefreshChange(c === true)}
                />
                <label htmlFor="auto-refresh" className="text-xs text-muted-foreground">
                  Auto-refresh
                </label>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>

            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="p-3 border-b bg-muted/30 flex flex-wrap items-center gap-3">
        {/* Type filter */}
        <Select
          value={filters.type}
          onValueChange={(v) => handleFilterChange("type", v)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Severity filter */}
        <Select
          value={filters.severity}
          onValueChange={(v) => handleFilterChange("severity", v)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Avatar filter */}
        <Select
          value={filters.avatarId}
          onValueChange={(v) => handleFilterChange("avatarId", v)}
        >
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Avatar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Avatars</SelectItem>
            {avatars.map((avatar) => (
              <SelectItem key={avatar.id} value={avatar.id}>
                {avatar.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time range */}
        <Select
          value={filters.timeRange}
          onValueChange={(v) => handleFilterChange("timeRange", v)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="flex items-center gap-1 flex-1 min-w-[200px]">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-8"
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Log List */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {logs.map((entry) => (
              <LogEntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedIds.has(entry.id)}
                onToggle={() => toggleExpanded(entry.id)}
              />
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No logs match your filters</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/30">
        <span className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ObservabilityPanel;
