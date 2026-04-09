/**
 * CalDAV Helper Module
 * RFC 5545-aware iCal parsing and CalDAV client utilities.
 * Mirrors the pattern of server/googleCalendar.ts for Google Calendar.
 *
 * Governance: Forge (backend) + Conduit (integrations)
 */

// ─── Types ───

export interface ParsedICalEvent {
  uid: string;
  summary: string;
  dtstart: string;       // raw iCal date value (e.g. "20260405T090000")
  dtend?: string;        // raw iCal date value
  tzid?: string;         // timezone if present (e.g. "America/Chicago")
  description?: string;
  location?: string;
  status?: string;
  rrule?: string;        // recurrence rule for future use
  isAllDay: boolean;
}

/** The UnifiedEvent shape used by calendar.ts routes */
export interface UnifiedEvent {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD
  time: string;          // "h:mm AM/PM"
  duration: string;      // "30 min", "1 hour"
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

// ─── RFC 5545 iCal Parser ───

/**
 * Unfold continuation lines per RFC 5545 §3.1:
 * Long lines are folded by inserting CRLF followed by a single whitespace character (space or tab).
 * This function joins them back into logical lines.
 */
function unfoldLines(raw: string): string[] {
  // Normalize line endings to \n, then unfold lines that start with space or tab
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // RFC 5545: a CRLF followed by a single space or tab is a continuation
  const unfolded = normalized.replace(/\n[ \t]/g, '');
  return unfolded.split('\n').filter((line) => line.length > 0);
}

/**
 * Parse a single iCal property line into name, params, and value.
 * Format: PROPNAME;PARAM1=VAL1;PARAM2=VAL2:PROPVALUE
 *
 * The property value is everything after the FIRST colon that is not inside parameter values.
 * Example: DTSTART;TZID=America/Chicago:20260405T090000
 *   → name: "DTSTART", params: { TZID: "America/Chicago" }, value: "20260405T090000"
 */
function parsePropertyLine(line: string): { name: string; params: Record<string, string>; value: string } {
  // Find the boundary between params and value.
  // The colon that separates params from value is the first colon that is NOT inside a quoted param value.
  let inQuote = false;
  let colonIdx = -1;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ':' && !inQuote) {
      colonIdx = i;
      break;
    }
  }

  if (colonIdx === -1) {
    // No colon found — treat entire line as name with empty value
    return { name: line.trim(), params: {}, value: '' };
  }

  const nameAndParams = line.slice(0, colonIdx);
  const value = line.slice(colonIdx + 1);

  // Split name from params by semicolon
  const parts = nameAndParams.split(';');
  const name = (parts[0] || '').trim().toUpperCase();
  const params: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const eqIdx = parts[i].indexOf('=');
    if (eqIdx !== -1) {
      const pName = parts[i].slice(0, eqIdx).trim().toUpperCase();
      let pValue = parts[i].slice(eqIdx + 1).trim();
      // Strip surrounding quotes if present
      if (pValue.startsWith('"') && pValue.endsWith('"')) {
        pValue = pValue.slice(1, -1);
      }
      params[pName] = pValue;
    }
  }

  return { name, params, value };
}

/**
 * Unescape iCal text values per RFC 5545 §3.3.11:
 * \\n or \\N → newline, \\, → comma, \\\\ → backslash, \\; → semicolon
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse raw iCal/VCALENDAR data into an array of ParsedICalEvent objects.
 * Handles: line unfolding, TZID params, VALUE=DATE (all-day), escaped chars,
 * and extracts all VEVENT blocks from the data.
 */
