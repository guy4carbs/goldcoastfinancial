import { type AiAvatar, type AvatarSession, type AvatarMessage } from "@shared/schema";
import { avatarRegistry } from "./avatarRegistry";
import { llmService, type ChatMessage, type StreamCallbacks, type TokenUsage } from "./llmService";
import { observabilityService } from "./observabilityService";
import { orchestrationLayer, type ConversationContext, type Domain } from "./orchestrationLayer";
import { personaRegistry, getSystemPrompt } from "./personaRegistry";

// =============================================================================
// Types
// =============================================================================

export type ResponseMode = "single" | "multi" | "debate";

export interface OrchestrationRequest {
  sessionId: string;
  userId: string;
  message: string;
  mode: ResponseMode;
  selectedAvatarIds?: string[];
  enableAutoRouting?: boolean;
}

export interface OrchestrationResult {
  sessionId: string;
  mode: ResponseMode;
  avatarsUsed: AiAvatar[];
  responses: Array<{
    avatarId: string;
    avatarName: string;
    content: string;
    tokensUsed: number;
  }>;
}

export interface StreamingOrchestrationCallbacks {
  onAvatarStart: (avatar: AiAvatar) => void;
  onToken: (avatarId: string, token: string) => void;
  onAvatarComplete: (avatarId: string, fullResponse: string, usage: TokenUsage) => void;
  onAllComplete: (result: OrchestrationResult) => void;
  onError: (error: Error) => void;
}

// =============================================================================
// Orchestration Engine
// =============================================================================

class OrchestrationEngine {
  // ---------------------------------------------------------------------------
  // Main Entry Point
  // ---------------------------------------------------------------------------

