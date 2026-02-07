import { type AiAvatar, type AvatarSession, type DebateSession } from "@shared/schema";
import {
  DebatePhase,
  type DebatePhaseType,
  type PhaseConfig,
  type DebateTurn,
  type AvatarThinkingState,
  type ActiveDebateState,
  type ComprehensiveDebateSummary,
  type DebateStanceType,
  DEFAULT_PHASE_CONFIGS,
  DebateStance,
  type ExpertSummonRequest,
  type ExpertContribution,
  type SummonedExpert,
  // Autonomous consultation types
  type ConsultationSignal,
  type ConsultationAgreement,
  type ConsultationAnalysis,
  type ConsultationCallbacks,
} from "@shared/models/avatarCouncil";
import { avatarRegistry } from "./avatarRegistry";
import { llmService, type TokenUsage } from "./llmService";
import { observabilityService } from "./observabilityService";
import { avatarNetworkHub } from "./avatarNetworkHub";

// =============================================================================
// Types
// =============================================================================

export interface DebateConfig {
  topic: string;
  avatarIds: string[];         // Array of 2-4 avatar IDs
  // Legacy support - if avatarIds not provided, use these
  avatar1Id?: string;
  avatar2Id?: string;
  argumentRounds: number;      // Number of rounds in ARGUMENTS phase (default: 2)
  includeRebuttals: boolean;   // Whether to include REBUTTALS phase (default: true)
}

export interface PhaseBasedCallbacks {
  // Phase lifecycle
  onDebateStart: (debate: DebateSession, avatars: AiAvatar[], phases: PhaseConfig[]) => void;
  onPhaseStart: (phase: DebatePhaseType, phaseConfig: PhaseConfig, phaseNumber: number, totalPhases: number) => void;
  onPhaseComplete: (phase: DebatePhaseType, turns: DebateTurn[]) => void;

  // Turn lifecycle
  onTurnStart: (avatar: AiAvatar, phase: DebatePhaseType, turnNumber: number, roundNumber: number) => void;
  onToken: (avatarId: string, token: string) => void;
  onTurnComplete: (turn: DebateTurn) => void;

  // Thinking (while opponent speaks)
  onThinkingStart: (avatarId: string, avatarName: string) => void;
  onThinkingUpdate: (avatarId: string, thought: string) => void;
  onThinkingEnd: (avatarId: string) => void;

  // Expert Summoning (optional - for debates that support it)
  onSummonRequest?: (request: ExpertSummonRequest, matchedExpert: AiAvatar | null) => void;
  onExpertSummoned?: (expert: AiAvatar, request: ExpertSummonRequest) => void;
  onExpertContributionStart?: (expert: AiAvatar) => void;
  onExpertContributionToken?: (expertId: string, token: string) => void;
  onExpertContributionComplete?: (contribution: ExpertContribution) => void;
  onExpertJoinedDebate?: (expert: SummonedExpert) => void;

  // Autonomous Consultation Agreement (avatars decide together to bring in expert)
  onConsultationProposed?: (signal: ConsultationSignal, agreement: ConsultationAgreement) => void;
  onConsultationSeconded?: (agreement: ConsultationAgreement) => void;
  onConsultationAgreed?: (agreement: ConsultationAgreement, expert: AiAvatar) => void;

  // Completion
  onSummaryGenerating: () => void;
  onDebateComplete: (debate: DebateSession, summary: ComprehensiveDebateSummary) => void;
  onDebateInterrupted: (debate: DebateSession, reason: string, partialSummary?: Partial<ComprehensiveDebateSummary>) => void;

  // Errors
  onError: (error: Error) => void;
}

// Re-export for backwards compatibility
export type DebateCallbacks = PhaseBasedCallbacks;

export interface StanceClassification {
  stance: DebateStanceType;
  targetClaim?: string;
  confidence: number;
}

// Legacy type exports for backwards compatibility
export type DebateStance = DebateStanceType;
export type { DebateTurn, ComprehensiveDebateSummary as DebateSummary };

// =============================================================================
// Debate Engine - Phase-Based Architecture
// =============================================================================

class DebateEngine {
  private activeDebates: Map<string, {
    state: ActiveDebateState;
    interrupted: boolean;
    paused: boolean;
    startTime: number;
    // Autonomous consultation tracking
    consultationAgreements: ConsultationAgreement[];
    pendingSignals: ConsultationSignal[];
    summonedExperts: SummonedExpert[];
  }> = new Map();

  // ---------------------------------------------------------------------------
  // Phase Configuration
  // ---------------------------------------------------------------------------

  private buildPhaseConfigs(config: DebateConfig): PhaseConfig[] {
    const phases: PhaseConfig[] = [];

    // Always start with OPENING
    phases.push({
      ...DEFAULT_PHASE_CONFIGS.find(p => p.phase === DebatePhase.OPENING)!,
    });

    // ARGUMENTS phase with configurable rounds
    phases.push({
      phase: DebatePhase.ARGUMENTS,
      label: "Main Debate",
      description: "Advisors engage in back-and-forth discussion",
      turnsPerAvatar: config.argumentRounds,
      isSequential: true,
      enableThinking: true,
      promptType: "argument",
    });

    // Optional REBUTTALS phase
    if (config.includeRebuttals) {
      phases.push({
        ...DEFAULT_PHASE_CONFIGS.find(p => p.phase === DebatePhase.REBUTTALS)!,
      });
    }

    // Always end with CLOSING
    phases.push({
      ...DEFAULT_PHASE_CONFIGS.find(p => p.phase === DebatePhase.CLOSING)!,
    });

    return phases;
  }

  // ---------------------------------------------------------------------------
  // Stance Classification
  // ---------------------------------------------------------------------------

