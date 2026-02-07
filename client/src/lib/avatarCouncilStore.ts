import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

// =============================================================================
// Types
// =============================================================================

export interface Avatar {
  id: string;
  name: string;
  slug: string;
  domainExpertise: string[];
  speakingStyle: string;
  debateStyle: "analytical" | "aggressive" | "empathetic";
  responsePriority: number;
  systemPrompt: string;
  avatarImageUrl: string | null;
  voiceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  legacyTitle?: string; // e.g., "THE ORACLE OF OMAHA"
}

export interface AvatarMessage {
  id: string;
  sessionId: string;
  role: "user" | "avatar" | "system";
  avatarId: string | null;
  avatarName?: string;
  content: string;
  tokensUsed: number | null;
  createdAt: string;
  isStreaming?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  mode: "single" | "multi" | "debate";
  avatarsUsed: string[];
  isActive: boolean;
  createdAt: string;
  endedAt: string | null;
}

// =============================================================================
// Chat Thread Types (for chat history sidebar)
// =============================================================================

export interface ChatThread {
  id: string;
  title: string;  // Auto-generated from first message or "New Chat"
  avatarIds: string[];  // Which avatars are in this chat
  messages: AvatarMessage[];
  createdAt: string;
  updatedAt: string;
  preview: string;  // First ~50 chars of last message
}

export interface DebateSession {
  id: string;
  sessionId: string;
  topic: string;
  avatar1Id: string;
  avatar2Id: string;
  participantIds?: string[];  // All debate participants (2-4 avatars)
  moderatorId?: string;
  currentTurn: number;
  maxTurns: number;
  status: "active" | "paused" | "completed" | "interrupted";
  createdAt: string;
  completedAt: string | null;
}

export type DebateStance =
  | "agrees"
  | "partially_agrees"
  | "disagrees"
  | "rebuts"
  | "new_angle"
  | "synthesizes";

// =============================================================================
// Phase-Based Debate Types
// =============================================================================

export type DebatePhase =
  | "OPENING"
  | "ARGUMENTS"
  | "REBUTTALS"
  | "CLOSING"
  | "SUMMARY"
  | "COMPLETED";

export interface PhaseConfig {
  phase: DebatePhase;
  label?: string;
  description?: string;
  turnsPerAvatar: number;
  isSequential?: boolean;
  enableThinking?: boolean;
  promptType?: "opening" | "argument" | "rebuttal" | "closing" | "summary";
}

export interface AvatarThinkingState {
  isThinking: boolean;
  currentThought: string;
  thoughts: string[];
  startedAt: string | null;
}

export interface DebateTurn {
  id: string;
  turnNumber: number;
  avatarId: string;
  avatarName: string;
  content: string;
  phase: DebatePhase;
  stance?: DebateStance;
  keyPoints?: string[];
  tokensUsed?: number;
  startedAt: string;
  completedAt: string | null;
}

export interface PhaseTransition {
  phase: DebatePhase;
  startedAt: string;
  completedAt: string | null;
  turnsCompleted: number;
}

export interface ComprehensiveDebateSummary {
  topic: string;
  totalTurns: number;
  totalDuration: string;

  executiveSummary: string;

  avatar1Analysis: {
    id: string;
    name: string;
    position: string;
    keyArguments: string[];
    strengths: string[];
    weaknesses: string[];
    notableQuotes: string[];
  };

  avatar2Analysis: {
    id: string;
    name: string;
    position: string;
    keyArguments: string[];
    strengths: string[];
    weaknesses: string[];
    notableQuotes: string[];
  };

  phaseBreakdown: {
    opening: { summary: string; keyPoints: string[] };
    arguments: { rounds: number; majorTopics: string[] };
    rebuttals: { directChallenges: string[]; effectiveCounters: string[] };
    closing: { finalPositions: string[] };
  };

  keyConsensusPoints: string[];
  unresolvedDisagreements: string[];

  actionableInsights: string[];
  recommendedNextSteps: string[];

  overallWinner?: {
    avatarId: string;
    avatarName: string;
    reason: string;
  };
}

export interface DebateTurnMeta {
  turnNumber: number;
  avatarId: string;
  stance?: DebateStance;
  targetClaim?: string;
  roundNumber: number;
}

export interface DebateSummary {
  topic: string;
  totalTurns: number;
  executiveSummary: string;
  keyConsensus: string[];
  unresolvedPoints: string[];
  // Backend sends nested structure, frontend flattens for UI
  avatar1Points: string[];
  avatar2Points: string[];
  // Full avatar data from backend
  avatar1?: {
    id: string;
    name: string;
    turnCount: number;
    totalTokens: number;
    keyPoints: string[];
    stances: Array<{ stance: string; targetClaim?: string; confidence: number }>;
  };
  avatar2?: {
    id: string;
    name: string;
    turnCount: number;
    totalTokens: number;
    keyPoints: string[];
    stances: Array<{ stance: string; targetClaim?: string; confidence: number }>;
  };
  messages?: Array<{
    avatarId: string;
    avatarName: string;
    content: string;
    turnNumber: number;
    stance?: { stance: string; targetClaim?: string; confidence: number };
  }>;
}

