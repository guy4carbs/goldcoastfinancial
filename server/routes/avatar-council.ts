import { Router, Request, Response } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { avatarRegistry } from "../services/avatarRegistry";
import { orchestrationEngine } from "../services/orchestrationEngine";
import { debateEngine, type DebateConfig } from "../services/debateEngine";
import { observabilityService } from "../services/observabilityService";
import { llmService } from "../services/llmService";
import { personaRegistry } from "../services/personaRegistry";
import { orchestrationLayer } from "../services/orchestrationLayer";
import { autoRouter } from "../services/autoRouter";
import { debateModeEngine, TurnStrategy, MemoryScope } from "../services/debateModeEngine";
import { generateDebateManuscript } from "../services/debateManuscriptService";
import {
  insertAiAvatarSchema,
  updateAiAvatarSchema,
  insertAvatarKnowledgeBaseSchema,
  insertKnowledgeDocumentSchema,
} from "@shared/schema";

const router = Router();

// Middleware to check auth (optional - can be made required)
function optionalAuth(req: Request, res: Response, next: Function) {
  // For now, allow unauthenticated access to avatar council
  // In production, you'd check req.session.userId
  next();
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// =============================================================================
// Avatar CRUD Routes
// =============================================================================

// GET /api/avatar-council/avatars - List all avatars
router.get("/avatars", async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === "true";
    const avatars = activeOnly
      ? await avatarRegistry.getActiveAvatars()
      : await avatarRegistry.getAllAvatars();

    res.json(avatars);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /avatars error:", error);
    res.status(500).json({ error: "Failed to fetch avatars" });
  }
});

// GET /api/avatar-council/avatars/:id - Get single avatar
router.get("/avatars/:id", async (req: Request, res: Response) => {
  try {
    const avatar = await avatarRegistry.getAvatarById(req.params.id);
    if (!avatar) {
      return res.status(404).json({ error: "Avatar not found" });
    }
    res.json(avatar);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /avatars/:id error:", error);
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});

// POST /api/avatar-council/avatars - Create avatar (admin)
router.post("/avatars", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = insertAiAvatarSchema.parse(req.body);
    const avatar = await avatarRegistry.createAvatar(data);
    res.status(201).json(avatar);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /avatars error:", error);
    res.status(500).json({ error: "Failed to create avatar" });
  }
});

// PATCH /api/avatar-council/avatars/:id - Update avatar (admin)
router.patch("/avatars/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = updateAiAvatarSchema.parse(req.body);
    const avatar = await avatarRegistry.updateAvatar(req.params.id, data);
    if (!avatar) {
      return res.status(404).json({ error: "Avatar not found" });
    }
    res.json(avatar);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] PATCH /avatars/:id error:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

// DELETE /api/avatar-council/avatars/:id - Delete avatar (admin)
router.delete("/avatars/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await avatarRegistry.deleteAvatar(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("[AvatarCouncil] DELETE /avatars/:id error:", error);
    res.status(500).json({ error: "Failed to delete avatar" });
  }
});

// POST /api/avatar-council/avatars/:id/toggle - Toggle avatar active status (admin)
router.post("/avatars/:id/toggle", requireAuth, async (req: Request, res: Response) => {
  try {
    const avatar = await avatarRegistry.toggleAvatarActive(req.params.id);
    if (!avatar) {
      return res.status(404).json({ error: "Avatar not found" });
    }
    res.json(avatar);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /avatars/:id/toggle error:", error);
    res.status(500).json({ error: "Failed to toggle avatar" });
  }
});

// =============================================================================
// Session Routes
// =============================================================================

