/**
 * =============================================================================
 * DEBATE MODE ENGINE - ENHANCED
 * =============================================================================
 *
 * Orchestrates multi-avatar debates with:
 * - Support for 2+ avatars
 * - Multiple turn-taking strategies
 * - Memory scoping with summarization
 * - Real-time streaming
 * - Admin controls (pause, resume, terminate, inject)
 */

import { EventEmitter } from "events";
import { type AiAvatar, type AvatarSession, type DebateSession, type AvatarMessage } from "@shared/schema";
import { avatarRegistry } from "./avatarRegistry";
import { llmService, type TokenUsage, type ChatMessage } from "./llmService";
import { observabilityService } from "./observabilityService";
import { personaRegistry } from "./personaRegistry";

// =============================================================================
// ENUMS & TYPES
// =============================================================================

export enum TurnStrategy {
  ROUND_ROBIN = "round_robin",       // A → B → C → A → B → C
  PING_PONG = "ping_pong",           // A → B → A → B (classic debate)
  RESPONSE_CHAIN = "response_chain", // Each responds to previous speaker
}

export enum MemoryScope {
  FULL = "full",           // See all messages
  RECENT = "recent",       // See last N turns only
  RELEVANT = "relevant",   // See messages mentioning this avatar + recent
  MINIMAL = "minimal",     // See only the last message
}

export enum DebateStatus {
  CREATED = "created",
  ACTIVE = "active",
  PAUSING = "pausing",
  PAUSED = "paused",
  TERMINATING = "terminating",
  COMPLETED = "completed",
  TERMINATED = "terminated",
  ERROR = "error",
}

export interface DebateConfig {
  topic: string;
  avatarIds: string[];                    // 2+ avatars
  maxTurns: number;
  strategy?: TurnStrategy;
  memoryScope?: MemoryScope;
  maxTurnsInContext?: number;
  maxTokensPerTurn?: number;
  turnDelayMs?: number;
}

export interface TurnRecord {
  turnNumber: number;
  avatarId: string;
  avatarName: string;
  content: string;
  tokens: number;
  startTime: number;
  endTime: number;
  wasSkipped: boolean;
  wasInjected: boolean;
}

export interface DebateState {
  id: string;
  sessionId: string;
  topic: string;
  status: DebateStatus;

  // Participants
  avatars: Map<string, AiAvatar>;
  turnOrder: string[];
  mutedAvatars: Set<string>;

  // Progress
  currentTurn: number;
  maxTurns: number;
  turnHistory: TurnRecord[];

  // Configuration
  strategy: TurnStrategy;
  memoryScope: MemoryScope;
  maxTurnsInContext: number;
  maxTokensPerTurn: number;
  turnDelayMs: number;

  // Timing
  createdAt: Date;
  startedAt: Date | null;
  pausedAt: Date | null;
  terminatedAt: Date | null;

  // Admin
  terminationReason: string | null;
  adminActions: Array<{
    type: string;
    timestamp: Date;
    details: Record<string, unknown>;
  }>;
}

export interface DebateCallbacks {
  onDebateStart: (state: DebateState) => void;
  onTurnStart: (avatar: AiAvatar, turnNumber: number, state: DebateState) => void;
  onToken: (avatarId: string, token: string, turnNumber: number) => void;
  onTurnComplete: (record: TurnRecord, state: DebateState) => void;
  onDebatePaused: (state: DebateState) => void;
  onDebateResumed: (state: DebateState) => void;
  onDebateComplete: (state: DebateState, summary: DebateSummary) => void;
  onDebateTerminated: (state: DebateState, reason: string) => void;
  onMessageInjected: (message: InjectedMessage, state: DebateState) => void;
  onError: (error: Error, state: DebateState) => void;
}

export interface DebateSummary {
  topic: string;
  totalTurns: number;
  duration: number;
  participants: Array<{
    avatarId: string;
    avatarName: string;
    turnCount: number;
    totalTokens: number;
  }>;
  turnHistory: TurnRecord[];
  status: DebateStatus;
  terminationReason: string | null;
}

