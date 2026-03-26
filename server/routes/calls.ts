import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import {
  isVoiceAvailable,
  generateWebRTCToken,
  createAgentCredential,
  validateWebhookSignature,
  dialOutbound,
  transferToAgent,
  playbackStart,
  recordStart,
  speak,
  hangup,
  searchAvailableNumbers,
  purchaseNumber,
  extractAreaCode,
  joinConference,
} from "../services/telnyxVoiceService";
import type { GCFWebSocketServer } from "../websocket/GCFWebSocketServer";
import { Channels } from "../websocket/GCFWebSocketServer";
import { eventBus, EventType } from "../agents/core/event-bus";
import * as s3Service from "../services/s3Service";
import { hasPermission, Permission, type Role } from "../types/permissions";

const router = Router();

// RBAC helper: check if user can access a specific recording
async function checkRecordingAccess(
  user: { id: string; role: string },
  record: { agentUserId: string | null }
): Promise<boolean> {
  if (record.agentUserId === user.id) return true;
  if (hasPermission(user.role as Role, Permission.CALLS_VIEW_ALL)) return true;
  if (hasPermission(user.role as Role, Permission.CALLS_VIEW_TEAM)) {
    if (!record.agentUserId) return false;
    const teamIds = await storage.getTeamAgentIds(user.id, 'full');
    return teamIds.includes(record.agentUserId);
  }
  return false;
}

// RBAC helper: get agent IDs the user can view recordings for
async function getViewableAgentIds(user: { id: string; role: string }): Promise<string[]> {
  if (hasPermission(user.role as Role, Permission.CALLS_VIEW_ALL)) {
    return []; // empty = all agents
  }
  if (hasPermission(user.role as Role, Permission.CALLS_VIEW_TEAM)) {
    const teamIds = await storage.getTeamAgentIds(user.id, 'full');
    return [user.id, ...teamIds];
  }
  return [user.id]; // own only
}

// =============================================================================
// CALL TRANSCRIPT ANALYSIS (keyword-based scoring)
// =============================================================================