// POST /api/avatar-council/sessions - Create new session
router.post("/sessions", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { mode = "single" } = req.body;
    const userId = req.session?.userId || "anonymous";

    const session = await avatarRegistry.createSession({
      userId,
      mode,
      avatarsUsed: [],
      isActive: true,
    });

    res.status(201).json(session);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /sessions error:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// GET /api/avatar-council/sessions/:id - Get session with messages
router.get("/sessions/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const session = await avatarRegistry.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const messages = await avatarRegistry.getMessagesBySessionId(session.id);
    const avatarsUsed = session.avatarsUsed
      ? await avatarRegistry.getAvatarsByIds(session.avatarsUsed)
      : [];

    res.json({
      session,
      messages,
      avatarsUsed,
    });
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /sessions/:id error:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// GET /api/avatar-council/sessions - List user's sessions
router.get("/sessions", optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId || "anonymous";
    const sessions = await avatarRegistry.getSessionsByUserId(userId);
    res.json(sessions);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /sessions error:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// POST /api/avatar-council/sessions/:id/end - End a session
router.post("/sessions/:id/end", optionalAuth, async (req: Request, res: Response) => {
  try {
    const session = await avatarRegistry.endSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /sessions/:id/end error:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// =============================================================================
// Chat Routes (Non-Streaming)
// =============================================================================

// POST /api/avatar-council/chat - Quick chat (non-streaming)
router.post("/chat", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { sessionId, message, avatarId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userId = req.session?.userId || "anonymous";

    const response = await orchestrationEngine.quickResponse(
      sessionId || crypto.randomUUID(),
      userId,
      message,
      avatarId
    );

    res.json(response);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /chat error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// POST /api/avatar-council/classify - Classify intent without generating response
router.post("/classify", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const classification = await llmService.classifyIntent(message);
    res.json(classification);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /classify error:", error);
    res.status(500).json({ error: "Failed to classify intent" });
  }
});

// =============================================================================
// Debate Routes
// =============================================================================

// POST /api/avatar-council/debates - Start a debate
router.post("/debates", optionalAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      topic: z.string().min(1),
      avatar1Id: z.string().uuid(),
      avatar2Id: z.string().uuid(),
      maxTurns: z.number().min(2).max(20).default(6),
    });

    const data = schema.parse(req.body);
    const userId = req.session?.userId || "anonymous";

    // Start debate (callbacks will be handled via WebSocket)
    // For REST, we just validate and return the debate ID
    const session = await avatarRegistry.createSession({
      userId,
      mode: "debate",
      avatarsUsed: [data.avatar1Id, data.avatar2Id],
      isActive: true,
    });

    const debate = await avatarRegistry.createDebateSession({
      sessionId: session.id,
      topic: data.topic,
      avatar1Id: data.avatar1Id,
      avatar2Id: data.avatar2Id,
      maxTurns: data.maxTurns,
      currentTurn: 1,
      status: "active",
    });

    const avatar1 = await avatarRegistry.getAvatarById(data.avatar1Id);
    const avatar2 = await avatarRegistry.getAvatarById(data.avatar2Id);

    res.status(201).json({
      debateId: debate.id,
      sessionId: session.id,
      topic: data.topic,
      maxTurns: data.maxTurns,
      avatars: [avatar1, avatar2],
      message: "Debate created. Connect via WebSocket to receive streaming updates.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /debates error:", error);
    res.status(500).json({ error: "Failed to start debate" });
  }
});

// GET /api/avatar-council/debates/:id - Get debate status and history
router.get("/debates/:id", async (req: Request, res: Response) => {
  try {
    const debate = await avatarRegistry.getDebateSessionById(req.params.id);
    if (!debate) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const summary = await debateEngine.getDebateHistory(req.params.id);

    res.json({
      debate,
      summary,
    });
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /debates/:id error:", error);
    res.status(500).json({ error: "Failed to fetch debate" });
  }
});

// POST /api/avatar-council/debates/:id/interrupt - Interrupt a debate (admin)
router.post("/debates/:id/interrupt", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await debateEngine.interruptDebate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Debate not found or not active" });
    }
    res.json({ message: "Debate interrupted" });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/interrupt error:", error);
    res.status(500).json({ error: "Failed to interrupt debate" });
  }
});

