/**
 * Microsoft Outlook Calendar Integration (Microsoft Graph API)
 * Uses MSAL for OAuth2 and Microsoft Graph Client for API calls.
 * Mirrors the pattern of server/googleCalendar.ts for Google Calendar.
 *
 * Requires env vars: MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID (optional, defaults to 'common')
 *
 * Governance: Conduit (integrations)
 */

import { ConfidentialClientApplication, type Configuration } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';

// ─── IANA → Windows Timezone Mapping ───
// Microsoft Graph API requires Windows timezone names, not IANA identifiers.

const IANA_TO_WINDOWS_TZ: Record<string, string> = {
  'America/New_York': 'Eastern Standard Time',
  'America/Chicago': 'Central Standard Time',
  'America/Denver': 'Mountain Standard Time',
  'America/Los_Angeles': 'Pacific Standard Time',
  'America/Phoenix': 'US Mountain Standard Time',
  'America/Anchorage': 'Alaskan Standard Time',
  'Pacific/Honolulu': 'Hawaiian Standard Time',
  'US/Eastern': 'Eastern Standard Time',
  'US/Central': 'Central Standard Time',
  'US/Mountain': 'Mountain Standard Time',
  'US/Pacific': 'Pacific Standard Time',
  'UTC': 'UTC',
};

function toWindowsTimezone(iana?: string): string {
  if (!iana) return 'Central Standard Time';
  return IANA_TO_WINDOWS_TZ[iana] || 'Central Standard Time';
}

// ─── Types ───

export interface OutlookEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  body?: { contentType: string; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  attendees?: Array<{ emailAddress: { name?: string; address: string } }>;
  isAllDay?: boolean;
  webLink?: string;
  onlineMeeting?: { joinUrl?: string };
  onlineMeetingUrl?: string;
  isCancelled?: boolean;
  showAs?: string;
}

export interface UnifiedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'call' | 'meeting' | 'video' | 'event' | 'training';
  description?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  location?: string;
  meetingLink?: string;
  googleEventId?: string;
  outlookEventId?: string;
  meetingNotes?: string;
  source: 'local' | 'google' | 'caldav' | 'outlook';
}

// ─── MSAL Configuration ───

const SCOPES = ['Calendars.ReadWrite', 'User.Read', 'offline_access'];

function getMsalConfig(): Configuration {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft Calendar not configured — missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET');
  }

  return {
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  };
}

function createMsalApp(): ConfidentialClientApplication {
  return new ConfidentialClientApplication(getMsalConfig());
}

function getRedirectUri(): string {
  const appUrl = process.env.APP_URL || 'http://localhost:4500';
  return `${appUrl}/api/calendar/callback/outlook`;
}

/**
 * Create an authenticated Microsoft Graph client from an access token.
 */
function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// ─── OAuth Functions ───

/**
 * Generate Microsoft OAuth consent URL.
 * Redirects user to Microsoft login with calendar permissions.
 */
export async function getOutlookAuthUrl(agentUserId: string): Promise<string> {
  const pca = createMsalApp();
  const authUrl = await pca.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: getRedirectUri(),
    state: agentUserId,
    prompt: 'consent',
  });
  return authUrl;
}

/**
 * Exchange authorization code for tokens.
 * Returns access token, refresh token, expiration, and user email.
 */
export async function exchangeOutlookCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  email: string;
}> {
  const pca = createMsalApp();
  const response = await pca.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: getRedirectUri(),
  });

  if (!response) {
    throw new Error('Failed to acquire token from Microsoft');
  }

  const accessToken = response.accessToken;
  // MSAL Node doesn't directly expose refresh_token in the response object;
  // it's managed internally in the token cache. We extract it from the cache.
  let refreshToken: string | null = null;
  try {
    const cache = pca.getTokenCache().serialize();
    const cacheData = JSON.parse(cache);
    const refreshTokens = cacheData.RefreshToken || {};
    const firstKey = Object.keys(refreshTokens)[0];
    if (firstKey) {
      refreshToken = refreshTokens[firstKey].secret || null;
    }
  } catch {
    console.warn('[OutlookCalendar] Could not extract refresh token from cache');
  }

  const expiresAt = response.expiresOn ? new Date(response.expiresOn) : null;

  // Get user email from the token claims or via Graph API
  let email = '';
  if (response.account?.username) {
    email = response.account.username;
  } else {
    // Fallback: query Graph API for user profile
    try {
      const client = createGraphClient(accessToken);
      const me = await client.api('/me').select('mail,userPrincipalName').get();
      email = me.mail || me.userPrincipalName || '';
    } catch (err: any) {
      console.warn('[OutlookCalendar] Could not fetch user email:', err?.message);
    }
  }

  return { accessToken, refreshToken, expiresAt, email };
}

