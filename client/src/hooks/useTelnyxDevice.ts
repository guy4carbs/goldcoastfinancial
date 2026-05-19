import { useState, useEffect, useRef, useCallback } from 'react';
import { TelnyxRTC } from '@telnyx/webrtc';

export type DeviceStatus = 'initializing' | 'ready' | 'error' | 'offline';
export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'open' | 'closed' | 'incoming';

export interface UseTelnyxDeviceReturn {
  deviceStatus: DeviceStatus;
  callStatus: CallStatus;
  isMuted: boolean;
  callDuration: number;
  incomingFrom: string | null;
  error: string | null;
  isBatchMode: boolean;
  makeCall: (to: string) => Promise<void>;
  makeBatchCalls: (phones: string[]) => void;
  hangUp: () => void;
  hangUpBatch: () => void;
  toggleMute: () => void;
  sendDtmf: (digit: string) => void;
  acceptIncoming: () => void;
  rejectIncoming: () => void;
}

/**
 * Server token errors come back with `{ error, code, retryable }`. We surface
 * the structured shape so the dialer UI can show useful messaging — "Voice
 * not configured" / "Voice unavailable" / "Try again" — instead of one
 * generic "Failed to generate token" line that gives users nothing to act on.
 */
export class TelnyxTokenError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = "TelnyxTokenError";
  }
}

// Token endpoint URL history (since the original /api/calls/token began
// returning CF HTML 502s):
//   1.0.45 — /api/calls/token (legacy)
//   1.0.63 — /api/voice/token (also 502'd at CF edge — Railway never saw
//            the request per missing [REQ] log line)
//   1.0.64 — /api/realtime/wrtc-auth (generic path, no "token"/"voice"/"call"
//            words that might match a CF WAF heuristic)
//
// Same server handler, same auth + timeout chain. If even this URL 502s,
// the CF rule is broader than URL patterns and the fix moves out of code
// into the Cloudflare dashboard (Security → Events).
async function fetchToken(): Promise<{ token: string; sipUsername: string; callerId: string }> {
  // 1.0.65 — switched from GET → POST. CF was 502'ing all three previous URLs
  // (calls/token, voice/token, realtime/wrtc-auth) at its edge with no [REQ]
  // log on origin. After ruling out URL-pattern matching as the cause, the
  // remaining likely trigger is CF managed-rule heuristics that treat GET
  // XHRs-with-credentials as credential-leak suspects. POST has a different
  // default rule profile. Server accepts both methods so a stale-bundle
  // client doesn't break.
  const res = await fetch('/api/realtime/wrtc-auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    // Try JSON first (our structured response). If that fails (CF/Railway
    // returned an HTML page on a gateway 502), fall back to peeking at the
    // text body and the Server header so we surface a meaningful code that
    // actually tells us what happened. Previously this just yielded
    // `code=UNKNOWN` and we had no idea whether the issue was our handler,
    // our middleware, the gateway, or the proxy in front of it.
    const rawText = await res.text().catch(() => "");
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      /* not JSON */
    }

    const serverHeader = res.headers.get("server") ?? "";
    const cfRay = res.headers.get("cf-ray") ?? "";
    let inferredCode: string;
    if (parsed?.code) {
      inferredCode = parsed.code;
    } else if (serverHeader.toLowerCase().includes("cloudflare") || cfRay) {
      inferredCode = "GATEWAY_HTML_502_FROM_CLOUDFLARE";
    } else if (rawText.includes("<html") || rawText.includes("<!DOCTYPE")) {
      inferredCode = "GATEWAY_HTML_RESPONSE";
    } else if (rawText.length === 0) {
      inferredCode = "EMPTY_RESPONSE_BODY";
    } else {
      inferredCode = "UNKNOWN";
    }

    console.error(
      `[fetchToken] non-OK status=${res.status} server="${serverHeader}" cf-ray="${cfRay}" ` +
        `code=${inferredCode} body[0..200]="${rawText.slice(0, 200).replace(/\s+/g, " ")}"`,
    );

    throw new TelnyxTokenError(
      parsed?.error || `Token fetch failed: ${res.status}`,
      inferredCode,
      parsed?.retryable === true,
      res.status,
    );
  }
  return res.json();
}

/** Format a phone number to E.164 (adds +1 for US numbers) */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (digits.length === 10) return '+1' + digits;
  return phone.startsWith('+') ? phone : '+' + digits;
}

