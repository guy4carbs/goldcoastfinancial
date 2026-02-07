import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  User,
  Bot,
  Brain,
  Target,
  Shield,
  Flame,
  Heart,
  MessageSquare,
  Trash2,
  Sparkles,
  UserPlus,
  Volume2,
  VolumeX,
  Paperclip,
  X,
  RefreshCw,
  ChevronDown,
  Zap,
  History,
  MoreHorizontal,
} from "lucide-react";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  type AvatarMessage,
  type Avatar,
} from "@/lib/avatarCouncilStore";
import ReactMarkdown from "react-markdown";

// =============================================================================
// Avatar Icons & Colors
// =============================================================================

const avatarIcons: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
  "warren-buffett": Brain,
  "patrick-bet-david": Zap,
  "ben-feldman": Target,
  "elizur-wright": Shield,
  "jordan-belfort": Flame,
  "andy-elliott": Zap,
};

const avatarColors: Record<string, { bg: string; text: string; glow: string }> = {
  "insurance-expert": { bg: "bg-blue-500", text: "text-blue-400", glow: "shadow-blue-500/30" },
  "sales-closer": { bg: "bg-orange-500", text: "text-orange-400", glow: "shadow-orange-500/30" },
  "mindset-coach": { bg: "bg-purple-500", text: "text-purple-400", glow: "shadow-purple-500/30" },
  "compliance-specialist": { bg: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
  "wolf-closer": { bg: "bg-red-500", text: "text-red-400", glow: "shadow-red-500/30" },
  "objection-handler": { bg: "bg-amber-500", text: "text-amber-400", glow: "shadow-amber-500/30" },
  "warren-buffett": { bg: "bg-amber-500", text: "text-amber-400", glow: "shadow-amber-500/30" },
  "patrick-bet-david": { bg: "bg-cyan-500", text: "text-cyan-400", glow: "shadow-cyan-500/30" },
  "ben-feldman": { bg: "bg-violet-500", text: "text-violet-400", glow: "shadow-violet-500/30" },
  "elizur-wright": { bg: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
  "jordan-belfort": { bg: "bg-red-500", text: "text-red-400", glow: "shadow-red-500/30" },
  "andy-elliott": { bg: "bg-orange-500", text: "text-orange-400", glow: "shadow-orange-500/30" },
};

const defaultColor = { bg: "bg-slate-500", text: "text-slate-400", glow: "shadow-slate-500/30" };

// =============================================================================
// Types
// =============================================================================

type ChatState = "idle" | "routing" | "reveal" | "chatting";

interface ChatExpertState {
  isOpen: boolean;
  domain: string;
  reason: string;
}

// =============================================================================
// Routing Indicator Component
// =============================================================================

function RoutingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-8"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white/80">Analyzing your question...</p>
          <p className="text-xs text-white/50 mt-1">Finding the best advisor</p>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Avatar Reveal Component
// =============================================================================

interface AvatarRevealProps {
  avatar: Avatar;
  intent: {
    primaryDomain: string;
    confidence: number;
    questionType: string;
  };
  reasoning: string;
  onContinue: () => void;
  onSwitchAdvisor: () => void;
}

function AvatarReveal({ avatar, intent, reasoning, onContinue, onSwitchAdvisor }: AvatarRevealProps) {
  const avatarSlug = avatar.slug || "";
  const colors = avatarColors[avatarSlug] || defaultColor;
  const Icon = avatarIcons[avatarSlug] || Bot;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-sm"
    >
      <div className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-slate-800/80 to-slate-900/90",
        "border border-white/10",
        "shadow-xl",
        colors.glow
      )}>
        {/* Header gradient */}
        <div className={cn("h-1", colors.bg)} />

        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            {avatar.avatarImageUrl ? (
              <img
                src={avatar.avatarImageUrl}
                alt={avatar.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", colors.bg)}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white">{avatar.name}</h3>
              <p className={cn("text-sm", colors.text)}>
                {intent.primaryDomain.charAt(0).toUpperCase() + intent.primaryDomain.slice(1)} Expert
              </p>
            </div>
          </div>

          {/* Confidence */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>Match Confidence</span>
              <span>{Math.round(intent.confidence * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intent.confidence * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn("h-full rounded-full", colors.bg)}
              />
            </div>
          </div>

          {/* Reasoning */}
          <p className="text-sm text-white/70 mb-6 leading-relaxed">
            {reasoning}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onContinue}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm",
                "bg-white text-slate-900",
                "hover:bg-white/90 transition-colors"
              )}
            >
              Continue with {avatar.name.split(' ')[0]}
            </button>
            <button
              onClick={onSwitchAdvisor}
              className={cn(
                "py-2.5 px-4 rounded-lg font-medium text-sm",
                "bg-white/10 text-white/80 hover:bg-white/20",
                "transition-colors"
              )}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Message Bubble Component
// =============================================================================

interface MessageBubbleProps {
  message: AvatarMessage;
  avatars: Avatar[];
  isStreaming?: boolean;
  streamingContent?: string;
  onPlayVoice?: () => void;
  isPlayingVoice?: boolean;
}

function MessageBubble({
  message,
  avatars,
  isStreaming,
  streamingContent,
  onPlayVoice,
  isPlayingVoice,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatar = avatars.find(a => a.id === message.avatarId);
  const avatarSlug = avatar?.slug || "";
  const colors = avatarColors[avatarSlug] || defaultColor;
  const Icon = avatarIcons[avatarSlug] || Bot;
  const isExpert = message.avatarName?.includes("(Expert)");

  const content = isStreaming ? streamingContent || "" : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        "shadow-lg",
        isUser ? "bg-gradient-to-br from-slate-600 to-slate-700" : colors.bg,
        !isUser && colors.glow
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : avatar?.avatarImageUrl ? (
          <img
            src={avatar.avatarImageUrl}
            alt={avatar.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message */}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3",
        isUser
          ? "bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-tr-sm"
          : cn(
              "bg-gradient-to-br from-slate-800/90 to-slate-900/90",
              "border border-white/10",
              "text-white rounded-tl-sm",
              isExpert && "border-cyan-500/30"
            )
      )}>
        {/* Avatar Name */}
        {!isUser && (avatar || message.avatarName) && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold text-sm", colors.text)}>
                {message.avatarName || avatar?.name}
              </span>
              {isExpert && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                  EXPERT
                </span>
              )}
              {isStreaming && (
                <Loader2 className="w-3 h-3 animate-spin text-white/50" />
              )}
            </div>
            {!isStreaming && onPlayVoice && (
              <button
                onClick={onPlayVoice}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {isPlayingVoice ? (
                  <VolumeX className="w-4 h-4 text-white/50" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white/50" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-sm prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-0.5" />
          )}
        </div>

        {/* Token count */}
        {!isUser && message.tokensUsed && !isStreaming && (
          <div className="text-[10px] text-white/40 mt-2 text-right">
            {message.tokensUsed.toLocaleString()} tokens
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Expert Summon Panel
// =============================================================================

interface ExpertSummonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSummon: (domain: string, reason: string) => void;
  isLoading: boolean;
  currentAvatar?: Avatar;
}

function ExpertSummonPanel({ isOpen, onClose, onSummon, isLoading, currentAvatar }: ExpertSummonPanelProps) {
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");

  const domains = [
    { id: "insurance", label: "Insurance Products", icon: "🏥" },
    { id: "compliance", label: "Compliance & Regulations", icon: "⚖️" },
    { id: "sales", label: "Sales Strategy", icon: "📈" },
    { id: "mindset", label: "Mindset & Motivation", icon: "🧠" },
    { id: "objections", label: "Objection Handling", icon: "🎯" },
    { id: "persuasion", label: "Persuasion Techniques", icon: "💫" },
  ];

  const handleSummon = () => {
    if (domain) {
      onSummon(domain, reason);
      setDomain("");
      setReason("");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4"
    >
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-white text-sm">Summon Expert</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <p className="text-xs text-white/60 mb-3">
            Bring in another expert to contribute to this conversation.
          </p>

          {/* Domain selection */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {domains.map(d => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={cn(
                  "p-2 rounded-lg text-xs text-center transition-all",
                  domain === d.id
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                )}
              >
                <span className="block mb-1">{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>

          {/* Reason input */}
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need this expert? (optional)"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 mb-3"
          />

          <button
            onClick={handleSummon}
            disabled={!domain || isLoading}
            className={cn(
              "w-full py-2 rounded-lg font-medium text-sm transition-all",
              domain && !isLoading
                ? "bg-cyan-500 text-white hover:bg-cyan-400"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Summoning...
              </span>
            ) : (
              "Summon Expert"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Enhanced Avatar Chat Component
// =============================================================================

interface EnhancedAvatarChatProps {
  className?: string;
}

export function EnhancedAvatarChat({ className }: EnhancedAvatarChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Store state
  const avatars = useAvatarCouncilStore(state => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore(state => state.selectedAvatarIds);
  const connectionStatus = useAvatarCouncilStore(state => state.connectionStatus);
  const isLoading = useAvatarCouncilStore(state => state.isLoading);
  const error = useAvatarCouncilStore(state => state.error);
  const routingResult = useAvatarCouncilStore(state => state.routingResult);
  const isRouting = useAvatarCouncilStore(state => state.isRouting);
  const isSummoningChatExpert = useAvatarCouncilStore(state => state.isSummoningChatExpert);
  const chatExpertStreaming = useAvatarCouncilStore(state => state.chatExpertStreaming);

  // Actions
  const sendMessage = useAvatarCouncilStore(state => state.sendMessage);
  const clearMessages = useAvatarCouncilStore(state => state.clearMessages);
  const selectAvatar = useAvatarCouncilStore(state => state.selectAvatar);
  const clearSelectedAvatars = useAvatarCouncilStore(state => state.clearSelectedAvatars);
  const requestRouting = useAvatarCouncilStore(state => state.requestRouting);
  const clearRoutingResult = useAvatarCouncilStore(state => state.clearRoutingResult);
  const summonChatExpert = useAvatarCouncilStore(state => state.summonChatExpert);

  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();

  const needsAutoRouting = selectedAvatarIds.length === 0;
  const currentAvatar = avatars.find(a => selectedAvatarIds.includes(a.id));

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, chatExpertStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  // Handle routing result
  useEffect(() => {
    if (routingResult && chatState === "routing") {
      setChatState("reveal");
    }
  }, [routingResult, chatState]);

  const handleAutoRoute = async (question: string) => {
    setChatState("routing");
    requestRouting(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || connectionStatus !== "connected") return;

    const question = inputValue.trim();
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Auto-route if no avatar selected
    if (needsAutoRouting && messages.length === 0 && chatState === "idle") {
      handleAutoRoute(question);
    } else {
      setChatState("chatting");
      sendMessage(question);
    }
  };

  const handleContinueWithAvatar = () => {
    if (routingResult?.selectedAvatars[0]) {
      clearSelectedAvatars();
      selectAvatar(routingResult.selectedAvatars[0].id);
    }
    setChatState("chatting");

    // Get the pending question from input or last user attempt
    const pendingQuestion = inputValue.trim();
    if (pendingQuestion) {
      sendMessage(pendingQuestion);
      setInputValue("");
    }
    clearRoutingResult();
  };

  const handleSwitchAdvisor = () => {
    // Show avatar selector
    setChatState("idle");
    clearRoutingResult();
  };

  const handleSummonExpert = (domain: string, reason: string) => {
    if (currentAvatar) {
      summonChatExpert(currentAvatar.id, domain, reason);
      setExpertPanelOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isConnected = connectionStatus === "connected";

  return (
    <div className={cn(
      "flex flex-col h-full",
      "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950",
      className
    )}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentAvatar ? (
              <>
                {currentAvatar.avatarImageUrl ? (
                  <img
                    src={currentAvatar.avatarImageUrl}
                    alt={currentAvatar.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    avatarColors[currentAvatar.slug]?.bg || defaultColor.bg
                  )}>
                    {(() => {
                      const Icon = avatarIcons[currentAvatar.slug] || Bot;
                      return <Icon className="w-4 h-4 text-white" />;
                    })()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{currentAvatar.name}</p>
                  <p className="text-xs text-white/50">
                    {currentAvatar.domainExpertise?.slice(0, 2).join(", ")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AI Advisor</p>
                  <p className="text-xs text-white/50">Auto-routing enabled</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  clearMessages();
                  setChatState("idle");
                  clearSelectedAvatars();
                }}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-500" : "bg-red-500"
            )} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Empty State */}
          {messages.length === 0 && chatState === "idle" && !streamingAvatarId && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ask anything</h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  {needsAutoRouting
                    ? "Your question will be intelligently routed to the best expert advisor."
                    : `${currentAvatar?.name} is ready to help you.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["Sales tips", "Objection handling", "Compliance questions"].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Routing State */}
          {chatState === "routing" && (
            <motion.div
              key="routing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RoutingIndicator />
            </motion.div>
          )}

          {/* Reveal State */}
          {chatState === "reveal" && routingResult && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AvatarReveal
                avatar={routingResult.selectedAvatars[0] as Avatar}
                intent={routingResult.intent}
                reasoning={routingResult.reasoning}
                onContinue={handleContinueWithAvatar}
                onSwitchAdvisor={handleSwitchAdvisor}
              />
            </motion.div>
          )}

          {/* Chat Messages */}
          {(chatState === "chatting" || messages.length > 0) && chatState !== "routing" && chatState !== "reveal" && (
            <motion.div
              key="chatting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  avatars={avatars}
                />
              ))}

              {/* Streaming message */}
              {streamingAvatarId && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    sessionId: "",
                    role: "avatar",
                    avatarId: streamingAvatarId,
                    content: "",
                    tokensUsed: null,
                    createdAt: new Date().toISOString(),
                  }}
                  avatars={avatars}
                  isStreaming
                  streamingContent={streamingContent}
                />
              )}

              {/* Expert streaming */}
              {isSummoningChatExpert && chatExpertStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mb-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-cyan-400">Expert Contributing</span>
                      <Loader2 className="w-3 h-3 animate-spin text-white/50" />
                    </div>
                    <div className="text-sm text-white/90">
                      {chatExpertStreaming}
                      <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-white/5 bg-slate-900/50 relative">
        <AnimatePresence>
          <ExpertSummonPanel
            isOpen={expertPanelOpen}
            onClose={() => setExpertPanelOpen(false)}
            onSummon={handleSummonExpert}
            isLoading={isSummoningChatExpert}
            currentAvatar={currentAvatar}
          />
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          {/* Extra actions */}
          {currentAvatar && messages.length > 0 && (
            <button
              type="button"
              onClick={() => setExpertPanelOpen(!expertPanelOpen)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                expertPanelOpen
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              )}
              title="Summon expert"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !isConnected
                  ? "Connecting..."
                  : chatState === "reveal"
                  ? "Confirm advisor above..."
                  : "Ask a question..."
              }
              disabled={!isConnected || isLoading || chatState === "routing" || chatState === "reveal"}
              className={cn(
                "w-full px-4 py-3 rounded-xl resize-none",
                "bg-white/5 border border-white/10",
                "text-white placeholder:text-white/40",
                "focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all"
              )}
              rows={1}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected || isLoading || chatState === "routing" || chatState === "reveal"}
            className={cn(
              "p-3 rounded-xl transition-all",
              inputValue.trim() && isConnected && !isLoading
                ? "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/30"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            {isLoading || chatState === "routing" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EnhancedAvatarChat;
