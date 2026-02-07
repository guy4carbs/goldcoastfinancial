import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Square,
  Pause,
  Play,
  MessageSquare,
  User,
  X,
  FileDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  useCurrentDebate,
  useDebateTurnMeta,
  DEBATE_FORMATS,
  type Avatar,
  type AvatarMessage,
  type DebateStance,
  type DebateFormat,
} from "@/lib/avatarCouncilStore";
import ReactMarkdown from "react-markdown";

// =============================================================================
// Types & Constants
// =============================================================================

interface DebateChamberProps {
  className?: string;
  onBackToLobby: () => void;
  onChat1on1?: (avatarId: string) => void;
}

// Signature colors per avatar (light theme)
const avatarSignatures: Record<string, {
  primary: string;
  text: string;
  bg: string;
  glow: string;
  border: string;
}> = {
  "insurance-expert": { primary: "#0891B2", text: "text-cyan-600", bg: "bg-cyan-50", glow: "shadow-cyan-400/20", border: "border-cyan-200" },
  "sales-closer": { primary: "#D97706", text: "text-amber-600", bg: "bg-amber-50", glow: "shadow-amber-400/20", border: "border-amber-200" },
  "mindset-coach": { primary: "#7C3AED", text: "text-violet-600", bg: "bg-violet-50", glow: "shadow-violet-400/20", border: "border-violet-200" },
  "compliance-specialist": { primary: "#059669", text: "text-emerald-600", bg: "bg-emerald-50", glow: "shadow-emerald-400/20", border: "border-emerald-200" },
  "wolf-closer": { primary: "#DC2626", text: "text-red-600", bg: "bg-red-50", glow: "shadow-red-400/20", border: "border-red-200" },
  "objection-handler": { primary: "#EA580C", text: "text-orange-600", bg: "bg-orange-50", glow: "shadow-orange-400/20", border: "border-orange-200" },
  "intensity-coach": { primary: "#F59E0B", text: "text-amber-600", bg: "bg-amber-50", glow: "shadow-amber-400/20", border: "border-amber-200" },
  "elizur-wright": { primary: "#6366F1", text: "text-indigo-600", bg: "bg-indigo-50", glow: "shadow-indigo-400/20", border: "border-indigo-200" },
};

const getSignature = (slug: string) => avatarSignatures[slug] || avatarSignatures["insurance-expert"];

// Stance to glyph mapping (light theme)
const stanceGlyph: Record<DebateStance, { icon: string; color: string; label: string }> = {
  agrees: { icon: "✓", color: "text-emerald-600", label: "AGREES" },
  partially_agrees: { icon: "○", color: "text-amber-600", label: "PARTIAL" },
  disagrees: { icon: "✗", color: "text-red-600", label: "DISAGREES" },
  rebuts: { icon: "↩", color: "text-violet-600", label: "REBUTS" },
  new_angle: { icon: "↗", color: "text-cyan-600", label: "NEW ANGLE" },
  synthesizes: { icon: "⊕", color: "text-yellow-600", label: "SYNTHESIZES" },
};

// =============================================================================
// Sub-Components
// =============================================================================

// Avatar Portrait - The visual presence of an avatar in the chamber
interface AvatarPresenceProps {
  avatar: Avatar;
  position: "left" | "right";
  isActive: boolean;
  isStreaming: boolean;
  reducedMotion: boolean;
}