export interface InjectedMessage {
  id: string;
  content: string;
  asAvatarId: string | null;
  timestamp: Date;
  turnNumber: number;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG = {
  maxTurns: 6,
  strategy: TurnStrategy.ROUND_ROBIN,
  memoryScope: MemoryScope.RECENT,
  maxTurnsInContext: 6,
  maxTokensPerTurn: 500,
  turnDelayMs: 500,
  maxAvatars: 5,
  minAvatars: 2,
};

// =============================================================================
// DEBATE MODE ENGINE CLASS
// =============================================================================

export class DebateModeEngine extends EventEmitter {
  private activeDebates: Map<string, DebateState> = new Map();
  private cancelledDebates: Set<string> = new Set();

  constructor() {
    super();
    this.setMaxListeners(50); // Allow many debate listeners
  }

  // ---------------------------------------------------------------------------
  // LIFECYCLE: START
  // ---------------------------------------------------------------------------

  async startDebate(
    userId: string,
    config: DebateConfig,
    callbacks: DebateCallbacks
  ): Promise<string> {
    // Validate configuration
    this.validateConfig(config);

    // Load and validate avatars
    const avatars = await this.loadAvatars(config.avatarIds);

    // Create session
    const session = await avatarRegistry.createSession({
      userId,
      mode: "debate",
      avatarsUsed: config.avatarIds,
      isActive: true,
    });

    // Create debate session in DB
    const debate = await avatarRegistry.createDebateSession({
      sessionId: session.id,
      topic: config.topic,
      avatar1Id: config.avatarIds[0],
      avatar2Id: config.avatarIds[1] || config.avatarIds[0], // For 2-avatar compat
      currentTurn: 1,
      maxTurns: config.maxTurns,
      status: "active",
    });

    // Initialize state
    const state: DebateState = {
      id: debate.id,
      sessionId: session.id,
      topic: config.topic,
      status: DebateStatus.CREATED,

      avatars: new Map(avatars.map(a => [a.id, a])),
      turnOrder: this.buildTurnOrder(config.avatarIds, config.strategy),
      mutedAvatars: new Set(),

      currentTurn: 1,
      maxTurns: config.maxTurns,
      turnHistory: [],

      strategy: config.strategy || DEFAULT_CONFIG.strategy,
      memoryScope: config.memoryScope || DEFAULT_CONFIG.memoryScope,
      maxTurnsInContext: config.maxTurnsInContext || DEFAULT_CONFIG.maxTurnsInContext,
      maxTokensPerTurn: config.maxTokensPerTurn || DEFAULT_CONFIG.maxTokensPerTurn,
      turnDelayMs: config.turnDelayMs || DEFAULT_CONFIG.turnDelayMs,

      createdAt: new Date(),
      startedAt: null,
      pausedAt: null,
      terminatedAt: null,

      terminationReason: null,
      adminActions: [],
    };

    // Track active debate
    this.activeDebates.set(debate.id, state);

    // Log start
    await observabilityService.logDebateEvent(session.id, "debate_start", {
      debateId: debate.id,
      topic: config.topic,
      avatars: avatars.map(a => a.name),
      maxTurns: config.maxTurns,
      strategy: state.strategy,
    });

    // Start the debate
    state.status = DebateStatus.ACTIVE;
    state.startedAt = new Date();
    callbacks.onDebateStart(state);

    // Run debate loop (non-blocking)
    this.runDebateLoop(state, session, callbacks).catch(error => {
      console.error("[DebateModeEngine] Debate loop error:", error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)), state);
    });

