/**
 * Google Calendar Integration
 * Uses standard OAuth2 with refresh token (same credentials as Gmail)
 * Supports: read events, create events, check connection
 */
import { google } from 'googleapis';

function getCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar not configured — missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function checkCalendarConnection(): Promise<boolean> {
  try {
    const calendar = getCalendarClient();
    await calendar.calendarList.list({ maxResults: 1 });
    return true;
  } catch {
    return false;
  }
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  meetLink?: string;
  status: string;
  type: 'meeting' | 'call' | 'event' | 'deadline' | 'training' | 'review';
}

function categorizeEvent(event: any): CalendarEvent['type'] {
  const title = (event.summary || '').toLowerCase();

  if (title.includes('call') || title.includes('phone')) return 'call';
  if (title.includes('training') || title.includes('onboarding') || title.includes('1:1') || title.includes('coaching')) return 'training';
  if (title.includes('review') || title.includes('assessment')) return 'review';
  if (title.includes('deadline') || title.includes('due')) return 'deadline';
  if (event.conferenceData || title.includes('meeting') || title.includes('standup') || title.includes('sync')) return 'meeting';
  return 'event';
}

export async function getCalendarEvents(
  timeMin?: Date,
  timeMax?: Date,
  maxResults: number = 50
): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();

  const now = new Date();
  const defaultTimeMin = timeMin || new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTimeMax = timeMax || new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: defaultTimeMin.toISOString(),
    timeMax: defaultTimeMax.toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];

  return events.map((event: any) => ({
    id: event.id || '',
    title: event.summary || '(No title)',
    description: event.description || undefined,
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    allDay: !event.start?.dateTime,
    location: event.location || undefined,
    attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || [],
    meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || undefined,
    status: event.status || 'confirmed',
    type: categorizeEvent(event),
  }));
}

export async function getTodaysEvents(): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return getCalendarEvents(startOfDay, endOfDay, 20);
}

export async function getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return getCalendarEvents(now, endDate, 30);
}

export async function getConnectedEmail(): Promise<string | null> {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.calendarList.get({ calendarId: 'primary' });
    return response.data.id || null;
  } catch {
    return null;
  }
}

/**
 * Create a calendar event (e.g., for training sessions)
 */
export async function createCalendarEvent(data: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails?: string[];
  location?: string;
}): Promise<string | null> {
  try {
    const calendar = getCalendarClient();

    const event: any = {
      summary: data.title,
      description: data.description,
      start: { dateTime: data.startTime.toISOString(), timeZone: 'America/Chicago' },
      end: { dateTime: data.endTime.toISOString(), timeZone: 'America/Chicago' },
    };

    if (data.attendeeEmails?.length) {
      event.attendees = data.attendeeEmails.map(email => ({ email }));
    }

    if (data.location) {
      event.location = data.location;
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data.id || null;
  } catch (err: any) {
    console.error('[GoogleCalendar] Failed to create event:', err?.message);
    return null;
  }
}
