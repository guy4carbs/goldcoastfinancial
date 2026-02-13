/**
 * CALENDAR BRIDGE
 * Connects agent appointment events to Google Calendar.
 */

import { eventBus, EventType } from '../core';

// Dynamic import
let calendarModule: any = null;

async function getCalendar() {
  if (!calendarModule) {
    calendarModule = await import('../../googleCalendar');
  }
  return calendarModule;
}

export class CalendarBridge {
  private pollInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async start() {
    if (this.isRunning) return;

    console.log('[CALENDAR-BRIDGE] Starting Calendar bridge...');
    this.isRunning = true;

    // Listen for appointment booking requests
    eventBus.on(EventType.APPOINTMENT_BOOKED, 'calendar-bridge', async (event) => {
      await this.handleAppointmentBooked(event.payload);
    });

    // Poll for upcoming appointments every minute to send reminders
    this.pollInterval = setInterval(() => this.checkUpcomingAppointments(), 60000);

    // Initial check
    await this.checkCalendarConnection();

    console.log('[CALENDAR-BRIDGE] ✅ Calendar bridge active');
  }

  async stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('[CALENDAR-BRIDGE] Stopped');
  }

  private async checkCalendarConnection() {
    try {
      const calendar = await getCalendar();
      const connected = await calendar.checkCalendarConnection();

      if (connected) {
        const email = await calendar.getConnectedEmail();
        console.log(`[CALENDAR-BRIDGE] Connected to calendar: ${email}`);
      } else {
        console.log('[CALENDAR-BRIDGE] Calendar not connected (optional)');
      }
    } catch (error) {
      console.log('[CALENDAR-BRIDGE] Calendar integration not available');
    }
  }

  private async handleAppointmentBooked(payload: any) {
    const { leadId, leadName, leadEmail, leadPhone, dateTime, agentId, agentName, notes, type } = payload;

    console.log(`[CALENDAR-BRIDGE] 📅 Appointment request: ${leadName} at ${dateTime}`);

    try {
      const calendar = await getCalendar();
      const connected = await calendar.checkCalendarConnection();

      if (!connected) {
        console.log('[CALENDAR-BRIDGE] Calendar not connected - appointment logged but not synced');
        return;
      }

      // TODO: Create actual Google Calendar event
      // This would use the Google Calendar API to create an event
      console.log(`[CALENDAR-BRIDGE] Would create event: "${type || 'Call'} with ${leadName}" at ${dateTime}`);

      // For now, just emit confirmation
      eventBus.emit({
        id: '',
        type: EventType.METRIC_UPDATED,
        source: 'calendar-bridge',
        timestamp: Date.now(),
        payload: {
          metric: 'appointments_scheduled',
          value: 1,
          leadId,
          agentId,
        },
        metadata: { tier: 3, priority: 'normal' },
      });
    } catch (error: any) {
      console.error('[CALENDAR-BRIDGE] Failed to create calendar event:', error.message);
    }
  }

  private async checkUpcomingAppointments() {
    if (!this.isRunning) return;

    try {
      const calendar = await getCalendar();
      const connected = await calendar.checkCalendarConnection();

      if (!connected) return;

      const events = await calendar.getTodaysEvents();

      // Find events starting in the next 15 minutes
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;

      for (const event of events || []) {
        const eventStart = new Date(event.start?.dateTime || event.start?.date).getTime();
        const timeUntil = eventStart - now;

        if (timeUntil > 0 && timeUntil <= fifteenMinutes) {
          // Emit reminder event
          eventBus.emit({
            id: '',
            type: EventType.HUMAN_REQUIRED,
            source: 'calendar-bridge',
            timestamp: Date.now(),
            payload: {
              type: 'appointment_reminder',
              eventId: event.id,
              title: event.summary,
              startTime: event.start?.dateTime,
              minutesUntil: Math.round(timeUntil / 60000),
            },
            metadata: { tier: 3, priority: 'high' },
          });
        }
      }
    } catch (error) {
      // Silently handle - calendar may not be connected
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
    };
  }
}

export const calendarBridge = new CalendarBridge();
