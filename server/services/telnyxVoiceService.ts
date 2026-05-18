import Telnyx from 'telnyx';
import { TelnyxWebhook } from 'telnyx/webhooks';

/**
 * Telnyx Voice Service
 * Call Control API + WebRTC credential management for browser-based dialing
 * Telnyx Voice — Call Control API + WebRTC credential management
 */

let telnyxClient: InstanceType<typeof Telnyx> | null = null;

function getClient(): InstanceType<typeof Telnyx> {
  if (telnyxClient) return telnyxClient;
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) throw new Error('[Voice] TELNYX_API_KEY not configured');
  // 15s timeout (Telnyx SDK default is 60s). Cloudflare proxies heritagels.org
  // and returns its own HTML 502 if the origin doesn't respond inside ~100s.
  // A 15s ceiling here means our handler ALWAYS gets a chance to return
  // structured JSON (the catch block in routes/calls.ts maps
  // APIConnectionTimeoutError → code:VOICE_UPSTREAM_UNAVAILABLE) instead
  // of the user seeing CF's opaque "code=UNKNOWN http=502" page.
  telnyxClient = new Telnyx({ apiKey, timeout: 15_000 });
  console.log('[Voice] Telnyx client initialized (timeout 15s)');
  return telnyxClient;
}

/**
 * Check if voice service is available (all required env vars present)
 */
export function isVoiceAvailable(): boolean {
  return !!(
    process.env.TELNYX_API_KEY &&
    process.env.TELNYX_PUBLIC_KEY &&
    process.env.TELNYX_CONNECTION_ID &&
    process.env.TELNYX_DEFAULT_CALLER_ID
  );
}

/**
 * Create a telephony credential for an agent (one-time per agent)
 * Returns the credential ID and SIP username for WebRTC login
 */
export async function createAgentCredential(connectionId: string): Promise<{
  credentialId: string;
  sipUsername: string;
}> {
  const client = getClient();
  const credential = await client.telephonyCredentials.create({
    connection_id: connectionId,
  });
  return {
    credentialId: credential.data?.id as string,
    sipUsername: credential.data?.sip_username as string,
  };
}

/**
 * Generate a WebRTC JWT token for an agent's credential (24h TTL)
 */
export async function generateWebRTCToken(credentialId: string): Promise<string> {
  const client = getClient();
  const token = await client.telephonyCredentials.createToken(credentialId);
  return token as unknown as string;
}

/**
 * Dial an outbound call via Call Control API
 */
export async function dialOutbound(params: {
  to: string;
  from: string;
  connectionId: string;
  webhookUrl: string;
  amd?: boolean;
  clientState?: Record<string, any>;
  record?: boolean;
}): Promise<{ callControlId: string; callLegId: string; callSessionId: string }> {
  const client = getClient();

  const dialParams: any = {
    connection_id: params.connectionId,
    to: formatPhoneNumber(params.to),
    from: params.from,
    webhook_url: params.webhookUrl,
    webhook_url_method: 'POST',
    timeout_secs: 30,
  };

  if (params.clientState) {
    dialParams.client_state = Buffer.from(JSON.stringify(params.clientState)).toString('base64');
  }

  if (params.amd !== false) {
    dialParams.answering_machine_detection = 'premium';
  }

  if (params.record) {
    dialParams.record = 'record-from-answer';
    dialParams.record_channels = 'dual';
    dialParams.record_format = 'mp3';
  }

  const response = await client.calls.dial(dialParams);
  return {
    callControlId: response.data?.call_control_id as string,
    callLegId: response.data?.call_leg_id as string,
    callSessionId: response.data?.call_session_id as string,
  };
}

/**
 * Transfer a call to an agent's WebRTC client (SIP address)
 */
export async function transferToAgent(
  callControlId: string,
  agentSipAddress: string,
  callerNumber: string,
): Promise<void> {
  const client = getClient();
  await client.calls.actions.transfer(callControlId, {
    to: agentSipAddress,
    from: callerNumber,
  });
}

/**
 * Play an audio file on a call (used for voicemail drop)
 */
