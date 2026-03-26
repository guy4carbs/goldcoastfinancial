/**
 * AI Call Service — Retell AI Integration
 * Provider-agnostic interface for automated AI phone calls
 * Used in the post-close workflow to congratulate clients and walk them through portal setup
 */

// =============================================================================
// TYPES
// =============================================================================

export interface AiCallConfig {
  phoneNumber: string;
  clientFirstName: string;
  agentName: string;
  coverageType?: string;
  portalUrl?: string;
  maxDurationSeconds?: number;
}

export interface AiCallResult {
  success: boolean;
  callId?: string;
  status?: string;
  error?: string;
}

export interface AiCallStatusUpdate {
  callId: string;
  status: 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  duration?: number;
  transcript?: string;
}

// =============================================================================
// AVAILABILITY CHECK
// =============================================================================

export function isAiCallAvailable(): boolean {
  return !!(
    process.env.RETELL_API_KEY &&
    process.env.RETELL_FROM_NUMBER &&
    process.env.RETELL_WELCOME_AGENT_ID
  );
}

// =============================================================================
// INITIATE WELCOME CALL
// =============================================================================

export async function initiateWelcomeCall(config: AiCallConfig): Promise<AiCallResult> {
  const apiKey = process.env.RETELL_API_KEY;
  const fromNumber = process.env.RETELL_FROM_NUMBER;
  const agentId = process.env.RETELL_WELCOME_AGENT_ID;

  if (!apiKey || !fromNumber || !agentId) {
    console.warn('[AiCallService] Missing Retell AI configuration');
    return { success: false, error: 'AI call service not configured' };
  }

  const portalUrl = config.portalUrl || process.env.APP_URL || 'https://heritagels.org';

  try {
    const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number: fromNumber,
        to_number: config.phoneNumber,
        agent_id: agentId,
        retell_llm_dynamic_variables: {
          client_first_name: config.clientFirstName,
          agent_name: config.agentName,
          coverage_type: config.coverageType || 'life insurance',
          portal_url: `${portalUrl}/client/login`,
        },
        metadata: {
          source: 'post-close-workflow',
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[AiCallService] Retell API error:', response.status, errorBody);
      return { success: false, error: `Retell API error: ${response.status}` };
    }

    const data = await response.json();
    console.log('[AiCallService] Welcome call initiated:', data.call_id);

    return {
      success: true,
      callId: data.call_id,
      status: 'initiated',
    };
  } catch (error: any) {
    console.error('[AiCallService] Failed to initiate welcome call:', error.message);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// WEBHOOK PARSING
// =============================================================================

export function parseRetellWebhook(body: any): AiCallStatusUpdate | null {
  if (!body || !body.event) {
    return null;
  }

  const call = body.call || body.data?.call || body;

  const callId = call.call_id || body.call_id;
  if (!callId) {
    return null;
  }

  const eventMap: Record<string, AiCallStatusUpdate['status']> = {
    'call_started': 'in_progress',
    'call_ended': 'completed',
    'call_analyzed': 'completed',
    'call_failed': 'failed',
  };

  const status = eventMap[body.event];
  if (!status) {
    return null;
  }

  return {
    callId,
    status,
    duration: call.duration_ms ? Math.round(call.duration_ms / 1000) : undefined,
    transcript: call.transcript || undefined,
  };
}

// =============================================================================
// CALL STATUS CHECK
// =============================================================================

export async function getCallStatus(callId: string): Promise<AiCallStatusUpdate | null> {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    const statusMap: Record<string, AiCallStatusUpdate['status']> = {
      'registered': 'initiated',
      'ongoing': 'in_progress',
      'ended': 'completed',
      'error': 'failed',
    };

    return {
      callId: data.call_id,
      status: statusMap[data.call_status] || 'initiated',
      duration: data.duration_ms ? Math.round(data.duration_ms / 1000) : undefined,
      transcript: data.transcript || undefined,
    };
  } catch (error: any) {
    console.error('[AiCallService] Failed to get call status:', error.message);
    return null;
  }
}
