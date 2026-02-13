/**
 * APPOINTMENT_AGENT
 * Auto-books calls, sends reminders, recovers no-shows.
 */

import { BaseAgent, EventType, AgentEvent, memoryGraph, LeadData, NodeType, EdgeType, analyticsLedger, MetricType } from '../core';

interface Appointment {
  id: string;
  leadId: string;
  scheduledAt: number;
  duration: number; // minutes
  type: 'discovery' | 'presentation' | 'closing' | 'follow_up';
  status: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled' | 'rescheduled';
  remindersSent: number;
  notes?: string;
  createdAt: number;
}

export class AppointmentAgent extends BaseAgent {
  private appointments: Map<string, Appointment> = new Map();
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      id: 'appointment',
      name: 'APPOINTMENT_AGENT',
      tier: 3,
      description: 'Auto-books, reminds, and recovers no-shows',
      capabilities: ['booking', 'reminders', 'no_show_recovery', 'calendar_sync'],
      consumesEvents: [EventType.INBOUND_QUALIFIED, EventType.SMS_RESPONSE_RECEIVED, EventType.CALL_CONNECTED],
      producesEvents: [EventType.APPOINTMENT_BOOKED],
    });
  }

  protected async onStart(): Promise<void> {
    // Check for upcoming appointments and no-shows every minute
    this.reminderInterval = setInterval(() => this.processReminders(), 60000);
  }

  protected async onStop(): Promise<void> {
    if (this.reminderInterval) clearInterval(this.reminderInterval);
  }

  protected async handleEvent(event: AgentEvent): Promise<void> {
    if (event.type === EventType.INBOUND_QUALIFIED) {
      // Auto-suggest appointment for qualified leads
      if (event.payload.qualification?.qualified) {
        console.log(`[APPOINTMENT] 📅 Qualified lead ${event.payload.firstName} — ready for booking`);
      }
    }
    if (event.type === EventType.SMS_RESPONSE_RECEIVED) {
      if (event.payload.intent === 'schedule' || event.payload.intent === 'call_request') {
        await this.bookAppointment(event.payload.leadId, 'discovery');
      }
    }
  }

  async bookAppointment(
    leadId: string,
    type: Appointment['type'],
    scheduledAt?: number,
    duration: number = 30
  ): Promise<Appointment> {
    const node = this.memory.getNode<LeadData>(leadId);

    // Default: next available slot (simplified — in production, check calendar)
    const time = scheduledAt || this.getNextAvailableSlot();

    const appointment: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      scheduledAt: time,
      duration,
      type,
      status: 'scheduled',
      remindersSent: 0,
      createdAt: Date.now(),
    };

    this.appointments.set(appointment.id, appointment);

    // Create appointment node in memory graph
    const apptNode = this.memory.addNode(
      NodeType.APPOINTMENT,
      appointment,
      this.id,
      [type]
    );

    // Link to lead
    this.memory.addEdge(EdgeType.HAS_APPOINTMENT, leadId, apptNode.id, this.id);

    // Update lead
    this.memory.updateNode(leadId, {
      stage: 'appointment' as const,
      nextFollowUpAt: time,
    }, this.id);

    // Emit
    this.emit(EventType.APPOINTMENT_BOOKED, {
      appointmentId: appointment.id,
      leadId,
      type,
      scheduledAt: time,
      firstName: node?.data.firstName,
      lastName: node?.data.lastName,
    }, {
      metadata: { tier: 3, priority: 'high' },
    });

    analyticsLedger.record(MetricType.FUNNEL_APPOINTMENT_SET, 1, this.id, { entityId: leadId });

    const dateStr = new Date(time).toLocaleString();
    console.log(`[APPOINTMENT] ✅ Booked: ${node?.data.firstName} ${node?.data.lastName} | ${type} | ${dateStr}`);

    return appointment;
  }

  private processReminders(): void {
    const now = Date.now();

    this.appointments.forEach((appt) => {
      if (appt.status !== 'scheduled' && appt.status !== 'confirmed') return;

      const timeUntil = appt.scheduledAt - now;

      // 24-hour reminder
      if (timeUntil <= 86400000 && timeUntil > 82800000 && appt.remindersSent < 1) {
        this.sendReminder(appt, '24h');
        appt.remindersSent++;
      }

      // 1-hour reminder
      if (timeUntil <= 3600000 && timeUntil > 3000000 && appt.remindersSent < 2) {
        this.sendReminder(appt, '1h');
        appt.remindersSent++;
      }

      // No-show detection (15 min past appointment)
      if (timeUntil < -900000 && appt.status === 'scheduled') {
        appt.status = 'no_show';
        this.handleNoShow(appt);
      }
    });
  }

  private sendReminder(appt: Appointment, timing: string): void {
    const node = this.memory.getNode<LeadData>(appt.leadId);
    console.log(`[APPOINTMENT] 🔔 ${timing} reminder sent to ${node?.data.firstName || 'lead'}`);
  }

  private handleNoShow(appt: Appointment): void {
    const node = this.memory.getNode<LeadData>(appt.leadId);
    console.log(`[APPOINTMENT] ❌ No-show: ${node?.data.firstName || 'lead'} — initiating recovery`);

    // Re-queue for outreach
    this.emit(EventType.LEAD_SCORED, {
      leadId: appt.leadId,
      heatScore: 60,
      urgency: 'high',
      recommendedPath: 'priority_outreach',
      reason: 'no_show_recovery',
    });
  }

  private getNextAvailableSlot(): number {
    // Simplified: next business hour
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    if (now.getHours() >= 18) {
      now.setDate(now.getDate() + 1);
      now.setHours(9);
    }
    if (now.getHours() < 9) now.setHours(9);
    return now.getTime();
  }

  getUpcoming(hours: number = 24): Appointment[] {
    const cutoff = Date.now() + hours * 3600000;
    return Array.from(this.appointments.values())
      .filter((a) => a.status === 'scheduled' && a.scheduledAt <= cutoff)
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  }
}