function analyzeTranscript(text: string): {
  overallScore: number; rapportScore: number; discoveryScore: number;
  presentationScore: number; closingScore: number; sentiment: string;
  summary: string; keyMoments: Array<{ timestamp: number; type: string; description: string }>;
  suggestions: string[];
} {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;

  // Rapport — greetings, empathy, personalization
  const rapportPhrases = ['how are you', 'nice to meet', 'thanks for', 'thank you', 'appreciate',
    'understand', 'i hear you', 'that makes sense', 'great question', 'absolutely'];
  const rapportHits = rapportPhrases.filter(p => lower.includes(p)).length;
  const rapportScore = Math.min(100, Math.round((rapportHits / 4) * 100));

  // Discovery — open-ended questions
  const discoveryPhrases = ['what', 'how', 'tell me about', 'can you describe', 'what are your',
    'what kind of', 'how much', 'how many', 'when did', 'why do you', 'what do you'];
  const questionMarks = (text.match(/\?/g) || []).length;
  const discoveryHits = discoveryPhrases.filter(p => lower.includes(p)).length;
  const discoveryScore = Math.min(100, Math.round(((discoveryHits + questionMarks) / 6) * 100));

  // Presentation — benefits, coverage, value
  const presentationPhrases = ['coverage', 'benefit', 'protect', 'policy', 'premium', 'plan',
    'affordable', 'save', 'peace of mind', 'family', 'investment', 'guarantee', 'option'];
  const presentationHits = presentationPhrases.filter(p => lower.includes(p)).length;
  const presentationScore = Math.min(100, Math.round((presentationHits / 5) * 100));

  // Closing — next steps, commitment
  const closingPhrases = ['next step', 'move forward', 'get started', 'sign up', 'enroll',
    'application', 'schedule', 'set up', 'ready to', 'go ahead', 'let me help'];
  const closingHits = closingPhrases.filter(p => lower.includes(p)).length;
  const closingScore = Math.min(100, Math.round((closingHits / 3) * 100));

  // Overall — weighted average
  const overallScore = Math.round(
    rapportScore * 0.20 + discoveryScore * 0.25 +
    presentationScore * 0.30 + closingScore * 0.25
  );

  // Sentiment
  const posWords = ['great', 'excellent', 'wonderful', 'perfect', 'happy', 'love', 'fantastic', 'awesome'];
  const negWords = ['problem', 'issue', 'complaint', 'frustrated', 'angry', 'terrible', 'worst', 'cancel'];
  const posCount = posWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;
  const sentiment = posCount > negCount + 1 ? 'positive' : negCount > posCount + 1 ? 'negative' : 'neutral';

  // Summary
  const topics: string[] = [];
  if (lower.includes('life insurance') || lower.includes('life policy')) topics.push('life insurance');
  if (lower.includes('health') || lower.includes('medical')) topics.push('health coverage');
  if (lower.includes('final expense') || lower.includes('burial')) topics.push('final expense');
  if (lower.includes('annuity') || lower.includes('retirement')) topics.push('retirement planning');
  if (lower.includes('medicare') || lower.includes('supplement')) topics.push('Medicare');
  const topicStr = topics.length > 0 ? ` discussing ${topics.join(', ')}` : '';
  const summary = `${words}-word conversation${topicStr}. ${
    overallScore >= 70 ? 'Strong call with good engagement.' :
    overallScore >= 40 ? 'Average call with room for improvement.' :
    'Call needs significant improvement in key areas.'
  }`;

  // Key moments — detect specific patterns
  const keyMoments: Array<{ timestamp: number; type: string; description: string }> = [];
  if (lower.includes('objection') || lower.includes('too expensive') || lower.includes('not interested') || lower.includes('think about it'))
    keyMoments.push({ timestamp: 0, type: 'objection', description: 'Prospect raised objection' });
  if (lower.includes('compliance') || lower.includes('guarantee') || lower.includes('no risk'))
    keyMoments.push({ timestamp: 0, type: 'compliance', description: 'Potential compliance concern detected' });
  if (closingHits > 0)
    keyMoments.push({ timestamp: 0, type: 'closing', description: 'Closing attempt detected' });

  // Suggestions
  const suggestions: string[] = [];
  if (rapportScore < 50) suggestions.push('Build more rapport early — use the prospect\'s name, show empathy, and ask about their day.');
  if (discoveryScore < 50) suggestions.push('Ask more open-ended discovery questions to understand the prospect\'s needs before presenting solutions.');
  if (presentationScore < 50) suggestions.push('Strengthen your presentation by connecting product benefits to the prospect\'s specific situation.');
  if (closingScore < 50) suggestions.push('Work on closing technique — guide the prospect toward next steps with clear calls to action.');
  if (suggestions.length === 0) suggestions.push('Great call overall! Keep up the strong performance.');

  return { overallScore, rapportScore, discoveryScore, presentationScore, closingScore,
    sentiment, summary, keyMoments, suggestions };
}

// =============================================================================
// TELNYX WEBHOOK VALIDATION MIDDLEWARE (Ed25519)
// =============================================================================

async function validateTelnyxWebhook(req: Request, res: Response, next: Function) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).send("Telnyx not configured");
  }

  const signature = req.headers["telnyx-signature-ed25519"] as string;
  const timestamp = req.headers["telnyx-timestamp"] as string;

  if (!signature || !timestamp) {
    return res.status(403).send("Missing Telnyx signature headers");
  }

  try {
    // Use raw body for signature verification
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    await validateWebhookSignature(rawBody, signature, timestamp);
    next();
  } catch (error: any) {
    console.warn("[Calls] Invalid Telnyx webhook signature:", error.message);
    return res.status(403).send("Invalid signature");
  }
}

// =============================================================================
// Helper: Decode client_state from Telnyx webhook
// =============================================================================