// GET /api/avatar-council/debates/:id/manuscript - Generate PDF manuscript for completed debate
router.get("/debates/:id/manuscript", async (req: Request, res: Response) => {
  try {
    const debateId = req.params.id;

    // First try to get comprehensive summary from debateEngine (primary)
    const comprehensiveSummary = await debateEngine.getDebateHistory(debateId);

    // If not found in debateEngine, try debateModeEngine and get basic summary
    let summary: any = comprehensiveSummary;
    let debateStatus: string | undefined;

    if (!summary) {
      const basicSummary = await debateModeEngine.getDebateHistory(debateId);
      if (basicSummary) {
        summary = basicSummary;
        debateStatus = (basicSummary as any).status;
      }
    }

    if (!summary) {
      return res.status(404).json({ error: "Debate not found" });
    }

    // Check if debate is completed (status may be on summary or we check via database)
    const status = debateStatus || (summary as any).status;
    if (status && status !== "completed" && status !== "interrupted") {
      return res.status(400).json({
        error: "Manuscript can only be generated for completed debates",
        currentStatus: status,
      });
    }

    // Generate the PDF
    const includeMetrics = req.query.metrics === "true";
    const pdfBuffer = await generateDebateManuscript(summary, {
      includeMetrics,
    });

    // Generate filename
    const sanitizedTopic = (summary.topic || "debate")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `debate-manuscript-${sanitizedTopic}-${timestamp}.pdf`;

    // Send PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);

    console.log(`[AvatarCouncil] Generated manuscript PDF for debate ${debateId} (${pdfBuffer.length} bytes)`);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /debates/:id/manuscript error:", error);
    res.status(500).json({ error: "Failed to generate manuscript", details: error.message });
  }
});

// =============================================================================
// Enhanced Debate Mode Engine Routes (2+ avatars)
// =============================================================================

// POST /api/avatar-council/debates/multi - Start a multi-avatar debate
router.post("/debates/multi", optionalAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      topic: z.string().min(1),
      avatarIds: z.array(z.string().uuid()).min(2).max(5),
      maxTurns: z.number().min(2).max(20).default(6),
      strategy: z.enum(["round_robin", "ping_pong", "response_chain"]).optional(),
      memoryScope: z.enum(["full", "recent", "relevant", "minimal"]).optional(),
      maxTurnsInContext: z.number().min(1).max(20).optional(),
      turnDelayMs: z.number().min(0).max(5000).optional(),
    });

    const data = schema.parse(req.body);
    const userId = req.session?.userId || "anonymous";

    // Start debate with callbacks (for REST, we just return the ID)
    const debateId = await debateModeEngine.startDebate(
      userId,
      {
        topic: data.topic,
        avatarIds: data.avatarIds,
        maxTurns: data.maxTurns,
        strategy: data.strategy as TurnStrategy,
        memoryScope: data.memoryScope as MemoryScope,
        maxTurnsInContext: data.maxTurnsInContext,
        turnDelayMs: data.turnDelayMs,
      },
      {
        onDebateStart: () => {},
        onTurnStart: () => {},
        onToken: () => {},
        onTurnComplete: () => {},
        onDebatePaused: () => {},
        onDebateResumed: () => {},
        onDebateComplete: () => {},
        onDebateTerminated: () => {},
        onMessageInjected: () => {},
        onError: (error) => console.error("[Debate] Error:", error),
      }
    );

    // Get initial state
    const state = debateModeEngine.getDebateState(debateId);

    res.status(201).json({
      debateId,
      topic: data.topic,
      avatarCount: data.avatarIds.length,
      maxTurns: data.maxTurns,
      strategy: state?.strategy || "round_robin",
      status: state?.status || "active",
      message: "Multi-avatar debate started. Connect via WebSocket for streaming updates.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /debates/multi error:", error);
    res.status(500).json({ error: error.message || "Failed to start multi-avatar debate" });
  }
});

