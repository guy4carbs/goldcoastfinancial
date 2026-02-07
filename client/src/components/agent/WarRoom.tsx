import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Mic,
  Settings,
  BarChart3,
  Copy,
  Bookmark,
  RefreshCw,
  MessageSquare,
  Target,
  Handshake,
  Search,
  Plus,
  Command,
  Brain,
  Shield,
  Flame,
  Heart,
  User,
  Clock,
  Hash,
  Coins,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  useConnectionStatus,
  useConnectionState,
  type Avatar,
  type AvatarMessage,
} from "@/lib/avatarCouncilStore";
import ReactMarkdown from "react-markdown";
import { ConnectionBanner } from "./ConnectionBadge";

// =============================================================================
// Constants & Icons
// =============================================================================

const avatarIcons: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
};

// Elite dark interface: Signature colors per avatar
const avatarColors: Record<string, { bg: string; icon: string; accent: string; glow: string }> = {
  "insurance-expert": {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400",
    accent: "#22d3ee",
    glow: "shadow-cyan-500/30",
  },
  "sales-closer": {
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    accent: "#f59e0b",
    glow: "shadow-amber-500/30",
  },
  "mindset-coach": {
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    accent: "#a855f7",
    glow: "shadow-violet-500/30",
  },
  "compliance-specialist": {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    accent: "#10b981",
    glow: "shadow-emerald-500/30",
  },
  "wolf-closer": {
    bg: "bg-red-500/10",
    icon: "text-red-400",
    accent: "#ef4444",
    glow: "shadow-red-500/30",
  },
  "objection-handler": {
    bg: "bg-orange-500/10",
    icon: "text-orange-400",
    accent: "#f97316",
    glow: "shadow-orange-500/30",
  },
};

const expertiseRatings: Record<string, { domain: string; stars: number }[]> = {
  "insurance-expert": [
    { domain: "Policies & Products", stars: 5 },
    { domain: "Underwriting", stars: 5 },
    { domain: "Compliance", stars: 4 },
  ],
  "sales-closer": [
    { domain: "Closing Techniques", stars: 5 },
    { domain: "Objection Handling", stars: 5 },
    { domain: "Presentation", stars: 4 },
  ],
  "mindset-coach": [
    { domain: "Motivation", stars: 5 },
    { domain: "Confidence Building", stars: 5 },
    { domain: "Goal Setting", stars: 4 },
  ],
  "compliance-specialist": [
    { domain: "Regulations", stars: 5 },
    { domain: "Documentation", stars: 5 },
    { domain: "Risk Management", stars: 4 },
  ],
  "wolf-closer": [
    { domain: "Persuasion", stars: 5 },
    { domain: "Tonality", stars: 5 },
    { domain: "Psychology", stars: 4 },
  ],
  "objection-handler": [
    { domain: "Rebuttals", stars: 5 },
    { domain: "Scripts", stars: 5 },
    { domain: "Rapport", stars: 4 },
  ],
};

// Domain keywords for confidence matching
const domainKeywords: Record<string, string[]> = {
  "insurance-expert": ["policy", "insurance", "coverage", "premium", "underwriting", "term", "whole life", "annuity", "beneficiary", "claim", "rider"],
  "sales-closer": ["close", "sale", "deal", "pitch", "presentation", "ask", "commitment", "sign", "buy", "purchase", "decision"],
  "mindset-coach": ["mindset", "confidence", "motivation", "fear", "rejection", "believe", "attitude", "success", "goal", "overcome", "anxiety"],
  "compliance-specialist": ["compliant", "regulation", "legal", "disclosure", "document", "license", "state", "requirement", "rule", "law", "audit"],
  "wolf-closer": ["persuade", "influence", "tone", "urgency", "emotion", "script", "power", "control", "frame", "psychology"],
  "objection-handler": ["objection", "excuse", "concern", "but", "can't", "won't", "no", "afford", "think about", "spouse", "later"],
};

// Domain tag labels (shorter versions for display)
const domainTags: Record<string, string[]> = {
  "insurance-expert": ["INSURANCE", "UNDERWRITING", "PRODUCTS"],
  "sales-closer": ["SALES", "CLOSING", "PRESENTATION"],
  "mindset-coach": ["MINDSET", "MOTIVATION", "COACHING"],
  "compliance-specialist": ["COMPLIANCE", "REGULATIONS", "DOCUMENTATION"],
  "wolf-closer": ["PERSUASION", "PSYCHOLOGY", "TONALITY"],
  "objection-handler": ["OBJECTIONS", "REBUTTALS", "SCRIPTS"],
};