function decodeClientState(encodedState: string | undefined): Record<string, any> | null {
  if (!encodedState) return null;
  try {
    return JSON.parse(Buffer.from(encodedState, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

// =============================================================================
// GET /token — Generate Telnyx WebRTC JWT for browser SDK
// =============================================================================

router.get("/token", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isVoiceAvailable()) {
      return res.status(503).json({ error: "Voice service not configured" });
    }

    const user = req.user!;
    // Credential connection is for WebRTC auth; Call Control connection is for PSTN dialing
    const credentialConnectionId = process.env.TELNYX_CREDENTIAL_CONNECTION_ID || process.env.TELNYX_CONNECTION_ID!;

    // Check if agent already has a credential, create one if not
    let credential = await storage.getAgentTelephonyCredential(user.id);

    if (!credential) {
      const { credentialId, sipUsername } = await createAgentCredential(credentialConnectionId);
      credential = await storage.createAgentTelephonyCredential({
        agentUserId: user.id,
        telnyxCredentialId: credentialId,
        sipUsername,
      });
      console.log(`[Calls] Created telephony credential for agent ${user.id}: ${sipUsername}`);
    }

    // Generate a fresh JWT (24h TTL)
    const token = await generateWebRTCToken(credential.telnyxCredentialId);

    res.json({
      token,
      sipUsername: credential.sipUsername,
      callerId: process.env.TELNYX_DEFAULT_CALLER_ID || '',
      expiresIn: 86400, // 24 hours
    });
  } catch (error: any) {
    console.error("[Calls] Token generation failed:", error.message);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// =============================================================================
// POST /dial — Server-initiated outbound call (Call Control API → bridge to WebRTC)
// =============================================================================

router.post("/dial", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isVoiceAvailable()) {
      return res.status(503).json({ error: "Voice service not configured" });
    }

    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: "Missing 'to' phone number" });
    }

    const user = req.user!;
    const connectionId = process.env.TELNYX_CONNECTION_ID!;
    const callerId = process.env.TELNYX_DEFAULT_CALLER_ID || '';
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 4500}`;
    const webhookUrl = `${appUrl}/api/calls/webhook`;

    // Get agent's SIP credential for bridging
    const credential = await storage.getAgentTelephonyCredential(user.id);
    const agentSipAddress = credential?.sipUsername
      ? `sip:${credential.sipUsername}@sip.telnyx.com`
      : '';

    // Create call record in DB
    const callRecord = await storage.createCallRecording({
      agentUserId: user.id,
      direction: 'outbound',
      phoneNumber: to,
      status: 'initiated',
      calledAt: new Date(),
    });

    // Dial via Call Control API (uses the Call Control App connection with the phone number)
    const { callControlId } = await dialOutbound({
      to,
      from: callerId,
      connectionId,
      webhookUrl,
      amd: false, // Manual calls don't need AMD
      clientState: {
        source: 'manual',
        agentUserId: user.id,
        agentSipAddress,
        callRecordingId: callRecord.id,
      },
    });

    // Update DB with call control ID
    await storage.updateCallRecording(callRecord.id, {
      providerCallSid: callControlId,
    });

    // Transfer to agent's WebRTC so they hear the ringing and connect when answered
    if (agentSipAddress) {
      try {
        await transferToAgent(callControlId, agentSipAddress, callerId);
        console.log(`[Calls] Manual dial: ${callControlId} → ${to} → bridging to ${agentSipAddress}`);
      } catch (transferErr: any) {
        console.warn(`[Calls] Transfer to WebRTC failed (will rely on webhook): ${transferErr.message}`);
      }
    }

    res.json({
      callControlId,
      callRecordingId: callRecord.id,
      status: 'initiated',
    });
  } catch (error: any) {
    console.error("[Calls] Dial failed:", error.message);
    res.status(500).json({ error: "Failed to initiate call" });
  }
});

// =============================================================================
// POST /webhook — Single Telnyx webhook for ALL call events
// =============================================================================

router.post("/webhook", validateTelnyxWebhook, async (req: Request, res: Response) => {
  try {
    const event = req.body?.data;
    if (!event) {
      return res.sendStatus(200);
    }

    const eventType = event.event_type;
    const payload = event.payload || {};
    const callControlId = payload.call_control_id;
    const clientState = decodeClientState(payload.client_state);

    console.log(`[Calls] Webhook: ${eventType} callControlId=${callControlId}`);

    switch (eventType) {
      // ----- Call Initiated -----
      case "call.initiated": {
        const direction = payload.direction === "incoming" ? "inbound" : "outbound";
        const phoneNumber = direction === "outbound" ? payload.to : payload.from;
        const agentUserId = clientState?.agentUserId;

        if (agentUserId) {
          try {
            await storage.createCallRecording({
              agentUserId,
              direction,
              phoneNumber,
              status: "initiated",
              providerCallSid: callControlId,
              leadId: clientState?.leadId || null,
              calledAt: new Date(),
            });
          } catch (dbError: any) {
            console.error("[Calls] Failed to create call record:", dbError.message);
          }

          // Track as active call (skip monitor supervisor calls)
          if (clientState?.source !== 'monitor') {
            try {
              await storage.createActiveCall({
                agentUserId,
                callControlId,
                callLegId: payload.call_leg_id || null,
                direction,
                callerNumber: payload.from || null,
                destinationNumber: payload.to || null,
                contactName: clientState?.contactName || null,
                status: "initiated",
              });

              // Broadcast to CALLS channel
              const wsServer: GCFWebSocketServer | null = req.app.get('wsServer');
              if (wsServer) {
                wsServer.broadcast(Channels.CALLS, {
                  type: 'call_initiated',
                  agentUserId,
                  callControlId,
                  direction,
                  contactName: clientState?.contactName || null,
                  destinationNumber: payload.to,
                });
              }
            } catch (dbError: any) {
              console.error("[Calls] Failed to create active call:", dbError.message);
            }
          }
        }
        break;
      }

      // ----- Call Answered (human picked up or agent answered) -----
      case "call.answered": {
        if (callControlId) {
          const record = await storage.getCallRecordingByProviderCallSid(callControlId);
          if (record) {
            await storage.updateCallRecording(record.id, { status: "answered" });
          }

          // Update active call status
          if (clientState?.source !== 'monitor') {
            const activeCall = await storage.getActiveCallByControlId(callControlId);
            if (activeCall) {
              await storage.updateActiveCall(activeCall.id, {
                status: "active",
                answeredAt: new Date(),
              });

              // Broadcast to CALLS channel
              const wsServer: GCFWebSocketServer | null = req.app.get('wsServer');
              if (wsServer) {
                wsServer.broadcast(Channels.CALLS, {
                  type: 'call_answered',
                  agentUserId: activeCall.agentUserId,
                  callControlId,
                  contactName: activeCall.contactName,
                  destinationNumber: activeCall.destinationNumber,
                });
              }
            }
          }

          // Monitor supervisor call answered — join to conference
          if (clientState?.source === 'monitor' && clientState?.conferenceId) {
            try {
              await joinConference(
                clientState.conferenceId,
                callControlId,
                clientState.supervisorRole || 'monitor',
                clientState.supervisorRole === 'whisper' && clientState.agentCallControlId
                  ? [clientState.agentCallControlId]
                  : undefined,
              );
              console.log(`[Calls] Supervisor joined conference ${clientState.conferenceId} as ${clientState.supervisorRole}`);

              // Update monitor session to active
              if (clientState.monitorSessionId) {
                await storage.updateMonitorSession(clientState.monitorSessionId, {
                  status: "active",
                });
              }
            } catch (err: any) {
              console.error("[Calls] Supervisor conference join failed:", err.message);
            }
          }
        }

        // Speak consent and start recording for all non-AMD calls (WebRTC + manual)
        if (callControlId && (!clientState || clientState?.source === "manual")) {
          try {
            await speak(
              callControlId,
              "This call may be recorded for quality assurance and training purposes.",
            );
          } catch (err: any) {
            console.error("[Calls] Speak consent failed:", err.message);
            // Start recording anyway
            await recordStart(callControlId);
          }
        }
        break;
      }

      // ----- AMD Premium Detection Result -----
      case "call.machine.premium.detection.ended": {
        const result = payload.result; // human_residence, human_business, machine, silence, fax_detected, not_sure
        console.log(`[Calls] AMD result: ${result} for ${callControlId}`);

        if (result === "human_residence" || result === "human_business" || result === "not_sure") {
          // Human answered — start recording and transfer to agent's WebRTC
          try {
            await recordStart(callControlId);

            if (clientState?.agentSipAddress) {
              await transferToAgent(
                callControlId,
                clientState.agentSipAddress,
                payload.from || process.env.TELNYX_DEFAULT_CALLER_ID!,
              );
            }
          } catch (err: any) {
            console.error("[Calls] AMD human handling failed:", err.message);
          }

          // Emit event for dialer agent
          if (clientState?.agentUserId) {
            const record = await storage.getCallRecordingByProviderCallSid(callControlId);
            if (record) {
              await storage.updateCallRecording(record.id, { status: "connected" });
            }
            eventBus.emit({
              type: EventType.CALL_CONNECTED,
              source: "voice-webhook",
              payload: {
                callControlId,
                leadId: clientState?.leadId,
                agentUserId: clientState.agentUserId,
                phoneNumber: payload.to,
                amdResult: result,
              },
              metadata: { tier: 2, priority: "high" },
            } as any);
          }
        } else if (result === "machine") {
          // Machine — wait for beep detection (greeting_ended event will fire)
          const record = await storage.getCallRecordingByProviderCallSid(callControlId);
          if (record) {
            await storage.updateCallRecording(record.id, { status: "voicemail" });
          }
        } else {
          // silence, fax_detected — hang up
          try {
            await hangup(callControlId);
          } catch (err: any) {
            console.error("[Calls] Hangup failed:", err.message);
          }
          if (clientState?.agentUserId) {
            eventBus.emit({
              type: EventType.CALL_FAILED,
              source: "voice-webhook",
              payload: {
                callControlId,
                leadId: clientState?.leadId,
                agentUserId: clientState.agentUserId,
                reason: result,
              },
              metadata: { tier: 2, priority: "normal" },
            } as any);
          }
        }
        break;
      }

      // ----- Machine Greeting Ended (beep detection for voicemail drop) -----
      case "call.machine.premium.greeting.ended": {
        const result = payload.result; // beep_detected, no_beep
        console.log(`[Calls] Greeting ended: ${result} for ${callControlId}`);

        if (result === "beep_detected") {
          // Drop voicemail
          const voicemailUrl = process.env.TELNYX_VOICEMAIL_AUDIO_URL;
          if (voicemailUrl) {
            try {
              await playbackStart(callControlId, voicemailUrl);
            } catch (err: any) {
              console.error("[Calls] Voicemail drop failed:", err.message);
              await hangup(callControlId);
            }
          } else {
            await hangup(callControlId);
          }
        } else {
          // No beep — just hang up
          try {
            await hangup(callControlId);
          } catch (err: any) {
            console.error("[Calls] Hangup failed:", err.message);
          }
        }
        break;
      }

      // ----- Playback Ended (voicemail drop complete) -----
      case "call.playback.ended": {
        // Voicemail has been dropped — hang up
        try {
          await hangup(callControlId);
        } catch (err: any) {
          console.error("[Calls] Post-playback hangup failed:", err.message);
        }
        break;
      }

      // ----- Speak Ended (consent announcement done) -----
      case "call.speak.ended": {
        // Consent announcement finished — now start recording
        try {
          await recordStart(callControlId);
        } catch (err: any) {
          console.error("[Calls] Post-speak record start failed:", err.message);
        }
        break;
      }

      // ----- Call Hangup -----
      case "call.hangup": {
        if (callControlId) {
          const record = await storage.getCallRecordingByProviderCallSid(callControlId);
          if (record) {
            const updates: Record<string, any> = {};
            if (payload.hangup_cause) updates.status = payload.hangup_cause;
            if (payload.duration_secs) updates.duration = Math.round(payload.duration_secs);

            // Only update status if not already set to something meaningful
            if (record.status === "initiated" || record.status === "answered") {
              updates.status = payload.duration_secs > 0 ? "completed" : "no_answer";
            }

            await storage.updateCallRecording(record.id, updates);
          }

          // Update active call as ended (agent calls)
          if (clientState?.source !== 'monitor') {
            const activeCall = await storage.getActiveCallByControlId(callControlId);
            if (activeCall) {
              await storage.updateActiveCall(activeCall.id, {
                status: "ended",
                endedAt: new Date(),
              });

              // End any monitor sessions tied to this call
              const monitorSessions = await storage.getMonitorSessionsByCall(activeCall.id);
              for (const ms of monitorSessions) {
                await storage.endMonitorSession(ms.id);
              }

              // Broadcast call ended
              const wsServer: GCFWebSocketServer | null = req.app.get('wsServer');
              if (wsServer) {
                wsServer.broadcast(Channels.CALLS, {
                  type: 'call_ended',
                  agentUserId: activeCall.agentUserId,
                  callControlId,
                  duration: payload.duration_secs || 0,
                });
              }
            }
          }

          // Monitor supervisor call hung up — end the monitor session
          if (clientState?.source === 'monitor' && clientState?.monitorSessionId) {
            try {
              await storage.endMonitorSession(clientState.monitorSessionId);
              console.log(`[Calls] Monitor session ${clientState.monitorSessionId} ended (supervisor hangup)`);
            } catch (err: any) {
              console.error("[Calls] Failed to end monitor session:", err.message);
            }
          }

          // Emit for dialer agent if call failed
          if (clientState?.agentUserId && (!payload.duration_secs || payload.duration_secs === 0)) {
            eventBus.emit({
              type: EventType.CALL_FAILED,
              source: "voice-webhook",
              payload: {
                callControlId,
                leadId: clientState?.leadId,
                agentUserId: clientState.agentUserId,
                reason: payload.hangup_cause || "no_answer",
              },
              metadata: { tier: 2, priority: "normal" },
            } as any);
          }
        }
        break;
      }

      // ----- Recording Saved -----
      case "call.recording.saved": {
        if (callControlId) {
          const record = await storage.getCallRecordingByProviderCallSid(callControlId);
          if (record) {
            const mp3Url = payload.public_recording_urls?.mp3 || payload.recording_urls?.mp3 || null;
            const updateData: any = {
              providerRecordingSid: payload.recording_id || null,
              recordingUrl: mp3Url,
            };

            // Download recording and upload to S3 (Telnyx URLs expire in 10 minutes)
            if (mp3Url) {
              try {
                const audioResponse = await fetch(mp3Url);
                if (audioResponse.ok) {
                  const arrayBuffer = await audioResponse.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  const filename = `recording-${record.id}.mp3`;
                  const userId = record.agentUserId || 'system';
                  const s3Result = await s3Service.uploadFile(userId, filename, buffer, {
                    contentType: 'audio/mpeg',
                  }, 'call-recordings');
                  if (s3Result.success && s3Result.key) {
                    updateData.s3Key = s3Result.key;
                    updateData.recordingUrl = `s3://${s3Result.key}`;
                    console.log(`[Calls] Recording uploaded to S3: ${s3Result.key}`);
                  } else {
                    console.warn(`[Calls] S3 upload failed for call ${record.id}:`, s3Result.error);
                  }
                } else {
                  console.warn(`[Calls] Failed to download recording from Telnyx: ${audioResponse.status}`);
                }
              } catch (s3Err: any) {
                console.error(`[Calls] S3 upload error for call ${record.id}:`, s3Err.message);
              }
            }

            await storage.updateCallRecording(record.id, updateData);
            console.log(`[Calls] Recording saved for call ${record.id}`);
          } else {
            console.warn(`[Calls] Recording saved but no DB record found for callControlId: ${callControlId}`);
          }
        }
        break;
      }

      // ----- Transcription Saved -----
      case "call.recording.transcription.saved": {
        const transcriptionText = payload.transcription_text;
        const ccId = callControlId || payload.call_control_id;
        if (ccId && transcriptionText) {
          const record = await storage.getCallRecordingByProviderCallSid(ccId);
          if (record) {
            // Store transcription
            await storage.updateCallRecording(record.id, { transcription: transcriptionText });

            // Run analysis
            try {
              const analysis = analyzeTranscript(transcriptionText);
              await storage.createCallAnalysis({
                callRecordingId: record.id,
                summary: analysis.summary,
                overallScore: analysis.overallScore,
                rapportScore: analysis.rapportScore,
                discoveryScore: analysis.discoveryScore,
                presentationScore: analysis.presentationScore,
                closingScore: analysis.closingScore,
                keyMoments: analysis.keyMoments,
                suggestions: analysis.suggestions,
              });
              await storage.updateCallRecording(record.id, {
                isAnalyzed: true,
                sentiment: analysis.sentiment,
              });
              console.log(`[Calls] Transcription + analysis saved for call ${record.id} (score: ${analysis.overallScore})`);
            } catch (analysisErr: any) {
              console.error(`[Calls] Analysis error for call ${record.id}:`, analysisErr.message);
            }
          } else {
            console.warn(`[Calls] Transcription saved but no DB record for callControlId: ${ccId}`);
          }
        }
        break;
      }

      default:
        console.log(`[Calls] Unhandled event: ${eventType}`);
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error("[Calls] Webhook error:", error.message);
    res.sendStatus(200); // Always 200 for webhooks
  }
});