export function parseICalData(rawData: string): ParsedICalEvent[] {
  const lines = unfoldLines(rawData);
  const events: ParsedICalEvent[] = [];

  let inEvent = false;
  let uid = '';
  let summary = '';
  let dtstart = '';
  let dtend = '';
  let tzid = '';
  let description = '';
  let location = '';
  let status = '';
  let rrule = '';
  let isAllDay = false;

  for (const line of lines) {
    const { name, params, value } = parsePropertyLine(line);

    if (name === 'BEGIN' && value.toUpperCase() === 'VEVENT') {
      inEvent = true;
      uid = '';
      summary = '';
      dtstart = '';
      dtend = '';
      tzid = '';
      description = '';
      location = '';
      status = '';
      rrule = '';
      isAllDay = false;
      continue;
    }

    if (name === 'END' && value.toUpperCase() === 'VEVENT') {
      inEvent = false;
      if (summary && dtstart) {
        events.push({
          uid,
          summary: unescapeICalText(summary),
          dtstart,
          dtend: dtend || undefined,
          tzid: tzid || undefined,
          description: description ? unescapeICalText(description) : undefined,
          location: location ? unescapeICalText(location) : undefined,
          status: status || undefined,
          rrule: rrule || undefined,
          isAllDay,
        });
      }
      continue;
    }

    if (!inEvent) continue;

    switch (name) {
      case 'UID':
        uid = value.trim();
        break;
      case 'SUMMARY':
        summary = value.trim();
        break;
      case 'DTSTART': {
        dtstart = value.trim();
        // Extract TZID from params if present
        if (params.TZID) {
          tzid = params.TZID;
        }
        // Check for VALUE=DATE (all-day event)
        if (params.VALUE === 'DATE') {
          isAllDay = true;
        }
        // Also detect all-day by format: exactly 8 digits with no T
        if (!params.VALUE && /^\d{8}$/.test(dtstart)) {
          isAllDay = true;
        }
        break;
      }
      case 'DTEND': {
        dtend = value.trim();
        // If DTSTART didn't have TZID but DTEND does, use that
        if (params.TZID && !tzid) {
          tzid = params.TZID;
        }
        break;
      }
      case 'DESCRIPTION':
        description = value.trim();
        break;
      case 'LOCATION':
        location = value.trim();
        break;
      case 'STATUS':
        status = value.trim().toUpperCase();
        break;
      case 'RRULE':
        rrule = value.trim();
        break;
    }
  }

  return events;
}

// ─── Date Parsing ───

/**
 * Parse an iCal date string into a JavaScript Date.
 * Handles:
 *   - YYYYMMDDTHHMMSS (local time)
 *   - YYYYMMDDTHHMMSSZ (UTC)
 *   - YYYYMMDD (all-day, VALUE=DATE)
 *   - Optional TZID parameter (logged but not shifted — JS Date uses local timezone)
 */
export function parseICalDate(ical: string, tzid?: string): Date {
  const clean = ical.replace(/[^0-9TZ]/g, '');

  // Full datetime: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  if (clean.length >= 15 || (clean.length >= 16 && clean.endsWith('Z'))) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const h = clean.slice(9, 11);
    const min = clean.slice(11, 13);
    const sec = clean.length >= 15 ? clean.slice(13, 15) : '00';
    const isUTC = ical.endsWith('Z');

    if (isUTC) {
      return new Date(`${y}-${m}-${d}T${h}:${min}:${sec}Z`);
    }
    // Local time — best we can do without full timezone lib is local interpretation
    return new Date(`${y}-${m}-${d}T${h}:${min}:${sec}`);
  }

  // All-day event: YYYYMMDD
  const digits = clean.replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }

  // Fallback
  return new Date(ical);
}

// ─── Event Type Categorization ───

/**
 * Categorize a CalDAV event title into a unified event type.
 */
export function categorizeEventType(title: string): UnifiedEvent["type"] {
  const lower = title.toLowerCase();
  if (lower.includes('call') || lower.includes('phone')) return 'call';
  if (lower.includes('video') || lower.includes('zoom') || lower.includes('meet') || lower.includes('teams')) return 'video';
  if (lower.includes('training') || lower.includes('onboarding') || lower.includes('workshop')) return 'training';
  if (lower.includes('meeting') || lower.includes('review') || lower.includes('1:1') || lower.includes('1-on-1')) return 'meeting';
  return 'event';
}

// ─── Duration Formatting ───

function formatDuration(diffMin: number): string {
  if (diffMin >= 1440) return 'All day';
  if (diffMin >= 120) return `${diffMin / 60} hours`;
  if (diffMin >= 60) return `${diffMin / 60} hour`;
  return `${diffMin} min`;
}