export interface DebateFormat {
  id: "quick" | "standard" | "extended";
  label: string;
  roundsPerAvatar: number;
  totalTurns: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";
export type ResponseMode = "single" | "multi" | "debate";

// =============================================================================
// Network Communication Types
// =============================================================================

export type NetworkMessageType = "direct" | "broadcast" | "insight" | "query" | "response" | "alert" | "sync";

export interface NetworkMessage {
  id: string;
  type: NetworkMessageType;
  fromAvatarId: string;
  fromAvatarName: string;
  fromAvatarSlug: string;
  toAvatarId: string | null;
  toAvatarName: string | null;
  content: string;
  timestamp: string;
}

export interface NetworkActivityEvent {
  id: string;
  type: "message" | "connection" | "disconnection" | "thinking" | "broadcast";
  fromAvatarId: string;
  toAvatarId: string | null;
  timestamp: string;
  duration?: number;
  intensity?: number;
}

export interface AvatarNetworkStatus {
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  isOnline: boolean;
  lastActivity: string;
  messagesSent: number;
  messagesReceived: number;
}

export interface NetworkState {
  avatars: AvatarNetworkStatus[];
  recentActivity: NetworkActivityEvent[];
  stats: {
    totalMessages: number;
    messagesLastMinute: number;
    activeConnections: number;
  };
}

// =============================================================================
// Expert Summoning Types
// =============================================================================

export interface ExpertSummonRequest {
  id: string;
  debateId: string;
  requestingAvatarId: string;
  requestingAvatarName: string;
  domainNeeded: string;
  reason: string;
  contextSnippet: string;
  timestamp: string;
  status: "pending" | "accepted" | "declined" | "completed";
}

export interface ExpertContribution {
  id: string;
  summonRequestId: string;
  debateId: string;
  expertId: string;
  expertName: string;
  expertSlug: string;
  contribution: string;
  tokensUsed: number;
  timestamp: string;
  stayInDebate: boolean;
}

export interface SummonedExpert {
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  avatarImageUrl?: string;
  domainExpertise: string[];
  summonedAt: string;
  contribution?: ExpertContribution;
}

export interface SummonState {
  isLoading: boolean;
  pendingRequest: ExpertSummonRequest | null;
  summonedExpert: SummonedExpert | null;
  contribution: ExpertContribution | null;
  streamingContribution: string;
  error: string | null;
}

// Routing result from server
export interface RoutingResult {
  selectedAvatars: Array<{
    id: string;
    name: string;
    slug: string;
    avatarImageUrl: string | null;
    domainExpertise: string[];
    debateStyle: string;
  }>;
  mode: ResponseMode;
  intent: {
    primaryDomain: string;
    secondaryDomains: string[];
    questionType: string;
    confidence: number;
  };
  reasoning: string;
  scores: Array<{
    avatarId: string;
    avatarName: string;
    totalScore: number;
  }>;
}

// Chat expert contribution
export interface ChatExpertContribution {
  expertId: string;
  expertName: string;
  expertSlug: string;
  content: string;
  domain: string;
  timestamp: string;
}

// =============================================================================
// Reconnection Config
// =============================================================================

const RECONNECT_CONFIG = {
  maxAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

// =============================================================================
// Store State Interface
// =============================================================================

interface QueuedMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface AvatarCouncilState {
  // Avatars
  avatars: Avatar[];
  selectedAvatarIds: string[];

  // Session
  currentSession: Session | null;
  messages: AvatarMessage[];

  // Debate
  currentDebate: DebateSession | null;
  debateTurnMeta: DebateTurnMeta[];
  debateSummary: DebateSummary | null;
  debateKeyPoints: { avatar1: string[]; avatar2: string[] };

  // Phase-Based Debate
  currentPhase: DebatePhase | null;
  debatePhases: PhaseConfig[];
  phaseHistory: PhaseTransition[];
  debateTurns: DebateTurn[];
  thinkingState: {
    avatar1: AvatarThinkingState;
    avatar2: AvatarThinkingState;
  };
  comprehensiveSummary: ComprehensiveDebateSummary | null;
  isGeneratingSummary: boolean;

  // UI State
  mode: ResponseMode;
  isLoading: boolean;
  error: string | null;
  lastError: { message: string; timestamp: number } | null;

  // WebSocket
  connectionStatus: ConnectionStatus;
  ws: WebSocket | null;
  reconnectAttempts: number;
  reconnectTimeoutId: NodeJS.Timeout | null;
  messageQueue: QueuedMessage[];
  userId: string;
  isAdmin: boolean;

  // Streaming
  streamingAvatarId: string | null;
  streamingContent: string;
  streamingError: boolean;

  // Network Communication
  networkState: NetworkState | null;
  networkSubscribed: boolean;
  networkActivity: NetworkActivityEvent[];

  // Actions
  setAvatars: (avatars: Avatar[]) => void;
  selectAvatar: (avatarId: string) => void;
  deselectAvatar: (avatarId: string) => void;
  clearSelectedAvatars: () => void;
  setMode: (mode: ResponseMode) => void;

  setSession: (session: Session | null) => void;
  addMessage: (message: AvatarMessage) => void;
  updateStreamingMessage: (avatarId: string, content: string) => void;
  finalizeStreamingMessage: (avatarId: string, content: string, tokensUsed?: number) => void;
  clearMessages: () => void;

  setDebate: (debate: DebateSession | null) => void;
  updateDebateTurn: (turn: number, status?: DebateSession["status"]) => void;
  addTurnMeta: (meta: DebateTurnMeta) => void;
  setDebateSummary: (summary: DebateSummary | null) => void;
  updateKeyPoints: (avatarId: string, points: string[]) => void;
  clearDebateState: () => void;

  // Phase-Based Debate Actions
  setCurrentPhase: (phase: DebatePhase | null) => void;
  setDebatePhases: (phases: PhaseConfig[]) => void;
  addPhaseToHistory: (transition: PhaseTransition) => void;
  updatePhaseCompletion: (phase: DebatePhase) => void;
  addDebateTurn: (turn: DebateTurn) => void;
  updateDebateTurnContent: (turnId: string, content: string) => void;
  finalizeDebateTurn: (turnId: string, content: string, tokensUsed?: number) => void;
  setThinkingState: (avatarKey: "avatar1" | "avatar2", state: Partial<AvatarThinkingState>) => void;
  addThought: (avatarKey: "avatar1" | "avatar2", thought: string) => void;
  clearThinkingState: () => void;
  setComprehensiveSummary: (summary: ComprehensiveDebateSummary | null) => void;
  setIsGeneratingSummary: (generating: boolean) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // WebSocket actions
  connect: (userId?: string, isAdmin?: boolean) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;

  // Reconnection actions
  scheduleReconnect: () => void;
  cancelReconnect: () => void;
  flushMessageQueue: () => void;
  clearMessageQueue: () => void;
  queueMessage: (type: string, payload: any) => void;
  setStreamingError: (hasError: boolean) => void;
  clearError: () => void;
  startDebate: (
    topic: string,
    avatarIdsOrAvatar1Id: string[] | string,  // Can be array of IDs or legacy single ID
    avatar2Id?: string,  // Optional for legacy support
    options?: {
      maxTurns?: number;
      argumentRounds?: number;
      includeRebuttals?: boolean;
      format?: "quick" | "standard" | "deep-dive";
    }
  ) => void;
  pauseDebate: () => void;
  resumeDebate: () => void;
  injectQuestion: (question: string) => void;
  interruptDebate: () => void;
  addDebateAvatar: (avatarId: string) => void;
  removeDebateAvatar: (avatarId: string) => void;

  // Network actions
  subscribeToNetwork: () => void;
  unsubscribeFromNetwork: () => void;
  sendNetworkMessage: (fromAvatarId: string, toAvatarId: string, content: string) => void;
  broadcastNetworkMessage: (fromAvatarId: string, content: string) => void;
  simulateNetworkActivity: (duration?: number) => void;

  // Expert Summoning actions
  summonState: SummonState;
  summonExpert: (debateId: string, requestingAvatarId: string, domain: string, reason?: string, context?: string) => void;
  findExpertForDomain: (domain: string, excludeAvatarIds?: string[]) => void;
  clearSummonState: () => void;

  // Chat routing state
  routingResult: RoutingResult | null;
  isRouting: boolean;
  chatExpertContribution: ChatExpertContribution | null;
  chatExpertStreaming: string;
  isSummoningChatExpert: boolean;

  // Chat routing actions
  requestRouting: (content: string, context?: any) => void;
  clearRoutingResult: () => void;
  summonChatExpert: (currentAvatarId: string, domain: string, reason?: string) => void;
  clearChatExpert: () => void;

  // Chat thread state
  chatThreads: ChatThread[];
  currentThreadId: string | null;
  activeAvatarId: string | null;  // Which avatar to talk to in multi-avatar chat

  // Chat thread actions
  createNewThread: (avatarIds: string[]) => string;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  setActiveAvatar: (avatarId: string | null) => void;
  updateThreadTitle: (threadId: string, title: string) => void;

  // API actions
  fetchAvatars: () => Promise<void>;
  createSession: (mode?: ResponseMode) => Promise<Session | null>;
  endSession: () => Promise<void>;
}

// =============================================================================
// API Helpers
// =============================================================================

const API_BASE = "/api/avatar-council";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useAvatarCouncilStore = create<AvatarCouncilState>()(
  persist(
    (set, get) => ({
      // Initial State
      avatars: [],
      selectedAvatarIds: [],
      currentSession: null,
      messages: [],
      currentDebate: null,
      debateTurnMeta: [],
      debateSummary: null,
      debateKeyPoints: { avatar1: [], avatar2: [] },
      // Phase-Based Debate
      currentPhase: null,
      debatePhases: [],
      phaseHistory: [],
      debateTurns: [],
      thinkingState: {
        avatar1: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
        avatar2: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
      },
      comprehensiveSummary: null,
      isGeneratingSummary: false,
      mode: "single",
      isLoading: false,
      error: null,
      lastError: null,
      connectionStatus: "disconnected",
      ws: null,
      reconnectAttempts: 0,
      reconnectTimeoutId: null,
      messageQueue: [],
      userId: "anonymous",
      isAdmin: false,
      streamingAvatarId: null,
      streamingContent: "",
      streamingError: false,

      // Network Communication
      networkState: null,
      networkSubscribed: false,
      networkActivity: [],

      // Expert Summoning state
      summonState: {
        isLoading: false,
        pendingRequest: null,
        summonedExpert: null,
        contribution: null,
        streamingContribution: "",
        error: null,
      },

      // Chat routing state
      routingResult: null,
      isRouting: false,
      chatExpertContribution: null,
      chatExpertStreaming: "",
      isSummoningChatExpert: false,

      // Chat thread state
      chatThreads: [],
      currentThreadId: null,
      activeAvatarId: null,

      // Avatar Actions
      setAvatars: (avatars) => set({ avatars }),

      selectAvatar: (avatarId) => {
        const { selectedAvatarIds } = get();

        // Max 4 selections (for multi-advisor debate)
        if (!selectedAvatarIds.includes(avatarId) && selectedAvatarIds.length < 4) {
          set({ selectedAvatarIds: [...selectedAvatarIds, avatarId] });
        }
      },

      deselectAvatar: (avatarId) => {
        const { selectedAvatarIds } = get();
        set({ selectedAvatarIds: selectedAvatarIds.filter(id => id !== avatarId) });
      },

      clearSelectedAvatars: () => set({ selectedAvatarIds: [] }),

      setMode: (mode) => {
        const { selectedAvatarIds } = get();

        // Adjust selection based on new mode limits
        if (mode === "single" && selectedAvatarIds.length > 1) {
          set({ mode, selectedAvatarIds: [selectedAvatarIds[0]] });
        } else if (mode === "debate" && selectedAvatarIds.length > 4) {
          set({ mode, selectedAvatarIds: selectedAvatarIds.slice(0, 4) });
        } else {
          set({ mode });
        }
      },

      // Session Actions
      setSession: (session) => set({ currentSession: session }),

      addMessage: (message) => {
        const { messages, chatThreads, currentThreadId } = get();
        const updatedMessages = [...messages, message];

        // Also update the current thread
        if (currentThreadId) {
          const updatedThreads = chatThreads.map(t =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages: updatedMessages,
                  updatedAt: new Date().toISOString(),
                  preview: message.content?.slice(0, 50) || '',
                  // Update title from first user message if still default
                  title: t.title === 'New Chat' && message.role === 'user'
                    ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                    : t.title,
                }
              : t
          );
          set({ messages: updatedMessages, chatThreads: updatedThreads });
        } else {
          set({ messages: updatedMessages });
        }
      },

      updateStreamingMessage: (avatarId, content) => {
        set({ streamingAvatarId: avatarId, streamingContent: content });
      },

      finalizeStreamingMessage: (avatarId, content, tokensUsed) => {
        const { messages, avatars, chatThreads, currentThreadId } = get();
        const avatar = avatars.find(a => a.id === avatarId);

        const newMessage: AvatarMessage = {
          id: `msg-${Date.now()}`,
          sessionId: get().currentSession?.id || "",
          role: "avatar",
          avatarId,
          avatarName: avatar?.name,
          content,
          tokensUsed: tokensUsed || null,
          createdAt: new Date().toISOString(),
          isStreaming: false,
        };

        const updatedMessages = [...messages, newMessage];

        // Also update the current thread
        if (currentThreadId) {
          const updatedThreads = chatThreads.map(t =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages: updatedMessages,
                  updatedAt: new Date().toISOString(),
                  preview: content?.slice(0, 50) || '',
                }
              : t
          );
          set({
            messages: updatedMessages,
            chatThreads: updatedThreads,
            streamingAvatarId: null,
            streamingContent: "",
          });
        } else {
          set({
            messages: updatedMessages,
            streamingAvatarId: null,
            streamingContent: "",
          });
        }
      },

      clearMessages: () => set({ messages: [] }),

      // Chat Thread Actions
      createNewThread: (avatarIds: string[]) => {
        const { chatThreads, currentThreadId, messages, avatars } = get();

        // First, save current thread's messages if there are any
        let updatedThreads = chatThreads;
        if (currentThreadId && messages.length > 0) {
          updatedThreads = chatThreads.map(t =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages,
                  updatedAt: new Date().toISOString(),
                  preview: messages[messages.length - 1]?.content?.slice(0, 50) || '',
                }
              : t
          );
        }

        // Create new thread
        const threadId = `thread-${Date.now()}`;
        const avatarNames = avatarIds
          .map(id => avatars.find(a => a.id === id)?.name?.split(' ')[0])
          .filter(Boolean)
          .join(', ');

        const newThread: ChatThread = {
          id: threadId,
          title: avatarNames ? `Chat with ${avatarNames}` : 'New Chat',
          avatarIds,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preview: '',
        };

        set({
          chatThreads: [newThread, ...updatedThreads],
          currentThreadId: threadId,
          messages: [],
          activeAvatarId: null, // Reset active avatar selection for new chat
        });

        return threadId;
      },

      switchThread: (threadId: string) => {
        const { chatThreads, currentThreadId, messages } = get();

        // Save current messages to current thread before switching
        if (currentThreadId) {
          const updatedThreads = chatThreads.map(t =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages,
                  updatedAt: new Date().toISOString(),
                  preview: messages[messages.length - 1]?.content?.slice(0, 50) || '',
                }
              : t
          );

          // Load messages from target thread
          const targetThread = updatedThreads.find(t => t.id === threadId);
          set({
            chatThreads: updatedThreads,
            currentThreadId: threadId,
            messages: targetThread?.messages || [],
            selectedAvatarIds: targetThread?.avatarIds || [],
          });
        } else {
          const targetThread = chatThreads.find(t => t.id === threadId);
          set({
            currentThreadId: threadId,
            messages: targetThread?.messages || [],
            selectedAvatarIds: targetThread?.avatarIds || [],
          });
        }
      },

      deleteThread: (threadId: string) => {
        const { chatThreads, currentThreadId } = get();
        const updatedThreads = chatThreads.filter(t => t.id !== threadId);

        // If deleting current thread, switch to most recent or clear
        if (currentThreadId === threadId) {
          const nextThread = updatedThreads[0];
          set({
            chatThreads: updatedThreads,
            currentThreadId: nextThread?.id || null,
            messages: nextThread?.messages || [],
            selectedAvatarIds: nextThread?.avatarIds || [],
          });
        } else {
          set({ chatThreads: updatedThreads });
        }
      },

      setActiveAvatar: (avatarId: string | null) => set({ activeAvatarId: avatarId }),

      updateThreadTitle: (threadId: string, title: string) => {
        const { chatThreads } = get();
        set({
          chatThreads: chatThreads.map(t =>
            t.id === threadId ? { ...t, title } : t
          ),
        });
      },

      // Debate Actions
      setDebate: (debate) => set({ currentDebate: debate }),

      updateDebateTurn: (turn, status) => {
        const { currentDebate } = get();
        if (currentDebate) {
          set({
            currentDebate: {
              ...currentDebate,
              currentTurn: turn,
              ...(status && { status }),
            },
          });
        }
      },

      addTurnMeta: (meta) => {
        const { debateTurnMeta } = get();
        set({ debateTurnMeta: [...debateTurnMeta, meta] });
      },

      setDebateSummary: (summary) => set({ debateSummary: summary }),

      updateKeyPoints: (avatarId, points) => {
        const { currentDebate, debateKeyPoints } = get();
        if (currentDebate) {
          if (avatarId === currentDebate.avatar1Id) {
            set({ debateKeyPoints: { ...debateKeyPoints, avatar1: points } });
          } else {
            set({ debateKeyPoints: { ...debateKeyPoints, avatar2: points } });
          }
        }
      },

      clearDebateState: () => set({
        currentDebate: null,
        debateTurnMeta: [],
        debateSummary: null,
        debateKeyPoints: { avatar1: [], avatar2: [] },
        messages: [],
        // Phase-based state
        currentPhase: null,
        debatePhases: [],
        phaseHistory: [],
        debateTurns: [],
        thinkingState: {
          avatar1: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
          avatar2: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
        },
        comprehensiveSummary: null,
        isGeneratingSummary: false,
      }),

      // Phase-Based Debate Actions
      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      setDebatePhases: (phases) => set({ debatePhases: phases }),

      addPhaseToHistory: (transition) => {
        const { phaseHistory } = get();
        set({ phaseHistory: [...phaseHistory, transition] });
      },

      updatePhaseCompletion: (phase) => {
        const { phaseHistory } = get();
        const updatedHistory = phaseHistory.map((t) =>
          t.phase === phase && !t.completedAt
            ? { ...t, completedAt: new Date().toISOString() }
            : t
        );
        set({ phaseHistory: updatedHistory });
      },

      addDebateTurn: (turn) => {
        const { debateTurns } = get();
        set({ debateTurns: [...debateTurns, turn] });
      },

      updateDebateTurnContent: (turnId, content) => {
        const { debateTurns } = get();
        const updatedTurns = debateTurns.map((t) =>
          t.id === turnId ? { ...t, content } : t
        );
        set({ debateTurns: updatedTurns });
      },

      finalizeDebateTurn: (turnId, content, tokensUsed) => {
        const { debateTurns } = get();
        const updatedTurns = debateTurns.map((t) =>
          t.id === turnId
            ? { ...t, content, tokensUsed, completedAt: new Date().toISOString() }
            : t
        );
        set({ debateTurns: updatedTurns });
      },

      setThinkingState: (avatarKey, state) => {
        const { thinkingState } = get();
        set({
          thinkingState: {
            ...thinkingState,
            [avatarKey]: { ...thinkingState[avatarKey], ...state },
          },
        });
      },

      addThought: (avatarKey, thought) => {
        const { thinkingState } = get();
        const currentState = thinkingState[avatarKey];
        set({
          thinkingState: {
            ...thinkingState,
            [avatarKey]: {
              ...currentState,
              currentThought: thought,
              thoughts: [...currentState.thoughts, thought],
            },
          },
        });
      },

      clearThinkingState: () => {
        set({
          thinkingState: {
            avatar1: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
            avatar2: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
          },
        });
      },

      setComprehensiveSummary: (summary) => set({ comprehensiveSummary: summary }),

      setIsGeneratingSummary: (generating) => set({ isGeneratingSummary: generating }),

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // WebSocket Actions
      connect: (userId = "anonymous", isAdmin = false) => {
        const { ws, connectionStatus, reconnectAttempts } = get();

        // Store credentials for reconnection
        set({ userId, isAdmin });

        // Don't connect if already connected/connecting
        if (ws && connectionStatus !== "disconnected" && connectionStatus !== "error") {
          return;
        }

        // Determine if this is a reconnection attempt
        const isReconnecting = reconnectAttempts > 0;
        set({ connectionStatus: isReconnecting ? "reconnecting" : "connecting" });

        console.log(`[AvatarCouncil] ${isReconnecting ? 'Reconnecting' : 'Connecting'}... (attempt ${reconnectAttempts + 1})`);

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const newWs = new WebSocket(`${protocol}//${window.location.host}/ws/avatar-council`);

        newWs.onopen = () => {
          console.log("[AvatarCouncil] WebSocket connected successfully");
          set({
            connectionStatus: "connected",
            ws: newWs,
            reconnectAttempts: 0,
            lastError: null,
            streamingError: false,
          });

          // Authenticate
          newWs.send(JSON.stringify({
            type: "auth",
            userId,
            isAdmin,
          }));

          // Flush any queued messages
          get().flushMessageQueue();
        };

        newWs.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message, get, set);
          } catch (error) {
            console.error("[AvatarCouncilStore] Failed to parse message:", error);
          }
        };

        newWs.onclose = (event) => {
          console.log(`[AvatarCouncil] WebSocket closed: code=${event.code}, reason=${event.reason || 'none'}`);

          const wasConnected = get().connectionStatus === "connected";
          set({ ws: null });

          // Don't reconnect if this was a clean disconnect (code 1000) or intentional
          if (event.code === 1000 || event.code === 1001) {
            set({ connectionStatus: "disconnected", reconnectAttempts: 0 });
            return;
          }

          // Set error state and schedule reconnect
          set({
            connectionStatus: "error",
            lastError: {
              message: event.reason || `Connection closed unexpectedly (code: ${event.code})`,
              timestamp: Date.now(),
            },
          });

          // Auto-reconnect if we were previously connected or connecting
          if (wasConnected || get().connectionStatus === "connecting" || get().connectionStatus === "reconnecting") {
            get().scheduleReconnect();
          }
        };

        newWs.onerror = (error) => {
          console.error("[AvatarCouncil] WebSocket error:", error);
          set({
            connectionStatus: "error",
            lastError: {
              message: "WebSocket connection error",
              timestamp: Date.now(),
            },
          });
        };
      },

      disconnect: () => {
        const { ws, reconnectTimeoutId } = get();

        // Cancel any pending reconnection
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
        }

        if (ws) {
          ws.close(1000, "User disconnected");
        }

        set({
          ws: null,
          connectionStatus: "disconnected",
          reconnectAttempts: 0,
          reconnectTimeoutId: null,
          messageQueue: [],
        });
      },

      // Reconnection with exponential backoff
      scheduleReconnect: () => {
        const { reconnectAttempts, reconnectTimeoutId, userId, isAdmin } = get();

        // Clear any existing timeout
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
        }

        // Check if max attempts reached
        if (reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
          console.log("[AvatarCouncil] Max reconnection attempts reached");
          set({
            connectionStatus: "error",
            lastError: {
              message: `Failed to reconnect after ${RECONNECT_CONFIG.maxAttempts} attempts`,
              timestamp: Date.now(),
            },
          });
          return;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          RECONNECT_CONFIG.baseDelay * Math.pow(RECONNECT_CONFIG.backoffMultiplier, reconnectAttempts),
          RECONNECT_CONFIG.maxDelay
        );

        console.log(`[AvatarCouncil] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${RECONNECT_CONFIG.maxAttempts})`);

        const timeoutId = setTimeout(() => {
          set({ reconnectAttempts: reconnectAttempts + 1 });
          get().connect(userId, isAdmin);
        }, delay);

        set({ reconnectTimeoutId: timeoutId });
      },

      cancelReconnect: () => {
        const { reconnectTimeoutId } = get();
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
          set({ reconnectTimeoutId: null, reconnectAttempts: 0 });
        }
      },

      // Message queue management for offline support
      queueMessage: (type: string, payload: any) => {
        const { messageQueue } = get();
        const queuedMessage: QueuedMessage = {
          type,
          payload,
          timestamp: Date.now(),
        };
        set({ messageQueue: [...messageQueue, queuedMessage] });
        console.log(`[AvatarCouncil] Message queued: ${type}`);
      },

      flushMessageQueue: () => {
        const { ws, messageQueue } = get();

        if (!ws || ws.readyState !== WebSocket.OPEN || messageQueue.length === 0) {
          return;
        }

        console.log(`[AvatarCouncil] Flushing ${messageQueue.length} queued messages`);

        // Filter out stale messages (older than 5 minutes)
        const maxAge = 5 * 60 * 1000;
        const now = Date.now();
        const validMessages = messageQueue.filter(m => now - m.timestamp < maxAge);

        // Send each message
        validMessages.forEach(msg => {
          try {
            ws.send(JSON.stringify({ type: msg.type, ...msg.payload }));
          } catch (error) {
            console.error("[AvatarCouncil] Failed to send queued message:", error);
          }
        });

        set({ messageQueue: [] });
      },

      clearMessageQueue: () => {
        set({ messageQueue: [] });
      },

      setStreamingError: (hasError: boolean) => {
        set({ streamingError: hasError });
        if (hasError) {
          set({
            lastError: {
              message: "Streaming response interrupted",
              timestamp: Date.now(),
            },
          });
        }
      },

      clearError: () => {
        set({ error: null, lastError: null, streamingError: false });
      },

      sendMessage: (content) => {
        const { ws, selectedAvatarIds, activeAvatarId, mode, messages, connectionStatus } = get();

        // Add user message to local state immediately for optimistic UI
        const userMessage: AvatarMessage = {
          id: `msg-${Date.now()}`,
          sessionId: get().currentSession?.id || "",
          role: "user",
          avatarId: null,
          content,
          tokensUsed: null,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...messages, userMessage], isLoading: true, error: null, streamingError: false });

        // If activeAvatarId is set (user selected a specific avatar), send only to that one
        const effectiveAvatarIds = activeAvatarId ? [activeAvatarId] : selectedAvatarIds;

        const payload = {
          content,
          mode,
          avatarIds: effectiveAvatarIds.length > 0 ? effectiveAvatarIds : undefined,
          enableAutoRouting: effectiveAvatarIds.length === 0,
        };

        // If not connected, queue the message and attempt reconnect
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          console.log("[AvatarCouncil] Not connected, queuing message and attempting reconnect");
          get().queueMessage("avatar:prompt", payload);

          // Trigger reconnection if not already attempting
          if (connectionStatus === "disconnected" || connectionStatus === "error") {
            get().scheduleReconnect();
          }
          return;
        }

        // Send to server
        try {
          ws.send(JSON.stringify({
            type: "avatar:prompt",
            ...payload,
          }));
        } catch (error) {
          console.error("[AvatarCouncil] Failed to send message:", error);
          get().queueMessage("avatar:prompt", payload);
          get().scheduleReconnect();
        }
      },

      startDebate: (topic, avatarIdsOrAvatar1Id, avatar2Id, options = {}) => {
        const { ws } = get();

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({ error: "Not connected to server" });
          return;
        }

        // Clear previous debate state
        get().clearDebateState();

        set({ isLoading: true, error: null });

        const {
          maxTurns = 6,
          argumentRounds = 2,
          includeRebuttals = true,
          format = "standard",
        } = options;

        // Support both new array format and legacy two-argument format
        const avatarIds = Array.isArray(avatarIdsOrAvatar1Id)
          ? avatarIdsOrAvatar1Id
          : [avatarIdsOrAvatar1Id, avatar2Id].filter(Boolean) as string[];

        const message = {
          type: "debate:start",
          topic,
          avatarIds,  // New: send array of avatar IDs
          // Legacy fallback for backwards compatibility
          avatar1Id: avatarIds[0],
          avatar2Id: avatarIds[1],
          maxTurns,
          argumentRounds,
          includeRebuttals,
          format,
        };

        ws.send(JSON.stringify(message));
      },

      interruptDebate: () => {
        const { ws, currentDebate } = get();

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({ error: "Not connected to server" });
          return;
        }

        if (!currentDebate) {
          set({ error: "No active debate to interrupt" });
          return;
        }

        ws.send(JSON.stringify({
          type: "debate:interrupt",
          debateId: currentDebate.id,
        }));
      },

      pauseDebate: () => {
        const { ws, currentDebate } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !currentDebate) return;

        ws.send(JSON.stringify({
          type: "debate:pause",
          debateId: currentDebate.id,
        }));
      },

      resumeDebate: () => {
        const { ws, currentDebate } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !currentDebate) return;

        ws.send(JSON.stringify({
          type: "debate:resume",
          debateId: currentDebate.id,
        }));
      },

      injectQuestion: (question) => {
        const { ws, currentDebate, messages } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !currentDebate) return;

        // Add user question to messages
        const userMessage: AvatarMessage = {
          id: `msg-${Date.now()}`,
          sessionId: currentDebate.sessionId,
          role: "user",
          avatarId: null,
          content: question,
          tokensUsed: null,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...messages, userMessage], isLoading: true });

        ws.send(JSON.stringify({
          type: "debate:inject",
          debateId: currentDebate.id,
          question,
        }));
      },

      addDebateAvatar: (avatarId) => {
        const { ws, currentDebate } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !currentDebate) return;

        ws.send(JSON.stringify({
          type: "debate:add:avatar",
          debateId: currentDebate.id,
          avatarId,
          role: "moderator",
        }));
      },

      removeDebateAvatar: (avatarId) => {
        const { ws, currentDebate } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !currentDebate) return;

        ws.send(JSON.stringify({
          type: "debate:remove:avatar",
          debateId: currentDebate.id,
          avatarId,
          summarize: true,
        }));
      },

      // Network Actions
      subscribeToNetwork: () => {
        const { ws, networkSubscribed } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || networkSubscribed) return;

        ws.send(JSON.stringify({ type: "network:subscribe" }));
        set({ networkSubscribed: true });
      },

      unsubscribeFromNetwork: () => {
        const { ws, networkSubscribed } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN || !networkSubscribed) return;

        ws.send(JSON.stringify({ type: "network:unsubscribe" }));
        set({ networkSubscribed: false, networkState: null, networkActivity: [] });
      },

      sendNetworkMessage: (fromAvatarId, toAvatarId, content) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
          type: "network:message",
          fromAvatarId,
          toAvatarId,
          content,
        }));
      },

      broadcastNetworkMessage: (fromAvatarId, content) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
          type: "network:broadcast",
          fromAvatarId,
          content,
        }));
      },

      simulateNetworkActivity: (duration = 10000) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
          type: "network:simulate",
          action: "start",
          duration,
        }));
      },

      // Expert Summoning Actions
      summonExpert: (debateId, requestingAvatarId, domain, reason, context) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({
            summonState: {
              ...get().summonState,
              error: "Not connected to server",
            },
          });
          return;
        }

        set({
          summonState: {
            ...get().summonState,
            isLoading: true,
            error: null,
            streamingContribution: "",
          },
        });

        ws.send(JSON.stringify({
          type: "debate:summon:expert",
          debateId,
          requestingAvatarId,
          domain,
          reason: reason || `Expert consultation needed for ${domain}`,
          context: context || "",
        }));
      },

      findExpertForDomain: (domain, excludeAvatarIds = []) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
          type: "debate:find:expert",
          domain,
          excludeAvatarIds,
        }));
      },

      clearSummonState: () => {
        set({
          summonState: {
            isLoading: false,
            pendingRequest: null,
            summonedExpert: null,
            contribution: null,
            streamingContribution: "",
            error: null,
          },
        });
      },

      // Chat Routing Actions
      requestRouting: (content, context) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({ error: "Not connected to server" });
          return;
        }

        set({ isRouting: true, routingResult: null });

        ws.send(JSON.stringify({
          type: "avatar:route",
          content,
          context,
        }));
      },

      clearRoutingResult: () => {
        set({ routingResult: null, isRouting: false });
      },

      summonChatExpert: (currentAvatarId, domain, reason) => {
        const { ws, messages, selectedAvatarIds } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          set({ error: "Not connected to server" });
          return;
        }

        set({ isSummoningChatExpert: true, chatExpertContribution: null, chatExpertStreaming: "" });

        // Send last few messages as context
        const recentHistory = messages.slice(-10).map(m => ({
          role: m.role,
          avatarName: m.avatarName,
          content: m.content,
        }));

        ws.send(JSON.stringify({
          type: "chat:summon:expert",
          currentAvatarId,
          excludeAvatarIds: selectedAvatarIds, // Exclude all currently selected avatars
          domain,
          reason,
          chatHistory: recentHistory,
        }));
      },

      clearChatExpert: () => {
        set({
          chatExpertContribution: null,
          chatExpertStreaming: "",
          isSummoningChatExpert: false,
        });
      },

      // API Actions
      fetchAvatars: async () => {
        try {
          set({ isLoading: true, error: null });
          const avatars = await apiFetch<Avatar[]>("/avatars?active=true");
          set({ avatars, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createSession: async (mode = "single") => {
        try {
          set({ isLoading: true, error: null });
          const session = await apiFetch<Session>("/sessions", {
            method: "POST",
            body: JSON.stringify({ mode }),
          });
          set({ currentSession: session, isLoading: false, messages: [] });
          return session;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      endSession: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        try {
          await apiFetch(`/sessions/${currentSession.id}/end`, { method: "POST" });
          set({ currentSession: null, messages: [], currentDebate: null });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
    }),
    {
      name: "avatar-council-storage",
      version: 2,
      partialize: (state) => ({
        // Persist user preferences
        mode: state.mode,
        selectedAvatarIds: state.selectedAvatarIds,
        // Persist session data for recovery
        currentSession: state.currentSession,
        messages: state.messages.slice(-50), // Keep last 50 messages
        currentDebate: state.currentDebate,
        debateTurnMeta: state.debateTurnMeta,
        debateKeyPoints: state.debateKeyPoints,
        // Phase-based debate state
        currentPhase: state.currentPhase,
        debatePhases: state.debatePhases,
        phaseHistory: state.phaseHistory,
        debateTurns: state.debateTurns.slice(-30), // Keep last 30 turns
        comprehensiveSummary: state.comprehensiveSummary,
        // Persist user identity
        userId: state.userId,
        isAdmin: state.isAdmin,
        // Persist chat threads (keep last 20 threads, each with last 50 messages)
        chatThreads: state.chatThreads.slice(0, 20).map(t => ({
          ...t,
          messages: t.messages.slice(-50),
        })),
        currentThreadId: state.currentThreadId,
      }),
      migrate: (persistedState: any, version: number) => {
        // Handle state migration between versions
        if (version === 0 || version === 1) {
          return {
            ...persistedState,
            userId: persistedState.userId || "anonymous",
            isAdmin: persistedState.isAdmin || false,
            currentSession: null,
            messages: [],
            currentDebate: null,
            debateTurnMeta: [],
            debateKeyPoints: { avatar1: [], avatar2: [] },
            // Phase-based debate state
            currentPhase: null,
            debatePhases: [],
            phaseHistory: [],
            debateTurns: [],
            comprehensiveSummary: null,
          };
        }
        return persistedState;
      },
    }
  )
);

// =============================================================================
// WebSocket Message Handler
// =============================================================================

function handleWebSocketMessage(
  message: any,
  get: () => AvatarCouncilState,
  set: (state: Partial<AvatarCouncilState>) => void
) {
  switch (message.type) {
    case "connected":
      console.log("[AvatarCouncil] Connected:", message.clientId);
      break;

    case "auth:success":
      console.log("[AvatarCouncil] Authenticated:", message.userId);
      break;

    case "session:created":
      set({ currentSession: message.session });
      break;

    case "session:joined":
      set({
        currentSession: message.session,
        messages: message.messages || [],
      });
      break;

    case "session:ended":
      set({ currentSession: null, messages: [], currentDebate: null });
      break;

    case "avatar:response:start": {
      const { avatars } = get();
      const avatar = avatars.find(a => a.id === message.avatarId);
      set({
        streamingAvatarId: message.avatarId,
        streamingContent: "",
        isLoading: true,
      });
      break;
    }

    case "avatar:response:token": {
      const { streamingContent } = get();
      set({ streamingContent: streamingContent + message.token });
      break;
    }

    case "avatar:response:end": {
      const { avatars, messages } = get();
      const avatar = avatars.find(a => a.id === message.avatarId);

      const newMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        sessionId: get().currentSession?.id || "",
        role: "avatar",
        avatarId: message.avatarId,
        avatarName: avatar?.name,
        content: message.content,
        tokensUsed: message.usage?.totalTokens || null,
        createdAt: new Date().toISOString(),
      };

      set({
        messages: [...messages, newMessage],
        streamingAvatarId: null,
        streamingContent: "",
      });
      break;
    }

    case "avatar:response:complete":
      set({ isLoading: false });
      break;

    case "avatar:response:error":
      // Check if this was a streaming error mid-response
      const wasStreaming = get().streamingAvatarId !== null;
      set({
        error: message.error,
        isLoading: false,
        streamingError: wasStreaming,
        streamingAvatarId: null,
        streamingContent: "",
        lastError: {
          message: message.error || "Response generation failed",
          timestamp: Date.now(),
        },
      });
      break;

    // Debate events
    case "debate:start": {
      // Extract all participant IDs from the avatars array
      const participantIds = message.avatars?.map((a: any) => a.id) || [];

      const debateState: Partial<AvatarCouncilState> = {
        currentDebate: {
          id: message.debateId,
          sessionId: message.sessionId,
          topic: message.topic,
          avatar1Id: message.avatars[0]?.id,
          avatar2Id: message.avatars[1]?.id,
          participantIds,  // Store all participant IDs for multi-avatar debates
          currentTurn: 1,
          maxTurns: message.maxTurns,
          status: "active",
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        isLoading: true,
        // Reset phase-based state
        currentPhase: null,
        debateTurns: [],
        phaseHistory: [],
        comprehensiveSummary: null,
        isGeneratingSummary: false,
      };

      // If phases are included, set them up
      if (message.phases && Array.isArray(message.phases)) {
        debateState.debatePhases = message.phases;
      }

      set(debateState);
      break;
    }

    case "debate:turn:start":
      set({
        streamingAvatarId: message.avatarId,
        streamingContent: "",
      });
      break;

    case "debate:token": {
      const { streamingContent } = get();
      set({ streamingContent: streamingContent + message.token });
      break;
    }

    case "debate:turn:end": {
      const { avatars, messages, currentDebate } = get();
      const avatar = avatars.find(a => a.id === message.avatarId);

      const newMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        sessionId: currentDebate?.sessionId || "",
        role: "avatar",
        avatarId: message.avatarId,
        avatarName: avatar?.name,
        content: message.content,
        tokensUsed: message.usage?.totalTokens || null,
        createdAt: new Date().toISOString(),
      };

      set({
        messages: [...messages, newMessage],
        streamingAvatarId: null,
        streamingContent: "",
      });

      // Update debate turn
      if (currentDebate) {
        set({
          currentDebate: {
            ...currentDebate,
            currentTurn: message.turnNumber + 1,
          },
        });
      }
      break;
    }

    case "debate:complete": {
      // Extract and transform the summary from backend format
      const backendSummary = message.summary;
      let transformedSummary: DebateSummary | null = null;
      let comprehensiveSummary: ComprehensiveDebateSummary | null = null;

      if (backendSummary) {
        // Legacy format for backwards compatibility
        transformedSummary = {
          topic: backendSummary.topic || "",
          totalTurns: backendSummary.totalTurns || 0,
          executiveSummary: backendSummary.executiveSummary || "",
          keyConsensus: backendSummary.pointsOfAgreement || backendSummary.keyConsensus || [],
          unresolvedPoints: backendSummary.unresolvedQuestions || backendSummary.unresolvedPoints || [],
          avatar1Points: backendSummary.avatar1Position?.keyPoints || backendSummary.avatar1?.keyPoints || [],
          avatar2Points: backendSummary.avatar2Position?.keyPoints || backendSummary.avatar2?.keyPoints || [],
          avatar1: backendSummary.avatar1,
          avatar2: backendSummary.avatar2,
          messages: backendSummary.messages,
        };

        // New comprehensive format for phase-based UI
        comprehensiveSummary = {
          topic: backendSummary.topic || "",
          totalTurns: backendSummary.totalTurns || 0,
          totalDuration: backendSummary.totalDuration ? `${Math.floor(backendSummary.totalDuration / 60)}m ${backendSummary.totalDuration % 60}s` : "N/A",
          executiveSummary: backendSummary.executiveSummary || "",
          avatar1Analysis: {
            id: backendSummary.avatar1?.id || "",
            name: backendSummary.avatar1?.name || "",
            position: backendSummary.avatar1Position?.coreArgument || "",
            keyArguments: backendSummary.avatar1Position?.keyPoints || [],
            strengths: backendSummary.avatar1Position?.strengths || [],
            weaknesses: backendSummary.avatar1Position?.weaknesses || [],
            notableQuotes: backendSummary.avatar1Position?.notableQuotes || [],
          },
          avatar2Analysis: {
            id: backendSummary.avatar2?.id || "",
            name: backendSummary.avatar2?.name || "",
            position: backendSummary.avatar2Position?.coreArgument || "",
            keyArguments: backendSummary.avatar2Position?.keyPoints || [],
            strengths: backendSummary.avatar2Position?.strengths || [],
            weaknesses: backendSummary.avatar2Position?.weaknesses || [],
            notableQuotes: backendSummary.avatar2Position?.notableQuotes || [],
          },
          phaseBreakdown: {
            opening: {
              summary: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "OPENING")?.summary || "",
              keyPoints: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "OPENING")?.keyPoints || [],
            },
            arguments: {
              rounds: backendSummary.phaseBreakdown?.filter?.((p: any) => p.phase === "ARGUMENTS")?.length || 0,
              majorTopics: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "ARGUMENTS")?.keyPoints || [],
            },
            rebuttals: {
              directChallenges: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "REBUTTALS")?.keyPoints?.slice(0, 3) || [],
              effectiveCounters: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "REBUTTALS")?.keyPoints?.slice(3) || [],
            },
            closing: {
              finalPositions: backendSummary.phaseBreakdown?.find?.((p: any) => p.phase === "CLOSING")?.keyPoints || [],
            },
          },
          keyConsensusPoints: backendSummary.pointsOfAgreement || [],
          unresolvedDisagreements: backendSummary.pointsOfDisagreement || backendSummary.unresolvedQuestions || [],
          actionableInsights: backendSummary.actionableInsights || [],
          recommendedNextSteps: [],
          overallWinner: undefined,
        };
      }

      set({
        isLoading: false,
        debateSummary: transformedSummary,
        comprehensiveSummary: comprehensiveSummary,
        isGeneratingSummary: false,
        currentPhase: "COMPLETED",
        currentDebate: get().currentDebate
          ? { ...get().currentDebate!, status: "completed", completedAt: new Date().toISOString() }
          : null,
      });
      break;
    }

    case "debate:interrupted":
      set({
        isLoading: false,
        currentDebate: get().currentDebate
          ? { ...get().currentDebate!, status: "interrupted", completedAt: new Date().toISOString() }
          : null,
        error: message.reason,
      });
      break;

    case "debate:paused":
      set({
        isLoading: false,
        currentDebate: get().currentDebate
          ? { ...get().currentDebate!, status: "paused" }
          : null,
      });
      break;

    case "debate:resumed":
      set({
        currentDebate: get().currentDebate
          ? { ...get().currentDebate!, status: "active" }
          : null,
      });
      break;

    case "debate:turn:stance": {
      const { debateTurnMeta } = get();
      const lastMeta = debateTurnMeta[debateTurnMeta.length - 1];
      if (lastMeta) {
        set({
          debateTurnMeta: [
            ...debateTurnMeta.slice(0, -1),
            { ...lastMeta, stance: message.stance, targetClaim: message.targetClaim },
          ],
        });
      }
      break;
    }

    case "debate:round:summary": {
      const { debateKeyPoints, currentDebate } = get();
      if (message.keyPoints && currentDebate) {
        set({
          debateKeyPoints: {
            avatar1: message.keyPoints.avatar1 || debateKeyPoints.avatar1,
            avatar2: message.keyPoints.avatar2 || debateKeyPoints.avatar2,
          },
        });
      }
      break;
    }

    case "debate:summary": {
      // Transform backend summary format to frontend format
      const backendSummary = message.summary;
      let transformedSummary: DebateSummary | null = null;

      if (backendSummary) {
        transformedSummary = {
          topic: backendSummary.topic || "",
          totalTurns: backendSummary.totalTurns || 0,
          executiveSummary: backendSummary.executiveSummary || "",
          keyConsensus: backendSummary.keyConsensus || [],
          unresolvedPoints: backendSummary.unresolvedPoints || [],
          avatar1Points: backendSummary.avatar1?.keyPoints || backendSummary.avatar1Points || [],
          avatar2Points: backendSummary.avatar2?.keyPoints || backendSummary.avatar2Points || [],
          avatar1: backendSummary.avatar1,
          avatar2: backendSummary.avatar2,
          messages: backendSummary.messages,
        };
      }

      set({
        debateSummary: transformedSummary,
        isLoading: false,
      });
      break;
    }

    case "debate:avatar:added": {
      const { currentDebate } = get();
      if (currentDebate) {
        set({
          currentDebate: {
            ...currentDebate,
            moderatorId: message.avatarId,
          },
        });
      }
      break;
    }

    case "debate:avatar:removed":
      // Handle avatar removal - UI will update based on currentDebate
      break;

    // ==========================================================================
    // Phase-Based Debate Events
    // ==========================================================================

    case "debate:phase:start": {
      const { phaseHistory } = get();
      const newTransition: PhaseTransition = {
        phase: message.phase as DebatePhase,
        startedAt: new Date().toISOString(),
        completedAt: null,
        turnsCompleted: 0,
      };

      set({
        currentPhase: message.phase as DebatePhase,
        phaseHistory: [...phaseHistory, newTransition],
      });

      // Clear thinking state at phase start
      set({
        thinkingState: {
          avatar1: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
          avatar2: { isThinking: false, currentThought: "", thoughts: [], startedAt: null },
        },
      });
      break;
    }

    case "debate:phase:complete": {
      const { phaseHistory, currentPhase } = get();

      // Update the current phase's completion
      const updatedHistory = phaseHistory.map((t) =>
        t.phase === currentPhase && !t.completedAt
          ? {
              ...t,
              completedAt: new Date().toISOString(),
              turnsCompleted: message.turnsCompleted || t.turnsCompleted,
            }
          : t
      );

      set({ phaseHistory: updatedHistory });
      break;
    }

    case "debate:thinking:start": {
      const { currentDebate } = get();
      if (!currentDebate) break;

      // Determine which avatar is thinking
      const avatarKey = message.avatarId === currentDebate.avatar1Id ? "avatar1" : "avatar2";
      const { thinkingState } = get();

      set({
        thinkingState: {
          ...thinkingState,
          [avatarKey]: {
            isThinking: true,
            currentThought: "",
            thoughts: [],
            startedAt: new Date().toISOString(),
          },
        },
      });
      break;
    }

    case "debate:thinking:update": {
      const { currentDebate, thinkingState } = get();
      if (!currentDebate) break;

      const avatarKey = message.avatarId === currentDebate.avatar1Id ? "avatar1" : "avatar2";
      const currentState = thinkingState[avatarKey];

      set({
        thinkingState: {
          ...thinkingState,
          [avatarKey]: {
            ...currentState,
            currentThought: message.thought,
            thoughts: [...currentState.thoughts, message.thought],
          },
        },
      });
      break;
    }

    case "debate:thinking:end": {
      const { currentDebate, thinkingState } = get();
      if (!currentDebate) break;

      const avatarKey = message.avatarId === currentDebate.avatar1Id ? "avatar1" : "avatar2";
      const currentState = thinkingState[avatarKey];

      set({
        thinkingState: {
          ...thinkingState,
          [avatarKey]: {
            ...currentState,
            isThinking: false,
          },
        },
      });
      break;
    }

    case "debate:turn:complete": {
      // Enhanced turn completion with full DebateTurn data
      const { avatars, debateTurns, messages, currentDebate, phaseHistory, currentPhase } = get();

      if (!currentDebate) break;

      const avatar = avatars.find((a) => a.id === message.avatarId);

      // Create the full DebateTurn
      const turn: DebateTurn = {
        id: message.turnId || `turn-${Date.now()}`,
        turnNumber: message.turnNumber,
        avatarId: message.avatarId,
        avatarName: avatar?.name || "Unknown",
        content: message.content,
        phase: (message.phase as DebatePhase) || currentPhase || "ARGUMENTS",
        stance: message.stance,
        keyPoints: message.keyPoints,
        tokensUsed: message.usage?.totalTokens,
        startedAt: message.startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      // Also add to messages for backwards compatibility
      const newMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        sessionId: currentDebate.sessionId,
        role: "avatar",
        avatarId: message.avatarId,
        avatarName: avatar?.name,
        content: message.content,
        tokensUsed: message.usage?.totalTokens || null,
        createdAt: new Date().toISOString(),
      };

      // Update phase history turn count
      const updatedPhaseHistory = phaseHistory.map((t) =>
        t.phase === currentPhase && !t.completedAt
          ? { ...t, turnsCompleted: t.turnsCompleted + 1 }
          : t
      );

      set({
        debateTurns: [...debateTurns, turn],
        messages: [...messages, newMessage],
        streamingAvatarId: null,
        streamingContent: "",
        phaseHistory: updatedPhaseHistory,
        currentDebate: {
          ...currentDebate,
          currentTurn: message.turnNumber + 1,
        },
      });
      break;
    }

    case "debate:summary:generating":
      set({ isGeneratingSummary: true });
      break;

    case "debate:comprehensive:summary": {
      // Handle the comprehensive summary from phase-based debate
      const summary = message.summary as ComprehensiveDebateSummary;
      set({
        comprehensiveSummary: summary,
        isGeneratingSummary: false,
        currentPhase: "COMPLETED",
        isLoading: false,
        currentDebate: get().currentDebate
          ? { ...get().currentDebate!, status: "completed", completedAt: new Date().toISOString() }
          : null,
      });
      break;
    }

    case "debate:error":
      set({ error: message.error, isLoading: false });
      break;

    case "error":
      set({ error: message.error });
      break;

    // ==========================================================================
    // Network Communication Events
    // ==========================================================================

    case "network:subscribed": {
      set({
        networkState: message.state,
        networkSubscribed: true,
        networkActivity: message.state?.recentActivity || [],
      });
      console.log("[AvatarCouncil] Subscribed to network events");
      break;
    }

    case "network:activity": {
      const { networkActivity } = get();
      const newActivity = [message.event, ...networkActivity].slice(0, 50);
      set({ networkActivity: newActivity });
      break;
    }

    case "network:message:received": {
      // A message was sent between avatars
      const { networkState, networkActivity } = get();
      if (networkState) {
        // Update stats
        set({
          networkState: {
            ...networkState,
            stats: {
              ...networkState.stats,
              totalMessages: networkState.stats.totalMessages + 1,
            },
          },
        });
      }
      break;
    }

    case "network:status:changed": {
      const { networkState } = get();
      if (networkState) {
        const updatedAvatars = networkState.avatars.map((a) =>
          a.avatarId === message.status.avatarId ? message.status : a
        );
        // Add new avatar if not found
        if (!networkState.avatars.find((a) => a.avatarId === message.status.avatarId)) {
          updatedAvatars.push(message.status);
        }
        set({
          networkState: {
            ...networkState,
            avatars: updatedAvatars,
          },
        });
      }
      break;
    }

    case "network:state": {
      set({ networkState: message.state });
      break;
    }

    case "network:simulate:started": {
      console.log(`[AvatarCouncil] Network simulation started for ${message.duration}ms`);
      break;
    }

    // ==========================================================================
    // Expert Summoning Events
    // ==========================================================================

    case "debate:summon:request": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          pendingRequest: message.request,
        },
      });
      console.log(`[AvatarCouncil] Summon request: ${message.request.domainNeeded}`);
      break;
    }

    case "debate:summon:accepted": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          summonedExpert: {
            avatarId: message.expert.id,
            avatarName: message.expert.name,
            avatarSlug: message.expert.slug,
            avatarImageUrl: message.expert.avatarImageUrl,
            domainExpertise: message.expert.domainExpertise,
            summonedAt: new Date().toISOString(),
          },
        },
      });
      console.log(`[AvatarCouncil] Expert summoned: ${message.expert.name}`);
      break;
    }

    case "debate:summon:failed": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          isLoading: false,
          error: message.reason || "No expert found",
        },
      });
      console.log(`[AvatarCouncil] Summon failed: ${message.reason}`);
      break;
    }

    case "debate:expert:contribution:start": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          streamingContribution: "",
        },
      });
      console.log(`[AvatarCouncil] Expert ${message.expertName} starting contribution`);
      break;
    }

    case "debate:expert:contribution:token": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          streamingContribution: summonState.streamingContribution + message.token,
        },
      });
      break;
    }

    case "debate:expert:contribution:complete": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          isLoading: false,
          contribution: message.contribution,
          streamingContribution: "",
        },
      });
      console.log(`[AvatarCouncil] Expert contribution complete: ${message.contribution.expertName}`);
      break;
    }

    case "debate:expert:found": {
      console.log(`[AvatarCouncil] Expert found for ${message.domain}:`, message.expert?.name || "none");
      break;
    }

    case "debate:summon:error": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          isLoading: false,
          error: message.error,
        },
      });
      console.error(`[AvatarCouncil] Summon error: ${message.error}`);
      break;
    }

    // ==========================================================================
    // Autonomous Consultation Agreement Events
    // ==========================================================================

    case "debate:consultation:proposed": {
      console.log(`[AvatarCouncil] Consultation proposed by ${message.signal?.avatarName || message.avatarName}: "${message.signal?.domain || message.domain}"`);
      // Could add to state if we want to show pending proposals in UI
      break;
    }

    case "debate:consultation:seconded": {
      console.log(`[AvatarCouncil] Consultation SECONDED - both avatars agree to consult on "${message.agreement?.domain || message.domain}"`);
      break;
    }

    case "debate:consultation:agreed": {
      const { summonState } = get();
      set({
        summonState: {
          ...summonState,
          isLoading: true,
          summonedExpert: {
            avatarId: message.expert.id,
            avatarName: message.expert.name,
            avatarSlug: message.expert.slug,
            avatarImageUrl: message.expert.avatarImageUrl,
            domainExpertise: message.expert.domainExpertise || [],
            summonedAt: new Date().toISOString(),
          },
        },
      });
      console.log(`[AvatarCouncil] Consultation AGREED - summoning ${message.expert.name}`);
      break;
    }

    case "debate:expert:contributed": {
      console.log(`[AvatarCouncil] Expert ${message.expertName} contributed to debate`);
      break;
    }

    // ==========================================================================
    // Chat Routing Events
    // ==========================================================================

    case "avatar:route:result": {
      set({
        routingResult: {
          selectedAvatars: message.selectedAvatars,
          mode: message.mode,
          intent: message.intent,
          reasoning: message.reasoning,
          scores: message.scores,
        },
        isRouting: false,
      });
      console.log(`[AvatarCouncil] Routing result: ${message.selectedAvatars[0]?.name} (${message.intent.primaryDomain}, ${Math.round(message.intent.confidence * 100)}% confidence)`);
      break;
    }

    case "avatar:route:error": {
      set({ isRouting: false, error: message.error });
      console.error(`[AvatarCouncil] Routing error: ${message.error}`);
      break;
    }

    // ==========================================================================
    // Chat Expert Summoning Events
    // ==========================================================================

    case "chat:summon:accepted": {
      const { selectedAvatarIds } = get();
      const expertId = message.expert.id;

      // Add the summoned expert to selected avatars if not already there
      if (!selectedAvatarIds.includes(expertId)) {
        set({ selectedAvatarIds: [...selectedAvatarIds, expertId] });
        console.log(`[AvatarCouncil] Added expert ${message.expert.name} to selected avatars`);
      }

      console.log(`[AvatarCouncil] Chat expert found: ${message.expert.name}`);
      break;
    }

    case "chat:summon:failed": {
      set({
        isSummoningChatExpert: false,
        error: message.reason,
      });
      console.log(`[AvatarCouncil] Chat summon failed: ${message.reason}`);
      break;
    }

    case "chat:expert:contribution:start": {
      set({ chatExpertStreaming: "" });
      console.log(`[AvatarCouncil] Chat expert ${message.expertName} starting contribution`);
      break;
    }

    case "chat:expert:contribution:token": {
      const { chatExpertStreaming } = get();
      set({ chatExpertStreaming: chatExpertStreaming + message.token });
      break;
    }

    case "chat:expert:contribution:complete": {
      const { messages } = get();
      const contribution = message.contribution;

      // Add expert contribution as a message
      const expertMessage: AvatarMessage = {
        id: `msg-expert-${Date.now()}`,
        sessionId: get().currentSession?.id || "",
        role: "avatar",
        avatarId: contribution.expertId,
        avatarName: `${contribution.expertName} (Expert)`,
        content: contribution.content,
        tokensUsed: null,
        createdAt: contribution.timestamp,
      };

      set({
        messages: [...messages, expertMessage],
        chatExpertContribution: contribution,
        chatExpertStreaming: "",
        isSummoningChatExpert: false,
      });
      console.log(`[AvatarCouncil] Chat expert contribution complete: ${contribution.expertName}`);
      break;
    }

    case "chat:summon:error": {
      set({
        isSummoningChatExpert: false,
        error: message.error,
      });
      console.error(`[AvatarCouncil] Chat summon error: ${message.error}`);
      break;
    }

    default:
      console.log("[AvatarCouncil] Unknown message type:", message.type);
  }
}