// =============================================================================
// GET /history — Paginated call history for authenticated agent
// =============================================================================

router.get("/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const records = await storage.getCallRecordingsByAgent(user.id, limit, offset);
    res.json(records);
  } catch (error: any) {
    console.error("[Calls] History fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch call history" });
  }
});

// =============================================================================
// GET /stats — Agent call stats (today, week, month)
// =============================================================================

router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const stats = await storage.getAgentCallStats(user.id);
    res.json(stats);
  } catch (error: any) {
    console.error("[Calls] Stats fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch call stats" });
  }
});

// =============================================================================
// POST /count-batch — Get call counts for multiple phone numbers
// =============================================================================

router.post("/count-batch", requireAuth, async (req: Request, res: Response) => {
  try {
    const { phoneNumbers } = req.body;
    if (!Array.isArray(phoneNumbers)) {
      return res.status(400).json({ error: "phoneNumbers array is required" });
    }
    const counts = await storage.batchGetCallCounts(phoneNumbers);
    res.json(counts);
  } catch (error: any) {
    console.error("[Calls] Count batch error:", error.message);
    res.status(500).json({ error: "Failed to get call counts" });
  }
});

// =============================================================================
// POST /register — Register a WebRTC call with its Telnyx call_control_id
// =============================================================================