export async function playbackStart(
  callControlId: string,
  audioUrl: string,
): Promise<void> {
  const client = getClient();
  await client.calls.actions.startPlayback(callControlId, {
    audio_url: audioUrl,
  });
}

/**
 * Start recording a call
 */
export async function recordStart(
  callControlId: string,
  channels: 'single' | 'dual' = 'dual',
): Promise<void> {
  const client = getClient();
  await client.calls.actions.startRecording(callControlId, {
    format: 'mp3',
    channels,
    transcription: true,
    transcription_engine: 'B',
    transcription_language: 'en-US',
  });
}

/**
 * Speak text on a call (TTS — used for recording consent announcement)
 */
export async function speak(
  callControlId: string,
  text: string,
): Promise<void> {
  const client = getClient();
  await client.calls.actions.speak(callControlId, {
    payload: text,
    voice: 'female',
    language: 'en-US',
    service_level: 'premium',
  });
}

/**
 * Hang up a call
 */
export async function hangup(callControlId: string): Promise<void> {
  const client = getClient();
  await client.calls.actions.hangup(callControlId, {});
}

/**
 * Answer an incoming call
 */
export async function answerCall(callControlId: string): Promise<void> {
  const client = getClient();
  await client.calls.actions.answer(callControlId, {});
}

/**
 * Validate Telnyx webhook signature (Ed25519)
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
): Promise<void> {
  const publicKey = process.env.TELNYX_PUBLIC_KEY!;
  const webhook = new TelnyxWebhook(publicKey);
  await webhook.verify(payload, {
    'telnyx-signature-ed25519': signature,
    'telnyx-timestamp': timestamp,
  });
}

/**
 * Search available phone numbers by area code
 */
export async function searchAvailableNumbers(
  areaCode: string,
  limit: number = 10,
): Promise<Array<{ phoneNumber: string; features: string[] }>> {
  const client = getClient();
  const response = await client.availablePhoneNumbers.list({
    filter: {
      country_code: 'US',
      phone_number: { starts_with: `+1${areaCode}` },
      features: ['sms', 'voice'],
      limit,
    },
  });

  return ((response.data || []) as any[]).map((n: any) => ({
    phoneNumber: n.phone_number,
    features: n.features || [],
  }));
}

/**
 * Purchase a phone number and assign to connection
 */
export async function purchaseNumber(
  phoneNumber: string,
  connectionId: string,
): Promise<{ orderId: string; status: string }> {
  const client = getClient();
  const order = await client.numberOrders.create({
    phone_numbers: [{ phone_number: phoneNumber }],
    connection_id: connectionId,
  });

  return {
    orderId: (order.data as any).id || '',
    status: (order.data as any).status || 'pending',
  };
}

/**
 * Get call details from Telnyx
 */
export async function getCallDetails(callControlId: string): Promise<any> {
  const client = getClient();
  try {
    const response = await client.calls.retrieveStatus(callControlId);
    return response.data;
  } catch (error: any) {
    console.error('[Voice] Failed to fetch call:', error.message);
    return null;
  }
}

/**
 * Extract area code from a phone number
 */
export function extractAreaCode(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1, 4);
  }
  if (digits.length === 10) {
    return digits.substring(0, 3);
  }
  return digits.substring(0, 3);
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  if (digits.length === 10) {
    return '+1' + digits;
  }
  return phone.startsWith('+') ? phone : '+' + digits;
}

// =============================================================================
// Conference / Call Monitoring
// =============================================================================

/**
 * Create a conference from an existing call leg.
 * The call is automatically bridged into the conference.
 */
export async function createConference(
  callControlId: string,
  conferenceName: string,
): Promise<{ conferenceId: string }> {
  const client = getClient();
  const response = await client.conferences.create({
    call_control_id: callControlId,
    name: conferenceName,
    beep_enabled: 'never',
    start_conference_on_create: true,
  });
  return { conferenceId: response.data?.id as string };
}

/**
 * Dial a new outbound call to the supervisor's WebRTC credential,
 * then join it to the conference with a supervisor role.
 *
 * Flow: dial supervisor SIP → on answer webhook → join to conference
 * The join is done in the webhook handler (call.answered with clientState.source === 'monitor')
 */