/** Log a call to the server for stats/history tracking */
async function logCallToServer(data: Record<string, any>): Promise<string | null> {
  try {
    const res = await fetch('/api/calls/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const record = await res.json();
      return record.id || null;
    }
  } catch (err) {
    console.warn('[TelnyxDevice] Failed to log call:', err);
  }
  return null;
}

/** Register a call with the server, including callControlId for recording */
async function registerCallWithServer(data: Record<string, any>): Promise<string | null> {
  try {
    const res = await fetch('/api/calls/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const record = await res.json();
      return record.id || null;
    }
  } catch (err) {
    console.warn('[TelnyxDevice] Failed to register call:', err);
  }
  return null;
}

/**
 * Ensure the remote audio stream from a call is playing through an <audio> element.
 */
function attachRemoteAudio(call: any, audioEl: HTMLAudioElement) {
  const remoteStream = call.remoteStream || call.options?.remoteStream;
  if (remoteStream) {
    const tracks = remoteStream.getAudioTracks();
    console.log('[TelnyxDevice] Remote stream found:', tracks.length, 'audio track(s)');
    audioEl.srcObject = remoteStream;
    audioEl.play().catch(err => console.warn('[TelnyxDevice] Audio play() failed:', err));
    return;
  }

  const pc = call.peer?.instance || call.peer || call.options?.peer?.instance;
  if (pc && pc.getReceivers) {
    const receivers = pc.getReceivers();
    const audioTracks = receivers
      .filter((r: RTCRtpReceiver) => r.track && r.track.kind === 'audio')
      .map((r: RTCRtpReceiver) => r.track);
    if (audioTracks.length > 0) {
      console.log('[TelnyxDevice] Attaching', audioTracks.length, 'track(s) from PeerConnection');
      const stream = new MediaStream(audioTracks);
      audioEl.srcObject = stream;
      audioEl.play().catch(err => console.warn('[TelnyxDevice] Audio play() failed:', err));
      return;
    }
  }

  console.warn('[TelnyxDevice] No remote stream found yet — will retry on next notification');
}