// Confidence level calculation
type ConfidenceLevel = "high" | "moderate" | "exploring";

function calculateConfidence(question: string, avatarSlug: string): ConfidenceLevel {
  const keywords = domainKeywords[avatarSlug] || [];
  const lowerQuestion = question.toLowerCase();
  const matchCount = keywords.filter(kw => lowerQuestion.includes(kw)).length;

  if (matchCount >= 2) return "high";
  if (matchCount >= 1) return "moderate";
  return "exploring";
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; color: string; bg: string }> = {
  high: { label: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-400/20" },
  moderate: { label: "Moderate", color: "text-amber-400", bg: "bg-amber-400/20" },
  exploring: { label: "Exploring", color: "text-blue-400", bg: "bg-blue-400/20" },
};

// =============================================================================
// Sub-Components
// =============================================================================

// Star Rating Display
function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "text-[10px]",
            i < stars ? "text-amber-400" : "text-gray-600"
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Avatar Icon with signature glow
function AvatarIcon({
  avatar,
  size = "md",
  isActive = false,
  isSpeaking = false,
}: {
  avatar: Avatar;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  isSpeaking?: boolean;
}) {
  const Icon = avatarIcons[avatar.slug] || User;
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={cn(
        "rounded-xl flex items-center justify-center transition-all border border-white/5",
        colors.bg,
        sizeClasses[size],
        isActive && ["ring-2", colors.glow.replace("shadow", "ring")],
        isSpeaking && ["shadow-lg", colors.glow]
      )}
      animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <Icon className={cn(colors.icon, iconSizes[size])} />
    </motion.div>
  );
}

// User Message Bubble
function UserMessage({ message }: { message: AvatarMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className="flex justify-end mb-3 sm:mb-4"
    >
      <div className="max-w-[85%] sm:max-w-[70%]">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-br-sm">
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

// Avatar Response Card
function AvatarResponse({
  message,
  avatar,
  isStreaming = false,
  streamingContent = "",
  contextQuestion = "",
  onCopy,
  onSave,
  onChallenge,
  onRegenerate,
}: {
  message: AvatarMessage;
  avatar: Avatar;
  isStreaming?: boolean;
  streamingContent?: string;
  contextQuestion?: string;
  onCopy?: () => void;
  onSave?: () => void;
  onChallenge?: () => void;
  onRegenerate?: () => void;
}) {
  const Icon = avatarIcons[avatar.slug] || User;
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];
  const content = isStreaming ? streamingContent : message.content;
  const expertise = expertiseRatings[avatar.slug]?.[0];
  const confidence = calculateConfidence(contextQuestion, avatar.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className="mb-4"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}15 0%, transparent 50%)`,
          borderLeft: `3px solid ${colors.accent}`,
        }}
      >
        {/* Domain Tags - Above header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <DomainTags avatarSlug={avatar.slug} accentColor={colors.accent} />
          <ConfidenceBadge level={confidence} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <AvatarIcon avatar={avatar} size="sm" isSpeaking={isStreaming} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white uppercase tracking-wide">
                  {avatar.name}
                </span>
                {isStreaming && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">{avatar.speakingStyle}</p>
            </div>
          </div>
          {expertise && (
            <div className="flex items-center gap-2 text-xs">
              <StarRating stars={expertise.stars} />
              <span className="text-gray-400 uppercase text-[10px] tracking-wider">
                Expert
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 text-gray-200 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-amber-300">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-0.5" />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!isStreaming && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={onCopy}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={onSave}
                    >
                      <Bookmark className="w-3 h-3 mr-1" />
                      <span className="text-xs">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save to library</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={onRegenerate}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      <span className="text-xs">Retry</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Regenerate response</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10"
                      onClick={onChallenge}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      <span className="text-xs">Challenge</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Get counter-argument</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {message.tokensUsed && (
              <span className="text-[10px] text-gray-500 font-mono">
                {message.tokensUsed} tokens
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// System Message
function SystemMessage({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-3 py-4 my-4"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        {icon}
        <span>{text}</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
    </motion.div>
  );
}

// Thinking Indicator - Shows before avatar starts responding
function ThinkingIndicator({ avatar }: { avatar: Avatar }) {
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-4"
    >
      <div
        className="rounded-xl overflow-hidden p-4"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}15 0%, transparent 50%)`,
          borderLeft: `3px solid ${colors.accent}`,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <AvatarIcon avatar={avatar} size="sm" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white uppercase tracking-wide">
                {avatar.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">Analyzing your question...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Confidence Badge
function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const config = confidenceConfig[level];
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", config.bg, config.color)}>
      {config.label}
    </span>
  );
}