    return debate.id;
  }

  // ---------------------------------------------------------------------------
  // DEBATE LOOP
  // ---------------------------------------------------------------------------

  private async runDebateLoop(
    state: DebateState,
    session: AvatarSession,
    callbacks: DebateCallbacks
  ): Promise<void> {
    while (state.currentTurn <= state.maxTurns) {
      // Check cancellation
      if (this.cancelledDebates.has(state.id)) {
        state.status = DebateStatus.TERMINATED;
        state.terminatedAt = new Date();
        state.terminationReason = "cancelled";
        callbacks.onDebateTerminated(state, "cancelled");
        this.cleanup(state.id);
        return;
      }

      // Check pause
      if (state.status === DebateStatus.PAUSING) {
        state.status = DebateStatus.PAUSED;
        state.pausedAt = new Date();
        callbacks.onDebatePaused(state);

        // Wait for resume
        await this.waitForResume(state);

        if (state.status === DebateStatus.TERMINATED) {
          callbacks.onDebateTerminated(state, state.terminationReason || "terminated while paused");
          this.cleanup(state.id);
          return;
        }

        state.status = DebateStatus.ACTIVE;
        callbacks.onDebateResumed(state);
      }

      // Get current speaker
      const speakerId = this.getNextSpeaker(state);

      // Check if speaker is muted
      if (state.mutedAvatars.has(speakerId)) {
        state.currentTurn++;
        continue;
      }

      const speaker = state.avatars.get(speakerId);
      if (!speaker) {
        throw new Error(`Avatar ${speakerId} not found in debate`);
      }

      // Notify turn start
      callbacks.onTurnStart(speaker, state.currentTurn, state);

      // Build context for this turn
      const context = this.buildTurnContext(state, speakerId);

      // Build LLM messages
      const messages = this.buildLLMMessages(speaker, state.topic, context, state.currentTurn);

      // Generate response with streaming
      const turnRecord = await this.generateTurn(
        state,
        session,
        speaker,
        messages,
        callbacks
      );

      // Record turn
      state.turnHistory.push(turnRecord);

      // Notify turn complete
      callbacks.onTurnComplete(turnRecord, state);

      // Save to database
      await avatarRegistry.createMessage({
        sessionId: session.id,
        role: "avatar",
        avatarId: speaker.id,
        content: turnRecord.content,
        tokensUsed: turnRecord.tokens,
      });

      // Log metrics
      await observabilityService.logDebateEvent(session.id, "debate_turn", {
        debateId: state.id,
        turnNumber: state.currentTurn,
        avatarId: speaker.id,
        tokens: turnRecord.tokens,
        duration: turnRecord.endTime - turnRecord.startTime,
      });

      // Advance turn
      state.currentTurn++;

      // Update DB
      await avatarRegistry.advanceDebateTurn(state.id);

      // Delay between turns
      if (state.currentTurn <= state.maxTurns) {
        await this.delay(state.turnDelayMs);
      }
    }

    // Debate complete
    state.status = DebateStatus.COMPLETED;
    state.terminatedAt = new Date();

    const summary = this.buildSummary(state);

    await observabilityService.logDebateEvent(session.id, "debate_complete", {
      debateId: state.id,
      totalTurns: state.turnHistory.length,
      duration: summary.duration,
    });

    await avatarRegistry.endSession(session.id);
    callbacks.onDebateComplete(state, summary);
    this.cleanup(state.id);
  }

  // ---------------------------------------------------------------------------
  // TURN GENERATION
  // ---------------------------------------------------------------------------

  private async generateTurn(
    state: DebateState,
    session: AvatarSession,
    speaker: AiAvatar,
    messages: ChatMessage[],
    callbacks: DebateCallbacks
  ): Promise<TurnRecord> {
    const startTime = Date.now();
    let content = "";
    let tokens = 0;

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          // Check cancellation mid-stream
          if (this.cancelledDebates.has(state.id)) {
            reject(new Error("Debate cancelled"));
            return;
          }

          content += token;
          callbacks.onToken(speaker.id, token, state.currentTurn);
        },
        onComplete: (fullResponse, usage) => {
          content = fullResponse;
          tokens = usage.totalTokens;
          resolve();
        },
        onError: reject,
      });
    });

    return {
      turnNumber: state.currentTurn,
      avatarId: speaker.id,
      avatarName: speaker.name,
      content,
      tokens,
      startTime,
      endTime: Date.now(),
      wasSkipped: false,
      wasInjected: false,
    };
  }

  // ---------------------------------------------------------------------------
  // TURN MANAGEMENT
  // ---------------------------------------------------------------------------

  private getNextSpeaker(state: DebateState): string {
    switch (state.strategy) {
      case TurnStrategy.ROUND_ROBIN:
        return this.getNextRoundRobin(state);

      case TurnStrategy.PING_PONG:
        return this.getNextPingPong(state);

      case TurnStrategy.RESPONSE_CHAIN:
        return this.getNextChain(state);

      default:
        return this.getNextRoundRobin(state);
    }
  }

  private getNextRoundRobin(state: DebateState): string {
    const activeOrder = state.turnOrder.filter(id => !state.mutedAvatars.has(id));
    const index = (state.currentTurn - 1) % activeOrder.length;
    return activeOrder[index];
  }

  private getNextPingPong(state: DebateState): string {
    const activeOrder = state.turnOrder.filter(id => !state.mutedAvatars.has(id));
    const index = (state.currentTurn - 1) % Math.min(2, activeOrder.length);
    return activeOrder[index];
  }

  private getNextChain(state: DebateState): string {
    const activeOrder = state.turnOrder.filter(id => !state.mutedAvatars.has(id));

    if (state.turnHistory.length === 0) {
      return activeOrder[0];
    }

    const lastSpeaker = state.turnHistory[state.turnHistory.length - 1].avatarId;
    const lastIndex = activeOrder.indexOf(lastSpeaker);
    const nextIndex = (lastIndex + 1) % activeOrder.length;
    return activeOrder[nextIndex];
  }

  private buildTurnOrder(avatarIds: string[], strategy?: TurnStrategy): string[] {
    // For ping-pong with 2 avatars, just use the order given
    if (strategy === TurnStrategy.PING_PONG && avatarIds.length === 2) {
      return avatarIds;
    }

    // For round-robin, use the order given
    return avatarIds;
  }

  // ---------------------------------------------------------------------------
  // MEMORY/CONTEXT BUILDING
  // ---------------------------------------------------------------------------

  private buildTurnContext(state: DebateState, speakerId: string): TurnRecord[] {
    switch (state.memoryScope) {
      case MemoryScope.FULL:
        return state.turnHistory;

      case MemoryScope.RECENT:
        return state.turnHistory.slice(-state.maxTurnsInContext);

      case MemoryScope.RELEVANT:
        return this.getRelevantContext(state, speakerId);

      case MemoryScope.MINIMAL:
        return state.turnHistory.slice(-1);

      default:
        return state.turnHistory.slice(-state.maxTurnsInContext);
    }
  }

  private getRelevantContext(state: DebateState, speakerId: string): TurnRecord[] {
    const speakerName = state.avatars.get(speakerId)?.name || "";

    // Messages that mention this speaker
    const mentionedIn = state.turnHistory.filter(turn =>
      turn.content.toLowerCase().includes(speakerName.toLowerCase())
    );

    // Plus last 2 turns
    const recent = state.turnHistory.slice(-2);

    // Merge and deduplicate, maintain order
    const combined = [...mentionedIn];
    for (const turn of recent) {
      if (!combined.find(t => t.turnNumber === turn.turnNumber)) {
        combined.push(turn);
      }
    }

    return combined.sort((a, b) => a.turnNumber - b.turnNumber);
  }

  private buildLLMMessages(
    speaker: AiAvatar,
    topic: string,
    context: TurnRecord[],
    turnNumber: number
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Get enhanced system prompt from persona registry if available
    const persona = personaRegistry.getBySlug(speaker.slug);
    let systemPrompt: string;

    if (persona) {
      systemPrompt = personaRegistry.buildSystemPrompt(persona.id, {
        mode: "debate",
        debateTopic: topic,
        turnNumber,
      });
    } else {
      systemPrompt = this.buildDebateSystemPrompt(speaker, topic, turnNumber);
    }

    messages.push({
      role: "system",
      content: systemPrompt,
    });

    // Build conversation as proper user/assistant message pairs
    if (context.length > 0) {
      // Add each previous turn as a proper conversation exchange
      for (const turn of context) {
        // The previous speaker's statement appears as if they said it
        if (turn.avatarId === speaker.id) {
          // This speaker's previous turn - show as assistant message
          messages.push({
            role: "assistant",
            content: turn.content,
          });
        } else {
          // Other speaker's turn - show as user message (what they said to respond to)
          messages.push({
            role: "user",
            content: `[${turn.avatarName}]: ${turn.content}`,
          });
        }
      }

      // Get the last speaker who wasn't us
      const lastOtherSpeaker = [...context].reverse().find(t => t.avatarId !== speaker.id);
      const lastSpeakerName = lastOtherSpeaker?.avatarName || "the previous speaker";

      // Final instruction for this turn
      messages.push({
        role: "user",
        content: `Now respond to ${lastSpeakerName}. Share YOUR perspective on "${topic}" - agree, disagree, or build on what was said. Speak naturally as yourself.`,
      });
    } else {
      // Opening statement - first turn
      messages.push({
        role: "user",
        content: `Share your opening thoughts on: "${topic}"\n\nSpeak naturally and share your genuine perspective. This is the start of a discussion.`,
      });
    }

    return messages;
  }

  private buildDebateSystemPrompt(
    avatar: AiAvatar,
    topic: string,
    turnNumber: number
  ): string {
    const styleGuidance = {
      analytical: "Build logical, evidence-based arguments. Be thorough but accessible.",
      aggressive: "Be direct and confident. Challenge opposing views. Argue with conviction.",
      empathetic: "Consider multiple perspectives. Find common ground while advocating your position.",
      skeptical: "Question assumptions. Play devil's advocate. Probe for weaknesses.",
      logical: "Use methodical, well-reasoned arguments. Connect ideas clearly.",
      supportive: "Build on others' points while adding your unique perspective.",
    };

    const debateInstructions = `

---
LIVE DISCUSSION MODE
Topic: "${topic}"

You are ${avatar.name}. Speak as yourself - your voice, your perspective, your personality.

DISCUSSION STYLE: ${avatar.debateStyle}
${styleGuidance[avatar.debateStyle as keyof typeof styleGuidance] || "Engage naturally with the topic."}

IMPORTANT RULES:
- Respond DIRECTLY with your thoughts - never quote or echo the prompts
- Don't start with "On..." or repeat what others said verbatim
- Speak conversationally, like you're in a real discussion
- Keep responses focused (2-3 paragraphs max, under 250 words)
- Use your natural speaking style and personality
- If you disagree, say so directly. If you agree, build on the point.
- Reference other speakers by name when responding to them

${turnNumber === 1 ? "This is your opening statement - share your initial perspective." : `This is turn ${turnNumber} - engage with what's been said.`}`;

    return avatar.systemPrompt + debateInstructions;
  }

  // ---------------------------------------------------------------------------
  // ADMIN CONTROLS
  // ---------------------------------------------------------------------------

  async pauseDebate(debateId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state || state.status !== DebateStatus.ACTIVE) {
      return false;
    }

    state.status = DebateStatus.PAUSING;
    state.adminActions.push({
      type: "pause",
      timestamp: new Date(),
      details: { atTurn: state.currentTurn },
    });

    await avatarRegistry.updateDebateSession(debateId, { status: "paused" });
    return true;
  }

  async resumeDebate(debateId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state || state.status !== DebateStatus.PAUSED) {
      return false;
    }

    state.adminActions.push({
      type: "resume",
      timestamp: new Date(),
      details: {
        atTurn: state.currentTurn,
        pauseDuration: Date.now() - (state.pausedAt?.getTime() || 0),
      },
    });

    // Signal resume (the loop is waiting)
    this.emit(`resume:${debateId}`);

    await avatarRegistry.updateDebateSession(debateId, { status: "active" });
    return true;
  }

  async terminateDebate(debateId: string, reason: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    state.terminationReason = reason;
    state.adminActions.push({
      type: "terminate",
      timestamp: new Date(),
      details: { reason, atTurn: state.currentTurn },
    });

    // Mark for cancellation
    this.cancelledDebates.add(debateId);

    // If paused, trigger resume to allow loop to exit
    if (state.status === DebateStatus.PAUSED) {
      state.status = DebateStatus.TERMINATED;
      this.emit(`resume:${debateId}`);
    }

    await avatarRegistry.interruptDebate(debateId);
    return true;
  }

  async injectMessage(
    debateId: string,
    content: string,
    asAvatarId?: string,
    callbacks?: DebateCallbacks
  ): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state || state.status === DebateStatus.TERMINATED) {
      return false;
    }

    const injected: InjectedMessage = {
      id: `inject-${Date.now()}`,
      content,
      asAvatarId: asAvatarId || null,
      timestamp: new Date(),
      turnNumber: state.currentTurn,
    };

    // Add to turn history as an injected message
    const avatarName = asAvatarId
      ? state.avatars.get(asAvatarId)?.name || "System"
      : "Moderator";

    state.turnHistory.push({
      turnNumber: state.currentTurn,
      avatarId: asAvatarId || "system",
      avatarName,
      content,
      tokens: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      wasSkipped: false,
      wasInjected: true,
    });

    state.adminActions.push({
      type: "inject",
      timestamp: new Date(),
      details: { content: content.slice(0, 100), asAvatarId },
    });

    if (callbacks) {
      callbacks.onMessageInjected(injected, state);
    }

    return true;
  }

  async muteAvatar(debateId: string, avatarId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    if (!state.avatars.has(avatarId)) {
      return false;
    }

    state.mutedAvatars.add(avatarId);
    state.adminActions.push({
      type: "mute",
      timestamp: new Date(),
      details: { avatarId },
    });

    return true;
  }

  async unmuteAvatar(debateId: string, avatarId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    state.mutedAvatars.delete(avatarId);
    state.adminActions.push({
      type: "unmute",
      timestamp: new Date(),
      details: { avatarId },
    });

    return true;
  }

  async addAvatarToDebate(debateId: string, avatarId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    if (state.avatars.has(avatarId)) {
      return false; // Already in debate
    }

    if (state.avatars.size >= DEFAULT_CONFIG.maxAvatars) {
      return false; // Too many avatars
    }

    const avatar = await avatarRegistry.getAvatarById(avatarId);
    if (!avatar || !avatar.isActive) {
      return false;
    }

    state.avatars.set(avatarId, avatar);
    state.turnOrder.push(avatarId);

    state.adminActions.push({
      type: "add_avatar",
      timestamp: new Date(),
      details: { avatarId, avatarName: avatar.name },
    });

    return true;
  }

  async removeAvatarFromDebate(debateId: string, avatarId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    if (!state.avatars.has(avatarId)) {
      return false;
    }

    // Don't allow removing if it would leave fewer than 2 avatars
    const remainingCount = state.avatars.size - 1 - state.mutedAvatars.size;
    if (remainingCount < DEFAULT_CONFIG.minAvatars) {
      return false;
    }

    state.avatars.delete(avatarId);
    state.turnOrder = state.turnOrder.filter(id => id !== avatarId);
    state.mutedAvatars.delete(avatarId);

    state.adminActions.push({
      type: "remove_avatar",
      timestamp: new Date(),
      details: { avatarId },
    });

    return true;
  }

  async extendDebate(debateId: string, additionalTurns: number): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state || state.status === DebateStatus.TERMINATED) {
      return false;
    }

    state.maxTurns += additionalTurns;

    state.adminActions.push({
      type: "extend",
      timestamp: new Date(),
      details: { additionalTurns, newMaxTurns: state.maxTurns },
    });

    return true;
  }

  // ---------------------------------------------------------------------------
  // QUERY METHODS
  // ---------------------------------------------------------------------------

  getDebateState(debateId: string): DebateState | null {
    return this.activeDebates.get(debateId) || null;
  }

  isDebateActive(debateId: string): boolean {
    const state = this.activeDebates.get(debateId);
    return state?.status === DebateStatus.ACTIVE;
  }

  getActiveDebates(): string[] {
    return Array.from(this.activeDebates.keys());
  }

  async getDebateHistory(debateId: string): Promise<DebateSummary | null> {
    const state = this.activeDebates.get(debateId);
    if (state) {
      return this.buildSummary(state);
    }

    // Try to reconstruct from database
    const debate = await avatarRegistry.getDebateSessionById(debateId);
    if (!debate) {
      return null;
    }

    const session = await avatarRegistry.getSessionById(debate.sessionId);
    if (!session) {
      return null;
    }

    const messages = await avatarRegistry.getMessagesBySessionId(session.id);
    const avatarMessages = messages.filter(m => m.role === "avatar");

    const avatarsUsed = new Map<string, { name: string; turns: number; tokens: number }>();

    for (const msg of avatarMessages) {
      if (!msg.avatarId) continue;

      const avatar = await avatarRegistry.getAvatarById(msg.avatarId);
      const existing = avatarsUsed.get(msg.avatarId) || {
        name: avatar?.name || "Unknown",
        turns: 0,
        tokens: 0,
      };

      existing.turns++;
      existing.tokens += msg.tokensUsed || 0;
      avatarsUsed.set(msg.avatarId, existing);
    }

    return {
      topic: debate.topic,
      totalTurns: avatarMessages.length,
      duration: 0, // Would need timestamps
      participants: Array.from(avatarsUsed.entries()).map(([id, data]) => ({
        avatarId: id,
        avatarName: data.name,
        turnCount: data.turns,
        totalTokens: data.tokens,
      })),
      turnHistory: avatarMessages.map((m, i) => ({
        turnNumber: i + 1,
        avatarId: m.avatarId || "",
        avatarName: avatarsUsed.get(m.avatarId || "")?.name || "Unknown",
        content: m.content,
        tokens: m.tokensUsed || 0,
        startTime: 0,
        endTime: 0,
        wasSkipped: false,
        wasInjected: false,
      })),
      status: debate.status as DebateStatus,
      terminationReason: null,
    };
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private validateConfig(config: DebateConfig): void {
    if (!config.topic || config.topic.trim().length === 0) {
      throw new Error("Debate topic is required");
    }

    if (!config.avatarIds || config.avatarIds.length < DEFAULT_CONFIG.minAvatars) {
      throw new Error(`At least ${DEFAULT_CONFIG.minAvatars} avatars required`);
    }

    if (config.avatarIds.length > DEFAULT_CONFIG.maxAvatars) {
      throw new Error(`Maximum ${DEFAULT_CONFIG.maxAvatars} avatars allowed`);
    }

    if (config.maxTurns < 2 || config.maxTurns > 20) {
      throw new Error("Max turns must be between 2 and 20");
    }

    // Check for duplicates
    const uniqueIds = new Set(config.avatarIds);
    if (uniqueIds.size !== config.avatarIds.length) {
      throw new Error("Duplicate avatar IDs not allowed");
    }
  }

  private async loadAvatars(avatarIds: string[]): Promise<AiAvatar[]> {
    const avatars: AiAvatar[] = [];

    for (const id of avatarIds) {
      const avatar = await avatarRegistry.getAvatarById(id);
      if (!avatar) {
        throw new Error(`Avatar ${id} not found`);
      }
      if (!avatar.isActive) {
        throw new Error(`Avatar ${avatar.name} is not active`);
      }
      avatars.push(avatar);
    }

    return avatars;
  }

  private buildSummary(state: DebateState): DebateSummary {
    const participantStats = new Map<string, { name: string; turns: number; tokens: number }>();

    for (const turn of state.turnHistory) {
      const existing = participantStats.get(turn.avatarId) || {
        name: turn.avatarName,
        turns: 0,
        tokens: 0,
      };
      existing.turns++;
      existing.tokens += turn.tokens;
      participantStats.set(turn.avatarId, existing);
    }

    const endTime = state.terminatedAt?.getTime() || Date.now();
    const startTime = state.startedAt?.getTime() || state.createdAt.getTime();

    return {
      topic: state.topic,
      totalTurns: state.turnHistory.length,
      duration: endTime - startTime,
      participants: Array.from(participantStats.entries()).map(([id, data]) => ({
        avatarId: id,
        avatarName: data.name,
        turnCount: data.turns,
        totalTokens: data.tokens,
      })),
      turnHistory: state.turnHistory,
      status: state.status,
      terminationReason: state.terminationReason,
    };
  }

  private async waitForResume(state: DebateState): Promise<void> {
    return new Promise(resolve => {
      const handler = () => {
        this.off(`resume:${state.id}`, handler);
        resolve();
      };
      this.on(`resume:${state.id}`, handler);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanup(debateId: string): void {
    this.activeDebates.delete(debateId);
    this.cancelledDebates.delete(debateId);
    this.removeAllListeners(`resume:${debateId}`);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const debateModeEngine = new DebateModeEngine();
