/**
 * Calendar API Routes
 * Consolidated calendar system: DB appointments + per-agent CalDAV + company Google Calendar
 *
 * GET    /api/calendar/connection   — Agent's personal CalDAV connection (or null)
 * POST   /api/calendar/connect      — Connect agent's calendar via CalDAV
 * DELETE /api/calendar/connection   — Disconnect agent's personal calendar
 * GET    /api/calendar/events       — Agent's events (DB + CalDAV/Google merged)
 * POST   /api/calendar/events       — Create new event
 * PATCH  /api/calendar/events/:id   — Update event
 * DELETE /api/calendar/events/:id   — Cancel/delete event
 * GET    /api/calendar/status       — Calendar connection status
 * GET    /api/calendar/today        — Today's events
 *
 * Governance: Forge (backend) + Conduit (integrations)
 */

import { Router, type Request, type Response } from "express";
import { google } from "googleapis";
import { storage } from "../storage";
import { pool } from "../db";
import * as googleCalendar from "../googleCalendar";
import { requireAuth, type AuthenticatedUser } from "../middleware/auth";

const router = Router();

// All calendar routes require authentication
router.use(requireAuth);

// ─── Helpers ───

interface UnifiedEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // h:mm AM/PM
  duration: string; // "30 min", "1 hour"
  type: "call" | "meeting" | "video" | "event" | "training";
  description?: string;
  status: "upcoming" | "completed" | "cancelled";
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  location?: string;
  meetingLink?: string;
  googleEventId?: string;
  meetingNotes?: string;
  source: "local" | "google" | "caldav";
}

/**
 * Convert a DB appointment row into the unified event format.
 */
function appointmentToEvent(apt: any): UnifiedEvent {
  const scheduledAt = new Date(apt.scheduledAt);

  // Format date as YYYY-MM-DD
  const date = scheduledAt.toISOString().split("T")[0];

  // Format time as h:mm AM/PM
  const hours = scheduledAt.getHours();
  const minutes = scheduledAt.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const time = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;

  // Format duration
  const durationMin = apt.duration || 30;
  let duration: string;
  if (durationMin >= 120) duration = `${durationMin / 60} hours`;
  else if (durationMin >= 60) duration = `${durationMin / 60} hour`;
  else duration = `${durationMin} min`;

  // Map meeting type to event type
  const typeMap: Record<string, UnifiedEvent["type"]> = {
    discovery: "call",
    presentation: "meeting",
    follow_up: "call",
    close: "meeting",
    video: "video",
    call: "call",
    meeting: "meeting",
    training: "training",
    event: "event",
  };

  // Map status
  let status: UnifiedEvent["status"] = "upcoming";
  if (apt.status === "completed") status = "completed";
  else if (apt.status === "cancelled" || apt.status === "no_show") status = "cancelled";

  return {
    id: apt.id,
    title: apt.title,
    date,
    time,
    duration,
    type: typeMap[apt.meetingType] || "event",
    description: apt.description || undefined,
    status,
    clientName: undefined, // Will be enriched if lead/client data is present
    clientEmail: undefined,
    clientPhone: undefined,
    location: apt.location || undefined,
    meetingLink: apt.meetingLink || undefined,
    googleEventId: apt.googleEventId || undefined,
    meetingNotes: apt.outcome || undefined,
    source: "local",
  };
}

/**
 * Convert a Google Calendar event into the unified event format.
 */
function googleEventToUnified(gEvent: googleCalendar.CalendarEvent): UnifiedEvent {
  const startDate = new Date(gEvent.start);
  const date = startDate.toISOString().split("T")[0];

  // Format time
  const hours = startDate.getHours();
  const minutes = startDate.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const time = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;

  // Calculate duration from start/end
  const endDate = new Date(gEvent.end);
  const diffMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  let duration: string;
  if (diffMin >= 120) duration = `${diffMin / 60} hours`;
  else if (diffMin >= 60) duration = `${diffMin / 60} hour`;
  else duration = `${diffMin} min`;

  // Map Google event type
  const typeMap: Record<string, UnifiedEvent["type"]> = {
    meeting: "meeting",
    call: "call",
    training: "training",
    review: "meeting",
    deadline: "event",
    event: "event",
  };

  return {
    id: `google-${gEvent.id}`,
    title: gEvent.title,
    date,
    time,
    duration,
    type: typeMap[gEvent.type] || "event",
    description: gEvent.description || undefined,
    status: gEvent.status === "cancelled" ? "cancelled" : "upcoming",
    location: gEvent.location || undefined,
    meetingLink: gEvent.meetLink || undefined,
    googleEventId: gEvent.id,
    source: "google",
  };
}