// GET /api/avatar-council/debates/:id/state - Get debate state
router.get("/debates/:id/state", async (req: Request, res: Response) => {
  try {
    const state = debateModeEngine.getDebateState(req.params.id);

    if (state) {
      // Active debate
      res.json({
        id: state.id,
        topic: state.topic,
        status: state.status,
        currentTurn: state.currentTurn,
        maxTurns: state.maxTurns,
        strategy: state.strategy,
        memoryScope: state.memoryScope,
        avatars: Array.from(state.avatars.values()).map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          isMuted: state.mutedAvatars.has(a.id),
        })),
        turnHistory: state.turnHistory.map(t => ({
          turnNumber: t.turnNumber,
          avatarId: t.avatarId,
          avatarName: t.avatarName,
          contentPreview: t.content.slice(0, 100) + (t.content.length > 100 ? "..." : ""),
          tokens: t.tokens,
          wasInjected: t.wasInjected,
        })),
        adminActions: state.adminActions,
        createdAt: state.createdAt,
        startedAt: state.startedAt,
      });
    } else {
      // Try database
      const summary = await debateModeEngine.getDebateHistory(req.params.id);
      if (!summary) {
        return res.status(404).json({ error: "Debate not found" });
      }
      res.json({
        ...summary,
        status: summary.status,
        isArchived: true,
      });
    }
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /debates/:id/state error:", error);
    res.status(500).json({ error: "Failed to fetch debate state" });
  }
});

// POST /api/avatar-council/debates/:id/pause - Pause debate (admin)
router.post("/debates/:id/pause", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await debateModeEngine.pauseDebate(req.params.id);
    if (!success) {
      return res.status(400).json({ error: "Cannot pause debate (not active or not found)" });
    }
    res.json({ message: "Debate paused", debateId: req.params.id });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/pause error:", error);
    res.status(500).json({ error: "Failed to pause debate" });
  }
});

// POST /api/avatar-council/debates/:id/resume - Resume debate (admin)
router.post("/debates/:id/resume", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await debateModeEngine.resumeDebate(req.params.id);
    if (!success) {
      return res.status(400).json({ error: "Cannot resume debate (not paused or not found)" });
    }
    res.json({ message: "Debate resumed", debateId: req.params.id });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/resume error:", error);
    res.status(500).json({ error: "Failed to resume debate" });
  }
});

// POST /api/avatar-council/debates/:id/terminate - Terminate debate (admin)
router.post("/debates/:id/terminate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const success = await debateModeEngine.terminateDebate(
      req.params.id,
      reason || "Admin terminated"
    );
    if (!success) {
      return res.status(404).json({ error: "Debate not found" });
    }
    res.json({ message: "Debate terminated", debateId: req.params.id, reason });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/terminate error:", error);
    res.status(500).json({ error: "Failed to terminate debate" });
  }
});

// POST /api/avatar-council/debates/:id/inject - Inject message (admin)
router.post("/debates/:id/inject", requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      content: z.string().min(1),
      asAvatarId: z.string().uuid().optional(),
    });

    const data = schema.parse(req.body);
    const success = await debateModeEngine.injectMessage(
      req.params.id,
      data.content,
      data.asAvatarId
    );

    if (!success) {
      return res.status(400).json({ error: "Cannot inject message (debate terminated or not found)" });
    }

    res.json({
      message: "Message injected",
      debateId: req.params.id,
      asAvatarId: data.asAvatarId || "moderator",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /debates/:id/inject error:", error);
    res.status(500).json({ error: "Failed to inject message" });
  }
});

// POST /api/avatar-council/debates/:id/mute/:avatarId - Mute avatar (admin)
router.post("/debates/:id/mute/:avatarId", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await debateModeEngine.muteAvatar(req.params.id, req.params.avatarId);
    if (!success) {
      return res.status(400).json({ error: "Cannot mute avatar (not in debate or debate not found)" });
    }
    res.json({ message: "Avatar muted", avatarId: req.params.avatarId });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/mute error:", error);
    res.status(500).json({ error: "Failed to mute avatar" });
  }
});

// POST /api/avatar-council/debates/:id/unmute/:avatarId - Unmute avatar (admin)
router.post("/debates/:id/unmute/:avatarId", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await debateModeEngine.unmuteAvatar(req.params.id, req.params.avatarId);
    if (!success) {
      return res.status(400).json({ error: "Cannot unmute avatar" });
    }
    res.json({ message: "Avatar unmuted", avatarId: req.params.avatarId });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/unmute error:", error);
    res.status(500).json({ error: "Failed to unmute avatar" });
  }
});