router.post("/register", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { phoneNumber, direction, callControlId, leadId } = req.body;

    if (!callControlId) {
      return res.status(400).json({ error: "callControlId is required" });
    }

    // Check if record already exists for this callControlId (from webhook)
    const existing = await storage.getCallRecordingByProviderCallSid(callControlId);
    if (existing) {
      return res.json(existing);
    }

    // Create new record with providerCallSid set so webhooks can match it
    const record = await storage.createCallRecording({
      agentUserId: user.id,
      direction: direction || "outbound",
      phoneNumber: phoneNumber || "",
      status: "initiated",
      providerCallSid: callControlId,
      leadId: leadId || null,
      calledAt: new Date(),
    });

    // Also create active call record for monitoring
    const existingActive = await storage.getActiveCallByControlId(callControlId);
    if (!existingActive) {
      try {
        await storage.createActiveCall({
          agentUserId: user.id,
          callControlId,
          direction: direction || "outbound",
          callerNumber: null,
          destinationNumber: phoneNumber || null,
          contactName: req.body.contactName || null,
          status: "active",
          answeredAt: new Date(),
        });
      } catch (err: any) {
        console.error("[Calls] Failed to create active call from register:", err.message);
      }
    }

    console.log(`[Calls] Registered WebRTC call ${record.id} with callControlId=${callControlId}`);
    res.json(record);
  } catch (error: any) {
    console.error("[Calls] Register error:", error.message);
    res.status(500).json({ error: "Failed to register call" });
  }
});