// =============================================================================
// Selector Hooks
// =============================================================================

export const useAvatars = () => useAvatarCouncilStore((state) => state.avatars);

// Memoized selector with shallow comparison to prevent new array references
export const useSelectedAvatars = () => {
  return useAvatarCouncilStore(
    useShallow((state) => state.avatars.filter(a => state.selectedAvatarIds.includes(a.id)))
  );
};

export const useMessages = () => useAvatarCouncilStore((state) => state.messages);
export const useConnectionStatus = () => useAvatarCouncilStore((state) => state.connectionStatus);

// Split streaming state into individual selectors to avoid object creation
export const useStreamingAvatarId = () => useAvatarCouncilStore((state) => state.streamingAvatarId);
export const useStreamingContent = () => useAvatarCouncilStore((state) => state.streamingContent);

// Keep the combined hook for backwards compatibility but mark the individual ones as preferred
export const useStreamingState = () => {
  const avatarId = useStreamingAvatarId();
  const content = useStreamingContent();
  return { avatarId, content };
};

export const useCurrentDebate = () => useAvatarCouncilStore((state) => state.currentDebate);
export const useDebateTurnMeta = () => useAvatarCouncilStore((state) => state.debateTurnMeta);
export const useDebateSummary = () => useAvatarCouncilStore((state) => state.debateSummary);
export const useDebateKeyPoints = () => useAvatarCouncilStore((state) => state.debateKeyPoints);