  private async classifyStance(
    currentResponse: string,
    previousResponse: string | null,
    topic: string
  ): Promise<StanceClassification> {
    if (!previousResponse) {
      return { stance: DebateStance.NEW_ANGLE, confidence: 1.0 };
    }

    try {
      const classificationPrompt = `Analyze this debate response and classify its stance.

TOPIC: ${topic}

PREVIOUS RESPONSE (abbreviated):
"${previousResponse.slice(0, 400)}..."

CURRENT RESPONSE (abbreviated):
"${currentResponse.slice(0, 400)}..."

Classify as ONE of: agrees, partially_agrees, disagrees, rebuts, new_angle, synthesizes, challenges, concedes

Respond in JSON: {"stance": "<one>", "targetClaim": "<brief quote if applicable>", "confidence": <0.0-1.0>}`;

      const response = await llmService.complete([
        { role: "system", content: "You are a debate analyst. Respond only with valid JSON." },
        { role: "user", content: classificationPrompt },
      ]);

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          stance: parsed.stance as DebateStanceType,
          targetClaim: parsed.targetClaim,
          confidence: parsed.confidence || 0.8,
        };
      }
    } catch (error) {
      console.error("[DebateEngine] Stance classification error:", error);
    }

    return { stance: DebateStance.NEW_ANGLE, confidence: 0.5 };
  }

  // ---------------------------------------------------------------------------
  // Start Debate
  // ---------------------------------------------------------------------------

  async startDebate(
    userId: string,
    config: DebateConfig,
    callbacks: PhaseBasedCallbacks
  ): Promise<string> {
    try {
      // Get avatar IDs - support both new array format and legacy format
      const avatarIds = config.avatarIds?.length
        ? config.avatarIds
        : [config.avatar1Id!, config.avatar2Id!].filter(Boolean);

      if (avatarIds.length < 2) {
        throw new Error("At least 2 avatars are required for a debate");
      }

      if (avatarIds.length > 4) {
        throw new Error("Maximum 4 avatars allowed in a debate");
      }

      // Fetch all avatars
      const avatars: AiAvatar[] = [];
      for (const id of avatarIds) {
        const avatar = await avatarRegistry.getAvatarById(id);
        if (!avatar) {
          throw new Error(`Avatar not found: ${id}`);
        }
        if (!avatar.isActive) {
          throw new Error(`Avatar is not active: ${avatar.name}`);
        }
        avatars.push(avatar);
      }

      // Build phase configuration
      const phaseConfigs = this.buildPhaseConfigs(config);

      // Calculate total turns for the debate session (each avatar speaks once per round)
      const totalTurns = phaseConfigs.reduce((sum, p) => sum + (p.turnsPerAvatar * avatars.length), 0);

      // Create session
      const session = await avatarRegistry.createSession({
        userId,
        mode: "debate",
        avatarsUsed: avatars.map(a => a.id),
        isActive: true,
      });

      // Create debate session record (keep avatar1Id/avatar2Id for backwards compatibility)
      const debate = await avatarRegistry.createDebateSession({
        sessionId: session.id,
        topic: config.topic,
        avatar1Id: avatars[0].id,
        avatar2Id: avatars[1].id,
        currentTurn: 1,
        maxTurns: totalTurns,
        status: "active",
      });

      // Initialize active debate state with all avatars
      const avatarInfos = avatars.map(a => ({ id: a.id, name: a.name, slug: a.slug }));
      const debateState: ActiveDebateState = {
        debateId: debate.id,
        sessionId: session.id,
        topic: config.topic,
        avatar1: avatarInfos[0],
        avatar2: avatarInfos[1],
        avatars: avatarInfos, // New: array of all participants
        currentPhase: DebatePhase.OPENING,
        phaseConfig: phaseConfigs[0],
        currentTurnNumber: 1,
        currentSpeaker: null,
        phases: {},
        thinkingState: { avatar1: null, avatar2: null },
        status: "active",
      };

      // Track active debate
      this.activeDebates.set(debate.id, {
        state: debateState,
        interrupted: false,
        paused: false,
        startTime: Date.now(),
        // Autonomous consultation tracking
        consultationAgreements: [],
        pendingSignals: [],
        summonedExperts: [],
      });

      // Log debate start
      await observabilityService.logDebateEvent(session.id, "debate_start", {
        debateId: debate.id,
        topic: config.topic,
        avatars: avatars.map(a => a.name),
        participantCount: avatars.length,
        phases: phaseConfigs.map(p => p.phase),
        totalTurns,
      });

      // Notify start
      callbacks.onDebateStart(debate, avatars, phaseConfigs);

      // Run the phase-based debate
      await this.runPhaseBasedDebate(debate.id, session, avatars, phaseConfigs, callbacks);

      return debate.id;
    } catch (error) {
      console.error("[DebateEngine] Start error:", error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Run Phase-Based Debate Loop
  // ---------------------------------------------------------------------------

  private async runPhaseBasedDebate(
    debateId: string,
    session: AvatarSession,
    avatars: AiAvatar[],  // Now accepts array of 2-4 avatars
    phaseConfigs: PhaseConfig[],
    callbacks: PhaseBasedCallbacks
  ): Promise<void> {
    // Support both 2-avatar legacy and multi-avatar (3-4) debates
    const allTurns: DebateTurn[] = [];
    let globalTurnNumber = 0;

    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) {
      throw new Error("Debate state not found");
    }

    const topic = activeDebate.state.topic;

    // Process each phase
    for (let phaseIndex = 0; phaseIndex < phaseConfigs.length; phaseIndex++) {
      const phaseConfig = phaseConfigs[phaseIndex];

      // Check for interruption
      if (activeDebate.interrupted) {
        await this.handleInterruption(debateId, session.id, allTurns, callbacks, avatars[0], avatars[1], topic);
        return;
      }

      // Check for pause
      while (activeDebate.paused) {
        await new Promise(r => setTimeout(r, 500));
        if (activeDebate.interrupted) {
          await this.handleInterruption(debateId, session.id, allTurns, callbacks, avatars[0], avatars[1], topic);
          return;
        }
      }

      // Update state
      activeDebate.state.currentPhase = phaseConfig.phase;
      activeDebate.state.phaseConfig = phaseConfig;
      activeDebate.state.phases[phaseConfig.phase] = { started: true, completed: false, turns: [] };

      // Notify phase start
      callbacks.onPhaseStart(phaseConfig.phase, phaseConfig, phaseIndex + 1, phaseConfigs.length);

      console.log(`[DebateEngine] Starting phase: ${phaseConfig.phase} (${phaseConfig.turnsPerAvatar} turns per avatar, ${avatars.length} avatars)`);

      const phaseTurns: DebateTurn[] = [];

      // Run turns for this phase
      if (phaseConfig.phase === DebatePhase.OPENING) {
        // OPENING: All avatars speak independently (not responding to each other)
        for (let i = 0; i < avatars.length; i++) {
          const avatar = avatars[i];
          // Pick an "opponent" for context - the next avatar in rotation
          const opponent = avatars[(i + 1) % avatars.length];

          globalTurnNumber++;

          const turn = await this.executeOpeningTurn(
            avatar,
            opponent,
            topic,
            globalTurnNumber,
            phaseConfig,
            session.id,
            callbacks
          );

          phaseTurns.push(turn);
          allTurns.push(turn);

          // Small delay between turns
          await new Promise(r => setTimeout(r, 300));
        }
      } else {
        // ARGUMENTS, REBUTTALS, CLOSING: Sequential round-robin through all avatars
        for (let round = 1; round <= phaseConfig.turnsPerAvatar; round++) {
          for (let i = 0; i < avatars.length; i++) {
            const avatar = avatars[i];

            // Check interruption/pause
            if (activeDebate.interrupted) {
              await this.handleInterruption(debateId, session.id, allTurns, callbacks, avatars[0], avatars[1], topic);
              return;
            }
            while (activeDebate.paused) {
              await new Promise(r => setTimeout(r, 500));
            }

            globalTurnNumber++;

            // For multi-avatar, "opponent" is the previous speaker (or last if first)
            const prevIndex = i === 0 ? avatars.length - 1 : i - 1;
            const opponent = avatars[prevIndex];

            // Generate "thinking" for the current avatar while preparing response
            if (phaseConfig.enableThinking && allTurns.length > 0) {
              const lastTurn = allTurns[allTurns.length - 1];
              if (lastTurn.avatarId !== avatar.id) {
                // The current avatar is about to respond - show their thinking
                callbacks.onThinkingStart(avatar.id, avatar.name);

                try {
                  const thought = await llmService.generateThinking(
                    avatar,
                    topic,
                    lastTurn.content,
                    lastTurn.avatarName
                  );
                  callbacks.onThinkingUpdate(avatar.id, thought);
                } catch (err) {
                  console.error("[DebateEngine] Thinking generation failed:", err);
                }

                callbacks.onThinkingEnd(avatar.id);
              }
            }

            // Execute the turn based on phase type
            let turn: DebateTurn;

            if (phaseConfig.phase === DebatePhase.ARGUMENTS) {
              turn = await this.executeArgumentTurn(
                avatar,
                opponent,
                topic,
                allTurns,
                globalTurnNumber,
                round,
                phaseConfig.turnsPerAvatar,
                phaseConfig,
                session.id,
                callbacks
              );
            } else if (phaseConfig.phase === DebatePhase.REBUTTALS) {
              // In multi-avatar debates, rebuttals address all other participants' points
              const otherAvatars = avatars.filter(a => a.id !== avatar.id);
              const opponentTurns = allTurns.filter(t => otherAvatars.some(oa => oa.id === t.avatarId));
              const opponentKeyPoints = await llmService.extractKeyPoints(
                otherAvatars.map(a => a.name).join(", "),
                opponentTurns
              );

              turn = await this.executeRebuttalTurn(
                avatar,
                opponent, // Primary opponent for formatting
                topic,
                allTurns,
                opponentKeyPoints,
                globalTurnNumber,
                phaseConfig,
                session.id,
                callbacks
              );
            } else {
              // CLOSING
              const myTurns = allTurns.filter(t => t.avatarId === avatar.id);
              const myKeyPoints = await llmService.extractKeyPoints(avatar.name, myTurns);

              turn = await this.executeClosingTurn(
                avatar,
                opponent, // Primary opponent for formatting
                topic,
                allTurns,
                myKeyPoints,
                globalTurnNumber,
                phaseConfig,
                session.id,
                callbacks
              );
            }

            phaseTurns.push(turn);
            allTurns.push(turn);

            // Check for autonomous consultation agreement (ARGUMENTS phase only)
            if (phaseConfig.phase === DebatePhase.ARGUMENTS) {
              try {
                const expertContribution = await this.checkAndHandleConsultation(
                  debateId,
                  turn,
                  avatar,
                  allTurns,
                  callbacks
                );

                if (expertContribution) {
                  console.log(`[DebateEngine] Expert consultation executed: ${expertContribution.expertName}`);
                  // Add a small delay after expert contribution
                  await new Promise(r => setTimeout(r, 500));
                }
              } catch (err) {
                console.error("[DebateEngine] Consultation check failed:", err);
              }
            }

            // Small delay between turns
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }

      // Mark phase complete
      activeDebate.state.phases[phaseConfig.phase]!.completed = true;
      activeDebate.state.phases[phaseConfig.phase]!.turns = phaseTurns;

      callbacks.onPhaseComplete(phaseConfig.phase, phaseTurns);

      // Log phase completion
      await observabilityService.logDebateEvent(session.id, "phase_complete", {
        debateId,
        phase: phaseConfig.phase,
        turnsInPhase: phaseTurns.length,
      });
    }

    // Generate comprehensive summary
    callbacks.onSummaryGenerating();

    const durationSeconds = Math.floor((Date.now() - activeDebate.startTime) / 1000);

    // For summary, use first two avatars for backwards compatibility
    const summary = await llmService.generateDebateSummary(
      topic,
      { id: avatars[0].id, name: avatars[0].name, slug: avatars[0].slug },
      { id: avatars[1].id, name: avatars[1].name, slug: avatars[1].slug },
      allTurns,
      debateId,
      durationSeconds
    );

    // Save summary to database
    await avatarRegistry.saveDebateSummary(debateId, {
      executiveSummary: summary.executiveSummary,
      keyConsensus: summary.pointsOfAgreement,
      unresolvedPoints: summary.unresolvedQuestions,
      avatar1KeyPoints: summary.avatar1Position.keyPoints,
      avatar2KeyPoints: summary.avatar2Position.keyPoints,
    });

    // Update debate status
    await avatarRegistry.updateDebateSession(debateId, {
      status: "completed",
      completedAt: new Date(),
      currentTurn: globalTurnNumber,
    });

    // Log completion
    await observabilityService.logDebateEvent(session.id, "debate_complete", {
      debateId,
      totalTurns: globalTurnNumber,
      durationSeconds,
    });

    // End session
    await avatarRegistry.endSession(session.id);

    // Cleanup
    this.activeDebates.delete(debateId);

    // Notify completion
    const finalDebate = await avatarRegistry.getDebateSessionById(debateId);
    callbacks.onDebateComplete(finalDebate!, summary);
  }

  // ---------------------------------------------------------------------------
  // Execute Individual Turn Types
  // ---------------------------------------------------------------------------

  private async executeOpeningTurn(
    avatar: AiAvatar,
    opponent: AiAvatar,
    topic: string,
    turnNumber: number,
    phaseConfig: PhaseConfig,
    sessionId: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<DebateTurn> {
    callbacks.onTurnStart(avatar, DebatePhase.OPENING, turnNumber, 1);

    const messages = llmService.buildOpeningStatementMessages(
      avatar,
      topic,
      opponent.name
    );

    const startTime = Date.now();
    let content = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          content += token;
          callbacks.onToken(avatar.id, token);
        },
        onComplete: async (fullContent, tokenUsage) => {
          content = fullContent;
          usage = tokenUsage;
          resolve();
        },
        onError: reject,
      });
    });

    // Save message
    await avatarRegistry.createMessage({
      sessionId,
      role: "avatar",
      avatarId: avatar.id,
      content,
      tokensUsed: usage.totalTokens,
    });

    const turn: DebateTurn = {
      id: crypto.randomUUID(),
      phase: DebatePhase.OPENING,
      phaseLabel: phaseConfig.label,
      turnNumber,
      roundNumber: 1,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarSlug: avatar.slug,
      content,
      tokensUsed: usage.totalTokens,
      timestamp: new Date().toISOString(),
      stance: DebateStance.NEW_ANGLE,
    };

    callbacks.onTurnComplete(turn);

    return turn;
  }

  private async executeArgumentTurn(
    avatar: AiAvatar,
    opponent: AiAvatar,
    topic: string,
    previousTurns: DebateTurn[],
    turnNumber: number,
    roundNumber: number,
    totalRounds: number,
    phaseConfig: PhaseConfig,
    sessionId: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<DebateTurn> {
    callbacks.onTurnStart(avatar, DebatePhase.ARGUMENTS, turnNumber, roundNumber);

    const messages = llmService.buildArgumentMessages(
      avatar,
      topic,
      { name: opponent.name, slug: opponent.slug },
      previousTurns,
      roundNumber,
      totalRounds
    );

    const startTime = Date.now();
    let content = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          content += token;
          callbacks.onToken(avatar.id, token);
        },
        onComplete: async (fullContent, tokenUsage) => {
          content = fullContent;
          usage = tokenUsage;
          resolve();
        },
        onError: reject,
      });
    });

    // Classify stance
    const lastOpponentTurn = [...previousTurns].reverse().find(t => t.avatarId === opponent.id);
    const stance = await this.classifyStance(content, lastOpponentTurn?.content || null, topic);

    // Save message
    await avatarRegistry.createMessage({
      sessionId,
      role: "avatar",
      avatarId: avatar.id,
      content,
      tokensUsed: usage.totalTokens,
    });

    const turn: DebateTurn = {
      id: crypto.randomUUID(),
      phase: DebatePhase.ARGUMENTS,
      phaseLabel: `${phaseConfig.label} - Round ${roundNumber}`,
      turnNumber,
      roundNumber,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarSlug: avatar.slug,
      content,
      tokensUsed: usage.totalTokens,
      timestamp: new Date().toISOString(),
      stance: stance.stance,
      stanceTarget: stance.targetClaim,
      stanceConfidence: stance.confidence,
    };

    callbacks.onTurnComplete(turn);

    return turn;
  }

  private async executeRebuttalTurn(
    avatar: AiAvatar,
    opponent: AiAvatar,
    topic: string,
    previousTurns: DebateTurn[],
    opponentKeyPoints: string[],
    turnNumber: number,
    phaseConfig: PhaseConfig,
    sessionId: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<DebateTurn> {
    callbacks.onTurnStart(avatar, DebatePhase.REBUTTALS, turnNumber, 1);

    const messages = llmService.buildRebuttalMessages(
      avatar,
      topic,
      { name: opponent.name, slug: opponent.slug },
      previousTurns,
      opponentKeyPoints
    );

    let content = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          content += token;
          callbacks.onToken(avatar.id, token);
        },
        onComplete: async (fullContent, tokenUsage) => {
          content = fullContent;
          usage = tokenUsage;
          resolve();
        },
        onError: reject,
      });
    });

    // Classify stance
    const lastOpponentTurn = [...previousTurns].reverse().find(t => t.avatarId === opponent.id);
    const stance = await this.classifyStance(content, lastOpponentTurn?.content || null, topic);

    // Save message
    await avatarRegistry.createMessage({
      sessionId,
      role: "avatar",
      avatarId: avatar.id,
      content,
      tokensUsed: usage.totalTokens,
    });

    const turn: DebateTurn = {
      id: crypto.randomUUID(),
      phase: DebatePhase.REBUTTALS,
      phaseLabel: phaseConfig.label,
      turnNumber,
      roundNumber: 1,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarSlug: avatar.slug,
      content,
      tokensUsed: usage.totalTokens,
      timestamp: new Date().toISOString(),
      stance: stance.stance,
      stanceTarget: stance.targetClaim,
      stanceConfidence: stance.confidence,
    };

    callbacks.onTurnComplete(turn);

    return turn;
  }

  private async executeClosingTurn(
    avatar: AiAvatar,
    opponent: AiAvatar,
    topic: string,
    previousTurns: DebateTurn[],
    myKeyPoints: string[],
    turnNumber: number,
    phaseConfig: PhaseConfig,
    sessionId: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<DebateTurn> {
    callbacks.onTurnStart(avatar, DebatePhase.CLOSING, turnNumber, 1);

    const messages = llmService.buildClosingStatementMessages(
      avatar,
      topic,
      { name: opponent.name, slug: opponent.slug },
      previousTurns,
      myKeyPoints
    );

    let content = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          content += token;
          callbacks.onToken(avatar.id, token);
        },
        onComplete: async (fullContent, tokenUsage) => {
          content = fullContent;
          usage = tokenUsage;
          resolve();
        },
        onError: reject,
      });
    });

    // Save message
    await avatarRegistry.createMessage({
      sessionId,
      role: "avatar",
      avatarId: avatar.id,
      content,
      tokensUsed: usage.totalTokens,
    });

    const turn: DebateTurn = {
      id: crypto.randomUUID(),
      phase: DebatePhase.CLOSING,
      phaseLabel: phaseConfig.label,
      turnNumber,
      roundNumber: 1,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarSlug: avatar.slug,
      content,
      tokensUsed: usage.totalTokens,
      timestamp: new Date().toISOString(),
      stance: DebateStance.SYNTHESIZES,
    };

    callbacks.onTurnComplete(turn);

    return turn;
  }

  // ---------------------------------------------------------------------------
  // Interruption Handler
  // ---------------------------------------------------------------------------

  private async handleInterruption(
    debateId: string,
    sessionId: string,
    allTurns: DebateTurn[],
    callbacks: PhaseBasedCallbacks,
    avatar1: AiAvatar,
    avatar2: AiAvatar,
    topic: string
  ): Promise<void> {
    const activeDebate = this.activeDebates.get(debateId);
    const durationSeconds = activeDebate ? Math.floor((Date.now() - activeDebate.startTime) / 1000) : 0;

    // Try to generate partial summary
    let partialSummary: Partial<ComprehensiveDebateSummary> | undefined;

    if (allTurns.length > 0) {
      try {
        partialSummary = await llmService.generateDebateSummary(
          topic,
          { id: avatar1.id, name: avatar1.name, slug: avatar1.slug },
          { id: avatar2.id, name: avatar2.name, slug: avatar2.slug },
          allTurns,
          debateId,
          durationSeconds
        );
      } catch (err) {
        console.error("[DebateEngine] Failed to generate partial summary:", err);
      }
    }

    // Update database
    await avatarRegistry.interruptDebate(debateId);
    await avatarRegistry.endSession(sessionId);

    // Log interruption
    await observabilityService.logDebateEvent(sessionId, "debate_interrupt", {
      debateId,
      turnsCompleted: allTurns.length,
      reason: "user_interrupt",
    });

    // Cleanup
    this.activeDebates.delete(debateId);

    // Notify
    const debate = await avatarRegistry.getDebateSessionById(debateId);
    callbacks.onDebateInterrupted(debate!, "Debate interrupted by user", partialSummary);
  }

  // ---------------------------------------------------------------------------
  // Control Methods
  // ---------------------------------------------------------------------------

  async interruptDebate(debateId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    state.interrupted = true;
    return true;
  }

  async pauseDebate(debateId: string): Promise<boolean> {
    const state = this.activeDebates.get(debateId);
    if (!state) {
      return false;
    }

    state.paused = true;
    await avatarRegistry.updateDebateSession(debateId, { status: "paused" });
    console.log(`[DebateEngine] Debate ${debateId} paused`);
    return true;
  }

  async resumeDebate(debateId: string, callbacks: PhaseBasedCallbacks): Promise<boolean> {
    const state = this.activeDebates.get(debateId);

    if (state) {
      state.paused = false;
      await avatarRegistry.updateDebateSession(debateId, { status: "active" });
      console.log(`[DebateEngine] Debate ${debateId} resumed`);
      return true;
    }

    // For debates that need full restart, we'd need to restore state from DB
    // This is complex - for now just return false
    console.warn(`[DebateEngine] Cannot resume debate ${debateId} - no active state found`);
    return false;
  }

  getActiveDebate(debateId: string): DebateSession | null {
    const state = this.activeDebates.get(debateId);
    if (!state) return null;

    // Return a DebateSession-like object from state
    return {
      id: state.state.debateId,
      sessionId: state.state.sessionId,
      topic: state.state.topic,
      avatar1Id: state.state.avatar1.id,
      avatar2Id: state.state.avatar2.id,
      participantIds: state.state.avatars?.map(a => a.id) || null,
      currentTurn: state.state.currentTurnNumber,
      maxTurns: 10, // This should be calculated from phase configs
      status: state.state.status,
      createdAt: new Date(),
      completedAt: null,
      executiveSummary: null,
      keyConsensus: null,
      unresolvedPoints: null,
      avatar1KeyPoints: null,
      avatar2KeyPoints: null,
    };
  }

  isDebateActive(debateId: string): boolean {
    const state = this.activeDebates.get(debateId);
    return state !== undefined && !state.interrupted;
  }

  getDebateState(debateId: string): ActiveDebateState | null {
    const state = this.activeDebates.get(debateId);
    return state?.state || null;
  }

  // ---------------------------------------------------------------------------
  // Expert Summoning System
  // ---------------------------------------------------------------------------

  /**
   * Detect if an avatar's response indicates they need external expertise
   */
  private async detectSummonNeed(
    response: string,
    avatar: AiAvatar,
    topic: string
  ): Promise<{ needed: boolean; domain?: string; reason?: string } | null> {
    try {
      const detectionPrompt = `Analyze this debate response to determine if the speaker needs expertise outside their domain.

SPEAKER: ${avatar.name}
SPEAKER'S EXPERTISE: ${avatar.domainExpertise.join(", ")}
TOPIC: ${topic}

RESPONSE:
"${response.slice(0, 800)}..."

Does the speaker:
1. Acknowledge a gap in their knowledge?
2. Suggest consulting another expert?
3. Reference a domain clearly outside their expertise?
4. Express uncertainty about a specific technical area?

Respond in JSON:
{
  "needsExpert": true/false,
  "domain": "the expertise domain needed (if applicable)",
  "reason": "brief explanation of why expert is needed (if applicable)"
}

Only return needsExpert: true if there's a CLEAR indication expertise is needed.`;

      const result = await llmService.complete([
        { role: "system", content: "You are an analysis assistant. Respond only with valid JSON." },
        { role: "user", content: detectionPrompt },
      ]);

      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          needed: parsed.needsExpert === true,
          domain: parsed.domain,
          reason: parsed.reason,
        };
      }
    } catch (error) {
      console.error("[DebateEngine] Summon detection error:", error);
    }
    return null;
  }

  /**
   * Find the best expert for a given domain from available avatars
   */
  async findExpertForDomain(
    domain: string,
    excludeAvatarIds: string[]
  ): Promise<AiAvatar | null> {
    const allAvatars = await avatarRegistry.getAllAvatars();

    // Filter to active avatars not already in the debate
    const availableAvatars = allAvatars.filter(
      (a) => a.isActive && !excludeAvatarIds.includes(a.id)
    );

    if (availableAvatars.length === 0) return null;

    // Score each avatar based on domain match
    const domainLower = domain.toLowerCase();
    const scored = availableAvatars.map((avatar) => {
      let score = 0;

      // Check domain expertise match
      for (const expertise of avatar.domainExpertise) {
        const expertiseLower = expertise.toLowerCase();
        if (expertiseLower === domainLower) {
          score += 100; // Exact match
        } else if (expertiseLower.includes(domainLower) || domainLower.includes(expertiseLower)) {
          score += 50; // Partial match
        }
      }

      // Boost by response priority
      score += avatar.responsePriority;

      return { avatar, score };
    });

    // Sort by score and return the best match
    scored.sort((a, b) => b.score - a.score);

    // Only return if there's a meaningful match (score > 10)
    return scored[0]?.score > 10 ? scored[0].avatar : null;
  }

  /**
   * Summon an expert into an active debate
   */
  async summonExpert(
    debateId: string,
    requestingAvatarId: string,
    domain: string,
    reason: string,
    contextSnippet: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<ExpertContribution | null> {
    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) {
      console.warn(`[DebateEngine] Cannot summon expert - debate ${debateId} not active`);
      return null;
    }

    const requestingAvatar = await avatarRegistry.getAvatarById(requestingAvatarId);
    if (!requestingAvatar) return null;

    // Create summon request
    const summonRequest: ExpertSummonRequest = {
      id: crypto.randomUUID(),
      debateId,
      requestingAvatarId,
      requestingAvatarName: requestingAvatar.name,
      domainNeeded: domain,
      reason,
      contextSnippet,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Find the best expert
    const currentParticipantIds = activeDebate.state.avatars?.map((a) => a.id) || [
      activeDebate.state.avatar1.id,
      activeDebate.state.avatar2.id,
    ];
    const expert = await this.findExpertForDomain(domain, currentParticipantIds);

    // Notify about the summon request
    callbacks.onSummonRequest?.(summonRequest, expert);

    if (!expert) {
      summonRequest.status = "declined";
      console.log(`[DebateEngine] No expert found for domain: ${domain}`);
      return null;
    }

    summonRequest.status = "accepted";

    // Notify that expert is being summoned
    callbacks.onExpertSummoned?.(expert, summonRequest);

    // Broadcast summon event to network
    avatarNetworkHub.sendMessage(
      requestingAvatarId,
      expert.id,
      `Requesting expert consultation on: ${domain}`,
      "query"
    );

    // Execute the expert's contribution
    const contribution = await this.executeExpertContribution(
      expert,
      summonRequest,
      activeDebate.state.topic,
      contextSnippet,
      activeDebate.state.sessionId,
      callbacks
    );

    if (contribution) {
      // Notify network of the contribution
      avatarNetworkHub.sendMessage(
        expert.id,
        requestingAvatarId,
        `Expert consultation provided on: ${domain}`,
        "response"
      );
    }

    return contribution;
  }

  /**
   * Execute an expert's contribution to the debate
   */
  private async executeExpertContribution(
    expert: AiAvatar,
    request: ExpertSummonRequest,
    topic: string,
    context: string,
    sessionId: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<ExpertContribution> {
    callbacks.onExpertContributionStart?.(expert);

    const messages = [
      {
        role: "system" as const,
        content: `${expert.systemPrompt}

You have been summoned as an EXPERT CONSULTANT into an ongoing debate about: "${topic}"

${request.requestingAvatarName} has requested your expertise because: ${request.reason}

Your role is to:
1. Provide focused, expert insight on the specific question/domain requested
2. Be concise but thorough - this is a consultation, not a full debate turn
3. Stay within your area of expertise
4. Acknowledge if something is outside your knowledge

Keep your response to 2-3 paragraphs maximum.`,
      },
      {
        role: "user" as const,
        content: `DEBATE CONTEXT:
${context}

EXPERTISE REQUESTED: ${request.domainNeeded}
REASON FOR CONSULTATION: ${request.reason}

Please provide your expert perspective on this matter.`,
      },
    ];

    let content = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    await new Promise<void>((resolve, reject) => {
      llmService.streamComplete(messages, {
        onToken: (token) => {
          content += token;
          callbacks.onExpertContributionToken?.(expert.id, token);
        },
        onComplete: async (fullContent, tokenUsage) => {
          content = fullContent;
          usage = tokenUsage;
          resolve();
        },
        onError: reject,
      });
    });

    // Save as a message
    await avatarRegistry.createMessage({
      sessionId,
      role: "avatar",
      avatarId: expert.id,
      content: `[EXPERT CONSULTATION - ${expert.name}]\n\n${content}`,
      tokensUsed: usage.totalTokens,
    });

    const contribution: ExpertContribution = {
      id: crypto.randomUUID(),
      summonRequestId: request.id,
      debateId: request.debateId,
      expertId: expert.id,
      expertName: expert.name,
      expertSlug: expert.slug,
      contribution: content,
      tokensUsed: usage.totalTokens,
      timestamp: new Date().toISOString(),
      stayInDebate: false, // Default to consultant role
    };

    callbacks.onExpertContributionComplete?.(contribution);

    // Log the summon event
    await observabilityService.logDebateEvent(sessionId, "expert_summoned", {
      debateId: request.debateId,
      expertId: expert.id,
      expertName: expert.name,
      domain: request.domainNeeded,
      requestedBy: request.requestingAvatarName,
    });

    return contribution;
  }

  /**
   * Check a completed turn for summon needs and handle automatically
   */
  async checkAndHandleSummonNeed(
    debateId: string,
    turn: DebateTurn,
    avatar: AiAvatar,
    topic: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<ExpertContribution | null> {
    // Detect if summon is needed
    const detection = await this.detectSummonNeed(turn.content, avatar, topic);

    if (!detection?.needed || !detection.domain) {
      return null;
    }

    console.log(`[DebateEngine] Summon detected - ${avatar.name} needs ${detection.domain} expertise`);

    // Get context from the turn
    const contextSnippet = turn.content.slice(0, 500);

    // Summon the expert
    return this.summonExpert(
      debateId,
      avatar.id,
      detection.domain,
      detection.reason || "Expert consultation requested",
      contextSnippet,
      callbacks
    );
  }

  // ---------------------------------------------------------------------------
  // Get Debate History (for resuming or viewing past debates)
  // ---------------------------------------------------------------------------

  async getDebateHistory(debateId: string): Promise<ComprehensiveDebateSummary | null> {
    const debate = await avatarRegistry.getDebateSessionById(debateId);
    if (!debate) return null;

    const session = await avatarRegistry.getSessionById(debate.sessionId);
    if (!session) return null;

    const avatar1 = await avatarRegistry.getAvatarById(debate.avatar1Id);
    const avatar2 = await avatarRegistry.getAvatarById(debate.avatar2Id);
    if (!avatar1 || !avatar2) return null;

    const messages = await avatarRegistry.getMessagesBySessionId(session.id);
    const avatarMessages = messages.filter(m => m.role === "avatar");

    // Convert messages to DebateTurn format
    const turns: DebateTurn[] = avatarMessages.map((msg, idx) => ({
      id: msg.id,
      phase: DebatePhase.ARGUMENTS, // We don't track phase in messages currently
      phaseLabel: "Debate",
      turnNumber: idx + 1,
      roundNumber: Math.ceil((idx + 1) / 2),
      avatarId: msg.avatarId || "",
      avatarName: msg.avatarId === avatar1.id ? avatar1.name : avatar2.name,
      avatarSlug: msg.avatarId === avatar1.id ? avatar1.slug : avatar2.slug,
      content: msg.content,
      tokensUsed: msg.tokensUsed || 0,
      timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
    }));

    const summary: ComprehensiveDebateSummary = {
      debateId: debate.id,
      topic: debate.topic,
      totalDuration: 0,
      totalTurns: turns.length,
      generatedAt: new Date().toISOString(),
      avatar1: {
        id: avatar1.id,
        name: avatar1.name,
        slug: avatar1.slug,
        totalTurns: turns.filter(t => t.avatarId === avatar1.id).length,
        totalTokens: turns.filter(t => t.avatarId === avatar1.id).reduce((sum, t) => sum + t.tokensUsed, 0),
      },
      avatar2: {
        id: avatar2.id,
        name: avatar2.name,
        slug: avatar2.slug,
        totalTurns: turns.filter(t => t.avatarId === avatar2.id).length,
        totalTokens: turns.filter(t => t.avatarId === avatar2.id).reduce((sum, t) => sum + t.tokensUsed, 0),
      },
      executiveSummary: debate.executiveSummary || "",
      avatar1Position: {
        coreArgument: "",
        keyPoints: debate.avatar1KeyPoints || [],
        strengths: [],
        weaknesses: [],
        notableQuotes: [],
      },
      avatar2Position: {
        coreArgument: "",
        keyPoints: debate.avatar2KeyPoints || [],
        strengths: [],
        weaknesses: [],
        notableQuotes: [],
      },
      pointsOfAgreement: debate.keyConsensus || [],
      pointsOfDisagreement: [],
      unresolvedQuestions: debate.unresolvedPoints || [],
      phaseBreakdown: [],
      actionableInsights: [],
      transcript: [{ phase: DebatePhase.ARGUMENTS, turns }],
    };

    return summary;
  }

  // ---------------------------------------------------------------------------
  // Autonomous Expert Consultation - Avatars Agree to Bring in Expert
  // ---------------------------------------------------------------------------

  /**
   * Analyze an avatar's turn for consultation signals
   * Returns null if no consultation intent detected
   */
  async analyzeForConsultationIntent(
    turnContent: string,
    avatar: AiAvatar,
    topic: string,
    existingAgreements: ConsultationAgreement[]
  ): Promise<ConsultationAnalysis | null> {
    // Check for explicit consultation markers in the response
    const consultationPatterns = [
      /(?:we (?:should|need to|might want to) (?:bring in|consult|ask|get) (?:an? )?(?:expert|specialist|colleague))/i,
      /(?:I (?:think|believe|suggest) we (?:need|should have) (?:someone|an expert|a specialist))/i,
      /(?:this (?:requires|needs|calls for) (?:additional|more|specialized|expert) (?:input|expertise|knowledge|perspective))/i,
      /(?:(?:would|could) benefit from (?:another|additional|expert) (?:perspective|opinion|input))/i,
      /(?:I agree.*(?:bring|consult|summon).*expert)/i,
      /(?:(?:let's|let us) (?:bring in|consult|get) (?:an? )?(?:\w+ )?(?:expert|specialist))/i,
      /(?:second(?:ing)? (?:that|the) (?:suggestion|proposal|idea) (?:to|for) (?:bring|consult))/i,
    ];

    const hasExplicitSignal = consultationPatterns.some(p => p.test(turnContent));

    if (!hasExplicitSignal) {
      return null;
    }

    // Use LLM to extract the specific domain and urgency
    try {
      const analysisPrompt = `Analyze this debate turn for expert consultation intent.

TOPIC: ${topic}
SPEAKER: ${avatar.name}
CONTENT: "${turnContent.slice(0, 800)}"

${existingAgreements.length > 0 ? `
PENDING CONSULTATION PROPOSALS:
${existingAgreements.filter(a => a.status === "proposed").map(a =>
  `- Domain: "${a.domain}" (proposed by previous speaker)`
).join("\n")}
` : ""}

The speaker appears to be suggesting or agreeing to bring in an expert.
Extract:
1. What domain/expertise they're requesting
2. Why they think it's needed
3. How urgent/strong is their request (suggestion, strong, critical)
4. If they're seconding an existing proposal, which one

Respond in JSON:
{
  "wantsConsultation": true,
  "domain": "<specific expertise needed>",
  "reason": "<why they need it>",
  "urgency": "<suggestion|strong|critical>",
  "secondsExisting": "<domain of existing proposal being seconded, or null>"
}`;

      const result = await llmService.complete([
        { role: "system", content: "You analyze debate turns for expert consultation requests. Be precise about domains." },
        { role: "user", content: analysisPrompt },
      ]);

      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          wantsConsultation: parsed.wantsConsultation === true,
          domain: parsed.domain,
          reason: parsed.reason,
          urgency: parsed.urgency || "suggestion",
          secondsExisting: parsed.secondsExisting || undefined,
        };
      }
    } catch (error) {
      console.error("[DebateEngine] Consultation analysis error:", error);
    }

    return null;
  }

  /**
   * Process a consultation signal and manage agreement state
   * Returns the agreement if consensus is reached
   */
  async processConsultationSignal(
    debateId: string,
    signal: ConsultationSignal,
    callbacks: PhaseBasedCallbacks
  ): Promise<ConsultationAgreement | null> {
    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) return null;

    const { consultationAgreements, pendingSignals } = activeDebate;

    // Check if this seconds an existing proposal
    const matchingProposal = consultationAgreements.find(
      a => a.status === "proposed" &&
           a.domain.toLowerCase().includes(signal.domain.toLowerCase())
    );

    if (matchingProposal && matchingProposal.proposedBy !== signal.avatarId) {
      // This is a second! Update the agreement
      matchingProposal.status = "seconded";
      matchingProposal.secondedBy = signal.avatarId;
      matchingProposal.signals.push(signal);

      console.log(`[DebateEngine] Consultation SECONDED: ${signal.avatarName} agrees to consult on "${signal.domain}"`);
      callbacks.onConsultationSeconded?.(matchingProposal);

      // Automatically move to "agreed" when seconded
      matchingProposal.status = "agreed";
      matchingProposal.agreedAt = new Date().toISOString();

      return matchingProposal;
    }

    // Check for strong/critical urgency (can trigger without second)
    if (signal.urgency === "critical") {
      const agreement: ConsultationAgreement = {
        id: crypto.randomUUID(),
        debateId,
        domain: signal.domain,
        signals: [signal],
        status: "agreed", // Critical urgency auto-agrees
        proposedBy: signal.avatarId,
        agreedAt: new Date().toISOString(),
      };
      consultationAgreements.push(agreement);

      console.log(`[DebateEngine] CRITICAL consultation request from ${signal.avatarName} - auto-agreeing`);
      return agreement;
    }

    // Create new proposal
    const newAgreement: ConsultationAgreement = {
      id: crypto.randomUUID(),
      debateId,
      domain: signal.domain,
      signals: [signal],
      status: "proposed",
      proposedBy: signal.avatarId,
    };
    consultationAgreements.push(newAgreement);
    pendingSignals.push(signal);

    console.log(`[DebateEngine] Consultation PROPOSED by ${signal.avatarName}: "${signal.domain}"`);
    callbacks.onConsultationProposed?.(signal, newAgreement);

    return null; // No consensus yet
  }

  /**
   * Execute agreed consultation - summon and integrate expert
   */
  async executeAgreedConsultation(
    debateId: string,
    agreement: ConsultationAgreement,
    contextFromTurns: string,
    callbacks: PhaseBasedCallbacks
  ): Promise<ExpertContribution | null> {
    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) return null;

    // Find the best expert
    const currentParticipantIds = activeDebate.state.avatars?.map(a => a.id) || [
      activeDebate.state.avatar1.id,
      activeDebate.state.avatar2.id,
    ];
    const expert = await this.findExpertForDomain(agreement.domain, currentParticipantIds);

    if (!expert) {
      agreement.status = "declined";
      console.log(`[DebateEngine] No expert found for agreed domain: ${agreement.domain}`);
      return null;
    }

    agreement.summonedExpertId = expert.id;
    agreement.status = "executed";
    agreement.executedAt = new Date().toISOString();

    console.log(`[DebateEngine] Consultation AGREED - summoning ${expert.name} for "${agreement.domain}"`);
    callbacks.onConsultationAgreed?.(agreement, expert);

    // Build the consultation request
    const signalReasons = agreement.signals.map(s => `${s.avatarName}: ${s.reason}`).join("\n");
    const request: ExpertSummonRequest = {
      id: crypto.randomUUID(),
      debateId,
      requestingAvatarId: agreement.proposedBy,
      requestingAvatarName: agreement.signals[0].avatarName,
      domainNeeded: agreement.domain,
      reason: `The debating avatars have agreed they need expert input:\n${signalReasons}`,
      contextSnippet: contextFromTurns,
      timestamp: new Date().toISOString(),
      status: "accepted",
    };

    // Execute the expert's contribution
    const contribution = await this.executeExpertContribution(
      expert,
      request,
      activeDebate.state.topic,
      contextFromTurns,
      activeDebate.state.sessionId,
      callbacks
    );

    if (contribution) {
      // Track the summoned expert
      const summonedExpert: SummonedExpert = {
        avatarId: expert.id,
        avatarName: expert.name,
        avatarSlug: expert.slug,
        summonedBy: agreement.proposedBy,
        summonedAt: new Date().toISOString(),
        role: "consultant",
        contributionCount: 1,
      };
      activeDebate.summonedExperts.push(summonedExpert);

      // Broadcast to network
      avatarNetworkHub.broadcastMessage(
        expert.id,
        `I've been consulted on "${agreement.domain}" - here's my expert perspective.`,
        "announcement"
      );
    }

    return contribution;
  }

  /**
   * Check turn and handle autonomous consultation flow
   * Call this after each turn to check for consultation signals
   */
  async checkAndHandleConsultation(
    debateId: string,
    turn: DebateTurn,
    avatar: AiAvatar,
    allTurns: DebateTurn[],
    callbacks: PhaseBasedCallbacks
  ): Promise<ExpertContribution | null> {
    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) return null;

    // Analyze for consultation intent
    const analysis = await this.analyzeForConsultationIntent(
      turn.content,
      avatar,
      activeDebate.state.topic,
      activeDebate.consultationAgreements
    );

    if (!analysis?.wantsConsultation) {
      return null;
    }

    // Create the consultation signal
    const signal: ConsultationSignal = {
      avatarId: avatar.id,
      avatarName: avatar.name,
      domain: analysis.domain!,
      reason: analysis.reason || "Expert consultation requested",
      urgency: analysis.urgency || "suggestion",
      turnNumber: turn.turnNumber,
      timestamp: new Date().toISOString(),
    };

    // Process the signal
    const agreedConsultation = await this.processConsultationSignal(debateId, signal, callbacks);

    // If consensus reached, execute the consultation
    if (agreedConsultation) {
      // Build context from recent turns
      const recentTurns = allTurns.slice(-4);
      const context = recentTurns.map(t =>
        `[${t.avatarName}]: ${t.content.slice(0, 300)}...`
      ).join("\n\n");

      return this.executeAgreedConsultation(debateId, agreedConsultation, context, callbacks);
    }

    return null;
  }

  /**
   * Get pending consultation proposals for a debate
   */
  getPendingConsultations(debateId: string): ConsultationAgreement[] {
    const activeDebate = this.activeDebates.get(debateId);
    if (!activeDebate) return [];
    return activeDebate.consultationAgreements.filter(a => a.status === "proposed");
  }

  /**
   * Get all summoned experts for a debate
   */
  getSummonedExperts(debateId: string): SummonedExpert[] {
    const activeDebate = this.activeDebates.get(debateId);
    return activeDebate?.summonedExperts || [];
  }
}

export const debateEngine = new DebateEngine();
