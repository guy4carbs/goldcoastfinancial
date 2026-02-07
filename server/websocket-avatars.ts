import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { avatarRegistry } from "./services/avatarRegistry";
import { orchestrationEngine, type ResponseMode } from "./services/orchestrationEngine";
import { debateEngine, type DebateConfig, type PhaseBasedCallbacks } from "./services/debateEngine";
import { observabilityService } from "./services/observabilityService";
import { avatarNetworkHub } from "./services/avatarNetworkHub";
import {
  type PhaseConfig,
  type DebateTurn,
  type DebatePhaseType,
  type ComprehensiveDebateSummary,
  type NetworkActivityEvent,
  type AvatarNetworkMessage,
  type AvatarNetworkStatus,
  type ExpertSummonRequest,
  type ExpertContribution,
  type SummonedExpert,
  NetworkMessageType,
} from "@shared/models/avatarCouncil";

// =============================================================================
// Types
// =============================================================================

interface AvatarClient {
  ws: WebSocket;
  userId: string;
  sessionId: string | null;
  debateId: string | null;
  isAdmin: boolean;
}

interface IncomingMessage {
  type: string;
  [key: string]: any;
}

// =============================================================================
// WebSocket Server Setup
// =============================================================================

const clients: Map<string, AvatarClient> = new Map();