// Reconnection state hooks
export const useReconnectAttempts = () => useAvatarCouncilStore((state) => state.reconnectAttempts);
export const useLastError = () => useAvatarCouncilStore((state) => state.lastError);
export const useStreamingError = () => useAvatarCouncilStore((state) => state.streamingError);
export const useMessageQueue = () => useAvatarCouncilStore((state) => state.messageQueue);

// Combined connection state for UI components
export const useConnectionState = () => {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      status: state.connectionStatus,
      reconnectAttempts: state.reconnectAttempts,
      lastError: state.lastError,
      queuedMessages: state.messageQueue.length,
      streamingError: state.streamingError,
    }))
  );
};

// Debate format options
export const DEBATE_FORMATS: DebateFormat[] = [
  { id: "quick", label: "Quick Take", roundsPerAvatar: 1, totalTurns: 2 },
  { id: "standard", label: "Point-Counterpoint", roundsPerAvatar: 3, totalTurns: 6 },
  { id: "extended", label: "Extended Analysis", roundsPerAvatar: 5, totalTurns: 10 },
];

// =============================================================================
// Phase-Based Debate Selectors
// =============================================================================

export const useCurrentPhase = () => useAvatarCouncilStore((state) => state.currentPhase);
export const useDebatePhases = () => useAvatarCouncilStore((state) => state.debatePhases);
export const usePhaseHistory = () => useAvatarCouncilStore((state) => state.phaseHistory);
export const useDebateTurns = () => useAvatarCouncilStore((state) => state.debateTurns);
export const useComprehensiveSummary = () => useAvatarCouncilStore((state) => state.comprehensiveSummary);
export const useIsGeneratingSummary = () => useAvatarCouncilStore((state) => state.isGeneratingSummary);

