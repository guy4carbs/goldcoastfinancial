import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Play,
  Square,
  Pause,
  MessageSquare as MessageSquareIcon,
  Plus,
  ArrowLeft,
  Check,
  AlertCircle,
  RotateCcw,
  Copy,
  Bookmark,
  FileText,
  Brain,
  Target,
  Shield,
  Flame,
  Heart,
  MessageSquare,
  User,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  useCurrentDebate,
  useDebateTurnMeta,
  useDebateSummary,
  useDebateKeyPoints,
  useConnectionState,
  // Phase-based debate hooks
  useCurrentPhase,
  useDebatePhases,
  usePhaseHistory,
  useDebateTurns,
  useThinkingState,
  useComprehensiveSummary,
  useIsGeneratingSummary,
  usePhaseProgress,
  DEBATE_FORMATS,
  PHASE_DEBATE_FORMATS,
  type Avatar,
  type AvatarMessage,
  type DebateStance,
  type DebateFormat,
  type DebatePhase,
  type DebateTurn,
  type AvatarThinkingState,
  type ComprehensiveDebateSummary,
} from "@/lib/avatarCouncilStore";
import ReactMarkdown from "react-markdown";
import { ConnectionBanner } from "./ConnectionBadge";
import { ExpertSummonPanel } from "./ExpertSummonPanel";

// =============================================================================
// Constants & Icons
// =============================================================================

const avatarIcons: Record<string, React.ElementType> = {
  // Original advisors
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
  // The 7 Legends
  "warren-buffett": Brain,
  "patrick-bet-david": Target,
  "ben-feldman": Heart,
  "jordan-belfort": Flame,
  "andrew-tate": Target,
  "andy-elliott": Flame,
  "elizur-wright": Shield,
};

// Elite dark interface: Signature colors per avatar
const avatarColors: Record<string, { bg: string; icon: string; glow: string; gradient: string }> = {
  // Original advisors
  "insurance-expert": { bg: "bg-cyan-500/10", icon: "text-cyan-400", glow: "shadow-cyan-500/30", gradient: "from-cyan-600 to-blue-600" },
  "sales-closer": { bg: "bg-amber-500/10", icon: "text-amber-400", glow: "shadow-amber-500/30", gradient: "from-amber-500 to-orange-600" },
  "mindset-coach": { bg: "bg-violet-500/10", icon: "text-violet-400", glow: "shadow-violet-500/30", gradient: "from-violet-600 to-purple-600" },
  "compliance-specialist": { bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "shadow-emerald-500/30", gradient: "from-emerald-500 to-teal-600" },
  "wolf-closer": { bg: "bg-red-500/10", icon: "text-red-400", glow: "shadow-red-500/30", gradient: "from-red-600 to-rose-600" },
  "objection-handler": { bg: "bg-orange-500/10", icon: "text-orange-400", glow: "shadow-orange-500/30", gradient: "from-orange-500 to-amber-600" },
  // The 7 Legends
  "warren-buffett": { bg: "bg-amber-500/10", icon: "text-amber-400", glow: "shadow-amber-500/30", gradient: "from-amber-500 to-orange-600" },
  "patrick-bet-david": { bg: "bg-cyan-500/10", icon: "text-cyan-400", glow: "shadow-cyan-500/30", gradient: "from-cyan-500 to-blue-600" },
  "ben-feldman": { bg: "bg-violet-500/10", icon: "text-violet-400", glow: "shadow-violet-500/30", gradient: "from-violet-500 to-purple-600" },
  "jordan-belfort": { bg: "bg-red-500/10", icon: "text-red-400", glow: "shadow-red-500/30", gradient: "from-red-500 to-rose-600" },
  "andrew-tate": { bg: "bg-rose-500/10", icon: "text-rose-400", glow: "shadow-rose-500/30", gradient: "from-rose-600 to-red-700" },
  "andy-elliott": { bg: "bg-orange-500/10", icon: "text-orange-400", glow: "shadow-orange-500/30", gradient: "from-orange-500 to-amber-600" },
  "elizur-wright": { bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "shadow-emerald-500/30", gradient: "from-emerald-500 to-teal-600" },
};

