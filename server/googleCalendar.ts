import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

// Set credentials if refresh token is available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

async function getCalendarClient() {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google Calendar not configured: GOOGLE_REFRESH_TOKEN is not set.');
  }

  // Refresh access token if needed
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function checkCalendarConnection(): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_REFRESH_TOKEN) return false;
    await getCalendarClient();
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
  const description = (event.description || '').toLowerCase();

  if (title.includes('call') || title.includes('phone')) return 'call';
  if (title.includes('training') || title.includes('onboarding')) return 'training';
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
  const calendar = await getCalendarClient();

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
    if (!process.env.GOOGLE_REFRESH_TOKEN) return null;

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const userInfo = await oauth2.userinfo.get();
    return userInfo.data.email || null;
  } catch {
    return null;
  }
}
