/**
 * Real-time WebSocket hook for Executive Lead Distribution
 * Connects to /ws/gcf, subscribes to 'leads' channel, and receives
 * new website leads from the quoter in real-time.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketLeadEvent {
  type: 'new_website_lead';
  lead: any;
  timestamp: number;
}

interface UseWebSocketLeadsOptions {
  onNewLead?: (lead: any) => void;
  enabled?: boolean;
}

export function useWebSocketLeads({ onNewLead, enabled = true }: UseWebSocketLeadsOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);
  const onNewLeadRef = useRef(onNewLead);
  onNewLeadRef.current = onNewLead;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/gcf`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // Subscribe to leads channel
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['leads'],
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.channel === 'leads' && msg.data?.type === 'new_website_lead') {
            onNewLeadRef.current?.(msg.data.lead);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Retry after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { connected };
}
