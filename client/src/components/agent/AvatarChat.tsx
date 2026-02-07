import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import {
  useAvatarCouncilStore,
  useMessages,
  useStreamingAvatarId,
  useStreamingContent,
  type AvatarMessage,
  type Avatar,
} from "@/lib/avatarCouncilStore";
import { AvatarReveal, RoutingIndicator, CompactAvatarSelector } from "./AvatarReveal";
import ReactMarkdown from "react-markdown";

// Map avatar slugs to icons
const avatarIcons: Record<string, React.ElementType> = {
  "insurance-expert": Brain,
  "sales-closer": Target,
  "mindset-coach": Heart,
  "compliance-specialist": Shield,
  "wolf-closer": Flame,
  "objection-handler": MessageSquare,
};

// Avatar color schemes
const avatarColors: Record<string, string> = {
  "insurance-expert": "bg-blue-500",
  "sales-closer": "bg-orange-500",
  "mindset-coach": "bg-purple-500",
  "compliance-specialist": "bg-emerald-500",
  "wolf-closer": "bg-red-500",
  "objection-handler": "bg-amber-500",
};

// Generate rationale based on question keywords
function generateRationale(question: string, avatar: Avatar): string {
  const q = question.toLowerCase();

  // Check for specific domain matches
  if (avatar.slug === "insurance-expert") {
    if (q.includes("policy") || q.includes("coverage") || q.includes("underwriting")) {
      return "I've been selected because your question involves policy structures and underwriting criteria.";
    }
    if (q.includes("term") || q.includes("whole life") || q.includes("universal")) {
      return "I've been selected because your question involves comparing insurance product types.";
    }
    return "I've been selected because your question relates to insurance knowledge and product details.";
  }

  if (avatar.slug === "sales-closer") {
    if (q.includes("close") || q.includes("sale") || q.includes("deal")) {
      return "I've been selected because your question involves closing techniques and sales strategy.";
    }
    return "I've been selected because your question relates to sales execution and revenue generation.";
  }

  if (avatar.slug === "mindset-coach") {
    if (q.includes("discouraged") || q.includes("rejected") || q.includes("motivation")) {
      return "I've been selected because your question touches on motivation and mental resilience.";
    }
    if (q.includes("fear") || q.includes("nervous") || q.includes("confidence")) {
      return "I've been selected because your question involves building confidence and overcoming fear.";
    }
    return "I've been selected because your question relates to mindset and peak performance.";
  }

  if (avatar.slug === "compliance-specialist") {
    if (q.includes("legal") || q.includes("compliance") || q.includes("regulation")) {
      return "I've been selected because your question involves regulatory and compliance requirements.";
    }
    if (q.includes("say") || q.includes("claim") || q.includes("promise")) {
      return "I've been selected because your question involves disclosure and compliant communication.";
    }
    return "I've been selected because your question requires compliance expertise.";
  }

  if (avatar.slug === "objection-handler") {
    if (q.includes("objection") || q.includes("handle") || q.includes("respond")) {
      return "I've been selected because your question involves handling prospect objections.";
    }
    if (q.includes("think about it") || q.includes("call back") || q.includes("not interested")) {
      return "I've been selected because you're dealing with a common stall or rejection pattern.";
    }
    return "I've been selected because your question involves overcoming resistance.";
  }

  if (avatar.slug === "wolf-closer") {
    if (q.includes("aggressive") || q.includes("push") || q.includes("pressure")) {
      return "I've been selected because your question involves high-conviction persuasion techniques.";
    }
    return "I've been selected because your question requires assertive sales methodology.";
  }

  return "I've been selected as the best match for your question.";
}

