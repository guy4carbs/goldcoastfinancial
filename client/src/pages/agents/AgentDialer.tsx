/**
 * AgentDialer - Real Voice Dialer for Agent Lounge
 * Browser-based phone system using @telnyx/webrtc
 * Includes Power Dialer mode for auto-dialing lead queues
 */

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  Users,
  Mic,
  MicOff,
  History,
  Star,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Delete,
  CalendarPlus,
  ShieldCheck,
  ClockArrowUp,
  CircleCheck,
  Zap,
  Play,
  Pause,
  Square,
  SkipForward,
  ListOrdered,
  PhoneForwarded,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Contact,
  Mail,
  MapPin,
  Tag,
  Ban,
  ThumbsDown,
  UserCheck,
  Target,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SubmitDealDialog } from "@/components/agent/SubmitDealDialog";
import { RADIUS, SHADOW, MOTION, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { useTelnyxDevice, type DeviceStatus, type CallStatus } from '@/hooks/useTelnyxDevice';
import { usePowerDialer, type PowerDialerLead } from '@/hooks/usePowerDialer';
import { apiRequest } from "@/lib/queryClient";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { LeadDetailDrawer } from "@/components/agent/LeadDetailDrawer";
import { useLeadInbox } from "@/hooks/useLeadDistribution";
import { generateAgentSlug } from "@/lib/agentSlugUtils";
import { ClosingTab } from "@/components/agent/closing";
import { RecordingsTab } from "@/components/agent/recordings";

// =============================================================================
// CONSTANTS
// =============================================================================

const DIALPAD_KEYS = [
  { num: '1', letters: '' },
  { num: '2', letters: 'ABC' },
  { num: '3', letters: 'DEF' },
  { num: '4', letters: 'GHI' },
  { num: '5', letters: 'JKL' },
  { num: '6', letters: 'MNO' },
  { num: '7', letters: 'PQRS' },
  { num: '8', letters: 'TUV' },
  { num: '9', letters: 'WXYZ' },
  { num: '*', letters: '' },
  { num: '0', letters: '+' },
  { num: '#', letters: '' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatPhoneDisplay(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.length <= 1) return '+1';
  if (digits.length <= 4) return `+1 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 11) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCallTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case 'ready': return 'bg-emerald-500';
    case 'initializing': return 'bg-amber-500';
    case 'error': return 'bg-red-500';
    case 'offline': return 'bg-gray-400';
  }
}

function getStatusLabel(status: DeviceStatus): string {
  switch (status) {
    case 'ready': return 'Ready';
    case 'initializing': return 'Connecting...';
    case 'error': return 'Error';
    case 'offline': return 'Offline';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
    default: return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

function getScoreBadge(score: number | null): { label: string; className: string } {
  if (score === null) return { label: '--', className: 'text-gray-400 bg-gray-50' };
  if (score >= 80) return { label: `${score}`, className: 'text-emerald-700 bg-emerald-50' };
  if (score >= 50) return { label: `${score}`, className: 'text-amber-700 bg-amber-50' };
  return { label: `${score}`, className: 'text-gray-500 bg-gray-50' };
}

// =============================================================================
// PROFILE FIELD (skeleton / populated / empty)
// =============================================================================

function ProfileField({ icon, label, value, loaded, skeletonWidth = 'w-2/3' }: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  loaded: boolean;
  skeletonWidth?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        {!loaded ? (
          <div className={cn("h-[14px] bg-gray-100 rounded animate-pulse", skeletonWidth)} />
        ) : value ? (
          <p className="text-sm text-gray-800 font-medium truncate leading-tight">{value}</p>
        ) : (
          <p className="text-sm text-gray-300 italic">—</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DEVICE STATUS INDICATOR
// =============================================================================

function DeviceStatusBadge({ status, error }: { status: DeviceStatus; error: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", getStatusColor(status))} />
      <span className="text-sm font-medium text-white/90">{getStatusLabel(status)}</span>
      {status === 'ready' && <Wifi className="w-4 h-4 text-white/70" />}
      {status === 'error' && (
        <span className="text-xs text-white/60" title={error || ''}>
          <WifiOff className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}

// =============================================================================
// INCOMING CALL BANNER
// =============================================================================

function IncomingCallBanner({
  from,
  onAccept,
  onReject,
}: {
  from: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
    >
      <Card className="border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-2xl" style={{ borderRadius: RADIUS.card }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
            >
              <PhoneIncoming className="w-6 h-6" />
            </motion.div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Incoming Call</p>
              <p className="text-white/80 text-sm">{from}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Phone className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// ACTIVE CALL PANEL
// =============================================================================

function ActiveCallPanel({
  phoneNumber,
  callStatus,
  duration,
  isMuted,
  onToggleMute,
  onHangUp,
  onSendDtmf,
}: {
  phoneNumber: string;
  callStatus: CallStatus;
  duration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onHangUp: () => void;
  onSendDtmf: (digit: string) => void;
}) {
  const [showDtmf, setShowDtmf] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Call info */}
      <div className="text-center py-6 bg-gradient-to-br from-violet-50 to-purple-50" style={{ borderRadius: RADIUS.card }}>
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
          <PhoneCall className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-900">{formatPhoneDisplay(phoneNumber)}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          {callStatus === 'connecting' && (
            <>
              <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
              <span className="text-sm text-violet-600">Connecting...</span>
            </>
          )}
          {callStatus === 'ringing' && (
            <>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <Phone className="w-4 h-4 text-violet-500" />
              </motion.div>
              <span className="text-sm text-violet-600">Ringing...</span>
            </>
          )}
          {callStatus === 'open' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-mono text-gray-700">{formatDuration(duration)}</span>
            </>
          )}
        </div>
      </div>

      {/* Call controls */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className={cn(
            "w-14 h-14 flex items-center justify-center rounded-full transition-colors",
            isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDtmf(!showDtmf)}
          className={cn(
            "w-14 h-14 flex items-center justify-center rounded-full transition-colors",
            showDtmf ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <span className="text-lg font-bold">#</span>
        </motion.button>
      </div>

      {/* DTMF pad (toggled) */}
      <AnimatePresence>
        {showDtmf && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
              {DIALPAD_KEYS.map((key) => (
                <button
                  key={key.num}
                  onClick={() => onSendDtmf(key.num)}
                  className="py-2 text-lg font-semibold text-gray-700 hover:bg-gray-200 transition-colors rounded-lg"
                >
                  {key.num}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End call */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onHangUp}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
        style={{ borderRadius: RADIUS.button }}
      >
        <PhoneOff className="w-5 h-5" />
        End Call
      </motion.button>
    </motion.div>
  );
}

// =============================================================================
// SEGMENTED SELECTOR (for Lines / Ring Count)
// =============================================================================

function SegmentedSelector({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</span>
      <div className="flex bg-gray-100 p-0.5" style={{ borderRadius: RADIUS.input }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            disabled={disabled}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold transition-all",
              value === opt
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ borderRadius: RADIUS.input - 2 }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// POWER DIALER LEAD CARD
// =============================================================================

function PowerDialerLeadCard({ lead, isCurrent }: { lead: PowerDialerLead; isCurrent?: boolean }) {
  const score = getScoreBadge(lead.leadScore);
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 transition-colors",
        isCurrent
          ? "bg-violet-50 border border-violet-200"
          : "bg-gray-50 hover:bg-gray-100"
      )}
      style={{ borderRadius: RADIUS.input }}
    >
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
        isCurrent ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {lead.firstName} {lead.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{formatPhoneDisplay(lead.phone)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {lead.callCount > 0 && (
          <span className="text-[10px] text-gray-400 font-medium">{lead.callCount}x</span>
        )}
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", score.className)}>
          {score.label}
        </Badge>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 capitalize", getPriorityColor(lead.priority))}>
          {lead.priority}
        </Badge>
      </div>
    </div>
  );
}

// =============================================================================
// POWER DIALER VIEW
// =============================================================================

function PowerDialerView({
  telnyx,
  powerDialer,
  onEndCall,
}: {
  telnyx: ReturnType<typeof useTelnyxDevice>;
  powerDialer: ReturnType<typeof usePowerDialer>;
  onEndCall: () => void;
}) {
  const { status, queue, currentLead, currentBatch, currentIndex, stats, lines, ringCount } = powerDialer;
  const isActive = ['dialing', 'ringing', 'connected'].includes(status);
  const isInCall = telnyx.callStatus === 'open';
  const remaining = Math.max(0, queue.length - currentIndex);

  // Queue pagination (5 per page)
  const QUEUE_PAGE_SIZE = 5;
  const [queuePage, setQueuePage] = useState(0);
  const upcomingStart = currentIndex + (isActive ? currentBatch.length : 0);
  const upcomingLeads = queue.slice(upcomingStart);
  const queueTotalPages = Math.ceil(upcomingLeads.length / QUEUE_PAGE_SIZE);
  const paginatedQueue = upcomingLeads.slice(queuePage * QUEUE_PAGE_SIZE, (queuePage + 1) * QUEUE_PAGE_SIZE);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Controls Bar */}
      <motion.div variants={fadeInUp}>
        <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <SegmentedSelector
                label="Lines"
                value={lines}
                options={[1, 2, 3, 4, 5]}
                onChange={powerDialer.setLines}
                disabled={isActive}
              />
              <SegmentedSelector
                label="Rings"
                value={ringCount}
                options={[1, 2, 3, 4, 5]}
                onChange={powerDialer.setRingCount}
                disabled={isActive}
              />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {status === 'ready' && (
                  <Button
                    onClick={powerDialer.start}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-1.5"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Play className="w-4 h-4" />
                    Start ({Math.min(lines, remaining)} line{Math.min(lines, remaining) !== 1 ? 's' : ''})
                  </Button>
                )}
                {isActive && (
                  <Button
                    onClick={powerDialer.stop}
                    className="bg-red-500 hover:bg-red-600 text-white gap-1.5"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Session Stats */}
      <motion.div variants={fadeInUp}>
        <AgentStatCardGrid>
          <AgentStatCard
            icon={ListOrdered}
            value={remaining}
            label="Queue Remaining"
            gradient="from-violet-500 to-purple-600"
          />
          <AgentStatCard
            icon={PhoneCall}
            value={stats.dialed}
            label="Dialed"
            gradient="from-blue-500 to-indigo-600"
          />
          <AgentStatCard
            icon={PhoneForwarded}
            value={stats.connected}
            label="Connected"
            gradient="from-emerald-500 to-green-600"
          />
          <AgentStatCard
            icon={XCircle}
            value={stats.noAnswer}
            label="No Answer"
            gradient="from-amber-500 to-orange-600"
          />
        </AgentStatCardGrid>
      </motion.div>

      {/* Main Grid: Current Call + Queue */}
      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        {/* Current Call Panel (3/5) */}
        <motion.div variants={fadeInUp} className="lg:col-span-3 flex flex-col">
          <Card className="border-0 flex-1 flex flex-col" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                {status === 'completed' ? 'Session Complete' : status === 'connected' ? 'On Call' : 'Power Dialer'}
                {isActive && currentBatch.length > 0 && (
                  <Badge className="ml-auto bg-violet-100 text-violet-700 border-0">
                    Dialing {currentBatch.length} line{currentBatch.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'loading' && (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 mx-auto mb-3 text-violet-500 animate-spin" />
                  <p className="text-gray-500">Loading leads from inbox...</p>
                </div>
              )}

              {status === 'ready' && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Ready to Dial</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {remaining} lead{remaining !== 1 ? 's' : ''} remaining. Press Start to dial {Math.min(lines, remaining)} at once.
                  </p>
                </div>
              )}

              {(status === 'dialing' || status === 'ringing') && (
                <div className="space-y-4">
                  {/* Show all numbers being dialed */}
                  <div className="space-y-2">
                    {currentBatch.map((lead) => (
                      <div key={lead.id} className="flex items-center gap-3 p-3 bg-gradient-to-br from-violet-50 to-purple-50" style={{ borderRadius: RADIUS.input }}>
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                          <p className="text-xs text-gray-500">{formatPhoneDisplay(lead.phone)}</p>
                        </div>
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                          <Phone className="w-4 h-4 text-violet-500" />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-violet-600 font-medium">
                      {status === 'dialing' ? 'Connecting...' : `Ringing (${ringCount} ring${ringCount !== 1 ? 's' : ''} max)...`}
                    </p>
                  </div>
                </div>
              )}

              {status === 'connected' && currentLead && (
                <div className="space-y-4">
                  {/* Connected lead info */}
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 space-y-3" style={{ borderRadius: RADIUS.card }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {currentLead.firstName.charAt(0)}{currentLead.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {currentLead.firstName} {currentLead.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{currentLead.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {(() => { const s = getScoreBadge(currentLead.leadScore); return (
                          <Badge variant="outline" className={cn("text-xs", s.className)}>
                            Score: {s.label}
                          </Badge>
                        ); })()}
                        <Badge variant="outline" className={cn("text-xs capitalize", getPriorityColor(currentLead.priority))}>
                          {currentLead.priority}
                        </Badge>
                      </div>
                    </div>
                    {currentLead.lastContactedAt && (
                      <p className="text-xs text-gray-400">
                        Last contacted: {formatCallTime(currentLead.lastContactedAt)}
                      </p>
                    )}
                  </div>

                  {/* Active call controls */}
                  {isInCall && (
                    <ActiveCallPanel
                      phoneNumber={currentLead.phone}
                      callStatus={telnyx.callStatus}
                      duration={telnyx.callDuration}
                      isMuted={telnyx.isMuted}
                      onToggleMute={telnyx.toggleMute}
                      onHangUp={onEndCall}
                      onSendDtmf={telnyx.sendDtmf}
                    />
                  )}
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-12 space-y-6">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Session Complete</p>
                    <p className="text-sm text-gray-500 mt-1">All leads in the queue have been processed.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    <div className="text-center p-3 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
                      <p className="text-2xl font-bold text-gray-900">{stats.dialed}</p>
                      <p className="text-xs text-gray-500">Dialed</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50" style={{ borderRadius: RADIUS.input }}>
                      <p className="text-2xl font-bold text-emerald-600">{stats.connected}</p>
                      <p className="text-xs text-gray-500">Connected</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50" style={{ borderRadius: RADIUS.input }}>
                      <p className="text-2xl font-bold text-amber-600">{stats.noAnswer}</p>
                      <p className="text-xs text-gray-500">No Answer</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Queue Preview (2/5) */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 flex flex-col">
          <Card className="border-0 flex-1 flex flex-col" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-violet-500" />
                  Up Next
                </CardTitle>
                <Badge variant="outline" className="text-violet-600 border-violet-200">
                  {remaining} remaining
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Current batch (highlighted) */}
                {isActive && currentBatch.map((lead) => (
                  <PowerDialerLeadCard key={lead.id} lead={lead} isCurrent />
                ))}

                {/* Connected lead highlighted */}
                {status === 'connected' && currentLead && !currentBatch.find(l => l.id === currentLead.id) && (
                  <PowerDialerLeadCard lead={currentLead} isCurrent />
                )}

                {/* Upcoming leads (paginated, 5 per page) */}
                {paginatedQueue.map((lead) => (
                  <PowerDialerLeadCard key={lead.id} lead={lead} />
                ))}

                {queue.length === 0 && status !== 'loading' && (
                  <div className="text-center py-8 text-gray-400">
                    <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No leads in queue</p>
                  </div>
                )}
              </div>
              {queueTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-gray-500"
                    disabled={queuePage === 0}
                    onClick={() => setQueuePage(p => p - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Prev
                  </Button>
                  <span className="text-xs text-gray-400">{queuePage + 1} / {queueTotalPages}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-gray-500"
                    disabled={queuePage >= queueTotalPages - 1}
                    onClick={() => setQueuePage(p => p + 1)}
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AgentDialer() {
  const [phoneNumber, setPhoneNumber] = useState('+1');
  const [searchQuery, setSearchQuery] = useState('');
  const [powerDialerMode, setPowerDialerMode] = useState(false);
  const [showSubmitDeal, setShowSubmitDeal] = useState(false);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Telnyx Device hook (single instance, shared between manual + power dialer)
  const telnyx = useTelnyxDevice();

  // Power Dialer hook (receives telnyx as dependency)
  const powerDialer = usePowerDialer(telnyx);

  // Destructure telnyx for manual mode convenience
  const {
    deviceStatus,
    callStatus,
    isMuted,
    callDuration,
    incomingFrom,
    error: deviceError,
    makeCall,
    hangUp,
    toggleMute,
    sendDtmf,
    acceptIncoming,
    rejectIncoming,
  } = telnyx;

  // Real call history
  const { data: callHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/calls/history'],
  });

  // Real call stats
  const { data: callStats } = useQuery<{
    today: number;
    week: number;
    month: number;
    avgDuration: number;
  }>({
    queryKey: ['/api/calls/stats'],
  });

  // Lead inbox + drawer
  const {
    leads,
    currentUser,
    addLead,
    addActivityToLead,
    updateLeadStatus,
    fetchWebsiteLeads,
    fetchReferralLeads,
  } = useAgentStore();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leadPage, setLeadPage] = useState(0);
  const [callPage, setCallPage] = useState(0);
  const [activeTab, setActiveTab] = useState('dialer');
  const ITEMS_PER_PAGE = 5;

  const distributedQuery = useLeadInbox({ limit: 500, enabled: !!currentUser?.id });

  // Build leads directly from API data — no store dependency
  const apiLeads: Lead[] = useMemo(() => {
    if (!distributedQuery.data?.leads) return [];
    return distributedQuery.data.leads
      .filter((l: any) => l.phone && l.phone.trim() !== '')
      .map((apiLead: any) => {
        let first = (apiLead.firstName || '').trim();
        let last = (apiLead.lastName || '').trim();
        if (first.includes(',')) {
          const parts = first.split(',').map((s: string) => s.trim());
          last = parts[0];
          first = parts[1]?.split(' ')[0] || '';
        }
        first = first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
        last = last ? last.charAt(0).toUpperCase() + last.slice(1).toLowerCase() : '';
        return {
          id: apiLead.id || `api-${apiLead.email || Math.random()}`,
          name: `${first} ${last}`.trim() || 'Unknown',
          email: (apiLead.email || '').toLowerCase().trim(),
          phone: apiLead.phone || '',
          product: apiLead.coverageType || 'Life Insurance',
          source: 'Distributed',
          status: apiLead.status || 'new' as any,
          tags: ['Distributed'],
          state: apiLead.state || '',
          createdDate: apiLead.createdAt || new Date().toISOString(),
          notes: '',
          assignedTo: currentUser?.id,
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          nextFollowUpType: 'call' as any,
        } as unknown as Lead;
      });
  }, [distributedQuery.data, currentUser?.id]);

  const allDialerLeads = apiLeads;
  const filteredLeads = allDialerLeads.filter(l => {
    if (!leadSearchQuery) return true;
    const q = leadSearchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.email.toLowerCase().includes(q);
  });
  const dedupedLeads = filteredLeads.filter((lead, idx, arr) => arr.findIndex(l => l.id === lead.id) === idx);
  const leadTotalPages = Math.ceil(dedupedLeads.length / ITEMS_PER_PAGE);
  const safePage = Math.min(leadPage, Math.max(leadTotalPages - 1, 0));
  const paginatedLeads = dedupedLeads.slice(safePage * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const handleLeadClick = (lead: Lead) => {
    // Auto-populate phone number and show profile
    if (lead.phone) {
      const digits = lead.phone.replace(/\D/g, '');
      setPhoneNumber(digits.startsWith('1') ? '+' + digits : '+1' + digits);
    }
    setActiveLead(lead);
  };

  const handleLeadProfileOpen = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  // Look up DB lead ID from already-fetched distributed data
  const dbLeadId = useMemo(() => {
    if (!activeLead?.phone || !distributedQuery.data?.leads) return null;
    const normalized = activeLead.phone.replace(/\D/g, '');
    const match = distributedQuery.data.leads.find((l: any) => {
      const lPhone = (l.phone || '').replace(/\D/g, '');
      return lPhone === normalized || lPhone.endsWith(normalized) || normalized.endsWith(lPhone);
    });
    return match?.id || null;
  }, [activeLead?.phone, distributedQuery.data?.leads]);

  // Build full address from DB lead data
  const activeLeadAddress = useMemo(() => {
    if (!activeLead?.phone || !distributedQuery.data?.leads) return undefined;
    const normalized = activeLead.phone.replace(/\D/g, '');
    const match = distributedQuery.data.leads.find((l: any) => {
      const lPhone = (l.phone || '').replace(/\D/g, '');
      return lPhone === normalized || lPhone.endsWith(normalized) || normalized.endsWith(lPhone);
    });
    if (!match) return activeLead.state || undefined;
    const parts = [match.streetAddress, match.city, match.state, match.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : undefined;
  }, [activeLead?.phone, activeLead?.state, distributedQuery.data?.leads]);

  // Disposition mutations — refresh data after any update
  const invalidateLeadData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/lead-distribution/inbox'] });
    queryClient.invalidateQueries({ queryKey: ['/api/crm/pipeline'] });
  };

  // Update both the store and the local activeLead state so the profile card reflects changes instantly
  const applyDisposition = (newStatus: Lead['status']) => {
    if (!activeLead) return;
    updateLeadStatus(activeLead.id, newStatus);
    setActiveLead(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const updateLeadMutation = useMutation({
    mutationFn: async ({ status, note }: { status: string; note: string }) => {
      if (!dbLeadId) throw new Error('Lead not found in database');
      await apiRequest('PATCH', `/api/crm/leads/${dbLeadId}`, { status });
      await apiRequest('POST', `/api/crm/leads/${dbLeadId}/activity`, {
        type: 'status_change',
        title: `Marked as ${status}`,
        description: note,
      });
    },
    onSuccess: (_, { status }) => {
      toast.success(`Lead marked as ${status}`);
      applyDisposition(status as Lead['status']);
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update lead'),
  });

  const scheduleCallbackMutation = useMutation({
    mutationFn: async () => {
      if (!dbLeadId) throw new Error('Lead not found in database');
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await apiRequest('PATCH', `/api/crm/leads/${dbLeadId}`, {
        status: 'contacted',
        next_follow_up: tomorrow,
      });
      await apiRequest('POST', `/api/crm/leads/${dbLeadId}/activity`, {
        type: 'call',
        title: 'Callback scheduled',
        description: `Callback scheduled for ${new Date(Date.now() + 86400000).toLocaleDateString()}`,
      });
    },
    onSuccess: () => {
      toast.success('Callback scheduled for tomorrow');
      applyDisposition('contacted');
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to schedule callback'),
  });

  const scheduleApptMutation = useMutation({
    mutationFn: async () => {
      if (!dbLeadId) throw new Error('Lead not found in database');
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
      await apiRequest('PATCH', `/api/crm/leads/${dbLeadId}`, {
        status: 'qualified',
        pipeline_stage: 'appointment_set',
        next_follow_up: nextWeek,
      });
      await apiRequest('POST', `/api/crm/leads/${dbLeadId}/activity`, {
        type: 'meeting',
        title: 'Appointment set',
        description: `Appointment set from dialer for ${new Date(Date.now() + 7 * 86400000).toLocaleDateString()}`,
      });
    },
    onSuccess: () => {
      toast.success('Appointment set');
      applyDisposition('qualified');
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to set appointment'),
  });

  const addToDncMutation = useMutation({
    mutationFn: async () => {
      if (!activeLead?.phone) throw new Error('No phone number');
      await apiRequest('POST', '/api/dnc', {
        phoneNumber: activeLead.phone,
        reason: 'Agent flagged from dialer',
        source: 'manual',
      });
      if (dbLeadId) {
        await apiRequest('PATCH', `/api/crm/leads/${dbLeadId}`, { status: 'lost', lost_reason: 'DNC — Do Not Call' });
        await apiRequest('POST', `/api/crm/leads/${dbLeadId}/activity`, {
          type: 'status_change',
          title: 'Added to Do Not Call list',
          description: 'Number added to DNC from dialer',
        });
      }
    },
    onSuccess: () => {
      toast.success('Added to Do Not Call list');
      applyDisposition('lost');
      setActiveLead(null);
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add to DNC'),
  });

  // Power dialer lead address lookup
  const pdLeadAddress = useMemo(() => {
    const cl = powerDialer.currentLead;
    if (!cl?.phone || !distributedQuery.data?.leads) return undefined;
    const match = distributedQuery.data.leads.find((l: any) => l.id === cl.id);
    if (!match) return undefined;
    const parts = [match.streetAddress, match.city, match.state, match.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : undefined;
  }, [powerDialer.currentLead?.id, powerDialer.currentLead?.phone, distributedQuery.data?.leads]);

  // Power dialer lead product/source lookup
  const pdLeadMeta = useMemo(() => {
    const cl = powerDialer.currentLead;
    if (!cl?.phone || !distributedQuery.data?.leads) return { product: undefined, source: undefined };
    const match = distributedQuery.data.leads.find((l: any) => l.id === cl.id);
    return { product: match?.coverageType || undefined, source: match?.source || undefined };
  }, [powerDialer.currentLead?.id, powerDialer.currentLead?.phone, distributedQuery.data?.leads]);

  // Power dialer disposition mutations (use currentLead.id directly)
  const pdUpdateLeadMutation = useMutation({
    mutationFn: async ({ status, note }: { status: string; note: string }) => {
      const leadId = powerDialer.currentLead?.id;
      if (!leadId) throw new Error('No active lead');
      await apiRequest('PATCH', `/api/crm/leads/${leadId}`, { status });
      await apiRequest('POST', `/api/crm/leads/${leadId}/activity`, {
        type: 'status_change',
        title: `Marked as ${status}`,
        description: note,
      });
    },
    onSuccess: (_, { status }) => {
      toast.success(`Lead marked as ${status}`);
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update lead'),
  });

  const pdCallbackMutation = useMutation({
    mutationFn: async () => {
      const leadId = powerDialer.currentLead?.id;
      if (!leadId) throw new Error('No active lead');
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await apiRequest('PATCH', `/api/crm/leads/${leadId}`, { status: 'contacted', next_follow_up: tomorrow });
      await apiRequest('POST', `/api/crm/leads/${leadId}/activity`, {
        type: 'call',
        title: 'Callback scheduled',
        description: `Callback scheduled for ${new Date(Date.now() + 86400000).toLocaleDateString()}`,
      });
    },
    onSuccess: () => {
      toast.success('Callback scheduled for tomorrow');
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to schedule callback'),
  });

  const pdApptMutation = useMutation({
    mutationFn: async () => {
      const leadId = powerDialer.currentLead?.id;
      if (!leadId) throw new Error('No active lead');
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
      await apiRequest('PATCH', `/api/crm/leads/${leadId}`, { status: 'qualified', pipeline_stage: 'appointment_set', next_follow_up: nextWeek });
      await apiRequest('POST', `/api/crm/leads/${leadId}/activity`, {
        type: 'meeting',
        title: 'Appointment set',
        description: `Appointment set from power dialer for ${new Date(Date.now() + 7 * 86400000).toLocaleDateString()}`,
      });
    },
    onSuccess: () => {
      toast.success('Appointment set');
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to set appointment'),
  });

  const pdDncMutation = useMutation({
    mutationFn: async () => {
      const cl = powerDialer.currentLead;
      if (!cl?.phone) throw new Error('No phone number');
      await apiRequest('POST', '/api/dnc', { phoneNumber: cl.phone, reason: 'Agent flagged from power dialer', source: 'manual' });
      await apiRequest('PATCH', `/api/crm/leads/${cl.id}`, { status: 'lost', lost_reason: 'DNC — Do Not Call' });
      await apiRequest('POST', `/api/crm/leads/${cl.id}/activity`, {
        type: 'status_change',
        title: 'Added to Do Not Call list',
        description: 'Number added to DNC from power dialer',
      });
    },
    onSuccess: () => {
      toast.success('Added to Do Not Call list');
      invalidateLeadData();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add to DNC'),
  });

  const isInCall = callStatus !== 'idle' && callStatus !== 'incoming';

  const handleDialpadPress = (key: string) => {
    if (isInCall) {
      sendDtmf(key);
    } else {
      setPhoneNumber(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.length <= 2 ? '+1' : prev.slice(0, -1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allDigits = e.target.value.replace(/\D/g, '');
    const withCountry = allDigits.startsWith('1') ? allDigits.slice(0, 11) : ('1' + allDigits).slice(0, 11);
    setPhoneNumber('+' + withCountry);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isInCall) {
      e.preventDefault();
      handleCall();
    }
  };

  const handleCall = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 11) {
      toast.error('Please enter a 10-digit phone number');
      return;
    }
    if (deviceStatus !== 'ready') {
      toast.error('Phone system not ready. Please wait...');
      return;
    }
    await makeCall(phoneNumber);
  };

  const handleEndCall = () => {
    hangUp();
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/stats'] });
    }, 2000);
  };

  const handleTogglePowerDialer = async () => {
    if (powerDialerMode) {
      // Switching to manual mode
      powerDialer.stop();
      setPowerDialerMode(false);
    } else {
      // Switching to power dialer mode
      setPowerDialerMode(true);
      await powerDialer.loadQueue();
    }
  };

  // Show error toast
  useEffect(() => {
    if (deviceError) {
      toast.error(deviceError);
    }
  }, [deviceError]);

  const getCallTypeIcon = (direction: string, status: string) => {
    if (status === 'no-answer' || status === 'no_answer' || status === 'busy' || status === 'failed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    if (direction === 'inbound') return <PhoneIncoming className="w-4 h-4 text-violet-500" />;
    return <PhoneCall className="w-4 h-4 text-violet-500" />;
  };

  const filteredHistory = callHistory.filter((call: any) =>
    (call.phoneNumber || '').includes(searchQuery) ||
    (call.leadId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const callTotalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedCalls = filteredHistory.slice(callPage * ITEMS_PER_PAGE, (callPage + 1) * ITEMS_PER_PAGE);

  return (
    <AgentLoungeLayout>
      {/* Incoming call banner */}
      <AnimatePresence>
        {callStatus === 'incoming' && incomingFrom && (
          <IncomingCallBanner
            from={incomingFrom}
            onAccept={acceptIncoming}
            onReject={rejectIncoming}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Phone}
            title="Dialer"
            subtitle="Browser-based phone system with post-close workflow"
            badge={
              <DeviceStatusBadge status={deviceStatus} error={deviceError} />
            }
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePowerDialer}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 font-semibold transition-colors",
                powerDialerMode
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
              style={{
                borderRadius: RADIUS.pill,
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {powerDialerMode ? (
                <>
                  <Phone className="w-4 h-4" />
                  Manual Dialer
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  Power Dialer
                </>
              )}
            </motion.button>
          </AgentPageHero>
        </motion.div>

        {/* Tab Bar: Dialer | Closing */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div variants={fadeInUp}>
            <TabsList
              className="bg-gray-100 border-0 p-1 gap-1"
              style={{ borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="dialer"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Dialer
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                <Target className="w-4 h-4 mr-2" />
                Post-Close
              </TabsTrigger>
              <TabsTrigger
                value="recordings"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                <Mic className="w-4 h-4 mr-2" />
                Recordings
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* ── DIALER TAB ── */}
          <TabsContent value="dialer" className="mt-4 space-y-6">
            {/* Conditional: Power Dialer or Manual Dialer */}
            <AnimatePresence mode="wait">
          {powerDialerMode ? (
            <motion.div
              key="power-dialer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <PowerDialerView
                telnyx={telnyx}
                powerDialer={powerDialer}
                onEndCall={handleEndCall}
              />

              {/* Lead Profile + Recent Calls */}
              <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                {/* Lead Profile */}
                <Card
                  className="border-0 flex flex-col"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardContent className="p-0 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-gray-800">
                        <UserCheck className="w-4 h-4 text-violet-500" />
                        Lead Profile
                      </span>
                      <div className="flex items-center gap-1.5">
                        {powerDialer.currentLead ? (
                          <Badge variant="outline" className={cn(
                            "text-[10px] capitalize h-5 px-1.5",
                            powerDialer.currentLead.status === 'new' ? 'text-violet-600 border-violet-200 bg-violet-50' :
                            powerDialer.currentLead.status === 'contacted' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                            powerDialer.currentLead.status === 'qualified' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                            powerDialer.currentLead.status === 'lost' ? 'text-red-600 border-red-200 bg-red-50' :
                            'text-gray-600 border-gray-200 bg-gray-50'
                          )}>
                            {powerDialer.currentLead.status}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">Select a lead</span>
                        )}
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 flex flex-col justify-evenly px-5 py-2">
                      <ProfileField icon={<Contact className="w-3.5 h-3.5" />} label="Name" value={powerDialer.currentLead ? `${powerDialer.currentLead.firstName} ${powerDialer.currentLead.lastName}` : undefined} loaded={!!powerDialer.currentLead} skeletonWidth="w-3/5" />
                      <ProfileField icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={powerDialer.currentLead ? formatPhoneDisplay(powerDialer.currentLead.phone) : undefined} loaded={!!powerDialer.currentLead} skeletonWidth="w-2/5" />
                      <ProfileField icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={powerDialer.currentLead?.email} loaded={!!powerDialer.currentLead} skeletonWidth="w-3/4" />
                      <ProfileField icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={pdLeadAddress} loaded={!!powerDialer.currentLead} skeletonWidth="w-4/5" />
                      <ProfileField icon={<Tag className="w-3.5 h-3.5" />} label="Product" value={pdLeadMeta.product} loaded={!!powerDialer.currentLead} skeletonWidth="w-1/3" />
                      <ProfileField icon={<Star className="w-3.5 h-3.5" />} label="Source" value={pdLeadMeta.source} loaded={!!powerDialer.currentLead} skeletonWidth="w-1/4" />
                    </div>

                    {/* Disposition Buttons */}
                    <div className="border-t border-gray-100 px-4 py-3 mt-auto">
                      <div className="grid grid-cols-3 gap-1.5">
                        <Button
                          size="sm" variant="outline"
                          className="h-8 text-[11px] font-medium gap-1.5 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          disabled={!powerDialer.currentLead || pdCallbackMutation.isPending}
                          onClick={() => pdCallbackMutation.mutate()}
                        >
                          <ClockArrowUp className="w-3.5 h-3.5" />
                          Callback
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-8 text-[11px] font-medium gap-1.5 px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          disabled={!powerDialer.currentLead || pdUpdateLeadMutation.isPending}
                          onClick={() => pdUpdateLeadMutation.mutate({ status: 'qualified', note: 'Interested — qualified from power dialer' })}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Interested
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-8 text-[11px] font-medium gap-1.5 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                          disabled={!powerDialer.currentLead || pdApptMutation.isPending}
                          onClick={() => pdApptMutation.mutate()}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          Appt
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-8 text-[11px] font-medium gap-1.5 px-2 text-gray-500 border-gray-200 hover:bg-gray-50"
                          disabled={!powerDialer.currentLead || pdUpdateLeadMutation.isPending}
                          onClick={() => pdUpdateLeadMutation.mutate({ status: 'lost', note: 'Not interested — flagged from power dialer' })}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          No Interest
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-8 text-[11px] font-medium gap-1.5 px-2 text-red-500 border-red-200 hover:bg-red-50 col-span-2"
                          disabled={!powerDialer.currentLead || pdDncMutation.isPending}
                          onClick={() => {
                            const cl = powerDialer.currentLead;
                            if (cl && confirm(`Add ${cl.firstName} ${cl.lastName} (${cl.phone}) to the Do Not Call list?`)) pdDncMutation.mutate();
                          }}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Do Not Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Calls */}
                <Card
                  className="border-0 flex flex-col"
                  style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-violet-500" />
                        Recent Calls
                      </CardTitle>
                      {callHistory.length > 0 && (
                        <Badge variant="outline" className="text-violet-600 border-violet-200">
                          {callHistory.length} calls
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by phone number..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCallPage(0); }}
                        className="pl-9"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredHistory.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No calls yet</p>
                        </div>
                      )}
                      {paginatedCalls.map((call: any) => (
                        <motion.div
                          key={call.id}
                          whileHover={{ x: 2 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                          onClick={() => {
                            if (call.phoneNumber) {
                              const digits = call.phoneNumber.replace(/\D/g, '');
                              setPhoneNumber(digits.startsWith('1') ? '+' + digits : '+1' + digits);
                            }
                          }}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            call.status === 'completed' || call.status === 'connected'
                              ? "bg-violet-100"
                              : call.status === 'no_answer' || call.status === 'busy' || call.status === 'failed'
                                ? "bg-red-50"
                                : "bg-gray-100"
                          )}>
                            {getCallTypeIcon(call.direction, call.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 truncate block">
                              {call.phoneNumber ? formatPhoneDisplay(call.phoneNumber) : 'Unknown'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 capitalize">{call.direction}</span>
                              {call.disposition && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{call.disposition}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{call.calledAt ? formatCallTime(call.calledAt) : ''}</p>
                            <p className="text-xs text-gray-400">{call.duration ? formatDuration(call.duration) : '--:--'}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 text-violet-600 hover:bg-violet-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (call.phoneNumber) {
                                const digits = call.phoneNumber.replace(/\D/g, '');
                                setPhoneNumber(digits.startsWith('1') ? '+' + digits : '+1' + digits);
                              }
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    {callTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-500" disabled={callPage === 0} onClick={() => setCallPage(p => p - 1)}>
                          <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                        </Button>
                        <span className="text-xs text-gray-400">{callPage + 1} / {callTotalPages}</span>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-500" disabled={callPage >= callTotalPages - 1} onClick={() => setCallPage(p => p + 1)}>
                          Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'Post-Close',
                      icon: CircleCheck,
                      description: 'Go to post-close workflow',
                      onClick: () => setActiveTab('closing'),
                    },
                    {
                      name: 'Appointment',
                      icon: CalendarPlus,
                      description: 'Book an appointment',
                      onClick: () => {
                        if (powerDialer.currentLead) {
                          pdApptMutation.mutate();
                        } else {
                          toast.info('No active lead for appointment');
                        }
                      },
                    },
                    {
                      name: 'Secure Forms',
                      icon: ShieldCheck,
                      description: 'Send encrypted forms',
                      onClick: () => navigate('/agents/data-encryption'),
                    },
                    {
                      name: 'Submit Deal',
                      icon: DollarSign,
                      description: 'Log a closed deal',
                      onClick: () => setShowSubmitDeal(true),
                    },
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Card
                        className="border-0 transition-all cursor-pointer group"
                        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                        onClick={action.onClick}
                      >
                        <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                          <div
                            className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{action.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual-dialer"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* Stats */}
              <motion.div variants={fadeInUp}>
                <AgentStatCardGrid>
                  <AgentStatCard
                    icon={PhoneCall}
                    value={callStats?.today ?? 0}
                    label="Calls Today"
                    gradient="from-violet-500 to-purple-600"
                  />
                  <AgentStatCard
                    icon={Clock}
                    value={callStats?.avgDuration ? formatDuration(callStats.avgDuration) : '0:00'}
                    label="Avg Duration"
                    gradient="from-emerald-500 to-green-600"
                  />
                  <AgentStatCard
                    icon={Users}
                    value={callStats?.week ?? 0}
                    label="This Week"
                    gradient="from-amber-500 to-orange-600"
                  />
                  <AgentStatCard
                    icon={Star}
                    value={callStats?.month ?? 0}
                    label="This Month"
                    gradient="from-violet-500 to-purple-600"
                  />
                </AgentStatCardGrid>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                {/* Left Column: Dialpad + Lead Profile */}
                <motion.div variants={fadeInUp} className="space-y-6 flex flex-col">
                  <Card
                    className="border-0"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-violet-500" />
                        Dialpad
                        {deviceStatus !== 'ready' && (
                          <Badge variant="outline" className="ml-auto text-xs text-amber-600 border-amber-300 bg-amber-50">
                            {deviceStatus === 'initializing' ? 'Connecting...' : 'Unavailable'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatePresence mode="wait">
                        {isInCall ? (
                          <ActiveCallPanel
                            key="active-call"
                            phoneNumber={phoneNumber}
                            callStatus={callStatus}
                            duration={callDuration}
                            isMuted={isMuted}
                            onToggleMute={toggleMute}
                            onHangUp={handleEndCall}
                            onSendDtmf={sendDtmf}
                          />
                        ) : (
                          <motion.div key="dialpad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Phone Number Input */}
                            <div className="mb-6">
                              <div
                                className="relative bg-gray-50 p-4"
                                style={{ borderRadius: RADIUS.input }}
                              >
                                <input
                                  type="tel"
                                  value={formatPhoneDisplay(phoneNumber)}
                                  onChange={handleInputChange}
                                  onKeyDown={handleInputKeyDown}
                                  placeholder="+1"
                                  autoFocus
                                  className="no-focus-ring w-full text-2xl font-semibold text-gray-900 tracking-wider text-center bg-transparent border-none min-h-[36px] caret-violet-500"
                                />
                                {phoneNumber.length > 2 && (
                                  <button
                                    onClick={handleBackspace}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <Delete className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Dialpad Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                              {DIALPAD_KEYS.map((key) => (
                                <motion.button
                                  key={key.num}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDialpadPress(key.num)}
                                  className="flex flex-col items-center justify-center py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                  style={{ borderRadius: RADIUS.button }}
                                >
                                  <span className="text-2xl font-semibold text-gray-900">{key.num}</span>
                                  {key.letters && (
                                    <span className="text-[10px] text-gray-400 tracking-widest">{key.letters}</span>
                                  )}
                                </motion.button>
                              ))}
                            </div>

                            {/* Call Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleCall}
                              disabled={deviceStatus !== 'ready'}
                              className={cn(
                                "w-full py-4 font-semibold flex items-center justify-center gap-2 shadow-lg transition-opacity",
                                deviceStatus === 'ready'
                                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              )}
                              style={{ borderRadius: RADIUS.button }}
                            >
                              {deviceStatus === 'initializing' ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Connecting...
                                </>
                              ) : deviceStatus === 'error' ? (
                                <>
                                  <AlertCircle className="w-5 h-5" />
                                  Phone Unavailable
                                </>
                              ) : (
                                <>
                                  <Phone className="w-5 h-5" />
                                  Call
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* Lead Profile + Disposition */}
                  <Card
                    className="border-0 flex-1 flex flex-col"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardContent className="p-0 flex flex-col flex-1">
                      {/* Header row */}
                      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                        <span className="text-sm font-semibold flex items-center gap-1.5 text-gray-800">
                          <UserCheck className="w-4 h-4 text-violet-500" />
                          Lead Profile
                        </span>
                        <div className="flex items-center gap-1.5">
                          {activeLead ? (
                            <>
                              <Badge variant="outline" className={cn(
                                "text-[10px] capitalize h-5 px-1.5",
                                activeLead.status === 'new' ? 'text-violet-600 border-violet-200 bg-violet-50' :
                                activeLead.status === 'contacted' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                activeLead.status === 'qualified' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                activeLead.status === 'lost' ? 'text-red-600 border-red-200 bg-red-50' :
                                'text-gray-600 border-gray-200 bg-gray-50'
                              )}>
                                {activeLead.status}
                              </Badge>
                              <button
                                className="text-[10px] text-violet-500 hover:text-violet-700 font-medium flex items-center"
                                onClick={() => handleLeadProfileOpen(activeLead)}
                              >
                                View <ChevronRight className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-gray-300 italic">Select a lead</span>
                          )}
                        </div>
                      </div>

                      {/* Fields — flex-1 to fill available vertical space, justify-evenly distributes rows */}
                      <div className="flex-1 flex flex-col justify-evenly px-5 py-2">
                        <ProfileField icon={<Contact className="w-3.5 h-3.5" />} label="Name" value={activeLead?.name} loaded={!!activeLead} skeletonWidth="w-3/5" />
                        <ProfileField icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={activeLead ? formatPhoneDisplay(activeLead.phone) : undefined} loaded={!!activeLead} skeletonWidth="w-2/5" />
                        <ProfileField icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={activeLead?.email} loaded={!!activeLead} skeletonWidth="w-3/4" />
                        <ProfileField icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={activeLeadAddress} loaded={!!activeLead} skeletonWidth="w-4/5" />
                        <ProfileField icon={<Tag className="w-3.5 h-3.5" />} label="Product" value={activeLead?.product} loaded={!!activeLead} skeletonWidth="w-1/3" />
                        <ProfileField icon={<Star className="w-3.5 h-3.5" />} label="Source" value={activeLead?.source} loaded={!!activeLead} skeletonWidth="w-1/4" />
                      </div>

                      {/* Disposition Buttons — pinned to bottom */}
                      <div className="border-t border-gray-100 px-4 py-3">
                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-[11px] font-medium gap-1.5 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            disabled={!activeLead || scheduleCallbackMutation.isPending}
                            onClick={() => scheduleCallbackMutation.mutate()}
                          >
                            <ClockArrowUp className="w-3.5 h-3.5" />
                            Callback
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-[11px] font-medium gap-1.5 px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            disabled={!activeLead}
                            onClick={() => { if (activeLead) updateLeadMutation.mutate({ status: 'qualified', note: 'Interested — qualified from dialer' }); }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Interested
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-[11px] font-medium gap-1.5 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                            disabled={!activeLead || scheduleApptMutation.isPending}
                            onClick={() => { if (activeLead) scheduleApptMutation.mutate(); }}
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            Appt
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-[11px] font-medium gap-1.5 px-2 text-gray-500 border-gray-200 hover:bg-gray-50"
                            disabled={!activeLead || updateLeadMutation.isPending}
                            onClick={() => { if (activeLead) updateLeadMutation.mutate({ status: 'lost', note: 'Not interested — flagged from dialer' }); }}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            No Interest
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-[11px] font-medium gap-1.5 px-2 text-red-500 border-red-200 hover:bg-red-50 col-span-2"
                            disabled={!activeLead || addToDncMutation.isPending}
                            onClick={() => { if (activeLead && confirm(`Add ${activeLead.name} (${activeLead.phone}) to the Do Not Call list?`)) addToDncMutation.mutate(); }}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Do Not Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Column: Lead Inbox + Recent Calls */}
                <motion.div variants={fadeInUp} className="space-y-6 flex flex-col">
                  {/* Lead Inbox */}
                  <Card
                    className="border-0"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Contact className="w-5 h-5 text-violet-500" />
                          My Leads
                        </CardTitle>
                        {dedupedLeads.length > 0 && (
                          <Badge variant="outline" className="text-violet-600 border-violet-200">
                            {dedupedLeads.length} leads
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search leads..."
                          value={leadSearchQuery}
                          onChange={(e) => { setLeadSearchQuery(e.target.value); setLeadPage(0); }}
                          className="pl-9"
                          style={{ borderRadius: RADIUS.input }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        {filteredLeads.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{leadSearchQuery ? 'No matching leads' : 'No leads with phone numbers'}</p>
                          </div>
                        )}
                        {paginatedLeads.map((lead) => {
                          const initials = lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                          const isNew = lead.status === 'new';
                          return (
                            <motion.div
                              key={lead.id}
                              whileHover={{ x: 2 }}
                              className={cn(
                                "flex items-center gap-3 p-2.5 cursor-pointer transition-colors group",
                                isNew ? "bg-violet-50/50 hover:bg-violet-50" : "bg-gray-50 hover:bg-gray-100"
                              )}
                              style={{ borderRadius: RADIUS.input }}
                              onClick={() => handleLeadClick(lead)}
                            >
                              {isNew && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                isNew ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-600"
                              )}>
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm truncate", isNew ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                                  {lead.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{formatPhoneDisplay(lead.phone)}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-7 h-7 text-violet-600 hover:bg-violet-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeadProfileOpen(lead);
                                  }}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                              <Phone className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 transition-colors shrink-0" />
                            </motion.div>
                          );
                        })}
                      </div>
                      {leadTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-500"
                            disabled={safePage === 0}
                            onClick={() => setLeadPage(p => p - 1)}
                          >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Prev
                          </Button>
                          <span className="text-xs text-gray-400">{safePage + 1} / {leadTotalPages}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-500"
                            disabled={safePage >= leadTotalPages - 1}
                            onClick={() => setLeadPage(p => p + 1)}
                          >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Calls */}
                  <Card
                    className="border-0 flex-1 flex flex-col"
                    style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <History className="w-5 h-5 text-violet-500" />
                          Recent Calls
                        </CardTitle>
                        {callHistory.length > 0 && (
                          <Badge variant="outline" className="text-violet-600 border-violet-200">
                            {callHistory.length} calls
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by phone number..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setCallPage(0); }}
                          className="pl-9"
                          style={{ borderRadius: RADIUS.input }}
                        />
                      </div>

                      <div className="space-y-2">
                        {filteredHistory.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No calls yet</p>
                          </div>
                        )}
                        {paginatedCalls.map((call: any) => (
                          <motion.div
                            key={call.id}
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                            style={{ borderRadius: RADIUS.input }}
                            onClick={() => {
                              if (call.phoneNumber) {
                                const digits = call.phoneNumber.replace(/\D/g, '');
                                setPhoneNumber(digits.startsWith('1') ? '+' + digits : '+1' + digits);
                              }
                            }}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              call.status === 'completed' || call.status === 'connected'
                                ? "bg-violet-100"
                                : call.status === 'no_answer' || call.status === 'busy' || call.status === 'failed'
                                  ? "bg-red-50"
                                  : "bg-gray-100"
                            )}>
                              {getCallTypeIcon(call.direction, call.status)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 truncate">
                                  {call.phoneNumber ? formatPhoneDisplay(call.phoneNumber) : 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 capitalize">{call.direction}</span>
                                {call.disposition && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    {call.disposition}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-500">{call.calledAt ? formatCallTime(call.calledAt) : ''}</p>
                              <p className="text-xs text-gray-400">
                                {call.duration ? formatDuration(call.duration) : '--:--'}
                              </p>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 text-violet-600 hover:bg-violet-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (call.phoneNumber) {
                                  const digits = call.phoneNumber.replace(/\D/g, '');
                                  setPhoneNumber(digits.startsWith('1') ? '+' + digits : '+1' + digits);
                                }
                              }}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                      {callTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-500"
                            disabled={callPage === 0}
                            onClick={() => setCallPage(p => p - 1)}
                          >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Prev
                          </Button>
                          <span className="text-xs text-gray-400">{callPage + 1} / {callTotalPages}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-500"
                            disabled={callPage >= callTotalPages - 1}
                            onClick={() => setCallPage(p => p + 1)}
                          >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div variants={fadeInUp}>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'Post-Close',
                      icon: CircleCheck,
                      description: 'Go to post-close workflow',
                      onClick: () => setActiveTab('closing'),
                    },
                    {
                      name: 'Appointment',
                      icon: CalendarPlus,
                      description: 'Book an appointment',
                      onClick: () => toast.info('Appointment booking coming soon'),
                    },
                    {
                      name: 'Secure Forms',
                      icon: ShieldCheck,
                      description: 'Send encrypted forms',
                      onClick: () => navigate('/agents/data-encryption'),
                    },
                    {
                      name: 'Submit Deal',
                      icon: DollarSign,
                      description: 'Log a closed deal',
                      onClick: () => setShowSubmitDeal(true),
                    },
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    >
                      <Card
                        className="border-0 transition-all cursor-pointer group"
                        style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                        onClick={action.onClick}
                      >
                        <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                          <div
                            className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{action.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
            </AnimatePresence>
          </TabsContent>

          {/* ── CLOSING TAB ── */}
          <TabsContent value="closing" className="mt-4">
            <ClosingTab />
          </TabsContent>

          {/* ── RECORDINGS TAB ── */}
          <TabsContent value="recordings" className="mt-4">
            <RecordingsTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onAddActivity={addActivityToLead}
          onUpdateStatus={updateLeadStatus}
        />
      )}
      <SubmitDealDialog open={showSubmitDeal} onOpenChange={setShowSubmitDeal} />
    </AgentLoungeLayout>
  );
}