// Thinking state selectors
export const useThinkingState = () => useAvatarCouncilStore((state) => state.thinkingState);

export const useAvatar1Thinking = () => {
  return useAvatarCouncilStore(
    useShallow((state) => state.thinkingState.avatar1)
  );
};

export const useAvatar2Thinking = () => {
  return useAvatarCouncilStore(
    useShallow((state) => state.thinkingState.avatar2)
  );
};

// Get thinking state for a specific avatar by ID
export const useAvatarThinking = (avatarId: string) => {
  return useAvatarCouncilStore(
    useShallow((state) => {
      const { currentDebate, thinkingState } = state;
      if (!currentDebate) return null;

      if (avatarId === currentDebate.avatar1Id) {
        return thinkingState.avatar1;
      } else if (avatarId === currentDebate.avatar2Id) {
        return thinkingState.avatar2;
      }
      return null;
    })
  );
};

// Get turns for a specific phase
export const useTurnsForPhase = (phase: DebatePhase) => {
  return useAvatarCouncilStore(
    useShallow((state) => state.debateTurns.filter((t) => t.phase === phase))
  );
};

// Get turns for a specific avatar
export const useTurnsForAvatar = (avatarId: string) => {
  return useAvatarCouncilStore(
    useShallow((state) => state.debateTurns.filter((t) => t.avatarId === avatarId))
  );
};

