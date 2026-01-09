import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  connectionSettings = null;
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  if (!hostname) {
    console.log('Google Calendar integration: REPLIT_CONNECTORS_HOSTNAME not available');
    throw new Error('Google Calendar connector not available in this environment');
  }
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.log('Google Calendar integration: Neither REPL_IDENTITY nor WEB_REPL_RENEWAL available');
    throw new Error('Google Calendar connector token not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

async function getUncachableCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function checkCalendarConnection(): Promise<boolean> {
  try {
    await getAccessToken();
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
  const calendar = await getUncachableCalendarClient();
  
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
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    if (!hostname) return null;
    
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;
    
    if (!xReplitToken) return null;
    
    const settings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);
    
    return settings?.settings?.email || settings?.settings?.oauth?.email || null;
  } catch {
    return null;
  }
}
