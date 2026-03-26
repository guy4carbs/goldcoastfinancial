import Telnyx from 'telnyx';

/**
 * SMS Service
 * Handles SMS sending via Telnyx for 2FA backup and notifications
 */

let telnyxClient: InstanceType<typeof Telnyx> | null = null;

/**
 * Get the Telnyx client instance
 */
function getClient(): InstanceType<typeof Telnyx> | null {
  if (telnyxClient) return telnyxClient;

  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    console.warn('[SMS] TELNYX_API_KEY not configured');
    return null;
  }

  try {
    telnyxClient = new Telnyx({ apiKey });
    console.log('[SMS] Telnyx client initialized');
    return telnyxClient;
  } catch (error: any) {
    console.error('[SMS] Failed to initialize Telnyx:', error.message);
    return null;
  }
}

/**
 * Get the Telnyx SMS "from" phone number
 */
function getFromNumber(): string | null {
  return process.env.TELNYX_SMS_FROM || null;
}

/**
 * Check if SMS service is available
 */
export function isSmsAvailable(): boolean {
  return getClient() !== null && getFromNumber() !== null;
}

// =============================================================================
// SMS SENDING
// =============================================================================

export interface SmsResult {
  success: boolean;
  messageId?: string;
  from?: string;
  to?: string;
  status?: string;
  error?: string;
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }

  if (digits.length === 10) {
    return '+1' + digits;
  }

  return phone.startsWith('+') ? phone : '+' + digits;
}

/**
 * Send an SMS message via Telnyx
 */
export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const client = getClient();
  const from = getFromNumber();

  if (!client || !from) {
    console.warn('[SMS] SMS service not available');
    return { success: false, error: 'SMS service not configured' };
  }

  const formattedTo = formatPhoneNumber(to);

  try {
    const response = await client.messages.send({
      from,
      to: formattedTo,
      text: message,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    });

    const messageId = (response.data as any)?.id || '';
    const initialStatus = (response.data as any)?.to?.[0]?.status || 'queued';

    console.log(`[SMS] Message sent to ${formattedTo}: ${messageId}`);
    return {
      success: true,
      messageId,
      from,
      to: formattedTo,
      status: initialStatus,
    };
  } catch (error: any) {
    console.error(`[SMS] Failed to send message to ${formattedTo}:`, error.message);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// 2FA CODES
// =============================================================================

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send a 2FA verification code via SMS
 */
export async function send2FACode(phone: string, code: string): Promise<SmsResult> {
  const message = `Your Heritage Life Solutions verification code is: ${code}. This code expires in 5 minutes.`;
  return sendSms(phone, message);
}

/**
 * Send a phone verification code (for account setup)
 */
export async function sendPhoneVerification(phone: string, code: string): Promise<SmsResult> {
  const message = `Your Heritage Life Solutions phone verification code is: ${code}. This code expires in 10 minutes.`;
  return sendSms(phone, message);
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

/**
 * Send an appointment reminder via SMS
 */
export async function sendAppointmentReminder(
  phone: string,
  appointmentTitle: string,
  time: string
): Promise<SmsResult> {
  const message = `Heritage Life: Reminder - "${appointmentTitle}" at ${time}. Reply STOP to opt out.`;
  return sendSms(phone, message);
}

/**
 * Send a lead notification to an agent
 */
export async function sendNewLeadNotification(
  phone: string,
  leadName: string
): Promise<SmsResult> {
  const message = `Heritage Life: New lead assigned - ${leadName}. Log in to view details.`;
  return sendSms(phone, message);
}

/**
 * Send a policy status update
 */
export async function sendPolicyUpdate(
  phone: string,
  policyNumber: string,
  status: string
): Promise<SmsResult> {
  const message = `Heritage Life: Your policy ${policyNumber} has been ${status}. Log in to view details.`;
  return sendSms(phone, message);
}

/**
 * Send a secure form link via SMS
 */
export async function sendSecureFormLink(
  phone: string,
  clientName: string,
  link: string
): Promise<SmsResult> {
  const message = `Hi ${clientName}! Please complete your Heritage Life secure form: ${link} (expires in 24 hours)`;
  return sendSms(phone, message);
}

/**
 * Send a booking link via SMS
 */
export async function sendBookingLink(
  phone: string,
  customerName: string,
  agentName: string,
  link: string
): Promise<SmsResult> {
  const message = `Hi ${customerName}! Book your appointment with ${agentName} at Heritage Life: ${link}`;
  return sendSms(phone, message);
}

// =============================================================================
// BULK SENDING
// =============================================================================

interface BulkSmsResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{ phone: string } & SmsResult>;
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSms(
  recipients: string[],
  message: string,
  delayMs: number = 100
): Promise<BulkSmsResult> {
  const results: BulkSmsResult = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    results: [],
  };

  for (const phone of recipients) {
    const result = await sendSms(phone, message);
    results.results.push({ phone, ...result });

    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
    }

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// =============================================================================
// PHONE NUMBER VALIDATION
// =============================================================================

/**
 * Validate a phone number using E.164 format check
 */
export async function validatePhoneNumber(phone: string): Promise<{
  valid: boolean;
  formatted?: string;
  error?: string;
}> {
  try {
    const formatted = formatPhoneNumber(phone);
    const isValid = /^\+[1-9]\d{1,14}$/.test(formatted.replace(/\s/g, ''));
    return { valid: isValid, formatted: isValid ? formatted : undefined };
  } catch (error: any) {
    console.error('[SMS] Phone validation failed:', error.message);
    return { valid: false, error: error.message };
  }
}

export default {
  isSmsAvailable,
  sendSms,
  generateVerificationCode,
  send2FACode,
  sendPhoneVerification,
  sendAppointmentReminder,
  sendNewLeadNotification,
  sendPolicyUpdate,
  sendSecureFormLink,
  sendBookingLink,
  sendBulkSms,
  validatePhoneNumber,
};
