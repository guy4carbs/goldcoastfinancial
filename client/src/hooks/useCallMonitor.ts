/**
 * useCallMonitor — Supervisor call monitoring hook
 * Enables managers to listen in (monitor), whisper, or barge into live agent calls
 * Uses a separate TelnyxRTC instance from the agent dialer
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { TelnyxRTC } from '@telnyx/webrtc';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type MonitorRole = 'monitor' | 'whisper' | 'barge';
export type MonitorStatus = 'idle' | 'connecting' | 'active' | 'error';

export interface ActiveCallInfo {
  id: string;
  agentUserId: string;
  agentName: string;
  callControlId: string;
  direction: string;
  destinationNumber: string | null;
  contactName: string | null;
  status: string;
  startedAt: string;
  answeredAt: string | null;
}

export interface UseCallMonitorReturn {
  // State
  monitorStatus: MonitorStatus;
  currentRole: MonitorRole;
  monitoredCallId: string | null;
  monitoredAgentName: string | null;
  error: string | null;

  // Active calls from API
  activeCalls: ActiveCallInfo[];
  isLoadingCalls: boolean;
  refetchCalls: () => void;

  // Actions
  startMonitoring: (activeCallId: string, role?: MonitorRole) => Promise<void>;
  stopMonitoring: () => Promise<void>;
  switchRole: (newRole: MonitorRole) => Promise<void>;
}

export function useCallMonitor(): UseCallMonitorReturn {
  const [monitorStatus, setMonitorStatus] = useState<MonitorStatus>('idle');
  const [currentRole, setCurrentRole] = useState<MonitorRole>('monitor');
  const [monitoredCallId, setMonitoredCallId] = useState<string | null>(null);
  const [monitoredAgentName, setMonitoredAgentName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monitorSessionIdRef = useRef<string | null>(null);
  const telnyxClientRef = useRef<TelnyxRTC | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  // Fetch active calls
  const {
    data: activeCalls = [],
    isLoading: isLoadingCalls,
    refetch: refetchCalls,
  } = useQuery<ActiveCallInfo[]>({
    queryKey: ['/api/monitor/active-calls'],
    refetchInterval: 10000, // Poll every 10s for active calls
    staleTime: 5000,
  });

  // Create hidden audio element on mount
  useEffect(() => {
    const audioEl = document.createElement('audio');
    audioEl.id = 'monitor-remote-audio';
    audioEl.autoplay = true;
    audioEl.setAttribute('playsinline', '');
    document.body.appendChild(audioEl);
    audioRef.current = audioEl;

    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
        audioRef.current.remove();
        audioRef.current = null;
      }
      if (telnyxClientRef.current) {
        telnyxClientRef.current.disconnect();
        telnyxClientRef.current = null;
      }
    };
  }, []);

  /** Attach remote audio stream from a call to the audio element */
  const attachAudio = useCallback((call: any) => {
    if (!audioRef.current) return;

    const remoteStream = call.remoteStream || call.options?.remoteStream;
    if (remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(err =>
        console.warn('[CallMonitor] Audio play() failed:', err),
      );
      return;
    }

    const pc = call.peer?.instance || call.peer || call.options?.peer?.instance;
    if (pc && pc.getReceivers) {
      const audioTracks = pc
        .getReceivers()
        .filter((r: RTCRtpReceiver) => r.track && r.track.kind === 'audio')
        .map((r: RTCRtpReceiver) => r.track);
      if (audioTracks.length > 0) {
        const stream = new MediaStream(audioTracks);
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch(err =>
          console.warn('[CallMonitor] Audio play() failed:', err),
        );
      }
    }
  }, []);

  /** Start monitoring a live call */
  const startMonitoring = useCallback(
    async (activeCallId: string, role: MonitorRole = 'monitor') => {
      try {
        setError(null);
        setMonitorStatus('connecting');

        // Call the monitor start API
        const res = await apiRequest('POST', '/api/monitor/start', {
          activeCallId,
          role,
        });

        const data = await res.json();
        monitorSessionIdRef.current = data.monitorSessionId;
        setCurrentRole(role);
        setMonitoredCallId(activeCallId);
        setMonitoredAgentName(
          activeCalls.find((c) => c.id === activeCallId)?.agentName || null,
        );

        // Initialize TelnyxRTC with the supervisor token
        const webrtcToken = data.webrtcToken;
        if (!webrtcToken) {
          throw new Error('No WebRTC token received');
        }

        const client = new TelnyxRTC({
          login_token: webrtcToken,
        });

        client.on('telnyx.ready', () => {
          console.log('[CallMonitor] WebRTC client ready, waiting for incoming call...');
        });

        client.on('telnyx.error', (err: any) => {
          console.error('[CallMonitor] WebRTC error:', err);
          setError(err?.message || 'WebRTC connection error');
          setMonitorStatus('error');
        });

        client.on('telnyx.notification', (notification: any) => {
          const call = notification.call;
          if (!call) return;

          console.log('[CallMonitor] Notification:', notification.type, 'state:', call.state);

          switch (call.state) {
            case 'new':
              // Incoming call from the conference — auto-answer
              if (call.direction === 'inbound') {
                console.log('[CallMonitor] Auto-answering incoming monitor call');
                call.answer({
                  audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                  },
                  video: false,
                });
              }
              break;

            case 'active':
              setMonitorStatus('active');
              attachAudio(call);
              console.log('[CallMonitor] Monitoring active — listening');
              break;

            case 'hangup':
            case 'destroy':
              console.log('[CallMonitor] Monitor call ended');
              setMonitorStatus('idle');
              setMonitoredCallId(null);
              setMonitoredAgentName(null);
              monitorSessionIdRef.current = null;
              if (audioRef.current) {
                audioRef.current.srcObject = null;
              }
              break;
          }
        });

        await client.connect();
        telnyxClientRef.current = client;
      } catch (err: any) {
        console.error('[CallMonitor] Start monitoring failed:', err);
        setError(err.message || 'Failed to start monitoring');
        setMonitorStatus('error');
      }
    },
    [activeCalls, attachAudio],
  );

  /** Stop monitoring */
  const stopMonitoring = useCallback(async () => {
    try {
      if (monitorSessionIdRef.current) {
        await apiRequest('POST', '/api/monitor/stop', {
          monitorSessionId: monitorSessionIdRef.current,
        });
      }
    } catch (err: any) {
      console.warn('[CallMonitor] Stop API call failed:', err.message);
    }

    // Clean up WebRTC
    if (telnyxClientRef.current) {
      telnyxClientRef.current.disconnect();
      telnyxClientRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    monitorSessionIdRef.current = null;
    setMonitorStatus('idle');
    setMonitoredCallId(null);
    setMonitoredAgentName(null);
    setCurrentRole('monitor');
    setError(null);

    // Refresh active calls list
    queryClient.invalidateQueries({ queryKey: ['/api/monitor/active-calls'] });
  }, [queryClient]);

  /** Switch between monitor/whisper/barge */
  const switchRole = useCallback(
    async (newRole: MonitorRole) => {
      if (!monitorSessionIdRef.current) return;

      try {
        await apiRequest('POST', '/api/monitor/switch-role', {
          monitorSessionId: monitorSessionIdRef.current,
          newRole,
        });
        setCurrentRole(newRole);
      } catch (err: any) {
        console.error('[CallMonitor] Switch role failed:', err);
        setError(err.message || 'Failed to switch role');
      }
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitorSessionIdRef.current) {
        // Fire-and-forget cleanup
        apiRequest('POST', '/api/monitor/stop', {
          monitorSessionId: monitorSessionIdRef.current,
        }).catch(() => {});
      }
      if (telnyxClientRef.current) {
        telnyxClientRef.current.disconnect();
      }
    };
  }, []);

  return {
    monitorStatus,
    currentRole,
    monitoredCallId,
    monitoredAgentName,
    error,
    activeCalls,
    isLoadingCalls,
    refetchCalls,
    startMonitoring,
    stopMonitoring,
    switchRole,
  };
}