/**
 * Parse duration string ("30 min", "1 hour", "1.5 hours") to minutes.
 */
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 30;
  const lower = duration.toLowerCase().trim();
  if (lower.includes("hour")) {
    const num = parseFloat(lower);
    return isNaN(num) ? 60 : Math.round(num * 60);
  }
  const num = parseInt(lower);
  return isNaN(num) ? 30 : num;
}

/**
 * Parse a time string like "10:30 AM" or "14:00" into { hours, minutes } (24h).
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const trimmed = timeStr.trim();
  // Check for AM/PM format
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = parseInt(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }
  // 24h format
  const parts = trimmed.split(":");
  return { hours: parseInt(parts[0]) || 0, minutes: parseInt(parts[1]) || 0 };
}

// ─── CalDAV Helpers ───

/**
 * Parse an iCal date string (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ) into a Date.
 */
function parseICalDate(ical: string): Date {
  const clean = ical.replace(/[^0-9T]/g, '');
  if (clean.length >= 15) {
    const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8);
    const h = clean.slice(9, 11), min = clean.slice(11, 13);
    const isUTC = ical.endsWith('Z');
    if (isUTC) {
      return new Date(`${y}-${m}-${d}T${h}:${min}:00Z`);
    }
    return new Date(`${y}-${m}-${d}T${h}:${min}:00`);
  }
  // All-day event: YYYYMMDD
  if (clean.length === 8) {
    const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }
  return new Date(ical);
}

/**
 * Categorize a CalDAV event title into an event type.
 */
function categorizeEventType(title: string): UnifiedEvent["type"] {
  const lower = title.toLowerCase();
  if (lower.includes('call') || lower.includes('phone')) return 'call';
  if (lower.includes('video') || lower.includes('zoom') || lower.includes('meet') || lower.includes('teams')) return 'video';
  if (lower.includes('training') || lower.includes('onboarding') || lower.includes('workshop')) return 'training';
  if (lower.includes('meeting') || lower.includes('review') || lower.includes('1:1') || lower.includes('1-on-1')) return 'meeting';
  return 'event';
}

/**
 * CalDAV provider URL mapping
 */
const CALDAV_URLS: Record<string, string> = {
  google: 'https://apidata.googleusercontent.com/caldav/v2/',
  apple: 'https://caldav.icloud.com/',
  outlook: 'https://outlook.office365.com/caldav/',
};

// ─── Routes ───

/**
 * GET /connection — Return ALL of agent's active calendar connections
 */
router.get("/connection", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const result = await pool.query(
      `SELECT * FROM agent_calendar_connections WHERE agent_user_id = $1 AND status = 'active' ORDER BY created_at`,
      [user.id]
    );

    const connections = result.rows.map((conn: any) => ({
      id: conn.id,
      provider: conn.provider,
      username: conn.username,
      displayName: conn.display_name,
      status: conn.status,
      lastSyncAt: conn.last_sync_at,
      createdAt: conn.created_at,
    }));

    // Backward compat: also return first as "connection"
    const conn = result.rows[0];
    res.json({
      connections,
      connection: conn ? {
        id: conn.id,
        provider: conn.provider,
        username: conn.username,
        displayName: conn.display_name,
        status: conn.status,
        lastSyncAt: conn.last_sync_at,
        createdAt: conn.created_at,
      } : null,
    });
  } catch (error: any) {
    console.error("[Calendar] Error fetching connection:", error?.message);
    res.status(500).json({ error: "Failed to fetch calendar connection" });
  }
});

/**
 * POST /connect — Connect agent's personal calendar via CalDAV
 * Tests the connection before saving credentials.
 */
router.post("/connect", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const { provider, username, password, caldavUrl } = req.body;

    const url = caldavUrl || CALDAV_URLS[provider] || '';

    if (!username || !password) {
      return res.status(400).json({ error: "Email and app password are required" });
    }
    if (!url) {
      return res.status(400).json({ error: "Invalid provider or CalDAV URL" });
    }

    // Test CalDAV connection before saving
    try {
      const { DAVClient } = await import('tsdav');
      const client = new DAVClient({
        serverUrl: url,
        credentials: { username, password },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
      });
      await client.login();
      console.log(`[Calendar] CalDAV connection test successful for ${username} (${provider})`);
    } catch (err: any) {
      console.error(`[Calendar] CalDAV connection test failed for ${username}:`, err?.message);
      return res.status(400).json({
        error: "Connection failed: " + (err?.message || "Invalid credentials. Make sure you are using an App Password.")
      });
    }

    // Upsert connection (one per provider per agent)
    await pool.query(`
      INSERT INTO agent_calendar_connections (agent_user_id, provider, caldav_url, username, password, display_name, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      ON CONFLICT (agent_user_id, provider) DO UPDATE SET
        caldav_url = $3, username = $4, password = $5,
        display_name = $6, status = 'active', updated_at = NOW()
    `, [user.id, provider, url, username, password, username]);

    console.log(`[Calendar] CalDAV connected for agent ${user.id}: ${username} (${provider})`);
    res.json({ success: true, provider, username });
  } catch (error: any) {
    console.error("[Calendar] Error connecting CalDAV:", error?.message);
    res.status(500).json({ error: "Failed to connect calendar" });
  }
});