// Domain Tags
function DomainTags({ avatarSlug, accentColor }: { avatarSlug: string; accentColor: string }) {
  const tags = domainTags[avatarSlug]?.slice(0, 2) || [];
  return (
    <div className="flex gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// Advisor Panel Card
function AdvisorCard({
  avatar,
  status,
  isActive,
  streamProgress,
  onRemove,
}: {
  avatar: Avatar;
  status: "speaking" | "standby" | "thinking" | "muted";
  isActive: boolean;
  streamProgress?: number;
  onRemove?: () => void;
}) {
  const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];

  const statusConfig = {
    speaking: { label: "STREAMING", color: "text-emerald-400", dot: "bg-emerald-400" },
    standby: { label: "STANDBY", color: "text-gray-500", dot: "bg-gray-500" },
    thinking: { label: "PROCESSING", color: "text-amber-400", dot: "bg-amber-400" },
    muted: { label: "MUTED", color: "text-gray-600", dot: "bg-gray-600" },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "p-3 rounded-lg transition-all border",
        isActive ? ["bg-white/5 border-white/10", colors.glow] : "bg-white/[0.02] border-white/5",
        status === "muted" && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <AvatarIcon avatar={avatar} size="sm" isActive={isActive} isSpeaking={status === "speaking"} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm truncate", status === "muted" ? "line-through text-gray-600" : "text-gray-200")}>
            {avatar.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <motion.span
              className={cn("w-1.5 h-1.5 rounded-full", config.dot)}
              animate={status === "speaking" || status === "thinking" ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={cn("text-[10px] font-mono tracking-wider", config.color)}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar for Speaking */}
      {status === "speaking" && streamProgress !== undefined && (
        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.accent}80)` }}
            initial={{ width: 0 }}
            animate={{ width: `${streamProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

// Quick Action Button
function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-8 px-3 text-xs gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Button>
  );
}

// Command Palette
function CommandPalette({
  open,
  onOpenChange,
  onCommand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (command: string) => void;
}) {
  const [search, setSearch] = useState("");

  const commands = [
    { id: "add-advisor", label: "Add neural link", shortcut: "/add" },
    { id: "debate", label: "Initialize debate mode", shortcut: "/debate" },
    { id: "consensus", label: "Request consensus", shortcut: "/consensus" },
    { id: "focus", label: "Focus single link", shortcut: "/focus" },
    { id: "clear", label: "Clear session", shortcut: "/clear" },
    { id: "export", label: "Export transcript", shortcut: "/export" },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.shortcut.includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md bg-[#12121a] border-white/10">
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg border border-white/5">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Type a command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-gray-100 text-sm outline-none placeholder:text-gray-500"
              autoFocus
            />
            <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 border border-white/10 font-mono">
              ESC
            </kbd>
          </div>
        </div>

        <div className="p-2 max-h-64 overflow-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No commands found</p>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  onCommand(cmd.id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm text-gray-200">
                  {cmd.label}
                </span>
                <code className="text-xs text-cyan-400 font-mono">
                  {cmd.shortcut}
                </code>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Main War Room Component
// =============================================================================

interface WarRoomProps {
  className?: string;
  onExit: () => void;
}

export function WarRoom({ className, onExit }: WarRoomProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Session");
  const [sessionStartTime] = useState(Date.now());
  const [isThinking, setIsThinking] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Store state
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore((state) => state.selectedAvatarIds);
  const isLoading = useAvatarCouncilStore((state) => state.isLoading);
  const sendMessage = useAvatarCouncilStore((state) => state.sendMessage);
  const clearMessages = useAvatarCouncilStore((state) => state.clearMessages);

  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();
  const connectionStatus = useConnectionStatus();
  const connectionState = useConnectionState();
  const connect = useAvatarCouncilStore((state) => state.connect);
  const cancelReconnect = useAvatarCouncilStore((state) => state.cancelReconnect);
  const userId = useAvatarCouncilStore((state) => state.userId);
  const isAdmin = useAvatarCouncilStore((state) => state.isAdmin);

  const isConnected = connectionStatus === "connected";
  const showConnectionBanner = connectionStatus !== "connected";

  // Selected avatars
  const selectedAvatars = useMemo(
    () => avatars.filter((a) => selectedAvatarIds.includes(a.id)),
    [avatars, selectedAvatarIds]
  );

  // Mode detection
  const mode = selectedAvatars.length > 1 ? "multi" : "single";

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-set session title from first message
  useEffect(() => {
    if (messages.length > 0 && sessionTitle === "New Session") {
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        const title = firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
        setSessionTitle(title);
      }
    }
  }, [messages, sessionTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Session duration
  const [duration, setDuration] = useState("0:00");
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Clear thinking state when streaming starts
  useEffect(() => {
    if (streamingAvatarId) {
      setIsThinking(false);
    }
  }, [streamingAvatarId]);

  // Set thinking state when loading starts (but not streaming yet)
  useEffect(() => {
    if (isLoading && !streamingAvatarId) {
      setIsThinking(true);
    }
  }, [isLoading, streamingAvatarId]);

  // Handlers
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      const question = inputValue.trim();
      setLastQuestion(question);
      setIsThinking(true);
      sendMessage(question);
      setInputValue("");
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "clear":
        clearMessages();
        setSessionTitle("New Session");
        break;
      case "consensus":
        sendMessage("What do all advisors agree on regarding this topic?");
        break;
      // Add more commands as needed
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleChallenge = (avatarId: string) => {
    sendMessage("Play devil's advocate on your last response. What are the counterarguments?");
  };

  // Total tokens used
  const totalTokens = messages.reduce((acc, m) => acc + (m.tokensUsed || 0), 0);

  return (
    <div className={cn("relative flex flex-col h-full bg-[#0a0a0f] overflow-hidden", className)}>
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ========== HEADER ========== */}
      <header className="relative z-10 flex-shrink-0 h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>

          <div className="h-6 w-px bg-white/10" />

          <div>
            <h1 className="text-sm font-medium text-gray-100 truncate max-w-[200px] sm:max-w-none">
              {sessionTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono tracking-wider border border-cyan-500/20">
                {mode === "single" ? "NEURAL LINK" : "MULTI-LINK"}
              </span>
              <motion.span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isConnected ? "bg-emerald-400" : "bg-red-400"
                )}
                animate={isConnected ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle voice (coming soon)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Analytics</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden text-gray-400 hover:text-gray-200"
          >
            {showSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* ========== CONNECTION BANNER ========== */}
      <AnimatePresence>
        {showConnectionBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 flex-shrink-0 px-4 py-2 bg-[#12121a]/80 border-b border-white/5"
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

      {/* ========== MAIN CONTENT ========== */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* ========== RESPONSE THEATER ========== */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="max-w-3xl mx-auto">
              {/* Empty State */}
              {messages.length === 0 && !streamingAvatarId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20"
                    animate={{ boxShadow: ["0 0 20px rgba(34,211,238,0.1)", "0 0 40px rgba(34,211,238,0.2)", "0 0 20px rgba(34,211,238,0.1)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-100">
                    Neural Link Active
                  </h2>
                  <p className="text-gray-400 text-sm max-w-md mb-6">
                    {selectedAvatars.length === 1 ? "Your advisor is online" : "Your advisors are online"} and ready to process your queries.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedAvatars.map((avatar) => {
                      const colors = avatarColors[avatar.slug] || avatarColors["insurance-expert"];
                      return (
                        <div
                          key={avatar.id}
                          className={cn(
                            "flex items-center gap-2 py-1.5 px-3 rounded-lg border border-white/10",
                            colors.bg
                          )}
                        >
                          <AvatarIcon avatar={avatar} size="sm" />
                          <span className="text-sm text-gray-200">{avatar.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* System Message: Session Start */}
              {messages.length > 0 && (
                <SystemMessage
                  text={`${selectedAvatars.map((a) => a.name).join(" & ")} ${selectedAvatars.length > 1 ? "have" : "has"} entered the room`}
                  icon={<Sparkles className="w-3 h-3 text-amber-400" />}
                />
              )}

              {/* Messages */}
              <AnimatePresence>
                {messages.map((msg, idx) => {
                  if (msg.role === "user") {
                    return <UserMessage key={msg.id} message={msg} />;
                  }

                  const avatar = avatars.find((a) => a.id === msg.avatarId);
                  if (!avatar) return null;

                  // Find the preceding user message for context
                  const precedingMessages = messages.slice(0, idx);
                  const lastUserMsg = [...precedingMessages].reverse().find(m => m.role === "user");
                  const contextQ = lastUserMsg?.content || "";

                  return (
                    <AvatarResponse
                      key={msg.id}
                      message={msg}
                      avatar={avatar}
                      contextQuestion={contextQ}
                      onCopy={() => handleCopy(msg.content)}
                      onChallenge={() => handleChallenge(msg.avatarId || "")}
                    />
                  );
                })}

                {/* Thinking Indicator - Shows before streaming starts */}
                {isThinking && !streamingAvatarId && selectedAvatars.length > 0 && (
                  <ThinkingIndicator avatar={selectedAvatars[0]} />
                )}

                {/* Streaming Response */}
                {streamingAvatarId && (
                  <AvatarResponse
                    message={{
                      id: "streaming",
                      sessionId: "",
                      role: "avatar",
                      avatarId: streamingAvatarId,
                      content: "",
                      tokensUsed: null,
                      createdAt: new Date().toISOString(),
                    }}
                    avatar={avatars.find((a) => a.id === streamingAvatarId)!}
                    isStreaming
                    streamingContent={streamingContent}
                    contextQuestion={lastQuestion}
                  />
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* ========== INPUT AREA ========== */}
          <div className="flex-shrink-0 border-t border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl p-3 sm:p-4">
            <div className="max-w-3xl mx-auto">
              {/* Streaming Error Recovery */}
              {connectionState.streamingError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between"
                >
                  <span className="text-xs text-red-400">Connection interrupted</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      useAvatarCouncilStore.getState().setStreamingError(false);
                      if (lastQuestion) sendMessage(lastQuestion);
                    }}
                    className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </motion.div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="relative mb-2 sm:mb-3">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your query..."
                  disabled={isLoading}
                  className="min-h-[48px] sm:min-h-[52px] max-h-[150px] sm:max-h-[200px] resize-none pr-20 sm:pr-24 text-sm sm:text-base bg-[#12121a] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  rows={1}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hidden sm:flex text-gray-500"
                          disabled
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voice input (coming soon)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>

              {/* Quick Actions - Scrollable on mobile */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <QuickAction
                  icon={Target}
                  label="Challenge"
                  onClick={() => sendMessage("Challenge the last response with counterarguments")}
                />
                <QuickAction
                  icon={Handshake}
                  label="Consensus"
                  onClick={() => sendMessage("What do all advisors agree on?")}
                />
                <QuickAction
                  icon={Search}
                  label="Expand"
                  onClick={() => sendMessage("Give me more detail on the last topic")}
                />

                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 font-mono hidden sm:inline border border-white/10">
                    ⌘K
                  </kbd>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommandPalette(true)}
                    className="text-xs gap-1 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  >
                    <Command className="w-3 h-3" />
                    <span className="hidden sm:inline">Commands</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ADVISOR PANEL (Sidebar) ========== */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-l border-white/5 bg-[#0d0d14]/50 overflow-hidden hidden lg:block"
            >
              <div className="w-64 h-full flex flex-col">
                {/* Advisors Section */}
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
                    Active Neural Links
                  </h3>
                  <div className="space-y-2">
                    {selectedAvatars.map((avatar) => (
                      <AdvisorCard
                        key={avatar.id}
                        avatar={avatar}
                        status={
                          streamingAvatarId === avatar.id
                            ? "speaking"
                            : isLoading
                            ? "thinking"
                            : "standby"
                        }
                        isActive={streamingAvatarId === avatar.id}
                        streamProgress={streamingAvatarId === avatar.id ? 50 : undefined}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Link
                  </Button>
                </div>

                {/* Session Info */}
                <div className="p-4 flex-1">
                  <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
                    Session Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400">{duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="text-xs">Messages</span>
                      </div>
                      <span className="text-xs font-mono text-gray-200">{messages.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-xs">Tokens</span>
                      </div>
                      <span className="text-xs font-mono text-gray-200">
                        {totalTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expertise Preview */}
                {selectedAvatars.length === 1 && (
                  <div className="p-4 border-t border-white/5">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
                      Expertise Matrix
                    </h3>
                    <div className="space-y-2">
                      {expertiseRatings[selectedAvatars[0].slug]?.map((exp) => (
                        <div key={exp.domain} className="flex items-center justify-between">
                          <span className="text-xs text-gray-300">{exp.domain}</span>
                          <StarRating stars={exp.stars} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCommand={handleCommand}
      />
    </div>
  );
}

export default WarRoom;
