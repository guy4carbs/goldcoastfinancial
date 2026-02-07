import { avatarRegistry } from "./avatarRegistry";
import type { AvatarLog, InsertAvatarLog } from "@shared/schema";

// =============================================================================
// Observability Service - Logging and Metrics
// =============================================================================

class ObservabilityService {
  // ---------------------------------------------------------------------------
  // Logging Methods
  // ---------------------------------------------------------------------------

  async logPrompt(
    sessionId: string,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<AvatarLog> {
    return avatarRegistry.createLog({
      sessionId,
      eventType: "prompt",
      metadata: {
        contentLength: content.length,
        ...metadata,
      },
    });
  }

  async logResponse(
    sessionId: string,
    avatarId: string,
    tokensIn: number,
    tokensOut: number,
    latencyMs: number,
    metadata?: Record<string, unknown>
  ): Promise<AvatarLog> {
    return avatarRegistry.createLog({
      sessionId,
      eventType: "response",
      tokensIn,
      tokensOut,
      latencyMs,
      metadata: {
        avatarId,
        ...metadata,
      },
    });
  }

  async logError(
    sessionId: string,
    errorMessage: string,
    metadata?: Record<string, unknown>
  ): Promise<AvatarLog> {
    console.error(`[AvatarCouncil] Session ${sessionId} error:`, errorMessage);
    return avatarRegistry.createLog({
      sessionId,
      eventType: "error",
      errorMessage,
      metadata,
    });
  }

  async logIntentClassification(
    sessionId: string,
    classification: {
      domain: string;
      questionType: string;
      confidence: number;
      suggestedAvatars?: string[];
    },
    avatarSelectionReasoning?: string
  ): Promise<AvatarLog> {
    return avatarRegistry.createLog({
      sessionId,
      eventType: "intent_classification",
      intentClassification: {
        domain: classification.domain,
        confidence: classification.confidence,
        questionType: classification.questionType,
      },
      avatarSelectionReasoning,
      metadata: {
        suggestedAvatars: classification.suggestedAvatars,
      },
    });
  }

  async logAvatarSelection(
    sessionId: string,
    selectedAvatarIds: string[],
    reasoning: string,
    metadata?: Record<string, unknown>
  ): Promise<AvatarLog> {
    return avatarRegistry.createLog({
      sessionId,
      eventType: "avatar_selection",
      avatarSelectionReasoning: reasoning,
      metadata: {
        selectedAvatarIds,
        ...metadata,
      },
    });
  }

  async logDebateEvent(
    sessionId: string,
    eventType: "debate_start" | "debate_turn" | "debate_complete" | "debate_interrupt" | "phase_complete" | "phase_start",
    metadata: Record<string, unknown>
  ): Promise<AvatarLog> {
    return avatarRegistry.createLog({
      sessionId,
      eventType,
      metadata,
    });
  }

  // ---------------------------------------------------------------------------
  // Metrics Retrieval
  // ---------------------------------------------------------------------------

  async getSessionMetrics(sessionId: string): Promise<{
    totalTokensIn: number;
    totalTokensOut: number;
    averageLatencyMs: number;
    errorCount: number;
    responseCount: number;
  }> {
    const logs = await avatarRegistry.getLogsBySessionId(sessionId);

    const responseLogs = logs.filter(l => l.eventType === "response");
    const errorLogs = logs.filter(l => l.eventType === "error");

    const totalTokensIn = responseLogs.reduce((sum, l) => sum + (l.tokensIn || 0), 0);
    const totalTokensOut = responseLogs.reduce((sum, l) => sum + (l.tokensOut || 0), 0);
    const totalLatency = responseLogs.reduce((sum, l) => sum + (l.latencyMs || 0), 0);
    const averageLatencyMs = responseLogs.length > 0 ? totalLatency / responseLogs.length : 0;

    return {
      totalTokensIn,
      totalTokensOut,
      averageLatencyMs: Math.round(averageLatencyMs),
      errorCount: errorLogs.length,
      responseCount: responseLogs.length,
    };
  }

  async getRecentActivity(limit: number = 50): Promise<{
    logs: AvatarLog[];
    summary: {
      totalSessions: number;
      totalResponses: number;
      totalErrors: number;
      totalTokens: number;
    };
  }> {
    const logs = await avatarRegistry.getRecentLogs(limit);

    // Get unique session IDs
    const sessionIds = new Set(logs.map(l => l.sessionId));

    const responseLogs = logs.filter(l => l.eventType === "response");
    const errorLogs = logs.filter(l => l.eventType === "error");

    const totalTokens = responseLogs.reduce(
      (sum, l) => sum + (l.tokensIn || 0) + (l.tokensOut || 0),
      0
    );

    return {
      logs,
      summary: {
        totalSessions: sessionIds.size,
        totalResponses: responseLogs.length,
        totalErrors: errorLogs.length,
        totalTokens,
      },
    };
  }

  async getAvatarUsageStats(): Promise<Array<{
    avatarId: string;
    avatarName: string;
    responseCount: number;
    totalTokens: number;
    averageLatencyMs: number;
  }>> {
    const logs = await avatarRegistry.getRecentLogs(1000);
    const avatars = await avatarRegistry.getAllAvatars();

    const avatarMap = new Map(avatars.map(a => [a.id, a]));

    // Group logs by avatar
    const avatarStats = new Map<string, {
      responseCount: number;
      totalTokens: number;
      totalLatency: number;
    }>();

    for (const log of logs) {
      if (log.eventType === "response" && log.metadata) {
        const avatarId = (log.metadata as { avatarId?: string }).avatarId;
        if (avatarId) {
          const stats = avatarStats.get(avatarId) || {
            responseCount: 0,
            totalTokens: 0,
            totalLatency: 0,
          };

          stats.responseCount++;
          stats.totalTokens += (log.tokensIn || 0) + (log.tokensOut || 0);
          stats.totalLatency += log.latencyMs || 0;

          avatarStats.set(avatarId, stats);
        }
      }
    }

    return Array.from(avatarStats.entries()).map(([avatarId, stats]) => ({
      avatarId,
      avatarName: avatarMap.get(avatarId)?.name || "Unknown",
      responseCount: stats.responseCount,
      totalTokens: stats.totalTokens,
      averageLatencyMs: stats.responseCount > 0
        ? Math.round(stats.totalLatency / stats.responseCount)
        : 0,
    }));
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------

  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: {
      database: boolean;
      avatarsAvailable: boolean;
      recentErrors: number;
    };
  }> {
    try {
      // Check database by fetching avatars
      const avatars = await avatarRegistry.getActiveAvatars();
      const avatarsAvailable = avatars.length > 0;

      // Check recent errors
      const recentLogs = await avatarRegistry.getRecentLogs(100);
      const recentErrors = recentLogs.filter(l => l.eventType === "error").length;

      const status = !avatarsAvailable
        ? "unhealthy"
        : recentErrors > 10
        ? "degraded"
        : "healthy";

      return {
        status,
        details: {
          database: true,
          avatarsAvailable,
          recentErrors,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          database: false,
          avatarsAvailable: false,
          recentErrors: 0,
        },
      };
    }
  }
}

export const observabilityService = new ObservabilityService();