// =============================================================================
// POST /log — Manual call log entry (disposition + notes)
// =============================================================================

router.post("/log", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { callRecordingId, disposition, notes, phoneNumber, duration, direction, leadId } = req.body;

    if (callRecordingId) {
      const record = await storage.getCallRecordingById(callRecordingId);
      if (!record) {
        return res.status(404).json({ error: "Call record not found" });
      }
      if (record.agentUserId !== user.id) {
        return res.status(403).json({ error: "Not your call record" });
      }

      const updates: Record<string, any> = {};
      if (disposition) updates.disposition = disposition;
      if (notes) updates.notes = notes;
      if (duration !== undefined) updates.duration = duration;
      if (disposition) updates.status = disposition;

      const updated = await storage.updateCallRecording(callRecordingId, updates);
      return res.json(updated);
    }

    const record = await storage.createCallRecording({
      agentUserId: user.id,
      direction: direction || "outbound",
      phoneNumber: phoneNumber || "",
      status: disposition || "completed",
      disposition,
      notes,
      duration: duration || 0,
      leadId: leadId || null,
      calledAt: new Date(),
    });

    res.json(record);
  } catch (error: any) {
    console.error("[Calls] Log error:", error.message);
    res.status(500).json({ error: "Failed to log call" });
  }
});

