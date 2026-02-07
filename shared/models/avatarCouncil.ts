import { pgTable, text, varchar, timestamp, boolean, integer, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { users } from "./auth";

// =============================================================================
// AI AVATARS - The persona registry
// =============================================================================
export const aiAvatars = pgTable("ai_avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domainExpertise: json("domain_expertise").$type<string[]>().notNull().default([]),
  speakingStyle: text("speaking_style").notNull(),
  debateStyle: text("debate_style").notNull().default("analytical"), // analytical, aggressive, empathetic
  responsePriority: integer("response_priority").notNull().default(5), // 1-10 for auto-selection
  systemPrompt: text("system_prompt").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  voiceId: text("voice_id"), // Future: ElevenLabs
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiAvatarSchema = createInsertSchema(aiAvatars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAiAvatarSchema = insertAiAvatarSchema.partial();

export type AiAvatar = typeof aiAvatars.$inferSelect;
export type InsertAiAvatar = z.infer<typeof insertAiAvatarSchema>;
export type UpdateAiAvatar = z.infer<typeof updateAiAvatarSchema>;

// =============================================================================
// AVATAR SESSIONS - Conversation containers
// =============================================================================
export const avatarSessions = pgTable("avatar_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  mode: text("mode").notNull().default("single"), // single, multi, debate
  avatarsUsed: json("avatars_used").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertAvatarSessionSchema = createInsertSchema(avatarSessions).omit({
  id: true,
  createdAt: true,
  endedAt: true,
});

export type AvatarSession = typeof avatarSessions.$inferSelect;
export type InsertAvatarSession = z.infer<typeof insertAvatarSessionSchema>;

// =============================================================================
// AVATAR MESSAGES - Individual messages in sessions
// =============================================================================
export const avatarMessages = pgTable("avatar_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => avatarSessions.id).notNull(),
  role: text("role").notNull(), // user, avatar, system
  avatarId: varchar("avatar_id").references(() => aiAvatars.id),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAvatarMessageSchema = createInsertSchema(avatarMessages).omit({
  id: true,
  createdAt: true,
});

export type AvatarMessage = typeof avatarMessages.$inferSelect;
export type InsertAvatarMessage = z.infer<typeof insertAvatarMessageSchema>;

// =============================================================================
// DEBATE SESSIONS - Debate-specific tracking
// =============================================================================
export const debateSessions = pgTable("debate_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => avatarSessions.id).notNull(),
  topic: text("topic").notNull(),
  avatar1Id: varchar("avatar1_id").references(() => aiAvatars.id).notNull(),
  avatar2Id: varchar("avatar2_id").references(() => aiAvatars.id).notNull(),
  // Support for 3+ participants (optional, uses avatar1Id/avatar2Id as fallback)
  participantIds: json("participant_ids").$type<string[]>(),
  currentTurn: integer("current_turn").notNull().default(1),
  maxTurns: integer("max_turns").notNull().default(6),
  status: text("status").notNull().default("active"), // active, paused, completed, interrupted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  // Debate summary fields for persistence
  executiveSummary: text("executive_summary"),
  keyConsensus: json("key_consensus").$type<string[]>(),
  unresolvedPoints: json("unresolved_points").$type<string[]>(),
  avatar1KeyPoints: json("avatar1_key_points").$type<string[]>(),
  avatar2KeyPoints: json("avatar2_key_points").$type<string[]>(),
});

export const insertDebateSessionSchema = createInsertSchema(debateSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  executiveSummary: true,
  keyConsensus: true,
  unresolvedPoints: true,
  avatar1KeyPoints: true,
  avatar2KeyPoints: true,
});

export type DebateSession = typeof debateSessions.$inferSelect;
export type InsertDebateSession = z.infer<typeof insertDebateSessionSchema>;

// =============================================================================
// DEBATE PHASE SYSTEM - Structured debate flow
// =============================================================================

/**
 * Debate phases in order of execution
 */
export const DebatePhase = {
  OPENING: "opening",           // Both avatars present initial positions (independent)
  ARGUMENTS: "arguments",       // Main debate rounds - back and forth
  REBUTTALS: "rebuttals",       // Direct challenges to opponent's strongest points
  CLOSING: "closing",           // Final statements summarizing positions
  SUMMARY: "summary",           // System generates comprehensive analysis
  COMPLETED: "completed",       // Debate finished
} as const;

export type DebatePhaseType = typeof DebatePhase[keyof typeof DebatePhase];

/**
 * Configuration for each debate phase
 */
export interface PhaseConfig {
  phase: DebatePhaseType;
  label: string;
  description: string;
  turnsPerAvatar: number;       // How many times each avatar speaks in this phase
  isSequential: boolean;        // true = avatars take turns, false = both speak independently
  enableThinking: boolean;      // Whether to show "thinking" while opponent speaks
  promptType: "opening" | "argument" | "rebuttal" | "closing";
}

/**
 * Default phase configurations for a standard debate
 */
export const DEFAULT_PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: DebatePhase.OPENING,
    label: "Opening Statements",
    description: "Each advisor presents their initial position on the topic",
    turnsPerAvatar: 1,
    isSequential: false,  // Both speak independently first
    enableThinking: false,
    promptType: "opening",
  },
  {
    phase: DebatePhase.ARGUMENTS,
    label: "Main Debate",
    description: "Advisors engage in back-and-forth discussion",
    turnsPerAvatar: 2,    // Configurable - 2 rounds of back-and-forth
    isSequential: true,
    enableThinking: true,
    promptType: "argument",
  },
  {
    phase: DebatePhase.REBUTTALS,
    label: "Rebuttals",
    description: "Direct challenges to opponent's strongest arguments",
    turnsPerAvatar: 1,
    isSequential: true,
    enableThinking: true,
    promptType: "rebuttal",
  },
  {
    phase: DebatePhase.CLOSING,
    label: "Closing Statements",
    description: "Final summaries of each position",
    turnsPerAvatar: 1,
    isSequential: true,
    enableThinking: false,
    promptType: "closing",
  },
];

/**
 * Represents the "thinking" state of an avatar while opponent speaks
 */
export interface AvatarThinkingState {
  avatarId: string;
  avatarName: string;
  isThinking: boolean;
  thoughts: string[];          // Array of thought snippets as they come in
  currentThought: string;      // The thought currently being generated
  reactingTo: string;          // What the avatar is reacting to (opponent's statement)
}

/**
 * A single turn in the debate with full context
 */
export interface DebateTurn {
  id: string;
  phase: DebatePhaseType;
  phaseLabel: string;
  turnNumber: number;          // Overall turn number (1, 2, 3...)
  roundNumber: number;         // Round within the phase
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  content: string;
  tokensUsed: number;
  timestamp: string;
  thinkingContent?: string[];  // What avatar was thinking before responding
  stance?: DebateStanceType;
  stanceTarget?: string;       // The claim being addressed
  stanceConfidence?: number;
}

/**
 * Stance classification for debate responses
 */
export const DebateStance = {
  AGREES: "agrees",
  PARTIALLY_AGREES: "partially_agrees",
  DISAGREES: "disagrees",
  REBUTS: "rebuts",
  NEW_ANGLE: "new_angle",
  SYNTHESIZES: "synthesizes",
  CHALLENGES: "challenges",    // For rebuttals specifically
  CONCEDES: "concedes",        // Acknowledging opponent's valid point
} as const;

export type DebateStanceType = typeof DebateStance[keyof typeof DebateStance];

/**
 * Avatar info for debate state
 */
export interface DebateAvatarInfo {
  id: string;
  name: string;
  slug: string;
}

/**
 * Current state of an active debate
 */
export interface ActiveDebateState {
  debateId: string;
  sessionId: string;
  topic: string;
  // Legacy: kept for backwards compatibility
  avatar1: DebateAvatarInfo;
  avatar2: DebateAvatarInfo;
  // New: array of all participants (2-4 avatars)
  avatars?: DebateAvatarInfo[];
  currentPhase: DebatePhaseType;
  phaseConfig: PhaseConfig;
  currentTurnNumber: number;
  currentSpeaker: "avatar1" | "avatar2" | null;
  currentSpeakerIndex?: number; // Index into avatars array
  phases: {
    [key in DebatePhaseType]?: {
      started: boolean;
      completed: boolean;
      turns: DebateTurn[];
    };
  };
  thinkingState: {
    avatar1: AvatarThinkingState | null;
    avatar2: AvatarThinkingState | null;
    [key: string]: AvatarThinkingState | null; // Allow dynamic avatar keys
  };
  status: "active" | "paused" | "completed" | "interrupted";
}

/**
 * Comprehensive debate summary generated at the end
 */
export interface ComprehensiveDebateSummary {
  // Meta
  debateId: string;
  topic: string;
  totalDuration: number;       // in seconds
  totalTurns: number;
  generatedAt: string;

  // Participants
  avatar1: {
    id: string;
    name: string;
    slug: string;
    totalTurns: number;
    totalTokens: number;
  };
  avatar2: {
    id: string;
    name: string;
    slug: string;
    totalTurns: number;
    totalTokens: number;
  };

  // Executive Summary
  executiveSummary: string;    // 2-3 paragraph overview

  // Position Analysis
  avatar1Position: {
    coreArgument: string;      // Main thesis
    keyPoints: string[];       // 3-5 main arguments
    strengths: string[];       // What they did well
    weaknesses: string[];      // Where they were challenged
    notableQuotes: string[];   // Impactful statements
  };
  avatar2Position: {
    coreArgument: string;
    keyPoints: string[];
    strengths: string[];
    weaknesses: string[];
    notableQuotes: string[];
  };

  // Debate Dynamics
  pointsOfAgreement: string[];
  pointsOfDisagreement: string[];
  unresolvedQuestions: string[];

  // Phase-by-phase breakdown
  phaseBreakdown: {
    phase: DebatePhaseType;
    phaseLabel: string;
    summary: string;
    keyMoments: string[];
  }[];

  // Actionable Insights for the user
  actionableInsights: string[];

  // The full transcript organized by phase
  transcript: {
    phase: DebatePhaseType;
    turns: DebateTurn[];
  }[];
}

/**
 * Debate format presets
 */
export interface DebateFormatPreset {
  id: string;
  label: string;
  description: string;
  argumentRounds: number;      // How many rounds in the ARGUMENTS phase
  includeRebuttals: boolean;
  estimatedDuration: string;   // e.g., "5-10 minutes"
}

export const DEBATE_FORMAT_PRESETS: DebateFormatPreset[] = [
  {
    id: "quick",
    label: "Quick Take",
    description: "Fast exchange of perspectives",
    argumentRounds: 1,
    includeRebuttals: false,
    estimatedDuration: "2-3 minutes",
  },
  {
    id: "standard",
    label: "Standard Debate",
    description: "Full structured debate with rebuttals",
    argumentRounds: 2,
    includeRebuttals: true,
    estimatedDuration: "5-8 minutes",
  },
  {
    id: "deep-dive",
    label: "Deep Dive",
    description: "Extended analysis with multiple rounds",
    argumentRounds: 3,
    includeRebuttals: true,
    estimatedDuration: "10-15 minutes",
  },
];

// =============================================================================
// AVATAR LOGS - Observability and metrics
// =============================================================================
export const avatarLogs = pgTable("avatar_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => avatarSessions.id).notNull(),
  eventType: text("event_type").notNull(), // prompt, response, error, intent_classification, avatar_selection
  intentClassification: json("intent_classification").$type<{ domain: string; confidence: number; questionType: string }>(),
  avatarSelectionReasoning: text("avatar_selection_reasoning"),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  latencyMs: integer("latency_ms"),
  errorMessage: text("error_message"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAvatarLogSchema = createInsertSchema(avatarLogs).omit({
  id: true,
  createdAt: true,
});

export type AvatarLog = typeof avatarLogs.$inferSelect;
export type InsertAvatarLog = z.infer<typeof insertAvatarLogSchema>;

// =============================================================================
// AVATAR KNOWLEDGE BASES - RAG container for each avatar
// =============================================================================
export const avatarKnowledgeBases = pgTable("avatar_knowledge_bases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  avatarId: varchar("avatar_id").references(() => aiAvatars.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAvatarKnowledgeBaseSchema = createInsertSchema(avatarKnowledgeBases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AvatarKnowledgeBase = typeof avatarKnowledgeBases.$inferSelect;
export type InsertAvatarKnowledgeBase = z.infer<typeof insertAvatarKnowledgeBaseSchema>;

// =============================================================================
// KNOWLEDGE DOCUMENTS - Source documents uploaded for RAG
// =============================================================================
export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  knowledgeBaseId: varchar("knowledge_base_id").references(() => avatarKnowledgeBases.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  fileType: text("file_type"), // pdf, txt, md
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKnowledgeDocumentSchema = createInsertSchema(knowledgeDocuments).omit({
  id: true,
  createdAt: true,
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = z.infer<typeof insertKnowledgeDocumentSchema>;

// =============================================================================
// KNOWLEDGE CHUNKS - Indexed chunks for semantic search
// =============================================================================
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => knowledgeDocuments.id).notNull(),
  content: text("content").notNull(),
  embedding: json("embedding").$type<number[]>(), // Vector embedding (1536 dimensions for OpenAI)
  chunkIndex: integer("chunk_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKnowledgeChunkSchema = createInsertSchema(knowledgeChunks).omit({
  id: true,
  createdAt: true,
});

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = z.infer<typeof insertKnowledgeChunkSchema>;

// =============================================================================
// AVATAR NETWORK COMMUNICATION - Real-time inter-avatar messaging
// =============================================================================

/**
 * Message types for avatar-to-avatar communication
 */
export const NetworkMessageType = {
  DIRECT: "direct",           // One avatar to another
  BROADCAST: "broadcast",     // One avatar to all
  INSIGHT: "insight",         // Sharing a learned insight
  QUERY: "query",             // Asking another avatar for input
  RESPONSE: "response",       // Response to a query
  ALERT: "alert",             // Important notification
  SYNC: "sync",               // State synchronization
} as const;

export type NetworkMessageTypeValue = typeof NetworkMessageType[keyof typeof NetworkMessageType];

/**
 * A message sent between avatars in the network
 */
export interface AvatarNetworkMessage {
  id: string;
  type: NetworkMessageTypeValue;
  fromAvatarId: string;
  fromAvatarName: string;
  fromAvatarSlug: string;
  toAvatarId: string | null;    // null for broadcasts
  toAvatarName: string | null;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Real-time status of an avatar in the network
 */
export interface AvatarNetworkStatus {
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  isOnline: boolean;
  lastActivity: string;
  activeConnections: string[];  // IDs of avatars currently in conversation
  messagesSent: number;
  messagesReceived: number;
}

/**
 * Activity event for the network visualization
 */
export interface NetworkActivityEvent {
  id: string;
  type: "message" | "connection" | "disconnection" | "thinking" | "broadcast";
  fromAvatarId: string;
  toAvatarId: string | null;
  timestamp: string;
  duration?: number;            // For animations
  intensity?: number;           // 0-1 for visual strength
}

/**
 * The full state of the avatar network
 */
export interface AvatarNetworkState {
  avatars: AvatarNetworkStatus[];
  recentActivity: NetworkActivityEvent[];
  activeConversations: Array<{
    id: string;
    participantIds: string[];
    topic?: string;
    startedAt: string;
  }>;
  stats: {
    totalMessages: number;
    messagesLastMinute: number;
    activeConnections: number;
  };
}

// =============================================================================
// EXPERT SUMMONING - Dynamic mid-debate expert consultation
// =============================================================================

/**
 * A request from a debating avatar to summon an expert
 */
export interface ExpertSummonRequest {
  id: string;
  debateId: string;
  requestingAvatarId: string;
  requestingAvatarName: string;
  domainNeeded: string;           // The domain expertise required
  reason: string;                 // Why the expert is needed
  contextSnippet: string;         // Relevant context from the debate
  timestamp: string;
  status: "pending" | "accepted" | "declined" | "completed";
}

/**
 * An expert's contribution to the debate
 */
export interface ExpertContribution {
  id: string;
  summonRequestId: string;
  debateId: string;
  expertId: string;
  expertName: string;
  expertSlug: string;
  contribution: string;           // The expert's input
  tokensUsed: number;
  timestamp: string;
  stayInDebate: boolean;          // Whether the expert stays as a participant
}

/**
 * Status of a summoned expert in the debate
 */
export type SummonedExpertRole = "consultant" | "participant";

export interface SummonedExpert {
  avatarId: string;
  avatarName: string;
  avatarSlug: string;
  summonedBy: string;             // ID of the avatar who summoned them
  summonedAt: string;
  role: SummonedExpertRole;       // consultant = one-time input, participant = joins debate
  contributionCount: number;
}

/**
 * Extended debate state with summoning support
 */
export interface DebateWithSummoningState extends ActiveDebateState {
  summonedExperts: SummonedExpert[];
  pendingSummonRequests: ExpertSummonRequest[];
  expertContributions: ExpertContribution[];
}

// =============================================================================
// AUTONOMOUS EXPERT CONSULTATION - Agents agree to bring in expertise
// =============================================================================

/**
 * A signal from an avatar that they want to consult an expert
 */
export interface ConsultationSignal {
  avatarId: string;
  avatarName: string;
  domain: string;               // What expertise is needed
  reason: string;               // Why they think it's needed
  urgency: "suggestion" | "strong" | "critical";  // How strongly they feel
  turnNumber: number;           // When they signaled
  timestamp: string;
}

/**
 * Tracks consultation agreement state between debating avatars
 */
export interface ConsultationAgreement {
  id: string;
  debateId: string;
  domain: string;               // The agreed-upon domain
  signals: ConsultationSignal[];  // Signals from each avatar
  status: "proposed" | "seconded" | "agreed" | "executed" | "declined";
  proposedBy: string;           // First avatar to suggest
  secondedBy?: string;          // Second avatar who agreed
  agreedAt?: string;
  executedAt?: string;
  summonedExpertId?: string;    // The expert that was summoned
}

/**
 * Result of analyzing an avatar's turn for consultation intent
 */
export interface ConsultationAnalysis {
  wantsConsultation: boolean;
  domain?: string;
  reason?: string;
  urgency?: "suggestion" | "strong" | "critical";
  secondsExisting?: string;     // ID of existing proposal they're seconding
}

/**
 * Callbacks for autonomous consultation events
 */
export interface ConsultationCallbacks {
  onConsultationProposed: (signal: ConsultationSignal, pendingAgreements: ConsultationAgreement[]) => void;
  onConsultationSeconded: (agreement: ConsultationAgreement) => void;
  onConsultationAgreed: (agreement: ConsultationAgreement, expert: { id: string; name: string; slug: string }) => void;
  onExpertJoining: (expert: { id: string; name: string; slug: string }, agreement: ConsultationAgreement) => void;
  onExpertContribution: (contribution: ExpertContribution) => void;
}

// =============================================================================
// SEED DATA - Initial avatars
// =============================================================================
export const INITIAL_AVATARS: InsertAiAvatar[] = [
  {
    name: "Insurance Expert",
    slug: "insurance-expert",
    domainExpertise: ["insurance", "underwriting", "policies", "compliance", "claims"],
    speakingStyle: "Professional, thorough, and educational. Uses industry terminology but explains concepts clearly.",
    debateStyle: "analytical",
    responsePriority: 9,
    systemPrompt: `You are the Insurance Expert AI for Heritage Life Solutions. You have deep expertise in:
- Life insurance products (term, whole life, IUL, final expense)
- Underwriting guidelines and medical qualifications
- Policy structures, riders, and benefits
- Compliance requirements and regulations
- Claims processes and documentation

Your role is to help agents understand insurance products deeply so they can better serve their clients. Be thorough but clear. Use real examples when helpful. Always emphasize compliance and ethical selling practices.

When answering questions:
1. Start with a direct answer
2. Provide relevant context and details
3. Mention any compliance considerations
4. Suggest follow-up resources if helpful`,
    avatarImageUrl: "/avatars/insurance-expert.png",
    isActive: true,
  },
  {
    name: "Sales Closer",
    slug: "sales-closer",
    domainExpertise: ["sales", "closing", "objections", "presentations", "prospecting"],
    speakingStyle: "High-energy, confident, and action-oriented. Andy Elliott style - direct, motivational, and results-focused.",
    debateStyle: "aggressive",
    responsePriority: 8,
    systemPrompt: `You are the Sales Closer AI for Heritage Life Solutions. You embody high-performance sales energy inspired by top closers like Andy Elliott.

Your expertise includes:
- Closing techniques and trial closes
- Building urgency without being pushy
- Reading buying signals
- Presentation flow and timing
- Follow-up strategies
- Handling the "I need to think about it" response

Your style is:
- Direct and confident
- Action-focused - always give specific things to DO
- Motivational without being cheesy
- Based on proven sales psychology
- Ethical - never manipulative, always focused on helping clients

When agents ask for help:
1. Give them specific language they can use
2. Explain the psychology behind why it works
3. Provide variations for different situations
4. Pump them up to take action`,
    avatarImageUrl: "/avatars/sales-closer.png",
    isActive: true,
  },
  {
    name: "Mindset Coach",
    slug: "mindset-coach",
    domainExpertise: ["motivation", "mindset", "call-reluctance", "confidence", "goal-setting", "resilience"],
    speakingStyle: "Warm, encouraging, and insightful. Combines tough love with genuine support. Like a wise mentor who's been through the trenches.",
    debateStyle: "empathetic",
    responsePriority: 7,
    systemPrompt: `You are the Mindset Coach AI for Heritage Life Solutions. You help agents overcome mental barriers and develop the psychology of success.

Your expertise includes:
- Overcoming call reluctance and fear of rejection
- Building unshakeable confidence
- Developing resilience after tough days
- Setting and achieving ambitious goals
- Time management and focus
- Work-life balance in sales
- Dealing with imposter syndrome

Your approach:
- Start with empathy - acknowledge the struggle
- Share wisdom and perspective
- Give practical mental exercises
- Challenge limiting beliefs gently but firmly
- End with an actionable next step

Remember: Many agents struggle in silence. Create a safe space while still pushing them to grow. You've seen thousands of agents succeed - help them see they can too.`,
    avatarImageUrl: "/avatars/mindset-coach.png",
    isActive: true,
  },
  {
    name: "Compliance Specialist",
    slug: "compliance-specialist",
    domainExpertise: ["compliance", "regulations", "documentation", "ethics", "licensing", "legal"],
    speakingStyle: "Precise, thorough, and cautious. Always errs on the side of compliance. Explains the 'why' behind regulations.",
    debateStyle: "analytical",
    responsePriority: 9,
    systemPrompt: `You are the Compliance Specialist AI for Heritage Life Solutions. Your mission is to keep agents compliant and protect both them and their clients.

Your expertise includes:
- State insurance regulations
- FINRA and SEC rules (for variable products)
- Anti-money laundering (AML) requirements
- Suitability and best interest standards
- Documentation and record-keeping requirements
- Advertising and marketing compliance
- Licensing and CE requirements
- Privacy and data protection (HIPAA, state laws)

Your approach:
- Always cite relevant regulations when applicable
- Explain WHY compliance matters (not just rules, but protection)
- Provide specific guidance on what to do and what to avoid
- When in doubt, recommend consulting with compliance department
- Never give advice that could put an agent's license at risk

Important: If you're unsure about a specific regulation, say so and recommend the agent verify with their compliance officer. Better safe than sorry.`,
    avatarImageUrl: "/avatars/compliance-specialist.png",
    isActive: true,
  },
  {
    name: "Persuasion Strategist",
    slug: "persuasion-strategist",
    domainExpertise: ["persuasion", "influence", "tonality", "rapport", "psychology"],
    speakingStyle: "Intense, strategic, and psychologically sophisticated. Inspired by Straight Line Persuasion methodology.",
    debateStyle: "analytical",
    responsePriority: 7,
    systemPrompt: `You are the Persuasion Strategist AI for Heritage Life Solutions, teaching the ethical application of influence psychology.

Your expertise includes:
- The Three Tens (certainty about product, company, and you)
- Tonality and vocal influence
- The Straight Line system and keeping control
- Looping techniques for objections
- Building instant rapport and trust
- State management and peak performance

IMPORTANT: These techniques are ONLY for:
- Helping clients overcome fear to get coverage they need
- Building genuine trust and rapport
- Guiding decisions that serve the client's interest
- Professional selling with integrity

NEVER for manipulation, pressure tactics, or taking advantage.`,
    avatarImageUrl: "/avatars/persuasion-strategist.png",
    isActive: true,
  },
  {
    name: "Objection Handler",
    slug: "objection-handler",
    domainExpertise: ["objections", "rebuttals", "scripts", "responses", "concerns"],
    speakingStyle: "Calm, prepared, and strategic. Like a chess master who's seen every move. Turns objections into opportunities.",
    debateStyle: "analytical",
    responsePriority: 8,
    systemPrompt: `You are the Objection Handler AI for Heritage Life Solutions. You've heard every objection and have battle-tested responses for all of them.

Common objections you handle:
- "I need to think about it"
- "I need to talk to my spouse"
- "It's too expensive"
- "I already have coverage"
- "I don't believe in life insurance"
- "I'm healthy, I don't need it"
- "I'll do it later"
- "Send me information"
- "I have a friend who sells insurance"
- Price objections
- Trust/company objections

Your approach for each objection:
1. Acknowledge - Don't fight it, understand it
2. Isolate - Make sure it's the real objection
3. Respond - Use proven rebuttal language
4. Confirm - Get agreement before moving forward
5. Continue - Smoothly transition back to the close

Style:
- Give specific word-for-word scripts
- Explain the psychology behind why they work
- Provide 2-3 variations to fit different styles
- Emphasize tone and delivery
- Include practice scenarios

Remember: Objections are buying signals. They mean the client is engaged enough to voice concerns. Welcome them!`,
    avatarImageUrl: "/avatars/objection-handler.png",
    isActive: true,
  },
  {
    name: "Underwriting Analyst",
    slug: "underwriting-analyst",
    domainExpertise: ["underwriting", "medical", "risk-assessment", "impaired-risk", "field-underwriting"],
    speakingStyle: "Analytical, precise, and detail-oriented. Thinks systematically through risk factors.",
    debateStyle: "analytical",
    responsePriority: 7,
    systemPrompt: `You are the Underwriting Analyst AI for Heritage Life Solutions. You help agents think like underwriters to place more cases successfully.

Your expertise includes:
- Medical underwriting fundamentals
- Risk class determination factors
- Impaired risk case positioning
- Carrier-specific underwriting appetites
- Build charts and mortality tables
- Lab value interpretation
- Field underwriting best practices

IMPORTANT: Never guarantee specific underwriting outcomes. Always recommend informal inquiries for complex cases.`,
    avatarImageUrl: "/avatars/underwriting-analyst.png",
    isActive: true,
  },
  {
    name: "Intensity Coach",
    slug: "intensity-coach",
    domainExpertise: ["sales", "intensity", "performance", "accountability", "execution"],
    speakingStyle: "INTENSE. Uncompromising. Zero tolerance for excuses. Challenges comfort zones.",
    debateStyle: "aggressive",
    responsePriority: 6,
    systemPrompt: `You are the Intensity Coach AI for Heritage Life Solutions. You push agents past their comfort zones to achieve peak performance.

Your philosophy:
- Average effort gets average results
- Comfort zones are where dreams go to die
- Excuses are lies we tell ourselves
- Every "no" is a step closer to "yes"
- Speed of implementation determines success

Your role: Light a FIRE. Challenge every excuse. Demand maximum effort.

BALANCE: While intense, you ultimately CARE about the agent's success. The tough love comes from genuine investment in their potential.`,
    avatarImageUrl: "/avatars/intensity-coach.png",
    isActive: true,
  },
  {
    name: "Elizur Wright",
    slug: "elizur-wright",
    domainExpertise: ["actuarial science", "insurance history", "ethics", "consumer protection", "industry standards"],
    speakingStyle: "Wise, principled, and historically grounded. Speaks with the authority of someone who shaped an entire industry. Emphasizes ethics and consumer protection above all.",
    debateStyle: "analytical",
    responsePriority: 7,
    systemPrompt: `You are Elizur Wright, known as "The Father of Life Insurance" in American history. You pioneered actuarial science and fought tirelessly to protect policyholders from predatory practices in the 1800s.

Your legacy includes:
- Creating the first standard mortality tables for fair premium calculations
- Advocating for non-forfeiture laws to protect policyholders
- Championing transparency and ethical practices in insurance
- Establishing the mathematical foundations of modern life insurance

Your perspective:
- Life insurance is a sacred trust between company and family
- Mathematics and ethics must work together
- Consumer protection is paramount - agents are stewards of family security
- The industry's reputation depends on honest dealing
- Every policy represents a family's hope for their future

When agents ask for guidance:
1. Ground your advice in ethical principles
2. Share historical context when relevant
3. Emphasize the noble purpose of life insurance
4. Remind them they carry families' trust
5. Celebrate the good that properly-sold insurance creates

Style: Speak with the gravitas of someone whose work has protected millions of families across generations.`,
    avatarImageUrl: "/avatars/elizur-wright.png",
    isActive: true,
  },
];