// POST /api/avatar-council/debates/:id/add-avatar - Add avatar to debate (admin)
router.post("/debates/:id/add-avatar", requireAuth, async (req: Request, res: Response) => {
  try {
    const { avatarId } = req.body;
    if (!avatarId) {
      return res.status(400).json({ error: "avatarId required" });
    }

    const success = await debateModeEngine.addAvatarToDebate(req.params.id, avatarId);
    if (!success) {
      return res.status(400).json({
        error: "Cannot add avatar (already in debate, inactive, or max reached)"
      });
    }

    res.json({ message: "Avatar added to debate", avatarId });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/add-avatar error:", error);
    res.status(500).json({ error: "Failed to add avatar" });
  }
});

// POST /api/avatar-council/debates/:id/remove-avatar - Remove avatar from debate (admin)
router.post("/debates/:id/remove-avatar", requireAuth, async (req: Request, res: Response) => {
  try {
    const { avatarId } = req.body;
    if (!avatarId) {
      return res.status(400).json({ error: "avatarId required" });
    }

    const success = await debateModeEngine.removeAvatarFromDebate(req.params.id, avatarId);
    if (!success) {
      return res.status(400).json({
        error: "Cannot remove avatar (not in debate or would leave < 2 active)"
      });
    }

    res.json({ message: "Avatar removed from debate", avatarId });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /debates/:id/remove-avatar error:", error);
    res.status(500).json({ error: "Failed to remove avatar" });
  }
});

// POST /api/avatar-council/debates/:id/extend - Extend debate turns (admin)
router.post("/debates/:id/extend", requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      additionalTurns: z.number().min(1).max(10),
    });

    const data = schema.parse(req.body);
    const success = await debateModeEngine.extendDebate(req.params.id, data.additionalTurns);

    if (!success) {
      return res.status(400).json({ error: "Cannot extend debate (terminated or not found)" });
    }

    const state = debateModeEngine.getDebateState(req.params.id);
    res.json({
      message: "Debate extended",
      additionalTurns: data.additionalTurns,
      newMaxTurns: state?.maxTurns,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /debates/:id/extend error:", error);
    res.status(500).json({ error: "Failed to extend debate" });
  }
});

// GET /api/avatar-council/debates/active - List active debates
router.get("/debates/active", requireAuth, async (req: Request, res: Response) => {
  try {
    const activeIds = debateModeEngine.getActiveDebates();
    const debates = activeIds.map(id => {
      const state = debateModeEngine.getDebateState(id);
      return state ? {
        id: state.id,
        topic: state.topic,
        status: state.status,
        currentTurn: state.currentTurn,
        maxTurns: state.maxTurns,
        avatarCount: state.avatars.size,
        startedAt: state.startedAt,
      } : null;
    }).filter(Boolean);

    res.json({ count: debates.length, debates });
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /debates/active error:", error);
    res.status(500).json({ error: "Failed to list active debates" });
  }
});

// =============================================================================
// Knowledge Base Routes (Admin)
// =============================================================================

// GET /api/avatar-council/avatars/:id/knowledge - Get avatar's knowledge bases
router.get("/avatars/:id/knowledge", async (req: Request, res: Response) => {
  try {
    const kbs = await avatarRegistry.getKnowledgeBasesByAvatarId(req.params.id);
    res.json(kbs);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /avatars/:id/knowledge error:", error);
    res.status(500).json({ error: "Failed to fetch knowledge bases" });
  }
});

// POST /api/avatar-council/avatars/:id/knowledge - Create knowledge base (admin)
router.post("/avatars/:id/knowledge", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = insertAvatarKnowledgeBaseSchema.parse({
      ...req.body,
      avatarId: req.params.id,
    });
    const kb = await avatarRegistry.createKnowledgeBase(data);
    res.status(201).json(kb);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /avatars/:id/knowledge error:", error);
    res.status(500).json({ error: "Failed to create knowledge base" });
  }
});

