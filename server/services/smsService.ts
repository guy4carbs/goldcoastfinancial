import twilio from 'twilio';

/**
 * SMS Service
 * Handles SMS sending via Twilio for 2FA backup and notifications
 */

let twilioClient: twilio.Twilio | null = null;

/**
 * Get the Twilio client instance
 */
function getTwilioClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('[SMS] Twilio credentials not configured');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[SMS] Twilio client initialized');
    return twilioClient;
  } catch (error: any) {
    console.error('[SMS] Failed to initialize Twilio:', error.message);
    return null;
  }
}

/**
 * Get the Twilio phone number
 */
function getFromNumber(): string | null {
  return process.env.TWILIO_PHONE_NUMBER || null;
}

/**
 * Check if SMS service is available
 */
export function isSmsAvailable(): boolean {
  return getTwilioClient() !== null && getFromNumber() !== null;
}

// =============================================================================
// SMS SENDING
// =============================================================================

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it starts with 1 and is 11 digits, it's already US format
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return '+1' + digits;
  }

  // Otherwise, return with + prefix if not already there
  return phone.startsWith('+') ? phone : '+' + digits;
}

/**
 * Send an SMS message
 */
export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const client = getTwilioClient();
  const from = getFromNumber();

  if (!client || !from) {
    console.warn('[SMS] SMS service not available');
    return { success: false, error: 'SMS service not configured' };
  }

  const formattedTo = formatPhoneNumber(to);

  try {
    const result = await client.messages.create({
      body: message,
      from,
      to: formattedTo,
    });

    console.log(`[SMS] Message sent to ${formattedTo}: ${result.sid}`);
    return { success: true, messageId: result.sid };
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
  delayMs: number = 100 // Delay between messages to avoid rate limits
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

    // Small delay between messages
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
 * Validate a phone number using Twilio Lookup API
 */
export async function validatePhoneNumber(phone: string): Promise<{
  valid: boolean;
  formatted?: string;
  error?: string;
}> {
  const client = getTwilioClient();
  if (!client) {
    // If Twilio is not configured, do basic validation
    const formatted = formatPhoneNumber(phone);
    const isValid = /^\+?[1-9]\d{1,14}$/.test(formatted.replace(/\s/g, ''));
    return { valid: isValid, formatted: isValid ? formatted : undefined };
  }

  try {
    const lookup = await client.lookups.v2.phoneNumbers(phone).fetch();
    return {
      valid: lookup.valid,
      formatted: lookup.phoneNumber,
    };
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
