/**
 * GMAIL BRIDGE
 * Connects agent email events to the actual Gmail service.
 */

import { eventBus, EventType } from '../core';

// Dynamic import to avoid circular dependency
let gmailModule: any = null;

async function getGmail() {
  if (!gmailModule) {
    gmailModule = await import('../../gmail');
  }
  return gmailModule;
}

export class GmailBridge {
  private isRunning = false;

  async start() {
    if (this.isRunning) return;

    console.log('[GMAIL-BRIDGE] Starting Gmail bridge...');
    this.isRunning = true;

    // Listen for outbound email requests from agents
    eventBus.on(EventType.EMAIL_ENGAGED, 'gmail-bridge', async (event) => {
      await this.handleEmailRequest(event.payload);
    });

    // Listen for content that needs to be emailed
    eventBus.on(EventType.CONTENT_CREATED, 'gmail-bridge', async (event) => {
      if (event.payload.deliveryMethod === 'email') {
        await this.handleEmailRequest(event.payload);
      }
    });

    console.log('[GMAIL-BRIDGE] ✅ Gmail bridge active');
  }

  async stop() {
    this.isRunning = false;
    console.log('[GMAIL-BRIDGE] Stopped');
  }

  private async handleEmailRequest(payload: any) {
    const { to, subject, body, templateId, leadId, leadName } = payload;

    if (!to) {
      console.warn('[GMAIL-BRIDGE] No recipient specified');
      return;
    }

    try {
      const gmail = await getGmail();

      // Use the portal message sender
      await gmail.sendPortalMessage({
        to,
        subject: subject || 'Message from Gold Coast Financial Partners',
        body: body || '',
        type: 'lead_outreach',
      });

      console.log(`[GMAIL-BRIDGE] ✅ Email sent to ${to} ${leadName ? `(${leadName})` : ''}`);

      // Emit success event
      eventBus.emit({
        id: '',
        type: EventType.OUTREACH_COMPLETED,
        source: 'gmail-bridge',
        timestamp: Date.now(),
        payload: {
          channel: 'email',
          leadId,
          to,
          success: true,
        },
        metadata: { tier: 2, priority: 'normal' },
      });
    } catch (error: any) {
      console.error(`[GMAIL-BRIDGE] ❌ Failed to send email to ${to}:`, error.message);

      // Emit failure for retry handling
      eventBus.emit({
        id: '',
        type: EventType.AGENT_ERROR,
        source: 'gmail-bridge',
        timestamp: Date.now(),
        payload: {
          error: error.message,
          context: { to, leadId },
        },
        metadata: { tier: 2, priority: 'high' },
      });
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
    };
  }
}

export const gmailBridge = new GmailBridge();