// Combined phase-based debate state for UI components
export const usePhaseBasedDebateState = () => {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      currentPhase: state.currentPhase,
      phases: state.debatePhases,
      phaseHistory: state.phaseHistory,
      turns: state.debateTurns,
      thinkingState: state.thinkingState,
      comprehensiveSummary: state.comprehensiveSummary,
      isGeneratingSummary: state.isGeneratingSummary,
      debate: state.currentDebate,
    }))
  );
};

// Phase progress helper
export const usePhaseProgress = () => {
  return useAvatarCouncilStore(
    useShallow((state) => {
      const { debatePhases, phaseHistory, currentPhase } = state;

      const completedPhases = phaseHistory.filter((p) => p.completedAt !== null).length;
      const totalPhases = debatePhases.length;

      const currentPhaseConfig = debatePhases.find((p) => p.phase === currentPhase);
      const currentPhaseHistory = phaseHistory.find(
        (p) => p.phase === currentPhase && p.completedAt === null
      );

      return {
        completedPhases,
        totalPhases,
        currentPhase,
        currentPhaseConfig,
        turnsInCurrentPhase: currentPhaseHistory?.turnsCompleted || 0,
        progressPercent: totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0,
      };
    })
  );
};

// Phase format presets for the UI
export const PHASE_DEBATE_FORMATS = {
  quick: {
    id: "quick" as const,
    label: "Quick Debate",
    description: "Fast exchange with opening and closing only",
    argumentRounds: 1,
    includeRebuttals: false,
    estimatedTurns: 4,
  },
  standard: {
    id: "standard" as const,
    label: "Standard Debate",
    description: "Balanced debate with 2 argument rounds and rebuttals",
    argumentRounds: 2,
    includeRebuttals: true,
    estimatedTurns: 8,
  },
  "deep-dive": {
    id: "deep-dive" as const,
    label: "Deep Dive",
    description: "Comprehensive debate with 3 argument rounds and rebuttals",
    argumentRounds: 3,
    includeRebuttals: true,
    estimatedTurns: 12,
  },
};