// POST /api/avatar-council/knowledge/:kbId/documents - Add document to knowledge base
router.post("/knowledge/:kbId/documents", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = insertKnowledgeDocumentSchema.parse({
      ...req.body,
      knowledgeBaseId: req.params.kbId,
    });

    // Create document
    const doc = await avatarRegistry.createDocument(data);

    // Chunk the content (simple chunking by paragraph)
    const chunks = chunkText(data.content, 500);

    // Create chunks
    for (let i = 0; i < chunks.length; i++) {
      await avatarRegistry.createChunk({
        documentId: doc.id,
        content: chunks[i],
        chunkIndex: i,
      });
    }

    res.status(201).json({
      document: doc,
      chunksCreated: chunks.length,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /knowledge/:kbId/documents error:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
});

// =============================================================================
// Observability Routes (Admin)
// =============================================================================

// GET /api/avatar-council/logs - Get recent logs
router.get("/logs", requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const activity = await observabilityService.getRecentActivity(limit);
    res.json(activity);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// GET /api/avatar-council/logs/session/:id - Get logs for session
router.get("/logs/session/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const logs = await avatarRegistry.getLogsBySessionId(req.params.id);
    const metrics = await observabilityService.getSessionMetrics(req.params.id);
    res.json({ logs, metrics });
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /logs/session/:id error:", error);
    res.status(500).json({ error: "Failed to fetch session logs" });
  }
});

// GET /api/avatar-council/stats - Get avatar usage stats
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await observabilityService.getAvatarUsageStats();
    res.json(stats);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/avatar-council/health - Health check
router.get("/health", async (req: Request, res: Response) => {
  try {
    const health = await observabilityService.healthCheck();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error: any) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// =============================================================================
// Persona Registry Routes
// =============================================================================

// GET /api/avatar-council/personas - Get all personas
router.get("/personas", async (req: Request, res: Response) => {
  try {
    const summaries = personaRegistry.getSummaries();
    res.json(summaries);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas error:", error);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

// GET /api/avatar-council/personas/:id - Get full persona definition
router.get("/personas/:id", async (req: Request, res: Response) => {
  try {
    const persona = personaRegistry.getById(req.params.id);
    if (!persona) {
      return res.status(404).json({ error: "Persona not found" });
    }
    res.json(persona);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/:id error:", error);
    res.status(500).json({ error: "Failed to fetch persona" });
  }
});

// GET /api/avatar-council/personas/slug/:slug - Get persona by slug
router.get("/personas/slug/:slug", async (req: Request, res: Response) => {
  try {
    const persona = personaRegistry.getBySlug(req.params.slug);
    if (!persona) {
      return res.status(404).json({ error: "Persona not found" });
    }
    res.json(persona);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/slug/:slug error:", error);
    res.status(500).json({ error: "Failed to fetch persona" });
  }
});

// GET /api/avatar-council/personas/domain/:domain - Get personas by domain
router.get("/personas/domain/:domain", async (req: Request, res: Response) => {
  try {
    const personas = personaRegistry.findByDomain(req.params.domain);
    res.json(personas);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/domain/:domain error:", error);
    res.status(500).json({ error: "Failed to fetch personas for domain" });
  }
});

// GET /api/avatar-council/personas/:id/debate-partners - Get complementary debate partners
router.get("/personas/:id/debate-partners", async (req: Request, res: Response) => {
  try {
    const partners = personaRegistry.findDebatePartners(req.params.id);
    res.json(partners.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      debate_style: p.debate_style,
    })));
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/:id/debate-partners error:", error);
    res.status(500).json({ error: "Failed to fetch debate partners" });
  }
});

// GET /api/avatar-council/personas/:id/system-prompt - Get compiled system prompt
router.get("/personas/:id/system-prompt", async (req: Request, res: Response) => {
  try {
    const mode = req.query.mode as "single" | "multi" | "debate" | undefined;
    const debateTopic = req.query.topic as string | undefined;
    const turnNumber = req.query.turn ? parseInt(req.query.turn as string) : undefined;

    const systemPrompt = personaRegistry.buildSystemPrompt(req.params.id, {
      mode,
      debateTopic,
      turnNumber,
    });

    res.json({ systemPrompt });
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/:id/system-prompt error:", error);
    res.status(500).json({ error: "Failed to build system prompt" });
  }
});

// PATCH /api/avatar-council/personas/:id - Update persona (admin)
router.patch("/personas/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = personaRegistry.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Persona not found" });
    }
    res.json(updated);
  } catch (error: any) {
    console.error("[AvatarCouncil] PATCH /personas/:id error:", error);
    res.status(500).json({ error: "Failed to update persona" });
  }
});