/**
 * GET /connect/google — Redirect agent to Google OAuth consent for calendar scopes
 */
router.get("/connect/google", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const appUrl = process.env.APP_URL || "http://localhost:4500";

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/calendar/callback/google`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent",
      state: user.id, // Pass userId through OAuth state parameter
    });

    res.redirect(authUrl);
  } catch (error: any) {
    console.error("[Calendar] Error initiating Google OAuth:", error?.message);
    res.status(500).json({ error: "Failed to initiate Google Calendar connection" });
  }
});

/**
 * GET /callback/google — Handle Google OAuth callback
 * Exchanges code for tokens, gets user email, stores calendar connection.
 * The user's session cookie is sent with the redirect, so requireAuth passes.
 */
router.get("/callback/google", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const appUrl = process.env.APP_URL || "http://localhost:4500";
    // Use authenticated session user — state param is for verification only
    const sessionUser = (req as any).user;
    const agentUserId = sessionUser?.id;

    if (!code || !agentUserId) {
      return res.redirect(`${appUrl}/agents/calendar?cal_error=missing_params`);
    }

    // Validate state matches session user to prevent CSRF
    if (state && state !== agentUserId) {
      console.warn(`[Calendar] OAuth state mismatch: state=${state}, session=${agentUserId}`);
      return res.redirect(`${appUrl}/agents/calendar?cal_error=invalid_state`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/calendar/callback/google`
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user email from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const email = userInfo.email || "";
    const displayName = userInfo.name || email;

    if (!email) {
      return res.redirect(`${appUrl}/agents/calendar?cal_error=no_email`);
    }

    // Upsert calendar connection (one per provider per agent)
    await pool.query(`
      INSERT INTO agent_calendar_connections
        (agent_user_id, provider, caldav_url, username, password, display_name, access_token, refresh_token, token_expires_at, status)
      VALUES ($1, 'google', '', $2, '', $3, $4, $5, $6, 'active')
      ON CONFLICT (agent_user_id, provider) DO UPDATE SET
        username = $2, display_name = $3,
        access_token = $4, refresh_token = COALESCE($5, agent_calendar_connections.refresh_token),
        token_expires_at = $6, status = 'active', updated_at = NOW()
    `, [
      agentUserId,
      email,
      displayName,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    ]);

    console.log(`[Calendar] Google Calendar connected for agent ${agentUserId}: ${email}`);
    res.redirect(`${appUrl}/agents/calendar?cal_connected=google`);
  } catch (error: any) {
    console.error("[Calendar] Google OAuth callback error:", error?.message);
    const appUrl = process.env.APP_URL || "http://localhost:4500";
    res.redirect(`${appUrl}/agents/calendar?cal_error=oauth_failed`);
  }
});

/**
 * DELETE /connection/:provider — Disconnect a specific calendar provider
 * DELETE /connection — Disconnect all calendars
 */
router.delete("/connection/:provider?", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const { provider } = req.params;

    if (provider) {
      await pool.query(
        `UPDATE agent_calendar_connections SET status = 'disconnected', password = '', access_token = NULL, refresh_token = NULL, token_expires_at = NULL, updated_at = NOW() WHERE agent_user_id = $1 AND provider = $2 AND status = 'active'`,
        [user.id, provider]
      );
      console.log(`[Calendar] ${provider} calendar disconnected for agent ${user.id}`);
    } else {
      await pool.query(
        `UPDATE agent_calendar_connections SET status = 'disconnected', password = '', access_token = NULL, refresh_token = NULL, token_expires_at = NULL, updated_at = NOW() WHERE agent_user_id = $1 AND status = 'active'`,
        [user.id]
      );
      console.log(`[Calendar] All calendars disconnected for agent ${user.id}`);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Calendar] Error disconnecting:", error?.message);
    res.status(500).json({ error: "Failed to disconnect calendar" });
  }
});

/**
 * GET /events — Fetch agent's events (DB + personal CalDAV/Google Calendar merged)
 */
