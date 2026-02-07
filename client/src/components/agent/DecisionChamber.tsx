import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Sparkles,
  UserPlus,
  X,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Check,
  Smile,
  Paperclip,
  Mic,
  Image,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  useConnectionStatus,
  useChatThreadActions,
  type Avatar,
  type AvatarMessage,
} from "@/lib/avatarCouncilStore";
import ReactMarkdown from "react-markdown";
import { ChatSidebar } from "./ChatSidebar";

// =============================================================================
// Types & Constants
// =============================================================================

interface DecisionChamberProps {
  className?: string;
  onExit: () => void;
}

// Signature colors for advisors (works with both light and dark themes)
const advisorSignatures: Record<string, {
  primary: string;
  text: string;
  bg: string;
  glow: string;
}> = {
  "insurance-expert": { primary: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500", glow: "shadow-cyan-500/30" },
  "sales-closer": { primary: "#F59E0B", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", glow: "shadow-amber-500/30" },
  "mindset-coach": { primary: "#8B5CF6", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500", glow: "shadow-violet-500/30" },
  "compliance-specialist": { primary: "#10B981", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", glow: "shadow-emerald-500/30" },
  "wolf-closer": { primary: "#EF4444", text: "text-red-600 dark:text-red-400", bg: "bg-red-500", glow: "shadow-red-500/30" },
  "objection-handler": { primary: "#F97316", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500", glow: "shadow-orange-500/30" },
  "warren-buffett": { primary: "#F59E0B", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", glow: "shadow-amber-500/30" },
  "patrick-bet-david": { primary: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500", glow: "shadow-cyan-500/30" },
  "ben-feldman": { primary: "#8B5CF6", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500", glow: "shadow-violet-500/30" },
  "elizur-wright": { primary: "#10B981", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", glow: "shadow-emerald-500/30" },
  "jordan-belfort": { primary: "#EF4444", text: "text-red-600 dark:text-red-400", bg: "bg-red-500", glow: "shadow-red-500/30" },
  "andy-elliott": { primary: "#F97316", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500", glow: "shadow-orange-500/30" },
};

const getSignature = (slug: string) => advisorSignatures[slug] || {
  primary: "#64748B",
  text: "text-slate-600 dark:text-slate-400",
  bg: "bg-slate-500",
  glow: "shadow-slate-500/30",
};

// =============================================================================
// Advisor Pills Component (Shows selected advisors at top)
// =============================================================================

interface AdvisorPillsProps {
  advisors: Avatar[];
  streamingAvatarId: string | null;
  activeAvatarId: string | null;
  onAvatarClick?: (avatarId: string) => void;
  onRemove?: (id: string) => void;
}

function AdvisorPills({ advisors, streamingAvatarId, activeAvatarId, onAvatarClick, onRemove }: AdvisorPillsProps) {
  if (advisors.length === 0) return null;

  const showSelection = advisors.length > 1;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {advisors.map((advisor) => {
        const sig = getSignature(advisor.slug);
        const isStreaming = streamingAvatarId === advisor.id;
        const isSelected = activeAvatarId === advisor.id || (!activeAvatarId && advisors.length === 1);

        return (
          <motion.button
            key={advisor.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onAvatarClick?.(advisor.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
              "border",
              showSelection && "cursor-pointer hover:shadow-md",
              isSelected
                ? cn("bg-primary/10 border-primary/30 shadow-md", sig.glow)
                : "bg-muted/50 border-border hover:border-muted-foreground/30",
              !showSelection && "cursor-default"
            )}
          >
            {/* Avatar image with selection indicator */}
            <div className="relative">
              {advisor.avatarImageUrl ? (
                <img
                  src={advisor.avatarImageUrl}
                  alt={advisor.name}
                  className={cn(
                    "w-10 h-10 rounded-lg object-cover shadow-sm transition-all",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                />
              ) : (
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white transition-all",
                  sig.bg,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}>
                  {advisor.name.charAt(0)}
                </div>
              )}
              {/* Selection checkmark */}
              {showSelection && isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className={cn("text-sm font-semibold", isSelected ? "text-foreground" : "text-muted-foreground")}>
                {advisor.name}
              </span>
              {isStreaming ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Typing...
                </span>
              ) : showSelection ? (
                <span className={cn("text-xs", isSelected ? "text-primary" : "text-muted-foreground")}>
                  {isSelected ? "Talking to" : "Click to select"}
                </span>
              ) : null}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Routing Indicator
// =============================================================================

function RoutingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-cyan-500" />
      </motion.div>
      <div>
        <p className="text-sm text-muted-foreground">Finding the best advisor...</p>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Message Bubble Component
// =============================================================================

interface MessageBubbleProps {
  message: AvatarMessage;
  avatar?: Avatar;
  isStreaming?: boolean;
  streamingContent?: string;
}

function MessageBubble({ message, avatar, isStreaming, streamingContent }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const sig = avatar ? getSignature(avatar.slug) : null;
  const content = isStreaming ? streamingContent || "" : message.content;
  const isExpert = message.avatarName?.includes("(Expert)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 px-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar - BIGGER */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden",
        isUser
          ? "bg-primary"
          : sig?.bg || "bg-muted",
        !isUser && sig?.glow
      )}>
        {isUser ? (
          <User className="w-6 h-6 text-primary-foreground" />
        ) : avatar?.avatarImageUrl ? (
          <img
            src={avatar.avatarImageUrl}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-base font-bold">
            {(avatar?.name || "A").charAt(0)}
          </span>
        )}
      </div>

      {/* Message */}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-md"
          : cn(
              "bg-card border border-border rounded-tl-md",
              isExpert && "border-cyan-500/50"
            )
      )}>
        {/* Avatar name */}
        {!isUser && (avatar || message.avatarName) && (
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-sm font-semibold", sig?.text || "text-muted-foreground")}>
              {message.avatarName || avatar?.name}
            </span>
            {isExpert && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-medium">
                EXPERT
              </span>
            )}
            {isStreaming && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "text-sm leading-relaxed prose prose-sm max-w-none",
          isUser ? "prose-invert" : ""
        )}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current opacity-50 animate-pulse ml-0.5" />
          )}
        </div>

        {/* Token count */}
        {!isUser && message.tokensUsed && !isStreaming && (
          <div className="text-[10px] text-muted-foreground mt-2 text-right opacity-60">
            {message.tokensUsed.toLocaleString()} tokens
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Emoji Picker Component
// =============================================================================

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏", "💪", "🦾"],
  },
  {
    name: "Business",
    emojis: ["💼", "📈", "📉", "📊", "💰", "💵", "💸", "💳", "🏦", "📱", "💻", "🖥️", "📧", "📝", "📋", "📌", "📍", "🎯", "✅", "❌", "⭐", "🏆", "🥇", "💡", "🔑"],
  },
  {
    name: "Objects",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "🔥", "⚡", "💥", "✨", "🎉", "🎊", "🚀", "⏰", "📅", "🔔", "🔒", "🔓", "🏠", "🌟", "💎", "🎁"],
  },
];

function EmojiPicker({ isOpen, onClose, onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  return (
    <motion.div
      data-emoji-picker
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
    >
      {/* Category tabs */}
      <div className="flex border-b border-border bg-muted/30">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(idx)}
            className={cn(
              "flex-1 px-2 py-2 text-xs font-medium transition-colors",
              activeCategory === idx
                ? "text-primary border-b-2 border-primary bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Attachment Menu Component
// =============================================================================

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: "image" | "file") => void;
}

function AttachmentMenu({ isOpen, onClose, onSelectType }: AttachmentMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      data-attachment-menu
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
    >
      <div className="p-1">
        <button
          onClick={() => {
            onSelectType("image");
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Image className="w-4 h-4 text-emerald-500" />
          <span>Upload Image</span>
        </button>
        <button
          onClick={() => {
            onSelectType("file");
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Upload Document</span>
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Expert Summon Modal
// =============================================================================

interface ExpertSummonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummon: (domain: string, reason: string) => void;
  isLoading: boolean;
}

function ExpertSummonModal({ isOpen, onClose, onSummon, isLoading }: ExpertSummonModalProps) {
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");

  const domains = [
    { id: "insurance", label: "Insurance", emoji: "🏥" },
    { id: "compliance", label: "Compliance", emoji: "⚖️" },
    { id: "sales", label: "Sales", emoji: "📈" },
    { id: "mindset", label: "Mindset", emoji: "🧠" },
    { id: "objections", label: "Objections", emoji: "🎯" },
    { id: "persuasion", label: "Persuasion", emoji: "💫" },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl border border-border shadow-lg w-full max-w-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold text-foreground">Summon Expert</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bring in a specialist for expert input
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {domains.map(d => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={cn(
                  "p-3 rounded-xl text-center transition-all",
                  domain === d.id
                    ? "bg-cyan-500/20 border border-cyan-500/40"
                    : "bg-muted/50 border border-border hover:bg-muted"
                )}
              >
                <span className="block text-lg mb-1">{d.emoji}</span>
                <span className={cn(
                  "text-xs",
                  domain === d.id ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"
                )}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need this expert?"
            className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 mb-4"
          />

          <button
            onClick={() => {
              if (domain) {
                onSummon(domain, reason);
                setDomain("");
                setReason("");
              }
            }}
            disabled={!domain || isLoading}
            className={cn(
              "w-full py-2.5 rounded-xl font-medium text-sm transition-all",
              domain && !isLoading
                ? "bg-cyan-500 text-white hover:bg-cyan-400"
                : "bg-muted text-muted-foreground cursor-not-allowed"
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
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DecisionChamber({ className, onExit }: DecisionChamberProps) {
  const [inputValue, setInputValue] = useState("");
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Store state
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore((state) => state.selectedAvatarIds);
  const isLoading = useAvatarCouncilStore((state) => state.isLoading);
  const error = useAvatarCouncilStore((state) => state.error);
  const sendMessage = useAvatarCouncilStore((state) => state.sendMessage);
  const clearMessages = useAvatarCouncilStore((state) => state.clearMessages);
  const isRouting = useAvatarCouncilStore((state) => state.isRouting);
  const isSummoningChatExpert = useAvatarCouncilStore((state) => state.isSummoningChatExpert);
  const chatExpertStreaming = useAvatarCouncilStore((state) => state.chatExpertStreaming);
  const summonChatExpert = useAvatarCouncilStore((state) => state.summonChatExpert);

  // Chat thread actions
  const {
    chatThreads,
    currentThreadId,
    activeAvatarId,
    createNewThread,
    switchThread,
    deleteThread,
    setActiveAvatar,
  } = useChatThreadActions();

  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();
  const connectionStatus = useConnectionStatus();

  const isConnected = connectionStatus === "connected";

  // Selected advisors
  const selectedAdvisors = useMemo(
    () => avatars.filter((a) => selectedAvatarIds.includes(a.id)),
    [avatars, selectedAvatarIds]
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, chatExpertStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-emoji-picker]') && !target.closest('[data-attachment-menu]')) {
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
      }
    };

    if (showEmojiPicker || showAttachmentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker, showAttachmentMenu]);

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    sendMessage(inputValue.trim());
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle expert summon
  const handleSummonExpert = (domain: string, reason: string) => {
    const primaryAdvisor = selectedAdvisors[0];
    if (primaryAdvisor) {
      summonChatExpert(primaryAdvisor.id, domain, reason);
      setShowExpertModal(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // Handle file selection
  const handleFileSelect = (type: "image" | "file") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : ".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx";
      fileInputRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just show the file name in the input
      // In a full implementation, you would upload the file and attach it to the message
      setInputValue(prev => prev + (prev ? " " : "") + `[Attached: ${file.name}]`);
      console.log("[DecisionChamber] File selected:", file.name, file.type, file.size);
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  // Handle new chat - saves current chat and starts fresh
  const handleNewChat = useCallback(() => {
    createNewThread(selectedAvatarIds);
    // Note: createNewThread already saves current messages and clears for new chat
  }, [createNewThread, selectedAvatarIds]);

  // Handle avatar click (for selecting which avatar to talk to)
  const handleAvatarClick = useCallback((avatarId: string) => {
    if (selectedAdvisors.length > 1) {
      // Toggle: if already active, clear. Otherwise set.
      setActiveAvatar(activeAvatarId === avatarId ? null : avatarId);
    }
  }, [selectedAdvisors.length, activeAvatarId, setActiveAvatar]);

  // Get avatar for message
  const getAvatarForMessage = (msg: AvatarMessage) => {
    if (!msg.avatarId) return undefined;
    return avatars.find(a => a.id === msg.avatarId);
  };

  return (
    <div className={cn(
      "h-full flex bg-background relative",
      className
    )}>
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        avatars={avatars}
        selectedAvatarIds={selectedAvatarIds}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Exit</span>
            </button>

            <div className="flex items-center gap-3">
              <AdvisorPills
                advisors={selectedAdvisors}
                streamingAvatarId={streamingAvatarId}
                activeAvatarId={activeAvatarId}
                onAvatarClick={handleAvatarClick}
              />
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="New chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-red-500"
              )} />
            </div>
          </div>
        </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {/* Empty State */}
          {messages.length === 0 && !streamingAvatarId && !isRouting && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center p-8"
            >
              <div className="text-center max-w-md">
                {/* Show selected advisor(s) with big avatar */}
                {selectedAdvisors.length > 0 ? (
                  <div className="flex justify-center gap-4 mb-6">
                    {selectedAdvisors.map((advisor) => {
                      const sig = getSignature(advisor.slug);
                      return (
                        <motion.div
                          key={advisor.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className={cn(
                            "w-24 h-24 rounded-2xl overflow-hidden shadow-lg mb-3",
                            sig.glow
                          )}>
                            {advisor.avatarImageUrl ? (
                              <img
                                src={advisor.avatarImageUrl}
                                alt={advisor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={cn("w-full h-full flex items-center justify-center text-2xl font-bold text-white", sig.bg)}>
                                {advisor.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-foreground">{advisor.name}</span>
                          <span className={cn("text-xs", sig.text)}>Ready to help</span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center border border-border">
                    <Sparkles className="w-10 h-10 text-cyan-500/60" />
                  </div>
                )}

                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {selectedAdvisors.length > 0
                    ? `Chat with ${selectedAdvisors.map(a => a.name.split(' ')[0]).join(' & ')}`
                    : "Start a Conversation"}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedAdvisors.length > 0
                    ? "Your selected advisors are ready to help you with any question."
                    : "Type your question below to get started."}
                </p>

                {/* Quick suggestions */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["How do I handle objections?", "Best closing techniques", "Compliance tips"].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="px-4 py-2 rounded-full text-sm bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Routing indicator */}
          {isRouting && (
            <RoutingIndicator key="routing" />
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              avatar={getAvatarForMessage(msg)}
            />
          ))}

          {/* Streaming message */}
          {streamingAvatarId && (
            <MessageBubble
              key="streaming"
              message={{
                id: "streaming",
                sessionId: "",
                role: "avatar",
                avatarId: streamingAvatarId,
                content: "",
                tokensUsed: null,
                createdAt: new Date().toISOString(),
              }}
              avatar={avatars.find(a => a.id === streamingAvatarId)}
              isStreaming
              streamingContent={streamingContent}
            />
          )}

          {/* Expert streaming */}
          {isSummoningChatExpert && chatExpertStreaming && (
            <motion.div
              key="expert-streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 px-4 py-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-md px-4 py-3 bg-card border border-cyan-500/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Expert Contributing</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
                <div className="text-sm text-foreground">
                  {chatExpertStreaming}
                  <span className="inline-block w-1.5 h-4 bg-current opacity-50 animate-pulse ml-0.5" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card/50">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {/* Main input row */}
          <div className="flex gap-2 items-end">
            {/* Left side action buttons */}
            <div className="flex gap-1">
              {/* Attachment button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentMenu(!showAttachmentMenu);
                    setShowEmojiPicker(false);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    showAttachmentMenu
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  <AttachmentMenu
                    isOpen={showAttachmentMenu}
                    onClose={() => setShowAttachmentMenu(false)}
                    onSelectType={handleFileSelect}
                  />
                </AnimatePresence>
              </div>

              {/* Emoji button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachmentMenu(false);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    showEmojiPicker
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onSelect={handleEmojiSelect}
                  />
                </AnimatePresence>
              </div>

              {/* Expert summon button */}
              {selectedAdvisors.length > 0 && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowExpertModal(true)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    showExpertModal
                      ? "bg-cyan-500/20 text-cyan-500"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title="Summon expert"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Text input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setShowEmojiPicker(false);
                  setShowAttachmentMenu(false);
                }}
                placeholder={
                  !isConnected
                    ? "Connecting..."
                    : activeAvatarId
                    ? `Message ${avatars.find(a => a.id === activeAvatarId)?.name.split(' ')[0] || 'avatar'}...`
                    : selectedAdvisors.length > 0
                    ? `Message ${selectedAdvisors.length > 1 ? 'the council' : selectedAdvisors[0].name.split(' ')[0]}...`
                    : "Ask a question..."
                }
                disabled={!isConnected || isLoading}
                className={cn(
                  "w-full px-4 py-3 rounded-xl resize-none",
                  "bg-muted/50 border border-border",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-ring focus:bg-muted/70",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all"
                )}
                rows={1}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || !isConnected || isLoading}
              className={cn(
                "p-3 rounded-xl transition-all",
                inputValue.trim() && isConnected && !isLoading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

        {/* Expert Summon Modal */}
        <AnimatePresence>
          <ExpertSummonModal
            isOpen={showExpertModal}
            onClose={() => setShowExpertModal(false)}
            onSummon={handleSummonExpert}
            isLoading={isSummoningChatExpert}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DecisionChamber;
