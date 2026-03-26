/**
 * Call Monitoring Routes
 * Enables managers/executives to monitor live agent calls via Telnyx Conference API
 * Supports: monitor (silent listen), whisper (agent-only), barge (full join)
 */

import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";
import { storage } from "../storage";
import {
  createConference,
  dialSupervisor,
  joinConference,
  updateSupervisorRole,
  leaveConference,
  generateWebRTCToken,
  createAgentCredential,
} from "../services/telnyxVoiceService";
import type { GCFWebSocketServer } from "../websocket/GCFWebSocketServer";
import { Channels } from "../websocket/GCFWebSocketServer";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// =============================================================================
// GET /active-calls — List all currently active calls (for Activity Monitor)
// =============================================================================
router.get(
  "/active-calls",
  requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const calls = await storage.getActiveCalls();

      // Enrich with agent user info
      const enriched = await Promise.all(
        calls.map(async (call) => {
          const agent = await storage.getUserById(call.agentUserId);
          return {
            ...call,
            agentName: agent
              ? `${agent.firstName || ""} ${agent.lastName || ""}`.trim()
              : "Unknown Agent",
            agentEmail: agent?.email || "",
          };
        }),
      );

      res.json(enriched);
    } catch (error: any) {
      console.error("[Monitor] Failed to fetch active calls:", error.message);
      res.status(500).json({ error: "Failed to fetch active calls" });
    }
  },
);

// =============================================================================
// POST /start — Start monitoring a live call
// =============================================================================
router.post(
  "/start",
  requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const supervisor = req.user!;
      const { activeCallId, role = "monitor" } = req.body;

      if (!activeCallId) {
        return res.status(400).json({ error: "activeCallId is required" });
      }

      if (!["monitor", "whisper", "barge"].includes(role)) {
        return res
          .status(400)
          .json({ error: "role must be monitor, whisper, or barge" });
      }

      // Check if supervisor is already monitoring a call
      const existingSession =
        await storage.getActiveMonitorSession(String(supervisor.id));
      if (existingSession) {
        return res.status(409).json({
          error: "Already monitoring a call. Stop current session first.",
          monitorSessionId: existingSession.id,
        });
      }

      // Look up the active call
      const activeCall = await storage.getActiveCallByControlId(activeCallId).catch(() => null);
      // Try by ID if not found by control ID
      let call = activeCall;
      if (!call) {
        const allCalls = await storage.getActiveCalls();
        call = allCalls.find((c) => c.id === activeCallId) || null;
      }

      if (!call) {
        return res.status(404).json({ error: "Active call not found" });
      }

      if (call.status === "ended") {
        return res.status(400).json({ error: "Call has already ended" });
      }

      // Step 1: Create conference from the agent's call (if not already in one)
      let conferenceId = call.conferenceId;
      if (!conferenceId) {
        const confName = `monitor-${call.id}-${Date.now()}`;
        const conf = await createConference(call.callControlId, confName);
        conferenceId = conf.conferenceId;

        // Update the active call with the conference ID
        await storage.updateActiveCall(call.id, {
          conferenceId,
          conferenceName: confName,
        });
      }

      // Step 2: Get or create a WebRTC credential for the supervisor
      let credentialId: string;
      const supervisorCred = await storage
        .getAgentTelephonyCredential(String(supervisor.id))
        .catch(() => null);

      if (supervisorCred?.telnyxCredentialId) {
        credentialId = supervisorCred.telnyxCredentialId;
      } else {
        // Create a new credential for the supervisor
        const connectionId = process.env.TELNYX_CREDENTIAL_CONNECTION_ID || process.env.TELNYX_CONNECTION_ID!;
        const newCred = await createAgentCredential(connectionId);
        credentialId = newCred.credentialId;

        // Store it for future use
        await storage.createAgentTelephonyCredential({
          agentUserId: String(supervisor.id),
          telnyxCredentialId: newCred.credentialId,
          sipUsername: newCred.sipUsername,
        });
      }

      // Step 3: Generate WebRTC token for the supervisor
      const webrtcToken = await generateWebRTCToken(credentialId);

      // Step 4: Create monitor session record
      const session = await storage.createMonitorSession({
        supervisorUserId: String(supervisor.id),
        activeCallId: call.id,
        agentUserId: call.agentUserId,
        conferenceId,
        role,
        status: "connecting",
      });

      // Step 5: Dial supervisor into the conference
      // The supervisor's browser will receive an incoming call via WebRTC
      // which the useCallMonitor hook will auto-answer
      const sipUsername = supervisorCred?.sipUsername;
      if (sipUsername) {
        const connectionId = process.env.TELNYX_CONNECTION_ID!;
        const webhookUrl = `${process.env.APP_URL || "https://heritagels.org"}/api/calls/webhook`;
        const callerNumber = process.env.TELNYX_DEFAULT_CALLER_ID!;

        const supervisorCall = await dialSupervisor({
          to: `sip:${sipUsername}@sip.telnyx.com`,
          from: callerNumber,
          connectionId,
          webhookUrl,
          conferenceId,
          supervisorRole: role as "monitor" | "whisper" | "barge",
          agentCallControlId: call.callControlId,
          clientState: {
            supervisorUserId: String(supervisor.id),
            monitorSessionId: session.id,
          },
        });

        // Update session with supervisor's call control ID
        await storage.updateMonitorSession(session.id, {
          supervisorCallControlId: supervisorCall.callControlId,
        });
      }

      // Broadcast monitoring event on CALLS channel
      const wsServer: GCFWebSocketServer | null = req.app.get("wsServer");
      if (wsServer) {
        wsServer.broadcast(Channels.CALLS, {
          type: "monitor_started",
          supervisorId: String(supervisor.id),
          agentUserId: call.agentUserId,
          monitorSessionId: session.id,
        });
      }

      res.json({
        monitorSessionId: session.id,
        conferenceId,
        webrtcToken,
        role,
        agentUserId: call.agentUserId,
        agentCallControlId: call.callControlId,
      });
    } catch (error: any) {
      console.error("[Monitor] Failed to start monitoring:", error.message);
      res.status(500).json({ error: "Failed to start call monitoring" });
    }
  },
);