// =============================================================================
// GET /recordings — Filtered & paginated call recordings with lead info
// =============================================================================

router.get("/recordings", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const agentIds = await getViewableAgentIds(user);
    const filters = {
      search: req.query.search as string,
      direction: req.query.direction as string,
      status: req.query.status as string,
      dateRange: req.query.dateRange as string,
      hasRecording: req.query.hasRecording === 'true',
      sortBy: req.query.sortBy as string,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await storage.getFilteredCallRecordingsMultiAgent(agentIds, filters);
    res.json(result);
  } catch (error: any) {
    console.error("[Calls] Filtered recordings fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

// =============================================================================
// GET /recordings/stats — Enhanced recording stats for recordings tab
// =============================================================================

router.get("/recordings/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const agentIds = await getViewableAgentIds(user);
    const stats = await storage.getRecordingStatsMultiAgent(agentIds);
    res.json(stats);
  } catch (error: any) {
    console.error("[Calls] Recording stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch recording stats" });
  }
});

// =============================================================================
// PATCH /:id/notes — Update notes on a call recording
// =============================================================================

router.patch("/:id/notes", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const record = await storage.getCallRecordingById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Call record not found" });
    }
    const canAccess = await checkRecordingAccess(user, record);
    if (!canAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    const updated = await storage.updateCallRecording(req.params.id, { notes: req.body.notes });
    res.json(updated);
  } catch (error: any) {
    console.error("[Calls] Notes update error:", error.message);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

// =============================================================================
// GET /:id — Single call details
// =============================================================================

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const record = await storage.getCallRecordingById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Call record not found" });
    }

    const user = req.user!;
    const canAccess = await checkRecordingAccess(user, record);
    if (!canAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Include analysis if available
    let analysis = null;
    if (record.isAnalyzed) {
      analysis = await storage.getCallAnalysisByRecordingId(record.id);
    }

    res.json({ ...record, analysis });
  } catch (error: any) {
    console.error("[Calls] Fetch call error:", error.message);
    res.status(500).json({ error: "Failed to fetch call" });
  }
});