export function useTelnyxDevice(): UseTelnyxDeviceReturn {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>('initializing');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const clientRef = useRef<TelnyxRTC | null>(null);
  const activeCallRef = useRef<any>(null);
  const incomingCallRef = useRef<any>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStartRef = useRef<number>(0);
  const callerIdRef = useRef<string>('');
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callPhoneRef = useRef<string>('');
  const callRecordIdRef = useRef<string | null>(null);
  const callDirectionRef = useRef<'outbound' | 'inbound'>('outbound');

  // Batch mode refs — for simultaneous dialing (power dialer)
  const batchModeRef = useRef(false);
  const batchCallsRef = useRef<any[]>([]);

  // Duration timer
  const startDurationTimer = useCallback(() => {
    callStartRef.current = Date.now();
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Reset call state and log final duration to server
  const resetCallState = useCallback(() => {
    const duration = callStartRef.current > 0
      ? Math.floor((Date.now() - callStartRef.current) / 1000)
      : 0;

    if (callRecordIdRef.current) {
      logCallToServer({
        callRecordingId: callRecordIdRef.current,
        duration,
        disposition: duration > 0 ? 'completed' : 'no_answer',
      });
    } else if (callPhoneRef.current) {
      logCallToServer({
        phoneNumber: callPhoneRef.current,
        direction: callDirectionRef.current,
        duration: 0,
        disposition: 'no_answer',
      });
    }

    callRecordIdRef.current = null;
    callPhoneRef.current = '';
    setCallStatus('idle');
    stopDurationTimer();
    activeCallRef.current = null;
    setIsMuted(false);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, [stopDurationTimer]);

  // Initialize Telnyx client
  useEffect(() => {
    let mounted = true;

    const audioEl = document.createElement('audio');
    audioEl.id = 'telnyx-remote-audio';
    audioEl.autoplay = true;
    audioEl.setAttribute('playsinline', '');
    document.body.appendChild(audioEl);
    remoteAudioRef.current = audioEl;

    async function initClient() {
      try {
        const { token, callerId } = await fetchToken();
        if (!mounted) return;
        callerIdRef.current = callerId;

        const client = new TelnyxRTC({
          login_token: token,
        });

        client.on('telnyx.ready', () => {
          if (mounted) {
            setDeviceStatus('ready');
            setError(null);
            console.log('[TelnyxDevice] Ready');
          }
        });

        client.on('telnyx.error', (err: any) => {
          console.error('[TelnyxDevice] Error:', err);
          if (mounted) {
            setError(err?.message || 'Device error');
            setDeviceStatus('error');
          }
        });

        client.on('telnyx.socket.close', () => {
          if (mounted) {
            setDeviceStatus('offline');
          }
        });

        client.on('telnyx.notification', (notification: any) => {
          if (!mounted) return;

          if (notification.type === 'userMediaError') {
            console.error('[TelnyxDevice] Microphone access error:', notification.error);
            setError('Microphone access denied. Please allow microphone access and try again.');
            setCallStatus('idle');
            batchModeRef.current = false;
            batchCallsRef.current = [];
            setIsBatchMode(false);
            return;
          }

          const call = notification.call;
          if (!call) return;

          const isBatch = batchModeRef.current;
          const isBatchCall = isBatch && batchCallsRef.current.includes(call);

          console.log('[TelnyxDevice] Notification:', notification.type, 'state:', call.state, 'direction:', call.direction, isBatch ? '(batch)' : '');

          switch (call.state) {
            case 'new':
              if (call.direction === 'inbound') {
                incomingCallRef.current = call;
                setIncomingFrom(call.options?.remoteCallerNumber || 'Unknown');
                setCallStatus('incoming');
              }
              break;

            case 'trying':
            case 'requesting':
              if (!isBatch) {
                setCallStatus('connecting');
              }
              break;

            case 'early':
            case 'ringing':
              setCallStatus('ringing');
              // Only attach audio for non-batch or the first ringing call
              if (!isBatch && remoteAudioRef.current) {
                attachRemoteAudio(call, remoteAudioRef.current);
              }
              break;

            case 'active':
              if (isBatchCall) {
                // This call won the race — hang up all others in the batch
                const dest = call.options?.destinationNumber || '';
                console.log('[TelnyxDevice] Batch winner:', dest);
                const losers = batchCallsRef.current.filter(c => c !== call);
                losers.forEach(c => {
                  try { c.hangup(); } catch (_) {}
                });
                batchCallsRef.current = [];
                batchModeRef.current = false;
                setIsBatchMode(false);
                // Set the winner's phone for call logging
                callPhoneRef.current = dest;
                callRecordIdRef.current = null;
              }

              setCallStatus('open');
              activeCallRef.current = call;
              if (!durationIntervalRef.current) {
                startDurationTimer();
              }
              if (remoteAudioRef.current) {
                attachRemoteAudio(call, remoteAudioRef.current);
              }

              // Register call with server (includes callControlId for recording)
              if (!callRecordIdRef.current && callPhoneRef.current) {
                const callControlId = (call as any).telnyxIDs?.telnyxCallControlId || call.id || null;
                registerCallWithServer({
                  phoneNumber: callPhoneRef.current,
                  direction: callDirectionRef.current,
                  callControlId,
                }).then(id => {
                  callRecordIdRef.current = id;
                });
              }
              break;

            case 'hangup':
            case 'destroy':
              if (incomingCallRef.current === call) {
                incomingCallRef.current = null;
                setIncomingFrom(null);
              }

              if (isBatchCall && call !== activeCallRef.current) {
                // A non-winning batch call ended — remove from batch
                batchCallsRef.current = batchCallsRef.current.filter(c => c !== call);
                // If all batch calls ended with nobody answering
                if (batchCallsRef.current.length === 0 && batchModeRef.current) {
                  batchModeRef.current = false;
                  setIsBatchMode(false);
                  setCallStatus('idle');
                  activeCallRef.current = null;
                }
                break; // Don't resetCallState for non-winning batch calls
              }

              // Normal call ended (or the batch winner ended)
              resetCallState();
              break;
          }
        });

        await client.connect();
        clientRef.current = client;
      } catch (initError: any) {
        // Structured handling for the new server response shape (1.0.58+).
        // Pre-1.0.58 server returned generic 500 "Failed to generate token"
        // with no code — keep the fallback for the old shape so an in-flight
        // bundle still shows something useful.
        if (initError instanceof TelnyxTokenError) {
          const message = (() => {
            switch (initError.code) {
              case "VOICE_NOT_CONFIGURED":
                return "Voice service isn't configured on this environment yet.";
              case "VOICE_UPSTREAM_AUTH":
                return "Voice provider rejected our credentials. Please contact support.";
              case "VOICE_CREDENTIAL_STALE":
                return "Voice credential expired — refreshing.";
              case "VOICE_UPSTREAM_UNAVAILABLE":
                return "Voice provider is temporarily unavailable. Try again in a moment.";
              default:
                return initError.message || "Failed to initialize phone system";
            }
          })();
          console.error(
            `[TelnyxDevice] Init failed: code=${initError.code} http=${initError.httpStatus} retryable=${initError.retryable}`,
          );
          if (mounted) {
            setError(message);
            setDeviceStatus("error");
          }
        } else {
          console.error("[TelnyxDevice] Init failed:", initError);
          if (mounted) {
            setError(initError.message || "Failed to initialize phone system");
            setDeviceStatus("error");
          }
        }
      }
    }

    initClient();

    return () => {
      mounted = false;
      stopDurationTimer();
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
        remoteAudioRef.current.remove();
        remoteAudioRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const makeCall = useCallback(async (to: string) => {
    const client = clientRef.current;
    if (!client) {
      setError('Phone system not ready');
      return;
    }

    try {
      setError(null);
      setCallStatus('connecting');

      const dest = toE164(to);
      callPhoneRef.current = dest;
      callDirectionRef.current = 'outbound';
      callRecordIdRef.current = null;

      console.log('[TelnyxDevice] Dialing', dest, 'with callerId', callerIdRef.current);

      const call = client.newCall({
        destinationNumber: dest,
        callerNumber: callerIdRef.current,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      activeCallRef.current = call;
    } catch (callError: any) {
      console.error('[TelnyxDevice] Connect failed:', callError);
      setError(callError.message || 'Failed to connect call');
      setCallStatus('idle');
    }
  }, []);

  /** Dial multiple numbers simultaneously. First to answer wins; others are dropped. */
  const makeBatchCalls = useCallback((phones: string[]) => {
    const client = clientRef.current;
    if (!client) {
      setError('Phone system not ready');
      return;
    }

    setError(null);
    setCallStatus('connecting');
    batchModeRef.current = true;
    batchCallsRef.current = [];
    setIsBatchMode(true);
    callDirectionRef.current = 'outbound';

    for (const phone of phones) {
      try {
        const dest = toE164(phone);
        console.log('[TelnyxDevice] Batch dialing', dest);
        const call = client.newCall({
          destinationNumber: dest,
          callerNumber: callerIdRef.current,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        batchCallsRef.current.push(call);
      } catch (err: any) {
        console.error('[TelnyxDevice] Batch call failed for', phone, err);
      }
    }

    if (batchCallsRef.current.length === 0) {
      batchModeRef.current = false;
      setIsBatchMode(false);
      setCallStatus('idle');
      setError('Failed to start any calls');
    }
  }, []);

  const hangUp = useCallback(() => {
    if (activeCallRef.current) {
      activeCallRef.current.hangup();
    }
  }, []);

  /** Hang up all calls in the current batch plus any active call. */
  const hangUpBatch = useCallback(() => {
    // Hang up all batch calls
    for (const call of batchCallsRef.current) {
      try { call.hangup(); } catch (_) {}
    }
    // Also hang up active call if set
    if (activeCallRef.current) {
      try { activeCallRef.current.hangup(); } catch (_) {}
    }
    // Let notification handlers handle cleanup
  }, []);

  const toggleMute = useCallback(() => {
    if (activeCallRef.current) {
      if (isMuted) {
        activeCallRef.current.unmuteAudio();
      } else {
        activeCallRef.current.muteAudio();
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const sendDtmf = useCallback((digit: string) => {
    if (activeCallRef.current) {
      activeCallRef.current.dtmf(digit);
    }
  }, []);

  const acceptIncoming = useCallback(() => {
    if (incomingCallRef.current) {
      const callerNumber = incomingCallRef.current.options?.remoteCallerNumber || 'Unknown';
      callPhoneRef.current = callerNumber;
      callDirectionRef.current = 'inbound';
      callRecordIdRef.current = null;

      incomingCallRef.current.answer({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      activeCallRef.current = incomingCallRef.current;
      incomingCallRef.current = null;
      setIncomingFrom(null);
      setCallStatus('open');
      startDurationTimer();
    }
  }, [startDurationTimer]);

  const rejectIncoming = useCallback(() => {
    if (incomingCallRef.current) {
      incomingCallRef.current.hangup();
      incomingCallRef.current = null;
      setIncomingFrom(null);
      setCallStatus('idle');
    }
  }, []);

  return {
    deviceStatus,
    callStatus,
    isMuted,
    callDuration,
    incomingFrom,
    error,
    isBatchMode,
    makeCall,
    makeBatchCalls,
    hangUp,
    hangUpBatch,
    toggleMute,
    sendDtmf,
    acceptIncoming,
    rejectIncoming,
  };
}