router.get("/events", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const { start, end } = req.query;

    // 1. Fetch DB appointments for this agent
    const dbAppointments = await storage.getAppointmentsByAgentId(user.id);
    let dbEvents = dbAppointments
      .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show')
      .map(appointmentToEvent);

    // Filter by date range if provided
    if (start && end) {
      const startDate = new Date(start as string);
      const endDate = new Date(end as string);
      dbEvents = dbEvents.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    // 2. Fetch from ALL active calendar connections
    let calendarEvents: UnifiedEvent[] = [];
    const calConns = await pool.query(
      `SELECT * FROM agent_calendar_connections WHERE agent_user_id = $1 AND status = 'active'`,
      [user.id]
    );

    for (const connRow of calConns.rows) {
    const calConn = { rows: [connRow] }; // Compat wrapper
    if (calConn.rows[0]) {
      const conn = calConn.rows[0];

      // Google Calendar uses per-agent OAuth tokens
      if (conn.provider === 'google' && conn.access_token) {
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          oauth2Client.setCredentials({
            access_token: conn.access_token,
            refresh_token: conn.refresh_token,
          });

          // Auto-refresh tokens and persist new ones
          oauth2Client.on('tokens', async (tokens) => {
            try {
              const updates: string[] = [];
              const values: any[] = [];
              let idx = 1;
              if (tokens.access_token) { updates.push(`access_token = $${idx++}`); values.push(tokens.access_token); }
              if (tokens.refresh_token) { updates.push(`refresh_token = $${idx++}`); values.push(tokens.refresh_token); }
              if (tokens.expiry_date) { updates.push(`token_expires_at = $${idx++}`); values.push(new Date(tokens.expiry_date)); }
              if (updates.length > 0) {
                values.push(conn.id);
                await pool.query(
                  `UPDATE agent_calendar_connections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
                  values
                );
              }
            } catch (tokenErr: any) {
              console.error('[Calendar] Error persisting refreshed tokens:', tokenErr?.message);
            }
          });

          const startISO = start
            ? new Date(start as string).toISOString()
            : new Date(Date.now() - 90 * 86400000).toISOString();
          const endISO = end
            ? new Date(end as string).toISOString()
            : new Date(Date.now() + 90 * 86400000).toISOString();

          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

          // Fetch ALL visible calendars (primary, holidays, subscribed, etc.)
          const calList = await calendar.calendarList.list();
          const allCalendars = calList.data.items || [];

          for (const cal of allCalendars) {
            if (!cal.id) continue;
            try {
              const response = await calendar.events.list({
                calendarId: cal.id,
                timeMin: startISO,
                timeMax: endISO,
                maxResults: 100,
                singleEvents: true,
                orderBy: 'startTime',
              });

              for (const ge of response.data.items || []) {
                if (ge.status === 'cancelled') continue;
                const geStart = ge.start?.dateTime || ge.start?.date || '';
                const geEnd = ge.end?.dateTime || ge.end?.date || '';
                const startDate = new Date(geStart);
                const endDate = new Date(geEnd);
                const isAllDay = !ge.start?.dateTime;
                const diffMin = isAllDay ? 1440 : Math.round((endDate.getTime() - startDate.getTime()) / 60000);
                let durationStr: string;
                if (isAllDay) durationStr = 'All day';
                else if (diffMin >= 120) durationStr = `${diffMin / 60} hours`;
                else if (diffMin >= 60) durationStr = `${diffMin / 60} hour`;
                else durationStr = `${diffMin} min`;

                const hours = startDate.getHours();
                const minutes = startDate.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hour12 = hours % 12 || 12;
                const timeStr = isAllDay ? 'All Day' : `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

                calendarEvents.push({
                  id: `google-${ge.id}`,
                  title: ge.summary || '(No title)',
                  date: startDate.toISOString().split('T')[0],
                  time: timeStr,
                  duration: durationStr,
                  type: categorizeEventType(ge.summary || ''),
                  description: ge.description || undefined,
                  location: ge.location || undefined,
                  status: 'upcoming',
                  source: 'google',
                  googleEventId: ge.id || undefined,
                  meetingLink: ge.hangoutLink || undefined,
                });
              }
            } catch {
              // Some calendars (e.g. birthdays) may not support events.list — skip
            }
          }
          console.log(`[Calendar] Google Calendar: fetched ${calendarEvents.length} events from ${allCalendars.length} calendars for ${conn.username}`);

          await pool.query(
            `UPDATE agent_calendar_connections SET last_sync_at = NOW() WHERE id = $1`,
            [conn.id]
          );
        } catch (err: any) {
          console.error('[Calendar] Google Calendar fetch error:', err?.message);
        }
      } else {
        // Apple/Outlook: use CalDAV with app password
        try {
          const { DAVClient } = await import('tsdav');
          const client = new DAVClient({
            serverUrl: conn.caldav_url,
            credentials: { username: conn.username, password: conn.password },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
          });
          await client.login();
          const calendars = await client.fetchCalendars();
          const primaryCalendar = calendars[0];

        if (primaryCalendar) {
          // Build time range — default to +-90 days from now
          const startISO = start
            ? new Date(start as string).toISOString()
            : new Date(Date.now() - 90 * 86400000).toISOString();
          const endISO = end
            ? new Date(end as string).toISOString()
            : new Date(Date.now() + 90 * 86400000).toISOString();

          const calendarObjects = await client.fetchCalendarObjects({
            calendar: primaryCalendar,
            timeRange: { start: startISO, end: endISO },
          });

          for (const obj of calendarObjects) {
            if (!obj.data) continue;
            const lines = obj.data.split('\n');
            let title = '', dtstart = '', dtend = '', description = '', location = '', uid = '';
            for (const line of lines) {
              if (line.startsWith('SUMMARY:')) title = line.slice(8).trim();
              if (line.startsWith('DTSTART')) dtstart = line.split(':').pop()?.trim() || '';
              if (line.startsWith('DTEND')) dtend = line.split(':').pop()?.trim() || '';
              if (line.startsWith('DESCRIPTION:')) description = line.slice(12).trim();
              if (line.startsWith('LOCATION:')) location = line.slice(9).trim();
              if (line.startsWith('UID:')) uid = line.slice(4).trim();
            }

            if (title && dtstart) {
              const startDate = parseICalDate(dtstart);
              const endDate = dtend ? parseICalDate(dtend) : new Date(startDate.getTime() + 30 * 60000);
              const diffMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
              let durationStr: string;
              if (diffMin >= 120) durationStr = `${diffMin / 60} hours`;
              else if (diffMin >= 60) durationStr = `${diffMin / 60} hour`;
              else durationStr = `${diffMin} min`;

              const hours = startDate.getHours();
              const minutes = startDate.getMinutes();
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const hour12 = hours % 12 || 12;
              const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

              calendarEvents.push({
                id: uid || `caldav-${obj.url}`,
                title,
                date: startDate.toISOString().split('T')[0],
                time: timeStr,
                duration: durationStr,
                type: categorizeEventType(title),
                description: description || undefined,
                location: location || undefined,
                status: 'upcoming',
                source: 'caldav',
              });
            }
          }
        }

        // Update last sync timestamp
        await pool.query(
          `UPDATE agent_calendar_connections SET last_sync_at = NOW() WHERE id = $1`,
          [conn.id]
        );
      } catch (err: any) {
        console.error('[Calendar] CalDAV fetch error:', err?.message);
        // Don't fail — still return DB events
      }
      } // end else (non-google CalDAV)
    }
    } // end for loop over connections

    if (calConns.rows.length === 0) {
      // No personal connections — fall back to company Google Calendar
      try {
        const connected = await googleCalendar.checkCalendarConnection();
        if (connected) {
          const timeMin = start ? new Date(start as string) : undefined;
          const timeMax = end ? new Date(end as string) : undefined;
          const gEvents = await googleCalendar.getCalendarEvents(timeMin, timeMax);
          calendarEvents = gEvents.map(googleEventToUnified);
        }
      } catch (err) {
        console.log("[Calendar] Google Calendar not available, returning DB events only");
      }
    }

    // 3. Get hidden/cancelled Google event IDs (events user deleted but can't remove from read-only calendars)
    const hiddenResult = await pool.query(
      `SELECT google_event_id FROM appointments WHERE agent_user_id = $1 AND status = 'cancelled' AND google_event_id IS NOT NULL`,
      [user.id]
    );
    const hiddenGoogleIds = new Set(hiddenResult.rows.map((r: any) => r.google_event_id));

    // Merge and dedupe — filter out hidden + already-in-DB events
    const dbGoogleIds = new Set(
      dbEvents.filter((e) => e.googleEventId).map((e) => e.googleEventId)
    );
    const uniqueCalEvents = calendarEvents.filter(
      (ce) => !dbGoogleIds.has(ce.googleEventId) && !hiddenGoogleIds.has(ce.googleEventId)
    );

    const allEvents = [...dbEvents, ...uniqueCalEvents].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    res.json({ events: allEvents });
  } catch (error: any) {
    console.error("[Calendar] Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

/**
 * POST /events — Create new event
 */
router.post("/events", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const {
      title,
      date,
      time,
      duration,
      type,
      description,
      clientName,
      clientEmail,
      clientPhone,
      location,
      meetingLink,
      meetingNotes,
    } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Title, date, and time are required" });
    }

    // Parse time to build scheduledAt
    const { hours, minutes } = parseTime(time);
    const scheduledAt = new Date(`${date}T00:00:00`);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const durationMinutes = parseDurationToMinutes(duration || "30 min");

    // Map frontend type to DB meetingType
    const meetingTypeMap: Record<string, string> = {
      call: "call",
      meeting: "meeting",
      video: "video",
      event: "event",
      training: "training",
    };

    // Create in database
    const appointment = await storage.createAppointment({
      agentUserId: user.id,
      title,
      scheduledAt,
      duration: durationMinutes,
      meetingType: meetingTypeMap[type] || "discovery",
      description: description || null,
      location: location || null,
      meetingLink: meetingLink || null,
      status: "scheduled",
      outcome: meetingNotes || null,
    });

    // Try to create in Google Calendar if agent has personal connection or company is connected
    let googleEventId: string | null = null;
    try {
      // Check for per-agent Google Calendar first
      const agentCalConn = await pool.query(
        `SELECT * FROM agent_calendar_connections WHERE agent_user_id = $1 AND provider = 'google' AND status = 'active' AND access_token IS NOT NULL`,
        [user.id]
      );
      const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

      if (agentCalConn.rows[0]) {
        // Use agent's personal Google Calendar
        const conn = agentCalConn.rows[0];
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
          access_token: conn.access_token,
          refresh_token: conn.refresh_token,
        });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const gcalEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: title,
            description: description || undefined,
            location: location || undefined,
            start: { dateTime: scheduledAt.toISOString(), timeZone: 'America/Chicago' },
            end: { dateTime: endTime.toISOString(), timeZone: 'America/Chicago' },
            attendees: clientEmail ? [{ email: clientEmail }] : undefined,
          },
        });
        googleEventId = gcalEvent.data.id || null;
      } else {
        // Fallback to company Google Calendar
        const connected = await googleCalendar.checkCalendarConnection();
        if (connected) {
          googleEventId = await googleCalendar.createCalendarEvent({
            title,
            description: description || undefined,
            startTime: scheduledAt,
            endTime,
            location: location || undefined,
            attendeeEmails: clientEmail ? [clientEmail] : undefined,
          });
        }
      }

      // Save the Google event ID back to the appointment
      if (googleEventId) {
        await storage.updateAppointment(appointment.id, {
          googleEventId,
        });
      }
    } catch (err) {
      console.log("[Calendar] Failed to create Google Calendar event, DB event saved");
    }

    // Return the unified event
    const event = appointmentToEvent({
      ...appointment,
      googleEventId: googleEventId || appointment.googleEventId,
    });
    // Attach client info from the request (not stored in appointment table)
    event.clientName = clientName || undefined;
    event.clientEmail = clientEmail || undefined;
    event.clientPhone = clientPhone || undefined;

    res.status(201).json({ event });
  } catch (error: any) {
    console.error("[Calendar] Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

/**
 * PATCH /events/:id — Update event
 */
router.patch("/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as AuthenticatedUser;
    const {
      title,
      date,
      time,
      duration,
      type,
      description,
      status,
      location,
      meetingLink,
      meetingNotes,
    } = req.body;

    // Verify the appointment exists and belongs to this agent
    const existing = await storage.getAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (existing.agentUserId !== user.id) {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    // Build update object
    const updateData: Record<string, any> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (meetingNotes !== undefined) updateData.outcome = meetingNotes;

    if (date && time) {
      const { hours, minutes } = parseTime(time);
      const scheduledAt = new Date(`${date}T00:00:00`);
      scheduledAt.setHours(hours, minutes, 0, 0);
      updateData.scheduledAt = scheduledAt;
    }

    if (duration) {
      updateData.duration = parseDurationToMinutes(duration);
    }

    if (type) {
      const meetingTypeMap: Record<string, string> = {
        call: "call",
        meeting: "meeting",
        video: "video",
        event: "event",
        training: "training",
      };
      updateData.meetingType = meetingTypeMap[type] || type;
    }

    if (status) {
      const statusMap: Record<string, string> = {
        upcoming: "scheduled",
        completed: "completed",
        cancelled: "cancelled",
      };
      updateData.status = statusMap[status] || status;
      if (status === "completed") updateData.completedAt = new Date();
      if (status === "cancelled") updateData.cancelledAt = new Date();
    }

    const updated = await storage.updateAppointment(id, updateData);
    if (!updated) {
      return res.status(500).json({ error: "Failed to update event" });
    }

    res.json({ event: appointmentToEvent(updated) });
  } catch (error: any) {
    console.error("[Calendar] Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

/**
 * DELETE /events/:id — Cancel/delete event
 */
router.delete("/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as AuthenticatedUser;

    // Handle Google Calendar event deletion (id starts with "google-")
    if (id.startsWith('google-')) {
      const googleEventId = id.replace('google-', '');
      const calConn = await pool.query(
        `SELECT * FROM agent_calendar_connections WHERE agent_user_id = $1 AND provider = 'google' AND status = 'active' AND access_token IS NOT NULL`,
        [user.id]
      );
      if (!calConn.rows[0]) {
        return res.status(400).json({ error: "No Google Calendar connected" });
      }
      const conn = calConn.rows[0];
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: conn.access_token,
        refresh_token: conn.refresh_token,
      });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Try to delete from primary first, then search other calendars
      let deleted = false;
      try {
        await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId });
        deleted = true;
      } catch {
        // Not on primary — try to find which calendar it belongs to
        try {
          const calList = await calendar.calendarList.list();
          for (const cal of calList.data.items || []) {
            if (!cal.id || cal.id === 'primary') continue;
            try {
              await calendar.events.delete({ calendarId: cal.id, eventId: googleEventId });
              deleted = true;
              break;
            } catch {
              // Not on this calendar either — continue
            }
          }
        } catch {
          // Can't list calendars
        }
      }

      if (!deleted) {
        // Can't delete (read-only holiday calendar, etc.) — hide it locally
        // Store the hidden event ID so we can filter it out
        await pool.query(
          `INSERT INTO appointments (agent_user_id, title, scheduled_at, duration, status, google_event_id, cancelled_at)
           VALUES ($1, 'hidden', NOW(), 0, 'cancelled', $2, NOW())
           ON CONFLICT DO NOTHING`,
          [user.id, googleEventId]
        );
      }

      return res.json({ success: true, message: deleted ? "Event deleted from Google Calendar" : "Event hidden from your calendar" });
    }

    // Handle local DB event deletion
    const existing = await storage.getAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (existing.agentUserId !== user.id) {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }

    await storage.updateAppointment(id, {
      status: "cancelled",
      cancelledAt: new Date(),
    } as any);

    res.json({ success: true, message: "Event cancelled" });
  } catch (error: any) {
    console.error("[Calendar] Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

/**
 * GET /status — Calendar connection status (personal CalDAV or company Google)
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;

    // Check for personal CalDAV connection first
    const calConn = await pool.query(
      `SELECT provider, username FROM agent_calendar_connections WHERE agent_user_id = $1 AND status = 'active' LIMIT 1`,
      [user.id]
    );
    if (calConn.rows[0]) {
      return res.json({ connected: true, email: calConn.rows[0].username, provider: calConn.rows[0].provider });
    }

    // Fall back to company Google Calendar
    const connected = await googleCalendar.checkCalendarConnection();
    const email = connected ? await googleCalendar.getConnectedEmail() : null;
    res.json({ connected, email, provider: connected ? 'google' : null });
  } catch (error) {
    res.json({ connected: false, email: null, provider: null });
  }
});

/**
 * GET /today — Today's events
 */
router.get("/today", async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;

    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Fetch DB appointments for today
    const dbAppointments = await storage.getAppointmentsByAgentId(user.id);
    const todayDb = dbAppointments
      .filter((apt) => {
        if (apt.status === 'cancelled' || apt.status === 'no_show') return false;
        const aptDate = new Date(apt.scheduledAt);
        return aptDate >= startOfDay && aptDate < endOfDay;
      })
      .map(appointmentToEvent);

    // Check for personal CalDAV connection first, then fall back to company Google Calendar
    let calEvents: UnifiedEvent[] = [];
    const calConn = await pool.query(
      `SELECT * FROM agent_calendar_connections WHERE agent_user_id = $1 AND status = 'active' LIMIT 1`,
      [user.id]
    );

    if (calConn.rows[0]) {
      const conn = calConn.rows[0];

      if (conn.provider === 'google' && conn.access_token) {
        // Per-agent Google Calendar via OAuth
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          oauth2Client.setCredentials({
            access_token: conn.access_token,
            refresh_token: conn.refresh_token,
          });

          // Auto-refresh tokens and persist new ones
          oauth2Client.on('tokens', async (tokens) => {
            try {
              const updates: string[] = [];
              const values: any[] = [];
              let idx = 1;
              if (tokens.access_token) { updates.push(`access_token = $${idx++}`); values.push(tokens.access_token); }
              if (tokens.refresh_token) { updates.push(`refresh_token = $${idx++}`); values.push(tokens.refresh_token); }
              if (tokens.expiry_date) { updates.push(`token_expires_at = $${idx++}`); values.push(new Date(tokens.expiry_date)); }
              if (updates.length > 0) {
                values.push(conn.id);
                await pool.query(
                  `UPDATE agent_calendar_connections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
                  values
                );
              }
            } catch (tokenErr: any) {
              console.error('[Calendar] Error persisting refreshed tokens:', tokenErr?.message);
            }
          });

          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

          // Fetch ALL visible calendars for today
          const calList = await calendar.calendarList.list();
          const allCals = calList.data.items || [];

          for (const cal of allCals) {
            if (!cal.id) continue;
            try {
              const response = await calendar.events.list({
                calendarId: cal.id,
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime',
              });

              for (const ge of response.data.items || []) {
                if (ge.status === 'cancelled') continue;
                const geStart = ge.start?.dateTime || ge.start?.date || '';
                const geEnd = ge.end?.dateTime || ge.end?.date || '';
                const sd = new Date(geStart);
                const ed = new Date(geEnd);
                const isAllDay = !ge.start?.dateTime;
                const diffMin = isAllDay ? 1440 : Math.round((ed.getTime() - sd.getTime()) / 60000);
                let durationStr: string;
                if (isAllDay) durationStr = 'All day';
                else if (diffMin >= 120) durationStr = `${diffMin / 60} hours`;
                else if (diffMin >= 60) durationStr = `${diffMin / 60} hour`;
                else durationStr = `${diffMin} min`;
                const hours = sd.getHours();
                const minutes = sd.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hour12 = hours % 12 || 12;
                calEvents.push({
                  id: `google-${ge.id}`,
                  title: ge.summary || '(No title)',
                  date: sd.toISOString().split('T')[0],
                  time: isAllDay ? 'All Day' : `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`,
                  duration: durationStr,
                  type: categorizeEventType(ge.summary || ''),
                  description: ge.description || undefined,
              location: ge.location || undefined,
              status: 'upcoming',
              source: 'google',
              googleEventId: ge.id || undefined,
              meetingLink: ge.hangoutLink || undefined,
            });
              }
            } catch {
              // Skip calendars that don't support events.list
            }
          }
        } catch (err: any) {
          console.error('[Calendar] Google Calendar today fetch error:', err?.message);
        }
      } else {
        // Apple/Outlook: use CalDAV with app password
        try {
          const { DAVClient } = await import('tsdav');
          const client = new DAVClient({
            serverUrl: conn.caldav_url,
            credentials: { username: conn.username, password: conn.password },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
          });
          await client.login();
          const calendars = await client.fetchCalendars();
          const primaryCalendar = calendars[0];

          if (primaryCalendar) {
            const calendarObjects = await client.fetchCalendarObjects({
              calendar: primaryCalendar,
              timeRange: { start: startOfDay.toISOString(), end: endOfDay.toISOString() },
            });

            for (const obj of calendarObjects) {
              if (!obj.data) continue;
              const lines = obj.data.split('\n');
              let title = '', dtstart = '', dtend = '', description = '', location = '', uid = '';
              for (const line of lines) {
                if (line.startsWith('SUMMARY:')) title = line.slice(8).trim();
                if (line.startsWith('DTSTART')) dtstart = line.split(':').pop()?.trim() || '';
                if (line.startsWith('DTEND')) dtend = line.split(':').pop()?.trim() || '';
                if (line.startsWith('DESCRIPTION:')) description = line.slice(12).trim();
                if (line.startsWith('LOCATION:')) location = line.slice(9).trim();
                if (line.startsWith('UID:')) uid = line.slice(4).trim();
              }
              if (title && dtstart) {
                const sd = parseICalDate(dtstart);
                const ed = dtend ? parseICalDate(dtend) : new Date(sd.getTime() + 30 * 60000);
                const diffMin = Math.round((ed.getTime() - sd.getTime()) / 60000);
                let durationStr: string;
                if (diffMin >= 120) durationStr = `${diffMin / 60} hours`;
                else if (diffMin >= 60) durationStr = `${diffMin / 60} hour`;
                else durationStr = `${diffMin} min`;
                const hours = sd.getHours();
                const minutes = sd.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hour12 = hours % 12 || 12;
                calEvents.push({
                  id: uid || `caldav-${obj.url}`,
                  title,
                  date: sd.toISOString().split('T')[0],
                  time: `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`,
                  duration: durationStr,
                  type: categorizeEventType(title),
                  description: description || undefined,
                  location: location || undefined,
                  status: 'upcoming',
                  source: 'caldav',
                });
              }
            }
          }
        } catch (err: any) {
          console.error('[Calendar] CalDAV today fetch error:', err?.message);
        }
      }
    } else {
      try {
        const connected = await googleCalendar.checkCalendarConnection();
        if (connected) {
          const gEvents = await googleCalendar.getTodaysEvents();
          calEvents = gEvents.map(googleEventToUnified);
        }
      } catch {
        // Silently ignore
      }
    }

    // Dedupe
    const dbGoogleIds = new Set(
      todayDb.filter((e) => e.googleEventId).map((e) => e.googleEventId)
    );
    const uniqueCalEvents = calEvents.filter(
      (ce) => !dbGoogleIds.has(ce.googleEventId)
    );

    const allEvents = [...todayDb, ...uniqueCalEvents].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    res.json({ events: allEvents });
  } catch (error: any) {
    console.error("[Calendar] Error fetching today's events:", error);
    res.status(500).json({ error: "Failed to fetch today's events" });
  }
});

export default router;