// =============================================================================
// GET /:id/recording — Proxy recording audio (Telnyx URLs are signed)
// =============================================================================

router.get("/:id/recording", requireAuth, async (req: Request, res: Response) => {
  try {
    const record = await storage.getCallRecordingById(req.params.id);
    if (!record || (!record.recordingUrl && !record.s3Key)) {
      return res.status(404).json({ error: "Recording not found" });
    }

    const user = req.user!;
    const canAccess = await checkRecordingAccess(user, record);
    if (!canAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Serve from S3 if available (preferred — permanent storage)
    if (record.s3Key) {
      const signedUrlResult = await s3Service.getSignedDownloadUrl(record.s3Key, 3600);
      if (signedUrlResult.success && signedUrlResult.url) {
        return res.redirect(signedUrlResult.url);
      }
      console.warn(`[Calls] S3 signed URL failed for ${record.s3Key}:`, signedUrlResult.error);
    }

    // Fallback: proxy from Telnyx URL (may be expired)
    if (record.recordingUrl && !record.recordingUrl.startsWith('s3://')) {
      const response = await fetch(record.recordingUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch recording" });
      }
      res.set("Content-Type", "audio/mpeg");
      res.set("Content-Disposition", `inline; filename="recording-${record.id}.mp3"`);
      const arrayBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }

    res.status(404).json({ error: "Recording file not available" });
  } catch (error: any) {
    console.error("[Calls] Recording proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch recording" });
  }
});

// =============================================================================
// POST /numbers/search — Search available numbers by area code (admin)
// =============================================================================

router.post("/numbers/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!["owner", "system_admin"].includes(user.role)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { areaCode, limit } = req.body;
    if (!areaCode) {
      return res.status(400).json({ error: "areaCode is required" });
    }

    const numbers = await searchAvailableNumbers(areaCode, limit || 10);
    res.json(numbers);
  } catch (error: any) {
    console.error("[Calls] Number search error:", error.message);
    res.status(500).json({ error: "Failed to search numbers" });
  }
});

// =============================================================================
// POST /numbers/purchase — Purchase number and add to pool (admin)
// =============================================================================

router.post("/numbers/purchase", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!["owner", "system_admin"].includes(user.role)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const connectionId = process.env.TELNYX_CONNECTION_ID!;
    const { orderId, status } = await purchaseNumber(phoneNumber, connectionId);
    const areaCode = extractAreaCode(phoneNumber);

    const poolNumber = await storage.createPoolNumber({
      phoneNumber,
      areaCode,
      connectionId,
      telnyxPhoneNumberId: orderId,
    });

    res.json({ poolNumber, orderStatus: status });
  } catch (error: any) {
    console.error("[Calls] Number purchase error:", error.message);
    res.status(500).json({ error: "Failed to purchase number" });
  }
});

export default router;