// Simple routing logic - picks best avatar based on keywords
function routeToAvatar(question: string, avatars: Avatar[]): Avatar | null {
  if (avatars.length === 0) return null;

  const q = question.toLowerCase();

  // Keyword matching
  const keywordMap: Record<string, string[]> = {
    "insurance-expert": ["policy", "coverage", "underwriting", "term", "whole life", "premium", "beneficiary", "death benefit"],
    "sales-closer": ["close", "sale", "deal", "revenue", "pitch", "presentation", "appointment"],
    "mindset-coach": ["motivation", "discouraged", "rejected", "fear", "confidence", "mindset", "nervous", "anxiety", "belief"],
    "compliance-specialist": ["legal", "compliance", "regulation", "lawsuit", "claim", "disclosure", "license"],
    "objection-handler": ["objection", "handle", "respond", "think about it", "not interested", "call back", "spouse", "money"],
    "wolf-closer": ["aggressive", "push", "pressure", "urgency", "scarcity", "bold"],
  };

  let bestMatch: Avatar | null = null;
  let bestScore = 0;

  for (const avatar of avatars) {
    const keywords = keywordMap[avatar.slug] || [];
    let score = 0;

    for (const keyword of keywords) {
      if (q.includes(keyword)) {
        score += 1;
      }
    }

    // Add priority as tiebreaker
    score += avatar.responsePriority * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = avatar;
    }
  }

  // If no keyword match, return highest priority avatar
  if (!bestMatch || bestScore < 1) {
    bestMatch = avatars.reduce((best, current) =>
      current.responsePriority > best.responsePriority ? current : best
    , avatars[0]);
  }

  return bestMatch;
}

interface MessageBubbleProps {
  message: AvatarMessage;
  avatars: Avatar[];
  isStreaming?: boolean;
  streamingContent?: string;
}

function MessageBubble({ message, avatars, isStreaming, streamingContent }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatar = avatars.find(a => a.id === message.avatarId);
  const avatarSlug = avatar?.slug || "";
  const Icon = avatarIcons[avatarSlug] || Bot;
  const bgColor = avatarColors[avatarSlug] || "bg-gray-500";

  const content = isStreaming ? streamingContent || "" : message.content;

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-primary" : bgColor
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted rounded-tl-sm"
      )}>
        {/* Avatar Name */}
        {!isUser && avatar && (
          <div className="font-semibold text-sm mb-1 flex items-center gap-2">
            {avatar.name}
            {isStreaming && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
          </div>
        )}

        {/* Message Text */}
        <div className={cn(
          "text-sm prose prose-sm max-w-none",
          isUser ? "prose-invert" : ""
        )}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
          )}
        </div>

        {/* Token Usage */}
        {!isUser && message.tokensUsed && !isStreaming && (
          <div className="text-xs text-muted-foreground mt-2 opacity-60">
            {message.tokensUsed} tokens
          </div>
        )}
      </div>
    </div>
  );
}

type ChatState = "idle" | "routing" | "reveal" | "chatting";
type SelectorMode = "switch" | "add" | null;

interface AvatarChatProps {
  className?: string;
}

