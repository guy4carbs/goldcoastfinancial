/**
 * Training Sessions API Routes
 * 1:1 training/coaching sessions between agents and their upline
 * Sends email + SMS + in-app notification on create and status changes
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { sendSms, isSmsAvailable } from "../services/smsService";

const router = Router();
router.use(requireAuth);

// Helper: format date for display
function formatSessionDate(date: Date | string, tz = "America/Chicago"): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });
}

// Helper: format phone to (xxx) xxx-xxxx
function formatPhone(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 10);
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return val;
}

// Helper: send email notification via Gmail (uses sendFollowUpEmail for branded HTML)
async function sendTrainingEmail(recipientEmail: string, recipientName: string, subject: string, headline: string, message: string) {
  try {
    const { sendFollowUpEmail } = await import("../gmail");
    await sendFollowUpEmail({
      clientFirstName: recipientName.split(" ")[0],
      clientEmail: recipientEmail,
      coverageType: "Training",
      agentName: "Heritage Life Solutions",
      agentEmail: "admin@heritagels.org",
      portalUrl: "https://heritagels.org/agents/training-sessions",
      subject,
      headline,
      subheadline: "1:1 Training Session",
      message,
      emoji: "📅",
    });
  } catch (err: any) {
    console.error("[TrainingSessions] Email send failed:", err?.message);
  }
}

// Helper: send SMS notification
async function sendTrainingSms(phone: string, message: string) {
  if (!phone || !isSmsAvailable()) return;
  try {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 10) {
      await sendSms(`+1${digits.slice(-10)}`, message);
    }
  } catch (err: any) {
    console.error("[TrainingSessions] SMS send failed:", err?.message);
  }
}

// =============================================================================
// POST / — Request a 1:1 training session
// =============================================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const requestorId = (req as any).user?.id;
    if (!requestorId) return res.status(401).json({ error: "Not authenticated" });

    const { trainerId, scheduledAt, duration = 30, meetingType = "phone", topic, notes, location, meetingLink } = req.body;

    if (!trainerId) return res.status(400).json({ error: "Trainer is required" });
    if (!scheduledAt) return res.status(400).json({ error: "Scheduled date/time is required" });

    // Verify trainer is in requestor's upline chain
    const hierarchyResult = await pool.query(
      `SELECT upline_chain FROM agent_hierarchy WHERE agent_user_id = $1 AND effective_to IS NULL`,
      [requestorId]
    );
    const uplineChain: string[] = hierarchyResult.rows[0]?.upline_chain || [];
    if (!uplineChain.includes(trainerId)) {
      return res.status(403).json({ error: "You can only schedule sessions with people in your upline" });
    }

    // Create session
    const result = await pool.query(`
      INSERT INTO training_sessions (requestor_id, trainer_id, scheduled_at, duration, meeting_type, topic, notes, location, meeting_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [requestorId, trainerId, new Date(scheduledAt), duration, meetingType, topic || null, notes || null, location || null, meetingLink || null]);

    const session = result.rows[0];

    // Get requestor and trainer info
    const usersResult = await pool.query(
      `SELECT id, first_name, last_name, email, phone FROM users WHERE id = ANY($1)`,
      [[requestorId, trainerId]]
    );
    const requestor = usersResult.rows.find((u: any) => u.id === requestorId);
    const trainer = usersResult.rows.find((u: any) => u.id === trainerId);

    const requestorName = `${requestor?.first_name || ""} ${requestor?.last_name || ""}`.trim();
    const trainerName = `${trainer?.first_name || ""} ${trainer?.last_name || ""}`.trim();
    const dateStr = formatSessionDate(scheduledAt);
    const meetingTypeLabel = meetingType === "phone" ? "Phone Call" : meetingType === "video" ? "Video Call" : meetingType === "in_person" ? "In-Person" : "Screen Share";

    // ── Send notifications to trainer ──

    // 1. In-app notification
    try {
      await storage.createNotification({
        userId: trainerId,
        title: "New 1:1 Training Request",
        message: `${requestorName} has requested a ${duration}-min ${meetingTypeLabel} on ${dateStr}${topic ? ` — Topic: ${topic}` : ""}`,
        type: "training",
        isRead: false,
        actionUrl: "/agents/training-sessions",
      });
    } catch {}

    // 2. Email notification
    if (trainer?.email) {
      sendTrainingEmail(
        trainer.email,
        trainerName,
        `1:1 Training Request from ${requestorName}`,
        "New Training Request",
        `${requestorName} has requested a ${duration}-minute ${meetingTypeLabel} on ${dateStr}.${topic ? `\n\nTopic: ${topic}` : ""}${notes ? `\nNotes: ${notes}` : ""}${requestor?.phone ? `\nAgent Phone: ${formatPhone(requestor.phone)}` : ""}\n\nLog in to your Heritage Life Solutions dashboard to accept or decline.`
      );
    }

    // 3. SMS notification
    if (trainer?.phone) {
      const smsMsg = `Heritage Life Solutions: ${requestorName} requested a ${duration}-min 1:1 training session on ${dateStr}. Topic: ${topic || "General training"}. Log in to accept or decline.`;
      sendTrainingSms(trainer.phone, smsMsg);
    }

    // Also notify requestor with confirmation
    try {
      await storage.createNotification({
        userId: requestorId,
        title: "Training Session Requested",
        message: `Your 1:1 request with ${trainerName} on ${dateStr} has been sent. Waiting for their response.`,
        type: "training",
        isRead: false,
        actionUrl: "/agents/training-sessions",
      });
    } catch {}

    console.log(`[TrainingSessions] Session created: ${requestorName} → ${trainerName} on ${dateStr}`);

    res.status(201).json({
      success: true,
      session: {
        ...session,
        requestorName,
        trainerName,
      },
    });
  } catch (error: any) {
    console.error("[TrainingSessions] Create error:", error?.message);
    res.status(500).json({ error: "Failed to create training session" });
  }
});

// =============================================================================
// GET / — List training sessions (for current user as requestor or trainer)
// =============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const status = req.query.status as string;

    let query = `
      SELECT ts.*,
        r.first_name as requestor_first, r.last_name as requestor_last, r.email as requestor_email, r.phone as requestor_phone, r.avatar_url as requestor_avatar,
        t.first_name as trainer_first, t.last_name as trainer_last, t.email as trainer_email, t.phone as trainer_phone, t.avatar_url as trainer_avatar
      FROM training_sessions ts
      JOIN users r ON ts.requestor_id = r.id
      JOIN users t ON ts.trainer_id = t.id
      WHERE (ts.requestor_id = $1 OR ts.trainer_id = $1)
    `;
    const params: any[] = [userId];

    if (status) {
      query += ` AND ts.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY ts.scheduled_at DESC LIMIT 50`;

    const result = await pool.query(query, params);

    const sessions = result.rows.map((r: any) => ({
      id: r.id,
      requestorId: r.requestor_id,
      trainerId: r.trainer_id,
      requestorName: `${r.requestor_first || ""} ${r.requestor_last || ""}`.trim(),
      trainerName: `${r.trainer_first || ""} ${r.trainer_last || ""}`.trim(),
      requestorEmail: r.requestor_email,
      trainerEmail: r.trainer_email,
      requestorPhone: r.requestor_phone,
      trainerPhone: r.trainer_phone,
      requestorAvatar: r.requestor_avatar,
      trainerAvatar: r.trainer_avatar,
      status: r.status,
      scheduledAt: r.scheduled_at,
      duration: r.duration,
      timezone: r.timezone,
      meetingType: r.meeting_type,
      topic: r.topic,
      notes: r.notes,
      meetingLink: r.meeting_link,
      location: r.location,
      declineReason: r.decline_reason,
      outcome: r.outcome,
      nextSteps: r.next_steps,
      createdAt: r.created_at,
    }));

    res.json({ success: true, sessions });
  } catch (error: any) {
    console.error("[TrainingSessions] List error:", error?.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// =============================================================================
// PATCH /:id/accept — Accept a training session
// =============================================================================
router.patch("/:id/accept", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { meetingLink } = req.body;

    // Verify this user is the trainer
    const check = await pool.query(`SELECT * FROM training_sessions WHERE id = $1 AND trainer_id = $2`, [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: "Not authorized" });
    if (check.rows[0].status !== "pending") return res.status(400).json({ error: "Session is not pending" });

    const setClauses = [`status = 'accepted'`, `accepted_at = NOW()`, `updated_at = NOW()`];
    const params: any[] = [];
    let idx = 1;

    if (meetingLink) {
      setClauses.push(`meeting_link = $${idx}`);
      params.push(meetingLink);
      idx++;
    }

    params.push(id);
    await pool.query(`UPDATE training_sessions SET ${setClauses.join(", ")} WHERE id = $${idx}`, params);

    const session = check.rows[0];

    // Get names
    const usersResult = await pool.query(`SELECT id, first_name, last_name, email, phone FROM users WHERE id = ANY($1)`, [[session.requestor_id, userId]]);
    const requestor = usersResult.rows.find((u: any) => u.id === session.requestor_id);
    const trainer = usersResult.rows.find((u: any) => u.id === userId);
    const trainerName = `${trainer?.first_name || ""} ${trainer?.last_name || ""}`.trim();
    const dateStr = formatSessionDate(session.scheduled_at);

    // Notify requestor
    await storage.createNotification({
      userId: session.requestor_id,
      title: "Training Session Accepted!",
      message: `${trainerName} accepted your 1:1 session on ${dateStr}${meetingLink ? ". Meeting link has been added." : ""}`,
      type: "training",
      isRead: false,
      actionUrl: "/agents/training-sessions",
    });

    // Email requestor
    if (requestor?.email) {
      const requestorName = `${requestor.first_name || ""} ${requestor.last_name || ""}`.trim();
      sendTrainingEmail(
        requestor.email,
        requestorName,
        `1:1 Training Confirmed — ${dateStr}`,
        "Session Confirmed!",
        `${trainerName} has accepted your 1:1 training session on ${dateStr} (${session.duration} min).${meetingLink ? `\n\nMeeting Link: ${meetingLink}` : ""}${session.topic ? `\nTopic: ${session.topic}` : ""}`
      );
    }

    // SMS requestor
    if (requestor?.phone) {
      sendTrainingSms(requestor.phone, `Heritage Life Solutions: Your 1:1 with ${trainerName} on ${dateStr} has been confirmed!${meetingLink ? " Link: " + meetingLink : ""}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[TrainingSessions] Accept error:", error?.message);
    res.status(500).json({ error: "Failed to accept session" });
  }
});

// =============================================================================
// PATCH /:id/decline — Decline a training session
// =============================================================================
router.patch("/:id/decline", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const check = await pool.query(`SELECT * FROM training_sessions WHERE id = $1 AND trainer_id = $2`, [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: "Not authorized" });
    if (check.rows[0].status !== "pending") return res.status(400).json({ error: "Session is not pending" });

    await pool.query(`UPDATE training_sessions SET status = 'declined', declined_at = NOW(), decline_reason = $1, updated_at = NOW() WHERE id = $2`, [reason || null, id]);

    const session = check.rows[0];
    const trainer = await pool.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
    const trainerName = `${trainer.rows[0]?.first_name || ""} ${trainer.rows[0]?.last_name || ""}`.trim();
    const dateStr = formatSessionDate(session.scheduled_at);

    await storage.createNotification({
      userId: session.requestor_id,
      title: "Training Session Declined",
      message: `${trainerName} declined your 1:1 session on ${dateStr}${reason ? `. Reason: ${reason}` : ""}. Try scheduling a different time.`,
      type: "training",
      isRead: false,
      actionUrl: "/agents/training-sessions",
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[TrainingSessions] Decline error:", error?.message);
    res.status(500).json({ error: "Failed to decline session" });
  }
});

// =============================================================================
// PATCH /:id/complete — Mark session as completed (with outcome + next steps)
// =============================================================================
router.patch("/:id/complete", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { outcome, nextSteps } = req.body;

    const check = await pool.query(`SELECT * FROM training_sessions WHERE id = $1 AND (trainer_id = $2 OR requestor_id = $2)`, [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: "Not authorized" });

    await pool.query(
      `UPDATE training_sessions SET status = 'completed', completed_at = NOW(), outcome = $1, next_steps = $2, updated_at = NOW() WHERE id = $3`,
      [outcome || null, nextSteps || null, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error("[TrainingSessions] Complete error:", error?.message);
    res.status(500).json({ error: "Failed to complete session" });
  }
});

// =============================================================================
// PATCH /:id/cancel — Cancel a session
// =============================================================================
router.patch("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const check = await pool.query(`SELECT * FROM training_sessions WHERE id = $1 AND (trainer_id = $2 OR requestor_id = $2)`, [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: "Not authorized" });

    await pool.query(
      `UPDATE training_sessions SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1, updated_at = NOW() WHERE id = $2`,
      [reason || null, id]
    );

    // Notify the other party
    const session = check.rows[0];
    const otherUserId = session.requestor_id === userId ? session.trainer_id : session.requestor_id;
    const canceller = await pool.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
    const cancellerName = `${canceller.rows[0]?.first_name || ""} ${canceller.rows[0]?.last_name || ""}`.trim();

    await storage.createNotification({
      userId: otherUserId,
      title: "Training Session Cancelled",
      message: `${cancellerName} cancelled the 1:1 session on ${formatSessionDate(session.scheduled_at)}${reason ? `. Reason: ${reason}` : ""}`,
      type: "training",
      isRead: false,
      actionUrl: "/agents/training-sessions",
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[TrainingSessions] Cancel error:", error?.message);
    res.status(500).json({ error: "Failed to cancel session" });
  }
});

export default router;