const stanceConfig: Record<DebateStance, { icon: string; color: string; label: string }> = {
  agrees: { icon: "✓", color: "text-green-500 bg-green-500/10 border-green-500/30", label: "AGREES" },
  partially_agrees: { icon: "◐", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", label: "PARTIALLY AGREES" },
  disagrees: { icon: "✗", color: "text-red-500 bg-red-500/10 border-red-500/30", label: "DISAGREES" },
  rebuts: { icon: "↩", color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "REBUTS" },
  new_angle: { icon: "↗", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "NEW PERSPECTIVE" },
  synthesizes: { icon: "⊕", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "SYNTHESIZES" },
};

// Phase names for debate progression
const getDebatePhase = (turnNumber: number, maxTurns: number, isStreaming: boolean): { phase: string; description: string } => {
  const roundNumber = Math.ceil(turnNumber / 2);
  const totalRounds = maxTurns / 2;
  const isFirstTurnOfRound = turnNumber % 2 === 1;

  if (turnNumber === 1) {
    return {
      phase: "OPENING STATEMENT",
      description: isStreaming ? "Presenting initial position..." : "Avatar 1 presents opening argument"
    };
  }

  if (turnNumber === maxTurns) {
    return {
      phase: "CLOSING STATEMENT",
      description: isStreaming ? "Delivering final thoughts..." : "Final round concluding"
    };
  }

  if (isFirstTurnOfRound) {
    return {
      phase: `ROUND ${roundNumber} - CHALLENGER`,
      description: isStreaming ? "Presenting argument..." : `Round ${roundNumber} of ${totalRounds}`
    };
  }

  return {
    phase: `ROUND ${roundNumber} - RESPONSE`,
    description: isStreaming ? "Processing and responding..." : `Responding to challenger's points`
  };
};

// =============================================================================
// Phase Indicator Component
// =============================================================================

interface PhaseIndicatorProps {
  currentTurn: number;
  maxTurns: number;
  isStreaming: boolean;
  streamingAvatarName?: string;
  waitingAvatarName?: string;
}

function PhaseIndicator({ currentTurn, maxTurns, isStreaming, streamingAvatarName, waitingAvatarName }: PhaseIndicatorProps) {
  const { phase, description } = getDebatePhase(currentTurn, maxTurns, isStreaming);
  const roundNumber = Math.ceil(currentTurn / 2);
  const totalRounds = maxTurns / 2;
  const progress = ((currentTurn - 1) / maxTurns) * 100;

  return (
    <div className="px-4 py-3 border-b border-white/5 bg-[#0d0d14]">
      {/* Progress bar */}
      <div className="relative h-1 bg-white/5 rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
        {/* Round markers */}
        {Array.from({ length: Math.floor(totalRounds) }, (_, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/20 bg-[#12121a]"
            style={{ left: `${((i + 1) * 2 / maxTurns) * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        {/* Phase info */}
        <div className="flex items-center gap-3">
          <motion.div
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider border",
              isStreaming
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            )}
            animate={isStreaming ? { opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {phase}
          </motion.div>
          <span className="text-sm text-gray-400">{description}</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 text-xs">
          {isStreaming && streamingAvatarName && (
            <motion.div
              className="flex items-center gap-2 text-emerald-400"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono">{streamingAvatarName.split(" ")[0].toUpperCase()} SPEAKING</span>
            </motion.div>
          )}
          {isStreaming && waitingAvatarName && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="font-mono">{waitingAvatarName.split(" ")[0].toUpperCase()} LISTENING</span>
            </div>
          )}
          <div className="text-gray-500 font-mono">
            ROUND {roundNumber}/{totalRounds}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Phase-Based Progress Indicator
// =============================================================================

const PHASE_DISPLAY_CONFIG: Record<DebatePhase, { label: string; icon: string; color: string }> = {
  OPENING: { label: "OPENING", icon: "🎬", color: "cyan" },
  ARGUMENTS: { label: "ARGUMENTS", icon: "⚔️", color: "amber" },
  REBUTTALS: { label: "REBUTTALS", icon: "🛡️", color: "violet" },
  CLOSING: { label: "CLOSING", icon: "🏁", color: "emerald" },
  SUMMARY: { label: "SUMMARY", icon: "📊", color: "blue" },
  COMPLETED: { label: "COMPLETE", icon: "✓", color: "green" },
};

interface PhaseProgressBarProps {
  phases: Array<{ phase: DebatePhase }>;
  currentPhase: DebatePhase | null;
  phaseHistory: Array<{ phase: DebatePhase; completedAt: string | null }>;
}

function PhaseProgressBar({ phases, currentPhase, phaseHistory }: PhaseProgressBarProps) {
  const getPhaseStatus = (phase: DebatePhase) => {
    const historyEntry = phaseHistory.find((p) => p.phase === phase);
    if (historyEntry?.completedAt) return "completed";
    if (phase === currentPhase) return "active";
    return "pending";
  };

  return (
    <div className="px-4 py-3 border-b border-white/5 bg-[#0d0d14]">
      <div className="flex items-center justify-between gap-2">
        {phases.map((p, idx) => {
          const config = PHASE_DISPLAY_CONFIG[p.phase];
          const status = getPhaseStatus(p.phase);

          return (
            <div key={p.phase} className="flex-1 flex items-center">
              <motion.div
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                  status === "active" && `bg-${config.color}-500/10 border border-${config.color}-500/30`,
                  status === "completed" && "opacity-60",
                  status === "pending" && "opacity-30"
                )}
                animate={status === "active" ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{config.icon}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono tracking-wider",
                      status === "active" && `text-${config.color}-400`,
                      status === "completed" && "text-emerald-400",
                      status === "pending" && "text-gray-600"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                {status === "completed" && (
                  <Check className="w-3 h-3 text-emerald-400" />
                )}
                {status === "active" && (
                  <motion.div
                    className={`w-1.5 h-1.5 rounded-full bg-${config.color}-400`}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {idx < phases.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-700 mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Thinking Bubble Component
// =============================================================================

interface ThinkingBubbleProps {
  avatar: Avatar;
  thinkingState: AvatarThinkingState;
  position: "left" | "right";
}

function ThinkingBubble({ avatar, thinkingState, position }: ThinkingBubbleProps) {
  const Icon = avatarIcons[avatar.slug] || User;
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];

  if (!thinkingState.isThinking && thinkingState.thoughts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "mb-3 p-3 rounded-xl border bg-[#12121a]/80 backdrop-blur-sm",
        "border-violet-500/30 shadow-lg shadow-violet-500/10",
        position === "right" && "ml-auto max-w-[85%]",
        position === "left" && "mr-auto max-w-[85%]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center",
            colors.bg
          )}
        >
          <Icon className={cn("w-3 h-3", colors.icon)} />
        </div>
        <span className="text-xs font-medium text-gray-300">{avatar.name}</span>
        <motion.div
          className="flex items-center gap-1 ml-auto"
          animate={thinkingState.isThinking ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Brain className="w-3 h-3 text-violet-400" />
          <span className="text-[10px] font-mono tracking-wider text-violet-400">
            {thinkingState.isThinking ? "PROCESSING..." : "ANALYZED"}
          </span>
        </motion.div>
      </div>

      {/* Thinking Content */}
      <div className="space-y-1.5">
        {thinkingState.thoughts.map((thought, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-xs text-gray-400 italic pl-2 border-l-2 border-violet-500/30"
          >
            "{thought}"
          </motion.p>
        ))}
        {thinkingState.isThinking && thinkingState.currentThought && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-violet-300 italic pl-2 border-l-2 border-violet-500/50"
          >
            "{thinkingState.currentThought}"
          </motion.p>
        )}
      </div>

      {/* Thinking animation dots */}
      {thinkingState.isThinking && (
        <div className="flex items-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Phase Section Header
// =============================================================================

interface PhaseSectionHeaderProps {
  phase: DebatePhase;
  turnCount: number;
  isActive: boolean;
}

function PhaseSectionHeader({ phase, turnCount, isActive }: PhaseSectionHeaderProps) {
  const config = PHASE_DISPLAY_CONFIG[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2 my-4 rounded-lg",
        "bg-gradient-to-r from-white/[0.03] to-transparent",
        "border-l-2",
        isActive ? `border-${config.color}-500` : "border-gray-700"
      )}
    >
      <span className="text-lg">{config.icon}</span>
      <div className="flex-1">
        <h3
          className={cn(
            "text-sm font-mono tracking-wider",
            isActive ? `text-${config.color}-400` : "text-gray-400"
          )}
        >
          {config.label}
        </h3>
        <p className="text-[10px] text-gray-600">{turnCount} turn{turnCount !== 1 ? "s" : ""}</p>
      </div>
      {isActive && (
        <motion.div
          className={`px-2 py-0.5 rounded text-[10px] font-mono bg-${config.color}-500/10 text-${config.color}-400 border border-${config.color}-500/30`}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          IN PROGRESS
        </motion.div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Debate Setup Modal
// =============================================================================

interface DebateSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatars: Avatar[];
  selectedAvatars: Avatar[];
  onStart: (topic: string, format: DebateFormat) => void;
}

function DebateSetupModal({ open, onOpenChange, avatars, selectedAvatars, onStart }: DebateSetupModalProps) {
  const [topic, setTopic] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(DEBATE_FORMATS[1]);

  const canStart = selectedAvatars.length === 2 && topic.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart(topic.trim(), selectedFormat);
    setTopic("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg z-[200] bg-[#12121a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-gray-100">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <MessageSquareIcon className="w-5 h-5 text-cyan-400" />
            </div>
            Initialize Debate
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure a structured debate between two neural advisors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* VS Display */}
          <div className="flex items-center justify-center gap-6 relative">
            {selectedAvatars.map((avatar, idx) => {
              const Icon = avatarIcons[avatar.slug] || User;
              const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];
              return (
                <div key={avatar.id} className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center border border-white/10",
                      colors.bg, "shadow-lg", colors.glow
                    )}
                    animate={{ boxShadow: ["0 0 15px rgba(0,0,0,0.3)", "0 0 25px rgba(0,0,0,0.2)", "0 0 15px rgba(0,0,0,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className={cn("w-8 h-8", colors.icon)} />
                  </motion.div>
                  <span className="text-sm font-medium mt-2 text-gray-200">{avatar.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                    {idx === 0 ? "CHALLENGER" : "DEFENDER"}
                  </span>
                </div>
              );
            })}
            {selectedAvatars.length === 2 && (
              <div className="absolute text-2xl font-bold text-gray-600 font-mono">
                VS
              </div>
            )}
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Debate Topic</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Should I use assumptive closes on Medicare leads?"
              className="resize-none bg-black/30 border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/50"
              rows={2}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Debate Format</label>
            <div className="grid grid-cols-3 gap-2">
              {DEBATE_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    selectedFormat.id === format.id
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                  )}
                >
                  <div className="text-sm font-medium text-gray-200">{format.label}</div>
                  <div className="text-xs text-gray-500">
                    {format.roundsPerAvatar} full rounds
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {format.totalTurns} total exchanges
                  </div>
                  {format.id === "standard" && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      OPTIMAL
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Each round = both advisors speak once. E.g., 3 rounds means each avatar speaks 3 times.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300">
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!canStart} className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-0">
            <MessageSquareIcon className="w-4 h-4" />
            Initiate Debate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Avatar Podium (Speaker Display)
// =============================================================================

interface AvatarPodiumProps {
  avatar: Avatar;
  position: "left" | "right";
  isActive: boolean;
  isStreaming: boolean;
  status: "speaking" | "waiting" | "preparing" | "finished";
  turnCount: number;
}

function AvatarPodium({ avatar, position, isActive, isStreaming, status, turnCount }: AvatarPodiumProps) {
  const Icon = avatarIcons[avatar.slug] || User;
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];

  const statusLabels = {
    speaking: "SPEAKING",
    waiting: "LISTENING",
    preparing: "THINKING",
    finished: "COMPLETE",
  };

  const statusStyles = {
    speaking: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    waiting: "bg-white/5 text-gray-500 border-white/10",
    preparing: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    finished: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center transition-all duration-300",
        !isActive && "opacity-40"
      )}
    >
      <div className="relative">
        <motion.div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all border border-white/10",
            colors.bg,
            isActive && ["ring-2 shadow-xl", colors.glow, colors.glow.replace("shadow", "ring")]
          )}
          animate={isStreaming ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Icon className={cn("w-10 h-10", colors.icon)} />
        </motion.div>

        {/* Status Badge */}
        <motion.div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[10px] font-mono tracking-wider border",
            statusStyles[status]
          )}
          animate={status === "speaking" || status === "preparing" ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {statusLabels[status]}
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="font-semibold text-sm text-gray-100">{avatar.name}</h3>
        <p className="text-xs text-gray-500 font-mono">
          {turnCount} TURN{turnCount !== 1 ? "S" : ""}
        </p>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Turn Card (Response Display)
// =============================================================================

interface TurnCardProps {
  message: AvatarMessage;
  avatar: Avatar;
  turnNumber: number;
  stance?: DebateStance;
  targetClaim?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  onCopy?: () => void;
  onBookmark?: () => void;
}

function TurnCard({
  message,
  avatar,
  turnNumber,
  stance,
  targetClaim,
  isStreaming,
  streamingContent,
  onCopy,
  onBookmark,
}: TurnCardProps) {
  const Icon = avatarIcons[avatar.slug] || User;
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];
  const content = isStreaming ? streamingContent || "" : message.content;
  const roundNumber = Math.ceil(turnNumber / 2);
  const stanceInfo = stance ? stanceConfig[stance] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4"
    >
      <div className={cn(
        "overflow-hidden rounded-xl border border-white/5 bg-[#12121a]",
        isStreaming && ["shadow-lg", colors.glow]
      )}>
        {/* Accent line at top */}
        <div className={cn("h-[2px] bg-gradient-to-r", colors.gradient)} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border border-white/10",
              colors.bg
            )}>
              <Icon className={cn("w-4 h-4", colors.icon)} />
            </div>
            <div>
              <span className="font-medium text-sm text-gray-100">{avatar.name}</span>
              <span className="text-[10px] text-gray-500 ml-2 font-mono">
                ROUND {roundNumber}
              </span>
            </div>
          </div>

          {stanceInfo && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium",
              stanceInfo.color
            )}>
              <span>{stanceInfo.icon}</span>
              <span>{stanceInfo.label}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-200">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-gray-200">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-gray-200">{children}</ol>,
                li: ({ children }) => <li className="mb-1 text-gray-300">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <motion.span
                className={cn("inline-block w-2 h-5 ml-0.5", colors.bg.replace("/10", ""))}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>

          {/* Stance Target */}
          {targetClaim && !isStreaming && (
            <div className="mt-3 p-2 rounded-lg bg-white/[0.02] border border-dashed border-white/10">
              <p className="text-xs text-gray-400">
                <span className="font-medium">{stanceInfo?.icon} {stanceInfo?.label}:</span>{" "}
                "{targetClaim}"
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-1 px-4 py-2 border-t border-white/5 bg-black/20">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5" onClick={onCopy}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5" onClick={onBookmark}>
              <Bookmark className="w-3 h-3 mr-1" />
              Save
            </Button>
            {message.tokensUsed && (
              <span className="ml-auto text-[10px] text-gray-500 font-mono">
                {message.tokensUsed} TOKENS
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Timeline
// =============================================================================

interface TimelineProps {
  totalTurns: number;
  currentTurn: number;
  avatar1: Avatar;
  avatar2: Avatar;
  turnMeta: Array<{ turnNumber: number; stance?: DebateStance }>;
}

function Timeline({ totalTurns, currentTurn, avatar1, avatar2, turnMeta }: TimelineProps) {
  const totalRounds = Math.ceil(totalTurns / 2);
  const currentRound = Math.ceil(currentTurn / 2);
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  const colors1 = avatarColors[avatar1.slug] || avatarColors["insurance-expert"];
  const colors2 = avatarColors[avatar2.slug] || avatarColors["mindset-coach"];

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
      {rounds.map((round) => {
        const turn1 = (round - 1) * 2 + 1; // Avatar 1's turn in this round
        const turn2 = (round - 1) * 2 + 2; // Avatar 2's turn in this round
        const isRoundComplete = turn2 < currentTurn;
        const isCurrentRound = round === currentRound;
        const isAvatar1Speaking = currentTurn === turn1;
        const isAvatar2Speaking = currentTurn === turn2;
        const turn1Complete = turn1 < currentTurn;
        const turn2Complete = turn2 < currentTurn;

        const meta1 = turnMeta.find(m => m.turnNumber === turn1);
        const meta2 = turnMeta.find(m => m.turnNumber === turn2);

        return (
          <motion.div
            key={round}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-lg transition-all",
              isCurrentRound && "bg-white/[0.03] border border-white/10",
              !isCurrentRound && !isRoundComplete && "opacity-40"
            )}
            animate={isCurrentRound ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Round label */}
            <span className={cn(
              "text-[10px] font-mono tracking-wider",
              isCurrentRound ? "text-cyan-400" : isRoundComplete ? "text-gray-400" : "text-gray-600"
            )}>
              ROUND {round}
            </span>

            {/* Avatar turns */}
            <div className="flex items-center gap-1">
              {/* Avatar 1 turn */}
              <motion.div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-medium transition-all border",
                  turn1Complete && cn(colors1.bg, colors1.icon, "border-white/10"),
                  isAvatar1Speaking && cn(colors1.bg, colors1.icon, "border-white/20 ring-2 shadow-lg", colors1.glow, colors1.glow.replace("shadow", "ring")),
                  !turn1Complete && !isAvatar1Speaking && "bg-white/5 text-gray-600 border-white/5"
                )}
                animate={isAvatar1Speaking ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {turn1Complete ? (meta1?.stance ? stanceConfig[meta1.stance].icon : "✓") : "1"}
              </motion.div>

              {/* Arrow */}
              <motion.span
                className={cn(
                  "text-[10px]",
                  isCurrentRound && turn1Complete && !turn2Complete ? "text-cyan-400" : "text-gray-700"
                )}
                animate={isCurrentRound && turn1Complete && !turn2Complete ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                →
              </motion.span>

              {/* Avatar 2 turn */}
              <motion.div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-medium transition-all border",
                  turn2Complete && cn(colors2.bg, colors2.icon, "border-white/10"),
                  isAvatar2Speaking && cn(colors2.bg, colors2.icon, "border-white/20 ring-2 shadow-lg", colors2.glow, colors2.glow.replace("shadow", "ring")),
                  !turn2Complete && !isAvatar2Speaking && "bg-white/5 text-gray-600 border-white/5"
                )}
                animate={isAvatar2Speaking ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {turn2Complete ? (meta2?.stance ? stanceConfig[meta2.stance].icon : "✓") : "2"}
              </motion.div>
            </div>

            {/* Status */}
            <span className={cn(
              "text-[9px] font-mono",
              isRoundComplete ? "text-emerald-400" : isCurrentRound ? "text-cyan-400" : "text-gray-600"
            )}>
              {isRoundComplete ? "COMPLETE" : isCurrentRound ? "IN PROGRESS" : "PENDING"}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Key Points Sidebar
// =============================================================================

interface KeyPointsSidebarProps {
  avatar1: Avatar;
  avatar2: Avatar;
  keyPoints: { avatar1: string[]; avatar2: string[] };
  isExpanded: boolean;
  onToggle: () => void;
}

function KeyPointsSidebar({ avatar1, avatar2, keyPoints, isExpanded, onToggle }: KeyPointsSidebarProps) {
  const Icon1 = avatarIcons[avatar1.slug] || User;
  const Icon2 = avatarIcons[avatar2.slug] || User;
  const colors1 = avatarColors[avatar1.slug] || avatarColors["insurance-expert"];
  const colors2 = avatarColors[avatar2.slug] || avatarColors["mindset-coach"];

  return (
    <div className={cn(
      "border-l border-white/5 bg-[#0d0d14] transition-all duration-300",
      isExpanded ? "w-64" : "w-10"
    )}>
      <button
        onClick={onToggle}
        className="w-full p-2 flex items-center justify-center hover:bg-white/5 transition-colors text-gray-500"
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-4">
          <h4 className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">
            KEY ARGUMENTS
          </h4>

          {/* Avatar 1 Points */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center border border-white/10",
                colors1.bg
              )}>
                <Icon1 className={cn("w-3 h-3", colors1.icon)} />
              </div>
              {avatar1.name}
            </div>
            {keyPoints.avatar1.length > 0 ? (
              <ul className="text-xs space-y-1.5 ml-7">
                {keyPoints.avatar1.map((point, i) => (
                  <li key={i} className="text-gray-400">• {point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600 ml-7 font-mono">AWAITING...</p>
            )}
          </div>

          {/* Avatar 2 Points */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center border border-white/10",
                colors2.bg
              )}>
                <Icon2 className={cn("w-3 h-3", colors2.icon)} />
              </div>
              {avatar2.name}
            </div>
            {keyPoints.avatar2.length > 0 ? (
              <ul className="text-xs space-y-1.5 ml-7">
                {keyPoints.avatar2.map((point, i) => (
                  <li key={i} className="text-gray-400">• {point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600 ml-7 font-mono">AWAITING...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// User Injection Modal
// =============================================================================

interface InjectQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (question: string) => void;
}

function InjectQuestionModal({ open, onOpenChange, onSubmit }: InjectQuestionModalProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[200] bg-[#12121a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-100">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <MessageSquareIcon className="w-4 h-4 text-amber-400" />
            </div>
            Inject Query
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Both neural advisors will address your question before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What if the client explicitly asks for a recommendation?"
            rows={3}
            className="bg-black/30 border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-amber-500/50"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim()}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 border-0"
          >
            <MessageSquareIcon className="w-4 h-4" />
            Inject Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Debate Summary Screen
// =============================================================================

interface DebateSummaryScreenProps {
  topic: string;
  avatar1: Avatar;
  avatar2: Avatar;
  messages: AvatarMessage[];
  onNewDebate: () => void;
  onBackToLobby: () => void;
  onChat1on1: (avatarId: string) => void;
}

function DebateSummaryScreen({
  topic,
  avatar1,
  avatar2,
  messages,
  onNewDebate,
  onBackToLobby,
  onChat1on1,
}: DebateSummaryScreenProps) {
  const Icon1 = avatarIcons[avatar1.slug] || User;
  const Icon2 = avatarIcons[avatar2.slug] || User;
  const colors1 = avatarColors[avatar1.slug] || avatarColors["insurance-expert"];
  const colors2 = avatarColors[avatar2.slug] || avatarColors["mindset-coach"];
  const summary = useDebateSummary();

  // Count turns per avatar
  const avatar1Turns = messages.filter(m => m.avatarId === avatar1.id).length;
  const avatar2Turns = messages.filter(m => m.avatarId === avatar2.id).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 h-full flex flex-col bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="text-center py-6 border-b border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
        <motion.div
          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Check className="w-7 h-7 text-emerald-400" />
        </motion.div>
        <h2 className="text-xl font-semibold text-gray-100">
          Debate Complete
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-mono tracking-wide">"{topic}"</p>
        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-mono tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg">
          ANALYSIS READY
        </span>
      </div>

      <ScrollArea className="flex-1 p-6">
        {/* Executive Summary */}
        {summary && (
          <div className="mb-6 rounded-xl border border-white/5 bg-[#12121a] overflow-hidden">
            {/* Accent line */}
            <div className="h-[2px] bg-gradient-to-r from-cyan-600 to-blue-600" />
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-100">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-mono text-sm tracking-wide">EXECUTIVE SUMMARY</span>
              </h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {summary.executiveSummary}
              </p>

              {summary.keyConsensus.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-xs font-mono tracking-wider text-emerald-400 mb-2">CONSENSUS POINTS</h4>
                  <ul className="text-sm space-y-1.5">
                    {summary.keyConsensus.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.unresolvedPoints.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <h4 className="text-xs font-mono tracking-wider text-amber-400 mb-2">UNRESOLVED</h4>
                  <ul className="text-sm space-y-1.5">
                    {summary.unresolvedPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avatar Summaries */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Avatar 1 */}
          <div className="rounded-xl border border-white/5 bg-[#12121a] overflow-hidden">
            <div className={cn("h-[2px] bg-gradient-to-r", colors1.gradient)} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10",
                  colors1.bg
                )}>
                  <Icon1 className={cn("w-5 h-5", colors1.icon)} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-100">{avatar1.name}</h4>
                  <p className="text-xs text-gray-500 font-mono">{avatar1Turns} TURNS</p>
                </div>
              </div>

              {summary?.avatar1Points && summary.avatar1Points.length > 0 && (
                <ul className="text-sm space-y-1.5 mb-4">
                  {summary.avatar1Points.map((point, i) => (
                    <li key={i} className="text-gray-400">• {point}</li>
                  ))}
                </ul>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
                onClick={() => onChat1on1(avatar1.id)}
              >
                Neural Link 1:1
              </Button>
            </div>
          </div>

          {/* Avatar 2 */}
          <div className="rounded-xl border border-white/5 bg-[#12121a] overflow-hidden">
            <div className={cn("h-[2px] bg-gradient-to-r", colors2.gradient)} />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10",
                  colors2.bg
                )}>
                  <Icon2 className={cn("w-5 h-5", colors2.icon)} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-100">{avatar2.name}</h4>
                  <p className="text-xs text-gray-500 font-mono">{avatar2Turns} TURNS</p>
                </div>
              </div>

              {summary?.avatar2Points && summary.avatar2Points.length > 0 && (
                <ul className="text-sm space-y-1.5 mb-4">
                  {summary.avatar2Points.map((point, i) => (
                    <li key={i} className="text-gray-400">• {point}</li>
                  ))}
                </ul>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
                onClick={() => onChat1on1(avatar2.id)}
              >
                Neural Link 1:1
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-[#12121a]/80 backdrop-blur-xl flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBackToLobby}
          className="gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <FileText className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={onNewDebate}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-0"
          >
            <RotateCcw className="w-4 h-4" />
            New Debate
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Comprehensive Summary Screen (Phase-Based)
// =============================================================================

interface ComprehensiveSummaryScreenProps {
  summary: ComprehensiveDebateSummary;
  avatar1: Avatar;
  avatar2: Avatar;
  turns: DebateTurn[];
  onNewDebate: () => void;
  onBackToLobby: () => void;
  onChat1on1: (avatarId: string) => void;
}

function ComprehensiveSummaryScreen({
  summary,
  avatar1,
  avatar2,
  turns,
  onNewDebate,
  onBackToLobby,
  onChat1on1,
}: ComprehensiveSummaryScreenProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("executive");
  const Icon1 = avatarIcons[avatar1.slug] || User;
  const Icon2 = avatarIcons[avatar2.slug] || User;
  const colors1 = avatarColors[avatar1.slug] || avatarColors["insurance-expert"];
  const colors2 = avatarColors[avatar2.slug] || avatarColors["mindset-coach"];

  const SummarySection = ({
    id,
    title,
    icon,
    children,
    accentColor = "cyan",
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    accentColor?: string;
  }) => {
    const isExpanded = expandedSection === id;
    return (
      <motion.div
        className={cn(
          "rounded-xl border border-white/5 bg-[#12121a] overflow-hidden mb-4",
          isExpanded && `ring-1 ring-${accentColor}-500/30`
        )}
        layout
      >
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className={cn(
            "w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors",
            `border-l-2 border-${accentColor}-500`
          )}
        >
          <div className={`w-8 h-8 rounded-lg bg-${accentColor}-500/10 flex items-center justify-center`}>
            {icon}
          </div>
          <span className="font-medium text-gray-100 flex-1 text-left">{title}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 h-full flex flex-col bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="text-center py-6 border-b border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FileText className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-xl font-semibold text-gray-100">Debate Analysis Complete</h2>
        <p className="text-gray-400 text-sm mt-1 font-mono tracking-wide max-w-md mx-auto px-4">
          "{summary.topic}"
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg">
            {summary.totalTurns} TURNS
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg">
            {summary.totalDuration || "N/A"}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 sm:p-6">
        {/* Executive Summary */}
        <SummarySection
          id="executive"
          title="Executive Summary"
          icon={<FileText className="w-4 h-4 text-cyan-400" />}
          accentColor="cyan"
        >
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {summary.executiveSummary}
          </p>

          {/* Winner (if determined) */}
          {summary.overallWinner && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono tracking-wider text-amber-400">DEBATE EDGE</span>
              </div>
              <p className="text-sm text-gray-200">
                <strong className="text-amber-300">{summary.overallWinner.avatarName}</strong>{" "}
                {summary.overallWinner.reason}
              </p>
            </div>
          )}

          {/* Consensus & Disagreements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summary.keyConsensusPoints.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-xs font-mono tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> CONSENSUS
                </h4>
                <ul className="text-sm space-y-1.5">
                  {summary.keyConsensusPoints.map((point, i) => (
                    <li key={i} className="text-gray-300 text-xs">• {point}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.unresolvedDisagreements.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-xs font-mono tracking-wider text-amber-400 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> UNRESOLVED
                </h4>
                <ul className="text-sm space-y-1.5">
                  {summary.unresolvedDisagreements.map((point, i) => (
                    <li key={i} className="text-gray-300 text-xs">• {point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SummarySection>

        {/* Avatar 1 Analysis */}
        <SummarySection
          id="avatar1"
          title={`${avatar1.name}'s Analysis`}
          icon={<Icon1 className={cn("w-4 h-4", colors1.icon)} />}
          accentColor="amber"
        >
          <div className="space-y-4">
            {/* Position */}
            <div>
              <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-1">POSITION</h5>
              <p className="text-sm text-gray-300">{summary.avatar1Analysis.position}</p>
            </div>

            {/* Key Arguments */}
            <div>
              <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">KEY ARGUMENTS</h5>
              <ul className="space-y-1.5">
                {summary.avatar1Analysis.keyArguments.map((arg, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className={cn("mt-0.5", colors1.icon)}>•</span> {arg}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h5 className="text-[10px] font-mono tracking-wider text-emerald-400 mb-1">STRENGTHS</h5>
                <ul className="text-[11px] space-y-1">
                  {summary.avatar1Analysis.strengths.map((s, i) => (
                    <li key={i} className="text-gray-400">+ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                <h5 className="text-[10px] font-mono tracking-wider text-red-400 mb-1">WEAKNESSES</h5>
                <ul className="text-[11px] space-y-1">
                  {summary.avatar1Analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-gray-400">- {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Notable Quotes */}
            {summary.avatar1Analysis.notableQuotes.length > 0 && (
              <div>
                <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">NOTABLE QUOTES</h5>
                <div className="space-y-2">
                  {summary.avatar1Analysis.notableQuotes.map((quote, i) => (
                    <blockquote
                      key={i}
                      className={cn(
                        "text-xs text-gray-300 italic pl-3 border-l-2",
                        `border-${colors1.icon.replace("text-", "")}`
                      )}
                    >
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className={cn("w-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300")}
              onClick={() => onChat1on1(avatar1.id)}
            >
              Continue with {avatar1.name}
            </Button>
          </div>
        </SummarySection>

        {/* Avatar 2 Analysis */}
        <SummarySection
          id="avatar2"
          title={`${avatar2.name}'s Analysis`}
          icon={<Icon2 className={cn("w-4 h-4", colors2.icon)} />}
          accentColor="violet"
        >
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-1">POSITION</h5>
              <p className="text-sm text-gray-300">{summary.avatar2Analysis.position}</p>
            </div>

            <div>
              <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">KEY ARGUMENTS</h5>
              <ul className="space-y-1.5">
                {summary.avatar2Analysis.keyArguments.map((arg, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className={cn("mt-0.5", colors2.icon)}>•</span> {arg}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h5 className="text-[10px] font-mono tracking-wider text-emerald-400 mb-1">STRENGTHS</h5>
                <ul className="text-[11px] space-y-1">
                  {summary.avatar2Analysis.strengths.map((s, i) => (
                    <li key={i} className="text-gray-400">+ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                <h5 className="text-[10px] font-mono tracking-wider text-red-400 mb-1">WEAKNESSES</h5>
                <ul className="text-[11px] space-y-1">
                  {summary.avatar2Analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-gray-400">- {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {summary.avatar2Analysis.notableQuotes.length > 0 && (
              <div>
                <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">NOTABLE QUOTES</h5>
                <div className="space-y-2">
                  {summary.avatar2Analysis.notableQuotes.map((quote, i) => (
                    <blockquote
                      key={i}
                      className={cn(
                        "text-xs text-gray-300 italic pl-3 border-l-2",
                        `border-${colors2.icon.replace("text-", "")}`
                      )}
                    >
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
              onClick={() => onChat1on1(avatar2.id)}
            >
              Continue with {avatar2.name}
            </Button>
          </div>
        </SummarySection>

        {/* Phase Breakdown */}
        <SummarySection
          id="phases"
          title="Phase Breakdown"
          icon={<Target className="w-4 h-4 text-violet-400" />}
          accentColor="violet"
        >
          <div className="space-y-4">
            {/* Opening */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono tracking-wider text-cyan-400 mb-2">🎬 OPENING</h5>
              <p className="text-xs text-gray-400">{summary.phaseBreakdown.opening.summary}</p>
              <ul className="mt-2 space-y-1">
                {summary.phaseBreakdown.opening.keyPoints.map((p, i) => (
                  <li key={i} className="text-[11px] text-gray-500">• {p}</li>
                ))}
              </ul>
            </div>

            {/* Arguments */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono tracking-wider text-amber-400 mb-2">
                ⚔️ ARGUMENTS ({summary.phaseBreakdown.arguments.rounds} rounds)
              </h5>
              <ul className="space-y-1">
                {summary.phaseBreakdown.arguments.majorTopics.map((t, i) => (
                  <li key={i} className="text-[11px] text-gray-500">• {t}</li>
                ))}
              </ul>
            </div>

            {/* Rebuttals */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono tracking-wider text-violet-400 mb-2">🛡️ REBUTTALS</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-gray-600 mb-1">CHALLENGES</p>
                  <ul className="space-y-1">
                    {summary.phaseBreakdown.rebuttals.directChallenges.map((c, i) => (
                      <li key={i} className="text-[11px] text-gray-500">• {c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 mb-1">EFFECTIVE COUNTERS</p>
                  <ul className="space-y-1">
                    {summary.phaseBreakdown.rebuttals.effectiveCounters.map((c, i) => (
                      <li key={i} className="text-[11px] text-gray-500">• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <h5 className="text-xs font-mono tracking-wider text-emerald-400 mb-2">🏁 CLOSING</h5>
              <ul className="space-y-1">
                {summary.phaseBreakdown.closing.finalPositions.map((p, i) => (
                  <li key={i} className="text-[11px] text-gray-500">• {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </SummarySection>

        {/* Actionable Insights */}
        <SummarySection
          id="insights"
          title="Actionable Insights"
          icon={<Target className="w-4 h-4 text-emerald-400" />}
          accentColor="emerald"
        >
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">KEY TAKEAWAYS</h5>
              <ul className="space-y-2">
                {summary.actionableInsights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-300 flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {summary.recommendedNextSteps.length > 0 && (
              <div>
                <h5 className="text-xs font-mono tracking-wider text-gray-500 mb-2">RECOMMENDED NEXT STEPS</h5>
                <ol className="space-y-2">
                  {summary.recommendedNextSteps.map((step, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-300 flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </SummarySection>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-[#12121a]/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={onBackToLobby}
          className="gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 flex-1 sm:flex-none"
          >
            <Copy className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={onNewDebate}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-0 flex-1 sm:flex-none"
          >
            <RotateCcw className="w-4 h-4" />
            New Debate
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Summary Generating Screen
// =============================================================================

interface SummaryGeneratingScreenProps {
  topic: string;
  avatar1: Avatar;
  avatar2: Avatar;
}

function SummaryGeneratingScreen({ topic, avatar1, avatar2 }: SummaryGeneratingScreenProps) {
  const Icon1 = avatarIcons[avatar1.slug] || User;
  const Icon2 = avatarIcons[avatar2.slug] || User;
  const colors1 = avatarColors[avatar1.slug] || avatarColors["insurance-expert"];
  const colors2 = avatarColors[avatar2.slug] || avatarColors["mindset-coach"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0f]"
    >
      <motion.div
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-500/20 mb-6"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="w-10 h-10 text-violet-400" />
      </motion.div>

      <h2 className="text-xl font-semibold text-gray-100 mb-2">Analyzing Debate</h2>
      <p className="text-gray-400 text-sm text-center max-w-md mb-6">
        Generating comprehensive summary and insights from the discussion...
      </p>

      {/* Avatar faces */}
      <div className="flex items-center gap-6 mb-8">
        <motion.div
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors1.bg)}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >
          <Icon1 className={cn("w-6 h-6", colors1.icon)} />
        </motion.div>
        <motion.div
          className="text-gray-600 font-mono"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⟷
        </motion.div>
        <motion.div
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors2.bg)}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <Icon2 className={cn("w-6 h-6", colors2.icon)} />
        </motion.div>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <p className="text-[10px] font-mono tracking-wider text-gray-600 mt-4">
        PROCESSING DEBATE DATA...
      </p>
    </motion.div>
  );
}

// =============================================================================
// Main DebateView Component
// =============================================================================

interface DebateViewProps {
  className?: string;
  onBackToLobby: () => void;
}

export function DebateView({ className, onBackToLobby }: DebateViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSetup, setShowSetup] = useState(true); // Auto-open setup modal
  const [showInject, setShowInject] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const hasInitialized = useRef(false);

  // Store state
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore((state) => state.selectedAvatarIds);
  const isLoading = useAvatarCouncilStore((state) => state.isLoading);
  const connectionStatus = useAvatarCouncilStore((state) => state.connectionStatus);
  const connectionState = useConnectionState();
  const userId = useAvatarCouncilStore((state) => state.userId);
  const isAdmin = useAvatarCouncilStore((state) => state.isAdmin);

  // Actions
  const startDebate = useAvatarCouncilStore((state) => state.startDebate);
  const pauseDebate = useAvatarCouncilStore((state) => state.pauseDebate);
  const resumeDebate = useAvatarCouncilStore((state) => state.resumeDebate);
  const interruptDebate = useAvatarCouncilStore((state) => state.interruptDebate);
  const injectQuestion = useAvatarCouncilStore((state) => state.injectQuestion);
  const clearDebateState = useAvatarCouncilStore((state) => state.clearDebateState);
  const connect = useAvatarCouncilStore((state) => state.connect);
  const cancelReconnect = useAvatarCouncilStore((state) => state.cancelReconnect);

  // Debate state
  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();
  const currentDebate = useCurrentDebate();
  const turnMeta = useDebateTurnMeta();
  const keyPoints = useDebateKeyPoints();

  // Phase-based debate state
  const currentPhase = useCurrentPhase();
  const debatePhases = useDebatePhases();
  const phaseHistory = usePhaseHistory();
  const debateTurns = useDebateTurns();
  const thinkingState = useThinkingState();
  const comprehensiveSummary = useComprehensiveSummary();
  const isGeneratingSummary = useIsGeneratingSummary();

  // Computed
  const selectedAvatars = useMemo(
    () => avatars.filter(a => selectedAvatarIds.includes(a.id)),
    [avatars, selectedAvatarIds]
  );

  const avatar1 = avatars.find(a => a.id === currentDebate?.avatar1Id);
  const avatar2 = avatars.find(a => a.id === currentDebate?.avatar2Id);

  const isConnected = connectionStatus === "connected";
  const showConnectionBanner = connectionStatus !== "connected";
  const isDebateActive = currentDebate?.status === "active";
  const isDebatePaused = currentDebate?.status === "paused";
  const isDebateComplete = currentDebate?.status === "completed" || currentDebate?.status === "interrupted";

  // Avatar turn counts
  const avatar1TurnCount = messages.filter(m => m.avatarId === avatar1?.id).length;
  const avatar2TurnCount = messages.filter(m => m.avatarId === avatar2?.id).length;

  // Determine who is currently speaking
  const currentSpeaker = streamingAvatarId
    ? (streamingAvatarId === avatar1?.id ? avatar1 : avatar2)
    : null;

  // Auto-open setup modal when entering debate view with 2 avatars
  useEffect(() => {
    if (!hasInitialized.current && selectedAvatars.length === 2 && !currentDebate) {
      hasInitialized.current = true;
      setShowSetup(true);
    }
  }, [selectedAvatars.length, currentDebate]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Handlers
  const handleStartDebate = (topic: string, format: DebateFormat) => {
    if (selectedAvatars.length !== 2) return;
    startDebate(topic, selectedAvatars[0].id, selectedAvatars[1].id, {
      maxTurns: format.totalTurns,
    });
  };

  const handleNewDebate = () => {
    clearDebateState();
    setShowSetup(true);
  };

  const handleChat1on1 = (avatarId: string) => {
    // This would switch to single chat mode - for now just go back to lobby
    clearDebateState();
    onBackToLobby();
  };

  // No debate started - show setup prompt
  if (!currentDebate) {
    return (
      <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/20"
              animate={{ boxShadow: ["0 0 20px rgba(6,182,212,0.2)", "0 0 40px rgba(6,182,212,0.3)", "0 0 20px rgba(6,182,212,0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <MessageSquareIcon className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-100">Debate Arena</h2>
            <p className="text-gray-400 text-center max-w-md mb-2">
              Engage two neural advisors in structured debate.
            </p>
            <span className="text-xs font-mono tracking-wider text-gray-600 mb-8">
              SELECT 2 ADVISORS TO INITIALIZE
            </span>

            {selectedAvatars.length === 2 ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center justify-center gap-8">
                  {selectedAvatars.map((avatar, idx) => {
                    const Icon = avatarIcons[avatar.slug] || User;
                    const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];
                    return (
                      <motion.div
                        key={avatar.id}
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <motion.div
                          className={cn(
                            "w-16 h-16 rounded-xl flex items-center justify-center border border-white/10 shadow-lg",
                            colors.bg, colors.glow
                          )}
                          animate={{ scale: [1, 1.03, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                        >
                          <Icon className={cn("w-8 h-8", colors.icon)} />
                        </motion.div>
                        <span className="text-sm font-medium mt-2 text-gray-200">{avatar.name}</span>
                        <span className="text-[10px] font-mono text-gray-600 tracking-wider">
                          {idx === 0 ? "CHALLENGER" : "DEFENDER"}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  onClick={() => setShowSetup(true)}
                  className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-0"
                >
                  <MessageSquareIcon className="w-5 h-5" />
                  Initialize Debate
                </Button>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm font-mono text-gray-400">
                  {selectedAvatars.length}/2 ADVISORS SELECTED
                </span>
              </div>
            )}
          </div>
        </div>

        <DebateSetupModal
          open={showSetup}
          onOpenChange={setShowSetup}
          avatars={avatars}
          selectedAvatars={selectedAvatars}
          onStart={handleStartDebate}
        />
      </div>
    );
  }

  // Summary generating - show loading screen
  if (isGeneratingSummary && avatar1 && avatar2) {
    return (
      <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
        <SummaryGeneratingScreen
          topic={currentDebate?.topic || ""}
          avatar1={avatar1}
          avatar2={avatar2}
        />
      </div>
    );
  }

  // Debate complete - show comprehensive summary if available
  if (isDebateComplete && avatar1 && avatar2) {
    // Use comprehensive summary if available (phase-based debate)
    if (comprehensiveSummary) {
      return (
        <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
          <ComprehensiveSummaryScreen
            summary={comprehensiveSummary}
            avatar1={avatar1}
            avatar2={avatar2}
            turns={debateTurns}
            onNewDebate={handleNewDebate}
            onBackToLobby={() => { clearDebateState(); onBackToLobby(); }}
            onChat1on1={handleChat1on1}
          />
        </div>
      );
    }

    // Fall back to old summary screen
    return (
      <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
        <DebateSummaryScreen
          topic={currentDebate.topic}
          avatar1={avatar1}
          avatar2={avatar2}
          messages={messages}
          onNewDebate={handleNewDebate}
          onBackToLobby={() => { clearDebateState(); onBackToLobby(); }}
          onChat1on1={handleChat1on1}
        />
      </div>
    );
  }

  // Active debate
  return (
    <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-white/5 px-3 sm:px-4 py-2 sm:py-3 bg-[#12121a]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={onBackToLobby} className="flex-shrink-0 text-gray-400 hover:text-gray-200 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="font-semibold flex items-center gap-2 text-gray-100 text-sm sm:text-base truncate">
                <MessageSquareIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate">
                  {currentDebate.topic}
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-mono tracking-wide">
                {Math.ceil(currentDebate.maxTurns / 2)} ROUND{currentDebate.maxTurns > 2 ? "S" : ""} • {currentDebate.maxTurns} EXCHANGES
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-mono tracking-wider border",
                isDebateActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-gray-500 border-white/10"
              )}
              animate={isDebateActive ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentDebate.status === "active" ? "LIVE" : currentDebate.status.toUpperCase()}
            </motion.div>
            {isDebateActive && (
              <>
                {/* Expert Summon Panel */}
                <ExpertSummonPanel
                  debateId={currentDebate.id}
                  participantIds={selectedAvatarIds}
                  className="hidden sm:flex"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={interruptDebate}
                  className="gap-1 hidden sm:flex bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                >
                  <Square className="w-3 h-3" />
                  End
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Connection Banner */}
      <AnimatePresence>
        {showConnectionBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 px-3 sm:px-4 py-2 bg-amber-500/5 border-b border-amber-500/20"
          >
            <ConnectionBanner
              status={connectionState.status}
              errorMessage={connectionState.lastError?.message}
              reconnectAttempts={connectionState.reconnectAttempts}
              maxAttempts={10}
              queuedMessages={connectionState.queuedMessages}
              onRetry={() => connect(userId, isAdmin)}
              onCancel={cancelReconnect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase Progress Bar (Phase-based debates) */}
      {avatar1 && avatar2 && debatePhases.length > 0 && (
        <PhaseProgressBar
          phases={debatePhases}
          currentPhase={currentPhase}
          phaseHistory={phaseHistory}
        />
      )}

      {/* Legacy Phase Indicator (Turn-based debates) */}
      {avatar1 && avatar2 && debatePhases.length === 0 && (
        <PhaseIndicator
          currentTurn={currentDebate.currentTurn}
          maxTurns={currentDebate.maxTurns}
          isStreaming={!!streamingAvatarId}
          streamingAvatarName={streamingAvatarId === avatar1.id ? avatar1.name : streamingAvatarId === avatar2.id ? avatar2.name : undefined}
          waitingAvatarName={streamingAvatarId === avatar1.id ? avatar2.name : streamingAvatarId === avatar2.id ? avatar1.name : undefined}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Arena */}
        <div className="flex-1 flex flex-col">
          {/* Podiums - Responsive: stacked on mobile, side by side on desktop */}
          {avatar1 && avatar2 && (
            <div className="relative flex flex-col sm:flex-row items-center justify-around px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5 bg-[#0d0d14] gap-4 sm:gap-0">
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              <AvatarPodium
                avatar={avatar1}
                position="left"
                isActive={streamingAvatarId === avatar1.id}
                isStreaming={streamingAvatarId === avatar1.id}
                status={
                  streamingAvatarId === avatar1.id
                    ? "speaking"
                    : streamingAvatarId === avatar2.id
                    ? "preparing" // Avatar 1 is "thinking" while Avatar 2 speaks
                    : isLoading && currentDebate.currentTurn % 2 === 1
                    ? "preparing"
                    : "waiting"
                }
                turnCount={avatar1TurnCount}
              />

              <div className="relative flex flex-col items-center">
                <motion.span
                  className="text-2xl sm:text-3xl font-bold text-gray-700 font-mono tracking-widest"
                  animate={streamingAvatarId ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  VS
                </motion.span>
                <span className="text-[10px] text-gray-600 font-mono tracking-wider mt-1">
                  {streamingAvatarId ? "LIVE" : "DEBATE"}
                </span>
              </div>

              <AvatarPodium
                avatar={avatar2}
                position="right"
                isActive={streamingAvatarId === avatar2.id}
                isStreaming={streamingAvatarId === avatar2.id}
                status={
                  streamingAvatarId === avatar2.id
                    ? "speaking"
                    : streamingAvatarId === avatar1.id
                    ? "preparing" // Avatar 2 is "thinking" while Avatar 1 speaks
                    : isLoading && currentDebate.currentTurn % 2 === 0
                    ? "preparing"
                    : "waiting"
                }
                turnCount={avatar2TurnCount}
              />
            </div>
          )}

          {/* Timeline */}
          {avatar1 && avatar2 && (
            <div className="px-4 py-2 border-b border-white/5 bg-[#0a0a0f]">
              <Timeline
                totalTurns={currentDebate.maxTurns}
                currentTurn={currentDebate.currentTurn}
                avatar1={avatar1}
                avatar2={avatar2}
                turnMeta={turnMeta}
              />
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-[#0a0a0f]">
            <AnimatePresence>
              {messages.map((msg, idx) => {
                if (msg.role !== "avatar") {
                  // User injection
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                    >
                      <p className="text-[10px] font-mono tracking-wider text-amber-400 mb-1">USER INJECTION</p>
                      <p className="text-sm text-gray-200">{msg.content}</p>
                    </motion.div>
                  );
                }

                const isAvatar1 = msg.avatarId === avatar1?.id;
                const avatar = isAvatar1 ? avatar1 : avatar2;
                if (!avatar) return null;

                const turnNumber = idx + 1;
                const meta = turnMeta.find(m => m.turnNumber === turnNumber);

                return (
                  <TurnCard
                    key={msg.id}
                    message={msg}
                    avatar={avatar}
                    turnNumber={turnNumber}
                    stance={meta?.stance}
                    targetClaim={meta?.targetClaim}
                    onCopy={() => navigator.clipboard.writeText(msg.content)}
                  />
                );
              })}

              {/* Streaming turn */}
              {streamingAvatarId && avatar1 && avatar2 && (
                <TurnCard
                  message={{
                    id: "streaming",
                    sessionId: "",
                    role: "avatar",
                    avatarId: streamingAvatarId,
                    content: "",
                    tokensUsed: null,
                    createdAt: new Date().toISOString(),
                  }}
                  avatar={streamingAvatarId === avatar1.id ? avatar1 : avatar2}
                  turnNumber={messages.filter(m => m.role === "avatar").length + 1}
                  isStreaming
                  streamingContent={streamingContent}
                />
              )}

              {/* Thinking Bubbles - Show when one avatar speaks, the other thinks */}
              {avatar1 && avatar2 && (
                <>
                  {/* Avatar 1 thinking while Avatar 2 speaks */}
                  {streamingAvatarId === avatar2.id && thinkingState.avatar1.isThinking && (
                    <ThinkingBubble
                      avatar={avatar1}
                      thinkingState={thinkingState.avatar1}
                      position="left"
                    />
                  )}

                  {/* Avatar 2 thinking while Avatar 1 speaks */}
                  {streamingAvatarId === avatar1.id && thinkingState.avatar2.isThinking && (
                    <ThinkingBubble
                      avatar={avatar2}
                      thinkingState={thinkingState.avatar2}
                      position="right"
                    />
                  )}

                  {/* Show thinking when not streaming but thinking is active */}
                  {!streamingAvatarId && thinkingState.avatar1.isThinking && (
                    <ThinkingBubble
                      avatar={avatar1}
                      thinkingState={thinkingState.avatar1}
                      position="left"
                    />
                  )}
                  {!streamingAvatarId && thinkingState.avatar2.isThinking && (
                    <ThinkingBubble
                      avatar={avatar2}
                      thinkingState={thinkingState.avatar2}
                      position="right"
                    />
                  )}
                </>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Controls - Responsive layout */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 bg-[#12121a]/80 backdrop-blur-xl">
            <div className="flex gap-2 justify-center sm:justify-start">
              {isDebatePaused ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeDebate}
                  disabled={!isConnected}
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <Play className="w-3 h-3" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseDebate}
                  disabled={!isDebateActive || !isConnected}
                  className="gap-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  <Pause className="w-3 h-3" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInject(true)}
                disabled={(!isDebateActive && !isDebatePaused) || !isConnected}
                className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              >
                <MessageSquareIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Inject Query</span>
                <span className="sm:hidden">Ask</span>
              </Button>
            </div>

            <div className="flex gap-2 justify-center sm:justify-end">
              <Button variant="ghost" size="sm" disabled className="gap-1 hidden sm:flex text-gray-600">
                <Plus className="w-3 h-3" />
                Add Advisor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={interruptDebate}
                disabled={!isDebateActive || !isConnected}
                className="gap-1 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Square className="w-3 h-3" />
                <span className="hidden sm:inline">Terminate & Summarize</span>
                <span className="sm:hidden">End</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Points Sidebar - Hidden on mobile */}
        {avatar1 && avatar2 && (
          <div className="hidden lg:block">
            <KeyPointsSidebar
              avatar1={avatar1}
              avatar2={avatar2}
              keyPoints={keyPoints}
              isExpanded={showKeyPoints}
              onToggle={() => setShowKeyPoints(!showKeyPoints)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <InjectQuestionModal
        open={showInject}
        onOpenChange={setShowInject}
        onSubmit={injectQuestion}
      />
    </div>
  );
}

export default DebateView;