function AvatarPresence({ avatar, position, isActive, isStreaming, reducedMotion }: AvatarPresenceProps) {
  const sig = getSignature(avatar.slug);

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        opacity: isActive ? 1 : 0.6,
        filter: isActive ? "saturate(1)" : "saturate(0.6)",
      }}
      transition={{ duration: reducedMotion ? 0 : 0.5 }}
    >
      {/* Portrait container */}
      <div className="relative">
        {/* Glow effect for active speaker */}
        {isActive && (
          <motion.div
            className="absolute -inset-3 rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at center, ${sig.primary}15 0%, transparent 70%)`,
            }}
            animate={!reducedMotion ? { opacity: [0.5, 0.8, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Portrait */}
        <motion.div
          className={cn(
            "relative w-28 h-36 rounded-xl overflow-hidden border-2 transition-all shadow-sm",
            isActive ? sig.border : "border-gray-200"
          )}
          animate={isActive && isStreaming && !reducedMotion ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {avatar.avatarImageUrl ? (
            <img
              src={avatar.avatarImageUrl}
              alt={avatar.name}
              className="w-full h-full object-cover object-[center_20%]"
            />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center bg-gray-100", sig.bg)}>
              <User className={cn("w-12 h-12 opacity-50", sig.text)} />
            </div>
          )}

          {/* Accent line at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: sig.primary }}
            animate={{ opacity: isActive ? 1 : 0.4 }}
          />
        </motion.div>
      </div>

      {/* Name and status */}
      <div className="mt-4 text-center">
        <h3 className={cn(
          "text-sm font-semibold tracking-wide transition-colors",
          isActive ? "text-gray-900" : "text-gray-500"
        )}>
          {avatar.name}
        </h3>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <motion.span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isActive ? (isStreaming ? "bg-emerald-500" : "bg-amber-500") : "bg-gray-300"
            )}
            animate={isActive && isStreaming && !reducedMotion ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span className={cn(
            "text-[10px] font-semibold tracking-widest uppercase",
            isActive ? (isStreaming ? "text-emerald-600" : "text-amber-600") : "text-gray-400"
          )}>
            {isActive ? (isStreaming ? "SPEAKING" : "PREPARING") : "STANDBY"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Tension Line - Visual indicator between avatars showing stance
interface TensionLineProps {
  stance?: DebateStance;
  isActive: boolean;
}

function TensionLine({ stance, isActive }: TensionLineProps) {
  const stanceInfo = stance ? stanceGlyph[stance] : null;
  const isDisagreement = stance === "disagrees" || stance === "rebuts";

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      {/* Top line segment */}
      <motion.div
        className="w-px flex-1"
        style={{
          background: isDisagreement && isActive
            ? "linear-gradient(to bottom, transparent, #DC2626, #DC2626)"
            : "linear-gradient(to bottom, transparent, rgba(156,163,175,0.3), rgba(156,163,175,0.3))"
        }}
        animate={isDisagreement && isActive ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Stance indicator */}
      {stanceInfo && isActive && (
        <motion.div
          className="my-4 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className={cn("text-2xl", stanceInfo.color)}>
            {stanceInfo.icon}
          </span>
          <span className={cn("text-[9px] font-mono tracking-wider mt-1", stanceInfo.color)}>
            {stanceInfo.label}
          </span>
        </motion.div>
      )}

      {/* Bottom line segment */}
      <motion.div
        className="w-px flex-1"
        style={{
          background: isDisagreement && isActive
            ? "linear-gradient(to top, transparent, #DC2626, #DC2626)"
            : "linear-gradient(to top, transparent, rgba(156,163,175,0.3), rgba(156,163,175,0.3))"
        }}
        animate={isDisagreement && isActive ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

// Statement Display - The current turn's content
interface StatementDisplayProps {
  content: string;
  isStreaming: boolean;
  avatar: Avatar;
  turnNumber: number;
  totalTurns: number;
}

function StatementDisplay({ content, isStreaming, avatar, turnNumber, totalTurns }: StatementDisplayProps) {
  const sig = getSignature(avatar.slug);
  const roundNumber = Math.ceil(turnNumber / 2);
  const totalRounds = Math.ceil(totalTurns / 2);

  return (
    <div className="relative flex-1 flex flex-col bg-[#fffaf3]">
      {/* Header bar with speaker info */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: sig.primary }}
          />
          <span className="text-sm font-semibold text-gray-700">{avatar.name}</span>
          <span className="text-xs font-medium text-gray-400">
            Round {roundNumber} of {totalRounds}
          </span>
        </div>
        {isStreaming && (
          <motion.span
            className="text-[10px] font-semibold tracking-wider text-emerald-600"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            STREAMING
          </motion.span>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-gray-700 text-lg leading-relaxed mb-4 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-600">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-violet-300 pl-4 italic text-gray-500">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              className="inline-block w-0.5 h-5 ml-1 bg-violet-500 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Turn Navigator - Navigate between turns
interface TurnNavigatorProps {
  currentViewTurn: number;
  totalCompletedTurns: number;
  maxTurns: number;
  onNavigate: (turn: number) => void;
  avatar1: Avatar;
  avatar2: Avatar;
  isLive: boolean;
}

function TurnNavigator({
  currentViewTurn,
  totalCompletedTurns,
  maxTurns,
  onNavigate,
  avatar1,
  avatar2,
  isLive,
}: TurnNavigatorProps) {
  const sig1 = getSignature(avatar1.slug);
  const sig2 = getSignature(avatar2.slug);

  const canGoPrev = currentViewTurn > 1;
  const canGoNext = currentViewTurn < totalCompletedTurns || isLive;

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-200 bg-white">
      {/* Previous button */}
      <button
        onClick={() => canGoPrev && onNavigate(currentViewTurn - 1)}
        disabled={!canGoPrev}
        className={cn(
          "p-2 rounded-lg transition-colors",
          canGoPrev ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Turn dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: maxTurns }, (_, i) => {
          const turnNum = i + 1;
          const isAvatar1 = turnNum % 2 === 1;
          const isCompleted = turnNum <= totalCompletedTurns;
          const isCurrent = turnNum === currentViewTurn;
          const sig = isAvatar1 ? sig1 : sig2;

          return (
            <button
              key={i}
              onClick={() => isCompleted && onNavigate(turnNum)}
              disabled={!isCompleted}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                isCompleted && !isCurrent && "hover:scale-125"
              )}
              style={{
                backgroundColor: isCompleted ? sig.primary : "rgba(156,163,175,0.3)",
                opacity: isCurrent ? 1 : isCompleted ? 0.6 : 0.3,
                transform: isCurrent ? "scale(1.5)" : "scale(1)",
              }}
            />
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => canGoNext && onNavigate(Math.min(currentViewTurn + 1, totalCompletedTurns + (isLive ? 1 : 0)))}
        disabled={!canGoNext}
        className={cn(
          "p-2 rounded-lg transition-colors",
          canGoNext ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Live indicator */}
      {isLive && (
        <motion.div
          className="flex items-center gap-1.5 ml-4 px-2 py-1 rounded bg-emerald-50 border border-emerald-200"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-semibold tracking-wider text-emerald-600">LIVE</span>
        </motion.div>
      )}
    </div>
  );
}

// Setup Modal - Configure debate before starting
interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatars: Avatar[];
  selectedAvatars: Avatar[];
  onStart: (topic: string, format: DebateFormat) => void;
}

function SetupModal({ open, onOpenChange, avatars, selectedAvatars, onStart }: SetupModalProps) {
  const [topic, setTopic] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(DEBATE_FORMATS[1]);

  const canStart = selectedAvatars.length >= 2 && topic.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart(topic.trim(), selectedFormat);
    setTopic("");
    onOpenChange(false);
  };

  const sig1 = selectedAvatars[0] ? getSignature(selectedAvatars[0].slug) : null;
  const sig2 = selectedAvatars[1] ? getSignature(selectedAvatars[1].slug) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            Initialize Debate
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Set the topic and format for the executive debate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatars display */}
          <div className="flex items-center justify-center gap-4">
            {selectedAvatars.map((avatar, idx) => {
              const sig = getSignature(avatar.slug);
              return (
                <div key={avatar.id} className="flex items-center">
                  {/* VS separator between avatars */}
                  {idx > 0 && (
                    <span className="text-gray-400 font-mono text-sm mx-3">VS</span>
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-16 h-20 rounded-lg overflow-hidden border-2",
                        sig.bg
                      )}
                      style={{ borderColor: sig.primary + "40" }}
                    >
                      {avatar.avatarImageUrl ? (
                        <img src={avatar.avatarImageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <User className={cn("w-8 h-8", sig.text)} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium mt-2 text-gray-700">{avatar.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Topic</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What strategic question should they debate?"
              className="resize-none bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-violet-300 focus:ring-violet-100"
              rows={2}
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {DEBATE_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    selectedFormat.id === format.id
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="text-sm font-medium text-gray-800">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.roundsPerAvatar} rounds</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            Begin Debate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline Setup - Full-page setup form (more reliable than modal)
interface InlineSetupProps {
  selectedAvatars: Avatar[];
  onStart: (topic: string, format: DebateFormat) => void;
  onBack: () => void;
}

function InlineSetup({ selectedAvatars, onStart, onBack }: InlineSetupProps) {
  const [topic, setTopic] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(DEBATE_FORMATS[1]);

  const canStart = selectedAvatars.length >= 2 && topic.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart(topic.trim(), selectedFormat);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[10px] font-semibold tracking-widest text-gray-400 mb-2">
            EXECUTIVE DEBATE CHAMBER
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Configure Debate
          </h2>
        </div>

        {/* Avatars display - horizontal row */}
        <div className="flex items-center justify-center gap-6 mb-10">
          {selectedAvatars.map((avatar, idx) => {
            const sig = getSignature(avatar.slug);
            return (
              <div key={avatar.id} className="flex items-center">
                {idx > 0 && (
                  <span className="text-gray-400 font-mono text-2xl font-bold mx-6 lg:mx-8">VS</span>
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-32 h-44 lg:w-40 lg:h-52 rounded-2xl overflow-hidden shadow-xl",
                      sig.bg
                    )}
                    style={{ borderColor: sig.primary + "70", borderWidth: '4px', borderStyle: 'solid' }}
                  >
                    {avatar.avatarImageUrl ? (
                      <img src={avatar.avatarImageUrl} alt={avatar.name} className="w-full h-full object-cover object-[center_20%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className={cn("w-16 h-16", sig.text)} />
                      </div>
                    )}
                  </div>
                  <span className="text-base lg:text-lg font-semibold mt-4 text-gray-800">{avatar.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Setup form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {/* Topic */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-700">Debate Topic</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What strategic question should they debate?"
              className="resize-none bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-violet-300 focus:ring-violet-100"
              rows={3}
              autoFocus
            />
          </div>

          {/* Format */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-700">Debate Format</label>
            <div className="grid grid-cols-3 gap-3">
              {DEBATE_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    selectedFormat.id === format.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="text-sm font-semibold text-gray-800">{format.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{format.roundsPerAvatar} rounds each</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="flex-1 bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
            >
              Begin Debate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inject Question Modal
interface InjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (question: string) => void;
}

function InjectModal({ open, onOpenChange, onSubmit }: InjectModalProps) {
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
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Interject</DialogTitle>
          <DialogDescription className="text-gray-500">
            Both advisors will address your question.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Your question..."
            rows={3}
            className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-violet-300 focus:ring-violet-100"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim()}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Summary Screen - Shown when debate is complete
interface SummaryScreenProps {
  debateId: string;
  topic: string;
  participants: Avatar[];
  messages: AvatarMessage[];
  onNewDebate: () => void;
  onBackToLobby: () => void;
}

function SummaryScreen({
  debateId,
  topic,
  participants,
  messages,
  onNewDebate,
  onBackToLobby,
}: SummaryScreenProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Calculate turns for each participant
  const participantStats = participants.map(avatar => ({
    avatar,
    signature: getSignature(avatar.slug),
    turns: messages.filter(m => m.avatarId === avatar.id).length,
  }));

  const totalTurns = participantStats.reduce((sum, p) => sum + p.turns, 0);

  const handleDownloadManuscript = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(`/api/avatar-council/debates/${debateId}/manuscript?metrics=true`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate manuscript");
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `debate-manuscript-${debateId}.pdf`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download manuscript:", error);
      setDownloadError(error.message || "Failed to download manuscript");
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine grid columns based on participant count
  const gridCols = participants.length === 2
    ? "grid-cols-2"
    : participants.length === 3
    ? "grid-cols-3"
    : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className="h-full flex flex-col bg-[#fffaf3]">
      {/* Header */}
      <div className="text-center py-8 border-b border-gray-200 bg-white">
        <div className="text-[10px] font-semibold tracking-widest text-gray-400 mb-2">
          DEBATE CONCLUDED
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">"{topic}"</h2>
        <p className="text-sm text-gray-500">
          {totalTurns} turns · {participants.length} participants
        </p>
      </div>

      {/* Summary content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Download Manuscript Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <FileDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Download Official Manuscript
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a professional PDF document with the complete debate transcript,
                  position analysis, and final verdict.
                </p>
                {downloadError && (
                  <p className="text-sm text-red-600 mb-3">{downloadError}</p>
                )}
                <Button
                  onClick={handleDownloadManuscript}
                  disabled={isDownloading}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:brightness-110 border-0"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Manuscript
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Participants Summary - Dynamic grid */}
          <div className={`grid ${gridCols} gap-4`}>
            {participantStats.map(({ avatar, signature, turns }, index) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3 p-4 bg-white rounded-lg border border-gray-200"
              >
                {/* Avatar image */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden border-2"
                    style={{ borderColor: signature.primary }}
                  >
                    {avatar.avatarImageUrl ? (
                      <img
                        src={avatar.avatarImageUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${signature.bg}`}>
                        <User className={`w-5 h-5 ${signature.text}`} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 block truncate">{avatar.name}</span>
                    <span className="text-xs text-gray-500">{turns} turns</span>
                  </div>
                </div>

                {/* Progress bar showing contribution */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalTurns > 0 ? (turns / totalTurns) * 100 : 0}%`,
                      backgroundColor: signature.primary
                    }}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  {totalTurns > 0 ? Math.round((turns / totalTurns) * 100) : 0}% of debate
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-white">
        <Button
          variant="ghost"
          onClick={onBackToLobby}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
        <Button
          onClick={onNewDebate}
          className="bg-violet-500 text-white hover:bg-violet-600"
        >
          New Debate
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DebateChamber({ className, onBackToLobby, onChat1on1 }: DebateChamberProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [showSetup, setShowSetup] = useState(true);
  const [showInject, setShowInject] = useState(false);
  const [viewingTurn, setViewingTurn] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Store state
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore((state) => state.selectedAvatarIds);
  const connectionStatus = useAvatarCouncilStore((state) => state.connectionStatus);

  // Actions
  const startDebate = useAvatarCouncilStore((state) => state.startDebate);
  const pauseDebate = useAvatarCouncilStore((state) => state.pauseDebate);
  const resumeDebate = useAvatarCouncilStore((state) => state.resumeDebate);
  const interruptDebate = useAvatarCouncilStore((state) => state.interruptDebate);
  const injectQuestion = useAvatarCouncilStore((state) => state.injectQuestion);
  const clearDebateState = useAvatarCouncilStore((state) => state.clearDebateState);

  // Debate state
  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();
  const currentDebate = useCurrentDebate();
  const turnMeta = useDebateTurnMeta();

  // Computed
  const selectedAvatars = useMemo(
    () => avatars.filter(a => selectedAvatarIds.includes(a.id)),
    [avatars, selectedAvatarIds]
  );

  const avatar1 = avatars.find(a => a.id === currentDebate?.avatar1Id);
  const avatar2 = avatars.find(a => a.id === currentDebate?.avatar2Id);

  const isConnected = connectionStatus === "connected";
  const isDebateActive = currentDebate?.status === "active";
  const isDebatePaused = currentDebate?.status === "paused";
  const isDebateComplete = currentDebate?.status === "completed" || currentDebate?.status === "interrupted";

  const completedTurns = messages.filter(m => m.role === "avatar").length;
  const isStreaming = !!streamingAvatarId;

  // Current turn being viewed (defaults to latest)
  const currentTurnIndex = viewingTurn !== null ? viewingTurn - 1 : completedTurns - 1 + (isStreaming ? 1 : 0);
  const isViewingLive = viewingTurn === null || viewingTurn > completedTurns;

  // Get current turn data
  const avatarMessages = messages.filter(m => m.role === "avatar");
  const currentMessage = isViewingLive && isStreaming
    ? null // We'll show streaming content
    : avatarMessages[currentTurnIndex];

  // Get debate participants - use participantIds if available, otherwise use selectedAvatars
  const debateParticipants = useMemo(() => {
    if (currentDebate?.participantIds?.length) {
      return avatars.filter(a => currentDebate.participantIds!.includes(a.id));
    }
    return selectedAvatars;
  }, [avatars, currentDebate?.participantIds, selectedAvatars]);

  // Find the currently speaking avatar from ALL debate participants (not just avatar1/avatar2)
  const currentSpeakingAvatar = isViewingLive && isStreaming
    ? debateParticipants.find(a => a.id === streamingAvatarId) || null
    : currentMessage
    ? debateParticipants.find(a => a.id === currentMessage.avatarId) || null
    : null;

  const currentContent = isViewingLive && isStreaming
    ? streamingContent || ""
    : currentMessage?.content || "";

  const currentTurnMeta = turnMeta.find(m => m.turnNumber === currentTurnIndex + 1);

  // Auto-follow live updates
  useEffect(() => {
    if (isStreaming) {
      setViewingTurn(null); // Reset to live view
    }
  }, [isStreaming, completedTurns]);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [avatarMessages.length, streamingContent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentTurnIndex > 0) {
        setViewingTurn(currentTurnIndex); // Go to previous
      } else if (e.key === "ArrowRight" && (currentTurnIndex < completedTurns - 1 || isStreaming)) {
        setViewingTurn(currentTurnIndex + 2 > completedTurns ? null : currentTurnIndex + 2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTurnIndex, completedTurns, isStreaming]);

  // Handlers
  const handleStartDebate = (topic: string, format: DebateFormat) => {
    if (selectedAvatars.length < 2) return;
    // Pass all selected avatars (2-4) for multi-avatar debates
    const avatarIds = selectedAvatars.map(a => a.id);
    startDebate(topic, avatarIds, undefined, {
      maxTurns: format.totalTurns * (selectedAvatars.length / 2), // Scale turns by participant count
    });
  };

  const handleNewDebate = () => {
    clearDebateState();
    setShowSetup(true);
    setViewingTurn(null);
  };

  const handleNavigate = (turn: number) => {
    if (turn > completedTurns) {
      setViewingTurn(null); // Go to live
    } else {
      setViewingTurn(turn);
    }
  };

  // No debate - show inline setup
  if (!currentDebate) {
    return (
      <div className={cn("h-full flex flex-col bg-[#fffaf3]", className)}>
        {/* Header with back button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Council</span>
          </button>
          <div className="text-[10px] font-semibold tracking-widest text-gray-400">
            DEBATE CHAMBER
          </div>
        </div>

        {selectedAvatars.length >= 2 ? (
          <InlineSetup
            selectedAvatars={selectedAvatars}
            onStart={handleStartDebate}
            onBack={onBackToLobby}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[10px] font-semibold tracking-widest text-gray-400 mb-4">
                EXECUTIVE DEBATE CHAMBER
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select Two Advisors
              </h2>
              <p className="text-gray-500 mb-8">
                {selectedAvatars.length}/2 selected
              </p>
              <Button
                onClick={onBackToLobby}
                variant="outline"
                className="border-gray-200"
              >
                Go Back & Select Avatars
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Debate complete - show summary
  if (isDebateComplete && debateParticipants.length >= 2) {
    return (
      <SummaryScreen
        debateId={currentDebate.id}
        topic={currentDebate.topic}
        participants={debateParticipants}
        messages={messages}
        onNewDebate={handleNewDebate}
        onBackToLobby={() => { clearDebateState(); onBackToLobby(); }}
      />
    );
  }

  // Active debate - Executive Boardroom Layout
  // Use the debate participants (already calculated above, limited to 4)
  const debateAvatars = debateParticipants.slice(0, 4);
  if (debateAvatars.length < 2) return null;

  const activeAvatarId = currentSpeakingAvatar?.id;

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", className)}>
      {/* Dark executive room background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header controls - minimal */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2">
        <button
          onClick={() => { clearDebateState(); onBackToLobby(); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Exit</span>
        </button>

        <div className="flex items-center gap-1">
          {isDebatePaused ? (
            <Button variant="ghost" size="sm" onClick={resumeDebate} disabled={!isConnected}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 h-8 px-2">
              <Play className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={pauseDebate} disabled={!isDebateActive || !isConnected}
              className="text-slate-400 hover:text-white hover:bg-white/10 h-8 px-2">
              <Pause className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowInject(true)}
            disabled={(!isDebateActive && !isDebatePaused) || !isConnected}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-8 px-2">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={interruptDebate} disabled={!isDebateActive || !isConnected}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 px-2">
            <Square className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main layout - TV at top, Table with avatars, Conversation below */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden px-4 pb-4">

        {/* TV Screen - compact */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="bg-slate-950 rounded-lg p-1 shadow-2xl">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-md px-6 py-3">
                <div className="bg-slate-950 rounded border border-slate-700 px-4 py-3">
                  <div className="text-[9px] font-mono text-slate-500 tracking-widest mb-1">TOPIC</div>
                  <p className="text-white text-sm font-medium leading-snug max-w-md">
                    "{currentDebate.topic}"
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-16 h-2 bg-slate-800 rounded-b-lg" />
              </div>
            </div>
            <div className="absolute -inset-3 bg-blue-500/10 rounded-xl blur-lg -z-10" />
          </div>
        </div>

        {/* Table with Avatars */}
        <div className="relative flex justify-center mb-4">
          {/* Table surface */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[80%] max-w-2xl h-16 bg-gradient-to-b from-amber-950/50 to-amber-950/20 rounded-[100%] border border-amber-900/30" />

          {/* Avatars */}
          <div className="relative flex items-center justify-center gap-8 py-4">
            {debateAvatars.map((avatar, idx) => {
              const sig = getSignature(avatar.slug);
              const isActive = activeAvatarId === avatar.id;
              const isCurrentStreaming = isActive && isStreaming && isViewingLive;

              return (
                <div key={avatar.id} className="flex items-center">
                  {idx > 0 && (
                    <span className="text-slate-500 font-mono text-sm font-bold mx-4">VS</span>
                  )}
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -4 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  >
                    <div className="relative">
                      {isActive && (
                        <motion.div
                          className="absolute -inset-3 rounded-xl"
                          style={{ backgroundColor: sig.primary + "25" }}
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div
                        className={cn(
                          "relative w-20 h-24 rounded-xl overflow-hidden transition-all duration-300 border-2",
                          isActive ? "shadow-lg" : "opacity-50 border-transparent"
                        )}
                        style={{
                          borderColor: isActive ? sig.primary : 'transparent',
                          boxShadow: isActive ? `0 0 25px ${sig.primary}50` : 'none',
                        }}
                      >
                        {avatar.avatarImageUrl ? (
                          <img src={avatar.avatarImageUrl} alt={avatar.name}
                            className="w-full h-full object-cover object-[center_20%]" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center", sig.bg)}>
                            <User className={cn("w-10 h-10", sig.text)} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "mt-2 text-xs font-medium",
                      isActive ? "text-white" : "text-slate-500"
                    )}>{avatar.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <motion.span
                        className={cn("w-1.5 h-1.5 rounded-full",
                          isActive ? isCurrentStreaming ? "bg-emerald-400" : "bg-amber-400" : "bg-slate-600"
                        )}
                        animate={isCurrentStreaming ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <span className={cn("text-[9px] font-mono",
                        isActive ? isCurrentStreaming ? "text-emerald-400" : "text-amber-400" : "text-slate-600"
                      )}>
                        {isActive ? (isCurrentStreaming ? "SPEAKING" : "THINKING") : "STANDBY"}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Area - scrolling chat bubbles */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
            <div className="text-slate-400 text-xs font-mono">
              DEBATE TRANSCRIPT
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">
                {avatarMessages.length} / {currentDebate.maxTurns} turns
              </span>
              {isStreaming && (
                <motion.div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </motion.div>
              )}
            </div>
          </div>

          {/* Scrolling messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {avatarMessages.length === 0 && !isStreaming ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-3"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <p className="text-slate-400 text-sm">Awaiting first statement...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Completed messages */}
                {avatarMessages.map((msg, idx) => {
                  // Find the avatar who sent this message from all debate participants
                  const avatar = debateAvatars.find(a => a.id === msg.avatarId) || avatar1 || avatar2;
                  const avatarIndex = debateAvatars.findIndex(a => a.id === msg.avatarId);
                  const isLeftSide = avatarIndex % 2 === 0; // Alternate sides for visual clarity
                  const sig = avatar ? getSignature(avatar.slug) : { primary: "#6b7280", bg: "bg-gray-500/10" };

                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3 }}
                      className={cn(
                        "flex gap-3",
                        isLeftSide ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      {/* Avatar thumbnail */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2"
                        style={{ borderColor: sig.primary }}
                      >
                        {avatar?.avatarImageUrl ? (
                          <img src={avatar.avatarImageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-700">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={cn("flex-1 max-w-[80%]", isLeftSide ? "" : "")}>
                        {/* Name and turn */}
                        <div className={cn(
                          "flex items-center gap-2 mb-1",
                          isLeftSide ? "" : "justify-end"
                        )}>
                          <span className="text-white text-sm font-medium">{avatar?.name}</span>
                          <span className="text-slate-500 text-xs">Turn {idx + 1}</span>
                        </div>

                        {/* Content bubble */}
                        <div
                          className={cn(
                            "rounded-xl px-4 py-3 text-slate-100 text-sm leading-relaxed",
                            isLeftSide
                              ? "bg-slate-700/70 rounded-tl-sm"
                              : "bg-slate-600/70 rounded-tr-sm"
                          )}
                          style={{
                            borderLeft: isLeftSide ? `3px solid ${sig.primary}` : 'none',
                            borderRight: !isLeftSide ? `3px solid ${sig.primary}` : 'none',
                          }}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Currently streaming message */}
                {isStreaming && streamingContent && (() => {
                  // Find streaming avatar from all participants
                  const streamingAvatar = debateAvatars.find(a => a.id === streamingAvatarId) || avatar1 || avatar2;
                  const streamingAvatarIndex = debateAvatars.findIndex(a => a.id === streamingAvatarId);
                  const isLeftSide = streamingAvatarIndex % 2 === 0;
                  const sig = streamingAvatar ? getSignature(streamingAvatar.slug) : { primary: "#6b7280" };

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        isLeftSide ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      {/* Avatar thumbnail */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2"
                        style={{ borderColor: sig.primary }}
                      >
                        {streamingAvatar?.avatarImageUrl ? (
                          <img
                            src={streamingAvatar.avatarImageUrl || ""}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-700">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={cn("flex-1 max-w-[80%]")}>
                        {/* Name and live indicator */}
                        <div className={cn(
                          "flex items-center gap-2 mb-1",
                          isLeftSide ? "" : "justify-end"
                        )}>
                          <span className="text-white text-sm font-medium">
                            {streamingAvatar?.name}
                          </span>
                          <motion.span
                            className="text-emerald-400 text-xs flex items-center gap-1"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Speaking...
                          </motion.span>
                        </div>

                        {/* Content bubble with cursor */}
                        <div
                          className={cn(
                            "rounded-xl px-4 py-3 text-slate-100 text-sm leading-relaxed",
                            isLeftSide
                              ? "bg-slate-700/70 rounded-tl-sm"
                              : "bg-slate-600/70 rounded-tr-sm"
                          )}
                          style={{
                            borderLeft: isLeftSide ? `3px solid ${sig.primary}` : 'none',
                            borderRight: !isLeftSide ? `3px solid ${sig.primary}` : 'none',
                          }}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            }}
                          >
                            {streamingContent}
                          </ReactMarkdown>
                          <motion.span
                            className="inline-block w-2 h-4 bg-white/60 ml-1 align-middle"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <InjectModal
        open={showInject}
        onOpenChange={setShowInject}
        onSubmit={injectQuestion}
      />
    </div>
  );
}

export default DebateChamber;