  async processRequest(
    request: OrchestrationRequest,
    callbacks: StreamingOrchestrationCallbacks
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 1. Get or create session
      let session = await avatarRegistry.getSessionById(request.sessionId);
      if (!session) {
        session = await avatarRegistry.createSession({
          userId: request.userId,
          mode: request.mode,
          avatarsUsed: [],
          isActive: true,
        });
      }

      // 2. Save user message
      await avatarRegistry.createMessage({
        sessionId: session.id,
        role: "user",
        content: request.message,
        avatarId: null,
      });

      // 3. Determine which avatar(s) to use
      let avatarsToUse: AiAvatar[] = [];

      if (request.selectedAvatarIds && request.selectedAvatarIds.length > 0) {
        // User selected specific avatars
        avatarsToUse = await avatarRegistry.getAvatarsByIds(request.selectedAvatarIds);
      } else if (request.enableAutoRouting !== false) {
        // Auto-route to best avatar using orchestration layer
        avatarsToUse = await this.autoSelectAvatars(request.message, request.mode, session?.id);
      }

      if (avatarsToUse.length === 0) {
        // Fallback: use first active avatar
        const active = await avatarRegistry.getActiveAvatars();
        if (active.length > 0) {
          avatarsToUse = [active[0]];
        } else {
          throw new Error("No active avatars available");
        }
      }

      // 4. Log intent classification and avatar selection
      const intent = await llmService.classifyIntent(request.message);
      await observabilityService.logIntentClassification(
        session.id,
        intent,
        avatarsToUse.map(a => a.slug).join(", ")
      );

      // 5. Route to appropriate handler based on mode
      switch (request.mode) {
        case "single":
          await this.handleSingleMode(session, request.message, avatarsToUse[0], callbacks);
          break;

        case "multi":
          await this.handleMultiMode(session, request.message, avatarsToUse, callbacks);
          break;

        case "debate":
          // Debate mode is handled separately through debateEngine
          throw new Error("Debate mode should be handled through debateEngine");

        default:
          throw new Error(`Unknown mode: ${request.mode}`);
      }

      // 6. Update session with avatars used
      const avatarIds = avatarsToUse.map(a => a.id);
      const existingIds = session.avatarsUsed || [];
      const uniqueIds = [...new Set([...existingIds, ...avatarIds])];

      await avatarRegistry.updateSession(session.id, {
        avatarsUsed: uniqueIds,
        mode: request.mode,
      });

    } catch (error) {
      console.error("[OrchestrationEngine] Error:", error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // ---------------------------------------------------------------------------
  // Auto-Select Avatars (Using Orchestration Layer)
  // ---------------------------------------------------------------------------

  private async autoSelectAvatars(
    message: string,
    mode: ResponseMode,
    sessionId?: string
  ): Promise<AiAvatar[]> {
    // Build conversation context if we have a session
    let context: ConversationContext | undefined;
    if (sessionId) {
      const recentMessages = await avatarRegistry.getRecentMessages(sessionId, 10);
      const domains: Domain[] = [];

      // Extract domains from recent messages using orchestration layer
      for (const msg of recentMessages.filter(m => m.role === "user").slice(-3)) {
        const intent = await orchestrationLayer.classifyIntent(msg.content);
        if (!domains.includes(intent.primaryDomain)) {
          domains.push(intent.primaryDomain);
        }
      }

      context = orchestrationLayer.buildContext(
        recentMessages.map(m => ({
          role: m.role,
          content: m.content,
          avatarId: m.avatarId || undefined,
        })),
        domains
      );
    }

    // Use orchestration layer for intelligent routing
    const routingDecision = await orchestrationLayer.routePrompt(
      message,
      context,
      mode,
      undefined // No user-selected avatars - let system decide
    );

    // Log the routing decision reasoning
    console.log(`[OrchestrationEngine] Routing: ${routingDecision.reasoning}`);

    // Return selected avatars from the routing decision
    if (routingDecision.selectedAvatars.length > 0) {
      return routingDecision.selectedAvatars;
    }

    // Fallback: use avatar registry's keyword matching
    const best = await avatarRegistry.findBestAvatarForQuestion(message);
    if (best) {
      return [best];
    }

    return [];
  }

  // ---------------------------------------------------------------------------
  // Single Avatar Mode
  // ---------------------------------------------------------------------------

  private async handleSingleMode(
    session: AvatarSession,
    message: string,
    avatar: AiAvatar,
    callbacks: StreamingOrchestrationCallbacks
  ): Promise<void> {
    callbacks.onAvatarStart(avatar);

    // Get conversation history
    const recentMessages = await avatarRegistry.getRecentMessages(session.id, 10);
    const history = this.convertToLLMHistory(recentMessages);

    // Get relevant knowledge chunks if available
    const chunks = await avatarRegistry.searchKnowledgeBase(avatar.id, message);
    const contextChunks = chunks.map(c => c.content);

    // Build messages
    const messages = llmService.buildMessagesForAvatar(avatar, message, history, contextChunks);

    const startTime = Date.now();
    let fullResponse = "";

    // Stream the response
    await llmService.streamComplete(messages, {
      onToken: (token) => {
        fullResponse += token;
        callbacks.onToken(avatar.id, token);
      },
      onComplete: async (response, usage) => {
        // Save avatar response
        await avatarRegistry.createMessage({
          sessionId: session.id,
          role: "avatar",
          avatarId: avatar.id,
          content: response,
          tokensUsed: usage.totalTokens,
        });

        // Log metrics
        await observabilityService.logResponse(
          session.id,
          avatar.id,
          usage.promptTokens,
          usage.completionTokens,
          Date.now() - startTime
        );

        callbacks.onAvatarComplete(avatar.id, response, usage);

        // Send final result
        callbacks.onAllComplete({
          sessionId: session.id,
          mode: "single",
          avatarsUsed: [avatar],
          responses: [{
            avatarId: avatar.id,
            avatarName: avatar.name,
            content: response,
            tokensUsed: usage.totalTokens,
          }],
        });
      },
      onError: callbacks.onError,
    });
  }

  // ---------------------------------------------------------------------------
  // Multi-Avatar Mode
  // ---------------------------------------------------------------------------

  private async handleMultiMode(
    session: AvatarSession,
    message: string,
    avatars: AiAvatar[],
    callbacks: StreamingOrchestrationCallbacks
  ): Promise<void> {
    const responses: Array<{
      avatarId: string;
      avatarName: string;
      content: string;
      tokensUsed: number;
    }> = [];

    // Get conversation history once
    const recentMessages = await avatarRegistry.getRecentMessages(session.id, 10);
    const history = this.convertToLLMHistory(recentMessages);

    // Process each avatar sequentially (could be parallelized for speed)
    for (const avatar of avatars) {
      callbacks.onAvatarStart(avatar);

      const chunks = await avatarRegistry.searchKnowledgeBase(avatar.id, message);
      const contextChunks = chunks.map(c => c.content);

      const messages = llmService.buildMessagesForAvatar(avatar, message, history, contextChunks);
      const startTime = Date.now();

      await new Promise<void>((resolve, reject) => {
        llmService.streamComplete(messages, {
          onToken: (token) => {
            callbacks.onToken(avatar.id, token);
          },
          onComplete: async (response, usage) => {
            // Save avatar response
            await avatarRegistry.createMessage({
              sessionId: session.id,
              role: "avatar",
              avatarId: avatar.id,
              content: response,
              tokensUsed: usage.totalTokens,
            });

            // Log metrics
            await observabilityService.logResponse(
              session.id,
              avatar.id,
              usage.promptTokens,
              usage.completionTokens,
              Date.now() - startTime
            );

            responses.push({
              avatarId: avatar.id,
              avatarName: avatar.name,
              content: response,
              tokensUsed: usage.totalTokens,
            });

            callbacks.onAvatarComplete(avatar.id, response, usage);
            resolve();
          },
          onError: (error) => {
            // Continue with next avatar even if one fails
            console.error(`[OrchestrationEngine] Avatar ${avatar.name} error:`, error);
            resolve();
          },
        });
      });
    }

    // Send final result
    callbacks.onAllComplete({
      sessionId: session.id,
      mode: "multi",
      avatarsUsed: avatars,
      responses,
    });
  }

  // ---------------------------------------------------------------------------
  // Helper Methods
  // ---------------------------------------------------------------------------

  private convertToLLMHistory(messages: AvatarMessage[]): ChatMessage[] {
    return messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant" as const,
      content: m.content,
    }));
  }

  // ---------------------------------------------------------------------------
  // Quick Response (Non-Streaming)
  // ---------------------------------------------------------------------------

  async quickResponse(
    sessionId: string,
    userId: string,
    message: string,
    avatarId?: string
  ): Promise<{ avatarName: string; content: string }> {
    // Get or create session
    let session = await avatarRegistry.getSessionById(sessionId);
    if (!session) {
      session = await avatarRegistry.createSession({
        userId,
        mode: "single",
        avatarsUsed: [],
        isActive: true,
      });
    }

    // Get avatar
    let avatar: AiAvatar | null = null;
    if (avatarId) {
      avatar = await avatarRegistry.getAvatarById(avatarId);
    }
    if (!avatar) {
      avatar = await avatarRegistry.findBestAvatarForQuestion(message);
    }
    if (!avatar) {
      const active = await avatarRegistry.getActiveAvatars();
      avatar = active[0];
    }
    if (!avatar) {
      throw new Error("No active avatars available");
    }

    // Save user message
    await avatarRegistry.createMessage({
      sessionId: session.id,
      role: "user",
      content: message,
      avatarId: null,
    });

    // Get history and knowledge
    const recentMessages = await avatarRegistry.getRecentMessages(session.id, 10);
    const history = this.convertToLLMHistory(recentMessages);
    const chunks = await avatarRegistry.searchKnowledgeBase(avatar.id, message);
    const contextChunks = chunks.map(c => c.content);

    // Build messages and get response
    const messages = llmService.buildMessagesForAvatar(avatar, message, history, contextChunks);
    const response = await llmService.complete(messages);

    // Save avatar response
    await avatarRegistry.createMessage({
      sessionId: session.id,
      role: "avatar",
      avatarId: avatar.id,
      content: response.content,
      tokensUsed: response.usage.totalTokens,
    });

    // Log metrics
    await observabilityService.logResponse(
      session.id,
      avatar.id,
      response.usage.promptTokens,
      response.usage.completionTokens,
      response.latencyMs
    );

    return {
      avatarName: avatar.name,
      content: response.content,
    };
  }
}

export const orchestrationEngine = new OrchestrationEngine();