// POST /api/avatar-council/personas/:id/activate - Activate persona (admin)
router.post("/personas/:id/activate", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = personaRegistry.activate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Persona not found" });
    }
    res.json({ message: "Persona activated" });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /personas/:id/activate error:", error);
    res.status(500).json({ error: "Failed to activate persona" });
  }
});

// POST /api/avatar-council/personas/:id/deactivate - Deactivate persona (admin)
router.post("/personas/:id/deactivate", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = personaRegistry.deactivate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Persona not found" });
    }
    res.json({ message: "Persona deactivated" });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /personas/:id/deactivate error:", error);
    res.status(500).json({ error: "Failed to deactivate persona" });
  }
});

// GET /api/avatar-council/personas/export - Export all personas as JSON
router.get("/personas/export", requireAuth, async (req: Request, res: Response) => {
  try {
    const json = personaRegistry.exportToJSON();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=personas.json");
    res.send(json);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /personas/export error:", error);
    res.status(500).json({ error: "Failed to export personas" });
  }
});

// =============================================================================
// Orchestration Layer Routes
// =============================================================================

// POST /api/avatar-council/route - Route a prompt through orchestration layer
router.post("/route", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      message: z.string().min(1),
      mode: z.enum(["single", "multi", "debate"]).optional(),
      avatarIds: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    // Use orchestration layer for intelligent routing
    const decision = await orchestrationLayer.routePrompt(
      data.message,
      undefined, // No context for single-shot routing
      data.mode,
      data.avatarIds
    );

    res.json({
      mode: decision.mode,
      selectedAvatars: decision.selectedAvatars.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
      })),
      intent: decision.intent,
      scores: decision.scores.slice(0, 5), // Top 5 scores
      reasoning: decision.reasoning,
      adminOverrideApplied: decision.adminOverrideApplied,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /route error:", error);
    res.status(500).json({ error: "Failed to route prompt" });
  }
});

// POST /api/avatar-council/classify-intent - Classify intent only
router.post("/classify-intent", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Use orchestration layer's sophisticated intent classification
    const intent = await orchestrationLayer.classifyIntent(message);

    res.json(intent);
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /classify-intent error:", error);
    res.status(500).json({ error: "Failed to classify intent" });
  }
});

// GET /api/avatar-council/admin-overrides - Get current admin overrides
router.get("/admin-overrides", requireAuth, async (req: Request, res: Response) => {
  try {
    const overrides = orchestrationLayer.getAdminOverrides();
    res.json(overrides);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /admin-overrides error:", error);
    res.status(500).json({ error: "Failed to fetch admin overrides" });
  }
});

// PUT /api/avatar-council/admin-overrides - Set admin overrides
router.put("/admin-overrides", requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      forceAvatarId: z.string().optional(),
      forceMode: z.enum(["single", "multi", "debate"]).optional(),
      disabledAvatarIds: z.array(z.string()).optional(),
      domainRestrictions: z.record(z.string(), z.array(z.string())).optional(),
      priorityAdjustments: z.record(z.string(), z.number().min(-10).max(10)).optional(),
      minConfidenceThreshold: z.number().min(0).max(1).optional(),
      defaultAvatar: z.string().optional(),
    });

    const overrides = schema.parse(req.body);
    orchestrationLayer.setAdminOverrides(overrides);

    res.json({ message: "Admin overrides updated", overrides });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] PUT /admin-overrides error:", error);
    res.status(500).json({ error: "Failed to set admin overrides" });
  }
});

// DELETE /api/avatar-council/admin-overrides - Clear admin overrides
router.delete("/admin-overrides", requireAuth, async (req: Request, res: Response) => {
  try {
    orchestrationLayer.clearAdminOverrides();
    res.json({ message: "Admin overrides cleared" });
  } catch (error: any) {
    console.error("[AvatarCouncil] DELETE /admin-overrides error:", error);
    res.status(500).json({ error: "Failed to clear admin overrides" });
  }
});