export function AvatarChat({ className }: AvatarChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [routedAvatar, setRoutedAvatar] = useState<Avatar | null>(null);
  const [routingRationale, setRoutingRationale] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [selectorMode, setSelectorMode] = useState<SelectorMode>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get store state with individual selectors
  const avatars = useAvatarCouncilStore((state) => state.avatars);
  const selectedAvatarIds = useAvatarCouncilStore((state) => state.selectedAvatarIds);
  const connectionStatus = useAvatarCouncilStore((state) => state.connectionStatus);
  const isLoading = useAvatarCouncilStore((state) => state.isLoading);
  const error = useAvatarCouncilStore((state) => state.error);

  // Get actions from store
  const sendMessage = useAvatarCouncilStore((state) => state.sendMessage);
  const clearMessages = useAvatarCouncilStore((state) => state.clearMessages);
  const selectAvatar = useAvatarCouncilStore((state) => state.selectAvatar);
  const clearSelectedAvatars = useAvatarCouncilStore((state) => state.clearSelectedAvatars);

  const messages = useMessages();
  const streamingAvatarId = useStreamingAvatarId();
  const streamingContent = useStreamingContent();

  // Compute if we need auto-routing
  const needsAutoRouting = selectedAvatarIds.length === 0;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Handle the routing flow
  const handleAutoRoute = async (question: string) => {
    setChatState("routing");
    setPendingQuestion(question);

    // Simulate routing delay (800ms minimum)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Route to best avatar
    const selectedAvatar = routeToAvatar(question, avatars);

    if (selectedAvatar) {
      setRoutedAvatar(selectedAvatar);
      setRoutingRationale(generateRationale(question, selectedAvatar));
      setChatState("reveal");
    } else {
      // No avatar available, just send the message
      setChatState("chatting");
      sendMessage(question);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || connectionStatus !== "connected") return;

    const question = inputValue.trim();
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // If no avatar selected and this is the first message, do auto-routing
    if (needsAutoRouting && messages.length === 0 && chatState === "idle") {
      handleAutoRoute(question);
    } else {
      // Otherwise, just send the message
      setChatState("chatting");
      sendMessage(question);
    }
  };

  const handleContinue = () => {
    if (routedAvatar) {
      // Select the routed avatar
      clearSelectedAvatars();
      selectAvatar(routedAvatar.id);
    }
    setChatState("chatting");
    // Send the pending question
    if (pendingQuestion) {
      sendMessage(pendingQuestion);
      setPendingQuestion("");
    }
  };

  const handleAddAdvisor = () => {
    setSelectorMode("add");
  };

  const handleSwitch = () => {
    setSelectorMode("switch");
  };

  const handleSelectorSelect = (avatar: Avatar) => {
    if (selectorMode === "switch") {
      setRoutedAvatar(avatar);
      setRoutingRationale(generateRationale(pendingQuestion, avatar));
    } else if (selectorMode === "add") {
      // Add second advisor - for now just switch to the new one
      // In a full implementation, this would enable multi-avatar mode
      if (routedAvatar) {
        clearSelectedAvatars();
        selectAvatar(routedAvatar.id);
        selectAvatar(avatar.id);
      }
      setChatState("chatting");
      if (pendingQuestion) {
        sendMessage(pendingQuestion);
        setPendingQuestion("");
      }
    }
    setSelectorMode(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isConnected = connectionStatus === "connected";

  return (
    <Card className={cn("flex flex-col h-full border-0 shadow-none bg-transparent", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Empty State */}
          {messages.length === 0 && chatState === "idle" && !streamingAvatarId && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center text-muted-foreground text-center"
            >
              <div>
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">Ask anything</p>
                <p className="text-sm opacity-75">
                  {needsAutoRouting
                    ? "We'll route your question to the best advisor."
                    : "Your selected advisor is ready."}
                </p>
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
              className="space-y-4"
            >
              {/* Show user's question */}
              <MessageBubble
                message={{
                  id: "pending",
                  sessionId: "",
                  role: "user",
                  avatarId: null,
                  content: pendingQuestion,
                  tokensUsed: null,
                  createdAt: new Date().toISOString(),
                }}
                avatars={avatars}
              />
              <RoutingIndicator />
            </motion.div>
          )}

          {/* Reveal State */}
          {chatState === "reveal" && routedAvatar && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Show user's question */}
              <MessageBubble
                message={{
                  id: "pending",
                  sessionId: "",
                  role: "user",
                  avatarId: null,
                  content: pendingQuestion,
                  tokensUsed: null,
                  createdAt: new Date().toISOString(),
                }}
                avatars={avatars}
              />

              {/* Show selector or reveal card */}
              {selectorMode ? (
                <CompactAvatarSelector
                  avatars={avatars}
                  selectedId={routedAvatar.id}
                  onSelect={handleSelectorSelect}
                  onClose={() => setSelectorMode(null)}
                />
              ) : (
                <AvatarReveal
                  avatar={routedAvatar}
                  rationale={routingRationale}
                  onContinue={handleContinue}
                  onAddAdvisor={handleAddAdvisor}
                  onSwitch={handleSwitch}
                />
              )}
            </motion.div>
          )}

          {/* Chatting State */}
          {(chatState === "chatting" || messages.length > 0) && chatState !== "routing" && chatState !== "reveal" && (
            <motion.div
              key="chatting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  avatars={avatars}
                />
              ))}

              {/* Streaming Message */}
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

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !isConnected
                ? "Connecting..."
                : chatState === "reveal"
                ? "Confirm advisor selection above..."
                : "Ask a question... (Enter to send)"
            }
            disabled={!isConnected || isLoading || chatState === "routing" || chatState === "reveal"}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || !isConnected || isLoading || chatState === "routing" || chatState === "reveal"}
            className="h-11 px-4"
          >
            {isLoading || chatState === "routing" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default AvatarChat;