// =============================================================================
// POST /stop — Stop monitoring a call
// =============================================================================
router.post(
  "/stop",
  requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER),
  async (req: Request, res: Response) => {
  try {
    const supervisor = req.user!;
    const { monitorSessionId } = req.body;

    if (!monitorSessionId) {
      return res.status(400).json({ error: "monitorSessionId is required" });
    }

    // Find the monitor session
    const sessions = await storage.getActiveMonitorSession(String(supervisor.id));
    if (!sessions || sessions.id !== monitorSessionId) {
      return res.status(404).json({ error: "Monitor session not found or already ended" });
    }

    // Remove supervisor from conference
    if (sessions.conferenceId && sessions.supervisorCallControlId) {
      try {
        await leaveConference(
          sessions.conferenceId,
          sessions.supervisorCallControlId,
        );
      } catch (err: any) {
        console.warn("[Monitor] Leave conference failed (call may have ended):", err.message);
      }
    }

    // End the session
    await storage.endMonitorSession(monitorSessionId);

    // Broadcast on CALLS channel
    const wsServer: GCFWebSocketServer | null = req.app.get("wsServer");
    if (wsServer) {
      wsServer.broadcast(Channels.CALLS, {
        type: "monitor_ended",
        supervisorId: String(supervisor.id),
        agentUserId: sessions.agentUserId,
        monitorSessionId,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Monitor] Failed to stop monitoring:", error.message);
    res.status(500).json({ error: "Failed to stop call monitoring" });
  }
  },
);

// =============================================================================
// POST /switch-role — Switch between monitor/whisper/barge mid-session
// =============================================================================
router.post(
  "/switch-role",
  requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const supervisor = req.user!;
      const { monitorSessionId, newRole } = req.body;

      if (!monitorSessionId || !newRole) {
        return res
          .status(400)
          .json({ error: "monitorSessionId and newRole are required" });
      }

      if (!["monitor", "whisper", "barge"].includes(newRole)) {
        return res
          .status(400)
          .json({ error: "newRole must be monitor, whisper, or barge" });
      }

      const session = await storage.getActiveMonitorSession(String(supervisor.id));
      if (!session || session.id !== monitorSessionId) {
        return res
          .status(404)
          .json({ error: "Monitor session not found or already ended" });
      }

      if (!session.conferenceId || !session.supervisorCallControlId) {
        return res
          .status(400)
          .json({ error: "Session not fully connected yet" });
      }

      // For whisper mode, we need the agent's call control ID so supervisor audio goes only to agent
      let whisperIds: string[] | undefined;
      if (newRole === "whisper") {
        const activeCall = await storage.getActiveCalls().then(
          (calls) => calls.find((c) => c.id === session.activeCallId),
        );
        if (activeCall) {
          whisperIds = [activeCall.callControlId];
        }
      }

      await updateSupervisorRole(
        session.conferenceId,
        session.supervisorCallControlId,
        newRole as "monitor" | "whisper" | "barge",
        whisperIds,
      );

      await storage.updateMonitorSession(session.id, { role: newRole });

      res.json({ success: true, role: newRole });
    } catch (error: any) {
      console.error("[Monitor] Failed to switch role:", error.message);
      res.status(500).json({ error: "Failed to switch monitoring role" });
    }
  },
);

export default router;