/**
 * Refresh an expired access token using a refresh token.
 */
export async function refreshOutlookToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}> {
  const pca = createMsalApp();

  // MSAL Node's acquireTokenByRefreshToken is available but marked as for migration scenarios.
  // For production use, it's the correct approach when managing tokens externally.
  const response = await (pca as any).acquireTokenByRefreshToken({
    refreshToken,
    scopes: SCOPES,
  });

  if (!response) {
    throw new Error('Failed to refresh Microsoft token');
  }

  // Extract new refresh token from cache if rotated
  let newRefreshToken: string | null = null;
  try {
    const cache = pca.getTokenCache().serialize();
    const cacheData = JSON.parse(cache);
    const refreshTokens = cacheData.RefreshToken || {};
    const firstKey = Object.keys(refreshTokens)[0];
    if (firstKey) {
      newRefreshToken = refreshTokens[firstKey].secret || null;
    }
  } catch {
    // Keep existing refresh token
  }

  return {
    accessToken: response.accessToken,
    refreshToken: newRefreshToken,
    expiresAt: response.expiresOn ? new Date(response.expiresOn) : null,
  };
}

// ─── Calendar CRUD Functions ───

/**
 * Fetch calendar events from Microsoft Graph API.
 * Uses /me/calendarview with pagination support.
 */
export async function getOutlookCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<OutlookEvent[]> {
  const client = createGraphClient(accessToken);
  const events: OutlookEvent[] = [];

  const startDateTime = timeMin.toISOString();
  const endDateTime = timeMax.toISOString();

  let nextLink: string | null = null;
  let isFirst = true;

  while (isFirst || nextLink) {
    isFirst = false;

    let response: any;
    if (nextLink) {
      // Follow @odata.nextLink for pagination
      response = await client.api(nextLink).get();
    } else {
      response = await client
        .api('/me/calendarview')
        .header('Prefer', 'outlook.timezone="UTC"')
        .query({
          startDateTime,
          endDateTime,
        })
        .select('id,subject,bodyPreview,body,start,end,location,attendees,isAllDay,webLink,onlineMeeting,onlineMeetingUrl,showAs,isCancelled')
        .top(100)
        .orderby('start/dateTime')
        .get();
    }

    if (response.value) {
      events.push(...response.value);
    }

    nextLink = response['@odata.nextLink'] || null;

    // Safety: don't fetch more than 500 events
    if (events.length >= 500) break;
  }

  return events;
}

/**
 * Create an event in the user's Outlook calendar.
 * Returns the Microsoft Graph event ID.
 */
export async function createOutlookCalendarEvent(
  accessToken: string,
  event: {
    title: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail?: string;
    timezone?: string;
  }
): Promise<string> {
  const client = createGraphClient(accessToken);

  const graphEvent: any = {
    subject: event.title,
    start: {
      dateTime: event.startTime.toISOString().replace('Z', ''),
      timeZone: toWindowsTimezone(event.timezone),
    },
    end: {
      dateTime: event.endTime.toISOString().replace('Z', ''),
      timeZone: toWindowsTimezone(event.timezone),
    },
  };

  if (event.description) {
    graphEvent.body = {
      contentType: 'text',
      content: event.description,
    };
  }

  if (event.location) {
    graphEvent.location = {
      displayName: event.location,
    };
  }

  if (event.attendeeEmail) {
    graphEvent.attendees = [
      {
        emailAddress: { address: event.attendeeEmail },
        type: 'required',
      },
    ];
  }

  const created = await client.api('/me/events').post(graphEvent);
  return created.id;
}

/**
 * Update an existing event in the user's Outlook calendar.
 */