export async function dialSupervisor(params: {
  to: string; // SIP URI for supervisor's WebRTC credential
  from: string;
  connectionId: string;
  webhookUrl: string;
  conferenceId: string;
  supervisorRole: 'monitor' | 'whisper' | 'barge';
  agentCallControlId: string;
  clientState?: Record<string, any>;
}): Promise<{ callControlId: string; callLegId: string }> {
  const client = getClient();
  const state = {
    source: 'monitor',
    conferenceId: params.conferenceId,
    supervisorRole: params.supervisorRole,
    agentCallControlId: params.agentCallControlId,
    ...params.clientState,
  };

  const response = await client.calls.dial({
    connection_id: params.connectionId,
    to: params.to,
    from: params.from,
    webhook_url: params.webhookUrl,
    webhook_url_method: 'POST',
    timeout_secs: 30,
    client_state: Buffer.from(JSON.stringify(state)).toString('base64'),
  });

  return {
    callControlId: response.data?.call_control_id as string,
    callLegId: response.data?.call_leg_id as string,
  };
}

/**
 * Join a call leg to a conference with a supervisor role.
 */
export async function joinConference(
  conferenceId: string,
  callControlId: string,
  supervisorRole: 'monitor' | 'whisper' | 'barge' | 'none' = 'none',
  whisperCallControlIds?: string[],
): Promise<void> {
  const client = getClient();
  const params: any = {
    call_control_id: callControlId,
    beep_enabled: 'never' as const,
  };
  if (supervisorRole !== 'none') {
    params.supervisor_role = supervisorRole;
  }
  if (supervisorRole === 'whisper' && whisperCallControlIds?.length) {
    params.whisper_call_control_ids = whisperCallControlIds;
  }
  await client.conferences.actions.join(conferenceId, params);
}

/**
 * Update supervisor role for a participant already in a conference.
 */
export async function updateSupervisorRole(
  conferenceId: string,
  callControlId: string,
  newRole: 'monitor' | 'whisper' | 'barge',
  whisperCallControlIds?: string[],
): Promise<void> {
  const client = getClient();
  const params: any = {
    call_control_id: callControlId,
    supervisor_role: newRole,
  };
  if (newRole === 'whisper' && whisperCallControlIds?.length) {
    params.whisper_call_control_ids = whisperCallControlIds;
  }
  await client.conferences.actions.update(conferenceId, params);
}

/**
 * Remove a participant from a conference (moves call back to parked state).
 */
export async function leaveConference(
  conferenceId: string,
  callControlId: string,
): Promise<void> {
  const client = getClient();
  await client.conferences.actions.leave(conferenceId, {
    call_control_id: callControlId,
    beep_enabled: 'never',
  });
}

/**
 * End a conference and hang up all participants.
 */
export async function endConference(conferenceId: string): Promise<void> {
  const client = getClient();
  await client.conferences.actions.endConference(conferenceId);
}

/**
 * Get conference details.
 */
export async function getConferenceDetails(conferenceId: string): Promise<any> {
  const client = getClient();
  try {
    const response = await client.conferences.retrieve(conferenceId);
    return response.data;
  } catch (error: any) {
    console.error('[Voice] Failed to fetch conference:', error.message);
    return null;
  }
}

/**
 * List conference participants.
 */
export async function getConferenceParticipants(conferenceId: string): Promise<any[]> {
  const client = getClient();
  try {
    const participants: any[] = [];
    for await (const p of client.conferences.listParticipants(conferenceId)) {
      participants.push(p);
    }
    return participants;
  } catch (error: any) {
    console.error('[Voice] Failed to list participants:', error.message);
    return [];
  }
}

export default {
  isVoiceAvailable,
  createAgentCredential,
  generateWebRTCToken,
  dialOutbound,
  transferToAgent,
  playbackStart,
  recordStart,
  speak,
  hangup,
  answerCall,
  validateWebhookSignature,
  searchAvailableNumbers,
  purchaseNumber,
  getCallDetails,
  extractAreaCode,
  formatPhoneNumber,
  createConference,
  dialSupervisor,
  joinConference,
  updateSupervisorRole,
  leaveConference,
  endConference,
  getConferenceDetails,
  getConferenceParticipants,
};