function formatTime(date: Date, isAllDay: boolean): string {
  if (isAllDay) return 'All Day';
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// ─── DAV Client Factory ───

/**
 * Create and login a DAVClient for CalDAV connections.
 * Uses dynamic import to match existing pattern in calendar.ts.
 */
export async function createDAVClient(conn: {
  caldav_url: string;
  username: string;
  password: string;
}): Promise<any> {
  const { DAVClient } = await import('tsdav');
  const client = new DAVClient({
    serverUrl: conn.caldav_url,
    credentials: { username: conn.username, password: conn.password },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
  await client.login();
  return client;
}

/**
 * Get the first writable VEVENT calendar (for creating events).
 * Skips VTODO (Reminders) and prefers "Home" or the first VEVENT calendar.
 */
export async function getWritableCalendar(client: any): Promise<any | null> {
  const allCalendars = await client.fetchCalendars();
  const eventCalendars = allCalendars.filter((c: any) => {
    const components = c.components || [];
    return components.includes('VEVENT');
  });
  if (eventCalendars.length === 0) return null;
  // Prefer "Home" calendar, then first available
  return eventCalendars.find((c: any) => c.displayName === 'Home') || eventCalendars[0];
}

// ─── Fetch All CalDAV Events ───

/**
 * Fetch events from ALL calendars on a CalDAV account (not just the first one).
 * Returns parsed events with structured logging.
 */
export async function fetchAllCalDAVEvents(
  client: any,
  timeRange: { start: string; end: string },
  logPrefix: string = ''
): Promise<{ events: ParsedICalEvent[]; calendarCount: number; objectUrls: Map<string, string> }> {
  const allCalendars = await client.fetchCalendars();
  // Filter to only VEVENT calendars — skip VTODO (Reminders) and other non-event types
  const calendars = allCalendars.filter((c: any) => {
    const components = c.components || [];
    return components.includes('VEVENT');
  });
  const calNames = calendars.map((c: any) => c.displayName || c.url || '(unnamed)');
  console.log(`${logPrefix}[CalDAV] Found ${allCalendars.length} calendars (${calendars.length} event calendars): ${calNames.join(', ')}`);

  const allEvents: ParsedICalEvent[] = [];
  // Map from UID → object URL (needed for CRUD operations later)
  const objectUrls = new Map<string, string>();

  for (const calendar of calendars) {
    const calName = calendar.displayName || calendar.url || '(unnamed)';
    try {
      // Fetch WITHOUT timeRange — iCloud and some CalDAV servers don't reliably
      // support server-side time-range filtering in REPORT queries.
      // Return ALL events and let the frontend calendar view handle display.
      const calendarObjects = await client.fetchCalendarObjects({ calendar });

      let calEventCount = 0;
      for (const obj of calendarObjects) {
        if (!obj.data) continue;

        const parsed = parseICalData(obj.data);
        for (const ev of parsed) {
          allEvents.push(ev);
          if (ev.uid && obj.url) {
            objectUrls.set(ev.uid, obj.url);
          }
          calEventCount++;
        }
      }

      if (calEventCount > 0) {
        console.log(`${logPrefix}[CalDAV]   Calendar "${calName}": ${calEventCount} events`);
      }
    } catch (err: any) {
      // Some calendars (e.g. subscribed read-only, contact birthdays) may not support REPORT queries
      console.warn(`${logPrefix}[CalDAV]   Calendar "${calName}": skipped (${err?.message || 'unsupported'})`);
    }
  }

  console.log(`${logPrefix}[CalDAV] Total: ${allEvents.length} events from ${calendars.length} calendars`);
  return { events: allEvents, calendarCount: calendars.length, objectUrls };
}

// ─── Convert to UnifiedEvent ───

/**
 * Convert a parsed iCal event to the UnifiedEvent format used by calendar.ts.
 */
export function caldavEventToUnified(parsed: ParsedICalEvent, objUrl?: string): UnifiedEvent {
  const startDate = parseICalDate(parsed.dtstart, parsed.tzid);

  let endDate: Date;
  if (parsed.dtend) {
    endDate = parseICalDate(parsed.dtend, parsed.tzid);
  } else {
    // Default: all-day events span 1 day, timed events default to 30 min
    endDate = parsed.isAllDay
      ? new Date(startDate.getTime() + 24 * 60 * 60000)
      : new Date(startDate.getTime() + 30 * 60000);
  }

  const diffMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  const durationStr = parsed.isAllDay ? 'All day' : formatDuration(diffMin);
  const timeStr = formatTime(startDate, parsed.isAllDay);

  // Map iCal STATUS to unified status
  let status: UnifiedEvent['status'] = 'upcoming';
  if (parsed.status === 'CANCELLED') status = 'cancelled';
  else if (parsed.status === 'COMPLETED') status = 'completed';

  return {
    id: parsed.uid || `caldav-${objUrl || Math.random().toString(36).slice(2)}`,
    title: parsed.summary,
    date: startDate.toISOString().split('T')[0],
    time: timeStr,
    duration: durationStr,
    type: categorizeEventType(parsed.summary),
    description: parsed.description || undefined,
    location: parsed.location || undefined,
    status,
    source: 'caldav',
  };
}

// ─── Build iCal String (for CRUD — Phase 3) ───

/**
 * Generate a valid VCALENDAR/VEVENT iCal string for creating events via CalDAV PUT.
 */
export function buildICalString(event: {
  uid: string;
  summary: string;
  dtstart: Date;
  dtend: Date;
  description?: string;
  location?: string;
}): string {
  const formatDT = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Heritage Life Solutions//CalDAV Client//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatDT(new Date())}Z`,
    `DTSTART;TZID=America/Chicago:${formatDT(event.dtstart)}`,
    `DTEND;TZID=America/Chicago:${formatDT(event.dtend)}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  // RFC 5545 mandates CRLF line endings
  return lines.join('\r\n') + '\r\n';
}
