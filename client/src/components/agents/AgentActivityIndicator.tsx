/**
 * AgentActivityIndicator
 * Displays real-time AI agent activity status
 * Subscribes to 'agents' WebSocket channel for live updates
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChannel } from '@/providers/WebSocketProvider';
import {
  Bot,
  Activity,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// TYPES
// =============================================================================

export type AgentStatus = 'running' | 'idle' | 'paused' | 'error' | 'starting';

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  tier: number;
  currentAction?: string;
  lastHeartbeat: number;
  metrics?: {
    tasksCompleted?: number;
    successRate?: number;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLORS: Record<AgentStatus, { bg: string; pulse: string; text: string }> = {
  running: { bg: 'bg-emerald-500', pulse: 'bg-emerald-400', text: 'text-emerald-600' },
  idle: { bg: 'bg-gray-400', pulse: 'bg-gray-300', text: 'text-gray-500' },
  paused: { bg: 'bg-amber-500', pulse: 'bg-amber-400', text: 'text-amber-600' },
  error: { bg: 'bg-red-500', pulse: 'bg-red-400', text: 'text-red-600' },
  starting: { bg: 'bg-blue-500', pulse: 'bg-blue-400', text: 'text-blue-600' },
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  running: 'Active',
  idle: 'Idle',
  paused: 'Paused',
  error: 'Error',
  starting: 'Starting',
};

// =============================================================================
// MOCK DATA (will be replaced by WebSocket data)
// =============================================================================

const INITIAL_AGENTS: AgentState[] = [
  { id: 'orchestrator', name: 'Orchestrator', status: 'running', tier: 0, currentAction: 'Routing tasks', lastHeartbeat: Date.now() },
  { id: 'lead-discovery', name: 'Lead Discovery', status: 'running', tier: 1, currentAction: 'Scanning sources', lastHeartbeat: Date.now() },
  { id: 'intake', name: 'Intake Agent', status: 'running', tier: 1, lastHeartbeat: Date.now() },
  { id: 'enrichment', name: 'Enrichment Agent', status: 'idle', tier: 1, lastHeartbeat: Date.now() },
  { id: 'scoring', name: 'Lead Scoring', status: 'running', tier: 1, currentAction: 'Scoring Maria G.', lastHeartbeat: Date.now() },
  { id: 'dialer', name: 'Dialer Agent', status: 'running', tier: 2, currentAction: 'Calling John S.', lastHeartbeat: Date.now() },
  { id: 'email', name: 'Email Agent', status: 'idle', tier: 2, lastHeartbeat: Date.now() },
  { id: 'sms', name: 'SMS Agent', status: 'idle', tier: 2, lastHeartbeat: Date.now() },
  { id: 'compliance', name: 'Compliance Agent', status: 'running', tier: 5, lastHeartbeat: Date.now() },
  { id: 'commission', name: 'Commission Agent', status: 'idle', tier: 6, lastHeartbeat: Date.now() },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface AgentActivityIndicatorProps {
  mode?: 'compact' | 'detailed' | 'full';
  className?: string;
}

export function AgentActivityIndicator({ mode = 'compact', className }: AgentActivityIndicatorProps) {
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [isExpanded, setIsExpanded] = useState(false);

  // Subscribe to agents WebSocket channel
  useChannel('agents', (data) => {
    if (!data) return;

    // Handle different event types
    if (data.agentId && data.status) {
      // Heartbeat or status update
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === data.agentId
            ? {
                ...agent,
                status: data.status,
                lastHeartbeat: data.timestamp || Date.now(),
                currentAction: data.currentAction,
              }
            : agent
        )
      );
    }

    if (data.eventType === 'AGENT_STARTED') {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === data.source ? { ...agent, status: 'running' as AgentStatus } : agent
        )
      );
    }

    if (data.eventType === 'AGENT_STOPPED') {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === data.source ? { ...agent, status: 'paused' as AgentStatus } : agent
        )
      );
    }

    if (data.eventType === 'AGENT_ERROR') {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === data.source ? { ...agent, status: 'error' as AgentStatus } : agent
        )
      );
    }
  });

  // Calculate aggregate status
  const stats = useMemo(() => {
    const running = agents.filter((a) => a.status === 'running').length;
    const errors = agents.filter((a) => a.status === 'error').length;
    const paused = agents.filter((a) => a.status === 'paused').length;
    const total = agents.length;

    let overallStatus: AgentStatus = 'running';
    if (errors > 0) overallStatus = 'error';
    else if (paused === total) overallStatus = 'paused';
    else if (running === 0) overallStatus = 'idle';

    return { running, errors, paused, total, overallStatus };
  }, [agents]);

  const colors = STATUS_COLORS[stats.overallStatus];
  const activeAgents = agents.filter((a) => a.status === 'running' && a.currentAction).slice(0, 3);

  // ==========================================================================
  // COMPACT MODE - Just a pulsing dot
  // ==========================================================================

  if (mode === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('relative gap-2 h-8', className)}
          >
            <span className="relative flex h-3 w-3">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  colors.pulse
                )}
              />
              <span className={cn('relative inline-flex rounded-full h-3 w-3', colors.bg)} />
            </span>
            <span className="text-xs font-medium text-gray-600">
              {stats.running}/{stats.total}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">AI Agents</h4>
              <Badge variant={stats.errors > 0 ? 'destructive' : 'secondary'} className="text-xs">
                {stats.running} running
              </Badge>
            </div>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-1">
              {agents.map((agent) => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }

  // ==========================================================================
  // DETAILED MODE - Top 3 active agents with actions
  // ==========================================================================

  if (mode === 'detailed') {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-3', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  colors.pulse
                )}
              />
              <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', colors.bg)} />
            </span>
            <span className="text-sm font-medium text-gray-900">
              {stats.running} agents active
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Active agents with current actions */}
        <div className="space-y-2">
          {activeAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-2 text-xs">
              <Zap className="w-3 h-3 text-violet-500" />
              <span className="font-medium text-gray-700">{agent.name}:</span>
              <span className="text-gray-500 truncate">{agent.currentAction}</span>
            </div>
          ))}
          {activeAgents.length === 0 && (
            <p className="text-xs text-gray-400 italic">No active tasks</p>
          )}
        </div>

        {/* Expanded view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Running: {stats.running}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>Idle: {stats.total - stats.running - stats.paused - stats.errors}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Paused: {stats.paused}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Errors: {stats.errors}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================================================
  // FULL MODE - Complete agent roster
  // ==========================================================================

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Agent Status</h3>
              <p className="text-sm text-gray-500">
                {stats.running} of {stats.total} agents running
              </p>
            </div>
          </div>
          <span className="relative flex h-3 w-3">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                colors.pulse
              )}
            />
            <span className={cn('relative inline-flex rounded-full h-3 w-3', colors.bg)} />
          </span>
        </div>
      </div>

      <ScrollArea className="h-80">
        <div className="p-2">
          {/* Group by tier */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => {
            const tierAgents = agents.filter((a) => a.tier === tier);
            if (tierAgents.length === 0) return null;

            return (
              <div key={tier} className="mb-3">
                <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                  Tier {tier}
                </p>
                <div className="space-y-1">
                  {tierAgents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} showAction />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// =============================================================================
// AGENT ROW COMPONENT
// =============================================================================

interface AgentRowProps {
  agent: AgentState;
  showAction?: boolean;
}

function AgentRow({ agent, showAction }: AgentRowProps) {
  const colors = STATUS_COLORS[agent.status];
  const StatusIcon =
    agent.status === 'running' ? Activity :
    agent.status === 'paused' ? Pause :
    agent.status === 'error' ? AlertCircle :
    CheckCircle;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.bg)} />
      <span className="text-sm font-medium text-gray-700 flex-1 truncate">{agent.name}</span>
      {showAction && agent.currentAction && (
        <span className="text-xs text-gray-400 truncate max-w-[120px]">{agent.currentAction}</span>
      )}
      <StatusIcon className={cn('w-3.5 h-3.5 flex-shrink-0', colors.text)} />
    </div>
  );
}

export default AgentActivityIndicator;