// =============================================================================
// Network Communication Selectors
// =============================================================================

export const useNetworkState = () => useAvatarCouncilStore((state) => state.networkState);
export const useNetworkSubscribed = () => useAvatarCouncilStore((state) => state.networkSubscribed);
export const useNetworkActivity = () => useAvatarCouncilStore((state) => state.networkActivity);

// Combined network state for UI components
export const useNetworkCommunication = () => {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      networkState: state.networkState,
      networkSubscribed: state.networkSubscribed,
      networkActivity: state.networkActivity,
      subscribeToNetwork: state.subscribeToNetwork,
      unsubscribeFromNetwork: state.unsubscribeFromNetwork,
      sendNetworkMessage: state.sendNetworkMessage,
      broadcastNetworkMessage: state.broadcastNetworkMessage,
      simulateNetworkActivity: state.simulateNetworkActivity,
    }))
  );
};

/**
 * Selector for expert summoning functionality
 */
export function useExpertSummoning() {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      summonState: state.summonState,
      summonExpert: state.summonExpert,
      findExpertForDomain: state.findExpertForDomain,
      clearSummonState: state.clearSummonState,
      avatars: state.avatars, // Available experts
    }))
  );
}

// =============================================================================
// Chat Routing Selectors
// =============================================================================

export const useRoutingResult = () => useAvatarCouncilStore((state) => state.routingResult);
export const useIsRouting = () => useAvatarCouncilStore((state) => state.isRouting);
export const useChatExpertContribution = () => useAvatarCouncilStore((state) => state.chatExpertContribution);
export const useChatExpertStreaming = () => useAvatarCouncilStore((state) => state.chatExpertStreaming);
export const useIsSummoningChatExpert = () => useAvatarCouncilStore((state) => state.isSummoningChatExpert);

