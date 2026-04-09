import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { ClaudeChatInput, type AvatarOption } from "@/components/ui/claude-style-chat-input";
import { useAgentStore } from "@/lib/agentStore";
import ReactMarkdown from "react-markdown";
// Simple fade-in-up animation props for motion elements
const fadeUp = {
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

// =============================================================================
// Types
// =============================================================================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  avatarName?: string;
  timestamp: Date;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function AgentAvatarCouncil() {
  const { currentUser } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(false);

  // --- Fetch avatars from API ---
  const { data: avatarsData } = useQuery<any>({
    queryKey: ["/api/avatar-council/avatars?active=true"],
  });

  // Map to AvatarOption format for the chat input
  const avatarOptions: AvatarOption[] = useMemo(() => {
    const list = avatarsData?.avatars || avatarsData || [];
    if (!Array.isArray(list)) return [];
    return list.map((a: any) => ({
      id: a.id,
      name: a.name,
      description:
        (a.expertiseDomains || a.expertise_domains || []).slice(0, 3).join(", ") ||
        a.description ||
        "",
    }));
  }, [avatarsData]);

  // Auto-select first avatar
  useEffect(() => {
    if (avatarOptions.length > 0 && !selectedAvatarId) {
      setSelectedAvatarId(avatarOptions[0].id);
    }
  }, [avatarOptions, selectedAvatarId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Create session ---
  const createSession = async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    try {
      const res = await fetch("/api/avatar-council/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "single", avatarIds: [selectedAvatarId] }),
      });
      const data = await res.json();
      const id = data.session?.id || data.id;
      setSessionId(id);
      return id;
    } catch {
      return null;
    }
  };

  // --- Send message ---
  const handleSendMessage = async ({ message, avatar }: any) => {
    if (!message?.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsWaiting(true);

    try {
      const sid = await createSession();
      const res = await fetch("/api/avatar-council/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: sid,
          message,
          avatarId: avatar || selectedAvatarId,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "system",
            content:
              data.error ||
              "AI responses require configuration. Contact your administrator.",
            timestamp: new Date(),
          },
        ]);
      } else {
        const content =
          data.response?.content ||
          data.content ||
          data.message ||
          "No response received.";
        const avatarName =
          data.response?.avatarName || data.avatarName || "AI Advisor";
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content,
            avatarName,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          content: "Failed to get response. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  // --- Quick prompts ---
  const quickPrompts = [
    {
      label: "Objection handling",
      prompt:
        "How should I handle the objection 'I need to think about it' when closing a life insurance sale?",
    },
    {
      label: "Underwriting help",
      prompt:
        "What are the underwriting guidelines for a client with Type 2 diabetes applying for term life?",
    },
    {
      label: "Sales strategy",
      prompt:
        "Give me a proven sales strategy for selling IUL policies to high-income professionals.",
    },
    {
      label: "Compliance check",
      prompt:
        "What compliance requirements should I be aware of when replacing an existing life insurance policy?",
    },
  ];

  // --- Greeting ---
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = currentUser?.name?.split(" ")[0] || "Agent";

  const hasMessages = messages.length > 0;

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <AgentLoungeLayout>
      <div className="flex flex-col min-h-[calc(100vh-120px)]">
        {!hasMessages ? (
          /* ============ EMPTY STATE — Claude-style centered layout ============ */
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
            {/* Logo */}
            <motion.div {...fadeUp} className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-3 9H8c0-3-3-5-3-9a7 7 0 0 1 7-7z" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
              </div>
            </motion.div>

            {/* Greeting */}
            <motion.h1
              {...fadeUp}
              className="text-3xl sm:text-4xl font-light text-gray-800 mb-3 tracking-tight text-center"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {greeting},{" "}
              <span className="relative inline-block">{firstName}</span>
            </motion.h1>
            <motion.p {...fadeUp} className="text-gray-500 mb-10 text-center">
              Your AI insurance advisors are ready to help
            </motion.p>

            {/* Chat Input */}
            <ClaudeChatInput
              onSendMessage={handleSendMessage}
              avatars={avatarOptions}
              selectedAvatar={selectedAvatarId}
              onAvatarChange={setSelectedAvatarId}
              placeholder="Ask your AI advisors anything..."
              isLoading={isWaiting}
            />

            {/* Quick Prompts */}
            <motion.div
              {...fadeUp}
              className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto px-4"
            >
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() =>
                    handleSendMessage({
                      message: qp.prompt,
                      avatar: selectedAvatarId,
                      files: [],
                      pastedContent: [],
                      isThinkingEnabled: false,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-transparent border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150"
                >
                  {qp.label}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* ============ CHAT VIEW — messages + input at bottom ============ */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 ${
                      msg.role === "user"
                        ? "flex justify-end"
                        : msg.role === "system"
                          ? "flex justify-center"
                          : "flex justify-start"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-violet-50 text-gray-800 text-[15px] leading-relaxed">
                        {msg.content}
                      </div>
                    ) : msg.role === "system" ? (
                      <div className="max-w-[80%] px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm text-center">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">
                              {msg.avatarName?.[0] || "A"}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {msg.avatarName || "AI Advisor"}
                          </span>
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-[15px] leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking indicator */}
              {isWaiting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input pinned to bottom */}
            <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent">
              <ClaudeChatInput
                onSendMessage={handleSendMessage}
                avatars={avatarOptions}
                selectedAvatar={selectedAvatarId}
                onAvatarChange={setSelectedAvatarId}
                placeholder="Ask a follow-up..."
                isLoading={isWaiting}
              />
            </div>
          </>
        )}
      </div>
    </AgentLoungeLayout>
  );
}