export async function updateOutlookCalendarEvent(
  accessToken: string,
  eventId: string,
  event: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
    attendeeEmail?: string;
    timezone?: string;
  }
): Promise<void> {
  const client = createGraphClient(accessToken);

  const graphUpdate: any = {};

  if (event.title) {
    graphUpdate.subject = event.title;
  }

  if (event.description !== undefined) {
    graphUpdate.body = {
      contentType: 'text',
      content: event.description || '',
    };
  }

  if (event.location !== undefined) {
    graphUpdate.location = {
      displayName: event.location || '',
    };
  }

  if (event.startTime) {
    graphUpdate.start = {
      dateTime: event.startTime.toISOString().replace('Z', ''),
      timeZone: toWindowsTimezone(event.timezone),
    };
  }

  if (event.endTime) {
    graphUpdate.end = {
      dateTime: event.endTime.toISOString().replace('Z', ''),
      timeZone: toWindowsTimezone(event.timezone),
    };
  }

  if (event.attendeeEmail) {
    graphUpdate.attendees = [
      {
        emailAddress: { address: event.attendeeEmail },
        type: 'required',
      },
    ];
  }

  await client.api(`/me/events/${eventId}`).patch(graphUpdate);
}

/**
 * Delete an event from the user's Outlook calendar.
 */
export async function deleteOutlookCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const client = createGraphClient(accessToken);
  await client.api(`/me/events/${eventId}`).delete();
}

// ─── Conversion Helpers ───

/**
 * Categorize event title into type for unified display.
 */
function categorizeEventType(title: string): UnifiedEvent['type'] {
  const lower = title.toLowerCase();
  if (lower.includes('call') || lower.includes('phone')) return 'call';
  if (lower.includes('video') || lower.includes('zoom') || lower.includes('meet') || lower.includes('teams')) return 'video';
  if (lower.includes('training') || lower.includes('onboarding') || lower.includes('workshop')) return 'training';
  if (lower.includes('meeting') || lower.includes('review') || lower.includes('1:1') || lower.includes('1-on-1')) return 'meeting';
  return 'event';
}

/**
 * Convert a Microsoft Graph event to our UnifiedEvent format.
 */
export function outlookEventToUnified(graphEvent: OutlookEvent): UnifiedEvent {
  // Graph returns dateTime in ISO 8601 format, e.g. "2026-04-05T10:00:00.0000000"
  const startStr = graphEvent.start?.dateTime || '';
  const endStr = graphEvent.end?.dateTime || '';

  // Parse dates — Graph calendarview returns in the calendar's timezone
  const startDate = new Date(startStr.endsWith('Z') ? startStr : startStr + 'Z');
  const endDate = new Date(endStr.endsWith('Z') ? endStr : endStr + 'Z');

  // If the timeZone is specified and isn't UTC, we need to handle it.
  // For simplicity, we use the raw datetime string for display since calendarview
  // returns times in the user's preferred timezone.
  const isAllDay = graphEvent.isAllDay || false;

  // Format date as YYYY-MM-DD
  // Use the raw datetime string to avoid timezone conversion issues
  const dateStr = startStr.split('T')[0];

  // Format time as h:mm AM/PM
  let timeStr = 'All Day';
  if (!isAllDay) {
    const timePart = startStr.split('T')[1] || '00:00:00';
    const [hourStr, minStr] = timePart.split(':');
    const hours = parseInt(hourStr) || 0;
    const minutes = parseInt(minStr) || 0;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // Calculate duration
  let durationStr: string;
  if (isAllDay) {
    durationStr = 'All day';
  } else {
    const diffMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    if (diffMin >= 120) durationStr = `${diffMin / 60} hours`;
    else if (diffMin >= 60) durationStr = `${diffMin / 60} hour`;
    else durationStr = `${diffMin} min`;
  }

  // Determine meeting link
  const meetingLink =
    graphEvent.onlineMeeting?.joinUrl ||
    graphEvent.onlineMeetingUrl ||
    graphEvent.webLink ||
    undefined;

  return {
    id: `outlook-${graphEvent.id}`,
    title: graphEvent.subject || '(No title)',
    date: dateStr,
    time: timeStr,
    duration: durationStr,
    type: categorizeEventType(graphEvent.subject || ''),
    description: graphEvent.bodyPreview || undefined,
    status: graphEvent.isCancelled ? 'cancelled' : 'upcoming',
    location: graphEvent.location?.displayName || undefined,
    meetingLink,
    outlookEventId: graphEvent.id,
    source: 'outlook',
  };
}