/**
 * Combined chat routing state for UI components
 */
export function useChatRouting() {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      routingResult: state.routingResult,
      isRouting: state.isRouting,
      requestRouting: state.requestRouting,
      clearRoutingResult: state.clearRoutingResult,
    }))
  );
}

/**
 * Chat expert summoning state for UI components
 */
export function useChatExpertSummoning() {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      chatExpertContribution: state.chatExpertContribution,
      chatExpertStreaming: state.chatExpertStreaming,
      isSummoningChatExpert: state.isSummoningChatExpert,
      summonChatExpert: state.summonChatExpert,
      clearChatExpert: state.clearChatExpert,
    }))
  );
}

// Chat Threads selectors
export const useChatThreads = () => useAvatarCouncilStore((state) => state.chatThreads);
export const useCurrentThreadId = () => useAvatarCouncilStore((state) => state.currentThreadId);
export const useActiveAvatarId = () => useAvatarCouncilStore((state) => state.activeAvatarId);

export function useChatThreadActions() {
  return useAvatarCouncilStore(
    useShallow((state) => ({
      chatThreads: state.chatThreads,
      currentThreadId: state.currentThreadId,
      activeAvatarId: state.activeAvatarId,
      createNewThread: state.createNewThread,
      switchThread: state.switchThread,
      deleteThread: state.deleteThread,
      setActiveAvatar: state.setActiveAvatar,
      updateThreadTitle: state.updateThreadTitle,
    }))
  );
}