export function setupAvatarWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  console.log("[AvatarWS] WebSocket server created on /ws/avatar-council");

  // Handle upgrade manually
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

    if (pathname === "/ws/avatar-council") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
    // Let other WebSocket servers handle their paths
  });

  wss.on("connection", (ws: WebSocket) => {
    const clientId = crypto.randomUUID();
    console.log(`[AvatarWS] Client connected: ${clientId}`);

    // Initialize client
    const client: AvatarClient = {
      ws,
      userId: "anonymous",
      sessionId: null,
      debateId: null,
      isAdmin: false,
    };
    clients.set(clientId, client);

    // Send welcome message
    sendToClient(ws, {
      type: "connected",
      clientId,
      message: "Connected to Avatar Council WebSocket",
    });

    // Handle messages
    ws.on("message", async (data) => {
      try {
        const message: IncomingMessage = JSON.parse(data.toString());
        await handleMessage(clientId, client, message);
      } catch (error) {
        console.error("[AvatarWS] Message handling error:", error);
        sendToClient(ws, {
          type: "error",
          error: "Invalid message format",
        });
      }
    });

    // Handle close
    ws.on("close", () => {
      console.log(`[AvatarWS] Client disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`[AvatarWS] Client error ${clientId}:`, error);
      clients.delete(clientId);
    });
  });

  return wss;
}

// =============================================================================
// Message Handlers
// =============================================================================

async function handleMessage(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { type } = message;

  switch (type) {
    case "auth":
      await handleAuth(client, message);
      break;

    case "avatar:prompt":
      await handleAvatarPrompt(clientId, client, message);
      break;

    case "avatar:route":
      await handleAvatarRoute(client, message);
      break;

    case "chat:summon:expert":
      await handleChatSummonExpert(clientId, client, message);
      break;

    case "debate:start":
      await handleDebateStart(clientId, client, message);
      break;

    case "debate:interrupt":
      await handleDebateInterrupt(client, message);
      break;

    case "debate:pause":
      await handleDebatePause(client, message);
      break;

    case "debate:resume":
      await handleDebateResume(client, message);
      break;

    case "debate:inject":
      await handleDebateInject(clientId, client, message);
      break;

    case "debate:add:avatar":
      await handleDebateAddAvatar(client, message);
      break;

    case "debate:remove:avatar":
      await handleDebateRemoveAvatar(client, message);
      break;

    case "admin:interrupt":
      await handleAdminInterrupt(client, message);
      break;

    case "session:create":
      await handleSessionCreate(client, message);
      break;

    case "session:join":
      await handleSessionJoin(client, message);
      break;

    case "session:end":
      await handleSessionEnd(client);
      break;

    case "ping":
      sendToClient(client.ws, { type: "pong", timestamp: Date.now() });
      break;

    // Network communication handlers
    case "network:subscribe":
      handleNetworkSubscribe(clientId, client);
      break;

    case "network:unsubscribe":
      handleNetworkUnsubscribe(clientId);
      break;

    case "network:message":
      await handleNetworkMessage(client, message);
      break;

    case "network:broadcast":
      await handleNetworkBroadcast(client, message);
      break;

    case "network:state":
      handleNetworkState(client);
      break;

    case "network:simulate":
      await handleNetworkSimulate(client, message);
      break;

    // Expert summoning handler
    case "debate:summon:expert":
      await handleDebateSummonExpert(clientId, client, message);
      break;

    case "debate:find:expert":
      await handleDebateFindExpert(client, message);
      break;

    default:
      sendToClient(client.ws, {
        type: "error",
        error: `Unknown message type: ${type}`,
      });
  }
}

// ---------------------------------------------------------------------------
// Auth Handler
// ---------------------------------------------------------------------------

async function handleAuth(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { userId, isAdmin } = message;

  client.userId = userId || "anonymous";
  client.isAdmin = isAdmin === true;

  sendToClient(client.ws, {
    type: "auth:success",
    userId: client.userId,
    isAdmin: client.isAdmin,
  });

  console.log(`[AvatarWS] Client authenticated: ${client.userId} (admin: ${client.isAdmin})`);
}

// ---------------------------------------------------------------------------
// Session Handlers
// ---------------------------------------------------------------------------

async function handleSessionCreate(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { mode = "single" } = message;

  const session = await avatarRegistry.createSession({
    userId: client.userId,
    mode,
    avatarsUsed: [],
    isActive: true,
  });

  client.sessionId = session.id;

  sendToClient(client.ws, {
    type: "session:created",
    session,
  });
}

async function handleSessionJoin(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { sessionId } = message;

  const session = await avatarRegistry.getSessionById(sessionId);
  if (!session) {
    sendToClient(client.ws, {
      type: "error",
      error: "Session not found",
    });
    return;
  }

  client.sessionId = sessionId;

  // Send session history
  const messages = await avatarRegistry.getMessagesBySessionId(sessionId);
  const avatarsUsed = session.avatarsUsed
    ? await avatarRegistry.getAvatarsByIds(session.avatarsUsed)
    : [];

  sendToClient(client.ws, {
    type: "session:joined",
    session,
    messages,
    avatarsUsed,
  });
}

async function handleSessionEnd(client: AvatarClient): Promise<void> {
  if (!client.sessionId) {
    sendToClient(client.ws, {
      type: "error",
      error: "No active session",
    });
    return;
  }

  const session = await avatarRegistry.endSession(client.sessionId);
  client.sessionId = null;

  sendToClient(client.ws, {
    type: "session:ended",
    session,
  });
}

// ---------------------------------------------------------------------------
// Avatar Routing Handler (LLM-based)
// ---------------------------------------------------------------------------

async function handleAvatarRoute(
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { content, context } = message;

  if (!content) {
    sendToClient(client.ws, {
      type: "error",
      error: "Content is required for routing",
    });
    return;
  }

  try {
    // Import orchestration layer for LLM-based routing
    const { orchestrationLayer } = await import("./services/orchestrationLayer");

    // Get routing decision from LLM-based orchestration
    const routingResult = await orchestrationLayer.routePrompt(content, context);

    sendToClient(client.ws, {
      type: "avatar:route:result",
      selectedAvatars: routingResult.selectedAvatars.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        avatarImageUrl: a.avatarImageUrl,
        domainExpertise: a.domainExpertise,
        debateStyle: a.debateStyle,
      })),
      mode: routingResult.mode,
      intent: {
        primaryDomain: routingResult.intent.primaryDomain,
        secondaryDomains: routingResult.intent.secondaryDomains,
        questionType: routingResult.intent.questionType,
        confidence: routingResult.intent.confidence,
      },
      reasoning: routingResult.reasoning,
      scores: routingResult.scores.slice(0, 3).map(s => ({
        avatarId: s.avatarId,
        avatarName: s.avatarName,
        totalScore: s.totalScore,
      })),
    });
  } catch (error: any) {
    console.error("[AvatarWS] Routing error:", error);
    sendToClient(client.ws, {
      type: "avatar:route:error",
      error: error.message || "Failed to route message",
    });
  }
}

// ---------------------------------------------------------------------------
// Chat Expert Summon Handler
// ---------------------------------------------------------------------------

async function handleChatSummonExpert(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { currentAvatarId, excludeAvatarIds, domain, reason, chatHistory } = message;

  if (!currentAvatarId || !domain) {
    sendToClient(client.ws, {
      type: "error",
      error: "currentAvatarId and domain are required",
    });
    return;
  }

  try {
    // Get current avatar name
    const currentAvatar = await avatarRegistry.getAvatarById(currentAvatarId);
    if (!currentAvatar) {
      sendToClient(client.ws, {
        type: "chat:summon:error",
        error: "Current avatar not found",
      });
      return;
    }

    // Build list of avatars to exclude (all currently in chat)
    const avatarsToExclude = excludeAvatarIds && Array.isArray(excludeAvatarIds)
      ? excludeAvatarIds
      : [currentAvatarId];

    // Find an expert for the domain (excluding all avatars already in chat)
    const expert = await debateEngine.findExpertForDomain(domain, avatarsToExclude);

    if (!expert) {
      sendToClient(client.ws, {
        type: "chat:summon:failed",
        reason: `No expert found for domain: ${domain}`,
        domain,
      });
      return;
    }

    // Send expert found notification
    sendToClient(client.ws, {
      type: "chat:summon:accepted",
      expert: {
        id: expert.id,
        name: expert.name,
        slug: expert.slug,
        avatarImageUrl: expert.avatarImageUrl,
        domainExpertise: expert.domainExpertise,
      },
    });

    // Build context from chat history
    const contextSnippet = chatHistory?.slice(-5).map((m: any) =>
      `${m.role === 'user' ? 'User' : m.avatarName || 'Avatar'}: ${m.content.slice(0, 200)}`
    ).join('\n') || '';

    // Generate expert contribution using streaming
    sendToClient(client.ws, {
      type: "chat:expert:contribution:start",
      expertId: expert.id,
      expertName: expert.name,
    });

    const { llmService } = await import("./services/llmService");
    const { personaRegistry } = await import("./services/personaRegistry");

    const persona = personaRegistry.getBySlug(expert.slug);
    const systemPrompt = persona
      ? personaRegistry.buildSystemPrompt(persona.id)
      : expert.systemPrompt;

    const expertPrompt = `You have been called in as an expert on "${domain}" to help with the current conversation.

Context from the conversation:
${contextSnippet}

The main advisor (${currentAvatar.name}) and user are discussing something related to ${domain}.
${reason ? `Reason for your expertise: ${reason}` : ''}

Please provide your expert perspective on this topic. Be concise but thorough. Introduce yourself briefly and share your relevant expertise and insights.`;

    let fullResponse = "";

    await llmService.streamComplete(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: expertPrompt },
      ],
      {
        onToken: (token) => {
          fullResponse += token;
          sendToClient(client.ws, {
            type: "chat:expert:contribution:token",
            expertId: expert.id,
            token,
          });
        },
        onComplete: () => {
          sendToClient(client.ws, {
            type: "chat:expert:contribution:complete",
            contribution: {
              expertId: expert.id,
              expertName: expert.name,
              expertSlug: expert.slug,
              content: fullResponse,
              domain,
              timestamp: new Date().toISOString(),
            },
          });
        },
        onError: (error) => {
          sendToClient(client.ws, {
            type: "chat:summon:error",
            error: error.message,
          });
        },
      }
    );
  } catch (error: any) {
    sendToClient(client.ws, {
      type: "chat:summon:error",
      error: error.message,
    });
  }
}

// ---------------------------------------------------------------------------
// Avatar Prompt Handler
// ---------------------------------------------------------------------------

async function handleAvatarPrompt(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const {
    content,
    mode = "single",
    avatarIds,
    enableAutoRouting = true,
  } = message;

  if (!content) {
    sendToClient(client.ws, {
      type: "error",
      error: "Content is required",
    });
    return;
  }

  // Create session if needed
  if (!client.sessionId) {
    const session = await avatarRegistry.createSession({
      userId: client.userId,
      mode: mode as ResponseMode,
      avatarsUsed: [],
      isActive: true,
    });
    client.sessionId = session.id;

    sendToClient(client.ws, {
      type: "session:created",
      session,
    });
  }

  // Process the request with streaming callbacks
  await orchestrationEngine.processRequest(
    {
      sessionId: client.sessionId,
      userId: client.userId,
      message: content,
      mode: mode as ResponseMode,
      selectedAvatarIds: avatarIds,
      enableAutoRouting,
    },
    {
      onAvatarStart: (avatar) => {
        sendToClient(client.ws, {
          type: "avatar:response:start",
          avatarId: avatar.id,
          avatarName: avatar.name,
          avatarImageUrl: avatar.avatarImageUrl,
        });
      },

      onToken: (avatarId, token) => {
        sendToClient(client.ws, {
          type: "avatar:response:token",
          avatarId,
          token,
        });
      },

      onAvatarComplete: (avatarId, fullResponse, usage) => {
        sendToClient(client.ws, {
          type: "avatar:response:end",
          avatarId,
          content: fullResponse,
          usage,
        });
      },

      onAllComplete: (result) => {
        sendToClient(client.ws, {
          type: "avatar:response:complete",
          sessionId: result.sessionId,
          mode: result.mode,
          avatarsUsed: result.avatarsUsed.map(a => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
          })),
          responses: result.responses,
        });
      },

      onError: (error) => {
        sendToClient(client.ws, {
          type: "avatar:response:error",
          error: error.message,
        });
      },
    }
  );
}

// ---------------------------------------------------------------------------
// Debate Handlers
// ---------------------------------------------------------------------------

async function handleDebateStart(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const {
    topic,
    avatar1Id,
    avatar2Id,
    avatarIds,  // New: array of avatar IDs for 2-4 avatar debates
    argumentRounds = 2,
    includeRebuttals = true,
    maxTurns = 6,
  } = message;

  // Support both legacy (avatar1Id, avatar2Id) and new (avatarIds) formats
  const resolvedAvatarIds = avatarIds?.length
    ? avatarIds
    : [avatar1Id, avatar2Id].filter(Boolean);

  if (!topic || resolvedAvatarIds.length < 2) {
    sendToClient(client.ws, {
      type: "error",
      error: "topic and at least 2 avatar IDs are required",
    });
    return;
  }

  if (resolvedAvatarIds.length > 4) {
    sendToClient(client.ws, {
      type: "error",
      error: "Maximum 4 avatars allowed in a debate",
    });
    return;
  }

  const callbacks: PhaseBasedCallbacks = {
    // Phase lifecycle
    onDebateStart: (debate, avatars, phases) => {
      client.debateId = debate.id;

      sendToClient(client.ws, {
        type: "debate:start",
        debateId: debate.id,
        sessionId: debate.sessionId,
        topic: debate.topic,
        maxTurns: debate.maxTurns,
        avatars: avatars.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          avatarImageUrl: a.avatarImageUrl,
          debateStyle: a.debateStyle,
        })),
        phases: phases.map(p => ({
          phase: p.phase,
          label: p.label,
          description: p.description,
          turnsPerAvatar: p.turnsPerAvatar,
          enableThinking: p.enableThinking,
        })),
        totalPhases: phases.length,
      });

      // Broadcast to admin clients
      broadcastToAdmins({
        type: "admin:debate:started",
        debateId: debate.id,
        userId: client.userId,
        topic: debate.topic,
        avatars: avatars.map(a => a.name),
        phases: phases.map(p => p.phase),
      });
    },

    onPhaseStart: (phase, phaseConfig, phaseNumber, totalPhases) => {
      sendToClient(client.ws, {
        type: "debate:phase:start",
        phase,
        phaseLabel: phaseConfig.label,
        phaseDescription: phaseConfig.description,
        phaseNumber,
        totalPhases,
        turnsPerAvatar: phaseConfig.turnsPerAvatar,
        enableThinking: phaseConfig.enableThinking,
      });
    },

    onPhaseComplete: (phase, turns) => {
      sendToClient(client.ws, {
        type: "debate:phase:complete",
        phase,
        turnsInPhase: turns.length,
        turns: turns.map(t => ({
          avatarId: t.avatarId,
          avatarName: t.avatarName,
          turnNumber: t.turnNumber,
          stance: t.stance,
        })),
      });
    },

    // Turn lifecycle
    onTurnStart: (avatar, phase, turnNumber, roundNumber) => {
      sendToClient(client.ws, {
        type: "debate:turn:start",
        avatarId: avatar.id,
        avatarName: avatar.name,
        avatarSlug: avatar.slug,
        phase,
        turnNumber,
        roundNumber,
      });
    },

    onToken: (avatarId, token) => {
      sendToClient(client.ws, {
        type: "debate:token",
        avatarId,
        token,
      });
    },

    onTurnComplete: (turn: DebateTurn) => {
      sendToClient(client.ws, {
        type: "debate:turn:end",
        turn: {
          id: turn.id,
          phase: turn.phase,
          phaseLabel: turn.phaseLabel,
          turnNumber: turn.turnNumber,
          roundNumber: turn.roundNumber,
          avatarId: turn.avatarId,
          avatarName: turn.avatarName,
          avatarSlug: turn.avatarSlug,
          content: turn.content,
          tokensUsed: turn.tokensUsed,
          timestamp: turn.timestamp,
          stance: turn.stance,
          stanceTarget: turn.stanceTarget,
          stanceConfidence: turn.stanceConfidence,
        },
      });
    },

    // Thinking (real-time)
    onThinkingStart: (avatarId, avatarName) => {
      sendToClient(client.ws, {
        type: "debate:thinking:start",
        avatarId,
        avatarName,
      });
    },

    onThinkingUpdate: (avatarId, thought) => {
      sendToClient(client.ws, {
        type: "debate:thinking:update",
        avatarId,
        thought,
      });
    },

    onThinkingEnd: (avatarId) => {
      sendToClient(client.ws, {
        type: "debate:thinking:end",
        avatarId,
      });
    },

    // Completion
    onSummaryGenerating: () => {
      sendToClient(client.ws, {
        type: "debate:summary:generating",
      });
    },

    onDebateComplete: (debate, summary: ComprehensiveDebateSummary) => {
      client.debateId = null;

      sendToClient(client.ws, {
        type: "debate:complete",
        debateId: debate.id,
        summary: {
          debateId: summary.debateId,
          topic: summary.topic,
          totalDuration: summary.totalDuration,
          totalTurns: summary.totalTurns,
          generatedAt: summary.generatedAt,
          avatar1: summary.avatar1,
          avatar2: summary.avatar2,
          executiveSummary: summary.executiveSummary,
          avatar1Position: summary.avatar1Position,
          avatar2Position: summary.avatar2Position,
          pointsOfAgreement: summary.pointsOfAgreement,
          pointsOfDisagreement: summary.pointsOfDisagreement,
          unresolvedQuestions: summary.unresolvedQuestions,
          phaseBreakdown: summary.phaseBreakdown,
          actionableInsights: summary.actionableInsights,
          transcript: summary.transcript,
        },
      });

      // Broadcast to admin clients
      broadcastToAdmins({
        type: "admin:debate:completed",
        debateId: debate.id,
        topic: summary.topic,
        totalTurns: summary.totalTurns,
        duration: summary.totalDuration,
      });
    },

    onDebateInterrupted: (debate, reason, partialSummary) => {
      client.debateId = null;

      sendToClient(client.ws, {
        type: "debate:interrupted",
        debateId: debate.id,
        reason,
        partialSummary: partialSummary || null,
      });
    },

    // Autonomous Consultation Agreement callbacks
    onConsultationProposed: (signal, agreement) => {
      sendToClient(client.ws, {
        type: "debate:consultation:proposed",
        signal: {
          avatarId: signal.avatarId,
          avatarName: signal.avatarName,
          domain: signal.domain,
          reason: signal.reason,
          urgency: signal.urgency,
        },
        agreement: {
          id: agreement.id,
          domain: agreement.domain,
          status: agreement.status,
          proposedBy: agreement.proposedBy,
        },
      });

      // Broadcast to all clients in this debate
      broadcastToAll({
        type: "debate:consultation:proposed",
        debateId: client.debateId,
        avatarName: signal.avatarName,
        domain: signal.domain,
        message: `${signal.avatarName} suggests bringing in an expert on "${signal.domain}"`,
      });
    },

    onConsultationSeconded: (agreement) => {
      sendToClient(client.ws, {
        type: "debate:consultation:seconded",
        agreement: {
          id: agreement.id,
          domain: agreement.domain,
          status: agreement.status,
          proposedBy: agreement.proposedBy,
          secondedBy: agreement.secondedBy,
        },
      });

      broadcastToAll({
        type: "debate:consultation:seconded",
        debateId: client.debateId,
        domain: agreement.domain,
        message: `Both avatars agree - summoning expert on "${agreement.domain}"`,
      });
    },

    onConsultationAgreed: (agreement, expert) => {
      sendToClient(client.ws, {
        type: "debate:consultation:agreed",
        agreement: {
          id: agreement.id,
          domain: agreement.domain,
          status: agreement.status,
        },
        expert: {
          id: expert.id,
          name: expert.name,
          slug: expert.slug,
          avatarImageUrl: expert.avatarImageUrl,
          domainExpertise: expert.domainExpertise,
        },
      });

      broadcastToAdmins({
        type: "admin:consultation:agreed",
        debateId: client.debateId,
        domain: agreement.domain,
        expertName: expert.name,
      });
    },

    // Expert contribution callbacks (for autonomous summoning)
    onExpertContributionStart: (expert) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:start",
        expertId: expert.id,
        expertName: expert.name,
      });
    },

    onExpertContributionToken: (expertId, token) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:token",
        expertId,
        token,
      });
    },

    onExpertContributionComplete: (contribution) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:complete",
        contribution,
      });

      broadcastToAll({
        type: "debate:expert:contributed",
        debateId: client.debateId,
        expertName: contribution.expertName,
        domain: contribution.expertSlug,
      });
    },

    onError: (error) => {
      sendToClient(client.ws, {
        type: "debate:error",
        error: error.message,
      });
    },
  };

  try {
    const config: DebateConfig = {
      topic,
      avatarIds: resolvedAvatarIds,  // New: pass the resolved array
      // Legacy fallback
      avatar1Id: resolvedAvatarIds[0],
      avatar2Id: resolvedAvatarIds[1],
      argumentRounds,
      includeRebuttals,
    };

    await debateEngine.startDebate(client.userId, config, callbacks);
  } catch (error: any) {
    sendToClient(client.ws, {
      type: "debate:error",
      error: error.message,
    });
  }
}

async function handleDebateInterrupt(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { debateId } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId) {
    sendToClient(client.ws, {
      type: "error",
      error: "No active debate to interrupt",
    });
    return;
  }

  const success = await debateEngine.interruptDebate(targetDebateId);

  sendToClient(client.ws, {
    type: "debate:interrupt:result",
    success,
    debateId: targetDebateId,
  });
}

async function handleDebatePause(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { debateId } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId) {
    sendToClient(client.ws, {
      type: "error",
      error: "No active debate to pause",
    });
    return;
  }

  const success = await debateEngine.pauseDebate(targetDebateId);

  sendToClient(client.ws, {
    type: success ? "debate:paused" : "error",
    debateId: targetDebateId,
    ...(success ? {} : { error: "Failed to pause debate" }),
  });
}

async function handleDebateResume(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { debateId } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId) {
    sendToClient(client.ws, {
      type: "error",
      error: "No paused debate to resume",
    });
    return;
  }

  // Build callbacks for resumed debate
  const callbacks: PhaseBasedCallbacks = {
    onDebateStart: (debate, avatars, phases) => {
      client.debateId = debate.id;
      sendToClient(client.ws, {
        type: "debate:resumed",
        debateId: debate.id,
        sessionId: debate.sessionId,
        topic: debate.topic,
        currentTurn: debate.currentTurn,
        avatars: avatars.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          avatarImageUrl: a.avatarImageUrl,
        })),
        phases: phases.map(p => p.phase),
      });
    },
    onPhaseStart: (phase, phaseConfig, phaseNumber, totalPhases) => {
      sendToClient(client.ws, {
        type: "debate:phase:start",
        phase,
        phaseLabel: phaseConfig.label,
        phaseNumber,
        totalPhases,
      });
    },
    onPhaseComplete: (phase, turns) => {
      sendToClient(client.ws, {
        type: "debate:phase:complete",
        phase,
        turnsInPhase: turns.length,
      });
    },
    onTurnStart: (avatar, phase, turnNumber, roundNumber) => {
      sendToClient(client.ws, {
        type: "debate:turn:start",
        avatarId: avatar.id,
        avatarName: avatar.name,
        phase,
        turnNumber,
        roundNumber,
      });
    },
    onToken: (avatarId, token) => {
      sendToClient(client.ws, {
        type: "debate:token",
        avatarId,
        token,
      });
    },
    onTurnComplete: (turn: DebateTurn) => {
      sendToClient(client.ws, {
        type: "debate:turn:end",
        turn,
      });
    },
    onThinkingStart: (avatarId, avatarName) => {
      sendToClient(client.ws, {
        type: "debate:thinking:start",
        avatarId,
        avatarName,
      });
    },
    onThinkingUpdate: (avatarId, thought) => {
      sendToClient(client.ws, {
        type: "debate:thinking:update",
        avatarId,
        thought,
      });
    },
    onThinkingEnd: (avatarId) => {
      sendToClient(client.ws, {
        type: "debate:thinking:end",
        avatarId,
      });
    },
    onSummaryGenerating: () => {
      sendToClient(client.ws, {
        type: "debate:summary:generating",
      });
    },
    onDebateComplete: (debate, summary) => {
      client.debateId = null;
      sendToClient(client.ws, {
        type: "debate:complete",
        debateId: debate.id,
        summary,
      });
    },
    onDebateInterrupted: (debate, reason, partialSummary) => {
      client.debateId = null;
      sendToClient(client.ws, {
        type: "debate:interrupted",
        debateId: debate.id,
        reason,
        partialSummary,
      });
    },
    onError: (error) => {
      sendToClient(client.ws, {
        type: "debate:error",
        error: error.message,
      });
    },
  };

  try {
    const success = await debateEngine.resumeDebate(targetDebateId, callbacks);
    if (!success) {
      sendToClient(client.ws, {
        type: "error",
        error: "Failed to resume debate - debate may not be paused or may not exist",
      });
    }
  } catch (error: any) {
    sendToClient(client.ws, {
      type: "debate:error",
      error: error.message,
    });
  }
}

async function handleDebateInject(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { debateId, question } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId || !question) {
    sendToClient(client.ws, {
      type: "error",
      error: "debateId and question are required",
    });
    return;
  }

  // Get the debate to find both avatars
  const debate = debateEngine.getActiveDebate(targetDebateId);
  if (!debate) {
    sendToClient(client.ws, {
      type: "error",
      error: "Debate not found or not active",
    });
    return;
  }

  // Get both avatars
  const avatar1 = await avatarRegistry.getAvatarById(debate.avatar1Id);
  const avatar2 = await avatarRegistry.getAvatarById(debate.avatar2Id);

  if (!avatar1 || !avatar2) {
    sendToClient(client.ws, {
      type: "error",
      error: "Avatars not found",
    });
    return;
  }

  // Process responses from both avatars (sequentially)
  for (const avatar of [avatar1, avatar2]) {
    sendToClient(client.ws, {
      type: "avatar:response:start",
      avatarId: avatar.id,
      avatarName: avatar.name,
      context: "injection_response",
    });

    await orchestrationEngine.processRequest(
      {
        sessionId: debate.sessionId,
        userId: client.userId,
        message: question,
        mode: "single",
        selectedAvatarIds: [avatar.id],
        enableAutoRouting: false,
      },
      {
        onAvatarStart: () => {},
        onToken: (avatarId, token) => {
          sendToClient(client.ws, {
            type: "avatar:response:token",
            avatarId,
            token,
          });
        },
        onAvatarComplete: (avatarId, fullResponse, usage) => {
          sendToClient(client.ws, {
            type: "avatar:response:end",
            avatarId,
            content: fullResponse,
            usage,
            context: "injection_response",
          });
        },
        onAllComplete: () => {},
        onError: (error) => {
          sendToClient(client.ws, {
            type: "avatar:response:error",
            error: error.message,
          });
        },
      }
    );
  }

  // Signal injection complete
  sendToClient(client.ws, {
    type: "debate:injection:complete",
    debateId: targetDebateId,
  });
}

async function handleDebateAddAvatar(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { debateId, avatarId, role } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId || !avatarId) {
    sendToClient(client.ws, {
      type: "error",
      error: "debateId and avatarId are required",
    });
    return;
  }

  // Validate avatar exists
  const avatar = await avatarRegistry.getAvatarById(avatarId);
  if (!avatar) {
    sendToClient(client.ws, {
      type: "error",
      error: "Avatar not found",
    });
    return;
  }

  // For now, just acknowledge - full 3-avatar support would need debate engine changes
  sendToClient(client.ws, {
    type: "debate:avatar:added",
    debateId: targetDebateId,
    avatarId,
    avatarName: avatar.name,
    role: role || "moderator",
  });
}

async function handleDebateRemoveAvatar(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { debateId, avatarId, summarize } = message;
  const targetDebateId = debateId || client.debateId;

  if (!targetDebateId || !avatarId) {
    sendToClient(client.ws, {
      type: "error",
      error: "debateId and avatarId are required",
    });
    return;
  }

  // For now, just acknowledge - would need to replace or end debate
  sendToClient(client.ws, {
    type: "debate:avatar:removed",
    debateId: targetDebateId,
    avatarId,
    summarized: summarize === true,
  });
}

async function handleAdminInterrupt(client: AvatarClient, message: IncomingMessage): Promise<void> {
  if (!client.isAdmin) {
    sendToClient(client.ws, {
      type: "error",
      error: "Admin privileges required",
    });
    return;
  }

  const { debateId, targetClientId } = message;

  if (debateId) {
    const success = await debateEngine.interruptDebate(debateId);

    // Notify the client whose debate was interrupted
    broadcastToAll({
      type: "admin:debate:interrupted",
      debateId,
      interruptedBy: client.userId,
    });

    sendToClient(client.ws, {
      type: "admin:interrupt:result",
      success,
      debateId,
    });
  }
}

// =============================================================================
// Network Communication Handlers
// =============================================================================

// Track network subscriptions by client ID
const networkSubscriptions: Map<string, () => void> = new Map();

function handleNetworkSubscribe(clientId: string, client: AvatarClient): void {
  // Unsubscribe from any existing subscription
  const existingUnsub = networkSubscriptions.get(clientId);
  if (existingUnsub) {
    existingUnsub();
  }

  // Subscribe to network events
  const unsubscribe = avatarNetworkHub.subscribe({
    id: clientId,
    onActivity: (event: NetworkActivityEvent) => {
      sendToClient(client.ws, {
        type: "network:activity",
        event,
      });
    },
    onMessage: (message: AvatarNetworkMessage) => {
      sendToClient(client.ws, {
        type: "network:message:received",
        message,
      });
    },
    onStatusChange: (status: AvatarNetworkStatus) => {
      sendToClient(client.ws, {
        type: "network:status:changed",
        status,
      });
    },
  });

  networkSubscriptions.set(clientId, unsubscribe);

  // Send current network state
  const state = avatarNetworkHub.getNetworkState();
  sendToClient(client.ws, {
    type: "network:subscribed",
    state,
  });

  console.log(`[AvatarWS] Client ${clientId} subscribed to network events`);
}

function handleNetworkUnsubscribe(clientId: string): void {
  const unsubscribe = networkSubscriptions.get(clientId);
  if (unsubscribe) {
    unsubscribe();
    networkSubscriptions.delete(clientId);
    console.log(`[AvatarWS] Client ${clientId} unsubscribed from network events`);
  }
}

async function handleNetworkMessage(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { fromAvatarId, toAvatarId, content, messageType } = message;

  if (!fromAvatarId || !toAvatarId || !content) {
    sendToClient(client.ws, {
      type: "error",
      error: "fromAvatarId, toAvatarId, and content are required",
    });
    return;
  }

  const networkMessage = avatarNetworkHub.sendMessage(
    fromAvatarId,
    toAvatarId,
    content,
    messageType || NetworkMessageType.DIRECT
  );

  if (networkMessage) {
    sendToClient(client.ws, {
      type: "network:message:sent",
      message: networkMessage,
    });
  } else {
    sendToClient(client.ws, {
      type: "error",
      error: "Failed to send network message",
    });
  }
}

async function handleNetworkBroadcast(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { fromAvatarId, content, messageType } = message;

  if (!fromAvatarId || !content) {
    sendToClient(client.ws, {
      type: "error",
      error: "fromAvatarId and content are required",
    });
    return;
  }

  const networkMessage = avatarNetworkHub.broadcastMessage(
    fromAvatarId,
    content,
    messageType || NetworkMessageType.BROADCAST
  );

  if (networkMessage) {
    sendToClient(client.ws, {
      type: "network:broadcast:sent",
      message: networkMessage,
    });
  } else {
    sendToClient(client.ws, {
      type: "error",
      error: "Failed to broadcast network message",
    });
  }
}

function handleNetworkState(client: AvatarClient): void {
  const state = avatarNetworkHub.getNetworkState();
  sendToClient(client.ws, {
    type: "network:state",
    state,
  });
}

/**
 * Simulate network activity between avatars (for demo/testing)
 */
async function handleNetworkSimulate(client: AvatarClient, message: IncomingMessage): Promise<void> {
  const { action, duration = 5000 } = message;

  if (action === "start") {
    // Start simulating random avatar communication
    simulateNetworkActivity(duration);
    sendToClient(client.ws, {
      type: "network:simulate:started",
      duration,
    });
  } else if (action === "stop") {
    // Stop would need a flag to check
    sendToClient(client.ws, {
      type: "network:simulate:stopped",
    });
  }
}

// =============================================================================
// Expert Summoning Handlers
// =============================================================================

/**
 * Handle manual expert summoning request
 */
async function handleDebateSummonExpert(
  clientId: string,
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { debateId, requestingAvatarId, domain, reason, context } = message;

  if (!debateId || !requestingAvatarId || !domain) {
    sendToClient(client.ws, {
      type: "error",
      error: "debateId, requestingAvatarId, and domain are required",
    });
    return;
  }

  // Build callbacks for the summon process
  const callbacks: PhaseBasedCallbacks = {
    onDebateStart: () => {},
    onPhaseStart: () => {},
    onPhaseComplete: () => {},
    onTurnStart: () => {},
    onToken: () => {},
    onTurnComplete: () => {},
    onThinkingStart: () => {},
    onThinkingUpdate: () => {},
    onThinkingEnd: () => {},
    onSummaryGenerating: () => {},
    onDebateComplete: () => {},
    onDebateInterrupted: () => {},
    onError: (error) => {
      sendToClient(client.ws, {
        type: "debate:summon:error",
        error: error.message,
      });
    },

    // Summon-specific callbacks
    onSummonRequest: (request, matchedExpert) => {
      sendToClient(client.ws, {
        type: "debate:summon:request",
        request,
        matchedExpert: matchedExpert ? {
          id: matchedExpert.id,
          name: matchedExpert.name,
          slug: matchedExpert.slug,
          domainExpertise: matchedExpert.domainExpertise,
        } : null,
      });

      // Broadcast to admins
      broadcastToAdmins({
        type: "admin:expert:summon:request",
        debateId,
        domain,
        requestedBy: request.requestingAvatarName,
        matchedExpert: matchedExpert?.name || null,
      });
    },

    onExpertSummoned: (expert, request) => {
      sendToClient(client.ws, {
        type: "debate:summon:accepted",
        expert: {
          id: expert.id,
          name: expert.name,
          slug: expert.slug,
          avatarImageUrl: expert.avatarImageUrl,
          domainExpertise: expert.domainExpertise,
        },
        request,
      });
    },

    onExpertContributionStart: (expert) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:start",
        expertId: expert.id,
        expertName: expert.name,
      });
    },

    onExpertContributionToken: (expertId, token) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:token",
        expertId,
        token,
      });
    },

    onExpertContributionComplete: (contribution) => {
      sendToClient(client.ws, {
        type: "debate:expert:contribution:complete",
        contribution,
      });

      // Broadcast completion to all clients in this debate
      broadcastToAll({
        type: "debate:expert:contributed",
        debateId,
        expertName: contribution.expertName,
        domain,
      });
    },
  };

  try {
    const contribution = await debateEngine.summonExpert(
      debateId,
      requestingAvatarId,
      domain,
      reason || "Expert consultation requested",
      context || "",
      callbacks
    );

    if (!contribution) {
      sendToClient(client.ws, {
        type: "debate:summon:failed",
        reason: "No suitable expert found for the requested domain",
        domain,
      });
    }
  } catch (error: any) {
    sendToClient(client.ws, {
      type: "debate:summon:error",
      error: error.message,
    });
  }
}

/**
 * Handle request to find an expert for a domain (without summoning)
 */
async function handleDebateFindExpert(
  client: AvatarClient,
  message: IncomingMessage
): Promise<void> {
  const { domain, excludeAvatarIds = [] } = message;

  if (!domain) {
    sendToClient(client.ws, {
      type: "error",
      error: "domain is required",
    });
    return;
  }

  const expert = await debateEngine.findExpertForDomain(domain, excludeAvatarIds);

  sendToClient(client.ws, {
    type: "debate:expert:found",
    domain,
    expert: expert ? {
      id: expert.id,
      name: expert.name,
      slug: expert.slug,
      avatarImageUrl: expert.avatarImageUrl,
      domainExpertise: expert.domainExpertise,
      debateStyle: expert.debateStyle,
    } : null,
  });
}

// =============================================================================
// Network Simulation
// =============================================================================

/**
 * Simulate comprehensive communication between ALL avatar pairs
 * This ensures every connection in the network gets activity during simulation
 */
async function simulateNetworkActivity(duration: number): Promise<void> {
  const avatars = avatarNetworkHub.getAllAvatarStatuses();
  if (avatars.length < 2) return;

  const onlineAvatars = avatars.filter(a => a.isOnline);
  if (onlineAvatars.length < 2) return;

  const messageTypes = [
    NetworkMessageType.DIRECT,
    NetworkMessageType.INSIGHT,
    NetworkMessageType.QUERY,
    NetworkMessageType.RESPONSE,
  ];

  const sampleMessages = [
    "I have insights on this client's risk profile",
    "What's your take on the underwriting guidelines here?",
    "Based on my analysis, we should consider...",
    "The compliance angle is important here",
    "Let me share what I've learned about this case",
    "I agree with your assessment",
    "Here's an alternative perspective to consider",
    "The numbers support this approach",
    "This is a critical point to address",
    "Let me elaborate on that strategy",
  ];

  // Build all possible pairs for comprehensive coverage
  const allPairs: Array<{ sender: AvatarNetworkStatus; receiver: AvatarNetworkStatus }> = [];
  for (let i = 0; i < onlineAvatars.length; i++) {
    for (let j = i + 1; j < onlineAvatars.length; j++) {
      // Add both directions for bidirectional communication
      allPairs.push({ sender: onlineAvatars[i], receiver: onlineAvatars[j] });
      allPairs.push({ sender: onlineAvatars[j], receiver: onlineAvatars[i] });
    }
  }

  // Shuffle pairs for natural randomization
  for (let i = allPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
  }

  // Calculate delay between messages to fit all pairs in the duration
  const totalPairs = allPairs.length;
  const baseDelay = Math.max(300, (duration * 0.8) / totalPairs); // Leave 20% buffer

  let currentPairIdx = 0;
  const endTime = Date.now() + duration;

  const simulate = () => {
    if (Date.now() > endTime) return;

    // Get current pair (cycle through all pairs)
    const { sender, receiver } = allPairs[currentPairIdx % allPairs.length];
    currentPairIdx++;

    const msgType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const content = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    // Send thinking first
    avatarNetworkHub.emitThinking(sender.avatarId, receiver.avatarId);

    // Then send message after short delay
    setTimeout(() => {
      avatarNetworkHub.sendMessage(sender.avatarId, receiver.avatarId, content, msgType);
    }, 200 + Math.random() * 400);

    // Schedule next message with some randomization
    const nextDelay = baseDelay + (Math.random() * baseDelay * 0.5);
    setTimeout(simulate, nextDelay);
  };

  // Start simulation
  console.log(`[NetworkHub] Starting simulation: ${totalPairs} pair combinations over ${duration}ms`);
  simulate();
}

/**
 * Initialize avatars in the network hub
 */
export async function initializeAvatarNetwork(): Promise<void> {
  try {
    const avatars = await avatarRegistry.getAllAvatars();

    for (const avatar of avatars) {
      if (avatar.isActive) {
        avatarNetworkHub.registerAvatar(avatar.id, avatar.name, avatar.slug);
      }
    }

    console.log(`[NetworkHub] Initialized ${avatars.filter(a => a.isActive).length} avatars in network`);
  } catch (error) {
    console.error("[NetworkHub] Failed to initialize avatar network:", error);
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

function sendToClient(ws: WebSocket, message: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToAll(message: object): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

function broadcastToAdmins(message: object): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

function broadcastToSession(sessionId: string, message: object): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

// =============================================================================
// Exports for External Use
// =============================================================================

export function getConnectedClients(): number {
  return clients.size;
}

export function getAdminClients(): number {
  let count = 0;
  clients.forEach((client) => {
    if (client.isAdmin) count++;
  });
  return count;
}

export function notifyAdmins(message: object): void {
  broadcastToAdmins(message);
}