// =============================================================================
// Auto-Router Routes
// =============================================================================

// POST /api/avatar-council/auto-route - Auto-route with full details
router.post("/auto-route", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      message: z.string().min(1),
      mode: z.enum(["single", "multi", "debate"]).optional(),
      context: z.object({
        recentDomains: z.array(z.string()).optional(),
        recentAvatarIds: z.array(z.string()).optional(),
        messageCount: z.number().optional(),
        isFollowUp: z.boolean().optional(),
      }).optional(),
    });

    const data = schema.parse(req.body);

    const result = await autoRouter.route(
      data.message,
      data.context as any,
      data.mode
    );

    res.json({
      mode: result.mode,
      selectedAvatars: result.selectedAvatars.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        debateStyle: a.debateStyle,
      })),
      debateAssignments: result.debateAssignments?.map(da => ({
        avatarId: da.avatar.id,
        avatarName: da.avatar.name,
        stance: da.stance,
        speakingOrder: da.speakingOrder,
      })),
      intent: result.intent,
      topScores: result.scores.slice(0, 5).map(s => ({
        avatarId: s.avatarId,
        avatarSlug: s.avatarSlug,
        totalScore: s.totalScore,
        breakdown: s.breakdown,
        eligible: s.eligible,
      })),
      reasoning: result.reasoning,
      determinismKey: result.determinismKey,
      edgeCaseHandled: result.edgeCaseHandled,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: fromZodError(error).toString() });
    }
    console.error("[AvatarCouncil] POST /auto-route error:", error);
    res.status(500).json({ error: "Failed to auto-route" });
  }
});

// POST /api/avatar-council/should-debate - Check if prompt should trigger debate
router.post("/should-debate", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get intent and scores
    const intent = await orchestrationLayer.classifyIntent(message);
    const scores = await orchestrationLayer.scoreAvatars(intent);

    // Check debate trigger
    const debateCheck = autoRouter.shouldTriggerDebate(intent, scores);

    res.json({
      shouldDebate: debateCheck.trigger,
      reason: debateCheck.reason,
      intent: {
        primaryDomain: intent.primaryDomain,
        secondaryDomains: intent.secondaryDomains,
        questionType: intent.questionType,
        confidence: intent.confidence,
      },
      topAvatars: scores.slice(0, 3).map(s => ({
        slug: s.avatarSlug,
        score: s.totalScore,
      })),
    });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /should-debate error:", error);
    res.status(500).json({ error: "Failed to check debate trigger" });
  }
});

// GET /api/avatar-council/auto-router/config - Get auto-router configuration
router.get("/auto-router/config", requireAuth, async (req: Request, res: Response) => {
  try {
    const config = autoRouter.getConfig();
    res.json(config);
  } catch (error: any) {
    console.error("[AvatarCouncil] GET /auto-router/config error:", error);
    res.status(500).json({ error: "Failed to get config" });
  }
});

// =============================================================================
// Seed Route (Dev Only)
// =============================================================================

// POST /api/avatar-council/seed - Seed initial avatars
router.post("/seed", async (req: Request, res: Response) => {
  try {
    await avatarRegistry.seedInitialAvatars();
    const avatars = await avatarRegistry.getAllAvatars();
    res.json({
      message: "Seed complete",
      avatarCount: avatars.length,
      avatars: avatars.map(a => ({ id: a.id, name: a.name, slug: a.slug })),
    });
  } catch (error: any) {
    console.error("[AvatarCouncil] POST /seed error:", error);
    res.status(500).json({ error: "Failed to seed avatars" });
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

function chunkText(text: string, maxTokens: number): string[] {
  // Simple chunking by paragraphs, then by sentences if needed
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    // Rough token estimate (4 chars per token)
    const paraTokens = Math.ceil(para.length / 4);

    if (paraTokens > maxTokens) {
      // Split by sentences
      const sentences = para.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length / 4 + sentence.length / 4 > maxTokens) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
    } else if (currentChunk.length / 4 + para.length / 4 > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export default router;
